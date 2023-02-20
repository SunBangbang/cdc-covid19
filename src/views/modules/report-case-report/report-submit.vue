<template>
  <el-card class="aui-card--fill">
    <el-tabs :active-name="activeName" type="card" @tab-click="handleClick">
      <el-tab-pane name="todo" label="审核中">
        <report-main type="s_todo" v-if="activeName==='todo'"></report-main>
      </el-tab-pane>
      <el-tab-pane name="pass" label="已完成">
        <report-main type="s_pass" v-if="activeName==='pass'"></report-main>
      </el-tab-pane>
      <el-tab-pane name="reject" label="已驳回">
        <report-main type="s_reject" v-if="activeName==='reject'"></report-main>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>
<script>

import ReportMain from "./report-main"

export default {
  name: "report-submit",
  components: {ReportMain},
  data() {
    return {
      activeName: 'todo'
    }
  },
  created() {
    if (sessionStorage.getItem('tab')) {
      this.activeName = sessionStorage.getItem('tab')
    }
  },
  methods: {
    handleClick(tab) {
      sessionStorage.setItem('tab', tab.name)
      this.activeName = tab.name
    }
  }
}
</script>

<style scoped>

</style>
