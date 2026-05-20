// product-list.jsx — 产品管理：列表 / 新增 / 详情 三态
// Session: 260515-deep-lark
const { useState, useEffect } = React;

// ========== MOCK DATA ==========
const PRODUCTS = [
  { id:1, code:'CP-20250101001', name:'智能温湿度传感器', model:'IWS-TH200', cat:'成品', subCat:'类别A', parentCat:'fin', subCatKey:'cat-a',
    unit:'台', source:'自制件', state:'在售', stateTone:'g', alias:'IWS-TH200-A',
    spec:'量程-40~125℃, ±0.3℃精度', salesCtrl:'允许销售', minQty:10, price:'¥ 258.00',
    qcPlan:'标准质检方案A', execStd:'GB/T 2423.1-2008', channel:'全渠道',
    safeStock:200, minStock:50, maxStock:500, replenish:7, storage:'A-03-12',
    desc:'智能温湿度传感器，采用进口SHT30探头，支持RS485/Modbus通讯协议，适用于工业环境监测。',
    creator:'老夏', createdAt:'2025-01-15 09:30', modifier:'李文涛', modifiedAt:'2025-05-10 14:20' },
  { id:2, code:'CP-20250101002', name:'工业级LCD显示屏', model:'ILD-1024', cat:'成品', subCat:'类别B', parentCat:'fin', subCatKey:'cat-b',
    unit:'台', source:'外购件', state:'停产', stateTone:'gray', alias:'ILD-1024-V2',
    spec:'10.4寸 1024×768 TFT', salesCtrl:'禁止销售', minQty:5, price:'¥ 1,850.00',
    qcPlan:'显示屏质检方案B', execStd:'SJ/T 11343-2015', channel:'线下',
    safeStock:50, minStock:10, maxStock:150, replenish:14, storage:'B-05-08',
    desc:'10.4寸工业级TFT LCD显示屏，高亮度500cd/m²，宽温工作-20~70℃，支持VGA/DVI输入。',
    creator:'陈思源', createdAt:'2025-02-20 11:00', modifier:'老夏', modifiedAt:'2025-04-18 16:45' },
  { id:3, code:'CP-20250102001', name:'传感器内核基板', model:'SKB-200', cat:'半成品', subCat:'', parentCat:'semi', subCatKey:'',
    unit:'个', source:'自制件', state:'在售', stateTone:'g', alias:'SKB-200-CORE',
    spec:'PCB 4层板 50×30mm', salesCtrl:'允许销售', minQty:50, price:'¥ 68.00',
    qcPlan:'PCB质检方案C', execStd:'IPC-A-600H', channel:'全渠道',
    safeStock:500, minStock:100, maxStock:1000, replenish:3, storage:'C-02-15',
    desc:'传感器内核基板，4层沉金工艺，集成信号调理电路，适配多种传感器封装。',
    creator:'赵工', createdAt:'2025-03-08 08:15', modifier:'王志强', modifiedAt:'2025-05-12 10:30' },
  { id:4, code:'CP-20250102002', name:'显示模组半成品', model:'DSM-070', cat:'半成品', subCat:'', parentCat:'semi', subCatKey:'',
    unit:'套', source:'自制件', state:'在售', stateTone:'g', alias:'DSM-070-H',
    spec:'7寸模组框架+背光', salesCtrl:'禁止销售', minQty:20, price:'¥ 320.00',
    qcPlan:'模组质检方案D', execStd:'SJ/T 11343-2015', channel:'线上',
    safeStock:300, minStock:80, maxStock:800, replenish:5, storage:'B-06-20',
    desc:'7寸显示模组半成品套装，含背光模组和TFT面板框架，供后续组装使用。',
    creator:'王志强', createdAt:'2025-03-20 13:00', modifier:'赵工', modifiedAt:'2025-05-08 09:00' },
  { id:5, code:'CP-20250103001', name:'铝合金型材6063', model:'AL-6063-T5', cat:'原材料', subCat:'', parentCat:'raw', subCatKey:'',
    unit:'kg', source:'外购件', state:'在售', stateTone:'g', alias:'AL6063-20X40',
    spec:'20×40mm T5处理', salesCtrl:'允许销售', minQty:100, price:'¥ 28.50',
    qcPlan:'金属材料质检方案E', execStd:'GB/T 5237.1-2017', channel:'全渠道',
    safeStock:2000, minStock:500, maxStock:5000, replenish:10, storage:'A-01-01',
    desc:'6063铝合金型材，T5热处理，表面阳极氧化，用于结构框架和散热器制造。',
    creator:'老夏', createdAt:'2025-01-05 10:00', modifier:'陈思源', modifiedAt:'2025-04-30 15:00' },
  { id:6, code:'CP-20250103002', name:'电子元器件基础包', model:'ECB-0402', cat:'原材料', subCat:'', parentCat:'raw', subCatKey:'',
    unit:'套', source:'外购件', state:'停用', stateTone:'gray', alias:'ECB-0402-B',
    spec:'0402封装阻容套装', salesCtrl:'审批销售', minQty:500, price:'¥ 12.00',
    qcPlan:'元器件抽检方案F', execStd:'GB/T 2691-2016', channel:'线上',
    safeStock:5000, minStock:1000, maxStock:10000, replenish:7, storage:'C-04-30',
    desc:'0402封装电阻电容基础套装，含常用阻值/容值各50种，适用于SMT产线备料。',
    creator:'李文涛', createdAt:'2025-02-10 16:20', modifier:'老夏', modifiedAt:'2025-05-01 11:00' },
];

const SALES_RECORDS = [
  { code:'XS-20250501-001', customer:'深圳鹏程科技', qty:200, price:258, amount:51600, date:'2025-05-10', state:'已完成' },
  { code:'XS-20250502-002', customer:'广州智造电子', qty:150, price:258, amount:38700, date:'2025-05-08', state:'已完成' },
  { code:'XS-20250503-003', customer:'杭州云联技术', qty:300, price:252, amount:75600, date:'2025-05-05', state:'已发货' },
  { code:'XS-20250504-004', customer:'上海恒达精密', qty:80, price:260, amount:20800, date:'2025-05-03', state:'已完成' },
  { code:'XS-20250505-005', customer:'北京华信科技', qty:120, price:255, amount:30600, date:'2025-04-28', state:'已退货' },
];

const INBOUND_RECORDS = [
  { code:'RK-20250510-001', warehouse:'原材料仓', qty:500, batch:'B20250510A', date:'2025-05-10', operator:'老夏' },
  { code:'RK-20250508-002', warehouse:'半成品仓', qty:300, batch:'B20250508B', date:'2025-05-08', operator:'赵工' },
  { code:'RK-20250505-003', warehouse:'成品仓', qty:200, batch:'B20250505C', date:'2025-05-05', operator:'王志强' },
];

const OUTBOUND_RECORDS = [
  { code:'CK-20250511-001', warehouse:'成品仓', qty:150, type:'销售出库', date:'2025-05-11', operator:'李四' },
  { code:'CK-20250509-002', warehouse:'半成品仓', qty:200, type:'生产领料', date:'2025-05-09', operator:'张三' },
  { code:'CK-20250506-003', warehouse:'原材料仓', qty:500, type:'委外出库', date:'2025-05-06', operator:'王五' },
];

const PRICING_RECORDS = [
  { id:1, customer:'深圳鹏程科技', price:258, startDate:'2025-01-01', endDate:'2025-12-31', remark:'年度协议价' },
  { id:2, customer:'广州智造电子', price:255, startDate:'2025-03-01', endDate:'2026-02-28', remark:'批量折扣' },
  { id:3, customer:'杭州云联技术', price:252, startDate:'2025-04-01', endDate:'2025-09-30', remark:'大客户优惠' },
];

const OPERATION_LOGS = [
  { operator:'老夏', content:'创建产品档案', time:'2025-01-15 09:30' },
  { operator:'李文涛', content:'更新产品规格参数', time:'2025-02-20 14:15' },
  { operator:'陈思源', content:'通过产品审批流程', time:'2025-02-21 10:00' },
  { operator:'老夏', content:'修改销售价格策略', time:'2025-03-15 16:30' },
  { operator:'赵工', content:'上传产品质检报告', time:'2025-04-10 11:45' },
];

// ========== CATEGORY TREE ==========
function ProductTree({ picked, setPicked }) {
  const [open, setOpen] = useState({ fin: true, semi: false, raw: false });
  const toggle = (k) => setOpen(o => ({ ...o, [k]: !o[k] }));

  return (
    <div className="aw-doc-tree">
      <div className="aw-doc-tree-h">产品分类 <span className="aw-doc-tree-n">(6)</span></div>
      <div className="aw-doc-tree-list">
        {/* 成品 */}
        <div className={'aw-tree-row aw-tree-l2' + (picked === 'fin' ? ' on' : '')}
          onClick={() => setPicked('fin')}>
          <span className="aw-tree-caret" onClick={(e) => { e.stopPropagation(); toggle('fin'); }}>
            {open.fin ? '▾' : '▸'}
          </span>
          <span>成品</span>
        </div>
        {open.fin && <>
          <div className={'aw-tree-row aw-tree-l3' + (picked === 'cat-a' ? ' on' : '')}
            onClick={() => setPicked('cat-a')}>
            <span>类别A</span>
          </div>
          <div className={'aw-tree-row aw-tree-l3' + (picked === 'cat-b' ? ' on' : '')}
            onClick={() => setPicked('cat-b')}>
            <span>类别B</span>
          </div>
        </>}
        {/* 半成品 */}
        <div className={'aw-tree-row aw-tree-l2' + (picked === 'semi' ? ' on' : '')}
          onClick={() => setPicked('semi')}>
          <span className="aw-tree-caret" onClick={(e) => { e.stopPropagation(); toggle('semi'); }}>
            {open.semi ? '▾' : '▸'}
          </span>
          <span>半成品</span>
        </div>
        {/* 原材料 */}
        <div className={'aw-tree-row aw-tree-l2' + (picked === 'raw' ? ' on' : '')}
          onClick={() => setPicked('raw')}>
          <span className="aw-tree-caret" onClick={(e) => { e.stopPropagation(); toggle('raw'); }}>
            {open.raw ? '▾' : '▸'}
          </span>
          <span>原材料</span>
        </div>
      </div>
    </div>
  );
}

// ========== LIST VIEW ==========
function ProductListView({
  picked, products, onNew, onDetail,
  sel, toggleRow, allChecked, someChecked, toggleAll
}) {

  // Group rows with category separators
  const renderRows = () => {
    const grouped = {};
    products.forEach((p, idx) => {
      if (!grouped[p.cat]) grouped[p.cat] = [];
      grouped[p.cat].push({ ...p, _idx: idx });
    });

    const catOrder = ['成品', '半成品', '原材料'];
    const rows = [];
    catOrder.forEach(cat => {
      const items = grouped[cat];
      if (!items || items.length === 0) return;
      rows.push({ _type: 'group', _cat: cat });
      items.forEach(item => rows.push({ _type: 'row', ...item }));
    });
    return rows;
  };

  const rendered = renderRows();

  const [drawer, setDrawer] = useState(null);

  // Helper to render category badge
  const CatBadge = ({ cat }) => {
    if (cat === '成品') return <Badge>成品</Badge>;
    if (cat === '半成品')
      return <span className="aw-badge y">半成品</span>;
    if (cat === '原材料')
      return <span style={{ display:'inline-flex',alignItems:'center',gap:4,padding:'2px 8px',borderRadius:10,fontSize:11,background:'#F3F4F6',color:'#6B7280' }}>
        <span style={{ width:5,height:5,borderRadius:'50%',background:'#9CA3AF' }}></span>原材料
      </span>;
    return <span>{cat}</span>;
  };

  const StateBadge = ({ state }) => {
    if (state === '在售') return <Badge tone="g">在售</Badge>;
    if (state === '研发') return <Badge tone="b">研发</Badge>;
    if (state === '停产')
      return <span style={{ display:'inline-flex',alignItems:'center',gap:4,padding:'2px 8px',borderRadius:10,fontSize:11,background:'#F3F4F6',color:'#6B7280' }}>
        <span style={{ width:5,height:5,borderRadius:'50%',background:'#9CA3AF' }}></span>停产
      </span>;
    if (state === '停用') return <span className="aw-state aw-state-gray">停用</span>;
    return <span>{state}</span>;
  };

  return (
    <>
      {/* Toolbar */}
      <div className="aw-doc-tb">
        <div className="aw-doc-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8">
            <circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/>
          </svg>
          <input placeholder="搜索产品名称、编号、型号…" />
        </div>
        <span className="aw-act">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8"/><path d="M21 3v5h-5"/>
            <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16"/><path d="M3 21v-5h5"/>
          </svg>刷新数据
        </span>
        <button className="aw-btn" onClick={() => setDrawer('filter')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 5h18M6 12h12M10 19h4"/>
          </svg>筛选
        </button>
        <button className="aw-btn" onClick={() => setDrawer('field')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="4" width="7" height="7"/><rect x="14" y="4" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
          </svg>字段配置
        </button>
        <button className="aw-btn" onClick={() => setDrawer('export')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 4v12"/><path d="M7 11l5 5 5-5"/><path d="M4 20h16"/>
          </svg>导出
        </button>
        <button className="aw-btn" onClick={() => setDrawer('import')}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 20V8"/><path d="M7 13l5-5 5 5"/><path d="M4 4h16"/>
          </svg>导入
        </button>
        <button className="aw-btn primary" onClick={onNew}>新增产品</button>
      </div>

      {/* Table */}
      <div className="aw-doc-tbl-wrap">
        <div className="aw-doc-tbl-inner">
          <table className="aw-doc-tbl">
            <thead>
              <tr>
                <th style={{ width: 40 }}><div className="aw-th-inner">
                  <span className={'aw-chk' + (allChecked ? ' on' : someChecked ? ' indet' : '')} onClick={toggleAll} />
                </div></th>
                <th style={{ width: 60 }}><div className="aw-th-inner">图片</div></th>
                <th style={{ width: 160 }}><div className="aw-th-inner">产品名称</div></th>
                <th style={{ width: 140 }}><div className="aw-th-inner">产品编号</div></th>
                <th style={{ width: 100 }}><div className="aw-th-inner">产品型号</div></th>
                <th style={{ width: 100 }}><div className="aw-th-inner">产品分类</div></th>
                <th style={{ width: 80 }}><div className="aw-th-inner">产品单位</div></th>
                <th style={{ width: 90 }}><div className="aw-th-inner">获取方式</div></th>
                <th style={{ width: 80 }}><div className="aw-th-inner">产品状态</div></th>
                <th style={{ width: 80 }}><div className="aw-th-inner">操作</div></th>
              </tr>
            </thead>
            <tbody>
              {rendered.map((r, i) => {
                if (r._type === 'group') {
                  return (
                    <tr key={'g-' + i} style={{ background: '#FAFBFC' }}>
                      <td colSpan={10} style={{ padding:'6px 12px', fontSize:12, fontWeight:500, color:'#6B7280', borderBottom:'1px solid var(--aw-border)' }}>
                        📂 {r._cat}
                      </td>
                    </tr>
                  );
                }
                const idx = r._idx;
                return (
                  <tr key={idx}>
                    <td onClick={e => { e.stopPropagation(); toggleRow(idx); }}>
                      <span className={'aw-chk' + (sel[idx] ? ' on' : '')} />
                    </td>
                    <td>
                      <div style={{ width:40, height:40, borderRadius:6, background:'#E5E7EB', display:'flex', alignItems:'center', justifyContent:'center', color:'#9CA3AF', fontSize:16 }}>
                        📦
                      </div>
                    </td>
                    <td>
                      <span className="aw-link" onClick={(e) => { e.stopPropagation(); onDetail(idx); }}>
                        {r.name}
                      </span>
                    </td>
                    <td className="aw-num">{r.code}</td>
                    <td>{r.model}</td>
                    <td><CatBadge cat={r.cat} /></td>
                    <td>{r.unit}</td>
                    <td>{r.source}</td>
                    <td><StateBadge state={r.state} /></td>
                    <td>
                      <span className="aw-link" onClick={(e) => { e.stopPropagation(); onDetail(idx); }}>
                        查看
                      </span>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr className="aw-row-blank">
                  <td colSpan={10} style={{ textAlign:'center', color:'var(--aw-fg-3)', padding:'32px 12px', fontSize:13 }}>
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Footer */}
        <div className="aw-doc-footer">
          <div className="aw-doc-footer-l">
            <span className={'aw-chk' + (allChecked ? ' on' : someChecked ? ' indet' : '')} onClick={toggleAll} style={{ marginRight:6 }} />
            <span>已选 {Object.values(sel).filter(Boolean).length} / {products.length} 项</span>
            <button className="aw-btn" style={{ fontSize:12, padding:'4px 10px' }}>批量操作</button>
          </div>
          <div className="aw-doc-footer-r">
            <span>共 {products.length} 条</span>
            <select className="aw-input" style={{ width:80, padding:'4px 6px' }}>
              <option>10条/页</option>
              <option>20条/页</option>
              <option>50条/页</option>
            </select>
            <span className="aw-pg on">1</span>
          </div>
        </div>
      </div>

      {/* Drawers */}
      {drawer === 'filter' && <FilterDrawer onClose={() => setDrawer(null)} />}
      {drawer === 'field' && <FieldDrawer onClose={() => setDrawer(null)} />}
      {drawer === 'import' && <ImportDrawer onClose={() => setDrawer(null)} />}
      {drawer === 'export' && <ExportDrawer onClose={() => setDrawer(null)} />}
    </>
  );
}

function ProductCustomerPickerModal({ onClose, onConfirm }) {
  const customers = [
    { name:'深圳鹏程科技', group:'重点客户', manager:'张国', phone:'13888888888' },
    { name:'广州智造电子', group:'渠道客户', manager:'李文涛', phone:'13666666666' },
    { name:'杭州云联技术', group:'项目客户', manager:'老夏', phone:'13999999999' },
    { name:'上海恒达精密', group:'长期客户', manager:'陈思源', phone:'13777777777' },
  ];
  const [selected, setSelected] = useState(customers[0]);
  return (
    <Modal title="选择客户" onClose={onClose} size="lg">
      <div style={{display:'grid',gridTemplateColumns:'180px 1fr',gap:14,minHeight:360}}>
        <div className="aw-doc-tree">
          {['全部客户','重点客户','渠道客户','项目客户','长期客户'].map((g,i)=>(
            <div key={g} className={'aw-tree-row aw-tree-l2 '+(i===0?'on':'')}><span>{g}</span></div>
          ))}
        </div>
        <div>
          <div style={{marginBottom:12}}><Input placeholder="搜索客户名称 / 联系人 / 电话" /></div>
          <table className="aw-table">
            <thead><tr><th style={{width:56}}>选择</th><th>客户名称</th><th>客户分组</th><th>客户经理</th><th>联系方式</th></tr></thead>
            <tbody>{customers.map(c=>(
              <tr key={c.name} onClick={()=>setSelected(c)} style={{cursor:'pointer'}}>
                <td><input type="radio" checked={selected.name===c.name} onChange={()=>setSelected(c)} /></td>
                <td>{c.name}</td><td>{c.group}</td><td>{c.manager}</td><td>{c.phone}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
      <div style={{display:'flex',justifyContent:'flex-end',gap:10,marginTop:16}}>
        <button className="aw-btn" onClick={onClose}>取消</button>
        <button className="aw-btn primary" onClick={()=>onConfirm(selected)}>确认</button>
      </div>
    </Modal>
  );
}

// ========== NEW FORM VIEW ==========
function ProductNewView({ onBack }) {
  const [tab, setTab] = useState('sales');
  const [standardUnit, setStandardUnit] = useState('个');
  const [linkedCustomer, setLinkedCustomer] = useState('');
  const [customerPicker, setCustomerPicker] = useState(false);
  const [salesUnits, setSalesUnits] = useState([
    { id:1, unit:'个', qty:1, barcode:'' },
  ]);

  const addSalesUnit = () => {
    setSalesUnits(prev => [...prev, { id:Date.now(), unit:'个', qty:1, barcode:'' }]);
  };

  const removeSalesUnit = (id) => {
    setSalesUnits(prev => prev.filter(u => u.id !== id));
  };

  const updateSalesUnit = (id, field, value) => {
    setSalesUnits(prev => prev.map(u => u.id === id ? { ...u, [field]: value } : u));
  };

  return (
    <div className="aw-doc-form">
      <div className="aw-doc-form-head">
        <span className="aw-link" onClick={onBack}>← 返回列表</span>
        <span style={{ flex:1 }} />
        <button className="aw-btn" onClick={onBack}>取消</button>
        <button className="aw-btn">暂存</button>
        <button className="aw-btn primary">提交审批</button>
      </div>
      <div className="aw-doc-form-body">

        {/* 基础信息 */}
        <Card title="基础信息">
          <div className="aw-doc-grid">
            <Field label="产品名称" req><Input placeholder="请输入产品名称" /></Field>
            <Field label="别名码" req><Input placeholder="请输入别名码" /></Field>
            <Field label="产品编号"><Input defaultValue="自动生成" disabled /></Field>
            <Field label="产品分类" req>
              <Select><option>请选择</option><option>成品</option><option>半成品</option><option>原材料</option></Select>
            </Field>
            <Field label="产品规格"><Input placeholder="型号规格描述" /></Field>
            <Field label={<span>获取方式<HelpTip text="自制件走 BOM、工艺和生产流程；外购件走采购流程。该字段会影响生产计划和成本归集。" /></span>}>
              <div style={{ display:'flex', gap:0 }}>
                <Radio on={true} onClick={() => {}}>自制件</Radio>
                <Radio on={false} onClick={() => {}}>外购件</Radio>
              </div>
            </Field>
            <Field label="标准单位" req>
              <UnitPickerInput value={standardUnit} onChange={unit => setStandardUnit(unit.name)} placeholder="请选择标准单位" />
            </Field>
            <Field label={<span>销售控制<HelpTip text="禁止销售表示临时锁定不可下单；允许销售可直接下单；审批销售表示可销售但必须经过审批。" /></span>}>
              <Select><option>允许销售</option><option>禁止销售</option><option>审批销售</option></Select>
            </Field>
            <Field label={<span>产品状态<HelpTip text="研发：允许打样和生产，禁止销售下单；在售：允许全业务；停产：只允许销售现货，禁止采购/生产；停用：仅保留历史与财务调用。" /></span>}>
              <Select><option>研发</option><option>在售</option><option>停产</option><option>停用</option></Select>
            </Field>
          </div>
        </Card>

        {/* 辅助信息 */}
        <Card title="辅助信息">
          <Tabs items={[
            { k:'sales', label:'销售信息' },
            { k:'stock', label:'库存策略' },
          ]} active={tab} onChange={setTab} />

          {tab === 'sales' && (
            <div>
              <div className="aw-doc-grid" style={{ marginTop:4 }}>
                <Field label={<span>关联客户<HelpTip text="指定客户产品仅允许关联客户下单；普通通用产品可不填。" /></span>}>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <Input value={linkedCustomer} readOnly placeholder="请选择客户" onClick={() => setCustomerPicker(true)} style={{ flex:1, cursor:'pointer' }} />
                    <button className="aw-btn" type="button" onClick={() => setCustomerPicker(true)} style={{ fontSize:12, padding:'5px 10px', whiteSpace:'nowrap' }}>选择</button>
                  </div>
                </Field>
                <Field label="最小销售量"><Input placeholder="0" type="number" /></Field>
                <Field label="建议售价"><Input placeholder="¥ 0.00" /></Field>
                <Field label="质检方案">
                  <Select><option>请选择质检方案</option><option>标准质检方案A</option><option>抽检方案B</option></Select>
                </Field>
                <Field label="执行标准"><Input placeholder="请输入执行标准" /></Field>
                <Field label="销售渠道">
                  <Select><option>全渠道</option><option>线上</option><option>线下</option></Select>
                </Field>
              </div>

              {/* 销售单位倍数表 */}
              <div style={{ marginTop:16 }}>
                <div style={{ fontSize:13, fontWeight:600, marginBottom:8, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span>销售单位倍数表</span>
                  <button className="aw-btn" onClick={addSalesUnit} style={{ fontSize:12, padding:'3px 10px' }}>+ 新增行</button>
                </div>
                <table className="aw-table" style={{ borderRadius:6, overflow:'hidden' }}>
                  <thead>
                    <tr>
                      <th style={{ width:'25%' }}>销售单位</th>
                      <th style={{ width:'25%' }}>换算数量</th>
                      <th style={{ width:'35%' }}>条形码</th>
                      <th style={{ width:'15%' }}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesUnits.map((u, i) => (
                      <tr key={u.id}>
                        <td>
                          <UnitPickerInput value={u.unit} onChange={unit => updateSalesUnit(u.id, 'unit', unit.name)} placeholder="请选择销售单位" />
                        </td>
                        <td>
                          <input className="aw-input" type="number" value={u.qty}
                            onChange={e => updateSalesUnit(u.id, 'qty', e.target.value)} />
                        </td>
                        <td>
                          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                            <input className="aw-input" placeholder="条形码" value={u.barcode}
                              onChange={e => updateSalesUnit(u.id, 'barcode', e.target.value)}
                              style={{ flex:1 }} />
                            <button className="aw-btn" style={{ fontSize:11, padding:'3px 8px', whiteSpace:'nowrap' }}>生成</button>
                          </div>
                        </td>
                        <td>
                          {salesUnits.length > 1 && (
                            <span className="aw-link" onClick={() => removeSalesUnit(u.id)} style={{ color:'#F5222D', fontSize:12 }}>
                              删除
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'stock' && (
            <div>
              <div className="aw-doc-grid" style={{ marginTop:4 }}>
                <div style={{ display:'flex', gap:12 }}>
                  <div style={{ flex:1 }}><Field label="安全库存量"><Input type="number" placeholder="0" /></Field></div>
                  <div style={{ flex:1 }}><Field label="最低库存量"><Input type="number" placeholder="0" /></Field></div>
                  <div style={{ flex:1 }}><Field label="最高库存量"><Input type="number" placeholder="0" /></Field></div>
                </div>
                <Field label="补货周期（天）"><Input type="number" placeholder="7" /></Field>
                <Field label="存储位置"><Input placeholder="如 A-03-12" /></Field>
              </div>
            </div>
          )}
        </Card>

        {/* 媒体与说明 */}
        <Card title="媒体与说明">
          <div className="aw-doc-grid">
            <div style={{ gridColumn:'1 / -1' }}>
              <Field label="产品图片">
                <div style={{ border:'1px dashed #D1D5DB', borderRadius:6, padding:'16px', textAlign:'center', color:'#6B7280', fontSize:13, marginBottom:10 }}>
                  <span className="aw-link">点击上传图片</span>
                  <div style={{ fontSize:11, color:'#9CA3AF', marginTop:4 }}>支持 jpg / png / gif / bmp，单文件 ≤ 1MB</div>
                </div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {/* Preview placeholders */}
                  <div style={{ width:64, height:64, borderRadius:6, background:'#F3F4F6', border:'1px solid #E5E7EB', display:'flex', alignItems:'center', justifyContent:'center', color:'#D1D5DB', fontSize:24 }}>🖼</div>
                  <div style={{ width:64, height:64, borderRadius:6, background:'#F3F4F6', border:'1px solid #E5E7EB', display:'flex', alignItems:'center', justifyContent:'center', color:'#D1D5DB', fontSize:24 }}>🖼</div>
                  <div style={{ width:64, height:64, borderRadius:6, border:'1px dashed #D1D5DB', display:'flex', alignItems:'center', justifyContent:'center', color:'#9CA3AF', fontSize:20, cursor:'pointer' }}>+</div>
                </div>
              </Field>
            </div>
            <div style={{ gridColumn:'1 / -1' }}>
              <Field label="附件">
                <div style={{ border:'1px dashed #D1D5DB', borderRadius:6, padding:'24px', textAlign:'center', color:'#6B7280', fontSize:13 }}>
                  <span className="aw-link">点击上传</span> / 拖拽到此区域 &nbsp;
                  <span style={{ color:'#9CA3AF', fontSize:12 }}>支持 PDF / Word / Excel / 图片，单文件 ≤ 50MB</span>
                </div>
              </Field>
            </div>
            <div style={{ gridColumn:'1 / -1' }}>
              <Field label="产品说明"><Input placeholder="请输入产品说明" /></Field>
            </div>
            <div style={{ gridColumn:'1 / -1' }}>
              <Field label="产品详情">
                <div className="aw-rt-bar">
                  <span>B</span><span><i>I</i></span><span><u>U</u></span><span>S</span>
                  <i style={{ width:1, height:14, background:'#E5E7EB' }} />
                  <span>≡</span><span>≣</span><span>·</span><span>1.</span>
                  <i style={{ width:1, height:14, background:'#E5E7EB' }} />
                  <span>🔗</span><span>📷</span><span>📎</span>
                </div>
                <div className="aw-rt-area" contentEditable suppressContentEditableWarning>
                  请输入产品详情描述…
                </div>
              </Field>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}

// ========== DETAIL VIEW ==========
function ProductDetailView({ product, onBack }) {
  const [tab, setTab] = useState('info');
  const [pricing, setPricing] = useState(PRICING_RECORDS.map(p => ({ ...p })));
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [editPriceData, setEditPriceData] = useState({});

  const startEditPrice = (row) => {
    setEditingPriceId(row.id);
    setEditPriceData({ ...row });
  };

  const saveEditPrice = () => {
    setPricing(prev => prev.map(p => p.id === editingPriceId ? { ...editPriceData } : p));
    setEditingPriceId(null);
    setEditPriceData({});
  };

  const cancelEditPrice = () => {
    setEditingPriceId(null);
    setEditPriceData({});
  };

  const addPricingRow = () => {
    const newId = Math.max(0, ...pricing.map(p => p.id)) + 1;
    setPricing(prev => [...prev, { id:newId, customer:'新客户', price:0, startDate:'', endDate:'', remark:'' }]);
  };

  const deletePricingRow = (id) => {
    setPricing(prev => prev.filter(p => p.id !== id));
  };

  const CatBadge = ({ cat }) => {
    if (cat === '成品') return <Badge>成品</Badge>;
    if (cat === '半成品')
      return <span className="aw-badge y">半成品</span>;
    return <span style={{ display:'inline-flex',alignItems:'center',gap:4,padding:'2px 8px',borderRadius:10,fontSize:11,background:'#F3F4F6',color:'#6B7280' }}>
      <span style={{ width:5,height:5,borderRadius:'50%',background:'#9CA3AF' }}></span>{cat}
    </span>;
  };

  const StateBadge = ({ state }) => {
    if (state === '在售') return <Badge tone="g">在售</Badge>;
    if (state === '研发') return <Badge tone="b">研发</Badge>;
    if (state === '停用') return <span className="aw-state aw-state-gray">停用</span>;
    return <span style={{ display:'inline-flex',alignItems:'center',gap:4,padding:'2px 8px',borderRadius:10,fontSize:11,background:'#F3F4F6',color:'#6B7280' }}>
      <span style={{ width:5,height:5,borderRadius:'50%',background:'#9CA3AF' }}></span>{state}
    </span>;
  };

  if (!product) return null;

  return (
    <div className="aw-doc-form">
      {/* Header */}
      <div className="aw-doc-form-head">
        <span className="aw-link" onClick={onBack}>← 返回列表</span>
        <span style={{ flex:1 }} />
        <button className="aw-btn">编辑</button>
        <button className="aw-btn danger">删除</button>
        <button className="aw-btn">{product.state === '停用' ? '启用' : '停用'}</button>
      </div>
      <div className="aw-doc-form-body">

        {/* Product Info Header */}
        <Card style={{ position:'relative' }}>
          <div style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
            <div style={{ width:80, height:80, borderRadius:8, background:'#E5E7EB', display:'flex', alignItems:'center', justifyContent:'center', color:'#9CA3AF', fontSize:32, flex:'none' }}>
              📦
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:18, fontWeight:600, marginBottom:6 }}>{product.name}</div>
              <div style={{ display:'flex', gap:18, fontSize:12, color:'#6B7280', marginBottom:4 }}>
                <span>创建人：{product.creator}</span>
                <span>创建时间：{product.createdAt}</span>
              </div>
              <div style={{ display:'flex', gap:18, fontSize:12, color:'#6B7280', marginBottom:14 }}>
                <span>修改人：{product.modifier}</span>
                <span>修改时间：{product.modifiedAt}</span>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <Btn>编辑</Btn>
                <Btn>删除</Btn>
                <Btn>打印</Btn>
                <Btn>导出</Btn>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Card>
          <Tabs items={[
            { k:'info', label:'产品信息' },
            { k:'sales', label:'销售记录' },
            { k:'inbound', label:'入库记录' },
            { k:'outbound', label:'出库记录' },
            { k:'pricing', label:'客户价格表' },
            { k:'log', label:'操作记录' },
          ]} active={tab} onChange={setTab} />

          {/* === 产品信息 === */}
          {tab === 'info' && (
            <div>
              {/* KV grid 2 columns */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', rowGap:14, columnGap:32, fontSize:13 }}>
                <KV k="产品编号" v={product.code} />
                <KV k="产品名称" v={product.name} />
                <KV k="别名码" v={product.alias} />
                <KV k="产品分类"><CatBadge cat={product.cat} /></KV>
                <KV k="产品型号" v={product.model} />
                <KV k="产品规格" v={product.spec} />
                <KV k="产品单位" v={product.unit} />
                <KV k="获取方式" v={product.source} />
                <KV k="产品状态"><StateBadge state={product.state} /></KV>
                <KV k="销售控制" v={product.salesCtrl} />
                <KV k="最小销售量" v={String(product.minQty)} />
                <KV k="建议售价" v={product.price} />
                <KV k="质检方案" v={product.qcPlan} />
                <KV k="执行标准" v={product.execStd} />
                <KV k="销售渠道" v={product.channel} />
                <KV k="安全库存量" v={String(product.safeStock)} />
                <KV k="最低库存量" v={String(product.minStock)} />
                <KV k="最高库存量" v={String(product.maxStock)} />
                <KV k="补货周期" v={product.replenish + ' 天'} />
                <KV k="存储位置" v={product.storage} />
              </div>

              {/* Product images */}
              <div style={{ marginTop:18 }}>
                <div className="aw-section-title">产品图片</div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  <div style={{ width:80, height:80, borderRadius:6, background:'#F3F4F6', border:'1px solid #E5E7EB', display:'flex', alignItems:'center', justifyContent:'center', color:'#D1D5DB', fontSize:28 }}>🖼</div>
                  <div style={{ width:80, height:80, borderRadius:6, background:'#F3F4F6', border:'1px solid #E5E7EB', display:'flex', alignItems:'center', justifyContent:'center', color:'#D1D5DB', fontSize:28 }}>🖼</div>
                </div>
              </div>

              {/* Attachments */}
              <div style={{ marginTop:18 }}>
                <div className="aw-section-title">附件</div>
                <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                  <div style={{ border:'1px solid #E5E7EB', borderRadius:6, padding:'8px 12px', fontSize:12, display:'flex', alignItems:'center', gap:8 }}>
                    📄 产品规格书.pdf <span style={{ color:'#9CA3AF' }}>2.3MB</span>
                    <span className="aw-link" style={{ fontSize:12 }}>下载</span>
                  </div>
                  <div style={{ border:'1px solid #E5E7EB', borderRadius:6, padding:'8px 12px', fontSize:12, display:'flex', alignItems:'center', gap:8 }}>
                    📄 质检报告.xlsx <span style={{ color:'#9CA3AF' }}>856KB</span>
                    <span className="aw-link" style={{ fontSize:12 }}>下载</span>
                  </div>
                </div>
              </div>

              {/* Product description */}
              <div style={{ marginTop:18 }}>
                <div className="aw-section-title">产品说明</div>
                <div style={{ fontSize:13, color:'#4B5563', lineHeight:1.7 }}>{product.desc}</div>
              </div>

              {/* Rich text detail */}
              <div style={{ marginTop:18 }}>
                <div className="aw-section-title">产品详情</div>
                <div style={{ fontSize:13, color:'#1F2937', lineHeight:1.7, border:'1px solid #E5E7EB', borderRadius:6, padding:14, background:'#FAFBFC' }}>
                  <p><b>产品概述：</b>{product.name}（型号 {product.model}）是海南傲为智慧自主{product.source === '自制' ? '研发生产' : '采购'}的{product.cat}，产品编号 <span className="aw-num">{product.code}</span>，当前状态为{product.state}。</p>
                  <p><b>规格参数：</b>{product.spec}。标准单位为{product.unit}，建议售价 {product.price}。</p>
                  <p><b>质检标准：</b>采用{product.qcPlan}，执行标准 {product.execStd}。</p>
                  <p><b>库存策略：</b>安全库存 {product.safeStock}{product.unit}，最低 {product.minStock}{product.unit}，最高 {product.maxStock}{product.unit}，补货周期 {product.replenish} 天，存储于 {product.storage} 库位。</p>
                </div>
              </div>
            </div>
          )}

          {/* === 销售记录 === */}
          {tab === 'sales' && (
            <table className="aw-table">
              <thead>
                <tr>
                  <th>销售单号</th><th>客户</th><th>数量</th><th>单价(¥)</th><th>金额(¥)</th><th>日期</th><th>状态</th>
                </tr>
              </thead>
              <tbody>
                {SALES_RECORDS.map((r, i) => (
                  <tr key={i}>
                    <td className="aw-num">{r.code}</td>
                    <td>{r.customer}</td>
                    <td className="aw-num">{r.qty}</td>
                    <td className="aw-num">{r.price.toFixed(2)}</td>
                    <td className="aw-num" style={{ color:'#F5222D', fontWeight:500 }}>{r.amount.toLocaleString()}</td>
                    <td className="aw-num">{r.date}</td>
                    <td>
                      <span className={'aw-state aw-state-' + (r.state === '已完成' ? 'g' : r.state === '已发货' ? 'b' : 'r')}>
                        {r.state}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* === 入库记录 === */}
          {tab === 'inbound' && (
            <table className="aw-table">
              <thead>
                <tr>
                  <th>入库单号</th><th>仓库</th><th>数量</th><th>批次号</th><th>日期</th><th>操作人</th>
                </tr>
              </thead>
              <tbody>
                {INBOUND_RECORDS.map((r, i) => (
                  <tr key={i}>
                    <td className="aw-num">{r.code}</td>
                    <td>{r.warehouse}</td>
                    <td className="aw-num">{r.qty}</td>
                    <td className="aw-num">{r.batch}</td>
                    <td className="aw-num">{r.date}</td>
                    <td>{r.operator}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* === 出库记录 === */}
          {tab === 'outbound' && (
            <table className="aw-table">
              <thead>
                <tr>
                  <th>出库单号</th><th>仓库</th><th>数量</th><th>类型</th><th>日期</th><th>操作人</th>
                </tr>
              </thead>
              <tbody>
                {OUTBOUND_RECORDS.map((r, i) => (
                  <tr key={i}>
                    <td className="aw-num">{r.code}</td>
                    <td>{r.warehouse}</td>
                    <td className="aw-num">{r.qty}</td>
                    <td>{r.type}</td>
                    <td className="aw-num">{r.date}</td>
                    <td>{r.operator}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* === 客户价格表 === */}
          {tab === 'pricing' && (
            <div>
              <div style={{ marginBottom:10, display:'flex', justifyContent:'flex-end' }}>
                <button className="aw-btn primary" onClick={addPricingRow} style={{ fontSize:12 }}>+ 新增行</button>
              </div>
              <table className="aw-table">
                <thead>
                  <tr>
                    <th>客户</th><th>价格(¥)</th><th>有效期起</th><th>有效期止</th><th>备注</th><th style={{ width:100 }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {pricing.map((r) => (
                    <tr key={r.id}>
                      {editingPriceId === r.id ? (
                        <>
                          <td><input className="aw-input" value={editPriceData.customer} onChange={e => setEditPriceData(prev => ({ ...prev, customer: e.target.value }))} /></td>
                          <td><input className="aw-input" type="number" value={editPriceData.price} onChange={e => setEditPriceData(prev => ({ ...prev, price: Number(e.target.value) }))} /></td>
                          <td><input className="aw-input" value={editPriceData.startDate} onChange={e => setEditPriceData(prev => ({ ...prev, startDate: e.target.value }))} /></td>
                          <td><input className="aw-input" value={editPriceData.endDate} onChange={e => setEditPriceData(prev => ({ ...prev, endDate: e.target.value }))} /></td>
                          <td><input className="aw-input" value={editPriceData.remark} onChange={e => setEditPriceData(prev => ({ ...prev, remark: e.target.value }))} /></td>
                          <td>
                            <span className="aw-link" onClick={saveEditPrice} style={{ marginRight:8 }}>保存</span>
                            <span className="aw-link" onClick={cancelEditPrice} style={{ color:'#6B7280' }}>取消</span>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{r.customer}</td>
                          <td className="aw-num">{r.price.toFixed(2)}</td>
                          <td className="aw-num">{r.startDate}</td>
                          <td className="aw-num">{r.endDate}</td>
                          <td>{r.remark}</td>
                          <td>
                            <span className="aw-link" onClick={() => startEditPrice(r)} style={{ marginRight:8 }}>编辑</span>
                            <span className="aw-link" onClick={() => deletePricingRow(r.id)} style={{ color:'#F5222D' }}>删除</span>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* === 操作记录 === */}
          {tab === 'log' && (
            <div>
              {/* Timeline */}
              {OPERATION_LOGS.map((log, i) => (
                <div key={i} style={{
                  display:'flex', gap:16, padding:'14px 0',
                  borderBottom: i < OPERATION_LOGS.length - 1 ? '1px solid var(--aw-divider)' : 'none',
                  position:'relative',
                }}>
                  {/* Timeline dot + line */}
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flex:'none', width:24 }}>
                    <div style={{
                      width:10, height:10, borderRadius:'50%',
                      background: i === 0 ? '#5677FC' : '#D1D5DB',
                      flex:'none', marginTop:4,
                    }} />
                    {i < OPERATION_LOGS.length - 1 && (
                      <div style={{ width:2, flex:1, background:'#E5E7EB', minHeight:20 }} />
                    )}
                  </div>
                  {/* Content */}
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                      <span style={{ fontSize:13, fontWeight:500, color:'#1F2937' }}>{log.operator}</span>
                      <span style={{ fontSize:11, color:'#9CA3AF', fontFamily:'var(--aw-font-num)' }}>{log.time}</span>
                    </div>
                    <div style={{ fontSize:13, color:'#4B5563' }}>{log.content}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
      {customerPicker && <ProductCustomerPickerModal onClose={() => setCustomerPicker(false)} onConfirm={(customer) => { setLinkedCustomer(customer.name); setCustomerPicker(false); }} />}
    </div>
  );
}

// KV display helper
function KV({ k, v }) {
  return (
    <div style={{ display:'flex', gap:18 }}>
      <span style={{ color:'#6B7280', width:90, flex:'none' }}>{k}</span>
      <span>：{v}</span>
    </div>
  );
}

// ========== MAIN SCREEN ==========
function ProductListScreen({ module: mod, initialAction, onActionConsumed }) {
  const m = mod || MODULES.product;
  const [view, setView] = useState('list');
  const [picked, setPicked] = useState('fin');
  const [detailIdx, setDetailIdx] = useState(null);
  const [sel, setSel] = useState({});

  useEffect(() => {
    if (initialAction === 'new') { setView('new'); onActionConsumed && onActionConsumed(); }
    else if (initialAction === 'list') { setView('list'); onActionConsumed && onActionConsumed(); }
  }, [initialAction]);

  // Filter products by category tree selection
  const filteredProducts = (() => {
    if (picked === 'cat-a') return PRODUCTS.filter(p => p.subCatKey === 'cat-a');
    if (picked === 'cat-b') return PRODUCTS.filter(p => p.subCatKey === 'cat-b');
    return PRODUCTS.filter(p => p.parentCat === picked);
  })();

  // Checkbox state
  const allChecked = filteredProducts.length > 0 && filteredProducts.every((_, i) => sel[i]);
  const someChecked = filteredProducts.some((_, i) => sel[i]);
  const toggleAll = () => {
    if (allChecked) setSel({});
    else { const n = {}; filteredProducts.forEach((_, i) => n[i] = true); setSel(n); }
  };
  const toggleRow = (i) => setSel(s => ({ ...s, [i]: !s[i] }));

  return (
    <div className="aw-doc-page">
      {view === 'list' && (
        <ProductTree picked={picked} setPicked={setPicked} />
      )}
      <div className="aw-doc-main">
        {view === 'list' && (
          <ProductListView
            picked={picked}
            products={filteredProducts}
            onNew={() => setView('new')}
            onDetail={(idx) => { setDetailIdx(idx); setView('detail'); }}
            sel={sel}
            toggleRow={toggleRow}
            allChecked={allChecked}
            someChecked={someChecked}
            toggleAll={toggleAll}
          />
        )}
        {view === 'new' && (
          <ProductNewView onBack={() => setView('list')} />
        )}
        {view === 'detail' && (
          <ProductDetailView
            product={detailIdx !== null ? filteredProducts[detailIdx] : PRODUCTS[0]}
            onBack={() => setView('list')}
          />
        )}
      </div>
    </div>
  );
}

window.ProductListScreen = ProductListScreen;
