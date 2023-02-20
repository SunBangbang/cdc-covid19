<template>
  <div>
    <el-row style="margin-bottom: 10px;">
      <el-col :span="6">
        <el-row>
          <el-col :span="4">
            温度:
          </el-col>
          <el-col :span="20">
            <el-input ></el-input>
          </el-col>
        </el-row>
      </el-col>

      <el-col :span="6" :offset="2">
        <el-button type="danger"
                   round>
          点击测温
        </el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: "measureTemperatureItem",
  data () {
    return {}
  },
}
</script>

<style scoped>

</style>