var fs = require('fs')
var jsonfile = require('jsonfile')
var mkdirp = require('mkdirp')
var argv = require('minimist')(process.argv.slice(2));
var parser = require('./parser/parser')

//Data version
var NUTRIENT_DATABASE_VERSION='28'
var NUTRIENT_DATABASE_DOWNLOAD_URL='http://www.ars.usda.gov/Services/docs.htm?docid=25700'

//Delimiters for the files distributed http://ndb.nal.usda.gov/
var FIELD_DELIMITER='^'
var STRING_DELIMITER='~'

//Output dir, can be overriden by command line parameters
var DEFAULT_OUTPUT_DIR='./output'
var outputDir = DEFAULT_OUTPUT_DIR

console.log('Current script works with data from, USDA, url= ' +
  NUTRIENT_DATABASE_DOWNLOAD_URL + ', version=' + NUTRIENT_DATABASE_VERSION)

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

//TODO start the work

//TODO find appropiate mention and move to README.md
console.log('Special thanks to USDA for all the effort in producing this valuable set of data!')
