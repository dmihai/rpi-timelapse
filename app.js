var express = require('express');
var gpio = require('rpi-gpio');
var gphoto2 = require('gphoto2');
var GPhoto = new gphoto2.GPhoto2();
var bodyParser = require('body-parser');

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
app.post('/api/status/shutdown', status.shutdown);

app.post('/api/test/shoot', test.shoot);

gpio.setup(7, gpio.DIR_OUT, function(err) {
    if(err) throw err;
});

gpio.setup(11, gpio.DIR_OUT, function(err) {
    if(err) throw err;
});

function enableShutter() {
    gpio.write(7, true, function(err) {
        if (err) throw err;
        gpio.write(11, true, function(err) {
            if (err) throw err;
            setTimeout(disableShutter, 200);
        });
    });
}

function disableShutter() {
    gpio.write(11, false, function(err) {
        if (err) throw err;
        gpio.write(7, false, function(err) {
            if (err) throw err;
        });
    });
}

global.getRequestCamera = function(req) {
    if(req.param("camera"))
        return camArr[req.param("camera")];
    return camArr[0];
}

function refreshCameras() {
    GPhoto.list(function (list) {
        if (list.length === 0) return;
        
        var camera, found;
        var i, j;
        
        for(i = 0; i < list.length; i++) {
            list[i].camera;
            list[i].port;
            
            // check if camera already exists
            found = false;
            for(j = 0; j < camArr.length; j++)
                if(list[i].camera == camArr[j].getCamera().camera && list[i].port == camArr[j].getCamera().port)
                    found = true;
            
            if(!found) {
                camera = new Camera(list[i]);
                camArr[camArr.length] = camera;
                camera.getCameraSettings();
            }
        }
    });
}

// start server
var server = app.listen(80);

refreshCameras();