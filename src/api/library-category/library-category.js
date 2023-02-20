/**
 * @file library-category
 */
import request from '@/utils/request';

export const getLibCategoryTreeList = (parentId, params) => {
    return request({
        url: '/setting/library/category/tree-list',
        method: 'get',
        params: {
            parentId,
            ...params
        }
    });
};
export const getLibCategoryTreeNodes = () => {
    return request({
        url: '/setting/library/category/tree-node',
        method: 'get',
        params: {
        }
    });
};
export const remove = (id) => {
    return request({
        url: '/setting/library/category',
        method: 'delete',
        params: {
            id
        }
    });
};

export const add = (row) => {
    return request({
        url: '/setting/library/category',
        method: 'post',
        data: row
    });
};

export const update = (row) => {
    return request({
        url: '/setting/library/category',
        method: 'put',
        data: row
    });
};
