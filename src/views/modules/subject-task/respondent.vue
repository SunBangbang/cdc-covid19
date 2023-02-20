<!-- 重要的调查对象组件, 由AnyaParry开发.调查对象页面和创建任务时选择调查对象两个页面调用该组件.请尽量不要修改现有代码,尽可能增量更新.-->

<template>

  <div>

    <avue-crud
      @on-load="onLoad"
      @search-change="search"
      @size-change="sizeChange"
      @row-save="rowSave"
      @row-update="rowUpdate"
      @current-change="currentChange"
      @selection-change="selectionChange"
      :data="tableData"
      :option="option"
      :search.sync="searchData"
      :page.sync="page"
      v-model="form"
      :before-open="beforeOpen"
      ref="crud"
    >
      <template slot="menuLeft" slot-scope="{ size }">
        <el-button
          v-if="menu"
          type="primary"
          :size="size"
          @click="openReportCardDialog"
          >同步传报卡</el-button
        >
      </template>

      <template slot="identityForm">

        <el-input
          @change="calcAge(form)"
          v-model="form.identity"
          maxlength="18"
          clearable
          placeholder="请输入证件号"
          show-word-limit
        ></el-input>

      </template>


      <template slot="addressForm">
        <div class="flex">
          <region-select
            v-model="form.address"
            :showDetailedAddress="true"
            class="flex-item"
            :show-append="false"
          ></region-select>
        </div>
      </template>

      <template slot="address" slot-scope="scope">
        {{scope.row.address | formatAddress}}
      </template>

      <template slot="status" slot-scope="scope">

        <el-tag
          v-if="scope.row.status === 2"
          color="#e2f2f0"
          style="color: #17b3a3; border-color: #68ccc2"
          size="small"
        >
          {{scope.row.status | formatStatus}}
        </el-tag>

        <el-tag
          v-if="scope.row.status === 1"
          color="#f9f3e5"
          style="color: #F7B500; border-color: #f9d881"
          size="small"
        >
          {{scope.row.status | formatStatus}}
        </el-tag>

        <el-tag
          v-if="scope.row.status === 0"
          color="#faf8f8"
          style="color: #FF4D4F; border-color: #ffa39e"
          size="small"
        >
          {{scope.row.status | formatStatus}}
        </el-tag>

      </template>

      <template slot="source" slot-scope="scope">
         {{scope.row.source | formatSource}}
      </template>

      <template slot="menu" slot-scope="scope">

        <el-button type="text" size="mini" @click="openDialog(scope, true)" :disabled="scope.row.source === 0">
          编辑
        </el-button>

        <el-divider direction="vertical"></el-divider>

        <el-button type="text" size="mini" @click="openDialog(scope, false)">
          查看
        </el-button>

        <el-divider direction="vertical"></el-divider>

        <el-button
          v-if="scope.row.source === 1"
          type="text"
          size="mini"
          @click.native="deleteRow(scope.row)"
        >
          删除
        </el-button>

        <el-button v-else type="text" size="mini" disabled>删除</el-button>

      </template>

    </avue-crud>

    <el-dialog
      :title="diagTitle"
      :visible.sync="dialogVisible"
      class="reset"
      width="50%"
    >

      <avue-form
        :option="formOption"
        v-model="formData"
        v-if="dialogVisible"
        class="el-dialog__body__avue-form"
        @reset-change="resetForm"
        @submit="rowUpdate"
      >

        <template slot-scope="scope" slot="identity">

          <el-input
            @change="calcAge(formData)"
            v-model="formData.identity"
            maxlength="18"
            clearable
            show-word-limit
            :readonly="disabled"
            :disabled="disabled"
            placeholder="请输入证件号"
            label="证件号"
          ></el-input>

        </template>

        <template slot-scope="scope" slot="address">
          <div class="flex">
            <region-select
              :disabled="addressDisabled"
              v-model="formData.address"
              :showDetailedAddress="true"
              class="flex-item"
              :show-append="false"
            ></region-select>
          </div>
        </template>

      </avue-form>

    </el-dialog>

    <!-- 同步传报卡 -->
    <el-dialog
      title="同步传报卡"
      :visible.sync="reportCardDialogVisible"
      width="40%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :append-to-body="true"
    >
      <el-form :model="dataForm" :rules="dataRule" ref="dataForm" label-width="100px">
        <el-form-item label="日期" prop="date">
          <el-date-picker
            v-model="dataForm.date"
            style="width: 100%"
            type="daterange"
            value-format="yyyy-MM-dd"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <template slot="footer">
        <el-button size="mini" type="primary" @click="onConfirm" :loading="loading">确认</el-button>
        <el-button size="mini" @click="reportCardDialogVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>

</template>

<script>
import { option } from "@/views/modules/subject-task/option/crudOption";
import {
  canAddOrUpdate,
  saveOneRespondentInfo,
  respondentInfoPage,
  updateOneRespondentInfo,
  deleteRespondent,
  syncCdcInf
} from "@/api/subject-task/patientInfo";
import { getDictLabel } from "@/utils";
import { respondentFromOption } from "@/views/modules/subject-task/option/formsOption";
import {
  getAgeFromIdCard, getBirthdayFromIdCard,
  getSexFromIdCard
} from "@/components/form-design/utils/index";
import codeTableApis from "@/api/sys/CodeTable";
import AppConstant from "@/utils/AppConstant";
import RegionSelect from "@/components/region-select/region-select";

export default {
  name: "respondent",
  props: ["havingNumber", "menu", "respondent"],
  components: {RegionSelect},
  data() {
    return {
      rowData: {},
      selectionList: [],
      formData: {
        address: {name: '', ids: null, detailedAddress: null},
      },
      disabled: false,
      dialogVisible: false,
      reportCardDialogVisible: false,
      loading: false,
      tableData: [],
      option: option(this.disabled, this.menu, this.respondent),
      formOption: respondentFromOption(this.disabled),
      searchData: {},
      diagTitle: null,
      page: {
        currentPage: 1,
        total: 0,
        pageSizes: [10, 20, 50, 100]
      },
      form: {
        address: {name: '', ids: null, detailedAddress: null},
      },
      dataForm: {
        date:[]
      },
      idTypes:[],
      crowds:[],
      caseTypes:[],
      addressDisabled:false,
    };
  },
  computed: {
    dataRule() {
        return {
          date: [
            { required: true, message: "请选择开始日期结束日期", trigger: "blur" },
          ],
        }
    },
  },
  mounted() {
    codeTableApis.getByType(AppConstant.CODE_TABLE_IDCARD_TYPE).then(res => {
      if (res.data.code === 0) {
        let options = res.data.data;
        if (options && options.length > 0) {
          this.option.column[5].dicData = options;
          this.formOption.column[5].dicData = options;
          this.idTypes = options;
        }
      }
    });
    codeTableApis.getByType(AppConstant.CODE_TABLE_CROWD).then(res => {
      if (res.data.code === 0) {
        let options = res.data.data;
        if (options && options.length > 0) {
          this.option.column[11].dicData = options;
          this.formOption.column[11].dicData = options;
          this.crowds = options;
        }
      }
    });
    codeTableApis.getByType(AppConstant.CODE_TABLE_CASE_TYPE).then(res => {
      if (res.data.code === 0) {
        let options = res.data.data;
        if (options && options.length > 0) {
          this.option.column[14].dicData = options;
          this.formOption.column[14].dicData = options;
          this.caseTypes = options;
        }
      }
    });
  },
  methods: {
    onLoad() {
      respondentInfoPage(
        this.page.currentPage,
        this.page.pageSize,
        this.$store.state.user.deptId,
        this.searchData
      ).then(res => {
        if (res.data.code === 0) {
          this.tableData = res.data.data.list;
          this.page.total = res.data.data.total;
        }
      });
    },
    sizeChange(val) {
      this.page.pageSize = val;
      this.onLoad();
    },
    currentChange(val) {
      this.page.currentPage = val;
      this.onLoad();
    },
    search(from, done) {
      this.searchData = from;
      this.page.currentPage = 1;
      this.onLoad();
      done();
    },
    async rowSave(form, done, loading) {
      const user = this.$store.state.user;
      form.deptId = user.deptId;
      form.creator = user.id;
      form.updater = user.id;
      form.source = 1;
      form.status = 0;

      let available = await canAddOrUpdate(form.id, form.deptId, form.identity);
      if (available) {
        saveOneRespondentInfo(form).then(res => {
          if (res.data.code === 0) {
            this.$message.success("调查对象创建成功！");
            this.onLoad(done);
          } else {
            console.error("err:", res.data.msg);
            this.$message.error("新建失败:" + res.data.msg);
          }
        });
        done();
      } else {
        this.$message.warning("证件号已经被使用");
        loading();
      }
    },
    rowUpdate(form, done) {
      const user = this.$store.state.user;
      form.creator = user.id;
      form.updater = user.id;

      updateOneRespondentInfo(form).then(res => {
        if (res.data.code === 0) {
          this.$message.success("调查对象更新成功！");
          this.dialogVisible = false;
          this.onLoad();
        } else {
          console.error("err:", res.data.msg);
          this.$message.error("更新失败:" + res.data.msg);
        }
      });
      done();
    },
    openDialog(rowData, edit) {
      this.diagTitle = edit ? "编辑调查对象信息" : "查看调查对象信息";
      this.rowData = Object.assign({}, rowData.row);
      this.formData = Object.assign({}, rowData.row);
      this.disabled = !edit;
      this.formOption = respondentFromOption(!edit);
      this.addressDisabled = !edit;
      this.dialogVisible = true;
      this.setFormOptionCodeTableValue();
      console.log(rowData, this.disabled);
    },
    openReportCardDialog() {
      this.dataForm = {date:[]}
      this.reportCardDialogVisible = true
    },
    onConfirm() {
      this.$refs["dataForm"].validate((valid) => {
        if (!valid) {
          return false;
        }
        this.loading = true
        let params = {
          deptId: this.$store.state.user.deptId,
          startDate: this.dataForm.date && this.dataForm.date.length > 0 ? this.dataForm.date[0] : '',
          endDate: this.dataForm.date && this.dataForm.date.length > 0 ? this.dataForm.date[1] : ''
        }
        syncCdcInf(params).then(res => {
          if(res.data.code === 0) {
            this.$message.success("操作成功！");
            this.reportCardDialogVisible = false;
            this.onLoad();
          } else {
            this.$message.error(res.data.msg);
          }
          this.loading = false
        })
      })
    },
    resetForm() {
      this.dialogVisible = !this.dialogVisible;
    },
    selectionChange(list) {
      this.selectionList = list;
    },
    beforeOpen(done,type) {
      this.form.address =  {name: '', ids: null, detailedAddress: null},
      done();
    },
    deleteRow(row) {
      this.$confirm("确定删除该被调查对象吗?", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        cancelButtonClass: "btn-custom-cancel",
        type: "warning"
      })
        .then(() => {
          deleteRespondent(row.id).then(res => {
            if (res.data.code === 0) {
              this.$message.success("操作成功");
              this.onLoad(this.page, this.search);
            } else {
              console.error(res.data.msg);
              return this.$message.error(res.data.msg);
            }
          });
        })
        .catch(() => {});
    },
    calcAge(formData) {
      this.$nextTick(() => {
        let val = formData.identity;
        //先识别出身份证号
        let reg = /[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]/g;
        let match = val.match(reg);
        if (match && match.length === 1) {
          let age = getAgeFromIdCard(val);
          formData.age = age;
          formData.gender = getSexFromIdCard(val) === "男" ? "0" : "1";
          formData.birthDate = getBirthdayFromIdCard(val);
        } else {
          formData.age = null;
          formData.gender = null;
          formData.birthDate = null;
          delete formData.age;
          console.log("can not parse identity:", formData);
        }
      })
    },

    setFormOptionCodeTableValue() {
      this.formOption.column[5].dicData = this.idTypes;
      this.formOption.column[11].dicData = this.crowds;
      this.formOption.column[14].dicData = this.caseTypes;
    }
  },

  filters: {
    formatStatus(value) {
      return getDictLabel("investigation-status", value);
    },
    formatSource(value) {
      return getDictLabel("respondent-source", value);
    },
    formatAddress(value) {
      if (value && value.name) {
        return value.name + " " + (value.detailedAddress ? value.detailedAddress : "");
      }
      return "";
    }
  }
};
</script>

<style scoped lang="css">
:deep(.el-dialog__body) {
  padding-bottom: 20px !important;
}
</style>

<style lang="scss">
.avue-dialog .el-dialog {
  position: relative;
  top: 0;
  left: 0;
  transform: none;
  margin: 0 auto 50px !important;
  margin-top: 15vh !important;
  max-height: 100% !important;
}
</style>

