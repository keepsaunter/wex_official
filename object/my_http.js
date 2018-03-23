class MyHttp {
	constructor(option){
		this.url = option.url;
		this.data = option.data||'';
		this.charset = option.charset||'utf8';
		this.headers = option.headers || {'Content-Type':'application/json'};
		if(/https:\/\//.test(this.url)){
			this.module = require('https');
		}else{
			this.module = require('http');
		}
	}
	setOption(option){
		Object.assign(this, option);
	}
	post(callback){
		var t_data = this.data;
		if(typeof t_data == "object"){
			t_data = JSON.stringify(t_data);
		}
		var hostname = this.url.match(/\/\/([a-zA-Z\.0-9:]*)/)[1];
		var path = this.url.substr(this.url.indexOf(hostname)+hostname.length);
		this.headers['Content-Length'] = Buffer.byteLength(t_data);

		var opt = {
		  hostname: hostname,
		  method: 'POST',
		  path: path,
		  headers: this.headers
		};

		var req = this.module.request(opt, function(res) {
			res.setEncoding(this.charset);
			res.on('data', (data)=>{
				callback("", data);
			});
		});
		req.on('error', function(e) {
			callback(e, "");
		});
		req.write(t_data);
		req.end();
	}
	get(callback){
		var req = this.module.get(this.url, (res)=> {
			res.setEncoding(this.charset);
			var t_data = '';
		    res.on("data", (data)=>{
		    	t_data += data
		    })
		    res.on('end', ()=>{
		    	callback("", t_data);
		    })
		})
		req.on('error', function(e) {
			callback(e, "");
		});
		req.end();
	}
}
export default MyHttp;