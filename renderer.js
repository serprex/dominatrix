'use strict';
var fs = require('fs');
var http = require('http');
var p5 = require('parse5');
var css = require('css/parse');
var vm = require('vm');
var domcore = require('./domcore');
htmlparser = new p5.Parser();
function Page(){
	this.ctx = null;
	this.styles = null;
	this.head = null;
	this.body = null;
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
		var text = node.value;
		for(var i=0; i<text.length; i++){

		}
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
function styleCore(node, inherit){
	var mysty = this.styles.filter(style => style.selectors.every(selector => selectorMatch(selector, node)));
	node.style = {};
	if (inherit){
		for(var key in inherit) node.style[key] = inherit[key];
	}
	mysty.forEach(style => (node.style[style.property] = style.value));
	if (node.attrs.style){
		node.attrs.style.split(';').forEach((x) => {
			var a=x.indexOf(':');
			if (~a) node.style[x.slice(0,a)] = x.slice(a+1);
		});
	}
	node.childNodes.forEach(styleCore.bind(this, node.style));
}
Page.prototype.restyle = function(){
	styleCore.call(this, this.body);
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
