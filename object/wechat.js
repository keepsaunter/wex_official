import { readJson } from '../lib/operation_json.js';
class Wechat {
	static access_token = "";
	static app_id = "";
	static app_secret = "";
	static set_accessToken_token = "";
	static wex_data_file = 'wex_auth_data.json';
	static wex_conf_file = 'wex_official_config.json';

    constructor() {
    	if(!Wechat.access_token){
    		this.initAccessToken();
    	}
    }

    /*初始化access_token
    	从json文件中读取
    */
    initAccessToken(){
    	var get_accessToken_path = global.config.get_accessToken_path;
    	readJson(get_accessToken_path + Wechat.wex_data_file, (err, data)=>{
			if(err){
				console.log(err);
			}else{
				Wechat.access_token = data.access_token;
			}
		});
		readJson(get_accessToken_path + Wechat.wex_conf_file, (err, data)=>{
			if(err){
				console.log(err);
			}else{
				Wechat.app_id = data.appId;
				Wechat.app_secret = data.appSecret;
				Wechat.set_accessToken_token = data.set_accessToken_token;
			}
		});
    }

    /*设置access_token
    	params{
			set_accessToken_token: 合法口令,
			new_access_token: 新的access_token
    	}
    */
	static setAccessToken(params){
		try{
			var remote_set_token = new Buffer(params.set_accessToken_token, 'base64').toString();
			if(remote_set_token === global.config.set_accessToken_token){
				Wechat.access_token = new Buffer(params.new_access_token, 'base64').toString();
				return true;
			}else{
				return false;
			}
		}catch(e){
			return false;
		}
	}
}
export default Wechat;