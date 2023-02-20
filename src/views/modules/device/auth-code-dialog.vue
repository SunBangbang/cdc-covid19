<template>
  <div>
    <el-dialog title="授权码管理"
               :visible.sync="dialogFormVisible"
               width="70%"
               destroy-on-close
               :inline="true">
      <avue-crud
        ref="crud"
        :data="data"
        :option="option"
        @search-change="search"
        :table-loading="loading"
        :page.sync="page"
        @on-load="onLoad"
        @refresh-change="refreshChange">

        <template slot="menuLeft" slot-scope="{size}">
          <el-button type="primary" :size="size" @click="handleClickGenerate">生成授权码</el-button>
          <el-button type="primary" icon="el-icon-download"  :size="size" @click="exportHandle">导出</el-button>
        </template>

        <template slot="status" slot-scope="scope">
          {{ scope.row.status | formatStatus }}
        </template>
      </avue-crud>

    </el-dialog>
  </div>
</template>

<script>
import {option} from "./const/authCodeDialogOption"
import {generate, getPageList} from "@/api/device/auth-code"
import qs from "qs";
import Cookies from "js-cookie";

export default {
  name: "auth-code-dialog",
  data() {
    return {
      dialogFormVisible: false,
      data: [],
      page: {
        pageSize: 10,
        currentPage: 1,
        total: 0,
        pageSizes: [10, 20, 50, 100]
      },
      searchData: {},
      loading: false,
      option: option(),
    }
  },
  filters: {
    formatStatus: function (value) {
      switch (value) {
        case "0":
          return "未使用";
        case "1":
          return "已使用";
      }
      return "";
    },
  },
  methods: {
    init() {
      this.dialogFormVisible = true;
    },
    search(from, done) {
      this.searchData = Object.assign({},from)
      this.onLoad(done)
    },
    onLoad(done) {
      this.loading = true;
      let params = {...this.searchData}
      getPageList(this.page.currentPage, this.page.pageSize, params).then(res => {
        if(res.data.code === 0){
          this.data = res.data.data.list;
          this.page.total = res.data.data.total;
          this.loading = false;
        }else{
          this.$message.error(res.data.msg);
          this.loading = false;
        }
        if (done && done.constructor !== Object) {
          done()
        }
      })
    },
    refreshChange() {
      this.onLoad();
    },
    handleClickGenerate(){
      generate().then(res => {
        if(res.data.code === 0){
          this.$message.success("生成授权码成功");
          this.onLoad();
        }else{
          this.$message.error(res.data.msg);
        }
      })
    },
    // 导出
    exportHandle() {
      var params = qs.stringify({
        'access_token': Cookies.get('access_token'),
        ...this.dataForm,
        order: this.order,
        orderField: this.orderField
      })
      window.location.href = `${window.SITE_CONFIG['apiURL']}/authCode/export?${params}`
    },
  }

}
</script>

<style scoped>

</style>
