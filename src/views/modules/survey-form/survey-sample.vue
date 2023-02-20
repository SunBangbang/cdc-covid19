<template>
  <div>
    <!-- <back-bar
      :clean-children-tab="true"
      type="push"
      :location="from"
    ></back-bar> -->
    <el-row>
    <el-col>
      <div>
        <i class="el-icon-arrow-left back-button" @click="goBack">返回</i>
      </div>
    </el-col>
  </el-row>
    <el-card class="aui-card--fill--back">
      <label class="task-title" v-if="tabVisible">{{ taskName }} </label>
      <el-tabs
        v-model="activeTab"
        v-if="tabVisible"
        @tab-click="handleTabChange"
        lazy="true"
        class="tab-nav"
        type="card"
      >
        <el-tab-pane
          v-for="item in tabsOption.columns"
          :label="item.label"
          :key="item.formId"
          :name="item.formId"
        >
        </el-tab-pane>
      </el-tabs>
      <avue-crud
        ref="crud"
        :option="tableOption"
        :data="pageData"
        :page.sync="page"
        :table-loading="loading"
        :search.sync="search"
        @search-change="searchChange"
        @selection-change="selectionChange"
        @size-change="sizeChange"
        @current-change="currentChange"
        @search-reset="searchReset"
        @refresh-change="refreshChange"
      >
        <template slot="menuLeft">
          <el-button
            v-if="isGroupLeader"
            type="primary"
            icon="el-icon-download"
            size="mini"
            @click="visible = true"
            >样本导出</el-button
          >
          <el-button v-if="$store.state.user.superAdmin === 1" type="danger" size="mini" icon="el-icon-delete" @click="toDel">删除</el-button>
        </template>
        <template slot-scope="scope" slot="menu" class="menuClass">
          <el-button type="text" @click="teamLeaderAudit(scope.row)" size="mini"
            >调查明细</el-button
          >
          <span v-if="$route.params.type !== 'other' && scope.row.mergeSid && isGroupLeader">
            <el-divider direction="vertical"></el-divider>
            <el-button
              type="text"
              v-if="scope.row.forumId === null"
              @click="toViewForum(scope.row)"
              size="mini"
              >创建论坛</el-button
            >
            <el-button
              type="text"
              v-if="scope.row.forumId"
              @click="toViewForum(scope.row)"
              size="mini"
              >查看论坛</el-button
            >
          </span>

          <!--          如果路由路径的type是other。不可以申请协查以及上级审核， 不是质控员也不能申请审核！-->
          <span v-if="isGroupLeader && showBtn">
            <span v-if="$route.params.type !== 'other'">
              <span v-if="scope.row.mergeSid !== null">
                <el-divider direction="vertical"></el-divider>
                <el-button
                  type="text"
                  size="mini"
                  @click="applicationInvestigation(scope.row)"
                  >申请协查</el-button
                >
              </span>
              <span
                v-if="
                  scope.row.mergeSid !== null &&
                    scope.row.rpid === null &&
                    deptList.length > 0
                "
              >
                <el-divider direction="vertical"></el-divider>
                <el-button
                  type="text"
                  size="mini"
                  @click="openReportedAuditCfgDialog(scope.row)"
                  >上级审核</el-button
                >
              </span>
              <span
                v-if="
                  scope.row.mergeSid !== null &&
                    scope.row.rpid !== null &&
                    deptList.length > 0
                "
              >
                <el-divider direction="vertical"></el-divider>
                <el-button type="text" size="mini" disabled>上级审核</el-button>
              </span>
            </span>
            <span v-else>
              <el-divider direction="vertical"></el-divider>
              <el-button type="text" size="mini" disabled>申请协查</el-button>
              <el-divider direction="vertical"></el-divider>
              <el-button type="text" size="mini" disabled>上级审核</el-button>
            </span>
          </span>
        </template>
        <template slot-scope="scope" slot="sex">{{ scope.row.sex }}</template>
        <template slot-scope="scope" slot="status">
          <el-tag
            size="mini"
            :type="
              scope.row.status === '已确认'
                ? 'dark'
                : scope.row.status === '未确认'
                ? 'info'
                : 'success'
            "
          >
            {{ scope.row.status }}
          </el-tag>
        </template>
      </avue-crud>

      <el-dialog title="提示" :visible.sync="visible" width="40%">
        <el-checkbox
          :indeterminate="isIndeterminate"
          v-model="checkAll"
          @change="handleCheckAllChange"
          >全选</el-checkbox
        >
        <div style="margin: 15px 0;"></div>

        <el-checkbox-group
          v-model="checkedProps"
          @change="handleCheckedPropsChange"
        >
          <el-collapse>
            <el-collapse-item
              v-for="(block, index) in questions"
              :title="block.label"
              :key="'q-' + index"
              :name="index"
            >
              <el-checkbox
                v-for="question in block.child"
                :label="question.prop"
                :key="question.prop"
                >{{ question.label }}
              </el-checkbox>
            </el-collapse-item>
          </el-collapse>
        </el-checkbox-group>

        <span slot="footer" class="dialog-footer">
          <el-button type="primary" size="mini" @click="toExport"
            >确定</el-button
          >
          <el-button size="mini" @click="visible = false">取消</el-button>
        </span>
      </el-dialog>
      <reported-sample-config-dialog
        ref="reportedSampleConfigDialog"
        v-if="showAuditConfigDlgVisible"
        @closeDialog="closeDialog"
        :dept-list="deptList"
      >
      </reported-sample-config-dialog>
    </el-card>
  </div>
</template>

<script>
import {
  deleteSample,
  pageForTask,
  pageForTaskParticipant
} from "@/api/survey-form/sample";
import { getMyFlow } from "@/api/survey-form/reported_sample";

import { getDetail, getRelatedForm, batchDeleteSample } from "@/api/subject-task/task-management";
import { surveySampleOption } from "./const/option";
import audioDialog from "./components/audioDialog";
import videoDialog from "./components/videoDialog";
import Cookies from "js-cookie";
import { getQuestionsTitle as getQuestions } from "@/api/survey-form/questionnaire";
import ReportedSampleConfigDialog from "@/views/modules/survey-form/components/reported-sample-config-dialog";
import BackBar from "@/components/back-bar/back-bar";
import { postDownload } from "@/utils/function";
import AppConstant from "@/utils/AppConstant";

export default {
  name: "surveySample",
  components: {
    BackBar,
    ReportedSampleConfigDialog
    // audioDialog,
    // videoDialog
  },
  data() {
    return {
      username: this.$store.state.user.name,
      groupLeader: null,
      checkAll: true,
      isIndeterminate: false,
      questions: [],
      checkedProps: [],
      propOptions: [],
      visible: false,
      isGroupLeader: false, //是否是任务质控员
      taskId: "",
      taskName: "未指定任务",
      tabsOption: { columns: [] },
      activeTab: "", //选中的表单id
      //表格配置
      tableOption: surveySampleOption({ isGroupLeader: false }),
      pageData: [], //表格数据
      page: {
        //表格分页
        pageSize: 10,
        currentPage: 1,
        total: 0,
        pageSizes: [10, 20, 50, 100]
      },
      search: {}, //表格搜索
      loading: true,
      tabVisible: false,
      audioDialogVisible: false,
      videoDialogVisible: false,
      selectedIds: "",
      selectRow: null,
      selectionList: [],
      showAuditConfigDlgVisible: false,
      deptList: [],
      from: null,
      showBtn: true
    };
  },
  // beforeRouteEnter(to, from, next) {
  //   next(vm => {
  //     //从审核样本页面或者协查申请页面回到当前页面，重新定义当前页面的回退路径
  //     if (
  //       from.name === "audit-sample" ||
  //       from.name === "application-investigation-task-creator" ||
  //       from.name === "write-questionnaire" ||
  //       from.name === "create-post" ||
  //       from.name === "post-detail"
  //     ) {
  //       //更改from,此时back回到我的流调任务
  //       vm.from = { name: "subject-task-my-task-management" };
  //     } else {
  //       vm.from = from;
  //     }
  //     // console.log('from:', from, 'to:', to, vm.from)
  //   });
  // },
  // beforeRouteLeave(to, from, next) {
  //   //置空，便于返回时activated方法重新初始化
  //   this.taskId = null;
  //   next();
  // },
  created() {
    this.init();
    this.getFlow();
  },
  activated() {
    if (!this.taskId) {
      this.init();
    }
    if(this.activeTab != "") {
      this.onLoad(this.page, this.search);
    }
    // let refresh = this.$route.params.refresh
    // if (refresh) {
    //   this.refreshAll()
    // }
  },
  methods: {
    goBack() {
      this.$router.back(-1)
    },
    applicationInvestigation(params) {
      this.$router.push({
        name: "application-investigation-task-creator",
        params: { ...params, surveyFormId: this.activeTab, taskId: this.taskId }
      });
    },
    closeDialog(obj) {
      this.showAuditConfigDlgVisible = false;
      const params = { surveyFormId: this.activeTab };
      this.onLoad(this.page, Object.assign(this.search, params));
      if (!this.validatenull(obj.rpid) && this.selectRow !== null) {
        this.selectRow.reported = true;
      }
    },
    getFlow() {
      getMyFlow().then(res => {
        if (res.data.code === 0) {
          this.deptList = res.data.data.list;
        } else {
          this.$message.error("err:", res.data.msg);
        }
      });
    },
    handleCheckedPropsChange(value) {
      let checkedCount = value.length;
      this.checkAll = checkedCount === this.propOptions.length;
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.propOptions.length;
    },
    handleCheckAllChange(val) {
      let prop = [];
      this.propOptions.forEach(item => {
        prop.push(item.prop);
      });
      this.checkedProps = val ? prop : [];
      this.isIndeterminate = false;
    },
    init() {
      this.taskId = this.$route.params.taskId;
      this.getTabList();
    },
    //切换tab 改变显示的样本
    handleTabChange(tab, event) {
      sessionStorage.setItem("childrenTab", tab.name);
      const params = { surveyFormId: this.activeTab };
      this.onLoad(this.page, Object.assign(this.search, params));
      this.getQuestionTitle(this.activeTab);
    },
    async onLoad(page, params = {}) {
      this.loading = true;
      this.checkAll = true;
      this.isIndeterminate = false;
      this.visible = false;
      params.taskId = this.taskId;
      if (!params.surveyFormId) {
        params.surveyFormId = this.activeTab;
      }
      // params.or = JSON.stringify({
      //   "createBy.name": this.username,
      //   submitStatus: 1
      // });
      params.or = {
        "createBy.name": this.username,
        submitStatus: 1
      };
      await pageForTaskParticipant(
        page.currentPage,
        page.pageSize,
        Object.assign(this.search, params)
      )
        .then(res => {
          if (res.data.code === 0) {
            this.showBtn = false
            const data = res.data.data;
            this.pageData = data.list;
            this.page.total = data.total;
            console.log(this.pageData)
            this.$nextTick(() => {
              this.showBtn = true
            })
          } else {
            this.$message.error(res.data.msg);
          }
          this.loading = false;
          this.selectRow = null;
        })
        .catch(err => {
          console.log(err.message);
        });
    },
    teamLeaderAudit(row) {
      if (!row || row === null) {
        return;
      }
      this.selectRow = row;
      // 请注意删除 在sample-list-audit-show组件中pageForTask不必要的请求参数
      this.$router.push({
        name: "audit-sample",
        params: {
          surveyFormId: this.activeTab,
          identity: row.identity,
          taskId: this.taskId,
          matchID: true,
          participant: row,
          groupLeader: this.groupLeader,
          reported: row.reported,
          canAudit: row.canAudit,
          appId: row.appId,
          type: this.$route.params.type
        },
      });
    },
    toViewForum(row) {
      let forumId = row.forumId;
      console.log("toForum:", forumId);
      if (this.validatenull(forumId)) {
        this.$router.push({
          path: `/research-forum/create/${row.appId}/${row.mergeSid}`,
          query: { source: "survey" }
        });
      } else {
        this.$router.push({
          path: `/research-forum/detail/${forumId}`,
          query: { source: "survey" }
        });
      }
    },
    openReportedAuditCfgDialog(row) {
      const taskData = {
        taskId: this.taskId,
        formId: this.activeTab
      };
      this.selectRow = row;
      this.showAuditConfigDlgVisible = true;
      this.$nextTick(() => {
        this.$refs.reportedSampleConfigDialog.initData(row, taskData);
      });
    },
    //获取tab信息
    getTabList() {
      const id = this.taskId;
      if (id) {
        //取得任务名
        this.tabVisible = false;
        getDetail(id).then(res => {
          if (res.data.code === 0) {
            this.taskName = res.data.data.name;
            let leader = res.data.data.groupLeader;
            let user = this.$store.state.user;
            this.groupLeader = res.data.data.investigators.filter(
              v => v.id === leader
            )[0];
            // console.log(res.data.data, "0000000000000")
            // console.log('**** ', res.data.data.groupLeader, '  ', this.$store.state.user.id, ' ', this.$store.state.user)
            this.isGroupLeader = leader === user.id || user.superAdmin === 1;
            this.tableOption = surveySampleOption({
              isGroupLeader: this.isGroupLeader
            });
          } else {
            this.$message.error(res.data.msg);
          }
          this.tabVisible = true;
        });

        getRelatedForm(id)
          .then(res => {
            if (res.data.code === 0) {
              const data = res.data.data;
              if (data.length > 0) {
                this.tabsOption.columns = [];
                // (${item.count})
                data.forEach((item, index) => {
                  let column = {
                    label: `${item.surveyName}`,
                    icon: "el-icon-document",
                    formId: item.oid
                  };
                  this.tabsOption.columns[index] = column;

                  if (index === 0) {
                    if (sessionStorage.getItem("childrenTab")) {
                      this.activeTab = sessionStorage.getItem("childrenTab");
                    } else {
                      this.activeTab = item.oid;
                    }
                    const params = { surveyFormId: this.activeTab };
                    this.onLoad(this.page, Object.assign(this.search, params));
                    this.getQuestionTitle(this.activeTab);
                  }
                });
              }
            } else {
              this.$message.error(res.data.msg);
            }
          })
          .catch(err => {
            console.log(err.message);
          });
      } else {
        let column = {
          label: "空调查表",
          icon: "el-icon-document",
          formId: "0"
        };
        this.tabsOption.columns = [];
        this.tabsOption.columns[0] = column;
        this.pageData = [];
        this.page.total = 0;
        this.loading = false;
      }
    },
    searchChange(params, done) {
      this.search = params;
      this.page = {
        pageSize: 10,
        currentPage: 1,
        total: 0
      };
      this.onLoad(this.page, this.search);
      done();
    },
    toQuestionnaire(row) {
      this.$store.state.contentTabs = this.$store.state.contentTabs.filter(
        item => item.name !== "questionnaire-detail"
      );
      this.$nextTick(() => {
        this.$router.push({
          name: "questionnaire-detail",
          params: {
            operation: "view",
            id: row.id,
            surveyFormId: this.activeTab
          }
        });
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
    async refreshChange() {
      const params = { surveyFormId: this.activeTab };
      await this.onLoad(this.page, Object.assign(this.search, params));
    },
    async refreshAll() {
      let row = { ...this.selectRow };
      //刷新调查对象列表， 接着刷新样本列表， 先后顺序
      await this.refreshChange();
    },
    searchReset() {
      this.search = { surveyFormId: this.activeTab };
      // const params = {surveyFormId: this.activeTab};
      // this.onLoad(this.page, Object.assign(this.search, params));
    },
    toShowAudio(row) {
      this.audioDialogVisible = true;
      this.$nextTick(() => {
        if (row.audioUris) {
          this.$refs.audioDialog.list = row.audioUris;
        }
        this.$refs.audioDialog.init();
      });
    },
    toShowVideo(row) {
      this.videoDialogVisible = true;
      this.$nextTick(() => {
        if (row.videoUris) {
          this.$refs.videoDialog.list = row.videoUris;
        }
        this.$refs.videoDialog.init();
      });
    },
    // 下载报告
    handleDownload(row) {
      console.log(row);
      let access_token = Cookies.get("access_token");
      let json = { id: row.id, surveyFormId: this.activeTab };
      let params = Object.keys(json)
        .map(function(key) {
          return encodeURIComponent(key) + "=" + encodeURIComponent(json[key]);
        })
        .join("&");
      let downloadUri =
        window.SITE_CONFIG["apiURL"] +
        "/survey/sample/download/doc" +
        "?" +
        params +
        `&access_token=${access_token}`;
      window.location.href = downloadUri;
    },
    // 导出调查表
    toExport() {
      let access_token = Cookies.get("access_token"); //验证信息
      let json = JSON.parse(JSON.stringify(this.search));
      delete json["$status"];
      json.status = AppConstant.SURVEY_SAMPLE_STATUS_EFFECTIVE;
      if (this.checkAll || this.isIndeterminate) {
        if (!this.checkAll) {
          console.log(this.checkAll);
          let props = this.checkedProps.join(",");
          this.$set(json, "props", props);
        }
        let taskId = json["taskId"];
        let surveyFormId = json["surveyFormId"];
        let formName = this.tabsOption.columns.filter(
          cln => cln.formId === surveyFormId
        )[0].label;
        let fileName =
          this.taskName + "_" + formName + "_" + new Date().getTime();
        postDownload(
          window.SITE_CONFIG["apiURL"] +
            `/survey/sample/export?taskId=${taskId}&surveyFormId=${surveyFormId}`,
          fileName + ".xlsx",
          json,
          access_token
        );
        this.visible = false;
      } else {
        this.$message.error("请至少选择一项导出！");
      }
    },
    toEdit(row) {
      this.$store.state.contentTabs = this.$store.state.contentTabs.filter(
        item => item.name !== "questionnaire-detail"
      );
      this.$nextTick(() => {
        this.$router.push({
          name: "questionnaire-detail",
          params: {
            operation: "edit",
            id: row.id,
            surveyFormId: this.activeTab
          }
        });
      });
    },
    // toDel(row) {
    //   this.$confirm("确定删除该样本?", {
    //     confirmButtonText: "确定",
    //     cancelButtonText: "取消",
    //     cancelButtonClass: "btn-custom-cancel",
    //     type: "warning"
    //   })
    //     .then(() => {
    //       //删除样本
    //       let params = {};
    //       params.surveyFormId = this.activeTab;
    //       params.taskId = this.$route.params.taskId;
    //       params.sampleId = row.id;

    //       deleteSample(params).then(res => {
    //         if (res.data.code === 0) {
    //           this.$message.success("操作成功！");
    //           this.refreshChange();
    //           //更新数量
    //           this.tabsOption.columns.some((item, idx) => {
    //             if (item.formId === params.surveyFormId) {
    //               let label = item.label;
    //               let index = label.indexOf("(");
    //               let name = label.substring(0, index);
    //               let count = label.substring(index + 1, label.indexOf(")"));

    //               item.label = name + "(" + (count > 0 ? --count : 0) + ")";
    //               // console.log('item :', item, ' ', idx)
    //               this.$set(this.tabsOption.columns, idx, item);
    //               this.$forceUpdate();
    //               return true;
    //             }
    //           });
    //         } else {
    //           return this.$message.error(res.data.msg);
    //         }
    //       });
    //     })
    //     .catch(cancel => {
    //       console.log(cancel);
    //     });
    // },
    doAudit() {
      console.log("audit test:", this.selectedIds);
      if (this.selectedIds.length === 0) {
        this.$message.warning("未选调查记录，请先选择要审核的调查记录！");
      } else {
        this.$router.push({
          name: "audit-questionnaire",
          params: { taskId: this.taskId, surveyFormId: this.activeTab },
          query: { selectedIds: this.selectedIds }
        });
      }
    },
    // 改变多选
    selectionChange(list) {
      this.selectionList = list;
      let result = [];
      list.forEach(item => {
        result.push(item.id);
      });
      this.selectedIds = result.join(",");
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
          batchDeleteSample(this.selectionList.map(s => s.identity), this.activeTab, this.taskId).then(res => {
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
    getQuestionTitle(formId) {
      getQuestions(formId).then(res => {
        if (res.data.code === 0) {
          let data = res.data.data;
          this.propOptions = [];
          this.checkedProps = [];
          this.questions = [];
          data.forEach(item => {
            if (item.prop) {
              this.propOptions.push({
                prop: item.prop,
                label: item.label
              });
              this.checkedProps.push(item.prop);
            } else {
              let obj = { label: item.label };
              this.questions.push(obj);
              if (item.child) {
                let child = [];
                let childObj;
                item.child.forEach(itm => {
                  childObj = {
                    prop: itm.prop,
                    label: itm.label
                  };
                  this.propOptions.push(childObj);
                  child.push(childObj);

                  this.checkedProps.push(itm.prop);
                });
                obj.child = child;
              }
            }
          });
        } else {
          console.error("err:", res.data.msg);
        }
      });
    }
  }
};
</script>

<style scoped>
.back-button {
  padding: 10px;
  color: #00bfbf;
  cursor: pointer;
}

.tab-nav {
  margin-bottom: 15px;
}

.task-title {
  font-size: large;
  font-weight: bold;
  display: inline-block;
  margin-bottom: 20px;
}
.back-button {
  padding: 10px;
  color: #00bfbf;
  cursor: pointer;
}
</style>
