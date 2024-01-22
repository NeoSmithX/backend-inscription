import { query } from './init';
import {QuestData} from '../../my_definition/type'
import { RowDataPacket } from 'mysql2'
export async function write_quest(data_array: QuestData[]):Promise<boolean> {
    if (data_array.length === 0) return false // No data to insert

    const keys = Object.keys(data_array[0]);
    const sql = `INSERT INTO inscription_aiweb3 (${keys.join(', ')}) VALUES ?`;
    const values = data_array.map(item => keys.map(key => item[key as keyof QuestData] || null));
  
    await query(sql, [values])
    return true
}
export async function read_quest (network:string,space: string, question_ID: number) {
    const sql = 'SELECT * FROM inscription_aiweb3 WHERE network = ? AND space = ? AND question_ID = ?'
    const rows = await query(sql, [network, space, question_ID]) as [RowDataPacket[]]
  
    if (rows.length) {
      console.log('Question found:', rows[0]);
    } else {
      console.log('No question found for space:', space, 'and question ID:', question_ID);
    }
  }



