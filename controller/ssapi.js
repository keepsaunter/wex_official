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
	resetAppkey(){
		var self = this;
		var mysqldb = new Mysqldb({database: this.config.database});
		if(mysqldb.select('appkey','keyname,domain,value',(e, r) => {
			if(!e){
				global.appkey = r;
				self.resp({type:'text/plain',data:'重置成功'});
			}else{
				self.resp({type:'text/plain',data:'重置失败'});
			}
		}) === false){
			self.resp({type:'text/plain',data:'重置失败'});
		}
	}
	getConf(){
		if(this.req.headers && this.req.headers.token){
			var t_token = this.req.headers.token;
			var req_token_sec = this.config.req_token;
			if(req_token_sec){
				if(t_token === req_token_sec){
					var mysqldb = new Mysqldb({database: this.config.database});
					mysqldb.select('appkey','keyname,domain,value',(e, r) => {
						if(!e){
							this.resp(r);
						}else{
							this.resp({st: 999, msg: e});
						}
					})
				}else{
					this.resp({st: 999, msg: '非法请求'});
				}
			}else{
				this.resp({st: 500, msg: '内部错误'});
			}
		}else{
			this.resp({st: 999, msg: '非法请求'});
		}
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
		}else{
			this.resp({st: 999, msg:'未登录'});
		}
	}
	getQuanRecord(){
		var temp_user_id = this.req.query.user_id;
		var temp_page = this.req.query.page||1;
		if(temp_user_id){
			var page_length = 6;
			var mysqldb = new Mysqldb({database: this.config.database});
			var self = this;
			var fields_str = 'goods_id,goods_img,goods_name,goods_intro,goods_sale_num,date_format(quan_end_time+"", "%Y-%m-%d %H:%m:%S") as quan_end_time,quan_price,price,quan_after_price,site_type,date_format(record_time+"", "%Y-%m-%d %H:%m:%S") as record_time';
			if(mysqldb.query(`SELECT ${fields_str} FROM quan_record WHERE user_id="${temp_user_id}" ORDER BY record_time desc LIMIT ${(temp_page-1)*page_length}, ${page_length}`, (e,r) =>{
				if(e){
					self.resp({st: 999, msg:e});
				}else{
					self.resp({st: 200, data:r});
				}
			}) == false){
				self.resp({st: 999});
			}
		}else{
			this.resp({st: 999, msg:'未登录'});
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
	redir(){
		var temp_req_url = this.req.query.url_real;
		if(temp_req_url){
			var temp_appkey = global.appkey;
			var self = this;
			new Promise((resolve, reject)=>{
				if(!temp_appkey){
					var mysqldb = new Mysqldb({database: self.config.database});
					if(mysqldb.select('appkey','keyname,domain,value',(e, r) => {
						if(!e){
							global.appkey = r;
							temp_appkey = r;
							resolve();
						}else{
							reject();
						}
					}) === false){
						reject();
					}
				}else{
					resolve();
				}
			}).then(() => {
				var temp_appkey_match = temp_req_url.match(new RegExp(temp_appkey.reduce((sum, item) => {
	        return sum + '|('+item.domain+')';
	      }, '').substr(1)));
	      if(temp_appkey_match){
	        for(var i=1; i < temp_appkey_match.length; i++){
	          if(temp_appkey_match[i]){
	            temp_req_url = temp_req_url + (/\?/.test(temp_req_url) ? '&' : '?') + (temp_appkey[i-1]["keyname"] || 'appkey') + '='+temp_appkey[i-1].value;
	            break;
	          }
	        }
	      }
				new MyHttp({url:temp_req_url}).get((e, r) => {
					if(!e){
						if(typeof r === 'string'){
							try{
								r = JSON.parse(r);
							}catch(e){

							}
						}
						self.resp({data:r});
					}else{
						self.resp([]);
					}
				})
			}, () => {
				self.resp([]);
			})
		}
	}
	delQuanRecord(){
		var temp_data = this.req.body;
		if(temp_data.user_id && temp_data.goods_id && temp_data.site_type){
			var mysqldb = new Mysqldb({database: this.config.database});
			var self = this;
			if(mysqldb.delete('quan_record', `user_id="${temp_data.user_id}" and goods_id="${temp_data.goods_id}" and site_type="${temp_data.site_type}"`, (e,r) =>{
				if(e){
					self.resp({st: 999, msg:e});
				}else{
					self.resp({st: 200, msg:'成功删除！', data:{is_collected: 0}});
				}
			}) == false){
				self.resp({st: 999});
			}
		}else{
			this.resp({st: 999});
		}
	}
	quanRecord(){
		var temp_data = this.req.body;
		if(temp_data.user_id && temp_data.goods_id && temp_data.site_type){
			var mysqldb = new Mysqldb({database: this.config.database});
			var self = this;
			var temp_time_now = Mysqldb.getDatetime();
			mysqldb.get('quan_record', 'goods_id', `user_id="${temp_data.user_id}" and goods_id="${temp_data.goods_id}" and site_type="${temp_data.site_type}"`,(e, r) => {
				if(!e){
					if(!r.length){
						temp_data.record_time = temp_time_now;
						if(mysqldb.insert('quan_record', temp_data, (e,r) => {
	    				if(e){
	    					self.resp({st: 999, msg:e});
	    				}else{
	    					self.resp({st: 200, msg:'成功加入！', data:{is_collected: 1}});
	    				}
	    			}) == false){
	    				self.resp({st: 999});
	    			}
					}else{
						if(mysqldb.update('quan_record', {record_time:temp_time_now}, '', `user_id="${temp_data.user_id}" and goods_id="${temp_data.goods_id}" and site_type="${temp_data.site_type}"`, (e,r) =>{
	    				if(e){
	    					self.resp({st: 999, msg:e});
	    				}else{
	    					self.resp({st: 200, msg:'成功加入！', data:{is_collected: 0}});
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
	sign(){
		var temp_user_id = this.req.query.user_id;
		if(temp_user_id){
			var t_config = this.config;
			var self = this;
			var mysqldb = new Mysqldb({database: t_config.database});
			mysqldb.select('user', 'score,last_sign_time',`user_id="${temp_user_id}"`, (e,origin_data)=>{
				if(origin_data.length){
					var temp_sign_time = origin_data[0]['last_sign_time'];
					if(temp_sign_time==='' || new Date() - new Date(temp_sign_time.substr(0,10)) > 86400000){
						var temp_score = parseInt(origin_data[0]['score']) + parseInt(this.config.day_score);
						var new_sign_time = Mysqldb.getDatetime();
						mysqldb.update('user', {score:temp_score,last_sign_time: new_sign_time}, '', `user_id="${temp_user_id}"`,(e,r) => {
							if(!e){
								self.resp({st: 200, msg:'签到成功！', data:{
									score: temp_score,
									last_sign_time: new_sign_time
								}});
							}else{
								self.resp({st: 999, msg:'服务器错误！'});
							}
						})
					}else{
						self.resp({st: 999, msg:'无签到条件！'});
					}
				}else{
					self.resp({st: 999, msg:'无用户数据'});
				}
			})
		}else{
			this.resp({st: 999, msg:'illegal request'});
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
	      last_login_time: Mysqldb.getDatetime()
	    };
	    var mysqldb = new Mysqldb({database: t_config.database});
	    if(t_code){
	    	var self = this;
	    	new MyHttp({url:`https://api.weixin.qq.com/sns/jscode2session?appid=${t_config.app_id}&secret=${t_config.app_secret}&js_code=${t_code}&grant_type=authorization_code`}).get(
				(e, data) => {
					data = JSON.parse(data);
					if(!e && !data.errcode && data.openid){
						var temp_openid = data.openid;
						mysqldb.select('user', 'user_id,score,last_sign_time',`openid="${temp_openid}"`, (e,origin_data) => {
				    	if(!e){
				    		if(origin_data.length){
				    			if(mysqldb.update('user', temp_user_info, '', `openid="${temp_openid}"`,(e,r) => {
				    				if(e){
				    					self.resp({st: 999, msg:e});
				    				}else{
				    					var data_select = origin_data[0];
				    					self.resp({st: 200, data: {user_id: data_select.user_id,score: data_select.score, last_sign_time: data_select.last_sign_time}});
				    				}
				    			}) == false){
				    				self.resp({st: 999});
				    			}
				    		}else{
				    			temp_user_info.openid = temp_openid;
				    			temp_user_info.register_time = temp_user_info.last_login_time;
				    			temp_user_info.user_id = createRandomChart(8)+(Date.now()+'').slice(-10);
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