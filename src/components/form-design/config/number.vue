<template>
  <div>
    <el-form-item label="折叠显示">
      <el-switch
        v-model="data.collapseTitle"
        :disabled="data.edit !== undefined && !data.edit"
      ></el-switch>
    </el-form-item>
    <fieldset :disabled="data.edit !== undefined && !data.edit">
      <el-form-item label="占位内容">
        <el-input
          v-model="data.placeholder"
          :disabled="data.edit !== undefined && !data.edit"
          placeholder="占位内容"
        ></el-input>
      </el-form-item>
      <el-form-item label="默认值">
        <el-input
          v-model="data.value"
          :disabled="data.edit !== undefined && !data.edit"
          placeholder="默认值"
        ></el-input>
      </el-form-item>
      <el-form-item label="最小值">
        <el-input-number
          v-model="data.minRows"
          controls-position="right"
          :disabled="data.edit !== undefined && !data.edit"
          placeholder="最小值"
        ></el-input-number>
      </el-form-item>
      <el-form-item label="最大值">
        <el-input-number
          v-model="data.maxRows"
          :disabled="data.edit !== undefined && !data.edit"
          controls-position="right"
          placeholder="最大值"
        ></el-input-number>
      </el-form-item>
      <el-form-item label="步长">
        <el-input-number
          v-model="data.step"
          controls-position="right"
          :disabled="data.edit !== undefined && !data.edit"
          placeholder="步长"
        ></el-input-number>
      </el-form-item>
      <el-form-item label="数值精度">
        <el-input-number
          v-model="data.precision"
          :disabled="data.edit !== undefined && !data.edit"
          controls-position="right"
          placeholder="数值精度"
          :min="0"
          :max="10"
        ></el-input-number>
      </el-form-item>
      <el-form-item label="控制器位置">
        <el-radio
          v-model="data.controlsPosition"
          :disabled="data.edit !== undefined && !data.edit"
          label=""
          >默认
        </el-radio>
        <el-radio
          v-model="data.controlsPosition"
          :disabled="data.edit !== undefined && !data.edit"
          label="right"
          >右
        </el-radio>
      </el-form-item>
    </fieldset>
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
  name: "config-number",
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
