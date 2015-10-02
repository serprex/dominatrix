var ffi = require("ffi");
var ref = require("ref");
module.exports = ffi.Library("libGL", {
	glOrtho:['void',['double','double','double','double','double','double']],
	glColor3ub:['void',['char','char','char']],
	glRecti:['void',['int','int','int','int']],
	glFinish:['void',[]],
});
