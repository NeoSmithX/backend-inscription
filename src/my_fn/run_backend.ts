import { program } from "commander"
import * as inscription_port from './inscription_port_v2'



const run_back_end = async () => {
    
    // inscription_port.listen()
    // inscription_port.create_quest_in_database()
    // inscription_port.create_quest_winner()
    // inscription_port.read_quest_information_from_database()
    inscription_port.subscribe_task()
}


export default run_back_end 