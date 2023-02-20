<template>
  <el-card class="aui-card--fill">
    <avue-crud
      :data="data"
      :option="option"
      :page.sync="page"
      :search.sync="search"
      :table-loading="loading"
      @on-load="onLoad"
      @search-change="searchChange"
      @search-reset="searchReset"
      @size-change="sizeChange"
      @current-change="currentChange"
      @refresh-change="refreshChange"
    >
      <template slot="menu" slot-scope="scope">
        <el-button type="text" size="mini">上传报告</el-button>
        <el-button type="text" icon="el-icon-edit" size="mini">上报</el-button>
        <el-button type="text" size="mini">查看</el-button>
      </template>
    </avue-crud>
  </el-card>
</template>

<script>
import { reportOption } from "@/views/modules/subject-task/option/report"
import { getDictDataList } from "@/utils"
import moment from "moment"
import { getMyTaskList } from "@/api/subject-task/task-management"

export default {
  name: "report",
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
      option: reportOption,
      loading: true,

    };
  },
  filters: {
    formatDate(value) {
      return moment(value).format('YYYY-MM-DD HH:mm');
    }
  },
  methods: {
    onLoad(page, params = {}) {
      this.loading = false;
      // params.isMyDept = this.isMyDept
      // getMyTaskList(page.currentPage, page.pageSize, Object.assign(params, this.search)).then(res => {
      //   const data = res.data.data;
      //   this.data = data.list;
      //   this.page.total = data.total;
      //   this.loading = false;
      // });
    },
    searchChange(params, done) {
      this.search = params
      this.page = {
        pageSize: 10,
        currentPage: 1,
        total: 0
      }
      this.onLoad(this.page, params);
      done();
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
      this.onLoad(this.page, this.search);
    },


  }
}
</script>

<style scoped>
</style>
