<template>
<el-row>
  <el-row>
    <el-row class="head-title">
      <img :src="icon"/><span>审核记录</span>
      <slot name="icon"></slot>
    </el-row>
    <el-row class="background-row div-height" style="padding-top: 40px">
      <el-timeline :reverse="true" v-if="data.length > 0">
        <el-timeline-item v-for="(item, index) in data"
                          hide-timestamp
                          :key="index"
                          placement="top"
                          :icon="item.icon" :color="item.color">
          <el-row style="margin: 10px 0">
            <el-tag size="small"
                    :type="item.status === '待处理' ? 'info'
                        : item.status === '处理中' ? 'warning'
                        : item.status === '驳回' ? 'danger'
                        :'success'">
              {{item.status}}
            </el-tag>
          </el-row>
          <el-row style="color: #999999;">
            {{item.auditDate}}
          </el-row>
          <el-row style="font-size: 12px">
            <el-row v-if="index !== 0">
              <el-row style="color: #999999; margin: 10px 0" v-if="item.auditor">
                处理人：{{item.auditor}}
              </el-row>
              <el-row style="color: #999999; margin: 10px 0">
                处理机构：{{item.deptName}}
              </el-row>
              <el-row style="color: #666666; margin: 10px 0" v-if="item.remark">
                审核意见：{{item.remark}}
              </el-row>
            </el-row>
            <el-row v-else>
              <el-row style="color: #999999; margin: 10px 0" v-if="item.auditor">
                申请人：{{item.auditor}}
              </el-row>
              <el-row style="color: #999999; margin: 10px 0">
                申请机构：{{item.deptName}}
              </el-row>
            </el-row>
          </el-row>
        </el-timeline-item>
      </el-timeline>
      <el-row v-else>
        暂无审核历史！
      </el-row>
    </el-row>
  </el-row>
</el-row>
</template>

<script>
import icon from "@/assets/image/icon-sys.png";

export default {
  name: "report-history-tree",
  props: {
    data: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      icon: icon,
    }
  }
}
</script>

<style scoped>
.background-row {
  background: white;
  border-radius: 0 0 5px 5px;
  padding: 15px;
}
.div-height {
  height: calc(100vh - 165px);
  overflow-y: auto;
  overflow-x: hidden;
}
.head-title {
  background: white;
  border-radius: 5px 5px 0 0;
  border-bottom: 1px #E7E7E7 solid;
  padding: 15px;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: left;
}
</style>
