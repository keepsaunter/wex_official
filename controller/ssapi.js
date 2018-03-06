import Controller from './controller.js';
import Mysqldb from '../lib/mysqldb.js';
import { createRandomChart } from '../lib/lib.js';
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
		var temp_data = this.req.body;
		var t_code = temp_data.code;
		var t_user_id = temp_data.user_id;

		if(t_code || t_user_id){
			var temp_user_info = {
	      nickName: temp_data.nickName||'',
	      avatarUrl: temp_data.avatarUrl||'',
	      province: temp_data.province||'',
	      gender: temp_data.gender||0,
	      login_time: Mysqldb.getDatetime()
	    };
	    var mysqldb = new Mysqldb({database: t_config.database});
	    if(t_code){
	    	new MyHttp({url:`https://api.weixin.qq.com/sns/jscode2session?appid=${t_config.app_id}&secret=${t_config.app_secret}&js_code=${t_code}&grant_type=authorization_code`}).get(
				(e, data) => {
					data = JSON.parse(data);
					if(!e && !data.errcode && data.openid){
						var temp_openid = data.openid;
						mysqldb.get('user', 'user_id',`openid="${temp_openid}"`, (e,origin_data,f) => {
				    	if(!e){
				    		if(origin_data.length){
				    			if(mysqldb.update('user', temp_user_info, '', `openid="${temp_openid}"`,(e,r,f) => {
				    				if(e){
				    					self.resp({st: 999, msg:e});
				    				}else{
				    					self.resp({st: 200, id: origin_data.user_id});
				    				}
				    			}) == false){
				    				self.resp({st: 999, msg:e});
				    			}
				    		}else{
				    			temp_user_info.openid = temp_openid;
				    			temp_user_info.register_time = temp_user_info.login_time;
				    			temp_user_info.user_id = createRandomChart(8)+(Date.now()+'').slice(-8);
				    			if(mysqldb.insert('user', temp_user_info, (e,r,f) => {
				    				if(e){
				    					self.resp({st: 999, msg:e});
				    				}else{
				    					console.log(1);
				    					self.resp({st: 200, id: temp_user_info.user_id});
				    				}
				    			}) == false){
				    				self.resp({st: 999, msg:e});
				    			}
				    		}
				    	}else{
								self.resp({st: 999, msg:e});
							}
				    })
					}
				})
	    }else{
	    	if(mysqldb.update('user', temp_user_info, '', `user_id="${t_user_id}"`,(e,r,f) => {
  				if(e){
  					self.resp({st: 999, msg:e});
  				}else{
  					console.log(2);
  					self.resp({st: 200, id: r.user_id});
  				}
  			}) == false){
  				self.resp({st: 999, msg:e});
  			}
	    }
		}else{
			self.resp({st: 999, msg:'illegal request'});
		}
	}
}
export default SsapiController;