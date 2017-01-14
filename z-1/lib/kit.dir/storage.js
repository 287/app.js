function storage(file, o){
	let fs = require('fs');
	let content = false;
	
	if(o === undefined){
		o = {};
		if(fs.existsSync(file)){
			content = fs.readFileSync(file).toString();
			o = content === '' ? o : JSON.parse(content);
		}
	}else{
		fs.writeFileSync(file, JSON.stringify(o));
	}
	
	return o;
}