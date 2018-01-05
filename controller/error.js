import Controller from './controller.js';
class ErrorController extends Controller {
	err(code){
		switch(code){
			case 200: this.resp({st:200, data:''});break;
			case 404: this.render('error');break;
			default: this.resp({st:code, data:'error'});break;
		}
	}
}
export default ErrorController;