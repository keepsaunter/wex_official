import Controller from './controller.js';
import RecvObjFac from '../object/receive_object/recvObjFac.js';

class IndexController extends Controller {
	index(){
		this.resp({type: 'text/plain', data:new RecvObjFac(this.req).deal()});
	}
}
export default IndexController;