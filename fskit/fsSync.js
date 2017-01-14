var fs = require('fs')
, fsPath = require('./fsPath')
, fsSync = {}
;


fsSync.isExists = function(path){
	return fs.existsSync(path);
}


fsSync.isDir = function(path){
	return fs.statSync(path).isDirectory();
}


fsSync.isFile = function(path){
	return fs.statSync(path).isFile();
}


fsSync.stat = fs.statSync


fsSync.readFile = function(filePath, op){
	var rs = false
	;
	
	if(this.isFile(filePath)){
		rs = fs.readFileSync(filePath);
		
		if(typeof op.encoding === 'string' && rs !==false){
			iconv = require('iconv-lite');
			rs = iconv.decode(rs, op.encoding);
			rs = rs.toString();
		}
	}
	
	return rs;
}


fsSync.writeFile = function(filePath, str, op){
	var rs = false
	, dirname = ''
	;
	op = op || {};
	
	if(typeof filePath === 'string' && filePath !== ''){
		dirname = this.dirname(filePath);
		if(!this.isExists(dirname)){
			this.mkdir(dirname);
		}
		
		if(typeof op.encoding === 'string'){
			iconv = require('iconv-lite');
			str = iconv.encode(str, op.encoding);
		}
		
		try{
			if(!op.append){
				fs.writeFileSync(filePath, str);
			}else{
				fs.appendFileSync(filePath, str);
			}
			rs = true;
		}catch(e){}
	}
	
	return rs;
}


fsSync.get = function(filePath, fromEncoding){
	fromEncoding = fromEncoding || 'utf8';
	
	return this.read(filePath, {
		encoding: fromEncoding
	});
}


fsSync.set = function(filePath, str, toEncoding){
	return this.write(filePath, str, {
		encoding: toEncoding
	});
}
	
	
fsSync.append = function(filePath, str, toEncoding){
	return this.write(filePath, str, {
		encoding: toEncoding
		, append: true
	});
}


fsSync.getList = fsSync.readdir = function(dirPath, op, fileList){
	var fileList = fileList || []
	, list = []
	, self = this
	;
	op = op || {};
	
	if(fsSync.isDir(dirPath)){
		list = fs.readdirSync(dirPath);
		dirPath = this.fixDirPath(dirPath);
		
		list.forEach(function(path, i){
			var fullPath = dirPath + path
			;
			
			if(self.isDir(fullPath)){
				path += '/';
				fullPath += '/';
			}
			
			if(op.fullPath){
				path = fullPath;
			}
			
			fileList.push(path);
			
			if(op.deep){
				self.getList(fullPath, op, fileList)
			}
		});
	}
	
	return fileList;
}

	
fsSync.copy = function(filePath, filePathNew){
	var rs = false
	;
	if(this.isFile(filePath)){
		rs = fs.readFileSync(filePath);
		fs.writeFileSync(filePathNew, rs);
		rs = true;
	}
	
	return rs;
}


fsSync.remove = function(path){
	var rs = false
	;
	if(this.isFile(path)){
		fs.unlinkSync(path);
		rs = true;
	}else{
		rs = this.rmdir(path);
	}
	
	return rs;
}


fsSync.create = function(path){
	var rs = false
	;
	if(typeof path === 'string' && path !== ''){
		if(path.slice(-1) === '/'){
			rs = this.mkdir(path);
		}else{
			rs = this.set(path, '');
		}
	}
	
	return rs;
}


fsSync.unlink = function(filePath){
	var rs = false
	;
	if(this.isFile(filePath)){
		fs.unlinkSync(filePath);
		rs = true;
	}
	
	return rs;
}


fsSync.rmdir = function(dirPath){
	var rs = false
	;
	if(this.isDir(dirPath)){
		this.getList(dirPath, {deep: true, fullPath: true}).reverse().forEach(function(path, i){
			if(path.slice(-1) === '/'){
				fs.rmdirSync(path);
			}else{
				fs.unlinkSync(path);
			}
		});
		fs.rmdirSync(dirPath);
		rs = true;
	}
	
	return rs;
}


fsSync.mkdir = function(dirPath){
	var rs = false
	;
	dirPath = this.fixDirPath(dirPath);
	
	rs = mkdirDeep(dirPath);
	
	return rs;
}


fsSync.rename = function(filePath, filePathNew){
	var rs = false
	;
	if(fs.renameSync(filePath, filePathNew)){
		rs = true
	}
	
	return rs;
}


fsSync.move = function(filePath, filePathNew){
	var rs = false
	;
	if(this.copy(filePath, filePathNew)){
		rs = this.remove(filePath);
	}
	
	return rs;
}




function mkdirDeep(path){
	var pathList = []
	, error = false
	;
	if(typeof path === 'string' && path !== ''){
		pathList = path.split('/');
		
		pathList.forEach(function(path, i){
			if(!error && path !== ''){
				path = pathList.slice(0, i + 1).join('/');
				if(!fs.existsSync(path)){
					fs.mkdirSync(path);
				}
			}
		});
	}
	
	return !error;
}


module.exports = fsSync;