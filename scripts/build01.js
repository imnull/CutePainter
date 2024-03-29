/** 
 *
 * build01.js
 * (c) 2011-2012 mk31415926535@gmail.com
 * build01.js may be freely distributed under the MIT license.
 *
 * */

function initCanvas(canvas){

	window.MOUSE_DOWN = 'ontouchstart' in document ? 'touchstart' : 'mousedown';
	window.MOUSE_UP	 = 'ontouchend' in document ? 'touchend' : 'mouseup';
	window.MOUSE_MOVE = 'ontouchmove' in document ? 'touchmove' : 'mousemove';
	window.GET_EVENT = function(e){
		return e.touches && e.touches.length ? e.touches[0] : e;
	};
	window.EVENT_POS = function(evt){
		evt = window.GET_EVENT(evt);
		var x, y;
		if('pageX' in evt){
			x = evt.pageX - evt.target.offsetLeft;
			y = evt.pageY - evt.target.offsetTop;
		} else if('offsetX' in evt){
			x = evt.offsetX;
			y = evt.offsetY;
		} else if('clientX' in evt){
			x = evt.clientX - evt.target.offsetLeft;
			y = evt.clientY - evt.target.offsetTop;
		} else {
			x = y = 0;
		}
		return { x : x, y : y };
	}

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

	canvas.oncontextmenu = function(e){
		return false;
	}
	canvas.width = screen.width;
	canvas.height = screen.height;

	with(document.body.style){
		margin = '0px';
		overflow = 'hidden';
	}

	with(canvas.style){
		backgroundColor = '#ccc';
		position = 'absolute';
		zIndex = '9999';
	}

	window.addEventListener('load', function(){
		document.body.appendChild(canvas);
	});

	var ctx = canvas.getContext('2d');
	var ep = window.EVENT_POS;

	var radiu = 20, r2 = radiu * 2;
	var color = new Color(0, 0, 160, 1);
	var pointBuffer = new AutoQueue(2);

	

	function drawLine(ctx, lineWidth, strokeStyle, p1, p2){
		ctx.save();
		ctx.lineWidth = lineWidth;
		ctx.beginPath();
		ctx.moveTo(p1.x, p1.y);
		ctx.lineTo(p2.x, p2.y);
		ctx.strokeStyle = strokeStyle;
		ctx.stroke();
		ctx.restore();
	}

	function drawRoundPoint(ctx, r, fillStyle, p){
		ctx.save();
		ctx.fillStyle = fillStyle;
		ctx.beginPath();
		ctx.arc(p.x, p.y, r, 0, Math.PI * 2, false);
		ctx.fill();
		ctx.restore();
	}



	var pointRadial = ctx.createRadialGradient(0, 0, 0, 0, 0, radiu);
	pointRadial.addColorStop(0, color.a(1));
	pointRadial.addColorStop(1, color.a(0));

	function drawRadialGradient(ctx, r, p){
		ctx.save();
		ctx.beginPath();
		ctx.translate(p.x, p.y);
		ctx.arc(0, 0, r, 0, Math.PI * 2, false);
		
		ctx.fillStyle = pointRadial;
		ctx.fill();
		ctx.restore();
		radial = null;
	}

	function clearRect(ctx, r, p){
		ctx.clearRect(p.x - r, p.y - r, r * 2, r * 2);
	}

	function clearRound(ctx, r, p){
		ctx.save();
		ctx.globalCompositeOperation = 'destination-out';
		ctx.beginPath();
		ctx.arc(p.x, p.y, r, 0, Math.PI * 2, false);
		ctx.fill();
		ctx.restore();
	}

	function clearGradientRound(ctx, r, p){
		ctx.save();
		ctx.globalCompositeOperation = 'destination-out';
		ctx.beginPath();
		ctx.translate(p.x, p.y);
		ctx.arc(0, 0, r, 0, Math.PI * 2, false);
		ctx.fillStyle = pointRadial;
		ctx.fill();
		ctx.restore();
		radial = null;
	}

	function mousemove_line(e){
		e.preventDefault();
		pointBuffer.add(ep(e));
		if(!!pointBuffer.isFull()){
			drawLine(ctx, r2, color.a(.1), pointBuffer.get(0), pointBuffer.get(1));
		}
	}

	function mousemove_point(e){
		e.preventDefault();
		drawRadialGradient(ctx, radiu, ep(e));
	}

	function mousemove_clearRect(e){
		e.preventDefault();
		clearRect(ctx, radiu, ep(e));
	}

	function mousemove_clearRound(e){
		e.preventDefault();
		clearRound(ctx, radiu, ep(e));
	}

	function mousemove_clearGradientRound(e){
		e.preventDefault();
		clearGradientRound(ctx, radiu, ep(e));
	}

	ctx.lineCap = 'round'; //'butt' 'square' 'round';
	var drawMethod = mousemove_line;
	var composites = [
		'source-over', 'lighter', 'destination-out'
	]
	canvas.addEventListener(window.MOUSE_DOWN, function(e){
		e.preventDefault();
		ctx.globalCompositeOperation = composites[e.button];
		drawMethod(e);
		canvas.addEventListener(window.MOUSE_MOVE, drawMethod);
	});

	canvas.addEventListener(window.MOUSE_UP, function(e){
		canvas.removeEventListener(window.MOUSE_MOVE, drawMethod);
		pointBuffer.empty();
	});

}