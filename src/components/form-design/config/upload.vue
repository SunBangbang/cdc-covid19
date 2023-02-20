<template>
  <div>
    <el-form-item label="最大允许上传个数">
      <el-input-number
        v-model="data.maxCount"
        controls-position="right"
        :disabled="data.edit !== undefined && !data.edit"
        :min="1"
        placeholder="最大允许上传个数"
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

export default {
  name: "config-upload",
  props: ["data"],
  components: {
    configRules
  },
  data() {
    return {};
  }
};
</script>
