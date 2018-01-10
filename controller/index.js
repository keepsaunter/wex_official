import Controller from './controller.js';
import RecvObjFac from '../object/receive_object/recvObjFac.js';

class IndexController extends Controller {
	index(){
		new RecvObjFac(this.req).deal((data)=>{
			this.resp({type: 'text/plain', data: data?data:'success'});
		})
		// this.resp({type: 'text/plain', data:new RecvObjFac(this.req).deal()});
	}
}
export default IndexController;