import os 
import sys 
from AIWeb3DB import AIWeb3 
# now it is for testing, example about calling this API 

aiweb3OBJ = AIWeb3()    # create the object

if len(sys.argv) < 3:
    print("We need two inputs, the task ID and the image path to save the image from database. For example:")
    print("python3 " + sys.argv[0] + " 1 \"./newIMG.jpeg\"")
    sys.exit(0)

taskID = sys.argv[1]
NewimagePath = sys.argv[2]

result = aiweb3OBJ.getIMG(taskID)    # this will return the image back to you for the task id 

if result != None and result != False:
    outputIMGPath = NewimagePath
    with open(outputIMGPath, "wb") as file:
        file.write(result)
else:
    print("cannot find the task id and the image in database, try again")