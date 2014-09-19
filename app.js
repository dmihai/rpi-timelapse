var express = require('express');
var gphoto2 = require('gphoto2');
var bodyParser = require('body-parser');
var gpio = require('rpi-gpio');

var config = require('./config');
var Camera = require('./camera');
var interval = require('./routes/interval');
var settings = require('./routes/settings');
var status = require('./routes/status');
var test = require('./routes/test');

global.camArr = [];

// the app
var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

console.log('App started');

// serve static pages in /public dir
app.use(express.static(__dirname + '/public'));

app.post('/api/interval/start', interval.start);
app.post('/api/interval/stop', interval.stop);
app.post('/api/interval/pause', interval.pause);
app.post('/api/interval/resume', interval.resume);
app.get('/api/interval/refresh', interval.refresh);

app.post('/api/settings/set', settings.set);
app.get('/api/settings/refresh', settings.refresh);

app.get('/api/status/refresh', status.refresh);
app.get('/api/status/cameras', status.cameras);
app.get('/api/status/addCamera', status.addCamera);
app.post('/api/status/shutdown', status.shutdown);

app.post('/api/test/shoot', test.shoot);

global.getRequestCamera = function(req) {
    if(req.param("camera"))
        return camArr[req.param("camera")];
    return camArr[0];
}

global.refreshCameras = function() {
    var GPhoto = new gphoto2.GPhoto2();
    GPhoto.list(function (list) {
        var camera, found;
        var i, j;
        var newCamArr = [];
        
        for(i = 0; i < list.length; i++) {
            // check if camera already exists
            found = false;
            for(j = 0; j < camArr.length; j++) {
                if(camArr[j].getCamera() && list[i].camera == camArr[j].getCamera().camera && list[i].port == camArr[j].getCamera().port) {
                    found = true;
                    camArr[j].getCameraSettings();
                    newCamArr[newCamArr.length] = camArr[j];
                }
            }
            
            if(!found) {
                camera = new Camera(list[i]);
                newCamArr[newCamArr.length] = camera;
                camera.getCameraSettings();
            }
        }
        
        // if no camera found, add a generic camera
        if(newCamArr.length == 0) {
            camera = new Camera(null);
            camera.getCameraSettings();
            newCamArr[newCamArr.length] = camera;
        }
        
        camArr = newCamArr;
    });
}

gpio.setup(config.shutterFocusPin, gpio.DIR_OUT, function(err) {
    if(err) throw err;
});

gpio.setup(config.shutterReleasePin, gpio.DIR_OUT, function(err) {
    if(err) throw err;
});

// start server
var server = app.listen(80);

refreshCameras();