import os 
import sys 
from AIWeb3DB import AIWeb3 
# now it is for testing, example about calling this API 

aiweb3OBJ = AIWeb3()    # create the object

print("now get all unfinished tasks ... ")
result = aiweb3OBJ.checkTaskList()
for each in result:
    print(each)