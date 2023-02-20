<template>
  <div class="form-container">
    <div>
    
      <!-- <keep-alive include=""> -->
        
      <BaseFormCore
        ref="columnForm"
        v-model="form"
        :column="json.column"
        :relation="json.relation"
        :gutter="json.gutter"
        :label-width="json.labelWidth"
        :label-position="json.labelPosition"
        :add="add"
        :auditSample="auditSample"
        :disabled="disabled"
        :taskId="taskID"
        :isShowCoreForm="isShowCoreForm"
        v-if="visible && isShowCoreForm"
      >
      </BaseFormCore>
    <!-- </keep-alive>
    <keep-alive include=""> -->
        <BaseForm
        ref="columnForm"
        v-model="form"
        :column="json.column"
        :relation="json.relation"
        :gutter="json.gutter"
        :label-width="json.labelWidth"
        :label-position="json.labelPosition"
        :add="add"
        :auditSample="auditSample"
        :disabled="disabled"
        :taskId="taskID"
        :isShowCoreForm="isShowCoreForm"
        v-if="visible && !isShowCoreForm"
      >
      </BaseForm>
   
    <!-- </keep-alive> -->
      <!-- 按钮 -->
      <el-row class="text-center" v-if="!disabled">
        <el-button v-if="json.submitBtn" type="primary" @click="submitForm">
          {{ json.submitText }}
        </el-button>
        <el-button
          v-if="json.saveDraftBtn"
          type="primary"
          @click="saveDraftForm"
        >
          保存草稿
        </el-button>
        <el-button v-if="json.rejectBtn" type="primary" @click="rejectForm">
          驳回
        </el-button>
        <el-button v-if="json.emptyBtn" @click="clearForm">
          {{ json.emptyText }}
        </el-button>
      </el-row>
    </div>

    <el-dialog
      title="未填项和逻辑项提示"
      :visible.sync="dialogVisible"
      width="60%"
      append-to-body
      v-if="renderDialog"
    >
      <el-collapse v-model="activeNames" v-if="renderDialog">
        <el-collapse-item title="未填项" name="1">
          <div
            style="color: #f47920"
            v-for="(err, index) in errMsgList"
            :key="index"
          >
            {{ err }}
          </div>
        </el-collapse-item>
        <el-collapse-item title="逻辑项" name="2">
          <div
            style="color: #d71345"
            v-for="(err, index) in logicErrMsgList"
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
        <el-button v-if="!auditSample.audit" type="primary" @click="saveForm"
          >仍然提交</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { log } from '@antv/g2plot/lib/utils';
import BaseForm from "./base-form";
import BaseFormCore from "./base-form-core";
import { FormHandler } from "./formHandler";

export default {
  name: "jsonToForm",
  components: {
    BaseForm,
    BaseFormCore
  },
  props: {
    text: {
      type: String,
      default: () => {
        return null;
      }
    },
    disabled: {
      type: Boolean,
      default: false //true->禁止编辑, false->可以编辑
    },
    renderDialog: {
      type: Boolean,
      default: true
    },
    taskID: {
      type: String || null,
      default: () => {
        return null;
      }
    },
    isShowCoreForm: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      // 表单数据
      form: {},
      // 表单json
      json: {
        column: [],
        relation: {},
        submitBtn: false, //提交按钮
        saveDraftBtn: false, //提交草稿
        emptyBtn: false, //清空按钮
        rejectBtn: false //驳回按钮
      },
      visible: false,
      // 是否初始化表单数据
      add: true,
      auditSample: { nonDynaAudit: {}, dynaAudit: {}, audit: false },
      dialogVisible: false,
      activeNames: ["1", "2"],
      taskId: "",
      errMsgList: [],
      logicErrMsgList: [],
      formHandler: null
    };
  },
  created() {},
  methods: {
    init() {
      // console.log("title:", this.json.title);
      // console.log("view form-json:", this.json);
      // console.log("view form-data:", this.form);
      // console.log(">>",this.json.column);
      this.formHandler = new FormHandler(this.json.column, this.form, this.add);
      this.$store.commit("setFormHandler", this.formHandler);
      // console.log();
    },
    // 表单提交
    submitForm() {
      if (!this.formHandler) {
        this.formHandler = new FormHandler(
          this.json.column,
          this.form,
          this.add
        );
      }
      //非审核提交，提示：提交质控员审核
      if (!this.auditSample.audit) {
        let text = this.text ? this.text : "确认提交质控员审核？";
        this.$confirm(text, { cancelButtonClass: "btn-custom-cancel" })
          .then(_ => {
            const result = this.$refs["columnForm"].validateForm();
            const logicErrs = this.formHandler.doLogicValidate();
            if (result.valid) {
              this.errMsgList = result.errList;
              this.logicErrMsgList = logicErrs;
              if (this.logicErrMsgList.length > 0) {
                this.dialogVisible = true;
              } else {
                console.log("valid, submit form:", this.form);
                this.$emit("submit", this.form);
              }
            } else {
              this.errMsgList = result.errList;
              this.logicErrMsgList = logicErrs;
              if (
                this.errMsgList.length > 0 ||
                this.logicErrMsgList.length > 0
              ) {
                this.dialogVisible = true;
              }
            }
          })
          .catch(() => {});
      } else {
        this.auditForm();
      }
    },
    // 表单审核提交
    auditForm() {
      if (!this.formHandler) {
        this.formHandler = new FormHandler(
          this.json.column,
          this.form,
          this.add
        );
      }
      const result = this.$refs["columnForm"].validateForm();
      const logicErrs = this.formHandler.doLogicValidate();
      if (result.valid) {
        this.logicErrMsgList = logicErrs;
        if (this.logicErrMsgList.length > 0) {
          this.dialogVisible = true;
        } else {
          this.$confirm("确认通过审核？", {
            cancelButtonClass: "btn-custom-cancel"
          }).then(_ => {
            console.log("valid, submit form:", this.form);
            this.$emit("submit", this.form);
          });
        }
      } else {
        this.errMsgList = result.errList;
        this.logicErrMsgList = logicErrs;
        if (this.errMsgList.length > 0 || this.logicErrMsgList.length > 0) {
          this.dialogVisible = true;
        }
      }
    },
    saveForm() {
      console.log("direct to save form:", this.form);
      this.$emit("submit", this.form);
      this.dialogVisible = false;
    },
    popupError(errMsgList) {
      this.errMsgList = errMsgList;
      this.dialogVisible = true;
    },
    // 数据清空
    clearForm() {
      this.$refs["columnForm"].clearForm();
    },
    saveDraftForm() {
      this.$emit("saveDraft", this.form);
    },
    rejectForm() {
      this.$emit("reject");
    },
    getLogicErr() {
      return this.formHandler.doLogicValidate();
    },
    getValidate() {
      return this.$refs["columnForm"].validateForm();
    }
  }
};
</script>
<style lang="scss" scoped>
.form-container {
  padding: 20px;
}
</style>
