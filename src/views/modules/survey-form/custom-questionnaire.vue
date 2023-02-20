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
          v-if="$hasPermission('cust-form:add')"
          @click="toAdd()"
          >自建</el-button
        >
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          v-if="$hasPermission('cust-form:add')"
          @click="toRefer()"
          >引用</el-button
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
              v-if="$hasPermission('cust-form:edit')"
            >
              <el-button type="text" size="mini" icon="el-icon-edit"
                >编辑</el-button
              >
            </el-dropdown-item>
            <el-dropdown-item
              @click.native="toRelease(scope.row)"
              v-if="$hasPermission('cust-form:release')"
            >
              <el-button type="text" size="mini" icon="el-icon-s-release">{{
                scope.row.release ? "重新发布" : "发布"
              }}</el-button>
            </el-dropdown-item>
            <el-dropdown-item
              @click.native="toClone(scope.row)"
              v-if="$hasPermission('cust-form:copy')"
            >
              <el-button type="text" size="mini" icon="el-icon-copy-document"
                >复制</el-button
              >
            </el-dropdown-item>
            <el-dropdown-item
              @click.native="toDel(scope.row)"
              v-if="$hasPermission('cust-form:delete')"
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
              v-if="$hasPermission('cust-form:doc:upload')"
            >
              <el-button type="text" size="mini" icon="el-icon-upload"
                >上传文档</el-button
              >
            </el-dropdown-item>
            <el-dropdown-item
              @click.native="toDelDoc(scope.row)"
              v-if="
                $hasPermission('cust-form:doc:upload') &&
                  scope.row.uploadFile !== null
              "
            >
              <el-button type="text" size="mini" icon="el-icon-delete"
                >删除文档</el-button
              >
            </el-dropdown-item>
            <el-dropdown-item
              @click.native="toUploadFtl(scope.row)"
              v-if="
                $hasPermission('cust-form:reportFtl:upload') &&
                  scope.row.ftlFile === null
              "
            >
              <el-button type="text" size="mini" icon="el-icon-upload"
                >上传报告模板</el-button
              >
            </el-dropdown-item>
            <el-dropdown-item
              @click.native="toDownloadFtl(scope.row)"
              v-if="
                $hasPermission('cust-form:reportFtl:upload') &&
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
                $hasPermission('cust-form:reportFtl:upload') &&
                  scope.row.ftlFile !== null
              "
            >
              <el-button type="text" size="mini" icon="el-icon-delete"
                >删除报告模板</el-button
              >
            </el-dropdown-item>
            <el-dropdown-item
              @click.native="toHistory(scope.row)"
              v-if="$hasPermission('cust-form:history')"
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
      tip="支持文件格式: zip，单个附件不能超过10Mb"
    >
    </file-upload>
    <el-dialog title="上级表单" :visible.sync="dialogFormVisible">
      <el-form :model="ruleForm" ref="dialogForm" label-width="80px">
        <el-form-item prop="surveyFormId" label="选择表单" class="">
          <avue-input-tree
            default-expand-all
            v-model="ruleForm.surveyFormId"
            placeholder="请选择表单"
            style="width:100%;"
            type="tree"
            :dic="formDeptDict"
          ></avue-input-tree>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          @click="dialogFormSubmit"
          :loading="loading"
          :disabled="ruleForm.surveyFormId.length === 0"
          >确 定</el-button
        >
        <el-button @click="clearDeptDiag">取 消</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
import FileUpload from "@/components/upload/file-upload";
import {
  getPageList,
  delFormCache,
  del,
  clone,
  release,
  updateAttachment,
  deleteAttachment,
  deleteFtl,
  getParentDeptFormTree
} from "@/api/survey-form/questionnaire";
import Cookies from "js-cookie";
import AppConstant from "@/utils/AppConstant";
import { placeFormOptions } from "@/views/modules/survey-form/options";

export default {
  components: {
    FileUpload
  },
  props: { type: Number },
  data() {
    return {
      uploadDialogVisible: false,
      ftlUploadDialogVisible: false,
      selectedFormId: null,
      selectedVersion: null,
      fileType: ["doc", "docx"],
      zipFileType: ["zip"],
      searchForm: {},
      showAddBtn: false,
      dialogFormVisible: false,
      formCtg: AppConstant.FORM_CATEGORY_SELF, //是否引用类型， 0->自建， 1->引用
      ruleForm: {
        surveyFormId: "" //对应国家表单ID,上级部门ID
      },
      formDeptDict: [], //部门表单树
      page: {
        pageSize: 10,
        currentPage: 1,
        total: 0,
        pageSizes: [10, 20, 50, 100]
      },
      optionBak: {
        border: true,
        index: true,
        indexLabel: "序号",
        menuPosition: "left",
        menuType: "text",
        editBtn: false,
        addBtn: false,
        delBtn: false,
        viewBtn: false,
        searchBtnText: "查询",
        emptyBtnText: "重置",
        size: "mini",
        searchSize: "mini",
        searchMenuSpan: 5,
        searchLabelWidth: AppConstant.MENU_WIDTH,
        stripe: true,
        headerAlign: "center",
        align: "center",
        enter: true,
        tree: true,
        labelWidth: 110,
        menuWidth: AppConstant.MENU_WIDTH,
        column: [
          {
            width: 60,
            label: "类别",
            prop: "extend",
            search: true,
            type: "select",
            dicData: [
              { label: "引用", value: AppConstant.FORM_CATEGORY_OTHER },
              { label: "自建", value: AppConstant.FORM_CATEGORY_SELF }
            ]
          },
          {
            label: "调查表名称",
            prop: "surveyName",
            search: true,
            searchSpan: 7,
            overHidden: true,
            searchPlaceholder: "搜索调查表",
            minWidth: 140
          },
          {
            label: "父调查表名称",
            prop: "parentSurveyName",
            overHidden: true,
            minWidth: 140
          },
          {
            label: "表单文档",
            prop: "uploadFile",
            slot: true,
            overHidden: true,
            minWidth: 90
          },
          {
            label: "创建人",
            prop: "createBy",
            formatter: (row, value) => {
              return value.realName ? value.realName : value.name;
            },
            width: 90
          },
          {
            label: "创建时间",
            prop: "createAt",
            minWidth: 80,
            type: "date",
            format: "yyyy-MM-dd HH:mm"
          },
          {
            label: "使用次数",
            prop: "usedNum",
            width: 50
          },
          {
            label: "文档模板",
            prop: "ftl",
            slot: true,
            overHidden: true,
            width: 50
          },
          {
            label: "备注",
            prop: "remark",
            overHidden: true,
            width: 100
          }
        ]
      },
      option: placeFormOptions(),
      data: [],
      loading: true,
      search: {},
      dictData: []
    };
  },
  activated() {
    // this.refreshChange()
  },
  methods: {
    onLoad(page, params = {}) {
      page = page || this.page;
      params.type = 1;
      getPageList(page.currentPage, page.pageSize, params).then(res => {
        if (res.data.code === 0) {
          const data = res.data.data;
          this.page.total = data.total;
          this.showAddBtn = data.total === 0;
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
          this.$message.error("失败:", res.data.msg);
        }
        this.loading = false;
      });
    },
    toHistory(row) {
      this.$router.push(`survey-form/history/${row.type}/${row.oid}`);
    },
    preview(row) {
      this.$router.push(
        `survey-form/view/questionnaire/${row.oid}?formType=${row.type}&viewType=new`
      );
    },
    toEdit(row) {
      this.$router.push({
        name: "dform-edit",
        params: { id: row.oid, type: "form", formType: 1, formCtg: row.extend }
      });
    },
    toAdd() {
      this.$router.push({
        name: "dform-create",
        params: { formType: 1, formCtg: this.formCtg }
      });
    },
    toRefer() {
      this.dialogFormVisible = true;
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
            if (res.data.code === 0) {
              delFormCache(row.oid);
              this.onLoad(this.page, this.search);
              this.$message.success("删除成功");
            } else {
              console.log("del error msg:", res.data.msg);
              this.$message.error({ message: res.data.msg, duration: 10000 });
            }
          });
        })
        .catch(() => {});
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
          this.onLoad(this.page, this.search);
          this.$message.success("操作成功!");
        } else {
          console.error("err:", res.data.msg);
          this.$message.error("失败:", res.data.msg);
        }
      });
    },
    toUploadFtl(row) {
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
      });
    },
    toDownloadFtl(row) {
      let access_token = Cookies.get("access_token");
      let url =
        window.SITE_CONFIG["apiURL"].trim() +
        "/survey/form/v2/downloadFtl" +
        "?" +
        `id=${row.oid}&ftlFile=${row.ftlFile}` +
        `&access_token=${access_token}`;
      console.log("url:", url);
      window.open(url);
    },
    toDeleteFtl(row) {
      deleteFtl(row.oid).then(res => {
        if (res.data.code === 0) {
          this.$message.success("操作成功");
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
        {
          fid: files[0].fid,
          name: files[0].name,
          url: files[0].url
        },
        this.selectedFormId,
        this.selectedVersion
      ).then(res => {
        if (res.data.code == 0) {
          this.onLoad(this.page, this.search);
        } else {
          this.$message.error(res.data.msg);
        }
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
    toClone(row) {
      this.$confirm(`此操作将复制表单${row.surveyName}, 是否继续?`, "提示", {
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
        .catch(() => {});
    },
    searchChange(params, done) {
      this.page.currentPage = 1;
      this.onLoad(this.page, this.search);
      done();
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
    changeCategory() {},
    clearDeptDiag() {
      this.dialogFormVisible = false;
      this.ruleForm = { surveyFormId: "" };
    },
    dialogFormSubmit() {
      this.loading = true;
      console.log("refer form pid:", this.ruleForm.surveyFormId);
      // this.$router.replace({name: 'dform-edit', params:{pid: this.ruleForm.surveyFormId, formType: 1}});
      this.$router.replace({
        name: "dform-create",
        params: {
          pid: this.ruleForm.surveyFormId,
          formType: 1,
          formCtg: AppConstant.FORM_CATEGORY_OTHER
        }
      });
      this.loading = false;
      this.dialogFormVisible = false;
    }
  },
  created() {
    // const { id } = this.$route.query
    getParentDeptFormTree().then(res => {
      if (res.data.code === 0) {
        this.formDeptDict = res.data.data;
        // console.log('res:', this.formDeptDict)
      } else {
        this.$message.error(res.data.msg);
      }
    });
  }
};
</script>

<style lang="scss" scoped>
.treeSelectClass {
  line-height: 20px;
}
</style>
