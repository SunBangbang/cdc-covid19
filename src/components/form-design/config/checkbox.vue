<template>
  <div>
    <el-form-item label="选项配置"><br>
      <draggable tag="ul"
                 :disabled="data.edit !== undefined && !data.edit"
                 :list="data.dicData"
                 :group="{ name: 'dic' }"
                 ghost-class="ghost"
                 handle=".drag-item">
        <li v-for="(item, index) in data.dicData"
            :key="index">
          <i class="drag-item el-icon-s-operation"
             style="font-size: 16px; margin: 0 5px; cursor: move;"></i>
          <el-input style="margin-right: 5px;"
                    :disabled="data.edit !== undefined && !data.edit"
                    size="mini"
                    v-model="item.label"
                    maxlength="40"
                    placeholder="label"></el-input>
          <el-button @click="handleRemoveFields(index)"
                     :disabled="data.edit !== undefined && !data.edit"
                     circle
                     plain
                     type="danger"
                     size="mini"
                     icon="el-icon-minus"
                     style="padding: 4px;margin-left: 5px;"></el-button>
          <el-button @click="handleJoinFields(index)"
                     :disabled="data.edit !== undefined && !data.edit"
                     title="关联"
                     circle
                     plain
                     type="warning"
                     size="mini"
                     icon="el-icon-connection"
                     style="padding: 4px;margin-left: 5px;"></el-button>
        </li>
      </draggable>
      <div style="margin-left: 22px;">
        <el-button type="text"
                   :disabled="data.edit !== undefined && !data.edit"
                   @click="handleAddFields">添加列
        </el-button>
      </div>
      <div style="margin-left: 20px" v-for="(item, index) in data.dicData">
        <div v-show="selectedIndex === index">
          <span>{{ item.label }}:</span>&nbsp&nbsp&nbsp
          <el-select v-model="item.joinSubjects" placeholder="请选择关联项" multiple
                     :disabled="data.edit !== undefined && !data.edit"
                     @change="handleJoinSubjects"
                     @focus="handleFocus"
                     @remove-tag="handleRemoveTag">
            <el-option
                v-for="item in joinOptions"
                :key="item.value"
                :label="item.label"
                :title="item.title"
                :value="item.value"
                :disabled="item.disabled">
            </el-option>
          </el-select>
        </div>
      </div>
    </el-form-item>
    <el-form-item label="可被勾选的的最大数量">
      <el-input-number v-model="data.max"
                       :disabled="data.edit !== undefined && !data.edit"
                       :min="1"
                       :max="data.dicData.length"
                       controls-position="right"
                       placeholder="最大数量"></el-input-number>
    </el-form-item>
    <el-form-item label="边框"
                  v-if="!data.button">
      <el-switch v-model="data.border"
                 :disabled="data.edit !== undefined && !data.edit"></el-switch>
    </el-form-item>
    <el-form-item label="按钮"
                  v-if="!data.border">
      <el-switch v-model="data.button"
                 :disabled="data.edit !== undefined && !data.edit"></el-switch>
    </el-form-item>
    <el-form-item label="折叠显示">
      <el-switch v-model="data.collapseTitle"
                 :disabled="data.edit !== undefined && !data.edit"></el-switch>
    </el-form-item>

    <el-form-item label="尺寸"
                  v-if="data.border || data.button">
      <el-radio-group v-model="data.size"
                      :disabled="data.edit !== undefined && !data.edit"
                      size="mini">
        <el-radio-button label="medium">正常</el-radio-button>
        <el-radio-button label="small">小</el-radio-button>
        <el-radio-button label="mini">超小</el-radio-button>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="激活时的文本颜色"
                  v-if="data.button">
      <el-color-picker v-model="data.textColor"
                       :disabled="data.edit !== undefined && !data.edit"></el-color-picker>
    </el-form-item>
    <el-form-item label="激活时的填充色和边框色"
                  v-if="data.button">
      <el-color-picker v-model="data.fill"
                       :disabled="data.edit !== undefined && !data.edit"></el-color-picker>
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
import Draggable from 'vuedraggable'
import dictModule from "../mixins/dict-module-mixin"
import configRules from "@/components/form-design/config/config-rules";

export default {
  name: "config-checkbox",
  props: ['data', 'columns'],
  components: {Draggable, configRules},
  mixins: [dictModule],
  data() {
    return {}
  },
  created() {
    this.setDefault()
  }
}
</script>
