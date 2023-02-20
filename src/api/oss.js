import request from '@/utils/request'
import Cookies from "js-cookie"

export function policy() {
    return request({
        url: 'sys/oss/policy',
        method: 'get',
    })
}

export function uploadFile(file, type) {
  let param = new FormData()
  param.append("file", file)
  param.append("type", type)
  const config = { headers: { "Content-Type": "multipart/form-data", "Authorization": Cookies.get('access_token') } }
  return request.post(window.SITE_CONFIG['uploadURL'], param, config)
}
