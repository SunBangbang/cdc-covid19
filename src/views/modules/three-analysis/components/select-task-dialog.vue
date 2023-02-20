<template>
    <el-dialog  title="选择任务"
                :visible.sync="visible"
                @opened="handleOpenDialog"
                width="70%"
                append-to-body
                left>

         <el-form :inline="true" :model="search" label-suffix=":" size="mini" ref="searchForm">
          <el-form-item label="任务发布机构">
                            <avue-input-tree size="mini"
                                v-model="search.relDeptId"
                                placeholder="请选择任务发布机构"
                                type="tree"
                                :dic="deptTreeData"></avue-input-tree>
          </el-form-item>
          <el-form-item label="任务名称">
            <el-input v-model="search.name" placeholder="搜索任务名称" clearable ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="onSearch">查询</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-reset" @click.stop="handleResetSearchForm()">重置</el-button>
          </el-form-item>
        </el-form>
        <el-table ref="multipleTable"
                  v-loading="loading"
                  :data="data"
                  size="mini"
                  @selection-change="handleSelectionChange">
          <el-table-column
            type="selection"
            width="55">
          </el-table-column>
          <el-table-column
            label="任务发布机构"
            prop="relDeptName"></el-table-column>
          <el-table-column
            prop="name"
            label="任务名称"></el-table-column>
          <el-table-column
            prop="status"
            label="任务状态">
              <template slot-scope="scope">
                  <el-tag size="small" :type="getTypeOfStatus(scope.row.status)">
                      {{formatStatus(scope.row.status)}}
                  </el-tag>
              </template>
            </el-table-column>
          <el-table-column
            prop="start"
            label="任务开始时间"
            :formatter="formatDate">
          </el-table-column>
          <el-table-column
            prop="end"
            label="任务结束时间"
            :formatter="formatDate">
          </el-table-column>
        </el-table>
        <div class="pagination-container">
          <el-pagination
            background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            layout="total, sizes,prev, pager, next"
            :page-size="page.pageSize"
            :page-sizes="[10, 20]"
            :current-page.sync="page.currentPage"
            :total="page.total"
            @on-load="onLoad">
          </el-pagination>
        </div>
        <div class="dialog-footer text-right">
          <el-button type="primary" @click="close" size="mini">确 定</el-button>
          <el-button @click="cancel" size="mini">取 消</el-button>
        </div>
    </el-dialog>
</template>
<script>

import { getRelativeTaskListBySurveyForm } from '@/api/three-analysis/three-analysis'
import { getDeptTreeList } from '@/api/user/user'
import {getDictDataList} from '@/utils'

import moment from 'moment';
export default {
  name:'selectTaskDialog',
  props:{
    defaultSelection: {
      type: Array,
      default: ()=>[]
    }
  },
  data() {
    return {
      visible: true,
      page: {
        pageSize: 10,
        currentPage: 1,
        total: 0
      },
      search: {
        categoryId: '',
        relDeptId: '',
        name: ''
      },
      data: [],
      loading: true,
      categoryTreeData: [],
      deptTreeData: [],
      multipleSelection: [],
      formId: '',
      statusDict: getDictDataList('task-status'),
      typeStatus: {0: 'info', 1: 'dark', 2: 'danger', 3: 'success', 4: 'info', 6: 'success', 7: 'danger'}
    };
  },
  filters: {
    formatDate(value) {
      return moment(value).format('YYYY-MM-DD');
    }
  },
  // activated() {
  //   this.init();
  // },
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
    init() {
      this.search = {};
      this.visible = true;
      //  let params = {id: this.formId};
      let params = {'formId': this.formId};
      this.getTaskList(this.page,params);
      this.getDeptList();
      // console.log("defaultSelection:", this.defaultSelection);
    },
    onLoad(page, params) {
      this.loading = true;
      console.log('load:', this.search)
      this.getTaskList(page, params);
    },
    getTaskList(page, params) {
      getRelativeTaskListBySurveyForm(page.currentPage, page.pageSize, this.formId, params).then(res =>{
        if(res.data.code === 0){
          const data = res.data.data;
          this.data = data.list;
          console.log('get task list:', data.list);
          this.page.total = data.total;
          this.loading = false;
          this.handleOpenDialog()
        } else {
          this.data = [];
          this.page.total = 0;
          this.loading = false;
          console.log(res.data.msg);
        }

      });
    },
    handleResetSearchForm() {
      this.search= {};
      this.onSearch();
    },
    getDeptList () {
      getDeptTreeList().then(res => {
        if(res.data.code === 0) {
          this.deptTreeData = res.data.data;
        } else {
          this.$message.error(res.data.msg)
        }
      })
    },
    // 格式化时间
    formatDate(row, column, cellValue, index) {
      return cellValue? moment(cellValue).format('YYYY-MM-DD') : ''
    },
    onSearch(){
        console.log(this.search)
      this.onLoad(this.page, this.search);
    },
    handleSizeChange(val) {
      this.page.currentPage = 1;
      this.page.pageSize = val;
      this.onSearch();
    },
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.onSearch();
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    toggleSelection(rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.multipleTable.clearSelection();
      }
    },
    cancel() {
      this.visible = false;
    },
    close() {
       if(this.multipleSelection.length === 0) {
         this.$message.warning('请至少选择一个任务!')
         return
       }
       this.visible = false;
       let tasks = this.multipleSelection.map(item=> {return {
          start: item.start,
          end: item.end,
          taskId: item.oid,
          taskName: item.name,
          name: item.name,
          relDeptId: item.relDeptId,
          relDeptName: item.relDeptName,
          surveyForms: item.surveyForms,
          sampTotal: item.mySampleTotal
      }})
      this.$emit('callback',tasks);
    },
    handleOpenDialog() {
      console.log('opened task dialog, defaultSelection:', this.defaultSelection);
      const multipleSelection = JSON.parse(JSON.stringify(this.defaultSelection));
      const data = this.data;
      // console.log(multipleSelection);
      if(multipleSelection.length > 0) {
        multipleSelection.forEach(row =>{
          data.forEach(item =>{
            if(row && item.oid === row.taskId){
              console.log("data");
              if(item.$cellEdit !== undefined) delete item.$cellEdit;
              if(item.$index !== undefined) delete item.$index;
              // console.log(JSON.parse(JSON.stringify(item)));
              this.$nextTick(() => {
                this.$refs.multipleTable.toggleRowSelection(item,true);
              });
            }
          })
        })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.pagination-container {
  padding: 25px 0 20px 20px;
}
.dialog-footer {
  padding-top: 15px;
}
</style>
