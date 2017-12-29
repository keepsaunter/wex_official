import crypto from 'crypto';
import { addLog } from '../lib/save_log.js'
function wexVerify(params){
	var token = global.config.official_token;
	var signature = params.signature;
	var timestamp = params.timestamp;
	var nonce = params.nonce;
	var echostr = params.echostr;

	var temp_array = [token, timestamp, nonce];
	temp_array.sort();

	//使用crypto的sha1加密
	var hex_sha1 = crypto.createHash('sha1');
	hex_sha1.update(temp_array.join(''));
	var temp_signature = hex_sha1.digest('hex');

	if(temp_signature === signature){
		return echostr||true;
	}else{
		addLog("wex_verify", {
			nonce: nonce,
			timestamp: timestamp,
			signature: signature
		})
		return false;
	}
}

export { wexVerify }