<template>
  <el-card class="aui-card--fill">
    <el-tabs :active-name="activeName" type="card" @tab-click="handleClick">
      <el-tab-pane name="todo" label="待审核">
        <report-main type="a_todo" v-if="activeName==='todo'" source="my_a"></report-main>
      </el-tab-pane>
      <el-tab-pane name="pass" label="已审核">
        <report-main type="a_pass" v-if="activeName==='pass'" source="my_a"></report-main>
      </el-tab-pane>
      <el-tab-pane name="reject" label="已驳回">
        <report-main type="a_reject" v-if="activeName==='reject'" source="my_a"></report-main>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>
<script>

import ReportMain from "./report-main"

export default {
  name: "report-audit",
  components: {ReportMain},
  data() {
    return {
      activeName: 'todo',
    }
  },
  created() {
    if (sessionStorage.getItem('tab')) {
      this.activeName = sessionStorage.getItem('tab')
    }
  },
  methods: {
    handleClick(tab, event) {
      sessionStorage.setItem('tab', tab.name)
      this.activeName = tab.name
    }
  }
}
</script>

<style scoped>

</style>
