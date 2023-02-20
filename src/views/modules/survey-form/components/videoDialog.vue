<template>
  <el-dialog  :title="dialogTitle"
              :visible.sync="visible"
              append-to-body
              :width="width"
              class="video-container"
              @close="handleClose">
    <div class="content-box">
       <el-carousel indicator-position="outside"
                    :autoplay="false"
                    trigger="click"
                    :initial-index="currentIndex"
                    @change="handleChange">
          <el-carousel-item v-for="(item, index) in list" :key="index" :label="index+1">
            <video :src="item" controls="controls" :id="getAttrVal('video',index)">
                您的浏览器不支持视频
            </video>
          </el-carousel-item>
        </el-carousel>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" icon="el-icon-download" @click="handleDownloadCurrent" size="mini">当前下载到本地</el-button>
      <el-button type="primary" icon="el-icon-download" @click="handleDownloadAll" size="mini">全部下载到本地</el-button>
    </span>
  </el-dialog>
</template>
<script>
import {download} from '@/utils/function';
export default {
  name: 'videoDialog',
  data(){
    return {
      visible: false,
      list: [],
      currentIndex: 0
    };
  },
  props: {
    dialogTitle: {
      type: String,
      default: '查看'
    },
    width: {
      type: String,
      default: '35%'
    }
  },
  created() {
    // this.list = this.getVideoList();
  },
  methods: {
    init() {
      this.visible = true;
      this.currentIndex = 0;
    },
    // 下载当前视频
    handleDownloadCurrent() {
      this.list.forEach((item, index) => {
        if(this.currentIndex === index) {
          download(item);
        }
      });
    },
    handleDownloadAll() {
      this.list.forEach((item) =>{
          console.log("item:",item);
        download(item);
      })
    },
    // getVideoList() {
    //   return [{
    //     url: "https://www.runoob.com/try/demo_source/movie.mp4",
    //     label: '1'
    //   },{
    //     url: "https://www.runoob.com/try/demo_source/movie.mp4",
    //     label: '2'
    //   }]
    // },
    handleChange(currentIndex) {
      console.log(`currentIndex: ${currentIndex}`);
      this.currentIndex = currentIndex;
      console.log(this.currentIndex);
    },
    handleClose() {
      console.log("close");
      const id = `video-${this.currentIndex}`;
      this.closeVideo(id);
    },
    getAttrVal(prefix,val) {
      return `${prefix}-${val}`;
    },
    closeVideo(id) {
       var video = document.getElementById(id);
       if(video !== null && !video.paused) {
         video.pause();
       }
    }
  }

}
</script>
<style lang="scss">
  .video-container {
    video {
      height: 100%;
    }
    .el-carousel__item {
      text-align: center;
    }
  }
</style>
