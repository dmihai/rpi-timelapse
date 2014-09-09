var fs = require('fs');
var exec = require('child_process').exec;
var config = require('./config');

module.exports = function(cam) {
    var intervalStarted = false;
    var intervalPaused = false;
    var intervalDelay = config.intervalDelay;
    var intervalInterval = config.intervalInterval;
    var intervalShots = config.intervalShots;
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
        var i;
        var params = getConfigParams();
        
        camera.getConfig(function (er, settings) {
            for(i = 0; i < params.length; i++) {
                cameraParams[params[i].param] = settings.main.children[params[i].category].children[params[i].param].value;
                camera.setConfigValue(params[i].param, params[i].value, function (er) {});
            }
            console.log(cameraParams);
        });
    }
    
    var resetCamera = function() {
        var i;
        var params = getConfigParams();
        
        for(i = 0; i < params.length; i++) {
            camera.setConfigValue(params[i].param, cameraParams[params[i].param], function (er) {});
        }
    }
    
    var takePicture = function(index) {
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

        console.log(camera.model + ": take picture");
    }
    
    this.getCameraSettings = function() {
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
    
    this.changeAperture = function(newAperture) {
        camera.setConfigValue('f-number', newAperture, function (err) {
            if(!err) settingsAperture = newAperture;
        });
    }

    this.changeSpeed = function(newSpeed) {
        camera.setConfigValue('shutterspeed2', newSpeed, function (err) {
            if(!err) settingsSpeed = newSpeed;
        });
    }

    this.changeIso = function(newIso) {
        camera.setConfigValue('iso', newIso, function (err) {
            if(!err) settingsIso = newIso;
        });
    }
    
    this.intervalStart = function(delay, interval, shots, index) {
        if(intervalStarted)
            return false;
        
        setCamera();
        
        intervalDelay = parseInt(delay);
        intervalInterval = interval;
        intervalShots = parseInt(shots);
        intervalStarted = true;
        intervalPaused = false;
        intervalIndex = 0;
        
        setTimeout(function() {
            intervalTimer = setInterval(function() {
                if(intervalStarted && !intervalPaused) {
                    intervalIndex++;
                    takePicture(index);
                    
                    if(intervalIndex >= intervalShots) {
                        clearInterval(intervalTimer);
                        intervalStarted = false;
                    }
                }
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