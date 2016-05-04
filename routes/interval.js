var common = require('./../common');

module.exports = function(camArr) {
    return {
        start: function(req, res) {
            res.set('Content-Type', 'text/plain');
            var camera = common.getRequestCamera(req, camArr);
            if(camera) {
                if(camera.interval.start({
                    delay: req.body.delay,
                    interval: req.body.interval,
                    shots: req.body.shots,
                    shutter: req.body.shutter,
                    histogram: req.body.histogram=='1',
                    slider: req.body.slider=='1',
                    mdirection: req.body.mdirection,
                    mtime: req.body.mtime,
                    mdelay: req.body.mdelay
                })) {
                    res.status(200).send('OK');
                }
                else {
                    res.status(500).send('Already started');
                }
            }
            else {
                res.status(500).send('No camera');
            }
        },
        stop: function(req, res) {
            res.set('Content-Type', 'text/plain');
            var camera = common.getRequestCamera(req, camArr);
            if(camera) {
                if(camera.interval.stop()) {
                    res.status(200).send('OK');
                }
                else {
                    res.status(500).send('Not started');
                }
            }
            else {
                res.status(500).send('No camera');
            }
        },
        pause: function(req, res) {
            res.set('Content-Type', 'text/plain');
            var camera = common.getRequestCamera(req, camArr);
            if(camera) {
                if(camera.interval.pause()) {
                    res.status(200).send('OK');
                }
                else {
                    res.status(500).send('Not started or already paused');
                }
            }
            else {
                res.status(500).send('No camera');
            }
        },
        resume: function(req, res) {
            res.set('Content-Type', 'text/plain');
            var camera = common.getRequestCamera(req, camArr);
            if(camera) {
                if(camera.interval.resume()) {
                    res.status(200).send('OK');
                }
                else {
                    res.status(200).send('Not started or already running');
                }
            }
            else {
                res.status(500).send('No camera');
            }
        },
        refresh: function(req, res) {
            var camera = common.getRequestCamera(req, camArr);
            if(camera) {
                res.status(200).send({
                    started: camera.interval.isStarted,
                    paused: camera.interval.isPaused,
                    delay: camera.interval.delay,
                    interval: camera.interval.interval,
                    shots: camera.interval.shots,
                    index: camera.interval.index,
                    shutter: camera.interval.shutter,
                    hasCamera: camera.camera != null,
                    histogram: camera.interval.hasHistogram ? '1' : '0',
                    slider: camera.interval.hasSlider ? '1' : '0',
                    mdirection: camera.interval.mDirection,
                    mtime: camera.interval.mTime,
                    mdelay: camera.interval.mDelay
                });
            }
            else {
                res.status(200).send(null);
            }
        }
    };
}