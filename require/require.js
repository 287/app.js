/*!
	const loader = Require({
		root: ''
		, param:
	})
	loader.get('dasdasdasd')
*/
'use strict';
class Require{
	constructor(op){
		this.root = '';
		this.suffix = '.js';
		this.dirSuffix = '.dir';
		this.forceUpdate = false;
		
		op = op || {};
		concatObject(this, op);
		
		this.root = !this.root ? process.cwd() : this.root;
		this.root = this.root.replace(/\\/g, '/');
		this.root += this.root.slice(-1) === '/' ? '' : '/';
		
		this.params = {};
		this._alias = {};
		this._cache = {};
		
		concatObject(this.params, op.params);
		concatObject(this._alias, op.alias);
	}
	
	get(name){
		const cache = this._cache
		const alias = this._alias
		const params = this.params
		let path, rs;
		
		path = alias[name] || name;
		
		if(path && ['object', 'function'].indexOf(typeof path) > -1){
			return path;
		}
		
		path = path.indexOf('{') === -1 ? path : path.replace(/\{([a-zA-Z0-9]*)\}/g, (t, m)=>{
			return params[m] == null ? '' : params[m];
		});
		
		path = isAbsolutePath(path) ? path : this.root + path;
		
		if(path.slice(-this.dirSuffix.length) === this.dirSuffix){
			path += path.charAt(path.length - 1) === '/' ? '' : '/';
			concatDirFiles(path);
			path += 'index.js';
		}else{
			path += path.slice(-this.suffix.length) === this.suffix ? '' : this.suffix;
		}
		
		if(this.forceUpdate){
			delete cache[path];
			this.clear(path);
		}
		
		if(path in cache){
			rs = cache[path];
		}else{
			rs = cache[path] = require(path);
		}
		
		return rs;
	}
	
	param(o){
		concatObject(this.params, o);
	}
	
	alias(o){
		concatObject(this._alias, o);
	}
	
	clear(id){
		if(id == null){
			let key;
			for(key in require.cache){
				delete require.cache[key]
			}
		}else{
			id = id.charAt(1) !== ':' ? id : id.replace(/\//g, '\\');
			// console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')
			// console.log('clear cache', id)
			// console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
			delete require.cache[id];
		}
	}
}

function concatObject(target, o){
	if(o && typeof o === 'object'){
		let key;
		for(key in o){
			if(o[key] != null) target[key] = o[key];
		}
	}
}

function isAbsolutePath(path){
	return path.charAt(0)  === '/' || path.charAt(1)  === ':';
}

function concatDirFiles(dirPath){
	const fs = require('fs');
	let list = fs.readdirSync(dirPath);
	let indexPath = dirPath + '/index.js';
	let names = [];
	let contents = [];
	
	list.forEach(function(file){
		let name = file.slice(0, -3);
		if(!/^[a-zA-Z0-9_]+\.js$/.test(file) || name === 'index') return ;
		let path = dirPath + file;
		names.push(name);
		contents.push('\n\n/* --- ' + file + ' --------------------------------- */');
		contents.push(fs.readFileSync(path).toString());
	});
	
	contents.push('module.exports = {' + names.join(',') + '};')

	fs.writeFileSync(indexPath, contents.join('\n'));
	return indexPath;
}


module.exports = Require;