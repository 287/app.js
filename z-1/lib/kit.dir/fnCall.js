function fnCall(fn, args, context){
	if(typeof fn === 'function'){
		return fn.apply(context, args);
	}
}