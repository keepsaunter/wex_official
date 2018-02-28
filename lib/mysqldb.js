import mysql from 'mysql';
import dbconf from '../config/db.js';
class Mysqldb {
	constructor(db_conf=dbconf){
		this.connection = mysql.createConnection(db_conf);
		this.connection.connect();
	}
	getConnection(){
		return this.connection;
	}
	query(str, callback){
		this.connection.query(str, callback)
	}
	select(table_name, fields, where='', callback){
		var last_arguments = arguments[arguments.length-1];
		if(!callback && typeof last_arguments == 'function'){
			//参数改变这里也需要改变
			where = '';
			callback = last_arguments;
		}
		if(Object.prototype.toString.call(fields)=='[object Array]'){
			fields = fields.reduce(function(res, item){
					return ',' + (item.indexOf(',') > -1 ? res+item.replace(',', ' AS ') : item);
			}, '').slice(1);
		}
		this.connection.query('SELECT '+fields+' FROM '+table_name+(where?' where '+where:''), callback);
	}
}
export default Mysqldb;