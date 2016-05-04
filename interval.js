var config = require('./config');

function Interval(camera) {
    this.camera = camera;
    
    this.isStarted = false;
    this.isPaused = false;
    
    this.delay = config.intervalDelay;
    this.interval = config.intervalInterval;
    this.shots = config.intervalShots;
    this.index = 0;
    this.shutter = camera.camera == null ? 'hard' : 'soft';
    this.hasHistogram = true;
    this.hasSlider = false;
    this.mDirection = 'left';
    this.mTime = '250';
    this.mDelay = '500';
    
    this.timer = null;
    this.timeout = null;
}

Interval.prototype = {
    takePicture: function() {
        if(this.isStarted && !this.isPaused) {
            var intervalObj = this;
            
            this.index++;
            this.camera.takePicture(this.hasHistogram);
            
            if(this.index >= this.shots) {
                this.stop();
            }
            
            if(this.hasSlider) {
                var sliderDelay = this.camera != null ? (eval(this.camera.speed) * 1000) + 500 : this.mDelay;

                setTimeout(function() {
                    intervalObj.camera.slider.move(intervalObj.mDirection, intervalObj.mTime, intervalObj);
                }, sliderDelay);
            }
            
            this.emitStatus();
        }
    },
    clearAllIntervals: function() {
        if(this.timer != null)
            clearInterval(this.timer);
        if(this.timeout != null)
            clearTimeout(this.timeout);
    },
    start: function(settings) {
        if(this.isStarted)
            return false;
        
        var intervalObj = this;
        
        this.camera.setParams();
        
        this.delay = parseInt(settings.delay);
        this.interval = settings.interval;
        this.shots = parseInt(settings.shots);
        this.shutter = settings.shutter;
        this.hasHistogram = settings.histogram;
        this.hasSlider = settings.slider;
        this.mDirection = settings.mdirection;
        this.mTime = settings.mtime;
        this.mDelay = settings.mdelay;
        this.isStarted = true;
        this.isPaused = false;
        this.index = 0;
        
        this.clearAllIntervals();
        
        this.timeout = setTimeout(function() {
            intervalObj.takePicture();
            intervalObj.timer = setInterval(function() {
                intervalObj.takePicture();
            }, parseFloat(intervalObj.interval) * 1000);
        }, intervalObj.delay * 1000);
        
        this.emitStatus();
        
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
        
        this.emitStatus();
        
        return true;
    },
    pause: function() {
        if(!this.isStarted || this.isPaused)
            return false;
        
        this.isPaused = true;
        
        this.emitStatus();
        
        return true;
    },
    resume: function() {
        if(!this.isStarted || !this.isPaused)
            return false;
        
        this.isPaused = false;
        
        this.emitStatus();
        
        return true;
    },
    emitStatus: function() {
        this.camera.io.emit('status', {
            camera: this.camera.index,
            started: this.isStarted,
            paused: this.isPaused,
            interval: this.interval,
            index: this.index,
            shots: this.shots
        });
    }
}

module.exports = Interval;