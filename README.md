# fcdbUSDAToJson

Simple converter from the ASCII files that compose the [Nutrient Database (release 28) from USDA](http://www.ars.usda.gov/Services/docs.htm?docid=8964) to Json format.

It is a node.js script, so simple run:

`node main.js`

With the next available options:

- --help Shows help on use and exits
- --outputDir=Directory Puts the output files in the chosen directory,otherwise default is: ./output
- --langualInfo Adds [LanguaL](http://www.langual.org/) data to the result. It works also with the abbreviated form
- --weights By default, in full format data from the weights file is added, adding this parameter with --abbrv will add the info from the weights file to the abbreviated version, replacing the weights already included in such version
- --abbrv Parsing only the abbreviated version, in case it is called, files will be produced in an abbrv subfolder of the output dir

## Example

`node main.js --abbrv --weights --langualInfo`

Will create in the folder ./output/abbrv the json files with the information from the abbreviated file, with insertion of the data from the weights file and the [LanguaL](http://www.langual.org/) info

## References

- [LanguaL](http://www.langual.org/)
- [FCDBs](http://www.eurofir.org/?page_id=15)
- [NDB USDA](http://ndb.nal.usda.gov/)

