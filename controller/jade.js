import Controller from './controller.js';
class JadeController extends Controller {
	index(){
		// this.res.render('index',{name:'ouchao'});
		this.renderSdk('index',{name:'ouchao'}, ['onMenuShareAppMessage','getNetworkType','startRecord','stopRecord','playVoice','onVoiceRecordEnd']);
	}
	auth(){
		this.res.redirect('/user/wexAuth');
	}
}
export default JadeController;