// ui_kits/erp-console/order-picker.jsx
// OrderPickerModal — 选择生产单号弹窗
// Session: 260515-vital-inlet

const { useState } = React;

function OrderPickerModal({ onClose, onConfirm }) {
  const orders = [
    { seq: 1, code: 'XS256486', topic: '新产品生产', type: '内部生产', date: '2024-06-09', owner: '楚楚', dept: '部门三', prodDepts: ['部门一', '部门二', '部门三', '部门四', '部门五'], project: '项目A' },
    { seq: 2, code: 'XS256487', topic: '标准件生产', type: '内部生产', date: '2024-06-10', owner: '老夏', dept: '部门一', prodDepts: ['部门一', '部门二'], project: '项目B' },
    { seq: 3, code: 'XS256488', topic: '紧急订单生产', type: '紧急生产', date: '2024-06-11', owner: '李文涛', dept: '部门二', prodDepts: ['部门三', '部门四'], project: '项目C' },
    { seq: 4, code: 'XS256489', topic: '样品试制', type: '试制', date: '2024-06-12', owner: '陈思源', dept: '部门四', prodDepts: ['部门一', '部门二', '部门三'], project: '项目A' },
    { seq: 5, code: 'XS256490', topic: '批量生产', type: '内部生产', date: '2024-06-13', owner: '赵工', dept: '部门五', prodDepts: ['部门一', '部门二', '部门三', '部门四'], project: '项目D' },
  ];

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [expandedDepts, setExpandedDepts] = useState({});

  const handleConfirm = () => {
    if (selectedOrder !== null) {
      onConfirm(orders[selectedOrder]);
    }
  };

  const toggleDeptExpand = (idx) => {
    setExpandedDepts((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const renderProdDepts = (depts, idx) => {
    if (depts.length <= 2 || expandedDepts[idx]) {
      return depts.join('、');
    }
    const shown = depts.slice(0, 2).join('、');
    const remaining = depts.length - 2;
    return (
      <span>
        {shown}、
        <span className="aw-link" onClick={(e) => { e.stopPropagation(); toggleDeptExpand(idx); }}>
          等{remaining}个部门·
        </span>
      </span>
    );
  };

  return (
    <div className="aw-mask" onClick={onClose}>
      <div className="aw-modal" style={{ width: 'min(860px, 94vw)', maxHeight: '85vh' }} onClick={(e) => e.stopPropagation()}>
        {/* 头部 */}
        <div className="head">
          <span>选择生产单号</span>
          <span style={{ cursor: 'pointer', color: '#9CA3AF' }} onClick={onClose}>✕</span>
        </div>

        {/* 搜索栏 */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #F0F1F4', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Input style={{ width: 240 }} placeholder="搜索生产单号" />
          <span style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8">
              <circle cx="11" cy="11" r="6" />
              <path d="M16 16l4 4" />
            </svg>
          </span>
        </div>

        {/* 列表 */}
        <div className="body" style={{ padding: 0 }}>
          <div className="aw-doc-tbl-inner">
            <table className="aw-doc-tbl">
              <colgroup>
                <col style={{ width: 40 }} />
                <col style={{ width: 50 }} />
                <col style={{ width: 140 }} />
                <col style={{ width: 160 }} />
                <col style={{ width: 100 }} />
                <col style={{ width: 120 }} />
                <col style={{ width: 80 }} />
                <col style={{ width: 90 }} />
                <col />
                <col style={{ width: 90 }} />
              </colgroup>
              <thead>
                <tr>
                  <th><div className="aw-th-inner"></div></th>
                  <th><div className="aw-th-inner">序号</div></th>
                  <th><div className="aw-th-inner">生产单号</div></th>
                  <th><div className="aw-th-inner">生产主题</div></th>
                  <th><div className="aw-th-inner">生产类型</div></th>
                  <th><div className="aw-th-inner">单据日期</div></th>
                  <th><div className="aw-th-inner">负责人</div></th>
                  <th><div className="aw-th-inner">所在部门</div></th>
                  <th><div className="aw-th-inner">生产部门</div></th>
                  <th><div className="aw-th-inner">关联项目</div></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o, i) => (
                  <tr
                    key={i}
                    style={{ cursor: 'pointer', background: selectedOrder === i ? '#EEF1FF' : undefined }}
                    onClick={() => setSelectedOrder(i)}
                  >
                    <td style={{ textAlign: 'center' }}>
                      <Radio on={selectedOrder === i} onClick={() => setSelectedOrder(i)} />
                    </td>
                    <td className="aw-num">{o.seq}</td>
                    <td className="aw-num">{o.code}</td>
                    <td>{o.topic}</td>
                    <td>{o.type}</td>
                    <td className="aw-num">{o.date}</td>
                    <td>{o.owner}</td>
                    <td>{o.dept}</td>
                    <td>{renderProdDepts(o.prodDepts, i)}</td>
                    <td>{o.project}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 底部 */}
        <div className="foot" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--aw-fg-3)' }}>共 36 项数据</span>
            <select className="aw-input" style={{ width: 80, padding: '4px 6px', background: '#fff', border: '1px solid var(--aw-border-strong)' }}>
              <option>5条/页</option>
              <option>10条/页</option>
              <option>20条/页</option>
            </select>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <span className="aw-pg more">‹</span>
              <span className="aw-pg on">1</span>
              <span className="aw-pg">2</span>
              <span className="aw-pg">3</span>
              <span className="aw-pg">4</span>
              <span className="aw-pg">5</span>
              <span className="aw-pg more">›</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn onClick={onClose}>取消</Btn>
            <Btn kind="primary" onClick={handleConfirm}>确定</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { OrderPickerModal });
