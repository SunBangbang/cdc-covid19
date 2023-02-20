<template>
  <el-row>
    <back-bar></back-bar>
    <sample-scattered-detail :query="query" :full="true"></sample-scattered-detail>
  </el-row>
</template>

<script>
import SampleScatteredDetail from "@/views/modules/survey-form/components/compareData/sample-scattered-detail";
import BackBar from "@/components/back-bar/back-bar";
export default {
  name: "collaborative-write-sample",
  components: {BackBar, SampleScatteredDetail},
  beforeRouteEnter(to, from, next) {
    let params = JSON.stringify(to.params)
    if (params !== '{}') {
      localStorage.setItem("routerParams", params)
    }
    next()
  },
  data() {
    return {
      params: {},
      query: this.$route.query,
    }
  },
  created() {
    this.getRouterParams()
  },
  methods: {
    getRouterParams() {
      let params = JSON.stringify(this.$route.params)
      if (params === '{}') {
        this.params = JSON.parse(localStorage.getItem("routerParams"))
      } else {
        this.params = this.$route.params
      }
    },
  }
}
</script>

<style scoped>

</style>
