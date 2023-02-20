<template>
  <el-row :class="getClass" v-loading="systemParam.loading" :gutter="10" style="">
    <el-col :span="6" v-if="typeIsNotMy" class="left-col global">
      <avue-tree :option="deptTree.option" :data="deptTree.data" @node-click="handleNodeClick"></avue-tree>
    </el-col>
    <el-col :span="typeIsNotMy ? 18 : 24" class="global">
      <avue-crud :option="crud.option" :data="crud.data"
                 :page.sync="page"
                 :table-loading="loading"
                 :search.sync="search"
                 @search-reset="reset"
                 @search-change="searchChange"
                 @size-change="sizeChange"
                 @current-change="currentChange"
                 @refresh-change="refreshChange">
        <template slot-scope="scope" slot="menu" class="menuClass">
          <el-button type="text" v-if="scope.row.passed" @click="viewAuditSample(scope.row)" size="mini">查看</el-button>
          <el-button type="text" v-else @click="viewAuditHistoryDialog(scope.row)" size="mini">查看审核进度</el-button>
        </template>
      </avue-crud>
    </el-col>
    <report-history-tree-dialog v-if="dialogParams.visible" :params="dialogParams.params" @close="close"></report-history-tree-dialog>
  </el-row>
</template>

<script>

import {deptTreeOption, treeAllDept} from "@/api/sys/dept"
import {auditRecordOption} from  "./options"
import {pageAudit} from "@/api/survey-form/reported_sample"
import ReportHistoryTreeDialog from "@/views/modules/reported/report-history-tree-dialog";

export default {
  name: "record-audit",
  components: {ReportHistoryTreeDialog},
  props: {
    type: {
      type: String,
      default: () => {
        return 'my'
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
      loading: true,
      search: {},
      clickDeptId: "",
      page: {//表格分页
        pageSize: 10,
        currentPage: 1,
        total: 0,
        pageSizes: [10, 20, 50, 100]
      },
      crud: {
        option: auditRecordOption(),
        data: [],
      },
      dialogParams: {
        visible: false,
        params: {
          rpid: null
        }
      }
    }
  },
  mounted() {
    this.loadDeptTree()
    this.onLoad()
  },
  methods: {
    searchWithDept() {
      this.otherSystemType.dept = this.otherSystemType.selectDept
    },
    onLoad() {
      this.loading = true
      pageAudit(this.page.currentPage, this.page.pageSize, this.search).then((res) => {
        if(res.data.code === 0){
          let data = res.data.data
          this.crud.data = data.list
          this.page.total = data.total
        }else {
          console.error('err:', res.data.msg)
        }
        this.loading = false
      })
    },
    loadDeptTree(){
      let treeData = localStorage.getItem('dept-tree')
      if(treeData){
        console.log('load dept tree cache...')
        this.deptTree.data = JSON.parse(treeData)
      }else{
        console.log('load dept tree...')
        let params = {deptId: 0}
        treeAllDept({pid: params.deptId}).then((res) => {
          if(res.data.code===0){
            let children = res.data.data[0].children
            children.sort((a, b)=> a.id-b.id)
            this.deptTree.data = children
            localStorage.setItem('dept-tree', JSON.stringify(children))
          }else{
            console.error('err:', res.data.msg)
          }
        })
      }
    },

    handleNodeClick(e){
      // console.log('handleNodeClick.............', e)
      //中疾控查看所有数据
      this.search.deptId = e.id
      this.clickDeptId = e.id
      this.onLoad()
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
    reset() {
      this.search = {
        deptId: this.clickDeptId
      }
    },
    viewAuditSample(row) {
      // console.log('row:', row)
      if (!row || row === null)
        return
      // console.log('tabs:', this.$store.state.contentTabs)
      this.$router.push({
                name: 'questionnaire-detail',
                params: {
                  operation: 'viewAudit', id: row.sampleId, surveyFormId: row.formId
                },
                query: {
                   auditAttachIds: row.attachIds
                }
              }
      )
    },
    viewAuditHistoryDialog(row) {
      this.dialogParams.params.rpid = row.id
      this.dialogParams.visible = true
    },
    close() {
      this.dialogParams.visible = false
      this.dialogParams.params.rpid = null
    }
  },

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
</style>
