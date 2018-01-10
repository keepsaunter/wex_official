import Controller from './controller.js';
import Wechat from '../object/wechat.js';
import WebUser from '../object/web_user.js';
import MyHttp from '../object/my_http.js';
import crypto from 'crypto';
class UserController extends Controller {
	wexAuth(){
		var datatime = Date.now();
		var md5_crypto = crypto.createHash('md5');
		md5_crypto.update(global.config.official_md5_key+datatime);
		var sign_data = md5_crypto.digest('hex');
		this.res.redirect("https://open.weixin.qq.com/connect/oauth2/authorize?appid="+Wechat.app_id+"&redirect_uri="+encodeURIComponent("http://"+this.req.headers.host+"/user/getInfo")+"&response_type=code&scope=snsapi_userinfo&state="+sign_data+"|"+datatime+"#wechat_redirect");
	}
	getInfo(){
		new WebUser().getUser(this.req.query.code, (err, data) => {
			if(err){
				console.log(err);
			}else{
				// if(data&&!data.errcode){
					this.res.render('auth',{name:'ouch<b>ao</b>'});
				// }else{
				// 	console.log(data);
				// 	this.wexAuth();
				// }
			}
		}, 1)
	}
	test(){
		console.log(444);
	}
}
export default UserController;