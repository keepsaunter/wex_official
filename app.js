var express = require('express');

var cors = require('cors');
var bodyParser = require('body-parser');
require('body-parser-xml')(bodyParser);

var router = require('./routes/router.js');
var app = express();

// app.set('views', '/view');
// app.set('view engine', 'html');
//加入配置文件
app.locals.config = require('./config/config.js');
//中间件数据
app.locals.middleware = [];

//填充post请求数据
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.xml());
//将文件上传中间件放到app中
app.locals.middleware.multer = require('./lib/multerUtil.js');

//托管静态资源，可同时声明多个
app.use(express.static(app.locals.config.path_static_dir));
app.use('/index', express.static(app.locals.config.path_static_dir)); //当请求静态资源的路径不是域名根路径时

/*使用cors(中间件)实现跨域请求
  html文件和node服务不在同一个端口下，
  要实现MVC前后端分离需要跨域操作
*/
app.use(cors({
	origin: app.locals.config.allow_access_origin,
}))

//设置路由
app.use(router);

app.listen(app.locals.config.default_port, function(){
	console.log("sevice on port "+app.locals.config.default_port+"!");
});