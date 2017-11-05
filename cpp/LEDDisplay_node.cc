#include <node.h>
#include <v8.h>
#include <uv.h>
#include <string>
#include <iostream>
#include <vector>
#include <algorithm>
#include <chrono>
#include <thread>
#include <unistd.h>
#include <stdio.h>
#include <bitset>
#include <math.h>

using namespace std;
using namespace v8;

class Singleton
{
  private:
    /* Here will be the instance stored. */
    static Singleton* instance;
    /* Private constructor to prevent instancing. */
    Singleton();
    int data = 5;
  public:
      /* Static access method. */
    static Singleton* getInstance();
  public: int getData(){
      return data;
    }
  public: void increaseData(){
            data++;
          }
};

/* Null, because instance will be initialized on demand. */
Singleton* Singleton::instance = 0;

Singleton* Singleton::getInstance()
{
  if (instance == 0)
  {
    instance = new Singleton();
  }

  return instance;
}

Singleton::Singleton()
{}


struct Work {
  uv_work_t  request;
  Persistent<Function> callback;

  vector<int> flatArray;
  int width;
  int height;
};

// called by libuv worker in separate thread
static void displayAsync(uv_work_t *req)
{
    Work *work = static_cast<Work *>(req->data);

    Singleton* s = Singleton::getInstance();
    int Sdata;
    Sdata = s->getData();
    s->increaseData();
    cout << "data from singleton: " << Sdata << endl;
    cout << "array passed with width: " << work->width << ", and height: " << work->height << endl;
    cout << "passed, flattned array: ";

    int gammatable[256];
    float gamma = 1.7;
    for (int i=0; i < 256; i++) {
      gammatable[i] = (int)(pow((float)i / 255.0, gamma) * 255.0 + 0.5);
    }

    float framerate=30;

    //place flat line to [300][8] algorithm here
    // int image[(work->width * work->height)/8][8];
    // int LSH = 5;
    //
    // for(int a = 0; a < sizeof(image)/sizeof(image[0]); a++){
    //   int Cy = (a/work->width)-(((a/work->width)/LSH)*LSH);
    //   int zig = ((Cy & 1)-1)*(-1);
    //   int zag = (zig-1)*(-1);
    //   int Rn = (zag*(a-(Cy*(work->width))))+(zig*((Cy*(work->width))+(work->width)-1)-(a-(a/(work->width))*(work->width)));
    //   image[Rn][(a/(work->width))/LSH] = (work->flatArray[a]) ? work->flatArray[a] : 0x000000;
    // }
    //end of conversion

    // int image[300][8];
    // for(int i = 0; i < sizeof(image)/sizeof(image[0]); i++){
    //   for(int j = 0; j < 8; j++){
    //     image[i][j] = (((j >= 4) && (i>=0)) ? 0x990099 : 0x000000);
    //     //int rows[8] = { 0x000000, 0x001111, 0x002222, 0x003333, 0x004444, 0x005555, 0x006666, 0x007777 };
    //     //image[i][j] = rows[j];
    //   }
    // }

    int image[300][8];
    for (int i = 0; i < 8; i++){
      for (int j = 0; j < (work->height)/8; j++){
        for(int k = 0; k < work->width; k++){
          // printf("Setting pixel in 8x300 array from flattned array at x: %d, y: %d, to %d\n", ((((work->height)/8)*i)+j), k, (j & 1) ? work->flatArray[(((((work->height)/8)*i)+j)*work->width)+k] : work->flatArray[(((((work->height)/8)*i)+j)*work->width)+((work->width - 1) - k)]);
          image[((work->width)*j) + k][i] = (j & 1) ? work->flatArray[(((((work->height)/8)*i)+j)*work->width)+k] : work->flatArray[(((((work->height)/8)*i)+j)*work->width)+((work->width - 1) - k)];
        }
      }
    }

    //rearranging pixel values from RGB to GRB
    for(int i = 0; i < sizeof(image)/sizeof(image[0]); i++){
      for(int j = 0; j < sizeof(image[0])/sizeof(image[0][0]); j++){
        int red = (image[i][j] & 0xFF0000) >> 16;
        int green = (image[i][j] & 0x00FF00) >> 8;
        int blue = (image[i][j] & 0x0000FF);
        red = gammatable[red];
        green = gammatable[green];
        blue = gammatable[blue];
        image[i][j] = (green << 16) | (red << 8) | (blue);
	printf("this is the GRB val from he 300x8 array i: %d, j: %d, val: %d\n", i, j, image[i][j]);
      }
    }

    //flatten image (2D GRB int array) into char array with some stuff at the front
    char ledData[((sizeof(image)/sizeof(image[0])) * (sizeof(image[0])/sizeof(image[0][0])) * 3) + 3];
    ledData[0] = '*';
    int usec = (int)((1000000.0 / framerate) * 0.75);
    ledData[1] = (char)(usec);
    ledData[2] = (char)(usec >> 8);
    int offset = 3;
    int mask;
    for (int x = 0; x < sizeof(image)/sizeof(image[0]); x++) {
      // convert 8 pixels to 24 bytes
      for (mask = 0x800000; mask != 0x000000; mask >>= 1) {
        char c = 0x00;
        for (int y=0; y < sizeof(image[0])/sizeof(image[0][0]); y++) {
          if ((image[x][y] & mask) != 0){
            c |= (1 << y);
          }
        }
        cout << bitset<8>(c) << " offset " << offset << endl;
        ledData[offset++] = c;
      }
    }
    FILE *file;
    file = fopen("/dev/ttyACM0","w");  //Opening device file
    //data[0] &= ~0x40;
    for (int i = 0; i < sizeof(ledData)/sizeof(ledData[0]); i++){
      // usleep(10);
      fprintf(file,"%c",ledData[i]); //Writing to the file
      //fprintf(file,"%c",','); //To separate digits
    }
    fclose(file);
}

// called by libuv in event loop when async function completes
static void displayAsyncComplete(uv_work_t *req,int status)
{
    Isolate * isolate = Isolate::GetCurrent();

    // Fix for Node 4.x - thanks to https://github.com/nwjs/blink/commit/ecda32d117aca108c44f38c8eb2cb2d0810dfdeb
    v8::HandleScope handleScope(isolate);

    Work *work = static_cast<Work *>(req->data);

    // set up return arguments
    Handle<Value> argv[] = { Null(isolate) };

    // execute the callback
    // https://stackoverflow.com/questions/13826803/calling-javascript-function-from-a-c-callback-in-v8/28554065#28554065
    Local<Function>::New(isolate, work->callback)->Call(isolate->GetCurrentContext()->Global(), 1, argv);

    // Free up the persistent function callback
    work->callback.Reset();
    delete work;

}

void displayLEDAsync(const v8::FunctionCallbackInfo<v8::Value>&args) {
    Isolate* isolate = args.GetIsolate();

    Work * work = new Work();
    work->request.data = work;

    //the first two arg are the width and height of the area
    //They will be passed allong to parse the flat array
    int width = args[0]->NumberValue();
    int height = args[1]->NumberValue();

    work->width = width;
    work->height = height;

    //get the third argument passed by node and store it as a casted array
    Local<Array> flatArray = Local<Array>::Cast(args[2]);

    unsigned int arrSize = flatArray->Length();
    if (width * height != arrSize){
      cout << "Array size does not match width and height" << endl;
    }

    for (unsigned int i = 0; i < arrSize; i++) {
      work->flatArray.push_back(flatArray->Get(i)->Uint32Value());
    }
    // store the callback from JS in the work package so we can
    // invoke it later
    Local<Function> callback = Local<Function>::Cast(args[3]);
    work->callback.Reset(isolate, callback);

    // kick of the worker thread
    uv_queue_work(uv_default_loop(),&work->request,displayAsync,displayAsyncComplete);


    args.GetReturnValue().Set(Undefined(isolate));

}

void init(Handle <Object> exports, Handle<Object> module) {
  NODE_SET_METHOD(exports, "calculate_results_async", displayLEDAsync);

}

NODE_MODULE(DrOcto, init)
