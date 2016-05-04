var gphoto2 = require('gphoto2');
var Camera = require('./camera');
var Interval = require('./interval');
var Slider = require('./slider');

module.exports = {
    getRequestCameraIndex: function(req, camArr) {
        if(req.query.camera !== undefined)
            return req.query.camera;
        if(req.body.camera !== undefined)
            return req.body.camera;
        return 0;
    },
    getRequestCamera: function(req, camArr) {
        return camArr[this.getRequestCameraIndex(req, camArr)];
    },
    refreshCameras: function(camArr, slider, io) {
        var gPhoto = new gphoto2.GPhoto2();
        var commonObj = this;
        
        gPhoto.list(function (list) {
            var camera, found;
            var i, j;
            
            // removes old cameras
            while(commonObj.removeCamera(camArr, list)) {}
            
            // adds new cameras
            for(i = 0; i < list.length; i++) {
                // check if camera already exists
                found = false;
                for(j = 0; j < camArr.length; j++) {
                    if(commonObj.checkCameras(list[i], camArr[j].camera)) {
                        found = true;
                    }
                }
                
                if(!found) {
                    camArr.push(commonObj.newCamera(list[i], slider, io));
                }
            }
            
            // add default camera
            if(camArr.length == 0) {
                camArr.push(commonObj.newCamera(null, slider, io));
            }
            
            // refresh camera index
            for(i = 0; i < camArr.length; i++) {
                camArr[i].index = i;
            }
        });
    },
    removeCamera: function(camArr, newList) {
        for(i = 0; i < camArr.length; i++) {
            found = false;
            for(j = 0; j < newList.length; j++) {
                if(this.checkCameras(newList[j], camArr[i].camera)) {
                    found = true;
                }
            }
            
            if(!found) {
                camArr.splice(i, 1);
                return true;
            }
        }
        
        return false;
    },
    checkCameras: function(cam1, cam2) {
        if(cam1 == null || cam2 == null)
            return false;
        
        return cam1.camera == cam2.camera && cam1.port == cam2.port;
    },
    newCamera: function(gPhotoCamera, slider, io) {
        camera = new Camera(gPhotoCamera);
        camera.interval = new Interval(camera);
        camera.slider = slider;
        camera.io = io;
        camera.getSettings();
        
        return camera;
    }
}