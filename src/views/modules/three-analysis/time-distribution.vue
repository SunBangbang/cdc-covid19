<template>
  <el-card class="aui-card--fill">
    <query-condition
      @query="query"
      @changeSurveyForm="loadDictOptions"
      @reset="resetForm"
      ref="queryCond"
    >
      <template slot="more">
        <el-form-item label="诊断类型" label-width=".6rem">
          <el-select
            v-model="type"
            placeholder="请选择诊断类型"
            multiple
            style="width: 2.3rem"
          >
            <el-option
              v-for="item in dicOptions"
              :key="item.dictValue"
              :label="item.dictLabel"
              :title="item.dictLabel"
              :value="item.dictValue"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </template>
    </query-condition>
    <el-row style="margin-top: 50px">
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
    <el-drawer title="设置" :visible.sync="drawer" direction="rtl">
      <el-form label-width="120px" label-position="right">
        <el-form-item label="最大值">
          <el-input-number
            v-model="maxValue"
            size="mini"
            controls-position="right"
            :min="1"
          >
          </el-input-number>
        </el-form-item>
        <el-form-item label="最小值">
          <el-input-number
            v-model="minValue"
            size="mini"
            controls-position="right"
            :min="0"
          >
          </el-input-number>
        </el-form-item>
        <el-form-item label="病例数间隔">
          <el-input-number
            v-model="interval"
            size="mini"
            controls-position="right"
            :min="1"
          >
          </el-input-number>
        </el-form-item>
        <el-form-item label="时间间隔（天）">
          <el-input-number
            v-model="dayInterval"
            size="mini"
            controls-position="right"
            :min="1"
          >
          </el-input-number>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleConfirm">确定</el-button>
        </el-form-item>
      </el-form>
    </el-drawer>
  </el-card>
</template>

<script>
import { Column } from "@antv/g2plot";
import queryCondition from "./components/query-condition";
import { timeDistributionSearch } from "@/api/three-analysis/three-analysis";
import { getQuestionDicOptions } from "@/api/survey-form/questionnaire";
import { isEmpty } from "@antv/util";

export default {
  name: "time-distribution",
  components: {
    queryCondition
  },
  data() {
    return {
      type: [],
      data: [],
      interval: 5,
      drawer: false,
      maxValue: 100,
      minValue: 0,
      dayInterval: 1,
      selectedData: [],
      dicOptions: [] //类型选项
    };
  },
  methods: {
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
    initCanvas() {
      const pid = "container1";
      const id = "source1";
      this.createElementForDrawingChart(pid, id);
      const column = new Column(id, {
        data: this.selectedData,
        xField: "date",
        yField: "number",
        xAxis: {
          label: {
            autoRotate: false
          }
        },
        yAxis: {
          tickInterval: this.interval,
          min: this.minValue,
          max: this.maxValue
        },
        slider: {
          start: 0,
          end: 1
        },
        maxColumnWidth: 40,
        meta: {
          date: {
            alias: "日期"
          },
          number: {
            alias: "病例数"
          }
        },
        columnWidthRatio: 1,
        columnStyle: {
          stroke: "black"
        },
        label: {
          //offset: 2,
          position: "top",
          style: {
            stroke: "black",
            lineWidth: 1
          },
          formatter(text, item, index) {
            return text.number;
          }
        }
      });

      column.render();
    },
    query(form) {
      if (isEmpty(this.type)) {
        this.$message.warning("请选择诊断类型！");
        return;
      }
      form.diagResult = this.type;
      timeDistributionSearch(form).then(res => {
        if (res.data.code === 0) {
          this.data = res.data.data;
          if (this.data && this.data.length > 0) {
            let seq = 0;
            this.data.forEach(ele => {
              ele.seq = seq++;
            });
            this.selectedData = this.data;
            this.initCanvas();
          } else {
            this.selectedData = [];
            this.initCanvas();
            this.$message.info("没有数据");
          }
        } else {
          this.selectedData = [];
          this.initCanvas();
          this.$message.error(res.data.msg);
        }
      });
    },
    handleConfirm() {
      this.selectedData = this.data.filter(
        item => item.seq % this.dayInterval == 0
      );
      this.initCanvas();
    },
    //加载字典值
    loadDictOptions(formId) {
      let type = "confirmClinicType";
      let key = `code:${formId}:${type}`;
      let data = sessionStorage.getItem(key);
      if (data) {
        this.dicOptions = JSON.parse(data);
        this.$refs.queryCond.disabled = false;
        this.$refs.queryCond.refresh();
        return;
      }
      this.dicOptions = [];
      getQuestionDicOptions(formId, type).then(res => {
        // console.log('get question dic option:', res.data)
        if (res.data.code === 0) {
          this.dicOptions = res.data.data;
          this.$refs.queryCond.disabled = false;
          this.$refs.queryCond.refresh();
          sessionStorage.setItem(key, JSON.stringify(this.dicOptions));
        } else {
          this.$refs.queryCond.disabled = true;
          this.$refs.queryCond.refresh();
          console.error("err:", res.data.msg);
          this.$message.error(res.data.msg);
        }
      });
    },
    resetForm() {
      this.type = [];
      this.$refs.queryCond.refresh();
    }
  }
};
</script>

<style scoped lang="scss">
#container1 {
  width: 80%;
  margin: 50px auto;
}
</style>
