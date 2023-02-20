<template>
  <el-card shadow="never" class="aui-card--fill">
<!--    如果需要手动合并，可以解除这些注释-->
<!--    <el-tabs stretch>-->
<!--      <el-tab-pane label="调查对象列表">-->
        <respondent :menu="true"></respondent>
<!--      </el-tab-pane>-->
<!--      <el-tab-pane label="调查对象信息合并">-->
<!--        <respondent :havingNumber="1" :menu="true"></respondent>-->
<!--      </el-tab-pane>-->
<!--    </el-tabs>-->
  </el-card>
</template>

<script>
import Respondent from "@/views/modules/subject-task/respondent";
export default {
  name: "respondentPage",
  components: {Respondent}
}
</script>

<style scoped>

</style>
