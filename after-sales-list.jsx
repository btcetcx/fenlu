// ui_kits/erp-console/after-sales-list.jsx
// 售后中心：售后工单 / 退换退款 / 服务派工 / 质量闭环 / 基础设置
const { useState: useAsState, useEffect: useAsEffect } = React;

const AS_CONFIG = {
  asService:{ title:'售后工单', treeTitle:'工单视图', groups:['全部工单','待受理','处理中','待客户确认','已关闭','异常升级'], newLabel:'新增工单', codeLabel:'售后单号', subjectLabel:'工单主题', typeLabel:'服务类型', statusLabel:'工单状态', statuses:['待处理','处理中','已完成','已关闭'], row:{subject:'客户设备异常处理',code:'SH-000001',customer:'海南微为智造产业有限公司',type:'维修处理',priority:'紧急',owner:'老夏',date:'2025-05-01',status:'待处理',sourceOrder:'SO-20251221002',sourceDelivery:'DLV-20251222001',receivable:'待确认',invoice:'未开票'} },
  asRefundExchange:{ title:'退换退款', treeTitle:'处理类型', groups:['全部退换退款','待审核','退款退货','仅退款','换货','仅退货','异常处理'], newLabel:'新增退换退款', codeLabel:'退换退款单号', subjectLabel:'退换退款主题', typeLabel:'处理类型', statusLabel:'审核状态', statuses:['待审核','已通过','驳回','已关闭'], row:{subject:'WL0001退换退款申请',code:'ASR-202505-001',customer:'海南微为智造产业有限公司',type:'退换退款',priority:'紧急',owner:'老夏',date:'2025-05-01',status:'待审核',sourceOrder:'SO-20251221002',sourceDelivery:'DLV-20251222001',receivable:'待应收调整',invoice:'待红冲'} },
  asRefundReturn:{ kind:'refundReturn', title:'退款退货', treeTitle:'退款退货分类', groups:['全部退款退货','待退货入库','待退款审核','待打款','已完成','异常单'], newLabel:'新增退款退货', codeLabel:'退款退货单号', subjectLabel:'退款退货主题', typeLabel:'处理方式', statusLabel:'处理状态', statuses:['待退货入库','待退款审核','待打款','已完成','异常'], row:{subject:'退货入库并退款',code:'ARR-202505-001',customer:'海南微为智造产业有限公司',type:'退款退货',priority:'紧急',owner:'仓库/财务',date:'2025-05-01',status:'待退货入库',sourceOrder:'SO-20251221002',sourceDelivery:'DLV-20251222001',refund:'28,000.00',receivable:'冲减应收28,000.00',invoice:'待红冲'} },
  asRefundOnly:{ kind:'refundOnly', title:'仅退款', treeTitle:'仅退款分类', groups:['全部仅退款','待退款审核','待财务打款','已退款','驳回','异常单'], newLabel:'新增仅退款', codeLabel:'仅退款单号', subjectLabel:'仅退款主题', typeLabel:'退款类型', statusLabel:'退款状态', statuses:['待退款审核','待财务打款','已退款','驳回','异常'], row:{subject:'订单差价仅退款',code:'ARO-202505-001',customer:'海南微为智造产业有限公司',type:'仅退款',priority:'中等',owner:'财务',date:'2025-05-01',status:'待退款审核',refund:'3,200.00',receivable:'差价冲减3,200.00'} },
  asExchange:{ kind:'exchange', title:'换货', treeTitle:'换货分类', groups:['全部换货','待退货入库','待换出出库','运输中','已完成','异常单'], newLabel:'新增换货', codeLabel:'换货单号', subjectLabel:'换货主题', typeLabel:'换货类型', statusLabel:'换货状态', statuses:['待退货入库','待换出出库','运输中','已完成','异常'], row:{subject:'标签破损换货',code:'AEX-202505-001',customer:'海南微为智造产业有限公司',type:'换货',priority:'一般',owner:'仓库',date:'2025-05-01',status:'待退货入库',refund:'0.00',receivable:'无需退款'} },
  asReturnOnly:{ kind:'returnOnly', title:'仅退货', treeTitle:'仅退货分类', groups:['全部仅退货','待退货入库','待应收调整','已完成','异常单'], newLabel:'新增仅退货', codeLabel:'仅退货单号', subjectLabel:'仅退货主题', typeLabel:'退货类型', statusLabel:'退货状态', statuses:['待退货入库','待应收调整','已完成','异常'], row:{subject:'客户退货不退款',code:'ART-202505-001',customer:'海南微为智造产业有限公司',type:'仅退货',priority:'中等',owner:'仓库/财务',date:'2025-05-01',status:'待退货入库',refund:'0.00',receivable:'应收调整28,000.00'} },
  asDispatch:{ kind:'dispatch', title:'服务派工', treeTitle:'派工视图', groups:['全部派工','待派工','已派工','上门处理中','待客户确认','已完成'], newLabel:'新增服务派工', codeLabel:'派工单号', subjectLabel:'派工主题', typeLabel:'服务类型', statusLabel:'派工状态', statuses:['待派单','已派单','上门处理中','待客户确认','已完成'], row:{subject:'设备调试服务派工',code:'ASD-202505-001',customer:'海南微为智造产业有限公司',type:'上门服务',priority:'紧急',owner:'老夏',date:'2025-05-01',status:'待派单'} },
  asConfig:{ title:'基础设置', treeTitle:'设置分类', groups:['原因与问题','服务类型','处理方式','SLA规则','附件规则','关闭规则'], newLabel:'添加配置', codeLabel:'配置编号', subjectLabel:'配置名称', typeLabel:'配置类型', statusLabel:'状态', statuses:['启用','停用'], row:{subject:'做工粗糙/有瑕疵',code:'ASC-202505-001',customer:'关联售后',type:'售后原因',priority:'-',owner:'老夏',date:'2025-05-01',status:'启用'} },
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
  return <div style={{display:'grid',gridTemplateColumns:'320px minmax(0,1fr)',gap:16,alignItems:'start'}}><div><div style={{fontSize:13,marginBottom:8}}>问题附件 <span style={{color:'var(--aw-danger)'}}>*</span></div><div style={{border:'1px dashed var(--aw-border-strong)',borderRadius:8,padding:24,textAlign:'center',color:'var(--aw-fg-3)',background:'#fff'}}><span className="aw-link">点击或将文件拖拽到这里上传</span><div style={{fontSize:12,marginTop:8}}>支持图片、视频、检测报告、物流凭证</div></div></div><table className="aw-table"><thead><tr><th>附件类型</th><th>是否必传</th><th>用于环节</th><th>示例</th></tr></thead><tbody><tr><td>问题照片/视频</td><td><Badge tone="r">必传</Badge></td><td>受理、责任判定</td><td>外观破损、故障现象</td></tr><tr><td>物流/签收凭证</td><td><Badge tone="y">条件必传</Badge></td><td>错发、少发、运输破损</td><td>签收单、运单截图</td></tr><tr><td>检测报告</td><td><Badge tone="y">条件必传</Badge></td><td>质量改进、供应商追责</td><td>复检报告、OQC记录</td></tr></tbody></table></div>;
}

function AsTone({ status }) {
  if (['已完成','已关闭','已通过','已退款','启用','已完成','已入库','已打款','已验证'].includes(status)) return <Badge tone="g">{status}</Badge>;
  if (['驳回','异常','停用','已超时','客诉升级'].includes(status)) return <Badge tone="r">{status}</Badge>;
  return <Badge tone="y">{status}</Badge>;
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
  const extraFilters = <><Select value={scene} onChange={e=>setScene(e.target.value)} style={{width:118}}><option value="">全部场景</option>{AS_PROCESS_OPTIONS.map(t=><option key={t}>{t}</option>)}</Select><Select value={sla} onChange={e=>setSla(e.target.value)} style={{width:112}}><option value="">SLA状态</option><option>正常</option><option>临期</option><option>超时</option></Select><Btn>批量派单</Btn><Btn>批量催办</Btn></>;
  return <><AsMiniStats/><PurchaseListToolbar searchPlaceholder={`全局搜索（如${config.subjectLabel}、${config.codeLabel}、客户、来源订单）`} newLabel={config.newLabel} onNew={onNew} afterSearch={extraFilters}/><div className="aw-doc-tbl-wrap"><div className="aw-doc-tbl-inner"><table className="aw-doc-tbl" style={{whiteSpace:'nowrap'}}><thead><tr><PurchaseSelectHeader checked={allChecked} indeterminate={someChecked} onToggle={toggleAll}/><PurchaseIndexHeader />{[config.subjectLabel,config.codeLabel,'客户','来源订单','来源发货单','来源明细',config.typeLabel,'可售后数量','可退金额','SLA','仓储处理','财务处理','发票处理','客户确认','质量联动','优先级','负责人','提交时间'].map(c=><th key={c} style={{width:c.length>4?130:100}}><div className="aw-th-inner">{c}</div></th>)}<PurchaseStatusFilterHeader label={config.statusLabel} value={status} onChange={setStatus} options={config.statuses} width={150}/><th style={{width:150}}><div className="aw-th-inner">操作</div></th></tr></thead><tbody>{rows.map((r,i)=>{const slaLevel=i===1?'临期':i===2?'超时':'正常';return <tr key={r.code} onClick={()=>onView(r)} style={{cursor:'pointer'}}><PurchaseSelectCell checked={!!sel[i]} onToggle={()=>toggleRow(i)}/><td>{i+1}</td><td className="aw-link">{r.subject}</td><td className="aw-num">{r.code}</td><td>{r.customer}</td><td>{r.sourceOrder}</td><td>{r.sourceDelivery}</td><td>{r.sourceDetail}</td><td>{r.type}</td><td>{r.maxQty}</td><td className="aw-num">{r.refund||r.maxRefund||'0.00'}</td><td><AsSlaBadge level={slaLevel}/></td><td>{r.inboundState||r.outboundState||'无需仓储'}</td><td>{r.receivable||r.refundState||r.receivableState||'无需调整'}</td><td>{r.invoice||r.invoiceState||'未开票'}</td><td>{i===3?'已确认':'待确认'}</td><td>{r.type==='维修处理'||r.type==='换货'?<Badge tone="y">待判定</Badge>:<Badge tone="g">无需</Badge>}</td><td>{r.priority}</td><td>{r.owner}</td><td>{r.date}</td><td><AsTone status={r.status}/></td><td><span className="aw-link" onClick={e=>{e.stopPropagation();onView(r)}}>查看</span> <span className="aw-link" onClick={e=>e.stopPropagation()}>催办</span></td></tr>})}</tbody></table></div></div><PurchaseListFooter total={800} selectedCount={Object.values(sel).filter(Boolean).length} allChecked={allChecked} someChecked={someChecked} onToggleAll={toggleAll} pages={23}/></>;
}

function AsBaseFieldContent({ config, row }) {
  const data = {...AS_SOURCE_DEFAULTS, ...(row||config.row||{})};
  const [customer, setCustomer] = useAsState({ name:data.customer||'海南微为智造产业有限公司', contact:'老夏', phone:'13888888888', manager:'老夏', group:'代理商' });
  const [showCustomerPicker, setShowCustomerPicker] = useAsState(false);
  return <><div className="aw-doc-grid"><Field label="选择客户" req><div style={{display:'flex',gap:8}}><Input value={customer.name} readOnly onClick={()=>setShowCustomerPicker(true)} style={{flex:1,cursor:'pointer'}} /><Btn onClick={()=>setShowCustomerPicker(true)}>选择</Btn></div></Field><Field label="联系人"><Input value={customer.contact} readOnly /></Field><Field label="联系电话"><Input value={customer.phone} readOnly /></Field><Field label="收货地址"><Input defaultValue="海南省海口市龙华区华海路安海大厦" /></Field><Field label="客户类别"><Input value={customer.group} readOnly /></Field><Field label="销售经理"><Input value={customer.manager} readOnly /></Field><Field label="来源销售订单" req><Input defaultValue={data.sourceOrder} /></Field><Field label="来源发货单" req><Input defaultValue={data.sourceDelivery} /></Field><Field label="来源明细" req><Input defaultValue={data.sourceDetail} /></Field><Field label="原应收单"><Input value={data.sourceReceivable} readOnly /></Field><Field label="原发票"><Input value={data.sourceInvoice} readOnly /></Field><Field label="可售后数量"><Input value={data.maxQty} readOnly /></Field><Field label="可退金额"><Input value={data.maxRefund} readOnly /></Field><Field label="红冲/应收策略"><Input value="已开票需红冲或应收冲减" readOnly /></Field><Field label="售后日期"><Input defaultValue="2025-05-01" /></Field><Field label={config.codeLabel}><Input defaultValue="自动生成" disabled /></Field><Field label={config.statusLabel}><Input value={config.statuses[0]} readOnly /></Field><Field label="SLA等级"><Select defaultValue="紧急-2小时受理"><option>紧急-2小时受理</option><option>标准-8小时受理</option><option>低优先-24小时受理</option></Select></Field><Field label="优先级"><div style={{display:'flex',gap:14,alignItems:'center',height:32}}><Radio on>紧急</Radio><Radio>中等</Radio><Radio>一般</Radio></div></Field><Field label="客户确认方式"><Select defaultValue="线上确认"><option>线上确认</option><option>电话确认</option><option>签字回传</option></Select></Field></div>{showCustomerPicker&&<SimpleCustomerPickerModal onClose={()=>setShowCustomerPicker(false)} onConfirm={(picked)=>{setCustomer({name:picked.name,contact:picked.contact,phone:picked.phone,manager:picked.manager,group:picked.group});setShowCustomerPicker(false);}} />}</>;
}

function AsBaseFields({ config, row }) {
  return <PurchaseSection title="基本信息"><AsBaseFieldContent config={config} row={row}/></PurchaseSection>;
}

function AsProductTable({ withActions=true }) {
  return <table className="aw-table"><thead><tr><th>序号</th><th>来源明细</th><th>产品名称</th><th>物料型号</th><th>物料类型</th><th>物料分类</th><th>规格/尺寸</th><th>单位</th><th>实供数量</th><th>实供单价</th><th>已售后</th><th>可售后数量</th><th>本次售后</th><th>售后类型</th><th>售后原因</th><th>责任判定</th><th>仓储动作</th><th>财务动作</th>{withActions&&<th>操作</th>}</tr></thead><tbody>{AS_PRODUCTS.map((p,i)=>{const canQty=Number(p[7]||0)-20;return <tr key={p[0]}><td>{i+1}</td><td>DLV-20251222001-{String(i+1).padStart(2,'0')}</td>{p.slice(0,8).map((c,j)=><td key={`${p[0]}-${j}`}>{c}</td>)}<td>20</td><td>{canQty}</td><td>{p[7]}</td><td>{p[8]}</td><td>{p[9]}</td><td>{i===0?'运输/包装':'出货标签'}</td><td>{i===0?'待仓储复检':'待质检确认'}</td><td>退货入库/换出出库</td><td>退款/应收冲减/发票红冲</td>{withActions&&<td><span className="aw-link">删除</span></td>}</tr>})}</tbody></table>;
}

function AsFormView({ config, onBack }) {
  const isConfig = config === AS_CONFIG.asConfig;
  const isQuality = config === AS_CONFIG.asQuality;
  if (isConfig) return <PurchaseFormPage onBack={onBack} submitText="保存配置"><PurchaseSection title="售后配置项"><div className="aw-tabs" style={{marginBottom:12}}>{['售后原因','投诉问题','售后类型','问题类型','处理方式'].map((t,i)=><span key={t} className={'aw-tab '+(i===0?'on':'')}>{t}</span>)}</div><div className="aw-doc-grid" style={{marginBottom:16}}><Field label="配置名称" req><Input defaultValue="做工粗糙/有瑕疵" /></Field><Field label="适用场景"><Select defaultValue="退换货"><option>退换货</option><option>仅退款</option><option>换货</option><option>仅退货</option><option>现场服务</option></Select></Field><Field label="是否触发质量改进"><Select defaultValue="重复发生时触发"><option>不触发</option><option>重复发生时触发</option><option>强制触发</option></Select></Field><Field label="是否需要附件"><Select defaultValue="必传"><option>必传</option><option>非必传</option><option>按金额判断</option></Select></Field><Field label="是否启用"><Select defaultValue="启用"><option>启用</option><option>停用</option></Select></Field><Field label="排序"><Input defaultValue="10" /></Field></div><table className="aw-table"><thead><tr><th>序号</th><th>配置名称</th><th>关联场景</th><th>触发仓储</th><th>触发财务</th><th>触发质改</th><th>状态</th><th>操作</th></tr></thead><tbody><tr><td>1</td><td>做工粗糙/有瑕疵</td><td>退换货、换货</td><td>退货入库</td><td>按处理方式判断</td><td>重复3次触发</td><td><AsTone status="启用"/></td><td><span className="aw-link">编辑</span> <span className="aw-link">停用</span></td></tr></tbody></table></PurchaseSection></PurchaseFormPage>;
  return <PurchaseFormPage onBack={onBack} submitText={isQuality?'提交改进':'提交审核'}><AsBaseFields config={config}/>{!isQuality&&<><PurchaseSection title="受理与判定"><div className="aw-doc-grid"><Field label="客户诉求" req><Select defaultValue={config.row.type}>{AS_PROCESS_OPTIONS.map(t=><option key={t}>{t}</option>)}</Select></Field><Field label="问题原因" req><Select defaultValue="包装破损">{AS_REASON_OPTIONS.map(t=><option key={t}>{t}</option>)}</Select></Field><Field label="责任归属"><Select defaultValue="待判定"><option>待判定</option><option>我方责任</option><option>客户责任</option><option>物流责任</option><option>供应商责任</option></Select></Field><Field label="期望完成日期"><Input defaultValue="2025-05-03" /></Field><Field label="客户是否需退回"><Select defaultValue="是"><option>是</option><option>否</option><option>按复检判定</option></Select></Field><Field label="是否升级客诉"><Select defaultValue="否"><option>否</option><option>是</option></Select></Field></div></PurchaseSection><PurchaseSection title="来源产品与处理动作"><div style={{display:'flex',gap:10,alignItems:'center',marginBottom:12}}><Btn>关联产品</Btn><Btn>关联订单</Btn><Btn>校验可售后数量</Btn><span style={{fontSize:12,color:'var(--aw-fg-3)'}}>按来源发货明细校验已售后占用，避免重复退款/退货。</span></div><AsProductTable/></PurchaseSection><PurchaseSection title="处理方式矩阵"><AsProcessMatrix/></PurchaseSection><PurchaseSection title="证据附件"><AsAttachmentUpload/></PurchaseSection></>}{isQuality&&<PurchaseSection title="问题分析"><div className="aw-doc-grid"><Field label="问题类型" req><Select><option>包装问题</option><option>产品质量</option><option>服务投诉</option></Select></Field><Field label="处理方式" req><Select><option>整改</option><option>培训</option><option>供应商改善</option></Select></Field><Field label="关联部门"><Select><option>质检部</option><option>仓储部</option><option>销售部</option></Select></Field><Field label="重复发生次数"><Input defaultValue="3" /></Field><Field label="影响批次"><Input defaultValue="LOT-20250428001" /></Field><Field label="CAPA要求"><Select defaultValue="必须创建"><option>必须创建</option><option>主管判定</option><option>无需创建</option></Select></Field></div></PurchaseSection>}<PurchaseSection title="售后详情"><PurchaseRichText placeholder="请输入售后问题、客户诉求、处理说明、客户沟通记录..." /></PurchaseSection><PurchaseSection title="审核信息"><div style={{display:'flex',gap:24,alignItems:'center',marginBottom:16}}><span>处理方式：</span><Radio on>通过</Radio><Radio>驳回</Radio><Radio>回退补充资料</Radio></div><textarea className="aw-input" placeholder="请输入审核意见、风险提示或下一环节要求" style={{height:92,resize:'vertical'}} /></PurchaseSection></PurchaseFormPage>;
}

function AsKV({ label, value }) { return <div style={{display:'flex',gap:14}}><span style={{width:96,color:'var(--aw-fg-3)',flex:'none'}}>{label}：</span><span>{value}</span></div>; }

function AsDetailTabs(config) {
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

function AsDetailView({ config, row, onBack }) {
  const tabs=AsDetailTabs(config);
  const [tab,setTab]=useAsState(tabs[0]);
  useAsEffect(()=>setTab(tabs[0]),[config.kind]);
  const data = {...AS_SOURCE_DEFAULTS, ...row};
  return <div className="aw-doc-form"><div className="aw-doc-form-body"><Card><div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:16,marginBottom:10}}><div><div style={{fontSize:16,fontWeight:600,marginBottom:8}}>{row.subject} {row.code}</div><div style={{display:'flex',gap:24,fontSize:12,color:'var(--aw-fg-3)',flexWrap:'wrap'}}><span>创建人：{row.owner}</span><span>创建时间：{row.date} 10:25</span><span>最后修改人：售后主管</span><span>修改时间：2025-05-01 15:30</span><span>SLA：<AsSlaBadge level="临期"/></span></div></div><AsTone status={row.status}/></div><div style={{display:'flex',gap:10,flexWrap:'wrap'}}><Btn onClick={onBack}>返回</Btn>{AsAvailableActions(config,row).map(a=><Btn key={a}>{a}</Btn>)}</div></Card><PurchaseSection title="基本信息"><AsBaseFieldContent config={config} row={data}/></PurchaseSection><PurchaseSection title="SLA与流程进度"><AsSlaTimeline/></PurchaseSection><Card><div className="aw-tabs" style={{marginBottom:14}}>{tabs.map(t=><span key={t} className={'aw-tab '+(tab===t?'on':'')} onClick={()=>setTab(t)}>{t}</span>)}</div>{tab==='售后详情'&&<><PurchaseSection title="售后信息"><AsProductTable withActions={false}/><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginTop:18}}>{['问题照片.png','签收凭证.pdf','复检报告.xlsx'].map(n=><div key={n} style={{height:78,border:'1px dashed var(--aw-border-strong)',borderRadius:8,background:'var(--aw-surface-2)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--aw-fg-3)'}}>{n}</div>)}</div></PurchaseSection><PurchaseSection title="来源与财务闭环"><table className="aw-table"><thead><tr><th>来源订单</th><th>来源发货单</th><th>来源明细</th><th>原应收单</th><th>原发票</th><th>可退金额</th><th>应收处理</th><th>发票处理</th><th>回款处理</th></tr></thead><tbody><tr><td>{data.sourceOrder}</td><td>{data.sourceDelivery}</td><td>{data.sourceDetail}</td><td>{data.sourceReceivable}</td><td>{data.sourceInvoice}</td><td>{data.refund||data.maxRefund}</td><td>{data.receivable||data.receivableState}</td><td>{data.invoice||data.invoiceState}</td><td>退款后回写核销和信用占用</td></tr></tbody></table></PurchaseSection><PurchaseSection title="处理联动说明"><AsProcessMatrix/></PurchaseSection><PurchaseSection title="沟通与服务记录"><table className="aw-table"><thead><tr><th>时间</th><th>处理人</th><th>动作</th><th>记录</th></tr></thead><tbody>{AS_SERVICE_RECORDS.map(r=><tr key={r.time}><td>{r.time}</td><td>{r.actor}</td><td>{r.action}</td><td>{r.note}</td></tr>)}</tbody></table></PurchaseSection><PurchaseSection title="备注说明"><div style={{border:'1px solid var(--aw-border)',borderRadius:8,minHeight:88,padding:14,color:'var(--aw-fg-3)'}}>客户反馈产品标签破损，售后需核对订单、仓库、财务与服务处理状态。关闭前必须完成客户确认和回访满意度记录。</div></PurchaseSection></>}{tab==='退货入库'&&<PurchaseSection title="处理退货入库"><table className="aw-table"><thead><tr><th>序号</th><th>来源明细</th><th>单据类型</th><th>单据编号</th><th>入库类型</th><th>产品名称</th><th>退货数量</th><th>实收数量</th><th>差异</th><th>批次/序列号</th><th>库位</th><th>质量状态</th><th>处置建议</th><th>时间</th></tr></thead><tbody><tr><td>1</td><td>{data.sourceDetail}</td><td>入库单</td><td>IN-AS-202505-001</td><td>退货入库</td><td>WL0001</td><td>100</td><td>100</td><td>0</td><td>LOT-20250428001</td><td>退货暂存区-A01</td><td>待复检</td><td>隔离待判</td><td>2025-05-01</td></tr></tbody></table></PurchaseSection>}{tab==='换出出库'&&<PurchaseSection title="换出出库"><table className="aw-table"><thead><tr><th>序号</th><th>来源明细</th><th>出库单号</th><th>换出产品</th><th>数量</th><th>批次</th><th>OQC状态</th><th>物流单号</th><th>出库人</th><th>状态</th></tr></thead><tbody><tr><td>1</td><td>{data.sourceDetail}</td><td>OUT-AS-202505-001</td><td>WL0001</td><td>100</td><td>LOT-20250501002</td><td>待OQC</td><td>SF100200300</td><td>仓库二</td><td><AsTone status="待换出出库"/></td></tr></tbody></table></PurchaseSection>}{tab==='退款处理'&&<PurchaseSection title="退款处理"><div className="aw-doc-grid"><AsKV label="退款金额" value={data.refund || data.maxRefund}/><AsKV label="退款账户" value="客户默认账户"/><AsKV label="退款状态" value={<AsTone status={data.refundState||row.status}/>} /><AsKV label="财务经办" value="王会计"/><AsKV label="关联应收" value={data.sourceReceivable}/><AsKV label="红字发票" value={data.sourceInvoice}/><AsKV label="付款批次" value="PAY-202505-019"/><AsKV label="核销回写" value="退款完成后冲减应收和信用占用"/></div></PurchaseSection>}{tab==='应收调整'&&<PurchaseSection title="应收调整"><div className="aw-doc-grid"><AsKV label="调整类型" value="销售应收冲减"/><AsKV label="调整金额" value={data.receivable || data.maxRefund}/><AsKV label="关联发票" value={data.sourceInvoice}/><AsKV label="财务状态" value={<AsTone status={data.receivableState}/>}/></div></PurchaseSection>}{tab==='派单信息'&&<PurchaseSection title="派单信息"><table className="aw-table"><thead><tr><th>序号</th><th>服务人员</th><th>技能组</th><th>服务类型</th><th>来源订单</th><th>派单时间</th><th>预约上门</th><th>预计完成</th><th>签到</th><th>状态</th></tr></thead><tbody><tr><td>1</td><td>老夏</td><td>设备调试组</td><td>上门服务</td><td>{data.sourceOrder}</td><td>2025-05-01</td><td>2025-05-02 09:30</td><td>2025-05-02</td><td>待签到</td><td><AsTone status="上门处理中"/></td></tr></tbody></table></PurchaseSection>}{tab==='售后处理'&&<PurchaseSection title="售后处理"><div className="aw-doc-grid"><Field label="问题类型"><Select><option>包装破损</option><option>产品故障</option></Select></Field><Field label="处理方式"><Select><option>{row.type}</option><option>维修</option><option>补发</option></Select></Field><Field label="关联部门"><Select><option>仓储部</option><option>财务部</option></Select></Field><Field label="回访满意度"><Select><option>待回访</option><option>满意</option><option>一般</option><option>不满意</option></Select></Field></div><PurchaseRichText placeholder="请输入售后处理结果、客户确认意见、关闭说明..." /></PurchaseSection>}{tab==='8D报告'&&<PurchaseSection title="8D报告"><div className="aw-doc-grid"><AsKV label="8D单号" value={row.eightD || '8D-202505-001'}/><AsKV label="D4根因" value="包装来料耐磨不足"/><AsKV label="D5措施" value="更换包材并调整检验标准"/><AsKV label="负责人" value={row.owner}/></div></PurchaseSection>}{tab==='CAPA措施'&&<PurchaseSection title="CAPA措施"><div className="aw-doc-grid"><AsKV label="CAPA编号" value={row.capa || 'CAPA-202505-006'}/><AsKV label="纠正措施" value="隔离库存并返工贴标"/><AsKV label="预防措施" value="供应商来料加严检验"/><AsKV label="状态" value={<AsTone status="CAPA执行中"/>}/></div></PurchaseSection>}{tab==='验证关闭'&&<PurchaseSection title="验证关闭"><table className="aw-table"><thead><tr><th>序号</th><th>验证项</th><th>验证方式</th><th>责任人</th><th>计划日期</th><th>结果</th></tr></thead><tbody><tr><td>1</td><td>客诉复发率</td><td>近30天售后追踪</td><td>质检主管</td><td>2025-05-30</td><td><AsTone status="待验证"/></td></tr></tbody></table></PurchaseSection>}</Card></div></div>;
}

function AsActionView({ config, action, onNew, onBack, onView }) {
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
  return <div className="aw-doc-page">{view!=='new'&&view!=='detail'&&<AsTree config={config} picked={picked} setPicked={setPicked}/>}<div className="aw-doc-main" style={{maxWidth:'none'}}>{view==='list'&&<AsListView config={config} picked={picked} onNew={()=>setView('new')} onView={(r)=>{setDetail(r);setView('detail')}}/>}{view==='action'&&<AsActionView config={config} action={action||config.title} onNew={()=>setView('new')} onBack={()=>setView('list')} onView={(r)=>{setDetail(r);setView('detail')}}/>}{view==='new'&&<AsFormView config={config} onBack={()=>setView('list')}/>} {view==='detail'&&<AsDetailView config={config} row={detail} onBack={()=>setView('list')}/>}</div></div>;
}

window.AsModuleScreen = AsModuleScreen;
