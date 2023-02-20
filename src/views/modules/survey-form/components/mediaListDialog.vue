<template>
  <el-dialog  :title="dialogTitle"
              :visible.sync="visible"
              append-to-body
              :width="width"
              class="media-container"
              @closed="handleClose">
    <div class="content-box">
       <el-carousel indicator-position="outside"
                    :autoplay="false"
                    :initial-index="currentIndex"
                    trigger="click"
                    @change="handleChange">
          <el-carousel-item v-for="(item, index) in list" :key="index" :label="index+1">
            <audio v-if="item.type === 0" :src="item.mediaUrl" controls="controls" :id="getAttrVal('media',index)">
                 您的浏览器不支持.
            </audio>
            <video v-else :src="item.mediaUrl" controls="controls" :id="getAttrVal('media',index)">
                  您的浏览器不支持视频
            </video>
          </el-carousel-item>
        </el-carousel>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" size="mini" icon="el-icon-download" @click="downLoadCurrent">当前下载到本地</el-button>
      <el-button type="primary" size="mini" icon="el-icon-download" @click="downLoadAll">全部下载到本地</el-button>
      <el-button type="primary" v-if="canDel" icon="el-icon-delete" @click="removeMedia" size="mini">删除当前录制</el-button>
      <el-button type="primary" @click="visible = false" size="mini">关 闭</el-button>
    </span>
  </el-dialog>
</template>
<script>
export default {
  name: 'MediaListDialog',
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
      default: '查看录制'
    },
    width: {
      type: String,
      default: '50%'
    },
    canDel: {
      type: Boolean,
      default: false
    },
    formId: {
      type: String,
      default: null
    },
    sampleId: {
      type: String,
      default: null
    },
  },
  created() {
  },
  methods: {
    init(mediaList) {
      this.visible = true;
      this.currentIndex = 0;
      this.list = mediaList
    },
    handleChange(currentIndex, lastIndex) {
      console.log(`currentIndex: ${currentIndex}, lastIndex: ${lastIndex}`);
      this.currentIndex = currentIndex;
    },
    handleClose() {
      const id = `media-${this.currentIndex}`;
      this.closeAudio(id);
      this.$emit('close')
    },
    getAttrVal(prefix,val) {
      return `${prefix}-${val}`;
    },
    closeAudio(id) {
       var audio = document.getElementById(id);
       if(audio !== null && !audio.paused) {
         audio.pause();
       }
       this.visible = false
    },
    removeMedia(){
        if(this.list.length > 0){
            this.$confirm('是否删除?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                cancelButtonClass: "btn-custom-cancel",
                type: 'warning'
            }).then(() => {
                this.list.forEach((item, index) => {
                    if(this.currentIndex === index) {
                      console.log('del ', index)
                      this.list.splice(index, 1)
                    }
                })
            }).catch(() => {
                console.log('取消')
            })
        }
      },
      downLoadCurrent() {
        let fileList = [this.list[this.currentIndex]]
        this.downLoadAll(fileList)
      },
      downLoadAll(fileList) {
        let list = fileList && fileList.length > 0 ? fileList : this.list
        if(list.length < 1 || !list[0]) {
          this.$message.info("没有音视频数据！")
          return
        }
        list.forEach((item, idx) => {
          let mediaUrl = item.mediaUrl
          let index = fileList && fileList.length > 0 ? this.currentIndex + 1 : idx + 1
          if(mediaUrl) {
            let urlArr = mediaUrl.split('/')
            // 浏览器支持fetch则用blob下载，避免浏览器点击a标签，跳转到新页面预览的行为
            if (window.fetch) {
              fetch(mediaUrl).then(res => res.blob()).then(blob => {
                const a = document.createElement('a')
                document.body.appendChild(a)
                a.style.display = 'none'
                const url = window.URL.createObjectURL(blob)
                a.href = url
                a.download = index + '_' + urlArr[urlArr.length - 1]
                a.click();
                document.body.removeChild(a)
                window.URL.revokeObjectURL(url)
              })
            } else {
              let a = document.createElement('a')
              a.href = mediaUrl
              a.target = '_blank'
              a.download = index + '_' + urlArr[urlArr.length - 1]
              a.click()
              document.body.removeChild(a)
            }
          }
        })
      },
  }

}
</script>
<style lang="scss" scoped>
  .media-container {
    audio {
      width: 80%;
      margin-top: 10%;
    }
    video {
       height: 100%;
    }
    .el-carousel__item {
       text-align: center;
    }
  }
</style>
