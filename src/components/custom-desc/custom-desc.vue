<template>
  <el-row :class="'custom-block' + ' ' + type">
    <p class="custom-block custom-block-title" :style="{'font-size' : titleFontSize + 'px'}">{{title}}</p>
    <p>{{desc}}</p>
  </el-row>
</template>

<script>
export default {
  name: "custom-desc",
  props: {
    title: {
      type: String,
      default: () => {
        return ''
      }
    },
    desc: {
      type: String,
      default: () => {
        return ''
      }
    },
    type: {
      type: String,
      default: () => {
        return 'tip'
      }
    },
    titleFontSize: {
      type: Number || null,
      default: () => {
        return 14
      }
    }
  },
  methods: {
    getClass() {
      return 'custom-block' + ' ' + this.type
    }
  }
}
</script>

<style scoped lang="scss">
.custom-block.warning {
  padding: 8px 16px;
  background-color: white;
  border-radius: 4px;
  border-left: 5px solid #fef0f0;
  margin: 0;
}
.custom-block.tip {
  padding: 8px 16px;
  background-color: #f1f4f5;
  border-radius: 4px;
  border-left: 5px solid #17B3A3;
  margin: 0;
}
.custom-block .custom-block-title {
  font-weight: 700;
  line-height: 1.7;
}
</style>
