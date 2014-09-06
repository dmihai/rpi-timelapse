exports.start = function(req, res) {
    res.set('Content-Type', 'text/plain');
    var camera = getRequestCamera(req);
    if(camera) {
        if(camera.intervalStart(req.param('delay'), req.param('interval'), req.param('shots'))) {
            res.status(200).send('OK');
        }
        else {
            res.status(500).send('Already started');
        }
    }
    else {
        res.status(500).send('No camera');
    }
}

exports.stop = function(req, res) {
    res.set('Content-Type', 'text/plain');
    var camera = getRequestCamera(req);
    if(camera) {
        if(camera.intervalStop()) {
            res.status(200).send('OK');
        }
        else {
            res.status(500).send('Not started');
        }
    }
    else {
        res.status(500).send('No camera');
    }
}

exports.pause = function(req, res) {
    res.set('Content-Type', 'text/plain');
    var camera = getRequestCamera(req);
    if(camera) {
        if(camera.intervalPause()) {
            res.status(200).send('OK');
        }
        else {
            res.status(500).send('Not started or already paused');
        }
    }
    else {
        res.status(500).send('No camera');
    }
}

exports.resume = function(req, res) {
    res.set('Content-Type', 'text/plain');
    var camera = getRequestCamera(req);
    if(camera) {
        if(camera.intervalResume()) {
            res.status(200).send('OK');
        }
        else {
            res.status(200).send('Not started or already running');
        }
    }
    else {
        res.status(500).send('No camera');
    }
}

exports.refresh = function(req, res) {
    var camera = getRequestCamera(req);
    if(camera) {
        res.status(200).send({
            started: camera.isIntervalStarted(),
            paused: camera.isIntervalPaused(),
            delay: camera.getIntervalDelay(),
            interval: camera.getIntervalInterval(),
            shots: camera.getIntervalShots(),
            index: camera.getIntervalIndex()
        });
    }
    else {
        res.status(500).send('No camera');
    }
}