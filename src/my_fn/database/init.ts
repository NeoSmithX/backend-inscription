import mysql from 'mysql2/promise';
import {database_config} from '../../config/general';
const connection = mysql.createConnection(database_config);

export async function query(sql: string, params?: any[]) {
  const [rows] = await (await connection).execute(sql, params);
  return rows;
}
