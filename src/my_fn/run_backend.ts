import { program } from "commander"
import * as inscription_port from './inscription_port'



const run_back_end = async () => {
    
    inscription_port.listen()
    inscription_port.create_quest_in_database()
    inscription_port.create_quest_winner()
    inscription_port.read_quest_information_from_database()

}


export default run_back_end 