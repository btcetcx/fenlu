// ui_kits/erp-console/unit-picker.jsx
// 通用单位选择器：分类检索 / 单选 / 自定义单位
const { useMemo: useUnitMemo, useState: useUnitState } = React;

const UNIT_GROUPS = [
  { key:'recent', label:'最近使用', icon:'◉' },
  { key:'all', label:'全部', icon:'▦' },
  { key:'count', label:'计数', icon:'#' },
  { key:'weight', label:'重量', icon:'⚖' },
  { key:'length', label:'长度', icon:'↔' },
  { key:'area', label:'面积', icon:'□' },
  { key:'volume', label:'体积/容量', icon:'◇' },
  { key:'pack', label:'包装', icon:'▣' },
  { key:'time', label:'时间', icon:'◷' },
  { key:'energy', label:'能耗', icon:'⚡' },
  { key:'custom', label:'自定义', icon:'✦' },
];

const UNIT_OPTIONS = [
  { group:'count', code:'tai', name:'台', alias:'台', recent:true },
  { group:'weight', code:'kg', name:'kg', alias:'千克', tag:'公斤', recent:true },
  { group:'count', code:'ge', name:'个', alias:'个', recent:true },
  { group:'pack', code:'xiang', name:'箱', alias:'箱', recent:true },
  { group:'length', code:'m', name:'m', alias:'米', recent:true },
  { group:'weight', code:'g', name:'g', alias:'克' },
  { group:'weight', code:'t', name:'t', alias:'吨' },
  { group:'length', code:'cm', name:'cm', alias:'厘米' },
  { group:'length', code:'mm', name:'mm', alias:'毫米' },
  { group:'area', code:'m2', name:'m²', alias:'平方米' },
  { group:'volume', code:'m3', name:'m³', alias:'立方米' },
  { group:'volume', code:'l', name:'L', alias:'升' },
  { group:'pack', code:'bao', name:'包', alias:'包' },
  { group:'pack', code:'jian', name:'件', alias:'件' },
  { group:'time', code:'h', name:'h', alias:'小时' },
  { group:'time', code:'day', name:'天', alias:'天' },
  { group:'energy', code:'kwh', name:'kWh', alias:'千瓦时' },
  { group:'custom', code:'box24', name:'箱 × 24', alias:'24 罐装箱', custom:true },
  { group:'custom', code:'roll100', name:'卷 × 100m', alias:'100 米/卷', custom:true },
];

function UnitPickerModal({ value, onClose, onConfirm }) {
  const initial = value?.code || value || 'ge';
  const [activeGroup, setActiveGroup] = useUnitState('recent');
  const [keyword, setKeyword] = useUnitState('');
  const [selected, setSelected] = useUnitState(initial);
  const [customName, setCustomName] = useUnitState('');
  const [customAlias, setCustomAlias] = useUnitState('');
  const [managerOpen, setManagerOpen] = useUnitState(false);

  const groupCounts = useUnitMemo(() => {
    const counts = { recent: UNIT_OPTIONS.filter(u => u.recent).length, all: UNIT_OPTIONS.length };
    UNIT_GROUPS.forEach(g => {
      if (!counts[g.key]) counts[g.key] = UNIT_OPTIONS.filter(u => u.group === g.key).length;
    });
    return counts;
  }, []);

  const rows = useUnitMemo(() => {
    const q = keyword.trim().toLowerCase();
    return UNIT_OPTIONS.filter(u => {
      const inGroup = activeGroup === 'all' || (activeGroup === 'recent' ? u.recent : u.group === activeGroup);
      const inSearch = !q || [u.name, u.alias, u.code, u.tag].filter(Boolean).some(v => String(v).toLowerCase().includes(q));
      return inGroup && inSearch;
    });
  }, [activeGroup, keyword]);

  const current = UNIT_OPTIONS.find(u => u.code === selected) || rows[0] || UNIT_OPTIONS[0];
  const confirm = () => {
    const picked = activeGroup === 'custom' && customName.trim()
      ? { code:`custom-${Date.now()}`, name:customName.trim(), alias:customAlias.trim() || customName.trim(), group:'custom', custom:true }
      : current;
    onConfirm && onConfirm(picked);
  };

  return (
    <div className="aw-mask" onClick={onClose}>
      <div className="aw-unit-modal" onClick={e => e.stopPropagation()}>
        <div className="aw-unit-head">
          <div className="aw-unit-search">
            <span className="aw-unit-search-ic">⌕</span>
            <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="搜索单位名称 / 代码 / 别名..." />
            <span className="aw-unit-kbd">⌘ K</span>
          </div>
          <button className="aw-unit-ghost" type="button" title="单位设置" onClick={() => setManagerOpen(true)}>⚙</button>
          <button className="aw-unit-ghost" type="button" onClick={onClose} title="关闭">×</button>
        </div>

        <div className="aw-unit-body">
          <aside className="aw-unit-side">
            {UNIT_GROUPS.map(g => (
              <div key={g.key} className={'aw-unit-nav' + (activeGroup === g.key ? ' on' : '')} onClick={() => setActiveGroup(g.key)}>
                <span className="aw-unit-nav-ic">{g.icon}</span>
                <span className="aw-unit-nav-text">{g.label}</span>
                <span className="aw-unit-nav-count">{groupCounts[g.key] || 0}</span>
              </div>
            ))}
          </aside>

          <main className="aw-unit-main">
            <div className="aw-unit-section-title">
              <span></span>
              <b>{UNIT_GROUPS.find(g => g.key === activeGroup)?.label || '单位'}</b>
              <em>· {rows.length}</em>
            </div>
            <div className="aw-unit-grid">
              {rows.map(unit => (
                <button
                  type="button"
                  key={unit.code}
                  className={'aw-unit-card' + (selected === unit.code ? ' on' : '')}
                  onClick={() => setSelected(unit.code)}
                >
                  <span className="aw-unit-name">{unit.name}</span>
                  {unit.tag && <span className="aw-unit-tag">{unit.tag}</span>}
                  <span className="aw-unit-alias">{unit.alias}</span>
                  {selected === unit.code && <span className="aw-unit-check">✓</span>}
                </button>
              ))}
            </div>
            {activeGroup === 'custom' && (
              <div className="aw-unit-custom">
                <div className="aw-unit-custom-add">＋ 新建自定义单位（如「24 罐装箱」「100 m/卷」）</div>
                <div className="aw-unit-custom-form">
                  <Input value={customName} onChange={e => setCustomName(e.target.value)} placeholder="单位名称，如：箱 × 24" />
                  <Input value={customAlias} onChange={e => setCustomAlias(e.target.value)} placeholder="单位说明，如：24 罐装箱" />
                </div>
              </div>
            )}
            {rows.length === 0 && (
              <div className="aw-empty" style={{marginTop:12}}>暂无匹配单位，可切换分类或新建自定义单位</div>
            )}
          </main>
        </div>

        <div className="aw-unit-foot">
          <div className="aw-unit-picked">
            已选
            <span>{activeGroup === 'custom' && customName.trim() ? customName.trim() : current?.name}</span>
            <b>{activeGroup === 'custom' && customAlias.trim() ? customAlias.trim() : current?.alias}</b>
          </div>
          <div className="aw-unit-actions">
            <Btn onClick={onClose}>取消</Btn>
            <Btn kind="primary" onClick={confirm}>确认</Btn>
          </div>
        </div>
        {managerOpen && <UnitManagerModal onClose={() => setManagerOpen(false)} />}
      </div>
    </div>
  );
}

function UnitManagerModal({ onClose }) {
  const [tab, setTab] = useUnitState('list');
  const listRows = [
    { code:'PCS', symbol:'个', name:'个', alias:'件', category:'计数', rule:'--', enabled:true },
    { code:'SET', symbol:'套', name:'套', alias:'', category:'计数', rule:'--', enabled:true },
    { code:'PR', symbol:'对', name:'对', alias:'副', category:'计数', rule:'1 对 = 2 个', enabled:true },
    { code:'UNT', symbol:'台', name:'台', alias:'', category:'计数', rule:'--', enabled:true },
    { code:'ZHANG', symbol:'张', name:'张', alias:'', category:'计数', rule:'--', enabled:true },
    { code:'PIAN', symbol:'片', name:'片', alias:'', category:'计数', rule:'--', enabled:true },
    { code:'KE', symbol:'颗', name:'颗', alias:'粒', category:'计数', rule:'--', enabled:true },
    { code:'ZHI', symbol:'只', name:'只', alias:'', category:'计数', rule:'--', enabled:true },
    { code:'TAO', symbol:'套', name:'整套', alias:'', category:'计数', rule:'--', enabled:true },
    { code:'BAN', symbol:'板', name:'板', alias:'', category:'计数', rule:'--', enabled:true },
    { code:'GEN', symbol:'根', name:'根', alias:'条', category:'计数', rule:'--', enabled:true },
  ];
  const rules = [
    { from:'箱 箱', to:'个 个', ratio:'× 24', product:'食品/罐装类' },
    { from:'卷 卷', to:'m 米', ratio:'× 100', product:'线材/电缆' },
    { from:'托 托盘', to:'箱 箱', ratio:'× 48', product:'整托发运' },
  ];

  return (
    <div className="aw-mask" onClick={onClose} style={{zIndex:70}}>
      <div className="aw-unit-manage" onClick={e => e.stopPropagation()}>
        <div className="aw-unit-manage-head">
          <span>单位管理</span>
          <button className="aw-unit-ghost" type="button" onClick={onClose}>×</button>
        </div>
        <div className="aw-unit-manage-tabs">
          <button className={tab === 'list' ? 'on' : ''} onClick={() => setTab('list')}>单位列表</button>
          <button className={tab === 'custom' ? 'on' : ''} onClick={() => setTab('custom')}>新建自定义</button>
          <button className={tab === 'rule' ? 'on' : ''} onClick={() => setTab('rule')}>换算规则</button>
          {tab === 'list' && (
            <div className="aw-unit-manage-tools">
              <div className="aw-unit-manage-search">⌕ <input placeholder="搜索单位" /></div>
              <Btn kind="primary">+ 新建</Btn>
            </div>
          )}
        </div>
        <div className="aw-unit-manage-body">
          {tab === 'list' && (
            <table className="aw-unit-manage-table">
              <thead><tr><th>代码</th><th>符号</th><th>名称 / 别名</th><th>类目</th><th>换算说明</th><th>启用</th><th>操作</th></tr></thead>
              <tbody>{listRows.map(row => (
                <tr key={row.code}>
                  <td className="aw-num">{row.code}</td>
                  <td><b>{row.symbol}</b></td>
                  <td>{row.name} {row.alias && <span>({row.alias})</span>}</td>
                  <td>{row.category}</td>
                  <td>{row.rule}</td>
                  <td><span className={'aw-switch' + (row.enabled ? '' : ' off')} /></td>
                  <td><span className="aw-link">编辑</span><span style={{color:'var(--aw-fg-4)',marginLeft:14}}>删除</span></td>
                </tr>
              ))}</tbody>
            </table>
          )}

          {tab === 'custom' && (
            <div className="aw-unit-custom-page">
              <FormGrid>
                <Field label="单位代码" req><Input placeholder="例：CTN24" /></Field>
                <Field label="显示符号" req><Input placeholder="例：箱 × 24" /></Field>
                <Field label="单位名称" req><Input placeholder="例：24 罐装箱" /></Field>
                <Field label="别名"><Input placeholder="例：24-pack" /></Field>
                <Field label="所属类目" req><Select><option>计数</option><option>重量</option><option>长度</option><option>包装</option><option>自定义</option></Select></Field>
                <Field label="基础单位"><Select><option>请选择</option><option>个</option><option>kg</option><option>m</option><option>箱</option></Select></Field>
                <Field label="换算系数"><Input placeholder="例：1 箱 = 24 个 → 填 24" /></Field>
                <Field label="启用状态"><span style={{display:'inline-flex',alignItems:'center',gap:8,height:34}}><span className="aw-switch" />启用</span></Field>
                <Field label="说明"><Input placeholder="选填，便于他人理解" /></Field>
              </FormGrid>
            </div>
          )}

          {tab === 'rule' && (
            <div className="aw-unit-rule-page">
              <p>不同类目内的单位可定义换算系数，便于跨单位计算（如「箱」↔「个」）。</p>
              <table className="aw-unit-manage-table">
                <thead><tr><th>源单位</th><th>目标单位</th><th>换算系数</th><th>关联产品</th><th>操作</th></tr></thead>
                <tbody>{rules.map(row => <tr key={row.from}><td><b>{row.from}</b></td><td><b>{row.to}</b></td><td>{row.ratio}</td><td>{row.product}</td><td><span className="aw-link">编辑</span></td></tr>)}</tbody>
              </table>
              <div className="aw-link" style={{marginTop:14}}>＋ 新增换算规则</div>
            </div>
          )}
        </div>
        <div className="aw-unit-manage-foot">
          <Btn onClick={onClose}>取消</Btn>
          <Btn kind="primary" onClick={onClose}>保存</Btn>
        </div>
      </div>
    </div>
  );
}

function UnitPickerInput({ value, onChange, placeholder = '请选择单位', disabled = false }) {
  const [open, setOpen] = useUnitState(false);
  const [inner, setInner] = useUnitState(value || '');
  const label = value?.name || inner?.name || value || inner || '';
  const choose = (unit) => {
    setInner(unit);
    onChange && onChange(unit);
    setOpen(false);
  };
  return (
    <>
      <div className="aw-unit-input" onClick={() => !disabled && setOpen(true)}>
        <input readOnly disabled={disabled} value={label} placeholder={placeholder} />
        <span>⌕</span>
      </div>
      {open && <UnitPickerModal value={inner || value} onClose={() => setOpen(false)} onConfirm={choose} />}
    </>
  );
}

Object.assign(window, { UnitPickerModal, UnitPickerInput, UnitManagerModal, UNIT_OPTIONS, UNIT_GROUPS });
