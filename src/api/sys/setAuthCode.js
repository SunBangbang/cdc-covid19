import request from "@/utils/request";

export const setAuthCode = (data) => {
  return request({
    url: "/sys/user/bindAuthcode",
    method: "post",
    data: data,
  });
};

export const adminBindAuthcode = (data) => {
  return request({
    url: "/sys/user/adminBindAuthcode",
    method: "post",
    data: data,
  });
};

export const unbindAuthcode = (data) => {
  return request({
    url: "/sys/user/unbindAuthcode",
    method: "post",
    data: data,
  });
};
