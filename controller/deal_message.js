import { reply } from '../lib/reply_msg';
function dealTextMessage(my_id, user_id, content, origin_msg_id){
	return reply(my_id, user_id, 'text', '你的消息是：'+content, origin_msg_id);
}
function dealMessage(msg_body){
	var reply_msg = "";
	if(msg_body.MsgType == "text"){
		reply_msg = dealTextMessage(msg_body.ToUserName[0], msg_body.FromUserName[0], msg_body.Content[0], msg_body.MsgId[0]);
	}
	return reply_msg;
}
export { dealMessage }