// Session: 260515-early-sparrow
const { useState } = React;

function Drawer({ title, subtitle, onClose, children, footer }) {
  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(16,24,40,.3)',
          zIndex: 40,
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width: 380,
          background: '#fff',
          boxShadow: '-4px 0 24px rgba(16,24,40,.1)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 41,
          animation: 'slideIn .22s ease-out',
        }}
      >
        <div style={{ padding: '16px 20px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ width: 4, height: 4, background: 'var(--aw-primary)', display: 'inline-block', borderRadius: 1 }} />
              <span style={{ fontSize: 15, fontWeight: 600, marginLeft: 8 }}>{title}</span>
            </div>
            <span style={{ color: '#9CA3AF', cursor: 'pointer', fontSize: 16, lineHeight: 1 }} onClick={onClose}>✕</span>
          </div>
          {subtitle && (
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2, marginLeft: 12 }}>{subtitle}</div>
          )}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {children}
        </div>
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid #F0F1F4',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            <span className="aw-link" style={{ color: 'var(--aw-primary)', cursor: 'pointer', fontSize: 13 }}>重置</span>
          </div>
          <button className="aw-btn primary" style={{ width: 120 }}>{footer}</button>
        </div>
      </div>
      <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
    </>
  );
}

function ExportDrawer({ onClose }) {
  const [format, setFormat] = useState(0);
  const [fields, setFields] = useState([
    true, true,   // [0]文档编码 [1]文档名称 — 必须
    true, true, true, true, true, true, true, true, true, true,
  ]);

  const formats = [
    { name: 'Excel', ext: '.xlsx', bg: '#1D6F42', abbr: 'xls' },
    { name: 'CSV',   ext: '.csv',  bg: '#2563EB', abbr: 'csv' },
    { name: 'PDF',   ext: '.pdf',  bg: '#DC2626', abbr: 'pdf' },
  ];

  const fieldNames = [
    '文档编码', '文档名称', '文档类型', '版本号', '状态',
    '编制人', '更新日期', '生效日期', '失效日期', '所属分类',
    '审批状态', '备注',
  ];

  const allSelected = fields.slice(2).every(Boolean);

  const toggleAll = () => {
    const next = !allSelected;
    setFields([true, true, ...Array(10).fill(next)]);
  };

  const toggleField = (i) => {
    if (i < 2) return;
    const next = [...fields];
    next[i] = !next[i];
    setFields(next);
  };

  return (
    <Drawer
      title="导出"
      subtitle="选择导出格式和字段，将数据导出为文件"
      onClose={onClose}
      footer="导出"
    >
      {/* 导出格式 */}
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>导出格式</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {formats.map((f, i) => (
          <div
            key={f.name}
            style={{
              position: 'relative',
              border: `1px solid ${i === format ? '#5677FC' : '#E5E7EB'}`,
              borderRadius: 8,
              padding: '14px 0',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all .15s',
              background: i === format ? '#EEF1FF' : '#fff',
            }}
            onClick={() => setFormat(i)}
          >
            {i === format && (
              <span style={{
                position: 'absolute',
                top: -1,
                right: -1,
                width: 18,
                height: 18,
                background: '#5677FC',
                borderRadius: '0 8px 0 6px',
                color: '#fff',
                fontSize: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>✓</span>
            )}
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: f.bg,
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>{f.abbr}</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 8 }}>{f.name}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF' }}>{f.ext}</div>
          </div>
        ))}
      </div>

      <div style={{ margin: '16px 0', borderTop: '1px solid #F0F1F4' }} />

      {/* 导出字段 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>导出字段</span>
        <span className="aw-link" style={{ fontSize: 12, cursor: 'pointer' }} onClick={toggleAll}>
          {allSelected ? '清空' : '全选'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
        {fieldNames.map((name, i) => (
          <div
            key={name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              opacity: i < 2 ? 0.5 : 1,
              cursor: i < 2 ? 'not-allowed' : 'default',
            }}
          >
            <span
              className={'aw-chk' + (fields[i] ? ' on' : '')}
              style={i < 2 ? { cursor: 'not-allowed' } : { cursor: 'pointer' }}
              onClick={() => toggleField(i)}
            />
            <span>{name}{i < 2 && <span style={{ fontSize: 11, color: '#9CA3AF' }}>（必须）</span>}</span>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

window.ExportDrawer = ExportDrawer;
