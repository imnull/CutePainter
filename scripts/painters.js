function Color(r, g, b, a){
	this.data = [r || 0, g || 0, b || 0, a || 0];
}
Color.prototype = {
	r : function(v){
		this.data[0] = Math.max(0, Math.min(255, v));
		return this.toString();
	},
	g : function(v){
		this.data[1] = Math.max(0, Math.min(255, v));
		return this.toString();
	},
	b : function(v){
		this.data[2] = Math.max(0, Math.min(255, v));
		return this.toString();
	},
	a : function(v){
		this.data[3] = Math.max(0, Math.min(1, v));
		return this.toString();
	},
	toString : function(){
		return 'rgba(' + this.data.join(',') + ')';
	}
}

function AutoQueue(len){
	this.length = len || 1;
	this.queue = [];
}
AutoQueue.prototype = {
	add : function(o){
		this.queue.push(o);
		while(this.queue.length > this.length){
			this.queue.shift();
		}
	},
	get : function(i){
		return this.queue[i];
	},
	isFull : function(){
		return this.queue.length >= this.length;
	},
	empty : function(){
		this.queue = [];
	}
}