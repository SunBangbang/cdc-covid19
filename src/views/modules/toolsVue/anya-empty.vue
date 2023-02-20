<template>
  <div style="align-items: center; text-align: center; pointer-events: none;user-select: none;-webkit-user-drag: none">
    <el-image :src="emptySrc"></el-image>
    <p style="color:#c5cdd7;">暂时没有记录</p>
  </div>
</template>

<script>
import emptyImage from "../../../assets/image/empty.png"

export default {
  name: "anya-empty",
  data () {
    return {
      emptySrc: emptyImage
    }
  }
}
</script>

<style scoped>

</style>
