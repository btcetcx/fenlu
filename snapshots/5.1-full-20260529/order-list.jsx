// ui_kits/erp-console/order-list.jsx
// 采购管理 — 列表 / 添加 / 详情 三态
const { useState: useOrderState, useEffect: useOrderEffect } = React;

const ORDER_ROWS = [
  { code:'CG-20251221001', supplier:'海南傲为', summary:'8(预览浮层)', date:'2025-12-12', amount:'RMB5960.00', paid:'5960.00', invoice:'5960.00', arrival:'2025-12-31', match:'已匹配', provisional:'0.00', certified:'已认证', deduction:'0.00', payable:'0.00', state:'审核中', tone:'b' },
  { code:'CG-20251221002', supplier:'深圳鑫达电子科技有限公司', summary:'5(预览浮层)', date:'2025-12-13', amount:'RMB12800.00', paid:'0.00', invoice:'0.00', arrival:'2026-01-05', match:'待收货', provisional:'6400.00', certified:'未到票', deduction:'0.00', payable:'6400.00', state:'采购中', tone:'y' },
  { code:'CG-20251221003', supplier:'广州宏业机械配件有限公司', summary:'3(预览浮层)', date:'2025-12-14', amount:'RMB6800.00', paid:'3000.00', invoice:'3000.00', arrival:'2026-01-08', match:'差异待审', provisional:'3800.00', certified:'待认证', deduction:'200.00', payable:'3600.00', state:'运输中', tone:'b' },
  { code:'CG-20251221004', supplier:'佛山启明金属材料有限公司', summary:'2(预览浮层)', date:'2025-12-15', amount:'RMB980.40', paid:'0.00', invoice:'0.00', arrival:'2026-01-10', match:'待入库', provisional:'0.00', certified:'未到票', deduction:'0.00', payable:'0.00', state:'待入库', tone:'y' },
  { code:'CG-20251221005', supplier:'东莞嘉盛工业材料有限公司', summary:'6(预览浮层)', date:'2025-12-16', amount:'RMB1035.96', paid:'1035.96', invoice:'1035.96', arrival:'2026-01-12', match:'已关闭', provisional:'0.00', certified:'已认证', deduction:'0.00', payable:'0.00', state:'异常取消', tone:'gray' },
  { code:'CG-20251221006', supplier:'东莞华美包装制品厂', summary:'4(预览浮层)', date:'2025-12-17', amount:'RMB4200.00', paid:'2100.00', invoice:'2100.00', arrival:'2026-01-16', match:'部分匹配', provisional:'2100.00', certified:'已认证', deduction:'300.00', payable:'1800.00', state:'部分入库', tone:'b' },
  { code:'CG-20251221007', supplier:'上海博源化工有限公司', summary:'7(预览浮层)', date:'2025-12-18', amount:'RMB7600.00', paid:'7600.00', invoice:'7600.00', arrival:'2026-01-20', match:'已匹配', provisional:'0.00', certified:'已认证', deduction:'0.00', payable:'0.00', state:'已完成', tone:'g' },
];

const ORDER_SOURCE_ROWS = [
  {
    id:'pr-1',
    type:'请购',
    title:'20240请购购物料00232',
    code:'PR-2026-00232',
    supplier:'海南傲为',
    date:'2026-06-07',
    products:[
      { id:'pr-p1', sourceLine:'PR-2026-00232-01', priceSource:'请购转采购/待询价', productName:'半成品物料', productNo:'7820864', model:'规格一', categoryName:'半成品', unit:'KG', qty:500, purchasedQty:250, waitPurchaseQty:250, price:'50.00', amount:'25000.00', supplier:'海南傲为', arrival:'2025-12-31' },
      { id:'pr-p2', sourceLine:'PR-2026-00232-02', priceSource:'请购转采购/待询价', productName:'半成品物料', productNo:'5786931', model:'规格一', categoryName:'半成品', unit:'KG', qty:500, purchasedQty:0, waitPurchaseQty:500, price:'50.00', amount:'25000.00', supplier:'海南傲为', arrival:'2025-12-31' },
    ],
  },
  {
    id:'inq-1',
    type:'询价',
    title:'铝合金型材询价',
    code:'DD-2024-002',
    supplier:'佛山启明金属材料有限公司',
    date:'2025-12-10',
    products:[
      { id:'inq-p1', sourceLine:'IQ-20251219001-01', priceSource:'询价定价/佛山启明/V2', productName:'铝合金型材', productNo:'5786931', model:'AL-20', categoryName:'型材', unit:'米', qty:12, purchasedQty:0, waitPurchaseQty:12, price:'86.00', amount:'980.40', supplier:'佛山启明金属材料有限公司', arrival:'2025-12-18' },
      { id:'inq-p2', sourceLine:'IQ-20251219001-02', priceSource:'询价定价/深圳鑫达/V1', productName:'半成品物料', productNo:'7820864', model:'HM-450', categoryName:'半成品', unit:'KG', qty:8, purchasedQty:0, waitPurchaseQty:8, price:'50.00', amount:'392.00', supplier:'深圳鑫达电子科技有限公司', arrival:'2025-12-20' },
    ],
  },
  {
    id:'mrp-1',
    type:'MRP采购建议',
    title:'6月温控终端缺料采购建议',
    code:'MRP-PUR-202606-001',
    supplier:'深圳鑫达电子科技有限公司',
    date:'2026-06-08',
    products:[
      { id:'mrp-p1', sourceLine:'MRP-PUR-202606-001-01', priceSource:'MRP采购建议/供应商报价', productName:'电子控制板', productNo:'ECU-2601', model:'ECU-A1', categoryName:'电子元器件', unit:'PCS', qty:120, purchasedQty:0, waitPurchaseQty:120, price:'86.00', amount:'10320.00', supplier:'深圳鑫达电子科技有限公司', arrival:'2026-06-15' },
      { id:'mrp-p2', sourceLine:'MRP-PUR-202606-001-02', priceSource:'MRP采购建议/供应商报价', productName:'温控探头', productNo:'TEMP-091', model:'TP-09', categoryName:'传感器', unit:'个', qty:240, purchasedQty:0, waitPurchaseQty:240, price:'18.00', amount:'4320.00', supplier:'广州宏业机械配件有限公司', arrival:'2026-06-16' },
    ],
  },
];

const ORDER_SUPPLIERS = [
  { id:'s1', name:'海南傲为', level:'A', contact:'夏经理', phone:'13800138000' },
  { id:'s2', name:'深圳鑫达电子科技有限公司', level:'A', contact:'丁昌容', phone:'13500001111' },
  { id:'s3', name:'广州宏业机械配件有限公司', level:'B', contact:'纪广', phone:'13500002222' },
  { id:'s4', name:'佛山启明金属材料有限公司', level:'A', contact:'庞慧', phone:'13500003333' },
  { id:'s5', name:'东莞嘉盛工业材料有限公司', level:'B', contact:'顾伦', phone:'13500004444' },
];

const ORDER_SUPPLIER_PRODUCTS = [
  { id:'sp1', supplier:'海南傲为', category:'semi', categoryName:'半成品', productNo:'7820864', productName:'半成品物料', model:'规格一', unit:'KG', price:'50.00', stock:1200, arrival:'2025-12-31' },
  { id:'sp2', supplier:'海南傲为', category:'semi', categoryName:'半成品', productNo:'5786931', productName:'半成品物料', model:'规格一', unit:'KG', price:'50.00', stock:860, arrival:'2025-12-31' },
  { id:'sp3', supplier:'深圳鑫达电子科技有限公司', category:'semi', categoryName:'半成品', productNo:'7820864', productName:'半成品物料', model:'HM-450', unit:'KG', price:'50.00', stock:1200, arrival:'2025-12-20' },
  { id:'sp4', supplier:'深圳鑫达电子科技有限公司', category:'part', categoryName:'零部件', productNo:'6576642', productName:'精密轴承', model:'BR-6205', unit:'个', price:'18.00', stock:240, arrival:'2025-12-26' },
  { id:'sp5', supplier:'广州宏业机械配件有限公司', category:'semi', categoryName:'半成品', productNo:'5786931', productName:'半成品物料', model:'HM-451', unit:'KG', price:'48.00', stock:860, arrival:'2025-12-22' },
  { id:'sp6', supplier:'佛山启明金属材料有限公司', category:'raw', categoryName:'原材料', productNo:'8518691', productName:'铝合金型材', model:'AL-6061', unit:'KG', price:'32.00', stock:520, arrival:'2025-12-25' },
  { id:'sp7', supplier:'东莞嘉盛工业材料有限公司', category:'raw', categoryName:'型材', productNo:'5786931', productName:'铝合金型材', model:'AL-20', unit:'米', price:'89.00', stock:360, arrival:'2025-12-17' },
  { id:'sp8', supplier:'东莞嘉盛工业材料有限公司', category:'pack', categoryName:'包装材料', productNo:'6081578', productName:'外箱包装', model:'PK-500', unit:'个', price:'4.50', stock:1800, arrival:'2025-12-28' },
];

function OrderToolbar({ onNew }) {
  return (
    <PurchaseListToolbar
      searchPlaceholder="全局搜索（如采购编号、供应商、产品）"
      newLabel="新增采购"
      onNew={onNew}
    />
  );
}

function OrderListView({ onNew, onView }) {
  const [sel, setSel] = useOrderState({});
  const [statusFilter, setStatusFilter] = useOrderState('');
  const rows = statusFilter ? ORDER_ROWS.filter(r => r.state === statusFilter) : ORDER_ROWS;
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
  const toggleRow = (i) => setSel(s => ({ ...s, [i]: !s[i] }));

  return (
    <>
      <OrderToolbar onNew={onNew} />
      <div className="aw-doc-tbl-wrap">
        <div className="aw-doc-tbl-inner">
          <table className="aw-doc-tbl">
            <thead>
              <tr>
                <PurchaseSelectHeader checked={allChecked} indeterminate={someChecked} onToggle={toggleAll} />
                <PurchaseIndexHeader />
                <th style={{width:150}}><div className="aw-th-inner">采购编号</div></th>
                <th style={{width:170}}><div className="aw-th-inner">供应商</div></th>
                <th style={{width:130}}><div className="aw-th-inner">产品概要</div></th>
                <th style={{width:120}}><div className="aw-th-inner">采购日期</div></th>
                <th style={{width:120}}><div className="aw-th-inner">采购金额</div></th>
                <th style={{width:110}}><div className="aw-th-inner">已付金额</div></th>
                <th style={{width:110}}><div className="aw-th-inner">到票金额</div></th>
                <th style={{width:100}}><div className="aw-th-inner">三单匹配</div></th>
                <th style={{width:110}}><div className="aw-th-inner">暂估应付</div></th>
                <th style={{width:100}}><div className="aw-th-inner">发票认证</div></th>
                <th style={{width:110}}><div className="aw-th-inner">质检扣款</div></th>
                <th style={{width:110}}><div className="aw-th-inner">可付款</div></th>
                <th style={{width:120}}><div className="aw-th-inner">预计到货</div></th>
                <PurchaseStatusFilterHeader label="采购状态" value={statusFilter} onChange={setStatusFilter} options={['审核中','采购中','运输中','待入库','异常取消','部分入库','已完成']} />
                <th style={{width:90}}><div className="aw-th-inner">操作</div></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.code} onClick={() => onView(r)} style={{cursor:'pointer'}}>
                  <PurchaseSelectCell checked={!!sel[i]} onToggle={() => toggleRow(i)} />
                  <td className="aw-num">{i + 1}</td>
                  <td className="aw-link">{r.code}</td>
                  <td>{r.supplier}</td>
                  <td className="aw-link">{r.summary}</td>
                  <td className="aw-num">{r.date}</td>
                  <td className="aw-num">{r.amount}</td>
                  <td className="aw-num">{r.paid}</td>
                  <td className="aw-num">{r.invoice}</td>
                  <td>{r.match}</td>
                  <td className="aw-num">{r.provisional}</td>
                  <td>{r.certified}</td>
                  <td className="aw-num">{r.deduction}</td>
                  <td className="aw-num">{r.payable}</td>
                  <td className="aw-num">{r.arrival}</td>
                  <td><span className={'aw-state aw-state-' + r.tone}>{r.state}</span></td>
                  <td><span className="aw-link" onClick={e => { e.stopPropagation(); onView(r); }}>查看</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <PurchaseListFooter
        total={ORDER_ROWS.length}
        selectedCount={Object.values(sel).filter(Boolean).length}
        allChecked={allChecked}
        someChecked={someChecked}
        onToggleAll={toggleAll}
        pages={3}
      />
    </>
  );
}

function OrderSourcePickerModal({ onClose, onConfirm }) {
  const [sourceType, setSourceType] = useOrderState('请购');
  const [selectedId, setSelectedId] = useOrderState('');
  const rows = ORDER_SOURCE_ROWS.filter(r => r.type === sourceType);
  const selected = ORDER_SOURCE_ROWS.find(r => r.id === selectedId);

  return (
    <div className="aw-mask" onClick={onClose}>
      <div className="aw-modal" style={{width:'min(860px,94vw)',maxHeight:'85vh'}} onClick={e => e.stopPropagation()}>
        <div className="head">
          <span>选择订单来源</span>
          <span style={{cursor:'pointer',color:'var(--aw-fg-4)'}} onClick={onClose}>✕</span>
        </div>
        <div className="body" style={{padding:0}}>
          <div style={{display:'grid',gridTemplateColumns:'180px 1fr',minHeight:430}}>
            <div style={{borderRight:'1px solid var(--aw-border)',padding:'8px',background:'var(--aw-surface-2)'}}>
              {['请购','询价','MRP采购建议'].map(t => (
                <div
                  key={t}
                  className={'aw-tree-row aw-tree-l2' + (sourceType === t ? ' on' : '')}
                  onClick={() => { setSourceType(t); setSelectedId(''); }}
                >
                  <span className="aw-tree-caret">{sourceType === t ? '▾' : ''}</span>
                  <TileIcon name={t === '请购' ? 'cart' : t === '询价' ? 'search' : 'flow'} size={14} />
                  <span>{t}列表</span>
                </div>
              ))}
            </div>
            <div style={{display:'flex',flexDirection:'column',minWidth:0}}>
              <div style={{padding:'12px 16px',borderBottom:'1px solid var(--aw-divider)',fontSize:13,color:'var(--aw-fg-3)'}}>
                当前来源：<span style={{color:'var(--aw-primary)',fontWeight:500}}>{sourceType}列表</span>
              </div>
              <div className="aw-doc-tbl-inner" style={{flex:1}}>
                <table className="aw-doc-tbl">
                  <thead>
                    <tr>
                      <th style={{width:46}}></th>
                      <th style={{width:150}}><div className="aw-th-inner">来源编号</div></th>
                      <th><div className="aw-th-inner">来源主题</div></th>
                      <th style={{width:180}}><div className="aw-th-inner">建议供应商</div></th>
                      <th style={{width:120}}><div className="aw-th-inner">单据日期</div></th>
                      <th style={{width:100}}><div className="aw-th-inner">产品数</div></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(row => (
                      <tr key={row.id} onClick={() => setSelectedId(row.id)} style={{cursor:'pointer',background:selectedId === row.id ? 'var(--aw-primary-soft)' : undefined}}>
                        <td style={{textAlign:'center',background:selectedId === row.id ? 'var(--aw-primary-soft)' : undefined}}><input type="radio" checked={selectedId === row.id} onChange={() => setSelectedId(row.id)} /></td>
                        <td className="aw-num">{row.code}</td>
                        <td className="aw-link">{row.title}</td>
                        <td>{row.supplier}</td>
                        <td className="aw-num">{row.date}</td>
                        <td className="aw-num">{row.products.length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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

function OrderTitleField({ value, onChange, onPick }) {
  return (
    <div style={{display:'flex',alignItems:'center',height:32,border:'1px solid var(--aw-border-strong)',background:'#fff'}}>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="手动输入订单主题"
        style={{flex:1,minWidth:0,border:0,outline:'none',padding:'0 10px',height:'100%',font:'inherit',fontSize:13,background:'transparent'}}
      />
      <button
        type="button"
        title="选择订单来源"
        onClick={onPick}
        style={{width:34,height:30,border:0,borderLeft:'1px solid var(--aw-divider)',background:'#fff',cursor:'pointer',color:'var(--aw-primary)',fontSize:16}}
      >⌕</button>
    </div>
  );
}

function SupplierReasonModal({ supplierName, onClose, onConfirm }) {
  const [reason, setReason] = useOrderState('');
  return (
    <div className="aw-mask" onClick={onClose}>
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

function SupplierSelectModal({ onClose, onConfirm }) {
  const [selectedId, setSelectedId] = useOrderState('');
  const selected = ORDER_SUPPLIERS.find(s => s.id === selectedId);
  return (
    <div className="aw-mask" onClick={onClose}>
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
                {ORDER_SUPPLIERS.map(s => (
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

function SupplierEditField({ value, onEdit }) {
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

function OrderSupplierField({ value, onPick }) {
  return (
    <div style={{display:'flex',alignItems:'center',height:32,border:'1px solid var(--aw-border-strong)',background:'#fff'}}>
      <input
        value={value || ''}
        readOnly
        onClick={onPick}
        placeholder="请选择供应商"
        style={{flex:1,minWidth:0,border:0,outline:'none',padding:'0 10px',height:'100%',font:'inherit',fontSize:13,background:'transparent',cursor:'pointer'}}
      />
      <button
        type="button"
        title="选择供应商"
        onClick={onPick}
        style={{width:34,height:30,border:0,borderLeft:'1px solid var(--aw-divider)',background:'#fff',cursor:'pointer',color:'var(--aw-primary)',fontSize:16}}
      >⌕</button>
    </div>
  );
}

function SupplierProductPickerModal({ supplierName, onClose, onConfirm }) {
  const [category, setCategory] = useOrderState('all');
  const [sel, setSel] = useOrderState({});
  const [search, setSearch] = useOrderState('');
  const products = ORDER_SUPPLIER_PRODUCTS.filter(p => p.supplier === supplierName);
  const categories = [
    { k:'all', label:'全部产品', count:products.length },
    ...['semi','raw','part','pack'].map(k => {
      const labelMap = { semi:'半成品', raw:'原材料', part:'零部件', pack:'包装材料' };
      return { k, label:labelMap[k], count:products.filter(p => p.category === k).length };
    }).filter(c => c.count > 0),
  ];
  const filtered = products.filter(p => {
    if (category !== 'all' && p.category !== category) return false;
    if (search && !p.productName.includes(search) && !p.productNo.includes(search)) return false;
    return true;
  });
  const selCount = Object.values(sel).filter(Boolean).length;
  const toggleRow = (id) => setSel(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleAll = () => {
    const allChecked = filtered.length > 0 && filtered.every(p => sel[p.id]);
    if (allChecked) {
      setSel(prev => {
        const next = { ...prev };
        filtered.forEach(p => delete next[p.id]);
        return next;
      });
      return;
    }
    setSel(prev => {
      const next = { ...prev };
      filtered.forEach(p => next[p.id] = true);
      return next;
    });
  };
  const headerCls = 'aw-chk' + (selCount === 0 ? '' : filtered.every(p => sel[p.id]) ? ' on' : ' indet');
  const picked = products.filter(p => sel[p.id]);

  return (
    <div className="aw-mask" onClick={onClose}>
      <div className="aw-modal" style={{width:'min(980px,94vw)',maxHeight:'85vh'}} onClick={e => e.stopPropagation()}>
        <div className="head">
          <span>选择供应商产品</span>
          <span style={{cursor:'pointer',color:'var(--aw-fg-4)'}} onClick={onClose}>✕</span>
        </div>
        <div className="body" style={{padding:0}}>
          <div style={{display:'grid',gridTemplateColumns:'220px 1fr',minHeight:480}}>
            <div style={{borderRight:'1px solid var(--aw-border)',display:'flex',flexDirection:'column'}}>
              <div style={{padding:'10px 12px',borderBottom:'1px solid var(--aw-divider)',fontSize:13,fontWeight:600}}>产品分类</div>
              <div style={{padding:8}}>
                {categories.map(c => (
                  <div key={c.k} className={'aw-tree-row aw-tree-l2' + (category === c.k ? ' on' : '')} onClick={() => setCategory(c.k)}>
                    <span className="aw-tree-caret">{category === c.k ? '▾' : ''}</span>
                    <TileIcon name="folder" size={14} />
                    <span style={{flex:1}}>{c.label}</span>
                    <span className="aw-doc-tree-n">({c.count})</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{display:'flex',flexDirection:'column',minWidth:0}}>
              <div style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderBottom:'1px solid var(--aw-divider)'}}>
                <span style={{color:'var(--aw-primary)',fontSize:13,fontWeight:500}}>供应商：{supplierName || '未选择'}</span>
                <span style={{color:'var(--aw-fg-3)',fontSize:13}}>已勾选 {selCount} 项</span>
                <div style={{marginLeft:'auto',border:'1px solid var(--aw-border-strong)',borderRadius:6,padding:'4px 8px',display:'flex',gap:6,alignItems:'center'}}>
                  <span style={{color:'var(--aw-fg-4)'}}>⌕</span>
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="搜索产品名称/编号"
                    style={{border:0,outline:'none',background:'transparent',font:'inherit',fontSize:13,width:190}}
                  />
                </div>
              </div>
              <div className="aw-doc-tbl-inner" style={{flex:1}}>
                <table className="aw-doc-tbl">
                  <thead>
                    <tr>
                      <th style={{width:42}}><div className="aw-th-inner" style={{justifyContent:'center'}}><span className={headerCls} onClick={toggleAll} /></div></th>
                      <th style={{width:60}}><div className="aw-th-inner">序号</div></th>
                      <th style={{width:120}}><div className="aw-th-inner">产品编号</div></th>
                      <th style={{width:150}}><div className="aw-th-inner">产品名称</div></th>
                      <th style={{width:120}}><div className="aw-th-inner">产品型号</div></th>
                      <th style={{width:120}}><div className="aw-th-inner">产品分类</div></th>
                      <th style={{width:80}}><div className="aw-th-inner">单位</div></th>
                      <th style={{width:90}}><div className="aw-th-inner">采购单价</div></th>
                      <th style={{width:90}}><div className="aw-th-inner">库存</div></th>
                      <th style={{width:120}}><div className="aw-th-inner">预计到货</div></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p, i) => (
                      <tr key={p.id} onClick={() => toggleRow(p.id)} style={{cursor:'pointer',background:sel[p.id] ? 'var(--aw-primary-soft)' : undefined}}>
                        <td style={{textAlign:'center',background:sel[p.id] ? 'var(--aw-primary-soft)' : undefined}}><span className={'aw-chk' + (sel[p.id] ? ' on' : '')} onClick={e => { e.stopPropagation(); toggleRow(p.id); }} /></td>
                        <td className="aw-num">{i + 1}</td>
                        <td className="aw-num">{p.productNo}</td>
                        <td className="aw-link">{p.productName}</td>
                        <td>{p.model}</td>
                        <td>{p.categoryName}</td>
                        <td>{p.unit}</td>
                        <td className="aw-num">{p.price}</td>
                        <td className="aw-num">{p.stock}</td>
                        <td className="aw-num">{p.arrival}</td>
                      </tr>
                    ))}
                    {filtered.length === 0 && <tr><td colSpan={10} style={{textAlign:'center',color:'var(--aw-fg-3)',padding:'40px 12px'}}>暂无该供应商供货产品</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="foot">
          <Btn onClick={onClose}>取消</Btn>
          <Btn kind="primary" onClick={() => picked.length > 0 && onConfirm(picked)}>确定</Btn>
        </div>
      </div>
    </div>
  );
}

function OrderNewView({ onBack }) {
  const [title, setTitle] = useOrderState('');
  const [source, setSource] = useOrderState(null);
  const [selectedSupplier, setSelectedSupplier] = useOrderState(null);
  const [detailRows, setDetailRows] = useOrderState([]);
  const [showSourcePicker, setShowSourcePicker] = useOrderState(false);
  const [showBaseSupplierPicker, setShowBaseSupplierPicker] = useOrderState(false);
  const [showProductPicker, setShowProductPicker] = useOrderState(false);
  const [supplierReasonTarget, setSupplierReasonTarget] = useOrderState(null);
  const [supplierPickerTarget, setSupplierPickerTarget] = useOrderState(null);
  const handleSourcePick = (picked) => {
    setSource(picked);
    setTitle(picked.title);
    setSelectedSupplier({ name:picked.supplier });
    setDetailRows(picked.products.map((p, idx) => ({ ...p, id:`${picked.id}-${idx}` })));
    setShowSourcePicker(false);
  };
  const handleBaseSupplierPick = (supplier) => {
    setSelectedSupplier(supplier);
    setDetailRows([]);
    setShowBaseSupplierPicker(false);
  };
  const handlePickSupplierProducts = (products) => {
    setDetailRows(rows => [
      ...rows,
      ...products.map((p, idx) => ({
        ...p,
        id:`manual-${Date.now()}-${idx}`,
        sourceLine:'手动',
        priceSource:'手动定价',
        qty:'',
        waitPurchaseQty:'',
        amount:'',
        supplier:selectedSupplier?.name || p.supplier,
      }))
    ]);
    setShowProductPicker(false);
  };
  const removeDetail = (id) => setDetailRows(rows => rows.filter(row => row.id !== id));
  const confirmSupplierReason = (reason) => {
    setDetailRows(rows => rows.map(row => row.id === supplierReasonTarget ? { ...row, supplierChangeReason: reason } : row));
    setSupplierPickerTarget(supplierReasonTarget);
    setSupplierReasonTarget(null);
  };
  const confirmSupplierPick = (supplier) => {
    setDetailRows(rows => rows.map(row => row.id === supplierPickerTarget ? { ...row, supplier: supplier.name, supplierChanged: true } : row));
    setSupplierPickerTarget(null);
  };

  return (
    <PurchaseFormPage onBack={onBack}>
      <PurchaseSection title="基础信息">
        <div className="aw-doc-grid" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
          <Field label="订单主题" req><OrderTitleField value={title} onChange={setTitle} onPick={() => setShowSourcePicker(true)} /></Field>
          <Field label="采购编号"><Input defaultValue="自动生成" disabled /></Field>
          <Field label="订单来源"><Input value={source ? `${source.type} / ${source.code}` : '手动输入'} readOnly /></Field>
          <Field label="供应商" req><OrderSupplierField value={selectedSupplier?.name || ''} onPick={() => setShowBaseSupplierPicker(true)} /></Field>
          <Field label="采购日期" req><Input defaultValue="自动" /></Field>
          <Field label="预计到货"><Input placeholder="请选择" /></Field>
          <Field label={<span>采购状态<HelpTip text="新建采购订单默认进入审核中，采购中、运输中、待入库、部分入库、已完成由审批、到货、入库、三单匹配等动作自动推进。" /></span>}><Input value="审核中" readOnly /></Field>
        </div>
        <div style={{marginTop:10,fontSize:12,color:'var(--aw-fg-3)',lineHeight:1.7}}>
          采购来源受采购策略控制：可从请购、询价定价、MRP采购建议带入明细；若策略配置“禁止手动采购”，则需通过订单主题搜索选择来源后才能提交。
        </div>
      </PurchaseSection>

      <PurchaseSection title="采购明细">
        <PurchaseDetailTable
          rows={detailRows}
          emptyText="暂无采购明细，可选择订单来源自动带入，或先选择供应商后新增明细"
          columns={[
            {k:'sourceLine',label:'来源明细',w:150},{k:'image',label:'图片',w:90},{k:'name',label:'产品名称',w:150},{k:'no',label:'产品编号',w:130},
            {k:'model',label:'产品型号',w:130},{k:'cat',label:'产品分类',w:130},{k:'unit',label:'产品单位',w:90},
            {k:'qty',label:'采购数量',w:110},{k:'waitPurchaseQty',label:'待采购',w:100},{k:'price',label:'采购单价',w:100},{k:'amount',label:'采购金额',w:110},
            {k:'arrival',label:'预计到货',w:120},{k:'supplier',label:'供应商',w:170}
          ]}
          renderRow={(row, idx) => (
            <tr key={row.id}>
              <PurchaseDetailIndexCell index={idx} />
              <td><Input placeholder="来源明细" defaultValue={row.sourceLine || '手动'} readOnly style={{width:'100%',background:'#F5F6FA'}} /></td>
              <PurchaseImageCell />
              <td><Input placeholder="请输入产品名称" defaultValue={row.productName || ''} style={{width:'100%'}} /></td>
              <td><Input placeholder="产品编号" defaultValue={row.productNo || ''} style={{width:'100%'}} /></td>
              <td><Input placeholder="型号规格" defaultValue={row.model || ''} style={{width:'100%'}} /></td>
              <td><Input placeholder="产品分类" defaultValue={row.categoryName || ''} style={{width:'100%'}} /></td>
              <td><Input placeholder="KG" defaultValue={row.unit || ''} style={{width:'100%'}} /></td>
              <td><Input placeholder="0" defaultValue={row.qty || ''} type="number" style={{width:'100%'}} /></td>
              <td><Input placeholder="0" defaultValue={row.waitPurchaseQty ?? row.qty ?? ''} readOnly style={{width:'100%',background:'#F5F6FA'}} /></td>
              <td><Input placeholder="0.00" defaultValue={row.price || ''} style={{width:'100%'}} /></td>
              <td><Input placeholder="0.00" defaultValue={row.amount || ''} style={{width:'100%'}} /></td>
              <td><Input placeholder="请选择" defaultValue={row.arrival || ''} style={{width:'100%'}} /></td>
              <td>
                <SupplierEditField value={row.supplier || ''} onEdit={() => setSupplierReasonTarget(row.id)} />
                {row.supplierChanged && <div style={{fontSize:11,color:'var(--aw-warning)',marginTop:4}}>已触发审核</div>}
              </td>
              <PurchaseDetailActions onDelete={() => removeDetail(row.id)} />
            </tr>
          )}
        />
        <PurchaseAddDetailButton
          onClick={() => selectedSupplier && setShowProductPicker(true)}
          hint={selectedSupplier ? `从「${selectedSupplier.name}」的供货产品中选择` : '请先选择供应商'}
        />
      </PurchaseSection>

      <PurchaseSection title="采购备注">
        <PurchaseRichText />
      </PurchaseSection>

      <PurchaseSection title="来源与定价说明">
        <div style={{fontSize:12,color:'var(--aw-fg-3)',lineHeight:1.8}}>
          <div>来源明细用于回写请购/询价的已采购数量，待采购数量=来源需求数量-已采购数量。</div>
          <div>从询价生成采购时，采购明细必须保留定价供应商、报价版本和定价记录；手动采购则记录为手动来源。</div>
        </div>
      </PurchaseSection>
      {showSourcePicker && <OrderSourcePickerModal onClose={() => setShowSourcePicker(false)} onConfirm={handleSourcePick} />}
      {showBaseSupplierPicker && (
        <SupplierSelectModal
          onClose={() => setShowBaseSupplierPicker(false)}
          onConfirm={handleBaseSupplierPick}
        />
      )}
      {showProductPicker && (
        <SupplierProductPickerModal
          supplierName={selectedSupplier?.name || ''}
          onClose={() => setShowProductPicker(false)}
          onConfirm={handlePickSupplierProducts}
        />
      )}
      {supplierReasonTarget && (
        <SupplierReasonModal
          supplierName={detailRows.find(row => row.id === supplierReasonTarget)?.supplier}
          onClose={() => setSupplierReasonTarget(null)}
          onConfirm={confirmSupplierReason}
        />
      )}
      {supplierPickerTarget && (
        <SupplierSelectModal
          onClose={() => setSupplierPickerTarget(null)}
          onConfirm={confirmSupplierPick}
        />
      )}
    </PurchaseFormPage>
  );
}

function OrderKV({ label, value }) {
  return <div style={{display:'flex',gap:18}}><span style={{width:90,flex:'none',color:'var(--aw-fg-2)'}}>{label}</span><span>：{value}</span></div>;
}

function OrderRecordTable({ rows, cols }) {
  return (
    <table className="aw-table">
      <thead><tr>{cols.map(c => <th key={c}>{c}</th>)}</tr></thead>
      <tbody>{rows.map((row, i) => <tr key={i}>{row.map((cell, idx) => <td key={idx}>{cell}</td>)}</tr>)}</tbody>
    </table>
  );
}

function OrderDetailView({ onBack, data }) {
  const order = data || ORDER_ROWS[0];
  const [tab, setTab] = useOrderState('采购信息');
  const orderAmount = Number(String(order.amount || '').replace(/[^\d.]/g, '')) || 0;
  const detailRows = ORDER_SUPPLIER_PRODUCTS.slice(0, 3).map((row, idx) => {
    const qty = idx === 0 ? 50 : idx === 1 ? 30 : 20;
    const lineAmount = idx === 2 ? orderAmount - orderAmount * 0.5 - orderAmount * 0.3 : orderAmount * (idx === 0 ? 0.5 : 0.3);
    return { ...row, sourceLine: idx === 0 ? 'IQ-20251219001-01' : idx === 1 ? 'PR-2026-00232-02' : 'IQ-20251219001-03', qty, price:(lineAmount / qty).toFixed(2), inQty: order.state === '已完成' ? qty : Math.floor(qty / 2), payable: lineAmount.toFixed(2) };
  });
  const tabs = ['采购信息','采购明细','入库记录','三单匹配','应付暂估','质检扣款','付款记录','到票记录','来源记录','操作记录'];
  return (
    <div className="aw-doc-form">
      <div className="aw-doc-form-body">
        <DetailHeaderCard
          title={order.code}
          status={order.state}
          onBack={onBack}
          detailItems={[
            ['供应商', order.supplier],
            ['采购日期', order.date],
            ['预计到货', order.arrival],
            ['采购金额', order.amount],
          ]}
        />
        <Card>
          <div className="aw-tabs" style={{marginBottom:14}}>{tabs.map(t => <span key={t} className={'aw-tab ' + (tab === t ? 'on' : '')} onClick={() => setTab(t)}>{t}</span>)}</div>
          {tab === '采购信息' && <PurchaseSection title="基础信息"><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',rowGap:16,columnGap:80,fontSize:13}}>
            <OrderKV label="采购编号" value={order.code} /><OrderKV label="供应商" value={order.supplier} /><OrderKV label="采购日期" value={order.date} /><OrderKV label="预计到货" value={order.arrival} /><OrderKV label="采购金额" value={order.amount} /><OrderKV label="采购状态" value={<Badge tone={order.tone || 'b'}>{order.state}</Badge>} /><OrderKV label="来源单据" value="询价定价单 IQ-20251219001" /><OrderKV label="付款条件" value="月结30天 / 到票后付款" /><OrderKV label="三单匹配" value={order.match} /><OrderKV label="可付款金额" value={order.payable} />
          </div></PurchaseSection>}
          {tab === '采购明细' && <PurchaseSection title="采购明细"><table className="aw-table"><thead><tr><th>序号</th><th>来源明细</th><th>产品编号</th><th>产品名称</th><th>规格型号</th><th>单位</th><th>采购数量</th><th>已入库</th><th>待入库</th><th>单价</th><th>应付金额</th><th>预计到货</th><th>状态</th></tr></thead><tbody>{detailRows.map((r,i)=><tr key={r.id}><td>{i+1}</td><td>{r.sourceLine}</td><td>{r.productNo}</td><td>{r.productName}</td><td>{r.model}</td><td>{r.unit}</td><td>{r.qty}</td><td>{r.inQty}</td><td>{Math.max(0, Number(r.qty || 0)-Number(r.inQty || 0))}</td><td>{r.price}</td><td>{r.payable}</td><td>{order.arrival}</td><td><Badge tone={r.inQty >= r.qty ? 'g' : 'y'}>{r.inQty >= r.qty ? '已入库' : '部分入库'}</Badge></td></tr>)}</tbody></table></PurchaseSection>}
          {tab === '入库记录' && <PurchaseSection title="入库记录"><OrderRecordTable cols={['序号','来源明细','入库单号','入库类型','入库仓库/库位','入库数量','IQC状态','合格/让步/拒收','入库人','入库时间']} rows={[['1','IQ-20251219001-01','RK-20251221001','采购入库','原料仓/A-01-01','250','已放行','240 / 10 / 0','陈仓','2025-12-22 10:30'],['2','PR-2026-00232-02','RK-20251223003','采购入库','原料仓/B-02-01','120','待复检','100 / 0 / 20','王仓','2025-12-23 15:20']]} /></PurchaseSection>}
          {tab === '三单匹配' && <PurchaseSection title="三单匹配"><OrderRecordTable cols={['序号','来源明细','采购单','入库单','发票号','订单金额','入库金额','到票金额','差异类型','差异金额','匹配状态']} rows={[['1','IQ-20251219001-01',order.code,'RK-20251221001','INV-20251224088','5960.00','5960.00','5960.00','无','0.00','已匹配'],['2','PR-2026-00232-02',order.code,'RK-20251223003','待到票','4200.00','3900.00','0.00','数量/质检扣款','300.00','差异待审']]} /></PurchaseSection>}
          {tab === '应付暂估' && <PurchaseSection title="暂估应付"><OrderRecordTable cols={['序号','来源明细','暂估单号','来源入库','暂估金额','质检扣款','已冲回','可付款金额','账期到期日','状态']} rows={[['1','PR-2026-00232-02','AP-EST-20251223001','RK-20251223003','3800.00','200.00','0.00','3600.00','2026-01-23','有效']]} /></PurchaseSection>}
          {tab === '质检扣款' && <PurchaseSection title="质检扣款"><OrderRecordTable cols={['序号','来源明细','质检单号','问题类型','不合格数量','让步数量','拒收数量','扣款金额','关联入库','处理状态']} rows={[['1','PR-2026-00232-02','QC-20251223009','外观划伤','20','0','20','200.00','RK-20251223003','供应商确认中'],['2','IQ-20251219001-03','QC-20251224002','尺寸偏差','10','5','5','100.00','RK-20251223003','已扣减应付']]} /></PurchaseSection>}
          {tab === '付款记录' && <PurchaseSection title="付款记录"><OrderRecordTable cols={['序号','来源明细','付款申请号','申请金额','可付款金额','本次付款','付款账户','付款条件','付款状态','经办人','付款日期']} rows={[['1','PR-2026-00232-02','PAY-20251224001','5960.00','3600.00','3000.00','招商银行基本户','到票后付款','待财务审核','王会计','2025-12-24']]} /></PurchaseSection>}
          {tab === '到票记录' && <PurchaseSection title="到票记录"><OrderRecordTable cols={['序号','来源明细','发票号码','发票类型','含税金额','税额','认证状态','认证日期','收票人','收票日期']} rows={[['1','IQ-20251219001-01','INV-20251224088','增值税专票','5960.00','684.96','待认证','-','王会计','2025-12-24'],['2','PR-2026-00232-02','INV-20251225016','增值税专票','2100.00','241.59','已认证','2025-12-26','王会计','2025-12-25']]} /></PurchaseSection>}
          {tab === '来源记录' && <PurchaseSection title="来源记录"><OrderRecordTable cols={['序号','来源类型','来源单号','来源明细','来源主题','转单数量','已采购回写','转单人','转单时间']} rows={[['1','询价定价','IQ-20251219001','IQ-20251219001-01','12月物料询价定价','3项','已回写已采购数量','采购员李文涛','2025-12-21 09:10'],['2','请购','PR-2026-00232','PR-2026-00232-02','20240请购购物料00232','1项','待采购数量减少','采购员李文涛','2025-12-21 09:12']]} /></PurchaseSection>}
          {tab === '操作记录' && <PurchaseSection title="操作记录"><OrderRecordTable cols={['序号','操作类型','操作人','操作时间','操作内容']} rows={[['1','创建','采购员李文涛','2025-12-21 09:12','由询价定价单生成采购订单'],['2','审核','采购主管','2025-12-21 11:05','审核通过，等待供应商到货']]} /></PurchaseSection>}
        </Card>
      </div>
    </div>
  );
}

function OrderListScreen({ initialAction, onActionConsumed }) {
  const [view, setView] = useOrderState('list');
  const [detailData, setDetailData] = useOrderState(ORDER_ROWS[0]);

  useOrderEffect(() => {
    if (initialAction === 'new') { setView('new'); onActionConsumed && onActionConsumed(); }
    else if (initialAction === 'list') { setView('list'); onActionConsumed && onActionConsumed(); }
  }, [initialAction]);

  return (
    <div className="aw-doc-page">
      <div className="aw-doc-main">
        {view === 'list' && <OrderListView onNew={() => setView('new')} onView={(row) => { setDetailData(row); setView('detail'); }} />}
        {view === 'new' && <OrderNewView onBack={() => setView('list')} />}
        {view === 'detail' && <OrderDetailView onBack={() => setView('list')} data={detailData} />}
      </div>
    </div>
  );
}

window.OrderListScreen = OrderListScreen;
