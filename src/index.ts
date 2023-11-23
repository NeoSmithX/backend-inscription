import { sdwConfig } from "./config/sdw";
import { SdwInstance } from "./my_definition/class";
import { listenAiweb3Frontend } from "./my_fn/relay";


async function main() {
    
    const sdwInstance = new SdwInstance(sdwConfig)
    await sdwInstance.setModel(sdwConfig.model.name)

    listenAiweb3Frontend(sdwInstance)
}

main().then(() => {
    console.log('starting as the relay between sdw and aiweb3-frontend');
});