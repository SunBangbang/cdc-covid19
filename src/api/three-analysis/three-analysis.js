import request from '@/utils/request'
import {saveAs} from '@/utils/function'

export const save = (data) => {
    return request({
        url: '/api/three/analysis',
        method: 'post',
        data: data
    })
}

export const update = (data) => {
    return request({
        url: '/api/three/analysis',
        method: 'put',
        data: data
    })
}

export const del = (id) => {
    return request({
        url: '/api/three/analysis',
        method: 'delete',
        params: {
            id: id
        }
    })
}

/**
 * 分析功能
 * @param data
 */
export const run = (data) => {
    return request({
        url: '/api/three/analysis/run',
        method: 'post',
        data: data
    })
}

/**
 * 分布获取三间分析列表
 * @param {*当前页} page
 * @param {*每页的最大记录数} limit
 */
export const getList = (page, limit, params) => {
    return request({
        url: '/api/three/analysis/page',
        method: 'get',
        params: {
            page,
            limit,
            ...params
        }
    })
}

/**
 * 新增分析记录时，调查表列表
 * @param {*当前页} page
 * @param {*每页的最大记录数} limit
 */
export const getSurveyFormList = (page, limit) => {
    return request({
        url: '/survey/form/pageUsedByTask',
        method: 'get',
        params: {
            page,
            limit
        }
    })
}

/**
 * 查询分析记录详情
 * @param {*分析记录id} id
 */
export const detail = (id) => {
    return request({
        url: '/api/three/analysis',
        method: 'get',
        params: {
            id
        }
    });
}

/**
 * 获取条件筛选的条件列表, 不包含子表单中的问题
 */
export const getFilterList = (id) => {
    return request({
        url: 'survey/form/getNonDynaQuestions',
        method: 'get',
        params: {
            id
        }
    })
}

/**
 * 通过场景类型，开始时间，结束时间查询样本
 * @param page
 * @param limit
 * @param params
 */
export const pageForTask = (page, limit, params) => {
    return request({
        url: '/api/three/analysis/pageSample',
        method: 'post',
        data: {page: page, limit: limit, ...params}
    })
}

/**
 * 通过场景类型，开始时间，结束时间，条件筛选，查询样本
 * @param page
 * @param limit
 * @param postBody
 */
export const pageSampleForCondQuery = (page, limit, postBody, params) => {
    return request({
        url: '/api/three/analysis/pageSampleForCondQuery',
        method: 'post',
        params: {
            page: page,
            limit: limit,
            ...params
        },
        data: {
            ...postBody
        }
    })
}

/**
 * 通过场景类型，开始时间，结束时间，条件筛选，查询样本数量
 * @param postBody
 */
export const countSampleForCondQuery = (postBody) => {
    return request({
        url: '/api/three/analysis/countSampleForCondQuery',
        method: 'post',
        params: {},
        data: {
            ...postBody
        }
    })
}

/**
 * 根据调查表获取任务列表
 * @param {*当前页} page
 * @param {*每页的最大记录数} limit
 * @param {*参数} params
 */
export const getRelativeTaskListBySurveyForm = (page, limit, formId, params) => {
    if(!params.includes){
        params.includes = 'name,relDeptId,surveyForms,status,start,end,updateBy,updateAt'
    }
    return request({
        url: '/survey/form/pageRelatedTask',
        method: 'get',
        params: {
            page,
            limit,
            formId: formId,
            ...params
        }
    })
}

/**
 * 数据分析后下载excel样本数据
 * @param postBody
 */
export const downloadSampleDataAfterAnalysis = (postBody) => {
    request({
        url: '/api/three/analysis/downloadSampleDataAfterAnalysis',
        method: 'post',
        params: {},
        data: {
            ...postBody
        },
        responseType: 'blob'
    }).then(res => {
        let blob = new Blob([res.data])
        saveAs(blob, postBody.name + ".xlsx")
    })
}

/**
 * 数据分析后下载word分析结果
 * @param postBody
 */
export const downloadAnalysisReport = (postBody) => {
    request({
        url: '/api/three/analysis/downloadAnalysisReport',
        method: 'post',
        params: {},
        data: {
            ...postBody
        },
        responseType: 'blob'
    }).then(res => {
        let blob = new Blob([res.data])
        saveAs(blob, postBody.name + ".doc")
    })
}

/**
 * 时间分布
 * @param data
 */
export const timeDistributionSearch = (data) => {
    return request({
        url: '/api/three/analysis/timeDistribute',
        method: 'post',
        data: data
    })
}

/**
 * 人群分布
 * @param data
 */
export const populationDistributeSearch = (data) => {
    return request({
        url: '/api/three/analysis/populationDistribute',
        method: 'post',
        data: data
    })
}

/**
 * 空间分布
 * @param data
 */
export const spaceDistributeSearch = (data) => {
    return request({
        url: '/api/three/analysis/spaceDistribute',
        method: 'post',
        data: data
    })
}
