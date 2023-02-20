<template>
  <el-row class="bar-gel">
    <el-col :xl="{span:4}" :lg="{span:6}" :md="{span:8}" :sm="{span:8}">
        <img :src="ph" style="position: absolute; top: -30px">
      <el-row style="margin-left: 100px">
        <el-row class="small-font">调查对象</el-row>
        <el-row class="big-font" :title="params.participant.name">{{ params.participant.name }}</el-row>
      </el-row>
    </el-col>
    <el-col :xl="{span:2}" :lg="{span:3}" :md="{span:4}" :sm="{span:3}">
      <el-row class="small-font">性别</el-row>
      <el-row class="big-font">{{ params.participant.sex }}</el-row>
    </el-col>
    <el-col :xl="{span:4}" :lg="{span:6}" :md="{span:6}" :sm="{span:8}">
      <el-row class="small-font">证件号</el-row>
      <el-row class="big-font">{{ params.participant.identity }}</el-row>
    </el-col>
    <el-col :xl="{span:14}" :lg="{span:9}" :md="{span:6}" :sm="{span:5}">
      <el-row style="float: right; top: 3px">
        <el-tag :type="params.participant.status === '已确认' ? 'dark' : (params.participant.status === '未确认'? 'info' : 'success')">
          {{ params.participant.status }}
        </el-tag>
      </el-row>
    </el-col>
  </el-row>
</template>

<script>
import ph from "@/assets/image/ph1.png"
export default {
  name: "sample-detail-header",
  props: ['params'],
  data() {
    return {
      ph,
    }
  }
}
</script>

<style scoped>
.bar-gel {
  width: 100%;
  height: 60px;
  background: white;
  padding: 10px;
  border-radius: 5px;
  line-height: 15px;
  margin-top: 30px;
}
.big-font {
  font-size: 16px;
  font-weight: bold;
  line-height: 32px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.small-font {
  font-size: 14px;
  color: #999999;
  line-height: 16px;
}
</style>
