import request from '@/utils/request'

export const genUserSig = (userID) => {
    return request({
        url: '/tencentIm/login',
        method: 'post',
        params: {
             userID
        }
    })
}

export const getUserRealName = (username) => {
    return request({
        url: `/sys/user/uinfo/${username}`,
        method: 'get',
    })
}
