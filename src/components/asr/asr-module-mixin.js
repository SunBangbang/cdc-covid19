import RecordRTC from "recordrtc"
import {uploadFile} from "@/api/oss"
import FileTypeConstant from "@/utils/FileTypeConstant"

export default {

  data(){
    return {
      audioStart: false,
      audioEnd: true,
      showAsr: false,
      recorder: null,
      audioUploadResult: {
        surveyFormId: '',
        taskId: '',
        audioNum: 0,
        mediaInfos: [],
        data: {},
      },
    }
  },
  methods: {
    showAsrChange(openOrClose,onlyOpenOrClose) {
      // if (itemIndex) {
      //   this.currFormIndex = itemIndex
      // }
      if (onlyOpenOrClose) {
        this.showAsr = openOrClose
      } else {
        if (openOrClose) {
          this.startAudio()
        } else {
          this.stopAudio()
        }
      }
    },
    // 音频开始
    startAudio() {
      this.audioStart = true
      this.audioEnd = false
      this.recorder = null
      this.$nextTick(() => {
        this.startRecording()
      })
    },
    // 音频停止
    stopAudio() {
      this.audioStart = false
      this.audioEnd = true
      this.recorder.stopRecording(this.stopRecordingCallback)
    },
    // 开始录制音频
    startRecording() {
      this.captureCamera((camera) => {
        this.recorder = RecordRTC(camera, {
          type: 'video',
          mimeType: 'video/webm;codecs=h264',
          sampleRate: 16000
        })
        this.startTime = new Date()
        this.recorder.startRecording()
        // release camera on stopRecording
        this.recorder.camera = camera
      })
    },
    // 录制
    captureCamera(callback) {
      navigator.mediaDevices.getUserMedia({audio: true, video: false}).then(function (camera) {
        callback(camera);
      }).catch((error) => {
        if(this.openMediaDevice) {
          this.$message.warning('请开启浏览器摄像头麦克风权限！')
        }else{
          this.$message.warning("浏览器不支持摄像头麦克风设备！")
        }
      });
    },
    // 停止录制视频/音频回调
    stopRecordingCallback() {
      // 上传服务器
      this.upload()

      this.recorder.camera.stop()
      this.recorder.destroy()
      this.recorder = null
    },
    // 上传服务器
    upload() {
      let endTime = new Date()
      let duration = (endTime.getTime() - this.startTime.getTime()) /1000
      let createAt = this.startTime

      let fileName = 'speech'+ new Date().getTime() + '.webm'
      let file = new File([this.recorder.getBlob()], fileName, {
        type: 'video/webm;codecs=h264'
      })
      let that = this
      uploadFile(file, FileTypeConstant.QUESTIONNAIRE_AUDIO).then(res => {
        if(res.data.code === 0){
          if (null != res.data.data && res.data.data.length > 0) {
            res.data.data.forEach(v => {
              let mediaInfo = {}
              mediaInfo.mediaUrl = v.url
              mediaInfo.fid = v.fid ? v.fid : null
              mediaInfo.duration = Math.floor(duration)
              mediaInfo.createAt = moment(createAt).format('YYYY-MM-DD HH:mm:ss')
              mediaInfo.name = v.name
              mediaInfo.type = 0
              this.audioUploadResult.mediaInfos.push(mediaInfo)
            })
            console.log(this.audioUploadResult.mediaInfos)
            let mediaUrl = this.audioUploadResult.mediaInfos[this.audioUploadResult.mediaInfos.length -1].mediaUrl
            let idx = mediaUrl.substring(0, mediaUrl.lastIndexOf('/')).lastIndexOf('/')
            let voiceFile = mediaUrl.substring(idx+1)
            //希望是如此，如： 19e0219c-1872-4b99-84e6-fe1b4be27d3a/speech1653529797573.wav
            getSpeechText(voiceFile, this.$store.state.languageSelected).then(res => {
              if(res.data.code === 0){
                // that.form[that.currFormIndex] += res.data.data
                let speechText = res.data.data ? res.data.data : ''
                that.value.detailedAddress = speechText
                that.showAsrChange(false, true)
              }else{
                console.error('err:', res.data.msg)
              }
            })
          }
        }else{
          console.error('err:', res.data.msg)
        }
      })
    }
  }

}
