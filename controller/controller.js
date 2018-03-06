import Wechat from '../object/wechat.js';
import { createRandomChart } from '../lib/lib.js';
import crypto from 'crypto';
class Controller {
	constructor(req, res, next){
		this.req = req;
		this.res = res;
		this.next = next;
	}
	resp(data){
		if(data){
			if(!data.data){
				data={data: data};
			}
			if(data.type == "text/plain"){
				this.res.set('Content-Type','text/html; charset=UTF-8');
				this.res.send(data.data);
			}else if(data.st===undefined || data.st==200 || data.st==999){
				var resp = {
					ms: data.ms?data.ms:'',
					st: data.st?data.st: 200,
					data: data.data?data.data:''
				}
				this.res.json(resp);
			}else{
				//对错误的请求做处理
				switch(code){
					case 200: this.res.json({st:200});break;
					case 404: this.render('error');break;
					default: this.res.json({st:code, data:'error'});break;
				}
			}
		}
		this.next();
	}
	render(modal_name, data){
		data ? this.res.render(modal_name, data) : this.res.render(modal_name);
	}
	renderSdk(modal_name, data, jsApiList){
		var timestamp = Date.now();
		var noncestr = createRandomChart();
		var jsapi_ticket = Wechat.jsapi_ticket;

		var host = this.req.headers.host;
		var url = ((/^https:\/\//).test(host)?host:"http://"+host) +this.req.originalUrl;

		var string1 = ['timestamp='+timestamp,'noncestr='+noncestr, 'jsapi_ticket='+jsapi_ticket, 'url='+url].sort().join('&');

		var hex_sha1 = crypto.createHash('sha1');
		hex_sha1.update(string1);
		var signature = hex_sha1.digest('hex');

		data.sdk_data = (JSON.stringify({
			debug: false,
		    appId: Wechat.app_id,
		    timestamp: timestamp,
		    nonceStr: noncestr,
		    signature: signature,
		    jsApiList: jsApiList?jsApiList:[]
		})).replace(/"/g, "'");

		this.render(modal_name, data);
	}
	err(code){
		this.resp({st: code});
	}
}
export default Controller;