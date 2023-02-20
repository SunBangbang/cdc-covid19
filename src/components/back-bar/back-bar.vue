<template>
  <el-row>
    <el-col>
      <div>
        <i class="el-icon-arrow-left back-button" @click="goBack">返回</i>
      </div>
    </el-col>
  </el-row>
</template>

<script>
export default {
  name: "back-bar",
  props: {
    type: {
      type: String,
      default: () => {
        return ''
      },
    },
    location: {
      type: Object,
    },
    cleanChildrenTab: {
      type: Boolean,
      default: () => {
        return false
      }
    }
  },
  methods: {
    goBack() {
      if (this.cleanChildrenTab) {
        sessionStorage.removeItem('childrenTab')
      }
      if (this.type && this.location) {
        if (this.type === 'replace') {
          this.$router.replace(this.location)
        } else if (this.type === 'push') {
          this.$router.push(this.location)
        } else {
          this.$message.error("非法的路由跳转类型！")
        }
      } else {
        this.$router.back(-1)
      }
    },
  }
}
</script>

<style scoped>
.back-button {
  padding: 10px;
  color: #00bfbf;
  cursor: pointer;
}
</style>
