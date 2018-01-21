var SerialPort = require('serialport');
var randomstring = require("randomstring");
var port = new SerialPort('/dev/ttyACM0');

var str = randomstring.generate(1000);
port.write(str, function(err) {
  if (err) {
    return console.log('Error on write: ', err.message);
  }
  console.log('message written: ', str, '\n');
});

// Open errors will be emitted as an error event
port.on('error', function(err) {
  console.log('Error: ', err.message);
});

port.on('data', function (data) {
  console.log('Data:', data.toString('utf8'), '\n');
});
