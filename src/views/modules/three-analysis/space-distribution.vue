<template>

  <el-card class="aui-card--fill" v-loading="loading">

    <query-condition
      @query="query"
      @changeSurveyForm="handleSurveyForm"
      ref="queryCond"
    >

    </query-condition>

    <div v-show="visible">

      <el-row>

        <div class="container-heat" id="container-heat"></div>

      </el-row>

      <el-row style="margin-top: 40px">

        <div class="container-drill" id="container-drill"></div>

      </el-row>

    </div>

  </el-card>

</template>

<script>
import queryCondition from "./components/space-query-condition";
import { drawHeatMap } from "@/utils/function";
import { spaceDistributeSearch } from "@/api/three-analysis/three-analysis";
import { Control, Scene } from "@antv/l7";
import { Mapbox } from "@antv/l7-maps";
import { DrillDownLayer } from "@antv/l7-district";

export default {
  name: "space-distribution",
  components: {
    queryCondition
  },
  data() {
    return {
      loading: false,
      visible: false,
      mapScene: null,
      drillDownLayer: null
    };
  },
  beforeRouteLeave(to, from, next) {
    this.$destroy();
    next();
  },
  destroyed() {
    if (this.drillDownLayer != null) {
      this.drillDownLayer.destroy();
      this.drillDownLayer = null;
    }
    if (this.mapScene != null) {
      this.mapScene.destroy();
      this.mapScene = null;
    }
    let container = document.getElementById("container-heat");
    if (container) {
      let child = container.childNodes;
      child.forEach(node => container.removeChild(node));
    }
    container = document.getElementById("container-drill");
    if (container) {
      let child = container.childNodes;
      child.forEach(node => container.removeChild(node));
    }
  },
  methods: {
    handleSurveyForm(formId) {
      this.$refs.queryCond.disabled = false;
      this.$refs.queryCond.refresh();
    },
    query(form) {
      this.visible = false;
      this.loading = true;
      form.address = form.positionType;
      spaceDistributeSearch(form).then(res => {
        this.visible = true;
        this.$nextTick(() => {
          if (res.data.code === 0) {
            if (this.drillDownLayer != null) {
              this.drillDownLayer.destroy();
              this.drillDownLayer = null;
            }
            if (this.mapScene != null) {
              this.mapScene.destroy();
              this.mapScene = null;
            }
            const data = res.data.data;

            if (data && data.coords && data.coords.length > 0) {
              new Promise(resolve => {
                this.initHeatMap(data.coords, resolve);
              }).then(res => {
                const drillData = {
                  provinceData: data.provinceData,
                  cityData: data.cityData,
                  countryData: data.countryData
                };
                this.initDrillMap(drillData);
              });
            } else {
              this.$message.info("没有数据");
              this.visible = false;
              this.loading = false;
            }
          } else {
            this.$message.error(res.data.msg);
            this.loading = false;
          }
        });
      });
    },
    initHeatMap(data, resolve) {
      // document.getElementById("container-heat").style.height = "600px";
      drawHeatMap(data, "container-heat", "heat-map");
      resolve("ok");
    },
    initDrillMap(data) {
      this.mapScene = new Scene({
        id: "container-drill",
        logoVisible: false,
        map: new Mapbox({
          style: "blank",
          center: [116.2529, 39.542],
          zoom: 1,
          minZoom: 2.5,
          // Mapbox token 申请地址： https://account.mapbox.com/access-tokens
          token:
            "pk.eyJ1IjoiMTgzODI0ZHl0IiwiYSI6ImNqbHExNDVjZzI0ZmUza2wxMDhocnlyem4ifQ.FZoJzmqTtli8hAvvAc1OPA"
        }),
        Logo: false
      });
      this.mapScene.on("loaded", () => {
        const colors = [
          "#EFF3F6",
          "#DBD6FF",
          "#BAB1FF",
          "#9E90FF",
          "#7560F9",
          "#561CF2"
        ];
        this.drillDownLayer = new DrillDownLayer(this.mapScene, {
          provinceData: data.provinceData,
          cityData: data.cityData,
          countyData: data.countryData,
          joinBy: ["adcode", "code"],
          depth: 1,
          drillUpTriggerEvent: "",
          province: {
            provinceStroke: "#783D2D"
          },
          fill: {
            color: {
              field: "total",
              values: total => {
                return total > 10000
                  ? colors[5]
                  : total > 5000
                  ? colors[4]
                  : total > 1000
                  ? colors[3]
                  : total > 500
                  ? colors[2]
                  : total > 0
                  ? colors[1]
                  : colors[0];
              }
            }
          },
          popup: {
            enable: true,
            Html: props => {
              return `<span style="font-weight: bold">${
                props.NAME_CHN
              }</span><br>
                          <span>总量</span>&nbsp;&nbsp;&nbsp;<span>${
                            props.total === undefined ? 0 : props.total
                          }</span>`;
            }
          }
        });
        // 添加地图图例
        const legend = new Control({
          position: "topleft"
        });

        legend.onAdd = function() {
          let el = document.createElement("div");
          el.className = "infolegend legend";
          let grades = [0, 500, 1000, 5000, 10000];
          let grades1 = [1, 501, 1001, 5001];
          el.innerHTML =
            '<p class="title">数量(份)：</p><i style="background:' +
            colors[0] +
            '"></i>' +
            grades[0] +
            "<br>";
          for (let i = 0; i < grades.length; i++) {
            el.innerHTML +=
              '<i style="background:' +
              colors[i + 1] +
              '"></i>' +
              (grades[i + 1]
                ? grades1[i] + "–" + grades[i + 1] + "<br>"
                : ">" + grades[i]);
          }
          return el;
        };
        legend.onRemove = () => {
          console.log("remove legend......");
        };
        this.mapScene.addControl(legend);

        const backBtn = new Control({
          position: "topright"
        });
        let _this = this;
        backBtn.onAdd = function() {
          let el = document.createElement("div");
          let img = document.createElement("img");
          el.className = "goback";
          img.src = require("../../../assets/image/goback.png");
          img.style.width = el.style.width;
          img.style.height = el.style.height;
          el.appendChild(img);
          el.onclick = function() {
            _this.drillDownLayer.drillUp();
          };
          return el;
        };
        backBtn.onRemove = () => {
          console.log("remove button......");
        };
        this.mapScene.addControl(backBtn);
      });
      this.loading = false;
    }
  }
};
</script>

<style scoped>
#container-heat {
  width: 100%;
  min-height: 650px;
  display: flex;
  display: -webkit-flex; /* Safari */
  flex-direction: row;
  align-items: flex-start;
  border-radius: 4px;
  margin: 0;
}
#container-drill {
  width: 100%;
  min-height: 650px;
  display: flex;
  display: -webkit-flex; /* Safari */
  flex-direction: row;
  align-items: flex-start;
  border-radius: 4px;
  margin: 0;
}
:deep(.infolegend) {
  padding: 6px 8px;
  font: 14px/16px Arial, Helvetica, sans-serif;
  background: white;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  border-radius: 5px;
}
:deep(.infolegend h4) {
  margin: 0 0 5px;
  color: #777;
}
:deep(.legend) {
  line-height: 20px;
  color: #555;
}
:deep(.legend i) {
  width: 18px;
  height: 18px;
  float: left;
  margin-right: 8px;
  opacity: 0.7;
}
:deep(.infolegend.legend .title) {
  color: #6a6876;
  margin: 0 0 10px;
  font-weight: 900;
  font-size: 16px;
}

:deep(.l7-top .l7-bottom) {
  position: absolute;
  z-index: 900;
  pointer-events: none;
}
</style>

