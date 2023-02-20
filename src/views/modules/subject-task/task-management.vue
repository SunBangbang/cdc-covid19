<template>
  <div>
    <avue-crud
      ref="crud"
      :data="data"
      :option="option"
      :page.sync="page"
      :search.sync="search"
      :table-loading="loading"
      @on-load="onLoad"
      @search-change="searchChange"
      @search-reset="searchReset"
      @size-change="sizeChange"
      @current-change="currentChange"
      @refresh-change="refreshChange"
      @selection-change="selectionChange"
      class="hscrollbar-table"
    >
      <template slot="menuLeft">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="toAdd()"
          class="operation-item"
          >新增</el-button
        >
        <el-button
          type="primary"
          icon="el-icon-trophy"
          size="mini"
          @click="dialogSummaryVisible = !dialogSummaryVisible"
          class="operation-item"
          >调查员参与任务汇总
        </el-button>
        <el-button v-if="$store.state.user.superAdmin === 1" type="danger" size="mini" icon="el-icon-delete" @click="toDel">删除</el-button>
      </template>
      <template slot-scope="scope" slot="actualSample">
        <a
          v-if="scope.row.actualSample > 0"
          style="cursor: pointer"
          @click="toSample(scope.row)"
          >{{ scope.row.actualSample }}</a
        >
        <span v-else>{{ scope.row.actualSample }}</span>
      </template>
      <!-- 自定义操作栏 -->
      <template slot-scope="scope" slot="menu" class="menuClass">
        <el-button type="text" @click="toShow(scope.row)" size="mini"
          >查看</el-button
        >
        <span v-if="showDropdown(scope.row)">
          <el-divider direction="vertical"></el-divider>
          <el-dropdown>
            <el-button type="text" size="mini" class="el-dropdown-link"
              >更多</el-button
            >
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="toEdit(scope.row)">
                <el-button type="text" size="mini" icon="el-icon-edit"
                  >编辑</el-button
                >
              </el-dropdown-item>
              <el-dropdown-item @click.native="toClose(scope.row)">
                <el-button type="text" size="mini" icon="el-icon-edit"
                  >关闭</el-button
                >
              </el-dropdown-item>
              <el-dropdown-item @click.native="handleRemoveTask(scope.row)">
                <el-button
                  type="text"
                  size="mini"
                  icon="el-icon-delete"
                  class="dangerBtn"
                  >删除</el-button
                >
              </el-dropdown-item>
              <el-dropdown-item @click.native="handleSendMsg(scope.row)">
                <el-button
                  type="text"
                  size="mini"
                  icon="el-icon-message"
                  class="dangerBtn"
                  >发送短信</el-button
                >
              </el-dropdown-item>
              <!-- 测试用  -->
              <!-- <el-dropdown-item @click.native="toQuestionnaire(scope.row)">
              <el-button type="text" size="mini" icon="el-icon-delete" class="dangerBtn">问卷</el-button>
            </el-dropdown-item>
            <el-dropdown-item @click.native="toSample(scope.row)">
              <el-button type="text" size="mini" icon="el-icon-delete" class="dangerBtn">样本</el-button>
            </el-dropdown-item>            -->
            </el-dropdown-menu>
          </el-dropdown>
        </span>
      </template>
      <!--自定义发布状态列slot-->
      <template slot-scope="scope" slot="release">
        <el-switch
          v-model="scope.row.release"
          @change="handleStatusChange(scope.row.release, scope.row)"
        >
        </el-switch>
      </template>
      <template slot="surveyCount" slot-scope="scope">
        {{ scope.row.surveyForms ? scope.row.surveyForms.length : "0" }}
      </template>
      <template slot="createBy" slot-scope="scope">
        <span v-if="scope.row.createBy">{{
          scope.row.createBy.realName || scope.row.createBy.name
        }}</span>
        <span v-else>{{
          scope.row.createBy.realName || scope.row.createBy.name
        }}</span>
      </template>
      <template slot="createAt" slot-scope="scope">
        <span v-if="scope.row.createAt">{{
          scope.row.createAt | formatDate
        }}</span>
        <span v-else>{{ scope.row.createAt | formatDate }}</span>
      </template>
      <template slot="status" slot-scope="scope">
        <el-tag size="small" :type="getTypeOfStatus(scope.row.status)">
          {{ formatStatus(scope.row.status) }}
        </el-tag>
      </template>
    </avue-crud>
    <form-select-dialog
      ref="formSelectDialog"
      v-if="formSelectDialogVisible"
    ></form-select-dialog>
    <el-dialog
      title="查看调查员参与记录汇总"
      :visible.sync="dialogSummaryVisible"
      width="70%"
    >
      <investigator-hist-tasks
        ref="investigatorTasks"
      ></investigator-hist-tasks>
    </el-dialog>
  </div>
</template>

<script>
import option from "./option/taskListOption";
import {
  getList,
  remove,
  closeTask,
  sendSMS,
  batchDelete
} from "@/api/subject-task/task-management";
import moment from "moment";
import FormSelectDialog from "@/views/modules/survey-form/components/form-select-dialog";
import InvestigatorHistTasks from "@/views/modules/subject-task/investigatorHistTasks";
import { switchTaskRelease } from "@/api/subject-task/task-management";
import { getDictDataList } from "@/utils";

export default {
  props: ["type"],
  name: "task-management",
  components: {
    FormSelectDialog,
    InvestigatorHistTasks,
  },
  data() {
    return {
      page: {
        pageSize: 10,
        currentPage: 1,
        total: 0,
        pageSizes: [10, 20, 50, 100],
      },
      query: {},
      search: {
        status: "",
        release: "",
      },
      data: [],
      option: option(this),
      loading: true,
      formSelectDialogVisible: false,
      statusDict: getDictDataList("task-status"),
      typeStatus: {
        0: "info",
        1: "dark",
        2: "danger",
        3: "success",
        4: "info",
        6: "success",
        7: "danger",
      },
      dialogSummaryVisible: false,
      selectionList: [],
    };
  },
  filters: {
    formatDate(value) {
      return moment(value).format("YYYY-MM-DD HH:mm");
    },
  },
  activated() {
    // this.onLoad({currentPage: 1})
  },
  methods: {
    getTypeOfStatus(status) {
      return this.typeStatus[status] ? this.typeStatus[status] : "";
    },
    formatStatus(val) {
      let label = val;
      if (this.statusDict) {
        this.statusDict.some((item) => {
          if (item.dictValue == val) {
            label = item.dictLabel;
            return true;
          }
        });
      }
      return label;
    },
    onLoad(page, params = {}) {
      this.loading = true;
      // params.relDeptId = this.$store.state.user.deptId
      getList(
        page.currentPage,
        page.pageSize,
        Object.assign(params, this.query)
      ).then((res) => {
        const data = res.data.data;
        this.data = data.list;
        // console.log("1111121/////////////",this.data)
        this.page.total = data.total;
        this.loading = false;
      });

      // var group = this.findObject(this.option.column,'relDeptId');
      // if(!group.dicData || group.dicData.length === 0){
      //   getDeptTreeListByUser().then(res => {
      //     console.log('deptTree:', res)
      //     // group.dicData = res.data.data
      //   })
      // }
    },
    searchChange(params, done) {
      this.query = params;
      this.query.status = this.search.status;
      this.query.release = this.search.release;
      this.page = {
        pageSize: 10,
        currentPage: 1,
        total: 0,
      };
      this.onLoad(this.page, params);
      done();
    },
    selectionChange(list) {
      this.selectionList = list;
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
          batchDelete(this.selectionList.map(s => s.oid)).then(res => {
            if(res.data.code === 0) {
              this.$message.success('操作成功')
              this.selectionList = [];
              this.$refs.crud.toggleSelection();
              this.onLoad(this.page, this.search);
            } else {
              this.$message.error({ message: res.data.msg, duration: 10000 });
            }
          })
      }).catch(() => {});
    },
    // 创建任务
    toAdd() {
      if (this.$store.state.user.deptId) {
        this.$router.push({ name: "task-create" });
      } else {
        this.$message.error("当前用户没有所属组织机构，不能操作！");
        return;
      }
    },
    // 查看
    toShow(row) {
      this.$router.push({
        path: `/subject-task-task-management/show/${row.oid}/false`,
      });
    },
    // 编辑
    toEdit(row) {
      console.log(row);
      this.$router.push({
        path: `/subject-task-task-management/edit/${row.oid}`,
      });
    },
    //关闭任务
    toClose(row) {
      this.$confirm("确定将关闭任务?", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        cancelButtonClass: "btn-custom-cancel",
        type: "warning",
      })
        .then(() => {
          closeTask(row.oid).then((res) => {
            if (res.data.code == 0) {
              this.$message.success("关闭成功");
              this.onLoad(this.page, this.search);
            } else {
              this.$message.error(res.data.msg);
            }
          });
        })
        .catch(() => {});
    },
    // 问卷
    toQuestionnaire(row) {
      this.formSelectDialogVisible = true;
      this.$nextTick(() => {
        this.$refs["formSelectDialog"].init(row.oid);
      });
    },
    // 样本
    toSample(row) {
      this.$store.state.contentTabs = this.$store.state.contentTabs.filter(
        (item) => item.name !== "survey-sample"
      );
      this.$nextTick(() => {
        this.$router.push({
          name: "survey-sample",
          params: { taskId: row.oid },
        });
      });
      // this.$router.push({ path:`/survey-form-survey-sample`, query: {taskId: row.oid} });
    },
    // 删除任务
    handleRemoveTask(row) {
      this.$confirm(
        "请保证任务未被分析记录使用！ 确定将选择数据删除? ",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          cancelButtonClass: "btn-custom-cancel",
          type: "warning",
        }
      )
        .then(() => {
          remove(row.oid).then((res) => {
            if (res.data.code == 0) {
              this.$message.success("删除成功");
              this.onLoad(this.page, this.search);
            } else {
              console.log("del error msg:", res.data.msg);
              this.$message.error({ message: res.data.msg, duration: 10000 });
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
    searchReset() {
      this.query = {};
    },
    handleStatusChange(value, row) {
      switchTaskRelease(row.oid).then((res) => {
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
    showDropdown(row) {
      // console.log(row,)
      let userId = this.$store.state.user.id;
      if (row.groupLeader === userId || row.createBy.id === userId) {
        return true;
      } else {
        return false;
      }
    },
    handleSendMsg(row) {
      sendSMS(row.oid).then((res) => {
        if (res.data.code === 0) {
          this.$message.success("发送成功！");
        } else {
          this.$message.warning("发送失败！");
        }
      });
    },
  },
};
</script>
