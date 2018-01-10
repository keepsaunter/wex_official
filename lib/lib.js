function createRandomChart(length){
	var res = Math.random().toString(36).substr(2);
	var len = res.length;
	if(length && length!=len){
		if(length > len)
			res += createRandomChart(length - len);
		else if(length < len){
			res = res.substr(0, length);
		}
	}
	return res;
}
export {
	createRandomChart
}