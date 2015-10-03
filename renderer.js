'use strict';
var fs = require('fs');
var http = require('http');
var p5 = require('parse5');
var css = require('css/parse');
var vm = require('vm');
var domcore = require('./domcore');
var htmlparser = new p5.Parser();
function Page(width, height){
	this.ctx = null;
	this.styles = null;
	this.head = null;
	this.body = null;
	this.content = new Float32Array([0,0,width,height]);
	this.padding = this.border = this.margin = new Float32Array(4);
	this.style = {};
}
var cssparseopt = {silent:true};
function specificity(x){
	var a = 0;
	x.selectors.forEach((s) => {
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
		vm.runInContext(node.childNodes[0], this.ctx);
	},
	style:function(node){
		this.styles.push(cssparse(node.childNodes[0]));
	}
};
var drawHandler = {
	'#text':function(node){
		//rendertext(node.value);
	},
};
function processCore(node){
	var name = node.nodeName;
	if (name in processHandler) processHandler[name].call(this, node);
	else node.childNodes.forEach(processCore, this);
}
Page.prototype.process = function(dom){
	this.ctx = vm.createContext();
	this.styles = [];
	this.head = dom.childNodes[0].childNodes[0];
	this.body = dom.childNodes[0].childNodes[1];
	processCore.call(this, dom);
	this.restyle();
}
function selectorMatch(selector, node){
	if (!selector) return false;
	if (selector == '*') return true;
	while (selector[0] == '*') selector = selector.slice(1);
	return selector[0] == '#' ? selector.slice(1) === node.attrs.id :
		selector[0] == '.' ? node.attrs.class && node.attrs.class.split(' ').indexOf(selector.slice(1)) != -1 :
		selector == node.tagName;
}
function calcBlockWidth(parent){
	var style = node.style;
	var width = style.width || "auto";
	this.content = new Float32Array(4);
	this.padding = new Float32Array(4);
	this.border = new Float32Array(4);
	this.margin = new Float32Array(4);
	var total = parseInt(this.width,10);
	["padding", "border", "margin"].forEach(prop => {
		var default = style[prop];
		["left","top","right","bottom"].forEach((dim, idx) => {
			var val = this[prop][idx] = style[prop+"-"+dim] || default || 0;
			if (!(idx&1))total += parseInt(val,10);
		});
	});
	var parentWidth = parent.content[2] - parent.content[0];
	if (width != "auto" && total > parentWidth){
		if (style["margin-left"] == "auto") this.margin[0] = 0;
		if (style["margin-right"] == "auto") this.margin[2] = 0;
	}
	var underflow = parentWidth - total,
		auto = (width == "auto")<<2|(style["margin-left"] == "auto")<<1|(style["margin-right"] == "auto");
	if (!auto){
		this.margin[2] = parseInt(style["margin-right"],10);
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
	this.content[2] = parseInt(width,10);
	this.padding[0] = parseInt(style["padding-left"],10);
	this.padding[2] = parseInt(style["padding-right"],10);
	this.border[0] = parseInt(style["border-left"],10);
	this.border[2] = parseInt(style["border-right"],10);
	if (style["margin-left"] != "auto") this.margin[0] = parseInt(style["margin-left"],10);
	if (style["margin-right"] != "auto") this.margin[2] = parseInt(style["margin-right"],10);
}
function nodeHeight(node){
	return node.content[3] + node.padding[1] + node.padding[3] + node.border[1] + node.border[3] + node.margin[1] + node.margin[3];
}
function styleCore(parent, node){
	var mysty = this.styles.filter(style => style.selectors.every(selector => selectorMatch(selector, node)));
	node.style = {};
	for (var key in parent.style) node.style[key] = parent.style[key];
	mysty.forEach(style => (node.style[style.property] = style.value));
	if (node.attrs.style){
		node.attrs.style.split(';').forEach((x) => {
			var a=x.indexOf(':');
			if (~a) node.style[x.slice(0,a)] = x.slice(a+1);
		});
	}
	calcBlockWidth.call(node, parent);
	node.childNodes.forEach(styleCore.bind(this, node));
	if (node.style.height && node.style.height != "auto") node.content[3] = parseInt(node.style.height,10);
	parent.content[3] += nodeHeight(node);
}
Page.prototype.restyle = function(){
	styleCore.call(this, this, this.body);
}
function drawCore(node){
	if (name in drawHandler) drawHandler[name].call(this, node);
	else node.childNodes.forEach(drawCore, this);
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
	this.process(htmlparser.parse(html));
}
Page.prototype.render = function(){
	drawCore.call(this, this.body);
}
exports.Page = Page;
exports.draw = function(doc){
	drawCore.call(doc, doc.body);
}
exports.step = function(){
	domcore.glloop();
}
