import { query } from './init';
import {QuestData} from '../../my_definition/type'
import {database_config} from '../../config/general'
import { RowDataPacket } from 'mysql2'
// insert or udpate the data of a question
export async function write_quest(data: QuestData):Promise<boolean> {
    
    const keys = Object.keys(data).filter(key => data[key as keyof QuestData] !== undefined);
    const values = keys.map(key => {
      if (key === 'winner_list' && Array.isArray(data.winner_list)) {
        return JSON.stringify(data.winner_list);
      }
      return data[key as keyof QuestData];
    });

    const placeholders = keys.map(() => '?').join(', ');
    const updateStatement = keys.map(key => `${key} = VALUES(${key})`).join(', ');
    const sql = 'INSERT INTO '+database_config.table +` (${keys.join(', ')}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE ${updateStatement}`;


    await query(sql, values);
    return true;
}
export async function read_quest (network:string,space: string, question_ID: number):Promise<QuestData|undefined> {
    const sql = 'SELECT * FROM '+database_config.table+' WHERE network = ? AND space = ? AND question_ID = ?'
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



