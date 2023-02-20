<template>
  <div id="map-cell">

  </div>
</template>
<script>
import { Scene, Control } from '@antv/l7'
import { DrillDownLayer } from '@antv/l7-district'
import { Mapbox } from '@antv/l7-maps'
import { getProvince, getCity, getDistrict } from '@/api/dashboard/dashboard'

export default {
  name: 'chinaMap',
  data() {
    return {
      mapScene: null,
      mapBox: null,
      legend: null,
      backBtn: null,
      drillDownLayer: null
    }
  },
  beforeDestroy() {
    console.log('destroyed.........')
    if (this.mapScene != null) {
      this.mapScene.removeControl(this.legend)
      this.mapScene.removeControl(this.backBtn)
      this.drillDownLayer.destroy()
      this.drillDownLayer = null
      this.mapScene.destroy()
      this.mapScene = null
      this.legend = null
      this.backBtn = null
      this.mapBox = null
    }

    let mapCell = document.getElementById('map-cell')
    if(mapCell) {
      let child = mapCell.childNodes
      child.forEach(node => mapCell.removeChild(node))
    }
  },
  mounted() {
    if(window.loginLoading !== undefined) {
      window.loginLoading.close();
    }
    let params = {};
    getProvince('all', params).then(res => {
      getCity(params).then(res1 => {
        getDistrict(params).then(res2 => {
          const provinceData = res.data.data;
          const cityData = res1.data.data;
          const countryData = res2.data.data;
          // console.log(provinceData)
          this.newScene(provinceData, cityData, countryData)
        })
      })
    })

  },
  methods: {
    newScene(provinceData, cityData, countryData){
      this.mapBox = new Mapbox({
        style: 'blank',
        center: [116.2529, 39.5420],
        zoom: 1,
        minZoom: 2.5,
        // Mapbox token 申请地址： https://account.mapbox.com/access-tokens
        token: 'pk.eyJ1IjoiMTgzODI0ZHl0IiwiYSI6ImNqbHExNDVjZzI0ZmUza2wxMDhocnlyem4ifQ.FZoJzmqTtli8hAvvAc1OPA',
      })
      this.mapScene = new Scene({
        id: 'map-cell',
        logoVisible: false,
        map: this.mapBox ,
        Logo: false,
      })
      let _this = this
      this.mapScene.on('loaded', () => {
        const colors = [
          "#EFF3F6",
          "#DBD6FF",
          "#BAB1FF",
          "#9E90FF",
          "#7560F9",
          "#561CF2"
        ]
        this.drillDownLayer = new DrillDownLayer(this.mapScene, {
          provinceData: provinceData,
          cityData: cityData,
          countyData: countryData,
          joinBy: ["adcode", "code"],
          depth: 1,
          drillUpTriggerEvent: '',
          province: {
            provinceStroke: "#783D2D"
          },
          fill: {
            color: {
              field: 'total',
              values: (total) => {
                return total > 10000
                        ? colors[5]
                        : total > 5000
                                ? colors[4]
                                : total > 1000
                                        ? colors[3]
                                        : total > 500
                                                ? colors[2]
                                                :total > 0
                                                        ? colors[1]
                                                        : colors[0];
              }
            }
          },
          popup: {
            enable: true,
            Html: props => {
              return `<span style="font-weight: bold">${props.NAME_CHN}</span><br>
                          <span>总量</span>&nbsp;&nbsp;&nbsp;<span>${props.total === undefined ? 0 : props.total}</span>`;
            }
          }
        })

        // 添加地图图例
        this.legend = new Control({
          position: 'topleft'
        })
        let legendDiv
        this.legend.onAdd = function () {
          legendDiv = document.createElement("div")
          legendDiv.className = "infolegend legend"
          let grades = [0, 500, 1000, 5000, 10000]
          let grades1 = [1, 501, 1001, 5001]
          legendDiv.innerHTML = '<p class="title">数量(份)：</p><i style="background:' +
                  colors[0] +
                  '"></i>' + grades[0] + "<br>"
          for (let i = 0; i < grades.length; i++) {
            legendDiv.innerHTML +=
                    '<i style="background:' +
                    colors[i+1] +
                    '"></i>' +
                    (grades[i + 1] ? grades1[i] + "–" + grades[i + 1] + "<br>" : ">" + grades[i])
          }
          return legendDiv
        }
        this.legend.onRemove = () =>{
          console.log('remove legend......')
          legendDiv.innerHTML = ''
          legendDiv = null
        }
        this.mapScene.addControl(this.legend)

        this.backBtn = new Control({
          position: 'topright'
        })
        let el, img
        this.backBtn.onAdd = function () {
          el = document.createElement("div")
          img = document.createElement("img")
          el.className = 'goback'
          el.id='goback'
          img.src = require("@/assets/image/goback.png")
          img.style.width = el.style.width
          img.style.height = el.style.height
          el.appendChild(img)
          el.onclick = function () {
            _this.drillDownLayer.drillUp()
          }
          return el
        }
        this.backBtn.onRemove = () =>{
          console.log('remove backBtn......')
          el.removeChild(img)
          img = null
          el = null
        }
        this.mapScene.addControl(this.backBtn)
      })

    },
  }
}
</script>
<style lang="scss" scoped>
  .goback {
    cursor: pointer;
  }
  #map-cell {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
    min-height: 650px;
    display: flex;
    display: -webkit-flex; /* Safari */
    flex-direction: row;
    align-items: flex-start;
    border-radius: 4px;
    margin: 0;
    z-index: 110;
  }
</style>
