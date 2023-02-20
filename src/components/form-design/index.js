import Config from './config'
import FormDesign from './index.vue'
import FormItem from './FormItem'

export default {
  install (Vue) {
    Vue.use(Config)
    Vue.use(FormItem)
    Vue.component('Avue' + FormDesign.name, FormDesign);
  }
}
