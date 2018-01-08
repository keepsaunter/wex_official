import MyHttp from './my_http.js';
class WexUser {
	getAccessToken(){
		var code = this.req.query.code;
		if(!this.access_token){
			new MyHttp({url:"https://api.weixin.qq.com/sns/oauth2/access_token?appid="+Wechat.app_id+"&secret="+Wechat.app_secret+"&code="+code+"&grant_type=authorization_code"}).get((err, data) =>{
				if(err){
					console.log(err);
				}else{
					data = JSON.parse(data);
					if(data.scope === 'snsapi_userinfo'){
						http_req.setOption({url:'https://api.weixin.qq.com/sns/userinfo?access_token='+data.access_token+'&openid='+data.openid+'&lang=zh_CN'})
						http_req.get((err, data) =>{
						if(err){
							console.log(err);
						}else{
							console.log(data);
						}
					});
					}
					console.log(data);
				}
			})
		}
	}
	getUserInfo(access_token, openid){
		var http_req = new MyHttp({url:"https://api.weixin.qq.com/sns/oauth2/access_token?appid="+Wechat.app_id+"&secret="+Wechat.app_secret+"&code="+code+"&grant_type=authorization_code"});
		http_req.get((err, data) =>{
			if(err){
				console.log(err);
			}else{
				data = JSON.parse(data);
				if(data.scope === 'snsapi_userinfo'){
					http_req.setOption({url:'https://api.weixin.qq.com/sns/userinfo?access_token='+data.access_token+'&openid='+data.openid+'&lang=zh_CN'})
					http_req.get((err, data) =>{
					if(err){
						console.log(err);
					}else{
						console.log(data);
					}
				});
				}
				console.log(data);
			}
		})
	}
}
export default MyHttp;