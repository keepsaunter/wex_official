import RecvGetWec from './recvGetWec.js';
class RecvVerifyMsg extends RecvGetWec {
	constructor(req_query){
		super(req_query);
		this.echostr = req_query.echostr;
	}
	reply(){
		return this.wexVerify();
	}
}
export default RecvVerifyMsg;