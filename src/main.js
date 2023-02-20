import Vue from 'vue'
import Element from 'element-ui'
import VCharts from 'v-charts'
import App from '@/App'
import i18n from '@/i18n'
import router from '@/router'
import store from '@/store'
import '@/icons'
import 'jquery'
import axios from 'axios'
// import '@/element-ui/theme/index.css'
import 'element-ui/lib/theme-chalk/index.css'
import '@/assets/scss/aui.scss'
import http from '@/utils/request'
import renRadioGroup from '@/components/radio-group'
import renSelect from '@/components/select'
import renProcessMultiple from '@/components/process-multiple'
import renProcessStart from '@/components/process-start'
import renProcessRunning from '@/components/process-running'
import renProcessDetail from '@/components/process-detail'
import renDeptTree from '@/components/dept-tree'
import renRegionTree from '@/components/region-tree'
import { hasPermission, getDictLabel } from '@/utils'
import cloneDeep from 'lodash/cloneDeep'
import contactDrawer from '@/components/contact-drawer'

import Avue from '@smallwei/avue';
import '@smallwei/avue/lib/index.css';
// import AvueUeditor from 'avue-plugin-ueditor'
import '@/assets/scss/reset.scss'
//IM
import { MessageBox, Row, Col, Button, Input, Loading, Dialog, Dropdown, DropdownMenu, DropdownItem } from 'element-ui'
import Avatar from './components/avatar.vue'
import Index from './tencentIM/index.vue'
import tim from 'tim'
import TIM from 'tim-js-sdk'
import './assets/icon/iconfont.css'
import './assets/icon/tim.css'
import './assets/icon/iconv.css'
import './utils/flexible'

import trtcCalling from './trtc-calling'
import TRTCCalling from 'trtc-calling-js'

import print from '@/utils/print'
import '@/utils/continuousCilck'

// 交付客户时，解除以下代码的注释以清除开发时产生的所有控制台打印。--start
// const log = () => {
//   return function () {}
// }
// console.log = log()
// console.info = log()
// console.error = log()
// 交付客户时，解除以上代码的注释以清除开发时产生的所有控制台打印。--end

window.axios = axios
window.tim = tim
window.TIM = TIM
window.TRTCCalling = TRTCCalling
window.trtcCalling = trtcCalling
window.store = store
Vue.prototype.$bus = new Vue() // event Bus 用于无关系组件间的通信。
Vue.prototype.tim = tim
Vue.prototype.TIM = TIM
Vue.prototype.trtcCalling = trtcCalling
Vue.prototype.TRTCCalling = TRTCCalling
Vue.prototype.$store = store
Vue.prototype.$confirm = MessageBox.confirm
Vue.use(Button)
Vue.use(Row)
Vue.use(Col)
Vue.use(Input)
Vue.use(Loading)
Vue.use(Dialog)
Vue.use(Dropdown)
Vue.use(DropdownMenu)
Vue.use(DropdownItem)
Vue.use(VCharts)
Vue.component('avatar', Avatar)

Vue.use(Avue, {
    // ali: {
    //     region: 'oss-cn-hangzhou',
    //     endpoint: 'oss-cn-hangzhou.aliyuncs.com',
    //     accessKeyId: 'LTAI4FqMgQpnKF4VhCBfkFfB',
    //     accessKeySecret: 'hKR9R6Hq4x8MMYqETUNWNyUw1qfmHN',
    //     bucket: 'fcmall',
    // }
})

import AvueFormDesign from "@/components/form-design"
Vue.use(AvueFormDesign)
// Vue.use(AvueUeditor)
Vue.config.productionTip = false

Vue.use(Element, {
    size: 'default',
    i18n: (key, value) => i18n.t(key, value)
})

Vue.use(renRadioGroup)
Vue.use(renSelect)
Vue.use(renDeptTree)
Vue.use(renRegionTree)
Vue.use(renProcessMultiple)
Vue.use(renProcessStart)
Vue.use(renProcessRunning)
Vue.use(renProcessDetail)
Vue.use(contactDrawer)
Vue.use(print)
// 挂载全局
Vue.prototype.$http = http
Vue.prototype.$hasPermission = hasPermission
Vue.prototype.$getDictLabel = getDictLabel

// 保存整站vuex本地储存初始状态
window.SITE_CONFIG['storeState'] = cloneDeep(store.state)

new Vue({
    i18n,
    router,
    store,
    render: h => h(App)
}).$mount('#app')
