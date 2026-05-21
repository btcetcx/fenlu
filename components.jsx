// ui_kits/erp-console/components.jsx
const { useState } = React;

/* ===== MODULES config ===== */
const MODULES = {
  doc:      { name:'文档', code:'doc', hasPrint:true,  hasPolicy:true  },
  project:  { name:'项目', code:'proj',hasPrint:true,  hasPolicy:true  },
  product:  { name:'产品', code:'prod',hasPrint:true,  hasPolicy:true  },
  material: { name:'物料', code:'mat', hasPrint:true,  hasPolicy:true  },
  process:  { name:'工序', code:'proc',hasPrint:true,  hasPolicy:true  },
  craft:    { name:'工艺', code:'craft',hasPrint:true, hasPolicy:true  },
  bom:      { name:'BOM', code:'bom',  hasPrint:true,  hasPolicy:true  },
  supplier: { name:'供应商', code:'supp', hasPrint:false, hasPolicy:true },
  pr:       { name:'请购',   code:'pr',   hasPrint:true,  hasPolicy:true },
  inquiry:  { name:'询价',   code:'inq',  hasPrint:true,  hasPolicy:true },
  order:    { name:'采购',   code:'ord',  hasPrint:true,  hasPolicy:true },
  pret:     { name:'退货',   code:'pret', hasPrint:true,  hasPolicy:true },
  exchange: { name:'换货',   code:'exch', hasPrint:true,  hasPolicy:true },
  report:   { name:'报表',   code:'rpt',  hasPrint:false, hasPolicy:false },
  customer: { name:'客户',   code:'cust', hasPrint:false, hasPolicy:true },
  salesPlan:{ name:'销售计划', code:'splan', hasPrint:true, hasPolicy:true },
  quote:    { name:'报价',   code:'quote',hasPrint:true,  hasPolicy:true },
  contract: { name:'合同',   code:'cont', hasPrint:true,  hasPolicy:true },
  saleOrder:{ name:'订单',   code:'sord', hasPrint:true,  hasPolicy:true },
  sret:     { name:'销售退货', code:'sret', hasPrint:true, hasPolicy:true },
  sexchange:{ name:'销售换货', code:'sexch',hasPrint:true, hasPolicy:true },
  sreport:  { name:'销售报表', code:'srpt', hasPrint:false,hasPolicy:false },
  stockManage:{ name:'库存', code:'stock', hasPrint:true, hasPolicy:true },
  outbound: { name:'出库', code:'out', hasPrint:true, hasPolicy:true },
  inbound:  { name:'入库', code:'in', hasPrint:true, hasPolicy:true },
  transfer: { name:'调拨', code:'trans', hasPrint:true, hasPolicy:true },
  inventoryCheck:{ name:'盘点', code:'check', hasPrint:true, hasPolicy:true },
  outboundQc:{ name:'出库质检', code:'oqc', hasPrint:true, hasPolicy:true },
  incomingQc:{ name:'来料质检', code:'iqc', hasPrint:true, hasPolicy:true },
  warehouseLocation:{ name:'仓库库位', code:'wloc', hasPrint:true, hasPolicy:true },
  financeAr:{ name:'应收', code:'far', hasPrint:true, hasPolicy:true },
  financeAp:{ name:'应付', code:'fap', hasPrint:true, hasPolicy:true },
  financeInvoice:{ name:'发票', code:'finv', hasPrint:true, hasPolicy:true },
  financeFund:{ name:'资金', code:'ffund', hasPrint:true, hasPolicy:true },
  financeExpense:{ name:'费用', code:'fexp', hasPrint:true, hasPolicy:true },
  financeCost:{ name:'成本', code:'fcost', hasPrint:true, hasPolicy:true },
  financeVoucher:{ name:'凭证', code:'fvou', hasPrint:true, hasPolicy:true },
  financeReport:{ name:'财务报表', code:'frpt', hasPrint:true, hasPolicy:true },
  hrEmployee:{ name:'员工', code:'hemp', hasPrint:true, hasPolicy:true },
  hrOrg:{ name:'组织', code:'horg', hasPrint:true, hasPolicy:true },
  hrPosition:{ name:'岗位', code:'hpos', hasPrint:true, hasPolicy:true },
  hrAttendance:{ name:'考勤', code:'hatt', hasPrint:true, hasPolicy:true },
  hrSchedule:{ name:'排班', code:'hsch', hasPrint:true, hasPolicy:true },
  hrPayroll:{ name:'薪酬', code:'hpay', hasPrint:true, hasPolicy:true },
  hrArchive:{ name:'档案', code:'harc', hasPrint:true, hasPolicy:true },
  hrOffice:{ name:'人事办公', code:'hoff', hasPrint:true, hasPolicy:true },
  mfgDemand:{ name:'生产需求', code:'mdem', hasPrint:false, hasPolicy:true },
  mfgPlan:{ name:'生产计划', code:'mplan', hasPrint:true, hasPolicy:true },
  mfgOrder:{ name:'生产订单', code:'mord', hasPrint:true, hasPolicy:true },
  mfgWorkOrder:{ name:'生产工单', code:'mwo', hasPrint:true, hasPolicy:true },
  mfgSchedule:{ name:'生产排班', code:'msch', hasPrint:true, hasPolicy:true },
  mfgOutsource:{ name:'委外加工', code:'mout', hasPrint:true, hasPolicy:true },
  qcDashboard:{ name:'质量总览', code:'qcd', hasPrint:true, hasPolicy:false },
  qcIqc:{ name:'检验任务', code:'qciqc', hasPrint:true, hasPolicy:true },
  qcException:{ name:'异常与处置', code:'qcex', hasPrint:true, hasPolicy:true },
  qcIpqc:{ name:'过程质检', code:'qcipqc', hasPrint:true, hasPolicy:true },
  qcFqc:{ name:'成品质检', code:'qcfqc', hasPrint:true, hasPolicy:true },
  qcOqc:{ name:'出货质检', code:'qcoqc', hasPrint:true, hasPolicy:true },
  qcPlan:{ name:'检验标准', code:'qcplan', hasPrint:true, hasPolicy:true },
  qcItem:{ name:'检验项目', code:'qcitem', hasPrint:true, hasPolicy:true },
  qcGroup:{ name:'检验资源', code:'qcgrp', hasPrint:true, hasPolicy:true },
  qcReport:{ name:'质量分析', code:'qcrpt', hasPrint:true, hasPolicy:false },
  asService:{ name:'售后工单', code:'asvc', hasPrint:true, hasPolicy:true },
  asRefundExchange:{ name:'退换退款', code:'arx', hasPrint:true, hasPolicy:true },
  asRefundReturn:{ name:'退款退货', code:'arr', hasPrint:true, hasPolicy:true },
  asRefundOnly:{ name:'仅退款', code:'aro', hasPrint:true, hasPolicy:true },
  asExchange:{ name:'换货', code:'aex', hasPrint:true, hasPolicy:true },
  asReturnOnly:{ name:'仅退货', code:'arto', hasPrint:true, hasPolicy:true },
  asDispatch:{ name:'服务派工', code:'adsp', hasPrint:true, hasPolicy:true },
  asConfig:{ name:'基础设置', code:'acfg', hasPrint:true, hasPolicy:true },
  asQuality:{ name:'质量闭环', code:'aqi', hasPrint:true, hasPolicy:true },
  notice:{ name:'公告通知', code:'notice', hasPrint:true, hasPolicy:true },
  approval:{ name:'流程审批', code:'appr', hasPrint:true, hasPolicy:true },
  meeting:{ name:'会议管理', code:'meet', hasPrint:true, hasPolicy:true },
  calendar:{ name:'日程管理', code:'cal', hasPrint:true, hasPolicy:true },
  car:{ name:'用车管理', code:'car', hasPrint:true, hasPolicy:true },
};
const MODULE_DOC = MODULES.doc;

/* ===== PICK_MAP ===== */
const PICK_MAP = {
  '设置文档编号':'coderule','设置项目编号':'coderule','设置产品编号':'coderule',
  '设置物料编号':'coderule','设置工序编号':'coderule','设置工艺编号':'coderule',
  '设置 BOM 编号':'coderule','BOM 编号':'coderule',
  '设置文档分类':'category','设置项目分类':'category','设置产品分类':'category',
  '设置物料分类':'category','设置工序分类':'category','设置工艺分类':'category',
  '设置审批流程':'flow','审批流程':'flow',
  '设置自定义字段':'field','自定义字段':'field',
  '设置文档策略':'policy','设置项目策略':'policy','设置产品策略':'policy',
  '设置物料策略':'policy','设置工序策略':'policy','设置工艺策略':'policy',
  '设置执行标准':'policy','项目策略':'policy','工艺策略':'policy','设置bom策略':'policy','设置bom分类':'category','设置bom模板':'flow','设置bom流程':'flow',
  '设置打印模板':'print','打印模板':'print',
  // 供应商
  '设置供应商编号':'coderule', '设置供应商分类':'category', '设置供应商分组':'category',
  '供应商分组设置':'category', '供应商自定义字段':'field',
  '供应商自定义编号':'coderule', '供应商审批设置':'flow',
  '供应商等级设置':'policy', '设置供应商策略':'policy', '供应商策略设置':'policy',
  // 请购
  '设置请购编号':'coderule', '请购自定义编号':'coderule',
  '请购自定义字段':'field',
  '请购审批设置':'flow',
  '请购策略设置':'policy',
  '设置采购打印模板':'print',
  // 询价
  '设置询价编号':'coderule', '询价自定义编号':'coderule',
  '询价自定义字段':'field',
  '询价审批设置':'flow',
  '询价策略设置':'policy',
  // 采购
  '设置采购编号':'coderule', '采购自定义编号':'coderule',
  '采购自定义字段':'field',
  '采购审批设置':'flow',
  '采购策略设置':'policy',
  // 退货
  '设置退货编号':'coderule', '退货自定义编号':'coderule',
  '退货自定义字段':'field',
  '退货审批设置':'flow',
  '退货策略设置':'policy',
  // 换货
  '设置换货编号':'coderule', '换货自定义编号':'coderule',
  '换货自定义字段':'field',
  '换货审批设置':'flow',
  '换货策略设置':'policy',
  // 销售中心
  '客户分组设置':'category', '客户自定义字段':'field',
  '客户自定义编号':'coderule', '客户等级设置':'policy',
  '客户审批设置':'flow', '客户策略设置':'policy',
  '计划自定义字段':'field', '计划自定义编号':'coderule',
  '计划审批设置':'flow', '计划策略设置':'policy',
  '报价自定义字段':'field', '报价自定义编号':'coderule',
  '报价审批设置':'flow', '报价策略设置':'policy', '设置报价打印模板':'print',
  '合同自定义字段':'field', '合同自定义编号':'coderule',
  '合同审批设置':'flow', '合同策略设置':'policy', '设置合同打印模板':'print',
  '订单自定义字段':'field', '订单自定义编号':'coderule',
  '订单审批设置':'flow', '订单策略设置':'policy', '设置订单打印模板':'print',
  '销售退货自定义字段':'field', '销售退货自定义编号':'coderule',
  '销售退货审批设置':'flow', '销售退货策略设置':'policy', '设置销售退货打印模板':'print',
  '销售换货自定义字段':'field', '销售换货自定义编号':'coderule',
  '销售换货审批设置':'flow', '销售换货策略设置':'policy', '设置销售换货打印模板':'print',
  // 仓储中心
  '库存自定义字段':'field', '库存自定义编号':'coderule',
  '库存审批设置':'flow', '库存策略设置':'policy',
  '出库自定义字段':'field', '出库自定义编号':'coderule',
  '出库审批设置':'flow', '出库策略设置':'policy', '设置出库打印模板':'print',
  '入库自定义字段':'field', '入库自定义编号':'coderule',
  '入库审批设置':'flow', '入库策略设置':'policy', '设置入库打印模板':'print',
  '调拨自定义字段':'field', '调拨自定义编号':'coderule',
  '调拨审批设置':'flow', '调拨策略设置':'policy', '设置调拨打印模板':'print',
  '盘点自定义字段':'field', '盘点自定义编号':'coderule',
  '盘点审批设置':'flow', '盘点策略设置':'policy', '设置盘点打印模板':'print',
  '出库质检自定义字段':'field', '出库质检自定义编号':'coderule',
  '出库质检审批设置':'flow', '出库质检策略设置':'policy', '设置出库质检打印模板':'print',
  '来料质检自定义字段':'field', '来料质检自定义编号':'coderule',
  '来料质检审批设置':'flow', '来料质检策略设置':'policy', '设置来料质检打印模板':'print',
  '仓库库位自定义字段':'field', '仓库库位自定义编号':'coderule',
  '仓库库位审批设置':'flow', '仓库库位策略设置':'policy',
  // 财务中心
  '应收自定义字段':'field', '应收自定义编号':'coderule',
  '应收审批设置':'flow', '应收策略设置':'policy', '设置应收打印模板':'print',
  '应付自定义字段':'field', '应付自定义编号':'coderule',
  '应付审批设置':'flow', '应付策略设置':'policy', '设置应付打印模板':'print',
  '发票自定义字段':'field', '发票自定义编号':'coderule',
  '发票审批设置':'flow', '发票策略设置':'policy', '设置发票打印模板':'print',
  '资金自定义字段':'field', '资金自定义编号':'coderule',
  '资金审批设置':'flow', '资金策略设置':'policy', '设置资金打印模板':'print',
  '费用自定义字段':'field', '费用自定义编号':'coderule',
  '费用审批设置':'flow', '费用策略设置':'policy', '设置费用打印模板':'print',
  '成本自定义字段':'field', '成本自定义编号':'coderule',
  '成本审批设置':'flow', '成本策略设置':'policy', '设置成本打印模板':'print',
  '凭证自定义字段':'field', '凭证自定义编号':'coderule',
  '凭证审批设置':'flow', '凭证策略设置':'policy', '设置凭证打印模板':'print',
  '财务报表自定义字段':'field', '财务报表自定义编号':'coderule',
  '财务报表审批设置':'flow', '财务报表策略设置':'policy', '设置财务报表打印模板':'print',
  // 人力中心
  '员工自定义字段':'field', '员工自定义编号':'coderule',
  '员工审批设置':'flow', '员工策略设置':'policy', '设置员工打印模板':'print',
  '组织自定义字段':'field', '组织自定义编号':'coderule',
  '组织审批设置':'flow', '组织策略设置':'policy', '设置组织打印模板':'print',
  '岗位自定义字段':'field', '岗位自定义编号':'coderule',
  '岗位审批设置':'flow', '岗位策略设置':'policy', '设置岗位打印模板':'print',
  '考勤自定义字段':'field', '考勤自定义编号':'coderule',
  '考勤审批设置':'flow', '考勤策略设置':'policy', '设置考勤打印模板':'print',
  '排班自定义字段':'field', '排班自定义编号':'coderule',
  '排班审批设置':'flow', '排班策略设置':'policy', '设置排班打印模板':'print',
  '薪酬自定义字段':'field', '薪酬自定义编号':'coderule',
  '薪酬审批设置':'flow', '薪酬策略设置':'policy', '设置薪酬打印模板':'print',
  '档案自定义字段':'field', '档案自定义编号':'coderule',
  '档案审批设置':'flow', '档案策略设置':'policy', '设置档案打印模板':'print',
  '人事办公自定义字段':'field', '人事办公自定义编号':'coderule',
  '人事办公审批设置':'flow', '人事办公策略设置':'policy', '设置人事办公打印模板':'print',
  // 质检中心
  '质检自定义字段':'field', '质检自定义编号':'coderule',
  '质检审批设置':'flow', '质检策略设置':'policy', '设置质检打印模板':'print',
  '质检方案自定义字段':'field', '质检方案自定义编号':'coderule',
  '质检方案审批设置':'flow', '质检方案策略设置':'policy', '设置质检方案打印模板':'print',
  '检验项目自定义字段':'field', '检验项目自定义编号':'coderule',
  '检验项目审批设置':'flow', '检验项目策略设置':'policy', '设置检验项目打印模板':'print',
  '检验组自定义字段':'field', '检验组自定义编号':'coderule',
  '检验组审批设置':'flow', '检验组策略设置':'policy', '设置检验组打印模板':'print',
  // 售后中心
  '售后自定义字段':'field', '售后自定义编号':'coderule',
  '售后审批设置':'flow', '售后策略设置':'policy', '设置售后打印模板':'print',
  '退换货自定义字段':'field', '退换货自定义编号':'coderule',
  '退换货审批设置':'flow', '退换货策略设置':'policy', '设置退换货打印模板':'print',
  '售后配置自定义字段':'field', '售后配置自定义编号':'coderule',
  '售后配置审批设置':'flow', '售后配置策略设置':'policy', '设置售后配置打印模板':'print',
  '质量改进自定义字段':'field', '质量改进自定义编号':'coderule',
  '质量改进审批设置':'flow', '质量改进策略设置':'policy', '设置质量改进打印模板':'print',
  // 生产中心
  '生产需求自定义字段':'field', '生产需求自定义编号':'coderule',
  '生产需求审批设置':'flow', '生产需求策略设置':'policy',
  '生产计划自定义字段':'field', '生产计划自定义编号':'coderule',
  '生产计划审批设置':'flow', '生产计划策略设置':'policy', '设置生产计划打印模板':'print',
  '生产订单自定义字段':'field', '生产订单自定义编号':'coderule',
  '生产订单审批设置':'flow', '生产订单策略设置':'policy', '设置生产订单打印模板':'print',
  '生产工单自定义字段':'field', '生产工单自定义编号':'coderule',
  '生产工单审批设置':'flow', '生产工单策略设置':'policy', '设置生产工单打印模板':'print',
  '委外加工自定义字段':'field', '委外加工自定义编号':'coderule',
  '委外加工审批设置':'flow', '委外加工策略设置':'policy', '设置委外加工打印模板':'print',
  '排班自定义字段':'field', '排班自定义编号':'coderule',
  '排班审批设置':'flow', '生产排班策略设置':'policy', '设置生产排班打印模板':'print',
};

/* ===== NAV ===== */
const NAV = [
  { k: 'prd', label: 'PRD', ic: '▣' },
  { k: 'rd', label: '研发', ic: '✎' },
  { k: 'pur', label: '采购', ic: '📦' },
  { k: 'sale', label: '销售', ic: '💼' },
  { k: 'as', label: '售后', ic: '☎' },
  { k: 'wh', label: '仓储', ic: '🗄' },
  { k: 'mfg', label: '生产', ic: '⚙' },
  { k: 'qc', label: '质检', ic: '✓' },
  { k: 'fin', label: '财务', ic: '¥' },
  { k: 'hr', label: '人力', ic: '👤' },
  { k: 'oa', label: '办公', ic: '📁' },
  { k: 'eq', label: '设备', ic: '🔧' },
  { k: 'en', label: '能耗', ic: '⚡' },
  { k: 'set', label: '设置', ic: '⚙' },
];

// 12 部门完整配置：侧栏 + 飞单 + 工作台数据
const DEPT_CONFIG = {
  prd: {
    title: 'PRD 文档',
    sideItems: [
      {k:'workbench',label:'文档总览'},
      {k:'prdRd',label:'研发中心'},
      {k:'prdPur',label:'采购中心'},
      {k:'prdSale',label:'销售中心'},
      {k:'prdWh',label:'仓储中心'},
      {k:'prdMfg',label:'生产中心'},
      {k:'prdQc',label:'质检中心'},
      {k:'prdFin',label:'财务中心'},
      {k:'prdHr',label:'人力中心'},
      {k:'prdAs',label:'售后中心'},
      {k:'prdOa',label:'办公中心'},
    ],
    flyouts: {},
    workbench:{
      kpis:[
        {tone:'peach',key:'prdRd',label:'已整理一级模块',value:1,ic:'doc'},
        {tone:'mint',key:'prdTodo',label:'待整理模块',value:9,ic:'list'},
        {tone:'sky',key:'prdIssue',label:'待确认问题',value:8,ic:'flow'},
        {tone:'rose',key:'prdLogic',label:'逻辑待修复',value:12,ic:'check'},
        {tone:'lilac',key:'prdField',label:'字段待确认',value:24,ic:'edit'},
        {tone:'sand',key:'prdDev',label:'开发说明',value:1,ic:'folder'},
      ],
      moreKpis:[
        {tone:'sky',key:'prdPur',label:'采购链路',value:1,ic:'cart'},
        {tone:'mint',key:'prdWh',label:'仓储链路',value:1,ic:'folder'},
        {tone:'peach',key:'prdMfg',label:'生产链路',value:1,ic:'flow'},
        {tone:'rose',key:'prdQc',label:'质检回写',value:1,ic:'check'},
        {tone:'lilac',key:'prdFin',label:'财务闭环',value:1,ic:'doc'},
        {tone:'sand',key:'prdAs',label:'售后闭环',value:1,ic:'edit'},
      ],
      navTiles:[
        {label:'研发',sub:'研发中心 PRD',n:8,tint:'#DCE7FB',fg:'#5677FC',ic:'doc'},
        {label:'采购',sub:'采购中心 PRD',n:6,tint:'#DCE7FB',fg:'#5677FC',ic:'cart'},
        {label:'销售',sub:'销售中心 PRD',n:8,tint:'#DBF3E6',fg:'#10B981',ic:'list'},
        {label:'仓储',sub:'仓储中心 PRD',n:7,tint:'#FEF3CD',fg:'#B26A24',ic:'folder'},
        {label:'生产',sub:'生产中心 PRD',n:5,tint:'#E8DEFB',fg:'#8957D8',ic:'flow'},
        {label:'质检',sub:'质检中心 PRD',n:8,tint:'#FBDFDF',fg:'#D14D4D',ic:'check'},
        {label:'财务',sub:'财务中心 PRD',n:8,tint:'#DCE7FB',fg:'#5677FC',ic:'doc'},
        {label:'人力',sub:'人力中心 PRD',n:8,tint:'#F6EFD9',fg:'#6D5818',ic:'user'},
      ],
      entries:[
        {label:'查看研发PRD',tint:'#DCE7FB',fg:'#5677FC',ic:'doc'},
        {label:'待确认问题',tint:'#DCE7FB',fg:'#5677FC',ic:'flow'},
        {label:'逻辑修复清单',tint:'#DCE7FB',fg:'#5677FC',ic:'check'},
        {label:'字段字典',tint:'#DCE7FB',fg:'#5677FC',ic:'edit'},
        {label:'开发交付说明',tint:'#DCE7FB',fg:'#5677FC',ic:'folder'},
      ],
    },
  },
  rd: {
    title: '研发中心',
    sideItems: [{k:'workbench',label:'工作台'},{k:'doc',label:'文档库'},{k:'project',label:'项目管理'},{k:'product',label:'产品管理'},{k:'material',label:'物料管理'},{k:'process',label:'工序管理'},{k:'craft',label:'工艺管理'},{k:'bom',label:'BOM管理'}],
    flyouts: {
      doc:{sections:[{title:'文档库',items:['新增文档','文档列表']},{title:'文档设置',items:['设置文档编号','设置文档分类','设置审批流程','设置自定义字段','设置文档策略','设置打印模板']}]},
      project:{sections:[{title:'项目管理',items:['新增项目','项目列表']},{title:'项目设置',items:['设置项目编号','设置项目分类','设置审批流程','设置自定义字段','设置项目策略','设置打印模板']}]},
      product:{sections:[{title:'产品管理',items:['新增产品','产品列表']},{title:'产品设置',items:['设置产品编号','设置产品分类','设置审批流程','设置自定义字段','设置产品策略','设置打印模板']}]},
      material:{sections:[{title:'物料管理',items:['新增物料','物料列表']},{title:'物料设置',items:['设置物料编号','设置物料分类','设置审批流程','设置自定义字段','设置物料策略','设置打印模板']}]},
      process:{sections:[{title:'工序管理',items:['新增工序','工序列表']},{title:'工序设置',items:['设置工序编号','设置工序分类','设置审批流程','设置自定义字段','设置工序策略','设置打印模板']}]},
      craft:{sections:[{title:'工艺管理',items:['新增工艺','工艺列表']},{title:'工艺设置',items:['设置工艺编号','设置工艺分类','设置审批流程','设置自定义字段','设置工艺策略','设置打印模板']}]},
      bom:{sections:[
        {title:'BOM库',items:['新增BOM','BOM列表']},
        {title:'代替物料库',items:['新增代替','代替列表']},
        {title:'BOM设置',items:['设置项目编号','设置bom策略','设置bom分类','设置bom模板','设置bom流程','设置自定义字段']}
      ]},
    },
    workbench:{
      kpis:[{tone:'peach',key:'doc',label:'待审批文档',value:10,ic:'doc'},{tone:'mint',key:'proj',label:'待审批的项目',value:10,ic:'folder'},{tone:'sky',key:'prod',label:'待审批的产品',value:10,ic:'cube'},{tone:'rose',key:'craft',label:'待审批的工艺',value:10,ic:'edit'},{tone:'lilac',key:'bom',label:'待审批的物料清单',value:10,ic:'list'},{tone:'sand',key:'sub',label:'待审批的代替料',value:10,ic:'flow'}],
      moreKpis:[{tone:'sky',key:'order',label:'待审批的订单',value:8,ic:'cart'},{tone:'mint',key:'pur',label:'待审批的采购申请',value:5,ic:'cart'},{tone:'peach',key:'sale',label:'待审批的销售合同',value:3,ic:'doc'},{tone:'rose',key:'change',label:'待审批的变更单',value:2,ic:'edit'},{tone:'lilac',key:'leave',label:'待审批的请假',value:4,ic:'user'},{tone:'sand',key:'stock',label:'待审批的出入库',value:6,ic:'list'}],
      navTiles:[{label:'文档',sub:'设计图纸',n:25,tint:'#DCE7FB',fg:'#5677FC',ic:'doc'},{label:'项目',sub:'项目管理',n:28,tint:'#DCE7FB',fg:'#5677FC',ic:'folder'},{label:'产品',sub:'产品管理',n:18,tint:'#DCE7FB',fg:'#5677FC',ic:'cube'},{label:'物料',sub:'物料清单',n:52,tint:'#DCE7FB',fg:'#5677FC',ic:'list'},{label:'工序',sub:'工序管理',n:0,tint:'#FEF3CD',fg:'#B26A24',ic:'flow'},{label:'工艺',sub:'工艺管理',n:0,tint:'#FBDFDF',fg:'#D14D4D',ic:'edit'},{label:'人员',sub:'研发人员',n:36,tint:'#E8DEFB',fg:'#8957D8',ic:'user'},{label:'评审',sub:'评审记录',n:7,tint:'#DBF3E6',fg:'#10B981',ic:'check'}],
      entries:[{label:'新建工单',tint:'#DCE7FB',fg:'#5677FC',ic:'doc'},{label:'上传图纸',tint:'#DCE7FB',fg:'#5677FC',ic:'upload'},{label:'采购申请',tint:'#DCE7FB',fg:'#5677FC',ic:'cart'},{label:'库存查询',tint:'#DCE7FB',fg:'#5677FC',ic:'search'},{label:'我的审批',tint:'#DCE7FB',fg:'#5677FC',ic:'check'}]}},
  pur: {
    title: '采购中心',
    sideItems: [
      {k:'workbench', label:'工作台'},
      {k:'supplier', label:'供应商管理'},
      {k:'pr', label:'请购管理'},
      {k:'inquiry', label:'询价管理'},
      {k:'order', label:'采购管理'},
      {k:'pret', label:'采购退货'},
      {k:'exchange', label:'采购换货'},
      {k:'report', label:'采购报表'},
    ],
    flyouts: {
      supplier: {
        sections: [
          {title:'供应商管理', items:['添加供应商','供应商列表']},
          {title:'供应商设置', items:['供应商分组设置','供应商自定义字段','供应商自定义编号','供应商等级设置','供应商审批设置','供应商策略设置']},
        ]
      },
      pr: {
        sections: [
          {title:'请购管理', items:['添加请购','请购列表','请购明细']},
          {title:'请购设置', items:['请购自定义字段','请购自定义编号','请购审批设置','请购策略设置','设置采购打印模板']},
        ]
      },
      inquiry: {
        sections: [
          {title:'询价管理', items:['添加询价','询价列表']},
          {title:'询价设置', items:['询价自定义字段','询价自定义编号','询价审批设置','询价策略设置','设置采购打印模板']},
        ]
      },
      order: {
        sections: [
          {title:'采购管理', items:['添加采购','采购列表']},
          {title:'采购设置', items:['采购自定义字段','采购自定义编号','采购审批设置','采购策略设置','设置采购打印模板']},
        ]
      },
      pret: {
        sections: [
          {title:'退货管理', items:['添加退货','退货列表']},
          {title:'退货设置', items:['退货自定义字段','退货自定义编号','退货审批设置','退货策略设置','设置退货打印模板']},
        ]
      },
      exchange: {
        sections: [
          {title:'换货管理', items:['添加换货','换货列表']},
          {title:'换货设置', items:['换货自定义字段','换货自定义编号','换货审批设置','换货策略设置','设置换货打印模板']},
        ]
      },
      report: {
        sections: [
          {title:'采购报表', items:['供应商对账表','按供应商查询']},
          {title:'采购统计', items:['按产品统计','退货明细','换货明细']},
        ]
      },
    },
    workbench: {
      kpis: [
        {tone:'peach',key:'pr',label:'待审批请购单',value:12,ic:'cart'},
        {tone:'mint',key:'order',label:'待审批采购单',value:8,ic:'doc'},
        {tone:'sky',key:'inquiry',label:'待处理询价',value:5,ic:'search'},
        {tone:'rose',key:'supplier',label:'待审核供应商',value:3,ic:'user'},
        {tone:'lilac',key:'receipt',label:'待质检入库单',value:15,ic:'list'},
        {tone:'sand',key:'pret',label:'待处理退货单',value:2,ic:'flow'},
      ],
      moreKpis: [
        {tone:'sky',key:'urgent',label:'紧急采购',value:4,ic:'cart'},
        {tone:'mint',key:'plan',label:'采购计划',value:20,ic:'folder'},
        {tone:'peach',key:'budget',label:'预算超支提醒',value:1,ic:'doc'},
        {tone:'rose',key:'delay',label:'逾期未交货',value:6,ic:'edit'},
        {tone:'lilac',key:'quality',label:'质量问题',value:3,ic:'list'},
        {tone:'sand',key:'stock',label:'库存预警',value:7,ic:'list'},
      ],
      navTiles: [
        {label:'供应商',sub:'供应商管理',n:156,tint:'#DCE7FB',fg:'#5677FC',ic:'user'},
        {label:'请购',sub:'请购管理',n:32,tint:'#DCE7FB',fg:'#5677FC',ic:'cart'},
        {label:'询价',sub:'询价管理',n:18,tint:'#DCE7FB',fg:'#5677FC',ic:'search'},
        {label:'采购',sub:'采购管理',n:48,tint:'#DCE7FB',fg:'#5677FC',ic:'doc'},
        {label:'退货',sub:'采购退货',n:3,tint:'#FBDFDF',fg:'#D14D4D',ic:'flow'},
        {label:'换货',sub:'采购换货',n:2,tint:'#E8DEFB',fg:'#8957D8',ic:'edit'},
        {label:'报表',sub:'采购报表',n:0,tint:'#DBF3E6',fg:'#10B981',ic:'check'},
        {label:'分析',sub:'采购分析',n:0,tint:'#FEF3CD',fg:'#B26A24',ic:'list'},
      ],
      entries: [
        {label:'新建请购单',tint:'#DCE7FB',fg:'#5677FC',ic:'cart'},
        {label:'供应商询价',tint:'#DCE7FB',fg:'#5677FC',ic:'search'},
        {label:'采购订单',tint:'#DCE7FB',fg:'#5677FC',ic:'doc'},
        {label:'采购报表',tint:'#DCE7FB',fg:'#5677FC',ic:'check'},
        {label:'我的审批',tint:'#DCE7FB',fg:'#5677FC',ic:'list'},
      ],
    },
  },
  sale: {
    title: '销售中心',
    sideItems: [
      {k:'workbench', label:'工作台'},
      {k:'customer', label:'客户管理'},
      {k:'salesPlan', label:'销售计划'},
      {k:'quote', label:'报价管理'},
      {k:'contract', label:'合同管理'},
      {k:'saleOrder', label:'订单管理'},
      {k:'sret', label:'销售退货'},
      {k:'sexchange', label:'销售换货'},
      {k:'sreport', label:'销售报表'},
    ],
    flyouts: {
      customer: {
        sections: [
          {title:'客户管理', items:['添加客户','客户列表']},
          {title:'客户设置', items:['客户分组设置','客户自定义字段','客户自定义编号','客户等级设置','客户审批设置','客户策略设置']},
        ]
      },
      salesPlan: {
        sections: [
          {title:'计划管理', items:['添加计划','计划列表']},
          {title:'计划设置', items:['计划自定义字段','计划自定义编号','计划审批设置','计划策略设置']},
        ]
      },
      quote: {
        sections: [
          {title:'报价管理', items:['添加报价','报价列表']},
          {title:'报价设置', items:['报价自定义字段','报价自定义编号','报价审批设置','报价策略设置','设置报价打印模板']},
        ]
      },
      contract: {
        sections: [
          {title:'合同管理', items:['添加合同','合同列表']},
          {title:'合同设置', items:['合同自定义字段','合同自定义编号','合同审批设置','合同策略设置','设置合同打印模板']},
        ]
      },
      saleOrder: {
        sections: [
          {title:'订单管理', items:['添加订单','订单列表']},
          {title:'订单设置', items:['订单自定义字段','订单自定义编号','订单审批设置','订单策略设置','设置订单打印模板']},
        ]
      },
      sret: {
        sections: [
          {title:'退货管理', items:['添加退货','退货列表']},
          {title:'退货设置', items:['销售退货自定义字段','销售退货自定义编号','销售退货审批设置','销售退货策略设置','设置销售退货打印模板']},
        ]
      },
      sexchange: {
        sections: [
          {title:'换货管理', items:['添加换货','换货列表']},
          {title:'换货设置', items:['销售换货自定义字段','销售换货自定义编号','销售换货审批设置','销售换货策略设置','设置销售换货打印模板']},
        ]
      },
      sreport: {
        sections: [
          {title:'销售报表', items:['销售对账表','按客户查询']},
          {title:'销售统计', items:['按产品统计','退货明细','换货明细']},
        ]
      },
    },
    workbench: {
      kpis: [
        {tone:'mint',key:'salesPlan',label:'待执行计划',value:12,ic:'list'},
        {tone:'peach',key:'quote',label:'待跟进报价',value:9,ic:'doc'},
        {tone:'mint',key:'contract',label:'待审批合同',value:6,ic:'check'},
        {tone:'sky',key:'saleOrder',label:'待处理订单',value:18,ic:'cart'},
        {tone:'rose',key:'customer',label:'待审核客户',value:4,ic:'user'},
        {tone:'lilac',key:'outbound',label:'待出库订单',value:12,ic:'list'},
        {tone:'sand',key:'sret',label:'待处理退货',value:3,ic:'flow'},
      ],
      moreKpis: [
        {tone:'sky',key:'payment',label:'待回款提醒',value:11,ic:'search'},
        {tone:'mint',key:'invoice',label:'待开票记录',value:7,ic:'doc'},
        {tone:'peach',key:'visit',label:'客户拜访计划',value:5,ic:'user'},
        {tone:'rose',key:'overdue',label:'逾期未回款',value:2,ic:'edit'},
        {tone:'lilac',key:'sample',label:'样品跟进',value:8,ic:'cube'},
        {tone:'sand',key:'forecast',label:'销售预测',value:14,ic:'list'},
      ],
      navTiles: [
        {label:'客户',sub:'客户管理',n:238,tint:'#DCE7FB',fg:'#5677FC',ic:'user'},
        {label:'计划',sub:'销售计划',n:12,tint:'#DBF3E6',fg:'#10B981',ic:'list'},
        {label:'报价',sub:'报价管理',n:46,tint:'#DCE7FB',fg:'#5677FC',ic:'doc'},
        {label:'合同',sub:'合同管理',n:32,tint:'#DCE7FB',fg:'#5677FC',ic:'check'},
        {label:'订单',sub:'订单管理',n:78,tint:'#DCE7FB',fg:'#5677FC',ic:'cart'},
        {label:'退货',sub:'销售退货',n:5,tint:'#FBDFDF',fg:'#D14D4D',ic:'flow'},
        {label:'换货',sub:'销售换货',n:2,tint:'#E8DEFB',fg:'#8957D8',ic:'edit'},
        {label:'报表',sub:'销售报表',n:0,tint:'#DBF3E6',fg:'#10B981',ic:'search'},
        {label:'回款',sub:'支付记录',n:19,tint:'#FEF3CD',fg:'#B26A24',ic:'list'},
      ],
      entries: [
        {label:'新增客户',tint:'#DCE7FB',fg:'#5677FC',ic:'user'},
        {label:'制定计划',tint:'#DBF3E6',fg:'#10B981',ic:'list'},
        {label:'新增报价',tint:'#DCE7FB',fg:'#5677FC',ic:'doc'},
        {label:'新增合同',tint:'#DCE7FB',fg:'#5677FC',ic:'check'},
        {label:'销售订单',tint:'#DCE7FB',fg:'#5677FC',ic:'cart'},
        {label:'我的审批',tint:'#DCE7FB',fg:'#5677FC',ic:'list'},
      ],
    },
  },
  as: {
    title: '售后中心',
    sideItems: [
      {k:'workbench', label:'工作台'},
      {k:'asService', label:'售后工单'},
      {k:'asRefundExchange', label:'退换退款'},
      {k:'asDispatch', label:'服务派工'},
      {k:'asQuality', label:'质量闭环'},
      {k:'asConfig', label:'基础设置'},
    ],
    flyouts: {
      asService:{sections:[{title:'售后工单',items:['新增售后','售后列表','售后详情','售后统计']},{title:'工单规则',items:['售后自定义字段','售后自定义编号','售后审批设置','售后策略设置','设置售后打印模板']}]},
      asRefundExchange:{sections:[{title:'退换退款',items:['新增退换货','退换货列表','退换货审核']},{title:'处理类型',items:['退款退货','仅退款','换货','仅退货']}]},
      asRefundReturn:{sections:[{title:'退款退货',items:['新增退款退货','退款退货列表','处理流程-仓库','处理流程-财务']},{title:'退款退货设置',items:['退换货自定义字段','退换货自定义编号','退换货审批设置','退换货策略设置','设置退换货打印模板']}]},
      asRefundOnly:{sections:[{title:'仅退款',items:['新增仅退款','仅退款列表','处理流程-财务']},{title:'仅退款设置',items:['退换货自定义字段','退换货自定义编号','退换货审批设置','退换货策略设置','设置退换货打印模板']}]},
      asExchange:{sections:[{title:'换货',items:['新增换货','换货列表','处理流程-仓库-入库','处理流程-仓库-出库']},{title:'换货设置',items:['退换货自定义字段','退换货自定义编号','退换货审批设置','退换货策略设置','设置退换货打印模板']}]},
      asReturnOnly:{sections:[{title:'仅退货',items:['新增仅退货','仅退货列表','处理流程-仓库','处理流程-财务']},{title:'仅退货设置',items:['退换货自定义字段','退换货自定义编号','退换货审批设置','退换货策略设置','设置退换货打印模板']}]},
      asDispatch:{sections:[{title:'服务派工',items:['新增售后派单','售后派单','售后处理','派单信息']},{title:'服务规则',items:['售后自定义字段','售后自定义编号','售后审批设置','售后策略设置','设置售后打印模板']}]},
      asConfig:{sections:[{title:'基础设置',items:['售后原因','投诉问题','售后类型','问题类型','处理方式']},{title:'规则设置',items:['售后配置自定义字段','售后配置自定义编号','售后配置审批设置','售后配置策略设置','设置售后配置打印模板']}]},
      asQuality:{sections:[{title:'质量闭环',items:['新增质量改进','质量改进列表','问题追踪','改善验证']},{title:'质改规则',items:['质量改进自定义字段','质量改进自定义编号','质量改进审批设置','质量改进策略设置','设置质量改进打印模板']}]},
    },
    workbench: {
      kpis: [
        {tone:'peach',key:'asService',label:'待处理工单',value:18,ic:'doc'},
        {tone:'mint',key:'asRefundExchange',label:'待审核退换退款',value:9,ic:'flow'},
        {tone:'sky',key:'asDispatch',label:'待派单',value:12,ic:'user'},
        {tone:'rose',key:'asRefundReturn',label:'待财务退款',value:5,ic:'cart'},
        {tone:'lilac',key:'asExchange',label:'待仓库换货',value:7,ic:'list'},
        {tone:'sand',key:'asQuality',label:'待质量闭环',value:4,ic:'check'},
      ],
      moreKpis: [
        {tone:'sky',key:'overdue',label:'超时未处理',value:3,ic:'flow'},
        {tone:'mint',key:'return',label:'待退货入库',value:8,ic:'list'},
        {tone:'peach',key:'refundOnly',label:'仅退款申请',value:6,ic:'doc'},
        {tone:'rose',key:'complaint',label:'客户投诉',value:2,ic:'edit'},
        {tone:'lilac',key:'visit',label:'上门服务',value:5,ic:'user'},
        {tone:'sand',key:'reason',label:'待完善原因',value:1,ic:'search'},
      ],
      navTiles: [
        {label:'工单',sub:'受理、SLA、关闭',n:128,tint:'#DCE7FB',fg:'#5677FC',ic:'doc'},
        {label:'退换退款',sub:'退货、退款、换货',n:26,tint:'#DCE7FB',fg:'#5677FC',ic:'flow'},
        {label:'派工',sub:'上门、维修、回访',n:12,tint:'#DBF3E6',fg:'#10B981',ic:'user'},
        {label:'质量',sub:'8D、CAPA、验证',n:4,tint:'#F6EFD9',fg:'#6D5818',ic:'check'},
        {label:'设置',sub:'原因、类型、策略',n:5,tint:'#DCE7FB',fg:'#5677FC',ic:'edit'},
      ],
      entries: [
        {label:'新增售后',tint:'#DCE7FB',fg:'#5677FC',ic:'doc'},
        {label:'发起退换退款',tint:'#DCE7FB',fg:'#5677FC',ic:'flow'},
        {label:'售后派单',tint:'#DCE7FB',fg:'#5677FC',ic:'user'},
        {label:'退款审核',tint:'#DCE7FB',fg:'#5677FC',ic:'cart'},
        {label:'质量闭环',tint:'#DCE7FB',fg:'#5677FC',ic:'check'},
      ],
    },
  },
  wh: {
    title: '仓储中心',
    sideItems: [
      {k:'workbench',label:'工作台'},
      {k:'stockManage',label:'库存管理'},
      {k:'outbound',label:'出库管理'},
      {k:'inbound',label:'入库管理'},
      {k:'transfer',label:'调拨管理'},
      {k:'inventoryCheck',label:'盘点管理'},
      {k:'outboundQc',label:'出库质检'},
      {k:'incomingQc',label:'来料质检'},
      {k:'warehouseLocation',label:'仓库库位'},
    ],
    flyouts: {
      stockManage:{sections:[{title:'库存管理',items:['库存列表','库存明细','库存调整','库存流水']},{title:'库存设置',items:['库存自定义字段','库存自定义编号','库存审批设置','库存策略设置']}]},
      outbound:{sections:[{title:'出库管理',items:['直接出库','全部出库单','待出库单','待出库明细','待申请发货']},{title:'出库设置',items:['出库自定义字段','出库自定义编号','出库审批设置','出库策略设置','设置出库打印模板']}]},
      inbound:{sections:[{title:'入库管理',items:['直接入库','全部入库单','待入库单','待入库明细']},{title:'入库设置',items:['入库自定义字段','入库自定义编号','入库审批设置','入库策略设置','设置入库打印模板']}]},
      transfer:{sections:[{title:'调拨管理',items:['新增调拨','调拨列表','调拨明细表']},{title:'调拨设置',items:['调拨自定义字段','调拨自定义编号','调拨审批设置','调拨策略设置','设置调拨打印模板']}]},
      inventoryCheck:{sections:[{title:'盘点管理',items:['直接盘点','盘点计划','所有盘点单']},{title:'盘点设置',items:['盘点自定义字段','盘点自定义编号','盘点审批设置','盘点策略设置','设置盘点打印模板']}]},
      outboundQc:{sections:[{title:'出库质检',items:['新增出库质检','出库质检列表']},{title:'出库质检设置',items:['出库质检自定义字段','出库质检自定义编号','出库质检审批设置','出库质检策略设置','设置出库质检打印模板']}]},
      incomingQc:{sections:[{title:'来料质检',items:['新增来料质检','来料质检列表']},{title:'来料质检设置',items:['来料质检自定义字段','来料质检自定义编号','来料质检审批设置','来料质检策略设置','设置来料质检打印模板']}]},
      warehouseLocation:{sections:[{title:'仓库库位',items:['新增','库位列表']},{title:'仓库库位设置',items:['仓库库位自定义字段','仓库库位自定义编号','仓库库位审批设置','仓库库位策略设置']}]},
    },
    workbench:{
      kpis:[{tone:'peach',key:'inbound',label:'待入库通知',value:18,ic:'list'},{tone:'mint',key:'outbound',label:'待出库通知',value:22,ic:'flow'},{tone:'sky',key:'check',label:'待盘点计划',value:3,ic:'search'},{tone:'rose',key:'alert',label:'库存预警',value:9,ic:'edit'},{tone:'lilac',key:'transfer',label:'待调拨确认',value:5,ic:'cart'},{tone:'sand',key:'quality',label:'待质检物料',value:14,ic:'doc'}],
      moreKpis:[{tone:'sky',key:'overstock',label:'呆滞物料',value:32,ic:'list'},{tone:'mint',key:'shortage',label:'缺货物料',value:7,ic:'cart'},{tone:'peach',key:'expire',label:'临期物料',value:12,ic:'doc'},{tone:'rose',key:'damage',label:'报损物料',value:3,ic:'edit'},{tone:'lilac',key:'borrow',label:'借出未还',value:4,ic:'user'},{tone:'sand',key:'count',label:'盘点差异',value:8,ic:'check'}],
      navTiles:[{label:'入库',sub:'入库管理',n:45,tint:'#DCE7FB',fg:'#5677FC',ic:'list'},{label:'出库',sub:'出库管理',n:38,tint:'#DCE7FB',fg:'#5677FC',ic:'flow'},{label:'库存',sub:'库存查询',n:1250,tint:'#DCE7FB',fg:'#5677FC',ic:'search'},{label:'盘点',sub:'盘点管理',n:3,tint:'#FEF3CD',fg:'#B26A24',ic:'check'},{label:'调拨',sub:'调拨管理',n:7,tint:'#DBF3E6',fg:'#10B981',ic:'cart'},{label:'库位',sub:'库位管理',n:280,tint:'#E8DEFB',fg:'#8957D8',ic:'folder'},{label:'质检',sub:'质量检验',n:14,tint:'#FBDFDF',fg:'#D14D4D',ic:'edit'},{label:'报表',sub:'库存报表',n:0,tint:'#F6EFD9',fg:'#6D5818',ic:'doc'}],
      entries:[{label:'采购入库',tint:'#DCE7FB',fg:'#5677FC',ic:'list'},{label:'销售出库',tint:'#DCE7FB',fg:'#5677FC',ic:'flow'},{label:'库存查询',tint:'#DCE7FB',fg:'#5677FC',ic:'search'},{label:'盘点计划',tint:'#DCE7FB',fg:'#5677FC',ic:'check'},{label:'物料调拨',tint:'#DCE7FB',fg:'#5677FC',ic:'cart'}]}},
  prod: {
    title: '产品中心',
    sideItems: [{k:'workbench',label:'工作台'},{k:'product',label:'产品管理'},{k:'category',label:'产品分类'},{k:'bom',label:'BOM 管理'},{k:'doc',label:'产品文档'},{k:'change',label:'产品变更'}],
    flyouts: {
      product:{sections:[{title:'产品管理',items:['新增产品','产品列表','产品详情']},{title:'产品设置',items:['产品编号','产品属性','审批流程','自定义字段']}]},
      category:{sections:[{title:'产品分类',items:['分类管理','属性模板']},{title:'分类设置',items:['分类编码','层级设置']}]},
      bom:{sections:[{title:'BOM 管理',items:['新增 BOM','BOM 列表','BOM 对比']},{title:'BOM 设置',items:['BOM 编号','审批流程','版本管理']}]},
      doc:{sections:[{title:'产品文档',items:['新增文档','文档列表']},{title:'文档设置',items:['文档编号','文档分类','审批流程']}]},
      change:{sections:[{title:'产品变更',items:['新增变更','变更列表','变更历史']},{title:'变更设置',items:['变更编号','审批流程','通知设置']}]}},
    workbench:{
      kpis:[{tone:'peach',key:'product',label:'待审批产品',value:8,ic:'cube'},{tone:'mint',key:'bom',label:'待审批 BOM',value:6,ic:'list'},{tone:'sky',key:'change',label:'待审批变更',value:4,ic:'edit'},{tone:'rose',key:'doc',label:'待完善文档',value:15,ic:'doc'},{tone:'lilac',key:'review',label:'待评审产品',value:3,ic:'check'},{tone:'sand',key:'sample',label:'打样中产品',value:5,ic:'folder'}],
      moreKpis:[{tone:'sky',key:'new',label:'新产品立项',value:2,ic:'cube'},{tone:'mint',key:'stop',label:'待停产产品',value:1,ic:'list'},{tone:'peach',key:'price',label:'待定价产品',value:7,ic:'doc'},{tone:'rose',key:'quality',label:'质量异常',value:3,ic:'edit'},{tone:'lilac',key:'patent',label:'专利申请',value:2,ic:'user'},{tone:'sand',key:'cost',label:'成本核算',value:12,ic:'check'}],
      navTiles:[{label:'产品',sub:'产品管理',n:86,tint:'#DCE7FB',fg:'#5677FC',ic:'cube'},{label:'分类',sub:'产品分类',n:12,tint:'#DCE7FB',fg:'#5677FC',ic:'folder'},{label:'BOM',sub:'物料清单',n:45,tint:'#DCE7FB',fg:'#5677FC',ic:'list'},{label:'文档',sub:'产品文档',n:32,tint:'#FEF3CD',fg:'#B26A24',ic:'doc'},{label:'变更',sub:'产品变更',n:18,tint:'#DBF3E6',fg:'#10B981',ic:'edit'},{label:'工艺',sub:'生产工艺',n:24,tint:'#E8DEFB',fg:'#8957D8',ic:'flow'},{label:'标准',sub:'质量标准',n:8,tint:'#FBDFDF',fg:'#D14D4D',ic:'check'},{label:'统计',sub:'产品统计',n:0,tint:'#F6EFD9',fg:'#6D5818',ic:'search'}],
      entries:[{label:'新增产品',tint:'#DCE7FB',fg:'#5677FC',ic:'cube'},{label:'管理 BOM',tint:'#DCE7FB',fg:'#5677FC',ic:'list'},{label:'产品变更',tint:'#DCE7FB',fg:'#5677FC',ic:'edit'},{label:'查看文档',tint:'#DCE7FB',fg:'#5677FC',ic:'doc'},{label:'我的审批',tint:'#DCE7FB',fg:'#5677FC',ic:'check'}]}},
  des: {
    title: '设计中心',
    sideItems: [{k:'workbench',label:'工作台'},{k:'task',label:'设计任务'},{k:'drawing',label:'图纸管理'},{k:'review',label:'设计评审'},{k:'change',label:'设计变更'},{k:'spec',label:'设计规范'}],
    flyouts: {
      task:{sections:[{title:'设计任务',items:['新增任务','任务列表','任务看板']},{title:'任务设置',items:['任务编号','任务分类','审批流程']}]},
      drawing:{sections:[{title:'图纸管理',items:['上传图纸','图纸列表','版本对比']},{title:'图纸设置',items:['图纸编号','图纸分类','权限设置']}]},
      review:{sections:[{title:'设计评审',items:['发起评审','评审列表','评审记录']},{title:'评审设置',items:['评审流程','评审模板']}]},
      change:{sections:[{title:'设计变更',items:['新增变更','变更列表']},{title:'变更设置',items:['变更编号','审批流程']}]},
      spec:{sections:[{title:'设计规范',items:['规范文档','标准图框']},{title:'规范设置',items:['规范编号','规范分类']}]}},
    workbench:{
      kpis:[{tone:'peach',key:'task',label:'待处理设计任务',value:12,ic:'edit'},{tone:'mint',key:'drawing',label:'待审核图纸',value:20,ic:'doc'},{tone:'sky',key:'review',label:'待评审设计',value:5,ic:'check'},{tone:'rose',key:'change',label:'待审批变更',value:3,ic:'flow'},{tone:'lilac',key:'urgent',label:'紧急设计需求',value:2,ic:'folder'},{tone:'sand',key:'delay',label:'逾期未完成',value:7,ic:'list'}],
      moreKpis:[{tone:'sky',key:'new',label:'新立项设计',value:4,ic:'edit'},{tone:'mint',key:'prototype',label:'打样中',value:6,ic:'cube'},{tone:'peach',key:'test',label:'测试中',value:3,ic:'search'},{tone:'rose',key:'reject',label:'评审退回',value:2,ic:'flow'},{tone:'lilac',key:'archive',label:'待归档',value:15,ic:'doc'},{tone:'sand',key:'external',label:'外部协作',value:1,ic:'user'}],
      navTiles:[{label:'任务',sub:'设计任务',n:34,tint:'#DCE7FB',fg:'#5677FC',ic:'edit'},{label:'图纸',sub:'图纸管理',n:128,tint:'#DCE7FB',fg:'#5677FC',ic:'doc'},{label:'评审',sub:'设计评审',n:8,tint:'#DCE7FB',fg:'#5677FC',ic:'check'},{label:'变更',sub:'设计变更',n:11,tint:'#FBDFDF',fg:'#D14D4D',ic:'flow'},{label:'规范',sub:'设计规范',n:22,tint:'#DBF3E6',fg:'#10B981',ic:'folder'},{label:'BOM',sub:'设计 BOM',n:36,tint:'#E8DEFB',fg:'#8957D8',ic:'list'},{label:'人员',sub:'设计人员',n:18,tint:'#FEF3CD',fg:'#B26A24',ic:'user'},{label:'统计',sub:'设计统计',n:0,tint:'#F6EFD9',fg:'#6D5818',ic:'search'}],
      entries:[{label:'新建设计任务',tint:'#DCE7FB',fg:'#5677FC',ic:'edit'},{label:'上传图纸',tint:'#DCE7FB',fg:'#5677FC',ic:'upload'},{label:'发起评审',tint:'#DCE7FB',fg:'#5677FC',ic:'check'},{label:'设计变更',tint:'#DCE7FB',fg:'#5677FC',ic:'flow'},{label:'我的审批',tint:'#DCE7FB',fg:'#5677FC',ic:'doc'}]}},
  mfg: {
    title: '生产中心',
    sideItems: [{k:'workbench',label:'工作台'},{k:'mfgDemand',label:'生产需求'},{k:'mfgPlan',label:'生产计划'},{k:'mfgOrder',label:'生产订单'},{k:'mfgWorkOrder',label:'生产工单'},{k:'mfgSchedule',label:'生产排班'},{k:'mfgOutsource',label:'委外加工'}],
    flyouts: {
      mfgDemand:{sections:[{title:'生产需求',items:['新增生产需求','生产需求列表','生产需求汇总']},{title:'生产需求设置',items:['生产需求自定义字段','生产需求自定义编号','生产需求审批设置','生产需求策略设置']}]},
      mfgPlan:{sections:[{title:'生产计划',items:['新增生产计划','生产计划列表']},{title:'生产计划设置',items:['生产计划自定义字段','生产计划自定义编号','生产计划审批设置','生产计划策略设置','设置生产计划打印模板']}]},
      mfgOrder:{sections:[{title:'生产订单',items:['新增生产订单','生产订单列表']},{title:'生产订单设置',items:['生产订单自定义字段','生产订单自定义编号','生产订单审批设置','生产订单策略设置','设置生产订单打印模板']}]},
      mfgWorkOrder:{sections:[{title:'生产工单',items:['新增生产工单','生产工单列表']},{title:'报工管理',items:['领工派工','任务报工','报工记录']},{title:'生产工单设置',items:['生产工单自定义字段','生产工单自定义编号','生产工单审批设置','生产工单策略设置','设置生产工单打印模板']}]},
      mfgSchedule:{sections:[{title:'生产排班',items:['排班列表','排班计划','生产班组','工作日历','班次管理']},{title:'生产排班设置',items:['排班自定义字段','排班自定义编号','排班审批设置','生产排班策略设置','设置生产排班打印模板']}]},
      mfgOutsource:{sections:[{title:'委外加工',items:['新增委外加工','委外加工列表','委外发料','委外入库']},{title:'委外加工设置',items:['委外加工自定义字段','委外加工自定义编号','委外加工审批设置','委外加工策略设置','设置委外加工打印模板']}]},
    },
    workbench:{
      kpis:[{tone:'peach',key:'mfgDemand',label:'待确认生产需求',value:18,ic:'doc'},{tone:'mint',key:'mfgPlan',label:'待审批生产计划',value:6,ic:'folder'},{tone:'sky',key:'mfgOrder',label:'进行中生产订单',value:28,ic:'list'},{tone:'rose',key:'delay',label:'延期生产订单',value:5,ic:'flow'},{tone:'lilac',key:'mfgWorkOrder',label:'待报工生产工单',value:18,ic:'edit'},{tone:'sand',key:'mfgOutsource',label:'委外待入库',value:9,ic:'cube'}],
      moreKpis:[{tone:'sky',key:'urgent',label:'紧急插单需求',value:3,ic:'list'},{tone:'mint',key:'material',label:'缺料生产工单',value:4,ic:'cart'},{tone:'peach',key:'source',label:'销售订单来源计划',value:7,ic:'doc'},{tone:'rose',key:'rework',label:'返工生产订单',value:7,ic:'flow'},{tone:'lilac',key:'outsource',label:'委外加工中',value:12,ic:'user'},{tone:'sand',key:'efficiency',label:'效率低于标准',value:3,ic:'search'}],
      navTiles:[{label:'需求',sub:'生产需求',n:18,tint:'#DCE7FB',fg:'#5677FC',ic:'doc'},{label:'计划',sub:'生产计划',n:12,tint:'#DCE7FB',fg:'#5677FC',ic:'folder'},{label:'订单',sub:'生产订单',n:56,tint:'#DCE7FB',fg:'#5677FC',ic:'list'},{label:'工单',sub:'生产工单',n:48,tint:'#DBF3E6',fg:'#10B981',ic:'edit'},{label:'委外',sub:'委外加工',n:22,tint:'#E8DEFB',fg:'#8957D8',ic:'cube'},{label:'领料',sub:'领退料记录',n:34,tint:'#FEF3CD',fg:'#B26A24',ic:'cart'},{label:'入库',sub:'成品入库记录',n:9,tint:'#FBDFDF',fg:'#D14D4D',ic:'check'},{label:'看板',sub:'生产进度看板',n:0,tint:'#F6EFD9',fg:'#6D5818',ic:'search'}],
      entries:[{label:'新增生产需求',tint:'#DCE7FB',fg:'#5677FC',ic:'doc'},{label:'新增生产计划',tint:'#DCE7FB',fg:'#5677FC',ic:'folder'},{label:'新增生产订单',tint:'#DCE7FB',fg:'#5677FC',ic:'list'},{label:'新增生产工单',tint:'#DCE7FB',fg:'#5677FC',ic:'edit'},{label:'新增委外加工',tint:'#DCE7FB',fg:'#5677FC',ic:'cube'}]}},
  qc: {
    title: '质检中心',
    sideItems: [
      {k:'workbench',label:'工作台'},
      {k:'qcDashboard',label:'质检总览'},
      {k:'qcIqc',label:'检验执行'},
      {k:'qcException',label:'异常与处置'},
      {k:'qcPlan',label:'标准与配置'},
      {k:'qcReport',label:'质量分析'},
    ],
    flyouts: {
      qcDashboard:{sections:[{title:'质检总览',items:['质量看板','异常记录','待处理区域','趋势分析']},{title:'总览规则',items:['质检自定义字段','质检自定义编号','质检审批设置','质检策略设置','设置质检打印模板']}]},
      qcIqc:{sections:[{title:'检验执行',items:['新增检验任务','检验任务列表','待检任务','抽样记录']},{title:'检验阶段',items:['来料检验 IQC','过程检验 IPQC','成品检验 FQC','出货检验 OQC']}]},
      qcException:{sections:[{title:'异常与处置',items:['不合格记录','隔离/拒收','返工复检','让步放行','CAPA/8D']},{title:'处置规则',items:['质检审批设置','质检策略设置','设置质检打印模板']}]},
      qcIpqc:{sections:[{title:'过程质检 IPQC',items:['新增过程质检','过程质检列表','巡检记录','工序异常']},{title:'IPQC设置',items:['质检自定义字段','质检自定义编号','质检审批设置','质检策略设置','设置质检打印模板']}]},
      qcFqc:{sections:[{title:'成品质检 FQC',items:['新增成品质检','成品质检列表','完工检验','返工复检']},{title:'FQC设置',items:['质检自定义字段','质检自定义编号','质检审批设置','质检策略设置','设置质检打印模板']}]},
      qcOqc:{sections:[{title:'出货质检 OQC',items:['新增出货质检','出货质检列表','待出货检验','客户验货']},{title:'OQC设置',items:['质检自定义字段','质检自定义编号','质检审批设置','质检策略设置','设置质检打印模板']}]},
      qcPlan:{sections:[{title:'标准与配置',items:['新增检验标准','检验方案','检验项目','抽样规则']},{title:'资源授权',items:['检验组/授权','缺陷等级','判定规格','资质授权']}]},
      qcItem:{sections:[{title:'检验项目',items:['新增项目','项目列表','启用项目','已停用项目']},{title:'项目设置',items:['检验项目自定义字段','检验项目自定义编号','检验项目审批设置','检验项目策略设置','设置检验项目打印模板']}]},
      qcGroup:{sections:[{title:'检验资源',items:['新增检验组','检验组列表','成员维护','资质授权']},{title:'资源规则',items:['检验组自定义字段','检验组自定义编号','检验组审批设置','检验组策略设置','设置检验组打印模板']}]},
      qcReport:{sections:[{title:'质量分析',items:['质量趋势','不良分析','供应商质量','工序质量','客户质量']},{title:'分析设置',items:['质检自定义字段','质检自定义编号','设置质检打印模板']}]},
    },
    workbench:{
      kpis:[{tone:'peach',key:'qcTodo',label:'待检任务',value:28,ic:'list',moduleKey:'qcIqc',action:'待检任务'},{tone:'mint',key:'qcPatrol',label:'过程巡检',value:16,ic:'check',moduleKey:'qcIqc',action:'过程检验 IPQC'},{tone:'sky',key:'qcFqcTodo',label:'待完工检验',value:12,ic:'cube',moduleKey:'qcIqc',action:'成品检验 FQC'},{tone:'rose',key:'qcExceptionTodo',label:'待处置异常',value:7,ic:'flow',moduleKey:'qcException',action:'不合格记录'},{tone:'lilac',key:'qcStandardActive',label:'启用检验标准',value:32,ic:'doc',moduleKey:'qcPlan',action:'检验方案'},{tone:'sand',key:'qcGroupAuth',label:'检验组授权',value:6,ic:'user',moduleKey:'qcPlan',action:'检验组/授权'}],
      moreKpis:[{tone:'sky',key:'oqc',label:'待出货检验',value:9,ic:'cart'},{tone:'mint',key:'pass',label:'本月合格率',value:96,ic:'check'},{tone:'peach',key:'supplier',label:'供应商异常',value:4,ic:'user'},{tone:'rose',key:'recheck',label:'待复检',value:5,ic:'edit'},{tone:'lilac',key:'item',label:'检验项目',value:128,ic:'list'},{tone:'sand',key:'report',label:'待生成报告',value:8,ic:'doc'}],
      navTiles:[{label:'总览',sub:'质量看板、异常预警',n:128,tint:'#DCE7FB',fg:'#5677FC',ic:'search',moduleKey:'qcDashboard',action:'质量看板'},{label:'执行',sub:'IQC/IPQC/FQC/OQC',n:65,tint:'#DCE7FB',fg:'#5677FC',ic:'list',moduleKey:'qcIqc',action:'检验任务列表'},{label:'异常',sub:'隔离、复检、CAPA',n:7,tint:'#FBDFDF',fg:'#D14D4D',ic:'flow',moduleKey:'qcException',action:'不合格记录'},{label:'标准',sub:'方案、项目、抽样、授权',n:32,tint:'#DBF3E6',fg:'#10B981',ic:'doc',moduleKey:'qcPlan',action:'检验方案'},{label:'分析',sub:'趋势、不良、供应商',n:8,tint:'#FEF3CD',fg:'#B26A24',ic:'search',moduleKey:'qcReport',action:'质量趋势'}],
      entries:[{label:'新增检验任务',moduleKey:'qcIqc',action:'新增检验任务',tint:'#DCE7FB',fg:'#5677FC',ic:'list'},{label:'异常处置',moduleKey:'qcException',action:'不合格记录',tint:'#DCE7FB',fg:'#5677FC',ic:'check'},{label:'新增检验标准',moduleKey:'qcPlan',action:'新增检验标准',tint:'#DCE7FB',fg:'#5677FC',ic:'doc'},{label:'维护项目库',moduleKey:'qcPlan',action:'检验项目',tint:'#DCE7FB',fg:'#5677FC',ic:'edit'},{label:'质量分析',moduleKey:'qcReport',action:'质量趋势',tint:'#DCE7FB',fg:'#5677FC',ic:'search'}]}},
  fin: {
    title: '财务中心',
    sideItems: [{k:'workbench',label:'工作台'},{k:'financeAr',label:'应收管理'},{k:'financeAp',label:'应付管理'},{k:'financeInvoice',label:'发票管理'},{k:'financeFund',label:'资金管理'},{k:'financeExpense',label:'费用报销'},{k:'financeCost',label:'成本核算'},{k:'financeVoucher',label:'凭证管理'},{k:'financeReport',label:'财务报表'}],
    flyouts: {
      financeAr:{sections:[{title:'应收管理',items:['新增应收','应收列表','收款登记','客户对账']},{title:'应收设置',items:['应收自定义字段','应收自定义编号','应收审批设置','应收策略设置','设置应收打印模板']}]},
      financeAp:{sections:[{title:'应付管理',items:['新增应付','应付列表','付款申请','供应商对账']},{title:'应付设置',items:['应付自定义字段','应付自定义编号','应付审批设置','应付策略设置','设置应付打印模板']}]},
      financeInvoice:{sections:[{title:'发票管理',items:['新增发票','发票列表','开票管理','收票认证']},{title:'发票设置',items:['发票自定义字段','发票自定义编号','发票审批设置','发票策略设置','设置发票打印模板']}]},
      financeFund:{sections:[{title:'资金管理',items:['新增资金流水','资金流水列表','账户余额','资金调拨']},{title:'资金设置',items:['资金自定义字段','资金自定义编号','资金审批设置','资金策略设置','设置资金打印模板']}]},
      financeExpense:{sections:[{title:'费用报销',items:['新增报销','报销列表','费用付款','费用统计']},{title:'费用设置',items:['费用自定义字段','费用自定义编号','费用审批设置','费用策略设置','设置费用打印模板']}]},
      financeCost:{sections:[{title:'成本核算',items:['新增核算单','核算列表','成本分摊','成本分析']},{title:'成本设置',items:['成本自定义字段','成本自定义编号','成本审批设置','成本策略设置','设置成本打印模板']}]},
      financeVoucher:{sections:[{title:'凭证管理',items:['新增凭证','凭证列表','凭证审核','期末结账']},{title:'凭证设置',items:['凭证自定义字段','凭证自定义编号','凭证审批设置','凭证策略设置','设置凭证打印模板']}]},
      financeReport:{sections:[{title:'财务报表',items:['新增报表','报表列表','资产负债表','利润表','现金流量表']},{title:'报表设置',items:['财务报表自定义字段','财务报表自定义编号','财务报表审批设置','财务报表策略设置','设置财务报表打印模板']}]}},
    workbench:{
      kpis:[{tone:'peach',key:'financeAr',label:'逾期应收账款',value:15,ic:'doc'},{tone:'mint',key:'financeAp',label:'待付应付账款',value:22,ic:'list'},{tone:'sky',key:'financeInvoice',label:'待开发票',value:8,ic:'edit'},{tone:'rose',key:'financeFund',label:'资金异常提醒',value:3,ic:'flow'},{tone:'lilac',key:'financeVoucher',label:'待审核凭证',value:45,ic:'folder'},{tone:'sand',key:'financeCost',label:'成本异常',value:2,ic:'search'}],
      moreKpis:[{tone:'sky',key:'reconcile',label:'待对账',value:12,ic:'check'},{tone:'mint',key:'reimburse',label:'待审批报销',value:18,ic:'user'},{tone:'peach',key:'advance',label:'预付款项',value:9,ic:'cart'},{tone:'rose',key:'overdue',label:'超期未收',value:7,ic:'doc'},{tone:'lilac',key:'tax',label:'待报税',value:1,ic:'edit'},{tone:'sand',key:'close',label:'待结账期间',value:1,ic:'list'}],
      navTiles:[{label:'应收',sub:'应收管理',n:86,tint:'#DCE7FB',fg:'#5677FC',ic:'doc'},{label:'应付',sub:'应付管理',n:62,tint:'#DCE7FB',fg:'#5677FC',ic:'list'},{label:'发票',sub:'发票管理',n:34,tint:'#DBF3E6',fg:'#10B981',ic:'edit'},{label:'资金',sub:'资金管理',n:0,tint:'#F6EFD9',fg:'#6D5818',ic:'flow'},{label:'费用',sub:'费用报销',n:18,tint:'#FBDFDF',fg:'#D14D4D',ic:'user'},{label:'成本',sub:'成本核算',n:0,tint:'#FEF3CD',fg:'#B26A24',ic:'search'},{label:'凭证',sub:'凭证管理',n:156,tint:'#DCE7FB',fg:'#5677FC',ic:'folder'},{label:'报表',sub:'财务报表',n:12,tint:'#E8DEFB',fg:'#8957D8',ic:'check'}],
      entries:[{label:'录入凭证',tint:'#DCE7FB',fg:'#5677FC',ic:'edit'},{label:'应收对账',tint:'#DCE7FB',fg:'#5677FC',ic:'doc'},{label:'应付审批',tint:'#DCE7FB',fg:'#5677FC',ic:'list'},{label:'查看报表',tint:'#DCE7FB',fg:'#5677FC',ic:'search'},{label:'费用报销',tint:'#DCE7FB',fg:'#5677FC',ic:'user'}]}},
  hr: {
    title: '人力中心',
    sideItems: [{k:'workbench',label:'工作台'},{k:'hrEmployee',label:'员工管理'},{k:'hrOrg',label:'组织机构'},{k:'hrPosition',label:'岗位管理'},{k:'hrAttendance',label:'考勤管理'},{k:'hrSchedule',label:'排班管理'},{k:'hrPayroll',label:'薪酬管理'},{k:'hrArchive',label:'档案管理'},{k:'hrOffice',label:'人事办公'}],
    flyouts: {
      hrEmployee:{sections:[{title:'员工管理',items:['新增员工','员工列表','入职管理','离职管理','异动管理']},{title:'员工设置',items:['员工自定义字段','员工自定义编号','员工审批设置','员工策略设置','设置员工打印模板']}]},
      hrOrg:{sections:[{title:'组织机构',items:['新增组织','组织列表','组织架构','部门编制']},{title:'组织设置',items:['组织自定义字段','组织自定义编号','组织审批设置','组织策略设置','设置组织打印模板']}]},
      hrPosition:{sections:[{title:'岗位管理',items:['新增岗位','岗位列表','岗位说明书','岗位编制']},{title:'岗位设置',items:['岗位自定义字段','岗位自定义编号','岗位审批设置','岗位策略设置','设置岗位打印模板']}]},
      hrAttendance:{sections:[{title:'考勤管理',items:['新增考勤','考勤列表','考勤记录','考勤统计']},{title:'考勤设置',items:['考勤自定义字段','考勤自定义编号','考勤审批设置','考勤策略设置','设置考勤打印模板']}]},
      hrSchedule:{sections:[{title:'排班管理',items:['新增排班','排班列表','班次管理','考勤组管理','考勤日历']},{title:'排班设置',items:['排班自定义字段','排班自定义编号','排班审批设置','排班策略设置','设置排班打印模板']}]},
      hrPayroll:{sections:[{title:'薪酬管理',items:['新增薪酬','工资列表','工资详情','薪资方案','薪酬类型','薪酬项目']},{title:'薪酬设置',items:['薪酬自定义字段','薪酬自定义编号','薪酬审批设置','薪酬策略设置','设置薪酬打印模板']}]},
      hrArchive:{sections:[{title:'档案管理',items:['新增档案','档案列表','合同档案','证件档案']},{title:'档案设置',items:['档案自定义字段','档案自定义编号','档案审批设置','档案策略设置','设置档案打印模板']}]},
      hrOffice:{sections:[{title:'人事办公',items:['新增办公申请','办公申请列表','证明开具','物品领用']},{title:'办公设置',items:['人事办公自定义字段','人事办公自定义编号','人事办公审批设置','人事办公策略设置','设置人事办公打印模板']}]}},
    workbench:{
      kpis:[{tone:'peach',key:'hrEmployee',label:'待入职员工',value:6,ic:'user',moduleKey:'hrEmployee',action:'入职管理'},{tone:'mint',key:'hrAttendance',label:'考勤异常',value:18,ic:'check',moduleKey:'hrAttendance',action:'考勤记录'},{tone:'sky',key:'hrSchedule',label:'待排班人员',value:24,ic:'list',moduleKey:'hrSchedule',action:'排班列表'},{tone:'rose',key:'hrPayroll',label:'薪资待核算',value:3,ic:'flow',moduleKey:'hrPayroll',action:'工资列表'},{tone:'lilac',key:'hrArchive',label:'合同到期提醒',value:5,ic:'doc',moduleKey:'hrArchive',action:'合同档案'},{tone:'sand',key:'hrOffice',label:'待审批申请',value:12,ic:'folder',moduleKey:'hrOffice',action:'办公申请列表'}],
      moreKpis:[{tone:'sky',key:'probation',label:'转正提醒',value:6,ic:'check',moduleKey:'hrEmployee',action:'入职管理'},{tone:'mint',key:'overtime',label:'待审批加班',value:15,ic:'list',moduleKey:'hrAttendance',action:'考勤统计'},{tone:'peach',key:'travel',label:'待审批出差',value:3,ic:'cart',moduleKey:'hrOffice',action:'办公申请列表'},{tone:'rose',key:'salary',label:'薪资异常',value:1,ic:'edit',moduleKey:'hrPayroll',action:'工资详情'},{tone:'lilac',key:'cert',label:'证书到期',value:2,ic:'doc',moduleKey:'hrArchive',action:'证件档案'},{tone:'sand',key:'birthday',label:'本月生日',value:8,ic:'user',moduleKey:'hrEmployee',action:'员工列表'}],
      navTiles:[{label:'员工',sub:'员工管理',n:320,tint:'#DCE7FB',fg:'#5677FC',ic:'user',moduleKey:'hrEmployee',action:'员工列表'},{label:'组织',sub:'组织机构',n:24,tint:'#DCE7FB',fg:'#5677FC',ic:'folder',moduleKey:'hrOrg',action:'组织列表'},{label:'岗位',sub:'岗位管理',n:56,tint:'#DCE7FB',fg:'#5677FC',ic:'doc',moduleKey:'hrPosition',action:'岗位列表'},{label:'考勤',sub:'考勤管理',n:28,tint:'#DCE7FB',fg:'#5677FC',ic:'check',moduleKey:'hrAttendance',action:'考勤列表'},{label:'排班',sub:'排班管理',n:12,tint:'#DBF3E6',fg:'#10B981',ic:'list',moduleKey:'hrSchedule',action:'排班列表'},{label:'薪酬',sub:'薪酬管理',n:0,tint:'#FEF3CD',fg:'#B26A24',ic:'flow',moduleKey:'hrPayroll',action:'工资列表'},{label:'档案',sub:'档案管理',n:188,tint:'#FBDFDF',fg:'#D14D4D',ic:'doc',moduleKey:'hrArchive',action:'档案列表'},{label:'办公',sub:'人事办公',n:18,tint:'#E8DEFB',fg:'#8957D8',ic:'edit',moduleKey:'hrOffice',action:'办公申请列表'}],
      entries:[{label:'新增员工',tint:'#DCE7FB',fg:'#5677FC',ic:'user',moduleKey:'hrEmployee',action:'新增员工'},{label:'考勤处理',tint:'#DCE7FB',fg:'#5677FC',ic:'check',moduleKey:'hrAttendance',action:'考勤记录'},{label:'排班维护',tint:'#DCE7FB',fg:'#5677FC',ic:'list',moduleKey:'hrSchedule',action:'班次管理'},{label:'工资核算',tint:'#DCE7FB',fg:'#5677FC',ic:'flow',moduleKey:'hrPayroll',action:'工资列表'},{label:'我的审批',tint:'#DCE7FB',fg:'#5677FC',ic:'doc',moduleKey:'hrOffice',action:'办公申请列表'}]}},
  oa: {
    title: '办公中心',
    sideItems: [{k:'workbench',label:'工作台'},{k:'notice',label:'公告通知'},{k:'approval',label:'流程审批'},{k:'meeting',label:'会议管理'},{k:'doc',label:'公文管理'},{k:'calendar',label:'日程管理'},{k:'car',label:'用车管理'}],
    flyouts: {
      notice:{sections:[{title:'公告通知',items:['发布公告','公告列表','我的公告']},{title:'公告设置',items:['公告分类','发布权限','通知范围']}]},
      approval:{sections:[{title:'流程审批',items:['发起审批','我的审批','审批记录']},{title:'流程设置',items:['流程模板','节点设置','抄送规则']}]},
      meeting:{sections:[{title:'会议管理',items:['预约会议','会议列表','会议纪要']},{title:'会议设置',items:['会议室管理','会议分类']}]},
      doc:{sections:[{title:'公文管理',items:['发文管理','收文管理','公文归档']},{title:'公文设置',items:['公文编号','公文分类','审批流程']}]},
      calendar:{sections:[{title:'日程管理',items:['个人日程','团队日程','日程提醒']},{title:'日程设置',items:['工作日历','提醒设置']}]},
      car:{sections:[{title:'用车管理',items:['用车申请','车辆调度','费用结算']},{title:'用车设置',items:['车辆管理','司机管理','审批流程']}]}},
    workbench:{
      kpis:[{tone:'peach',key:'approval',label:'待我审批',value:12,ic:'edit'},{tone:'mint',key:'meeting',label:'今日会议',value:3,ic:'folder'},{tone:'sky',key:'notice',label:'未读公告',value:5,ic:'doc'},{tone:'rose',key:'urgent',label:'紧急审批',value:2,ic:'flow'},{tone:'lilac',key:'task',label:'待办任务',value:8,ic:'list'},{tone:'sand',key:'calendar',label:'今日日程',value:4,ic:'check'}],
      moreKpis:[{tone:'sky',key:'car',label:'待审批用车',value:3,ic:'cart'},{tone:'mint',key:'doc',label:'待处理公文',value:6,ic:'doc'},{tone:'peach',key:'seal',label:'用章申请',value:2,ic:'edit'},{tone:'rose',key:'overdue',label:'逾期未批',value:1,ic:'flow'},{tone:'lilac',key:'visitor',label:'访客预约',value:1,ic:'user'},{tone:'sand',key:'purchase',label:'办公用品',value:2,ic:'cart'}],
      navTiles:[{label:'公告',sub:'公告通知',n:15,tint:'#DCE7FB',fg:'#5677FC',ic:'doc'},{label:'审批',sub:'流程审批',n:28,tint:'#DCE7FB',fg:'#5677FC',ic:'edit'},{label:'会议',sub:'会议管理',n:8,tint:'#DCE7FB',fg:'#5677FC',ic:'folder'},{label:'公文',sub:'公文管理',n:22,tint:'#DBF3E6',fg:'#10B981',ic:'list'},{label:'日程',sub:'日程管理',n:0,tint:'#FEF3CD',fg:'#B26A24',ic:'check'},{label:'用车',sub:'用车管理',n:5,tint:'#E8DEFB',fg:'#8957D8',ic:'cart'},{label:'印章',sub:'印章管理',n:0,tint:'#FBDFDF',fg:'#D14D4D',ic:'edit'},{label:'用品',sub:'办公用品',n:0,tint:'#F6EFD9',fg:'#6D5818',ic:'flow'}],
      entries:[{label:'发起审批',tint:'#DCE7FB',fg:'#5677FC',ic:'edit'},{label:'预约会议',tint:'#DCE7FB',fg:'#5677FC',ic:'folder'},{label:'查看公告',tint:'#DCE7FB',fg:'#5677FC',ic:'doc'},{label:'工作日程',tint:'#DCE7FB',fg:'#5677FC',ic:'check'},{label:'我的审批',tint:'#DCE7FB',fg:'#5677FC',ic:'list'}]}},
  eq: {
    title: '设备中心',
    sideItems: [{k:'workbench',label:'工作台'},{k:'asset',label:'设备台账'},{k:'maintain',label:'保养计划'},{k:'repair',label:'维修记录'},{k:'inspect',label:'点检记录'},{k:'spare',label:'备件管理'}],
    flyouts: {
      asset:{sections:[{title:'设备台账',items:['设备档案','设备分类','设备状态']},{title:'台账设置',items:['设备编号','设备分类','资产标签']}]},
      maintain:{sections:[{title:'保养计划',items:['保养计划','保养执行','保养预警']},{title:'保养设置',items:['保养标准','保养周期','审批流程']}]},
      repair:{sections:[{title:'维修记录',items:['报修申请','维修派工','维修验收']},{title:'维修设置',items:['故障分类','维修等级','审批流程']}]},
      inspect:{sections:[{title:'点检记录',items:['点检计划','点检执行','点检异常']},{title:'点检设置',items:['点检标准','点检周期']}]},
      spare:{sections:[{title:'备件管理',items:['备件库存','备件申请','备件采购']},{title:'备件设置',items:['安全库存','备件分类']}]}},
    workbench:{
      kpis:[{tone:'peach',key:'repair',label:'待维修设备',value:5,ic:'edit'},{tone:'mint',key:'maintain',label:'本周保养计划',value:12,ic:'list'},{tone:'sky',key:'inspect',label:'待点检设备',value:18,ic:'check'},{tone:'rose',key:'fault',label:'故障停用设备',value:3,ic:'flow'},{tone:'lilac',key:'spare',label:'备件库存预警',value:7,ic:'cart'},{tone:'sand',key:'scrap',label:'待报废设备',value:2,ic:'doc'}],
      moreKpis:[{tone:'sky',key:'overdue',label:'逾期未保养',value:4,ic:'list'},{tone:'mint',key:'new',label:'新到设备',value:2,ic:'cube'},{tone:'peach',key:'accept',label:'待验收设备',value:3,ic:'check'},{tone:'rose',key:'urgent',label:'紧急维修',value:1,ic:'flow'},{tone:'lilac',key:'calibrate',label:'待校准设备',value:6,ic:'edit'},{tone:'sand',key:'transfer',label:'设备调拨',value:1,ic:'cart'}],
      navTiles:[{label:'台账',sub:'设备台账',n:320,tint:'#DCE7FB',fg:'#5677FC',ic:'folder'},{label:'保养',sub:'保养计划',n:24,tint:'#DCE7FB',fg:'#5677FC',ic:'list'},{label:'维修',sub:'维修记录',n:18,tint:'#FBDFDF',fg:'#D14D4D',ic:'edit'},{label:'点检',sub:'点检记录',n:56,tint:'#DBF3E6',fg:'#10B981',ic:'check'},{label:'备件',sub:'备件管理',n:142,tint:'#DCE7FB',fg:'#5677FC',ic:'cart'},{label:'状态',sub:'设备状态',n:0,tint:'#FEF3CD',fg:'#B26A24',ic:'search'},{label:'统计',sub:'设备统计',n:0,tint:'#E8DEFB',fg:'#8957D8',ic:'flow'},{label:'资产',sub:'资产折旧',n:0,tint:'#F6EFD9',fg:'#6D5818',ic:'doc'}],
      entries:[{label:'报修申请',tint:'#DCE7FB',fg:'#5677FC',ic:'edit'},{label:'保养计划',tint:'#DCE7FB',fg:'#5677FC',ic:'list'},{label:'设备点检',tint:'#DCE7FB',fg:'#5677FC',ic:'check'},{label:'备件申领',tint:'#DCE7FB',fg:'#5677FC',ic:'cart'},{label:'设备查询',tint:'#DCE7FB',fg:'#5677FC',ic:'search'}]}},
  en: {
    title: '能耗中心',
    sideItems: [{k:'workbench',label:'工作台'},{k:'monitor',label:'能耗监测'},{k:'analysis',label:'能耗分析'},{k:'report',label:'能耗报表'},{k:'save',label:'节能措施'},{k:'carbon',label:'碳排放'}],
    flyouts: {
      monitor:{sections:[{title:'能耗监测',items:['实时监测','异常告警','设备能耗']},{title:'监测设置',items:['采集点管理','告警阈值','监测频率']}]},
      analysis:{sections:[{title:'能耗分析',items:['趋势分析','对比分析','成本分析']},{title:'分析设置',items:['分析维度','基准设置','分析周期']}]},
      report:{sections:[{title:'能耗报表',items:['日报','月报','年报','自定义报表']},{title:'报表设置',items:['报表模板','报送设置']}]},
      save:{sections:[{title:'节能措施',items:['措施方案','措施执行','效果评估']},{title:'措施设置',items:['措施分类','目标设定']}]},
      carbon:{sections:[{title:'碳排放',items:['排放核算','排放报告','减排目标']},{title:'碳设置',items:['核算标准','排放因子']}]}},
    workbench:{
      kpis:[{tone:'peach',key:'alert',label:'能耗异常告警',value:3,ic:'flow'},{tone:'mint',key:'today',label:'今日用电量',value:4820,ic:'search'},{tone:'sky',key:'target',label:'超指标能耗',value:2,ic:'edit'},{tone:'rose',key:'peak',label:'峰值预警',value:1,ic:'list'},{tone:'lilac',key:'save',label:'进行中节能措施',value:4,ic:'check'},{tone:'sand',key:'carbon',label:'碳排考核',value:0,ic:'doc'}],
      moreKpis:[{tone:'sky',key:'water',label:'今日用水量',value:128,ic:'flow'},{tone:'mint',key:'gas',label:'今日用气量',value:350,ic:'search'},{tone:'peach',key:'cost',label:'今日能耗成本',value:12500,ic:'doc'},{tone:'rose',key:'leak',label:'疑似泄漏',value:1,ic:'edit'},{tone:'lilac',key:'equip',label:'高能耗设备',value:8,ic:'list'},{tone:'sand',key:'report',label:'待上报报表',value:1,ic:'check'}],
      navTiles:[{label:'监测',sub:'能耗监测',n:0,tint:'#DCE7FB',fg:'#5677FC',ic:'search'},{label:'分析',sub:'能耗分析',n:0,tint:'#DCE7FB',fg:'#5677FC',ic:'flow'},{label:'报表',sub:'能耗报表',n:8,tint:'#DCE7FB',fg:'#5677FC',ic:'doc'},{label:'节能',sub:'节能措施',n:4,tint:'#DBF3E6',fg:'#10B981',ic:'check'},{label:'碳排放',sub:'碳排放管理',n:0,tint:'#E8DEFB',fg:'#8957D8',ic:'folder'},{label:'电表',sub:'电表管理',n:36,tint:'#FEF3CD',fg:'#B26A24',ic:'list'},{label:'水表',sub:'水表管理',n:12,tint:'#DCE7FB',fg:'#5677FC',ic:'edit'},{label:'成本',sub:'能耗成本',n:0,tint:'#FBDFDF',fg:'#D14D4D',ic:'cart'}],
      entries:[{label:'实时监测',tint:'#DCE7FB',fg:'#5677FC',ic:'search'},{label:'异常处理',tint:'#DCE7FB',fg:'#5677FC',ic:'flow'},{label:'能耗分析',tint:'#DCE7FB',fg:'#5677FC',ic:'edit'},{label:'节能方案',tint:'#DCE7FB',fg:'#5677FC',ic:'check'},{label:'查看报表',tint:'#DCE7FB',fg:'#5677FC',ic:'doc'}]}},
  set: {
    title: '设置中心',
    sideItems: [{k:'workbench',label:'工作台'},{k:'system',label:'系统设置'},{k:'user',label:'用户管理'},{k:'role',label:'角色权限'},{k:'dict',label:'数据字典'},{k:'guide',label:'引导'},{k:'code',label:'编码规则'},{k:'approval',label:'审批流程'}],
    flyouts: {
      system:{sections:[{title:'系统设置',items:['基础信息','系统参数','界面配置']},{title:'系统维护',items:['系统日志','数据备份','版本管理']}]},
      user:{sections:[{title:'用户管理',items:['用户列表','新增用户','部门管理']},{title:'用户设置',items:['密码策略','登录设置']}]},
      role:{sections:[{title:'角色权限',items:['角色管理','权限分配','数据权限']},{title:'权限设置',items:['菜单权限','操作权限','字段权限']}]},
      dict:{sections:[{title:'数据字典',items:['字典管理','字典项管理']},{title:'字典设置',items:['字典分类','编码规则']}]},
      guide:{sections:[{title:'模块引导',items:['引导总览','配置任务','引导模板','进度校验']},{title:'引导设置',items:['新增引导','发布校验','操作记录']}]},
      code:{sections:[{title:'编码规则',items:['规则管理','编码预览']},{title:'规则设置',items:['规则模板','流水号设置']}]},
      approval:{sections:[{title:'审批流程',items:['流程管理','节点配置','审批策略']},{title:'流程设置',items:['流程模板','条件设置','通知设置']}]}},
    workbench:{
      kpis:[{tone:'peach',key:'user',label:'待审核用户',value:3,ic:'user'},{tone:'mint',key:'role',label:'待配置角色',value:2,ic:'check'},{tone:'sky',key:'log',label:'异常日志',value:8,ic:'list'},{tone:'rose',key:'alert',label:'系统告警',value:1,ic:'flow'},{tone:'lilac',key:'dict',label:'字典变更',value:5,ic:'edit'},{tone:'sand',key:'backup',label:'待备份数据',value:1,ic:'folder'}],
      moreKpis:[{tone:'sky',key:'license',label:'许可证到期',value:1,ic:'doc'},{tone:'mint',key:'online',label:'当前在线用户',value:86,ic:'user'},{tone:'peach',key:'task',label:'定时任务',value:12,ic:'list'},{tone:'rose',key:'error',label:'接口异常',value:2,ic:'flow'},{tone:'lilac',key:'update',label:'待升级模块',value:3,ic:'cube'},{tone:'sand',key:'audit',label:'待审计日志',value:156,ic:'search'}],
      navTiles:[{label:'系统',sub:'系统设置',n:0,tint:'#DCE7FB',fg:'#5677FC',ic:'folder',moduleKey:'system'},{label:'用户',sub:'用户管理',n:320,tint:'#DCE7FB',fg:'#5677FC',ic:'user',moduleKey:'user'},{label:'角色',sub:'角色权限',n:28,tint:'#DCE7FB',fg:'#5677FC',ic:'check',moduleKey:'role'},{label:'字典',sub:'数据字典',n:64,tint:'#DBF3E6',fg:'#10B981',ic:'edit',moduleKey:'dict'},{label:'引导',sub:'模块引导',n:8,tint:'#FEF3CD',fg:'#B26A24',ic:'flow',moduleKey:'guide',action:'引导总览'},{label:'编码',sub:'编码规则',n:18,tint:'#E8DEFB',fg:'#8957D8',ic:'list',moduleKey:'code'},{label:'审批',sub:'审批流程',n:12,tint:'#FBDFDF',fg:'#D14D4D',ic:'flow',moduleKey:'approval'},{label:'安全',sub:'安全设置',n:0,tint:'#F6EFD9',fg:'#6D5818',ic:'search',moduleKey:'system',action:'登录设置'}],
      entries:[{label:'用户管理',tint:'#DCE7FB',fg:'#5677FC',ic:'user',moduleKey:'user'},{label:'权限配置',tint:'#DCE7FB',fg:'#5677FC',ic:'check',moduleKey:'role'},{label:'模块引导',tint:'#DCE7FB',fg:'#5677FC',ic:'flow',moduleKey:'guide',action:'引导总览'},{label:'编码规则',tint:'#DCE7FB',fg:'#5677FC',ic:'list',moduleKey:'code'},{label:'审批流程',tint:'#DCE7FB',fg:'#5677FC',ic:'flow',moduleKey:'approval'}]}}
};

const HELP_CENTER_ITEMS = [
  {
    title: '如何快速查找单据？',
    tags: ['搜索', '单据', '列表'],
    answer: '在各模块列表顶部输入单号、客户、供应商、产品或负责人关键词，即可筛选当前列表。也可以通过左侧导航进入具体业务分类后再搜索。',
  },
  {
    title: '如何新增业务单据？',
    tags: ['新增', '表单', '业务'],
    answer: '进入对应业务模块后，点击列表工具栏中的新增按钮。系统会按当前模块带出基础字段、明细表和审批信息，填写完成后可提交审核。',
  },
  {
    title: '审批流程在哪里配置？',
    tags: ['审批', '流程', '设置'],
    answer: '在设置中心进入审批流程，可以维护流程节点、审批策略、条件规则和通知方式。业务模块中的策略设置会引用这里的流程配置。',
  },
  {
    title: '编码规则如何生效？',
    tags: ['编码', '规则', '自动编号'],
    answer: '在设置中心的编码规则中配置前缀、日期段、流水号和适用模块。新增单据时，系统会根据模块和规则自动生成编号。',
  },
  {
    title: '找不到入口怎么办？',
    tags: ['导航', '入口', '模块'],
    answer: '可以先切换顶部业务域，再在左侧导航或工作台快捷入口中查找。设置中心的模块引导也会展示常用入口和配置任务。',
  },
];

function HelpCenterModal({ onClose }) {
  const [query, setQuery] = useState('');
  const keyword = query.trim().toLowerCase();
  const results = HELP_CENTER_ITEMS.filter(item => {
    if (!keyword) return true;
    return [item.title, item.answer, ...item.tags].join(' ').toLowerCase().includes(keyword);
  });
  const hotKeys = ['新增', '审批', '编码', '搜索'];

  return (
    <Modal title="帮助中心" subtitle="搜索问题并查看答案" size="md" className="aw-help-modal" onClose={onClose}>
      <div className="aw-help-center">
        <div className="aw-help-search">
          <span className="aw-help-search-ic">⌕</span>
          <Input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="搜索：新增、审批流程、编码规则、单据查询"
          />
        </div>
        <div className="aw-help-hot">
          {hotKeys.map(key => (
            <button key={key} type="button" onClick={() => setQuery(key)}>{key}</button>
          ))}
        </div>
        <div className="aw-help-results">
          {results.map(item => (
            <div className="aw-help-answer" key={item.title}>
              <div className="aw-help-answer-title">{item.title}</div>
              <div className="aw-help-answer-text">{item.answer}</div>
              <div className="aw-help-answer-tags">
                {item.tags.map(tag => <span key={tag}>{tag}</span>)}
              </div>
            </div>
          ))}
          {!results.length && (
            <div className="aw-empty">
              <div className="aw-empty-ic">?</div>
              <div>没有找到相关答案</div>
              <div style={{fontSize:12,marginTop:6}}>换个关键词试试，例如“审批”“新增”“编码”。</div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

function Topbar({ active, onChange }) {
  const [helpOpen, setHelpOpen] = useState(false);
  return (
    <>
      <div className="aw-topbar">
        <div className="brand">海南傲为智慧</div>
        <div className="tabs">
          {NAV.map(n => (
            <span key={n.k} className={'tab' + (active===n.k?' on':'')} onClick={()=>onChange&&onChange(n.k)}>
              <span style={{fontSize:13}}>{n.ic}</span> {n.label}
            </span>
          ))}
        </div>
        <div className="right">
          <button className="ic aw-top-help" type="button" title="帮助中心" onClick={() => setHelpOpen(true)}>?</button>
          <span className="ic" title="通知" style={{position:'relative'}}>🔔<span style={{position:'absolute',top:-2,right:-4,width:6,height:6,background:'#F5222D',borderRadius:'50%'}}></span></span>
          <div className="av">夏</div>
          <span>老夏 ▾</span>
        </div>
      </div>
      {helpOpen && <HelpCenterModal onClose={() => setHelpOpen(false)} />}
    </>
  );
}

function Sidebar({ title, items, active, onChange, flyouts }) {
  const [hover, setHover] = useState(null);
  const [top, setTop] = useState(0);
  const [anchorY, setAnchorY] = useState(0);
  const hide = React.useRef();
  const flyRef = React.useRef(null);
  const open = (k, e) => {
    clearTimeout(hide.current);
    const r = e.currentTarget.getBoundingClientRect();
    const centerY = r.top + r.height / 2;
    setAnchorY(centerY);
    setTop(Math.max(52, centerY - 110));
    setHover(k);
  };
  const close = () => { hide.current = setTimeout(()=>setHover(null), 150); };
  const stay = () => clearTimeout(hide.current);
  const fly = hover && flyouts && flyouts[hover];
  React.useLayoutEffect(() => {
    if (!fly || !flyRef.current || !anchorY) return;
    const height = flyRef.current.offsetHeight || 220;
    const minTop = 52;
    const maxTop = Math.max(minTop, window.innerHeight - height - 16);
    const nextTop = Math.min(Math.max(anchorY - height / 2, minTop), maxTop);
    setTop(nextTop);
  }, [fly, anchorY]);
  return (
    <div className="aw-side">
      <h4>{title}</h4>
      {items.map(it => (
        <div key={it.k}
          className={'item' + (active===it.k?' on':'')}
          onClick={()=>onChange&&onChange(it.k)}
          onMouseEnter={(e)=>open(it.k,e)} onMouseLeave={close}>
          <span style={{opacity:.6}}>○</span> {it.label}
        </div>
      ))}
      {fly && (
        <div ref={flyRef} className="aw-flyout" style={{top}} onMouseEnter={stay} onMouseLeave={close}>
          {fly.sections.map((s,i)=>(
            <div key={i} className="aw-flyout-sec">
              <div className="aw-flyout-h">{s.title}</div>
              <div className="aw-flyout-items">
                {s.items.map((x,j)=><a key={j} onClick={()=>{onChange&&onChange(hover); s.onPick&&s.onPick(x);}}>{x}</a>)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PageHead({ children }) {
  return <div className="aw-page-head">{children}</div>;
}

function Card({ title, children, style }) {
  return (
    <div className="aw-card" style={style}>
      {title && <div className="section-title">{title}</div>}
      {children}
    </div>
  );
}

function DetailHeaderCard({
  title,
  status = '待审批',
  detailItems,
  onBack,
  onEdit,
  onDelete,
  onExport,
  onPrint,
  onDisable,
  creator = 'XXX',
  createdAt = '2024-06-07 19:49:12',
  modifier = 'XXX',
  modifiedAt = '2024-06-07 19:49:12',
}) {
  const metaItems = [
    ['创建人', creator],
    ['创建时间', createdAt],
    ['最后修改人', modifier],
    ['修改时间', modifiedAt],
  ];
  const infoItems = detailItems || metaItems;
  return (
    <>
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'16px 18px', background:'#fff', border:'1px solid var(--aw-border)', borderRadius:8, marginBottom:14 }}>
        <span className="aw-link" onClick={onBack}>← 返回列表</span>
        <span style={{ flex:1 }} />
        <button className="aw-btn" onClick={onEdit}>修改</button>
        <button className="aw-btn" onClick={onDelete}>删除</button>
        <button className="aw-btn" onClick={onPrint}>打印</button>
        <button className="aw-btn" onClick={onExport}>导出</button>
        <button className="aw-btn danger" onClick={onDisable}>停用</button>
      </div>
      <Card style={{ position:'relative', paddingRight:126, minHeight:86 }}>
        <StatusStamp status={status} />
        <div style={{ fontSize:18, fontWeight:600, color:'var(--aw-fg-1)', marginBottom:10 }}>{title}</div>
        <div style={{ display:'flex', gap:24, fontSize:12, color:'#6B7280', flexWrap:'wrap' }}>
          {infoItems.map(([label, value]) => <span key={label}>{label}：{value}</span>)}
        </div>
      </Card>
    </>
  );
}

function StatusStamp({ status = '待审批' }) {
  const normalized = status === '待审核' ? '待审批'
    : status === '已生效' || status === '启用' || status === '在售' || status === '已发布' ? '已审批'
    : status === '已完成' ? '已完成'
    : status === '草稿' ? '未提交'
    : status === '已退回' ? '驳回'
    : status;
  const colorMap = {
    '驳回': '#E5484D',
    '未提交': '#A1A1AA',
    '待审批': '#2563EB',
    '审批中': '#F59E0B',
    '进行中': '#F59E0B',
    '已审批': '#059669',
    '已完成': '#059669',
  };
  const color = colorMap[normalized] || '#6B7280';
  const stars = Array.from({ length: 18 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 18 - Math.PI / 2;
    return { x: 62 + Math.cos(a) * 39, y: 62 + Math.sin(a) * 39 };
  });

  return (
    <svg width="92" height="84" viewBox="0 0 124 112" style={{ position:'absolute', top:12, right:20, overflow:'visible' }} aria-label={normalized}>
      <g opacity=".96">
        <circle cx="62" cy="62" r="47" fill="none" stroke={color} strokeWidth="3" />
        <circle cx="62" cy="62" r="30" fill="none" stroke={color} strokeWidth="3" />
        {stars.map((p, i) => <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fill={color} fontSize="8" fontWeight="700">★</text>)}
        <g transform="rotate(-30 62 62)">
          <rect x="4" y="43" width="116" height="38" rx="5" fill="#fff" stroke={color} strokeWidth="3" />
          <text x="62" y="68" textAnchor="middle" fill={color} fontSize="23" fontWeight="600" letterSpacing="2">{normalized}</text>
        </g>
      </g>
    </svg>
  );
}

function Btn({ kind = 'secondary', children, onClick, style }) {
  const cls = 'aw-btn' + (kind==='primary'?' primary':kind==='text'?' text':kind==='danger'?' danger':'');
  return <button className={cls} onClick={onClick} style={style}>{children}</button>;
}

function Field({ label, req, children }) {
  return (
    <div className={'aw-field' + (req?' req':'')}>
      <label>{label}</label>
      {children}
    </div>
  );
}

function HelpTip({ text, children }) {
  const lines = Array.isArray(text) ? text : [text];
  return (
    <span className="aw-help-tip" tabIndex="0" aria-label={lines.join(' ')}>
      ?
      <span className="aw-help-pop">
        {children || lines.map((line, idx) => <span key={idx}>{line}</span>)}
      </span>
    </span>
  );
}

function Input(props) { return <input className="aw-input" {...props} />; }
function Select({ children, value, onChange, ...rest }) {
  return <select className="aw-select" value={value} onChange={onChange} {...rest}>{children}</select>;
}

function Switch({ on, onChange }) {
  return <span className={'aw-switch' + (on?'':' off')} onClick={()=>onChange&&onChange(!on)} />;
}

function Radio({ on, children, onClick }) {
  return <span className={'aw-radio' + (on?' on':'')} onClick={onClick}><span className="aw-dot" />{children}</span>;
}

function Tabs({ items, active, onChange }) {
  return (
    <div className="aw-tabs">
      {items.map(it => (
        <div key={it.k} className={'t' + (active===it.k?' on':'')} onClick={()=>onChange&&onChange(it.k)}>{it.label}</div>
      ))}
    </div>
  );
}

function Badge({ tone='b', children }) {
  return <span className={'aw-badge' + (tone==='b'?'':' '+tone)}>{children}</span>;
}

function KPI({ tone='peach', label, value, action='点击查看', ic='📄', onClick }) {
  return (
    <div className={'aw-kpi ' + tone} onClick={onClick} style={{cursor:'pointer'}}>
      <div className="l">{label}</div>
      <div className="n">{value}</div>
      <div className="a">{action}</div>
      <div className="ic">{ic}</div>
    </div>
  );
}

function Modal({ title, children, footer, onClose, size = '', subtitle, noScroll = false, className = '' }) {
  const cls = ['aw-modal', size, noScroll ? 'no-scroll' : '', className].filter(Boolean).join(' ');
  return (
    <div className="aw-mask" onClick={onClose}>
      <div className={cls} onClick={e=>e.stopPropagation()}>
        <div className="head">
          <span className="aw-modal-title">{title}{subtitle && <span className="aw-modal-sub">{subtitle}</span>}</span>
          <button className="aw-modal-close" type="button" onClick={onClose}>×</button>
        </div>
        <div className="body">{children}</div>
        {footer && <div className="foot">{footer}</div>}
      </div>
    </div>
  );
}

function StandardModal({ title, subtitle, children, footer, onClose, size = 'md', noScroll = false }) {
  return <Modal title={title} subtitle={subtitle} footer={footer} onClose={onClose} size={size} noScroll={noScroll}>{children}</Modal>;
}

function ConfirmModal({ title = '操作确认', message, onClose, onConfirm, confirmText = '确定', cancelText = '取消', tone = 'warn' }) {
  const icon = tone === 'danger' ? '!' : '?';
  return (
    <Modal
      title={title}
      size="sm"
      onClose={onClose}
      footer={<><Btn onClick={onClose}>{cancelText}</Btn><Btn kind={tone === 'danger' ? 'danger' : 'primary'} onClick={() => { onConfirm && onConfirm(); onClose && onClose(); }}>{confirmText}</Btn></>}
    >
      <div className="aw-confirm-body">
        <span className="aw-confirm-ic">{icon}</span>
        <div>{message || '确认执行当前操作吗？'}</div>
      </div>
    </Modal>
  );
}

function SimpleCustomerPickerModal({ onClose, onConfirm, title = '选择客户' }) {
  const rows = [
    { name:'深圳市启明科技有限公司', group:'重点客户', contact:'老夏', phone:'13888888888', manager:'张国' },
    { name:'海南微为智造产业有限公司', group:'渠道客户', contact:'老夏', phone:'13888888888', manager:'老夏' },
    { name:'广州智造电子', group:'项目客户', contact:'李主管', phone:'13666666666', manager:'李文涛' },
    { name:'杭州云联技术', group:'长期客户', contact:'陈经理', phone:'13999999999', manager:'陈思源' },
  ];
  const [selected, setSelected] = useState(rows[0]);
  return (
    <Modal title={title} size="lg" onClose={onClose} footer={<><Btn onClick={onClose}>取消</Btn><Btn kind="primary" onClick={() => onConfirm && onConfirm(selected)}>确认</Btn></>}>
      <div style={{display:'grid',gridTemplateColumns:'170px 1fr',gap:14,minHeight:330}}>
        <div className="aw-doc-tree">
          {['全部客户','重点客户','渠道客户','项目客户','长期客户'].map((g,i)=><div key={g} className={'aw-tree-row aw-tree-l2 '+(i===0?'on':'')}><span>{g}</span></div>)}
        </div>
        <div>
          <div style={{marginBottom:12}}><Input placeholder="搜索客户名称 / 联系人 / 电话" /></div>
          <table className="aw-table">
            <thead><tr><th style={{width:56}}>选择</th><th>客户名称</th><th>客户分组</th><th>联系人</th><th>客户经理</th><th>联系方式</th></tr></thead>
            <tbody>{rows.map(r=><tr key={r.name} onClick={()=>setSelected(r)} style={{cursor:'pointer'}}><td><input type="radio" checked={selected.name===r.name} onChange={()=>setSelected(r)} /></td><td>{r.name}</td><td>{r.group}</td><td>{r.contact}</td><td>{r.manager}</td><td>{r.phone}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}

function SimpleSupplierPickerModal({ onClose, onConfirm, title = '选择供应商' }) {
  const rows = [
    { name:'海南微为智造产业有限公司', group:'主供应商', contact:'王经理', phone:'13800000001', status:'正式供应商' },
    { name:'深圳华强电子', group:'电子物料', contact:'张经理', phone:'13888880001', status:'正式供应商' },
    { name:'上海国巨电子', group:'电子物料', contact:'李主管', phone:'13999990002', status:'正式供应商' },
    { name:'海南昌茂包装', group:'包装物料', contact:'陈经理', phone:'13777770003', status:'正式供应商' },
  ];
  const [selected, setSelected] = useState(rows[0]);
  return (
    <Modal title={title} size="lg" onClose={onClose} footer={<><Btn onClick={onClose}>取消</Btn><Btn kind="primary" onClick={() => onConfirm && onConfirm(selected)}>确认</Btn></>}>
      <div style={{display:'grid',gridTemplateColumns:'170px 1fr',gap:14,minHeight:330}}>
        <div className="aw-doc-tree">
          {['全部供应商','主供应商','电子物料','包装物料','临时供应商'].map((g,i)=><div key={g} className={'aw-tree-row aw-tree-l2 '+(i===0?'on':'')}><span>{g}</span></div>)}
        </div>
        <div>
          <div style={{marginBottom:12}}><Input placeholder="搜索供应商名称 / 联系人 / 电话" /></div>
          <table className="aw-table">
            <thead><tr><th style={{width:56}}>选择</th><th>供应商名称</th><th>分组</th><th>联系人</th><th>联系方式</th><th>状态</th></tr></thead>
            <tbody>{rows.map(r=><tr key={r.name} onClick={()=>setSelected(r)} style={{cursor:'pointer'}}><td><input type="radio" checked={selected.name===r.name} onChange={()=>setSelected(r)} /></td><td>{r.name}</td><td>{r.group}</td><td>{r.contact}</td><td>{r.phone}</td><td>{r.status}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}

function PersonPickerInput({ value = '', onChange, placeholder = '请选择人员' }) {
  const [showPicker, setShowPicker] = useState(false);
  return (
    <>
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        <Input value={value} readOnly placeholder={placeholder} onClick={() => setShowPicker(true)} style={{flex:1,cursor:'pointer'}} />
        <Btn onClick={() => setShowPicker(true)}>选择</Btn>
      </div>
      {showPicker && <PersonPickerModal onClose={() => setShowPicker(false)} onConfirm={(persons=[]) => {
        const names = persons.map(p => p.name).join('、');
        onChange && onChange(names, persons);
        setShowPicker(false);
      }} />}
    </>
  );
}

function FormGrid({ children, columns = 3 }) {
  const cls = 'aw-form-grid' + (columns === 2 ? ' two' : columns === 1 ? ' one' : '');
  return <div className={cls}>{children}</div>;
}

function InfoGrid({ items = [], columns = 3 }) {
  const cls = 'aw-kv-grid' + (columns === 2 ? ' two' : '');
  return (
    <div className={cls}>
      {items.map((item, idx) => (
        <div className="aw-kv" key={item.label || idx}>
          <span className="aw-kv-l">{item.label}</span>
          <span className="aw-kv-v">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function UploadBox({ title = '点击上传', hint = '支持 PDF / Word / Excel / 图片，单文件 ≤ 50MB', onClick }) {
  return (
    <div className="aw-upload-box" onClick={onClick}>
      <span className="aw-upload-ic">↥</span>
      <div><span className="aw-link">{title}</span> / 拖拽到此区域</div>
      {hint && <div>{hint}</div>}
    </div>
  );
}

function AttachmentGrid({ files, uploadHint }) {
  const list = files || [
    { name: '新建文本文档.PDF', size: '0 Bytes', date: '2026-05-17 14:52' },
  ];
  return (
    <div className="aw-attach-grid">
      {list.map((file, idx) => (
        <div className="aw-attach-card" key={file.name || idx}>
          <div className="aw-attach-name">{file.name}</div>
          <div>文件大小：{file.size || '0 Bytes'}</div>
          <div style={{ marginTop: 2 }}>上传日期：{file.date || '2026-05-17 14:52'}</div>
          <div className="aw-attach-actions"><span className="aw-link">查看</span><span className="aw-link">下载</span></div>
        </div>
      ))}
      <UploadBox hint={uploadHint} />
    </div>
  );
}

function EmptyState({ title = '暂无数据', hint, action }) {
  return (
    <div className="aw-empty">
      <div className="aw-empty-ic">□</div>
      <div>{title}</div>
      {hint && <div style={{ marginTop: 4, fontSize: 12 }}>{hint}</div>}
      {action && <div style={{ marginTop: 10 }}>{action}</div>}
    </div>
  );
}

function PickerModal({ title, subtitle, sideTitle, side, toolbar, children, footer, onClose }) {
  return (
    <Modal title={title} subtitle={subtitle} size="picker" onClose={onClose}>
      <div className="aw-picker-layout">
        <div className="aw-picker-side">
          <div className="aw-picker-side-h">{sideTitle || '分类'}</div>
          <div className="aw-picker-tree">{side}</div>
        </div>
        <div className="aw-picker-main">
          {toolbar && <div className="aw-picker-toolbar">{toolbar}</div>}
          <div className="aw-picker-table">{children}</div>
          {footer && <div className="aw-picker-foot">{footer}</div>}
        </div>
      </div>
    </Modal>
  );
}

function PickerSearch({ value, onChange, placeholder = '搜索' }) {
  return (
    <div className="aw-picker-search">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--aw-fg-4)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input value={value || ''} onChange={e => onChange && onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function StepRow({ steps = [], active }) {
  return <div className="aw-step-row">{steps.map(step => <span key={step} className={'aw-step' + (step === active ? ' on' : '')}>{step}</span>)}</div>;
}

function StatusPill({ on, children }) {
  return <span className={'aw-status-pill' + (on === true ? ' on' : on === false ? ' off' : '')}>{children || (on ? '启用' : '停用')}</span>;
}

// ui_kits/erp-console/supplier-list.jsx
// 供应商管理 — 列表 / 新增 / 详情 三态
const { useEffect } = React;

// ===================== 分类树 =====================
function SupplierTree({ picked, setPicked }) {
  const tree = [
    {k:'all', label:'全部供应商', open:true, kids:[]},
    {k:'raw', label:'原材料供应商', open:false, kids:[{k:'r1',label:'金属材料'},{k:'r2',label:'电子元器件'},{k:'r3',label:'化工材料'}]},
    {k:'part', label:'零部件供应商', open:false, kids:[{k:'p1',label:'机械零件'},{k:'p2',label:'电气零件'}]},
    {k:'pkg', label:'包装供应商', open:false, kids:[{k:'k1',label:'纸箱类'},{k:'k2',label:'塑料类'}]},
    {k:'svc', label:'服务供应商', open:false, kids:[{k:'s1',label:'物流服务'},{k:'s2',label:'检测服务'}]},
  ];
  return (
    <div className="aw-doc-tree">
      <div className="aw-doc-tree-h">供应商库 <span className="aw-doc-tree-n">(156)</span></div>
      <div className="aw-doc-tree-list">
        {tree.map(n => (
          <div key={n.k}>
            <div className={'aw-tree-row aw-tree-l2' + (picked === n.k ? ' on' : '')} onClick={() => setPicked(n.k)}>
              <span className="aw-tree-caret">{n.kids.length ? (n.open ? '▾' : '▸') : ''}</span>
              <TileIcon name="user" size={14} />
              <span>{n.label}</span>
            </div>
            {n.open && n.kids.map(c => (
              <div key={c.k} className={'aw-tree-row aw-tree-l3' + (picked === c.k ? ' on' : '')} onClick={() => setPicked(c.k)}>
                <TileIcon name="doc" size={13} />
                <span>{c.label}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ===================== 列表工具栏 =====================
function SupplierToolbar({ onNew, onSearch }) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12,flexWrap:'wrap'}}>
      <Input placeholder="搜索供应商名称/编号…" style={{width:220}} />
      <Btn onClick={onNew}>新增供应商</Btn>
      <span style={{flex:1}} />
      <span style={{fontSize:12,color:'var(--aw-fg-3)'}}>刷新数据</span>
      <Btn>筛选</Btn>
      <Btn>字段配置</Btn>
      <Btn>导出</Btn>
      <Btn>导入</Btn>
    </div>
  );
}

// ===================== 列表视图 =====================
function SupplierListView({ onNew, onView, picked }) {
  const rows = [
    {code:'SUP-2025-001', name:'深圳鑫达电子科技有限公司', type:'原材料供应商', cat:'电子元器件', contact:'张伟', phone:'13800138001', state:'已审核', stTone:'g', date:'2025-12-01'},
    {code:'SUP-2025-002', name:'广州宏业机械配件有限公司', type:'零部件供应商', cat:'机械零件', contact:'李明', phone:'13900139002', state:'已审核', stTone:'g', date:'2025-11-20'},
    {code:'SUP-2025-003', name:'东莞华美包装制品厂', type:'包装供应商', cat:'纸箱类', contact:'王芳', phone:'13700137003', state:'待审核', stTone:'y', date:'2025-12-10'},
    {code:'SUP-2025-004', name:'上海博源化工有限公司', type:'原材料供应商', cat:'化工材料', contact:'赵强', phone:'13600136004', state:'已审核', stTone:'g', date:'2025-10-15'},
    {code:'SUP-2025-005', name:'北京中科检测技术有限公司', type:'服务供应商', cat:'检测服务', contact:'陈丽', phone:'13500135005', state:'已停用', stTone:'gray', date:'2025-08-22'},
    {code:'SUP-2025-006', name:'佛山顺德精密五金厂', type:'零部件供应商', cat:'机械零件', contact:'刘洋', phone:'13400134006', state:'已审核', stTone:'g', date:'2025-12-05'},
    {code:'SUP-2025-007', name:'杭州云仓物流有限公司', type:'服务供应商', cat:'物流服务', contact:'周杰', phone:'13300133007', state:'待审核', stTone:'y', date:'2025-12-12'},
    {code:'SUP-2025-008', name:'苏州工业园区塑胶科技', type:'包装供应商', cat:'塑料类', contact:'吴敏', phone:'13200132008', state:'已审核', stTone:'g', date:'2025-09-18'},
  ];
  const cols = [
    {k:'code',  label:'供应商编号', w:140},
    {k:'name',  label:'供应商名称', w:220},
    {k:'type',  label:'分类',      w:130, filter:['全部','原材料供应商','零部件供应商','包装供应商','服务供应商']},
    {k:'cat',   label:'细分类',    w:120},
    {k:'contact',label:'联系人',   w:80},
    {k:'phone', label:'联系方式',  w:120},
    {k:'state', label:'状态',      w:90,  filter:['全部','已审核','待审核','已停用']},
    {k:'date',  label:'创建日期',  w:110},
    {k:'op',    label:'操作',      w:80},
  ];
  const [sel, setSel] = useState({});
  const allChecked = rows.length>0 && rows.every((_,i)=>sel[i]);
  const someChecked = rows.some((_,i)=>sel[i]);
  const toggleAll = () => { if (allChecked) setSel({}); else { const n={}; rows.forEach((_,i)=>n[i]=true); setSel(n); } };
  const toggleRow = (i) => setSel(s=>({...s,[i]:!s[i]}));

  return (
    <>
      <SupplierToolbar onNew={onNew} />
      <div className="aw-doc-tbl-wrap">
        <SupplierTable cols={cols} rows={rows} sel={sel} toggleRow={toggleRow}
          allChecked={allChecked} someChecked={someChecked} toggleAll={toggleAll} onView={onView} />
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 16px',border:'1px solid var(--aw-border)',borderTop:0,borderRadius:'0 0 var(--aw-radius-md) var(--aw-radius-md)',fontSize:12,color:'var(--aw-fg-3)'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <input type="checkbox" checked={allChecked} onChange={toggleAll} style={{margin:0}} />
            <span>共 156 条，显示 1-10 条</span>
            <span style={{color:'var(--aw-primary)',cursor:'pointer'}}>清除选择</span>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <span style={{color:'var(--aw-primary)',cursor:'pointer'}}>上一页</span>
            <span style={{background:'var(--aw-primary)',color:'#fff',padding:'2px 8px',borderRadius:4}}>1</span>
            <span style={{cursor:'pointer'}}>2</span>
            <span style={{cursor:'pointer'}}>3</span>
            <span>…</span>
            <span style={{cursor:'pointer'}}>16</span>
            <span style={{color:'var(--aw-primary)',cursor:'pointer'}}>下一页</span>
          </div>
        </div>
      </div>
    </>
  );
}

function SupplierTable({ cols, rows, sel, toggleRow, allChecked, someChecked, toggleAll, onView }) {
  return (
    <table className="aw-table" style={{marginBottom:0}}>
      <thead>
        <tr>
          <th style={{width:40}}><input type="checkbox" checked={allChecked} onChange={toggleAll} style={{margin:0}} /></th>
          {cols.map(c => <th key={c.k} style={{width:c.w}}>{c.label}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((r,i) => (
          <tr key={i} onClick={() => onView && onView(r)} style={{cursor:'pointer'}}>
            <td onClick={e=>e.stopPropagation()}><input type="checkbox" checked={!!sel[i]} onChange={()=>toggleRow(i)} style={{margin:0}} /></td>
            <td>{r.code}</td>
            <td style={{color:'var(--aw-primary)',fontWeight:500}}>{r.name}</td>
            <td>{r.type}</td>
            <td>{r.cat}</td>
            <td>{r.contact}</td>
            <td>{r.phone}</td>
            <td><span className={'aw-badge' + (r.stTone==='g'?' mint':r.stTone==='y'?' peach':r.stTone==='gray'?'':' b')}>{r.state}</span></td>
            <td>{r.date}</td>
            <td><span className="aw-link" onClick={e=>{e.stopPropagation();onView&&onView(r);}}>查看</span></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ===================== 新增供应商表单 =====================
function SupplierNewView({ onBack }) {
  const [paymentType, setPaymentType] = useState('cash'); // cash | monthly | cycle | credit

  return (
    <div className="aw-doc-form">
      <div className="aw-doc-form-head">
        <span className="aw-link" onClick={onBack}>← 返回列表</span>
        <span style={{flex:1}}/>
        <button className="aw-btn" onClick={onBack}>取消</button>
        <button className="aw-btn">暂存</button>
        <button className="aw-btn primary">提交审批</button>
      </div>

      <div className="aw-doc-form-body">
        {/* ===== 基础信息 ===== */}
        <Card title="基础信息">
          <div className="aw-doc-grid" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
            <Field label="供应商名称" req><Input placeholder="请输入供应商全称（须与营业执照一致）" /></Field>
            <Field label="拼音号"><Input placeholder="根据名称自动生成，可手动修改" /></Field>
            <Field label="供应商编号"><Input defaultValue="系统自动生成" disabled /></Field>
            <Field label="供应商分类" req>
              <Select><option>请选择供应商所属分类</option><option>原材料供应商</option><option>零部件供应商</option><option>包装供应商</option><option>服务供应商</option></Select>
            </Field>
            <Field label="信用代码" req><Input placeholder="请输入18位统一社会信用代码" /></Field>
            <Field label="采购人员"><Select><option>请选择负责跟进的采购人员</option><option>老夏</option><option>李文涛</option><option>陈思源</option></Select></Field>
          </div>
        </Card>

        {/* ===== 供应产品 ===== */}
        <Card title="供应产品">
          <div className="aw-sub-hint">添加该供应商供应的产品/物料信息</div>
          <div style={{overflow:'auto'}}>
            <table className="aw-table">
              <thead>
                <tr>
                  <th style={{width:40}}></th>
                  <th style={{width:130}}>物料编码</th>
                  <th style={{width:160}}>物料名称</th>
                  <th style={{width:130}}>规格型号</th>
                  <th style={{width:130}}>物料类别</th>
                  <th style={{width:100}}>品牌</th>
                  <th style={{width:80}}>单位</th>
                  <th style={{width:100}}>供货单位</th>
                  <th style={{width:100}}>换算系数</th>
                  <th style={{width:60}}>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td><Input placeholder="输入或搜索物料编码" style={{width:'100%'}} /></td>
                  <td><Input placeholder="输入物料名称关键词搜索" style={{width:'100%'}} /></td>
                  <td><Input placeholder="如：500ml/瓶、A4" style={{width:'100%'}} /></td>
                  <td><Select style={{width:'100%'}}><option>请选择物料所属类别</option><option>电子元器件</option><option>金属材料</option><option>化工材料</option><option>机械零件</option></Select></td>
                  <td><Input placeholder={'无品牌可填"通用"'} style={{width:'100%'}} /></td>
                  <td><Input placeholder="如：kg、个、箱" style={{width:'100%'}} /></td>
                  <td>
                    <Input placeholder="供应商报价与交货所用单位" style={{width:'100%'}} />
                    <div className="aw-field-hint">与"单位"不同时需填写换算系数</div>
                  </td>
                  <td><Input placeholder="如：1箱=12个，填12" style={{width:'100%'}} /></td>
                  <td><span style={{color:'var(--aw-danger)',cursor:'pointer',fontSize:13}}>删除</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{marginTop:10,display:'flex',gap:8,alignItems:'center'}}>
            <Btn>+ 添加产品行</Btn>
            <span style={{fontSize:12,color:'var(--aw-fg-3)'}}>支持添加多条供应产品记录</span>
          </div>
        </Card>

        {/* ===== 联系人信息 ===== */}
        <Card title="联系人信息">
          <div className="aw-doc-grid" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
            <Field label="联系人"><Input placeholder="请输入联系人姓名" /></Field>
            <Field label="联系方式"><Input placeholder="请输入手机号或座机（含区号）" /></Field>
            <Field label="职位"><Input placeholder="请输入联系人职位，如：销售经理" /></Field>
          </div>
        </Card>

        {/* ===== 财务信息 ===== */}
        <Card title="财务信息">
          {/* 账期设置 */}
          <div style={{marginBottom:16}}>
            <div className="aw-sub-title">账期设置</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:'0 16px',marginTop:8}}>
              {/* 现结 */}
              <div className={'aw-payment-card' + (paymentType==='cash'?' on':'')} onClick={()=>setPaymentType('cash')}>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <span className={'aw-payment-radio' + (paymentType==='cash'?' checked':'')} />
                  <span style={{fontSize:14,fontWeight:600}}>现结</span>
                </div>
                <div className="aw-field-hint" style={{marginTop:4,marginLeft:22}}>交货时即时结清货款</div>
              </div>
              {/* 月结 */}
              <div className={'aw-payment-card' + (paymentType==='monthly'?' on':'')} onClick={()=>setPaymentType('monthly')}>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <span className={'aw-payment-radio' + (paymentType==='monthly'?' checked':'')} />
                  <span style={{fontSize:14,fontWeight:600}}>月结</span>
                </div>
                {paymentType==='monthly' && (
                  <div style={{marginTop:8}}>
                    <Input placeholder="请输入1-31（每月几号结款）" style={{width:'100%'}} />
                    <div className="aw-field-hint" style={{marginTop:2}}>每月固定日期统一结款</div>
                  </div>
                )}
              </div>
              {/* 周期 */}
              <div className={'aw-payment-card' + (paymentType==='cycle'?' on':'')} onClick={()=>setPaymentType('cycle')}>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <span className={'aw-payment-radio' + (paymentType==='cycle'?' checked':'')} />
                  <span style={{fontSize:14,fontWeight:600}}>周期</span>
                </div>
                {paymentType==='cycle' && (
                  <div style={{marginTop:8}}>
                    <Input placeholder="如30、60、90（最多3位数）" style={{width:'100%'}} />
                    <div className="aw-field-hint" style={{marginTop:2}}>按账期天数滚动结款</div>
                  </div>
                )}
              </div>
              {/* 额度 */}
              <div className={'aw-payment-card' + (paymentType==='credit'?' on':'')} onClick={()=>setPaymentType('credit')}>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <span className={'aw-payment-radio' + (paymentType==='credit'?' checked':'')} />
                  <span style={{fontSize:14,fontWeight:600}}>额度</span>
                </div>
                {paymentType==='credit' && (
                  <div style={{marginTop:8}}>
                    <Input placeholder="如50000" style={{width:'100%'}} />
                    <div className="aw-field-hint" style={{marginTop:2}}>超出额度需提前结款</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 银行信息 */}
          <div>
            <div className="aw-sub-title">银行信息</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0 16px',marginTop:8}}>
              <Field label="银行账户"><Input placeholder="请输入供应商银行账号" /></Field>
              <Field label="账户名称"><Input placeholder="请输入开户名称（须与营业执照一致）" /></Field>
              <Field label="开户行"><Input placeholder="请输入开户银行全称及支行名称" /><div className="aw-field-hint">如：中国工商银行深圳福田支行</div></Field>
            </div>
          </div>
        </Card>

        {/* ===== 地址信息 ===== */}
        <Card title="地址信息">
          <Field label="详细地址"><Input placeholder="请输入详细地址（省/市/区/街道/门牌号）" style={{width:'100%'}} /><div className="aw-field-hint">如：广东省深圳市福田区××路××号××楼</div></Field>
        </Card>

        {/* ===== 附件信息 ===== */}
        <Card title="附件信息">
          <div style={{border:'1px dashed #D1D5DB',borderRadius:6,padding:'24px',textAlign:'center',color:'#6B7280',fontSize:13}}>
            <span className="aw-link">点击上传</span> / 拖拽到此区域 &nbsp;
            <span style={{color:'#9CA3AF',fontSize:12}}>支持 PDF、Word、Excel、JPG、PNG，单文件不超过 20MB</span>
          </div>
        </Card>

        {/* 底部必填提示 */}
        <div style={{fontSize:12,color:'var(--aw-fg-3)',marginTop:12}}>
          <span style={{color:'var(--aw-danger)'}}>*</span> 为必填字段
        </div>
      </div>
    </div>
  );
}

// ===================== 供应商详情视图 =====================
function SupplierDetailView({ onBack, data }) {
  const sup = data || { code:'SUP-2025-001', name:'深圳鑫达电子科技有限公司', type:'原材料供应商', creditCode:'91440300MA5DXXXXX', buyer:'老夏', contact:'张伟', phone:'13800138001', position:'销售经理', address:'广东省深圳市福田区华强北路1002号赛格广场32楼', bankAccount:'6217000000123456789', bankName:'深圳鑫达电子科技有限公司', bankBranch:'中国工商银行深圳福田支行', state:'已审核' };
  return (
    <div className="aw-doc-form">
      <div className="aw-doc-form-body">
        <DetailHeaderCard
          title={sup.name}
          status={sup.state}
          onBack={onBack}
          detailItems={[
            ['编号', sup.code],
            ['分类', sup.type],
            ['联系人', sup.contact],
            ['联系方式', sup.phone],
            ['采购人员', sup.buyer],
          ]}
        />
        <Card title="基础信息">
          <div className="aw-doc-grid" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
            <KV k="供应商编号" v={sup.code} /><KV k="供应商名称" v={sup.name} />
            <KV k="供应商分类" v={sup.type} /><KV k="信用代码" v={sup.creditCode} />
            <KV k="采购人员" v={sup.buyer} />
          </div>
        </Card>
        <Card title="联系人信息">
          <div className="aw-doc-grid" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
            <KV k="联系人" v={sup.contact} /><KV k="联系方式" v={sup.phone} /><KV k="职位" v={sup.position} />
          </div>
        </Card>
        <Card title="银行信息">
          <div className="aw-doc-grid" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
            <KV k="银行账户" v={sup.bankAccount} /><KV k="账户名称" v={sup.bankName} /><KV k="开户行" v={sup.bankBranch} />
          </div>
        </Card>
        <Card title="地址信息">
          <KV k="详细地址" v={sup.address} />
        </Card>
      </div>
    </div>
  );
}

function KV({k,v}){return <div style={{display:'flex',gap:18}}><span style={{color:'#6B7280',width:90,flex:'none'}}>{k}</span><span>：{v}</span></div>;}

// ===================== 主入口 =====================
function SupplierListScreen({ module: mod, initialAction, onActionConsumed }) {
  const m = mod || { name:'供应商', code:'supp' };
  const [view, setView] = useState('list');
  const [picked, setPicked] = useState('all');
  const [detailData, setDetailData] = useState(null);

  useEffect(() => {
    if (initialAction === 'new') { setView('new'); onActionConsumed && onActionConsumed(); }
    else if (initialAction === 'list') { setView('list'); onActionConsumed && onActionConsumed(); }
  }, [initialAction]);

  return (
    <div className="aw-doc-page">
      {view === 'list' && <SupplierTree picked={picked} setPicked={setPicked} />}
      <div className="aw-doc-main">
        {view === 'list'   && <SupplierListView onNew={() => setView('new')} onView={(d) => { setDetailData(d); setView('detail'); }} picked={picked} />}
        {view === 'new'    && <SupplierNewView onBack={() => setView('list')} />}
        {view === 'detail' && <SupplierDetailView onBack={() => setView('list')} data={detailData} />}
      </div>
    </div>
  );
}

// Export — 注册到全局
window.SupplierListScreen = SupplierListScreen;
// ui_kits/erp-console/supplier-category.jsx
// 供应商分组 — 列表 / 新增 / 编辑 三态

function SupplierCategoryScreen({ module: mod }) {
  const m = mod || { name: '供应商', code: 'supp' };
  const { Card, Btn, Field, Input, Select } = window;

  // ===================== 模拟数据 =====================
  const [groups, setGroups] = useState([
    { id: 1,  name: '金属材料',     parentId: null, parentName: null,     level: 1, code: 'SUPP_GRP_METAL', description: '各类金属原材料及合金材料', tags: { level: '战略供应商', status: null, settlement: '月结' }, supplierCount: 25 },
    { id: 2,  name: '电子元器件',   parentId: null, parentName: null,     level: 1, code: 'SUPP_GRP_ELEC', description: '电子元器件、半导体等',     tags: { level: '重要供应商', status: null, settlement: '现结' }, supplierCount: 42 },
    { id: 3,  name: '化工材料',     parentId: null, parentName: null,     level: 1, code: 'SUPP_GRP_CHEM', description: '化工原料及辅料',           tags: { level: '一般供应商', status: null, settlement: '周期' }, supplierCount: 18 },
    { id: 4,  name: '有色金属',     parentId: 1,    parentName: '金属材料', level: 2, code: 'SUPP_GRP_NFE',  description: '',                       tags: { level: null,        status: null, settlement: null },   supplierCount: 8  },
    { id: 5,  name: 'IC芯片',       parentId: 2,    parentName: '电子元器件', level: 2, code: 'SUPP_GRP_IC',   description: '集成电路与芯片',       tags: { level: null,        status: '合格', settlement: '现结' }, supplierCount: 32 },
    { id: 6,  name: '包装耗材',     parentId: null, parentName: null,     level: 1, code: 'SUPP_GRP_PKG',  description: '包装材料及耗材',         tags: { level: null,        status: null, settlement: null },   supplierCount: 5  },
  ]);

  // ===================== 状态 =====================
  const [view, setView] = useState('list');        // 'list' | 'new' | 'edit'
  const [editId, setEditId] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { id, name } | null
  const [toast, setToast] = useState(null); // { message, type } | null

  // ===================== 表单状态 =====================
  const emptyForm = { name: '', parentId: '', code: '', description: '', defaultLevel: '', defaultStatus: '', defaultSettlement: '' };
  const [form, setForm] = useState({ ...emptyForm });

  // ===================== Toast =====================
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ===================== 派生数据 =====================
  // 过滤后的列表（按搜索文本）
  const filteredGroups = groups.filter(g =>
    !searchText || g.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // 可用作上级分类的选项（当前分组不能选自己，编辑时排除自身及子孙）
  const getParentOptions = (excludeId) => {
    return groups.filter(g => {
      if (g.id === excludeId) return false;
      if (g.level >= 2) return false; // 最多三级，所以只能选1级或2级做父级
      return true;
    });
  };

  // 获取某个分组的层级深度
  const getLevel = (parentId) => {
    if (!parentId) return 1;
    const parent = groups.find(g => g.id === parentId);
    if (!parent) return 1;
    return parent.level + 1;
  };

  // 标签显示
  const formatTags = (tags) => {
    const parts = [];
    if (tags.level) parts.push(tags.level);
    if (tags.status) parts.push(tags.status);
    if (tags.settlement) parts.push(tags.settlement);
    return parts.length > 0 ? parts.join(' | ') : '未设置';
  };

  // ===================== 操作 =====================
  // 打开新增表单
  const openNew = () => {
    setForm({ ...emptyForm });
    setEditId(null);
    setView('new');
  };

  // 打开编辑表单
  const openEdit = (row) => {
    setEditId(row.id);
    setForm({
      name: row.name,
      parentId: row.parentId ? String(row.parentId) : '',
      code: row.code || '',
      description: row.description || '',
      defaultLevel: row.tags.level || '',
      defaultStatus: row.tags.status || '',
      defaultSettlement: row.tags.settlement || '',
    });
    setView('edit');
  };

  // 添加子分类
  const openAddChild = (parent) => {
    setForm({
      ...emptyForm,
      parentId: String(parent.id),
    });
    setEditId(null);
    setView('new');
  };

  // 保存
  const handleSave = () => {
    if (!form.name.trim()) {
      showToast('请填写分组名称', 'error');
      return;
    }

    // 检查名称唯一性（编辑时排除自身）
    const nameExists = groups.some(g =>
      g.name === form.name.trim() && (view === 'new' || g.id !== editId)
    );
    if (nameExists) {
      showToast('分组名称已存在，请修改后重新提交', 'error');
      return;
    }

    const parentId = form.parentId ? Number(form.parentId) : null;
    const level = getLevel(parentId);
    const parent = parentId ? groups.find(g => g.id === parentId) : null;

    if (view === 'new') {
      const newId = Math.max(0, ...groups.map(g => g.id)) + 1;
      const newGroup = {
        id: newId,
        name: form.name.trim(),
        parentId: parentId,
        parentName: parent ? parent.name : null,
        level: level,
        code: form.code.trim() || `SUPP_GRP_${String(newId).padStart(3, '0')}`,
        description: form.description.trim(),
        tags: {
          level: form.defaultLevel || null,
          status: form.defaultStatus || null,
          settlement: form.defaultSettlement || null,
        },
        supplierCount: 0,
      };
      setGroups(prev => [...prev, newGroup]);
      showToast('分组创建成功', 'success');
    } else {
      // 编辑
      setGroups(prev => prev.map(g =>
        g.id === editId
          ? {
              ...g,
              name: form.name.trim(),
              parentId: parentId,
              parentName: parent ? parent.name : null,
              level: level,
              code: form.code.trim() || g.code,
              description: form.description.trim(),
              tags: {
                level: form.defaultLevel || null,
                status: form.defaultStatus || null,
                settlement: form.defaultSettlement || null,
              },
            }
          : g
      ));
      showToast('分组更新成功', 'success');
    }

    setView('list');
  };

  // 取消
  const handleCancel = () => {
    setView('list');
    setEditId(null);
  };

  // 删除
  const handleDelete = (row) => {
    setDeleteConfirm(row);
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    const id = deleteConfirm.id;
    // 递归找出所有子孙分类
    const descendants = new Set();
    const findDescendants = (pid) => {
      groups.forEach(g => {
        if (g.parentId === pid && !descendants.has(g.id)) {
          descendants.add(g.id);
          findDescendants(g.id);
        }
      });
    };
    findDescendants(id);
    const allIds = [id, ...descendants];

    setGroups(prev => prev.filter(g => !allIds.includes(g.id)));
    setDeleteConfirm(null);
    showToast(`已删除「${deleteConfirm.name}」及其子分类`, 'success');
  };

  // ===================== 计算层级标签 =====================
  const levelLabel = (level) => `第${level}级`;

  // ===================== 上级分类改变时自动计算层级 =====================
  const handleParentChange = (e) => {
    const pid = e.target.value;
    setForm(f => ({ ...f, parentId: pid }));
  };

  // ===================== 渲染：删除确认弹窗 =====================
  const renderDeleteConfirm = () => {
    if (!deleteConfirm) return null;
    return (
      <div className="aw-mask" onClick={() => setDeleteConfirm(null)}>
        <div className="aw-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
          <div className="head">
            确认删除
            <span style={{ cursor: 'pointer', color: '#9CA3AF' }} onClick={() => setDeleteConfirm(null)}>✕</span>
          </div>
          <div className="body" style={{ padding: '20px 24px' }}>
            <div style={{ marginBottom: 12 }}>
              确定要删除分组「<strong>{deleteConfirm.name}</strong>」吗？
            </div>
            <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>
              删除后该分组下的子分类将一并删除，<br />
              供应商不会删除但会失去分组归属。
            </div>
          </div>
          <div className="foot" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '12px 24px' }}>
            <Btn onClick={() => setDeleteConfirm(null)}>取消</Btn>
            <Btn kind="danger" onClick={confirmDelete}>确认删除</Btn>
          </div>
        </div>
      </div>
    );
  };

  // ===================== 渲染：Toast =====================
  const renderToast = () => {
    if (!toast) return null;
    const bg = toast.type === 'error' ? '#FEF2F2' : '#F0FDF4';
    const fg = toast.type === 'error' ? '#DC2626' : '#16A34A';
    return (
      <div style={{
        position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
        zIndex: 9999, padding: '10px 24px', borderRadius: 8,
        background: bg, color: fg, fontSize: 14, fontWeight: 500,
        boxShadow: '0 4px 12px rgba(0,0,0,.12)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span>{toast.type === 'error' ? '✕' : '✓'}</span>
        {toast.message}
      </div>
    );
  };

  // ===================== 渲染：列表页 =====================
  const renderList = () => (
    <div className="aw-doc-page" style={{ alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* 工具栏 */}
        <div className="aw-doc-tb">
          <Input
            placeholder="搜索分组名称…"
            style={{ width: 220 }}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
          <button className="aw-btn primary" onClick={openNew}>+ 新增分组</button>
        </div>

        {/* 表格 */}
        <div className="aw-doc-tbl-wrap">
          <div className="aw-doc-tbl-inner">
            <table className="aw-doc-tbl">
              <thead>
                <tr>
                  <th><div className="aw-th-inner">分组名称</div></th>
                  <th><div className="aw-th-inner">上级分类</div></th>
                  <th><div className="aw-th-inner">层级</div></th>
                  <th><div className="aw-th-inner">关联标签</div></th>
                  <th><div className="aw-th-inner">供应商数量</div></th>
                  <th><div className="aw-th-inner">操作</div></th>
                </tr>
              </thead>
              <tbody>
                {filteredGroups.map(row => (
                  <tr key={row.id}>
                    <td style={{ fontWeight: 500 }}>{row.name}</td>
                    <td>{row.parentName || <span style={{ color: 'var(--aw-fg-4)' }}>—</span>}</td>
                    <td className="aw-num">{levelLabel(row.level)}</td>
                    <td>
                      {row.tags.level || row.tags.status || row.tags.settlement
                        ? <span className="aw-badge b" style={{ fontSize: 12 }}>{formatTags(row.tags)}</span>
                        : <span style={{ color: 'var(--aw-fg-4)', fontSize: 13 }}>未设置</span>
                      }
                    </td>
                    <td className="aw-num">{row.supplierCount}家</td>
                    <td>
                      <span className="aw-link" style={{ marginRight: 12 }} onClick={() => openEdit(row)}>编辑</span>
                      {row.level < 3 && (
                        <span className="aw-link" style={{ marginRight: 12 }} onClick={() => openAddChild(row)}>添加子分类</span>
                      )}
                      <span className="aw-link" style={{ color: 'var(--aw-danger)' }} onClick={() => handleDelete(row)}>删除</span>
                    </td>
                  </tr>
                ))}
                {filteredGroups.length === 0 && (
                  <tr className="aw-row-blank">
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--aw-fg-3)', padding: '32px 12px', fontSize: 13 }}>
                      暂无分组数据，点击「新增分组」开始创建
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  // ===================== 渲染：新增/编辑表单 =====================
  const renderForm = () => {
    const isEdit = view === 'edit';
    const parentOptions = getParentOptions(isEdit ? editId : null);

    return (
      <div className="aw-doc-page" style={{ alignItems: 'flex-start' }}>
        <div className="aw-doc-form" style={{ flex: 1 }}>
          <div className="aw-doc-form-head">
            <span className="aw-link" onClick={handleCancel}>← 返回列表</span>
            <span style={{ flex: 1 }} />
            <Btn onClick={handleCancel}>取消</Btn>
            <Btn kind="primary" onClick={handleSave}>确认保存</Btn>
          </div>

          <div className="aw-doc-form-body">
            {/* ═══ 基本信息 ═══ */}
            <Card title="基本信息">
              <div className="aw-doc-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <Field label="分组名称" req>
                  <Input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="请输入分组名称，如：金属材料"
                  />
                </Field>
                <Field label="上级分类">
                  <Select value={form.parentId} onChange={handleParentChange}>
                    <option value="">不选为顶级分类（最多支持三级）</option>
                    {parentOptions.map(opt => (
                      <option key={opt.id} value={String(opt.id)}>
                        {opt.name}（{levelLabel(opt.level)}）
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="分组编码">
                  <Input
                    value={form.code}
                    onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                    placeholder="系统自动生成，可手动修改（用于对接外部系统）"
                  />
                </Field>
                <Field label="分组描述">
                  <Input
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="请简要描述该分组的范围或用途"
                  />
                </Field>
              </div>
            </Card>

            {/* ═══ 标签设置 ═══ */}
            <Card title="标签设置">
              <div className="aw-sub-hint">标签用于多维度标记供应商，可在列表页按标签筛选</div>
              <div className="aw-doc-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                <Field label="默认等级">
                  <Select
                    value={form.defaultLevel}
                    onChange={e => setForm(f => ({ ...f, defaultLevel: e.target.value }))}
                  >
                    <option value="">请选择默认战略等级</option>
                    <option value="战略供应商">战略供应商</option>
                    <option value="重要供应商">重要供应商</option>
                    <option value="一般供应商">一般供应商</option>
                  </Select>
                  <div className="aw-field-hint">请选择该分组下供应商的默认战略等级</div>
                </Field>
                <Field label="默认状态">
                  <Select
                    value={form.defaultStatus}
                    onChange={e => setForm(f => ({ ...f, defaultStatus: e.target.value }))}
                  >
                    <option value="">请选择默认合作状态</option>
                    <option value="合格">合格</option>
                    <option value="试用中">试用中</option>
                    <option value="暂停合作">暂停合作</option>
                    <option value="淘汰">淘汰</option>
                  </Select>
                  <div className="aw-field-hint">新供应商加入该分组时的默认合作状态</div>
                </Field>
                <Field label="默认结算">
                  <Select
                    value={form.defaultSettlement}
                    onChange={e => setForm(f => ({ ...f, defaultSettlement: e.target.value }))}
                  >
                    <option value="">请选择默认结算方式</option>
                    <option value="现结">现结</option>
                    <option value="月结">月结</option>
                    <option value="周期">周期</option>
                    <option value="额度">额度</option>
                  </Select>
                  <div className="aw-field-hint">常用结算方式，仅作参考</div>
                </Field>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  // ===================== 主渲染 =====================
  return (
    <>
      {view === 'list' && renderList()}
      {(view === 'new' || view === 'edit') && renderForm()}
      {renderDeleteConfirm()}
      {renderToast()}
    </>
  );
}

// 注册到全局
window.SupplierCategoryScreen = SupplierCategoryScreen;

Object.assign(window, {
  Topbar,
  Sidebar,
  PageHead,
  Card,
  Btn,
  Field,
  HelpTip,
  Input,
  Select,
  Switch,
  Radio,
  Tabs,
  Badge,
  KPI,
  Modal,
  StandardModal,
  ConfirmModal,
  FormGrid,
  InfoGrid,
  UploadBox,
  AttachmentGrid,
  EmptyState,
  PickerModal,
  PickerSearch,
  StepRow,
  StatusPill,
  NAV,
  DEPT_CONFIG,
  MODULES,
  PICK_MAP,
  MODULE_DOC,
});
