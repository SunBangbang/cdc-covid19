<template>
  <el-row class="right-sample-empty">
    <el-row class="cancel-display-flex">
      <el-row>
        <img :src="es">
      </el-row>
      <el-row>
        <p>点击左侧卡片查看调查记录详情！</p>
      </el-row>
    </el-row>
  </el-row>
</template>

<script>
import es from "@/assets/image/es1.png"
export default {
  name: "empty-status-sample-audit",
  data() {
    return {
      es
    }
  }
}
</script>

<style scoped>
.right-sample-empty {
  height: calc(100vh - 218px);
  background: white;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: 13px;
}
.cancel-display-flex {
  display: inline;
  text-align: center;
  color: #aaaaaa;
  font-size: 16px;
}
</style>
