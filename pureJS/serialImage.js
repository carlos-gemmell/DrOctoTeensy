var SerialPort = require('serialport');
var port = new SerialPort('/dev/ttyACM0');
var conv = require('./arrayConverter');
var fs = require('fs');
var PNG = require('pngjs').PNG;


console.time("load");
function displayImageFromFile(image_string){                 // timer used to log image loading time
  console.log("Creating read stream");
  var reader = fs.createReadStream(__dirname + image_string).pipe(new PNG({filterType: 4}));            // Opening file and procede to adding handlers
  console.log("Read stream created");

  reader.on('error', function(err){                         // error handleing when reading file, unsure if properly working though
    console.log("Pipe error:", err);
  });

  reader.on('parsed', function(data) {
    console.log("Image loading time:");
    console.timeEnd("load");
    console.time("process");

    var arr = Array(2400).fill(0x000000);

    for (var y = 0; y < this.height; y++) {
      for (var x = 0; x < this.width; x++) {
        var idx = (this.width * y + x) << 2;
        var pixel = this.data[idx] << 16 | this.data[idx+1] << 8 | this.data[idx+2];
        // console.log("pixel pos x:i ", x, " y: ", y, " [",this.data[idx].toString(16), this.data[idx+1].toString(16), this.data[idx+2].toString(16), "]", "->", pixel);
        arr[getCoord(x,y)] = pixel;
      }
    }

    // arr[getCoord(30,7)] = 0xFF00FF;

    conv.serialize(60,40,arr,function(serialString){
      console.log("done serializing!");
      console.log("Int array: ");
      console.log(JSON.stringify(serialString));
      port.write(serialString, function(err) {
        if (err) {
          return console.log('Error on write: ', err.message);
        }
        console.log('message written to Teensy');
      });
    });

    console.log("Image processing time:");
    console.timeEnd("process");
  });
}


// Open errors will be emitted as an error event
// port.on('error', function(err) {
//   console.log('Error: ', err.message);
// });
//
// port.on('data', function (data) {
//   console.log('Data:', JSON.stringify(data.toString('utf8').split('').map(x => x.charCodeAt(0))));
// });

function getCoord(x,y){
  return y * 60 + x;
}

function hex2bin(hex){
    return ("00000000" + (parseInt(hex, 16)).toString(2)).substr(-8);
}

if (require.main === module) {
  var image_string = (process.argv.length > 2) ? "/"+process.argv[2] : '/../images/active.png';
  console.log("Searching for PNG at:", image_string);
    displayImageFromFile(image_string);
}
