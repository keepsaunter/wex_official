import ReplyWec from './replyWec';
class ReplyTextMsg extends ReplyWec {
	packageContent(content){
		return "<Content>"+content+"</Content>";
	}
	replyMsg(){
		return "test"
	}
}
export default ReplyTextMsg;