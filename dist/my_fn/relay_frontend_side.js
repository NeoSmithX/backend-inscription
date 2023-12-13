"use strict";
// as the relay comminication between sdw and aiweb3-frontend
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserAllImg = exports.mintNFTwithCode = exports.createUserProfile = exports.generateTaskFromFrontend = exports.verifyUserSignature = exports.receiveImgFromAiSide_v2 = exports.distributeTask = exports.fetchTaskFromSql_v3 = void 0;
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const general_1 = require("../config/general");
// const { graphqlHTTP } = require('express-graphql');
// const { buildSchema } = require('graphql');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
// app.use(express.json());
// Configure body-parser for larger payloads
// app.use(bodyParser.json({ limit: '50mb' })); // Adjust the limit as needed
// app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// Enable CORS for all routes
const cors = require('cors');
app.use(cors());
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Images will be stored in 'uploads' folder
// const fs = require('fs');
const path = require('path');
const taskGlobal = [];
const fetchTaskFromSql_v3 = async () => {
    console.log('fetchTaskFromSql function is working');
    while (true) {
        try {
            const filePath = 'src/output/python/8_fetchTask_JSON.json';
            (0, child_process_1.spawn)('python', ['DB_backend/8_fetchTask_JSON.py', filePath]);
            await new Promise(r => setTimeout(r, 100));
            fs_1.default.readFile(filePath, 'utf8', (err, jsonString) => {
                if (err) {
                    console.error("Error reading file:", err);
                    return;
                }
                try {
                    const data = JSON.parse(jsonString);
                    for (const key in data) {
                        const value = data[key];
                        const taskID = value.taskID;
                        const userID = value.userID;
                        const features = JSON.parse(value.features);
                        let featureInput = '';
                        for (const [key, value] of Object.entries(features)) {
                            // console.log(`${key}: ${value}`);
                            featureInput = featureInput + value + ',';
                        }
                        // console.log('featureInput:', featureInput)
                        if (taskGlobal.filter((task) => task.taskID == taskID).length == 0) {
                            taskGlobal.push({
                                taskID: taskID,
                                featureInput: featureInput,
                                imgPath: 'DB_backend/public/data_from_relay/' + taskID + '.png',
                                isCompleted: false
                            });
                            // console.log('imcompleted task:',taskGlobal)
                        }
                    }
                    // console.log(data);
                }
                catch (err) {
                    console.error("Error parsing JSON:", err);
                }
            });
        }
        catch (e) {
            console.log(e);
        }
        // console.log('current task is: ', taskGlobal)
        await new Promise(r => setTimeout(r, 10000));
    }
};
exports.fetchTaskFromSql_v3 = fetchTaskFromSql_v3;
const distributeTask = async () => {
    console.log('distributeTask function is working');
    app.post('/fetchTask', async (req, res) => {
        const tasks = taskGlobal.filter((task) => task.isCompleted == false);
        if (tasks.length == 0) {
            // console.log('there is no task in sql, so reply none')
            res.json('none');
        }
        else {
            console.log('send task', tasks);
            res.json(tasks);
        }
    });
};
exports.distributeTask = distributeTask;
const receiveImgFromAiSide_v2 = async () => {
    console.log('receiveImgFromAiSide_v2 function is working');
    app.post('/uploadImg', (req, res) => {
        const { image, taskID } = req.body;
        const task = taskGlobal.find((task) => task.taskID == taskID);
        if (task) {
            const imageBuffer = Buffer.from(image, 'base64');
            fs_1.default.writeFileSync(task.imgPath, imageBuffer);
            const pythonProcess = (0, child_process_1.spawn)('python', ['DB_backend/6_submit_task.py', task.taskID, task.imgPath]);
            task.isCompleted = true;
        }
    });
    app.listen(general_1.configRelay.frontend.port, () => {
        console.log(`Server running on ` + general_1.configRelay.frontend.url + ':' + general_1.configRelay.frontend.port);
    });
};
exports.receiveImgFromAiSide_v2 = receiveImgFromAiSide_v2;
const util_1 = require("@polkadot/util");
const util_crypto_1 = require("@polkadot/util-crypto");
const verifyUserSignature = async () => {
    const Web3 = require('web3');
    const web3WithoutRpc = new Web3(); //new Web3.providers.WebsocketProvider('wss://wss.api.moonbeam.network')
    // const { signatureVerify } = require('@polkadot/util-crypto')
    console.log('verifyUserSignature function is working');
    app.post('/verifyUserSignature', async (req, res) => {
        console.log('receive verifyUserSignature from from ' + req.ip);
        console.log(req.body);
        try {
            const { userAddress, message, signature, accountType } = req.body;
            if (userAddress && message && signature && accountType) {
                switch (accountType) {
                    case 'evm': {
                        const signerAddress = await web3WithoutRpc.eth.accounts.recover(message, signature);
                        if (signerAddress.toLowerCase() == userAddress.toLowerCase()) {
                            console.log('signature is : ', 'correct');
                            res.json('correct');
                        }
                        else {
                            console.log('signature is : ', 'wrong');
                            res.json('wrong');
                        }
                        break;
                    }
                    case 'substrate': {
                        const messageU8a = (0, util_1.stringToU8a)(message);
                        // console.log('messageU8a',messageU8a)
                        const isValidSignature = (0, util_crypto_1.signatureVerify)(messageU8a, signature, userAddress).isValid;
                        console.log('signature is : ', isValidSignature);
                        if (isValidSignature) {
                            res.json('correct');
                        }
                        else {
                            res.json('wrong');
                        }
                        break;
                    }
                    default: {
                        console.log('unknown accountType');
                        res.json('unknown accountType');
                    }
                }
            }
        }
        catch (e) {
            console.log(e);
            res.json('unknown issue: some format error for the input');
        }
    });
};
exports.verifyUserSignature = verifyUserSignature;
const generateTaskFromFrontend = async () => {
    console.log('generateTaskFromFrontend function is working');
    app.post('/generateTaskFromFrontend', async (req, res) => {
        console.log('receive generateTaskFromFrontend from ' + req.ip);
        console.log(req.body);
        const { userAddress, feature } = req.body;
        if (userAddress && feature) {
            try {
                (0, child_process_1.spawn)('python', ['DB_backend/5_create_task.py', userAddress, JSON.stringify(feature)]);
                console.log('the nft task has been added into SQL database, and the AI-imgae will be generated soon (absolute path will be added in the next test');
                res.json('the nft task has been added into SQL database, and the AI-imgae will be generated soon (absolute path will be added in the next test)');
            }
            catch (e) {
                console.log(e);
                res.json('error when running python script');
            }
        }
        else {
            console.log(userAddress, feature);
            res.json('task generation failed, please check the input format');
        }
    });
};
exports.generateTaskFromFrontend = generateTaskFromFrontend;
const createUserProfile = async () => {
    console.log('createUserProfile function is working');
    app.post('/createUserProfile', async (req, res) => {
        console.log('receive createUserProfile from ' + req.ip);
        console.log(req.body);
        const { accountType, userAddress } = req.body;
        if (accountType && userAddress) {
            const data = { ...JSON.parse(req.body), NFTEligible: 0 };
            try {
                (0, child_process_1.spawn)('python', ['DB_backend/2_setup_users.py', JSON.stringify(data)]);
                res.json('success for createUserProfile');
            }
            catch (e) {
                console.log(e);
                res.json('fail for createUserProfile');
            }
        }
        else {
            console.log(accountType, userAddress);
            res.json('createUserProfile failed, please check the input format');
        }
    });
};
exports.createUserProfile = createUserProfile;
const mintNFTwithCode = async () => {
    const functionName = 'mintNFTwithCode';
    console.log(functionName + ' function is working');
    app.post('/' + functionName, async (req, res) => {
        console.log('receive' + functionName + ' from ' + req.ip);
        console.log(req.body);
        const { accountType, userAddress, NFTCode, feature } = req.body;
        if (accountType && userAddress && NFTCode && feature) {
            try {
                const pythonProcess = (0, child_process_1.spawn)('python', ['DB_backend/3_1_checkNFTcode.py', NFTCode]);
                pythonProcess.stdout.on('data', (data) => {
                    // console.log(`stdout: ${data}`)
                    if (data.toString().includes('The NFT code is not claimed yet')) {
                        const featureJson = JSON.stringify({
                            "feature1": feature
                        });
                        const pythonProcess2 = (0, child_process_1.spawn)('python', ['DB_backend/5_create_task.py', JSON.stringify({ "accountType": accountType, "userAddress": userAddress }), featureJson]);
                        pythonProcess2.stdout.on('data', (data2) => {
                            console.log(`5_create_task.py stdout: ${data2}`);
                        });
                        //'{"accountType":"substrate","userAddress":"5xxx"}' '{"feature1":"ff111", "feature2":"ff12323232"}'  
                        console.log('the nft task has been added into SQL database, and the AI-imgae will be generated soon (absolute path can be got by /getUserAllImg)');
                        res.json('the nft task has been added into SQL database, and the AI-imgae will be generated soon (absolute path can be got by /getUserAllImg)');
                    }
                    else {
                        res.json('The NFT code is not invalid');
                        return;
                    }
                });
                pythonProcess.stderr.on('data', (data) => {
                    console.error(`stderr: ${data}`);
                });
                pythonProcess.on('close', (code) => {
                    // console.log(`Child process exited with code ${code}`);
                });
                // await new Promise(r => setTimeout(r, 100))
            }
            catch (e) {
                console.log(e);
                res.json('fail for ' + functionName);
            }
        }
        else {
            console.log(accountType, userAddress);
            res.json(functionName + ' failed, please check the input format');
        }
    });
};
exports.mintNFTwithCode = mintNFTwithCode;
const getUserAllImg = async () => {
    const functionName = 'getUserAllImg';
    console.log(functionName + ' function is working');
    app.post('/' + functionName, async (req, res) => {
        console.log('receive' + functionName + ' from ' + req.ip);
        console.log(req.body);
        const { accountType, userAddress } = req.body;
        if (accountType && userAddress) {
            try {
                const filePath = 'src/output/python/9_fetchIMG_JSON.json';
                (0, child_process_1.spawn)('python', ['DB_backend/9_fetchIMG_JSON.py', JSON.stringify(req.body), filePath]);
                await new Promise(r => setTimeout(r, 100));
                fs_1.default.readFile(filePath, 'utf8', (err, jsonString) => {
                    if (err) {
                        console.error("Error reading file:", err);
                        res.json('not found the img');
                        return;
                    }
                    const data = JSON.parse(jsonString);
                    let imgPath = {
                        paths: [] // Specify the type of 'paths' as an array of strings
                    };
                    for (const key in data) {
                        if (data.hasOwnProperty(key)) {
                            const value = data[key];
                            imgPath.paths.push(value);
                        }
                    }
                    res.json(JSON.stringify(imgPath));
                    return;
                });
            }
            catch (e) {
                console.log(e);
                res.json('fail for ' + functionName);
            }
        }
        else {
            console.log(accountType, userAddress);
            res.json(functionName + ' failed, please check the input format');
        }
    });
};
exports.getUserAllImg = getUserAllImg;
// brew services stop mysql
// curl -X POST -H "Content-Type: application/json" -d '{"accountType":"substrate","message":"i am testing", "signature":"0xb204163ca47ff05d2e8b1accb858acc10c06f6e694976cad2b5056221da67663eaaab8879b3d991cef3dab523fd7c5dc1071ad196d4351c2dab78d7f339b1b8f", "userAddress":"5Gv6J2jJSG7ZqrjKj22TsW2JgLqY5hL8oqDhBgRAcvmCxaKW"}' http://34.83.125.53:1985/verifyUserSignature
// curl -X POST -H "Content-Type: application/json" -d '{"accountType":"substrate","message":"aiweb3", "signature":"0xb2808f1a866ed5d4a80886af874d8f1de0efd4cfa6e74e6affe7e36e08cc1b107e5de13606b537cfae9c8e8f09458560db9e754a807780dec2328d4dc5f66b81", "userAddress":"5Gazt49AnPMPRNt4U2mdJydoi9EKxZNFvJ85U7v1PyJzPmY4"}' http://127.0.0.1:1985/verifyUserSignature
// curl -X POST -H "Content-Type: application/json" -d '{"userAddress":"0x345fdA96178147bF5E8cdFbfBDF723d15f2973C3","feature":{"feature1":"red hair","feature2":"red hat"}}' http://127.0.0.1:1985/generateTaskFromFrontend
// curl -X POST -H "Content-Type: application/json" -d '{"accountType":"substrate","userAddress":"56789"}' http://127.0.0.1:1985/getUserAllImg 
// curl -X POST -H "Content-Type: application/json" -d '{"accountType":"substrate","userAddress":"56789", "NFTCode":"12345"}' http://127.0.0.1:1985/checkNFTCode 
// curl -X POST -H "Content-Type: application/json" -d '{"accountType":"substrate","userAddress":"56789", "NFTCode":"abcd", "feature":"beautiful girl"}' http://127.0.0.1:1985/mintNFTwithCode 
// curl -X POST -H "Content-Type: application/json" -d '{"accountType":"substrate","userAddress":"56789", "NFTCode":"abcd", "feature":"beautiful girl"}' http://34.83.125.53:1985/mintNFTwithCode
// curl -X POST -H "Content-Type: application/json" -d '{"accountType":"substrate","userAddress":"56789", "NFTCode":"abcd", "feature":"beautiful girl"}' http://34.83.125.53:1985/getUserAllImg 
//# sourceMappingURL=relay_frontend_side.js.map