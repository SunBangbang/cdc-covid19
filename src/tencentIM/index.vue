<template>
  <div class="container">
    <div class="loading">
      <div class="chat-wrapper">
        <current-conversation />
      </div>
      <image-previewer />
    </div>
  </div>
</template>

<script>
import CurrentConversation from '../components/conversation/current-conversation'
import ImagePreviewer from '../components/message/image-previewer.vue'



export default {
  name: 'TencentIM',
  components: {
    CurrentConversation,
    ImagePreviewer
  }
}
</script>

<style lang="stylus">
body {
  overflow: hidden;
  margin: 0;
  font-family: 'Microsoft YaHei', '微软雅黑', 'MicrosoftJhengHei', 'Lantinghei SC', 'Open Sans', Arial, 'Hiragino Sans GB', 'STHeiti', 'WenQuanYi Micro Hei', SimSun, sans-serif;
  // font-family  "Helvetica Neue", Helvetica, Arial, "PingFang SC", "Hiragino Sans GB", "Heiti SC", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif
  // text-shadow: $regular 0 0 0.05em
  background-color: $bg;
  -ms-scroll-chaining: chained;
  -ms-overflow-style: none;
  -ms-content-zooming: zoom;
  -ms-scroll-rails: none;
  -ms-content-zoom-limit-min: 100%;
  -ms-content-zoom-limit-max: 500%;
  -ms-scroll-snap-type: proximity;
  -ms-scroll-snap-points-x: snapList(100%, 200%, 300%, 400%, 500%);
  -ms-overflow-style: none;
  overflow: auto;

  div {
    box-sizing: border-box;

    &::before, &::after {
      box-sizing: border-box;
    }
  }
}
.container
  height: 700px;
  width: 100%;
// TODO filter mac chrome 会有问题，下次修改可以去掉
.chat-wrapper {
  margin-top: 0vh;
  width: $width;
  height: $height;
  max-width: 100%;
  box-shadow: 0 5px 5px 0 rgba(0, 0, 0, 0.3);

  .official-link {
    display: flex;
    text-decoration: none;
    color: #38c9ff;
    width: fit-content;
    float: right;
    height: 45px;
    align-items: center;
  }
}

.loading {
  height: $width;
  width: $height;
  display: flex;
  justify-content: center;
}

/* 设置滚动条的样式 */
::-webkit-scrollbar {
  width: 3px;
  height: 3px;
}

/* 滚动槽 */
::-webkit-scrollbar-track {
  border-radius: 10px;
}

/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.1);
}
</style>
