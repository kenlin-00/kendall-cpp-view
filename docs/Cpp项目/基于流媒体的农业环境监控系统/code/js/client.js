
'use strict';

const mediaStreamContrains = {
    video: true
};

const localVideo = document.querySelector('video');

function gotLocalMediaStream(mediaStream){
    localVideo.srcObject = mediaStream;
}

function handleLocalMediaStreamError(error){
    console.log('navigator.getUserMedia error: ', error);
}

// JavaScript 代码中首先执行 getUserMedia() 方法
navigator.mediaDevices.getUserMedia(mediaStreamContrains).then(
    gotLocalMediaStream
).catch(
    handleLocalMediaStreamError
);



//判断浏览器是否支持这些 API
if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
  console.log("enumerateDevices() not supported.");
  return;
}

// 枚举 cameras and microphones.
navigator.mediaDevices.enumerateDevices()
.then(function(deviceInfos) {

  //打印出每一个设备的信息
  deviceInfos.forEach(function(deviceInfo) {
    console.log(deviceInfo.kind + ": " + deviceInfo.label +
                " id = " + deviceInfo.deviceId);
  });
})
.catch(function(err) {
  console.log(err.name + ": " + err.message);
});