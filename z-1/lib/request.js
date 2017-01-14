const formidable = require('formidable');
const querystring = require('querystring');

/**
	$.swap		每次request的请求模块间共享区域
	$.global	所有请求模块间共享区域
	$.sessions	每个用户的所有请求间的共享区域
	
	$.headers	
	$.cookies	
	$.paths	
	$.querys	
	$.posts	
	$.files	
*/
const kit = loader.get('kit');
const proxy = loader.get('proxy');

class Request{
	constructor(req, res, server){
		this.req = req;
		this.res = res;
		this.server = server
		
		this._parseUrl(req.url);
		
		this.isStatic = this.suffix !== '' || /\/$/.test(this.path);
		
		this.statusCode = 200;
		this.method = req.method.toLowerCase();
		
		
		
		this.swap = {};
		this.global = server.swap = server.swap || {};
		
		//* headers and cookies
		this.headers = req.headers;
		this.cookies = kit.parseCookie(req.headers.cookie);
		
		
		//* post data and upload files
		this.posts = {};
		this.files = {};
		
		this.uploadMaxSize = 20 * 1024 * 1024;
		this.uploadMultiples = true;
		this.uploadDir = '';
		this.postEncoding = 'utf-8';
		
		this._cache = {
			contents: []
			, cookies: {}
			, headers: {
				'content-type': 'text/html'
				, 'set-cookie': []
			}
			, headerflushed: false
			, sessionId: null
		};
		
		this.require = server.require;
	}
	
	
	
	_parseUrl(url){
		let host = this.req.host || '';
		Object.assign(this, kit.parseUrl(host + url));
		this.isStatic = this.suffix !== '' || /\/$/.test(this.path);
	}
	
	
	echo(content){
		let isEcho;
		if(content != null){
			if(Buffer.isBuffer(content)){
				isEcho = true;
			}else{
				switch(typeof content){
					case 'number':
						content = content.toString();
					case 'object':
						content = JSON.stringify(content);
					case 'string':
						isEcho = true;
				}
			}
		}
		
		if(isEcho){
			this._cache.contents.push(content);
		}
	}

	
	end(content){
		if(content != null){
			this.echo(content);
		}
		
		this.flush();
		this.res.end();
		this.session('save');
	}

	
	flushHeader(){
		if(!this._cache.headerflushed){
			this._cache.headerflushed = true;
			
			//* set statusCode and headers
			let headers = kit.parseHeader(this._cache.headers, this._cache.cookies);
			this.res.writeHead(this.statusCode, headers);
		}
	}
	
	
	flush(){
		//* flush header before content
		this.flushHeader();
		
		//* flush content
		this._cache.contents.forEach((content)=>{
			this.res.write(content);
		});
		
		this._cache.contents = [];
	}
	
	
	cookie(key, value, op){
		let cookies = this._cache.cookies;
		let rs;
		
		//* get cookie
		if(arguments.length === 1){
			if(key == null){
				rs = cookies;
			}else{
				rs = cookies[key];
				rs = rs == null ? rs : rs.value;
			}
		}else{
			//* set cookie
			op = op || {};
			op.value = value;
			cookies[key] = op;
		}
		return rs;
	}

	
	header(key, value){
		let headers = this._cache.headers;
		let o, rs, k;
		
		if(arguments.length === 1){
			if(key == null){
				rs = headers;
			}else{
				key = key.toLowerCase();
				rs = headers[key];
			}
		}else{
			if(typeof key === 'string'){
				o = {};
				o[key] = value;
			}else{
				o = key;
			}
			if(o && typeof o === 'object'){
				for(key in o){
					k = key.toLowerCase();
					if(k === 'set-cookie'){
						headers[k].push(o[key]);
					}else{
						headers[k] = o[key];
					}
				}
			}
		}
		
		return rs;
	}
	
	
	
	
	getPostData(fn){
		
		let cb = ()=>{
			kit.fnCall(fn, [this.posts, this.files], this);
		};
		if(this.method === 'post'){
			
			switch(this.headers['content-type']){
				case 'application/x-www-form-urlencoded':
					let bufs = [];
					this.req
					.addListener('data', (data)=>{
						bufs.push(data);
					})
					.addListener('end', ()=>{
						let content = Buffer.concat(bufs).toString();
						content = querystring.parse(content);
						Object.assign(this.posts, content);
						cb();
					});
				break; default:
					let form = new formidable.IncomingForm();
					form.maxFieldsSize = this.uploadMaxSize;
					form.multiples = this.uploadMultiples;
					// form.uploadDir = this.uploadDir;
					form.encoding = this.postEncoding;
					
					form.parse(this.req, (error, fields, files)=>{
						let key, item;
						Object.assign(this.posts, fields);
						for(key in files){
							item = files[key];
							//* remove block file
							if(!item.length && item.name === ''){
								delete files[key];
							}
						}
						Object.assign(this.files, files);
						cb();
					});
			}
		}else{
			cb();
		}
		
	}
	
	
	session(key, value){
		switch(key){
			case 'id':
				if(value === undefined){
					return this._cache.sessionId;
				}else{
					this._cache.sessionId = value;
				}
				
			break; case 'name':
				return this.server.sessionName;
				
			break; case 'dir':
				return this.server.sessionDir;
				
			break; case 'path':
				return this.session('dir') + 'session_' + this.session('id') + '.json';
				
			break; case 'save':
				kit.storage(this.session('path'), this.sessions);
				
			break; case 'init': default:
				if(this.session('id') == null){
					let sid = this.cookies[this.session('name')];
					if(!sid){
						sid = Math.floor(Math.random() * 10000000000).toString(36)
						this.cookie(this.session('name'), value);
					}
					this.session('id', sid);
					this.sessions = kit.storage(this.session('path'));
				}
		}
	}
	
	
	go(url){
		if(typeof url === 'string'){
			this._parseUrl(this.req.url);
		}
		
		if(typeof this.server.proxy === 'function'){
			let proxyUrl = this.server.proxy(this);
			if(typeof proxyUrl === 'string'){
				this.server.print('proxy', '' + this.url);
				proxy(proxyUrl, this.req, this.res);
				return ;
			}
		}
		
		this.server.print(['module', 'static'][this.isStatic * 1], this.req.url)
		loader.get('seek')(this);
	}
}



module.exports = Request;

