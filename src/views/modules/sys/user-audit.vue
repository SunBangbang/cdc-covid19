<template>
  <div>
    <el-card class="aui-card--fill--back">
      <avue-crud
        @row-update="rowUpdate"
        ref="crud"
        :data="data"
        :option="option"
        :page.sync="page"
        :search.sync="search"
        @search-change="searchChange"
        @selection-change="selectionChange"
        @on-load="onLoad">
        <template slot-scope="{row,index}" slot="menu">
          <el-button :disabled="row.status !== 0"
                     type="text"
                     icon="el-icon-circle-check"
                     size="mini"
                     @click.stop="openAuditDialog(row, index)">通过
          </el-button>
          <el-button :disabled="row.status !== 0"
                     type="text"
                     icon="el-icon-circle-close"
                     size="mini"
                     style="color: red"
                     @click.stop="$refs.crud.rowEdit(row,index)">驳回
          </el-button>
        </template>
        <template slot="menuLeft">
          <el-button v-if="$store.state.user.superAdmin === 1" type="danger" size="mini" icon="el-icon-delete" @click="toDel">删除</el-button>
        </template>
      </avue-crud>
    </el-card>
    <el-dialog
      title="角色配置"
      :visible.sync="auditDialogVisible"
      width="30%">
      <div>
        <span>角色配置：</span>
        <el-select size="mini" v-model="roleIdList" multiple placeholder="请选择角色(可多选)" value-key="id">
          <el-option v-for="role in roleList" :key="role.id" :label="role.name" :value="role.id"></el-option>
        </el-select>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" type="primary" @click="handleApproved">确 定</el-button>
        <el-button size="mini" @click="auditDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {getPageList, update, batchDelete} from "@/api/sys/user-register";
import {getDictDataList} from '@/utils';
import {getDeptTreeList} from "@/api/device/device";
import {userAuditOptions} from "@/views/modules/sys/options/sysUserOptions";

export default {
  name: "user-audit",
  data() {
    return {
      rowData: {},
      auditDialogVisible: false,
      roleIdList: [],
      roleList: [],
      search: {},
      page: {
        currentPage: 1,
        pageSize: 10,
        total: 0,
        pageSizes: [10, 20, 50, 100]
      },
      option: userAuditOptions(),
      data: [],
      selectionList: [],
      // option: {
      //   align: 'center',
      //   menuAlign: 'center',
      //   editBtn: false,
      //   addBtn: false,
      //   delBtn: false,
      //   editTitle: '填写驳回原因',
      //   updateBtnText: '提交',
      //   // title: '用户注册审核',
      //   index: true,
      //   indexLabel: '序号',
      // }
    }
  },
  created() {
    this.init();
  },
  methods: {
    onLoad(page = {currentPage: 1, pageSize: 10}, params) {
      getPageList(page.currentPage, page.pageSize, params).then(res => {
        if (res.data.code === 0) {
          this.data = res.data.data.list
          this.page.total = res.data.data.total
        }
      })
    },
    init() {
      this.getRoleList();
      getDeptTreeList().then(res => {
        let deptId = this.findObject(this.option.column, 'deptId')
        deptId.dicData = res.data.data
      })
    },

    // 获取角色列表
    getRoleList() {
      return this.$http.get('/sys/role/list').then(({data: res}) => {
        if (res.code !== 0) {
          return this.$message.error(res.msg)
        }
        this.roleList = res.data
      }).catch(() => {
      })
    },
    searchChange(params, done) {
      done();
      this.onLoad({currentPage: 1, pageSize: 10}, params)
    },
    openAuditDialog(row, index) {
      this.roleIdList = [];
      this.auditDialogVisible = true
      this.rowData = row
    },
    selectionChange(list) {
      this.selectionList = list;
    },
    toDel() {
      if(this.selectionList.length < 1) {
        this.$message.warning('请先选择需要删除的数据')
        return
      }
      this.$confirm("确定将选择数据删除?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        cancelButtonClass: "btn-custom-cancel",
        type: "warning"
      })
        .then(() => {
          batchDelete(this.selectionList.map(s => s.id)).then(res => {
            if(res.data.code === 0) {
              this.$message.success('操作成功')
              this.selectionList = [];
              this.$refs.crud.toggleSelection();
              this.onLoad();
            } else {
              this.$message.error({ message: res.data.msg, duration: 10000 });
            }
          })
      }).catch(() => {});
    },
    handleApproved() {
      if (this.roleIdList.length > 0) {
        this.$confirm('确认通过审核？', {cancelButtonClass: "btn-custom-cancel",})
          .then(_ => {
            const data = this.rowData
            data.status = 1
            data.roleIdList = this.roleIdList
            update(data).then(res => {
              if (res.data.code === 0) {
                this.$message.success("审核成功！")
                this.auditDialogVisible = false
                this.rowData = {}
              }
            })
          })
          .catch(_ => {
          });
      } else {
        this.$message.error("请先配置角色！")
      }

    },
    rowUpdate(form, index, done, loading) {
      form.status = 2
      update(form).then(res => {
        if (res.data.code === 0) {
          this.$message.success('已驳回')
          loading();
          done(form)
        } else {
          console.error('error:', res.data.msg)
          this.$message.error(res.data.msg)
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
