<template>
    <div>
        <el-card shadow="never" class="aui-card--fill">
            <div slot="header" class="aui-card--header clearfix">
                <i class="el-icon-s-platform"></i>
                <span>样本列表</span>
            </div>
            <avue-crud :option="option" :data="data" :page.sync="page"
                       @on-load="onLoad"
                       @search-change="searchChange"
                       @size-change="sizeChange"
                       @current-change="currentChange"
                       @refresh-change="refreshChange">
                <template slot-scope="scope" slot="menu">
                    <el-button type="text" icon="el-icon-view" @click="preview(scope.row)" size="mini">查看</el-button>
                    <el-divider direction="vertical"></el-divider>
                    <el-button type="text" icon="el-icon-delete" @click="toDel(scope.row)" size="mini" class="dangerBtn">删除</el-button>
                </template>
            </avue-crud>
        </el-card>

    </div>
</template>

<script>
import {pageForTask} from "@/api/survey-form/sample"

  export default {

    data() {
      return {
        searchForm: {},
        page: {
          pageSize: 10,
          currentPage: 1,
          total: 0,
          pageSizes: [10, 20, 50, 100]
        },
        option: {
          border: true,
          index: true,
          indexLabel:'序号',
          menuPosition: "left",
          menuType: 'text',
          editBtn:false,
          addBtn: false,
          delBtn: false,
          viewBtn: false,
          searchBtnText: "查询",
          emptyBtnText: "重置",
          size: "mini",
          searchSize: "mini",
          searchMenuSpan: 10,
          stripe: true,
          headerAlign: 'left',
          align: 'left',
          tree: true,
          labelWidth: 110,
          column: [{
            width:80,
            label: '姓名',
            prop: 'participant',
          },{
            label: "性别",
            prop: "sex",
            width:60,
            formatter: (row,value) => {
              return value === 'M' || value === 'm'  ? '男' : (value === 'F' || value === 'f' ? '女' : '未知')
            }
          }, {
            label: '证件号',
            prop: 'identity',
            width: 160
          },
            {
              label: '最后提交时间',
              prop: 'updateAt',
              width: 160
            },
            {
              label: '来源',
              prop: 'source'
            },{
              label: '状态',
              prop: 'status',
              formatter: (row,value) => {
                return value === 0 ? '无效' : (value === 1? '有效' : '未知')
              }
            },
            {
              label: '提交状态',
              prop: 'submitStatus',
              formatter: (row,value) => {
                return value === 0 ? '草稿' : (value === 1? '已提交' : '未知')
              }
            },
            {
              label: '问卷时长',
              prop: 'answerTime'
            },
            {
              label: '视频',
              prop: 'videoNum'
            },
            {
              label: '音频',
              prop: 'audioNum'
            },
            {
              label: '调查员',
              prop: 'investigator'
            }]
        },
        data: [],
        loading: true,
        search: {},
        // taskId: '5f1a9e5f3f62be7ab6cc1fd3',
        taskId: '5f1e7bf48d00dd394ab5e549',
        surveyFormId: null
      }
    },
    activated() {
      // this.refreshChange()
    },
    methods: {
      onLoad (page, params = {}) {
        params.taskId = this.taskId
        pageForTask(page.currentPage, page.pageSize, Object.assign(params, this.query)).then(res => {
          console.log('load page list')
          const data = res.data.data[0].pageData
          this.surveyFormId = res.data.data[0].formId
          this.page.total = data.total
          this.data = data.list
          this.loading = false
        })
      },
      preview(row) {
        console.log(row)
        this.$router.push({path: '/survey-form-survey-sample', query:{surveyFormId: this.surveyFormId, sampleId: row.id }});
      },
      toAdd () {
        this.$router.push({name: 'dform-create', query:{formType: 0}});
      },
      toDel(row){
        this.$confirm('此操作将永久删除, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          cancelButtonClass: "btn-custom-cancel",
          type: 'warning'
        }).then(() => {
          del(row.oid).then(res=>{
            console.log(res)
            if(res.data.code==0){
              this.refreshChange()
            }else{
              this.$message.error(res.data.msg)
            }
          })
        }).catch(() => {})
      },
      sizeChange(val) {
        this.page.currentPage = 1;
        this.page.pageSize = val
        this.onLoad(this.page, this.search);
      },
      currentChange(val) {
        this.page.currentPage = val;
        this.onLoad(this.page, this.search);
      },
      refreshChange() {
        this.onLoad(this.page, this.search);
      },
      searchChange(params, done) {
          if(done) done();
          this.page.currentPage = 1
          console.log('search change:', params)
          this.onLoad(this.page, params);
      }
    },
    created() {
      const { id } = this.$route.query
      console.log(id)
    }
  }
</script>

<style scoped>

</style>
