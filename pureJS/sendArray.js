// This function takes charge of returning a character array in compliance with what the Teensy wants to recieve
// It is still unclear wether the formatting characters at the start of the byte stream are to be included in the function.
// However, converting a PNG into a file of this format could prove to save computational time.
exports.serialize = function(width, height, arr, cb){

  // Creating the gamma table to correct the colors of the pannel
  var gammaTable = [];
  var gamma = 1.7;
  for (var i = 0; i < 256; i++){
    gammaTable.push(Math.pow(i/255.0, gamma) * 255.0 + 0.5);
  }

  // Straighten the pixel array which has fliped rows relative to the chanel array.
  // We repeat this for however many chanels there are, in our case 8.
  var image = new Array(8);
  for (var row = 0; row < height; row++){
    var chanel = Math.floor(row * 8 / height);
    var amountPixels = width * height / 8;
    image[chanel] = ironChanel(arr.splice(0, amountPixels), width);
  }


}

// This function takes a chanel straight from the pixel array and returnes the same array
// but with the even rows fliped since the chanels are daisy chained and zig-zag, 
// where as the pixel array loops round to keep indexing simple.
function ironChanel(lines, width){
  var nbrLines = lines.length / width;

  var ironed = [];
  for(var i = 0; i < nbrLines; i++){
    if(i & 0){
      // Flip the even rows since the Teensy is on the left side of the display
      ironed.concat(lines.splice(0,width).reverse());
    }
    else {
      ironed.concat(lines.splice(0,width));
    }
  }
  return ironed;
}
