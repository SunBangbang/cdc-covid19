import request from '@/utils/request';

export const lazyDeptTree = (params) => {
    return request({
        url: 'sys/dept/lazyTreeSelectList',
        method: 'get',
        params: {
            ...params
        }
    })
}

export const treeAllDept = (params) => {
    return request({
        url: 'sys/dept/treeAll',
        method: 'get',
        params: {
            ...params
        }
    })
}

export const lazyDeptTreeWithoutLogin = (params) => {
    return request({
        url: 'sys/dept/lazyTreeSelectListWithoutLogin',
        method: 'get',
        params: {
            ...params
        }
    })
}

/**
 * 获取机构树
 * @param params
 * @returns {{filter: boolean, lazy: boolean, addBtn: boolean, props: {children: string, label: string, id: string, value: string}, treeLoad: treeLoad}}
 */
export const lazyDeptTreeOption = (params) => {
    return {
        filter: true,
        props: {
            label: 'label',
            value: 'value',
            id: 'id',
            children: 'children'
        },
        addBtn: false,
        lazy: true,
        treeLoad: function (node, resolve) {
            let deptList = []
            if (node.level === 0) {
                lazyDeptTree({pid: params.deptId}).then((res) => {
                    deptList = res.data.data
                  if (params.deleteTopPid && deptList[0].children && deptList[0].children.length > 0) {
                    return resolve(deptList[0].children)
                  }else {
                    return resolve(deptList)
                  }
                }).then(() => {
                  if (params.defaultClick) {
                    document.querySelector('.el-tree-node__content').click()
                  }
                }).catch(() => {})
            }else if (node.level ===  1) {
                if(node.data.children !==null && node.data.children.length > 0){
                    resolve(node.data.children)
                }else{
                    let subDeptList = []
                    lazyDeptTree({pid: node.data.id}).then((res) => {
                        subDeptList = res.data.data[0]
                        return subDeptList.children ? resolve(subDeptList.children) : resolve([])
                    }).catch(() => {})
                }
            }else if (node.level >=  2) {
                let subDeptList = []
                lazyDeptTree({pid: node.data.id}).then((res) => {
                    subDeptList = res.data.data[0]
                    return subDeptList.children ? resolve(subDeptList.children) : resolve([])
                }).catch(() => {})
                // return resolve(node.data.children)
            }
        },
    }
}

export const deptTreeOption = (params) => {
    return {
        filter: true,
        props: {
            label: 'label',
            value: 'value',
            id: 'id',
            children: 'children'
        },
        clearable: true,
        addBtn: false,
        lazy: false,
        treeLoad: function (node, resolve) {
        },
    }
}

export const getUserFullDeptName = (username) => {
    return request({
        url: 'sys/dept/getUserFullDeptName/' + username,
        method: 'get'
    })
}
