var config = require('./config');

function Interval(camera) {
    this.camera = camera;
    
    this.isStarted = false;
    this.isPaused = false;
    
    this.delay = config.intervalDelay;
    this.interval = config.intervalInterval;
    this.shots = config.intervalShots;
    this.index = 0;
    this.hasHistogram = true;
    this.hasSlider = false;
    this.mDirection = 'left';
    this.mTime = '250';
    
    this.timer = null;
    this.timeout = null;
}

Interval.prototype = {
    takePicture: function(cameraIndex) {
        if(this.isStarted && !this.isPaused) {
            var intervalObj = this;
            
            this.index++;
            this.camera.takePicture(cameraIndex, this.hasHistogram);
            
            if(this.index >= this.shots) {
                this.stop();
            }
            
            if(this.hasSlider) {
                var sliderDelay = this.camera != null ? (eval(this.camera.speed) * 1000) + 500 : 1000;

                setTimeout(function() {
                    intervalObj.camera.slider.move(intervalObj.mDirection, intervalObj.mTime, intervalObj);
                }, sliderDelay);
            }
        }
    },
    clearAllIntervals: function() {
        if(this.timer != null)
            clearInterval(this.timer);
        if(this.timeout != null)
            clearTimeout(this.timeout);
    },
    start: function(settings, cameraIndex) {
        if(this.isStarted)
            return false;
        
        var intervalObj = this;
        
        this.camera.setParams();
        
        this.delay = parseInt(settings.delay);
        this.interval = settings.interval;
        this.shots = parseInt(settings.shots);
        this.hasHistogram = settings.histogram;
        this.hasSlider = settings.slider;
        this.mDirection = settings.mdirection;
        this.mTime = settings.mtime;
        this.isStarted = true;
        this.isPaused = false;
        this.index = 0;
        
        this.clearAllIntervals();
        
        this.timeout = setTimeout(function() {
            intervalObj.takePicture(cameraIndex);
            intervalObj.timer = setInterval(function() {
                intervalObj.takePicture(cameraIndex);
            }, parseFloat(intervalObj.interval) * 1000);
        }, intervalObj.delay * 1000);
        
        return true;
    },
    stop: function() {
        if(!this.isStarted)
            return false;
        
        var intervalObj = this;
        
        setTimeout(function() {
            intervalObj.camera.resetParams();
        }, 1000);
        
        this.isStarted = false;
        this.isPaused = false;
        this.index = 0;
        this.clearAllIntervals();
        
        return true;
    },
    pause: function() {
        if(!this.isStarted || this.isPaused)
            return false;
        
        this.isPaused = true;
        
        return true;
    },
    resume: function() {
        if(!this.isStarted || !this.isPaused)
            return false;
        
        this.isPaused = false;
        
        return true;
    }
}

module.exports = Interval;