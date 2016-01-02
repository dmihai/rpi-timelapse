var config = require('./config');
var gpio = require('rpi-gpio');

function Slider(camera) {
    this.timeout = null;
    this.intervalCheck = null;
}

Slider.prototype = {
    move: function(direction, duration, interval) {
        var sliderPin = (direction=='left' ? config.sliderPinLeft : config.sliderPinRight);
        var sliderObj = this;
        
        if(this.timeout)
            clearTimeout(this.timeout);
        
        gpio.write(sliderPin, true, function(err) {
            if (err) throw err;
            
            sliderObj.timeout = setTimeout(function() {
                sliderObj.stop();
            }, parseInt(duration));
            
            if(sliderObj.intervalCheck == null) {
                sliderObj.intervalCheck = setInterval(function() {
                    gpio.read(config.sliderLimitPin, function(err, value) {
                        if(!value) {
                            sliderObj.stop();
                            interval.stop();
                        }
                    });
                }, 100);
            }
        });
    },
    stop: function() {
        gpio.write(config.sliderPinLeft, false, function(err) {
            if (err) throw err;
        });
        
        gpio.write(config.sliderPinRight, false, function(err) {
            if (err) throw err;
        });
        
        clearInterval(this.intervalCheck);
        this.intervalCheck = null;
    }
}

module.exports = Slider;