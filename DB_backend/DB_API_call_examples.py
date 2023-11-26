from AIWeb3DB import AIWeb3 
# now it is for testing, example about calling this API 

aiweb3OBJ = AIWeb3()    # create the object

#1. Load the NFT code from text file into mysql database 
aiweb3OBJ.loadNFTCode("./NFTcode.txt")

#2. Create user profile, providing the ETH address (optional like substrateAddress, twitter handle, discord handle, etc.), and it will return the userID 
user1 = aiweb3OBJ.createProfile(ETHAddr = "0xaaaabbbccccccdddd")
if user1!=-1 and user1!=None and user1!=False:
    print("Successful! The user id is " + str(user1))
user2 = aiweb3OBJ.createProfile(ETHAddr = "0xdfdsdfdsf", subAddr="5xdfdfd", twitterHandle= "@cao_lab", discordHandle= "@drcao", otherInfo= "this is example of complete profile")
if user2!=-1 and user2!=None and user2!=False:
    print("Successful! The second user id is " + str(user2))

#3. Get user ID and the NFT code, claim the NFT code for the user 
ETHAddress = "0xaabcccc"   # we should not be able to find this ETH Address 
userID = aiweb3OBJ.ETHAddr2ID(ETHAddress)
if userID == False:
    print("sorry, we cannot find the ETH address in the database: " + str(ETHAddress))
else:
    print("great, the user id  for the ETH address is : "  + str(userID))

ETHAddress = "0xdfdsdfdsf"   # we should be able to find this ETH Address 
userID = aiweb3OBJ.ETHAddr2ID(ETHAddress)
if userID == False:
    print("sorry, we cannot find the ETH address in the database: " + str(ETHAddress))
else:
    print("great, the user id  for the ETH address is : "  + str(userID))

# now claim the NFT code  
NFTCODE = "wrong code"
result = aiweb3OBJ.claimNFTCode(userID, NFTCODE)  
if result == False or result == None:
    print("invalid NFT code, maybe it is already used?  1 ")
else:
    print("great, the user " + str(userID) + " have claimed the NFT code: "  + str(NFTCODE))

NFTCODE = "ABCD"
result = aiweb3OBJ.claimNFTCode(userID, NFTCODE)        # this should be correct
if result == False or result == None:
    print("invalid NFT code, maybe it is already used? ")
else:
    print("great, the user " + str(userID) + " have claimed the NFT code: "  + str(NFTCODE))


#4. Check the user ID who claimed the NFT code 
NFTCODE = "wrong code"     # should print not found in database
result = aiweb3OBJ.checkUserIDForNFTCode(NFTCODE)
if result == None:
    print("The NFT code is not found in the database")
elif result == False:
    print("The NFT code is not claimed yet ")
else:
    print("The nft code : " + str(NFTCODE) + " is claimed by user id: " + str(result))

NFTCODE = "DEDFFFFF"     # should print the NFT code is not claimed yet
result = aiweb3OBJ.checkUserIDForNFTCode(NFTCODE)
if result == None:
    print("The NFT code is not found in the database")
elif result == False:
    print("The NFT code is not claimed yet ")
else:
    print("The nft code : " + str(NFTCODE) + " is claimed by user id: " + str(result))


NFTCODE = "ABCD"     # should print the NFT is claimed by user 
result = aiweb3OBJ.checkUserIDForNFTCode(NFTCODE)
if result == None:
    print("The NFT code is not found in the database")
elif result == False:
    print("The NFT code is not claimed yet ")
else:
    print("The nft code : " + str(NFTCODE) + " is claimed by user id: " + str(result))



# add image 
# add task : Task ID (unique),  userID,   "feature1, feature2, feature3, ...", status (0, 1), image 
# check task:  return unfinished task 
# update task: Task ID, image ... 


#5. create a new task 
NFTCODE = "ABCD"     # should print the NFT is claimed by user 
userID = aiweb3OBJ.checkUserIDForNFTCode(NFTCODE)
result = aiweb3OBJ.generateIMGGenerationTask(userID, "aaaa")   # this should be wrong? 
if result == None or result == False:
    print("the input format is wrong, make sure it is json format? ")
else:
    print("Great, successfully created a new task :" + str(result))



result = aiweb3OBJ.generateIMGGenerationTask(userID, "{\"feature1\":\"ff111\", \"feature2\":\"ff12323232\"}")   # this should be right
if result == None or result == False:
    print("the input format is wrong, make sure it is json format? ")
else:
    print("Great, successfully created a new task :" + str(result))


#6. check all tasks that need to be processed 
print("now get all unfinished tasks ")
result = aiweb3OBJ.checkTaskList()
print(result)

iTaskID = result[0][0]
ifeatures = result[0][2]
#7. Now let's assume you have finished the first task 
imagePath = "./AIWEB3_logo.jpeg"

result = aiweb3OBJ.submitTask("123123123", imagePath)    # this is a wrong task id, should have error 
print(result)
result = aiweb3OBJ.submitTask(iTaskID, "wrong_path.txt")    # this is a wrong image path, should have error 
print(result)
result = aiweb3OBJ.submitTask(iTaskID, imagePath)    # this should be right
print(result)

# now let's get the image using task id 
print("now getting the image from database")
iTaskID = 1
result = aiweb3OBJ.getIMG(iTaskID)    # this will return the image back to you for the task id 
if result != None and result != False:
    outputIMGPath = "./newIMG.jpeg"
    with open(outputIMGPath, "wb") as file:
        file.write(result)