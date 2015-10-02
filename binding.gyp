{"targets":[{"target_name":"domcore",
	"sources":["./domcore/domcore.cc", "./domcore/functions.cc"],
	"include_dirs":[
		"<!(node -e \"require('nan')\")"
	],
	"libraries":['-lglfw','-lGL']
}]}