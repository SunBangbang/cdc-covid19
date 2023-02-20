<template>
  <div>
    <el-form-item label="选项配置"
      ><br />
      <draggable
        tag="ul"
        :list="data.dicData"
        :group="{ name: 'dic' }"
        ghost-class="ghost"
        :disabled="data.edit !== undefined && !data.edit"
        handle=".drag-item"
      >
        <li v-for="(item, index) in data.dicData" :key="'dic' + index">
          <i
            class="drag-item el-icon-s-operation"
            style="font-size: 16px; margin: 0 5px; cursor: move;"
          ></i>
          <el-input
            style="margin-right: 5px;"
            :disabled="data.edit !== undefined && !data.edit"
            size="mini"
            v-model="item.label"
            maxlength="40"
            placeholder="label"
          ></el-input>
          <el-button
            @click="handleRemoveRadioFields(index, item)"
            circle
            :disabled="data.edit !== undefined && !data.edit"
            plain
            type="danger"
            size="mini"
            icon="el-icon-minus"
            style="padding: 4px;margin-left: 5px;"
          ></el-button>
          <el-button
            @click="handleJoinFields(index)"
            title="关联"
            circle
            plain
            :disabled="data.edit !== undefined && !data.edit"
            type="warning"
            size="mini"
            icon="el-icon-connection"
            style="padding: 4px;margin-left: 5px;"
          ></el-button>
        </li>
      </draggable>
      <div style="margin-left: 22px;" v-if="showAdd">
        <el-button
          type="text"
          :disabled="data.edit !== undefined && !data.edit"
          @click="handleAddFields"
          >添加列
        </el-button>
      </div>
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
              v-for="(item, index) in joinOptions"
              :key="index + 'options' + item.value"
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
    <el-form-item label="关联表单">
      <el-select
        v-model="data.relatedDynamic"
        clearable
        @clear="clearRelFormVal"
        @visible-change="getDefault($event)"
        @change="setRelatedColumn"
        placeholder="选择关联表单"
      >
        <el-option
          v-for="(item, index) in joinDynamicOptions"
          :key="index + 'options' + item.value"
          :label="item.label"
          :title="item.title"
          :value="item.value"
          :disabled="item.disabled"
        >
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="绑定选项">
      <el-select
        v-model="relFormVal"
        clearable
        @change="changeRelatedFormVal"
        placeholder="绑定关联表单选项"
      >
        <el-option
          v-for="item in data.dicData"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
    </el-form-item>

    <el-form-item label="疫点" v-if="!data.button">
      <el-switch
        v-model="data.epidSpot"
        :disabled="data.edit !== undefined && !data.edit"
      ></el-switch>
    </el-form-item>
    <el-form-item label="折叠显示">
      <el-switch
        v-model="data.collapseTitle"
        :disabled="data.edit !== undefined && !data.edit"
      ></el-switch>
    </el-form-item>
    <!--    <el-form-item label="来源标记">
      <el-switch v-model="data.sourceTag"
                 :disabled="data.edit !== undefined && !data.edit"></el-switch>
    </el-form-item>-->
    <el-form-item label="证件格式校验">
      <el-switch
        v-model="data.idCard"
        :disabled="data.edit !== undefined && !data.edit"
      ></el-switch>
    </el-form-item>
    <el-form-item label="边框" v-if="!data.button">
      <el-switch
        v-model="data.border"
        :disabled="data.edit !== undefined && !data.edit"
      ></el-switch>
    </el-form-item>

    <el-form-item label="尺寸" v-if="data.border || data.button">
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

export default {
  name: "config-radio",
  props: ["data", "columns"],
  components: { Draggable, configRules },
  mixins: [dictModule],
  data() {
    return {
      epidSpot: false,
      showAdd: true,
      sourceTag: false,
      //记录触发关联表单选项值
      relFormVal: this.data.relFormVal ? this.data.relFormVal : ""
    };
  },
  created() {
    this.setDefault();
  },
  watch: {
    "data.epidSpot": function(newVal, oldVal) {
      if (newVal) {
        this.data.dicData = [
          { label: "是", value: "0", joinSubjects: [] },
          { label: "否", value: "1", joinSubjects: [] }
        ];
        this.showAdd = false;
        this.data.label = "是否疫点";
      } else {
        this.showAdd = true;
      }
    },
    "data.label": {
      handler(val) {
        if (val && val.endsWith("性别")) {
          this.data.dicData = [
            { label: "男", value: "0", joinSubjects: [] },
            { label: "女", value: "1", joinSubjects: [] }
          ];
        }
      }
    }
  },
  methods: {
    getDefault(callback) {
      if (callback) {
        this.setDefault();
      }
    },
    setRelatedColumn(value) {
      for (let item of this.columns) {
        if (item.parentDynamicProp === this.data.prop) {
          item.parentDynamicProp = "";
          break;
        }
      }
      if (value !== "") {
        for (let item of this.columns) {
          if (item.prop === value) {
            item.parentDynamicProp = this.data.prop;
            if (this.validatenull(this.relFormVal)) {
              this.relFormVal = this.data.dicData[0].value;
              item.relFormVal = this.relFormVal;
            }
            break;
          }
        }
      }
    },
    clearRelFormVal() {
      this.relFormVal = "";
      this.data.relFormVal = "";
    },
    changeRelatedFormVal(val) {
      this.relFormVal = val;
      this.data.relFormVal = val;
    },
    handleRemoveRadioFields(index, item) {
      this.handleRemoveFields(index);
      if (item.value === this.relFormVal) {
        if (!this.validatenull(this.data.dicData)) {
          this.relFormVal = this.data.dicData[0].value;
          this.data.relFormVal = this.relFormVal;
        }
      }
      if (this.validatenull(this.data.dicData)) {
        this.data.relatedDynamic = null;
        this.relFormVal = "";
        this.data.relFormVal = "";
      }
    }
  }
};
</script>
