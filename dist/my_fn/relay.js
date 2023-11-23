"use strict";
// as the relay comminication between sdw and aiweb3-frontend
Object.defineProperty(exports, "__esModule", { value: true });
exports.listenAiweb3Frontend = void 0;
const aiweb3_1 = require("../config/aiweb3");
// const { graphqlHTTP } = require('express-graphql');
// const { buildSchema } = require('graphql');
const express = require('express');
const app = express();
app.use(express.json());
const port = 1984;
async function processData(data) {
    // Your async processing logic here
    console.log("Processing:", data);
    // Example of an async operation
    return new Promise(resolve => setTimeout(() => resolve(data), 1000));
}
const listenAiweb3Frontend = async (sdwInstance) => {
    // app.get('/', (req: any, res: { send: (arg0: string) => void; }) => {
    //     res.send('Hello World!');
    // })
    app.post('/sdw', async (req, res) => {
        const data = req.body.data; // Assuming data is sent in the body with key 'data'
        if (data && data.startsWith('mint')) {
            const remainingData = data.substring(4); // Remove 'mint' from the start
            try {
                const imgPath = 'src/public/output/result.png';
                await sdwInstance.text2img(aiweb3_1.nftMintText2Img, remainingData, imgPath);
                res.status(200).json({ message: 'img is stored to ' + imgPath });
                // const processedData = await processData(remainingData)
                // res.status(200).json({ message: 'Data processed', processedData })
            }
            catch (error) {
                res.status(500).json({ message: 'Error processing data', error });
            }
        }
        else {
            res.status(400).json({ message: 'Invalid data' });
        }
    });
    app.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}`);
    });
};
exports.listenAiweb3Frontend = listenAiweb3Frontend;
//test
// curl -X POST http://localhost:1984/sdw -H "Content-Type: application/json" -d '{"data": "mint girl, cute, rabbit"}'
//# sourceMappingURL=relay.js.map