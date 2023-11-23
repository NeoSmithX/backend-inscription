// as the relay comminication between sdw and aiweb3-frontend

import { SdwInstance } from "../my_definition/class";

const express = require('express');
const app = express();
const port = 1984;
export const listenAiweb3Frontend = async (sdwInstance: SdwInstance) => {
    app.get('/', (req: any, res: { send: (arg0: string) => void; }) => {
        res.send('Hello World!');
    })

    app.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}`);
    })
}