// session: 260514-amber-orbit
// PrintTemplateScreen — 打印模板（列表页 → 编辑器 两态导航）
const { useState, useRef, useEffect } = React;

function PrintTemplateScreen({ module: mod = MODULE_DOC }) {
  const m = mod || MODULE_DOC;
  // ═══ 导航状态 ═══
  const [view, setView] = useState('list');         // 'list' | 'editor'
  const [editTarget, setEditTarget] = useState(null);

  // ═══ 模板数据 ═══
  const [templates, setTemplates] = useState([
    { id: 1, name: '标准文档模板', updatedAt: '2025-12-10', isDefault: true },
    { id: 2, name: '精简版模板',   updatedAt: '2025-11-28', isDefault: false },
    { id: 3, name: '带页眉页脚',   updatedAt: '2025-10-15', isDefault: false },
  ]);

  // ═══ 编辑器状态 ═══
  const [templateName, setTemplateName] = useState('');
  const [paper,  setPaper]  = useState('A4');
  const [orient, setOrient] = useState('portrait');
  const [fontSz, setFontSz] = useState('14px');
  const [paperProp,  setPaperProp]  = useState('A4');
  const [margin,     setMargin]     = useState('20mm');
  const [copies,     setCopies]     = useState('1');
  const [showHeader, setShowHeader] = useState(true);
  const [showFooter, setShowFooter] = useState(true);
  const [showPageNum,setShowPageNum]= useState(true);

  const editorRef = useRef(null);

  // ═══ 进入编辑器时重置状态 ═══
  useEffect(() => {
    if (view === 'editor') {
      setTemplateName(editTarget ? editTarget.name : '');
      setPaper('A4'); setOrient('portrait'); setFontSz('14px');
      setPaperProp('A4'); setMargin('20mm'); setCopies('1');
      setShowHeader(true); setShowFooter(true); setShowPageNum(true);
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML =
            '<div style="color:#9CA3AF;font-size:13px;margin-bottom:12px">请从左侧拖拽字段，或直接输入内容…</div>' +
            '<span style="display:inline-block;background:#EEF1FF;color:#5677FC;border:1px solid #C7D4FD;border-radius:3px;padding:1px 7px;font-size:12px;margin:0 2px;user-select:none" contenteditable="false">{{文档名称}}</span>';
        }
      }, 0);
    }
  }, [view, editTarget]);

  // ═══ 列表页操作 ═══
  const handleDelete = (id) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSetDefault = (id) => {
    setTemplates((prev) => prev.map((t) => ({ ...t, isDefault: t.id === id })));
  };

  const handleEdit = (item) => {
    setEditTarget(item);
    setView('editor');
  };

  const handleNew = () => {
    setEditTarget(null);
    setView('editor');
  };

  // ═══ 编辑器操作 ═══
  const handleSave = () => {
    const name = templateName.trim();
    if (!name) return;
    if (editTarget) {
      setTemplates((prev) => prev.map((t) => (t.id === editTarget.id ? { ...t, name, updatedAt: new Date().toISOString().slice(0, 10) } : t)));
    } else {
      const newId = Math.max(...templates.map((t) => t.id), 0) + 1;
      setTemplates((prev) => [...prev, { id: newId, name, updatedAt: new Date().toISOString().slice(0, 10), isDefault: false }]);
    }
    setView('list');
    setEditTarget(null);
  };

  // ═══ 拖拽字段到编辑器 ═══
  const handleDragStart = (label) => (e) => {
    e.dataTransfer.setData('text/plain', label);
    e.dataTransfer.effectAllowed = 'copy';
  };
  const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; };
  const handleDrop = (e) => {
    e.preventDefault();
    const label = e.dataTransfer.getData('text/plain');
    if (!label || !editorRef.current) return;
    const span = document.createElement('span');
    span.textContent = `{{${label}}}`;
    span.setAttribute('contenteditable', 'false');
    span.style.cssText = 'display:inline-block;background:#EEF1FF;color:#5677FC;border:1px solid #C7D4FD;border-radius:3px;padding:1px 7px;font-size:12px;margin:0 2px;user-select:none';
    editorRef.current.focus();
    const sel = window.getSelection();
    if (sel && sel.rangeCount) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(span);
      range.setStartAfter(span);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      editorRef.current.appendChild(span);
    }
  };

  // ═══ 富文本命令 ═══
  const execCmd = (cmd, val) => (e) => {
    e.preventDefault();
    document.execCommand(cmd, false, val || null);
    editorRef.current && editorRef.current.focus();
  };

  // ═══ 样式按钮 hover ═══
  const tbBase = { cursor: 'pointer', padding: '2px 6px', borderRadius: 3, color: 'var(--aw-fg-2)', fontSize: 13, userSelect: 'none' };
  const tbEnter = (e) => { e.currentTarget.style.color = 'var(--aw-primary)'; e.currentTarget.style.background = '#fff'; };
  const tbLeave = (e) => { e.currentTarget.style.color = 'var(--aw-fg-2)'; e.currentTarget.style.background = ''; };

  // ═══ 字段面板数据 ═══
  const fieldGroups = [
    { title: '基本信息', items: [
      { label: '文档编号', key: 'docNo' },   { label: '文档名称', key: 'docName' },
      { label: '版本号',   key: 'version' }, { label: '编制人',   key: 'author' },
      { label: '生效日期', key: 'effDate' }, { label: '失效日期', key: 'expDate' },
    ]},
    { title: '自定义字段', items: [
      { label: '自定义字段1', key: 'custom1' }, { label: '自定义字段2', key: 'custom2' },
    ]},
    { title: '系统字段', items: [
      { label: '创建时间', key: 'createdAt' }, { label: '创建人',   key: 'creator' },
      { label: '所属分类', key: 'category' },
    ]},
  ];

  const filtered = templates;

  // ═══ 列表页 ═══
  if (view === 'list') {
    return (
      <Card>
        {/* 顶部栏 — 与审批流程一致 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 0,
        }}>
          <div className="aw-section-title" style={{ marginBottom: 0 }}>打印模板列表</div>
          <Btn kind="primary" onClick={handleNew}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              style={{ marginRight: 4 }}>
              <path d="M12 5v14M5 12h14" />
            </svg>
            新增模板
          </Btn>
        </div>

        {/* 表格 */}
        <div className="aw-doc-tbl-wrap" style={{ border: 0, borderRadius: 0, marginTop: 14 }}>
          <div className="aw-doc-tbl-inner">
            <table className="aw-doc-tbl">
              <thead>
                <tr>
                  <th><div className="aw-th-inner">模板名称</div></th>
                  <th style={{ width: 120 }}><div className="aw-th-inner">默认状态</div></th>
                  <th style={{ width: 170 }}><div className="aw-th-inner">更新时间</div></th>
                  <th style={{ width: 120 }}><div className="aw-th-inner">操作</div></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 500 }}>{t.name}</td>
                    <td>
                      {t.isDefault ? (
                        <Badge>默认</Badge>
                      ) : (
                        <span className="aw-link" onClick={() => handleSetDefault(t.id)}>设为默认</span>
                      )}
                    </td>
                    <td className="aw-num">{t.updatedAt}</td>
                    <td>
                      <span className="aw-link" onClick={() => handleEdit(t)}>编辑</span>
                      <span className="aw-link" style={{ marginLeft: 12 }} onClick={() => handleDelete(t.id)}>删除</span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: '60px 0', textAlign: 'center', color: 'var(--aw-fg-4)' }}>
                      暂无打印模板
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    );
  }

  // ═══ 编辑器页 ═══
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', overflow: 'hidden' }}>

      {/* 顶部面包屑导航栏 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: '#fff', border: '1px solid var(--aw-border)', borderRadius: '8px 8px 0 0', flex: 'none' }}>
        <span className="aw-link" onClick={() => { setView('list'); setEditTarget(null); }} style={{ fontSize: 13 }}>← 返回列表</span>
        <div style={{ flex: 1 }} />
        <input
          className="aw-input"
          placeholder="请输入模板名称"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          style={{ width: 200, fontSize: 14, fontWeight: 600, border: '1px solid #E5E7EB', borderRadius: 6, padding: '4px 10px', background: '#fff' }}
        />
        <Btn onClick={() => { setView('list'); setEditTarget(null); }}>取消</Btn>
        <Btn kind="primary" onClick={handleSave}>保存模板</Btn>
      </div>

      {/* 三列编辑区 */}
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 220px', flex: 1, border: '1px solid var(--aw-border)', borderTop: 0, borderRadius: '0 0 8px 8px', overflow: 'hidden', marginTop: 0 }}>

        {/* ═══ 左列 — 字段面板 ═══ */}
        <div style={{ background: '#fff', borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 14px 8px', fontSize: 13, fontWeight: 600, borderBottom: '1px solid #F0F1F4' }}>可用字段</div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {fieldGroups.map((g) => (
              <div key={g.title}>
                <div style={{ fontSize: 11, color: '#9CA3AF', padding: '10px 14px 4px', fontWeight: 500, letterSpacing: '.5px' }}>{g.title}</div>
                {g.items.map((f) => (
                  <div
                    key={f.key}
                    draggable
                    onDragStart={handleDragStart(f.label)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', fontSize: 13, cursor: 'grab', transition: 'background .15s, color .15s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#F5F6FA'; e.currentTarget.style.color = '#5677FC'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.color = ''; }}
                  >
                    <span style={{ color: '#D1D5DB', userSelect: 'none', lineHeight: 1, fontSize: 12 }}>⠿</span>
                    {f.label}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ═══ 中列 — 画布区 ═══ */}
        <div style={{ background: '#F5F6FA', padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* 顶部工具栏 */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '6px 10px', background: 'var(--aw-surface-2)', border: '1px solid var(--aw-border)', borderRadius: 6, fontSize: 13, color: 'var(--aw-fg-2)', width: '100%', maxWidth: 595, alignSelf: 'center' }}>
            <Select value={paper} onChange={(e) => setPaper(e.target.value)} style={{ width: 72, flex: 'none' }}>
              <option value="A4">A4</option>
              <option value="A3">A3</option>
            </Select>
            <Select value={orient} onChange={(e) => setOrient(e.target.value)} style={{ width: 72, flex: 'none' }}>
              <option value="portrait">纵向</option>
              <option value="landscape">横向</option>
            </Select>
            <div style={{ width: 1, height: 20, background: '#E5E7EB', flex: 'none' }} />
            <Select value={fontSz} onChange={(e) => setFontSz(e.target.value)} style={{ width: 72, flex: 'none' }}>
              <option value="12px">12px</option>
              <option value="14px">14px</option>
              <option value="16px">16px</option>
            </Select>
            <span onMouseDown={execCmd('bold')}        style={{ ...tbBase, fontWeight: 700 }} onMouseEnter={tbEnter} onMouseLeave={tbLeave}>B</span>
            <span onMouseDown={execCmd('italic')}      style={{ ...tbBase, fontStyle: 'italic' }} onMouseEnter={tbEnter} onMouseLeave={tbLeave}>I</span>
            <span onMouseDown={execCmd('underline')}   style={{ ...tbBase, textDecoration: 'underline' }} onMouseEnter={tbEnter} onMouseLeave={tbLeave}>U</span>
            <span onMouseDown={execCmd('justifyLeft')}  style={{ ...tbBase, fontSize: 11 }} onMouseEnter={tbEnter} onMouseLeave={tbLeave}>左对齐</span>
            <span onMouseDown={execCmd('justifyCenter')}style={{ ...tbBase, fontSize: 11 }} onMouseEnter={tbEnter} onMouseLeave={tbLeave}>居中</span>
            <span onMouseDown={execCmd('justifyRight')} style={{ ...tbBase, fontSize: 11 }} onMouseEnter={tbEnter} onMouseLeave={tbLeave}>右对齐</span>
          </div>

          {/* A4 纸张预览 */}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            style={{
              background: '#fff', border: '1px solid #E5E7EB', borderRadius: 4,
              maxWidth: 595, width: '100%', margin: '0 auto', minHeight: 842,
              padding: '40px 48px', boxShadow: '0 2px 8px rgba(16,24,40,.06)',
              outline: 'none', fontSize: fontSz, lineHeight: 1.8, color: '#1F2937',
            }}
          />
        </div>

        {/* ═══ 右列 — 属性面板 ═══ */}
        <div style={{ background: '#fff', borderLeft: '1px solid #E5E7EB', padding: 14, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>属性设置</div>

          {/* 页面设置 */}
          <div className="section-title" style={{ fontSize: 13, marginBottom: 10 }}>页面设置</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="纸张尺寸">
              <Select value={paperProp} onChange={(e) => setPaperProp(e.target.value)}>
                <option value="A4">A4</option>
                <option value="A3">A3</option>
                <option value="Letter">Letter</option>
              </Select>
            </Field>
            <Field label="页边距">
              <Select value={margin} onChange={(e) => setMargin(e.target.value)}>
                <option value="20mm">普通 20mm</option>
                <option value="10mm">窄 10mm</option>
                <option value="25mm">宽 25mm</option>
              </Select>
            </Field>
            <Field label="打印份数">
              <Input type="number" defaultValue="1" onChange={(e) => setCopies(e.target.value)} />
            </Field>
          </div>

          {/* 页眉页脚 */}
          <div className="section-title" style={{ fontSize: 13, marginTop: 16, marginBottom: 10 }}>页眉页脚</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Switch on={showHeader} onChange={setShowHeader} />
              <span style={{ fontSize: 13, color: 'var(--aw-fg-2)' }}>显示页眉</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Switch on={showFooter} onChange={setShowFooter} />
              <span style={{ fontSize: 13, color: 'var(--aw-fg-2)' }}>显示页脚</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Switch on={showPageNum} onChange={setShowPageNum} />
              <span style={{ fontSize: 13, color: 'var(--aw-fg-2)' }}>显示页码</span>
            </div>
          </div>

          {/* 底部按钮 */}
          <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #F0F1F4', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Btn>预览</Btn>
            <Btn kind="primary" onClick={handleSave}>保存模板</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PrintTemplateScreen });
