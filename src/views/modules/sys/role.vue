<template>
  <el-card shadow="never" class="aui-card--fill">
    <div class="mod-sys__role">
      <el-form
        :inline="true"
        :model="dataForm"
        @submit.native.prevent
        size="mini"
        class="avue-crud__search">
        <el-form-item :label="$t('role.name') + ':'">
          <el-input size="mini" v-model="dataForm.name" :placeholder="'请输入'+$t('role.name')" clearable maxlength="30" @keyup.enter.native="getDataList()"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-search"
            @click="getDataList()">{{ $t('query') }}</el-button>
        </el-form-item>
        <el-form-item>
          <el-button
            size="mini"
            icon="el-icon-delete"
            @click="clear()">{{ $t('reset') }}</el-button>
        </el-form-item>
      </el-form>
      <el-form :inline="true" size="mini">
        <el-form-item>
          <el-button
            v-if="$hasPermission('sys:role:save')"
            type="primary"
            size="mini"
            @click="addOrUpdateHandle()"
            icon="el-icon-plus">{{ $t('add') }}</el-button>
        </el-form-item>
      </el-form>
      <el-table
        v-loading="dataListLoading"
        :data="dataList"
        border
        @selection-change="dataListSelectionChangeHandle"
        @sort-change="dataListSortChangeHandle"
        style="width: 100%;"
        size="mini">
<!--        <el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>-->
        <el-table-column prop="name" :label="$t('role.name')" header-align="center" align="center" :show-overflow-tooltip="true"></el-table-column>
<!--        <el-table-column prop="creatorName" label="创建人" header-align="center" align="center" :show-overflow-tooltip="true"></el-table-column>-->
        <el-table-column prop="remark" :label="$t('role.remark')" header-align="center" align="center"></el-table-column>
        <el-table-column prop="createDate" :label="$t('role.createDate')" sortable="custom" header-align="center" align="center" width="180"></el-table-column>
        <el-table-column :label="$t('handle')" header-align="center" align="center" width="150">
          <template slot-scope="scope">
            <el-button
              v-if="$hasPermission('sys:role:update') && scope.row.shareLevel===0 || isSuperAdmin ===1"
              type="text"
              size="mini"
              @click="addOrUpdateHandle(scope.row.id)"
              icon="el-icon-edit">{{ $t('update') }}</el-button>
            <el-button
              v-if="$hasPermission('sys:role:delete') && scope.row.shareLevel===0 || isSuperAdmin ===1"
              type="text"
              size="mini"
              @click="deleteHandle(scope.row.id)"
              icon="el-icon-delete"
              class="dangerBtn">{{ $t('delete') }}</el-button>
            <p style="color:#D1D1D1" v-if="scope.row.shareLevel!==0 && isSuperAdmin !==1" type="info" disabled>预制的共享型角色</p>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page="page"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="limit"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="pageSizeChangeHandle"
        @current-change="pageCurrentChangeHandle">
      </el-pagination>
      <!-- 弹窗, 新增 / 修改 -->
      <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
    </div>
  </el-card>
</template>

<script>
import mixinViewModule from '@/mixins/view-module'
import AddOrUpdate from './role-add-or-update'
export default {
  mixins: [mixinViewModule],
  data () {
    return {
      isSuperAdmin: this.$store.state.user.superAdmin,
      mixinViewModuleOptions: {
        getDataListURL: '/sys/role/page',
        getDataListIsPage: true,
        deleteURL: '/sys/role',
        deleteIsBatch: true
      },
      dataForm: {
        name: ''
      }
    }
  },
  components: {
    AddOrUpdate
  }
}
</script>
