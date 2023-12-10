import os 
import sys 
from AIWeb3DB import AIWeb3 
# now it is for testing, example about calling this API 
import json

aiweb3OBJ = AIWeb3()    # create the object


if len(sys.argv) < 3:
    print("We need two inputs, the json format string with accountType, userAddress, and it will print a list of all images for this user. And also the json output pathFor example:")
    print("python3 " + sys.argv[0] + " \'{\"accountType\":\"substrate\", \"userAddress\":\"5xxxff12323232\"}\'  ./jsonIMGResult1.json")
    print("python3 " + sys.argv[0] + " \'{\"accountType\":\"ethereum\", \"userAddress\":\"0xsdkjfjw\"}\'  ./jsonIMGResult2.json")
    sys.exit(0)

jsonData = sys.argv[1]
outputJson = sys.argv[2]

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
elif loadedJsonData["accountType"] == "ethereum":
    userID = aiweb3OBJ.ETHAddr2ID(userAddress)
    if userID == False:
        print("creating new profile for this address ... ")
        userID = aiweb3OBJ.createProfile(ETHAddr = userAddress, twitterHandle = twitterHandle, discordHandle = discordHandle, otherInfo = otherInfo)
        print("done, the user id is " + str(userID))


print("now getting the image from database")
result = aiweb3OBJ.getIMGListFromUserID(userID)    # this will return all images from the same userID
#print(result)
# print(len(result))
# for i in range(len(result)):
#     print(result[i][0:2])
# if result != None and result != False:
#     outputIMGPath = "./newIMG.jpeg"
#     with open(outputIMGPath, "wb") as file:
#         file.write(result)
if result == False or result == None or len(result) < 1:
    print("No images found for the user")
    sys.exit(0)

current_dir = os.path.dirname(os.path.abspath(__file__))
print("Directory of the current file:", current_dir)
IMGDIR = current_dir + "/IMG"
try:
    os.system("mkdir " + IMGDIR)
except:
    print("The image folder had been created already")

# now store the images, the naming is : userID_taskID.jpeg  
resultLIST = []
for i in range(len(result)):
    mytaskID = result[i][0]
    imgDATA = result[i][2]
    outputIMGPath = IMGDIR + "/" + str(userID) + "_" + str(mytaskID) + ".jpg"
    with open(outputIMGPath, "wb") as file:
        file.write(imgDATA)
    resultLIST.append(outputIMGPath)

print("Done, please check:")

count = 0
finalResult = {}
for each in resultLIST:
    finalResult[str(count)] = each 
    count+=1

print("result:" +  str(finalResult))

# Convert and save the data to a JSON file
with open(outputJson, 'w') as file:
    json.dump(finalResult, file, indent=4)
