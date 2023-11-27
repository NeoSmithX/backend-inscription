// as the relay comminication between sdw and aiweb3-frontend

import { spawn } from "child_process";
import { nftMintText2Img } from "../config/aiweb3";
import { SdwInstance } from "../my_definition/class";
// const { graphqlHTTP } = require('express-graphql');
// const { buildSchema } = require('graphql');
const express = require('express');
const app = express();
app.use(express.json());
const port = 1984;


export type Task ={
    taskID:string,
    featureInput:string,
    imgPath:string,
    isCompleted:boolean
}
const taskGlobal:Task[] = []
export const fetchTaskFromSql = async () => {
    
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
                    if (taskGlobal.filter((task:Task) => task.taskID == taskID).length == 0){
                        taskGlobal.push(
                            {
                                taskID: taskID,
                                featureInput: featureInput,
                                imgPath: 'DB_backend/public/data_from_relay/'+taskID+'.png',
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
                console.log(`Child process exited with code ${code}`);
            });
        } catch (e) {
            console.log(e)
        }
        console.log('current task is: ',taskGlobal)
        await new Promise(r => setTimeout(r, 10000))
    }

    // app.post('/sdw', async (req: { body: { data: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message: string; processedData?: unknown; error?: unknown; }): void; new(): any; }; }; }) => {
    //     const data = req.body.data // Assuming data is sent in the body with key 'data'

    //     if (data && data.startsWith('mint')) {

    //         const remainingData = data.substring(4) // Remove 'mint' from the start
    //         try {
    //             const imgPath = 'src/public/output/result.png'
    //             // await sdwInstance.text2img(nftMintText2Img,remainingData,imgPath)
    //             res.status(200).json({ message: 'img is stored to '+ imgPath })
    //             // const processedData = await processData(remainingData)
    //             // res.status(200).json({ message: 'Data processed', processedData })
    //         } catch (error) {
    //             res.status(500).json({ message: 'Error processing data', error })
    //         }
    //     } else {
    //         res.status(400).json({ message: 'Invalid data' })
    //     }
    // })

    // app.listen(port, () => {
    //     console.log(`Server listening at http://localhost:${port}`)
    // })
}

export const distributeTask = async () => {
    app.post('/fetchTask', async (req: any, res: { json: (arg0: string | Task[]) => void; }) => {
        const tasks = taskGlobal.filter((task:Task) => task.isCompleted == false)
        if (tasks.length == 0){
            
            res.json('none')
            
        }else{
            res.json(tasks)
        }
        
    })
}
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Images will be stored in 'uploads' folder

export const receiveImgFromAiSide = async () => {
    app.post('/uploadImg', upload.single('image'), (req: { file: any; body: { text: string; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message: string; }): void; new(): any; }; }; }) => {
        console.log('Received file:', req.file);
        console.log('Received text:', req.body.text); // Assuming 'text' is the key for the string data
      
        res.status(200).json({ message: 'File and text received' });
        
       

        const task = taskGlobal.find((task:Task) => task.taskID == req.body.text);
        if (task) {
            req.file.toFile(task.imgPath)
            const pythonProcess = spawn('python', ['DB_backend/3_submit_task.py',task.taskID,task.imgPath]);
            task.isCompleted = true;
        }
        
      });
}
