exports.start = function(req, res) {
    res.set('Content-Type', 'text/plain');
    var camera = getRequestCamera(req);
    if(camera) {
        if(!camera.isIntervalStarted()) {
            camera.setIntervalDelay(parseInt(req.param('delay')));
            camera.setIntervalInterval(req.param('interval'));
            camera.setIntervalShots(parseInt(req.param('shots')));
            camera.setIntervalStarted(true);
            camera.setIntervalPaused(false);
            camera.resetIntervalIndex();
            
            setTimeout(function() {
                camera.setIntervalTimer(setInterval(function() {
                    if(camera.isIntervalStarted() && !camera.isIntervalPaused()) {
                        camera.incIntervalIndex();
                        camera.takePicture();
                        
                        if(camera.getIntervalIndex() >= camera.getIntervalShots()) {
                            clearInterval(camera.getIntervalTimer());
                            camera.setIntervalStarted(false);
                        }
                    }
                }, parseFloat(camera.getIntervalInterval()) * 1000));
            }, camera.getIntervalDelay() * 1000);
            
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
        if(camera.isIntervalStarted()) {
            camera.setIntervalStarted(false);
            camera.setIntervalPaused(false);
            camera.resetIntervalIndex();
            clearInterval(camera.getIntervalTimer());
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
        if(camera.isIntervalStarted() && !camera.isIntervalPaused()) {
            camera.setIntervalPaused(true);
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
        if(camera.isIntervalStarted() && camera.isIntervalPaused()) {
            camera.setIntervalPaused(false);
            res.status(200).send('OK');
        }
        else {
            res.status(200).send('Not started or already paused');
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