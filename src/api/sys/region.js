import request from '@/utils/request';

export const getProvince = (params) => {
  return request({
    url: '/sys/region/list',
    method: 'get',
    params: {
      ...params
    }
  })
}

export const getTreeList = (params) => {
  return request({
    url: '/sys/region/treeList',
    method: 'get',
    params: {
      ...params
    }
  })
}

export function getCity(pid) {
  return request({
    url: '/sys/region/list',
    method: 'get',
    params: {
      pid: pid
    }
  })
}
