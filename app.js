var express = require('express');
var bodyParser = require('body-parser');
var gpio = require('rpi-gpio');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var camArr = [];

var config = require('./config');
var common = require('./common');
var slider = new (require('./slider'))();
var intervalRoute = require('./routes/interval')(camArr);
var settingsRoute = require('./routes/settings')(camArr);
var statusRoute = require('./routes/status')(camArr, slider, io);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

console.log('App started');

// serve static pages in /public dir
app.use(express.static(__dirname + '/public'));

app.post('/api/interval/start', intervalRoute.start);
app.post('/api/interval/stop', intervalRoute.stop);
app.post('/api/interval/pause', intervalRoute.pause);
app.post('/api/interval/resume', intervalRoute.resume);
app.get('/api/interval/refresh', intervalRoute.refresh);

app.post('/api/settings/set', settingsRoute.set);
app.get('/api/settings/refresh', settingsRoute.refresh);
app.post('/api/settings/shoot', settingsRoute.shoot);

app.get('/api/status/refresh', statusRoute.refresh);
app.get('/api/status/cameras', statusRoute.cameras);
app.get('/api/status/addCamera', statusRoute.addCamera);
app.post('/api/status/shutdown', statusRoute.shutdown);
app.post('/api/status/motor', statusRoute.motor);

io.on('connection', function(socket) {
    socket.on('motor', function(msg) {
        slider.move(msg.dir, 120, null);
    });
});

gpio.setup(config.shutterFocusPin, gpio.DIR_OUT, function(err) {
    if(err) throw err;
});

gpio.setup(config.shutterReleasePin, gpio.DIR_OUT, function(err) {
    if(err) throw err;
});

gpio.setup(config.sliderPinLeft, gpio.DIR_OUT, function(err) {
    if(err) throw err;
});

gpio.setup(config.sliderPinRight, gpio.DIR_OUT, function(err) {
    if(err) throw err;
});

gpio.setup(config.sliderLimitPin, gpio.DIR_IN, function(err) {
    if(err) throw err;
});

// start server
server.listen(80);

common.refreshCameras(camArr, slider, io);