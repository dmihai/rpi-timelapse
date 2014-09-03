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