var realFs = require('fs')
var gracefulFs = require('graceful-fs')
gracefulFs.gracefulify(realFs)
var jsonFile = require('jsonfile')
var async = require('async')
var fs = require('graceful-fs')
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
                nomenclature: {
                    english: {
                        short: fields[2],
                        long: fields[3],
                        otherCommonNames: fields[4],
                        foodGroup: fields[1]
                    }
                },
                general: {
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
    weight: function (fileToRead, directoryToRead, step, callback) {
        console.log('Starting Step ' + step + '...')

        //Putting in memory an array of the associated weights, key the code
        var rl = require('readline').createInterface({
            input: require('fs').createReadStream(fileToRead),
            terminal: false
        });

        var weights = []
        var previous = null

        rl.on('line', function (line) {

            var fields = line.replace(REGEX_STRING_DELIMITER, '').split(FIELD_DELIMITER)
            var objectWeight = {
                amount: fields[2],
                desc: fields[3],
                value: fields[4],
                numDataPts: fields[5],
                stdDev: fields[6]
            }
            if (fields[0] !== previous) {
                if (previous !== null) {
                    var obj = jsonFile.readFileSync(directoryToRead + '/' + previous + '.json')
                    obj.weights = weights
                    jsonFile.writeFileSync(directoryToRead + '/' + previous + '.json', obj)
                }
                weights = []
                weights.push(objectWeight)
                previous = fields[0]
            } else {
                weights.push(objectWeight)
            }

        })

        rl.on('close', function () {
            var obj = jsonFile.readFileSync(directoryToRead + '/' + previous + '.json')
            obj.weights = weights
            jsonFile.writeFileSync(directoryToRead + '/' + previous + '.json', obj)
            console.log('Step ' + step + ' completed.')
            return callback()
        })


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
                        if(fs.statSync(directoryToRead + '/' + file).isFile()) {
                            callbacks++
                            jsonFile.readFile(directoryToRead + '/' + file, function (err, obj) {
                                if (err) {
                                    return callbackInternal(err)
                                } else {
                                    obj.nomenclature.english.foodGroup =
                                        foodDescriptionObject[obj.nomenclature.english.foodGroup.toString()]
                                    jsonFile.writeFile(directoryToRead + '/' + file, obj, function(errWrite) {
                                      if(!errWrite) {
                                        callbacks--
                                        if (callbacks < 1) {
                                            console.log('Step ' + step + ' completed.')
                                            return callback()
                                        }
                                      } else {
                                        return callback(err)
                                      }
                                    })
                                }

                            })
                        }
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
                    obj.nomenclature.english.langualInfo = langualFactor[previous.toString()]
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
            obj.nomenclature.english.langualInfo = langualFactor[previous.toString()]
            jsonFile.writeFileSync(directoryToRead + '/' + previous + '.json', obj)
            console.log('Step ' + step + ' completed.')
            return callback()
        })

    },
    langualFactorDescription: function (fileToRead, directoryToRead, step, callback) {
        console.log('Starting Step ' + step + '...')

        var rl = require('readline').createInterface({
            input: require('fs').createReadStream(fileToRead),
            terminal: false
        });

        var langualDescriptionObject = {}

        rl.on('line', function (line) {
            var fields = line.replace(REGEX_STRING_DELIMITER, '').split(FIELD_DELIMITER)
            langualDescriptionObject[fields[0].toString()] = fields[1]
        })

        rl.on('close', function () {
            var callbacks = 0;
            fs.readdir(directoryToRead, function (err, files) {
                if (err) {
                    callback(err)
                } else {
                    async.each(files, function (file, callbackInternal) {
                        if(fs.statSync(directoryToRead + '/' + file).isFile()) {
                            callbacks++
                            jsonFile.readFile(directoryToRead + '/' + file, function (err, obj) {
                                if (err) {
                                    return callbackInternal(err)
                                } else {
                                    if(typeof obj.nomenclature.english.langualInfo != 'undefined') {
                                        var arrayWithDesc = []
                                        obj.nomenclature.english.langualInfo.forEach(function (element) {
                                            arrayWithDesc.push(langualDescriptionObject[element.toString()])
                                        })
                                        obj.nomenclature.english.langualInfo = arrayWithDesc
                                        jsonFile.writeFile(directoryToRead + '/' + file, obj, function (err2) {
                                            if(err) {
                                                return callback(err2)
                                            } else {
                                                callbacks--
                                                if (callbacks < 1) {
                                                    console.log('Step ' + step + ' completed.')
                                                    return callback()
                                                }
                                            }
                                        })
                                    }
                                }
                            })
                        }
                    }, function (err) {
                        if (err) {
                            return callback(err)
                        }
                    })
                }
            })
        })
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
                nomenclature: {
                    english: {
                        shrtDesc: fields[1]
                    }
                },
                proximates: {
                    water: {value: fields[2], unit: units.gramsPer100g, desc: 'Water'},
                    energKcal: {value: fields[3], unit: units.Kcal_Per100g, desc: 'Energy'},
                    protein: {value: fields[4], unit: units.gramsPer100g, desc: 'Protein'},
                    lipidTot: {value: fields[5], unit: units.gramsPer100g, desc: 'Total lipid (fat)'},
                    ash: {value: fields[6], unit: units.gramsPer100g, desc: 'Ash'},
                    carbohydrt: {value: fields[7], unit: units.gramsPer100g, desc: 'Carbohydrate, by difference'},
                    fiberTD: {value: fields[8], unit: units.gramsPer100g, desc: 'Fiber, total dietary'},
                    sugarTot: {value: fields[9], unit: units.gramsPer100g, desc: 'Sugars, total'}
                },
                minerals: {
                    calcium: {value: fields[10], unit: units.milligramsPer100g, desc: 'Calcium, Ca'},
                    iron: {value: fields[11], unit: units.milligramsPer100g, desc: 'Iron, Fe'},
                    magnesium: {value: fields[12], unit: units.milligramsPer100g, desc: 'Magnesium, Mg'},
                    phosphorus: {value: fields[13], unit: units.milligramsPer100g, desc: 'Phosphorus, P'},
                    potassium: {value: fields[14], unit: units.milligramsPer100g, desc: 'Potassium, K'},
                    sodium: {value: fields[15], unit: units.milligramsPer100g, desc: 'Sodium, Na'},
                    zinc: {value: fields[16], unit: units.milligramsPer100g, desc: 'Zinc, Zn'},
                    copper: {value: fields[17], unit: units.milligramsPer100g, desc: 'Copper, Cu'},
                    manganese: {value: fields[18], unit: units.milligramsPer100g, desc: 'Manganese, Mn'},
                    selenium: {value: fields[19], unit: units.microgramsPer100g, desc: 'Selenium, Se'}
                },
                vitamins: {
                    vitC: {value: fields[20], unit: units.milligramsPer100g, desc: 'Vitamin C, total ascorbic acid'},
                    thiamin: {value: fields[21], unit: units.milligramsPer100g, desc: 'Thiamin'},
                    riboflavin: {value: fields[22], unit: units.milligramsPer100g, desc: 'Riboflavin'},
                    niacin: {value: fields[23], unit: units.milligramsPer100g, desc: 'Niacin'},
                    pantoAcid: {value: fields[24], unit: units.milligramsPer100g, desc: 'Pantothenic acid'},
                    vitB6: {value: fields[25], unit: units.milligramsPer100g, desc: 'Vitamin B-6'},
                    folateTot: {value: fields[26], unit: units.microgramsPer100g, desc: 'Folate, total'},
                    folicAcid: {value: fields[27], unit: units.microgramsPer100g, desc: 'Folic acid'},
                    foodFolate: {value: fields[28], unit: units.microgramsPer100g, desc: 'Folate, food'},
                    folateDFE: {value: fields[29], unit: units.microgramsPer100g, desc: 'Folate, DFE'},
                    cholineTot: {value: fields[30], unit: units.milligramsPer100g, desc: 'Choline, total'},
                    vitB12: {value: fields[31], unit: units.microgramsPer100g, desc: 'Vitamin B-12'},
                    vitA_IU: {value: fields[32], unit: units.IU_Per100g, desc: 'Vitamin A, IU'},
                    vitA_RAE: {value: fields[33], unit: units.microgramsPer100g, desc: 'Vitamin A, RAE'},
                    retinol: {value: fields[34], unit: units.microgramsPer100g, desc: 'Retinol'},
                    alphaCarot: {value: fields[35], unit: units.microgramsPer100g, desc: 'Carotene, alpha'},
                    betaCarot: {value: fields[36], unit: units.microgramsPer100g, desc: 'Carotene, beta'},
                    betaCrypt: {value: fields[37], unit: units.microgramsPer100g, desc: 'Cryptoxanthin, beta'},
                    lycopene: {value: fields[38], unit: units.microgramsPer100g, desc: 'Lycopene'},
                    lutZEA: {value: fields[39], unit: units.microgramsPer100g, desc: 'Lutein + zeaxanthin'},
                    vitE: {value: fields[40], unit: units.milligramsPer100g, desc: 'Vitamin E (alpha-tocopherol)'},
                    vitD_mcg: {value: fields[41], unit: units.microgramsPer100g, desc: 'Vitamin D (D2 + D3)'},
                    vitD_IU: {value: fields[42], unit: units.IU_Per100g, desc: 'Vitamin D'},
                    vitK: {value: fields[43], unit: units.microgramsPer100g, desc: 'Vitamin K (phylloquinone)'}
                },
                lipids: {
                    faSat: {value: fields[44], unit: units.gramsPer100g, desc: 'Fatty acids, total saturated'},
                    faMono: {value: fields[45], unit: units.gramsPer100g, desc: 'Fatty acids, total monounsaturated'},
                    faPoly: {value: fields[46], unit: units.gramsPer100g, desc: 'Fatty acids, total polyunsaturated'},
                    cholesttrl: {value: fields[47], unit: units.milligramsPer100g, desc: 'Cholesterol'}
                },
                weights: [
                    {value: fields[48], desc: fields[49]},
                    {value: fields[50], desc: fields[51]}
                ],
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
            obj.nomenclature.english.foodGroup = fields[1]
            jsonFile.writeFileSync(directoryToRead + '/' + fields[0] + '.json', obj)
        })

        rl.on('close', function () {
            console.log('Step ' + step + ' completed.')
            return callback()
        })
    },
    version: NUTRIENT_DATABASE_VERSION,
    url: NUTRIENT_DATABASE_DOWNLOAD_URL
}
