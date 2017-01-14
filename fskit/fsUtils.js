var fs = require('fs')
, globkit = require('globkit')
, iconv = require('iconv-lite')
, utils = {}
;


/**
 * parse string or stream with this encoding to utf8 encoding
 * @param {string|stream} content
 * @param {string} encoding
 * @return {string} path parsed
 */
utils.decode = function(content, encoding){
	var rs = null
	;
	if(iconv){
		rs = iconv.decode(content, encoding);
	}
	return rs;
}


/**
 * parse utf8 encoding string or stream to this encoding
 * @param {string|stream} content
 * @param {string} encoding
 * @return {string} path parsed
 */
utils.encode = function(content, encoding){
	var rs = null
	;
	if(iconv){
		rs = iconv.encode(content, encoding);
	}
	return rs;
}


/**
 * filter file path in list within this glob selector
 * @param {string|array<string>} glob - selector
 * @param {array<string>} paths - path list
 * @return {array<string>} - filter path list
 */
utils.filter = function(glob, paths){
	var list = []
	;
	paths.forEach(function(path){
		if(utils.globMatch(glob, path)){
			list.push(path);
		}
	});
	
	return list;
}


utils.globMatch = globkit.match;



module.exports = utils;