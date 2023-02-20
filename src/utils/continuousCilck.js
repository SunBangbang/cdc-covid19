/**
 * @author Anya Parry
 * @param Number
 * 用于防止连续点击事件。
 * 使用方法， 在需要控制的dom上添加  v-points
 * 默认不绑定值的话，每五秒可以点击一次。
 * 在main.js中引用（无需vue.use()）后，可以直接在任何节点上使用v-points=’Number‘
 * 可以自定义时长,单位ms
 */
import vue from 'vue'

const pointDoms = []
vue.directive('points', {
  inserted(el, binding) {
    pointDoms.push(el)
    el.addEventListener('click', () => {
      pointDoms.forEach(pointDomItem => {
        pointDomItem.style.pointerEvents = 'none'
      })
      setTimeout(() => {
        pointDoms.forEach(pointDomItem => {
          pointDomItem.style.pointerEvents = 'auto'
        })
      }, binding.value || 5000)
    })
  }
})
