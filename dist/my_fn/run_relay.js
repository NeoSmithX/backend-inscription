"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run_relay = void 0;
const commander_1 = require("commander");
const sdw_1 = require("../config/sdw");
const class_1 = require("../my_definition/class");
const relay_frontend_side_1 = require("./relay_frontend_side");
const relay_ai_side_1 = require("./relay_ai_side");
commander_1.program
    .option('--relaySide <string>', 'side: ai | frontend');
commander_1.program.parse(process.argv);
const command_input = commander_1.program.opts();
const run_relay = async () => {
    if (command_input.relaySide == 'ai') {
        const sdwInstance = new class_1.SdwInstance(sdw_1.sdwConfig);
        await sdwInstance.setModel(sdw_1.sdwConfig.model.name);
        (0, relay_ai_side_1.fetchTaskFromFrontEnd_v2)(sdwInstance);
    }
    else if (command_input.relaySide == 'frontend') {
        (0, relay_frontend_side_1.fetchTaskFromSql_v3)(); // get the task from sql
        (0, relay_frontend_side_1.distributeTask)(); // send task to the AI side
        (0, relay_frontend_side_1.receiveImgFromAiSide_v2)(); // receive the image from AI side
        (0, relay_frontend_side_1.verifyUserSignature)(); // verify the user signature of a message
        // generateTaskFromFrontend() // this is for the button minting NFT
        (0, relay_frontend_side_1.getUserAllImg)();
        (0, relay_frontend_side_1.mintNFTwithCode)();
        (0, relay_frontend_side_1.createUserProfile)();
    }
    else {
        console.log('please input --relaySide <string> wrong: ', command_input.relaySide);
        return;
    }
    console.log('starting as the relay at ' + command_input.relaySide + ' side');
};
exports.run_relay = run_relay;
//# sourceMappingURL=run_relay.js.map