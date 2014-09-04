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