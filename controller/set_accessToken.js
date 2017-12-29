import { readJson } from '../lib/operation_json.js';
function setNewAccessToken(params){
	var remote_set_token = new Buffer(params.set_accessToken_token, 'base64').toString();
	if(remote_set_token === global.config.set_accessToken_token){
		global.official_access_token = new Buffer(params.new_access_token, 'base64').toString();
		return true;
	}else{
		return false;
	}
}
function initAccessToken(){
	readJson('./../get_wex_token/wex_auth_data.json',(err, data)=>{
		if(err){
			console.log(err);
		}else{
			global.official_access_token = data.access_token;
		}
	})
}
export { initAccessToken, setNewAccessToken };