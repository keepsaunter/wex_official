import ReplyWec from './replyWec';
class ReplyTextMsg extends ReplyWec {
	constructor(reply_body){
		super(reply_body);
	}
	packageContent(content){
		return "<Content>"+content+"</Content>";
	}
}
export default ReplyTextMsg;