!function(){
	var asyncb = {
		hub: asyncHub
		, flow: asyncFlow
		, each: asyncEach
	};

	if(typeof window === 'object' && window && typeof window.document === 'object'){
		window.asyncb = asyncb;
	}else{
		module.exports = asyncb;
	}

	/**
	 * multi async task all done callback
	 * @param {array<string>|number|string} tasks - task name list or number of task or string with "," seq
	 * @param {function} callback()
	 * @return {AsyncHub}
	 */
	function asyncHub(tasks, callback){
		return new AsyncHub(tasks, callback);
	}


	/**
	 * @class
	 * @param {array<string>|number|string} tasks - task name list or number of task or string with "," seq
	 * @param {function} callback()
	 * @return {AsyncHub}
	 */
	function AsyncHub(tasks, callback){
		var self = this, i, l
		;
		
		if(typeof tasks === 'function'){
			callback = tasks;
			tasks = null;
		}
		
		this.map = {};
		this.callback = callback;
		
		if(typeof tasks === 'number'){
			if(tasks === 0){
				this.done();
			}else{
				tasks = range(tasks);
			}
		}else if(typeof tasks === 'string'){
			tasks = tasks.replace(/\s+|,$/g, '').split(',');
		}
		
		if(Object.prototype.toString.call(tasks) === '[object Array]'){
			tasks.forEach(function(name){
				self.map[name] = false;
			});
		}
	}


	/**
	 * add task
	 * @param {string|number} name - task name
	 * @return {this}
	 */
	AsyncHub.prototype.add = function(name){
		this.map[name] = false;
		
		return this;
	}


	/**
	 * reset all task
	 * @param {string|number} name - task name
	 * @return {this}
	 */
	AsyncHub.prototype.reset = function(){
		var map = this.map
		, name
		;
		for(name in map){
			map[name] = false;
		}
		
		return this;
	}


	/**
	 * mark task done
	 * @param {string|number} name - task name or number index
	 * @return {this}
	 */
	AsyncHub.prototype.done = function(name){
		if(this.map[name] === false){
			this.map[name] = true;
		}
		
		if(this.isAllDone()){
			typeof this.callback === 'function' && this.callback();
		}
		
		return this;
	}


	/**
	 * check status of all tasks done
	 * @return {boolean}
	 */
	AsyncHub.prototype.isAllDone = function(){
		var allDone = true
		, map = this.map
		, name
		;
		for(name in map){
			if(map[name] === false){
				allDone = false;
				break;
			}
		}
		return allDone;
	}




	/**
	 * multi async task flow
	 * @param {~boolean} [autorun=true] - the status of task flow is autorun
	 * @param {function} callback({AsyncFlow} flow)
	 * @return {AsyncHub}
	 */
	function asyncFlow(autorun, callback){
		var flow
		;
		if(typeof autorun === 'function'){
			callback = autorun;
			autorun = true;
		}
		
		flow = new AsyncFlow();
		
		if(typeof callback === 'function'){
			callback.call(flow, flow);
			
			if(autorun){
				flow.next();
			}
		}
		
		return flow;
	}


	/**
	 * class - multi async task flow
	 * @return {AsyncHub}
	 */
	function AsyncFlow(){
		var self = this
		;
		this._data = {
			index: -1
			, list: []
			, indexs: {}
			, events: {
				end: []
				, start: []
			}
		};
		
		this.next = function(){
			self._next.apply(self, arguments);
		};
	}

	/**
	 * run next task of task flow
	 * @return {AsyncHub}
	 */
	AsyncFlow.prototype._next = function(){
		var data = this._data
		, fn
		;
		fn = data.list[data.index + 1];
		
		if(typeof fn === 'function'){
			data.index++;
			fn.apply(null, arguments);
		}
		
		return this;
	}


	/**
	 * check name to allow use
	 * @param {string} name - task name
	 * @return {boolean}
	 */
	AsyncFlow.prototype._isNameOk = function(name){
		return name != null && ['pipe', 'next', 'add', 'go', '_next', '_isNameOk', '_data'].indexOf(name) === -1;
	}


	/**
	 * add task not in pipe - just define a method
	 * @param {string} name - task name
	 * @param {function} fn - task method
	 * @return {this}
	 */
	AsyncFlow.prototype.add = function(name, fn){
		if(this._isNameOk(name)){
			this[name] = fn;
		}
		
		return this;
	}


	/**
	 * run method defined in pipe
	 * @param {string} name - task name
	 * @return {this}
	 */
	AsyncFlow.prototype.go = function(name){
		var data = this._data
		, fn, i
		;
		i = data.indexs[name];
		fn = data.list[i];
		
		if(typeof fn === 'function'){
			data.index = i;
			fn.apply(null, [].slice.call(arguments, 1));
		}
		
		return this;
	}


	/**
	 * defined task in pipe
	 * @param {string} [name] - set task name if you will use "go" method to call this callback
	 * @param {function} fn
	 * @return {this}
	 */
	AsyncFlow.prototype.pipe = function(name, fn){
		var data = this._data
		;
		if(typeof name === 'function'){
			fn = name;
			name = null;
		}
		
		if(typeof fn === 'function'){
			if(this._isNameOk(name)){
				this[name] = fn;
				data.indexs[name] = data.list.length;
			}
			
			data.list.push(fn);
		}
																																																																					
		return this;
	}




	/**
	 * each a object or array in async callback
	 * @param {object|~array} o - object to loop
	 * @param {function} fn({object} value, {string|number} key)
	 * @param {function} [finishFn] - call this method when loop finished
	 * @param {string} type='' - set object type within [array|object], set by "isArrayLike" if not give this field
	 * @return {undefined}
	 */
	function asyncEach(o, fn, finishFn, type){
		var keys = [], i = -1, key, l
		;
		if(typeof finishFn === 'string'){
			finishFn = null;
			type = finishFn;
		}
		
		o = typeof o === 'number' ? range(o) : o;
		type = ['object', 'array'].indexOf(type) > -1 ? type : '';
		
		if(o && typeof o === 'object' && typeof fn === 'function'){
			type = type ? type : typeof o.length === 'number' && o.length > -1 ? 'array' : 'object';
			if(type === 'object'){
				for(key in o){
					if(o.hasOwnProperty(key)) keys.push(key);
				}
			}else{
				keys = o;
			}
			next();
		}
		
		function next(){
			i++;
			if(i < keys.length){
				key = type === 'array' ? i : keys[i];
				fn(next, o[key], key);
			}else if(i === keys.length){
				typeof finishFn === 'function' && finishFn();
			}
		}
	}



	/**
	 * create range list
	 * @param {number} l - length of list
	 * @return {array<number>}
	 */
	function range(l){
		var i = 0
		, list = []
		;
		for(; i < l; i++) list.push(i);
		return list;
	}
	
}();