function parseCookie(str){
	var cookies = {};
	str = str || '';
	str.split('; ').forEach(function(item){
		var i = item.indexOf('=');
		if(i > -1){
			cookies[item.slice(0, i)] = item.slice(i + 1);
		}
	});
	return cookies;
}