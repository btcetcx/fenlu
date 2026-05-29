// ui_kits/erp-console/purchase-form-kit.jsx
// 采购中心表单标准组件：表单壳 / 分区 / 明细表 / 富文本

function PurchaseFormPage({ onBack, children, submitText = '提交审批', className = '' }) {
  return (
    <div className={'aw-doc-form' + (className ? ' ' + className : '')}>
      <div className="aw-doc-form-head">
        <span className="aw-link" onClick={onBack}>← 返回列表</span>
        <span style={{ flex: 1 }} />
        <button className="aw-btn" onClick={onBack}>取消</button>
        <button className="aw-btn">暂存</button>
        <button className="aw-btn primary">{submitText}</button>
      </div>
      <div className="aw-doc-form-body">{children}</div>
    </div>
  );
}

function PurchaseSection({ title, children }) {
  return <Card title={title}>{children}</Card>;
}

function PurchaseDetailTable({ columns, rows, renderRow, emptyText }) {
  return (
    <div style={{ overflow: 'auto' }}>
      <table className="aw-table">
        <thead>
          <tr>
            <th style={{ width: 42 }}>序号</th>
            {columns.map(col => (
              <th key={col.k || col.label} style={col.w ? { width: col.w } : undefined}>{col.label}</th>
            ))}
            <th style={{ width: 70 }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => renderRow(row, idx))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length + 2} style={{ textAlign: 'center', color: 'var(--aw-fg-3)', padding: '28px 12px' }}>
                {emptyText || '暂无明细'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function PurchaseDetailIndexCell({ index }) {
  return <td className="aw-num">{index + 1}</td>;
}

function PurchaseDetailActions({ onDelete }) {
  return <td><span className="aw-link" style={{ color: 'var(--aw-danger)' }} onClick={onDelete}>删除</span></td>;
}

function PurchaseAddDetailButton({ children = '+ 新增明细', onClick, hint }) {
  return (
    <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
      <Btn onClick={onClick}>{children}</Btn>
      {hint && <span style={{ fontSize: 12, color: 'var(--aw-fg-3)' }}>{hint}</span>}
    </div>
  );
}

function PurchaseRichText({ placeholder = '请输入' }) {
  return (
    <>
      <div className="aw-rt-bar">
        <span>文件</span><span>编辑</span><span>插入</span><span>视图</span><span>格式</span><span>表格</span>
      </div>
      <div className="aw-rt-bar" style={{ borderTop: 0, borderRadius: 0 }}>
        <span>B</span><span><i>I</i></span><span><u>U</u></span><span>S</span>
        <i style={{ width: 1, height: 14, background: '#E5E7EB' }} />
        <span>≡</span><span>≣</span><span>·</span><span>1.</span><span>链接</span><span>图片</span><span>表格</span>
      </div>
      <div className="aw-rt-area" contentEditable suppressContentEditableWarning>{placeholder}</div>
    </>
  );
}

function PurchaseImageCell() {
  return (
    <td>
      <div style={{ width: 42, height: 28, border: '1px dashed var(--aw-border-strong)', borderRadius: 4, background: 'var(--aw-surface-2)' }} />
    </td>
  );
}

function PurchaseStatusField({ label = '状态', options = [], defaultValue, placeholder = '请选择' }) {
  return (
    <Field label={label}>
      <Select defaultValue={defaultValue || ''}>
        <option value="">{placeholder}</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </Select>
    </Field>
  );
}

Object.assign(window, {
  PurchaseFormPage,
  PurchaseSection,
  PurchaseDetailTable,
  PurchaseDetailIndexCell,
  PurchaseDetailActions,
  PurchaseAddDetailButton,
  PurchaseRichText,
  PurchaseImageCell,
  PurchaseStatusField,
});
