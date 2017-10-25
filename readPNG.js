
var fs = require('fs');
var PNG = require('pngjs').PNG;

console.time("load");
fs.createReadStream('images/panelSize.png')
    .pipe(new PNG({
        filterType: 4
    }))
    .on('parsed', function(data) {
        console.timeEnd("load");
        console.time("process");
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                var idx = (this.width * y + x) << 2;
                var pixel = this.data[idx] << 16 | this.data[idx+1] << 8 | this.data[idx+2];
                console.log("[",this.data[idx].toString(16), this.data[idx+1].toString(16), this.data[idx+2].toString(16), "]", "->", pixel);
            }
        }
        console.timeEnd("process");

        //this.pack().pipe(fs.createWriteStream('out.png'));
    });
