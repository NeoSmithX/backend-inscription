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



export const fetchTaskFromSql = async () => {

    while (true) {
        try {
            const pythonProcess = spawn('python', ['DB_backend/3_submit_task.py']);

            pythonProcess.stdout.on('data', (data) => {
                console.log(`stdout: ${data}`);
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