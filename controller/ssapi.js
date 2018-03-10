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
	getCollected(){
		var temp_user_id = this.req.query.user_id;
		var temp_page = this.req.query.page||1;
		if(temp_user_id){
			var page_length = 6;
			var mysqldb = new Mysqldb({database: this.config.database});
			var self = this;
			var fields_str = 'goods_id,goods_img,goods_name,goods_intro,goods_sale_num,date_format(quan_end_time+"", "%Y-%m-%d %H:%m:%S") as quan_end_time,quan_price,price,quan_after_price,site_type';
			if(mysqldb.query(`SELECT ${fields_str} FROM collect WHERE user_id="${temp_user_id}" ORDER BY collect_time desc LIMIT ${(temp_page-1)*page_length}, ${page_length}`, (e,r) =>{
				if(e){
					self.resp({st: 999, msg:e});
				}else{
					self.resp({st: 200, data:r});
				}
			}) == false){
				self.resp({st: 999});
			}
		}
	}
	isCollected(){
		var temp_data = this.req.query;
		if(temp_data.user_id && temp_data.goods_id && temp_data.site_type){
			var mysqldb = new Mysqldb({database: this.config.database});
			var self = this;
			mysqldb.get('collect', 'goods_id', `user_id="${temp_data.user_id}" and goods_id="${temp_data.goods_id}" and site_type="${temp_data.site_type}"`,(e, r) =>{
				if(!e){
					if(r.length){
						self.resp({st: 200, data:{is_collected: 1}});
					}else{
						self.resp({st: 200, data:{is_collected: 0}});
					}
				}else{
					self.resp({st: 999, msg:e});
				}
			})
		}else{
			this.resp({st: 999});
		}
	}
	collect(){
		var temp_data = this.req.body;
		if(temp_data.user_id && temp_data.goods_id && temp_data.site_type){
			var mysqldb = new Mysqldb({database: this.config.database});
			var self = this;
			mysqldb.get('collect', 'goods_id', `user_id="${temp_data.user_id}" and goods_id="${temp_data.goods_id}" and site_type="${temp_data.site_type}"`,(e, r) => {
				if(!e){
					if(!r.length){
						temp_data.collect_time = Mysqldb.getDatetime();
						if(mysqldb.insert('collect', temp_data, (e,r) => {
	    				if(e){
	    					self.resp({st: 999, msg:e});
	    				}else{
	    					self.resp({st: 200, msg:'收藏成功！', data:{is_collected: 1}});
	    				}
	    			}) == false){
	    				self.resp({st: 999});
	    			}
					}else{
						if(mysqldb.delete('collect', `user_id="${temp_data.user_id}" and goods_id="${temp_data.goods_id}" and site_type="${temp_data.site_type}"`, (e,r) =>{
	    				if(e){
	    					self.resp({st: 999, msg:e});
	    				}else{
	    					self.resp({st: 200, msg:'取消收藏！', data:{is_collected: 0}});
	    				}
	    			}) == false){
	    				self.resp({st: 999});
	    			}
					}
				}else{
					self.resp({st: 999, msg:e});
				}
			})
		}else{
			this.resp({st: 999});
		}
	}
	login(){
		var t_config = this.config;
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
	    	var self = this;
	    	new MyHttp({url:`https://api.weixin.qq.com/sns/jscode2session?appid=${t_config.app_id}&secret=${t_config.app_secret}&js_code=${t_code}&grant_type=authorization_code`}).get(
				(e, data) => {
					data = JSON.parse(data);
					if(!e && !data.errcode && data.openid){
						var temp_openid = data.openid;
						mysqldb.get('user', 'user_id',`openid="${temp_openid}"`, (e,origin_data) => {
				    	if(!e){
				    		if(origin_data.length){
				    			if(mysqldb.update('user', temp_user_info, '', `openid="${temp_openid}"`,(e,r) => {
				    				if(e){
				    					self.resp({st: 999, msg:e});
				    				}else{
				    					self.resp({st: 200, data: {user_id: origin_data[0].user_id}});
				    				}
				    			}) == false){
				    				self.resp({st: 999});
				    			}
				    		}else{
				    			temp_user_info.openid = temp_openid;
				    			temp_user_info.register_time = temp_user_info.login_time;
				    			temp_user_info.user_id = createRandomChart(8)+(Date.now()+'').slice(-8);
				    			if(mysqldb.insert('user', temp_user_info, (e,r) => {
				    				if(e){
				    					self.resp({st: 999, msg:e});
				    				}else{
				    					self.resp({st: 200, data: {user_id: temp_user_info.user_id}});
				    				}
				    			}) == false){
				    				self.resp({st: 999});
				    			}
				    		}
				    	}else{
								self.resp({st: 999, msg:e});
							}
				    })
					}
				})
	    }else{
	    	if(mysqldb.update('user', temp_user_info, '', `user_id="${t_user_id}"`,(e,r) => {
  				if(e){
  					self.resp({st: 999, msg:e});
  				}else{
  					self.resp({st: 200, data: {user_id: t_user_id}});
  				}
  			}) == false){
  				self.resp({st: 999});
  			}
	    }
		}else{
			self.resp({st: 999, msg:'illegal request'});
		}
	}
}
export default SsapiController;