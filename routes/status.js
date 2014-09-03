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

exports.shutdown = function(req, res) {
    exec("/sbin/shutdown -h now", function(error, stdout, stderr) {});
    res.status(200).send('OK');
}