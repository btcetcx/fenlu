// ui_kits/erp-console/inquiry-list.jsx
// 询价管理 — 列表 / 添加 / 详情 三态
const { useState: useInquiryState, useEffect: useInquiryEffect } = React;

const INQUIRY_ROWS = [
  { topic:'半成品物料询价', code:'DD-2024-001', product:'半成品物料', qty:8, date:'2025-12-12', deadline:'2025-12-12', state:'询价中', tone:'b' },
  { topic:'铝合金型材询价', code:'DD-2024-002', product:'铝合金型材', qty:12, date:'2025-12-10', deadline:'2025-12-15', state:'询价完毕', tone:'g' },
  { topic:'精密轴承询价', code:'DD-2024-003', product:'精密轴承', qty:30, date:'2025-12-09', deadline:'2025-12-14', state:'待定价', tone:'y' },
  { topic:'包装材料询价', code:'DD-2024-004', product:'外箱包装', qty:100, date:'2025-12-08', deadline:'2025-12-13', state:'已定价', tone:'g' },
  { topic:'化工辅料询价', code:'DD-2024-005', product:'清洗剂', qty:20, date:'2025-12-06', deadline:'2025-12-11', state:'作废', tone:'gray' },
];

const INQUIRY_DETAIL_ROWS = [
  {
    id:'p1',
    code:'7820864',
    name:'半成品物料',
    model:'HM-450',
    category:'半成品',
    unit:'KG',
    qty:8,
    suppliers:[
      { id:'p1-s1', quoteVersion:'V1', supplier:'深圳鑫达电子科技有限公司', temp:false, price:'50.00', taxed:'是', discount:'98%', amount:'392.00', tax:'50.96', delivery:'2025-12-20', minQty:20, purchaseState:'待生成采购' },
      { id:'p1-s2', quoteVersion:'V2', supplier:'广州宏业机械配件有限公司', temp:false, price:'48.00', taxed:'是', discount:'100%', amount:'384.00', tax:'49.92', delivery:'2025-12-22', minQty:30, purchaseState:'未采用' },
    ],
  },
  {
    id:'p2',
    code:'5786931',
    name:'铝合金型材',
    model:'AL-20',
    category:'型材',
    unit:'米',
    qty:12,
    suppliers:[
      { id:'p2-s1', quoteVersion:'V1', supplier:'佛山启明金属材料有限公司', temp:true, price:'86.00', taxed:'否', discount:'95%', amount:'980.40', tax:'0.00', delivery:'2025-12-18', minQty:10, purchaseState:'待转正供应商' },
      { id:'p2-s2', quoteVersion:'V1', supplier:'东莞嘉盛工业材料有限公司', temp:true, price:'89.00', taxed:'是', discount:'97%', amount:'1035.96', tax:'134.67', delivery:'2025-12-17', minQty:12, purchaseState:'未采用' },
    ],
  },
];

const INQUIRY_SOURCE_ROWS = [
  {
    id:'src-pr-1', type:'请购明细', code:'PR-2026-00232', title:'20240请购购物料00232',
    date:'2026-06-07',
    products:[
      { productName:'半成品物料', productNo:'7820864', model:'HM-450', categoryName:'半成品', unit:'KG', qty:8, supplier:'深圳鑫达电子科技有限公司' },
      { productName:'铝合金型材', productNo:'8518691', model:'AL-6061', categoryName:'原材料', unit:'KG', qty:12, supplier:'上海博源化工有限公司' },
    ],
  },
  {
    id:'src-plan-1', type:'采购计划', code:'PLAN-2026-06-01', title:'六月原材料询价计划',
    date:'2026-06-01',
    products:[
      { productName:'精密轴承', productNo:'6576642', model:'BR-6205', categoryName:'零部件', unit:'个', qty:30, supplier:'佛山顺德精密五金厂' },
      { productName:'外箱包装', productNo:'6081578', model:'PK-500', categoryName:'包装材料', unit:'个', qty:100, supplier:'东莞华美包装制品厂' },
    ],
  },
  {
    id:'src-stock-1', type:'库存补货', code:'STOCK-LOW-202606', title:'低库存物料补货询价',
    date:'2026-06-03',
    products:[
      { productName:'清洗剂', productNo:'CL-2026-001', model:'25L', categoryName:'化工辅料', unit:'桶', qty:20, supplier:'上海博源化工有限公司' },
    ],
  },
];

function getFormalSuppliersForProduct(product = {}) {
  const map = {
    '7820864': ['深圳鑫达电子科技有限公司', '广州宏业机械配件有限公司'],
    '8518691': ['上海博源化工有限公司', '佛山启明金属材料有限公司'],
    '6576642': ['佛山顺德精密五金厂', '广州宏业机械配件有限公司'],
    '6081578': ['东莞华美包装制品厂', '青岛海工包装材料商行'],
    'CL-2026-001': ['上海博源化工有限公司'],
  };
  const names = map[product.productNo] || [product.supplier || '深圳鑫达电子科技有限公司'];
  return names.filter(Boolean).map((supplier, idx) => ({
    id: `${Date.now()}-${product.productNo || idx}-formal-${idx}`,
    sourceLine:'供应商档案',
    quoteVersion:`V${idx + 1}`,
    supplier,
    temp:false,
    price:'',
    taxed:'是',
    discount:'',
    amount:'',
    tax:'',
    delivery:'',
    minQty:'',
  }));
}

function getInquirySourceText(s = {}) {
  return s.sourceLine || (s.temp ? '临时供应商' : '供应商档案');
}

function getInquirySourceLabel(s, index) {
  return `${index + 1} / ${getInquirySourceText(s)}`;
}

function InquiryTitleField({ value, onChange, onPick }) {
  return (
    <div style={{display:'flex',alignItems:'center',height:32,border:'1px solid var(--aw-border-strong)',background:'#fff'}}>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="手动输入询价主题"
        style={{flex:1,minWidth:0,border:0,outline:'none',padding:'0 10px',height:'100%',font:'inherit',fontSize:13,background:'transparent'}}
      />
      <button
        type="button"
        title="选择询价来源"
        onClick={onPick}
        style={{width:34,height:30,border:0,borderLeft:'1px solid var(--aw-divider)',background:'#fff',cursor:'pointer',color:'var(--aw-primary)',fontSize:16}}
      >⌕</button>
    </div>
  );
}

function InquirySourcePickerModal({ onClose, onConfirm }) {
  const [sourceType, setSourceType] = useInquiryState('请购明细');
  const [selectedId, setSelectedId] = useInquiryState('');
  const rows = INQUIRY_SOURCE_ROWS.filter(r => r.type === sourceType);
  const selected = INQUIRY_SOURCE_ROWS.find(r => r.id === selectedId);
  return (
    <div className="aw-mask" onClick={onClose}>
      <div className="aw-modal" style={{width:'min(860px,94vw)',maxHeight:'85vh'}} onClick={e => e.stopPropagation()}>
        <div className="head"><span>选择询价来源</span><span style={{cursor:'pointer',color:'var(--aw-fg-4)'}} onClick={onClose}>✕</span></div>
        <div className="body" style={{padding:0}}>
          <div style={{display:'grid',gridTemplateColumns:'180px 1fr',minHeight:430}}>
            <div style={{borderRight:'1px solid var(--aw-border)',padding:'8px',background:'var(--aw-surface-2)'}}>
              {['请购明细','采购计划','库存补货'].map(t => (
                <div key={t} className={'aw-tree-row aw-tree-l2' + (sourceType === t ? ' on' : '')} onClick={() => { setSourceType(t); setSelectedId(''); }}>
                  <span className="aw-tree-caret">{sourceType === t ? '▾' : ''}</span>
                  <TileIcon name={t === '请购明细' ? 'cart' : t === '采购计划' ? 'calendar' : 'warehouse'} size={14} />
                  <span>{t}</span>
                </div>
              ))}
            </div>
            <div style={{display:'flex',flexDirection:'column',minWidth:0}}>
              <div style={{padding:'12px 16px',borderBottom:'1px solid var(--aw-divider)',fontSize:13,color:'var(--aw-fg-3)'}}>
                当前来源：<span style={{color:'var(--aw-primary)',fontWeight:500}}>{sourceType}</span>
              </div>
              <div className="aw-doc-tbl-inner" style={{flex:1}}>
                <table className="aw-doc-tbl">
                  <thead><tr><th style={{width:46}}></th><th style={{width:160}}><div className="aw-th-inner">来源编号</div></th><th><div className="aw-th-inner">来源主题</div></th><th style={{width:120}}><div className="aw-th-inner">来源日期</div></th><th style={{width:100}}><div className="aw-th-inner">产品数</div></th></tr></thead>
                  <tbody>{rows.map(row => (
                    <tr key={row.id} onClick={() => setSelectedId(row.id)} style={{cursor:'pointer',background:selectedId === row.id ? 'var(--aw-primary-soft)' : undefined}}>
                      <td style={{textAlign:'center',background:selectedId === row.id ? 'var(--aw-primary-soft)' : undefined}}><input type="radio" checked={selectedId === row.id} onChange={() => setSelectedId(row.id)} /></td>
                      <td className="aw-num">{row.code}</td><td className="aw-link">{row.title}</td><td className="aw-num">{row.date}</td><td className="aw-num">{row.products.length}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="foot"><Btn onClick={onClose}>取消</Btn><Btn kind="primary" onClick={() => selected && onConfirm(selected)}>确定</Btn></div>
      </div>
    </div>
  );
}

function InquiryToolbar({ onNew }) {
  return (
    <PurchaseListToolbar
      searchPlaceholder="全局搜索（如询价主题、编号、产品）"
      newLabel="新增询价"
      onNew={onNew}
    />
  );
}

function InquiryListView({ onNew, onView }) {
  const [sel, setSel] = useInquiryState({});
  const [statusFilter, setStatusFilter] = useInquiryState('');
  const rows = statusFilter ? INQUIRY_ROWS.filter(r => r.state === statusFilter) : INQUIRY_ROWS;
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
      <InquiryToolbar onNew={onNew} />
      <div className="aw-doc-tbl-wrap">
        <div className="aw-doc-tbl-inner">
          <table className="aw-doc-tbl">
            <thead>
              <tr>
                <PurchaseSelectHeader checked={allChecked} indeterminate={someChecked} onToggle={toggleAll} />
                <PurchaseIndexHeader />
                <th style={{width:210}}><div className="aw-th-inner">询价主题</div></th>
                <th style={{width:150}}><div className="aw-th-inner">询价编号</div></th>
                <th style={{width:160}}><div className="aw-th-inner">询价产品</div></th>
                <th style={{width:100}}><div className="aw-th-inner">询价数量</div></th>
                <th style={{width:120}}><div className="aw-th-inner">询价日期</div></th>
                <th style={{width:120}}><div className="aw-th-inner">截止日期</div></th>
                <PurchaseStatusFilterHeader label="询价状态" value={statusFilter} onChange={setStatusFilter} options={['询价中','询价完毕','待定价','已定价','作废']} />
                <th style={{width:70}}><div className="aw-th-inner">操作</div></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.code} onClick={() => onView(r)} style={{cursor:'pointer'}}>
                  <PurchaseSelectCell checked={!!sel[i]} onToggle={() => toggleRow(i)} />
                  <td className="aw-num">{i + 1}</td>
                  <td className="aw-link">{r.topic}</td>
                  <td className="aw-num">{r.code}</td>
                  <td>{r.product}</td>
                  <td className="aw-link">{r.qty}</td>
                  <td className="aw-num">{r.date}</td>
                  <td className="aw-num">{r.deadline}</td>
                  <td><span className={'aw-state aw-state-' + r.tone}>{r.state}</span></td>
                  <td><span className="aw-link" onClick={e => { e.stopPropagation(); onView(r); }}>查看</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <PurchaseListFooter
        total={INQUIRY_ROWS.length}
        selectedCount={Object.values(sel).filter(Boolean).length}
        allChecked={allChecked}
        someChecked={someChecked}
        onToggleAll={toggleAll}
        pages={3}
      />
    </>
  );
}

function InquiryNewView({ onBack }) {
  const [rows, setRows] = useInquiryState([]);
  const [picker, setPicker] = useInquiryState(false);
  const [title, setTitle] = useInquiryState('');
  const [sourcePicker, setSourcePicker] = useInquiryState(false);
  const addProducts = (products) => {
    setRows(prev => [
      ...prev,
      ...products.map((p, idx) => ({
        id: `${Date.now()}-${idx}`,
        productName: p.productName,
        productNo: p.productNo,
        model: p.model,
        categoryName: p.categoryName,
        unit: p.unit,
        qty: '',
        suppliers: getFormalSuppliersForProduct(p),
      }))
    ]);
    setPicker(false);
  };
  const handleSourcePick = (source) => {
    setTitle(source.title);
    setRows(source.products.map((p, idx) => ({
      id: `${source.id}-${idx}`,
      sourceDoc: source.code,
      productName: p.productName,
      productNo: p.productNo,
      model: p.model,
      categoryName: p.categoryName,
      unit: p.unit,
      qty: p.qty,
      suppliers: getFormalSuppliersForProduct(p),
    })));
    setSourcePicker(false);
  };
  const removeRow = (id) => setRows(prev => prev.filter(r => r.id !== id));
  const addSupplier = (rowId) => setRows(prev => prev.map(row => row.id === rowId ? {
    ...row,
    suppliers: [...row.suppliers, { id: `${Date.now()}-${row.suppliers.length}`, sourceLine:'临时供应商', quoteVersion:`V${row.suppliers.length + 1}`, supplier: '', temp:true, price: '', taxed: '是', discount: '', amount: '', tax: '', delivery: '', minQty: '' }]
  } : row));
  const removeSupplier = (rowId, supplierId) => setRows(prev => prev.map(row => row.id === rowId ? {
    ...row,
    suppliers: row.suppliers.length > 1 ? row.suppliers.filter(s => s.id !== supplierId) : row.suppliers
  } : row));

  return (
    <PurchaseFormPage onBack={onBack}>
        <PurchaseSection title="基础信息">
          <div className="aw-doc-grid" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
            <Field label="询价主题" req><InquiryTitleField value={title} onChange={setTitle} onPick={() => setSourcePicker(true)} /></Field>
            <Field label="询价编号"><Input defaultValue="自动生成" disabled /></Field>
            <Field label="截止日期"><Input placeholder="请选择" /></Field>
          </div>
        </PurchaseSection>
        <PurchaseSection title="询价明细">
          <div style={{overflow:'auto'}}>
            <table className="aw-table">
              <thead>
                <tr>
                  <th style={{width:42}}>序号</th>
                  <th style={{width:90}}>图片</th>
                  <th style={{width:140}}>产品名称</th>
                  <th style={{width:120}}>产品编号</th>
                  <th style={{width:120}}>产品型号</th>
                  <th style={{width:120}}>产品分类</th>
                  <th style={{width:90}}>标准单位</th>
                  <th style={{width:90}}>数量</th>
                  <th style={{width:140}}>来源明细</th>
                  <th style={{width:140}}>供应商</th>
                  <th style={{width:110}}>供应商类型</th>
                  <th style={{width:90}}>报价版本</th>
                  <th style={{width:90}}>单价</th>
                  <th style={{width:90}}>是否含税</th>
                  <th style={{width:80}}>折扣</th>
                  <th style={{width:90}}>金额</th>
                  <th style={{width:80}}>税额</th>
                  <th style={{width:110}}>交货期</th>
                  <th style={{width:110}}>最小采购量</th>
                  <th style={{width:120}}>采购生成</th>
                  <th style={{width:80}}>操作</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <React.Fragment key={r.id}>
                    <tr style={{background:'var(--aw-surface-2)'}}>
                      <td colSpan={20}>
                        <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
                          <span className="aw-num" style={{minWidth:22}}>{i + 1}</span>
                          <span style={{color:'var(--aw-fg-3)',fontSize:12}}>产品名称</span><Input defaultValue={r.productName || ''} style={{width:150}} />
                          <span style={{color:'var(--aw-fg-3)',fontSize:12}}>产品编号</span><Input defaultValue={r.productNo || ''} style={{width:120}} />
                          <span style={{color:'var(--aw-fg-3)',fontSize:12}}>产品型号</span><Input defaultValue={r.model || ''} style={{width:120}} />
                          <span style={{color:'var(--aw-fg-3)',fontSize:12}}>产品分类</span><Input defaultValue={r.categoryName || ''} style={{width:120}} />
                          <span style={{color:'var(--aw-fg-3)',fontSize:12}}>标准单位</span><Input defaultValue={r.unit || ''} readOnly style={{width:80,background:'#F5F6FA'}} />
                          <span style={{color:'var(--aw-fg-3)',fontSize:12}}>数量</span><Input placeholder="0" type="number" defaultValue={r.qty || ''} style={{width:90}} />
                        </div>
                      </td>
                      <PurchaseDetailActions onDelete={() => removeRow(r.id)} />
                    </tr>
                    {r.suppliers.map((s, si) => (
                      <tr key={s.id}>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td><Input value={getInquirySourceLabel(s, si)} readOnly style={{width:'100%',background:'#F5F6FA'}} /></td>
                        <td><Input placeholder="选择供应商" defaultValue={s.supplier} style={{width:'100%'}} /></td>
                        <td><Input value={s.temp ? '临时供应商' : '正式供应商'} readOnly style={{width:'100%',background:'#F5F6FA'}} /></td>
                        <td><Input placeholder="V1" defaultValue={s.quoteVersion || 'V1'} style={{width:'100%'}} /></td>
                        <td><Input placeholder="0.00" defaultValue={s.price} style={{width:'100%'}} /></td>
                        <td><Select defaultValue={s.taxed} style={{width:'100%'}}><option>是</option><option>否</option></Select></td>
                        <td><Input placeholder="%" defaultValue={s.discount} style={{width:'100%'}} /></td>
                        <td><Input placeholder="0.00" defaultValue={s.amount} style={{width:'100%'}} /></td>
                        <td><Input placeholder="0.00" defaultValue={s.tax} style={{width:'100%'}} /></td>
                        <td><Input placeholder="请选择" defaultValue={s.delivery} style={{width:'100%'}} /></td>
                        <td><Input placeholder="0" defaultValue={s.minQty} style={{width:'100%'}} /></td>
                        <td><Input value="待定价" readOnly style={{width:'100%',background:'#F5F6FA'}} /></td>
                        <td><span className="aw-link" style={{color:'var(--aw-danger)'}} onClick={() => removeSupplier(r.id, s.id)}>删除</span></td>
                      </tr>
                    ))}
                    <tr>
                      <td></td>
                      <td></td>
                      <td colSpan={19}><span className="aw-link" onClick={() => addSupplier(r.id)}>+ 新增供应商</span><span style={{marginLeft:12,color:'var(--aw-fg-3)',fontSize:12}}>非建档供应商会进入供应商库「临时供应商」，转正后才可设为物料主供应商。</span></td>
                    </tr>
                  </React.Fragment>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={21} style={{textAlign:'center',color:'var(--aw-fg-3)',padding:'28px 12px'}}>暂无询价明细，点击「新增明细」选择产品</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <PurchaseAddDetailButton onClick={() => setPicker(true)} />
        </PurchaseSection>
        <PurchaseSection title="询价备注">
          <PurchaseRichText />
        </PurchaseSection>
      {picker && <ProductPickerModal onClose={() => setPicker(false)} onConfirm={addProducts} />}
      {sourcePicker && <InquirySourcePickerModal onClose={() => setSourcePicker(false)} onConfirm={handleSourcePick} />}
    </PurchaseFormPage>
  );
}

function InquiryKV({ label, value }) {
  return <div style={{display:'flex',gap:18}}><span style={{width:90,flex:'none',color:'var(--aw-fg-2)'}}>{label}</span><span>：{value}</span></div>;
}

function InquiryDetailView({ onBack, data }) {
  const inq = data || INQUIRY_ROWS[0];
  const [tab, setTab] = useInquiryState('info');
  const [status, setStatus] = useInquiryState(inq.state);
  const [pricedQuote, setPricedQuote] = useInquiryState('');
  const finishInquiry = (quoteId) => {
    setPricedQuote(quoteId);
    setStatus('已定价');
  };
  return (
    <div className="aw-doc-form">
      <div className="aw-doc-form-body">
        <DetailHeaderCard
          title={inq.topic}
          status={status}
          onBack={onBack}
          detailItems={[
            ['询价编号', inq.code],
            ['询价日期', inq.date],
            ['截止日期', inq.deadline],
            ['询价产品', inq.product],
          ]}
        />
        <Card>
          <Tabs items={[{k:'info',label:'询价信息'},{k:'detail',label:'询价明细'},{k:'log',label:'操作记录'}]} active={tab} onChange={setTab} />
          {tab === 'info' && (
            <>
              <div className="section-title">基础信息</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',rowGap:16,columnGap:80,fontSize:13,marginBottom:22}}><InquiryKV label="询价主题" value={inq.topic} /><InquiryKV label="询价编号" value={inq.code} /><InquiryKV label="询价日期" value={inq.date} /><InquiryKV label="截止日期" value={inq.deadline} /><InquiryKV label="询价产品" value={inq.product} /><InquiryKV label="询价状态" value={status} /></div>
              <div className="section-title" style={{marginTop:18}}>询价备注</div><div style={{fontSize:13,color:'var(--aw-fg-3)',lineHeight:1.7,marginBottom:16}}>请供应商在截止日期前反馈含税价、交期和最小采购量。完成定价后，系统保存来源明细、供应商类型、报价版本和采购生成状态；临时供应商必须转正后才允许设为主供应商或长期默认供应商。</div>
              <div className="section-title">附件</div><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>{[1,2,3].map(i=><div key={i} style={{border:'1px dashed var(--aw-border-strong)',borderRadius:6,padding:'12px 14px',background:'#fff'}}><div style={{fontSize:13,fontWeight:500,marginBottom:6}}>新建文本文档.PDF</div><div style={{fontSize:11,color:'var(--aw-fg-4)'}}>文件大小：0 Bytes</div><div style={{fontSize:11,color:'var(--aw-fg-4)',marginTop:2}}>上传日期：2024-08-1 17:45:27</div><div style={{display:'flex',gap:14,marginTop:14,fontSize:12}}><span className="aw-link">查看</span><span className="aw-link">下载</span></div></div>)}</div>
            </>
          )}
          {tab === 'detail' && (
            <div style={{overflow:'auto', paddingTop:18}}>
              <table className="aw-doc-tbl">
                <thead>
                  <tr>
                    <th style={{width:54}}><div className="aw-th-inner">序号</div></th>
                    <th style={{width:110}}><div className="aw-th-inner">产品编号</div></th>
                    <th style={{width:130}}><div className="aw-th-inner">产品名称</div></th>
                    <th style={{width:110}}><div className="aw-th-inner">产品型号</div></th>
                    <th style={{width:100}}><div className="aw-th-inner">分类</div></th>
                    <th style={{width:90}}><div className="aw-th-inner">标准单位</div></th>
                    <th style={{width:80}}><div className="aw-th-inner">数量</div></th>
                    <th style={{width:150}}><div className="aw-th-inner">来源明细</div></th>
                    <th style={{width:190}}><div className="aw-th-inner">供应商</div></th>
                    <th style={{width:110}}><div className="aw-th-inner">供应商类型</div></th>
                    <th style={{width:90}}><div className="aw-th-inner">报价版本</div></th>
                    <th style={{width:90}}><div className="aw-th-inner">单价</div></th>
                    <th style={{width:90}}><div className="aw-th-inner">是否含税</div></th>
                    <th style={{width:80}}><div className="aw-th-inner">折扣</div></th>
                    <th style={{width:90}}><div className="aw-th-inner">金额</div></th>
                    <th style={{width:80}}><div className="aw-th-inner">税额</div></th>
                    <th style={{width:110}}><div className="aw-th-inner">交货期</div></th>
                    <th style={{width:110}}><div className="aw-th-inner">最小采购量</div></th>
                    <th style={{width:120}}><div className="aw-th-inner">采购生成</div></th>
                    <th style={{width:90}}><div className="aw-th-inner">操作</div></th>
                  </tr>
                </thead>
                <tbody>
                  {INQUIRY_DETAIL_ROWS.map((r, i) => (
                    <React.Fragment key={r.id}>
                      <tr style={{background:'var(--aw-surface-2)'}}>
                        <td colSpan={20}>
                          <div style={{display:'flex',alignItems:'center',gap:18,flexWrap:'wrap'}}>
                            <span className="aw-num">{i + 1}</span>
                            <span>产品编号：<span className="aw-num">{r.code}</span></span>
                            <span>产品名称：{r.name}</span>
                            <span>产品型号：{r.model}</span>
                            <span>分类：{r.category}</span>
                            <span>标准单位：{r.unit}</span>
                            <span>数量：<span className="aw-num">{r.qty}</span></span>
                          </div>
                        </td>
                      </tr>
                      {r.suppliers.map((s, si) => (
                        <tr key={s.id}>
                          <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                          <td>{getInquirySourceLabel(s, si)}</td>
                          <td>{s.supplier}</td>
                          <td>{s.temp ? <span className="aw-state aw-state-b">临时</span> : <span className="aw-state aw-state-g">正式</span>}</td>
                          <td>{s.quoteVersion}</td>
                          <td className="aw-num">{s.price}</td>
                          <td>{s.taxed}</td>
                          <td>{s.discount}</td>
                          <td className="aw-num">{s.amount}</td>
                          <td className="aw-num">{s.tax}</td>
                          <td className="aw-num">{s.delivery}</td>
                          <td className="aw-num">{s.minQty}</td>
                          <td>{pricedQuote === s.id ? <span className="aw-state aw-state-y">{s.temp ? '待转正供应商' : '待生成采购'}</span> : s.purchaseState}</td>
                          <td>{pricedQuote === s.id ? <span className="aw-state aw-state-g">已定价</span> : <span className="aw-link" onClick={() => finishInquiry(s.id)}>定价</span>}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {tab === 'log' && <div style={{fontSize:13,color:'var(--aw-fg-3)',textAlign:'center',padding:'34px 0'}}>暂无操作记录</div>}
        </Card>
      </div>
    </div>
  );
}

function InquiryListScreen({ initialAction, onActionConsumed }) {
  const [view, setView] = useInquiryState('list');
  const [detail, setDetail] = useInquiryState(INQUIRY_ROWS[0]);
  useInquiryEffect(() => { if (initialAction === 'new') { setView('new'); onActionConsumed && onActionConsumed(); } }, [initialAction]);
  return <div className="aw-doc-page"><div className="aw-doc-main">{view === 'list' && <InquiryListView onNew={() => setView('new')} onView={(r)=>{setDetail(r);setView('detail');}} />}{view === 'new' && <InquiryNewView onBack={() => setView('list')} />}{view === 'detail' && <InquiryDetailView onBack={() => setView('list')} data={detail} />}</div></div>;
}

window.InquiryListScreen = InquiryListScreen;
