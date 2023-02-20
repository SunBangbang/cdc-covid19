<template>
  <el-card class="aui-card--fill">
    <avue-crud
      ref="crud"
      :data="data"
      :option="option"
      @search-change="search"
      @search-reset="searchReset"
      :table-loading="loading"
      :page.sync="page"
      @on-load="onLoad"
      @refresh-change="refreshChange"
    >
      <template slot="deptNameSearch">
        <el-cascader
            size="mini"
            v-model="searchData.deptId"
            ref="cascader"
            placeholder="请选择 隶属组织"
            :show-all-levels="false"
            @visible-change="formatDeptId(searchData.deptId)"
            :props="defaultProps"
          >
        </el-cascader>
      </template>
      <template slot="includeSubSearch">
        <el-checkbox v-model="searchData.includeSub"></el-checkbox>
      </template>
      <template slot="menuLeft" slot-scope="{ size }">
        <el-button type="primary" :size="size" @click="handleClickGenerate"
          >生成授权码</el-button
        >
        <el-button
          type="primary"
          icon="el-icon-download"
          :size="size"
          @click="exportHandle"
          >导出</el-button
        >
      </template>

      <template slot="status" slot-scope="scope">
        {{ scope.row.status | formatStatus }}
      </template>
    </avue-crud>
  </el-card>
</template>

<script>
import { option } from "./const/authCodeDialogOption";
import { generate, getPageList } from "@/api/device/auth-code";
import { lazyDeptTree } from "@/api/sys/dept";
import { getRedisDeptList } from "@/api/subject-task/task-management";
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
      defaultProps: {
        label: "label",
        value: "id",
        children: "children",
        leaf: "leaf",
        lazy: true,
        lazyLoad: this.loadNode,
        checkStrictly: true,
        emitPath: false,
      },
    };
  },
  filters: {
    formatStatus: function(value) {
      switch (value) {
        case "0":
          return "未使用";
        case "1":
          return "已使用";
      }
      return "";
    }
  },
  methods: {
    init() {
      this.dialogFormVisible = true;
    },
    formatDeptId(value) {
      getRedisDeptList(value ? value : this.$store.state.user.deptId).then((res) => {
        // let that = this;
        // setTimeout(function () {
          // that.$refs["cascader"].inputValue = res.data.data;
        // }, 400);
      });
    },
    search(from, done) {
      this.searchData = Object.assign({deptId: this.searchData.deptId, includeSub: this.searchData.includeSub}, from);
      this.onLoad(done);
    },
    searchReset() {
      this.searchData.includeSub = false;
      this.searchData.deptId = null;
      this.$refs["cascader"].inputValue = '';
    },
    onLoad(done) {
      this.loading = true;
      let params = { ...this.searchData };
      getPageList(this.page.currentPage, this.page.pageSize, params).then(
        res => {
          if (res.data.code === 0) {
            this.data = res.data.data.list;
            this.page.total = res.data.data.total;
            this.loading = false;
          } else {
            this.$message.error(res.data.msg);
            this.loading = false;
          }
          if (done && done.constructor !== Object) {
            done();
          }
        }
      );
    },
    refreshChange() {
      this.onLoad();
    },
    handleClickGenerate() {
      generate().then(res => {
        if (res.data.code === 0) {
          this.$message.success("生成授权码成功");
          this.onLoad();
        } else {
          this.$message.error(res.data.msg);
        }
      });
    },
    // 导出
    exportHandle() {
      let params = qs.stringify({
        access_token: Cookies.get("access_token"),
        ...this.searchData,
        // order: this.order,
        // orderField: this.orderField
      });
      window.location.href = `${window.SITE_CONFIG["apiURL"]}/authCode/export?${params}`;
    },
    loadNode(node, resolve) {
      let deptList = [];
      if (node.level === 0) {
        lazyDeptTree({ pid: this.$store.state.user.deptId })
          .then((res) => {
            deptList = res.data.data;
            if (deptList.children && deptList.children.length > 0) {
              return;
            }
            // return deptList.children && deptList.children.length > 0 ? resolve(deptList.children) : resolve([])
            return resolve(deptList);
          })
          .catch(() => {});
      }
      if (node.level === 1) {
        return resolve([]);
        // let subDeptList = [];
        // console.log(node);
        // lazyDeptTree({ pid: node.data.id })
        //   .then(res => {
        //     subDeptList = res.data.data[0];
        //     return resolve([]);
        //   })
        //   .catch(() => {});
        // return resolve(node.data.children)
      }
      if (node.level >= 2) {
        let subDeptList = [];
        console.log(node);
        lazyDeptTree({ pid: node.data.id })
          .then((res) => {
            subDeptList = res.data.data[0];
            return subDeptList.children && subDeptList.children.length > 0
              ? resolve(subDeptList.children)
              : resolve([]);
          })
          .catch(() => {});
      }
    },
  }
};
</script>

<style scoped></style>