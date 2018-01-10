import RecvPostWec from './recvPostWec.js';
class RecvTextMsg extends RecvPostWec {
	constructor(req_query, msg_body){
		super(req_query, msg_body);
		this.origin_msg_id = msg_body.MsgId[0];
		this.content = msg_body.Content[0];
	}
	deal(callback){
		callback(this.getReplyBody('text', '你的消息是\r\n'+this.content));
	}
}
export default RecvTextMsg;