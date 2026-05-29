// 销售中心 — 合同列表 / 添加合同 / 合同详情
const { useState: useContractState, useEffect: useContractEffect } = React;

const CONTRACT_ROWS = [
  { title:'启明年度供货合同', code:'HT-20251220001', customer:'深圳市启明科技有限公司', source:'报价单 SP-20251221002', amount:'128000.00', ordered:'42600.00', shipped:'18600.00', receivable:'18600.00', invoiced:'5960.00', received:'3000.00', balance:'85400.00', signDate:'2025-12-20', expireDate:'2026-12-31', owner:'张国', state:'履约中', tone:'b' },
  { title:'泽远项目合同', code:'HT-20251218003', customer:'上海泽远制造有限公司', source:'项目 PRJ-2026-05555', amount:'68000.00', ordered:'68000.00', shipped:'68000.00', receivable:'68000.00', invoiced:'68000.00', received:'68000.00', balance:'0.00', signDate:'2025-12-18', expireDate:'2026-06-30', owner:'陈思源', state:'履约完成', tone:'g' },
  { title:'明德渠道框架合同', code:'HT-20251215008', customer:'广州明德贸易有限公司', source:'手动创建', amount:'80000.00', ordered:'12000.00', shipped:'0.00', receivable:'0.00', invoiced:'0.00', received:'0.00', balance:'68000.00', signDate:'2025-12-15', expireDate:'2026-03-31', owner:'李文涛', state:'待审批', tone:'y' },
];

const CONTRACT_PRODUCTS = [
  { id:'cp1', sourceLine:'SP-20251221002-01', productNo:'7820864', productName:'半成品物料', model:'HM-450', unit:'KG', price:'50.00', qty:'1200', amount:'60000.00', ordered:'400', balance:'800', delivery:'按订单分批' },
  { id:'cp2', sourceLine:'SP-20251221002-02', productNo:'5786931', productName:'半成品模组', model:'HM-451', unit:'KG', price:'48.00', qty:'1000', amount:'48000.00', ordered:'300', balance:'700', delivery:'按订单分批' },
  { id:'cp3', sourceLine:'手动', productNo:'8518691', productName:'铝合金型材', model:'AL-6061', unit:'KG', price:'32.00', qty:'625', amount:'20000.00', ordered:'0', balance:'625', delivery:'2026-03-31前' },
];

function ContractToolbar({ onNew }) {
  return <PurchaseListToolbar searchPlaceholder="全局搜索（如合同主题、合同编号、客户）" newLabel="添加合同" onNew={onNew} />;
}

function ContractRecordTable({ cols, rows }) {
  return (
    <div className="aw-doc-tbl-wrap">
      <div className="aw-doc-tbl-inner">
        <table className="aw-doc-tbl" style={{whiteSpace:'nowrap'}}>
          <thead><tr>{cols.map(c => <th key={c}><div className="aw-th-inner">{c}</div></th>)}</tr></thead>
          <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

function ContractListView({ onNew, onView }) {
  const [sel, setSel] = useContractState({});
  const [statusFilter, setStatusFilter] = useContractState('');
  const rows = statusFilter ? CONTRACT_ROWS.filter(r => r.state === statusFilter) : CONTRACT_ROWS;
  const allChecked = rows.length > 0 && rows.every((_, i) => sel[i]);
  const someChecked = rows.some((_, i) => sel[i]);
  const toggleAll = () => allChecked ? setSel({}) : setSel(Object.fromEntries(rows.map((_, i) => [i, true])));
  return (
    <>
      <ContractToolbar onNew={onNew} />
      <div className="aw-doc-tbl-wrap">
        <div className="aw-doc-tbl-inner">
          <table className="aw-doc-tbl" style={{whiteSpace:'nowrap'}}>
            <thead><tr>
              <PurchaseSelectHeader checked={allChecked} indeterminate={someChecked} onToggle={toggleAll} />
              <PurchaseIndexHeader />
              <th style={{width:180}}><div className="aw-th-inner">合同主题</div></th>
              <th style={{width:150}}><div className="aw-th-inner">合同编号</div></th>
              <th style={{width:180}}><div className="aw-th-inner">客户</div></th>
              <th style={{width:150}}><div className="aw-th-inner">来源单据</div></th>
              <th style={{width:110}}><div className="aw-th-inner">合同金额</div></th>
              <th style={{width:110}}><div className="aw-th-inner">已下单金额</div></th>
              <th style={{width:110}}><div className="aw-th-inner">已发货金额</div></th>
              <th style={{width:110}}><div className="aw-th-inner">应收金额</div></th>
              <th style={{width:110}}><div className="aw-th-inner">已开票金额</div></th>
              <th style={{width:110}}><div className="aw-th-inner">已回款金额</div></th>
              <th style={{width:110}}><div className="aw-th-inner">剩余金额</div></th>
              <th style={{width:120}}><div className="aw-th-inner">签订日期</div></th>
              <th style={{width:120}}><div className="aw-th-inner">失效日期</div></th>
              <th style={{width:110}}><div className="aw-th-inner">销售人员</div></th>
              <PurchaseStatusFilterHeader label="履约状态" value={statusFilter} onChange={setStatusFilter} options={['待审批','履约中','履约完成','已终止']} />
              <th><div className="aw-th-inner">操作</div></th>
            </tr></thead>
            <tbody>{rows.map((r, i) => <tr key={r.code}>
              <PurchaseSelectCell checked={!!sel[i]} onToggle={() => setSel(s => ({...s, [i]: !s[i]}))} />
              <td className="aw-num">{i + 1}</td>
              <td><span className="aw-link" onClick={() => onView(r)}>{r.title}</span></td><td>{r.code}</td><td>{r.customer}</td><td>{r.source}</td>
              <td className="aw-num">{r.amount}</td><td className="aw-num">{r.ordered}</td><td className="aw-num">{r.shipped}</td><td className="aw-num">{r.receivable}</td><td className="aw-num">{r.invoiced}</td><td className="aw-num">{r.received}</td><td className="aw-num">{r.balance}</td><td>{r.signDate}</td><td>{r.expireDate}</td><td>{r.owner}</td>
              <td><Badge tone={r.tone}>{r.state}</Badge></td><td><span className="aw-link" onClick={() => onView(r)}>查看</span></td>
            </tr>)}</tbody>
          </table>
        </div>
      </div>
      <PurchaseListFooter selected={Object.values(sel).filter(Boolean).length} total={rows.length} />
    </>
  );
}

function ContractCustomerPickerModal({ onClose, onConfirm }) {
  const customers = [
    { code:'CUS-2026-001', name:'深圳市启明科技有限公司', group:'战略客户', contact:'何志远', phone:'13900139002', manager:'李文涛' },
    { code:'CUS-2026-002', name:'海南星海智能制造有限公司', group:'重点客户', contact:'林悦', phone:'13800138001', manager:'老夏' },
    { code:'CUS-2026-003', name:'广州南方装备有限公司', group:'普通客户', contact:'苏婉清', phone:'13700137003', manager:'陈思源' },
    { code:'CUS-2026-004', name:'东莞华美包装制品厂', group:'渠道客户', contact:'赵一鸣', phone:'13600136004', manager:'赵强', disabled:true },
  ];
  const [selected, setSelected] = useContractState(customers[0]);
  return (
    <div className="aw-mask" onClick={onClose}>
      <div className="aw-modal xl" style={{width:'min(960px,94vw)'}} onClick={e => e.stopPropagation()}>
        <div className="head">
          <span>选择客户</span>
          <button className="aw-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="body">
          <div className="aw-doc-search" style={{width:320,marginBottom:12}}><input placeholder="搜索客户名称/编号/联系人" /></div>
          <table className="aw-table">
            <thead><tr><th style={{width:60}}>选择</th><th>客户编号</th><th>客户名称</th><th>客户分组</th><th>联系人</th><th>联系电话</th><th>客户经理</th></tr></thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.code} onClick={() => !c.disabled && setSelected(c)} style={{cursor:c.disabled?'not-allowed':'pointer',background:selected.code === c.code ? 'var(--aw-primary-soft)' : undefined,opacity:c.disabled?0.55:1}}>
                  <td><span className={'aw-chk' + (selected.code === c.code ? ' on' : '')} /></td>
                  <td className="aw-num">{c.code}</td>
                  <td><span className="aw-link">{c.name}</span>{c.disabled && <span className="aw-state aw-state-gray" style={{marginLeft:8}}>已停用</span>}</td>
                  <td>{c.group}</td>
                  <td>{c.contact}</td>
                  <td className="aw-num">{c.phone}</td>
                  <td>{c.manager}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="foot">
          <button className="aw-btn" onClick={onClose}>取消</button>
          <button className="aw-btn primary" disabled={selected?.disabled} onClick={() => selected && !selected.disabled && onConfirm(selected)}>确定</button>
        </div>
      </div>
    </div>
  );
}

function ContractFormView({ onBack }) {
  const quoteOptions = [
    '一次性报价单 SP-20251221004',
    '指定报价单 SP-20251221001',
    '分组报价单 SP-20251221002',
    '促销报价单 SP-20251221003',
    '通用报价单 SP-20251221005',
  ];
  const [source, setSource] = useContractState('');
  const [customer, setCustomer] = useContractState({ name:'', contact:'', phone:'' });
  const [customerPicker, setCustomerPicker] = useContractState(false);
  const [rows, setRows] = useContractState([]);
  const [productPicker, setProductPicker] = useContractState(false);
  const [discountAmount, setDiscountAmount] = useContractState('');
  const update = (id, key, value) => setRows(prev => prev.map(row => row.id === id ? {...row, [key]: value} : row));
  const toAmountNumber = (value) => {
    const n = Number(String(value || '').replace(/[^\d.-]/g, ''));
    return Number.isFinite(n) ? n : 0;
  };
  const contractTotal = rows.reduce((sum, row) => sum + toAmountNumber(row.qty) * toAmountNumber(row.price), 0);
  const discountTotal = toAmountNumber(discountAmount);
  const finalTotal = Math.max(contractTotal - discountTotal, 0);
  const addProducts = (products = []) => {
    setRows(prev => [
      ...prev,
      ...products.map((p, idx) => ({
        id:`contract-product-${Date.now()}-${idx}`,
        sourceLine: source || '手动',
        productNo: p.productNo,
        productName: p.productName,
        model: p.model || p.spec,
        unit: p.unit,
        price: p.price ? Number(p.price).toFixed(2) : '0.00',
        qty: '',
        amount: '0.00',
        delivery: '',
      }))
    ]);
    setProductPicker(false);
  };
  const handleCustomerPick = (row) => {
    setCustomer(row);
    setSource('');
    setCustomerPicker(false);
  };
  return (
    <PurchaseFormPage onBack={onBack} submitText="提交审批">
      <PurchaseSection title="基础信息">
        <FormGrid>
          <Field label="合同主题" req><Input placeholder="填写合同主题" /></Field>
          <Field label="合同编号"><Input defaultValue="自动生成" disabled /></Field>
          <Field label="关联客户" req>
            <div style={{display:'flex',gap:8}}>
              <Input value={customer.name} readOnly placeholder="点击选择客户" onClick={() => setCustomerPicker(true)} style={{cursor:'pointer'}} />
              <button type="button" className="aw-btn" onClick={() => setCustomerPicker(true)}>选择</button>
            </div>
          </Field>
          <Field label={<span>适用报价<HelpTip text="合同允许手动创建或项目来源；只有报价来源合同时才必须选择适用报价。" /></span>}>
            <Select value={source} onChange={e => setSource(e.target.value)} disabled={!customer.name}>
              <option value="">{customer.name ? '不选择报价（手动/项目来源合同）' : '请先选择关联客户'}</option>
              {quoteOptions.map(option => <option key={option}>{option}</option>)}
            </Select>
          </Field>
          <Field label="客户联系人"><Input value={customer.contact} readOnly placeholder="选择客户后自动带出" /></Field>
          <Field label="联系电话"><Input value={customer.phone} readOnly placeholder="选择客户后自动带出" /></Field>
          <Field label="签订日期" req><Input placeholder="选择签订日期" /></Field>
          <Field label="失效日期" req><Input placeholder="选择失效日期" /></Field>
          <Field label={<span>履约状态<HelpTip text="新增合同默认待审批；履约中、履约完成、已终止由审批、订单核销、终止流程自动推进。" /></span>}><Input value="待审批" readOnly /></Field>
        </FormGrid>
      </PurchaseSection>
      <PurchaseSection title="合同产品">
        <div style={{overflow:'auto'}}>
          <table className="aw-table"><thead><tr>{['序号','来源明细','产品编号','产品名称','规格型号','单位','合同数量','单价','交付约定','支付约定','操作'].map(h => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={11} style={{textAlign:'center',color:'var(--aw-fg-3)',padding:'28px 12px'}}>暂无合同产品，点击「新增明细」选择产品</td></tr>}
              {rows.map((r, i) => {
                return <tr key={r.id}><td>{i + 1}</td><td>{r.sourceLine}</td><td>{r.productNo}</td><td>{r.productName}</td><td>{r.model}</td><td>{r.unit}</td><td><Input value={r.qty} onChange={e => update(r.id, 'qty', e.target.value)} /></td><td><Input value={r.price} onChange={e => update(r.id, 'price', e.target.value)} /></td><td><Input value={r.delivery} onChange={e => update(r.id, 'delivery', e.target.value)} placeholder="填写交付批次/日期" /></td><td><Select value={r.payRule || ''} onChange={e => update(r.id, 'payRule', e.target.value)}><option value="">请选择</option><option>签约后预付</option><option>按订单节点付款</option><option>发货后付款</option><option>验收后付款</option><option>月结付款</option></Select></td><td><span className="aw-link" style={{color:'var(--aw-danger)'}} onClick={() => setRows(prev => prev.filter(x => x.id !== r.id))}>删除</span></td></tr>;
              })}
            </tbody>
          </table>
        </div>
        <div style={{display:'flex',justifyContent:'flex-end',alignItems:'center',gap:18,padding:'12px 4px 0',fontSize:13,flexWrap:'wrap'}}>
          <span>合同总金额：<b style={{color:'var(--aw-danger)'}}>{contractTotal.toFixed(2)}</b></span>
          <span style={{display:'inline-flex',alignItems:'center',gap:8}}>
            优惠金额：
            <Input
              value={discountAmount}
              onChange={e => setDiscountAmount(e.target.value)}
              placeholder="填写优惠金额"
              style={{width:120}}
            />
          </span>
          <span>优惠后金额：<b style={{color:'var(--aw-danger)'}}>{finalTotal.toFixed(2)}</b></span>
        </div>
        <PurchaseAddDetailButton onClick={() => setProductPicker(true)} hint="从产品库选择后自动带出产品基本信息和单价" />
      </PurchaseSection>
      <PurchaseSection title="合同详情"><PurchaseRichText placeholder="填写合同条款、交付约束、价格有效规则、违约责任和特殊约定" /></PurchaseSection>
      {customerPicker && <ContractCustomerPickerModal onClose={() => setCustomerPicker(false)} onConfirm={handleCustomerPick} />}
      {productPicker && <ProductPickerModal onClose={() => setProductPicker(false)} onConfirm={addProducts} />}
    </PurchaseFormPage>
  );
}

function ContractDetailView({ row, onBack }) {
  const [tab, setTab] = useContractState('合同信息');
  const tabs = ['合同信息','合同产品','订单核销','发货记录','开票记录','回款记录','操作记录'];
  const tabItems = tabs.map(t => ({ k: t, label: t }));
  return (
    <div className="aw-doc-form">
      <div className="aw-doc-form-body">
        <DetailHeaderCard
          title={row.title}
          status={row.state}
          onBack={onBack}
          detailItems={[
            ['合同编号', row.code],
            ['客户', row.customer],
            ['来源', row.source],
            ['签订日期', row.signDate],
            ['销售人员', row.owner],
            ['合同金额', row.amount],
            ['已回款', row.received],
            ['剩余金额', row.balance],
          ]}
        />

        <Card>
          <Tabs items={tabItems} active={tab} onChange={setTab} />
          {tab === '合同信息' && <PurchaseSection title="基础信息"><div className="aw-kv-grid">{[
            ['合同主题', row.title], ['合同编号', row.code], ['客户', row.customer], ['来源单据', row.source], ['合同金额', row.amount], ['已下单金额', row.ordered], ['已发货金额', row.shipped], ['应收金额', row.receivable], ['已开票金额', row.invoiced], ['已回款金额', row.received], ['剩余金额', row.balance], ['签订日期', row.signDate], ['失效日期', row.expireDate], ['销售人员', row.owner], ['履约状态', <Badge tone={row.tone}>{row.state}</Badge>]
          ].map(([k, v]) => <div className="aw-kv" key={k}><span>{k}：</span>{v}</div>)}</div></PurchaseSection>}
          {tab === '合同产品' && <PurchaseSection title="合同产品"><ContractRecordTable cols={['序号','来源明细','产品编号','产品名称','单位','合同数量','已下单','剩余可下单','单价','金额','支付约定']} rows={CONTRACT_PRODUCTS.map((p, i) => [i + 1, p.sourceLine, p.productNo, p.productName, p.unit, p.qty, p.ordered, p.balance, p.price, p.amount, '按订单节点付款'])} /></PurchaseSection>}
          {tab === '订单核销' && <PurchaseSection title="订单核销"><ContractRecordTable cols={['序号','销售订单','订单明细','核销数量','核销金额','核销时间','状态']} rows={[[1,'SO-20251221002','SO-20251221002-01','300','14400.00','2025-12-21','已核销']]} /></PurchaseSection>}
          {tab === '发货记录' && <PurchaseSection title="发货记录"><ContractRecordTable cols={['序号','发货单','销售订单','发货数量','出库金额','物流状态','时间']} rows={[[1,'DLV-20251222001','SO-20251221002','120','5960.00','运输中','2025-12-22']]} /></PurchaseSection>}
          {tab === '开票记录' && <PurchaseSection title="开票记录"><ContractRecordTable cols={['序号','发票申请','发票号','开票金额','税额','状态']} rows={[[1,'INV-REQ-20251222001','待开票','5960.00','774.80','待开票']]} /></PurchaseSection>}
          {tab === '回款记录' && <PurchaseSection title="回款记录"><ContractRecordTable cols={['序号','收款单','回款金额','核销订单','核销状态','时间']} rows={[[1,'REC-20251223001','3000.00','SO-20251221002','部分核销','2025-12-23']]} /></PurchaseSection>}
          {tab === '操作记录' && <PurchaseSection title="操作记录"><ContractRecordTable cols={['序号','时间','操作人','操作','说明']} rows={[[1,'2025-12-20 10:20','张国','创建合同','从报价单生成合同'],[2,'2025-12-21 09:30','系统','核销','销售订单引用合同明细']]} /></PurchaseSection>}
        </Card>
      </div>
    </div>
  );
}

function ContractListScreen({ initialAction, onActionConsumed }) {
  const [view, setView] = useContractState('list');
  const [detail, setDetail] = useContractState(null);
  useContractEffect(() => {
    if (initialAction === 'new') { setView('new'); onActionConsumed && onActionConsumed(); }
  }, [initialAction]);
  if (view === 'new') return <ContractFormView onBack={() => setView('list')} />;
  if (view === 'detail') return <ContractDetailView row={detail || CONTRACT_ROWS[0]} onBack={() => setView('list')} />;
  return <ContractListView onNew={() => setView('new')} onView={(row) => { setDetail(row); setView('detail'); }} />;
}
