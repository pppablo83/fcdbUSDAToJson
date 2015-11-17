var mkdirp = require('mkdirp')
var async = require('async')
var argv = require('minimist')(process.argv.slice(2));
var parser = require('./parser/parser')

//Output dir, can be overridden by command line parameters
var DEFAULT_OUTPUT_DIR = './output'

console.log('Current script works with data from, USDA, url= ' +
    parser.url + ', version=' + parser.version)

if (argv.help) {
    console.log("Usage: node main.js\n" +
        "\t--outputDir=Directory\tPuts the output files in the chosen directory," +
        "otherwise default is: " + DEFAULT_OUTPUT_DIR + "\n" +
        "\t--help\tShows help on use and exits")
    process.exit(0);
}

var outputDir = argv.outputDir ? argv.outputDir : DEFAULT_OUTPUT_DIR;
mkdirp.sync(outputDir)
console.log('Files to be created in: ' + outputDir)

async.series([
    function (callback) {
        try {
            parser.foodDescription('./sr28asc/FOOD_DES.txt', outputDir, callback)
        } catch (e) {
            callback(e, null)
        }
    },
    function (callback) {
        //TODO find appropiate mention and move to README.md
        console.log('Special thanks to USDA for all the effort in producing this valuable set of data!')
        callback(null, null)
    }
], function (err, results) {
    if (err) {
        console.error('An error producing the output files has happened: ' + e)
        process.exit(1)
    } else {
        console.log('Finished process successfully')
        process.exit(0)
    }
})



