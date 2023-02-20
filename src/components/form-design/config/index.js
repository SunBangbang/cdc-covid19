import Input from './input.vue'
import Textarea from './textarea.vue'
import Number from './number.vue'
import Dynamic from './dynamic.vue'
import Radio from './radio.vue'
import Checkbox from './checkbox.vue'
import Select from './select.vue'
import Cascader from './cascader.vue'
import Date from './date.vue'
import Upload from './upload.vue'
import Map from './map.vue'
import Group from './group.vue'
import regionSelect from "./regionSelect.vue";
import autoFill from "./autoFill";
import ASRConfig from "./ASRConfig"
import measureTemperatureConfig from "./measureTemperatureConfig"
import Table from "./table"

const components = [
  Input,
  Textarea,
  Number,
  Dynamic,
  Radio,
  Checkbox,
  Select,
  Cascader,
  Date,
  Upload,
  Map,
  Group,
  regionSelect,
  autoFill,
  ASRConfig,
  measureTemperatureConfig,
  Table
]

const Config = {
  install (Vue) {
    if (this.installed) return
    this.installed = true

    components.map(component => {
      Vue.component(component.name, component);
    })
  }
}

export default Config
