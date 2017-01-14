var fs = require('fs')
, gaze = require('gaze')
, asyncb = require('asyncb')
, fsUtils = require('./fsUtils')
, fsPath = require('./fsPath')
, fsAsync = {}
;

fsAsync.maxHandle = 70;

fsAsync.isExists = function(path, callback){
	fs.exists(path, function(rs){
		fscb(callback, null, rs);
	});
	
	return this;
}


fsAsync.isFile = function(path, callback){
	fs.stat(path, mkfscb(callback, function(rs){
		return rs.isFile();
	}));
	
	return this;
}


fsAsync.isDir = function(path, callback){
	fs.stat(path, mkfscb(callback, function(rs){
		return rs.isDirectory();
	}));
	
	return this;
}


fsAsync.stat = fs.stat;


/**
 * read file - return stream
 * @param {string} path - file path
 * @param {object} [op] - options
 * @param {function} callback({error} err=null, {boolean} rs)
 * @return {this}
 */
fsAsync.readFile = function(path, op, callback){
	var self = this
	;
	if(typeof op === 'function'){
		callback = op;
		op = null;
	}
	
	fs.readFile(path, op, mkfscb(callback, function(rs){
		return rs;
	}));
	
	return this;
}


/**
 * write file - will mkdir if file's dirname not exists
 * @param {string} path - file path
 * @param {string|stream} content - write content
 * @param {object} [op={}] - options
 * @param {string|null} [op.encoding=null] - encode content to encoding 
 * @param {boolean} [op.append=false] - if append mode
 * @param {function} callback({error} err=null, {boolean} rs)
 * @return {this}
 */
fsAsync.writeFile = function(path, content, op, callback){
	var dirname = fsPath.dirname(path)
	, self = this
	;
	if(typeof op === 'function'){
		callback = op;
		op = null;
	}
	
	op = op || {};
	
	if(typeof op.encoding === 'string' && op.encoding !== 'utf8'){
		content = fsUtils.encode(content, op.encoding);
	}
	
	fsAsync.mkdirIfNot(dirname, mkfscb(callback, function(){
		fs[op.append ? 'appendFile' : 'writeFile'](path, content, mkfscb(callback, function(a){
			return true;
		}));
	}));
	
	return this;
}


fsAsync.appendFile = function(path, content, op, callback){
	var dirname = fsPath.dirname(path)
	, self = this
	;
	if(typeof op === 'function'){
		callback = op;
		op = null;
	}
	
	op = op || {};
	op.append = true;
	
	return fsAsync.writeFile(path, content, op, callback);
}


/**
 * get file content - return string
 * @param {string} path - file path
 * @param {string} [encoding=utf8] - encode content to encoding
 * @param {function} callback({error} err=null, {string} rs)
 * @return {this}
 */
fsAsync.get = function(path, encoding, callback){
	if(typeof encoding === 'function'){
		callback = encoding;
		encoding = undefined;
	}
	encoding = encoding === undefined ? '' : encoding;
	
	fsAsync.readFile(path, {encoding: encoding}, mkfscb(callback, function(rs){
		if(typeof encoding === 'string'){
			if(encoding === '' || encoding === 'utf8'){
				rs = rs.toString();
			}else{
				rs = fsUtils.decode(rs, encoding);
			}
		}
		return rs;
	}));
	
	return this;
}


/**
 * get file content list
 * @param {array<string>} paths - file path list
 * @param {string} [encoding=utf8] - encode content to encoding
 * @param {function} callback({error} err=null, {array<string>} rs)
 * @return {this}
 */
fsAsync.gets = function(paths, encoding, callback){
	var contents = {}
	, errors = {}
	, list = []
	, errExists = false
	, hub
	;
	if(typeof encoding === 'function'){
		callback = encoding;
		encoding = undefined;
	}
	
	hub = asyncb.hub(paths.length, function(){
		for(var i = 0; i < paths.length; i++){
			list.push(contents[i]);
		}
		
		fscb(callback, errExists ? errors : null, list);
	});
	
	paths.forEach(function(path, i){
		fsAsync.get(path, encoding, function(err, content){
			contents[i] = content;
			if(err){
				errors[i] = err;
				errExists = true;
			}
			hub.done(i);
		});
	});
	
	return this;
}


/**
 * get file content list
 * @param {array<string>} paths - file path list
 * @param {string} [encoding=utf8] - encode content to encoding
 * @param {function} callback({error} err=null, {array<string>} rs)
 * @return {this}
 */
fsAsync.sets = function(paths, encoding, callback){
	var results = {}
	, errors = {}
	, list = []
	, errExists = false
	, hub
	;
	if(typeof encoding === 'function'){
		callback = encoding;
		encoding = null;
	}
	
	hub = asyncb.hub(Object.keys(paths), function(){
		fscb(callback, errExists ? errors : null, results);
	});
	
	for(key in paths){
		(function(key, value){
			fsAsync.set(key, value, encoding, function(err, rs){
				results[key] = rs;
				if(err){
					errors[key] = err;
					errExists = true;
				}
				hub.done(key);
			});
		})(key, paths[key]);
		
	}
	
	return this;
}


/**
 * set file content
 * @param {string} path - file path
 * @param {string|stream} content
 * @param {string} [encoding=null] - encode content to encoding
 * @param {function} callback({error} err=null, {boolean} rs)
 * @return {this}
 */
fsAsync.set = function(path, content, encoding, callback){
	if(typeof encoding === 'function'){
		callback = encoding;
		encoding = null;
	}
	
	return fsAsync.writeFile(path, content, {encoding: encoding}, callback);
}


/**
 * create file
 * @param {string} path - file path
 * @param {string|stream} content
 * @param {function} callback({error} err=null, {boolean} rs)
 * @return {this}
 */
fsAsync.touch = function(path, callback){
	return fsAsync.writeFile(path, '', callback);
}

/**
 * append file content
 * @param {string} path - file path
 * @param {string|stream} content
 * @param {string} [encoding=null] - encode content to encoding
 * @param {function} callback({error} err=null, {boolean} rs)
 * @return {this}
 */
fsAsync.append = function(path, content, encoding, callback){
	if(typeof encoding === 'function'){
		callback = encoding;
		encoding = null;
	}
	
	return fsAsync.writeFile(path, content, {encoding: encoding, append: true}, callback);
}


/**
 * rename file name
 * @param {string} path - file path
 * @param {string} pathNew - file path to set
 * @param {string|stream} content
 * @param {function} callback({error} err=null, {boolean} rs)
 * @return {this}
 */
fsAsync.rename = fsAsync.move = function(path, pathNew, callback){
	fsAsync.mkdirIfNot(fsPath.dirname(pathNew), mkfscb(callback, function(){
		fs.rename(path, pathNew, mkfscb(callback, function(){
			return true;
		}));
	}));
	
	return this;
}


/**
 * copy file
 * @param {string} path - file path
 * @param {string} pathNew - file path to set
 * @param {function} callback({error} err=null, {boolean} rs)
 * @return {this}
 */
fsAsync.copyFile = function(path, pathNew, callback){
	fsAsync.readFile(path, mkfscb(callback, function(rs){
		fsAsync.writeFile(pathNew, rs, mkfscb(callback, function(rs){
			return true;
		}));
	}));
	
	return this;
}


/**
 * copy dir
 * @param {string} path - dir path
 * @param {string} pathNew - dir path to set
 * @param {function} callback({error} err=null, {boolean} rs)
 * @return {this}
 */
fsAsync.copyDir = function(path, pathNew, callback){
	path = fsPath.fixDirPath(path);
	pathNew = fsPath.fixDirPath(pathNew);
	
	asyncb.flow(function(queue){
		queue
		.pipe(function(){
			fsAsync.getList(path, {deep: true}, mkfscb(callback, queue.next));
		})
		.pipe(function(list){
			if(list.length === 0){
				fsAsync.mkdirIfNot(pathNew, mkfscb(callback, function(){
					queue.go('end');
				}));
			}else{
				queue.next(list);
			}
		})
		.pipe(function(list){
			var dirList = []
			, fileList = []
			;
			list.forEach(function(tPath, i){
				if(tPath.slice(-1) === '/'){
					dirList.push(tPath);
				}else{
					fileList.push(tPath);
				}
			});
			
			asyncb.each(dirList, function(next, tPath, i){
				fsAsync.mkdirIfNot(pathNew + tPath, mkfscb(callback, function(){
					next();
				}));
			}, function(){
				queue.next(fileList);
			});
		})
		.pipe(function(list){
			var eachLength = fsAsync.maxHandle
			, times = Math.ceil(list.length / eachLength)
			;
			asyncb.each(times, function(next, index){
				var tList = list.slice(index * eachLength, (index + 1) * eachLength);
				var hub = asyncb.hub(tList.length, function(){
					next();
				});
				tList.forEach(function(tPath, i){
					fsAsync.copyFile(path + tPath, pathNew + tPath, mkfscb(callback, function(){
						hub.done(i);
					}));
				});
			}, queue.next);
		})
		.pipe('end', function(){
			fscb(callback, null, true);
		});
	});
	
	return this;
}



fsAsync.copy = function(path, pathNew, callback){
	fsAsync.isDir(path, mkfscb(callback, function(rs){
		if(rs){
			fsAsync.copyDir(path, pathNew, callback);
		}else{
			fsAsync.copyFile(path, pathNew, callback);
		}
	}));
	
	return this;
}


/**
 * delete file
 * @param {string} path - file path
 * @param {function} callback({error} err=null, {boolean} rs)
 * @return {this}
 */
fsAsync.unlink = function(path, callback){
	fs.unlink(path, mkfscb(callback, function(rs){
		return true;
	}));
	
	return this;
}


/**
 * empty dir - will empty dir
 * @param {string} path - dir path
 * @param {function} callback({error} err=null, {boolean} rs)
 * @return {this}
 */
fsAsync.empty = function(path, callback){
	var dirList = []
	;
	asyncb.flow(function(queue){
		queue
		.pipe(function(){
			fsAsync.getList(path, {deep: true, fullPath: true}, mkfscb(callback, queue.next));
		})
		.pipe(function(list){
			var fileList = []
			;
			list.forEach(function(name, i){
				if(/\/$/.test(name)){
					dirList.push(name);
				}else{
					fileList.push(name);
				}
			});
			queue.next(fileList);
		})
		.pipe(function(fileList){
			var hub = asyncb.hub(fileList.length, function(){
				queue.next();
			});
			
			fileList.reverse().forEach(function(name, i){
				fsAsync.unlink(name,  mkfscb(callback, function(){
					hub.done(i);
				}));
			});
		})
		.pipe(function(){
			asyncb.each(dirList.reverse(), function(next, path){
				fs.rmdir(path, mkfscb(callback, function(rs){
					next();
				}));
			}, function(){
				queue.next();
			});
		})
		.pipe(function(){
			fscb(callback, null, true);
		})
	});
	
	return this;
}


/**
 * delete dir - will empty dir and delete dir
 * @param {string} path - dir path
 * @param {function} callback({error} err=null, {boolean} rs)
 * @return {this}
 */
fsAsync.rmdir = function(path, callback){
	fsAsync.empty(path, mkfscb(callback, function(rs){
		fs.rmdir(path, mkfscb(callback, function(rs){
			fscb(callback, null, true);
		}));
	}));
	
	return this;
}


/**
 * delete dir or file - will delete dir or file
 * @param {string} path - dir path or file path
 * @param {function} callback({error} err=null, {boolean} rs)
 * @return {this}
 */
fsAsync.remove = function(path, callback){
	
	fsAsync.isDir(path, mkfscb(callback, function(rs){
		if(rs){
			fsAsync.rmdir(path, callback);
		}else{
			fsAsync.unlink(path, callback);
		}
	}));
	
	return this;
}


/**
 * make dir - recursive create dir
 * @param {string} path - dir path
 * @param {function} callback({error} err=null, {boolean} rs)
 * @return {this}
 */
fsAsync.mkdir = function(path, callback){
	asyncb.flow(function(queue){
		queue
		.add('isdir', function(dirPath){
			fsAsync.isDir(dirPath, mkfscb(callback, function(rs){
				if(rs){
					queue.nextEach();
				}else{
					queue.go('err', '"' + dirPath + '" is exists and it not a dir');
				}
			}, function(err){
				if(err.code === 'ENOENT'){
					//* not exists
					queue.mkdir(dirPath);
				}else{
					return false;
				}
			}));
		})
		.add('mkdir', function(dirPath){
			fs.mkdir(dirPath, mkfscb(callback, function(rs){
				queue.nextEach();
			}, function(err){
				if(err.code === 'EEXIST'){
					//* exists
					queue.nextEach();
				}else{
					return false;
				}
			}));
		})
		.pipe(function(){
			fsAsync.isDir(path, mkfscb(callback, function(rs){
				if(rs){
					queue.go('end');
				}else{
					queue.go('err', 'this path is exists and it not a dir');
				}
			}, function(err){
				if(err.code === 'ENOENT'){
					//* not exists
					queue.next();
				}else{
					return false;
				}
			}));
		})
		.pipe(function(){
			var pathList = fsPath.fixDirPath(path).split('/');
			
			asyncb.each(pathList, function(next, dirPath, i){
				if(i === pathList.length - 1 || dirPath === ''){
					return next();
				}
				queue.nextEach = next;
				dirPath = pathList.slice(0, i + 1).join('/');
				queue.isdir(dirPath);
				
			}, function(){
				queue.go('end')
			});
		})
		.pipe('end', function(){
			fscb(callback, null, true);
		})
		.pipe('err', function(errMsg){
			fscb(callback, new Error('mkdir "' + path + '" error: ' + errMsg), false);
		})
	});
	
	return this;
}


/**
 * get file list - recursive get file list
 * @param {string} dirPath - dir path
 * @param {object} op - option
 *  @param {~boolean} op.fullPath - path with "dirPath"
 *  @param {~boolean} op.deep - recursive
 * @param {function} callback({error} err=null, {boolean} rs)
 * @return {this}
 */
fsAsync.getList = fsAsync.readdir = function(dirPath, op, callback){
	var self = this
	, pathList = []
	, hub
	;
	if(typeof op === 'function'){
		callback = op;
		op = null;
	}
	op = op || {};
	
	dirPath = fsPath.fixDirPath(dirPath);
	
	hub = asyncb.hub(function(){
		fscb(callback, null, pathList);
	});
	
	scanDir({
		dir: dirPath
		, list: []
		, path: op.fullPath ? dirPath: ''
		, index: 0
	});
	
	function scanDir(cfg){
		hub.add(cfg.dir);
		
		asyncb.flow(function(queue){
			queue
			.pipe(function(){
				fs.readdir(cfg.dir, mkfscb(callback, function(list){
					if(list.length){
						cfg.list = list;
						queue.next();
					}else{
						queue.go('re');
					}
				}));
			})
			.pipe('check', function(){
				var name = cfg.list[cfg.index]
				, path = cfg.dir + name
				;
				
				fsAsync.isDir(path, mkfscb(callback, function(rs){
					if(rs){
						name += '/';
						path += '/';
						
						if(op.deep){
							scanDir({
								dir: path
								, list: []
								, path: cfg.path + name
								, index: 0
							});
						}
					}
					
					pathList.push(cfg.path + name);
					queue.next();
				}, function(){
					pathList.push(cfg.path + name);
					queue.next();
				}));
			})
			.pipe('re', function(){
				cfg.index++;
				if(cfg.index < cfg.list.length){
					queue.go('check');
				}else{
					hub.done(cfg.dir);
				}
			})
		});
	}
	
	return this;
}


fsAsync.glob = function(dirPath, op, callback){
	var self = this
	, pathList = []
	, hub
	;
	// todo
	
	return this;
}

/**
 * watch file or dir change
 * @param {string|array<string>} glob - glob selector or selector list
 * @param {function} callback({string} type, {string} filePath) - callback when file status is change, rename, delete, create
 * @param {function} errCallback({error} e) - callback when error occured
 * @return {undefined}
 */
fsAsync.watch = function(glob, callback, errCallback){
	gaze(glob, mkfscb(errCallback, function(watcher){
		watcher.on('all', function(e, file){
			callback.isEnded = false;
			fscb(callback, e, file);
		})
		.on('error', function(e){
			fscb(errCallback, e);
		})
		;
	}));
	
	return this;
}





/**
 * make dir path if not exists
 * @param {string} path - dir path
 * @param {function} callback(err, rs) - the callback of fs
 * @return {undefined}
 */
fsAsync.mkdirIfNot = function(path, callback){
	var dirname = path
	;
	asyncb.flow(function(queue){
		queue
		.add('mkdir', function(dirname){
			fsAsync.mkdir(dirname, mkfscb(callback, function(){
				queue.next();
			}, function(err){
				
			}));
		})
		.pipe(function(){
			fsAsync.isExists(dirname, mkfscb(callback, function(exists){
				if(!exists){
					queue.mkdir(dirname);
				}else{
					queue.next();
				}
			}));
		})
		.pipe(function(){
			fscb(callback, null, true);
		});
	});
	
	return this;
}


/**
 * make fs callback
 * @param {function} callback(err, rs) - the callback of fs
 * @param {function} noErrFn({object} rs) - if not err callback. return rs
 * @param {function} errFn - if not err callback
 * @return {function}
 */
function mkfscb(callback, noErrFn, errFn){
	return function(err, rs){
		var runCallback = true
		;
		rs = rs === undefined ? true : rs;
		
		//console.log('mkfscb', err, rs)
		// if(err != null && Object.prototype.toString.call(err) !== '[object Error]'){
			// rs = err;
			// err = null;
		// }
		
		if(err && typeof errFn === 'function'){
			rs = errFn(err);
			if(rs === undefined){
				runCallback = false;
			}
		}
		
		if(err == null && typeof noErrFn === 'function'){
			rs = noErrFn(rs);
			if(rs === undefined){
				runCallback = false;
			}
		}
		
		if(runCallback){
			fscb(callback, err, rs);
		}
	};
}


/**
 * fs callback
 * @param {function} callback(err, rs) - the callback of fs
 * @param {error} err - fs error
 * @param {object} rs - fs result
 * @return {null}
 */
function fscb(callback, err, rs){
	if(typeof callback === 'function'){
		rs = rs === undefined ? false : rs;
		if(!callback.isEnded){
			callback.isEnded = true;
			callback(err, rs);
		}
	}
}



module.exports = fsAsync;