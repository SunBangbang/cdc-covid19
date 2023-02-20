import request from '@/utils/request';

export const getContactList = (id) => {
    return request({
        url: '/contact/list',
        method: 'get',
        params: {
            id: id
        }
    });
};