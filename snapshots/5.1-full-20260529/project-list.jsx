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
function ProjectListView({ onNew, onView, rows = PROJECT_ROWS }) {
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
        <RefreshAction />
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
    '研发项目': ['内部研发', '产品研发'],
    '工程项目': ['系统改造', '自动化工程'],
    '合作项目': ['校企合作', '联合创新'],
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
  const [hasProjectBom, setHasProjectBom] = useState(false);
  const [projectBomLocked, setProjectBomLocked] = useState(false);
  const [hasProjectProcess, setHasProjectProcess] = useState(false);
  const [projectProcessLocked, setProjectProcessLocked] = useState(false);
  const [quoteItems, setQuoteItems] = useState([]);
  const [quoteConfirmed, setQuoteConfirmed] = useState(false);
  const [quoteAdjustAmount, setQuoteAdjustAmount] = useState(-12000);
  const [hasProjectPurchase, setHasProjectPurchase] = useState(false);
  const [hasProjectProduction, setHasProjectProduction] = useState(false);
  const [projectCostItems, setProjectCostItems] = useState([
    ['差旅费', '客户现场调研', '¥ 8,600.00', '2026-06-09', '李文涛', '已入账'],
    ['测试费', '样机可靠性测试', '¥ 12,000.00', '2026-06-14', '陈思源', '待审核'],
  ]);
  const [projectModal, setProjectModal] = useState(null);
  const p = PROJECT_ROWS[projectIndex] || PROJECT_ROWS[0];
  const isProjectCompleted = p.status === '已完成';

  const TABS = [
    { k: 'detail',     label: '项目详情' },
    { k: 'members',    label: '项目成员' },
    { k: 'materials',  label: '物料清单' },
    { k: 'process',    label: '工艺流程' },
    { k: 'quote',      label: '报价信息' },
    { k: 'purchase',   label: '采购信息' },
    { k: 'production', label: '生产信息' },
    { k: 'expense',    label: '项目成本' },
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

  const renderEmptyState = ({ title, desc, actions }) => (
    <div style={{textAlign:'center',padding:'54px 24px',border:'1px dashed var(--aw-border-strong)',borderRadius:6,background:'#fff'}}>
      <div style={{fontSize:16,fontWeight:700,color:'var(--aw-fg-1)',marginBottom:10}}>{title}</div>
      <div style={{fontSize:13,color:'var(--aw-fg-3)',marginBottom:18}}>{desc}</div>
      <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
        {actions.map(action => action.disabled ? (
          <button key={action.label} className="aw-btn" disabled style={{opacity:.55,cursor:'not-allowed'}}>{action.label}</button>
        ) : (
          <Btn key={action.label} kind={action.kind} onClick={action.onClick}>{action.label}</Btn>
        ))}
      </div>
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
      {!hasProjectBom ? renderEmptyState({
        title:'BOM 清单还是空的',
        desc:'可以引用已有 BOM，也可以新增项目物料清单，或从 Excel 导入后再逐项修正。',
        actions:[
          { label:'引用BOM', kind:'primary', onClick:()=>setProjectModal('bomRef') },
          { label:'添加BOM', onClick:()=>setProjectModal('bomAdd') },
          { label:'导入Excel', onClick:()=>setProjectModal('bomImport') },
        ],
      }) : (
        <>
          <div style={{display:'flex',gap:8,marginBottom:12,alignItems:'center'}}>
            <Btn onClick={()=>setProjectModal('bomRef')}>引用BOM</Btn>
            <Btn onClick={()=>setProjectModal('bomAdd')}>添加BOM</Btn>
            <Btn onClick={()=>setProjectModal('bomImport')}>导入Excel</Btn>
            <Btn kind={projectBomLocked ? 'secondary' : 'primary'} onClick={()=>setProjectBomLocked(true)}>{projectBomLocked ? '已锁定' : '锁定BOM'}</Btn>
            {projectBomLocked && <span style={{fontSize:12,color:'var(--aw-fg-3)'}}>锁定后作为当前项目采购、报价和生产的版本基准。</span>}
          </div>
          <table className="aw-table">
            <thead><tr><th>序号</th><th>层级</th><th>物料编码</th><th>物料名称</th><th>规格型号</th><th>单位</th><th>项目用量</th><th>损耗率</th><th>来源</th><th>状态</th></tr></thead>
            <tbody>
              {[
                ['1','1','WL-7820864','半成品物料','规格一','KG','500','2%','标准BOM引用',projectBomLocked ? '已锁定' : '可调整'],
                ['2','1.1','WL-8518691','铝合金型材','AL-6061','KG','320','3%','标准BOM引用',projectBomLocked ? '已锁定' : '可调整'],
                ['3','1.2','WL-6081578','外箱包装','PK-500','个','800','0%','项目新增',projectBomLocked ? '已锁定' : '可调整'],
              ].map(r => <tr key={r[0]}>{r.map((c,i)=><td key={i} className={i === 2 ? 'aw-num' : ''}>{c}</td>)}</tr>)}
            </tbody>
          </table>
        </>
      )}
    </div>
  );

  const renderProcessTab = () => (
    <div>
      {!hasProjectProcess ? renderEmptyState({
        title:'工艺流程还是空的',
        desc:'可以选择标准工艺流程，也可以新增项目专属工艺流程。',
        actions:[
          { label:'选择工艺流程', kind:'primary', onClick:()=>setProjectModal('processRef') },
          { label:'添加工艺流程', onClick:()=>setProjectModal('processAdd') },
        ],
      }) : (
        <>
          <div style={{display:'flex',gap:8,marginBottom:12,alignItems:'center'}}>
            <Btn onClick={()=>setProjectModal('processAdd')}>添加工艺流程</Btn>
            <Btn kind={projectProcessLocked ? 'secondary' : 'primary'} onClick={()=>setProjectProcessLocked(true)}>{projectProcessLocked ? '已锁定' : '锁定工艺'}</Btn>
            {projectProcessLocked && <span style={{fontSize:12,color:'var(--aw-fg-3)'}}>锁定后作为当前项目报价和生产的工艺基准。</span>}
          </div>
          <table className="aw-table">
            <thead><tr><th>序号</th><th>工艺编号</th><th>工艺名称</th><th>版本</th><th>来源</th><th>状态</th></tr></thead>
            <tbody>
              {[
                ['1','CRAFT-2026-0012','智能输送线总装工艺','V1.0','项目工艺', projectProcessLocked ? '已锁定' : '编辑'],
              ].map(r => <tr key={r[0]}>{r.map((c,i)=><td key={i}>{c}</td>)}</tr>)}
            </tbody>
          </table>
        </>
      )}
    </div>
  );

  const renderQuoteTab = () => (
    <div>
      {(() => {
        const rows = [
          ...(hasProjectBom ? [['BOM成本','由项目 BOM 物料清单汇总生成','¥ 420,000.00']] : []),
          ...(hasProjectProcess ? [['工艺成本','由项目工艺流程工时与加工费汇总生成','¥ 180,000.00']] : []),
          ...quoteItems,
        ];
        const baseAmount = rows.reduce((sum, r) => sum + Number(String(r[2]).replace(/[^\d.]/g, '') || 0), 0);
        const adjustAmount = Number(quoteAdjustAmount) || 0;
        const actualAmount = Math.max(baseAmount + adjustAmount, 0);
        const money = n => `¥ ${n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        if (!rows.length) return renderEmptyState({
          title:'报价信息还是空的',
          desc:'添加 BOM 和工艺后会自动形成对应成本，也可以手动新增成本项。',
          actions:[{ label:'新增成本项', kind:'primary', onClick:()=>setProjectModal('quoteAdd') }],
        });
        return (
          <>
            <div style={{display:'flex',gap:8,marginBottom:12}}>
              <Btn kind="primary" onClick={()=>setProjectModal('quoteAdd')}>新增成本项</Btn>
              <Btn kind={quoteConfirmed ? 'secondary' : 'primary'} onClick={()=>setQuoteConfirmed(true)}>{quoteConfirmed ? '已锁定报价' : '锁定报价'}</Btn>
            </div>
            <table className="aw-table">
              <thead><tr><th>序号</th><th>成本项</th><th>来源说明</th><th>金额</th><th>状态</th></tr></thead>
              <tbody>{rows.map((r,i)=><tr key={`${r[0]}-${i}`}><td>{i + 1}</td><td>{r[0]}</td><td>{r[1]}</td><td className="aw-num">{r[2]}</td><td>{i < 2 ? '系统生成' : '手动新增'}</td></tr>)}</tbody>
            </table>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3, minmax(160px, 1fr))',gap:12,marginTop:12}}>
              <div style={{border:'1px solid var(--aw-border)',borderRadius:6,padding:'12px 14px',background:'#fff'}}>
                <div style={{fontSize:12,color:'var(--aw-fg-3)',marginBottom:6}}>当前报价金额</div>
                <div className="aw-num" style={{fontSize:18,fontWeight:700,color:'var(--aw-fg-1)'}}>{money(baseAmount)}</div>
              </div>
              <div style={{border:'1px solid var(--aw-border)',borderRadius:6,padding:'12px 14px',background:'#fff'}}>
                <div style={{fontSize:12,color:'var(--aw-fg-3)',marginBottom:6}}>调整金额</div>
                <input
                  className="aw-input aw-num"
                  type="text"
                  inputMode="decimal"
                  value={quoteAdjustAmount}
                  disabled={quoteConfirmed}
                  onChange={e => setQuoteAdjustAmount(e.target.value)}
                  style={{fontSize:18,fontWeight:700,height:32,padding:'4px 8px',maxWidth:180}}
                />
              </div>
              {[
                ['实际报价金额', money(actualAmount)],
              ].map(([label, value]) => (
                <div key={label} style={{border:'1px solid var(--aw-border)',borderRadius:6,padding:'12px 14px',background:'#fff'}}>
                  <div style={{fontSize:12,color:'var(--aw-fg-3)',marginBottom:6}}>{label}</div>
                  <div className="aw-num" style={{fontSize:18,fontWeight:700,color:label === '实际报价金额' ? 'var(--aw-primary)' : 'var(--aw-fg-1)'}}>{value}</div>
                </div>
              ))}
            </div>
          </>
        );
      })()}
    </div>
  );

  const renderPurchaseTab = () => (
    <div>
      {!hasProjectPurchase ? renderEmptyState({
        title:'采购信息还是空的',
        desc:'报价确认后，可从项目物料清单发起采购，并在这里追踪采购进度。',
        actions:[{
          label:'发起采购',
          kind: quoteConfirmed ? 'primary' : undefined,
          disabled: !quoteConfirmed,
          onClick:()=> quoteConfirmed && setHasProjectPurchase(true),
        }],
      }) : (
        <table className="aw-table">
          <thead><tr><th>序号</th><th>采购单号</th><th>来源</th><th>采购金额</th><th>状态</th><th>进度</th></tr></thead>
          <tbody><tr><td>1</td><td>PO-2026-PRJ-001</td><td>项目物料清单</td><td className="aw-num">¥ 420,000.00</td><td>待审核</td><td>已发起</td></tr></tbody>
        </table>
      )}
      {!quoteConfirmed && <div style={{fontSize:12,color:'var(--aw-fg-3)',marginTop:10}}>锁定报价后才可以发起采购。</div>}
    </div>
  );

  const renderProductionTab = () => (
    <div>
      {!hasProjectProduction ? renderEmptyState({
        title:'生产信息还是空的',
        desc:'报价确认后，可发起生产需求，并在这里追踪计划、订单、工单和完工进度。',
        actions:[{
          label:'下单生产需求',
          kind: quoteConfirmed ? 'primary' : undefined,
          disabled: !quoteConfirmed,
          onClick:()=> quoteConfirmed && setHasProjectProduction(true),
        }],
      }) : (
        <table className="aw-table">
          <thead><tr><th>序号</th><th>生产需求号</th><th>来源</th><th>需求数量</th><th>状态</th><th>进度</th></tr></thead>
          <tbody><tr><td>1</td><td>MRP-2026-PRJ-001</td><td>项目报价确认</td><td className="aw-num">1 套</td><td>待排产</td><td>已下单</td></tr></tbody>
        </table>
      )}
      {!quoteConfirmed && <div style={{fontSize:12,color:'var(--aw-fg-3)',marginTop:10}}>锁定报价后才可以下单生产需求。</div>}
    </div>
  );

  const renderExpenseTab = () => (
    <div>
      {renderBusinessIntro([
        '记录项目BOM、工艺之外产生的成本项目，用于项目整体成本核算。',
        '成本可按类别、发生日期和责任人归集，并参与项目利润分析。',
      ])}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,marginBottom:12}}>
        <div style={{fontSize:12,color:'var(--aw-fg-3)'}}>
          {isProjectCompleted ? '项目已完成，不可新增成本项目。' : '可补充差旅、测试、外协等项目执行成本。'}
        </div>
        {isProjectCompleted ? (
          <button className="aw-btn" disabled style={{opacity:.55,cursor:'not-allowed'}}>新增成本项目</button>
        ) : (
          <Btn kind="primary" onClick={() => setProjectModal('projectCostAdd')}>新增成本项目</Btn>
        )}
      </div>
      <table className="aw-table">
        <thead><tr><th>序号</th><th>成本类型</th><th>成本说明</th><th>金额</th><th>发生日期</th><th>责任人</th><th>状态</th></tr></thead>
        <tbody>
          {projectCostItems.map((r, idx) => (
            <tr key={`${r[0]}-${idx}`}>
              <td>{idx + 1}</td>
              {r.map((c,i)=><td key={i} className={i === 2 ? 'aw-num' : ''}>{c}</td>)}
            </tr>
          ))}
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

  const closeProjectModal = () => setProjectModal(null);
  const renderProjectModal = () => {
    if (!projectModal) return null;
    if (projectModal === 'bomRef') {
      const bomRows = [
        ['BOM-STD-001','标准输送线BOM','智能输送线系统','成品BOM','V3.2','已发布'],
        ['BOM-STD-002','半成品模组BOM','半成品模组','半成品BOM','V2.1','已发布'],
        ['BOM-STD-003','工程试制BOM','新品试制','工程BOM','V0.9','待审核'],
      ];
      return (
        <StandardModal title="引用BOM" size="lg" onClose={closeProjectModal}
          footer={<><Btn onClick={closeProjectModal}>取消</Btn><Btn kind="primary" onClick={() => { setHasProjectBom(true); setProjectBomLocked(false); closeProjectModal(); }}>引用</Btn></>}>
          <div style={{display:'grid',gridTemplateColumns:'170px 1fr',minHeight:420}}>
            <div style={{borderRight:'1px solid var(--aw-border)',padding:8,background:'var(--aw-surface-2)'}}>
              {['全部BOM','成品BOM','半成品BOM','工程BOM','虚拟BOM'].map((name,i)=><div key={name} className={'aw-tree-row aw-tree-l2' + (i===0 ? ' on' : '')}><span className="aw-tree-caret">{i===0 ? '▾' : ''}</span><TileIcon name={i===0?'folder':'doc'} size={14}/><span>{name}</span></div>)}
            </div>
            <div style={{minWidth:0,padding:'0 0 0 14px'}}>
              <PurchaseListToolbar searchPlaceholder="搜索BOM编号、BOM名称、适用产品" hideNew />
              <table className="aw-table">
                <thead><tr><th style={{width:46}}></th><th>BOM编号</th><th>BOM名称</th><th>适用产品</th><th>分类</th><th>版本</th><th>状态</th></tr></thead>
                <tbody>{bomRows.map((r,i)=><tr key={r[0]} style={{background:i===0?'var(--aw-primary-soft)':undefined}}><td><input type="radio" checked={i===0} readOnly /></td>{r.map((c,ci)=><td key={ci}>{c}</td>)}</tr>)}</tbody>
              </table>
            </div>
          </div>
        </StandardModal>
      );
    }
    if (projectModal === 'bomAdd') {
      return (
        <StandardModal title="新增BOM" size="lg" onClose={closeProjectModal}
          footer={<><Btn onClick={closeProjectModal}>取消</Btn><Btn kind="primary" onClick={() => { setHasProjectBom(true); setProjectBomLocked(false); closeProjectModal(); }}>保存BOM</Btn></>}>
          <PurchaseSection title="BOM基础信息">
            <FormGrid columns={3}>
              <Field label="BOM名称" req><Input defaultValue="智能输送线项目BOM" /></Field>
              <Field label="适用产品" req><Input defaultValue="智能输送线系统" /></Field>
              <Field label="版本号"><Input defaultValue="V1.0" /></Field>
              <Field label="BOM分类"><Select defaultValue="项目BOM"><option>项目BOM</option><option>成品BOM</option><option>工程BOM</option></Select></Field>
              <Field label="来源"><Input value="项目新增" readOnly /></Field>
              <Field label="锁定状态"><Input value="未锁定" readOnly /></Field>
            </FormGrid>
          </PurchaseSection>
          <PurchaseSection title="BOM明细">
            <table className="aw-table">
              <thead><tr><th>序号</th><th>层级</th><th>物料编码</th><th>物料名称</th><th>规格型号</th><th>单位</th><th>用量</th><th>损耗率</th><th>操作</th></tr></thead>
              <tbody>
                {[
                  ['1','1','WL-7820864','半成品物料','规格一','KG','500','2%'],
                  ['2','1.1','WL-8518691','铝合金型材','AL-6061','KG','320','3%'],
                ].map(r=><tr key={r[0]}>{r.map((c,i)=><td key={i}>{c}</td>)}<td><span className="aw-link">调整</span></td></tr>)}
                <tr><td colSpan={9}><span className="aw-link">+ 添加子件</span></td></tr>
              </tbody>
            </table>
          </PurchaseSection>
        </StandardModal>
      );
    }
    if (projectModal === 'bomImport') {
      return (
        <StandardModal title="导入Excel" size="sm" onClose={closeProjectModal}
          footer={<><Btn onClick={closeProjectModal}>取消</Btn><Btn kind="primary" onClick={() => { setHasProjectBom(true); closeProjectModal(); }}>开始导入</Btn></>}>
          <div style={{border:'1px dashed var(--aw-border-strong)',borderRadius:6,padding:'34px 16px',textAlign:'center',color:'var(--aw-fg-3)'}}>
            <div style={{fontSize:14,color:'var(--aw-fg-1)',fontWeight:600,marginBottom:8}}>上传项目 BOM Excel</div>
            <div>支持 .xlsx / .xls，导入后可在项目内逐项修正。</div>
          </div>
        </StandardModal>
      );
    }
    if (projectModal === 'processRef') {
      return (
        <StandardModal title="选择工艺流程" size="lg" onClose={closeProjectModal}
          footer={<><Btn onClick={closeProjectModal}>取消</Btn><Btn kind="primary" onClick={() => { setHasProjectProcess(true); closeProjectModal(); }}>确定</Btn></>}>
          <table className="aw-table">
            <thead><tr><th style={{width:46}}></th><th>工艺编号</th><th>工艺名称</th><th>适用产品</th><th>版本</th><th>状态</th></tr></thead>
            <tbody>
              {[
                ['CRAFT-STD-001','标准总装工艺','智能输送线系统','V1.8','已发布'],
                ['CRAFT-STD-002','机加工工艺','铝合金外壳','V2.0','已发布'],
              ].map((r,i)=><tr key={r[0]} style={{background:i===0?'var(--aw-primary-soft)':undefined}}><td><input type="radio" checked={i===0} readOnly /></td>{r.map((c,ci)=><td key={ci}>{c}</td>)}</tr>)}
            </tbody>
          </table>
        </StandardModal>
      );
    }
    if (projectModal === 'processAdd') {
      return (
        <StandardModal title="添加工艺流程" size="md" onClose={closeProjectModal}
          footer={<><Btn onClick={closeProjectModal}>取消</Btn><Btn kind="primary" onClick={() => { setHasProjectProcess(true); closeProjectModal(); }}>保存</Btn></>}>
          <FormGrid columns={2}>
            <Field label="工艺名称" req><Input defaultValue="智能输送线总装工艺" /></Field>
            <Field label="适用产品" req><Input defaultValue="智能输送线系统" /></Field>
            <Field label="版本号"><Input defaultValue="V1.0" /></Field>
            <Field label="来源"><Input value="项目新增" readOnly /></Field>
          </FormGrid>
        </StandardModal>
      );
    }
    if (projectModal === 'quoteAdd') {
      return (
        <StandardModal title="新增成本项" size="sm" onClose={closeProjectModal}
          footer={<><Btn onClick={closeProjectModal}>取消</Btn><Btn kind="primary" onClick={() => { setQuoteItems(items => [...items, ['项目管理费','手动录入的项目成本项','¥ 60,000.00']]); closeProjectModal(); }}>保存</Btn></>}>
          <FormGrid columns={1}>
            <Field label="成本项" req><Input defaultValue="项目管理费" /></Field>
            <Field label="金额" req><Input defaultValue="¥ 60,000.00" /></Field>
            <Field label="说明"><Input defaultValue="手动录入的项目成本项" /></Field>
          </FormGrid>
        </StandardModal>
      );
    }
    if (projectModal === 'projectCostAdd') {
      return (
        <StandardModal title="新增成本项目" size="sm" onClose={closeProjectModal}
          footer={<><Btn onClick={closeProjectModal}>取消</Btn><Btn kind="primary" onClick={() => { if (!isProjectCompleted) setProjectCostItems(items => [...items, ['外协费','项目执行过程中的外协加工费用','¥ 3,000.00','2026-06-20',p.owner,'待审核']]); closeProjectModal(); }}>保存</Btn></>}>
          <FormGrid columns={1}>
            <Field label="成本类型" req><Input defaultValue="外协费" /></Field>
            <Field label="金额" req><Input defaultValue="¥ 3,000.00" /></Field>
            <Field label="发生日期"><Input defaultValue="2026-06-20" /></Field>
            <Field label="责任人"><Input defaultValue={p.owner} /></Field>
            <Field label="成本说明"><Input defaultValue="项目执行过程中的外协加工费用" /></Field>
          </FormGrid>
        </StandardModal>
      );
    }
    return null;
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
        {renderProjectModal()}
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
  const pickedCategory = PROJECT_CAT_MAP[picked];
  const rows = pickedCategory ? PROJECT_ROWS.filter(r => r.category === pickedCategory) : PROJECT_ROWS;

  return (
    <div className="aw-doc-page">
      {view === 'list' && <ProjectTree picked={picked} setPicked={setPicked} rows={PROJECT_ROWS} />}
      <div className="aw-doc-main">
        {view === 'list'   && <ProjectListView rows={rows} onNew={() => setView('new')} onView={(idx) => handleView(PROJECT_ROWS.indexOf(rows[idx]))} />}
        {view === 'new'    && <ProjectNewView    onBack={() => setView('list')} />}
        {view === 'detail' && <ProjectDetailView onBack={() => setView('list')} projectIndex={detailIdx} />}
      </div>
    </div>
  );
}

window.ProjectListScreen = ProjectListScreen;
