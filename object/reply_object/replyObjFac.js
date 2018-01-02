import ReplyTextMsg from './replyTextMsg.js';
class ReplyObjFac {
	constructor(req){
		var reply_object = '';
		console.log(req.body.xml.MsgType[0]);
		switch(req.body.xml.MsgType[0]){
			case 'text': reply_object = new ReplyTextMsg(req.body.xml); break;
		}
		return reply_object;
	}
}
export default ReplyObjFac;