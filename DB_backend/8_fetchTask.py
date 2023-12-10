import os 
import sys 
from AIWeb3DB import AIWeb3 
# now it is for testing, example about calling this API 
import json

aiweb3OBJ = AIWeb3()    # create the object

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
# for each in result:
#     print(each)