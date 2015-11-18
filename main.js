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
        "\t--help\tShows help on use and exits" + "\n" +
        "\t--langualInfo\tAdds langual data to the result. It works also with the abbreviated form" + "\n" +
        "\t--weights\tBy default, in full format, weights are added, adding this paramter with --abbrv " +
        "will add the info from the weights file to the abbreviated version, replacing the wights already" +
        "included in such version" +
        "\t--abbrv\tParsing only the abbreviated version, in case it is called, files will be produced in an " +
        "abbrv subfolder of the output dir")
    process.exit(0);
}

var outputDir = argv.outputDir ? argv.outputDir : DEFAULT_OUTPUT_DIR;
outputDir += argv.abbrv ? '/abbrv' : ''
mkdirp.sync(outputDir)
console.log('Files to be created in: ' + outputDir)

var step = 0

if (argv.abbrv) {
    async.series([
        function (callback) {
            step++
            parser.abbrv('./sr28abbr/ABBREV.txt', outputDir, step, callback)
        },
        function (callback) {
            step++
            parser.addFoodCategoryToAbbrv('./sr28asc/FOOD_DES.txt', './sr28asc/FD_GROUP.txt', outputDir, step, callback)
        },
        function (callback) {
            if (argv.langualInfo) {
                step = step + 2 //2 internal steps in previous step
                parser.langualFactor('./sr28asc/LANGUAL.txt', outputDir, step, callback)
            } else {
                return callback()
            }
        },
        function (callback) {
            if (argv.langualInfo) {
                step++
                parser.langualFactorDescription('./sr28asc/LANGDESC.txt', outputDir, step, callback)
            } else {
                return callback()
            }
        },
        function (callback) {
            if (argv.weights) {
                step++
                parser.weight('./sr28asc/WEIGHT.txt', outputDir, step, callback)
            } else {
                return callback()
            }
        },
        function (callback) {
            //TODO find appropiate mention and move to README.md
            console.log('Special thanks to USDA for all the effort in producing this valuable set of data!')
            callback(null, null)
        }
    ], function (err, results) {
        if (err) {
            console.error('An error producing the output files has happened: ' + err)
            process.exit(1)
        } else {
            console.log('Finished process successfully')
            process.exit(0)
        }
    })
} else {
    async.series([
        function (callback) {
            step++
            parser.foodDescription('./sr28asc/FOOD_DES.txt', outputDir, step, callback)
        },
        function (callback) {
            step++
            parser.foodGroupDescription('./sr28asc/FD_GROUP.txt', outputDir, step, callback)
        },
        function (callback) {
            if (argv.langualInfo) {
                step++
                parser.langualFactor('./sr28asc/LANGUAL.txt', outputDir, step, callback)
            } else {
                return callback()
            }
        },
        function (callback) {
            if (argv.langualInfo) {
                step++
                parser.langualFactorDescription('./sr28asc/LANGDESC.txt', outputDir, step, callback)
            } else {
                return callback()
            }
        },
        function (callback) {
            step++
            parser.weight('./sr28asc/WEIGHT.txt', outputDir, step, callback)
        },
        function (callback) {
            //TODO find appropiate mention and move to README.md
            console.log('Special thanks to USDA for all the effort in producing this valuable set of data!')
            callback(null, null)
        }
    ], function (err, results) {
        if (err) {
            console.error('An error producing the output files has happened: ' + err)
            process.exit(1)
        } else {
            console.log('Finished process successfully')
            process.exit(0)
        }
    })
}




