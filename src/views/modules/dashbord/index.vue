<template>
  <!--    <div id="dashboard-view" class="dashboard-page flex-vertical full">-->
  <div class="dash-container">
    <el-row :gutter="10" class="flow-row">
      <el-col :span="6" style="height: 900px">
        <div class="left-bar1 cell-common">
          <el-row :gutter="10" style="border-bottom: 1px solid #ebeef5">
            <el-col>
              <p class="widget-title widget-title-big">
                发布调查任务数
              </p></el-col
            >
          </el-row>
          <el-row :gutter="1" class="widget-main">
            <el-col :span="15" class="widget-main-num widget-main-num-big">{{
              releaseTaskTotal
            }}</el-col>
            <el-col :span="9" class="widget-addend" align="right">
              <div class="widget-addend-title">昨日新增</div>
              <div class="widget-addend-num">
                {{ yestReleaseTask }}<i class="el-icon-caret-top"></i>
              </div>
            </el-col>
          </el-row>
        </div>
        <div class="left-bar cell-common">
          <el-row :gutter="10" style="border-bottom: 1px solid #ebeef5">
            <el-col :span="12">
              <p :title="'感染者分类'" class="widget-title widget-title-small">感染者分类</p></el-col
            >
            <el-col :span="12">
              <div align="right">
                <el-radio-group
                  v-model="statCountryFrom"
                  @change="handleStatCountryFrom"
                  size="mini"
                >
                  <el-radio-button label="month">本月</el-radio-button>
                  <el-radio-button label="year">本年</el-radio-button>
                  <el-radio-button label="all">全部</el-radio-button>
                </el-radio-group>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <div id="container1"></div>
          </el-row>
        </div>
        <div class="left-bar cell-common">
          <el-row :gutter="10" style="border-bottom: 1px solid #ebeef5">
            <el-col :span="12"
              ><p :title="'调查对象来源'" class="widget-title widget-title-small">
                调查对象来源
              </p></el-col
            >
            <el-col :span="12">
              <div align="right">
                <el-radio-group
                  v-model="statParticipantFrom"
                  @change="handleStatParticipantFrom"
                  size="mini"
                >
                  <el-radio-button label="month">本月</el-radio-button>
                  <el-radio-button label="year">本年</el-radio-button>
                  <el-radio-button label="all">全部</el-radio-button>
                </el-radio-group>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <div id="container"></div>
          </el-row>
        </div>
      </el-col>
      <el-col :span="12">
        <el-row :gutter="10">
          <el-col :span="24">
            <div class="left-bar1 cell-common">
              <div class="box">
                <div class="box-title" style="border-bottom: 1px solid #ebeef5">
                  <el-row :span="24">
                    <el-col :span="18">
                      <p class="widget-title widget-title-big">我的任务</p>
                    </el-col>
                    <el-col :span="6" style="text-align: end">
                      <el-button
                        type="text"
                        class="more"
                        @click="
                          toTask($hasPermission('dashboard:task:management'))
                        "
                        >更多</el-button
                      >
                    </el-col>
                  </el-row>
                </div>
                <div class="box-body">
                  <div class="task-list">
                    <el-row
                      :span="24"
                      v-for="(item, index) in taskList"
                      :key="index"
                      class="list-item"
                    >
                      <el-col :span="18">
                        <template>
                          <p class="name">{{ item.name }}</p>
                          <p class="due-date">
                            {{ item.start | formatDate }}
                            {{ item.end ? "至" : "" }}
                            <span v-if="item.end">{{
                              item.end | formatDate
                            }}</span>
                          </p>
                        </template>
                      </el-col>
                      <el-col :span="6">
                        <div class="status">
                          <el-tag
                            size="mini"
                            :type="
                              item.status === 0
                                ? 'info'
                                : item.status === 1
                                ? 'dark'
                                : item.status === 3
                                ? 'success'
                                : item.status === 7
                                ? 'danger'
                                : ''
                            "
                          >
                            {{ item.status | formatStatus }}</el-tag
                          >
                        </div>
                      </el-col>
                    </el-row>
                  </div>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <china-map />
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="6" style="padding-right: 20px">
        <div class="right-bar1 cell-common">
          <el-row :gutter="10" style="border-bottom: 1px solid #ebeef5">
            <el-col>
              <p class="widget-title widget-title-big">
                完成调查任务数
              </p></el-col
            >
          </el-row>
          <el-row :gutter="1" class="widget-main-right">
            <el-col :span="15" class="widget-main-num widget-main-num-big">{{
              finishTaskTotal
            }}</el-col>
            <el-col :span="9" class="widget-addend" align="right">
              <div class="widget-addend-title">昨日新增</div>
              <div class="widget-addend-num">
                {{ yestFinishTask }}<i class="el-icon-caret-top"></i>
              </div>
            </el-col>
          </el-row>
        </div>
        <div class="right-bar cell-common">
          <el-row :gutter="10" style="border-bottom: 1px solid #ebeef5">
            <el-col :span="10">
              <p :title="'调查员工作量统计'" class="widget-title widget-title-small">
                调查员工作量统计
              </p></el-col
            >
            <el-col :span="14">
              <div align="right">
                <el-radio-group
                  v-model="statInvestWork"
                  @change="handleStatInvestWork"
                  size="mini"
                >
                  <el-radio-button label="month">本月</el-radio-button>
                  <el-radio-button label="year">本年</el-radio-button>
                  <el-radio-button label="all">全部</el-radio-button>
                </el-radio-group>
              </div>
            </el-col>
          </el-row>
          <el-row>
            <div class="chart_job_table">
              <div
                class="chart_table_col"
                style="width: 30%; justify-content: center"
              >
                <p class="font-12" style="text-align: left; padding-left: 5px; font-weight: 600">
                  姓名
                </p>
              </div>
              <div
                class="chart_table_col"
                style="width: 35%; justify-content: center"
              >
                <p class="font-12" style="text-align: right; font-weight: 600">调查次数</p>
              </div>
              <div
                class="chart_table_col"
                style="width: 35%; justify-content: center"
              >
                <p class="font-12" style="text-align: right; font-weight: 600">调查人数</p>
              </div>
            </div>
            <div
              v-for="(item, index) in simpleCollectStaticData"
              :key="item.key"
            >
              <div v-if="index % 2 === 0" class="chart_job_table">
                <div
                  class="chart_table_col"
                  style="width: 30%; justify-content: center"
                >
                  <p
                    class="font-12"
                    style="text-align: left; padding-left: 5px"
                  >
                    {{ item.name }}
                  </p>
                </div>
                <div
                  class="chart_table_col"
                  style="width: 35%; justify-content: center"
                >
                  <p class="font-12" style="text-align: right">
                    {{ item.investTotal }}
                  </p>
                </div>
                <div
                  class="chart_table_col"
                  style="width: 35%; justify-content: center"
                >
                  <p class="font-12" style="text-align: right">
                    {{ item.investPeople }}
                  </p>
                </div>
              </div>
              <div
                v-else
                style="background-color: #fafafa"
                class="chart_job_table"
              >
                <div
                  class="chart_table_col"
                  style="width: 30%; justify-content: center"
                >
                  <p
                    class="font-12"
                    style="text-align: left; padding-left: 5px"
                  >
                    {{ item.name }}
                  </p>
                </div>
                <div
                  class="chart_table_col"
                  style="width: 35%; justify-content: center"
                >
                  <p class="font-12" style="text-align: right">
                    {{ item.investTotal }}
                  </p>
                </div>
                <div
                  class="chart_table_col"
                  style="width: 35%; justify-content: center"
                >
                  <p class="font-12" style="text-align: right">
                    {{ item.investPeople }}
                  </p>
                </div>
              </div>
            </div>
          </el-row>
          <el-row v-if="collectShowMoreVisible">
            <div align="center">
              <el-button
                type="text"
                style="padding-top: 5px; color: #a5a3b6; font-size: 15px"
                @click="handleInvestCollect"
                >查看更多 +</el-button
              >
            </div>
          </el-row>
        </div>
        <div class="right-bar cell-common">
          <el-row :gutter="10" style="border-bottom: 1px solid #ebeef5">
            <el-col :span="10">
              <p :title="'辖区调查员分布'" class="widget-title widget-title-small">
                辖区调查员分布
              </p></el-col
            >
          </el-row>
          <el-row>
            <div
              v-for="(item, index) in simpleInvestStaticData"
              :key="item.key"
            >
              <div v-if="index % 2 === 0" class="chart_job_table">
                <div
                  class="chart_table_col"
                  style="width: 50%; justify-content: center"
                >
                  <p
                    class="font-12"
                    style="text-align: left; padding-left: 5px"
                  >
                    {{ item.name }}
                  </p>
                </div>
                <div
                  class="chart_table_col"
                  style="width: 50%; justify-content: center"
                >
                  <p class="font-12" style="text-align: right">
                    {{ item.num }}
                  </p>
                </div>
              </div>
              <div
                v-else
                style="background-color: #fafafa"
                class="chart_job_table"
              >
                <div
                  class="chart_table_col"
                  style="width: 50%; justify-content: center"
                >
                  <p
                    class="font-12"
                    style="text-align: left; padding-left: 5px"
                  >
                    {{ item.name }}
                  </p>
                </div>
                <div
                  class="chart_table_col"
                  style="width: 50%; justify-content: center"
                >
                  <p class="font-12" style="text-align: right">
                    {{ item.num }}
                  </p>
                </div>
              </div>
            </div>
          </el-row>
          <el-row v-if="investShowMoreVisible">
            <div align="center">
              <el-button
                type="text"
                style="padding-top: 5px; color: #a5a3b6; font-size: 15px"
                @click="locDialogVisible = true"
                >查看更多 +</el-button
              >
            </div>
          </el-row>
        </div>
      </el-col>
    </el-row>
    <el-dialog
      title="调查员工作量统计"
      :visible.sync="jobDialogVisible"
      width="45%"
      class="form-tab"
      append-to-body
    >
      <avue-crud
        :data="collectPageData"
        :option="collectDistriOption"
        @size-change="collectSizeChange"
        @current-change="collectCurrentChange"
        :page.sync="page"
      >
      </avue-crud>
    </el-dialog>
    <el-dialog
      title="辖区调查员分布"
      :visible.sync="locDialogVisible"
      width="30%"
      append-to-body
    >
      <div v-for="(item, index) in investStaticData" :key="item.key">
        <div v-if="index % 2 === 0" class="chart_job_table">
          <div
            class="chart_table_col"
            style="width: 50%; justify-content: center"
          >
            <p class="font-12" style="text-align: left; padding-left: 5px">
              {{ item.name }}
            </p>
          </div>
          <div
            class="chart_table_col"
            style="width: 50%; justify-content: center"
          >
            <p class="font-12" style="text-align: right">{{ item.num }}</p>
          </div>
        </div>
        <div v-else style="background-color: #fafafa" class="chart_job_table">
          <div
            class="chart_table_col"
            style="width: 50%; justify-content: center"
          >
            <p class="font-12" style="text-align: left; padding-left: 5px">
              {{ item.name }}
            </p>
          </div>
          <div
            class="chart_table_col"
            style="width: 50%; justify-content: center"
          >
            <p class="font-12" style="text-align: right">{{ item.num }}</p>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
  <!--    </div>-->
</template>
<script>
import { Pie, Column } from "@antv/g2plot";
import { Chart } from "@antv/g2";
import {
  getStatSampleAndPeople,
  getCollectSample,
  getSampleInvest,
  getSampleSex,
  getSampleSource,
  getStatTopicTask,
  getStatCountryFrom,
  getStatParticipantFrom,
  getStatInvestWork,
} from "@/api/dashboard/dashboard";
import { getMyLatestTaskList } from "@/api/subject-task/task-management";
import moment from "moment";
import { collectDistriOption } from "./const/dataOption";
import ChinaMap from "./components/china-map";

export default {
  components: {
    ChinaMap,
  },
  data() {
    return {
      collectDistriOption: collectDistriOption,
      collectPageData: [],
      collectData: [],
      page: {
        pageSize: 10,
        currentPage: 1,
        total: 0,
        pageSizes: [10, 20, 50, 100],
      },
      taskList: [],
      // detectResultPositive: 0,
      // detectResultNegative: 0,
      // sexSample: "all",
      // sourceSample: "all",
      // collectSample: "all",
      // investSample: "all",
      statCountryFrom: "all",
      statParticipantFrom: "all",
      statInvestWork: "all",
      // sampleTotal: "获取中...",
      // yestSampChange: "",
      // peopleTotal: "获取中...",
      // peopleChange: "",
      releaseTaskTotal: "获取中...",
      yestReleaseTask: 0,
      finishTaskTotal: "获取中...",
      yestFinishTask: 0,
      negPercentage: "70%",
      posPercentage: "10%",
      // maleTotal: 0.0,
      // femaleTotal: 0.0,
      // sexStaticData: [],
      // regionStaticData: [],
      jobDialogVisible: false,
      simpleCollectStaticData: [],
      collectShowMoreVisible: false,
      collectStaticData: [],
      locDialogVisible: false,
      simpleInvestStaticData: [],
      investShowMoreVisible: false,
      investStaticData: [],
      // yearlySampleNumData: [],
      // quarterSampleNumData: [],

      numChart: null,
      piePlot: null,
      columnPlot: null,
    };
  },
  filters: {
    formatStatus(value) {
      let result = "";
      switch (value) {
        case 0:
          result = "未开始";
          break;
        case 1:
          result = "进行中";
          break;
        case 2:
          result = "取消";
          break;
        case 3:
          result = "已完成";
          break;
        case 7:
          result = "已逾期";
          break;
        default:
          break;
      }
      return result;
    },
    formatDate(value) {
      return moment(new Date(value)).format("YYYY-MM-DD");
    },
  },
  created() {
    this.init();
  },
  beforeDestroy() {
    console.log("destroy dash-board......");
    if (this.piePlot != null) {
      this.piePlot.destroy();
      this.piePlot = null;
    }
    if (this.numChart != null) {
      this.numChart.destroy();
      this.numChart = null;
    }
    if (this.columnPlot != null) {
      this.columnPlot.destroy();
      this.columnPlot = null;
    }
  },
  mounted() {
    if (window.loginLoading !== undefined) {
      window.loginLoading.close();
    }
  },
  methods: {
    changeArrGroup(arr, newArrLength) {
      let changeIndex = 0;
      let secondArr = [];
      while (changeIndex < arr.length) {
        secondArr.push(arr.slice(changeIndex, (changeIndex += newArrLength)));
      }
      return secondArr;
    },
    handleInvestCollect() {
      this.jobDialogVisible = true;
      this.collectData = this.changeArrGroup(
        this.collectStaticData,
        this.page.pageSize
      );
      this.page.total = this.collectStaticData.length;
      this.collectPageData = this.collectData[0];
    },
    collectSizeChange(val) {
      this.page.pageSize = val;
      this.collectData = this.changeArrGroup(
        this.collectStaticData,
        this.page.pageSize
      );
      this.collectPageData = this.collectData[0];
      this.page.currentPage = 1;
    },
    collectCurrentChange(val) {
      this.page.currentPage = val;
      this.collectPageData = this.collectData[val - 1];
    },
    init() {
      //只获取最新一个即可
      this.handleLatestTask();
      // this.handleStatSampleAndPeople(params);
      this.handleStatTopicTask();
      this.handleStatCountryFrom("all");
      this.handleStatParticipantFrom("all");
      this.handleStatInvestWork("all");
      this.handleSampleInvest("all");
    },
    // 我的任务
    handleLatestTask() {
      getMyLatestTaskList({ order: "desc", sort: "createAt" }).then((res) => {
        const data = res.data.data;
        if (data.list.length > 0) {
          this.taskList.push({
            name: data.list[0].name,
            start: data.list[0].start,
            end: data.list[0].end,
            status: data.list[0].status,
          });
        }
      });
    },
    // 任务统计
    handleStatTopicTask() {
      getStatTopicTask().then((res) => {
        if (res.data.code === 0) {
          let data = res.data.data;
          this.releaseTaskTotal = data.releaseTaskTotal;
          this.finishTaskTotal = data.finishTaskTotal;
          this.yestReleaseTask = data.yestReleaseTask;
          this.yestFinishTask = data.yestFinishTask;
        }
      });
    },
    // 病例来源
    handleStatCountryFrom(limit = "all") {
      getStatCountryFrom(limit).then((res) => {
        if (res.data.code === 0) {
          const pid = "container1";
          const id = "source1";
          this.createElementForDrawingChart(pid, id);
          const data = [
            {
              name: "境外输入",
              total: res.data.data.abroadTotal,
            },
            {
              name: "本土感染",
              total: res.data.data.localTotal,
            },
          ];
          this.piePlot = new Pie(id, {
            autoFit: false,
            height: 200,
            appendPadding: 10,
            data,
            angleField: "total",
            colorField: "name",
            color: ["#03C4DC", "#FFB822"],
            radius: 1,
            innerRadius: 0.64,
            meta: {
              total: {
                formatter: (v) => `${v}`,
              },
            },
            label: {
              type: "inner",
              offset: "-50%",
              autoRotate: false,
              style: { textAlign: "center" },
              formatter: ({ percent }) => `${(percent * 100).toFixed(0)}%`,
            },
            statistic: {
              title: {
                offsetY: -8,
                customHtml: (container, view, datum) => {
                  return datum !== undefined && datum.name
                    ? datum.name
                    : "总计";
                },
              },
              content: {
                offsetY: -4,
              },
            },
            // 添加 中心统计文本 交互
            interactions: [
              { type: "element-selected" },
              { type: "element-active" },
              {
                type: "pie-statistic-active",
                cfg: {
                  start: [
                    {
                      trigger: "element:mouseenter",
                      action: "pie-statistic:change",
                    },
                    {
                      trigger: "legend-item:mouseenter",
                      action: "pie-statistic:change",
                    },
                  ],
                  end: [
                    {
                      trigger: "element:mouseleave",
                      action: "pie-statistic:reset",
                    },
                    {
                      trigger: "legend-item:mouseleave",
                      action: "pie-statistic:reset",
                    },
                  ],
                },
              },
            ],
          });
          this.piePlot.render();
        }
      });
    },
    // 调查对象来源
    handleStatParticipantFrom(limit = "all") {
      getStatParticipantFrom(limit).then((res) => {
        if (res.data.code == 0) {
          const pid = "container";
          const id = "source";
          this.createElementForDrawingChart(pid, id);
          let data = res.data.data;
          if (data) {
            let nameMap = { 0: "大疫情网", 1: "其他" };
            data.forEach((item) => {
              item.name = nameMap[item.name];
            });
          }

          this.columnPlot = new Column(id, {
            autoFit: false,
            height: 200,
            appendPadding: 10,
            columnWidthRatio: 0.4,
            color: "#7169CA",
            data,
            xField: "name",
            yField: "total",
            label: {
              // 可手动配置 label 数据标签位置
              position: "middle", // 'top', 'bottom', 'middle',
              // 配置样式
              style: {
                fill: "#FFFFFF",
                opacity: 0.6,
              },
            },
            xAxis: {
              label: {
                autoHide: true,
                autoRotate: false,
              },
            },
            yAxis: {
              label: null,
            },
            meta: {
              name: {
                alias: "来源",
              },
              total: {
                alias: "数量",
              },
            },
          });

          this.columnPlot.render();
        }
      });
    },
    // 调查员工作量统计
    handleStatInvestWork(limit = "all") {
      this.collectStaticData = [];
      this.simpleCollectStaticData = [];
      getStatInvestWork(limit).then((res) => {
        if (res.data.code === 0) {
          const max = 4;
          let data = res.data.data;
          data.forEach((item, index) => {
            this.collectStaticData.push({
              name: item.name,
              key: item._id,
              investTotal: item.investTotal.toString(),
              investPeople: item.investPeople.toString(),
            });
            if (index < max) {
              this.simpleCollectStaticData.push({
                name: item.name,
                key: item._id,
                investTotal: item.investTotal.toString(),
                investPeople: item.investPeople.toString(),
              });
            }
          });
          this.collectShowMoreVisible =
            this.collectStaticData.length > this.simpleCollectStaticData.length;
        }
      });
    },
    // 辖区调查员
    handleSampleInvest(limit = "all") {
      getSampleInvest(limit).then((res) => {
        let key = new Date().getTime();
        const max = 4;
        if (res.data.code === 0) {
          let data = res.data.data;
          data.forEach((item, index) => {
            const total = item.total;
            this.investStaticData.push({
              name: item.deptName,
              key: key++,
              num: total.toString(),
            });
            if (index < max) {
              this.simpleInvestStaticData.push({
                name: item.deptName,
                key: key++,
                num: total.toString(),
              });
            }
          });
          this.investShowMoreVisible = this.simpleInvestStaticData.length > max;
        }
      });
    },
    // 原
    handleStatSampleAndPeople(params) {
      getStatSampleAndPeople(params).then((res) => {
        if (res.data.code === 0) {
          let data = res.data.data;
          this.sampleTotal = data.sampleTotal;
          this.yestSampChange = data.yestSampChange;
          this.peopleTotal = data.peopleTotal;
          this.peopleChange = data.peopleChange;
        }
        getSampleSex("all").then((res) => {
          if (res.data.code === 0) {
            const pid = "container1";
            const id = "source1";
            this.createElementForDrawingChart(pid, id);
            const data = [
              {
                name: "男",
                total: res.data.data.maleTotal,
              },
              {
                name: "女",
                total: res.data.data.femaleTotal,
              },
            ];
            this.piePlot = new Pie(id, {
              autoFit: false,
              height: 200,
              appendPadding: 10,
              data,
              angleField: "total",
              colorField: "name",
              color: ["#03C4DC", "#FFB822"],
              radius: 1,
              innerRadius: 0.64,
              meta: {
                total: {
                  formatter: (v) => `${v}`,
                },
              },
              label: {
                type: "inner",
                offset: "-50%",
                autoRotate: false,
                style: { textAlign: "center" },
                formatter: ({ percent }) => `${(percent * 100).toFixed(0)}%`,
              },
              statistic: {
                title: {
                  offsetY: -8,
                  customHtml: (container, view, datum) => {
                    return datum !== undefined && datum.name
                      ? datum.name
                      : "总计";
                  },
                },
                content: {
                  offsetY: -4,
                },
              },
              // 添加 中心统计文本 交互
              interactions: [
                { type: "element-selected" },
                { type: "element-active" },
                {
                  type: "pie-statistic-active",
                  cfg: {
                    start: [
                      {
                        trigger: "element:mouseenter",
                        action: "pie-statistic:change",
                      },
                      {
                        trigger: "legend-item:mouseenter",
                        action: "pie-statistic:change",
                      },
                    ],
                    end: [
                      {
                        trigger: "element:mouseleave",
                        action: "pie-statistic:reset",
                      },
                      {
                        trigger: "legend-item:mouseleave",
                        action: "pie-statistic:reset",
                      },
                    ],
                  },
                },
              ],
            });
            this.piePlot.render();
          }
          this.handleSampleSource("all");
        });
      });
    },
    handleSampleSource(src) {
      getSampleSource(src).then((res) => {
        if (res.data.code === 0) {
          const pid = "container";
          const id = "source";
          this.createElementForDrawingChart(pid, id);
          const data = res.data.data;
          // console.log('pad......', data)
          if (data) {
            let nameMap = { pc: "电脑", pad: "平板", mobile: "手机" };
            data.forEach((item) => {
              item.name = nameMap[item.name];
            });
          }

          this.columnPlot = new Column(id, {
            autoFit: false,
            height: 200,
            appendPadding: 10,
            columnWidthRatio: 0.4,
            data,
            xField: "name",
            yField: "total",
            color: "#7169CA",
            label: {
              // 可手动配置 label 数据标签位置
              position: "middle", // 'top', 'bottom', 'middle',
              // 配置样式
              style: {
                fill: "#FFFFFF",
                opacity: 0.6,
              },
            },
            xAxis: {
              label: {
                autoHide: true,
                autoRotate: false,
              },
            },
            yAxis: {
              label: null,
            },
            meta: {
              name: {
                alias: "来源",
              },
              total: {
                alias: "数量",
              },
            },
          });

          this.columnPlot.render();
        }
        const max = 4;
        getCollectSample(src).then((res) => {
          let key = new Date().getTime();
          if (res.data.code === 0) {
            let data = res.data.data;
            data.forEach((item, index) => {
              this.collectStaticData.push({
                name: item.name,
                key: key++,
                num: item.total.toString(),
              });
              if (index < max) {
                this.simpleCollectStaticData.push({
                  name: item.name,
                  key: key++,
                  num: item.total.toString(),
                });
              }
            });
            this.collectShowMoreVisible =
              this.collectStaticData.length >
              this.simpleCollectStaticData.length;
          }
          getSampleInvest(src).then((res) => {
            let key = new Date().getTime();
            if (res.data.code === 0) {
              let data = res.data.data;
              data.forEach((item, index) => {
                // const total = item.total + item.subTotal //包括子部门人数
                const total = item.total;
                this.investStaticData.push({
                  name: item.deptName,
                  key: key++,
                  num: total.toString(),
                });
                if (index < max) {
                  this.simpleInvestStaticData.push({
                    name: item.deptName,
                    key: key++,
                    num: total.toString(),
                  });
                }
              });
              this.investShowMoreVisible =
                this.simpleInvestStaticData.length > max;
            }
          });
        });
      });
    },
    handleSexSpread(limit) {
      getSampleSex(limit).then((res) => {
        if (res.data.code == 0) {
          const pid = "container1";
          const id = "source1";
          this.createElementForDrawingChart(pid, id);
          const data = [
            {
              name: "男",
              total: res.data.data.maleTotal,
            },
            {
              name: "女",
              total: res.data.data.femaleTotal,
            },
          ];

          this.piePlot = new Pie(id, {
            autoFit: false,
            height: 200,
            appendPadding: 10,
            data,
            angleField: "total",
            colorField: "name",
            radius: 1,
            innerRadius: 0.64,
            color: ["#03C4DC", "#FFB822"],
            meta: {
              total: {
                formatter: (v) => `${v}`,
              },
            },
            label: {
              type: "inner",
              offset: "-50%",
              autoRotate: false,
              style: { textAlign: "center" },
              formatter: ({ percent }) => `${(percent * 100).toFixed(0)}%`,
            },
            statistic: {
              title: {
                offsetY: -8,
                customHtml: (container, view, datum) => {
                  return datum !== undefined && datum.name
                    ? datum.name
                    : "总计";
                },
              },
              content: {
                offsetY: -4,
              },
            },
            // 添加 中心统计文本 交互
            interactions: [
              { type: "element-selected" },
              { type: "element-active" },
              {
                type: "pie-statistic-active",
                cfg: {
                  start: [
                    {
                      trigger: "element:mouseenter",
                      action: "pie-statistic:change",
                    },
                    {
                      trigger: "legend-item:mouseenter",
                      action: "pie-statistic:change",
                    },
                  ],
                  end: [
                    {
                      trigger: "element:mouseleave",
                      action: "pie-statistic:reset",
                    },
                    {
                      trigger: "legend-item:mouseleave",
                      action: "pie-statistic:reset",
                    },
                  ],
                },
              },
            ],
          });

          this.piePlot.render();
        }
      });
    },
    handleSourceSpread(limit) {
      getSampleSource(limit).then((res) => {
        if (res.data.code == 0) {
          const pid = "container";
          const id = "source";
          this.createElementForDrawingChart(pid, id);
          const data = res.data.data;
          if (data) {
            let nameMap = { pc: "电脑", pad: "平板", mobile: "手机" };
            data.forEach((item) => {
              item.name = nameMap[item.name];
            });
          }

          this.columnPlot = new Column(id, {
            autoFit: false,
            height: 200,
            appendPadding: 10,
            columnWidthRatio: 0.4,
            color: "#7169CA",
            data,
            xField: "name",
            yField: "total",
            label: {
              // 可手动配置 label 数据标签位置
              position: "middle", // 'top', 'bottom', 'middle',
              // 配置样式
              style: {
                fill: "#FFFFFF",
                opacity: 0.6,
              },
            },
            xAxis: {
              label: {
                autoHide: true,
                autoRotate: false,
              },
            },
            yAxis: {
              label: null,
            },
            meta: {
              name: {
                alias: "来源",
              },
              total: {
                alias: "数量",
              },
            },
          });

          this.columnPlot.render();
        }
      });
    },
    handleCollectSpread(limit) {
      let key = new Date().getTime();
      getCollectSample(limit).then((res) => {
        this.simpleCollectStaticData = [];
        this.collectStaticData = [];
        if (res.data.code == 0) {
          let data = res.data.data;
          data.forEach((item, index) => {
            this.collectStaticData.push({
              name: item.name,
              key: key++,
              num: item.total.toString(),
            });
            if (index < 4) {
              this.simpleCollectStaticData.push({
                name: item.name,
                key: key++,
                num: item.total.toString(),
              });
            }
          });
          this.collectShowMoreVisible =
            this.collectStaticData.length > this.simpleCollectStaticData.length;
        }
      });
    },
    toTask(permission) {
      if (permission) {
        this.$store.state.contentTabs = this.$store.state.contentTabs.filter(
          (item) => item.name !== "subject-task-task-management"
        );
        this.$nextTick(() => {
          this.$router.push({ name: "subject-task-task-management" });
        });
      } else {
        this.$store.state.contentTabs = this.$store.state.contentTabs.filter(
          (item) => item.name !== "subject-task-my-task-management"
        );
        this.$nextTick(() => {
          this.$router.push({ name: "subject-task-my-task-management" });
        });
      }
    },
    createElementForDrawingChart(pid, id) {
      if (pid === id) {
        this.$message.error("图表绘图区域父区域和子区域属性id的值不能相同,");
        return;
      }
      const parentEle = document.getElementById(pid);
      let childNode = document.createElement("div");
      childNode.setAttribute("id", id);
      if (parentEle !== null) {
        if (
          document.getElementById(id) !== null &&
          document.getElementById(id) !== undefined
        ) {
          parentEle.removeChild(parentEle.childNodes[0]);
        }
        parentEle.appendChild(childNode);
      } else {
        console.log("画面区域不存在，请重新检查输入参数");
        return;
      }
    },
    drawYearlySampleNumChart(data, pid, id) {
      this.createElementForDrawingChart(pid, id);
      this.numChart = new Chart({
        container: id,
        autoFit: true,
        height: 228,
      });

      this.numChart.data(data);
      this.numChart.scale({
        value: {
          alias: "样本数",
          min: 0,
          tickCount: 6,
          nice: true,
        },
        year: {
          range: [0, 1],
        },
      });

      this.numChart.tooltip({
        showCrosshairs: true,
        shared: true,
      });
      // chart.area().position('year*value').color('l(270) 1:#7560F9 0:#FFFFFF').shape('smooth')
      this.numChart
        .line()
        .position("year*value")
        .color("#7560F9")
        .shape("smooth");
      this.numChart
        .area()
        .position("year*value")
        .color("#7560F9")
        .shape("smooth");
      this.numChart.render();
    },
  },
};
</script>
<style>
html,
body {
  overflow: auto;
  margin: 0;
  font-family: "Microsoft YaHei", 微软雅黑;
}
.task-list .list-item {
  padding: 10px;
}
.task-list .list-item .name {
  line-height: 24px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  text-overflow: ellipsis;
  overflow: hidden;
  word-wrap: break-word;
  word-break: break-all;
  margin: 0;
}
.task-list .list-item .due-date {
  color: rgb(165, 163, 182);
  margin: 0;
}
.task-list .list-item .status {
  text-align: right;
}
.dash-container {
  padding: 15px;
  position: sticky;
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  display: flex;
  display: -webkit-flex; /* Safari */
  flex-direction: row;
  align-items: flex-start;
  background-color: #e0e7f0;
}
.box {
  background-color: #fff;
}
.box-title {
  position: relative;
  color: #333;
  font-weight: bold;
}
.more {
  padding: 10px;
}
.flow-row {
  width: 100%;
}
.cell-common {
  width: 100%;
  margin: 0 0 15px;
  padding: 10px;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
}
.left-bar1 {
  min-height: 117px;
}
.left-bar {
  min-height: 250px;
}
.mid-bar-cell {
  min-height: 80px;
  margin-bottom: 10px;
}
.right-bar {
  min-height: 250px;
}
.right-bar1 {
  min-height: 100px;
}
.widget-title {
  font-weight: 900;
  color: #6a6876;
  padding: 0;
  margin: 0;
  line-height: 36px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  text-overflow: ellipsis;
  overflow: hidden;
  word-wrap: break-word;
  word-break: break-all;
}
.widget-title-big {
  font-size: 18px;
}
.widget-title-small {
  font-size: 16px;
}
.widget-main,
.widget-main-right {
  padding-top: 10px;
}
.widget-main-num {
  color: #755ff9;
}
.widget-main-num-big {
  font-size: 40px;
  font-weight: 900;
}
.widget-main-num-small {
  font-size: 20px;
  font-weight: 900;
}
.widget-addend {
  align-items: flex-end;
}
.widget-addend-title {
  font-size: 11px;
  color: #a4a5ad;
  font-weight: bold;
  margin: 5px;
}
.widget-addend-num {
  font-size: 15px;
  font-weight: bold;
  color: #f75679;
  margin: 5px;
}
.widget-color-box {
  margin: 5px 8px 5px 0px;
  padding: 5px;
  min-height: 60px;
  border-radius: 3px;
}
.bg-green {
  background-color: #02b82b;
}
.bg-orange {
  background-color: #fd8f69;
}
.bg-purple {
  background-color: #7560f9;
}
.bg-dark-pink {
  background-color: #f76894;
}
.text-white {
  margin: 3px;
  color: white;
}
.font-10 {
  font-size: 10px;
}
.font-12 {
  font-size: 10px;
}
.font-18 {
  font-size: 18px;
  font-weight: bold;
}
.progress-bar {
  width: 100%;
  min-height: 10px;
  margin: 2px;
  padding: 5px 10px 5px 0px;
  background-color: white;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start;
}
.progress-bar-inner {
  display: inline-flex;
  height: 2px;
  margin-right: 1px;
  border-bottom-right-radius: 2px;
}
.stack-column-outer {
  width: 100%;
  margin: 2px;
  background-color: white;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: center;
  align-content: center;
  height: 25px;
}
.stack-column-inner {
  display: inline-flex;
  height: 6px;
  border-radius: 6px;
  margin-right: 2px;
  align-items: center;
}
.chart_table {
  width: 100%;
  height: 20px;
  margin: 2px;
  background-color: white;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start;
}
.chart_job_table {
  width: 100%;
  height: 20px;
  padding: 10px;
  background-color: white;
  display: inline-table;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start;
}
.chart_place_table {
  width: 100%;
  height: 20px;
  margin: 1px;
  background-color: white;
  display: contents;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start;
}
.chart_table_col {
  display: inline-flex;
  padding-left: 5px;
  height: 20px;
}
.chart_box {
  width: 100%;
  height: 100%;
  margin-top: 50px;
  background-color: white;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
}
.chart_box_row {
  display: inline-flex;
}
.infolegend {
  padding: 6px 8px;
  font: 14px/16px Arial, Helvetica, sans-serif;
  background: white;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  border-radius: 5px;
}
.infolegend h4 {
  margin: 0 0 5px;
  color: #777;
}
.legend {
  line-height: 20px;
  color: #555;
}
.legend i {
  width: 18px;
  height: 18px;
  float: left;
  margin-right: 8px;
  opacity: 0.7;
}
.infolegend.legend .title {
  color: #6a6876;
  margin: 0 0 10px;
  font-weight: 900;
  font-size: 16px;
}
</style>
<style lang="scss">
.form-tab {
  .el-dialog__body {
    padding: 0;
  }
  .avue-crud__menu {
    min-height: 0;
    margin-bottom: 0;
  }
}
.desc-text {
  padding: 10px;
  font-size: 14px;
  font-weight: bold;
}
</style>
