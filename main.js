#!/bin/node
var vm = require("vm");
var parse5 = require("parse5");
var glfw = require("./glfw");
var gl = require("./gl");
glfw.init();
var wnd = glfw.createWindow(800, 600, "Dominatrix", null, null);
if (wnd.isNull()){
	console.log("Null wnd");
	process.exit();
}
glfw.makeContextCurrent(wnd);
gl.glOrtho(0,800,600,0,1,-1);
setInterval(()=>{
	var c = Math.random()*256&127;
	gl.glColor3ub(c, c, c);
	gl.glRecti(0,0,800,600);
	gl.glFinish();
	glfw.swapBuffers(wnd);
},100);
