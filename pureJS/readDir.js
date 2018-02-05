var fs = require('fs');
var serialImage = require("./serialImage")

var loop = false;

if (process.argv.length <= 2) {
    console.log("Usage: " + __filename + " path/to/directory");
    process.exit(-1);
}

var path = process.argv[2];

if (process.argv[3] == "-loop=true") {
    loop = true;
}

fs.readdir(path, function(err, items) {
    items = items.filter(item => item.endsWith('.png')).sort();

    recursiveDisplay(0, items, loop);
});

function recursiveDisplay(i, items, loop){
  serialImage.displayImageFromFile('/' + path + items[i],()=>{
    if((loop ? (i+1)%items.length : i+1) < items.length){
      recursiveDisplay((i+1)%items.length, items, loop);
    }
  });
}
