<template>
  <el-dialog title="选择调查表" :visible.sync="dialogVisible" width="30%">
    <el-table size="mini" :data="questionnaireList" :show-header="false" @row-click="handleRowClick">
      <el-table-column prop="surveyName"></el-table-column>
    </el-table>
  </el-dialog>
</template>
<script>
  import {getRelatedForm} from '@/api/subject-task/task-management'
  export default {
    data() {
      return {
        dialogVisible: false,
        questionnaireList: [],
        taskId: '',
        type: ''
      }
    },
    methods: {
      init(taskId) {
        this.dialogVisible = true
        if (null != taskId) {
          this.taskId = taskId
          this.getQuestionnaireOptions()
        }
      },
      getQuestionnaireOptions() {
        getRelatedForm(this.taskId).then(res => {
          this.questionnaireList = res.data.data
        })
      },
      handleRowClick(row) {
        this.dialogVisible = false
        this.$router.push({name: 'write-questionnaire', params: {taskId: this.taskId, surveyFormId: row.oid, type: this.type}})
      }
    }
  }
</script>
