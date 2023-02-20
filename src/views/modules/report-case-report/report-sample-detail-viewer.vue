<template>
  <el-row :gutter="10">
    <back-bar></back-bar>

    <el-col :span="5" v-if="params.type !== 'editView'">
      <report-history-tree :data="auditHistory"></report-history-tree>
    </el-col>

    <el-col :span="params.type !== 'editView' ? 19 : 24">
      <el-row class="div-height" style="height: calc(100vh - 115px)">
        <el-row class="body-background" v-loading="loading">
          <el-row class="head-title">
            <img :src="icon" />

            <span>调查记录信息</span>
          </el-row>

          <sample-detail
            :survey-form-id="params.formId"
            :type="params.sampleType"
            :rpid="params.id"
            text="确认提交审核？"
            :full="params.type === 'editView'"
            :hide-button-group="true"
            :sample-id="params.sampleId"
          ></sample-detail>
        </el-row>

        <el-row
          v-if="params.type !== 'editView'"
          style="margin-top: 10px"
          class="body-background"
        >
          <el-row class="head-title">
            <img :src="icon" />

            <span>附件</span>
          </el-row>

          <el-row class="background-row">
            <el-row v-if="attachmentList.length > 0">
              <el-upload
                action="http://localhost"
                :on-preview="handlePreview"
                multiple
                :limit="3"
                disabled
                :file-list="attachmentList"
              >
              </el-upload>
            </el-row>

            <el-row v-else>暂无附件</el-row>
          </el-row>
        </el-row>

        <el-row
          v-if="params.type === 'auditView'"
          style="margin-top: 10px"
          class="body-background"
        >
          <el-row class="head-title">
            <img :src="icon" />

            <span>审核</span>
          </el-row>

          <el-row class="background-row">
            <el-row>
              <el-col :span="20">
                <el-form
                  :model="form"
                  label-position="right"
                  ref="form"
                  label-width="100px"
                  :rules="form.type === '1' ? rules : { type: rules.type }"
                >
                  <el-form-item prop="type" label="审核结果：">
                    <el-radio-group v-model="form.type" @change="changeRadio()">
                      <el-radio label="0">审核通过</el-radio>

                      <el-radio label="1">审核驳回</el-radio>
                    </el-radio-group>
                  </el-form-item>

                  <el-form-item prop="remark" label="审核意见：">
                    <el-row class="width-100" :gutter="10">
                      <el-col :span="18">
                        <el-input
                          type="textarea"
                          v-model="form.remark"
                          maxlength="500"
                        >
                        </el-input>
                      </el-col>
                      <el-col :span="4">
                        <el-button
                          @click="showAsrChange(true, true)"
                          icon="el-icon-microphone"
                        ></el-button>
                      </el-col>
                    </el-row>
                  </el-form-item>

                  <el-form-item>
                    <el-button @click="submit" type="primary" size="small">
                      提交
                    </el-button>
                  </el-form-item>
                </el-form>
              </el-col>
            </el-row>
          </el-row>
        </el-row>
      </el-row>
    </el-col>
    <asr-start
      @close="showAsrChange(false, false)"
      v-if="showAsr"
      @onlyClose="showAsrChange(false, true)"
      @start="showAsrChange(true, false)"
    >
    </asr-start>
  </el-row>
</template>

<script>
import SampleDetail from "@/views/modules/survey-form/components/compareData/sample-detail";
import BackBar from "@/components/back-bar/back-bar";
import AsrStart from "@/components/asr/AsrStart";
import RecordRTC from "recordrtc";
import {
  getAttachment,
  getAttachments,
  getAuditHistory,
  handelAudit,
} from "@/api/survey-form/reported_sample";
import { uploadFile } from "@/api/oss";
import FileTypeConstant from "@/utils/FileTypeConstant";
import { getSpeechText } from "@/api/survey-form/speech";
import icon from "@/assets/image/icon-sys.png";
import ReportHistoryTree from "@/views/modules/report-case-report/report-history-tree";
import { mapGetters } from "vuex";
import moment from "moment";

export default {
  name: "report-sample-detail-viewer",
  components: { ReportHistoryTree, BackBar, SampleDetail, AsrStart },
  beforeRouteEnter(to, from, next) {
    let params = JSON.stringify(to.params);
    if (params !== "{}") localStorage.setItem("routerParams", params);
    next();
  },
  data() {
    return {
      params: {},
      autoRefresh: false,
      form: {
        type: null,
        remark: "",
      },
      auditHistory: [],
      icon: icon,
      attachmentList: [],
      rules: {
        remark: [
          { required: true, message: "必须输入驳回原因！", trigger: "blur" },
        ],
        type: [
          { required: true, message: "必须选择审核结果！", trigger: "blur" },
        ],
      },
      loading: false,
      //语音录制
      showAsr: false,
      audioStart: false,
      audioEnd: true,
      startTime: null,
      recorder: null,
      openMediaDevice: false, //浏览器是否开启摄像头麦克风权限
      userMedia: { audio: true, video: false },
      videoFormat: {
        mimeType: "video/webm;codecs=h264",
        fileExtension: "webm",
      },
      audioUploadResult: {
        surveyFormId: "",
        taskId: "",
        audioNum: 0,
        mediaInfos: [],
        data: {},
      },
    };
  },
  created() {
    this.getRouterParams();
    if (this.params.type === "view" || this.params.type === "auditView") {
      this.params.sampleType = "read";
    } else {
      this.params.sampleType = "edit";
    }
    this.checkMediaDevice();
  },
  computed: {
    ...mapGetters(["getFormLoopEndFlag"]),
    computedFormLoopEnd() {
      return this.getFormLoopEndFlag;
    },
  },
  watch: {
    computedFormLoopEnd(newVal, oldVal) {
      if (this.loading && newVal) {
        this.loading = false;
      }
    },
  },
  mounted() {
    this.getHistory();
    if (this.params.attachIds) {
      this.getAttachment();
    }
  },
  methods: {
    getRouterParams() {
      this.loading = true;
      this.$store.commit("setFormLoopEndFlag", false);
      let params = JSON.stringify(this.$route.params);
      if (params === "{}") {
        this.params = JSON.parse(localStorage.getItem("routerParams"));
        this.autoRefresh = true;
      } else {
        this.params = this.$route.params;
        this.autoRefresh = true;
      }
    },
    changeRadio() {
      this.$refs.form.clearValidate();
    },
    submit() {
      this.$refs.form.validate((valide) => {
        if (valide) {
          this.form.rpid = this.params.rpid;
          this.form.adid = this.params.adid;
          handelAudit(this.form).then((res) => {
            if (res.data.code === 0) {
              this.$message.success("提交成功！");
              this.$router.go(-1);
            } else {
              this.$message.error(res.data.msg);
            }
          });
        }
      });
    },
    getHistory() {
      getAuditHistory(this.params.rpid).then((res) => {
        if (res.data.code === 0) {
          let data = res.data.data;
          data.forEach((item, index) => {
            if (item.status === "处理中") {
              if (this.params.sampleType === "edit") {
                item.auditor = this.$store.state.user.realName;
              } else {
                item.auditDate = null;
                item.auditor = null;
              }
              item.color = "rgb";
            } else if (item.status === "通过") {
              item.icon = "el-icon-check";
              item.color = "#67C23A";
            } else if (item.status === "驳回") {
              item.icon = "el-icon-close";
              item.color = "#F56C6C";
            } else if (item.status === "待审批") {
              item.status = "提交";
              item.icon = "el-icon-check";
              item.color = "#67C23A";
            } else if (item.status === "提交") {
              item.icon = "el-icon-check";
              item.color = "#67C23A";
            }
          });
          this.auditHistory = data;
        } else {
          this.$message.error(res.data.msg);
        }
      });
    },
    getAttachment() {
      const params = {
        attachIds: this.params.attachIds,
      };
      getAttachments(params).then((res) => {
        if (res.data.code === 0) {
          this.attachmentList = res.data.data;
        } else {
          console.error("err:", res.data.msg);
        }
      });
    },
    handlePreview(file) {
      // console.log(file,"00")
      let urlArr = file.url.split('/')
      urlArr[urlArr.length - 1] = encodeURIComponent(urlArr.pop())
      window.open(urlArr.join('/'));
    },
    checkMediaDevice() {
      navigator.mediaDevices.getUserMedia =
        navigator.mediaDevices.getUserMedia ||
        navigator.mediaDevices.webkitGetUserMedia ||
        navigator.mediaDevices.mozGetUserMedia ||
        navigator.mediaDevices.msGetUserMedia;

      if (navigator.mediaDevices.getUserMedia) {
        //支持调取摄像头麦克风
        this.openMediaDevice = true;
      } else {
        //不支持调取摄像头麦克风
        console.log("不支持调取摄像头麦克风");
      }
    },
    showAsrChange(openOrClose, onlyOpenOrClose) {
      // if (!this.openMediaDevice) {
      //   this.$message.warning("浏览器不支持摄像头麦克风设备！");
      //   return;
      // }
      if (onlyOpenOrClose) {
        this.showAsr = openOrClose;
      } else {
        if (openOrClose) {
          this.startAudio();
        } else {
          this.stopAudio();
        }
      }
    },
    // 音频开始
    startAudio() {
      this.audioStart = true;
      this.audioEnd = false;
      this.userMedia = { audio: true, video: false };
      this.videoFormat.fileExtension = "webm";
      this.recorder = null;
      this.$nextTick(() => {
        this.startRecording();
      });
    },
    // 音频停止
    stopAudio() {
      this.audioStart = false;
      this.audioEnd = true;
      this.recorder.stopRecording(this.stopRecordingCallback);
    },
    // 开始录制音频
    startRecording() {
      this.captureCamera((camera) => {
        this.recorder = RecordRTC(camera, {
          type: "video",
          mimeType: "video/webm;codecs=h264",
          sampleRate: 16000,
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
        .then(function (camera) {
          callback(camera);
        })
        .catch((error) => {
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
      // 上传服务器
      this.upload();

      this.recorder.camera.stop();
      this.recorder.destroy();
      this.recorder = null;
    },
    upload() {
      let endTime = new Date();
      let duration = (endTime.getTime() - this.startTime.getTime()) / 1000;
      let createAt = this.startTime;

      let fileName =
        "speech" + new Date().getTime() + "." + this.videoFormat.fileExtension;
      let file = new File([this.recorder.getBlob()], fileName, {
        type: this.videoFormat.mimeType,
      });
      // let that = this;
      uploadFile(file, FileTypeConstant.QUESTIONNAIRE_AUDIO).then((res) => {
        if (res.data.code === 0) {
          if (null != res.data.data && res.data.data.length > 0) {
            res.data.data.forEach((v) => {
              let mediaInfo = {};
              mediaInfo.mediaUrl = v.url;
              mediaInfo.fid = v.fid ? v.fid : null;
              mediaInfo.duration = Math.floor(duration);
              mediaInfo.createAt = moment(createAt).format(
                "YYYY-MM-DD HH:mm:ss"
              );
              mediaInfo.name = v.name;
              mediaInfo.type = 0;
              this.audioUploadResult.mediaInfos.push(mediaInfo);
            });
            console.log(this.audioUploadResult.mediaInfos);
            let mediaUrl =
              this.audioUploadResult.mediaInfos[
                this.audioUploadResult.mediaInfos.length - 1
              ].mediaUrl;
            let idx = mediaUrl
              .substring(0, mediaUrl.lastIndexOf("/"))
              .lastIndexOf("/");
            let voiceFile = mediaUrl.substring(idx + 1);
            getSpeechText(voiceFile, this.$store.state.languageSelected).then(
              (res) => {
                if (res.data.code === 0) {
                  this.form.remark += res.data.data ? res.data.data : '';
                  this.showAsrChange(false, true);
                } else {
                  console.error("err:", res.data.msg);
                }
              }
            );
          }
        } else {
          console.error("err:", res.data.msg);
        }
      });
    },
  },
};
</script>

<style scoped>
.background-row {
  background: white;
  border-radius: 0 0 5px 5px;
  padding: 15px;
}
.div-height {
  height: calc(100vh - 165px);
  overflow-y: auto;
  overflow-x: hidden;
}
.head-title {
  background: white;
  border-radius: 5px 5px 0 0;
  border-bottom: 1px #e7e7e7 solid;
  padding: 15px;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: left;
}
.head-title span {
  margin-left: 10px;
}
:deep(.el-tag) {
  border-radius: 50px;
}
.body-background {
  background-color: white;
  border-radius: 5px;
}

:deep(.el-upload-list__item-name) {
  color: #17b3a3;
}
.width-100 {
  width: 100%;
}
</style>
