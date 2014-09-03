var express = require('express');
var gpio = require('rpi-gpio');
var gphoto2 = require('gphoto2');
var bodyParser = require('body-parser');
var sys = require('sys');
var exec = require('child_process').exec;
var GPhoto = new gphoto2.GPhoto2();
var fs = require('fs');

var Camera = require('./camera');

// the app
var app = express();

var camArr = [];

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

console.log('App started');

// serve static pages in /public dir
app.use(express.static(__dirname + '/public'));

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
    GPhoto.list(function (list) {
        if (list.length === 0) return;
        
        var camera;
        
        for(var i = 0; i < list.length; i++) {
            camera = new Camera(list[i]);
            camArr[camArr.length] = camera;
            camera.getCameraSettings();
        }
    });
}

// start server
//var server = app.listen(80);

getCamera();