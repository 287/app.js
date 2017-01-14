const fskit = require('fskit');
const asyncb = require('asyncb');
		
module.exports = function($){
	let serv = $.server;
	let path = serv.root + $.path.slice(1);
	let suffix = $.suffix;
	let moduleType;
	let mimeType;
	let etag;
	
	asyncb.flow(function(flow){
		flow
		.add('getIndex', function(){
			let defaultPage = '';
			
			//* dir mode
			asyncb.each(serv.indexs, function(next, file){
				let extname = file.match(/(\.[a-zA-Z0-9]+)$/);
				extname = !extname ? '' : extname[1];
				
				if(extname === '' && $.server.supports.indexOf('') > -1){
					file += $.server.supports[0];
				}

				fskit.isExists(path + file, function(err, exists){
					if(!exists){
						next();
					}else{
						path += file;
						suffix = extname;
						flow.next();
					}
				});
			}, function(){
				flow.exit(404);
			});
		})
		.add('exit', function(statusCode){
			let msg;
			$.statusCode = statusCode;
			
			msg = ({
				304: null
				, 404: 'Not Found'
				, 502: 'Load File Error'
			})[statusCode];
			
			$.header('content-type', mimeType);
			$.end(msg);
		})
		.add('loadModule', function(){
			let fn = $.require(path);
	
			if(typeof fn === 'function'){
				fn.call($, $);
			}else{
				flow.exit(502);
			}
		})
		
		.pipe(function(){
			if(path.charAt(path.length - 1) === '/'){
				flow.getIndex();
			}else{
				flow.next();
			}
		})
		//* file or dir
		.pipe(function(){
			if($.server.supports.indexOf(suffix) > -1){
				moduleType = 'module';
			}else{
				moduleType = 'static';
			}
			
			fskit.isExists(path, function(err, exists){
				if(!exists){
					flow.exit(404);
				}else{
					if(moduleType === 'module'){
						flow.loadModule();
					}else{
						flow.next();
					}
				}
			});
		})
		
		//* check last modified
		.pipe(function(){
			let modifiedSince = $.headers['if-modified-since'];
			let reqEtag = $.headers['if-none-match'];
			
			fskit.stat(path, function(err, info){
				if(err){
					flow.exit(502);
				}else{
					let lastModified = info.mtime;
					etag = lastModified.getTime().toString(36);
					etag = '"' + etag + '"';
					let isMatch = reqEtag && etag === reqEtag;
					
					if(!isMatch){
						flow.next();
					}else{
						flow.exit(304);
					}
				}
			});
		})
		
		//* get file content
		.pipe(function(){
			mimeType = serv.mimeTypes[suffix.slice(1)] || '';
			
			fskit.get(path, mimeType.slice(0, 4) === 'text' ? '' : null, function(err, content){
				if(err){
					flow.exit(502);
				}else{
					flow.next(content);
				}
			});
		})
		
		.pipe(function(content){
			$.header('content-type', mimeType);
			// $.header('cache-control', 'max-age=' + 3600 * 24 * 365);
			// $.header('last-modified', lastModified.getTime());
			$.header('etag', etag);
			
			$.end(content);
		});
		
	});
	
	
	function getModulePath(file){
		if(file.indexOf('.') === -1 && $.server.supports.indexOf('') > -1){
			file += $.server.supports[0];
		}
		return file;
	}
};
