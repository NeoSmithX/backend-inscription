import os 
import sys 
from AIWeb3DB import AIWeb3 
# now it is for testing, example about calling this API 
import json

aiweb3OBJ = AIWeb3()    # create the object

if len(sys.argv) < 2:
    print("We need one input, the json format string with accountType, userAddress, and optional:twitterHandle, discordHandle, otherInfo . For example:")
    print("python3 " + sys.argv[0] + " \'{\"accountType\":\"substrate\", \"userAddress\":\"5xxxff12323232\"}\'  ")
    print("python3 " + sys.argv[0] + " \'{\"accountType\":\"ethereum\", \"userAddress\":\"0xsdkjfjw\"}\'  ")
    print("python3 " + sys.argv[0] + " \'{\"accountType\":\"substrate\", \"userAddress\":\"5xxxff124323232\", \"discordHandle\":\"cao\"}\'  ")
    print("python3 " + sys.argv[0] + " \'{\"accountType\":\"substrate\", \"userAddress\":\"5xxxff1231233232\", \"signature\":\"xxxxxxxx\"}\'  ")
    sys.exit(0)

jsonData = sys.argv[1]

try:
    loadedJsonData = json.loads(jsonData)
except json.JSONDecodeError:
    print("something is wrong, please check if your json format is correct or not")
    sys.exit(0)

if "accountType" not in loadedJsonData:
    print("Please provide the accountType in your json data, cannot be processed")
    sys.exit(0)

if "userAddress" not in loadedJsonData:
    print("Please provide the userAddress in your json data, cannot be processed")
    sys.exit(0)

twitterHandle = "null"
if "twitterHandle" in loadedJsonData:
    twitterHandle = loadedJsonData["twitterHandle"]
discordHandle = "null"
if "discordHandle" in loadedJsonData:
    discordHandle = loadedJsonData["discordHandle"]

otherInfo = "null"
if "message" in loadedJsonData:
    if otherInfo == "null":
        otherInfo = loadedJsonData["message"]
    else:
        otherInfo = otherInfo + "|" + loadedJsonData["message"]

if "signature" in loadedJsonData:
    if otherInfo == "null":
        otherInfo = loadedJsonData["signature"]
    else:
        otherInfo = otherInfo + "|" + loadedJsonData["signature"]

userAddress = loadedJsonData["userAddress"]
if loadedJsonData["accountType"] == "substrate":
    userID = aiweb3OBJ.subAddr2ID(userAddress)
    if userID == False:
        print("creating new profile for this address ... ")
        userID = aiweb3OBJ.createProfile(subAddr = userAddress, twitterHandle = twitterHandle, discordHandle = discordHandle, otherInfo = otherInfo )
        print("done, the user id is " + str(userID))
    else:
        print("This profile had been created before, no need to create again")
elif loadedJsonData["accountType"] == "ethereum":
    userID = aiweb3OBJ.ETHAddr2ID(userAddress)
    if userID == False:
        print("creating new profile for this address ... ")
        userID = aiweb3OBJ.createProfile(ETHAddr = userAddress, twitterHandle = twitterHandle, discordHandle = discordHandle, otherInfo = otherInfo)
        print("done, the user id is " + str(userID))
    else:
        print("This profile had been created before, no need to create again")
else:
    print("the wallet type is wrong, we only accept substrate and ethereum address for now, need to change the database if you want to support more")
    sys.exit(0)



