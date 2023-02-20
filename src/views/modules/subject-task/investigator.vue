<!-- 重要的调查员对象组件, 由AnyaParry开发.调查对象页面和创建任务时选择调查对象两个页面调用该组件.请尽量不要修改现有代码,尽可能增量更新.-->
<template>
  <div>
    <avue-crud @on-load="onLoad"
               @search-change="search"
               @size-change="sizeChange"
               @current-change="currentChange"
               @selection-change="selectionChange"
               :data="tableData"
               ref="crud"
               :option="dialogOption"
               :search.sync="searchData"
               :page.sync="page"
               v-model="form">
      <template slot="deptIdSearch">
        <el-cascader
          clearable
          v-model="searchData.deptId"
          placeholder="搜索机构名称"
          ref="cascader"
          :show-all-levels="false"
          :props="defaultProps"
        ></el-cascader>
      </template>
      <template slot="mobile" slot-scope="scope" >
        {{scope.row.mobile.replace(/^(\d{3})\d{4}(\d+)/, "$1****$2")}}
      </template>
    </avue-crud>
  </div>
</template>

<script>
import {option, investigatorDialogOption} from "@/views/modules/subject-task/option/crudOption";
import {getDictLabel} from "@/utils";
import {investigatorInfoPage} from "@/api/subject-task/investigatorInfo";
import {lazyDeptTree} from "@/api/sys/dept";
import {getRedisDeptList} from "@/api/subject-task/task-management";


export default {
  name: "investigator",
  props: {
    includeAllDept: {
      type: Boolean,
      default: true,
    },
    menu: {
      type: Boolean,
      default: false, //是否显示菜单
    },
    /**
     * 最外层必须是一个数组，数组中的元素可以是Object或者Long或者String或者Number
     */
    investigator: {
      default: () => {
        return []
      }
    },
  },
  data() {
    return {
      deptSelectedList:[],
      deptListTags: [],
      deptListData: [],
      defaultProps: {
        label: 'label',
        value: 'id',
        children: 'children',
        leaf: 'leaf',
        lazy: true,
        lazyLoad: this.loadNode,
        checkStrictly: true,
        emitPath: false,
      },
      deptIdList: [],
      rowData: {},
      selectionList: [],
      formData:{},
      disabled: false,
      dialogVisible: false,
      cancelCheck: [],
      tableData: [],
      // option: option(this.disabled, this.menu, this.investigator),
      dialogOption: investigatorDialogOption(this.includeAllDept, this.investigator),
      // formOption: respondentFromOption(this.disabled),
      searchData: {},
      page: {
        currentPage: 1,
        total: 0,
        pageSize: 10,
        pageSizes: [10, 20, 50, 100]
      },
      form: {},
    }
  },
  methods: {
   onLoad(done) {
     let searchData = Object.assign({}, this.searchData)
     searchData.deptId = searchData.deptId ? searchData.deptId : this.$store.state.user.deptId
     investigatorInfoPage(this.page.currentPage, this.page.pageSize, this.$store.state.user.deptId, searchData).then(res => {
        if(res.data.code === 0){
          // console.log(res.data.data.list)
          this.tableData = res.data.data.list
          this.tableData.forEach(item => {
            //替换隶属机构ID为所在机构ID
            item.deptId = searchData.deptId
            this.formatDeptId(item.deptId)
          })
          this.page.total = res.data.data.total
        }
        if (done && done.constructor !== Object) {
          done()
        }
      })
    },
    sizeChange (val) {
      this.page.pageSize = val
      this.onLoad()
    },
    currentChange (val) {
      this.page.currentPage = val
      this.onLoad()
    },
    search(from, done) {
      this.searchData = Object.assign({},from)
      this.onLoad(done)
    },
    selectionChange(list){
      this.selectionList = list
    },
    loadNode(node, resolve) {
      let deptList = []
      if (node.level === 0) {
        lazyDeptTree().then((res) => {
          deptList = res.data.data
          return resolve(deptList)
        }).catch(() => {})
      }
      if (node.level >=  1) {
        let subDeptList = []
        console.log(node)
        lazyDeptTree({pid: node.data.id}).then((res) => {
          subDeptList = res.data.data[0]
          return subDeptList.children &&subDeptList.children.length>0 ? resolve(subDeptList.children) : resolve()
        }).catch(() => {})
        // return resolve(node.data.children)
      }
    },
    formatDeptId(value) {
      if(this.includeAllDept){
        getRedisDeptList(value).then(res => {
          this.dialogOption.column[3].dicData.push({label: res.data.data, value: value})
        })
      }
    },
  },
}
</script>

<style scoped>
:deep(.el-form-item--mini > .el-form-item__content > .el-button--default) {
  margin-right: 5px;
}
</style>
