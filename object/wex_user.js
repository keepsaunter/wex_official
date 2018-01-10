import MyHttp from './my_http.js';
import Wechat from './wechat.js';
class WexUser {
	constructor(open_id){
		this.open_id = open_id;
	}
	getUserBase(callback){
		var http_req = new MyHttp({url:'https://api.weixin.qq.com/cgi-bin/user/info?access_token='+access_token+'&openid='+this.openid+'&lang=zh_CN'})
		.get((err, data) =>{
			if(err){
				callback(err);
			}else{
				callback('', JSON.parse(data));
			}
		});
	}
}
export default WexUser;