The API call examples in the DB_API_call_examples.py (no need to run this one, just check the scripts below)

But you need to install mysql database first and need to set up the mysql account as follows:

brew install mysql

mysql

use the following to set up mysql database:
CREATE USER 'AIWeb3USER'@'localhost' IDENTIFIED BY 'aiweb3dao!';
CREATE DATABASE AIWeb3DB;
GRANT ALL PRIVILEGES ON AIWeb3DB.* TO 'AIWeb3USER'@'localhost';
FLUSH PRIVILEGES;

pip3 install mysql-connector-python


# example tasks: how to run: 
#1. set up the NFT code, only need to run when needed 
python3 1_setup_NFT_code.py

#2. set up user profiles, the accountType and userAddress is required, others are optional, a few examples:
python3 2_setup_users.py '{"accountType":"substrate", "userAddress":"5xxxff12323232"}'  
python3 2_setup_users.py '{"accountType":"ethereum", "userAddress":"0xsdkjfjw"}'  
python3 2_setup_users.py '{"accountType":"substrate", "userAddress":"5xxxff124323232", "discordHandle":"cao"}'  
python3 2_setup_users.py '{"accountType":"substrate", "userAddress":"5xxxff1231233232", "signature":"xxxxxxxx"}'

#3. Check the NFT code from database 
python3 3_1_checkNFTcode.py ABCD    # this should return valid if the code is in the database

#4. claim the NFT code for the user. You need the code and also the account in json format
python3 3_2_claimNFTcode.py "ABCD"  '{"accountType":"substrate", "userAddress":"5xxxff12323232"}'  
python3 3_2_claimNFTcode.py "ddds" '{"accountType":"ethereum", "userAddress":"0xsdkjfjw"}'  
python3 3_2_claimNFTcode.py "ABCD" '{"accountType":"substrate", "userAddress":"5xxxff124323232", "discordHandle":"cao"}'  
python3 3_2_claimNFTcode.py "ABCCCC" '{"accountType":"substrate", "userAddress":"5xxxff1231233232", "signature":"xxxxxxxx"}'

#5. Create a task. Need the ETH address and the json feature input
python3 5_create_task.py "0xabcdef" '{"feature1":"ff111", "feature2":"ff12323232"}'  

#6. Submit and update the task. Here we submit the image to the task ID 1 
python3 6_submit_task.py "1" "./AIWEB3_logo.jpeg"

#7. Load the image based on the task id. You should get a new image: newIMG.jpeg
python3 7_loadIMG.py "1" "./newIMG.jpeg"

#8. Fetch all tasks
python3 8_fetchTask.py

