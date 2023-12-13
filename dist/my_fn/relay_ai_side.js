"use strict";
// as the relay comminication between sdw and aiweb3-frontend
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchTaskFromFrontEnd_v2 = void 0;
const aiweb3_1 = require("../config/aiweb3");
const general_1 = require("../config/general");
const fs = __importStar(require("fs"));
// const { graphqlHTTP } = require('express-graphql');
// const { buildSchema } = require('graphql');
const express = require('express');
const app = express();
app.use(express.json());
// Enable CORS for all routes
const cors = require('cors');
app.use(cors());
const fetchTaskFromFrontEnd_v2 = async (sdwInstance) => {
    while (true) {
        try {
            // get task
            const relayFrontEndUrl = general_1.configRelay.frontend.url + ':' + general_1.configRelay.frontend.port;
            const response = await fetch(relayFrontEndUrl + '/fetchTask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            // console.log(data)
            if (data == 'none') {
                // console.log('no task')
                await new Promise(r => setTimeout(r, 1000));
                continue;
            }
            const taskArray = data;
            for (const task of taskArray) {
                const taskID = task.taskID;
                const promptAdd = task.featureInput;
                // const imgPath = 'src/public/output/ai_side/'+taskID+'.png'
                const imgPath = 'src/output/ai_side/' + 'image' + '.png';
                // const path = require('path')
                // console.log('imgPath: ',imgPath)
                await sdwInstance.text2img(aiweb3_1.nftMintText2Img, promptAdd, imgPath); //skip for test
                await new Promise(r => setTimeout(r, 100));
                // const formData = new FormData()
                const imageBuffer = fs.readFileSync(imgPath);
                const imageBase64 = imageBuffer.toString('base64');
                const data = JSON.stringify({
                    image: imageBase64,
                    taskID: taskID
                });
                console.log('Total payload size:', Buffer.byteLength(data, 'utf-8'));
                // console.log('data: ',data)
                fetch(relayFrontEndUrl + '/uploadImg', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: data
                })
                    .then(response => response.json())
                    .then(data => console.log(data))
                    .catch(error => console.error('Error:', error));
            }
        }
        catch (e) {
            console.log('fetchTaskFromRelay error: ', e);
        }
        await new Promise(r => setTimeout(r, 1000));
    }
};
exports.fetchTaskFromFrontEnd_v2 = fetchTaskFromFrontEnd_v2;
//# sourceMappingURL=relay_ai_side.js.map