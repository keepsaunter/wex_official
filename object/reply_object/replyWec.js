import RecvWec from '../receive_object/recvWec.js';
class ReplyWec extends RecvWec {
	reply(my_id, user_id, msg_type, content, origin_msg_id){
		var datetime = new Date().getTime();
		var msg_body = "";
		if(msg_type == "text"){
			msg_body = textMessage(content);
		}
		return `<xml>
			<ToUserName>${this.user_id}</ToUserName>
			<FromUserName>${this.my_id}</FromUserName>
			<CreateTime>${datetime}</CreateTime>
			<MsgType>${this.msg_type}</MsgType>
			${this.msg_body}
		</xml>`;
	}
	packageContent(){}
}
export default ReplyWec;