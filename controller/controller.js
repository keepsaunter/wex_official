import Wechat from '../object/wechat.js';
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
				switch(data.st){
					case 404: this.res.sendFile('G:/SmallSoftware/wex_official/view/index.html');break;
					default: this.res.sendStatus(data.st);break;
				}
			}
		}
		this.next();
	}
	render(modal_name, data){
		data ? this.res.render(modal_name, data) : this.res.render(modal_name);
	}
	renderSdk(modal_name, data){
		data.sdk_data = {
			debug: true,
		    appId: Wechat.app_id,
		    timestamp: Date.now(),
		    nonceStr: '',
		    signature: '',
		    jsApiList: []
		}
	}
}
export default Controller;