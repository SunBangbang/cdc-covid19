<template>
  <el-card class="aui-card--fill">
      <el-form :inline="true" :model="search" @keyup.enter.native="onLoad()" size="mini" >
          <el-form-item label="调查表">
              <avue-input-tree v-model="search.surveyFormId"
                               placeholder="请选择调查表"
                               :nodeClick="selectSurveyForm"
                               type="tree"
                               :dic="surveyFormOptions" >
              </avue-input-tree>
          </el-form-item>
          <el-form-item label="流调任务">
              <avue-select multiple v-model="search.taskId"
                               type="tree"
                               placeholder="请选择流调任务（可多选）"
                               :dic="taskOptions">
              </avue-select>
          </el-form-item>
          <el-form-item label="姓名">
              <el-input v-model="search.participant" placeholder="调查对象姓名" clearable></el-input>
          </el-form-item>
          <el-form-item label="证件号">
              <el-input v-model="search.pptIdentity" placeholder="调查对象证件号" clearable></el-input>
          </el-form-item>
          <!--<el-form-item label="密接地点">
              <el-input v-model="search.address" placeholder="密接地点" clearable></el-input>
          </el-form-item>-->
          <el-form-item label="开始时间">
              <avue-date v-model="search.startTime"
                         format="yyyy-MM-dd HH:mm"
                         type="datetime"
                         value-format="yyyy-MM-dd HH:mm:ss"
                         placeholder="密接开始时间">
              </avue-date>
          </el-form-item>
          <el-form-item label="结束时间">
              <avue-date v-model="search.endTime"
                         format="yyyy-MM-dd HH:mm"
                         type="datetime"
                         value-format="yyyy-MM-dd HH:mm:ss"
                         placeholder="密接结束时间">
              </avue-date>
          </el-form-item>
          <el-form-item>
              <el-button @click="searchChange()" class="el-button el-button--primary el-button--mini">
                  <i class="el-icon-search"></i>
                  查询
              </el-button>
              <el-button @click="clear()" class="el-button el-button--default el-button--mini">
                  <i class="el-icon-delete"></i>
                  重置
              </el-button>
          </el-form-item>
      </el-form>

    <avue-crud :data="data"
                :option="option"
                :page.sync="page"
                :table-loading="loading"
                @size-change="sizeChange"
                @search-change="searchChange"
                @refresh-change="refreshChange">
        <template slot-scope="scope" slot="menu" class="menuClass">
          <el-button type="text" @click="toView(scope.row)" size="mini">查看</el-button>
        </template>
      </avue-crud>

      <closeContactDialog ref="closeContactDialog" v-if="closeContactDialogVisible"></closeContactDialog>

  </el-card>
</template>

<script>
import {option} from './const/closeContactOption'
import CloseContactDialog from '../survey-form/components/close-contact-dialog'
import { pageKnown } from '@/api/survey-form/closeContact'
import analysisStat from '@/mixins/analysis-stat'

  export default {
    name: "close-contact-record",
    components: {
        CloseContactDialog
    },
    mixins: [analysisStat],
    data() {
      return {
        page: {
          pageSize: 10,
          currentPage: 1,
          total: 0,
          pageSizes: [10, 20, 50, 100]
        },
        option,
        search: {
            surveyFormId: '',
            taskId: [],
            participant: null,
            pptIdentity: null,
            address: '',
            startTime: null,
            endTime: null
        },
        data: [],
        loading: false,
        closeContactDialogVisible: false,
        shareSearch: true //条件查询参数是否传递给图谱查询, false->不传递， true->传递
      }
    },
    created() {
      this.init();
    },
    methods: {
      init() {
        this.getSurveyFormOptions()
      },
      onLoad(page,params={}) {
        this.loading = true;
        console.log('search:', this.search)
        Object.assign(params, this.search)
        params.taskIds = params.taskId.join(",")
        delete params.taskId

        pageKnown(this.page.currentPage, this.page.pageSize, params).then(res => {
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
        })
      },
      refreshChange() {
        this.onLoad(this.page);
      },
      toView(row){
          let query = {}
          if(this.shareSearch) {
              query = Object.assign(query, this.search)
          }
          query.participant = row.participant
          query.pptIdentity = row.identity
          this.closeContactDialogVisible = true
          this.$nextTick(() => {
              this.$refs.closeContactDialog.dialogVisible = true
              this.$refs.closeContactDialog.search = query
              this.$refs.closeContactDialog.init()
          })

        // this.$router.push({ name: 'analysisy-record-detail',query: {recordId :row.oid, isView: true} });
      },
      searchChange() {
        if(this.search.startTime && this.search.endTime){
          if(this.search.startTime > this.search.endTime){
            this.$message.warning('开始时间不能大于结束时间')
            return
          }
        }
         this.page.currentPage = 1
         this.onLoad(this.page)
      },
      sizeChange(val){
        this.page.currentPage = 1
        this.page.pageSize = val
        this.onLoad(this.page)
      },
      clear() {
        this.search = {
          surveyFormId: '',
          taskId: [],
          participant: null,
          pptIdentity: null,
          address: '',
          startTime: null,
          endTime: null
        }
        this.page.total = 0;
        this.data = [];
        this.loading = false;
      },
      selectSurveyForm(obj) {
          this.search.taskId = []
          // console.log('select form:', obj)
          this.getTaskOptions(obj.value)
      },
      selectTask(obj) {
         console.log('select task:', obj)
      },
    }
  }
</script>

<style lang="scss" scoped>

</style>
