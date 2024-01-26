# Backend for inscription project
 This the backend for inscription real-application project in any substrate network. (For now, supporting astart/polkadot/...)



# How to run this backend

## run database
### install mysql

```
sudo apt-get update
sudo apt-get install mysql-server
sudo mysql_secure_installation
sudo systemctl start mysql
sudo systemctl enable mysql
sudo systemctl status mysql
```

### init mysql
```
mysql -u root -p
CREATE DATABASE inscription_aiweb3;
CREATE USER 'aiwbe3_test'@'localhost' IDENTIFIED BY '';
GRANT ALL PRIVILEGES ON inscription_aiweb3.* TO 'aiwbe3_test'@'localhost';
FLUSH PRIVILEGES;
USE inscription_aiweb3;
CREATE TABLE aiweb3_questions (
    network VARCHAR(255),
    space VARCHAR(255),
    question_ID INT,
    question TEXT,
    deploy_hash VARCHAR(255),
    correct_answer TEXT,
    winner_num INT,
    winner_list TEXT,
    PRIMARY KEY (network, space, question_ID)
);
```
## run backend
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
source ~/.bashrc
nvm install node
npm install -g typescript
npm install --global yarn
```

# How frontend interacts with this backend (Kabugu see here 🎉)

The backend have multi main functions. url should be the ip address of the backend server.

1. create the winner list for AMA Q&A

After the admin deploy the question, frontend needs to record question information into database via (call this backend) 
```
    const url = "http://url:1986/create_quest_in_database" 
    const data = JSON.stringify({
        "network":network,
        "space":space,
        "question_ID":question_ID,
        "question":question,
        "deploy_hash":deploy_hash
    })
    const response = await fetch(
        url, 
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: data
        }
    )
    console.log(response.json())
```


2. Fetch quest information via database.

Frontend can fetch question information from database via (call this backend) 
```
    const url = "http://url:1986/read_quest_information_from_database" 
    const data = JSON.stringify({
        "network":network,
        "space":space,
        "question_ID":question_ID,
    })
    const response = await fetch(
        url, 
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: data
        }
    )
    console.log(response.json())
```
Here, response including all the information of the specifical question, including the deploy_hash, question, winner_num, winner_list, etc. Winner list exists only after the admin call the function (/create_quest_winner).


3. Create the winner.

Frontend can create the quest winner (maybe click a button to trigger this call)
```
    const url = "http://url:1986/create_quest_winner" 
    const data = JSON.stringify({
        "network":network,
        "space":space,
        "question_ID":question_ID,
        "correct_answer":correct_answer,
        "winner_num":winner_num
    })
    const response = await fetch(
        url, 
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: data
        }
    )
    console.log(response.json())
```

Here, the result of winner list will be as such format
```
    {
        "status":true,
        "log":"succeed to find the winner",
        "data":{
            "winner_list":[
                "5Dxxxxxxx",
                "5Fxxxxxxx",
                ...
            ]
        }
    }
```
In addition, frontedn can fetch the winner list again by calling the function (/read_quest_information_from_database) at anytime.