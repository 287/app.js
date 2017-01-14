const http = require('http');
const kit = loader.get('kit.dir');


module.exports = function(url, reqTarget, resTarget){
	let item = kit.parseUrl(url);
	
	item.headers = reqTarget.headers;
	item.headers.host = item.host;
	
	item.method = reqTarget.method;
	item.path = reqTarget.url;
	
	
	let rs = false;
	let err = null;
	
	let req = http.request(item, function(res){
		
		resTarget.writeHead(res.statusCode, res.headers);
		
		res.on('data', (buf)=>{
			resTarget.write(buf);
		});
		
		res.on('end', function(){
			resTarget.end();
		});
		
		res.on('error', function(e){
			console.log(`proxy "${url}": respone error`, e);
		});
	});
	
	reqTarget.on('data', (buf)=>{
		req.write(buf);
	});
	
	reqTarget.on('end', ()=>{
		req.end();
	});
	
	req.on('error', function(e){
		console.log(`proxy "${url}": request error`, e);
	});
}