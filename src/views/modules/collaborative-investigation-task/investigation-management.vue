<template>
  <el-card class="aui-card--fill">
    <el-tabs type="card" :active-name="activeName" @tab-click="handleClick">
      <el-tab-pane name="release" label="协查任务" lazy>
        <investigation-release></investigation-release>
      </el-tab-pane>
      <el-tab-pane name="draft" label="草稿任务" lazy>
        <investigation-draft></investigation-draft>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script>
import InvestigationRelease from "./components/investigation-release"
import InvestigationDraft from "./components/investigation-draft"

export default {
  name: "investigation-management",
  components: {InvestigationDraft, InvestigationRelease},
  data() {
    return {
      activeName: 'release'
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
