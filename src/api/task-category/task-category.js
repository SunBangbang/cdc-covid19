/**
 * @file task-category
 */
import request from '@/utils/request';

export const getTaskCategoryTreeList = () => {
    return request({
        url: '/setting/task/category/tree-list',
        method: 'get'
    });
};

export const save = (row) => {
    return request({
        url: '/setting/task/category/save',
        method: 'post',
        data: row
    });
};

export const update = (row) => {
    return request({
        url: '/setting/task/category/update',
        method: 'put',
        data: row
    });
};

export const remove = (id) => {
    return request({
        url: '/setting/task/category',
        method: 'delete',
        params: {
            id
        }
    });
};
