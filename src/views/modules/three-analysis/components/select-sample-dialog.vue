<template>
    <el-dialog  title="选择问卷样本"
                :visible.sync="visible"
                @opened="handleOpenDialog"
                width="70%"
                append-to-body
                left>
         <el-form :inline="true" :model="search" label-suffix=":" size="mini" ref="searchForm">
          <el-form-item>
            <avue-select
              size="mini"
              v-model="search.src"
              placeholder="全部样本来源"
              :dic="dicDataSource"
              :props="props"
            >
            </avue-select>
          </el-form-item>
          <el-form-item>
             <el-input v-model="search.investigator" placeholder="搜索调查员" clearable></el-input>
          </el-form-item>
          <el-form-item>
            <el-input v-model="search.participant" placeholder="搜索参与者姓名" clearable ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="onSearch">查询</el-button>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-delete" @click.stop="handleResetSearchForm()">重置</el-button>
          </el-form-item>
        </el-form>

        <span class="avue-crud__tip el-tag el-tag--default el-tag--light">
            <span class="avue-crud__tip-name">
              当前表格已选择
                <span class="avue-crud__tip-count">{{selectedNum}}</span>
                项
            </span>
            <button type="button" class="el-button el-button--text el-button--small" @click="toggleSelection()">
                <span>清 空</span>
            </button>
        </span>

        <el-table ref="multipleTable"
                  v-loading="loading"
                  :data="data"
                  size="mini"
                  border
                  @selection-change="handleSelectionChange">
          <el-table-column
            type="selection"
            align="center">
          </el-table-column>
          <el-table-column
            prop="participant"
            label="参与者"
            align="center"></el-table-column>
          <el-table-column
            prop="sex"
            label="性别"
            align="center"></el-table-column>
          <el-table-column
            prop="createAt"
            label="创建时间"
            align="center"
            :formatter="formatDate">
<!--              <template slot-scope="scope">-->
<!--                 <el-tag size="small"-->
<!--                  :type="scope.row.status === 'WORKING' ? 'success' : scope.row.status === 'STOP' ? 'info' : '' ">{{scope.row.status | formatStatus}}</el-tag>-->
<!--              </template>-->
            </el-table-column>
          <el-table-column
            prop="source"
            label="来源"
            align="center">
              <template slot-scope="scope">
                  {{formatSource(scope.row.source)}}
              </template>
          </el-table-column>
          <el-table-column
            prop="submitStatus"
            label="状态"
            align="center">
              <template slot-scope="scope">
                  <el-tag
                    size="mini"
                    :type="scope.row.submitStatus === '已提交' ? 'success' : scope.row.submitStatus != '已提交' ? 'info' : '' ">
                    {{scope.row.submitStatus}}</el-tag>
              </template>
          </el-table-column>
<!--          <el-table-column-->
<!--            prop="answerTime"-->
<!--            label="问卷时长"></el-table-column>-->
<!--          <el-table-column-->
<!--            prop="videoNum"-->
<!--            label="视频数量"></el-table-column>-->
<!--          <el-table-column-->
<!--            prop="videoNum"-->
<!--            label="录像总时长"></el-table-column>-->
          <el-table-column
            prop="investigator"
            label="调查员"
            align="center"></el-table-column>
        </el-table>
        <div class="pagination-container text-right table-panination-sp">
          <el-pagination
            background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            layout="total, sizes,prev, pager, next"
            :page-size="page.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :current-page.sync="page.currentPage"
            :total="page.total"
            @on-load="onLoad"
            class="padination-mt">
          </el-pagination>
        </div>
        <div class="dialog-footer text-right dialog-footer-sp">
          <el-button type="primary" @click="close()" size="mini">确 定</el-button>
          <el-button @click="cancel()" size="mini">取 消</el-button>
        </div>
    </el-dialog>
</template>
<script>
import { pageValidForTask as pageForTask } from "@/api/survey-form/sample";
import {getDictDataList} from '@/utils'
import moment from 'moment';
import AppConstant from "@/utils/AppConstant";
export default {
  name: 'selectSampleDialog',
  props:{
    defaultSelection: {
      type: Array,
      default: () => []
    },
    filter: {}
  },
  data() {
    return {
        props:{
            label: 'dictLabel',
            value: 'dictValue'
        },
       visible: true,
       searchForm: {},
       page: {
          pageSize: 10,
          currentPage: 1,
          total: 0
       },
        data: [],
        loading: true,
        search: {},
        dicDataSource: getDictDataList('sample-channel'),
        dicDataInvestigator: [],
        surveyFormId: '',
        taskIds: [],
        analysisId: '',
        selectedNum: 0,
        multipleSelections: [],
        otherPageSelectedIds: []
    }
  },
  methods: {
    init() {
        this.visible = true;
        if (this.filter != null){
            this.search = this.filter
            this.onLoad(this.filter)
        }else {
            this.onLoad(this.search)
        }
    },
    onLoad (val) {
        let params = {};
        params.taskIds = this.taskIds.length > 0 ? this.taskIds.join(",") : ''
        params.surveyFormId = this.surveyFormId
        params.analysisId = this.analysisId? this.analysisId : null
        Object.assign(params, val)
        params.submitStatus = AppConstant.SURVEY_SAMPLE_SUBMIT_STATUS_SUBMITTED
        params.status = AppConstant.SURVEY_SAMPLE_STATUS_EFFECTIVE
        this.getSampleList(this.page, params);
    },
    getSampleList(page, params = {}) {
        console.log(params)
        if(params.selectedIds && params.selectedIds.length > 0){
            this.selectedNum = params.selectedIds.length
            this.search.selectedIds = params.selectedIds
        }
        // delete params.selectedIds
        Object.assign(params, this.query)
        let keys = Object.keys(params).filter(key=>{return key!== 'selectedIds'})
        let newParams = []
        keys.forEach(key=>{
            newParams[key] = params[key]
        })

        pageForTask(page.currentPage, page.pageSize, newParams).then(res => {
            console.log('load page list')
            console.log(res.data)
            if(res.data.code === 0){
                const data = res.data.data
                this.page.total = data.total
                this.data = data.list

                let rowIds = this.data.map(item=> {return item.id})

                //计算其他页面选中的rowId
                if(this.search.selectedIds && this.search.selectedIds.length > 0){
                    this.otherPageSelectedIds = this.search.selectedIds.filter(item=> {return !rowIds.includes(item)})

                    this.$nextTick(()=>{
                        let rows = this.data.filter(item=> {
                            return this.search.selectedIds.includes(item.id)
                        })
                        this.toggleSelection(rows)
                    })
                }
            }else{
                this.data = [];
                this.page.total = 0;
            }
            this.loading = false;
        });
    },
     formatSource(val) {
         let label = val
         if(this.dicDataSource) {
             this.dicDataSource.some(item=>{
                 if(item.dictValue == val) {
                     label = item.dictLabel
                     return true
                 }
             })
         }
         return label
     },
      //格式化删除状态
    formatStatus(value) {
      let result = '草稿';
      if(parseInt(value) === 1) {
        result = '已提交';
      }
      return result;
    },
    // 格式化时间
    formatDate(value) {
      // console.log(value)
      return moment(value.updateAt).format('YYYY-MM-DD HH:mm');
    },
    handleResetSearchForm() {
      this.search= {};
      // this.onSearch();
    },
    onSearch(){
        console.log('search:', this.search)
        this.$emit('clearSelected')
        this.analysisId = null
        this.onLoad(this.search)
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
    handleSelectionChange(list) {
        this.multipleSelections = list;
        this.selectedNum = list.length  + this.otherPageSelectedIds.length
    },
    toggleSelection(rows) {
      // console.log("rows", rows);
      if (rows) {
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row);
        });
      } else {
          this.$refs.multipleTable.clearSelection()
          this.search.selectedIds = []
          this.otherPageSelectedIds = []
          this.selectedNum = 0
      }
        this.$emit('clearSelected')
        this.analysisId = null
    },
    cancel() {
        this.visible = false
    },
    close() {
        this.visible = false
        this.multipleSelections.forEach(row=>this.otherPageSelectedIds.push(row.id))
        this.search.selectedIds = this.otherPageSelectedIds
        this.$emit('callback', this.search)
        let arr = [{
            sampleNum: this.search.selectedIds?
                (this.search.selectedIds.length>0? this.search.selectedIds.length : this.page.total)
                :this.page.total
        }]
        this.$emit('callbackSample', arr)
    },
    handleOpenDialog() {
      console.log("opened");
      console.log(this.defaultSelection);
      const multipleSelection = JSON.parse(JSON.stringify(this.defaultSelection));
      const data = this.data;
      if(multipleSelection.length > 0) {
        multipleSelection.forEach(row =>{
          data.forEach(item =>{
            if(item.oid === row.oid){
              console.log("data");
              console.log(item);
              this.$refs.multipleTable.toggleRowSelection(item,true);
            }
          })
        })
      }
    }
  }
}
</script>
<style lang="scss" scoped>

</style>
