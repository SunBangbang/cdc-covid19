<template>
  <el-card class="aui-card--fill">
    <el-tabs :active-name="pageSystemParams.activeName" type="card" @tab-click="handleClick">
      <el-tab-pane name="myDept" label="当前组织">
        <information-investigation type="my"></information-investigation>
      </el-tab-pane>
      <el-tab-pane name="otherDept" label="下级组织">
        <information-investigation type="other" lazy></information-investigation>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>
<script>

import InformationInvestigation from "@/views/modules/investigation-case/information-investigation"
export default {
  name: "information-management",
  components: {InformationInvestigation},
  data() {
    return {
      pageSystemParams:{
        activeName: 'myDept'
      },
    }
  },
  created() {
    if (sessionStorage.getItem('tab')) {
      this.pageSystemParams.activeName = sessionStorage.getItem('tab')
    }
  },
  methods: {
    handleClick(tab) {
      sessionStorage.setItem('tab', tab.name)
      this.pageSystemParams.activeName = tab.name
    }
  }
}
</script>

<style scoped>

</style>
