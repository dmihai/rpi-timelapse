var fs = require('fs');
var gpio = require('rpi-gpio');
var exec = require('child_process').exec;
var config = require('./config');

module.exports = function(cam) {
    var _this = this;
    
    var intervalStarted = false;
    var intervalPaused = false;
    var intervalDelay = config.intervalDelay;
    var intervalInterval = config.intervalInterval;
    var intervalShots = config.intervalShots;
    var intervalShutter = 'soft';
    var intervalIndex = 0;
    var intervalTimer = null;
    
    var camera = cam;
    var settingsAperture = null;
    var settingsSpeed = null;
    var settingsIso = null;
    
    var cameraParams = {};

    var getConfigParams = function() {
        var params = [];
        var i, pattern;
        
        for(i = 0; i < config.cameraSettings.length; i++) {
            pattern = new RegExp(config.cameraSettings[i].model, "i");
            if(pattern.test(camera.model)) {
                params = config.cameraSettings[i].params;
                break;
            }
        }
        
        return params;
    }
    
    var setCamera = function() {
        if(camera != null) {
            var i;
            var params = getConfigParams();
            
            camera.getConfig(function (er, settings) {
                for(i = 0; i < params.length; i++) {
                    cameraParams[params[i].param] = settings.main.children[params[i].category].children[params[i].param].value;
                    camera.setConfigValue(params[i].param, params[i].value, function (err) {
                        if(err) throw err;
                    });
                }
            });
        }
    }
    
    var resetCamera = function() {
        if(camera != null) {
            var i;
            var params = getConfigParams();
            
            for(i = 0; i < params.length; i++) {
                camera.setConfigValue(params[i].param, cameraParams[params[i].param], function (err) {
                    if(err) throw err;
                });
            }
        }
    }
    
    var enableShutter = function() {
        gpio.write(config.shutterFocusPin, true, function(err) {
            if (err) throw err;
            gpio.write(config.shutterReleasePin, true, function(err) {
                if (err) throw err;
                setTimeout(disableShutter, config.shutterPressedTime);
            });
        });
    }
    
    var disableShutter = function() {
        gpio.write(config.shutterReleasePin, false, function(err) {
            if (err) throw err;
            gpio.write(config.shutterFocusPin, false, function(err) {
                if (err) throw err;
            });
        });
    }
    
    var takePicture = function(index) {
        if(camera != null && intervalShutter == 'soft') {
            camera.takePicture({download: true}, function (er, data) {
                var imageFile = 'camera_' + index;
                var imagePath = __dirname + '/tmp/' + imageFile + '.jpg';
                var histogramPath = __dirname + '/public/histo/' + imageFile + '.png';
                
                fs.writeFile(imagePath, data, function(err) {
                    if(err) throw err;
                    var histogramCmd = config.convertPath + " " + imagePath + " -define histogram:unique-colors=false histogram:" + histogramPath;
                    exec(histogramCmd, function(error, stdout, stderr) {});
                });
            });
        }
        else {
            enableShutter();
        }
    }
    
    var intervalTakePicture = function(index) {
        if(intervalStarted && !intervalPaused) {
            intervalIndex++;
            takePicture(index);
            
            if(intervalIndex >= intervalShots) {
                _this.intervalStop();
            }
        }
    }
    
    this.getCameraSettings = function() {
        if(camera != null) {
            camera.getConfig(function (er, settings) {
                settingsAperture = settings.main.children['capturesettings'].children['f-number'].value;
                settingsSpeed = settings.main.children['capturesettings'].children['shutterspeed2'].value;
                settingsIso = settings.main.children['imgsettings'].children['iso'].value;
                
                console.log("camera: " + camera.model);
                console.log("port: " + camera.port);
                console.log("aperture: " + settingsAperture);
                console.log("speed: " + settingsSpeed);
                console.log("iso: " + settingsIso);
            });
        }
    }
    
    this.changeAperture = function(newAperture) {
        if(camera != null) {
            camera.setConfigValue('f-number', newAperture, function (err) {
                if(!err) settingsAperture = newAperture;
            });
        }
    }

    this.changeSpeed = function(newSpeed) {
        if(camera != null) {
            camera.setConfigValue('shutterspeed2', newSpeed, function (err) {
                if(!err) settingsSpeed = newSpeed;
            });
        }
    }

    this.changeIso = function(newIso) {
        if(camera != null) {
            camera.setConfigValue('iso', newIso, function (err) {
                if(!err) settingsIso = newIso;
            });
        }
    }
    
    this.intervalStart = function(settings, index) {
        if(intervalStarted)
            return false;
        
        setCamera();
        
        intervalDelay = parseInt(settings.delay);
        intervalInterval = settings.interval;
        intervalShots = parseInt(settings.shots);
        intervalShutter = settings.shutter;
        intervalStarted = true;
        intervalPaused = false;
        intervalIndex = 0;
        
        setTimeout(function() {
            intervalTakePicture(index);
            intervalTimer = setInterval(function() {
                intervalTakePicture(index);
            }, parseFloat(intervalInterval) * 1000);
        }, intervalDelay * 1000);
        
        return true;
    }
    
    this.intervalStop = function() {
        if(!intervalStarted)
            return false;
        
        resetCamera();
        
        intervalStarted = false;
        intervalPaused = false;
        intervalIndex = 0;
        clearInterval(intervalTimer);
        
        return true;
    }
    
    this.intervalPause = function() {
        if(!intervalStarted || intervalPaused)
            return false;
        
        intervalPaused = true;
        
        return true;
    }
    
    this.intervalResume = function() {
        if(!intervalStarted || !intervalPaused)
            return false;
        
        intervalPaused = false;
        
        return true;
    }
    
    this.getSettingsAperture = function() {
        return settingsAperture;
    }
    
    this.getSettingsSpeed = function() {
        return settingsSpeed;
    }

    this.getSettingsIso = function() {
        return settingsIso;
    }
    
    this.getCamera = function() {
        return camera;
    }
    
    this.isIntervalStarted = function() {
        return intervalStarted;
    }
    
    this.isIntervalPaused = function() {
        return intervalPaused;
    }
    
    this.getIntervalDelay = function() {
        return intervalDelay;
    }
    
    this.getIntervalInterval = function() {
        return intervalInterval;
    }

    this.getIntervalShots = function() {
        return intervalShots;
    }

    this.getIntervalIndex = function() {
        return intervalIndex;
    }
}