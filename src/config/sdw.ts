// import { StableDiffusionApiConfig, Txt2ImgOptions } from "../../my_modules/stable-diffusion-api/dist/types";

import { StableDiffusionApiConfig } from "../../my_modules/stable-diffusion-api/dist/types"



export type SdwConfig ={
    sdwApi:StableDiffusionApiConfig,
    security:{
        username:string,
        password:string
    },
    model:{
        name:string,
    }
}
export const sdwConfig:SdwConfig ={

    sdwApi: {
        host: "localhost",
        port: 7861,
        protocol: "http",
        timeout: 5 * 60 * 1000,// max time is 5 min
        // defaultSampler: "DPM++ 2M Karras",//Euler a
        // defaultStepCount: 20,
    },
    security:{
        username: "admin",
        password: "admin123"
    },
    model:{
        name:"darkSushiMixMix_225D"  // this model is used to generating cartoon images (e.g., aiweb3 mooncake girl figure)
    }

}