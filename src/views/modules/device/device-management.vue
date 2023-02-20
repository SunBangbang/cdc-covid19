<template>

  <el-card class="aui-card--fill">

    <avue-crud
      ref="crud"
      :data="data"
      :option="option"
      :search.sync="search"
      :table-loading="loading"
      :page.sync="page"
      @on-load="onLoad"
      @row-save="rowSave"
      @row-update="rowUpdate"
      @refresh-change="refreshChange"
      @search-change="searchChange"
      @row-del="rowDel"
      @search-reset="searchReset"
      @selection-change="selectionChange"
    >

      <template slot="menuLeft" slot-scope="{ size }">

        <el-button type="primary" :size="size" @click="handleClickAuthCode">
          授权码
        </el-button>

        <el-button type="primary" size="mini" @click="handleActive">
           激活选中设备
        </el-button>

      </template>

      <template slot="menuRight" slot-scope="scope">

        <el-button
          icon="el-icon-download"
          type="primary"
          size="mini"
          @click="handleGet"
        >
          下载模版
        </el-button>

        <el-button
          icon="el-icon-upload"
          type="primary"
          size="mini"
          @click="box = true"
        >
          导入Excel
        </el-button>

        <el-button
          icon="el-icon-download"
          type="primary"
          size="mini"
          @click="exportExcel"
        >
          导出
        </el-button>

      </template>

      <template slot-scope="scope" slot="menu">

        <el-divider direction="vertical"></el-divider>

        <el-button
          type="text"
          @click="toDel(scope.row)"
          size="mini"
          class="dangerBtn"
        >
          删除
        </el-button>

      </template>

    </avue-crud>

    <el-dialog
      title="Excel导入"
      :visible.sync="box"
      class="avue-dialog"
      v-dialogdrag
      width="40%"
    >

      <label style="color:red;">*</label>
      请选择所属分组：
      <avue-input-tree
        default-expand-all
        v-model="group.id"
        placeholder="请选择所属分组"
        type="tree"
        :props="props"
        :dic="dic"
      ></avue-input-tree>

      <el-upload
        class="upload-demo"
        ref="upload"
        accept=".xls,.xlsx,.XLS,.XLSX"
        :action="url"
        :file-list="fileList"
        :data="group"
        :auto-upload="true"
        :http-request="handleChange"
      >

        <br />

        <label style="color:red;">*</label>
        请上传所需文件：
        <el-button size="small" type="primary">导入excel</el-button>

        <br />

        <br />

        <template>

          <div v-if="message === '分组必填'" style="color:red;">
            请选择所属分组！
          </div>

          <div v-else-if="message === '成功'" style="color: #13CE66;">
            导入成功！
          </div>

          <div v-else-if="message !== ''" style="color: #ff0000;">
            导入失败: {{message}}！
          </div>

          <div v-else></div>

        </template>

      </el-upload>

      <span slot="footer" class="dialog-footer">

        <el-button type="primary" @click="loadAll">关 闭</el-button>

      </span>

    </el-dialog>

    <auth-code-dialog ref="dialog" v-if="authCodeDialogVisible">

    </auth-code-dialog>

  </el-card>

</template>

<script>
import {
  getPageList,
  remove,
  saveOrUpdate,
  getDeptTreeList,
  uploadFile,
  getList
} from "@/api/device/device";
import Cookies from "js-cookie";
import { deviceOpt } from "./const/deviceOption";
import { getDictDataList } from "@/utils";
import { batchActive } from "@/api/device/device";
import authCodeDialog from "./auth-code-dialog";

export default {
  components: {
    authCodeDialog
  },
  data() {
    return {
      url: window.SITE_CONFIG["apiURL"] + "/device/upload",
      message: "",
      group: { id: null },
      dic: [],
      props: {
        label: "name",
        value: "id"
      },
      box: false,
      loading: false,
      data: [],
      fileList: [],
      search: { orderField: "id", order: "desc" },
      page: {
        pageSize: 10,
        currentPage: 1,
        total: 0,
        pageSizes: [10, 20, 50, 100]
      },
      option: deviceOpt().option,
      columns: deviceOpt().columns,
      deviceStatusMap: {},
      activeStatusMap: {},
      groupIdMap: {},
      selectedIds: "",
      authCodeDialogVisible: false
    };
  },
  created() {
    let deviceStatusDic = getDictDataList("device_status");
    deviceStatusDic.forEach(item => {
      this.deviceStatusMap[item.dictValue] = item.dictLabel;
    });

    let activeStatusDic = getDictDataList("active_status");
    activeStatusDic.forEach(item => {
      this.activeStatusMap[item.dictValue] = item.dictLabel;
    });

    getDeptTreeList().then(res => {
      let groupId = this.findObject(this.option.column, "groupId");
      groupId.dicData = res.data.data;
      this.dic = res.data.data;
      this.getGroupIdMap(this.dic);
    });
  },
  methods: {
    onLoad(
      page = { currentPage: 1, pageSize: 10 },
      params = { orderField: "id", order: "desc" }
    ) {
      getPageList(
        page.currentPage,
        page.pageSize,
        Object.assign(this.search, params)
      ).then(res => {
        this.data = res.data.data.list;
        this.page.total = res.data.data.total;
      });
      this.loading = false;
    },
    getGroupIdMap(arr) {
      arr.forEach(item => {
        this.groupIdMap[item.id] = item.name;
        if (item.children && item.children.length > 0) {
          this.getGroupIdMap(item.children);
        }
      });
    },
    loadAll() {
      this.box = false;
      this.group = { id: null };
      this.fileList = [];
      this.message = "";
      this.onLoad();
    },
    rowDel(row) {
      this.$confirm("确定将选择数据删除?", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        cancelButtonClass: "btn-custom-cancel",
        type: "warning"
      })
        .then(() => {
          remove(row.id).then(res => {
            if (res.data.code === 0) {
              this.onLoad(this.page);
              this.$message.success("操作成功");
            } else {
              console.error("error:", res.data.msg);
              this.$message.error(res.data.msg);
            }
          });
        })
        .catch(() => {});
    },
    rowSave(form, done) {
      saveOrUpdate(form).then(res => {
        if (res.data.code === 0) {
          this.onLoad(this.page);
          this.$message.success("操作成功");
        } else {
          console.error("error:", res.data.msg);
          this.$message.error(res.data.msg);
        }
      });
      done();
    },
    rowUpdate(form, index, done, loading) {
      saveOrUpdate(form).then(res => {
        if (res.data.code === 0) {
          this.onLoad(this.page);
          this.$message.success("操作成功");
        } else {
          console.error("error:", res.data.msg);
          this.$message.error(res.data.msg);
        }
      });
      done();
    },
    searchChange(params, done) {
      this.search = params;
      this.page.currentPage = 1;
      this.onLoad(this.page);
      done();
    },
    searchReset() {
      this.search = {};
      // this.onLoad()
    },
    refreshChange() {
      this.onLoad(this.page);
    },
    handleGet() {
      window.open(
        window.SITE_CONFIG["apiURL"] +
          "/device/downloadTemplate?access_token=" +
          Cookies.get("access_token")
      );
    },
    handleChange(param) {
      // console.log('change upload:', param, ' ', this.group)
      let group = param.data;
      let file = param.file;
      if (!file.name.endsWith("xlsx") && !file.name.endsWith("xls")) {
        this.message = "只支持excel文件类型!";
        return;
      }

      if (!group.id) {
        this.message = "分组必填";
      } else {
        uploadFile(group.id, file).then(res => {
          if (res.data.code === 0) {
            this.message = "成功";
          } else {
            this.message = res.data.msg;
          }
        });
      }
      this.fileList = [];
    },
    async handleExcel(params, list, callback) {
      try {
        let res = await callback(params.page, params.limit, this.search);
        if (res.data.code === 0) {
          let dataList = res.data.data.list;
          let length = dataList.length;
          dataList.forEach(item => {
            item.deviceStatus = this.deviceStatusMap[item.deviceStatus]
              ? this.deviceStatusMap[item.deviceStatus]
              : item.deviceStatus;
            item.activeStatus = this.activeStatusMap[item.activeStatus]
              ? this.activeStatusMap[item.activeStatus]
              : item.activeStatus;
            item.groupId = this.groupIdMap[item.groupId]
              ? this.groupIdMap[item.groupId]
              : item.groupId;
            //置空
            Object.keys(item).forEach(k => {
              if (this.validatenull(item[k])) {
                item[k] = "";
              }
            });
          });

          list = list.concat(dataList);
          // console.log('export ', list, this.option.title)
          if (length < params.limit || length === 0) {
            //结束读取
            this.$Export.excel({
              title: "设备",
              columns: this.option.column,
              data: list
            });
          } else {
            //下一页
            params.page = params.page + 1;
            await this.handleExcel(params, list, callback);
          }
        } else {
          console.log("failed to get data:", res.data.msg);
          this.$message.error(res.data.msg);
        }
      } catch (err) {
        console.error(err);
      }
    },
    exportExcel() {
      let params = { page: 1, limit: 100 };
      let list = [];
      this.handleExcel(params, list, getPageList);
    },
    toDel(row) {
      this.$refs.crud.rowDel(row, row.$index);
    },
    handleActive() {
      if (this.selectedIds.length === 0) {
        this.$message.info("没有需要激活的设备");
      } else {
        this.$confirm("确定将选择数据激活?", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          cancelButtonClass: "btn-custom-cancel",
          type: "warning"
        })
          .then(() => {
            batchActive(this.selectedIds).then(res => {
              if (res.data.code === 0) {
                this.$message.success("激活成功");
                this.onLoad(this.page);
                // 清空多选
                this.$refs.crud.toggleSelection();
              } else {
                this.$message.error(res.data.msg);
              }
            });
          })
          .catch(() => {});
      }
    },
    // 改变多选
    selectionChange(list) {
      let result = [];
      list.forEach(item => {
        result.push(item.id);
      });
      this.selectedIds = result.join(",");
    },
    handleClickAuthCode() {
      this.authCodeDialogVisible = true;
      this.$nextTick(() => {
        this.$refs.dialog.init();
      });
    }
  }
};
</script>

<style scoped>
:deep(.el-icon-edit) {
  display: none;
}
</style>

