<template>
  <div>
    <el-form-item label="提示内容">
      <el-input
        v-model="data.placeholder"
        :disabled="data.edit !== undefined && !data.edit"
        placeholder="提示内容"
      ></el-input>
    </el-form-item>
    <el-form-item label="默认值">
      <el-input
        v-model="data.value"
        :disabled="data.edit !== undefined && !data.edit"
        placeholder="默认值"
      ></el-input>
    </el-form-item>
    <el-form-item label="前缀">
      <el-input
        v-model="data.prepend"
        :disabled="data.edit !== undefined && !data.edit"
        placeholder="前缀"
      ></el-input>
    </el-form-item>
    <el-form-item label="后缀">
      <el-input
        v-model="data.append"
        :disabled="data.edit !== undefined && !data.edit"
        placeholder="后缀"
      ></el-input>
    </el-form-item>
    <el-form-item label="最大长度">
      <el-input-number
        v-model="data.maxlength"
        :disabled="data.edit !== undefined && !data.edit"
        controls-position="right"
        placeholder="最大长度"
      ></el-input-number>
    </el-form-item>
    <el-form-item label="显示计数" v-if="data.type !== 'password'">
      <el-switch
        v-model="data.showWordLimit"
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
    <config-rules :data.sync="data"></config-rules>

    <el-form-item label="正则表达式">
      <el-select
        v-model="data.pattern"
        clearable
        placeholder="请选择正则表达式"
        :disabled="data.edit !== undefined && !data.edit"
      >
        <el-option
          v-for="item in regExpOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="是否是核心表">
      <el-switch
        v-model="data.coreItem"
        :disabled="data.edit !== undefined && !data.edit"
      ></el-switch>
    </el-form-item>
  </div>
</template>

<script>
import configRules from "./config-rules";
import placeholder from "@/components/form-design/mixins/placeholder-mixin";
import { defaultRegOptions } from "@/components/form-design/utils";

export default {
  name: "config-input",
  props: ["data"],
  components: {
    configRules
  },
  mixins: [placeholder],
  data() {
    return {
      validator: {
        type: null,
        required: null,
        pattern: null,
        length: null
      },
      regExpOptions: defaultRegOptions
    };
  },
  watch: {
    "data.label": function(newVal, oldVal) {
      //监听label变化，更新校验规则中的提示信息
      const suffixes = ["必须填写", "格式不匹配"];
      if (newVal) {
        if(this.data.rules && this.data.rules.length > 0) {
          this.data.rules.forEach((r, index) => {
            if (r.message) {
              suffixes.forEach(s => {
                if (r.message.indexOf(s) > -1) {
                  r.message = newVal + s;
                }
              });
            }
          });
        }
      }
    },
    "data.pattern": function(newVal, oldVal) {
      if (newVal) {
        //添加正则表达式
        if (this.validatenull(this.data.rules)) {
          this.data.rules = [
            { pattern: newVal, message: `${this.data.label}格式不匹配` }
          ];
        } else {
          this.data.rules.forEach((r, index) => {
            if (r.pattern) {
              this.data.rules.splice(index, 1);
            }
          });
          this.data.rules.push({
            pattern: newVal,
            message: `${this.data.label}格式不匹配`
          });
        }
      } else {
        //删除正则表达式
        if (!this.validatenull(this.data.rules)) {
          this.data.rules.forEach((r, index) => {
            if (r.pattern) {
              this.data.rules.splice(index, 1);
            }
          });
        }
      }
    }
  },
  methods: {}
};
</script>
