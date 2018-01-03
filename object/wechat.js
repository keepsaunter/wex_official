import { readJson } from '../lib/operation_json.js';
class Wechat{
	static access_token = "";

    constructor() {
    	if(!Wechat.access_token){
    		this.initAccessToken();
    	}
    }

    /*初始化access_token
    	从json文件中读取
    */
    initAccessToken(){
    	readJson('./../get_wex_token/wex_auth_data.json',(err, data)=>{
			if(err){
				console.log(err);
			}else{
				Wechat.access_token = data.access_token;
			}
		})
    }

    /*设置access_token
    	params{
			set_accessToken_token: 合法口令,
			new_access_token: 新的access_token
    	}
    */
	static setAccessToken(params){
		var remote_set_token = new Buffer(params.set_accessToken_token, 'base64').toString();
		if(remote_set_token === global.config.set_accessToken_token){
			Wechat.access_token = new Buffer(params.new_access_token, 'base64').toString();
			return true;
		}else{
			return false;
		}
	}
}
export default Wechat;