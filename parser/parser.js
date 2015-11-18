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

//Units literals
var units = {
    gramsPer100g: 'g/100g',
    milligramsPer100g: 'mg/100g',
    microgramsPer100g: 'µg/100g',
    IU_Per100g: 'IU/100g',
    Kcal_Per100g: 'kcal/100g'
};


module.exports = {
    foodDescription: function (fileToRead, outputDir, step, callback) {
        console.log('Starting Step ' + step + '...')
        console.log('Fields in food description module: NDB_No, FdGrp_Cd,' +
            'Long_Desc, Shrt_Desc, ComName, ManufacName, Survey, Ref_desc, Refuse,' +
            'SciName, N_Factor, Pro_Factor, Fat_Factor, CHO_Factor')

        var rl = require('readline').createInterface({
            input: require('fs').createReadStream(fileToRead),
            terminal: false
        });

        var callbacks = 0

        rl.on('line', function (line) {
            callbacks++
            var fields = line.replace(REGEX_STRING_DELIMITER, '').split(FIELD_DELIMITER)
            var obj = {
                ndbNo: fields[0],
                foodGroupEnglish: fields[1],
                nomenclatureEnglish: {
                    short: fields[2],
                    long: fields[3],
                    otherCommonNames: fields[4]
                },
                manufacturerName: fields[5],
                survey: fields[6],
                refDesc: fields[7],
                refuse: fields[8],
                scientificName: fields[9],
                nitrogenFactor: fields[10],
                proteinFactor: fields[11],
                fatFactor: fields[12],
                choFactor: fields[13]
            }

            var fileName = fields[0] + '.json';
            jsonFile.writeFile(outputDir + '/' + fileName, obj, function (err) {
                if (err) {
                    return callback(err)
                } else {
                    callbacks--
                }
                if (callbacks < 1) {
                    console.log('Step ' + step + ' completed.')
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
    foodGroupDescription: function (fileFoodGroupDescription, directoryToRead, step, callback) {
        console.log('Starting Step ' + step + '...')

        //Putting in memory an array of the food description, key the code
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
                                return callbackInternal(err)
                            } else {
                                obj.foodGroupEnglish = foodDescriptionObject[obj.foodGroupEnglish.toString()]
                                jsonFile.writeFileSync(directoryToRead + '/' + file, obj)
                                callbacks--
                            }
                            if (callbacks < 1) {
                                console.log('Step ' + step + ' completed.')
                                return callback()
                            }
                        })
                    }, function (err) {
                        if (err) {
                            return callback(err)
                        }
                    })
                }
            })
        })


    },
    langualFactor: function (fileToRead, directoryToRead, step, callback) {
        console.log('Starting Step ' + step + '...')

        var rl = require('readline').createInterface({
            input: require('fs').createReadStream(fileToRead),
            terminal: false
        });

        var langualFactor = {}
        var previous = null

        rl.on('line', function (line) {
            var fields = line.replace(REGEX_STRING_DELIMITER, '').split(FIELD_DELIMITER)
            if (fields[0] !== previous) {
                if (previous !== null) {
                    var obj = jsonFile.readFileSync(directoryToRead + '/' + previous + '.json')
                    obj.langualInfoEnglish = langualFactor[previous.toString()]
                    jsonFile.writeFileSync(directoryToRead + '/' + previous + '.json', obj)
                }
                langualFactor = {}
                langualFactor[fields[0].toString()] = [fields[1]]
                previous = fields[0]
            } else {
                langualFactor[fields[0].toString()].push(fields[1])
            }
        })

        rl.on('close', function () {
            var obj = jsonFile.readFileSync(directoryToRead + '/' + previous + '.json')
            obj.langualInfoEnglish = langualFactor[previous.toString()]
            jsonFile.writeFileSync(directoryToRead + '/' + previous + '.json', obj)
            console.log('Step ' + step + ' completed.')
            return callback()
        })

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
    abbrv: function (fileToRead, outputDir, step, callback) {
        console.log('Starting Step ' + step + '...')
        console.log('Fields in food description module: NDB_No, Shrt_Desc, Water, Energ_Kcal, ' +
            'Protein, Lipid_Tot, Ash, Carbohydrt, Fiber_TD, Sugar_Tot, Calcium, Iron, Magnesium,' +
            'Phosphorus, Potassium, Sodium, Zinc, Copper, Manganese, Selenium, Vit_C, Thiamin,' +
            'Riboflavin, Niacin, Panto_acid, Vit_B6, Folate_Tot, Folic_acid, Food_Folate, ' +
            'Folate_DFE, Choline_Tot, Vit_B12, Vit_A_IU, Vit_A_RAE, Retinol, Alpha_Carot,' +
            'Beta_Carot, Beta_Crypt, Lycopene, Lut+ZEA, Vit_E, Vit_D_mcg, VIT_D_IU, VIT_K,' +
            'FA_Sat, FA_Mono, FA_Poly, Cholestrl, GmWt_1, GmWt_Desc1, GmWt_2, GmWt_Desc2' +
            'Refuse_Pct')

        var rl = require('readline').createInterface({
            input: require('fs').createReadStream(fileToRead),
            terminal: false
        });

        var callbacks = 0

        rl.on('line', function (line) {
            callbacks++
            var fields = line.replace(REGEX_STRING_DELIMITER, '').split(FIELD_DELIMITER)
            var obj = {
                ndbNo: fields[0],
                shrtDesc: fields[1],
                water: {value: fields[2], unit: units.gramsPer100g},
                energKcal: {value: fields[3], unit: units.Kcal_Per100g},
                protein: {value: fields[4], unit: units.gramsPer100g},
                lipidTot: {value: fields[5], unit: units.gramsPer100g},
                ash: {value: fields[6], unit: units.gramsPer100g},
                carbohydrt: {value: fields[7], unit: units.gramsPer100g},
                fiberTD: {value: fields[8], unit: units.gramsPer100g},
                sugarTot: {value: fields[9], unit: units.gramsPer100g},
                calcium: {value: fields[10], unit: units.milligramsPer100g},
                iron: {value: fields[11], unit: units.milligramsPer100g},
                magnesium: {value: fields[12], unit: units.milligramsPer100g},
                phosphorus: {value: fields[13], unit: units.milligramsPer100g},
                potassium: {value: fields[14], unit: units.milligramsPer100g},
                sodium: {value: fields[15], unit: units.milligramsPer100g},
                zinc: {value: fields[16], unit: units.milligramsPer100g},
                copper: {value: fields[17], unit: units.milligramsPer100g},
                manganese: {value: fields[18], unit: units.milligramsPer100g},
                selenium: {value: fields[19], unit: units.microgramsPer100g},
                vitC: {value: fields[20], unit: units.milligramsPer100g},
                thiamin: {value: fields[21], unit: units.milligramsPer100g},
                riboflavin: {value: fields[22], unit: units.milligramsPer100g},
                niacin: {value: fields[23], unit: units.milligramsPer100g},
                pantoAcid: {value: fields[24], unit: units.milligramsPer100g},
                vitB6: {value: fields[25], unit: units.milligramsPer100g},
                folateTot: {value: fields[26], unit: units.microgramsPer100g},
                folicAcid: {value: fields[27], unit: units.microgramsPer100g},
                foodFolate: {value: fields[28], unit: units.microgramsPer100g},
                folateDFE: {value: fields[29], unit: units.microgramsPer100g},
                cholineTot: {value: fields[30], unit: units.milligramsPer100g},
                vitB12: {value: fields[31], unit: units.microgramsPer100g},
                vitA_IU: {value: fields[32], unit: units.IU_Per100g},
                vitA_RAE: {value: fields[33], unit: units.microgramsPer100g},
                retinol: {value: fields[34], unit: units.microgramsPer100g},
                alphaCarot: {value: fields[35], unit: units.microgramsPer100g},
                betaCarot: {value: fields[36], unit: units.microgramsPer100g},
                betaCrypt: {value: fields[37], unit: units.microgramsPer100g},
                lycopene: {value: fields[38], unit: units.microgramsPer100g},
                lutZEA: {value: fields[39], unit: units.microgramsPer100g},
                vitE: {value: fields[40], unit: units.milligramsPer100g},
                vitD_mcg: {value: fields[41], unit: units.microgramsPer100g},
                vitD_IU: {value: fields[42], unit: units.IU_Per100g},
                vitK: {value: fields[43], unit: units.microgramsPer100g},
                faSat: {value: fields[44], unit: units.gramsPer100g},
                faMono: {value: fields[45], unit: units.gramsPer100g},
                faPoly: {value: fields[46], unit: units.gramsPer100g},
                cholesttrl: {value: fields[47], unit: units.milligramsPer100g},
                gmWt1: {value: fields[48], desc: fields[49]},
                gmWt2: {value: fields[50], desc: fields[51]},
                refusePct: fields[52]
            }

            var fileName = fields[0] + '.json';
            jsonFile.writeFile(outputDir + '/' + fileName, obj, function (err) {
                if (err) {
                    return callback(err)
                } else {
                    callbacks--
                }
                if (callbacks < 1) {
                    console.log('Step ' + step + ' completed.')
                    return callback()
                }
            })
        });
    },
    addFoodCategoryToAbbrv: function (foodDescFile, foodCategoryFile, directoryToRead, step, callback) {

        console.log('Starting Step ' + step + '...')

        var rl = require('readline').createInterface({
            input: require('fs').createReadStream(foodDescFile),
            terminal: false
        });

        rl.on('line', function (line) {
            var fields = line.replace(REGEX_STRING_DELIMITER, '').split(FIELD_DELIMITER)
            var obj = jsonFile.readFileSync(directoryToRead + '/' + fields[0] + '.json')
            obj.foodGroupEnglish = fields[1]
            jsonFile.writeFileSync(directoryToRead + '/' + fields[0] + '.json', obj)
        })

        rl.on('close', function () {
            console.log('Step ' + step + ' completed.')
            step++
            module.exports.foodGroupDescription(foodCategoryFile, directoryToRead, step, callback)
        })

    },
    version: NUTRIENT_DATABASE_VERSION,
    url: NUTRIENT_DATABASE_DOWNLOAD_URL
}
