# DrOctoTeensy
A high performance framework for LED projects using node and Teensy

[![N|Solid](https://github.com/aquaktus/DrOctoTeensy/blob/master/images/Screenshot_2017-10-25-17-28-55.png)](https://github.com/aquaktus/DrOctoTeensy/blob/master/images/Screenshot_2017-10-25-17-28-55.png)

## How it works
The teensy is an arduino compatible microcontroller that is used as the interface between the raw LEDS (WS2811) and the computer. It is tasked with listening to serial data from the usb and converting it into electrical signals for the addressable LED strips.
These run at 800kHz and take a 24bit number for each color for the pixel:
	- 0xFF << 16 (green)
	- 0xFF << 8  (red)
	- 0xFF       (blue)
In depth formatting of the signal is done by the OctoWs2811 library from PJRC (really awesome!).

The teensy uses 8 pins as independant simultaneous data chanels for leds, allowing for massive speedups. A technique called DMA (direc memory access) is also used to free up lots of time for the processor to handle other tasks such as recieving serial data.

The plan for this framework was to integrate it easily into common real time systems such as live data from the web. As such NodeJs is my language of choice as the final target. 
Node can interact with the teensy through a c++ module made using V8 and NAN. The code is then compiled specifically for each machine with the desired compiler flags noted in bindings.gyp and then imported into the js script like any other module.
Of course, sending data for large LED arrays can take some time (60x40 grid can take up to 40ms), as such, calls to the code are made asynchronously exposing a callback function once the process completes. 

Formatting of the data for the node module is done as a flattned array where a pixel is represented as an int (0xFF << 16 (red) 0xFF << 8 (green) 0xFF (blue)), where pixels are accessed as so:
	x,y -> pix_array[y * width + x]

Applications for this have already been developed such as a real time web client for all platforms to control the pannel through a web app using socket.io and express in Node. As well as a png converter.

## Setup
### If you just cool colors that move around
This option is very good if you don't want anything attached to the Teensy and still gives you a mesmerising light show.
To run it, copy the contents of arduino/PlasmaAnimation.ino into the arduino editor and setup the Teensy to load the script by selecting Teensy 3.2 from -board in the Tools tab at the top of the editor. Then just click the arrow button below to compile and upload.

### Fancier video display stuff
If you want to use a computer to send video display info to the Teensy for custom animations, do the process above but with arduino/VideoDisplay.ino changing the settings to whatever your display requires ( current proportions are set to 60x40 ).
The computer code is buggy at the moment as it uses native C++ file read/write functions to send data and there are still kinks to be worked out. But if you want to get knee deep in Node C++ addons, Scott Frees has a great blog [here](https://nodeaddons.com/) to use along side the module i made ( this will be probably removed in the future ).
Alternatively, a version of the computer side sending code is currently in production implemented in pure __JS__ which should have better results.

[![N|Solid](https://github.com/aquaktus/DrOctoTeensy/blob/master/images/IMG-20170816-WA0008.jpeg)](https://github.com/aquaktus/DrOctoTeensy/blob/master/images/IMG-20170816-WA0008.jpeg)


Comments welcome!
