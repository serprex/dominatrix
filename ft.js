"use strict";
var ffi = require("ffi");
var ref = require("ref");
var struct = require("ref-struct");
exports.Library = ref.types.void;
exports.BitmapSize = struct({
	height:'short',
	width:'short',
	size:'uint64',
	xppem:'uint64',
	yppem:'uint64',
});
exports.Libraryp = ref.refType(exports.Library);
exports.BitmapSizep = ref.refType(exports.BitmapSize);
var string = ref.types.CString;
//exports.Face = ref.types.void;
exports.Face = struct({
	numFaces:'int64',
	faceIndex:'int64',
	faceFlags:'int64',
	styleFlags:'int64',
	numGlyphs:'int64',
	familyName:string,
	styleName:string,
	numFixedSizes:'int',
	availableSizes:exports.BitmapSizep;
	num_charmaps:'int',
	char
});
exports.Facep = ref.refType(ref.types.Face);
var ft = ffi.Library("libfreetype", {
	FT_Init_FreeType:['int',[exports.Libraryp]],
	FT_New_Face:['int',[exports.Library,string,'int',exports.Facep]]
	FT_SetPixel_Sizes:['int',[exports.Face,'int','int']],
	FT_Load_Char:['int',[exports.Face,'char','int']],
});
exports.initFreeType = ft.FT_Init_FreeType;
exports.newFace = ft.FT_New_Face;
exports.setPixelSizes = ft.FT_SetPixelSizes;
exports.loadChar = ft.FT_Load_Char;
exports.LOAD_DEFAULT = 0;
exports.LOAD_NO_SCALE = 1;
exports.LOAD_NO_HINTING = 1 << 1;
exports.LOAD_RENDER = 1<<2;
