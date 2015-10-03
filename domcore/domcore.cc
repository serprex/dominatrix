#include "functions.h"

using v8::FunctionTemplate;

NAN_MODULE_INIT(InitAll) {
	Nan::Set(target, Nan::New("nothing").ToLocalChecked(),
		Nan::GetFunction(Nan::New<FunctionTemplate>(nothing)).ToLocalChecked());
	Nan::Set(target, Nan::New("aString").ToLocalChecked(),
		Nan::GetFunction(Nan::New<FunctionTemplate>(aString)).ToLocalChecked());
	Nan::Set(target, Nan::New("aBoolean").ToLocalChecked(),
		Nan::GetFunction(Nan::New<FunctionTemplate>(aBoolean)).ToLocalChecked());
	Nan::Set(target, Nan::New("aNumber").ToLocalChecked(),
		Nan::GetFunction(Nan::New<FunctionTemplate>(aNumber)).ToLocalChecked());
	Nan::Set(target, Nan::New("anObject").ToLocalChecked(),
		Nan::GetFunction(Nan::New<FunctionTemplate>(anObject)).ToLocalChecked());
	Nan::Set(target, Nan::New("anArray").ToLocalChecked(),
		Nan::GetFunction(Nan::New<FunctionTemplate>(anArray)).ToLocalChecked());
	Nan::Set(target, Nan::New("callback").ToLocalChecked(),
		Nan::GetFunction(Nan::New<FunctionTemplate>(callback)).ToLocalChecked());
	Nan::Set(target, Nan::New("glinit").ToLocalChecked(),
		Nan::GetFunction(Nan::New<FunctionTemplate>(glinit)).ToLocalChecked());
	Nan::Set(target, Nan::New("glloop").ToLocalChecked(),
		Nan::GetFunction(Nan::New<FunctionTemplate>(glloop)).ToLocalChecked());
}

NODE_MODULE(domcore, InitAll)
