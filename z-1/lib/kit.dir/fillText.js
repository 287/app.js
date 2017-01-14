function fillText(text, length, type){
	var eps = '..'
	var start = 0
	var end = 0
	
	length = length || text.length;
	num = length - text.length;
	if(num < 0){
		text =  text.slice(0, num - eps.length) + eps;
		num = 0
	}
	
	switch(type){
		case 'center':
			start = Math.floor(num / 2);
		break; case 'right':
			start = num;
		break; default:
			start = 0;
	}
	end = num - start;
	
	return ' '.repeat(start) + text + ' '.repeat(end);
}