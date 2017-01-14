module.exports = {
	match: globMatch
	, getPaths: globMatchPaths
};


/**
 * get dir paths from glob selectors
 * @param {string|array<string>} globs - selector
 * @return {array<string>} - path list
 */
function globMatchPaths(globs){
	// TODO
}


/**
 * check path by glob selector
 * @param {string|array<string>} globs - selector
 * @param {string} path
 * @return {boolean} - is match
 */
function globMatch(globs, path){
	var globs = Object.prototype.toString.call(globs) === '[object Array]' ? globs : [globs]
	, regxs = {
		exclude: []
		, match: []
	}
	, rs = false
	, glob, regx, type, i
	;
	
	//* parse match to regx
	for(i = 0; i < globs.length; i++){
		glob = globs[i];
		if(typeof glob === 'string'){
			type = glob.charAt(0) === '!' ? 'exclude' : 'match';
			
			if(type === 'exclude'){
				glob = glob.substr(1);
			}
			
			if(/\*|\?|\[|\{/.test(glob)){
				glob = glob.replace(/(\*\*|\*|\?|\{[^\}]*\}|\[[^\]]*\])/g, function(key){
					var m = 0
					;
					switch (key){
						case '?':
							m = '.';
						break; case '*':
							m = '{`0}';
						break; case '**':
							m = '{`1}';
						break; default:
							switch (key[0]){
								case '{':
									key = key.substr(1, key.length - 2);
									m = '(' + key.replace(/,/g, '|') + ')';
								break; case '[':
									m = key;
							}
					}
					return m;
				})
				.replace(/\{`(\d+)\}/g, function revertGlobKey(t, key){
					return ['[^\\/]*', '.*'][key];
				});
				
				glob = '^' + glob + '$';
				glob = new RegExp(glob);
			}

			regxs[type].push(glob);
		}
	}

	//* check path with regx
	globs = regxs.exclude;
	if(globs.length){
		rs = true;
		for(i = 0; i < globs.length; i++){
			if(ruleTest(globs[i], path)){
				rs = false;
				break;
			}
		}
	}

	if((globs.length && rs) || globs.length === 0){
		globs = regxs.match;
		if(globs.length){
			rs = false;
			for(i = 0; i < globs.length; i++){
				if(ruleTest(globs[i], path)){
					rs = true;
					break;
				}
			}
		}
	}
	
	return rs;
	
	
	function ruleTest(regx, str){
		return typeof regx === 'string' ? regx === str : regx.test(str);
	}
}