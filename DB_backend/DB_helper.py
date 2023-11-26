#######################################################################################################
# Name: DB_helper class
# Purpose: Perform all kinds of searching operation through the database using Mysql
# Input:
# Output:
# Developed on: 11/24/2023
# Modified by: DrCAO
# Change log:
#######################################################################################################

import mysql.connector
from mysql.connector import errorcode
import sys
import json
import datetime
from datetime import timedelta

import math
# we have one bot database for public bot only
# user name: AIWeb3USER
# pass:      aiweb3dao!
# database:  AIWeb3DB

class DB_helper:
    def __init__(self, db_config = None, userName = None, passWord = None, dataBase = None, initializeTable = False):
        '''
        Upon initialization, the DB_init class will connect to database
        You need to either set up db_config or userName and passWord
        '''
        if db_config is not None:
            ## Load configuration
            con_file = open(db_config)
            config = json.load(con_file)
            con_file.close()
            try:
                self.userName = config['user']
                self.passWord = config['pass']
                if "database" not in config:
                    self.dataBase = "AIWeb3DB"
                else:
                    self.dataBase = config['database']

            except:
                self.errorMessage("Please set up user and pass in the configuration file "+db_config+", otherwise, we cannot connect to the DB")
        else:
            if userName is None or passWord is None:
                self.errorMessage("If you don't provide the configuration file db_config, you must set up userName and passWord!")
            else:
                self.userName = userName
                self.passWord = passWord
                self.dataBase = dataBase

        if initializeTable == True:
            #print("Warning, will drop the tables now")  we don't want to drop the table
            #self._dropAllTables()     # we will drop the table first and then do the rest, be careful here
            # Create a user profile table for user address and twitter, discord handle if possible, just in case we need it later on
            sql_command = "CREATE TABLE IF NOT EXISTS userProfile(id INT NOT NULL AUTO_INCREMENT primary key, metamaskAddress VARCHAR(255), substrateAddress VARCHAR(255), twitterHandle VARCHAR(255), discordHandle VARCHAR(255), otherInfo TEXT,  date_added DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);"
            self.executeSQL(sql_command)

            # Create the NFT table, the NFTstatusID would be -1 if nobody claims it, otherwise, it should be the ID of the user in the userProfile
            sql_command = "CREATE TABLE IF NOT EXISTS NFTCodeTable(id INT NOT NULL AUTO_INCREMENT primary key, NFTCODE VARCHAR(66), NFTstatusID INT,  date_added DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);"
            self.executeSQL(sql_command)  

            # Create the task table 
            sql_command = "CREATE TABLE IF NOT EXISTS taskTable(taskID INT NOT NULL AUTO_INCREMENT primary key, userID INT, features JSON , imgStatus INT, image_data LONGBLOB, date_added DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);"
            #print(sql_command)
            self.executeSQL(sql_command)          


    def executeSQL(self, query,params=None):
        try:
            self.cnx = mysql.connector.connect(user=self.userName, password=self.passWord, host='127.0.0.1', database=self.dataBase)
            cursor = self.cnx.cursor()
            if params == None:
                cursor.execute(query)
            else:
                cursor.execute(query, params)
            #print("Now execute the query " + query)
            try:
                values = cursor.fetchall()
            except:
                values = None
            self.cnx.commit()      # this is important, otherwise you cannot invert the record
            #print("done! nothing happened?")
            cursor.close()
            self.cnx.close()
            return values
        except mysql.connector.Error as err:
            if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
                self.errorMessage("Something is wrong with your user name or password")
            elif err.errno == errorcode.ER_BAD_DB_ERROR:
                self.errorMessage("Database does not exist")
            else:
                self.errorMessage(err)
        except mysql.connector.Error as err:
            logging.error(err)
    
    def addNFTcode(self, NFTCODE, UserID = -1):
        time_stamp = datetime.datetime.now()
        try:
            mysqlC = 'SELECT NFTCODE FROM NFTCodeTable where NFTCODE =' +"\""  + str(NFTCODE) + "\";"
            #print(mysqlC)
            result = self.executeSQL(mysqlC)
        except:
            print("something is wrong searching the poap ")
            return None

        #print(result)
        if len(result) > 0:
            # we already added it
            #print("We have already added this name and code, skip")
            return False 
        

        try:
            mysqlC = 'INSERT INTO NFTCodeTable(NFTCODE, NFTstatusID) VALUES (\"' + str(NFTCODE)  + "\", \"" + str(UserID)  + "\");"
            #print(mysqlC)
            self.executeSQL(mysqlC)
        except:
            print("something is wrong adding the nft code to the table ")
            return None
        
        return True 
    
    def searchETHAddress(self, ETHAddress):
        ETHAddress = ETHAddress.lower() 
        try:
            mysqlC = 'SELECT * FROM userProfile where metamaskAddress =' +"\""  + str(ETHAddress) + "\";"
            #print(mysqlC)
            result = self.executeSQL(mysqlC)
        except:
            print("something is wrong searching the ETH address ")
            return None
        
        if len(result) < 1:
            return False 
        return result
    
    def createuserProfile(self, ETHAddr, subAddr, twitterHandle, discordHandle, otherInfo):
        ETHAddr = ETHAddr.lower()
        subAddr = subAddr.lower()

        try:
            mysqlC = 'INSERT INTO userProfile(metamaskAddress, substrateAddress, twitterHandle, discordHandle, otherInfo) VALUES (\"' + str(ETHAddr)  + "\", \"" + str(subAddr) + "\", \"" + str(twitterHandle) + "\", \"" + str(discordHandle) + "\", \"" + str(otherInfo)  + "\");"
            #print(mysqlC)
            self.executeSQL(mysqlC)
        except:
            print("something is wrong adding the user profile ")
            return None 
        return self.searchETHAddress(ETHAddr)   # return the searching result 
    
    def claimNFTCodeDB(self, userID, nftcode):
        try:
            mysqlC = 'SELECT * FROM userProfile where id =' +"\""  + str(userID) + "\";"
            #print(mysqlC)
            result = self.executeSQL(mysqlC)
        except:
            print("something is wrong searching the id ")
            return None
        if len(result) < 1:
            return False 
        
        try:
            mysqlC = 'SELECT * FROM NFTCodeTable where NFTCODE =' +"\""  + str(nftcode) + "\" AND NFTstatusID = \"-1\"" + ";"
            #print(mysqlC)
            result = self.executeSQL(mysqlC)
        except:
            print("something is wrong searching the id ")
            return None
        
        if len(result) < 1:
            return None    # not valid code 
        
        #print("now update the database")
        
        # now update the database 
        try:
            mysqlC = 'UPDATE NFTCodeTable SET NFTstatusID = \"' + str(userID)  + "\" where NFTCODE = \"" + str(nftcode)  + "\";"
            #print(mysqlC)
            self.executeSQL(mysqlC)
        except:
            print("something is wrong adding the user profile ")
            return None         
        
        return True 
    
    def checkIDNFTcode(self, NFTCODE):
        try:
            mysqlC = 'SELECT NFTstatusID FROM NFTCodeTable where NFTCODE =' +"\""  + str(NFTCODE) + "\";"
            #print(mysqlC)
            result = self.executeSQL(mysqlC)
        except:
            print("something is wrong searching the id ")
            return None    
        
        if len(result) <1 :
            return None 
        
        return result[0][0]    
    
    def createIMGTask(self, userID, features):
        # userID INT, features TEXT, imgStatus INT, image_data LONGBLOB
        imgStatus = 0   # new task, no image 
        image_data = "null"      
        try:
            mysqlC = 'INSERT INTO taskTable(userID, features,imgStatus, image_data) VALUES ('+ str(userID)+",\'" + str(features) + "\', \"" + str(imgStatus) + "\",\"" + str(image_data)  + "\"); "
            #print(mysqlC)
            # SELECT LAST_INSERT_ID();
            result = self.executeSQL(mysqlC)
        except:
            print("something is wrong when creating image generation task " + mysqlC)
            return None  
        return True 
    
    def get2beDoneTaskList(self):
        # return all the tasks that need to be done 
        try:
            mysqlC = 'SELECT taskID, userID, features from taskTable where imgStatus =' +"\""  + str("0") + "\";"
            #print(mysqlC)
            result = self.executeSQL(mysqlC)
        except:
            print("something is wrong searching the id ")
            return None    
        
        return result
    
    def validTaskID(self, taskID):
        try:
            mysqlC = 'SELECT * from taskTable where taskID =' +"\""  + str(taskID) + "\";"
            #print(mysqlC)
            result = self.executeSQL(mysqlC)
        except:
            print("something is wrong searching the id ")
            return None    
        if len(result) < 1:
            return False 
        else:
            return True       
    
    def submitoneTask(self, taskID, image_data):
        try:
            update_params = ("1", image_data, taskID)
            mysqlC = f'UPDATE taskTable SET imgStatus = %s , image_data = %s where taskID = %s'
            self.executeSQL(mysqlC,update_params)
        except:
            print("something is wrong updating the task ")
            return None          
        return True 
    
    def getIMGfromTaskID(self, taskID):
        try:
            mysqlC = 'SELECT image_data from taskTable where taskID =' +"\""  + str(taskID) + "\";"
            #print(mysqlC)
            result = self.executeSQL(mysqlC)
        except:
            print("something is wrong searching the id ")
            return None  
        if len(result)  < 1:
            return False 
        return result[0][0]





        

