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
// Enable CORS for all routes
const cors = require('cors');
app.use(cors());



export const fetchTaskFromFrontEnd_v2 = async (sdwInstance: SdwInstance) => {
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
            // console.log(data)
            if (data == 'none'){
                // console.log('no task')
                await new Promise(r => setTimeout(r, 1000)) 
                continue
            }
            const taskArray:Task[] = data
            for (const task of taskArray){
                const taskID = task.taskID
                const promptAdd = task.featureInput
                // const imgPath = 'src/public/output/ai_side/'+taskID+'.png'
                const imgPath = 'src/output/ai_side/'+'image'+'.png'  
                // const path = require('path')
                // console.log('imgPath: ',imgPath)
                await sdwInstance.text2img(nftMintText2Img,promptAdd,imgPath)  //skip for test
                await new Promise(r => setTimeout(r, 100))
                // const formData = new FormData()
                const imageBuffer = fs.readFileSync(imgPath);
                const imageBase64 = imageBuffer.toString('base64')
     
                const data = JSON.stringify({
                    image: imageBase64,
                    taskID: taskID
                });
                console.log('Total payload size:', Buffer.byteLength(data, 'utf-8'));
                // console.log('data: ',data)
                fetch(relayFrontEndUrl+'/uploadImg', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: data
                })
                .then(response => response.json())
                .then(data => console.log(data))
                .catch(error => console.error('Error:', error));

             
            }
            
        }catch(e){
            console.log('fetchTaskFromRelay error: ',e)
        }

        await new Promise(r => setTimeout(r, 1000)) 

    }
   
}