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
#1. set up the NFT code and a few user profiles
python3 1_setup_NFT_code_create_users.py 

#2. Create a task. Need the ETH address and the json feature input
python3 2_create_task.py "0xabcdef" "{\"feature1\":\"ff111\", \"feature2\":\"ff12323232\"}"    

#3. Submit and update the task. Here we submit the image to the task ID 1 
python3 3_submit_task.py "1" "./AIWEB3_logo.jpeg"

#4. Load the image based on the task id. You should get a new image: newIMG.jpeg
python3 4_loadIMG.py "1" "./newIMG.jpeg"

