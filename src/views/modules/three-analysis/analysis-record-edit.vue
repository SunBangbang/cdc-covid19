<template>
  <div class="analysis-record-container">
    <div class="header-top">
      <el-row>
        <el-col>
          <div>
            <i class="el-icon-arrow-left back-button" @click="goBack">返回</i>
          </div>
        </el-col>
      </el-row>
      <el-row>
        <header-list
          :recordId="recordId"
          :isView="isView"
          :taskData.sync="headerListData"
          :filter.sync="filter"
          :sampleData.sync="sampleData"
          @update="handleUpdate"
          @toEdit="toEdit"
          @refreshQuery="refreshQuery"
        ></header-list>
      </el-row>
    </div>
    <div class="page-container">
      <el-row style="width: 100%">
        <el-collapse
          v-model="activeName"
          @change="handleFilterTabClick"
          style="padding: 15px; background: white"
        >
          <el-collapse-item name="filter" v-if="$route.query.type === 'filter'">
            <i class="el-icon-s-order"></i>分析变量
            <a
              style="
                padding-left: 30px;
                font-size: 10px;
                text-decoration: none;
                color: #dbdbdb;
              "
              >仅限调查表中单选、多选、下拉选择且有数据的字段</a
            >
            <el-row style="padding-left: 30px">
              <el-form>
                <el-form-item>
                  <el-select
                    v-model="queriedColumns"
                    style="width: 100%"
                    size="mini"
                    multiple
                    clearable
                    filterable
                    placeholder="请选择"
                  >
                    <el-option
                      v-for="item in questOptions"
                      :key="item.prop"
                      :label="item.label"
                      :title="item.title"
                      :value="item.prop"
                    >
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-form>
            </el-row>

            <i class="el-icon-s-order"></i> 条件筛选
            <el-row style="padding-left: -30px">
              <el-row>
                <el-form
                  class="filer-box"
                  v-if="tabFilterBoxVisible"
                  size="mini"
                >
                  <el-col
                    :span="8"
                    v-for="(field, index) in analysisFilter"
                    :key="index"
                  >
                    <el-form-item style="margin-bottom: 15px">
                      <el-row :gutter="30">
                        <el-col :span="1" class="filtr-btn__a">{{
                          index === 0 ? "&nbsp;" : "和"
                        }}</el-col>
                        <el-col :span="18">
                          <el-select
                            v-model="analysisFilter[index]"
                            placeholder="请选择筛选条件"
                            class="block"
                            @change="changeFilter(index)"
                          >
                            <el-option
                              v-for="item in dicData_analysis_filter"
                              :key="item.seq"
                              :label="item.label"
                              :value="item.seq"
                              :disabled="item.disabled"
                            >
                            </el-option>
                          </el-select>
                          <div style="margin-top: 5px">
                            <el-cascader
                              class="block"
                              v-if="filterType[index] === 'cascader'"
                              v-model="analysisValue[index]"
                              clearable
                              :options="filterForm[index]"
                              filterable
                              :props="props"
                            >
                            </el-cascader>
                            <el-select
                              v-if="filterType[index] === 'radio'"
                              class="block"
                              placeholder="请选择"
                              size="small"
                              v-model="analysisValue[index]"
                            >
                              <el-option label="全部" value="all"> </el-option>
                              <el-option
                                v-for="item in filterForm[index]"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                              >
                              </el-option>
                            </el-select>
                            <el-select
                              v-if="filterType[index] === 'select'"
                              class="block"
                              placeholder="请选择"
                              filterable
                              size="small"
                              v-model="analysisValue[index]"
                            >
                              <el-option label="全部" value="all"> </el-option>
                              <el-option
                                v-for="item in filterForm[index]"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                              >
                              </el-option>
                            </el-select>
                            <el-select
                              v-if="filterType[index] === 'checkbox'"
                              class="block"
                              multiple
                              placeholder="请选择"
                              size="small"
                              v-model="analysisValue[index]"
                            >
                              <el-option
                                v-for="item in filterForm[index]"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                              >
                              </el-option>
                            </el-select>
                            <el-date-picker
                              style="width: 100%"
                              v-if="
                                filterType[index] === 'date' ||
                                filterType[index] === 'datetime' ||
                                filterType[index] === 'daterange' ||
                                filterType[index] === 'datetimerange'
                              "
                              v-model="analysisValue[index]"
                              type="daterange"
                              range-separator="至"
                              start-placeholder="开始日期"
                              end-placeholder="结束日期"
                              format="yyyy-MM-dd"
                              value-format="yyyy-MM-dd HH:mm:ss"
                            >
                            </el-date-picker>
                            <el-row
                              :gutter="10"
                              v-if="
                                filterType[index] === 'map' ||
                                filterType[index] === 'regionSelect'
                              "
                            >
                              <el-col :span="24">
                                <avue-input-map
                                  class="block"
                                  placeholder="请选择地图"
                                  v-model="analysisValue[index]"
                                >
                                </avue-input-map>
                                <div class="mapScope" style="padding-top: 5px">
                                  <el-input
                                    type="text"
                                    v-model="mapScope[index]"
                                    maxlength="3"
                                  >
                                    <template slot="append">km范围内</template>
                                  </el-input>
                                </div>
                              </el-col>
                            </el-row>
                          </div>
                        </el-col>
                        <el-col :span="3" style="padding-top: 15px">
                          <el-button
                            type="info"
                            icon="el-icon-delete"
                            circle
                            @click="deleteOneFilter(index)"
                            :disabled="isView"
                          ></el-button>
                        </el-col>
                      </el-row>
                    </el-form-item>
                  </el-col>
                </el-form>
              </el-row>
              <el-row style="text-align: center">
                <el-button
                  class="filter-btn filtr-btn__add"
                  @click="handleAddFilter"
                  icon="el-icon-plus"
                  :disabled="isView"
                  size="mini"
                >
                  添加条件
                </el-button>
                <el-button
                  class="filter-btn"
                  type="primary"
                  @click="handleFilterAnalysis"
                  :disabled="isView"
                  v-if="tabFilterBoxVisible"
                  size="mini"
                >
                  分析
                </el-button>
                <el-button
                  class="filter-btn"
                  @click="handleResetFilter"
                  :disabled="isView"
                  v-if="tabFilterBoxVisible"
                  size="mini"
                >
                  清空条件
                </el-button>
              </el-row>
            </el-row>
          </el-collapse-item>
          <el-collapse-item name="cross" v-if="$route.query.type === 'cross'">
            <template #title> <i class="el-icon-sort"></i> 交叉分析 </template>
            <el-row>
              <el-form label-position="top" label-suffix=":" size="mini">
                <el-row style="padding: 0 100px" :gutter="100">
                  <el-col :span="12">
                    <el-form-item label="X变量">
                      <avue-select
                        v-model="form.cross.xField"
                        placeholder="请选择X变量"
                        type="tree"
                        :dic="dicData_cross_filter.xFilters"
                        :props="props1"
                        @change="handleChangeX"
                        class="block"
                      >
                      </avue-select>
                    </el-form-item>
                    <el-form-item
                      label="年龄分组"
                      v-if="form.cross.xField == 'age'"
                    >
                      <el-input
                        v-model="form.cross.maxAge"
                        placeholder="请输入年龄分组，用','隔开(可不输入)"
                      ></el-input>
                      <div class="remark">
                        年龄最大值范围，用英文逗号','隔开,
                        默认10,20,30,40,50,60,70,80,90,100
                      </div>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item
                      label="Y变量"
                      v-for="(field, indexY) in form.cross.yFields"
                      :key="indexY"
                    >
                      <avue-select
                        v-model="form.cross.yFields[indexY]"
                        placeholder="请选择Y变量"
                        type="tree"
                        :dic="dicData_cross_filter.yFilters"
                        :props="props1"
                        @change="handleChangeCrossFilterY"
                        class="y-select"
                      >
                      </avue-select>
                      <el-button type="text" @click="delYField(indexY)">删除</el-button>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
              <el-row style="align-items: center; text-align: center">
                <el-button
                  class="filter-btn filtr-btn__add"
                  @click="handleAddCrossFilterY"
                  icon="el-icon-plus"
                  :disabled="isView"
                  size="mini"
                >
                  添加条件
                </el-button>
                <el-button
                  class="filter-btn"
                  type="primary"
                  :disabled="isView"
                  @click="handleStartCrossAnalysis"
                  size="mini"
                >
                  分析
                </el-button>
                <el-button
                  class="filter-btn"
                  :disabled="isView"
                  @click="handleResetCrossFilter()"
                  size="mini"
                >
                  清空条件
                </el-button>
              </el-row>
            </el-row>
          </el-collapse-item>
          <el-collapse-item
            name="filterResult"
            v-if="$route.query.type === 'filter'"
          >
            <template #title>
              <el-row style="width: 100%">
                <el-col :span="12">
                  <div class="inline-block" style="margin-right: 30px">
                    <p>
                      根据题目筛选有效样本:
                      <span class="blue-txt">{{ condSampleNum }}</span>
                    </p>
                  </div>
                </el-col>
                <el-col :span="12" style="padding-right: 30px">
                  <div class="page-content_operation inline-block fr">
                    <!-- <el-button size="mini" icon="el-icon-printer" v-print="printConfig">打印</el-button> -->
                    <el-button
                      size="mini"
                      icon="el-icon-printer"
                      @click.stop="handlePrint"
                      >打印</el-button
                    >
                    <el-button
                      size="mini"
                      icon="el-icon-document"
                      @click.stop="handleSave('filter')"
                      >保存本地</el-button
                    >
                    <el-button
                      size="mini"
                      icon="el-icon-download"
                      @click.stop="handleDownloadSample"
                      >下载样本</el-button
                    >
                  </div>
                </el-col>
              </el-row>
            </template>
            <el-card class="aui-card--fill" v-if="filterList.length > 0">
              <div id="chart" ref="printDom">
                <div>
                  <div class="page-content--filter" v-if="refresh">
                    <div
                      class="filter-item"
                      v-for="(item, indexF) in filterList"
                      :key="indexF"
                    >
                      <div class="header">
                        <span class="title"
                          >{{ indexF + 1 }}、{{ item.title }}</span
                        >
                        <span class="desc gray-txt">{{
                          item.type | formatType
                        }}</span>
                        <div class="filter-type-box fr">
                          <div
                            v-if="
                              item.type === 'input' ||
                              item.type === 'radio' ||
                              item.type === 'checkbox' ||
                              item.type === 'cascader' ||
                              item.type === 'select' ||
                              item.prop === 'age'
                            "
                          >
                            <el-button
                              @click="
                                handleChangeFilterChart(
                                  'bisicBar',
                                  item.data,
                                  indexF
                                )
                              "
                              size="mini"
                              >条形图</el-button
                            >
                            <el-button
                              @click="
                                handleChangeFilterChart(
                                  'bisicHistogram',
                                  item.data,
                                  indexF
                                )
                              "
                              size="mini"
                              >柱状图</el-button
                            >
                            <el-button
                              @click="
                                handleChangeFilterChart(
                                  'bisicPie',
                                  item.data,
                                  indexF
                                )
                              "
                              size="mini"
                              >饼图</el-button
                            >
                          </div>
                          <div
                            v-if="
                              item.type === 'map' ||
                              item.type === 'regionSelect'
                            "
                          >
                            <el-button @click="drawMap(indexF)" size="mini"
                              >显示热力图</el-button
                            >
                          </div>
                        </div>
                      </div>
                      <div class="filter-charts-container">
                        <el-row>
                          <el-col>
                            <div
                              v-if="
                                item.type === 'map' ||
                                item.type === 'regionSelect'
                              "
                            >
                              <el-row>
                                <div
                                  :id="'filter-map-container-' + indexF"
                                  class="filter-map-cls"
                                ></div>
                              </el-row>
                            </div>
                            <div
                              v-else
                              :id="'filter-chart-container-' + indexF"
                            ></div>
                          </el-col>
                        </el-row>
                      </div>
                      <div class="filter-select-sample-data">
                        <el-button
                          @click="handleSetSampleDataVisible(item)"
                          size="mini"
                          >查看全部数据</el-button
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-card>
            <anya-empty v-else></anya-empty>
          </el-collapse-item>
          <el-collapse-item
            name="crossResult"
            v-if="$route.query.type === 'cross'"
          >
            <template #title>
              <el-col :span="12">
                <div class="page-content__title inline-block">
                  <p>交叉分析结果：</p>
                </div>
              </el-col>
              <el-col :span="12" style="padding-right: 30px">
                <div class="page-content_operation inline-block fr">
                  <!-- <el-button size="mini" icon="el-icon-printer" v-print="printConfig">打印</el-button> -->
                  <el-button
                    size="mini"
                    icon="el-icon-printer"
                    @click="handlePrint"
                    >打印</el-button
                  >
                  <el-button
                    size="mini"
                    icon="el-icon-document"
                    @click="handleSave('cross')"
                    >保存本地</el-button
                  >
                  <el-button
                    size="mini"
                    icon="el-icon-download"
                    @click="handleDownloadSample"
                    >下载样本</el-button
                  >
                </div>
              </el-col>
            </template>
            <el-card
              class="aui-card--fill report-body"
              v-if="crossTableOption.length > 0"
            >
              <div id="chart" ref="printDom" class="page-content--filter">
                <div>
                  <div
                    v-for="(item, index) in crossTableOption"
                    :key="index"
                    class="filter-item"
                  >
                    <div class="page-content_table__title">
                      {{ item.formName }}
                    </div>
                    <el-table :data="crossTableData[index]" size="mini" border>
                      <el-table-column
                        v-for="(itemT, indexT) in item.list"
                        :label="itemT.label"
                        :prop="itemT.value"
                        :key="indexT"
                      ></el-table-column>
                    </el-table>
                    <div class="table-charts">
                      <div class="change-type-box" size="mini">
                        <el-button
                          @click="handleChangeChart('groupHistogram', index)"
                          size="mini"
                          >分组柱状图</el-button
                        >
                        <!--                                    <el-button @click="handleChangeChart('stackedBar', index)" size="mini">堆叠条形图</el-button>-->
                        <el-button
                          @click="handleChangeChart('stackedHistogram', index)"
                          size="mini"
                          >堆叠柱状图</el-button
                        >
                        <!-- <el-button @click="handleChangeChart('wiggleLine', index)" size="mini">折线图</el-button> -->
                      </div>
                      <div :id="'chart-container-' + index"></div>
                    </div>
                  </div>
                </div>
              </div>
            </el-card>
            <anya-empty v-else></anya-empty>
          </el-collapse-item>
        </el-collapse>
      </el-row>
    </div>
    <view-sample-data-dialog
      ref="viewSampleDataDialog"
      v-if="sampleDataDialogVisible"
      :analysisRecord.sync="analysisRecord"
      :showProp.sync="showProp"
      @close="handleCloseSampleDataVisible"
    ></view-sample-data-dialog>
  </div>
</template>
<script>
import Loading from "@/utils/Loading";
import headerList from "./components/header-list";
import { getFilterList } from "@/api/three-analysis/three-analysis";
import {
  drawGroupHistogram,
  drawStackedBar,
  drawStackedHistogram,
  drawWiggleLine,
  drawBisicBar,
  drawBisicHistogram,
  drawBisicPie,
  drawHeatMap,
} from "@/utils/function";
import viewSampleDataDialog from "./components/view-sample-data-dialog";
import {
  update,
  run,
  detail,
  countSampleForCondQuery,
  downloadSampleDataAfterAnalysis,
} from "@/api/three-analysis/three-analysis";
import threeAnalysisModule from "@/mixins/three-analysis-module";
import AnyaEmpty from "@/views/modules/toolsVue/anya-empty";

//交叉查询字段类型
const CROSS_QUERY_FIELD_TYPES = ["radio", "checkbox", "select", "cascader"];
export default {
  components: {
    AnyaEmpty,
    headerList,
    viewSampleDataDialog,
  },
  mixins: [threeAnalysisModule],
  data() {
    return {
      activeName:
        this.$route.query.type === "filter"
          ? ["filter", "filterResult"]
          : ["cross", "crossResult"],
      refresh: true,
      mapType: "heatmap",
      condSampleNum: "",
      sampleData: [],
      checkXY: false,
      mapScope: [],
      analysisValue: [],
      props: {
        multiple: true,
      },
      props1: {
        label: "label",
        value: "prop",
      },
      showProp: {},
      dicData_analysis_filter: [],
      analysisFilter: [""],
      recordId: "",
      isView: false,
      activeTabName: "filter",
      filterTabDisable: false,
      filterForm: [],
      crossForm: {},
      tabFilterBoxVisible: false,
      form: {
        cross: {
          xField: "",
          yFields: [""],
          maxAge: "",
        },
      },
      dicData_cross_filter: {
        xFilters: [],
        yFilters: [],
      },
      contentFilterVisible: false,
      contentFilterForm: [],
      dicData_contentFilter: [],
      printConfig: {
        id: "chart",
        popTitle: "",
        extraCss: "",
        extraHead: '<meta http-equiv="Content-Language"content="zh-cn"/>',
      },
      crossTableOption: [],
      crossTableData: [],
      chartType: "groupHistogram",
      crossTableDataForStackedBar: [],
      chartContainerId: "chart-container",
      chartCanvasId: "chart-canvas",
      filterList: [],
      filterChartType: "bisicBar",
      filterChartContainerId: "filter-chart-container",
      filterMapContainerId: "filter-map-container",
      filterChartCanvasId: "filter-chart-canvas",
      sampleDataDialogVisible: false,
      headerListData: [],
      filterType: [],
      filter: {},
      initCondData: [],
      initCrossData: [],
      isIndeterminate: true,
      checkAll: true,
      loadingInstance: null,
      questOptions: [],
      queriedColumns: [],
    };
  },
  filters: {
    formatType(value) {
      let result = "";
      switch (value) {
        case "input":
          result = "填空-单行文本";
          break;
        case "radio":
          result = "单选";
          break;
        case "checkbox":
          result = "多选";
          break;
        case "select":
          result = "下拉选择";
          break;
        case "map":
          result = "填空-地理位置";
          break;
        case "regionSelect":
          result = "选择-地理位置";
          break;
        case "number":
          result = "数字";
          break;
        case "tree":
          result = "树形选择";
          break;
        case "date":
          result = "日期";
          break;
        case "datetime":
          result = "日期时间";
          break;
        case "datetimerange":
        case "timerange":
          result = "时间范围";
          break;
        case "cascader":
          result = "多选";
          break;
        default:
          console.log("type:", value);
          break;
      }
      return result;
    },
  },
  mounted() {
    this.loadingInstance = new Loading(".form");
    this.init();
  },
  activated(){
  
      if(!(this.analysisFilter.includes("") || !this.checkAnalysisValue())&&this.queriedColumns.length !== 0){
      this.handleFilterAnalysis()
    
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    // 初始化

    init() {
      //初始化筛选条件
      this.analysisRecord.oid = this.$route.query.recordId;
      let isVieww = this.$route.query.isView;
      this.isView = isVieww ? (isVieww === true ? true : false) : false;
      // console.log('edit:', this.isView)
      this.getDetail(this.$route.query.recordId);
      if (
        this.headerListData &&
        this.headerListData.length > 0 &&
        this.headerListData[0].formId
      ) {
        let formId = this.headerListData[0].formId;
        this.handleGetFilterList(formId);
        this.handleGetCrossFilterList(formId);
      }
    },
    changeFilter(index) {
      this.analysisValue[index] = [];
      this.mapScope[index] = "";
      let param = parseInt(this.analysisFilter[index]);
      if (this.filterType.length <= index) {
        this.filterType.push(this.dicData_analysis_filter[param - 1].type);
      } else {
        this.filterType[index] = this.dicData_analysis_filter[param - 1].type;
      }
      console.log(this.filterType[index]);
      if (
        this.filterType[index] === "radio" ||
        this.filterType[index] === "checkbox" ||
        this.filterType[index] === "select" ||
        this.filterType[index] === "cascader"
      ) {
        this.filterForm[index] =
          this.dicData_analysis_filter[param - 1].options;
      }
      this.checkFilter(this.analysisFilter, this.dicData_analysis_filter);
    },
    handleGetFilterList(formId) {
      getFilterList(formId).then((res) => {
        let data = res.data.data;
        this.dicData_analysis_filter = [];
        data.forEach((item) => {
          if (item.type != "number" && item.type != "input") {
            this.dicData_analysis_filter.push(item);
          }
        });
        // console.log(this.dicData_analysis_filter)
        this.dicData_analysis_filter.forEach((item, index) => {
          item = this.handleFieldLabel(item);
          item.seq = index + 1;
        });
      });
    },
    handleGetCrossFilterList(formId) {
      console.log("get cross filter list:", formId);
      getFilterList(formId).then((res) => {
        if (res.data.code == 0) {
          let data1 = res.data.data;
          this.dicData_cross_filter.xFilters = []
          this.dicData_cross_filter.yFilters = []
          // console.log(data1)
          data1.forEach((item) => {
            item = this.handleFieldLabel(item);

            if (
              CROSS_QUERY_FIELD_TYPES.includes(item.type) ||
              "age" === item.prop
            ) {
              this.dicData_cross_filter.xFilters.push(item);
              this.dicData_cross_filter.yFilters.push(item);
            }
          });
        } else {
          console.error(res.data.msg);
          this.$message.error(res.data.msg);
        }
      });
    },
    handleFilterTabClick(item) {
      console.log("tab click");
      console.log(item.sort());
      if (item.length > 0) {
        if (item[0] === "cross") {
          this.handleRunCross(this.initCrossData);
        } else if (item[0] === "filter") {
          this.handleRunFilter(this.initCondData);
        }
      }
    },
    checkFilter(val1, val2) {
      for (let i = 0; i < val2.length; i++) {
        if (val1.includes(val2[i].seq)) {
          this.$set(val2[i], "disabled", true);
        } else {
          this.$set(val2[i], "disabled", false);
        }
      }
    },
    checkCrossFilter(val1, val2) {
      for (let i = 0; i < val2.length; i++) {
        if (val1.includes(val2[i].prop)) {
          this.$set(val2[i], "disabled", true);
        } else {
          this.$set(val2[i], "disabled", false);
        }
      }
    },
    handleAddFilter() {
      // console.log(this.dicData_analysis_filter)
      this.checkFilter(this.analysisFilter, this.dicData_analysis_filter);
      if (!this.tabFilterBoxVisible) {
        this.tabFilterBoxVisible = true;
      } else if (this.analysisFilter.includes("")) {
        this.$message.warning("请先选择筛选条件！");
      } else {
        this.analysisFilter.push("");
        this.mapScope.push("");
        this.filterForm.push([]);
      }
    },
    deleteOneFilter(index) {
      if (this.analysisFilter.length == 1) {
        this.handleResetFilter();
      } else {
        this.analysisFilter.splice(index, 1);
        this.filterType.splice(index, 1);
        this.analysisValue.splice(index, 1);
        this.filterForm.splice(index, 1);
        this.mapScope.splice(index, 1);
      }
      this.checkFilter(this.analysisFilter, this.dicData_analysis_filter);
    },
    handleAddCrossFilterY() {
      if (this.checkXY) {
        this.$message.warning("X变量和Y变量的值不能重叠！");
      } else {
        this.checkCrossFilter(
          this.form.cross.yFields,
          this.dicData_cross_filter.yFilters
        );
        if (this.form.cross.yFields.includes("")) {
          this.$message.warning("请先填写上一个Y变量！");
        } else {
          this.form.cross.yFields.push("");
        }
      }
    },
    //删除单个y变量
    delYField(index) {
      if(this.form.cross.yFields.length < 2) {
        this.$message.warning("必须保留一对X、Y变量！");
        return
      }
      this.form.cross.yFields.splice(index, 1);
      this.checkCrossFilter(
        this.form.cross.yFields,
        this.dicData_cross_filter.yFilters
      );
    },
    //空值判断
    checkAnalysisValue() {
      for (let i = 0; i < this.analysisValue.length; i++) {
        if (
          this.analysisValue[i] === "" ||
          this.analysisValue[i].length === 0
        ) {
          return false;
        } else {
          return true;
        }
      }
    },
    handleFilterAnalysis() {
      //检查并添加地图范围元素
      for (let i = 0; i < this.mapScope.length; i++) {
        if (this.mapScope[i] != "") {
          if (this.analysisValue[i].length < 4) {
            this.analysisValue[i].push(this.mapScope[i]);
          } else {
            this.analysisValue[i].splice(3, 1, this.mapScope[i]);
          }
        }
      }
      console.log(
        "handleFilterAnalysis:",
        this.analysisFilter,
        "  ",
        this.checkAnalysisValue()
      );

      //检查是否有未填写的条件
      if (this.queriedColumns.length === 0) {
        this.$message.warning("分析变量不能为空！");
        return;
      }
      if (this.analysisFilter.includes("") || !this.checkAnalysisValue()) {
        this.$message.warning("筛选条件不能为空！");
        return;
      }

      //将分析记录格式化
      this.analysisRecord.name = this.headerListData[0].name;
      this.analysisRecord.formId = this.headerListData[0].formId;
      this.analysisRecord.tasks = this.headerListData[0].tasks;
      this.analysisRecord.filter = this.filter;
      this.analysisRecord.filterSampTotal = this.sampleData[0].sampleNum;
      this.analysisRecord.type = "cond";
      this.analysisRecord.cond = [];
      this.analysisRecord.queriedColumns = this.queriedColumns;
      for (let i = 0; i < this.analysisFilter.length; i++) {
        if (this.filterType[i] === "radio" || this.filterType[i] === "select") {
          if (this.analysisValue[i] === "all") {
            let options = [];
            this.filterForm[i].forEach((item) => {
              options.push(item.value);
            });
            //添加空值
            options.push("");
            this.analysisRecord.cond.push({
              prop: this.dicData_analysis_filter[this.analysisFilter[i] - 1]
                .prop,
              type: this.filterType[i],
              options: options,
              opera: "in",
              value: this.analysisValue[i],
            });
          } else {
            this.analysisRecord.cond.push({
              prop: this.dicData_analysis_filter[this.analysisFilter[i] - 1]
                .prop,
              type: this.filterType[i],
              opera: "eq",
              value: this.analysisValue[i],
            });
          }
        } else if (this.filterType[i] === "checkbox") {
          this.analysisRecord.cond.push({
            prop: this.dicData_analysis_filter[this.analysisFilter[i] - 1].prop,
            type: "checkbox",
            opera: "in",
            options: this.analysisValue[i],
          });
        } else if (this.filterType[i] === "cascader") {
          this.analysisRecord.cond.push({
            prop: this.dicData_analysis_filter[this.analysisFilter[i] - 1].prop,
            type: "cascader",
            opera: "eq",
            options: this.analysisValue[i],
          });
        } else if (
          this.filterType[i] === "date" ||
          this.filterType[i] === "datetime" ||
          this.filterType[i] === "daterange" ||
          this.filterType[i] === "datetimerange"
        ) {
          this.analysisRecord.cond.push(
            {
              prop: this.dicData_analysis_filter[this.analysisFilter[i] - 1]
                .prop,
              type: this.filterType[i],
              opera: "gte",
              date: this.analysisValue[i][0],
            },
            {
              prop: this.dicData_analysis_filter[this.analysisFilter[i] - 1]
                .prop,
              type: this.filterType[i],
              opera: "lte",
              date: this.analysisValue[i][1],
            }
          );
        } else if (
          this.filterType[i] === "map" ||
          this.filterType[i] === "regionSelect"
        ) {
          this.analysisRecord.cond.push({
            prop: this.dicData_analysis_filter[this.analysisFilter[i] - 1].prop,
            type: this.filterType[i],
            opera: "near",
            geo: {
              lng: this.analysisValue[i][0],
              lat: this.analysisValue[i][1],
              maxDist: parseInt(this.analysisValue[i][3]),
              minDist: 0,
              geoName: this.analysisValue[i][2],
            },
          });
        }
      }
      //to do
      this.loadingInstance = new Loading(".form");
      run(this.analysisRecord).then((res) => {
        if (res.data.code !== 0) {
          this.$message.warning("筛选条件不能为空");
          this.loadingInstance.close();
          return;
        }
        console.log(this.analysisRecord);
        let data = res.data.data.condCharts;
        // console.log('run ...........', data)
        this.initCondData = res.data.data.condCharts;
        this.dicData_contentFilter.splice(0, this.dicData_contentFilter.length);
        data.forEach((item) => {
          if (
            (item.type != "date" && item.type != "input") ||
            item.prop === "age"
          ) {
            item = this.handleFieldLabel(item);
            this.dicData_contentFilter.push(item.label);
          }
        });
        this.refresh = false;
        this.$nextTick(() => {
          this.refresh = true;
          this.handleRunFilter(data);
          this.loadingInstance.close();
        });
      });
      let page = {
        pageSize: 10,
        currentPage: 1,
      };
      console.log(this.analysisRecord);
      countSampleForCondQuery(this.analysisRecord).then((rest) => {
        if (rest.data.code === 0) {
          this.condSampleNum = rest.data.data;
        } else {
          console.log("err:", rest.data.msg);
        }
      });
    },
    //条件筛选分析后返回数据的方法
    handleRunFilter(data) {
      this.filterList.splice(0, this.filterList.length);
      this.contentFilterForm.splice(0, this.contentFilterForm.length);
      data.forEach((item) => {
        if (item.type != "date" && item.type != "input") {
          if (item.type === "cascader") {
            let data = item.properties;
            // data.forEach(res => {
            //     res.name = getSpecialWorkLabel(res.name)
            // })
            this.filterList.push({
              title: item.label,
              type: item.type,
              prop: item.prop,
              data: data,
            });
          } else if (item.type === "map" || item.type === "regionSelect") {
            let row = [];
            // console.log(item)
            if (item.coordinates && item.coordinates.length > 0) {
              item.coordinates.forEach((res) => {
                // console.log(res)
                if (res.longitude != null && res.latitude != null) {
                  row.push({
                    coord: [res.longitude, res.latitude],
                  });
                }
              });
            }

            this.filterList.push({
              title: item.label,
              type: item.type,
              prop: item.prop,
              data: row,
            });
          } else {
            this.filterList.push({
              title: item.label,
              type: item.type,
              prop: item.prop,
              data: item.properties,
            });
          }
          this.contentFilterForm.push(item.label);
        }
      });
      this.$nextTick(() => {
        if (this.filterList.length > 0) {
          this.filterList.forEach((item, index) => {
            if (
              item.type === "input" ||
              item.type === "radio" ||
              item.type === "checkbox" ||
              item.type === "cascader" ||
              item.type === "select" ||
              item.prop === "age"
            ) {
              drawBisicBar(
                item.data,
                `${this.filterChartContainerId}-${index}`,
                `${this.filterChartCanvasId}-${index}`,
                "name",
                "total"
              );
            }
          });
        }
      });
    },
    drawMap(index) {
      document.getElementById(
        `${this.filterMapContainerId}-${index}`
      ).style.height = "600px";
      console.log(this.filterList[index].data);
      this.$nextTick(() => {
        drawHeatMap(
          this.filterList[index].data,
          `${this.filterMapContainerId}-${index}`,
          `${this.filterChartCanvasId}-${index}`
        );
      });
    },
    //交叉分析的分析功能
    handleStartCrossAnalysis() {
      //检查是否有XY变量重叠现象
      if (this.checkXY) {
        this.$message.warning("X变量和Y变量的值不能重叠！");
      } else if (
        this.form.cross.xField == "" ||
        this.form.cross.yFields.includes("")
      ) {
        //检查X或者Y变量是否有空值
        this.$message.warning("变量的值不能为空！");
      } else {
        let check = false;
        if (
          this.form.cross.maxAge != "" &&
          this.form.cross.maxAge != undefined
        ) {
          this.form.cross.maxAge.split(",").forEach((item) => {
            if (!!Number(item) == false) {
              check = true;
            }
          });
          if (check == false) {
            this.form.cross.maxAge.split(",").forEach((item, index) => {
              if (index > 0) {
                if (
                  parseInt(item) <
                  parseInt(this.form.cross.maxAge.split(",")[index - 1])
                ) {
                  check = true;
                }
              }
            });
          }
          if (
            check == false &&
            parseInt(
              this.form.cross.maxAge.split(",")[
                this.form.cross.maxAge.split(",").length - 1
              ]
            ) < 100
          ) {
            this.form.cross.maxAge = this.form.cross.maxAge.concat(",100");
          }
        }
        if (check == false) {
          ////将分析记录格式化
          this.analysisRecord.name = this.headerListData[0].name;
          this.analysisRecord.formId = this.headerListData[0].formId;
          this.analysisRecord.tasks = this.headerListData[0].tasks;
          this.analysisRecord.filter = this.filter;
          this.analysisRecord.filterSampTotal = this.sampleData[0].sampleNum;
          this.analysisRecord.type = "cross";
          this.analysisRecord.cross = this.form.cross;
          // console.log(this.analysisRecord)
          this.loadingInstance = new Loading(".form");
          run(this.analysisRecord).then((res) => {
            // console.log(res.data)
            if (res.data.code == 0) {
              // console.log(res.data)
              let data = res.data.data.crossCharts;
              this.initCrossData = res.data.data.crossCharts;
              this.handleRunCross(data);
            } else {
              this.$message.warning("样本暂无数据！请重新选择变量！");
            }
          });
          this.loadingInstance.close();
        } else {
          this.$message.warning("年龄分组输入有误！");
        }
      }
    },
    //交叉分析后返回数据的方法
    handleRunCross(data) {
      // console.log(data)
      this.crossTableOption = [];
      this.crossTableDataForStackedBar = [];
      this.crossTableData = [];
      data.forEach((item, index) => {
        this.crossTableOption.push({
          // formName: (index+1) + '.' + item.tableOption.label.split("、")[1].split("和")[0] + "和" + item.tableOption.label.split("、")[2],
          formName: index + 1 + "、" + item.tableOption.label,
          list: item.tableOption.header,
        });
        this.crossTableDataForStackedBar.push(item.tableDataForStackedBar);
        this.crossTableData.push(item.tableDataList);
      });
      console.log(this.crossTableOption);
      console.log(this.crossTableDataForStackedBar);
      console.log(this.crossTableData);
      this.$nextTick(() => {
        if (this.crossTableOption.length > 0) {
          this.crossTableOption.forEach((item, index) => {
            const pid = this.chartContainerId + "-" + index;
            const id = this.chartCanvasId + "-" + index;
            const fieldsA = Object.keys(this.crossTableData[index][0]);
            const fields = [];
            fieldsA.forEach((item) => {
              if (item != "xy" && item != "summary") {
                fields.push(item);
              }
            });
            const retainFields = ["xy"];
            drawGroupHistogram(
              this.crossTableData[index],
              pid,
              id,
              fields,
              retainFields,
              "xy",
              "性别",
              "人口数量"
            );
          });
        }
      });
    },
    //条件筛选清空
    handleResetFilter() {
      this.analysisRecord.cond = [];
      if (
        this.headerListData &&
        this.headerListData.length > 0 &&
        this.headerListData[0].formId
      ) {
        this.handleGetFilterList(this.headerListData[0].formId);
      }
      this.analysisFilter = [""];
      this.filterType = [];
      this.analysisValue = [];
      this.filterForm = [];
      this.mapScope = [];
      this.tabFilterBoxVisible = false;
    },
    //交叉分析清空
    handleResetCrossFilter(formId) {
      (this.analysisRecord.cross = {}),
        (this.form = {
          cross: {
            xField: "",
            yFields: [""],
          },
        });
      if (!!formId) {
        this.handleGetCrossFilterList(formId);
      } else {
        if (
          this.headerListData &&
          this.headerListData.length > 0 &&
          this.headerListData[0].formId
        ) {
          let headerListFormId = this.headerListData[0].formId;
          this.handleGetCrossFilterList(headerListFormId);
        }
      }
    },
    handleChangeX(value) {
      this.$nextTick(() => {
        this.compare(this.form.cross.xField, this.form.cross.yFields);
      })
    },
    handleChangeCrossFilterY(value) {
      this.$nextTick(() => {
        this.compare(this.form.cross.xField, this.form.cross.yFields);
        this.checkCrossFilter(
          this.form.cross.yFields,
          this.dicData_cross_filter.yFilters
        );
      })
    },
    //检查XY变量是否重叠的方法
    compare(val1, val2) {
      if (val1 && val2 && val2.length > 0) {
        val2.forEach((item) => {
          if (val1 === item) {
            this.$message.warning("X变量和Y变量的值不能重叠！");
            this.checkXY = true;
          } else {
            this.checkXY = false;
          }
        });
      }
    },
    handleSetContentFilter() {
      this.contentFilterVisible = true;
    },
    handleCloseContentFilter() {
      this.contentFilterVisible = false;
    },
    handlePrint() {
      this.$print(this.$refs.printDom, {
        echartDomArr: ["#chart-container"],
      });
    },
    // handleSave() {
    //     console.log('保存');
    // },
    handleDownloadSample() {
      console.log("download");
      if (
        !this.analysisRecord.name ||
        !this.analysisRecord.formId ||
        !this.analysisRecord.tasks
      ) {
        this.$message.warning("请先分析后下载样本！");
        return;
      }
      downloadSampleDataAfterAnalysis(this.analysisRecord);
    },
    handleStackBarData(index) {
      const fieldsA = Object.keys(this.crossTableData[index][0]);
      const fields = [];
      fieldsA.forEach((item) => {
        if (item != "xy" && item != "summary") {
          fields.push(item);
        }
      });
      let barData = this.updateStackBarData(
        this.crossTableDataForStackedBar[index],
        fields,
        "label",
        "type",
        "value"
      );
      return barData;
    },
    updateStackBarData(
      stackBars,
      filterTypes = [],
      labelName,
      typeName,
      valueName
    ) {
      let arr = [];
      let map = {};
      stackBars.forEach((item) => {
        arr.push(item[labelName]);
        map[item[labelName] + ":" + item[typeName]] = item;
      });

      //限制2个，供镜像分组条形图使用，该条形图只能对小于等于2类数据比对
      if (filterTypes.length > 2) {
        filterTypes.splice(2);
      }
      let results = [];
      let labels = new Set(arr);
      labels.forEach((label) => {
        filterTypes.forEach((type) => {
          let key = label + ":" + type;
          if (!map[key]) {
            let obj = {};
            obj[labelName] = label;
            obj[typeName] = type;
            obj[valueName] = 0;
            results.push(obj);
          } else {
            results.push(map[key]);
          }
        });
      });
      return results;
    },
    handleChangeChart(value, index) {
      const pid = this.chartContainerId + "-" + index;
      const id = this.chartCanvasId + "-" + index;
      switch (value) {
        case "groupHistogram":
          const fieldsA = Object.keys(this.crossTableData[index][0]);
          const fields = [];
          fieldsA.forEach((item) => {
            if (item != "xy" && item != "summary") {
              fields.push(item);
            }
          });
          const retainFields = ["xy"];
          drawGroupHistogram(
            this.crossTableData[index],
            pid,
            id,
            fields,
            retainFields,
            "xy",
            "性别",
            "人口数量"
          );
          break;
        case "stackedBar":
          // drawStackedBar(this.crossTableDataForStackedBar[index], pid, id, ['type'], 'label', 'value', '参与调查人数');
          drawStackedBar(
            this.handleStackBarData(index),
            pid,
            id,
            ["type"],
            "label",
            "value",
            "参与调查人数"
          );
          break;
        case "stackedHistogram":
          drawStackedHistogram(
            this.crossTableDataForStackedBar[index],
            pid,
            id,
            "type",
            "value",
            "label"
          );
          break;
        case "wiggleLine":
          drawWiggleLine(
            this.crossTableDataForStackedBar[index],
            pid,
            id,
            "label",
            "value",
            "type"
          );
          break;
        default:
          break;
      }
    },
    handleChangeFilterChart(chartType, data, index) {
      console.log(data);
      let isBigData = false;
      for (let item of data) {
        if (item.total > 10) {
          isBigData = true;
          break;
        }
      }
      const pid = this.filterChartContainerId + "-" + index;
      const id = this.filterChartCanvasId + "-" + index;
      switch (chartType) {
        case "bisicBar":
          drawBisicBar(data, pid, id, "name", "total", isBigData);
          break;
        case "bisicHistogram":
          drawBisicHistogram(data, pid, id, "name", "total", isBigData);
          break;
        case "bisicPie":
          drawBisicPie(data, pid, id, "name", "percent");
          break;
        default:
          break;
      }
    },
    handleSetSampleDataVisible(prop) {
      console.log("watch sample data: ");
      // console.log(prop)
      this.sampleDataDialogVisible = true;
      this.showProp = prop;
      this.$nextTick(() => {
        this.$refs.viewSampleDataDialog.init();
      });
    },
    handleCloseSampleDataVisible() {
      this.sampleDataDialogVisible = false;
    },
    toEdit() {
      this.isView = false;
    },
    handleUpdate() {
      console.log(
        "2 #### analysisFilter:",
        this.analysisFilter,
        "  ",
        this.checkAnalysisValue()
      );
      // if (this.analysisFilter.includes("") || !this.checkAnalysisValue()) {
      //     this.$message.warning('筛选条件不能为空！')
      // }else
      if (this.checkXY) {
        this.$message.warning("X变量和Y变量的值不能重叠！");
      } else {
        this.analysisRecord.name = this.headerListData[0].name;
        this.analysisRecord.formId = this.headerListData[0].formId;
        this.analysisRecord.tasks = this.headerListData[0].tasks;
        this.analysisRecord.filter = this.filter;
        this.analysisRecord.queriedColumns = this.queriedColumns;
        this.analysisRecord.filterSampTotal = this.sampleData[0].sampleNum;
        console.log("update: ", this.analysisRecord, "  ", this.type);
        update(this.analysisRecord).then((res) => {
          if (res.data.code === 0) {
            this.$message.success("保存成功");
          } else {
            this.$message.error(res.data.msg);
          }
        });
        this.isView = true;
      }
    },
    handleGetSampleNum(id) {
      detail(id).then((res) => {
        if (res.data.code === 0) {
          let array = [
            {
              sampleNum: res.data.data.filterSampTotal,
            },
          ];
          this.sampleData = array;
        }
      });
    },
    handleCheckAllChange(val) {
      this.contentFilterForm = val ? this.dicData_contentFilter : [];
      this.isIndeterminate = false;
      this.changeContentFilterForm(this.contentFilterForm);
    },
    changeContentFilterForm(arr) {
      let arrData = [];
      this.initCondData.forEach((item) => {
        arr.forEach((item1) => {
          if (item1 == item.label) {
            arrData.push(item);
          }
        });
      });
      // console.log(arr)
      this.handleRunFilter(arrData);
      let checkedCount = arr.length;
      this.checkAll = checkedCount === this.dicData_contentFilter.length;
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.dicData_contentFilter.length;
    },
    handleFieldLabel(item) {
      let arr = item.label.split("、");
      arr.splice(0, 1);
      item.label = arr.join("、");

      let arry = item.label.split(" ");
      if (arry[arry.length - 1]) {
        item.label = arry[arry.length - 1];
      }
      return item;
    },
    getDetail(id) {
      let data = [];
      detail(id).then((res) => {
        if (res.data.code === 0) {
          let array = [
            {
              sampleNum: res.data.data.filterSampTotal,
            },
          ];
          this.sampleData = array;
          console.log("getDetail:", this.sampleData);
          if (res.data.data.cond && res.data.data.cond.length > 0) {
            this.tabFilterBoxVisible = true;
            this.analysisFilter = [];
          }
          data = res.data.data;
          this.analysisRecord.name = data.name;
          this.analysisRecord.formId = data.formId;
          this.analysisRecord.tasks = data.tasks;
          this.queriedColumns = data.queriedColumns ? data.queriedColumns : [];
          if (data.filter) {
            this.analysisRecord.filter = data.filter;
            this.filter = data.filter;
          }
          if (data.cond) {
            console.log(data.cond);
            this.analysisRecord.cond = data.cond;
            this.analysisRecord.cross = data.cross;
            let page = {
              pageSize: 10,
              currentPage: 1,
            };
            countSampleForCondQuery(this.analysisRecord).then((rest) => {
              if (rest.data.code === 0) {
                this.condSampleNum = rest.data.data;
              } else {
                console.log("err:", rest.data.msg);
              }
            });
          }
          let headerObj = [
            {
              name: data.name,
              analysisId: data.oid,
              formName: data.formName ? data.formName : "",
              formId: data.formId,
              tasks: data.tasks,
            },
          ];
          // console.log('init:', data)
          this.headerListData = headerObj;

          getFilterList(headerObj[0].formId).then((res1) => {
            if (res1.data.code == 0) {
              let data1 = res1.data.data;
              let ageField = null;
              this.questOptions = [];
              const maxLength = 15;
              const ignoreTypes = [
                "daterange",
                "date",
                "datetime",
                "datetimerange",
                "upload",
                "time",
                "timerange",
                "textarea",
              ];
              data1.forEach((item) => {
                if (item.type != "number" && item.type != "input") {
                  if (!ignoreTypes.includes(item.type)) {
                    let label =
                      item.label.length > maxLength
                        ? item.label.substring(0, maxLength) + "..."
                        : item.label;
                    this.questOptions.push({
                      label: label,
                      prop: item.prop,
                      title: item.label,
                    });
                  }
                  this.dicData_analysis_filter.push(item);
                }
                if ("age" === item.prop) {
                  let label =
                    item.label.length > maxLength
                      ? item.label.substring(0, maxLength) + "..."
                      : item.label;
                  this.questOptions.push({
                    label: label,
                    prop: item.prop,
                    title: item.label,
                  });
                  ageField = this.handleFieldLabel(item);
                }
              });
              if (ageField) {
                this.dicData_cross_filter.xFilters.push(ageField);
              }
              this.dicData_analysis_filter.forEach((item, index) => {
                item = this.handleFieldLabel(item);

                if (item.type != "number" && item.type != "input") {
                  item.seq = index + 1;
                }
                if (CROSS_QUERY_FIELD_TYPES.includes(item.type)) {
                  this.dicData_cross_filter.xFilters.push(item);
                  this.dicData_cross_filter.yFilters.push(item);
                }
              });

              let dateArray = [];
              if (data.cond && data.cond.length > 0) {
                data.cond.forEach((item) => {
                  let index = this.dicData_analysis_filter.findIndex(function (
                    item1
                  ) {
                    return item1.prop === item.prop;
                  });
                  if (item.opera == "eq") {
                    this.analysisFilter.push(index + 1);
                    this.filterType.push(item.type);
                    this.mapScope.push("");
                    this.analysisValue.push(item.value);
                    this.filterForm.push(
                      this.dicData_analysis_filter[index].options
                    );
                  } else if (item.opera == "in") {
                    this.analysisFilter.push(index + 1);
                    this.filterType.push(item.type);
                    this.mapScope.push("");
                    if (item.value === "all") {
                      this.analysisValue.push(item.value);
                    } else {
                      this.analysisValue.push(item.options);
                    }
                    this.filterForm.push(
                      this.dicData_analysis_filter[index].options
                    );
                  } else if (item.opera == "near") {
                    this.analysisFilter.push(index + 1);
                    this.filterType.push(item.type);
                    let arr = [item.geo.lng, item.geo.lat, item.geo.geoName];
                    this.analysisValue.push(arr);
                    this.mapScope.push(item.geo.maxDist);
                    this.filterForm.push([]);
                  } else if (item.opera == "gte") {
                    dateArray.push(item.date);
                  } else if (item.opera == "lte") {
                    this.analysisFilter.push(index + 1);
                    this.filterType.push(item.type);
                    this.mapScope.push("");
                    dateArray.push(item.date);
                    this.analysisValue.push(dateArray);
                    this.filterForm.push([]);
                    dateArray = [];
                  }
                  this.checkFilter(
                    this.analysisFilter,
                    this.dicData_analysis_filter
                  );
                });
              }
            } else {
              this.$message.error(res.data.msg);
            }
          });

          //交叉分析条件勾选
          if (
            data.cross &&
            data.cross.yFields &&
            data.cross.yFields.length > 0
          ) {
            this.form.cross = data.cross;
          }
          this.checkCrossFilter(
            this.form.cross.yFields,
            this.dicData_cross_filter.yFilters
          );

          if (data.condRes) {
            this.dicData_contentFilter.splice(
              0,
              this.dicData_contentFilter.length
            );
            data.condRes.forEach((item) => {
              if (item.type != "date" && item.type != "input") {
                item = this.handleFieldLabel(item);
                this.dicData_contentFilter.push(item.label);
              }
            });
            this.initCondData = data.condRes;
            console.log("run filter.....................");
            this.handleRunFilter(data.condRes);
          }
          if (data.crossRes) {
            this.initCrossData = data.crossRes;
            this.handleRunCross(data.crossRes);
          }
        } else {
          this.$router.push({ path: "/three-analysis-analysis-record" });
          this.$message.error(res.data.msg);
        }
        this.loadingInstance.close();
      });
    },
    //刷新查询条件，查询结果
    refreshQuery(formTask) {
      // console.log('refreshQuery', formTask)
      let modify = formTask.modify;
      if (modify) {
        if (modify === "form") {
          console.log("form is changed:");
          this.$nextTick(() => {
            let formId = formTask.formId;
            this.analysisRecord.formId = formId;
            this.analysisRecord.formName = formTask.formName;
            this.analysisRecord.tasks = formTask.taskIds;
            this.analysisRecord.cond = [];
            // this.analysisRecord.cross.xField = "";
            // this.analysisRecord.cross.yFields = [];
            // this.analysisRecord.cross.crossRes = [];

            this.handleResetCrossFilter(formId);

            this.analysisRecord.cross.condRes = [];
            this.analysisFilter = [];
            this.tabFilterBoxVisible = true;

            this.handleGetFilterList(formId);
            this.handleGetCrossFilterList(formId);

            this.activeTabName = "filter";
          });
        } else if (modify === "task") {
          console.log("tasks is changed");
          this.analysisRecord.tasks = formTask.taskIds;
          this.activeTabName = "filter";
        }
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.back-button {
  padding: 10px;
  color: #00bfbf;
  cursor: pointer;
}
.remark {
  font-size: 13px;
  color: #d7d7d7;
  margin-top: 10px;
  margin-bottom: 10px;
}
.header-top {
  z-index: 10;
  position: fixed;
  top: 40px;
  padding: 13px 0;
  background-color: #f1f4f5;
  width: 100%;
}

.page-container {
  width: 100%;
  padding-top: 130px;
  display: flex;
  -webkit-box-flex: 1;
  -ms-flex: 1;
  flex: 1;
  flex-direction: row;
  flex-wrap: wrap;

  .page-content_filter {
    width: 30%;
    position: relative;
    // top: 195px;
    height: calc(100% - 70px - 100px - 40px);
    // padding-left: 40px;
    .filter-btn {
      width: calc(100%);
      box-sizing: border-box;
      margin-bottom: 8px;
      margin-left: 0;
      &:hover {
        cursor: pointer;
      }
    }
    .filtr-btn__a {
      color: #c8c8c8;
      margin-left: 40%;
      padding-bottom: 15px;
    }
    .filtr-btn__add {
      background: #fff;
      color: #c8c8c8;
      border-color: #f1f4f5;
      border-style: dashed;
    }
  }
  .page-content {
    // padding-left: 450px;
    width: 100%;
    padding-left: 25%;
    .page-content__tool {
      padding: 0 15px;
      background: #fefefe;
      line-height: 60px;
      .content-filter-container {
        .unfold {
          margin-top: 15px;
        }
        line-height: 1.2;
      }
    }
    .page-content__title {
      font-weight: 600;
      margin-right: 15px;
      > p > span {
        padding: 0 15px;
      }
    }
    .page-content_table__title {
      font-size: 16px;
      font-weight: bold;
      padding: 15px 0;
    }
    .table-charts {
      margin-top: 40px;
      margin-bottom: 30px;
      .change-type-box {
        margin-bottom: 30px;
      }
    }
    .page-content--filter {
      .filter-item {
        padding: 30px 0;
        border-bottom: 1px solid #f1f4f5;
        .header {
          line-height: 28px;
          margin-bottom: 30px;
          .title {
            font-size: 14px;
            font-weight: bold;
          }
          .desc {
            font-size: 12px;
          }
          .desc:before {
            content: "[";
          }
          .desc::after {
            content: "]";
          }
        }
        &:last-child {
          border-bottom: unset;
        }
        .filter-charts-container {
          margin-bottom: 30px;
        }
      }
    }
  }
}
.y-select {
  display: inline-block;
  width: 80%;
  margin-right: 10px;
}
</style>
