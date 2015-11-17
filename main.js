var fs = require('fs')
var mkdirp = require('mkdirp')
var argv = require('minimist')(process.argv.slice(2));
var parser = require('./parser/parser')

//Output dir, can be overriden by command line parameters
var DEFAULT_OUTPUT_DIR='./output'
var outputDir = DEFAULT_OUTPUT_DIR

console.log('Current script works with data from, USDA, url= ' +
  parser.url + ', version=' + parser.version)

if(argv.help) {
  console.log("Usage: node main.js\n" +
    "\t--outputDir=Directory\tPuts the output files in the chosen directory," +
    "otherwise default is: " + DEFAULT_OUTPUT_DIR +"\n" +
    "\t--help\tShows help on use and exits")
  process.exit(0);
}

var outputDir = argv.outputDir ? argv.outputDir : DEFAULT_OUTPUT_DIR;

mkdirp.sync(outputDir)

console.log('Files to be created in: ' + outputDir)

//Sync process
try {
  parser.foodDescription('./sr28asc/FOOD_DES.txt', outputDir)
} catch(e) {
  console.error("An error producing the output files has happened: " + e)
  process.exit(1)
}


//TODO find appropiate mention and move to README.md
console.log('Special thanks to USDA for all the effort in producing this valuable set of data!')
