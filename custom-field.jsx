// ui_kits/erp-console/custom-field.jsx
// Session: 260514-wide-tide

const { useState } = React;

function CustomFieldScreen({ module: mod = MODULE_DOC }) {
  const m = mod || MODULE_DOC;
  const groups = ['全部字段', `${m.name}信息`, '基础属性', '附件信息'];
  const [activeGroup, setActiveGroup] = useState('全部字段');
  const [showForm, setShowForm] = useState(false);
  const [editIdx, setEditIdx] = useState(-1);
  const [formData, setFormData] = useState({
    name: '', code: '', type: '文本', required: false, defaultValue: '', placeholder: ''
  });
  const [formPerms, setFormPerms] = useState([]);
  const [showPicker, setShowPicker] = useState(false);

  const [fields, setFields] = useState([
    { name: '产品名称', code: 'prod_name', type: '文本', required: true, enabled: true, sort: 1,
      permissions: [
        { id: '100001', name: '丁昌容', role: '采购人员', phone: '13500001111' },
        { id: '200001', name: '林悦',   role: 'UI 设计师', phone: '13600001111' }
      ]
    },
    { name: '产品单价', code: 'prod_price', type: '数字', required: false, enabled: true, sort: 2,
      permissions: [
        { id: '300001', name: '苏婉清', role: '产品经理', phone: '13700001111' }
      ]
    },
    { name: '生产日期', code: 'prod_date', type: '日期', required: true, enabled: true, sort: 3,
      permissions: []
    },
    { name: '产品分类', code: 'prod_category', type: '下拉', required: false, enabled: false, sort: 4,
      permissions: [
        { id: '100001', name: '丁昌容', role: '采购人员', phone: '13500001111' },
        { id: '400001', name: '陈志强', role: '销售经理', phone: '13800001111' },
        { id: '200002', name: '何志远', role: '平面设计师', phone: '13600002222' }
      ]
    },
  ]);

  const typeBadgeStyle = (type) => {
    const map = {
      '文本': { background: '#EEF1FF', color: '#5677FC' },
      '数字': { background: '#DCE7FB', color: '#3D5DC9' },
      '日期': { background: '#DBF3E6', color: '#1F7A4E' },
      '下拉': { background: '#FDECDC', color: '#B26A24' },
    };
    return map[type] || {};
  };

  const openNew = () => {
    setFormData({ name: '', code: '', type: '文本', required: false, defaultValue: '', placeholder: '' });
    setFormPerms([]);
    setEditIdx(-1);
    setShowForm(true);
  };

  const openEdit = (idx) => {
    const f = fields[idx];
    setFormData({
      name: f.name, code: f.code, type: f.type,
      required: f.required,
      defaultValue: f.defaultValue || '',
      placeholder: f.placeholder || ''
    });
    setFormPerms([...(f.permissions || [])]);
    setEditIdx(idx);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.code.trim()) return;
    const newField = {
      name: formData.name.trim(),
      code: formData.code.trim(),
      type: formData.type,
      required: formData.required,
      enabled: editIdx >= 0 ? fields[editIdx].enabled : true,
      permissions: formPerms,
      sort: editIdx >= 0 ? fields[editIdx].sort : fields.length + 1,
      defaultValue: formData.defaultValue,
      placeholder: formData.placeholder,
    };
    if (editIdx >= 0) {
      const updated = [...fields];
      updated[editIdx] = newField;
      setFields(updated);
    } else {
      setFields([...fields, newField]);
    }
    setShowForm(false);
  };

  const handleDelete = (idx) => {
    setFields(fields.filter((_, i) => i !== idx));
  };

  const toggleRequired = (idx) => {
    const updated = [...fields];
    updated[idx] = { ...updated[idx], required: !updated[idx].required };
    setFields(updated);
  };

  const toggleEnabled = (idx) => {
    const updated = [...fields];
    updated[idx] = { ...updated[idx], enabled: !updated[idx].enabled };
    setFields(updated);
  };

  const moveUp = (idx) => {
    if (idx === 0) return;
    const updated = [...fields];
    [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
    setFields(updated);
  };

  const moveDown = (idx) => {
    if (idx === fields.length - 1) return;
    const updated = [...fields];
    [updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]];
    setFields(updated);
  };

  // 表单内权限操作
  const addFormPerm = (person) => {
    if (formPerms.some(p => p.id === person.id)) return;
    setFormPerms([...formPerms, person]);
    setShowPicker(false);
  };

  const removeFormPerm = (id) => {
    setFormPerms(formPerms.filter(p => p.id !== id));
  };

  return (
    <div className="aw-doc-page">
      {/* 左侧：字段分组 */}
      <div className="aw-card" style={{ width: 210, flex: 'none', padding: '14px 0' }}>
        <div style={{ fontSize: 14, fontWeight: 600, padding: '0 16px 10px', borderBottom: '1px solid var(--aw-divider)', marginBottom: 6 }}>
          字段分组
        </div>
        {groups.map(g => (
          <div
            key={g}
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              borderLeft: '3px solid transparent',
              fontSize: 13,
              color: activeGroup === g ? 'var(--aw-primary)' : 'var(--aw-fg-2)',
              background: activeGroup === g ? 'var(--aw-primary-soft)' : 'transparent',
              borderLeftColor: activeGroup === g ? 'var(--aw-primary)' : 'transparent',
              fontWeight: activeGroup === g ? 500 : 400,
              transition: 'all .15s',
            }}
            onClick={() => setActiveGroup(g)}
            onMouseEnter={e => { if (activeGroup !== g) { e.currentTarget.style.background = 'var(--aw-bg)'; e.currentTarget.style.color = 'var(--aw-primary)'; } }}
            onMouseLeave={e => { if (activeGroup !== g) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--aw-fg-2)'; } }}
          >
            {g}
          </div>
        ))}
      </div>

      {/* 右侧：主区域 */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* 工具栏 */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', background: '#fff', border: '1px solid var(--aw-border)', borderRadius: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--aw-fg-1)' }}>自定义字段</span>
          <div style={{ marginLeft: 'auto' }}>
            <Btn kind="primary" onClick={openNew}>+ 新增字段</Btn>
          </div>
        </div>

        {/* 字段列表表格 */}
        <div className="aw-doc-tbl-wrap">
          <div className="aw-doc-tbl-inner">
            <table className="aw-doc-tbl">
              <thead>
                <tr>
                  <th><div className="aw-th-inner">字段名称</div></th>
                  <th><div className="aw-th-inner">字段编码</div></th>
                  <th><div className="aw-th-inner">字段类型</div></th>
                  <th style={{ textAlign: 'center' }}><div className="aw-th-inner" style={{ justifyContent: 'center' }}>是否必填</div></th>
                  <th style={{ textAlign: 'center' }}><div className="aw-th-inner" style={{ justifyContent: 'center' }}>是否启用</div></th>
                  <th><div className="aw-th-inner">权限</div></th>
                  <th><div className="aw-th-inner">排序</div></th>
                  <th><div className="aw-th-inner">操作</div></th>
                </tr>
              </thead>
              <tbody>
                {fields.map((f, idx) => (
                  <tr key={idx}>
                    <td>{f.name}</td>
                    <td className="aw-num">{f.code}</td>
                    <td>
                      <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 500, ...typeBadgeStyle(f.type) }}>
                        {f.type}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Switch on={f.required} onChange={() => toggleRequired(idx)} />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Switch on={f.enabled} onChange={() => toggleEnabled(idx)} />
                    </td>
                    <td>
                      <span className="aw-link" onClick={() => openEdit(idx)}>
                        设置权限
                        {(f.permissions && f.permissions.length > 0) && (
                          <span style={{ marginLeft: 4, fontSize: 11, color: 'var(--aw-fg-3)' }}>({f.permissions.length})</span>
                        )}
                      </span>
                    </td>
                    <td>
                      <span className="aw-link" onClick={() => moveUp(idx)} style={{ marginRight: 8 }}>↑</span>
                      <span className="aw-link" onClick={() => moveDown(idx)}>↓</span>
                    </td>
                    <td>
                      <span className="aw-link" onClick={() => openEdit(idx)} style={{ marginRight: 12 }}>编辑</span>
                      <span className="aw-link" onClick={() => handleDelete(idx)} style={{ color: 'var(--aw-danger)' }}>删除</span>
                    </td>
                  </tr>
                ))}
                {fields.length === 0 && (
                  <tr><td colSpan={8} style={{ padding: '60px 0', textAlign: 'center', color: '#9CA3AF' }}>暂无字段数据</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 新增 / 编辑字段表单（含权限设置） */}
        {showForm && (
          <div className="aw-card">
            <div className="section-title">{editIdx >= 0 ? '编辑字段' : '新增字段'}</div>

            {/* 基本信息 */}
            <div className="aw-doc-grid">
              <Field label="字段名称" req>
                <Input placeholder="请输入字段名称" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </Field>
              <Field label="字段编码" req>
                <Input placeholder="请输入字段编码" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} />
              </Field>
              <Field label="字段类型">
                <Select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                  <option>文本</option>
                  <option>数字</option>
                  <option>日期</option>
                  <option>下拉</option>
                </Select>
              </Field>
              <Field label="是否必填">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Switch on={formData.required} onChange={v => setFormData({ ...formData, required: v })} />
                  <span style={{ fontSize: 13, color: 'var(--aw-fg-2)' }}>是否必填</span>
                </div>
              </Field>
              <Field label="默认值">
                <Input placeholder="请输入默认值" value={formData.defaultValue} onChange={e => setFormData({ ...formData, defaultValue: e.target.value })} />
              </Field>
              <Field label="提示文字">
                <Input placeholder="请输入提示文字" value={formData.placeholder} onChange={e => setFormData({ ...formData, placeholder: e.target.value })} />
              </Field>
            </div>

            {/* 权限设置 */}
            <div style={{ marginTop: 22, paddingTop: 16, borderTop: '1px solid var(--aw-divider)' }}>
              <div className="section-title">权限设置</div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--aw-fg-2)', marginBottom: 8 }}>
                  已设置权限人员 ({formPerms.length})
                </div>
                {formPerms.length === 0 ? (
                  <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--aw-fg-4)', fontSize: 13, border: '1px dashed var(--aw-border)', borderRadius: 6 }}>
                    暂未添加权限人员，点击下方按钮添加
                  </div>
                ) : (
                  <div style={{ border: '1px solid var(--aw-border)', borderRadius: 6, overflow: 'hidden' }}>
                    <table className="aw-doc-tbl" style={{ margin: 0 }}>
                      <thead>
                        <tr>
                          <th><div className="aw-th-inner">姓名</div></th>
                          <th><div className="aw-th-inner">编号</div></th>
                          <th><div className="aw-th-inner">角色</div></th>
                          <th style={{ width: 80 }}><div className="aw-th-inner">操作</div></th>
                        </tr>
                      </thead>
                      <tbody>
                        {formPerms.map(p => (
                          <tr key={p.id}>
                            <td style={{ fontWeight: 500 }}>{p.name}</td>
                            <td className="aw-num">{p.id}</td>
                            <td style={{ color: 'var(--aw-fg-3)', fontSize: 12 }}>{p.role}</td>
                            <td>
                              <span className="aw-link" onClick={() => removeFormPerm(p.id)} style={{ color: 'var(--aw-danger)' }}>移除</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <Btn kind="primary" onClick={() => setShowPicker(true)}>添加负责人</Btn>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--aw-divider)' }}>
              <Btn onClick={() => setShowForm(false)}>取消</Btn>
              <Btn kind="primary" onClick={handleSave}>保存</Btn>
            </div>
          </div>
        )}
      </div>

      {/* PersonPickerModal — 选择负责人 */}
      {showPicker && (
        <PersonPickerModal
          onClose={() => setShowPicker(false)}
          onConfirm={addFormPerm}
        />
      )}
    </div>
  );
}

Object.assign(window, { CustomFieldScreen });
