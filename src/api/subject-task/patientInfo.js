import request from '@/utils/request'
import {isEmpty} from "@antv/util"

export const respondentInfoPage = (page, limit, deptId, params) => {
    return request({
        url: '/respondentInfo/page',
        method: 'get',
        params: {
            page: page,
            limit: limit,
            deptId: deptId,
            ...params
        }
    })
}

/**
 * 根据证件号检查能否添加或更新， true->可以使用， false->不可使用
 * @param id
 * @param deptId
 * @param identity
 * @returns {boolean}
 */
export const canAddOrUpdate = async (id, deptId, identity)=>{
 // console.log('user:', id, deptId, identity)
  let res = await getByIdentity(deptId, identity)
  if(res.data.code === 0){
    let list = res.data.data.list
    if(isEmpty(id)){
      //是否可以新建
      return isEmpty(list)
    }else{
      //是否可以更新
      let some = list.filter(d=>d.id !== id)
      return isEmpty(some)
    }
  }else{
    console.error('err:', res.data.msg)
    throw new Error('接口调用失败')
  }
}

/**
 * 根据证件号，部门ID获取调查对象记录
 * @param deptId
 * @param identity
 * @returns {Promise<void>}
 */
export const getByIdentity = async (deptId, identity)=>{
  return await respondentInfoPage(1, 10, deptId, {"identityList": identity})
}

/**
 * 保存单个调查对象
 * @param data
 */
export const saveRespondentInfo = (data) => {
  return request({
    url: '/respondentInfo',
    method: 'post',
    data: data
  })
}

/**
 * 更新单个调查对象
 * @param data
 */
export const updateRespondentInfo = (data) => {
  return request({
    url: '/respondentInfo',
    method: 'put',
    data: data
  })
}

/**
 * 批量保存调查对象
 * @param data
 */
export const saveRespondentInfoList = (data) => {
    return request({
        url: '/respondentInfo/batchSave',
        method: 'post',
        data: data
    })
}

/**
 * 保存单个调查对象信息
 * @data 请求body
 */
export const saveOneRespondentInfo = (data) => {
  return request({
    url: '/respondentInfo',
    method: 'post',
    data: data
  })
}

/**
 * 更新单个调查对象信息
 * @data 请求body
 */
export const updateOneRespondentInfo = (data) => {
  return request({
    url: '/respondentInfo',
    method: 'put',
    data: data
  })
}

export const updateRespondentInfoList = (data) => {
  return request({
    url: '/respondentInfo/batchUpdate',
    method: 'post',
    data: data
  })
}

/**
 * 分页查询任务调查对象列表
 * @param page
 * @param limit
 * @param params
 */
export const pagePatientForTask = (page, limit, params) => {
  return request({
    url: '/respondentInfo/pageForTask',
    method: 'get',
    params: {
      page: page,
      limit: limit,
      ...params
    }
  })
}

/**
 * 删除调查对象
 * @param data
 */
export const deleteRespondent = (id) => {
  return request({
    url: '/respondentInfo',
    method: 'delete',
    params:{
      id: id
    }
  })
}

export const syncCdcInf = (params) => {
  return request({
    url: '/respondentInfo/syncCdcInf',
    method: 'get',
    params: {
      ...params
    }
  })
}
