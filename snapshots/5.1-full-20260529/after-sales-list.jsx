// ui_kits/erp-console/after-sales-list.jsx
// 售后中心：售后单 / 任务管理 / 质量闭环
const { useState: useAsState, useEffect: useAsEffect } = React;

const AS_CONFIG = {
  asService:{ title:'售后单', treeTitle:'售后单视图', groups:['全部售后单','待受理','处理中','待客户确认','已关闭','异常升级'], newLabel:'新增售后', codeLabel:'售后单号', subjectLabel:'售后主题', typeLabel:'售后类型', statusLabel:'售后状态', statuses:['待处理','处理中','已完成','已关闭'], row:{subject:'客户设备异常处理',code:'SH-000001',customer:'海南微为智造产业有限公司',type:'维修处理',priority:'紧急',owner:'老夏',date:'2025-05-01',status:'待处理',sourceOrder:'SO-20251221002',sourceDelivery:'DLV-20251222001',receivable:'待确认',invoice:'未开票'} },
  asTask:{ kind:'task', title:'任务管理', treeTitle:'任务类型', groups:['全部任务','退货入库','换货出库','退款处理','维修派工','现场服务','客户确认'], newLabel:'新增任务', codeLabel:'任务编号', subjectLabel:'任务主题', typeLabel:'任务类型', statusLabel:'任务状态', statuses:['待处理','处理中','待客户确认','已完成','异常'], row:{subject:'退货入库处理任务',code:'AST-202505-001',customer:'海南微为智造产业有限公司',type:'退货入库',priority:'紧急',owner:'仓库/财务',date:'2025-05-01',status:'待处理',sourceOrder:'SO-20251221002',sourceDelivery:'DLV-20251222001',receivable:'待应收调整',invoice:'待红冲'} },
  asRefundExchange:{ title:'退换退款', treeTitle:'处理类型', groups:['全部退换退款','待审核','退款退货','仅退款','换货','仅退货','异常处理'], newLabel:'新增退换退款', codeLabel:'退换退款单号', subjectLabel:'退换退款主题', typeLabel:'处理类型', statusLabel:'审核状态', statuses:['待审核','已通过','驳回','已关闭'], row:{subject:'WL0001退换退款申请',code:'ASR-202505-001',customer:'海南微为智造产业有限公司',type:'退换退款',priority:'紧急',owner:'老夏',date:'2025-05-01',status:'待审核',sourceOrder:'SO-20251221002',sourceDelivery:'DLV-20251222001',receivable:'待应收调整',invoice:'待红冲'} },
  asRefundReturn:{ kind:'refundReturn', title:'退款退货', treeTitle:'退款退货分类', groups:['全部退款退货','待退货入库','待退款审核','待打款','已完成','异常单'], newLabel:'新增退款退货', codeLabel:'退款退货单号', subjectLabel:'退款退货主题', typeLabel:'处理方式', statusLabel:'处理状态', statuses:['待退货入库','待退款审核','待打款','已完成','异常'], row:{subject:'退货入库并退款',code:'ARR-202505-001',customer:'海南微为智造产业有限公司',type:'退款退货',priority:'紧急',owner:'仓库/财务',date:'2025-05-01',status:'待退货入库',sourceOrder:'SO-20251221002',sourceDelivery:'DLV-20251222001',refund:'28,000.00',receivable:'冲减应收28,000.00',invoice:'待红冲'} },
  asRefundOnly:{ kind:'refundOnly', title:'仅退款', treeTitle:'仅退款分类', groups:['全部仅退款','待退款审核','待财务打款','已退款','驳回','异常单'], newLabel:'新增仅退款', codeLabel:'仅退款单号', subjectLabel:'仅退款主题', typeLabel:'退款类型', statusLabel:'退款状态', statuses:['待退款审核','待财务打款','已退款','驳回','异常'], row:{subject:'订单差价仅退款',code:'ARO-202505-001',customer:'海南微为智造产业有限公司',type:'仅退款',priority:'中等',owner:'财务',date:'2025-05-01',status:'待退款审核',refund:'3,200.00',receivable:'差价冲减3,200.00'} },
  asExchange:{ kind:'exchange', title:'换货', treeTitle:'换货分类', groups:['全部换货','待退货入库','待换出出库','运输中','已完成','异常单'], newLabel:'新增换货', codeLabel:'换货单号', subjectLabel:'换货主题', typeLabel:'换货类型', statusLabel:'换货状态', statuses:['待退货入库','待换出出库','运输中','已完成','异常'], row:{subject:'标签破损换货',code:'AEX-202505-001',customer:'海南微为智造产业有限公司',type:'换货',priority:'一般',owner:'仓库',date:'2025-05-01',status:'待退货入库',refund:'0.00',receivable:'无需退款'} },
  asReturnOnly:{ kind:'returnOnly', title:'仅退货', treeTitle:'仅退货分类', groups:['全部仅退货','待退货入库','待应收调整','已完成','异常单'], newLabel:'新增仅退货', codeLabel:'仅退货单号', subjectLabel:'仅退货主题', typeLabel:'退货类型', statusLabel:'退货状态', statuses:['待退货入库','待应收调整','已完成','异常'], row:{subject:'客户退货不退款',code:'ART-202505-001',customer:'海南微为智造产业有限公司',type:'仅退货',priority:'中等',owner:'仓库/财务',date:'2025-05-01',status:'待退货入库',refund:'0.00',receivable:'应收调整28,000.00'} },
  asDispatch:{ kind:'dispatch', title:'服务派工', treeTitle:'派工视图', groups:['全部派工','待派工','已派工','上门处理中','待客户确认','已完成'], newLabel:'新增服务派工', codeLabel:'派工单号', subjectLabel:'派工主题', typeLabel:'服务类型', statusLabel:'派工状态', statuses:['待派单','已派单','上门处理中','待客户确认','已完成'], row:{subject:'设备调试服务派工',code:'ASD-202505-001',customer:'海南微为智造产业有限公司',type:'上门服务',priority:'紧急',owner:'老夏',date:'2025-05-01',status:'待派单'} },
  asConfig:{ title:'基础设置', treeTitle:'设置分类', groups:['售后原因','投诉问题','售后类型','处理方式'], newLabel:'添加配置', codeLabel:'配置编号', subjectLabel:'配置名称', typeLabel:'配置类型', statusLabel:'状态', statuses:['启用','停用'], row:{subject:'包装破损',code:'ASC-202505-001',customer:'关联售后',type:'售后原因',priority:'-',owner:'老夏',date:'2025-05-01',status:'启用'} },
  asQuality:{ kind:'quality', title:'质量闭环', treeTitle:'质量视图', groups:['全部质量闭环','D1组建团队','D4根因分析','CAPA执行','效果验证','已关闭'], newLabel:'新增质量闭环', codeLabel:'改进单号', subjectLabel:'质量主题', typeLabel:'问题类型', statusLabel:'闭环状态', statuses:['D1团队确认','D3临时遏制','D4根因分析','D5措施评审','CAPA执行中','D8关闭'], row:{subject:'标签破损质量闭环',code:'AQI-202505-001',customer:'售后/质检联动',type:'包装问题',priority:'高',owner:'质检主管',date:'2025-05-01',status:'D4根因分析',eightD:'8D-202505-001',capa:'CAPA-202505-006'} },
};

const AS_SOURCE_DEFAULTS = {
  sourceOrder:'SO-20251221002',
  sourceDelivery:'DLV-20251222001',
  sourceDetail:'DLV-20251222001-01',
  sourceReceivable:'AR-20251222001',
  sourceInvoice:'INV-20251224001',
  maxQty:'80',
  maxRefund:'28,000.00',
  inboundState:'待退货入库',
  outboundState:'待换出出库',
  refundState:'待退款审核',
  receivableState:'待应收调整',
  invoiceState:'待红冲',
};

const AS_PRODUCTS = [
  ['WL0001','P2422H-S','原料','包装','个','100','280.00','100','退换货','退换货'],
  ['WL0002','P2422H-S','成品','标签','包','100','280.00','100','退换货','退换货'],
];

const AS_METRICS = [
  { label:'待受理', value:'18', tone:'y', sub:'4 单即将超 SLA' },
  { label:'处理中', value:'42', tone:'b', sub:'仓储/财务/服务并行' },
  { label:'待客户确认', value:'9', tone:'y', sub:'平均等待 1.6 天' },
  { label:'本月关闭', value:'126', tone:'g', sub:'一次解决率 92%' },
  { label:'异常预警', value:'6', tone:'r', sub:'金额/质量/物流异常' },
];

const AS_REASON_OPTIONS = ['包装破损','产品故障','少发/错发','客户误购','价格差异','服务投诉'];
const AS_PROCESS_OPTIONS = ['维修处理','退款退货','仅退款','换货','仅退货','补发配件','现场服务'];
const AS_COMPLAINT_OPTIONS = ['做工粗糙/有瑕疵','无法开机','温控异常','显示异常','包装破损','配件缺失'];

const AS_SLA_STEPS = [
  { step:'客户提交', owner:'客户/销售', target:'即时', state:'已完成', time:'2025-05-01 09:12' },
  { step:'客服受理', owner:'售后客服', target:'2小时', state:'已完成', time:'2025-05-01 10:25' },
  { step:'责任判定', owner:'售后主管', target:'8小时', state:'处理中', time:'待判定' },
  { step:'仓储/财务处理', owner:'仓储/财务', target:'2天', state:'待处理', time:'待流转' },
  { step:'客户确认关闭', owner:'客户成功', target:'1天', state:'待处理', time:'待回访' },
];

const AS_SERVICE_RECORDS = [
  { time:'2025-05-01 10:25', actor:'售后客服', action:'受理并核验来源订单', note:'确认发货数量、已售后数量、发票状态' },
  { time:'2025-05-01 11:10', actor:'仓储主管', action:'预占退货暂存区', note:'退回品到仓后触发复检' },
  { time:'2025-05-01 14:30', actor:'财务', action:'测算可退金额', note:'已开票，需红冲或应收冲减' },
];

function AsMiniStats() {
  return <div style={{display:'grid',gridTemplateColumns:'repeat(5,minmax(0,1fr))',gap:10,marginBottom:12}}>{AS_METRICS.map(m=><div key={m.label} style={{border:'1px solid var(--aw-border)',background:'#fff',borderRadius:8,padding:'12px 14px',minWidth:0}}><div style={{display:'flex',justifyContent:'space-between',gap:8,alignItems:'center'}}><span style={{fontSize:12,color:'var(--aw-fg-3)'}}>{m.label}</span><Badge tone={m.tone}>{m.tone==='r'?'预警':m.tone==='g'?'达成':'跟进'}</Badge></div><div className="aw-num" style={{fontSize:24,fontWeight:700,marginTop:8}}>{m.value}</div><div style={{fontSize:12,color:'var(--aw-fg-3)',marginTop:4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.sub}</div></div>)}</div>;
}

function AsSlaBadge({ level='正常' }) {
  if (level === '超时') return <Badge tone="r">已超时</Badge>;
  if (level === '临期') return <Badge tone="y">临期</Badge>;
  return <Badge tone="g">正常</Badge>;
}

function AsSlaTimeline() {
  return <div style={{display:'grid',gridTemplateColumns:'repeat(5,minmax(138px,1fr))',gap:10,overflow:'auto'}}>{AS_SLA_STEPS.map((s,i)=><div key={s.step} style={{border:'1px solid var(--aw-border)',borderRadius:8,padding:12,background:i<2?'var(--aw-tint-mint)':i===2?'var(--aw-tint-peach)':'#fff',minHeight:112}}><div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}><strong style={{fontSize:13}}>{s.step}</strong><AsTone status={s.state}/></div><div style={{fontSize:12,color:'var(--aw-fg-3)',marginTop:8,lineHeight:1.7}}>责任：{s.owner}<br/>时限：{s.target}<br/>时间：{s.time}</div></div>)}</div>;
}

function AsProcessMatrix() {
  const rows = [
    ['退款退货','退货入库、质检判定','退款付款、应收冲减、发票红冲','退回品复检，可触发8D','入库过账 + 财务完成 + 客户确认'],
    ['仅退款','不产生库存动作','退款付款、应收冲减','重大问题转质量改进','财务打款 + 回写核销'],
    ['换货','退货入库、换出出库、物流追踪','差价补退或无需调整','换出OQC放行','换出签收 + 客户确认'],
    ['仅退货','退货入库、库存状态隔离','应收调整或发票红冲','退回品质量判定','入库 + 应收处理完成'],
  ];
  return <table className="aw-table"><thead><tr>{['处理方式','仓储动作','财务动作','质量动作','关闭条件'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map(r=><tr key={r[0]}>{r.map((c,i)=><td key={i}>{i===0?<Badge tone={i===0?'b':'g'}>{c}</Badge>:c}</td>)}</tr>)}</tbody></table>;
}

function AsAttachmentUpload() {
  return <div className="aw-as-upload-only">
    <div className="aw-as-upload-box">
      <span className="aw-link">点击或将文件拖拽到这里上传</span>
      <div>建议上传问题照片/视频、物流签收凭证、检测报告或现场沟通记录，证据越完整，责任判定和后续处理越快。</div>
      <div>支持图片、视频、PDF、Excel、Word 等附件。</div>
    </div>
  </div>;
}

function AsTone({ status }) {
  if (['已完成','已关闭','已通过','已退款','启用','已完成','已入库','已打款','已验证'].includes(status)) return <Badge tone="g">{status}</Badge>;
  if (['驳回','异常','停用','已超时','客诉升级'].includes(status)) return <Badge tone="r">{status}</Badge>;
  return <Badge tone="y">{status}</Badge>;
}

function AsListActions({ row, onView }) {
  const status = row.status || '';
  const stop = (e) => e.stopPropagation();
  const open = (e) => { e.stopPropagation(); onView(row); };
  const completed = ['已完成','已关闭','已退款','已通过'].includes(status);
  const processing = ['已指派','处理中','上门处理中','待客户确认'].includes(status);
  const nextAction = completed ? null : processing ? '处理' : '指派';
  return <span style={{display:'inline-flex',gap:8}}>
    <span className="aw-link" onClick={open}>查看</span>
    {nextAction && <span className="aw-link" onClick={stop}>{nextAction}</span>}
  </span>;
}

function AsRows(config) {
  const b = {...AS_SOURCE_DEFAULTS, ...config.row};
  return [
    b,
    {...b, code:b.code.replace('001','002'), subject:config.groups[1] + '示例', status:config.statuses[0]},
    {...b, code:b.code.replace('001','003'), subject:config.groups[2] + '示例', status:config.statuses[1] || config.statuses[0]},
    {...b, code:b.code.replace('001','004'), subject:config.groups[3] + '示例', status:config.statuses[2] || config.statuses[0]},
  ];
}

const AS_SOURCE_ROWS = [
  { cat:'订单', code:'SO-20251221002', subject:'智能温控锅售后退货', date:'2025-05-01', customer:'海南微为智造产业有限公司', contact:'老夏', phone:'13888888888', manager:'老夏', group:'代理商', sourceOrder:'SO-20251221002', sourceDelivery:'DLV-20251222001', sourceDetail:'DLV-20251222001-01', sourceReceivable:'AR-20251222001', sourceInvoice:'INV-20251224001', maxQty:'80', maxRefund:'28,000.00' },
  { cat:'项目', code:'PRJ-2025-HN01', subject:'海南微为售后项目换货', date:'2025-05-04', customer:'海南微为智造产业有限公司', contact:'老夏', phone:'13888888888', manager:'老夏', group:'代理商', sourceOrder:'SO-20251221002', sourceDelivery:'DLV-20251222001', sourceDetail:'DLV-20251222001-02', sourceReceivable:'AR-20251222001', sourceInvoice:'INV-20251224001', maxQty:'18', maxRefund:'6,300.00' },
  { cat:'订单', code:'SO-20251221018', subject:'包装破损换货申请', date:'2025-05-03', customer:'深圳市启明科技有限公司', contact:'王芳', phone:'13700137003', manager:'张国', group:'重点客户', sourceOrder:'SO-20251221018', sourceDelivery:'DLV-20251223008', sourceDetail:'DLV-20251223008-02', sourceReceivable:'AR-20251223008', sourceInvoice:'INV-20251225009', maxQty:'36', maxRefund:'12,600.00' },
  { cat:'项目', code:'PRJ-2025-SZ01', subject:'启明项目售后换货', date:'2025-05-05', customer:'深圳市启明科技有限公司', contact:'王芳', phone:'13700137003', manager:'张国', group:'重点客户', sourceOrder:'SO-20251221018', sourceDelivery:'DLV-20251223008', sourceDetail:'DLV-20251223008-03', sourceReceivable:'AR-20251223008', sourceInvoice:'INV-20251225009', maxQty:'10', maxRefund:'3,500.00' },
  { cat:'订单', code:'SO-20251218006', subject:'客户批量退货诉求', date:'2025-05-06', customer:'广州智造电子', contact:'李主管', phone:'13666666666', manager:'李文涛', group:'项目客户', sourceOrder:'SO-20251218006', sourceDelivery:'DLV-20251219003', sourceDetail:'DLV-20251219003-01', sourceReceivable:'AR-20251219003', sourceInvoice:'INV-20251221004', maxQty:'24', maxRefund:'9,800.00' },
  { cat:'项目', code:'PRJ-2025-001', subject:'项目交付异常换货', date:'2025-05-08', customer:'杭州云联技术', contact:'陈经理', phone:'13999999999', manager:'陈思源', group:'长期客户', sourceOrder:'SO-20251226001', sourceDelivery:'DLV-20251227001', sourceDetail:'DLV-20251227001-04', sourceReceivable:'AR-20251227001', sourceInvoice:'INV-20251228001', maxQty:'12', maxRefund:'6,400.00' },
];

const AS_SOURCE_BATCHES = {
  'SO-20251221002': [
    { deliveryNo:'DLV-20251222001', detailNo:'DLV-20251222001-01', deliveryDate:'2025-05-01', warehouse:'成品仓-A', logistics:'顺丰 SF100200300', qty:80, amount:'28,000.00', status:'已签收' },
    { deliveryNo:'DLV-20251226006', detailNo:'DLV-20251226006-01', deliveryDate:'2025-05-06', warehouse:'成品仓-B', logistics:'德邦 DP88912001', qty:24, amount:'8,400.00', status:'运输中' },
  ],
  'PRJ-2025-HN01': [
    { deliveryNo:'DLV-20251222001', detailNo:'DLV-20251222001-02', deliveryDate:'2025-05-04', warehouse:'项目仓-A', logistics:'琼A12345', qty:18, amount:'6,300.00', status:'已验收' },
    { deliveryNo:'DLV-20251228002', detailNo:'DLV-20251228002-01', deliveryDate:'2025-05-08', warehouse:'项目仓-B', logistics:'琼A56789', qty:8, amount:'2,800.00', status:'待验收' },
  ],
  'SO-20251221018': [
    { deliveryNo:'DLV-20251223008', detailNo:'DLV-20251223008-02', deliveryDate:'2025-05-03', warehouse:'华南成品仓', logistics:'京东物流 JD8899001', qty:36, amount:'12,600.00', status:'已签收' },
    { deliveryNo:'DLV-20251225011', detailNo:'DLV-20251225011-01', deliveryDate:'2025-05-05', warehouse:'华南成品仓', logistics:'顺丰 SF9988120', qty:12, amount:'4,200.00', status:'已签收' },
  ],
  'PRJ-2025-SZ01': [
    { deliveryNo:'DLV-20251223008', detailNo:'DLV-20251223008-03', deliveryDate:'2025-05-05', warehouse:'项目仓-SZ', logistics:'粤B67231', qty:10, amount:'3,500.00', status:'已验收' },
  ],
  'SO-20251218006': [
    { deliveryNo:'DLV-20251219003', detailNo:'DLV-20251219003-01', deliveryDate:'2025-05-06', warehouse:'广州成品仓', logistics:'跨越 KY20251219003', qty:24, amount:'9,800.00', status:'已签收' },
  ],
  'PRJ-2025-001': [
    { deliveryNo:'DLV-20251227001', detailNo:'DLV-20251227001-04', deliveryDate:'2025-05-08', warehouse:'项目仓-HZ', logistics:'浙A91320', qty:12, amount:'6,400.00', status:'已验收' },
  ],
};

function AsSourcePickerModal({ customer, onClose, onConfirm }) {
  const [cat, setCat] = useAsState('订单');
  const [picked, setPicked] = useAsState(null);
  const [pickedBatches, setPickedBatches] = useAsState({});
  const customerName = customer?.name || '';
  const rows = AS_SOURCE_ROWS.filter(row => customerName && row.cat === cat && row.customer === customerName);
  const batches = picked ? (AS_SOURCE_BATCHES[picked.code] || []) : [];
  const selectedBatches = batches.filter(b => pickedBatches[b.detailNo]);
  const toggleBatch = detailNo => setPickedBatches(prev => ({...prev, [detailNo]: !prev[detailNo]}));
  const confirmSource = () => {
    if (!picked) return;
    const chosen = selectedBatches.length ? selectedBatches : batches.slice(0, 1);
    const qty = chosen.reduce((sum, item) => sum + Number(item.qty || 0), 0);
    const first = chosen[0] || {};
    onConfirm({
      ...picked,
      sourceDelivery: chosen.map(item => item.deliveryNo).join('、') || picked.sourceDelivery,
      sourceDetail: chosen.map(item => item.deliveryNo).join('、') || picked.sourceDelivery,
      deliveryDate: chosen.map(item => item.deliveryDate).join('、') || picked.date,
      deliveryStatus: chosen.map(item => `${item.deliveryNo} ${item.status}`).join('；'),
      deliveryWarehouse: chosen.map(item => item.warehouse).join('、'),
      deliveryLogistics: chosen.map(item => item.logistics).join('、'),
      maxQty: qty || picked.maxQty,
      maxRefund: first.amount || picked.maxRefund,
      selectedBatches: chosen,
    });
  };
  return (
    <div className="aw-mask" onClick={onClose}>
      <div className="aw-modal lg" onClick={e=>e.stopPropagation()}>
        <div className="head"><span>选择售后来源</span><span style={{cursor:'pointer',color:'var(--aw-fg-4)'}} onClick={onClose}>×</span></div>
        <div className="body" style={{display:'grid',gridTemplateColumns:'180px minmax(0,1fr)',padding:0,minHeight:430}}>
          <div style={{borderRight:'1px solid var(--aw-divider)',padding:12,background:'var(--aw-surface-2)'}}>
            {['订单','项目'].map(item => (
              <div key={item} className={'aw-tree-row aw-tree-l2 '+(cat===item?'on':'')} onClick={()=>{setCat(item);setPicked(null);setPickedBatches({});}}>
                <TileIcon name={item==='订单'?'doc':'folder'} size={14}/><span>{item}</span>
              </div>
            ))}
          </div>
          <div style={{padding:16,overflow:'auto'}}>
            <div style={{fontSize:13,color:'var(--aw-fg-3)',marginBottom:12}}>当前客户：<span className="aw-link">{customerName || '请先选择客户'}</span>　当前来源：<span className="aw-link">{cat}</span></div>
            <table className="aw-table">
              <thead><tr><th style={{width:56}}>选择</th><th>来源编号</th><th>来源主题</th><th>客户</th><th>来源日期</th><th>产品数</th></tr></thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.code} onClick={()=>{setPicked(row);setPickedBatches({});}} style={{cursor:'pointer'}}>
                    <td><Radio on={picked?.code===row.code} /></td>
                    <td className="aw-num">{row.code}</td>
                    <td className="aw-link">{row.subject}</td>
                    <td>{row.customer}</td>
                    <td>{row.date}</td>
                    <td>{row.maxQty}</td>
                  </tr>
                ))}
                {!rows.length && <tr><td colSpan={6} style={{textAlign:'center',color:'var(--aw-fg-3)',padding:'28px 12px'}}>{customerName ? '当前客户暂无该类型来源' : '请先选择客户后再选择来源'}</td></tr>}
              </tbody>
            </table>
            {picked && <div style={{marginTop:16}}>
              <div className="section-title" style={{marginBottom:10}}>发货 / 交付批次</div>
              <table className="aw-table">
                <thead><tr><th style={{width:56}}>选择</th><th>发货单号</th><th>发货日期</th><th>发货仓库</th><th>物流</th><th>发货数量</th><th>状态</th></tr></thead>
                <tbody>
                  {batches.map(batch => (
                    <tr key={batch.detailNo} onClick={()=>toggleBatch(batch.detailNo)} style={{cursor:'pointer'}}>
                      <td><input type="checkbox" checked={!!pickedBatches[batch.detailNo]} readOnly /></td>
                      <td className="aw-num">{batch.deliveryNo}</td>
                      <td>{batch.deliveryDate}</td>
                      <td>{batch.warehouse}</td>
                      <td>{batch.logistics}</td>
                      <td>{batch.qty}</td>
                      <td><Badge tone={batch.status.includes('待')?'y':'g'}>{batch.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{fontSize:12,color:'var(--aw-fg-3)',marginTop:8}}>可多选发货单批次；未勾选时默认带入第一条批次。</div>
            </div>}
          </div>
        </div>
        <div className="foot"><Btn onClick={onClose}>取消</Btn><Btn kind="primary" onClick={confirmSource}>确定</Btn></div>
      </div>
    </div>
  );
}

function AsTree({ config, picked, setPicked }) {
  return <div className="aw-doc-tree"><div className="aw-doc-tree-h">{config.treeTitle} <span className="aw-doc-tree-n">(999)</span></div><div className="aw-doc-tree-list">{config.groups.map((g,i)=><div key={g} className={'aw-tree-row aw-tree-l2'+(picked===g?' on':'')} onClick={()=>setPicked(g)}><span className="aw-tree-caret">{i===0?'▾':''}</span><TileIcon name={i===0?'folder':'doc'} size={14}/><span>{g}</span></div>)}</div></div>;
}

function AsListView({ config, picked, onNew, onView }) {
  const [sel,setSel]=useAsState({0:true});
  const [status,setStatus]=useAsState('');
  const [sla,setSla]=useAsState('');
  const [scene,setScene]=useAsState('');
  const rows=AsRows(config).filter(r=>{
    if (status && r.status !== status) return false;
    if (picked && picked !== config.groups[0]) {
      const key = picked.replace(/^全部/,'').replace(/单$/,'');
      if (![r.status,r.type,r.subject,r.inboundState,r.refundState,r.receivableState,r.invoice].filter(Boolean).some(v=>String(v).includes(key))) return false;
    }
    return true;
  });
  const allChecked=rows.length>0&&rows.every((_,i)=>sel[i]);
  const someChecked=rows.some((_,i)=>sel[i]);
  const toggleAll=()=>{ if(allChecked)setSel({}); else { const n={}; rows.forEach((_,i)=>n[i]=true); setSel(n);} };
  const toggleRow=i=>setSel(s=>({...s,[i]:!s[i]}));
  const extraFilters = <><Select value={scene} onChange={e=>setScene(e.target.value)} style={{width:118}}><option value="">全部场景</option>{AS_PROCESS_OPTIONS.map(t=><option key={t}>{t}</option>)}</Select><Select value={sla} onChange={e=>setSla(e.target.value)} style={{width:112}}><option value="">SLA状态</option><option>正常</option><option>临期</option><option>超时</option></Select></>;
  const bulkActions = <><Btn>批量派单</Btn><Btn>批量催办</Btn></>;
  return <><AsMiniStats/><PurchaseListToolbar searchPlaceholder={`全局搜索（如${config.subjectLabel}、${config.codeLabel}、客户、来源订单）`} newLabel={config.newLabel} onNew={onNew} afterSearch={extraFilters}/><div className="aw-doc-tbl-wrap"><div className="aw-doc-tbl-inner"><table className="aw-doc-tbl" style={{whiteSpace:'nowrap'}}><thead><tr><PurchaseSelectHeader checked={allChecked} indeterminate={someChecked} onToggle={toggleAll}/><PurchaseIndexHeader />{[config.subjectLabel,config.codeLabel,'客户','来源订单','来源发货单','来源明细',config.typeLabel,'可售后数量','可退金额','SLA','仓储处理','财务处理','发票处理','客户确认','质量联动','优先级','负责人','提交时间'].map(c=><th key={c} style={{width:c.length>4?130:100}}><div className="aw-th-inner">{c}</div></th>)}<PurchaseStatusFilterHeader label={config.statusLabel} value={status} onChange={setStatus} options={config.statuses} width={150}/><th style={{width:150}}><div className="aw-th-inner">操作</div></th></tr></thead><tbody>{rows.map((r,i)=>{const slaLevel=i===1?'临期':i===2?'超时':'正常';return <tr key={r.code} onClick={()=>onView(r)} style={{cursor:'pointer'}}><PurchaseSelectCell checked={!!sel[i]} onToggle={()=>toggleRow(i)}/><td>{i+1}</td><td className="aw-link">{r.subject}</td><td className="aw-num">{r.code}</td><td>{r.customer}</td><td>{r.sourceOrder}</td><td>{r.sourceDelivery}</td><td>{r.sourceDetail}</td><td>{r.type}</td><td>{r.maxQty}</td><td className="aw-num">{r.refund||r.maxRefund||'0.00'}</td><td><AsSlaBadge level={slaLevel}/></td><td>{r.inboundState||r.outboundState||'无需仓储'}</td><td>{r.receivable||r.refundState||r.receivableState||'无需调整'}</td><td>{r.invoice||r.invoiceState||'未开票'}</td><td>{i===3?'已确认':'待确认'}</td><td>{r.type==='维修处理'||r.type==='换货'?<Badge tone="y">待判定</Badge>:<Badge tone="g">无需</Badge>}</td><td>{r.priority}</td><td>{r.owner}</td><td>{r.date}</td><td><AsTone status={r.status}/></td><td><AsListActions row={r} onView={onView}/></td></tr>})}</tbody></table></div></div><PurchaseListFooter total={800} selectedCount={Object.values(sel).filter(Boolean).length} allChecked={allChecked} someChecked={someChecked} onToggleAll={toggleAll} pages={23} bulkActions={bulkActions}/></>;
}

function AsBaseFieldContent({ config, row }) {
  const data = {...AS_SOURCE_DEFAULTS, ...(row||config.row||{})};
  const [customer, setCustomer] = useAsState({ name:data.customer||'海南微为智造产业有限公司', contact:'老夏', phone:'13888888888', manager:'老夏', group:'代理商' });
  const [source, setSource] = useAsState(data);
  const [subject, setSubject] = useAsState(data.subject || config.row?.subject || '');
  const [showSourcePicker, setShowSourcePicker] = useAsState(false);
  const subjectPlaceholder = config.kind === 'exchange' ? '请输入或选择换货主题' : config.kind === 'returnOnly' || config.kind === 'refundReturn' ? '请输入或选择退货主题' : '请输入或选择退换退款主题';
  const applySource = (picked) => {
    setSubject(picked.subject);
    setCustomer({name:picked.customer, contact:picked.contact, phone:picked.phone, manager:picked.manager, group:picked.group});
    setSource({...source, ...picked});
    setShowSourcePicker(false);
  };
  return (
    <>
      <div className="aw-doc-grid">
        <Field label="选择主题" req>
          <div style={{display:'flex',gap:8}}>
            <Input value={subject} onChange={e=>setSubject(e.target.value)} placeholder={subjectPlaceholder} style={{flex:1}} />
            <Btn onClick={()=>setShowSourcePicker(true)}>选择</Btn>
          </div>
        </Field>
        <Field label="联系人"><Input value={customer.contact} readOnly /></Field>
        <Field label="联系电话"><Input value={customer.phone} readOnly /></Field>
        <Field label="客户名称"><Input value={customer.name} readOnly /></Field>
        <Field label="收货地址"><Input defaultValue="海南省海口市龙华区华海路安海大厦" /></Field>
        <Field label="客户类别"><Input value={customer.group} readOnly /></Field>
        <Field label="销售经理"><Input value={customer.manager} readOnly /></Field>
        <Field label="来源分类"><Input value={source.cat || '订单'} readOnly /></Field>
        <Field label="来源销售订单" req><Input value={source.sourceOrder} readOnly /></Field>
        <Field label="来源发货单" req><Input value={source.sourceDelivery} readOnly /></Field>
        <Field label="来源明细" req><Input value={source.sourceDetail} readOnly /></Field>
        <Field label="原应收单"><Input value={source.sourceReceivable} readOnly /></Field>
        <Field label="原发票"><Input value={source.sourceInvoice} readOnly /></Field>
        <Field label="可售后数量"><Input value={source.maxQty} readOnly /></Field>
        <Field label="可退金额"><Input value={source.maxRefund} readOnly /></Field>
        <Field label="红冲/应收策略"><Input value="已开票需红冲或应收冲减" readOnly /></Field>
        <Field label="售后日期"><Input defaultValue="2025-05-01" /></Field>
        <Field label={config.codeLabel}><Input defaultValue="自动生成" disabled /></Field>
        <Field label={config.statusLabel}><Input value={config.statuses[0]} readOnly /></Field>
        <Field label="SLA等级"><Select defaultValue="紧急-2小时受理"><option>紧急-2小时受理</option><option>标准-8小时受理</option><option>低优先-24小时受理</option></Select></Field>
        <Field label="优先级"><div style={{display:'flex',gap:14,alignItems:'center',height:32}}><Radio on>紧急</Radio><Radio>中等</Radio><Radio>一般</Radio></div></Field>
      </div>
      {showSourcePicker && <AsSourcePickerModal customer={customer} onClose={()=>setShowSourcePicker(false)} onConfirm={applySource} />}
    </>
  );
}

function AsBaseFields({ config, row }) {
  return <PurchaseSection title="基本信息"><AsBaseFieldContent config={config} row={row}/></PurchaseSection>;
}

function AsSourceProducts(source) {
  if (!source) return [];
  const baseCode = source.sourceDetail || source.code || 'SRC-001';
  const detailPrefix = String(baseCode).replace(/-\d+$/, '');
  if (source.cat === '项目') {
    return [
      { code:'PRD-P001', name:'项目交付控制柜', model:'AW-CAB-900', materialType:'成品', category:'电控设备', spec:'900*600*2200', unit:'台', qty:6, price:'18,500.00', aftered:1 },
      { code:'PRD-P002', name:'现场传感器组件', model:'AW-SEN-12', materialType:'成品', category:'电子物料', spec:'12点套装', unit:'套', qty:12, price:'1,260.00', aftered:0 },
    ].map((p,i)=>({...p, detail:`${detailPrefix}-${String(i+1).padStart(2,'0')}`}));
  }
  if (source.cat === '客户') {
    return [
      { code:'CP-2025010101', name:'智能温控终端', model:'PRO', materialType:'成品', category:'终端设备', spec:'标准版', unit:'台', qty:24, price:'1,180.00', aftered:2 },
      { code:'CP-2025010102', name:'半成品模组', model:'HM-450', materialType:'半成品', category:'电子模组', spec:'450型', unit:'件', qty:36, price:'520.00', aftered:4 },
    ].map((p,i)=>({...p, detail:`${detailPrefix}-${String(i+1).padStart(2,'0')}`}));
  }
  return AS_PRODUCTS.map((p,i)=>({
    detail:`${detailPrefix}-${String(i+1).padStart(2,'0')}`,
    code:p[0],
    name:i===0?'智能温控终端':'包装标签套件',
    model:p[1],
    materialType:p[2],
    category:p[3],
    spec:i===0?'PRO 标准版':'外箱标签',
    unit:p[4],
    qty:Number(p[5] || 0),
    price:p[6],
    aftered:20,
  }));
}

function AsProductTable({ source, type='退款退货', withActions=true, review=false }) {
  const effectiveSource = source === undefined ? { ...AS_SOURCE_DEFAULTS, cat:'订单', code:'SO-20251221002' } : source;
  const products = AsSourceProducts(effectiveSource);
  if (!products.length) return <div className="aw-empty">请选择来源后，系统会带出对应的订单/项目/客户可售后产品。</div>;
  return <table className="aw-table"><thead><tr>{withActions&&<th style={{width:52}}>选择</th>}<th>序号</th><th>来源明细</th><th>产品编号</th><th>产品名称</th><th>规格型号</th><th>物料类型</th><th>物料分类</th><th>单位</th><th>实供数量</th><th>已售后</th><th>可售后</th><th>本次售后数量</th>{!review&&<th>问题原因</th>}</tr></thead><tbody>{products.map((p,i)=>{const canQty=Number(p.qty||0)-Number(p.aftered||0);const defaultQty=Math.max(1, Math.min(canQty, i===0?8:2));return <tr key={p.detail}>{withActions&&<td><input type="checkbox" defaultChecked={i===0} /></td>}<td>{i+1}</td><td>{p.detail}</td><td>{p.code}</td><td>{p.name}</td><td>{p.model}</td><td>{p.materialType}</td><td>{p.category}</td><td>{p.unit}</td><td>{p.qty}</td><td>{p.aftered}</td><td>{canQty}</td><td>{review?defaultQty:<Input defaultValue={defaultQty} style={{width:82}} />}</td>{!review&&<td><Select defaultValue={AS_REASON_OPTIONS[0]}>{AS_REASON_OPTIONS.map(item=><option key={item}>{item}</option>)}</Select></td>}</tr>})}</tbody></table>;
}

const AS_FLOW_STEPS = ['选择客户','选择类型','选择来源','问题证据','提交'];
const AS_AFTERSALE_TYPES = [
  { key:'退款退货', title:'退款退货', desc:'需要退回实物，并触发退款、应收冲减或发票红冲。', owners:'仓储 / 财务 / 售后' },
  { key:'仅退款', title:'仅退款', desc:'不退回实物，只处理差价、赔付或服务补偿退款。', owners:'财务 / 售后' },
  { key:'换货', title:'换货', desc:'先退回问题品，再换出新货并跟踪物流签收。', owners:'仓储 / 质检 / 售后' },
  { key:'仅退货', title:'仅退货', desc:'只退回实物，不产生退款，重点处理库存和应收调整。', owners:'仓储 / 财务' },
  { key:'维修处理', title:'维修', desc:'派工维修、配件消耗、服务记录和客户回访。', owners:'服务 / 售后' },
  { key:'现场服务', title:'现场服务', desc:'上门排查、调试、培训或回访，不一定产生退换货动作。', owners:'服务 / 客户成功' },
];

function AsFlowStepper({ step, setStep }) {
  return <div className="aw-as-stepper">{AS_FLOW_STEPS.map((label, idx)=><button key={label} type="button" className={'aw-as-step '+(idx===step?'on':'')+(idx<step?' done':'')} onClick={()=>setStep(idx)}><span>{idx+1}</span>{label}</button>)}</div>;
}

function AsFlowTypeCards({ value, onChange }) {
  return <div className="aw-as-type-grid">{AS_AFTERSALE_TYPES.map(item=><button key={item.key} type="button" className={'aw-as-type-card '+(value===item.key?'on':'')} onClick={()=>onChange(item.key)}><strong>{item.title}</strong><span>{item.desc}</span><em>{item.owners}</em></button>)}</div>;
}

function AsFlowPlan({ type }) {
  const isReturn = ['退款退货','换货','仅退货','退货入库','换货出库'].includes(type);
  const isRefund = ['退款退货','仅退款','退款处理'].includes(type);
  const isService = ['维修处理','现场服务','维修派工'].includes(type);
  return <div className="aw-as-plan-grid">
    {isReturn && <div className="aw-as-plan-card"><strong>仓储动作</strong><p>生成退货入库任务，收货后隔离暂存并等待质检判定。</p></div>}
    {type==='换货' && <div className="aw-as-plan-card"><strong>换出动作</strong><p>退货入库确认后生成换出出库，关联物流和客户签收。</p></div>}
    {isRefund && <div className="aw-as-plan-card"><strong>财务动作</strong><p>进入退款审核，联动应收冲减、红字发票或付款批次。</p></div>}
    {isService && <div className="aw-as-plan-card"><strong>服务动作</strong><p>生成服务派工，记录上门、维修、配件和回访结果。</p></div>}
    <div className="aw-as-plan-card"><strong>质量动作</strong><p>根据问题类型判定是否触发复检、8D 或 CAPA 闭环。</p></div>
  </div>;
}

function AsAfterSalesFlowForm({ config, onBack, isQuality }) {
  const [step, setStep] = useAsState(0);
  const [source, setSource] = useAsState(null);
  const [subject, setSubject] = useAsState('');
  const [customer, setCustomer] = useAsState({
    name:'',
    contact:'',
    phone:'',
    manager:'',
    group:'',
  });
  const [contactIndex, setContactIndex] = useAsState(0);
  const [addressIndex, setAddressIndex] = useAsState(0);
  const [type, setType] = useAsState(isQuality ? '质量问题' : (config.row?.type || '退款退货'));
  const [showSourcePicker, setShowSourcePicker] = useAsState(false);
  const [showCustomerPicker, setShowCustomerPicker] = useAsState(false);
  const selectedProducts = AsSourceProducts(source);
  const hasCustomer = !!customer.name;
  const customerContacts = hasCustomer ? [
    { contact: customer.contact || '默认联系人', phone: customer.phone || '', title:'默认联系人' },
    { contact: '售后负责人', phone: '13900001111', title:'售后负责人' },
    { contact: '仓库收货人', phone: '13700002222', title:'仓库收货人' },
  ] : [];
  const customerAddresses = hasCustomer ? [
    '海南省海口市龙华区华海路安海大厦',
    '海南省海口市美兰区滨海大道项目仓',
    '海南省澄迈县老城开发区智能制造园',
  ] : [];
  const pickedContact = customerContacts[contactIndex] || { contact:'', phone:'', title:'' };
  const applySource = picked => {
    setSource({...AS_SOURCE_DEFAULTS, ...picked});
    setSubject(picked.subject);
    setCustomer({ name:picked.customer, contact:picked.contact, phone:picked.phone, manager:picked.manager, group:picked.group });
    setContactIndex(0);
    setAddressIndex(0);
    setShowSourcePicker(false);
  };
  const goNextFromSource = () => { if (source) setStep(3); };
  const goNextFromCustomer = () => { if (hasCustomer) setStep(1); };
  const openSourcePicker = () => { if (hasCustomer) setShowSourcePicker(true); };
  const sourceValue = (key) => source ? source[key] : '选择来源后自动填充';
  const sourceFields = source?.cat === '项目'
    ? [
        ['项目编号', 'code'],
        ['项目名称', 'subject'],
        ['关联订单号', 'sourceOrder'],
        ['发货/交付批次', 'sourceDelivery'],
        ['发货/交付日期', 'deliveryDate'],
        ['批次状态', 'deliveryStatus'],
        ['来源日期', 'date'],
      ]
    : [
        ['订单号', 'sourceOrder'],
        ['发货单号', 'sourceDelivery'],
        ['发货日期', 'deliveryDate'],
        ['发货状态', 'deliveryStatus'],
        ['客户', 'customer'],
        ['来源日期', 'date'],
      ];
  const sourceHint = source?.cat === '项目'
    ? '项目来源会先带出项目编号、项目名称，再选择关联订单和发货/交付批次；可售后产品按项目交付明细生成。'
    : source?.cat === '订单'
      ? '订单来源会带出订单号，并继续选择该订单下的一次或多次发货单；可售后产品按所选发货明细生成。'
      : '请先选择来源。选择订单时带出订单号和发货单号；选择项目时带出项目编号、关联订单号和发货/交付批次。';
  return <PurchaseFormPage onBack={onBack} submitText={isQuality?'提交改进':'提交'} className="aw-as-flow-form">
    <PurchaseSection title="售后受理流程"><AsFlowStepper step={step} setStep={setStep} /></PurchaseSection>
    {step===0 && <PurchaseSection title="选择客户"><div className="aw-doc-grid"><Field label="客户名称" req><div style={{display:'flex',gap:8}}><Input value={customer.name} readOnly placeholder="请选择客户" style={{flex:1}} /><Btn onClick={()=>setShowCustomerPicker(true)}>选择客户</Btn></div></Field><Field label="客户类别"><Input value={customer.group} readOnly placeholder="选择客户后填充" /></Field><Field label="销售经理"><Input value={customer.manager} readOnly placeholder="选择客户后填充" /></Field><Field label="联系人"><Select value={contactIndex} onChange={e=>setContactIndex(Number(e.target.value))} disabled={!hasCustomer}>{hasCustomer ? customerContacts.map((item,idx)=><option key={item.title} value={idx}>{item.contact}（{item.title}）</option>) : <option>选择客户后填充</option>}</Select></Field><Field label="联系电话"><Input value={pickedContact.phone} readOnly placeholder="选择客户后填充" /></Field><Field label="收货地址"><Select value={addressIndex} onChange={e=>setAddressIndex(Number(e.target.value))} disabled={!hasCustomer}>{hasCustomer ? customerAddresses.map((addr,idx)=><option key={addr} value={idx}>{idx===0?'默认地址：':''}{addr}</option>) : <option>选择客户后填充</option>}</Select></Field></div><div className="aw-as-empty-note">先确认客户主体，再选择售后类型和来源单据；客户信息会用于后续联系人、地址、客户确认和回访。</div><div style={{display:'flex',justifyContent:'flex-end',marginTop:14}}><Btn kind="primary" onClick={goNextFromCustomer}>确认客户</Btn></div></PurchaseSection>}
    {step===1 && <PurchaseSection title="选择售后类型"><AsFlowTypeCards value={type} onChange={setType} /><div style={{display:'flex',justifyContent:'space-between',marginTop:14}}><Btn onClick={()=>setStep(0)}>上一步</Btn><Btn kind="primary" onClick={()=>setStep(2)}>确认类型</Btn></div></PurchaseSection>}
    {step===2 && <PurchaseSection title="选择主题 / 来源"><div className="aw-doc-grid"><Field label="售后主题" req><div style={{display:'flex',gap:8}}><Input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="选择来源后可自动带出，也可以手动调整主题" style={{flex:1}} /><Btn onClick={openSourcePicker}>选择来源</Btn></div></Field><Field label="来源分类"><Input value={sourceValue('cat')} readOnly /></Field>{sourceFields.map(([label,key])=><Field label={label} key={label}><Input value={sourceValue(key)} readOnly /></Field>)}</div><div className="aw-as-empty-note">{hasCustomer ? sourceHint : '请先返回第一步选择客户，系统会按客户过滤相关订单和项目。'}</div><div style={{display:'flex',justifyContent:'space-between',marginTop:14}}><Btn onClick={()=>setStep(1)}>上一步</Btn><Btn kind="primary" onClick={goNextFromSource}>确认来源</Btn></div></PurchaseSection>}
    {step===3 && <><PurchaseSection title="来源产品"><div style={{display:'flex',gap:10,alignItems:'center',marginBottom:12}}><Btn>校验可售后数量</Btn><span style={{fontSize:12,color:'var(--aw-fg-3)'}}>按当前{source?.cat || '来源'}的产品明细校验已售后占用，勾选本次需要售后的产品并填写售后数量。</span></div><AsProductTable source={source} type={type} /></PurchaseSection><PurchaseSection title="证据附件"><AsAttachmentUpload /></PurchaseSection><PurchaseSection title="售后详情"><PurchaseRichText placeholder="请输入售后问题描述、客户诉求、沟通记录、现场情况或补充说明..." /></PurchaseSection><div style={{display:'flex',justifyContent:'space-between'}}><Btn onClick={()=>setStep(2)}>上一步</Btn><Btn kind="primary" onClick={()=>setStep(4)}>预览提交</Btn></div></>}
    {step===4 && <><PurchaseSection title="提交前预览"><div className="aw-doc-grid"><AsKV label="售后主题" value={subject || '-'} /><AsKV label="客户" value={customer.name || '-'} /><AsKV label="售后类型" value={<Badge tone="b">{type}</Badge>} /><AsKV label="来源分类" value={source?.cat || '-'} /><AsKV label="来源单据" value={source?.code || '-'} /><AsKV label="来源订单" value={source?.sourceOrder || '-'} /><AsKV label="来源发货/交付" value={source?.sourceDelivery || '-'} /><AsKV label="发货/交付日期" value={source?.deliveryDate || '-'} /><AsKV label="批次状态" value={source?.deliveryStatus || '-'} /><AsKV label="产品行数" value={`${selectedProducts.length} 行来源产品`} /></div></PurchaseSection><PurchaseSection title="本次售后产品预览"><AsProductTable source={source} type={type} withActions={false} review /></PurchaseSection><PurchaseSection title="售后详情"><div style={{border:'1px solid var(--aw-border)',borderRadius:8,minHeight:120,padding:14,lineHeight:1.8,color:'var(--aw-fg-2)',background:'var(--aw-surface)'}}>客户反馈产品存在异常，需结合来源单据、产品明细、问题证据和沟通记录进行售后处理。本次提交内容用于售后指派前确认，后续处理人可继续补充执行动作和关闭信息。</div></PurchaseSection><PurchaseSection title="附件信息"><div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:12}}>{['问题照片.jpg','物流签收凭证.pdf','检测报告.xlsx'].map(name=><div key={name} style={{border:'1px solid var(--aw-border)',borderRadius:8,padding:'12px 14px',background:'var(--aw-surface-2)',color:'var(--aw-fg-2)'}}>📎 {name}</div>)}</div></PurchaseSection><div style={{display:'flex',justifyContent:'space-between'}}><Btn onClick={()=>setStep(3)}>上一步</Btn><Btn kind="primary">提交</Btn></div></>}
    {showSourcePicker && <AsSourcePickerModal customer={customer} onClose={()=>setShowSourcePicker(false)} onConfirm={applySource} />}
    {showCustomerPicker && <SimpleCustomerPickerModal onClose={()=>setShowCustomerPicker(false)} onConfirm={(picked)=>{setCustomer({name:picked.name,contact:picked.contact,phone:picked.phone,manager:picked.manager,group:picked.group});setSource(null);setSubject('');setContactIndex(0);setShowCustomerPicker(false);}} />}
  </PurchaseFormPage>;
}

function AsConfigFormView({ onBack }) {
  const tabs = ['售后原因','投诉问题','售后类型','处理方式'];
  return <PurchaseFormPage onBack={onBack} submitText="保存配置">
    <PurchaseSection title="售后基础设置"><div className="aw-tabs" style={{marginBottom:12}}>{tabs.map((t,i)=><span key={t} className={'aw-tab '+(i===0?'on':'')}>{t}</span>)}</div><div className="aw-doc-grid" style={{marginBottom:16}}><Field label="配置名称" req><Input defaultValue="包装破损" /></Field><Field label="配置编码"><Input defaultValue="REASON-001" /></Field><Field label="适用范围"><Select defaultValue="售后发起"><option>售后发起</option><option>售后处理</option><option>全部场景</option></Select></Field><Field label="是否启用"><Select defaultValue="启用"><option>启用</option><option>停用</option></Select></Field></div><table className="aw-table"><thead><tr><th>配置分类</th><th>配置名称</th><th>适用范围</th><th>是否启用</th><th>说明</th></tr></thead><tbody>{[
      ['售后原因','包装破损','问题原因下拉','启用','用于产品行原因选择'],
      ['投诉问题','做工粗糙/有瑕疵','售后详情与客诉归类','启用','用于售后详情和质量统计'],
      ['售后类型','退款退货','售后类型选择','启用','用于发起售后的类型选择'],
      ['处理方式','退货入库 / 财务处理','产品行处理动作','启用','用于产品行处理方式选择'],
    ].map(row=><tr key={row[0]}>{row.map((cell,i)=><td key={i}>{i===3?<AsTone status={cell}/>:cell}</td>)}</tr>)}</tbody></table></PurchaseSection>
  </PurchaseFormPage>;
}

function AsFormView({ config, onBack }) {
  const isConfig = config === AS_CONFIG.asConfig;
  const isQuality = config === AS_CONFIG.asQuality;
  if (isConfig) return <AsConfigFormView onBack={onBack} />;
  return <AsAfterSalesFlowForm config={config} onBack={onBack} isQuality={isQuality} />;
}

function AsKV({ label, value }) { return <div style={{display:'flex',gap:14}}><span style={{width:96,color:'var(--aw-fg-3)',flex:'none'}}>{label}：</span><span>{value}</span></div>; }

function AsTaskActionFields({ plan }) {
  if (plan === '退款处理') return <div className="aw-doc-grid"><Field label="退款金额" req><Input defaultValue="28,000.00" /></Field><Field label="退款账户"><Input defaultValue="客户默认账户" /></Field><Field label="财务经办"><Input defaultValue="王会计" /></Field><Field label="应收处理"><Select defaultValue="冲减应收"><option>冲减应收</option><option>原路退款</option><option>挂账待核销</option></Select></Field></div>;
  if (plan === '退货入库') return <div className="aw-doc-grid"><Field label="退货数量" req><Input defaultValue="8" /></Field><Field label="实收数量"><Input defaultValue="8" /></Field><Field label="收货仓库"><Select defaultValue="退货暂存仓"><option>退货暂存仓</option><option>成品仓</option><option>不良品仓</option></Select></Field><Field label="质检状态"><Select defaultValue="待复检"><option>待复检</option><option>可返修</option><option>报废</option><option>良品入库</option></Select></Field></div>;
  if (plan === '换货出库') return <div className="aw-doc-grid"><Field label="换出产品"><Input defaultValue="智能温控终端" /></Field><Field label="换出数量"><Input defaultValue="2" /></Field><Field label="出库批次"><Input defaultValue="LOT-20260522001" /></Field><Field label="物流单号"><Input placeholder="填写物流单号" /></Field></div>;
  if (plan === '补发配件') return <div className="aw-doc-grid"><Field label="补发物料" req><Input defaultValue="包装标签套件" /></Field><Field label="补发数量"><Input defaultValue="2" /></Field><Field label="出库仓库"><Select defaultValue="成品仓"><option>成品仓</option><option>备件仓</option></Select></Field><Field label="物流方式"><Input defaultValue="顺丰" /></Field></div>;
  return <div className="aw-doc-grid"><Field label="预约时间" req><Input defaultValue="2026-05-23 09:30" /></Field><Field label="服务人员"><Input defaultValue="老夏" /></Field><Field label="处理方式"><Select defaultValue="上门维修"><option>上门维修</option><option>远程指导</option><option>返厂维修</option></Select></Field><Field label="使用配件"><Input placeholder="选择或填写使用配件" /></Field><Field label="实际工时"><Input placeholder="填写工时" /></Field><Field label="处理结果"><Select defaultValue="已修复"><option>已修复</option><option>需二次上门</option><option>建议换货</option><option>升级质量闭环</option></Select></Field></div>;
}

function AsTaskDetailView({ config, row, onBack }) {
  const tabs = ['任务信息','问题证据','处理方案','执行记录','客户确认','操作记录'];
  const [tab,setTab]=useAsState(tabs[0]);
  const [plan,setPlan]=useAsState(row.type === '退货入库' ? '退货入库' : row.type === '退款处理' ? '退款处理' : row.type === '换货出库' ? '换货出库' : '维修/现场服务');
  const data = {...AS_SOURCE_DEFAULTS, ...row};
  const taskSteps = [
    ['接单','已完成','售后人员确认任务和SLA'],
    ['确认方案','处理中','选择处理动作、负责人和计划完成时间'],
    ['执行处理','待处理','填写维修、退货、退款、补发等执行结果'],
    ['客户确认','待处理','客户确认结果和满意度'],
    ['关闭归档','待处理','满足关闭条件后归档'],
  ];
  return <div className="aw-doc-form"><div className="aw-doc-form-body">
    <DetailHeaderCard title={`${row.code} ${row.subject}`} status={row.status} onBack={onBack} creator="售后主管" createdAt={`${row.date} 10:25`} modifier={row.owner} modifiedAt="2026-05-22 15:30" detailItems={[[config.codeLabel,row.code],['关联售后单','SH-000001'],['客户',row.customer],[config.typeLabel,row.type],['处理人',row.owner],['SLA','临期']]}/>
    <Card><div className="aw-tabs" style={{marginBottom:14}}>{tabs.map(t=><span key={t} className={'aw-tab '+(tab===t?'on':'')} onClick={()=>setTab(t)}>{t}</span>)}</div>
      {tab==='任务信息'&&<><PurchaseSection title="任务进度"><div style={{display:'grid',gridTemplateColumns:'repeat(5,minmax(120px,1fr))',gap:10}}>{taskSteps.map(s=><div key={s[0]} style={{border:'1px solid var(--aw-border)',borderRadius:8,padding:12,background:s[1]==='已完成'?'var(--aw-tint-mint)':s[1]==='处理中'?'var(--aw-tint-peach)':'#fff'}}><strong>{s[0]}</strong><div style={{marginTop:8}}><AsTone status={s[1]}/></div><p style={{fontSize:12,color:'var(--aw-fg-3)',lineHeight:1.6}}>{s[2]}</p></div>)}</div></PurchaseSection><PurchaseSection title="任务基础信息"><div className="aw-doc-grid"><AsKV label="任务来源" value="新增售后提交"/><AsKV label="关联客户" value={row.customer}/><AsKV label="来源订单" value={data.sourceOrder}/><AsKV label="来源发货单" value={data.sourceDelivery}/><AsKV label="责任部门" value={row.owner}/><AsKV label="计划完成" value="2026-05-24 18:00"/><AsKV label="优先级" value={row.priority}/><AsKV label="当前状态" value={<AsTone status={row.status}/>} /></div></PurchaseSection></>}
      {tab==='问题证据'&&<><PurchaseSection title="来源产品"><AsProductTable withActions={false} review source={{...data, cat:'订单'}} /></PurchaseSection><PurchaseSection title="售后详情"><div style={{border:'1px solid var(--aw-border)',borderRadius:8,padding:14,lineHeight:1.8}}>客户反馈收货后发现包装破损，部分标签套件受潮，要求售后核验后安排处理。来源发货单、物流签收凭证和现场照片已随售后单提交。</div></PurchaseSection><PurchaseSection title="证据附件"><div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:12}}>{['问题照片.jpg','物流签收凭证.pdf','检测报告.xlsx'].map(name=><div key={name} style={{border:'1px solid var(--aw-border)',borderRadius:8,padding:'12px 14px',background:'var(--aw-surface-2)'}}>{name} <span className="aw-link">下载</span></div>)}</div></PurchaseSection></>}
      {tab==='处理方案'&&<><PurchaseSection title="处理方案确认"><div className="aw-doc-grid"><Field label="处理方案" req><Select value={plan} onChange={e=>setPlan(e.target.value)}><option>维修/现场服务</option><option>退货入库</option><option>换货出库</option><option>退款处理</option><option>补发配件</option><option>无需处理</option></Select></Field><Field label="处理人"><Input defaultValue="老夏" /></Field><Field label="协同部门"><Select defaultValue="仓库 / 财务"><option>仓库 / 财务</option><option>仓库</option><option>财务</option><option>质量部</option><option>服务工程师</option></Select></Field><Field label="计划完成时间"><Input defaultValue="2026-05-24 18:00" /></Field></div></PurchaseSection><PurchaseSection title={`${plan}执行信息`}><AsTaskActionFields plan={plan}/><div style={{marginTop:12}}><PurchaseRichText placeholder="填写处理说明、现场判断、风险提示或下一步动作..." /></div></PurchaseSection></>}
      {tab==='执行记录'&&<PurchaseSection title="执行记录"><table className="aw-table"><thead><tr><th>时间</th><th>处理人</th><th>动作</th><th>结果</th><th>附件</th></tr></thead><tbody>{[['2026-05-22 10:25','售后主管','分派售后任务','指派给老夏，要求24小时内确认方案','-'],['2026-05-22 11:10','老夏','核验来源单据','确认发货批次和可售后数量','物流签收凭证.pdf'],['2026-05-22 14:30','老夏','联系客户','预约明日上午现场确认','沟通记录.txt']].map(r=><tr key={r[0]}>{r.map((c,i)=><td key={i}>{i===4&&c!=='-'?<span className="aw-link">{c}</span>:c}</td>)}</tr>)}</tbody></table><div style={{display:'flex',justifyContent:'flex-end',marginTop:12}}><Btn kind="primary">追加执行记录</Btn></div></PurchaseSection>}
      {tab==='客户确认'&&<PurchaseSection title="客户确认"><div className="aw-doc-grid"><Field label="确认方式"><Select defaultValue="电话确认"><option>电话确认</option><option>线上确认</option><option>签字回传</option></Select></Field><Field label="确认人"><Input defaultValue="老夏" /></Field><Field label="确认时间"><Input placeholder="处理完成后填写" /></Field><Field label="满意度"><Select defaultValue="待回访"><option>待回访</option><option>满意</option><option>一般</option><option>不满意</option></Select></Field></div><PurchaseRichText placeholder="填写客户确认意见、回访记录和关闭说明..." /><div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:12}}><Btn>保存确认</Btn><Btn kind="primary">确认关闭</Btn></div></PurchaseSection>}
      {tab==='操作记录'&&<PurchaseSection title="操作记录"><table className="aw-table"><thead><tr><th>时间</th><th>操作人</th><th>操作</th><th>说明</th></tr></thead><tbody>{AS_SERVICE_RECORDS.map(r=><tr key={r.time}><td>{r.time}</td><td>{r.actor}</td><td>{r.action}</td><td>{r.note}</td></tr>)}</tbody></table></PurchaseSection>}
    </Card>
  </div></div>;
}

function AsDetailTabs(config) {
  if (config.kind==='task') return ['任务详情','处理记录','关联售后单','客户确认'];
  if (config.kind==='refundOnly') return ['售后详情','退款处理','售后处理'];
  if (config.kind==='exchange') return ['售后详情','退货入库','换出出库','售后处理'];
  if (config.kind==='returnOnly') return ['售后详情','退货入库','应收调整','售后处理'];
  if (config.kind==='dispatch') return ['售后详情','派单信息','售后处理'];
  if (config.kind==='quality') return ['售后详情','8D报告','CAPA措施','验证关闭'];
  if (config.kind==='refundReturn') return ['售后详情','退货入库','退款处理','售后处理'];
  return ['售后详情','退货入库','退款处理','派单信息','售后处理'];
}

function AsAvailableActions(config, row) {
  const base = ['编辑','审核'];
  if (config.kind === 'refundOnly') return [...base,'退款','红冲/冲减','客户确认','打印'];
  if (config.kind === 'exchange') return [...base,'入库','换出出库','客户确认','打印'];
  if (config.kind === 'returnOnly') return [...base,'入库','应收调整','客户确认','打印'];
  if (config.kind === 'dispatch') return [...base,'派单','服务签到','回访','打印'];
  if (config.kind === 'quality') return [...base,'创建8D','创建CAPA','验证关闭','打印'];
  if (config.kind === 'refundReturn') return [...base,'入库','退款','红冲/冲减','客户确认','打印'];
  return [...base,'派单','退款','入库','红冲/冲减','客户确认','打印'];
}

function AsServiceDetailView({ config, row, onBack }) {
  const tabs = ['基础信息','售后产品','来源财务','处理进度','沟通记录','操作记录'];
  const [tab,setTab]=useAsState(tabs[0]);
  const data = {...AS_SOURCE_DEFAULTS, ...row};
  return <div className="aw-doc-form"><div className="aw-doc-form-body">
    <DetailHeaderCard title={`${row.subject} ${row.code}`} status={row.status} onBack={onBack} creator={row.owner} createdAt={`${row.date} 10:25`} modifier="售后主管" modifiedAt="2025-05-01 15:30" detailItems={[[config.codeLabel,row.code],[config.subjectLabel,row.subject],[config.typeLabel,row.type],['客户',row.customer],[config.statusLabel,row.status],['SLA','临期']]}/>
    <Card>
      <div className="aw-tabs" style={{marginBottom:14}}>{tabs.map(t=><span key={t} className={'aw-tab '+(tab===t?'on':'')} onClick={()=>setTab(t)}>{t}</span>)}</div>
      {tab==='基础信息'&&<><PurchaseSection title="基本信息"><AsBaseFieldContent config={config} row={data}/></PurchaseSection><PurchaseSection title="SLA与流程进度"><AsSlaTimeline/></PurchaseSection></>}
      {tab==='售后产品'&&<><PurchaseSection title="来源产品"><AsProductTable withActions={false}/></PurchaseSection><PurchaseSection title="证据附件"><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>{['问题照片.png','签收凭证.pdf','复检报告.xlsx'].map(n=><div key={n} style={{height:78,border:'1px dashed var(--aw-border-strong)',borderRadius:8,background:'var(--aw-surface-2)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--aw-fg-3)'}}>{n}</div>)}</div></PurchaseSection></>}
      {tab==='来源财务'&&<><PurchaseSection title="来源与财务闭环"><table className="aw-table"><thead><tr><th>来源订单</th><th>来源发货单</th><th>来源明细</th><th>原应收单</th><th>原发票</th><th>可退金额</th><th>应收处理</th><th>发票处理</th><th>回款处理</th></tr></thead><tbody><tr><td>{data.sourceOrder}</td><td>{data.sourceDelivery}</td><td>{data.sourceDetail}</td><td>{data.sourceReceivable}</td><td>{data.sourceInvoice}</td><td>{data.refund||data.maxRefund}</td><td>{data.receivable||data.receivableState}</td><td>{data.invoice||data.invoiceState}</td><td>退款后回写核销和信用占用</td></tr></tbody></table></PurchaseSection><PurchaseSection title="处理联动说明"><AsProcessMatrix/></PurchaseSection></>}
      {tab==='处理进度'&&<><PurchaseSection title="退货入库"><table className="aw-table"><thead><tr><th>序号</th><th>来源明细</th><th>单据类型</th><th>单据编号</th><th>入库类型</th><th>产品名称</th><th>退货数量</th><th>实收数量</th><th>质量状态</th><th>时间</th></tr></thead><tbody><tr><td>1</td><td>{data.sourceDetail}</td><td>入库单</td><td>IN-AS-202505-001</td><td>退货入库</td><td>WL0001</td><td>100</td><td>100</td><td>待复检</td><td>2025-05-01</td></tr></tbody></table></PurchaseSection><PurchaseSection title="售后处理"><div className="aw-doc-grid"><Field label="处理方式"><Select><option>{row.type}</option><option>维修</option><option>补发</option></Select></Field><Field label="关联部门"><Select><option>仓储部</option><option>财务部</option></Select></Field><Field label="回访满意度"><Select><option>待回访</option><option>满意</option><option>一般</option><option>不满意</option></Select></Field></div><PurchaseRichText placeholder="请输入售后处理结果、客户确认意见、关闭说明..." /></PurchaseSection></>}
      {tab==='沟通记录'&&<><PurchaseSection title="沟通与服务记录"><table className="aw-table"><thead><tr><th>时间</th><th>处理人</th><th>动作</th><th>记录</th></tr></thead><tbody>{AS_SERVICE_RECORDS.map(r=><tr key={r.time}><td>{r.time}</td><td>{r.actor}</td><td>{r.action}</td><td>{r.note}</td></tr>)}</tbody></table></PurchaseSection><PurchaseSection title="备注说明"><div style={{border:'1px solid var(--aw-border)',borderRadius:8,minHeight:88,padding:14,color:'var(--aw-fg-3)'}}>客户反馈产品标签破损，售后需核对订单、仓库、财务与服务处理状态。关闭前必须完成客户确认和回访满意度记录。</div></PurchaseSection></>}
      {tab==='操作记录'&&<PurchaseSection title="操作记录"><table className="aw-table"><thead><tr><th>时间</th><th>操作人</th><th>操作</th><th>说明</th></tr></thead><tbody>{AS_SERVICE_RECORDS.map(r=><tr key={r.time}><td>{r.time}</td><td>{r.actor}</td><td>{r.action}</td><td>{r.note}</td></tr>)}</tbody></table></PurchaseSection>}
    </Card>
  </div></div>;
}

function AsDetailView({ config, row, onBack }) {
  if (config.kind === 'task') return <AsTaskDetailView config={config} row={row} onBack={onBack}/>;
  return <AsServiceDetailView config={config} row={row} onBack={onBack}/>;
  const tabs=AsDetailTabs(config);
  const [tab,setTab]=useAsState(tabs[0]);
  useAsEffect(()=>setTab(tabs[0]),[config.kind]);
  const data = {...AS_SOURCE_DEFAULTS, ...row};
  return <div className="aw-doc-form"><div className="aw-doc-form-body"><DetailHeaderCard title={`${row.subject} ${row.code}`} status={row.status} onBack={onBack} creator={row.owner} createdAt={`${row.date} 10:25`} modifier="售后主管" modifiedAt="2025-05-01 15:30" detailItems={[[config.codeLabel,row.code],[config.subjectLabel,row.subject],[config.typeLabel,row.type],['客户',row.customer],[config.statusLabel,row.status],['SLA','临期']]}/><PurchaseSection title="基本信息"><AsBaseFieldContent config={config} row={data}/></PurchaseSection><PurchaseSection title="SLA与流程进度"><AsSlaTimeline/></PurchaseSection><Card><div className="aw-tabs" style={{marginBottom:14}}>{tabs.map(t=><span key={t} className={'aw-tab '+(tab===t?'on':'')} onClick={()=>setTab(t)}>{t}</span>)}</div>{tab==='任务详情'&&<><PurchaseSection title="任务信息"><div className="aw-doc-grid"><AsKV label="任务类型" value={row.type}/><AsKV label="关联售后单" value="SH-000001"/><AsKV label="责任部门" value={row.owner}/><AsKV label="任务状态" value={<AsTone status={row.status}/>} /><AsKV label="来源订单" value={data.sourceOrder}/><AsKV label="来源发货单" value={data.sourceDelivery}/></div></PurchaseSection><PurchaseSection title="任务处理要求"><AsFlowPlan type={row.type}/></PurchaseSection></>}{tab==='处理记录'&&<PurchaseSection title="处理记录"><table className="aw-table"><thead><tr><th>时间</th><th>处理人</th><th>动作</th><th>说明</th></tr></thead><tbody>{AS_SERVICE_RECORDS.map(r=><tr key={r.time}><td>{r.time}</td><td>{r.actor}</td><td>{r.action}</td><td>{r.note}</td></tr>)}</tbody></table></PurchaseSection>}{tab==='关联售后单'&&<PurchaseSection title="关联售后单"><table className="aw-table"><thead><tr><th>售后单号</th><th>售后主题</th><th>客户</th><th>售后类型</th><th>状态</th></tr></thead><tbody><tr><td>SH-000001</td><td>{row.subject}</td><td>{row.customer}</td><td>{row.type}</td><td><AsTone status={row.status}/></td></tr></tbody></table></PurchaseSection>}{tab==='客户确认'&&<PurchaseSection title="客户确认"><div className="aw-doc-grid"><AsKV label="确认方式" value="线上确认"/><AsKV label="确认状态" value={<AsTone status="待客户确认"/>}/><AsKV label="回访满意度" value="待回访"/><AsKV label="关闭条件" value="任务完成 + 客户确认 + 回访记录"/></div></PurchaseSection>}{tab==='售后详情'&&<><PurchaseSection title="售后信息"><AsProductTable withActions={false}/><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginTop:18}}>{['问题照片.png','签收凭证.pdf','复检报告.xlsx'].map(n=><div key={n} style={{height:78,border:'1px dashed var(--aw-border-strong)',borderRadius:8,background:'var(--aw-surface-2)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--aw-fg-3)'}}>{n}</div>)}</div></PurchaseSection><PurchaseSection title="来源与财务闭环"><table className="aw-table"><thead><tr><th>来源订单</th><th>来源发货单</th><th>来源明细</th><th>原应收单</th><th>原发票</th><th>可退金额</th><th>应收处理</th><th>发票处理</th><th>回款处理</th></tr></thead><tbody><tr><td>{data.sourceOrder}</td><td>{data.sourceDelivery}</td><td>{data.sourceDetail}</td><td>{data.sourceReceivable}</td><td>{data.sourceInvoice}</td><td>{data.refund||data.maxRefund}</td><td>{data.receivable||data.receivableState}</td><td>{data.invoice||data.invoiceState}</td><td>退款后回写核销和信用占用</td></tr></tbody></table></PurchaseSection><PurchaseSection title="处理联动说明"><AsProcessMatrix/></PurchaseSection><PurchaseSection title="沟通与服务记录"><table className="aw-table"><thead><tr><th>时间</th><th>处理人</th><th>动作</th><th>记录</th></tr></thead><tbody>{AS_SERVICE_RECORDS.map(r=><tr key={r.time}><td>{r.time}</td><td>{r.actor}</td><td>{r.action}</td><td>{r.note}</td></tr>)}</tbody></table></PurchaseSection><PurchaseSection title="备注说明"><div style={{border:'1px solid var(--aw-border)',borderRadius:8,minHeight:88,padding:14,color:'var(--aw-fg-3)'}}>客户反馈产品标签破损，售后需核对订单、仓库、财务与服务处理状态。关闭前必须完成客户确认和回访满意度记录。</div></PurchaseSection></>}{tab==='退货入库'&&<PurchaseSection title="处理退货入库"><table className="aw-table"><thead><tr><th>序号</th><th>来源明细</th><th>单据类型</th><th>单据编号</th><th>入库类型</th><th>产品名称</th><th>退货数量</th><th>实收数量</th><th>差异</th><th>批次/序列号</th><th>库位</th><th>质量状态</th><th>处置建议</th><th>时间</th></tr></thead><tbody><tr><td>1</td><td>{data.sourceDetail}</td><td>入库单</td><td>IN-AS-202505-001</td><td>退货入库</td><td>WL0001</td><td>100</td><td>100</td><td>0</td><td>LOT-20250428001</td><td>退货暂存区-A01</td><td>待复检</td><td>隔离待判</td><td>2025-05-01</td></tr></tbody></table></PurchaseSection>}{tab==='换出出库'&&<PurchaseSection title="换出出库"><table className="aw-table"><thead><tr><th>序号</th><th>来源明细</th><th>出库单号</th><th>换出产品</th><th>数量</th><th>批次</th><th>OQC状态</th><th>物流单号</th><th>出库人</th><th>状态</th></tr></thead><tbody><tr><td>1</td><td>{data.sourceDetail}</td><td>OUT-AS-202505-001</td><td>WL0001</td><td>100</td><td>LOT-20250501002</td><td>待OQC</td><td>SF100200300</td><td>仓库二</td><td><AsTone status="待换出出库"/></td></tr></tbody></table></PurchaseSection>}{tab==='退款处理'&&<PurchaseSection title="退款处理"><div className="aw-doc-grid"><AsKV label="退款金额" value={data.refund || data.maxRefund}/><AsKV label="退款账户" value="客户默认账户"/><AsKV label="退款状态" value={<AsTone status={data.refundState||row.status}/>} /><AsKV label="财务经办" value="王会计"/><AsKV label="关联应收" value={data.sourceReceivable}/><AsKV label="红字发票" value={data.sourceInvoice}/><AsKV label="付款批次" value="PAY-202505-019"/><AsKV label="核销回写" value="退款完成后冲减应收和信用占用"/></div></PurchaseSection>}{tab==='应收调整'&&<PurchaseSection title="应收调整"><div className="aw-doc-grid"><AsKV label="调整类型" value="销售应收冲减"/><AsKV label="调整金额" value={data.receivable || data.maxRefund}/><AsKV label="关联发票" value={data.sourceInvoice}/><AsKV label="财务状态" value={<AsTone status={data.receivableState}/>}/></div></PurchaseSection>}{tab==='派单信息'&&<PurchaseSection title="派单信息"><table className="aw-table"><thead><tr><th>序号</th><th>服务人员</th><th>技能组</th><th>服务类型</th><th>来源订单</th><th>派单时间</th><th>预约上门</th><th>预计完成</th><th>签到</th><th>状态</th></tr></thead><tbody><tr><td>1</td><td>老夏</td><td>设备调试组</td><td>上门服务</td><td>{data.sourceOrder}</td><td>2025-05-01</td><td>2025-05-02 09:30</td><td>2025-05-02</td><td>待签到</td><td><AsTone status="上门处理中"/></td></tr></tbody></table></PurchaseSection>}{tab==='售后处理'&&<PurchaseSection title="售后处理"><div className="aw-doc-grid"><Field label="问题类型"><Select><option>包装破损</option><option>产品故障</option></Select></Field><Field label="处理方式"><Select><option>{row.type}</option><option>维修</option><option>补发</option></Select></Field><Field label="关联部门"><Select><option>仓储部</option><option>财务部</option></Select></Field><Field label="回访满意度"><Select><option>待回访</option><option>满意</option><option>一般</option><option>不满意</option></Select></Field></div><PurchaseRichText placeholder="请输入售后处理结果、客户确认意见、关闭说明..." /></PurchaseSection>}{tab==='8D报告'&&<PurchaseSection title="8D报告"><div className="aw-doc-grid"><AsKV label="8D单号" value={row.eightD || '8D-202505-001'}/><AsKV label="D4根因" value="包装来料耐磨不足"/><AsKV label="D5措施" value="更换包材并调整检验标准"/><AsKV label="负责人" value={row.owner}/></div></PurchaseSection>}{tab==='CAPA措施'&&<PurchaseSection title="CAPA措施"><div className="aw-doc-grid"><AsKV label="CAPA编号" value={row.capa || 'CAPA-202505-006'}/><AsKV label="纠正措施" value="隔离库存并返工贴标"/><AsKV label="预防措施" value="供应商来料加严检验"/><AsKV label="状态" value={<AsTone status="CAPA执行中"/>}/></div></PurchaseSection>}{tab==='验证关闭'&&<PurchaseSection title="验证关闭"><table className="aw-table"><thead><tr><th>序号</th><th>验证项</th><th>验证方式</th><th>责任人</th><th>计划日期</th><th>结果</th></tr></thead><tbody><tr><td>1</td><td>客诉复发率</td><td>近30天售后追踪</td><td>质检主管</td><td>2025-05-30</td><td><AsTone status="待验证"/></td></tr></tbody></table></PurchaseSection>}</Card></div></div>;
}

const AS_SETTING_DICTS = {
  '售后原因': {
    addLabel:'新增售后原因',
    note:'用于发起售后时产品行的“问题原因”下拉。',
    rows: AS_REASON_OPTIONS.map((name,i)=>({code:`REASON-${String(i+1).padStart(3,'0')}`, name, scene:i<3?'退换货 / 换货':'通用', required:i<3?'是':'否', linkage:i===1?'可触发质量判定':'记录原因'})),
    columns:['编码','原因名称','适用场景','是否常用','后续联动'],
  },
  '投诉问题': {
    addLabel:'新增投诉问题',
    note:'用于售后详情、质量闭环和客诉归类。',
    rows: AS_COMPLAINT_OPTIONS.map((name,i)=>({code:`COMP-${String(i+1).padStart(3,'0')}`, name, scene:i<4?'产品/包装':'服务', required:i<4?'是':'否', linkage:i<4?'可关联质检复判':'服务回访'})),
    columns:['编码','投诉问题','问题归类','是否常用','后续联动'],
  },
  '售后类型': {
    addLabel:'新增售后类型',
    note:'用于发起售后第二步“选择售后类型”。',
    rows: AS_AFTERSALE_TYPES.map((item,i)=>({code:`TYPE-${String(i+1).padStart(3,'0')}`, name:item.title, scene:item.owners, required:'是', linkage:item.desc})),
    columns:['编码','售后类型','责任角色','是否启用','说明'],
  },
  '处理方式': {
    addLabel:'新增处理方式',
    note:'用于问题证据页产品行“处理动作”下拉。',
    rows: ['退货入库 / 财务处理','退货入库 / 换出出库','仅退款','仅退货','维修/现场服务','补发配件','无需处理'].map((name,i)=>({code:`ACTION-${String(i+1).padStart(3,'0')}`, name, scene:AS_PROCESS_OPTIONS[i] || '通用', required:'是', linkage:i===0?'退货入库 + 财务处理':i===1?'退货入库 + 换出出库':i===4?'服务派工':'按动作生成任务'})),
    columns:['编码','处理方式','适用类型','是否启用','后续联动'],
  },
};

function AsSettingsDictionaryView({ action, onBack }) {
  const config = AS_SETTING_DICTS[action];
  const [showNew, setShowNew] = useAsState(false);
  const [fieldOpen, setFieldOpen] = useAsState(false);
  const [sel, setSel] = useAsState({});
  if (!config) return null;
  const rows = config.rows.map((row, i)=>({
    code: row.code,
    name: row.name,
    type: row.scene,
    state: '启用',
    stTone: 'g',
    owner: i % 2 ? '李文涛' : '老夏',
    date: `2026-05-${String(12+i).padStart(2,'0')}`,
  }));
  const cols = [
    {k:'code', label:'配置编码', w:150},
    {k:'name', label:action, w:220},
    {k:'type', label:'适用范围', w:180},
    {k:'state', label:'状态', w:110, filter:['全部','启用','停用']},
    {k:'owner', label:'维护人', w:110},
    {k:'date', label:'更新日期', w:130},
    {k:'op', label:'操作', w:90},
  ];
  const allChecked = rows.length>0 && rows.every((_,i)=>sel[i]);
  const someChecked = rows.some((_,i)=>sel[i]);
  const toggleAll = () => {
    if (allChecked) setSel({});
    else { const next={}; rows.forEach((_,i)=>next[i]=true); setSel(next); }
  };
  const toggleRow = i => setSel(prev=>({...prev,[i]:!prev[i]}));
  return <>
    <div className="aw-doc-tb">
      <div className="aw-doc-search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8"><circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/></svg>
        <input placeholder={`全局搜索（如${action}、配置编码、适用范围…）`} />
      </div>
      <RefreshAction />
      <button className="aw-btn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 5h18M6 12h12M10 19h4"/></svg>筛选</button>
      <button className="aw-btn" onClick={()=>setFieldOpen(true)}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="7" height="7"/><rect x="14" y="4" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>字段配置</button>
      <button className="aw-btn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 4v12"/><path d="M7 11l5 5 5-5"/><path d="M4 20h16"/></svg>导出</button>
      <button className="aw-btn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 20V8"/><path d="M7 13l5-5 5 5"/><path d="M4 4h16"/></svg>导入</button>
      <button className="aw-btn primary" onClick={()=>setShowNew(true)}>{config.addLabel}</button>
    </div>
    <div className="aw-doc-tbl-wrap">
      <DocTable cols={cols} rows={rows} sel={sel} toggleRow={toggleRow} allChecked={allChecked} someChecked={someChecked} toggleAll={toggleAll} onView={()=>setShowNew(true)} />
      <DocFooter total={rows.length * 20} pageSize={10} allChecked={allChecked} someChecked={someChecked} toggleAll={toggleAll} selCount={rows.filter((_,i)=>sel[i]).length} />
    </div>
    {fieldOpen && <FieldDrawer onClose={()=>setFieldOpen(false)} />}
    {showNew && <Modal title={config.addLabel} subtitle={config.note} onClose={()=>setShowNew(false)} footer={<><Btn onClick={()=>setShowNew(false)}>取消</Btn><Btn kind="primary" onClick={()=>setShowNew(false)}>保存</Btn></>}>
      <div className="aw-doc-grid">
        <Field label="配置名称" req><Input defaultValue={config.rows[0]?.name || ''} placeholder={`请输入${action}`} /></Field>
        <Field label="配置编码"><Input defaultValue="自动生成" readOnly /></Field>
        <Field label="适用范围"><Select defaultValue="售后发起"><option>售后发起</option><option>售后处理</option><option>质量闭环</option><option>全部场景</option></Select></Field>
        <Field label="是否启用"><Select defaultValue="启用"><option>启用</option><option>停用</option></Select></Field>
      </div>
    </Modal>}
  </>;
}

function AsActionView({ config, action, onNew, onBack, onView }) {
  if (AS_SETTING_DICTS[action]) return <AsSettingsDictionaryView action={action} onBack={onBack} />;
  return <><div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}><span className="aw-link" onClick={onBack}>← 返回{config.title}</span><span style={{fontSize:13,color:'var(--aw-fg-3)'}}>当前页面：{action}</span></div><AsListView picked={config.groups[0]} config={{...config,newLabel:action.startsWith('新增')?action:`新增${action.replace(/列表|详情|审核|处理流程-|处理|信息/g,'')||config.title}`,subjectLabel:action+'主题'}} onNew={onNew} onView={onView}/></>;
}

function AsModuleScreen({ moduleKey, initialAction, onActionConsumed }) {
  const config=AS_CONFIG[moduleKey]||AS_CONFIG.asService;
  const [view,setView]=useAsState('list');
  const [picked,setPicked]=useAsState(config.groups[0]);
  const [detail,setDetail]=useAsState(config.row);
  const [action,setAction]=useAsState('');
  useAsEffect(()=>{setView('list');setPicked(config.groups[0]);setDetail(config.row);setAction('');},[moduleKey]);
  useAsEffect(()=>{ if(initialAction==='new'){setView('new');onActionConsumed&&onActionConsumed();} else if(initialAction&&initialAction.includes('列表')){setView('list');setAction('');onActionConsumed&&onActionConsumed();} else if(initialAction){setAction(initialAction);setView('action');onActionConsumed&&onActionConsumed();}},[initialAction]);
  const isSettingsAction = view === 'action' && AS_SETTING_DICTS[action];
  const showTree = !isSettingsAction && config !== AS_CONFIG.asConfig && view!=='new'&&view!=='detail';
  return <div className="aw-doc-page">{showTree&&<AsTree config={config} picked={picked} setPicked={setPicked}/>}<div className="aw-doc-main" style={{maxWidth:'none'}}>{view==='list'&&<AsListView config={config} picked={picked} onNew={()=>setView('new')} onView={(r)=>{setDetail(r);setView('detail')}}/>}{view==='action'&&<AsActionView config={config} action={action||config.title} onNew={()=>setView('new')} onBack={()=>setView('list')} onView={(r)=>{setDetail(r);setView('detail')}}/>}{view==='new'&&<AsFormView config={config} onBack={()=>setView('list')}/>} {view==='detail'&&<AsDetailView config={config} row={detail} onBack={()=>setView('list')}/>}</div></div>;
}

window.AsModuleScreen = AsModuleScreen;
