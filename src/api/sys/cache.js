import {getProvince} from '@/api/sys/region'

export const loadProvince = () => {
  // 获取省份列表
  getProvince().then((res) => {
    const data = res.data.data
    sessionStorage.setItem('province', JSON.stringify(data))
  }).catch(() => {
  })
}

// 获取字典列表, 添加并全局变量保存
function loadDict() {
  this.$http.get('/sys/dict/type/all').then(({ data: res }) => {
    if (res.code !== 0) {
      return;
    }
    window.SITE_CONFIG['dictList'] = res.data;
  }).catch(() => {})

  this.$http.get('/biz/dict/type/all').then(({ data: res }) => {
    if (res.code !== 0) {
      return;
    }
    window.SITE_CONFIG['bizDictList'] = res.data;
  }).catch(() => {})
}

export const loadCache = ()=>{
  Promise.all([loadDict, loadProvince]).then(() => {
    console.log('complete')
  })
}
