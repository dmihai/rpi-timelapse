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
    var intervalHistogram = true;
    var intervalSlider = false;
    var intervalMDirection = 'left';
    var intervalMTime = '500';
    var intervalIndex = 0;
    var intervalTimer = null;
    var intervalTimeout = null;
    
    var camera = cam;
    var settingsAperture = null;
    var settingsSpeed = null;
    var settingsIso = null;
    var settingsApertureArr = [];
    var settingsSpeedArr = [];
    var settingsIsoArr = [];
    
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
    
    var sliderMove = function() {
        if(intervalStarted && !intervalPaused) {
            var sliderPin = (intervalMDirection=='left' ? config.sliderPinLeft : config.sliderPinRight);
            gpio.write(sliderPin, true, function(err) {
                if (err) throw err;
                setTimeout(function() {
                    sliderStop();
                }, parseInt(intervalMTime));
            });
        }
    }
    
    var sliderStop = function() {
        gpio.write(config.sliderPinLeft, false, function(err) {
            if (err) throw err;
        });
        
        gpio.write(config.sliderPinRight, false, function(err) {
            if (err) throw err;
        });
    }
    
    var takePicture = function(index, test) {
        if(camera != null && (intervalShutter == 'soft' || test)) {
            camera.takePicture({download: intervalHistogram || test}, function (er, data) {
                if(!intervalHistogram && !test)
                    return;
                
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
            takePicture(index, false);
            
            if(intervalIndex >= intervalShots) {
                _this.intervalStop();
            }
            
            if(intervalSlider) {
                var sliderDelay = camera ? (eval(settingsSpeed) * 1000) + 500 : 1000;
                setTimeout(function() {
                    sliderMove();
                }, sliderDelay);
            }
        }
    }
    
    var intervalClearInterval = function() {
        if(intervalTimer)
            clearInterval(intervalTimer);
        if(intervalTimeout)
            clearTimeout(intervalTimeout);
    }
    
    this.getCameraSettings = function() {
        if(camera != null) {
            camera.getConfig(function (er, settings) {
                settingsAperture = settings.main.children['capturesettings'].children['f-number'].value;
                settingsSpeed = settings.main.children['capturesettings'].children['shutterspeed2'].value;
                settingsIso = settings.main.children['imgsettings'].children['iso'].value;
                
                settingsApertureArr = settings.main.children['capturesettings'].children['f-number'].choices;
                settingsSpeedArr = settings.main.children['capturesettings'].children['shutterspeed2'].choices;
                settingsIsoArr = settings.main.children['imgsettings'].children['iso'].choices;
                
                intervalShutter = "soft";
                intervalHistogram = true;
                
                console.log("camera: " + camera.model);
                console.log("port: " + camera.port);
            });
        }
        else {
            intervalShutter = "hard";
            intervalHistogram = false;
        }
        
        intervalSlider = false;
        intervalMDirection = 'left';
        intervalMTime = '500';
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
    
    this.testShoot = function(index) {
        setCamera();
        
        setTimeout(function() {
            takePicture(index, true);
        
            setTimeout(function() {
                resetCamera();
            }, 1000);
        }, 1000);
    }
    
    this.intervalStart = function(settings, index) {
        if(intervalStarted)
            return false;
        
        setCamera();
        
        intervalDelay = parseInt(settings.delay);
        intervalInterval = settings.interval;
        intervalShots = parseInt(settings.shots);
        intervalShutter = settings.shutter;
        intervalHistogram = settings.histogram;
        intervalSlider = settings.slider;
        intervalMDirection = settings.mdirection;
        intervalMTime = settings.mtime;
        intervalStarted = true;
        intervalPaused = false;
        intervalIndex = 0;
        
        intervalClearInterval();
        
        intervalTimeout = setTimeout(function() {
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
        intervalClearInterval();
        
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
    
    this.getSettingsApertureArr = function() {
        return settingsApertureArr;
    }
    
    this.getSettingsSpeedArr = function() {
        return settingsSpeedArr;
    }

    this.getSettingsIsoArr = function() {
        return settingsIsoArr;
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
    
    this.getIntervalShutter = function() {
        return intervalShutter;
    }
    
    this.getIntervalHistogram = function() {
        return intervalHistogram;
    }
    
    this.getIntervalSlider = function() {
        return intervalSlider;
    }
    
    this.getIntervalMDirection = function() {
        return intervalMDirection;
    }
    
    this.getIntervalMTime = function() {
        return intervalMTime;
    }
}