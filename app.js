import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import bodyParserXml from 'body-parser-xml';
import Mysqldb from './lib/mysqldb.js';
import SsConfig from './config/smallsw.js';
bodyParserXml(bodyParser);

var app = express();

//设置模板引擎
app.set('view engine', 'jade');
app.set('views', './view');
//加入配置文件
import config from './config/config.js';
global.config = config;

//中间件数据
app.locals.middleware = [];

//填充post请求数据
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.xml());
//将文件上传中间件放到app中
import multer from './lib/multerUtil.js';
app.locals.middleware.multer = multer;

//托管静态资源，可同时声明多个
app.use(express.static(global.config.path_static_dir));
// app.use('/js', express.static(global.config.path_static_dir)); //当请求静态资源的路径不是域名根路径时

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
import Wechat from './object/wechat.js';
new Wechat();

//读取配置
var database_name = SsConfig.database;
var mysqldb = new Mysqldb({database: database_name});
mysqldb.select('config', (err, res) => {
	if(res.length){
		var temp_conf = res[0];
		global.ssconfig = {
			database: database_name,
			app_id: temp_conf.smAppId,
			req_token: temp_conf.reqToken,
			app_secret: temp_conf.smAppSecret,
			day_score: temp_conf.dayScore,
			ss_logo: temp_conf.ss_logo,
			al_appkey: temp_conf.alAppkey,
			al_app_secret: temp_conf.alAppSecret
		}
	}
})

app.listen(global.config.default_port, function(){
	console.log("sevice on port "+global.config.default_port+"!");
});