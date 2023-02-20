<template>
    <div style="padding: 20px;background-color: white">
        <avue-crud
                :data="data"
                :option="option"
                :page.sync="page"
                @on-load="onLoad">
            <template slot="menuLeft">
                <el-button type="primary" icon="el-icon-plus" size="mini" @click="toAdd">新增</el-button>
                <el-popover
                        placement="top"
                        v-model="downloadVisible">
                    <div style="text-align: right; margin: 0">
                        <el-button size="mini" type="primary" @click="downloadTemplate('1')">标点模板</el-button>
                        <el-button type="primary" size="mini" @click="downloadTemplate('2')">地图统计模板</el-button>
                    </div>
                    <el-button slot="reference" icon="el-icon-download" type="primary" size="mini">下载模版</el-button>
                </el-popover>
            </template>
            <template slot-scope="scope" slot="menu">
                <el-button type="text" size="mini" @click="viewMapData(scope.row)">查看</el-button>
                <el-button type="text" size="mini" @click="handleDelete(scope.row.oid)" icon="el-icon-delete" class="dangerBtn">删除</el-button>
            </template>
        </avue-crud>
        <el-dialog
                :title="title"
                :visible.sync="visible"
                width="40%"
                append-to-body>
            <avue-form :option="formOption"
                       ref="mapForm"
                       v-model="form">
                <template slot="recordTitle">
                    <el-input size="mini" v-model="form.recordTitle"></el-input>
                </template>
                <template slot="category">
                    <el-select size="mini" v-model="form.category" @change="changeCategory" placeholder="请选择">
                        <el-option
                                v-for="item in options"
                                :key="item.dictValue"
                                :label="item.dictLabel"
                                :value="item.dictValue">
                        </el-option>
                    </el-select>
                </template>
                <template slot="adcode">
                    <avue-input-tree ref="tree"
                                     v-model="form.adcode"
                                     placeholder="请选择内容"
                                     type="tree"
                                     :expand-on-click-node="false"
                                     :dic="cityData"
                                     :props="{label: 'name', value: 'id'}"></avue-input-tree>
                </template>
                <template slot="depth">
                    <el-select size="mini" v-model="form.depth"  placeholder="请选择">
                        <el-option
                                v-for="item in depthOptions"
                                :key="item.dictValue"
                                :label="item.dictLabel"
                                :value="item.dictValue">
                        </el-option>
                    </el-select>
                </template>
                <template slot="file">
                    <input id="inputElement" type="file" accept=".xls,.xlsx">
<!--                    <el-button icon="el-icon-upload" type="primary" size="mini">导入Excel</el-button>-->
                </template>
                <template slot="menuForm">
                    <el-button :loading="submitStatus" icon="el-icon-user" type="primary" @click="handleSubmit">提 交</el-button>
<!--                    <el-button icon="el-icon-delete" @click="handleEmpty">清 空</el-button>-->
                </template>
            </avue-form>
        </el-dialog>
        <el-dialog
                :visible.sync="dataVisible"
                :fullscreen="isFullScreen"
                top="5vh"
                destroy-on-close>
            <span slot="title">
                    <h2>{{dataTitle}}</h2>
                <div style="position: absolute;right: 50px;top: 20px;cursor: pointer" type="button" @click="handleFullScreen"><i style="font-size: 16px" class="el-icon-full-screen"></i> </div>
            </span>

            <div style="height: 700px">
            <map-view v-if="mapVisible" :rowData="rowData"></map-view>
            </div>
        </el-dialog>
    </div>

</template>

<script>
    import {getPageList, uploadFile, deleteData} from '@/api/map-data/mapdata'
    import MapView from './components/map-view'
    import axios from "axios"
    import Cookies from 'js-cookie'
    import {getDictDataList} from '@/utils'
    import {getCity, getProvince, getTreeList} from '@/api/sys/region'

    export default {
        name: "index",
        components: {
            MapView
        },
        data() {
            return {
                cityData: null,
                isFullScreen: false,
                options: getDictDataList('map-data-category'),
                depthOptions: getDictDataList('depth-options'),
                submitStatus: false,
                rowData: null,
                mapVisible: false,
                dataTitle: null,
                dataVisible: false,
                downloadVisible: false,
                form: {
                    recordTitle: null,
                    category: null,
                    adcode: null,
                    depth: null
                },
                formOption: {
                    size: "mini",
                    submitBtn: false,
                    emptyBtn: false,
                    column: [
                        {
                            label: '标题',
                            prop: 'recordTitle',
                            formslot: true,
                            required: true,
                            rules: [{
                                required: true,
                                message: '请输入标题',
                            }],
                            span: 23
                        },
                        {
                            label: '分类',
                            prop: 'category',
                            formslot: true,
                            required: true,
                            rules: [{
                                required: true,
                                message: '请选择分类',
                            }],
                            span: 23
                        },
                        {
                            label: '行政区域',
                            prop: 'adcode',
                            formslot: true,
                            display: false,
                            span: 23
                        },
                        {
                            label: '显示层级',
                            prop: 'depth',
                            formslot: true,
                            display: false,
                            span: 23
                        },
                        {
                            label: '上传文件',
                            prop: 'file',
                            formslot: true,
                            span: 23
                        }
                    ]
                },
                page: {
                    pageSize: 10,
                    currentPage: 1,
                    total: 0,
                    pageSizes: [10, 20, 50, 100]
                },
                title: '新增数据',
                visible: false,
                data: [{
                    recordTitle: '数据1',
                    creator: '吉烨',
                    createAt: '2021-5-12 19:30:00'
                }],
                option: {
                    border: true,
                    index: true,
                    indexLabel: '序号',
                    stripe: true,
                    menuPosition: "left",
                    menuType: 'text',
                    editBtn: false,
                    addBtn: false,
                    addBtnText: '新增',
                    delBtn: false,
                    viewBtn: false,
                    size: "mini",
                    searchSize: "mini",
                    searchMenuSpan: 6,
                    searchBtnText: "查询",
                    emptyBtnText: "重置",
                    dialogWidth: '40%',
                    column: [
                        {
                            label: '标题',
                            prop: 'recordTitle',
                            span: 24,
                            overHidden: true
                        },
                        {
                            label: '分类',
                            prop: 'category',
                            props: {
                                label: 'dictLabel',
                                value: 'dictValue'
                            },
                            dicData: getDictDataList('map-data-category'),
                        },
                        {
                            label: '创建者',
                            prop: 'creator'
                        },
                        {
                            label: '创建时间',
                            prop: 'createAt'
                        }
                    ]
                }
            }
        },
        methods: {
            onLoad() {
                getPageList(this.page.currentPage, this.page.pageSize).then(res => {
                    if(res.data.code === 0){
                        // console.log(res.data.data)
                        const data = res.data.data.list;
                        data.forEach(item => {
                            item.creator = item.createBy.realName;
                        })
                        this.data = data;
                        this.page.total = res.data.data.total
                    }else{
                        console.error('err:', res.data.msg)
                        this.$message.error(res.data.msg)
                    }
                })
                getTreeList({threeLevel: false}).then(res=>{
                    if(res.data.code === 0){
                        this.cityData = res.data.data
                    }else{
                        console.error('err:', res.data.msg)
                        this.$message.error(res.data.msg)
                    }
                })
            },
            toAdd() {
                this.visible = true;
                this.form = {
                    recordTitle: null,
                    category: null,
                    adcode: null,
                    depth: null,
                }
                $('#inputElement').replaceWith('<input id="inputElement" type="file" style="" accept=".xls">')
                const adcode = this.findObject(this.formOption.column, 'adcode')
                const depth = this.findObject(this.formOption.column, 'depth')
                adcode.display = false
                adcode.rules = []
                depth.display = false
                depth.rules = []
            },
            downloadTemplate(val) {
                if (val === '1') {
                    let url = '/mapdata/record/upload/template/marker'
                    window.location.href = `${window.SITE_CONFIG['apiURL']}${url}`
                } else if (val === '2') {
                    let url = '/mapdata/record/upload/template/statistics'
                    window.location.href = `${window.SITE_CONFIG['apiURL']}${url}`
                }
                this.downloadVisible = false;
            },
            viewMapData(val) {
                this.isFullScreen = false;
                this.dataTitle = val.recordTitle
                this.dataVisible = true;
                console.log(val)
                this.rowData = val
                this.mapVisible = false;
                this.$nextTick(() => {
                    this.mapVisible = true;
                })
            },
            handleSubmit() {
                this.$refs.mapForm.validate((valid, done) => {
                    if (valid) {
                        let inputElement = document.getElementById("inputElement")
                        let file = inputElement.files[0];
                        if(!file) {
                            this.$message.error('请选择上传文件!')
                            return
                        }
                        console.log(file)
                        if (!file.name.endsWith('xlsx') && !file.name.endsWith('xls')) {
                            this.$message.error('请上传excel文件!')
                            return
                        }
                        this.upload(file)
                        done()
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            },
             upload(file){
                console.log('upload:', this.form)
                this.submitStatus = true;

                let param = new FormData(); // 创建form对象
                param.append("file", file); // 通过append向form对象添加数据
                if (this.form.category != null) {
                    param.append("category", this.form.category);
                }
                if (this.form.recordTitle != null) {
                    param.append("recordTitle", this.form.recordTitle);
                }
                if (this.form.adcode != null) {
                    param.append("adcode", '[' + this.form.adcode + ']');
                }
                if (this.form.depth != null) {
                    param.append("depth", this.form.depth);
                }

                let config = {
                    headers: { "Content-Type": "multipart/form-data", "Authorization": "Bearer " + Cookies.get("access_token") },
                };

                let url = '/mapdata/record/upload'
                axios.post(`${window.SITE_CONFIG['apiURL']}${url}`, param, config).then(res => {
                    this.submitStatus = false;
                    if (res.data.code === 0) {
                        this.$message.success('上传成功')
                        this.visible = false
                        this.onLoad()
                    }else {
                        console.error(res.data.msg)
                        this.$message.error("请检查上传文件！失败原因: " + res.data.msg)
                    }
                })
            },
            changeCategory(val) {
              console.log(val)
                const adcode = this.findObject(this.formOption.column, 'adcode')
                const depth = this.findObject(this.formOption.column, 'depth')
                if (val === '2') {
                    adcode.display = true;
                    adcode.rules=[{
                        required: true,
                        message: "请选择行政区域",
                    }]
                    depth.display = true
                    depth.rules=[{
                        required: true,
                        message: "请选择显示层级",
                    }]
                }else {
                    adcode.display = false
                    adcode.rules = []
                    depth.display = false
                    depth.rules = []
                }
            },
            handleFullScreen() {
                if (!this.isFullScreen) {
                    this.isFullScreen = true
                }else {
                    this.isFullScreen = false
                }
            },
            handleDelete(id) {
                this.$confirm('此操作将永久删除, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    cancelButtonClass: "btn-custom-cancel",
                    type: 'warning'
                }).then(() => {
                    deleteData(id).then(res => {
                        if (res.data.code === 0) {
                            this.onLoad();
                            this.$message.success('删除成功')
                        }else {
                            this.$message.error(res.data.msg)
                        }
                    })
                }).catch(() => {})
            }
        }
    }
</script>

<style lang="scss" scoped>
    .dangerBtn {
        color: #FF3300;
    }

</style>
