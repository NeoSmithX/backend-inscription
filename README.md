# Backend for inscription project
 This the backend for inscription real-application project in any substrate network. (For now, supporting astart/polkadot/...)

# Query the winner in AMA Q&A

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
    const response = await fetch(url, data)
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
    const response = await fetch(url, data)
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
    const response = await fetch(url, data)
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