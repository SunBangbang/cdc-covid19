<template>
  <div>
    <el-form-item label="开启折叠">
      <el-switch v-model="data.arrow"
                 :disabled="data.edit !== undefined && !data.edit"></el-switch>
    </el-form-item>
    <el-form-item label="默认展开"
                  v-if="data.arrow">
      <el-switch v-model="data.collapse"
                 :disabled="data.edit !== undefined && !data.edit"></el-switch>
    </el-form-item>
  </div>
</template>
<script>

export default {
  name: "config-group",
  props: ['data'],
  data() {
    return {}
  }
}
</script>
