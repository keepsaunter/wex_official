var express = require('express');
var router = express.Router();

var user_router = require('./user_router.js');//数据处理的中间件

/*第一个中间件是为了以后可能对所有请求添加验证等操作
  然后让user_router中间件实现数据操作，并将数据保存在res.locals.data中
  使用最后一个中间件对数据做统一的数据输出
*/
router.use('/', function(req, res, next){
	next();
}, user_router, function(req, res, next){
	var temp_data = res.locals.data;
	if(temp_data.type == "text/plain"){
		res.set('Content-Type','text/html; charset=UTF-8');
		res.send(temp_data.data);
	}else if(temp_data.st===undefined || temp_data.st==200){
		var resp = {
			ms: temp_data.ms?temp_data.ms:'',
			st: temp_data.st?temp_data: 200,
			data: temp_data.data?temp_data.data:''
		}
		res.json(resp);
	}else{
		//对错误的请求做处理
		switch(temp_data.st){
			case 404: res.sendFile('G:/SmallSoftware/wex_official/view/index.html');break;
			default: res.sendStatus(temp_data.st);break;
		}
	}
})

module.exports = router;