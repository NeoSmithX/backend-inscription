# Relay for Frontend and Sdw
 Since the aiweb3 frontend is on VPS and the SDW is on the local machine with private IP, we need to utilize this project as the relay on both sides to connect them. 

# Part I: Relay at the AI side
Before running the relay at the AI side, we need to install the SDW and run it as a service.
## Install stable diffussion webui
1. Since there are some difference with respect to the platform, plz find the best way to install SDW https://github.com/AUTOMATIC1111/stable-diffusion-webui
2. For now, we use the model darkSushiMixMix_225D , which can be download at https://civitai.com/models/24779/dark-sushi-mix-mix ,where the model should be put in the folder /models/Stable-diffusion (if using lora, so should be put in Lora folder)

## Run SDW as a service
```
conda activate xxx (this is the name of the conda environment)

bash webui.sh --nowebui --gradio-auth admin:admin123   (more args: https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki/Command-Line-Arguments-and-Settings)
```
## Run the relay (this project)
Now, we can run the relay.
### Install
```
yarn install
```
!!! The package 'stable-diffusion-sdk' has some issue, so we need to modify the its code in node_modules/stable-diffusion-sdk/dist/lib/StableDiffusionApi.js around line 460

```
const modelNames = models.map((model) => model.name);
```
to 
```
const modelNames = models.map((model) => model.model_name);
```

### Add customer parameter into /config 
aiweb3.ts is the config file for managing base prompts, i.e., the NFT style. 

general.ts is the config file for network setting such as the port number and the IP address.

sdw.ts is the config file for the SDW setting such as security token, model name, network parameters.


### Compile 
```
tsc
```


### Run at the AI side


```
node dist/index.js --relaySide ai
```
### Run at the frontend side
```
node dist/index.js --relaySide frontend
```

# Step Summary
1. Run the SDW as a service
2. Run the relay at the AI side
3. Run the relay at the frontend side

😆😆😆


 




