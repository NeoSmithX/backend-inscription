from DB_helper import DB_helper
import os
import sys 

import json

class AIWeb3:
    def __init__(self, database_path=None):
        # Initialize by connecting to the database using DB_helper
        #self.db = DB_helper(userName = 'AIWeb3USER', passWord = 'aiweb3dao!', dataBase = 'AIWeb3DB', initializeTable = True)

        try:
            self.db = DB_helper(userName = 'AIWeb3USER', passWord = 'aiweb3dao!', dataBase = 'AIWeb3DB', initializeTable = True)  # connect to the database
        except:
            print("Something is wrong connecting to the database, please double check here! ")
            sys.exit(0)
    
    def _is_valid_json(self,json_string):
        try:
            json.loads(json_string)
            return True
        except json.JSONDecodeError:
            return False

    def loadNFTCode(self, nftcodePath):
        """
        The NFT codes should be saved in a txt file, each column is one NFT code, and this function will load it into the database 
        """
        if True:
            fh = open(nftcodePath,"r")
            for line in fh:
                mycode = line.strip() 
                if len(mycode)<2:
                    print("skip this code, not valid")
                    continue 
                result = self.db.addNFTcode(NFTCODE = mycode)
                if result == None:
                    print("something is wrong when add the nft code, check here")
                elif result == False:
                    print("it seems this NFT code had been added already, skip")
                else:
                    print("one NFT code added " + str(mycode))
            fh.close()
        else:
            print("error loading the nft file, please make sure the file path is correct! " + str(nftcodePath))
    
    def ETHAddr2ID(self, ETHAddress):
        """
        Search the ETHAddress and return the ID for the address,
        False will be returned if the address is not existing in the database 
        """
        result = self.db.searchETHAddress(ETHAddress)
        if result == None or result == False:
            return False 
        return result[0][0]

    def subAddr2ID(self, SubAddress):
        """
        Search the SubAddress and return the ID for the address,
        False will be returned if the address is not existing in the database 
        """
        result = self.db.searchSUBAddress(SubAddress)
        if result == None or result == False:
            return False 
        return result[0][0]

    def createProfile(self, ETHAddr="null", subAddr= "null", twitterHandle= "null", discordHandle= "null", otherInfo= "null"):
        """
        Create user profile and return the userID 
        ETH address or substrate address is required for now, others can be options 

        return -1 if anything is wrong
        return user ID if it is valid
        """
        if ETHAddr == "null" and subAddr == "null":
            return -1    # you must provide at least one address 
        if ETHAddr != "null":
            checkStatus = self.ETHAddr2ID(ETHAddr)
        else:
            checkStatus = self.subAddr2ID(subAddr)
        if checkStatus != False:
            return checkStatus    # the account had been created? 
        result = self.db.createuserProfile(ETHAddr, subAddr, twitterHandle, discordHandle, otherInfo)
        if result == None or result == False:
            return -1
        if len(result) <1 :
            return -1 
        return result[0][0]   # this is the user ID

    def updateProfile(self, ETHAddr="null", subAddr= "null", twitterHandle= "null", discordHandle= "null", otherInfo= "null"):
        """
        Update user profile and return the userID 
        ETH address or substrate address is required for now, others can be options 

        return -1 if anything is wrong
        return user ID if it is valid
        """
        if ETHAddr == "null" and subAddr == "null":
            return -1    # you must provide at least one address 
        print("now update the profile " + str(twitterHandle))
        result = self.db.updateuserProfile(ETHAddr, subAddr, twitterHandle, discordHandle, otherInfo)
        if result == None or result == False:
            return -1
        if len(result) <1 :
            return -1 
        return result[0][0]   # this is the user ID

    
    def claimNFTCode(self, userID, NFTCODE):
        """
        claim the NFTCODE for the userID, 
        if the userID not exists, return False
        if NFTCODE not exists or it is already claimed, return None
        otherwise, return True 
        """
        result = self.db.claimNFTCodeDB(userID,NFTCODE)
        return result 
    
    def checkUserIDForNFTCode(self, NFTCODE):
        """
        This will return the user ID for the NFT Code
        return None when something is wrong or the NFT code is not found
        return False when nobody claim it yet
        """
        result = self.db.checkIDNFTcode(NFTCODE)
        if result == None:
            print("something is wrong when checking the nft code? ")
            return None 
        if result == "-1" or result == -1:
            return False 
        return result 
    
    def generateIMGGenerationTask(self, userID, features):
        """
        This function will create a task in the database for the image generation, the features should be a string with all parameters including the description of the image and other settings, we use 
        return True when created successfully
        return None or False when something is wrong 
        """
        # make sure the features is in the json format 
        if not self._is_valid_json(features):
            print("The input is not in json format? please update it!")
            return None 

        result = self.db.createIMGTask(userID, features)
        if result == None or result == False:
            return None 
        
        #print("great, the new task id is: " + str(result))
        
        return result
    
    def checkTaskList(self):
        """
        It will return the list of unfinished tasks 
        """
        result = self.db.get2beDoneTaskList() 

        return result 
    
    def submitTask(self, taskID, imagePath):
        """
        We have finished one task and store the image in the database for the task ID
        return false if it is not submitted correctly, like the task id is wrong? image path is not found? 
        return True when it is successful 
        """
        # first check if the image path is valid
        if not os.path.isfile(imagePath):
            print("The image file path is not exists, check it here")
            return False 
        if not self.db.validTaskID(taskID):
            print("the task id is not valid")
            return False 
        
        try:
            with open(imagePath, "rb") as file:
                image_data = file.read()
                result = self.db.submitoneTask(taskID, image_data)
                if result == None or result == False:
                    return False 
        except:
            print("image file processing error, check the image file")
            return False 
        
        return True 
    
    def getIMG(self, taskID):
        """
        It will return the image obj for the task ID
        return false if it is not found
        """
        if not self.db.validTaskID(taskID):
            print("the task id is not valid")
            return False 
        #print("now check imggg")
        return self.db.getIMGfromTaskID(taskID)
    
    def getIMGListFromUserID(self, userID):
        """
        It will return all images for the user ID 
        return false if it is not found
        otherwise, will return a list of images
        """
        return self.db.getIMGListfromUserID(userID)









