'use strict';
const http = require('http');
const https = require('https');
const fspath = require('path');
const fskit = require('fskit');
const asyncb = require('asyncb');

const Require = loader.get('Require');
const kit = loader.get('kit');


class Server{
	
	constructor(op){
		this.version = 'z-1 1.0.0';
		
		//* default 
		this.root = 'app/';
		this.port = 80;
		this.host = 'localhost';
		this.indexs = ['index', 'index.html'];
		this.supports = ['.jsx', ''];
		this.mimeTypes = loader.get('mimeTypes');
		this.swap = {};
		this.proxy = null;
		this.beforeRequest = null;
		
		//* default session config 
		this.sessionName = 'o_-';
		this.sessionDir = 'session/';
		this.sessionExpire = 1 * 60 * 60;
		this.sessionLoop = 3 * 60;
		
		//* parse config 
		this._parseConfig(op);
		
		this.init();
	}
	
	
	init(){
		this.createHttpServer();
		this._initLoader();
		this.fixError();
		this.print('root', this.root);
	}
	

	_initOther(){
		
	}
	

	_parseConfig(op){
		let beArrayKeys = ['index', 'support'];
		let aliasKeys = {index: 'indexs', support: 'supports'};
		let key, value;
		
		op = op || {};
		
		for(key in op){
			value = op[key];
			key = aliasKeys[key] || key;
			
			if(this[key] === undefined){
				continue;
			}
			
			if(beArrayKeys.indexOf(key) > -1){
				if(value != null && value.constructor !== Array){
					throw `server ${key} must be array`;
					return ;
				}
			}
			
			switch(key){
				case 'root':
					if(!fskit.isAbsolutePath(value)){
						value = process.cwd() + '/' + value;
					}
					
				break; case 'index':
			}
			
			this[key] = value;
		}
		
		this.root = fskit.fixDirPath(fspath.resolve(this.root));
	}

	
	fixError(){
		process.on('uncaughtException', function(e){
			console.log('[ error ]', e);
		})
	}


	start(){
		this._httpServer.listen(this.port);
		this.print('listen', this.port);
		
		this.clearSession();
	}


	clearSession(){
		let time = Date.now();
		let expire = this.sessionExpire * 1000;
		fskit.getList(this.sessionDir, (err, list)=>{
			asyncb.each(list, (next, file)=>{
				let path = this.sessionDir + file;
				fskit.stat(path, (err, stat)=>{
					if(time - stat.mtime.getTime() >= expire){
						fskit.unlink(path);
					}
					next();
				});
			}, ()=>{
				setTimeout(()=>{
					this.clearSession();
				}, this.sessionLoop * 1000)
			});
		});
	}


	close(){
		this.httpServer.close();
	}
	
	
	createHttpServer(){
		let httpServer = this._httpServer = new http.Server();
		
		httpServer.on('request', (req, res)=>{
			return this._request(req, res);
		});
		
		httpServer.on('error', (e)=>{
			if (e.code === 'EADDRINUSE'){
				this.print('port error', this.port + ' is inuse, please change other port');
				this.close();
			}else{
				this.print('error', e);
			}
		});
	}
	
	
	_request(req, res){
		const Request = loader.get('request');
		let $ = new Request(req, res, this);
		
		$.header('server', this.version);
		
		$.go();
	}
	
	
	_initLoader(){
		let appLoader = this.appLoader = new Require({
			root: this.root
			, forceUpdate: true
			, suffix: this.supports[0]
		});
		
		
		this.require = (name)=>{
			return appLoader.get(name);
		}
	}
	
	
	addHost(op){
		new loader.constructor({
			root: this.root
			, forceUpdate: true
			, suffix: this.support
		})
	}

	print(...args){
		let type = args[0];
		
		if(!this.debug && ['root', 'listen'].indexOf(type) === -1){
			return ;
		}
		
		for(var i = 0; i < args.length - 1; i++){
			var align = !i ? 'center' : '';
			args[i] = kit.fillText(args[i], 12, align);
			if(!i){
				args[i] = '[' + args[i] + ']';
			}
		}
		
		console.log.apply(console, args)
	}
}

Server.ports = {};
Server.add = function(){
	
}
Server.createHttpServer = function(){
	let server = new http.Server();
	
	server.on('request', (req, res)=>{
		return this._request(req, res);
	});
	
	server.on('error', (e)=>{
		if (e.code === 'EADDRINUSE'){
			this.print('port error', this.port + ' is inuse, please change other port');
			this.close();
		}else{
			this.print('error', e);
		}
	});
	
	return server;
}


module.exports = Server;
	











