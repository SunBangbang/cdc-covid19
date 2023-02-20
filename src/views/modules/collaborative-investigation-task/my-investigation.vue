<template>
  <el-card class="aui-card--fill">
    <el-tabs type="card" :active-name="activeName" @tab-click="handleClick">
      <el-tab-pane name="working" label="进行中" lazy>
        <investigation-detail-item :status="0"></investigation-detail-item>
      </el-tab-pane>
      <el-tab-pane name="finished" label="已完成" lazy>
        <investigation-detail-item :status="1"></investigation-detail-item>
      </el-tab-pane>
      <el-tab-pane name="rejected" label="驳回" lazy>
        <investigation-detail-item :status="2"></investigation-detail-item>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script>
import InvestigationDetailItem from "./components/investigation-detail-item"

export default {
  name: "my-investigation",
  components: {InvestigationDetailItem},
  data() {
    return {
      activeName: 'working'
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
