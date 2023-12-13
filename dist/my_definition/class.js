"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SdwInstance = void 0;
const index_1 = __importDefault(require("../../my_modules/stable-diffusion-api/dist/index"));
class SdwInstance {
    constructor(sdwConfig) {
        this.status = {
            sdw_busy: false,
            telegram_clear_cache: false
        };
        this.text2img = async (basePromt, newPrompt, save_path) => {
            try {
                let text2img_input_new = Object.assign({}, basePromt);
                text2img_input_new.prompt = text2img_input_new.prompt + ',' + newPrompt;
                console.log('whole prompt: ', text2img_input_new.prompt);
                const result = await this.api.txt2img(text2img_input_new);
                result.image.toFile(save_path);
                let result_text2img = {
                    img: result.image,
                    if_success: true
                };
                return result_text2img;
            }
            catch (error) {
                console.log('text2img error');
                console.log(error);
                let result_text2img = {
                    img: null,
                    if_success: false
                };
                return result_text2img;
            }
        };
        const api = new index_1.default(sdwConfig.sdwApi);
        api.setAuth(sdwConfig.security.username, sdwConfig.security.password);
        // await api.setModel(sdwConfig.model.name)
        this.api = api;
    }
    async setModel(model_name) {
        await this.api.setModel(model_name);
    }
}
exports.SdwInstance = SdwInstance;
//# sourceMappingURL=class.js.map