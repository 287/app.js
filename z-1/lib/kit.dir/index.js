

/* --- fillText.js --------------------------------- */
function fillText(text, length, type){
	var eps = '..'
	var start = 0
	var end = 0
	
	length = length || text.length;
	num = length - text.length;
	if(num < 0){
		text =  text.slice(0, num - eps.length) + eps;
		num = 0
	}
	
	switch(type){
		case 'center':
			start = Math.floor(num / 2);
		break; case 'right':
			start = num;
		break; default:
			start = 0;
	}
	end = num - start;
	
	return ' '.repeat(start) + text + ' '.repeat(end);
}


/* --- fnCall.js --------------------------------- */
function fnCall(fn, args, context){
	if(typeof fn === 'function'){
		return fn.apply(context, args);
	}
}


/* --- isAbsolutePath.js --------------------------------- */
function isAbsolutePath(path){
	return path.charAt(0)  === '/' || path.charAt(1)  === ':';
}


/* --- parseCookie.js --------------------------------- */
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


/* --- parseHeader.js --------------------------------- */
/**
 * parse headers and cookies to http respone headers in node
 * @param {object|null} headers - your header object
 * @param {object|null} cookies - your cookies object
 * @return {object} headers parsed
 */
function parseHeader(headers, cookies){
	let cookieKey = 'Set-Cookie';
	let _headers = {};
	let _cookies = [];
	let key, value, k;
	
	if(headers && typeof headers === 'object'){
		for(key in headers){
			value = headers[key];
			if(value == null){
				continue;
			}
			
			k = key.replace(/(^|-)([a-z])/g, function(t1, t, m){
				return t + m.toUpperCase();
			});
			
			if(k !== cookieKey){
				_headers[k] = value;
			}else{
				if(typeof value === 'object'){
					_cookies = _cookies.concat(value);
				}else{
					_cookies.push(value);
				}
			}
		}
	}
	
	if(cookies && typeof cookies === 'object'){
		for(key in cookies){
			value = cookies[key];
			if(value == null){
				continue;
			}
			if(typeof value === 'object'){
				let list = [];
				let v;
				for(k in value){
					v = value[k];
					if(k === 'value'){
						list.push(v);
					}else if(value[k] != null){
						list.push(k + '=' + value[k]);
					}
				}
				value = list.join('; ');
			}
			_cookies.push(key + '=' + value + ';');
		}
	}
	
	if(_cookies.length){
		_headers[cookieKey] = _cookies;
	}
	
	return _headers;
}


/* --- parseUrl.js --------------------------------- */
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


/* --- storage.js --------------------------------- */
function storage(file, o){
	let fs = require('fs');
	let content = false;
	
	if(o === undefined){
		o = {};
		if(fs.existsSync(file)){
			content = fs.readFileSync(file).toString();
			o = content === '' ? o : JSON.parse(content);
		}
	}else{
		fs.writeFileSync(file, JSON.stringify(o));
	}
	
	return o;
}
module.exports = {fillText,fnCall,isAbsolutePath,parseCookie,parseHeader,parseUrl,storage};