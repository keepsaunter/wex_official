import MyHttp from './my_http.js';
import Wechat from './wechat.js';
class WexUser {
	getAccessToken(code, callback){
		if(!this.access_token){
			new MyHttp({url:"https://api.weixin.qq.com/sns/oauth2/access_token?appid="+Wechat.app_id+"&secret="+Wechat.app_secret+"&code="+code+"&grant_type=authorization_code"}).get((err, data) =>{
				if(err){
					callback(err);
				}else{
					data = JSON.parse(data);
					callback('', data);
				}
			})
		}
	}
	getUserInfo(access_token, openid, callback){
		var http_req = new MyHttp({url:'https://api.weixin.qq.com/sns/userinfo?access_token='+access_token+'&openid='+openid+'&lang=zh_CN'})
		.get((err, data) =>{
			if(err){
				callback(err);
			}else{
				callback('', JSON.parse(data));
			}
		});
	}
	getUser(code, callback, type){
		this.getAccessToken(code, (err, data) => {
			if(!err){
				if(type===1){
					this.getUserInfo(data.access_token, data.openid, callback)
				}else{
					callback('', data);
				}
			}else{
				callback(err);
			}
		});
	}
}
export default WexUser;