/**
 * @file user
 */
import request from "@/utils/request";

export const getUserById = (id) => {
  return request({
    url: "/sys/user/" + id,
    method: "get",
  });
};

export function getUserList() {
  return window.SITE_CONFIG["userList"];
}

export const getUserPageList = (page, limit, params) => {
  return request({
    url: "sys/user/page",
    method: "get",
    params: {
      page: page,
      limit: limit,
      ...params,
    },
  });
};

export const pageForTaskInvestigator = (page, limit, params) => {
  return request({
    url: "sys/user/pageForTaskInvestigator",
    method: "get",
    params: {
      page: page,
      limit: limit,
      ...params,
    },
  });
};

export const getUserDetailList = (params) => {
  return request({
    url: "/sys/user/list",
    method: "get",
    params: {
      ...params,
    },
  });
};

export const update = (row) => {
  return request({
    url: "/sys/user/update",
    method: "put",
    data: row,
  });
};

export const getDeptTreeList = () => {
  return request({
    url: "/sys/dept/tree/named",
    method: "get",
  });
};

//获取登录用户的部门树信息
export const getDeptTreeListByUser = () => {
  return request({
    url: "/sys/dept/list",
    method: "get",
  });
};

export const getLoginUserInfo = () => {
  return request({
    url: "sys/user/info",
    method: "get",
  });
};

export const getDeptUserTreeList = () => {
  return request({
    url: "/sys/dept/user/tree",
    method: "get",
  });
};

export const resetOpenId = (id) => {
  return request({
    url: "/sys/user/reset/openId",
    method: "post",
    params: {
      id,
    },
  });
};

export const getIdNoIsExist = (idNo) => {
  return request({
    url: "/sys/user/idNoIsExist",
    method: "get",
    params: {
      idNo: idNo,
    },
  });
};

export const updatePassword = (data) => {
  return request({
    url: "/sys/user/password",
    method: "put",
    data: data,
  });
};
