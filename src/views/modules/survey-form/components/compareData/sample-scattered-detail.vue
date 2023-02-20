<template>
  <el-row :gutter="10" v-loading="pageLoading">
    <button-group-bar
      :survey-form-id="surveyFormId"
      ref="buttonGroup"
      :file-id="fileId"
      :is-merge="isMerge"
      :word-url="wordUrl"
      :task-id="taskId"
      :sample-id="sampleId"
      v-if="buttonShower"
      :form-change-allow="false"
      :media-infos="mediaInfos"
      @changeWordData="changeWordData"
      @changeFullOrCoreForm="changeFullOrCoreForm"
      :title="pageTitle"
      :mode="mode"
    ></button-group-bar>
    <el-col :span="18">
      <el-row
        :class="
          full
            ? 'right-sample-detail-full questionnaire-form'
            : 'right-sample-detail questionnaire-form'
        "
        id="tt"
        v-if="jsonToFormRowVisible"
      >
        <el-row v-for="(item, index) in newSmallFormJsons" :key="index">
          <json-to-form
            :ref="`jsonToForm${index}`"
            v-if="jsonToFormVisible"
            :render-dialog="false"
            :disabled="isView ? true : item.disabled"
            :isShowCoreForm="isShowCoreForm"
          >
          </json-to-form>
        </el-row>
        <el-row class="text-center" v-if="edit && !isView">
          <el-button
            type="primary"
            @click="openDialog"
            v-loading.fullscreen.lock="loading"
          >
            提交
          </el-button>
          <el-button
            type="primary"
            @click="saveAsDraft"
            v-loading.fullscreen.lock="loading"
          >
            保存草稿
          </el-button>
        </el-row>
      </el-row>
      <el-row>
        <up-bottom-slider
          v-if="!pageLoading"
          :div-id="'tt'"
          style="position: absolute; bottom: 5%"
        ></up-bottom-slider>
      </el-row>
    </el-col>

    <!--右侧表单章节标题 -->
    <el-col :span="6">
      <el-row
        :class="full ? 'right-sample-detail-full' : 'right-sample-detail'"
      >
        <catalogue :catalogue="catalogue"></catalogue>
      </el-row>
    </el-col>

    <el-dialog
      title="未填项和逻辑项提示"
      :visible.sync="dialogVisible"
      width="60%"
      append-to-body
    >
      <el-collapse v-model="activeNames">
        <el-collapse-item title="未填项" name="1">
          <div
            style="color: #f47920"
            v-for="(err, index) in validateErrs"
            :key="index"
          >
            {{ err }}
          </div>
        </el-collapse-item>
        <el-collapse-item title="逻辑项" name="2">
          <div
            style="color: #d71345"
            v-for="(err, index) in logicErrs"
            :key="index"
          >
            {{ err }}
          </div>
        </el-collapse-item>
      </el-collapse>

      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false"
          >返回</el-button
        >
        <el-button type="primary" @click="submit">仍然提交</el-button>
      </span>
    </el-dialog>
  </el-row>
</template>

<script>
import { getReleaseFormJson } from "@/api/survey-form/questionnaire";
import JsonToForm from "@/components/form-design/form-json";
import Catalogue from "@/views/modules/survey-form/components/compareData/catalogue";
import UpBottomSlider from "@/components/slider/up-bottom-slider";
import ButtonGroupBar from "@/views/modules/survey-form/components/compareData/button-group-bar";
import sampleModule from "@/views/modules/survey-form/mixins/sample-module-mixin";
import {
  saveDraftAssistSample,
  submitAssistSample,
} from "@/api/assistant/assistant";
import AppConstant from "@/utils/AppConstant";

export default {
  name: "sample-scattered-detail",
  components: { ButtonGroupBar, JsonToForm, Catalogue, UpBottomSlider },
  mixins: [sampleModule],
  props: {
    full: {
      type: Boolean,
      default: () => {
        return false;
      },
    },
    query: {
      type: Object,
      default: () => {
        return {
          formId: null,
          taskId: null,
          appId: null,
          historyId: null,
          asid: null,
          //协查人填写信息ID
          aspid: null,
          //操作类型； read, edit, write
          operType: null,
          aTaskId: null,
        };
      },
    },
    isView: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      form: {},
      isMerge: false,
      wordUrl: null,
      formData: {},
      formJson: {
        //表单格式
        json: {},
      },
      fileId: null,
      data: {},
      mediaInfos: [],
      jsonToFormVisible: false,
      disabled: false,
      catalogue: {
        mainTitle: [],
        main: {
          params: "",
        },
      },
      showCatalogue: false,
      canEdit: false,
      mode: "",
      pageTitle: "",
      buttonShower: true,
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
        source: "pc",
        /*participant: '姓名',
        sex: '性别',
        identity: '身份证',
        investigator: '调查员',
        source: '来源'*/
      },
      //被分割后生成的新小表单json, 需要加入disabled
      newSmallFormJsons: [],
      newSmallFormJsonsOriginal: [],
      logicErrs: [],
      validateErrs: [],
      dialogVisible: false,
      activeNames: ["1", "2"],
      //是否可以编辑
      edit: false,
      loading: false,
      pageLoading: false,
      isShowCoreForm: true,
      formList: [],
      sampleData: null,
      jsonFormIndexArray: [],
      coreFullIndexList: [],
      jsonToFormRowVisible: true,
    };
  },
  beforeDestroy() {
    this.$store.commit("regionSelectMap", null);
    this.$store.commit("saveTrackData", null);
  },
  created() {
    console.log("query:", this.query);
    this.surveyFormId = this.query.formId;
    this.taskId = this.query.taskId;
    this.appId = this.query.appId;
    this.historyId = this.query.historyId;
    this.asid = this.query.asid;
    this.aspid = this.query.aspid;
    this.aTaskId = this.query.aTaskId;
    this.operType = this.query.operType;
    if (this.validatenull(this.appId)) {
      console.error("err: appId is required");
    }
    //表单是否可以编辑
    if ("read" !== this.operType) {
      this.edit = true;
      if ("create" === this.operType) {
        this.pageTitle = "填写协查问卷";
      } else if ("edit" === this.operType) {
        this.pageTitle = "编辑协查问卷";
      }
    } else {
      this.pageTitle = "查看协查问卷";
    }
    if(this.isView) {
      this.pageTitle = ''
    }

    this.handleGetFormJson();
  },
  methods: {
    // 获取formJson
    async handleGetFormJson() {
      this.pageLoading = true;
      let res = await getReleaseFormJson(this.surveyFormId);
      if (res.data.code === 0) {
        let data = res.data.data;
        if (typeof data.json === "string") {
          res.data.data.json = JSON.parse(data.json);
        } else {
          res.data.data.json = data.json;
        }
        this.formJson = res.data.data;
        this.newSmallFormJsonsOriginal = await this.handleAssistFormjson(
          data.json
        );
        if (this.isShowCoreForm) {
          this.newSmallFormJsons = this.newSmallFormJsonsOriginal.filter(
            (item, index) => {
              if (item.coreItem) {
                // this.jsonFormIndexArray.push(index);
                this.coreFullIndexList.push(index);
                return item;
              }
            }
          );
        } else {
          this.newSmallFormJsonsOriginal.forEach((item, index) => {
            this.newSmallFormJsons.push(item);
            // this.jsonFormIndexArray.push(index);
          });
        }
        this.jsonToFormVisible = true;
        this.sampleData = await this.getAssistSampleData();
        const ignores = ["bigtitle", "title", "table"];
        this.$store.commit("saveTrackData", null);

        this.$nextTick(() => {
          this.newSmallFormJsons.forEach((item, index) => {
            this.$refs[`jsonToForm${index}`][0].taskId = this.result.taskId;
            //查看状态下设置全部为只读
            if (!this.edit) {
              item.disabled = true;
            }

            this.$refs[`jsonToForm${index}`][0].json = item;
            // let formData = {};
            this.formList[index] = {};
            item.column.forEach((cln) => {
              if (!ignores.includes(cln.type)) {
                this.formList[index][cln.prop] = this.sampleData[cln.prop];
              }
              //填写协查样本,分享模块设置为编辑状态，模块所属子表单数据置空
              if ("create" === this.operType && !this.isView) {
                if (
                  "dynamic" === cln.type &&
                  AppConstant.FormModuleOperType.EDIT === item.share
                ) {
                  this.formList[index][cln.prop] = [];
                }
              }
            });
            this.$refs[`jsonToForm${index}`][0].form = this.formList[index];
            this.$refs[`jsonToForm${index}`][0].add = item.add;
            this.$refs[`jsonToForm${index}`][0].init();
            this.$refs[`jsonToForm${index}`][0].visible = item.visible;
          });
          this.pageLoading = false;
        });
        this.setCatalogue();
        this.pageLoading = false;
      }
    },
    setCatalogue(isCoreForm = true) {
      //表单模块可见性
      this.catalogue = {
        mainTitle: [],
      };
      let ix = 0;
      this.catalogue["subTitle" + ix] = [];
      if (isCoreForm) {
        this.newSmallFormJsons.forEach((item, index) => {
          item.column.forEach((item, index) => {
            // console.log(item, this.newSmallFormJsons)
            if (item.type === "bigtitle") {
              this.catalogue.main = item;
            } else if (item.type === "title" && item.params && item.coreItem) {
              //模块可见才展示
              this.catalogue.mainTitle.push(item);
              ix += 1;
              this.catalogue["subTitle" + ix] = [];
            } else if (item.coreItem) {
              this.catalogue["subTitle" + ix].push(item);
            }
          });
        });
      } else {
        this.newSmallFormJsons.forEach((item, index) => {
          item.column.forEach((item, index) => {
            // console.log(item, this.newSmallFormJsons)
            if (item.type === "bigtitle") {
              this.catalogue.main = item;
            } else if (item.type === "title" && item.params) {
              //模块可见才展示
              this.catalogue.mainTitle.push(item);
              ix += 1;
              this.catalogue["subTitle" + ix] = [];
            } else {
              this.catalogue["subTitle" + ix].push(item);
            }
          });
        });
      }

      this.showCatalogue = true;
    },
    getSampleData() {
      let obj = {};
      this.logicErrs = [];
      this.validateErrs = [];
      this.newSmallFormJsons.forEach((item, index) => {
        if (item.visible) {
          let formData = this.$refs[`jsonToForm${index}`][0].form;
          this.logicErrs = this.logicErrs.concat(
            this.$refs[`jsonToForm${index}`][0].getLogicErr()
          );
          this.validateErrs = this.validateErrs.concat(
            this.$refs[`jsonToForm${index}`][0].getValidate().errList
          );
          obj = {
            ...obj,
            ...formData,
          };
        }
      });
      //只提交可见数据
      let form = {
        appId: this.appId,
        formId: this.surveyFormId,
        taskId: this.taskId,
        historyId: this.historyId,
        aspid: this.aspid,
        oid: this.asid,
        data: obj,
      };
      console.log("submit assist form data:", form);
      console.log("logic err:", this.logicErrs);
      console.log("validate err:", this.validateErrs);
      return form;
    },
    openDialog() {
      this.getSampleData();
      console.log(this.logicErrs.length > 0, this.validateErrs.length > 0);
      if (this.logicErrs.length > 0 || this.validateErrs.length > 0) {
        this.dialogVisible = true;
      } else {
        this.submit();
      }
    },
    saveAsDraft() {
      let form = this.getSampleData();
      this.loading = true;
      saveDraftAssistSample(form).then((res) => {
        this.loading = false;
        if (res.data.code === 0) {
          this.$message.success("保存草稿成功");
          console.log("success:", res.data.data);
          this.$router.go(-1);
        } else {
          console.error("err:", res.data.msg);
          this.$message.error("保存草稿失败");
        }
      });
    },
    submit() {
      let form = this.getSampleData();
      this.loading = true;
      submitAssistSample(form).then((res) => {
        this.loading = false;
        if (res.data.code === 0) {
          this.$message.success("提交成功");
          console.log("success:", res.data.data);
          this.$router.go(-1);
        } else {
          console.error("err:", res.data.msg);
          this.$message.error("提交失败");
        }
      });
    },
    changeWordData(val) {
      this.wordUrl = val.wordUrl;
      this.fileId = val.fileID;
    },
    async changeFullOrCoreForm(val) {
      this.pageLoading = true;
      this.isShowCoreForm = val;
      const ignores = ["bigtitle", "title", "table"];
      this.newSmallFormJsonsOriginal.forEach((item, index) => {
        this.formList[index] = {};
        item.column.forEach((cln) => {
          if (!ignores.includes(cln.type)) {
            this.formList[index][cln.prop] = this.sampleData[cln.prop];
          }
          //填写协查样本,分享模块设置为编辑状态，模块所属子表单数据置空
          if ("create" === this.operType) {
            if (
              "dynamic" === cln.type &&
              AppConstant.FormModuleOperType.EDIT === item.share
            ) {
              this.formList[index][cln.prop] = [];
            }
          }
        });
      });

      if (this.isShowCoreForm) {
        this.newSmallFormJsonsOriginal.forEach((item, index) => {
          this.$set(
            this.newSmallFormJsonsOriginal,
            index,
            this.$refs[`jsonToForm${index}`][0].json
          );
          this.$set(
            this.formList,
            index,
            this.$refs[`jsonToForm${index}`][0].form
          );
        });
      } else {
        this.coreFullIndexList.forEach((itemIndex, index) => {
          this.$set(
            this.newSmallFormJsonsOriginal,
            itemIndex,
            this.$refs[`jsonToForm${index}`][0].json
          );
          this.$set(
            this.formList,
            itemIndex,
            this.$refs[`jsonToForm${index}`][0].form
          );
        });
      }

      this.newSmallFormJsons = [];
      this.jsonToFormVisible = false;
      this.jsonToFormRowVisible = false;
      await this.sleep(500);

      this.jsonFormIndexArray = [];
      if (this.isShowCoreForm) {
        this.newSmallFormJsons = this.newSmallFormJsonsOriginal.filter(
          (item, index) => {
            if (item.coreItem) {
              this.jsonFormIndexArray.push(index);
              return item;
            }
          }
        );
        this.formList = this.formList.filter((item, index) => {
          if (this.coreFullIndexList.includes(index)) {
            return item;
          }
        });
      } else {
        this.newSmallFormJsonsOriginal.forEach((item, index) => {
          this.newSmallFormJsons.push(item);
        });
      }

      this.jsonToFormRowVisible = true;
      this.jsonToFormVisible = true;
      this.$forceUpdate();
      this.$nextTick(() => {
        this.newSmallFormJsons.forEach((item, index) => {
          this.$refs[`jsonToForm${index}`][0].taskId = this.result.taskId;
          this.$refs[`jsonToForm${index}`][0].json = item;
          this.$refs[`jsonToForm${index}`][0].form = this.formList[index];
          this.$refs[`jsonToForm${index}`][0].add = item.add;
          this.$refs[`jsonToForm${index}`][0].init();
          this.$refs[`jsonToForm${index}`][0].visible = item.visible;
        });
      });
      this.pageLoading = false;
      this.$forceUpdate();
      this.setCatalogue(this.isShowCoreForm);
    },
    async sleep(timeout) {
      return new Promise((resolve) => {
        setTimeout(resolve, timeout);
      });
    },
  },
};
</script>

<style scoped>
.right-sample-detail-full {
  height: calc(100vh - 195px);
  background: white;
  border-radius: 5px;
  margin-top: 10px;
}
.right-sample-detail {
  height: calc(100vh - 275px);
  background: white;
  border-radius: 5px;
  margin-top: 10px;
}
.questionnaire-form {
  width: 100%;
  overflow-y: auto;
  padding-bottom: 10%;
}
</style>
