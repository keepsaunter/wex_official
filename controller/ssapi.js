import Controller from './controller.js';
import Mysqldb from '../lib/mysqldb';
class SsapiController extends Controller {
	slideshow(){
		var self = this;
		(new Mysqldb()).select('slideshow', 'title,url,image', function(e, r, f){
			if(!e){
				self.resp(r);
			}else{
				self.resp([]);
			}
		});
	}
}
export default SsapiController;