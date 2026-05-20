// person-picker.jsx — session 260515-fleet-bay
// ================================================================
// 组件：PersonPickerModal — 选择负责人弹窗（穿梭框）
//
// 调用方式（参照 NewContractModal 模式，支持多选）：
//   const [showPicker, setShowPicker] = useState(false);
//   {showPicker && <PersonPickerModal
//     onClose={() => setShowPicker(false)}
//     onConfirm={(persons) => { ... }}  // persons: [{ id, name, role, phone }, ...]
//   />}
//
// Props:
//   onClose    () => void              关闭弹窗
//   onConfirm  (persons: object[]) => void  确认选择，persons 为数组，每项结构：
//              { id: string, name: string, role: string, phone: string }
//
// 注册：Object.assign(window, { PersonPickerModal })
// 引入：<script type="text/babel" src="person-picker.jsx"></script>
// 弹窗尺寸：760px × 80vh，左组织树 220px + 右人员表
// ================================================================
const { useState, useMemo } = React;

/* 按部门组织的人员数据（穿梭框源数据） */
const DEPT_PERSONS = {
  '傲为智慧有限公司': [],
  '采购部': [
    { id: '100001', name: '丁昌容', role: '采购人员', phone: '13500001111' },
    { id: '100002', name: '纪广',   role: '采购人员', phone: '13500002222' },
    { id: '100003', name: '庞慧',   role: '采购人员', phone: '13500003333' },
    { id: '100004', name: '顾伦',   role: '采购人员', phone: '13500004444' }
  ],
  '采购一部': [
    { id: '100001', name: '丁昌容', role: '采购人员', phone: '13500001111' },
    { id: '100002', name: '纪广',   role: '采购人员', phone: '13500002222' }
  ],
  '采购二部': [
    { id: '100003', name: '庞慧',   role: '采购人员', phone: '13500003333' },
    { id: '100004', name: '顾伦',   role: '采购人员', phone: '13500004444' }
  ],
  '设计部': [
    { id: '200001', name: '林悦',   role: 'UI 设计师',   phone: '13600001111' },
    { id: '200002', name: '何志远', role: '平面设计师', phone: '13600002222' }
  ],
  '产品部': [
    { id: '300001', name: '苏婉清', role: '产品经理', phone: '13700001111' },
    { id: '300002', name: '赵一鸣', role: '产品经理', phone: '13700002222' }
  ],
  '销售部': [
    { id: '400001', name: '陈志强', role: '销售经理', phone: '13800001111' },
    { id: '400002', name: '刘芳',   role: '销售代表', phone: '13800002222' }
  ]
};

/* 组织树 */
const ORG_TREE = {
  name: '傲为智慧有限公司',
  children: [
    { name: '采购部', children: [{ name: '采购一部' }, { name: '采购二部' }] },
    { name: '设计部', children: [] },
    { name: '产品部', children: [] },
    { name: '销售部', children: [] }
  ]
};

function PersonPickerModal({ onClose, onConfirm }) {
  const [selectedOrg, setSelectedOrg] = useState('采购部');
  const [selectedPersons, setSelectedPersons] = useState([]);

  const togglePerson = (p) => {
    setSelectedPersons((prev) =>
      prev.some((sp) => sp.id === p.id)
        ? prev.filter((sp) => sp.id !== p.id)
        : [...prev, p]
    );
  };
  const [expandedOrgs, setExpandedOrgs] = useState(new Set(['傲为智慧有限公司', '采购部']));
  const [search, setSearch] = useState('');

  // 收集选中部门及其所有子部门的人员
  const filteredPersons = useMemo(() => {
    const collectChildDepts = (node) => {
      const depts = [node.name];
      if (node.children) {
        node.children.forEach((c) => { depts.push(...collectChildDepts(c)); });
      }
      return depts;
    };

    // 找到选中节点
    const findNode = (node) => {
      if (node.name === selectedOrg) return node;
      if (node.children) {
        for (const c of node.children) {
          const found = findNode(c);
          if (found) return found;
        }
      }
      return null;
    };

    const node = findNode(ORG_TREE);
    if (!node) return [];

    const depts = collectChildDepts(node);
    const set = new Set();
    const result = [];
    depts.forEach((d) => {
      (DEPT_PERSONS[d] || []).forEach((p) => {
        if (!set.has(p.id)) { set.add(p.id); result.push(p); }
      });
    });
    return result;
  }, [selectedOrg]);

  // 全选 / 反选（依赖 filteredPersons，须在其后定义）
  const allChecked = filteredPersons.length > 0 && filteredPersons.every((p) => selectedPersons.some((sp) => sp.id === p.id));
  const toggleSelectAll = () => {
    if (allChecked) { setSelectedPersons([]); }
    else { setSelectedPersons([...filteredPersons]); }
  };

  const toggleExpand = (name) => {
    const next = new Set(expandedOrgs);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setExpandedOrgs(next);
  };

  const handleConfirm = () => {
    if (selectedPersons.length > 0) onConfirm(selectedPersons);
  };

  const renderTree = (node, level) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedOrgs.has(node.name);
    const isSelected = selectedOrg === node.name;
    const lvlClass = level === 1 ? ' aw-tree-l2' : level >= 2 ? ' aw-tree-l3' : '';

    return (
      <React.Fragment key={node.name}>
        <div
          className={'aw-tree-row' + lvlClass + (isSelected ? ' on' : '')}
          onClick={() => {
            setSelectedOrg(node.name);
            setSelectedPersons([]);
            if (hasChildren) toggleExpand(node.name);
          }}
        >
          <span className="aw-tree-caret">
            {hasChildren ? (isExpanded ? '▼' : '▶') : ''}
          </span>
          {node.name}
        </div>
        {hasChildren && isExpanded && node.children.map((c) => renderTree(c, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="aw-mask" onClick={onClose}>
      <div className="aw-modal picker" style={{ width: 'min(760px,94vw)' }} onClick={(e) => e.stopPropagation()}>
        <div className="head">
          选择负责人
          <span style={{ cursor: 'pointer', color: '#9CA3AF' }} onClick={onClose}>✕</span>
        </div>
        <div className="body" style={{ padding: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 0, height: '480px' }}>
            {/* 左列 — 穿梭框源：组织架构 */}
            <div style={{ borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '10px 12px', borderBottom: '1px solid #F0F1F4', display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <Input placeholder="搜索" value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1 }} />
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
                {renderTree(ORG_TREE, 0)}
              </div>
            </div>
            {/* 右列 — 穿梭框目标：选中部门的人员 */}
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* 当前部门标识 */}
              <div style={{
                padding: '10px 12px', borderBottom: '1px solid #F0F1F4',
                fontSize: '13px', color: 'var(--aw-fg-2)',
                background: 'var(--aw-surface-2)', display: 'flex', alignItems: 'center', gap: 8
              }}>
                <span style={{ fontWeight: 500, color: 'var(--aw-fg-1)' }}>{selectedOrg}</span>
                <span style={{ color: 'var(--aw-fg-3)' }}>共 {filteredPersons.length} 人</span>
              </div>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {filteredPersons.length === 0 ? (
                  <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--aw-fg-3)', fontSize: '13px' }}>
                    该部门暂无人员
                  </div>
                ) : (
                  <table className="aw-doc-tbl">
                    <thead>
                      <tr>
                        <th style={{ width: 40 }}><div className="aw-th-inner"><span className={'aw-chk' + (allChecked ? ' on' : '')} onClick={(e) => { e.stopPropagation(); toggleSelectAll(); }} /></div></th>
                        <th><div className="aw-th-inner">姓名</div></th>
                        <th><div className="aw-th-inner">编号</div></th>
                        <th><div className="aw-th-inner">角色</div></th>
                        <th><div className="aw-th-inner">联系电话</div></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPersons.map((p) => {
                        const isSel = selectedPersons.some((sp) => sp.id === p.id);
                        return (
                        <tr
                          key={p.id}
                          onClick={() => togglePerson(p)}
                          style={isSel ? { background: '#EEF1FF' } : undefined}
                        >
                          <td style={isSel ? { background: '#EEF1FF' } : undefined}>
                            <span className={'aw-chk' + (isSel ? ' on' : '')} onClick={(e) => { e.stopPropagation(); togglePerson(p); }} />
                          </td>
                          <td style={isSel ? { background: '#EEF1FF' } : undefined}>{p.name}</td>
                          <td style={isSel ? { background: '#EEF1FF' } : undefined}><span className="aw-num">{p.id}</span></td>
                          <td style={isSel ? { background: '#EEF1FF' } : undefined}>{p.role}</td>
                          <td style={isSel ? { background: '#EEF1FF' } : undefined}>{p.phone}</td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="foot">
          <Btn onClick={onClose}>取消</Btn>
          <Btn kind="primary" onClick={handleConfirm}>确认</Btn>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PersonPickerModal });
