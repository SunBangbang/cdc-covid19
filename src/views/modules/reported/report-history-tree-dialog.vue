<template>

  <el-dialog :visible.sync="visible" @close="close" width="3rem" top="5vh">

    <report-history-tree :data="auditHistory">

      <template slot="icon">

        <i class="el-icon-close close-icon" @click="close" />

      </template>

    </report-history-tree>

  </el-dialog>

</template>

<script>
import ReportHistoryTree from "@/views/modules/report-case-report/report-history-tree";
import { getAuditHistory } from "@/api/survey-form/reported_sample";
export default {
  name: "report-history-tree-dialog",
  components: { ReportHistoryTree },
  props: {
    params: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data() {
    return {
      visible: true,
      auditHistory: []
    };
  },
  created() {
    this.getHistory();
  },
  methods: {
    getHistory() {
      getAuditHistory(this.params.rpid).then(res => {
        if (res.data.code === 0) {
          let data = res.data.data;
          data.forEach((item, index) => {
            if (item.status === "处理中") {
              if (this.params.sampleType === "edit") {
                item.auditor = this.$store.state.user.realName;
              } else {
                item.auditDate = null;
                item.auditor = null;
              }
              item.color = "rgb";
            } else if (item.status === "通过") {
              item.icon = "el-icon-check";
              item.color = "#67C23A";
            } else if (item.status === "驳回") {
              item.icon = "el-icon-close";
              item.color = "#F56C6C";
            } else if (item.status === "待审批") {
              item.status = "提交";
              item.icon = "el-icon-check";
              item.color = "#67C23A";
            } else if (item.status === "提交") {
              item.icon = "el-icon-check";
              item.color = "#67C23A";
            }
          });
          this.auditHistory = data;
        } else {
          this.$message.error(res.data.msg);
        }
      });
    },
    close() {
      this.$emit("close");
    }
  }
};
</script>

<style scoped>
:deep(.el-dialog__body) {
  padding: 0px 20px;
  color: #606266;
  font-size: 14px;
  word-break: break-all;
}
:deep(.el-dialog__header) {
  display: none;
}
.close-icon {
  position: absolute;
  right: 0;
  cursor: pointer;
}
</style>

