class ReplyWec {
	constructor(reply_body){
		this.my_id = reply_body.my_id;
		this.user_id = reply_body.user_id;
		this.type = reply_body.type;
		this.content = reply_body.content;
	}
	reply(){
		var datetime = new Date().getTime();
		var msg_body = this.packageContent(this.content);

		return `<xml>
			<ToUserName>${this.user_id}</ToUserName>
			<FromUserName>${this.my_id}</FromUserName>
			<CreateTime>${datetime}</CreateTime>
			<MsgType>${this.type}</MsgType>
			${msg_body}
		</xml>`;
	}
	packageContent(){}
}
export default ReplyWec;