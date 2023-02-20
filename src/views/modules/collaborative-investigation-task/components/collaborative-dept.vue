<template>

  <el-row @click.native="popoverVisible(-1)" v-if="data && data.length > 0">

    <el-row
      v-for="(item, index) in data"
      :key="index"
      :gutter="50"
      class="el-item"
    >

      <el-col
        :xl="{ span: 7 }"
        :lg="{ span: 10 }"
        :md="{ span: 12 }"
        :sm="{ span: 12 }"
      >

        <el-form-item label="行程轨迹：" size="mini" style="padding-top: 5px">

          <el-row>

            <el-tooltip
              :content="item.address"
              placement="bottom"
              effect="light"
            >

              <el-row
                style="width: 100%; overflow: hidden; text-overflow:ellipsis;white-space: nowrap;"
              >
                 {{item.address}}
              </el-row>

            </el-tooltip>

          </el-row>

        </el-form-item>

      </el-col>

      <el-col
        :xl="{ span: 7 }"
        :lg="{ span: 10 }"
        :md="{ span: 12 }"
        :sm="{ span: 12 }"
        v-if="deptVisible"
      >

        <el-form-item label="协查组织：">

          <el-popover
            :disabled="disabled"
            v-model="item.popoverVisible"
            placement="bottom"
            width="500"
            @show="loadDept(item, index)"
            trigger="manual"
          >

            <el-row class="flow-tree">

              <el-tree
                v-if="visible"
                ref="trueDeptTree"
                node-key="id"
                @node-click="setClickedNode"
                :current-node-key="item.matchDeptId"
                :props="defaultProps"
                :data="deptMap.get(index)"
                :expand-on-click-node="false"
                :check-on-click-node="true"
              >

              </el-tree>

            </el-row>

            <el-row
              slot="reference"
              :class="
                disabled
                  ? 'input-style-for-div-disabled'
                  : 'input-style-for-div'
              "
              @click.stop.native="popoverVisible(index)"
              :title="item.label"
            >

              <span>{{item.label}}</span>

              <i style="margin-left: 10px;" class="el-icon-caret-bottom"></i>

            </el-row>

          </el-popover>

        </el-form-item>

      </el-col>

    </el-row>

  </el-row>

  <el-row v-else class="flex-empty">

    <el-row>

      <img :src="es" alt="empty-image" />

    </el-row>

    <el-row>

      <p class="font">此调查对象没有轨迹信息，因此无法展开协查！</p>

    </el-row>

  </el-row>

</template>

<script>
import { lazyDeptTree } from "@/api/sys/dept";
import { getRedisDeptList } from "@/api/subject-task/task-management";
import es from "@/assets/image/es1.png";

export default {
  name: "collaborative-dept",
  props: {
    data: {
      type: Array,
      default: () => {
        return [];
      }
    },
    disabled: {
      type: Boolean,
      default: () => {
        return false;
      }
    }
  },
  data() {
    return {
      es,
      defaultProps: {
        label: "label",
        value: "id",
        children: "children",
        leaf: "leaf"
      },
      visible: true,
      deptMap: new Map(),
      clickedIndex: null,
      deptVisible: false
    };
  },
  created() {
    for (let i = 0; i < this.data.length; i++) {
      this.formatDeptId(this.data[i].matchDeptId, i);
    }
    this.data.forEach(it => {
      it.popoverVisible = false;
    });
  },
  methods: {
    loadDept(item, index) {
      if (!this.deptMap.get(index)) {
        this.visible = false;
        lazyDeptTree({ pid: item.parentDeptId }).then(res => {
          if (res.data.code === 0) {
            this.deptMap.set(index, res.data.data);
            this.visible = true;
          }
        });
      }
    },
    setClickedNode(nodeData) {
      this.data[this.clickedIndex].matchDeptId = nodeData.id;
      this.data[this.clickedIndex].label = nodeData.label;
      this.data[this.clickedIndex].popoverVisible = false;
    },
    popoverVisible(index) {
      this.clickedIndex = index;
      this.data.forEach((it, idx) => {
        if (idx === index) {
          it.popoverVisible = !it.popoverVisible;
        } else {
          it.popoverVisible = false;
        }
      });
      this.$forceUpdate();
    },
    async formatDeptId(value, index) {
      await getRedisDeptList(value).then(res => {
        this.$set(this.data[index], 'label', res.data.data)
        if (this.data.length - 1 === index) {
          this.deptVisible = true;
        }
      });
    }
  }
};
</script>

<style scoped lang="scss">
.input-style-for-div {
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  height: 28px;
  line-height: 26px;
  padding: 0 30px 0 15px;
  margin-top: 5px;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.input-style-for-div-disabled {
  border-radius: 4px;
  border: 1px solid #e4e7ed;
  height: 28px;
  line-height: 26px;
  padding: 0 30px 0 15px;
  margin-top: 5px;
  background-color: #f5f7fa;
  color: #c0c4cc;
  cursor: not-allowed;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.flow-tree {
  overflow: auto;
  flex: 1;
  height: auto;
  max-height: 300px;
  margin: 10px;
  :deep(.el-tree-node) {
    .el-tree-node__children {
      overflow: visible !important;
    }
  }
}
.el-item {
  .el-form-item {
    margin-bottom: 0;
  }
}
.flex-empty {
  display: -moz-flex;
  display: flex;
  display: -ms-flex;
  align-items: center;
  justify-content: center;
  .font {
    display: inline;
    text-align: center;
    color: #aaaaaa;
    font-size: 16px;
  }
}
</style>

