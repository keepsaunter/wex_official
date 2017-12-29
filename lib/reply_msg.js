function textMessage(content){
	return "<Content>"+content+"</Content>";
}
function reply(my_id, user_id, msg_type, content, origin_msg_id){
	var datetime = new Date().getTime();
	var msg_body = "";
	if(msg_type == "text"){
		msg_body = textMessage(content);
	}
	return `<xml>
		<ToUserName>${user_id}</ToUserName>
		<FromUserName>${my_id}</FromUserName>
		<CreateTime>${datetime}</CreateTime>
		<MsgType>${msg_type}</MsgType>
		${msg_body}
	</xml>`;
}
export { reply };