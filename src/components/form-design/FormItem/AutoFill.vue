<template>
  <div>
    <el-row style="margin-bottom: 10px;">
      <el-input
          type="textarea"
          :rows="5"
          placeholder="粘贴或输入整段地址，点击“识别”自动拆分姓名、电话和地址。例如：顺小哥，132****0000，广东省深圳市南山区某某街道某某大厦001号">
      </el-input>
    </el-row>
    <el-row>
      <el-col :span="2" :offset="22">
        <el-button type="danger"
                   round>
          识别
        </el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: "AutoFill",
  data () {
    return {}
  },
}
</script>

<style scoped>

</style>