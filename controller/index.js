/*以函数的方式处理请求，将处理结果返回
  req.query: get请求数据
  req.method: 请求方法
  req.body: post请求；需要body-parser中间件
*/

function index(req){
	var upload=req.app.locals.middleware.multer.single('test');
	upload(req, {}, function(err){
		console.log(err);
		console.log(req.file);	//文件信息
	});
	return {
		'data': req.headers['x-real-ip'] ? req.headers['x-real-ip'] : req.ip.replace(/::ffff:/, '')
	}
}

function wexVerify(req){
	// var echostr = req.query.echostr;
	console.log(req);
	return {
		data: "fsds",
		type: 'text/plain'
	}
}

module.exports = {
	index: index,
	wexVerify: wexVerify
};