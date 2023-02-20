<template>
  <el-card class="aui-card--fill">
    <el-form :inline="true" size="mini">
      <el-form-item>
        <el-button icon="el-icon-plus" type="primary" @click="addHandle()">{{
          $t("add")
        }}</el-button>
      </el-form-item>
    </el-form>
    <avue-crud
      ref="crud"
      :data="data"
      :option="option"
      :table-loading="loading"
      :page.sync="page"
      :upload-before="uploadBefore"
      :upload-after="uploadAfter"
      :upload-error="uploadError"
      @on-load="onLoad"
      @row-save="rowSave"
      @row-update="rowUpdate"
      @row-del="rowDel"
      @refresh-change="refreshChange"
      class="hide-search-label-container"
    >
      <template slot-scope="scope" slot="menu">
        <template v-if="scope.row.status !== DIST_REMOVED && !!scope.row.link">
          <el-button
            type="text"
            icon="el-icon-brush"
            @click="handleLink(scope.row.link)"
            size="mini"
            >下载链接</el-button
          >
          <el-button
            type="text"
            icon="el-icon-edit"
            @click="handleEdit(scope.row)"
            size="mini"
            >编辑</el-button
          >
        </template>
        <el-button
          type="text"
          v-if="scope.row.status === DIST_UNPUBLISHED"
          icon="el-icon-sell"
          @click.stop="handlePublish(scope.row)"
          size="mini"
          class="dangerBtn"
          >发布</el-button
        >
        <el-button
          type="text"
          v-if="scope.row.status === DIST_PUBLISHED"
          icon="el-icon-sold-out"
          @click.stop="handleSold(scope.row)"
          size="mini"
          class="dangerBtn"
          >下架</el-button
        >
      </template>

      <template slot="status" slot-scope="scope">
        <el-tag size="small" :type="getType(scope.row.status)">
          {{ scope.row.status | formatStatus }}
        </el-tag>
      </template>
    </avue-crud>
    <el-dialog
      :visible.sync="addVisible"
      title="新 增"
      :close-on-click-modal="true"
      :close-on-press-escape="true"
    >
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-position="right"
        label-width="100px"
        size="mini"
      >
        <el-form-item label="名称:" prop="name">
          <el-input
            v-model="form.name"
            clearable
            placeholder="请输入名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="离线包上传:" prop="link">
          <el-upload
            :action="url"
            :headers="headers"
            :data="{ type: 'other' }"
            :file-list="fileList"
            :list-type="listType"
            :limit="1"
            :before-upload="beforeUploadHandle"
            :on-success="successHandle"
            :on-error="errorHandle"
          >
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">
              支持文件格式：zip,rar
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item label="版本:" prop="version"
          ><el-input
            v-model="form.version"
            clearable
            placeholder="请输入版本"
          ></el-input
        ></el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="mini" @click="savePackage"
          >保存</el-button
        >
        <el-button size="mini" @click="cancelPackage">取消</el-button>
      </span>
    </el-dialog>
  </el-card>
</template>

<script>
import { distOptions } from "./options/sys-dist-option";
import { getPageList, saveOrUpdate, remove } from "@/api/sys/dist";
import { getDictLabel } from "@/utils";
import AppConstant from "@/utils/AppConstant";
import sm4Utils from "@/utils/sm4";
import Cookies from "js-cookie";

export default {
  name: "dist",
  data() {
    return {
      data: [],
      option: distOptions,
      loading: false,
      page: {
        //分页数据
        pageSize: 10,
        currentPage: 1,
        total: 0,
        pageSizes: [10, 20, 50, 100]
      },
      addVisible: false,
      form: {
        name: "",
        link: "",
        version: ""
      },
      rules: {
        name: [{ required: true, message: "请输入名称", trigger: "blur" }],
        link: [{ required: true, message: "请上传离线包", trigger: "blur" }]
      },
      url: window.SITE_CONFIG["singleUploadURL"],
      headers: { Authorization: Cookies.get("access_token") },
      listType: ".zip,.rar",
      fileList: [],
      DIST_PUBLISHED: AppConstant.DIST_STATUS_PUBLISHED,
      DIST_REMOVED: AppConstant.DIST_STATUS_REMOVED,
      DIST_UNPUBLISHED: AppConstant.DIST_STATUS_UNPUBLISHED
    };
  },
  filters: {
    formatStatus(value) {
      return getDictLabel("dist-status", value);
    }
  },
  methods: {
    onLoad(page = { pageSize: 10, currentPage: 1 }, params = {}) {
      this.loading = true;
      getPageList(page.currentPage, page.pageSize, params).then(res => {
        if (res.data.code === 0) {
          this.data = res.data.data.list;
          this.page.total = res.data.data.total;
        } else {
          this.$message.error(res.data.msg);
        }
      });
      this.loading = false;
    },
    addHandle() {
      this.addVisible = true;
    },
    beforeUploadHandle(file) {
      if (file.name.endsWith(".zip") || file.name.endsWith(".rar")) {
        return true;
      } else {
        this.$message.error("请检查文件类型！");
        return false;
      }
    },
    successHandle(res, file, fileList) {
      if (this.$store.state.cryptoOpen) {
        let tmpData = sm4Utils.decrypt(res, this.$store.state.key);
        res = JSON.parse(tmpData);
      }

      if (res.code !== 0) {
        return this.$message.error(res.msg);
      }
      this.form.fid = res.data.fid;
      this.form.link = res.data.url;
      // this.fileList = fileList;
      // let uploadFiles = fileList.map(item => item.response.data);

      // this.$message({
      //   message: this.$t("prompt.success"),
      //   type: "success",
      //   duration: 1000,
      //   onClose: () => {
      //     this.visible = false;
      //   }
      // });
    },
    errorHandle(err, file, fileList) {
      this.$message.error("上传失败, 请检查网络是否正常，文件服务器是否正常。");
    },
    savePackage() {
      let params = this.deepClone(this.form);
      saveOrUpdate(params).then(res => {
        if (res.data.code === 0) {
          this.addVisible = false;
          this.form = {
            name: "",
            link: "",
            version: ""
          };
          this.onLoad(this.page);
        } else {
          this.$message.error(res.data.msg);
          this.addVisible = false;
        }
      });
    },
    cancelPackage() {
      this.form = {
        name: "",
        link: "",
        version: ""
      };
      this.addVisible = false;
    },
    rowSave(form, done) {
      done(form);
      let result = this.deepClone(form);
      if (result.link && result.link.length === 1) {
        result.link = result.link[0].value;
      }
      saveOrUpdate(result).then(res => {
        if (res.data.code === 0) {
          this.onLoad(this.page);
        } else {
          this.$message.error(res.data.msg);
        }
      });
    },
    rowUpdate(form, index, done, loading) {
      done(form);
      let result = this.deepClone(form);
      if (result.link && result.link.length === 1) {
        result.link = result.link[0].value;
      }
      saveOrUpdate(result).then(res => {
        if (res.data.code === 0) {
          this.onLoad(this.page);
        } else {
          this.$message.error(res.data.msg);
        }
      });
    },
    refreshChange() {
      this.onLoad(this.page);
    },
    getType(status) {
      switch (status) {
        case 0:
          return "success";
        case 1:
          return "warning";
        case 2:
          return "info";
      }
    },
    handleEdit(row) {
      if (row.link && typeof row.link === "string") {
        row.link = [
          {
            label: "离线包",
            value: row.link
          }
        ];
      }
      this.$refs.crud.rowEdit(row);
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
            } else {
              this.$message.error(res.data.msg);
            }
          });
        })
        .catch(() => {});
    },
    handleLink(link) {
      let text;
      if (link && typeof link === "string") {
        text = link;
      } else if (link.length === 1) {
        text = link[0].value;
      }
      this.$Clipboard({
        text
      })
        .then(() => {
          this.$message.success("复制成功");
        })
        .catch(() => {
          this.$message.error("复制失败");
        });
    },
    handlePublish(row) {
      this.$confirm("确定将选择的离线包发布?", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        cancelButtonClass: "btn-custom-cancel",
        type: "warning"
      })
        .then(() => {
          let data = {};
          data.status = AppConstant.DIST_STATUS_PUBLISHED;
          data.id = row.id;
          saveOrUpdate(data).then(res => {
            if (res.data.code === 0) {
              this.onLoad(this.page);
            } else {
              this.$message.error(res.data.msg);
            }
          });
        })
        .catch(() => {});
    },
    handleSold(row) {
      this.$confirm("确定将选择的离线包下架?", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        cancelButtonClass: "btn-custom-cancel",
        type: "warning"
      })
        .then(() => {
          let data = {};
          data.status = AppConstant.DIST_STATUS_REMOVED;
          data.id = row.id;
          saveOrUpdate(data).then(res => {
            if (res.data.code === 0) {
              this.onLoad(this.page);
            } else {
              this.$message.error(res.data.msg);
            }
          });
        })
        .catch(() => {});
    },
    getForm(form) {
      let result = this.deepClone(form);
      //link为数组
      if (
        result.link &&
        typeof result.link === "object" &&
        result.link.length === 1
      ) {
        result.link = result.link[0].value;
      }
      return result;
    },
    uploadBefore(file, done, loading, column) {
      // console.log(file, column)
      if (file.name.endsWith(".zip") || file.name.endsWith(".rar")) {
        done();
      } else {
        this.$message.error("请检查文件类型！");
        loading(); //中断
      }
    },
    uploadError(error, column) {
      this.$message.error("上传失败:" + error);
      console.log(error, column);
    },
    uploadAfter(res, done, loading, column) {
      if (this.$store.state.cryptoOpen) {
        let tmpData = sm4Utils.decrypt(res, this.$store.state.key);
        res = JSON.parse(tmpData);
      }
      column.propsHttp.res = res.data;
      column.propsHttp.url = res.data.url;
      column.propsHttp.name = res.data.name;
      console.log(res, column);
      done();
    }
  }
};
</script>
