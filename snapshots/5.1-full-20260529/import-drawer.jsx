// Session: 260515-dynamic-boulder
// ui_kits/erp-console/import-drawer.jsx

const { useState } = React;

/* ===== Animation keyframes ===== */
const slideInStyle = `
@keyframes awDrawerSlideIn {
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
}
`;
// Inject once
if (!document.getElementById('aw-drawer-keyframes')) {
  const s = document.createElement('style');
  s.id = 'aw-drawer-keyframes';
  s.textContent = slideInStyle;
  document.head.appendChild(s);
}

/* ===== Drawer (base) ===== */
function Drawer({ title, subtitle, onClose, children, footer }) {
  return (
    <>
      {/* Mask */}
      <div
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(16,24,40,.3)',
          zIndex: 40,
        }}
        onClick={onClose}
      />
      {/* Drawer panel */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0,
          height: '100vh', width: 380,
          background: '#fff',
          boxShadow: '-4px 0 24px rgba(16,24,40,.1)',
          display: 'flex', flexDirection: 'column',
          zIndex: 41,
          animation: 'awDrawerSlideIn .22s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #F0F1F4',
            flexShrink: 0,
            display: 'flex', alignItems: 'flex-start', gap: 10,
          }}
        >
          {/* Blue square */}
          <div
            style={{
              width: 4, height: 4,
              background: 'var(--aw-primary)',
              borderRadius: 1,
              flex: 'none',
              marginTop: 7,
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--aw-fg-1)', lineHeight: 1.3 }}>
              {title}
            </div>
            {subtitle && (
              <div style={{ fontSize: 12, color: 'var(--aw-fg-3)', marginTop: 4, lineHeight: 1.5 }}>
                {subtitle}
              </div>
            )}
          </div>
          <span
            onClick={onClose}
            style={{
              cursor: 'pointer', color: '#9CA3AF', fontSize: 16,
              flex: 'none', lineHeight: 1, marginTop: 2,
            }}
          >
            ✕
          </span>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              padding: '12px 20px',
              borderTop: '1px solid #F0F1F4',
              flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: 10,
            }}
          >
            {/* Refresh SVG */}
            <span style={{ cursor: 'pointer', color: 'var(--aw-fg-3)', display: 'inline-flex', alignItems: 'center' }} title="刷新">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            </span>
            <span style={{ fontSize: 13, color: 'var(--aw-fg-2)', cursor: 'pointer' }}>重置</span>
            <div style={{ flex: 1 }} />
            <button className="aw-btn primary">{footer}</button>
          </div>
        )}
      </div>
    </>
  );
}

/* ===== ImportDrawer ===== */
function ImportDrawer({ onClose }) {
  const [fileName, setFileName] = useState(null);
  const [dupStrategy, setDupStrategy] = useState('skip');

  return (
    <Drawer
      title="导入"
      subtitle="下载模板填写数据后上传，系统将自动解析并导入"
      onClose={onClose}
      footer="导入"
    >
      {/* ===== Step 1: Download template ===== */}
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--aw-fg-1)' }}>
        下载导入模板
      </div>
      <div style={{ fontSize: 12, color: '#5677FC', marginBottom: 10 }}>
        使用标准模板可确保数据格式正确
      </div>

      {/* Template card */}
      <div
        className="aw-import-tmpl-card"
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px',
          border: '1px solid #E5E7EB',
          borderRadius: 6,
          cursor: 'pointer',
          width: 'fit-content',
          transition: 'all .15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#5677FC'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; }}
      >
        {/* Excel icon */}
        <div
          style={{
            width: 20, height: 20,
            borderRadius: 4,
            background: '#1D6F42',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flex: 'none',
          }}
        >
          <span style={{ fontSize: 8, fontWeight: 700, color: '#fff', lineHeight: 1 }}>xls</span>
        </div>
        <span style={{ fontSize: 13, color: 'var(--aw-fg-1)' }}>Excel表格</span>
      </div>

      {/* Divider */}
      <div style={{ margin: '16px 0', borderTop: '1px solid #F0F1F4' }} />

      {/* ===== Step 2: Upload file ===== */}
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--aw-fg-1)' }}>
        上传数据文件
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '10px 0' }}>
        <label style={{ cursor: 'pointer' }}>
          <button className="aw-btn primary" style={{ fontSize: 12, padding: '6px 14px' }}>选择文件</button>
          <input
            type="file"
            accept=".xls,.xlsx"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files && e.target.files[0];
              setFileName(f ? f.name : null);
            }}
          />
        </label>
        <span style={{ fontSize: 13, color: '#9CA3AF' }}>
          {fileName || '未选择任何文件'}
        </span>
      </div>

      {/* Import settings */}
      <div style={{ fontSize: 12, color: '#6B7280', marginTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
          <span style={{ fontSize: 13, color: 'var(--aw-fg-1)', flex: 1 }}>重复数据处理</span>
          <select className="aw-select" value={dupStrategy} onChange={(e) => setDupStrategy(e.target.value)} style={{ width: 100 }}>
            <option value="skip">跳过</option>
            <option value="overwrite">覆盖</option>
            <option value="error">报错</option>
          </select>
        </div>
      </div>

      {/* Divider */}
      <div style={{ margin: '16px 0', borderTop: '1px solid #F0F1F4' }} />

      {/* ===== Upload results (mock) ===== */}
      <div style={{ fontSize: 13, color: 'var(--aw-primary)', fontFamily: 'var(--aw-font-num)', marginBottom: 6 }}>
        正常数量条数：100条
      </div>
      <div style={{ fontSize: 13, color: '#F5222D', fontFamily: 'var(--aw-font-num)', marginBottom: 10 }}>
        异常数量条数：100条
      </div>

      <div style={{ fontSize: 12, fontWeight: 600, marginTop: 10, marginBottom: 6, color: 'var(--aw-fg-1)' }}>
        异常提示：
      </div>

      <div style={{ maxHeight: 200, overflowY: 'auto', fontSize: 12, color: '#F5222D', lineHeight: 2 }}>
        <div>第1行：【客户名称】字段不能为空</div>
        <div>第2行：【所属行业】字段不能为空</div>
        <div>第3行：【产品名称】字段不能为空</div>
        <div>第4行：【规格型号】字段不能为空</div>
        <div>第5行：【文档编号】字段不能为空</div>
        <div>第6行：【版本号】格式不正确</div>
        <div>第7行：【生效日期】格式不正确</div>
        <div>第8行：【失效日期】格式不正确</div>
      </div>
    </Drawer>
  );
}

window.ImportDrawer = ImportDrawer;
