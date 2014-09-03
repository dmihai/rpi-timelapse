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
    
    this.takePicture = function() {
        console.log(camera.model + ": take picture");
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

    this.getIntervalTimer = function() {
        return intervalTimer;
    }

    this.setIntervalStarted = function(val) {
        intervalStarted = val;
    }

    this.setIntervalPaused = function(val) {
        intervalPaused = val;
    }

    this.setIntervalDelay = function(val) {
        intervalDelay = val;
    }
    
    this.setIntervalInterval = function(val) {
        intervalInterval = val;
    }
    
    this.setIntervalShots = function(val) {
        intervalShots = val;
    }
    
    this.incIntervalIndex = function() {
        intervalIndex++;
    }
    
    this.resetIntervalIndex = function() {
        intervalIndex = 0;
    }
    
    this.setIntervalTimer = function(val) {
        intervalTimer = val;
    }
}