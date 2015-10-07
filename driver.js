'use strict';
const domcore = require('./domcore');
const Window = require('jsdom/lib/jsdom/browser/Window');
function parsePx(str){
	return parseInt(str, 10) || 0;
}
function parseRgb(str){
	var rgb = str.slice(4, -1).split(','), ret = 0;
	for(var i = 0; i<3; i++) ret |= (parseInt(rgb[i].trim(),10)||0)<<(i<<3);
	return ret;
}
class Layout {
	constructor(parent, node){
		this.data = new Float32Array(16);
		this.children = [];
		this.node = node;
		this.parent = parent;
	}
	getContent(x) { return this.data[x] }
	getPadding(x) { return this.data[x+4] }
	getBorder(x) { return this.data[x+8] }
	getMargin(x) { return this.data[x+12] }
	setContent(x,y) { return this.data[x] = y }
	setPadding(x,y) { return this.data[x+4] = y }
	setBorder(x,y) { return this.data[x+8] = y }
	setMargin(x,y) { return this.data[x+12] = y }
	set contentLeft(y) { return this.setContent(0, y) }
	get contentLeft() { return this.getContent(0) }
	set contentTop(y) { return this.setContent(1, y) }
	get contentTop() { return this.getContent(1) }
	set contentRight(y) { return this.setContent(2, y) }
	get contentRight() { return this.getContent(2) }
	set contentBottom(y) { return this.setContent(3, y) }
	get contentBottom() { return this.getContent(3) }
	set paddingLeft(y) { return this.setPadding(0, y) }
	get paddingLeft() { return this.getPadding(0) }
	set paddingTop(y) { return this.setPadding(1, y) }
	get paddingTop() { return this.getPadding(1) }
	set paddingRight(y) { return this.setPadding(2, y) }
	get paddingRight() { return this.getPadding(2) }
	set paddingBottom(y) { return this.setPadding(3, y) }
	get paddingBottom() { return this.getPadding(3) }
	set borderLeft(y) { return this.setBorder(0, y) }
	get borderLeft() { return this.getBorder(0) }
	set borderTop(y) { return this.setBorder(1, y) }
	get borderTop() { return this.getBorder(1) }
	set borderRight(y) { return this.setBorder(2, y) }
	get borderRight() { return this.getBorder(2) }
	set borderBottom(y) { return this.setBorder(3, y) }
	get borderBottom() { return this.getBorder(3) }
	set marginLeft(y) { return this.setMargin(0, y) }
	get marginLeft() { return this.getMargin(0) }
	set marginTop(y) { return this.setMargin(1, y) }
	get marginTop() { return this.getMargin(1) }
	set marginRight(y) { return this.setMargin(2, y) }
	get marginRight() { return this.getMargin(2) }
	set marginBottom(y) { return this.setMargin(3, y) }
	get marginBottom() { return this.getMargin(3) }
	get totalHeight() {
		var h = 0;
		for (var i=3; i<16; i+=2) h += this.data[i];
		return h;
	}
	calcBlockWidth(node){
		var style = node.style || {};
		var width = style.width || 'auto';
		var total = parsePx(width);
		['padding', 'border', 'margin'].forEach((prop,pidx) => {
			var defval = style[prop];
			['left','top','right','bottom'].forEach((dim, didx) => {
				var val = this.data[pidx*4+didx] = parsePx(style[prop+'-'+dim] || defval);
				if (!(didx&1)) total += val;
			});
		});
		var parentWidth = this.parent.contentRight;
		if (width != 'auto' && total > parentWidth){
			if (!style['margin-left'] || style['margin-left'] == 'auto') this.marginLeft = 0;
			if (!style['margin-right'] || style['margin-right'] == 'auto') this.marginRight = 0;
		}
		var underflow = parentWidth - total,
			auto = (width == 'auto')<<2|(style['margin-left'] == 'auto')<<1|(style['margin-right'] == 'auto');
		if (!auto) this.marginRight = parsePx(style['margin-right']) + underflow;
		else if (auto == 1) this.marginRight = underflow;
		else if (auto == 2) this.marginLeft = underflow;
		else if (auto == 3) this.marginLeft = this.marginRight = underflow / 2;
		else if (auto&4){
			if (auto&1) this.marginRight = 0;
			if (auto&2) this.marginLeft = 0;
			if (underflow >= 0) width = underflow;
			else{
				width = 0;
				this.marginRight += underflow;
			}
		}
		this.contentRight = parsePx(width);
		this.paddingLeft = parsePx(style['padding-left'] || style.padding);
		this.paddingRight = parsePx(style['padding-right'] || style.padding);
		this.borderLeft = parsePx(style['border-left'] || style.border);
		this.borderRight = parsePx(style['border-right'] || style.border);
	}
	calcBlockPos(node){
		var style = node.style || {};
		this.paddingTop = parsePx(style['padding-top'] || style.padding);
		this.paddingBottom = parsePx(style['padding-bottom'] || style.padding);
		this.borderTop = parsePx(style['border-top'] || style.border);
		this.borderBottom = parsePx(style['border-bottom'] || style.border);
		this.marginTop = parsePx(style['margin-top'] || style.margin);
		this.marginBottom = parsePx(style['margin-bottom'] || style.margin);
		this.contentLeft = this.parent.contentLeft + this.paddingLeft + this.borderLeft + this.marginLeft;
		this.contentTop = this.parent.contentTop + this.parent.contentBottom + this.paddingTop + this.borderTop + this.marginTop; 
	}
	build(node){
		if (node.style && node.style.display == 'none') return;
		var newlayout = new Layout(this, node);
		newlayout.calcBlockWidth(node);
		newlayout.calcBlockPos(node);
		if (node.nodeName == '#text') newlayout.contentBottom = 16;
		for(var i=0; i<node.childNodes.length; i++){
			newlayout.build(node.childNodes[i]);
		}
		this.contentBottom += newlayout.totalHeight;
		if (node.style && node.style.height) this.contentBottom = parsePx(node.style.height);
		this.children.push(newlayout);
	}
	draw(){
		if (this.node && this.node.style){
			if (this.node.style.visibility == 'hidden') return;
			if (this.node.style['background-color']){
				var col = parseRgb(this.node.style['background-color']);
				domcore.glcolor(col, col>>8, col>>16);
			}else domcore.glrandcolor();
			domcore.glrect(this.data[0], this.data[1], this.data[0] + this.data[2], this.data[1] + this.data[3]);
		}else if (this.node && this.node.nodeName == '#text'){
			if (this.parent && this.parent.node && this.parent.node.style && this.parent.node.style.color){
				var col = parseRgb(this.parent.node.style.color);
				domcore.glcolor(col, col>>8, col>>16);
			}
			domcore.gltext(this.contentLeft, this.contentTop, this.node.data);
		}
		this.children.forEach(c => c.draw());
	}
}
class Page extends Layout {
	constructor(){
		super(null, null);
		this.contentRight = 800;
		this.ctx = null;
		this.window = null;
	}
	loadpage(html, url){
		const jsdomopts = {
			parsingMode:'html',
			url:url,
		};
		this.window = new Window(jsdomopts);
		this.window.document.write(html);
		this.window.document.close();
		this.build(this.window.document.body);
	}
	render(){
		this.draw();
		domcore.glswap();
	}
}
exports.Page = Page;
