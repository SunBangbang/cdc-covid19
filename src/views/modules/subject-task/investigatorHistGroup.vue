<template>

  <div v-loading="loading">

    <avue-crud
      @on-load="onLoad"
      @search-change="search"
      @size-change="sizeChange"
      @current-change="currentChange"
      @selection-change="selectionChange"
      @tree-load="treeLoad"
      :data="tableData"
      ref="investigatorGroup"
      :option="dialogOption"
      :search.sync="searchData"
      :page.sync="page"
      v-model="form"
    >

      <template slot="taskName" slot-scope="scope">

        <span>{{scope.row.taskName}}</span>

      </template>

    </avue-crud>

  </div>

</template>

<script>
import { investigatorHistGroupDialogOption } from "@/views/modules/subject-task/option/crudOption";
import { getList, getDetail } from "@/api/subject-task/task-management";

export default {
  name: "investigatorHisGroup",
  data() {
    return {
      loading: true,
      selectionList: [],
      tableData: [],
      dialogOption: investigatorHistGroupDialogOption(),
      searchData: {},
      page: {
        currentPage: 1,
        total: 0,
        pageSize: 10
      },
      form: {}
    };
  },
  methods: {
    onLoad(page, params = {}) {
      this.loading = true;
      let searchData = Object.assign({}, this.searchData);
      searchData.deptId = searchData.deptId
        ? searchData.deptId
        : this.$store.state.user.deptId;
      getList(page.currentPage, page.pageSize, this.searchData).then(res => {
        if (res.data.code === 0) {
          let taskList = [];
          for (let i = 0; i < res.data.data.list.length; i++) {
            let task = {};
            task.taskName = res.data.data.list[i].name;
            task.id = res.data.data.list[i].oid;
            task.hasChildren = true;
            taskList.push(task);
          }
          this.tableData = taskList;
          this.page.total = res.data.data.total;
          this.loading = false;
        }
      });
    },
    treeLoad(tree, treeNode, resolve) {
      setTimeout(() => {
        let investigatorList = [];
        getDetail(tree.id).then(res => {
          investigatorList = res.data.data.investigators;
          resolve(investigatorList);
        });
      }, 1000);
    },
    sizeChange(val) {
      this.page.pageSize = val;
      this.onLoad();
    },
    currentChange(val) {
      this.page.currentPage = val;
      this.onLoad();
    },
    search(from, done) {
      this.searchData = Object.assign({}, from);
      this.onLoad(done);
    },
    selectionChange(list) {
      this.selectionList = list;
    }
  }
};
</script>

<style scoped>
:deep(.el-form-item--mini > .el-form-item__content > .el-button--default) {
  margin-right: 5px;
}
:deep(.avue-crud__menu) {
  height: fit-content;
  min-height: 0;
  /*display: none;*/
}
:deep(.avue-crud__left) {
  height: fit-content;
}
:deep(.avue-crud__right) {
  height: fit-content;
  color: #c2c2ca;
}
</style>

