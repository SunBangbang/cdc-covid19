<template>
  <div class="style-dynamic">
    <el-form-item
      v-if="item.label"
      :label="item.label"
      :id="'label_' + item.prop"
      class="group-label"
    >
    </el-form-item>
    <div class="dynamic-label">
      <el-button
        class="dynamic-form-add-button"
        v-if="item.children.type === 'form'"
        type="primary"
        size="mini"
        icon="el-icon-plus"
        @click="openAddDynamicDialog()"
      >
      </el-button>
    </div>
    <!-- dynamic（type === 'form'）-->
    <el-form-item class="dynamic-form" v-if="item.children.type === 'form'">
      <div
        v-for="(tableData, index) in form[item.prop]"
        :ref="'box' + index"
        :key="'tableData-' + index"
      >
        <el-row>
          <el-collapse v-model="activeNames" @change="handleCollapseChange">
            <el-collapse-item :name="index">
              <template slot="title" style="width: 100%">
                <!--                      :title="getTitle(index, item.children.column, tableData)"-->
                <el-row style="width: 100%" class="form-row">
                  <el-col :span="23">
                    <el-descriptions
                      :title="
                        computedDescriptionTitle(dynaAudit[tableData.did])
                      "
                      :column="2"
                      size="medium"
                    >
                      <!-- <el-descriptions-item
                        v-for="(major, index) in getPartTitle(
                          index,
                          item.children.column,
                          tableData
                        )"
                        :key="index"
                        :label="major.label"
                      >
                        {{ major.val }}
                      </el-descriptions-item> -->
                      <el-descriptions-item
                        v-for="(major, index) in getDescriptionTitle(
                          index,
                          collapseDescriptionsList,
                          tableData
                        )"
                        :key="index"
                        :label="major.label"
                      >
                        {{ major.val }}
                      </el-descriptions-item>
                    </el-descriptions>
                    <!-- <el-descriptions
                      v-if="!audit"
                      :title="item.label"
                      :column="2"
                      size="medium"
                    >
                      <el-descriptions-item
                        v-for="(major, index) in getPartTitle(
                          index,
                          item.children.column,
                          tableData
                        )"
                        :key="index"
                        :label="major.label"
                      >
                        {{ major.val }}
                      </el-descriptions-item>
                    </el-descriptions>
                    <el-descriptions
                      v-else
                      :title="
                        '流调员: ' + getInvestigator(dynaAudit[tableData.did])
                      "
                      :column="2"
                      size="medium"
                    >
                      <el-descriptions-item
                        v-for="(major, index) in getPartTitle(
                          index,
                          item.children.column,
                          tableData
                        )"
                        :key="index"
                        :label="major.label"
                      >
                        {{ major.val }}
                      </el-descriptions-item>
                    </el-descriptions> -->
                  </el-col>
                  <el-col :span="1">
                    <div style="position: absolute; right: 5px">
                      <el-button
                        type="primary"
                        size="mini"
                        icon="el-icon-copy-document"
                        @click.stop="rowCopyDynamic(item, tableData)"
                      >
                      </el-button>
                      <el-button
                        type="primary"
                        size="mini"
                        icon="el-icon-edit"
                        @click.stop="rowEditDynamic(item, index)"
                      >
                      </el-button>
                      <el-button
                        type="danger"
                        size="mini"
                        icon="el-icon-delete"
                        @click.stop="rowRemoveDynamic(item, index)"
                      >
                      </el-button>
                    </div>
                  </el-col>
                </el-row>
              </template>
              <el-col
                :span="24"
                style="border-top: 1px dashed #17b3a3"
                v-if="computedChangeDisplay(index)"
              >
                <el-row class="dynamic-form-row">
                  <div
                    v-for="(tableColumn, index) in item.children.column"
                    :key="'tableColumn-' + index"
                  >
                    <el-col :span="tableColumn.span">
                      <el-form-item
                        class="dynamic-form-item"
                        v-if="
                          hasValue(tableColumn, tableData) &&
                          tableColumn.type === 'upload'
                        "
                        :id="'label_' + tableColumn.prop"
                        :label="tableColumn.label"
                      >
                        <el-row
                          v-for="(item, uploadIndex) in tableData[
                            tableColumn.prop
                          ]"
                          :key="'upload-' + uploadIndex"
                        >
                          <el-button
                            type="text"
                            @click="uploadClick(item)"
                            >{{ item.name }}</el-button
                          >
                        </el-row>
                      </el-form-item>
                      <el-form-item
                        class="dynamic-form-item"
                        v-else-if="
                          hasValue(tableColumn, tableData) &&
                          formatFormValue(tableColumn, tableData)
                        "
                        :id="'label_' + tableColumn.prop"
                        :label="tableColumn.label"
                      >
                        <template>
                          {{
                            tableData[tableColumn.prop]
                              | formatFormValue(tableColumn, tableData)
                          }}
                        </template>
                      </el-form-item>
                    </el-col>
                  </div>
                </el-row>
              </el-col>
            </el-collapse-item>
          </el-collapse>
        </el-row>
      </div>
    </el-form-item>

    <!-- dynamic（type === 'table'）-->
    <el-table v-else class="dynamic-table" :data="form[item.prop]">
      <el-table-column align="center" :width="80" fixed>
        <template slot-scope="scope" slot="header">
          <el-button
            type="primary"
            icon="el-icon-plus"
            class="table-icon"
            round
            @click="handleDynamicAdd(item)"
          >
          </el-button>
        </template>
        <template slot-scope="scope">
          <el-button
            type="primary"
            circle
            icon="el-icon-copy-document"
            class="table-icon"
            @click="rowCopyTabDynamic(item, scope.$index)"
          >
          </el-button>
          <el-button
            type="danger"
            circle
            icon="el-icon-delete"
            class="table-icon"
            @click="rowRemoveDynamic(item, scope.$index)"
          >
          </el-button>
          <el-row>
            <i
              class="el-icon-edit table-icon table-dynamic-icon"
              @click="rowEditDynamic(item, scope.$index, true)"
            ></i>
            <el-popover
              width="300"
              v-if="audit && dynaAudit[scope.row.did]"
              placement="right"
              trigger="hover"
            >
              <p>填写调查员:</p>
              <div style="">
                <span
                  v-for="investigator in dynaAudit[scope.row.did].investigators"
                >
                  {{ investigator }}
                </span>
              </div>
              <!--审核 -->
              <el-button
                type="primary"
                class="table-icon"
                circle
                style="margin-left: 12px"
                icon="el-icon-view"
                slot="reference"
              ></el-button>
            </el-popover>
          </el-row>
        </template>
      </el-table-column>
      <!--      下面的label和width只适用于疫苗接种情况，其它不适用，需要额外加逻辑-->
      <!--疫苗接种情况模块业务属性：vacTimes -->
      <el-table-column
        type="index"
        :label="serialNoLabel"
        align="center"
        :width="serialNoWidth"
        fixed
      >
      </el-table-column>
      <el-table-column
        v-for="(tableColumn, tableColumnIndex) in tableItemList"
        :key="'tableColumn-' + tableColumnIndex"
        :label="tableColumn.label"
        :width="tableColumn.width"
        :fixed="tableColumnIndex === 0"
      >
        <template slot-scope="scope">
          {{ handleTableItem(tableColumn, form[item.prop][scope.$index]) }}
        </template>
      </el-table-column>
      <!-- <el-table-column
        v-for="(tableColumn, tableColumnIndex) in item.children.column"
        :key="'tableColumn-' + tableColumnIndex"
        :label="tableColumn.label"
        :width="tableColumn.width"
        :fixed="tableColumnIndex === 0"
      >
        <template slot-scope="scope">
          <el-form
            :model="form[item.prop][scope.$index]"
            :ref="`form${tableColumn.prop}${scope.$index}`"
            :disabled="disabled"
          >
            <el-form-item
              :prop="tableColumn.prop"
              :rules="getRule(tableColumn, form[item.prop][scope.$index])"
              style="margin-top: 20px"
            >
              <base-form-item
                v-if="tableColumn.display"
                :item="tableColumn"
                :form="form[item.prop][scope.$index]"
                :relatedTable="item.relatedTable"
                @changeCallback="changeCallback"
                :add="add"
                @revalidateField="revalidateField"
                :range-date="getMiniDate(scope.$index)"
                :did="form[item.prop][scope.$index].did"
                :pprop="item.prop"
                :ptype="ptype"
                :columns="item.children.column"
              >
              </base-form-item>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column> -->
      <el-table-column
        v-if="isContactLocation"
        label="接触地点"
        align="center"
        width="150"
      >
        <template slot-scope="scope">
          {{
            form[item.prop][scope.$index].sourceTitle
              ? form[item.prop][scope.$index].sourceTitle
              : "无"
          }}
        </template>
      </el-table-column>
    </el-table>
    <dynamic-form-dialog
      v-if="dynamicFormDialogVisible"
      :title="dynamicDialogTitle"
      :column="dynamicDialogColumn"
      :item="item"
      :disabled="disabled"
      :form="dynamicDialogForm"
      :prop="dynamicDialogProp"
      :index="dynamicDialogIndex"
      :audit="audit"
      :sync-form-data="syncFormData"
      :range-date="getMiniDate(dynamicDialogIndex)"
      ref="dynamicFormDialog"
      @openDialog="openDialog"
      @destory="destroyDialog"
      @destoryWithoutRemove="destroyDialogWithoutRemove"
      @callback="dynamicFormDialogCallback"
    >
    </dynamic-form-dialog>
    <!--    <table-form-dialog v-if="item.children.type === '' && tableDialogVisible"></table-form-dialog>-->
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="" />
    </el-dialog>
  </div>
</template>

<script>
import BaseFormItem from "@/components/form-design/form-json/base-form-item";
import createComponent from "@/components/form-design/form-json/createComponent";
import DynamicFormDialog from "@/components/form-design/form-json/dynamic-form-dialog";
import { getUUID2 } from "@/utils";
import { mapGetters } from "vuex";
import { isUndefined, isEmpty } from "@antv/util";
import validate from "../mixins/validate-mixin";
import moment from "moment";
import { FormHandler } from "./formHandler";
import { item } from "copy-concurrently";

export default {
  name: "base-form-dynamic",
  mixins: [validate],
  components: {
    BaseFormItem,
    DynamicFormDialog,
  },
  props: {
    form: {
      type: Object,
      default: () => {
        return {};
      },
    },
    item: {
      type: Object,
      default: () => {
        return {};
      },
    },
    columns: {
      type: Array,
      default: () => {
        return [];
      },
    },
    //是否是新增
    add: {
      type: Boolean,
      default: true,
    },
    audit: {
      type: Boolean,
      default: false,
    },
    dynaAudit: {
      type: Object,
      default: () => {
        return {};
      },
    },
    disabled: {
      type: Boolean,
      default: () => {
        return false;
      },
    },
  },
  data() {
    return {
      dynamicFormDialogVisible: false,
      dialogVisible: false, //upload组件显示图像dialog
      dialogImageUrl: "", //upload组件显示图像url
      dynamicDialogTitle: "",
      dynamicDialogColumn: [],
      dynamicDialogForm: {},
      dynamicDialogProp: "",
      dynamicDialogIndex: -1,
      activeNames: [],
      ptype: "table", //父组件为表格子表单
      sourceTitle: null,
      isTrack: false, //是否是轨迹子表单,
      syncFormData: false,
      collapseDescriptionsList: [],
      tableItemList: [],
      serialNoLabel: "序号",
      serialNoWidth: 50,
      isContactLocation: false,
      ccDids: [],
    };
  },
  created() {
    this.init();
  },
  filters: {
    formatFormValue(value, column, form) {
      const component = createComponent(column, form);
      return component.label;
    },
  },
  computed: {
    ...mapGetters([
      "relationList",
      "formHandler",
      "getDynaFormLastRecord",
      "getCcDids",
    ]),
    computedChangeDisplay() {
      return function (index) {
        if (this.activeNames.indexOf(Number(index)) === -1) {
          return false;
        } else {
          return true;
        }
      };
    },
    computedDescriptionTitle() {
      return function (row) {
        if (!this.audit) {
          return this.item.label;
        }
        return this.getInvestigator(row);
      };
    },
  },
  destroyed() {
    this.$store.commit("clearDynaFormLastRecord");
  },
  methods: {
    revalidateField(obj) {
      console.log("revalidateField:", obj);
      if (typeof obj === "object") {
        let index = this.form[this.item.prop].findIndex(
          (value) => value.did === obj.did
        );
        let formArray = this.$refs[`form${obj.prop}${index}`];
        if (formArray) {
          formArray.forEach((item) => {
            item.validateField(obj.prop);
          });
        }
      }
    },
    getRule(item, data) {
      if ("input" === item.type && item.idCard && eval(item.idCard)) {
        return this.getNumberRule(item, data[item.idTypeProp]);
      }
      let component = createComponent(item, this.form);
      let rule = component.getRule();
      return rule;
    },
    getInvestigator(row) {
      if (row) {
        let val = row.investigators;
        let str = "";
        if (val) {
          let set = new Set(val);
          set.forEach((item) => {
            str += item + "、";
          });
          // console.log(set,str, str.slice(0, str.length -1))
        }
        return "流调员: " + str.slice(0, str.length - 1);
      } else {
        return "流调员: " + this.$store.state.form.currentUser;
      }
    },
    getMiniDate(index) {
      return {
        index: index,
        tag: this.item.tag,
        start: this.form[this.item.prop][index - 1]
          ? this.form[this.item.prop][index - 1]
          : null,
        end: this.form[this.item.prop][index + 1]
          ? this.form[this.item.prop][index + 1]
          : null,
      };
    },
    openDialog(param) {
      this.$emit("openDialog", param);
    },
    formatFormValue(column, form) {
      const component = createComponent(column, form);
      let label = column.label;
      return component.label ? label + ": " + component.label : null;
    },
    formatSourceFormValue(column, form) {
      const component = createComponent(column, form);
      return component.label ? component.label : null;
    },
    // getTitle(index, column, data, form) {
    //   // console.log('title:', column,  '  data:', data, '  form:', form)
    //   const title = index + 1 + "、 ";
    //   let arr = [];

    //   column.forEach(cln => {
    //     if (cln.collapseTitle) {
    //       const val = this.formatFormValue(cln, data);
    //       if (val) {
    //         arr.push(val);
    //       }
    //     }
    //   });
    //   return title + arr.join(", ");
    // },
    getPartTitle(index, column, data, form) {
      let arr = [];

      column.forEach((cln) => {
        if (cln.collapseTitle) {
          let val = this.formatFormValue(cln, data);
          if (val) {
            let idx = val.indexOf(":");
            if (idx > -1) {
              let first = val.substring(0, idx);
              let second = val.substring(idx + 1).trim();
              if (/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}):(\d{2})$/g.test(second)) {
                second = moment(second).format("YYYY-MM-DD HH:mm");
              } else if (/^(\d{2}:\d{2}):(\d{2})$/g.test(val)) {
                second = second.substring(0, second.lastIndexOf(":"));
              }
              arr.push({ label: first, val: second });
            }
          }
        }
      });
      return arr;
    },
    init() {
      if (this.add) {
        // this.$set(this.form, this.item.prop, []);
      }
      let tracks = this.relationList.tracks;
      if (!this.validatenull(tracks)) {
        let arr = tracks.filter((item) => item.type === "dynamic");
        let dprops = arr.map((item) => item.address.split(".")[0]);
        if (dprops.includes(this.item.prop)) {
          this.isTrack = true;
          console.info("found track dynamic", this.item.label);
        }
      }

      if (this.item.children.type === "form") {
        this.item.children.column.forEach((item) => {
          if (item.collapseTitle) {
            this.collapseDescriptionsList.push(item);
          }
        });
      } else {
        this.isContactLocation =
          (this.item.parentDynamicProp && this.item.parentDynamicProp !== "") ||
          (this.item.parentProp && this.item.parentProp !== "");
        this.item.children.column.forEach((item) => {
          if (item.display) {
            this.tableItemList.push(item);
          }
        });
        this.serialNoLabel = this.item.tag === "vacTimes" ? "接种剂次" : "序号";
        this.serialNoWidth = this.item.tag === "vacTimes" ? 100 : 50;
      }

      console.info("set isTrack:", this.isTrack);
    },
    handleCollapseChange() {},
    getDescriptionTitle(index, column, data) {
      let arr = [];
      column.forEach((cln) => {
        let val = this.formatFormValue(cln, data);
        if (val) {
          let idx = val.indexOf(":");
          if (idx > -1) {
            let first = val.substring(0, idx);
            let second = val.substring(idx + 1).trim();
            if (/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}):(\d{2})$/g.test(second)) {
              second = moment(second).format("YYYY-MM-DD HH:mm");
            } else if (/^(\d{2}:\d{2}):(\d{2})$/g.test(val)) {
              second = second.substring(0, second.lastIndexOf(":"));
            }
            arr.push({ label: first, val: second });
          }
        }
      });
      return arr;
    },
    handleTableItem(column, data) {
      return this.formatSourceFormValue(column, data);
    },
    // dynamic（form or table）,编辑行
    rowEditDynamic(item, index, syncData) {
      this.dynamicFormDialogVisible = true;
      this.syncFormData = syncData ? syncData : false;
      let operType = this.disabled ? "查看" : "编辑";
      console.log(syncData);
      this.$nextTick(() => {
        this.dynamicDialogTitle = operType + `${item.label}`;
        this.dynamicDialogColumn = this.deepClone(item.children.column);
        this.dynamicDialogProp = item.prop;
        if (syncData) {
          this.dynamicDialogForm = this.form[item.prop][index];
          this.$refs["dynamicFormDialog"].disableDelete = true;
        } else {
          this.dynamicDialogForm = Object.assign(
            {},
            this.form[item.prop][index]
          );
          if (
            this.dynamicDialogForm.ccDids &&
            this.dynamicDialogForm.ccDids.length > 0
          ) {
            this.$store.commit("setCcDids", this.dynamicDialogForm.ccDids);
          }
        }
        this.dynamicDialogIndex = index;
        this.$refs["dynamicFormDialog"].init();
      });
    },
    //dynammic（form), 复制行
    rowCopyDynamic(item, data) {
      let { ccDids, ...tmp } = data;
      let ele = JSON.parse(JSON.stringify(tmp));
      ele.did = getUUID2();
      this.form[item.prop].push(ele);
      this.handleTrack();
      this.$forceUpdate();
    },
    rowCopyTabDynamic(item, index) {
      let data = this.form[item.prop][index];
      let { ccDids, ...tmp } = data;
      let ele = JSON.parse(JSON.stringify(tmp));
      // let ele = JSON.parse(JSON.stringify(data));
      delete ele.sourceTitle
      ele.did = getUUID2();
      this.form[item.prop].push(ele);
      this.syncRelatedTable(item, ele);
      this.handleTrack();
      this.$forceUpdate();
    },
    // dynammic（form), 新增
    openAddDynamicDialog(did, sourceTitle) {
      let lastRecord = this.getDynaFormLastRecord(this.item.prop);
      if (!this.validatenull(lastRecord)) {
        this.dynamicDialogForm = this.deepClone(lastRecord);
        this.dynamicDialogForm.did = getUUID2();
        this.dynamicFormDialogVisible = true;
        this.$nextTick(() => {
          this.dynamicDialogIndex = -1;
          this.$refs["dynamicFormDialog"].init();
        });
        return;
      }

      this.dynamicFormDialogVisible = true;
      this.sourceTitle = sourceTitle;
      this.$nextTick(() => {
        // if (this.item.children.relatedTable && this.item.children.relatedTable !== '') {
        //   this.form[this.item.children.relatedTable].push({});
        // }
        this.dynamicDialogTitle = `新增${this.item.label}`;
        this.dynamicDialogColumn = this.deepClone(this.item.children.column);
        this.dynamicDialogProp = this.item.prop;

        if (!isUndefined(did)) {
          this.dynamicDialogForm = { did: getUUID2(), pDid: did };
        } else if (!isUndefined(sourceTitle)) {
          this.dynamicDialogForm = {
            did: getUUID2(),
            sourceTitle: sourceTitle,
          };
        } else {
          this.dynamicDialogForm = { did: getUUID2() };
        }
        if (this.item.children.type === "") {
          this.handleDynamicAdd(this.item, this.dynamicDialogForm.did);
        }
        this.initFormDefault();
        this.dynamicDialogIndex = -1;
        this.$refs["dynamicFormDialog"].init();
      });
      // console.log("openAddDynamicDialog this.form", this.form);
    },
    initFormDefault() {
      this.dynamicDialogColumn.forEach((item) => {
        if (item.value) {
          this.$set(this.dynamicDialogForm, item.prop, item.value);
        } else {
          this.$set(
            this.dynamicDialogForm,
            item.prop,
            this.setFormItemDefault(item)
          );
        }
      });
    },
    setFormItemDefault(item) {
      let defaultValue;
      switch (item.type) {
        case "radio":
          defaultValue = "";
          break;
        case "checkbox":
          defaultValue = [];
          break;
        case "input":
          defaultValue = "";
          break;
        case "password":
          defaultValue = "";
          break;
        case "textarea":
          defaultValue = "";
          break;
        case "number":
          defaultValue = undefined;
          break;
        case "select":
          defaultValue = "";
          break;
        case "cascader":
          defaultValue = [];
          break;
        case "date":
          defaultValue = "";
          break;
        case "time":
          defaultValue = "";
          break;
        case "datetime":
          defaultValue = "";
          break;
        case "daterange":
          defaultValue = [];
          break;
        case "timerange":
          defaultValue = [];
          break;
        case "datetimerange":
          defaultValue = [];
          break;
        case "map":
          defaultValue = {};
          break;
        case "regionSelect":
          defaultValue = {};
          break;
        case "upload":
          defaultValue = [];
          break;
        case "autoFill":
          defaultValue = "";
          break;
        case "group":
          defaultValue = {};
          break;
        case "dynamic":
          defaultValue = [];
          break;
        case "bigtitle":
          defaultValue = "";
          break;
        case "ASR":
          defaultValue = "";
          break;
        case "measureTemperature":
          defaultValue = 0;
          break;
        default:
          defaultValue = "";
      }
      return defaultValue;
    },
    initEmptyFormDefault() {
      let dialogForm = {};
      this.dynamicDialogColumn.forEach((item) => {
        if (item.value) {
          this.$set(dialogForm, item.prop, item.value);
        } else {
          this.$set(dialogForm, item.prop, this.setFormItemDefault(item));
        }
      });
      return dialogForm;
    },
    // dynamic（form）,新增回调方法
    dynamicFormDialogCallback() {
      this.dynamicFormDialogVisible = false;

      console.log("dynamicFormDialogCallback ccDids", this.getCcDids);
      // 新增
      if (this.dynamicDialogIndex === -1) {
        if (this.item.children.type === "form") {
          // 加入ccdids
          if (this.item.tag === "track" && !!this.dynamicDialogForm.did) {
            let tmpCcDids = this.getCcDids;
            this.$set(this.dynamicDialogForm, "ccDids", tmpCcDids);
            console.log(this.dynamicDialogForm);
          }
          this.$store.commit("setCcDids", []);
          console.log("setCcDids", this.getCcDids);

          // this.form[this.dynamicDialogProp].push(this.dynamicDialogForm);
          this.$set(this.form, this.dynamicDialogProp, [...this.form[this.dynamicDialogProp], {...this.dynamicDialogForm}])
          // 发病后是否就诊业务属性：clinicAfterOnset , 新建子表单时复制最新一条记录数据
          let formHandler = new FormHandler(
            this.dynamicDialogColumn,
            this.dynamicDialogForm
          );
          if (formHandler.yesForClinicAfterOnset()) {
            let bizProp = formHandler.getPropForClinicAfterOnset();
            if (bizProp) {
              let dialogForm = this.initEmptyFormDefault();
              dialogForm[bizProp] = this.dynamicDialogForm[bizProp];
              this.$store.commit("quickSaveDynaFormLastRecord", {
                prop: this.item.prop,
                form: dialogForm,
              });
            }
          } else {
            this.$store.commit("clearDynaFormLastRecord");
          }
          // this.syncRelatedTable(this.item, this.dynamicDialogForm, syncIndex, true);
        } else if (this.item.children.type === "") {
          const syncIndex = this.form[this.dynamicDialogProp].length - 1;
          let form = JSON.parse(JSON.stringify(this.dynamicDialogForm));
          let newForm = this.form[this.dynamicDialogProp][syncIndex];
          Object.keys(form).forEach((key) => {
            this.$set(newForm, key, form[key]);
          });
          this.$set(newForm, "sourceTitle", this.sourceTitle);
          this.syncRelatedTable(this.item, newForm, syncIndex, true);
        }
      } else {
        // 编辑
        if (this.item.tag === "track" && !!this.dynamicDialogForm.did) {
            let tmpCcDids = this.getCcDids;
            this.$set(this.dynamicDialogForm, "ccDids", tmpCcDids);
            console.log(this.dynamicDialogForm);
          }
          this.$store.commit("setCcDids", []);
          console.log("setCcDids", this.getCcDids);

        this.form[this.dynamicDialogProp][this.dynamicDialogIndex] =
          this.dynamicDialogForm;

        //增加判断，不做频繁调用，减少性能损耗
        let arr = this.item.children.column.filter((v) => {
          return !isUndefined(v.relatedDynamic) && v.relatedDynamic !== "";
        });
      }
      this.handleTrack();
    },
    //dynamic（form）,关闭回调方法
    destroyDialog() {
      if (this.item.children.type === "") {
        this.rowRemoveDynamicAction(
          this.item,
          this.form[this.dynamicDialogProp].length - 1
        );
        // this.form[this.dynamicDialogProp].splice(this.form[this.dynamicDialogProp].length - 1, 1)
      }
      this.destroyDialogWithoutRemove();
    },
    destroyDialogWithoutRemove(val) {
      if (val) {
        const did = val.form.did;
        for (let key in val.form) {
          if (key !== "did") {
            this.changeCallback(did, key);
          }
        }
      }
      this.dynamicFormDialogVisible = false;
      this.syncFormData = false;
    },
    // dynamic（table）新增行
    handleDynamicAdd(item, did) {
      if (!this.form[item.prop]) {
        this.form[item.prop] = [];
      }
      let newRecord = this.getRowDefaultValue({
        did: isUndefined(did) ? getUUID2() : did,
      });
      this.form[item.prop].push(newRecord);
      this.syncRelatedTable(item, newRecord);
    },
    syncRelatedTable(item, row, syncIndex, isPDid = false) {
      let relatedTable = item.relatedTable;
      let relatedIndex = this.form[relatedTable].length - 1;
      if (!relatedIndex || relatedIndex < 0) {
        relatedIndex = syncIndex;
      }
      if (!this.validatenull(relatedTable)) {
        if (!this.form[relatedTable]) {
          console.error("制表时数据关联有误。检查制表。");
        } else {
          let newRecord;
          if (isPDid) {
            if (relatedIndex && relatedIndex >= 0) {
              newRecord = {
                did: this.form[relatedTable][relatedIndex].did,
                pDid: this.form[relatedTable][relatedIndex].pDid,
              };
            } else {
              newRecord = {
                did: this.form[relatedTable][relatedIndex].did,
                pDid: this.form[relatedTable][relatedIndex].pDid,
              };
            }
          } else {
            newRecord = { did: getUUID2(), pDid: row.did };
          }
          let relatedColumn;
          // console.log("this.columns", this.columns);
          this.columns.forEach((cln) => {
            if (cln.type === "dynamic" && cln.prop === relatedTable) {
              relatedColumn = cln;
              return true;
            }
          });
          // console.log("relatedColumn:", relatedColumn);
          if (relatedColumn) {
            let prop;
            for (let cln of relatedColumn.children.column) {
              prop = cln.prop;
              if (prop.endsWith("_1")) {
                newRecord[prop] = row[prop.substring(0, prop.indexOf("_1"))];
              } else {
                createComponent(cln, newRecord);
              }
            }
            if (!isUndefined(row.sourceTitle)) {
              newRecord.sourceTitle = row.sourceTitle;
            }
            Object.keys(row).forEach((v) => {
              if (v != "did" && !v.endsWith("_1") && v != "sourceTitle") {
                let prop = v + "_1";
                newRecord[prop] = row[v];
              }
            });
            if (isPDid) {
              Object.keys(this.form[relatedTable][relatedIndex]).forEach(
                (key) => {
                  this.$set(
                    this.form[relatedTable][relatedIndex],
                    key,
                    newRecord[key]
                  );
                }
              );
              if (!!newRecord.sourceTitle) {
                this.$set(
                  this.form[relatedTable][relatedIndex],
                  "sourceTitle",
                  newRecord.sourceTitle
                );
              }
            } else {
              this.form[relatedTable].push(newRecord);
            }

            // console.log(item.tag);
            // console.log(this.form[relatedTable][syncIndex]);

            if (
              item.tag === "cvc" &&
              relatedColumn.tag === "cc" &&
              this.form[relatedTable][relatedIndex] &&
              this.form[relatedTable][relatedIndex].sourceTitle
            ) {
              let tmpCcDids = this.getCcDids;
              tmpCcDids.push(newRecord.did);
              tmpCcDids = this.eliminateDuplicates(tmpCcDids);
              this.$store.commit("setCcDids", tmpCcDids);
            }
          }
        }
      }
    },
    getRowDefaultValue(newRecord) {
      for (let cln of this.item.children.column) {
        createComponent(cln, newRecord);
      }
      return newRecord;
    },
    changeCallback(did, prop) {
      if (this.item.relatedTable && this.item.relatedTable !== "") {
        let form = JSON.parse(
          JSON.stringify(
            this.form[this.item.prop].filter((v) => {
              return v.did === did;
            })
          )
        );
        let newForm = this.form[this.item.relatedTable].filter((v) => {
          return v.pDid === form[0].did || v.did === form[0].did;
        });
        if (!this.validatenull(newForm[0])) {
          this.$set(newForm[0], prop + "_1", form[0][prop]);
          if (form[0].sourceTitle && form[0].sourceTitle !== "") {
            this.$set(newForm[0], "sourceTitle", form[0].sourceTitle);
          }
        }
      }
      // console.log(this.form[this.item.prop][tableColumnIndex][tableColumn.prop]);
    },
    // dynamic（table）删除行
    rowRemoveDynamic(item, index) {
      this.$confirm("确定删除此行及其可能附带的信息吗？", "警告", {
        cancelButtonClass: "btn-custom-cancel",
        type: "warning",
      })
        .then(() => {
          // this.removeRelatedTableColumn(item, index)
          this.rowRemoveDynamicAction(item, index);
          this.handleTrack();
          this.$forceUpdate();
        })
        .catch((err) => {
          console.error("fail to remove dynamic ", err);
        });
    },
    rowRemoveDynamicAction(item, index) {
      let columns = item.children.column.filter((v) => {
        return !isUndefined(v.relatedDynamic) && v.relatedDynamic !== "";
      });
      if (columns.length > 0) {
        for (let column of columns) {
          let did = this.form[item.prop][index].did;
          let relColumn;
          let relColumnArray = this.columns.filter((v) => {
            return v.prop === column.relatedDynamic;
          });
          if (relColumnArray.length > 0) {
            relColumn = relColumnArray[0];
            let arr = this.form[column.relatedDynamic];
            for (let i = arr.length - 1; i >= 0; i--) {
              if (arr[i].pDid === did) {
                this.rowRemoveDynamicAction(relColumn, i);
              }
            }
          }
        }
      }

      let table = item.relatedTable;
      if (!isUndefined(table) && table !== "") {
        let pDid = this.form[item.prop][index].did;
        let arr = this.form[table];
        for (let i = arr.length - 1; i >= 0; i--) {
          if (arr[i].pDid === pDid) {
            arr.splice(i, 1);
          }
        }
      }
      this.form[item.prop].splice(index, 1);
    },
    removeRelatedTableColumn(item, index) {
      let did = this.form[item.prop][index].did;
      let deletes = this.relationList.deletes;
      let readDel = null;
      deletes.some((itm) => {
        if (itm.prop === item.prop) {
          readDel = itm;
          return true;
        }
      });
      if (readDel) {
        readDel.value.forEach((itm) => {
          this.formHandler.delRow(itm, did);
        });
      }
    },
    hasValue(column, form) {
      const component = createComponent(column, form);
      return component.hasValue();
    },
    rowCollapseDynamic(prop, index) {
      this.$refs["box" + index].style.display = "none";
    },
    rowExpandDynamic(prop, index) {
      this.$refs["box" + index].style.display = "block";
    },
    //展示上传组件上传的图片 下载附件
    uploadClick(item) {
      const IMAGE_TYPES = ["png", "jpg", "jpeg", "gif"];
      let fileType = item.type
        ? item.type
        : item.name.substring(item.name.lastIndexOf(".") + 1).toLowerCase();
      if (IMAGE_TYPES.includes(fileType)) {
        this.dialogVisible = true;
        this.dialogImageUrl = item.url;
      } else {
        let urlArr = item.url.split('/')
        urlArr[urlArr.length - 1] = encodeURIComponent(urlArr.pop())
        window.open(urlArr.join('/'));
      }
    },
    //是否更新轨迹数据
    handleTrack() {
      console.log("handleTrack:", this.isTrack);
      if (this.isTrack) {
        this.$emit("handleTrack");
      }
    },
    eliminateDuplicates(array) {
      return [...new Set(array)];
    },
  },
};
</script>

<style scoped>
.inv-break-line {
  word-break: break-word;
  position: absolute;
  right: 1.5rem;
}
.style-dynamic {
  padding: 20px 10px 20px 20px;
  border: 3px solid #45c2b5;
}

.dynamic-label {
  margin-bottom: 10px;
  padding-bottom: 2px;
  border-bottom: 1px dashed #17b3a3;
}

.dynamic-form-add-button {
  margin-left: 30px;
  /*float: right;*/
}

.dynamic-form {
  /*text-align: center;*/
  margin-left: 50px;
}

.dynamic-form-row {
  border-bottom: 1px dashed #a1a5a7;
  padding: 10px 0;
}

.dynamic-form-label {
  font-size: 15px;
  font-weight: 900;
}

.dynamic-form-divider {
  margin: 10px 0;
}

.dynamic-table {
  margin: 10px 0 20px 0;
}
.dynamic-title {
  word-break: break-word;
  width: calc(80% - 1.75rem);
  margin-top: 30px;
  margin-bottom: 25px;
  line-height: 15px;
}
:deep(.el-collapse-item__header) {
  height: auto;
}
.clearfloat {
  clear: both;
  height: 0;
  font-size: 1px;
  line-height: 0px;
}
.table-icon {
  font-size: 5px !important;
  padding: 3px !important;
}
.table-dynamic-icon {
  background-color: #e6a23c;
  cursor: pointer;
  border-radius: 50px;
  color: white;
  transform: scale(1.1);
}
:deep(.el-descriptions__header) {
  margin-bottom: 2px;
}
:deep(.el-descriptions-item__label) {
  font-weight: bold;
}
</style>
