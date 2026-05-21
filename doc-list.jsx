// ui_kits/erp-console/doc-list.jsx
// 文档列表页 — 列表 / 新增 / 详情 三态

function DocListScreen({initialAction, onActionConsumed}) {
  const [view, setView] = React.useState('list'); // list | new | detail
  const [picked, setPicked] = React.useState('plan');
  React.useEffect(() => {
    if (initialAction === 'new') { setView('new'); onActionConsumed && onActionConsumed(); }
    else if (initialAction === 'list') { setView('list'); onActionConsumed && onActionConsumed(); }
  }, [initialAction]);
  const [tree] = React.useState([
    {k:'plan', label:'工艺方案', open:true, kids:[{k:'p1', label:'三级分类'},{k:'p2', label:'三级分类'}]},
    {k:'craft', label:'工艺文件', open:false, kids:[{k:'c1', label:'三级分类'},{k:'c2', label:'三级分类'}]},
    {k:'tech', label:'技术文档', open:false, kids:[{k:'t1', label:'三级分类'},{k:'t2', label:'三级分类'}]},
    {k:'spec', label:'操作规范', open:false, kids:[{k:'s1', label:'二级选项1'}]},
  ]);

  return (
    <div className="aw-doc-page">
      {view === 'list' && <DocTree tree={tree} picked={picked} setPicked={setPicked}/>}
      <div className="aw-doc-main">
        {view==='list'   && <DocListView   onNew={()=>setView('new')} onView={()=>setView('detail')} picked={picked}/>}
        {view==='new'    && <DocNewView    onBack={()=>setView('list')}/>}
        {view==='detail' && <DocDetailView onBack={()=>setView('list')}/>}
      </div>
    </div>
  );
}

function DocListView({onNew, onView, picked}){
  const cols = [
    {k:'code',  label:'文档编码', w:140},
    {k:'name',  label:'文档名称', w:220},
    {k:'type',  label:'类型',    w:120},
    {k:'state', label:'状态',    w:120, filter:['全部','已发布','待审核','已停用','草稿']},
    {k:'ver',   label:'版本',    w:80},
    {k:'owner', label:'编制人',  w:100},
    {k:'date',  label:'更新日期', w:120},
    {k:'op',    label:'操作',    w:80},
  ];
  // 分类树 key → 表格 type 映射
  const typeMap = { plan:'工艺方案', craft:'工艺文件', tech:'技术文档', spec:'操作规范' };
  const allRows = [
    {code:'DD-2024-001', name:'智能控制器标准规范', type:'工艺方案', state:'已发布', stTone:'g', ver:'V 1.0', owner:'傲为', date:'2025-12-12'},
    {code:'DD-2024-002', name:'嵌入式系统设计指南', type:'工艺方案', state:'已发布', stTone:'g', ver:'V 2.1', owner:'李文涛', date:'2025-11-20'},
    {code:'DD-2024-003', name:'生产线自动化方案', type:'工艺方案', state:'待审核', stTone:'y', ver:'V 0.5', owner:'陈思源', date:'2025-12-01'},
    {code:'DD-2024-011', name:'装配线巡检模板', type:'工艺文件', state:'已停用', stTone:'gray', ver:'V 1.2', owner:'陈思源', date:'2025-12-08'},
    {code:'DD-2024-012', name:'焊接作业指导书', type:'工艺文件', state:'已发布', stTone:'g', ver:'V 3.0', owner:'赵工', date:'2025-10-15'},
    {code:'DD-2024-013', name:'喷涂工艺规范', type:'工艺文件', state:'待审核', stTone:'y', ver:'V 0.8', owner:'王志强', date:'2025-12-05'},
    {code:'DD-2024-021', name:'数控加工技术手册', type:'技术文档', state:'已发布', stTone:'g', ver:'V 1.0', owner:'张明', date:'2025-09-18'},
    {code:'DD-2024-022', name:'PLC 编程规范', type:'技术文档', state:'草稿', stTone:'b', ver:'V 0.2', owner:'李文涛', date:'2025-12-12'},
    {code:'DD-2024-023', name:'传感器选型指南', type:'技术文档', state:'已发布', stTone:'g', ver:'V 2.3', owner:'陈思源', date:'2025-11-30'},
    {code:'DD-2024-031', name:'通用安全操作流程', type:'操作规范', state:'待审核', stTone:'y', ver:'V 0.3', owner:'李文涛', date:'2025-12-10'},
    {code:'DD-2024-032', name:'设备点检操作规程', type:'操作规范', state:'已发布', stTone:'g', ver:'V 1.1', owner:'赵工', date:'2025-08-22'},
    {code:'DD-2024-033', name:'化学品管理办法', type:'操作规范', state:'已停用', stTone:'gray', ver:'V 1.0', owner:'王志强', date:'2024-06-15'},
  ];
  // 根据左侧树选中分类过滤
  const matchedType = typeMap[picked];
  const rows = matchedType ? allRows.filter(r=>r.type===matchedType) : allRows;
  const total = 800;
  const pageSize = 10;
  // 全选 / 行选 状态在外层管理
  const [sel, setSel] = React.useState({});
  const allChecked = rows.length>0 && rows.every((_,i)=>sel[i]);
  const someChecked = rows.some((_,i)=>sel[i]);
  const toggleAll = () => {
    if (allChecked) setSel({});
    else { const n={}; rows.forEach((_,i)=>n[i]=true); setSel(n); }
  };
  const toggleRow = (i) => setSel(s=>({...s,[i]:!s[i]}));

  return (
    <>
      <DocToolbar onNew={onNew}/>
      <div className="aw-doc-tbl-wrap">
        <DocTable cols={cols} rows={rows} sel={sel} toggleRow={toggleRow} allChecked={allChecked} someChecked={someChecked} toggleAll={toggleAll} onView={onView}/>
        <DocFooter total={total} pageSize={pageSize} allChecked={allChecked} someChecked={someChecked} toggleAll={toggleAll} selCount={rows.filter((_,i)=>sel[i]).length}/>
      </div>
    </>
  );
}

function DocTree({tree, picked, setPicked}){
  return (
    <div className="aw-doc-tree">
      <div className="aw-doc-tree-h">文档库 <span className="aw-doc-tree-n">(999)</span></div>
      <div className="aw-doc-tree-list">
        {tree.map(n=>(
          <div key={n.k}>
            <div className={'aw-tree-row aw-tree-l2'+(picked===n.k?' on':'')} onClick={()=>setPicked(n.k)}>
              <span className="aw-tree-caret">{n.open?'▾':'▸'}</span>
              <TileIcon name="folder" size={14}/>
              <span>{n.label}</span>
            </div>
            {n.open && n.kids.map(c=>(
              <div key={c.k} className={'aw-tree-row aw-tree-l3'+(picked===c.k?' on':'')} onClick={()=>setPicked(c.k)}>
                <TileIcon name="doc" size={13}/>
                <span>{c.label}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function DocToolbar({onNew}){
  const [drawer, setDrawer] = React.useState(null); // null|'filter'|'field'|'import'|'export'
  return (
    <>
    <div className="aw-doc-tb">
      <div className="aw-doc-search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8"><circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/></svg>
        <input placeholder="全局搜索（如客户、产品名称、工单编号…）"/>
      </div>
      <RefreshAction />
      <button className="aw-btn" onClick={()=>setDrawer('filter')}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 5h18M6 12h12M10 19h4"/></svg>筛选</button>
      <button className="aw-btn" onClick={()=>setDrawer('field')}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="7" height="7"/><rect x="14" y="4" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>字段配置</button>
      <button className="aw-btn" onClick={()=>setDrawer('export')}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 4v12"/><path d="M7 11l5 5 5-5"/><path d="M4 20h16"/></svg>导出</button>
      <button className="aw-btn" onClick={()=>setDrawer('import')}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 20V8"/><path d="M7 13l5-5 5 5"/><path d="M4 4h16"/></svg>导入</button>
      <button className="aw-btn primary" onClick={onNew}>新增文档</button>
    </div>
    {drawer==='filter' && <FilterDrawer onClose={()=>setDrawer(null)}/>}
    {drawer==='field'  && <FieldDrawer  onClose={()=>setDrawer(null)}/>}
    {drawer==='import' && <ImportDrawer onClose={()=>setDrawer(null)}/>}
    {drawer==='export' && <ExportDrawer onClose={()=>setDrawer(null)}/>}
    </>
  );
}

// 新增文档页（用合同新增的卡片风格做单页表单版）
function DocNewView({onBack}){
  return (
    <div className="aw-doc-form">
      <div className="aw-doc-form-head">
        <span className="aw-link" onClick={onBack}>← 返回列表</span>
        <span style={{flex:1}}/>
        <button className="aw-btn" onClick={onBack}>取消</button>
        <button className="aw-btn">暂存</button>
        <button className="aw-btn primary">提交审批</button>
      </div>
      <div className="aw-doc-form-body">
        <Card title="基本信息">
          <div className="aw-doc-grid">
            <Field label="文档编号"><Input defaultValue="自动生成" disabled/></Field>
            <Field label="文档名称" req><Input placeholder="填写文档名称"/></Field>
            <Field label="文档类型" req>
              <Select><option>请选择</option><option>工艺方案</option><option>工艺文件</option><option>技术文档</option><option>操作规范</option></Select>
            </Field>
            <Field label="所属分类" req>
              <Select><option>请选择</option><option>工艺方案 / 三级分类</option></Select>
            </Field>
            <Field label="版本号"><Input defaultValue="V 1.0"/></Field>
            <Field label="编制人"><Input defaultValue="老夏"/></Field>
            <Field label="生效日期"><Input placeholder="请选择"/></Field>
            <Field label="失效日期"><Input placeholder="永久"/></Field>
            <Field label="审批流程"><Select><option>默认审批流</option></Select></Field>
          </div>
        </Card>
        <Card title="安全与外发控制">
          <div className="aw-doc-grid">
            <Field label="电子签章" req>
              <Select>
                <option>发布时自动签章</option>
                <option>审批通过后签章</option>
                <option>不启用</option>
              </Select>
            </Field>
            <Field label="水印策略" req>
              <Select>
                <option>查看与下载均加水印</option>
                <option>仅查看加水印</option>
                <option>仅下载加水印</option>
                <option>不加水印</option>
              </Select>
            </Field>
            <Field label="外发权限" req>
              <Select>
                <option>审批后允许外发</option>
                <option>禁止外发</option>
                <option>指定人员可外发</option>
              </Select>
            </Field>
            <Field label="下载审批" req>
              <Select>
                <option>外部下载需审批</option>
                <option>全部下载需审批</option>
                <option>不需要审批</option>
              </Select>
            </Field>
            <Field label="外发有效期"><Input placeholder="选择外发链接到期日期"/></Field>
            <Field label="下载次数"><Input placeholder="填写允许下载次数"/></Field>
            <Field label="授权对象"><Input placeholder="选择允许查看或下载的人员、客户、供应商"/></Field>
            <Field label="审批流程"><Select><option>文档外发下载审批流</option></Select></Field>
            <Field label="操作留痕"><Input defaultValue="预览、下载、外发、签章均记录日志" disabled/></Field>
          </div>
          <div style={{marginTop:12,color:'#6B7280',fontSize:12,lineHeight:1.7}}>
            涉密图纸、客户外发资料和正式发布版本建议强制启用动态水印与下载审批；签章信息与文档版本绑定，版本变更后需要重新审批发布。
          </div>
        </Card>
        <Card title="正文内容">
          <div className="aw-rt-bar">
            <span>B</span><span><i>I</i></span><span><u>U</u></span><span>S</span>
            <i style={{width:1,height:14,background:'#E5E7EB'}}/>
            <span>≡</span><span>≣</span><span>·</span><span>1.</span>
            <i style={{width:1,height:14,background:'#E5E7EB'}}/>
            <span>🔗</span><span>📷</span><span>📎</span>
          </div>
          <div className="aw-rt-area" contentEditable suppressContentEditableWarning>
            请输入正文内容…
          </div>
        </Card>
        <Card title="附件">
          <div style={{border:'1px dashed #D1D5DB',borderRadius:6,padding:'24px',textAlign:'center',color:'#6B7280',fontSize:13}}>
            <span className="aw-link">点击上传</span> / 拖拽到此区域 &nbsp; <span style={{color:'#9CA3AF',fontSize:12}}>支持 PDF / Word / Excel / 图片，单文件 ≤ 50MB</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

// 查看文档（复用之前的文档详情）
function DocDetailView({onBack}){
  return (
    <div className="aw-doc-form">
      <div className="aw-doc-form-body">
        <DetailHeaderCard
          title="xxx文档202415487"
          status="待审批"
          onBack={onBack}
          detailItems={[
            ['文档编号', 'PJ7820864'],
            ['文档名称', '文档名称'],
            ['文档类型', '文档分类'],
            ['版本号', 'V 1.0'],
          ]}
        />
        <DocDetailScreen embedded/>
      </div>
    </div>
  );
}

Object.assign(window, { DocListScreen, DocTree, DocToolbar, DocNewView, DocDetailView });
