import TIM from 'tim-js-sdk'
import TIMUploadPlugin from 'tim-upload-plugin'

// 初始化 SDK 实例
let options = {
  SDKAppID: window.SITE_CONFIG['timSDKAppID'] // 接入时需要将 0 替换为您的云通信应用的 SDKAppID
};
console.log('tim SDKAppID:', options)

const tim = TIM.create(options)

window.setLogLevel = tim.setLogLevel

// 无日志级别
tim.setLogLevel(4)

// 注册 cos
tim.registerPlugin({ 'tim-upload-plugin':TIMUploadPlugin })
export default tim
