// ui_kits/erp-console/customer-list.jsx
// 客户管理 — 列表 / 新增 / 详情 三态
const { useState: useCustomerState, useEffect: useCustomerEffect } = React;

const CUSTOMER_ROWS = [
  { name:'海南星海智能制造有限公司', group:'重点客户', contact:'林悦', position:'采购经理', phone:'13800138001', address:'海南省海口市龙华区滨海大道88号', manager:'老夏', creditLimit:'200000.00', creditUsed:'68000.00', creditHold:'32000.00', receivable:'36000.00', available:'64000.00', term:'月结30天', risk:'正常', state:'已审核', tone:'g' },
  { name:'深圳市启明科技有限公司', group:'战略客户', contact:'何志远', position:'运营总监', phone:'13900139002', address:'深圳市南山区科技园北区', manager:'李文涛', creditLimit:'500000.00', creditUsed:'420000.00', creditHold:'42600.00', receivable:'18600.00', available:'18800.00', term:'月结45天', risk:'临近额度', state:'跟进中', tone:'b' },
  { name:'广州南方装备有限公司', group:'普通客户', contact:'苏婉清', position:'项目负责人', phone:'13700137003', address:'广州市黄埔区科学城开源大道', manager:'陈思源', creditLimit:'80000.00', creditUsed:'0.00', creditHold:'0.00', receivable:'0.00', available:'80000.00', term:'现结', risk:'待授信', state:'待审核', tone:'y' },
  { name:'东莞华美包装制品厂', group:'渠道客户', contact:'赵一鸣', position:'总经理', phone:'13600136004', address:'东莞市松山湖工业园', manager:'赵强', creditLimit:'0.00', creditUsed:'0.00', creditHold:'0.00', receivable:'0.00', available:'0.00', term:'停止赊销', risk:'停用', state:'已停用', tone:'gray' },
];

function CustomerTree({ picked, setPicked }) {
  const groups = [
    { k:'all', label:'全部客户', count:CUSTOMER_ROWS.length },
    { k:'重点客户', label:'重点客户', count:CUSTOMER_ROWS.filter(r => r.group === '重点客户').length },
    { k:'战略客户', label:'战略客户', count:CUSTOMER_ROWS.filter(r => r.group === '战略客户').length },
    { k:'普通客户', label:'普通客户', count:CUSTOMER_ROWS.filter(r => r.group === '普通客户').length },
    { k:'渠道客户', label:'渠道客户', count:CUSTOMER_ROWS.filter(r => r.group === '渠道客户').length },
  ];
  return (
    <div className="aw-doc-tree">
      <div className="aw-doc-tree-h">客户库 <span className="aw-doc-tree-n">({CUSTOMER_ROWS.length})</span></div>
      <div className="aw-doc-tree-list">
        <div className={'aw-tree-row aw-tree-l2' + (picked === 'all' ? ' on' : '')} onClick={() => setPicked('all')}>
          <span className="aw-tree-caret"></span>
          <TileIcon name="user" size={14} />
          <span style={{flex:1}}>全部客户</span>
          <span className="aw-doc-tree-n">({CUSTOMER_ROWS.length})</span>
        </div>

        <div className="aw-tree-row aw-tree-l2" style={{cursor:'default',color:'var(--aw-fg-1)',fontWeight:600,background:'transparent'}}>
          <span className="aw-tree-caret">▾</span>
          <TileIcon name="folder" size={14} />
          <span>客户分组</span>
        </div>
        {groups.slice(1).map(g => (
          <div key={g.k} className={'aw-tree-row aw-tree-l3' + (picked === g.k ? ' on' : '')} onClick={() => setPicked(g.k)}>
            <TileIcon name="doc" size={13} />
            <span style={{flex:1}}>{g.label}</span>
            <span className="aw-doc-tree-n">({g.count})</span>
          </div>
        ))}

      </div>
    </div>
  );
}

function CustomerToolbar({ onNew }) {
  return (
    <PurchaseListToolbar
      searchPlaceholder="全局搜索（如客户名称、联系人、客户经理）"
      newLabel="新增客户"
      onNew={onNew}
    />
  );
}

function CustomerListView({ onNew, onView, picked }) {
  const [sel, setSel] = useCustomerState({});
  const rows = picked && picked !== 'all' ? CUSTOMER_ROWS.filter(r => r.group === picked) : CUSTOMER_ROWS;
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
      <CustomerToolbar onNew={onNew} />
      <div className="aw-doc-tbl-wrap">
        <div className="aw-doc-tbl-inner">
          <table className="aw-doc-tbl" style={{whiteSpace:'nowrap'}}>
            <thead>
              <tr>
                <PurchaseSelectHeader checked={allChecked} indeterminate={someChecked} onToggle={toggleAll} />
                <PurchaseIndexHeader />
                <th style={{width:220}}><div className="aw-th-inner">客户名称</div></th>
                <th style={{width:120}}><div className="aw-th-inner">客户分组</div></th>
                <th style={{width:100}}><div className="aw-th-inner">主联系人</div></th>
                <th style={{width:110}}><div className="aw-th-inner">职位</div></th>
                <th style={{width:130}}><div className="aw-th-inner">联系方式</div></th>
                <th style={{width:120}}><div className="aw-th-inner">信用额度</div></th>
                <th style={{width:120}}><div className="aw-th-inner">已用额度</div></th>
                <th style={{width:120}}><div className="aw-th-inner">占用额度</div></th>
                <th style={{width:120}}><div className="aw-th-inner">应收未收</div></th>
                <th style={{width:120}}><div className="aw-th-inner">可用额度</div></th>
                <th style={{width:110}}><div className="aw-th-inner">账期</div></th>
                <th style={{width:100}}><div className="aw-th-inner">信用状态</div></th>
                <th style={{width:110}}><div className="aw-th-inner">客户经理</div></th>
                <th style={{width:90}}><div className="aw-th-inner">操作</div></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.name} onClick={() => onView(r)} style={{cursor:'pointer'}}>
                  <PurchaseSelectCell checked={!!sel[i]} onToggle={() => toggleRow(i)} />
                  <td className="aw-num">{i + 1}</td>
                  <td className="aw-link">{r.name}</td>
                  <td>{r.group}</td>
                  <td>{r.contact}</td>
                  <td>{r.position}</td>
                  <td className="aw-num">{r.phone}</td>
                  <td className="aw-num">{r.creditLimit}</td>
                  <td className="aw-num">{r.creditUsed}</td>
                  <td className="aw-num">{r.creditHold}</td>
                  <td className="aw-num">{r.receivable}</td>
                  <td className="aw-num">{r.available}</td>
                  <td>{r.term}</td>
                  <td>{r.risk}</td>
                  <td>{r.manager}</td>
                  <td><span className="aw-link" onClick={e => { e.stopPropagation(); onView(r); }}>查看</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <PurchaseListFooter
        total={CUSTOMER_ROWS.length}
        selectedCount={Object.values(sel).filter(Boolean).length}
        allChecked={allChecked}
        someChecked={someChecked}
        onToggleAll={toggleAll}
        pages={3}
      />
    </>
  );
}

function CustomerNewView({ onBack }) {
  const [tab, setTab] = useCustomerState('contact');
  const [contactRows, setContactRows] = useCustomerState([{ id: 1, isDefault: true }]);
  const [addressRows, setAddressRows] = useCustomerState([{ id: 1, isDefault: true }]);
  const [invoiceRows, setInvoiceRows] = useCustomerState([{ id: 1, isDefault: true }]);
  const [paymentType, setPaymentType] = useCustomerState('cash');
  const [managerName, setManagerName] = useCustomerState('');
  const [showManagerPicker, setShowManagerPicker] = useCustomerState(false);
  const addRow = (setter) => setter(rows => [...rows, { id: Date.now(), isDefault: rows.length === 0 }]);
  const removeRow = (setter, id) => setter(rows => rows.length > 1 ? rows.filter(row => row.id !== id) : rows);
  const setDefaultRow = (setter, id) => setter(rows => rows.map(row => ({ ...row, isDefault: row.id === id })));
  const handlePickManager = (persons) => {
    setManagerName((persons || []).map(p => p.name).join('、'));
    setShowManagerPicker(false);
  };

  return (
    <PurchaseFormPage onBack={onBack}>
      <PurchaseSection title="基础信息">
        <div className="aw-doc-grid" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
          <Field label="客户名称" req><Input placeholder="请输入客户全称" /></Field>
          <Field label="客户分类" req><Select><option>请选择</option><option>重点客户</option><option>战略客户</option><option>普通客户</option><option>渠道客户</option></Select></Field>
          <Field label="客户经理" req>
            <div style={{display:'flex',gap:8}}>
              <Input value={managerName} placeholder="点击绑定销售人员" readOnly onClick={() => setShowManagerPicker(true)} style={{cursor:'pointer'}} />
              <button type="button" className="aw-btn" onClick={() => setShowManagerPicker(true)}>绑定销售人员</button>
            </div>
          </Field>
          <Field label="拼音码"><Input placeholder="根据客户名称自动生成，可手动修改" /></Field>
          <Field label="信用代码"><Input placeholder="请输入统一社会信用代码" /></Field>
          <Field label="客户编号"><Input defaultValue="系统自动生成" disabled /></Field>
          <Field label="客户等级"><Select><option>请选择</option><option>A级</option><option>B级</option><option>C级</option></Select></Field>
          <Field label="所属行业"><Select><option>请选择</option><option>智能制造</option><option>电子科技</option><option>装备制造</option><option>包装材料</option></Select></Field>
          <Field label="信用管控"><Select><option>正常放行</option><option>临近额度提醒</option><option>超额拦截</option><option>停止赊销</option></Select></Field>
        </div>
      </PurchaseSection>

      <PurchaseSection title="客户信息">
        <Tabs
          items={[
            {k:'contact',label:'联系人信息'},
            {k:'finance',label:'财务信息'},
            {k:'address',label:'地址信息'},
            {k:'attach',label:'附件信息'},
          ]}
          active={tab}
          onChange={setTab}
        />
        {tab === 'contact' && (
          <>
            <table className="aw-table">
              <thead><tr><th style={{width:60}}>序号</th><th>联系人</th><th>职位</th><th>联系方式</th><th>邮箱</th><th style={{width:90}}>默认</th><th style={{width:90}}>操作</th></tr></thead>
              <tbody>
                {contactRows.map((row, i) => (
                  <tr key={row.id}>
                    <td>{i + 1}</td>
                    <td><Input placeholder="请输入联系人姓名" /></td>
                    <td><Input placeholder="请输入职位" /></td>
                    <td><Input placeholder="请输入手机号/电话" /></td>
                    <td><Input placeholder="请输入邮箱" /></td>
                    <td><input type="checkbox" checked={row.isDefault} onChange={() => setDefaultRow(setContactRows, row.id)} /></td>
                    <td><span className="aw-link" style={{color:'var(--aw-danger)'}} onClick={() => removeRow(setContactRows, row.id)}>删除</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <PurchaseAddDetailButton onClick={() => addRow(setContactRows)}>+ 新增联系人</PurchaseAddDetailButton>
          </>
        )}
        {tab === 'address' && (
          <>
            <table className="aw-table">
              <thead><tr><th style={{width:60}}>序号</th><th>地址类型</th><th>省市区</th><th>详细地址</th><th>收件人</th><th>联系电话</th><th style={{width:90}}>默认</th><th style={{width:90}}>操作</th></tr></thead>
              <tbody>
                {addressRows.map((row, i) => (
                  <tr key={row.id}>
                    <td>{i + 1}</td>
                    <td><Select style={{width:'100%'}}><option>收货地址</option><option>开票地址</option><option>办公地址</option></Select></td>
                    <td><Input placeholder="请选择省市区" /></td>
                    <td><Input placeholder="请输入详细地址" /></td>
                    <td><Input placeholder="请输入收件人" /></td>
                    <td><Input placeholder="请输入联系电话" /></td>
                    <td><input type="checkbox" checked={row.isDefault} onChange={() => setDefaultRow(setAddressRows, row.id)} /></td>
                    <td><span className="aw-link" style={{color:'var(--aw-danger)'}} onClick={() => removeRow(setAddressRows, row.id)}>删除</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <PurchaseAddDetailButton onClick={() => addRow(setAddressRows)}>+ 新增地址</PurchaseAddDetailButton>
          </>
        )}
        {tab === 'finance' && (
          <>
            <div>
              <div className="aw-sub-title">账期设置</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(220px,1fr))',gap:16,margin:'8px 0 18px'}}>
                <div className={'aw-payment-card' + (paymentType==='cash'?' on':'')} onClick={() => setPaymentType('cash')}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span className={'aw-payment-radio' + (paymentType==='cash'?' checked':'')} />
                    <span style={{fontSize:14,fontWeight:600}}>现结</span>
                  </div>
                  <div className="aw-field-hint" style={{marginTop:8}}>交货时即时结清货款</div>
                </div>
                <div className={'aw-payment-card' + (paymentType==='monthly'?' on':'')} onClick={() => setPaymentType('monthly')}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span className={'aw-payment-radio' + (paymentType==='monthly'?' checked':'')} />
                    <span style={{fontSize:14,fontWeight:600}}>月结</span>
                  </div>
                  {paymentType==='monthly' && (
                    <div style={{marginTop:8}}>
                      <Input placeholder="如每月25日结算" style={{width:'100%'}} />
                      <div className="aw-field-hint" style={{marginTop:2}}>每月固定日期统一结款</div>
                    </div>
                  )}
                </div>
                <div className={'aw-payment-card' + (paymentType==='cycle'?' on':'')} onClick={() => setPaymentType('cycle')}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span className={'aw-payment-radio' + (paymentType==='cycle'?' checked':'')} />
                    <span style={{fontSize:14,fontWeight:600}}>周期</span>
                  </div>
                  {paymentType==='cycle' && (
                    <div style={{marginTop:8}}>
                      <Input placeholder="如30、60、90（最多3位数）" style={{width:'100%'}} />
                      <div className="aw-field-hint" style={{marginTop:2}}>按账期天数滚动结款</div>
                    </div>
                  )}
                </div>
                <div className={'aw-payment-card' + (paymentType==='credit'?' on':'')} onClick={() => setPaymentType('credit')}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span className={'aw-payment-radio' + (paymentType==='credit'?' checked':'')} />
                    <span style={{fontSize:14,fontWeight:600}}>额度</span>
                  </div>
                  {paymentType==='credit' && (
                    <div style={{marginTop:8}}>
                      <Input placeholder="如200000" style={{width:'100%'}} />
                      <div className="aw-field-hint" style={{marginTop:2}}>超出额度需提前收款或审批放行</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="aw-sub-title">银行信息</div>
            <table className="aw-table">
              <thead><tr><th style={{width:70}}>默认</th><th style={{width:210}}>银行卡号</th><th style={{width:180}}>账户名称</th><th style={{width:220}}>开户行</th><th style={{width:140}}>账户类型</th><th>备注</th><th style={{width:90}}>操作</th></tr></thead>
              <tbody>
                {invoiceRows.map((row, i) => (
                  <tr key={row.id}>
                    <td><span className={'aw-chk' + (row.isDefault ? ' on' : '')} onClick={() => setDefaultRow(setInvoiceRows, row.id)} /></td>
                    <td><Input placeholder="请输入客户银行账号" style={{width:'100%'}} /></td>
                    <td><Input placeholder="须与开票主体一致" style={{width:'100%'}} /></td>
                    <td><Input placeholder="如：中国工商银行深圳福田支行" style={{width:'100%'}} /></td>
                    <td><Select style={{width:'100%'}}><option>对公账户</option><option>个人账户</option></Select></td>
                    <td><Input placeholder="收款说明" style={{width:'100%'}} /></td>
                    <td><span className="aw-link" style={{color:'var(--aw-danger)'}} onClick={() => removeRow(setInvoiceRows, row.id)}>删除</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{marginTop:10,display:'flex',gap:8,alignItems:'center'}}>
              <button type="button" className="aw-btn" onClick={() => addRow(setInvoiceRows)}>+ 新增银行卡号</button>
              <span style={{fontSize:12,color:'var(--aw-fg-3)'}}>可维护多个收款账户，并指定默认账户</span>
            </div>
          </>
        )}
        {tab === 'attach' && <div style={{border:'1px dashed var(--aw-border-strong)',borderRadius:6,padding:24,textAlign:'center',color:'var(--aw-fg-3)'}}>上传营业执照、资质文件、合同附件</div>}
      </PurchaseSection>

      <PurchaseSection title="客户详情">
        <PurchaseRichText placeholder="请输入客户背景、合作偏好、风险说明等信息" />
      </PurchaseSection>
      {showManagerPicker && <PersonPickerModal onClose={() => setShowManagerPicker(false)} onConfirm={handlePickManager} />}
    </PurchaseFormPage>
  );
}

function CustomerKV({ label, value }) {
  return <div style={{display:'flex',gap:18}}><span style={{width:90,flex:'none',color:'var(--aw-fg-2)'}}>{label}</span><span>：{value}</span></div>;
}

function CustomerDetailView({ onBack, data }) {
  const customer = data || CUSTOMER_ROWS[0];
  const [tab, setTab] = useCustomerState('info');
  const tabs = [
    {k:'info',label:'客户信息'},
    {k:'product',label:'产品记录'},
    {k:'buy',label:'购买记录'},
    {k:'outbound',label:'发货记录'},
    {k:'invoice',label:'开票记录'},
    {k:'pay',label:'回款核销'},
    {k:'after',label:'售后记录'},
    {k:'log',label:'操作记录'},
  ];

  return (
    <div className="aw-doc-form">
      <div className="aw-doc-form-body">
        <DetailHeaderCard
          title={customer.name}
          status={customer.state}
          onBack={onBack}
          detailItems={[
            ['客户分组', customer.group],
            ['主联系人', customer.contact],
            ['联系方式', customer.phone],
            ['客户经理', customer.manager],
          ]}
        />
        <Card>
          <Tabs items={tabs} active={tab} onChange={setTab} />
          {tab === 'info' && (
            <>
              <div className="section-title">基础信息</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',rowGap:16,columnGap:80,fontSize:13}}>
                <CustomerKV label="客户名称" value={customer.name} />
                <CustomerKV label="客户分组" value={customer.group} />
                <CustomerKV label="主联系人" value={customer.contact} />
                <CustomerKV label="职位" value={customer.position} />
                <CustomerKV label="联系方式" value={customer.phone} />
                <CustomerKV label="地址" value={customer.address} />
                <CustomerKV label="客户经理" value={customer.manager} />
                <CustomerKV label="客户状态" value={customer.state} />
                <CustomerKV label="信用额度" value={customer.creditLimit} />
                <CustomerKV label="已用额度" value={customer.creditUsed} />
                <CustomerKV label="占用额度" value={customer.creditHold} />
                <CustomerKV label="应收未收" value={customer.receivable} />
                <CustomerKV label="可用额度" value={customer.available} />
                <CustomerKV label="账期" value={customer.term} />
                <CustomerKV label="信用状态" value={customer.risk} />
              </div>
            </>
          )}
          {tab === 'product' && <PurchaseSection title="产品记录"><table className="aw-table"><thead><tr><th>序号</th><th>产品编号</th><th>产品名称</th><th>有效报价</th><th>最近成交价</th><th>报价有效期</th></tr></thead><tbody><tr><td>1</td><td>7820864</td><td>半成品物料</td><td>50.00</td><td>49.50</td><td>2026-12-31</td></tr><tr><td>2</td><td>8518691</td><td>铝合金型材</td><td>32.00</td><td>31.80</td><td>2026-06-30</td></tr></tbody></table></PurchaseSection>}
          {tab === 'buy' && <PurchaseSection title="购买记录"><table className="aw-table"><thead><tr><th>序号</th><th>销售订单</th><th>订单金额</th><th>已发货</th><th>应收金额</th><th>订单状态</th></tr></thead><tbody><tr><td>1</td><td>SO-20251221002</td><td>12800.00</td><td>6400.00</td><td>6400.00</td><td>已确认</td></tr></tbody></table></PurchaseSection>}
          {tab === 'outbound' && <PurchaseSection title="发货记录"><table className="aw-table"><thead><tr><th>序号</th><th>发货单</th><th>销售订单</th><th>发货金额</th><th>生成应收</th><th>物流状态</th></tr></thead><tbody><tr><td>1</td><td>DLV-20251222001</td><td>SO-20251221002</td><td>6400.00</td><td>AR-20251222001</td><td>已签收</td></tr></tbody></table></PurchaseSection>}
          {tab === 'invoice' && <PurchaseSection title="开票记录"><table className="aw-table"><thead><tr><th>序号</th><th>开票申请</th><th>销售订单</th><th>申请金额</th><th>发票状态</th><th>申请日期</th></tr></thead><tbody><tr><td>1</td><td>INV-REQ-20251224001</td><td>SO-20251221002</td><td>6400.00</td><td>已开票</td><td>2025-12-24</td></tr></tbody></table></PurchaseSection>}
          {tab === 'pay' && <PurchaseSection title="回款核销"><table className="aw-table"><thead><tr><th>序号</th><th>回款单</th><th>收款金额</th><th>核销订单</th><th>核销金额</th><th>未核销</th></tr></thead><tbody><tr><td>1</td><td>RCV-20251226001</td><td>5000.00</td><td>SO-20251221002</td><td>5000.00</td><td>1400.00</td></tr></tbody></table></PurchaseSection>}
          {tab === 'after' && <PurchaseSection title="售后记录"><table className="aw-table"><thead><tr><th>序号</th><th>售后单号</th><th>来源订单</th><th>来源发货单</th><th>处理方式</th><th>退款/调整金额</th><th>红冲状态</th><th>处理状态</th></tr></thead><tbody><tr><td>1</td><td>ARR-202505-001</td><td>SO-20251221002</td><td>DLV-20251222001</td><td>退款退货</td><td>2800.00</td><td>待红冲</td><td>待退货入库</td></tr></tbody></table></PurchaseSection>}
          {tab === 'log' && <PurchaseSection title="操作记录"><table className="aw-table"><thead><tr><th>序号</th><th>操作</th><th>操作人</th><th>操作时间</th><th>内容</th></tr></thead><tbody><tr><td>1</td><td>授信调整</td><td>财务主管</td><td>2025-12-20 10:12</td><td>额度调整为 {customer.creditLimit}，账期 {customer.term}</td></tr></tbody></table></PurchaseSection>}
        </Card>
      </div>
    </div>
  );
}

function CustomerListScreen({ initialAction, onActionConsumed }) {
  const [view, setView] = useCustomerState('list');
  const [detail, setDetail] = useCustomerState(CUSTOMER_ROWS[0]);
  const [picked, setPicked] = useCustomerState('all');

  useCustomerEffect(() => {
    if (initialAction === 'new') { setView('new'); onActionConsumed && onActionConsumed(); }
    else if (initialAction === 'list') { setView('list'); onActionConsumed && onActionConsumed(); }
  }, [initialAction]);

  return (
    <div className="aw-doc-page">
      {view === 'list' && <CustomerTree picked={picked} setPicked={setPicked} />}
      <div className="aw-doc-main">
        {view === 'list' && <CustomerListView picked={picked} onNew={() => setView('new')} onView={(row) => { setDetail(row); setView('detail'); }} />}
        {view === 'new' && <CustomerNewView onBack={() => setView('list')} />}
        {view === 'detail' && <CustomerDetailView onBack={() => setView('list')} data={detail} />}
      </div>
    </div>
  );
}

window.CustomerListScreen = CustomerListScreen;
