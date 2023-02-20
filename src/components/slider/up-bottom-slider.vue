<template>
  <div class="scroll-jump-father">
    <!--       @mousedown.stop="touchStart('top')"  @mouseup.stop="touchEnd('top')"-->
    <el-row class="scroll-jump" >
      <img :src="upD" class="img-up-bottom" v-if="nowHeight === 0">
      <img :src="up" v-else class="img-up-bottom" @click="scrollTop">
    </el-row>
<!--    @mousedown.stop="touchStart('bottom')" @mouseup.stop="touchEnd('bottom')"-->
    <el-row class="scroll-jump" >
      <img :src="downD" class="img-up-bottom"  v-if="nowHeight >= (divHeight - 1000) && nowHeight !== 0">
      <img :src="down" class="img-up-bottom"  v-else @click="scrollBottom"/>
    </el-row>
  </div>
</template>

<script>
import up  from "@/assets/img/up.png"
import upD  from "@/assets/img/up-disabled.png"
import down  from "@/assets/img/down.png"
import downD  from "@/assets/img/down-disabled.png"
export default {
  name: 'Slider',
  props: {
    divId: {
      type: String,
      default: () => {
        return ''
      }
    }
  },
  data() {
    return {
      up: up,
      upD: upD,
      downD:downD,
      down: down,
      timeOutEvent: 0,
      maxHeight:0,
      nowHeight: 0,
      divHeight: 0,
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll, true)
  },
  updated() {
    let st = document.getElementById(this.divId)
    if(st){
      this.divHeight = st.scrollHeight
    }
  },
  methods: {
    handleScroll () {
      let div = document.getElementById(this.divId)
      this.nowHeight = div? div.scrollTop : 0
      // console.log(this.nowHeight, this.divHeight, this.maxHeight)
    },
    scrollBottom() {
      this.$nextTick(() => {
        let st = document.getElementById(this.divId)
        if(st){
          this.nowHeight = st.scrollHeight
          st.scrollTop =  this.nowHeight
        }
      })
    },
    scrollTop() {
      this.$nextTick(() => {
        this.nowHeight = 0
        let st = document.getElementById(this.divId)
        if(st){
          st.scrollTop = this.nowHeight
        }
      })
    },
    touchStart(type) {
      let _this = this;
      clearTimeout(_this.timeOutEvent);
      _this.timeOutEvent = setTimeout(function() {
        _this.timeOutEvent = 0;
        if (type === 'top') {
          _this.scrollTop()
        } else if (type === 'bottom') {
          _this.scrollBottom()
        }
        //  处理长按事件...
      }, 600);

    },
    touchEnd(type) {
      let _this = this;
      clearTimeout(_this.timeOutEvent);
      if (_this.timeOutEvent !== 0) {
        //  处理单击事件
        if (type === 'top') {
          _this.$nextTick(() => {
            let st = document.getElementById(_this.divId)
            if(st){
              _this.maxHeight = st.scrollHeight
              if (_this.nowHeight > 0) {
                _this.nowHeight -= 400
                st.scrollTop = _this.nowHeight
              }
            }
          })
        } else if (type === 'bottom') {
          _this.$nextTick(() => {
            let st = document.getElementById(_this.divId)
            if(st){
              _this.maxHeight = st.scrollHeight
              // console.log(st.clientHeight)
              if (_this.nowHeight < _this.maxHeight) {
                _this.nowHeight += 400
                st.scrollTop = _this.nowHeight
              }
            }
          })
        }
      }
    }
  }
}
</script>

<style scoped >
  .scroll-jump-father {
    position: absolute;
    bottom: 5%;
    right: 0;
    margin-right: 10px;
    float: right;
    z-index: 1100;
  }
  .scroll-jump {
    /*filter:alpha(opacity=80);*/
    /*-moz-opacity:0.8;*/
    /*-khtml-opacity: 0.8;*/
    cursor: pointer;
    /*opacity: 0.8;*/
    /*font-size: 50px;*/
    /*margin-top: 20px;*/
  }
   .img-up-bottom {
     /*box-shadow: 0  0  20px rgba(0,0,0,0.8)*/
   }
</style>
