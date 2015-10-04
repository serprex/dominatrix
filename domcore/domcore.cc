#include "domcore.h"

#define mkFunc(x) Nan::Set(target, Nan::New(#x).ToLocalChecked(), Nan::GetFunction(Nan::New<v8::FunctionTemplate>(x)).ToLocalChecked()) 
NAN_MODULE_INIT(InitAll) {
	mkFunc(glinit);
	mkFunc(glloop);
	mkFunc(glswap);
	mkFunc(glcolor);
	mkFunc(glrandcolor);
	mkFunc(glrect);
	mkFunc(gltext);
}
NODE_MODULE(domcore, InitAll)
