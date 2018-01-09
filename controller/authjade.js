import Controller from './controller.js';
class AuthJadeController extends Controller {
	constructor(req, res, next){
		super(req, res, next);
		this.res.redirect('/user/wexAuth?url='+req.originalUrl);
	}
	index(){
		console.log(this.req)
		this.res.redirect('/user/wexAuth');
	}
}
export default AuthJadeController;