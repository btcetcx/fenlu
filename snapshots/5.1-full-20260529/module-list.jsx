// module-list.jsx — 通用模块列表屏（含左侧分类树）
const { useState, useEffect } = React;

function ModuleTree({ module: m, picked, setPicked }) {
  const trees = {
    project:  [{k:'rd',    label:'研发项目', open:true,  kids:[{k:'r1',label:'内部研发'},{k:'r2',label:'合作研发'}]},
               {k:'eng',   label:'工程项目', open:false, kids:[{k:'e1',label:'基建工程'}]},
               {k:'coop',  label:'合作项目', open:false, kids:[{k:'c1',label:'校企合作'}]}],
    product:  [{k:'fin',   label:'成品',     open:true,  kids:[{k:'f1',label:'A类成品'},{k:'f2',label:'B类成品'}]},
               {k:'semi',  label:'半成品',   open:false, kids:[{k:'s1',label:'半成品A'}]},
               {k:'raw',   label:'原材料',   open:false, kids:[{k:'r1',label:'金属材料'}]}],
    material: [{k:'elec',  label:'电子物料', open:true,  kids:[{k:'e1',label:'芯片类'},{k:'e2',label:'电容类'}]},
               {k:'mech',  label:'机械物料', open:false, kids:[{k:'m1',label:'紧固件'}]},
               {k:'pack',  label:'包装物料', open:false, kids:[{k:'p1',label:'纸箱类'}]}],
    process:  [{k:'mach',  label:'加工工序', open:true,  kids:[{k:'m1',label:'车削'},{k:'m2',label:'铣削'}]},
               {k:'asm',   label:'装配工序', open:false, kids:[{k:'a1',label:'总装'}]},
               {k:'insp',  label:'检验工序', open:false, kids:[{k:'i1',label:'来料检'}]}],
    craft:    [{k:'weld',  label:'焊接工艺', open:true,  kids:[{k:'w1',label:'电弧焊'},{k:'w2',label:'激光焊'}]},
               {k:'coat',  label:'喷涂工艺', open:false, kids:[{k:'c1',label:'静电喷涂'}]},
               {k:'asm',   label:'装配工艺', open:false, kids:[{k:'a1',label:'流水线装配'}]}],
    bom:      [{k:'finished_bom', label:'成品BOM', open:true, kids:[{k:'finished_cooker',label:'温控锅整机'},{k:'finished_pack',label:'包装套件'}]},
               {k:'semi_bom', label:'半成品BOM', open:true, kids:[{k:'semi_control',label:'控制板组件'},{k:'semi_body',label:'机身子装配'},{k:'semi_temp',label:'温控模块'}]},
               {k:'eng_bom', label:'工程BOM', open:true, kids:[{k:'eng_trial',label:'新品试制'},{k:'eng_change',label:'变更验证'}]},
               {k:'virt_bom', label:'虚拟BOM', open:true, kids:[{k:'virt_common',label:'通用组件'},{k:'virt_replace',label:'替代组件'}]}],
  };
  const tree = trees[m.code] || trees.project;

  return (
    <div className="aw-doc-tree">
      <div className="aw-doc-tree-h">{m.name}库 <span className="aw-doc-tree-n">(999)</span></div>
      <div className="aw-doc-tree-list">
        {tree.map(n => (
          <div key={n.k}>
            <div className={'aw-tree-row aw-tree-l2' + (picked === n.k ? ' on' : '')} onClick={() => setPicked(n.k)}>
              <span className="aw-tree-caret">{n.open ? '▾' : '▸'}</span>
              <TileIcon name="folder" size={14} />
              <span>{n.label}</span>
            </div>
            {n.open && n.kids.map(c => (
              <div key={c.k} className={'aw-tree-row aw-tree-l3' + (picked === c.k ? ' on' : '')} onClick={() => setPicked(c.k)}>
                <TileIcon name="doc" size={13} />
                <span>{c.label}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ModuleListScreen({ module: mod, initialAction, onActionConsumed }) {
  const m = mod || MODULE_DOC;
  const isBomModule = m.code === 'bom' || m.name === 'BOM';
  const [view, setView] = useState('list');
  const [picked, setPicked] = useState(m.code === 'proj' ? 'rd' : m.code === 'prod' ? 'fin' : m.code === 'mat' ? 'elec' : m.code === 'proc' ? 'mach' : m.code === 'craft' ? 'weld' : 'finished_bom');
  const [drawer, setDrawer] = useState(null);
  const [detailRow, setDetailRow] = useState(null);
  const [detailTab, setDetailTab] = useState('info');

  useEffect(() => {
    if (initialAction === 'new') { setView('new'); onActionConsumed && onActionConsumed(); }
    else if (initialAction === 'list' || initialAction === 'BOM列表') { setView('list'); onActionConsumed && onActionConsumed(); }
  }, [initialAction]);

  // Type map: tree key → table type label
  const typeMap = {
    // project
    rd:'研发项目', eng:'工程项目', coop:'合作项目', r1:'内部研发', r2:'合作研发', e1:'基建工程', c1:'校企合作',
    // product
    fin:'成品', semi:'半成品', raw:'原材料', f1:'A类成品', f2:'B类成品', s1:'半成品A', r1_mat:'金属材料',
    // material
    elec:'电子物料', mech:'机械物料', pack:'包装物料', e1_chip:'芯片类', e2_cap:'电容类', m1_fast:'紧固件', p1_box:'纸箱类',
    // process
    mach:'加工工序', asm:'装配工序', insp:'检验工序', m1_turn:'车削', m2_mill:'铣削', a1:'总装', i1:'来料检',
    // craft
    weld:'焊接工艺', coat:'喷涂工艺', asm_craft:'装配工艺', w1:'电弧焊', w2:'激光焊', c1_coat:'静电喷涂', a1_line:'流水线装配',
    // bom
    finished_bom:'成品BOM', finished_cooker:'温控锅整机', finished_pack:'包装套件',
    semi_bom:'半成品BOM', semi_control:'控制板组件', semi_body:'机身子装配', semi_temp:'温控模块',
    eng_bom:'工程BOM', eng_trial:'新品试制', eng_change:'变更验证',
    virt_bom:'虚拟BOM', virt_common:'通用组件', virt_replace:'替代组件',
  };

  const genericRows = [
    { code:`${m.code.toUpperCase()}-2025-001`, name:`${m.name}示例一`, type: m.code==='proj'?'研发项目':m.code==='prod'?'成品':m.code==='mat'?'电子物料':m.code==='proc'?'加工工序':m.code==='craft'?'焊接工艺':'生产BOM', state:'已发布', stTone:'g', owner:'老夏',   date:'2025-12-10' },
    { code:`${m.code.toUpperCase()}-2025-002`, name:`${m.name}示例二`, type: m.code==='proj'?'工程项目':m.code==='prod'?'半成品':m.code==='mat'?'机械物料':m.code==='proc'?'装配工序':m.code==='craft'?'喷涂工艺':'设计BOM', state:'待审核', stTone:'y', owner:'李文涛', date:'2025-12-08' },
    { code:`${m.code.toUpperCase()}-2025-003`, name:`${m.name}示例三`, type: m.code==='proj'?'合作项目':m.code==='prod'?'原材料':m.code==='mat'?'包装物料':m.code==='proc'?'检验工序':m.code==='craft'?'装配工艺':'工艺BOM', state:'草稿',   stTone:'b', owner:'陈思源', date:'2025-12-05' },
    { code:`${m.code.toUpperCase()}-2025-004`, name:`${m.name}示例四`, type: m.code==='proj'?'研发项目':m.code==='prod'?'成品':m.code==='mat'?'电子物料':m.code==='proc'?'加工工序':m.code==='craft'?'焊接工艺':'生产BOM', state:'已停用', stTone:'gray', owner:'赵工',   date:'2025-11-20' },
    { code:`${m.code.toUpperCase()}-2025-005`, name:`${m.name}示例五`, type: m.code==='proj'?'工程项目':m.code==='prod'?'半成品':m.code==='mat'?'机械物料':m.code==='proc'?'装配工序':m.code==='craft'?'喷涂工艺':'设计BOM', state:'已发布', stTone:'g', owner:'王志强', date:'2025-11-15' },
  ];
  const bomRows = [
    { code:'BOM-202605-001', name:'智能温控锅生产BOM', product:'智能温控锅 AW-H8', version:'V1.3', type:'生产BOM', category:'温控锅整机', group:'成品BOM', materials:18, levels:3, state:'已生效', stTone:'g', owner:'老夏', date:'2026-05-18', cost:'4320.00' },
    { code:'BOM-202605-002', name:'智能温控锅工程BOM', product:'智能温控锅 AW-H12', version:'V1.0', type:'工程BOM', category:'新品试制', group:'工程BOM', materials:22, levels:4, state:'待审核', stTone:'y', owner:'李文涛', date:'2026-05-16', cost:'5180.00' },
    { code:'BOM-202604-018', name:'控制板组件虚拟BOM', product:'控制板组件', version:'V2.1', type:'虚拟BOM', category:'控制板组件', group:'半成品BOM', materials:9, levels:2, state:'草稿', stTone:'b', owner:'陈思源', date:'2026-04-28', cost:'860.00' },
    { code:'BOM-202604-011', name:'包装套件BOM', product:'温控锅包装套件', version:'V1.1', type:'生产BOM', category:'包装套件', group:'成品BOM', materials:6, levels:2, state:'已停用', stTone:'gray', owner:'赵工', date:'2026-04-20', cost:'58.60' },
    { code:'BOM-202604-026', name:'机身子装配BOM', product:'AW-H8 机身子装配', version:'V1.0', type:'生产BOM', category:'机身子装配', group:'半成品BOM', materials:11, levels:3, state:'已生效', stTone:'g', owner:'王志强', date:'2026-04-26', cost:'1280.00' },
    { code:'BOM-202604-032', name:'温控模块BOM', product:'温控模块 TM-08', version:'V1.2', type:'生产BOM', category:'温控模块', group:'半成品BOM', materials:7, levels:2, state:'已生效', stTone:'g', owner:'周明', date:'2026-04-30', cost:'420.00' },
  ];
  const [savedBomRows, setSavedBomRows] = useState(bomRows);
  const [editInitial, setEditInitial] = useState(null);
  const allRows = isBomModule ? savedBomRows : genericRows;

  const matchedType = typeMap[picked];
  const rows = matchedType
    ? allRows.filter(r => isBomModule ? [r.type, r.group, r.category, r.state].includes(matchedType) : r.type === matchedType)
    : allRows;

  const [sel, setSel] = useState({});
  const allChecked = rows.length > 0 && rows.every((_, i) => sel[i]);
  const someChecked = rows.some((_, i) => sel[i]);
  const toggleAll = () => { if (allChecked) setSel({}); else { const n = {}; rows.forEach((_, i) => n[i] = true); setSel(n); } };
  const toggleRow = (i) => setSel(s => ({ ...s, [i]: !s[i] }));

  const cols = isBomModule ? [
    { k: 'code',      label: 'BOM编号',  w: 150 },
    { k: 'name',      label: 'BOM名称',  w: 220 },
    { k: 'product',   label: '适用产品',  w: 180 },
    { k: 'version',   label: '版本号',    w: 90 },
    { k: 'type',      label: 'BOM类型',  w: 110 },
    { k: 'materials', label: '物料数',    w: 90 },
    { k: 'levels',    label: '层级',      w: 80 },
    { k: 'state',     label: '状态',      w: 100 },
    { k: 'owner',     label: '编制人',    w: 100 },
    { k: 'date',      label: '更新日期',  w: 120 },
    { k: 'op',        label: '操作',      w: 90 },
  ] : [
    { k: 'code',  label: `${m.name}编码`, w: 140 },
    { k: 'name',  label: `${m.name}名称`, w: 220 },
    { k: 'type',  label: '分类',  w: 120 },
    { k: 'state', label: '状态',  w: 100 },
    { k: 'owner', label: '负责人', w: 100 },
    { k: 'date',  label: '更新日期', w: 120 },
    { k: 'op',    label: '操作',    w: 80 },
  ];
  const currentDetail = detailRow || rows[0] || allRows[0];
  const renderListCell = (r, c) => {
    if (c.k === 'op') return <td key={c.k}><span className="aw-link">查看</span></td>;
    if (c.k === 'state') return <td key={c.k}><span className={'aw-state aw-state-' + r.stTone}>{r.state}</span></td>;
    if (c.k === 'code') return <td key={c.k} className="aw-num">{r.code}</td>;
    if (c.k === 'name') return <td key={c.k} className="aw-link">{r.name}</td>;
    if (['materials','levels','cost'].includes(c.k)) return <td key={c.k} className="aw-num">{r[c.k]}</td>;
    return <td key={c.k}>{r[c.k]}</td>;
  };
  const bomDetailRows = [
    { no:'1', level:'1', code:'CP-20250101001', name:'智能温控锅总成', spec:'AW-H8', type:'自制', qty:'1', unit:'套', loss:'0%', alt:'—', op:'总装' },
    { no:'1.1', level:'2', code:'M-110', name:'机身子装配', spec:'AW-HT', type:'子装配', qty:'1', unit:'套', loss:'1%', alt:'—', op:'装配' },
    { no:'1.1.1', level:'3', code:'M-111', name:'内胆不锈钢件', spec:'SUS304', type:'自制', qty:'1', unit:'件', loss:'2%', alt:'M-111-A', op:'冲压' },
    { no:'1.1.2', level:'3', code:'M-120', name:'温控传感器', spec:'NTC-10K', type:'外购', qty:'2', unit:'个', loss:'1%', alt:'M-120-B', op:'装配' },
    { no:'1.2', level:'2', code:'P-210', name:'包装纸箱', spec:'8L专用', type:'包装', qty:'1', unit:'个', loss:'0%', alt:'—', op:'包装' },
  ];
  const bomDetailText = '本物料清单适用于智能温控锅 AW-H8 系列产品，覆盖机身子装配、温控传感器、包装纸箱等关键物料。清单按量产版本维护父子件层级、标准用量、损耗率、替代料和关联工序，提交审批后作为采购、生产领料和成本核算的基准。';
  const bomModelActive = (node, model, parentActive = true) => {
    if (!parentActive) return false;
    const picked = node.variants && node.variants.model;
    if (!picked || picked.includes('全部型号') || picked.includes('任意')) return true;
    return picked.includes(model);
  };
  const flattenBomTreeRows = (nodes, model = '17', prefix = [], result = [], parentActive = true) => {
    (nodes || []).forEach((node, idx) => {
      const active = bomModelActive(node, model, parentActive);
      if (!active) return;
      const path = [...prefix, idx + 1];
      const picked = node.variants && node.variants.model;
      result.push({
        no: path.join('.'),
        level: String(path.length),
        code: node.code || '待选择',
        name: node.name || '未命名物料',
        spec: node.spec || '—',
        model: picked ? (picked.includes('全部型号') || picked.includes('任意') ? '全部型号' : picked.join('、')) : '全部型号',
        type: node.type || '—',
        qty: String(node.qty || 0),
        unit: node.unit || '—',
        loss: `${node.loss || 0}%`,
        alt: node.alts && node.alts.length ? node.alts.map(a => a.code || a.name).join('、') : '—',
        op: node.processOp || '未关联',
      });
      flattenBomTreeRows(node.children || [], model, path, result, active);
    });
    return result;
  };
  const normalizeBomType = (type) => type && type.endsWith('BOM') ? type : `${type || '生产'}BOM`;
  const bomTone = (state) => state === '待审核' ? 'y' : state === '草稿' ? 'b' : state === '已停用' ? 'gray' : 'g';
  const makeBomRowFromPayload = (payload) => {
    const base = payload.baseInfo || {};
    const stats = payload.stats || {};
    const type = normalizeBomType(base.type);
    const product = base.product || '未选择产品';
    return {
      code: payload.code,
      name: base.name || '未命名物料清单',
      product,
      version: base.version || 'V1.0',
      type,
      category: product.includes('包装') ? '包装套件' : product.includes('控制') ? '控制板组件' : product.includes('机身') ? '机身子装配' : '温控锅整机',
      group: type === '工程BOM' ? '工程BOM' : type === '虚拟BOM' ? '虚拟BOM' : product.includes('组件') || product.includes('模块') || product.includes('机身') ? '半成品BOM' : '成品BOM',
      materials: stats.materials || 0,
      levels: stats.levels || 0,
      state: payload.state || '草稿',
      stTone: bomTone(payload.state),
      owner: base.author || '老夏',
      date: base.effectiveDate || new Date().toISOString().slice(0, 10),
      cost: Number(stats.cost || 0).toFixed(2),
      detailText: payload.detailText,
      tree: payload.tree || [],
      baseInfo: base,
      spec: payload.spec,
    };
  };
  const upsertBomPayload = (payload) => {
    const row = makeBomRowFromPayload(payload);
    setSavedBomRows(prev => prev.some(item => item.code === row.code) ? prev.map(item => item.code === row.code ? { ...item, ...row } : item) : [row, ...prev]);
    return row;
  };
  const makeEditInitial = (row) => ({
    code: row.code,
    baseInfo: row.baseInfo || {
      no: row.code,
      name: row.name,
      product: row.product,
      version: row.version,
      type: row.type ? row.type.replace('BOM', '') : '',
      author: row.owner,
      effectiveDate: row.date,
      workflow: '研发 BOM 默认流程',
    },
    tree: row.tree || [],
    detailText: row.detailText || bomDetailText,
    spec: row.spec || { model:'17' },
  });
  const currentBomModel = currentDetail?.spec?.model || '17';
  const currentBomDetailRows = currentDetail && currentDetail.tree && currentDetail.tree.length ? flattenBomTreeRows(currentDetail.tree, currentBomModel) : bomDetailRows;
  const currentBomDetailText = currentDetail?.detailText || bomDetailText;

  return (
    <div className="aw-doc-page">
      {view === 'list' && <ModuleTree module={m} picked={picked} setPicked={setPicked} />}
      <div className="aw-doc-main">
        {view === 'list' && (
          <>
            <div className="aw-doc-tb">
              <div className="aw-doc-search">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8"><circle cx="11" cy="11" r="6" /><path d="M16 16l4 4" /></svg>
                <input placeholder={`搜索${m.name}…`} />
              </div>
              <RefreshAction />
              <button className="aw-btn" onClick={() => setDrawer('filter')}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 5h18M6 12h12M10 19h4" /></svg>筛选</button>
              <button className="aw-btn" onClick={() => setDrawer('field')}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="7" height="7" /><rect x="14" y="4" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>字段配置</button>
              <button className="aw-btn" onClick={() => setDrawer('export')}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 4v12" /><path d="M7 11l5 5 5-5" /><path d="M4 20h16" /></svg>导出</button>
              <button className="aw-btn" onClick={() => setDrawer('import')}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 20V8" /><path d="M7 13l5-5 5 5" /><path d="M4 4h16" /></svg>导入</button>
              <button className="aw-btn primary" onClick={() => { setEditInitial(null); setView('new'); }}>{isBomModule ? '新增BOM' : `新增${m.name}`}</button>
            </div>
            <div className="aw-doc-tbl-wrap">
              <div className="aw-doc-tbl-inner">
                <table className="aw-doc-tbl">
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}><div className="aw-th-inner"><span className={'aw-chk' + (allChecked ? ' on' : someChecked ? ' indet' : '')} onClick={toggleAll} /></div></th>
                      {cols.map(c => (
                        <th key={c.k} style={c.w ? { width: c.w } : {}}><div className="aw-th-inner">{c.label}</div></th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} onClick={() => { setDetailRow(r); setDetailTab('info'); setView('detail'); }} style={{ cursor: 'pointer' }}>
                        <td onClick={e => { e.stopPropagation(); toggleRow(i); }}><span className={'aw-chk' + (sel[i] ? ' on' : '')} /></td>
                        {cols.map(c => renderListCell(r, c))}
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr className="aw-row-blank"><td colSpan={cols.length + 1} style={{ textAlign: 'center', color: 'var(--aw-fg-3)', padding: '32px 12px', fontSize: 13 }}>暂无数据</td></tr>
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
        )}

        {view === 'new' && isBomModule && (
          <BomNewScreen
            initialValue={editInitial}
            mode={editInitial ? 'edit' : 'create'}
            onBack={() => setView('list')}
            onDraft={(payload) => { upsertBomPayload(payload); }}
            onPreview={() => {}}
            onSubmit={(payload) => {
              const row = upsertBomPayload(payload);
              setDetailRow(row);
              setDetailTab('info');
              setView('detail');
            }}
          />
        )}

        {view === 'new' && !isBomModule && (
          <div className="aw-doc-form">
            <div className="aw-doc-form-head">
              <span className="aw-link" onClick={() => setView('list')}>← 返回列表</span>
              <span style={{ flex: 1 }} />
              <button className="aw-btn" onClick={() => setView('list')}>取消</button>
              <button className="aw-btn">暂存</button>
              <button className="aw-btn primary">提交审批</button>
            </div>
            <div className="aw-doc-form-body">
              <Card title="基本信息">
                <div className="aw-doc-grid">
                  <Field label={`${m.name}编号`}><Input defaultValue="自动生成" disabled /></Field>
                  <Field label={`${m.name}名称`} req><Input placeholder={`填写${m.name}名称`} /></Field>
                  <Field label={`${m.name}类型`} req><Select><option>请选择</option><option>类型一</option><option>类型二</option><option>类型三</option></Select></Field>
                  <Field label="所属分类" req><Select><option>请选择</option><option>分类一</option></Select></Field>
                  <Field label="版本号"><Input defaultValue="V 1.0" /></Field>
                  <Field label="编制人"><Input defaultValue="老夏" /></Field>
                  <Field label="生效日期"><Input placeholder="请选择" /></Field>
                  <Field label="失效日期"><Input placeholder="永久" /></Field>
                  <Field label="审批流程"><Select><option>默认审批流</option></Select></Field>
                </div>
              </Card>
              <Card title="正文内容">
                <div className="aw-rt-bar">
                  <span>B</span><span><i>I</i></span><span><u>U</u></span><span>S</span>
                  <i style={{ width: 1, height: 14, background: '#E5E7EB' }} />
                  <span>≡</span><span>≣</span><span>·</span><span>1.</span>
                  <i style={{ width: 1, height: 14, background: '#E5E7EB' }} />
                  <span>🔗</span><span>📷</span><span>📎</span>
                </div>
                <div className="aw-rt-area" contentEditable suppressContentEditableWarning>
                  请输入正文内容…
                </div>
              </Card>
              <Card title="附件">
                <div style={{ border: '1px dashed #D1D5DB', borderRadius: 6, padding: '24px', textAlign: 'center', color: '#6B7280', fontSize: 13 }}>
                  <span className="aw-link">点击上传</span> / 拖拽到此区域 &nbsp; <span style={{ color: '#9CA3AF', fontSize: 12 }}>支持 PDF / Word / Excel / 图片，单文件 ≤ 50MB</span>
                </div>
              </Card>
            </div>
          </div>
        )}

        {view === 'detail' && isBomModule && currentDetail && (
          <div className="aw-doc-form">
            <div className="aw-doc-form-body">
              <DetailHeaderCard
                title={`${currentDetail.code} ${currentDetail.name}`}
                status={currentDetail.state}
                detailItems={[
                  ['BOM编号', currentDetail.code],
                  ['BOM类型', currentDetail.type],
                  ['适用产品', currentDetail.product],
                  ['版本号', currentDetail.version],
                  ['物料数', `${currentDetail.materials}`],
                  ['层级', `${currentDetail.levels}`],
                ]}
                onBack={() => setView('list')}
                onEdit={() => { setEditInitial(makeEditInitial(currentDetail)); setView('new'); }}
                creator={currentDetail.owner}
                modifier={currentDetail.owner}
              />
              <Card>
                <Tabs items={[{k:'info',label:'BOM信息'},{k:'structure',label:'BOM结构'},{k:'version',label:'版本记录'},{k:'log',label:'操作记录'}]} active={detailTab} onChange={setDetailTab} />
                {detailTab === 'info' && (
                  <div style={{ paddingTop:18 }}>
                    <div className="section-title">基础信息</div>
                    <div className="aw-doc-grid" style={{ marginTop:12 }}>
                      <div>BOM编号：{currentDetail.code}</div>
                      <div>BOM名称：{currentDetail.name}</div>
                      <div>适用产品：{currentDetail.product}</div>
                      <div>版本号：{currentDetail.version}</div>
                      <div>BOM类型：{currentDetail.type}</div>
                      <div>生效日期：2026-05-18</div>
                      <div>审批流程：BOM发布审批流程</div>
                      <div>引用状态：未被在制订单锁定</div>
                    </div>
                    <div style={{ marginTop:18 }}>
                      <div className="section-title">清单详情</div>
                      <div style={{ marginTop:10, border:'1px solid var(--aw-border)', borderRadius:8, background:'#fff', padding:'14px 16px', fontSize:13, lineHeight:1.9, color:'var(--aw-fg-2)', whiteSpace:'pre-wrap' }}>
                        {currentBomDetailText}
                      </div>
                    </div>
                  </div>
                )}
                {detailTab === 'structure' && (
                  <div style={{ paddingTop:18 }}>
                    <div className="section-title">物料清单结构</div>
                    <div className="aw-table-scroll" style={{ marginTop:12 }}>
                      <table className="aw-table">
                        <thead><tr>{['序号','层级','物料编号','物料名称','适用型号','物料类型','用量','标准单位','损耗率','替代料','关联工序'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                        <tbody>
                          {currentBomDetailRows.map(r => <tr key={r.no}><td>{r.no}</td><td>{r.level}</td><td className="aw-num aw-link">{r.code}</td><td>{r.name}</td><td>{r.model || '全部型号'}</td><td>{r.type}</td><td>{r.qty}</td><td>{r.unit}</td><td>{r.loss}</td><td>{r.alt}</td><td>{r.op}</td></tr>)}
                          <tr><td colSpan={6}>合计</td><td className="aw-num">{currentBomDetailRows.length}</td><td colSpan={4}>物料数：{currentDetail.materials}，单件成本：¥ {currentDetail.cost}</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                {detailTab === 'version' && (
                  <div className="aw-table-scroll" style={{ paddingTop:18 }}>
                    <table className="aw-table">
                      <thead><tr>{['版本','变更说明','状态','生效日期','编制人','操作'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                      <tbody>
                        <tr><td>V1.3</td><td>新增温控传感器替代料</td><td>当前生效</td><td>2026-05-18</td><td>{currentDetail.owner}</td><td><span className="aw-link">查看</span></td></tr>
                        <tr><td>V1.2</td><td>调整包装纸箱损耗率</td><td>历史归档</td><td>2026-04-25</td><td>李文涛</td><td><span className="aw-link">对比</span></td></tr>
                      </tbody>
                    </table>
                  </div>
                )}
                {detailTab === 'log' && <div style={{ fontSize:13, color:'var(--aw-fg-3)', textAlign:'center', padding:'34px 0' }}>暂无操作记录</div>}
              </Card>
            </div>
          </div>
        )}

        {view === 'detail' && !isBomModule && (
          <div className="aw-doc-form">
            <div className="aw-doc-form-body">
              <DetailHeaderCard
                title={`${m.name}示例一 ${allRows[0].code}`}
                status={allRows[0].state}
                detailItems={[
                  [`${m.name}编号`, allRows[0].code],
                  [`${m.name}名称`, allRows[0].name],
                  [`${m.name}类型`, allRows[0].type],
                  ['负责人', allRows[0].owner],
                  ['更新日期', allRows[0].date],
                ]}
                onBack={() => setView('list')}
                creator="老夏"
                createdAt="2025-12-10 14:30"
                modifier="李文涛"
                modifiedAt="2025-12-12 09:15"
              />
              <Card>
                <Tabs items={[{ k: 'detail', label: `${m.name}详情` }, { k: 'attach', label: `${m.name}附件` }, { k: 'ver', label: '历史版本' }, { k: 'log', label: '操作记录' }]} active="detail" onChange={() => {}} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 14, columnGap: 32, fontSize: 13 }}>
                  <div style={{ display: 'flex', gap: 18 }}><span style={{ color: '#6B7280', width: 90, flex: 'none' }}>{m.name}编号</span><span>：{allRows[0].code}</span></div>
                  <div style={{ display: 'flex', gap: 18 }}><span style={{ color: '#6B7280', width: 90, flex: 'none' }}>{m.name}名称</span><span>：{allRows[0].name}</span></div>
                  <div style={{ display: 'flex', gap: 18 }}><span style={{ color: '#6B7280', width: 90, flex: 'none' }}>{m.name}类型</span><span>：{allRows[0].type}</span></div>
                  <div style={{ display: 'flex', gap: 18 }}><span style={{ color: '#6B7280', width: 90, flex: 'none' }}>创建人</span><span>：{allRows[0].owner}</span></div>
                  <div style={{ display: 'flex', gap: 18 }}><span style={{ color: '#6B7280', width: 90, flex: 'none' }}>创建时间</span><span>：2025-12-10 14:30</span></div>
                  <div style={{ display: 'flex', gap: 18 }}><span style={{ color: '#6B7280', width: 90, flex: 'none' }}>最后修改时间</span><span>：2025-12-12 09:15</span></div>
                  <div style={{ display: 'flex', gap: 18 }}><span style={{ color: '#6B7280', width: 90, flex: 'none' }}>失效日期</span><span>：永久 / 2028-12-31</span></div>
                  <div style={{ display: 'flex', gap: 18 }}><span style={{ color: '#6B7280', width: 90, flex: 'none' }}>版本号</span><span>：V 1.0</span></div>
                </div>
                <div style={{ marginTop: 18, fontSize: 13, lineHeight: 1.7, color: '#1F2937' }}>
                  <p><b>技术背景：</b>{m.name}管理是ERP系统的核心功能之一，通过标准化的{m.name}管理流程，企业能够有效提升运营效率。本{m.name}定义了系统内部对{m.name}的统一管理规范，支持完整的生命周期管控。</p>
                  <p><b>实际应用：</b>在实际业务场景中，该{m.name}被广泛应用于日常运营管理，支持创建、审批、归档等完整流程。系统自动记录操作日志，确保数据可追溯。</p>
                  <p><b>注意事项：</b>使用人员需严格按操作规程执行，确保数据准确性和一致性。如遇异常情况，请及时上报管理员处理。</p>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

window.ModuleListScreen = ModuleListScreen;
