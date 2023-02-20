<template>
  <el-dialog
    title="地图轨迹"
    :visible.sync="dialogVisible"
    width="80%"
    top="5vh"
    :before-close="handleClose"
    :fullscreen="fullscreen"
  >
    <div slot="title" class="">
      <span class="el-dialog__title" @click="fullScreenHandle()">
        <label>地图轨迹</label>
        <svg
          class="icon-svg aui-navbar__icon-menu icon-full"
          aria-hidden="true"
        >
          <use xlink:href="#icon-fullscreen"></use>
        </svg>
      </span>

      <el-date-picker
        style="margin-left: 20px"
        size="small"
        v-model="dateRange"
        type="daterange"
        align="right"
        unlink-panels
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :default-time="['00:00:00', '23:59:59']"
        :picker-options="pickerOptions"
      >
      </el-date-picker>
      <el-select
        style="margin-left: 20px"
        size="small"
        v-model="names"
        multiple
        collapse-tags
        placeholder="请选择调查对象"
      >
        <el-option
          v-for="item in nameOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>

      <el-button size="small" @click="doFilter" style="margin-left: 20px"
        >过滤</el-button
      >
      <el-button size="small" @click="exportData">轨迹导出</el-button>
    </div>
    <!--        <div style="float:right;margin-top:-20px;">-->
    <!--            <el-button type="primary" @click="dialogVisible = false" size="mini">关 闭</el-button>-->
    <!--        </div>-->
    <multi-map-components
      ref="multiMap"
      v-if="mapVisible"
      style="height: 100%"
      :mapStyle.sync="mapStyle"
    ></multi-map-components>
    <div id="mapContainer" style="height: 100%" v-if="!mapVisible">
      <h3 style="text-align: center">{{ message }}</h3>
    </div>
  </el-dialog>
</template>

<script>
import screenfull from "screenfull";
import MultiMapComponents from "@/components/map/multi-map-components";
import { getTracks } from "@/api/survey-form/sample";
import moment from "moment";
import { workbook2blob, openDownloadDialog } from "@/utils/index";

export default {
  name: "MultiMapDialog",
  components: {
    MultiMapComponents,
  },
  data() {
    return {
      dialogVisible: false,
      sids: "",
      surveyFormId: "",
      tracks: [],
      fullscreen: false,
      mapStyle: "width: 100%;height: 500px;",
      mapVisible: false,
      message: "等待...",
      dateRange: "",
      //调查对象选项列表
      nameOptions: [],
      names: [],
      pickerOptions: {
        shortcuts: [
          {
            text: "最近7天",
            onClick(picker) {
              const now = new Date();
              const end = new Date();
              const start = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDay()
              );
              start.setTime(now.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            },
          },
          // {
          //   text: "最近14天",
          //   onClick(picker) {
          //     const now = new Date();
          //     const end = new Date();
          //     const start = new Date(
          //       now.getFullYear(),
          //       now.getMonth(),
          //       now.getDay()
          //     );
          //     start.setTime(now.getTime() - 3600 * 1000 * 24 * 14);
          //     picker.$emit("pick", [start, end]);
          //   },
          // },
        ],
      },
    };
  },
  created() {},
  methods: {
    handleClose(done) {
      done();
      this.mapStyle = "width: 100%;height: 500px;";
      this.fullscreen = false;
      this.mapVisible = false;
    },
    fullScreenHandle() {
      if (!screenfull.enabled) {
        return this.$message({
          message: this.$t("fullscreen.prompt"),
          type: "warning",
          duration: 500,
        });
      }
      this.fullscreen = true;
      this.mapStyle = "width: 100%;height: 1200px;";
      screenfull.toggle();
    },
    loadTracks() {
      this.dateRange = "";
      this.nameOptions = [];
      this.names = [];
      getTracks(this.sids, this.surveyFormId).then((res) => {
        if (res.data.code === 0) {
          this.tracks = res.data.data;
          //只显示有轨迹的问卷样本
          this.tracks = this.tracks.filter((item) => item.places.length > 0);
          this.nameOptions = this.tracks.map((track) => {
            return { label: track.name, value: track.sid };
          });
          let tracks = this.handleTrack();

          if (tracks.length > 0) {
            this.mapVisible = true;
            this.$nextTick(() => {
              console.log("next tick:", tracks);
              this.$refs["multiMap"].tracks = tracks;
              this.$refs["multiMap"].nameOptions = tracks.map(
                (item) => item.sid
              );
              this.$refs["multiMap"].addColor();
              this.$refs["multiMap"].resetMarks();
            });
          } else {
            this.mapVisible = false;
            this.message = "没有轨迹";
          }
        } else {
          console.error("err:", res.data.msg);
          this.$message.error(res.data.msg);
        }
      });
    },
    doFilter() {
      let tracks = this.handleTrack();
      this.mapVisible = true;
      this.$nextTick(() => {
        console.log("next tick:", tracks);
        this.$refs["multiMap"].tracks = tracks;
        this.$refs["multiMap"].nameOptions = tracks.map((item) => item.sid);
        this.$refs["multiMap"].addColor();
        this.$refs["multiMap"].resetMarks();
      });
    },
    handleTrack() {
      let filterPerson = this.names.length > 0;
      let tracks = [];
      if (filterPerson) {
        tracks = this.tracks.filter((track) => this.names.includes(track.sid));
      } else {
        tracks = this.tracks;
      }
      let filterDate = this.dateRange && this.dateRange.length > 0;
      let start, end;
      if (filterDate) {
        start = moment(this.dateRange[0]);
        end = moment(this.dateRange[1]);
      }
      const dateFormat = "YYYY-MM-DD HH:mm";
      tracks.forEach((track) => {
        let markers = [];
        let map = new Map();
        track.places.forEach((v) => {
          let start2,
            end2,
            include = false;
          let item = {
            position: [v.longitude, v.latitude],
            infoTitle: v.formattedAddress,
            infoBody: "",
          };
          if (filterDate) {
            if (!this.validatenull(v.start)) {
              start2 = moment(v.start);
              if (!this.validatenull(v.end)) {
                end2 = moment(v.end);
              }
              //只要开始时间在时间范围内就显示, [start, end]
              if (start2.isAfter(start) && start2.isBefore(end)) {
                item.infoBody = start2.format(dateFormat);
                if (!this.validatenull(end2)) {
                  item.infoBody += "至" + end2.format(dateFormat);
                }
                include = true;
              } else if (
                !this.validatenull(end2) &&
                start.isAfter(start2) &&
                start.isBefore(end2)
              ) {
                item.infoBody +=
                  start2.format(dateFormat) + "至" + end2.format(dateFormat);
                include = true;
              } else {
                include = false;
              }
            }
          } else {
            include = true;
            if (!this.validatenull(v.start)) {
              item.infoBody = moment(v.start).format(dateFormat);
              if (!this.validatenull(v.end)) {
                item.infoBody += "至" + moment(v.end).format(dateFormat);
              }
            }
          }
          if (include) {
            let realItem = map.get(item.infoTitle);
            if (realItem) {
              if(realItem.infoBody.indexOf(item.infoBody) != -1) {
                return
              }
              realItem.infoBody = realItem.infoBody + ", " + item.infoBody;
              if (realItem.infoBody === ", ") {
                realItem.infoBody = "";
              }
            } else {
              realItem = item;
              map.set(item.infoTitle, realItem);
            }
          }
        });
        //同一个人可能去一个地方多次
        for (let item of map.values()) {
          markers.push(item);
        }
        track.markers = markers;
        // delete track.places
      });
      // console.log('track:', tracks)
      return tracks;
    },
    exportData() {
      let rowData = [];
      let epidSpotData = [];
      this.tracks.forEach((track) => {
        track.places.forEach((place) => {
          let d = {
            name: track.name,
            address: place.formattedAddress,
            trackRisk: place.trackRisk,
            trackPlaceName: place.trackPlaceName,
            trackVehicle: place.trackVehicle,
            epidSpot: place.epidSpot,
            ccPersonName: place.ccPersonName,
            cvcType: place.cvcType,
          };
          if (place.start && place.end) {
            d.time =
              moment(place.start).format("YYYY-MM-DD HH:mm") +
              "至" +
              moment(place.end).format("YYYY-MM-DD HH:mm");
          } else if (place.start) {
            d.time = moment(place.start).format("YYYY-MM-DD HH:mm");
          } else if (place.end) {
            d.time = moment(place.end).format("YYYY-MM-DD HH:mm");
          }
          rowData.push(d);
        });

        track.epidSpots.forEach((place) => {
          let d = {
            address: place.formattedAddress,
            trackPlaceName: place.trackPlaceName,
            trackVehicle: place.trackVehicle,
            ccPersonName: place.ccPersonName,
            cvcType: place.cvcType,
          };
          if (place.start && place.end) {
            d.time =
              moment(place.start).format("YYYY-MM-DD HH:mm") +
              "至" +
              moment(place.end).format("YYYY-MM-DD HH:mm");
          } else if (place.start) {
            d.time = moment(place.start).format("YYYY-MM-DD HH:mm");
          } else if (place.end) {
            d.time = moment(place.end).format("YYYY-MM-DD HH:mm");
          }
          epidSpotData.push(d);
        });
      });

      let sheet1data = rowData.map((ele) => {
        // return { 姓名: ele.name, 时间: ele.time, 地址: ele.address };
        return {
          时间段: ele.time,
          详细地址: ele.address,
          场所名称: ele.trackPlaceName,
          乘坐交通工具: ele.trackVehicle,
          是否存在风险: ele.trackRisk,
          是否疫点: ele.epidSpot,
          接触人员姓名: ele.ccPersonName,
          接触情形: ele.cvcType,
        };
      });
      // let sheet2data = [...epidSpotData].map((ele) => {
      //   return { 时间: ele.time, 地址: ele.address };
      // });
      let sheet1 = XLSX.utils.json_to_sheet(sheet1data);
      // let sheet2 = XLSX.utils.json_to_sheet(sheet2data);

      /* create a new blank workbook */
      var wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, sheet1, "轨迹点");
      // XLSX.utils.book_append_sheet(wb, sheet2, "疫点");

      const workbookBlob = workbook2blob(wb);
      // 点击下载
      openDownloadDialog(workbookBlob, `风险点位排查一览表.xlsx`);
    },
  },
};
</script>
