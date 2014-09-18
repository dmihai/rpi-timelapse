var intervalIndex = 0;
var intervalInterval = 1;
var intervalShots = 250;
var intervalStarted = false;
var intervalPaused = false;

function getInterval() {
	$.getJSON("/api/interval/refresh", {
        camera: cameraIndex
    })
    .done(function(data) {
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
            camera: cameraIndex,
            delay: $("#delay").val(),
            interval: $("#interval").val(),
            shots: $("#count").val(),
            shutter: $("#shutter").val()
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
        $.post("/api/interval/pause", {
            camera: cameraIndex
        })
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
        $.post("/api/interval/resume", {
            camera: cameraIndex
        })
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
        $.post("/api/interval/stop", {
            camera:cameraIndex
        })
        .done(function(data) {
            if(data == 'OK') {
                intervalStarted = false;
                intervalPaused = false;
                showIntervalButtons();
            }
        });
    }
}

function shutterChanged(value) {
    $("#shutter").val(value);
    $("#option_" + (value=="soft"?"hard":"soft")).removeClass("active");
    $("#option_" + value).addClass("active");
}