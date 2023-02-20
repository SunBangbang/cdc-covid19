<template>
  <avue-crud :data="taskData" :option="option"
             :page.sync="page"
             v-model="form"
             :search.sync="search"
             :table-loading="loading"
             @search-change="searchChange"
             @search-reset="searchReset"
             @size-change="sizeChange"
             @current-change="currentChange"
             @refresh-change="refreshChange"
             @on-load="onLoad(undefined)" class="hscrollbar-table">
    <template slot="menu" slot-scope="scope">
      <el-button type="text" size="mini" @click="toEdit(scope.row.id)">使用</el-button>
      <el-button type="text" size="mini" @click="deleteData(scope.row.id)">删除</el-button>
    </template>
  </avue-crud>
</template>

<script>
import {draftOption} from "@/views/modules/subject-task/option/taskDraftOption"
import {getPageTaskDraftData, removeTaskDraft, getTaskDraftById} from "@/api/subject-task/task-management"

export default {
  name: "investigation-draft",
  data() {
    return {
      taskData: [],
      searchForm: {},
      option: draftOption(),
      page: {
        pageSize: 10,
        currentPage: 1,
        total: 0,
        pageSizes: [10, 20, 50, 100]
      },
      form: {},
      query: {},
      search: {},
      loading: true,
    }
  },
  methods: {
    onLoad(done) {
      this.loading = true
      this.search = this.search ? this.search : {}
      let params = {
        deptId: this.$store.state.user.deptId,
        creator: this.$store.state.user.id,
        type: 1,
        ...this.search
      }
      getPageTaskDraftData(this.page.currentPage, this.page.pageSize, params).then((res) => {
        this.taskData = res.data.data.list
        this.page.total = res.data.data.total
        this.loading = false
        console.log(done)
        if (done) {
          done()
        }
      })
    },
    sizeChange(val) {
      this.page.currentPage = 1;
      this.page.pageSize = val
      this.onLoad(undefined);
    },
    currentChange(val) {
      this.page.currentPage = val;
      this.onLoad(undefined);
    },
    refreshChange() {
      this.onLoad(undefined);
    },
    searchReset() {
      this.search = {};
      this.onLoad(undefined)
    },
    searchChange(params, done) {
      this.page.currentPage = 1
      this.page.pageSize = 10
      this.onLoad(done);
    },
    deleteData(id){
      this.$confirm("确定要删除此条草稿么？",'提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        cancelButtonClass: "btn-custom-cancel",
        type: 'warning'
      }).then(() => {
        removeTaskDraft(id).then((res) => {
          if (res.data.code === 0) {
            this.$message.success("删除成功")
            this.onLoad()
          } else {
            this.$message.error("删除失败，" + res.data.msg)
          }
        })
      }).catch(() => {})
    },
    // 编辑
    toEdit(id){
      getTaskDraftById(id).then(res=>{
        if (res.data.code === 0) {
          let text = res.data.data
          let json = JSON.parse(text.jsonBody)
          console.log('json:', json)
          this.$router.push({name: "application-investigation-task-creator",
            params: {...json, surveyFormId: json.formId, taskId: json.taskId, draftId: id}})
        } else {
          console.error('err:', res.data.msg)
        }
      })

    },
  }

}
</script>

<style scoped>

</style>
