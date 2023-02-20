<template>
  <el-card shadow="never" class="aui-card--fill">
    <div class="mod-sys__user">
      <el-form
        label-width="90px"
        :inline="true"
        :model="dataForm"
        @keyup.enter.native="getDataList()"
        size="mini"
        class="avue-crud__search"
      >
        <el-form-item label="隶属机构：">
          <!--            <avue-input-tree size="mini" :option="treeOption" v-model="dataForm.deptId" placeholder="请选择组织" type="tree" :dic="deptTreeData" :clearable="false"></avue-input-tree>-->
          <el-cascader
            size="mini"
            v-model="dataForm.deptId"
            ref="cascader"
            :placeholder="$store.state.user.currentDeptName"
            :show-all-levels="false"
            @visible-change="formatDeptId(dataForm.deptId)"
            :props="defaultProps"
          >
          </el-cascader>
        </el-form-item>
        <el-form-item label="包含下级：">
          <el-checkbox v-model="dataForm.includeSub"></el-checkbox>
        </el-form-item>
        <el-form-item label="状态：">
          <el-select
            size="mini"
            v-model="dataForm.status"
            :placeholder="$t('user.status')"
            :clearable="false"
            default-first-option
          >
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="用户名：">
          <el-input
            size="mini"
            v-model="dataForm.username"
            placeholder="搜索用户名"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="真实姓名：">
          <el-input
            size="mini"
            v-model="dataForm.realName"
            placeholder="搜索真实姓名"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-search"
            @click="getDataList()"
            >{{ $t("query") }}</el-button
          >
        </el-form-item>
        <el-form-item>
          <el-button size="mini" @click="clearNew()" icon="el-icon-delete">{{
            $t("reset")
          }}</el-button>
        </el-form-item>

        <!--<el-form-item>-->
        <!--<el-button size="mini" v-if="$hasPermission('sys:user:export')" type="info" @click="exportHandle()">{{ $t('export') }}</el-button>-->
        <!--</el-form-item>-->
      </el-form>
      <el-form :inline="true" size="mini">
        <el-form-item>
          <el-button
            type="primary"
            size="mini"
            v-if="$hasPermission('sys:user:save')"
            @click="addHandle()"
            icon="el-icon-plus"
            >{{ $t("add") }}</el-button
          >
        </el-form-item>
        <el-form-item>
          <el-button
            type="danger"
            size="mini"
            v-if="isSuperAdmin && $hasPermission('sys:user:delete')"
            @click="deleteHandle()"
            icon="el-icon-delete"
            >{{ $t("delete") }}</el-button
          >
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="mini"
            v-if="$hasPermission('sys:user:downloadTemplate')"
            @click="downloadTemplate()"
            icon="el-icon-download"
            >{{ $t("downloadTemplate") }}</el-button
          >
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="mini"
            v-if="$hasPermission('sys:user:import')"
            @click="importUsers()"
            icon="el-icon-download"
            >{{ $t("import") }}</el-button
          >
        </el-form-item>
      </el-form>
      <userImportDialog ref="userImportDialog" @onLoad="getDataList()" />
      <el-table
        v-loading="dataListLoading"
        :data="dataList"
        border
        row-key="id"
        @selection-change="dataListSelectionChangeHandle"
        @sort-change="dataListSortChangeHandle"
        style="width: 100%"
        size="mini"
      >
        <el-table-column
          v-if="isSuperAdmin"
          type="selection"
          :reserve-selection="true"
          header-align="center"
          align="center"
          width="50"
        ></el-table-column>
        <el-table-column
          prop="username"
          label="用户名"
          sortable="custom"
          header-align="center"
          align="center"
          width="120"
        ></el-table-column>
        <el-table-column
          prop="realName"
          :label="$t('user.realName')"
          sortable="custom"
          header-align="center"
          align="center"
          width="120"
        ></el-table-column>
        <el-table-column
          prop="mobile"
          :label="$t('user.mobile')"
          sortable="custom"
          header-align="center"
          align="center"
          width="110"
        ></el-table-column>
        <el-table-column
          prop="trueDeptName"
          label="隶属组织"
          header-align="center"
          align="center"
          width="200"
          :show-overflow-tooltip="true"
        ></el-table-column>
        <el-table-column
          prop="deptName"
          label="所在组织"
          header-align="center"
          align="center"
          width="300"
          :show-overflow-tooltip="true"
        ></el-table-column>
        <el-table-column
          prop="roleList"
          :label="$t('user.roleIdList')"
          header-align="center"
          align="center"
          :show-overflow-tooltip="true"
        >
          <template slot-scope="scope">
            <span v-for="(item, index) in scope.row.roleList" :key="index">
              <el-tag size="mini" type="success">{{ item }}</el-tag> &nbsp;
            </span>
          </template>
        </el-table-column>
        <!--<el-table-column prop="gender" :label="$t('user.gender')" sortable="custom" header-align="center" align="center">-->
        <!--<template slot-scope="scope">-->
        <!--{{ $getDictLabel("gender", scope.row.gender) }}-->
        <!--</template>-->
        <!--</el-table-column>-->
        <el-table-column
          prop="updateDate"
          :label="$t('user.updateDate')"
          sortable="custom"
          header-align="center"
          align="center"
          width="160"
        ></el-table-column>
        <el-table-column
          prop="status"
          :label="$t('user.status')"
          sortable="custom"
          header-align="center"
          align="center"
          width="80"
        >
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 0" size="mini" type="danger">{{
              $t("user.status0")
            }}</el-tag>
            <el-tag v-else size="mini" type="success">{{
              $t("user.status1")
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="authCode"
          :label="$t('user.authCode')"
          header-align="center"
          align="center"
          width="120"
        ></el-table-column>
        <el-table-column
          :label="$t('handle')"
          header-align="center"
          align="center"
          width="200"
        >
          <template slot-scope="scope">
            <el-button
              v-if="$hasPermission('sys:user:update')"
              type="text"
              size="mini"
              @click="addOrUpdateHandle(scope.row.id)"
              icon="el-icon-edit"
              >{{ $t("update") }}</el-button
            >
            <!--重置密码条件： 当前用户隶属部门下，非当前用户， 当前用户通过下拉菜单修改密码，来重置密码 -->
            <el-button
              type="text"
              size="mini"
              icon="el-icon-lock"
              @click="updatePasswordBtn(scope.row)"
              v-if="
                $hasPermission('sys:user:resetpwd') &&
                (isSuperAdmin || scope.row.id !== $store.state.user.id)
              "
            >
              重置密码
            </el-button>
            <el-button
              v-if="$hasPermission('sys:user:delete')"
              type="text"
              size="mini"
              @click="deleteHandle(scope.row.id)"
              icon="el-icon-delete"
              class="dangerBtn"
              >{{ $t("delete") }}</el-button
            >
            <el-button 
              v-if="!scope.row.authCode && $hasPermission('sys:user:bindOthersAuthcode')" 
              type="text" 
              size="mini" 
              @click="onAuthCodeDialogShow(scope.row)"
              >绑定授权码</el-button
            >
            <el-button
              v-if="$hasPermission('sys:user:unbindAuthcode')"
              type="text"
              size="mini"
              :disabled="!scope.row.authCode"
              @click="confirmUnbindAuthCode(scope.row.id)"
              class="dangerBtn"
              >解除授权</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page.sync="page"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="limit"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="pageSizeChangeHandle"
        @current-change="pageCurrentChangeHandle"
      >
      </el-pagination>
      <!-- 弹窗, 新增 / 修改 -->
      <add-or-update
        v-if="addOrUpdateVisible"
        ref="addOrUpdate"
        @refreshDataList="getDataList"
        @user-close="handleUserClose"
      ></add-or-update>
      <!-- 弹窗, 重置密码 -->
      <update-password
        v-if="updatePasswordVisible"
        ref="updatePassword"
      ></update-password>
      <!-- 绑定授权码 -->
      <authCodeDialog
        v-if="authCodeDialogVisible"
        ref="authCodeDialog"
        @refreshDataList="getDataList"
      ></authCodeDialog>
    </div>
  </el-card>
</template>

<script>
import mixinViewModule from "@/mixins/view-module";
import AddOrUpdate from "./user-add-or-update";
import UpdatePassword from "./reset-password";
import authCodeDialog from "./auth-code.vue";
import userImportDialog from "./user-import-dialog";
import { lazyDeptTree } from "@/api/sys/dept";
import { getRedisDeptList } from "@/api/subject-task/task-management";
import AppConstant from "@/utils/AppConstant";
import { unbindAuthcode } from "@/api/sys/setAuthCode";
import ViewCustomForm from '../survey-form/view-custom-form.vue';

export default {
  mixins: [mixinViewModule],
  data() {
    return {
      isSuperAdmin:
        this.$store.state.user.superAdmin == AppConstant.USER_IS_SUPER_ADMIN,
      truthDeptId: this.$store.state.user.truthDeptId,
      dialogVisible: false,
      updatePasswordVisible: false,
      mixinViewModuleOptions: {
        getDataListURL: "/sys/user/page",
        getDataListIsPage: true,
        deleteURL: "/sys/user",
        deleteIsBatch: true,
        exportURL: "/sys/user/export",
      },
      // loading: true,
      dataForm: {
        username: "",
        deptId: this.$store.state.user.deptId,
        gender: "",
        status: "1",
        realName: "",
        includeSub: false,
      },
      statusOptions: [
        {
          value: "0",
          label: "停用",
        },
        {
          value: "1",
          label: "正常",
        },
      ],
      deptList: [],
      // treeOption:{
      //   defaultExpandAll:true,
      //   props:{
      //     label:'name',
      //     value:'id',
      //     children:'children'
      //   }
      // },
      defaultProps: {
        label: "label",
        value: "id",
        children: "children",
        leaf: "leaf",
        lazy: true,
        lazyLoad: this.loadNode,
        checkStrictly: true,
        emitPath: false,
      },
      authCodeDialogVisible: false
      // deptTreeData:[],
    };
  },
  components: {
    AddOrUpdate,
    UpdatePassword,
    userImportDialog,
    authCodeDialog,
    ViewCustomForm,
  },
  created() {
    // this.getDeptList()
  },
  mounted() {
    this.$refs["cascader"].inputValue = this.$store.state.user.currentDeptName;
  },
  methods: {
    // 获取组织机构列表数
    // getDeptList () {
    //   return this.$http.get('/sys/dept/tree/named').then(({ data: res }) => {
    //     if (res.code !== 0) {
    //       return this.$message.error(res.msg)
    //     }
    //     this.deptTreeData = res.data;
    //   }).catch(() => {
    //     this.loading = false
    //   })
    // },
    handleUserClose() {
      this.addOrUpdateVisible = false;
    },
    onClick(id, status) {
      if (status === 1) {
        this.disableUser(id);
      } else {
        this.enableUser(id);
      }
    },
    onAuthCodeDialogShow(row) {
      this.authCodeDialogVisible = true;
      this.$nextTick(() => {
        this.$refs.authCodeDialog.init(row);
      });
    },
    importUsers() {
      this.$refs.userImportDialog.open();
    },
    disableUser(id) {
      this.$confirm("是否停用?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        cancelButtonClass: "btn-custom-cancel",
        type: "warning",
      })
        .then(() => {
          this.$http
            .post("/sys/user/disableUser", [id])
            .then(({ data: res }) => {
              if (res.code == 0) {
                this.getDataList();
              } else {
                this.$message.error(res.data.msg);
              }
            });
        })
        .catch(() => {});
    },
    enableUser(id) {
      this.$confirm("是否启用?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        cancelButtonClass: "btn-custom-cancel",
        type: "warning",
      })
        .then(() => {
          this.$http
            .post("/sys/user/enableUser", [id])
            .then(({ data: res }) => {
              if (res.code == 0) {
                this.getDataList();
              } else {
                this.$message.error(res.data.msg);
              }
            });
        })
        .catch(() => {});
    },
    updatePasswordBtn(row) {
      this.updatePasswordVisible = true;
      this.$nextTick(() => {
        this.$refs.updatePassword.init(row);
      });
    },
    loadNode(node, resolve) {
      let deptList = [];
      if (node.level === 0) {
        lazyDeptTree({ pid: this.$store.state.user.deptId })
          .then((res) => {
            deptList = res.data.data;
            if (deptList.children && deptList.children.length > 0) {
              return;
            }
            // return deptList.children && deptList.children.length > 0 ? resolve(deptList.children) : resolve([])
            return resolve(deptList);
          })
          .catch(() => {});
      }
      if (node.level === 1) {
        return resolve([]);
        // let subDeptList = [];
        // console.log(node);
        // lazyDeptTree({ pid: node.data.id })
        //   .then(res => {
        //     subDeptList = res.data.data[0];
        //     return resolve([]);
        //   })
        //   .catch(() => {});
        // return resolve(node.data.children)
      }
      if (node.level >= 2) {
        let subDeptList = [];
        console.log(node);
        lazyDeptTree({ pid: node.data.id })
          .then((res) => {
            subDeptList = res.data.data[0];
            return subDeptList.children && subDeptList.children.length > 0
              ? resolve(subDeptList.children)
              : resolve([]);
          })
          .catch(() => {});
      }
    },

    formatDeptId(value) {
      getRedisDeptList(value).then((res) => {
        let that = this;
        setTimeout(function () {
          that.$refs["cascader"].inputValue = res.data.data;
        }, 400);
      });
    },
    addHandle() {
      this.addOrUpdateVisible = true;
      this.$nextTick(() => {
        this.$refs.addOrUpdate.dataForm.id = "";
        this.$refs.addOrUpdate.deptSelectedList = [];
        this.$refs.addOrUpdate.dataForm.investigator = 0;
        this.$refs.addOrUpdate.init();
      });
    },
    clearNew() {
      this.dataForm.deptId = this.$store.state.user.deptId;
      this.dataForm.username = "";
      this.dataForm.status = "";
      this.dataForm.realName = "";
      this.dataForm.includeSub = false;
    },
    confirmUnbindAuthCode(id) {
      this.$confirm("解除授权后将无法登录系统，确认进行解除授权操作", "提示", {
        confirmButtonText: this.$t("confirm"),
        cancelButtonText: this.$t("cancel"),
        cancelButtonClass: "btn-custom-cancel",
        type: "warning",
      })
        .then(() => {
          const tmpArray = [];
          tmpArray.push(id);
          const data = {
            ids: tmpArray,
          };
          unbindAuthcode(data)
            .then((res) => {
              if (res.data.code !== 0) {
                this.$message.error(res.data.msg);
              } else {
                this.$message.success("解除授权成功");
                this.query();
              }
            })
            .catch((error) => {
              this.$message.error(error);
            });
        })
        .catch(() => {});
    },
  },
};
</script>
