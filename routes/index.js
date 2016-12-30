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

    var projects = getSavedProjects();

    var metrics = [];

    for (var k = 0; k < projects.length; k++) {

        var project = projects[k];

        var dirs = getDirectories(inspectionsSourcePath + "/" + project);

        var latest_inspection = 0;

        for (var i = 0; i < dirs.length; dirs++) {

            var inspection_date = dirs[i] * 1;

            if (inspection_date > latest_inspection) {

                latest_inspection = inspection_date
            }
        }

        var files = getFiles(inspectionsSourcePath + "/" + project + "/" + latest_inspection);

        var latestBuild = -1;
        for (var j = 0; j < files.length; j++) {

            var file = files[j];

            var buildNumber = file.replace(".xml", "") * 1;
            if (buildNumber > latestBuild) {

                latestBuild = buildNumber
            }
        }
        var inspection = undefined;
        (function (inspection_latestBuild) {

            var data = fs.readFileSync(inspectionsSourcePath + "/" + project + "/" + latest_inspection + '/' + inspection_latestBuild + ".xml", "utf8");
            parseString(data, {trim: true}, function (err, result) {
                inspection = result.problems
            });
        }(latestBuild));

        if (inspection !== undefined && inspection.problem !== undefined) {

            var info_warnings = 0;
            var warning_warnings = 0;
            var error_warnings = 0;
            for (var l = 0; l < inspection.problem.length; l++) {

                //INFORMATION, GENERIC_SERVER_ERROR_OR_WARNING, INFO, WEAK_WARNING, WARNING, ERROR
                var severity = inspection.problem[0].problem_class[0].$.severity;

                if (severity == "INFORMATION" || severity == "INFO") {

                    info_warnings++;
                } else if (severity == "WEAK_WARNING" || severity == "WARNING") {

                    warning_warnings++;
                } else if (severity == "ERROR") {

                    error_warnings++;
                }
            }
            metrics.push({
                project: project,
                info_warnings: info_warnings,
                warning_warnings: warning_warnings,
                error_warnings: error_warnings
            })
        }
    }

    var total_info_warnings = 0;
    var total_warning_warnings = 0;
    var total_error_warnings = 0;
    var project_count = projects.length;

    for (var m = 0; m < metrics.length; m++) {

        total_info_warnings += metrics[m].info_warnings;
        total_warning_warnings += metrics[m].warning_warnings;
        total_error_warnings += metrics[m].error_warnings;
    }

    var aggregated_metrics = {

        project_count: project_count,
        total_info_warnings: total_info_warnings,
        total_warning_warnings: total_warning_warnings,
        total_error_warnings: total_error_warnings
    };

    res.render('index', {title: 'MontiSecArc Inspections', projects: projects, metrics: metrics, aggregated_metrics: aggregated_metrics});
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

        var inspections = [];

        for (var j = 0; j < files.length; j++) {

            var file = files[j];

            (function (inspection_file) {

                var data = fs.readFileSync(inspectionsSourcePath + "/" + project + "/" + latest_inspection + '/' + inspection_file, "utf8");
                parseString(data, {trim: true}, function (err, result) {
                    inspections.push({
                        build_id: inspection_file.replace(".xml", ""),
                        problems: result.problems
                    })
                });
            }(file));

        }

        res.render('project', {
            title: 'MontiSecArc Inspections',
            projects: getSavedProjects(),
            inspections: inspections
        });
    }
});

module.exports = router;