import Wechat from '../wechat.js';
import https from 'https';
class WecSend extends Wechat {
	send(option, data, callback){
		if(typeof data == "object"){
			data = JSON.stringify(data);
		}
		var opt = Object.assign({
		  hostname:'api.weixin.qq.com',
		  method: 'POST',
		  path: '',
		  headers: {   
		    'Content-Type':'application/x-www-form-urlencoded',
		    'Content-Length': data.length
		  } 
		}, option);
		opt.path += '?access_token='+WecSend.access_token;

		var req = https.request(opt, function (res) {  
		  res.on('data', function (data) {
		  	callback("", data);
		  });
		});
		req.on('error', function(e) {
			callback(e, "");
		});
		req.write(data);
		req.end();
	}
}
export default WecSend;