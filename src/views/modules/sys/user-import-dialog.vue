<template>
  <el-dialog
    title="批量导入用户"
    :visible.sync="dialogVisible"
    width="40%"
    append-to-body
  >
    <el-form :model="dataForm" ref="dataForm" label-width="100px" size="mini">
      <el-row>
        <el-col :span="20">
          <el-form-item
            prop="deptId"
            label="隶属组织"
            class="is-required role-list"
          >
            <el-popover placement="top" width="500" trigger="click">
              <el-row class="flow-tree">
                <el-tree
                  v-if="visible"
                  ref="trueDeptTree"
                  node-key="id"
                  :default-checked-keys="defaultTrueDeptIdCheckedList"
                  :props="defaultProps"
                  :load="loadNode"
                  check-strictly
                  lazy
                  @check="handleCheckTrueDept"
                  show-checkbox
                >
                </el-tree>
              </el-row>
              <el-row slot="reference" class="input-style-for-div">
                <div v-if="dataForm.deptId">
                  <el-tag
                    size="small"
                    style="margin: 0 10px 2px 0"
                    :closable="true"
                    :key="dataForm.deptId"
                    @close="handleRemoveTrueDept(dataForm.deptId)"
                  >
                    {{ dataForm.trueDeptName }}
                  </el-tag>
                </div>
                <div v-else style=" font-size: 12px; ">
                  <span style="color: #c3c4cb!important; margin-left: 10px"
                    >请选择隶属组织</span
                  >
                </div>
              </el-row>
            </el-popover>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="20">
          <el-form-item
            prop="deptNames"
            label="所在组织"
            class="is-required role-list"
          >
            <el-popover placement="top" width="500" trigger="click">
              <el-row class="flow-tree">
                <el-tree
                  v-if="visible"
                  ref="trees"
                  node-key="id"
                  :default-checked-keys="defaultDeptIdCheckedList"
                  :props="defaultProps"
                  :load="loadNode"
                  check-strictly
                  lazy
                  @check-change="checkChange"
                  show-checkbox
                >
                </el-tree>
              </el-row>
              <el-row slot="reference" class="input-style-for-div">
                <div v-if="deptListTags.length > 0">
                  <el-tag
                    v-for="(tag, index) in deptListTags"
                    size="small"
                    style="margin: 0 10px 2px 0"
                    :closable="true"
                    :key="index + 's'"
                    @close="handleRemoveDept(tag, index)"
                  >
                    {{ tag.label }}
                  </el-tag>
                </div>
                <div v-else style=" font-size: 12px; ">
                  <span style="color: #c3c4cb!important; margin-left: 10px"
                    >请选择所在组织</span
                  >
                </div>
              </el-row>
            </el-popover>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="20">
          <el-form-item prop="file" label="文件上传" class="is-required">
            <input id="inputElement" type="file" accept=".xls,.xlsx" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button
        :loading="submitStatus"
        type="primary"
        @click="importSubmit()"
        size="mini"
        >确 定</el-button
      >
      <el-button @click="dialogVisible = false" size="mini">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { lazyDeptTree } from "@/api/sys/dept";
import Cookies from "js-cookie";
import axios from "axios";
import sm4Utils from "@/utils/sm4";

export default {
  name: "user-import-dialog",
  data() {
    return {
      dialogVisible: false,
      visible: false,
      submitStatus: false,
      dataForm: {
        deptId: "",
        trueDeptName: ""
      },
      defaultTrueDeptIdCheckedList: [],
      defaultDeptIdCheckedList: [],
      defaultProps: {
        label: "label",
        children: "children",
        isLeaf: "leaf"
      },
      trueDeptTags: {},
      deptListTags: [],
      deptSelectedList: []
    };
  },
  methods: {
    open() {
      this.dialogVisible = true;
      this.deptListTags = [];
      this.deptSelectedList = [];
      this.defaultTrueDeptIdCheckedList = [];
      this.visible = true;
      this.dataForm = {
        deptId: "",
        trueDeptName: ""
      };
      $("#inputElement").replaceWith(
        '<input id="inputElement" type="file" accept=".xls">'
      );
      this.$nextTick(() => {
        this.$refs.trueDeptTree.setCheckedKeys([]);
        this.$refs.trees.setCheckedKeys([]);
      });
    },
    loadNode(node, resolve) {
      let deptList = [];
      if (node.level === 0) {
        lazyDeptTree({ pid: this.$store.state.user.deptId })
          .then(res => {
            deptList = res.data.data;
            return resolve(deptList);
          })
          .catch(() => {});
      }
      if (node.level === 1) {
        return node.data.children ? resolve(node.data.children) : resolve([]);
      }
      if (node.level >= 2) {
        let subDeptList = [];
        lazyDeptTree({ pid: node.data.id })
          .then(res => {
            subDeptList = res.data.data[0];
            return subDeptList.children
              ? resolve(subDeptList.children)
              : resolve([]);
          })
          .catch(() => {});
        // return resolve(node.data.children)
      }
    },
    handleCheckTrueDept(data, checked, indeterminate) {
      if (checked.checkedKeys.length > 0) {
        let originDeptId = this.dataForm.deptId;
        // 取消原选择
        this.$refs.trueDeptTree.setChecked(originDeptId, false);
        this.$refs.trees.setChecked(originDeptId, false);
        this.dataForm.deptId = data.id;
        this.dataForm.trueDeptName = data.label;
        // 更新隶属部门
        this.trueDeptTags = { id: data.id, label: data.label };

        //更新所在部门的列表
        this.deptListTags = this.deptListTags.filter(
          item => item.id !== originDeptId
        ); // 移除上一个选择
        this.deptListTags = this.deptListTags.filter(
          item => item.id !== data.id
        ); //先移除本次选择，再添加，确保不重复
        this.deptListTags.push({ id: data.id, label: data.label });
        this.deptSelectedList = this.deptSelectedList.filter(
          item => item !== data.id
        ); //先移除本次选择，再添加，确保不重复
        this.deptSelectedList.push(data.id);
        this.$refs.trees.setChecked(data.id, true);
      } else {
        this.dataForm.deptId = "";
        this.dataForm.trueDeptName = "";
        // 更新隶属部门
        this.trueDeptTags = {};

        //更新所在部门的列表
        this.deptSelectedList = this.deptSelectedList.filter(
          item => item !== data.id
        );
        this.deptListTags = this.deptListTags.filter(
          item => item.id !== data.id
        );
        this.$refs.trees.setChecked(data.id, false);
      }
      this.$forceUpdate();
    },
    checkChange(v, u, e) {
      if (u) {
        this.deptListTags = this.deptListTags.filter(item => item.id !== v.id);
        this.deptListTags.push({ id: v.id, label: v.label });
        this.deptSelectedList.push(v.id);
      } else {
        let o = [];
        if (this.dataForm.deptId) {
          o = this.deptSelectedList.filter(
            item => item === this.dataForm.deptId && item === v.id
          );
          console.log(o, "ds");
          if (o.length > 0) {
            this.$refs.trees.setChecked(v.id, true);
            this.$message.error("无效的移除操作,隶属部门已占用此部门!");
            return;
          }
        }
        this.deptSelectedList = this.deptSelectedList.filter(
          item => item !== v.id
        );
        this.deptListTags = this.deptListTags.filter(item => item.id !== v.id);
      }
      this.$forceUpdate();
    },
    handleRemoveTrueDept(tag) {
      let toRemoveDeptId = tag;
      this.dataForm.deptId = "";
      this.dataForm.trueDeptName = "";
      // 更新隶属部门
      this.trueDeptTags = {};
      this.$refs.trueDeptTree.setCheckedKeys([]);
      // 更新所在部门
      this.deptListTags = this.deptListTags.filter(
        item => item.id !== toRemoveDeptId
      );
      this.deptSelectedList = this.deptSelectedList.filter(
        item => item.id !== toRemoveDeptId
      );
      this.$refs.trees.setChecked(toRemoveDeptId, false);
    },
    handleRemoveDept(tag, index) {
      if (this.dataForm.deptId) {
        // o = this.deptSelectedList.filter(item => item === this.dataForm.deptId )
        if (tag.id === this.dataForm.deptId) {
          this.$refs.trees.setChecked(tag.id, true);
          this.$message.error("无效的移除操作,隶属部门已占用此部门!");
          return;
        }
      }
      this.deptListTags.splice(this.deptListTags.indexOf(tag.label), 1);
      this.deptSelectedList.splice(this.deptSelectedList.indexOf(index), 1);
      this.$refs.trees.setChecked(tag.id, false);
    },
    importSubmit() {
      this.dataForm.deptIds = this.deptSelectedList.join(",");
      if (this.dataForm.deptId === "") {
        this.$message.error("请选择隶属组织！");
        return;
      }
      let inputElement = document.getElementById("inputElement");
      let file = inputElement.files[0];
      if (!file) {
        this.$message.error("请选择上传文件!");
        return;
      }
      if (!file.name.endsWith("xlsx") && !file.name.endsWith("xls")) {
        this.$message.error("请上传excel文件!");
        return;
      }
      this.upload(file);
    },
    upload(file) {
      this.submitStatus = true;

      let param = new FormData();
      param.append("file", file);
      if (this.dataForm.deptId !== null) {
        param.append("deptId", this.dataForm.deptId);
        param.append("deptIds", this.dataForm.deptId);
        param.append("trueDeptName", this.dataForm.deptId);
      }

      let config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: "Bearer " + Cookies.get("access_token")
        }
      };

      let url = "/sys/user/upload";
      axios
        .post(`${window.SITE_CONFIG["apiURL"]}${url}`, param, config)
        .then(res => {
          this.submitStatus = false;
          if (this.$store.state.cryptoOpen) {
            let tmpData = sm4Utils.decrypt(res.data, this.$store.state.key);
            res.data = JSON.parse(tmpData);
          }

          if (res.data.code === 0) {
            this.$message.success("上传成功");
            this.visible = false;
            this.dialogVisible = false;
            this.$emit("onLoad");
          } else {
            console.error(res.data.msg);
            this.$message.error("请检查上传文件！失败原因: " + res.data.msg);
          }
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.role-list {
  .el-select {
    width: 100%;
  }
}

.input-style-for-div {
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  padding: 0 5px;
  cursor: pointer;
}

.flow-tree {
  //color: #ffffff;
  overflow: auto;
  flex: 1;
  height: auto;
  max-height: 300px;
  margin: 10px;

  > .el-tree-node {
    > .el-tree-node__children {
      overflow: visible !important;
    }
  }
}
</style>
