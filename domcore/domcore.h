#include <cstdlib>
#include <nan.h>
#include <GL/glew.h>
#include <GLFW/glfw3.h>
//#include <GL/gl.h>
//#include <GL/glext.h>
#include <ft2build.h>
#include FT_FREETYPE_H

NAN_METHOD(glswap);
NAN_METHOD(glcolor);
NAN_METHOD(glrandcolor);
NAN_METHOD(glrect);
NAN_METHOD(gltext);
NAN_METHOD(glinit);
NAN_METHOD(glloop);
NAN_METHOD(ftinit);
NAN_METHOD(ftface);
NAN_METHOD(ftdrawtext);
