import RecvVerifyMsg from './recvVerifyMsg.js';
import RecvTextMsg from './recvTextMsg.js';
import RecvEventMsg from './recvEventMsg.js';
class RecvObjFac {
	constructor(req){
		var recv_object = '';
		if(req.method == "GET"){
			recv_object = new RecvVerifyMsg(req.query);
		}else if(req.method == "POST"){
			switch(req.body.xml.MsgType[0]){
				case 'text': recv_object = new RecvTextMsg(req.query, req.body.xml); break;
				case 'event': recv_object = new RecvEventMsg(req.query, req.body.xml); break;
				default: break;
			}
		}
		return recv_object;
	}
}
export default RecvObjFac;