# relay_frontend_sdw
 frontend will send request to this project that manage the data for interacting with AI server

## Install stable diffussion webui
1. Since there are some difference with respect to the platform, plz find the best way to install SDW https://github.com/AUTOMATIC1111/stable-diffusion-webui
2. For now, we use the model darkSushiMixMix_225D , which can be download at https://civitai.com/models/24779/dark-sushi-mix-mix ,where the model should be put in the folder /models/Stable-diffusion (if using lora, so should be put in Lora filder)
## run SDW as a service

conda activate xxx (this is the name of the conda environment)

bash webui.sh --nowebui --gradio-auth admin:admin123   (more args: https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki/Command-Line-Arguments-and-Settings)

## Run this project

yarn install

!!! the stable diffusion sdk has some issue, so we need to modify the code in node_modules/stable-diffusion-sdk/dist/lib/StableDiffusionApi.js around line 460

```
   const modelNames = models.map((model) => model.name);
```
to 
```
    const modelNames = models.map((model) => model.model_name);
```


node dist/index.js

## Test

curl -X POST http://localhost:1984/sdw -H "Content-Type: application/json" -d '{"data": "mint girl, cute, rabbit"}' 
