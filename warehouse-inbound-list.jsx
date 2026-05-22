// ui_kits/erp-console/warehouse-inbound-list.jsx
// 仓储中心 — 入库管理
const { useState: useInboundState, useEffect: useInboundEffect } = React;

const INBOUND_ROWS = [
  { subject:'采购到货入库', code:'RK-20251221001', type:'采购入库', qty:1000, applyDate:'2025-12-21', user:'傲为', date:'', state:'已收货待检', tone:'y', owner:'李文涛', target:'华南五金供应商', source:'采购订单' },
  { subject:'生产完工入库', code:'RK-20251221002', type:'生产入库', qty:650, applyDate:'2025-12-20', user:'陈思源', date:'2025-12-21', state:'已上架过账', tone:'g', owner:'三红', target:'生产一部', source:'生产工单' },
  { subject:'销售退货入库', code:'RK-20251221003', type:'销售退货入库', qty:120, applyDate:'2025-12-19', user:'赵强', date:'', state:'合格待上架', tone:'y', owner:'赵强', target:'海南傲为客户A', source:'退货单' },
  { subject:'委外完工入库', code:'RK-20251221004', type:'委外入库', qty:300, applyDate:'2025-12-18', user:'李文涛', date:'', state:'部分上架', tone:'b', owner:'海鹏微为', target:'深圳协同加工厂', source:'委外加工单' },
  { subject:'直接入库', code:'RK-20251221005', type:'直接入库', qty:80, applyDate:'2025-12-17', user:'老夏', date:'', state:'草稿', tone:'gray', owner:'老夏', target:'临时入库', source:'手动创建' },
];

const INBOUND_DETAIL_ROWS = [
  { name:'半成品物料', code:'7820864', model:'规格一', unit:'公斤', waiting:500, people:'李文涛、陈思源' },
  { name:'铝合金型材', code:'8518691', model:'AL-6061', unit:'KG', waiting:300, people:'赵强' },
  { name:'包装纸箱', code:'6081578', model:'PK-01', unit:'个', waiting:120, people:'老夏' },
];

const INBOUND_PRODUCTS = [
  { id:'in1', sourceDoc:'PO-20251221001', sourceLine:'PO-20251221001-01', qcNo:'IQC-20251221001', code:'7820864', name:'半成品物料', model:'规格一', unit:'公斤', batch:'B20250601', planQty:500, qcQty:500, passQty:492, concessionQty:0, rejectQty:8, inQty:'492', shelfQty:'492', location:'A区-A01-01', qcState:'合格入库', qualityState:'合格', costLayer:'LAYER-IN-01', costStatus:'暂估', postStatus:'已过账', price:'100.00', amount:'49200.00', prodDate:'2024-06-09', remark:'' },
  { id:'in2', sourceDoc:'MO-20251221001', sourceLine:'MO-20251221001-02', qcNo:'FQC-20251221002', code:'5786931', name:'半成品物料', model:'规格一', unit:'公斤', batch:'B20250602', planQty:500, qcQty:500, passQty:500, concessionQty:0, rejectQty:0, inQty:'500', shelfQty:'500', location:'A区-A01-02', qcState:'免检入库', qualityState:'合格', costLayer:'LAYER-IN-02', costStatus:'已计价', postStatus:'已过账', price:'100.00', amount:'50000.00', prodDate:'2024-06-09', remark:'' },
  { id:'in3', sourceDoc:'WR-20251221001', sourceLine:'WR-20251221001-01', qcNo:'IQC-20251221003', code:'8518691', name:'半成品物料', model:'规格一', unit:'公斤', batch:'B20250603', planQty:500, qcQty:500, passQty:460, concessionQty:12, rejectQty:40, inQty:'460', shelfQty:'0', location:'待分配库位', qcState:'待上架', qualityState:'待检', costLayer:'LAYER-IN-03', costStatus:'未计价', postStatus:'待过账', price:'100.00', amount:'46000.00', prodDate:'2024-06-09', remark:'不合格40待处理' },
];

const INBOUND_SOURCE_DOCS = {
  '采购入库': [
    { code:'PO-20251221001', title:'华南五金采购到货单', org:'华南五金供应商', person:'李文涛', date:'2025-12-21', qty:1000 },
    { code:'PO-20251221002', title:'包装耗材采购到货单', org:'包装耗材供应商', person:'陈思源', date:'2025-12-20', qty:420 },
  ],
  '生产入库': [
    { code:'MO-20251221001', title:'生产一部完工入库申请', org:'生产一部', person:'三红', date:'2025-12-20', qty:650 },
    { code:'MO-20251221002', title:'装配线成品完工入库', org:'装配车间', person:'老夏', date:'2025-12-19', qty:220 },
  ],
  '销售退货入库': [
    { code:'SR-20251221001', title:'海南傲为客户A退货单', org:'海南傲为客户A', person:'赵强', date:'2025-12-19', qty:120 },
    { code:'SR-20251221002', title:'某某科技售后退货单', org:'某某科技', person:'李文涛', date:'2025-12-18', qty:60 },
  ],
  '委外入库': [
    { code:'WR-20251221001', title:'深圳协同加工委外完工入库', org:'深圳协同加工厂', person:'海鹏微为', date:'2025-12-18', qty:300 },
    { code:'WR-20251221002', title:'东莞精密件委外完工入库', org:'东莞精密制造厂', person:'陈思源', date:'2025-12-17', qty:180 },
  ],
};

const INBOUND_CODE_ROWS = [
  { main:'SN-202605-0001', ext:'SUP-HN-7781 / BOX-202605-010', batch:'B20250601', location:'A区-A01-01', quality:'合格', state:'待上架' },
  { main:'SN-202605-0002', ext:'SUP-HN-7782 / BOX-202605-010', batch:'B20250601', location:'A区-A01-01', quality:'合格', state:'待上架' },
  { main:'SN-202605-0003', ext:'SUP-HN-7783 / BOX-202605-011', batch:'B20250602', location:'A区-A01-02', quality:'待检', state:'待绑定' },
];

function InboundCodeControlPanel({ title = '物码绑定' }) {
  return (
    <PurchaseSection title={title}>
      <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',marginBottom:12}}>
        <div style={{fontSize:12,color:'var(--aw-fg-3)'}}>启用一物一码/一物多码的产品，入库过账前需要完成主码生成与关联码绑定。</div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <Btn>生成物码</Btn><Btn>导入物码</Btn><Btn>扫码绑定</Btn><Btn>打印标签</Btn>
        </div>
      </div>
      <table className="aw-table">
        <thead><tr><th>主码</th><th>关联码</th><th>批次</th><th>目标库位</th><th>质量状态</th><th>码状态</th><th>操作</th></tr></thead>
        <tbody>{INBOUND_CODE_ROWS.map(row => <tr key={row.main}><td className="aw-num">{row.main}</td><td>{row.ext}</td><td>{row.batch}</td><td>{row.location}</td><td>{row.quality}</td><td><Badge tone={row.state === '待绑定' ? 'y' : 'g'}>{row.state}</Badge></td><td><span className="aw-link">查看码</span></td></tr>)}</tbody>
      </table>
    </PurchaseSection>
  );
}

function getInboundTypeFields(row) {
  const map = {
    '采购入库': [['供应商', row.target], ['采购负责人', row.owner], ['来源单据', row.source]],
    '生产入库': [['生产部门', row.target], ['报工人员', row.owner], ['来源单据', row.source]],
    '销售退货入库': [['客户', row.target], ['退货经办人', row.owner], ['来源单据', row.source]],
    '委外入库': [['委外供应商', row.target], ['委外联系人', row.owner], ['来源单据', row.source]],
    '直接入库': [['入库对象', row.target], ['经办人', row.owner], ['来源单据', row.source]],
  };
  return map[row.type] || map['直接入库'];
}

function InboundSourcePickerModal({ type, onClose, onConfirm }) {
  const docs = INBOUND_SOURCE_DOCS[type] || [];
  return (
    <div className="aw-mask" onClick={onClose}>
      <div className="aw-modal" style={{width:'min(860px,94vw)',maxHeight:'85vh'}} onClick={e => e.stopPropagation()}>
        <div className="head"><span>选择{type}单据</span><span style={{cursor:'pointer'}} onClick={onClose}>✕</span></div>
        <div className="body">
          <PurchaseListToolbar searchPlaceholder={`搜索${type}单号、主题、主体`} hideNew />
          <div className="aw-doc-tbl-wrap">
            <table className="aw-doc-tbl">
              <thead><tr><PurchaseIndexHeader /><th><div className="aw-th-inner">单据主题</div></th><th><div className="aw-th-inner">单据编号</div></th><th><div className="aw-th-inner">主体</div></th><th><div className="aw-th-inner">负责人</div></th><th><div className="aw-th-inner">日期</div></th><th><div className="aw-th-inner">数量</div></th><th><div className="aw-th-inner">操作</div></th></tr></thead>
              <tbody>
                {docs.map((doc, i) => (
                  <tr key={doc.code}>
                    <td>{i + 1}</td><td className="aw-link" onClick={() => onConfirm(doc)}>{doc.title}</td><td className="aw-num">{doc.code}</td><td>{doc.org}</td><td>{doc.person}</td><td>{doc.date}</td><td>{doc.qty}</td><td><span className="aw-link" onClick={() => onConfirm(doc)}>选择</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function WarehouseInboundListView({ mode, onView }) {
  const [sel, setSel] = useInboundState({});
  const rows = mode === 'pending' ? INBOUND_ROWS.filter(r => !['已上架过账','关闭'].includes(r.state)) : INBOUND_ROWS;
  const allChecked = rows.length > 0 && rows.every((_, i) => sel[i]);
  const someChecked = rows.some((_, i) => sel[i]);
  const toggleAll = () => {
    if (allChecked) setSel({});
    else {
      const next = {};
      rows.forEach((_, i) => next[i] = true);
      setSel(next);
    }
  };
  const toggleRow = (i) => setSel(s => ({...s, [i]: !s[i]}));
  return (
    <>
      <PurchaseListToolbar searchPlaceholder="全局搜索（如供应商、产品名称、入库单号…）" hideNew />
      <div className="aw-doc-tbl-wrap">
        <table className="aw-doc-tbl">
          <thead>
            <tr>
              <PurchaseSelectHeader checked={allChecked} indeterminate={someChecked} onToggle={toggleAll} />
              <PurchaseIndexHeader />
              <th><div className="aw-th-inner">入库主题</div></th>
              <th><div className="aw-th-inner">入库单号</div></th>
              <th><div className="aw-th-inner">入库类别</div></th>
              <th><div className="aw-th-inner">入库数量</div></th>
              <th><div className="aw-th-inner">申请日期</div></th>
              <th><div className="aw-th-inner">入库人员</div></th>
              <th><div className="aw-th-inner">入库日期</div></th>
              <th><div className="aw-th-inner">入库状态</div></th>
              <th><div className="aw-th-inner">操作</div></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.code}>
                <PurchaseSelectCell checked={!!sel[i]} onToggle={() => toggleRow(i)} />
                <td>{i + 1}</td>
                <td className="aw-link" onClick={() => onView && onView(r)}>{r.subject}</td>
                <td className="aw-num">{r.code}</td>
                <td>{r.type}</td>
                <td>{r.qty}</td>
                <td>{r.applyDate}</td>
                <td>{r.user}</td>
                <td>{r.date || '-'}</td>
                <td><span className={'aw-state aw-state-' + r.tone}>{r.state}</span></td>
                <td><span className="aw-link" onClick={() => onView && onView(r)}>查看</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PurchaseListFooter total={800} selectedCount={Object.values(sel).filter(Boolean).length} allChecked={allChecked} someChecked={someChecked} onToggleAll={toggleAll} pages={23} />
    </>
  );
}

function WarehouseInboundOrderDetail({ data, onBack }) {
  const row = data || INBOUND_ROWS[0];
  const [tab, setTab] = useInboundState('入库信息');
  const [products, setProducts] = useInboundState(INBOUND_PRODUCTS);
  const updateProduct = (id, key, value) => setProducts(prev => prev.map(item => item.id === id ? {...item, [key]: value} : item));
  const typeFields = getInboundTypeFields(row);
  const baseFields = [
    ['入库类型', row.type], ['入库单号', row.code], ['入库日期', row.date || row.applyDate],
    ['入库仓库', '仓库0545'], ['入库状态', row.state], ['项目', row.type === '生产入库' ? '生产完工项目' : '项目一'],
    ...typeFields,
  ];
  const checkedProducts = products.map(item => {
    const maxIn = Number(item.passQty || item.planQty || 0);
    const inQty = Math.min(Number(item.inQty || 0), maxIn);
    const shelfQty = Math.min(Number(item.shelfQty || 0), inQty);
    return { ...item, inQty, shelfQty, maxIn };
  });
  const totalQty = checkedProducts.reduce((sum, item) => sum + Number(item.inQty || 0), 0);
  const totalAmount = products.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  return (
    <div className="aw-doc-form">
      <div className="aw-doc-form-body">
        <DetailHeaderCard
          title={`202404${row.subject}单232`}
          status={row.state}
          onBack={onBack}
          detailItems={[
            ['入库类型', row.type],
            ['入库单号', row.code],
            ['入库日期', row.date || row.applyDate],
            ['入库仓库', '仓库0545'],
            ['打印状态', '未打印'],
          ]}
        />
        <Card>
          <Tabs items={[{k:'入库信息',label:'入库信息'},{k:'操作记录',label:'操作记录'}]} active={tab} onChange={setTab} />
          {tab === '入库信息' && (
            <>
              <PurchaseSection title="基础信息">
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',rowGap:16,columnGap:80,fontSize:13,marginBottom:22}}>
                  {baseFields.map(([label, value]) => <div key={label}><span style={{color:'var(--aw-fg-3)'}}>{label}：</span>{value}</div>)}
                </div>
              </PurchaseSection>
              <PurchaseSection title="物品明细">
                <div style={{overflow:'auto'}}>
                  <table className="aw-table">
                    <thead><tr><th>序号</th><th>来源单据</th><th>来源明细</th><th>物品编码</th><th>物品名称</th><th>规格型号</th><th>单位</th><th>批次号</th><th>应入库数量</th><th>送检数量</th><th>合格数量</th><th>让步数量</th><th>不合格数量</th><th>入库数量</th><th>上架数量</th><th>入库库位</th><th>质检单号</th><th>质检/上架状态</th><th>库存质量</th><th>成本层</th><th>过账状态</th><th>单价</th><th>合计</th><th>生产日期</th><th>备注</th></tr></thead>
                    <tbody>
                      {checkedProducts.map((item, i) => (
                        <tr key={item.id}>
                          <td>{i + 1}</td><td>{item.sourceDoc}</td><td>{item.sourceLine}</td><td>{item.code}</td><td>{item.name}</td><td>{item.model}</td><td>{item.unit}</td>
                          <td><Input value={item.batch} onChange={e => updateProduct(item.id, 'batch', e.target.value)} /></td>
                          <td>{item.planQty}</td><td>{item.qcQty}</td><td>{item.passQty}</td><td>{item.concessionQty}</td><td>{item.rejectQty}</td>
                          <td><Input value={item.inQty} onChange={e => updateProduct(item.id, 'inQty', e.target.value)} /></td>
                          <td><Input value={item.shelfQty} onChange={e => updateProduct(item.id, 'shelfQty', e.target.value)} /></td>
                          <td><Select value={item.location} onChange={e => updateProduct(item.id, 'location', e.target.value)}><option>A区-A01-01</option><option>A区-A01-02</option><option>B区-B02-01</option><option>待分配库位</option></Select></td>
                          <td>{item.qcNo}</td>
                          <td><span className={'aw-state '+(item.qcState.includes('合格') || item.qcState.includes('免检') ? 'aw-state-g' : 'aw-state-y')}>{item.qcState}</span></td>
                          <td><span className={'aw-state '+(item.qualityState === '合格' ? 'aw-state-g' : 'aw-state-y')}>{item.qualityState}</span></td>
                          <td>{item.costLayer}</td>
                          <td><span className={'aw-state '+(item.postStatus === '已过账' ? 'aw-state-g' : 'aw-state-y')}>{item.postStatus}</span></td>
                          <td>{item.price}</td><td>{item.amount}</td>
                          <td><Input value={item.prodDate} onChange={e => updateProduct(item.id, 'prodDate', e.target.value)} /></td>
                          <td><Input value={item.remark} onChange={e => updateProduct(item.id, 'remark', e.target.value)} /></td>
                        </tr>
                      ))}
                      <tr><td colSpan={13}>合计</td><td>入库：<span style={{color:'var(--aw-danger)'}}>{totalQty}</span></td><td>上架：<span style={{color:'var(--aw-danger)'}}>{checkedProducts.reduce((sum,item)=>sum+Number(item.shelfQty||0),0)}</span></td><td colSpan={6}>约束：入库≤合格+让步，上架≤入库；过账后生成库存流水和成本层</td><td></td><td>总金额：<span style={{color:'var(--aw-danger)'}}>{totalAmount.toFixed(2)}</span></td><td colSpan={2}></td></tr>
                    </tbody>
                  </table>
                </div>
              </PurchaseSection>
              <InboundCodeControlPanel title="物码绑定明细" />
              <PurchaseSection title="附件">
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(180px,1fr))',gap:12}}>{[1,2,3].map(i => <div key={i} style={{border:'1px dashed var(--aw-border-strong)',borderRadius:6,padding:'12px 14px',background:'#fff'}}><div style={{fontSize:13,fontWeight:500,marginBottom:6}}>新建文本文档.PDF</div><div style={{fontSize:11,color:'var(--aw-fg-4)'}}>文件大小：0 Bytes</div><div style={{display:'flex',gap:14,marginTop:14,fontSize:12}}><span className="aw-link">查看</span><span className="aw-link">下载</span></div></div>)}</div>
              </PurchaseSection>
            </>
          )}
          {tab === '操作记录' && <PurchaseSection title="操作记录"><table className="aw-table"><thead><tr><th>序号</th><th>操作时间</th><th>操作人</th><th>操作类型</th><th>说明</th></tr></thead><tbody><tr><td>1</td><td>2024-06-07 19:49:12</td><td>XXX</td><td>创建</td><td>创建{row.type}入库单</td></tr><tr><td>2</td><td>2024-06-08 09:18:22</td><td>仓库管理员</td><td>确认</td><td>填写入库数量与库位，等待上架</td></tr></tbody></table></PurchaseSection>}
        </Card>
      </div>
    </div>
  );
}

function WarehouseInboundDetailListView() {
  return (
    <>
      <PurchaseListToolbar searchPlaceholder="全局搜索（如物料名称、物料编码）" hideNew />
      <Card title="待入库明细">
        <table className="aw-table">
          <thead><tr><th style={{width:60}}>序号</th><th>物料名称</th><th>物料编码</th><th>规格型号</th><th>单位</th><th>待入库数量</th><th>相关人员</th><th>说明</th></tr></thead>
          <tbody>{INBOUND_DETAIL_ROWS.map((r, i) => <tr key={r.code}><td>{i + 1}</td><td>{r.name}</td><td>{r.code}</td><td>{r.model}</td><td>{r.unit}</td><td>{r.waiting}</td><td>{r.people}</td><td>可点击对应入库单填写入库数量和库位</td></tr>)}</tbody>
        </table>
      </Card>
    </>
  );
}

function DirectInboundView() {
  const [rows, setRows] = useInboundState([INBOUND_PRODUCTS[0]]);
  const [picker, setPicker] = useInboundState(false);
  const [inboundType, setInboundType] = useInboundState('直接入库');
  const [sourceType, setSourceType] = useInboundState(null);
  const [sourceDoc, setSourceDoc] = useInboundState(null);
  const [form, setForm] = useInboundState({ subject:'', related:'', dept:'', person:'', date:'', warehouse:'' });
  const addProducts = (products) => {
    setRows(prev => [...prev, ...products.map((p, idx) => ({ id:`in-${Date.now()}-${idx}`, sourceDoc:'手动入库', sourceLine:'手动明细', qcNo:'待生成', code:p.productNo, name:p.productName, model:p.model || p.spec, unit:p.unit, batch:'', planQty:'', qcQty:'', passQty:'', concessionQty:'', rejectQty:'', inQty:'', shelfQty:'', location:'待分配库位', qcState:'待送检', qualityState:'待检', costLayer:'过账生成', postStatus:'待过账', price:p.price ? Number(p.price).toFixed(2) : '', amount:'', prodDate:'', remark:'' }))]);
    setPicker(false);
  };
  const updateRow = (id, key, value) => setRows(prev => prev.map(row => row.id === id ? {...row, [key]: value} : row));
  const handleTypeChange = (value) => {
    setInboundType(value);
    if (value === '直接入库') {
      setSourceType(null);
      setSourceDoc(null);
      setForm(prev => ({...prev, subject:'', related:'', dept:'', person:''}));
      return;
    }
    setSourceType(value);
  };
  const handleSourceConfirm = (doc) => {
    setSourceDoc(doc);
    setForm({
      subject: doc.title.replace(/申请|订单|单/g, '') + '入库',
      related: doc.code,
      dept: doc.org,
      person: doc.person,
      date: doc.date,
      warehouse: '仓库0545',
    });
    setRows(INBOUND_PRODUCTS.map((p, idx) => ({
      ...p,
      id:`src-${doc.code}-${idx}`,
      planQty: Math.min(Number(p.planQty || 0), Math.ceil(doc.qty / 3)),
      qcQty: Math.min(Number(p.planQty || 0), Math.ceil(doc.qty / 3)),
      inQty: String(Math.min(Number(p.planQty || 0), Math.ceil(doc.qty / 3))),
      location: idx === 0 ? 'A区-A01-01' : idx === 1 ? 'A区-A01-02' : 'B区-B02-01',
    })));
    setSourceType(null);
  };
  return (
    <PurchaseFormPage onBack={() => {}} submitText="确认入库">
      <PurchaseSection title="基础信息">
        <div className="aw-doc-grid" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
          <Field label="入库主题" req><Input value={form.subject} onChange={e => setForm(prev => ({...prev, subject:e.target.value}))} placeholder="请输入入库主题" /></Field>
          <Field label="入库单号"><Input placeholder="自动生成" disabled /></Field>
          <Field label="入库类型" req><Select value={inboundType} onChange={e => handleTypeChange(e.target.value)}><option>直接入库</option><option>采购入库</option><option>生产入库</option><option>销售退货入库</option><option>委外入库</option></Select></Field>
          <Field label="入库仓库" req><Select value={form.warehouse} onChange={e => setForm(prev => ({...prev, warehouse:e.target.value}))}><option value="">请选择仓库</option><option>仓库0545</option><option>原料仓</option></Select></Field>
          <Field label="关联单据"><Input value={form.related} onChange={e => setForm(prev => ({...prev, related:e.target.value}))} placeholder={inboundType === '直接入库' ? '可手动填写关联单据' : '选择来源单据后自动带入'} /></Field>
          <Field label="入库部门"><Input value={form.dept} onChange={e => setForm(prev => ({...prev, dept:e.target.value}))} placeholder="请选择入库部门" /></Field>
          <Field label="入库人员" req><PersonPickerInput value={form.person} onChange={(name) => setForm(prev => ({...prev, person:name}))} placeholder="请选择入库人员" /></Field>
          <Field label="入库日期" req><Input value={form.date} onChange={e => setForm(prev => ({...prev, date:e.target.value}))} placeholder="请选择日期" /></Field>
          <Field label="经办人"><Input placeholder="自动带入当前用户" disabled /></Field>
        </div>
        {inboundType === '直接入库' && (
          <div style={{marginTop:10,fontSize:12,color:'var(--aw-fg-3)',lineHeight:1.7}}>
            直接入库属于无来源入库，提交时按“直接入库审批流程”处理；若策略配置禁止无来源直接入库，则该类型应禁用并只能从来源单据生成。
          </div>
        )}
        {sourceDoc && <div style={{marginTop:10,fontSize:12,color:'var(--aw-fg-3)'}}>已选择来源单据：<span className="aw-link">{sourceDoc.code}</span> / {sourceDoc.title}</div>}
      </PurchaseSection>
      <PurchaseSection title="物品明细">
        <div style={{overflow:'auto'}}><table className="aw-table"><thead><tr><th>序号</th><th>来源单据</th><th>来源明细</th><th>物品编码</th><th>物品名称</th><th>规格型号</th><th>单位</th><th>批次号</th><th>应入库数量</th><th>送检数量</th><th>合格数量</th><th>让步数量</th><th>不合格数量</th><th>入库数量</th><th>上架数量</th><th>入库库位</th><th>质检单号</th><th>质检/上架状态</th><th>库存质量</th><th>成本层</th><th>过账状态</th><th>生产日期</th><th style={{width:70}}>操作</th></tr></thead><tbody>{rows.map((row, idx)=><tr key={row.id}><td>{idx+1}</td><td>{row.sourceDoc || '手动入库'}</td><td>{row.sourceLine || '手动明细'}</td><td>{row.code}</td><td>{row.name}</td><td>{row.model}</td><td>{row.unit}</td><td><Input value={row.batch} onChange={e=>updateRow(row.id,'batch',e.target.value)} /></td><td>{row.planQty || '-'}</td><td><Input value={row.qcQty || ''} onChange={e=>updateRow(row.id,'qcQty',e.target.value)} /></td><td><Input value={row.passQty || ''} onChange={e=>updateRow(row.id,'passQty',e.target.value)} /></td><td><Input value={row.concessionQty || ''} onChange={e=>updateRow(row.id,'concessionQty',e.target.value)} /></td><td><Input value={row.rejectQty || ''} onChange={e=>updateRow(row.id,'rejectQty',e.target.value)} /></td><td><Input value={row.inQty} onChange={e=>updateRow(row.id,'inQty',e.target.value)} /></td><td><Input value={row.shelfQty || ''} onChange={e=>updateRow(row.id,'shelfQty',e.target.value)} /></td><td><Select value={row.location} onChange={e=>updateRow(row.id,'location',e.target.value)}><option>A区-A01-01</option><option>A区-A01-02</option><option>B区-B02-01</option><option>待分配库位</option></Select></td><td>{row.qcNo || '待生成'}</td><td><Select value={row.qcState || '待送检'} onChange={e=>updateRow(row.id,'qcState',e.target.value)}><option>待送检</option><option>合格待上架</option><option>让步放行</option><option>拒收入库</option><option>已上架过账</option></Select></td><td><Select value={row.qualityState || '待检'} onChange={e=>updateRow(row.id,'qualityState',e.target.value)}><option>待检</option><option>合格</option><option>让步</option><option>不合格</option></Select></td><td>{row.costLayer || '过账生成'}</td><td><span className={'aw-state '+((row.postStatus || '待过账') === '已过账' ? 'aw-state-g' : 'aw-state-y')}>{row.postStatus || '待过账'}</span></td><td><Input value={row.prodDate} onChange={e=>updateRow(row.id,'prodDate',e.target.value)} /></td><td><span className="aw-link" style={{color:'var(--aw-danger)'}} onClick={()=>setRows(prev=>prev.filter(x=>x.id!==row.id))}>删除</span></td></tr>)}</tbody></table></div>
        <PurchaseAddDetailButton onClick={() => setPicker(true)} />
      </PurchaseSection>
      <InboundCodeControlPanel title="物码绑定明细" />
      <PurchaseSection title="附件"><div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(180px,1fr))',gap:12}}><div style={{border:'1px solid var(--aw-border)',borderRadius:6,padding:14}}>新建文本文档.PDF<br/><span style={{fontSize:11,color:'var(--aw-fg-4)'}}>文件大小：0 Bytes</span></div><div style={{border:'1px dashed var(--aw-border-strong)',borderRadius:6,padding:30,textAlign:'center'}}><span className="aw-link">点击上传</span> / 拖拽到此区域</div></div></PurchaseSection>
      <PurchaseSection title="详情"><PurchaseRichText placeholder="请输入入库说明、质检要求、上架注意事项等信息" /></PurchaseSection>
      {picker && <ProductPickerModal onClose={() => setPicker(false)} onConfirm={addProducts} />}
      {sourceType && <InboundSourcePickerModal type={sourceType} onClose={() => { setSourceType(null); setInboundType('直接入库'); }} onConfirm={handleSourceConfirm} />}
    </PurchaseFormPage>
  );
}

function WarehouseInboundScreen({ initialAction, onActionConsumed }) {
  const actionMap = { '直接入库':'direct', '全部入库单':'all', '待入库单':'pending', '待入库明细':'detail', 'new':'direct' };
  const [mode, setMode] = useInboundState(actionMap[initialAction] || 'all');
  const [detail, setDetail] = useInboundState(null);
  useInboundEffect(() => {
    if (initialAction && actionMap[initialAction]) { setMode(actionMap[initialAction]); setDetail(null); onActionConsumed && onActionConsumed(); }
  }, [initialAction]);
  return (
    <div>
      {detail && <WarehouseInboundOrderDetail data={detail} onBack={() => setDetail(null)} />}
      {!detail && mode === 'direct' && <DirectInboundView />}
      {!detail && (mode === 'all' || mode === 'pending') && <WarehouseInboundListView mode={mode} onView={setDetail} />}
      {!detail && mode === 'detail' && <WarehouseInboundDetailListView />}
    </div>
  );
}

window.WarehouseInboundScreen = WarehouseInboundScreen;
