<template>
  <div>
    <el-container>
      <el-container>
        <el-main id="map_container" :style="mapStyle">

        </el-main>
        <el-aside width="130px" style="border-radius: 10px;">
          <div class="right-title" style="margin-bottom: 10px;">
            <el-button size="mini" :loading="btnLoading" @click="openCircleEditor" style="margin-bottom: 5px">开始编辑</el-button>
            <el-button size="mini" :loading="btnLoading" @click="closeCircleEditor" style="margin-left: 0px">结束编辑</el-button>
             <el-checkbox v-model="hide" @change="hideLine">隐藏线条</el-checkbox>
          </div>
          <div class="right-title" style="margin-bottom: 10px;">参与者</div>
          <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange" class="right-title">全选</el-checkbox>
          <el-checkbox-group v-model="checkedNameList" class="name-group" @change="handleCheckedNamesChange">
            <el-checkbox
                    v-for="(item, index) in tracks"
                    :key="index"
                    :label="item.sid" >
              {{item.name}}
            </el-checkbox>
          </el-checkbox-group>
        </el-aside>
      </el-container>
    </el-container>


  </div>
</template>
<script>
import MapLoader from '@/assets/js/AMap.js'
import createColors from './Colors'

/* eslint-disable */
export default {
  name: 'MultiMapComponents',
  data() {
    return {
      zoom: 14,
      center: [116.410362, 39.881479],
      map: null,
      tracks: [],
      checkedNameList: [], //被调查人列表
      isIndeterminate: false,
      checkAll: true,
      nameOptions: 0,
      hide: false,
      circleMap: new Map(),
      points: [],
      circleEditor: null,
      btnLoading: true
    }
  },
  props: {
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
      let that = this
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
    hideLine(val){
        if(val){
            this.resetMarks(false)
        }else{
            this.resetMarks()
        }
    },
    handleCheckedNamesChange(val) {
      let checkedCount = val.length;
      this.checkAll = checkedCount === this.nameOptions.length;
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.nameOptions.length;

      this.resetMarks(!this.hide)
    },
    handleCheckAllChange(val){
      this.checkedNameList = val ? this.nameOptions : [];
      this.isIndeterminate = this.checkedNameList.length === this.nameOptions.length;

      this.resetMarks(!this.hide)
    },
    addColor(){
      this.checkedNameList = []
      let colors = createColors(this.tracks.length)
      let m = 0;
      this.tracks.forEach(track=> {
        track.color=colors[m++].hex
        this.checkedNameList.push(track.sid)
      })
    },
    resetMarks(addLine = true) {
      if (this.map == null) {
        return
      }
      this.map.clearMap();

      for(let index in this.tracks){
        let track = this.tracks[index]
        if(!this.checkedNameList.includes(track.sid)){
          continue
        }

        let path = [];
        for(let i in track.markers){
          let marker = track.markers[i]
          let that = this
          let mark = new AMap.Marker({
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
          let point = new AMap.LngLat(marker.position[0],marker.position[1])
          path.push(point)
          this.points.push(point)
          let circle = new AMap.Circle({
            center: point,// 圆心位置
            radius: 5000, //半径
            strokeColor: "#FF33FF", //线颜色
            strokeOpacity: 0.7, //线透明度
            strokeWeight: 3,    //线宽
            fillColor: "#1791fc", //填充色
            fillOpacity: 0.5//填充透明度
          });
          this.circleMap.set(point, circle)

          /*两种窗体模式*/
          //创建信息窗体
          // let infoWindow = new AMap.InfoWindow({
          //   content:"路由器"//信息窗体的内容
          // });

          //如果希望的是点击标记才 出现这个信息窗口，那把 下面的注释去掉即可
//	AMap.event.addListener(marker,'click',function(){ //监听点标记的点击事件
//           infoWindow.open(map,mark.getPosition()); //信息窗体打开
//	});
          AMap.event.addListener(mark, 'mouseover', (e) => {
            let that = this
            let installAddress = ''
            if( marker.address === '' || marker.address === undefined){
              installAddress = '请填写位置'
            }else{
              installAddress = marker.address
            }
            AMapUI.loadUI(['overlay/SimpleInfoWindow'], function (SimpleInfoWindow) {
              let infoWindow = new SimpleInfoWindow({
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

        if(addLine){
            let polyline = new AMap.Polyline({
                path: path,
                borderWeight: 1, // 线条宽度，默认为 1
                strokeColor: track.color, // 线条颜色
                lineJoin: 'round' // 折线拐点连接处样式
            });
            // 将折线添加至地图实例
            this.map.add(polyline);
        }
      }

      this.handleCircle()
      this.map.setFitView();
    },
    //添加列子
    addMarker() {
      let marker = {
        position: [116.410362 + (Math.random() - 0.8) * 0.02, 39.881479 + (Math.random() - 0.8) * 0.02],
      };
      this.markers.push(marker);
    },
    handleCircle(){
      let countMap = new Map()
      this.circleMap.forEach((circle, key) => {
        for(let i=0; i<this.points.length; i++){
          let point = this.points[i]
          if(circle.contains(point)){
            //如果点在圆内则输出
            let p = countMap.get(key)
            if(p){
              p.count++
              // countMap.set(key, p)
            }else{
              p = {point: key, count: 1}
              countMap.set(key, p)
            }
          }
        }

      })

      // console.log(countMap.values())
      let arr = []
      for (let value of countMap.values()) {
        arr.push(value)
      }
      arr.sort((n1, n2)=> {
        return n2.count-n1.count
      })
      // console.log('arr:', arr)

      let centerPoint = arr[0].point
      this.circleMap.get(centerPoint).setMap(this.map)
      let circle = this.circleMap.get(centerPoint)

      this.circleEditor = new AMap.CircleEditor(this.map, circle);   //创建圆形编辑器对象

      this.circleEditor.on('move', function(event) {
        console.log('触发事件：move')
      })

      this.circleEditor.on('adjust', function(event) {
        console.log('触发事件：adjust')
      })

      this.circleEditor.on('end', function(event) {
        console.log('触发事件： end')
        // event.target 即为编辑后的圆形对象
      })
      this.$nextTick(() => {
        this.btnLoading = false
      });
    },
    openCircleEditor(){
      if(this.circleEditor === null) {
        this.$message.warning('请耐心等待工具加载完毕')
      }
      console.log('open .......')
      this.circleEditor.open()
    },
    closeCircleEditor(){
      if(this.circleEditor === null) {
        this.$message.warning('请耐心等待工具加载完毕')
      }
      console.log('close .......')
      this.circleEditor.close()
    }
  },
}
</script>
<style lang="scss" scoped>
  .amap-demo {
    height: 300px;
  }

  .name-group {
    .el-checkbox{
      display: block;
      margin-top: 5px;
      margin-left: 5px;
      font-weight: bold;
    }
  }
  .right-title{
    margin-left: 5px;
    font-weight: bold;
  }

  .input-card {
    display: flex;
    flex-direction: column;
    min-width: 0;
    word-wrap: break-word;
    background-color: #fff;
    background-clip: border-box;
    border-radius: .25rem;
    width: 22rem;
    border-width: 0;
    border-radius: 0.4rem;
    box-shadow: 0 2px 6px 0 rgba(114, 124, 245, .5);
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    -ms-flex: 1 1 auto;
    flex: 1 1 auto;
    padding: 0.75rem 1.25rem;
  }

  .btn {
    display: inline-block;
    font-weight: 400;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    border: 1px solid transparent;
    transition: color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out;
    background-color: transparent;
    background-image: none;
    color: #25A5F7;
    border-color: #25A5F7;
    padding: .25rem .5rem;
    line-height: 1.5;
    border-radius: 1rem;
    -webkit-appearance: button;
    cursor:pointer;
  }
</style>

<style type="text/css">

</style>
