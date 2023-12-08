import os 
import sys 
from AIWeb3DB import AIWeb3 
# now it is for testing, example about calling this API 
import json

aiweb3OBJ = AIWeb3()    # create the object


if len(sys.argv) < 2:
    print("We need two inputs, the NFT code and the json format string with accountType, userAddress. For example:")
    print("python3 " + sys.argv[0] + " \"ABCD\"  \'{\"accountType\":\"substrate\", \"userAddress\":\"5xxxff12323232\"}\'  ")
    print("python3 " + sys.argv[0] + " \"ddds\" \'{\"accountType\":\"ethereum\", \"userAddress\":\"0xsdkjfjw\"}\'  ")
    print("python3 " + sys.argv[0] + " \"ABCD\" \'{\"accountType\":\"substrate\", \"userAddress\":\"5xxxff124323232\", \"discordHandle\":\"cao\"}\'  ")
    print("python3 " + sys.argv[0] + " \"ABCCCC\" \'{\"accountType\":\"substrate\", \"userAddress\":\"5xxxff1231233232\", \"signature\":\"xxxxxxxx\"}\'  ")
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


NFTCODE = sys.argv[1]


userAddress = loadedJsonData["userAddress"]
if loadedJsonData["accountType"] == "substrate":
    userID = aiweb3OBJ.subAddr2ID(userAddress)
    if userID == False:
        print("creating new profile for this address ... ")
        userID = aiweb3OBJ.createProfile(subAddr = userAddress, twitterHandle = twitterHandle, discordHandle = discordHandle, otherInfo = otherInfo )
        print("done, the user id is " + str(userID))
elif loadedJsonData["accountType"] == "ethereum":
    userID = aiweb3OBJ.ETHAddr2ID(userAddress)
    if userID == False:
        print("creating new profile for this address ... ")
        userID = aiweb3OBJ.createProfile(ETHAddr = userAddress, twitterHandle = twitterHandle, discordHandle = discordHandle, otherInfo = otherInfo)
        print("done, the user id is " + str(userID))


result = aiweb3OBJ.claimNFTCode(userID, NFTCODE)        # this should be correct
if result == False or result == None:
    print("invalid NFT code, maybe it is already used? ")
else:
    print("great, the user " + str(userID) + " have claimed the NFT code: "  + str(NFTCODE))

