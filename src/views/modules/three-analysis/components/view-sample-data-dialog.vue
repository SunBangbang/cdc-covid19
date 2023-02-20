<template>
    <el-dialog :title="title"
                :visible.sync="visible"
                width="45%"
                append-to-body
               :before-close="handleClose"
                left>
        <avue-crud  :option="option"
                    :data="data"
                    :page.sync="page"
                    @size-change="sizeChange"
                    @current-change="currentChange"
                    @refresh-change="refreshChange">
            <template slot="menu" slot-scope="scope">
                <el-button type="text" icon="el-icon-search" @click="toQuestionaire(scope.row)" size="mini">查看</el-button>
            </template>
            <template slot="participant" slot-scope="scope">
                {{scope.row.participant}}
            </template>
            <!--<template slot="source" slot-scope="scope">
                {{scope.row.source}}
            </template>-->
            <template slot="identity" slot-scope="scope">
                {{scope.row.identity}}
            </template>
        </avue-crud>
    </el-dialog>
</template>
<script>
import { pageSampleForCondQuery } from '@/api/three-analysis/three-analysis'
import {getDictDataList} from '@/utils'

export default {
    name: 'viewSampleDataDialog',
    props: {
        analysisRecord:{},
        showProp: {}
    },
    data() {
        return {
            visible: true,
            page: {
                pageSize: 10,
                currentPage: 1,
                total: 0,
                pageSizes: [10, 20, 50, 100]
            },
            title: '查看样本数据',
            option: {
                border: true,
                index: true,
                indexLabel:'序号',
                menuPosition: "left",
                menuType: 'text',
                editBtn:false,
                addBtn: false,
                delBtn: false,
                viewBtn: false,
                size: "mini",
                stripe: false,
                headerAlign: 'left',
                align: 'left',
                tree: true,
               // labelWidth: 150,
                menuWidth: 120,
                column: [{
                    width: 140,
                    label: '被调查者',
                    prop: 'participant',
                    slot: true
                },{
                    label: "性别",
                    prop: "sex",
                    width: 80
                },
                {
                    label: '来源',
                    prop: 'source',
                    //width: 80,
                    // slot: true,
                    dictType: 'select',
                    dicData: getDictDataList("sample-channel"),
                    props: {
                        label: 'dictLabel',
                        value: 'dictValue'
                    }
                }, {
                    label: '证件号',
                    prop: 'identity',
                    width: 180,
                    slot: true
                }]
            },
            data: [],
            loading: true
        };
    },
    methods: {
        init() {
            this.visible = true;
            console.log('show prop:', this.showProp)
            if(this.showProp  && this.showProp.prop !== 'sex'){
              this.option.column.splice(4, 1)
              this.option.column.push({
                label: this.showProp.title,
                prop: this.showProp.prop,
                width: 200
              })
            }
            if(this.showProp){
              this.title = '查看' + this.showProp.title + '样本数据'
            }
            this.onLoad();
        },
        onLoad() {
            let params = {props: 'participant,sex,source,identity,' + this.showProp.prop}
            pageSampleForCondQuery(this.page.currentPage, this.page.pageSize, this.analysisRecord, params).then(res => {
                this.data = res.data.data.list;
                this.page.total = res.data.data.total;
                this.loading = false
            })
        },
        sizeChange(val) {
            this.page.currentPage = 1;
            this.page.pageSize = val
            this.onLoad();
        },
        currentChange(val) {
            this.page.currentPage = val;
            this.onLoad();
        },
        refreshChange() {
          this.onLoad();
        },
        handleClose(){
          this.$emit('close')
        },
        toQuestionaire(row) {
            console.log(row)
            this.$router.push({name: 'questionnaire-detail', params: {id: row.id, surveyFormId: this.analysisRecord.formId}})
            this.visible = false;
        }
    }
}
</script>
