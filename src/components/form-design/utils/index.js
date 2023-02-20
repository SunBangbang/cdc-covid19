//从columns中找到column的可关联组件
export const findRelFromColumns = (column, columns) => {
    if (column && columns.length > 0) {
        let result = findRelDirect(column, columns);
        if (result.length > 0) {
            return result;
        }
        result = findRelFormGroup(column, columns);
        if (result.length > 0) {
            return result;
        }
        result = findRelFormDynamic(column, columns);
        if (result.length > 0) {
            return result;
        }
    }
    return [];
}

function findRelDirect(column, columns) {
    for (let c of columns) {
        if (column.prop == c.prop) {
            return columns.filter(item => {
                return item.prop !== column.prop;
            });
        }
    }
    return [];
}

function findRelFormGroup(column, columns) {
    let groups = columns.filter(v => {//排除非group
        return v.type === 'group';
    });
    for (let group of groups) {
        let result = findRelDirect(column, group.children.column);
        if (result.length > 0) return result;
    }
    return [];
}

function findRelFormDynamic(column, columns) {
    let dynamics = columns.filter(v => {//排除非dynamic
        return v.type === 'dynamic';
    });
    for (let dynamic of dynamics) {
        let result = findRelDirect(column, dynamic.children.column);
        if (result.length > 0) return result;
    }
    return [];
}

export const findRelHidFormDynamic = (column, columns) => {
    let dynamics = columns.filter(v => {//排除非表单类型的dynamic
        return v.type === 'dynamic'
    })
    let newDynamics = []
    for(let dynamic of dynamics) {
        let boolean = true
        for (let c of dynamic.children.column) {
            if (column.prop === c.prop) {
                boolean = false
                break
            }
        }
        if (boolean) {
            newDynamics.push(dynamic)
        }
    }
    return newDynamics
}

//从columns中找到所有组件
export const getAll = (columns) => {
    let result = [];
    columns.forEach(item => {
        result.push(item);
        if (item.children && item.children.column) {
            result=result.concat(item.children.column);
        }
    })
    return result;
}

//重新设置prop并保留关联配置
export const resetPropAndRel = (columns) => {
    //前置条件: 保证克隆的columns中的prop必须唯一, 为避免属性重复，先加载全部，然后逐一替换
    let map = new Map()
    loadPropMap(columns, map, Date.now(), 1)
    renameProp(columns, map)
}

function loadPropMap(columns, map, date, index) {
    if (columns && columns.length > 0) {
        columns.forEach(column => {
            if(column.prop) {
                map.set(column.prop, date + "_" + index++)
            }
            if (['group', 'dynamic'].includes(column.type)) {
                loadPropMap(column.children.column, map, date, index++);
            }
        })
    }
}

function renameProp(columns, map){
    if (columns && columns.length > 0) {
        columns.forEach(column => {
            if(column.prop) {
                column.prop = map.get(column.prop)
            }
            if (['group', 'dynamic'].includes(column.type)) {
                renameProp(column.children.column, map);
            } else if (specialRelTypes.includes(column.type)) {//更新关联
                column.dicData.forEach(dic => {
                    if(dic.joinSubjects){
                        let newJoinSubjects = [];
                        dic.joinSubjects.forEach(joinSubject =>{
                            if(joinSubject){
                                newJoinSubjects.push(map.get(joinSubject))
                            }
                        })
                        dic.joinSubjects=newJoinSubjects;
                    }
                })
            }
        })
    }
}

export const stringify = (json) => {
    let count = 0;
    let list = [];
    let str = JSON.stringify(json, function (key, val) {
        if (typeof val === 'function') {
            list.push(val + '');
            const result = '$code{' + count + '}$code'
            count = count + 1;
            return result
        }
        return val;
    }, 2);
    let startCode = '$code{';
    let endCode = '}$code';
    list.forEach((ele, index) => {
        str = str.replace(startCode + index + endCode, startCode + ele + endCode)
    })
    for (let i = 0; i < count; i++) {
        str = str.replace('"' + startCode, '').replace(endCode + '"', '')
    }
    return str
}

const chnNumChar = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];

const chnUnitSection = ["", "万", "亿", "万亿", "亿亿"];

const chnUnitChar = ["", "十", "百", "千"];

const SectionToChinese = (section) => {
    let strIns = '', chnStr = '';
    let unitPos = 0;
    let zero = true;
    while (section > 0) {
        let v = section % 10;
        if (v === 0) {
            if (!zero) {
                zero = true;
                chnStr = chnNumChar[v] + chnStr;
            }
        } else {
            zero = false;
            if (unitPos === 1 && v === 1) {
              strIns = ''
            } else {
              strIns = chnNumChar[v];
            }
            strIns += chnUnitChar[unitPos];
            chnStr = strIns + chnStr;
        }
        unitPos++;
        section = Math.floor(section / 10);
    }
    return chnStr;
}

export const numberToChinese = (num) => {
    let unitPos = 0;
    let strIns = '', chnStr = '';
    let needZero = false;

    if (num === 0) {
        return chnNumChar[0];
    }

    while (num > 0) {
        let section = num % 10000;
        if (needZero) {
            chnStr = chnNumChar[0] + chnStr;
        }
        strIns = SectionToChinese(section);
        strIns += (section !== 0) ? chnUnitSection[unitPos] : chnUnitSection[0];
        chnStr = strIns + chnStr;
        needZero = (section < 1000) && (section > 0);
        num = Math.floor(num / 10000);
        unitPos++;
    }

    return chnStr;
}


export const defaultTitleInputJson = [
    {
        "type": "bigtitle",
        "title": "主标题",
        "labelWidth": "40",
        "component": "h1",
        "span": 24,
        "styles": {
            "color": "red",
            "textAlign": "center"
        },
        "params": {
            "html": "主标题"
        },
        "prop": "1595948705348_70405"
    },
    {
        "type": "description",
        "title": "描述信息",
        "labelWidth": "40",
        "component": "p",
        "span": 24,
        "styles": {
            "color": "red",
            "textAlign": "center"
        },
        "params": {
            "html": "描述信息"
        },
        "prop": "1595948709312_80982"
    }
]

//不固定高度的组件
export const specialSpanTypes = ['bigtitle', 'description', 'textarea', 'title', 'radio', 'checkbox', 'upload','autoFill'];

export const specialRelTypes = ['radio', 'select', 'checkbox'];

export const TitleColumns = ['bigtitle', 'description', 'title'];

// 单\要写成\\, 无需添加//g，只保留正则表达式字符串
export const defaultRegOptions = [
    {
        label: '手机号码',
        value: '^1[0-9]{10}$'
    },
    {
        label: '联系电话',
        value: '^(\\d{3}-\\d{8}|\\d{4}-\\d{7}|\\d{3}\\d{8}|\\d{4}\\d{7}|1[0-9]{10})$'
    },
    {
        label: '身份证号',
        value: '^([1-9]\\d{5}(18|19|20)\\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx])$',
    },
    {
        label: '证件号',
        value: '^[A-Za-z0-9][A-Za-z0-9]*$'
    },
    {
        label: '电子邮箱',
        value: '^([a-zA-Z0-9._-])+@([a-zA-Z0-9_-])+((.[a-zA-Z0-9_-]{2,3}){1,2})$'
    },
    {
        label: '数字',
        value: '^([1-9][0-9]*)+(.[0-9]{1,2})?$'
    },
    {
        label: '英文字符',
        value: '^[A-Za-z][A-Za-z]*$'
    }
]

/**
 * 获取年龄
 * @param idCard 身份证号
 * @returns {string} 年龄
 */
export const getAgeFromIdCard = (idCard) => {
    if(idCard && (idCard.length === 15 || idCard.length === 18)){
        let myDate = new Date()
        let month = myDate.getMonth() + 1
        let day = myDate.getDate()
        let age = myDate.getFullYear() - idCard.substring(6, 10) - 1
        if (idCard.substring(10, 12) < month || idCard.substring(10, 12) == month && idCard.substring(12, 14) <= day) {
            age++
        }
        return age
    }
    return null
}

/**
 * 获取性别
 * @param idCard 身份证号
 * @returns {string} 性别
 */
export const getSexFromIdCard = (idCard) => {
    let sex = null
    if(idCard && (idCard.length === 15 || idCard.length === 18)){
        if (parseInt(idCard.slice(-2, -1) % 2) == 1) {
            sex = "男"
        } else {
            sex = "女"
        }
    }
    return sex;
}

/**
 * 获取出生年月
 * @param idCard 身份证号
 * @returns {null} 出生年月
 */
export const getBirthdayFromIdCard = (idCard) => {
    let birthday = null
    if(idCard && (idCard.length === 15 || idCard.length === 18)){
        if(idCard.length == 15){
            birthday = "19"+idCard.substr(6,6)
        } else if(idCard.length == 18){
            birthday = idCard.substr(6,8)
        }
        birthday = birthday.replace(/(.{4})(.{2})/,"$1-$2-")
    }
    return birthday
}
