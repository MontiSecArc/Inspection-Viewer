/**
 * Created by thomasbuning on 21.12.16.
 */
var express = require('express');
var router = express.Router();

/* GET home page. */
app.post('/', function(req, res, next) {

    var inspectionFile;

    if (!req.files) {
        res.send('No files were uploaded.');
        return;
    }

    inspectionFile = req.files.inspection;
    inspectionFile.mv('inspections//somewhere/on/your/server/filename.jpg', function(err) {
        if (err) {
            res.status(500).send(err);
        }
        else {
            res.send('File uploaded!');
        }
    });
});

module.exports = router;
