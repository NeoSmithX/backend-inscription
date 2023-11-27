// as the relay comminication between sdw and aiweb3-frontend

import { nftMintText2Img } from "../config/aiweb3";
import { configRelay } from "../config/general";
import { SdwInstance } from "../my_definition/class";
import * as fs from 'fs';
import FormData from 'form-data'
import { Task } from "./relay_frontend_side";
// const { graphqlHTTP } = require('express-graphql');
// const { buildSchema } = require('graphql');
const express = require('express');
const app = express();
app.use(express.json());
const port = 1984;
async function processData(data: any) {
    // Your async processing logic here
    console.log("Processing:", data);
    // Example of an async operation
    await new Promise(r => setTimeout(r, 1000)) 
}
export const listenAiweb3Frontend = async (sdwInstance: SdwInstance) => {
    // app.get('/', (req: any, res: { send: (arg0: string) => void; }) => {
    //     res.send('Hello World!');
    // })
    app.post('/sdw', async (req: { body: { data: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message: string; processedData?: unknown; error?: unknown; }): void; new(): any; }; }; }) => {
        const data = req.body.data // Assuming data is sent in the body with key 'data'

        if (data && data.startsWith('mint')) {
        
            const remainingData = data.substring(4) // Remove 'mint' from the start
            try {
                const imgPath = 'src/public/output/result.png'
                await sdwInstance.text2img(nftMintText2Img,remainingData,imgPath)
                res.status(200).json({ message: 'img is stored to '+ imgPath })
                // const processedData = await processData(remainingData)
                // res.status(200).json({ message: 'Data processed', processedData })
            } catch (error) {
                res.status(500).json({ message: 'Error processing data', error })
            }
        } else {
            res.status(400).json({ message: 'Invalid data' })
        }
    })

    app.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}`)
    })
}
//test
// curl -X POST http://localhost:1984/sdw -H "Content-Type: application/json" -d '{"data": "mint girl, cute, rabbit"}'

export const fetchTaskFromFrontEnd = async (sdwInstance: SdwInstance) => {
    while (true){
        try{
            // get task
            const relayFrontEndUrl = configRelay.frontend.url + ':' + configRelay.frontend.port 
            const response = await fetch(relayFrontEndUrl+'/fetchTask')
            const data = await response.json()
            console.log(data)
            if (data == 'none'){
                console.log('no task')
                await new Promise(r => setTimeout(r, 1000)) 
                continue
            }
            const taskArray:Task[] = data
            for (const task of taskArray){
                const taskID = task.taskID
                const promptAdd = task.featureInput
                const imgPath = 'src/public/output/ai_side/'+taskID+'.png'
                await sdwInstance.text2img(nftMintText2Img,promptAdd,imgPath)
                await new Promise(r => setTimeout(r, 500))
                const formData = new FormData();

         

                // Append the file to the form data
                // 'image' is the field name that the server expects for the uploaded file
                formData.append('image', fs.createReadStream(imgPath));
            
                // Append any additional data if necessary
                formData.append('text', taskID);
            
                try {
                    const response = await fetch(relayFrontEndUrl+'/uploadImg', {
                        method: 'POST',
                        body: formData as any,
                        // Headers will be automatically set by the `form-data` library
                    });
                    const data = await response.json();
                    console.log(data);
                } catch (error) {
                    console.error('Upload failed:', error);
                }

            }
            
        }catch(e){
            console.log('fetchTaskFromRelay error: ',e)
        }

        await new Promise(r => setTimeout(r, 1000)) 

    }
    app.post('/sdw', async (req: { body: { data: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message: string; processedData?: unknown; error?: unknown; }): void; new(): any; }; }; }) => {
        const data = req.body.data // Assuming data is sent in the body with key 'data'

        if (data && data.startsWith('mint')) {
        
            const remainingData = data.substring(4) // Remove 'mint' from the start
            try {
                const imgPath = 'src/public/output/result.png'
                
                res.status(200).json({ message: 'img is stored to '+ imgPath })
                // const processedData = await processData(remainingData)
                // res.status(200).json({ message: 'Data processed', processedData })
            } catch (error) {
                res.status(500).json({ message: 'Error processing data', error })
            }
        } else {
            res.status(400).json({ message: 'Invalid data' })
        }
    })

    app.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}`)
    })
}