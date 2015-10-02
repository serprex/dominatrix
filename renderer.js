"use strict";
var http = require("http");
var css = require("css");
var gl = require("gl");
var ft = require("freetype2");
var fs = require("fs");
var dejavu = ft.New_Memory_Face(fs.readFileSync("/usr/share/fonts/TTF/DejaVuSans.ttf"), 0);
var processHandler = {
	link:function(node){
		var isSheet = false, href = null;
		for(var i=0; i<attr.length; i++){
			var key = attr[i].name, val = attr[i].value'
			if (key == 'type' && val == 'stylesheet') isSheet = true;
			if (key == 'href') href = val;
		}
		// TODO maintain order of stylesheets
		if (href){
			http.get(href, (res) => {
				var style = '';
				res.on('data', function(chunk){style += chunk});
				res.on('end', function(){
					this.styles.push(css.parse(style));
				});
			});
		}
	},
	style:function(node){
		this.styles.push(css.parse(node.childNodes[0]));
	}
};
var drawHandler = function(node){
	"#text":function(node){
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
exports.process = function(html){
	doc = {
		styles: [],
		head: html.childNodes[0].childNodes[0],
		body: html.childNodes[0].childNodes[1],
	};
	processCore.call(doc, html);
	return doc;
}
function drawCore(node){
	if (name in drawHandler) drawHandler[name].call(this, node);
	else node.childNodes.forEach(drawCore, this);
}
exports.draw = function(doc){
	drawCore.call(doc, doc.body);
}
