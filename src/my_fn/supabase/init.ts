import { createClient } from '@supabase/supabase-js'

const supabase_url = process.env.SUPABASE_URL as string
const supabase_key = process.env.SUPABASE_KEY as string

const supabase = createClient(supabase_url, supabase_key)

export const fetch_data = async (table_name: string,record:any) => {

    let query = supabase
        .from(table_name) // Replace with your table name
        .select('*')
    if (record.network) {
        query = query.eq('network', record.network)
    }
    if (record.space) {
        query = query.eq('space', record.space)
    }
    if (record.question_ID) {
        query = query.eq('question_ID', record.question_ID)
    }
    const { data, error } = await query
    
    if (error){
        console.error('Error:', error);
    } 
        
    // else 
        // console.log('Data:', data);
    
    
    return { data, error }
   
}
export const create_data = async (table_name: string, record: any) => {
    const { data, error } = await supabase
        .from(table_name) // Replace with your table name
        .insert([record]); // Replace with your data

    if (error) console.error('Error:', error);
    else console.log('Inserted Data:', data);
}
export const update_data = async (table_name: string, record: any) => {
    let query = supabase
        .from(table_name) // Replace with your table name
        .update(record)
    if (record.network) {
        query = query.eq('network', record.network)
    }
    if (record.space) {
        query = query.eq('space', record.space)
    }
    if (record.question_ID) {
        query = query.eq('question_ID', record.question_ID)
    }
    const { data: updated_data, error } = await query
    if (error) {
        console.error('Error:', error);
        // return null;
    }
    return { data: updated_data, error } ;
}