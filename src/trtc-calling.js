import TRTCCalling from 'trtc-calling-js'


let options = {
  SDKAppID: window.SITE_CONFIG['timSDKAppID'] // 接入时需要将 0 替换为您的云通信应用的 SDKAppID
};

const trtcCalling = new TRTCCalling(options)

// 4 无日志级别
trtcCalling.setLogLevel(0)

export default trtcCalling
