// ui_kits/erp-console/product-picker.jsx
// Session: 260515-high-bronze
const { useState } = React;

function ProductPickerModal({ onClose, onConfirm }) {
  const [sel, setSel] = useState({});
  const selCount = Object.values(sel).filter(Boolean).length;
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const products = [
    { seq: 1, category: 'semi', categoryName: '半成品', productNo: '7820864', productName: '半成品物料', spec: '规格一', model: 'HM-450', unit: 'KG', price: 50.00, stock: 1200, supplier: '深圳鑫达电子科技有限公司', deliveryDate: '2024-12-23' },
    { seq: 2, category: 'semi', categoryName: '半成品', productNo: '5786931', productName: '半成品物料', spec: '规格一', model: 'HM-451', unit: 'KG', price: 50.00, stock: 860, supplier: '广州宏业机械配件有限公司', deliveryDate: '2024-12-23' },
    { seq: 3, category: 'raw', categoryName: '原材料', productNo: '8518691', productName: '铝合金型材', spec: '6061-T6', model: 'AL-6061', unit: 'KG', price: 32.00, stock: 520, supplier: '上海博源化工有限公司', deliveryDate: '2024-12-25' },
    { seq: 4, category: 'part', categoryName: '零部件', productNo: '6576642', productName: '精密轴承', spec: '6205-2RS', model: 'BR-6205', unit: '个', price: 18.00, stock: 240, supplier: '佛山顺德精密五金厂', deliveryDate: '2024-12-26' },
    { seq: 5, category: 'pack', categoryName: '包装材料', productNo: '6081578', productName: '外箱包装', spec: '500x320x280', model: 'PK-500', unit: '个', price: 4.50, stock: 1800, supplier: '东莞华美包装制品厂', deliveryDate: '2024-12-28' },
  ];
  const categories = [
    { k: 'all', label: '全部产品', count: products.length },
    { k: 'semi', label: '半成品', count: products.filter(p => p.category === 'semi').length },
    { k: 'raw', label: '原材料', count: products.filter(p => p.category === 'raw').length },
    { k: 'part', label: '零部件', count: products.filter(p => p.category === 'part').length },
    { k: 'pack', label: '包装材料', count: products.filter(p => p.category === 'pack').length },
  ];

  const filtered = products.filter(p => {
    if (search && !p.productName.includes(search) && !p.productNo.includes(search)) return false;
    if (category !== 'all' && p.category !== category) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const start = (page - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  const toggleRow = (i) => setSel(s => ({ ...s, [i]: !s[i] }));
  const toggleAll = () => {
    const visibleIdxs = filtered.map(p => products.indexOf(p));
    const allVisibleChecked = visibleIdxs.length > 0 && visibleIdxs.every(i => sel[i]);
    if (allVisibleChecked) {
      setSel(s => {
        const next = { ...s };
        visibleIdxs.forEach(i => { delete next[i]; });
        return next;
      });
      return;
    }
    const all = { ...sel }; visibleIdxs.forEach(i => { all[i] = true; }); setSel(all);
  };

  const handleConfirm = () => {
    const selected = products.filter((_, i) => sel[i]);
    onConfirm && onConfirm(selected);
  };

  const formatCurrency = (v) => v.toFixed(2);

  const headerChkCls = 'aw-chk'
    + (selCount === 0 ? '' : selCount === filtered.length ? ' on' : ' indet');

  return (
    <div className="aw-mask" onClick={onClose}>
      <div className="aw-modal picker" style={{ width: 'min(980px, 94vw)' }} onClick={e => e.stopPropagation()}>
        <div className="head">
          <span>选择产品</span>
          <span style={{ cursor: 'pointer', color: 'var(--aw-fg-4)' }} onClick={onClose}>✕</span>
        </div>
        <div className="body" style={{ padding: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: 480 }}>
            <div style={{ borderRight: '1px solid var(--aw-border)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--aw-divider)', fontSize: 13, fontWeight: 600 }}>产品分类</div>
              <div style={{ padding: '8px' }}>
                {categories.map(c => (
                  <div key={c.k} className={'aw-tree-row aw-tree-l2' + (category === c.k ? ' on' : '')} onClick={() => { setCategory(c.k); setPage(1); }}>
                    <span className="aw-tree-caret">{category === c.k ? '▾' : ''}</span>
                    <TileIcon name="folder" size={14} />
                    <span style={{ flex: 1 }}>{c.label}</span>
                    <span className="aw-doc-tree-n">({c.count})</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid #F0F1F4' }}>
                <span style={{ color: '#5677FC', fontSize: 13, fontWeight: 500 }}>已勾选 {selCount} 项</span>
                <div style={{ marginLeft: 'auto', border: '1px solid #E5E7EB', borderRadius: 6, padding: '4px 8px', display: 'flex', gap: 6, alignItems: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--aw-fg-4)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input
                    style={{ border: 0, outline: 'none', background: 'transparent', font: 'inherit', fontSize: 13, color: 'var(--aw-fg-1)', width: 190 }}
                    placeholder="搜索产品名称/编号"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                  />
                </div>
              </div>

              <div className="aw-doc-tbl-inner" style={{ flex: 1 }}>
                <table className="aw-doc-tbl">
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>
                        <div className="aw-th-inner" style={{ justifyContent: 'center' }}>
                          <span className={headerChkCls} onClick={toggleAll} />
                        </div>
                      </th>
                      <th style={{ width: 50 }}><div className="aw-th-inner">序号</div></th>
                      <th style={{ width: 120 }}><div className="aw-th-inner">产品编号</div></th>
                      <th style={{ width: 140 }}><div className="aw-th-inner">产品名称</div></th>
                      <th style={{ width: 120 }}><div className="aw-th-inner">产品型号</div></th>
                      <th style={{ width: 120 }}><div className="aw-th-inner">产品分类</div></th>
                      <th style={{ width: 70 }}><div className="aw-th-inner">单位</div></th>
                      <th style={{ width: 90 }}><div className="aw-th-inner">参考单价</div></th>
                      <th style={{ width: 90 }}><div className="aw-th-inner">库存</div></th>
                      <th style={{ width: 180 }}><div className="aw-th-inner">默认供应商</div></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((p) => {
                      const idx = products.indexOf(p);
                      return (
                        <tr key={idx} onClick={() => toggleRow(idx)} style={sel[idx] ? { background: 'var(--aw-primary-soft)' } : undefined}>
                          <td style={{ textAlign: 'center', background: sel[idx] ? 'var(--aw-primary-soft)' : undefined }}>
                            <span className={'aw-chk' + (sel[idx] ? ' on' : '')} onClick={(e) => { e.stopPropagation(); toggleRow(idx); }} />
                          </td>
                          <td className="aw-num">{p.seq}</td>
                          <td className="aw-num">{p.productNo}</td>
                          <td className="aw-link">{p.productName}</td>
                          <td>{p.model}</td>
                          <td>{p.categoryName}</td>
                          <td>{p.unit}</td>
                          <td className="aw-num">{formatCurrency(p.price)}</td>
                          <td className="aw-num">{p.stock}</td>
                          <td>{p.supplier}</td>
                        </tr>
                      );
                    })}
                    {pageItems.length === 0 && (
                      <tr><td colSpan={10} style={{ textAlign: 'center', color: 'var(--aw-fg-3)', padding: '40px 12px' }}>暂无数据</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Select style={{ width: 'auto', padding: '4px 6px', background: '#fff', border: '1px solid var(--aw-border-strong)' }}>
                <option>5条/页</option>
                <option>10条/页</option>
                <option>20条/页</option>
              </Select>
              <div style={{ display: 'flex', gap: 2 }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <span key={n} className={'aw-pg' + (page === n ? ' on' : '')} onClick={() => setPage(n)}>{n}</span>
                ))}
              </div>
              <span className="aw-pg" style={{ cursor: page > 1 ? 'pointer' : 'default', color: page > 1 ? 'var(--aw-fg-2)' : 'var(--aw-fg-3)' }} onClick={() => page > 1 && setPage(p => p - 1)}>‹</span>
              <span className="aw-pg" style={{ cursor: page < totalPages ? 'pointer' : 'default', color: page < totalPages ? 'var(--aw-fg-2)' : 'var(--aw-fg-3)' }} onClick={() => page < totalPages && setPage(p => p + 1)}>›</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn onClick={onClose}>取消</Btn>
              <Btn kind="primary" onClick={handleConfirm}>确定</Btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ProductPickerModal });
