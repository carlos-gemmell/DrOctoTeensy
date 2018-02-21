var fs = require('fs');
var conv = require('./arrayConverter');
var PNG = require('pngjs').PNG;

exports.compileImageFromFile = function compileImageFromFile(image_string, outputFolder, reversed, cb = ()=>{}){                 // timer used to log image loading time
  // console.log("Creating read stream");
  var reader = fs.createReadStream(__dirname + image_string).pipe(new PNG({filterType: 4}));            // Opening file and procede to adding handlers
  // console.log("Read stream created");

  reader.on('error', function(err){                         // error handleing when reading file, unsure if properly working though
    console.log("Pipe error:", err);
  });

  reader.on('parsed', function(data) {
    // console.log("Image loading time:");
    // console.timeEnd("load");
    // console.time("process");

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

    conv.serialize(60,40,arr, reversed, function(serialString){
      // console.log("done serializing!");
      // console.log("Int array: ");
      // console.log(JSON.stringify(serialString));
      var json = JSON.stringify({"data":serialString});
      console.log("trying to open file", image_string.split('/').reverse()[0].split('.')[0] + ".json")
      fs.writeFile(outputFolder + image_string.split('/').reverse()[0].split('.')[0] + ".json", json, 'utf8', cb());
    });

    // console.log("Image processing time:");
    // console.timeEnd("process");
  });
}

function getCoord(x,y){
  return y * 60 + x;
}

function hex2bin(hex){
    return ("00000000" + (parseInt(hex, 16)).toString(2)).substr(-8);
}

if (require.main === module) {
  var image_string = (process.argv.length > 2) ? "/"+process.argv[2] : '/../images/active.png';
  var outputFolder = (process.argv.length > 3) ? process.argv[3] : '';
  // console.log("Searching for PNG at:", image_string);
  compileImageFromFile(image_string, outputFolder);
}
