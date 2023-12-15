// as the relay comminication between sdw and aiweb3-frontend
import { ResToFrontend } from "../my_definition/type";
import { spawn } from "child_process";
import fs from 'fs'
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
// const fs = require('fs');
const path = require('path');


export type Task = {
    taskID: string,
    featureInput: string,
    imgPath: string,
    isCompleted: boolean
}
const taskGlobal: Task[] = []
export const fetchTaskFromSql_v3 = async () => {
    console.log('fetchTaskFromSql function is working')
    while (true) {
        try {
            const timestamp = Date.now()
            // const filePath = 'src/output/python/8_fetchTask_JSON' + timestamp + '.json'
            const filePath = 'src/output/python/8_fetchTask_JSON.json'
            spawn('python', ['DB_backend/8_fetchTask_JSON.py', filePath])
            await new Promise(r => setTimeout(r, 500))
            const jsonString = fs.readFileSync(filePath, 'utf8')
            const data = JSON.parse(jsonString)
            for (const key in data) {
                const value = data[key]
                const taskID = value.taskID
                const userID = value.userID
                const features = JSON.parse(value.features)
                let featureInput = ''
                for (const [key, value] of Object.entries(features)) {
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
                    // console.log('imcompleted task:',taskGlobal)
                }

            }
            // fs.readFile(filePath, 'utf8', (err, jsonString) => {
            //     if (err) {
            //         console.error("Error reading file:", err)
            //         return;
            //     }
            //     try {
            //     //     const data = JSON.parse(jsonString)
            //     //     for (const key in data) {
            //     //         const value = data[key]
            //     //         const taskID = value.taskID
            //     //         const userID = value.userID
            //     //         const features = JSON.parse(value.features)
            //     //         let featureInput = ''
            //     //         for (const [key, value] of Object.entries(features)) {
            //     //             // console.log(`${key}: ${value}`);
            //     //             featureInput = featureInput + value + ','
            //     //         }
            //     //         // console.log('featureInput:', featureInput)
            //     //         if (taskGlobal.filter((task: Task) => task.taskID == taskID).length == 0) {
            //     //             taskGlobal.push(
            //     //                 {
            //     //                     taskID: taskID,
            //     //                     featureInput: featureInput,
            //     //                     imgPath: 'DB_backend/public/data_from_relay/' + taskID + '.png',
            //     //                     isCompleted: false
            //     //                 }
            //     //             )
            //     //             // console.log('imcompleted task:',taskGlobal)
            //     //         }

            //     //     }

            //     //     // console.log(data);
            //     // } catch (err) {
            //     //     console.error("Error parsing JSON:", err);
            //     // }
            // });

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
    app.post('/verifyUserSignature', async (req: any, res: any) => {
        console.log('receive verifyUserSignature from from ' + req.ip)
        console.log(req.body)
        try {
            const { userAddress, message, signature, accountType } = req.body;

            if (userAddress && message && signature && accountType) {
                switch (accountType) {
                    case 'ethereum': {
                        const signerAddress = await web3WithoutRpc.eth.accounts.recover(message, signature)
                        if (signerAddress.toLowerCase() == userAddress.toLowerCase()) {
                            console.log('signature is : ', 'correct')
                            res.json('correct')
                        } else {
                            console.log('signature is : ', 'wrong')
                            res.json('wrong')
                        }
                        break
                    }
                    case 'substrate': {
                        const messageU8a = stringToU8a(message)
                        // console.log('messageU8a',messageU8a)
                        const isValidSignature = signatureVerify(messageU8a, signature, userAddress).isValid
                        console.log('signature is : ', isValidSignature)
                        if (isValidSignature) {
                            res.json('correct')
                        } else {
                            res.json('wrong')
                        }
                        break
                    }
                    default: {
                        console.log('unknown accountType')
                        res.json('unknown accountType')
                    }
                }


            }
        } catch (e) {
            console.log(e)
            res.json('unknown issue: some format error for the input')
        }



    })

}

// export const generateTaskFromFrontend = async () => {
//     console.log('generateTaskFromFrontend function is working')
//     app.post('/generateTaskFromFrontend', async (req: any, res: any) => {
//         console.log('receive generateTaskFromFrontend from ' + req.ip)
//         console.log(req.body)
//         const { userAddress, feature } = req.body;

//         if (userAddress && feature) {
//             try {
//                 spawn('python', ['DB_backend/5_create_task.py', userAddress, JSON.stringify(feature)])
//                 console.log('the nft task has been added into SQL database, and the AI-imgae will be generated soon (absolute path will be added in the next test')
//                 res.json('the nft task has been added into SQL database, and the AI-imgae will be generated soon (absolute path will be added in the next test)')
//             } catch (e) {
//                 console.log(e)
//                 res.json('error when running python script')
//             }

//         } else {
//             console.log(userAddress, feature)
//             res.json('task generation failed, please check the input format')
//         }



//     })

// }


export const createUserProfile = async () => {
    const functionName = 'createUserProfile'
    console.log(functionName + ' function is working')

    app.post('/' + functionName, async (req: any, res: any) => {
        const result: ResToFrontend = {
            status: false,
            log: '',
            data: ''
        }
        console.log('receive createUserProfile from ' + req.ip)
        console.log(req.body)
        const { accountType, userAddress } = req.body

        if (accountType && userAddress) {
            const data = req.body// { ...JSON.parse(req.body), NFTEligible: 0 }
            try {
                spawn('python', ['DB_backend/2_setup_users.py', JSON.stringify(data)])
                result.status = true
                result.log = 'createUserProfile success'
                res.json(result)
            } catch (e) {
                console.log(e)
                result.log = 'fail for createUserProfile, plz check the python script'
                res.json(result)
            }

        } else {
            console.log(accountType, userAddress)
            result.log = functionName + ' failed, please check the input format'
            res.json(result)
        }



    })

}


export const mintNFTwithCode = async () => {
    const functionName = 'mintNFTwithCode'
    console.log(functionName + ' function is working')
    app.post('/' + functionName, async (req: any, res: any) => {
        const result: ResToFrontend = {
            status: false,
            log: '',
            data: ''
        }
        console.log('receive' + functionName + ' from ' + req.ip)
        console.log(req.body)
        const { accountType, userAddress, NFTCode, feature } = req.body

        if (accountType && userAddress && NFTCode && feature) {

            try {

                const pythonProcess = spawn('python', ['DB_backend/3_1_checkNFTcode.py', NFTCode])
                pythonProcess.stdout.on('data', (data) => {
                    // console.log(`stdout: ${data}`)

                    if (data.toString().includes('The NFT code is not claimed yet')) {
                        const featureJson = JSON.stringify(
                            {
                                "feature1": feature
                            }
                        )
                        const pythonProcess2 = spawn('python', ['DB_backend/5_create_task.py', JSON.stringify({ "accountType": accountType, "userAddress": userAddress }), featureJson])
                        pythonProcess2.stdout.on('data', (data2) => {
                            console.log(`5_create_task.py stdout: ${data2}`)

                        })
                        //'{"accountType":"substrate","userAddress":"5xxx"}' '{"feature1":"ff111", "feature2":"ff12323232"}'  
                        result.status = true
                        result.log = 'the nft task has been added into SQL database, and the AI-imgae will be generated soon (absolute path can be got by /getUserAllImg)'
                        console.log('the nft task has been added into SQL database, and the AI-imgae will be generated soon (absolute path can be got by /getUserAllImg)')

                    } else {
                        result.log = 'The NFT code is not invalid'
                    }

                    res.json(result)

                })

                pythonProcess.stderr.on('data', (data) => {
                    console.error(`stderr: ${data}`);
                })

                pythonProcess.on('close', (code) => {
                    // console.log(`Child process exited with code ${code}`);
                })
                // await new Promise(r => setTimeout(r, 100))


            } catch (e) {
                console.log(e)
                res.json(result)
            }

        } else {
            console.log(accountType, userAddress)
            result.log = functionName + ' failed, please check the input format'
            res.json(result)
        }



    })

}

export const getUserAllImg = async () => {
    const functionName = 'getUserAllImg'
    console.log(functionName + ' function is working')
    app.post('/' + functionName, async (req: any, res: any) => {
        const result: ResToFrontend = {
            status: false,
            log: '',
            data: ''
        }
        console.log('receive' + functionName + ' from ' + req.ip)
        console.log(req.body)
        const { accountType, userAddress } = req.body

        if (accountType && userAddress) {

            try {


                const timestamp = Date.now()
                const filePath = 'src/output/python/9_fetchIMG_JSON' + timestamp + '.json'
                spawn('python', ['DB_backend/9_fetchIMG_JSON.py', JSON.stringify(req.body), filePath])
                await new Promise(r => setTimeout(r, 500))
                if (fs.existsSync(filePath)) {
                    const jsonString = fs.readFileSync(filePath, 'utf8')

                    result.status = true
                    const data = JSON.parse(jsonString)
                    result.data = {
                        paths: [] as string[] // Specify the type of 'paths' as an array of strings
                    }
    
                    for (const key in data) {
                        if (data.hasOwnProperty(key)) {
                            const value = (data as Record<string, any>)[key]
                            result.data.paths.push(value)
    
                        }
                    }
                    res.json(result)
                }else{
                    console.log('not found the img')
                    result.log = 'not found the img'
                    res.json(result)
                }
                

                // if (fs.existsSync(filePath)) {

                //     fs.readFile(filePath, 'utf8', (err, jsonString) => {
                //         if (err) {
                //             console.error("Error reading file:", err)
                //             result.log = 'not found the img'

                //         }
                //         result.status = true
                //         const data = JSON.parse(jsonString)
                //         result.data = {
                //             paths: [] as string[] // Specify the type of 'paths' as an array of strings
                //         }

                //         for (const key in data) {
                //             if (data.hasOwnProperty(key)) {
                //                 const value = (data as Record<string, any>)[key]
                //                 result.data.paths.push(value)

                //             }
                //         }
                //         res.json(result)
                //     })
                // }else{
                //     console.log('not found the img')
                //     result.log = 'not found the img'
                //     res.json(result)
                // }


            } catch (e) {
                console.log(e)
                result.log = functionName + ' failed, plz check the python script'
                res.json(result)
            }

        } else {
            console.log(accountType, userAddress)
            result.log = functionName + ' failed, please check the input format'
            res.json(result)
        }



    })

}
// brew services stop mysql

// curl -X POST -H "Content-Type: application/json" -d '{"accountType":"substrate","message":"i am testing", "signature":"0xb204163ca47ff05d2e8b1accb858acc10c06f6e694976cad2b5056221da67663eaaab8879b3d991cef3dab523fd7c5dc1071ad196d4351c2dab78d7f339b1b8f", "userAddress":"5Gv6J2jJSG7ZqrjKj22TsW2JgLqY5hL8oqDhBgRAcvmCxaKW"}' http://34.83.125.53:1985/verifyUserSignature

// curl -X POST -H "Content-Type: application/json" -d '{"accountType":"substrate","message":"aiweb3", "signature":"0xb2808f1a866ed5d4a80886af874d8f1de0efd4cfa6e74e6affe7e36e08cc1b107e5de13606b537cfae9c8e8f09458560db9e754a807780dec2328d4dc5f66b81", "userAddress":"5Gazt49AnPMPRNt4U2mdJydoi9EKxZNFvJ85U7v1PyJzPmY4"}' http://127.0.0.1:1985/verifyUserSignature
// curl -X POST -H "Content-Type: application/json" -d '{"userAddress":"0x345fdA96178147bF5E8cdFbfBDF723d15f2973C3","feature":{"feature1":"red hair","feature2":"red hat"}}' http://127.0.0.1:1985/generateTaskFromFrontend

// curl -X POST -H "Content-Type: application/json" -d '{"accountType":"substrate","userAddress":"56789"}' http://127.0.0.1:1985/getUserAllImg 
// curl -X POST -H "Content-Type: application/json" -d '{"accountType":"substrate","userAddress":"56789", "NFTCode":"12345"}' http://127.0.0.1:1985/checkNFTCode 
// curl -X POST -H "Content-Type: application/json" -d '{"accountType":"substrate","userAddress":"56789", "NFTCode":"abcd", "feature":"beautiful girl"}' http://127.0.0.1:1985/mintNFTwithCode 


// curl -X POST -H "Content-Type: application/json" -d '{"accountType":"substrate","userAddress":"56789", "NFTCode":"abcd", "feature":"beautiful girl"}' http://34.83.125.53:1985/mintNFTwithCode
// curl -X POST -H "Content-Type: application/json" -d '{"accountType":"substrate","userAddress":"56789", "NFTCode":"abcd", "feature":"beautiful girl"}' http://34.83.125.53:1985/getUserAllImg 
// curl -X POST -H "Content-Type: application/json" -d '{"accountType":"ethereum","userAddress":"0x1234"}' http://34.83.125.53:1985/getUserAllImg 

// python3 9_fetchIMG.py { "accountType": "ethereum","userAddress": "0x123"}