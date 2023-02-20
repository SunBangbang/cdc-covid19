<template>
  <div>
    <el-row>
      <el-col>
        <div>
          <i class="el-icon-arrow-left back-button" @click="goBack">返回</i>
        </div>
      </el-col>
    </el-row>
    <el-card
      shadow="never"
      class="aui-card--fill form"
      id="tt"
      style="
        height: 90vh;
        overflow-scrolling: auto;
        overflow: scroll;
        padding: 20px 0;
      "
    >
      <el-button @click="changeFullOrCoreForm" size="mini">{{
        showFormText
      }}</el-button>
      <json-to-form
        class="jsonToForm"
        ref="jsonToForm"
        :disabled="true"
        :isShowCoreForm="isShowCoreForm"
      ></json-to-form>
    </el-card>
    <slider div-id="tt"></slider>
  </div>
</template>
<script>
import {
  getReleaseFormJson,
  getFormJson,
} from "@/api/survey-form/questionnaire";
import { getFormJson as getModuleFormJson } from "@/api/survey-form/commonModule";
import JsonToForm from "@/components/form-design/form-json";
import Loading from "@/utils/Loading";
import Slider from "@/components/slider/up-bottom-slider";
export default {
  components: {
    Slider,
    JsonToForm,
  },
  data() {
    return {
      formJson: {
        json: {
          disabled: true,
        },
      },
      // jsonToFormVisible: false,
      loadingInstance: null,
      //查看类别， 默认release， 查看发布版本
      viewType: "release",
      isShowCoreForm: true,
      showFormText: "显示全量调查表",
    };
  },
  created() {
    let surveyFormId = this.$route.params.id;
    let type = this.$route.params.type;
    let version = this.$route.query.version;
    let formType = this.$route.query.formType;
    let viewType = this.$route.query.viewType;
    this.viewType = viewType ? viewType : this.viewType;
    console.log(
      "surveyFormId:",
      surveyFormId,
      " ",
      type,
      "  ",
      version,
      " ",
      formType,
      " ",
      this.viewType
    );
    this.init(surveyFormId, type, version, formType);
  },
  mounted() {
    this.loadingInstance = new Loading(".form");
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    init(surveyFormId, type, version, formType) {
      this.handleGetFormJson(surveyFormId, type, version, formType);
    },
    loadFormJson(callback, surveyFormId, version, formType) {
      callback(surveyFormId, version, formType)
        .then((res) => {
          if (res.data.code === 0) {
            this.formJson = res.data.data;
          } else {
            this.$message.success(res.data.msg);
          }
          // this.jsonToFormVisible = true
        })
        .then(() => {
          this.$nextTick(() => {
            let json;
            if (typeof this.formJson.json === "string") {
              json = JSON.parse(this.formJson.json);
            } else {
              json = this.formJson.json;
            }
            json.disabled = true;
            this.$refs["jsonToForm"].json = json;
            this.$refs["jsonToForm"].visible = true;
            this.loadingInstance.close();
          });
        })
        .catch(() => {
          this.loadingInstance.close();
        });
    },
    // 获取formJson  getReleaseFormJson, getFormJson
    handleGetFormJson(surveyFormId, type, version, formType) {
      console.log("getFormJson:", type, this.viewType);
      if (type === "questionnaire") {
        if (this.viewType === "release") {
          this.loadFormJson(
            getReleaseFormJson,
            surveyFormId,
            version,
            formType
          );
        } else {
          this.loadFormJson(getFormJson, surveyFormId, version, formType);
        }
      } else if (type === "module") {
        this.loadFormJson(getModuleFormJson, surveyFormId, version, formType);
      }
    },
    changeFullOrCoreForm() {
      this.isShowCoreForm = !this.isShowCoreForm;
      if (this.isShowCoreForm) {
        this.showFormText = "显示全量调查表";
        this.$nextTick(() => {
          // this.$refs["jsonToForm"].json = this.formJson.json;
          // this.$refs["jsonToForm"].form = this.data;
          this.$refs["jsonToForm"].visible = true;
          this.$refs["jsonToForm"].init();
        });
      } else {
        this.showFormText = "显示核心信息表";
        this.$nextTick(() => {
          // this.$refs["jsonToForm"].json = this.formJson.json;
          // this.$refs["jsonToForm"].form = this.data;
          this.$refs["jsonToForm"].visible = true;
          this.$refs["jsonToForm"].init();
        });
      }
      this.$forceUpdate();
    },
  },
};
</script>
<style lang="scss" scoped>
.back-button {
  padding: 10px;
  color: #00bfbf;
  cursor: pointer;
}
.scroll-jump-father {
  //position: absolute;
  top: 77vh;
  right: 30px;
  //float: right;
  //z-index: 99999;
}
</style>
