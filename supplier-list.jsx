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
    {k:'temp', label:'临时供应商', open:false, kids:[{k:'t1',label:'询价新增'},{k:'t2',label:'待转正'}]},
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
      <div className="aw-doc-tb">
        <div className="aw-doc-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8"><circle cx="11" cy="11" r="6" /><path d="M16 16l4 4" /></svg>
          <input placeholder="全局搜索（如供应商、编号、联系人）" />
        </div>
        <RefreshAction />
        <button className="aw-btn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 5h18M6 12h12M10 19h4" /></svg>筛选</button>
        <button className="aw-btn" onClick={() => setFieldOpen(true)}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="7" height="7" /><rect x="14" y="4" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>字段配置</button>
        <button className="aw-btn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 4v12" /><path d="M7 11l5 5 5-5" /><path d="M4 20h16" /></svg>导出</button>
        <button className="aw-btn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 20V8" /><path d="M7 13l5-5 5 5" /><path d="M4 4h16" /></svg>导入</button>
        <button className="aw-btn primary" onClick={onNew}>新增供应商</button>
      </div>
      {fieldOpen && <FieldDrawer onClose={() => setFieldOpen(false)} />}
    </>
  );
}

// ===================== 列表视图 =====================
function SupplierListView({ onNew, onView, picked }) {
  const rows = [
    {code:'SUP-2025-001', name:'深圳鑫达电子科技有限公司', type:'原材料供应商', cat:'电子元器件', contact:'张伟', phone:'13800138001', state:'已审核', stTone:'g', source:'供应商建档', date:'2025-12-01'},
    {code:'SUP-2025-002', name:'广州宏业机械配件有限公司', type:'零部件供应商', cat:'机械零件', contact:'李明', phone:'13900139002', state:'已审核', stTone:'g', source:'供应商建档', date:'2025-11-20'},
    {code:'SUP-2025-003', name:'东莞华美包装制品厂', type:'包装供应商', cat:'纸箱类', contact:'王芳', phone:'13700137003', state:'待审核', stTone:'y', source:'供应商建档', date:'2025-12-10'},
    {code:'SUP-2025-004', name:'上海博源化工有限公司', type:'原材料供应商', cat:'化工材料', contact:'赵强', phone:'13600136004', state:'已审核', stTone:'g', source:'供应商建档', date:'2025-10-15'},
    {code:'TMP-2025-001', name:'宁波临采五金贸易部', type:'临时供应商', cat:'询价新增', contact:'孙敏', phone:'13988880001', state:'临时', stTone:'b', source:'询价单 XJ-202512-003', date:'2025-12-13'},
    {code:'TMP-2025-002', name:'青岛海工包装材料商行', type:'临时供应商', cat:'待转正', contact:'唐洁', phone:'13988880002', state:'临时', stTone:'b', source:'询价单 XJ-202512-004', date:'2025-12-14'},
    {code:'SUP-2025-005', name:'北京中科检测技术有限公司', type:'服务供应商', cat:'检测服务', contact:'陈丽', phone:'13500135005', state:'已停用', stTone:'gray', source:'供应商建档', date:'2025-08-22'},
    {code:'SUP-2025-006', name:'佛山顺德精密五金厂', type:'零部件供应商', cat:'机械零件', contact:'刘洋', phone:'13400134006', state:'已审核', stTone:'g', source:'供应商建档', date:'2025-12-05'},
    {code:'SUP-2025-007', name:'杭州云仓物流有限公司', type:'服务供应商', cat:'物流服务', contact:'周杰', phone:'13300133007', state:'待审核', stTone:'y', source:'供应商建档', date:'2025-12-12'},
    {code:'SUP-2025-008', name:'苏州工业园区塑胶科技', type:'包装供应商', cat:'塑料类', contact:'吴敏', phone:'13200132008', state:'已审核', stTone:'g', source:'供应商建档', date:'2025-09-18'},
  ];
  const cols = [
    {k:'code',  label:'供应商编号', w:140},
    {k:'name',  label:'供应商名称', w:220},
    {k:'type',  label:'分类',      w:130, filter:['全部','原材料供应商','零部件供应商','包装供应商','服务供应商','临时供应商']},
    {k:'cat',   label:'细分类',    w:120},
    {k:'contact',label:'联系人',   w:80},
    {k:'phone', label:'联系方式',  w:120},
    {k:'state', label:'状态',      w:90,  filter:['全部','临时','已审核','待审核','已停用']},
    {k:'source',label:'来源',      w:150},
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
            <td>{r.source}</td>
            <td>{r.date}</td>
            <td><span className="aw-link" onClick={e=>{e.stopPropagation();onView&&onView(r);}}>查看</span></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ===================== 新增供应商表单 =====================
function SupplierArchiveProductPickerModal({ onClose, onConfirm }) {
  const products = [
    { productNo:'7820864', productName:'半成品物料', spec:'规格一', model:'HM-450', categoryName:'半成品', unit:'KG', stock:1200, supplier:'深圳鑫达电子科技有限公司' },
    { productNo:'5786931', productName:'半成品物料', spec:'规格一', model:'HM-451', categoryName:'半成品', unit:'KG', stock:860, supplier:'广州宏业机械配件有限公司' },
    { productNo:'8518691', productName:'铝合金型材', spec:'6061-T6', model:'AL-6061', categoryName:'原材料', unit:'KG', stock:520, supplier:'上海博源化工有限公司' },
    { productNo:'6576642', productName:'精密轴承', spec:'6205-2RS', model:'BR-6205', categoryName:'零部件', unit:'个', stock:240, supplier:'佛山顺德精密五金厂' },
    { productNo:'6081578', productName:'外箱包装', spec:'500x320x280', model:'PK-500', categoryName:'包装材料', unit:'个', stock:1800, supplier:'东莞华美包装制品厂' },
  ];
  const [category, setCategory] = useState('全部产品');
  const [selected, setSelected] = useState({});
  const cats = ['全部产品','半成品','原材料','零部件','包装材料'];
  const rows = products.filter(p => category === '全部产品' || p.categoryName === category);
  const selectedRows = products.filter(p => selected[p.productNo]);
  const toggle = code => setSelected(s => ({ ...s, [code]: !s[code] }));
  return (
    <div className="aw-mask" onClick={onClose}>
      <div className="aw-modal picker" style={{ width:'min(980px,94vw)' }} onClick={e => e.stopPropagation()}>
        <div className="head"><span>选择产品</span><span style={{cursor:'pointer',color:'var(--aw-fg-4)'}} onClick={onClose}>✕</span></div>
        <div className="body" style={{padding:0}}>
          <div style={{display:'grid',gridTemplateColumns:'220px 1fr',minHeight:480}}>
            <div style={{borderRight:'1px solid var(--aw-border)',background:'var(--aw-surface-2)',padding:'10px 8px'}}>
              <div style={{fontSize:13,fontWeight:600,padding:'0 8px 8px'}}>产品分类</div>
              {cats.map(c => <div key={c} className={'aw-tree-row aw-tree-l2' + (category === c ? ' on' : '')} onClick={() => setCategory(c)}><span className="aw-tree-caret">{category === c ? '▾' : ''}</span><TileIcon name="folder" size={14}/><span>{c}</span></div>)}
            </div>
            <div style={{minWidth:0,display:'flex',flexDirection:'column'}}>
              <div style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderBottom:'1px solid var(--aw-divider)'}}>
                <span style={{color:'var(--aw-primary)',fontSize:13,fontWeight:500}}>已勾选 {selectedRows.length} 项</span>
                <div className="aw-doc-search" style={{marginLeft:'auto',width:260}}><input placeholder="搜索产品名称/编号" /></div>
              </div>
              <div className="aw-doc-tbl-inner" style={{flex:1}}>
                <table className="aw-doc-tbl">
                  <thead><tr><th style={{width:44}}><div className="aw-th-inner"></div></th>{['序号','产品编号','产品名称','规格型号','产品分类','单位','库存','默认供应商'].map(h => <th key={h}><div className="aw-th-inner">{h}</div></th>)}</tr></thead>
                  <tbody>{rows.map((p,i) => <tr key={p.productNo} onClick={() => toggle(p.productNo)} style={selected[p.productNo] ? {background:'var(--aw-primary-soft)'} : undefined}><td><span className={'aw-chk' + (selected[p.productNo] ? ' on' : '')} /></td><td>{i+1}</td><td className="aw-num">{p.productNo}</td><td className="aw-link">{p.productName}</td><td>{p.spec || p.model}</td><td>{p.categoryName}</td><td>{p.unit}</td><td className="aw-num">{p.stock}</td><td>{p.supplier}</td></tr>)}</tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="foot"><Btn onClick={onClose}>取消</Btn><Btn kind="primary" onClick={() => onConfirm(selectedRows)}>确定</Btn></div>
      </div>
    </div>
  );
}

function SupplierNewView({ onBack }) {
  const [paymentType, setPaymentType] = useState('cash'); // cash | monthly | cycle | credit
  const [infoTab, setInfoTab] = useState('product');
  const [productPicker, setProductPicker] = useState(false);
  const [productRows, setProductRows] = useState([]);
  const [buyerPicker, setBuyerPicker] = useState(false);
  const [buyer, setBuyer] = useState('');
  const [contactRows, setContactRows] = useState([{ id: 1, isDefault: true }]);
  const [bankRows, setBankRows] = useState([{ id: 1, isDefault: true }]);
  const [addressRows, setAddressRows] = useState([{ id: 1, isDefault: true }]);

  const addRow = (setter) => setter(rows => [...rows, { id: Date.now(), isDefault: rows.length === 0 }]);
  const removeRow = (setter, id) => setter(rows => rows.length > 1 ? rows.filter(row => row.id !== id) : rows);
  const setDefaultRow = (setter, id) => setter(rows => rows.map(row => ({ ...row, isDefault: row.id === id })));
  const addProducts = (items = []) => {
    const nextRows = items.map((p, idx) => ({
      id: `${p.productNo}-${Date.now()}-${idx}`,
      code: p.productNo,
      name: p.productName,
      spec: p.spec || p.model,
      category: p.categoryName,
      brand: p.brand || '通用',
      unit: p.unit,
      supplyUnit: p.unit,
      ratio: '1',
    }));
    setProductRows(rows => [...rows, ...nextRows]);
    setProductPicker(false);
  };
  const updateProduct = (id, field, value) => setProductRows(rows => rows.map(row => row.id === id ? { ...row, [field]: value } : row));
  const removeProduct = (id) => setProductRows(rows => rows.filter(row => row.id !== id));

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
            <Field label="供应商名称" req><Input placeholder="请输入供应商全称" /></Field>
            <Field label="拼音号"><Input placeholder="根据名称自动生成，可手动修改" /></Field>
            <Field label="供应商编号"><Input defaultValue="系统自动生成" disabled /></Field>
            <Field label="供应商分类" req>
              <Select><option>请选择供应商所属分类</option><option>原材料供应商</option><option>零部件供应商</option><option>包装供应商</option><option>服务供应商</option><option>临时供应商</option></Select>
            </Field>
            <Field label="供应商类型" req><Select><option>正式供应商</option><option>临时供应商</option></Select></Field>
            <Field label="来源单据"><Input placeholder="临时供应商自动带出来源询价单" /></Field>
            <Field label="信用代码" req><Input placeholder="请输入18位统一社会信用代码" /></Field>
            <Field label="采购人员">
              <div style={{display:'flex',gap:8}}>
                <Input value={buyer} readOnly placeholder="点击右侧按钮选择采购人员" />
                <Btn onClick={() => setBuyerPicker(true)}>选择</Btn>
              </div>
            </Field>
          </div>
        </Card>

        {/* ===== 供应商详情 ===== */}
        <Card title="供应商详情">
          <Tabs
            items={[
              {k:'product',label:'供应产品'},
              {k:'contact',label:'联系人信息'},
              {k:'finance',label:'财务信息'},
              {k:'address',label:'地址信息'},
              {k:'attach',label:'附件信息'},
            ]}
            active={infoTab}
            onChange={setInfoTab}
          />

          {infoTab === 'product' && (
            <>
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
                      <th style={{width:90}}>标准单位</th>
                      <th style={{width:100}}>供货单位</th>
                      <th style={{width:100}}>换算系数</th>
                      <th style={{width:60}}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productRows.map((row, index) => (
                      <tr key={row.id}>
                        <td>{index + 1}</td>
                        <td><Input value={row.code} readOnly style={{width:'100%'}} /></td>
                        <td><Input value={row.name} readOnly style={{width:'100%'}} /></td>
                        <td><Input defaultValue={row.spec} style={{width:'100%'}} /></td>
                        <td><Input value={row.category} readOnly style={{width:'100%'}} /></td>
                        <td><Input defaultValue={row.brand} style={{width:'100%'}} /></td>
                        <td><Input value={row.unit} readOnly style={{width:'100%'}} /></td>
                        <td>
                          <UnitPickerInput value={row.supplyUnit} onChange={unit => updateProduct(row.id, 'supplyUnit', unit.name)} placeholder="请选择供货单位" />
                          <div className="aw-field-hint">与标准单位不同时需填写换算系数</div>
                        </td>
                        <td><Input defaultValue={row.ratio} style={{width:'100%'}} /></td>
                        <td><span style={{color:'var(--aw-danger)',cursor:'pointer',fontSize:13}} onClick={() => removeProduct(row.id)}>删除</span></td>
                      </tr>
                    ))}
                    {!productRows.length && (
                      <tr><td colSpan={10} style={{textAlign:'center',color:'var(--aw-fg-3)',padding:'28px 12px',cursor:'pointer'}} onClick={() => setProductPicker(true)}>暂无供应产品，点击「新增产品」选择产品</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div style={{marginTop:10,display:'flex',gap:8,alignItems:'center'}}>
                <Btn onClick={() => setProductPicker(true)}>+ 新增产品</Btn>
                <span style={{fontSize:12,color:'var(--aw-fg-3)'}}>从产品列表选择后自动填充供应产品记录</span>
              </div>
              <div style={{marginTop:16}}>
                <div className="aw-rt-bar">
                  <span>B</span><span><i>I</i></span><span><u>U</u></span><span>S</span>
                  <i style={{width:1,height:14,background:'#E5E7EB'}} />
                  <span>≡</span><span>≣</span><span>·</span><span>1.</span>
                  <i style={{width:1,height:14,background:'#E5E7EB'}} />
                  <span>链接</span><span>图片</span><span>附件</span>
                </div>
                <div className="aw-rt-area" contentEditable suppressContentEditableWarning>
                  请输入供应商介绍、资质能力、合作说明、风险备注等详情内容…
                </div>
              </div>
            </>
          )}

          {infoTab === 'contact' && (
            <>
              <div style={{overflow:'auto'}}>
                <table className="aw-table">
                  <thead>
                    <tr>
                      <th style={{width:70}}>默认</th>
                      <th style={{width:150}}>联系人</th>
                      <th style={{width:170}}>联系方式</th>
                      <th style={{width:140}}>职位</th>
                      <th style={{width:180}}>邮箱</th>
                      <th>备注</th>
                      <th style={{width:80}}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contactRows.map((row, idx) => (
                      <tr key={row.id}>
                        <td><span className={'aw-chk' + (row.isDefault ? ' on' : '')} onClick={() => setDefaultRow(setContactRows, row.id)} /></td>
                        <td><Input placeholder="请输入联系人姓名" defaultValue={idx === 0 ? '' : undefined} style={{width:'100%'}} /></td>
                        <td><Input placeholder="手机号或座机" style={{width:'100%'}} /></td>
                        <td><Input placeholder="如：销售经理" style={{width:'100%'}} /></td>
                        <td><Input placeholder="name@example.com" style={{width:'100%'}} /></td>
                        <td><Input placeholder="主要对接范围" style={{width:'100%'}} /></td>
                        <td><span className="aw-link" style={{color:'var(--aw-danger)'}} onClick={() => removeRow(setContactRows, row.id)}>删除</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{marginTop:10,display:'flex',gap:8,alignItems:'center'}}>
                <Btn onClick={() => addRow(setContactRows)}>+ 新增联系人</Btn>
                <span style={{fontSize:12,color:'var(--aw-fg-3)'}}>可维护多个联系人，并指定默认联系人</span>
              </div>
            </>
          )}

          {infoTab === 'finance' && (
            <>
              <div style={{marginBottom:16}}>
                <div className="aw-sub-title">账期设置</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:'0 16px',marginTop:8}}>
                  <div className={'aw-payment-card' + (paymentType==='cash'?' on':'')} onClick={()=>setPaymentType('cash')}>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <span className={'aw-payment-radio' + (paymentType==='cash'?' checked':'')} />
                      <span style={{fontSize:14,fontWeight:600}}>现结</span>
                    </div>
                    <div className="aw-field-hint" style={{marginTop:4,marginLeft:22}}>交货时即时结清货款</div>
                  </div>
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

              <div>
                <div className="aw-sub-title">银行信息</div>
                <div style={{overflow:'auto',marginTop:8}}>
                  <table className="aw-table">
                    <thead>
                      <tr>
                        <th style={{width:70}}>默认</th>
                        <th style={{width:210}}>银行卡号</th>
                        <th style={{width:180}}>账户名称</th>
                        <th style={{width:220}}>开户行</th>
                        <th style={{width:140}}>账户类型</th>
                        <th>备注</th>
                        <th style={{width:80}}>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bankRows.map(row => (
                        <tr key={row.id}>
                          <td><span className={'aw-chk' + (row.isDefault ? ' on' : '')} onClick={() => setDefaultRow(setBankRows, row.id)} /></td>
                          <td><Input placeholder="请输入供应商银行卡号" style={{width:'100%'}} /></td>
                          <td><Input placeholder="须与营业执照一致" style={{width:'100%'}} /></td>
                          <td><Input placeholder="如：中国工商银行深圳福田支行" style={{width:'100%'}} /></td>
                          <td><Select style={{width:'100%'}}><option>对公账户</option><option>个人账户</option></Select></td>
                          <td><Input placeholder="付款说明" style={{width:'100%'}} /></td>
                          <td><span className="aw-link" style={{color:'var(--aw-danger)'}} onClick={() => removeRow(setBankRows, row.id)}>删除</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{marginTop:10,display:'flex',gap:8,alignItems:'center'}}>
                  <Btn onClick={() => addRow(setBankRows)}>+ 新增银行卡号</Btn>
                  <span style={{fontSize:12,color:'var(--aw-fg-3)'}}>可维护多个收款账户，并指定默认账户</span>
                </div>
              </div>
            </>
          )}

          {infoTab === 'address' && (
            <>
              <div style={{overflow:'auto'}}>
                <table className="aw-table">
                  <thead>
                    <tr>
                      <th style={{width:70}}>默认</th>
                      <th style={{width:130}}>地址类型</th>
                      <th style={{width:140}}>收件人</th>
                      <th style={{width:160}}>联系电话</th>
                      <th>详细地址</th>
                      <th style={{width:80}}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {addressRows.map(row => (
                      <tr key={row.id}>
                        <td><span className={'aw-chk' + (row.isDefault ? ' on' : '')} onClick={() => setDefaultRow(setAddressRows, row.id)} /></td>
                        <td><Select style={{width:'100%'}}><option>收货地址</option><option>开票地址</option><option>办公地址</option><option>仓库地址</option></Select></td>
                        <td><Input placeholder="请输入收件人" style={{width:'100%'}} /></td>
                        <td><Input placeholder="手机号或座机" style={{width:'100%'}} /></td>
                        <td><Input placeholder="请输入详细地址（省/市/区/街道/门牌号）" style={{width:'100%'}} /></td>
                        <td><span className="aw-link" style={{color:'var(--aw-danger)'}} onClick={() => removeRow(setAddressRows, row.id)}>删除</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{marginTop:10,display:'flex',gap:8,alignItems:'center'}}>
                <Btn onClick={() => addRow(setAddressRows)}>+ 新增地址</Btn>
                <span style={{fontSize:12,color:'var(--aw-fg-3)'}}>可维护多个地址，并指定默认地址</span>
              </div>
            </>
          )}

          {infoTab === 'attach' && (
            <div style={{border:'1px dashed #D1D5DB',borderRadius:6,padding:'24px',textAlign:'center',color:'#6B7280',fontSize:13}}>
              <span className="aw-link">点击上传</span> / 拖拽到此区域 &nbsp;
              <span style={{color:'#9CA3AF',fontSize:12}}>支持 PDF、Word、Excel、JPG、PNG，单文件不超过 20MB</span>
            </div>
          )}

        </Card>

        {/* 底部必填提示 */}
        <div style={{fontSize:12,color:'var(--aw-fg-3)',marginTop:12}}>
          <span style={{color:'var(--aw-danger)'}}>*</span> 为必填字段
        </div>
      </div>
      {productPicker && <ProductPickerModal onClose={() => setProductPicker(false)} onConfirm={addProducts} />}
      {buyerPicker && <PersonPickerModal onClose={() => setBuyerPicker(false)} onConfirm={(persons = []) => { setBuyer(persons.map(p => p.name).join('、')); setBuyerPicker(false); }} />}
    </div>
  );
}

// ===================== 供应商详情视图 =====================
function SupplierDetailView({ onBack, data }) {
  const sup = {
    code:'SUP-2025-001',
    name:'深圳鑫达电子科技有限公司',
    type:'原材料供应商',
    cat:'电子元器件',
    creditCode:'91440300MA5DXXXXX',
    buyer:'老夏',
    contact:'张伟',
    phone:'13800138001',
    position:'销售经理',
    email:'zhangwei@example.com',
    address:'广东省深圳市福田区华强北路1002号赛格广场32楼',
    bankAccount:'6217000000123456789',
    bankName:'深圳鑫达电子科技有限公司',
    bankBranch:'中国工商银行深圳福田支行',
    term:'月结30天',
    source:'供应商建档',
    date:'2025-12-01',
    state:'已审核',
    ...(data || {})
  };
  const [tab, setTab] = useState('info');
  const tabs = [
    {k:'info',label:'供应商信息'},
    {k:'product',label:'供应产品'},
    {k:'contact',label:'联系人信息'},
    {k:'finance',label:'财务信息'},
    {k:'address',label:'地址信息'},
    {k:'quote',label:'报价记录'},
    {k:'purchase',label:'采购记录'},
    {k:'log',label:'操作记录'},
  ];
  const productRows = [
    {code:'7820864',name:'半成品物料',spec:'规格一',cat:'半成品',brand:'通用',unit:'KG',supplyUnit:'KG',ratio:'1',price:'50.00',lead:'7天'},
    {code:'8518691',name:'铝合金型材',spec:'6061-T6',cat:'原材料',brand:'华南铝材',unit:'KG',supplyUnit:'KG',ratio:'1',price:'32.00',lead:'5天'},
    {code:'6576642',name:'精密轴承',spec:'6205-2RS',cat:'零部件',brand:'NSK',unit:'个',supplyUnit:'箱',ratio:'100',price:'18.00',lead:'10天'},
  ];
  return (
    <div className="aw-doc-form">
      <div className="aw-doc-form-body">
        <DetailHeaderCard
          title={sup.name}
          status={sup.state}
          onBack={onBack}
          detailItems={[
            ['供应商编号', sup.code],
            ['供应商分类', sup.type],
            ['主联系人', sup.contact],
            ['联系方式', sup.phone],
            ['采购人员', sup.buyer],
          ]}
        />
        <Card>
          <Tabs items={tabs} active={tab} onChange={setTab} />
          {tab === 'info' && (
            <>
              <div className="section-title">基础信息</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',rowGap:16,columnGap:80,fontSize:13}}>
                <KV k="供应商编号" v={sup.code} />
                <KV k="供应商名称" v={sup.name} />
                <KV k="供应商分类" v={sup.type} />
                <KV k="细分类" v={sup.cat} />
                <KV k="供应商类型" v={sup.type === '临时供应商' ? '临时供应商' : '正式供应商'} />
                <KV k="来源单据" v={sup.source} />
                <KV k="信用代码" v={sup.creditCode} />
                <KV k="采购人员" v={sup.buyer} />
                <KV k="付款账期" v={sup.term} />
                <KV k="创建日期" v={sup.date} />
                <KV k="供应商状态" v={sup.state} />
              </div>
            </>
          )}
          {tab === 'product' && (
            <PurchaseSection title="供应产品">
              <table className="aw-table">
                <thead><tr><th>序号</th><th>物料编码</th><th>物料名称</th><th>规格型号</th><th>物料类别</th><th>品牌</th><th>标准单位</th><th>供货单位</th><th>换算系数</th><th>参考采购价</th><th>交期</th></tr></thead>
                <tbody>{productRows.map((r,i)=><tr key={r.code}><td>{i+1}</td><td className="aw-num">{r.code}</td><td>{r.name}</td><td>{r.spec}</td><td>{r.cat}</td><td>{r.brand}</td><td>{r.unit}</td><td>{r.supplyUnit}</td><td>{r.ratio}</td><td className="aw-num">{r.price}</td><td>{r.lead}</td></tr>)}</tbody>
              </table>
            </PurchaseSection>
          )}
          {tab === 'contact' && (
            <PurchaseSection title="联系人信息">
              <table className="aw-table">
                <thead><tr><th>序号</th><th>联系人</th><th>职位</th><th>联系方式</th><th>邮箱</th><th>默认</th><th>备注</th></tr></thead>
                <tbody><tr><td>1</td><td>{sup.contact}</td><td>{sup.position}</td><td>{sup.phone}</td><td>{sup.email}</td><td>是</td><td>主要采购对接人</td></tr></tbody>
              </table>
            </PurchaseSection>
          )}
          {tab === 'finance' && (
            <PurchaseSection title="财务信息">
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',rowGap:16,columnGap:80,fontSize:13,marginBottom:16}}>
                <KV k="付款账期" v={sup.term} />
                <KV k="结算方式" v="银行转账" />
              </div>
              <table className="aw-table">
                <thead><tr><th>序号</th><th>银行卡号</th><th>账户名称</th><th>开户行</th><th>账户类型</th><th>默认</th></tr></thead>
                <tbody><tr><td>1</td><td className="aw-num">{sup.bankAccount}</td><td>{sup.bankName}</td><td>{sup.bankBranch}</td><td>对公账户</td><td>是</td></tr></tbody>
              </table>
            </PurchaseSection>
          )}
          {tab === 'address' && (
            <PurchaseSection title="地址信息">
              <table className="aw-table">
                <thead><tr><th>序号</th><th>地址类型</th><th>收件人</th><th>联系电话</th><th>详细地址</th><th>默认</th></tr></thead>
                <tbody><tr><td>1</td><td>办公地址</td><td>{sup.contact}</td><td>{sup.phone}</td><td>{sup.address}</td><td>是</td></tr></tbody>
              </table>
            </PurchaseSection>
          )}
          {tab === 'quote' && (
            <PurchaseSection title="报价记录">
              <table className="aw-table">
                <thead><tr><th>序号</th><th>询价单号</th><th>物料名称</th><th>报价单价</th><th>是否含税</th><th>交货期</th><th>报价状态</th></tr></thead>
                <tbody><tr><td>1</td><td>XJ-202512-003</td><td>半成品物料</td><td className="aw-num">50.00</td><td>是</td><td>7天</td><td>已定价</td></tr></tbody>
              </table>
            </PurchaseSection>
          )}
          {tab === 'purchase' && (
            <PurchaseSection title="采购记录">
              <table className="aw-table">
                <thead><tr><th>序号</th><th>采购单号</th><th>采购金额</th><th>已付金额</th><th>到票金额</th><th>采购状态</th></tr></thead>
                <tbody><tr><td>1</td><td>CG-20251221001</td><td className="aw-num">5959.00</td><td className="aw-num">5959.00</td><td className="aw-num">5959.00</td><td>审核中</td></tr></tbody>
              </table>
            </PurchaseSection>
          )}
          {tab === 'log' && (
            <PurchaseSection title="操作记录">
              <table className="aw-table">
                <thead><tr><th>序号</th><th>操作</th><th>操作人</th><th>操作时间</th><th>内容</th></tr></thead>
                <tbody><tr><td>1</td><td>创建供应商</td><td>{sup.buyer}</td><td>{sup.date} 10:12</td><td>录入供应商基础档案、联系人、财务和地址信息</td></tr></tbody>
              </table>
            </PurchaseSection>
          )}
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
