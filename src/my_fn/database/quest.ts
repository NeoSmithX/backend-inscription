import { query } from './init';
import {QuestData} from '../../my_definition/type'
import { RowDataPacket } from 'mysql2'
export async function write_quest(data_array: QuestData[]):Promise<boolean> {
    if (data_array.length === 0) return false // No data to insert

    const keys = Object.keys(data_array[0]);
    const sql = `INSERT INTO inscription_aiweb3 (${keys.join(', ')}) VALUES ?`;
    
    const values = [
        data_array.map(item => keys.map(key => {
            if (key === 'winner_list' && Array.isArray(item.winner_list)) {
              return JSON.stringify(item.winner_list);
            }
            return item[key as keyof QuestData] || null;
          }
        ))
    ]
    
    
    console.log('values',values)
    await query(sql, [values])
    return true
}
export async function read_quest (network:string,space: string, question_ID: number):Promise<QuestData|undefined> {
    const sql = 'SELECT * FROM inscription_aiweb3 WHERE network = ? AND space = ? AND question_ID = ?'
    const rows = await query(sql, [network, space, question_ID]) as any
  
    if (rows.length == 1) {
        const result:QuestData = {
            network:rows[0].network,
            space:rows[0].space,
            question_ID:rows[0].question_ID,
            question:rows[0].question,
            deploy_hash:rows[0].deploy_hash,
            correct_answer:rows[0].correct_answer,
            winner_num:rows[0].winner_num,
            winner_list:JSON.parse(rows[0].winner_list)
        }
        return rows
    } else if (rows.length > 1){

    }
    else {
        console.log('No result found for space:', space, 'and question ID:', question_ID);
    }
  }



