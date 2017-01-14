var fs = require('fs')
, fsPath = require('path')
, utils = {}
;


/**
 * parse path to unix like with /
 * @param {string} path
 * @return {string} path parsed
 */
utils.fixPath = function(path){
	path = path == null ? '' : path + '';
	
	if(path.indexOf('\\') > -1){
		path = path.replace(/\\/g, '/');
	}
	path = path.replace(/(\/{2,})/g, '/');
	
	return path;
}
	

/**
 * parse dir path to unix like and add / in ending
 * @param {string} path
 * @return {string} path parsed
 */
utils.fixDirPath = function(path){
	path = this.fixPath(path);
	
	if(path !== ''){
		if(path.slice(-1) !== '/'){
			path += '/';
		}
	}
	
	return path;
}


/**
 * parse path to normalize
 * @param {string} path
 * @return {string} path parsed
 */
utils.normalize = function(path){
	return this.fixPath(fsPath.normalize(path));
}


/**
 * parse path to normalize
 * @param {string} path
 * @return {string} path parsed
 */
utils.realPath = function(path){
	return this.fixPath(fsPath.resolve(path));
}


/**
 * check path is absolute
 * @param {string} path
 * @return {string} path parsed
 */
utils.isAbsolutePath = function(path){
	return fsPath.isAbsolute(path);// path.charAt(0) === '/' || /^[a-z]:/i.test(path);
}


/**
 * get current workspace path
 * @return {string} path
 */
utils.cwd = function(){
	return this.fixDirPath(process.cwd());
}


/**
 * get file's dir name
 * @param {string} path - file path
 * @return {string} path
 */
utils.dirname = function(path){
	return this.fixDirPath(fsPath.dirname(path));
}


/**
 * get file's ext name with "."
 * @param {string} path - file path
 * @param {boolean} [withDot=true] - with "."
 * @return {string} path
 */
utils.extname = function(path, withDot){
	withDot = withDot == null ? true : withDot;
	path = fsPath.extname(path);
	return withDot ? path : path.replace('.', '');
}


/**
 * get file name without ext name
 * @param {string} path - file path
 * @return {string} path
 */
utils.filename = function(path){
	return fsPath.basename(path, this.extname(path));
}


/**
 * get file name with ext name
 * @param {string} path - file path
 * @return {string} path
 */
utils.basename = function(path, extname){
	return fsPath.basename(path, extname);
}


module.exports = utils;