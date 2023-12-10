import os 
import sys 
from AIWeb3DB import AIWeb3 
# now it is for testing, example about calling this API 
import json

if len(sys.argv) < 2:
    print("We need one input, output for the json format result. For example:")
    print("python3 " + sys.argv[0] + " ./jsonResult.json")
    sys.exit(0)

aiweb3OBJ = AIWeb3()    # create the object
outputPath = sys.argv[1] # output

print("now get all unfinished tasks ... ")
result = aiweb3OBJ.checkTaskList()

counter = 0
finalResult = {}
for each in result:
    key0 = str(counter)
    counter = counter + 1
    value0 = {"taskID":each[0], "userID":each[1], "features":each[2]}
    finalResult[key0] = value0

print("result:" + str(finalResult))

# Convert and save the data to a JSON file
with open(outputPath, 'w') as file:
    json.dump(finalResult, file, indent=4)
