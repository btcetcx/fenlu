// Session: 260514-mild-owl
const { useState } = React;

function CategoryScreen({ module: mod = MODULE_DOC }) {
  const m = mod || MODULE_DOC;
  const { Card, Btn, Field, Input, Select, Switch, Badge } = window;

  // ── 一级分类 ──
  const topCats = [
    { key: 'all',  name: '全部',     count: 999 },
    { key: 'plan', name: '工艺方案', count: 2 },
    { key: 'craft',name: '工艺文件', count: 1 },
    { key: 'tech', name: '技术文档', count: 1 },
    { key: 'spec', name: '操作规范', count: 1 },
  ];

  // ── 子分类 mock —— 用 state 以便 Switch 切换即时反映 ──
  const [subs, setSubs] = useState([
    { id: 1, name: '三级分类A', code: 'SUB_CAT_A', parent: 'plan', parentName: '工艺方案', sort: 1, enabled: true },
    { id: 2, name: '三级分类B', code: 'SUB_CAT_B', parent: 'plan', parentName: '工艺方案', sort: 2, enabled: false },
    { id: 3, name: '焊接作业', code: 'CRAFT_WELD', parent: 'craft', parentName: '工艺文件', sort: 1, enabled: true },
    { id: 4, name: '技术规范', code: 'TECH_SPEC', parent: 'tech', parentName: '技术文档', sort: 1, enabled: true },
    { id: 5, name: '安全操作', code: 'OP_SAFE', parent: 'spec', parentName: '操作规范', sort: 1, enabled: true },
  ]);

  // ── 状态 ──
  const [activeCat, setActiveCat] = useState('plan');
  const [formMode, setFormMode] = useState(null);   // null | 'new' | 'edit'
  const [editTarget, setEditTarget] = useState(null);

  // ── 派生 ──
  const activeCatInfo = topCats.find(c => c.key === activeCat) || topCats[0];
  const filteredSubs = activeCat === 'all'
    ? subs
    : subs.filter(s => s.parent === activeCat);

  // ── 表单字段状态 ──
  const emptyForm = { name: '', code: '', parent: activeCat === 'all' ? 'plan' : activeCat, sort: '0', remark: '', enabled: true };
  const [form, setForm] = useState(emptyForm);

  // ── 打开新增表单 ──
  const openNew = () => {
    setFormMode('new');
    setEditTarget(null);
    setForm({ ...emptyForm, parent: activeCat === 'all' ? 'plan' : activeCat });
  };

  // ── 打开编辑表单 ──
  const openEdit = (row) => {
    setFormMode('edit');
    setEditTarget(row);
    setForm({
      name: row.name,
      code: row.code,
      parent: row.parent,
      sort: String(row.sort),
      remark: row.remark || '',
      enabled: row.enabled,
    });
  };

  // ── 保存（mock） ──
  const handleSave = () => {
    if (formMode === 'edit' && editTarget) {
      setSubs(prev => prev.map(s =>
        s.id === editTarget.id
          ? { ...s, name: form.name, code: form.code, parent: form.parent, parentName: topCats.find(c => c.key === form.parent)?.name || '', sort: Number(form.sort) || 0, remark: form.remark, enabled: form.enabled }
          : s
      ));
    }
    // new 模式不做真实持久化，仅收起表单
    setFormMode(null);
    setEditTarget(null);
  };

  // ── 取消 ──
  const handleCancel = () => {
    setFormMode(null);
    setEditTarget(null);
  };

  // ── 删除 ──
  const handleDelete = (row) => {
    setSubs(prev => prev.filter(s => s.id !== row.id));
  };

  // ── Switch 切换 ──
  const toggleEnabled = (id) => {
    setSubs(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  // ── 上级分类选项（树数据中的一级分类） ──
  const parentOptions = topCats.filter(c => c.key !== 'all');

  // ── 渲染 ──
  return (
    <div className="aw-doc-page" style={{ alignItems: 'flex-start' }}>

      {/* ═══════════ 左侧 240px — 分类树 ═══════════ */}
      <div className="aw-doc-tree" style={{ width: 240, flex: 'none' }}>
        <div className="aw-doc-tree-h" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{m.name}分类</span>
          <span className="aw-link" style={{ fontSize: 13, fontWeight: 400 }} onClick={openNew}>+ 新增</span>
        </div>
        {topCats.map(cat => (
          <div
            key={cat.key}
            className={'aw-tree-row' + (activeCat === cat.key ? ' on' : '')}
            style={{ cursor: 'pointer', padding: '6px 16px', margin: '0 8px' }}
            onClick={() => { setActiveCat(cat.key); setFormMode(null); }}
          >
            <span style={{ flex: 1, fontFamily: cat.key === 'all' ? 'var(--aw-font-num)' : undefined }}>
              {cat.name}
              {cat.key === 'all' && <span style={{ color: 'var(--aw-fg-3)', fontSize: 12, marginLeft: 4 }}>({cat.count})</span>}
            </span>
          </div>
        ))}
      </div>

      {/* ═══════════ 右侧 — 子分类列表 + 表单 ═══════════ */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* ── 工具栏 ── */}
        <div className="aw-doc-tb">
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--aw-fg-1)' }}>
            {activeCatInfo.name}
          </span>
          <Badge>{filteredSubs.length}</Badge>
          <span style={{ flex: 1 }} />
          <button className="aw-btn primary" onClick={openNew}>+ 新增子分类</button>
        </div>

        {/* ── 子分类表格 ── */}
        <div className="aw-doc-tbl-wrap">
          <div className="aw-doc-tbl-inner">
            <table className="aw-doc-tbl">
              <thead>
                <tr>
                  <th><div className="aw-th-inner">分类名称</div></th>
                  <th><div className="aw-th-inner">分类编码</div></th>
                  <th><div className="aw-th-inner">上级分类</div></th>
                  <th><div className="aw-th-inner">排序</div></th>
                  <th><div className="aw-th-inner">是否启用</div></th>
                  <th><div className="aw-th-inner">操作</div></th>
                </tr>
              </thead>
              <tbody>
                {filteredSubs.map(row => (
                  <tr key={row.id}>
                    <td>{row.name}</td>
                    <td className="aw-num">{row.code}</td>
                    <td>{row.parentName}</td>
                    <td className="aw-num">{row.sort}</td>
                    <td>
                      <Switch
                        on={row.enabled}
                        onChange={() => toggleEnabled(row.id)}
                      />
                    </td>
                    <td>
                      <span className="aw-link" style={{ marginRight: 12 }} onClick={() => openEdit(row)}>编辑</span>
                      <span className="aw-link" style={{ color: 'var(--aw-danger)' }} onClick={() => handleDelete(row)}>删除</span>
                    </td>
                  </tr>
                ))}
                {filteredSubs.length === 0 && (
                  <tr className="aw-row-blank">
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--aw-fg-3)', padding: '32px 12px', fontSize: 13 }}>暂无子分类</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 新增 / 编辑表单 ── */}
        {formMode && (
          <Card title={formMode === 'edit' ? '编辑分类' : '新增分类'}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 24px' }}>
              <Field label="分类名称" req>
                <Input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="请输入分类名称"
                />
              </Field>
              <Field label="分类编码" req>
                <Input
                  value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                  placeholder="请输入分类编码"
                />
              </Field>
              <Field label="上级分类">
                <Select
                  value={form.parent}
                  onChange={e => setForm(f => ({ ...f, parent: e.target.value }))}
                >
                  {parentOptions.map(opt => (
                    <option key={opt.key} value={opt.key}>{opt.name}</option>
                  ))}
                </Select>
              </Field>
              <Field label="排序">
                <Input
                  value={form.sort}
                  onChange={e => setForm(f => ({ ...f, sort: e.target.value }))}
                  placeholder="0"
                />
              </Field>
              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="备注">
                  <Input
                    value={form.remark}
                    onChange={e => setForm(f => ({ ...f, remark: e.target.value }))}
                    placeholder="请输入备注"
                  />
                </Field>
              </div>
            </div>
            {/* Switch 行 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, padding: '10px 0', borderTop: '1px solid var(--aw-divider)' }}>
              <Switch
                on={form.enabled}
                onChange={v => setForm(f => ({ ...f, enabled: v }))}
              />
              <span style={{ fontSize: 13, color: 'var(--aw-fg-2)' }}>是否启用</span>
              <span style={{ fontSize: 12, color: '#6B7280' }}>停用后该分类下文档不可新增</span>
            </div>
            {/* 底部按钮 */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
              <Btn onClick={handleCancel}>取消</Btn>
              <Btn kind="primary" onClick={handleSave}>保存</Btn>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

window.CategoryScreen = CategoryScreen;
