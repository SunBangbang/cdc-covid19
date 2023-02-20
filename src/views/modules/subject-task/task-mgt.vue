<template>
  <el-card shadow="never" class="aui-card--fill">
    <el-tabs v-model="activeName" type="card"  @tab-click="handleClick" >
      <el-tab-pane label="发布任务" name="now">
        <task-management></task-management>
      </el-tab-pane>
      <el-tab-pane label="草稿任务" lazy name="draft">
        <task-draft-management></task-draft-management>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script>
import TaskManagement from "@/views/modules/subject-task/task-management";
import TaskDraftManagement from "@/views/modules/subject-task/taskDraftManagement";
export default {
  name: "task-mgt",
  components: {TaskDraftManagement, TaskManagement},
  data() {
    return {
      activeName: "now"
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
    }
  }
}
</script>

<style scoped>
</style>
