import os 
import sys 
from AIWeb3DB import AIWeb3 
# now it is for testing, example about calling this API 
import json 
aiweb3OBJ = AIWeb3()    # create the object

if len(sys.argv) < 3:
    print("We need two inputs, the json with address and account type, and a json format string for the features of the image. For example:")
    print("python3 " + sys.argv[0] + " \'{\"accountType\":\"substrate\", \"userAddress\":\"5xxxff12323232\"}\' \'{\"feature1\":\"ff111\", \"feature2\":\"ff12323232\"}\'  ")
    sys.exit(0)

addressJson = sys.argv[1]
jsonData = sys.argv[2]

try:
    loadedJsonData = json.loads(addressJson)
except json.JSONDecodeError:
    print("something is wrong, please check if your json format is correct or not")
    sys.exit(0)

if "accountType" not in loadedJsonData:
    print("Please provide the accountType in your json data, cannot be processed")
    sys.exit(0)

if "userAddress" not in loadedJsonData:
    print("Please provide the userAddress in your json data, cannot be processed")
    sys.exit(0)

userAddress = loadedJsonData["userAddress"]
if loadedJsonData["accountType"] == "substrate":
    userID = aiweb3OBJ.subAddr2ID(userAddress)
    if userID == False:
        print("creating new profile for this address ... ")
        userID = aiweb3OBJ.createProfile(subAddr = userAddress)#, twitterHandle = twitterHandle, discordHandle = discordHandle, otherInfo = otherInfo )
        print("done, the user id is " + str(userID))
elif loadedJsonData["accountType"] == "ethereum":
    userID = aiweb3OBJ.ETHAddr2ID(userAddress)
    if userID == False:
        print("creating new profile for this address ... ")
        userID = aiweb3OBJ.createProfile(ETHAddr = userAddress)#, twitterHandle = twitterHandle, discordHandle = discordHandle, otherInfo = otherInfo)
        print("done, the user id is " + str(userID))

# now create the task
result = aiweb3OBJ.generateIMGGenerationTask(userID, jsonData)   
if result == None or result == False:
    print("the input format is wrong, make sure it is json format? ")
else:
    print("Great, successfully created a new task :" + str(result))


print("now get all unfinished tasks ... ")
result = aiweb3OBJ.checkTaskList()
print(result)


