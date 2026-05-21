// ui_kits/erp-console/sales-plan-list.jsx
// 销售中心 — 销售计划 列表 / 添加 / 详情
const { useState: useSalesPlanState, useEffect: useSalesPlanEffect } = React;

const SALES_PLAN_ROWS = [
  { name:'Q2 高精度伺服电机销售计划', code:'SPP-202605001', product:'高精度伺服电机', cycle:'2026-04-01 ~ 2026-06-30', ownerType:'销售一部', owner:'李文涛', qty:120, amount:720000, doneQty:68, doneAmount:408000, rate:57, state:'执行中', tone:'b' },
  { name:'华南半成品物料专项计划', code:'SPP-202605002', product:'半成品物料', cycle:'2026-05-01 ~ 2026-05-31', ownerType:'销售二部', owner:'陈思源', qty:500, amount:25000, doneQty:360, doneAmount:18000, rate:72, state:'执行中', tone:'b' },
  { name:'重点客户铝合金型材计划', code:'SPP-202605003', product:'铝合金型材', cycle:'2026-05-15 ~ 2026-07-15', ownerType:'人员', owner:'赵强', qty:800, amount:25600, doneQty:800, doneAmount:25600, rate:100, state:'已完成', tone:'g' },
  { name:'渠道客户包装材料计划', code:'SPP-202605004', product:'外箱包装', cycle:'2026-06-01 ~ 2026-06-30', ownerType:'渠道组', owner:'苏婉清', qty:2000, amount:9000, doneQty:0, doneAmount:0, rate:0, state:'未开始', tone:'gray' },
];

const SALES_PLAN_PERFORMANCE = [
  { order:'SO-20260517001', customer:'傲为', product:'高精度伺服电机', owner:'李文涛', qty:18, amount:108000, date:'2026-05-04', status:'已发货' },
  { order:'SO-20260517008', customer:'深圳市启明科技有限公司', product:'高精度伺服电机', owner:'李文涛', qty:25, amount:150000, date:'2026-05-11', status:'生产中' },
  { order:'SO-20260517116', customer:'广州明德贸易有限公司', product:'高精度伺服电机', owner:'陈思源', qty:25, amount:150000, date:'2026-05-16', status:'已确认' },
];

function SalesPlanToolbar({ onNew }) {
  return (
    <PurchaseListToolbar
      searchPlaceholder="全局搜索（如计划名称、产品、负责人）"
      newLabel="添加计划"
      onNew={onNew}
    />
  );
}

function SalesPlanListView({ onNew, onView }) {
  const [sel, setSel] = useSalesPlanState({});
  const [statusFilter, setStatusFilter] = useSalesPlanState('');
  const rows = statusFilter ? SALES_PLAN_ROWS.filter(r => r.state === statusFilter) : SALES_PLAN_ROWS;
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
      <SalesPlanToolbar onNew={onNew} />
      <div className="aw-doc-tbl-wrap">
        <div className="aw-doc-tbl-inner">
          <table className="aw-doc-tbl">
            <thead>
              <tr>
                <PurchaseSelectHeader checked={allChecked} indeterminate={someChecked} onToggle={toggleAll} />
                <PurchaseIndexHeader />
                <th style={{width:220}}><div className="aw-th-inner">计划名称</div></th>
                <th style={{width:150}}><div className="aw-th-inner">计划编号</div></th>
                <th style={{width:150}}><div className="aw-th-inner">计划产品</div></th>
                <th style={{width:180}}><div className="aw-th-inner">计划周期</div></th>
                <th style={{width:120}}><div className="aw-th-inner">负责对象</div></th>
                <th style={{width:90}}><div className="aw-th-inner">目标数量</div></th>
                <th style={{width:110}}><div className="aw-th-inner">目标金额</div></th>
                <th style={{width:110}}><div className="aw-th-inner">完成金额</div></th>
                <th style={{width:90}}><div className="aw-th-inner">达成率</div></th>
                <PurchaseStatusFilterHeader label="计划状态" value={statusFilter} onChange={setStatusFilter} options={['未开始','执行中','已完成','已暂停','已关闭']} />
                <th style={{width:90}}><div className="aw-th-inner">操作</div></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.code} onClick={() => onView(r)} style={{cursor:'pointer'}}>
                  <PurchaseSelectCell checked={!!sel[i]} onToggle={() => toggleRow(i)} />
                  <td className="aw-num">{i + 1}</td>
                  <td className="aw-link">{r.name}</td>
                  <td className="aw-num">{r.code}</td>
                  <td>{r.product}</td>
                  <td className="aw-num">{r.cycle}</td>
                  <td>{r.ownerType} / {r.owner}</td>
                  <td className="aw-num">{r.qty}</td>
                  <td className="aw-num">{r.amount.toLocaleString()}</td>
                  <td className="aw-num">{r.doneAmount.toLocaleString()}</td>
                  <td><span className={'aw-state aw-state-' + (r.rate >= 100 ? 'g' : r.rate > 0 ? 'b' : 'gray')}>{r.rate}%</span></td>
                  <td><span className={'aw-state aw-state-' + r.tone}>{r.state}</span></td>
                  <td><span className="aw-link" onClick={e => { e.stopPropagation(); onView(r); }}>查看</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <PurchaseListFooter
        total={SALES_PLAN_ROWS.length}
        selectedCount={Object.values(sel).filter(Boolean).length}
        allChecked={allChecked}
        someChecked={someChecked}
        onToggleAll={toggleAll}
        pages={3}
      />
    </>
  );
}

function SalesPlanDetailTable({ rows, setRows }) {
  const toNumber = (value) => {
    const n = Number(String(value || '').replace(/[^\d.-]/g, ''));
    return Number.isFinite(n) ? n : 0;
  };
  const updateRow = (id, key, value) => {
    setRows(prev => prev.map(row => {
      if (row.id !== id) return row;
      const next = { ...row, [key]: value };
      if (key === 'targetQty' || key === 'unitPrice') {
        const qty = toNumber(key === 'targetQty' ? value : next.targetQty);
        const price = toNumber(key === 'unitPrice' ? value : next.unitPrice);
        next.targetAmount = qty && price ? (qty * price).toFixed(2) : '';
      }
      return next;
    }));
  };
  const removeRow = (id) => setRows(prev => prev.filter(row => row.id !== id));
  const totalQty = rows.reduce((sum, row) => sum + toNumber(row.targetQty), 0);
  const totalAmount = rows.reduce((sum, row) => sum + toNumber(row.targetAmount), 0);

  return (
    <div style={{overflow:'auto'}}>
      <table className="aw-table">
        <thead>
          <tr>
            <th style={{width:52}}>序号</th>
            <th style={{width:130}}>产品编号</th>
            <th style={{width:150}}>产品名称</th>
            <th style={{width:120}}>规格型号</th>
            <th style={{width:80}}>单位</th>
            <th style={{width:110}}>目标数量</th>
            <th style={{width:110}}>计划单价</th>
            <th style={{width:120}}>目标金额</th>
            <th style={{width:120}}>计划交付月</th>
            <th style={{width:90}}>操作</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.id}>
              <td className="aw-num">{idx + 1}</td>
              <td><Input value={row.productNo || ''} onChange={e => updateRow(row.id, 'productNo', e.target.value)} /></td>
              <td><Input value={row.productName || ''} onChange={e => updateRow(row.id, 'productName', e.target.value)} /></td>
              <td><Input value={row.model || ''} onChange={e => updateRow(row.id, 'model', e.target.value)} /></td>
              <td><Input value={row.unit || ''} onChange={e => updateRow(row.id, 'unit', e.target.value)} /></td>
              <td><Input value={row.targetQty || ''} onChange={e => updateRow(row.id, 'targetQty', e.target.value)} placeholder="0" /></td>
              <td><Input value={row.unitPrice || ''} onChange={e => updateRow(row.id, 'unitPrice', e.target.value)} placeholder="0.00" /></td>
              <td><Input value={row.targetAmount || ''} readOnly style={{background:'#F5F6FA'}} /></td>
              <td><Input value={row.planMonth || ''} onChange={e => updateRow(row.id, 'planMonth', e.target.value)} placeholder="如 2026-06" /></td>
              <td><span className="aw-link" style={{color:'var(--aw-danger)'}} onClick={() => removeRow(row.id)}>删除</span></td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={10} style={{textAlign:'center',color:'var(--aw-fg-3)',padding:'28px 12px'}}>暂无计划产品，点击「新增明细」选择产品</td></tr>
          )}
          {rows.length > 0 && (
            <tr>
              <td colSpan={5}>合计</td>
              <td>目标数量：<span style={{color:'var(--aw-danger)'}}>{totalQty}</span></td>
              <td colSpan={2}>目标金额：<span style={{color:'var(--aw-danger)'}}>{totalAmount.toFixed(2)}</span></td>
              <td colSpan={2}></td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function SalesPlanNewView({ onBack }) {
  const [rows, setRows] = useSalesPlanState([]);
  const [picker, setPicker] = useSalesPlanState(false);
  const addProducts = (products) => {
    setRows(prev => [
      ...prev,
      ...products.map((p, idx) => ({
        id:`plan-${Date.now()}-${idx}`,
        productNo:p.productNo,
        productName:p.productName,
        model:p.model || p.spec,
        unit:p.unit,
        targetQty:'',
        unitPrice:p.price ? Number(p.price).toFixed(2) : '',
        targetAmount:'',
        planMonth:'',
      }))
    ]);
    setPicker(false);
  };

  return (
    <PurchaseFormPage onBack={onBack} submitText="提交审批">
      <PurchaseSection title="基础信息">
        <div className="aw-doc-grid" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
          <Field label="计划名称" req><Input placeholder="请输入销售计划名称" /></Field>
          <Field label="计划编号"><Input defaultValue="自动生成" disabled /></Field>
          <Field label={<span>计划状态<HelpTip text="新增销售计划默认待审批；审批通过后进入未开始或执行跟踪，执行中、暂停和关闭由后续动作推进。" /></span>}><Input value="待审批" readOnly /></Field>
          <Field label="计划开始日期" req><Input placeholder="请选择" /></Field>
          <Field label="计划结束日期" req><Input placeholder="请选择" /></Field>
          <Field label="统计口径"><Select defaultValue="按订单确认"><option>按订单确认</option><option>按发货</option><option>按回款</option></Select></Field>
          <Field label="指定方式" req><Select defaultValue="销售部门"><option>销售部门</option><option>具体人员</option></Select></Field>
          <Field label="销售部门"><Select><option>销售一部</option><option>销售二部</option><option>渠道组</option><option>华南大区</option></Select></Field>
          <Field label="销售人员"><Select><option>请选择</option><option>李文涛</option><option>陈思源</option><option>赵强</option><option>苏婉清</option></Select></Field>
          <Field label="客户范围"><Select><option>全部客户</option><option>重点客户</option><option>战略客户</option><option>渠道客户</option></Select></Field>
          <Field label="考核权重"><Input placeholder="如 30%" /></Field>
          <Field label="预警阈值"><Input placeholder="如 低于 70% 预警" /></Field>
        </div>
      </PurchaseSection>

      <PurchaseSection title="计划产品">
        <SalesPlanDetailTable rows={rows} setRows={setRows} />
        <PurchaseAddDetailButton onClick={() => setPicker(true)} />
      </PurchaseSection>

      <PurchaseSection title="计划详情">
        <PurchaseRichText placeholder="请输入计划背景、目标拆解、执行策略、风险说明等信息" />
      </PurchaseSection>
      {picker && <ProductPickerModal onClose={() => setPicker(false)} onConfirm={addProducts} />}
    </PurchaseFormPage>
  );
}

function PlanKV({ label, value }) {
  return <div><span style={{color:'var(--aw-fg-3)'}}>{label}：</span>{value}</div>;
}

function SalesPlanDetailView({ onBack, data }) {
  const plan = data || SALES_PLAN_ROWS[0];
  const [tab, setTab] = useSalesPlanState('计划信息');
  const [trackDimension, setTrackDimension] = useSalesPlanState('amount');
  const tabs = ['计划信息','业绩追踪','销售明细','操作记录'];
  const gapQty = Math.max(plan.qty - plan.doneQty, 0);
  const gapAmount = Math.max(plan.amount - plan.doneAmount, 0);
  const relatedPeople = Array.from(new Set([plan.owner, ...SALES_PLAN_PERFORMANCE.map(row => row.owner)]));
  const trackRows = {
    amount: [
      { k:'2026-04', target:'240,000', done:'132,000', rate:'55%', people:'李文涛', trend:'低于计划' },
      { k:'2026-05', target:'240,000', done:'276,000', rate:'115%', people:'李文涛、陈思源', trend:'超额完成' },
      { k:'2026-06', target:'240,000', done:'0', rate:'0%', people:'李文涛', trend:'待执行' },
    ],
    person: [
      { k:'李文涛', target:'420,000', done:'258,000', rate:'61%', people:'李文涛', trend:'需跟进重点客户' },
      { k:'陈思源', target:'180,000', done:'150,000', rate:'83%', people:'陈思源', trend:'接近达成' },
      { k:'赵强', target:'120,000', done:'0', rate:'0%', people:'赵强', trend:'待启动' },
    ],
    product: [
      { k:'高精度伺服电机', target:'720,000', done:'408,000', rate:'57%', people:'李文涛、陈思源', trend:'主计划产品' },
      { k:'配套控制器', target:'180,000', done:'96,000', rate:'53%', people:'赵强', trend:'关联销售不足' },
      { k:'安装服务包', target:'60,000', done:'36,000', rate:'60%', people:'李文涛', trend:'随订单带动' },
    ],
  };
  const dimensionLabel = { amount:'金额维度', person:'人员维度', product:'产品维度' }[trackDimension];

  return (
    <div className="aw-doc-form">
      <div className="aw-doc-form-body">
        <DetailHeaderCard
          title={plan.name}
          status={plan.state}
          onBack={onBack}
          detailItems={[
            ['计划编号', plan.code],
            ['计划周期', plan.cycle],
            ['负责对象', `${plan.ownerType} / ${plan.owner}`],
            ['达成率', `${plan.rate}%`],
          ]}
        />

        <Card>
          <div className="aw-tabs" style={{marginBottom:14}}>
            {tabs.map(t => <span key={t} className={'aw-tab ' + (tab === t ? 'on' : '')} onClick={() => setTab(t)}>{t}</span>)}
          </div>
          {tab === '计划信息' && (
            <>
              <PurchaseSection title="基础信息">
                <div className="aw-doc-grid" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
                  <PlanKV label="计划名称" value={plan.name} />
                  <PlanKV label="计划编号" value={plan.code} />
                  <PlanKV label="计划状态" value={plan.state} />
                  <PlanKV label="计划产品" value={plan.product} />
                  <PlanKV label="计划周期" value={plan.cycle} />
                  <PlanKV label="负责对象" value={`${plan.ownerType} / ${plan.owner}`} />
                  <PlanKV label="目标数量" value={plan.qty} />
                  <PlanKV label="目标金额" value={plan.amount.toLocaleString()} />
                  <PlanKV label="统计口径" value="按订单确认" />
                </div>
              </PurchaseSection>
              <PurchaseSection title="计划产品">
                <table className="aw-table">
                  <thead><tr><th>产品编号</th><th>产品名称</th><th>目标数量</th><th>目标金额</th><th>完成数量</th><th>完成金额</th><th>达成率</th></tr></thead>
                  <tbody>
                    <tr><td>P-HM-450</td><td>{plan.product}</td><td>{plan.qty}</td><td>{plan.amount.toLocaleString()}</td><td>{plan.doneQty}</td><td>{plan.doneAmount.toLocaleString()}</td><td>{plan.rate}%</td></tr>
                  </tbody>
                </table>
              </PurchaseSection>
              <PurchaseSection title="计划详情">
                <div style={{fontSize:13,lineHeight:1.9,color:'var(--aw-fg-2)'}}>
                  <p style={{margin:'0 0 8px'}}>本计划面向 2026 年第二季度重点销售周期，围绕高精度伺服电机在重点客户和战略客户中的新增订单转化展开。计划以销售一部为主要责任部门，由李文涛负责统筹跟进，重点覆盖自动化产线改造、设备更新和备品备件补充场景。</p>
                  <p style={{margin:'0 0 8px'}}>目标拆解为季度销售数量 120 台，目标销售金额 720,000 元。执行过程中按订单确认口径统计业绩，关联订单会自动汇总到业绩追踪中，并按人员、产品、金额维度查看完成情况。</p>
                  <p style={{margin:0}}>风险关注点包括重点客户项目延期、竞品低价竞争和交付周期波动。若月度达成率低于 70%，系统应触发计划预警，由负责人补充跟进记录并调整客户拜访与报价策略。</p>
                </div>
              </PurchaseSection>
            </>
          )}
          {tab === '业绩追踪' && (
            <>
              <PurchaseSection title="追踪筛选">
                <div className="aw-doc-grid" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
                  <Field label="追踪维度">
                    <Select value={trackDimension} onChange={e => setTrackDimension(e.target.value)}>
                      <option value="amount">按金额</option>
                      <option value="person">按人员</option>
                      <option value="product">按产品</option>
                    </Select>
                  </Field>
                  <Field label="相关人员">
                    <Input value={relatedPeople.join('、')} readOnly />
                  </Field>
                  <Field label="统计口径">
                    <Select defaultValue="按订单确认">
                      <option>按订单确认</option>
                      <option>按发货</option>
                      <option>按回款</option>
                    </Select>
                  </Field>
                </div>
              </PurchaseSection>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:14}}>
                <div className="aw-kpi sky"><div className="l">目标金额</div><div className="n">{plan.amount.toLocaleString()}</div></div>
                <div className="aw-kpi mint"><div className="l">完成金额</div><div className="n">{plan.doneAmount.toLocaleString()}</div></div>
                <div className="aw-kpi peach"><div className="l">缺口金额</div><div className="n">{gapAmount.toLocaleString()}</div></div>
                <div className="aw-kpi rose"><div className="l">达成率</div><div className="n">{plan.rate}%</div></div>
              </div>
              <PurchaseSection title={`执行进度 / ${dimensionLabel}`}>
                <table className="aw-table">
                  <thead><tr><th>{trackDimension === 'amount' ? '月份' : trackDimension === 'person' ? '销售人员' : '产品'}</th><th>目标金额</th><th>完成金额</th><th>达成率</th><th>相关人员</th><th>趋势</th></tr></thead>
                  <tbody>
                    {trackRows[trackDimension].map(row => (
                      <tr key={row.k}>
                        <td>{row.k}</td>
                        <td>{row.target}</td>
                        <td>{row.done}</td>
                        <td>{row.rate}</td>
                        <td>{row.people}</td>
                        <td>{row.trend}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </PurchaseSection>
            </>
          )}
          {tab === '销售明细' && (
            <PurchaseSection title="关联销售业绩">
              <table className="aw-table">
                <thead><tr><th>销售订单</th><th>客户</th><th>产品</th><th>销售人员</th><th>数量</th><th>金额</th><th>日期</th><th>状态</th></tr></thead>
                <tbody>
                  {SALES_PLAN_PERFORMANCE.map(row => (
                    <tr key={row.order}><td className="aw-link">{row.order}</td><td>{row.customer}</td><td>{row.product}</td><td>{row.owner}</td><td>{row.qty}</td><td>{row.amount.toLocaleString()}</td><td>{row.date}</td><td>{row.status}</td></tr>
                  ))}
                </tbody>
              </table>
            </PurchaseSection>
          )}
          {tab === '操作记录' && (
            <PurchaseSection title="操作记录">
              <table className="aw-table">
                <thead><tr><th>时间</th><th>操作人</th><th>操作内容</th><th>备注</th></tr></thead>
                <tbody>
                  <tr><td>2026-05-01 09:30</td><td>老夏</td><td>创建销售计划</td><td>提交审批</td></tr>
                  <tr><td>2026-05-02 10:12</td><td>李文涛</td><td>计划开始执行</td><td>按销售一部目标拆解</td></tr>
                </tbody>
              </table>
            </PurchaseSection>
          )}
        </Card>
      </div>
    </div>
  );
}

function SalesPlanListScreen({ initialAction, onActionConsumed }) {
  const [view, setView] = useSalesPlanState('list');
  const [detail, setDetail] = useSalesPlanState(SALES_PLAN_ROWS[0]);

  useSalesPlanEffect(() => {
    if (initialAction === 'new') { setView('new'); onActionConsumed && onActionConsumed(); }
    else if (initialAction === 'list') { setView('list'); onActionConsumed && onActionConsumed(); }
  }, [initialAction]);

  return (
    <div className="aw-doc-page">
      <div className="aw-doc-main" style={{maxWidth:'none'}}>
        {view === 'list' && <SalesPlanListView onNew={() => setView('new')} onView={(row) => { setDetail(row); setView('detail'); }} />}
        {view === 'new' && <SalesPlanNewView onBack={() => setView('list')} />}
        {view === 'detail' && <SalesPlanDetailView onBack={() => setView('list')} data={detail} />}
      </div>
    </div>
  );
}

window.SalesPlanListScreen = SalesPlanListScreen;
