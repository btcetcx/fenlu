// ui_kits/erp-console/approval-flow.jsx
// Session: 260514-smooth-ruby
// 审批流程设置页 — ApprovalFlowScreen
const { useState } = React;

/* ===== Mock Data ===== */
const INITIAL_FLOWS = [
  {
    id: 'flow-1',
    name: '文档审批流',
    category: '文档库',
    nodes: [
      { id: 'n1', name: '部门主管审批', approvers: ['老夏'],          method: 'sequential' },
      { id: 'n2', name: '技术总监审批', approvers: ['李文涛', '陈思源'], method: 'countersign' },
      { id: 'n3', name: '总经理审批',   approvers: ['张明'],          method: 'or-sign' },
    ],
    creator: '老夏',
    updatedAt: '2025-12-12 14:30',
  },
  {
    id: 'flow-2',
    name: '紧急审批流',
    category: '全部',
    nodes: [
      { id: 'n1', name: '值班经理审批',   approvers: ['赵工', '王志强'], method: 'or-sign' },
      { id: 'n2', name: '部门负责人审批', approvers: ['陈思源'],        method: 'sequential' },
    ],
    creator: '李文涛',
    updatedAt: '2025-11-20 09:15',
  },
];



/* ===== ApprovalFlowScreen ===== */
function ApprovalFlowScreen({ module: mod = MODULE_DOC }) {
  const m = mod || MODULE_DOC;
  const [flows, setFlows] = useState(INITIAL_FLOWS);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [selectedNid, setSelectedNid] = useState(null);
  const [approverPickerIdx, setApproverPickerIdx] = useState(null); // node idx for PersonPickerModal

  /* ---- handlers ---- */
  const handleNew = () => {
    setEditData({
      id: 'flow-new',
      name: '',
      category: '文档库',
      nodes: [{ id: 'n1', name: '', approvers: [], method: 'sequential' }],
      creator: '老夏',
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    });
    setEditingId('new');
    setSelectedNid(null);
  };

  const handleEdit = (flowId) => {
    const flow = flows.find(f => f.id === flowId);
    setEditData(JSON.parse(JSON.stringify(flow)));
    setEditingId(flowId);
    setSelectedNid(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData(null);
    setSelectedNid(null);
    setApproverPickerIdx(null);
  };

  const handleSave = () => {
    if (!editData.name.trim()) return;
    if (editingId === 'new') {
      const newFlow = { ...editData, id: 'flow-' + Date.now() };
      setFlows(prev => [...prev, newFlow]);
    } else {
      setFlows(prev => prev.map(f => f.id === editingId ? editData : f));
    }
    handleCancel();
  };

  const handleDelete = (flowId) => {
    setFlows(prev => prev.filter(f => f.id !== flowId));
  };

  /* ---- editData field sync ---- */
  const upField = (field, value) => setEditData(prev => ({ ...prev, [field]: value }));

  const upNode = (idx, field, value) => {
    const nodes = [...editData.nodes];
    nodes[idx] = { ...nodes[idx], [field]: value };
    setEditData(prev => ({ ...prev, nodes }));
  };

  const addNode = () => {
    const newId = 'n' + (editData.nodes.length + 1);
    setEditData(prev => ({
      ...prev,
      nodes: [...prev.nodes, { id: newId, name: '', approvers: [], method: 'sequential' }],
    }));
  };

  const removeNode = (idx) => {
    if (editData.nodes.length <= 1) return;
    const nodes = editData.nodes.filter((_, i) => i !== idx);
    setEditData(prev => ({ ...prev, nodes }));
    if (selectedNid === editData.nodes[idx].id) setSelectedNid(null);
  };

  /* ---- approver picker (PersonPickerModal) ---- */
  const openApproverPicker = (idx) => {
    setApproverPickerIdx(idx);
  };

  const handlePersonPicked = (person) => {
    if (approverPickerIdx == null) return;
    const node = editData.nodes[approverPickerIdx];
    // avoid duplicates
    if (!node.approvers.includes(person.name)) {
      upNode(approverPickerIdx, 'approvers', [...node.approvers, person.name]);
    }
    setApproverPickerIdx(null);
  };

  const removeApprover = (idx, name) => {
    upNode(idx, 'approvers', editData.nodes[idx].approvers.filter(n => n !== name));
  };

  /* ========== render ========== */
  return (
    <>
    <Card>
      {/* ---- Top bar ---- */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: editingId ? 16 : 0,
      }}>
        <div className="aw-section-title" style={{ marginBottom: 0 }}>审批流程列表</div>
        {!editingId && (
          <Btn kind="primary" onClick={handleNew}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              style={{ marginRight: 4 }}>
              <path d="M12 5v14M5 12h14" />
            </svg>
            新增流程
          </Btn>
        )}
      </div>

      {/* ============================================================ */}
      {/*  LIST VIEW                                                    */}
      {/* ============================================================ */}
      {!editingId && (
        <div className="aw-doc-tbl-wrap" style={{ border: 0, borderRadius: 0 }}>
          <div className="aw-doc-tbl-inner">
            <table className="aw-doc-tbl">
              <thead>
                <tr>
                  <th><div className="aw-th-inner">流程名称</div></th>
                  <th><div className="aw-th-inner">适用分类</div></th>
                  <th style={{ width: 80 }}><div className="aw-th-inner">节点数</div></th>
                  <th style={{ width: 100 }}><div className="aw-th-inner">创建人</div></th>
                  <th style={{ width: 170 }}><div className="aw-th-inner">更新时间</div></th>
                  <th style={{ width: 120 }}><div className="aw-th-inner">操作</div></th>
                </tr>
              </thead>
              <tbody>
                {flows.map(flow => (
                  <tr key={flow.id}>
                    <td>{flow.name}</td>
                    <td>{flow.category}</td>
                    <td className="aw-num">{flow.nodes.length}</td>
                    <td>{flow.creator}</td>
                    <td className="aw-num">{flow.updatedAt}</td>
                    <td>
                      <span className="aw-link" onClick={() => handleEdit(flow.id)}>编辑</span>
                      <span className="aw-link" style={{ marginLeft: 12 }} onClick={() => handleDelete(flow.id)}>删除</span>
                    </td>
                  </tr>
                ))}
                {flows.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '60px 0', textAlign: 'center', color: 'var(--aw-fg-4)' }}>
                      暂无审批流程
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/*  EDIT / NEW PANEL                                             */}
      {/* ============================================================ */}
      {editingId && (
        <div>
          {/* -- Basic info -- */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '14px 24px', marginBottom: 20, paddingTop: 8,
            borderTop: '1px solid var(--aw-divider)',
          }}>
            <Field label="流程名称" req>
              <Input
                placeholder="请输入流程名称"
                value={editData.name}
                onChange={e => upField('name', e.target.value)}
              />
            </Field>
            <Field label="适用分类">
              <Select value={editData.category} onChange={e => upField('category', e.target.value)}>
                <option>全部</option>
                <option>文档库</option>
                <option>项目库</option>
                <option>产品中心</option>
              </Select>
            </Field>
          </div>

          {/* -- Node chain -- */}
          <div className="aw-section-title">审批节点</div>
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 0,
            overflowX: 'auto', paddingBottom: 8,
          }}>
            {editData.nodes.map((node, idx) => (
              <React.Fragment key={node.id}>
                {/* arrow connector */}
                {idx > 0 && (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 40, minHeight: 220, flex: 'none',
                    fontSize: 18, color: 'var(--aw-fg-4)', userSelect: 'none',
                  }}>
                    →
                  </div>
                )}

                {/* node card */}
                <div
                  onClick={() => setSelectedNid(node.id)}
                  style={{
                    border: selectedNid === node.id
                      ? '1px solid #5677FC'
                      : '1px solid var(--aw-border)',
                    borderRadius: 8, padding: 16, minWidth: 220, flex: 'none',
                    background: 'var(--aw-surface)', cursor: 'pointer',
                    transition: 'border-color .15s', position: 'relative',
                  }}
                  onMouseEnter={e => { if (selectedNid !== node.id) e.currentTarget.style.borderColor = '#5677FC'; }}
                  onMouseLeave={e => { if (selectedNid !== node.id) e.currentTarget.style.borderColor = 'var(--aw-border)'; }}
                >
                  {/* remove btn */}
                  {editData.nodes.length > 1 && (
                    <span
                      onClick={e => { e.stopPropagation(); removeNode(idx); }}
                      style={{
                        position: 'absolute', top: 6, right: 8,
                        cursor: 'pointer', color: 'var(--aw-fg-4)', lineHeight: 1,
                      }}
                      title="删除节点"
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--aw-danger)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--aw-fg-4)'; }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </span>
                  )}

                  <div style={{
                    fontSize: 12, color: 'var(--aw-fg-3)',
                    marginBottom: 12, fontWeight: 500,
                  }}>
                    节点 {idx + 1}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {/* node name */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={{ fontSize: 12, color: 'var(--aw-fg-2)' }}>节点名称</label>
                      <Input
                        placeholder="填写审批节点名称"
                        value={node.name}
                        onChange={e => upNode(idx, 'name', e.target.value)}
                        onClick={e => e.stopPropagation()}
                      />
                    </div>

                    {/* approver — click opens PersonPickerModal */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={{ fontSize: 12, color: 'var(--aw-fg-2)' }}>审批人</label>
                      <div
                        onClick={e => { e.stopPropagation(); openApproverPicker(idx); }}
                        style={{
                          minHeight: 32, padding: '4px 8px',
                          background: 'var(--aw-bg)',
                          border: '1px solid transparent',
                          borderRadius: 'var(--aw-radius-md)',
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4,
                          fontSize: 13,
                          transition: 'all .15s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = 'var(--aw-primary)';
                          e.currentTarget.style.background = 'var(--aw-surface)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = 'transparent';
                          e.currentTarget.style.background = 'var(--aw-bg)';
                        }}
                      >
                        {node.approvers.length === 0 ? (
                          <span style={{ color: 'var(--aw-fg-4)' }}>请选择负责人</span>
                        ) : (
                          node.approvers.map(name => (
                            <span key={name} style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              padding: '1px 6px 1px 8px', borderRadius: 10,
                              background: 'var(--aw-primary-soft)', color: 'var(--aw-primary)',
                              fontSize: 12, fontWeight: 500,
                            }}>
                              {name}
                              <span
                                onClick={e => { e.stopPropagation(); removeApprover(idx, name); }}
                                style={{
                                  cursor: 'pointer', lineHeight: 1,
                                  display: 'inline-flex', alignItems: 'center',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.color = 'var(--aw-danger)'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = 'var(--aw-primary)'; }}
                              >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                  <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                              </span>
                            </span>
                          ))
                        )}
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: 20, height: 20, borderRadius: '50%',
                          color: 'var(--aw-fg-4)', fontSize: 14,
                        }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M12 5v14M5 12h14" />
                          </svg>
                        </span>
                      </div>
                    </div>

                    {/* approval method */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={{ fontSize: 12, color: 'var(--aw-fg-2)' }}>审批方式</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <Radio on={node.method === 'sequential'} onClick={() => upNode(idx, 'method', 'sequential')}>
                          依次审批
                        </Radio>
                        <span style={{ fontSize: 11, color: 'var(--aw-fg-4)', marginLeft: 20, marginTop: -4 }}>
                          按先后顺序，一人同意才流转到下一人
                        </span>
                        <Radio on={node.method === 'countersign'} onClick={() => upNode(idx, 'method', 'countersign')}>
                          会签
                        </Radio>
                        <span style={{ fontSize: 11, color: 'var(--aw-fg-4)', marginLeft: 20, marginTop: -4 }}>
                          所选人员必须全部审批后进入下一节点
                        </span>
                        <Radio on={node.method === 'or-sign'} onClick={() => upNode(idx, 'method', 'or-sign')}>
                          或签
                        </Radio>
                        <span style={{ fontSize: 11, color: 'var(--aw-fg-4)', marginLeft: 20, marginTop: -4 }}>
                          选中的人里只要有一人同意即可
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            ))}

            {/* trailing arrow */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 40, minHeight: 220, flex: 'none',
              fontSize: 18, color: 'var(--aw-fg-4)', userSelect: 'none',
            }}>
              →
            </div>

            {/* add-node dashed card */}
            <div
              onClick={addNode}
              style={{
                border: '1px dashed var(--aw-border-strong)',
                borderRadius: 8, padding: 16, minWidth: 220, flex: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', minHeight: 220,
                color: 'var(--aw-fg-3)', fontSize: 14,
                transition: 'all .15s', background: 'var(--aw-surface-2)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#5677FC';
                e.currentTarget.style.color = '#5677FC';
                e.currentTarget.style.background = 'var(--aw-primary-soft)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--aw-border-strong)';
                e.currentTarget.style.color = 'var(--aw-fg-3)';
                e.currentTarget.style.background = 'var(--aw-surface-2)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                style={{ marginRight: 6 }}>
                <path d="M12 5v14M5 12h14" />
              </svg>
              添加节点
            </div>
          </div>

          {/* -- Bottom buttons -- */}
          <div style={{
            display: 'flex', justifyContent: 'flex-end', gap: 8,
            marginTop: 20, paddingTop: 16,
            borderTop: '1px solid var(--aw-divider)',
          }}>
            <Btn onClick={handleCancel}>取消</Btn>
            <Btn kind="primary" onClick={handleSave}>保存</Btn>
          </div>
        </div>
      )}

    </Card>

      {/* ============================================================ */}
      {/*  PERSON PICKER MODAL (outside Card)                           */}
      {/* ============================================================ */}
      {approverPickerIdx != null && typeof PersonPickerModal === 'function' && (
        <PersonPickerModal
          onClose={() => setApproverPickerIdx(null)}
          onConfirm={handlePersonPicked}
        />
      )}
    </>
  );
}

Object.assign(window, { ApprovalFlowScreen });
