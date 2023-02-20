import request from '@/utils/request'

/**
 * 获取trtc配置信息
 */
export const getConfig = () => {
    return request({
        url: '/tencent/trtc/configure',
        method: 'get'
    })
}

/**
 * 退出房间，解散会议
 * @param params
 */
export const exitRoom = (params) => {
    return request({
        url: '/tencent/trtc/exit/room',
        method: 'get',
        params: {...params}
    })
}
