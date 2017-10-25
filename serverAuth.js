var LED = require("./cpp/build/Release/DrOcto");
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server, {path: '/socket/socket.io'});

var port = 8080

var sending = false;
var authTable = {}
server.listen(port);
console.log("listening on port:", port);

io.on('connection', function (socket) {
  console.log("new connection!");
  socket.on("newPos", function(data){

  });
  socket.on("submit", function(data){
    console.log(data.key);
  });

});
