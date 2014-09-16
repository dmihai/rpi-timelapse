var exec = require('child_process').exec;
var config = require('../config');

exports.refresh = function(req, res) {
    var camera = getRequestCamera(req);
    if(camera) {
        res.status(200).send({
            started: camera.isIntervalStarted(),
            paused: camera.isIntervalPaused(),
            interval: camera.getIntervalInterval(),
            index: camera.getIntervalIndex(),
            shots: camera.getIntervalShots()
        });
    }
    else {
        res.status(500).send('No camera');
    }
}

exports.cameras = function(req, res) {
    var cameras = [];
    for(var i = 0; i < camArr.length; i++) {
        cameras[cameras.length] = {
            index: i,
            model: camArr[i].getCamera() ? camArr[i].getCamera().model.replace(" (PTP mode)", "").replace(" DSC", "") : "Generic camera"
        };
    }
    res.status(200).send(cameras);
}

exports.addCamera = function(req, res) {
    refreshCameras();
    res.status(200).send('OK');
}

exports.shutdown = function(req, res) {
    exec(config.shutdownCmd, function(error, stdout, stderr) {});
    res.status(200).send('OK');
}