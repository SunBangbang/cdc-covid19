<template>
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
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          v-if="$hasPermission('com-form:add')"
          @click="toAdd()"
          class="operation-item"
          >新增</el-button
        >
      </template>
      <template slot="ftl" slot-scope="scope">
        {{ scope.row.ftlFile === null ? "无" : "有" }}
      </template>
      <!--自定义发布状态列slot-->
      <template slot-scope="scope" slot="release">
        <el-switch
          v-model="scope.row.release"
          @change="handleStatusChange(scope.row.release, scope.row)"
        >
        </el-switch>
      </template>

      <template slot-scope="scope" slot="uploadFile">
        <a
          :href="scope.row.uploadFile ? scope.row.uploadFile.url : ''"
          :download="scope.row.uploadFile ? scope.row.uploadFile.name : ''"
        >
          {{ scope.row.uploadFile ? scope.row.uploadFile.name : "" }}
        </a>
      </template>

      <template slot-scope="scope" slot="menu" class="menuClass">
        <el-button type="text" @click="preview(scope.row)" size="mini"
          >查看</el-button
        >
        <el-divider direction="vertical"></el-divider>
        <el-dropdown>
          <el-button type="text" size="mini" class="el-dropdown-link"
            >更多</el-button
          >
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              @click.native="toEdit(scope.row)"
              v-if="$hasPermission('com-form:edit')"
            >
              <el-button type="text" size="mini" icon="el-icon-edit"
                >编辑</el-button
              >
            </el-dropdown-item>
            <el-dropdown-item
              @click.native="toRelease(scope.row)"
              v-if="$hasPermission('com-form:release')"
            >
              <el-button type="text" size="mini" icon="el-icon-s-release">{{
                scope.row.release ? "重新发布" : "发布"
              }}</el-button>
            </el-dropdown-item>
            <el-dropdown-item
              @click.native="toClone(scope.row)"
              v-if="$hasPermission('com-form:copy')"
            >
              <el-button type="text" size="mini" icon="el-icon-copy-document"
                >复制</el-button
              >
            </el-dropdown-item>
            <el-dropdown-item
              @click.native="toDel(scope.row)"
              v-if="$hasPermission('com-form:delete')"
            >
              <el-button
                type="text"
                size="mini"
                icon="el-icon-delete"
                class="dangerBtn"
                >删除</el-button
              >
            </el-dropdown-item>
            <el-dropdown-item
              @click.native="toUpload(scope.row)"
              v-if="$hasPermission('com-form:doc:upload')"
            >
              <el-button type="text" size="mini" icon="el-icon-upload"
                >上传文档</el-button
              >
            </el-dropdown-item>
            <el-dropdown-item
              @click.native="toDelDoc(scope.row)"
              v-if="
                $hasPermission('com-form:doc:upload') &&
                  scope.row.uploadFile !== null
              "
            >
              <el-button type="text" size="mini" icon="el-icon-delete"
                >删除文档</el-button
              >
            </el-dropdown-item>
            <el-dropdown-item
              @click.native="toUploadFtl(scope.row)"
              v-if="$hasPermission('com-form:reportFtl:upload')"
            >
              <el-button type="text" size="mini" icon="el-icon-upload"
                >上传报告模板</el-button
              >
            </el-dropdown-item>
            <el-dropdown-item
              @click.native="toDownloadFtl(scope.row)"
              v-if="
                $hasPermission('com-form:reportFtl:upload') &&
                  scope.row.ftlFile !== null
              "
            >
              <el-button type="text" size="mini" icon="el-icon-download"
                >下载报告模板</el-button
              >
            </el-dropdown-item>
            <el-dropdown-item
              @click.native="toDeleteFtl(scope.row)"
              v-if="
                $hasPermission('com-form:reportFtl:upload') &&
                  scope.row.ftlFile !== null
              "
            >
              <el-button type="text" size="mini" icon="el-icon-delete"
                >删除报告模板</el-button
              >
            </el-dropdown-item>
            <el-dropdown-item
              @click.native="toHistory(scope.row)"
              v-if="$hasPermission('com-form:history')"
            >
              <el-button type="text" size="mini" icon="el-icon-view"
                >历史记录</el-button
              >
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </avue-crud>

    <file-upload
      v-if="uploadDialogVisible"
      ref="upload"
      maxCcount="1"
      listType="text"
      category="survey_form"
      title="上传表单文档"
      :file-type="fileType"
      tip="支持文件格式: WORD，单个附件不能超过10Mb"
      @refreshDataList="saveWordUrl"
    >
    </file-upload>

    <file-upload
      v-if="ftlUploadDialogVisible"
      ref="upload"
      maxCcount="1"
      listType="text"
      category="survey_form"
      title="上传表单报告模板"
      :file-type="zipFileType"
      @refreshDataList="refreshDataList"
      @useDelete="beforeUpload"
      tip="支持文件格式: zip，单个附件不能超过10Mb"
    >
    </file-upload>
  </el-card>
</template>

<script>
import FileUpload from "@/components/upload/file-upload";
import {
  clone,
  release,
  delFormCache,
  del,
  deleteAttachment,
  deleteFtl,
  getPageList,
  switchRelease,
  updateAttachment
} from "@/api/survey-form/questionnaire";
// import {getCategoryDictDataByName} from '@/api/questionnaire-category/questionnaire-category'
import AppConstant from "@/utils/AppConstant";
import Cookies from "js-cookie";
import { countryFormOptions } from "@/views/modules/survey-form/options";

export default {
  components: {
    FileUpload
  },
  props: { type: Number },
  data() {
    return {
      rowData: {},
      uploadDialogVisible: false,
      ftlUploadDialogVisible: false,
      selectedFormId: null,
      selectedVersion: null,
      fileType: ["doc", "docx"],
      zipFileType: ["zip"],
      page: {
        pageSize: 10,
        currentPage: 1,
        total: 0,
        pageSizes: [10, 20, 50, 100]
      },
      option: countryFormOptions(),
      data: [],
      loading: true,
      search: {},
      dictData: []
    };
  },
  methods: {
    beforeUpload() {
      if (JSON.stringify(this.rowData) !== "{}") {
        this.toDeleteFtl(this.rowData);
      }
    },
    onLoad(page, params = {}) {
      page = page || this.page;
      params.type = 0;
      getPageList(page.currentPage, page.pageSize, params).then(res => {
        if (res.data.code == 0) {
          const data = res.data.data;
          this.page.total = data.total;
          this.data = data.list;
          this.data.forEach(item => {
            if(item.uploadFile) {
              let urlArr = item.uploadFile.url.split('/')
              urlArr[urlArr.length - 1] = encodeURIComponent(urlArr.pop())
              item.uploadFile.url = urlArr.join('/');
            }
          })
        } else {
          console.error("err:", res.data.msg);
        }
        this.loading = false;
      });
    },
    preview(row) {
      // this.$router.push({name: 'dform-preview', query:{id: row.oid}});
      this.$router.push(
        `survey-form/view/questionnaire/${row.oid}?formType=${row.type}&viewType=new`
      );
    },
    toHistory(row) {
      this.$router.push(`survey-form/history/${row.type}/${row.oid}`);
    },
    toEdit(row) {
      this.$router.replace({
        name: "dform-edit",
        params: { id: row.oid, type: "form", formType: 0 }
      });
    },
    toAdd() {
      this.$router.replace({ name: "dform-create", params: { formType: 0 } });
    },
    toDel(row) {
      this.$confirm("请保证任务未被任务使用！确定将选择数据删除?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        cancelButtonClass: "btn-custom-cancel",
        type: "warning"
      })
        .then(() => {
          del(row.oid).then(res => {
            if (res.data.code == 0) {
              delFormCache(row.oid);
              this.$message.success("删除成功");
              this.refreshChange();
            } else {
              console.log("del error msg:", res.data.msg);
              this.$message.error({ message: res.data.msg, duration: 10000 });
            }
          });
        })
        .catch(() => {
          console.log("取消");
        });
    },
    toClone(row) {
      this.$confirm(`此操作将复制表单:${row.surveyName}, 是否继续?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        cancelButtonClass: "btn-custom-cancel",
        type: "warning"
      })
        .then(() => {
          clone(row.oid).then(res => {
            if (res.data.code === 0) {
              this.$message.success(`复制表单成功,新表单为${res.data.data}`);
              this.onLoad(this.page, this.search);
            } else {
              this.$message.error(res.data.msg);
            }
          });
        })
        .catch(() => {
          console.log("取消");
        });
    },
    toRelease(row) {
      this.$confirm(`此操作将发布表单: ${row.surveyName}, 是否继续?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        cancelButtonClass: "btn-custom-cancel",
        type: "warning"
      })
        .then(() => {
          release(row.oid, row.version).then(res => {
            if (res.data.code === 0) {
              this.$message.success(`发布表单成功`);
              this.onLoad(this.page, this.search);
            } else {
              this.$message.error(res.data.msg);
            }
          });
        })
        .catch(() => {
          console.log("取消");
        });
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
      this.page.currentPage = 1;
      this.onLoad(this.page, this.search);
      done();
    },
    changeCategory(val) {},
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
    },
    toUpload(row) {
      this.uploadDialogVisible = true;
      this.selectedFormId = row.oid;
      this.selectedVersion = row.version;
      this.$nextTick(() => {
        this.$refs.upload.init();
      });
    },
    toDelDoc(row) {
      this.uploadDialogVisible = true;
      this.selectedFormId = row.oid;
      this.selectedVersion = row.version;
      deleteAttachment(this.selectedFormId, this.selectedVersion).then(res => {
        if (res.data.code === 0) {
          this.$message.success("操作成功!");
          this.$nextTick(() => {
            this.onLoad(this.page, this.search);
          });
        } else {
          console.error("err:", res.data.msg);
        }
      });
    },
    toUploadFtl(row) {
      let useDelete = row.ftlFile !== null;
      // let that = this
      this.ftlUploadDialogVisible = true;
      this.selectedFormId = row.oid;
      this.$nextTick(() => {
        let access_token = Cookies.get("access_token");
        let uploadUrl =
          window.SITE_CONFIG["apiURL"].trim() +
          "/survey/form/v2/uploadFtl" +
          "?" +
          `id=${this.selectedFormId}` +
          `&access_token=${access_token}`;
        this.$refs.upload.init(uploadUrl);
        if (useDelete) {
          this.rowData = Object.assign({}, row);
        }
        this.onLoad(this.page, this.search);
      });
    },
    toDownloadFtl(row) {
      console.log("download ftl: ", row);
      let access_token = Cookies.get("access_token");
      let url =
        window.SITE_CONFIG["apiURL"].trim() +
        "/survey/form/v2/downloadFtl" +
        "?" +
        `id=${row.oid}&ftlFile=${row.ftlFile}` +
        `&access_token=${access_token}`;
      window.open(url);
      this.onLoad(this.page, this.search);
    },
    toDeleteFtl(row) {
      console.log("delete ftl: ", row);
      deleteFtl(row.oid).then(res => {
        if (res.data.code === 0) {
          if (JSON.stringify(this.rowData) === "{}") {
            this.$message.success("操作成功");
          }
          this.onLoad(this.page, this.search);
        } else {
          this.$message.error("操作失败:", res.data.msg);
        }
      });
    },
    refreshDataList(obj) {
      this.onLoad(this.page, this.search);
    },
    saveWordUrl(files) {
      // console.log('save word url:', files, ' ', this.selectedFormId)
      updateAttachment(
        { fid: files[0].fid, name: files[0].name, url: files[0].url },
        this.selectedFormId,
        this.selectedVersion
      ).then(res => {
        if (res.data.code == 0) {
          this.onLoad(this.page, this.search);
        } else {
          this.$message.error(res.data.msg);
        }
      });
    }
  },
  created() {
    const { id } = this.$route.query;
    //获取整个调查表分类列表数据
    /*getCategoryDictDataByName('公共表单').then(res => {
        if (res.data.code === 0) {
          this.dictData = res.data.data
        }else{
          this.$message.error(res.data.msg)
        }
      })*/
  }
};
</script>

<style scoped></style>
