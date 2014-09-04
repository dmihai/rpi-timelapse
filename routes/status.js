var exec = require('child_process').exec;

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
            model: camArr[i].getCamera().model.replace(" (PTP mode)", "").replace(" DSC", "")
        };
    }
    res.status(200).send(cameras);
}

exports.shutdown = function(req, res) {
    exec("/sbin/shutdown -h now", function(error, stdout, stderr) {});
    res.status(200).send('OK');
}