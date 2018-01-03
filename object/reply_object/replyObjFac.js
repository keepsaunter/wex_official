import ReplyTextMsg from './replyTextMsg.js';
class ReplyObjFac {
	constructor(reply_body){
		var reply_object = '';
		switch(reply_body.type){
			case 'text': reply_object = new ReplyTextMsg(reply_body); break;
			default: break;
		}
		return reply_object;
	}
}
export default ReplyObjFac;