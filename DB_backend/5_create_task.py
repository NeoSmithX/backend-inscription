import os 
import sys 
from AIWeb3DB import AIWeb3 
# now it is for testing, example about calling this API 

aiweb3OBJ = AIWeb3()    # create the object

if len(sys.argv) < 3:
    print("We need two inputs, the eth address and a json format string. For example:")
    print("python3 " + sys.argv[0] + " \"0xabcdef\" \'{\"feature1\":\"ff111\", \"feature2\":\"ff12323232\"}\'  ")
    sys.exit(0)

ETHaddress = sys.argv[1]
jsonData = sys.argv[2]

userID = aiweb3OBJ.ETHAddr2ID(ETHaddress)
if userID == False:
    print("creating new profile for this ETH address ... ")
    userID = aiweb3OBJ.createProfile(ETHAddr = ETHaddress)
    print("done, the user id is " + str(userID))
else:
    print("great, the user id  for the ETH address is : "  + str(userID))

# now create the task
result = aiweb3OBJ.generateIMGGenerationTask(userID, jsonData)   
if result == None or result == False:
    print("the input format is wrong, make sure it is json format? ")
else:
    print("Great, successfully created a new task :" + str(result))


print("now get all unfinished tasks ... ")
result = aiweb3OBJ.checkTaskList()
print(result)


