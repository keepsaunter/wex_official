import Controller from './controller.js';
class JadeController extends Controller {
	index(){
		// this.res.redirect('/user/wexAuth');
		// this.res.render('index',{name:'ouchao'});
		this.renderSdk('index',{name:'ouchao'});
	}
}
export default JadeController;