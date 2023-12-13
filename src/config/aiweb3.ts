// import { Txt2ImgOptions } from "../../my_modules/stable-diffusion-api";
// import { Txt2ImgOptions } from "../../my_modules/stable-diffusion-api/dist/types"

import { Txt2ImgOptions } from "stable-diffusion-api";

export const nftMintText2Img:Txt2ImgOptions ={
    prompt:  " masterpiece, best quality, (colorful),(delicate eyes and face), volumatic light,ray tracing, (bust shot:2.0) ,extremely detailed CG unity 8k wallpaper,",
        // + user_input.prompt.character_looks + user_input.prompt.character_dress + user_input.prompt.character_pose + user_input.prompt.environment,
    
    negative_prompt:  "sketch, duplicate, ugly, huge eyes, text, logo, monochrome, worst face, (bad and mutated hands:1.3), (worst quality:2.0), (low quality:2.0), (blurry:2.0), horror, geometry, bad_prompt, (bad hands), (missing fingers), multiple limbs, bad anatomy, (interlocked fingers:1.2), Ugly Fingers, (extra digit and hands and fingers and legs and arms:1.4), ((2person)), (deformed fingers:1.2), (long fingers:1.2),(bad-artist-anime), bad-artist, bad hand, extra legs",
    // denoising_strength:0.42,
    cfg_scale: 11,
    // seed: 4140751792,
    steps:20,
    sampler_name: "DPM++ 2M Karras",
    width: 512,
    height: 512,
}