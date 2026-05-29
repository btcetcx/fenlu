// ui_kits/erp-console/pr-list.jsx
// 请购管理 — 列表 / 添加 / 详情 三态
const { useState: usePrState, useEffect: usePrEffect } = React;

function PrToolbar({ onNew }) {
  return (
    <PurchaseListToolbar
      searchPlaceholder="全局搜索（如请购主题、编号、关联单据）"
      newLabel="新增请购"
      onNew={onNew}
    />
  );
}

const PR_ROWS = [
  { topic:'20240请购购物料00232', code:'PR-2026-00232', ref:'项目一', source:'项目请购', starter:'张四', phone:'13800138001', date:'2026-06-07', printState:'已打印', state:'已转采购', tone:'g' },
  { topic:'电气元件补料申请', code:'PR-2026-00231', ref:'WO-260607-015', source:'生产缺料', starter:'李文涛', phone:'13900139002', date:'2026-06-06', state:'审批中', tone:'b' },
  { topic:'研发样机试制材料', code:'PR-2026-00230', ref:'PRJ-2026-017', source:'研发项目', starter:'陈思源', phone:'13700137003', date:'2026-06-05', state:'待提交', tone:'y' },
  { topic:'包装材料月度请购', code:'PR-2026-00229', ref:'PLAN-2026-06', source:'库存补货', starter:'赵强', phone:'13600136004', date:'2026-06-04', state:'已完成', tone:'g' },
  { topic:'铝合金型材比价请购', code:'PR-2026-00228', ref:'PROD-PLAN-06', source:'生产缺料', starter:'王敏', phone:'13500135008', date:'2026-06-03', state:'待询价', tone:'y' },
  { topic:'精密轴承补充采购', code:'PR-2026-00227', ref:'MRP-202606-009', source:'MRP建议', starter:'系统', phone:'-', date:'2026-06-02', state:'已转询价', tone:'b' },
];

const PR_DETAIL_ROWS = [
  { sourceLine:'PR-2026-00232-01', code:'7820864', name:'半成品物料', spec:'规格一', unit:'KG', qty:500, price:'50.00', amount:'25000.00', bought:250, wait:250, supplier:'海南傲为', forceQuote:'否', skipReason:'已有有效报价', date:'2024-12-23', usage:'用于生产' },
  { sourceLine:'PR-2026-00232-02', code:'5786931', name:'半成品物料', spec:'规格一', unit:'KG', qty:500, price:'50.00', amount:'25000.00', bought:250, wait:250, supplier:'海南傲为', forceQuote:'是', skipReason:'-', date:'2024-12-23', usage:'用于生产' },
  { sourceLine:'PR-2026-00232-03', code:'8518691', name:'铝合金型材', spec:'AL-6061', unit:'KG', qty:500, price:'32.00', amount:'16000.00', bought:0, wait:500, supplier:'华南铝材', forceQuote:'是', skipReason:'-', date:'2024-12-23', usage:'用于生产' },
  { sourceLine:'PR-2026-00232-04', code:'6576642', name:'精密轴承', spec:'BR-6205', unit:'个', qty:500, price:'18.00', amount:'9000.00', bought:0, wait:500, supplier:'深圳精密轴承', forceQuote:'否', skipReason:'低金额快速采购', date:'2024-12-23', usage:'设备维修' },
  { sourceLine:'PR-2026-00232-05', code:'6081578', name:'外箱包装', spec:'PK-500', unit:'个', qty:500, price:'4.50', amount:'2250.00', bought:250, wait:250, supplier:'海南包装材料', forceQuote:'否', skipReason:'长期协议价', date:'2024-12-23', usage:'包装出货' },
];

function PrFixedSummaryBar({ items }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:28, padding:'10px 12px', borderTop:'1px solid var(--aw-border)', background:'#fff', fontSize:13 }}>
      <span>合计</span>
      {items.map(([label, value]) => (
        <span key={label}>{label}：<b style={{ color:'var(--aw-danger)' }}>{value}</b></span>
      ))}
    </div>
  );
}

const PR_PURCHASE_SUPPLIERS = [
  { id:'s1', name:'海南傲为', level:'A', contact:'夏经理', phone:'13800138000' },
  { id:'s2', name:'华南铝材', level:'A', contact:'陈经理', phone:'13500001111' },
  { id:'s3', name:'深圳精密轴承', level:'A', contact:'周经理', phone:'13500002222' },
  { id:'s4', name:'海南包装材料', level:'B', contact:'林经理', phone:'13500003333' },
];

function PrSupplierEditField({ value, onEdit }) {
  return (
    <div style={{display:'flex',alignItems:'center',height:32,border:'1px solid var(--aw-border-strong)',background:'#fff'}}>
      <input
        value={value || ''}
        readOnly
        placeholder="请选择供应商"
        style={{flex:1,minWidth:0,border:0,outline:'none',padding:'0 8px',height:'100%',font:'inherit',fontSize:13,background:'transparent'}}
      />
      <button
        type="button"
        title="更换供应商"
        onClick={onEdit}
        style={{width:32,height:30,border:0,borderLeft:'1px solid var(--aw-divider)',background:'#fff',cursor:'pointer',color:'var(--aw-primary)',fontSize:14}}
      >✎</button>
    </div>
  );
}

function PrSupplierReasonModal({ supplierName, onClose, onConfirm }) {
  const [reason, setReason] = usePrState('');
  return (
    <div className="aw-modal-mask" style={{position:'fixed',inset:0,zIndex:1200,display:'flex',alignItems:'center',justifyContent:'center',padding:'28px',background:'rgba(15,23,42,.28)'}} onClick={onClose}>
      <div className="aw-modal" style={{width:'min(520px,92vw)'}} onClick={e => e.stopPropagation()}>
        <div className="head">
          <span>更换供应商提醒</span>
          <span style={{cursor:'pointer',color:'var(--aw-fg-4)'}} onClick={onClose}>✕</span>
        </div>
        <div className="body">
          <div style={{fontSize:13,lineHeight:1.7,color:'var(--aw-fg-2)',marginBottom:14}}>
            当前供应商：<b style={{color:'var(--aw-fg-1)'}}>{supplierName || '未选择'}</b>。更换供应商会触发审核流程，请填写更换理由后继续选择新的供应商。
          </div>
          <Field label="更换理由" req>
            <textarea
              className="aw-input"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="请输入更换供应商的原因"
              style={{height:86,resize:'vertical',padding:'8px 10px'}}
            />
          </Field>
        </div>
        <div className="foot">
          <Btn onClick={onClose}>取消</Btn>
          <Btn kind="primary" onClick={() => reason.trim() && onConfirm(reason.trim())}>确定</Btn>
        </div>
      </div>
    </div>
  );
}

function PrSupplierSelectModal({ onClose, onConfirm }) {
  const [selectedId, setSelectedId] = usePrState(PR_PURCHASE_SUPPLIERS[0].id);
  const selected = PR_PURCHASE_SUPPLIERS.find(s => s.id === selectedId);
  return (
    <div className="aw-modal-mask" style={{position:'fixed',inset:0,zIndex:1210,display:'flex',alignItems:'center',justifyContent:'center',padding:'28px',background:'rgba(15,23,42,.28)'}} onClick={onClose}>
      <div className="aw-modal" style={{width:'min(760px,94vw)',maxHeight:'82vh'}} onClick={e => e.stopPropagation()}>
        <div className="head">
          <span>选择供应商</span>
          <span style={{cursor:'pointer',color:'var(--aw-fg-4)'}} onClick={onClose}>✕</span>
        </div>
        <div className="body" style={{padding:0}}>
          <div className="aw-doc-tbl-inner" style={{maxHeight:420}}>
            <table className="aw-doc-tbl">
              <thead>
                <tr>
                  <th style={{width:46}}></th>
                  <th><div className="aw-th-inner">供应商名称</div></th>
                  <th style={{width:90}}><div className="aw-th-inner">等级</div></th>
                  <th style={{width:110}}><div className="aw-th-inner">联系人</div></th>
                  <th style={{width:140}}><div className="aw-th-inner">联系电话</div></th>
                </tr>
              </thead>
              <tbody>
                {PR_PURCHASE_SUPPLIERS.map(s => (
                  <tr key={s.id} onClick={() => setSelectedId(s.id)} style={{cursor:'pointer',background:selectedId === s.id ? 'var(--aw-primary-soft)' : undefined}}>
                    <td style={{textAlign:'center',background:selectedId === s.id ? 'var(--aw-primary-soft)' : undefined}}><input type="radio" checked={selectedId === s.id} onChange={() => setSelectedId(s.id)} /></td>
                    <td className="aw-link">{s.name}</td>
                    <td>{s.level}</td>
                    <td>{s.contact}</td>
                    <td className="aw-num">{s.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="foot">
          <Btn onClick={onClose}>取消</Btn>
          <Btn kind="primary" onClick={() => selected && onConfirm(selected)}>确定</Btn>
        </div>
      </div>
    </div>
  );
}

function PrListView({ onNew, onView }) {
  const [sel, setSel] = usePrState({});
  const [statusFilter, setStatusFilter] = usePrState('');
  const rows = statusFilter ? PR_ROWS.filter(r => r.state === statusFilter) : PR_ROWS;
  const allChecked = rows.length > 0 && rows.every((_, i) => sel[i]);
  const someChecked = rows.some((_, i) => sel[i]);
  const toggleAll = () => {
    if (allChecked) setSel({});
    else {
      const n = {};
      rows.forEach((_, i) => n[i] = true);
      setSel(n);
    }
  };
  const toggleRow = (i) => setSel(s => ({ ...s, [i]: !s[i] }));

  return (
    <>
      <PrToolbar onNew={onNew} />
      <div className="aw-doc-tbl-wrap">
        <div className="aw-doc-tbl-inner">
          <table className="aw-doc-tbl">
            <thead>
              <tr>
                <PurchaseSelectHeader checked={allChecked} indeterminate={someChecked} onToggle={toggleAll} />
                <PurchaseIndexHeader />
                <th style={{width:190}}><div className="aw-th-inner">请购主题</div></th>
                <th style={{width:150}}><div className="aw-th-inner">请购编号</div></th>
                <th style={{width:150}}><div className="aw-th-inner">关联单据</div></th>
                <th style={{width:130}}><div className="aw-th-inner">请购来源</div></th>
                <th style={{width:110}}><div className="aw-th-inner">发起人</div></th>
                <th style={{width:140}}><div className="aw-th-inner">联系方式</div></th>
                <th style={{width:120}}><div className="aw-th-inner">申请日期</div></th>
                <th style={{width:100}}><div className="aw-th-inner">打印状态</div></th>
                <PurchaseStatusFilterHeader label="流程状态" value={statusFilter} onChange={setStatusFilter} options={['待提交','审批中','已批准','待询价','已转询价','待采购','已转采购','部分采购','已完成','已关闭','已驳回']} />
                <th style={{width:90}}><div className="aw-th-inner">操作</div></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.code} onClick={() => onView(r)} style={{cursor:'pointer'}}>
                  <PurchaseSelectCell checked={!!sel[i]} onToggle={() => toggleRow(i)} />
                  <td className="aw-num">{i + 1}</td>
                  <td className="aw-link">{r.topic}</td>
                  <td className="aw-num">{r.code}</td>
                  <td>{r.ref}</td>
                  <td>{r.source}</td>
                  <td>{r.starter}</td>
                  <td className="aw-num">{r.phone}</td>
                  <td className="aw-num">{r.date}</td>
                  <td>{r.printState || '未打印'}</td>
                  <td><span className={'aw-state aw-state-' + r.tone}>{r.state}</span></td>
                  <td><span className="aw-link" onClick={e => { e.stopPropagation(); onView(r); }}>查看</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <PurchaseListFooter
        total={PR_ROWS.length}
        selectedCount={Object.values(sel).filter(Boolean).length}
        allChecked={allChecked}
        someChecked={someChecked}
        onToggleAll={toggleAll}
        pages={5}
      />
    </>
  );
}

function PrNewView({ onBack }) {
  const [detailRows, setDetailRows] = usePrState([]);
  const [showProductPicker, setShowProductPicker] = usePrState(false);
  const [supplierPickerTarget, setSupplierPickerTarget] = usePrState(null);
  const handlePickProducts = (products) => {
    setDetailRows(rows => [
      ...rows,
      ...products.map((p, idx) => ({
        id: `${Date.now()}-${idx}`,
        productName: p.productName,
        productNo: p.productNo,
        model: p.model || p.spec,
        categoryName: p.categoryName,
        unit: p.unit,
        supplier: p.supplier,
      }))
    ]);
    setShowProductPicker(false);
  };
  const removeDetail = (id) => setDetailRows(rows => rows.filter(row => row.id !== id));
  const pickSupplier = supplier => {
    setDetailRows(rows => rows.map(row => row.id === supplierPickerTarget ? { ...row, supplier: supplier.name } : row));
    setSupplierPickerTarget(null);
  };

  return (
    <PurchaseFormPage onBack={onBack}>
        <PurchaseSection title="基础信息">
          <div className="aw-doc-grid" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
            <Field label="请购主题" req><Input placeholder="填写请购主题" /></Field>
            <Field label="请购编号"><Input defaultValue="自动生成" disabled /></Field>
            <Field label="请购来源" req><Select><option>请选择</option><option>项目请购</option><option>生产缺料</option><option>库存补货</option><option>研发试制</option></Select></Field>
            <Field label="关联单据"><Input placeholder="填写或选择关联单据" /></Field>
            <Field label="请购日期" req><Input defaultValue="自动" /></Field>
            <Field label="需求日期"><Input placeholder="请选择" /></Field>
            <Field label={<span>流程状态<HelpTip text="新建请购默认待提交；审批中、已批准、待询价、已转询价、已转采购、部分采购和关闭由审批、转询价、转采购等动作推进。" /></span>}><Input value="待提交" readOnly /></Field>
          </div>
        </PurchaseSection>

        <PurchaseSection title="请购明细">
          <PurchaseDetailTable
            rows={detailRows}
            emptyText="暂无请购明细，点击「新增明细」选择产品"
            columns={[
              {k:'image',label:'图片',w:90},{k:'name',label:'产品名称',w:150},{k:'no',label:'产品编号',w:130},
              {k:'model',label:'产品型号',w:130},{k:'cat',label:'产品分类',w:130},{k:'unit',label:'产品单位',w:90},
              {k:'qty',label:'请购数量',w:110},{k:'date',label:'交货日期',w:120},{k:'supplier',label:'建议供应商',w:150},{k:'usage',label:'用途说明',w:150}
            ]}
            renderRow={(row, idx) => (
                  <tr key={row.id}>
                    <PurchaseDetailIndexCell index={idx} />
                    <PurchaseImageCell />
                    <td><Input placeholder="请输入产品名称" defaultValue={row.productName || ''} style={{width:'100%'}} /></td>
                    <td><Input placeholder="产品编号" defaultValue={row.productNo || ''} style={{width:'100%'}} /></td>
                    <td><Input placeholder="型号规格" defaultValue={row.model || ''} style={{width:'100%'}} /></td>
                    <td><Input placeholder="产品分类" defaultValue={row.categoryName || ''} style={{width:'100%'}} /></td>
                    <td><Input placeholder="KG" defaultValue={row.unit || ''} style={{width:'100%'}} /></td>
                    <td><Input placeholder="0" type="number" style={{width:'100%'}} /></td>
                    <td><Input placeholder="请选择" style={{width:'100%'}} /></td>
                    <td><div style={{display:'flex',gap:6}}><Input value={row.supplier || ''} readOnly placeholder="请选择供应商" onClick={() => setSupplierPickerTarget(row.id)} style={{width:'100%',cursor:'pointer'}} /><Btn onClick={() => setSupplierPickerTarget(row.id)} style={{padding:'4px 8px',fontSize:12}}>选</Btn></div></td>
                    <td><Input placeholder="填写用途说明" style={{width:'100%'}} /></td>
                    <PurchaseDetailActions onDelete={() => removeDetail(row.id)} />
                  </tr>
            )}
          />
          <PurchaseAddDetailButton onClick={() => setShowProductPicker(true)} />
        </PurchaseSection>
        {supplierPickerTarget && <SimpleSupplierPickerModal onClose={() => setSupplierPickerTarget(null)} onConfirm={pickSupplier} />}

        <PurchaseSection title="请购备注">
          <PurchaseRichText />
        </PurchaseSection>
      {showProductPicker && (
        <ProductPickerModal
          onClose={() => setShowProductPicker(false)}
          onConfirm={handlePickProducts}
        />
      )}
    </PurchaseFormPage>
  );
}

function PrKV({ label, value }) {
  return <div style={{display:'flex',gap:18}}><span style={{width:90,flex:'none',color:'var(--aw-fg-2)'}}>{label}</span><span>：{value}</span></div>;
}

function buildGeneratedPurchaseOrders(pr, sourceRows) {
  const groups = sourceRows.reduce((acc, row) => {
    const supplier = row.supplier || '海南傲为';
    if (!acc[supplier]) acc[supplier] = [];
    acc[supplier].push(row);
    return acc;
  }, {});
  return Object.entries(groups).map(([supplier, rows], index) => {
    const qty = rows.reduce((sum, row) => sum + Number(row.purchaseQty || row.wait || row.qty || 0), 0);
    const amount = rows.reduce((sum, row) => sum + Number(row.purchaseQty || row.wait || row.qty || 0) * Number(row.price || 0), 0);
    return {
      id: `PO-GEN-${index + 1}`,
      code: rows[0].orderNo || `PO-2026-${String(index + 1).padStart(4, '0')}`,
      supplier,
      sourceCode: pr.code,
      productCount: rows.length,
      qty,
      amount: amount.toFixed(2),
      purchaseDate: rows[0].purchaseDate || '2026-06-18',
      arrivalDate: rows[0].arrivalDate || rows[0].date || '2026-06-25',
      state: '待确认',
      rows,
    };
  });
}

function PrGeneratedPurchaseOrdersPage({ pr, orders, onBack }) {
  return (
    <div className="aw-doc-page">
      <div className="aw-doc-main">
        <div className="aw-doc-form-head">
          <span className="aw-link" onClick={onBack}>← 返回来源</span>
          <span style={{flex:1}} />
          <button className="aw-btn">导出</button>
          <button className="aw-btn primary">提交采购订单</button>
        </div>
        <Card>
          <div style={{fontSize:18,fontWeight:600,marginBottom:8}}>已生成采购订单列表</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,auto)',justifyContent:'start',gap:'6px 28px',fontSize:12,color:'var(--aw-fg-3)'}}>
            <span>来源单据：{pr.code}</span>
            <span>来源主题：{pr.topic}</span>
            <span>生成订单：{orders.length} 张</span>
            <span>生成状态：待确认</span>
          </div>
        </Card>
        <div style={{height:12}} />
        <div className="aw-doc-tbl-wrap">
          <div className="aw-doc-tbl-inner">
            <table className="aw-doc-tbl" style={{whiteSpace:'nowrap'}}>
              <thead>
                <tr>
                  <PurchaseIndexHeader />
                  <th style={{width:150}}><div className="aw-th-inner">采购订单号</div></th>
                  <th style={{width:160}}><div className="aw-th-inner">供应商</div></th>
                  <th style={{width:150}}><div className="aw-th-inner">来源请购</div></th>
                  <th style={{width:100}}><div className="aw-th-inner">产品数</div></th>
                  <th style={{width:120}}><div className="aw-th-inner">采购数量</div></th>
                  <th style={{width:130}}><div className="aw-th-inner">采购金额</div></th>
                  <th style={{width:130}}><div className="aw-th-inner">采购日期</div></th>
                  <th style={{width:130}}><div className="aw-th-inner">预计到货</div></th>
                  <th style={{width:100}}><div className="aw-th-inner">生成状态</div></th>
                  <th style={{width:100}}><div className="aw-th-inner">操作</div></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => (
                  <tr key={order.id}>
                    <td>{i + 1}</td>
                    <td className="aw-link">{order.code}</td>
                    <td>{order.supplier}</td>
                    <td>{order.sourceCode}</td>
                    <td className="aw-num">{order.productCount}</td>
                    <td className="aw-num">{order.qty}</td>
                    <td className="aw-num">RMB{order.amount}</td>
                    <td>{order.purchaseDate}</td>
                    <td>{order.arrivalDate}</td>
                    <td><span className="aw-state aw-state-b">{order.state}</span></td>
                    <td><span className="aw-link">查看</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <PurchaseListFooter total={orders.length} selectedCount={0} pages={1} />
      </div>
    </div>
  );
}

function PrPurchaseCreateModal({ pr, sourceRows, onClose, onConfirm }) {
  const [rows, setRows] = usePrState(() => sourceRows.map((r, i) => ({
    ...r,
    selected: true,
    orderNo: `PO-${new Date().getFullYear()}-${String(i + 1).padStart(4, '0')}`,
    purchaseQty: r.wait || r.qty,
    purchaseDate: '2026-06-18',
    arrivalDate: r.date || '2026-06-25',
    remark: r.forceQuote === '是' ? '需完成询价/定价后下单' : '按请购转采购生成',
  })));
  const [supplierReasonTarget, setSupplierReasonTarget] = usePrState(null);
  const [supplierPickerTarget, setSupplierPickerTarget] = usePrState(null);
  const updateRow = (index, patch) => setRows(list => list.map((row, i) => i === index ? { ...row, ...patch } : row));
  const updateRowBySource = (sourceLine, patch) => setRows(list => list.map(row => row.sourceLine === sourceLine ? { ...row, ...patch } : row));
  const confirmSupplierReason = (reason) => {
    updateRowBySource(supplierReasonTarget, { supplierChangeReason: reason });
    setSupplierPickerTarget(supplierReasonTarget);
    setSupplierReasonTarget(null);
  };
  const confirmSupplierPick = (supplier) => {
    updateRowBySource(supplierPickerTarget, { supplier: supplier.name, supplierChanged: true });
    setSupplierPickerTarget(null);
  };
  const selectedRows = rows.filter(r => r.selected);
  const totalQty = selectedRows.reduce((sum, row) => sum + Number(row.purchaseQty || 0), 0);
  const totalAmount = selectedRows.reduce((sum, row) => sum + Number(row.purchaseQty || 0) * Number(row.price || 0), 0);

  return (
    <>
    <div
      className="aw-modal-mask"
      style={{ position:'fixed', inset:0, zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'28px', background:'rgba(15,23,42,.28)' }}
      onClick={onClose}
    >
      <div className="aw-modal xl" style={{width:'min(1180px,96vw)',maxHeight:'86vh'}} onClick={e => e.stopPropagation()}>
        <div className="head">
          <div className="aw-modal-title">
            生成采购订单
            <span className="aw-modal-sub">按供应商自动拆单，可在生成前调整数量、日期和供应商</span>
          </div>
          <button className="aw-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="body">
          <div className="aw-doc-grid" style={{gridTemplateColumns:'1fr 1fr 1fr',marginBottom:16}}>
            <Field label="来源请购单"><Input value={pr.code} readOnly /></Field>
            <Field label="请购主题"><Input value={pr.topic} readOnly /></Field>
            <Field label="生成方式"><Input value={sourceRows.length > 1 ? '一键采购 / 多订单生成' : '单行采购'} readOnly /></Field>
          </div>
          <div className="aw-doc-tbl-wrap" style={{border:'1px solid var(--aw-border)',borderRadius:6}}>
            <div className="aw-doc-tbl-inner">
              <table className="aw-doc-tbl">
                <thead>
                  <tr>
                    <th style={{width:46}}><div className="aw-th-inner"><input type="checkbox" checked={rows.every(r => r.selected)} onChange={e => setRows(list => list.map(row => ({...row, selected:e.target.checked})))} /></div></th>
                    <th style={{width:60}}><div className="aw-th-inner">序号</div></th>
                    <th style={{width:150}}><div className="aw-th-inner">来源明细</div></th>
                    <th style={{width:120}}><div className="aw-th-inner">采购订单号</div></th>
                    <th style={{width:130}}><div className="aw-th-inner">供应商</div></th>
                    <th style={{width:110}}><div className="aw-th-inner">物料编码</div></th>
                    <th style={{width:130}}><div className="aw-th-inner">物料名称</div></th>
                    <th style={{width:120}}><div className="aw-th-inner">规格型号</div></th>
                    <th style={{width:80}}><div className="aw-th-inner">单位</div></th>
                    <th style={{width:100}}><div className="aw-th-inner">请购数量</div></th>
                    <th style={{width:120}}><div className="aw-th-inner">采购数量</div></th>
                    <th style={{width:110}}><div className="aw-th-inner">采购单价</div></th>
                    <th style={{width:120}}><div className="aw-th-inner">采购金额</div></th>
                    <th style={{width:130}}><div className="aw-th-inner">采购日期</div></th>
                    <th style={{width:130}}><div className="aw-th-inner">预计到货</div></th>
                    <th style={{width:160}}><div className="aw-th-inner">备注</div></th>
                    <th style={{width:100}}><div className="aw-th-inner">操作</div></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={row.sourceLine}>
                      <td><input type="checkbox" checked={row.selected} onChange={e => updateRow(i, {selected:e.target.checked})} /></td>
                      <td>{i + 1}</td>
                      <td>{row.sourceLine}</td>
                      <td><Input value={row.orderNo} onChange={e => updateRow(i, {orderNo:e.target.value})} style={{width:'100%'}} /></td>
                      <td>
                        <PrSupplierEditField value={row.supplier || '海南傲为'} onEdit={() => setSupplierReasonTarget(row.sourceLine)} />
                        {row.supplierChanged && <div style={{fontSize:11,color:'var(--aw-warning)',marginTop:4}}>已触发审核</div>}
                      </td>
                      <td>{row.code}</td>
                      <td>{row.name}</td>
                      <td>{row.spec}</td>
                      <td>{row.unit}</td>
                      <td>{row.qty}</td>
                      <td><Input type="number" value={row.purchaseQty} onChange={e => updateRow(i, {purchaseQty:e.target.value})} style={{width:'100%'}} /></td>
                      <td><Input value={row.price} onChange={e => updateRow(i, {price:e.target.value})} style={{width:'100%'}} /></td>
                      <td className="aw-num">{(Number(row.purchaseQty || 0) * Number(row.price || 0)).toFixed(2)}</td>
                      <td><Input type="date" value={row.purchaseDate} onChange={e => updateRow(i, {purchaseDate:e.target.value})} style={{width:'100%'}} /></td>
                      <td><Input type="date" value={row.arrivalDate} onChange={e => updateRow(i, {arrivalDate:e.target.value})} style={{width:'100%'}} /></td>
                      <td><Input value={row.remark} onChange={e => updateRow(i, {remark:e.target.value})} style={{width:'100%'}} /></td>
                      <td><span className="aw-link" onClick={() => updateRow(i, {selected:true})}>生成采购单</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PrFixedSummaryBar
              items={[
                ['本次采购数量', totalQty],
                ['本次采购金额', totalAmount.toFixed(2)],
              ]}
            />
          </div>
          <div style={{marginTop:12,fontSize:12,color:'var(--aw-fg-3)',lineHeight:1.7}}>
            生成后按供应商拆分采购订单，并保留来源请购单与来源明细记录。
          </div>
        </div>
        <div className="foot">
          <button className="aw-btn" onClick={onClose}>取消</button>
          <button className="aw-btn primary" onClick={() => onConfirm && onConfirm(selectedRows)}>一键生成采购订单</button>
        </div>
      </div>
    </div>
      {supplierReasonTarget && (
        <PrSupplierReasonModal
          supplierName={rows.find(row => row.sourceLine === supplierReasonTarget)?.supplier}
          onClose={() => setSupplierReasonTarget(null)}
          onConfirm={confirmSupplierReason}
        />
      )}
      {supplierPickerTarget && (
        <PrSupplierSelectModal
          onClose={() => setSupplierPickerTarget(null)}
          onConfirm={confirmSupplierPick}
        />
      )}
    </>
  );
}

function PrDetailView({ onBack, data }) {
  const pr = data || PR_ROWS[0];
  const [tab, setTab] = usePrState('info');
  const [purchaseRows, setPurchaseRows] = usePrState(null);
  const [generatedOrders, setGeneratedOrders] = usePrState(null);
  const openPurchaseModal = (rows) => setPurchaseRows(rows.filter(row => Number(row.wait || row.qty || 0) > 0));
  const handlePurchaseGenerate = (rows) => {
    setGeneratedOrders(buildGeneratedPurchaseOrders(pr, rows));
    setPurchaseRows(null);
  };
  if (generatedOrders) return <PrGeneratedPurchaseOrdersPage pr={pr} orders={generatedOrders} onBack={() => setGeneratedOrders(null)} />;
  return (
    <div className="aw-doc-form">
      <div className="aw-doc-form-body">
        <DetailHeaderCard
          title={pr.topic}
          status={pr.state}
          onBack={onBack}
          detailItems={[
            ['请购编号', pr.code],
            ['申请日期', pr.date],
            ['请购人', pr.starter],
            ['请购来源', pr.source],
            ['关联单据', pr.ref],
            ['打印状态', pr.printState || '未打印'],
          ]}
        />

        <Card>
          <Tabs items={[{k:'info',label:'请购信息'},{k:'detail',label:'请购明细'},{k:'log',label:'操作记录'}]} active={tab} onChange={setTab} />
          {tab === 'info' && (
            <>
              <div className="section-title">基础信息</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',rowGap:16,columnGap:80,fontSize:13,marginBottom:22}}>
                <PrKV label="请购单号" value={pr.code} />
                <PrKV label="请购编号" value={pr.code} />
                <PrKV label="请购日期" value={pr.date} />
                <PrKV label="请购人" value={pr.starter} />
                <PrKV label="请购来源" value={pr.source} />
                <PrKV label="关联单据" value={pr.ref} />
                <PrKV label="流程状态" value={pr.state} />
                <PrKV label="打印状态" value={pr.printState || '未打印'} />
              </div>

              <div className="section-title" style={{marginTop:18}}>请购备注</div>
              <div style={{fontSize:13,color:'var(--aw-fg-3)',lineHeight:1.7,marginBottom:16}}>用于生产线急需物料补充，请优先安排采购询价。</div>

              <div className="section-title">附件</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
                {[1,2,3].map(i => (
                  <div key={i} style={{border:'1px dashed var(--aw-border-strong)',borderRadius:6,padding:'12px 14px',background:'#fff'}}>
                    <div style={{fontSize:13,fontWeight:500,marginBottom:6}}>新建文本文档.PDF</div>
                    <div style={{fontSize:11,color:'var(--aw-fg-4)'}}>文件大小：0 Bytes</div>
                    <div style={{fontSize:11,color:'var(--aw-fg-4)',marginTop:2}}>上传日期：2024-08-1 17:45:27</div>
                    <div style={{display:'flex',gap:14,marginTop:14,fontSize:12}}><span className="aw-link">查看</span><span className="aw-link">下载</span></div>
                  </div>
                ))}
              </div>
            </>
          )}
          {tab === 'detail' && (
            <>
              <div style={{overflow:'auto', paddingTop:18}}>
                <table className="aw-doc-tbl">
                  <thead>
                    <tr>
                      <th style={{width:50}}><div className="aw-th-inner">序号</div></th>
                      <th style={{width:150}}><div className="aw-th-inner">来源明细</div></th>
                      <th style={{width:110}}><div className="aw-th-inner">物料编码</div></th>
                      <th style={{width:120}}><div className="aw-th-inner">物料名称</div></th>
                      <th style={{width:120}}><div className="aw-th-inner">规格型号</div></th>
                      <th style={{width:80}}><div className="aw-th-inner">单位</div></th>
                      <th style={{width:100}}><div className="aw-th-inner">请购数量</div></th>
                      <th style={{width:120}}><div className="aw-th-inner">期望交付日期</div></th>
                      <th style={{width:110}}><div className="aw-th-inner">用途</div></th>
                      <th style={{width:80}}><div className="aw-th-inner">操作</div></th>
                    </tr>
                  </thead>
                  <tbody>
                    {PR_DETAIL_ROWS.map((r, i) => (
                      <tr key={r.code}>
                        <td>{i + 1}</td><td>{r.sourceLine}</td><td className="aw-num">{r.code}</td><td>{r.name}</td><td>{r.spec}</td><td>{r.unit}</td><td>{r.qty}</td><td>{r.date}</td><td>{r.usage}</td><td><span className="aw-link" onClick={() => openPurchaseModal([r])}>采购</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PrFixedSummaryBar
                items={[
                  ['请购总数量', PR_DETAIL_ROWS.reduce((sum, row) => sum + Number(row.qty || 0), 0)],
                ]}
              />
            </>
          )}
          {tab === 'log' && <div style={{fontSize:13,color:'var(--aw-fg-3)',textAlign:'center',padding:'34px 0'}}>暂无操作记录</div>}
        </Card>
      </div>
      {purchaseRows && purchaseRows.length > 0 && <PrPurchaseCreateModal pr={pr} sourceRows={purchaseRows} onClose={() => setPurchaseRows(null)} onConfirm={handlePurchaseGenerate} />}
    </div>
  );
}

function PrDetailSummaryView({ onBack }) {
  const rows = [
    {
      code:'7820864',
      name:'半成品物料',
      spec:'规格一',
      unit:'KG',
      sourceCount:2,
      requestQty:1000,
      purchasedQty:500,
      waitQty:500,
      forceQuote:'部分',
      delivery:'2024-12-23',
      status:'部分采购',
      tone:'y',
      sources:[
        ['PR-2026-00232','项目请购','项目一','PR-2026-00232-01','500','250','250','否','已有有效报价','2024-12-23','已转采购'],
        ['PR-2026-00231','生产缺料','WO-260607-015','PR-2026-00231-02','500','250','250','是','-','2024-12-23','审批中'],
      ],
    },
    {
      code:'8518691',
      name:'铝合金型材',
      spec:'AL-6061',
      unit:'KG',
      sourceCount:1,
      requestQty:500,
      purchasedQty:0,
      waitQty:500,
      forceQuote:'是',
      delivery:'2024-12-23',
      status:'待询价',
      tone:'b',
      sources:[
        ['PR-2026-00232','项目请购','项目一','PR-2026-00232-03','500','0','500','是','-','2024-12-23','待询价'],
      ],
    },
    {
      code:'6576642',
      name:'精密轴承',
      spec:'BR-6205',
      unit:'个',
      sourceCount:1,
      requestQty:500,
      purchasedQty:0,
      waitQty:500,
      forceQuote:'否',
      delivery:'2024-12-23',
      status:'待采购',
      tone:'b',
      sources:[
        ['PR-2026-00232','项目请购','项目一','PR-2026-00232-04','500','0','500','否','低金额快速采购','2024-12-23','已批准'],
      ],
    },
    {
      code:'6081578',
      name:'外箱包装',
      spec:'PK-500',
      unit:'个',
      sourceCount:1,
      requestQty:500,
      purchasedQty:250,
      waitQty:250,
      forceQuote:'否',
      delivery:'2024-12-23',
      status:'部分采购',
      tone:'y',
      sources:[
        ['PR-2026-00232','库存补货','包装材料月度请购','PR-2026-00232-05','500','250','250','否','长期协议价','2024-12-23','已转采购'],
      ],
    },
  ];
  const [selected, setSelected] = usePrState(null);
  const [purchaseRows, setPurchaseRows] = usePrState(null);
  const [generatedOrders, setGeneratedOrders] = usePrState(null);
  const summaryPr = { code:'PR-DETAIL-SUMMARY', topic:'请购明细汇总采购' };
  const sourceToPurchaseRow = (source, product) => ({
    sourceLine: source[3],
    code: product.code,
    name: product.name,
    spec: product.spec,
    unit: product.unit,
    qty: Number(source[4] || 0),
    bought: Number(source[5] || 0),
    wait: Number(source[6] || 0),
    forceQuote: source[7],
    skipReason: source[8],
    date: source[9],
    supplier: product.name === '铝合金型材' ? '华南铝材' : product.name === '精密轴承' ? '深圳精密轴承' : product.name === '外箱包装' ? '海南包装材料' : '海南傲为',
    price: product.name === '铝合金型材' ? '32.00' : product.name === '精密轴承' ? '18.00' : product.name === '外箱包装' ? '4.50' : '50.00',
    amount: (Number(source[6] || 0) * (product.name === '铝合金型材' ? 32 : product.name === '精密轴承' ? 18 : product.name === '外箱包装' ? 4.5 : 50)).toFixed(2),
    usage: source[1],
  });
  const openSummaryPurchase = (sourceRows) => {
    const mapped = sourceRows.map(source => sourceToPurchaseRow(source, selected)).filter(row => Number(row.wait || 0) > 0);
    setPurchaseRows(mapped);
  };
  const handleSummaryPurchaseGenerate = (rows) => {
    setGeneratedOrders(buildGeneratedPurchaseOrders(summaryPr, rows));
    setPurchaseRows(null);
  };

  if (generatedOrders) return <PrGeneratedPurchaseOrdersPage pr={summaryPr} orders={generatedOrders} onBack={() => setGeneratedOrders(null)} />;

  if (selected) {
    return (
      <>
        <PurchaseFormPage onBack={() => setSelected(null)} submitText="导出来源">
          <PurchaseSection title={`${selected.name} 请购数量与来源列表`}>
            <InfoGrid items={[
              { label:'产品编号', value:selected.code },
              { label:'产品名称', value:selected.name },
              { label:'规格型号', value:selected.spec },
              { label:'标准单位', value:selected.unit },
              { label:'请购总量', value:selected.requestQty },
              { label:'交货日期', value:selected.delivery },
              { label:'请购状态', value:<span className={'aw-state aw-state-' + selected.tone}>{selected.status}</span> },
            ]} />
            <div style={{display:'flex',justifyContent:'flex-end',margin:'14px 0 10px'}}>
              <button className="aw-btn primary" onClick={() => openSummaryPurchase(selected.sources)}>一键采购</button>
            </div>
            <table className="aw-table">
              <thead>
                <tr>{['序号','请购单号','请购来源','来源对象','来源明细','请购数量','交货日期','流程状态','操作'].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {selected.sources.map((r, i) => (
                  <tr key={r[0] + r[3]}>
                    <td>{i + 1}</td>
                    {[0,1,2,3,4,9,10].map(idx => (
                      <td key={idx} className={idx === 4 ? 'aw-num' : ''}>
                        {idx === 0 ? <span className="aw-link">{r[idx]}</span> : idx === 10 ? <span className={'aw-state aw-state-' + (r[idx].includes('转') || r[idx].includes('批准') ? 'g' : r[idx].includes('审批') ? 'b' : 'y')}>{r[idx]}</span> : r[idx]}
                      </td>
                    ))}
                    <td><span className="aw-link" onClick={() => openSummaryPurchase([r])}>采购</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </PurchaseSection>
        </PurchaseFormPage>
        {purchaseRows && purchaseRows.length > 0 && <PrPurchaseCreateModal pr={summaryPr} sourceRows={purchaseRows} onClose={() => setPurchaseRows(null)} onConfirm={handleSummaryPurchaseGenerate} />}
      </>
    );
  }

  return (
    <>
      <PurchaseListToolbar searchPlaceholder="全局搜索（如产品名称、产品编号、请购来源）" hideNew />
      <div className="aw-doc-tbl-wrap">
        <div className="aw-doc-tbl-inner">
          <table className="aw-doc-tbl" style={{whiteSpace:'nowrap'}}>
            <thead>
              <tr>
                <PurchaseIndexHeader />
                <th style={{width:130}}><div className="aw-th-inner">产品编号</div></th>
                <th style={{width:150}}><div className="aw-th-inner">产品名称</div></th>
                <th style={{width:130}}><div className="aw-th-inner">规格型号</div></th>
                <th style={{width:90}}><div className="aw-th-inner">标准单位</div></th>
                <th style={{width:110}}><div className="aw-th-inner">来源数量</div></th>
                <th style={{width:110}}><div className="aw-th-inner">请购总量</div></th>
                <th style={{width:120}}><div className="aw-th-inner">交货日期</div></th>
                <PurchaseStatusFilterHeader label="状态" options={['待询价','待采购','部分采购','已完成']} />
                <th style={{width:90}}><div className="aw-th-inner">操作</div></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.code}>
                  <td>{i + 1}</td>
                  <td className="aw-num">{r.code}</td>
                  <td>{r.name}</td>
                  <td>{r.spec}</td>
                  <td>{r.unit}</td>
                  <td className="aw-num">{r.sourceCount}</td>
                  <td className="aw-num">{r.requestQty}</td>
                  <td className="aw-num">{r.delivery}</td>
                  <td><span className={'aw-state aw-state-' + r.tone}>{r.status}</span></td>
                  <td><span className="aw-link" onClick={() => setSelected(r)}>查看</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <PurchaseListFooter total={rows.length} selectedCount={0} pages={1} />
    </>
  );
}

function PrListScreen({ initialAction, onActionConsumed }) {
  const [view, setView] = usePrState('list');
  const [detailData, setDetailData] = usePrState(PR_ROWS[0]);

  usePrEffect(() => {
    if (initialAction === 'new') { setView('new'); onActionConsumed && onActionConsumed(); }
    else if (initialAction === 'list') { setView('list'); onActionConsumed && onActionConsumed(); }
    else if (initialAction === '请购列表') { setView('list'); onActionConsumed && onActionConsumed(); }
    else if (initialAction === '请购明细') { setView('detailSummary'); onActionConsumed && onActionConsumed(); }
  }, [initialAction]);

  return (
    <div className="aw-doc-page">
      <div className="aw-doc-main">
        {view === 'list' && <PrListView onNew={() => setView('new')} onView={(row) => { setDetailData(row); setView('detail'); }} />}
        {view === 'new' && <PrNewView onBack={() => setView('list')} />}
        {view === 'detail' && <PrDetailView onBack={() => setView('list')} data={detailData} />}
        {view === 'detailSummary' && <PrDetailSummaryView onBack={() => setView('list')} />}
      </div>
    </div>
  );
}

window.PrListScreen = PrListScreen;
