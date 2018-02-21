var fs = require('fs');
var compileSingle = require('./compileSingle');

var loop = false;
var reversed = false;

if (process.argv.length <= 2) {
    console.log("Usage: " + __filename + " path/to/directory");
    process.exit(-1);
}

var path = process.argv[2];

var params = process.argv.slice(3);

for(var i = 0; i < params.length; i++){
  if(params[i] == '-reversed'){
    var reversed = true;
  }
}

if (!fs.existsSync(path)){
    console.log("No directory found at:", path);
    process.exit(-1);
}
var dir = path + "Compiled/"
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

fs.readdir(path, function(err, items) {
    items = items.filter(item => item.endsWith('.png')).sort();

    recursiveDisplay(0, items, loop);
});

function recursiveDisplay(i, items, loop){
  compileSingle.compileImageFromFile('/' + path + items[i], dir, reversed, ()=>{
    if((loop ? (i+1)%items.length : i+1) < items.length){
      recursiveDisplay((i+1)%items.length, items, loop);
    }
  });
}
