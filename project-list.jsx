// project-list.jsx — 项目管理 ProjectListScreen（列表 / 新增 / 详情三态）
// Session: 260515-brave-oasis

const { useState, useEffect } = React;

// ═══════════════════════════════════════════════════════════════
//  Mock Data
// ═══════════════════════════════════════════════════════════════
const PROJECT_ROWS = [
  { code: 'PRJ-2025-001', name: '智能输送线系统研发', category: '研发项目', status: '进行中', stTone: 'b', priority: '高', pTone: 'r', owner: '老夏', ownerAv: '夏', startDate: '2025-03-01', planEnd: '2025-12-31', progress: 65 },
  { code: 'PRJ-2025-002', name: 'ERP系统升级改造', category: '工程项目', status: '筹备中', stTone: 'g', priority: '中', pTone: 'orange', owner: '李文涛', ownerAv: '李', startDate: '2025-06-15', planEnd: '2026-03-30', progress: 20 },
  { code: 'PRJ-2025-003', name: '智能仓储管理系统', category: '研发项目', status: '已完成', stTone: 'g', priority: '高', pTone: 'r', owner: '陈思源', ownerAv: '陈', startDate: '2024-09-01', planEnd: '2025-05-31', progress: 100 },
  { code: 'PRJ-2025-004', name: '校企合作创新实验室', category: '合作项目', status: '已暂停', stTone: 'gray', priority: '低', pTone: 'gray', owner: '赵工', ownerAv: '赵', startDate: '2025-01-10', planEnd: '2026-01-09', progress: 35 },
  { code: 'PRJ-2025-005', name: '生产自动化二期', category: '工程项目', status: '进行中', stTone: 'b', priority: '中', pTone: 'orange', owner: '王志强', ownerAv: '王', startDate: '2025-04-20', planEnd: '2025-11-15', progress: 48 },
];

// Mock members for detail view
const PROJECT_MEMBERS = [
  { name: '老夏', role: '负责人', joinDate: '2025-03-01' },
  { name: '李文涛', role: '参与者', joinDate: '2025-03-15' },
  { name: '陈思源', role: '观察者', joinDate: '2025-04-10' },
];

// Mock milestones
const PROJECT_MILESTONES = [
  { name: '需求评审完成', planDate: '2025-04-01', doneDate: '2025-04-03', status: '已完成', stTone: 'g', owner: '老夏' },
  { name: '原型设计交付', planDate: '2025-06-01', doneDate: '2025-06-05', status: '已完成', stTone: 'g', owner: '李文涛' },
  { name: '系统联调测试', planDate: '2025-10-01', doneDate: '', status: '进行中', stTone: 'b', owner: '陈思源' },
];

// Mock documents
const PROJECT_DOCS = [
  { name: '项目需求规格说明书.pdf', type: 'PDF', uploader: '老夏', uploadTime: '2025-03-05 10:30' },
  { name: '技术架构设计.docx', type: 'Word', uploader: '李文涛', uploadTime: '2025-04-12 14:20' },
  { name: '测试方案.xlsx', type: 'Excel', uploader: '陈思源', uploadTime: '2025-07-20 09:15' },
];

// Mock approvals
const PROJECT_APPROVALS = [
  { node: '部门经理审批', approver: '张总', opinion: '同意立项，请按计划推进', time: '2025-02-20 10:30', result: '通过', rTone: 'g' },
  { node: '技术评审', approver: '李技术总监', opinion: '技术方案可行，建议增加备份机制', time: '2025-02-25 15:00', result: '通过', rTone: 'g' },
  { node: '财务审批', approver: '王财务总监', opinion: '预算合理，批准', time: '2025-02-28 09:45', result: '通过', rTone: 'g' },
  { node: '总经理审批', approver: '陈总', opinion: '', time: '', result: '待审批', rTone: 'y' },
];

// Mock operation logs
const PROJECT_LOGS = [
  { operator: '老夏', action: '创建项目', time: '2025-03-01 09:00' },
  { operator: '老夏', action: '修改项目基本信息', time: '2025-03-02 14:20' },
  { operator: '李文涛', action: '添加项目成员「陈思源」', time: '2025-04-10 11:00' },
  { operator: '陈思源', action: '创建里程碑「系统联调测试」', time: '2025-06-15 16:30' },
  { operator: '老夏', action: '上传附件「测试方案.xlsx」', time: '2025-07-20 09:15' },
];

// ═══════════════════════════════════════════════════════════════
//  Priority / Status helpers
// ═══════════════════════════════════════════════════════════════
const PRIORITY_MAP = { '高': 'r', '中': 'orange', '低': 'gray' };
const STATUS_MAP   = { '筹备中': 'b', '进行中': 'b', '已完成': 'g', '已暂停': 'gray' };
const CAT_OPTIONS  = ['研发项目', '工程项目', '合作项目', '内部研发', '合作研发', '基建工程', '校企合作'];

const PROJECT_TREE = [
  { k: 'rd', label: '研发项目', open: true, kids: [{ k: 'rd_inner', label: '内部研发' }, { k: 'rd_product', label: '产品研发' }] },
  { k: 'eng', label: '工程项目', open: true, kids: [{ k: 'eng_it', label: '系统改造' }, { k: 'eng_auto', label: '自动化工程' }] },
  { k: 'coop', label: '合作项目', open: true, kids: [{ k: 'coop_school', label: '校企合作' }, { k: 'coop_partner', label: '联合创新' }] },
];

const PROJECT_CAT_MAP = {
  rd: '研发项目',
  rd_inner: '研发项目',
  rd_product: '研发项目',
  eng: '工程项目',
  eng_it: '工程项目',
  eng_auto: '工程项目',
  coop: '合作项目',
  coop_school: '合作项目',
  coop_partner: '合作项目',
};

const PROJECT_SOURCE_ROWS = {
  客户: [
    { type:'客户', code:'CUST-2026-001', title:'海南微为智造产业有限公司', subject:'客户定制研发项目', owner:'夏经理', amount:'-', date:'2026-06-01' },
    { type:'客户', code:'CUST-2026-002', title:'广州明德贸易有限公司', subject:'年度合作项目', owner:'陈经理', amount:'-', date:'2026-06-03' },
    { type:'客户', code:'CUST-2026-003', title:'深圳鑫达电子科技有限公司', subject:'工程交付项目', owner:'丁昌容', amount:'-', date:'2026-06-05' },
  ],
  合同: [
    { type:'合同', code:'CT-2026-0089', title:'智能产线升级合同', subject:'海南微为智造产业有限公司', owner:'夏经理', amount:'¥ 850,000.00', date:'2026-06-10' },
    { type:'合同', code:'CT-2026-0096', title:'仓储系统改造合同', subject:'广州明德贸易有限公司', owner:'陈经理', amount:'¥ 620,000.00', date:'2026-06-18' },
    { type:'合同', code:'CT-2026-0102', title:'控制系统联合研发合同', subject:'深圳鑫达电子科技有限公司', owner:'丁昌容', amount:'¥ 1,200,000.00', date:'2026-06-25' },
  ],
};

function ProjectSourceField({ value, onPick }) {
  return (
    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
      <Input
        placeholder="请选择客户或关联合同"
        value={value ? `${value.type} / ${value.code} / ${value.title}` : ''}
        readOnly
        onClick={onPick}
        style={{ flex:1, cursor:'pointer' }}
      />
      <Btn onClick={onPick}>关联</Btn>
    </div>
  );
}

function ProjectSourcePickerModal({ onClose, onConfirm }) {
  const [active, setActive] = useState('客户');
  const [selectedCode, setSelectedCode] = useState('');
  const rows = PROJECT_SOURCE_ROWS[active] || [];
  const selected = rows.find(r => r.code === selectedCode) || rows[0];
  return (
    <StandardModal
      title="选择来源主体"
      size="lg"
      onClose={onClose}
      footer={<><Btn onClick={onClose}>取消</Btn><Btn kind="primary" onClick={() => selected && onConfirm(selected)}>确定</Btn></>}
    >
      <div style={{display:'grid',gridTemplateColumns:'170px 1fr',minHeight:420}}>
        <div style={{borderRight:'1px solid var(--aw-border)',padding:8,background:'var(--aw-surface-2)'}}>
          {['客户','合同'].map(t => (
            <div
              key={t}
              className={'aw-tree-row aw-tree-l2' + (active === t ? ' on' : '')}
              onClick={() => { setActive(t); setSelectedCode(''); }}
            >
              <span className="aw-tree-caret">{active === t ? '▾' : ''}</span>
              <TileIcon name={t === '客户' ? 'user' : 'doc'} size={14} />
              <span>{t}列表</span>
            </div>
          ))}
        </div>
        <div style={{minWidth:0,padding:'0 0 0 14px'}}>
          <PurchaseListToolbar searchPlaceholder={`搜索${active}编号、名称、负责人`} hideNew />
          <table className="aw-table">
            <thead>
              <tr>
                <th style={{width:46}}></th>
                <th style={{width:60}}>序号</th>
                <th>{active}编号</th>
                <th>{active === '客户' ? '客户名称' : '合同名称'}</th>
                <th>{active === '客户' ? '项目主题' : '关联客户'}</th>
                <th>负责人</th>
                <th>金额</th>
                <th>日期</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.code} onClick={() => setSelectedCode(r.code)} style={{cursor:'pointer',background:(selectedCode || rows[0]?.code) === r.code ? 'var(--aw-primary-soft)' : undefined}}>
                  <td><input type="radio" checked={(selectedCode || rows[0]?.code) === r.code} onChange={() => setSelectedCode(r.code)} /></td>
                  <td>{i + 1}</td>
                  <td className="aw-link">{r.code}</td>
                  <td>{r.title}</td>
                  <td>{r.subject}</td>
                  <td>{r.owner}</td>
                  <td className="aw-num">{r.amount}</td>
                  <td className="aw-num">{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </StandardModal>
  );
}

function ProjectTree({ picked, setPicked, rows }) {
  const countByKey = (k) => {
    const label = PROJECT_CAT_MAP[k];
    return label ? rows.filter(r => r.category === label).length : rows.length;
  };

  return (
    <div className="aw-doc-tree">
      <div className="aw-doc-tree-h">项目分类 <span className="aw-doc-tree-n">({rows.length})</span></div>
      <div className="aw-doc-tree-list">
        {PROJECT_TREE.map(n => (
          <div key={n.k}>
            <div className={'aw-tree-row aw-tree-l2' + (picked === n.k ? ' on' : '')} onClick={() => setPicked(n.k)}>
              <span className="aw-tree-caret">{n.open ? '▾' : '▸'}</span>
              <TileIcon name="folder" size={14} />
              <span>{n.label}</span>
              <span style={{ marginLeft:'auto', fontSize:11, color:'var(--aw-fg-3)', fontFamily:'var(--aw-font-num)' }}>{countByKey(n.k)}</span>
            </div>
            {n.open && n.kids.map(c => (
              <div key={c.k} className={'aw-tree-row aw-tree-l3' + (picked === c.k ? ' on' : '')} onClick={() => setPicked(c.k)}>
                <TileIcon name="doc" size={13} />
                <span>{c.label}</span>
                <span style={{ marginLeft:'auto', fontSize:11, color:'var(--aw-fg-3)', fontFamily:'var(--aw-font-num)' }}>{countByKey(c.k)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ProgressBar sub-component
// ═══════════════════════════════════════════════════════════════
function ProgressBar({ pct }) {
  const color = pct >= 100 ? 'var(--aw-success)' : pct >= 60 ? 'var(--aw-primary)' : pct >= 30 ? 'var(--aw-warning)' : 'var(--aw-fg-3)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: 'var(--aw-bg)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: pct + '%', height: '100%', background: color, borderRadius: 3, transition: 'width .3s' }} />
      </div>
      <span className="aw-num" style={{ fontSize: 12, color: 'var(--aw-fg-2)', width: 36, textAlign: 'right' }}>{pct}%</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  List View — Toolbar + Table
// ═══════════════════════════════════════════════════════════════
function ProjectListView({ onNew, onView, onEdit, rows = PROJECT_ROWS }) {
  const [drawer, setDrawer] = useState(null);
  const [sel, setSel] = useState({});
  const allChecked = rows.length > 0 && rows.every((_, i) => sel[i]);
  const someChecked = rows.some((_, i) => sel[i]);
  const toggleAll = () => { if (allChecked) setSel({}); else { const n = {}; rows.forEach((_, i) => n[i] = true); setSel(n); } };
  const toggleRow = (i) => setSel(s => ({ ...s, [i]: !s[i] }));

  const cols = [
    { k: 'code',     label: '项目编号',     w: 120 },
    { k: 'name',     label: '项目名称',     w: 200 },
    { k: 'category', label: '项目分类',     w: 100 },
    { k: 'status',   label: '状态',         w: 90 },
    { k: 'priority', label: '优先级',       w: 80 },
    { k: 'owner',    label: '负责人',       w: 90 },
    { k: 'startDate',label: '开始日期',     w: 100 },
    { k: 'planEnd',  label: '计划完成日期', w: 100 },
    { k: 'progress', label: '进度',         w: 120 },
    { k: 'op',       label: '操作',         w: 100 },
  ];

  return (
    <>
      <div className="aw-doc-tb">
        <div className="aw-doc-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8"><circle cx="11" cy="11" r="6" /><path d="M16 16l4 4" /></svg>
          <input placeholder="搜索项目名称 / 编号…" />
        </div>
        <span className="aw-act">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12a9 9 0 0 1 15.5-6.3L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15.5 6.3L3 16" /><path d="M3 21v-5h5" /></svg>刷新数据
        </span>
        <button className="aw-btn" onClick={() => setDrawer('filter')}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 5h18M6 12h12M10 19h4" /></svg>筛选</button>
        <button className="aw-btn" onClick={() => setDrawer('field')}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="7" height="7" /><rect x="14" y="4" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>字段配置</button>
        <button className="aw-btn" onClick={() => setDrawer('export')}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 4v12" /><path d="M7 11l5 5 5-5" /><path d="M4 20h16" /></svg>导出</button>
        <button className="aw-btn" onClick={() => setDrawer('import')}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 20V8" /><path d="M7 13l5-5 5 5" /><path d="M4 4h16" /></svg>导入</button>
        <button className="aw-btn primary" onClick={onNew}>新增项目</button>
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
                <tr key={i} style={{ cursor: 'pointer' }}>
                  <td onClick={e => { e.stopPropagation(); toggleRow(i); }}><span className={'aw-chk' + (sel[i] ? ' on' : '')} /></td>
                  <td className="aw-link aw-num" onClick={() => onView(i)}>{r.code}</td>
                  <td className="aw-link" onClick={() => onView(i)}>{r.name}</td>
                  <td>{r.category}</td>
                  <td><Badge tone={r.stTone === 'gray' ? undefined : r.stTone === 'g' ? 'g' : r.stTone === 'b' ? undefined : 'y'}>{r.status}</Badge></td>
                  <td>
                    <span className={'aw-badge' + (r.pTone === 'r' ? ' r' : r.pTone === 'orange' ? ' y' : r.pTone === 'gray' ? '' : '')} style={r.pTone === 'gray' ? { background: '#F3F4F6', color: '#6B7280' } : (r.pTone === 'orange' ? { background: 'var(--aw-tint-peach)', color: '#B26A24' } : undefined)}>
                      {r.priority}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--aw-primary-soft)', color: 'var(--aw-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, flex: 'none' }}>{r.ownerAv}</div>
                      <span>{r.owner}</span>
                    </div>
                  </td>
                  <td className="aw-num">{r.startDate}</td>
                  <td className="aw-num">{r.planEnd}</td>
                  <td><ProgressBar pct={r.progress} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <span className="aw-link" onClick={(e) => { e.stopPropagation(); onView(i); }}>查看</span>
                      <span className="aw-link" onClick={(e) => { e.stopPropagation(); onEdit && onEdit(i); }}>编辑</span>
                      <span className="aw-link" style={{ fontSize: 12, color: 'var(--aw-fg-3)' }}>▾</span>
                    </div>
                  </td>
                </tr>
              ))}
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
//  New View — aw-doc-form with 3 Cards
// ═══════════════════════════════════════════════════════════════
function ProjectNewView({ onBack }) {
  const [showPersonPicker, setShowPersonPicker] = useState(false);
  const [showSourcePicker, setShowSourcePicker] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedSource, setSelectedSource] = useState(null);
  const [catLevel1, setCatLevel1] = useState('');
  const [catLevel2, setCatLevel2] = useState('');

  // 联动分类树选项
  const catTree = {
    '研发项目': ['内部研发', '合作研发'],
    '工程项目': ['基建工程', '技术改造'],
    '合作项目': ['校企合作', '企业合作'],
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
        {/* Card 1: 基本信息 */}
        <Card title="基本信息">
          <div className="aw-doc-grid">
            <Field label="项目编号">
              <Input defaultValue="自动生成" disabled />
            </Field>
            <Field label="项目名称" req>
              <Input placeholder="请输入项目名称" />
            </Field>
            <Field label="项目分类" req>
              <Select value={catLevel1} onChange={e => { setCatLevel1(e.target.value); setCatLevel2(''); }}>
                <option value="">请选择分类</option>
                {Object.keys(catTree).map(k => <option key={k} value={k}>{k}</option>)}
              </Select>
            </Field>
            {catLevel1 && catTree[catLevel1] && (
              <Field label="二级分类" req>
                <Select value={catLevel2} onChange={e => setCatLevel2(e.target.value)}>
                  <option value="">请选择</option>
                  {catTree[catLevel1].map(k => <option key={k} value={k}>{k}</option>)}
                </Select>
              </Field>
            )}
            <Field label="优先级">
              <div style={{ display: 'flex', alignItems: 'center', paddingTop: 6 }}>
                <Radio on={false} onClick={() => {}}>高</Radio>
                <Radio on={true} onClick={() => {}}>中</Radio>
                <Radio on={false} onClick={() => {}}>低</Radio>
              </div>
            </Field>
            <Field label="负责人" req>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Input placeholder="请选择负责人" value={selectedPerson ? selectedPerson.name : ''} readOnly onClick={() => setShowPersonPicker(true)} style={{ flex: 1, cursor:'pointer' }} />
                <Btn onClick={() => setShowPersonPicker(true)}>选择</Btn>
              </div>
            </Field>
            <Field label="开始日期" req>
              <Input placeholder="请选择" />
            </Field>
            <Field label="计划完成日期" req>
              <Input placeholder="请选择" />
            </Field>
            <Field label="来源主体">
              <ProjectSourceField value={selectedSource} onPick={() => setShowSourcePicker(true)} />
            </Field>
          </div>
        </Card>

        {/* Card 3: 项目详情 */}
        <Card title="项目详情">
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, color: 'var(--aw-fg-2)', display: 'block', marginBottom: 6 }}>项目描述</label>
            <div className="aw-rt-bar">
              <span>B</span><span><i>I</i></span><span><u>U</u></span><span>S</span>
              <i style={{ width: 1, height: 14, background: '#E5E7EB' }} />
              <span>≡</span><span>≣</span><span>·</span><span>1.</span>
              <i style={{ width: 1, height: 14, background: '#E5E7EB' }} />
              <span>🔗</span><span>📷</span><span>📎</span>
            </div>
            <div className="aw-rt-area" contentEditable suppressContentEditableWarning>
              请输入项目描述…
            </div>
          </div>
          <div>
            <label style={{ fontSize: 13, color: 'var(--aw-fg-2)', display: 'block', marginBottom: 6 }}>附件</label>
            <div style={{ border: '1px dashed #D1D5DB', borderRadius: 6, padding: '24px', textAlign: 'center', color: '#6B7280', fontSize: 13 }}>
              <span className="aw-link">点击上传</span> / 拖拽到此区域 &nbsp; <span style={{ color: '#9CA3AF', fontSize: 12 }}>支持 PDF / Word / Excel / 图片，单文件 ≤ 50MB</span>
            </div>
          </div>
        </Card>
      </div>

      {showPersonPicker && (
        <PersonPickerModal
          onClose={() => setShowPersonPicker(false)}
          onConfirm={(persons) => {
            if (persons.length > 0) setSelectedPerson(persons[0]);
            setShowPersonPicker(false);
          }}
        />
      )}
      {showSourcePicker && (
        <ProjectSourcePickerModal
          onClose={() => setShowSourcePicker(false)}
          onConfirm={(source) => {
            setSelectedSource(source);
            setShowSourcePicker(false);
          }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Detail View — project business tabs
// ═══════════════════════════════════════════════════════════════
function ProjectDetailView({ onBack, projectIndex = 0 }) {
  const [tab, setTab] = useState('detail');
  const p = PROJECT_ROWS[projectIndex] || PROJECT_ROWS[0];

  const TABS = [
    { k: 'detail',     label: '项目详情' },
    { k: 'members',    label: '项目成员' },
    { k: 'materials',  label: '物料清单' },
    { k: 'process',    label: '工艺流程' },
    { k: 'quote',      label: '报价信息' },
    { k: 'purchase',   label: '采购信息' },
    { k: 'production', label: '生产信息' },
    { k: 'expense',    label: '关联费用' },
    { k: 'logs',       label: '操作记录' },
  ];

  const renderDetailTab = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 14, columnGap: 32, fontSize: 13 }}>
      <KV k="项目编号"       v={p.code} />
      <KV k="项目名称"       v={p.name} />
      <KV k="项目分类"       v={p.category} />
      <KV k="项目类型"       v="内部" />
      <KV k="项目状态"       v={<Badge tone={p.stTone === 'gray' ? undefined : p.stTone === 'g' ? 'g' : p.stTone === 'b' ? undefined : 'y'}>{p.status}</Badge>} />
      <KV k="优先级"         v={<span className={'aw-badge' + (p.pTone === 'r' ? ' r' : p.pTone === 'orange' ? ' y' : '')} style={p.pTone === 'gray' ? { background: '#F3F4F6', color: '#6B7280' } : (p.pTone === 'orange' ? { background: 'var(--aw-tint-peach)', color: '#B26A24' } : undefined)}>{p.priority}</span>} />
      <KV k="负责人"         v={p.owner} />
      <KV k="所属部门"       v="研发部" />
      <KV k="开始日期"       v={p.startDate} />
      <KV k="计划完成日期"   v={p.planEnd} />
      <KV k="关联客户"       v="海南傲为科技有限公司" />
      <KV k="关联合同"       v="CT-2025-0089" />
      <KV k="合同金额"       v="¥ 850,000.00" />
      <KV k="项目预算"       v="¥ 1,200,000.00" />
      <KV k="项目进度"       v={<ProgressBar pct={p.progress} />} />
    </div>
  );

  const renderBusinessIntro = (items, extra = null) => (
    <div style={{fontSize:13,color:'var(--aw-fg-2)',lineHeight:1.8,marginBottom:14}}>
      {items.map((text, i) => <div key={i}><span style={{color:'var(--aw-primary)',fontWeight:600}}>{i + 1}. </span>{text}</div>)}
      {extra}
    </div>
  );

  const renderMembersTab = () => (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <Btn>新增成员</Btn>
        <Btn kind="danger">移除成员</Btn>
      </div>
      <table className="aw-table">
        <thead>
          <tr>
            <th style={{ width: 40 }}><div className="aw-th-inner"><span className="aw-chk" /></div></th>
            <th>姓名</th>
            <th>角色</th>
            <th>加入时间</th>
          </tr>
        </thead>
        <tbody>
          {PROJECT_MEMBERS.map((m, i) => (
            <tr key={i}>
              <td><span className="aw-chk" /></td>
              <td>{m.name}</td>
              <td>
                <span className={'aw-badge' + (m.role === '负责人' ? '' : m.role === '参与者' ? ' g' : '')} style={m.role === '观察者' ? { background: '#F3F4F6', color: '#6B7280' } : undefined}>
                  {m.role}
                </span>
              </td>
              <td className="aw-num">{m.joinDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderMilestonesTab = () => (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Btn>新增里程碑</Btn>
      </div>
      <table className="aw-table">
        <thead>
          <tr>
            <th>名称</th>
            <th>计划日期</th>
            <th>完成日期</th>
            <th>状态</th>
            <th>负责人</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {PROJECT_MILESTONES.map((m, i) => (
            <tr key={i}>
              <td>{m.name}</td>
              <td className="aw-num">{m.planDate}</td>
              <td className="aw-num">{m.doneDate || '—'}</td>
              <td><Badge tone={m.stTone === 'g' ? 'g' : m.stTone === 'b' ? undefined : 'y'}>{m.status}</Badge></td>
              <td>{m.owner}</td>
              <td><span className="aw-link">编辑</span> <span className="aw-link" style={{ color: 'var(--aw-danger)' }}>删除</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderDocsTab = () => (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {PROJECT_DOCS.map((d, i) => (
          <div key={i} style={{
            width: 'calc(50% - 6px)',
            border: '1px solid var(--aw-border)',
            borderRadius: 6,
            padding: '12px 14px',
            background: '#fff',
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 6,
              background: d.type === 'PDF' ? '#DC2626' : d.type === 'Word' ? '#2563EB' : '#1D6F42',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700, flex: 'none',
            }}>
              {d.type === 'PDF' ? 'PDF' : d.type === 'Word' ? 'DOC' : 'XLS'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
              <div style={{ fontSize: 12, color: 'var(--aw-fg-3)', marginTop: 4 }}>
                <span>{d.uploader}</span> · <span>{d.uploadTime}</span>
              </div>
              <div style={{ marginTop: 6, display: 'flex', gap: 10, fontSize: 12 }}>
                <span className="aw-link">预览</span>
                <span className="aw-link">下载</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMaterialsTab = () => (
    <div>
      {renderBusinessIntro([
        '引用标准库物料清单，可进行编辑；项目内修改只对当前项目生效，不改动标准库物料清单。',
        '引用后可在当前项目下调整物料、用量和备注，保证标准库数据权威性。',
      ], <div className="aw-meta-bar" style={{marginTop:10}}>标准库引用：创建项目物料清单时，可直接一键引用“标准库”的内容。</div>)}
      <table className="aw-table">
        <thead><tr><th>序号</th><th>物料编码</th><th>物料名称</th><th>规格型号</th><th>单位</th><th>项目用量</th><th>来源</th><th>状态</th></tr></thead>
        <tbody>
          {[
            ['1','WL-7820864','半成品物料','规格一','KG','500','标准库引用','项目可编辑'],
            ['2','WL-8518691','铝合金型材','AL-6061','KG','320','标准库引用','项目可编辑'],
            ['3','WL-6081578','外箱包装','PK-500','个','800','项目新增','待确认'],
          ].map(r => <tr key={r[0]}>{r.map((c,i)=><td key={i} className={i === 1 ? 'aw-num' : ''}>{c}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );

  const renderProcessTab = () => (
    <div>
      {renderBusinessIntro([
        '引用标准库工艺流程，可进行编辑；项目内修改只对当前项目生效，不改动标准库工艺流程。',
        '可在项目内调整工序、工时、检验点和责任岗位，用于后续报价、采购和生产。',
      ])}
      <table className="aw-table">
        <thead><tr><th>序号</th><th>工序编码</th><th>工序名称</th><th>标准工时</th><th>责任岗位</th><th>质检节点</th><th>来源</th><th>状态</th></tr></thead>
        <tbody>
          {[
            ['1','GX-001','备料','2h','计划员','来料核对','标准库引用','已确认'],
            ['2','GX-006','机加工','6h','机加工','尺寸首检','标准库引用','项目调整'],
            ['3','GX-012','总装','4h','装配工','FQC','项目新增','待确认'],
          ].map(r => <tr key={r[0]}>{r.map((c,i)=><td key={i}>{c}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );

  const renderQuoteTab = () => (
    <div>
      {renderBusinessIntro([
        '填写报价项目及金额，进行价格预审。',
        '报价信息必须点击确认后，系统才允许启动后续采购和生产流程。',
        '确认报价并开启生产/采购的操作，仅该项目负责人可执行，其他人员仅能查看。',
      ])}
      <table className="aw-table">
        <thead><tr><th>序号</th><th>报价项</th><th>金额</th><th>报价状态</th><th>确认人</th><th>确认时间</th></tr></thead>
        <tbody>
          {[
            ['1','材料成本','¥ 420,000.00','已确认',p.owner,'2026-06-12 10:20'],
            ['2','工艺加工费','¥ 180,000.00','已确认',p.owner,'2026-06-12 10:20'],
            ['3','项目管理费','¥ 60,000.00','待确认','-','-'],
          ].map(r => <tr key={r[0]}>{r.map((c,i)=><td key={i} className={i === 2 ? 'aw-num' : ''}>{c}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );

  const renderPurchaseTab = () => (
    <div>
      {renderBusinessIntro([
        '项目所需物料在采购信息里发起采购，采购来源保留项目和项目明细记录。',
        '采购可基于项目物料清单生成，便于追踪项目成本和采购进度。',
      ])}
      <table className="aw-table">
        <thead><tr><th>序号</th><th>采购单号</th><th>来源物料</th><th>供应商</th><th>采购数量</th><th>采购金额</th><th>状态</th></tr></thead>
        <tbody>
          {[
            ['1','PO-2026-0008','半成品物料','海南傲为','500','¥ 25,000.00','采购中'],
            ['2','PO-2026-0011','铝合金型材','华南铝材','320','¥ 10,240.00','待到货'],
          ].map(r => <tr key={r[0]}>{r.map((c,i)=><td key={i} className={i === 5 ? 'aw-num' : ''}>{c}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );

  const renderProductionTab = () => (
    <div>
      {renderBusinessIntro([
        '报价确认后可发起生产需求，生产信息记录需求、计划、订单和工单的推进状态。',
        '生产数据按项目隔离，便于项目内追踪排产、开工、完工和入库。',
      ])}
      <table className="aw-table">
        <thead><tr><th>序号</th><th>生产单据</th><th>产品/半成品</th><th>计划数量</th><th>已完成</th><th>负责人</th><th>状态</th></tr></thead>
        <tbody>
          {[
            ['1','MR-2026-0012','智能输送线总成','20','0','计划员王敏','待排产'],
            ['2','MO-2026-0026','铝合金外壳','260','120','生产一部','生产中'],
          ].map(r => <tr key={r[0]}>{r.map((c,i)=><td key={i}>{c}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );

  const renderExpenseTab = () => (
    <div>
      {renderBusinessIntro([
        '添加项目其他产生的相关费用，用于项目整体成本核算。',
        '费用可按类别、发生部门和责任人归集，并参与项目利润分析。',
      ])}
      <table className="aw-table">
        <thead><tr><th>序号</th><th>费用类型</th><th>费用说明</th><th>金额</th><th>发生日期</th><th>责任人</th><th>状态</th></tr></thead>
        <tbody>
          {[
            ['1','差旅费','客户现场调研','¥ 8,600.00','2026-06-09','李文涛','已入账'],
            ['2','测试费','样机可靠性测试','¥ 12,000.00','2026-06-14','陈思源','待审核'],
          ].map(r => <tr key={r[0]}>{r.map((c,i)=><td key={i} className={i === 3 ? 'aw-num' : ''}>{c}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );

  const renderApprovalsTab = () => (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {PROJECT_APPROVALS.map((a, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: 20, position: 'relative' }}>
            {/* Timeline dot + line */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 'none', width: 20 }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: a.result === '通过' ? 'var(--aw-success)' : a.result === '待审批' ? 'var(--aw-warning)' : 'var(--aw-fg-3)',
                flex: 'none', marginTop: 4,
              }} />
              {i < PROJECT_APPROVALS.length - 1 && (
                <div style={{ width: 2, flex: 1, background: 'var(--aw-divider)', marginTop: 4 }} />
              )}
            </div>
            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{a.node}</span>
                <Badge tone={a.rTone === 'g' ? 'g' : a.rTone === 'y' ? 'y' : undefined}>{a.result}</Badge>
              </div>
              <div style={{ fontSize: 13, color: 'var(--aw-fg-2)', marginBottom: 2 }}>
                审批人：{a.approver}
                {a.time && <span style={{ color: 'var(--aw-fg-3)', marginLeft: 12 }}>{a.time}</span>}
              </div>
              {a.opinion && (
                <div style={{ fontSize: 13, color: 'var(--aw-fg-1)', background: 'var(--aw-bg)', padding: '8px 12px', borderRadius: 6, marginTop: 6 }}>
                  {a.opinion}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLogsTab = () => (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {PROJECT_LOGS.map((l, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: 18, position: 'relative' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 'none', width: 20 }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: 'var(--aw-primary)',
                flex: 'none', marginTop: 4,
              }} />
              {i < PROJECT_LOGS.length - 1 && (
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
      case 'detail':     return renderDetailTab();
      case 'members':    return renderMembersTab();
      case 'materials':  return renderMaterialsTab();
      case 'process':    return renderProcessTab();
      case 'quote':      return renderQuoteTab();
      case 'purchase':   return renderPurchaseTab();
      case 'production': return renderProductionTab();
      case 'expense':    return renderExpenseTab();
      case 'logs':       return renderLogsTab();
      default:           return null;
    }
  };

  return (
    <div className="aw-doc-form">
      <div className="aw-doc-form-body">
        <DetailHeaderCard
          title={`${p.code} ${p.name}`}
          status={p.status}
          detailItems={[
            ['项目编号', p.code],
            ['项目分类', p.category],
            ['负责人', p.owner],
            ['优先级', p.priority],
            ['开始日期', p.startDate],
            ['计划完成日期', p.planEnd],
            ['进度', `${p.progress}%`],
          ]}
          onBack={onBack}
          creator="老夏"
          createdAt={`${p.startDate} 09:00`}
          modifier={p.owner}
          modifiedAt="2025-05-10 16:30"
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
//  KV helper (reused in detail)
// ═══════════════════════════════════════════════════════════════
function KV({ k, v }) {
  return (
    <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
      <span style={{ color: '#6B7280', width: 100, flex: 'none', fontSize: 13 }}>{k}</span>
      <span style={{ fontSize: 13, color: 'var(--aw-fg-1)' }}>：{v}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ProjectListScreen — Main Entry
// ═══════════════════════════════════════════════════════════════
function ProjectListScreen({ module: mod, initialAction, onActionConsumed }) {
  const m = mod || MODULES.project;
  const [view, setView] = useState('list');
  const [picked, setPicked] = useState('rd');
  const [detailIdx, setDetailIdx] = useState(0);
  const [drawer, setDrawer] = useState(null);

  useEffect(() => {
    if (initialAction === 'new') { setView('new'); onActionConsumed && onActionConsumed(); }
    else if (initialAction === 'list') { setView('list'); onActionConsumed && onActionConsumed(); }
  }, [initialAction]);

  const handleView = (idx) => { setDetailIdx(idx); setView('detail'); };
  const handleEdit = (idx) => { setDetailIdx(idx); /* could navigate to edit mode */ };
  const pickedCategory = PROJECT_CAT_MAP[picked];
  const rows = pickedCategory ? PROJECT_ROWS.filter(r => r.category === pickedCategory) : PROJECT_ROWS;

  return (
    <div className="aw-doc-page">
      {view === 'list' && <ProjectTree picked={picked} setPicked={setPicked} rows={PROJECT_ROWS} />}
      <div className="aw-doc-main">
        {view === 'list'   && <ProjectListView rows={rows} onNew={() => setView('new')} onView={(idx) => handleView(PROJECT_ROWS.indexOf(rows[idx]))} onEdit={(idx) => handleEdit(PROJECT_ROWS.indexOf(rows[idx]))} />}
        {view === 'new'    && <ProjectNewView    onBack={() => setView('list')} />}
        {view === 'detail' && <ProjectDetailView onBack={() => setView('list')} projectIndex={detailIdx} />}
      </div>
    </div>
  );
}

window.ProjectListScreen = ProjectListScreen;
