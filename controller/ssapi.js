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
	slideshow(){
		var self = this;
		(new Mysqldb({database: self.config.database})).select('slideshow', 'title,url,image', 'status=1', function(e, r, f){
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
	getQuan(){
		var temp_query = this.req.query;
		var {goods_id,goods_name,quan_id,on_priority_tw,goods_img,sign,timenow} = temp_query;
		if(goods_id && quan_id && sign){
			var temp_data = {
				goods_id: goods_id,
				goods_name: goods_name,
				quan_id: quan_id,
				on_priority_tw: on_priority_tw,
				goods_img: encodeURIComponent(goods_img)
			}
			var str_sign = '';
			Object.keys(temp_data).sort().forEach(item => {
				str_sign += temp_data[item]+item;
			})
			var md5_crypto = crypto.createHash('sha1');
			md5_crypto.update((str_sign+timenow).split("1").sort().join('8'),'utf8');
			if(md5_crypto.digest('hex') == sign){
				var t_config = this.config;
				var self = this;
				var goods_quan_url = `https://uland.taobao.com/coupon/edetail?activityId=${quan_id}&pid=${t_config.pid}&itemId=${goods_id}`
				if(on_priority_tw === 0){
					self.resp({url: goods_quan_url});
				}else{
					this.createTpwd(goods_name, goods_quan_url, goods_img, (err, res) => {
						self.resp(!err&&res ? {model: res} : {url: goods_quan_url});
					})
				}
			}else{
				this.resp({st: 999, msg:'illegal request'});
			}
		}else{
			this.resp({st: 999, msg:'params wrong'});
		}
	}
	createTpwd(tpwd_text, tpwd_url, logo_img, callback){
		if(tpwd_url && tpwd_text){
			tpwd_url = decodeURIComponent(tpwd_url);
			tpwd_text = tpwd_text.length > 5 ? tpwd_text : "超值优惠，惊喜多多";
			
			var params = {
				method: 'taobao.tbk.tpwd.create',
				text:tpwd_text,
				url:tpwd_url,
				logo: logo_img?decodeURIComponent(logo_img):t_config.ss_logo
			};
			this.tbQuery(params, (err, res) => {
				try{
					res = JSON.parse(res);
					if(!res.error_response && res.tbk_tpwd_create_response){
						callback('', res.tbk_tpwd_create_response.data.model);
					}else{
						callback(res.error_response.sub_msg||res.error_response.msg||'');
					}
				}catch(e){
					callback(res);
				}
			})
		}else{
			callback('params error');
		}
	}
	tbQuery(params,callback,url= "https://eco.taobao.com/router/rest"){
		if(typeof callback == 'string'){
			url = callback;
			callback = '';
		}
		if(!callback){
			callback = () => {};
		}
		var t_config = this.config;
		var temp_data = Object.assign({
			app_key: t_config.al_appkey,
			sign_method: 'md5',
			timestamp: Mysqldb.getDatetime(),
			format: 'json',
			v: '2.0'
		},params);
		var t_sign_str = '', req_str = '';
		Object.keys(temp_data).sort().forEach(key => {
			var temp_item =temp_data[key];
			if(typeof temp_item == 'object'){
				temp_item = JSON.stringify(temp_item);
			}
			t_sign_str += key+temp_item;
			//注：这里传递timestamp或中文要用encodeURI编码
			if(key == 'text' || key == 'start_time' || key == 'end_time' || key == 'timestamp'){
				temp_item = encodeURI(temp_item);
			}
			//注：url中有特殊字符串
			if(key == 'url' || key == 'logo' || key == 'q'){
				temp_item = encodeURIComponent(temp_item);
			}
			req_str += key+'='+temp_item+'&';
		})
		var md5_crypto = crypto.createHash('md5');
		md5_crypto.update(t_config.al_app_secret+t_sign_str+t_config.al_app_secret,'utf8');
		req_str += 'sign='+md5_crypto.digest('hex').toUpperCase();

		new MyHttp({url:url+"?"+req_str}).get(callback)
	}
	altqg(){
		var temp_req = this.req.query;
		var { start_time, end_time } = temp_req;
		if(start_time && end_time){
			var t_pid = this.config.pid;
			if(t_pid){
				var self = this;
				var params = {
					method: 'taobao.tbk.ju.tqg.get',
					start_time: decodeURI(start_time),
					end_time: end_time,
					simplify: 'true',
					fields: 'click_url,pic_url,reserve_price,zk_final_price,total_amount,sold_num,title,start_time,end_time',
					adzone_id: t_pid.substr(t_pid.lastIndexOf('_')+1)
				}
				if(temp_req.page_no) params.page_no = temp_req.page_no;
				if(temp_req.page_size) params.page_size = temp_req.page_size;
				this.tbQuery(params, (e, data) => {
					if(!e && data){
						try{
							data = JSON.parse(data);
							if(!data.error_response && data.results){
								self.resp(data.results);
							}else{
								self.resp({st: 999, msg:data.error_response.sub_msg||data.error_response.msg||''});
							}
						}catch(e){
							self.resp({st: 999, msg:data});
						}
					}else{
						self.resp({st: 999, msg:e});
					}
				})
			}else{
				this.resp({st: 999, msg:'server wrong'});
			}
		}else{
			this.resp({st: 999, msg:'wrong params'});
		}
	}
	aljhs(){
		var temp_req = this.req.query;
		var { start_time, end_time } = temp_req;
		var t_pid = this.config.pid;
		if(t_pid){
			var self = this;
			var params = {
				method: 'taobao.ju.items.search',
				simplify: 'true',
				param_top_item_query:{
					pid: t_pid
				}
			}
			if(temp_req.page_no) params.current_page = temp_req.page_no;
			if(temp_req.page_size) params.page_size = temp_req.page_size;
			this.tbQuery(params, (e, data) => {
				if(!e && data){
					try{
						data = JSON.parse(data);
						if(!data.error_response && data.result && data.result.model_list){
							self.resp(data.result.model_list);
						}else{
							self.resp({st: 999, msg:data.error_response.sub_msg||data.error_response.msg||''});
						}
					}catch(e){
						self.resp({st: 999, msg:data});
					}
				}else{
					self.resp({st: 999, msg:e});
				}
			})
		}else{
			this.resp({st: 999, msg:'server wrong'});
		}
	}
	alGoodsdetail(){
		var temp_goods_id = this.req.query.goods_id;
		if(temp_goods_id){
			var self = this;
			var params = {
				method: 'taobao.tbk.item.info.get',
				simplify: 'true',
				fields: 'title,small_images,volume',
				num_iids: temp_goods_id
			}
			this.tbQuery(params, (e, data) => {
				if(!e && data){
					try{
						data = JSON.parse(data);
						if(!data.error_response && data.results && data.results[0]){
							self.resp(data.results[0]);
						}else{
							self.resp({st: 999, msg:data.error_response.sub_msg||data.error_response.msg||''});
						}
					}catch(e){
						self.resp({st: 999, msg:data});
					}
				}else{
					self.resp({st: 999, msg:e});
				}
			})
		}else{
			this.resp({st: 999, msg:'wrong params'});
		}
	}
	alsearch(){
		var temp_req = this.req.query;
		var {sort,q,page,page_size,cat} = this.req.query;
		var t_pid = this.config.pid;
		if((q!=undefined || cat!=undefined) && t_pid){
			var self = this;
			var price_start = temp_req.price_start;
			var price_end = temp_req.price_end;
			var params = {};
			var query_str = price_start!=undefined?params.start_price=price_start:'';
			query_str += price_end!=undefined?params.end_price=price_end:'';
			query_str += q!=undefined?params.q=decodeURIComponent(q):'';
			query_str += cat!=undefined?params.cat=cat:'';
			if(sort){
				switch(sort){
					case 'all': break;
					case 'new': params.sort='tk_rate_des';break;
					case 'sale_num': params.sort='total_sales_des';break;
					case 'price_desc': params.sort='price_des';break;
					case 'price_asc': params.sort='price_asc';break;
					default: break;
				}
			}
			params.has_coupon = 'true';
			params.adzone_id = t_pid.substr(t_pid.lastIndexOf('_')+1);
			params.method = 'taobao.tbk.dg.material.optional';
			params.simplify = 'true';
			this.tbQuery(params, (e, data) => {
				if(!e && data){
					try{
						data = JSON.parse(data);
						if(!data.error_response && data){
							self.resp(data);
						}else{
							self.resp({st: 999, msg:data.error_response.sub_msg||data.error_response.msg||''});
						}
					}catch(e){
						self.resp({st: 999, msg:data});
					}
				}else{
					self.resp({st: 999, msg:e});
				}
			})
		}else{
			if(t_pid){
				this.resp({st: 999, msg:'illegal request'});
			}else{
				this.resp({st: 999, msg:'server wrong'});
			}
		}
	}
	getSetting(){
		var temp_user_id = this.req.query.user_id;
		var mysqldb = new Mysqldb({database: this.config.database});
		var self = this;
		if(temp_user_id){
			var sql = 'SELECT s.id,s.key_name,s.title,s.remark,s.default_val,s.status,us.value FROM setting s LEFT JOIN (SELECT * FROM user_setting WHERE user_id="'+temp_user_id+'") us ON s.id=us.setting_id WHERE s.status!=0';
		}else{
			var sql = 'SELECT *,default_val as value FROM setting';
		}
		new Promise((resolve, reject)=>{
			mysqldb.query(sql, (err, res) => {
				if(!err){
					if(temp_user_id){
						var insert_str = '';
						res.map((item, index, arr) => {
							if(item.value == null||item.status==1){
								if(item.value == null){
									insert_str += ',("'+temp_user_id+'",'+item.id+','+item.default_val+')';
								}
								arr[index].value = arr[index].default_val;
							}
						})
						if(insert_str){
							insert_str = insert_str.substr(1);
							mysqldb.query('INSERT INTO user_setting (user_id, setting_id, value) VALUES '+insert_str, (err_ins)=>{
								err_ins? reject(err_ins) : resolve(res);
							})
						}else{
							resolve(res);
						}
					}else{
						resolve(res);
					}
				}else{
					reject(err);
				}
			})
		}).then(res => {
			self.resp(res);
		}, err => {
			self.resp({st: 999, msg:err});
		})
	}
	updateSetting(){
		var temp_query = this.req.query;
		var temp_user_id = temp_query.user_id
		var temp_update_arr = JSON.parse(temp_query.update_arr);
		if(temp_user_id && temp_update_arr){
			var mysqldb = new Mysqldb({database: this.config.database});
			var self = this;
			var update_str = 'INSERT INTO user_setting (setting_id, value, user_id) VALUES ('+temp_update_arr.join(',"'+temp_user_id+'"),(')+',"'+temp_user_id+'") on duplicate key update value=values(value)';
			mysqldb.query(update_str, err => {
				err ? self.resp({st: 999, msg:err}) : self.resp({st: 200});
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
		var temp_query = this.req.query;
		var temp_user_id = temp_query.user_id;
		if(temp_user_id){
			var temp_page = temp_query.page||1;
			var on_overdue_quan = temp_query.on_overdue_quan||1;
			var page_length = 6;
			var mysqldb = new Mysqldb({database: this.config.database});
			var self = this;
			var fields_str = 'goods_id,goods_img,goods_name,goods_intro,goods_sale_num,date_format(quan_end_time+"", "%Y-%m-%d %H:%m:%S") as quan_end_time,quan_price,price,quan_after_price,site_type';
			if(mysqldb.query(`SELECT ${fields_str} FROM collect WHERE user_id="${temp_user_id}"${on_overdue_quan==1?"":' and quan_end_time>="'+Mysqldb.getDatetime()+'"'} ORDER BY ${temp_query.sort_by==1?'quan_end_time asc':'collect_time desc'} LIMIT ${(temp_page-1)*page_length}, ${page_length}`, (e,r) =>{
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
		var temp_data = this.req.query;
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
		var temp_data = this.req.query;
		if(temp_data.user_id){
			var temp_user_id = temp_data.user_id;
			var mysqldb = new Mysqldb({database: this.config.database});
			var self = this;
			if(mysqldb.delete('collect', `user_id="${temp_user_id}" and quan_end_time<"${Mysqldb.getDatetime()}"`, (e,r) =>{
				if(e){
					self.resp({st: 999, msg:e});
				}else{
					self.resp({st: 200, msg:'成功删除！'});
				}
			}) == false){
				self.resp({st: 999});
			}
		}else{
			this.resp({st: 999});
		}
	}
	collect(){
		var temp_data = this.req.query;
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
		var temp_data = this.req.query;
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
		var temp_query = this.req.query;
		var temp_user_id = temp_query.user_id;
		if(temp_user_id){
			var temp_page = temp_query.page||1;
			var on_overdue_quan = temp_query.on_overdue_quan||1;
			var page_length = 6;
			var mysqldb = new Mysqldb({database: this.config.database});
			var self = this;
			var fields_str = 'goods_id,goods_img,goods_name,goods_intro,goods_sale_num,date_format(quan_end_time+"", "%Y-%m-%d %H:%m:%S") as quan_end_time,quan_price,price,quan_after_price,site_type,date_format(record_time+"", "%Y-%m-%d %H:%m:%S") as record_time';
			if(mysqldb.query(`SELECT ${fields_str} FROM quan_record WHERE user_id="${temp_user_id}"${on_overdue_quan==1?"":' and quan_end_time>="'+Mysqldb.getDatetime()+'"'} ORDER BY ${temp_query.sort_by==1?'quan_end_time asc':'record_time desc'} LIMIT ${(temp_page-1)*page_length}, ${page_length}`, (e,r) =>{
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
		var temp_data = this.req.query;
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
		var temp_data = this.req.query;
		if(temp_data.user_id){
			var temp_user_id = temp_data.user_id;
			var mysqldb = new Mysqldb({database: this.config.database});
			var self = this;
			if(mysqldb.delete('quan_record', `user_id="${temp_user_id}" and quan_end_time<"${Mysqldb.getDatetime()}"`, (e,r) =>{
				if(e){
					self.resp({st: 999, msg:e});
				}else{
					self.resp({st: 200, msg:'成功删除！'});
				}
			}) == false){
				self.resp({st: 999});
			}
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