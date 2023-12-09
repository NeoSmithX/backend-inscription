import { program } from "commander"
import { sdwConfig } from "../config/sdw"
import { SdwInstance } from "../my_definition/class"

import { distributeTask, fetchTaskFromSql, generateTaskFromFrontend, receiveImgFromAiSide_v2, verifyUserSignature } from "./relay_frontend_side"
import { fetchTaskFromFrontEnd, fetchTaskFromFrontEnd_v2 } from "./relay_ai_side"


program
    .option('--relaySide <string>', 'side: ai | frontend')
program.parse(process.argv)

const command_input = program.opts()
export const run_relay = async () => {
    if (command_input.relaySide == 'ai') {
        const sdwInstance = new SdwInstance(sdwConfig)
        await sdwInstance.setModel(sdwConfig.model.name)
    
        fetchTaskFromFrontEnd_v2(sdwInstance)

        
    }else if (command_input.relaySide == 'frontend') {

        fetchTaskFromSql()  // get the task from sql
        distributeTask()    // send task to the AI side
        receiveImgFromAiSide_v2() // receive the image from AI side
        verifyUserSignature()  // verify the user signature of a message
        generateTaskFromFrontend() // this is for the button minting NFT
   
    }else{
        console.log('please input --relaySide <string> wrong: ',command_input.relaySide)
        return
    }
    console.log('starting as the relay at '+ command_input.relaySide + ' side')
}

