import Controller from './controller.js';
import Mysqldb from '../lib/mysqldb.js';
import { createRandomChart } from '../lib/lib.js';
import MyHttp from '../object/my_http.js';
import crypto from 'crypto';
class SsapiController extends Controller {
	constructor(req, res, next){
		super(req, res, next);
		this.config = global.ssconfig;
	}
	test(){
		var mysqldb = new Mysqldb({database: this.config.database});
		mysqldb.select('slideshow', (e,r,f) => {
			console.log(r);
		})
		this.resp('r');
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
	test2(){
		var args = {
      timestamp: '2018-03-23 20:26:03',
      format: 'json',
      app_key: '24820617',
      v: '2.0',
      sign_method: 'md5'
    };
    var params= {tpwd_param: {text:"efsefesfds",url:"http://m.taobao.com"},method:'taobao.wireless.share.tpwd.create'};
    for (var key in params) {
        if(typeof params[key] === 'object'){
            args[key] = JSON.stringify(params[key]);
        } else{
            args[key] = params[key];
        }
    }
    var sorted = Object.keys(args).sort();
    var basestring = '67702038ff980c5c92d94669cb3f0228';
    for (var i = 0, l = sorted.length; i < l; i++) {
        var k = sorted[i];
        basestring += k + params[k];
    }
    basestring += '67702038ff980c5c92d94669cb3f0228';
    var md5_crypto = crypto.createHash('md5');
		md5_crypto.update(basestring);
		var temp_data_sign = md5_crypto.digest('hex');

    this.resp({st: 999, msg: temp_data_sign.toUpperCase()});
	}
	createTpwd(){
		var temp_reqdata = this.req.query;
		var tpwd_url = temp_reqdata.tpwd_url;
		var tpwd_text = temp_reqdata.tpwd_text;
		var self = this;
		if(tpwd_url && tpwd_text){
			var t_config = this.config;
			var tpwd_logo = t_config.ss_logo;
			var temp_data = {
				app_key: t_config.al_appkey,
				method: 'taobao.wireless.share.tpwd.create',
				sign_method: 'md5',
				timestamp: Mysqldb.getDatetime(),
				format: 'json',
				v: '2.0'
				// tpwd_param: {text:"efsefesfds",url:"http://m.taobao.com"}
			}
			var temp_data = {
				app_key: t_config.al_appkey,
				method: 'taobao.wireless.share.tpwd.create',
				timestamp: '2018-03-23 20:26:03',
				format: 'xml',
				v: '2.0',
				partner_id: 'top-apitools',
				force_sensitive_param_fuzzy: true,
				tpwd_param: {text:"efsefesfds",url:"http://m.taobao.com"}
			}
			var t_sign_str = '', req_str = '';
			Object.keys(temp_data).sort().forEach(key => {
				var temp_item =temp_data[key];
				// if(typeof temp_item == 'object'){
				// 	temp_item = JSON.stringify(temp_item);
				// }
				t_sign_str += key+temp_item;
				req_str += key+'='+temp_item+'&';
			})
			// console.log(t_sign_str);
			var md5_crypto = crypto.createHash('md5');
			// console.log(t_config.al_app_secret);
			md5_crypto.update(t_config.al_app_secret+t_sign_str+t_config.al_app_secret);
			temp_data.sign = md5_crypto.digest('hex');
			self.resp({st: 999, msg: temp_data.sign});
			// console.log('?'+req_str+'sign='+temp_data.sign);
			// new MyHttp({
			// 	url:'http://gw.api.taobao.com/router/rest'+'?'+req_str+'sign='+temp_data.sign,
			// 	data: temp_data
			// }).get((err, res) => {
			// 	self.resp({st: 999, msg: res});
			// })		
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
	getSetting(){
		var temp_user_id = this.req.query.user_id;
		var mysqldb = new Mysqldb({database: this.config.database});
		var self = this;
		if(temp_user_id){
			mysqldb.select('user_setting', 'on_quan_feature,on_overdue_quan', `user_id="${temp_user_id}"`,(e, r) =>{
				if(!e){
					if(r.length){
						self.resp({st: 200, data:r[0]});
					}else{
						mysqldb.insert('user_setting', {user_id:temp_user_id}, (e,r)=>{
							if(!e){
								mysqldb.select('user_setting', 'on_quan_feature,on_overdue_quan', `user_id=0`,(e, r) =>{
									if(!e){
										self.resp({st: 200, data:r?r[0]:[]});
									}else{
										self.resp({st: 999, msg:e});
									}
								})
							}else{
								self.resp({st: 999, msg:e});
							}
						})
					}
				}else{
					self.resp({st: 999, msg:e});
				}
			})
		}else{
			mysqldb.select('user_setting', 'on_quan_feature,on_overdue_quan', `user_id=0`,(e, r) =>{
				if(!e){
					self.resp({st: 200, data:r?r[0]:[]});
				}else{
					self.resp({st: 999, msg:e});
				}
			})
		}
	}
	updateSetting(){
		var temp_data = this.req.query;
		var temp_user_id = temp_data.user_id
		if(temp_user_id){
			delete temp_data.user_id;
			var self = this;
			var mysqldb = new Mysqldb({database: this.config.database});
			mysqldb.update('user_setting', temp_data, '', `user_id="${temp_user_id}"`, (e,r)=>{
				if(!e){
					self.resp({st: 200, msg:'更新成功'});
				}else{
					self.resp({st: 999, msg:e});
				}
			})
		}else{
			this.resp({st: 999, msg:e});
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
	getCollected(){
		var temp_user_id = this.req.query.user_id;
		if(temp_user_id){
			var temp_page = this.req.query.page||1;
			var on_overdue_quan = this.req.query.on_overdue_quan||1;
			var page_length = 6;
			var mysqldb = new Mysqldb({database: this.config.database});
			var self = this;
			var fields_str = 'goods_id,goods_img,goods_name,goods_intro,goods_sale_num,date_format(quan_end_time+"", "%Y-%m-%d %H:%m:%S") as quan_end_time,quan_price,price,quan_after_price,site_type';
			if(mysqldb.query(`SELECT ${fields_str} FROM collect WHERE user_id="${temp_user_id}"${on_overdue_quan==1?"":' and quan_end_time>="'+Mysqldb.getDatetime()+'"'} ORDER BY collect_time desc LIMIT ${(temp_page-1)*page_length}, ${page_length}`, (e,r) =>{
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
	delCollect(){
		var temp_data = this.req.body;
		if(temp_data.user_id && temp_data.goods_id && temp_data.site_type && temp_data.data_length){
			var temp_user_id = temp_data.user_id;
			var mysqldb = new Mysqldb({database: this.config.database});
			var self = this;
			var fields_str = 'goods_id,goods_img,goods_name,goods_intro,goods_sale_num,date_format(quan_end_time+"", "%Y-%m-%d %H:%m:%S") as quan_end_time,quan_price,price,quan_after_price,site_type';
			if(mysqldb.query(`SELECT ${fields_str} FROM collect WHERE user_id="${temp_user_id}" ORDER BY collect_time desc LIMIT ${temp_data.data_length},1`, (e,new_row) =>{
				if(e){
					self.resp({st: 999, msg:e});
				}else{
					if(mysqldb.delete('collect', `user_id="${temp_user_id}" and goods_id="${temp_data.goods_id}" and site_type="${temp_data.site_type}"`, (e,r) =>{
						if(e){
							self.resp({st: 999, msg:e});
						}else{
							self.resp({st: 200, msg:'成功删除！', data: new_row});
						}
					}) == false){
						self.resp({st: 999});
					}
				}
			}) == false){
				self.resp({st: 999});
			}
		}else{
			this.resp({st: 999});
		}
	}
	delOverdueCollect(){
		var temp_data = this.req.body;
		if(temp_data.user_id){
			var temp_user_id = temp_data.user_id;
			var mysqldb = new Mysqldb({database: this.config.database});
			var self = this;
			if(mysqldb.delete('collect', `user_id="${temp_user_id}" and quan_end_time>="${Mysqldb.getDatetime()}"`, (e,r) =>{
				if(e){
					self.resp({st: 999, msg:e});
				}else{
					self.resp({st: 200, msg:'成功删除！'});
				}
			}) == false){
				self.resp({st: 999});
			}
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
	getQuanRecord(){
		var temp_user_id = this.req.query.user_id;
		if(temp_user_id){
			var temp_page = this.req.query.page||1;
			var on_overdue_quan = this.req.query.on_overdue_quan||1;
			var page_length = 6;
			var mysqldb = new Mysqldb({database: this.config.database});
			var self = this;
			var fields_str = 'goods_id,goods_img,goods_name,goods_intro,goods_sale_num,date_format(quan_end_time+"", "%Y-%m-%d %H:%m:%S") as quan_end_time,quan_price,price,quan_after_price,site_type,date_format(record_time+"", "%Y-%m-%d %H:%m:%S") as record_time';
			if(mysqldb.query(`SELECT ${fields_str} FROM quan_record WHERE user_id="${temp_user_id}"${on_overdue_quan==1?"":' and quan_end_time>="'+Mysqldb.getDatetime()+'"'} ORDER BY record_time desc LIMIT ${(temp_page-1)*page_length}, ${page_length}`, (e,r) =>{
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
	delQuanRecord(){
		var temp_data = this.req.body;
		if(temp_data.user_id && temp_data.goods_id && temp_data.site_type && temp_data.data_length){
			var temp_user_id = temp_data.user_id;
			var mysqldb = new Mysqldb({database: this.config.database});
			var self = this;
			var fields_str = 'goods_id,goods_img,goods_name,goods_intro,goods_sale_num,date_format(quan_end_time+"", "%Y-%m-%d %H:%m:%S") as quan_end_time,quan_price,price,quan_after_price,site_type,date_format(record_time+"", "%Y-%m-%d %H:%m:%S") as record_time';
			if(mysqldb.query(`SELECT ${fields_str} FROM quan_record WHERE user_id="${temp_user_id}" ORDER BY record_time desc LIMIT ${temp_data.data_length},1`, (e,new_row) =>{
				if(e){
					self.resp({st: 999, msg:e});
				}else{
					if(mysqldb.delete('quan_record', `user_id="${temp_user_id}" and goods_id="${temp_data.goods_id}" and site_type="${temp_data.site_type}"`, (e,r) =>{
						if(e){
							self.resp({st: 999, msg:e});
						}else{
							self.resp({st: 200, msg:'成功删除！', data:new_row});
						}
					}) == false){
						self.resp({st: 999});
					}
				}
			}) == false){
				self.resp({st: 999});
			}
		}else{
			this.resp({st: 999});
		}
	}
	delOverdueRecord(){
		var temp_data = this.req.body;
		if(temp_data.user_id){
			var temp_user_id = temp_data.user_id;
			var mysqldb = new Mysqldb({database: this.config.database});
			var self = this;
			if(mysqldb.delete('quan_record', `user_id="${temp_user_id}" and quan_end_time>="${Mysqldb.getDatetime()}"`, (e,r) =>{
				if(e){
					self.resp({st: 999, msg:e});
				}else{
					self.resp({st: 200, msg:'成功删除！'});
				}
			}) == false){
				self.resp({st: 999});
			}
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