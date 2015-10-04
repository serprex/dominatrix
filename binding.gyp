{"targets":[{"target_name":"domcore",
	"sources":["./domcore/domcore.cc", "./domcore/ft2.cc", "./domcore/gl.cc"],
	"include_dirs":[
		"<!(node -e 'require(\"nan\")')",
		"/usr/include/freetype2"
	],
	"libraries":['-lglfw','-lGLEW','-lGL']
}]}