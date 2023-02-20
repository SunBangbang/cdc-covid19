<template>
  <div class="record-page">
    <div style="margin-bottom: 15px;">
      <el-button @click="startVideo" :disabled="videoStart" size="small">开始录制视频</el-button>
      <el-button @click="stopVideo" :disabled="!videoStart" size="small">停止录制视频</el-button>
      <el-button @click="startAudio" :disabled="audioStart" size="small">开始录制音频</el-button>
      <el-button @click="stopAudio" :disabled="!audioStart" size="small">停止录制音频</el-button>
    </div>
    <video controls autoplay playsinline ref="video" style="width: 400px; height: 300px; margin-top: 0px"></video>
  </div>
</template>

<script>
  import RecordRTC from 'recordrtc'
  export default {
    data() {
      return {
        video: null,
        videoStart: false,
        audioStart: false,
        recorder: null,
        userMedia: {audio: true, video: true},
        videoFormat: {
          mimeType: 'video/webm;codecs=h264',
          //fileExtension: 'webm'
        }
      }
    },
    mounted(){
      this.video = document.querySelector('video');
    },
    methods: {
      // 音频开始
      startAudio() {
        this.audioStart = true
        this.userMedia = {audio: true, video: false}
        this.videoFormat.fileExtension = 'mp3'
        this.$nextTick(() => {
          this.startRecording()
        })
      },
      // 音频停止
      stopAudio() {
        this.audioStart = false
        this.recorder.stopRecording(this.stopRecordingCallback);
      },
      // 视频开始
      startVideo() {
        this.videoStart = true;
        this.userMedia = {audio: true, video: true}
        this.videoFormat.fileExtension = 'webm'
        this.$nextTick(() => {
          this.startRecording()
        })
      },
      // 视频停止
      stopVideo() {
        this.videoStart = false;
        this.recorder.stopRecording(this.stopRecordingCallback);
      },
      // 开始录制视频/音频
      startRecording() {
        this.captureCamera((camera) => {
          this.video.muted = true;
          this.video.volume = 0;
          this.video.srcObject = camera;
          this.recorder = RecordRTC(camera, {
            type: 'video'
          });
          this.recorder.startRecording();
          // release camera on stopRecording
          this.recorder.camera = camera;
        });
      },
      // 录制
      captureCamera(callback) {
        navigator.mediaDevices.getUserMedia(this.userMedia).then(function (camera) {
          callback(camera);
        }).catch((error) => {
          this.$message.error('未找到视频设备');
        });
      },
      // 停止录制视频
      /*stopRecording() {
        this.recorder.stopRecording(this.stopRecordingCallback);
      },*/
      // 停止录制视频/音频回调
      stopRecordingCallback() {
        this.video.src = this.video.srcObject = null;
        this.video.muted = false;
        this.video.volume = 1;
        this.video.src = URL.createObjectURL(this.recorder.getBlob());
        // 保存至本地
        this.saveToDisk()

        this.recorder.camera.stop();
        this.recorder.destroy();
        this.recorder = null;
      },
      // 保存至本地
      saveToDisk() {
        let fileName = this.getFileName(this.videoFormat.fileExtension);

        let file = new File([this.recorder.getBlob()], fileName, {
          type: this.videoFormat.mimeType
        });
        RecordRTC.invokeSaveAsDialog(file, fileName)
      },
      // 设置文件名
      getFileName(fileExtension) {
        let d = new Date();
        let year = d.getUTCFullYear();
        let month = d.getUTCMonth();
        let date = d.getUTCDate();
        return 'RecordRTC-' + year + month + date + '-' + this.getRandomString() + '.' + fileExtension;
      },
      // 随机字符串
      getRandomString() {
        if (window.crypto && window.crypto.getRandomValues && navigator.userAgent.indexOf('Safari') === -1) {
          let a = window.crypto.getRandomValues(new Uint32Array(3)),
            token = '';
          for (let i = 0, l = a.length; i < l; i++) {
            token += a[i].toString(36);
          }
          return token;
        } else {
          return (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '');
        }
      }
    }
  }
</script>
<style scoped>

</style>
