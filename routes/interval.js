exports.start = function(req, res) {
    res.set('Content-Type', 'text/plain');
    var camera = getRequestCamera(req);
    if(camera) {
        if(camera.intervalStart({
            delay: req.param('delay'),
            interval: req.param('interval'),
            shots: req.param('shots'),
            shutter: req.param('shutter'),
            histogram: req.param('histogram')=='1',
            slider: req.param('slider')=='1',
            mdirection: req.param('mdirection'),
            mtime: req.param('mtime')
        }, (req.param('camera') || '0'))) {
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
            index: camera.getIntervalIndex(),
            shutter: camera.getIntervalShutter(),
            histogram: camera.getIntervalHistogram() ? '1' : '0',
            hasSoft: camera.getCamera() ? true : false,
            slider: camera.getIntervalSlider() ? '1' : '0',
            mdirection: camera.getIntervalMDirection(),
            mtime: camera.getIntervalMTime()
        });
    }
    else {
        res.status(500).send('No camera');
    }
}