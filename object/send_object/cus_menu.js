import WecSend from './wec_send.js'
import { readJson, readSync } from '../../lib/operation_json.js';
class CusMenu extends WecSend {
	constructor(){
		super();
		this.menu_conf_file = './config/cus_menu.json';
		this.remote_path = '/cgi-bin/menu/create';
	}
	setMenu(callback){
		try{
			var menu_conf = readSync(this.menu_conf_file);
			this.send({ path: this.remote_path}, menu_conf, (err, data)=>{
				if(err){
					callback({st:999, data: '菜单设置失败,'+err.message});
				}else{
					if(data.errcode == 0 && data.errmsg=='ok'){
						callback('菜单设置成功!');
					}else{
						callback({st:999, data: data});
					}
				}
			})
		}catch(e){
			// console.log(e);
		}
	}
}
export default CusMenu;