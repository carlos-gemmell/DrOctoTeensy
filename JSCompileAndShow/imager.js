var serialImage = require("./serialImage")

serialImage.displayImageFromFile('/../images/nonactive.png',()=>{
  serialImage.displayImageFromFile('/../images/active.png',()=>{
    serialImage.displayImageFromFile('/../images/black.png');
  })
})
