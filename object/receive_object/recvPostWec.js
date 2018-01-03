import RecvWec from './recvWec.js';
import ReplyObjFac from '../reply_object/replyObjFac.js';
class RecvPostWec extends RecvWec {
	constructor(req_query, msg_body){
		super(req_query);
		this.my_id = msg_body.ToUserName[0];
		this.user_id = msg_body.FromUserName[0];
		this.replyObjFac = ReplyObjFac;
	}
	getReplyBody(type, content){
		var reply_body = "";
		if(this.wexVerify()){
			try{
				reply_body = new (this.replyObjFac)({
					my_id: this.my_id,
					user_id: this.user_id,
					type: type,
					content: content
				}).reply();
			}catch(e){
				reply_body = "success";
			}
		}
		return reply_body;
	}
}
export default RecvPostWec;