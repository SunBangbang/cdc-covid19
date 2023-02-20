<template>
  <div class="count-box">
    <el-row :span="24">
      <el-col :span="option.span ? option.span: 8" v-for="(item, index) in option.data" :key="index">
        <div class="item" :style="{background: item.bgColor ? item.bgColor : '#fff'}">
          <div class="item-header">
            <p class="item.title" :style="{color: item.titleColor ? item.titleColor : '#333'}">{{item.title}}</p>
          </div>
          <div class="item-body">
            <div class="count" :style="{color: item.color ? item.color : rgb(27, 201, 142)}">{{item.count}}</div>
            <div class="info" v-if="item.recentCount && item.recentCount !== 0">
              <span class="info-text">{{item.text}}</span>
              <span class="recent-count">{{item.recentCount > 0 ? '+' : '-'}}{{item.recentCount}}</span>
              <i :class="item.icon" :style="{color: item.iconColor ? item.iconColor : '#33CA00'}" v-if="item.icon"></i>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
export default {
  name: 'countBox',
  props: ['option']
}
</script>
<style lang="scss" scoped>
  .count-box {
    .item {
      position: relative;
      margin: 8px;
      padding: 12px;
      border-radius: 4px;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
      overflow: hidden;
      color: #333333;
      .item-header > p {
        margin: 0 0 8px;
        font-weight: bold;
      }
      .item-body {
        display: flex;
        justify-content: space-between;
        flex-direction: row;
        align-items: baseline;
        .count {
          font-weight: bold;
          font-size: 32px;
        }
      }
    }
  }
</style>