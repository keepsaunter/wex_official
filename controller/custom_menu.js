import { readJson } from '../lib/operation_json.js';
import { https } from 'https';
var cus_menu_file = './config/cus_menu.json';
function setMenu(menu_json){
	if(menu_json){
		// "https://api.weixin.qq.com/cgi-bin/menu/create?access_token=ACCESS_TOKEN"
	}else{
		readJson(cus_menu_file, (err, data) => {
			if(err){
				console.log(err);
			}else{
				var data = {'tt':'myname'};
				const options = {
					hostname: 'api.weixin.qq.com',
					path: '/cgi-bin/token',
					method: 'POST',
				}
				var post_req = https.request(options, (res)=> {
                    res.on("data", (chunk)=>{
                    	console.log(chunk);
                    })
                });
                post_req.write(data);
			}
		})
	}
}