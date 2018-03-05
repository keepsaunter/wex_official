import Controller from './controller.js';
import Mysqldb from '../lib/mysqldb.js';
import SsConfig from '../config/smallsw.js';
import MyHttp from '../object/my_http.js';
class SsapiController extends Controller {
	constructor(req, res, next){
		super(req, res, next);
		this.config = SsConfig;
	}
	slideshow(){
		var self = this;
		(new Mysqldb({database: self.config.database})).select('slideshow', 'title,url,image', function(e, r, f){
			if(!e){
				self.resp(r);
			}else{
				self.resp([]);
			}
		});
	}
	test(){
		var mysqldb = new Mysqldb({database: this.config.database});
		mysqldb.select('slideshow', (e,r,f) => {
			console.log(r);
		})
			this.resp('r');
	}
	login(){
		var self = this;
		var t_config = self.config;
		// var code = this.req.body.code;
		var mysqldb = new Mysqldb({database: t_config.database});
		var temp_user_info = {
      nickName: '--',
      avatarUrl: 'fdsfdsfd',
      province: 'temp_userInfo.province',
      gender: '1',
      login_time: Mysqldb.getDatetime()
    };
    console.log(mysqldb.update('user', temp_user_info, '', `openid="${temp_user_info.openid}"`));
    new MyHttp({url:`https://api.weixin.qq.com/sns/jscode2session?appid=${t_config.app_id}&secret=${t_config.app_secret}&js_code=${t_code}&grant_type=authorization_code`}).get(
			(e, data) => {
				if(!e){
					if(!data.errcode && data.openid){
						var temp_openid = data.openid;
						mysqldb.get('user', 'register_time',`openid="${temp_openid}"`, (e,r,f) => {
				    	if(!e){
				    		if(r.length){
				    			if(mysqldb.update('user', temp_user_info, '', `openid="${temp_openid}"`,(e,r,f) => {
				    				if(e){
				    					self.resp({st: 999});
				    				}else{
				    					self.resp({st: 200});
				    				}
				    			}) == false){
				    				self.resp({st: 999});
				    			}
				    		}else{
				    			temp_user_info.openid = temp_openid;
				    			temp_user_info.register_time = temp_user_info.login_time;
				    			if(mysqldb.insert('user', temp_user_info, (e,r,f) => {
				    				if(e){
				    					self.resp({st: 999});
				    				}else{
				    					self.resp({st: 200});
				    				}
				    			}) == false){
				    				self.resp({st: 999});
				    			}
				    		}
				    	}else{
								self.resp({st: 999});
							}
				    })
					}
				}
			}
		)
		// var t_code = '013lYKYH0CPbXg2WdFYH0y6OYH0lYKYh';
	}
}
export default SsapiController;