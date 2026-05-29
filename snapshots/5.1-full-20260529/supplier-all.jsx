// ui_kits/erp-console/supplier-list.jsx
// 供应商管理 — 列表 / 新增 / 详情 三态
const { useState, useEffect } = React;

// ===================== 分类树 =====================
function SupplierTree({ picked, setPicked }) {
  const tree = [
    {k:'all', label:'全部供应商', open:true, kids:[]},
    {k:'raw', label:'原材料供应商', open:false, kids:[{k:'r1',label:'金属材料'},{k:'r2',label:'电子元器件'},{k:'r3',label:'化工材料'}]},
    {k:'part', label:'零部件供应商', open:false, kids:[{k:'p1',label:'机械零件'},{k:'p2',label:'电气零件'}]},
    {k:'pkg', label:'包装供应商', open:false, kids:[{k:'k1',label:'纸箱类'},{k:'k2',label:'塑料类'}]},
    {k:'svc', label:'服务供应商', open:false, kids:[{k:'s1',label:'物流服务'},{k:'s2',label:'检测服务'}]},
  ];
  return (
    <div className="aw-doc-tree">
      <div className="aw-doc-tree-h">供应商库 <span className="aw-doc-tree-n">(156)</span></div>
      <div className="aw-doc-tree-list">
        {tree.map(n => (
          <div key={n.k}>
            <div className={'aw-tree-row aw-tree-l2' + (picked === n.k ? ' on' : '')} onClick={() => setPicked(n.k)}>
              <span className="aw-tree-caret">{n.kids.length ? (n.open ? '▾' : '▸') : ''}</span>
              <TileIcon name="user" size={14} />
              <span>{n.label}</span>
            </div>
            {n.open && n.kids.map(c => (
              <div key={c.k} className={'aw-tree-row aw-tree-l3' + (picked === c.k ? ' on' : '')} onClick={() => setPicked(c.k)}>
                <TileIcon name="doc" size={13} />
                <span>{c.label}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ===================== 列表工具栏 =====================
function SupplierToolbar({ onNew, onSearch }) {
  const [fieldOpen, setFieldOpen] = useState(false);
  return (
    <>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12,flexWrap:'wrap'}}>
        <Input placeholder="搜索供应商名称/编号…" style={{width:220}} />
        <Btn onClick={onNew}>新增供应商</Btn>
        <span style={{flex:1}} />
        <RefreshAction style={{fontSize:12,color:'var(--aw-fg-3)'}} />
        <Btn>筛选</Btn>
        <Btn onClick={() => setFieldOpen(true)}>字段配置</Btn>
        <Btn>导出</Btn>
        <Btn>导入</Btn>
      </div>
      {fieldOpen && <FieldDrawer onClose={() => setFieldOpen(false)} />}
    </>
  );
}

// ===================== 列表视图 =====================
function SupplierListView({ onNew, onView, picked }) {
  const rows = [
    {code:'SUP-2025-001', name:'深圳鑫达电子科技有限公司', type:'原材料供应商', cat:'电子元器件', contact:'张伟', phone:'13800138001', state:'已审核', stTone:'g', date:'2025-12-01'},
    {code:'SUP-2025-002', name:'广州宏业机械配件有限公司', type:'零部件供应商', cat:'机械零件', contact:'李明', phone:'13900139002', state:'已审核', stTone:'g', date:'2025-11-20'},
    {code:'SUP-2025-003', name:'东莞华美包装制品厂', type:'包装供应商', cat:'纸箱类', contact:'王芳', phone:'13700137003', state:'待审核', stTone:'y', date:'2025-12-10'},
    {code:'SUP-2025-004', name:'上海博源化工有限公司', type:'原材料供应商', cat:'化工材料', contact:'赵强', phone:'13600136004', state:'已审核', stTone:'g', date:'2025-10-15'},
    {code:'SUP-2025-005', name:'北京中科检测技术有限公司', type:'服务供应商', cat:'检测服务', contact:'陈丽', phone:'13500135005', state:'已停用', stTone:'gray', date:'2025-08-22'},
    {code:'SUP-2025-006', name:'佛山顺德精密五金厂', type:'零部件供应商', cat:'机械零件', contact:'刘洋', phone:'13400134006', state:'已审核', stTone:'g', date:'2025-12-05'},
    {code:'SUP-2025-007', name:'杭州云仓物流有限公司', type:'服务供应商', cat:'物流服务', contact:'周杰', phone:'13300133007', state:'待审核', stTone:'y', date:'2025-12-12'},
    {code:'SUP-2025-008', name:'苏州工业园区塑胶科技', type:'包装供应商', cat:'塑料类', contact:'吴敏', phone:'13200132008', state:'已审核', stTone:'g', date:'2025-09-18'},
  ];
  const cols = [
    {k:'code',  label:'供应商编号', w:140},
    {k:'name',  label:'供应商名称', w:220},
    {k:'type',  label:'分类',      w:130, filter:['全部','原材料供应商','零部件供应商','包装供应商','服务供应商']},
    {k:'cat',   label:'细分类',    w:120},
    {k:'contact',label:'联系人',   w:80},
    {k:'phone', label:'联系方式',  w:120},
    {k:'state', label:'状态',      w:90,  filter:['全部','已审核','待审核','已停用']},
    {k:'date',  label:'创建日期',  w:110},
    {k:'op',    label:'操作',      w:80},
  ];
  const [sel, setSel] = useState({});
  const allChecked = rows.length>0 && rows.every((_,i)=>sel[i]);
  const someChecked = rows.some((_,i)=>sel[i]);
  const toggleAll = () => { if (allChecked) setSel({}); else { const n={}; rows.forEach((_,i)=>n[i]=true); setSel(n); } };
  const toggleRow = (i) => setSel(s=>({...s,[i]:!s[i]}));

  return (
    <>
      <SupplierToolbar onNew={onNew} />
      <div className="aw-doc-tbl-wrap">
        <SupplierTable cols={cols} rows={rows} sel={sel} toggleRow={toggleRow}
          allChecked={allChecked} someChecked={someChecked} toggleAll={toggleAll} onView={onView} />
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 16px',border:'1px solid var(--aw-border)',borderTop:0,borderRadius:'0 0 var(--aw-radius-md) var(--aw-radius-md)',fontSize:12,color:'var(--aw-fg-3)'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <input type="checkbox" checked={allChecked} onChange={toggleAll} style={{margin:0}} />
            <span>共 156 条，显示 1-10 条</span>
            <span style={{color:'var(--aw-primary)',cursor:'pointer'}}>清除选择</span>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <span style={{color:'var(--aw-primary)',cursor:'pointer'}}>上一页</span>
            <span style={{background:'var(--aw-primary)',color:'#fff',padding:'2px 8px',borderRadius:4}}>1</span>
            <span style={{cursor:'pointer'}}>2</span>
            <span style={{cursor:'pointer'}}>3</span>
            <span>…</span>
            <span style={{cursor:'pointer'}}>16</span>
            <span style={{color:'var(--aw-primary)',cursor:'pointer'}}>下一页</span>
          </div>
        </div>
      </div>
    </>
  );
}

function SupplierTable({ cols, rows, sel, toggleRow, allChecked, someChecked, toggleAll, onView }) {
  return (
    <table className="aw-table" style={{marginBottom:0}}>
      <thead>
        <tr>
          <th style={{width:40}}><input type="checkbox" checked={allChecked} onChange={toggleAll} style={{margin:0}} /></th>
          {cols.map(c => <th key={c.k} style={{width:c.w}}>{c.label}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((r,i) => (
          <tr key={i} onClick={() => onView && onView(r)} style={{cursor:'pointer'}}>
            <td onClick={e=>e.stopPropagation()}><input type="checkbox" checked={!!sel[i]} onChange={()=>toggleRow(i)} style={{margin:0}} /></td>
            <td>{r.code}</td>
            <td style={{color:'var(--aw-primary)',fontWeight:500}}>{r.name}</td>
            <td>{r.type}</td>
            <td>{r.cat}</td>
            <td>{r.contact}</td>
            <td>{r.phone}</td>
            <td><span className={'aw-badge' + (r.stTone==='g'?' mint':r.stTone==='y'?' peach':r.stTone==='gray'?'':' b')}>{r.state}</span></td>
            <td>{r.date}</td>
            <td><span className="aw-link" onClick={e=>{e.stopPropagation();onView&&onView(r);}}>查看</span></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ===================== 新增供应商表单 =====================
function SupplierNewView({ onBack }) {
  const [paymentType, setPaymentType] = useState('cash'); // cash | monthly | cycle | credit

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
        {/* ===== 基础信息 ===== */}
        <Card title="基础信息">
          <div className="aw-doc-grid" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
            <Field label="供应商名称" req><Input placeholder="请输入供应商全称（须与营业执照一致）" /></Field>
            <Field label="拼音号"><Input placeholder="根据名称自动生成，可手动修改" /></Field>
            <Field label="供应商编号"><Input defaultValue="系统自动生成" disabled /></Field>
            <Field label="供应商分类" req>
              <Select><option>请选择供应商所属分类</option><option>原材料供应商</option><option>零部件供应商</option><option>包装供应商</option><option>服务供应商</option></Select>
            </Field>
            <Field label="信用代码" req><Input placeholder="请输入18位统一社会信用代码" /></Field>
            <Field label="采购人员"><Select><option>请选择负责跟进的采购人员</option><option>老夏</option><option>李文涛</option><option>陈思源</option></Select></Field>
          </div>
        </Card>

        {/* ===== 供应产品 ===== */}
        <Card title="供应产品">
          <div className="aw-sub-hint">添加该供应商供应的产品/物料信息</div>
          <div style={{overflow:'auto'}}>
            <table className="aw-table">
              <thead>
                <tr>
                  <th style={{width:40}}></th>
                  <th style={{width:130}}>物料编码</th>
                  <th style={{width:160}}>物料名称</th>
                  <th style={{width:130}}>规格型号</th>
                  <th style={{width:130}}>物料类别</th>
                  <th style={{width:100}}>品牌</th>
                  <th style={{width:80}}>单位</th>
                  <th style={{width:100}}>供货单位</th>
                  <th style={{width:100}}>换算系数</th>
                  <th style={{width:60}}>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td><Input placeholder="输入或搜索物料编码" style={{width:'100%'}} /></td>
                  <td><Input placeholder="输入物料名称关键词搜索" style={{width:'100%'}} /></td>
                  <td><Input placeholder="如：500ml/瓶、A4" style={{width:'100%'}} /></td>
                  <td><Select style={{width:'100%'}}><option>请选择物料所属类别</option><option>电子元器件</option><option>金属材料</option><option>化工材料</option><option>机械零件</option></Select></td>
                  <td><Input placeholder="无品牌可填"通用"" style={{width:'100%'}} /></td>
                  <td><Input placeholder="如：kg、个、箱" style={{width:'100%'}} /></td>
                  <td>
                    <Input placeholder="供应商报价与交货所用单位" style={{width:'100%'}} />
                    <div className="aw-field-hint">与"单位"不同时需填写换算系数</div>
                  </td>
                  <td><Input placeholder="如：1箱=12个，填12" style={{width:'100%'}} /></td>
                  <td><span style={{color:'var(--aw-danger)',cursor:'pointer',fontSize:13}}>删除</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{marginTop:10,display:'flex',gap:8,alignItems:'center'}}>
            <Btn>+ 添加产品行</Btn>
            <span style={{fontSize:12,color:'var(--aw-fg-3)'}}>支持添加多条供应产品记录</span>
          </div>
        </Card>

        {/* ===== 联系人信息 ===== */}
        <Card title="联系人信息">
          <div className="aw-doc-grid" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
            <Field label="联系人"><Input placeholder="请输入联系人姓名" /></Field>
            <Field label="联系方式"><Input placeholder="请输入手机号或座机（含区号）" /></Field>
            <Field label="职位"><Input placeholder="请输入联系人职位，如：销售经理" /></Field>
          </div>
        </Card>

        {/* ===== 财务信息 ===== */}
        <Card title="财务信息">
          {/* 账期设置 */}
          <div style={{marginBottom:16}}>
            <div className="aw-sub-title">账期设置</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:'0 16px',marginTop:8}}>
              {/* 现结 */}
              <div className={'aw-payment-card' + (paymentType==='cash'?' on':'')} onClick={()=>setPaymentType('cash')}>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <span className={'aw-payment-radio' + (paymentType==='cash'?' checked':'')} />
                  <span style={{fontSize:14,fontWeight:600}}>现结</span>
                </div>
                <div className="aw-field-hint" style={{marginTop:4,marginLeft:22}}>交货时即时结清货款</div>
              </div>
              {/* 月结 */}
              <div className={'aw-payment-card' + (paymentType==='monthly'?' on':'')} onClick={()=>setPaymentType('monthly')}>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <span className={'aw-payment-radio' + (paymentType==='monthly'?' checked':'')} />
                  <span style={{fontSize:14,fontWeight:600}}>月结</span>
                </div>
                {paymentType==='monthly' && (
                  <div style={{marginTop:8}}>
                    <Input placeholder="请输入1-31（每月几号结款）" style={{width:'100%'}} />
                    <div className="aw-field-hint" style={{marginTop:2}}>每月固定日期统一结款</div>
                  </div>
                )}
              </div>
              {/* 周期 */}
              <div className={'aw-payment-card' + (paymentType==='cycle'?' on':'')} onClick={()=>setPaymentType('cycle')}>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <span className={'aw-payment-radio' + (paymentType==='cycle'?' checked':'')} />
                  <span style={{fontSize:14,fontWeight:600}}>周期</span>
                </div>
                {paymentType==='cycle' && (
                  <div style={{marginTop:8}}>
                    <Input placeholder="如30、60、90（最多3位数）" style={{width:'100%'}} />
                    <div className="aw-field-hint" style={{marginTop:2}}>按账期天数滚动结款</div>
                  </div>
                )}
              </div>
              {/* 额度 */}
              <div className={'aw-payment-card' + (paymentType==='credit'?' on':'')} onClick={()=>setPaymentType('credit')}>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <span className={'aw-payment-radio' + (paymentType==='credit'?' checked':'')} />
                  <span style={{fontSize:14,fontWeight:600}}>额度</span>
                </div>
                {paymentType==='credit' && (
                  <div style={{marginTop:8}}>
                    <Input placeholder="如50000" style={{width:'100%'}} />
                    <div className="aw-field-hint" style={{marginTop:2}}>超出额度需提前结款</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 银行信息 */}
          <div>
            <div className="aw-sub-title">银行信息</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0 16px',marginTop:8}}>
              <Field label="银行账户"><Input placeholder="请输入供应商银行账号" /></Field>
              <Field label="账户名称"><Input placeholder="请输入开户名称（须与营业执照一致）" /></Field>
              <Field label="开户行"><Input placeholder="请输入开户银行全称及支行名称" /><div className="aw-field-hint">如：中国工商银行深圳福田支行</div></Field>
            </div>
          </div>
        </Card>

        {/* ===== 地址信息 ===== */}
        <Card title="地址信息">
          <Field label="详细地址"><Input placeholder="请输入详细地址（省/市/区/街道/门牌号）" style={{width:'100%'}} /><div className="aw-field-hint">如：广东省深圳市福田区××路××号××楼</div></Field>
        </Card>

        {/* ===== 附件信息 ===== */}
        <Card title="附件信息">
          <div style={{border:'1px dashed #D1D5DB',borderRadius:6,padding:'24px',textAlign:'center',color:'#6B7280',fontSize:13}}>
            <span className="aw-link">点击上传</span> / 拖拽到此区域 &nbsp;
            <span style={{color:'#9CA3AF',fontSize:12}}>支持 PDF、Word、Excel、JPG、PNG，单文件不超过 20MB</span>
          </div>
        </Card>

        {/* 底部必填提示 */}
        <div style={{fontSize:12,color:'var(--aw-fg-3)',marginTop:12}}>
          <span style={{color:'var(--aw-danger)'}}>*</span> 为必填字段
        </div>
      </div>
    </div>
  );
}

// ===================== 供应商详情视图 =====================
function SupplierDetailView({ onBack, data }) {
  const sup = data || { code:'SUP-2025-001', name:'深圳鑫达电子科技有限公司', type:'原材料供应商', creditCode:'91440300MA5DXXXXX', buyer:'老夏', contact:'张伟', phone:'13800138001', position:'销售经理', address:'广东省深圳市福田区华强北路1002号赛格广场32楼', bankAccount:'6217000000123456789', bankName:'深圳鑫达电子科技有限公司', bankBranch:'中国工商银行深圳福田支行', state:'已审核' };
  return (
    <div className="aw-doc-form">
      <div className="aw-doc-form-body">
        <DetailHeaderCard
          title={sup.name}
          status={sup.state}
          onBack={onBack}
          detailItems={[
            ['编号', sup.code],
            ['分类', sup.type],
            ['联系人', sup.contact],
            ['联系方式', sup.phone],
          ]}
        />
        <Card title="基础信息">
          <div className="aw-doc-grid" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
            <KV k="供应商编号" v={sup.code} /><KV k="供应商名称" v={sup.name} />
            <KV k="供应商分类" v={sup.type} /><KV k="信用代码" v={sup.creditCode} />
            <KV k="采购人员" v={sup.buyer} />
          </div>
        </Card>
        <Card title="联系人信息">
          <div className="aw-doc-grid" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
            <KV k="联系人" v={sup.contact} /><KV k="联系方式" v={sup.phone} /><KV k="职位" v={sup.position} />
          </div>
        </Card>
        <Card title="银行信息">
          <div className="aw-doc-grid" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
            <KV k="银行账户" v={sup.bankAccount} /><KV k="账户名称" v={sup.bankName} /><KV k="开户行" v={sup.bankBranch} />
          </div>
        </Card>
        <Card title="地址信息">
          <KV k="详细地址" v={sup.address} />
        </Card>
      </div>
    </div>
  );
}

function KV({k,v}){return <div style={{display:'flex',gap:18}}><span style={{color:'#6B7280',width:90,flex:'none'}}>{k}</span><span>：{v}</span></div>;}

// ===================== 主入口 =====================
function SupplierListScreen({ module: mod, initialAction, onActionConsumed }) {
  const m = mod || { name:'供应商', code:'supp' };
  const [view, setView] = useState('list');
  const [picked, setPicked] = useState('all');
  const [detailData, setDetailData] = useState(null);

  useEffect(() => {
    if (initialAction === 'new') { setView('new'); onActionConsumed && onActionConsumed(); }
    else if (initialAction === 'list') { setView('list'); onActionConsumed && onActionConsumed(); }
  }, [initialAction]);

  return (
    <div className="aw-doc-page">
      {view === 'list' && <SupplierTree picked={picked} setPicked={setPicked} />}
      <div className="aw-doc-main">
        {view === 'list'   && <SupplierListView onNew={() => setView('new')} onView={(d) => { setDetailData(d); setView('detail'); }} picked={picked} />}
        {view === 'new'    && <SupplierNewView onBack={() => setView('list')} />}
        {view === 'detail' && <SupplierDetailView onBack={() => setView('list')} data={detailData} />}
      </div>
    </div>
  );
}

// Export — 注册到全局
window.SupplierListScreen = SupplierListScreen;
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
