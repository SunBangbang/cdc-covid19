import Cookies from "js-cookie";

export const editorOptions = () =>{
  return {
    action:  window.SITE_CONFIG['uploadURL'] + "/single?type=task",
    props: {
      res: "data",
      url: "url"
    },
    headers: {Authorization: Cookies.get('access_token')},
    customConfig: {//wangEditor编辑的配置
      showFullScreen: false,
      menus: [
        'head',
        'bold',
        'fontSize',
        'fontName',
        'italic',
        'underline',
        'strikeThrough',
        'indent',
        'lineHeight',
        'foreColor',
        'backColor',
        'link',
        'list',
        'justify',
        'quote',
        'emoticon',
        'image',
        'video',
        'table',
        'splitLine',
        'undo',
        'redo',
      ],
      fontNames: [
        '黑体',
        '仿宋',
        '楷体',
        '标楷体',
        '华文仿宋',
        '华文楷体',
        '宋体',
        '微软雅黑',
        'Arial',
        'Tahoma',
        'Verdana',
        'Times New Roman',
      ],
    }
  }

}
