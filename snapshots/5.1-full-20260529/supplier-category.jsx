// ui_kits/erp-console/supplier-category.jsx
// 供应商分组 — 列表 / 新增 / 编辑 三态
const { useState, useEffect } = React;

function SupplierCategoryScreen({ module: mod }) {
  const m = mod || { name: '供应商', code: 'supp' };
  const { Card, Btn, Field, Input, Select } = window;

  // ===================== 模拟数据 =====================
  const [groups, setGroups] = useState([
    { id: 1,  name: '金属材料',     parentId: null, parentName: null,     level: 1, code: 'SUPP_GRP_METAL', description: '各类金属原材料及合金材料', tags: { level: '战略供应商', status: null, settlement: '月结' }, supplierCount: 25 },
    { id: 2,  name: '电子元器件',   parentId: null, parentName: null,     level: 1, code: 'SUPP_GRP_ELEC', description: '电子元器件、半导体等',     tags: { level: '重要供应商', status: null, settlement: '现结' }, supplierCount: 42 },
    { id: 3,  name: '化工材料',     parentId: null, parentName: null,     level: 1, code: 'SUPP_GRP_CHEM', description: '化工原料及辅料',           tags: { level: '一般供应商', status: null, settlement: '周期' }, supplierCount: 18 },
    { id: 4,  name: '有色金属',     parentId: 1,    parentName: '金属材料', level: 2, code: 'SUPP_GRP_NFE',  description: '',                       tags: { level: null,        status: null, settlement: null },   supplierCount: 8  },
    { id: 5,  name: 'IC芯片',       parentId: 2,    parentName: '电子元器件', level: 2, code: 'SUPP_GRP_IC',   description: '集成电路与芯片',       tags: { level: null,        status: '合格', settlement: '现结' }, supplierCount: 32 },
    { id: 6,  name: '包装耗材',     parentId: null, parentName: null,     level: 1, code: 'SUPP_GRP_PKG',  description: '包装材料及耗材',         tags: { level: null,        status: null, settlement: null },   supplierCount: 5  },
  ]);

  // ===================== 状态 =====================
  const [view, setView] = useState('list');        // 'list' | 'new' | 'edit'
  const [editId, setEditId] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { id, name } | null
  const [toast, setToast] = useState(null); // { message, type } | null

  // ===================== 表单状态 =====================
  const emptyForm = { name: '', parentId: '', code: '', description: '', defaultLevel: '', defaultStatus: '', defaultSettlement: '' };
  const [form, setForm] = useState({ ...emptyForm });

  // ===================== Toast =====================
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ===================== 派生数据 =====================
  // 过滤后的列表（按搜索文本）
  const filteredGroups = groups.filter(g =>
    !searchText || g.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // 可用作上级分类的选项（当前分组不能选自己，编辑时排除自身及子孙）
  const getParentOptions = (excludeId) => {
    return groups.filter(g => {
      if (g.id === excludeId) return false;
      if (g.level >= 2) return false; // 最多三级，所以只能选1级或2级做父级
      return true;
    });
  };

  // 获取某个分组的层级深度
  const getLevel = (parentId) => {
    if (!parentId) return 1;
    const parent = groups.find(g => g.id === parentId);
    if (!parent) return 1;
    return parent.level + 1;
  };

  // 标签显示
  const formatTags = (tags) => {
    const parts = [];
    if (tags.level) parts.push(tags.level);
    if (tags.status) parts.push(tags.status);
    if (tags.settlement) parts.push(tags.settlement);
    return parts.length > 0 ? parts.join(' | ') : '未设置';
  };

  // ===================== 操作 =====================
  // 打开新增表单
  const openNew = () => {
    setForm({ ...emptyForm });
    setEditId(null);
    setView('new');
  };

  // 打开编辑表单
  const openEdit = (row) => {
    setEditId(row.id);
    setForm({
      name: row.name,
      parentId: row.parentId ? String(row.parentId) : '',
      code: row.code || '',
      description: row.description || '',
      defaultLevel: row.tags.level || '',
      defaultStatus: row.tags.status || '',
      defaultSettlement: row.tags.settlement || '',
    });
    setView('edit');
  };

  // 添加子分类
  const openAddChild = (parent) => {
    setForm({
      ...emptyForm,
      parentId: String(parent.id),
    });
    setEditId(null);
    setView('new');
  };

  // 保存
  const handleSave = () => {
    if (!form.name.trim()) {
      showToast('请填写分组名称', 'error');
      return;
    }

    // 检查名称唯一性（编辑时排除自身）
    const nameExists = groups.some(g =>
      g.name === form.name.trim() && (view === 'new' || g.id !== editId)
    );
    if (nameExists) {
      showToast('分组名称已存在，请修改后重新提交', 'error');
      return;
    }

    const parentId = form.parentId ? Number(form.parentId) : null;
    const level = getLevel(parentId);
    const parent = parentId ? groups.find(g => g.id === parentId) : null;

    if (view === 'new') {
      const newId = Math.max(0, ...groups.map(g => g.id)) + 1;
      const newGroup = {
        id: newId,
        name: form.name.trim(),
        parentId: parentId,
        parentName: parent ? parent.name : null,
        level: level,
        code: form.code.trim() || `SUPP_GRP_${String(newId).padStart(3, '0')}`,
        description: form.description.trim(),
        tags: {
          level: form.defaultLevel || null,
          status: form.defaultStatus || null,
          settlement: form.defaultSettlement || null,
        },
        supplierCount: 0,
      };
      setGroups(prev => [...prev, newGroup]);
      showToast('分组创建成功', 'success');
    } else {
      // 编辑
      setGroups(prev => prev.map(g =>
        g.id === editId
          ? {
              ...g,
              name: form.name.trim(),
              parentId: parentId,
              parentName: parent ? parent.name : null,
              level: level,
              code: form.code.trim() || g.code,
              description: form.description.trim(),
              tags: {
                level: form.defaultLevel || null,
                status: form.defaultStatus || null,
                settlement: form.defaultSettlement || null,
              },
            }
          : g
      ));
      showToast('分组更新成功', 'success');
    }

    setView('list');
  };

  // 取消
  const handleCancel = () => {
    setView('list');
    setEditId(null);
  };

  // 删除
  const handleDelete = (row) => {
    setDeleteConfirm(row);
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    const id = deleteConfirm.id;
    // 递归找出所有子孙分类
    const descendants = new Set();
    const findDescendants = (pid) => {
      groups.forEach(g => {
        if (g.parentId === pid && !descendants.has(g.id)) {
          descendants.add(g.id);
          findDescendants(g.id);
        }
      });
    };
    findDescendants(id);
    const allIds = [id, ...descendants];

    setGroups(prev => prev.filter(g => !allIds.includes(g.id)));
    setDeleteConfirm(null);
    showToast(`已删除「${deleteConfirm.name}」及其子分类`, 'success');
  };

  // ===================== 计算层级标签 =====================
  const levelLabel = (level) => `第${level}级`;

  // ===================== 上级分类改变时自动计算层级 =====================
  const handleParentChange = (e) => {
    const pid = e.target.value;
    setForm(f => ({ ...f, parentId: pid }));
  };

  // ===================== 渲染：删除确认弹窗 =====================
  const renderDeleteConfirm = () => {
    if (!deleteConfirm) return null;
    return (
      <div className="aw-mask" onClick={() => setDeleteConfirm(null)}>
        <div className="aw-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
          <div className="head">
            确认删除
            <span style={{ cursor: 'pointer', color: '#9CA3AF' }} onClick={() => setDeleteConfirm(null)}>✕</span>
          </div>
          <div className="body" style={{ padding: '20px 24px' }}>
            <div style={{ marginBottom: 12 }}>
              确定要删除分组「<strong>{deleteConfirm.name}</strong>」吗？
            </div>
            <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>
              删除后该分组下的子分类将一并删除，<br />
              供应商不会删除但会失去分组归属。
            </div>
          </div>
          <div className="foot" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '12px 24px' }}>
            <Btn onClick={() => setDeleteConfirm(null)}>取消</Btn>
            <Btn kind="danger" onClick={confirmDelete}>确认删除</Btn>
          </div>
        </div>
      </div>
    );
  };

  // ===================== 渲染：Toast =====================
  const renderToast = () => {
    if (!toast) return null;
    const bg = toast.type === 'error' ? '#FEF2F2' : '#F0FDF4';
    const fg = toast.type === 'error' ? '#DC2626' : '#16A34A';
    return (
      <div style={{
        position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
        zIndex: 9999, padding: '10px 24px', borderRadius: 8,
        background: bg, color: fg, fontSize: 14, fontWeight: 500,
        boxShadow: '0 4px 12px rgba(0,0,0,.12)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span>{toast.type === 'error' ? '✕' : '✓'}</span>
        {toast.message}
      </div>
    );
  };

  // ===================== 渲染：列表页 =====================
  const renderList = () => (
    <div className="aw-doc-page" style={{ alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* 工具栏 */}
        <div className="aw-doc-tb">
          <Input
            placeholder="搜索分组名称…"
            style={{ width: 220 }}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
          <button className="aw-btn primary" onClick={openNew}>+ 新增分组</button>
        </div>

        {/* 表格 */}
        <div className="aw-doc-tbl-wrap">
          <div className="aw-doc-tbl-inner">
            <table className="aw-doc-tbl">
              <thead>
                <tr>
                  <th><div className="aw-th-inner">分组名称</div></th>
                  <th><div className="aw-th-inner">上级分类</div></th>
                  <th><div className="aw-th-inner">层级</div></th>
                  <th><div className="aw-th-inner">关联标签</div></th>
                  <th><div className="aw-th-inner">供应商数量</div></th>
                  <th><div className="aw-th-inner">操作</div></th>
                </tr>
              </thead>
              <tbody>
                {filteredGroups.map(row => (
                  <tr key={row.id}>
                    <td style={{ fontWeight: 500 }}>{row.name}</td>
                    <td>{row.parentName || <span style={{ color: 'var(--aw-fg-4)' }}>—</span>}</td>
                    <td className="aw-num">{levelLabel(row.level)}</td>
                    <td>
                      {row.tags.level || row.tags.status || row.tags.settlement
                        ? <span className="aw-badge b" style={{ fontSize: 12 }}>{formatTags(row.tags)}</span>
                        : <span style={{ color: 'var(--aw-fg-4)', fontSize: 13 }}>未设置</span>
                      }
                    </td>
                    <td className="aw-num">{row.supplierCount}家</td>
                    <td>
                      <span className="aw-link" style={{ marginRight: 12 }} onClick={() => openEdit(row)}>编辑</span>
                      {row.level < 3 && (
                        <span className="aw-link" style={{ marginRight: 12 }} onClick={() => openAddChild(row)}>添加子分类</span>
                      )}
                      <span className="aw-link" style={{ color: 'var(--aw-danger)' }} onClick={() => handleDelete(row)}>删除</span>
                    </td>
                  </tr>
                ))}
                {filteredGroups.length === 0 && (
                  <tr className="aw-row-blank">
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--aw-fg-3)', padding: '32px 12px', fontSize: 13 }}>
                      暂无分组数据，点击「新增分组」开始创建
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  // ===================== 渲染：新增/编辑表单 =====================
  const renderForm = () => {
    const isEdit = view === 'edit';
    const parentOptions = getParentOptions(isEdit ? editId : null);

    return (
      <div className="aw-doc-page" style={{ alignItems: 'flex-start' }}>
        <div className="aw-doc-form" style={{ flex: 1 }}>
          <div className="aw-doc-form-head">
            <span className="aw-link" onClick={handleCancel}>← 返回列表</span>
            <span style={{ flex: 1 }} />
            <Btn onClick={handleCancel}>取消</Btn>
            <Btn kind="primary" onClick={handleSave}>确认保存</Btn>
          </div>

          <div className="aw-doc-form-body">
            {/* ═══ 基本信息 ═══ */}
            <Card title="基本信息">
              <div className="aw-doc-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <Field label="分组名称" req>
                  <Input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="请输入分组名称，如：金属材料"
                  />
                </Field>
                <Field label="上级分类">
                  <Select value={form.parentId} onChange={handleParentChange}>
                    <option value="">不选为顶级分类（最多支持三级）</option>
                    {parentOptions.map(opt => (
                      <option key={opt.id} value={String(opt.id)}>
                        {opt.name}（{levelLabel(opt.level)}）
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="分组编码">
                  <Input
                    value={form.code}
                    onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                    placeholder="系统自动生成，可手动修改（用于对接外部系统）"
                  />
                </Field>
                <Field label="分组描述">
                  <Input
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="请简要描述该分组的范围或用途"
                  />
                </Field>
              </div>
            </Card>

            {/* ═══ 标签设置 ═══ */}
            <Card title="标签设置">
              <div className="aw-sub-hint">标签用于多维度标记供应商，可在列表页按标签筛选</div>
              <div className="aw-doc-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                <Field label="默认等级">
                  <Select
                    value={form.defaultLevel}
                    onChange={e => setForm(f => ({ ...f, defaultLevel: e.target.value }))}
                  >
                    <option value="">请选择默认战略等级</option>
                    <option value="战略供应商">战略供应商</option>
                    <option value="重要供应商">重要供应商</option>
                    <option value="一般供应商">一般供应商</option>
                  </Select>
                  <div className="aw-field-hint">请选择该分组下供应商的默认战略等级</div>
                </Field>
                <Field label="默认状态">
                  <Select
                    value={form.defaultStatus}
                    onChange={e => setForm(f => ({ ...f, defaultStatus: e.target.value }))}
                  >
                    <option value="">请选择默认合作状态</option>
                    <option value="合格">合格</option>
                    <option value="试用中">试用中</option>
                    <option value="暂停合作">暂停合作</option>
                    <option value="淘汰">淘汰</option>
                  </Select>
                  <div className="aw-field-hint">新供应商加入该分组时的默认合作状态</div>
                </Field>
                <Field label="默认结算">
                  <Select
                    value={form.defaultSettlement}
                    onChange={e => setForm(f => ({ ...f, defaultSettlement: e.target.value }))}
                  >
                    <option value="">请选择默认结算方式</option>
                    <option value="现结">现结</option>
                    <option value="月结">月结</option>
                    <option value="周期">周期</option>
                    <option value="额度">额度</option>
                  </Select>
                  <div className="aw-field-hint">常用结算方式，仅作参考</div>
                </Field>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  // ===================== 主渲染 =====================
  return (
    <>
      {view === 'list' && renderList()}
      {(view === 'new' || view === 'edit') && renderForm()}
      {renderDeleteConfirm()}
      {renderToast()}
    </>
  );
}

// 注册到全局
window.SupplierCategoryScreen = SupplierCategoryScreen;
