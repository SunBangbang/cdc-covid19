<template>
  <el-card class="aui-card--fill">
    <el-tabs type="card" :active-name="activeName" @tab-click="handleClick"  v-if="showChildDept===2">
      <el-tab-pane name="currentDept" label="当前组织">
        <assist-task-dept-item type="my"></assist-task-dept-item>
      </el-tab-pane>
      <el-tab-pane name="childDept" label="下级组织">
        <assist-task-dept-item type="child" v-if="visible" style="padding-left: 5px" :deptTreeData="deptTreeData"></assist-task-dept-item>
      </el-tab-pane>
    </el-tabs>
    <assist-task-dept-item type="my" v-if="showChildDept===1"></assist-task-dept-item>
  </el-card>
</template>

<script>
import AssistTaskDeptItem from "./components/assist-task-dept-item"
import {lazyDeptTree} from "@/api/sys/dept"

export default {
  name: "investigation-request",
  components: {AssistTaskDeptItem},
  data() {
    return {
      activeName: 'currentDept',
      visible: false,
      showChildDept: 0,
      deptTreeData: []
    }
  },
  created() {
    if (sessionStorage.getItem('tab')) {
      this.activeName = sessionStorage.getItem('tab')
      if('childDept' === this.activeName){
        this.visible = true
      }
    }

    lazyDeptTree({pid: this.$store.state.user.deptId}).then(({data}) => {
      if (!(data.data[0] && data.data[0].children)) {
        this.showChildDept = 1
      }else{
        this.showChildDept = 2
        this.deptTreeData = data.data
      }
    })
  },
  methods: {
    handleClick(tab, event) {
      sessionStorage.setItem('tab', tab.name)
      this.activeName = tab.name
      if('childDept' === tab.name){
        this.visible = true
      }
    }
  }
}
</script>

<style scoped>

</style>
