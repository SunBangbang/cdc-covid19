<template>
  <div class="asr-stop-click" @click="onlyClose">
    <div class="asr-dialog" @click.stop="" v-loading="loading">
      <h3>语音识别</h3>
      <!--      <span style="font-weight: normal; color: #bababa; font-size: 12px">更改语言</span>-->
      <div style="text-align: center; align-items: center">
        <!--        <div style="margin-bottom: 20px;">-->
        <!--          <el-button type="primary" circle v-loading="true">-->
        <!--            <img :src="mkf" class="icon-mkf"/>-->
        <!--          </el-button>-->
        <!--        </div>-->
        <div>
          <div class="animation" v-if="status === 2">
            <div class="animationName"></div>
            <div class="animationName"></div>
            <div class="animationName"></div>
            <div class="animationName"></div>
            <div class="animationName"></div>
          </div>
          <div v-if="status === 1" style="width: 1px; height: 80px"></div>
          <el-button @click="start" type="primary" v-if="status === 1"
            >开始识别
            <span style="font-size: 12px">
              （{{
                language.filter(
                  (v) => v.value === $store.state.languageSelected
                )[0].label
              }}）
            </span>
          </el-button>
          <el-button @click="close" type="primary" v-if="status === 2"
            >结束识别</el-button
          >
        </div>
      </div>
      <div
        style="
          text-align: left;
          padding: 0 30px;
          line-height: 28px;
          margin-top: 10px;
        "
      >
        <h4>说明:</h4>
        <p>1.点击开始识别,随后说出您想表达的内容.</p>
        <p>2.完成后点击结束识别,系统会自动帮您将内容填充到表单.</p>
        <p>
          3.如果识别时间较长,系统需要花费大量时间处理,你可以直接点击页面其他区域返回.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import mkf from "@/assets/img/mkf.png";
import AppConstant from "@/utils/AppConstant";
export default {
  name: "AsrStart",
  props: ["showAsr"],
  data() {
    return {
      language: AppConstant.LANGUAGE,
      mkf,
      status: 1,
      loading: false,
    };
  },
  mounted() {
    this.status = 1;
  },
  methods: {
    close() {
      this.status = 1;
      this.loading = true;
      this.$emit("close");
    },
    start() {
      this.status = 2;
      this.$emit("start");
    },
    onlyClose() {
      if (this.status === 2) {
        return;
      }
      this.$emit("onlyClose");
    },
  },
};
</script>

<style scoped>
.asr-stop-click {
  position: fixed;
  top: 50px;
  right: 0;
  bottom: 0;
  left: 0;
  /*background-color: rgba(211, 207, 207, 0.5);*/
  /*background-color: unset;*/
  width: 100vw;
  height: calc(100vh - 50px);
  z-index: 9999999;
}
.asr-dialog {
  width: 40vw;
  height: 35vh;
  padding: 0 15px;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 0 20px #bababa;
  position: fixed;
  left: 30vw;
  top: 50vh;
  overflow-y: auto;
}

h3 {
  height: 40px;
  font-size: 16px;
  font-weight: bold;
  line-height: 40px;
}

h4 {
  min-height: 28px;
  font-size: 14px;
  font-weight: bold;
  line-height: 28px;
}

p {
  font-size: 14px;
  min-height: 28px;
  line-height: 28px;
}
.asr-content {
}
.icon-mkf {
  /*background-color: #3d8b40;*/
  border-radius: 100px;
  width: 70px;
  height: 70px;
  -webkit-user-drag: none;
}
/*css部分  */
.animation {
  /* 父框 */
  width: 100px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.animation > div:nth-of-type(1) {
  width: 12px;
  height: 20px;
  background-color: #11bac2;
  animation-delay: 0.4s; /*动画延迟  */
}
.animation > div:nth-of-type(2) {
  width: 12px;
  height: 40px;
  background-color: #09c1bc;
  animation-delay: 0.8s;
}
.animation > div:nth-of-type(3) {
  width: 16px;
  height: 50px;
  background-color: #11bac2;
  animation-delay: 0.1s;
}
.animation > div:nth-of-type(4) {
  width: 12px;
  height: 40px;
  background-color: #09c1bc;
  animation-delay: 0.8s;
}
.animation > div:nth-of-type(5) {
  width: 12px;
  height: 20px;
  background-color: #11bac2;
  animation-delay: 0.4s;
}
.animation > div {
  /* 动画统一属性 */
  margin: 0 2px;
  border-radius: 7px;
  transform: all 0.7s;
  animation-duration: 0.8s;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  animation-direction: alternate;
  animation-play-state: running;
  animation-fill-mode: both;
}
.animationName {
  animation-name: animName; /*单独类名方便统一控制动画 */
}
@keyframes animName {
  /* 规则 */
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}
</style>
