var express = require('express');
var router = express.Router();
var parseString = require('xml2js').parseString;
var inspectionsSourcePath = __dirname.replace("/routes", "/inspections");
var fs = require('fs'); // adds Async() versions that return promises
var path = require('path');

function getDirectories(srcPath) {
    return fs.readdirSync(srcPath).filter(function (file) {
        return fs.statSync(path.join(srcPath, file)).isDirectory();
    });
}

function getFiles(srcPath) {
    return fs.readdirSync(srcPath).filter(function (file) {
        return fs.statSync(path.join(srcPath, file)).isFile();
    });
}


function getSavedProjects() {

    return getDirectories(inspectionsSourcePath)
}

/* GET home page. */
router.get('/', function (req, res, next) {

    res.render('index', {title: 'MontiSecArc Inspections', projects: getSavedProjects()});
});

router.get('/:project', function (req, res, next) {
    var project = req.params.project;

    if (project) {

        var dirs = getDirectories(inspectionsSourcePath + "/" + project);

        var latest_inspection = 0;

        for (var i = 0; i < dirs.length; dirs++) {

            var inspection_date = dirs[i] * 1;

            if (inspection_date > latest_inspection) {

                latest_inspection = inspection_date
            }
        }

        var files = getFiles(inspectionsSourcePath + "/" + project + "/" + latest_inspection);

        var getInspections = function getInspections(files) {

            var inspections = [];

            for (var i = 0; i < files.length; i++) {

                var file = files[i];

                var data = fs.readFileSync(inspectionsSourcePath + "/" + project + "/" + latest_inspection + '/' + file, "utf8");
                parseString(data, {trim:true}, function(err, result){
                    inspections.push({
                        build_id: file.replace(".xml", ""),
                        problems: result.problems
                    })
                });
            }

            return inspections;
        };

        var inspections = getInspections(files);
        res.render('index', {title: 'MontiSecArc Inspections', projects: getSavedProjects(), inspections: inspections});
    }
});

module.exports = router;
