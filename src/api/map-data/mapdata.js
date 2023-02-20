import request from '@/utils/request';

export const getPageList = (page, limit, params) => {
    return request({
        url: '/mapdata/record/page',
        method: 'get',
        params: {
            page: page,
            limit: limit,
            ...params
        }
    });
};

export const getMarker = () => {
    return request({
        url: '/mapdata/record/upload/template/marker',
        method: 'get',
    });
};

export const getStatistics = () => {
    return request({
        url: '/mapdata/record/upload/template/statistics',
        method: 'get',
    });
};

export const uploadFile = (form, file) => {
    return request({
        url: '/mapdata/record/upload',
        method: 'post',
        params: {
            category: form.category,
            file: file,
            recordTitle: form.recordTitle
        },
    });
};

export const deleteData = (id) => {
    return request({
        url: '/mapdata/record',
        method: 'delete',
        params: {
            id: id
        },
    });
};