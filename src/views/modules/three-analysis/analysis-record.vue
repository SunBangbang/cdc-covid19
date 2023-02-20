<template>
  <el-card class="aui-card--fill">
    <avue-crud :data="data"
                :option="option"
                :page.sync="page"
                :search.sync="search"
                :table-loading="loading"
                @on-load="onLoad"
                @search-change="searchChange"
                @refresh-change="refreshChange">
        <template slot="menuLeft">
          <el-button type="primary" icon="el-icon-plus" size="mini" @click="toAdd">新增</el-button>
        </template>
        <template slot-scope="scope" slot="menu" class="menuClass">
          <el-button type="text" @click="toView(scope.row)" size="mini">查看</el-button>
          <el-divider direction="vertical"></el-divider>
          <el-dropdown>
            <el-button type="text" size="mini" class="el-dropdown-link">更多</el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="toEdit(scope.row)">
                <el-button type="text" size="mini" icon="el-icon-edit">编辑</el-button>
              </el-dropdown-item>
              <el-dropdown-item @click.native="toDel(scope.row)">
                <el-button type="text" size="mini" icon="el-icon-delete" class="dangerBtn">删除</el-button>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
        <template slot="modifyBy" slot-scope="scope">
          <span v-if="scope.row.updateBy">{{scope.row.updateBy.realName || scope.row.updateBy.name}}</span>
          <span v-else>{{scope.row.createBy.realName || scope.row.createBy.name}}</span>
        </template>
        <template slot="modifyAt" slot-scope="scope">
          <span v-if="scope.row.updateAt">{{scope.row.updateAt | formatDate}}</span>
          <span v-else>{{scope.row.createAt | formatDate}}</span>
        </template>
      </avue-crud>
      <analysis-record-create-dialog  ref="analysisRecordCreateDialog"  :form.sync="form" @changeDialogForm="handleAddRecord"
        v-if="analysisRecordCreateDialogVisible"></analysis-record-create-dialog>
  </el-card>
</template>

<script>
import {option} from './const/option'
import analysisRecordCreateDialog from './components/analysis-record-create-dialog'
import { getList, del } from '@/api/three-analysis/three-analysis'
import moment from 'moment'
import { save } from '@/api/three-analysis/three-analysis'
  export default {
    name: "analysis-record",
    components: {
      analysisRecordCreateDialog
    },
    //分析主题类型, cond->单因素， cross->双因素
    props: {
      type: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        page: {
          pageSize: 10,
          currentPage: 1,
          total: 0,
          pageSizes: [10, 20, 50, 100]
        },
        option,
        search: {},
        data: [],
        loading: true,
        analysisRecordCreateDialogVisible: false,
        form:{
            task: {
                dynamic:[{

                }]
            }}
      };
    },
    filters: {
      formatDate(value) {
        return moment(value).format('YYYY-MM-DD HH:mm:ss');
      }
    },
    watch: {
      $route(to,from) {
        console.log(to);
        if(to.query.isEdit) {
          let title = '编辑分析';
          this.$route.meta.title = title;
          document.title = title;
        }

      }
    },
    created() {
      this.init();
    },
    methods: {
      init() {
        console.log('record, type:', this.type)
      },
      onLoad(page, params={}) {
        this.loading = true;
        params.type= this.type
        getList(this.page.currentPage, this.page.pageSize, params).then(res => {
          if(res.data.code === 0) {
            const data = res.data.data;
            this.page.total = data.total;
            this.data = data.list;
            // console.log(this.data)
            this.loading = false;
          }else {
            this.page.total = 0;
            this.data = [];
            this.loading = false;
            this.$message.error(res.data.msg);
          }
          // this.data.forEach(item => {
          //     item.sceneType = item.sceneType.toString()
          // })
        })
      },
      searchChange(params, done) {
        this.page.currentPage = 1
        this.onLoad(this.page, this.search);
        done();
      },
      refreshChange() {
        this.onLoad(this.page, this.search);
      },
      toView(row){
        this.$router.push({ name: 'analysisy-record-detail',
          query: {recordId :row.oid, isView: true, type: this.type === 'cross'? 'cross' : 'filter'} });
      },
      toEdit(row){
        this.$router.push({ name: 'analysisy-record-detail',
          query: {recordId :row.oid, isView: false, type: this.type === 'cross'? 'cross' : 'filter'} });
      },
      toDel(row) {
          this.$confirm('此操作将永久删除, 是否继续?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              cancelButtonClass: "btn-custom-cancel",
              type: 'warning'
          }).then(() => {
              del(row.oid).then(res=>{
                  console.log(res)
                  if(res.data.code==0){
                      this.$message.success('删除成功')
                      this.refreshChange()
                  }else{
                      this.$message.error(res.data.msg)
                  }
              })
          }).catch(() => {})
      },
      toAdd() {
        this.analysisRecordCreateDialogVisible = true;
        this.form = {
            name: '',
            formId: '',
            task: {
                dynamic:[{

                }]
            }
        }
        this.$nextTick(() => {
          this.$refs.analysisRecordCreateDialog.init();
        })
      },
      handleAddRecord(){
          // this.$router.push({ name: 'analysisy-record-create', query:{form : this.form} });
          let data = {
              'name': this.form.name,
              'formId': this.form.formId,
              'tasks': [],
              'type': this.type
          }
          // console.log('add record:', this.form.task.dynamic)
          this.form.task.dynamic.forEach(item => {
              data.tasks.push({
                  start: item.start,
                  end: item.end,
                  taskId: item.taskId,
                  taskName: item.name,
                  relDeptName: item.relDeptName,
                  relDeptNameId: item.relDeptId
              })
          })
          save(data).then(res=>{
              if (res.data.code === 0) {
                  console.log("id:", res.data.data)
                  let id = res.data.data
                 
                  this.$router.push({ name: 'analysisy-record-detail',
                    query: {recordId :id, isView: false, type: this.type === 'cross'? 'cross' : 'filter'} });
              }else{
                  this.$message.error(res.data.msg)
              }
          })
      }
    }
  }
</script>

<style lang="scss" scoped>
.flex-col {
  display: flex;
  flex-direction: column;
  z-index: 1000;
  .flex-item {
    .selectBtn{
      padding: 10px 50px;
    }
  }
}
</style>
