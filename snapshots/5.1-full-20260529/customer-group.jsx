// ui_kits/erp-console/customer-group.jsx
// 客户分组 — 列表 / 新增 / 编辑
const { useState: useCustomerGroupState } = React;

function CustomerGroupScreen({ module: mod }) {
  const [groups, setGroups] = useCustomerGroupState([
    { id:1, name:'重点客户', parentId:null, parentName:null, level:1, code:'CUST_GRP_KEY', description:'年度重点维护客户，优先配置销售资源', tags:{ level:'A级', status:'已审核', credit:'月结30天' }, customerCount:86 },
    { id:2, name:'战略客户', parentId:null, parentName:null, level:1, code:'CUST_GRP_STRATEGIC', description:'长期战略合作客户', tags:{ level:'A级', status:'跟进中', credit:'授信额度' }, customerCount:42 },
    { id:3, name:'普通客户', parentId:null, parentName:null, level:1, code:'CUST_GRP_NORMAL', description:'常规交易客户', tags:{ level:'B级', status:'已审核', credit:'现结' }, customerCount:95 },
    { id:4, name:'渠道客户', parentId:null, parentName:null, level:1, code:'CUST_GRP_CHANNEL', description:'经销商、代理商等渠道客户', tags:{ level:'B级', status:'已审核', credit:'月结15天' }, customerCount:15 },
    { id:5, name:'华南重点客户', parentId:1, parentName:'重点客户', level:2, code:'CUST_GRP_KEY_SC', description:'华南区域重点客户', tags:{ level:'A级', status:null, credit:'月结30天' }, customerCount:28 },
  ]);
  const [view, setView] = useCustomerGroupState('list');
  const [editId, setEditId] = useCustomerGroupState(null);
  const [searchText, setSearchText] = useCustomerGroupState('');
  const emptyForm = { name:'', parentId:'', code:'', description:'', defaultLevel:'', defaultStatus:'', defaultCredit:'' };
  const [form, setForm] = useCustomerGroupState({ ...emptyForm });

  const parentOptions = groups.filter(g => g.level < 2 && g.id !== editId);
  const filteredGroups = groups.filter(g => !searchText || g.name.includes(searchText) || g.code.includes(searchText));
  const levelLabel = (level) => `第${level}级`;
  const formatTags = (tags) => [tags.level, tags.status, tags.credit].filter(Boolean).join(' | ') || '未设置';
  const getLevel = (parentId) => {
    if (!parentId) return 1;
    const parent = groups.find(g => g.id === Number(parentId));
    return parent ? parent.level + 1 : 1;
  };
  const openNew = () => {
    setForm({ ...emptyForm });
    setEditId(null);
    setView('new');
  };
  const openEdit = (row) => {
    setEditId(row.id);
    setForm({
      name:row.name,
      parentId:row.parentId ? String(row.parentId) : '',
      code:row.code || '',
      description:row.description || '',
      defaultLevel:row.tags.level || '',
      defaultStatus:row.tags.status || '',
      defaultCredit:row.tags.credit || '',
    });
    setView('edit');
  };
  const openAddChild = (row) => {
    setForm({ ...emptyForm, parentId:String(row.id) });
    setEditId(null);
    setView('new');
  };
  const handleSave = () => {
    if (!form.name.trim()) return;
    const parentId = form.parentId ? Number(form.parentId) : null;
    const parent = parentId ? groups.find(g => g.id === parentId) : null;
    const level = getLevel(form.parentId);
    if (view === 'new') {
      const id = Math.max(0, ...groups.map(g => g.id)) + 1;
      setGroups(prev => [...prev, {
        id,
        name:form.name.trim(),
        parentId,
        parentName:parent ? parent.name : null,
        level,
        code:form.code.trim() || `CUST_GRP_${String(id).padStart(3, '0')}`,
        description:form.description.trim(),
        tags:{ level:form.defaultLevel || null, status:form.defaultStatus || null, credit:form.defaultCredit || null },
        customerCount:0,
      }]);
    } else {
      setGroups(prev => prev.map(g => g.id === editId ? {
        ...g,
        name:form.name.trim(),
        parentId,
        parentName:parent ? parent.name : null,
        level,
        code:form.code.trim() || g.code,
        description:form.description.trim(),
        tags:{ level:form.defaultLevel || null, status:form.defaultStatus || null, credit:form.defaultCredit || null },
      } : g));
    }
    setView('list');
  };
  const removeGroup = (row) => {
    const ids = [row.id, ...groups.filter(g => g.parentId === row.id).map(g => g.id)];
    setGroups(prev => prev.filter(g => !ids.includes(g.id)));
  };

  if (view !== 'list') {
    return (
      <div className="aw-doc-form">
        <div className="aw-doc-form-head">
          <span className="aw-link" onClick={() => setView('list')}>← 返回列表</span>
          <span style={{flex:1}} />
          <button className="aw-btn" onClick={() => setView('list')}>取消</button>
          <button className="aw-btn primary" onClick={handleSave}>保存</button>
        </div>
        <div className="aw-doc-form-body">
          <Card title={view === 'new' ? '新增客户分组' : '编辑客户分组'}>
            <div className="aw-doc-grid" style={{gridTemplateColumns:'1fr 1fr'}}>
              <Field label="分组名称" req><Input value={form.name} onChange={e => setForm(f => ({...f, name:e.target.value}))} placeholder="请输入分组名称" /></Field>
              <Field label="上级分组"><Select value={form.parentId} onChange={e => setForm(f => ({...f, parentId:e.target.value}))}><option value="">无上级分组</option>{parentOptions.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</Select></Field>
              <Field label="分组编号"><Input value={form.code} onChange={e => setForm(f => ({...f, code:e.target.value}))} placeholder="为空时系统自动生成" /></Field>
              <Field label="默认客户等级"><Select value={form.defaultLevel} onChange={e => setForm(f => ({...f, defaultLevel:e.target.value}))}><option value="">请选择</option><option>A级</option><option>B级</option><option>C级</option></Select></Field>
              <Field label="默认客户状态"><Select value={form.defaultStatus} onChange={e => setForm(f => ({...f, defaultStatus:e.target.value}))}><option value="">请选择</option><option>待审核</option><option>跟进中</option><option>已审核</option><option>已停用</option></Select></Field>
              <Field label="默认信用政策"><Select value={form.defaultCredit} onChange={e => setForm(f => ({...f, defaultCredit:e.target.value}))}><option value="">请选择</option><option>现结</option><option>月结15天</option><option>月结30天</option><option>授信额度</option></Select></Field>
              <Field label="分组说明"><textarea className="aw-input" value={form.description} onChange={e => setForm(f => ({...f, description:e.target.value}))} placeholder="请输入分组说明" style={{height:90,resize:'vertical',padding:'8px 10px'}} /></Field>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="aw-doc-page">
      <div className="aw-doc-main">
        <div className="aw-doc-tb">
          <div className="aw-doc-search">
            <span style={{color:'var(--aw-fg-4)'}}>⌕</span>
            <input placeholder="搜索分组名称/编号" value={searchText} onChange={e => setSearchText(e.target.value)} />
          </div>
          <span style={{flex:1}} />
          <button className="aw-btn primary" onClick={openNew}>新增分组</button>
        </div>
        <div className="aw-doc-tbl-wrap">
          <div className="aw-doc-tbl-inner">
            <table className="aw-doc-tbl">
              <thead>
                <tr>
                  <th style={{width:60}}><div className="aw-th-inner">序号</div></th>
                  <th style={{width:180}}><div className="aw-th-inner">分组名称</div></th>
                  <th style={{width:130}}><div className="aw-th-inner">上级分组</div></th>
                  <th style={{width:90}}><div className="aw-th-inner">层级</div></th>
                  <th style={{width:150}}><div className="aw-th-inner">分组编号</div></th>
                  <th><div className="aw-th-inner">默认属性</div></th>
                  <th style={{width:100}}><div className="aw-th-inner">客户数量</div></th>
                  <th style={{width:170}}><div className="aw-th-inner">操作</div></th>
                </tr>
              </thead>
              <tbody>
                {filteredGroups.map((row, i) => (
                  <tr key={row.id}>
                    <td className="aw-num">{i + 1}</td>
                    <td className="aw-link">{row.name}</td>
                    <td>{row.parentName || '无'}</td>
                    <td>{levelLabel(row.level)}</td>
                    <td className="aw-num">{row.code}</td>
                    <td>{formatTags(row.tags)}</td>
                    <td className="aw-num">{row.customerCount}</td>
                    <td>
                      <span className="aw-link" onClick={() => openEdit(row)}>编辑</span>
                      <span style={{margin:'0 8px',color:'var(--aw-divider)'}}>|</span>
                      <span className="aw-link" onClick={() => openAddChild(row)}>添加子分组</span>
                      <span style={{margin:'0 8px',color:'var(--aw-divider)'}}>|</span>
                      <span className="aw-link" style={{color:'var(--aw-danger)'}} onClick={() => removeGroup(row)}>删除</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

window.CustomerGroupScreen = CustomerGroupScreen;
