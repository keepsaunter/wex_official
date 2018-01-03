import WecSend from './wec_send.js'
import { readJson } from '../../lib/operation_json.js';
class CusMenu extends WecSend {
	constructor(){
		super();
		this.menu_conf_file = './config/cus_menu.json';
		this.remote_path = '/cgi-bin/menu/create';
	}
	setMenu(){
		readJson(this.menu_conf_file, (err, data) => {
			if(err){
				console.log(err);
			}else{
				this.send({ path: remote_path}, data, (err, data)=>{
					if(err){
						console.log('problem with request: ' + err.message);
					}else{
						console.log(data.toString());
					}
				})
			}
		})
	}
}
export default CusMenu;