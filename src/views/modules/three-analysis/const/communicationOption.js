import AppConstant from "@/utils/AppConstant"
import {getDictDataList} from '@/utils'
import tableTitleOptions from "@/utils/tableTitleOptions";

export const option = () => {
  const header = tableTitleOptions({

  })
  return {
    ...header,
    column: [
      {
        label: '姓名',
        prop: 'participant'
      },
      {
        label: '证件号',
        prop: 'identity'
      },
      {
        label: '性别',
        prop: 'gender',
        dicData: getDictDataList('gender'),
        props: {
          label: 'dictLabel',
          value: 'dictValue'
        }
      },
      /* {
           label: '密接数量',
           prop: 'closeNum'
       }*/
    ],
  }
}
