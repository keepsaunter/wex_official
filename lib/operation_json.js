import fs from 'fs';
function readJson(path, callback=()=>{}){
	fs.open(path, 'r', function(err, fd){
		if(err){
			console.log(err);
		}else{
			fs.readFile(path, 'utf-8', function(err, buffer){
		        if(err){
		        	callback(err);
		        }else{
		        	callback(err, JSON.parse(buffer));
		        }
			})
		}
	})
}
function writeJson(path, data, callback=()=>{}){
	fs.open(path, 'w', function(err, fd){
		if(err){
			callback(err);
		}else{
			fs.write(fd, new Buffer(JSON.stringify(data)), function(err){
				callback(err);
				fs.close(fd);
			})
		}
	})
}
export { readJson, writeJson };