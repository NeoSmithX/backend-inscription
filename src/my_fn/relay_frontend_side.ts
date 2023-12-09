// as the relay comminication between sdw and aiweb3-frontend

import { spawn } from "child_process";

import { configRelay } from "../config/general";
// const { graphqlHTTP } = require('express-graphql');
// const { buildSchema } = require('graphql');
const express = require('express');
const bodyParser = require('body-parser')
const app = express();
// app.use(express.json());
// Configure body-parser for larger payloads
// app.use(bodyParser.json({ limit: '50mb' })); // Adjust the limit as needed
// app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }))
// Enable CORS for all routes
const cors = require('cors');
app.use(cors());

const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Images will be stored in 'uploads' folder
const fs = require('fs');
const path = require('path');


export type Task = {
    taskID: string,
    featureInput: string,
    imgPath: string,
    isCompleted: boolean
}
const taskGlobal: Task[] = []
export const fetchTaskFromSql = async () => {
    console.log('fetchTaskFromSql function is working')
    while (true) {
        try {
            const pythonProcess = spawn('python', ['DB_backend/8_fetchTask.py']);

            pythonProcess.stdout.on('data', (data) => {
                // console.log(`stdout: ${data}`)
                const lines = data.toString().split('\n')
                const tupleLineList = lines.filter((line: string | string[]) => line.includes('(') && line.includes(')'))
                for (const tupleLine of tupleLineList) {
                    // Remove the parentheses and split by comma
                    const elements = tupleLine.slice(1, -1).split(',').map((el: string) => el.trim());

                    // Extract the task ID
                    const taskID = elements[0]
                    // console.log('taskID:', taskID) //

                    // Extract and parse the JSON string
                    // Extract the JSON string
                    const jsonMatch = tupleLine.match(/{.*}/);
                    const jsonString = jsonMatch ? jsonMatch[0] : null;
                    // Parse the JSON string
                    const jsonObject = JSON.parse(jsonString);
                    // console.log('JSON Object:', jsonObject);
                    let featureInput = ''
                    for (const [key, value] of Object.entries(jsonObject)) {
                        // console.log(`${key}: ${value}`);
                        featureInput = featureInput + value + ','
                    }
                    // console.log('featureInput:', featureInput)
                    if (taskGlobal.filter((task: Task) => task.taskID == taskID).length == 0) {
                        taskGlobal.push(
                            {
                                taskID: taskID,
                                featureInput: featureInput,
                                imgPath: 'DB_backend/public/data_from_relay/' + taskID + '.png',
                                isCompleted: false
                            }
                        )
                    }

                }



            });

            pythonProcess.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });

            pythonProcess.on('close', (code) => {
                // console.log(`Child process exited with code ${code}`);
            });
        } catch (e) {
            console.log(e)
        }
        // console.log('current task is: ', taskGlobal)
        await new Promise(r => setTimeout(r, 10000))
    }

}

export const distributeTask = async () => { // this is to distrubute task to the stable-diffusion ai side
    console.log('distributeTask function is working')
    app.post('/fetchTask', async (req: any, res: { json: (arg0: string | Task[]) => void; }) => {
        const tasks = taskGlobal.filter((task: Task) => task.isCompleted == false)
        if (tasks.length == 0) {
            // console.log('there is no task in sql, so reply none')
            res.json('none')

        } else {
            console.log('send task', tasks)
            res.json(tasks)
        }

    })

}

// export const receiveImgFromAiSide = async () => {
//     app.post('/uploadImg', upload.single('image'), (req: any, res: any) => {
//         console.log('!!!!!', req)
//         const taskID = req.body.taskID
//         console.log('Received taskId :', taskID);

//         console.log('Received file:', req.file);
//         console.log('Received body:', req.body); // Assuming 'text' is the key for the string data

//         res.status(200).json({ message: 'File and text received' });



//         const task = taskGlobal.find((task: Task) => task.taskID == req.body.text);
//         if (task) {
//             const tempPath = req.file.path;
//             const targetPath = path.join(__dirname, 'uploads', taskID);

//             // Move and rename the file
//             fs.rename(tempPath, targetPath, (err: any) => {
//                 if (err) return res.status(500).json({ message: 'Error saving the file' });

//                 res.status(200).json({ message: 'File uploaded successfully' });
//             });
//             const pythonProcess = spawn('python', ['DB_backend/3_submit_task.py', task.taskID, task.imgPath]);
//             task.isCompleted = true;
//         }

//     })
//     app.listen(configRelay.frontend.port, () => {
//         console.log(`Server running on ` + configRelay.frontend.url + ':' + configRelay.frontend.port);
//     });
// }
export const receiveImgFromAiSide_v2 = async () => {
    console.log('receiveImgFromAiSide_v2 function is working')
    app.post('/uploadImg', (req: any, res: any) => {
        const { image, taskID } = req.body;




        const task = taskGlobal.find((task: Task) => task.taskID == taskID);
        if (task) {


            const imageBuffer = Buffer.from(image, 'base64');

            fs.writeFileSync(task.imgPath, imageBuffer);
            const pythonProcess = spawn('python', ['DB_backend/6_submit_task.py', task.taskID, task.imgPath]);
            task.isCompleted = true;
        }

    })
    app.listen(configRelay.frontend.port, () => {
        console.log(`Server running on ` + configRelay.frontend.url + ':' + configRelay.frontend.port);
    });
}

import { stringToU8a, u8aToHex } from '@polkadot/util'
import { signatureVerify } from '@polkadot/util-crypto';
export const verifyUserSignature = async () => {
    const Web3 = require('web3') 
    const web3WithoutRpc = new Web3() //new Web3.providers.WebsocketProvider('wss://wss.api.moonbeam.network')
    // const { signatureVerify } = require('@polkadot/util-crypto')
    console.log('verifyUserSignature function is working')
    app.post('/verifyUserSignature', async  (req: any, res: any) => {
        console.log('receive verifyUserSignature from from '+req.ip)
        console.log( req.body)
        try{
            const { userAddress, message, signature, accountType } = req.body;

            if (userAddress && message && signature && accountType) {
                switch (accountType) {
                    case 'evm':{
                        const signerAddress = await web3WithoutRpc.eth.accounts.recover(message, signature)
                        if (signerAddress.toLowerCase() == userAddress.toLowerCase()) {
                            console.log('signature is : ','correct')
                            res.json('correct')
                        } else {
                            console.log('signature is : ','wrong')
                            res.json('wrong')
                        }
                        break
                    }
                    case 'substrate':{
                        const messageU8a = stringToU8a(message)
                        // console.log('messageU8a',messageU8a)
                        const isValidSignature = signatureVerify(messageU8a, signature, userAddress).isValid
                        console.log('signature is : ',isValidSignature)
                        if (isValidSignature){
                            res.json('correct')
                        }else{
                            res.json('wrong')
                        }
                        break
                    }
                    default:{
                        console.log('unknown accountType')
                        res.json('unknown accountType')
                    }
                }

                
            }
        }catch(e){
            console.log(e)
            res.json('unknown issue: some format error for the input')
        }
        


    })

}

export const generateTaskFromFrontend = async () => {
    console.log('generateTaskFromFrontend function is working')
    app.post('/generateTaskFromFrontend', async (req: any, res: any) => {
        console.log('receive generateTaskFromFrontend from '+req.ip)
        console.log( req.body)
        const { userAddress, feature } = req.body;

        if (userAddress && feature) {
            try{
                spawn('python', ['DB_backend/5_create_task.py', userAddress, JSON.stringify(feature) ])
                console.log('the nft task has been added into SQL database, and the AI-imgae will be generated soon (absolute path will be added in the next test')
                res.json('the nft task has been added into SQL database, and the AI-imgae will be generated soon (absolute path will be added in the next test)')
            }catch(e){
                console.log(e)
                res.json('error when running python script')
            }
            
        }else{
            console.log(userAddress,feature)
            res.json('task generation failed, please check the input format')
        }
        
    

    })

}


export const createUserProfile = async () => {
    console.log('createUserProfile function is working')
    app.post('/createUserProfile', async (req: any, res: any) => {
        console.log('receive createUserProfile from '+req.ip)
        console.log( req.body)
        const { accountType, userAddress } = req.body

        if (accountType && userAddress) {
            const data = {...JSON.parse(req.body),NFTEligible:0}
            try{
                spawn('python', ['DB_backend/2_setup_users.py', JSON.stringify(data) ])
        
                res.json('success for createUserProfile')
            }catch(e){
                console.log(e)
                res.json('fail for createUserProfile')
            }
            
        }else{
            console.log(accountType,userAddress)
            res.json('createUserProfile failed, please check the input format')
        }
        
    

    })

}
export const checkNFTCode = async () => {   // this will update user profile to NFTEligible ++
    console.log('checkNFTCode function is working')
    app.post('/checkNFTCode', async (req: any, res: any) => {
        console.log('receive checkNFTCode from '+req.ip)
        console.log( req.body)
        const { accountType, userAddress, NFTCode } = req.body

        if (accountType && userAddress && NFTCode) {
            try{
                const isNFTCodeValid = spawn('python', ['DB_backend/3_1_checkNFTcode.py', NFTCode ])

                if (isNFTCodeValid){
                  
                    // spawn('python', ['DB_backend/2_setup_users.py', JSON.stringify(data) ])
                    res.json('NFT code is valid and the user NFTEligible is updated')
                }else{
                    res.json('NFT code is invalid')
                }

            }catch(e){
                console.log(e)
                res.json('fail for checkNFTCode')
            }
       
            
            
        }else{
            console.log(accountType,userAddress)
            res.json('createUserProfile failed, please check the input format')
        }
        
    

    })

}



export const getUserAllImg = async () => {
    const functionName = 'getUserAllImg'
    console.log(functionName+' function is working')
    app.post('/'+functionName, async (req: any, res: any) => {
        console.log('receive' + functionName+' from '+req.ip)
        console.log( req.body)
        const { accountType, userAddress } = req.body

        if (accountType && userAddress) {
           
            try{
                const data = spawn('python', ['DB_backend/9_fetchIMG.py', req.body ])
        
                res.json(data)
                
            }catch(e){
                console.log(e)
                res.json('fail for '+functionName)
            }
            
        }else{
            console.log(accountType,userAddress)
            res.json(functionName+ ' failed, please check the input format')
        }
        
    

    })

}

// curl -X POST -H "Content-Type: application/json" -d '{"accountType":"substrate","message":"i am testing", "signature":"0xb204163ca47ff05d2e8b1accb858acc10c06f6e694976cad2b5056221da67663eaaab8879b3d991cef3dab523fd7c5dc1071ad196d4351c2dab78d7f339b1b8f", "userAddress":"5Gv6J2jJSG7ZqrjKj22TsW2JgLqY5hL8oqDhBgRAcvmCxaKW"}' http://34.83.125.53:1985/verifyUserSignature

// curl -X POST -H "Content-Type: application/json" -d '{"accountType":"substrate","message":"aiweb3", "signature":"0xb2808f1a866ed5d4a80886af874d8f1de0efd4cfa6e74e6affe7e36e08cc1b107e5de13606b537cfae9c8e8f09458560db9e754a807780dec2328d4dc5f66b81", "userAddress":"5Gazt49AnPMPRNt4U2mdJydoi9EKxZNFvJ85U7v1PyJzPmY4"}' http://127.0.0.1:1985/verifyUserSignature
// curl -X POST -H "Content-Type: application/json" -d '{"userAddress":"0x345fdA96178147bF5E8cdFbfBDF723d15f2973C3","feature":{"feature1":"red hair","feature2":"red hat"}}' http://127.0.0.1:1985/generateTaskFromFrontend

