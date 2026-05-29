// ui_kits/erp-console/warehouse-inventory-list.jsx
// 仓储中心 — 盘点管理
const { useState: useInventoryState, useEffect: useInventoryEffect } = React;

const INVENTORY_ROWS = [
  { subject:'A仓季度盘点', code:'PD-20251221001', wh:'A仓库', scope:'物品 等5项', lockScope:'A仓库/A区/指定批次', locked:'是', lockQty:240, date:'2025-12-21', user:'傲为', state:'未开始', tone:'gray' },
  { subject:'原料仓月度盘点', code:'PD-20251221002', wh:'原料仓', scope:'全部', lockScope:'原料仓/全部库位', locked:'是', lockQty:1280, date:'2025-12-20', user:'李文涛', state:'盘点中', tone:'b' },
  { subject:'生产线边仓抽盘', code:'PD-20251221003', wh:'生产线边仓', scope:'半成品 12项', lockScope:'不锁库，仅记录差异', locked:'否', lockQty:0, date:'2025-12-19', user:'陈思源', state:'复盘中', tone:'y' },
  { subject:'质检暂存仓复盘', code:'PD-20251221004', wh:'质检暂存仓', scope:'异常物料', lockScope:'质检暂存仓/待检批次', locked:'是', lockQty:80, date:'2025-12-18', user:'赵强', state:'差异待调整', tone:'y' },
];

const INVENTORY_PRODUCTS = [
  { id:'p1', sourceLine:'PD-20251221001-01', code:'7820864', name:'半成品物料', model:'规格一', type:'物料', unit:'公斤', batch:'B20250601', qualityState:'合格', costLayer:'LAYER-IV-01', lockedQty:60, bookQty:60, realQty:'', recheckQty:'', diffQty:'', adjustNo:'', adjustStatus:'未生成', reason:'', dispose:'无需处理', result:'正常', location:'A区-A01-01', remark:'' },
  { id:'p2', sourceLine:'PD-20251221001-02', code:'5786931', name:'半成品物料', model:'规格一', type:'物料', unit:'公斤', batch:'B20250602', qualityState:'合格', costLayer:'LAYER-IV-02', lockedQty:60, bookQty:60, realQty:'', recheckQty:'', diffQty:'', adjustNo:'', adjustStatus:'未生成', reason:'', dispose:'无需处理', result:'正常', location:'A区-A01-02', remark:'' },
  { id:'p3', sourceLine:'PD-20251221001-03', code:'8518691', name:'半成品物料', model:'规格一', type:'物料', unit:'公斤', batch:'B20250603', qualityState:'待检', costLayer:'LAYER-IV-03', lockedQty:60, bookQty:60, realQty:'', recheckQty:'', diffQty:'', adjustNo:'', adjustStatus:'未生成', reason:'', dispose:'无需处理', result:'正常', location:'B区-B02-01', remark:'' },
  { id:'p4', sourceLine:'PD-20251221001-04', code:'6576642', name:'半成品物料', model:'规格一', type:'物料', unit:'公斤', batch:'B20250604', qualityState:'冻结', costLayer:'LAYER-IV-04', lockedQty:60, bookQty:60, realQty:'', recheckQty:'', diffQty:'', adjustNo:'', adjustStatus:'未生成', reason:'', dispose:'无需处理', result:'正常', location:'N-02-03', remark:'' },
];

const INVENTORY_PLANS = [
  { title:'2026 Q1 成品仓全量盘点', wh:'一号仓库、二号仓库', scope:'成品、半成品', lock:'锁定盘点范围库存', cycle:'季度', owner:'王仓', progress:'待生成盘点单' },
  { title:'原材料批次抽盘计划', wh:'原料仓', scope:'原材料 / 最近30天入库批次', lock:'锁定命中批次库存', cycle:'月度', owner:'李库', progress:'执行中 45%' },
  { title:'临期与冻结物料复盘', wh:'质检暂存仓', scope:'冻结库存、临期库存', lock:'仅锁定异常库存', cycle:'临时', owner:'陈仓', progress:'已完成' },
];

function InventoryProductTable({ rows, setRows, editable = false }) {
  const updateRow = (id, key, value) => setRows && setRows(prev => prev.map(row => {
    if (row.id !== id) return row;
    const next = {...row, [key]: value};
    if (key === 'realQty') {
      const diff = Number(value || 0) - Number(row.bookQty || 0);
      next.diffQty = Number.isFinite(diff) ? String(diff) : '';
      next.result = diff > 0 ? '盘盈' : diff < 0 ? '盘亏' : '正常';
    }
    return next;
  }));
  return (
    <div style={{overflow:'auto'}}>
      <table className="aw-table">
        <thead><tr><th>序号</th><th>来源明细</th><th>物品编码</th><th>物品名称</th><th>规格型号</th><th>类型</th><th>单位</th><th>批次</th><th>库位</th><th>质量状态</th><th>成本层</th><th>锁库数量</th><th>账面数量</th><th>实盘数量</th><th>复盘数量</th><th>盈亏数量</th><th>差异原因</th><th>处理方式</th><th>调整单号</th><th>调整状态</th><th>盘点结果</th><th>备注</th>{editable && <th style={{width:70}}>操作</th>}</tr></thead>
        <tbody>
          {rows.map((row, idx) => <tr key={row.id}><td>{idx+1}</td><td>{row.sourceLine}</td><td>{row.code}</td><td>{row.name}</td><td>{row.model}</td><td>{row.type}</td><td>{row.unit}</td><td>{row.batch}</td><td>{row.location}</td><td><span className={'aw-state '+(row.qualityState === '合格' ? 'aw-state-g' : 'aw-state-y')}>{row.qualityState}</span></td><td>{row.costLayer}</td><td>{row.lockedQty}</td><td>{row.bookQty}</td><td>{editable ? <Input value={row.realQty} onChange={e=>updateRow(row.id,'realQty',e.target.value)} /> : row.realQty || row.bookQty}</td><td>{editable ? <Input value={row.recheckQty} onChange={e=>updateRow(row.id,'recheckQty',e.target.value)} /> : row.recheckQty || row.realQty || row.bookQty}</td><td>{row.diffQty || 0}</td><td>{editable ? <Select value={row.reason} onChange={e=>updateRow(row.id,'reason',e.target.value)}><option>请选择</option><option>收发未过账</option><option>仓位错放</option><option>损耗报废</option><option>录入差错</option></Select> : row.reason || '-'}</td><td>{editable ? <Select value={row.dispose} onChange={e=>updateRow(row.id,'dispose',e.target.value)}><option>无需处理</option><option>生成盘盈入库</option><option>生成盘亏出库</option><option>提交差异审批</option></Select> : row.dispose}</td><td>{row.adjustNo || '-'}</td><td><span className={'aw-state ' + (row.adjustStatus === '已过账' ? 'aw-state-g' : 'aw-state-y')}>{row.adjustStatus || '未生成'}</span></td><td><span className={'aw-state ' + (row.result === '正常' ? 'aw-state-g' : 'aw-state-y')}>{row.result}</span></td><td>{editable ? <Input value={row.remark} onChange={e=>updateRow(row.id,'remark',e.target.value)} /> : row.remark}</td>{editable && <td><span className="aw-link" style={{color:'var(--aw-danger)'}} onClick={()=>setRows(prev=>prev.filter(item=>item.id!==row.id))}>删除</span></td>}</tr>)}
        </tbody>
      </table>
    </div>
  );
}

function DirectInventoryView() {
  const [rows, setRows] = useInventoryState(INVENTORY_PRODUCTS);
  const [picker, setPicker] = useInventoryState(false);
  const [checker, setChecker] = useInventoryState('');
  const addProducts = (products) => {
    setRows(prev => [...prev, ...products.map((p, idx) => ({ id:`iv-${Date.now()}-${idx}`, sourceLine:'待生成', code:p.productNo, name:p.productName, model:p.model || p.spec, type:p.categoryName, unit:p.unit, batch:'待选择批次', qualityState:'合格', costLayer:'待匹配', lockedQty:0, bookQty:0, realQty:'', recheckQty:'', diffQty:'', adjustNo:'', adjustStatus:'未生成', reason:'', dispose:'无需处理', result:'正常', location:'待选择库位', remark:'' }))]);
    setPicker(false);
  };
  return (
    <PurchaseFormPage onBack={() => {}} submitText="确认盘点">
      <PurchaseSection title="基础信息">
        <div className="aw-doc-grid" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
          <Field label="盘点主题" req><Input placeholder="填写盘点主题" /></Field>
          <Field label="盘点编号"><Input placeholder="自动生成" disabled /></Field>
          <Field label="盘点仓库" req><Select><option>请选择仓库</option><option>A仓库</option><option>原料仓</option><option>质检暂存仓</option></Select></Field>
          <Field label="盘点范围" req><Select><option>指定物品</option><option>全部库存</option><option>指定分类</option><option>指定库位</option></Select></Field>
          <Field label="是否锁库" req><Select><option>否</option><option>是</option></Select></Field>
          <Field label="盘点人" req><PersonPickerInput value={checker} onChange={setChecker} placeholder="请选择盘点人" /></Field>
          <Field label="盘点日期" req><Input placeholder="请选择日期" /></Field>
          <Field label="盘点部门"><Input placeholder="请选择部门" /></Field>
          <Field label="盘点状态"><Input placeholder="自动生成" disabled /></Field>
        </div>
      </PurchaseSection>
      <PurchaseSection title="物品明细">
        <InventoryProductTable rows={rows} setRows={setRows} editable />
        <PurchaseAddDetailButton onClick={() => setPicker(true)} />
      </PurchaseSection>
      <PurchaseSection title="附件"><div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(180px,1fr))',gap:12}}><div style={{border:'1px solid var(--aw-border)',borderRadius:6,padding:14}}>新建文本文档.PDF<br/><span style={{fontSize:11,color:'var(--aw-fg-4)'}}>文件大小：0 Bytes</span></div><div style={{border:'1px dashed var(--aw-border-strong)',borderRadius:6,padding:30,textAlign:'center'}}><span className="aw-link">点击上传</span> / 拖拽到此区域</div></div></PurchaseSection>
      <PurchaseSection title="详情"><PurchaseRichText placeholder="填写盘点说明、范围依据、锁库策略、差异处理要求等信息" /></PurchaseSection>
      {picker && <ProductPickerModal onClose={() => setPicker(false)} onConfirm={addProducts} />}
    </PurchaseFormPage>
  );
}

function InventoryPlanView() {
  const [planOwner, setPlanOwner] = useInventoryState('');
  return (
    <>
      <Card title="盘点计划">
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:12}}>
          {INVENTORY_PLANS.map((plan, idx) => <div key={plan.title} style={{border:'1px solid var(--aw-border)',borderRadius:6,background:'#fff',padding:14}}><div style={{fontWeight:600,marginBottom:10}}>{plan.title}</div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 14px',fontSize:13}}><div><span style={{color:'var(--aw-fg-3)'}}>序号：</span>{idx+1}</div><div><span style={{color:'var(--aw-fg-3)'}}>周期：</span>{plan.cycle}</div><div><span style={{color:'var(--aw-fg-3)'}}>仓库：</span>{plan.wh}</div><div><span style={{color:'var(--aw-fg-3)'}}>负责人：</span>{plan.owner}</div><div style={{gridColumn:'1 / 3'}}><span style={{color:'var(--aw-fg-3)'}}>范围：</span>{plan.scope}</div><div style={{gridColumn:'1 / 3'}}><span style={{color:'var(--aw-fg-3)'}}>锁库策略：</span>{plan.lock}</div><div><span style={{color:'var(--aw-fg-3)'}}>进度：</span>{plan.progress}</div></div><div style={{display:'flex',gap:8,marginTop:12}}><Btn>生成盘点单</Btn><Btn>查看</Btn></div></div>)}
        </div>
      </Card>
      <Card title="新建盘点计划">
        <div className="aw-doc-grid" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
          <Field label="计划名称" req><Input placeholder="填写盘点计划名称" /></Field>
          <Field label="盘点周期" req><Select><option>月度</option><option>季度</option><option>年度</option><option>临时</option></Select></Field>
          <Field label="计划负责人" req><PersonPickerInput value={planOwner} onChange={setPlanOwner} placeholder="请选择负责人" /></Field>
          <Field label="盘点仓库" req><Select><option>全部仓库</option><option>A仓库</option><option>原料仓</option><option>质检暂存仓</option></Select></Field>
          <Field label="盘点范围" req><Select><option>全部库存</option><option>指定分类</option><option>指定物料</option><option>指定库位</option><option>异常库存</option></Select></Field>
          <Field label="锁库方式" req><Select><option>生成盘点单时锁库</option><option>计划审批后锁库</option><option>不锁库</option></Select></Field>
          <Field label="开始日期"><Input placeholder="请选择日期" /></Field>
          <Field label="结束日期"><Input placeholder="请选择日期" /></Field>
          <Field label="生成方式"><Select><option>按仓库生成</option><option>按库位生成</option><option>按负责人生成</option></Select></Field>
        </div>
        <div style={{fontSize:12,color:'var(--aw-fg-3)',marginTop:12}}>盘点计划用于规范盘点流程：按计划生成盘点单后，可锁定库存范围，避免在盘点期间进行出入库操作。</div>
      </Card>
    </>
  );
}

function InventoryListView({ onView }) {
  const [sel, setSel] = useInventoryState({});
  const allChecked = INVENTORY_ROWS.every((_, i) => sel[i]);
  const someChecked = INVENTORY_ROWS.some((_, i) => sel[i]);
  const toggleAll = () => {
    if (allChecked) setSel({});
    else {
      const next = {};
      INVENTORY_ROWS.forEach((_, i) => next[i] = true);
      setSel(next);
    }
  };
  const toggleRow = (i) => setSel(s => ({...s, [i]: !s[i]}));
  return (
    <>
      <PurchaseListToolbar searchPlaceholder="全局搜索（如盘点主题、产品名称、工单编号…）" hideNew />
      <div className="aw-doc-tbl-wrap"><table className="aw-doc-tbl"><thead><tr><PurchaseSelectHeader checked={allChecked} indeterminate={someChecked} onToggle={toggleAll} /><PurchaseIndexHeader /><th><div className="aw-th-inner">盘点主题</div></th><th><div className="aw-th-inner">盘点编号</div></th><th><div className="aw-th-inner">盘点仓库</div></th><th><div className="aw-th-inner">盘点范围</div></th><th><div className="aw-th-inner">锁库范围</div></th><th><div className="aw-th-inner">是否锁库</div></th><th><div className="aw-th-inner">锁库数量</div></th><th><div className="aw-th-inner">盘点日期</div></th><th><div className="aw-th-inner">盘点人</div></th><th><div className="aw-th-inner">盘点状态</div></th><th><div className="aw-th-inner">操作</div></th></tr></thead><tbody>{INVENTORY_ROWS.map((r,i)=><tr key={r.code}><PurchaseSelectCell checked={!!sel[i]} onToggle={() => toggleRow(i)} /><td>{i+1}</td><td className="aw-link" onClick={()=>onView(r)}>{r.subject}</td><td className="aw-num">{r.code}</td><td>{r.wh}</td><td>{r.scope}</td><td>{r.lockScope}</td><td>{r.locked}</td><td>{r.lockQty}</td><td>{r.date}</td><td>{r.user}</td><td><span className={'aw-state aw-state-' + r.tone}>{r.state}</span></td><td><span className="aw-link" onClick={()=>onView(r)}>查看</span></td></tr>)}</tbody></table></div>
      <PurchaseListFooter total={800} selectedCount={Object.values(sel).filter(Boolean).length} allChecked={allChecked} someChecked={someChecked} onToggleAll={toggleAll} pages={23} />
    </>
  );
}

function InventoryDetailView({ data, onBack }) {
  const row = data || INVENTORY_ROWS[0];
  const [tab, setTab] = useInventoryState('盘点信息');
  return (
    <div className="aw-doc-form"><div className="aw-doc-form-body">
      <DetailHeaderCard title={`202404${row.subject}`} status={row.state} onBack={onBack} detailItems={[['盘点编号', row.code], ['盘点仓库', row.wh], ['盘点范围', row.scope], ['是否锁库', row.locked], ['盘点日期', row.date], ['盘点人', row.user]]} />
      <Card><Tabs items={[{k:'盘点信息',label:'盘点信息'},{k:'操作记录',label:'操作记录'}]} active={tab} onChange={setTab} />
        {tab === '盘点信息' && <><PurchaseSection title="基础信息"><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',rowGap:16,columnGap:80,fontSize:13,marginBottom:22}}>{[['盘点主题',row.subject],['盘点编号',row.code],['盘点仓库',row.wh],['盘点范围',row.scope],['锁库范围',row.lockScope],['锁库数量',row.lockQty],['是否锁库',row.locked],['盘点日期',row.date],['盘点人',row.user],['盘点状态',row.state],['锁库说明',row.locked === '是' ? '命中仓库/库位/批次禁止出入库，差异调整过账后释放' : '不锁库，仅记录差异']].map(([k,v])=><div key={k}><span style={{color:'var(--aw-fg-3)'}}>{k}：</span>{v}</div>)}</div></PurchaseSection><PurchaseSection title="物品明细"><InventoryProductTable rows={INVENTORY_PRODUCTS.map((p,i)=>({...p, realQty:p.realQty || (i===0?58:p.bookQty), recheckQty:p.recheckQty || (i===0?58:p.bookQty), diffQty:i===0?'-2':'0', adjustNo:i===0?'TZ-20251221001':'', adjustStatus:i===0?'待审批':'未生成', reason:i===0?'仓位错放':'', dispose:i===0?'提交差异审批':'无需处理', result:i===0?'盘亏':'正常'}))} /></PurchaseSection><PurchaseSection title="差异调整"><table className="aw-table"><thead><tr><th>序号</th><th>来源明细</th><th>调整单号</th><th>差异类型</th><th>差异数量</th><th>成本层</th><th>处理方式</th><th>审批状态</th><th>过账结果</th><th>库存释放</th></tr></thead><tbody><tr><td>1</td><td>PD-20251221001-01</td><td>TZ-20251221001</td><td>盘亏</td><td>2</td><td>LAYER-IV-01</td><td>盘亏出库</td><td><span className="aw-state aw-state-y">待审批</span></td><td>审批后生成盘亏出库流水</td><td>差异过账后释放锁库</td></tr></tbody></table></PurchaseSection><PurchaseSection title="附件"><div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(180px,1fr))',gap:12}}>{[1,2,3].map(i=><div key={i} style={{border:'1px dashed var(--aw-border-strong)',borderRadius:6,padding:'12px 14px',background:'#fff'}}><div style={{fontSize:13,fontWeight:500,marginBottom:6}}>新建文本文档.PDF</div><div style={{fontSize:11,color:'var(--aw-fg-4)'}}>文件大小：0 Bytes</div><div style={{display:'flex',gap:14,marginTop:14,fontSize:12}}><span className="aw-link">查看</span><span className="aw-link">下载</span></div></div>)}</div></PurchaseSection></>}
        {tab === '操作记录' && <PurchaseSection title="操作记录"><table className="aw-table"><thead><tr><th>序号</th><th>操作时间</th><th>操作人</th><th>操作类型</th><th>说明</th></tr></thead><tbody><tr><td>1</td><td>2024-06-07 19:49:12</td><td>XXX</td><td>创建</td><td>创建盘点单</td></tr><tr><td>2</td><td>2024-06-08 09:18:22</td><td>仓库管理员</td><td>盘点</td><td>录入实盘数量并生成差异</td></tr></tbody></table></PurchaseSection>}
      </Card>
    </div></div>
  );
}

function WarehouseInventoryScreen({ initialAction, onActionConsumed }) {
  const actionMap = { '直接盘点':'direct', '盘点计划':'plan', '所有盘点单':'list', 'new':'direct' };
  const [mode, setMode] = useInventoryState(actionMap[initialAction] || 'list');
  const [detail, setDetail] = useInventoryState(null);
  useInventoryEffect(() => {
    if (initialAction && actionMap[initialAction]) { setMode(actionMap[initialAction]); setDetail(null); onActionConsumed && onActionConsumed(); }
  }, [initialAction]);
  return <div>{detail && <InventoryDetailView data={detail} onBack={() => setDetail(null)} />}{!detail && mode === 'direct' && <DirectInventoryView />}{!detail && mode === 'plan' && <InventoryPlanView />}{!detail && mode === 'list' && <InventoryListView onView={setDetail} />}</div>;
}

window.WarehouseInventoryScreen = WarehouseInventoryScreen;
