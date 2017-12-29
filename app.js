import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import bodyParserXml from 'body-parser-xml';
bodyParserXml(bodyParser);

var app = express();

// app.set('views', '/view');
// app.set('view engine', 'html');
//加入配置文件
import config from './config/config.js';
global.config = config;

//中间件数据
app.locals.middleware = [];

//填充post请求数据
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.xml());
//将文件上传中间件放到app中
import multer from './lib/multerUtil.js';
app.locals.middleware.multer = multer;

//托管静态资源，可同时声明多个
app.use(express.static(global.config.path_static_dir));
app.use('/index', express.static(global.config.path_static_dir)); //当请求静态资源的路径不是域名根路径时

/*使用cors(中间件)实现跨域请求
  html文件和node服务不在同一个端口下，
  要实现MVC前后端分离需要跨域操作
*/
app.use(cors({
	origin: global.config.allow_access_origin,
}))

//设置路由
import router from './routes/router.js';
app.use(router);

//初始化access_token
import { initAccessToken } from './controller/set_accessToken.js';
initAccessToken();

app.listen(global.config.default_port, function(){
	console.log("sevice on port "+global.config.default_port+"!");
});