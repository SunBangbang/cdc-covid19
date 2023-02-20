import request from '@/utils/request';

export const getPageList = (page, limit, params) => {
    return request({
        url: 'scene/school/class/page',
        method: 'get',
        params: {
            page: page,
            limit: limit,
            ...params
        }
    })
}

export const saveOrUpdate = (data) => {
    return request({
        url: 'scene/school/class',
        method: 'post',
        data: data,
    })
}

export const remove = (id) => {
    return request({
        url: `scene/school/class/${id}`,
        method: 'delete',
    })
}