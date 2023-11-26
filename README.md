# Relay for Frontend and Sdw
 Since the aiweb3 frontend is on VPS and the SDW is on the local machine with private IP, we need to utilize this project as the relay on both sides to connect them. 

# Part I: Relay at the AI side
Before running the relay at the AI side, we need to install the SDW and run it as a service.
## Install stable diffussion webui
1. Since there are some difference with respect to the platform, plz find the best way to install SDW https://github.com/AUTOMATIC1111/stable-diffusion-webui
2. For now, we use the model darkSushiMixMix_225D , which can be download at https://civitai.com/models/24779/dark-sushi-mix-mix ,where the model should be put in the folder /models/Stable-diffusion (if using lora, so should be put in Lora folder)

## Run SDW as a service

conda activate xxx (this is the name of the conda environment)

bash webui.sh --nowebui --gradio-auth admin:admin123   (more args: https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki/Command-Line-Arguments-and-Settings)

## Run the relay (this project) at the ai side
Now, we can run the relay at the ai side.

yarn install

!!! The package 'stable-diffusion-sdk' has some issue, so we need to modify the its code in node_modules/stable-diffusion-sdk/dist/lib/StableDiffusionApi.js around line 460

```
   const modelNames = models.map((model) => model.name);
```
to 
```
    const modelNames = models.map((model) => model.model_name);
```


node dist/index.js --relaySide ai

## Test

curl -X POST http://localhost:1984/sdw -H "Content-Type: application/json" -d '{"data": "mint girl, cute, rabbit"}' 

# Part II: Relay at the frontend side

    Waiting for Dr Cao provde the SQL api.
 




