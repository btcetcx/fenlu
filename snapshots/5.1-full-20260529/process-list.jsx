// ui_kits/erp-console/process-list.jsx
// 工序管理 — 列表 / 新增 / 详情 三态
// Session: 260515-fresh-prairie
const { useState, useEffect } = React;

// ========== MOCK DATA ==========
const PROCESSES = [
  { id:1, code:'GX-20250101001', name:'轴类零件车削加工', cat:'车削', catParent:'加工工序',
    workCenter:'加工中心A', wcCount:1, calcMethod:'计时', processType:'自制工序',
    qcPlan:'ZJ-2025-001', state:'启用', stateTone:'g',
    desc:'对轴类零件进行车削加工，包括外圆车削、端面车削、切槽、倒角等工序。',
    creator:'老夏', createdAt:'2025-01-12 08:30', modifier:'李文涛', modifiedAt:'2025-05-10 14:20' },
  { id:2, code:'GX-20250101002', name:'齿轮铣削加工', cat:'铣削', catParent:'加工工序',
    workCenter:'加工中心B', wcCount:2, calcMethod:'计件', processType:'委外工序',
    qcPlan:'ZJ-2025-002', state:'启用', stateTone:'g',
    desc:'对齿轮零件进行铣削加工，包括齿形铣削、键槽加工、端面精铣等。',
    creator:'陈思源', createdAt:'2025-02-15 10:00', modifier:'老夏', modifiedAt:'2025-04-28 16:30' },
  { id:3, code:'GX-20250101003', name:'壳体装配工序', cat:'装配工序', catParent:'装配工序',
    workCenter:'装配线1', wcCount:3, calcMethod:'计时', processType:'自制工序',
    qcPlan:'ZJ-2025-003', state:'暂停', stateTone:'y',
    desc:'壳体组件装配，包括零部件定位、紧固、密封及功能测试。',
    creator:'赵工', createdAt:'2025-03-08 14:00', modifier:'王志强', modifiedAt:'2025-05-05 09:00' },
  { id:4, code:'GX-20250101004', name:'成品检验工序', cat:'检验工序', catParent:'检验工序',
    workCenter:'质检中心', wcCount:1, calcMethod:'计时', processType:'自制工序',
    qcPlan:'ZJ-2025-004', state:'启用', stateTone:'g',
    desc:'成品出厂前全面检验，包括外观检查、尺寸测量、性能测试等。',
    creator:'王志强', createdAt:'2025-01-20 09:15', modifier:'陈思源', modifiedAt:'2025-05-12 11:45' },
  { id:5, code:'GX-20250101005', name:'表面处理工序', cat:'车削', catParent:'加工工序',
    workCenter:'加工中心A', wcCount:1, calcMethod:'计件', processType:'委外工序',
    qcPlan:'ZJ-2025-001', state:'停用', stateTone:'gray',
    desc:'金属零件表面处理，包括研磨、抛光、阳极氧化等工艺。',
    creator:'李文涛', createdAt:'2025-04-10 16:20', modifier:'老夏', modifiedAt:'2025-05-08 13:10' },
];

// Workstations mock
const STATIONS_MOCK = [
  { id:1, code:'GW-001', name:'车削工位A', line:'生产线1', workshop:'一车间', factory:'海南傲为工厂' },
  { id:2, code:'GW-002', name:'铣削工位B', line:'生产线2', workshop:'二车间', factory:'海南傲为工厂' },
  { id:3, code:'GW-003', name:'装配工位C', line:'装配线1', workshop:'三车间', factory:'海南傲为工厂' },
];

// Labor hours mock
const LABOR_HOURS = [
  { id:1, code:'GX-20250101001', name:'轴类零件车削加工', stdHours:45, auxHours:10, coolHours:5, cost:380 },
  { id:2, code:'GX-20250101002', name:'齿轮铣削加工', stdHours:60, auxHours:15, coolHours:8, cost:520 },
  { id:3, code:'GX-20250101003', name:'壳体装配工序', stdHours:30, auxHours:8, coolHours:3, cost:260 },
  { id:4, code:'GX-20250101004', name:'成品检验工序', stdHours:20, auxHours:5, coolHours:0, cost:150 },
];

// Tech params mock
const TECH_PARAMS = [
  { id:1, name:'主轴转速', value:'1200 rpm' },
  { id:2, name:'进给量', value:'0.15 mm/r' },
  { id:3, name:'切削深度', value:'2.5 mm' },
];

// Quality inspection items mock
const QC_ITEMS = [
  { id:1, name:'尺寸精度', standard:'±0.02mm', tool:'千分尺', freq:'每批次首检+抽检' },
  { id:2, name:'表面粗糙度', standard:'Ra ≤ 1.6μm', tool:'粗糙度仪', freq:'每批次抽检3件' },
  { id:3, name:'硬度检测', standard:'HRC 58-62', tool:'硬度计', freq:'每炉次抽检1件' },
];

const IPQC_PLAN_ROWS = [
  { code:'IPQC-PLAN-001', name:'压装过程控制计划 V2.4', scope:'压装 / 装配工序', sampling:'首件全检 + 巡检5件/2h', control:'扭矩 / 压装深度 / 工装点检', owner:'王质检', state:'启用' },
  { code:'IPQC-PLAN-002', name:'车削过程巡检方案 V1.8', scope:'车削 / 铣削', sampling:'首件全检 + 每批抽检3件', control:'尺寸精度 / 表面粗糙度 / 刀具寿命', owner:'李质检', state:'启用' },
  { code:'IPQC-PLAN-003', name:'装配过程质量控制方案 V1.5', scope:'装配工序', sampling:'首件确认 + 每2小时巡检', control:'紧固扭矩 / 密封性 / 功能测试', owner:'陈复检', state:'启用' },
  { code:'IPQC-PLAN-004', name:'制程首件检验方案 V3.0', scope:'通用制程', sampling:'每班首件全检', control:'关键尺寸 / 外观 / 设备参数', owner:'质检主管', state:'待审批' },
];

// Operation logs mock
const OP_LOGS = [
  { operator:'老夏', content:'创建工序档案', time:'2025-01-12 08:30' },
  { operator:'陈思源', content:'更新工序工时参数', time:'2025-01-20 14:15' },
  { operator:'李文涛', content:'添加工位信息：车削工位A', time:'2025-02-05 10:30' },
  { operator:'赵工', content:'更新质检方案关联', time:'2025-03-18 09:45' },
  { operator:'王志强', content:'修改技术参数配置', time:'2025-05-10 16:00' },
];

// 副产品 mock (for new form and detail)
const OUTPUT_PRODUCTS = [
  { id:1, code:'CP-001', name:'温湿度传感器', model:'IWS-TH200', cat:'废料', unit:'台', source:'自制件' },
  { id:2, code:'CP-002', name:'显示模组', model:'DSM-070', cat:'其他', unit:'套', source:'自制件' },
];

// Document options mock
const DOC_OPTIONS = ['工艺规范 V2.1', '作业指导书 A-12', '设备操作规程', '质量标准 QS-2025'];
const PROCESS_DOC_ROWS = [
  { code:'DOC-202605-001', name:'工艺规范 V2.1', category:'工艺规范', version:'V2.1', owner:'陈思源', updatedAt:'2026-05-12' },
  { code:'DOC-202605-002', name:'作业指导书 A-12', category:'作业指导书', version:'A-12', owner:'李文涛', updatedAt:'2026-05-10' },
  { code:'DOC-202604-018', name:'设备操作规程', category:'设备规程', version:'V1.4', owner:'设备组', updatedAt:'2026-04-28' },
  { code:'DOC-202604-009', name:'质量标准 QS-2025', category:'质量标准', version:'QS-2025', owner:'王志强', updatedAt:'2026-04-16' },
];

// ========== CATEGORY TREE ==========
function ProcessTree({ picked, setPicked }) {
  const [open, setOpen] = useState({ craft: true, assembly: false, inspect: false });
  const toggle = (k) => setOpen(o => ({ ...o, [k]: !o[k] }));

  return (
    <div className="aw-doc-tree">
      <div className="aw-doc-tree-h">工序分类 <span className="aw-doc-tree-n">(5)</span></div>
      <div className="aw-doc-tree-list">
        {/* 加工工序 */}
        <div className={'aw-tree-row aw-tree-l2' + (picked === '加工工序' ? ' on' : '')}
          onClick={() => setPicked('加工工序')}>
          <span className="aw-tree-caret" onClick={(e) => { e.stopPropagation(); toggle('craft'); }}>
            {open.craft ? '▾' : '▸'}
          </span>
          <span>加工工序</span>
        </div>
        {open.craft && <>
          <div className={'aw-tree-row aw-tree-l3' + (picked === '车削' ? ' on' : '')}
            onClick={() => setPicked('车削')}>
            <span>车削</span>
          </div>
          <div className={'aw-tree-row aw-tree-l3' + (picked === '铣削' ? ' on' : '')}
            onClick={() => setPicked('铣削')}>
            <span>铣削</span>
          </div>
        </>}
        {/* 装配工序 */}
        <div className={'aw-tree-row aw-tree-l2' + (picked === '装配工序' ? ' on' : '')}
          onClick={() => setPicked('装配工序')}>
          <span className="aw-tree-caret" onClick={(e) => { e.stopPropagation(); toggle('assembly'); }}>
            {open.assembly ? '▾' : '▸'}
          </span>
          <span>装配工序</span>
        </div>
        {/* 检验工序 */}
        <div className={'aw-tree-row aw-tree-l2' + (picked === '检验工序' ? ' on' : '')}
          onClick={() => setPicked('检验工序')}>
          <span className="aw-tree-caret" onClick={(e) => { e.stopPropagation(); toggle('inspect'); }}>
            {open.inspect ? '▾' : '▸'}
          </span>
          <span>检验工序</span>
        </div>
      </div>
    </div>
  );
}

// ========== LIST VIEW ==========
function ProcessListView({ picked, processes, onNew, onDetail, sel, toggleRow, allChecked, someChecked, toggleAll }) {
  const [drawer, setDrawer] = useState(null);

  const StatePill = ({ state }) => {
    if (state === '启用') return <span className="aw-state aw-state-g">启用</span>;
    if (state === '暂停') return <span className="aw-state aw-state-y">暂停</span>;
    return <span className="aw-state aw-state-gray">停用</span>;
  };

  return (
    <>
      {/* Toolbar */}
      <div className="aw-doc-tb">
        <div className="aw-doc-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8">
            <circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/>
          </svg>
          <input placeholder="搜索工序编码、名称…" />
        </div>
        <RefreshAction />
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
        <button className="aw-btn primary" onClick={onNew}>新增工序</button>
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
                <th style={{ width: 150 }}><div className="aw-th-inner">工序编码</div></th>
                <th style={{ width: 140 }}><div className="aw-th-inner">工序名称</div></th>
                <th style={{ width: 100 }}><div className="aw-th-inner">工序分类</div></th>
                <th style={{ width: 120 }}><div className="aw-th-inner">工作中心</div></th>
                <th style={{ width: 90 }}><div className="aw-th-inner">核算方式</div></th>
                <th style={{ width: 100 }}><div className="aw-th-inner">加工方式</div></th>
                <th style={{ width: 140 }}><div className="aw-th-inner">质检方案</div></th>
                <th style={{ width: 80 }}><div className="aw-th-inner">操作</div></th>
              </tr>
            </thead>
            <tbody>
              {processes.map((p, i) => (
                <tr key={p.id}>
                  <td onClick={e => { e.stopPropagation(); toggleRow(i); }}>
                    <span className={'aw-chk' + (sel[i] ? ' on' : '')} />
                  </td>
                  <td>
                    <span className="aw-link aw-num" onClick={e => { e.stopPropagation(); onDetail(i); }}>
                      {p.code}
                    </span>
                  </td>
                  <td>{p.name}</td>
                  <td>{p.cat}</td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <Badge>{p.wcCount}</Badge>
                      <span>{p.workCenter}</span>
                    </div>
                  </td>
                  <td>{p.calcMethod}</td>
                  <td>{p.processType}</td>
                  <td className="aw-num">{p.qcPlan}</td>
                  <td>
                    <span className="aw-link" onClick={e => { e.stopPropagation(); onDetail(i); }}>
                      查看
                    </span>
                  </td>
                </tr>
              ))}
              {processes.length === 0 && (
                <tr className="aw-row-blank">
                  <td colSpan={9} style={{ textAlign:'center', color:'var(--aw-fg-3)', padding:'32px 12px', fontSize:13 }}>
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
            <span>已选 {Object.values(sel).filter(Boolean).length} / {processes.length} 项</span>
            <button className="aw-btn" style={{ fontSize:12, padding:'4px 10px' }}>批量操作</button>
          </div>
          <div className="aw-doc-footer-r">
            <span>共 {processes.length} 条</span>
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

// ========== STATION PICKER MODAL ==========
function StationPickerModal({ onClose, onConfirm }) {
  const [sel, setSel] = useState({});
  const selCount = Object.values(sel).filter(Boolean).length;
  const stations = [
    { code:'GW-001', name:'车削工位A', line:'生产线1', workshop:'一车间', factory:'海南傲为工厂' },
    { code:'GW-002', name:'铣削工位B', line:'生产线2', workshop:'二车间', factory:'海南傲为工厂' },
    { code:'GW-003', name:'装配工位C', line:'装配线1', workshop:'三车间', factory:'海南傲为工厂' },
    { code:'GW-004', name:'检验工位D', line:'质检线1', workshop:'三车间', factory:'海南傲为工厂' },
    { code:'GW-005', name:'车削工位E', line:'生产线1', workshop:'一车间', factory:'海南傲为工厂' },
  ];

  const toggleRow = (i) => setSel(s => ({ ...s, [i]: !s[i] }));
  const headerCls = 'aw-chk' + (selCount === 0 ? '' : selCount === stations.length ? ' on' : ' indet');
  const toggleAll = () => {
    if (selCount === stations.length) setSel({});
    else { const n = {}; stations.forEach((_, i) => n[i] = true); setSel(n); }
  };

  return (
    <div className="aw-mask" onClick={onClose}>
      <div className="aw-modal" style={{ width:'min(700px, 94vw)' }} onClick={e => e.stopPropagation()}>
        <div className="head">
          <span>选择工位</span>
          <span style={{ cursor:'pointer', color:'var(--aw-fg-4)' }} onClick={onClose}>✕</span>
        </div>
        <div className="body" style={{ padding:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 20px', borderBottom:'1px solid #F0F1F4' }}>
            <span style={{ color:'#5677FC', fontSize:13, fontWeight:500 }}>已勾选 {selCount} 项</span>
            <div style={{ marginLeft:'auto', border:'1px solid #E5E7EB', borderRadius:6, padding:'4px 8px', display:'flex', gap:6, alignItems:'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--aw-fg-4)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input style={{ border:0, outline:'none', background:'transparent', font:'inherit', fontSize:13, color:'var(--aw-fg-1)', width:160 }}
                placeholder="搜索工位编码/名称" />
            </div>
          </div>
          <div className="aw-doc-tbl-inner">
            <table className="aw-doc-tbl">
              <thead>
                <tr>
                  <th style={{ width:40 }}><div className="aw-th-inner" style={{ justifyContent:'center' }}><span className={headerCls} onClick={toggleAll} /></div></th>
                  <th><div className="aw-th-inner">工位编码</div></th>
                  <th><div className="aw-th-inner">工位名称</div></th>
                  <th><div className="aw-th-inner">所属生产线</div></th>
                  <th><div className="aw-th-inner">所属车间</div></th>
                  <th><div className="aw-th-inner">所属工厂</div></th>
                </tr>
              </thead>
              <tbody>
                {stations.map((s, i) => (
                  <tr key={i}>
                    <td style={{ textAlign:'center' }}>
                      <span className={'aw-chk' + (sel[i] ? ' on' : '')} onClick={() => toggleRow(i)} />
                    </td>
                    <td className="aw-num">{s.code}</td>
                    <td>{s.name}</td>
                    <td>{s.line}</td>
                    <td>{s.workshop}</td>
                    <td>{s.factory}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:8, padding:'12px 20px', borderTop:'1px solid #F0F1F4' }}>
            <Btn onClick={onClose}>取消</Btn>
            <Btn kind="primary" onClick={() => { onConfirm && onConfirm(stations.filter((_, i) => sel[i])); }}>确定</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== 副产品选择弹窗 ==========
function OutputProductPicker({ onClose, onConfirm }) {
  const [sel, setSel] = useState({});
  const selCount = Object.values(sel).filter(Boolean).length;
  const products = OUTPUT_PRODUCTS;

  const toggleRow = (i) => setSel(s => ({ ...s, [i]: !s[i] }));
  const headerCls = 'aw-chk' + (selCount === 0 ? '' : selCount === products.length ? ' on' : ' indet');
  const toggleAll = () => {
    if (selCount === products.length) setSel({});
    else { const n = {}; products.forEach((_, i) => n[i] = true); setSel(n); }
  };

  return (
    <div className="aw-mask" onClick={onClose}>
      <div className="aw-modal" style={{ width:'min(700px, 94vw)' }} onClick={e => e.stopPropagation()}>
        <div className="head">
          <span>选择副产品</span>
          <span style={{ cursor:'pointer', color:'var(--aw-fg-4)' }} onClick={onClose}>✕</span>
        </div>
        <div className="body" style={{ padding:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 20px', borderBottom:'1px solid #F0F1F4' }}>
            <span style={{ color:'#5677FC', fontSize:13, fontWeight:500 }}>已勾选 {selCount} 项</span>
            <div style={{ marginLeft:'auto', border:'1px solid #E5E7EB', borderRadius:6, padding:'4px 8px', display:'flex', gap:6, alignItems:'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--aw-fg-4)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input style={{ border:0, outline:'none', background:'transparent', font:'inherit', fontSize:13, color:'var(--aw-fg-1)', width:160 }}
                placeholder="搜索产品名称/编号" />
            </div>
          </div>
          <div className="aw-doc-tbl-inner">
            <table className="aw-doc-tbl">
              <thead>
                <tr>
                  <th style={{ width:40 }}><div className="aw-th-inner" style={{ justifyContent:'center' }}><span className={headerCls} onClick={toggleAll} /></div></th>
                  <th style={{ width:60 }}><div className="aw-th-inner">图片</div></th>
                  <th><div className="aw-th-inner">产品名称</div></th>
                  <th><div className="aw-th-inner">产品编号</div></th>
                  <th><div className="aw-th-inner">型号</div></th>
                  <th style={{ width:80 }}><div className="aw-th-inner">分类</div></th>
                  <th style={{ width:60 }}><div className="aw-th-inner">单位</div></th>
                  <th style={{ width:80 }}><div className="aw-th-inner">获取方式</div></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={i}>
                    <td style={{ textAlign:'center' }}>
                      <span className={'aw-chk' + (sel[i] ? ' on' : '')} onClick={() => toggleRow(i)} />
                    </td>
                    <td>
                      <div style={{ width:36, height:36, borderRadius:6, background:'#E5E7EB', display:'flex', alignItems:'center', justifyContent:'center', color:'#9CA3AF', fontSize:16 }}>📦</div>
                    </td>
                    <td>{p.name}</td>
                    <td className="aw-num">{p.code}</td>
                    <td>{p.model}</td>
                    <td>{p.cat}</td>
                    <td>{p.unit}</td>
                    <td>{p.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:8, padding:'12px 20px', borderTop:'1px solid #F0F1F4' }}>
            <Btn onClick={onClose}>取消</Btn>
            <Btn kind="primary" onClick={() => { onConfirm && onConfirm(products.filter((_, i) => sel[i])); }}>确定</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProcessDocumentPicker({ value, onClose, onConfirm }) {
  const [selected, setSelected] = useState(
    PROCESS_DOC_ROWS.find(row => row.name === value) || PROCESS_DOC_ROWS[0]
  );
  return (
    <Modal
      title="选择关联文档"
      subtitle="从文档库选择工序相关文件"
      size="lg"
      onClose={onClose}
      footer={<><Btn onClick={onClose}>取消</Btn><Btn kind="primary" onClick={() => onConfirm && onConfirm(selected)}>确认</Btn></>}
    >
      <div style={{display:'grid',gridTemplateColumns:'170px 1fr',gap:14,minHeight:360}}>
        <div className="aw-doc-tree">
          {['全部文档','工艺规范','作业指导书','设备规程','质量标准'].map((g,i)=>(
            <div key={g} className={'aw-tree-row aw-tree-l2 ' + (i === 0 ? 'on' : '')}>
              <span>{g}</span>
            </div>
          ))}
        </div>
        <div>
          <div style={{marginBottom:12}}>
            <Input placeholder="搜索文档名称 / 编号 / 负责人" />
          </div>
          <table className="aw-table">
            <thead>
              <tr>
                <th style={{width:56}}>选择</th>
                <th style={{width:130}}>文档编号</th>
                <th>文档名称</th>
                <th style={{width:110}}>分类</th>
                <th style={{width:90}}>版本</th>
                <th style={{width:90}}>负责人</th>
                <th style={{width:110}}>更新时间</th>
              </tr>
            </thead>
            <tbody>
              {PROCESS_DOC_ROWS.map(row => (
                <tr key={row.code} onClick={() => setSelected(row)} style={{cursor:'pointer'}}>
                  <td><input type="radio" checked={selected.code === row.code} onChange={() => setSelected(row)} /></td>
                  <td className="aw-num">{row.code}</td>
                  <td>{row.name}</td>
                  <td>{row.category}</td>
                  <td>{row.version}</td>
                  <td>{row.owner}</td>
                  <td>{row.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}

function ProcessQcPlanPicker({ picked = [], onClose, onConfirm }) {
  const [sel, setSel] = useState(() => {
    const pickedCodes = new Set(picked.map(row => row.code));
    const init = {};
    IPQC_PLAN_ROWS.forEach((row, i) => { if (pickedCodes.has(row.code)) init[i] = true; });
    return init;
  });
  const selCount = Object.values(sel).filter(Boolean).length;
  const toggleRow = (i) => setSel(prev => ({ ...prev, [i]: !prev[i] }));
  const toggleAll = () => {
    if (selCount === IPQC_PLAN_ROWS.length) setSel({});
    else {
      const next = {};
      IPQC_PLAN_ROWS.forEach((_, i) => { next[i] = true; });
      setSel(next);
    }
  };
  const headerCls = 'aw-chk' + (selCount === 0 ? '' : selCount === IPQC_PLAN_ROWS.length ? ' on' : ' indet');

  return (
    <Modal
      title="选择 IPQC 质检方案"
      subtitle="制程质检方案列表"
      size="lg"
      onClose={onClose}
      footer={<><Btn onClick={onClose}>取消</Btn><Btn kind="primary" onClick={() => onConfirm && onConfirm(IPQC_PLAN_ROWS.filter((_, i) => sel[i]))}>确认</Btn></>}
    >
      <div style={{display:'grid',gridTemplateColumns:'170px 1fr',gap:14,minHeight:360}}>
        <div className="aw-doc-tree">
          {['全部IPQC','首件检验','巡检方案','停线处置','复检放行'].map((g,i)=>(
            <div key={g} className={'aw-tree-row aw-tree-l2 ' + (i === 0 ? 'on' : '')}>
              <span>{g}</span>
            </div>
          ))}
        </div>
        <div>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
            <span style={{color:'#5677FC',fontSize:13,fontWeight:500}}>已勾选 {selCount} 项</span>
            <Input placeholder="搜索方案名称 / 编号 / 控制点" style={{marginLeft:'auto',width:240}} />
          </div>
          <div className="aw-doc-tbl-inner" style={{ overflowX:'auto' }}>
          <table className="aw-doc-tbl" style={{ minWidth:760 }}>
            <thead>
              <tr>
                <th style={{width:48}}><div className="aw-th-inner" style={{ justifyContent:'center' }}><span className={headerCls} onClick={toggleAll} /></div></th>
                <th style={{width:128}}><div className="aw-th-inner">方案编号</div></th>
                <th style={{width:190}}><div className="aw-th-inner">方案名称</div></th>
                <th style={{width:120}}><div className="aw-th-inner">适用范围</div></th>
                <th style={{width:150}}><div className="aw-th-inner">抽样规则</div></th>
                <th style={{width:150}}><div className="aw-th-inner">关键控制点</div></th>
                <th style={{width:76}}><div className="aw-th-inner">状态</div></th>
              </tr>
            </thead>
            <tbody>
              {IPQC_PLAN_ROWS.map((row, i) => (
                <tr key={row.code} onClick={() => toggleRow(i)} style={{cursor:'pointer'}}>
                  <td style={{ textAlign:'center' }}><span className={'aw-chk' + (sel[i] ? ' on' : '')} /></td>
                  <td className="aw-num">{row.code}</td>
                  <td>{row.name}</td>
                  <td>{row.scope}</td>
                  <td>{row.sampling}</td>
                  <td>{row.control}</td>
                  <td>{row.state === '启用' ? <Badge tone="g">启用</Badge> : <Badge tone="y">{row.state}</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ========== NEW FORM VIEW ==========
function ProcessNewView({ onBack }) {
  const [configTab, setConfigTab] = useState('station');
  const [linkedDoc, setLinkedDoc] = useState('');
  const [showDocPicker, setShowDocPicker] = useState(false);
  const [showQcPlan, setShowQcPlan] = useState(false);
  const [qcPlans, setQcPlans] = useState([]);
  const [showQcPlanPicker, setShowQcPlanPicker] = useState(false);

  // 工位 sub-table
  const [stations, setStations] = useState([
    { code:'GW-001', name:'车削工位A', line:'生产线1', workshop:'一车间', factory:'海南傲为工厂' },
  ]);
  const [showStationPicker, setShowStationPicker] = useState(false);

  // 工时 Switch
  const [showHours, setShowHours] = useState(false);
  const [stdHours, setStdHours] = useState('');
  const [auxHours, setAuxHours] = useState('');
  const [coolHours, setCoolHours] = useState('');
  const [processCost, setProcessCost] = useState('');

  // 副产品 Switch
  const [showOutput, setShowOutput] = useState(false);
  const [outputProducts, setOutputProducts] = useState([]);
  const [showOutputPicker, setShowOutputPicker] = useState(false);

  // 技术参数 dynamic table
  const [techParams, setTechParams] = useState([{ id:Date.now(), name:'', value:'' }]);

  const addTechParam = () => {
    setTechParams(prev => [...prev, { id:Date.now(), name:'', value:'' }]);
  };
  const updateTechParam = (id, field, val) => {
    setTechParams(prev => prev.map(p => p.id === id ? { ...p, [field]: val } : p));
  };
  const removeTechParam = (id) => {
    setTechParams(prev => prev.length > 1 ? prev.filter(p => p.id !== id) : prev);
  };

  const removeStation = (idx) => {
    setStations(prev => prev.filter((_, i) => i !== idx));
  };

  const removeOutput = (idx) => {
    setOutputProducts(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="aw-doc-form">
      {/* Header */}
      <div className="aw-doc-form-head">
        <span className="aw-link" onClick={onBack}>← 返回列表</span>
        <span style={{ flex:1 }} />
        <button className="aw-btn" onClick={onBack}>取消</button>
        <button className="aw-btn">暂存</button>
        <button className="aw-btn primary">保存</button>
      </div>
      <div className="aw-doc-form-body">

        {/* Section: 基础信息 */}
        <Card title="基础信息">
          <div className="aw-doc-grid">
            <Field label="工序编码" req><Input placeholder="请输入工序编码" /></Field>
            <Field label="工序名称" req><Input placeholder="请输入工序名称" /></Field>
            <Field label={<span>工序类型<HelpTip text="自制按人工费+制造费用归集；委外按加工费归集并触发委外采购/出入库；多选允许生产订单上按实际情况切换。" /></span>} req>
              <Select><option>请选择</option><option>自制</option><option>委外</option><option>多选</option></Select>
            </Field>
            <Field label="工序分类" req>
              <Select><option>请选择</option><option>车削</option><option>铣削</option><option>装配工序</option><option>检验工序</option></Select>
            </Field>
          </div>
        </Card>

        {/* Section: 工序配置 */}
        <Card>
          <Tabs
            items={[
              { k:'station', label:'工位' },
              { k:'hours', label:'工时' },
              { k:'output', label:'副产品' },
              { k:'params', label:'技术参数' },
              { k:'qc', label:'质检方案' },
            ]}
            active={configTab}
            onChange={setConfigTab}
          />

          {configTab === 'station' && (
            <div style={{ paddingTop:16 }}>
              <table className="aw-table" style={{ borderRadius:6, overflow:'hidden' }}>
                <thead>
                  <tr>
                    <th>工位编码</th>
                    <th>工位名称</th>
                    <th>所属生产线</th>
                    <th>所属车间</th>
                    <th>所属工厂</th>
                    <th style={{ width:80 }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {stations.map((s, i) => (
                    <tr key={i}>
                      <td className="aw-num">{s.code}</td>
                      <td>{s.name}</td>
                      <td>{s.line}</td>
                      <td>{s.workshop}</td>
                      <td>{s.factory}</td>
                      <td>
                        <span className="aw-link" onClick={() => removeStation(i)} style={{ color:'#F5222D', fontSize:12 }}>删除</span>
                      </td>
                    </tr>
                  ))}
                  {stations.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign:'center', color:'var(--aw-fg-3)', padding:'24px 12px', fontSize:13 }}>暂未添加工位</td></tr>
                  )}
                </tbody>
              </table>
              <div style={{ marginTop:12 }}>
                <Btn onClick={() => setShowStationPicker(true)}>+ 添加工位</Btn>
              </div>
            </div>
          )}

          {configTab === 'hours' && (
            <div style={{ paddingTop:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                <span style={{ fontSize:13, color:'var(--aw-fg-2)' }}>工时配置</span>
                <Switch on={showHours} onChange={setShowHours} />
                <span style={{ fontSize:12, color:'var(--aw-fg-3)' }}>{showHours ? '已开启' : '已关闭'}</span>
              </div>
              {showHours && (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4, minmax(0, 1fr))', gap:16 }}>
                  <Field label="标准工时">
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <Input type="number" placeholder="0" value={stdHours} onChange={e => setStdHours(e.target.value)} style={{ flex:1 }} />
                      <span style={{ fontSize:13, color:'var(--aw-fg-3)', whiteSpace:'nowrap' }}>分钟</span>
                    </div>
                  </Field>
                  <Field label="辅助工时">
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <Input type="number" placeholder="0" value={auxHours} onChange={e => setAuxHours(e.target.value)} style={{ flex:1 }} />
                      <span style={{ fontSize:13, color:'var(--aw-fg-3)', whiteSpace:'nowrap' }}>分钟</span>
                    </div>
                  </Field>
                  <Field label="冷却工时">
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <Input type="number" placeholder="0" value={coolHours} onChange={e => setCoolHours(e.target.value)} style={{ flex:1 }} />
                      <span style={{ fontSize:13, color:'var(--aw-fg-3)', whiteSpace:'nowrap' }}>分钟</span>
                    </div>
                  </Field>
                  <Field label="工序成本">
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <Input type="number" placeholder="0" value={processCost} onChange={e => setProcessCost(e.target.value)} style={{ flex:1 }} />
                      <span style={{ fontSize:13, color:'var(--aw-fg-3)', whiteSpace:'nowrap' }}>元</span>
                    </div>
                  </Field>
                </div>
              )}
            </div>
          )}

          {configTab === 'output' && (
            <div style={{ paddingTop:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                <span style={{ fontSize:13, color:'var(--aw-fg-2)' }}>副产品配置</span>
                <Switch on={showOutput} onChange={setShowOutput} />
                <span style={{ fontSize:12, color:'var(--aw-fg-3)' }}>{showOutput ? '已开启' : '已关闭'}</span>
              </div>
              {showOutput && (
                <div>
                  <div style={{ marginBottom:12 }}>
                    <Btn onClick={() => setShowOutputPicker(true)}>+ 选择副产品</Btn>
                  </div>
                  {outputProducts.length > 0 ? (
                    <table className="aw-table" style={{ borderRadius:6, overflow:'hidden' }}>
                      <thead>
                        <tr>
                          <th style={{ width:60 }}>图片</th>
                          <th>产品名称</th>
                          <th>产品编号</th>
                          <th>型号</th>
                          <th style={{ width:80 }}>分类</th>
                          <th style={{ width:60 }}>单位</th>
                          <th style={{ width:80 }}>获取方式</th>
                          <th style={{ width:80 }}>操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {outputProducts.map((p, i) => (
                          <tr key={i}>
                            <td>
                              <div style={{ width:36, height:36, borderRadius:6, background:'#E5E7EB', display:'flex', alignItems:'center', justifyContent:'center', color:'#9CA3AF', fontSize:16 }}>📦</div>
                            </td>
                            <td>{p.name}</td>
                            <td className="aw-num">{p.code}</td>
                            <td>{p.model}</td>
                            <td>{p.cat}</td>
                            <td>{p.unit}</td>
                            <td>{p.source}</td>
                            <td>
                              <span className="aw-link" onClick={() => removeOutput(i)} style={{ color:'#F5222D', fontSize:12 }}>删除</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ border:'1px dashed #D1D5DB', borderRadius:6, padding:'24px', textAlign:'center', color:'#6B7280', fontSize:13 }}>
                      暂未选择副产品，请点击上方按钮选择
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {configTab === 'params' && (
            <div style={{ paddingTop:16 }}>
              <table className="aw-table" style={{ borderRadius:6, overflow:'hidden' }}>
                <thead>
                  <tr>
                    <th>参数名称</th>
                    <th>参数值</th>
                    <th style={{ width:80 }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {techParams.map(p => (
                    <tr key={p.id}>
                      <td>
                        <Input placeholder="请输入参数名称" value={p.name}
                          onChange={e => updateTechParam(p.id, 'name', e.target.value)} />
                      </td>
                      <td>
                        <Input placeholder="请输入参数值" value={p.value}
                          onChange={e => updateTechParam(p.id, 'value', e.target.value)} />
                      </td>
                      <td>
                        {techParams.length > 1 && (
                          <span className="aw-link" onClick={() => removeTechParam(p.id)} style={{ color:'#F5222D', fontSize:12 }}>删除</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop:12 }}>
                <Btn onClick={addTechParam}>+ 添加参数</Btn>
              </div>
            </div>
          )}

          {configTab === 'qc' && (
            <div style={{ paddingTop:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                <span style={{ fontSize:13, color:'var(--aw-fg-2)' }}>质检方案配置</span>
                <Switch on={showQcPlan} onChange={setShowQcPlan} />
                <span style={{ fontSize:12, color:'var(--aw-fg-3)' }}>{showQcPlan ? '已开启' : '已关闭'}</span>
              </div>
              {showQcPlan && (
                <div>
                  <div style={{ fontSize:13, color:'var(--aw-fg-3)', marginBottom:12 }}>选择当前工序执行时需要带出的制程质检 IPQC 方案。</div>
                  {qcPlans.length > 0 ? (
                    <table className="aw-table" style={{ borderRadius:6, overflow:'hidden' }}>
                      <thead>
                        <tr>
                          <th style={{ width:150 }}>方案编号</th>
                          <th>方案名称</th>
                          <th style={{ width:140 }}>适用范围</th>
                          <th style={{ width:180 }}>抽样规则</th>
                          <th style={{ width:180 }}>关键控制点</th>
                          <th style={{ width:80 }}>状态</th>
                          <th style={{ width:80 }}>操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {qcPlans.map(row => (
                          <tr key={row.code}>
                            <td className="aw-num">{row.code}</td>
                            <td>{row.name}</td>
                            <td>{row.scope}</td>
                            <td>{row.sampling}</td>
                            <td>{row.control}</td>
                            <td>{row.state === '启用' ? <Badge tone="g">启用</Badge> : <Badge tone="y">{row.state}</Badge>}</td>
                            <td>
                              <span className="aw-link" onClick={() => setQcPlans(prev => prev.filter(item => item.code !== row.code))} style={{ color:'#F5222D', fontSize:12 }}>删除</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ border:'1px dashed #D1D5DB', borderRadius:6, padding:'24px', textAlign:'center', color:'#6B7280', fontSize:13 }}>
                      暂未选择质检方案，请点击下方按钮添加 IPQC 质检方案
                    </div>
                  )}
                  <div style={{ marginTop:12 }}>
                    <Btn onClick={() => setShowQcPlanPicker(true)}>+ 添加质检方案</Btn>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Section: 工序说明 */}
        <Card title="工序说明">
          <div className="aw-doc-grid" style={{ marginBottom:14 }}>
            <Field label="关联文档">
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <Input
                  value={linkedDoc}
                  readOnly
                  placeholder="请选择关联文档"
                  onClick={() => setShowDocPicker(true)}
                  style={{ flex:1, cursor:'pointer' }}
                />
                <button className="aw-btn" type="button" onClick={() => setShowDocPicker(true)} style={{ fontSize:12, padding:'5px 10px', whiteSpace:'nowrap' }}>选择</button>
              </div>
            </Field>
          </div>
          <div style={{ marginTop:8 }}>
            <div className="aw-rt-bar">
              <span>B</span><span><i>I</i></span><span><u>U</u></span><span>S</span>
              <i style={{ width:1, height:14, background:'#E5E7EB' }} />
              <span>≡</span><span>≣</span><span>·</span><span>1.</span>
              <i style={{ width:1, height:14, background:'#E5E7EB' }} />
              <span>🔗</span><span>📷</span><span>📎</span>
            </div>
            <div className="aw-rt-area" contentEditable suppressContentEditableWarning>
              请输入工序说明内容…
            </div>
          </div>
          <div style={{ marginTop:14 }}>
            <Field label="附件信息">
              <div style={{ border:'1px dashed #D1D5DB', borderRadius:6, padding:'24px', textAlign:'center', color:'#6B7280', fontSize:13 }}>
                <span className="aw-link">点击上传</span> / 拖拽到此区域 &nbsp;
                <span style={{ color:'#9CA3AF', fontSize:12 }}>支持 PDF / Word / Excel / Txt / JPG / PNG / RAR，单文件 ≤ 20MB</span>
              </div>
            </Field>
          </div>
        </Card>

      </div>

      {/* Modals */}
      {showStationPicker && (
        <StationPickerModal
          onClose={() => setShowStationPicker(false)}
          onConfirm={(selected) => {
            setStations(prev => [...prev, ...selected]);
            setShowStationPicker(false);
          }}
        />
      )}
      {showOutputPicker && (
        <OutputProductPicker
          onClose={() => setShowOutputPicker(false)}
          onConfirm={(selected) => {
            setOutputProducts(prev => [...prev, ...selected]);
            setShowOutputPicker(false);
          }}
        />
      )}
      {showDocPicker && (
        <ProcessDocumentPicker
          value={linkedDoc}
          onClose={() => setShowDocPicker(false)}
          onConfirm={(doc) => {
            setLinkedDoc(doc.name);
            setShowDocPicker(false);
          }}
        />
      )}
      {showQcPlanPicker && (
        <ProcessQcPlanPicker
          picked={qcPlans}
          onClose={() => setShowQcPlanPicker(false)}
          onConfirm={(rows) => {
            setQcPlans(rows);
            setShowQcPlanPicker(false);
          }}
        />
      )}
    </div>
  );
}

// ========== DETAIL VIEW ==========
function ProcessDetailView({ process, onBack }) {
  const [tab, setTab] = useState('info');
  const [editMode, setEditMode] = useState(false);
  // Editable tech params for detail
  const [detailParams, setDetailParams] = useState(TECH_PARAMS.map(p => ({ ...p })));

  const updateDetailParam = (id, field, val) => {
    setDetailParams(prev => prev.map(p => p.id === id ? { ...p, [field]: val } : p));
  };

  if (!process) return null;

  const StateBadge = ({ state }) => {
    if (state === '启用') return <Badge tone="g">启用</Badge>;
    if (state === '暂停') return <Badge tone="y">暂停</Badge>;
    return <span style={{ display:'inline-flex',alignItems:'center',gap:4,padding:'2px 8px',borderRadius:10,fontSize:11,background:'#F3F4F6',color:'#6B7280' }}>
      <span style={{ width:5,height:5,borderRadius:'50%',background:'#9CA3AF' }}></span>停用
    </span>;
  };

  return (
    <div className="aw-doc-form">
      {/* Header */}
      <div className="aw-doc-form-head">
        <span className="aw-link" onClick={onBack}>← 返回列表</span>
        <span style={{ flex:1 }} />
        <button className="aw-btn" onClick={() => setEditMode(!editMode)}>编辑</button>
        <button className="aw-btn danger">删除</button>
        <button className="aw-btn">{process.state === '暂停' ? '启用' : '暂停'}</button>
      </div>
      <div className="aw-doc-form-body">

        {/* Info Header */}
        <Card style={{ position:'relative' }}>
          <div style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
            <div style={{ width:64, height:64, borderRadius:8, background:'var(--aw-primary-soft)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--aw-primary)', fontSize:28, flex:'none' }}>
              ⚙
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                <span className="aw-h2" style={{ margin:0 }}>{process.name}</span>
                <StateBadge state={process.state} />
              </div>
              <div style={{ display:'flex', gap:18, fontSize:12, color:'#6B7280', marginBottom:4 }}>
                <span>创建人：{process.creator}</span>
                <span>创建时间：{process.createdAt}</span>
              </div>
              <div style={{ display:'flex', gap:18, fontSize:12, color:'#6B7280', marginBottom:14 }}>
                <span>修改人：{process.modifier}</span>
                <span>修改时间：{process.modifiedAt}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Card>
          <Tabs items={[
            { k:'info', label:'工序信息' },
            { k:'station', label:'工序工位' },
            { k:'hours', label:'工序工时' },
            { k:'output', label:'副产品' },
            { k:'params', label:'技术参数' },
            { k:'qc', label:'工序质检' },
            { k:'log', label:'操作记录' },
          ]} active={tab} onChange={setTab} />

          {/* === 工序信息 === */}
          {tab === 'info' && (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', rowGap:14, columnGap:32, fontSize:13 }}>
                <KV k="工序编码" v={process.code} mono />
                <KV k="工序名称" v={process.name} />
                <KV k="工序分类" v={process.cat} />
                <KV k="工序类型" v={process.processType} />
                <KV k="核算方式" v={process.calcMethod} />
                <KV k="加工方式" v={process.processType} />
                <KV k="工作中心" v={process.workCenter} />
                <KV k="质检方案" v={process.qcPlan} mono />
              </div>

              {/* 工序描述 */}
              <div style={{ marginTop:18 }}>
                <div className="aw-section-title">工序描述</div>
                <div style={{ fontSize:13, color:'#4B5563', lineHeight:1.7 }}>{process.desc}</div>
              </div>

              {/* 附件 */}
              <div style={{ marginTop:18 }}>
                <div className="aw-section-title">附件信息</div>
                <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                  <div style={{ border:'1px solid #E5E7EB', borderRadius:6, padding:'8px 12px', fontSize:12, display:'flex', alignItems:'center', gap:8 }}>
                    📄 工艺规范_v2.pdf <span style={{ color:'#9CA3AF' }}>1.8MB</span>
                    <span className="aw-link" style={{ fontSize:12 }}>下载</span>
                  </div>
                  <div style={{ border:'1px solid #E5E7EB', borderRadius:6, padding:'8px 12px', fontSize:12, display:'flex', alignItems:'center', gap:8 }}>
                    📄 作业指导书.docx <span style={{ color:'#9CA3AF' }}>420KB</span>
                    <span className="aw-link" style={{ fontSize:12 }}>下载</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* === 工序工位 === */}
          {tab === 'station' && (
            <table className="aw-table" style={{ borderRadius:6, overflow:'hidden' }}>
              <thead>
                <tr>
                  <th>工位编码</th>
                  <th>工位名称</th>
                  <th>所属生产线</th>
                  <th>所属车间</th>
                  <th>所属工厂</th>
                </tr>
              </thead>
              <tbody>
                {STATIONS_MOCK.map((s, i) => (
                  <tr key={s.id}>
                    <td className="aw-num">{s.code}</td>
                    <td>{s.name}</td>
                    <td>{s.line}</td>
                    <td>{s.workshop}</td>
                    <td>{s.factory}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* === 工序工时 === */}
          {tab === 'hours' && (
            <div>
              {/* Summary cards */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:12, marginBottom:18 }}>
                <div style={{ background:'#F5F6FA', borderRadius:8, padding:'14px 16px', textAlign:'center' }}>
                  <div style={{ fontSize:11, color:'#6B7280', marginBottom:4 }}>标准工时</div>
                  <div style={{ fontSize:24, fontWeight:600, fontFamily:'var(--aw-font-num)', color:'#1F2937' }}>45<span style={{ fontSize:13, fontWeight:400, color:'#6B7280' }}> 分钟</span></div>
                </div>
                <div style={{ background:'#F5F6FA', borderRadius:8, padding:'14px 16px', textAlign:'center' }}>
                  <div style={{ fontSize:11, color:'#6B7280', marginBottom:4 }}>辅助工时</div>
                  <div style={{ fontSize:24, fontWeight:600, fontFamily:'var(--aw-font-num)', color:'#1F2937' }}>10<span style={{ fontSize:13, fontWeight:400, color:'#6B7280' }}> 分钟</span></div>
                </div>
                <div style={{ background:'#F5F6FA', borderRadius:8, padding:'14px 16px', textAlign:'center' }}>
                  <div style={{ fontSize:11, color:'#6B7280', marginBottom:4 }}>冷却工时</div>
                  <div style={{ fontSize:24, fontWeight:600, fontFamily:'var(--aw-font-num)', color:'#1F2937' }}>5<span style={{ fontSize:13, fontWeight:400, color:'#6B7280' }}> 分钟</span></div>
                </div>
                <div style={{ background:'#F5F6FA', borderRadius:8, padding:'14px 16px', textAlign:'center' }}>
                  <div style={{ fontSize:11, color:'#6B7280', marginBottom:4 }}>工序成本</div>
                  <div style={{ fontSize:24, fontWeight:600, fontFamily:'var(--aw-font-num)', color:'#1F2937' }}>380<span style={{ fontSize:13, fontWeight:400, color:'#6B7280' }}> 元</span></div>
                </div>
              </div>

              {/* Detailed table */}
              <table className="aw-table" style={{ borderRadius:6, overflow:'hidden' }}>
                <thead>
                  <tr>
                    <th>工序编码</th>
                    <th>工序名称</th>
                    <th>标准工时(分钟)</th>
                    <th>辅助工时(分钟)</th>
                    <th>冷却工时(分钟)</th>
                    <th>工序成本(元)</th>
                  </tr>
                </thead>
                <tbody>
                  {LABOR_HOURS.map(r => (
                    <tr key={r.id}>
                      <td className="aw-num">{r.code}</td>
                      <td>{r.name}</td>
                      <td className="aw-num">{r.stdHours}</td>
                      <td className="aw-num">{r.auxHours}</td>
                      <td className="aw-num">{r.coolHours}</td>
                      <td className="aw-num">{r.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* === 副产品 === */}
          {tab === 'output' && (
            <table className="aw-table" style={{ borderRadius:6, overflow:'hidden' }}>
              <thead>
                <tr>
                  <th style={{ width:60 }}>图片</th>
                  <th>产品名称</th>
                  <th>产品编号</th>
                  <th>型号</th>
                  <th style={{ width:90 }}>分类</th>
                  <th style={{ width:70 }}>单位</th>
                  <th style={{ width:100 }}>获取方式</th>
                </tr>
              </thead>
              <tbody>
                {OUTPUT_PRODUCTS.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ width:36, height:36, borderRadius:6, background:'#E5E7EB', display:'flex', alignItems:'center', justifyContent:'center', color:'#9CA3AF', fontSize:16 }}>📦</div>
                    </td>
                    <td>{p.name}</td>
                    <td className="aw-num">{p.code}</td>
                    <td>{p.model}</td>
                    <td>{p.cat}</td>
                    <td>{p.unit}</td>
                    <td>{p.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* === 技术参数 === */}
          {tab === 'params' && (
            <div>
              {editMode ? (
                <table className="aw-table" style={{ borderRadius:6, overflow:'hidden' }}>
                  <thead>
                    <tr>
                      <th>参数名称</th>
                      <th>参数值</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailParams.map(p => (
                      <tr key={p.id}>
                        <td>
                          <Input value={p.name} onChange={e => updateDetailParam(p.id, 'name', e.target.value)} />
                        </td>
                        <td>
                          <Input value={p.value} onChange={e => updateDetailParam(p.id, 'value', e.target.value)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', rowGap:12, columnGap:32, fontSize:13 }}>
                  {detailParams.map(p => (
                    <KV key={p.id} k={p.name} v={p.value} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* === 工序质检 === */}
          {tab === 'qc' && (
            <div>
              <div style={{ marginBottom:14, fontSize:13 }}>
                <span style={{ color:'#6B7280' }}>质检方案：</span>
                <span className="aw-link aw-num">{process.qcPlan}</span>
              </div>
              <table className="aw-table" style={{ borderRadius:6, overflow:'hidden' }}>
                <thead>
                  <tr>
                    <th>检验项目</th>
                    <th>标准值</th>
                    <th>检验工具</th>
                    <th>检验频次</th>
                  </tr>
                </thead>
                <tbody>
                  {QC_ITEMS.map((item, i) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td className="aw-num">{item.standard}</td>
                      <td>{item.tool}</td>
                      <td>{item.freq}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* === 操作记录 === */}
          {tab === 'log' && (
            <div>
              {OP_LOGS.map((log, i) => (
                <div key={i} style={{
                  display:'flex', gap:16, padding:'14px 0',
                  borderBottom: i < OP_LOGS.length - 1 ? '1px solid var(--aw-divider)' : 'none',
                  position:'relative',
                }}>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flex:'none', width:24 }}>
                    <div style={{
                      width:10, height:10, borderRadius:'50%',
                      background: i === 0 ? '#5677FC' : '#D1D5DB',
                      flex:'none', marginTop:4,
                    }} />
                    {i < OP_LOGS.length - 1 && (
                      <div style={{ width:2, flex:1, background:'#E5E7EB', minHeight:20 }} />
                    )}
                  </div>
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
    </div>
  );
}

// KV display helper
function KV({ k, v, mono }) {
  return (
    <div style={{ display:'flex', gap:18 }}>
      <span style={{ color:'#6B7280', width:90, flex:'none' }}>{k}</span>
      <span className={mono ? 'aw-num' : ''}>：{v}</span>
    </div>
  );
}

// ========== MAIN SCREEN ==========
function ProcessListScreen({ module: mod, initialAction, onActionConsumed }) {
  const [view, setView] = useState('list');
  const [picked, setPicked] = useState('加工工序');
  const [detailIdx, setDetailIdx] = useState(null);
  const [sel, setSel] = useState({});

  useEffect(() => {
    if (initialAction === 'new') { setView('new'); onActionConsumed && onActionConsumed(); }
    else if (initialAction === 'list') { setView('list'); onActionConsumed && onActionConsumed(); }
  }, [initialAction]);

  // Filter by category tree
  const filteredProcesses = (() => {
    if (picked === '加工工序') return PROCESSES.filter(p => p.catParent === '加工工序');
    if (picked === '车削') return PROCESSES.filter(p => p.cat === '车削');
    if (picked === '铣削') return PROCESSES.filter(p => p.cat === '铣削');
    return PROCESSES.filter(p => p.cat === picked || p.catParent === picked);
  })();

  // Checkbox state
  const allChecked = filteredProcesses.length > 0 && filteredProcesses.every((_, i) => sel[i]);
  const someChecked = filteredProcesses.some((_, i) => sel[i]);
  const toggleAll = () => {
    if (allChecked) setSel({});
    else { const n = {}; filteredProcesses.forEach((_, i) => n[i] = true); setSel(n); }
  };
  const toggleRow = (i) => setSel(s => ({ ...s, [i]: !s[i] }));

  return (
    <div className="aw-doc-page">
      {view === 'list' && (
        <ProcessTree picked={picked} setPicked={setPicked} />
      )}
      <div className="aw-doc-main">
        {view === 'list' && (
          <ProcessListView
            picked={picked}
            processes={filteredProcesses}
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
          <ProcessNewView onBack={() => setView('list')} />
        )}
        {view === 'detail' && (
          <ProcessDetailView
            process={detailIdx !== null ? filteredProcesses[detailIdx] : PROCESSES[0]}
            onBack={() => { setView('list'); setDetailIdx(null); }}
          />
        )}
      </div>
    </div>
  );
}

window.ProcessListScreen = ProcessListScreen;
