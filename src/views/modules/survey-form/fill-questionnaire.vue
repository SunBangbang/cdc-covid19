<template>
  <div ref="mainWindow" id="mainWindow">
    <div class="fill-video"  v-bind:style="videoWindowStyle" v-if="videoVisible && !hideVideo" >
      <video controls autoplay playsinline ref="video" @dragend="dragVideoWindow" draggable="true"></video>
    </div>
    <el-row>
      <el-col>
        <div>
          <i class="el-icon-arrow-left back-button" @click="goBack">返回</i>
        </div>
      </el-col>
    </el-row>
  <div class="fill-container">
    <el-card>
        <el-row>
          <el-col :span="20">
            <template v-if="videoVisible">
              <el-button @click="showHideRecording" size="mini" v-if = "videoStart" >{{showHideText}}</el-button>
              <el-button icon="el-icon-video-camera-solid" @click="startVideo" v-if = "videoStart" size="mini">录像</el-button>
              <el-button icon="el-icon-video-pause" @click="stopVideo" v-if = "videoEnd" size="mini">停止录像</el-button>
              <el-button icon="el-icon-microphone" @click="startAudio" v-if="audioStart" size="mini">录音</el-button>
              <el-button icon="el-icon-video-pause" @click="stopAudio" v-if="audioEnd" size="mini">停止录音</el-button>
              <el-button icon="el-icon-view" @click="viewVideoAndAudio" size="mini">查看录制</el-button>
            </template>
            <span style="margin-left: 10px">
              语音识别语言：
              <el-select v-model="languageSelected" size="mini" filterable>
                <el-option v-for="(item, index) in language" :label="item.label" :value="item.value" :key="index">
                </el-option>
              </el-select>
            </span>

          </el-col>
          <el-col :span="4">
            <avue-select size="mini"
                         v-model="result.surveyFormId"
                         placeholder="请选择内容"
                         type="tree"
                         :clearable="false"
                         :dic="questionnaireOptions"
                         :props="{label: 'surveyName', value: 'oid'}"
                         @change="handleSelectChange">
            </avue-select>
          </el-col>

        </el-row>
    </el-card>
    <el-row class="fill-content">

      <div class="fill-form" id="tt">
          <json-to-form class="jsonToForm" v-if="jsonToFormVisible" :disabled.sync="disabled"
                        ref="jsonToForm"
                        @submit="handlePreviewSubmit"
                        @saveDraft="handleSaveDraft"></json-to-form>
        <!--<el-card>
          <avue-form ref="form"
                     :option="formJson.json"
                     v-model="result.data"
                     @submit="handlePreviewSubmit">
            <template slot-scope="scope" slot="menuForm">
              <el-button type="primary"
                         icon="el-icon-check"
                         size="small"
                         @click="saveDraft">保存草稿</el-button>
            </template>
          </avue-form>
        </el-card>-->
      </div>
      <div class="fill-directory">
        <div class="fill-directory-card" v-if="showCatalogue">
          <h3 style="text-align: center" v-if="catalogue.main.params">{{catalogue.main.params.html}}</h3>
          <el-collapse  v-if="catalogue.main" v-model="activeNames">
            <el-collapse-item v-for="(item, index) in catalogue.mainTitle" :key="index" :name="index" :title="item.params.html">
              <div slot="title" style="width: 100%; text-overflow:ellipsis;overflow:hidden;white-space:nowrap;">
                {{item.params.html}}
              </div>
              <el-row v-for="(it, ins) in catalogue['subTitle'+(index+1)]" :key="ins">
                <el-link @click="jump(it)"
                         v-if="it.display"
                         :underline="false">{{it.label}}</el-link>
              </el-row>
            </el-collapse-item>
          </el-collapse>
<!--           <el-row v-for="(item, index) in formJson.json.columns" :key="index">-->
<!--             <el-link v-if="item.type !== 'description' && item.params" @click="jump(item)">{{item.params.html}}</el-link>-->
<!--             <el-link v-else @click="jump(item)">{{item.label}}</el-link>-->
<!--           </el-row>-->
        </div>
      </div>
    </el-row>
    <fill-questionnaire-sign-dialog v-if="fillSignDialogVisible"
                                    ref="fillQuestionnaireSignDialog"
                                    @callback="fillSignCallback" >
    </fill-questionnaire-sign-dialog>
  </div>
    <slider div-id="tt"></slider>
    <media-list-dialog ref="mediaListDialog" v-if="mediaListDialogVisible"></media-list-dialog>
  </div>
</template>
<script>
  import { getReleaseFormJson as getFormJson } from '@/api/survey-form/questionnaire'
  import {getRelatedForm,getDetail} from '@/api/subject-task/task-management'
  import {saveAsDraft, submit, apiToken} from "@/api/survey-form/sample";
  import {uploadFile} from "@/api/oss";
  import RecordRTC from 'recordrtc'
  import FileTypeConstant from "@/utils/FileTypeConstant";
  import { getLoginUserInfo } from '@/api/user/user'
  import FillQuestionnaireSignDialog from './components/fill-questionnaire-sign-dialog'
  import JsonToForm from '@/components/form-design/form-json'
  import Loading from '@/utils/Loading'
  import moment from "moment"
  import MediaListDialog from './components/mediaListDialog'
  import Slider from "@/components/slider/up-bottom-slider"
  import AppConstant from "@/utils/AppConstant"

  export default {
    components: {
      Slider,
      FillQuestionnaireSignDialog,
      JsonToForm,
      MediaListDialog
    },
    data() {
      return {
        language: AppConstant.LANGUAGE,
        languageSelected: this.$store.state.languageSelected,
        showHideText: '显示录制窗口',
        videoWindowStyle: {
          left: "100px",
          top: "100px"
        },
        timeOutEvent: 0,
        maxHeight:0,
        nowHeight: 0,
        showCatalogue: false,
        activeNames: [],
        catalogue:{
          mainTitle:[],
        },
        questionnaireOptions: [],
        formJson: {
          json: {},
        },
        video: null,
        videoStart: true,
        videoEnd: false,
        audioStart: true,
        audioEnd: false,
        startTime: null, //开始录制时间
        recorder: null,
        userMedia: {audio: true, video: true},
        videoFormat: {
          mimeType: 'video/webm\;codecs=h264',
          fileExtension: 'mp4'
        },
        mediaListDialogVisible: false,
        result: {
          surveyFormId: '',
          taskId: '',
          audioNum: 0,
          // audioUris: [],
          videoNum: 0,
          // videoUris: [],
          mediaInfos: [],
          data: {},
          investigator: '调查员',
          source: 'pc'
          /*participant: '姓名',
          sex: '性别',
          identity: '身份证',
          investigator: '调查员',
          source: '来源'*/
        },
        fillSignDialogVisible: false,
        jsonToFormVisible: false,
        disabled: false,
        videoVisible:false,
        hideVideo : true,
        openMediaDevice: false, //浏览器是否开启摄像头麦克风权限,
        uuid: null,
        loadingInstance: null,
      }
    },
    created() {
      this.checkMediaDevice()
      this.loadApiToken()
      let taskId = this.$route.params.taskId
      let surveyFormId = this.$route.params.surveyFormId
      getDetail(taskId).then(res =>{
        if (res.data.code === 0) {
          console.log("getDetail()",res.data);
          this.fillSignDialogVisible=res.data.data.signRequired;
          this.videoVisible=res.data.data.videoRequired;
        }
      });
      this.init(taskId, surveyFormId)
    },
    updated(){
      this.video = document.querySelector('video');
    },
    watch: {
      languageSelected(newValue, oldValue) {
        console.log(this.$store.state.languageSelected, "languageSelected")
        this.$store.commit("languageSelected", newValue)
      }
  },
    mounted() {
      this.loadingInstance = new Loading('.fill-form')
    },
    methods: {
      goBack() {
        this.$router.go(-1);
      },
      init(taskId, surveyFormId) {
        this.result.taskId = taskId
        this.result.surveyFormId = surveyFormId
        // this.handleGetFormJson(surveyFormId)
        this.getQuestionnaireOptions(taskId)
        this.getUserInfo()
      },
      getUserInfo() {
        getLoginUserInfo().then(res => {
          this.result.investigator = res.data.data.realName
        })
      },
      // 获取formJson
      handleGetFormJson(surveyFormId) {
        getFormJson(surveyFormId).then(res => {
          if(res.data.code === 0) {
            let data = res.data.data
            if ((typeof data.json) === 'string') {
              data.json = JSON.parse(data.json)
            }
            this.formJson = data
            this.jsonToFormVisible = true
            this.$nextTick(() => {
              this.formJson.json.emptyBtn = true
              this.formJson.json.saveDraftBtn = true
              this.formJson.json.submitBtn = true
              this.formJson.json.rejectBtn = false
              this.$refs['jsonToForm'].taskId = this.result.taskId
              this.$refs['jsonToForm'].json = this.formJson.json
              this.$refs['jsonToForm'].init()
              this.$refs['jsonToForm'].visible = true
              let ix = 0
              this.catalogue['subTitle'+ix] = []
              this.formJson.json.column.forEach((item, index) => {
                if (index === 0) {
                  this.catalogue.main = item
                }else if (item.type !== 'description' && item.params) {
                  this.catalogue.mainTitle.push(item)
                  ix += 1
                  this.catalogue['subTitle'+ix] = []
                }else {
                  if (item.display) {
                    this.catalogue['subTitle'+ix].push(item)
                  }
                }
              })
              console.log(Object.assign({},this.catalogue))
              this.showCatalogue = true
              this.loadingInstance.close()
            })
          }else{
            console.error('err:', data.msg)
          }
        }).catch(() => {
          this.loadingInstance.close()
        })
      },
      // 获取任务关联的调查表
      getQuestionnaireOptions(taskId) {
        getRelatedForm(taskId).then(res => {
          this.questionnaireOptions = res.data.data
        })
      },
      // 保存草稿
      handleSaveDraft(form) {
        if(this.video){
          if(this.audioEnd){
            this.$message.warning('请停止录音！')
            return
          }
          if(this.videoEnd){
            this.$message.warning('请停止录像！')
            return
          }
        }
        console.log("form:",form);
        this.result.data = form
        this.disabled = true
        saveAsDraft(this.result, this.uuid).then(res => {
          if (res.data.code === 0) {
            this.$message.success('保存成功')
            this.$refs['jsonToForm'].clearForm()
            this.$store.state.contentTabs = this.$store.state.contentTabs.filter(item => item.name !== 'fill-questionnaire');
            this.$router.replace({name: 'survey-sample', params:{taskId:this.$route.params.taskId}});
          } else {
            this.$message.error(res.data.msg)
            this.$message.error({message: res.data.msg, duration: 5000})
          }
        }).catch(error => {
          this.loadApiToken()
          this.disabled = false
          console.log('error:', error)
        })
      },
      // 提交
      handlePreviewSubmit(form) {
        this.result.data = form
        this.result.source = "pc"
        console.log(this.result)
        // if(this.fillSignDialogVisible){
        //   this.$nextTick(() => {
        //     this.$refs['fillQuestionnaireSignDialog'].dialogVisible = true
        //     this.$refs['fillQuestionnaireSignDialog'].result = this.result
        //     this.$refs['fillQuestionnaireSignDialog'].taskId = this.$route.params.taskId
        //     if(this.video){
        //       this.$refs['fillQuestionnaireSignDialog'].audioOpen = this.audioEnd
        //       this.$refs['fillQuestionnaireSignDialog'].videoOpen = this.videoEnd
        //     }
        //   })
        // } else {
          if(this.video){
            if(this.audioEnd){
              this.$message.warning('请停止录音！')
              return
            }
            if(this.videoEnd){
              this.$message.warning('请停止录像！')
              return
            }
          }
          // if(this.videoVisible && this.result.mediaInfos.length === 0){
          //     this.$message.warning('请提交音频或视频！')
          //     return
          // }
          this.disabled = true
          submit(this.result, this.uuid).then(res => {
            if (res.data.code === 0) {
              this.$message.success('保存成功')
              this.$store.state.contentTabs = this.$store.state.contentTabs.filter(item => item.name !== 'fill-questionnaire');
              this.$router.replace({name: 'survey-sample', params:{taskId:this.$route.params.taskId}});
            } else {
              this.loadApiToken()
              this.disabled = false
              console.log('error:', res.data.msg)
              this.$message.error({message: res.data.msg, duration: 5000})
            }
          })
      },
      loadApiToken(){
        apiToken().then(res=>{
          if (res.data.code === 0) {
            this.uuid = res.data.data
          }
        });
      },
      // 选择调查表
      handleSelectChange(val) {
        this.result.surveyFormId = val
        this.jsonToFormVisible = false
        this.handleGetFormJson(val)
      },
      // 关闭成功页面回调
      fillSignCallback() {
        // 清空表单
        this.$refs['jsonToForm'].clearForm()
      },
      checkMediaDevice(){
        navigator.mediaDevices.getUserMedia = navigator.mediaDevices.getUserMedia ||
          navigator.mediaDevices.webkitGetUserMedia ||
          navigator.mediaDevices.mozGetUserMedia ||
          navigator.mediaDevices.msGetUserMedia;

        if(navigator.mediaDevices.getUserMedia){
          //支持调取摄像头麦克风
          this.openMediaDevice = true
        } else {
          //不支持调取摄像头麦克风
          this.supportMedia = false
          console.log('不支持调取摄像头麦克风')
        }
      },
      // 音频开始
      startAudio() {
        if(!this.video) {
          this.video = document.querySelector('video');
        }
        this.audioStart = false
        this.audioEnd = true
        this.videoStart = false
        this.videoEnd = false
        this.hideVideo = false

        this.userMedia = {audio: true, video: false}
        this.videoFormat.fileExtension = 'mp3'
        this.$nextTick(() => {
          this.startRecording()
        })
      },
      // 音频停止
      stopAudio() {
        this.audioStart = true
        this.audioEnd = false
        this.videoStart = true
        this.videoEnd = false

        this.recorder.stopRecording(this.stopRecordingCallback)
      },
      // 视频开始
      startVideo() {
        if(!this.video) {
          this.video = document.querySelector('video');
        }
        this.audioStart = false
        this.audioEnd = false
        this.videoStart = false
        this.videoEnd = true
        this.hideVideo = false

        this.userMedia = {audio: true, video: true}
        this.videoFormat.fileExtension = 'mp4'

        this.$nextTick(() => {
          this.startRecording()
        })
      },
      // 视频停止
      stopVideo() {
        this.audioStart = true
        this.audioEnd = false
        this.videoStart = true
        this.videoEnd = false

        this.recorder.stopRecording(this.stopRecordingCallback)
      },
      // 开始录制视频/音频
      startRecording() {
        this.captureCamera((camera) => {
          this.video.muted = true
          this.video.volume = 0
          this.video.srcObject = camera
          this.recorder = RecordRTC(camera, {
            type: 'video'
          })
          this.startTime = new Date()
          this.recorder.startRecording()
          // release camera on stopRecording
          this.recorder.camera = camera
        })
      },
      // 录制
      captureCamera(callback) {
        navigator.mediaDevices.getUserMedia(this.userMedia).then(function (camera) {
          callback(camera);
        }).catch((error) => {
          if(this.openMediaDevice) {
            this.$message.warning('请开启浏览器摄像头麦克风权限！')
            // window.open('chrome://settings/content')
          }else{
            this.$message.warning("浏览器不支持摄像头麦克风设备！")
          }
        });
      },
      // 停止录制视频/音频回调
      stopRecordingCallback() {
        this.video.src = this.video.srcObject = null
        this.video.muted = false
        this.video.volume = 1
        this.video.src = URL.createObjectURL(this.recorder.getBlob())
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

        let fileName = 'SurveyForm' + '.' + this.videoFormat.fileExtension;
        let file = new File([this.recorder.getBlob()], fileName, {
          type: this.videoFormat.mimeType
        })
        uploadFile(file, FileTypeConstant.SURVEY_FORM).then(res => {
          if(res.data.code === 0){
            if (null != res.data.data && res.data.data.length > 0) {
              res.data.data.forEach(v => {
                let mediaInfo = {}
                mediaInfo.mediaUrl = v.url
                mediaInfo.fid = v.fid ? v.fid : null
                mediaInfo.duration = Math.floor(duration)
                mediaInfo.createAt = moment(createAt).format('YYYY-MM-DD HH:mm:ss')
                if (this.videoFormat.fileExtension === 'mp4') {
                  // this.result.videoUris.push(v.url)
                  // this.result.videoNum = this.result.videoNum + 1
                  mediaInfo.type = 1
                  this.result.mediaInfos.push(mediaInfo)
                } else if (this.videoFormat.fileExtension === 'mp3') {
                  // this.result.audioUris.push(v.url)
                  // this.result.audioNum = this.result.audioNum + 1
                  mediaInfo.type = 0
                  this.result.mediaInfos.push(mediaInfo)
                }
              })
            }
          }else{
            console.error('err:', res.data.msg)
          }
        })
      },
      viewVideoAndAudio() {
        this.mediaListDialogVisible = true
        this.$nextTick(()=>{
          this.$refs.mediaListDialog.init(this.result.mediaInfos)
        })
      },
      showHideRecording () {
        if(this.hideVideo) {
          this.showHideText = "隐藏录制窗口"
          this.hideVideo = false
        } else{
          this.hideVideo = true
          this.showHideText = "显示录制窗口"
        }
      },
      dragVideoWindow(e) {
        e.preventDefault()
        let myWidth = 233;
        // let myWidth = 100;
        let myHeight = 250;
        // let myHeight = 0;
        let outerDivWidth = document.getElementById("mainWindow").offsetWidth;
        let outerDivHeight = window.screen.availHeight - document.getElementById("mainWindow").offsetTop - myHeight;
        if(e.clientX < myWidth/2) {
          this.videoWindowStyle.left = "0px"
        } else if(e.clientX > outerDivWidth){
          this.videoWindowStyle.left = outerDivWidth - myWidth +"px";
        } else {
          this.videoWindowStyle.left = e.clientX - (myWidth + 50) +"px"
        }
        if(e.clientY < myHeight/2) {
          this.videoWindowStyle.top = "0px";
        } else if(e.clientY > outerDivHeight) {
          this.videoWindowStyle.top = outerDivHeight - myHeight +"px";
        } else {
          this.videoWindowStyle.top = e.clientY - (myHeight / 2) + "px";
        }
      },

      // 锚点跳转
      jump(item) {
        console.log(item)
        let formElement = document.getElementsByClassName("fill-form")[0]
        let jump = document.getElementById('label_' +item.prop) || document.getElementById("el"+ item.prop );
        // 获取需要滚动的距离
        // Chrome
        formElement.scrollTop = jump.offsetTop;
        console.log(formElement, jump)

        /*// Chrome
        document.body.scrollTop = total;
        // Firefox
        document.documentElement.scrollTop = total;
        // Safari
        window.pageYOffset = total*/
      },
    },
    beforeDestroy() {
      this.$store.commit("regionSelectMap", null);
    },
  }
</script>
<style lang="scss" scoped>
  .back-button {
    padding: 10px;
    color: #00bfbf;
    cursor: pointer;
  }

  .fill-container {
    overflow: hidden;
    .fill-content {
      margin-top: 15px;
      .fill-form {
        flex: 1;
        .form-container {
          background-color: #fff;
          padding-bottom: 30%;
        }
      }
      >div {
        padding-left: 15px;
        &:first-child {
          padding-left: 0;
        }
      }
    }

  }
  .scroll-jump-father {
    top: 76vh;
    right: 14vw;
  }

</style>


