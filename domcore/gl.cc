#include "domcore.h"
GLFWwindow*wnd;

NAN_METHOD(glinit) {
	glfwInit();
	wnd = glfwCreateWindow(640, 480, "Dominatrix", 0, 0);
	glfwMakeContextCurrent(wnd);
	glewInit();
	glOrtho(0,640,480,0,1,-1);
	//glEnable(GL_BLEND);
	//glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
}

NAN_METHOD(glcolor) {
	glColor3ub(info[0]->Int32Value(), info[1]->Int32Value(), info[2]->Int32Value());
}

NAN_METHOD(glrandcolor) {
	glColor3ub(rand(), rand(), rand());
}

NAN_METHOD(glrect) {
	glRectf(info[0]->NumberValue(), info[1]->NumberValue(), info[2]->NumberValue(), info[3]->NumberValue());
}

NAN_METHOD(gltext) {
	float x = info[0]->NumberValue(),
		y = info[1]->NumberValue();
	auto str = info[2]->ToString();
	for(int i=0; i<str->Length(); i++){
		glRectf(x,y+1,x+10,y+14);
		x+=12;
	}
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
