<template>
  <el-card shadow="never" class="aui-card--fill">
    <div class="mod-sys__dept">
      <el-table size="mini" v-loading="dataListLoading" :data="dataList" row-key="id" border style="width: 100%;">
        <el-table-column prop="name" :label="$t('dept.name')" header-align="center" min-width="150"></el-table-column>
        <el-table-column prop="parentName" :label="$t('dept.parentName')" header-align="center" align="center"></el-table-column>
        <el-table-column prop="regionNames" :label="$t('dept.region')" header-align="center" align="center"></el-table-column>
      </el-table>
    </div>
  </el-card>
</template>

<script>
import mixinViewModule from '@/mixins/view-module'
// import AddOrUpdate from './dept-add-or-update'
export default {
  mixins: [mixinViewModule],
  data () {
    return {
      mixinViewModuleOptions: {
        getDataListURL: '/sys/dept/list',
        deleteURL: '/sys/dept'
      }
    }
  },
  // components: {
  //   AddOrUpdate
  // }
}
</script>
