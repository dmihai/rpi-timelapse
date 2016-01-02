var common = require('./../common');

module.exports = function(camArr) {
    return {
        set: function(req, res) {
            var camera = common.getRequestCamera(req, camArr);
            if(camera) {
                if(req.body.aperture != camera.aperture)
                    camera.changeAperture(req.body.aperture);
                if(req.body.speed != camera.speed)
                    camera.changeSpeed(req.body.speed);
                if(req.body.iso != camera.iso)
                    camera.changeIso(req.body.iso);
                res.status(200).send('OK');
            }
            else {
                res.status(500).send('No camera');
            }
        },
        refresh: function(req, res) {
            var camera = common.getRequestCamera(req, camArr);
            if(camera) {
                res.status(200).send({
                    aperture: camera.aperture,
                    speed: camera.speed,
                    iso: camera.iso,
                    apertureArr: camera.apertureArr,
                    speedArr: camera.speedArr,
                    isoArr: camera.isoArr,
                    interval: camera.interval.isStarted
                });
            }
            else {
                res.status(200).send({});
            }
        },
        shoot: function(req, res) {
            var camera = common.getRequestCamera(req, camArr);
            if(camera) {
                camera.testShoot(common.getRequestCameraIndex(req, camArr));
            }
            else {
                res.status(500).send('No camera');
            }
        }
    }
}