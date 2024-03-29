/** 
 *
 * CanvasUI.base.js
 * (c) 2011-2012 mk31415926535@gmail.com
 * CanvasUI.base.js may be freely distributed under the MIT license.
 *
 * */
 
var CanvasUI = {};

CanvasUI.Color = function(r, g, b, a){
	this.data = [r || 0, g || 0, b || 0, a || 1];
}
CanvasUI.Color.prototype = {
	r : function(v){
		this.data[0] = Math.max(0, Math.min(255, v));
		return this.toString();
	}, g : function(v){
		this.data[1] = Math.max(0, Math.min(255, v));
		return this.toString();
	}, b : function(v){
		this.data[2] = Math.max(0, Math.min(255, v));
		return this.toString();
	}, a : function(v){
		this.data[3] = Math.max(0, Math.min(1, v));
		return this.toString();
	}, toString : function(){
		return 'rgba(' + this.data.join(',') + ')';
	}, reset : function(){
		this.data[0] = this.data[1] = this.data[2] = 0;
		this.data[3] = 1;
	}
}

CanvasUI.Position = function(left, top, width, height){
	this.top = top || 0;
	this.left = left || 0;
	this.width = width || 0;
	this.height = height || 0;
	this.init();
}
CanvasUI.Position.prototype = {
	init : function(){
		this.right = this.left + this.width;
		this.bottom = this.top + this.height;
		this.centerX = (this.left + this.right) * .5;
		this.centerY = (this.top + this.bottom) * .5;
	},
	visibility : function(){
		return this.width > 0 && this.height > 0;
	},
	clone : function(){
		return new CanvasUI.Position(this.left, this.top, this.width, this.height);
	},
	align : function(pos){
		this.top += pos.top;
		this.left += pos.left;
		this.bottom += this.top;
		this.right += this.left;
	},
	moveTo : function(x, y){
		this.top += y;
		this.left += x;
		this.bottom += y;
		this.right += x;
	},
	move : function(x, y){
		var pos = this.clone();
		pos.top += y;
		pos.left += x;
		pos.bottom += y;
		pos.right += x;
		return pos;
	}
}

CanvasUI.Style = function(styleObject){
	this.style = styleObject;
	this.get = function(){
		return this.style.toString();
	}
	this.extend = function(ctx){
		for(var p in this){
			if(typeof this[p] != 'function'){
				ctx[p] = this[p];
			}
		}
	}
}
CanvasUI.Shape = function(styleObject){
	CanvasUI.Style.call(this, styleObject);
	this.lineWidth = 2;
	this.cornerRadius = 8;
}
CanvasUI.Shape.prototype = {
	path : function(ctx, pos){
		ctx.beginPath();
		if(this.cornerRadius > 1){
			var r = Math.min(this.cornerRadius, Math.min(pos.width, pos.height) * .5);
			ctx.moveTo(pos.left, pos.top + r);
			ctx.arc(pos.left + r, pos.top + r, r, Math.PI, Math.PI * 1.5, false);
			ctx.arc(pos.right - r, pos.top + r, r, Math.PI * 1.5, Math.PI * 2, false);
			ctx.arc(pos.right - r, pos.bottom - r, r, 0, Math.PI * .5, false);
			ctx.arc(pos.left + r, pos.bottom - r, r, Math.PI * .5, Math.PI, false);
			ctx.closePath();
		} else {
			ctx.rect(pos.left, pos.top, pos.width, pos.height);
		}
	},
	draw : function(ctx){
		if(this.lineWidth > 0){
			ctx.lineWidth = this.lineWidth;
			ctx.strokeStyle = this.get();
			ctx.stroke();
		}
	},
	hasPoint : function(p, pos){

		function radiu(r, x1, y1, x2, y2){
			var x = x2 - x1, y = y2 - y1;
			return x * x + y * y < r * r;
		}

		var inRectX = p.x > pos.left && p.x < pos.right;
		var inRectY = p.y > pos.top && p.y < pos.bottom;

		if(this.cornerRadius <= 1){
			return inRectX && inRectY;
		} else if(!inRectX && !inRectY) {
			return false;
		} else {
			var r = Math.min(this.cornerRadius, Math.min(pos.width, pos.height) * .5);
			var xLT = pos.left + r, yLT = pos.top + r;
			var xRT = pos.right - r, yRT = pos.top + r;
			var xLB = pos.left + r, yLB = pos.bottom - r;
			var xRB = pos.right - r, yRB = pos.bottom - r;
			return radiu(r, p.x, p.y, xLT, yLT)
				|| radiu(r, p.x, p.y, xRT, yRT)
				|| radiu(r, p.x, p.y, xLB, yLB)
				|| radiu(r, p.x, p.y, xRB, yRB)
				;
		}
	}
}

CanvasUI.BackgroundStyle = function(styleObject){
	CanvasUI.Style.call(this, styleObject);
	this.shadowOffsetX = 0;
	this.shadowOffsetY = 0;
	this.shadowBlur = 7;
	this.shadowColor = new CanvasUI.Color(0, 0, 0, 1);
}
CanvasUI.BackgroundStyle.prototype = {
	draw : function(ctx){
		this.fillStyle = this.get();
		this.extend(ctx);
		ctx.fill();
	}
}

CanvasUI.BasePanel = function(left, top, width, height, context){
	this.context = context;
	this.position = new CanvasUI.Position(left, top, width, height);
	this.foreStyle = new CanvasUI.Style(new CanvasUI.Color());
	this.backgroundStyle = new CanvasUI.BackgroundStyle(new CanvasUI.Color(240, 240, 240));
	this.shape = new CanvasUI.Shape(new CanvasUI.Color(240, 240, 240));
	this.children = [];
	this.zIndex = -1;
}

/**

source-over 	
source-in 	
source-out 	
source-atop
destination-over 	
destination-in 	
destination-out 	
destination-atop
lighter 	
darker 	
copy 	
xor

 */
CanvasUI.BasePanel.prototype = {
	show : function(){

		var ctx = this.context;
		if(!ctx){
			if(this.parent && this.parent.context){
				ctx = this.parent.context;
			}
		}
		if(!ctx) return;
		var pos = this.relocation();

		ctx.save();
		this.shape.path(ctx, pos);
		this.backgroundStyle.draw(ctx);
		ctx.restore();

		ctx.save();
		this.shape.path(ctx, pos);
		ctx.clip();
		if(typeof this.beforeChildren === 'function'){
			this.beforeChildren();
		}
		for(var i = 0, len = this.children.length; i < len; i++){
			this.children[i].show();
		}
		if(typeof this.afterChildren === 'function'){
			this.afterChildren();
		}
		ctx.restore();

		ctx.save();
		this.shape.path(ctx, pos);
		this.shape.draw(ctx);
		ctx.restore();
	},
	relocation : function(){
		var l = 0, t = 0, o = this.parent;
		while(!!o){
			l += o.position.left || 0;
			t += o.position.top || 0;
			o = o.parent;
		}

		return this.position.move(l, t);
	},
	appendChild : function(bp){
		bp.zIndex = this.children.length;
		bp.parent = this;
		this.children.push(bp);
	},
	outerSize : function(){
		var bd = this.shape, bg = this.backgroundStyle, p = this.position, shadow = bg.shadowBlur;
		var outerL = Math.max(bd.lineWidth, shadow - bg.shadowOffsetX);
		var outerT = Math.max(bd.lineWidth, shadow - bg.shadowOffsetY);
		var outerR = Math.max(bd.lineWidth, shadow + bg.shadowOffsetX);
		var outerB = Math.max(bd.lineWidth, shadow + bg.shadowOffsetY);
		bd = bg = p = shadow = null;
		return {
			L : outerL,
			R : outerR,
			T : outerT,
			B : outerB
		}
	},
	actualPosition : function(){
		var outer = this.outerSize();
		var w = this.position.width + outer.L + outer.R;
		var h = this.position.height + outer.T + outer.B;
		return new CanvasUI.Position(0, 0, w, h);
	},
	find : function(p){
		var tar;
		for(var i = this.children.length - 1; i >= 0; i--){
			tar = this.children[i].head;
			if(!tar){
				continue;
			}
			if(tar.shape.hasPoint(p, tar.relocation())){
				return tar;
			} else {
				tar = this.children[i].find(p);
				if(!!tar) return tar;
			}
		}
		return null;
	}
}
CanvasUI.BasePanel.Apply = function(obj, left, top, width, height, context){
	CanvasUI.BasePanel.apply(obj, [left, top, width, height, context]);
	for(var p in CanvasUI.BasePanel.prototype){
		if(p in obj) continue;
		obj[p] = CanvasUI.BasePanel.prototype[p];
	}
}

CanvasUI.EventNames = {
	MOUSE_DOWN : 'ontouchstart' in document ? 'touchstart' : 'mousedown',
	MOUSE_UP : 'ontouchend' in document ? 'touchend' : 'mouseup',
	MOUSE_MOVE : 'ontouchmove' in document ? 'touchmove' : 'mousemove'
}

CanvasUI.EventPosition = function(evt){

	function getEvent(e){
		return e.touches && e.touches.length ? e.touches[0] : e;
	};

	evt = getEvent(evt);
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