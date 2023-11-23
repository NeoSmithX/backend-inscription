
import StableDiffusionApi, { Txt2ImgOptions } from "stable-diffusion-api"
import { SdwConfig } from "../config/sdw"
// import sdwConfig from '../config/sdw'

export type ResultText2Img = {
    img:any
    if_success:boolean,
}
export class SdwInstance {
    api:any
    status = {
        sdw_busy: false,
        telegram_clear_cache: false
    }
    constructor(sdwConfig:SdwConfig){
        const api = new StableDiffusionApi(
            sdwConfig.sdwApi
        )
        api.setAuth(sdwConfig.security.username, sdwConfig.security.password)
        // await api.setModel(sdwConfig.model.name)
        this.api = api
    }
    async setModel(model_name:string){
        await this.api.setModel(model_name)
    }
    text2img = async (basePromt:Txt2ImgOptions,newPrompt:string,save_path:string):Promise<ResultText2Img> => {
        try{
            let text2img_input_new: Txt2ImgOptions = Object.assign({}, basePromt);
            text2img_input_new.prompt = text2img_input_new.prompt + ',' + newPrompt
            console.log('whole prompt: ',text2img_input_new.prompt)
            const result = await this.api.txt2img(text2img_input_new);
            result.image.toFile(save_path)
            let result_text2img:ResultText2Img = {
                img:result.image,
                if_success:true
            }
            return result_text2img
        }catch(error){
            console.log('text2img error')
            console.log(error)
            let result_text2img:ResultText2Img = {
                img:null,
                if_success:false
            }
            return result_text2img
        }
        
    }
}