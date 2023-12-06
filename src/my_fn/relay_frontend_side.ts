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
            const pythonProcess = spawn('python', ['DB_backend/5_fetchTask.py']);

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

export const distributeTask = async () => {
    console.log('distributeTask function is working')
    app.post('/fetchTask', async (req: any, res: { json: (arg0: string | Task[]) => void; }) => {
        const tasks = taskGlobal.filter((task: Task) => task.isCompleted == false)
        if (tasks.length == 0) {
            console.log('there is no task in sql, so reply none')
            res.json('none')

        } else {
            console.log('send task', tasks)
            res.json(tasks)
        }

    })

}

export const receiveImgFromAiSide = async () => {
    app.post('/uploadImg', upload.single('image'), (req: any, res: any) => {
        console.log('!!!!!', req)
        const taskID = req.body.taskID
        console.log('Received taskId :', taskID);

        console.log('Received file:', req.file);
        console.log('Received body:', req.body); // Assuming 'text' is the key for the string data

        res.status(200).json({ message: 'File and text received' });



        const task = taskGlobal.find((task: Task) => task.taskID == req.body.text);
        if (task) {
            const tempPath = req.file.path;
            const targetPath = path.join(__dirname, 'uploads', taskID);

            // Move and rename the file
            fs.rename(tempPath, targetPath, (err: any) => {
                if (err) return res.status(500).json({ message: 'Error saving the file' });

                res.status(200).json({ message: 'File uploaded successfully' });
            });
            const pythonProcess = spawn('python', ['DB_backend/3_submit_task.py', task.taskID, task.imgPath]);
            task.isCompleted = true;
        }

    })
    app.listen(configRelay.frontend.port, () => {
        console.log(`Server running on ` + configRelay.frontend.url + ':' + configRelay.frontend.port);
    });
}
export const receiveImgFromAiSide_v2 = async () => {
    console.log('receiveImgFromAiSide_v2 function is working')
    app.post('/uploadImg', (req: any, res: any) => {
        const { image, taskID } = req.body;




        const task = taskGlobal.find((task: Task) => task.taskID == taskID);
        if (task) {


            const imageBuffer = Buffer.from(image, 'base64');

            fs.writeFileSync(task.imgPath, imageBuffer);
            const pythonProcess = spawn('python', ['DB_backend/3_submit_task.py', task.taskID, task.imgPath]);
            task.isCompleted = true;
        }

    })
    app.listen(configRelay.frontend.port, () => {
        console.log(`Server running on ` + configRelay.frontend.url + ':' + configRelay.frontend.port);
    });
}


export const verifyUserSignature = async () => {
    const Web3 = require('web3') 
    const web3WithoutRpc = new Web3() //new Web3.providers.WebsocketProvider('wss://wss.api.moonbeam.network')
    console.log('verifyUserSignature function is working')
    app.post('/verifyUserSignature', async  (req: any, res: any) => {
        console.log('receive task from frontend', req.body)
        try{
            const { userAddress, message, signature } = req.body;

            if (userAddress && message && signature) {
                const signerAddress = await web3WithoutRpc.eth.accounts.recover(message, signature)
                if (signerAddress.toLowerCase() == userAddress.toLowerCase()) {
                    res.json('correct')
                } else {
                    
                    res.json('wrong')
                }
            }
        }catch(e){
            console.log(e)
            res.json('unknown')
        }
        


    })

}

export const generateTaskFromFrontend = async () => {
    console.log('generateTaskFromFrontend function is working')
    app.post('/generateTaskFromFrontend', (req: any, res: any) => {
        const { userAddress, feature } = req.body;

        if (userAddress && feature) {
            spawn('python', ['DB_backend/2_create_task.py', userAddress, feature]);
        }
        // "0xabcdef" "{\"feature1\":\"ff111\", \"feature2\":\"ff12323232\"}"

    })

}