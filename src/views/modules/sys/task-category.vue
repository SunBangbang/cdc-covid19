<template>
  <el-card class="aui-card--fill">
    <avue-crud :option="option"
               :data="data"
               :table-loading="loading"
               v-model="form"
               v-dialogdrag
               :page="page"
               @on-load="onload"
               @tree-load="treeLoad"
               @row-save="rowSave"
               @row-update="rowUpdate"
               @row-del="rowDel">
               <template slot="menu" slot-scope="scope">
                  <el-button type="text"
                           size="mini"
                           icon="el-icon-delete"
                           @click="rowDel(scope.row)"
                           class="dangerBtn">删 除
                  </el-button>
               </template>
    </avue-crud>
  </el-card>
</template>

<script>
  import {getTaskCategoryTreeList,save,update,remove} from '@/api/task-category/task-category'
  import {getUserList} from '@/api/user/user'
  export default {
    data(){
      return {
        data: [],
        form: {},
        page: {},
        loading: false,
        option: {
          headerAlign: 'center',
          border: true,
          index: true,
          indexLabel: '序号',
          loading: false,
          delBtn: false,
          size: 'mini',
          column: [
            {
              label: '名称',
              prop: 'name',
              textAlign: 'left'
            },
            {
              label: '上级名称',
              prop: 'parentId',
              type: 'tree',
              align: 'center',
              dicData: [],
              hide: true,
              props: {
                label: 'name',
                value: 'id'
              },
            },
            {
              label: '创建人',
              prop: 'creator',
              type: 'select',
              align: 'center',
              hide: true,
              display: false,

              props: {
                label: 'realName',
                value: 'id'
              },
              dicData: getUserList()
            },
            {
              label: '创建时间',
              prop: 'createDate',
              align: 'center',
              hide: true,
              display: false
            },
            {
              label: '最近修改',
              prop: 'updater',
              type: 'select',
              align: 'center',
              display: false,
              props: {
                label: 'realName',
                value: 'id'
              },
              dicData: getUserList()
            },
            {
              label: '创建/修改时间',
              prop: 'updateDate',
              align: 'center',
              display: false
            },
            {
              label: '排序',
              prop: 'sort',
              type: 'number',
              align: 'center',
              minRows: 0,
              value: 0
            }
          ]
        }
      }
    },
    methods: {
      rowSave(row, loading, done) {
        save(row).then(() => {
          loading();
          this.onload(this.page);
          this.$message({
            type: "success",
            message: "操作成功!"
          })
        }, error => {
          done();
          console.log(error);
        })
      },
      rowUpdate(row, index, loading, done) {
         // console.log('update :', row)
         if(row.parentId instanceof Array){
             row.parentId = null
         }
        update(row).then(() => {
          loading();
          this.onload(this.page);
          this.$message({
            type: "success",
            message: "操作成功!"
          })
        }, error => {
          done();
          console.log(error);
        })
      },
      rowDel(row) {
        this.$confirm("确定将选择数据删除?", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          cancelButtonClass: "btn-custom-cancel",
          type: "warning"
        }).then(() => {
          remove(row.id).then(res => {
            if (res.data.code === "0") {
              this.$message({
                type: "success",
                message: "操作成功!"
              })
              this.onload(this.page);
            } else {
              return this.$message.error(res.data.msg)
            }
          })
        }).catch(() => {})
      },
      onload(page, params = {}) {
        this.loading = true;
        //获取整个列表数据
        getTaskCategoryTreeList(this.parentId, Object.assign(params)).then(res => {
          this.data = res.data.data;
          // 获取上级名称的树形列表
          let parentId = this.findObject(this.option.column,'parentId')
          parentId.dicData = res.data.data
          this.loading = false;
        })
      },
      treeLoad(tree, treeNode, resolve) {
        getTaskCategoryTreeList().then(res =>{
          resolve(res.data.data);
        })
      }
    }
  }
</script>
