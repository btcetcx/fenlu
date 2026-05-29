// ui_kits/erp-console/quote-list.jsx
// 报价管理 — 列表 / 添加 / 详情
const { useState: useQuoteState, useEffect: useQuoteEffect } = React;

const QUOTE_ROWS = [
  { topic:'荣某定制', code:'SP-20251221001', type:'终端客户', customer:'傲为', amount:'5960.00', version:'V1', downstream:'已转订单', contract:'-', order:'SO-20251221001', date:'2025-12-21', expire:'2025-12-21', owner:'傲为', state:'审核中', tone:'b', cat:'group', relationKind:'关联分组', relationName:'重点客户' },
  { topic:'经销商年度报价', code:'SP-20251221002', type:'经销商报价', customer:'通用', amount:'128000.00', version:'V2', downstream:'已转合同', contract:'HT-20251220001', order:'SO-20251221002', date:'2025-12-20', expire:'2026-12-31', owner:'老夏', state:'已批准', tone:'g', cat:'group', relationKind:'关联分组', relationName:'渠道客户' },
  { topic:'年末通用报价', code:'SP-20251221003', type:'通用报价', customer:'通用', amount:'32000.00', version:'V1', downstream:'未转化', contract:'-', order:'-', date:'2025-12-18', expire:'2025-12-31', owner:'李文涛', state:'已失效', tone:'gray', cat:'universal', relationKind:'通用', relationName:'通用' },
  { topic:'一次性项目报价', code:'SP-20251221004', type:'一次性报价', customer:'深圳市启明科技有限公司', amount:'68000.00', version:'V1', downstream:'待审批', contract:'-', order:'-', date:'2025-12-17', expire:'2026-01-17', owner:'陈思源', state:'草稿', tone:'y', cat:'once', relationKind:'关联项目', relationName:'电子装配测试线' },
];

const QUOTE_PRODUCTS = [
  { id:'qp1', productNo:'7820864', productName:'半成品物料', model:'HM-450', unit:'KG', price:'50.00', tier:'启用' },
  { id:'qp2', productNo:'5786931', productName:'半成品物料', model:'HM-451', unit:'KG', price:'48.00', tier:'启用' },
  { id:'qp3', productNo:'8518691', productName:'铝合金型材', model:'AL-6061', unit:'KG', price:'32.00', tier:'未启用' },
];

const QUOTE_PRODUCT_TIERS = [
  { id:'qt1', minQty:'100', discount:'3', note:'大于等于 100 KG，优惠 3%' },
  { id:'qt2', minQty:'300', discount:'5', note:'大于等于 300 KG，优惠 5%' },
  { id:'qt3', minQty:'500', discount:'8', note:'大于等于 500 KG，优惠 8%' },
];

function QuoteTree({ picked, setPicked }) {
  const items = [
    { k:'all', label:'报价分类', count:QUOTE_ROWS.length, icon:'folder' },
    { k:'universal', label:'通用报价', count:QUOTE_ROWS.filter(r => r.cat === 'universal').length, icon:'doc' },
    { k:'group', label:'分组报价', count:QUOTE_ROWS.filter(r => r.cat === 'group').length, icon:'doc' },
    { k:'promo', label:'促销报价', count:QUOTE_ROWS.filter(r => r.cat === 'promo').length, icon:'doc' },
    { k:'once', label:'一次性报价', count:QUOTE_ROWS.filter(r => r.cat === 'once').length, icon:'doc' },
  ];
  return (
    <div className="aw-doc-tree">
      <div className="aw-doc-tree-h">报价列表 <span className="aw-doc-tree-n">(999)</span></div>
      <div className="aw-doc-tree-list">
        {items.map((item, idx) => (
          <div key={item.k} className={'aw-tree-row ' + (idx === 0 ? 'aw-tree-l2' : 'aw-tree-l3') + (picked === item.k ? ' on' : '')} onClick={() => setPicked(item.k)}>
            <span className="aw-tree-caret">{idx === 0 ? '▾' : ''}</span>
            <TileIcon name={item.icon} size={14} />
            <span style={{flex:1}}>{item.label}</span>
            {idx > 0 && <span className="aw-doc-tree-n">({item.count})</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function QuoteToolbar({ onNew }) {
  return (
    <PurchaseListToolbar
      searchPlaceholder="全局搜索（如报价主题、编号、客户）"
      newLabel="添加报价"
      onNew={onNew}
    />
  );
}

function QuoteListView({ picked, onNew, onView }) {
  const [sel, setSel] = useQuoteState({});
  const [statusFilter, setStatusFilter] = useQuoteState('');
  const scopedRows = picked && picked !== 'all' ? QUOTE_ROWS.filter(r => r.cat === picked) : QUOTE_ROWS;
  const rows = statusFilter ? scopedRows.filter(r => r.state === statusFilter) : scopedRows;
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
      <QuoteToolbar onNew={onNew} />
      <div className="aw-doc-tbl-wrap">
        <div className="aw-doc-tbl-inner">
          <table className="aw-doc-tbl" style={{whiteSpace:'nowrap'}}>
            <thead>
              <tr>
                <PurchaseSelectHeader checked={allChecked} indeterminate={someChecked} onToggle={toggleAll} />
                <PurchaseIndexHeader />
                <th style={{width:190}}><div className="aw-th-inner">报价主题</div></th>
                <th style={{width:150}}><div className="aw-th-inner">报价编号</div></th>
                <th style={{width:120}}><div className="aw-th-inner">报价类型</div></th>
                <th style={{width:140}}><div className="aw-th-inner">适用客户</div></th>
                <th style={{width:110}}><div className="aw-th-inner">报价金额</div></th>
                <th style={{width:90}}><div className="aw-th-inner">价格版本</div></th>
                <th style={{width:110}}><div className="aw-th-inner">转化状态</div></th>
                <th style={{width:120}}><div className="aw-th-inner">报价日期</div></th>
                <th style={{width:120}}><div className="aw-th-inner">失效日期</div></th>
                <th style={{width:110}}><div className="aw-th-inner">报价人员</div></th>
                <PurchaseStatusFilterHeader label="报价状态" value={statusFilter} onChange={setStatusFilter} options={['审核中','已批准','已失效','草稿']} />
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
                  <td>{r.type}</td>
                  <td>{r.customer}</td>
                  <td className="aw-num">{r.amount}</td>
                  <td>{r.version}</td>
                  <td>{r.downstream}</td>
                  <td className="aw-num">{r.date}</td>
                  <td className="aw-num">{r.expire}</td>
                  <td>{r.owner}</td>
                  <td><span className={'aw-state aw-state-' + r.tone}>{r.state}</span></td>
                  <td><span className="aw-link" onClick={e => { e.stopPropagation(); onView(r); }}>查看</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <PurchaseListFooter
        total={QUOTE_ROWS.length}
        selectedCount={Object.values(sel).filter(Boolean).length}
        allChecked={allChecked}
        someChecked={someChecked}
        onToggleAll={toggleAll}
        pages={3}
      />
    </>
  );
}

function QuoteProductTierModal({ product, onClose }) {
  const [rows, setRows] = useQuoteState(QUOTE_PRODUCT_TIERS);
  const updateRow = (id, key, value) => setRows(prev => prev.map(row => row.id === id ? { ...row, [key]: value } : row));
  const addRow = () => setRows(prev => [...prev, { id:`tier-${Date.now()}`, minQty:'', discount:'', note:'' }]);
  const removeRow = (id) => setRows(prev => prev.filter(row => row.id !== id));

  return (
    <div className="aw-mask" onClick={onClose}>
      <div className="aw-modal" style={{width:'min(760px,94vw)'}} onClick={e => e.stopPropagation()}>
        <div className="head">
          <span>设置产品阶梯报价</span>
          <span style={{cursor:'pointer',color:'var(--aw-fg-4)'}} onClick={onClose}>✕</span>
        </div>
        <div className="body">
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:16,fontSize:13}}>
            <div><span style={{color:'var(--aw-fg-3)'}}>产品编号：</span>{product.productNo}</div>
            <div><span style={{color:'var(--aw-fg-3)'}}>产品名称：</span>{product.productName}</div>
            <div><span style={{color:'var(--aw-fg-3)'}}>基础单价：</span>{product.price || product.unitPrice || '-'}</div>
          </div>
          <div style={{fontSize:12,color:'var(--aw-fg-3)',marginBottom:10}}>
            按该产品的购买数量设置优惠百分比。系统按满足条件的最高数量阶梯计算最终单价。
          </div>
          <div style={{overflow:'auto'}}>
            <table className="aw-table">
              <thead>
                <tr>
                  <th style={{width:60}}>序号</th>
                  <th style={{width:170}}>起订数量（大于等于）</th>
                  <th style={{width:150}}>优惠百分比</th>
                  <th>规则说明</th>
                  <th style={{width:70}}>操作</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={row.id}>
                    <td className="aw-num">{idx + 1}</td>
                    <td><Input value={row.minQty} onChange={e => updateRow(row.id, 'minQty', e.target.value)} placeholder="如 100" /></td>
                    <td><Input value={row.discount} onChange={e => updateRow(row.id, 'discount', e.target.value)} placeholder="如 5%" /></td>
                    <td><Input value={row.note} onChange={e => updateRow(row.id, 'note', e.target.value)} placeholder="自动或手动填写规则说明" /></td>
                    <td><span className="aw-link" style={{color:'var(--aw-danger)'}} onClick={() => removeRow(row.id)}>删除</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PurchaseAddDetailButton onClick={addRow}>+ 新增阶梯</PurchaseAddDetailButton>
        </div>
        <div className="foot">
          <Btn onClick={onClose}>取消</Btn>
          <Btn kind="primary" onClick={onClose}>确定</Btn>
        </div>
      </div>
    </div>
  );
}

const QUOTE_CATEGORY_HELP = [
  '报价分类用于区分通用、分组、促销、指定客户和一次性报价。',
  '销售取价时会结合报价类型和客户匹配规则确定最终价格。',
];
const QUOTE_TYPE_HELP = [
  '通用：隐藏客户选择器和分组选择器，适用于全量客户底价。',
  '分组：显示客户分组下拉框，适用于指定客户分组。',
  '促销：按活动周期和促销范围生效。',
  '指定客户：长期或周期内面向指定客户。',
  '一次性：绑定一次交易、项目或合同，用完即失效。',
  '优先级：一次性 > 指定客户 > 促销/活动 > 客户分组 > 通用。',
];
const QUOTE_PRODUCT_HELP = [
  '商品需为可销售状态，且必须维护报价后才能进入销售流程。',
  '同一客户命中多个报价时，优先使用一次性报价；无一次性报价时再取指定客户、促销、分组或通用报价。',
];

function QuoteCustomerGroupPickerModal({ onClose, onConfirm }) {
  const groups = [
    { name:'重点客户', count:26, manager:'老夏', note:'重点维护客户，优先使用专属报价' },
    { name:'战略客户', count:12, manager:'李文涛', note:'年度合作客户，支持阶梯折扣' },
    { name:'普通客户', count:68, manager:'陈思源', note:'默认销售客户分组' },
    { name:'渠道客户', count:18, manager:'赵强', note:'经销商、代理商渠道报价' },
  ];
  const [selected, setSelected] = useQuoteState(groups[0]);
  return (
    <div className="aw-mask" onClick={onClose}>
      <div className="aw-modal lg" onClick={e => e.stopPropagation()}>
        <div className="head">
          <span>选择客户分组</span>
          <button className="aw-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="body">
          <table className="aw-table">
            <thead><tr><th style={{width:60}}>选择</th><th>客户分组</th><th>客户数量</th><th>负责人</th><th>说明</th></tr></thead>
            <tbody>
              {groups.map(group => (
                <tr key={group.name} onClick={() => setSelected(group)} style={{cursor:'pointer',background:selected.name === group.name ? 'var(--aw-primary-soft)' : undefined}}>
                  <td><span className={'aw-chk' + (selected.name === group.name ? ' on' : '')} /></td>
                  <td>{group.name}</td>
                  <td className="aw-num">{group.count}</td>
                  <td>{group.manager}</td>
                  <td>{group.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="foot">
          <button className="aw-btn" onClick={onClose}>取消</button>
          <button className="aw-btn primary" onClick={() => onConfirm(selected)}>确定</button>
        </div>
      </div>
    </div>
  );
}

function QuoteTargetPickerModal({ onClose, onConfirm }) {
  const [tab, setTab] = useQuoteState('customer');
  const customers = [
    { code:'CUS-2026-001', name:'海南星海智能制造有限公司', group:'重点客户', manager:'老夏' },
    { code:'CUS-2026-002', name:'深圳市启明科技有限公司', group:'战略客户', manager:'李文涛' },
    { code:'CUS-2026-003', name:'广州南方装备有限公司', group:'普通客户', manager:'陈思源' },
    { code:'CUS-2026-004', name:'东莞华美包装制品厂', group:'渠道客户', manager:'赵强', disabled:true },
  ];
  const projects = [
    { code:'PRJ-2026-017', name:'智能输送线项目', customer:'海南星海智能制造有限公司', manager:'老夏' },
    { code:'PRJ-2026-021', name:'包装自动化改造', customer:'东莞华美包装制品厂', manager:'赵强', disabled:true },
    { code:'PRJ-2026-028', name:'电子装配测试线', customer:'深圳市启明科技有限公司', manager:'李文涛' },
  ];
  const [selected, setSelected] = useQuoteState(null);
  const rows = tab === 'customer' ? customers : projects;
  return (
    <div className="aw-mask" onClick={onClose}>
      <div className="aw-modal xl" style={{width:'min(960px,94vw)'}} onClick={e => e.stopPropagation()}>
        <div className="head">
          <span>选择报价适用对象</span>
          <button className="aw-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="body">
          <Tabs items={[{k:'customer',label:'选择客户'},{k:'project',label:'选择项目'}]} active={tab} onChange={(k) => { setTab(k); setSelected(null); }} />
          <div className="aw-doc-search" style={{width:320,margin:'12px 0'}}><input placeholder={tab === 'customer' ? '搜索客户名称/编号' : '搜索项目名称/编号'} /></div>
          <table className="aw-table">
            <thead>
              <tr>
                <th style={{width:60}}>选择</th>
                <th>{tab === 'customer' ? '客户编号' : '项目编号'}</th>
                <th>{tab === 'customer' ? '客户名称' : '项目名称'}</th>
                <th>{tab === 'customer' ? '客户分组' : '关联客户'}</th>
                <th>负责人</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.code} onClick={() => !row.disabled && setSelected(row)} style={{cursor:row.disabled?'not-allowed':'pointer',background:selected && selected.code === row.code ? 'var(--aw-primary-soft)' : undefined,opacity:row.disabled?0.55:1}}>
                  <td><span className={'aw-chk' + (selected && selected.code === row.code ? ' on' : '')} /></td>
                  <td className="aw-num">{row.code}</td>
                  <td><span className="aw-link">{row.name}</span>{row.disabled && <span className="aw-state aw-state-gray" style={{marginLeft:8}}>已停用</span>}</td>
                  <td>{tab === 'customer' ? row.group : row.customer}</td>
                  <td>{row.manager}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="foot">
          <button className="aw-btn" onClick={onClose}>取消</button>
          <button className="aw-btn primary" disabled={!selected} onClick={() => selected && onConfirm({...selected, targetType: tab === 'customer' ? '客户' : '项目'})}>确定</button>
        </div>
      </div>
    </div>
  );
}

function QuoteNewView({ onBack }) {
  const [quoteCategory, setQuoteCategory] = useQuoteState('');
  const [scopeText, setScopeText] = useQuoteState('');
  const [groupPicker, setGroupPicker] = useQuoteState(false);
  const [targetPicker, setTargetPicker] = useQuoteState(false);
  const [rows, setRows] = useQuoteState([]);
  const [picker, setPicker] = useQuoteState(false);
  const [tierProduct, setTierProduct] = useQuoteState(null);
  const addProducts = (products) => {
    setRows(prev => [
      ...prev,
      ...products.map((p, idx) => ({
        id:`quote-${Date.now()}-${idx}`,
        productNo:p.productNo,
        productName:p.productName,
        model:p.model || p.spec,
        unit:p.unit,
        price:p.price ? Number(p.price).toFixed(2) : '',
        tier:'未设置',
      }))
    ]);
    setPicker(false);
  };
  const removeRow = (id) => setRows(prev => prev.filter(row => row.id !== id));
  const handleCategoryChange = (value) => {
    setQuoteCategory(value);
    setScopeText(value === '通用' ? '全量客户通用报价' : '');
    if (value === '分组报价') setGroupPicker(true);
    if (value === '指定客户报价' || value === '一次性报价') setTargetPicker(true);
  };

  return (
    <PurchaseFormPage onBack={onBack}>
      <PurchaseSection title="基础信息">
        <div className="aw-doc-grid" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
            <Field label="报价主题" req><Input placeholder="请输入内容" /></Field>
            <Field label="报价编号"><Input defaultValue="自动" disabled /></Field>
            <Field label={<span>报价分类<HelpTip text={QUOTE_CATEGORY_HELP} /></span>} req>
              <Select value={quoteCategory} onChange={e => handleCategoryChange(e.target.value)}>
                <option value="">请选择</option>
                <option>通用</option>
                <option>分组报价</option>
                <option>促销报价</option>
                <option>指定客户报价</option>
                <option>一次性报价</option>
              </Select>
            </Field>
            <Field label="开始日期" req><Input placeholder="请选择" /></Field>
            <Field label="失效日期" req><Input placeholder="请选择" /></Field>
            <Field label={<span>适用范围<HelpTip text={QUOTE_TYPE_HELP} /></span>} req>
              <Input value={scopeText} readOnly placeholder="选择报价分类后自动带出适用范围" onClick={() => {
                if (quoteCategory === '分组报价') setGroupPicker(true);
                if (quoteCategory === '指定客户报价' || quoteCategory === '一次性报价') setTargetPicker(true);
              }} style={{cursor: quoteCategory === '分组报价' || quoteCategory === '指定客户报价' || quoteCategory === '一次性报价' ? 'pointer' : 'default'}} />
            </Field>
            <Field label="价格版本"><Input value="V1 / 保存后锁定历史版本" readOnly /></Field>
        </div>
      </PurchaseSection>

      <PurchaseSection title={<span>产品明细<HelpTip text={QUOTE_PRODUCT_HELP} /></span>}>
        <PurchaseDetailTable
          rows={rows}
          emptyText="暂无产品明细，点击「新增明细」选择可销售产品"
          columns={[
            {k:'no',label:'产品编号',w:120},
            {k:'name',label:'产品名称',w:150},
            {k:'model',label:'规格型号',w:130},
            {k:'unit',label:'单位',w:80},
            {k:'price',label:'单价',w:110},
          ]}
          renderRow={(row, idx) => (
            <tr key={row.id}>
              <PurchaseDetailIndexCell index={idx} />
              <td><Input defaultValue={row.productNo || ''} style={{width:'100%'}} /></td>
              <td><Input defaultValue={row.productName || ''} style={{width:'100%'}} /></td>
              <td><Input defaultValue={row.model || ''} style={{width:'100%'}} /></td>
              <td><Input defaultValue={row.unit || ''} style={{width:'100%'}} /></td>
              <td><Input defaultValue={row.price || ''} placeholder="填写产品单价" style={{width:'100%'}} /></td>
              <td>
                <div style={{display:'flex',gap:10}}>
                  <span className="aw-link" onClick={() => setTierProduct(row)}>阶梯报价</span>
                  <span className="aw-link" style={{color:'var(--aw-danger)'}} onClick={() => removeRow(row.id)}>删除</span>
                </div>
              </td>
            </tr>
          )}
        />
        <PurchaseAddDetailButton onClick={() => setPicker(true)} />
      </PurchaseSection>

      <PurchaseSection title="报价详情">
        <PurchaseRichText placeholder="请输入报价说明、适用条件、客户沟通记录等信息" />
      </PurchaseSection>

      <PurchaseSection title="附件">
        <div style={{display:'grid',gridTemplateColumns:'repeat(2, minmax(180px, 1fr))',gap:12}}>
          <div style={{border:'1px solid var(--aw-border)',borderRadius:6,padding:14,background:'#fff'}}>
            <div style={{fontSize:13,fontWeight:500,marginBottom:8}}>新建文本文档.PDF</div>
            <div style={{fontSize:11,color:'var(--aw-fg-4)'}}>文件大小：0 Bytes</div>
            <div style={{fontSize:11,color:'var(--aw-fg-4)',marginTop:4}}>上传日期：2024-08-1 17:46:27</div>
            <div style={{display:'flex',gap:12,marginTop:16,fontSize:12}}><span className="aw-link">重新上传</span><span className="aw-link">删除</span></div>
          </div>
          <div style={{border:'1px dashed var(--aw-border-strong)',borderRadius:6,padding:30,textAlign:'center',color:'var(--aw-fg-3)'}}>
            <span className="aw-link">点击上传</span> / 拖拽到此区域
          </div>
        </div>
      </PurchaseSection>
      {picker && <ProductPickerModal onClose={() => setPicker(false)} onConfirm={addProducts} />}
      {tierProduct && <QuoteProductTierModal product={tierProduct} onClose={() => setTierProduct(null)} />}
      {groupPicker && <QuoteCustomerGroupPickerModal onClose={() => setGroupPicker(false)} onConfirm={(group) => { setScopeText(`客户分组：${group.name}`); setGroupPicker(false); }} />}
      {targetPicker && <QuoteTargetPickerModal onClose={() => setTargetPicker(false)} onConfirm={(target) => { setScopeText(`${target.targetType}：${target.name}`); setTargetPicker(false); }} />}
    </PurchaseFormPage>
  );
}

function QuoteDetailView({ onBack, data }) {
  const quote = data || QUOTE_ROWS[0];
  const [expanded, setExpanded] = useQuoteState({});
  const [detailTab, setDetailTab] = useQuoteState('products');
  const toggleTier = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  const categoryLabel = quote.cat === 'universal' ? '通用' : quote.cat === 'promo' ? '促销报价' : quote.cat === 'once' ? '一次性报价' : '分组报价';
  const relationLabel = quote.relationKind || (quote.cat === 'universal' ? '通用' : quote.cat === 'once' ? '关联客户' : '关联分组');
  const relationValue = quote.relationName || (quote.cat === 'universal' ? '通用' : quote.customer);
  const traceRows = [
    ['1', quote.contract === '-' ? '报价转订单' : '报价转合同', quote.contract === '-' ? quote.order : quote.contract, quote.customer, quote.amount, '待生成应收', '未申请', '未回款', `${quote.date} 10:20`],
    ...(quote.order !== '-' ? [['2', '下游订单', quote.order, quote.customer, quote.amount, '部分应收', '待申请', '部分回款', `${quote.date} 15:30`]] : []),
  ];
  return (
    <div className="aw-doc-form">
      <div className="aw-doc-form-body">
        <DetailHeaderCard
          title={quote.topic}
          status={quote.state}
          onBack={onBack}
          detailItems={[
            ['报价编号', quote.code],
            ['报价类型', quote.type],
            ['适用客户', quote.customer],
            ['报价金额', quote.amount],
            ['价格版本', quote.version],
            ['报价日期', quote.date],
            ['失效日期', quote.expire],
            ['报价人员', quote.owner],
          ]}
        />
        <Card title="基础信息">
          <div className="aw-doc-grid" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
            <div><span style={{color:'var(--aw-fg-3)'}}>报价主题：</span>{quote.topic}</div>
            <div><span style={{color:'var(--aw-fg-3)'}}>报价编号：</span>{quote.code}</div>
            <div><span style={{color:'var(--aw-fg-3)'}}>报价分类：</span>{categoryLabel}</div>
            <div><span style={{color:'var(--aw-fg-3)'}}>开始日期：</span>{quote.date}</div>
            <div><span style={{color:'var(--aw-fg-3)'}}>失效日期：</span>{quote.expire}</div>
            <div><span style={{color:'var(--aw-fg-3)'}}>适用客户：</span>{quote.customer}</div>
            <div><span style={{color:'var(--aw-fg-3)'}}>转化状态：</span>{quote.downstream}</div>
            <div><span style={{color:'var(--aw-fg-3)'}}>{relationLabel}：</span>{relationValue}</div>
          </div>
        </Card>
        <Card title={<span>产品明细<HelpTip text={QUOTE_PRODUCT_HELP} /></span>}>
          <Tabs
            items={[
              {k:'products',label:'产品明细'},
              {k:'trace',label:'转化与财务追踪'},
            ]}
            active={detailTab}
            onChange={setDetailTab}
          />
          {detailTab === 'products' && (
            <div style={{overflow:'auto'}}>
              <table className="aw-table">
                <thead>
                  <tr>
                    <th style={{width:60}}>序号</th>
                    <th style={{width:120}}>产品编号</th>
                    <th>产品名称</th>
                    <th style={{width:120}}>规格型号</th>
                    <th style={{width:80}}>单位</th>
                    <th style={{width:110}}>基础单价</th>
                    <th style={{width:110}}>阶梯报价</th>
                  </tr>
                </thead>
                <tbody>
                  {QUOTE_PRODUCTS.map((row, idx) => (
                    <React.Fragment key={row.id}>
                      <tr>
                        <td className="aw-num">{idx + 1}</td>
                        <td className="aw-num">{row.productNo}</td>
                        <td>{row.productName}</td>
                        <td>{row.model}</td>
                        <td>{row.unit}</td>
                        <td className="aw-num">{row.price}</td>
                        <td>
                          <span className={'aw-state aw-state-' + (row.tier === '启用' ? 'g' : 'gray')} style={{marginRight:10}}>{row.tier}</span>
                          {row.tier === '启用' && <span className="aw-link" onClick={() => toggleTier(row.id)}>{expanded[row.id] ? '收起' : '展开'}</span>}
                        </td>
                      </tr>
                      {expanded[row.id] && (
                        <tr>
                          <td colSpan={7} style={{background:'var(--aw-surface-2)',padding:12}}>
                            <table className="aw-table">
                              <thead>
                                <tr>
                                  <th style={{width:60}}>序号</th>
                                  <th style={{width:180}}>数量条件</th>
                                  <th style={{width:140}}>优惠百分比</th>
                                  <th>规则说明</th>
                                </tr>
                              </thead>
                              <tbody>
                                {QUOTE_PRODUCT_TIERS.map((tier, tierIdx) => (
                                  <tr key={tier.id}>
                                    <td className="aw-num">{tierIdx + 1}</td>
                                    <td>大于等于 {tier.minQty}</td>
                                    <td className="aw-num">{tier.discount}%</td>
                                    <td>{tier.note}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {detailTab === 'trace' && (
            <div style={{overflow:'auto'}}>
              <table className="aw-table">
                <thead><tr><th>序号</th><th>转化动作</th><th>目标单据</th><th>客户/项目</th><th>转化金额</th><th>应收状态</th><th>开票状态</th><th>回款状态</th><th>操作时间</th></tr></thead>
                <tbody>
                  {traceRows.map((row) => <tr key={row[0]}>{row.map((cell, idx) => <td key={idx}>{cell}</td>)}</tr>)}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function QuoteListScreen({ initialAction, onActionConsumed }) {
  const [view, setView] = useQuoteState('list');
  const [picked, setPicked] = useQuoteState('all');
  const [detail, setDetail] = useQuoteState(QUOTE_ROWS[0]);

  useQuoteEffect(() => {
    if (initialAction === 'new') { setView('new'); onActionConsumed && onActionConsumed(); }
    else if (initialAction === 'list') { setView('list'); onActionConsumed && onActionConsumed(); }
  }, [initialAction]);

  return (
    <div className="aw-doc-page">
      {view === 'list' && <QuoteTree picked={picked} setPicked={setPicked} />}
      <div className="aw-doc-main">
        {view === 'list' && <QuoteListView picked={picked} onNew={() => setView('new')} onView={(row) => { setDetail(row); setView('detail'); }} />}
        {view === 'new' && <QuoteNewView onBack={() => setView('list')} />}
        {view === 'detail' && <QuoteDetailView onBack={() => setView('list')} data={detail} />}
      </div>
    </div>
  );
}

window.QuoteListScreen = QuoteListScreen;
