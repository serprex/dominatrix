#include "functions.h"

#define mkFunc(x) Nan::Set(target, Nan::New(#x).ToLocalChecked(), Nan::GetFunction(Nan::New<v8::FunctionTemplate>(x)).ToLocalChecked()) 
NAN_MODULE_INIT(InitAll) {
	mkFunc(nothing);
	mkFunc(aString);
	mkFunc(aBoolean);
	mkFunc(aNumber);
	mkFunc(anObject);
	mkFunc(anArray);
	mkFunc(callback);
	mkFunc(glinit);
	mkFunc(glloop);
	mkFunc(glswap);
	mkFunc(glrect);
}
NODE_MODULE(domcore, InitAll)
