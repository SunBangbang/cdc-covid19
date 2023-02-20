<template>
  <div>
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
          <h3 align="center">问卷审核</h3>
        </el-row>
      </el-card>
      <el-row class="fill-content">
        <div class="fill-form" id="formContent">
          <json-to-form
            class="jsonToForm"
            v-if="jsonToFormVisible"
            :disabled.sync="disabled"
            ref="jsonToForm"
            @submit="handleSubmit"
            @reject="handleReject"
          >
          </json-to-form>
        </div>
        <!-- <div class="fill-directory">
        <div class="fill-directory-card">
            <el-row v-for="(item, index) in formJson.json.column" :key="index">
              <el-link v-if="item.type !== 'description' && item.params" @click="jump(item)">{{item.params.html}}</el-link>
              <el-link v-else @click="jump(item)">{{item.label}}</el-link>
            </el-row>
        </div>
      </div>-->

        <div class="questionnaire-directory">
          <div
            class="questionnaire-directory-card"
            v-if="showCatalogue"
            style="margin-bottom: 10%;"
          >
            <h3 style="text-align: center" v-if="catalogue.main.params">
              {{ catalogue.main.params.html }}
            </h3>
            <el-collapse v-if="catalogue.main" v-model="activeNames">
              <el-collapse-item
                v-for="(item, index) in catalogue.mainTitle"
                :key="index"
                :name="index"
                :title="item.params.html"
              >
                <div
                  slot="title"
                  style="width: 100%; text-overflow:ellipsis;overflow:hidden;white-space:nowrap;"
                >
                  {{ item.params.html }}
                </div>
                <el-row
                  v-for="(it, ins) in catalogue['subTitle' + (index + 1)]"
                  :key="ins"
                >
                  <el-link @click="jump(it)" :underline="false">{{
                    it.label
                  }}</el-link>
                </el-row>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>
      </el-row>
      <fill-questionnaire-sign-dialog
        v-if="fillSignDialogVisible"
        ref="fillQuestionnaireSignDialog"
        @callback="fillSignCallback"
      >
      </fill-questionnaire-sign-dialog>
    </div>

    <up-bottom-slider :div-id="formContainer" />
  </div>
</template>
<script>
import moment from "moment";
import { getReleaseFormJson as getFormJson } from "@/api/survey-form/questionnaire";
import {
  apiToken,
  prepareForAudit,
  auditSubmit,
  reject
} from "@/api/survey-form/sample";
import { uploadFile } from "@/api/oss";
import RecordRTC from "recordrtc";
import FileTypeConstant from "@/utils/FileTypeConstant";
import { getLoginUserInfo } from "@/api/user/user";
import FillQuestionnaireSignDialog from "./components/fill-questionnaire-sign-dialog";
import JsonToForm from "@/components/form-design/form-json";
import Loading from "@/utils/Loading";
import UpBottomSlider from "@/components/slider/up-bottom-slider";

export default {
  components: {
    FillQuestionnaireSignDialog,
    JsonToForm,
    UpBottomSlider
  },
  data() {
    return {
      formContainer: "formContent",
      showCatalogue: false,
      activeNames: [],
      catalogue: {
        mainTitle: []
      },
      formJson: {
        json: {}
      },
      result: {
        surveyFormId: "",
        taskId: "",
        audioNum: 0,
        // audioUris: [],
        videoNum: 0,
        // videoUris: [],
        mediaInfos: [],
        data: {},
        investigator: "调查员",
        source: "pc"
        /*participant: '姓名',
          sex: '性别',
          identity: '身份证',
          investigator: '调查员',
          source: '来源'*/
      },
      video: null,
      videoStart: true,
      videoEnd: false,
      audioStart: true,
      audioEnd: false,
      startTime: null, //开始录制时间
      recorder: null,
      userMedia: { audio: true, video: true },
      videoFormat: {
        mimeType: "video/webm\;codecs=h264",
        fileExtension: "mp4"
      },
      fillSignDialogVisible: false,
      jsonToFormVisible: false,
      disabled: false,
      videoVisible: false,
      uuid: null,
      taskId: null,
      surveyFormId: null,
      selectedIds: null,
      loadingInstance: null,
      openMediaDevice: false //浏览器是否开启摄像头麦克风权限
    };
  },
  created() {
    this.loadApiToken();
    this.taskId = this.$route.params.taskId;
    this.surveyFormId = this.$route.params.surveyFormId;
    this.selectedIds = this.$route.query.selectedIds;
    console.log("selectedIds:", this.selectedIds);
  },
  updated() {
    this.video = document.querySelector("video");
  },
  activated() {
    console.log("***** activated.................");
    this.disabled = false;
    this.taskId = this.$route.params.taskId;
    this.surveyFormId = this.$route.params.surveyFormId;
    this.selectedIds = this.$route.query.selectedIds;
    this.$store.state.languageSelected = 1;
    this.init(this.taskId, this.surveyFormId);
  },
  mounted() {
    this.loadingInstance = new Loading(".fill-form");
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    loadAuditData() {
      console.log("2. load audit data.....");
      this.jsonToFormVisible = false;
      if (this.selectedIds) {
        prepareForAudit(this.selectedIds, this.surveyFormId).then(res => {
          if (res.data.code === 0) {
            let result = res.data.data;
            let data = result.sample;
            delete data.id;
            delete data.sampleNo;
            delete data.no;
            console.log("watch result:", result);
            this.result.audioNum = data.audioNum;
            this.result.videoNum = data.videoNum;
            this.result.mediaInfos = data.mediaInfos;
            this.jsonToFormVisible = true;
            this.$nextTick(() => {
              this.formJson.json.emptyBtn = false;
              this.formJson.json.saveDraftBtn = false;
              this.formJson.json.submitBtn = true;
              this.formJson.json.rejectBtn = true;
              this.$refs["jsonToForm"].taskId = this.result.taskId;
              this.$refs["jsonToForm"].form = data;
              this.$refs["jsonToForm"].json = this.formJson.json;
              this.$refs["jsonToForm"].add = false;
              this.$refs["jsonToForm"].auditSample = {
                audit: true,
                nonDynaAudit: result.nonDynaAudit,
                dynaAudit: result.dynaAudit
              };
              this.$refs["jsonToForm"].init();
              this.$refs["jsonToForm"].visible = true;
              this.loadingInstance.close();
            });
          }
        });
      }
      this.loadingInstance.close();
    },
    async init(taskId, surveyFormId) {
      this.result.taskId = taskId;
      this.result.surveyFormId = surveyFormId;
      await this.handleGetFormJson(surveyFormId);
      this.getUserInfo();
      this.loadAuditData();
    },
    getUserInfo() {
      getLoginUserInfo().then(res => {
        this.result.investigator = res.data.data.realName;
      });
    },
    // 获取formJson
    async handleGetFormJson(surveyFormId) {
      let res = await getFormJson(surveyFormId);
      if (res.data.code === 0) {
        let data = res.data.data;
        if (typeof data.json === "string") {
          res.data.data.json = JSON.parse(data.json);
        } else {
          res.data.data.json = data.json;
        }
        this.formJson = res.data.data;

        this.catalogue = {
          mainTitle: []
        };
        let ix = 0;
        this.catalogue["subTitle" + ix] = [];
        this.formJson.json.column.forEach((item, index) => {
          // console.log(item)
          if (index === 0) {
            this.catalogue.main = item;
          } else if (item.type !== "description" && item.params) {
            this.catalogue.mainTitle.push(item);
            ix += 1;
            this.catalogue["subTitle" + ix] = [];
          } else {
            if (item.display) {
              this.catalogue["subTitle" + ix].push(item);
            }
          }
        });
        this.showCatalogue = true;
        // console.log(Object.assign({},this.catalogue))
        this.loading = false;
      }
      this.loadingInstance.close();
      console.log("1. get form json.....");
    },
    // 提交
    handleSubmit(form) {
      this.result.data = form;
      this.result.source = "pc";
      // console.log('submit audit form:', this.result)
      if (this.fillSignDialogVisible) {
        this.$nextTick(() => {
          this.$refs["fillQuestionnaireSignDialog"].dialogVisible = true;
          this.$refs["fillQuestionnaireSignDialog"].result = this.result;
          this.$refs[
            "fillQuestionnaireSignDialog"
          ].taskId = this.$route.params.taskId;
          if (this.video) {
            this.$refs["fillQuestionnaireSignDialog"].audioOpen = this.audioEnd;
            this.$refs["fillQuestionnaireSignDialog"].videoOpen = this.videoEnd;
          }
        });
      } else {
        this.disabled = true;
        this.result.aduit = 1;
        auditSubmit(this.result, this.selectedIds).then(res => {
          if (res.data.code === 0) {
            this.$message.success("保存成功");
            this.$store.state.contentTabs = this.$store.state.contentTabs.filter(
              item => item.name !== "fill-questionnaire"
            );
            this.$router.replace({
              name: "survey-sample",
              params: { taskId: this.$route.params.taskId, refresh: true }
            });
          } else {
            this.loadApiToken();
            this.disabled = false;
            console.log("error:", res.data.msg);
            const errMsgList = res.data.msg.split("\n");
            this.$refs["jsonToForm"].popupError(errMsgList);
            // this.$message.error({message: res.data.msg, duration: 5000})
          }
        });
      }
    },
    handleReject() {
      console.log("reject:", this.selectedIds);
      reject(this.surveyFormId, this.taskId, this.selectedIds).then(res => {
        if (res.data.code === 0) {
          this.$message.success("操作成功");
          this.$store.state.contentTabs = this.$store.state.contentTabs.filter(
            item => item.name !== "fill-questionnaire"
          );
          this.$router.replace({
            name: "survey-sample",
            params: { taskId: this.$route.params.taskId, refresh: true }
          });
        } else {
          this.loadApiToken();
          this.disabled = false;
          console.log("error:", res.data.msg);
          this.$message.error({ message: res.data.msg, duration: 5000 });
        }
      });
    },
    loadApiToken() {
      apiToken().then(res => {
        if (res.data.code === 0) {
          this.uuid = res.data.data;
        }
      });
    },
    // 关闭成功页面回调
    fillSignCallback() {
      // 清空表单
      this.$refs["jsonToForm"].clearForm();
    },

    // 音频开始
    startAudio() {
      if (!this.video) {
        this.video = document.querySelector("video");
      }
      this.audioStart = false;
      this.audioEnd = true;
      this.videoStart = false;
      this.videoEnd = false;

      this.userMedia = { audio: true, video: false };
      this.videoFormat.fileExtension = "mp3";
      this.$nextTick(() => {
        this.startRecording();
      });
    },
    // 音频停止
    stopAudio() {
      this.audioStart = true;
      this.audioEnd = false;
      this.videoStart = true;
      this.videoEnd = false;

      this.recorder.stopRecording(this.stopRecordingCallback);
    },
    // 视频开始
    startVideo() {
      if (!this.video) {
        this.video = document.querySelector("video");
      }
      this.audioStart = false;
      this.audioEnd = false;
      this.videoStart = false;
      this.videoEnd = true;

      this.userMedia = { audio: true, video: true };
      this.videoFormat.fileExtension = "mp4";
      this.$nextTick(() => {
        this.startRecording();
      });
    },
    // 视频停止
    stopVideo() {
      this.audioStart = true;
      this.audioEnd = false;
      this.videoStart = true;
      this.videoEnd = false;

      this.recorder.stopRecording(this.stopRecordingCallback);
    },
    // 开始录制视频/音频
    startRecording() {
      this.captureCamera(camera => {
        this.video.muted = true;
        this.video.volume = 0;
        this.video.srcObject = camera;
        this.recorder = RecordRTC(camera, {
          type: "video"
        });
        this.startTime = new Date();
        this.recorder.startRecording();
        // release camera on stopRecording
        this.recorder.camera = camera;
      });
    },
    // 录制
    captureCamera(callback) {
      navigator.mediaDevices
        .getUserMedia(this.userMedia)
        .then(function(camera) {
          callback(camera);
        })
        .catch(error => {
          if (this.openMediaDevice) {
            this.$message.warning("请开启浏览器摄像头麦克风权限！");
            // window.open('chrome://settings/content')
          } else {
            this.$message.warning("浏览器不支持摄像头麦克风设备！");
          }
        });
    },
    // 停止录制视频/音频回调
    stopRecordingCallback() {
      this.video.src = this.video.srcObject = null;
      this.video.muted = false;
      this.video.volume = 1;
      this.video.src = URL.createObjectURL(this.recorder.getBlob());
      // 上传服务器
      this.upload();

      this.recorder.camera.stop();
      this.recorder.destroy();
      this.recorder = null;
    },
    // 上传服务器
    upload() {
      let endTime = new Date();
      let duration = (endTime.getTime() - this.startTime.getTime()) / 1000;
      let createAt = this.startTime;

      let fileName = "SurveyForm" + "." + this.videoFormat.fileExtension;
      let file = new File([this.recorder.getBlob()], fileName, {
        type: this.videoFormat.mimeType
      });
      uploadFile(file, FileTypeConstant.SURVEY_FORM).then(res => {
        if (res.data.code === 0) {
          if (null != res.data.data && res.data.data.length > 0) {
            res.data.data.forEach(v => {
              let mediaInfo = {};
              mediaInfo.mediaUrl = v.url;
              mediaInfo.fid = v.fid ? v.fid : null;
              mediaInfo.duration = Math.floor(duration);
              mediaInfo.createAt = moment(createAt).format(
                "YYYY-MM-DD HH:mm:ss"
              );
              if (this.videoFormat.fileExtension === "mp4") {
                // this.result.videoUris.push(v.url)
                // this.result.videoNum = this.result.videoNum + 1
                mediaInfo.type = 1;
                this.result.mediaInfos.push(mediaInfo);
              } else if (this.videoFormat.fileExtension === "mp3") {
                // this.result.audioUris.push(v.url)
                // this.result.audioNum = this.result.audioNum + 1
                mediaInfo.type = 0;
                this.result.mediaInfos.push(mediaInfo);
              }
            });
          }
        } else {
          console.error("err:", res.data.msg);
        }
      });
    },
    // 锚点跳转
    jump(item) {
      let formElement = document.getElementsByClassName("fill-form")[0];
      let jump =
        document.getElementById("label_" + item.prop) ||
        document.getElementById("el" + item.prop);
      // 获取需要滚动的距离
      // Chrome
      formElement.scrollTop = jump ? jump.offsetTop : 0;

      /*// Chrome
        document.body.scrollTop = total;
        // Firefox
        document.documentElement.scrollTop = total;
        // Safari
        window.pageYOffset = total*/
    }
  },
  beforeDestroy() {
    this.$store.commit("regionSelectMap", null);
  },
};
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
      }
    }
    > div {
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
