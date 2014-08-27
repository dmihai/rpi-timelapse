var apertureArr = ["f/22", "f/20", "f/18", "f/16", "f/14", "f/13", "f/11", "f/10", "f/9", "f/8", "f/7.1", "f/6.3", "f/5.6", "f/5", "f/4.5", "f/4", "f/3.5", "f/3.2", "f/2.8", "f/2.5", "f/2.2", "f/2", "f/1.8"];
var speedArr = ["1/125", "1/100", "1/80", "1/60", "1/50", "1/40", "1/30", "1/25", "1/20", "1/15", "1/13", "1/10", "1/8", "1/6", "1/5", "1/4", "1/3", "10/25", "1/2", "10/16", "10/13", "1", "13/10", "16/10", "2", "25/10", "3", "4", "5", "6", "8", "10", "13", "15", "20", "25", "30"];
var isoArr = ["100", "125", "160", "200", "250", "320", "400", "500", "640", "800", "1000", "1250", "1600", "2000", "2500", "3200", "4000", "5000", "6400"];
var intervalArr = ["0.5", "0.6", "0.7", "0.8", "0.9", "1", "1.5", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "35", "40", "45", "50", "55", "60"];

var intervalIndex = 0;
var intervalInterval = 1;
var intervalShots = 250;
var intervalStarted = false;
var intervalPaused = false;

function updateValue(elem, delta) {
	currentValue = getFieldInt(elem);
	newValue = currentValue + delta;
	if(newValue >= 0)
		$("#" + elem).val(newValue).change();
}

function updateArray(elem, arr, delta) {
	currentIndex = arr.indexOf($("#" + elem).val());
	if(currentIndex == -1)
		currentIndex = 0;
	
	newIndex = currentIndex + delta;
	$("#" + elem).val(arr[newIndex in arr ? newIndex : currentIndex]).change();
}

function updateTime() {
	time = getFieldFloat("delay") + (getFieldFloat("interval") * getFieldFloat("count"));
	$("#time").val(zeroFill(Math.floor(time/3600), 2) + ":" + zeroFill(Math.floor((time%3600)/60), 2) + ":" + zeroFill(time%60, 2));
}

function getInterval() {
	$.getJSON("/api/interval/refresh", function(data) {
		$("#delay").val(data.delay);
		$("#interval").val(data.interval);
		$("#count").val(data.shots);
        intervalIndex = data.index;
        intervalStarted = data.started;
        intervalPaused = data.paused;
        showIntervalButtons();
        updateTime();
	});
}

function showIntervalButtons() {
    $("#startBtn").css("display", !intervalStarted && !intervalPaused ? "inline" : "none");
    $("#stopBtn").css("display", intervalStarted ? "inline" : "none");
    $("#pauseBtn").css("display", intervalStarted && !intervalPaused ? "inline" : "none");
    $("#resumeBtn").css("display", intervalStarted && intervalPaused ? "inline" : "none");
}

function startInterval() {
    if(!intervalStarted) {
        $.post("/api/interval/start", {
            delay: $("#delay").val(),
            interval: $("#interval").val(),
            shots: $("#count").val()
        })
        .done(function(data) {
            if(data == 'OK') {
                intervalStarted = true;
                showIntervalButtons();
            }
        });
    }
}

function pauseInterval() {
    if(intervalStarted && !intervalPaused) {
        $.post("/api/interval/pause", {})
        .done(function(data) {
            if(data == 'OK') {
                intervalPaused = true;
                showIntervalButtons();
            }
        });
    }
}

function resumeInterval() {
    if(intervalStarted && intervalPaused) {
        $.post("/api/interval/resume", {})
        .done(function(data) {
            if(data == 'OK') {
                intervalPaused = false;
                showIntervalButtons();
            }
        });
    }
}

function stopInterval() {
    if(intervalStarted) {
        $.post("/api/interval/stop", {})
        .done(function(data) {
            if(data == 'OK') {
                intervalStarted = false;
                intervalPaused = false;
                showIntervalButtons();
            }
        });
    }
}

function getSettings() {
	$.getJSON("/api/settings/refresh", function(data) {
		$("#aperture").val(data.aperture);
		$("#shutter").val(data.speed);
		$("#iso").val(data.iso);
	});
}

function updateSettings() {
	$.post("/api/settings/set", {
		aperture: $("#aperture").val(),
		speed: $("#shutter").val(),
		iso: $("#iso").val()
	})
	.done(function(data) {
		if(data != 'OK')
			getSettings();
	});
}

function getStatus() {
	$.getJSON("/api/status/refresh", function(data) {
        intervalStarted = data.started;
        intervalPaused = data.paused;
        intervalInterval = data.interval;
        intervalIndex = data.index;
        intervalShots = data.shots;
        
        $("#status").val(intervalStarted ? (intervalPaused ? "Paused" : "Running") : "Idle");
        if(intervalStarted) {
            $("#count").val(intervalIndex);
            time = parseFloat(intervalInterval) * (parseInt(intervalShots) - parseInt(intervalIndex));
            $("#time").val(zeroFill(Math.floor(time/3600), 2) + ":" + zeroFill(Math.floor((time%3600)/60), 2) + ":" + zeroFill(time%60, 2));
        }
	});
}

function shutdown() {
    if(confirm('Quit RPi?')) {
        $.post("/api/status/shutdown", {})
        .done(function(data) {
            if(data == 'OK') {
            }
        });
    }
}

function getFieldInt(field) {
	return parseInt($("#" + field).val());
}

function getFieldFloat(field) {
	return parseFloat($("#" + field).val());
}

function zeroFill(number, width)
{
	width -= number.toString().length;
	if(width > 0)
		return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
	
	return number + "";
}