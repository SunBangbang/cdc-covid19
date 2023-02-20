/**
 * Created by sunny on 2020/3/16.
 */

/**
 * 业务类型
 */
export default class AppConstant {

  /**
   * 站内通知-状态：草稿
   * message_status
   * @type {string}
   */
  static MESSAGE_STATUS_DRAFT  = '1'

  /**
   * 站内通知-状态：已发送
   * message_status
   * @type {string}
   */
  static MESSAGE_STATUS_SEND  = '2'

  /**
   * 站内通知-类型：普通
   * message_type
   * @type {string}
   */
  static MESSAGE_TYPE_ORDINARY = '1'

  /**
   * 站内通知-类型：重要
   * message_type
   * @type {string}
   */
  static MESSAGE_TYPE_IMPORTAT = '2'

  /**
   * 站内通知-类型：紧急
   * message_type
   * @type {string}
   */
  static MESSAGE_TYPE_EMERGENCY = '3'

  /**
   * 站内通知-已读类型：未读
   * message_is_read
   * @type {string}
   */
  static MESSAGE_IS_READ_NO = '1'

  /**
   * 站内通知-已读类型：已读
   * message_is_read
   * @type {string}
   */
  static MESSAGE_IS_READ_YES = '2'

  /**
   * 站内通知-已读类型：待办
   * message_is_read
   * @type {string}
   */
  static MESSAGE_IS_READ_TODO = '3'

  /**
   * 站内通知-已读类型：已完成
   * message_is_read
   * @type {string}
   */
  static MESSAGE_IS_READ_COMPLETE = '4'

  /**
   * 调查表-状态：有效
   * @type {number}
   */
  static SURVEY_SAMPLE_STATUS_EFFECTIVE = 1
  /**
   * 调查表-状态：无效
   * @type {number}
   */
  static SURVEY_SAMPLE_STATUS_INVALID = 0
  /**
   * 调查表-提交状态：草稿
   * @type {number}
   */
  static SURVEY_SAMPLE_SUBMIT_STATUS_DRAFT = 0
  /**
   * 调查表-提交状态：已提交
   * @type {number}
   */
  static SURVEY_SAMPLE_SUBMIT_STATUS_SUBMITTED = 1

  static MENU_WIDTH = 110

  static MENU_BIG_WIDTH = 140

  static MENU_LARGE_WIDTH = 160

  static MENU_LARGEST_WIDTH = 240


  /**
   * 已发布
   */
  static DIST_STATUS_PUBLISHED = 0

  /**
   * 未发布
   * @type {number}
   */
  static DIST_STATUS_UNPUBLISHED = 1

  /**
   * 已下架
   * @type {number}
   */
  static DIST_STATUS_REMOVED = 2

  /**
   * 会议进行中
   * @type {number}
   */
  static MEETING_STATUS_WORKING = 1

  /**
   * 会议已完成
   * @type {number}
   */
  static MEETING_STATUS_COMPLETED = 2

  /**
   * 表单类别：自建
   * @type {number}
   */
  static FORM_CATEGORY_SELF  = 0

  /**
   * 表单类别：引用
   * @type {number}
   */
  static FORM_CATEGORY_OTHER  = 1

  /**
   * 语音识别语种
   * @type [{label:String, value:Number}]
   */
  static LANGUAGE = [
    {label: "普通话", value: 1},
    {label: "粤语", value: 2},
    {label: "四川话", value: 3},
    {label: "英语", value: 4},
    {label: "上海话", value: 5}
  ]

  static MESSAGE = Object.freeze({
    //websocket 消息类型： 纯文本消息
    TEXT: 0,
    //消息类型： 站内通知
    ONSITE_NOTICE: 1,
    //消息类型： 网络会议
    NET_MEETING: 2,
    //消息类型： 我的任务
    MY_TASK: 3,
    //消息类型： 我的任务
    ASSIST_TASK: 4
  })

  //表单模块操作类型
  static FormModuleOperType = Object.freeze({
    HIDE: 0,
    READONLY: 1,
    EDIT: 2
  })

  /**
   * 审核合并样本状态
   * @type {number}
   */
  static AUDIT_MERGE_STATUS = 1

  /**
   * 默认用户头像
   * @type {string}
   */
  static DEFAULT_HEAD_IMG = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

  /**
   * 样本状态：草稿名称
   * @type {string}
   */
  static DRAFT_NAME = '草稿'

  /**
   * 样本状态：合并名称
   * @type {string}
   */
  static MERGE_NAME = '已合并'

  /**
   * 样本类型：协查名称
   * @type {string}
   */
  static ASSIST_NAME = '已协查'

  /**
   * 样本：待审核
   * @type {string}
   */
  static AUDIT_NAME = '审核通过'

  /**
   * 升级包已发布
   */
  static UPGRADE_STATUS_PUBLISHED = 1

  /**
   * 升级包未发布
   * @type {number}
   */
  static UPGRADE_STATUS_UNPUBLISHED = 0

  /**
   * 系统超级管理员
   */
  static USER_IS_SUPER_ADMIN = 1

  /**
   * 非超级管理员
   * @type {number}
   */
  static USER_NOT_SUPER_ADMIN = 0

  /***
   * 大一情网对接参数
   */
  //证件类型
  static CODE_TABLE_IDCARD_TYPE = "3"
  //职业
  static CODE_TABLE_CROWD = "2"
  //病例分类
  static CODE_TABLE_CASE_TYPE = "13"

}





