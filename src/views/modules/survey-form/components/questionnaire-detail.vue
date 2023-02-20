<template>
  <div id="mainWindow">
    <div class="fill-video"
         v-bind:style="videoWindowStyle"
         v-if="!hideVideo">
      <video controls
             autoplay
             playsinline
             ref="video"
             @dragend="dragVideoWindow"
             draggable="true"
             v-if="!hideVideo"></video>
    </div>

    <div class="questionnaire-container">
      <div class="header-top">
        <el-row>
          <el-col>
            <div>
              <i class="el-icon-arrow-left back-button"
                 @click="goBack">返回</i>
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-card v-if="canEdit">
            <template v-if="videoVisible">
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
            </template>
            <span style="margin-left: 10px">
              语音识别语言：
              <el-select v-model="languageSelected"
                         size="mini"
                         filterable>
                <el-option v-for="(item, index) in language"
                           :label="item.label"
                           :value="item.value"
                           :key="index">
                </el-option>
              </el-select>
            </span>
            <span style="font-size: 16px; font-weight: bolder; margin-left: 8%">
              问卷编辑
            </span>
          </el-card>
          <el-card class="right-menu right-btns"
                   v-if="!viewAudit">
            <el-button @click="changeFullOrCoreForm"
                       size="mini">{{
              showFormText
            }}</el-button>

            <!--        <el-button class="fr gap" icon="el-icon-download" size="mini" @click="exportEpidSpot">导出疫点</el-button>-->

            <!-- <el-button
              class="fr gap"
              icon="el-icon-download"
              size="mini"
              @click="openWord(0)"
              v-if="hasReportFtl && wordUrl !== null"
              >在线查看/编辑文档</el-button
            > -->
            <el-button class=" gap"
                       icon="el-icon-download"
                       size="mini"
                       @click="loginTencent"
                       v-if="!isLogin && hasReportFtl">登录</el-button>
            <div v-else
                 class=" gap"
                 style="display: inline-block">
              <!-- <el-button
                class="fr gap"
                icon="el-icon-download"
                size="mini"
                @click="toAdd(0)"
                v-if="hasReportFtl && wordUrl === null"
                >上传在线文档</el-button
              > -->
              <el-button style="margin-left: 10px"
                         class=" gap"
                         icon="el-icon-plus"
                         size="mini"
                         @click="addMember"
                         v-if="isOwner">
                添加协作成员
              </el-button>
              <el-button style="margin-left:10px"
                         icon="el-icon-view"
                         size="mini"
                         @click="openWord(1)"
                         v-if="hasReportFtl && coreUrl !== null && isLogin">
                查看核心报告
              </el-button>
              <el-button icon="el-icon-view"
                         size="mini"
                         @click="openWord(1)"
                         v-if="hasReportFtl && baseUrl !== null && isLogin">
                查看全量报告
              </el-button>
            </div>
            <el-dropdown style="margin-left: 10px">
              <el-button size="mini">
                更多<i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">

                <el-dropdown-item>
                  <el-button class=""
                             icon="el-icon-download"
                             size="mini"
                             type="text"
                             @click="handleDownload">下载</el-button>
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-button class=" gap"
                             icon="el-icon-map-location"
                             size="mini"
                             type="text"
                             @click="handleMapView">地图轨迹</el-button>
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-button class=" gap"
                             icon="el-icon-user"
                             size="mini"
                             type="text"
                             @click="handleCloseContactView"
                             v-if="isMerge">查看密接</el-button>
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
            <!--        <el-button class="fr" style="margin: 0 20px" icon="el-icon-printer" size="mini" @click="handlePrint">打印</el-button>-->
          </el-card>
          <el-card class="right-menu"
                   v-if="viewAudit && auditAttachIds !== null">
            <el-button class="fr"
                       icon="el-icon-download"
                       size="mini"
                       @click="downloadAuditAttach">
              个案报告
            </el-button>
            <el-button class="fr"
                       @click="changeFullOrCoreForm"
                       size="mini">{{
              showFormText
            }}</el-button>
            <div class="title-view"
                 :style="styleObject">{{ bitTitle }}</div>
          </el-card>
        </el-row>
      </div>

      <div class="page-container">
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

        <el-dialog :title="addMemberTitle"
                   :visible.sync="memberVisible"
                   width="40%"
                   append-to-body
                   class="add-member-dialog">
          <div class="add-member-box">
            <el-transfer v-model="existMember"
                         :data="transformData"></el-transfer>
            <div class="btn-box">
              <el-button :loading="submitStatus"
                         icon="el-icon-user"
                         type="primary"
                         size="mini"
                         @click="handleChangeMember">确 认</el-button>
            </div>
          </div>
        </el-dialog>

        <map-dialog ref="mapDialog"
                    v-if="mapDialogVisible"></map-dialog>
        <closeContactDialog ref="closeContactDialog"
                            v-if="closeContactDialogVisible"></closeContactDialog>
        <!--表单-->
        <el-row class="questionnaire-content"
                style="height: calc(81vh - 34px)">
          <div class="questionnaire-form"
               id="tt">
            <div style="margin-bottom: 10%">
              <json-to-form ref="jsonToForm"
                            v-if="jsonToFormVisible"
                            :disabled.sync="disabled"
                            @submit="handlePreviewSubmit"
                            @saveDraft="saveDraft"
                            :isShowCoreForm="isShowCoreForm"></json-to-form>
              <el-row v-if="!draftButtonVisible"
                      class="sign-box">
                <el-col v-if="formData.signUrl"
                        class="content">
                  <p class="sign-name">个人签名：</p>
                  <el-image style="width: 300px; height: 225px"
                            :src="formData.signUrl">
                  </el-image>
                </el-col>
              </el-row>
            </div>
          </div>
          <!--目录-->
          <div class="questionnaire-directory">
            <div class="questionnaire-directory-card"
                 v-if="showCatalogue"
                 style="margin-bottom: 10%">
              <h3 style="text-align: center"
                  v-if="catalogue.main.params">
                {{ catalogue.main.params.html }}
              </h3>
              <el-collapse v-if="catalogue.main"
                           v-model="activeNames">
                <el-collapse-item v-for="(item, index) in catalogue.mainTitle"
                                  :key="index"
                                  :name="index"
                                  :title="item.params.html">
                  <div slot="title"
                       style="
                      width: 100%;
                      text-overflow: ellipsis;
                      overflow: hidden;
                      white-space: nowrap;
                    ">
                    {{ item.params.html }}
                  </div>
                  <el-row v-for="(it, ins) in catalogue['subTitle' + (index + 1)]"
                          :key="ins">
                    <el-link @click="jump(it)"
                             v-if="it.display"
                             :underline="false">{{ it.label }}</el-link>
                  </el-row>
                </el-collapse-item>
              </el-collapse>
            </div>
          </div>
        </el-row>
      </div>
    </div>
    <up-bottom-slider :div-id="formContainer" />
    <media-list-dialog ref="mediaListDialog"
                       v-if="mediaListDialogVisible"></media-list-dialog>
  </div>
</template>
<script>
import CloseContactDialog from './close-contact-dialog'
import MapDialog from './map-dialog'
import {
  getReleaseFormJson as getFormJson,
  checkFormReportFtl
} from '@/api/survey-form/questionnaire'
import {
  getSample,
  getQuestions,
  submit,
  saveAsDraft,
  apiToken,
  getTrack,
  updateWordUrl
} from '@/api/survey-form/sample'
import JsonToForm from '@/components/form-design/form-json/index'
import Cookies from 'js-cookie'
import Loading from '@/utils/Loading'
import moment from 'moment'
import axios from 'axios'
import {
  getWordUrl,
  getFileMember,
  changeMember,
  isOwner,
  getLoginStatus,
  getOpenId
} from '@/api/tencentWord/Word'
import { getDetail } from '@/api/subject-task/task-management'
import UpBottomSlider from '@/components/slider/up-bottom-slider'
import { mapGetters } from 'vuex'
import RecordRTC from 'recordrtc'
import { uploadFile } from '@/api/oss'
import FileTypeConstant from '@/utils/FileTypeConstant'
import AppConstant from '@/utils/AppConstant'
import MediaListDialog from '@/views/modules/survey-form/components/mediaListDialog'
import {
  getAttachment,
  getAttachments
} from '@/api/survey-form/reported_sample'
import sm4Utils from '@/utils/sm4'

export default {
  components: {
    // QuestionnairePrintDialog,
    JsonToForm,
    MapDialog,
    CloseContactDialog,
    UpBottomSlider,
    MediaListDialog
  },
  data() {
    return {
      videoWindowStyle: {
        left: '100px',
        top: '100px'
      },
      language: AppConstant.LANGUAGE,
      languageSelected: this.$store.state.languageSelected,
      video: null,
      videoStart: true,
      videoEnd: false,
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
      showHideText: '显示录制窗口',
      memberVisible: false,
      hideVideo: true,
      openMediaDevice: false, //浏览器是否开启摄像头麦克风权限,
      videoVisible: true,
      showCatalogue: false,
      activeNames: [],
      catalogue: {
        mainTitle: []
      },
      isLogin: false,
      formContainer: 'tt',
      wordUrl: null,
      coreUrl: null,
      baseUrl: null,
      fileID: null,
      form: {},
      isOwner: false,
      title: '上传至云文档',
      addMemberTitle: '添加协作成员',
      transformData: [],
      existMember: [],
      id: '', //样本id
      surveyFormId: '', //样本对应的表单id
      taskId: '', //任务id
      formJson: {
        //表单格式
        json: {}
      },
      viewAudit: false, //是否浏览审核记录，true->是，false->否
      auditAttachIds: null, //上报审核附件ID
      userId: null,
      disabled: true,
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
      submitStatus: false,
      formData: {}, //配置数据
      data: {}, //表单数据
      mediaInfos: [],
      questionnairePrintDialogVisible: false, //打印
      draftButtonVisible: false, //签名
      jsonToFormVisible: false, //表单内容
      uuid: null,
      loading: true,
      loadingInstance: null,
      mapDialogVisible: false,
      places: [],
      closeContactDialogVisible: false,
      hasReportFtl: false, //调查表是否有报告导出模板文件
      canEdit: false, //是否可以编辑
      isMerge: false, //是否是合并调查记录
      isShowCoreForm: true,
      showFormText: '显示全量调查表',
      styleObject: {
        color: '#F39826'
      },
      readDocLoginTimer: null,
      uploadType: 0 // 0:在线文档   1:核心报告  2:全量报告
    }
  },
  created() {
    this.loadApiToken()
    this.auditAttachIds = this.$route.query.auditAttachIds
      ? this.$route.query.auditAttachIds
      : null

    this.id = this.$route.params.id
    this.surveyFormId = this.$route.params.surveyFormId
    console.log('watch params:', this.$route.params)
    let operation = this.$route.params.operation
    if (operation === 'view') {
      this.canEdit = false
    } else if (operation === 'edit') {
      this.canEdit = true
    } else if (operation === 'viewAudit') {
      this.canEdit = false
      this.viewAudit = true
    } else {
      this.canEdit = false
    }
    this.checkMediaDevice()
    // this.init(this.$route.params.id, this.$route.params.surveyFormId)
    console.log('view params:', this.$route.params)
    if (this.isShowCoreForm) {
      this.styleObject.color = '#F39826'
    } else {
      this.styleObject.color = '#16B5C7'
    }
  },
  updated() {
    this.video = document.querySelector('video')
  },
  activated() {
    this.loading = true
    this.loadingInstance = new Loading('.questionnaire-content')
    this.auditAttachIds = this.$route.query.auditAttachIds

    this.id = this.$route.params.id
    this.surveyFormId = this.$route.params.surveyFormId
    this.init(this.$route.params.id, this.$route.params.surveyFormId)
    let operation = this.$route.params.operation
    if (operation === 'view') {
      this.canEdit = false
    } else if (operation === 'edit') {
      this.canEdit = true
    } else if (operation === 'viewAudit') {
      this.canEdit = false
      this.viewAudit = true
    } else {
      this.canEdit = false
    }
    this.jsonToFormVisible = false
  },
  mounted() {
    // this.loadingInstance = new Loading('.questionnaire-content')
    this.readDocLoginTimer = setInterval(() => {
      let val = localStorage.getItem('loginDoc')
      this.isLogin = val && eval(val)
    }, 2000)
  },
  beforeDestroy() {
    clearInterval(this.readDocLoginTimer)
  },
  computed: {
    ...mapGetters(['relationData']),
    bitTitle() {
      console.log('mode:', this.mode)
      if (this.isShowCoreForm) {
        return '核心信息调查表'
      } else {
        return '全量信息调查表'
      }
    }
  },
  watch: {
    loading: {
      handler(val) {
        if (!this.loading) {
          this.loadingInstance.close()
        }
      }
    },
    languageSelected(newValue, oldValue) {
      console.log(this.$store.state.languageSelected, 'languageSelected')
      this.$store.commit('languageSelected', newValue)
    },
    isLogin(nV, oV) {
      console.log('isLogin:', this.isLogin)
    }
  },
  filters: {
    truncate(str) {
      if (str && str.length > 15) {
        return str.substring(0, 15) + '...'
      } else {
        return str
      }
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1)
    },
    changeFullOrCoreForm() {
      this.loading = true
      this.isShowCoreForm = !this.isShowCoreForm

      if (this.isShowCoreForm) {
        this.showFormText = '显示全量调查表'
        this.styleObject.color = '#F39826'
        this.$nextTick(() => {
          this.$refs['jsonToForm'].json = this.formJson.json
          this.$refs['jsonToForm'].form = this.data
          this.$refs['jsonToForm'].add = false
          this.$refs['jsonToForm'].visible = true
          this.$refs['jsonToForm'].init()
        })
      } else {
        this.showFormText = '显示核心信息表'
        this.styleObject.color = '#16B5C7'
        this.$nextTick(() => {
          this.$refs['jsonToForm'].json = this.formJson.json
          this.$refs['jsonToForm'].form = this.data
          this.$refs['jsonToForm'].add = false
          this.$refs['jsonToForm'].visible = true
          this.$refs['jsonToForm'].init()
        })
      }
      this.setCatalogue(this.isShowCoreForm)
      // this.$emit("changeFullOrCoreForm", this.isShowCoreForm);
      this.$forceUpdate()
      this.loading = false
    },
    //下载审核上报附件
    downloadAuditAttach() {
      const params = {
        attachIds: this.auditAttachIds
      }
      getAttachments(params).then((res) => {
        if (res.data.code === 0) {
          let list = res.data.data
          //下载附件
          list.forEach((f) => {
            let urlArr = f.url.split('/')
            urlArr[urlArr.length - 1] = encodeURIComponent(urlArr.pop())
            window.open(urlArr.join('/'))
          })
        } else {
          console.error('err:', res.data.msg)
        }
      })
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
            if (
              res1.data.data.url !== undefined &&
              res1.data.data.url !== null
            ) {
              if (this.uploadType === 1) {
                this.coreUrl = res1.data.data.url
              } else {
                this.wordUrl = res1.data.data.url
                this.baseUrl = this.wordUrl
              }
              this.fileID = res1.data.data.ID
              this.isOwner = true
              if (this.wordUrl != null || this.coreUrl !== null) {
                updateWordUrl(
                  this.id,
                  this.surveyFormId,
                  res1.data.data.url,
                  this.fileID,
                  progressQueryID
                ).then((res2) => {})
              }
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
      changeMember(this.fileID, users, this.$store.state.user.name).then(
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
      navigator.mediaDevices
        .getUserMedia(this.userMedia)
        .then(function (camera) {
          callback(camera)
        })
        .catch((error) => {
          if (this.openMediaDevice) {
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
          }
        } else {
          console.error('err:', res.data.msg)
        }
      })
    },
    viewVideoAndAudio() {
      this.mediaListDialogVisible = true
      this.$nextTick(() => {
        console.log(this.data)
        this.$refs.mediaListDialog.init(this.mediaInfos)
      })
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
    checkMediaDevice() {
      navigator.mediaDevices.getUserMedia =
        navigator.mediaDevices.getUserMedia ||
        navigator.mediaDevices.webkitGetUserMedia ||
        navigator.mediaDevices.mozGetUserMedia ||
        navigator.mediaDevices.msGetUserMedia

      if (navigator.mediaDevices.getUserMedia) {
        //支持调取摄像头麦克风
        this.openMediaDevice = true
      } else {
        //不支持调取摄像头麦克风
        console.log('不支持调取摄像头麦克风')
      }
    },
    addMember() {
      this.transformData = []
      this.existMember = []
      const taskId = this.formData.taskId
      getDetail(taskId).then((res) => {
        const members = res.data.data.investigators
        members.forEach((item) => {
          if (item.username === this.$store.state.user.name) {
            this.transformData.push({
              key: item.id,
              label: item.realName,
              disabled: true
            })
            this.userId = item.id
            this.existMember.push(item.id)
          } else if (item.openId === null) {
            getOpenId(item.id).then((res) => {
              if (res.data.data === null) {
                this.transformData.push({
                  key: item.id,
                  label: item.realName,
                  disabled: true
                })
              } else {
                this.transformData.push({
                  key: item.id,
                  label: item.realName
                })
              }
            })
          } else {
            this.transformData.push({
              key: item.id,
              label: item.realName
            })
          }
        })
        getFileMember(this.fileID, this.$store.state.user.name).then((res1) => {
          this.existMember.push(...res1.data.data)
          this.memberVisible = true
        })
      })
    },
    toAdd(type = 0) {
      this.visible = true
      this.uploadType = type
      $('#inputElement').replaceWith(
        '<input id="inputElement" type="file" style="" accept=".xls">'
      )
    },
    handleCloseContactView() {
      this.closeContactDialogVisible = true
      this.$nextTick(() => {
        this.$refs.closeContactDialog.dialogVisible = true
        this.$refs.closeContactDialog.sampleId = this.id
        this.$refs.closeContactDialog.search = {
          taskIds: this.taskId,
          sampleId: this.id
        }
        this.$refs.closeContactDialog.init()
      })
    },
    openWord(type = 0) {
      const useUrl =
        type === 0 ? this.wordUrl : type === 1 ? this.coreUrl : this.baseUrl
      window.open(useUrl)
    },
    loginTencent() {
      const userID = this.$store.state.user.name
      const wordUrl =
        window.SITE_CONFIG['wordUrl'] + '/covid19-admin/tencentWord/getToken'
      const encodeUrl = encodeURIComponent(wordUrl)

      localStorage.setItem('tecentRedirectUrl', window.location.href)
      // let url = 'http://localhost:8001/#/dashbord/dashbord'

      let url =
        'https://docs.qq.com/oauth/v2/authorize?client_id=' +
        window.SITE_CONFIG['tencentClientId'] +
        '&redirect_uri=' +
        encodeUrl +
        '&response_type=code&scope=all&state=' +
        userID
      window.open(url)
    },
    handCoreReport() {
      let access_token = Cookies.get('access_token')
      let downloadUri =
        window.SITE_CONFIG['apiURL'] +
        '/survey/sample/download/customCoreDoc' +
        '?' +
        `id=${this.id}` +
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
        `id=${this.id}` +
        `&` +
        `surveyFormId=${this.surveyFormId}` +
        `&access_token=${access_token}`
      window.location.href = downloadUri
    },
    // 地址展示
    handleMapView() {
      getTrack(this.id, this.surveyFormId).then((res) => {
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
        // console.log('markers:', markers)
        this.mapDialogVisible = true
        this.$nextTick(() => {
          this.$refs.mapDialog.markers = markers
          this.$refs.mapDialog.mapVisible = markers.length > 0
          this.$refs.mapDialog.dialogVisible = true
        })
      })
    },
    //导出疫点数据
    exportEpidSpot() {
      let trackData = this.relationData.tracks
      let epidData = []
      if (trackData && trackData.length > 0) {
        epidData = trackData.filter((d) => d.epidSpot && d.epidSpot === '0')
      }
      console.log('epidSpotData:', epidData)
      if (epidData && epidData.length > 0) {
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
    // 点击下载
    handleDownload() {
      let access_token = Cookies.get('access_token')
      let downloadUri =
        window.SITE_CONFIG['apiURL'] +
        '/survey/sample/download/doc' +
        '?' +
        `id=${this.id}` +
        `&` +
        `surveyFormId=${this.surveyFormId}` +
        `&access_token=${access_token}`
      window.location.href = downloadUri
    },
    // 锚点跳转
    jump(item) {
      let formElement = document.getElementsByClassName('questionnaire-form')[0]
      let jump =
        document.getElementById('label_' + item.prop) ||
        document.getElementById('el' + item.prop)
      // 获取需要滚动的距离
      // Chrome
      formElement.scrollTop = jump ? jump.offsetTop : 0

      /*// Chrome
        document.body.scrollTop = total;
        // Firefox
        document.documentElement.scrollTop = total;
        // Safari
        window.pageYOffset = total*/
    },
    // 表单是否允许修改
    allowChange() {
      // 可编辑状态
      if (this.canEdit) {
        this.formJson.json.emptyBtn = true
        this.formJson.json.submitBtn = true
        this.formJson.json.saveDraftBtn = true
        this.disabled = false
      } else {
        this.formJson.json.emptyBtn = false
        this.formJson.json.submitBtn = false
        this.formJson.json.saveDraftBtn = false
        this.disabled = true
      }
    },
    //准备数据 将表单数据和配置数据分开
    prepareData(res) {
      delete res.data.data.createAt
      delete res.data.data.createBy
      delete res.data.data.deleted
      delete res.data.data.updateAt
      delete res.data.data.updateBy
      let data = {}
      let sample = {
        answerTime: res.data.data.answerTime,
        // "audioNum": res.data.data.audioNum,
        // "audioUris": res.data.data.audioUris,
        // "videoNum": res.data.data.videoNum,
        // "videoUris": res.data.data.videoUris,
        mediaInfos: res.data.data.mediaInfos,
        headUrl: res.data.data.headUrl,
        oid: res.data.data.oid,
        signUrl: res.data.data.signUrl,
        source: res.data.data.source,
        status: res.data.data.status,
        submitStatus: res.data.data.submitStatus,
        surveyFormId: res.data.data.surveyFormId,
        taskId: res.data.data.taskId,
        add: res.data.data.add
      }
      let sampleKeys = Object.keys(sample)
      Object.keys(res.data.data).forEach((key) => {
        if (!sampleKeys.includes(key)) {
          data[key] = res.data.data[key]
        }
      })
      //是否合并调查记录
      this.isMerge = sample.add
      this.taskId = sample.taskId

      return { data: data, sample: sample }
    },
    // 获取调查表数据
    handleGetFormData(id, surveyFormId) {
      this.loading = true
      this.wordUrl = null
      this.baseUrl = null
      this.coreUrl = null
      this.fileID = null
      getLoginStatus(this.$store.state.user.name).then((res) => {
        this.isLogin = res.data.data
        localStorage.setItem('loginDoc', this.isLogin)
      })
      getSample(id, surveyFormId).then((res) => {
        console.log('res===>', res)
        if (res.data.code === 0) {
          const data = this.prepareData(res)
          this.formData = data.sample
          if (res.data.data.tencentWordUrl !== undefined) {
            this.wordUrl = res.data.data.tencentWordUrl // 在线文档
            this.baseUrl = this.wordUrl // 全量报告
          }
          if (res.data.data.coreTencentWordUrl !== undefined) {
            this.coreUrl = res.data.data.coreTencentWordUrl // 核心报告
          }
          if (res.data.data.coreFileID !== undefined) {
            this.fileID = res.data.data.coreFileID
            isOwner(this.fileID, this.$store.state.user.name).then((res1) => {
              this.isOwner = res1.data
            })
          }
          let me = data.sample.mediaInfos ? data.sample.mediaInfos : []
          this.mediaInfos = Object.assign([], me)
          this.data = data.data
          getFormJson(surveyFormId)
            .then((res) => {
              if (res.data.code === 0) {
                let data = res.data.data
                if (typeof data.json === 'string') {
                  data.json = JSON.parse(data.json)
                }
                this.formJson = data
              } else {
                this.$message.error(data.msg)
              }
            })
            .then(() => {
              this.jsonToFormVisible = true
              this.$nextTick(() => {
                this.allowChange()
                this.$refs['jsonToForm'].taskId = this.formData.taskId
                //审核合并样本，更新时只保留提交按钮
                if (this.formData.status === AppConstant.AUDIT_MERGE_STATUS) {
                  this.formJson.json.emptyBtn = false
                  this.formJson.json.saveDraftBtn = false
                }
                this.$refs['jsonToForm'].json = this.formJson.json
                this.$refs['jsonToForm'].form = this.data
                this.$refs['jsonToForm'].add = false
                this.$refs['jsonToForm'].visible = true
                this.$refs['jsonToForm'].init()
                // this.catalogue = {
                //   mainTitle: []
                // };
                // let ix = 0;
                // this.catalogue["subTitle" + ix] = [];
                // this.formJson.json.column.forEach((item, index) => {
                //   if (index === 0) {
                //     this.catalogue.main = item;
                //   } else if (item.type !== "description" && item.params) {
                //     this.catalogue.mainTitle.push(item);
                //     ix += 1;
                //     this.catalogue["subTitle" + ix] = [];
                //   } else {
                //     this.catalogue["subTitle" + ix].push(item);
                //   }
                // });
                // this.showCatalogue = true;
                this.setCatalogue(this.isShowCoreForm)
                // console.log(Object.assign({},this.catalogue))
                this.$forceUpdate()
                this.loading = false
              })
            })
        } else {
          console.error('err:', res.data.msg)
          this.loading = false
          if (res.data.code === 10049) {
            this.$message.warning(res.data.msg)
          }
        }
      })
    },
    setCatalogue(isCoreForm = true) {
      this.catalogue = {
        mainTitle: []
      }
      let ix = 0
      this.catalogue['subTitle' + ix] = []
      if (isCoreForm) {
        this.formJson.json.column.forEach((item, index) => {
          if (index === 0) {
            this.catalogue.main = item
          } else if (
            item.type !== 'description' &&
            item.params &&
            item.coreItem
          ) {
            this.catalogue.mainTitle.push(item)
            ix += 1
            this.catalogue['subTitle' + ix] = []
          } else if (item.coreItem) {
            this.catalogue['subTitle' + ix].push(item)
          }
        })
      } else {
        this.formJson.json.column.forEach((item, index) => {
          if (index === 0) {
            this.catalogue.main = item
          } else if (item.type !== 'description' && item.params) {
            this.catalogue.mainTitle.push(item)
            ix += 1
            this.catalogue['subTitle' + ix] = []
          } else {
            this.catalogue['subTitle' + ix].push(item)
          }
        })
      }

      this.showCatalogue = true
    },
    init(id, surveyFormId) {
      this.handleGetFormData(id, surveyFormId)
      checkFormReportFtl(surveyFormId).then((res) => {
        if (res.data.code === 0) {
          if (res.data.data === true) {
            this.hasReportFtl = true
          } else {
            this.hasReportFtl = false
          }
        } else {
          console.log('error:', res.data.msg)
        }
      })
    },
    // 提交
    handlePreviewSubmit() {
      this.formData.oid = this.id
      this.formData.surveyFormId = this.surveyFormId
      this.formData.data = this.data
      this.disabled = true
      this.formData.mediaInfos = this.mediaInfos
      submit(this.formData, this.uuid).then((res) => {
        if (res.data.code === 0) {
          this.allowChange()
          this.$message.success('保存成功')

          //关闭选项卡
          this.$store.state.contentTabs = this.$store.state.contentTabs.filter(
            (item) =>
              item.name !== 'questionnaire-detail' &&
              item.name !== 'survey-sample'
          )
          this.$store.state.contentIsNeedRefresh = true
          this.$nextTick(() => {
            this.$router.replace({
              name: 'survey-sample',
              params: { taskId: this.formData.taskId, refresh: true }
            })
            this.$store.state.contentIsNeedRefresh = false
          })
        } else {
          this.loadApiToken()
          this.disabled = false
          console.log('error:', res.data.msg)
          this.$message.error({ message: res.data.msg, duration: 5000 })
        }
      })
    },
    loadApiToken() {
      apiToken().then((res) => {
        if (res.data.code === 0) {
          this.uuid = res.data.data
          this.$nextTick(() => {
            let formElement = document.getElementsByClassName(
              'aui-content__wrapper'
            )[0]
            formElement.scrollTop = 0
          })
        }
      })
    },
    // 保存草稿
    saveDraft(form) {
      this.formData.oid = this.id
      this.formData.mediaInfos = this.mediaInfos
      this.formData.surveyFormId = this.surveyFormId
      this.disabled = true
      this.formData.data = this.data
      console.log('this.formData:', this.formData)
      saveAsDraft(this.formData, this.uuid)
        .then((res) => {
          if (res.data.code === 0) {
            this.$message.success('保存成功')
            //关闭选项卡
            this.$store.state.contentTabs =
              this.$store.state.contentTabs.filter(
                (item) =>
                  item.name !== 'questionnaire-detail' &&
                  item.name !== 'survey-sample'
              )
            this.$store.state.contentIsNeedRefresh = true
            this.$nextTick(() => {
              this.$router.replace({
                name: 'survey-sample',
                params: { taskId: this.formData.taskId, refresh: true }
              })
              this.$store.state.contentIsNeedRefresh = false
            })
          } else {
            this.loadApiToken()
            this.disabled = false
            this.$message.error(res.data.msg)
          }
        })
        .catch((error) => {
          this.loadApiToken()
          this.disabled = false
          this.$message.error(error)
        })
    }
  },
  beforeDestroy() {
    this.$store.commit('regionSelectMap', null)
  }
}
</script>
<style lang="scss" scoped>
@import '@/assets/scss/color.scss';
.back-button {
  padding: 10px;
  color: #00bfbf;
  cursor: pointer;
}
.questionnaire-container {
  overflow: hidden;

  .header-top {
    position: relative;
    left: 0;
    right: 0;
    top: 0;
    z-index: 10;
    width: calc(100% - 5px) !important;
    background-color: #f1f4f5;
  }

  .page-container {
    padding-top: 10px;
  }

  :deep(.el-card__body) {
    height: 68px;
  }
  .questionnaire-content {
    margin-top: 5px;
    .questionnaire-form {
      background-color: #fff;
      border-radius: 4px;
      padding-bottom: 10%;
    }
    .questionnaire-directory {
      padding-left: 15px;
    }
    .sign-box {
      padding: 0 20px;
      .content {
        border: 1px solid $borderColor;
        border-radius: 4px;
        padding: 20px;
        .sign-name {
          font-size: 14px;
          color: #606266;
          line-height: 40px;
          text-align: left;
          margin: 0;
        }
      }
    }
  }
}
// .gap {
// margin-right: 10px;
// }
.right-menu {
  .fr:first-child {
    margin-left: 10px;
  }
  .title-view {
    font-size: 16px;
    font-weight: bold;
    line-height: 32px;
  }

  &.right-btns {
    display: flex;
    justify-content: flex-end;
  }
}
.scroll-jump-father {
  top: 70vh;
  right: 15vw;
}
.add-member-box {
  .btn-box {
    margin-top: 15px;
    text-align: center;
  }
}
</style>
<style lang="scss" scoped>
.el-icon-arrow-left {
  padding: 10px;
  color: #00bfbf;
  cursor: pointer;
}
.add-member-dialog {
  .el-dialog__body {
    display: flex;
    justify-content: center;
  }
}
</style>
