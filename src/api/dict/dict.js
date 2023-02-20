/**
 * @file dict
 */
import request from '@/utils/request'

// export const getDictData = () => {
//     return request({
//         url: '/sys/dict/type/all',
//         method: 'get',
//     });
// };

/**
 * 获取字典数据列表
 * @param dictType  字典类型
 */
export function getDictData(dictType) {
    let type = {}
    if (window.SITE_CONFIG['dictList']) {
        type = window.SITE_CONFIG['dictList'].find((element) => (element.dictType === dictType))
    }else {
        console.log('dictList is null, load dictList from localStorage')
        let data = localStorage.getItem("dictList")
        if(data){
            let dictList = JSON.parse(data)
            type = dictList.find((element) => (element.dictType === dictType))
        }
    }
    if (type) {
        return type.dataList
    } else {
        return []
    }
}

export function getBizDictType(params){
    return request({
        url: '/biz/dict/type/page',
        method: 'get',
        params: {...params}
    })
}
