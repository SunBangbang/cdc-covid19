<template>

  <div>

    <el-form-item label="占位内容">

      <el-input
        v-model="data.placeholder"
        :disabled="data.edit !== undefined && !data.edit"
        placeholder="占位内容"
      ></el-input>

    </el-form-item>

    <el-form-item label="默认值">

      <el-input
        v-model="data.value"
        :disabled="data.edit !== undefined && !data.edit"
        placeholder="默认值"
      ></el-input>

    </el-form-item>

    <el-form-item label="字典配置">
      <br />

      <el-tree
        ref="tree"
        :disabled="data.edit !== undefined && !data.edit"
        :data="data.dicData"
        default-expand-all
        draggable
        node-key="value"
        :expand-on-click-node="false"
      >

        <span class="custom-tree-node" slot-scope="{ node, data }">

          <span>{{ node.label }}</span>

          <span>

            <el-button
              type="text"
              size="mini"
              icon="el-icon-plus"
              @click="handleNodeAdd(data)"
            ></el-button>

            <!--                <el-button class="warning" type="text" size="mini" icon="el-icon-edit"-->

            <!--                           @click="handleNodeEdit(data)"></el-button>-->

            <el-button
              class="danger"
              type="text"
              size="mini"
              icon="el-icon-delete"
              @click="handleNodeRemove(node, data)"
            ></el-button>

          </span>

        </span>

      </el-tree>

      <div style="margin-left: 22px;">

        <el-button
          type="text"
          :disabled="data.edit !== undefined && !data.edit"
          @click="handleParentNodeAdd"
        >
          添加父级
        </el-button>

      </div>

    </el-form-item>

    <el-form-item label="选项分隔符">

      <el-input
        v-model="data.separator"
        :disabled="data.edit !== undefined && !data.edit"
        placeholder="选项分隔符"
      ></el-input>

    </el-form-item>

    <el-form-item label="是否显示选中值的完整路径">

      <el-switch
        v-model="data.showAllLevels"
        :disabled="data.edit !== undefined && !data.edit"
      ></el-switch>

    </el-form-item>

    <el-form-item label="是否可清空">

      <el-switch
        v-model="data.clearable"
        :disabled="data.edit !== undefined && !data.edit"
      ></el-switch>

    </el-form-item>

    <el-form-item label="是否可搜索">

      <el-switch
        v-model="data.filterable"
        :disabled="data.edit !== undefined && !data.edit"
      ></el-switch>

    </el-form-item>

    <config-rules :data="data"></config-rules>

    <el-form-item label="是否是核心表">

      <el-switch
        v-model="data.coreItem"
        :disabled="data.edit !== undefined && !data.edit"
      ></el-switch>

    </el-form-item>

    <el-dialog
      :visible.sync="dialogVisible"
      :rules="dialogRules"
      :before-close="beforeClose"
    >

      <el-form ref="dialogForm" :model="dialogForm" label-width="80px">

        <el-form-item label="选项名称">

          <el-input
            v-model="dialogForm.label"
            :disabled="data.edit !== undefined && !data.edit"
            placeholder="选项名称"
          ></el-input>

        </el-form-item>

      </el-form>

      <span slot="footer" class="dialog-footer">

        <el-button @click="dialogVisible = false">取 消</el-button>

        <el-button
          type="primary"
          @click="handleDialogAdd"
          :disabled="data.edit !== undefined && !data.edit"
          v-if="dialogStatus == 'add'"
        >
          确 定
        </el-button>

        <!--        <el-button type="primary" @click="handleDialogUpdate" v-else>确 定</el-button>-->

      </span>

    </el-dialog>

  </div>

</template>

<script>
import configRules from "./config-rules";
import placeholder from "@/components/form-design/mixins/placeholder-mixin";
export default {
  name: "config-cascader",
  props: ["data"],
  components: {
    configRules
  },
  mixins: [placeholder],
  data() {
    return {
      dialogForm: {},
      dialogVisible: false,
      dialogRules: {
        label: { required: true, message: "请输入选项名称" }
      },
      dialogStatus: "add",
      selectData: undefined,
      option: {
        column: [
          {
            type: "input",
            prop: "key",
            label: "key"
          },
          {
            type: "input",
            prop: "value",
            label: "value"
          }
        ]
      }
    };
  },
  methods: {
    handleParentNodeAdd() {
      this.selectData = undefined;
      this.dialogStatus = "add";
      this.dialogVisible = true;
    },
    handleNodeAdd(data) {
      this.selectData = data;
      this.dialogStatus = "add";
      this.dialogVisible = true;
    },
    handleNodeRemove(node, data) {
      const parent = node.parent;
      const children = parent.data.children || parent.data;
      // console.log('node remove:', children, ' ', data)
      const index = children.findIndex(d => {
        if (d.key) {
          return d.key === data.value;
        } else if (d.value || d.value === 0) {
          return d.value === data.value;
        }
        return false;
      });
      if (index > -1) {
        children.splice(index, 1);
      }
    },
    handleDialogAdd() {
      this.$refs.dialogForm.validate(valid => {
        if (valid) {
          const { label } = this.dialogForm;
          const value = Date.now();
          const node = this.$refs.tree.getNode(value);
          if (node) this.$message.error("value重复");
          else {
            const data = this.selectData;
            const newNode = {
              label,
              value: value
            };
            if (data) {
              if (!data.children) this.$set(data, "children", []);
              data.children.push(newNode);
            } else {
              this.$set(this.data.dicData, this.data.dicData.length, newNode);
            }
            this.beforeClose();
          }
        }
      });
    },
    beforeClose() {
      this.$refs.dialogForm.clearValidate();
      this.dialogForm = {};
      this.dialogVisible = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>

<style scoped>
:deep(.el-dialog__headerbtn) {
  top: 10px;
}
</style>

