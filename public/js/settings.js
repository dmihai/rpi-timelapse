function getSettings() {
	$.getJSON("/api/settings/refresh", {
        camera: cameraIndex
    })
    .done(function(data) {
		$("#aperture").val(data.aperture);
		$("#shutter").val(data.speed);
		$("#iso").val(data.iso);
        apertureArr = data.apertureArr;
        speedArr = data.speedArr;
        isoArr = data.isoArr;
        
        if(data.interval)
            $("#shootBtn").hide();
        else
            $("#shootBtn").show();
	});
}

function updateSettings() {
	$.post("/api/settings/set", {
        camera: cameraIndex,
		aperture: $("#aperture").val(),
		speed: $("#shutter").val(),
		iso: $("#iso").val()
	})
	.done(function(data) {
		if(data != 'OK')
			getSettings();
	});
}

function updateHistogram() {
    date = new Date();
    $("#histogram").attr("src", "/histo/camera_" + cameraIndex + ".png?" + date.getTime());
}

function testShoot() {
	$.post("/api/settings/shoot", {
        camera: cameraIndex,
	})
	.done(function(data) {
		if(data != 'OK')
			getSettings();
	});
}