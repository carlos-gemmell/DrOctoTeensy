var SerialPort = require('serialport');
var port = new SerialPort('/dev/ttyACM0');
var fs = require('fs');


// console.time("load");
exports.displayImageFromCompiledFile = function displayImageFromCompiledFile(image_string, cb = ()=>{}){                 // timer used to log image loading time
  // console.log("Creating read stream");
  fs.readFile(image_string, 'utf8', function readFileCallback(err, data){
    if (err){
        console.log(err);
    } else {
    obj = JSON.parse(data); //now it an object

    port.write(obj.data, function(err) {
      if (err) {
        return console.log('Error on write: ', err.message);
      }
      // console.log('message written to Teensy');
      setTimeout(cb, 40);
    });
  }});
}

if (require.main === module) {
  var image_string = (process.argv.length > 2) ? "/"+process.argv[2] : '/../images/active.png';
  // console.log("Searching for PNG at:", image_string);
    displayImageFromCompiledFile(image_string);
}
