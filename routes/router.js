import express from 'express';
var router = express.Router();

import user_router from './user_router.js';//数据处理的中间件

/*第一个中间件是为了以后可能对所有请求添加验证等操作
  然后让user_router中间件实现数据操作，并将数据保存在res.locals.data中
  使用最后一个中间件对数据做统一的数据输出
*/
router.use('/favicon.ico', function(req, res){
	res.send();
});
router.use('/', function(req, res, next){
	next();
}, user_router)

export default router;