import request from '@/utils/request';

export const getPageList = (page, limit, params) => {
    return request({
        url: 'sys/dist/page',
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
        url: 'sys/dist',
        method: 'post',
        data: data,
    })
}

export const remove = (id) => {
    return request({
        url: `sys/dist/${id}`,
        method: 'delete',
    })
}



