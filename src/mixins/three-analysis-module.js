import docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import JSZipUtils from 'jszip-utils'
import ImageModule from 'docxtemplater-image-module-free'
import {saveAs} from 'file-saver'
import {base64DataURLToArrayBuffer} from '@/utils/function'

/* eslint-disable */
export default {
    data () {
        return {
            //提交三间分析的变量
            analysisRecord:{
                oid: '',
                name: "",
                formId: '',
                filter: {},
                tasks: [],
                filterSampTotal: '',
                cond: [],
                cross: {},
                type: ""
            },
            questionReportItems: [],
            title: ''
         }
    },
    methods: {
      loadFilterData() {
        console.log('条件分析保存本地')
        this.questionReportItems = []
        let filterItems = document.querySelectorAll('.page-content--filter .filter-item')
        // console.log('filterItems:', filterItems.length, '  ', filterItems[0])

        let now = new Date().getTime()
        filterItems.forEach(item=>{
            let title =  item.querySelector('.header .title')
            // console.log('title:', title.innerHTML)
            let map = item.querySelector('.filter-map-cls')
            let imageURL = ''
            if(map){
                //地图, 不能导出热力地图
                // let arr = item.querySelectorAll('.filter-map-cls canvas')
                // if(arr && arr.length > 0) {
                //     imageURL = arr[arr.length-1].toDataURL('image/png')
                // }
                // console.log('map:', title.innerHTML, '  ', imageURL)
            }else{
                let canvas = item.querySelector('.filter-charts-container canvas')
                if(canvas) {
                    imageURL = canvas.toDataURL('image/png')
                }
            }
            // console.log('image:', imageURL)
            this.questionReportItems.push({label: title.innerHTML, imageBase64: imageURL })
          })
        },
        loadCrossData() {
            console.log('交叉分析保存本地')
            this.questionReportItems = []
            let filterItems = document.querySelectorAll('.page-content--filter .filter-item')
            // console.log('filterItems:', filterItems.length, '  ', filterItems[0])

            let now = new Date().getTime()
            filterItems.forEach(item=>{
                let title =  item.querySelector('.page-content_table__title')
                // console.log('title:', title.innerHTML)
                let map = item.querySelector('.filter-map-cls')
                let imageURL = ''
                if(map){
                    //地图, 不能导出热力地图
                    // let arr = item.querySelectorAll('.filter-map-cls canvas')
                    // if(arr && arr.length > 0) {
                    //     imageURL = arr[arr.length-1].toDataURL('image/png')
                    // }
                    // console.log('map:', title.innerHTML, '  ', imageURL)
                }else{
                    let canvas = item.querySelector('.table-charts canvas')
                    if(canvas) {
                        imageURL = canvas.toDataURL('image/png')
                    }
                }
                // console.log('image:', imageURL)
                this.questionReportItems.push({label: title.innerHTML, imageBase64: imageURL })
            })
        },
        saveToDoc() {
            let docxSrc = `${process.env.BASE_URL}template/analysis.docx`  //模板文件的位置
            // console.log('base_url template src:', docxSrc, ' publicPath:', this.publicPath)
            let docxName = this.analysisRecord.name + '.docx' //导出文件的名字
            this.title = this.analysisRecord.name

            // 读取并获得模板文件的二进制内容
            let that = this
            JSZipUtils.getBinaryContent(docxSrc, function(error, content) {
                // docxSrc是模板。我们在导出的时候，会根据此模板来导出对应的数据
                // 抛出异常
                if (error) {
                    throw error
                }

                const imageOpts = {
                    centered: false,
                    getImage(tag) {
                        return base64DataURLToArrayBuffer(tag)
                    },
                    getSize(img, tagValue, tagName) {
                        return [950, 300]
                    }
                }
                // 创建一个PizZip实例，内容为模板的内容
                let zip = new PizZip(content)
                const imageModule = new ImageModule(imageOpts)
                const doc = new docxtemplater().loadZip(zip).attachModule(imageModule).compile()

                // 设置模板变量的值
                doc.setData({
                    title: that.title,
                    questionReportItems: that.questionReportItems
                })

                try {
                    // 用模板变量的值替换所有模板变量
                    doc.render()
                } catch (error) {
                    // 抛出异常
                    let e = {
                        message: error.message,
                        name: error.name,
                        stack: error.stack,
                        properties: error.properties
                    }
                    console.log(JSON.stringify({
                        error: e
                    }))
                    throw error
                }

                // 生成一个代表docxtemplater对象的zip文件（不是一个真实的文件，而是在内存中的表示）
                let out = doc.getZip().generate({
                    type: 'blob',
                    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                })
                // 将目标文件对象保存为目标类型的文件，并命名
                saveAs(out, docxName)
            })
        },
        /**
         * 本地保存word。先加载数据，后生成word。
         * @param type
         */
        handleSave(type) {
            if('filter' === type){
                this.loadFilterData()
            }else if('cross'=== type){
                this.loadCrossData()
            }
            this.saveToDoc()
        }
    }
}
