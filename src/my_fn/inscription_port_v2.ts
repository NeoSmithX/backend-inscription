// as the relay comminication between sdw and aiweb3-frontend
import { ResToFrontend } from "../my_definition/type";
import { spawn } from "child_process";
import fs from 'fs'
import {network_config} from '../config/general'
// import * as subscan_inscription from './subscan/inscription'
import * as subscan_inscription from './subscan/inscription_v2'
// import * as sql_quest from './database/quest'
import * as supabase from './supabase/init'
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




export const create_quest_in_database = async () => { // only for test
    console.log('create_quest_in_database function is working')
    let resposne = JSON.parse(JSON.stringify(response_default))
    app.post('/create_quest_in_database', async (req: any, res: any) => {
        const { network, space, question_ID, question, deploy_hash } = req.body;

        if (network && space && question_ID && question && deploy_hash) {
            // const result_write = await supabase.create_data()
            const result_create = supabase.create_data(
                'aiweb3-party',
                {
                    network:network,
                    space:space,
                    question_ID:question_ID,
                    question:question,
                    deploy_hash:deploy_hash
                }
            )

            // sql_quest.write_quest(
            //     {
            //         network:network,
            //         space:space,
            //         question_ID:question_ID,
            //         question:question,
            //         deploy_hash:deploy_hash
            //     }
            // )
            // if (result_create){
            //     resposne.status = true
            //     resposne.log = 'succeed to write the question to database'
            // }
            
            
           
        }else{
            resposne.log = 'network && space && question_ID && question && deploy_hash is required'
        }

        res.json(resposne)
       

    })

}



export const subscribe_task = async () => {
    console.log('subscribe_task function is working')
    while (true){

        const result_fetch_data = await supabase.fetch_data(
            'aiweb3-party',
            {
                // network:network,
                // space:space,
                // question_ID:question_ID
            }
        )
        if (!result_fetch_data.data){
            console.log('failed to read the question from database',result_fetch_data)
            return
        }
        for (let data of result_fetch_data.data){
            if (data.task_to_be_complete ){
                if (data.correct_answer && data.winner_num){
                    console.log('find to-be-complete task')
                    const result_quest_winner = await subscan_inscription.quest_winner(data.network, data.deploy_hash as string, data.correct_answer, data.winner_num)
                    if (!result_quest_winner.status){
                        console.log('failed to find the winner')
                        continue
                    }
                    const result_update_data = await supabase.update_data(
                        'aiweb3-party',
                        {
                            network:data.network,
                            space:data.space,
                            question_ID:data.question_ID,
                            question:data.question,
                            deploy_hash:data.deploy_hash,
                            correct_answer:data.correct_answer,
                            winner_num:data.winner_num,
                            winner_list:result_quest_winner.winner_list,
                            task_to_be_complete:false
                        }
                    )
                    if (!result_update_data.error){
                        console.log('succeed to create the winner')
                      
                        console.log('result.winner_list',result_quest_winner.winner_list)
                        
                    }else{
                        console.log('failed to store the winner list to database') 
                    }
                }
                
                
            }
        }

        
        // 5 second
        await new Promise(resolve => setTimeout(resolve, 5000))
        
    }


}

export const create_quest_winner = async () => {
    console.log('create_quest_winner function is working')
    let resposne = JSON.parse(JSON.stringify(response_default))
    app.post('/create_quest_winner', async (req: any, res: any) => {
        const { network, space, question_ID,correct_answer, winner_num } = req.body;
        
        if (network && space && question_ID && correct_answer && winner_num) {
            const result_wrap = await supabase.fetch_data(
                'aiweb3-party',
                {
                    network:network,
                    space:space,
                    question_ID:question_ID
                }
            )
            if (!result_wrap.data){
                console.log('failed to read the question from database',result_wrap)
                return
            }
            const result_read = result_wrap.data[0]
           
            // if (result_read.data)
            // sql_quest.read_quest(             
            //     network,
            //     space,
            //     question_ID
            // ) 
            if (!result_read){
                return
            }
            const result = await subscan_inscription.quest_winner(network, result_read.deploy_hash as string, correct_answer, winner_num)
            if (result.status){
                resposne.status = true
                resposne.log = 'succeed to create the winner, where the winner list has been written to the database. If u wanna fetch the winner list in future, plz use api /read_quest_from_database'
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



export const read_quest_information_from_database = async () => {
    console.log('read_quest_information_from_database function is working')
    let resposne = JSON.parse(JSON.stringify(response_default))
    app.post('/read_quest_information_from_database', async (req: any, res: any) => {
        const { network, space, question_ID} = req.body;

        if (network && space && question_ID ) {
            const result_wrap = await supabase.fetch_data(
                'aiweb3-party',
                {
                    network:network,
                    space:space,
                    question_ID:question_ID
                }
            )
            if (!result_wrap.data){
                console.log('failed to read the question from database',result_wrap)
                return
            }
            const result_read = result_wrap.data[0]
            
            if (result_read){
                resposne.status = true
                resposne.log = 'succeed to read the winner list from database'
                resposne.data = result_read
                
            }else{
                resposne.log = 'failed to read the winner list from database'
            }
            
            
           
        }else{
            resposne.log = 'network && space && question_ID && question && deploy_hash is required'
        }

        res.json(resposne)
       

    })
}

// curl -X POST http://34.29.167.120:1986/create_quest_in_database -H "Content-Type: application/json" -d '{"network":"astar","space": "test","question_ID":"1","question":"just for test","deploy_hash":"0xf040dbca95abd9fdc1062a7fc3c9c0212d31970ce01e5dbc343a25edd6da4266"}'
// curl -X POST http://34.29.167.120:1986/create_quest_winner -H "Content-Type: application/json" -d '{"network":"astar","space": "test","question_ID":"1", "correct_answer": "hello world","winner_num":"2"}'
// curl -X POST http://34.29.167.120:1986/read_quest_information_from_database -H "Content-Type: application/json" -d '{"network":"astar","space":"test", "question_ID": "1"}'


// curl -X POST http://127.0.0.1:1986/create_quest_in_database -H "Content-Type: application/json" -d '{"network":"astar","space": "test","question_ID":"1","question":"just for test","deploy_hash":"0xf040dbca95abd9fdc1062a7fc3c9c0212d31970ce01e5dbc343a25edd6da4266"}'
// curl -X POST http://127.0.0.1:1986/create_quest_winner -H "Content-Type: application/json" -d '{"network":"astar","space": "test","question_ID":"1", "correct_answer": "hello world","winner_num":"2"}'
// curl -X POST http://127.0.0.1:1986/read_quest_information_from_database -H "Content-Type: application/json" -d '{"network":"astar","space":"test", "question_ID": "1"}'