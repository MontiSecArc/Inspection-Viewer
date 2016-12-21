var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var mkdirp = require('mkdirp');

var index = require('./routes/index');
var users = require('./routes/users');

var multer = require('multer');
var storage =   multer.diskStorage({
    destination: function (req, file, callback) {
        var name = req.body.CI_PROJECT_NAME;
        var now = new Date();
        var date = now.getFullYear() + "" + (now.getMonth() + 1) + "" + now.getDate() ;
        var dir = __dirname + '/inspections/' + name + '/' + date;

        ensureExists(dir, function(err) {

           if (err) {

               callback(null, __dirname + "/temp")
           } else {

               callback(null, dir);
           }
        });
    },
    filename: function (req, file, callback) {

        var buildId = req.body.CI_BUILD_ID;
        callback(null, buildId + ".xml");
    }
});
var upload = multer({ storage : storage}).single('inspection');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

function ensureExists(path, mask, cb) {
    if (typeof mask == 'function') { // allow the `mask` parameter to be optional
        cb = mask;
        mask = 0777;
    }
    mkdirp(path, mask, function (err) {
        if (err) {
            if (err.code == 'EEXIST') cb(null); // ignore the error if the folder already exists
            else cb(err); // something else went wrong
        } else cb(null); // successfully created folder
    });
}

app.post('/upload', function (req, res, next) {
    upload(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file.");
        }
        res.end("File is uploaded");
    });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
