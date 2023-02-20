<template>
  <el-card class="aui-card--fill">
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
      @search-change="searchChange"
      @refresh-change="refreshChange"
      @selection-change="selectionChange"
    >
      <template slot="menuLeft">
        <el-button
          v-if="$hasPermission('sys:androidUpgrade:add')"
          icon="el-icon-plus"
          type="primary"
          size="mini"
          @click="addHandle()"
          >{{ $t("add") }}</el-button
        >
        <el-button v-if="$store.state.user.superAdmin === 1" type="danger" size="mini" icon="el-icon-delete" @click="toDel">删除</el-button>
      </template>

      <template slot-scope="scope" slot="menu">
        <template v-if="scope.row.status === UPGRADE_UNPUBLISHED">
          <el-button
            type="text"
            icon="el-icon-sell"
            v-if="$hasPermission('sys:androidUpgrade:publish')"
            @click.stop="handlePublish(scope.row)"
            size="mini"
            >发布</el-button
          >
          <el-button
            type="text"
            icon="el-icon-edit"
            v-if="$hasPermission('sys:androidUpgrade:edit')"
            @click="handleEdit(scope.row)"
            size="mini"
            >编辑</el-button
          >
          <el-button
            type="text"
            icon="el-icon-delete"
            v-if="$hasPermission('sys:androidUpgrade:delete')"
            @click="rowDel(scope.row)"
            size="mini"
            >删除</el-button
          >
        </template>
        <el-button
          v-else
          type="text"
          icon="el-icon-brush"
          @click="handleLink(scope.row.link)"
          size="mini"
          >升级码</el-button
        >
      </template>

      <template slot="status" slot-scope="scope">
        <el-tag size="small" :type="getType(scope.row.status)">
          {{ scope.row.status | formatStatus }}
        </el-tag>
      </template>

      <template slot="publishDate" slot-scope="scope">
        {{ scope.row.publishDate }}
      </template>

      <template slot="mandatoryForm">
        <el-switch v-model="form.mandatory"></el-switch>
      </template>
    </avue-crud>

    <el-dialog :visible.sync="codeVisible" width="30%" title="扫码下载">
      <div
        v-loading="loading"
        element-loading-text="正在处理中"
        class="qrcode-box"
      >
        <div id="qrcode" class="qrcode" ref="qrCodeUrl"></div>
        <div class="down-text" @click="downLoadCode">下载二维码</div>
      </div>
    </el-dialog>

    <el-dialog
      :visible.sync="addVisible"
      title="新 增"
      :close-on-click-modal="true"
      :close-on-press-escape="true"
      @close="cancelPackage"
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
        <el-form-item label="升级包上传:" prop="link">
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
              支持文件格式：apk
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item label="是否强制升级:" prop="mandatory">
          <el-switch
            v-model="form.mandatory">
          </el-switch>
        </el-form-item>
        <el-form-item label="版本号:" prop="version"
          ><el-input
            v-model="form.version"
            clearable
            placeholder="请输入版本"
          ></el-input
        ></el-form-item>
        <el-form-item label="迭代内容:" prop="content"
          ><el-input
            v-model="form.content"
            type="textarea"
            autosize
            clearable
            placeholder="请输入迭代内容"
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
import { upgradeOptions } from "./options/upgrade-option";
import {
  getUpgradeList,
  publish,
  add,
  update,
  remove,
  batchDelete
} from "@/api/sys/upgrade-package";
import { getDictLabel } from "@/utils";
import AppConstant from "@/utils/AppConstant";
import QRCode from "qrcodejs2";
import html2canvas from "html2canvas";
import Cookies from "js-cookie";
import sm4Utils from "@/utils/sm4";

export default {
  name: "upgrade-package",
  data() {
    return {
      data: [],
      option: upgradeOptions(),
      loading: false,
      page: {
        //分页数据
        pageSize: 10,
        currentPage: 1,
        total: 0,
        pageSizes: [10, 20, 50, 100]
      },
      UPGRADE_PUBLISHED: AppConstant.UPGRADE_STATUS_PUBLISHED,
      UPGRADE_UNPUBLISHED: AppConstant.UPGRADE_STATUS_UNPUBLISHED,
      codeVisible: false,
      img: "",
      addVisible: false,
      form: {
        name: "",
        link: "",
        mandatory: false,
        version: "",
        content: "",
        type: 1
      },
      rules: {
        name: [{ required: true, message: "请输入名称", trigger: "blur" }],
        link: [{ required: true, message: "请上传离线包", trigger: "blur" }],
        version: [{ required: true, message: "请输入版本号", trigger: "blur" }],
        content: [
          { required: true, message: "请输入迭代内容", trigger: "blur" }
        ]
      },
      url: window.SITE_CONFIG["singleUploadURL"],
      headers: { Authorization: Cookies.get("access_token") },
      listType: ".apk",
      fileList: [],
      selectionList: [],
    };
  },
  filters: {
    formatStatus(value) {
      return getDictLabel("upgrade-status", value);
    }
  },
  methods: {
    onLoad(page = { pageSize: 10, currentPage: 1 }, params = {}) {
      if (!this.$hasPermission("sys:androidUpgrade:page")) {
        return;
      }
      this.loading = true;
      if (params.updater) {
        params.updateName = params.updater;
        delete params.updater;
      }
      getUpgradeList(page.currentPage, page.pageSize, params).then(res => {
        if (res.data.code === 0) {
          this.data = res.data.data.list;
          this.page.total = res.data.data.total;
        } else {
          this.$message.error(res.data.msg);
        }
      });
      this.loading = false;
    },
    toDel() {
      if(this.selectionList.length < 1) {
        this.$message.warning('请先选择需要删除的数据')
        return
      }
      this.$confirm("确定将选择数据删除?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        cancelButtonClass: "btn-custom-cancel",
        type: "warning"
      })
        .then(() => {
          batchDelete(this.selectionList.map(s => s.id)).then(res => {
            if(res.data.code === 0) {
              this.$message.success('操作成功');
              this.selectionList = [];
              this.$refs.crud.toggleSelection();
              this.onLoad();
            } else {
              this.$message.error({ message: res.data.msg, duration: 10000 });
            }
          })
      }).catch(() => {});
    },
    addHandle() {
      this.form.mandatory = false
      this.addVisible = true;
    },
    beforeUploadHandle(file) {
      if (file.name.endsWith(".apk")) {
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
    },
    errorHandle(err, file, fileList) {
      this.$message.error("上传失败, 请检查网络是否正常，文件服务器是否正常。");
    },
    savePackage() {
      this.$refs["form"].validate((valid, err) => {
        if (valid) {
          let params = this.deepClone(this.form);
          params.mandatory = params.mandatory ? 1 : 0
          add(params).then(res => {
            if (res.data.code === 0) {
              this.addVisible = false;
              this.onLoad(this.page);
            } else {
              this.$message.error(res.data.msg);
            }
          });
        }
      });
    },
    cancelPackage() {
      this.form = {
        name: "",
        link: "",
        mandatory: false,
        version: "",
        content: "",
        type: 1
      };
      this.fileList = []
      this.addVisible = false;
    },
    searchChange(params, done) {
      done();
      this.onLoad(this.page, params);
    },
    selectionChange(list) {
      this.selectionList = list;
    },
    rowSave(form, done) {
      done(form);
      let result = this.deepClone(form);
      result.mandatory = result.mandatory ? 1 : 0
      if (result.link && result.link.length === 1) {
        result.link = result.link[0].value;
      }
      if (!result.type) {
        result.type = 1;
      }
      add(result).then(res => {
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
      result.mandatory = this.form.mandatory ? 1 : 0
      if (result.link && result.link.length === 1) {
        result.link = result.link[0].value;
      }
      update(result).then(res => {
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
          return "warning";
        case 1:
          return "success";
      }
    },
    handleEdit(row) {
      if (row.link && typeof row.link === "string") {
        row.link = [
          {
            label: "升级包",
            value: row.link
          }
        ];
      }
      this.form.mandatory = row.mandatory === 1 ? true : false
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
      this.codeVisible = true;
      this.loading = true;
      let text;
      if (link && typeof link === "string") {
        text = link;
      } else if (link.length === 1) {
        text = link[0].value;
      }
      this.$nextTick(() => {
        this.creatQrCode(text);
      });
    },
    creatQrCode(text) {
      document.getElementById("qrcode").innerHTML = "";
      const qrcode = new QRCode(this.$refs.qrCodeUrl, {
        text: text, // 需要转换为二维码的内容
        width: 400,
        height: 400,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });
      this.loading = false;
    },
    handlePublish(row) {
      this.$confirm("确定将选择的升级包发布?", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        cancelButtonClass: "btn-custom-cancel",
        type: "warning"
      }).then(() => {
        publish(row.id).then(res => {
          if (res.data.code === 0) {
            this.onLoad(this.page);
          } else {
            this.$message.error(res.data.msg);
          }
        });
      });
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
      console.log(file, column);
      if (file.name.endsWith(".apk")) {
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
      console.log(res, column);
      done();
    },
    downLoadCode() {
      this.loading = true;
      html2canvas(this.$refs.qrCodeUrl).then(canvas => {
        this.img = canvas.toDataURL("image/png");
        const href = this.img;
        const a = document.createElement("a");
        a.href = href;
        a.download = "升级码";
        a.click();
        this.loading = false;
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.qrcode-box {
  height: 460px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  .down-text {
    color: #13bdc9;
    line-height: 50px;
    font-size: 18px;
    font-weight: 600;
    flex: 100%;
    text-align: center;
    text-decoration: underline;
    cursor: pointer;
  }
}
</style>
