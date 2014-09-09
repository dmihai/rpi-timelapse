rpi-timelapse
=============

DSLR camera intervalometer for time lapse photography using Raspberry Pi. The plan is to run this in the field, so an usb external battery and a hotspot capable wi-fi dongle are required. You can connect multiple cameras to a single Raspberry Pi unit each through its own USB cable.

I recommend to follow this article: http://raspberry-at-home.com/hotspot-wifi-access-point/ for setting up the access point (also read the first comment by thomas). The interface can be accessed from any mobile device connected to the RPi hotspot by pointing a browser to RPi ip address on port 80 (ex: http://192.134.3.1).

Features
--------

- Simple web interface for controlling the camera
- Multiple camera support
- View and change exposure parameters (shutter speed, aperture, iso)
- View histogram of last photo taken

Prerequisites
-------------

- libgphoto2 (for the latest version: https://github.com/gonzalo/gphoto2-updater)
- ImageMagick (installation: sudo apt-get install imagemagick)
- node.js (installation instructions: https://learn.adafruit.com/raspberry-pi-hosting-node-red/setting-up-node-dot-js)
