<template>
  <el-card shadow="never" class="aui-card--fill">
    <!-- <div slot="header" class="aui-card--header clearfix">
      <i class="el-icon-s-platform"></i>
      <span>自定义模板</span>
    </div> -->
    <avue-crud
      :option="option"
      :data="data"
      :page.sync="page"
      :search.sync="search"
      @on-load="onLoad"
      @search-change="searchChange"
      @size-change="sizeChange"
      @current-change="currentChange"
      @refresh-change="refreshChange"
    >
      <template v-if="$hasPermission('preinstall-module:add')" slot="menuLeft">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="toAdd()"
          class="operation-item"
          >新增</el-button
        >
      </template>

      <!--自定义发布状态列slot-->
      <template slot-scope="scope" slot="release">
        <el-switch
          v-model="scope.row.release"
          @change="handleStatusChange(scope.row.release, scope.row)"
        >
        </el-switch>
      </template>

      <template slot-scope="scope" slot="menu" class="menuClass">
        <el-button
          type="text"
          v-if="$hasPermission('preinstall-module:info')"
          @click="preview(scope.row)"
          size="mini"
          >查看</el-button
        >
        <el-divider
          v-if="
            $hasPermission('preinstall-module:copy') ||
              $hasPermission('preinstall-module:edit') ||
              $hasPermission('preinstall-module:delete')
          "
          direction="vertical"
        ></el-divider>
        <el-dropdown>
          <el-button
            v-if="
              $hasPermission('preinstall-module:copy') ||
                $hasPermission('preinstall-module:edit') ||
                $hasPermission('preinstall-module:delete')
            "
            type="text"
            size="mini"
            class="el-dropdown-link"
            >更多</el-button
          >
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-if="$hasPermission('preinstall-module:edit')"
              @click.native="toEdit(scope.row)"
            >
              <el-button type="text" size="mini" icon="el-icon-edit"
                >编辑</el-button
              >
            </el-dropdown-item>
            <el-dropdown-item
              v-if="$hasPermission('preinstall-module:copy')"
              @click.native="toClone(scope.row)"
            >
              <el-button type="text" size="mini" icon="el-icon-copy-document"
                >复制</el-button
              >
            </el-dropdown-item>
            <el-dropdown-item
              v-if="$hasPermission('preinstall-module:delete')"
              @click.native="toDel(scope.row)"
            >
              <el-button
                type="text"
                size="mini"
                icon="el-icon-delete"
                class="dangerBtn"
                >删除</el-button
              >
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </avue-crud>
  </el-card>
</template>

<script>
import { getPageList, del, clone } from "@/api/survey-form/preInstallModule";
import AppConstant from "@/utils/AppConstant";
import { preinstallOptions } from "@/views/modules/survey-form/options";

export default {
  data() {
    return {
      page: {
        pageSize: 10,
        currentPage: 1,
        total: 0,
        pageSizes: [10, 20, 50, 100]
      },
      option: preinstallOptions(),
      data: [],
      loading: true,
      search: {},
      type: 1 //模板类型，0=自定义，1=预设模板
    };
  },
  activated() {
    // this.refreshChange()
  },
  methods: {
    onLoad(page, params = {}) {
      let query = { type: this.type };
      page = page || this.page;
      getPageList(
        page.currentPage,
        page.pageSize,
        Object.assign(params, query)
      ).then(res => {
        if (res.data.code == 0) {
          const data = res.data.data;
          this.page.total = data.total;
          this.data = data.list;
        } else {
          console.error("err:", this.res.data.msg);
        }

        this.loading = false;
      });
    },
    preview(row) {
      // this.$router.push({name: 'module-preview', query:{id: row.oid, type: 'template'}});
      this.$router.push(`survey-form/view/module/${row.id}`);
    },
    toEdit(row) {
      this.$router.replace({
        name: "module-edit",
        params: { id: row.id, type: "template", tempType: this.type }
      });
    },
    toAdd() {
      this.$router.replace({
        name: "module-create",
        params: { type: "template", tempType: this.type }
      });
    },
    toDel(row) {
      this.$confirm("确定将选择数据删除?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        cancelButtonClass: "btn-custom-cancel",
        type: "warning"
      })
        .then(() => {
          del(row.id).then(res => {
            if (res.data.code == 0) {
              this.$message.success("删除成功");
              this.onLoad(this.page, this.search);
            } else {
              console.error("err:", this.res.data.msg);
              this.$message.error("删除失败!");
            }
          });
        })
        .catch(() => {});
    },
    toClone(row) {
      this.$confirm(`此操作将复制表单${row.name}, 是否继续?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        cancelButtonClass: "btn-custom-cancel",
        type: "warning"
      })
        .then(() => {
          clone(row.id).then(res => {
            if (res.data.code === 0) {
              this.$message.success(`复制表单成功,新表单为${res.data.data}`);
              this.onLoad(this.page, this.search);
            } else {
              this.$message.error(res.data.msg);
            }
          });
        })
        .catch(() => {});
    },
    sizeChange(val) {
      this.page.currentPage = 1;
      this.page.pageSize = val;
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
      if (done) done();
      this.page.currentPage = 1;
      this.onLoad(this.page, params);
    },
    handleStatusChange(value, row) {
      switchRelease(row.oid).then(res => {
        if (res.data.code === 0) {
          if (value) {
            this.$message.success("发布成功");
          } else {
            this.$message.success("取消发布成功");
          }
        } else {
          this.onLoad(this.page, this.search);
        }
      });
    }
  }
};
</script>

<style scoped></style>
