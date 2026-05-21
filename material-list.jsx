// material-list.jsx — 物料管理 MaterialListScreen（列表 / 新增 / 详情三态）
// Session: 260515-sharp-sage

const { useState, useEffect } = React;

// ═══════════════════════════════════════════════════════════════
//  Mock Data
// ═══════════════════════════════════════════════════════════════
const MATERIAL_ROWS = [
  { code: 'MAT-2025-001', name: 'STM32F407VGT6 微控制器', category: '电子物料', subCat: '芯片类', spec: 'LQFP-100 32位', unit: '个', method: '外购件', status: '启用', stTone: 'g', supplier: '深圳华强电子', pinyin: 'STM32F407VGT6' },
  { code: 'MAT-2025-002', name: 'MLCC 陶瓷电容 10μF', category: '电子物料', subCat: '电容类', spec: '0805 16V ±10%', unit: '个', method: '外购件', status: '启用', stTone: 'g', supplier: '上海国巨电子', pinyin: 'MLCCTCDR10UF' },
  { code: 'MAT-2025-003', name: 'M6×20 不锈钢内六角螺栓', category: '机械物料', subCat: '紧固件', spec: 'M6×20 SUS304', unit: '个', method: '外购件', status: '停用', stTone: 'gray', supplier: '无锡博尔紧固件', pinyin: 'M6X20BXGNLJLS' },
  { code: 'MAT-2025-004', name: '铝合金散热片 100×100', category: '机械物料', subCat: '紧固件', spec: '100×100×25mm 银色', unit: '片', method: '外购件', status: '启用', stTone: 'g', supplier: '广州五金散热', pinyin: 'LHJSRP100X100' },
  { code: 'MAT-2025-005', name: '瓦楞纸箱 400×300×200', category: '包装物料', subCat: '纸箱类', spec: '400×300×200mm 三层', unit: '个', method: '用品', status: '启用', stTone: 'g', supplier: '海南昌茂包装', pinyin: 'WLZX400X300X200' },
  { code: 'MAT-2025-006', name: 'EPE防静电泡棉', category: '包装物料', subCat: '纸箱类', spec: '厚度5mm 红色', unit: '张', method: '外购件', status: '禁止采购', stTone: 'gray', supplier: '深圳永利包装', pinyin: 'EPEFJDDPM' },
];

// Mock purchase records for detail view
const PURCHASE_RECORDS = [
  { orderCode: 'PO-2025-0103', supplier: '深圳华强电子', qty: 500, unitPrice: 18.50, amount: 9250.00, date: '2025-05-10', status: '已入库', sTone: 'g' },
  { orderCode: 'PO-2025-0108', supplier: '上海国巨电子', qty: 2000, unitPrice: 0.35, amount: 700.00, date: '2025-05-08', status: '部分入库', sTone: 'y' },
  { orderCode: 'PO-2025-0112', supplier: '无锡博尔紧固件', qty: 3000, unitPrice: 1.20, amount: 3600.00, date: '2025-04-28', status: '已入库', sTone: 'g' },
  { orderCode: 'PO-2025-0115', supplier: '广州五金散热', qty: 150, unitPrice: 25.00, amount: 3750.00, date: '2025-04-20', status: '已入库', sTone: 'g' },
  { orderCode: 'PO-2025-0120', supplier: '海南昌茂包装', qty: 800, unitPrice: 3.80, amount: 3040.00, date: '2025-03-15', status: '待审批', sTone: 'b' },
];

// Mock inbound records
const INBOUND_RECORDS = [
  { inCode: 'IN-2025-0056', warehouse: '原料仓A区', qty: 500, batchNo: 'B20250510-01', date: '2025-05-11', operator: '老夏' },
  { inCode: 'IN-2025-0052', warehouse: '原料仓B区', qty: 2000, batchNo: 'B20250509-02', date: '2025-05-09', operator: '李文涛' },
  { inCode: 'IN-2025-0048', warehouse: '原料仓A区', qty: 150, batchNo: 'B20250422-01', date: '2025-04-22', operator: '陈思源' },
];

// Mock outbound records
const OUTBOUND_RECORDS = [
  { outCode: 'OUT-2025-0089', warehouse: '原料仓A区', qty: 200, type: '生产领用', date: '2025-05-12', operator: '王志强' },
  { outCode: 'OUT-2025-0085', warehouse: '原料仓B区', qty: 500, type: '委外加工', date: '2025-05-10', operator: '老夏' },
  { outCode: 'OUT-2025-0081', warehouse: '原料仓A区', qty: 50, type: '样品领用', date: '2025-04-25', operator: '赵工' },
];

// Mock price history
const PRICE_HISTORY = [
  { supplier: '深圳华强电子', price: 18.50, date: '2025-05-10', orderCode: 'PO-2025-0103', remark: '批量采购优惠价' },
  { supplier: '深圳华强电子', price: 20.00, date: '2025-01-15', orderCode: 'PO-2025-0020', remark: '' },
  { supplier: '深圳华强电子', price: 22.50, date: '2024-09-01', orderCode: 'PO-2024-0188', remark: '首次采购定价' },
];

// Mock suppliers
const MATERIAL_SUPPLIERS = [
  { name: '深圳华强电子', contact: '张经理', phone: '138-8888-0001', ratio: '60%', coopStatus: '合作中', csTone: 'g' },
  { name: '上海国巨电子', contact: '李主管', phone: '139-9999-0002', ratio: '30%', coopStatus: '合作中', csTone: 'g' },
  { name: '广州恒达元件', contact: '王经理', phone: '137-7777-0003', ratio: '10%', coopStatus: '已暂停', csTone: 'gray' },
];

// Mock operation logs
const MATERIAL_LOGS = [
  { operator: '老夏', action: '创建物料档案', time: '2025-03-01 09:00' },
  { operator: '老夏', action: '设置物料状态为「启用」', time: '2025-03-01 09:05' },
  { operator: '李文涛', action: '修改物料规格参数', time: '2025-04-10 14:30' },
  { operator: '李文涛', action: '新增供应商「上海国巨电子」', time: '2025-04-12 11:00' },
  { operator: '陈思源', action: '上传物料图片', time: '2025-05-08 16:45' },
];

// ═══════════════════════════════════════════════════════════════
//  Category tree config
// ═══════════════════════════════════════════════════════════════
const MATERIAL_TREE = [
  { k: 'elec', label: '电子物料', open: true, kids: [{ k: 'e1', label: '芯片类' }, { k: 'e2', label: '电容类' }] },
  { k: 'mech', label: '机械物料', open: false, kids: [{ k: 'm1', label: '紧固件' }] },
  { k: 'pack', label: '包装物料', open: false, kids: [{ k: 'p1', label: '纸箱类' }] },
];

// Category display label map
const CAT_LABEL_MAP = {
  elec: '电子物料', mech: '机械物料', pack: '包装物料',
  e1: '芯片类', e2: '电容类', m1: '紧固件', p1: '纸箱类',
};

// Category → badge tone
const CAT_BADGE_TONE = {
  '电子物料': 'b',
  '机械物料': 'y',
  '包装物料': undefined, // gray default
};

// Sub category draw
const CAT_SUB_CAT = {
  '电子物料': { '芯片类': [], '电容类': [] },
  '机械物料': { '紧固件': [] },
  '包装物料': { '纸箱类': [] },
};

// ═══════════════════════════════════════════════════════════════
//  Small Table sub-component (for procurement unit multiplier table)
// ═══════════════════════════════════════════════════════════════
function SmallTable({ rows, onAdd, onRemove, onChange }) {
  return (
    <div>
      <table className="aw-table" style={{ marginBottom: 8 }}>
        <thead>
          <tr>
            <th style={{ width: 140 }}>供应单位</th>
            <th style={{ width: 120 }}>换算系数</th>
            <th style={{ width: 180 }}>条形码</th>
            <th style={{ width: 60 }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>
                <UnitPickerInput value={r.unit} onChange={unit => onChange(i, 'unit', unit.name)} placeholder="请选择供应单位" />
              </td>
              <td><Input type="number" value={r.factor} onChange={e => onChange(i, 'factor', e.target.value)} placeholder="如 100" /></td>
              <td>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <Input value={r.barcode} onChange={e => onChange(i, 'barcode', e.target.value)} placeholder="条形码" style={{ flex: 1 }} />
                  <Btn onClick={() => { /* generate barcode */ }} style={{ fontSize: 11, padding: '4px 8px' }}>生成</Btn>
                </div>
              </td>
              <td>
                {rows.length > 1 && (
                  <span style={{ color: 'var(--aw-danger)', cursor: 'pointer', fontSize: 13 }} onClick={() => onRemove(i)}>删除</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Btn onClick={onAdd}>+ 新增行</Btn>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Category Tree
// ═══════════════════════════════════════════════════════════════
function MaterialTree({ picked, setPicked, rows }) {
  const countByKey = (k) => {
    const label = CAT_LABEL_MAP[k];
    if (!label) return rows.length;
    if (['elec', 'mech', 'pack'].includes(k)) {
      // parent: count all children
      const parentLabel = CAT_LABEL_MAP[k];
      const subLabels = (MATERIAL_TREE.find(n => n.k === k)?.kids || []).map(c => CAT_LABEL_MAP[c.k]);
      return rows.filter(r => subLabels.includes(r.subCat)).length;
    } else {
      return rows.filter(r => r.subCat === label).length;
    }
  };

  return (
    <div className="aw-doc-tree">
      <div className="aw-doc-tree-h">物料库 <span className="aw-doc-tree-n">({rows.length})</span></div>
      <div className="aw-doc-tree-list">
        {MATERIAL_TREE.map(n => (
          <div key={n.k}>
            <div
              className={'aw-tree-row aw-tree-l2' + (picked === n.k ? ' on' : '')}
              onClick={() => setPicked(n.k)}
            >
              <span className="aw-tree-caret">{n.open ? '▾' : '▸'}</span>
              <TileIcon name="folder" size={14} />
              <span>{n.label}</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--aw-fg-3)', fontFamily: 'var(--aw-font-num)' }}>{countByKey(n.k)}</span>
            </div>
            {n.open && n.kids.map(c => (
              <div
                key={c.k}
                className={'aw-tree-row aw-tree-l3' + (picked === c.k ? ' on' : '')}
                onClick={() => setPicked(c.k)}
              >
                <TileIcon name="doc" size={13} />
                <span>{c.label}</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--aw-fg-3)', fontFamily: 'var(--aw-font-num)' }}>{countByKey(c.k)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  List View — Toolbar + Table
// ═══════════════════════════════════════════════════════════════
function MaterialListView({ onNew, onView, picked }) {
  const [drawer, setDrawer] = useState(null);
  const [sel, setSel] = useState({});
  const [search, setSearch] = useState('');

  // Filter rows by category tree selection
  const label = CAT_LABEL_MAP[picked];
  let rows = MATERIAL_ROWS;
  if (label) {
    if (['elec', 'mech', 'pack'].includes(picked)) {
      // parent: filter by all child subCats
      const parentLabel = CAT_LABEL_MAP[picked];
      const subLabels = (MATERIAL_TREE.find(n => n.k === picked)?.kids || []).map(c => CAT_LABEL_MAP[c.k]);
      rows = rows.filter(r => subLabels.includes(r.subCat));
    } else {
      rows = rows.filter(r => r.subCat === label);
    }
  }

  // Search filter
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    rows = rows.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.code.toLowerCase().includes(q) ||
      r.spec.toLowerCase().includes(q) ||
      r.pinyin.toLowerCase().includes(q)
    );
  }

  const allChecked = rows.length > 0 && rows.every((_, i) => sel[i]);
  const someChecked = rows.some((_, i) => sel[i]);
  const toggleAll = () => { if (allChecked) setSel({}); else { const n = {}; rows.forEach((_, i) => n[i] = true); setSel(n); } };
  const toggleRow = (i) => setSel(s => ({ ...s, [i]: !s[i] }));

  // Get parent filter name for display
  const parentLabel = ['elec', 'mech', 'pack'].includes(picked) ? CAT_LABEL_MAP[picked] : null;

  return (
    <>
      <div className="aw-doc-tb">
        <div className="aw-doc-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8"><circle cx="11" cy="11" r="6" /><path d="M16 16l4 4" /></svg>
          <input placeholder="搜索物料名称 / 编号 / 拼音码…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <RefreshAction />
        <button className="aw-btn" onClick={() => setDrawer('filter')}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 5h18M6 12h12M10 19h4" /></svg>筛选</button>
        <button className="aw-btn" onClick={() => setDrawer('field')}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="7" height="7" /><rect x="14" y="4" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>字段配置</button>
        <button className="aw-btn" onClick={() => setDrawer('export')}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 4v12" /><path d="M7 11l5 5 5-5" /><path d="M4 20h16" /></svg>导出</button>
        <button className="aw-btn" onClick={() => setDrawer('import')}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 20V8" /><path d="M7 13l5-5 5 5" /><path d="M4 4h16" /></svg>导入</button>
        <button className="aw-btn primary" onClick={onNew}>新增物料</button>
      </div>

      <div className="aw-doc-tbl-wrap">
        <div className="aw-doc-tbl-inner">
          <table className="aw-doc-tbl">
            <thead>
              <tr>
                <th style={{ width: 40 }}><div className="aw-th-inner"><span className={'aw-chk' + (allChecked ? ' on' : someChecked ? ' indet' : '')} onClick={toggleAll} /></div></th>
                <th style={{ width: 60 }}><div className="aw-th-inner">图片</div></th>
                <th style={{ width: 160 }}><div className="aw-th-inner">物料名称</div></th>
                <th style={{ width: 140 }}><div className="aw-th-inner">物料编号</div></th>
                <th style={{ width: 100 }}><div className="aw-th-inner">物料规格</div></th>
                <th style={{ width: 100 }}><div className="aw-th-inner">物料分类</div></th>
                <th style={{ width: 80 }}><div className="aw-th-inner">标准单位</div></th>
                <th style={{ width: 90 }}><div className="aw-th-inner">获取方式</div></th>
                <th style={{ width: 80 }}><div className="aw-th-inner">物料状态</div></th>
                <th style={{ width: 80 }}><div className="aw-th-inner">操作</div></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} style={{ cursor: 'pointer' }}>
                  <td onClick={e => { e.stopPropagation(); toggleRow(i); }}><span className={'aw-chk' + (sel[i] ? ' on' : '')} /></td>
                  <td>
                    <div style={{
                      width: 40, height: 40, borderRadius: 4,
                      background: r.category === '电子物料' ? '#DCE7FB' : r.category === '机械物料' ? '#FDECDC' : '#F6EFD9',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, color: r.category === '电子物料' ? '#3D5DC9' : r.category === '机械物料' ? '#B26A24' : '#6D5818',
                    }}>
                      {r.category === '电子物料' ? '🔌' : r.category === '机械物料' ? '🔩' : '📦'}
                    </div>
                  </td>
                  <td className="aw-link" onClick={() => onView(MATERIAL_ROWS.indexOf(r))}>{r.name}</td>
                  <td className="aw-num">{r.code}</td>
                  <td>{r.spec}</td>
                  <td>
                    <Badge tone={CAT_BADGE_TONE[r.category]}>{r.category}</Badge>
                  </td>
                  <td>{r.unit}</td>
                  <td>
                    <span className={'aw-badge' + (r.method === '外购件' ? '' : ' y')} style={r.method === '用品' ? { background: 'var(--aw-tint-peach)', color: '#B26A24' } : undefined}>
                      {r.method}
                    </span>
                  </td>
                  <td><Badge tone={r.stTone === 'g' ? 'g' : r.stTone === 'gray' ? undefined : 'y'}>{r.status}</Badge></td>
                  <td><span className="aw-link" onClick={(e) => { e.stopPropagation(); onView(MATERIAL_ROWS.indexOf(r)); }}>查看</span></td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr className="aw-row-blank"><td colSpan={10} style={{ textAlign: 'center', color: 'var(--aw-fg-3)', padding: '32px 12px', fontSize: 13 }}>暂无匹配数据</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {drawer === 'filter' && <FilterDrawer onClose={() => setDrawer(null)} />}
      {drawer === 'field'  && <FieldDrawer onClose={() => setDrawer(null)} />}
      {drawer === 'import' && <ImportDrawer onClose={() => setDrawer(null)} />}
      {drawer === 'export' && <ExportDrawer onClose={() => setDrawer(null)} />}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  New View — Multi-card form with nested tabs
// ═══════════════════════════════════════════════════════════════
function MaterialNewView({ onBack }) {
  const [auxTab, setAuxTab] = useState('purchase'); // 'purchase' | 'stock'
  const [standardUnit, setStandardUnit] = useState('个');
  const [mainSupplier, setMainSupplier] = useState('');
  const [showSupplierPicker, setShowSupplierPicker] = useState(false);
  const [catLevel1, setCatLevel1] = useState('');
  const [catLevel2, setCatLevel2] = useState('');
  const [unitRows, setUnitRows] = useState([
    { unit: '个', factor: '1', barcode: '' },
    { unit: '箱', factor: '100', barcode: '' },
  ]);

  const addUnitRow = () => setUnitRows(prev => [...prev, { unit: '', factor: '', barcode: '' }]);
  const removeUnitRow = (i) => setUnitRows(prev => prev.filter((_, idx) => idx !== i));
  const updateUnitRow = (i, field, val) => {
    setUnitRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
  };

  return (
    <div className="aw-doc-form">
      {/* Header */}
      <div className="aw-doc-form-head">
        <span className="aw-link" onClick={onBack}>← 返回列表</span>
        <span style={{ flex: 1 }} />
        <button className="aw-btn" onClick={onBack}>取消</button>
        <button className="aw-btn">暂存</button>
        <button className="aw-btn primary">提交审批</button>
      </div>

      <div className="aw-doc-form-body">
        {/* ── Card 1: 基础信息 ── */}
        <Card title="基础信息">
          <div className="aw-doc-grid">
            <Field label="物料名称" req>
              <Input placeholder="请输入物料名称" />
            </Field>
            <Field label="拼音码" req>
              <Input placeholder="请输入拼音码" />
            </Field>
            <Field label="物料编号">
              <Input defaultValue="自动生成" disabled />
            </Field>
            <Field label="物料分类" req>
              <Select value={catLevel1} onChange={e => { setCatLevel1(e.target.value); setCatLevel2(''); }}>
                <option value="">请选择分类</option>
                {Object.keys(CAT_SUB_CAT).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </Select>
            </Field>
            {catLevel1 && (
              <Field label="二级分类" req>
                <Select value={catLevel2} onChange={e => setCatLevel2(e.target.value)}>
                  <option value="">请选择</option>
                  {Object.keys(CAT_SUB_CAT[catLevel1] || {}).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </Select>
              </Field>
            )}
            <Field label="物料规格">
              <Input placeholder="请输入规格" />
            </Field>
            <Field label={<span>获取方式<HelpTip text="外购件走采购；客供料由客户提供且成本为0；委外件触发委外加工；用品为生产辅助消耗，通常不进 BOM。" /></span>}>
              <div style={{ display: 'flex', alignItems: 'center', paddingTop: 6 }}>
                <Radio on={true} onClick={() => {}}>外购件</Radio>
                <Radio on={false} onClick={() => {}}>客供料</Radio>
                <Radio on={false} onClick={() => {}}>委外件</Radio>
                <Radio on={false} onClick={() => {}}>用品</Radio>
              </div>
            </Field>
            <Field label="标准单位" req>
              <UnitPickerInput value={standardUnit} onChange={unit => setStandardUnit(unit.name)} placeholder="请选择标准单位" />
            </Field>
            <Field label={<span>销售控制<HelpTip text="禁止销售表示默认禁止作为销售产品；允许销售可直接下单；审批销售表示销售前需审批。" /></span>}>
              <Select defaultValue="禁止销售">
                <option>允许销售</option>
                <option>禁止销售</option>
                <option>审批销售</option>
              </Select>
            </Field>
            <Field label={<span>物料状态<HelpTip text="启用：正常使用；停用：不可新增引用但保留历史；禁止采购：采购模块不可选择，但生产、库存、财务按权限可用。" /></span>}>
              <Select defaultValue="启用">
                <option>启用</option>
                <option>停用</option>
                <option>禁止采购</option>
              </Select>
            </Field>
          </div>
        </Card>

        {/* ── Card 2: 辅助信息 ── */}
        <Card title="辅助信息">
          <div style={{ marginBottom: 14 }}>
            <Tabs
              items={[
                { k: 'purchase', label: '采购信息' },
                { k: 'stock', label: '库存策略' },
              ]}
              active={auxTab}
              onChange={setAuxTab}
            />
          </div>

          {auxTab === 'purchase' && (
            <div>
              <div className="aw-doc-grid" style={{ marginBottom: 18 }}>
                <Field label="是否原料" req>
                  <Select>
                    <option value="">请选择</option>
                    <option>是</option>
                    <option>否</option>
                  </Select>
                </Field>
                <Field label={<span>主供应商<HelpTip text="主供应商必须来自已建档且已审核的正式供应商；询价产生的临时供应商需转正后才可设为主供应商。" /></span>}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Input value={mainSupplier} placeholder="请选择主供应商" readOnly onClick={() => setShowSupplierPicker(true)} style={{ flex: 1, cursor:'pointer' }} />
                    <Btn onClick={() => setShowSupplierPicker(true)}>选择</Btn>
                  </div>
                </Field>
                <Field label={<span>最小采购量<HelpTip text="采购下单时按采购单位校验，采购单位与标准单位不一致时需先做单位换算。" /></span>}>
                  <Input type="number" placeholder="请输入最小采购量" />
                </Field>
                <Field label="建议进价">
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 10, top: 8, fontSize: 13, color: 'var(--aw-fg-2)', zIndex: 1 }}>¥</span>
                    <Input placeholder="请输入建议进价" style={{ paddingLeft: 22 }} />
                  </div>
                </Field>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--aw-fg-1)', marginBottom: 8 }}>采购单位倍数表</div>
              <SmallTable
                rows={unitRows}
                onAdd={addUnitRow}
                onRemove={removeUnitRow}
                onChange={updateUnitRow}
              />
            </div>
          )}

          {auxTab === 'stock' && (
            <div>
              <div className="aw-doc-grid">
                <Field label="最大库存">
                  <Input type="number" placeholder="请输入最大库存" />
                </Field>
                <Field label="安全库存">
                  <Input type="number" placeholder="请输入安全库存" />
                </Field>
                <Field label="采源预警（天）">
                  <Input type="number" placeholder="请输入预警天数" />
                </Field>
              </div>
              <div className="aw-doc-grid" style={{ marginTop: 0 }}>
                <Field label="最低库存量">
                  <Input type="number" placeholder="请输入最低库存量" />
                </Field>
                <Field label="补货周期（天）">
                  <Input type="number" placeholder="请输入补货周期" />
                </Field>
              </div>
            </div>
          )}
        </Card>

        {/* ── Card 3: 媒体与说明 ── */}
        <Card title="媒体与说明">
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 13, color: 'var(--aw-fg-2)', marginBottom: 8 }}>物料图片</div>
            <div style={{
              border: '1px dashed #D1D5DB', borderRadius: 6, padding: '24px',
              textAlign: 'center', color: '#6B7280', fontSize: 13, marginBottom: 10,
            }}>
              <span className="aw-link">点击上传</span> / 拖拽到此区域 &nbsp;
              <span style={{ color: '#9CA3AF', fontSize: 12 }}>支持 JPG / PNG / WebP，单张 ≤ 5MB</span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[{ bg: '#DCE7FB', emoji: '📷' }, { bg: '#DBF3E6', emoji: '🖼' }, { bg: '#FDECDC', emoji: '📸' }].map((p, i) => (
                <div key={i} style={{
                  width: 72, height: 72, borderRadius: 6, border: '1px solid var(--aw-border)',
                  background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, position: 'relative',
                }}>
                  {p.emoji}
                  <span style={{
                    position: 'absolute', top: -6, right: -6, width: 18, height: 18,
                    borderRadius: '50%', background: '#fff', border: '1px solid var(--aw-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, color: 'var(--aw-fg-3)', cursor: 'pointer',
                  }}>×</span>
                </div>
              ))}
              <div style={{
                width: 72, height: 72, borderRadius: 6, border: '1px dashed #D1D5DB',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, color: '#D1D5DB', cursor: 'pointer',
              }}>+</div>
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 13, color: 'var(--aw-fg-2)', marginBottom: 8 }}>附件</div>
            <div style={{
              border: '1px dashed #D1D5DB', borderRadius: 6, padding: '24px',
              textAlign: 'center', color: '#6B7280', fontSize: 13,
            }}>
              <span className="aw-link">点击上传</span> / 拖拽到此区域 &nbsp;
              <span style={{ color: '#9CA3AF', fontSize: 12 }}>支持 PDF / Word / Excel / 图片，单文件 ≤ 50MB</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 13, color: 'var(--aw-fg-2)', marginBottom: 8 }}>物料说明</div>
            <div>
              <div className="aw-rt-bar">
                <span>B</span><span><i>I</i></span><span><u>U</u></span><span>S</span>
                <i style={{ width: 1, height: 14, background: '#E5E7EB' }} />
                <span>≡</span><span>≣</span><span>·</span><span>1.</span>
                <i style={{ width: 1, height: 14, background: '#E5E7EB' }} />
                <span>🔗</span><span>📷</span><span>📎</span>
              </div>
              <div className="aw-rt-area" contentEditable suppressContentEditableWarning>
                请输入物料说明…
              </div>
            </div>
          </div>
        </Card>
      </div>
      {showSupplierPicker && <SimpleSupplierPickerModal onClose={() => setShowSupplierPicker(false)} onConfirm={(supplier) => { setMainSupplier(supplier.name); setShowSupplierPicker(false); }} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Detail View — 7 Tabs
// ═══════════════════════════════════════════════════════════════
function MaterialDetailView({ onBack, materialIndex = 0 }) {
  const [tab, setTab] = useState('info');
  const p = MATERIAL_ROWS[materialIndex] || MATERIAL_ROWS[0];

  const TABS = [
    { k: 'info',        label: '物料信息' },
    { k: 'purchase',    label: '采购记录' },
    { k: 'inbound',     label: '入库记录' },
    { k: 'outbound',    label: '出库记录' },
    { k: 'price',       label: '历史价格' },
    { k: 'suppliers',   label: '供应商列表' },
    { k: 'logs',        label: '操作记录' },
  ];

  const renderInfoTab = () => (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 14, columnGap: 32, fontSize: 13 }}>
        <KV k="物料编号"       v={p.code} />
        <KV k="物料名称"       v={p.name} />
        <KV k="拼音码"         v={p.pinyin} />
        <KV k="物料分类"       v={<span>{p.category} / {p.subCat}</span>} />
        <KV k="物料规格"       v={p.spec} />
        <KV k="标准单位"       v={p.unit} />
        <KV k="获取方式"       v={p.method} />
        <KV k="物料状态"       v={<Badge tone={p.stTone === 'g' ? 'g' : 'y'}>{p.status}</Badge>} />
        <KV k="销售控制"       v="禁止销售" />
        <KV k="主供应商"       v={p.supplier} />
        <KV k="最小采购量"     v="100" />
        <KV k="建议进价"       v="¥ 18.50" />
        <KV k="最大库存"       v="5000" />
        <KV k="安全库存"       v="500" />
        <KV k="最低库存量"     v="200" />
        <KV k="补货周期（天）" v="15" />
        <KV k="采源预警（天）" v="7" />
      </div>

      {/* Image grid */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--aw-fg-1)', marginBottom: 10 }}>物料图片</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[{ bg: '#DCE7FB', emoji: '📷' }, { bg: '#DBF3E6', emoji: '🖼' }, { bg: '#FDECDC', emoji: '📸' }].map((img, i) => (
            <div key={i} style={{
              width: 80, height: 80, borderRadius: 6, border: '1px solid var(--aw-border)',
              background: img.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, cursor: 'pointer',
            }}>
              {img.emoji}
            </div>
          ))}
        </div>
      </div>

      {/* Attachments */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--aw-fg-1)', marginBottom: 10 }}>附件</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { name: 'STM32F407_Datasheet.pdf', type: 'PDF', color: '#DC2626' },
            { name: '采购规格书.docx', type: 'DOC', color: '#2563EB' },
          ].map((doc, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10, alignItems: 'flex-start',
              padding: '10px 14px', border: '1px solid var(--aw-border)',
              borderRadius: 6, background: '#fff',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 5,
                background: doc.color, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 700, flex: 'none',
              }}>{doc.type}</div>
              <div>
                <div className="aw-link" style={{ fontSize: 13 }}>{doc.name}</div>
                <div style={{ fontSize: 11, color: 'var(--aw-fg-3)', marginTop: 2 }}>
                  <span>老夏</span> · <span>2025-05-08 16:45</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPurchaseTab = () => (
    <table className="aw-table">
      <thead>
        <tr>
          <th>采购单号</th>
          <th>供应商</th>
          <th>数量</th>
          <th>单价</th>
          <th>金额</th>
          <th>日期</th>
          <th>状态</th>
        </tr>
      </thead>
      <tbody>
        {PURCHASE_RECORDS.map((r, i) => (
          <tr key={i}>
            <td className="aw-link aw-num">{r.orderCode}</td>
            <td>{r.supplier}</td>
            <td className="aw-num">{r.qty}</td>
            <td className="aw-num">¥ {r.unitPrice.toFixed(2)}</td>
            <td className="aw-num">¥ {r.amount.toFixed(2)}</td>
            <td className="aw-num">{r.date}</td>
            <td><Badge tone={r.sTone === 'g' ? 'g' : r.sTone === 'y' ? 'y' : undefined}>{r.status}</Badge></td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderInboundTab = () => (
    <table className="aw-table">
      <thead>
        <tr>
          <th>入库单号</th>
          <th>仓库</th>
          <th>数量</th>
          <th>批次号</th>
          <th>日期</th>
          <th>操作人</th>
        </tr>
      </thead>
      <tbody>
        {INBOUND_RECORDS.map((r, i) => (
          <tr key={i}>
            <td className="aw-link aw-num">{r.inCode}</td>
            <td>{r.warehouse}</td>
            <td className="aw-num">{r.qty}</td>
            <td className="aw-num">{r.batchNo}</td>
            <td className="aw-num">{r.date}</td>
            <td>{r.operator}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderOutboundTab = () => (
    <table className="aw-table">
      <thead>
        <tr>
          <th>出库单号</th>
          <th>仓库</th>
          <th>数量</th>
          <th>类型</th>
          <th>日期</th>
          <th>操作人</th>
        </tr>
      </thead>
      <tbody>
        {OUTBOUND_RECORDS.map((r, i) => (
          <tr key={i}>
            <td className="aw-link aw-num">{r.outCode}</td>
            <td>{r.warehouse}</td>
            <td className="aw-num">{r.qty}</td>
            <td>{r.type}</td>
            <td className="aw-num">{r.date}</td>
            <td>{r.operator}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderPriceTab = () => (
    <table className="aw-table">
      <thead>
        <tr>
          <th>供应商</th>
          <th>采购价格</th>
          <th>日期</th>
          <th>采购单号</th>
          <th>备注</th>
        </tr>
      </thead>
      <tbody>
        {PRICE_HISTORY.map((r, i) => (
          <tr key={i}>
            <td>{r.supplier}</td>
            <td className="aw-num">¥ {r.price.toFixed(2)}</td>
            <td className="aw-num">{r.date}</td>
            <td className="aw-link aw-num">{r.orderCode}</td>
            <td style={{ color: 'var(--aw-fg-3)' }}>{r.remark || '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderSuppliersTab = () => (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Btn>新增供应商</Btn>
      </div>
      <table className="aw-table">
        <thead>
          <tr>
            <th>供应商</th>
            <th>联系人</th>
            <th>联系方式</th>
            <th>供货比例</th>
            <th>合作状态</th>
          </tr>
        </thead>
        <tbody>
          {MATERIAL_SUPPLIERS.map((r, i) => (
            <tr key={i}>
              <td>{r.name}</td>
              <td>{r.contact}</td>
              <td className="aw-num">{r.phone}</td>
              <td className="aw-num">{r.ratio}</td>
              <td><Badge tone={r.csTone === 'g' ? 'g' : undefined}>{r.coopStatus}</Badge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderLogsTab = () => (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {MATERIAL_LOGS.map((l, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: 18, position: 'relative' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 'none', width: 20 }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: 'var(--aw-primary)',
                flex: 'none', marginTop: 4,
              }} />
              {i < MATERIAL_LOGS.length - 1 && (
                <div style={{ width: 2, flex: 1, background: 'var(--aw-divider)', marginTop: 4 }} />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: 'var(--aw-fg-1)' }}>
                <span style={{ fontWeight: 500 }}>{l.operator}</span>
                <span style={{ color: 'var(--aw-fg-3)', marginLeft: 6 }}>{l.action}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--aw-fg-3)', marginTop: 2, fontFamily: 'var(--aw-font-num)' }}>{l.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const tabContent = () => {
    switch (tab) {
      case 'info':      return renderInfoTab();
      case 'purchase':  return renderPurchaseTab();
      case 'inbound':   return renderInboundTab();
      case 'outbound':  return renderOutboundTab();
      case 'price':     return renderPriceTab();
      case 'suppliers': return renderSuppliersTab();
      case 'logs':      return renderLogsTab();
      default:          return null;
    }
  };

  return (
    <div className="aw-doc-form">
      <div className="aw-doc-form-body">
        <DetailHeaderCard
          title={p.name}
          status={p.status}
          detailItems={[
            ['物料编号', p.code],
            ['物料分类', `${p.category} / ${p.subCat}`],
            ['规格型号', p.spec],
            ['标准单位', p.unit],
            ['获取方式', p.method],
            ['默认供应商', p.supplier],
          ]}
          onBack={onBack}
          creator="老夏"
          modifier="李文涛"
        />

        {/* Tabs + Content */}
        <Card>
          <Tabs items={TABS} active={tab} onChange={setTab} />
          {tabContent()}
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  KV helper (reused in detail info tab)
// ═══════════════════════════════════════════════════════════════
function KV({ k, v }) {
  return (
    <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
      <span style={{ color: '#6B7280', width: 110, flex: 'none', fontSize: 13 }}>{k}</span>
      <span style={{ fontSize: 13, color: 'var(--aw-fg-1)' }}>：{v}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MaterialListScreen — Main Entry
// ═══════════════════════════════════════════════════════════════
function MaterialListScreen({ module: mod, initialAction, onActionConsumed }) {
  const [view, setView] = useState('list');
  const [picked, setPicked] = useState('elec');
  const [detailIdx, setDetailIdx] = useState(0);

  useEffect(() => {
    if (initialAction === 'new') { setView('new'); onActionConsumed && onActionConsumed(); }
    else if (initialAction === 'list') { setView('list'); onActionConsumed && onActionConsumed(); }
  }, [initialAction]);

  const handleView = (idx) => { setDetailIdx(idx); setView('detail'); };

  return (
    <div className="aw-doc-page">
      {view === 'list' && (
        <MaterialTree picked={picked} setPicked={setPicked} rows={MATERIAL_ROWS} />
      )}
      <div className="aw-doc-main">
        {view === 'list'   && <MaterialListView   onNew={() => setView('new')} onView={handleView} picked={picked} />}
        {view === 'new'    && <MaterialNewView    onBack={() => setView('list')} />}
        {view === 'detail' && <MaterialDetailView onBack={() => setView('list')} materialIndex={detailIdx} />}
      </div>
    </div>
  );
}

window.MaterialListScreen = MaterialListScreen;
