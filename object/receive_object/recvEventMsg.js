import RecvPostWec from './recvPostWec.js';
class RecvEventMsg extends RecvPostWec {
	constructor(req_query, msg_body){
		super(req_query, msg_body);
		this.create_time = msg_body.CreateTime[0];
		this.event = msg_body.Event[0];
	}
	deal(){
		console.log(this.event);
		return this.getReplyBody('text', '欢迎订阅!');
	}
}
export default RecvEventMsg;