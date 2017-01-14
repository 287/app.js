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