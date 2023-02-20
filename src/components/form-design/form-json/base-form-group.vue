<template>
  <el-collapse @change="handleChange">
    <el-collapse-item :name="item.prop" :id="'el' + item.prop">
      <template slot="title">
        <span v-if="item.required" class="live-group">&nbsp;* &nbsp;</span>
        <span>{{ item.label }} </span>
        <el-button type="text" size="medium" :icon="groupIcon"></el-button>
      </template>
      <div class="style-group">
        <!--    <el-form-item :label="item.label" :id="'label_'+item.prop"-->
        <!--                  class="group-label">-->
        <!--    </el-form-item>-->
        <!--  <div :id="'label_'+item.prop" class="inner-title">
      {{item.label}}
    </div>-->
        <el-row>
          <el-col
            v-for="(groupItem, index) in item.column"
            :key="'groupItem-' + index"
            :span="groupItem.span"
          >
            <el-form-item
              v-if="
                groupItem.display &&
                (groupItem.type === 'input' || groupItem.type === 'textarea')
              "
              :rules="getRule(groupItem)"
              :id="'label_' + groupItem.prop"
              :prop="item.prop + '.' + groupItem.prop"
            >
              <template #label>
                <span :class="groupItem.fieldRequired ? 'live-required' : ''"
                  >{{ groupItem.label }}：</span
                >
                <el-tooltip
                  v-if="
                    groupItem.placeholder && groupItem.placeholder.length > 10
                  "
                  effect="light"
                  :content="groupItem.placeholder"
                  placement="top-start"
                >
                  <span style="opacity: 0.5"
                    >({{ groupItem.placeholder.substring(0, 10) }}...)</span
                  >
                </el-tooltip>
                <span v-else style="opacity: 0.5"
                  >({{
                    groupItem.placeholder !== undefined
                      ? groupItem.placeholder
                      : ""
                  }})</span
                >
                <el-popover
                  v-if="
                    audit &&
                    nonDynaAudit[groupItem.prop] &&
                    nonDynaAudit[groupItem.prop].change
                  "
                  :disabled="nonDynaAudit[groupItem.prop].isReviewedByTeamLeader"
                  width="500"
                  placement="top-start"
                  trigger="hover"
                >
                  <el-table
                    :data="nonDynaAudit[groupItem.prop].options"
                    style="width: 100%"
                  >
                    <el-table-column prop="modifier" label="调查员" width="100">
                    </el-table-column>
                    <el-table-column prop="label" label="填写记录">
                      <template slot-scope="scope">
                        <div
                          v-if="
                            groupItem.type === 'datetime' &&
                            groupItem.format === 'yyyy-MM-dd HH:mm'
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
                          @click="handleClick(scope.row, form, item, groupItem)"
                          type="text"
                          size="small"
                          >选择</el-button
                        >
                      </template>
                    </el-table-column>
                  </el-table>
                  <el-button
                    :ref="'confirm-' + groupItem.prop"
                    slot="reference"
                    size="mini"
                    type="warning"
                    :class="computedConfirmClass(groupItem.prop)"
                    >{{ computedConfirmText(groupItem.prop) }}</el-button
                  >
                </el-popover>
              </template>

              <base-form-item
                :item="groupItem"
                :ref="groupItem.prop"
                :form="form[item.prop]"
                :columns="item.column"
                :pprop="item.prop"
                :ptype="ptype"
                :add="add"
              >
              </base-form-item>
            </el-form-item>
            <el-form-item
              v-else-if="groupItem.display"
              :rules="getRule(groupItem)"
              :id="'label_' + groupItem.prop"
              :prop="item.prop + '.' + groupItem.prop"
            >
              <!--        {{nonDynaAudit[groupItem.prop]}}-->
              <!--       {{form[groupItem.prop]}}-->
              <template #label>
                <span :class="groupItem.fieldRequired ? 'live-required' : ''"
                  >{{ groupItem.label }}：</span
                >
                <span class="dynamic-label">
                  <el-button
                    class="dynamic-form-add-button"
                    style="margin-left: 20px"
                    v-if="
                      groupItem.relatedDynamic &&
                      groupItem.relatedDynamic !== '' &&
                      form[item.prop][groupItem.prop] === groupItem.relFormVal
                    "
                    type="primary"
                    size="mini"
                    icon="el-icon-plus"
                    @click="
                      openDialog(
                        groupItem.relatedDynamic,
                        groupItem.prop,
                        groupItem.label,
                        item.label
                      )
                    "
                  >
                  </el-button>
                </span>
                <el-popover
                  v-if="
                    audit &&
                    nonDynaAudit[groupItem.prop] &&
                    nonDynaAudit[groupItem.prop].change
                  "
                  :disabled="nonDynaAudit[groupItem.prop].isReviewedByTeamLeader"
                  width="500"
                  placement="top-start"
                  trigger="hover"
                >
                  <el-table
                    :data="nonDynaAudit[groupItem.prop].options"
                    style="width: 100%"
                  >
                    <el-table-column prop="modifier" label="调查员" width="100">
                    </el-table-column>
                    <el-table-column prop="label" label="填写记录">
                      <template slot-scope="scope">
                        <div
                          v-if="
                            groupItem.type === 'datetime' &&
                            groupItem.format === 'yyyy-MM-dd HH:mm'
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
                          @click="handleClick(scope.row, form, item, groupItem)"
                          type="text"
                          size="small"
                          >选择</el-button
                        >
                      </template>
                    </el-table-column>
                  </el-table>
                  <el-button
                    :ref="'confirm-' + groupItem.prop"
                    slot="reference"
                    size="mini"
                    type="warning"
                    :class="computedConfirmClass(groupItem.prop)"
                    >{{ computedConfirmText(groupItem.prop) }}</el-button
                  >
                </el-popover>
              </template>

              <base-form-item
                :item="groupItem"
                :ref="groupItem.prop"
                :form="form[item.prop]"
                :columns="item.column"
                :pprop="item.prop"
                :ptype="ptype"
                :add="add"
              >
              </base-form-item>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-collapse-item>
  </el-collapse>
</template>

<script>
import createComponent from "./createComponent";
import BaseFormItem from "./base-form-item";
import { mapGetters } from "vuex";
import moment from "moment";

export default {
  name: "base-form-group",
  components: {
    BaseFormItem,
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
    //是否是新增
    add: {
      type: Boolean,
      default: true,
    },
    audit: {
      type: Boolean,
      default: false,
    },
    nonDynaAudit: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      groupIcon: "el-icon-caret-bottom",
      columnCopy: [],
      ptype: "group",
    };
  },
  computed: {
    ...mapGetters(["getDataSource"]),
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
  created() {
    this.init();
  },
  filters: {
    filterDateTime(v) {
      if (v) {
        return moment(v).format("YYYY-MM-DD HH:mm");
      }
      return "";
    },
  },
  methods: {
    handleChange(val) {
      this.groupIcon =
        this.groupIcon === "el-icon-caret-bottom"
          ? "el-icon-caret-top"
          : "el-icon-caret-bottom";
    },
    /**
     * 单选按钮触发打开子表单
     * @param relatedProp 关联子表单属性
     * @param prop 组件属性
     * @param label 组件标签
     * @param groupLabel 父组件标签
     */
    openDialog(relatedProp, prop, label, groupLabel) {
      //可能是显隐触发的，获取显隐来源
      let dataSource = this.getDataSource(prop);
      let srcTitle =
        dataSource != null ? dataSource.label + " " + label : label;
      srcTitle = groupLabel + "/" + srcTitle;
      let param = {
        prop: relatedProp,
        sourceTitle: srcTitle,
      };
      this.$emit("openDialog", param);
    },
    init() {
      this.columnCopy = this.deepClone(this.item.column);
      if (this.add) {
        // this.$set(this.form, this.item.prop, {});
      }
    },
    getRule(item) {
      let component = createComponent(item, this.form);
      return component.getRule();
      //现场必填或需确认必填时启用字段验证规则
      // const required = (item.fieldRequired && item.fieldRequired === true) || this.audit === true
      // return required ? rule : []
    },
    handleClick(row, form, item, groupItem) {
      if (groupItem.type === "regionSelect") {
        form[item.prop][groupItem.prop] = row.val
          ? JSON.parse(JSON.stringify(row.val))
          : { ids: null, name: null, detailedAddress: null };
      } else if (groupItem.type === "checkbox") {
        if (row.val === "") {
          form[item.prop][groupItem.prop] = [];
        } else {
          form[item.prop][groupItem.prop] = row.val;
        }
      } else {
        form[item.prop][groupItem.prop] = row.val;
      }
      // console.log('handleClick....', item, ' ', form[item.prop][groupItem.prop], ' ', row.val)
      let types = ["radio", "checkbox", "select"];
      if (types.includes(groupItem.type)) {
        console.log("handle ", groupItem.type);
        this.$refs[groupItem.prop][0].handleChangeDisplay();
      }
      this.nonDynaAudit[groupItem.prop].isReviewedByTeamLeader = true;
      // this.auditSample.nonDynaAudit[groupItem.prop].isReviewedByTeamLeader = true;
      // this.$refs["confirm-" + groupItem.prop][0].$el.style.backgroundColor = "#D6D6DA";
      // this.$refs["confirm-" + groupItem.prop][0].$el.style.borderColor ="#D6D6DA";
      // this.$refs["confirm-" + groupItem.prop][0].$el.style.color = "#AAADB7";
      // this.$refs["confirm-" + groupItem.prop][0].$el.innerText = "已确认";
    },
  },
};
</script>

<style lang="scss" scoped>
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
<style scoped lang="scss">
.style-group {
  padding: 20px 10px 20px 20px;
  border: 1px solid #dcdcdc;
  margin-top: 0px;
  .style-title {
    font-size: 15px;
    font-weight: 700;
  }

  .group-divider {
    margin: 0;
  }

  .group-label {
    margin-bottom: 0;
  }
}
.inner-title {
  position: relative;
  top: -32px;
  background: white;
  width: fit-content;
  width: -webkit-fit-content;
  width: -moz-fit-content;
  font-size: 15px;
  font-weight: bold;
  padding: 5px;
}
</style>
