import os 
import sys 
from AIWeb3DB import AIWeb3 
# now it is for testing, example about calling this API 
import json

aiweb3OBJ = AIWeb3()    # create the object

if len(sys.argv) < 2:
    print("Check if the NFT code is valid, provide the code as input, and it will print: ")
    print("python3 " + sys.argv[0] + " ABCD")
    print("python3 " + sys.argv[0] + " xxssddssd")
    sys.exit(0)

NFTCODE = sys.argv[1]

# Check the user ID who claimed the NFT code 
result = aiweb3OBJ.checkUserIDForNFTCode(NFTCODE)
if result == None:
    print("The NFT code is not found in the database")
elif result == False:
    print("The NFT code is not claimed yet ")
else:
    print("The nft code : " + str(NFTCODE) + " is claimed by user id: " + str(result))
