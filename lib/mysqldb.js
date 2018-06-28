import mysql from 'mysql';
import dbconf from '../config/db.js';
class Mysqldb {
	constructor(db_conf={}){
		this.connect(db_conf);
	}
	connect(db_conf){
		this.connection = mysql.createConnection(Object.assign(dbconf, db_conf));
	}
	getConnection(){
		return this.connection;
	}
	query(str, callback){
		var _self = this;
		this.connection.query(str, function(err, res, fields) {
			if(callback && typeof callback === 'function')
				callback(err, res, fields);
			_self.releaseCon();
		});
	}
	static getDatetime() {     
		var date_now = new Date();
		var t_year = date_now.getFullYear();
		var t_month = date_now.getMonth()+1;
		var t_day = date_now.getDate();
		var t_hour = date_now.getHours();
		var t_minutes = date_now.getMinutes();
		var t_seconds = date_now.getSeconds();
		return `${t_year}-${t_month<10?'0'+t_month:t_month}-${t_day<10?'0'+t_day:t_day} ${t_hour<10?'0'+t_hour:t_hour}:${t_minutes<10?'0'+t_minutes:t_minutes}:${t_seconds<10?'0'+t_seconds:t_seconds}`;
	}
	get(table_name, field='*', where, callback){
		var temp_arguments_len = arguments.length;
		var last_arguments = arguments[temp_arguments_len-1];
		if(!callback && typeof last_arguments == 'function'){
			//参数改变这里也需要改变
			temp_arguments_len == 2 ? fields = '*' : where = '';
			callback = last_arguments;
		}
		this.query('SELECT '+field+' FROM '+table_name+(where?' where '+where:''), callback);
	}
	select(table_name, fields='*', where='', limit='', callback){
		var temp_arguments_len = arguments.length;
		var last_arguments = arguments[temp_arguments_len-1];
		if(!callback && typeof last_arguments == 'function'){
			//参数改变这里也需要改变
			temp_arguments_len == 2 ? fields = '*' : temp_arguments_len == 3 ? where = '' : limit='';
			callback = last_arguments;
		}
		if(Object.prototype.toString.call(fields)=='[object Array]'){
			fields = fields.reduce(function(res, item){
					return ',' + (item.indexOf(',') > -1 ? res+item.replace(',', ' AS ') : item);
			}, '').slice(1);
		}
		if(limit){
			if(Object.prototype.toString.call(limit)=='[object Array]'){
				limit = limit.join(',');
			}
			limit = ' limit ' + limit;
		}
		this.query('SELECT '+fields+' FROM '+table_name+(where?' where '+where:'')+limit, callback);
	}
	insert(table_name, data_ins, feilds, callback){
		if(table_name && data_ins && (!data_ins.length||(data_ins.length && data_ins.length!==0))){
			var last_arguments = arguments[arguments.length-1];
			if(!callback && typeof last_arguments == 'function'){
				//参数改变这里也需要改变
				feilds = '';
				callback = last_arguments;
			}
			var key_str = '', val_str='';
			//1:数组;2:对象;0:其他
			var type_data_ins = typeof data_ins != 'object'?0:Object.prototype.toString.call(data_ins)=='[object Array]'?1:2;
			if(feilds){
				key_str = (Object.prototype.toString.call(feilds)=='[object Array]'?feilds.join(','):feilds);
			}
			if(type_data_ins == 1){
				var temp_data0 = data_ins[0];
				if(temp_data0){
					if(typeof temp_data0 == 'object'){
						if(Object.prototype.toString.call(temp_data0)=='[object Array]'){
							val_str = data_ins.reduce((res, item) => {
								return res+=',("'+item.join('","')+'"")';
							}, '').slice(1);
						}else{
							val_str = data_ins.reduce((res, item) => {
								return res+=',("'+Object.values(item).join('","')+'")';
							}, '').slice(1);
							if(!key_str){
								key_str = Object.keys(data_ins[0]).join(',');
							}
						}
					}
				}
			}else if(type_data_ins == 2){
				val_str = '"'+Object.values(data_ins).join('","')+'"';
				if(!key_str){
					key_str = Object.keys(data_ins).join(',');
				}
			}else{
				val_str = '"'+data_ins+'"';
			}
			if(key_str && val_str){
				this.query('INSERT INTO '+table_name+' ('+key_str+') VALUES ('+val_str+')', callback);
			}else{
				return false;
			}
		}else{
			return false;
		}
	}
	update(table_name, data_update, feilds, where, callback){
		if(table_name && data_update && (!data_update.length||(data_update.length && data_update.length!==0))){
			var last_arguments = arguments[arguments.length-1];
			if(!callback && typeof last_arguments == 'function'){
				//参数改变这里也需要改变
				arguments.length == 3 ? feilds= '' : arguments.length == 4 ? where = '' : '';
				callback = last_arguments;
			}
			var update_str = '';
			//1:数组;2:对象;0:其他
			var type_data_update = typeof data_update != 'object'?0:Object.prototype.toString.call(data_update)=='[object Array]'?1:2;
			if(type_data_update == 2){
				for(var item in data_update){
					update_str+=','+item+'="'+data_update[item]+'"';
				}
			}else if(feilds){
				if(typeof feilds == 'string'){
					update_str=feilds+'="'+(type_data_update==0?data_update:data_update[0])+'"';
				}else{
					for(var t_i = 0; t_i < feilds.length; t_i++){
						update_str+=','+feilds[t_i]+'="'+data_update[t_i]+'"';
					}
				}
			}else{
				return false;
			}
			if(update_str){
				this.query('UPDATE '+table_name+' SET '+update_str.slice(1)+(where?' where '+where:''), callback);
			}
		}else{
			return false;
		}
	}
	delete(table_name, where = 1, callback){
		var last_arguments = arguments[arguments.length-1];
		if(!callback && typeof last_arguments == 'function'){
			//参数改变这里也需要改变
			where = 1;
			callback = last_arguments;
		}
		if(table_name){
			this.query('DELETE FROM '+table_name+' WHERE '+where, callback);
		}
	}
	releaseCon(){
		this.connection.destroy();
	}
}
export default Mysqldb;