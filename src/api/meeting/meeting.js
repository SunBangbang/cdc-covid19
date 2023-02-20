import request from '@/utils/request'

/**
 * 获取会议分页列表
 * @param params
 */
export const getPageList = (params) => {
    return request({
        url: '/net-meeting/page',
        method: 'get',
        params: {
            ...params
        }
    })
}

export const getUserList = () => {
    return request({
        url: '/net-meeting/user/list',
        method: 'get'
    });
};

/**
 * 保存更新会议
 * @param data
 */
export const saveOrUpdate = (data) => {
    return request({
        url: '/net-meeting',
        method: 'post',
        data: data
    })
}

/**
 * 删除会议
 * @param id
 */
export const remove = (id) => {
    return request({
        url: '/net-meeting',
        method: 'delete',
        params: {
            id
        }
    })
}

/**
 * 读取会议
 * @param id
 */
export const getById = (id) => {
    return request({
        url: `/net-meeting/${id}`,
        method: 'get',
    })
}

/**
 * 结束会议
 * @param id
 */
export const terminate = (id) => {
    return request({
        url: `/net-meeting/terminate/${id}`,
        method: 'get'
    })
}

/**
 * 提前开始会议
 * @param id
 */
export const aheadStart = (id) => {
    return request({
        url: `/net-meeting/aheadStart/${id}`,
        method: 'get'
    })
}
