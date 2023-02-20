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
      ref="investigatorTasks"
      :option="dialogOption"
      :search.sync="searchData"
      :page.sync="page"
      v-model="form"
    >

      <template slot="index" slot-scope="{ row }">

        <span>{{ row.indexNo }}</span>

      </template>

      <template slot="taskName" slot-scope="scope">

        <span>{{ scope.row.taskName }}</span>

      </template>

    </avue-crud>

  </div>

</template>

<script>
import { investigatorHistTasksDialogOption } from "@/views/modules/subject-task/option/crudOption";
import { taskListByInvetigator } from "@/api/subject-task/task-management";
import { pageForTaskInvestigator } from "@/api/user/user";

export default {
  name: "investigatorHistTasks",
  data() {
    return {
      loading: true,
      selectionList: [],
      tableData: [],
      dialogOption: investigatorHistTasksDialogOption(),
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
    onLoad(params = {}) {
      this.loading = true;
      let searchData = Object.assign({}, this.searchData);
      searchData.deptId = searchData.deptId
        ? searchData.deptId
        : this.$store.state.user.deptId;
      searchData.onlyMydept = true;
      searchData.trueDept = true;
      pageForTaskInvestigator(
        this.page.currentPage,
        this.page.pageSize,
        searchData
      ).then(res => {
        if (res.data.code === 0) {
          let userList = [];
          userList = res.data.data.list;
          userList.forEach((item, index) => {
            item.hasChildren = true;
            item.indexNo = index + 1;
          });

          this.tableData = userList;
          this.page.total = res.data.data.total;
        } else {
          console.error("err:", res.data.msg);
        }
        this.loading = false;
      });
    },
    treeLoad(tree, treeNode, resolve) {
      taskListByInvetigator(0, 1000, { userId: tree.id }).then(res => {
        let taskList = res.data.data.list;
        let no = 0;
        taskList.forEach((item, index) => {
          item.id = tree.id + "" + no++;
          item.realName = "";
          item.hasChildren = false;
          item.indexNo = tree.indexNo + "." + String(index + 1);
        });

        resolve(taskList);
      });
    },
    sizeChange(val) {
      this.page.pageSize = val;
      this.onLoad();
    },
    currentChange(val) {
      this.page.currentPage = val;
      this.onLoad();
    },
    search(form, done) {
      this.searchData = Object.assign({}, form);
      this.page.currentPage = 1;
      this.onLoad();
      done();
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

