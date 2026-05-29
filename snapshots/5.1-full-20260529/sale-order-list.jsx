// ui_kits/erp-console/sale-order-list.jsx
// 销售中心 — 订单列表 / 添加订单 / 订单详情
const { useState: useSaleOrderState, useEffect: useSaleOrderEffect } = React;

const SALE_ORDER_ROWS = [
  { topic:'荣某定制', code:'SO-20251221001', source:'报价 SP-20251221001', contract:'非必须', customer:'傲为', amount:'5960.00', credit:'通过', creditHold:'已占用', receivable:'5960.00', invoiceReq:'已申请', received:'3000.00', state:'审核中', tone:'b', date:'2025-12-21', delivery:'2025-12-21', owner:'傲为', progress:'已发货', progressTone:'g' },
  { topic:'合同：88888', code:'SO-20251221002', source:'合同 HT-20251220001', contract:'已校验', customer:'深圳市启明科技有限公司', amount:'12800.00', credit:'临近额度', creditHold:'已占用', receivable:'6400.00', invoiceReq:'待申请', received:'0.00', state:'已确认', tone:'g', date:'2025-12-20', delivery:'2026-01-05', owner:'张国', progress:'发货中', progressTone:'b' },
  { topic:'项目55555', code:'SO-20251221003', source:'项目 PRJ-2026-05555', contract:'已校验', customer:'上海泽远制造有限公司', amount:'6800.00', credit:'现结待收', creditHold:'未占用', receivable:'6800.00', invoiceReq:'未申请', received:'6800.00', state:'生产中', tone:'y', date:'2025-12-19', delivery:'2026-01-12', owner:'陈思源', progress:'已完成', progressTone:'g' },
  { topic:'年度补货订单', code:'SO-20251221004', source:'手动创建', contract:'待补合同', customer:'广州明德贸易有限公司', amount:'4320.00', credit:'通过', creditHold:'已占用', receivable:'0.00', invoiceReq:'未申请', received:'0.00', state:'已批准', tone:'g', date:'2025-12-18', delivery:'2026-01-10', owner:'李文涛', progress:'生产中', progressTone:'y' },
  { topic:'零星配件订单', code:'SO-20251221005', source:'手动创建', contract:'非必须', customer:'东莞华辰科技有限公司', amount:'980.40', credit:'信用拦截', exception:'信用拦截', creditHold:'未占用', receivable:'0.00', invoiceReq:'未申请', received:'0.00', state:'草稿', tone:'gray', date:'2025-12-17', delivery:'2026-01-03', owner:'老夏', progress:'未发货', progressTone:'gray' },
];

const SALE_ORDER_DETAIL_ROWS = [
  { id:'d1', productNo:'7820864', productName:'半成品物料', model:'规格一', unit:'米', price:'53', qty:200, amount:'10600.00', shipped:50, unshipped:150, returned:0, planQty:150, delivery:'2024-06-07', note:'' },
  { id:'d2', productNo:'5786931', productName:'半成品物料', model:'规格一', unit:'米', price:'53', qty:200, amount:'10600.00', shipped:50, unshipped:150, returned:0, planQty:150, delivery:'2024-06-07', note:'' },
  { id:'d3', productNo:'8518691', productName:'半成品物料', model:'规格一', unit:'米', price:'53', qty:200, amount:'10600.00', shipped:50, unshipped:150, returned:0, planQty:150, delivery:'2024-06-07', note:'' },
  { id:'d4', productNo:'6576642', productName:'半成品物料', model:'规格一', unit:'米', price:'53', qty:200, amount:'10600.00', shipped:50, unshipped:150, returned:0, planQty:150, delivery:'2024-06-07', note:'' },
  { id:'d5', productNo:'6081578', productName:'半成品物料', model:'规格一', unit:'米', price:'53', qty:200, amount:'10600.00', shipped:50, unshipped:150, returned:0, planQty:150, delivery:'2024-06-07', note:'' },
];

const SALE_ORDER_SOURCE_ROWS = [
  {
    id:'quote-1',
    type:'报价单',
    title:'荣某定制',
    code:'SP-20251221001',
    customer:'傲为',
    contact:'张国',
    address:'北京市 北京市 天竺区天竺路XX街道232号',
    delivery:'2025-12-21',
    products:[
      { id:'src-qp1', sourceLine:'SP-20251221001-01', priceSource:'报价 SP-20251221001 / V1', productNo:'7820864', productName:'半成品物料', model:'HM-450', unit:'KG', price:'50.00', qty:'3', amount:'150.00', delivery:'2025-12-21', discount:'0' },
      { id:'src-qp2', sourceLine:'SP-20251221001-02', priceSource:'报价 SP-20251221001 / V1', productNo:'5786931', productName:'半成品物料', model:'HM-451', unit:'KG', price:'48.00', qty:'2', amount:'96.00', delivery:'2025-12-21', discount:'0' },
    ],
  },
  {
    id:'contract-1',
    type:'合同',
    title:'合同：88888',
    code:'HT-20251220001',
    customer:'深圳市启明科技有限公司',
    contact:'何志远',
    address:'深圳市南山区科技园北区',
    delivery:'2026-01-05',
    products:[
      { id:'src-cp1', sourceLine:'HT-20251220001-01', priceSource:'合同 HT-20251220001', productNo:'8518691', productName:'铝合金型材', model:'AL-6061', unit:'KG', price:'32.00', qty:'20', amount:'640.00', delivery:'2026-01-05', discount:'20' },
    ],
  },
  {
    id:'project-1',
    type:'项目',
    title:'项目55555',
    code:'PRJ-2026-05555',
    customer:'上海泽远制造有限公司',
    contact:'陆晨',
    address:'上海市浦东新区张江高科园区',
    delivery:'2026-01-12',
    products:[
      { id:'src-pp1', sourceLine:'PRJ-2026-05555-01', priceSource:'项目报价确认', productNo:'6576642', productName:'精密轴承', model:'BR-6205', unit:'个', price:'18.00', qty:'10', amount:'180.00', delivery:'2026-01-12', discount:'0' },
    ],
  },
];

const SALE_ORDER_CUSTOMERS = [
  { id:'c1', name:'傲为', group:'重点客户', contact:'张国', phone:'15623596547', address:'北京市 北京市 天竺区天竺路XX街道232号', manager:'傲为', payMethod:'月结30天', creditLimit:'200000.00', creditUsed:'68000.00', creditStatus:'通过', freightPay:'客户支付', deliveryMode:'自动出库' },
  { id:'c2', name:'深圳市启明科技有限公司', group:'战略客户', contact:'何志远', phone:'13900139002', address:'深圳市南山区科技园北区', manager:'李文涛', payMethod:'月结45天', creditLimit:'500000.00', creditUsed:'420000.00', creditStatus:'临近额度', freightPay:'我方承担', deliveryMode:'自动出库' },
  { id:'c3', name:'上海泽远制造有限公司', group:'普通客户', contact:'陆晨', phone:'13800138008', address:'上海市浦东新区张江高科园区', manager:'陈思源', payMethod:'现结', creditLimit:'0.00', creditUsed:'0.00', creditStatus:'现结待收', freightPay:'到付', deliveryMode:'手动出库' },
  { id:'c4', name:'广州明德贸易有限公司', group:'渠道客户', contact:'苏婉清', phone:'13700137003', address:'广州市黄埔区科学城开源大道', manager:'赵强', payMethod:'月结15天', creditLimit:'80000.00', creditUsed:'26000.00', creditStatus:'通过', freightPay:'客户支付', deliveryMode:'自动出库' },
  { id:'c5', name:'东莞华美包装制品厂', group:'渠道客户', contact:'赵一鸣', phone:'13600136004', address:'东莞市松山湖工业园', manager:'赵强', payMethod:'停止赊销', creditLimit:'0.00', creditUsed:'0.00', creditStatus:'已停用', freightPay:'客户支付', deliveryMode:'手动出库', disabled:true },
];

function SaleOrderToolbar({ onNew }) {
  return (
    <PurchaseListToolbar
      searchPlaceholder="全局搜索（如订单主题、订单号、客户）"
      newLabel="添加订单"
      onNew={onNew}
    />
  );
}

function SaleOrderListView({ onNew, onView }) {
  const [sel, setSel] = useSaleOrderState({});
  const [statusFilter, setStatusFilter] = useSaleOrderState('');
  const [progressFilter, setProgressFilter] = useSaleOrderState('');
  const rows = SALE_ORDER_ROWS.filter(r => {
    if (statusFilter && r.state !== statusFilter) return false;
    if (progressFilter && r.progress !== progressFilter) return false;
    return true;
  });
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
      <SaleOrderToolbar onNew={onNew} />
      <div className="aw-doc-tbl-wrap">
        <div className="aw-doc-tbl-inner">
          <table className="aw-doc-tbl" style={{whiteSpace:'nowrap'}}>
            <thead>
              <tr>
                <PurchaseSelectHeader checked={allChecked} indeterminate={someChecked} onToggle={toggleAll} />
                <PurchaseIndexHeader />
                <th style={{width:170}}><div className="aw-th-inner">订单主题</div></th>
                <th style={{width:150}}><div className="aw-th-inner">订单号</div></th>
                <th style={{width:150}}><div className="aw-th-inner">订单来源</div></th>
                <th style={{width:170}}><div className="aw-th-inner">客户</div></th>
                <th style={{width:120}}><div className="aw-th-inner">订单金额</div></th>
                <th style={{width:100}}><div className="aw-th-inner">信用校验</div></th>
                <th style={{width:100}}><div className="aw-th-inner">信用占用</div></th>
                <th style={{width:110}}><div className="aw-th-inner">应收金额</div></th>
                <th style={{width:100}}><div className="aw-th-inner">开票申请</div></th>
                <th style={{width:110}}><div className="aw-th-inner">已回款</div></th>
                <PurchaseStatusFilterHeader label="订单状态" value={statusFilter} onChange={setStatusFilter} options={['草稿','审核中','已批准','已确认','生产中','已取消']} />
                <th style={{width:100}}><div className="aw-th-inner">异常标签</div></th>
                <th style={{width:120}}><div className="aw-th-inner">下单日期</div></th>
                <th style={{width:120}}><div className="aw-th-inner">交货日期</div></th>
                <th style={{width:110}}><div className="aw-th-inner">销售人员</div></th>
                <PurchaseStatusFilterHeader label="订单进展" value={progressFilter} onChange={setProgressFilter} options={['未发货','部分发货','发货中','已发货','已完成','生产中']} />
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
                  <td>{r.source}</td>
                  <td>{r.customer}</td>
                  <td className="aw-num">{r.amount}</td>
                  <td>{r.credit}</td>
                  <td>{r.creditHold}</td>
                  <td className="aw-num">{r.receivable}</td>
                  <td>{r.invoiceReq}</td>
                  <td className="aw-num">{r.received}</td>
                  <td><span className={'aw-state aw-state-' + r.tone}>{r.state}</span></td>
                  <td>{r.exception ? <span className="aw-state aw-state-y">{r.exception}</span> : '-'}</td>
                  <td className="aw-num">{r.date}</td>
                  <td className="aw-num">{r.delivery}</td>
                  <td>{r.owner}</td>
                  <td><span className={'aw-state aw-state-' + r.progressTone}>{r.progress}</span></td>
                  <td><span className="aw-link" onClick={e => { e.stopPropagation(); onView(r); }}>查看</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <PurchaseListFooter
        total={SALE_ORDER_ROWS.length}
        selectedCount={Object.values(sel).filter(Boolean).length}
        allChecked={allChecked}
        someChecked={someChecked}
        onToggleAll={toggleAll}
        pages={3}
      />
    </>
  );
}

const SALE_ORDER_PAY_HELP = [
  '支付方式根据客户支付账期设定自动带入，可更改选择。',
  '现结：先验证付款，再进行发货。',
  '月结/周期：设定日期内无需验证付款。',
  '额度：在一定额度内无需验证付款。',
];
const SALE_ORDER_DELIVERY_HELP = [
  '自动出库：满足出库条件时，自动生成出库单。',
  '手动出库：手动发起出库单进行出库。',
];

function SaleOrderProgressNote() {
  return (
    <table className="aw-table" style={{marginTop:12}}>
      <tbody>
        <tr><td style={{width:110,fontWeight:600}}>订单进展</td><td></td></tr>
        <tr><td>部分发货</td><td>扣减部分库存，保留未出库数量继续跟进。</td></tr>
        <tr><td>已发货</td><td>扣减全部库存，进入收款与开票跟进。</td></tr>
        <tr><td>已完成</td><td>结清尾款，订单归档；开票完成后关闭订单。</td></tr>
      </tbody>
    </table>
  );
}

function SaleOrderTitleField({ value, onChange, onPick }) {
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

function SaleCustomerField({ value, onPick }) {
  return (
    <div style={{display:'flex',alignItems:'center',height:32,border:'1px solid var(--aw-border-strong)',background:'#fff'}}>
      <input
        value={value || ''}
        readOnly
        onClick={onPick}
        placeholder="请选择客户"
        style={{flex:1,minWidth:0,border:0,outline:'none',padding:'0 10px',height:'100%',font:'inherit',fontSize:13,background:'transparent',cursor:'pointer'}}
      />
      <button
        type="button"
        title="选择客户"
        onClick={onPick}
        style={{width:34,height:30,border:0,borderLeft:'1px solid var(--aw-divider)',background:'#fff',cursor:'pointer',color:'var(--aw-primary)',fontSize:16}}
      >⌕</button>
    </div>
  );
}

function SaleOrderVariantPickerModal({ products, onClose, onConfirm }) {
  const [rows, setRows] = useSaleOrderState(() => (products || []).map((p, idx) => ({
    id:`variant-${p.productNo || idx}-${idx}`,
    productNo:p.productNo,
    productName:p.productName,
    unit:p.unit,
    price:p.price ? Number(p.price).toFixed(2) : '',
    spec:p.spec || p.model || '标准规格',
    attr:'常规属性',
  })));
  const update = (id, key, value) => setRows(prev => prev.map(row => row.id === id ? { ...row, [key]: value } : row));

  return (
    <div className="aw-mask" onClick={onClose}>
      <div className="aw-modal xl" style={{width:'min(980px,94vw)'}} onClick={e => e.stopPropagation()}>
        <div className="head">
          <span>选择规格与属性</span>
          <button className="aw-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="body">
          <div style={{fontSize:12,color:'var(--aw-fg-3)',marginBottom:12}}>同一产品可能存在多规格、多属性，请确认后再生成订单产品明细。</div>
          <table className="aw-table">
            <thead>
              <tr><th style={{width:60}}>序号</th><th>产品编号</th><th>产品名称</th><th>规格</th><th>属性</th><th>单位</th><th>单价</th></tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.id}>
                  <td>{idx + 1}</td>
                  <td className="aw-num">{row.productNo}</td>
                  <td>{row.productName}</td>
                  <td>
                    <Select value={row.spec} onChange={e => update(row.id, 'spec', e.target.value)} style={{width:'100%'}}>
                      <option>{row.spec}</option>
                      <option>标准规格</option>
                      <option>大包装规格</option>
                      <option>定制规格</option>
                    </Select>
                  </td>
                  <td>
                    <Select value={row.attr} onChange={e => update(row.id, 'attr', e.target.value)} style={{width:'100%'}}>
                      <option>常规属性</option>
                      <option>防静电</option>
                      <option>耐高温</option>
                      <option>客户定制</option>
                    </Select>
                  </td>
                  <td>{row.unit}</td>
                  <td><Input value={row.price} onChange={e => update(row.id, 'price', e.target.value)} style={{width:'100%'}} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="foot">
          <button className="aw-btn" onClick={onClose}>取消</button>
          <button className="aw-btn primary" onClick={() => onConfirm(rows)}>确定</button>
        </div>
      </div>
    </div>
  );
}

function SaleOrderSourcePickerModal({ onClose, onConfirm }) {
  const [sourceType, setSourceType] = useSaleOrderState('报价单');
  const [selectedId, setSelectedId] = useSaleOrderState('');
  const rows = SALE_ORDER_SOURCE_ROWS.filter(row => row.type === sourceType);
  const selected = SALE_ORDER_SOURCE_ROWS.find(row => row.id === selectedId);
  return (
    <div className="aw-mask" onClick={onClose}>
      <div className="aw-modal" style={{width:'min(880px,94vw)',maxHeight:'85vh'}} onClick={e => e.stopPropagation()}>
        <div className="head">
          <span>选择订单来源</span>
          <span style={{cursor:'pointer',color:'var(--aw-fg-4)'}} onClick={onClose}>✕</span>
        </div>
        <div className="body" style={{padding:0}}>
          <div style={{display:'grid',gridTemplateColumns:'180px 1fr',minHeight:430}}>
            <div style={{borderRight:'1px solid var(--aw-border)',padding:'8px',background:'var(--aw-surface-2)'}}>
              {['报价单','合同','项目'].map(t => (
                <div key={t} className={'aw-tree-row aw-tree-l2' + (sourceType === t ? ' on' : '')} onClick={() => { setSourceType(t); setSelectedId(''); }}>
                  <span className="aw-tree-caret">{sourceType === t ? '▾' : ''}</span>
                  <TileIcon name={t === '报价单' ? 'tag' : t === '合同' ? 'doc' : 'folder'} size={14} />
                  <span>{t}列表</span>
                </div>
              ))}
            </div>
            <div style={{display:'flex',flexDirection:'column',minWidth:0}}>
              <div style={{padding:'12px 16px',borderBottom:'1px solid var(--aw-divider)',fontSize:13,color:'var(--aw-fg-3)'}}>
                当前来源：<span style={{color:'var(--aw-primary)',fontWeight:500}}>{sourceType}列表</span>
              </div>
              <div className="aw-doc-tbl-inner" style={{flex:1}}>
                <table className="aw-doc-tbl" style={{whiteSpace:'nowrap'}}>
                  <thead>
                    <tr>
                      <th style={{width:46}}></th>
                      <th style={{width:150}}><div className="aw-th-inner">来源编号</div></th>
                      <th><div className="aw-th-inner">来源主题</div></th>
                      <th style={{width:180}}><div className="aw-th-inner">客户</div></th>
                      <th style={{width:120}}><div className="aw-th-inner">交货日期</div></th>
                      <th style={{width:90}}><div className="aw-th-inner">产品数</div></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(row => (
                      <tr key={row.id} onClick={() => setSelectedId(row.id)} style={{cursor:'pointer',background:selectedId === row.id ? 'var(--aw-primary-soft)' : undefined}}>
                        <td style={{textAlign:'center',background:selectedId === row.id ? 'var(--aw-primary-soft)' : undefined}}><input type="radio" checked={selectedId === row.id} onChange={() => setSelectedId(row.id)} /></td>
                        <td className="aw-num">{row.code}</td>
                        <td className="aw-link">{row.title}</td>
                        <td>{row.customer}</td>
                        <td className="aw-num">{row.delivery}</td>
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

function SaleCustomerPickerModal({ onClose, onConfirm }) {
  const [selectedId, setSelectedId] = useSaleOrderState('');
  const selected = SALE_ORDER_CUSTOMERS.find(customer => customer.id === selectedId);
  return (
    <div className="aw-mask" onClick={onClose}>
      <div className="aw-modal" style={{width:'min(820px,94vw)',maxHeight:'82vh'}} onClick={e => e.stopPropagation()}>
        <div className="head">
          <span>选择客户</span>
          <span style={{cursor:'pointer',color:'var(--aw-fg-4)'}} onClick={onClose}>✕</span>
        </div>
        <div className="body" style={{padding:0}}>
          <div className="aw-doc-tbl-inner" style={{maxHeight:430}}>
            <table className="aw-doc-tbl" style={{whiteSpace:'nowrap'}}>
              <thead>
                <tr>
                  <th style={{width:46}}></th>
                  <th><div className="aw-th-inner">客户名称</div></th>
                  <th style={{width:110}}><div className="aw-th-inner">客户分组</div></th>
                  <th style={{width:110}}><div className="aw-th-inner">联系人</div></th>
                  <th style={{width:140}}><div className="aw-th-inner">联系方式</div></th>
                  <th style={{width:110}}><div className="aw-th-inner">客户经理</div></th>
                  <th style={{width:110}}><div className="aw-th-inner">信用额度</div></th>
                  <th style={{width:110}}><div className="aw-th-inner">已用额度</div></th>
                  <th style={{width:110}}><div className="aw-th-inner">账期</div></th>
                  <th style={{width:100}}><div className="aw-th-inner">信用状态</div></th>
                </tr>
              </thead>
              <tbody>
                {SALE_ORDER_CUSTOMERS.map(customer => (
                  <tr key={customer.id} onClick={() => !customer.disabled && setSelectedId(customer.id)} style={{cursor:customer.disabled?'not-allowed':'pointer',background:selectedId === customer.id ? 'var(--aw-primary-soft)' : undefined,opacity:customer.disabled?0.55:1}}>
                    <td style={{textAlign:'center',background:selectedId === customer.id ? 'var(--aw-primary-soft)' : undefined}}><input type="radio" disabled={customer.disabled} checked={selectedId === customer.id} onChange={() => !customer.disabled && setSelectedId(customer.id)} /></td>
                    <td><span className="aw-link">{customer.name}</span>{customer.disabled && <span className="aw-state aw-state-gray" style={{marginLeft:8}}>已停用</span>}</td>
                    <td>{customer.group}</td>
                    <td>{customer.contact}</td>
                    <td className="aw-num">{customer.phone}</td>
                    <td>{customer.manager}</td>
                    <td className="aw-num">{customer.creditLimit}</td>
                    <td className="aw-num">{customer.creditUsed}</td>
                    <td>{customer.payMethod}</td>
                    <td>{customer.creditStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="foot">
          <Btn onClick={onClose}>取消</Btn>
          <Btn kind="primary" onClick={() => selected && !selected.disabled && onConfirm(selected)}>确定</Btn>
        </div>
      </div>
    </div>
  );
}

function SaleOrderProductTable({ rows, setRows, editable = true }) {
  const removeRow = (id) => setRows && setRows(prev => prev.filter(row => row.id !== id));
  const toNumber = (value) => {
    const n = Number(String(value || '').replace(/[^\d.-]/g, ''));
    return Number.isFinite(n) ? n : 0;
  };
  const formatAmount = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n.toFixed(2) : '';
  };
  const updateRow = (id, key, value) => {
    if (!setRows) return;
    setRows(prev => prev.map(row => {
      if (row.id !== id) return row;
      const next = { ...row, [key]: value };
      if (key === 'price' || key === 'qty') {
        const price = toNumber(key === 'price' ? value : next.price);
        const qty = toNumber(key === 'qty' ? value : next.qty);
        next.amount = price && qty ? formatAmount(price * qty) : '';
      }
      return next;
    }));
  };
  const totalQty = rows.reduce((sum, row) => sum + Number(row.qty || 0), 0);
  const totalAmount = rows.reduce((sum, row) => sum + toNumber(row.amount), 0);
  const totalDiscount = rows.reduce((sum, row) => sum + toNumber(row.discount), 0);

  return (
    <div style={{overflow:'auto'}}>
      <table className="aw-table">
        <thead>
          <tr>
            {editable && <th style={{width:42}}></th>}
            <th style={{width:48}}>序号</th>
            <th style={{width:150}}>来源明细</th>
            <th style={{width:110}}>产品编号</th>
            <th style={{width:130}}>产品名称</th>
            <th style={{width:110}}>规格型号</th>
            <th style={{width:70}}>单位</th>
            <th style={{width:90}}>单价</th>
            <th style={{width:90}}>销售数量</th>
            <th style={{width:100}}>合计金额</th>
            {editable ? <th style={{width:110}}>交付日期</th> : <th style={{width:90}}>已出库数量</th>}
            {editable ? <th style={{width:100}}>优惠金额</th> : <th style={{width:90}}>未出库数量</th>}
            {!editable && <th style={{width:90}}>退货数量</th>}
            {!editable && <th style={{width:110}}>计划生产数量</th>}
            {!editable && <th style={{width:110}}>交付日期</th>}
            {!editable && <th style={{width:110}}>备注</th>}
            {editable && <th style={{width:70}}>操作</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.id}>
              {editable && <td style={{textAlign:'center'}}><input type="checkbox" /></td>}
              <td className="aw-num">{idx + 1}</td>
              <td>{row.sourceLine || '手动'}</td>
              <td className="aw-num">{editable ? <Input value={row.productNo || ''} onChange={e => updateRow(row.id, 'productNo', e.target.value)} style={{width:'100%'}} /> : <span className="aw-link">{row.productNo}</span>}</td>
              <td>{editable ? <Input value={row.productName || ''} onChange={e => updateRow(row.id, 'productName', e.target.value)} style={{width:'100%'}} /> : row.productName}</td>
              <td>{editable ? <Input value={row.model || ''} onChange={e => updateRow(row.id, 'model', e.target.value)} style={{width:'100%'}} /> : row.model}</td>
              <td>{editable ? <Input value={row.unit || ''} onChange={e => updateRow(row.id, 'unit', e.target.value)} style={{width:'100%'}} /> : row.unit}</td>
              <td>{editable ? <Input value={row.price || ''} onChange={e => updateRow(row.id, 'price', e.target.value)} style={{width:'100%'}} /> : row.price}</td>
              <td>{editable ? <Input value={row.qty || ''} onChange={e => updateRow(row.id, 'qty', e.target.value)} style={{width:'100%'}} /> : row.qty}</td>
              <td>{editable ? <Input value={row.amount || ''} readOnly style={{width:'100%',background:'#F5F6FA'}} /> : row.amount}</td>
              <td>{editable ? <Input value={row.delivery || ''} onChange={e => updateRow(row.id, 'delivery', e.target.value)} placeholder="请选择" style={{width:'100%'}} /> : row.shipped}</td>
              <td>{editable ? <Input value={row.discount || ''} onChange={e => updateRow(row.id, 'discount', e.target.value)} style={{width:'100%'}} /> : row.unshipped}</td>
              {!editable && <td>{row.returned}</td>}
              {!editable && <td>{row.planQty}</td>}
              {!editable && <td>{row.delivery}</td>}
              {!editable && <td>{row.note}</td>}
              {editable && <td><span className="aw-link" style={{color:'var(--aw-danger)'}} onClick={() => removeRow(row.id)}>删除</span></td>}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={editable ? 13 : 15} style={{textAlign:'center',color:'var(--aw-fg-3)',padding:'28px 12px'}}>暂无产品明细，点击「新增明细」选择产品</td></tr>
          )}
          {rows.length > 0 && (
            <tr>
              <td colSpan={editable ? 13 : 15}>
                <div style={{display:'flex',alignItems:'center',gap:28,whiteSpace:'nowrap'}}>
                  <span>合计</span>
                  <span>总量：<span style={{color:'var(--aw-danger)'}}>{totalQty}</span></span>
                  <span>总金额：<span style={{color:'var(--aw-danger)'}}>{formatAmount(totalAmount)}</span></span>
                  <span>优惠后金额：<span style={{color:'var(--aw-danger)'}}>{formatAmount(totalAmount - totalDiscount)}</span></span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function SaleOrderNewView({ onBack }) {
  const [title, setTitle] = useSaleOrderState('');
  const [source, setSource] = useSaleOrderState(null);
  const [customer, setCustomer] = useSaleOrderState(null);
  const [contact, setContact] = useSaleOrderState('');
  const [address, setAddress] = useSaleOrderState('');
  const [deliveryDate, setDeliveryDate] = useSaleOrderState('');
  const [payMethod, setPayMethod] = useSaleOrderState('');
  const [freightPay, setFreightPay] = useSaleOrderState('');
  const [deliveryMode, setDeliveryMode] = useSaleOrderState('');
  const [creditInfo, setCreditInfo] = useSaleOrderState(null);
  const [rows, setRows] = useSaleOrderState([]);
  const [picker, setPicker] = useSaleOrderState(false);
  const [variantRows, setVariantRows] = useSaleOrderState(null);
  const [showSourcePicker, setShowSourcePicker] = useSaleOrderState(false);
  const [showCustomerPicker, setShowCustomerPicker] = useSaleOrderState(false);
  const openVariantPicker = (products) => {
    setPicker(false);
    setVariantRows(products || []);
  };
  const addProducts = (products) => {
    setRows(prev => [
      ...prev,
      ...products.map((p, idx) => ({
        id:`sale-order-${Date.now()}-${idx}`,
        productNo:p.productNo,
        sourceLine:'手动',
        priceSource:'手动定价',
        productName:p.productName,
        model:p.spec && p.attr ? `${p.spec} / ${p.attr}` : (p.model || p.spec),
        unit:p.unit,
        price:p.price ? Number(p.price).toFixed(2) : '',
        qty:'',
        amount:'',
        delivery:'',
        discount:'',
      }))
    ]);
    setVariantRows(null);
  };
  const applyCustomerDefaults = (pickedCustomer) => {
    if (!pickedCustomer) return;
    setCustomer(pickedCustomer);
    setContact(pickedCustomer.contact || '');
    setAddress(pickedCustomer.address || '');
    setPayMethod(pickedCustomer.payMethod || '');
    setCreditInfo(pickedCustomer);
    setFreightPay(pickedCustomer.freightPay || '');
    setDeliveryMode(pickedCustomer.deliveryMode || '');
  };
  const handleSourcePick = (picked) => {
    const matchedCustomer = SALE_ORDER_CUSTOMERS.find(c => c.name === picked.customer) || {
      name:picked.customer,
      contact:picked.contact || '',
      address:picked.address || '',
      payMethod:'客户账期',
      freightPay:'客户支付',
      deliveryMode:'自动出库',
      creditLimit:'0.00',
      creditUsed:'0.00',
      creditStatus:'待建档',
    };
    setSource(picked);
    setTitle(picked.title);
    applyCustomerDefaults(matchedCustomer);
    setDeliveryDate(picked.delivery || '');
    setRows(picked.products.map((p, idx) => ({ ...p, id:`${picked.id}-${idx}` })));
    setShowSourcePicker(false);
  };
  const handleCustomerPick = (picked) => {
    applyCustomerDefaults(picked);
    setRows([]);
    setShowCustomerPicker(false);
  };

  return (
    <PurchaseFormPage onBack={onBack} submitText="确认">
      <PurchaseSection title="基础信息">
        <div className="aw-doc-grid" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
            <Field label="订单主题" req><SaleOrderTitleField value={title} onChange={(value) => { setTitle(value); setSource(null); }} onPick={() => setShowSourcePicker(true)} /></Field>
            <Field label="订单编号"><Input defaultValue="自动" disabled /></Field>
            <Field label="订单来源"><Input value={source ? `${source.type} / ${source.code}` : '手动输入'} readOnly /></Field>
            <Field label="关联客户" req><SaleCustomerField value={customer?.name || ''} onPick={() => setShowCustomerPicker(true)} /></Field>
            <Field label="交货地址"><Input value={address} onChange={e => setAddress(e.target.value)} placeholder="自动带入可选择" /></Field>
            <Field label="客户联系人"><Input value={contact} onChange={e => setContact(e.target.value)} placeholder="自动带入可选择" /></Field>
            <Field label="交货日期" req><Input value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} placeholder="请选择" /></Field>
            <Field label={<span>支付方式<HelpTip text={SALE_ORDER_PAY_HELP} /></span>}><Input value={payMethod} onChange={e => setPayMethod(e.target.value)} placeholder="从客户档案自动带入" /></Field>
            <Field label="信用额度"><Input value={creditInfo ? `${creditInfo.creditUsed || '0.00'} / ${creditInfo.creditLimit || '0.00'}` : ''} readOnly placeholder="选择客户后自动带入" /></Field>
            <Field label="运费支付"><Select value={freightPay} onChange={e => setFreightPay(e.target.value)}><option value="">从客户档案自动带入</option><option>客户支付</option><option>我方承担</option><option>到付</option></Select></Field>
            <Field label={<span>出库方式<HelpTip text={SALE_ORDER_DELIVERY_HELP} /></span>}><Select value={deliveryMode || '自动出库'} onChange={e => setDeliveryMode(e.target.value)}><option>自动出库</option><option>手动出库</option></Select></Field>
            <Field label={<span>订单状态<HelpTip text="新增订单默认进入草稿或审核中，后续由审批、生产、发货、开票、回款、退换货等动作自动推进，不能在新增页直接选择完成类状态。" /></span>}><Input value={source ? '审核中' : '草稿'} readOnly /></Field>
        </div>
        <div style={{marginTop:12,padding:'10px 12px',border:'1px solid var(--aw-border)',borderRadius:6,background:'var(--aw-surface-2)',fontSize:12,color:'var(--aw-fg-3)',lineHeight:1.7}}>
          信用拦截作为订单异常标签展示，不替代订单主状态；订单确认时系统占用客户信用额度，若额度不足、账期异常或超出信用策略，显示「信用拦截」并进入信用异常审批。
        </div>
      </PurchaseSection>

      <PurchaseSection title="产品明细">
        <SaleOrderProductTable rows={rows} setRows={setRows} editable />
        <PurchaseAddDetailButton onClick={() => setPicker(true)} />
      </PurchaseSection>

      <PurchaseSection title="订单详情">
        <PurchaseRichText placeholder="请输入订单说明、客户要求、交付注意事项等信息" />
      </PurchaseSection>

      <PurchaseSection title="附件">
        <div style={{display:'grid',gridTemplateColumns:'repeat(2, minmax(180px, 1fr))',gap:12}}>
          <div style={{border:'1px solid var(--aw-border)',borderRadius:6,padding:14,background:'#fff'}}>
            <div style={{fontSize:13,fontWeight:500,marginBottom:8}}>新建文本文档.PDF</div>
            <div style={{fontSize:11,color:'var(--aw-fg-4)'}}>文件大小：0 Bytes</div>
            <div style={{fontSize:11,color:'var(--aw-fg-4)',marginTop:4}}>上传日期：2024-08-1 17:45:27</div>
            <div style={{display:'flex',gap:12,marginTop:16,fontSize:12}}><span className="aw-link">重新上传</span><span className="aw-link">删除</span></div>
          </div>
          <div style={{border:'1px dashed var(--aw-border-strong)',borderRadius:6,padding:30,textAlign:'center',color:'var(--aw-fg-3)'}}>
            <span className="aw-link">点击上传</span> / 拖拽到此区域
          </div>
        </div>
      </PurchaseSection>
      {picker && <ProductPickerModal onClose={() => setPicker(false)} onConfirm={openVariantPicker} />}
      {variantRows && <SaleOrderVariantPickerModal products={variantRows} onClose={() => setVariantRows(null)} onConfirm={addProducts} />}
      {showSourcePicker && <SaleOrderSourcePickerModal onClose={() => setShowSourcePicker(false)} onConfirm={handleSourcePick} />}
      {showCustomerPicker && <SaleCustomerPickerModal onClose={() => setShowCustomerPicker(false)} onConfirm={handleCustomerPick} />}
    </PurchaseFormPage>
  );
}

function SaleOrderRecordTable({ cols, rows }) {
  return (
    <div className="aw-doc-tbl-wrap">
      <div className="aw-doc-tbl-inner">
        <table className="aw-doc-tbl" style={{whiteSpace:'nowrap'}}>
          <thead><tr>{cols.map(c => <th key={c}><div className="aw-th-inner">{c}</div></th>)}</tr></thead>
          <tbody>{rows.map((r,i)=><tr key={i}>{r.map((c,j)=><td key={j}>{c}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

function SaleOrderEmptyState({ text, actions }) {
  return (
    <div style={{border:'1px dashed var(--aw-border-strong)',borderRadius:6,padding:'34px 12px',textAlign:'center',color:'var(--aw-fg-3)',background:'#fff'}}>
      <div>{text}</div>
      {actions && <div style={{display:'flex',justifyContent:'center',gap:8,marginTop:14}}>{actions}</div>}
    </div>
  );
}

function SaleOrderDetailView({ onBack, data }) {
  const order = data || SALE_ORDER_ROWS[0];
  const [tab, setTab] = useSaleOrderState('订单信息');
  const tabs = ['订单信息','订单明细','发货应收','开票申请','回款核销','生产记录','退换货记录','操作记录'];
  const tabItems = tabs.map(t => ({ k: t, label: t }));
  const deliveryActionText = order.progress === '已完成'
    ? '已完成'
    : order.progress === '已发货'
      ? '已自动发货'
      : order.progress === '部分发货' || order.progress === '发货中'
        ? '部分发货'
        : '发货';
  const deliveryActionDisabled = ['已完成','已发货'].includes(order.progress);
  const deliveryActionHelp = '发货按钮规则：未发货显示发货，发货中显示部分发货，已发货显示已自动发货，已完成显示已完成';
  return (
    <div className="aw-doc-form">
      <div className="aw-doc-form-body">
        <DetailHeaderCard
          title={`${order.topic} ${order.code}`}
          status={order.state}
          onBack={onBack}
          detailItems={[
            ['订单编号', order.code],
            ['客户', order.customer],
            ['来源', order.source],
            ['下单日期', order.date],
            ['销售人员', order.owner],
            ['订单金额', order.amount],
            ['已回款', order.received],
            ['订单进展', order.progress],
          ]}
        />

        <Card>
          <Tabs items={tabItems} active={tab} onChange={setTab} />
          {tab === '订单信息' ? (
            <>
              <PurchaseSection title="基础信息">
                <div className="aw-kv-grid">
                  {[
                    ['订单主题', order.topic], ['订单编号', order.code],
                    ['订单来源', order.source], ['合同来源', order.contract],
                    ['下单日期', order.date], ['客户', order.customer],
                    ['订单金额', order.amount], ['销售人员', order.owner],
                    ['订单状态', order.state], ['订单进展', order.progress], ['异常标签', order.exception || '-'],
                    ['信用校验', order.credit], ['信用占用', order.creditHold], ['应收金额', order.receivable],
                    ['开票申请', order.invoiceReq], ['已回款', order.received],
                    ['交付日期', order.delivery], ['交货地址','客户默认收货地址 / 可在发货前调整'],
                  ].map(([label, value], idx) => <div className="aw-kv" key={idx}><span>{label}：</span>{value}</div>)}
                </div>
              </PurchaseSection>
              <PurchaseSection title="附件">
                <div style={{display:'grid',gridTemplateColumns:'repeat(3, minmax(180px, 1fr))',gap:12}}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{border:'1px dashed var(--aw-border-strong)',borderRadius:6,padding:14,background:'#fff'}}>
                      <div style={{fontSize:13,fontWeight:500,marginBottom:8}}>新建文本文档.PDF</div>
                      <div style={{fontSize:11,color:'var(--aw-fg-4)'}}>文件大小：0 Bytes</div>
                      <div style={{fontSize:11,color:'var(--aw-fg-4)',marginTop:4}}>上传日期：2024-08-1 17:45:27</div>
                      <div style={{display:'flex',gap:12,marginTop:16,fontSize:12}}><span className="aw-link">查看</span><span className="aw-link">下载</span></div>
                    </div>
                  ))}
                </div>
              </PurchaseSection>
            </>
          ) : null}
          {tab === '订单明细' && <PurchaseSection title="订单明细"><SaleOrderProductTable rows={SALE_ORDER_DETAIL_ROWS} editable={false} /></PurchaseSection>}
          {tab === '发货应收' && <PurchaseSection title="发货生成应收"><SaleOrderRecordTable cols={['序号','来源明细','发货单号','发货仓库/库位','发货数量','OQC状态','发货金额','应收确认点','应收单号','应收金额','物流状态','发货时间']} rows={[['1','SO-20251221001-01','DLV-20251222001','成品仓/A-01-01','50','已放行','3000.00','出库过账','AR-20251222001','3000.00','已签收','2025-12-22 10:30'],['2','SO-20251221001-02','DLV-20251223008','成品仓/B-02-01','120','待OQC','2960.00','出库过账','AR-20251223008','2960.00','运输中','2025-12-23 15:20']]} /></PurchaseSection>}
          {tab === '开票申请' && <PurchaseSection title="开票申请">
            <SaleOrderEmptyState
              text="暂无开票申请。到达应开票节点后，系统按规则自动生成开票申请，初始状态为未开票；财务开票完成后回填为已开票。"
              actions={<button className="aw-btn primary">手动开票申请</button>}
            />
          </PurchaseSection>}
          {tab === '回款核销' && <PurchaseSection title="回款核销"><SaleOrderRecordTable cols={['序号','回款单号','收款金额','收款账户','核销订单','核销明细','核销金额','未核销金额','信用释放','核销状态','收款日期']} rows={[['1','RCV-20251224001','3000.00','招商银行基本户',order.code,'SO-20251221001-01','3000.00','2960.00','已释放3000.00','部分核销','2025-12-24']]} /></PurchaseSection>}
          {tab === '生产记录' && <PurchaseSection title="生产记录"><SaleOrderRecordTable cols={['序号','来源明细','生产需求号','生产订单号','产品名称','计划生产','已生产','待生产','生产状态']} rows={[['1','SO-20251221001-01','MR-20260517001','MO-20260517001','智能温控终端','1600','800','800','生产中']]} /></PurchaseSection>}
          {tab === '退换货记录' && <PurchaseSection title="退换货记录">
            <SaleOrderEmptyState
              text="暂无退换货记录。可从本订单发起退货或换货，后续记录会按售后单据回填。"
              actions={<><button className="aw-btn primary">退货</button><button className="aw-btn">换货</button></>}
            />
          </PurchaseSection>}
          {tab === '操作记录' && <PurchaseSection title="操作记录"><SaleOrderRecordTable cols={['序号','操作类型','操作人','操作时间','操作内容']} rows={[['1','创建','销售员 '+order.owner,'2025-12-21 09:20','创建销售订单并提交审核'],['2','审核','销售主管','2025-12-21 11:10','审核通过，等待出库或生产']]} /></PurchaseSection>}
        </Card>
      </div>
    </div>
  );
}

function SaleOrderListScreen({ initialAction, onActionConsumed }) {
  const [view, setView] = useSaleOrderState('list');
  const [detail, setDetail] = useSaleOrderState(SALE_ORDER_ROWS[0]);

  useSaleOrderEffect(() => {
    if (initialAction === 'new') { setView('new'); onActionConsumed && onActionConsumed(); }
    else if (initialAction === 'list') { setView('list'); onActionConsumed && onActionConsumed(); }
  }, [initialAction]);

  return (
    <div className="aw-doc-page">
      <div className="aw-doc-main" style={{maxWidth:'none'}}>
        {view === 'list' && <SaleOrderListView onNew={() => setView('new')} onView={(row) => { setDetail(row); setView('detail'); }} />}
        {view === 'new' && <SaleOrderNewView onBack={() => setView('list')} />}
        {view === 'detail' && <SaleOrderDetailView onBack={() => setView('list')} data={detail} />}
      </div>
    </div>
  );
}

window.SaleOrderListScreen = SaleOrderListScreen;
