<template>
  <div>
    <el-cascader
      clearable
      v-model="deptId"
      placeholder="搜索组织名称"
      ref="cascader"
      :show-all-levels="false"
      :props="defaultProps"
      @change="handleChange"
    ></el-cascader>
  </div>
</template>

<script>
import { lazyDeptTree } from "@/api/sys/dept";

export default {
  name: "dept-cascader",
  props: {
    rootDeptId: null
  },
  data() {
    return {
      deptId: null,
      defaultProps: {
        label: "label",
        value: "id",
        children: "children",
        leaf: "leaf",
        lazy: true,
        lazyLoad: this.loadNode,
        checkStrictly: true,
        emitPath: false
      }
    };
  },
  methods: {
    reset() {
      this.deptId = null;
    },
    handleChange(val) {
      // console.log('el change:', val)
      this.$emit("selectDept", val);
    },
    loadNode(node, resolve) {
      // 备份
      // let deptList = []
      // if (node.level === 0) {
      //   lazyDeptTree({pid: this.rootDeptId}).then((res) => {
      //     deptList = res.data.data
      //     return resolve(deptList)
      //   }).catch(() => {})
      // }
      // if (node.level >=  1) {
      //   let subDeptList = []
      //   // console.log(node)
      //   lazyDeptTree({pid: node.data.id}).then((res) => {
      //     subDeptList = res.data.data[0]
      //     return subDeptList.children &&subDeptList.children.length>0 ? resolve(subDeptList.children) : resolve()
      //   }).catch(() => {})
      //   // return resolve(node.data.children)
      // }

      let deptList = [];
      if (node.level === 0) {
        lazyDeptTree({ pid: this.$store.state.user.deptId })
          .then(res => {
            deptList = res.data.data;
            if (deptList.children && deptList.children.length > 0) {
              return;
            }
            return resolve(deptList);
          })
          .catch(() => {});
      }
      if (node.level === 1) {
        return resolve([]);
      }
      if (node.level >= 2) {
        let subDeptList = [];
        console.log(node);
        lazyDeptTree({ pid: node.data.id })
          .then(res => {
            subDeptList = res.data.data[0];
            return subDeptList.children && subDeptList.children.length > 0
              ? resolve(subDeptList.children)
              : resolve([]);
          })
          .catch(() => {});
      }
    }
  }
};
</script>

<style scoped></style>
