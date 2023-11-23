"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sdw_1 = require("./config/sdw");
const class_1 = require("./my_definition/class");
const relay_1 = require("./my_fn/relay");
async function main() {
    const sdwInstance = new class_1.SdwInstance(sdw_1.sdwConfig);
    await sdwInstance.setModel(sdw_1.sdwConfig.model.name);
    (0, relay_1.listenAiweb3Frontend)(sdwInstance);
}
main().then(() => {
    console.log('starting as the relay between sdw and aiweb3-frontend');
});
//# sourceMappingURL=index.js.map