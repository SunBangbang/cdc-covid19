<template>
  <div class="widget-config">
    <el-form
      label-suffix="："
      v-if="this.data && Object.keys(this.data).length > 0"
      size="small"
    >
      <fieldset :disabled="data.edit !== undefined && !data.edit">
        <el-collapse v-model="collapse">
          <el-collapse-item name="2" title="公有属性">
            <el-form-item label="组件类型" v-if="!isTitleColumns">
              <span>{{ data.typeName }}</span>
            </el-form-item>

            <el-form-item label="标题" v-if="!isTitleColumns">
              <el-input
                v-model="data.label"
                :disabled="data.edit !== undefined && !data.edit"
                placeholder="标题"
              ></el-input>
            </el-form-item>
            <!--子表单的表格内的元素设置宽度-->
            <el-form-item label="宽度" v-if="data.subfield">
              <el-input-number
                v-model="data.width"
                controls-position="right"
                placeholder="宽度"
                :disabled="data.edit !== undefined && !data.edit"
                :min="100"
              ></el-input-number>
            </el-form-item>
            <el-form-item label="内容" v-if="isTitleColumns">
              <el-input
                v-model="data.params.html"
                :disabled="data.edit !== undefined && !data.edit"
                placeholder="内容"
                type="textarea"
              ></el-input>
            </el-form-item>
            <el-form-item label="协查共享" v-if="isTitleColumns">
              <el-switch
                v-model="data.sharedRequired"
                active-text="必需"
                inactive-text="非必需"
              >
              </el-switch>
            </el-form-item>
            <el-form-item
              label="表单栅格"
              v-if="
                !data.subfield && !['group', 'textarea'].includes(data.type)
              "
            >
              <el-radio-group
                v-model="data.span"
                :disabled="data.edit !== undefined && !data.edit"
              >
                <el-radio-button :label="8">一行三列</el-radio-button>
                <el-radio-button :label="12">一行两列</el-radio-button>
                <el-radio-button :label="24">一行一列</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item
              :label="
                `${
                  data.type === 'dynamic'
                    ? '模块名称'
                    : data.type === 'group'
                    ? ''
                    : '属性名称'
                }`
              "
              v-if="data.type !== 'bigtitle' && data.type !== 'title'"
            >
              <el-select
                v-model="data.tag"
                v-if="data.type !== 'dynamic' && data.type !== 'group'"
                :disabled="data.edit !== undefined && !data.edit"
                clearable
                filterable
                placeholder="请选择，红色*为必填项"
                @focus="handleFocus"
                @clear="handleRemoveTag(data)"
              >
                <el-option
                  v-for="item in bizOptions"
                  v-show="showOption(item)"
                  :key="item.dictValue"
                  :label="item.dictLabel"
                  :value="item.dictValue"
                  :disabled="item.disabled"
                >
                  <span style="float: left">{{ item.dictLabel }}</span>
                  <span
                    v-if="isMandatory(item.dictLabel)"
                    style="float: right; color: red;"
                    >*</span
                  >
                </el-option>
              </el-select>

              <el-select
                v-model="data.tag"
                clearable
                :disabled="data.edit !== undefined && !data.edit"
                v-if="data.type === 'dynamic'"
              >
                <el-option
                  v-for="item in bizModuleOptions"
                  :key="item.dictValue"
                  :label="item.dictLabel"
                  :value="item.dictValue"
                  :disabled="item.disabled"
                >
                  <span style="float: left">{{ item.dictLabel }}</span>
                </el-option>
              </el-select>

              <!--<el-select v-model="data.tag"
                         clearable
                         v-if="data.type === 'group'" >
                <el-option label="学校" value="school"></el-option>
              </el-select>-->
            </el-form-item>

            <el-form-item label="存储属性" v-if="showReadWrite">
              <el-select
                v-model="data.writeField"
                placeholder="请选择类型"
                clearable
                filterable
                :disabled="
                  (data.edit !== undefined && !data.edit) || readOrWrite === 1
                "
              >
                <el-option
                  v-for="item in relationOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="读取属性" v-if="showReadWrite">
              <el-select
                v-model="data.readField"
                placeholder="请选择类型"
                clearable
                filterable
                :disabled="
                  (data.edit !== undefined && !data.edit) || readOrWrite === 2
                "
              >
                <el-option
                  v-for="item in relationOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-collapse-item>

          <el-collapse-item
            name="3"
            v-if="!isTitleColumns && 'group' !== data.type"
            title="私有属性"
          >
            <component
              :is="getComponent"
              :data="data"
              :columns="columns"
            ></component>
          </el-collapse-item>
          <el-collapse-item name="3" v-else title="私有属性">
            <el-form-item label="是否存在核心表">
              <el-switch
                v-model="data.coreItem"
                :disabled="data.edit !== undefined && !data.edit"
              ></el-switch>
            </el-form-item>
          </el-collapse-item>
        </el-collapse>
      </fieldset>
    </el-form>
  </div>
</template>

<script>
const dateArr = [
  "year",
  "month",
  "week",
  "date",
  "datetime",
  "time",
  "daterange",
  "timerange",
  "datetimerange",
  "dates"
];

//暂定模块属性分2类: normal->普通 来自业务字典模板， kcc->已知密接，来自系统字典：close-contact-option
const BIZ_NORMAL = "normal";
const BIZ_KNOWN_CLOSE_CONTACT = "kcc";

import { getDictDataList, getBizDictDataList } from "@/utils";
import { TitleColumns } from "./utils";
import { relationOptions } from "./config/propMapConfig";

export default {
  name: "widget-config",
  props: ["data", "columns", "tempDict"], //data="widgetFormSelect"
  computed: {
    getComponent() {
      // console.log(this.data)
      this.getDynamicTag();

      const prefix = "config-";
      const { type } = this.data;
      let result = "input";

      if ([undefined, "input", "password", "url"].includes(type))
        result = "input";
      else if (dateArr.includes(type)) result = "date";
      else if (["array", "img"].includes(type)) result = "array";
      else result = type;
      return prefix + result;
    },
    isTitleColumns() {
      return TitleColumns.includes(this.data.type);
    },
    showReadWrite() {
      const { type } = this.data;
      // return !['bigtitle', 'description', 'title', 'group', 'dynamic', 'table', 'upload'].includes(type)
      return false;
    }
  },
  data() {
    return {
      relationOptions,
      collapse: ["2", "3"],
      tagOptions: [],
      bizOptions: [],
      closeContactOptions: [], //密接项
      bizModuleOptions: [], //业务模块字典
      dynamicTag: "", //子表单tag
      readOrWrite: 0
    };
  },
  watch: {
    "data.writeField": function(newVal, oldVal) {
      if (newVal) {
        this.readOrWrite = 2;
      } else {
        this.readOrWrite = 0;
      }
    },
    "data.readField": function(newVal, oldVal) {
      if (newVal) {
        this.readOrWrite = 1;
      } else {
        this.readOrWrite = 0;
      }
    },
    tempDict: {
      handler(newVal, oldVal) {
        if (!newVal) {
          this.loadFormTagOption();
          let set = new Set(this.tagOptions.concat(this.closeContactOptions));
          this.bizOptions = Array.from(set);
        } else if (newVal === oldVal) {
          return;
        } else {
          this.updateTempDict(newVal, oldVal);
        }
      },
      immediate: true
    }
  },
  created() {
    this.loadFormTagOption();
  },
  methods: {
    async updateTempDict(newVal, oldVal) {
      if (oldVal) {
        await this.clearBizProp();
      }
      let bOptions = getBizDictDataList(newVal);
      if (!bOptions) {
        console.log(
          "failed to load form field template option:",
          newVal,
          "  ",
          bOptions
        );
      }
      bOptions.forEach(item => {
        item.disabled = false;
        item.type = BIZ_NORMAL;
      });
      // let ccKeys = this.closeContactOptions.map(d=>d.dictValue)
      // console.log('keys:', ccKeys)
      // let set = new Set(this.tagOptions.concat(this.closeContactOptions).concat(bOptions))
      let set = new Set(this.tagOptions.concat(bOptions));
      setTimeout(() => {
        this.bizOptions = Array.from(set);
      }, 3000);
    },
    loadFormTagOption() {
      let tag = getDictDataList("form-tag-option");
      if (!tag) {
        console.log("failed to load form-tag-option:", tag);
      }
      tag.forEach(item => {
        item.disabled = false;
        item.type = BIZ_NORMAL;
      });
      this.tagOptions = tag;

      tag = getDictDataList("close-contact-option");
      if (!tag) {
        console.log("failed to load close-contact-option:", tag);
      }
      tag.forEach(item => {
        item.disabled = false;
        item.type = BIZ_KNOWN_CLOSE_CONTACT;
      });
      this.closeContactOptions = tag;

      let options = getDictDataList("form-biz-module-option");
      if (!options) {
        console.log("failed to load form-biz-module-option:", options);
      }
      this.bizModuleOptions = options;
    },
    isMandatory(val) {
      let flag = false;
      this.tagOptions.some(item => {
        if (item.dictLabel === val) {
          flag = true;
          return flag;
        }
      });
      return flag;
    },
    showOption(item) {
      // console.log('show:', JSON.stringify(item), ' ', this.dynamicTag)
      //属性名称分类：normal->普通，kcc->密接, 暂时分2类
      if (item.type) {
        if (this.dynamicTag && this.dynamicTag === BIZ_KNOWN_CLOSE_CONTACT) {
          return item.type === this.dynamicTag;
        } else {
          return item.type === BIZ_NORMAL;
        }
      } else {
        return false;
      }
    },
    handleRemoveTag(data) {
      delete data.tag;
    },
    handleFocus() {
      // console.log('focus : ', this.data.tag)
      let p = new Promise((resolve, reject) => {
        resolve();
      });
      p.then(() => {
        let hasSetValues = [];
        //从分组和子表单中查找已配置的bizProp
        this.columns.forEach(column => {
          if (column.type === "group" || column.type === "dynamic") {
            if (column.children) {
              column.children.column.forEach(item => {
                if (item.tag) {
                  hasSetValues.push(item.tag);
                }
              });
            }
          } else if (column.tag) {
            hasSetValues.push(column.tag);
          }
        });
        //设置disabled
        this.bizOptions.forEach(item => {
          if (hasSetValues.includes(item.dictValue)) {
            item.disabled = true;
          } else {
            item.disabled = false;
          }
        });
      });
    },
    async clearBizProp() {
      let p = new Promise((resolve, reject) => {
        resolve();
      });
      p.then(() => {
        let hasSetValues = [];
        //从分组和子表单中查找已配置的bizProp
        this.columns.forEach(column => {
          if (column.type === "group" || column.type === "dynamic") {
            if (column.children) {
              column.children.column.forEach(item => {
                item.tag = null;
              });
            }
          } else if (column.tag) {
            column.tag = null;
          }
        });
        //设置disabled
        this.bizOptions.forEach(item => {
          if (hasSetValues.includes(item.dictValue)) {
            item.disabled = true;
          } else {
            item.disabled = false;
          }
        });
      });
    },
    getDynamicTag() {
      const { prop, type } = this.data;
      this.dynamicTag = null;
      // console.log(this.columns)
      if (type !== "dynamic" && type !== "group") {
        // let tag
        let exit = false;
        this.columns.some(column => {
          if (column.type === "dynamic") {
            if (column.children) {
              column.children.column.some(item => {
                if (item.prop === prop) {
                  this.dynamicTag = column.tag;
                  exit = true;
                  return true;
                }
              });
              if (exit) return true;
            }
          }
        });
      }
    }
  }
};
</script>
<style>
fieldset {
  border: none;
}
</style>
