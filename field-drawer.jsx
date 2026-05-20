// Session: 260515-sunny-fjord
// field-drawer.jsx — Drawer + FieldDrawer

const { useState, useEffect } = React;

// ── Inject slideIn keyframes once ──────────────────────────
let _drawerStylesInjected = false;
function ensureDrawerStyles() {
  if (_drawerStylesInjected) return;
  _drawerStylesInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes awDrawerSlideIn {
      from { transform: translateX(100%); }
      to   { transform: translateX(0); }
    }
  `;
  document.head.appendChild(style);
}

// ══════════════════════════════════════════════════════════════
//  Drawer — reusable slide-in panel
// ══════════════════════════════════════════════════════════════
function Drawer({ title, subtitle, onClose, children, footer, onReset }) {
  useEffect(() => { ensureDrawerStyles(); }, []);

  return (
    <>
      {/* Mask */}
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(16,24,40,.3)', zIndex: 40
      }} onClick={onClose} />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, height: '100vh', width: 380,
        background: '#fff', boxShadow: '-4px 0 24px rgba(16,24,40,.1)',
        display: 'flex', flexDirection: 'column', zIndex: 41,
        animation: 'awDrawerSlideIn .22s ease-out'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #F0F1F4',
          flexShrink: 0, display: 'flex', alignItems: 'center'
        }}>
          <div style={{
            width: 4, height: 4, background: 'var(--aw-primary)', flexShrink: 0
          }} />
          <span style={{ fontSize: 15, fontWeight: 600, marginLeft: 8, flex: 1 }}>
            {title}
          </span>
          <span style={{ cursor: 'pointer', color: '#9CA3AF', fontSize: 16 }}
            onClick={onClose}>✕</span>
        </div>

        {/* Subtitle */}
        {subtitle && (
          <div style={{
            fontSize: 12, color: '#6B7280', marginTop: 2, marginLeft: 12,
            padding: '0 20px 0 0', flexShrink: 0
          }}>
            {subtitle}
          </div>
        )}

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{
            padding: '12px 20px', borderTop: '1px solid #F0F1F4',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {/* Refresh SVG */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"
                strokeLinejoin="round">
                <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
              <span className="aw-link" style={{ fontSize: 13 }}
                onClick={onReset}>重置</span>
            </div>
            <button className="aw-btn primary">{footer}</button>
          </div>
        )}
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════
//  FieldDrawer — field visibility & ordering config
// ══════════════════════════════════════════════════════════════
function FieldDrawer({ onClose }) {
  const [fields, setFields] = useState([
    { name: '文档编码', checked: true,  disabled: true,  pinned: true  },
    { name: '文档名称', checked: true,  disabled: true,  pinned: false },
    { name: '文档类型', checked: true,  disabled: false, pinned: false },
    { name: '版本号',   checked: true,  disabled: false, pinned: false },
    { name: '状态',     checked: true,  disabled: false, pinned: false },
    { name: '编制人',   checked: true,  disabled: false, pinned: false },
    { name: '更新日期', checked: true,  disabled: false, pinned: false },
    { name: '生效日期', checked: true,  disabled: false, pinned: false },
    { name: '失效日期', checked: false, disabled: false, pinned: false },
    { name: '所属分类', checked: false, disabled: false, pinned: false },
    { name: '审批状态', checked: false, disabled: false, pinned: false },
    { name: '备注',     checked: false, disabled: false, pinned: false },
  ]);

  const checkedCount = fields.filter(f => f.checked).length;
  const total = fields.length;
  const editableFields = fields.filter(f => !f.disabled);
  const allChecked = editableFields.every(f => f.checked);
  const allUnchecked = editableFields.every(f => !f.checked);

  const toggleField = (idx) => {
    const f = fields[idx];
    if (f.disabled) return;
    const next = [...fields];
    next[idx] = { ...f, checked: !f.checked };
    setFields(next);
  };

  const togglePin = (idx) => {
    const f = fields[idx];
    if (f.disabled && f.name === '文档编码') return; // 文档编码必须固定
    const next = [...fields];
    next[idx] = { ...f, pinned: !f.pinned };
    setFields(next);
  };

  const selectAll = () => {
    setFields(fields.map(f =>
      f.disabled ? f : { ...f, checked: true }
    ));
  };

  const clearAll = () => {
    setFields(fields.map(f =>
      f.disabled ? f : { ...f, checked: false }
    ));
  };

  const reset = () => {
    setFields([
      { name: '文档编码', checked: true,  disabled: true,  pinned: true  },
      { name: '文档名称', checked: true,  disabled: true,  pinned: false },
      { name: '文档类型', checked: true,  disabled: false, pinned: false },
      { name: '版本号',   checked: true,  disabled: false, pinned: false },
      { name: '状态',     checked: true,  disabled: false, pinned: false },
      { name: '编制人',   checked: true,  disabled: false, pinned: false },
      { name: '更新日期', checked: true,  disabled: false, pinned: false },
      { name: '生效日期', checked: true,  disabled: false, pinned: false },
      { name: '失效日期', checked: false, disabled: false, pinned: false },
      { name: '所属分类', checked: false, disabled: false, pinned: false },
      { name: '审批状态', checked: false, disabled: false, pinned: false },
      { name: '备注',     checked: false, disabled: false, pinned: false },
    ]);
  };

  // ── Inline SVG icons ──────────────────────────────
  const DragIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="#D1D5DB"
      style={{ cursor: 'grab', flex: 'none' }}>
      <circle cx="9" cy="5"  r="1.5" />
      <circle cx="15" cy="5"  r="1.5" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="19" r="1.5" />
      <circle cx="15" cy="19" r="1.5" />
    </svg>
  );

  const PinIcon = ({ pinned }) => (
    <svg width="16" height="16" viewBox="0 0 24 24"
      fill={pinned ? '#5677FC' : '#D1D5DB'}
      style={{ cursor: 'pointer', flex: 'none' }}>
      <path d="M16 4V2H8v2H4v2h3l2 8-4 4v2h14v-2l-4-4 2-8h3V4h-4zM12 18l-1-2h2l-1 2z" />
    </svg>
  );

  return (
    <Drawer
      title="字段"
      subtitle="自定义列表显示的字段和顺序"
      onClose={onClose}
      footer="应用"
      onReset={reset}
    >
      {/* Stats bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        marginBottom: 6, fontSize: 12, color: '#6B7280'
      }}>
        <span>已显示 {checkedCount} / {total} 个字段</span>
        <span>
          {allChecked
            ? <span className="aw-link" onClick={clearAll}>清空</span>
            : <span className="aw-link" onClick={selectAll}>全选</span>
          }
        </span>
      </div>

      {/* Hint */}
      <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 12 }}>
        拖动图标可调整字段顺序，点击可固定列在左侧
      </div>

      {/* Field list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {fields.map((f, i) => (
          <div key={f.name}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 10px', borderRadius: 6,
              cursor: f.disabled ? 'not-allowed' : 'default',
              opacity: f.disabled ? 0.5 : 1,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#F5F6FA';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '';
            }}
          >
            {/* Drag handle */}
            <DragIcon />

            {/* Checkbox */}
            <span
              className={'aw-chk' + (f.checked ? ' on' : '')}
              onClick={() => toggleField(i)}
              style={{ cursor: f.disabled ? 'not-allowed' : 'pointer' }}
            />

            {/* Field name */}
            <span style={{ fontSize: 13, flex: 1 }}>
              {f.name}
              {f.disabled && (
                <span style={{ fontSize: 11, color: '#9CA3AF' }}>（必须）</span>
              )}
            </span>

            {/* Pin toggle */}
            <span onClick={() => togglePin(i)}>
              <PinIcon pinned={f.pinned} />
            </span>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

// ── Export ──────────────────────────────────────────
window.FieldDrawer = FieldDrawer;
