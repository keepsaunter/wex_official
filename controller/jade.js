import Controller from './controller.js';
class JadeController extends Controller {
	index(){
		this.render('index',{name:'ouch<b>ao</b>'});
	}
}
export default JadeController;