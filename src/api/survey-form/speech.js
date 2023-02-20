import request from '@/utils/request';

/**
 * 获取语音文字
 * @param voicefile 语音文件地址
 */
export const getSpeechText = (voicefile, language) => {
  return request({
    url: `/speech/text/${language}?voicefile=${voicefile}`,
    method: 'get'
  });
}

