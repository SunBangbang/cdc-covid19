<template>
  <el-row class="catalogue-main">
    <h3 style="text-align: center" v-if="catalogue.main.params">{{catalogue.main.params.html}}</h3>
    <el-collapse  v-if="catalogue.main" v-model="activeNames">
      <el-collapse-item v-for="(item, index) in catalogue.mainTitle" :key="index" :name="index" :title="item.params.html">
        <div slot="title" style="width: 100%; text-overflow:ellipsis;overflow:hidden;white-space:nowrap;">
          {{item.params.html}}
        </div>
        <el-row v-for="(it, ins) in catalogue['subTitle'+(index+1)]" :key="ins">
          <el-link @click="jump(it)"
                   v-if="it.display"
                   :underline="false">{{it.label}}</el-link>
        </el-row>
      </el-collapse-item>
    </el-collapse>
  </el-row>
</template>

<script>
export default {
  name: "catalogue",
  props: {
    catalogue: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      activeNames: []
    }
  },
  methods: {
    // 锚点跳转
    jump(item) {
      let formElement = document.getElementsByClassName("questionnaire-form")[0]
      let jump = document.getElementById('label_' + item.prop) || document.getElementById('el' + item.prop)
      // 获取需要滚动的距离
      // Chrome
      jump.scrollIntoView()
      // formElement.scrollTop = jump ? jump.offsetTop : 0
      /*// Chrome
      document.body.scrollTop = total;
      // Firefox
      document.documentElement.scrollTop = total;
      // Safari
      window.pageYOffset = total*/
    },
  }
}
</script>

<style scoped>
.catalogue-main {
  padding: 30px 20px 20px 20px;
  height: calc(100vh - 275px);
  overflow-y: auto;
}
</style>
