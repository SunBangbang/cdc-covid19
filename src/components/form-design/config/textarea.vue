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
    <el-form-item label="最大长度">
      <el-input-number
        v-model="data.maxlength"
        :disabled="data.edit !== undefined && !data.edit"
        controls-position="right"
        placeholder="最大长度"
      ></el-input-number>
    </el-form-item>
    <el-form-item label="显示计数">
      <el-switch
        v-model="data.showWordLimit"
        :disabled="data.edit !== undefined && !data.edit"
      ></el-switch>
    </el-form-item>
    <el-form-item label="最小行">
      <el-input-number
        v-model="data.minRows"
        controls-position="right"
        placeholder="最小行"
        :disabled="data.edit !== undefined && !data.edit"
        :min="1"
      ></el-input-number>
    </el-form-item>
    <el-form-item label="最大行">
      <el-input-number
        v-model="data.maxRows"
        :disabled="data.edit !== undefined && !data.edit"
        controls-position="right"
        placeholder="最大行"
        :min="2"
      ></el-input-number>
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
import configRules from "@/components/form-design/config/config-rules";
import placeholder from "@/components/form-design/mixins/placeholder-mixin";

export default {
  name: "config-textarea",
  props: ["data"],
  components: {
    configRules
  },
  mixins: [placeholder],
  data() {
    return {};
  }
};
</script>
