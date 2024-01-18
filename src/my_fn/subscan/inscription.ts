
import {subscan_api_url} from '../../config/general'
import {polkadot_key_format} from '../utils'
const myHeaders = new Headers();
// myHeaders.append("User-Agent", "Apidog/1.0.0 (https://apidog.com)")
myHeaders.append("x-api-key", "6b5fb7dff55040bda7aaba42af42111d")
myHeaders.append("Content-Type", "application/json")



export const quest_winner = async (network:string,hash:string,correct_answer:string,winner_num:number) => {
    let result:{status:boolean,winner_list:string[]} = {
        status:false,
        winner_list: []
    }
    const api_url = subscan_api_url[network as keyof typeof subscan_api_url]

    const raw = JSON.stringify({
        "hash": hash,
        "only_extrinsic_event": true
    });

    const requestOptions: RequestInit = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow' as RequestRedirect
    }
    let question_data_json 
    try{
        const response =  await fetch("https://"+api_url+"/api/scan/extrinsic", requestOptions)
        const text = JSON.parse(await response.text())
        if (text.message != 'Success'){
            console.log('text.message',text.message)
            return result
        }
        question_data_json = text.data
        // console.log(question_data_json)
    }catch(e){
        console.log('e',e)
        return result
    }
    if (question_data_json.call_module_function != 'remark' && question_data_json.call_module_function != 'remark_with_event'){
        console.log('question_data_json.call_module_function',question_data_json.call_module_function)
        return result
    }
   
    
    const inscription = JSON.parse(question_data_json.params[0].value) 

    if (inscription.op != "deployQuestion"){
        console.log('inscription.op',inscription.op)
        return result
    }
    const {space,questionID} = inscription
    const winner_list = await find_winner(api_url,space,questionID,correct_answer,winner_num,question_data_json.block_num)
    if (winner_list.length == winner_num){
        result.status = true
        result.winner_list = winner_list
    }   
    return result
}

const find_winner = async (api_url:string,space:string,questionID:string,correct_answer:string,winner_num:number,start_block:number)=>{
    
    let winner_list: string[] = []
    for (let page = 0; ; page++) {
        const raw = JSON.stringify({

            "block_range":start_block+'-'+start_block*100,
            // "block_num":19092662,
             "module":"system",
            "call": "remark",
            "page":page,
            "row":100,
            "order": "asc",
            "success": true,
        })
        const requestOptions: RequestInit = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow' as RequestRedirect
        }
        let remark_record
        try{
            const response =  await fetch("https://"+api_url+"/api/v2/scan/extrinsics", requestOptions)
            const text = JSON.parse(await response.text())
            if (text.message != 'Success'){
                console.log('text.message',text.message)
                return winner_list
            }
            remark_record = text.data.extrinsics
            const extrinsic_index_list: string[]= []
            remark_record.forEach(
                (x:any) =>{
                    extrinsic_index_list.push(x.extrinsic_index)
                }
            )
            const raw_tx_details = JSON.stringify({

                "extrinsic_index": extrinsic_index_list
            })
            const requestOptions_tx_details: RequestInit = {
                method: 'POST',
                headers: myHeaders,
                body: raw_tx_details,
                redirect: 'follow' as RequestRedirect
            }
            const response_tx_details =  await fetch("https://"+api_url+"/api/scan/extrinsic/params", requestOptions_tx_details)
            const text_tx_details = JSON.parse(await response_tx_details.text()).data

            for (let i=0;i<text_tx_details.length;i++){
                const inscription = JSON.parse(text_tx_details[i].params[0].value)
                if (!inscription){
                    continue
                }
                if (inscription.op == "mintAnswer" && inscription.space == space && inscription.questionID == questionID && inscription.answer == correct_answer){
                    const winner_address = remark_record[i].account_display.address
                    const winner_address_substrate = polkadot_key_format(winner_address,'substrate') as string
                    if (!winner_list.includes(winner_address_substrate)){
                        winner_list.push(winner_address_substrate)
                        if (winner_list.length == winner_num){
                            return winner_list
                        }
                    }
                }

            }
            if (winner_list.length >= winner_num){
                winner_list = winner_list.splice(0,winner_num)
                return winner_list
            }
         
            // console.log(question_data_json)
        }catch(e){
            console.log('e',e)
            return winner_list
        }
    }
   
  
}