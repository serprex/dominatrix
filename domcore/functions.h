#ifndef NATIVE_EXTENSION_GRAB_H
#define NATIVE_EXTENSION_GRAB_H

#include <nan.h>
#include <GLFW/glfw3.h>
#include <GL/gl.h>
// Example top-level functions. These functions demonstrate how to return various js types.
// Implementations are in functions.cc

NAN_METHOD(nothing);
NAN_METHOD(aString);
NAN_METHOD(aBoolean);
NAN_METHOD(aNumber);
NAN_METHOD(anObject);
NAN_METHOD(anArray);
NAN_METHOD(callback);
NAN_METHOD(glswap);
NAN_METHOD(glrect);
NAN_METHOD(glinit);
NAN_METHOD(glloop);
#endif
