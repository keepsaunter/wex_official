import RecvPostWec from './recvPostWec.js';
import WexUser from '../wex_user.js';
class RecvEventMsg extends RecvPostWec {
	constructor(req_query, msg_body){
		super(req_query, msg_body);
		this.create_time = msg_body.CreateTime[0];
		this.event = msg_body.Event[0];
	}
	deal(callback){
		if(this.event == 'subscribe'){
			new WexUser(this.user_id).getUserBase((err, data)=>{
				if(err){
					console.log(err);
				}else{
					callback(this.getReplyBody('text', '欢迎'+data.nickname+'订阅!'));
				}
			})
		}else{
			callback(this.getReplyBody('text', '欢迎点击!'));
		}
	}
}
export default RecvEventMsg;