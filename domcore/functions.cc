#include "functions.h"
#include <cstdlib>
GLFWwindow*wnd;


NAN_METHOD(nothing) {
}

NAN_METHOD(aString) {
    info.GetReturnValue().Set(Nan::New("This is a thing.").ToLocalChecked());
}

NAN_METHOD(aBoolean) {
    info.GetReturnValue().Set(false);
}

NAN_METHOD(aNumber) {
    info.GetReturnValue().Set(1.75);
}

NAN_METHOD(anObject) {
    v8::Local<v8::Object> obj = Nan::New<v8::Object>();
    Nan::Set(obj, Nan::New("key").ToLocalChecked(), Nan::New("value").ToLocalChecked());
    info.GetReturnValue().Set(obj);
}

NAN_METHOD(anArray) {
    v8::Local<v8::Array> arr = Nan::New<v8::Array>(3);
    Nan::Set(arr, 0, Nan::New(1));
    Nan::Set(arr, 1, Nan::New(2));
    Nan::Set(arr, 2, Nan::New(3));
    info.GetReturnValue().Set(arr);
}

NAN_METHOD(callback) {
    v8::Local<v8::Function> callbackHandle = info[0].As<v8::Function>();
    Nan::MakeCallback(Nan::GetCurrentContext()->Global(), callbackHandle, 0, 0);
}

NAN_METHOD(glinit) {
	glfwInit();
	wnd = glfwCreateWindow(640, 480, "Dominatrix", 0, 0);
	glfwMakeContextCurrent(wnd);
	glOrtho(0,640,480,0,1,-1);
}

NAN_METHOD(glrect) {
	glColor3ub(rand(), rand(), rand());
	glRectf(info[0]->NumberValue(), info[1]->NumberValue(), info[2]->NumberValue(), info[3]->NumberValue());
}

NAN_METHOD(glswap) {
	glfwSwapBuffers(wnd);
}

static void loopcore(v8::Handle<v8::Object> node){
	auto contentStr = Nan::New("content").ToLocalChecked();
	if (!node->Has(contentStr) || node->Get(contentStr)->IsUndefined()) return;
	auto content = v8::Local<v8::Array>::Cast(node->Get(contentStr));
	glRectf(content->Get(0)->ToNumber()->Value(),content->Get(1)->ToNumber()->Value(),content->Get(2)->ToNumber()->Value(),content->Get(3)->ToNumber()->Value());
	auto childNodesStr = Nan::New("childNodes").ToLocalChecked();
	if (!node->Has(childNodesStr) || node->Get(childNodesStr)->IsUndefined()) return;
	auto children = v8::Local<v8::Array>::Cast(node->Get(childNodesStr));
	for(unsigned i=0; i<children->Length(); i++) loopcore(children->Get(i).As<v8::Object>());
}

NAN_METHOD(glloop) {
	if (glfwWindowShouldClose(wnd)){
		info.GetReturnValue().Set(false);
	}else{
		glfwPollEvents();
		glColor3ub(100, 50, 25);
		loopcore(info[0].As<v8::Object>());
		glfwSwapBuffers(wnd);
		info.GetReturnValue().Set(true);
	}
}
