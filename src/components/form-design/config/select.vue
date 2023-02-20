<template>
  <div>
    <el-form-item label="占位内容">
      <el-input
        v-model="data.placeholder"
        :disabled="data.edit !== undefined && !data.edit"
        placeholder="占位内容"
      ></el-input>
    </el-form-item>

    <el-form-item label="选项配置">
      <el-tabs v-model="data.dicType" stretch>
        <el-tab-pane label="静态数据" v-loading="loading" name="static">
          <draggable
            tag="ul"
            v-if="loadDict"
            :disabled="data.edit !== undefined && !data.edit"
            :list="data.dicData"
            :group="{ name: 'dic' }"
            ghost-class="ghost"
            handle=".drag-item"
          >
            <li v-for="(item, index) in data.dicData" :key="index">
              <i
                class="drag-item el-icon-s-operation"
                style="font-size: 16px; margin: 0 5px; cursor: move;"
              ></i>
              <el-input
                style="margin-right: 5px;"
                size="mini"
                v-model="item.label"
                :disabled="data.edit !== undefined && !data.edit"
                placeholder="label"
              ></el-input>
              <el-button
                @click="handleRemoveFields(index)"
                circle
                plain
                type="danger"
                :disabled="data.edit !== undefined && !data.edit"
                size="mini"
                icon="el-icon-minus"
                style="padding: 4px;margin-left: 5px;"
              ></el-button>
              <el-button
                @click="handleJoinFields(index)"
                title="关联"
                :disabled="data.edit !== undefined && !data.edit"
                circle
                plain
                type="warning"
                size="mini"
                icon="el-icon-connection"
                style="padding: 4px;margin-left: 5px;"
              ></el-button>
            </li>
          </draggable>
          <div style="margin-left: 22px;">
            <el-button
              type="text"
              :disabled="data.edit !== undefined && !data.edit"
              @click="handleAddFields"
              >添加列
            </el-button>
          </div>
        </el-tab-pane>

        <el-tab-pane label="远端数据" name="remote">
          选择数据：
          <el-select
            v-model="data.dicUrl"
            placeholder="选择数据"
            @change="handleRemote"
            style="width: 100%;"
          >
            <el-option
              v-for="item in dicUrlOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-tab-pane>
      </el-tabs>

      <div style="margin-left: 20px" v-for="(item, index) in data.dicData">
        <div v-show="selectedIndex === index">
          <span>{{ item.label }}:</span>&nbsp&nbsp&nbsp
          <el-select
            v-model="item.joinSubjects"
            placeholder="请选择关联项"
            multiple
            :disabled="data.edit !== undefined && !data.edit"
            @change="handleJoinSubjects"
            @focus="handleFocus"
            @remove-tag="handleRemoveTag"
          >
            <el-option
              v-if="joinOptions && joinOptions != undefined"
              v-for="item in joinOptions"
              :key="item.value"
              :label="item.label"
              :title="item.title"
              :value="item.value"
              :disabled="item.disabled"
            >
            </el-option>
          </el-select>
        </div>
      </div>
    </el-form-item>
    <el-form-item label="尺寸">
      <el-radio-group
        v-model="data.size"
        :disabled="data.edit !== undefined && !data.edit"
        size="mini"
      >
        <el-radio-button label="medium">正常</el-radio-button>
        <el-radio-button label="small">小</el-radio-button>
        <el-radio-button label="mini">超小</el-radio-button>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="是否多选">
      <el-switch
        v-model="data.multiple"
        :disabled="data.edit !== undefined && !data.edit"
      ></el-switch>
    </el-form-item>
    <el-form-item label="多选数量限制" v-if="data.multiple">
      <el-input-number
        v-model="data.limit"
        :disabled="data.edit !== undefined && !data.edit"
        controls-position="right"
        placeholder="多选限制"
        :min="0"
        :max="data.dicData.length"
      ></el-input-number>
    </el-form-item>
    <el-form-item label="是否可清空">
      <el-switch
        v-model="data.clearable"
        :disabled="data.edit !== undefined && !data.edit"
      ></el-switch>
    </el-form-item>
    <el-form-item label="是否可搜索">
      <el-switch
        v-model="data.filterable"
        :disabled="data.edit !== undefined && !data.edit"
      ></el-switch>
    </el-form-item>
    <el-form-item label="折叠显示">
      <el-switch
        v-model="data.collapseTitle"
        :disabled="data.edit !== undefined && !data.edit"
      ></el-switch>
    </el-form-item>
    <el-form-item label="证件格式校验">
      <el-switch
        v-model="data.idCard"
        :disabled="data.edit !== undefined && !data.edit"
      ></el-switch>
    </el-form-item>
    <config-rules :data="data"></config-rules>
    <el-form-item label="是否是核心表">
      <el-switch
        v-model="data.coreItem"
        :disabled="data.edit !== undefined && !data.edit"
      ></el-switch>
    </el-form-item>
  </div>
</template>

<script>
import Draggable from "vuedraggable";
import dictModule from "../mixins/dict-module-mixin";
import configRules from "@/components/form-design/config/config-rules";
import placeholder from "../mixins/placeholder-mixin";
import codeTableApis from "@/api/sys/CodeTable";

export default {
  name: "config-select",
  props: ["data", "columns"],
  components: { Draggable, configRules },
  mixins: [dictModule, placeholder],
  data() {
    return {
      tabPaneName: "static",
      dataCopy: this.data,
      loading: false,
      dicUrlOptions: [
        {
          value: "0",
          label: "特定职业人群"
        },
        {
          value: "1",
          label: "国籍"
        },
        {
          value: "2",
          label: "职业"
        },
        {
          value: "3",
          label: "证件类型"
        },
        {
          value: "4",
          label: "疫苗生产单位"
        },
        {
          value: "5",
          label: "病例发现途径"
        },
        {
          value: "6",
          label: "院时症状和体征"
        },
        {
          value: "7",
          label: "并发症"
        },
        {
          value: "8",
          label: "是否吸烟"
        },
        {
          value: "9",
          label: "既往病史"
        },
        {
          value: "10",
          label: "旅居史"
        },
        {
          value: "11",
          label: "实验室检测标本类型"
        },
        {
          value: "12",
          label: "实验室检测试剂厂家"
        }
      ]
    };
  },
  created() {
    this.loading = true;
    new Promise((resolve, reject) => {
      this.setDefault();
      resolve();
    })
      .then(() => {})
      .finally(() => {
        this.loadDict = true;
        if (this.data.dicData.length > 20) {
          setTimeout(() => {
            this.loading = false;
          }, 1000);
        } else {
          this.loading = false;
        }
      });
  },
  methods: {
    handleRemote(val) {
      new Promise((resolve, reject) => {
        console.log("handle remote:", val);
        const key = `remoteData-${val}`;
        let remoteOptions = sessionStorage.getItem(key);
        let options = JSON.parse(remoteOptions);
        if (this.validatenull(options)) {
          codeTableApis.getByType(val).then(res => {
            if (res.data.code === 0) {
              options = res.data.data;
              console.log("load options:", options.length);
              if (options && options.length > 0) {
                this.dataCopy.dicData = options.map(item => {
                  return {
                    label: item.dictLabel,
                    value: item.dictValue,
                    joinSubjects: []
                  };
                });
                sessionStorage.setItem(key, JSON.stringify(options));
              }
            } else {
              this.$message.error("下拉框获取远程数据失败");
            }
          });
        } else {
          console.log("load cache options:", options.length);
          if (options && options.length > 0) {
            this.dataCopy.dicData = options.map(item => {
              return {
                label: item.dictLabel,
                value: item.dictValue,
                joinSubjects: []
              };
            });
          }
        }
        resolve(options);
      });
    }
  }
};
</script>
