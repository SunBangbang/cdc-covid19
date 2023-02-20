<template>

  <div>

    <el-dialog
      :title="title"
      width="80%"
      top="5vh"
      :visible.sync="dialogVisible"
      :close-on-click-modal="disabled"
      destroy-on-close
      :before-close="closeDialog"
      append-to-body
    >

      <el-form
        ref="form"
        :model="form"
        :disabled="disabled"
        class="dynamicFormClass"
        label-position="top"
        label-width="150px"
      >

        <el-row :gutter="30">

          <el-col
            v-for="(item, index) in column"
            :key="index"
            :span="item.span"
          >

            <!--            <h3 style="color:red" v-if="item.component && item.component === 'el-divider'">{{item.label}}</h3>-->

            <el-form-item
              v-if="item.display"
              :rules="getRule(item, form)"
              :prop="item.prop"
            >

              <template slot="label">

                <span :class="item.fieldRequired ? 'live-required' : ''">
                  {{ item.label }}：
                </span>

                <span v-if="item.type === 'input' || item.type === 'textarea'">

                  <el-tooltip
                    v-if="item.placeholder && item.placeholder.length > 10"
                    effect="light"
                    :content="item.placeholder"
                    placement="top-start"
                  >

                    <span style="opacity: 0.5">
                      ({{ item.placeholder.substring(0, 10) }}...)
                    </span>

                  </el-tooltip>

                  <span v-else style="opacity: 0.5">
                    ({{ item.placeholder !== undefined ? item.placeholder : ""
                    }})
                  </span>

                </span>

                <span class="dynamic-label">

                  <!--固定值为'0'时弹出关联子表单 -->

                  <el-button
                    class="dynamic-form-add-button"
                    style="margin-left: 20px"
                    v-if="
                      item.relatedDynamic &&
                        item.relatedDynamic !== '' &&
                        form[item.prop] === item.relFormVal
                    "
                    type="primary"
                    size="mini"
                    icon="el-icon-plus"
                    @click="
                      openDialog(item.relatedDynamic, item.prop, item.label)
                    "
                  >

                  </el-button>

                </span>

              </template>

              <base-form-item
                :item="item"
                :form="form"
                :columns="column"
                :did="form.did"
                :range-date="rangeDate"
                @revalidateField="revalidateField"
                @newAddress="handNewAddress"
                :pprop="prop"
                :ptype="ptype"
                :add="add"
              >

              </base-form-item>

            </el-form-item>

          </el-col>

        </el-row>

      </el-form>

      <span slot="footer" class="dialog-footer" v-if="!disabled">

        <span v-if="!syncFormData">

          <el-button type="primary" @click="submitForm">确 定</el-button>

          <el-button @click="closeDialog">取 消</el-button>

        </span>

        <span v-else>

          <span style="font-size:16px;float: left">
            注：此弹框内容与表格对应内容自动同步！
          </span>

        </span>

      </span>

    </el-dialog>

  </div>

</template>

<script>
import BaseFormItem from "./base-form-item";
import createComponent from "./createComponent";
import { FormHandler } from "./formHandler";
import { mapGetters } from "vuex";
import validate from "../mixins/validate-mixin";

export default {
  name: "dynamicFormDialog",
  mixins: [validate],
  components: {
    BaseFormItem
  },
  props: {
    rangeDate: {
      type: Object,
      default: () => {
        return null;
      }
    },
    title: {
      type: String,
      default: "新增"
    },
    column: {
      type: Array,
      default: () => {
        return [];
      }
    },
    form: {
      type: Object,
      default: () => {
        return {};
      }
    },
    item: {
      type: Object,
      default: () => {
        return {};
      }
    },
    audit: {
      type: Boolean,
      default: false
    },
    prop: {
      type: String,
      default: ""
    },
    index: {
      type: Number,
      default: -1
    },
    disabled: {
      type: Boolean,
      default: () => {
        return false;
      }
    },
    syncFormData: {
      type: Boolean,
      default: () => {
        return false;
      }
    }
  },
  data() {
    return {
      dialogVisible: false,
      ptype: "form", //父组件为表单子表单
      disableDelete: false,
      newAddresses: new Set() //新增的地址，来源regionSelect
    };
  },
  computed: {
    ...mapGetters(["getDataSource"]),
    add: function() {
      return this.index === -1;
    }
  },
  methods: {
    revalidateField(obj) {
      console.log("revalidateField:", obj, this.form[obj.prop]);
      if (typeof obj === "object") {
        this.$refs["form"].validateField(obj.prop);
      }
    },
    getRule(item, data) {
      // console.log('dynamic:', item, data, this.form)
      if ("input" === item.type && item.idCard && eval(item.idCard)) {
        return this.getNumberRule(item, this.form[item.idTypeProp]);
      }
      let component = createComponent(item, this.form);
      let rule = component.getRule();

      return rule;
    },
    /**
     * 单选按钮触发打开子表单
     * @param relatedProp 关联子表单属性
     * @param prop 组件属性
     * @param label 组件标签
     */
    openDialog(relatedProp, prop, label) {
      //可能是显隐触发的，获取显隐来源
      let dataSource = this.getDataSource(prop);
      let srcTitle =
        dataSource != null ? dataSource.label + " " + label : label;
      //添加子表单标题
      srcTitle = this.title.substring(2) + "/" + srcTitle;
      let param = {
        prop: relatedProp,
        did: this.form.did,
        sourceTitle: srcTitle
      };
      this.$emit("openDialog", param);
    },
    init() {
      this.dialogVisible = true;
    },
    //取消
    closeDialog(done) {
      console.log(this.form)
      console.log("close dialog..........");
      if(!this.syncFormData) {
        this.onClose()
        return
      }
      if(this.valueAllEmpty(this.form)) {
        console.log('empty...')
        this.onClose()
        done()
        return
      }
      this.$refs["form"].validate((valid, err) => {
        if (valid) {
          let errs = []
          let formHandler = new FormHandler(this.column, this.form);
          errs = formHandler.doLogicValidate();
          if (errs.length > 0) {
            this.$message({
              dangerouslyUseHTMLString: true,
              message: errs.join("<br/>"),
              type: "error",
              duration: 0,
              showClose: true
            });
          } else {
            this.onClose()
            done()
          }
        }
      });
    },
    onClose() {
      this.dialogVisible = false;
      if (this.disableDelete) {
        this.$emit("destoryWithoutRemove", { form: this.form });
      } else {
        this.$emit("destory");
      }
      //删除刚才新增的地址
      this.$store.commit("deleteRegionAddress", { del: this.newAddresses });
    },
    valueAllEmpty(data) {
      let isEmpty = true
      let address = JSON.stringify({ids: null, name: null, detailedAddress: null})
      let address2 = JSON.stringify({ids: null, name: "", detailedAddress: null, addressIds: []})
      Object.keys(data).forEach((item) => {
        if(item != 'did' && item != 'pDid') {
          if(data[item] && JSON.stringify(data[item]) != address && JSON.stringify(data[item]) != address2) {
            isEmpty = false
          }
        }
      })
      return isEmpty
    },
    //提交
    submitForm() {
      this.$refs["form"].validate((valid, err) => {
        // console.log('validate dynamic:', valid, ' ', err)
        // console.log('submit dynamic form:', this.form)
        if (valid) {
          let formHandler = new FormHandler(this.column, this.form);
          let errs = formHandler.doLogicValidate();
          if (errs.length > 0) {
            this.$message({
              dangerouslyUseHTMLString: true,
              message: errs.join("<br/>"),
              type: "error",
              duration: 0,
              showClose: true
            });
          } else {
            this.$emit("callback");
            this.dialogVisible = false;
          }
        }
      });
    },
    handNewAddress(fullAddress) {
      this.newAddresses.add(fullAddress);
    }
  }
};
</script>

<style scoped>
.dynamicFormClass {
  padding-left: 30px;
}
:deep(.el-dialog__body) {
  max-height: 75vh !important;
  min-height: 10vh;
  overflow-y: auto;
}
</style>

