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
        $("#mtime").val(data.mtime);
        $("#mdelay").val(data.mdelay);
        
        intervalIndex = data.index;
        intervalStarted = data.started;
        intervalPaused = data.paused;
        
        optionChanged('histogram', data.histogram);
        optionChanged('slider', data.slider);
        optionChanged('mdirection', data.mdirection);
        optionChanged('shutter', data.shutter);
        
        displayControl("shutter", data.hasCamera);
        
        checkFields();
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
            shutter: $("#shutter").val(),
            histogram: $("#histogram").val(),
            slider: $("#slider").val(),
            mdirection: $("#mdirection").val(),
            mtime: $("#mtime").val(),
            mdelay: $("#mdelay").val()
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

function optionChanged(option, value) {
    $("#" + option).val(value);
    $("input[id^='" + option + "_'].active").removeClass("active");
    $("#" + option + "_" + value).addClass("active");
    
    checkFields();
}

function checkFields() {
    var hasSlider = $("#slider").val() == '1';
    var isHardShutter = $("#shutter").val() == 'hard';
    
    displayControl("histogram", !isHardShutter);
    displayControl("mdirection", hasSlider);
    displayControl("mtime", hasSlider);
    displayControl("mdelay", hasSlider && isHardShutter);
}

function displayControl(field, show) {
    if(show)
        $("#" + field + "_control").show();
    else
        $("#" + field + "_control").hide();
}
