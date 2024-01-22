# Backend for inscription project
 This the backend for inscription real-application project in any substrate network. (For now, supporting astart/polkadot/...)

# Query the winner in AMA Q&A

The backend have multi main functions.
1. create the winner list for AMA Q&A
After the admin deploy the question with such format

```
    api.tx.system.remark(
        JSON.stringify({
            "p": "xxx", // this is to be determined, does not affect the query result
            "op": "deployQuestion",
            "space": "aiweb3-AMA",
            "question_ID":"0"
            "question": "Who is the most popular Chinese community in polkadot ecosystem",
        })
    )
```
U need to record question information into database via (call this backend) 
```
    const url = "http://localhost:1986/create_quest_in_database" 
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
U need to record question information into database via (call this backend) 
```
    const url = "http://localhost:1986/read_quest_information_from_database" 
    const data = JSON.stringify({
        "network":network,
        "space":space,
        "question_ID":question_ID,
    })
    const response = await fetch(url, data)
```
Here, response including all the information of the question, including the deploy_hash, question, winner_num, winner_list, etc. Winner list exists only after the admin call the next function.


3. Create the winner.

U need to create the quest winner (maybe by clicking a button, triggering this call)
```
    const url = "http://localhost:1986/create_quest_winner" 
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
After this, u can fetch the winner list again by calling the function in 2.