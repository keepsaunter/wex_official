/*用于应对微信调用
	添加了对接口调用的验证
*/
import Wechat from '../wechat.js';
import crypto from 'crypto';
import { addLog } from '../../lib/save_log.js'
class RecvWec extends Wechat {
	constructor(req_query){
		super();
		this.token = global.config.official_token;
		this.signature = req_query.signature || '';
		this.timestamp = req_query.timestamp || '';
		this.nonce = req_query.nonce || '';
	}
	wexVerify(){
		var temp_array = [this.token, this.timestamp, this.nonce];
		temp_array.sort();

		//使用crypto的sha1加密
		var hex_sha1 = crypto.createHash('sha1');
		hex_sha1.update(temp_array.join(''));
		var temp_signature = hex_sha1.digest('hex');

		if(temp_signature === this.signature){
			return this.echostr||true;
		}else{
			addLog("wex_verify", {
				nonce: this.nonce,
				timestamp: this.timestamp,
				signature: this.signature
			},()=>{})
			return false;
		}
	}
}
export default RecvWec;