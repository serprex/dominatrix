'use strict';
var fs = require('fs');
var http = require('http');
var p5 = require('parse5');
var css = require('css/lib/parse');
var vm = require('vm');
var domcore = require('./domcore');
function Page(width){
	this.ctx = null;
	this.styles = null;
	this.head = null;
	this.body = null;
	this.domcache = {};
	this.content = new Float32Array([0,0,width,0]);
	this.padding = this.border = this.margin = new Float32Array(4);
	this.style = {display:'block',width:width+'px'};
}
var cssparseopt = {silent:true};
function specificity(x){
	var a = 0;
	x.selectors.forEach(s => {
		if (s && s != '*'){
			while (s[0] == '*')s=s.slice(1);
			a += 1<<(s[0] == '#' ? 16 : s[0]=='.' ? 8 : 0);
		}
	});
		return a;
	}
	function cssparse(style){
		var rules = css(style,cssparseopt).stylesheet.rules;
		rules.sort((x,y) => specificity(y)-specificity(x));
		return rules;
	}
var processHandler = {
	link:function(node){
		var isSheet = false, href = null;
		for(var i=0; i<attr.length; i++){
			var key = attr[i].name, val = attr[i].value;
			if (key == 'type' && val == 'stylesheet') isSheet = true;
			if (key == 'href') href = val;
		}
		if (isSheet && href){
			var sidx = this.styles.length;
			this.styles.push(null);
			http.get(href, (res) => {
				var style = '';
				res.on('data', function(chunk){style += chunk});
				res.on('end', function(){
					this.styles[sidx] = cssparse(style);
				});
			});
		}
	},
	script:function(node){
		//vm.runInContext(node.childNodes[0].value, this.ctx);
	},
	style:function(node){
		this.styles.push(cssparse(node.childNodes[0].value));
	}
};
function processCore(node){
	var name = node.nodeName;
	if (name in processHandler) processHandler[name].call(this, node);
	else if (node.childNodes) node.childNodes.forEach(processCore, this);
}
Page.prototype.process = function(dom){
	this.ctx = vm.createContext();
	this.styles = [];
	dom.childNodes[0].childNodes.forEach(node => {
		if (node.nodeName == 'head') this.head = node;
		else if (node.nodeName == 'body') this.body = node;
	});
	processCore.call(this, dom);
	this.restyle();
}
function selectorMatch(selector, node){
	if (!selector) return false;
	if (selector == '*') return true;
	while (selector[0] == '*') selector = selector.slice(1);
	return selector[0] == '#' ? selector.slice(1) === nodeAttr(node, 'id') :
		selector[0] == '.' ? nodeAttr(node, 'class') && nodeAttr(node, 'class').split(' ').indexOf(selector.slice(1)) != -1 :
		selector == node.tagName;
}
function parsePx(str){
	return parseInt(str,10) || 0;
}
function calcBlockWidth(parent){
	var style = this.style;
	var width = style.width || 'auto';
	var total = parsePx(width);
	['padding', 'border', 'margin'].forEach(prop => {
		var defval = style[prop];
		['left','top','right','bottom'].forEach((dim, idx) => {
			var val = this[prop][idx] = parsePx(style[prop+'-'+dim] || defval);
			if (!(idx&1)) total += val;
		});
	});
	var parentWidth = parent.content[2] - parent.content[0];
	if (width != 'auto' && total > parentWidth){
		if (style['margin-left'] == 'auto') this.margin[0] = 0;
		if (style['margin-right'] == 'auto') this.margin[2] = 0;
	}
	var underflow = parentWidth - total,
		auto = (width == 'auto')<<2|(style['margin-left'] == 'auto')<<1|(style['margin-right'] == 'auto');
	if (!auto){
		this.margin[2] = parsePx(style['margin-right']) + underflow;
	}else if (auto == 1){
		this.margin[2] = underflow;
	}else if (auto == 2){
		this.margin[0] = underflow;
	}else if (auto == 3){
		this.margin[0] = this.margin[2] = underflow/2;
	}else if (auto&4){
		if (auto&1) this.margin[2] = 0;
		if (auto&2) this.margin[0] = 0;
		if (underflow >= 0) width = underflow;
		else{
			width = 0;
			this.margin[2] += underflow;
		}
	}
	this.content[2] = parsePx(width);
	this.padding[0] = parsePx(style['padding-left'] || style['padding']);
	this.padding[2] = parsePx(style['padding-right'] || style['padding']);
	this.border[0] = parsePx(style['border-left'] || style['border']);
	this.border[2] = parsePx(style['border-right'] || style['border']);
}
function calcBlockPos(parent){
	var style = this.style;
	this.padding[1] = parsePx(style['padding-top'] || style['padding']);
	this.padding[3] = parsePx(style['padding-bottom'] || style['padding']);
	this.border[1] = parsePx(style['border-top'] || style['border']);
	this.border[3] = parsePx(style['border-bottom'] || style['border']);
	this.margin[1] = parsePx(style['margin-top'] || style['margin']);
	this.margin[3] = parsePx(style['margin-bottom'] || style['margin']);
	this.content[0] = parent.content[0] + this.padding[0] + this.border[0] + this.margin[0];
	this.content[1] = parent.content[1] + parent.content[3] + this.padding[1] + this.border[1] + this.margin[1];
}
function calcInlinePos(parent, idx){
	var style = this.style;
	['padding', 'border', 'margin'].forEach(prop => {
		var defval = style[prop];
		['left','top','right','bottom'].forEach((dim, idx) => {
			this[prop][idx] = parsePx(style[prop+'-'+dim] || defval);
		});
	});
	this.content[2] = parsePx(style['width']);
	this.content[3] = parsePx(style['height']);
	if (idx){
		for(var i=0; i<2; i++){
			var prev = parent.childNodes[idx-1];
			this.content[i] = prev.content[i] + prev.content[i+2] + prev.margin[i+2] + prev.border[i+2] + prev.padding[i+2] +
				this.margin[i] + this.border[i] + this.padding[i];
			if (this.content[i] + this.content[i+2] > parent.content[i] + parent.content[i+2]){
				this.content[i] = parent.content[i]+parent.margin[i] +
					this.margin[i] + this.border[i] + this.padding[i];
			}
		}
	}else{
		for(var i=0; i<2; i++) this.content[i] = parent.content[i]+parent.margin[i] + this.margin[i] + this.border[i] + this.padding[i];
	}
}
function nodeHeight(node){
	return node.content[3] + node.padding[1] + node.padding[3] + node.border[1] + node.border[3] + node.margin[1] + node.margin[3];
}
function nodeAttr(node, key){
	if (node.attrs){
		for (var i=0; i<node.attrs.length; i++)
			if (node.attrs[i].name == key) return node.attrs[i].value;
	}
}
Page.prototype.styleNode = function(parent, node){
	var mysty = this.styles.filter(style => style.selectors && style.selectors.every(selector => selectorMatch(selector, node)));
	node.style = {};
	for (var key in parent.style) node.style[key] = parent.style[key];
	mysty.forEach(style => (node.style[style.property] = style.value));
	if (nodeAttr(node, 'style')){
		nodeAttr(node, 'style').split(';').forEach(x => {
			var a=x.indexOf(':');
			if (~a) node.style[x.slice(0,a)] = x.slice(a+1);
		});
	}
	if (node.nodeName == '#text'){
		node.style.height = '16px';
		node.style.display = node.value.match(/^\s*$/) ? 'none' : 'inline';
	}
}
Page.prototype.styleCore = function(parent, node, idx){
	node.content = new Float32Array(4);
	node.padding = new Float32Array(4);
	node.border = new Float32Array(4);
	node.margin = new Float32Array(4);
	if (node.style.display == 'block'){
		calcBlockWidth.call(node, parent);
		calcBlockPos.call(node, parent);
	}else if (node.style.display == 'inline'){
		calcInlinePos.call(node, parent, idx);
	}else if (node.style.display == 'none') return;
	if (node.childNodes){
		var blockEnd = -1;
		for(var i=node.childNodes.length-1; i>-1; i--){
			var n = node.childNodes[i];
			this.styleNode(node, n);
			if (node.style.display == 'block' && n.style.display == 'inline' && !~blockEnd){
				blockEnd = i;
			}else if (node.style.display == 'block' && n.style.display == 'block' && ~blockEnd && (i!=0 || blockEnd!=node.childNodes.length-1)){
				var anonBlock = {
					nodeName:'#anon',
					style:{display:'block'},
					childNodes:null
				};
				anonBlock.childNodes = node.childNodes.splice(i, blockEnd - i, anonBlock);
			}
		}
		node.childNodes.forEach((x,i) => this.styleCore(node, x, i));
	}
	if (node.style.height && node.style.height != 'auto') node.content[3] = parsePx(node.style.height);
	parent.content[3] += nodeHeight(node);
}
Page.prototype.restyle = function(){
	this.styleNode(this, this.body);
	this.styleCore(this, this.body, 0);
}
Page.prototype.parseLink = function(url){
	return new Promise((resolve, reject) => {
		if (url.match(/^file:\/\/\//)){
			fs.readFile(url.slice(8), 'utf8', (err, buf) => {
				return err ? reject(console.log(err)) :
					resolve(this.parse(buf));
			});
		}
	});
}
Page.prototype.parse = function(html){
	this.process(p5.parse(html));
}
var firstrun = true;
function renderCore(node){
	if (firstrun) console.log(node);
	if (node.style.visibility == 'hidden') return;
	if (node.content){
		if (node.style){
			var color = node.style['background-color'];
			if (color){
				var r=parseInt(color.slice(1,3),16), g=parseInt(color.slice(3,5),16), b=parseInt(color.slice(5),16);
				domcore.glcolor(r,g,b);
			}else domcore.glrandcolor();
		}
		domcore.glrect(node.content[0], node.content[1], node.content[0]+node.content[2], node.content[1]+node.content[3]);
	}
	if (node.nodeName == '#text' && node.style.display != 'none'){
		if (node.style.color){
			var color = node.style.color;
			var r=parseInt(color.slice(1,3),16), g=parseInt(color.slice(3,5),16), b=parseInt(color.slice(5),16);
			domcore.glcolor(r,g,b);
		}
		domcore.gltext(node.content[0], node.content[1], node.value);
	}
	if (node.childNodes) node.childNodes.forEach(renderCore);
}
Page.prototype.render = function(){
	renderCore(this.body);
	domcore.glswap();
	firstrun = false;
}
exports.Page = Page;
