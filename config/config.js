module.exports = {
	//server
	default_port: 100,	//服务器端口号
	allow_access_origin: [
		'http://localhost:99'
	],	//跨域访问
	//path
	path_static_dir: 'public',	//静态文件目录
	path_upload_file: './public/uploads',	//文件上传目录
	//value
	default_url_name: 'index',	//默认的控制器和操作名为index
}