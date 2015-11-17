var jsonFile = require('jsonfile')
var async = require('async')
var fs = require('fs')
var util = require('util');

//Delimiters for the files distributed http://ndb.nal.usda.gov/
var FIELD_DELIMITER = '^'
var REGEX_STRING_DELIMITER = /~/g

//Data version
var NUTRIENT_DATABASE_VERSION = '28'
var NUTRIENT_DATABASE_DOWNLOAD_URL = 'http://www.ars.usda.gov/Services/docs.htm?docid=25700'

module.exports = {
    foodDescription: function (fileToRead, outputDir, callback) {
        console.log('Starting Step 1...')
        console.log('Fields in food description module: NDB_No, FdGrp_Cd,' +
            'Long_Desc, Shrt_Desc, ComName, ManufacName, Survey, Ref_desc, Refuse,' +
            'SciName, N_Factor, Pro_Factor, Fat_Factor, CHO_Factor')

        var rl = require('readline').createInterface({
            input: require('fs').createReadStream(fileToRead),
            terminal: false
        });

        var callbacks = 0;

        rl.on('line', function (line) {
            callbacks++
            var fields = line.replace(REGEX_STRING_DELIMITER, '').split(FIELD_DELIMITER)
            var obj = {
                ndb_no: fields[0],
                foodGroup_english: fields[1],
                nomenclature_english: {
                    short: fields[2],
                    long: fields[3],
                    otherCommonNames: fields[4]
                },
                manufacturerName: fields[5],
                survey: fields[6],
                ref_desc: fields[7],
                refuse: fields[8],
                scientific_name: fields[9],
                nitrogen_factor: fields[10],
                protein_factor: fields[11],
                fat_factor: fields[12],
                cho_factor: fields[13]
            }

            var fileName = fields[0] + '.json';
            jsonFile.writeFile(outputDir + '/' + fileName, obj, function (err) {
                if (err) {
                    callback(err)
                } else {
                    callbacks--
                }
                if (callbacks < 1) {
                    console.log('Step 1 completed.')
                    return callback()
                }
            })
        });
    },
    nutrientData: function () {

    },
    weight: function () {

    },
    footNote: function () {

    },
    foodGroupDescription: function (directoryToRead, fileFoodGroupDescription, callback) {

        //Putting in memory an array of the food description, key the code
        console.log('Starting Step 2...')
        var rl = require('readline').createInterface({
            input: require('fs').createReadStream(fileFoodGroupDescription),
            terminal: false
        });

        var foodDescriptionObject = {}

        rl.on('line', function (line) {
            var fields = line.replace(REGEX_STRING_DELIMITER, '').split(FIELD_DELIMITER)
            foodDescriptionObject[fields[0]] = fields[1]
        })

        rl.on('close', function () {
            var callbacks = 0;
            fs.readdir(directoryToRead, function (err, files) {
                if (err) {
                    callback(err)
                } else {
                    async.each(files, function (file, callbackInternal) {
                        callbacks++
                        jsonFile.readFile(directoryToRead + '/' + file, function (err, obj) {
                            if (err) {
                                callbackInternal(err)
                            } else {
                                obj.foodGroup_english = foodDescriptionObject[obj.foodGroup_english.toString()]
                                jsonFile.writeFileSync(directoryToRead + '/' + file, obj)
                                callbacks--
                            }
                            if (callbacks < 1) {
                                console.log('Step 2 completed.')
                                return callback()
                            }
                        })
                    }, function(err) {
                        if(err) {
                            callback(err)
                        }
                    })
                }


            })

        })


    },
    langualFactor: function () {

    },
    langualFactorsDescription: function () {

    },
    nutrientDefinition: function () {

    },
    sourceCode: function () {

    },
    dataDerivationCodeDescription: function () {

    },
    sourcesOfDataLink: function () {

    },
    sourcesOfData: function () {

    },
    version: NUTRIENT_DATABASE_VERSION,
    url: NUTRIENT_DATABASE_DOWNLOAD_URL
}
