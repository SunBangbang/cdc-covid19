<template>
  <el-row>
    <back-bar></back-bar>
    <el-card class="aui-card--fill--back">
      <p>分配协查任务<span>{{params.taskName}}</span>的流调员</p>
      <investigator-creator :task-id="params.taskId" :inv-list="params.invList" :app-id="params.appId"></investigator-creator>
    </el-card>
  </el-row>

</template>

<script>
import InvestigatorCreator from "@/views/modules/collaborative-investigation-task/components/investigatorCreator";
import BackBar from "@/components/back-bar/back-bar";

export default {
  name: "investigator-page",
  components: {BackBar, InvestigatorCreator},
  beforeRouteEnter(to, from, next) {
    let params = JSON.stringify(to.params)
    if (params !== '{}') sessionStorage.setItem("routerParams", params)
    next()
  },
  data() {
    return {
      params: {}
    }
  },
  created() {
    this.getRouterParams()
  },
  methods: {
    getRouterParams() {
      let params = JSON.stringify(this.$route.params)
      if (params === '{}') {
        this.params = JSON.parse(sessionStorage.getItem("routerParams"))
      } else {
        this.params = this.$route.params
      }
    }

  }
}
</script>

<style scoped>
p {
  font-size: 16px;
  font-weight: bold;
  padding-bottom: 10px;
}
p > span {
  color: #aaaaaa;
  padding: 0 5px;
}
</style>
