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



export const fetchTaskFromFrontEnd = async (sdwInstance: SdwInstance) => {
    while (true){
        try{
            // get task
            const relayFrontEndUrl = configRelay.frontend.url + ':' + configRelay.frontend.port 
            const response = await fetch(relayFrontEndUrl + '/fetchTask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
           
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
                // const imgPath = 'src/public/output/ai_side/'+taskID+'.png'
                const imgPath = 'src/public/output/ai_side/'+'image'+'.png'
                // await sdwInstance.text2img(nftMintText2Img,promptAdd,imgPath)  //skip for test

                await new Promise(r => setTimeout(r, 500))
                const formData = new FormData();

         

                // Append the file to the form data
                // 'image' is the field name that the server expects for the uploaded file
                formData.append('image', fs.createReadStream(imgPath));
                // console.log(imgPath)
                // Append any additional data if necessary
                formData.append('taskID', taskID);
                const headers = formData.getHeaders()
                fetch(relayFrontEndUrl + '/uploadImg', {
                    method: 'POST',
                    body: formData as any, // Cast formData to any
                    headers: headers
                })
                .then(response => response.json())
                .then(data => console.log(data))
                .catch(error => console.error('Error:', error));
                // try {
                //     const response = await fetch(relayFrontEndUrl+'/uploadImg', {
                //         method: 'POST',
                //         body: formData as any,
                //         headers: headers
                //         // Headers will be automatically set by the `form-data` library
                //     })
                //     console.log('try to upload img to frontend')
                //     // const data = await response.json();
                //     // console.log(data);
                // } catch (error) {
                //     console.error('Upload failed:', error);
                // }

            }
            
        }catch(e){
            console.log('fetchTaskFromRelay error: ',e)
        }

        await new Promise(r => setTimeout(r, 1000)) 

    }
   
}