var fs = require('fs');
var exec = require('child_process').exec;
var config = require('./config');

function Camera(camera) {
    this.camera = camera;
    this.index = 0;
    this.interval = null;
    this.slider = null;
    this.io = null;
    this.name = "";
    
    this.aperture = null;
    this.speed = null;
    this.iso = null;
    
    this.apertureArr = [];
    this.speedArr = [];
    this.isoArr = [];
    
    this.configParams = [];
    this.cameraParams = {};
    
    this.busy = false;
}

Camera.prototype = {
    getConfigParams: function() {
        var pattern;
        
        for(var i = 0; i < config.cameraSettings.length; i++) {
            pattern = new RegExp(config.cameraSettings[i].model, "i");
            if(pattern.test(this.name)) {
                this.configParams = this.configParams.concat(config.cameraSettings[i].params);
            }
        }
    },
    setParams: function() {
        if(this.camera != null) {
            var cameraObj = this;
            this.busy = false;
            this.camera.getConfig(function (er, settings) {
                for(var i = 0; i < cameraObj.configParams.length; i++) {
                    cameraObj.cameraParams[cameraObj.configParams[i].param] = settings.main.children[cameraObj.configParams[i].category].children[cameraObj.configParams[i].param].value;
                    cameraObj.camera.setConfigValue(cameraObj.configParams[i].param, cameraObj.configParams[i].value, function (err) {
                        if(err) throw err;
                    });
                }
            });
        }
    },
    resetParams: function() {
        if(this.camera != null) {
            for(var i = 0; i < this.configParams.length; i++) {
                this.camera.setConfigValue(this.configParams[i].param, this.cameraParams[this.configParams[i].param], function (err) {
                    if(err) throw err;
                });
            }
        }
    },
    getSettings: function() {
        if(this.camera != null) {
            var cameraObj = this;
            this.camera.getConfig(function (er, settings) {
                cameraObj.name = settings.main.children['status'].children['cameramodel'].value;
                cameraObj.aperture = settings.main.children['capturesettings'].children['f-number'].value;
                cameraObj.speed = settings.main.children['capturesettings'].children['shutterspeed2'].value;
                cameraObj.iso = settings.main.children['imgsettings'].children['iso'].value;
                
                cameraObj.apertureArr = settings.main.children['capturesettings'].children['f-number'].choices;
                cameraObj.speedArr = settings.main.children['capturesettings'].children['shutterspeed2'].choices;
                cameraObj.isoArr = settings.main.children['imgsettings'].children['iso'].choices;
                
                cameraObj.getConfigParams();
                
                console.log("camera: " + cameraObj.camera.model);
                console.log("port: " + cameraObj.camera.port);
                console.log("index: " + cameraObj.index);
            });
        }
    },
    takePicture: function(histogram) {
        if(this.camera != null) {
            var cameraObj = this;
            
            var download = histogram && !this.busy;
            if(download) {
                console.log("take picture ... start downloading picture");
                this.busy = true;
            }
            else {
                console.log("take picture");
            }
            
            this.camera.takePicture({download: download}, function (er, data) {
                if(!download)
                    return;
                
                var imageFile = 'camera_' + cameraObj.index;
                var imagePath = __dirname + '/tmp/' + imageFile + '.jpg';
                var histogramPath = __dirname + '/public/histo/' + imageFile + '.png';
                
                console.log("picture downloaded ... start building histogram");
                fs.writeFile(imagePath, data, function(err) {
                    if(err) throw err;
                    var histogramCmd = config.convertPath + " " + imagePath + " -define histogram:unique-colors=false histogram:" + histogramPath;
                    exec(histogramCmd, function(error, stdout, stderr) {
                        cameraObj.busy = false;
                        cameraObj.emitHistogram();
                        console.log("histogram built");
                    });
                });
            });
        }
    },
    testShoot: function() {
        this.setParams();
        var cameraObj = this;
        
        setTimeout(function() {
            cameraObj.takePicture(true);
        
            setTimeout(function() {
                cameraObj.resetParams();
            }, 1000);
        }, 1000);
    },
    changeAperture: function(newAperture) {
        if(this.camera != null) {
            var cameraObj = this;
            this.camera.setConfigValue('f-number', newAperture, function (err) {
                if(!err) cameraObj.aperture = newAperture;
            });
        }
    },
    changeSpeed: function(newSpeed) {
        if(this.camera != null) {
            var cameraObj = this;
            this.camera.setConfigValue('shutterspeed2', newSpeed, function (err) {
                if(!err) cameraObj.speed = newSpeed;
            });
        }
    },
    changeIso: function(newIso) {
        if(this.camera != null) {
            var cameraObj = this;
            this.camera.setConfigValue('iso', newIso, function (err) {
                if(!err) cameraObj.iso = newIso;
            });
        }
    },
    emitHistogram: function() {
        this.io.emit('histogram', {
            camera: this.index,
        });
    }
};

module.exports = Camera;