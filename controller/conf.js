import Controller from './controller.js';
import Wechat from '../object/wechat.js';
import CusMenu from '../object/send_object/cus_menu.js';

class ConfController extends Controller {
	setMenu(){
		new CusMenu(this.resp).setMenu((res)=>{
			this.resp(res);
		});
	}
	setAccessToken(){
		if(Wechat.setAccessToken(this.req.query)){
			this.resp("modify success!");
		}else{
			this.resp({st: 999, data:"illlegal request!"});
		}
	}
}
export default ConfController;