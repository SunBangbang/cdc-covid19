<template>
  <div>
    <avue-crud :data="data"
               :option="option"
               :page.sync="page"
               :search.sync="search"
               :table-loading="loading"
               @on-load="onLoad"
               @search-change="searchChange"
               @search-reset="searchReset"
               @size-change="sizeChange"
               @current-change="currentChange"
               @refresh-change="refreshChange">
      <template slot-scope="scope" slot="menu">
        <el-button type="text" @click="toSample(scope.row)" size="mini">调查记录</el-button>
        <el-divider direction="vertical"></el-divider>
        <el-dropdown>
          <el-button type="text" size="mini" class="el-dropdown-link">更多</el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="toQuestionnaire(scope.row)">
              <el-button type="text" icon="el-icon-edit" size="mini">填写</el-button>
            </el-dropdown-item>
            <el-dropdown-item @click.native="toExport(scope.row)" v-if="scope.row.groupLeader==$store.state.user.id">
              <el-button type="text" icon="el-icon-download" size="mini">导出</el-button>
            </el-dropdown-item>
            </el-dropdown-menu>
        </el-dropdown>
      </template>
      <template slot="surveyCount" slot-scope="scope">
        {{scope.row.surveyForms ? scope.row.surveyForms.length : '0'}}
      </template>
      <template slot="createBy" slot-scope="scope">
        <span v-if="scope.row.createBy">{{scope.row.createBy.realName || scope.row.createBy.name}}</span>
        <span v-else></span>
      </template>
      <template slot="createAt" slot-scope="scope">
        <span v-if="scope.row.createAt">{{scope.row.createAt | formatDate}}</span>
        <span v-else></span>
      </template>
      <template slot="actualSample" slot-scope="scope">
        <el-tag size="small" :type="scope.row.actualSample>0? 'dark' : 'info'"> {{scope.row.actualSample}} </el-tag>
      </template>

      <template slot="status" slot-scope="scope">
        <el-tag size="small" :type="getTypeOfStatus(scope.row.status)">
          {{formatStatus(scope.row.status)}}
        </el-tag>
      </template>
    </avue-crud>
    <form-select-dialog ref="formSelectDialog" v-if="formSelectDialogVisible"></form-select-dialog>
  </div>
</template>

<script>
import FormSelectDialog from "@/views/modules/survey-form/components/form-select-dialog"
import option from "@/views/modules/subject-task/option/myTaskManagementOption"
import {getDictDataList} from "@/utils"
import moment from "moment"
import {getMyTaskList} from "@/api/subject-task/task-management"
import Cookies from 'js-cookie'
import AppConstant from "@/utils/AppConstant"

export default {
  name: "my-task",
  props: ['isMyDept'],
  components: {
    FormSelectDialog
  },
  data() {
    return {
      page: {
        pageSize: 10,
        currentPage: 1,
        total: 0,
        pageSizes: [10, 20, 50, 100]
      },
      search: {
        status: ''
      },
      data: [],
      option: option(),
      loading: true,
      formSelectDialogVisible: false,
      statusDict: getDictDataList('task-status'),
      typeStatus: {0: 'info', 1: 'dark', 2: 'danger', 3: 'success', 4: 'info', 6: 'success', 7: 'danger'},
    };
  },
  filters: {
    formatDate(value) {
      return moment(value).format('YYYY-MM-DD HH:mm');
    }
  },
  methods: {
    onLoad(page, params={}) {
      this.loading = true;
      params.isMyDept = this.isMyDept
      getMyTaskList(page.currentPage, page.pageSize, Object.assign(params, this.search)).then(res =>{
        const data = res.data.data;
        this.data = data.list;
        this.page.total = data.total;
        this.loading = false;
      });
    },
    searchChange(params,done) {
      this.search = params
      this.page = {
        pageSize: 10,
        currentPage: 1,
        total: 0
      }
      this.onLoad(this.page, params);
      done();
    },
    toSample(row){
      console.log(row, this.$store.state.user);
      this.$router.push({
        name:'survey-sample',
        params: {
          taskId: row.oid,
          type: this.isMyDept ? 'my' : 'other',
        }
      });
    },
    // 填写表单
    toQuestionnaire(row) {
      this.formSelectDialogVisible = true
      this.$nextTick(() => {
        this.$refs['formSelectDialog'].type = this.isMyDept ? 'my' : 'other'
        this.$refs['formSelectDialog'].init(row.oid)
      })
    },
    searchReset() {
      this.search = {}
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
      // console.log("refresh");
      this.onLoad(this.page, this.search);
    },
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
    // 导出任务样本
    toExport(row) {
      let access_token = Cookies.get('access_token')//验证信息
      let json = {taskId: row.oid}
      json.status = AppConstant.SURVEY_SAMPLE_STATUS_EFFECTIVE
      let params = Object.keys(json).map(function (key) {
        return encodeURIComponent(key) + "=" + encodeURIComponent(json[key]);
      }).join("&");
      let downloadUri = window.SITE_CONFIG['apiURL'] + '/survey/sample/exportTaskSample' + '?' + params + `&access_token=${access_token}`
      window.open(downloadUri)
    },
  }
}
</script>

<style scoped>

</style>
