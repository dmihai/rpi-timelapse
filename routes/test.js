exports.shoot = function(req, res) {
    if(camera) {
        /*camera.takePicture({download: false}, function (er, path) {
            console.log(path);
        });*/
        camera.takePicture({
            targetPath: '/tmp/foo.XXXXXX'
        }, function (er, tmpname) {
            console.log('step1');
            fs.renameSync(tmpname, __dirname + '/picture.jpg');
            console.log('step2');
        });
    }
    
    res.status(200).send('OK');
}