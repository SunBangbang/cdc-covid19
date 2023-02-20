<template>
  <div>
    <el-row>
      <el-col>
        <div>
          <i class="el-icon-arrow-left back-button" @click ="goBack">返回</i>
        </div>
      </el-col>
    </el-row>

    <el-card shadow="never" class="aui-card--fill">
      <avue-crud
        :option="option"
        :data="data"
        :page.sync="page"
        :search.sync="search"
        :table-loading="loading"
        @on-load="onLoad"
        @search-change="searchChange"
        @size-change="sizeChange"
        @current-change="currentChange"
        @refresh-change="refreshChange"
      >
        <template slot="menuLeft">
          <div style="font-size: 0.10rem; font-weight: bold;">历史记录</div>
        </template>

        <!--自定义发布状态列slot-->
        <template slot-scope="scope" slot="release">
          <el-switch v-model="scope.row.release"
                     @change="handleStatusChange(scope.row.release,scope.row)">
          </el-switch>
        </template>

        <template slot-scope="scope" slot="menu" class="menuClass">
          <el-button type="text" @click="preview(scope.row)" size="mini">查看</el-button>
        </template>
      </avue-crud>

   </el-card>

  </div>
</template>

<script>
import { clone, release, del, deleteAttachment, deleteFtl, getPageList, getPageHistoryList, switchRelease, updateAttachment}
from "@/api/survey-form/questionnaire"
// import {getCategoryDictDataByName} from '@/api/questionnaire-category/questionnaire-category'
import AppConstant from "@/utils/AppConstant"
import Cookies from "js-cookie"

export default {
    components: {
    },
    props: {type: Number},
    data() {
      return {
        surveyFormId: null, //调查表ID
        uploadDialogVisible: false,
        ftlUploadDialogVisible: false,
        selectedFormId: null,
        selectedVersion: null,
        fileType: ['doc', 'docx'],
        zipFileType: ['zip'],
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
          size: "mini",
          stripe: true,
          headerAlign: 'center',
          align: 'center',
          tree: true,
          enter: true,
          labelWidth: 110,
          columnBtn: false,
          searchMenuSpan: 5,
          searchLabelWidth: AppConstant.MENU_WIDTH,
          menuWidth: AppConstant.MENU_WIDTH,
          column: [
          {
            label: '调查表名称',
            prop: 'name',
            search: false,
            searchSpan: 7,
            overHidden: true,
            searchPlaceholder: '搜索调查表',
            minWidth:160,
          },{
              label: '版本',
              prop: 'version',
              minWidth: 30,
            },
            {
              label: '是否发布',
              prop: 'released',
              minWidth: 50,
              formatter: (row,value) => {
                return value === 1 ? '是' : '否'
              }
            },
            {
              width: 220,
              label: '修改说明',
              prop: 'remark',
              overHidden: true,
            },
            {
              label: '表单文档',
              prop: 'uploadFileName',
              slot: true,
              overHidden: true,
              minWidth: 100
            },
           {
             label: '修改人',
             prop: 'realName',
             width: 120,
           },
            {
              label: '修改时间',
              prop: 'updateDate',
              type: "date",
              format: 'yyyy-MM-dd HH:mm',
              valueFormat: 'yyyy-MM-dd HH:mm:ss',
              minWidth: 80,
            }
            ]
        },
        data: [],
        loading: true,
        search: {},
        dictData: []
      }
    },
    activated() {
      // this.refreshChange()
    },
    methods: {
      goBack() {
        this.$router.go(-1);
      },
      onLoad (page, params = {}) {
        page = page || this.page
        params.oid = this.surveyFormId
        if(this.surveyFormId){
          getPageHistoryList(page.currentPage, page.pageSize, params).then(res => {
            if (res.data.code === 0) {
              const data = res.data.data
              this.page.total = data.total
              this.data = data.list
            }else{
              console.error("err:", res.msg)
            }
            this.loading = false
          })
        }
      },
      preview(row) {
        let viewType = 'new'
        this.$router.push(`/survey-form/view/questionnaire/${row.oid}?version=${row.version}&formType=${row.type}&viewType=${viewType}`)
      },
      sizeChange(val) {
        this.page.currentPage = 1;
        this.page.pageSize = val
        this.onLoad(this.page, this.search)
      },
      currentChange(val) {
        this.page.currentPage = val;
        this.onLoad(this.page, this.search)
      },
      refreshChange() {
        this.onLoad(this.page, this.search)
      },
      searchChange(params, done) {
        this.page.currentPage = 1
        this.onLoad(this.page, this.search);
        done();
      },
      changeCategory(val) {
      },
      handleStatusChange(value, row) {
        switchRelease(row.oid).then(res => {
          if (res.data.code === 0) {
            if (value) {
              this.$message.success('发布成功')
            } else {
              this.$message.success('取消发布成功')
            }
          } else {
            this.onLoad(this.page, this.search)
          }
        })
      },
      toDownloadFtl(row) {
        console.log('download ftl: ', row)
          let access_token = Cookies.get('access_token')
          let url = window.SITE_CONFIG['apiURL'].trim() + '/survey/form/downloadFtl'
              + '?' + `id=${row.oid}&ftlFile=${row.ftlFile}`
              + `&access_token=${access_token}`
          window.open(url)
          this.onLoad(this.page, this.search)
      },
      refreshDataList(obj){
            this.onLoad(this.page, this.search)
      }
    },
    created() {
      const { id } = this.$route.params
      this.surveyFormId = id
      console.log('history:', this.surveyFormId)
      //获取整个调查表分类列表数据
      /*getCategoryDictDataByName('公共表单').then(res => {
        if (res.data.code === 0) {
          this.dictData = res.data.data
        }else{
          this.$message.error(res.data.msg)
        }
      })*/
    }
  }
</script>

<style lang="scss" scoped>
  .back-button {
    padding: 10px;
    color: #00bfbf;
    cursor: pointer;
  }

</style>
