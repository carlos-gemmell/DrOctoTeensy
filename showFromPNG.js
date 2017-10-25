var LED = require("./cpp/build/Release/DrOcto");

var sending = false;

var fs = require('fs');
var PNG = require('pngjs').PNG;

console.time("load");
fs.createReadStream('images/pannelPattern.png')
    .pipe(new PNG({
        filterType: 4
    }))
    .on('parsed', function(data) {
        console.timeEnd("load");
        console.time("process");
        
	var arr = Array(2400).fill(0x000000);

        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                var idx = (this.width * y + x) << 2;
                var pixel = this.data[idx] << 16 | this.data[idx+1] << 8 | this.data[idx+2];
                console.log("pixel pos x:i ", x, " y: ", y, " [",this.data[idx].toString(16), this.data[idx+1].toString(16), this.data[idx+2].toString(16), "]", "->", pixel);

	        arr[getCoord(x,y)] = pixel;
		
            }
        }

	LED.calculate_results_async(60, 40, arr, function(err, result) {
	  sending = false;
	});

        console.timeEnd("process");

        //this.pack().pipe(fs.createWriteStream('out.png'));
    });

sending = true;
function getCoord(x,y){
  return y * 60 + x;
}

