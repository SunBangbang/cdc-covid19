import request from '@/utils/request';

export const getPageList = (page, limit, params) => {
    return request({
        url: 'scene/school/page',
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
        url: 'scene/school',
        method: 'post',
        data: data,
    })
}

export const remove = (id) => {
    return request({
        url: `scene/school/${id}`,
        method: 'delete',
    })
}

export const getSchoolSceneDicData = (params) => {
    return request({
        url: '/scene/school/getSchoolSceneDictData',
        method: 'get',
        params: {
            ...params
        }
    })
}



