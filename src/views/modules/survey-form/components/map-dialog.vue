<template>
    <el-dialog title="地图轨迹" :visible.sync="dialogVisible" width="80%" top="5vh" :before-close="handleClose" :fullscreen="fullscreen">
        <div slot="title" class="">
           <span class="el-dialog__title" @click="fullScreenHandle()">
               <label>地图轨迹</label>
               <svg class="icon-svg aui-navbar__icon-menu icon-full" aria-hidden="true">
                   <use xlink:href="#icon-fullscreen"></use>
               </svg>
           </span>
        </div>
<!--        <div style="float:right;margin-top:-20px;">-->
<!--            <el-button type="primary" @click="dialogVisible = false" size="mini">关 闭</el-button>-->
<!--        </div>-->
        <mapcomponents v-if="mapVisible" :markers="markers" style="height: 100%" :mapStyle.sync="mapStyle"></mapcomponents>
        <div id="mapContainer" style="height: 100%;" v-if="!mapVisible ">
            <h3 style="text-align: center;">没有轨迹</h3>
        </div>

    </el-dialog>
</template>

<script>
  import screenfull from 'screenfull'
  import Mapcomponents from '@/components/map/mapcomponents'
  export default {
    components: {
      Mapcomponents
    },
    data() {
      return {
        dialogVisible: false,
        markers: [],
        fullscreen: false,
        mapStyle: 'width: 100%;height: 500px;',
        mapVisible: false
      };
    },
    methods: {
      handleClose(done) {
        done()
        this.mapStyle = 'width: 100%;height: 500px;'
        this.fullscreen = false
      },
      fullScreenHandle () {
            if (!screenfull.enabled) {
                return this.$message({
                    message: this.$t('fullscreen.prompt'),
                    type: 'warning',
                    duration: 500
                })
            }
            this.fullscreen = true
            this.mapStyle = 'width: 100%;height: 1200px;'
            screenfull.toggle()
        },
    }
  };
</script>
