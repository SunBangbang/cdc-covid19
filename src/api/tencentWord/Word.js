import request from '@/utils/request'
import store from '@/store'


export const getLoginStatus = (userName) => {
  return request({
    url: '/tencentWord/getLoginStatus',
    method: 'get',
    params: {
      userName
    }
  })
}

export const getWordUrl = (progressQueryID, userName) => {
  return request({
    url: '/tencentWord/getProgress',
    method: 'get',
    params: {
      progressQueryID: progressQueryID,
      userName: userName
    }
  })
}

export const getFileMember = (fileID, userName) => {
  return request({
    url: '/tencentWord/getMember',
    method: 'get',
    params: {
      fileID: fileID,
      userName: userName
    }
  })
}

export const changeMember = (fileID, userList, userName) => {
  return request({
    url: '/tencentWord/changeMember',
    method: 'post',
    data: {
      fileID: fileID,
      userList: userList,
      userName: userName
    }
  })
}

export const isOwner = (fileID, userName) => {
  return request({
    url: '/tencentWord/isOwner',
    method: 'get',
    params: {
      fileID: fileID,
      userName: userName
    }
  })
}

export const getOpenId = (id) => {
  return request({
    url: '/tencentWord/getOpenId',
    method: 'get',
    params: {
      id
    }
  })
}
