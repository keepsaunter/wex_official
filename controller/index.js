import Controller from './controller.js';
import RecvObjFac from '../object/receive_object/recvObjFac.js';

class IndexController extends Controller {
	index(){
		var receive_object = new RecvObjFac(this.req);
		if(receive_object){
			receive_object.deal((data)=>{
				this.resp({type: 'text/plain', data: data?data:'success'});
			})
		}else{
			this.resp({st: 999, msg: 'error'})
		}
		// this.resp({type: 'text/plain', data:new RecvObjFac(this.req).deal()});
	}
}
export default IndexController;