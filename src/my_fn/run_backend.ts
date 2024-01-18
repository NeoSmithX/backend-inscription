import { program } from "commander"
import * as inscription_port from './inscription_port'

program
    .option('--subscankey <string>', 'string')
program.parse(process.argv)

const command_input = program.opts()
const run_back_end = async () => {
    const subscankey = command_input.subscankey
    inscription_port.listen()
    inscription_port.query_quest_winner()
}


export default run_back_end 