var express = require('express');
var user_router = express.Router();

//引入数据处理(控制器)模块
var index_router = require('../controller/index.js');

user_router.use(function(req, res, next){
	//获取当前的路径，若req.baseUrl不等于空的话，需要多一步处理，暂时没写
	var temp_url = req.url||req.originalUrl;
	/*从路径中提取出想要的控制器名和操作名；
	  这里只是模拟了控制器和操作，没有模块，感觉不需要那么复杂
	  */
	var controll_reg = /^\/([^{\/|?|&|=}]*)(?:\/([^{\/|?|&|=}]*(?=[\/|?|&]?)))?/;
	var controll_paths = temp_url.match(controll_reg);
	
	//对于缺少控制器或操作名的请求做处理(替换成全局配置的名称)
	var default_path = req.app.locals.config.default_url_name;
	controll_paths?(controll_paths[1]?(controll_paths[2]?'':controll_paths[2]=default_path):controll_paths[1]=controll_paths[2]=default_path):controll_paths[1]=controll_paths[2]=default_path;

	try{
		/*用eval来将字符串作为对象名调用；
		  可以用(function(funname){return funname();})(name)的方式实现；
		  但感觉这样更简洁，eval应该有其他影响；
		  这里不能对/url/:id的请求使用req.params获取参数；
		*/
		//将结果给res.locals.data变量做临时保存
		res.locals.data = eval(controll_paths[1]+"_router")[controll_paths[2]](req, res);
	}catch(e){
		// console.log(e);
		//调用失败返回404错误；
		res.locals.data = {
			st: 404
		}
	}
	next();
});

module.exports = user_router;