<template>
  <el-card class="aui-card--fill">
    <query-condition
      @query="query"
      @changeSurveyForm="handleSurveyForm"
      ref="queryCond"
    >
      <!-- <template slot="more">
        <el-form-item label="年龄分组"  label-width=".6rem" prop="more">
          <el-input style="width: 2.2rem;" v-model="ageRange"
                    placeholder="用英文逗号','隔开, 默认10,20,30,40,50,60,70,80,90,100"
                    title="用英文逗号','隔开, 默认10,20,30,40,50,60,70,80,90,100">
          </el-input>
        </el-form-item>
      </template> -->
    </query-condition>
    <el-row v-show="drawMap">
      <div slot="header">
        <span>条形图</span>
      </div>
      <el-button
        type="info"
        icon="el-icon-setting"
        circle
        style="margin-left: 10%;"
        @click="drawer = true"
        v-if="data.length > 0"
      >
      </el-button>
      <div id="container1"></div>
    </el-row>
    <el-row v-show="drawMap">
      <div slot="header">
        <span>柱形图</span>
      </div>
      <div id="container2"></div>
    </el-row>
    <el-drawer title="设置" :visible.sync="drawer" direction="rtl">
      <div style="padding-left: 5%;">
        <span>病例数间隔:</span>
        <el-input-number
          v-model="num"
          size="mini"
          @change="handleChangeInterval"
          controls-position="right"
          :min="1"
        >
        </el-input-number>
      </div>
    </el-drawer>
  </el-card>
</template>

<script>
import { Column } from "@antv/g2plot";
import { Chart } from "@antv/g2";
import populationDistributionApis from "@/api/three-analysis/population-distribution";
import { populationDistributeSearch } from "@/api/three-analysis/three-analysis";
import queryCondition from "./components/populatio-query-condition";
import { isEmpty } from "@antv/util";

export default {
  name: "population-distribution",
  components: {
    queryCondition
  },
  data() {
    return {
      drawMap: false,
      ageRange: "",
      surveyFormOptions: [],
      taskOptions: [],
      num: 5,
      data: [],
      drawer: false
    };
  },
  methods: {
    handleSurveyForm(formId) {
      this.$refs.queryCond.disabled = false;
      this.$refs.queryCond.refresh();
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
    // 柱形图
    initColumnDiagram() {
      const pid = "container2";
      const id = "source2";
      this.createElementForDrawingChart(pid, id);

      const stackedColumnPlot = new Column(id, {
        data: this.data,
        isGroup: true,
        xField: "ageRange",
        yField: "caseNumber",
        yAxis: {
          label: null
        },
        seriesField: "name",
        /** 设置颜色 */
        color: ["#1ca9e6", "#f88c24"],
        legend: {
          position: "bottom"
        },
        theme: {
          maxColumnWidth: 100
        },
        /** 设置间距 */
        marginRatio: 0.1,
        label: {
          // 可手动配置 label 数据标签位置
          position: "middle", // 'top', 'middle', 'bottom'
          // 可配置附加的布局方法
          layout: [
            // 柱形图数据标签位置自动调整
            { type: "interval-adjust-position" },
            // 数据标签防遮挡
            { type: "interval-hide-overlap" },
            // 数据标签文颜色自动调整
            { type: "adjust-color" }
          ],
          style: {
            fontSize: 25
          }
        }
      });

      stackedColumnPlot.render();
    },
    // 条形图
    initBarDiagram(interval) {
      const pid = "container1";
      const id = "source1";
      this.createElementForDrawingChart(pid, id);

      const chart = new Chart({
        container: "source1",
        autoFit: true,
        height: 400,
        padding: [20, 0, 10, 0]
      });
      chart.data(this.data);
      chart.scale("caseNumber", {
        alias: "发病数",
        nice: true,
        tickInterval: interval
      });
      chart.coordinate().transpose();
      chart.facet("mirror", {
        spacing: [40, 10],
        fields: ["name"],
        transpose: true,
        showTitle: true,
        eachView: (view, facet) => {
          const facetIndex = facet.columnIndex;
          if (facetIndex === 0) {
            view.axis("ageRange", {
              position: "bottom",
              label: {
                style: {
                  fill: "#aaaaaa",
                  fontSize: 12
                }
              },
              tickLine: {
                alignTick: false,
                length: 0
              },
              line: null
            });
          } else {
            view.axis("ageRange", false);
          }
          const color = facetIndex === 0 ? "#1ca9e6" : "#f88c24";
          view
            .interval()
            .position("ageRange*caseNumber")
            .color(color)
            .size(30)
            .label("caseNumber", val => {
              let offset = facetIndex === 1 ? -5 : -10;
              let shadowBlur = 2;
              let textAlign = facetIndex === 1 ? "end" : "start";
              let fill = "white";
              if (val < 15) {
                offset = facetIndex === 1 ? 5 : 10;
                textAlign = facetIndex === 1 ? "start" : "end";
                fill = "#666666";
                shadowBlur = 0;
              }
              return {
                offset,
                style: {
                  fill,
                  stroke: null,
                  shadowBlur,
                  shadowColor: "rgba(0, 0, 0, .45)",
                  textAlign
                }
              };
            });
        }
      });
      chart.interaction("element-highlight");
      chart.render();
    },
    // 修改病例数间隔
    handleChangeInterval(currentValue, oldValue) {
      this.initBarDiagram(currentValue);
    },
    query(form) {
      this.drawMap = true;
      populationDistributeSearch(form).then(res => {
        if (res.data.code === 0) {
          this.data = res.data.data;
          if (isEmpty(this.data)) {
            this.data = [];
            this.$message.info("没有数据");
          }
          this.initBarDiagram(this.num);
          this.initColumnDiagram();
        } else {
          this.$message.error(res.data.msg);
        }
      });

      /*populationDistributionApis.getData(form).then(res => {
        if (res.data.code === 0) {
          this.data = res.data.data;
          this.initBarDiagram(this.num);
          this.initColumnDiagram();
        }else{
          this.$message.error(res.data.msg);
        }
      })*/
    }
  }
};
</script>

<style scoped lang="scss">
#container1 {
  width: 80%;
  margin: 0 auto 50px auto;
}

#container2 {
  width: 80%;
  margin: 50px auto;
}
</style>
