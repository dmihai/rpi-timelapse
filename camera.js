module.exports = function(cam) {
    var intervalStarted = false;
    var intervalPaused = false;
    var intervalDelay = 5;
    var intervalInterval = 1;
    var intervalShots = 250;
    var intervalIndex = 0;
    var intervalTimer = null;
    
    var camera = cam;
    var settingsAperture = null;
    var settingsSpeed = null;
    var settingsIso = null;
    
    var takePicture = function() {
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
    
    this.intervalStart = function(delay, interval, shots) {
        if(intervalStarted)
            return false;
        
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
                    takePicture();
                    
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