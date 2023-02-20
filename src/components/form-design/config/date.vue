<template>
  <div>
    <template v-if="data.type.indexOf('range') !== -1">
      <el-form-item label="开始占位内容">
        <el-input v-model="data.startPlaceholder"
                  :disabled="data.edit !== undefined && !data.edit"
                  placeholder="开始占位内容"></el-input>
      </el-form-item>
      <el-form-item label="结束占位内容">
        <el-input v-model="data.endPlaceholder"
                  :disabled="data.edit !== undefined && !data.edit"
                  placeholder="结束占位内容"></el-input>
      </el-form-item>
    </template>
    <el-form-item label="占位内容"
                  v-else>
      <el-input v-model="data.placeholder"
                :disabled="data.edit !== undefined && !data.edit"
                placeholder="占位内容"></el-input>
    </el-form-item>
    <el-form-item label="默认值">
      <el-input v-model="data.value"
                :disabled="data.edit !== undefined && !data.edit"
                placeholder="默认值"></el-input>
    </el-form-item>
    <el-form-item label="取消范围联动"
                  v-if="['daterange', 'datetimerange'].includes(data.type)">
      <el-tooltip class="item" effect="dark" content="点击左侧面板的上一个月(2018 年 12月)，右侧日期面板的 2月会变成 1 月。
像这样的行为称之联动" placement="right">
        <el-switch v-model="data.unlinkPanels"
                   :disabled="data.edit !== undefined && !data.edit"></el-switch>
      </el-tooltip>
    </el-form-item>
    <el-form-item label="轨迹时间">
      <el-switch v-model="data.trackTime"
                 :disabled="data.edit !== undefined && !data.edit"></el-switch>
    </el-form-item>
    <el-form-item label="折叠显示">
      <el-switch v-model="data.collapseTitle"
                 :disabled="data.edit !== undefined && !data.edit"></el-switch>
    </el-form-item>
    <config-rules :data="data"></config-rules>
    <el-form-item label="是否是核心表">
      <el-switch
        v-model="data.coreItem"
        :disabled="data.edit !== undefined && !data.edit"
      ></el-switch>
    </el-form-item>
  </div>
</template>

<script>
import configRules from "@/components/form-design/config/config-rules";
import placeholder from "@/components/form-design/mixins/placeholder-mixin";

export default {
  name: "config-date",
  props: ['data'],
  components:{
    configRules
  },
  mixins:[placeholder],
  data () {
    return {}
  }
}
</script>
