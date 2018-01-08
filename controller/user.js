import Controller from './controller.js';
import Wechat from '../object/wechat.js';
import MyHttp from '../object/my_http.js';
class UserController extends Controller {
	wexAuth(){
		this.res.redirect("https://open.weixin.qq.com/connect/oauth2/authorize?appid="+Wechat.app_id+"&redirect_uri="+encodeURIComponent("http://"+this.req.headers.host+"/user/getAccessToken")+"&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect");
	}
	getAccessToken(){
		var code = this.req.query.code;
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
	test(){
		console.log(444);
	}
}
export default UserController;