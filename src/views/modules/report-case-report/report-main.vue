<template>
  <el-row :class="getClass" v-loading="systemParam.loading" :gutter="30" style="padding-left: 15px">
      <avue-crud  ref="crud"
                 :option="crud.option"
                 :data="data"
                 :page.sync="page"
                 :table-loading="loading"
                 :search.sync="search"
                 @search-reset="searchReset"
                 @search-change="searchChange"
                 @size-change="sizeChange"
                 @current-change="currentChange"
                 @refresh-change="refreshChange"
                 @on-load="onLoad"
                 @selection-change="selectionChange">
          <template slot-scope="scope" slot="menu" class="menuClass">
              <el-button type="text" @click="viewAuditSample(scope.row)" size="mini">查看</el-button>
              <el-button type="text" v-if="operation===1" @click="doAuditSample(scope.row)" size="mini">审核</el-button>
              <el-button type="text" v-if="operation===2" @click="editAuditSample(scope.row)" size="mini">编辑</el-button>
          </template>

          <template slot="menuLeft">
            <el-button v-if="$store.state.user.superAdmin === 1 && source !== 'my_a'" type="danger" size="mini" icon="el-icon-delete" @click="toDel">删除</el-button>
          </template>

          <template slot="submitDeptNameSearch">
              <dept-cascader ref="deptCascader" @selectDept="selectDept"></dept-cascader>
          </template>
      </avue-crud>
  </el-row>
</template>

<script>

import {reportCaseOption} from './js/caseOptions'
import {pageMySubmit, pageMyAudit, batchDelete} from '@/api/survey-form/reported_sample'
import DeptCascader from '@/components/dept-cascader/index'

export default {
  name: "report-main",
  components: {DeptCascader},
  props: {
    type: {
      type: String,
      default: () => {
        return 'my'
      }
    },
    source: {
      type: String,
      default: ''
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
      status: 0,
      nameMap: {'todo': 0, 'pass': 1, 'reject': 2},
      loading: true,
      search: {},
      page: {//表格分页
        pageSize: 10,
        currentPage: 1,
        total: 0,
        pageSizes: [10, 20, 50, 100]
      },
      data: [],
      //操作按钮类型： 0-查看, 1->审核, 2->编辑
      operation: 0,
      //报告组织ID
      reqDeptId: null,
      crud: {
        option: reportCaseOption({type: this.type}),
      },
      selectionList: [],
    }
  },
  methods: {
    searchWithDept() {
      this.otherSystemType.dept = this.otherSystemType.selectDept
    },
    onLoad() {
      this.loading = true
      this.search.reportedDeptId = this.reqDeptId

      let tmp = this.type.substring(2)
      this.status = this.nameMap[tmp]
      let params = {status: this.status}
      if(this.type.startsWith('s_')){
        //我的提交，驳回状态 0->待审批，1->通过，2->驳回
        this.operation = this.status === 2? 2 : 0
        pageMySubmit(this.status, this.page.currentPage, this.page.pageSize, this.search).then(res=>{
          let d = res.data
          if(d.code === 0){
            this.page.total = d.data.total
            this.data = d.data.list
          }else{
            console.error('err:', d.msg)
          }
          this.loading = false
        })
      }else if(this.type.startsWith('a_')){
        //我的审核，待审核状态 0->待审批，1->通过，2->驳回
        this.operation = this.status === 0? 1 : 0
        //中疾控机构只查看
        if(this.$store.state.user.deptPid === '0'){
          this.operation = 0
        }
        pageMyAudit(this.status, this.page.currentPage, this.page.pageSize, this.search).then(res=>{
          let d = res.data
          if(d.code === 0){
            this.page.total = d.data.total
            this.data = d.data.list
          }else{
            console.error('err:', d.msg)
          }
          this.loading = false
        })
      }else{
        this.loading = false
        this.page.total = 0
        this.data = []
      }
    },
    searchChange(params, done) {
      this.page.currentPage = 1
      this.onLoad()
      done()
    },
    sizeChange(val) {
      this.page.currentPage = 1
      this.page.pageSize = val
      this.onLoad()
    },
    currentChange(val) {
      this.page.currentPage = val;
      this.onLoad()
    },
    refreshChange() {
      this.onLoad()
    },
    selectionChange(list) {
      this.selectionList = list;
    },
    toDel() {
      if(this.selectionList.length < 1) {
        this.$message.warning('请先选择需要删除的数据')
        return
      }
      this.$confirm("确定将选择数据删除?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        cancelButtonClass: "btn-custom-cancel",
        type: "warning"
      })
        .then(() => {
          batchDelete(this.selectionList.map(s => s.id)).then(res => {
            console.log(res)
            if(res.data.code === 0) {
              this.$message.success('操作成功')
              this.selectionList = [];
              this.$refs.crud.toggleSelection();
              this.onLoad();
            } else {
              this.$message.error({ message: res.data.msg, duration: 10000 });
            }
          })
      }).catch(() => {});
    },
    viewAuditSample(row){
      // console.log('row:', row)
      this.$store.state.contentTabs = this.$store.state.contentTabs.filter(item => item.name !== 'questionnaire-detail')
      this.$nextTick(() => {
        this.$router.push({
          name: 'report-sample-detail-viewer',
          params: {...row, type: 'view'},
        })
      })
    },
    doAuditSample(row){
      this.$router.push({
        name: 'report-sample-detail-viewer',
        params: {...row, type: 'auditView'},
      })
    },
    editAuditSample(row){
      this.$store.state.contentTabs = this.$store.state.contentTabs.filter(item => item.name !== 'questionnaire-detail')
      this.$nextTick(() => {
        this.$router.push({
          name: 'report-sample-detail-viewer',
          params: {...row, type: 'editView'}
        })
      })
    },
    selectDept(obj){
      this.reqDeptId = obj
    },
    searchReset(){
      this.$refs.deptCascader.reset()
      this.reqDeptId = null
    }
  }
}
</script>

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
:deep(.avue-crud.avue-crud--card) {
  padding-right: 15px;
}
</style>
