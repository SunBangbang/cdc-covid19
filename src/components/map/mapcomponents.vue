<template>
  <div>
    <div id="map_container" :style="mapStyle">
    </div>
    <!--<button>addmarker</button>-->
  </div>
</template>
<script>
import MapLoader from '@/assets/js/AMap.js'
/* eslint-disable */
export default {
  data() {
    return {
      zoom: 14,
      center: [116.410362, 39.881479],
      map: null,
    }
  },
  props: {
    markers: {
      type: Array,
      default: () => [],
    },
    mapStyle: {
      type: String,
      default: 'width: 100%;height: 500px;'
      }
  },
  created() {
    // this.dealMarkers()
  },
  mounted() {
    this.init()
  },
  watch: {
    markers(newValue, oldValue) {
      this.resetMarks()
    }
  },
  methods: {
    init() {
      var that = this
      MapLoader().then(AMap => {
        console.log('地图加载成功')
        that.map = new AMap.Map('map_container', {
          resizeEnable: true,
          center: [116.410362, 39.881479],
          zoom: 13
        })
        that.resetMarks();
      }, e => {
        console.log('地图加载失败', e)

      })
    },
    resetMarks() {
      if (this.map == null) {
        return
      }
      this.map.clearMap();
      var path=[];
      for (let index in this.markers) {
        let marker = this.markers[index]
        let that = this
        var mark = new AMap.Marker({
          map: that.map,
          icon: marker.icon,
          position: [marker.position[0], marker.position[1]],
          infoTitle: marker.infoTitle,
          infoBody: marker.address,
          producer: marker.producer,
          deviceModel: marker.deviceModel,
          type: marker.title,
        });

      //画折线
      path.push(new AMap.LngLat(marker.position[0],marker.position[1]))
        /*两种窗体模式*/
        //创建信息窗体
        // var infoWindow = new AMap.InfoWindow({
        //   content:"路由器"//信息窗体的内容
        // });

        //如果希望的是点击标记才 出现这个信息窗口，那把 下面的注释去掉即可
//	AMap.event.addListener(marker,'click',function(){ //监听点标记的点击事件
//           infoWindow.open(map,mark.getPosition()); //信息窗体打开
//	});
        AMap.event.addListener(mark, 'mouseover', (e) => {
          var that = this
          let installAddress = ''
          if( marker.address === '' || marker.address === undefined){
            installAddress = '请填写位置'
          }else{
            installAddress = marker.address
          }
          AMapUI.loadUI(['overlay/SimpleInfoWindow'], function (SimpleInfoWindow) {
            var infoWindow = new SimpleInfoWindow({
              infoTitle: marker.infoTitle,
              infoBody: marker.infoBody,
              offset: new AMap.Pixel(0, -30),
              autoMove: true
            })
            infoWindow.open(that.map, e.target.getPosition())
            // 最坑的就是这一步了，他的infowindow没有点击事件，所以infoWindow.get$Container()会返回这个infowindow（jquery）对象
            let infoEle = infoWindow.get$Container()
            // 给infowindow添加点击事件，并在回调函数中处理业务或者跳转等
            infoEle.on('click', (e) => {
              // router.push({name: 'proinfo', params: pro})
            })
          })
        })
      }
      var polyline = new AMap.Polyline({
        path: path,
        borderWeight: 2, // 线条宽度，默认为 1
        strokeColor: 'red', // 线条颜色
        lineJoin: 'round' // 折线拐点连接处样式
      });

      // 将折线添加至地图实例
      this.map.add(polyline);
      this.map.setFitView();
    },
    //添加列子
    addMarker() {
      let marker = {
        position: [116.410362 + (Math.random() - 0.8) * 0.02, 39.881479 + (Math.random() - 0.8) * 0.02],
      };
      this.markers.push(marker);
    },
  },
}
</script>
<style>
  .amap-demo {
    height: 300px;
  }
</style>
