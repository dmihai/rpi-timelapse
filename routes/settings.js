exports.set = function(req, res) {
    var camera = getRequestCamera(req);
    if(camera) {
        if(req.param('aperture') != camera.getSettingsAperture())
            camera.changeAperture(req.param('aperture'));
        if(req.param('speed') != camera.getSettingsSpeed())
            camera.changeSpeed(req.param('speed'));
        if(req.param('iso') != camera.getSettingsIso())
            camera.changeIso(req.param('iso'));
        res.status(200).send('OK');
    }
    else {
        res.status(500).send('No camera');
    }
}

exports.refresh = function(req, res) {
    var camera = getRequestCamera(req);
    if(camera) {
        res.status(200).send({
            aperture: camera.getSettingsAperture(),
            speed: camera.getSettingsSpeed(),
            iso: camera.getSettingsIso(),
            apertureArr: camera.getSettingsApertureArr(),
            speedArr: camera.getSettingsSpeedArr(),
            isoArr: camera.getSettingsIsoArr()
        });
    }
    else {
        res.status(500).send('No camera');
    }
}