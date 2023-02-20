<template>
  <el-row class="bar-gel"
          style="margin-top: 10px"
          ref="mainWindow"
          id="mainWindow">
    <div class="fill-video"
         v-bind:style="videoWindowStyle"
         v-show="!hideVideo">
      <video controls
             autoplay
             playsinline
             ref="video"
             @dragend="dragVideoWindow"
             draggable="true"
             v-show="!hideVideo"></video>
    </div>

    <el-row>
      <el-col :span="4">
        <el-row>
          <p style="font-size: 16px; font-weight: bold; line-height: 32px"
             :style="styleObject">
            {{ bitTitle }}
          </p>
        </el-row>
      </el-col>

      <el-col :span="20">
        <el-row style="float: right">
          <el-row v-if="mode === 'read' && !hideButtonGroup">
            <el-button @click="changeFullOrCoreForm"
                       size="mini">{{
              showFormText
            }}</el-button>
            <el-button icon="el-icon-download"
                       size="mini"
                       @click="loginTencent"
                       v-if="hasReportFtl && !isLogin">登录</el-button>
            <!-- <el-button
              icon="el-icon-download"
              size="mini"
              @click="toAdd(0)"
              v-if="hasReportFtl && wordUrl === null && isLogin"
              >上传在线文档</el-button
            >
            <el-button
              icon="el-icon-download"
              size="mini"
              @click="openWord(0)"
              v-if="hasReportFtl && wordUrl !== null"
              >在线文档</el-button
            > -->
            <el-button icon="el-icon-plus"
                       size="mini"
                       @click="addMember"
                       v-if="isOwner && isLogin">添加协作成员</el-button>
            <el-button icon="el-icon-view"
                       size="mini"
                       @click="openWord(1)"
                       v-if="hasReportFtl && coreUrl !== null && isLogin">查看核心报告</el-button>
            <el-button icon="el-icon-view"
                       size="mini"
                       @click="openWord(2)"
                       v-if="hasReportFtl && baseUrl !== null && isLogin">查看全量报告</el-button>
            <el-dropdown style="margin-left: 10px">
              <el-button size="mini">
                更多<i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item>
                  <el-button icon="el-icon-download"
                             size="mini"
                             @click="handleDownload"
                             type="text">下载</el-button>

                </el-dropdown-item>

                <el-dropdown-item>
                  <el-button icon="el-icon-view"
                             @click="viewVideoAndAudio"
                             size="mini"
                             type="text">查看录制</el-button>
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-button icon="el-icon-download"
                             size="mini"
                             @click="exportEpidSpot"
                             type="text">导出疫点</el-button>
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-button icon="el-icon-map-location"
                             size="mini"
                             @click="handleMapView"
                             type="text">地图轨迹</el-button>
                </el-dropdown-item>
                <el-dropdown-item v-if="isMerge">
                  <el-button icon="el-icon-user"
                             size="mini"
                             @click="handleCloseContactView"
                             type="text">查看密接</el-button>
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-button icon="el-icon-download"
                             size="mini"
                             type="text"
                             @click="handCoreReport">
                    生成核心报告
                  </el-button>
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-button icon="el-icon-download"
                             size="mini"
                             type="text"
                             @click="handReport">
                    生成全量报告
                  </el-button>
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-button icon="el-icon-upload"
                             size="mini"
                             type="text"
                             @click="toAdd(1)"
                             v-if="hasReportFtl && isLogin">
                    上传核心报告
                  </el-button>
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-button icon="el-icon-upload"
                             size="mini"
                             type="text"
                             @click="toAdd(2)"
                             v-if="hasReportFtl && isLogin">
                    上传全量报告
                  </el-button>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </el-row>
          <el-row v-else-if="mode === 'edit' && !hideButtonGroup">
            <el-button @click="changeFullOrCoreForm"
                       size="mini">{{
              showFormText
            }}</el-button>
            <el-button @click="showHideRecording"
                       size="mini"
                       v-if="videoStart">{{ showHideText }}</el-button>
            <el-button icon="el-icon-video-camera-solid"
                       @click="startVideo"
                       v-if="videoStart"
                       size="mini">录像</el-button>
            <el-button icon="el-icon-video-pause"
                       @click="stopVideo"
                       v-if="videoEnd"
                       size="mini">停止录像</el-button>
            <el-button icon="el-icon-microphone"
                       @click="startAudio"
                       v-if="audioStart"
                       size="mini">录音</el-button>
            <el-button icon="el-icon-video-pause"
                       @click="stopAudio"
                       v-if="audioEnd"
                       size="mini">停止录音</el-button>
            <el-button icon="el-icon-view"
                       @click="viewVideoAndAudio"
                       size="mini">查看录制</el-button>
            <span style="margin-left: 10px">
              语音识别语言：
              <el-select v-model="languageSelected"
                         size="mini"
                         filterable
                         style="width: 25%; max-width: 100px">
                <el-option v-for="(item, index) in language"
                           :label="item.label"
                           :value="item.value"
                           :key="index"></el-option>
              </el-select>
            </span>
            <span v-if="formChangeAllow"
                  style="margin-left: 10px">
              当前表单：
              <el-select size="mini"
                         v-model="formId"
                         placeholder="请选择内容"
                         @change="handleSelectChange">
                <el-option v-for="item in questionnaireOptions"
                           :key="item.oid"
                           :label="item.surveyName"
                           :value="item.oid"
                           :clearable="false">
                </el-option>
              </el-select>
            </span>
          </el-row>
          <el-row v-else>
            <el-button @click="changeFullOrCoreForm"
                       size="mini">{{
              showFormText
            }}</el-button>
          </el-row>
        </el-row>
      </el-col>
    </el-row>
    <el-dialog :title="`上传${uploadType === 0 ? '在线报告' : uploadType === 1 ? '核心报告' : '全量报告'}至云文档`"
               :visible.sync="visible"
               width="40%"
               append-to-body>
      <avue-form :option="formOption"
                 ref="mapForm"
                 v-model="form">
        <template slot="file">
          <input id="inputElement"
                 type="file"
                 accept=".doc,.docx" />
        </template>
        <template slot="menuForm">
          <el-button :loading="submitStatus"
                     icon="el-icon-user"
                     type="primary"
                     @click="handleSubmit">提 交</el-button>
          <!--                    <el-button icon="el-icon-delete" @click="handleEmpty">清 空</el-button>-->
        </template>
      </avue-form>
    </el-dialog>

    <el-dialog title="添加协作成员"
               :visible.sync="memberVisible"
               width="40%"
               append-to-body>
      <el-row style="display: flex; flex-direction: column; align-items: center">
        <el-transfer v-model="existMember"
                     :data="transformData"
                     :titles="['待选列表', '已选列表']"></el-transfer>
        <el-button :loading="submitStatus"
                   type="primary"
                   @click="handleChangeMember"
                   size="mini"
                   style="margin-top: 25px">确认</el-button>
      </el-row>
    </el-dialog>

    <map-dialog ref="mapDialog"
                v-if="mapDialogVisible"></map-dialog>
    <closeContactDialog ref="closeContactDialog"
                        v-if="closeContactDialogVisible"></closeContactDialog>
    <media-list-dialog ref="mediaListDialog"
                       :formId="surveyFormId"
                       :sampleId="sampleId"
                       :canDel="mode === 'edit'"
                       @close="handleClose"
                       v-if="mediaListDialogVisible">
    </media-list-dialog>
  </el-row>
</template>

<script>
import {
  changeMember,
  getFileMember,
  getLoginStatus,
  getOpenId,
  getWordUrl,
  isOwner
} from '@/api/tencentWord/Word'
import { checkFormReportFtl } from '@/api/survey-form/questionnaire'
import Cookies from 'js-cookie'
import { mapGetters } from 'vuex'
import { getTrack, updateWordUrl } from '@/api/survey-form/sample'
import moment from 'moment'
import { getDetail, getRelatedForm } from '@/api/subject-task/task-management'
import AppConstant from '@/utils/AppConstant'
import RecordRTC from 'recordrtc'
import { uploadFile } from '@/api/oss'
import FileTypeConstant from '@/utils/FileTypeConstant'
import axios from 'axios'
import MapDialog from '@/views/modules/survey-form/components/map-dialog'
import CloseContactDialog from '@/views/modules/survey-form/components/close-contact-dialog'
import MediaListDialog from '@/views/modules/survey-form/components/mediaListDialog'
import sm4Utils from '@/utils/sm4'

export default {
  name: 'button-group-bar',
  components: {
    MapDialog,
    CloseContactDialog,
    MediaListDialog
  },
  props: {
    wordUrl: {
      type: String,
      default: () => {
        return null
      }
    },
    coreUrl: {
      type: String,
      default: () => {
        return null
      }
    },
    baseUrl: {
      type: String,
      default: () => {
        return null
      }
    },
    fileId: {
      type: String,
      default: () => {
        return null
      }
    },
    surveyFormId: {
      type: String,
      required: true
    },
    sampleId: {
      type: String || null,
      default: () => {
        return null
      }
    },
    mode: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: false
    },
    isMerge: {
      type: Boolean,
      required: true
    },
    taskId: {
      type: String,
      required: true
    },
    mediaInfos: {
      type: Array,
      required: true
    },
    formChangeAllow: {
      type: Boolean,
      default: () => {
        return false
      }
    },
    hideButtonGroup: {
      type: Boolean,
      default: () => {
        return false
      }
    }
  },
  data() {
    return {
      styleObject: {
        color: '#F39826'
      },
      //是否已经登录腾讯文档
      isLogin: false,
      isOwner: false,
      hasReportFtl: false,
      places: null,
      mapDialogVisible: false,
      closeContactDialogVisible: false,
      visible: false,
      formOption: {
        size: 'mini',
        submitBtn: false,
        emptyBtn: false,
        column: [
          {
            label: '上传文件',
            prop: 'file',
            formslot: true,
            span: 23
          }
        ]
      },
      questionnaireOptions: [],
      formId: null,
      form: {},
      submitStatus: false,
      memberVisible: false,
      transformData: [],
      existMember: [],
      userId: null,
      // 录制音视频 -----start
      openMediaDevice: false,
      supportMedia: false,
      hideVideo: true,
      showHideText: '显示录制窗口',
      videoStart: true,
      videoWindowStyle: {
        left: '100px',
        top: '100px'
      },
      language: AppConstant.LANGUAGE,
      languageSelected: this.$store.state.languageSelected,
      video: null,
      videoEnd: false,
      videoVisible: true,
      audioStart: true,
      audioEnd: false,
      startTime: null, //开始录制时间
      recorder: null,
      userMedia: { audio: true, video: true },
      videoFormat: {
        mimeType: 'video/webm;codecs=h264',
        fileExtension: 'mp4'
      },
      mediaListDialogVisible: false,
      // 录制音视频 -----end
      readDocLoginTimer: null,
      isPause: false,
      //
      isShowCoreForm: true,
      showFormText: '显示全量调查表',
      uploadType: 0 // 0:在线文档   1:核心报告  2:全量报告
    }
  },
  created() {
    this.formId = this.surveyFormId

    if (this.isShowCoreForm) {
      this.styleObject.color = '#F39826'
    } else {
      this.styleObject.color = '#16B5C7'
    }
    if (this.mode === 'read') {
      this.loginStatusCheck()
      this.ftlCheck()
      if (this.fileId) this.ownerCheck()
    }
    if (this.mode === 'edit') {
      this.mediaDeviceCheck()
    }
    if (this.formChangeAllow) {
      this.getQuestionnaireOptions(this.taskId)
    }
  },
  mounted() {
    this.readDocLoginTimer = setInterval(() => {
      let val = localStorage.getItem('loginDoc')
      this.isLogin = val && eval(val)
      console.log('============>>>-----', this.isLogin)
    }, 2000)
    this.$refs.video.addEventListener('pause', this.handlePause)
    this.$refs.video.addEventListener('play', this.handlePlay)
  },
  beforeDestroy() {
    clearInterval(this.readDocLoginTimer)
  },
  watch: {
    baseUrl(nV, oV) {
      console.log('Nv', nV)
      console.log('ov', oV)
    },
    wordUrl(nV, oV) {
      console.log('w-Nv', nV)
      console.log('w-ov', oV)
    },
    isLogin(nV, oV) {
      console.log('l-Nv', nV)
      console.log('l-ov', oV)
    }
  },
  methods: {
    loginStatusCheck() {
      getLoginStatus(this.$store.state.user.name).then((res) => {
        if (res.data.code === 0) {
          this.isLogin = eval(res.data.data)
          console.log('============>>>', this.isLogin)
          localStorage.setItem('loginDoc', this.isLogin)
        } else {
          console.error('failed to get tencent token, err:', res.data.msg)
        }
      })
    },
    ownerCheck() {
      isOwner(this.fileId, this.$store.state.user.name).then((res) => {
        console.log(this.isOwner, '3333333333', res.data)
        this.isOwner = res.data
      })
    },
    ftlCheck() {
      checkFormReportFtl(this.surveyFormId).then((res) => {
        if (res.data.code === 0) {
          this.hasReportFtl = res.data.data
        }
      })
    },
    mediaDeviceCheck() {
      try {
        navigator.mediaDevices.getUserMedia =
          navigator.mediaDevices.getUserMedia ||
          navigator.mediaDevices.webkitGetUserMedia ||
          navigator.mediaDevices.mozGetUserMedia ||
          navigator.mediaDevices.msGetUserMedia

        if (navigator.mediaDevices.getUserMedia) {
          //支持调取摄像头麦克风
          this.supportMedia = true
          this.openMediaDevice = true
        } else {
          //不支持调取摄像头麦克风
          this.supportMedia = false
          console.log('不支持调取摄像头麦克风')
        }
      } catch (error) {
        this.supportMedia = false
        console.log(error)
      }
    },

    upload(file) {
      this.submitStatus = true
      let param = new FormData() // 创建form对象
      param.append('file', file) // 通过append向form对象添加数据
      param.append('userName', this.$store.state.user.name)
      param.append('isCore', this.uploadType === 1)

      let config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: 'Bearer ' + Cookies.get('access_token')
        }
      }
      let url = '/tencentWord/importFile'

      axios
        .post(`${window.SITE_CONFIG['apiURL']}${url}`, param, config)
        .then((res) => {
          this.submitStatus = false
          console.log(res)
          if (this.$store.state.cryptoOpen) {
            let tmpData = sm4Utils.decrypt(res.data, this.$store.state.key)
            res.data = JSON.parse(tmpData)
          }
          if (res.data.ret === 0) {
            this.$message.success('上传成功')
            this.visible = false
            this.getWordUrlAddress(res.data.data.progressQueryID)
            // if (this.uploadType === 0 || this.uploadType === 2) {
            //   this.getWordUrlAddress(res.data.data.progressQueryID);
            // } else {
            //   this.$emit("refreshData", {});
            // }
          } else {
            console.error(res.data.msg)
            if (res.data.msg.indexOf('10301') !== -1) {
              this.$message.error('请先登录')
            } else {
              this.$message.error(res.data.msg)
            }
          }
        })
    },
    getWordUrlAddress(progressQueryID) {
      setTimeout(() => {
        getWordUrl(progressQueryID, this.$store.state.user.name).then(
          (res1) => {
            if (res1.data.data.url) {
              updateWordUrl(
                this.sampleId,
                this.surveyFormId,
                res1.data.data.url,
                res1.data.data.ID,
                progressQueryID
              ).then(() => {
                this.$emit('changeWordData', {
                  wordUrl: res1.data.data.url,
                  fileId: res1.data.data.ID,
                  uploadType: this.uploadType
                })
              })
            } else {
              this.getWordUrlAddress(progressQueryID)
            }
          }
        )
      }, 2000)
    },
    /// 点击打印
    handlePrint() {
      this.questionnairePrintDialogVisible = true
      this.$nextTick(() => {
        this.$refs['questionnairePrintDialog'].dialogVisible = true
        this.$refs['questionnairePrintDialog'].formJson = this.formJson.json
        this.$refs['questionnairePrintDialog'].formData = this.data
      })
    },
    handleChangeMember() {
      let users = []
      this.existMember.forEach((item) => {
        if (item !== this.userId) {
          users.push(item)
        }
      })
      changeMember(this.fileId, users, this.$store.state.user.name).then(
        (res) => {
          if (res.data.code === 0) {
            this.$message.success('操作成功')
            this.memberVisible = false
          } else {
            console.error('err:', res.data.msg)
            this.$message.error('操作失败:' + res.data.msg)
          }
        }
      )
    },
    // 音频开始
    startAudio() {
      if (!this.video) {
        this.video = document.querySelector('video')
      }
      this.audioStart = false
      this.audioEnd = true
      this.videoStart = false
      this.videoEnd = false
      this.hideVideo = false

      this.userMedia = { audio: true, video: false }
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
      if (!this.video) {
        this.video = document.querySelector('video')
      }
      this.audioStart = false
      this.audioEnd = false
      this.videoStart = false
      this.videoEnd = true
      this.hideVideo = false
      this.userMedia = { audio: true, video: true }
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
      this.showHideText = '隐藏录制窗口'
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
    handlePause() {
      console.log('pause')
      if (this.recorder && !this.isPause) {
        this.recorder.pauseRecording()
        this.isPause = true
      }
    },
    handlePlay() {
      console.log('play')
      if (this.recorder && this.isPause) {
        this.recorder.resumeRecording()
        this.isPause = false
      }
    },
    // 录制
    captureCamera(callback) {
      navigator.mediaDevices
        .getUserMedia(this.userMedia)
        .then(function (camera) {
          callback(camera)
        })
        .catch((error) => {
          if (this.openMediaDevice) {
            console.log(error)
            this.$message.warning(error)
            // window.open('chrome://settings/content')
          } else {
            this.$message.warning('浏览器不支持摄像头麦克风设备！')
          }
        })
    },
    // 停止录制视频/音频回调
    stopRecordingCallback() {
      this.video.src = this.video.srcObject = null
      this.video.muted = false
      this.video.volume = 1
      this.video.src = URL.createObjectURL(this.recorder.getBlob())
      // 上传服务器
      this.uploadVideo()

      this.recorder.camera.stop()
      this.recorder.destroy()
      this.recorder = null
    },
    // 上传服务器
    uploadVideo() {
      let endTime = new Date()
      let duration = (endTime.getTime() - this.startTime.getTime()) / 1000
      let createAt = this.startTime

      let fileName = 'SurveyForm' + '.' + this.videoFormat.fileExtension
      let file = new File([this.recorder.getBlob()], fileName, {
        type: this.videoFormat.mimeType
      })
      uploadFile(file, FileTypeConstant.SURVEY_FORM).then((res) => {
        if (res.data.code === 0) {
          if (null != res.data.data && res.data.data.length > 0) {
            res.data.data.forEach((v) => {
              let mediaInfo = {}
              mediaInfo.mediaUrl = v.url
              mediaInfo.fid = v.fid ? v.fid : null
              mediaInfo.duration = Math.floor(duration)
              mediaInfo.createAt = moment(createAt).format(
                'YYYY-MM-DD HH:mm:ss'
              )
              if (this.videoFormat.fileExtension === 'mp4') {
                // this.result.videoUris.push(v.url)
                // this.result.videoNum = this.result.videoNum + 1
                mediaInfo.type = 1
                console.log(this.data)
                this.mediaInfos.push(mediaInfo)
              } else if (this.videoFormat.fileExtension === 'mp3') {
                // this.result.audioUris.push(v.url)
                // this.result.audioNum = this.result.audioNum + 1
                mediaInfo.type = 0
                console.log(this.data)
                this.mediaInfos.push(mediaInfo)
              }
            })
            this.$emit('changeMediaInfos', this.mediaInfos)
          }
        } else {
          console.error('err:', res.data.msg)
        }
      })
    },
    viewVideoAndAudio() {
      if (!!this.mediaInfos && this.mediaInfos.length > 0) {
        this.mediaListDialogVisible = true
        this.$nextTick(() => {
          this.$refs.mediaListDialog.init(this.mediaInfos)
        })
      } else {
        this.$message.info('没有音视频数据！')
      }
    },
    handleClose() {
      this.mediaListDialogVisible = false
    },
    showHideRecording() {
      if (this.hideVideo) {
        this.showHideText = '隐藏录制窗口'
        this.hideVideo = false
      } else {
        this.hideVideo = true
        this.showHideText = '显示录制窗口'
      }
    },
    dragVideoWindow(e) {
      e.preventDefault()
      let myWidth = 233
      // let myWidth = 100;
      let myHeight = 250
      // let myHeight = 0;
      let outerDivWidth = document.getElementById('mainWindow').offsetWidth
      let outerDivHeight =
        window.screen.availHeight -
        document.getElementById('mainWindow').offsetTop -
        myHeight
      if (e.clientX < myWidth / 2) {
        this.videoWindowStyle.left = '0px'
      } else if (e.clientX > outerDivWidth) {
        this.videoWindowStyle.left = outerDivWidth - myWidth + 'px'
      } else {
        this.videoWindowStyle.left = e.clientX - (myWidth + 50) + 'px'
      }
      if (e.clientY < myHeight / 2) {
        this.videoWindowStyle.top = '0px'
      } else if (e.clientY > outerDivHeight) {
        this.videoWindowStyle.top = outerDivHeight - myHeight + 'px'
      } else {
        this.videoWindowStyle.top = e.clientY - myHeight / 2 + 'px'
      }
    },
    //导出疫点数据
    exportEpidSpot() {
      let trackData = this.relationData.tracks
      let epidData = []
      if (trackData && trackData.length > 0) {
        epidData = trackData.filter((d) => d.epidSpot && d.epidSpot === '0')
      }
      if (epidData && epidData.length > 0) {
        epidData.forEach((item) => {
          item.start = item.start ? item.start.substring(0, 16) : ''
          item.end = item.end ? item.end.substring(0, 16) : ''
        })
        console.log('epidSpotData:', epidData)
        let opt = {
          title: '疫点',
          column: [
            { label: '开始时间', prop: 'start' },
            { label: '结束时间', prop: 'end' },
            { label: '地点', prop: 'address' }
          ]
        }
        this.$Export.excel({
          title: opt.title || new Date().getTime(),
          columns: opt.column,
          data: epidData
        })
      } else {
        this.$message.info('没有疫点数据！')
      }
    },
    // 下载
    handleDownload() {
      let access_token = Cookies.get('access_token')
      let downloadUri =
        window.SITE_CONFIG['apiURL'] +
        '/survey/sample/download/doc' +
        '?' +
        `id=${this.sampleId}` +
        `&` +
        `surveyFormId=${this.surveyFormId}` +
        `&access_token=${access_token}`
      window.location.href = downloadUri
    },
    // 地址展示
    handleMapView() {
      getTrack(this.sampleId, this.surveyFormId).then((res) => {
        if (res.data.code === 0) {
          this.places = res.data.data
        } else {
          this.$message.error(res.data.msg)
        }

        let markers = []
        this.places.forEach((v) => {
          let item = {
            position: [v.longitude, v.latitude],
            infoTitle: v.formattedAddress
          }
          if (v.start) {
            item.infoBody = moment(v.start).format('YYYY-MM-DD HH:mm')
            if (v.end) {
              item.infoBody += '至' + moment(v.end).format('YYYY-MM-DD HH:mm')
            }
          }
          markers.push(item)
        })
        this.mapDialogVisible = true
        this.$nextTick(() => {
          this.$refs.mapDialog.markers = markers
          this.$refs.mapDialog.mapVisible = markers.length > 0
          this.$refs.mapDialog.dialogVisible = true
        })
      })
    },
    //查看密接
    handleCloseContactView() {
      this.closeContactDialogVisible = true
      this.$nextTick(() => {
        this.$refs.closeContactDialog.dialogVisible = true
        this.$refs.closeContactDialog.sampleId = this.sampleId
        this.$refs.closeContactDialog.search = {
          taskIds: this.taskId,
          sampleId: this.sampleId
        }
        this.$refs.closeContactDialog.init()
      })
    },
    handCoreReport() {
      let access_token = Cookies.get('access_token')
      let downloadUri =
        window.SITE_CONFIG['apiURL'] +
        '/survey/sample/download/customCoreDoc' +
        '?' +
        `id=${this.sampleId}` +
        `&` +
        `surveyFormId=${this.surveyFormId}` +
        `&access_token=${access_token}`
      window.location.href = downloadUri
    },
    //下载流调报告
    handReport() {
      let access_token = Cookies.get('access_token')
      let downloadUri =
        window.SITE_CONFIG['apiURL'] +
        '/survey/sample/download/customDoc' +
        '?' +
        `id=${this.sampleId}` +
        `&` +
        `surveyFormId=${this.surveyFormId}` +
        `&access_token=${access_token}`
      window.location.href = downloadUri
    },
    // 在线编辑
    openWord(type = 0) {
      const useUrl =
        type === 0 ? this.wordUrl : type === 1 ? this.coreUrl : this.baseUrl
      window.open(useUrl)
    },
    // 登录在线文档
    loginTencent() {
      window.open(`#/login-doc/${this.$store.state.user.name}`, '_blank')
    },
    // 上传在线文档
    toAdd(type = 0) {
      this.visible = true
      this.uploadType = type
      $('#inputElement').replaceWith(
        '<input id="inputElement" type="file" style="" accept=".xls">'
      )
    },
    // 添加协作成员
    async addMember() {
      this.transformData = []
      this.existMember = []

      //获取已有协作成员列表
      let memRes = await getFileMember(this.fileId, this.$store.state.user.name)
      if (memRes.data.code === 0) {
        this.existMember.push(...memRes.data.data)
      } else {
        console.error('err:', memRes.data.msg)
        this.$message.error('操作失败:' + memRes.data.msg)
        return
      }

      const taskId = this.taskId
      let res = await getDetail(taskId)
      if (res.data.code === 0) {
        const members = res.data.data.investigators
        for (const item of members) {
          if (this.validatenull(item.openId)) {
            let resp = await getOpenId(item.id)
            if (!this.validatenull(resp.data.data)) {
              item.openId = resp.data.data
            } else {
              console.warn(
                'user ',
                item.realName,
                '(',
                item.username,
                ') has not an openId.'
              )
            }
          }

          if (item.username === this.$store.state.user.name) {
            //当前用户已经是协作成员
            this.transformData.push({
              key: item.id,
              label: item.realName,
              disabled: true
            })
            this.userId = item.id
            this.existMember.push(item.id)
          } else {
            this.transformData.push({
              key: item.id,
              label: item.realName,
              //用户存在openId则允许添加，否则禁止添加
              disabled: this.validatenull(item.openId)
            })
          }
        }
        console.log('watch members:', this.existMember, this.transformData)
        this.memberVisible = true
      } else {
        console.error('err:', res.data.msg)
        this.$message.error('操作失败:' + res.data.msg)
      }
    },

    handleSubmit() {
      let inputElement = document.getElementById('inputElement')

      let file = inputElement.files[0]
      console.log(file)
      if (!file) {
        this.$message.error('请选择上传文件!')
        return
      }
      console.log(file)
      if (!file.name.endsWith('doc') && !file.name.endsWith('docx')) {
        this.$message.error('请上传word文件!')
        return
      }
      this.upload(file)
    },
    handleSelectChange() {
      console.log('formId=', this.formId)
      this.$emit('reloadForm', this.formId)
    },
    // 获取任务关联的调查表
    getQuestionnaireOptions(taskId) {
      getRelatedForm(taskId).then((res) => {
        this.questionnaireOptions = res.data.data
      })
    },
    checkVideoStatus() {
      if (this.video) {
        if (this.audioEnd) {
          this.$message.warning('请停止录音！')
        }
        if (this.videoEnd) {
          this.$message.warning('请停止录像！')
        }
        return !this.audioEnd && !this.videoEnd
      } else {
        return true
      }
    },
    changeFullOrCoreForm() {
      this.isShowCoreForm = !this.isShowCoreForm
      if (this.isShowCoreForm) {
        this.styleObject.color = '#F39826'
        this.showFormText = '显示全量调查表'
      } else {
        this.showFormText = '显示核心信息表'
        this.styleObject.color = '#16B5C7'
      }
      this.$emit('changeFullOrCoreForm', this.isShowCoreForm)
    }
  },
  computed: {
    ...mapGetters(['relationData']),
    bitTitle() {
      console.log('mode:', this.mode)
      if (this.isShowCoreForm && this.mode === 'audit') {
        return '核心信息调查表'
      } else if (!this.isShowCoreForm && this.mode === 'audit') {
        return '全量信息调查表'
      } else if (this.mode !== 'audit' && this.title) {
        if (this.isShowCoreForm) {
          if (this.title === '查看协查问卷') {
            return '查看协查核心信息表'
          } else if (this.title === '编辑协查问卷') {
            return '编辑协查核心信息表'
          } else {
            return '填写协查核心信息表'
          }
        } else {
          if (this.title === '查看协查问卷') {
            return '查看协查全量调查表'
          } else if (this.title === '编辑协查问卷') {
            return '编辑协查全量调查表'
          } else {
            return '填写协查全量调查表'
          }
        }
        // return this.title;
      } else if (this.mode !== 'audit' && !this.title && this.isShowCoreForm) {
        return '核心信息调查表'
      } else {
        return '全量信息调查表'
      }

      // return this.mode === "audit"
      //   ? "问卷审核"
      //   : this.title
      //   ? this.title
      //   : "问卷详情";
    }
  }
}
</script>

<style scoped>
.bar-gel {
  width: 100%;
  height: 50px;
  background: white;
  padding: 10px;
  border-radius: 5px;
  line-height: 15px;
}
</style>
