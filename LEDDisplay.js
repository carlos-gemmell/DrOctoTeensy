var LED = require("./cpp/build/Release/DrOcto");
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server, {path: '/socket/socket.io'});

var port = 8080

var sending = false;
server.listen(port);
console.log("listening on port:", port);

io.on('connection', function (socket) {
  console.time("serial");
  var arr = Array(2400).fill(0x000000);
  LED.calculate_results_async(60,40,arr,function(err, result) {
    console.log("leds shown asynchronously");
    console.timeEnd("serial");
  });
  console.log("Async results probably still not here yet...");

  socket.on("newPos", function(data){
    var arr = Array(2400).fill(0x000000);
    arr[getCoord(data.x, data.y)] = 16711935;
    arr[getCoord(data.x-1, data.y)] = 7798903;
    arr[getCoord(data.x+1, data.y)] = 7798903;
    arr[getCoord(data.x, data.y-1)] = 7798903;
    arr[getCoord(data.x, data.y+1)] = 7798903;
    arr[getCoord(data.x-1, data.y-1)] = 3342387;
    arr[getCoord(data.x+1, data.y+1)] = 3342387;
    arr[getCoord(data.x-1, data.y+1)] = 3342387;
    arr[getCoord(data.x+1, data.y-1)] = 3342387;
    arr[getCoord(data.x-2, data.y)] = 1114129;
    arr[getCoord(data.x+2, data.y)] = 1114129;
    arr[getCoord(data.x, data.y-2)] = 1114129;
    arr[getCoord(data.x, data.y+2)] = 1114129;
    console.log(data);
    if(!sending){
      LED.calculate_results_async(60, 40, arr, function(err, result) {
        sending = false;
      });
    }
    sending = true;
  })
  function getCoord(x,y){
    return y * 60 + x;
  }
});
