var exec = require('child_process').exec;
var config = require('../config');
var common = require('./../common');

module.exports = function(camArr, slider, io) {
    return {
        refresh: function(req, res) {
            var camera = common.getRequestCamera(req, camArr);
            if(camera) {
                res.status(200).send({
                    started: camera.interval.isStarted,
                    paused: camera.interval.isPaused,
                    interval: camera.interval.interval,
                    index: camera.interval.index,
                    shots: camera.interval.shots
                });
            }
            else {
                res.status(200).send({});
            }
        },
        cameras: function(req, res) {
            var cameras = [];
            for(var i = 0; i < camArr.length; i++) {
                cameras[cameras.length] = {
                    index: camArr[i].index,
                    model: camArr[i].name
                };
            }
            res.status(200).send(cameras);
        },
        addCamera: function(req, res) {
            common.refreshCameras(camArr, slider, io);
            res.status(200).send('OK');
        },
        shutdown: function(req, res) {
            exec(config.shutdownCmd, function(error, stdout, stderr) {});
            res.status(200).send('OK');
        },
        motor: function(req, res) {
            res.status(200).send("OK");
            
            var camera = common.getRequestCamera(req, camArr);
            if(camera && !camera.interval.isStarted) {
                camera.slider.move(req.body.dir=="1" ? "left" : "right");
            }
        }
    }
}