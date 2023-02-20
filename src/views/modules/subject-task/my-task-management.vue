<template>
  <el-card class="aui-card--fill">
      <el-tabs  type="card" :active-name="activeName" @tab-click="handleClick">
        <el-tab-pane name="now" label="当前组织任务" lazy>
          <my-task :is-my-dept="true"></my-task>
        </el-tab-pane>
        <el-tab-pane name="other" label="其他组织任务" lazy>
          <my-task :is-my-dept="false"></my-task>
        </el-tab-pane>
      </el-tabs>
    </el-card>
</template>

<script>
import MyTask from "@/views/modules/subject-task/my-task"

export default {
  name: "my-task-management",
  components: {MyTask},
  data() {
      return {
        activeName: 'now',
      };
    },
  created() {
    let tabName = sessionStorage.getItem('tab')
    if(this.validatenull(tabName)){
      this.activeName = 'now'
    }else{
      if(tabName !== 'now' || tabName !=='other'){
        this.activeName = 'now'
      }
    }
  },
  methods: {
    handleClick(tab) {
      sessionStorage.setItem('tab', tab.name)
    }
  }
}
</script>
<style scoped></style>
