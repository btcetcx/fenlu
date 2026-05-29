// ui_kits/erp-console/warehouse-outbound-list.jsx
// 仓储中心 — 出库管理
const { useState: useOutboundState, useEffect: useOutboundEffect } = React;

const OUTBOUND_ROWS = [
  { subject:'内部领用出库', code:'CK-20251221001', type:'内部领用', qty:1000, applyDate:'2025-12-21', user:'傲为', date:'', state:'已审核待占用', tone:'y', owner:'三红', target:'生产一部', destination:'部门领用' },
  { subject:'委外领料出库', code:'CK-20251221002', type:'委外领料', qty:650, applyDate:'2025-12-20', user:'李文涛', date:'', state:'待复核', tone:'b', owner:'海鹏微为', target:'深圳协同加工厂', destination:'委外加工商' },
  { subject:'销售订单出库', code:'CK-20251221003', type:'销售出库', qty:500, applyDate:'2025-12-20', user:'李文涛', date:'2025-12-21', state:'已出库过账', tone:'g', owner:'海鹏微为', target:'海南傲为客户A', destination:'客户收货地址' },
  { subject:'采购退货出库', code:'CK-20251221004', type:'采购退货', qty:120, applyDate:'2025-12-19', user:'陈思源', date:'', state:'短拣待处理', tone:'y', owner:'陈思源', target:'华南五金供应商', destination:'供应商退货地址' },
  { subject:'直接出库', code:'CK-20251221005', type:'直接出库', qty:80, applyDate:'2025-12-18', user:'赵强', date:'', state:'未申请发货', tone:'gray', owner:'赵强', target:'临时项目领用', destination:'项目现场' },
];

const OUTBOUND_DETAIL_ROWS = [
  { name:'产品一', code:'123456', model:'规格一', unit:'个', qty:100, source:'可出库未出库', people:'李文涛、陈思源' },
  { name:'半成品物料', code:'7820864', model:'HM-450', unit:'KG', qty:300, source:'库存已锁定，暂存状态', people:'赵强' },
  { name:'铝合金型材', code:'8518691', model:'AL-6061', unit:'KG', qty:80, source:'可出库未出库', people:'李文涛' },
];

const OUTBOUND_DETAIL_PRODUCTS = [
  { sourceDoc:'SO-20251221001', sourceLine:'SO-20251221001-01', code:'7820864', name:'半成品物料', model:'规格一', unit:'公斤', batch:'B20250601', qualityState:'合格', costLayer:'LAYER-OUT-01', oqcNo:'OQC-20251221001', oqcState:'已放行', postStatus:'已过账', available:620, locked:500, pickQty:480, checkQty:480, shipQty:480, qty:500, price:'100.00', amount:'50000.00', location:'A区-A01-01', prodDate:'2024-06-09', expireDate:'2026-06-09', remark:'' },
  { sourceDoc:'SO-20251221001', sourceLine:'SO-20251221001-02', code:'5786931', name:'半成品物料', model:'规格一', unit:'公斤', batch:'B20250602', qualityState:'合格', costLayer:'LAYER-OUT-02', oqcNo:'OQC-20251221001', oqcState:'已放行', postStatus:'已过账', available:520, locked:500, pickQty:500, checkQty:500, shipQty:500, qty:500, price:'100.00', amount:'50000.00', location:'A区-A01-02', prodDate:'2024-06-09', expireDate:'2026-06-09', remark:'' },
  { sourceDoc:'SO-20251221001', sourceLine:'SO-20251221001-03', code:'8518691', name:'半成品物料', model:'规格一', unit:'公斤', batch:'B20250603', qualityState:'合格', costLayer:'LAYER-OUT-03', oqcNo:'OQC-20251221001', oqcState:'待放行', postStatus:'待过账', available:500, locked:500, pickQty:500, checkQty:498, shipQty:498, qty:500, price:'100.00', amount:'50000.00', location:'B区-B02-01', prodDate:'2024-06-09', expireDate:'2026-06-09', remark:'差异2' },
  { sourceDoc:'LL-20251221001', sourceLine:'LL-20251221001-01', code:'6576642', name:'半成品物料', model:'规格一', unit:'公斤', batch:'B20250604', qualityState:'让步', costLayer:'LAYER-OUT-04', oqcNo:'无需OQC', oqcState:'无需OQC', postStatus:'待过账', available:500, locked:500, pickQty:500, checkQty:500, shipQty:500, qty:500, price:'100.00', amount:'50000.00', location:'B区-B02-02', prodDate:'2024-06-09', expireDate:'2026-06-09', remark:'' },
  { sourceDoc:'RT-20251221001', sourceLine:'RT-20251221001-01', code:'6081578', name:'半成品物料', model:'规格一', unit:'公斤', batch:'B20250605', qualityState:'待检', costLayer:'LAYER-OUT-05', oqcNo:'OQC-20251221005', oqcState:'已拦截', postStatus:'禁止过账', available:500, locked:500, pickQty:500, checkQty:500, shipQty:500, qty:500, price:'100.00', amount:'50000.00', location:'C区-C03-05', prodDate:'2024-06-09', expireDate:'2026-06-09', remark:'' },
];

const OUTBOUND_SOURCE_DOCS = {
  '内部领用': [
    { code:'LL-20251221001', title:'生产一部内部领用申请', org:'生产一部', person:'三红', date:'2025-12-21', qty:1000 },
    { code:'LL-20251221002', title:'研发中心样机物料领用', org:'研发中心', person:'老夏', date:'2025-12-20', qty:240 },
  ],
  '委外领料': [
    { code:'WW-20251221001', title:'深圳协同加工委外领料', org:'深圳协同加工厂', person:'海鹏微为', date:'2025-12-20', qty:650 },
    { code:'WW-20251221002', title:'东莞精密件委外领料', org:'东莞精密制造厂', person:'李文涛', date:'2025-12-19', qty:360 },
  ],
  '销售出库': [
    { code:'SO-20251221001', title:'海南傲为客户A销售订单', org:'海南傲为客户A', person:'海鹏微为', date:'2025-12-21', qty:500 },
    { code:'SO-20251221002', title:'某某定制项目销售订单', org:'某某科技', person:'赵强', date:'2025-12-20', qty:180 },
  ],
  '采购退货': [
    { code:'RT-20251221001', title:'华南五金来料异常退货', org:'华南五金供应商', person:'陈思源', date:'2025-12-19', qty:120 },
    { code:'RT-20251221002', title:'包装材料批次退货', org:'包装耗材供应商', person:'李文涛', date:'2025-12-18', qty:80 },
  ],
};

const OUTBOUND_CODE_ROWS = [
  { main:'SN-202605-0001', pack:'BOX-202605-010', batch:'B20250601', location:'A区-A01-01', quality:'合格', check:'通过', user:'李文涛', time:'2026-05-21 15:18' },
  { main:'SN-202605-0002', pack:'BOX-202605-010', batch:'B20250601', location:'A区-A01-01', quality:'合格', check:'通过', user:'李文涛', time:'2026-05-21 15:19' },
  { main:'SN-202605-0003', pack:'BOX-202605-011', batch:'B20250602', location:'A区-A01-02', quality:'待检', check:'拦截', user:'陈质检', time:'2026-05-21 15:22' },
];

function OutboundCodePickPanel({ title = '扫码拣货记录' }) {
  return (
    <PurchaseSection title={title}>
      <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',marginBottom:12}}>
        <div style={{fontSize:12,color:'var(--aw-fg-3)'}}>出库过账前校验已扫数量、质量状态、冻结占用、OQC 放行和包装码展开数量。</div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <Btn>扫码拣货</Btn><Btn>选择库存码</Btn><Btn>查看已扫码</Btn><Btn>解绑/重扫</Btn>
        </div>
      </div>
      <table className="aw-table">
        <thead><tr><th>主码</th><th>包装码</th><th>批次</th><th>库位</th><th>质量状态</th><th>校验结果</th><th>扫码人</th><th>扫码时间</th><th>操作</th></tr></thead>
        <tbody>{OUTBOUND_CODE_ROWS.map(row => <tr key={row.main}><td className="aw-num">{row.main}</td><td>{row.pack}</td><td>{row.batch}</td><td>{row.location}</td><td>{row.quality}</td><td><Badge tone={row.check === '通过' ? 'g' : 'r'}>{row.check}</Badge></td><td>{row.user}</td><td>{row.time}</td><td><span className="aw-link">追溯</span></td></tr>)}</tbody>
      </table>
    </PurchaseSection>
  );
}

function getOutboundTypeFields(row) {
  const map = {
    '内部领用': [['领用部门', row.target], ['领用人', row.owner], ['出库去向', row.destination]],
    '委外领料': [['委外供应商', row.target], ['委外联系人', row.owner], ['出库去向', row.destination]],
    '销售出库': [['客户', row.target], ['客户联系人', row.owner], ['交货地址', row.destination]],
    '采购退货': [['供应商', row.target], ['采购负责人', row.owner], ['退货地址', row.destination]],
    '直接出库': [['出库对象', row.target], ['经办人', row.owner], ['出库去向', row.destination]],
  };
  return map[row.type] || map['直接出库'];
}

function OutboundSourcePickerModal({ type, onClose, onConfirm }) {
  const docs = OUTBOUND_SOURCE_DOCS[type] || [];
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

function OutboundListView({ mode, onView }) {
  const [sel, setSel] = useOutboundState({});
  const rows = mode === 'pending' ? OUTBOUND_ROWS.filter(r => !['已出库过账','异常关闭'].includes(r.state)) : OUTBOUND_ROWS;
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
      <PurchaseListToolbar searchPlaceholder="全局搜索（如客户、产品名称、工单编号…）" hideNew />
      <div className="aw-doc-tbl-wrap">
        <table className="aw-doc-tbl">
          <thead>
            <tr>
              <PurchaseSelectHeader checked={allChecked} indeterminate={someChecked} onToggle={toggleAll} />
              <PurchaseIndexHeader />
              <th><div className="aw-th-inner">出库主题</div></th>
              <th><div className="aw-th-inner">出库单号</div></th>
              <th><div className="aw-th-inner">出库类别</div></th>
              <th><div className="aw-th-inner">出库数量</div></th>
              <th><div className="aw-th-inner">申请日期</div></th>
              <th><div className="aw-th-inner">出库人员</div></th>
              <th><div className="aw-th-inner">出库日期</div></th>
              <th><div className="aw-th-inner">出库状态</div></th>
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

function OutboundOrderDetailView({ data, onBack }) {
  const row = data || OUTBOUND_ROWS[0];
  const [tab, setTab] = useOutboundState('出库信息');
  const typeFields = getOutboundTypeFields(row);
  const baseFields = [
    ['出库类型', row.type],
    ['出库单号', row.code],
    ['出库日期', row.date || row.applyDate],
    ['出库仓库', row.type === '采购退货' ? '退货暂存仓' : '仓库0545'],
    ['出库状态', row.state],
    ['项目', row.type === '销售出库' ? '销售订单项目' : row.type === '委外领料' ? '委外加工项目' : '项目一'],
    ...typeFields,
  ];
  const checkedProducts = OUTBOUND_DETAIL_PRODUCTS.map(item => {
    const qty = Number(item.qty || 0);
    const pickQty = Math.min(Number(item.pickQty || 0), qty);
    const checkQty = Math.min(Number(item.checkQty || 0), pickQty);
    const shipQty = Math.min(Number(item.shipQty || 0), checkQty);
    const shortQty = qty - shipQty;
    return { ...item, pickQty, checkQty, shipQty, shortQty };
  });
  const totalQty = checkedProducts.reduce((sum, item) => sum + Number(item.qty || 0), 0);
  const totalAmount = checkedProducts.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  return (
    <div className="aw-doc-form">
      <div className="aw-doc-form-body">
        <DetailHeaderCard
          title={`202404${row.subject}单232`}
          status={row.state}
          onBack={onBack}
          detailItems={[
            ['出库类型', row.type],
            ['出库单号', row.code],
            ['出库日期', row.date || row.applyDate],
            ['出库仓库', row.type === '采购退货' ? '退货暂存仓' : '仓库0545'],
            ['打印状态', '未打印'],
          ]}
        />
        <Card>
          <Tabs items={[{k:'出库信息',label:'出库信息'},{k:'操作记录',label:'操作记录'}]} active={tab} onChange={setTab} />
          {tab === '出库信息' && (
            <>
              <PurchaseSection title="基础信息">
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',rowGap:16,columnGap:80,fontSize:13,marginBottom:22}}>
                  {baseFields.map(([label, value]) => <div key={label}><span style={{color:'var(--aw-fg-3)'}}>{label}：</span>{value}</div>)}
                </div>
              </PurchaseSection>
              <PurchaseSection title="物品明细">
                <div style={{overflow:'auto'}}>
                  <table className="aw-table">
                    <thead><tr><th>序号</th><th>来源单据</th><th>来源明细</th><th>物品编码</th><th>物品名称</th><th>规格型号</th><th>单位</th><th>批次号</th><th>质量状态</th><th>成本层</th><th>推荐库位</th><th>可用量</th><th>锁定量</th><th>应出数量</th><th>拣货数量</th><th>复核数量</th><th>发货数量</th><th>OQC单号</th><th>放行状态</th><th>过账状态</th><th>单价</th><th>合计</th><th>到期日期</th><th>备注</th></tr></thead>
                    <tbody>
                      {checkedProducts.map((item, i) => <tr key={item.code}><td>{i + 1}</td><td>{item.sourceDoc}</td><td>{item.sourceLine}</td><td>{item.code}</td><td>{item.name}</td><td>{item.model}</td><td>{item.unit}</td><td>{item.batch}</td><td><span className={'aw-state '+(item.qualityState === '合格' ? 'aw-state-g' : 'aw-state-y')}>{item.qualityState}</span></td><td>{item.costLayer}</td><td>{item.location}</td><td>{item.available}</td><td>{item.locked}</td><td>{item.qty}</td><td>{item.pickQty}</td><td>{item.checkQty}</td><td>{item.shipQty}</td><td>{item.oqcNo}</td><td><span className={'aw-state '+(item.oqcState === '已放行' || item.oqcState === '无需OQC' ? 'aw-state-g' : 'aw-state-y')}>{item.oqcState}</span></td><td><span className={'aw-state '+(item.postStatus === '已过账' ? 'aw-state-g' : 'aw-state-y')}>{item.postStatus}</span></td><td>{item.price}</td><td>{item.amount}</td><td>{item.expireDate}</td><td>{item.shortQty ? `短拣${item.shortQty}；${item.remark}` : item.remark}</td></tr>)}
                      <tr><td colSpan={13}>合计</td><td>应出：<span style={{color:'var(--aw-danger)'}}>{totalQty}</span></td><td colSpan={3}>已发：<span style={{color:'var(--aw-danger)'}}>{checkedProducts.reduce((sum,item)=>sum+Number(item.shipQty||0),0)}</span></td><td colSpan={3}>约束：发运≤复核≤拣货≤应出；OQC未放行禁止过账</td><td></td><td>总金额：<span style={{color:'var(--aw-danger)'}}>{totalAmount.toFixed(2)}</span></td><td colSpan={2}></td></tr>
                    </tbody>
                  </table>
                </div>
              </PurchaseSection>
              <OutboundCodePickPanel title="扫码拣货记录" />
              <PurchaseSection title="附件">
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(180px,1fr))',gap:12}}>
                  {[1,2,3].map(i => <div key={i} style={{border:'1px dashed var(--aw-border-strong)',borderRadius:6,padding:'12px 14px',background:'#fff'}}><div style={{fontSize:13,fontWeight:500,marginBottom:6}}>新建文本文档.PDF</div><div style={{fontSize:11,color:'var(--aw-fg-4)'}}>文件大小：0 Bytes</div><div style={{fontSize:11,color:'var(--aw-fg-4)',marginTop:2}}>上传日期：2024-08-1 17:45:27</div><div style={{display:'flex',gap:14,marginTop:14,fontSize:12}}><span className="aw-link">查看</span><span className="aw-link">下载</span></div></div>)}
                </div>
              </PurchaseSection>
            </>
          )}
          {tab === '操作记录' && (
            <PurchaseSection title="操作记录">
              <table className="aw-table">
                <thead><tr><th>序号</th><th>操作时间</th><th>操作人</th><th>操作类型</th><th>说明</th></tr></thead>
                <tbody>
                  <tr><td>1</td><td>2024-06-07 19:49:12</td><td>XXX</td><td>创建</td><td>创建{row.type}出库单</td></tr>
                  <tr><td>2</td><td>2024-06-08 09:18:22</td><td>仓库管理员</td><td>审核</td><td>单据通过审核，等待出库</td></tr>
                </tbody>
              </table>
            </PurchaseSection>
          )}
        </Card>
      </div>
    </div>
  );
}

function OutboundDetailListView({ mode }) {
  const title = mode === 'apply' ? '待申请发货' : '待出库明细';
  return (
    <>
      <PurchaseListToolbar searchPlaceholder="全局搜索（如物料名称、物料编码）" hideNew />
      <Card title={title}>
        <table className="aw-table">
          <thead><tr><th style={{width:60}}>序号</th><th>物料名称</th><th>物料编码</th><th>规格型号</th><th>单位</th><th>待出库数量</th><th>相关人员</th><th>说明</th></tr></thead>
          <tbody>
            {OUTBOUND_DETAIL_ROWS.map((r, i) => (
              <tr key={r.code}><td>{i + 1}</td><td>{r.name}</td><td>{r.code}</td><td>{r.model}</td><td>{r.unit}</td><td>{r.qty}</td><td>{r.people}</td><td>{mode === 'apply' ? '订单流转策略为否，需要手动申请发货' : r.source}</td></tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

function DirectOutboundView() {
  const [rows, setRows] = useOutboundState([
    { id:'o1', sourceDoc:'手动出库', sourceLine:'手动明细', code:'7820864', name:'半成品物料', model:'规格一', type:'物料', unit:'公斤', batch:'', qualityState:'合格', costLayer:'待匹配', oqcState:'无需OQC', location:'待推荐', available:620, locked:0, qty:'2', price:'50.00', amount:'100.00', prodDate:'', expireDate:'', remark:'' },
  ]);
  const [picker, setPicker] = useOutboundState(false);
  const [outboundType, setOutboundType] = useOutboundState('直接出库');
  const [sourceType, setSourceType] = useOutboundState(null);
  const [sourceDoc, setSourceDoc] = useOutboundState(null);
  const [form, setForm] = useOutboundState({ subject:'', dept:'', person:'', date:'', warehouse:'', related:'' });
  const toNumber = (value) => {
    const n = Number(String(value || '').replace(/[^\d.-]/g, ''));
    return Number.isFinite(n) ? n : 0;
  };
  const updateRow = (id, key, value) => setRows(prev => prev.map(row => {
    if (row.id !== id) return row;
    const next = {...row, [key]: value};
    if (key === 'qty' || key === 'price') next.amount = (toNumber(key === 'qty' ? value : next.qty) * toNumber(key === 'price' ? value : next.price)).toFixed(2);
    return next;
  }));
  const addProducts = (products) => {
    setRows(prev => [...prev, ...products.map((p, idx) => ({ id:`out-${Date.now()}-${idx}`, sourceDoc:'手动出库', sourceLine:'手动明细', code:p.productNo, name:p.productName, model:p.model || p.spec, type:p.categoryName, unit:p.unit, batch:'', qualityState:'合格', costLayer:'待匹配', oqcState:'无需OQC', location:'待推荐', available:p.stock || 0, locked:0, qty:'', price:p.price ? Number(p.price).toFixed(2) : '', amount:'', prodDate:'', expireDate:'', remark:'' }))]);
    setPicker(false);
  };
  const handleTypeChange = (value) => {
    setOutboundType(value);
    if (value === '直接出库') {
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
      subject: doc.title.replace(/申请|订单|单/g, '') + '出库',
      related: doc.code,
      dept: doc.org,
      person: doc.person,
      date: doc.date,
      warehouse: '仓库一',
    });
    setRows(OUTBOUND_DETAIL_PRODUCTS.slice(0, 3).map((p, idx) => ({
      id:`src-${doc.code}-${idx}`,
      code:p.code,
      name:p.name,
      model:p.model,
      type:'物料',
      unit:p.unit,
      batch:p.batch,
      location:p.location,
      available:p.available,
      locked:p.locked,
      qty:String(Math.min(Number(p.qty || 0), Math.ceil(doc.qty / 3))),
      price:p.price,
      amount:(Number(p.price || 0) * Math.min(Number(p.qty || 0), Math.ceil(doc.qty / 3))).toFixed(2),
      prodDate:p.prodDate,
      expireDate:p.expireDate,
      remark:'',
      sourceDoc: doc.code,
      sourceLine: `${doc.code}-${idx + 1}`.padStart(2, '0'),
      qualityState: p.qualityState,
      costLayer: p.costLayer,
      oqcState: p.oqcState,
    })));
    setSourceType(null);
  };
  const totalQty = rows.reduce((sum, row) => sum + toNumber(row.qty), 0);
  const totalAmount = rows.reduce((sum, row) => sum + toNumber(row.amount), 0);
  return (
    <PurchaseFormPage onBack={() => {}} submitText="确认出库">
      <PurchaseSection title="基础信息">
        <div className="aw-doc-grid" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
          <Field label="出库主题" req><Input value={form.subject} onChange={e => setForm(prev => ({...prev, subject:e.target.value}))} placeholder="请输入出库主题" /></Field>
          <Field label="出库单号"><Input placeholder="自动生成" disabled /></Field>
          <Field label="出库类型" req><Select value={outboundType} onChange={e => handleTypeChange(e.target.value)}><option>直接出库</option><option>内部领用</option><option>委外领料</option><option>销售出库</option><option>采购退货</option></Select></Field>
          <Field label="出库仓库" req><Select value={form.warehouse} onChange={e => setForm(prev => ({...prev, warehouse:e.target.value}))}><option value="">请选择仓库</option><option>仓库一</option><option>仓库二</option></Select></Field>
          <Field label="关联单据"><Input value={form.related} onChange={e => setForm(prev => ({...prev, related:e.target.value}))} placeholder={outboundType === '直接出库' ? '可手动填写关联单据' : '选择来源单据后自动带入'} /></Field>
          <Field label="出库部门"><Input value={form.dept} onChange={e => setForm(prev => ({...prev, dept:e.target.value}))} placeholder="请选择出库部门" /></Field>
          <Field label="出库人员" req><PersonPickerInput value={form.person} onChange={(name) => setForm(prev => ({...prev, person:name}))} placeholder="请选择出库人员" /></Field>
          <Field label="出库日期" req><Input value={form.date} onChange={e => setForm(prev => ({...prev, date:e.target.value}))} placeholder="请选择日期" /></Field>
          <Field label="经办人"><Input placeholder="自动带入当前用户" disabled /></Field>
        </div>
        {sourceDoc && <div style={{marginTop:10,fontSize:12,color:'var(--aw-fg-3)'}}>已选择来源单据：<span className="aw-link">{sourceDoc.code}</span> / {sourceDoc.title}</div>}
      </PurchaseSection>
      <PurchaseSection title="物品明细">
        <div style={{overflow:'auto'}}>
          <table className="aw-table">
            <thead><tr><th>序号</th><th>来源单据</th><th>来源明细</th><th>物品编码</th><th>物品名称</th><th>规格型号</th><th>物品类型</th><th>单位</th><th>批次号</th><th>质量状态</th><th>成本层</th><th>推荐库位</th><th>可用量</th><th>锁定量</th><th>数量</th><th>OQC状态</th><th>单价</th><th>合计</th><th>生产日期</th><th>到期日期</th><th style={{width:70}}>操作</th></tr></thead>
            <tbody>
              {rows.map((row, idx) => <tr key={row.id}><td>{idx+1}</td><td>{row.sourceDoc || '手动出库'}</td><td>{row.sourceLine || '手动明细'}</td><td>{row.code}</td><td>{row.name}</td><td>{row.model}</td><td>{row.type}</td><td>{row.unit}</td><td><Input value={row.batch} onChange={e=>updateRow(row.id,'batch',e.target.value)} /></td><td><Select value={row.qualityState || '合格'} onChange={e=>updateRow(row.id,'qualityState',e.target.value)}><option>合格</option><option>让步</option><option>待检</option><option>冻结</option></Select></td><td>{row.costLayer || '待匹配'}</td><td>{row.location || '待推荐'}</td><td>{row.available ?? '-'}</td><td>{row.locked ?? 0}</td><td><Input value={row.qty} onChange={e=>updateRow(row.id,'qty',e.target.value)} /></td><td><span className={'aw-state '+((row.oqcState || '无需OQC') === '已拦截' ? 'aw-state-y' : 'aw-state-g')}>{row.oqcState || '无需OQC'}</span></td><td>{row.price}</td><td>{row.amount}</td><td><Input value={row.prodDate} onChange={e=>updateRow(row.id,'prodDate',e.target.value)} /></td><td><Input value={row.expireDate} onChange={e=>updateRow(row.id,'expireDate',e.target.value)} /></td><td><span className="aw-link" style={{color:'var(--aw-danger)'}} onClick={() => setRows(prev => prev.filter(item => item.id !== row.id))}>删除</span></td></tr>)}
              {rows.length === 0 && <tr><td colSpan={21} style={{textAlign:'center',color:'var(--aw-fg-3)',padding:'28px 12px'}}>暂无物品明细，点击「新增明细」选择产品</td></tr>}
              <tr><td colSpan={14}>合计</td><td>总量：<span style={{color:'var(--aw-danger)'}}>{totalQty}</span></td><td></td><td></td><td>总金额：<span style={{color:'var(--aw-danger)'}}>{totalAmount.toFixed(2)}</span></td><td colSpan={3}>确认出库后占用库存，发货过账后扣减成本层</td></tr>
            </tbody>
          </table>
        </div>
        <PurchaseAddDetailButton onClick={() => setPicker(true)} />
      </PurchaseSection>
      <PurchaseSection title="附件">
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(180px,1fr))',gap:12}}><div style={{border:'1px solid var(--aw-border)',borderRadius:6,padding:14}}>新建文本文档.PDF<br/><span style={{fontSize:11,color:'var(--aw-fg-4)'}}>文件大小：0 Bytes</span></div><div style={{border:'1px dashed var(--aw-border-strong)',borderRadius:6,padding:30,textAlign:'center'}}><span className="aw-link">点击上传</span> / 拖拽到此区域</div></div>
      </PurchaseSection>
      <PurchaseSection title="详情">
        <PurchaseRichText placeholder="请输入出库说明、用途、流转要求、交接注意事项等信息" />
      </PurchaseSection>
      <OutboundCodePickPanel title="扫码拣货记录" />
      {picker && <ProductPickerModal onClose={() => setPicker(false)} onConfirm={addProducts} />}
      {sourceType && <OutboundSourcePickerModal type={sourceType} onClose={() => { setSourceType(null); setOutboundType('直接出库'); }} onConfirm={handleSourceConfirm} />}
    </PurchaseFormPage>
  );
}

function WarehouseOutboundScreen({ initialAction, onActionConsumed }) {
  const actionMap = { '直接出库':'direct', '全部出库单':'all', '待出库单':'pending', '待出库明细':'detail', '待申请发货':'apply' };
  const [mode, setMode] = useOutboundState(actionMap[initialAction] || 'all');
  const [detail, setDetail] = useOutboundState(null);
  useOutboundEffect(() => {
    if (initialAction && actionMap[initialAction]) { setMode(actionMap[initialAction]); setDetail(null); onActionConsumed && onActionConsumed(); }
  }, [initialAction]);
  return (
    <div>
      {detail && <OutboundOrderDetailView data={detail} onBack={() => setDetail(null)} />}
      {!detail && mode === 'direct' && <DirectOutboundView />}
      {!detail && (mode === 'all' || mode === 'pending') && <OutboundListView mode={mode} onView={setDetail} />}
      {!detail && (mode === 'detail' || mode === 'apply') && <OutboundDetailListView mode={mode} />}
    </div>
  );
}

window.WarehouseOutboundScreen = WarehouseOutboundScreen;
