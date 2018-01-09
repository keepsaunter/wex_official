import express from 'express';
var user_router = express.Router();

//引入数据处理(控制器)模块
var controllers = {
	indexController: require('../controller/index.js')['default'],
	confController: require('../controller/conf.js')['default'],
	errorController: require('../controller/error.js')['default'],
	jadeController: require('../controller/jade.js')['default'],
	userController: require('../controller/user.js')['default'],
	authjadeController: require('../controller/authjade.js')['default'],
}

user_router.use(function(req, res, next){
	//获取当前的路径，若req.baseUrl不等于空的话，需要多一步处理，暂时没写
	var temp_url = req.url||req.originalUrl;
	/*从路径中提取出想要的控制器名和操作名；
	  这里只是模拟了控制器和操作，没有模块，感觉不需要那么复杂
	  */
	var controll_reg = /^\/([^{\/|?|&|=}]*)(?:\/([^{\/|?|&|=}]*(?=[\/|?|&]?)))?/;
	var controll_paths = temp_url.match(controll_reg);
	
	//对于缺少控制器或操作名的请求做处理(替换成全局配置的名称)
	var default_path = global.config.default_url_name;
	controll_paths?(controll_paths[1]?(controll_paths[2]?'':controll_paths[2]=default_path):controll_paths[1]=controll_paths[2]=default_path):controll_paths[1]=controll_paths[2]=default_path;

	try{
		/*用eval来将字符串作为对象名调用；
		  可以用(function(funname){return funname();})(name)的方式实现；
		  但感觉这样更简洁，eval应该有其他影响；
		  这里不能对/url/:id的请求使用req.params获取参数；
		*/
		//将结果给res.locals.data变量做临时保存
		
		if(controll_paths[1] !== "favicon.ico"){
			new controllers[controll_paths[1]+"Controller"](req, res, next)[controll_paths[2]]();
		}else{
			new controllers['errorController'](req, res, next).err(200);
		}
	}catch(e){
		console.log(e);
		//调用失败返回404错误;
		if(controllers[controll_paths[1]+"Controller"]){
			new controllers['errorController'](req, res, next).err(405);
		}else{
			new controllers['errorController'](req, res, next).err(404);
		}
	}
});

module.exports = user_router;