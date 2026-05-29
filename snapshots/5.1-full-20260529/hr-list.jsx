// ui_kits/erp-console/hr-list.jsx
// 人力中心：员工 / 组织 / 岗位 / 考勤 / 排班 / 薪酬 / 档案 / 人事办公
const { useState: useHrState, useEffect: useHrEffect } = React;

const HR_CONFIG = {
  hrEmployee: {
    title:'员工管理', treeTitle:'员工分组', groups:['全部员工','在职员工','待入职','试用期','离职员工'],
    newLabel:'新增员工', codeLabel:'员工编号', subjectLabel:'员工姓名', partyLabel:'所属部门', amountLabel:'岗位', dateLabel:'入职日期', statusLabel:'员工状态',
    statuses:['在职','试用期','待入职','离职'], formFields:['员工姓名','手机号码','所属部门','岗位','直属上级','员工类型','入职日期','转正日期','合同类型','办公地点','证件类型','证件号码','紧急联系人'],
    detailTitle:'任职信息', row:{ subject:'张园', code:'EMP-202605-001', party:'销售部', amount:'销售经理', done:'13800000001', left:'老夏', date:'2026-05-10', status:'在职' },
    detailRows:[['销售部','销售经理','老夏','正式员工','2026-05-10','2026-08-10','深圳办公室'],['项目组A','项目协同','李文涛','兼职角色','2026-05-12','长期','远程']],
  },
  hrOrg: {
    title:'组织机构', treeTitle:'组织树', groups:['集团总部','研发中心','采购中心','销售中心','仓储中心','财务中心'],
    newLabel:'新增组织', codeLabel:'组织编号', subjectLabel:'组织名称', partyLabel:'上级组织', amountLabel:'负责人', dateLabel:'创建日期', statusLabel:'组织状态',
    statuses:['启用','停用','筹建'], formFields:['组织名称','组织类型','上级组织','负责人','联系电话','办公地址','编制人数','成本中心','排序号'],
    detailTitle:'下级组织', row:{ subject:'销售中心', code:'ORG-202605-001', party:'集团总部', amount:'老夏', done:'86', left:'72', date:'2026-05-01', status:'启用' },
    detailRows:[['销售一部','部门','张园','32','28','深圳','启用'],['销售二部','部门','陈思源','28','22','广州','启用']],
  },
  hrPosition: {
    title:'岗位管理', treeTitle:'岗位序列', groups:['全部岗位','管理序列','销售序列','技术序列','职能序列'],
    newLabel:'新增岗位', codeLabel:'岗位编号', subjectLabel:'岗位名称', partyLabel:'所属组织', amountLabel:'岗位等级', dateLabel:'生效日期', statusLabel:'岗位状态',
    statuses:['启用','待审批','冻结','停用'], formFields:['岗位名称','岗位序列','所属组织','岗位等级','岗位编制','直接上级','任职资格','薪级范围','生效日期'],
    detailTitle:'岗位职责', row:{ subject:'销售经理', code:'POS-202605-001', party:'销售中心', amount:'P6', done:'12', left:'9', date:'2026-05-01', status:'启用' },
    detailRows:[['客户开发','负责区域客户开发与商机跟进','高','月度考核','启用','销售中心','P6'],['订单转化','推动报价、合同、订单闭环','高','季度考核','启用','销售中心','P6']],
  },
  hrAttendance: {
    title:'考勤管理', treeTitle:'考勤范围', groups:['全部考勤','正常考勤','异常考勤','待审批','已归档'],
    newLabel:'新增考勤', codeLabel:'考勤单号', subjectLabel:'考勤主题', partyLabel:'考勤人员', amountLabel:'考勤结果', dateLabel:'考勤日期', statusLabel:'处理状态',
    statuses:['正常','异常','待审批','已处理','已归档'], formFields:['考勤人员','所属部门','考勤日期','班次','上班打卡','下班打卡','异常类型','处理方式','审批流程'],
    detailTitle:'考勤明细', row:{ subject:'5月17日考勤异常', code:'ATT-202605-001', party:'张园', amount:'迟到', done:'09:35', left:'18:02', date:'2026-05-17', status:'待审批' },
    detailRows:[['张园','销售部','早班','09:35','18:02','迟到','待审批'],['李文涛','研发部','标准班','09:00','18:03','正常','已处理']],
  },
  hrSchedule: {
    title:'排班管理', treeTitle:'排班分类', groups:['全部排班','班次管理','考勤组管理','考勤日历','排班统计'],
    newLabel:'新增排班', codeLabel:'排班编号', subjectLabel:'排班主题', partyLabel:'考勤组', amountLabel:'班次', dateLabel:'排班日期', statusLabel:'排班状态',
    statuses:['已发布','草稿','待审批','停用'], formFields:['排班主题','考勤组','适用人员','班次','排班周期','生效日期','失效日期','休息规则','审批流程'],
    detailTitle:'排班明细', row:{ subject:'销售中心六月排班', code:'SCH-202605-001', party:'销售考勤组', amount:'标准班', done:'36人', left:'工作日', date:'2026-06-01', status:'已发布' },
    detailRows:[['标准班','09:00-18:00','销售考勤组','36人','周一至周五','午休1小时','已发布'],['值班班','10:00-19:00','客服考勤组','8人','轮休','午休1小时','草稿']],
  },
  hrPayroll: {
    title:'薪酬管理', treeTitle:'薪酬分类', groups:['工资列表','薪资方案','薪酬类型','薪酬项目','工资详情'],
    newLabel:'新增薪酬', codeLabel:'工资单号', subjectLabel:'工资主题', partyLabel:'薪资方案', amountLabel:'应发工资', dateLabel:'薪资月份', statusLabel:'核算状态',
    statuses:['待核算','核算中','待发放','已发放'], formFields:['薪资月份','薪资方案','薪酬类型','适用人员','计薪周期','社保方案','个税规则','发放账户','复核人'],
    detailTitle:'工资明细', row:{ subject:'2026年5月工资', code:'PAY-202605-001', party:'销售薪资方案', amount:'386,500.00', done:'28,600.00', left:'357,900.00', date:'2026-05', status:'核算中' },
    detailRows:[['张园','销售部','基本工资','12000.00','绩效3000.00','社保/公积金1200.00','个税800.00','扣款0.00','13000.00'],['李文涛','研发部','基本工资','16000.00','绩效4500.00','社保/公积金1600.00','个税1400.00','扣款200.00','17300.00']],
  },
  hrArchive: {
    title:'档案管理', treeTitle:'档案分类', groups:['全部档案','劳动合同','证件资料','培训档案','奖惩记录'],
    newLabel:'新增档案', codeLabel:'档案编号', subjectLabel:'档案名称', partyLabel:'员工姓名', amountLabel:'档案类型', dateLabel:'归档日期', statusLabel:'档案状态',
    statuses:['有效','即将到期','已过期','已归档'], formFields:['档案名称','员工姓名','档案类型','证件编号','签署日期','到期日期','保管位置','提醒规则','经办人'],
    detailTitle:'档案明细', row:{ subject:'张园劳动合同', code:'ARC-202605-001', party:'张园', amount:'劳动合同', done:'2026-05-10', left:'2029-05-09', date:'2026-05-10', status:'有效' },
    detailRows:[['劳动合同','张园','2026-05-10','2029-05-09','人事档案柜A01','提前30天提醒','有效'],['身份证复印件','张园','2026-05-10','长期','电子档案','不提醒','已归档']],
  },
  hrOffice: {
    title:'人事办公', treeTitle:'办公事项', groups:['全部申请','证明开具','物品领用','用印申请','其他申请'],
    newLabel:'新增办公申请', codeLabel:'申请单号', subjectLabel:'申请主题', partyLabel:'申请人', amountLabel:'事项类型', dateLabel:'申请日期', statusLabel:'审批状态',
    statuses:['草稿','审批中','已通过','驳回'], formFields:['申请主题','申请人','所属部门','事项类型','用途说明','期望完成日期','附件要求','审批流程','经办人'],
    detailTitle:'申请明细', row:{ subject:'在职证明开具', code:'HRO-202605-001', party:'张园', amount:'证明开具', done:'销售部', left:'王人事', date:'2026-05-17', status:'审批中' },
    detailRows:[['在职证明','签证办理','张园','销售部','2026-05-20','王人事','审批中'],['工牌补办','工牌遗失','李文涛','研发部','2026-05-18','王人事','已通过']],
  },
};

function HrTone({ status }) {
  if (['在职','启用','正常','已处理','已发布','已发放','已入职','已转正','已归档','有效','已通过','已同步'].includes(status)) return <Badge tone="g">{status}</Badge>;
  if (['离职','停用','异常','驳回','已过期'].includes(status)) return <Badge tone="r">{status}</Badge>;
  return <Badge tone="y">{status}</Badge>;
}

const HR_LIST_COLUMNS = {
  '员工管理':['员工姓名','员工编号','所属部门','岗位/职级','手机号码','直属上级','入职日期'],
  '组织机构':['组织名称','组织编号','上级组织','负责人','编制人数','在岗人数','创建日期'],
  '岗位管理':['岗位名称','岗位编号','所属组织','岗位等级','岗位编制','在岗人数','生效日期'],
  '考勤管理':['考勤主题','考勤单号','考勤人员','异常类型','上班打卡','下班打卡','考勤日期'],
  '排班管理':['排班主题','排班编号','考勤组','班次','适用人数','休息规则','排班日期'],
  '薪酬管理':['工资主题','工资单号','薪资方案','应发工资','扣款合计','实发工资','薪资月份'],
  '档案管理':['档案名称','档案编号','员工姓名','档案类型','签署日期','到期日期','归档日期'],
  '人事办公':['申请主题','申请单号','申请人','事项类型','所属部门','经办人','申请日期'],
};

const HR_DETAIL_COLUMNS = {
  '员工管理':['组织/部门','岗位/角色','直属上级','任职类型','开始日期','结束日期','办公地点'],
  '组织机构':['下级组织','组织类型','负责人','编制人数','在岗人数','办公地点','状态'],
  '岗位管理':['职责项','职责说明','重要度','考核周期','状态','所属组织','职级'],
  '考勤管理':['员工姓名','所属部门','班次','上班打卡','下班打卡','考勤结果','处理状态'],
  '排班管理':['班次名称','工作时间','考勤组','适用人数','排班规则','休息规则','状态'],
  '薪酬管理':['员工姓名','所属部门','工资项','基本工资','绩效/补贴','社保公积金','个税','扣款','实发工资'],
  '档案管理':['档案类型','员工姓名','签署日期','到期日期','保管位置','提醒规则','状态'],
  '人事办公':['事项类型','用途说明','申请人','所属部门','期望完成日期','经办人','审批状态'],
};

const HR_DETAIL_TABS = {
  '员工管理':[
    {k:'info', label:'基础信息'}, {k:'life', label:'员工生命周期'}, {k:'job', label:'任职历史'}, {k:'contract', label:'合同证照'}, {k:'approve', label:'审批记录'}, {k:'op', label:'操作记录'},
  ],
  '组织机构':[
    {k:'info', label:'组织信息'}, {k:'headcount', label:'编制与在岗'}, {k:'job', label:'在岗人员'}, {k:'record', label:'组织变更'}, {k:'approve', label:'审批记录'}, {k:'op', label:'操作记录'},
  ],
  '岗位管理':[
    {k:'info', label:'岗位信息'}, {k:'headcount', label:'编制占用'}, {k:'job', label:'任职人员'}, {k:'approve', label:'审批记录'}, {k:'op', label:'操作记录'},
  ],
  '考勤管理':[
    {k:'info', label:'考勤信息'}, {k:'attendance', label:'假勤汇总'}, {k:'record', label:'打卡记录'}, {k:'approve', label:'审批记录'}, {k:'attach', label:'附件记录'}, {k:'op', label:'操作记录'},
  ],
  '排班管理':[
    {k:'info', label:'排班信息'}, {k:'attendance', label:'班次日历'}, {k:'record', label:'排班明细'}, {k:'approve', label:'审批记录'}, {k:'op', label:'操作记录'},
  ],
  '薪酬管理':[
    {k:'info', label:'薪酬信息'}, {k:'payroll', label:'薪资核算明细'}, {k:'finance', label:'发薪对接财务'}, {k:'approve', label:'审批记录'}, {k:'attach', label:'附件记录'}, {k:'op', label:'操作记录'},
  ],
  '档案管理':[
    {k:'info', label:'档案信息'}, {k:'contract', label:'合同证照'}, {k:'life', label:'续签/到期'}, {k:'attach', label:'附件记录'}, {k:'op', label:'操作记录'},
  ],
  '人事办公':[
    {k:'info', label:'申请信息'}, {k:'approve', label:'审批记录'}, {k:'record', label:'办理记录'}, {k:'attach', label:'附件记录'}, {k:'op', label:'操作记录'},
  ],
};

const HR_MODULE_INSIGHTS = {
  '员工管理':[
    {label:'组织/岗位校验', value:'2项待确认', tone:'y'},
    {label:'入转调离流程', value:'6项待办', tone:'b'},
    {label:'手机号/证件重复', value:'0项', tone:'g'},
  ],
  '组织机构':[
    {label:'编制缺口', value:'12人', tone:'y'},
    {label:'超编组织', value:'1个', tone:'r'},
    {label:'负责人缺失', value:'0个', tone:'g'},
  ],
  '岗位管理':[
    {label:'岗位说明书缺失', value:'3份', tone:'y'},
    {label:'岗位编制占用', value:'84%', tone:'b'},
    {label:'薪级范围异常', value:'0项', tone:'g'},
  ],
  '考勤管理':[
    {label:'缺卡/迟到异常', value:'18条', tone:'y'},
    {label:'待审批假勤', value:'9条', tone:'b'},
    {label:'已同步薪酬', value:'本月未锁定', tone:'y'},
  ],
  '排班管理':[
    {label:'待发布排班', value:'2组', tone:'y'},
    {label:'考勤组覆盖', value:'96%', tone:'b'},
    {label:'冲突班次', value:'0条', tone:'g'},
  ],
  '薪酬管理':[
    {label:'薪资待核算', value:'3批', tone:'y'},
    {label:'考勤未确认', value:'18条', tone:'r'},
    {label:'财务同步', value:'1批待生成', tone:'b'},
  ],
  '档案管理':[
    {label:'合同到期提醒', value:'5份', tone:'y'},
    {label:'缺失附件', value:'2份', tone:'r'},
    {label:'归档完整率', value:'98%', tone:'g'},
  ],
  '人事办公':[
    {label:'待审批申请', value:'12件', tone:'y'},
    {label:'临期办理', value:'3件', tone:'r'},
    {label:'证明开具完成率', value:'92%', tone:'g'},
  ],
};

function HrListColumns(config) {
  return HR_LIST_COLUMNS[config.title] || [config.subjectLabel, config.codeLabel, config.partyLabel, config.amountLabel, '联系/人数', '负责人/复核人', config.dateLabel];
}

function HrDetailColumns(config) {
  return HR_DETAIL_COLUMNS[config.title] || ['名称/对象','归属/说明','类型','开始值','结束值','负责人','状态'];
}

function HrActionProfile(config, action) {
  if (config.title === '员工管理' && /入职|离职|异动|生命周期/.test(action)) {
    return {
      statusLabel:'流程状态',
      statuses:['待入职','已入职','待转正','离职交接'],
      columns:['员工姓名','员工编号','生命周期阶段','所属部门','岗位','计划日期','责任人','关键事项'],
      rows:[
        ['陈佳','EMP-202605-021','入职办理','销售部','销售专员','2026-05-20','王人事','合同签署/账号开通','待入职'],
        ['张园','EMP-202605-001','试用转正','销售部','销售经理','2026-08-10','老夏','转正评估/薪级调整','待转正'],
        ['李文涛','EMP-202401-018','岗位异动','研发部','项目协同','2026-05-25','王人事','任职变更/交接确认','已入职'],
      ],
      newLabel:'新增生命周期事项',
    };
  }
  if (config.title === '组织机构' && /组织架构|部门编制|编制/.test(action)) {
    return {
      statusLabel:'编制状态',
      statuses:['充足','满编','超编','筹建'],
      columns:['组织名称','组织编号','上级组织','负责人','核定编制','在岗人数','空缺人数','成本中心'],
      rows:[
        ['销售一部','ORG-202605-011','销售中心','张园','32','28','4','CC-SALE-01','充足'],
        ['研发平台组','ORG-202605-012','研发中心','李文涛','18','19','-1','CC-RD-02','超编'],
        ['华东办事处','ORG-202605-013','销售中心','陈思源','8','0','8','CC-SALE-03','筹建'],
      ],
      newLabel:'新增编制调整',
    };
  }
  if (config.title === '岗位管理' && /说明书|岗位编制|编制/.test(action)) {
    return {
      statusLabel:'岗位状态',
      statuses:['启用','待审批','冻结','停用'],
      columns:['岗位名称','岗位编号','岗位序列','岗位等级','核定编制','在岗人数','薪级范围','任职资格'],
      rows:[
        ['销售经理','POS-202605-001','销售序列','P6','12','9','12K-22K','3年以上大客户经验','启用'],
        ['高级前端工程师','POS-202605-018','技术序列','P7','6','5','18K-32K','React/工程化经验','启用'],
        ['财务共享专员','POS-202605-028','职能序列','P4','3','0','8K-12K','应收应付核算经验','待审批'],
      ],
      newLabel:'新增岗位说明书',
    };
  }
  if (config.title === '考勤管理' && /记录|统计|考勤/.test(action)) {
    return {
      statusLabel:'处理状态',
      statuses:['正常','异常','待审批','已处理'],
      columns:['员工姓名','所属部门','出勤天数','迟到/早退','请假小时','加班小时','缺卡次数','异常说明'],
      rows:[
        ['张园','销售部','16','1','0','6','0','5月17日迟到','待审批'],
        ['李文涛','研发部','17','0','8','12','0','年假1天','已处理'],
        ['陈佳','销售部','15','0','0','0','2','入职资料待补','异常'],
      ],
      newLabel:'生成假勤汇总',
    };
  }
  if (config.title === '排班管理' && /班次|考勤组|日历|排班/.test(action)) {
    return {
      statusLabel:'发布状态',
      statuses:['草稿','待审批','已发布','停用'],
      columns:['考勤组','班次名称','工作时间','适用人数','休息规则','生效日期','失效日期','排班周期'],
      rows:[
        ['销售考勤组','标准班','09:00-18:00','36','周末双休','2026-06-01','2026-06-30','按月','已发布'],
        ['客服考勤组','值班班','10:00-19:00','8','轮休','2026-06-01','2026-06-30','按周','草稿'],
        ['仓储考勤组','早晚班','08:00-16:00 / 16:00-24:00','24','轮班','2026-06-01','2026-06-30','按周','待审批'],
      ],
      newLabel:'新增班次排班',
    };
  }
  if (config.title === '薪酬管理' && /工资|薪资|薪酬|发放/.test(action)) {
    return {
      statusLabel:'发薪状态',
      statuses:['待核算','核算中','待发放','已同步'],
      columns:['工资单号','薪资月份','薪资方案','应发工资','扣款合计','实发工资','付款单号','财务状态'],
      rows:[
        ['PAY-202605-001','2026-05','销售薪资方案','386,500.00','28,600.00','357,900.00','FPAY-202605-001','待发放','待发放'],
        ['PAY-202605-002','2026-05','研发薪资方案','512,800.00','42,300.00','470,500.00','FPAY-202605-002','已生成应付','已同步'],
        ['PAY-202605-003','2026-05','职能薪资方案','186,200.00','15,900.00','170,300.00','待生成','核算校验中','核算中'],
      ],
      newLabel:'生成发薪付款单',
    };
  }
  if (config.title === '档案管理' && /合同|证件|档案/.test(action)) {
    return {
      statusLabel:'档案状态',
      statuses:['有效','即将到期','已过期','已归档'],
      columns:['员工姓名','档案类型','证照编号','签署/签发日期','到期日期','保管位置','提醒规则','经办人'],
      rows:[
        ['张园','劳动合同','HT-202605-001','2026-05-10','2029-05-09','人事档案柜A01','提前30天','王人事','有效'],
        ['李文涛','职业资格证','CERT-202403-018','2024-03-01','2026-06-30','电子档案','提前60天','王人事','即将到期'],
        ['陈佳','身份证复印件','ID-202605-021','2026-05-20','长期','电子档案','不提醒','王人事','已归档'],
      ],
      newLabel:'新增合同证照',
    };
  }
  if (config.title === '人事办公' && /证明|物品|办公|申请/.test(action)) {
    return {
      statusLabel:'办理状态',
      statuses:['草稿','审批中','待办理','已通过','驳回'],
      columns:['申请主题','申请单号','申请人','所属部门','事项类型','期望完成日期','经办人','用途说明'],
      rows:[
        ['在职证明开具','HRO-202605-001','张园','销售部','证明开具','2026-05-20','王人事','签证办理','审批中'],
        ['工牌补办','HRO-202605-002','李文涛','研发部','物品领用','2026-05-18','王人事','工牌遗失补办','已通过'],
        ['员工收入证明','HRO-202605-003','陈佳','销售部','证明开具','2026-05-22','王人事','银行贷款材料','待办理'],
      ],
      newLabel:'新增办公申请',
    };
  }
  return null;
}

function HrIsNewAction(action) {
  return action === 'new' || /^(新增|新建|添加)/.test(action || '');
}

function HrIsListAction(config, action) {
  if (!action) return false;
  const listActions = [
    `${config.title}列表`,
    `${config.newLabel.replace(/^新增/, '')}列表`,
    '员工列表',
    '组织列表',
    '岗位列表',
    '考勤列表',
    '排班列表',
    '工资列表',
    '档案列表',
    '办公申请列表',
  ];
  return action.includes('列表') || listActions.includes(action);
}

function HrStatusForGroup(config, group, idx) {
  const exact = config.statuses.find(status => group.includes(status));
  if (exact) return exact;
  if (group.includes('在职')) return '在职';
  if (group.includes('待入职')) return '待入职';
  if (group.includes('试用')) return '试用期';
  if (group.includes('离职')) return '离职';
  if (group.includes('正常')) return '正常';
  if (group.includes('异常')) return '异常';
  if (group.includes('待审批')) return '待审批';
  if (group.includes('归档')) return '已归档';
  return config.statuses[idx % config.statuses.length] || config.statuses[0];
}

function HrRows(config) {
  const base = config.row;
  return config.groups.map((group, idx) => {
    if (idx === 0) return { ...base, group };
    return {
      ...base,
      code: base.code.replace('001', String(idx + 1).padStart(3, '0')),
      subject: group + '示例',
      status: HrStatusForGroup(config, group, idx),
      group,
    };
  });
}

function HrGroupCount(config, group) {
  if (group === config.groups[0]) return HrRows(config).length;
  return HrRows(config).filter(row => row.group === group).length;
}

function HrTree({ config, picked, setPicked }) {
  return (
    <div className="aw-doc-tree">
      <div className="aw-doc-tree-h">{config.treeTitle} <span className="aw-doc-tree-n">({HrRows(config).length})</span></div>
      <div className="aw-doc-tree-list">
        {config.groups.map((group, idx) => (
          <div key={group} className={'aw-tree-row aw-tree-l2' + (picked === group ? ' on' : '')} onClick={() => setPicked(group)}>
            <span className="aw-tree-caret">{idx === 0 ? '▾' : ''}</span>
            <TileIcon name={idx === 0 ? 'folder' : 'doc'} size={14} />
            <span style={{flex:1}}>{group}</span>
            <span className="aw-doc-tree-n">({HrGroupCount(config, group)})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HrInsightStrip({ config, picked, rows }) {
  const insights = HR_MODULE_INSIGHTS[config.title] || [];
  return (
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:10,marginBottom:10}}>
      <div style={{border:'1px solid var(--aw-border)',background:'#fff',borderRadius:8,padding:'10px 12px'}}>
        <div style={{fontSize:12,color:'var(--aw-fg-3)'}}>当前口径</div>
        <div style={{fontSize:14,fontWeight:600,marginTop:4}}>{picked || config.groups[0]} · {rows.length} 条</div>
      </div>
      {insights.map(item => (
        <div key={item.label} style={{border:'1px solid var(--aw-border)',background:'#fff',borderRadius:8,padding:'10px 12px'}}>
          <div style={{fontSize:12,color:'var(--aw-fg-3)'}}>{item.label}</div>
          <div style={{fontSize:14,fontWeight:600,marginTop:4}}><Badge tone={item.tone}>{item.value}</Badge></div>
        </div>
      ))}
    </div>
  );
}

function HrCellClass(col) {
  return /编号|工资|金额|人数|日期|时间|月份|编制|打卡|扣款|个税|公积金|实发/.test(col || '') ? 'aw-num' : '';
}

function HrListView({ config, picked, onNew, onView }) {
  const [sel, setSel] = useHrState({});
  const [status, setStatus] = useHrState('');
  const allRows = HrRows(config);
  const columns = HrListColumns(config);
  const rows = allRows
    .filter(row => !picked || picked === config.groups[0] || row.group === picked)
    .filter(row => !status || row.status === status);
  const allChecked = rows.length > 0 && rows.every(row => sel[row.code]);
  const someChecked = rows.some(row => sel[row.code]);
  const selectedCount = rows.filter(row => sel[row.code]).length;
  const toggleAll = () => {
    if (allChecked) setSel({});
    else {
      const next = {};
      rows.forEach(row => next[row.code] = true);
      setSel(next);
    }
  };
  const toggleRow = row => setSel(s => ({...s, [row.code]: !s[row.code]}));
  useHrEffect(() => { setSel({}); setStatus(''); }, [config.title, picked]);
  return (
    <>
      <HrInsightStrip config={config} picked={picked} rows={rows} />
      <PurchaseListToolbar searchPlaceholder={`全局搜索（如${config.subjectLabel}、${config.codeLabel}、${config.partyLabel}）`} newLabel={config.newLabel} onNew={onNew} />
      <div className="aw-doc-tbl-wrap">
        <div className="aw-doc-tbl-inner">
          <table className="aw-doc-tbl">
            <thead>
              <tr>
                <PurchaseSelectHeader checked={allChecked} indeterminate={someChecked} onToggle={toggleAll} />
                <PurchaseIndexHeader />
                {columns.map(col => <th key={col}><div className="aw-th-inner">{col}</div></th>)}
                <PurchaseStatusFilterHeader label={config.statusLabel} value={status} onChange={setStatus} options={config.statuses} width={150} />
                <th style={{width:90}}><div className="aw-th-inner">操作</div></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.code} onClick={() => onView(row)} style={{cursor:'pointer'}}>
                  <PurchaseSelectCell checked={!!sel[row.code]} onToggle={() => toggleRow(row)} />
                  <td>{idx + 1}</td>
                  <td className="aw-link">{row.subject}</td>
                  <td className="aw-num">{row.code}</td>
                  <td>{row.party}</td>
                  <td className={HrCellClass(columns[3])}>{row.amount}</td>
                  <td className={HrCellClass(columns[4])}>{row.done}</td>
                  <td className={HrCellClass(columns[5])}>{row.left}</td>
                  <td className="aw-num">{row.date}</td>
                  <td><HrTone status={row.status} /></td>
                  <td><span className="aw-link" onClick={e => { e.stopPropagation(); onView(row); }}>查看</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <PurchaseListFooter total={rows.length} selectedCount={selectedCount} allChecked={allChecked} someChecked={someChecked} onToggleAll={toggleAll} pages={1} />
    </>
  );
}

function HrFormView({ config, onBack }) {
  const [rows, setRows] = useHrState(config.detailRows.slice(0, 2));
  const isEmployee = config.title === '员工管理';
  const isPayroll = config.title === '薪酬管理';
  const isAttendance = config.title === '考勤管理';
  const fixedLabels = [config.subjectLabel, config.codeLabel, config.statusLabel];
  const formFields = config.formFields.filter(label => !fixedLabels.includes(label));
  const renderFieldControl = (label) => {
    if (label.includes('日期') || label.includes('时间') || label.includes('月份')) return <Input placeholder={`请选择${label}`} />;
    if (label.includes('人员') || label.includes('员工') || label.includes('申请人') || label.includes('负责人') || label.includes('上级') || label.includes('经办人') || label.includes('复核人')) return <Input placeholder={`选择${label}`} />;
    if (['类型','部门','岗位','组织','方案','规则','流程','周期','日历','组','班次','范围','状态'].some(key => label.includes(key))) {
      return <Select><option>请选择</option><option>{label}一</option><option>{label}二</option></Select>;
    }
    return <Input placeholder={`填写${label}`} />;
  };
  return (
    <PurchaseFormPage onBack={onBack} submitText="提交审批">
      <PurchaseSection title="基础信息">
        <div className="aw-doc-grid">
          <Field label={config.subjectLabel} req><Input placeholder={`填写${config.subjectLabel}`} /></Field>
          <Field label={config.codeLabel}><Input defaultValue="自动生成" disabled /></Field>
          <Field label={config.statusLabel}><Select>{config.statuses.map(status => <option key={status}>{status}</option>)}</Select></Field>
          {formFields.map((label, idx) => (
            <Field key={label} label={label} req={idx < 3}>
              {renderFieldControl(label)}
            </Field>
          ))}
        </div>
      </PurchaseSection>
      {isEmployee && (
        <PurchaseSection title="入职校验">
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
            {['组织已启用','岗位有编制','合同模板已配置','账号开通待办'].map((item, idx) => (
              <label key={item} style={{border:'1px solid var(--aw-border)',borderRadius:8,padding:12,display:'flex',gap:8,alignItems:'center'}}>
                <input type="checkbox" defaultChecked={idx < 2} /> <span>{item}</span>
              </label>
            ))}
          </div>
        </PurchaseSection>
      )}
      {isAttendance && (
        <PurchaseSection title="考勤处理">
          <div className="aw-doc-grid">
            <Field label="异常确认人"><Input defaultValue="王人事" /></Field>
            <Field label="薪酬同步"><Select><option>本月暂不锁定</option><option>确认后同步薪酬</option></Select></Field>
            <Field label="处理意见"><Input placeholder="填写迟到、缺卡、请假等处理说明" /></Field>
          </div>
        </PurchaseSection>
      )}
      {isPayroll && (
        <PurchaseSection title="薪酬联动">
          <div className="aw-doc-grid">
            <Field label="考勤期间"><Input defaultValue="2026-05-01 至 2026-05-31" /></Field>
            <Field label="社保公积金"><Select><option>按本月方案自动计算</option><option>手工导入</option></Select></Field>
            <Field label="财务单据"><Input defaultValue="核算通过后生成应付/付款单" disabled /></Field>
          </div>
        </PurchaseSection>
      )}
      <PurchaseSection title={config.detailTitle}>
        <PurchaseDetailTable
          columns={HrDetailColumns(config).map(label => ({label}))}
          rows={rows}
          renderRow={(row, idx) => (
            <tr key={idx}>
              <PurchaseDetailIndexCell index={idx} />
              {row.map((cell, cidx) => <td key={cidx}>{cidx === 3 || cidx === 4 ? <Input defaultValue={cell} /> : cell}</td>)}
              <PurchaseDetailActions onDelete={() => setRows(rs => rs.filter((_, i) => i !== idx))} />
            </tr>
          )}
        />
        <PurchaseAddDetailButton onClick={() => setRows(rs => [...rs, HrDetailColumns(config).map((_, idx) => idx === 0 ? '新增明细' : idx === HrDetailColumns(config).length - 1 ? '草稿' : '请输入')])} />
      </PurchaseSection>
      <PurchaseSection title="详情">
        <PurchaseRichText placeholder="请输入人事说明、适用范围、审批要求、薪酬/考勤规则等..." />
      </PurchaseSection>
      <PurchaseSection title="附件">
        <div style={{border:'1px dashed var(--aw-border-strong)',padding:24,textAlign:'center',color:'var(--aw-fg-3)'}}>
          <span className="aw-link">点击上传</span> / 拖拽到此区域
        </div>
      </PurchaseSection>
    </PurchaseFormPage>
  );
}

function HrKV({ label, value }) {
  return <div style={{display:'flex',gap:14}}><span style={{width:96,color:'var(--aw-fg-3)',flex:'none'}}>{label}：</span><span>{value}</span></div>;
}

function HrRecordTable({ cols }) {
  return (
    <table className="aw-table">
      <thead><tr><th>序号</th>{cols.map(col => <th key={col}>{col}</th>)}</tr></thead>
      <tbody>{[1,2,3].map(i => <tr key={i}><td>{i}</td>{cols.map((col, idx) => <td key={col}>{idx === 0 ? `${col}示例` : idx === 2 ? '通过' : idx === 3 ? '2026-05-17 15:30' : '王人事'}</td>)}</tr>)}</tbody>
    </table>
  );
}

function HrAttachmentBlock() {
  return (
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(180px,1fr))',gap:12}}>
      {['身份证附件.pdf','劳动合同.pdf','审批记录.xlsx'].map(name => (
        <div key={name} style={{border:'1px dashed var(--aw-border-strong)',padding:14,minHeight:92}}>
          <div>{name}</div>
          <div style={{fontSize:12,color:'var(--aw-fg-3)',marginTop:10}}>上传日期：2026-05-17 14:52</div>
          <div style={{display:'flex',gap:14,marginTop:16}}><span className="aw-link">查看</span><span className="aw-link">下载</span></div>
        </div>
      ))}
    </div>
  );
}

function HrDetailView({ config, row, onBack }) {
  const [tab, setTab] = useHrState('info');
  const tabs = HR_DETAIL_TABS[config.title] || [
    {k:'info', label:'基础信息'},
    {k:'record', label:'业务记录'},
    {k:'approve', label:'审批记录'},
    {k:'attach', label:'附件记录'},
    {k:'op', label:'操作记录'},
  ];
  return (
    <div className="aw-doc-form">
      <div className="aw-doc-form-body">
        <DetailHeaderCard
          title={`${row.subject} ${row.code}`}
          status={row.status}
          onBack={onBack}
          creator="王人事"
          createdAt="2026-05-17 10:25"
          modifier="人事主管"
          modifiedAt="2026-05-17 15:30"
          detailItems={[
            [config.codeLabel, row.code],
            [config.partyLabel, row.party],
            [config.amountLabel, row.amount],
            [config.dateLabel, row.date],
            [config.statusLabel, row.status],
          ]}
        />
        <Card>
          <div className="aw-tabs" style={{marginBottom:14}}>
            {tabs.map(t => <span key={t.k} className={'aw-tab ' + (tab === t.k ? 'on' : '')} onClick={() => setTab(t.k)}>{t.label}</span>)}
          </div>
          {tab === 'info' && (
            <>
              <PurchaseSection title="基础信息">
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',rowGap:16,columnGap:80,fontSize:13}}>
                  <HrKV label={config.subjectLabel} value={row.subject} />
                  <HrKV label={config.codeLabel} value={row.code} />
                  <HrKV label={config.partyLabel} value={row.party} />
                  <HrKV label={config.amountLabel} value={row.amount} />
                  <HrKV label={config.dateLabel} value={row.date} />
                  <HrKV label={config.statusLabel} value={<HrTone status={row.status} />} />
                </div>
              </PurchaseSection>
              <PurchaseSection title={config.detailTitle}>
                <table className="aw-table">
                  <thead><tr><th>序号</th>{HrDetailColumns(config).map(col => <th key={col}>{col}</th>)}</tr></thead>
                  <tbody>{config.detailRows.map((r, i) => <tr key={i}><td>{i + 1}</td>{r.map((c, cidx) => <td key={cidx}>{c}</td>)}</tr>)}</tbody>
                </table>
              </PurchaseSection>
              <PurchaseSection title="详情">
                <div style={{fontSize:13,lineHeight:1.8,color:'var(--aw-fg-2)'}}>
                  本页面用于维护人事主数据和业务单据，需与组织、岗位、考勤、薪酬和档案信息保持一致。涉及入离职、异动、薪酬核算、考勤异常等关键事项时，应保留审批与操作记录。
                </div>
              </PurchaseSection>
            </>
          )}
          {tab === 'life' && <HrRecordTable cols={['生命周期阶段','计划日期','完成日期','责任人','关键事项','状态']} />}
          {tab === 'job' && <HrRecordTable cols={['任职组织','岗位/角色','职级','开始日期','结束日期','任职状态']} />}
          {tab === 'contract' && <HrRecordTable cols={['合同/证照类型','编号','签署/签发日期','到期日期','保管位置','提醒状态']} />}
          {tab === 'headcount' && <HrRecordTable cols={['组织/岗位','核定编制','在岗人数','空缺人数','超编人数','生效日期']} />}
          {tab === 'attendance' && <HrRecordTable cols={['统计周期','出勤天数','迟到早退','请假小时','加班小时','异常次数']} />}
          {tab === 'payroll' && <HrRecordTable cols={['员工姓名','基本工资','绩效补贴','社保公积金','个税','实发工资']} />}
          {tab === 'finance' && <HrRecordTable cols={['付款单号','收款员工数','应付工资','付款账户','同步财务时间','财务状态']} />}
          {tab === 'record' && <HrRecordTable cols={['记录类型','处理人','处理结果','处理时间','备注']} />}
          {tab === 'approve' && <HrRecordTable cols={['审批节点','审批人','审批结果','审批时间','意见']} />}
          {tab === 'attach' && <HrAttachmentBlock />}
          {tab === 'op' && <HrRecordTable cols={['操作类型','操作人','操作时间','操作内容','结果']} />}
        </Card>
      </div>
    </div>
  );
}

function HrActionRows(config, action) {
  const rows = HrRows(config);
  return rows.map((row, idx) => ({
    ...row,
    subject: idx === 0 ? action : `${action}示例${idx}`,
    code: row.code.replace('001', String(idx + 1).padStart(3, '0')),
  }));
}

function HrProfileDetailRow(config, profile, row) {
  const codeIdx = profile.columns.findIndex(col => /编号|单号/.test(col));
  const dateIdx = profile.columns.findIndex(col => /日期|时间|月份/.test(col));
  const amountIdx = profile.columns.findIndex(col => /工资|金额|人数|编制/.test(col));
  const preferredPartyIdx = profile.columns.findIndex(col => /所属部门|部门|组织|考勤组|薪资方案/.test(col));
  const fallbackPartyIdx = profile.columns.findIndex(col => /员工|申请人|方案/.test(col) && !/编号|工资|金额/.test(col));
  const partyIdx = preferredPartyIdx >= 0 ? preferredPartyIdx : fallbackPartyIdx;
  return {
    ...config.row,
    subject: row[0] || config.row.subject,
    code: codeIdx >= 0 ? row[codeIdx] : config.row.code,
    party: partyIdx >= 0 ? row[partyIdx] : config.row.party,
    amount: amountIdx >= 0 ? row[amountIdx] : config.row.amount,
    done: row[4] || config.row.done,
    left: row[5] || config.row.left,
    date: dateIdx >= 0 ? row[dateIdx] : config.row.date,
    status: row[row.length - 1] || config.row.status,
  };
}

function HrActionView({ config, action, onNew, onBack, onView }) {
  const [sel, setSel] = useHrState({});
  const [status, setStatus] = useHrState('');
  const profile = HrActionProfile(config, action);
  const rows = profile
    ? profile.rows.filter(row => !status || row[row.length - 1] === status)
    : HrActionRows(config, action).filter(row => !status || row.status === status);
  const rowKey = row => profile ? `${row[0]}-${row[1]}-${row[row.length - 1]}` : row.code;
  const allChecked = rows.length > 0 && rows.every(row => sel[rowKey(row)]);
  const someChecked = rows.some(row => sel[rowKey(row)]);
  const selectedCount = rows.filter(row => sel[rowKey(row)]).length;
  const toggleAll = () => {
    if (allChecked) setSel({});
    else {
      const next = {};
      rows.forEach(row => next[rowKey(row)] = true);
      setSel(next);
    }
  };
  const toggleRow = row => setSel(s => ({...s, [rowKey(row)]: !s[rowKey(row)]}));
  useHrEffect(() => { setSel({}); setStatus(''); }, [config.title, action]);
  return (
    <>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
        <span className="aw-link" onClick={onBack}>← 返回{config.title}</span>
        <span style={{fontSize:13,color:'var(--aw-fg-3)'}}>当前页面：{action}</span>
      </div>
      <HrInsightStrip config={config} picked={action} rows={rows} />
      <PurchaseListToolbar searchPlaceholder={`全局搜索（如${action}、${config.codeLabel}、负责人）`} newLabel={profile ? profile.newLabel : (action.startsWith('新增') ? action : `新增${action.replace(/列表|详情|统计|管理|记录/g, '') || config.title}`)} onNew={onNew} />
      <div className="aw-doc-tbl-wrap">
        <div className="aw-doc-tbl-inner">
          <table className="aw-doc-tbl">
            <thead>
              <tr>
                <PurchaseSelectHeader checked={allChecked} indeterminate={someChecked} onToggle={toggleAll} />
                <PurchaseIndexHeader />
                {(profile ? profile.columns : [`${action}主题`,'单据编号','所属对象','类型/岗位','人数/金额','负责人','日期']).map(col => <th key={col}><div className="aw-th-inner">{col}</div></th>)}
                <PurchaseStatusFilterHeader label={profile ? profile.statusLabel : '状态'} value={status} onChange={setStatus} options={profile ? profile.statuses : config.statuses} width={150} />
                <th style={{width:90}}><div className="aw-th-inner">操作</div></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => profile ? (
                <tr key={rowKey(row)} onClick={() => onView(HrProfileDetailRow(config, profile, row))} style={{cursor:'pointer'}}>
                  <PurchaseSelectCell checked={!!sel[rowKey(row)]} onToggle={() => toggleRow(row)} />
                  <td>{idx + 1}</td>
                  {row.slice(0, -1).map((cell, cidx) => <td key={cidx} className={/工资|金额|日期|时间|编号|人数/.test(profile.columns[cidx]) ? 'aw-num' : ''}>{cidx === 0 ? <span className="aw-link">{cell}</span> : cell}</td>)}
                  <td><HrTone status={row[row.length - 1]} /></td>
                  <td><span className="aw-link" onClick={e => { e.stopPropagation(); onView(HrProfileDetailRow(config, profile, row)); }}>查看</span></td>
                </tr>
              ) : (
                <tr key={row.code} onClick={() => onView(row)} style={{cursor:'pointer'}}>
                  <PurchaseSelectCell checked={!!sel[rowKey(row)]} onToggle={() => toggleRow(row)} />
                  <td>{idx + 1}</td>
                  <td className="aw-link">{row.subject}</td>
                  <td className="aw-num">{row.code}</td>
                  <td>{row.party}</td>
                  <td>{row.amount}</td>
                  <td>{row.done}</td>
                  <td>{row.left}</td>
                  <td className="aw-num">{row.date}</td>
                  <td><HrTone status={row.status} /></td>
                  <td><span className="aw-link" onClick={e => { e.stopPropagation(); onView(row); }}>查看</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <PurchaseListFooter total={rows.length} selectedCount={selectedCount} allChecked={allChecked} someChecked={someChecked} onToggleAll={toggleAll} pages={1} />
    </>
  );
}

function HrModuleScreen({ moduleKey, initialAction, onActionConsumed }) {
  const config = HR_CONFIG[moduleKey];
  const safeConfig = config || HR_CONFIG.hrEmployee;
  const [view, setView] = useHrState('list');
  const [picked, setPicked] = useHrState(safeConfig.groups[0]);
  const [detail, setDetail] = useHrState(safeConfig.row);
  const [actionTitle, setActionTitle] = useHrState('');
  useHrEffect(() => {
    if (!config) return;
    setView('list');
    setPicked(config.groups[0]);
    setDetail(config.row);
    setActionTitle('');
  }, [moduleKey, !!config]);
  useHrEffect(() => {
    if (!config) return;
    if (HrIsNewAction(initialAction)) {
      setView('new');
      onActionConsumed && onActionConsumed();
    } else if (HrIsListAction(config, initialAction)) {
      setView('list');
      setActionTitle('');
      onActionConsumed && onActionConsumed();
    } else if (initialAction) {
      setActionTitle(initialAction);
      setView('action');
      onActionConsumed && onActionConsumed();
    }
  }, [initialAction, !!config]);
  if (!config) {
    return (
      <Card title="人力中心">
        <div style={{ color:'var(--aw-fg-3)', fontSize:13, padding:'40px 0', textAlign:'center' }}>
          未识别的人力模块入口：{moduleKey}
        </div>
      </Card>
    );
  }
  return (
    <div className="aw-doc-page">
      {view === 'list' && <HrTree config={config} picked={picked} setPicked={setPicked} />}
      <div className="aw-doc-main" style={{maxWidth:'none'}}>
        {view === 'list' && <HrListView key={moduleKey} config={config} picked={picked} onNew={() => setView('new')} onView={(row) => { setDetail(row); setView('detail'); }} />}
        {view === 'action' && <HrActionView key={`${moduleKey}-${actionTitle}`} config={config} action={actionTitle || config.title} onNew={() => setView('new')} onBack={() => setView('list')} onView={(row) => { setDetail(row); setView('detail'); }} />}
        {view === 'new' && <HrFormView key={`${moduleKey}-new`} config={config} onBack={() => setView('list')} />}
        {view === 'detail' && <HrDetailView key={`${moduleKey}-${detail.code}`} config={config} row={detail} onBack={() => setView('list')} />}
      </div>
    </div>
  );
}

window.HrModuleScreen = HrModuleScreen;
