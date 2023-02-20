<template>
  <el-dialog  :title="dialogTitle"
              :visible.sync="visible"
              append-to-body
              :width="width"
              class="audio-container"
              @close="handleClose">
    <div class="content-box">
       <el-carousel indicator-position="outside"
                    :autoplay="false"
                    :initial-index="currentIndex"
                    trigger="click"
                    @change="handleChange">
          <el-carousel-item v-for="(item, index) in list" :key="index" :label="index+1">
            <audio :src="item" controls="controls" :id="getAttrVal('audio',index)">
            您的浏览器不支持.
            </audio>
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
  name: 'audioDialog',
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
    // this.list = this.getAudioList();
  },
  methods: {
    init() {
      this.visible = true;
      this.currentIndex = 0;
    },
    handleDownloadCurrent() {
      this.list.forEach((item, index) => {
        if(this.currentIndex === index) {
          download(item);
        }
      });
    },
    handleDownloadAll() {
      this.list.forEach((item) =>{
        download(item);
      })
    },
    // getAudioList() {
    //   return [{
    //     url: 'http://mp32.9ku.com/upload/128/2020/04/16/1003604.mp3'
    //     },
    //     {
    //       url: 'http://mp32.9ku.com/upload/128/2019/08/14/994784.mp3'
    //     }];
    // },
    handleChange(currentIndex, lastIndex) {
      console.log(`currentIndex: ${currentIndex}, lastIndex: ${lastIndex}`);
      this.currentIndex = currentIndex;
      console.log(this.currentIndex);
    },
    handleClose() {
      console.log("close");
      const id = `audio-${this.currentIndex}`;
      this.closeAudio(id);
    },
    getAttrVal(prefix,val) {
      return `${prefix}-${val}`;
    },
    closeAudio(id) {
       var audio = document.getElementById(id);
       if(audio !== null && !audio.paused) {
         audio.pause();
       }
    }
  }

}
</script>
<style lang="scss" scoped>
  .audio-container {
    audio {
      width: 100%;
    }
  }
</style>
