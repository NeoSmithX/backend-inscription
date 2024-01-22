// as the relay comminication between sdw and aiweb3-frontend
import { ResToFrontend } from "../my_definition/type";
import { spawn } from "child_process";
import fs from 'fs'
import {network_config} from '../config/general'
import * as subscan_inscription from './subscan/inscription'
import * as sql_quest from './database/quest'
const express = require('express');
const bodyParser = require('body-parser')
const app = express();

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

const response_default: ResToFrontend = {
    status: false,
    log: 'default return',
    data: {}
}

export const listen = async()=>{
    app.listen(network_config.port, () => {
        console.log(`Server running on ` + network_config.url + ':' + network_config.port);
    })
}


export const query_quest_winner = async () => {
    console.log('query_quest_winner function is working')
    let resposne = JSON.parse(JSON.stringify(response_default))
    app.post('/query_quest_winner', async (req: any, res: any) => {
        const { network, hash, correct_answer, winner_num } = req.body;

        if (network && hash && correct_answer && winner_num) {
            const result = await subscan_inscription.quest_winner(network, hash, correct_answer, winner_num)
            if (result.status){
                resposne.status = true
                resposne.log = 'succeed to find the winner'
                resposne.data = {
                    winner_list:result.winner_list
                }
                console.log('result.winner_list',result.winner_list)
            }else{
                resposne.log = 'failed to find the winner'
            }
           
        }else{
            resposne.log = 'network && hash && correctAnswer is required'
        }

        res.json(resposne)
       

    })
  
}
// curl -X POST http://localhost:1986/query_quest_winner -H "Content-Type: application/json" -d '{"network":"astar","hash": "0xf040dbca95abd9fdc1062a7fc3c9c0212d31970ce01e5dbc343a25edd6da4266", "correct_answer": "hello world","winner_num":"2"}'
export const record_after_deploy_question = async () => {
    console.log('record_after_deploy_question function is working')
    let resposne = JSON.parse(JSON.stringify(response_default))
    app.post('/record_after_deploy_question', async (req: any, res: any) => {
        const { network, space, question_ID, question, deploy_hash } = req.body;

        if (network && space && question_ID && question && deploy_hash) {
            const result_write = await sql_quest.write_quest(
                [{
                    network:network,
                    space:space,
                    question_ID:question_ID,
                    question:question,
                    deploy_hash:deploy_hash
                }]
            )
            if (result_write){
                resposne.status = true
                resposne.log = 'succeed to write the question to database'
            }
            
            
           
        }else{
            resposne.log = 'network && space && question_ID && question && deploy_hash is required'
        }

        res.json(resposne)
       

    })
}