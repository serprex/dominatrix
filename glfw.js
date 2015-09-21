var ffi = require("ffi");
var ref = require("ref");
exports.window = ref.types.void;
exports.windowp = ref.refType(exports.window);
var glfw = ffi.Library("libglfw", {
	glfwInit: ['void', []],
	glfwCreateWindow: [exports.windowp, ['int', 'int', ref.types.CString, 'pointer', 'pointer']],
	glfwMakeContextCurrent: ['void', [exports.windowp]],
	glfwSwapBuffers:['void', [exports.windowp]],
});
exports.init = glfw.glfwInit;
exports.createWindow = glfw.glfwCreateWindow;
exports.makeContextCurrent = glfw.glfwMakeContextCurrent;
exports.swapBuffers = glfw.glfwSwapBuffers;
