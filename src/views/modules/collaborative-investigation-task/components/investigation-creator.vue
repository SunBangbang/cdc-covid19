<template>

  <el-row>

    <back-bar ref="back" type="replace"></back-bar>

    <el-row
      class="background"
      v-loading="!modelVisible"
      @click.native="cancelPop"
    >

      <el-form
        label-width="90px"
        :rules="rule"
        ref="form"
        :model="prepareData"
        :disabled="disabled"
      >

        <el-row v-if="modelVisible">

          <custom-desc
            type="tip"
            title="基本信息"
            :title-font-size="16"
          ></custom-desc>

          <el-form-item prop="assistName" label="任务名称:">

            <el-col
              :xl="{ span: 7 }"
              :lg="{ span: 10 }"
              :md="{ span: 18 }"
              :sm="{ span: 24 }"
            >

              <el-input
                type="text"
                size="mini"
                v-model="prepareData.assistName"
                maxlength="100"
                show-word-limit
              ></el-input>

            </el-col>

          </el-form-item>

          <participant-info
            style="margin: 10px 0 10px 10px; font-size: 14px"
            :params="prepareData"
          ></participant-info>

          <custom-desc
            type="tip"
            title="接受协查任务组织"
            :title-font-size="16"
          ></custom-desc>

          <collaborative-dept
            style="margin: 10px 0"
            :data.sync="prepareData.tracks"
            :disabled="disabled"
            ref="dept"
          ></collaborative-dept>

          <custom-desc
            type="tip"
            title="共享模块"
            :title-font-size="16"
          ></custom-desc>

          <shared-model
            style="margin: 10px 0"
            :data.sync="prepareData.formModules"
          ></shared-model>

          <el-row style="text-align: center">

            <el-button
              type="primary"
              size="mini"
              @click="submit"
              v-loading.lock="fullscreenLoading"
              v-points
              v-if="
                prepareData.tracks && prepareData.tracks.length > 0 && !disabled
              "
            >
              提交
            </el-button>

            <el-button
              type="warning"
              size="mini"
              @click="saveAsDraft"
              v-loading.lock="fullscreenLoading"
              v-points
              v-if="
                !disabled &&
                  (!prepareData.appId || mode === 'editDraft') &&
                  prepareData.tracks &&
                  prepareData.tracks.length > 0
              "
            >
               草稿
            </el-button>

          </el-row>

        </el-row>

      </el-form>

    </el-row>

  </el-row>

</template>

<script>
import BackBar from "@/components/back-bar/back-bar";
import CustomDesc from "@/components/custom-desc/custom-desc";
import ParticipantInfo from "@/views/modules/collaborative-investigation-task/components/participant-info";
import CollaborativeDept from "@/views/modules/collaborative-investigation-task/components/collaborative-dept";
import SharedModel from "@/views/modules/collaborative-investigation-task/components/shared-model";
import {
  assistTaskCreate,
  assistTaskPrepare,
  getOneAssistApply,
  getDeptReceivedApply,
  saveOrUpdateAssistTaskDraft
} from "@/api/assistant/assistant";
export default {
  name: "investigation-creator",
  components: {
    SharedModel,
    CollaborativeDept,
    ParticipantInfo,
    CustomDesc,
    BackBar
  },
  beforeRouteEnter(to, from, next) {
    let params = JSON.stringify(to.params);
    if (params !== "{}") {
      localStorage.setItem("routerParams", params);
    }
    next();
  },
  data() {
    return {
      fullscreenLoading: false,
      params: {},
      tracks: [],
      shareModelData: [],
      prepareData: {},
      modelVisible: false,
      mode: null,
      disabled: this.$route.params.disabled,
      location: {
        name: "survey-sample",
        params: {
          taskId: this.$route.params.taskId
        }
      },
      rule: {
        assistName: [
          { required: true, message: "请输入任务名称", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getRouterParams();
    this.initData();
    if (this.disabled) {
      this.location = null;
    }
  },
  methods: {
    cancelPop() {
      this.$refs.dept.popoverVisible(-1);
    },
    getRouterParams() {
      let params = JSON.stringify(this.$route.params);
      if (params === "{}") {
        this.params = JSON.parse(localStorage.getItem("routerParams"));
      } else {
        this.params = this.$route.params;
      }
    },
    initData() {
      let draftId = this.params.draftId;
      if (draftId) {
        this.prepareData = this.params;
        this.modelVisible = true;
      } else if (this.params.assistAppId) {
        if (this.params.received) {
          //查看协查申请，仅包括本部门活动轨迹
          getDeptReceivedApply(
            this.params.assistAppId,
            this.params.deptId
          ).then(res => {
            this.prepareData = { ...res.data.data };
            this.modelVisible = true;
            this.disabled = true;
          });
        } else {
          //查看协查申请，包括所有活动轨迹
          getOneAssistApply(this.params.assistAppId).then(res => {
            this.prepareData = { ...res.data.data };
            this.modelVisible = true;
            this.disabled = true;
          });
        }
      } else {
        assistTaskPrepare({
          formId: this.params.surveyFormId
            ? this.params.surveyFormId
            : this.params.formId,
          sampleId: this.params.mergeSid
            ? this.params.mergeSid
            : this.params.sampleId
        }).then(res => {
          this.prepareData = res.data.data;
          console.log(this.prepareData)
          this.modelVisible = true;
        });
      }
    },
    submit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.fullscreenLoading = true;
          assistTaskCreate(this.prepareData).then(res => {
            this.fullscreenLoading = false;
            if (res.data.code === 0) {
              this.$message.success("协查任务创建成功！");
              sessionStorage.setItem("tab", "release");
              this.$router.replace({
                path:
                  "collaborative-investigation-task-investigation-management"
              });
            } else {
              console.error("res:", res.data.msg);
              this.$message.error(res.data.msg);
            }
          });
        } else {
          this.$message.error("协查任务主题必须存在！");
          return false;
        }
      });
    },
    saveAsDraft() {
      // let data = {...}
      let id = null;
      if (this.params.draftId) {
        id = this.params.draftId;
      } else {
        id = this.prepareData.appId;
      }
      this.$refs.form.validate(valid => {
        if (valid) {
          this.fullscreenLoading = true;
          saveOrUpdateAssistTaskDraft(id, this.prepareData).then(res => {
            this.fullscreenLoading = false;
            console.log(res.data);
            if (res.data.code === 0) {
              this.$message.success("协查任务保存草稿成功！");
              sessionStorage.setItem("tab", "release");
              this.$router.replace({
                path:
                  "collaborative-investigation-task-investigation-management"
              });
            } else {
              this.$message.error(res.data.msg);
            }
          });
        } else {
          this.$message.error("任务主题必须存在！");
          return false;
        }
      });
    }
  }
};
</script>

<style scoped>
.background {
  height: calc(100vh - 115px);
  overflow-y: auto;
  overflow-x: hidden;
  padding: 15px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  background-color: white;
  border-radius: 5px;
}
:deep(.el-form-item) {
  margin-bottom: 0;
}
</style>

