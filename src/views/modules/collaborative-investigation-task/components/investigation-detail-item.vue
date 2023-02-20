<template>

  <!--  根据原型，次组件依靠type属性区分操作栏，其它理论不变-->

  <el-row>

    <avue-crud
      :option="option"
      :data="data"
      :page.sync="page"
      :table-loading="loading"
      :search.sync="search"
      @search-change="searchChange"
      @size-change="sizeChange"
      @search-reset="searchReset"
      @current-change="currentChange"
      @refresh-change="refreshChange"
      @on-load="onLoad"
    >

      <template slot="reqDeptNameSearch">

        <dept-cascader
          ref="deptCascader"
          @selectDept="selectDept"
        ></dept-cascader>

      </template>

      <template slot="reqDateSearch">

        <el-date-picker
          v-model="reqDate"
          type="datetimerange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="yyyy-MM-dd HH:mm"
          value-format="yyyy-MM-dd HH:mm:ss"
          :default-time="['00:00:00']"
        >

        </el-date-picker>

      </template>

      <template slot="accept" slot-scope="scope">

        <el-tag size="small" :type="getTypeOfStatus(scope.row.accept)">
           {{formatStatus(scope.row.accept)}}
        </el-tag>

      </template>

      <template slot-scope="scope" slot="menu" class="menuClass">

        <el-button
          type="text"
          v-if="scope.row.asid === null"
          @click="handleAssistForm(scope.row, 'create')"
          size="mini"
        >
          填写
        </el-button>

        <el-button
          type="text"
          v-else-if="
            scope.row.submitStatus === 0 || scope.row.submitStatus === 2
          "
          @click="handleAssistForm(scope.row, 'edit')"
          size="mini"
        >
           编辑
        </el-button>

        <el-button
          type="text"
          v-else-if="scope.row.submitStatus === 1"
          @click="handleAssistForm(scope.row, 'read')"
          size="mini"
        >
          查看
        </el-button>

        <span v-if="scope.row.forumId !== null">

          <el-divider direction="vertical"></el-divider>
          <el-button type="text" @click="toViewForum(scope.row)" size="mini">
            查看论坛
          </el-button>
        </span>

      </template>

    </avue-crud>

  </el-row>

</template>

<script>
import { investigationDetailOption } from "../js/options";
import { pageMyTask } from "@/api/assistant/assistant";
import { getDictDataList } from "@/utils";
import DeptCascader from "@/components/dept-cascader/index";

export default {
  name: "investigation-detail-item",
  components: { DeptCascader },
  props: {
    // 协查任务执行状态, 0->待审核，1->审核通过，2->驳回
    status: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      //协查申请部门ID
      reqDeptId: null,
      //申请时间
      reqDate: null,
      data: [],
      search: {},
      option: investigationDetailOption(),
      loading: true,
      page: {
        //表格分页
        pageSize: 10,
        currentPage: 1,
        total: 0,
        pageSizes: [10, 20, 50, 100]
      },
      statusDict: getDictDataList("assist-task-accept-status"),
      typeStatus: { 0: "info", 1: "dark", 2: "danger" }
    };
  },
  methods: {
    getTypeOfStatus(status) {
      return this.typeStatus[status] ? this.typeStatus[status] : "";
    },
    formatStatus(val) {
      let label = val;
      if (this.statusDict) {
        this.statusDict.some(item => {
          if (item.dictValue == val) {
            label = item.dictLabel;
            return true;
          }
        });
      }
      return label;
    },
    onLoad() {
      this.loading = true;
      //协查任务执行状态, 0->待审核，1->审核通过，2->驳回
      this.search.auditStatus = this.status;
      this.search.reqDeptId = this.reqDeptId;
      if (this.validatenull(this.reqDate)) {
        this.search.start = null;
        this.search.end = null;
      } else {
        this.search.start = this.reqDate[0];
        this.search.end = this.reqDate[1];
      }
      pageMyTask(this.page.currentPage, this.page.pageSize, this.search).then(
        res => {
          let d = res.data;
          if (d.code === 0) {
            this.data = d.data.list;
            this.page.total = d.data.total;
          }
          this.loading = false;
        }
      );
    },
    searchChange(params, done) {
      this.page.currentPage = 1;
      this.onLoad();
      done();
    },
    searchReset() {
      this.reqDate = null;
      this.reqDeptId = null;
      this.$refs.deptCascader.reset();
    },
    sizeChange(val) {
      this.page.currentPage = 1;
      this.page.pageSize = val;
      this.onLoad();
    },
    currentChange(val) {
      this.page.currentPage = val;
      this.onLoad();
    },
    refreshChange() {
      this.onLoad();
    },
    //协查填写表单
    handleAssistForm(row, type) {
      console.log("handleAssistForm:", row);
      // this.$router.push({name: 'write-questionnaire', params: {taskId: row.taskId, surveyFormId: row.formId}})
      this.$router.push({
        name: "collaborative-write-questionnaire",
        query: {
          appId: row.appId,
          taskId: row.taskId,
          formId: row.formId,
          aTaskId: row.id,
          historyId: row.historyId,
          asid: row.asid,
          aspid: row.aspid,
          operType: type
        }
      });
    },
    // 协查论坛
    toViewForum(row) {
      let forumId = row.forumId;
      console.log("toForum:", forumId);
      if (this.validatenull(forumId)) {
        this.$message.info("没有关联的协查帖子");
      } else {
        this.$router.push({
          path: `/research-forum/detail/${forumId}`,
          query: { source: "inves" }
        });
      }
    },
    selectDept(obj) {
      this.reqDeptId = obj;
    }
  }
};
</script>

<style scoped>
:deep(.el-form-item--mini > .el-form-item__content > .el-button--default) {
  margin-right: 5px;
}
</style>

