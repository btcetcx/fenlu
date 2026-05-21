// ui_kits/erp-console/purchase-list-kit.jsx
// 采购中心列表标准组件：工具条 / 选择列 / 底部分页

function PurchaseListToolbar({ searchPlaceholder, newLabel, onNew, hideNew = false, afterSearch = null }) {
  const [fieldOpen, setFieldOpen] = React.useState(false);
  return (
    <>
      <div className="aw-doc-tb">
        <div className="aw-doc-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8"><circle cx="11" cy="11" r="6" /><path d="M16 16l4 4" /></svg>
          <input placeholder={searchPlaceholder || '全局搜索'} />
        </div>
        {afterSearch && <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>{afterSearch}</div>}
        <RefreshAction />
        <button className="aw-btn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 5h18M6 12h12M10 19h4" /></svg>筛选</button>
        <button className="aw-btn" onClick={() => setFieldOpen(true)}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="7" height="7" /><rect x="14" y="4" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>字段配置</button>
        <button className="aw-btn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 4v12" /><path d="M7 11l5 5 5-5" /><path d="M4 20h16" /></svg>导出</button>
        <button className="aw-btn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 20V8" /><path d="M7 13l5-5 5 5" /><path d="M4 4h16" /></svg>导入</button>
        {!hideNew && <button className="aw-btn primary" onClick={onNew}>{newLabel || '新增'}</button>}
      </div>
      {fieldOpen && <FieldDrawer onClose={() => setFieldOpen(false)} />}
    </>
  );
}

function PurchaseSelectHeader({ checked, indeterminate, onToggle }) {
  return (
    <th style={{ width: 40 }}>
      <div className="aw-th-inner">
        <span className={'aw-chk' + (checked ? ' on' : indeterminate ? ' indet' : '')} onClick={onToggle} />
      </div>
    </th>
  );
}

function PurchaseSelectCell({ checked, onToggle }) {
  return (
    <td onClick={e => { e.stopPropagation(); onToggle && onToggle(); }}>
      <span className={'aw-chk' + (checked ? ' on' : '')} />
    </td>
  );
}

function PurchaseIndexHeader() {
  return <th style={{ width: 60 }}><div className="aw-th-inner">序号</div></th>;
}

function PurchaseStatusFilterHeader({ label = '状态', value, onChange, options = [], width = 120 }) {
  return (
    <th style={{ width }}>
      <div className="aw-th-inner" style={{ gap: 8 }}>
        <span>{label}</span>
        <select
          value={value || ''}
          onChange={e => onChange && onChange(e.target.value)}
          onClick={e => e.stopPropagation()}
          style={{
            minWidth: 74,
            height: 24,
            border: '1px solid var(--aw-border)',
            borderRadius: 4,
            background: '#fff',
            color: 'var(--aw-fg-2)',
            font: 'inherit',
            fontSize: 12,
          }}
        >
          <option value="">全部</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
    </th>
  );
}

function PurchaseListFooter({ total, selectedCount, allChecked, someChecked, onToggleAll, pages = 3, bulkActions = null }) {
  return (
    <div className="aw-doc-footer">
      <div className="aw-doc-footer-l">
        <span className={'aw-chk' + (allChecked ? ' on' : someChecked ? ' indet' : '')} onClick={onToggleAll} />
        <span>已选 {selectedCount} / {total} 项</span>
        <button className="aw-btn" style={{ fontSize: 12, padding: '4px 10px' }}>批量操作</button>
        {bulkActions}
      </div>
      <div className="aw-doc-footer-r">
        <span>共 {total} 条</span>
        <Select style={{ width: 'auto', padding: '4px 6px', background: '#fff', border: '1px solid var(--aw-border-strong)' }}>
          <option>10条/页</option>
          <option>20条/页</option>
          <option>50条/页</option>
        </Select>
        {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
          <span key={n} className={'aw-pg' + (n === 1 ? ' on' : '')}>{n}</span>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, {
  PurchaseListToolbar,
  PurchaseSelectHeader,
  PurchaseSelectCell,
  PurchaseIndexHeader,
  PurchaseStatusFilterHeader,
  PurchaseListFooter,
});
