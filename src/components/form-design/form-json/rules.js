export const Covid19Rules = {
  normal: [
    {
      field1: 'trackStartTime',
      label1: '开始时间',
      field2: 'trackEndTime',
      label2: '结束时间',
      type: 'date',
      expect: '<=',
      message: '不能大于',
      desc: '测试,开始时间<=结束时间'
    },
    {
      field1: 'contactCaseATFirstDate',
      label1: '关联病例-首次接触时间',
      field2: 'contactCaseATLastDate',
      label2: '关联病例-末次接触时间',
      type: 'date',
      expect: '<=',
      message: '不能大于',
      desc: '首次接触时间<=末次接触时间'
    },
    {
      field1: 'contactCaseATRangeDate',
      label1: '关联病例-首次接触时间段',
      field2: 'contactCaseATLastDate',
      label2: '关联病例-末次接触时间',
      type: 'daterange-1',
      expect: '<=',
      message: '不能大于',
      desc: '首次接触时间<=末次接触时间'
    },
    {
      field1: 'pdFirstContDate',
      label1: '判定表-首次接触时间',
      field2: 'pdLastContDate',
      label2: '判定表-末次接触时间',
      type: 'date',
      expect: '<=',
      message: '不能大于',
      desc: '首次接触时间<=末次接触时间'
    },
    {
      field1: 'ccFirstContDate',
      label1: '登记表-首次接触时间',
      field2: 'ccLastContDate',
      label2: '登记表-末次接触时间',
      type: 'date',
      expect: '<=',
      message: '不能大于',
      desc: '首次接触时间<=末次接触时间'
    },
    //发病日期<=就诊日期
    // {field1: 'onsetDatetime', field2: 'clinicalTime', type: 'date', expect: '<=',  message: '不能大于'},
    {
      field1: 'onsetDateOfFirstSymptomAT',
      label1: '期望发病日期',
      field2: 'clinicalTime',
      label2: '就诊日期',
      type: 'date',
      expect: '<=',
      message: '不能大于',
      desc: '期望发病日期<=就诊日期'
    },
    //发病日期<=就诊血常规检查日期
    {
      field1: 'onsetDateOfFirstSymptomAT',
      label1: '期望发病日期',
      field2: 'bloodRoutineInspectionDateClinic',
      label2: '就诊血常规检查日期',
      type: 'date',
      expect: '<=',
      message: '不能大于',
      desc: '期望发病日期<=就诊血常规检查日期'
    },
    //就诊日期<=就诊血常规检查日期
    {
      field1: 'clinicalTime',
      label1: '期望就诊日期',
      field2: 'bloodRoutineInspectionDateClinic',
      label2: '就诊血常规检查日期',
      type: 'date',
      expect: '<=',
      message: '不能大于',
      desc: '期望就诊日期<=就诊血常规检查日期'
    },
    //就诊日期<=入院血常规检查日期
    {
      field1: 'clinicalTime',
      label1: '期望就诊日期',
      field2: 'bloodDateAdmission',
      label2: '入院血常规检查日期',
      type: 'date',
      expect: '<=',
      message: '不能大于',
      desc: '期望就诊日期<=入院血常规检查日期'
    },
    // {field1: 'vacThirdInoculationDate', field2: 'bloodDateAdmission', type: 'date', expect: '<=',  message: '不能大于'},
  ],
  special: {
    //接种疫苗时间比较
    vacc: {
      numField: 'vacAgentTimes',
      dyField: 'vacTimes',
      dyLabel: '接种疫苗子表单模块',
      timeField: 'vacInoculationDate',
      timeLabel: '疫苗接种时间',
      type: 'date',
      desc: '接种疫苗时间比较'
    }
  }
}

