<template>
  <div>
    <el-form-item label="是否轨迹">
      <el-switch v-model="data.track"
                 :disabled="data.edit !== undefined && !data.edit"></el-switch>
    </el-form-item>
    <el-form-item label="折叠显示">
      <el-switch v-model="data.collapseTitle"
                 :disabled="data.edit !== undefined && !data.edit"></el-switch>
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
import configRules from './config-rules'

export default {
  name: "config-regionSelect",
  props: ['data'],
  components:{
    configRules
  },
  data() {
    return {
      show: true,
      fieldShow: true
    }
  },
  created() {
    let tag = this.data.tag
    if(tag && tag === 'location'){
      this.show = false
      this.fieldShow = true
    }
  },
  watch: {

  }
}
</script>

<style scoped>

</style>
