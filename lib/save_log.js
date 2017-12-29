import fs from 'fs';
import { writeJson } from './operation_json.js'
const log_dir = "./log/";

function setFileName(type){
	var date = new Date();
	var t_year = date.getFullYear();
	var t_month = addZero(date.getMonth()+1);
	var t_day = addZero(date.getDate());
	var t_hour = addZero(date.getHours());
	var t_minute = addZero(date.getMinutes());
	var t_second = addZero(date.getSeconds());
	var random = addZero(Math.round(Math.random()*10000));
	return ""+t_year+t_month+t_day+"_"+t_hour+t_minute+t_second+"_"+random+".json";
}
function addZero(val, length){
	length = length ? length : 2;
	return ((""+val).length < length ? Array(length-(""+val).length).fill(0).join(""):"")+val;
}
//type=[wex_verify]
function addLog(type, data, callback){
	writeJson(log_dir+type+"/"+setFileName(type), data, callback);
}

export { addLog }