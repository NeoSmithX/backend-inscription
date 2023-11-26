from AIWeb3DB import AIWeb3 
# now it is for testing, example about calling this API 

aiweb3OBJ = AIWeb3()    # create the object

#1. Load the NFT code from text file into mysql database 
aiweb3OBJ.loadNFTCode("./NFTcode.txt")

#2. Create user profile, providing the ETH address (optional like substrateAddress, twitter handle, discord handle, etc.), and it will return the userID 
user1 = aiweb3OBJ.createProfile(ETHAddr = "0xaaaabbbccccccdddd")
if user1!=-1 and user1!=None and user1!=False:
    print("Successful! The user id is " + str(user1))
user2 = aiweb3OBJ.createProfile(ETHAddr = "0xdfdsdfdsf", subAddr="5xdfdfd", twitterHandle= "@cao_lab", discordHandle= "@drcao", otherInfo= "this is example of complete profile")
if user2!=-1 and user2!=None and user2!=False:
    print("Successful! The second user id is " + str(user2))

