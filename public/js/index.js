const presetting = new Presetting();
presetting.init();

// setup logging stuffs
TRTC.Logger.setLogLevel(TRTC.Logger.LogLevel.INFO);
TRTC.Logger.enableUploadLog();

TRTC.getDevices()
  .then(devices => {
    devices.forEach(item => {
      console.log('device: ' + item.kind + ' ' + item.label + ' ' + item.deviceId);
    });
  })
  .catch(error => console.error('getDevices error observed ' + error));

// populate camera options
TRTC.getCameras().then(devices => {
  devices.forEach(device => {
    if (!cameraId) {
      cameraId = device.deviceId;
    }
    let div = $('<div></div>');
    div.attr('id', device.deviceId);
    div.html(device.label);
    div.appendTo('#camera-option');
  });
});

// populate microphone options
TRTC.getMicrophones().then(devices => {
  devices.forEach(device => {
    if (!micId) {
      micId = device.deviceId;
    }
    let div = $('<div></div>');
    div.attr('id', device.deviceId);
    div.html(device.label);
    div.appendTo('#mic-option');
  });
});
