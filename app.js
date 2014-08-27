var express = require('express');
var gpio = require('rpi-gpio');
var gphoto2 = require('gphoto2');
var bodyParser = require('body-parser');
var sys = require('sys');
var exec = require('child_process').exec;
var GPhoto = new gphoto2.GPhoto2();

// the app
var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

console.log('App started');

var intervalStarted = false;
var intervalPaused = false;
var intervalDelay = 5;
var intervalInterval = 1;
var intervalShots = 250;
var intervalIndex = 0;
var intervalObj = null;

var camera = null;
var settingsAperture = null;
var settingsSpeed = null;
var settingsIso = null;

// serve static pages in /public dir
app.use(express.static(__dirname + '/public'));

app.post('/api/interval/start', function(req, res) {
    res.set('Content-Type', 'text/plain');
    if(!intervalStarted) {
        intervalDelay = parseInt(req.param('delay'));
        intervalInterval = req.param('interval');
        intervalShots = parseInt(req.param('shots'));
        intervalStarted = true;
        intervalPaused = false;
        intervalIndex = 0;
        
        setTimeout(function() {
            intervalObj = setInterval(function() {
                if(intervalStarted && !intervalPaused) {
                    intervalIndex++;
                    enableShutter();
                    
                    if(intervalIndex >= intervalShots) {
                        clearInterval(intervalObj);
                        intervalStarted = false;
                    }
                }
            }, parseFloat(intervalInterval) * 1000);
        }, intervalDelay * 1000);
        
        res.status(200).send('OK');
    }
    else {
        res.status(500).send('Already started');
    }
});

app.post('/api/interval/stop', function(req, res) {
    res.set('Content-Type', 'text/plain');
    if(intervalStarted) {
        intervalStarted = false;
        intervalPaused = false;
        intervalIndex = 0;
        clearInterval(intervalObj);
        res.status(200).send('OK');
    }
    else {
        res.status(500).send('Not started');
    }
});

app.post('/api/interval/pause', function(req, res) {
    res.set('Content-Type', 'text/plain');
    if(intervalStarted && !intervalPaused) {
        intervalPaused = true;
        res.status(200).send('OK');
    }
    else {
        res.status(500).send('Not started or already paused');
    }
});

app.post('/api/interval/resume', function(req, res) {
    res.set('Content-Type', 'text/plain');
    if(intervalStarted && intervalPaused) {
        intervalPaused = false;
        res.status(200).send('OK');
    }
    else {
        res.status(200).send('Not started or already paused');
    }
});

app.get('/api/interval/refresh', function(req, res) {
    res.status(200).send({
        started: intervalStarted,
        paused: intervalPaused,
        delay: intervalDelay,
        interval: intervalInterval,
        shots: intervalShots,
        index: intervalIndex
    });
});

app.post('/api/settings/set', function(req, res) {
    if(camera) {
        if(req.param('aperture') != settingsAperture)
            changeAperture(req.param('aperture'));
        if(req.param('speed') != settingsSpeed)
            changeSpeed(req.param('speed'));
        if(req.param('iso') != settingsIso)
            changeIso(req.param('iso'));
        res.status(200).send('OK');
    }
});

app.get('/api/settings/refresh', function(req, res) {
    getCamera();
    res.status(200).send({
        aperture: settingsAperture,
        speed: settingsSpeed,
        iso: settingsIso
    });
});

app.get('/api/status/refresh', function(req, res) {
    res.status(200).send({
        started: intervalStarted,
        paused: intervalPaused,
        interval: intervalInterval,
        index: intervalIndex,
        shots: intervalShots
    });
});

app.post('/api/status/shutdown', function(req, res) {
    exec("/sbin/shutdown -h now", function(error, stdout, stderr) {});
    res.status(200).send('OK');
});

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

function getCamera() {
    if(camera == null) {
        GPhoto.list(function (list) {
            if (list.length === 0) return;
            camera = list[0];
            getCameraSettings();
        });
    }
    else
        getCameraSettings();
}

function getCameraSettings() {
    if(camera) {
        camera.getConfig(function (er, settings) {
            settingsAperture = settings.main.children['capturesettings'].children['f-number'].value;
            settingsSpeed = settings.main.children['capturesettings'].children['shutterspeed2'].value;
            settingsIso = settings.main.children['imgsettings'].children['iso'].value;
        });
    }
}

function changeAperture(newAperture) {
    if(camera) {
        camera.setConfigValue('f-number', newAperture, function (err) {
            if(!err) settingsAperture = newAperture;
        });
    }
}

function changeSpeed(newSpeed) {
    if(camera) {
        camera.setConfigValue('shutterspeed2', newSpeed, function (err) {
            if(!err) settingsSpeed = newSpeed;
        });
    }
}

function changeIso(newIso) {
    if(camera) {
        camera.setConfigValue('iso', newIso, function (err) {
            if(!err) settingsIso = newIso;
        });
    }
}

// start server
var server = app.listen(80);

getCamera();