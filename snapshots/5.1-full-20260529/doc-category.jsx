// Session: 260514-mild-owl
const { useState, useEffect } = React;

const CATEGORY_CONFIGS = {
  doc: {
    defaultKey: 'plan',
    topCats: [
      { key: 'plan', name: '工艺方案' },
      { key: 'craft', name: '工艺文件' },
      { key: 'tech', name: '技术文档' },
      { key: 'spec', name: '操作规范' },
    ],
    subs: [
      { id: 1, name: '控制方案', code: 'DOC_PLAN_CTRL', parent: 'plan', parentName: '工艺方案', sort: 1, enabled: true },
      { id: 2, name: '自动化方案', code: 'DOC_PLAN_AUTO', parent: 'plan', parentName: '工艺方案', sort: 2, enabled: true },
      { id: 3, name: '焊接作业', code: 'DOC_CRAFT_WELD', parent: 'craft', parentName: '工艺文件', sort: 1, enabled: true },
      { id: 4, name: '技术规范', code: 'DOC_TECH_SPEC', parent: 'tech', parentName: '技术文档', sort: 1, enabled: true },
      { id: 5, name: '安全操作', code: 'DOC_OP_SAFE', parent: 'spec', parentName: '操作规范', sort: 1, enabled: true },
    ],
  },
  proj: {
    defaultKey: 'rd',
    topCats: [
      { key: 'rd', name: '研发项目' },
      { key: 'eng', name: '工程项目' },
      { key: 'coop', name: '合作项目' },
    ],
    subs: [
      { id: 1, name: '内部研发', code: 'PRJ_RD_INNER', parent: 'rd', parentName: '研发项目', sort: 1, enabled: true },
      { id: 2, name: '产品研发', code: 'PRJ_RD_PRODUCT', parent: 'rd', parentName: '研发项目', sort: 2, enabled: true },
      { id: 3, name: '系统改造', code: 'PRJ_ENG_IT', parent: 'eng', parentName: '工程项目', sort: 1, enabled: true },
      { id: 4, name: '自动化工程', code: 'PRJ_ENG_AUTO', parent: 'eng', parentName: '工程项目', sort: 2, enabled: true },
      { id: 5, name: '校企合作', code: 'PRJ_COOP_SCHOOL', parent: 'coop', parentName: '合作项目', sort: 1, enabled: true },
      { id: 6, name: '联合创新', code: 'PRJ_COOP_PARTNER', parent: 'coop', parentName: '合作项目', sort: 2, enabled: true },
    ],
  },
  prod: {
    defaultKey: 'fin',
    topCats: [
      { key: 'fin', name: '成品' },
      { key: 'semi', name: '半成品' },
      { key: 'raw', name: '原材料' },
    ],
    subs: [
      { id: 1, name: '类别A', code: 'PROD_FIN_A', parent: 'fin', parentName: '成品', sort: 1, enabled: true },
      { id: 2, name: '类别B', code: 'PROD_FIN_B', parent: 'fin', parentName: '成品', sort: 2, enabled: true },
      { id: 3, name: '控制板组件', code: 'PROD_SEMI_CONTROL', parent: 'semi', parentName: '半成品', sort: 1, enabled: true },
      { id: 4, name: '结构原料', code: 'PROD_RAW_STRUCT', parent: 'raw', parentName: '原材料', sort: 1, enabled: true },
    ],
  },
  mat: {
    defaultKey: 'elec',
    topCats: [
      { key: 'elec', name: '电子物料' },
      { key: 'mech', name: '机械物料' },
      { key: 'pack', name: '包装物料' },
    ],
    subs: [
      { id: 1, name: '芯片类', code: 'MAT_ELEC_CHIP', parent: 'elec', parentName: '电子物料', sort: 1, enabled: true },
      { id: 2, name: '电容类', code: 'MAT_ELEC_CAP', parent: 'elec', parentName: '电子物料', sort: 2, enabled: true },
      { id: 3, name: '紧固件', code: 'MAT_MECH_FASTENER', parent: 'mech', parentName: '机械物料', sort: 1, enabled: true },
      { id: 4, name: '纸箱类', code: 'MAT_PACK_BOX', parent: 'pack', parentName: '包装物料', sort: 1, enabled: true },
    ],
  },
  proc: {
    defaultKey: 'mach',
    topCats: [
      { key: 'mach', name: '加工工序' },
      { key: 'asm', name: '装配工序' },
      { key: 'insp', name: '检验工序' },
    ],
    subs: [
      { id: 1, name: '车削', code: 'PROC_MACH_TURN', parent: 'mach', parentName: '加工工序', sort: 1, enabled: true },
      { id: 2, name: '铣削', code: 'PROC_MACH_MILL', parent: 'mach', parentName: '加工工序', sort: 2, enabled: true },
      { id: 3, name: '总装', code: 'PROC_ASM_FINAL', parent: 'asm', parentName: '装配工序', sort: 1, enabled: true },
      { id: 4, name: '来料检', code: 'PROC_INSP_IQC', parent: 'insp', parentName: '检验工序', sort: 1, enabled: true },
    ],
  },
  craft: {
    defaultKey: 'assembly',
    topCats: [
      { key: 'assembly', name: '电子装配' },
      { key: 'machining', name: '机加工' },
      { key: 'weld', name: '焊接' },
      { key: 'surface', name: '表面处理' },
      { key: 'pack', name: '包装' },
    ],
    subs: [
      { id: 1, name: '总装工艺', code: 'CRAFT_ASM_FINAL', parent: 'assembly', parentName: '电子装配', sort: 1, enabled: true },
      { id: 2, name: '控制板装配', code: 'CRAFT_ASM_PCB', parent: 'assembly', parentName: '电子装配', sort: 2, enabled: true },
      { id: 3, name: '车铣加工', code: 'CRAFT_MACH_TURN_MILL', parent: 'machining', parentName: '机加工', sort: 1, enabled: true },
      { id: 4, name: '焊接作业', code: 'CRAFT_WELD_WORK', parent: 'weld', parentName: '焊接', sort: 1, enabled: true },
      { id: 5, name: '喷涂处理', code: 'CRAFT_SURFACE_COAT', parent: 'surface', parentName: '表面处理', sort: 1, enabled: true },
      { id: 6, name: '包装工艺', code: 'CRAFT_PACK_STD', parent: 'pack', parentName: '包装', sort: 1, enabled: true },
    ],
  },
  bom: {
    defaultKey: 'finished_bom',
    topCats: [
      { key: 'finished_bom', name: '成品BOM' },
      { key: 'semi_bom', name: '半成品BOM' },
      { key: 'eng_bom', name: '工程BOM' },
      { key: 'virt_bom', name: '虚拟BOM' },
    ],
    subs: [
      { id: 1, name: '温控锅整机', code: 'BOM_FIN_COOKER', parent: 'finished_bom', parentName: '成品BOM', sort: 1, enabled: true },
      { id: 2, name: '包装套件', code: 'BOM_FIN_PACK', parent: 'finished_bom', parentName: '成品BOM', sort: 2, enabled: true },
      { id: 3, name: '控制板组件', code: 'BOM_SEMI_CONTROL', parent: 'semi_bom', parentName: '半成品BOM', sort: 1, enabled: true },
      { id: 4, name: '机身子装配', code: 'BOM_SEMI_BODY', parent: 'semi_bom', parentName: '半成品BOM', sort: 2, enabled: true },
      { id: 5, name: '温控模块', code: 'BOM_SEMI_TEMP', parent: 'semi_bom', parentName: '半成品BOM', sort: 3, enabled: true },
      { id: 6, name: '新品试制', code: 'BOM_ENG_TRIAL', parent: 'eng_bom', parentName: '工程BOM', sort: 1, enabled: true },
      { id: 7, name: '变更验证', code: 'BOM_ENG_CHANGE', parent: 'eng_bom', parentName: '工程BOM', sort: 2, enabled: true },
      { id: 8, name: '通用组件', code: 'BOM_VIRT_COMMON', parent: 'virt_bom', parentName: '虚拟BOM', sort: 1, enabled: true },
      { id: 9, name: '替代组件', code: 'BOM_VIRT_REPLACE', parent: 'virt_bom', parentName: '虚拟BOM', sort: 2, enabled: true },
    ],
  },
};

function CategoryScreen({ module: mod = MODULE_DOC }) {
  const m = mod || MODULE_DOC;
  const { Card, Btn, Field, Input, Select, Switch, Badge } = window;
  const config = CATEGORY_CONFIGS[m.code] || CATEGORY_CONFIGS.doc;

  const [subs, setSubs] = useState(config.subs);

  // ── 状态 ──
  const [activeCat, setActiveCat] = useState(config.defaultKey);
  const [formMode, setFormMode] = useState(null);   // null | 'new' | 'edit'
  const [editTarget, setEditTarget] = useState(null);

  useEffect(() => {
    setSubs(config.subs);
    setActiveCat(config.defaultKey);
    setFormMode(null);
    setEditTarget(null);
  }, [m.code]);

  // ── 派生 ──
  const topCats = [
    { key: 'all', name: '全部', count: subs.length },
    ...config.topCats.map(cat => ({
      ...cat,
      count: subs.filter(s => s.parent === cat.key).length,
    })),
  ];
  const defaultParent = config.defaultKey;
  const activeCatInfo = topCats.find(c => c.key === activeCat) || topCats[0];
  const filteredSubs = activeCat === 'all'
    ? subs
    : subs.filter(s => s.parent === activeCat);

  // ── 表单字段状态 ──
  const emptyForm = { name: '', code: '', parent: activeCat === 'all' ? defaultParent : activeCat, sort: '0', remark: '', enabled: true };
  const [form, setForm] = useState(emptyForm);

  // ── 打开新增表单 ──
  const openNew = () => {
    setFormMode('new');
    setEditTarget(null);
    setForm({ ...emptyForm, parent: activeCat === 'all' ? defaultParent : activeCat });
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
    if (formMode === 'new') {
      const parentName = topCats.find(c => c.key === form.parent)?.name || '';
      setSubs(prev => [
        ...prev,
        {
          id: Math.max(0, ...prev.map(s => s.id)) + 1,
          name: form.name,
          code: form.code,
          parent: form.parent,
          parentName,
          sort: Number(form.sort) || 0,
          remark: form.remark,
          enabled: form.enabled,
        },
      ]);
    }
    if (formMode === 'edit' && editTarget) {
      setSubs(prev => prev.map(s =>
        s.id === editTarget.id
          ? { ...s, name: form.name, code: form.code, parent: form.parent, parentName: topCats.find(c => c.key === form.parent)?.name || '', sort: Number(form.sort) || 0, remark: form.remark, enabled: form.enabled }
          : s
      ));
    }
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
              <span style={{ fontSize: 12, color: '#6B7280' }}>停用后该分类下{m.name}不可新增</span>
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
