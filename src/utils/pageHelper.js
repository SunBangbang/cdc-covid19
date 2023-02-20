export default class PageHelper {
  static pageHelpers (currentPage, pageSize, array) {
    if (array.length === 0) {
      return returnData(0, [], "数组长度为0" )
    }else if (!([] instanceof Array)){
      return returnData(0, [], "传入Array数据对象错误" )
    }else {
      const offset = (currentPage - 1) * pageSize;
      return {
        total: array.length,
        data:(offset + pageSize >= array.length) ? array.slice(offset, array.length) : array.slice(offset, offset + pageSize)
      }
    }
  }
}
export const returnData = (total, data, msg) => {
  return {
    total: total,
    data: data,
    msg: msg
  }
}
