/**
 * @file questionnaire-category
 */
import request from '@/utils/request';

export const getQuestionnaireCategoryTreeList = () => {
    return request({
        url: '/setting/questionnaire/category/listAll',
        method: 'get'
    });
};

export const getCategoryDictData = () => {
    return request({
        url: '/setting/questionnaire/category/getCategoryDictData',
        method: 'get'
    });
};

export const getCategoryDictDataByName = (name) => {
    return request({
        url: '/setting/questionnaire/category/getCategoryDictDataByName',
        method: 'get',
        params: {
            name:name
        }
    });
};


export const save = (row) => {
    return request({
        url: '/setting/questionnaire/category',
        method: 'post',
        data: row
    });
};

export const update = (row) => {
    return request({
        url: '/setting/questionnaire/category',
        method: 'put',
        data: row
    });
};

export const remove = (id) => {
    return request({
        url: '/setting/questionnaire/category',
        method: 'delete',
        params: {
            id
        }
    });
};
