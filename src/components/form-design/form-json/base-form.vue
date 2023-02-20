<template>
  <div>
    <el-form
      ref="form"
      :model="form"
      :label-width="labelWidth + 'px'"
      :label-position="labelPosition"
      :label-suffix="labelSuffix"
      :disabled="disabled"
    >
      <el-row :gutter="gutter">
        <el-col v-for="(item, index) in columns" :key="index" :span="item.span">
          <!-- 主标题 -->
          <div v-if="item.type === 'bigtitle'" class="text-center">
            <h1>{{ item.params.html }}</h1>
          </div>

          <!--  标题  -->
          <div v-if="item.type === 'title'">
            <h3>{{ item.params.html }}</h3>
          </div>

          <!-- 表述信息 -->
          <p v-else-if="item.type === 'description'" class="desc-text">
            {{ item.params.html }}
          </p>

          <!--  表格  -->
          <div
            v-else-if="item.type === 'table'"
            class="form-tab"
            :id="'label_' + item.prop"
          >
            <avue-crud
              v-if="isEpidSpotTab(item)"
              :data="trackTableData"
              :option="trackOption(item.label)"
              :page.sync="page"
              @size-change="sizeChange"
              @current-change="currentChange"
            >
              <template slot="epidSpot" slot-scope="scope">
                {{
                  scope.row.epidSpot === "0"
                    ? "是"
                    : scope.row.epidSpot === "1"
                    ? "否"
                    : ""
                }}
              </template>
            </avue-crud>
          </div>

          <!-- group -->
          <base-form-group
            v-else-if="item.type === 'group' && item.display"
            :item="item"
            :form="form"
            :nonDynaAudit="nonDynaAudit"
            :audit="audit"
            @openDialog="openDialog"
            :add="add"
          >
          </base-form-group>

          <!-- dynamic -->
          <base-form-dynamic
            v-else-if="item.type === 'dynamic' && item.display"
            :item="item"
            :columns="columns"
            :form="form"
            :disabled="disabled"
            :ref="`${item.prop}`"
            :dynaAudit="dynaAudit"
            :audit="audit"
            @handleTrack="handleTrack"
            @openDialog="openDialog"
            :add="add"
          >
          </base-form-dynamic>

          <!-- 普通组件（排除dynamic、group）!item.environment && -->
          <el-form-item
            v-else-if="item.display"
            :rules="getRule(item)"
            :id="'label_' + item.prop"
            :prop="item.prop"
          >
            <template slot="label">
              <span :class="item.fieldRequired ? 'live-required' : ''"
                >{{ item.label }}：</span
              >
              <span v-if="item.type === 'input' || item.type === 'textarea'">
                <el-tooltip
                  v-if="item.placeholder && item.placeholder.length > 10"
                  effect="light"
                  :content="item.placeholder"
                  placement="top-start"
                >
                  <span style="opacity: 0.5"
                    >({{ item.placeholder.substring(0, 10) }}...)</span
                  >
                </el-tooltip>
                <span v-else style="opacity: 0.5"
                  >({{ item.placeholder }})</span
                >
              </span>
              <span class="dynamic-label">
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
                    openDialog({
                      prop: item.relatedDynamic,
                      sourceTitle: item.label,
                    })
                  "
                >
                </el-button>
              </span>
              <span style="margin: 0 15px">
                <el-button
                  v-if="item.prop === 'participant'"
                  @click="dialogVisible = true"
                  type="primary"
                  size="mini"
                  plain
                  >选择调查对象</el-button
                >
              </span>

              <el-popover
                v-if="
                  audit &&
                  nonDynaAudit[item.prop] &&
                  nonDynaAudit[item.prop].change
                "
                :disabled="nonDynaAudit[item.prop].isReviewedByTeamLeader"
                width="350"
                placement="top-start"
                trigger="hover"
              >
                <div style="">
                  <el-table
                    :data="nonDynaAudit[item.prop].options"
                    style="width: 100%"
                  >
                    <el-table-column prop="modifier" label="调查员" width="100">
                    </el-table-column>
                    <el-table-column prop="label" label="填写记录">
                      <template slot-scope="scope">
                        <div
                          v-if="
                            item.type === 'datetime' &&
                            item.format === 'yyyy-MM-dd HH:mm'
                          "
                        >
                          {{ scope.row.label | filterDateTime }}
                        </div>
                        <div v-else>
                          {{ scope.row.label }}
                        </div>
                      </template>
                    </el-table-column>
                    <el-table-column fixed="right" label="操作" width="60">
                      <template slot-scope="scope">
                        <el-button
                          @click="handleClick(scope.row, form, item)"
                          type="text"
                          size="small"
                          >选择</el-button
                        >
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
                <el-button
                  :ref="'confirm-' + item.prop"
                  slot="reference"
                  size="mini"
                  type="warning"
                  :class="computedConfirmClass(item.prop)"
                  >{{ computedConfirmText(item.prop) }}</el-button
                >
              </el-popover>
            </template>

            <base-form-item
              :item="item"
              :ref="item.prop"
              :form="form"
              @revalidateField="revalidateField"
              :columns="columns"
              :add="add"
            >
            </base-form-item>
          </el-form-item>

          <div class="count-view">{{ needRenderInDynamic(index) }}</div>
        </el-col>
      </el-row>
    </el-form>
    <!--搜索任务调查对象信息 -->
    <el-dialog
      title="选择调查对象"
      width="80%"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      append-to-body
    >
      <avue-crud
        @on-load="onLoad"
        @search-change="searchChange"
        @search-reset="searchReset"
        @refresh-change="refreshChange"
        :data="tableData"
        :option="option"
        :search.sync="searchData"
        :page.sync="page"
      >
        <template slot="address" slot-scope="scope">
          {{scope.row.address | formatAddress}}
        </template>

        <template slot-scope="scope" slot="menu" class="menuClass">
          <el-button type="text" @click="choose(scope.row)" size="mini"
            >选择</el-button
          >
        </template>
      </avue-crud>
    </el-dialog>
  </div>
</template>
<script>
import BaseFormItem from "./base-form-item";
import DynamicFormDialog from "./dynamic-form-dialog";
import createComponent from "./createComponent";
import BaseFormGroup from "@/components/form-design/form-json/base-form-group";
import BaseFormDynamic from "./base-form-dynamic";
import { respondentOption, trackOption } from "./option";
import { pagePatientForTask } from "@/api/subject-task/patientInfo";
import {
  getAgeFromIdCard,
  getSexFromIdCard,
  getBirthdayFromIdCard,
} from "@/components/form-design/utils/index";
import { getDictDataList } from "@/utils";
import formModule from "../mixins/form-module-mixin";
import validate from "../mixins/validate-mixin";
import { mapGetters } from "vuex";
import cloneDeep from "lodash/cloneDeep";
import moment from "moment";
import codeTableApis from "@/api/sys/CodeTable";
import AppConstant from "@/utils/AppConstant";

export default {
  name: "BaseForm",
  mixins: [formModule, validate],
  components: {
    BaseFormGroup,
    BaseFormItem,
    BaseFormDynamic,
    DynamicFormDialog,
  },
  props: {
    // form 值
    value: {
      type: Object,
      default: () => {
        return {};
      },
    },
    // 字段json
    column: {
      type: Array,
      default: () => {
        return [];
      },
    },
    // 字段json
    relation: {
      type: Object,
      default: () => {
        return {};
      },
    },
    labelWidth: {
      type: Number,
      default: 100,
    },
    labelPosition: {
      type: String,
      default: "",
    },
    gutter: {
      type: Number,
      default: 20,
    },
    labelSuffix: {
      type: String,
      default: ":",
    },
    add: {
      type: Boolean,
      default: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    auditSample: {
      type: Object,
      default: () => {
        return {};
      },
    },
    taskId: {
      type: String,
      default: "",
    },
    isShowCoreForm: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      form: this.value, //表单数据
      columns: this.column, //表单结构
      audit: this.auditSample.audit, //需确认必填要求
      nonDynaAudit: this.auditSample.nonDynaAudit,
      dynaAudit: this.auditSample.dynaAudit,
      dialogVisible: false,
      tableData: [],
      option: respondentOption(),
      searchData: {},
      page: {
        pageSize: 10,
        currentPage: 1,
        total: 0,
        pageSizes: [10, 20, 50, 100],
      },
      epidSpotTabVisible: false,
      trackList: [],
      trackTableData: [],
      trackOption: trackOption,
      columnsCount: 0,
    };
  },
  computed: {
    ...mapGetters(["getTrackData", "getFormLoopEndFlag"]),
    saveProp() {
      return this.$store.state.saveProp;
    },
    epidSpotTab() {
      if (this.epidSpotTabVisible) {
        return this.getTrackData;
      }
      return [];
    },
    computedConfirmClass() {
      return (value) => {
        if (this.nonDynaAudit[value].isReviewedByTeamLeader) {
          return "audit-btn-comfirmed";
        } else {
          return "audit-btn";
        }
      };
    },
    computedConfirmText() {
      return (value) => {
        if (this.nonDynaAudit[value].isReviewedByTeamLeader) {
          return "已确认";
        } else {
          return "需确认";
        }
      };
    },
  },
  watch: {
    form: {
      handler(val, oldVal) {
        this.$emit("input", val);
      },
    },
    saveProp: {
      handler(val, oldVal) {
        if (val) {
          this.openDialog(val, true);
        }
      },
    },
    epidSpotTab: {
      handler(val, oldVal) {
        if (val && val.length > 0) {
          this.trackList = val.filter((d) => d.epidSpot === "0");
          this.loadTrackData(this.page);
        } else {
          this.trackList = [];
          this.trackTableData = [];
          this.page.currentPage = 1;
          this.page.total = 0;
        }
      },
    },
  },
  created() {
    console.log("column",this.columns)
    console.log("value",this.value)
    this.$store.commit("setFormLoopEndFlag", false);
    // 这两行代码一定不能放在mounted中！！！
    this.relation = this.relation ? this.relation : {};
    this.$store.commit("setRelation", this.relation);
  },
  mounted() {
    // console.log('*** 1 baseform:', this.form, '  ', this.audit)
    // console.log('*** 2 baseform:', this.nonDynaAudit, '  ', this.dynaAudit)
    this.getTrackList();
    this.loadCodeTable();
  },
  filters: {
    filterDateTime(v) {
      if (v) {
        return moment(v).format("YYYY-MM-DD HH:mm");
      }
      return "";
    },
    formatAddress(value) {
      if (value.name) {
        return value.name + " " + (value.detailedAddress ? value.detailedAddress : "");
      }
      return "";
    }
  },
  methods: {
    needRenderInDynamic(index) {
      if (index - this.columnsCount > 10) {
        this.columnsCount = cloneDeep(index);
        // console.log(this.columnsCount);
        this.$forceUpdate();
      }
      if (index == this.columns.length - 1) {
        this.$store.commit("setFormLoopEndFlag", true);
        // console.log("formLoopEndFlag");
        // console.log(this.getFormLoopEndFlag);
      }
      return null;
    },
    revalidateField(prop) {
      this.$refs.form.validateField(prop);
    },
    openDialog(param, hasFrom) {
      // console.log("openDialog1:", param, hasFrom);
      if (!this.$refs[`${param.prop}`]) {
        if (!hasFrom) {
          this.$store.commit("saveProp", param);
        }
      } else {
        // console.log("openDialog2:", param, hasFrom);
        this.$refs[`${param.prop}`][0].openAddDynamicDialog(
          param.did,
          param.sourceTitle
        );
      }
    },
    handleTrack() {
      if (this.epidSpotTabVisible) {
        this.getTrackList();
      } else {
        let trackList = Object.assign([], this.getTrackList());
        if (trackList && trackList.length > 0) {
          this.$store.commit("saveTrackData", trackList);
        }
      }
    },
    isEpidSpotTab(item) {
      this.epidSpotTabVisible = item.table === "epidSpotTab";
      return this.epidSpotTabVisible;
    },
    loadTrackData(page) {
      this.trackTableData = this.trackList.slice(
        (page.currentPage - 1) * page.pageSize,
        page.currentPage * page.pageSize
      );
    },
    sizeChange(val) {
      this.page.currentPage = 1;
      this.page.pageSize = val;
      this.loadTrackData(this.page);
    },
    currentChange(val) {
      this.page.currentPage = val;
      this.loadTrackData(this.page);
    },
    // 清空表单
    clearForm() {
      this.column.forEach((item) => {
        if (item.display) {
          const component = createComponent(item, this.form);
          component.setDefaultValue(this);
          component.handleDisplay(this.columns);
        }
      });
    },
    // 校验表单
    validateForm() {
      let result = { valid: false, errList: [] };
      this.$refs["form"].validate((valid, err) => {
        result.valid = valid;
        console.log("err:", err);
        if (err) {
          Object.keys(err).forEach((key) => {
            err[key].forEach((itm) => {
              result.errList.push(itm.message);
            });
          });
        }
      });
      return result;
    },
    getRule(item) {
      //证件号码特殊处理，区分身份证、护照等
      // console.log('view ', item.label)
      if ("input" === item.type && item.idCard && eval(item.idCard)) {
        return this.getNumberRule(item, this.form[item.idTypeProp]);
      }
      let component = createComponent(item, this.form);
      let rule = component.getRule();

      return rule;
    },
    handleClick(row, form, item) {
      if (item.type === "regionSelect") {
        form[item.prop] = row.val ? Object.assign({}, row.val) : {};
      } else {
        form[item.prop] = row.val?row.val:[];
      }
      console.log("handleClick....", item, " ", form[item.prop], " ", row.val);
      let types = ["radio", "checkbox", "select"];
      console.log("handle ", item.type);
      if (types.includes(item.type)) {
        this.$refs[item.prop][0].handleChangeDisplay();
      }
      if (item.type === "cascader") {
        this.$refs[item.prop][0].handleCascader();
      }
      this.nonDynaAudit[item.prop].isReviewedByTeamLeader = true;
      this.auditSample.nonDynaAudit[item.prop].isReviewedByTeamLeader = true;
      // this.$refs["confirm-" + item.prop][0].$el.style.backgroundColor = "#D6D6DA";
      // this.$refs["confirm-" + item.prop][0].$el.style.borderColor = "#D6D6DA";
      // this.$refs["confirm-" + item.prop][0].$el.style.color = "#AAADB7";
      // this.$refs["confirm-" + item.prop][0].$el.innerText = "已确认";
    },
    onLoad() {
      this.searchData.taskId = this.taskId;
      pagePatientForTask(
        this.page.currentPage,
        this.page.pageSize,
        this.searchData
      ).then((res) => {
        if (res.data.code === 0) {
          this.tableData = res.data.data.list;
          this.page.total = res.data.data.total;
        } else {
          console.error("err:", res.data.msg);
        }
      });
    },
    searchChange(params, done) {
      done();
      this.onLoad();
    },
    searchReset() {
      this.searchData = {};
      // this.onLoad()
    },
    refreshChange() {
      this.onLoad();
    },
    choose(row) {
      this.form["participant"] = row.name;
      this.form["identity"] = row.identity;
      let birthday = getBirthdayFromIdCard(row.identity);
      let age = getAgeFromIdCard(row.identity);
      let sex = getSexFromIdCard(row.identity);
      let arr = getDictDataList("gender");
      if (arr && sex) {
        arr.forEach((item) => {
          if (item.dictLabel === sex) {
            sex = item.dictValue;
          }
        });
      }
      this.form["contact"] = row.phone;
      this.form["age"] = age ? age : row.age;
      this.form["sex"] = row.gender ? row.gender : sex;
      this.form["birthday"] = row.birthday ? row.birthday : birthday;
      this.form["occupation"] = row.crowd;
      this.form["overseas"] = row.overseas;
      this.form["workOrStudyUnitName"] = row.company;
      if (row.address) {
        this.form["location"] = row.address;
        let str = ''
        let val = row.address
        if (val && (val.detailedAddress ||val.name)) {
          str += val.name ? val.name + (val.detailedAddress ? '，' : '。') : ''
          str += val.detailedAddress ? val.detailedAddress + '。' : ''
        }
        let obj = Object.assign({}, val)
        obj.fullAddress = str
        this.$store.commit('regionSelectMap', {key: "location", value: JSON.stringify(obj)})
      }

      this.column.forEach((item) => {
        if (item.prop === 'confirmClinicType') {
          if (item.dicData) {
            let confirmClinicType = "";
            item.dicData.forEach((data) => {
              if (row.$caseType && data.label === row.$caseType) {
                confirmClinicType = data.value;
                this.form["confirmClinicType"] = confirmClinicType;
              }
            })
          }
        } else if (item.prop === 'overseas') {
          if (item.dicData) {
            let overseas = "";
            item.dicData.forEach((data) => {
              if (row.$overseas && data.label === row.$overseas) {
                overseas = data.value;
                this.form["overseas"] = overseas;
              }
            })
          }
        } else if (item.prop === 'credentialsType') {
          let credentialsType = "";
          item.dicData.forEach((data) => {
            //此处写死不够灵活，后期需要改造
            if (row.$idType) {
              if (row.$idType === data.label) {
                credentialsType = data.value;
              }
              this.form["credentialsType"] = credentialsType;
            }
          })
        }
      })
      this.dialogVisible = false;
    },
    loadCodeTable() {
      codeTableApis.getByType(AppConstant.CODE_TABLE_IDCARD_TYPE).then(res => {
        if (res.data.code === 0) {
          let options = res.data.data;
          if (options && options.length > 0) {
            this.option.column[3].dicData = options;
          }
        }
      });
      codeTableApis.getByType(AppConstant.CODE_TABLE_CROWD).then(res => {
        if (res.data.code === 0) {
          let options = res.data.data;
          if (options && options.length > 0) {
            this.option.column[8].dicData = options;
          }
        }
      });
      codeTableApis.getByType(AppConstant.CODE_TABLE_CASE_TYPE).then(res => {
        if (res.data.code === 0) {
          let options = res.data.data;
          if (options && options.length > 0) {
            this.option.column[11].dicData = options;
          }
        }
      });
    }
  },
  beforeDestroy() {
    // this.$store.commit("regionSelectMap", null);
    this.$store.commit("saveTrackData", null);
  },
};
</script>
<style lang="scss" scoped>
.group-label {
  margin-bottom: 0;
}

.group-divider {
  margin: 0;
}
.audit-btn {
  background-color: orange;
  border-color: orange;
  margin-left: 10px;
}
.audit-btn:hover {
  background-color: orange;
  border-color: orange;
}
.audit-btn:focus {
  background-color: orange;
  border-color: orange;
}
.audit-btn-comfirmed {
  background-color: #d6d6da !important;
  border-color: #d6d6da !important;
  color: #aaadb7 !important;
  margin-left: 10px;
}
.audit-btn-comfirmed:hover {
  background-color: #d6d6da;
  border-color: #d6d6da;
  color: #aaadb7;
}
.audit-btn-comfirmed:focus {
  background-color: #d6d6da;
  border-color: #d6d6da;
  color: #aaadb7;
}
</style>
<style lang="scss">
.form-tab {
  .avue-crud__menu {
    min-height: 0;
  }
}
.desc-text {
  padding: 10px;
  font-size: 14px;
  font-weight: bold;
}
.count-view {
  display: none;
}
</style>
