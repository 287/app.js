/**
 * parse url
 * @param {string} url
 * @return {object} url object
 */
function parseUrl(url){
	var item = {
		url: url
		, protocol: 'http:'
		, host: ''
		, hostname: ''
		, port: 80
		, path: ''
		, query: ''
		, hash: ''
		, suffix: ''
		, paths: []
		, querys: {}
	}
	, keys = {
		'hash': '#'
		, 'query': '?'
		, 'protocol': '//'
		, 'path': '/'
		, 'port': ':'
	}
	, afterMode = 1
	, key, tmp
	;
	
	//* url decode
	if(url.indexOf('%') > -1){
		item.url = url = decodeURIComponent(url);
	}
	
	//* split
	for(key in keys){
		tmp = splitOnce(url, keys[key]);
		if(tmp.length > 1){
			afterMode = ['protocol'].indexOf(key) === -1
			url = tmp[Math.abs(1 - afterMode)];
			item[key] = tmp[Math.abs(0 - afterMode)];
		}
	}
	item.hostname = url;
	
	//* parse suffix
	tmp = item.path.match(/(\.[a-zA-Z0-9]+)$/);
	item.suffix = !tmp ? item.suffix : tmp[1];
	
	//* parse host
	item.host = item.hostname + (item.port === '' ? '' : ':' +  item.port);
	
	//* parse querys
	if(item.query !== ''){
		item.query.split('&').forEach(function(key){
			tmp = splitOnce(key, '=');
			item.querys[tmp[0]] = tmp[1];
		});
		item.query = keys.query + item.query;
	}
	
	//* parse paths
	if(item.path !== ''){
		tmp = item.suffix === '' ? item.path : item.path.slice(0, 0 - item.suffix.length - 1);
		tmp.split('/').forEach(function(key){
			item.paths.push(key);
		});
	}
	item.path = keys.path + item.path;
	
	return item;
	
	
	function splitOnce(str, s){
		var i = str.indexOf(s);
		var list = [str];
		if(i > -1){
			list[1] = str.slice(i + s.length);
			list[0] = str.slice(0, i);
		}
		return list;
	}
}