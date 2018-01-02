/*以函数的方式处理请求，将处理结果返回
  req.query: get请求数据
  req.method: 请求方法
  req.body: post请求；需要body-parser中间件
*/
import { wexVerify } from './verify.js';
import { dealMessage } from './deal_message.js';
import { readJson } from '../lib/operation_json.js';
import { setNewAccessToken } from './set_accessToken.js';
import ReplyObjFac from '../object/reply_object/replyObjFac.js';
import RecvVerifyMsg from '../object/receive_object/recvVerifyMsg.js'
import https from 'https';

function setAccessToken(req){
	if(setNewAccessToken(req.query)){
		return {st: 200, data:"modify success!"};
	}else{
		return {st: 404, data:"illlegal request!"};
	}
}

function test(req){
	console.log(req.body);
	return {data:"fdsfsd"};
}
function test2(){
    var data = JSON.stringify({
	  access_token: global.official_access_token
	});

	var opt = {
	  hostname:'api.weixin.qq.com',
	  method: 'POST',
	  path: '/cgi-bin/menu/create',
	  headers: {   
	    'Content-Type':'application/x-www-form-urlencoded',
	    'Content-Length': data.length  
	  } 
	};

	var req = https.request(opt, function (res) {  
	  res.on('data', function (data) {
	    console.log(data.toString());
	  });
	});
	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});
	req.write(data);
	req.end();
 	return {data:666};
}

// function index(req){
// 	var res_data = {
// 		type: 'text/plain'
// 	};
// 	if(req.method == "GET"){
// 		res_data.data = wexVerify(req.query);
// 	}else if(req.method == "POST"){
// 		if(wexVerify(req.query)){
// 			res_data.data = dealMessage(req.body.xml);
// 		}
// 	}
// 	return res_data;
// }

function index(req){
	var res_data = {
		type: 'text/plain'
	};

	if(req.method == "GET"){
		res_data.data = new RecvVerifyMsg(req.query).reply();
	}else if(req.method == "POST"){
		if(wexVerify(req.query)){
			res_data.data = new ReplyObjFac(req).reply();
		}
	}
	return res_data;
}

module.exports = {
	index: index,
	setAccessToken: setAccessToken,
	test: test,
	test2: test2,
};