import RecvWec from './recvWec.js';
class RecvPostWec extends RecvWec {
	constructor(msg_body){
		this.my_id = msg_body.ToUserName[0],
		this.user_id = msg_body.FromUserName[0],
		this.content = msg_body.Content[0],
		this.origin_msg_id = msg_body.MsgId[0]
	}
}