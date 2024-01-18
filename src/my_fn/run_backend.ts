import { program } from "commander"
import * as inscription_port from './inscription_port'



const run_back_end = async () => {
    
    inscription_port.listen()
    inscription_port.query_quest_winner()
}


export default run_back_end 