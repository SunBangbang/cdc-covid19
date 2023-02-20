<template>
  <el-card class="aui-card--fill">
    <record-audit type="other"></record-audit>
  </el-card>
</template>
<script>
  import RecordAudit from "./record-audit"
  export default {
    name: "record-audit-list",
    components: {RecordAudit},
    data() {
      return {
        activeName: 'otherDept',
        visible: false
      }
    },
    methods: {
/*      handleClick(tab, event) {
        console.log(tab.name)
        if('otherDept' === tab.name){
          this.visible = true
        }
      }*/
    }
  }
</script>

<style scoped>

</style>
