<template>
  <el-card shadow="never" class="aui-card--fill">
    <div class="mod-sys__log-login">
      <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()" size="mini">
        <el-form-item>
          <el-input v-model="dataForm.creatorName" :placeholder="$t('logLogin.creatorName')" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getDataList()" icon="el-icon-search">{{ $t('query') }}</el-button>
        </el-form-item>
        <el-form-item>
          <el-button icon="el-icon-delete" @click="clear()">{{ $t('reset') }}</el-button>
        </el-form-item>
      </el-form>
<!--      <el-form :inline="true" size="mini">-->
<!--        <el-form-item>-->
<!--          <el-button type="primary" @click="exportHandle()" icon="el-icon-download">{{ $t('export') }}</el-button>-->
<!--        </el-form-item>-->
<!--      </el-form>-->
      <el-table
        v-loading="dataListLoading"
        :data="dataList" border
        @sort-change="dataListSortChangeHandle"
        style="width: 100%;"
        size="mini">
        <el-table-column prop="creatorName" :label="$t('logLogin.creatorName')" header-align="center" align="center"></el-table-column>
        <el-table-column prop="operation" :label="$t('logLogin.operation')" header-align="center" align="center">
          <template slot-scope="scope">
            {{ scope.row.operation === 0 ? $t('logLogin.operation0') : $t('logLogin.operation1') }}
          </template>
        </el-table-column>
        <el-table-column prop="ip" :label="$t('logLogin.ip')" header-align="center" align="center"></el-table-column>
        <el-table-column prop="userAgent" :label="$t('logLogin.userAgent')" header-align="center" align="center" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="createDate" :label="$t('logLogin.createDate')" sortable="custom" header-align="center" align="center"></el-table-column>
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
    </div>
  </el-card>
</template>

<script>
import mixinViewModule from '@/mixins/view-module'
export default {
  mixins: [mixinViewModule],
  data () {
    return {
      mixinViewModuleOptions: {
        getDataListURL: '/sys/log/login/page',
        getDataListIsPage: true,
        exportURL: '/sys/log/login/export'
      },
      dataForm: {
        creatorName: ''
      }
    }
  }
}
</script>
