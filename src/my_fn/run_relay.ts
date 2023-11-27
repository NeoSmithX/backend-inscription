import { program } from "commander"
import { sdwConfig } from "../config/sdw"
import { SdwInstance } from "../my_definition/class"

import { distributeTask, fetchTaskFromSql, receiveImgFromAiSide } from "./relay_frontend_side"
import { fetchTaskFromFrontEnd } from "./relay_ai_side"


program
    .option('--relaySide <string>', 'side: ai | frontend')
program.parse(process.argv)

const command_input = program.opts()
export const run_relay = async () => {
    if (command_input.relaySide == 'ai') {
        const sdwInstance = new SdwInstance(sdwConfig)
        await sdwInstance.setModel(sdwConfig.model.name)
    
        fetchTaskFromFrontEnd(sdwInstance)

        
    }else if (command_input.relaySide == 'frontend') {

        fetchTaskFromSql()
        distributeTask()
        receiveImgFromAiSide()
        // wait Dr Cao provide the API for frontend SQL
    }else{
        console.log('please input --relaySide <string> wrong: ',command_input.relaySide)
        return
    }
    console.log('starting as the relay at '+ command_input.relaySide + ' side')
}

