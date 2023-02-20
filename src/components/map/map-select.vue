<template>
  <div class="map-select">
    <el-input :disabled="true"
              v-if="text"
              v-model="text"
              :size="size"
              :placeholder="placeholder">
      <el-button
              :disabled="disabled"
              @click="box=true"
              slot="append">{{textTitle}}</el-button>
    </el-input>
    <el-button
            @click="box=true"
            v-if="!text"
            size="mini"
            type="primary"
            slot="append">
      {{textTitle}}
    </el-button>

    <el-dialog class="avue-map__dialog"
               width="80%"
               append-to-body
               modal-append-to-body
               :close-on-click-modal="false"
               :title="title"
               @close="handleClose"
               :visible.sync="box">
      <div class="avue-map__content"
           v-if="box">
        <el-row>
          <el-col :span="18">
            <el-input class="avue-map__content-input"
                      id="map__input"
                      :readonly="disabled"
                      v-model="address"
                      clearable
                      placeholder="输入关键字选取地点"></el-input>
          </el-col>
          <el-col :span="6">
            <el-button class="avue-map__content-button"
                       type="primary"
                       @click="box = false"
                       :size="size">确认选择</el-button>
            <el-button class="avue-map__content-button"
                       type="primary"
                       @click="cancel"
                       :size="size">取消选择</el-button>
          </el-col>
        </el-row>
        <div class="avue-map__content-box">
          <div id="map__container"
               class="avue-map__content-container"
               tabindex="0"></div>
          <div id="map__result"
               class="avue-map__content-result"></div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  export default {
    name: "MapSelect",
    props: {
      size: String,
      placeholder: String,
      disabled: {
        type: Boolean,
        default: false,
      },
      value: {
        type: Object,
        default: () => {
          return {};
        }
      }
    },
    data () {
      return {
        address: '',
        poi: {},
        marker: null,
        map: null,
        box: false
      };
    },
    watch: {
      value: {
        handler (val) {
          this.poi = val? val : {};
        },
        deep: true,
        immediate: true
      },
      poi: {
        handler (val) {
          if (val.city === undefined || val.city === null || typeof val.city === 'string') {
            this.$emit("input", val);
          }
        },
        deep: true
      },
      text: {
        handler (val) {
          this.address = val;
        },
        deep: true,
        immediate: true
      },
      box: {
        handler () {
          if (this.box) {
            this.$nextTick(() =>
              this.init(() => {
                if (this.longitude && this.latitude) {
                  this.addMarker(this.longitude, this.latitude);
                  this.getAddress(this.longitude, this.latitude);
                }
              })
            );
          }
        },
        immediate: true
      }
    },
    computed: {
      longitude () {
        return this.poi.longitude
      },
      latitude () {
        return this.poi.latitude
      },
      text () {
        if (this.poi.city === undefined || this.poi.city === null || typeof this.poi.city === 'string') {
          return this.poi.formattedAddress
        }
        return ''
      },
      title () {
        return this.disabled ? "查看坐标" : '选择坐标'
      },
      textTitle () {
        return this.disabled ? this.title : (this.poi.name === undefined ? "选择坐标" : "重新选择");
      }
    },
    methods: {
      cancel(){
        this.address = null
        this.poi = {}
        this.box = false
      },
      //新增坐标
      addMarker (R, P) {
        this.clearMarker();
        this.marker = new window.AMap.Marker({
          position: [R, P]
        });
        this.marker.setMap(this.map);
      },
      //清空坐标
      clearMarker () {
        if (this.marker) {
          this.marker.setMap(null);
          this.marker = null;
        }
      },
      //获取坐标
      getAddress (R, P) {
        new window.AMap.service("AMap.Geocoder", () => {
          //回调函数
          let geocoder = new window.AMap.Geocoder({});
          geocoder.getAddress([R, P], (status, result) => {
            if (status === "complete" && result.info === "OK") {
              const regeocode = result.regeocode;
              if(regeocode.addressComponent){
                let addComp = regeocode.addressComponent
                let addressComponent = {
                  province: addComp.province, adcode: addComp.adcode, city: addComp.city, citycode: addComp.citycode, country: addComp.country,
                  district: addComp.district, street: addComp.street, streetNumber: addComp.streetNumber, township: addComp.township
                }
                //只保留部分数据
                delete regeocode.addressComponent
                regeocode.addressComponent = addressComponent
              }
              delete regeocode.crosses
              delete regeocode.roads
              console.log('addressComponent:', regeocode.addressComponent)

              this.poi = Object.assign(regeocode, {
                longitude: R,
                latitude: P
              });
              // 自定义点标记内容
              var markerContent = document.createElement("div");

              // 点标记中的图标
              var markerImg = document.createElement("img");
              markerImg.src =
                "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png";
              markerContent.appendChild(markerImg);

              // 点标记中的文本
              var markerSpan = document.createElement("span");
              markerSpan.className = "avue-map__marker";
              markerSpan.innerHTML = this.text;
              markerContent.appendChild(markerSpan);
              this.marker.setContent(markerContent); //更新点标记内容
            }
          });
        });
      },
      handleClose () {
        window.poiPicker.clearSearchResults();
      },
      addClick () {
        this.map.on("click", e => {
          const lnglat = e.lnglat;
          const P = lnglat.P || lnglat.Q;
          const R = lnglat.R;
          this.addMarker(R, P);
          this.getAddress(R, P);
        });
      },
      init (callback) {
        this.map = new window.AMap.Map("map__container", {
          zoom: 13,
          center: (() => {
            if (this.longitude && this.latitude) {
              return [this.longitude, this.latitude];
            }
          })()
        });
        this.initPoip();
        this.addClick();
        callback();
      },
      initPoip () {
        window.AMapUI.loadUI(["misc/PoiPicker"], PoiPicker => {
          var poiPicker = new PoiPicker({
            input: "map__input",
            placeSearchOptions: {
              map: this.map,
              pageSize: 10
            },
            searchResultsContainer: "map__result"
          });
          //初始化poiPicker
          this.poiPickerReady(poiPicker);
        });
      },
      poiPickerReady (poiPicker) {
        window.poiPicker = poiPicker;
        //选取了某个POI
        poiPicker.on("poiPicked", poiResult => {
          this.clearMarker();
          var source = poiResult.source, poi = poiResult.item;
          // console.log('source:', poi)
          let preName = poi.pname? poi.pname : '' + poi.cityname? poi.cityname : '' + poi.adname? poi.adname : ''
          preName = preName? preName : (poi.district? poi.district : '')
          let formattedAddress = preName + poi.address + poi.name
          // this.poi = Object.assign(poi, {
          //   formattedAddress: formattedAddress,
          //   longitude: poi.location.lng,
          //   latitude: poi.location.lat
          // });
          this.poi = {
            province: poi.pname,
            city: poi.cityname,
            district: poi.adname? poi.adname : poi.district,
            formattedAddress: formattedAddress,
            longitude: poi.location.lng,
            latitude: poi.location.lat,
            adcode: poi.adcode
          }
          // console.log('poi..............', this.poi)
          if (source !== "search") {
            poiPicker.searchByKeyword(poi.name);
          }
        });
      }
    }
  };
</script>

<style lang="scss">
  .amap-icon img,
  .amap-marker-content img {
    width: 25px;
    height: 34px;
  }
  .avue-map {
    &__dialog {
      min-height: 400px;
      .el-dialog {
        height: 80%;
        .el-dialog__body {
          height: 90%;
        }
      }
    }
    &__marker {
      position: absolute;
      top: -20px;
      right: -118px;
      color: #fff;
      padding: 4px 10px;
      box-shadow: 1px 1px 1px rgba(10, 10, 10, 0.2);
      white-space: nowrap;
      font-size: 12px;
      font-family: "";
      background-color: #25a5f7;
      border-radius: 3px;
    }
    &__content {
      height: 100%;
      &-input {
        margin-bottom: 10px;
        width: 50%;
        margin-right: 20px;
      }
      &-box {
        position: relative;
        height: calc(100% - 30px);
      }
      &-container {
        width: 100%;
        height: 100%;
      }
      &-result {
        display: block !important;
        position: absolute;
        top: 0;
        right: -8px;
        width: 250px;
        height: 100%;
        overflow-y: auto;
      }
    }
  }
</style>
