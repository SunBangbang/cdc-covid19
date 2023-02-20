<template>

  <el-card class="aui-card--fill">

    <el-row>

      <el-form
        :model="search"
        ref="searchForm"
        @keyup.enter.native="onLoad"
        size="mini"
        label-width=".6rem"
        label-suffix=":"
      >

        <el-col :span="8">

          <el-form-item label="调查表" prop="surveyFormId">

            <avue-input-tree
              v-model="search.surveyFormId"
              placeholder="请选择调查表"
              style="width: 1.9rem"
              :nodeClick="selectSurveyForm"
              type="tree"
              :dic="surveyFormOptions"
            >

            </avue-input-tree>

          </el-form-item>

        </el-col>

        <el-col :span="16">

          <el-form-item label="流调任务" prop="taskId" label-width=".6rem">

            <avue-select
              multiple
              v-model="search.taskId"
              placeholder="请选择流调任务（可多选）"
              style="width: 4.3rem"
              type="tree"
              @change="isDisabled"
              :dic="taskOptions"
            >

            </avue-select>

          </el-form-item>

        </el-col>

        <el-col :span="8">

          <el-form-item label="开始时间">

            <avue-date
              v-model="search.startTime"
              format="yyyy-MM-dd HH:mm"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="请选择审核开始时间"
            >

            </avue-date>

          </el-form-item>

        </el-col>

        <el-col :span="7">

          <el-form-item label="结束时间">

            <avue-date
              v-model="search.endTime"
              format="yyyy-MM-dd HH:mm"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="请选择审核结束时间"
            >

            </avue-date>

          </el-form-item>

        </el-col>

        <el-col :span="7">

          <el-form-item>

            <el-button
              @click="doQuery"
              type="primary"
              icon="el-icon-search"
              :disabled="disabled"
              style="margin-right: 15px"
            >
              查询
            </el-button>

            <el-button
              @click="clear"
              :disabled="disabled"
              icon="el-icon-delete"
            >
              重置
            </el-button>

          </el-form-item>

        </el-col>

      </el-form>

    </el-row>

    <avue-crud
      :option="tableOption"
      :data="pageData"
      :page.sync="page"
      @search-change="searchChange"
      @size-change="sizeChange"
      @current-change="currentChange"
      @search-reset="searchReset"
      @selection-change="selectionChange"
      @refresh-change="refreshChange"
    >

      <template slot="menuRight">

        <el-button
          type="primary"
          icon="el-icon-view"
          size="mini"
          @click="doAnalysis"
        >
          轨迹分析
        </el-button>

      </template>

      <!--            <template slot-scope="scope" slot="menu" class="menuClass">-->

      <!--                <el-button type="text" @click="toQuestionnaire(scope.row)" size="mini">查看</el-button>-->

      <!--            </template>-->

    </avue-crud>

    <multi-map-dialog
      v-if="mapDialogVisible"
      ref="multiMapDialog"
    ></multi-map-dialog>

  </el-card>

</template>

<script>
import MultiMapDialog from "./components/multi-map-dialog";
import { pageValidForTask as pageForTask } from "@/api/survey-form/sample";
import { tableOption } from "./const/option";
import analysisStat from "@/mixins/analysis-stat";

export default {
  name: "track-analysis",
  components: {
    MultiMapDialog
  },
  mixins: [analysisStat],
  data() {
    return {
      search: {
        surveyFormId: "",
        taskId: [],
        startTime: null,
        endTime: null
      },
      disabled: true,
      rules: {
        surveyFormId: [{ required: true, message: "请选择调查表" }],
        taskId: [{ required: true, message: "请选择任务" }]
      },
      tableOption: tableOption(), //表格配置
      pageData: [], //表格数据
      page: {
        //表格分页
        pageSize: 10,
        currentPage: 1,
        total: 0,
        pageSizes: [10, 20, 50, 100]
      },
      mapDialogVisible: true,
      selectedIds: ""
    };
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.getSurveyFormOptions();
    },
    onLoad() {
      // this.loading = true;
    },
    loadSample() {
      this.loading = true;
      let params = {};
      Object.assign(params, this.search);
      params.taskIds = params.taskId.join(",");
      delete params.taskId;
      pageForTask(this.page.currentPage, this.page.pageSize, params)
        .then(res => {
          if (res.data.code === 0) {
            const data = res.data.data;
            this.pageData = data.list;
            this.page.total = data.total;
            this.loading = false;
          } else {
            this.loading = false;
            this.$message.error(res.data.msg);
          }
        })
        .catch(err => {
          console.log(err.message);
        });
    },
    clear() {
      this.search = {
        surveyFormId: "",
        taskId: [],
        startTime: null,
        endTime: null
      };
      this.$refs["searchForm"].resetFields();
    },
    doQuery() {
      if (this.search.startTime && this.search.endTime) {
        if (this.search.startTime > this.search.endTime) {
          this.$message.warning("开始时间不能大于结束时间");
          return;
        }
      }
      this.$refs["searchForm"].validate(valid => {
        if (valid) {
          this.loadSample();
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    selectSurveyForm(obj) {
      this.search.taskId = [];
      this.getTaskOptions(obj.value);
    },
    toQuestionnaire(row) {
      this.$store.state.contentTabs = this.$store.state.contentTabs.filter(
        item => item.name !== "questionnaire-detail"
      );
      this.$nextTick(() => {
        this.$router.push({
          name: "questionnaire-detail",
          params: {
            id: row.id,
            surveyFormId: this.search.surveyFormId,
            canEdit: false
          }
        });
      });
    },
    doAnalysis(row) {
      if (!this.search.surveyFormId || this.selectedIds.length === 0) {
        this.$message.warning("请选择问卷样本!");
        return;
      }
      this.mapDialogVisible = true;
      this.$nextTick(() => {
        this.$refs["multiMapDialog"].dialogVisible = true;
        this.$refs["multiMapDialog"].sids = this.selectedIds;
        this.$refs["multiMapDialog"].surveyFormId = this.search.surveyFormId;
        this.$refs["multiMapDialog"].loadTracks();
      });
    },
    searchChange(params, done) {
      this.search = params;
      this.page = {
        pageSize: 10,
        currentPage: 1,
        total: 0
      };
      this.doQuery();
      done();
    },
    sizeChange(val) {
      this.page.currentPage = 1;
      this.page.pageSize = val;
      this.doQuery();
    },
    currentChange(val) {
      this.page.currentPage = val;
      this.doQuery();
    },
    refreshChange() {
      this.doQuery();
    },
    searchReset() {
      this.search = {
        surveyFormId: "",
        taskId: [],
        startTime: null,
        endTime: null
      };
    },
    // 改变多选
    selectionChange(list) {
      let result = [];
      list.forEach(item => {
        result.push(item.id);
      });
      this.selectedIds = result.join(",");
    },
    isDisabled() {
      this.$nextTick(() => {
        this.disabled = !(this.search.surveyFormId && this.search.taskId.length > 0)
      })
    }
  }
};
</script>

<style lang="scss" scoped>
.map-div {
  .el-aside {
    background-color: #d3dce6;
    color: #333;
    text-align: center;
    line-height: 200px;
  }

  .el-main {
    padding: 0;
  }

  body > .el-container {
    margin-bottom: 40px;
  }

  .el-container:nth-child(5) .el-aside,
  .el-container:nth-child(6) .el-aside {
    line-height: 260px;
  }

  .el-container:nth-child(7) .el-aside {
    line-height: 320px;
  }
}
</style>

<style scoped lang="css">
:deep(.el-date-editor.el-input, .el-date-editor.el-input__inner) {
  width: 1.9rem;
}
</style>

