// ui_kits/erp-console/warehouse-transfer-list.jsx
// 仓储中心 — 调拨管理
const { useState: useTransferState, useEffect: useTransferEffect } = React;

const TRANSFER_ROWS = [
  { subject:'半成品物料调拨', code:'DB-20251221001', qty:500, fromWh:'二号仓库', toWh:'仓库0545', date:'2025-12-21', user:'李文涛', state:'待调出确认', tone:'y' },
  { subject:'成品备货调拨', code:'DB-20251221002', qty:120, fromWh:'一号仓库', toWh:'销售暂存仓', date:'2025-12-20', user:'赵强', state:'已完成', tone:'g' },
  { subject:'原材料跨仓调拨', code:'DB-20251221003', qty:260, fromWh:'原料仓', toWh:'生产线边仓', date:'2025-12-19', user:'陈思源', state:'在途', tone:'b' },
  { subject:'质检暂存调拨', code:'DB-20251221004', qty:80, fromWh:'质检暂存仓', toWh:'二号仓库', date:'2025-12-18', user:'老夏', state:'差异待处理', tone:'y' },
];

const TRANSFER_PRODUCTS = [
  { id:'t1', sourceLine:'DB-20251221001-01', code:'7820864', name:'半成品物料', model:'规格一', type:'物料', unit:'公斤', batch:'B20250601', qualityState:'合格', costLayer:'LAYER-TR-01', currentQty:620, availableQty:560, frozenQty:60, transferFrozenQty:500, inTransitQty:8, qty:'500', outQty:'500', inQty:'492', diffQty:'8', fromWh:'二号仓库', fromLocation:'B区-B01-01', toWh:'仓库0545', toLocation:'A区-A01-01', remark:'运输短少待确认' },
  { id:'t2', sourceLine:'DB-20251221001-02', code:'5786931', name:'半成品物料', model:'规格一', type:'物料', unit:'公斤', batch:'B20250602', qualityState:'合格', costLayer:'LAYER-TR-02', currentQty:360, availableQty:320, frozenQty:40, transferFrozenQty:300, inTransitQty:0, qty:'300', outQty:'300', inQty:'300', diffQty:'0', fromWh:'二号仓库', fromLocation:'B区-B01-02', toWh:'仓库0545', toLocation:'A区-A01-02', remark:'' },
  { id:'t3', sourceLine:'DB-20251221003-01', code:'8518691', name:'铝合金型材', model:'AL-6061', type:'原材料', unit:'KG', batch:'AL20250602', qualityState:'待检', costLayer:'LAYER-TR-03', currentQty:180, availableQty:150, frozenQty:30, transferFrozenQty:120, inTransitQty:120, qty:'120', outQty:'120', inQty:'0', diffQty:'120', fromWh:'原料仓', fromLocation:'N-02-03', toWh:'生产线边仓', toLocation:'C区-C03-05', remark:'在途未入库' },
];

function TransferListView({ onView }) {
  const [sel, setSel] = useTransferState({});
  const allChecked = TRANSFER_ROWS.every((_, i) => sel[i]);
  const someChecked = TRANSFER_ROWS.some((_, i) => sel[i]);
  const toggleAll = () => {
    if (allChecked) setSel({});
    else {
      const next = {};
      TRANSFER_ROWS.forEach((_, i) => next[i] = true);
      setSel(next);
    }
  };
  const toggleRow = (i) => setSel(s => ({...s, [i]: !s[i]}));
  return (
    <>
      <PurchaseListToolbar searchPlaceholder="全局搜索（如物料、调拨单号、仓库）" hideNew />
      <div className="aw-doc-tbl-wrap">
        <table className="aw-doc-tbl">
          <thead><tr><PurchaseSelectHeader checked={allChecked} indeterminate={someChecked} onToggle={toggleAll} /><PurchaseIndexHeader /><th><div className="aw-th-inner">调拨主题</div></th><th><div className="aw-th-inner">调拨单号</div></th><th><div className="aw-th-inner">调拨数量</div></th><th><div className="aw-th-inner">原仓库</div></th><th><div className="aw-th-inner">目标仓库</div></th><th><div className="aw-th-inner">调拨日期</div></th><th><div className="aw-th-inner">经办人</div></th><th><div className="aw-th-inner">调拨状态</div></th><th><div className="aw-th-inner">操作</div></th></tr></thead>
          <tbody>{TRANSFER_ROWS.map((r,i)=><tr key={r.code}><PurchaseSelectCell checked={!!sel[i]} onToggle={() => toggleRow(i)} /><td>{i+1}</td><td className="aw-link" onClick={() => onView(r)}>{r.subject}</td><td className="aw-num">{r.code}</td><td>{r.qty}</td><td>{r.fromWh}</td><td>{r.toWh}</td><td>{r.date}</td><td>{r.user}</td><td><span className={'aw-state aw-state-' + r.tone}>{r.state}</span></td><td><span className="aw-link" onClick={() => onView(r)}>查看</span></td></tr>)}</tbody>
        </table>
      </div>
      <PurchaseListFooter total={800} selectedCount={Object.values(sel).filter(Boolean).length} allChecked={allChecked} someChecked={someChecked} onToggleAll={toggleAll} pages={23} />
    </>
  );
}

function TransferDetailTable({ editable = false, rows, setRows }) {
  const updateRow = (id, key, value) => setRows && setRows(prev => prev.map(row => row.id === id ? {...row, [key]: value} : row));
  return (
    <div style={{overflow:'auto'}}>
      <table className="aw-table">
        <thead><tr><th>序号</th><th>来源明细</th><th>物品编码</th><th>物品名称</th><th>规格型号</th><th>类型</th><th>单位</th><th>批次</th><th>质量状态</th><th>成本层</th><th>当前库存</th><th>可调拨量</th><th>原冻结量</th><th>调拨冻结</th><th>在途数量</th><th>申请调拨</th><th>调出确认</th><th>调入确认</th><th>差异数量</th><th>原仓库</th><th>原库位</th><th>目标仓库</th><th>目标库位</th><th>备注</th>{editable && <th style={{width:70}}>操作</th>}</tr></thead>
        <tbody>
          {rows.map((row, idx) => <tr key={row.id}><td>{idx+1}</td><td>{row.sourceLine}</td><td>{row.code}</td><td>{row.name}</td><td>{row.model}</td><td>{row.type}</td><td>{row.unit}</td><td>{row.batch}</td><td><span className={'aw-state '+(row.qualityState === '合格' ? 'aw-state-g' : 'aw-state-y')}>{row.qualityState}</span></td><td>{row.costLayer}</td><td>{row.currentQty}</td><td>{row.availableQty}</td><td>{row.frozenQty}</td><td>{row.transferFrozenQty}</td><td>{row.inTransitQty}</td><td>{editable ? <Input value={row.qty} onChange={e=>updateRow(row.id,'qty',e.target.value)} /> : row.qty}</td><td>{row.outQty}</td><td>{row.inQty}</td><td style={{color:Number(row.diffQty)?'var(--aw-danger)':'inherit'}}>{row.diffQty}</td><td>{editable ? <Select value={row.fromWh} onChange={e=>updateRow(row.id,'fromWh',e.target.value)}><option>一号仓库</option><option>二号仓库</option><option>原料仓</option><option>质检暂存仓</option></Select> : row.fromWh}</td><td>{editable ? <Select value={row.fromLocation} onChange={e=>updateRow(row.id,'fromLocation',e.target.value)}><option>B区-B01-01</option><option>B区-B01-02</option><option>N-02-03</option><option>Q区-Q01-02</option></Select> : row.fromLocation}</td><td>{editable ? <Select value={row.toWh} onChange={e=>updateRow(row.id,'toWh',e.target.value)}><option>仓库0545</option><option>销售暂存仓</option><option>生产线边仓</option><option>二号仓库</option></Select> : row.toWh}</td><td>{editable ? <Select value={row.toLocation} onChange={e=>updateRow(row.id,'toLocation',e.target.value)}><option>A区-A01-01</option><option>A区-A01-02</option><option>C区-C03-05</option><option>B区-B01-01</option></Select> : row.toLocation}</td><td>{editable ? <Input value={row.remark} onChange={e=>updateRow(row.id,'remark',e.target.value)} /> : row.remark}</td>{editable && <td><span className="aw-link" style={{color:'var(--aw-danger)'}} onClick={()=>setRows(prev=>prev.filter(item=>item.id!==row.id))}>删除</span></td>}</tr>)}
          {rows.length === 0 && <tr><td colSpan={editable ? 25 : 24} style={{textAlign:'center',color:'var(--aw-fg-3)',padding:'28px 12px'}}>暂无调拨明细，点击「新增明细」选择产品</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function TransferFormView() {
  const [rows, setRows] = useTransferState(TRANSFER_PRODUCTS.slice(0, 2));
  const [picker, setPicker] = useTransferState(false);
  const [operator, setOperator] = useTransferState('');
  const addProducts = (products) => {
    setRows(prev => [...prev, ...products.map((p, idx) => ({ id:`tf-${Date.now()}-${idx}`, sourceLine:'待生成', code:p.productNo, name:p.productName, model:p.model || p.spec, type:p.categoryName, unit:p.unit, batch:'待选择批次', qualityState:'合格', costLayer:'待匹配', currentQty:0, availableQty:0, frozenQty:0, transferFrozenQty:0, inTransitQty:0, qty:'', outQty:'0', inQty:'0', diffQty:'0', fromWh:'二号仓库', fromLocation:'B区-B01-01', toWh:'仓库0545', toLocation:'A区-A01-01', remark:'' }))]);
    setPicker(false);
  };
  return (
    <PurchaseFormPage onBack={() => {}} submitText="提交调拨">
      <PurchaseSection title="基础信息">
        <div className="aw-doc-grid" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
          <Field label="调拨主题" req><Input placeholder="填写调拨主题" /></Field>
          <Field label="调拨单号"><Input placeholder="自动生成" disabled /></Field>
          <Field label="调拨日期" req><Input placeholder="请选择日期" /></Field>
          <Field label="原仓库" req><Select><option>请选择仓库</option><option>一号仓库</option><option>二号仓库</option><option>原料仓</option></Select></Field>
          <Field label="目标仓库" req><Select><option>请选择仓库</option><option>仓库0545</option><option>销售暂存仓</option><option>生产线边仓</option></Select></Field>
          <Field label="经办人" req><PersonPickerInput value={operator} onChange={setOperator} placeholder="请选择经办人" /></Field>
          <Field label="调拨部门"><Input placeholder="请选择调拨部门" /></Field>
          <Field label="调拨原因"><Input placeholder="填写调拨原因" /></Field>
          <Field label="调拨状态"><Input placeholder="自动生成" disabled /></Field>
        </div>
      </PurchaseSection>
      <PurchaseSection title="物品明细">
        <TransferDetailTable editable rows={rows} setRows={setRows} />
        <PurchaseAddDetailButton onClick={() => setPicker(true)} />
      </PurchaseSection>
      <PurchaseSection title="附件"><div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(180px,1fr))',gap:12}}><div style={{border:'1px solid var(--aw-border)',borderRadius:6,padding:14}}>新建文本文档.PDF<br/><span style={{fontSize:11,color:'var(--aw-fg-4)'}}>文件大小：0 Bytes</span></div><div style={{border:'1px dashed var(--aw-border-strong)',borderRadius:6,padding:30,textAlign:'center'}}><span className="aw-link">点击上传</span> / 拖拽到此区域</div></div></PurchaseSection>
      <PurchaseSection title="详情"><PurchaseRichText placeholder="填写调拨原因、交接要求、运输注意事项、差异处理规则等信息" /></PurchaseSection>
      {picker && <ProductPickerModal onClose={() => setPicker(false)} onConfirm={addProducts} />}
    </PurchaseFormPage>
  );
}

function TransferOrderDetailView({ data, onBack }) {
  const row = data || TRANSFER_ROWS[0];
  const [tab, setTab] = useTransferState('调拨信息');
  return (
    <div className="aw-doc-form"><div className="aw-doc-form-body">
      <DetailHeaderCard title={`202404${row.subject}`} status={row.state} onBack={onBack} detailItems={[['调拨单号', row.code], ['调拨日期', row.date], ['原仓库', row.fromWh], ['目标仓库', row.toWh], ['经办人', row.user], ['调拨数量', row.qty]]} />
      <Card><Tabs items={[{k:'调拨信息',label:'调拨信息'},{k:'操作记录',label:'操作记录'}]} active={tab} onChange={setTab} />
        {tab === '调拨信息' && <><PurchaseSection title="基础信息"><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',rowGap:16,columnGap:80,fontSize:13,marginBottom:22}}>{[['调拨主题',row.subject],['调拨单号',row.code],['调拨日期',row.date],['原仓库',row.fromWh],['目标仓库',row.toWh],['经办人',row.user],['调拨数量',row.qty],['调拨状态',row.state],['库存影响','提交后冻结可调拨量；调出确认转在途；调入确认入目标库位；差异走调整审批']].map(([k,v])=><div key={k}><span style={{color:'var(--aw-fg-3)'}}>{k}：</span>{v}</div>)}</div></PurchaseSection><PurchaseSection title="物品明细"><TransferDetailTable rows={TRANSFER_PRODUCTS} /></PurchaseSection><PurchaseSection title="差异处理"><table className="aw-table"><thead><tr><th>序号</th><th>来源明细</th><th>差异类型</th><th>差异数量</th><th>冻结/在途处理</th><th>处理方式</th><th>责任人</th><th>状态</th></tr></thead><tbody><tr><td>1</td><td>DB-20251221001-01</td><td>运输短少</td><td>8</td><td>保留在途并冻结差异</td><td>调拨差异调整单</td><td>李文涛</td><td><span className="aw-state aw-state-y">待审批</span></td></tr></tbody></table></PurchaseSection><PurchaseSection title="附件"><div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(180px,1fr))',gap:12}}>{[1,2,3].map(i=><div key={i} style={{border:'1px dashed var(--aw-border-strong)',borderRadius:6,padding:'12px 14px',background:'#fff'}}><div style={{fontSize:13,fontWeight:500,marginBottom:6}}>新建文本文档.PDF</div><div style={{fontSize:11,color:'var(--aw-fg-4)'}}>文件大小：0 Bytes</div><div style={{display:'flex',gap:14,marginTop:14,fontSize:12}}><span className="aw-link">查看</span><span className="aw-link">下载</span></div></div>)}</div></PurchaseSection></>}
        {tab === '操作记录' && <PurchaseSection title="操作记录"><table className="aw-table"><thead><tr><th>序号</th><th>操作时间</th><th>操作人</th><th>操作类型</th><th>说明</th></tr></thead><tbody><tr><td>1</td><td>2024-06-07 19:49:12</td><td>XXX</td><td>创建</td><td>创建调拨单</td></tr><tr><td>2</td><td>2024-06-08 09:18:22</td><td>仓库管理员</td><td>确认</td><td>确认调拨物料和库位</td></tr></tbody></table></PurchaseSection>}
      </Card>
    </div></div>
  );
}

function TransferDetailListView() {
  return (
    <>
      <PurchaseListToolbar searchPlaceholder="全局搜索（如物料名称、物料编码、仓库）" hideNew />
      <Card title="调拨明细表">
        <table className="aw-table"><thead><tr><th>序号</th><th>来源明细</th><th>物料名称</th><th>物料编码</th><th>批次</th><th>质量状态</th><th>单位</th><th>调拨数量</th><th>调拨冻结</th><th>在途数量</th><th>调入数量</th><th>原仓库</th><th>目标仓库</th><th>调拨日期</th></tr></thead><tbody>{TRANSFER_PRODUCTS.map((r,i)=><tr key={r.id}><td>{i+1}</td><td>{r.sourceLine}</td><td>{r.name}</td><td>{r.code}</td><td>{r.batch}</td><td>{r.qualityState}</td><td>{r.unit}</td><td>{r.qty}</td><td>{r.transferFrozenQty}</td><td>{r.inTransitQty}</td><td>{r.inQty}</td><td>{r.fromWh}</td><td>{r.toWh}</td><td>2025-12-21</td></tr>)}</tbody></table>
      </Card>
    </>
  );
}

function WarehouseTransferScreen({ initialAction, onActionConsumed }) {
  const actionMap = { '新增调拨':'new', '调拨列表':'list', '调拨明细表':'detail', 'new':'new' };
  const [mode, setMode] = useTransferState(actionMap[initialAction] || 'list');
  const [detail, setDetail] = useTransferState(null);
  useTransferEffect(() => {
    if (initialAction && actionMap[initialAction]) { setMode(actionMap[initialAction]); setDetail(null); onActionConsumed && onActionConsumed(); }
  }, [initialAction]);
  return <div>{detail && <TransferOrderDetailView data={detail} onBack={() => setDetail(null)} />}{!detail && mode === 'new' && <TransferFormView />}{!detail && mode === 'list' && <TransferListView onView={setDetail} />}{!detail && mode === 'detail' && <TransferDetailListView />}</div>;
}

window.WarehouseTransferScreen = WarehouseTransferScreen;
