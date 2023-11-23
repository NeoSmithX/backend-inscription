"use strict";
// as the relay comminication between sdw and aiweb3-frontend
Object.defineProperty(exports, "__esModule", { value: true });
exports.listenAiweb3Frontend = void 0;
const express = require('express');
const app = express();
const port = 1984;
const listenAiweb3Frontend = async (sdwInstance) => {
    app.get('/', (req, res) => {
        res.send('Hello World!');
    });
    app.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}`);
    });
};
exports.listenAiweb3Frontend = listenAiweb3Frontend;
//# sourceMappingURL=relay.js.map