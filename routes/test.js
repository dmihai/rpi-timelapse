var fs = require('fs');
var exec = require('child_process').exec;
var config = require('../config');

exports.shoot = function(req, res) {
    var camera = getRequestCamera(req);
    if(camera) {
        camera.getCamera().takePicture({download: true}, function (er, data) {
            var imageFile = 'camera_' + (req.param('camera') || '0');
            var imagePath = __dirname + '/../tmp/' + imageFile + '.jpg';
            var histogramPath = __dirname + '/../public/histo/' + imageFile + '.png';
            
            fs.writeFile(imagePath, data, function(err) {
                if(err) throw err;
                var histogramCmd = config.convertPath + " " + imagePath + " -define histogram:unique-colors=false histogram:" + histogramPath;
                console.log(histogramCmd);
                exec(histogramCmd, function(error, stdout, stderr) {});
            });
        });
    }
    
    res.status(200).send('OK');
}