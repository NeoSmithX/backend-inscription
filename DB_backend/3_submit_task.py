import os 
import sys 
from AIWeb3DB import AIWeb3 
# now it is for testing, example about calling this API 

aiweb3OBJ = AIWeb3()    # create the object

if len(sys.argv) < 3:
    print("We need two inputs, the task ID and the image path. For example:")
    print("python3 " + sys.argv[0] + " 1 \"./AIWEB3_logo.jpeg\"")
    sys.exit(0)

taskID = sys.argv[1]
imagePath = sys.argv[2]

result = aiweb3OBJ.submitTask(taskID, imagePath)    # this should be right
print(result)