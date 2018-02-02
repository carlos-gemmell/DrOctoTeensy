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
  var channel_image = new Array(8);
  for (var channel = 0; channel < channel_image.length; channel++){
    var amountPixels = width * height / 8;
    var section = arr.slice(channel * amountPixels, (channel + 1) * amountPixels);
    channel_image[channel] = ironChanel(section, width);
  }

  // This is a heavy opperation -> 4+ms!!!!!!!
  var multi_channel_pixel_array = transpose(channel_image);

  console.log(getDim(multi_channel_pixel_array))

  serial_string = "*¨a";          // these are the first bytes to send to the teensy, they correspond to the framerate of the teensy, but at the moment they are static

  var count = 0;

  for(var i = 0; i < multi_channel_pixel_array.length; i++){
    // convert 8 pixels to 24 bytes
    for (mask = 0x800000; mask != 0x000000; mask >>= 1) {
      var c = 0x00;
      for (var y=0; y < multi_channel_pixel_array[i].length; y++) {
        if ((multi_channel_pixel_array[i][y] & mask) != 0){
          c |= (1 << y);
        }
      }
      console.log(hex2bin(c));
      if(c == 0x00){
        count++;
      }
      serial_string += String.fromCharCode(c);
    }
    console.log("----------------", i);
  }

  console.log("count:", count);


  cb(serial_string);
}

function hex2bin(hex){
    return ("00000000" + (parseInt(hex, 16)).toString(2)).substr(-8);
}

// This function takes a chanel straight from the pixel array and returnes the same array
// but with the even rows fliped since the chanels are daisy chained and zig-zag,
// where as the pixel array loops round to keep indexing simple.
function ironChanel(lines, width){
  var nbrLines = lines.length / width;

  var ironed = [];
  for(var i = 0; i < nbrLines; i++){
    if(i%2 == 0){
      // Flip the even rows since the Teensy is on the left side of the display
      ironed = ironed.concat(lines.slice(0,width).reverse());
    }
    else {
      ironed = ironed.concat(lines.slice(0,width));
    }
  }
  return ironed;
}

// This is and ES6 version of 2d matrix transpose
transpose = matrix => matrix.reduce(($, row) => row.map((_, i) => [...($[i] || []), row[i]]), []);

// Used to get the dimensions of multidimensional arrays, useful for debugging
function getDim(a) {
    var dim = [];
    for (;;) {
        dim.push(a.length);

        if (Array.isArray(a[0])) {
            a = a[0];
        } else {
            break;
        }
    }
    return dim;
}
