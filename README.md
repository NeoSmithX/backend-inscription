# Backend for inscription project
 This the backend for inscription real-application project in any substrate network. (For now, supporting astart/polkadot/...)

# Query the winner in AMA Q&A
After the admin deploy the question with such format

```
    api.tx.system.remark(
        JSON.stringify({
            "p": "xxx", // this is to be determined, does not affect the query result
            "op": "deployQuestion",
            "space": "aiweb3-AMA",
            "questionID":"0"
            "question": "Who is the most popular Chinese community in polkadot ecosystem",
        })
    )
```
Here, u should record the tx hash, i.e., deploy-hash. Then, some user will join our party and mint answer with such format
```
    api.tx.system.remark(
        JSON.stringify({
            "p": "xxx", // this is to be determined, does not affect the query result
            "op": "mintAnswer",
            "space": "aiweb3-AMA",
            "questionID":"0"
            "answer": "Ur answer",
        })
    )
```

The, the frontend (anyone can connect to this backend) can get the winner by
```
    const urlVerifyUserSignature = "http://localhost:1986/query_quest_winner" 
    const data = JSON.stringify({
        message: "0xaaaaa is signing in to Aiweb3 at timestamp [current_timestamp] with nonce [random_nonce]",
        signature: "0x...",
        userAddress: "0x..."
    })
    const response = await fetch(urlVerifyUserSignature, {
        "network":"astar",
        "hash": deploy-hash, // should start with 0x
        "correct_answer": "aiweb3 community", // just a example, plz replace it with the real correct answer
        "winner_num":"2" // first winner_num users will be the winner 
    })
    const result = await response.json() 
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