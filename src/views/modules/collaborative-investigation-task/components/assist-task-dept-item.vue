<template>
  <el-row :class="getClass" v-loading="systemParam.loading" :gutter="10">
    <el-col :span="6" v-if="typeIsNotMy" class="left-col global">
      <avue-tree :option="deptTree.option" :data="deptTree.data"
                 @node-click="handleNodeClick">
      </avue-tree>
    </el-col>

   <el-col :span="typeIsNotMy ? 18 : 24" class="global">
    <avue-crud :option="option"
               :data="data"
               :page.sync="page"
               :table-loading="loading"
               :search.sync="search"
               @search-change="searchChange"
               @size-change="sizeChange"
               @search-reset="searchReset"
               @current-change="currentChange"
               @refresh-change="refreshChange"
               @on-load="onLoad">
      <template slot="reqDeptNameSearch">
          <dept-cascader ref="deptCascader" @selectDept="selectDept"></dept-cascader>
      </template>
      <template slot="reqDateSearch">
        <el-date-picker
                v-model="reqDate"
                type="datetimerange"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="yyyy-MM-dd HH:mm"
                value-format="yyyy-MM-dd HH:mm:ss"
                :default-time="['00:00:00']">
        </el-date-picker>
      </template>

      <template slot="pGender" slot-scope="scope">
        {{formatGender(scope.row.pGender)}}
      </template>
      <template slot="accept" slot-scope="scope">
        <el-tag size="small" :type="getTypeOfStatus(scope.row.accept)">
          {{formatStatus(scope.row.accept)}}
        </el-tag>
      </template>

      <template slot-scope="scope" slot="menu" class="menuClass">
        <el-button type="text" @click="toView(scope.row)" size="mini">查看</el-button>
        <el-divider direction="vertical" v-if="!typeIsNotMy"></el-divider>
        <span v-if="!typeIsNotMy">
           <el-button type="text" size="mini" @click.native="toAssign(scope.row)">分配流调员</el-button>
           <el-divider direction="vertical" v-if="display(scope.row)"></el-divider>
           <el-button type="text" size="mini" v-if="display(scope.row)" @click.native="toReject(scope.row)">拒绝</el-button>
        </span>
      </template>
    </avue-crud>

    <el-dialog title="选择调查员" :visible.sync="dialogTableVisible" width="70%">
      <investigator :include-all-dept="false" ref="investigator" :default-selected="invOldList" v-if="dialogTableVisible"></investigator>
      <template slot="footer">
        <el-button type="primary" size="mini" @click="addInvestigators">确定</el-button>
        <el-button size="mini" @click="dialogTableVisible = !dialogTableVisible">取消</el-button>
      </template>
    </el-dialog>
   </el-col>
  </el-row>
</template>

<script>
  import {deptAssistTaskOption} from "../js/options"
  import {deptTreeOption} from "@/api/sys/dept"
  import {assignInvestigator, pageOrgReceiveTask, rejectAssist} from '@/api/assistant/assistant'
  import {getDictDataList} from "@/utils"
  import Investigator from "@/views/modules/subject-task/investigator"
  import DeptCascader from '@/components/dept-cascader/index'

export default {
  name: "assist-task-dept-item",
  components: {Investigator, DeptCascader},
  props: {
    type: {
      type: String,
      default: 'my'
    },
    deptTreeData: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  computed: {
    getClass() {
      if (!this.otherSystemType.dept && this.type === 'other') {
        return 'display-body'
      }else {
        return ''
      }
    },
    typeIsNotMy() {
      return this.type !== 'my'
    }
  },
  data() {
    return {
      systemParam: {
        loading: false
      },
      otherSystemType: {
        dept: null,
        selectDept: null,
      },
      deptTree: {
        option: deptTreeOption({deptId: this.$store.state.user.deptId, defaultClick: true, deleteTopPid: true}),
        data: [],
      },
      //接受协查部门
      recDeptId: null,
      //协查申请部门ID
      reqDeptId: null,
      //申请时间
      reqDate: null,
      data: [],
      search: {},
      option: deptAssistTaskOption(),
      loading: true,
      page: {//表格分页
        pageSize: 10,
        currentPage: 1,
        total: 0,
        pageSizes: [10, 20, 50, 100]
      },
      genderDict: getDictDataList('gender'),
      statusDict: getDictDataList('assist-task-accept-status'),
      typeStatus: {0: 'info', 1: 'dark', 2: 'danger'},
      dialogTableVisible: false,
      selectedRow: null,
      invOldList: []
    }
  },
  mounted() {
    this.deptTree.data = this.deptTreeData
  },
  methods: {
    getTypeOfStatus(status) {
      return this.typeStatus[status] ? this.typeStatus[status] : ''
    },
    formatStatus(val) {
      let label = val
      if(this.statusDict) {
        this.statusDict.some(item=>{
          if(item.dictValue == val) {
            label = item.dictLabel
            return true
          }
        })
      }
      return label
    },
    formatGender(val) {
      let label = val
      if(this.genderDict) {
        this.genderDict.some(item=>{
          if(item.dictValue == val) {
            label = item.dictLabel
            return true
          }
        })
      }
      return label
    },
    display(row){
      if(this.validatenull(row.receiverId)){
        return true
      }
      return false
    },
    onLoad() {
      this.loading = true
      this.search.reqDeptId = this.reqDeptId
      if(this.validatenull(this.reqDate)){
        this.search.start = null
        this.search.end = null
      }else{
        this.search.start = this.reqDate[0]
        this.search.end = this.reqDate[1]
      }
      // console.log('search:', this.search)
      if(this.validatenull(this.search.deptId)){
        this.search.deptId = this.recDeptId
      }else{
        this.recDeptId = this.search.deptId
      }
      pageOrgReceiveTask(this.page.currentPage, this.page.pageSize, this.search).then(res=>{
        let d = res.data
        if(d.code === 0){
          d.data.list.forEach(item=>{
            item.display = this.validatenull(item.receiverId)? 0 : 1
            item.invOldList = []
            if (item.investIds && item.investNames) {
              let investIds = item.investIds.split(',')
              let investNames = item.investNames.split(',')
              investIds.forEach((id, index) => {
                item.invOldList.push({id: id, realName: investNames[index]})
              })
            }
          })
          this.data = d.data.list
          this.page.total = d.data.total
        }
        this.loading = false
      })
    },
    searchChange(params, done) {
      this.page.currentPage = 1
      this.onLoad()
      done()
    },
    searchReset(){
      this.reqDate = null
      this.$refs.deptCascader.reset()
      this.reqDeptId = null
    },
    sizeChange(val) {
      this.page.currentPage = 1
      this.page.pageSize = val
      this.onLoad()
    },
    currentChange(val) {
      this.page.currentPage = val
      this.onLoad()
    },
    refreshChange() {
      this.onLoad()
    },
    toView(row){
      console.log('assist task view:', row)
      this.$router.push({
        name: 'application-investigation-task-view',
        query: {
          appId: row.appId,
          taskId: row.taskId,
          formId: row.formId,
          aTaskId: row.id,
          historyId: row.historyId,
          operType: 'create'
        }
      })
    },
    // 分配协查流调员
    toAssign(row){
      console.log('toAssign:', row)
      // this.invOldList = row.invOldList
      // this.dialogTableVisible = !this.dialogTableVisible
      // this.selectedRow = row
      this.$router.push({name: 'investigator-page', params: {taskId: row.id, appId: row.appId, invList: row.invOldList, taskName: row.name}})
    },
    toReject(row){
      console.log('toReject:', row)
      rejectAssist(row.id).then(res=>{
        let d = res.data
        if(d.code === 0){
          row.accept = d.data
          //假数据
          row.receiverId = new Date().getTime()
          this.$message.success('操作成功')
        }else{
          console.error('err:', d.data.msg)
        }
      })
    },
    //选择调查对象时获取选择到的数据
    addInvestigators() {
      if(this.$refs.investigator.selectionList.length === 0){
        this.$message.warning('请选择调查员！')
        return
      }
      let selectEmployees = this.$refs.investigator.selectionList.map(item=>
         { return {userId: item.id, realName: item.realName}}
      )
      let delEmployees = []
      let employees = []
      let ids1 = []
      let ids2  = []
      // 获取 原始调查员数据与用户选择的新调查员数据差异
      this.invOldList.forEach(item => {ids1.push(item.userId)})
      selectEmployees.forEach(item => {ids2.push(item.userId)})
      let different = [
      ...ids1.filter(value=>ids2.indexOf(value)===-1),
      ...ids2.filter(value=>ids1.indexOf(value)===-1)
      ]
      // 如果这个差异仅包含在原始调查员数据中，证明该数据在新的调查员数据里是不存在的，属于删除
      this.invOldList.forEach(item => {
        if (different.includes(item.userId)) {delEmployees.push(item)}
      })
      // 如果这个差异仅包含在新调查员数据中，证明该数据在原始调查员数据里是不存在的属于新增
      selectEmployees.forEach(item => {
        if (different.includes(item.userId)) {employees.push(item)}
      })
      let obj = {
        taskId: this.selectedRow.id,
        appId: this.selectedRow.appId,
        employees: employees,
        delEmployees: delEmployees
      }
      console.log(employees, delEmployees)
      assignInvestigator(obj).then(res=>{
        let d = res.data
        if(d.code === 0){
          this.selectedRow.accept = d.data
          //假数据
          this.selectedRow.receiverId = new Date().getTime()
          this.refreshChange()
          this.$message.success('操作成功')
        }else{
          console.error('err:', d.data.msg)
          this.$message.error('操作失败')
        }
      })
      this.dialogTableVisible = !this.dialogTableVisible
    },
    handleNodeClick(e){
      // console.log('handleNodeClick.............', e)
      this.search.deptId = e.id
      this.onLoad()
    },
    selectDept(obj){
      this.reqDeptId = obj
    }
  }
}
</script>

<style scoped>
:deep(.el-form-item--mini > .el-form-item__content > .el-button--default) {
  margin-right: 5px;
}
</style>
<style scoped>
  :deep(.el-scrollbar__wrap) {
    overflow: auto;
    height: 100%;
  }
  .global {
    height: calc(80vh - 35px);
    overflow-y: auto
  }
  .left-col {
    border: 1px solid #ececec;
    border-radius: 5px;
    padding: 5px 5px;
  }
  :deep(.el-tree-node__label) {
    text-overflow: ellipsis;
    overflow: hidden;
  }
</style>
