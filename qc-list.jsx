// ui_kits/erp-console/qc-list.jsx
// 质检中心：质检总览 / 检验执行 / 异常与处置 / 标准与配置 / 质量分析
const { useState: useQcState, useEffect: useQcEffect } = React;

const QC_CONFIG = {
  qcDashboard:{ title:'质检总览', treeTitle:'质量看板', groups:['质量看板','异常记录','待处理区域','趋势分析'], newLabel:'新增质检单', codeLabel:'质检单号', subjectLabel:'质检主题', sourceLabel:'来源单据', objectLabel:'质检对象', statusLabel:'质检状态', statuses:['待质检','质检中','合格','不合格','待复检'], row:{subject:'来料批次质检',code:'QC-202605-001',source:'PO-202605-001',object:'轴承BPS2024',qty:'10',inspector:'老夏',date:'2026-05-17',status:'待质检'} },
  qcIqc:{ kind:'execution', title:'检验执行', treeTitle:'执行视图', groups:['全部执行','IQC来料','IPQC过程','FQC成品','OQC出货','待复检','异常处置'], newLabel:'新增检验任务', codeLabel:'质检单号', subjectLabel:'检验任务', sourceLabel:'来源单据', objectLabel:'检验对象', statusLabel:'执行状态', statuses:['待报检','抽样中','待判定','特采评审','拒收退回','已放行'], row:{subject:'采购到货质检',code:'IQC-202605-001',source:'GRN-202605-018 / PO-202605-001',object:'海南微为智造 / 轴承BPS2024',qty:'到货10箱 / 抽样32件',inspector:'老夏',date:'2026-05-17',status:'待报检',stage:'IQC',lot:'LOT-IQC-20260517-01',plan:'轴承来料检验方案 V3.2',sampling:'GB/T 2828.1 一般II AQL 1.0',critical:'关键尺寸/材质证明'} },
  qcException:{ kind:'exception', title:'异常与处置', treeTitle:'处置视图', groups:['全部异常','不合格记录','隔离/拒收','返工复检','让步放行','CAPA/8D'], newLabel:'新增异常处置', codeLabel:'异常单号', subjectLabel:'异常主题', sourceLabel:'来源质检单', objectLabel:'责任对象', statusLabel:'处置状态', statuses:['待处置','隔离中','复检中','让步审批','CAPA执行中','已关闭'], row:{subject:'尺寸偏差不合格处置',code:'NCR-202605-001',source:'IQC-202605-001',object:'海南微为智造 / 轴承BPS2024',qty:'不合格2件 / 影响32件样本',inspector:'质检主管',date:'2026-05-17',status:'待处置',stage:'NCR',lot:'LOT-IQC-20260517-01',plan:'异常处置流程 V2.1',sampling:'复检加严抽样',critical:'隔离库存/供应商8D/CAPA验证'} },
  qcIpqc:{ kind:'ipqc', title:'过程质检', treeTitle:'IPQC分类', groups:['全部IPQC','首件待检','巡检执行','停线处置','复检放行'], newLabel:'新增过程质检', codeLabel:'IPQC单号', subjectLabel:'过程检验主题', sourceLabel:'工单/工序流转卡', objectLabel:'工序/产线', statusLabel:'IPQC状态', statuses:['首件待检','巡检中','工序隔离','返工待复检','已放行','停线关闭'], row:{subject:'三工序巡检',code:'IPQC-202605-001',source:'WO-202605-003 / ROUTE-03',object:'工序3压装 / 产线A',qty:'巡检80件 / 每2小时',inspector:'王质检',date:'2026-05-17',status:'巡检中',stage:'IPQC',lot:'WIP-A-0317',plan:'压装过程控制计划 V2.4',sampling:'首件全检 + 巡检5件/2h',critical:'扭矩/压装深度/工装点检'} },
  qcFqc:{ kind:'fqc', title:'成品质检', treeTitle:'FQC分类', groups:['全部FQC','完工待检','功能测试','返工复检','成品入库'], newLabel:'新增成品质检', codeLabel:'FQC单号', subjectLabel:'成品检验主题', sourceLabel:'完工入库申请', objectLabel:'成品/批次', statusLabel:'FQC状态', statuses:['完工待检','检验中','返工待复检','合格待入库','批退返工','已归档'], row:{subject:'完工成品质检',code:'FQC-202605-001',source:'FG-202605-006 / WO-202605-003',object:'智能温控终端 / B20260517',qty:'120台 / 抽样20台',inspector:'李质检',date:'2026-05-17',status:'合格待入库',stage:'FQC',lot:'FG-B20260517',plan:'温控终端成品检验规范 V4.1',sampling:'功能全检 + 外观抽样20台',critical:'老化测试/安规/铭牌'} },
  qcOqc:{ kind:'oqc', title:'出货质检', treeTitle:'OQC分类', groups:['全部OQC','待出货检验','客户验货','让步放行','拒收重检'], newLabel:'新增出货质检', codeLabel:'OQC单号', subjectLabel:'出货检验主题', sourceLabel:'销售/出库单', objectLabel:'客户/产品', statusLabel:'OQC状态', statuses:['待出货检验','客户验货中','待放行审批','已放行','客户拒收','已拦截'], row:{subject:'销售出货质检',code:'OQC-202605-001',source:'SO-202605-001 / OUT-202605-009',object:'海南微为科技 / IPHONE18',qty:'50台 / 抽样13台',inspector:'陈质检',date:'2026-05-17',status:'待出货检验',stage:'OQC',lot:'SHIP-20260517-09',plan:'出货包装与外观检验 V2.0',sampling:'AQL 0.65 外观/包装抽样13台',critical:'唛头/序列号/装箱清单'} },
  qcPlan:{ kind:'standard', title:'标准与配置', treeTitle:'配置视图', groups:['全部配置','检验方案','检验项目','检验组/授权','抽样规则','缺陷等级'], newLabel:'新增检验标准', codeLabel:'配置编号', subjectLabel:'配置名称', sourceLabel:'配置类型', objectLabel:'适用范围', statusLabel:'配置状态', statuses:['草稿','待审批','启用','修订中','停用'], row:{subject:'轴承来料检验方案',code:'PLAN-202605-001',source:'检验方案 / IQC',object:'轴承BPS2024',qty:'V3.2 / AQL 1.0',inspector:'老夏',date:'2026-05-01',status:'启用',version:'V3.2',sampling:'GB/T 2828.1 一般II AQL 1.0',defect:'CR=0 / MA=1 / MI=3',approval:'质量经理已批准'} },
  qcItem:{ kind:'item', title:'检验项目', treeTitle:'项目分类', groups:['已启用','已停用','尺寸检验','外观检验','性能检验'], newLabel:'新增项目', codeLabel:'项目编号', subjectLabel:'检验项目名称', sourceLabel:'检验方法', objectLabel:'判定规格', statusLabel:'项目状态', statuses:['草稿','待审批','启用','停用'], row:{subject:'瓶身高度检验',code:'ITEM-202605-001',source:'卡尺/高度规',object:'目标200.00mm，上限200.40，下限199.60',qty:'数值型 / mm',inspector:'老夏',date:'2026-05-01',status:'启用',upper:'200.40mm',lower:'199.60mm',defect:'MAJOR',frequency:'每批抽样'} },
  qcGroup:{ kind:'group', title:'检验资源', treeTitle:'资源分类', groups:['全部资源','检验组','检验人员','资质授权','班次覆盖','冻结停用'], newLabel:'新增检验资源', codeLabel:'资源编号', subjectLabel:'资源名称', sourceLabel:'授权项目', objectLabel:'适用范围', statusLabel:'资源状态', statuses:['待授权','启用','冻结','停用'], row:{subject:'来料检验组A',code:'GROUP-202605-001',source:'尺寸/外观/材质证书',object:'IQC来料检验',qty:'5人 / 2人可判定',inspector:'王质检',date:'2026-05-01',status:'启用',leader:'王质检',auth:'抽样、判定、特采建议',shift:'白班/夜班'} },
  qcReport:{ kind:'report', title:'质量分析', treeTitle:'分析分类', groups:['质量趋势','不良分析','供应商质量','工序质量','客户质量'], newLabel:'新增分析报表', codeLabel:'报表编号', subjectLabel:'分析主题', sourceLabel:'分析类型', objectLabel:'统计范围', statusLabel:'报表状态', statuses:['未生成','已生成','已确认'], row:{subject:'近30天质量趋势',code:'QCR-202605-001',source:'质量趋势',object:'全部质检单',qty:'96%',inspector:'系统',date:'2026-05',status:'已生成'} },
};

const QC_INSPECT_ROWS = [
  ['瓶身高度检验','仪器测量','数值','200.00mm','0.40mm','0.40mm','请输入','自动','上传'],
  ['外观划痕','目视检查','判定','无明显划痕','-','-','请输入','自动','上传'],
  ['包装完整性','抽样检查','判定','完整','-','-','请输入','自动','上传'],
];

function QcTone({ status }) {
  if (['合格','启用','已生成','已确认','已放行','合格待入库','成品入库','已归档'].includes(status)) return <Badge tone="g">{status}</Badge>;
  if (['不合格','已拒收','停用','拒收退回','客户拒收','已拦截','批退返工','工序隔离','冻结'].includes(status)) return <Badge tone="r">{status}</Badge>;
  return <Badge tone="y">{status}</Badge>;
}

function QcRows(config) {
  const base = config.row;
  if (config.kind === 'execution') {
    return [
      QC_CONFIG.qcIqc.row,
      QC_CONFIG.qcIpqc.row,
      QC_CONFIG.qcFqc.row,
      QC_CONFIG.qcOqc.row,
      {...QC_CONFIG.qcIpqc.row, code:'IPQC-202605-008', subject:'返工复检任务', status:'返工待复检', qty:'复检20件 / 加严抽样'},
      {...QC_CONFIG.qcIqc.row, code:'IQC-202605-009', subject:'来料拒收处置联动', status:'拒收退回', qty:'拒收2箱 / 待供应商确认'},
    ];
  }
  if (config.kind === 'standard') {
    return [
      QC_CONFIG.qcPlan.row,
      {...QC_CONFIG.qcItem.row, code:'ITEM-202605-001', subject:'瓶身高度检验项目', source:'检验项目 / 尺寸', status:'启用', inspector:'老夏'},
      {...QC_CONFIG.qcGroup.row, code:'GROUP-202605-001', subject:'来料检验组A授权', source:'检验组/授权', status:'启用', inspector:'王质检'},
      {...QC_CONFIG.qcPlan.row, code:'SAMP-202605-001', subject:'GB/T 2828.1 抽样规则', source:'抽样规则', object:'IQC/FQC/OQC通用', qty:'一般II / AQL 1.0', status:'修订中'},
      {...QC_CONFIG.qcItem.row, code:'DEF-202605-001', subject:'缺陷等级判定表', source:'缺陷等级', object:'CR/MA/MI分级', qty:'CR=停线 / MA=返工', status:'待审批'},
    ];
  }
  if (config.kind === 'exception') {
    return [
      base,
      {...base, code:'NCR-202605-002', subject:'来料材质证明缺失', status:'隔离中', source:'IQC-202605-006', qty:'隔离10箱 / 待补证'},
      {...base, code:'RCK-202605-003', subject:'返工批次复检', status:'复检中', source:'IPQC-202605-008', qty:'复检20件 / 已抽样'},
      {...base, code:'DEV-202605-004', subject:'客户出货让步放行', status:'让步审批', source:'OQC-202605-004', qty:'影响50台 / 客户确认中'},
      {...base, code:'CAPA-202605-005', subject:'供应商8D改善跟踪', status:'CAPA执行中', source:'NCR-202605-001', qty:'3项措施 / 1项待验证'},
    ];
  }
  return [
    base,
    {...base, code:base.code.replace('001','002'), subject:config.groups[1] + '示例', status:config.statuses[0]},
    {...base, code:base.code.replace('001','003'), subject:config.groups[2] + '示例', status:config.statuses[2] || config.statuses[0]},
    {...base, code:base.code.replace('001','004'), subject:config.groups[3] + '示例', status:config.statuses[3] || config.statuses[1] || config.statuses[0]},
  ];
}

function QcToast({ toast, onClose }) {
  useQcEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => onClose && onClose(), 2200);
    return () => clearTimeout(t);
  }, [toast]);
  if (!toast) return null;
  const ok = toast.type !== 'err';
  return <div style={{position:'fixed',right:28,top:76,zIndex:90,padding:'10px 14px',borderRadius:6,background:ok?'#DBF3E6':'#FBDFDF',color:ok?'#1F7A4E':'#D14D4D',boxShadow:'0 8px 24px rgba(16,24,40,.12)',fontSize:13}}>{toast.text}</div>;
}

function QcMiniStats({ config, rows, onPickStatus }) {
  const bad = rows.filter(r => /不合格|拒收|拦截|批退|隔离|冻结/.test(r.status)).length;
  const pending = rows.filter(r => /待|中|评审|复检/.test(r.status)).length;
  const pass = rows.filter(r => /合格|启用|放行|归档|生成|确认/.test(r.status)).length;
  const cards = [
    ['当前范围', rows.length, '全部质检记录'],
    ['待处理', pending, '待检/处理中'],
    ['异常/不合格', bad, '需要处置闭环'],
    ['已放行/启用', pass, '可追溯记录'],
  ];
  return <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:12}}>{cards.map((c,i)=><div key={c[0]} onClick={()=>i===1&&onPickStatus(config.statuses[0])} style={{border:'1px solid var(--aw-border)',background:'#fff',borderRadius:4,padding:'12px 14px',cursor:i===1?'pointer':'default'}}><div style={{fontSize:12,color:'var(--aw-fg-3)',marginBottom:8}}>{c[0]}</div><div style={{fontSize:20,fontWeight:700,color:i===2?'var(--aw-danger)':'var(--aw-fg-1)'}}>{c[1]}</div><div style={{fontSize:12,color:'var(--aw-fg-3)',marginTop:6}}>{c[2]}</div></div>)}</div>;
}

function QcToolbar({ config, keyword, setKeyword, stage, setStage, severity, setSeverity, onNew, onBatch, onToast }) {
  const stages = ['IQC','IPQC','FQC','OQC'];
  return (
    <div className="aw-doc-tb">
      <div className="aw-doc-search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8"><circle cx="11" cy="11" r="6" /><path d="M16 16l4 4" /></svg>
        <input value={keyword} onChange={e=>setKeyword(e.target.value)} placeholder={`全局搜索（如${config.subjectLabel}、${config.codeLabel}、产品/批次）`} />
      </div>
      {!['standard','item','group'].includes(config.kind) && <Select value={stage} onChange={e=>setStage(e.target.value)} style={{width:106}}><option value="">全部阶段</option>{stages.map(s=><option key={s}>{s}</option>)}</Select>}
      <Select value={severity} onChange={e=>setSeverity(e.target.value)} style={{width:116}}><option value="">全部等级</option><option>CRITICAL</option><option>MAJOR</option><option>MINOR</option></Select>
      <Btn onClick={()=>onToast({type:'ok',text:'质检数据已刷新，抽样状态与来源单据已同步'})}>刷新数据</Btn>
      <Btn onClick={()=>onBatch('filter')}>高级筛选</Btn>
      <Btn onClick={()=>onBatch('batch')}>批量处理</Btn>
      <Btn onClick={()=>onToast({type:'ok',text:'已生成当前筛选条件下的质检台账导出任务'})}>导出</Btn>
      <Btn onClick={()=>onToast({type:'ok',text:'导入模板已就绪，上传后会校验方案、项目和样本号'})}>导入</Btn>
      <Btn kind="primary" onClick={onNew}>{config.newLabel}</Btn>
    </div>
  );
}

function QcWorkflowModal({ type, config, selectedCount, row, onClose, onDone }) {
  const isFilter = type === 'filter';
  const title = isFilter ? '高级筛选' : type === 'delete' ? '删除确认' : type === 'report' ? '生成质检报告' : type === 'recheck' ? '发起复检' : type === 'edit' ? '编辑质检单' : '批量处理';
  const primary = isFilter ? '应用筛选' : type === 'delete' ? '确认删除' : type === 'report' ? '生成报告' : type === 'recheck' ? '提交复检' : type === 'edit' ? '保存修改' : '执行处理';
  return (
    <StandardModal title={title} subtitle={row ? `${row.code} / ${row.subject}` : `已选 ${selectedCount || 0} 条`} size={isFilter?'md':'lg'} onClose={onClose}
      footer={<><Btn onClick={onClose}>取消</Btn><Btn kind={type==='delete'?'danger':'primary'} onClick={()=>{onDone && onDone(type); onClose && onClose();}}>{primary}</Btn></>}>
      {type === 'delete' ? <div style={{fontSize:13,lineHeight:1.8,color:'var(--aw-fg-2)'}}>删除后会保留操作留痕，已回写来源单据或已生成报告的质检单在真实系统中应进入作废审批。当前原型仅模拟确认反馈。</div> : (
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div className="aw-doc-grid">
            <Field label="质检阶段"><Select defaultValue={row?.stage || config.kind?.toUpperCase?.() || 'IQC'}><option>IQC</option><option>IPQC</option><option>FQC</option><option>OQC</option></Select></Field>
            <Field label="处理动作"><Select defaultValue={type==='recheck'?'返工复检':type==='report'?'生成标准报告':'批量派工'}><option>批量派工</option><option>加严抽样</option><option>返工复检</option><option>让步放行</option><option>拒收/隔离</option><option>生成标准报告</option></Select></Field>
            <Field label="责任人"><Input defaultValue={row?.inspector || '质检主管'} /></Field>
            <Field label="计划完成"><Input defaultValue="2026-05-20 18:00" /></Field>
            <Field label="缺陷等级"><Select defaultValue="MAJOR"><option>CRITICAL</option><option>MAJOR</option><option>MINOR</option></Select></Field>
            <Field label="回写来源"><Select defaultValue="同步回写"><option>同步回写</option><option>仅质检留痕</option><option>审批通过后回写</option></Select></Field>
          </div>
          <PurchaseSection title={isFilter?'筛选条件':'处理说明'}>
            <textarea className="aw-input" placeholder={isFilter?'输入供应商、产线、批次、检验员、异常原因等组合条件':'输入处置原因、复检要求、放行条件或报告说明'} style={{height:92,resize:'vertical'}} />
          </PurchaseSection>
        </div>
      )}
    </StandardModal>
  );
}

function QcTree({ config, picked, setPicked }) {
  return <div className="aw-doc-tree"><div className="aw-doc-tree-h">{config.treeTitle} <span className="aw-doc-tree-n">(999)</span></div><div className="aw-doc-tree-list">{config.groups.map((g,i)=><div key={g} className={'aw-tree-row aw-tree-l2'+(picked===g?' on':'')} onClick={()=>setPicked(g)}><span className="aw-tree-caret">{i===0?'▾':''}</span><TileIcon name={i===0?'folder':'doc'} size={14}/><span>{g}</span></div>)}</div></div>;
}

function QcMetric({ label, value }) {
  return <div style={{border:'1px solid var(--aw-border)',background:'#fff',borderRadius:4,padding:'18px 20px',minHeight:76}}><div style={{fontSize:12,color:'var(--aw-fg-3)',marginBottom:10}}>{label}</div><div style={{fontSize:18,fontWeight:600}}>{value}</div></div>;
}

function QcBarChart({ title, data }) {
  const max = Math.max(...data.map(d=>d.v));
  return <div style={{border:'1px solid var(--aw-border)',background:'#fff',padding:14,minHeight:180}}><div style={{fontWeight:600,marginBottom:12}}>{title}</div>{data.map(d=><div key={d.k} style={{display:'grid',gridTemplateColumns:'90px 1fr 42px',alignItems:'center',gap:8,margin:'10px 0',fontSize:12}}><span>{d.k}</span><span style={{height:12,background:'var(--aw-surface-2)',position:'relative'}}><i style={{position:'absolute',inset:0,width:(d.v/max*100)+'%',background:'#5B8DEF'}} /></span><span>{d.v}</span></div>)}</div>;
}

function QcDashboardView({ onView }) {
  const rows = QcRows(QC_CONFIG.qcIqc);
  return (
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}><QcMetric label="总检验批次" value="128" /><QcMetric label="合格率" value="96%" /><QcMetric label="不良品数量" value="7" /><QcMetric label="不良品率" value="4%" /></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16}}>
        <QcBarChart title="不良品原因" data={[{k:'材料缺陷',v:140},{k:'色差',v:110},{k:'划痕不良',v:230},{k:'表面划痕',v:150},{k:'尺寸偏差',v:110}]} />
        <QcBarChart title="工序排名（按不良率）" data={[{k:'工序5',v:2},{k:'工序4',v:1.5},{k:'工序3',v:1},{k:'工序2',v:.5},{k:'工序1',v:.2}]} />
        <div style={{border:'1px solid var(--aw-border)',background:'#fff',padding:14}}><div style={{fontWeight:600,marginBottom:20}}>质量趋势（近30天）</div><svg width="100%" height="130" viewBox="0 0 260 130"><polyline fill="none" stroke="#5B8DEF" strokeWidth="2" points="10,28 70,42 130,58 190,72 230,40 250,12"/><g fill="#5B8DEF"><circle cx="10" cy="28" r="3"/><circle cx="130" cy="58" r="3"/><circle cx="250" cy="12" r="3"/></g><g stroke="#E5E7EB">{[30,60,90,120].map(y=><line key={y} x1="0" x2="260" y1={y} y2={y}/>)}</g></svg></div>
      </div>
      <PurchaseSection title="检验记录">
        <table className="aw-table"><thead><tr><th>序号</th><th>批次号</th><th>阶段</th><th>产品</th><th>供应商/产线</th><th>检验项目</th><th>标准值</th><th>实测值</th><th>不良详情</th><th>检验员</th><th>状态</th><th>操作</th></tr></thead><tbody>{rows.map((r,i)=><tr key={r.code} onClick={()=>onView(r)} style={{cursor:'pointer'}}><td>{i+1}</td><td>{r.code}</td><td>{i?'IPQC':'IQC'}</td><td>轴承BPS2024</td><td>{r.object}</td><td>内径</td><td>50.00±0.10mm</td><td>50.25</td><td>偏差+0.15mm</td><td>{r.inspector}</td><td><QcTone status={r.status}/></td><td><span className="aw-link">查看</span></td></tr>)}</tbody></table>
      </PurchaseSection>
    </div>
  );
}

function QcListView({ config, picked, onNew, onView, onToast }) {
  const [sel,setSel]=useQcState({});
  const [status,setStatus]=useQcState('');
  const [keyword,setKeyword]=useQcState('');
  const [stage,setStage]=useQcState('');
  const [severity,setSeverity]=useQcState('');
  const [modal,setModal]=useQcState(null);
  const rows=QcRows(config).filter(r=>{
    const text=[r.subject,r.code,r.source,r.object,r.qty,r.inspector,r.status,r.stage,r.plan,r.critical].join(' ').toLowerCase();
    const kw=keyword.trim().toLowerCase();
    const treeOk=!picked || picked===config.groups[0] || text.includes(picked.toLowerCase()) || r.status===picked || r.source===picked || r.stage===picked;
    const statusOk=!status||r.status===status;
    const stageOk=!stage||r.stage===stage||r.source===stage;
    const sevOk=!severity||((severity==='MAJOR'&&/不合格|偏差|拒收|隔离|批退/.test(text))||(severity==='MINOR'&&!/不合格|拒收|隔离|批退/.test(text))||severity==='CRITICAL'&&/停线|拦截|拒收|冻结/.test(text));
    return (!kw||text.includes(kw)) && treeOk && statusOk && stageOk && sevOk;
  });
  const selectedCodes=Object.keys(sel).filter(k=>sel[k]);
  const allChecked=rows.length>0&&rows.every(r=>sel[r.code]);
  const someChecked=rows.some(r=>sel[r.code]);
  const toggleAll=()=>{ if(allChecked)setSel({}); else { const n={...sel}; rows.forEach(r=>n[r.code]=true); setSel(n);} };
  const toggleRow=code=>setSel(s=>({...s,[code]:!s[code]}));
  const done=type=>{ const copy={filter:'筛选条件已应用',batch:`已提交 ${selectedCodes.length || rows.length} 条质检记录的批量处理`,report:'质检报告生成任务已创建',recheck:'复检任务已提交'}; onToast&&onToast({type:'ok',text:copy[type]||'操作已完成'}); };
  const extraLabel = config.kind==='standard'?'版本/抽样/授权':config.kind==='item'?'上下限/缺陷等级':config.kind==='group'?'成员/授权':config.kind==='exception'?'影响范围/进度':'数量/抽样';
  const ownerLabel = config.kind==='group'?'组长':config.kind==='standard'?'责任人':config.kind==='item'?'维护人':config.kind==='exception'?'负责人':'检验员';
  return <><QcMiniStats config={config} rows={QcRows(config)} onPickStatus={setStatus}/><QcToolbar config={config} keyword={keyword} setKeyword={setKeyword} stage={stage} setStage={setStage} severity={severity} setSeverity={setSeverity} onNew={onNew} onBatch={setModal} onToast={onToast}/><div className="aw-doc-tbl-wrap"><div className="aw-doc-tbl-inner"><table className="aw-doc-tbl"><thead><tr><PurchaseSelectHeader checked={allChecked} indeterminate={someChecked} onToggle={toggleAll}/><PurchaseIndexHeader />{[config.subjectLabel,config.codeLabel,config.sourceLabel,config.objectLabel,extraLabel,ownerLabel,config.statusLabel].map((c,i)=> i===6 ? <PurchaseStatusFilterHeader key={c} label={c} value={status} onChange={setStatus} options={config.statuses} width={150}/> : <th key={c}><div className="aw-th-inner">{c}</div></th>)}<th style={{width:130}}><div className="aw-th-inner">操作</div></th></tr></thead><tbody>{rows.map((r,i)=><tr key={r.code} onClick={()=>onView(r)} style={{cursor:'pointer'}}><PurchaseSelectCell checked={!!sel[r.code]} onToggle={()=>toggleRow(r.code)}/><td>{i+1}</td><td className="aw-link">{r.subject}</td><td className="aw-num">{r.code}</td><td>{r.source}</td><td>{r.object}</td><td>{r.qty}</td><td>{r.inspector}</td><td><QcTone status={r.status}/></td><td><span className="aw-link" onClick={e=>{e.stopPropagation();onView(r);}}>查看</span> <span className="aw-link" onClick={e=>{e.stopPropagation();setModal('recheck');}}>复检</span></td></tr>)}{rows.length===0&&<tr><td colSpan="10" style={{textAlign:'center',padding:28,color:'var(--aw-fg-3)'}}>暂无符合当前条件的质检记录</td></tr>}</tbody></table></div></div><PurchaseListFooter total={rows.length} selectedCount={selectedCodes.length} allChecked={allChecked} someChecked={someChecked} onToggleAll={toggleAll} pages={3}/>{modal&&<QcWorkflowModal type={modal} config={config} selectedCount={selectedCodes.length} onClose={()=>setModal(null)} onDone={done}/>}</>;
}

function QcFormView({ config, onBack, onToast }) {
  const [detailRows,setDetailRows]=useQcState(QC_INSPECT_ROWS);
  const addDetail=()=>{ setDetailRows(rows=>[...rows,['新增检验项目','手动录入','判定','按方案定义','-','-','请输入','自动','上传']]); onToast&&onToast({type:'ok',text:'已添加一条检验明细，可继续填写样本值和判定规则'}); };
  const delDetail=idx=>setDetailRows(rows=>rows.filter((_,i)=>i!==idx));
  if (config.kind==='standard') return <PurchaseFormPage onBack={onBack} submitText="保存配置"><PurchaseSection title="配置基础"><div className="aw-doc-grid"><Field label="配置名称" req><Input placeholder="填写方案、项目、抽样规则或检验组名称"/></Field><Field label="配置编号"><Input defaultValue="自动生成" disabled/></Field><Field label="配置类型" req><Select><option>检验方案</option><option>检验项目</option><option>检验组/授权</option><option>抽样规则</option><option>缺陷等级</option></Select></Field><Field label="适用阶段"><Select><option>IQC</option><option>IPQC</option><option>FQC</option><option>OQC</option><option>通用</option></Select></Field><Field label="适用产品/物料" req><Input placeholder="选择产品、物料或品类"/></Field><Field label="抽样/授权规则" req><Input defaultValue="GB/T 2828.1 一般II AQL 1.0"/></Field><Field label="生效日期"><Input defaultValue="2026-05-17"/></Field><Field label="审批状态"><Select><option>草稿</option><option>待审批</option><option>启用</option></Select></Field></div></PurchaseSection><PurchaseSection title="配置明细"><PurchaseDetailTable columns={[{label:'项目/成员'},{label:'方法/角色'},{label:'值类型'},{label:'目标值'},{label:'上限'},{label:'下限'},{label:'缺陷/授权'},{label:'抽样量'},{label:'判定规则'}]} rows={detailRows} renderRow={(row,idx)=><tr key={idx}><PurchaseDetailIndexCell index={idx}/><td>{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td><td>{row[4]}</td><td>{row[5]}</td><td>{idx===0?'MAJOR':'MINOR'}</td><td>{idx===0?'32件':'13件'}</td><td>{idx===0?'超限判不合格':'发现即记录'}</td><PurchaseDetailActions onDelete={()=>delDetail(idx)}/></tr>}/><PurchaseAddDetailButton onClick={addDetail}>+添加配置明细</PurchaseAddDetailButton></PurchaseSection><PurchaseSection title="版本说明"><PurchaseRichText placeholder="请输入修订原因、适用范围、变更内容和审批要求..." /></PurchaseSection></PurchaseFormPage>;
  if (config.kind==='item') return <PurchaseFormPage onBack={onBack} submitText="保存项目"><PurchaseSection title="项目定义"><div className="aw-doc-grid"><Field label="项目名称" req><Input placeholder="填写检验项目名称"/></Field><Field label="项目编号"><Input defaultValue="自动生成" disabled/></Field><Field label="项目类型"><Select><option>尺寸检验</option><option>外观检验</option><option>性能检验</option></Select></Field><Field label="检验方法"><Input defaultValue="卡尺/高度规"/></Field><Field label="目标值"><Input defaultValue="200.00"/></Field><Field label="单位"><Input defaultValue="mm"/></Field><Field label="上限"><Input defaultValue="200.40"/></Field><Field label="下限"><Input defaultValue="199.60"/></Field><Field label="缺陷等级"><Select><option>CRITICAL</option><option>MAJOR</option><option>MINOR</option></Select></Field><Field label="状态"><Select><option>启用</option><option>待审批</option><option>停用</option></Select></Field></div></PurchaseSection><PurchaseSection title="判定说明"><PurchaseRichText placeholder="请输入测量位置、工具精度、判定逻辑、图片示例和记录要求..." /></PurchaseSection></PurchaseFormPage>;
  if (config.kind==='group') return <PurchaseFormPage onBack={onBack} submitText="保存检验组"><PurchaseSection title="检验组基础"><div className="aw-doc-grid"><Field label="检验组名称" req><Input placeholder="填写检验组名称"/></Field><Field label="检验组编号"><Input defaultValue="自动生成" disabled/></Field><Field label="适用阶段"><Select><option>IQC</option><option>IPQC</option><option>FQC</option><option>OQC</option></Select></Field><Field label="组长"><Input defaultValue="王质检"/></Field><Field label="班次"><Select><option>白班</option><option>夜班</option><option>两班制</option></Select></Field><Field label="状态"><Select><option>启用</option><option>待授权</option><option>冻结</option></Select></Field></div></PurchaseSection><PurchaseSection title="成员授权"><table className="aw-table"><thead><tr><th>序号</th><th>成员</th><th>角色</th><th>授权范围</th><th>可判定等级</th><th>有效期</th><th>状态</th></tr></thead><tbody>{[['王质检','组长','抽样/判定/放行建议','CR/MA/MI','2026-12-31','启用'],['李检验','检验员','抽样/记录','MA/MI','2026-12-31','启用'],['陈复检','复检员','复检/隔离确认','MA/MI','2026-09-30','待授权']].map((m,i)=><tr key={m[0]}><td>{i+1}</td>{m.map((c,idx)=><td key={idx}>{idx===5?<QcTone status={c}/>:c}</td>)}</tr>)}</tbody></table></PurchaseSection><PurchaseSection title="授权备注"><PurchaseRichText placeholder="请输入授权边界、培训记录、证书附件和临时授权说明..." /></PurchaseSection></PurchaseFormPage>;
  const isRule = config.kind==='report';
  return <PurchaseFormPage onBack={onBack} submitText={isRule?'保存':'生成报告'}>
    <PurchaseSection title="来源信息"><div className="aw-doc-grid"><Field label={config.subjectLabel} req><Input placeholder={`填写${config.subjectLabel}`}/></Field><Field label={config.codeLabel}><Input defaultValue="自动生成" disabled/></Field><Field label={config.statusLabel}><Select>{config.statuses.map(s=><option key={s}>{s}</option>)}</Select></Field><Field label={config.sourceLabel} req><Input placeholder={`选择${config.sourceLabel}或由来源单据自动带入`}/></Field><Field label={config.objectLabel} req><Input placeholder={`选择${config.objectLabel}`}/></Field><Field label="批次/序列号"><Input defaultValue={config.row.lot || 'LOT-20260517-01'}/></Field><Field label="检验员"><Input defaultValue="老夏"/></Field><Field label="质检方案"><Select><option>{config.row.plan || '轴承来料检验方案 V3.2'}</option><option>成品出货检验方案 V2.0</option></Select></Field><Field label="抽样规则"><Input defaultValue={config.row.sampling || '按方案自动带入'}/></Field></div></PurchaseSection>
    <PurchaseSection title="抽样与检验明细"><PurchaseDetailTable columns={[{label:'检验项目名称'},{label:'检验方法'},{label:'检验值类型'},{label:'标准值'},{label:'上限'},{label:'下限'},{label:'样本号/实测值'},{label:'缺陷等级'},{label:'检验结论'}]} rows={detailRows} renderRow={(row,idx)=><tr key={idx}><PurchaseDetailIndexCell index={idx}/><td>{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td><td>{row[4]}</td><td>{row[5]}</td><td><Input placeholder={idx===0?'S01=50.25':'请输入'}/></td><td>{idx===0?'MAJOR':'MINOR'}</td><td><Input defaultValue={idx===0?'不合格':'合格'}/></td><PurchaseDetailActions onDelete={()=>delDetail(idx)}/></tr>}/><PurchaseAddDetailButton onClick={addDetail}>+添加抽样记录</PurchaseAddDetailButton></PurchaseSection>
    <PurchaseSection title="质检结果"><div className="aw-doc-grid"><Field label="抽样数量"><Input defaultValue="32"/></Field><Field label="合格数量"><Input placeholder="填写合格数量"/></Field><Field label="不合格数量"><Input placeholder="填写不合格数量"/></Field><Field label="处置建议"><Select><option>放行</option><option>拒收</option><option>让步接收</option><option>返工复检</option></Select></Field><div className="aw-field" style={{gridColumn:'2 / 4'}}><label>质检报告</label><div style={{border:'1px dashed var(--aw-border-strong)',padding:20,textAlign:'center',color:'var(--aw-fg-3)'}}><span className="aw-link">点击上传</span> / 拖拽到此区域</div></div></div></PurchaseSection>
    <PurchaseSection title="详情"><PurchaseRichText placeholder="请输入来源说明、抽样偏差、不良原因、处置建议、复检要求等..." /></PurchaseSection>
  </PurchaseFormPage>;
}

function QcKV({ label, value }) { return <div style={{display:'flex',gap:14}}><span style={{width:96,color:'var(--aw-fg-3)',flex:'none'}}>{label}：</span><span>{value}</span></div>; }

function QcDetailTabs(config) {
  if (config.kind==='standard') return ['配置信息','版本记录','抽样规则','项目清单','检验组授权','审批记录'];
  if (config.kind==='item') return ['项目信息','规格上下限','缺陷等级','引用方案','操作记录'];
  if (config.kind==='group') return ['检验组信息','成员授权','班次覆盖','培训资质','操作记录'];
  if (config.kind==='exception') return ['异常信息','来源记录','不良明细','隔离/拒收','返工复检','让步放行','CAPA/8D','验证关闭'];
  return ['质检信息','来源记录','抽样记录','检验明细','不良处置','复检记录','放行/拒收记录','质检报告'];
}

function QcDetailView({ config, row, onBack, onEdit, onToast }) {
  const tabs=QcDetailTabs(config);
  const [tab,setTab]=useQcState(tabs[0]);
  const [modal,setModal]=useQcState(null);
  useQcEffect(()=>setTab(tabs[0]),[config.kind]);
  const isMaster = ['standard','item','group'].includes(config.kind);
  const done=type=>onToast&&onToast({type:'ok',text:type==='delete'?'删除已进入作废审批':type==='report'?'质检报告生成任务已创建':type==='recheck'?'复检任务已提交':type==='edit'?'修改已保存':'操作已完成'});
  return <div className="aw-doc-form"><div className="aw-doc-form-body"><DetailHeaderCard title={`${row.subject} ${row.code}`} status={row.status} onBack={onBack} creator={row.inspector} createdAt="2026-05-17 10:25" modifier="质检主管" modifiedAt="2026-05-17 15:30" detailItems={[[config.codeLabel,row.code],[config.sourceLabel,row.source],[config.objectLabel,row.object],['批次/样本',row.qty],[config.statusLabel,row.status],['质检方案',row.plan]]}/><Card><div className="aw-tabs" style={{marginBottom:14}}>{tabs.map(t=><span key={t} className={'aw-tab '+(tab===t?'on':'')} onClick={()=>setTab(t)}>{t}</span>)}</div>{(tab==='质检信息'||tab==='异常信息')&&<><PurchaseSection title="基础信息"><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',rowGap:16,columnGap:80,fontSize:13}}><QcKV label={config.subjectLabel} value={row.subject}/><QcKV label={config.codeLabel} value={row.code}/><QcKV label={config.sourceLabel} value={row.source}/><QcKV label={config.objectLabel} value={row.object}/><QcKV label="批次/样本" value={row.qty}/><QcKV label={config.statusLabel} value={<QcTone status={row.status}/>} /><QcKV label="质检方案" value={row.plan}/><QcKV label="关键控制点" value={row.critical}/></div></PurchaseSection><PurchaseSection title="详情"><div style={{fontSize:13,lineHeight:1.8,color:'var(--aw-fg-2)'}}>本单据按 {row.stage} 场景记录来源、抽样、检验、处置、复检与最终放行/拒收结果，结论会回写仓储、生产、销售和供应商质量评分。</div></PurchaseSection></>}{tab==='来源记录'&&<QcRecordTable cols={['来源类型','来源单号','来源批次','供应商/产线/客户','带入数量','同步状态']}/>} {tab==='抽样记录'&&<table className="aw-table"><thead><tr><th>序号</th><th>抽样规则</th><th>批量</th><th>样本量</th><th>样本范围</th><th>AQL/频次</th><th>抽样人</th><th>时间</th></tr></thead><tbody><tr><td>1</td><td>{row.sampling}</td><td>{row.qty}</td><td>32</td><td>S01-S32</td><td>AQL 1.0</td><td>{row.inspector}</td><td>2026-05-17 11:10</td></tr></tbody></table>}{(tab==='检验明细'||tab==='不良明细')&&<table className="aw-table"><thead><tr><th>序号</th><th>检验项目</th><th>方法</th><th>标准值</th><th>上限</th><th>下限</th><th>实测值</th><th>缺陷等级</th><th>结论</th><th>图片</th></tr></thead><tbody>{QC_INSPECT_ROWS.map((r,i)=><tr key={i}><td>{i+1}</td><td>{r[0]}</td><td>{r[1]}</td><td>{r[3]}</td><td>{r[4]}</td><td>{r[5]}</td><td>{i?'合格':'50.25'}</td><td>{i?'MINOR':'MAJOR'}</td><td>{i?<Badge tone="g">合格</Badge>:<Badge tone="r">不合格</Badge>}</td><td><span className="aw-link">查看</span></td></tr>)}</tbody></table>}{(tab==='不良处置'||tab==='隔离/拒收'||tab==='CAPA/8D'||tab==='验证关闭')&&<QcRecordTable cols={['不良现象','缺陷等级','责任环节','处置方式','负责人','状态']}/>} {(tab==='复检记录'||tab==='返工复检')&&<QcRecordTable cols={['复检批次','复检项目','复检数量','复检人','复检时间','结论']}/>} {(tab==='放行/拒收记录'||tab==='让步放行')&&<QcRecordTable cols={['判定动作','审批人','审批时间','判定依据','影响单据','结果']}/>} {tab==='质检报告'&&<div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>{['质检报告.pdf','不良图片.zip','复检记录.xlsx'].map(n=><div key={n} style={{border:'1px dashed var(--aw-border-strong)',padding:14,minHeight:92}}><div>{n}</div><div style={{fontSize:12,color:'var(--aw-fg-3)',marginTop:10}}>上传日期：2026-05-17 14:52</div><div style={{display:'flex',gap:14,marginTop:16}}><span className="aw-link">查看</span><span className="aw-link">下载</span></div></div>)}</div>}{(tab==='方案信息'||tab==='配置信息')&&<PurchaseSection title="方案信息"><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',rowGap:16,columnGap:80,fontSize:13}}><QcKV label="方案名称" value={row.subject}/><QcKV label="方案编号" value={row.code}/><QcKV label="版本" value={row.version}/><QcKV label="适用阶段" value={row.source}/><QcKV label="适用产品" value={row.object}/><QcKV label="状态" value={<QcTone status={row.status}/>} /></div></PurchaseSection>}{tab==='版本记录'&&<QcRecordTable cols={['版本号','变更摘要','修订人','生效日期','审批人','状态']}/>} {tab==='抽样规则'&&<QcRecordTable cols={['适用批量','检验水平','AQL','样本量','接收/拒收数','缺陷等级']}/>} {tab==='项目清单'&&<table className="aw-table"><thead><tr><th>序号</th><th>项目</th><th>方法</th><th>目标值</th><th>上限</th><th>下限</th><th>缺陷等级</th></tr></thead><tbody>{QC_INSPECT_ROWS.map((r,i)=><tr key={i}><td>{i+1}</td><td>{r[0]}</td><td>{r[1]}</td><td>{r[3]}</td><td>{r[4]}</td><td>{r[5]}</td><td>{i===0?'MAJOR':'MINOR'}</td></tr>)}</tbody></table>}{tab==='审批记录'&&<QcRecordTable cols={['审批节点','审批人','审批时间','审批意见','版本','结果']}/>} {tab==='项目信息'&&<PurchaseSection title="项目信息"><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',rowGap:16,columnGap:80,fontSize:13}}><QcKV label="项目名称" value={row.subject}/><QcKV label="项目编号" value={row.code}/><QcKV label="方法" value={row.source}/><QcKV label="单位/类型" value={row.qty}/><QcKV label="频次" value={row.frequency}/><QcKV label="状态" value={<QcTone status={row.status}/>} /></div></PurchaseSection>}{tab==='规格上下限'&&<QcRecordTable cols={['规格名称','目标值','上限','下限','单位','适用版本']}/>} {tab==='缺陷等级'&&<QcRecordTable cols={['等级','触发条件','处置方式','是否停线/拒收','复检要求','状态']}/>} {tab==='引用方案'&&<QcRecordTable cols={['方案编号','方案名称','版本','适用阶段','引用项目数','状态']}/>} {tab==='检验组信息'&&<PurchaseSection title="检验组信息"><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',rowGap:16,columnGap:80,fontSize:13}}><QcKV label="检验组" value={row.subject}/><QcKV label="编号" value={row.code}/><QcKV label="组长" value={row.leader}/><QcKV label="授权项目" value={row.source}/><QcKV label="班次" value={row.shift}/><QcKV label="状态" value={<QcTone status={row.status}/>} /></div></PurchaseSection>}{(tab==='成员授权'||tab==='检验组授权')&&<table className="aw-table"><thead><tr><th>序号</th><th>成员</th><th>角色</th><th>授权范围</th><th>可判定等级</th><th>有效期</th><th>状态</th></tr></thead><tbody>{[['王质检','组长','抽样/判定/放行建议','CR/MA/MI','2026-12-31','启用'],['李检验','检验员','抽样/记录','MA/MI','2026-12-31','启用'],['陈复检','复检员','复检/隔离确认','MA/MI','2026-09-30','待授权']].map((m,i)=><tr key={m[0]}><td>{i+1}</td>{m.map((c,idx)=><td key={idx}>{idx===5?<QcTone status={c}/>:c}</td>)}</tr>)}</tbody></table>}{tab==='班次覆盖'&&<QcRecordTable cols={['班次','覆盖产线/仓库','成员数','值班组长','交接要求','状态']}/>} {tab==='培训资质'&&<QcRecordTable cols={['成员','培训课程','证书编号','有效期','授权等级','状态']}/>} {tab==='操作记录'&&<QcRecordTable cols={['操作类型','操作人','操作时间','操作内容','结果']}/>}</Card></div>{modal&&<QcWorkflowModal type={modal} config={config} row={row} selectedCount={1} onClose={()=>setModal(null)} onDone={done}/>}</div>;
}

function QcRecordTable({ cols }) { return <table className="aw-table"><thead><tr><th>序号</th>{cols.map(c=><th key={c}>{c}</th>)}</tr></thead><tbody>{[1,2,3].map(i=><tr key={i}><td>{i}</td>{cols.map((c,idx)=><td key={c}>{idx===0?`${c}示例`:idx===2?'2026-05-17 15:30':idx===5?<Badge tone="y">处理中</Badge>:'老夏'}</td>)}</tr>)}</tbody></table>; }

function QcActionView({ config, picked, action, onNew, onBack, onView, onToast }) {
  return <><div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}><span className="aw-link" onClick={onBack}>← 返回{config.title}</span><span style={{fontSize:13,color:'var(--aw-fg-3)'}}>当前页面：{action}</span></div><QcListView config={{...config,newLabel:action.startsWith('新增')?action:`新增${action.replace(/列表|详情|记录|报表|分析|检验|质量/g,'')||config.title}`,subjectLabel:action+'主题'}} picked={picked} onNew={onNew} onView={onView} onToast={onToast}/></>;
}

function QcModuleScreen({ moduleKey, initialAction, onActionConsumed }) {
  const config=QC_CONFIG[moduleKey]||QC_CONFIG.qcDashboard;
  const [view,setView]=useQcState(moduleKey==='qcDashboard'?'dashboard':'list');
  const [picked,setPicked]=useQcState(config.groups[0]);
  const [detail,setDetail]=useQcState(config.row);
  const [action,setAction]=useQcState('');
  const [toast,setToast]=useQcState(null);
  useQcEffect(()=>{
    setView(moduleKey==='qcDashboard'?'dashboard':'list');
    setPicked(config.groups[0]);
    setDetail(config.row);
    setAction('');
  },[moduleKey]);
  useQcEffect(()=>{ if(initialAction==='new'){setView('new');onActionConsumed&&onActionConsumed();} else if(initialAction&&initialAction.includes('列表')){setView(moduleKey==='qcDashboard'?'dashboard':'list');setAction('');onActionConsumed&&onActionConsumed();} else if(initialAction){setAction(initialAction);setView('action');onActionConsumed&&onActionConsumed();}},[initialAction]);
  return <div className="aw-doc-page"><QcToast toast={toast} onClose={()=>setToast(null)}/>{view!=='new'&&view!=='detail'&&<QcTree config={config} picked={picked} setPicked={setPicked}/>}<div className="aw-doc-main" style={{maxWidth:'none'}}>{view==='dashboard'&&<QcDashboardView onView={(r)=>{setDetail(r);setView('detail');}}/>}{view==='list'&&<QcListView config={config} picked={picked} onNew={()=>setView('new')} onView={(r)=>{setDetail(r);setView('detail');}} onToast={setToast}/>} {view==='action'&&<QcActionView config={config} picked={picked} action={action||config.title} onNew={()=>setView('new')} onBack={()=>setView(moduleKey==='qcDashboard'?'dashboard':'list')} onView={(r)=>{setDetail(r);setView('detail');}} onToast={setToast}/>} {view==='new'&&<QcFormView config={config} onBack={()=>setView(moduleKey==='qcDashboard'?'dashboard':'list')} onToast={setToast}/>} {view==='detail'&&<QcDetailView config={config} row={detail} onBack={()=>setView(moduleKey==='qcDashboard'?'dashboard':'list')} onEdit={()=>setView('new')} onToast={setToast}/>}</div></div>;
}

window.QcModuleScreen = QcModuleScreen;
