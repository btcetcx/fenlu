// ─── Data helpers ───────────────────────────────────────────────
let _PROC_ID = 200;
function mkProc(overrides) {
  return {
    id: _PROC_ID++, name:'', code:'', type:'self',
    routeType:'normal', reworkTrigger:'', reworkTarget:'',
    classif:'', desc:'',
    positions:[], hoursEnabled:true,
    stdHours:'', auxHours:'', coolHours:'', cost:'',
    params:[], qcEnabled:false, qcPlan:'',
    outputEnabled:false, outputs:[], _pickOutput:'',
    ...overrides,
  };
}
const CRAFT_SAMPLES = [
  { id:1, code:'GY-202605-001', name:'智能温控锅总装工艺', product:'智能温控锅 AW-H8', version:'V1.2', category:'电子装配', scope:'全部客户', steps:6, parallel:2, outsource:1, created:'2026-05-18', creator:'李文涛', updated:'2026-05-19', status:'已生效', tone:'g', isDefault:'是', qcPlan:'IPQC + FQC', owner:'工艺组' },
  { id:2, code:'GY-202605-002', name:'控制板焊接工艺', product:'控制板组件', version:'V1.0', category:'焊接', scope:'内部生产', steps:5, parallel:1, outsource:0, created:'2026-05-16', creator:'陈思源', updated:'2026-05-17', status:'待审核', tone:'y', isDefault:'否', qcPlan:'IPQC', owner:'电子工艺组' },
  { id:3, code:'GY-202604-018', name:'机身表面处理工艺', product:'机身子装配', version:'V2.1', category:'表面处理', scope:'本厂+委外', steps:4, parallel:0, outsource:1, created:'2026-04-24', creator:'老夏', updated:'2026-05-08', status:'草稿', tone:'b', isDefault:'否', qcPlan:'来料复检', owner:'结构工艺组' },
  { id:4, code:'GY-202604-011', name:'旧版包装工艺', product:'温控锅包装套件', version:'V1.1', category:'包装', scope:'全部客户', steps:3, parallel:0, outsource:0, created:'2026-04-02', creator:'赵工', updated:'2026-04-22', status:'已作废', tone:'gray', isDefault:'否', qcPlan:'FQC', owner:'包装组' },
];

// ─── Process Card ───────────────────────────────────────────────
function CraftProcCard({ proc, selected, stepSeq, onSelect, onDelete }) {
  const isOut = proc.type === 'outsource';
  const isRework = proc.routeType === 'rework';
  const border = selected ? '#5677FC' : isRework ? '#F43F5E' : isOut ? '#FA8C16' : '#52C41A';
  const bg     = selected ? '#EEF1FF' : isRework ? '#FFF1F2' : isOut ? '#FFF7E6' : '#F6FFED';
  return (
    <div onClick={onSelect} style={{
      border:`2px solid ${border}`, background:bg, borderRadius:6,
      padding:'8px 10px', cursor:'pointer', width:120, position:'relative',
      boxShadow: selected ? '0 0 0 3px rgba(86,119,252,.18)' : 'none',
      transition:'all .15s',
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
        <span style={{ fontSize:12, fontWeight:600, color:'#1F2937', flex:1, marginRight:4, wordBreak:'break-all' }}>
          {proc.name || '未命名工序'}
        </span>
        <span style={{ fontSize:10, background: isRework?'#F43F5E':isOut?'#FA8C16':'#52C41A', color:'#fff', borderRadius:3, padding:'1px 5px', whiteSpace:'nowrap', flexShrink:0 }}>
          {stepSeq}
        </span>
      </div>
      <div style={{ fontSize:11, color:'#6B7280', marginBottom:4 }}>{proc.code || '—'}</div>
      <span style={{ fontSize:10, border:`1px solid ${border}`, color:border, borderRadius:3, padding:'1px 6px' }}>
        {isRework ? '返工' : isOut ? '委外' : '自制'}
      </span>
      <span onClick={e=>{ e.stopPropagation(); onDelete(); }}
        style={{ position:'absolute', top:3, right:5, fontSize:11, color:'#D1D5DB', cursor:'pointer', fontWeight:700 }} title="移除">✕</span>
    </div>
  );
}

// ─── Flow Canvas ────────────────────────────────────────────────
function CraftFlowCanvas({ steps, selected, onSelect, onAddStep, onAddParallel, onDelete }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', overflowX:'auto', padding:'12px 0 8px', gap:0 }}>
      {steps.map((step, si) => (
        <React.Fragment key={step.id}>
          <div style={{ display:'flex', flexDirection:'column', gap:6, alignItems:'center' }}>
            {step.procs.map((proc, pi) => (
              <CraftProcCard key={proc.id} proc={proc} stepSeq={step.seq}
                selected={selected?.si===si && selected?.pi===pi}
                onSelect={()=>onSelect(si, pi)}
                onDelete={()=>onDelete(si, pi)} />
            ))}
            <button onClick={()=>onAddParallel(si)} style={{
              width:120, border:'1px dashed #D1D5DB', background:'none',
              borderRadius:4, padding:'3px 0', fontSize:11, color:'#9CA3AF', cursor:'pointer'
            }}>+ 并序</button>
          </div>
          <div style={{ padding:'0 8px', color:'#D1D5DB', fontSize:20, alignSelf:'flex-start', marginTop:14 }}>→</div>
        </React.Fragment>
      ))}
      <div style={{ alignSelf:'flex-start', paddingTop:8 }}>
        <button onClick={onAddStep} style={{
          border:'2px dashed #5677FC', background:'#EEF1FF', borderRadius:6,
          padding:'10px 14px', cursor:'pointer', color:'#5677FC', fontSize:13, whiteSpace:'nowrap', lineHeight:1
        }}>+ 添加工序</button>
      </div>
    </div>
  );
}

// ─── Panel Tabs ─────────────────────────────────────────────────
function ProcBaseTab({ proc, onUpdate }) {
  const isRework = proc.routeType === 'rework';
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <div className="aw-field"><label>工序编码</label>
          <input className="aw-input" value={proc.code} onChange={e=>onUpdate({code:e.target.value})} placeholder="填写工序编码" /></div>
        <div className="aw-field"><label>工序名称</label>
          <input className="aw-input" value={proc.name} onChange={e=>onUpdate({name:e.target.value})} placeholder="填写工序名称" /></div>
        <div className="aw-field"><label>工序类型</label>
          <select className="aw-select" value={proc.type} onChange={e=>onUpdate({type:e.target.value})}>
            <option value="self">自制</option><option value="outsource">委外</option>
          </select></div>
        <div className="aw-field"><label>工序分类</label>
          <select className="aw-select" value={proc.classif} onChange={e=>onUpdate({classif:e.target.value})}>
            <option value="">请选择</option>
            <option>机加工</option><option>焊接</option><option>表面处理</option><option>装配</option><option>检测</option>
          </select></div>
        <div className="aw-field"><label>路线节点</label>
          <select className="aw-select" value={proc.routeType} onChange={e=>onUpdate({routeType:e.target.value})}>
            <option value="normal">正常节点</option><option value="parallel">并行节点</option><option value="rework">返工节点</option>
          </select></div>
        <div className="aw-field"><label>回流目标</label>
          <input className="aw-input" value={proc.reworkTarget||''} onChange={e=>onUpdate({reworkTarget:e.target.value})} placeholder={isRework ? '选择返工后回流工序/复检节点' : '非返工节点可为空'} /></div>
      </div>
      {isRework && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div className="aw-field req"><label>返工触发条件</label>
            <select className="aw-select" value={proc.reworkTrigger||''} onChange={e=>onUpdate({reworkTrigger:e.target.value})}>
              <option value="">请选择</option>
              <option>质检不合格</option><option>客户返修</option><option>制程异常</option><option>人工指定</option>
            </select></div>
          <div className="aw-field"><label>返工说明</label>
            <input className="aw-input" placeholder="说明返工完成后的复检或回流规则" /></div>
        </div>
      )}
      <div className="aw-field"><label>工序描述</label>
        <textarea className="aw-input" value={proc.desc} onChange={e=>onUpdate({desc:e.target.value})}
          placeholder="填写工序描述" style={{ height:70, resize:'vertical', fontFamily:'inherit' }} /></div>
      <div className="aw-field"><label>图纸</label>
        <div style={{ border:'2px dashed #E5E7EB', borderRadius:6, padding:'16px', textAlign:'center', cursor:'pointer' }}>
          <div style={{ fontSize:20, color:'#D1D5DB', marginBottom:4 }}>＋</div>
          <div style={{ fontSize:12, color:'#9CA3AF' }}>上传图纸（最多9张，单张≤2M）</div>
        </div></div>
    </div>
  );
}

function ProcPositionsTab({ proc, onUpdate }) {
  const add = () => onUpdate({ positions:[...(proc.positions||[]),{id:Date.now(),code:'',name:'',line:'',workshop:''}] });
  const rm  = id => onUpdate({ positions:proc.positions.filter(p=>p.id!==id) });
  const upd = (id,k,v) => onUpdate({ positions:proc.positions.map(p=>p.id===id?{...p,[k]:v}:p) });
  return (
    <div>
      <button onClick={add} style={{ border:'1px solid #FA8C16', color:'#FA8C16', background:'none', borderRadius:4, padding:'4px 12px', fontSize:12, cursor:'pointer', marginBottom:12 }}>添加工位</button>
      {!(proc.positions||[]).length && <div style={{ color:'#9CA3AF', fontSize:12, textAlign:'center', padding:'20px 0' }}>暂无工位</div>}
      {!!(proc.positions||[]).length && (
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
          <thead><tr style={{ background:'#F9FAFB' }}>
            {['工位编码','工位名称','所属生产线','所属车间','操作'].map(h=>(
              <th key={h} style={{ padding:'6px 8px', textAlign:'left', color:'#6B7280', borderBottom:'1px solid #E5E7EB' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>{proc.positions.map(p=>(
            <tr key={p.id} style={{ borderBottom:'1px solid #F3F4F6' }}>
              {['code','name','line','workshop'].map(k=>(
                <td key={k} style={{ padding:'4px 8px' }}><input className="aw-input" value={p[k]} onChange={e=>upd(p.id,k,e.target.value)} style={{ height:28, fontSize:12 }} /></td>
              ))}
              <td style={{ padding:'4px 8px' }}><span onClick={()=>rm(p.id)} style={{ color:'#F5222D', cursor:'pointer' }}>删除</span></td>
            </tr>
          ))}</tbody>
        </table>
      )}
    </div>
  );
}

function ProcHoursTab({ proc, onUpdate }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:13, color:'#374151' }}>工时信息</span>
        <span className={'aw-switch'+(proc.hoursEnabled?'':' off')} onClick={()=>onUpdate({hoursEnabled:!proc.hoursEnabled})} />
        <span style={{ fontSize:12, color: proc.hoursEnabled?'#52C41A':'#9CA3AF' }}>{proc.hoursEnabled?'启用':'关闭'}</span>
      </div>
      {proc.hoursEnabled && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {[['stdHours','标准工时','分钟'],['auxHours','辅助工时','分钟'],['coolHours','冷却工时','分钟'],['cost','工序成本','元']].map(([k,label,unit])=>(
            <div key={k} className="aw-field"><label>{label}</label>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <input className="aw-input" value={proc[k]||''} onChange={e=>onUpdate({[k]:e.target.value})} placeholder={`填写${label}`} style={{ flex:1 }} />
                <span style={{ color:'#9CA3AF', fontSize:12, whiteSpace:'nowrap' }}>{unit}</span>
              </div></div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProcParamsTab({ proc, onUpdate }) {
  const add = () => onUpdate({ params:[...(proc.params||[]),{id:Date.now(),name:'',value:''}] });
  const rm  = id => onUpdate({ params:proc.params.filter(p=>p.id!==id) });
  const upd = (id,k,v) => onUpdate({ params:proc.params.map(p=>p.id===id?{...p,[k]:v}:p) });
  return (
    <div>
      <button onClick={add} style={{ border:'1px solid #FA8C16', color:'#FA8C16', background:'none', borderRadius:4, padding:'4px 12px', fontSize:12, cursor:'pointer', marginBottom:12 }}>添加参数</button>
      {!(proc.params||[]).length && <div style={{ color:'#9CA3AF', fontSize:12, textAlign:'center', padding:'20px 0' }}>暂无技术参数</div>}
      {!!(proc.params||[]).length && (
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
          <thead><tr style={{ background:'#F9FAFB' }}>
            {['参数名称','参数值','操作'].map(h=>(
              <th key={h} style={{ padding:'6px 8px', textAlign:'left', color:'#6B7280', borderBottom:'1px solid #E5E7EB' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>{proc.params.map(p=>(
            <tr key={p.id} style={{ borderBottom:'1px solid #F3F4F6' }}>
              <td style={{ padding:'4px 8px' }}><input className="aw-input" value={p.name} onChange={e=>upd(p.id,'name',e.target.value)} style={{ height:28, fontSize:12 }} /></td>
              <td style={{ padding:'4px 8px' }}><input className="aw-input" value={p.value} onChange={e=>upd(p.id,'value',e.target.value)} style={{ height:28, fontSize:12 }} /></td>
              <td style={{ padding:'4px 8px' }}><span onClick={()=>rm(p.id)} style={{ color:'#F5222D', cursor:'pointer' }}>删除</span></td>
            </tr>
          ))}</tbody>
        </table>
      )}
    </div>
  );
}

function ProcQcTab({ proc, onUpdate }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:13, color:'#374151' }}>质检设置</span>
        <span className={'aw-switch'+(proc.qcEnabled?'':' off')} onClick={()=>onUpdate({qcEnabled:!proc.qcEnabled})} />
      </div>
      {proc.qcEnabled && (<>
        <div className="aw-field"><label>质检方案</label>
          <select className="aw-select" value={proc.qcPlan||''} onChange={e=>onUpdate({qcPlan:e.target.value})}>
            <option value="">请选择</option>
            <option>ZJ-20250101001</option><option>ZJ-20250101002</option><option>ZJ-20250101003</option>
          </select></div>
        <div className="aw-field"><label>检验标准</label>
          <input className="aw-input" placeholder="请输入检验标准" /></div>
        <div className="aw-field"><label>检验方式</label>
          <select className="aw-select"><option>请选择</option><option>全检</option><option>抽检</option><option>首检</option></select></div>
      </>)}
    </div>
  );
}

function ProcOutputTab({ proc, onUpdate }) {
  const OPTS = [
    { id:'p1', name:'IPHONE18',  code:'CP-20250101001', model:'PRO', classif:'成品',  unit:'台', type:'自制' },
    { id:'p2', name:'控制板A',  code:'CP-20250101002', model:'V2',  classif:'半成品', unit:'个', type:'自制' },
    { id:'p3', name:'焊接组件', code:'CP-20250101003', model:'X1',  classif:'半成品', unit:'套', type:'委外' },
  ];
  const add = () => {
    const p = OPTS.find(x=>x.id===proc._pickOutput);
    if(!p || (proc.outputs||[]).find(o=>o.id===p.id)) return;
    onUpdate({ outputs:[...(proc.outputs||[]),p], _pickOutput:'' });
  };
  const rm = id => onUpdate({ outputs:(proc.outputs||[]).filter(o=>o.id!==id) });
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:13, color:'#374151' }}>副产品</span>
        <span className={'aw-switch'+(proc.outputEnabled?'':' off')} onClick={()=>onUpdate({outputEnabled:!proc.outputEnabled})} />
      </div>
      {proc.outputEnabled && (<>
        <div style={{ display:'flex', gap:8 }}>
          <select className="aw-select" value={proc._pickOutput||''} onChange={e=>onUpdate({_pickOutput:e.target.value})} style={{ flex:1 }}>
            <option value="">请选择产品</option>
            {OPTS.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button onClick={add} style={{ border:'1px solid #5677FC', color:'#5677FC', background:'none', borderRadius:4, padding:'5px 12px', fontSize:12, cursor:'pointer', whiteSpace:'nowrap' }}>添加</button>
        </div>
        {!(proc.outputs||[]).length && <div style={{ color:'#9CA3AF', fontSize:12, textAlign:'center', padding:'16px 0' }}>暂无副产品</div>}
        {!!(proc.outputs||[]).length && (
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
            <thead><tr style={{ background:'#F9FAFB' }}>
              {['产品名称','产品编号','型号','分类','单位','操作'].map(h=>(
                <th key={h} style={{ padding:'6px 8px', textAlign:'left', color:'#6B7280', borderBottom:'1px solid #E5E7EB' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>{proc.outputs.map(o=>(
              <tr key={o.id} style={{ borderBottom:'1px solid #F3F4F6' }}>
                <td style={{ padding:'6px 8px', color:'#5677FC' }}>{o.name}</td>
                <td style={{ padding:'6px 8px' }}>{o.code}</td>
                <td style={{ padding:'6px 8px' }}>{o.model}</td>
                <td style={{ padding:'6px 8px' }}>{o.classif}</td>
                <td style={{ padding:'6px 8px' }}>{o.unit}</td>
                <td style={{ padding:'6px 8px' }}><span onClick={()=>rm(o.id)} style={{ color:'#F5222D', cursor:'pointer' }}>删除</span></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </>)}
    </div>
  );
}

// ─── Process Panel (right drawer) ───────────────────────────────
function CraftProcPanel({ proc, onUpdate, onClose }) {
  const [tab, setTab] = React.useState('base');
  const TABS = [
    {k:'base',label:'基础信息'},{k:'pos',label:'工位'},
    {k:'hours',label:'工时'},{k:'params',label:'技术参数'},
    {k:'qc',label:'质检设置'},{k:'output',label:'副产品'},
  ];
  const isOut = proc.type==='outsource';
  const isRework = proc.routeType==='rework';
  const accent = isRework?'#F43F5E':isOut?'#FA8C16':'#52C41A';
  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:199 }} />
      <style>{`@keyframes awSlideRight{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
      <div style={{
        position:'fixed', top:0, right:0, width:480, height:'100vh',
        background:'#fff', boxShadow:'-2px 0 16px rgba(0,0,0,.14)',
        zIndex:200, display:'flex', flexDirection:'column',
        animation:'awSlideRight .2s ease',
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderBottom:'1px solid #E5E7EB', background:'#FAFAFA' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:accent, display:'inline-block' }} />
            <span style={{ fontWeight:600, fontSize:14 }}>{proc.name||'工序配置'}</span>
            <span style={{ fontSize:11, border:`1px solid ${accent}`, color:accent, borderRadius:3, padding:'1px 6px' }}>
              {isRework?'返工':isOut?'委外':'自制'}
            </span>
          </div>
          <span onClick={onClose} style={{ cursor:'pointer', color:'#9CA3AF', fontSize:16, lineHeight:1 }}>✕</span>
        </div>
        <div style={{ display:'flex', borderBottom:'1px solid #E5E7EB', padding:'0 12px', overflowX:'auto', flexShrink:0 }}>
          {TABS.map(t=>(
            <div key={t.k} onClick={()=>setTab(t.k)} style={{
              padding:'9px 12px', cursor:'pointer', fontSize:12, whiteSpace:'nowrap',
              borderBottom: tab===t.k?'2px solid #5677FC':'2px solid transparent',
              color: tab===t.k?'#5677FC':'#6B7280', fontWeight: tab===t.k?600:400,
            }}>{t.label}</div>
          ))}
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:16 }}>
          {tab==='base'   && <ProcBaseTab      proc={proc} onUpdate={onUpdate} />}
          {tab==='pos'    && <ProcPositionsTab proc={proc} onUpdate={onUpdate} />}
          {tab==='hours'  && <ProcHoursTab     proc={proc} onUpdate={onUpdate} />}
          {tab==='params' && <ProcParamsTab    proc={proc} onUpdate={onUpdate} />}
          {tab==='qc'     && <ProcQcTab        proc={proc} onUpdate={onUpdate} />}
          {tab==='output' && <ProcOutputTab    proc={proc} onUpdate={onUpdate} />}
        </div>
        <div style={{ padding:'12px 16px', borderTop:'1px solid #E5E7EB', display:'flex', justifyContent:'flex-end', gap:8, flexShrink:0 }}>
          <button className="aw-btn" onClick={onClose}>关闭</button>
          <button className="aw-btn primary" onClick={onClose}>保存</button>
        </div>
      </div>
    </>
  );
}

// ─── Add Craft Screen ───────────────────────────────────────────
let _STEP_ID = 50;
function CraftAddScreen({ onBack }) {
  const [form, setForm] = React.useState({
    code:'自动生成',
    name:'',
    product:'',
    version:'V1.0',
    status:'草稿',
    isDefault:'是',
    scope:'通用',
    effectiveDate:'2026-05-19',
    owner:'工艺工程师',
  });
  const processSamples = [
    {code:'GX-001', name:'下料切割', type:'加工', work:'自制', hours:'30'},
    {code:'GX-002', name:'焊接成型', type:'加工', work:'自制', hours:'45'},
    {code:'GX-003', name:'表面喷涂', type:'包装', work:'委外', hours:'60'},
    {code:'GX-004', name:'过程检验', type:'检验', work:'自制', hours:'15'},
  ];
  const productSamples = [
    {code:'CP-20260519001', name:'智能温控终端', model:'WT-900', unit:'台'},
    {code:'CP-20260519002', name:'半成品控制板', model:'PCB-A2', unit:'块'},
    {code:'CP-20260519003', name:'标准装配件', model:'ASM-01', unit:'套'},
  ];
  const [rows, setRows] = React.useState([
    {id:1, seq:1, code:'GX-001', name:'下料切割', type:'加工', work:'自制', pre:'开始', parallel:'A', hours:'30', qc:'否', rework:'', target:'', remark:''},
    {id:2, seq:2, code:'GX-002', name:'焊接成型', type:'加工', work:'自制', pre:'GX-001', parallel:'B', hours:'45', qc:'是', rework:'质检不合格', target:'GX-002', remark:''},
  ]);
  const [pickProduct, setPickProduct] = React.useState(false);
  const [pickProcess, setPickProcess] = React.useState(false);

  const patchForm = patch => setForm(f=>({...f,...patch}));
  const addProcess = p => {
    setRows(r=>[...r,{
      id:Date.now(),
      seq:r.length+1,
      code:p.code,
      name:p.name,
      type:p.type,
      work:p.work,
      pre:r.length ? r[r.length-1].code : '开始',
      parallel:String.fromCharCode(65 + r.length),
      hours:p.hours,
      qc:p.type==='检验' ? '是' : '否',
      rework:'',
      target:'',
      remark:'',
    }]);
    setPickProcess(false);
  };
  const updateRow = (id, key, value) => setRows(r=>r.map(row=>row.id===id ? {...row,[key]:value} : row));
  const removeRow = id => setRows(r=>r.filter(row=>row.id!==id).map((row, idx)=>({...row, seq:idx+1})));

  const SectionHead = ({label}) => (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
      <div style={{ width:3, height:15, background:'#5677FC', borderRadius:2 }} />
      <span style={{ fontWeight:600, fontSize:13 }}>{label}</span>
    </div>
  );
  const Box = ({children, mb=16}) => (
    <div style={{ background:'#fff', borderRadius:8, padding:20, marginBottom:mb, border:'1px solid #E5E7EB' }}>{children}</div>
  );

  const PickerModal = ({ title, children, onClose }) => (
    <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,.28)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:860, background:'#fff', borderRadius:8, boxShadow:'0 18px 48px rgba(15,23,42,.22)', overflow:'hidden' }}>
        <div style={{ height:48, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 18px', borderBottom:'1px solid #E5E7EB' }}>
          <strong>{title}</strong>
          <span onClick={onClose} style={{ cursor:'pointer', color:'#6B7280', fontSize:18 }}>×</span>
        </div>
        <div style={{ padding:18 }}>{children}</div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth:1180, margin:'0 auto', padding:'0 0 40px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
        <span onClick={onBack} style={{ cursor:'pointer', color:'#5677FC', fontSize:13 }}>← 返回列表</span>
        <span style={{ color:'#D1D5DB' }}>|</span>
        <span style={{ fontWeight:600, fontSize:15 }}>新增工艺</span>
      </div>

      <Box>
        <SectionHead label="基础信息" />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>
          <div className="aw-field req"><label>工艺编号</label>
            <input className="aw-input" value={form.code} readOnly style={{ background:'#F9FAFB', color:'#6B7280' }} /></div>
          <div className="aw-field req"><label>工艺名称</label>
            <input className="aw-input" value={form.name} onChange={e=>patchForm({name:e.target.value})} placeholder="填写工艺名称" /></div>
          <div className="aw-field req"><label>适用产品</label>
            <div style={{ position:'relative' }}>
              <input className="aw-input" value={form.product} readOnly placeholder="选择适用产品" style={{ paddingRight:34 }} />
              <span onClick={()=>setPickProduct(true)} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', cursor:'pointer', color:'#6B7280' }}>🔍</span>
            </div></div>
          <div className="aw-field"><label>工艺版本</label>
            <input className="aw-input" value={form.version} onChange={e=>patchForm({version:e.target.value})} /></div>
          <div className="aw-field"><label>适用范围</label>
            <select className="aw-select" value={form.scope} onChange={e=>patchForm({scope:e.target.value})}>
              <option>通用</option><option>指定客户</option><option>指定项目</option><option>试制专用</option>
            </select></div>
          <div className="aw-field"><label>是否默认工艺</label>
            <select className="aw-select" value={form.isDefault} onChange={e=>patchForm({isDefault:e.target.value})}>
              <option>是</option><option>否</option>
            </select></div>
          <div className="aw-field"><label>生效日期</label>
            <input className="aw-input" value={form.effectiveDate} onChange={e=>patchForm({effectiveDate:e.target.value})} /></div>
          <div className="aw-field"><label>负责人</label>
            <input className="aw-input" value={form.owner} onChange={e=>patchForm({owner:e.target.value})} /></div>
          <div className="aw-field"><label>工艺状态</label>
            <select className="aw-select" value={form.status} onChange={e=>patchForm({status:e.target.value})}>
              <option>草稿</option><option>待审批</option><option>已生效</option><option>已作废</option>
            </select></div>
        </div>
      </Box>

      <Box>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <SectionHead label="工艺路线明细" />
          <button className="aw-btn primary" onClick={()=>setPickProcess(true)}>+ 新增工序</button>
        </div>
        <div className="aw-table-scroll" style={{ overflowX:'auto', border:'1px solid #E5E7EB', borderRadius:6 }}>
          <table className="aw-table">
            <thead><tr>{['序号','工序编号','工序名称','节点类型','执行方式','前置工序','并行组','标准工时','质检点','返工触发','回流目标','备注','操作'].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.map(row=>(
                <tr key={row.id}>
                  <td>{row.seq}</td>
                  <td>{row.code}</td>
                  <td>{row.name}</td>
                  <td><select className="aw-select" value={row.type} onChange={e=>updateRow(row.id,'type',e.target.value)}><option>加工</option><option>检验</option><option>包装</option><option>返工</option></select></td>
                  <td><select className="aw-select" value={row.work} onChange={e=>updateRow(row.id,'work',e.target.value)}><option>自制</option><option>委外</option></select></td>
                  <td><input className="aw-input" value={row.pre} onChange={e=>updateRow(row.id,'pre',e.target.value)} /></td>
                  <td><input className="aw-input" value={row.parallel} onChange={e=>updateRow(row.id,'parallel',e.target.value)} /></td>
                  <td><input className="aw-input" value={row.hours} onChange={e=>updateRow(row.id,'hours',e.target.value)} /></td>
                  <td><select className="aw-select" value={row.qc} onChange={e=>updateRow(row.id,'qc',e.target.value)}><option>是</option><option>否</option></select></td>
                  <td><input className="aw-input" value={row.rework} onChange={e=>updateRow(row.id,'rework',e.target.value)} placeholder="如：质检不合格" /></td>
                  <td><input className="aw-input" value={row.target} onChange={e=>updateRow(row.id,'target',e.target.value)} placeholder="选择回流工序" /></td>
                  <td><input className="aw-input" value={row.remark} onChange={e=>updateRow(row.id,'remark',e.target.value)} /></td>
                  <td><span onClick={()=>removeRow(row.id)} style={{ color:'#F5222D', cursor:'pointer' }}>删除</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <div style={{ padding:30, textAlign:'center', color:'#9CA3AF' }}>暂无工序，请点击新增工序</div>}
        </div>
        <div style={{ fontSize:12, color:'#6B7280', marginTop:10 }}>
          说明：同一并行组可同时开始；返工节点需维护返工触发和回流目标；委外节点后续由委外加工单承接发料、收货和质检。
        </div>
      </Box>

      <Box>
        <SectionHead label="附件信息" />
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          <div style={{ border:'1px dashed #D1D5DB', borderRadius:6, width:220, height:92, display:'flex', alignItems:'center', justifyContent:'center', color:'#5677FC', cursor:'pointer' }}>
            点击上传 / 拖拽到此区域
          </div>
        </div>
      </Box>

      <Box mb={0}>
        <SectionHead label="工艺说明" />
        <div className="aw-field" style={{ marginBottom:10 }}><label>关联文档</label>
          <select className="aw-select" style={{ width:220 }}>
            <option value="">请选择</option>
            <option>智能控制器标准规范 V1.0</option>
            <option>装配线巡检模板 V1.2</option>
          </select></div>
        <div style={{ border:'1px solid #E5E7EB', borderRadius:4 }}>
          <div style={{ padding:'6px 10px', borderBottom:'1px solid #E5E7EB', background:'#FAFAFA', fontSize:12, color:'#6B7280', display:'flex', gap:8, flexWrap:'wrap' }}>
            {['文件▼','编辑▼','插入▼','视图▼','格式▼','表格▼'].map(m=>(
              <span key={m} style={{ cursor:'pointer', padding:'2px 4px' }}>{m}</span>))}
          </div>
          <div style={{ padding:'6px 10px', borderBottom:'1px solid #E5E7EB', background:'#FAFAFA', display:'flex', gap:5, flexWrap:'wrap' }}>
            {['B','I','U','S','≡','≡','≡','«','↩','Ix','x₂','x²','<>'].map((b,i)=>(
              <button key={i} style={{ border:'1px solid #E5E7EB', background:'#fff', borderRadius:3, padding:'2px 6px', cursor:'pointer', fontSize:12, minWidth:24 }}>{b}</button>))}
          </div>
          <textarea placeholder="填写工艺说明、检验要求和注意事项" style={{ width:'100%', minHeight:120, border:'none', padding:'10px 12px', resize:'vertical', fontFamily:'inherit', fontSize:13, outline:'none', boxSizing:'border-box' }} />
        </div>
      </Box>

      <div style={{ display:'flex', justifyContent:'center', gap:12, marginTop:24 }}>
        <button className="aw-btn" onClick={onBack}>取消</button>
        <button className="aw-btn">保存草稿</button>
        <button className="aw-btn primary">确认提交</button>
      </div>

      {pickProduct && (
        <PickerModal title="选择适用产品" onClose={()=>setPickProduct(false)}>
          <div style={{ marginBottom:12 }}><input className="aw-input" placeholder="搜索产品名称 / 编号 / 型号" /></div>
          <table className="aw-table">
            <thead><tr>{['产品编号','产品名称','规格型号','单位','操作'].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>{productSamples.map(p=><tr key={p.code}><td>{p.code}</td><td>{p.name}</td><td>{p.model}</td><td>{p.unit}</td><td><span onClick={()=>{patchForm({product:p.name});setPickProduct(false);}} style={{ color:'#5677FC', cursor:'pointer' }}>选择</span></td></tr>)}</tbody>
          </table>
        </PickerModal>
      )}
      {pickProcess && (
        <PickerModal title="选择工序" onClose={()=>setPickProcess(false)}>
          <div style={{ marginBottom:12 }}><input className="aw-input" placeholder="搜索工序名称 / 编号 / 分类" /></div>
          <table className="aw-table">
            <thead><tr>{['工序编号','工序名称','类型','默认执行','标准工时','操作'].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>{processSamples.map(p=><tr key={p.code}><td>{p.code}</td><td>{p.name}</td><td>{p.type}</td><td>{p.work}</td><td>{p.hours}</td><td><span onClick={()=>addProcess(p)} style={{ color:'#5677FC', cursor:'pointer' }}>选择</span></td></tr>)}</tbody>
          </table>
        </PickerModal>
      )}
    </div>
  );
}

// ─── Craft Detail Screen ─────────────────────────────────────────
const DETAIL_STEPS = [
  {seq:1,procs:[{name:'切割准备',code:'GX-001',type:'self'}]},
  {seq:2,procs:[{name:'等离子切割',code:'GX-002',type:'self'},{name:'激光切割',code:'GX-003',type:'outsource'}]},
  {seq:3,procs:[{name:'焊接',code:'GX-004',type:'outsource'}]},
  {seq:4,procs:[{name:'质检',code:'GX-005',type:'self'}]},
  {seq:5,procs:[{name:'返工打磨',code:'GX-R01',type:'self',routeType:'rework',reworkTrigger:'质检不合格',reworkTarget:'质检'}]},
];
function CraftDetailScreenLegacy({ data, onBack }) {
  const [tab, setTab] = React.useState('info');
  const current = data || CRAFT_SAMPLES[0];
  const statusTone = current.tone || (current.status === '已生效' ? 'g' : current.status === '待审核' ? 'y' : current.status === '草稿' ? 'b' : 'gray');
  const paramRows = DETAIL_STEPS.flatMap((step, si) => step.procs.map((p, pi) => ({
    seq: step.seq + (step.procs.length > 1 ? `.${pi + 1}` : ''),
    code: p.code,
    name: p.name,
    type: p.routeType === 'rework' ? '返工' : p.type === 'outsource' ? '委外' : '自制',
    work: p.type === 'outsource' ? '委外商' : '本厂车间',
    hours: pi === 0 ? '1.5h' : '0.8h',
    qc: p.name.includes('质检') ? 'FQC' : 'IPQC',
    output: si === DETAIL_STEPS.length - 1 ? current.product : '半成品/过程件',
  })));
  return (
    <div className="aw-doc-form">
      <div className="aw-doc-form-head">
        <span className="aw-link" onClick={onBack}>← 返回列表</span>
        <span style={{ flex: 1 }} />
        <button className="aw-btn">编辑</button>
        <button className="aw-btn">复制为新版本</button>
        <button className="aw-btn">打印</button>
        <button className="aw-btn">导出</button>
      </div>
      <div className="aw-doc-form-body">
        <Card>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
            <div style={{ fontSize:18, fontWeight:700, color:'var(--aw-fg-1)' }}>{current.name}</div>
            <span className={'aw-state aw-state-' + statusTone}>{current.status}</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,minmax(0,1fr))', gap:'10px 22px', fontSize:13, color:'var(--aw-fg-2)' }}>
            <span>工艺编号：<b className="aw-num">{current.code}</b></span>
            <span>适用产品：{current.product}</span>
            <span>版本号：{current.version}</span>
            <span>工艺分类：{current.category}</span>
            <span>工序总数：{current.steps} 道</span>
            <span>并序工序：{current.parallel} 道</span>
            <span>委外工序：{current.outsource} 道</span>
            <span>默认工艺：{current.isDefault}</span>
          </div>
        </Card>
        <Card>
          <Tabs items={[{k:'info',label:'工艺信息'},{k:'route',label:'工艺路线'},{k:'params',label:'工序参数'},{k:'log',label:'操作记录'}]} active={tab} onChange={setTab} />
          {tab === 'info' && (
            <div style={{ paddingTop:18 }}>
              <div className="section-title">基础信息</div>
              <div className="aw-doc-grid" style={{ marginTop:12 }}>
                <div>工艺编号：{current.code}</div>
                <div>工艺名称：{current.name}</div>
                <div>适用产品：{current.product}</div>
                <div>版本号：{current.version}</div>
                <div>适用范围：{current.scope}</div>
                <div>质检方案：{current.qcPlan || '—'}</div>
                <div>编制人：{current.creator}</div>
                <div>责任组织：{current.owner}</div>
                <div>创建日期：{current.created}</div>
                <div>更新日期：{current.updated}</div>
                <div>审批流程：工艺路线发布审批流程</div>
                <div>引用状态：未被在制订单锁定</div>
              </div>
            </div>
          )}
          {tab === 'route' && (
            <div style={{ paddingTop:18 }}>
              <div className="section-title">工艺路线</div>
              <div style={{ display:'flex', gap:14, alignItems:'center', margin:'12px 0', fontSize:12, color:'var(--aw-fg-2)' }}>
                <span><i style={{ display:'inline-block', width:10, height:10, borderRadius:2, background:'#52C41A', marginRight:5 }} />自制</span>
                <span><i style={{ display:'inline-block', width:10, height:10, borderRadius:2, background:'#FA8C16', marginRight:5 }} />委外</span>
                <span><i style={{ display:'inline-block', width:10, height:10, borderRadius:2, background:'#F43F5E', marginRight:5 }} />返工</span>
              </div>
              <div className="aw-table-scroll">
                <div style={{ display:'flex', alignItems:'flex-start', gap:0, minWidth:760, padding:'12px 4px' }}>
                  {DETAIL_STEPS.map((step, si) => (
                    <React.Fragment key={si}>
                      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                        {step.procs.map((p, pi) => {
                          const isOut = p.type === 'outsource';
                          const isRework = p.routeType === 'rework';
                          const b = isRework ? '#F43F5E' : isOut ? '#FA8C16' : '#52C41A';
                          return (
                            <div key={pi} style={{ border:`1px solid ${b}`, background:isRework?'#FFF1F2':isOut?'#FFF7E6':'#F6FFED', borderRadius:6, padding:'10px 12px', minWidth:132, fontSize:12 }}>
                              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5, gap:8 }}>
                                <span style={{ fontWeight:600, color:'#1F2937' }}>{p.name}</span>
                                <span style={{ background:b, color:'#fff', borderRadius:3, padding:'1px 5px', fontSize:11 }}>{step.seq}</span>
                              </div>
                              <div style={{ color:'#6B7280', marginBottom:5 }}>{p.code}</div>
                              <span style={{ border:`1px solid ${b}`, color:b, borderRadius:3, padding:'1px 6px', fontSize:10 }}>{isRework ? '返工' : isOut ? '委外' : '自制'}</span>
                              {isRework && <div style={{ color:'#9CA3AF', marginTop:5, fontSize:10 }}>触发：{p.reworkTrigger}；回流：{p.reworkTarget}</div>}
                            </div>
                          );
                        })}
                      </div>
                      {si < DETAIL_STEPS.length - 1 && <div style={{ padding:'0 10px', color:'#D1D5DB', fontSize:22, alignSelf:'flex-start', marginTop:18 }}>→</div>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}
          {tab === 'params' && (
            <div className="aw-table-scroll" style={{ paddingTop:18 }}>
              <table className="aw-table">
                <thead><tr>{['序号','工序编号','工序名称','工序类型','默认执行','标准工时','质检方案','副产品'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                  {paramRows.map(r => <tr key={r.seq}><td>{r.seq}</td><td className="aw-num aw-link">{r.code}</td><td>{r.name}</td><td>{r.type}</td><td>{r.work}</td><td>{r.hours}</td><td>{r.qc}</td><td>{r.output}</td></tr>)}
                </tbody>
              </table>
            </div>
          )}
          {tab === 'log' && <div style={{ fontSize:13, color:'var(--aw-fg-3)', textAlign:'center', padding:'34px 0' }}>暂无操作记录</div>}
        </Card>
      </div>
    </div>
  );
}

const DETAIL_STAGES_V2 = [
  { id:'detail-st-1', kind:'seq', ops:[{ id:'detail-op-1', code:'OP1101', name:'来料检验', type:'in', cat:'检验', workCenter:'质检中心', equipment:'检验台 1', setupTime:0, runTime:4, queueTime:15, laborCount:1, costRate:1.2, qcRequired:true, qcPlan:'首件 + 巡检', sopCode:'SOP-118', materialRows:[['M-001','主控板组件',1,'件']], wasteRows:[['检验不良隔离品','按实计','件']] }] },
  { id:'detail-st-2', kind:'par', ops:[
    { id:'detail-op-2', code:'OP1102', name:'切割', type:'in', cat:'加工', workCenter:'一车间', equipment:'CNC-01', setupTime:15, runTime:8, queueTime:30, laborCount:1, costRate:1.2, qcRequired:false, qcPlan:'随机抽检', sopCode:'SOP-236', materialRows:[['M-101','铝型材毛坯',1,'件'],['M-203','螺丝 M3x8',4,'个']], wasteRows:[['切削屑',0.02,'kg']] },
    { id:'detail-op-3', code:'OP1103', name:'钻孔', type:'in', cat:'加工', workCenter:'一车间', equipment:'CNC-02', setupTime:10, runTime:5, queueTime:30, laborCount:1, costRate:1.2, qcRequired:false, qcPlan:'随机抽检', sopCode:'SOP-241', materialRows:[['M-101','铝型材毛坯',1,'件']], wasteRows:[['孔屑',0.01,'kg']] },
    { id:'detail-op-4', code:'OP1104', name:'车削', type:'in', cat:'加工', workCenter:'二车间', equipment:'CNC-03', setupTime:20, runTime:12, queueTime:30, laborCount:1, costRate:1.2, qcRequired:false, qcPlan:'随机抽检', sopCode:'SOP-245', materialRows:[['M-102','轴套毛坯',1,'件']], wasteRows:[['车削屑',0.03,'kg']] },
  ] },
  { id:'detail-st-3', kind:'seq', ops:[{ id:'detail-op-5', code:'OP1105', name:'组装', type:'in', cat:'装配', workCenter:'装配车间', equipment:'装配台 A', setupTime:10, runTime:20, queueTime:20, laborCount:2, costRate:1.2, qcRequired:true, qcPlan:'首件 + 巡检', sopCode:'SOP-352', materialRows:[['M-301','控制器壳体',1,'套'],['M-302','线束组件',1,'套']], wasteRows:[['装配损耗',0.01,'套']] }] },
  { id:'detail-st-4', kind:'par', ops:[
    { id:'detail-op-6', code:'OP1106', name:'委外热处理', type:'out', cat:'委外', supplier:'南海五金加工厂', agreement:'XY-2026-007', setupTime:0, runTime:480, queueTime:1440, laborCount:0, costRate:8.5, qcRequired:true, qcPlan:'来料复检', sopCode:'SOP-481', materialRows:[['M-401','待热处理半成品',1,'件']], wasteRows:[['委外损耗',0,'件']] },
    { id:'detail-op-7', code:'OP1107', name:'抛光', type:'in', cat:'表面', workCenter:'表面处理线', equipment:'抛光机 1', setupTime:5, runTime:8, queueTime:30, laborCount:1, costRate:1.2, qcRequired:false, qcPlan:'外观抽检', sopCode:'SOP-418', materialRows:[['M-501','抛光耗材',15,'g']], wasteRows:[['抛光粉尘',0.02,'kg']] },
  ] },
  { id:'detail-st-5', kind:'seq', ops:[{ id:'detail-op-8', code:'OP1108', name:'调试', type:'in', cat:'装配', workCenter:'装配车间', equipment:'调试台 A', setupTime:5, runTime:15, queueTime:20, laborCount:1, costRate:1.2, qcRequired:true, qcPlan:'功能全检', sopCode:'SOP-513', materialRows:[['M-601','测试治具',1,'套']], wasteRows:[['异常返修品','按实计','件']] }] },
  { id:'detail-st-6', kind:'seq', ops:[{ id:'detail-op-9', code:'OP1109', name:'出货检验', type:'in', cat:'检验', workCenter:'质检中心', equipment:'检验台 2', setupTime:0, runTime:5, queueTime:15, laborCount:1, costRate:1.2, qcRequired:true, qcPlan:'OQC 全检', sopCode:'SOP-612', materialRows:[['M-701','成品待检件',1,'件']], wasteRows:[['不合格隔离品','按实计','件']] }] },
  { id:'detail-st-7', kind:'seq', ops:[{ id:'detail-op-10', code:'OP1110', name:'包装', type:'in', cat:'包装', workCenter:'包装车间', equipment:'包装线 A', setupTime:5, runTime:5, queueTime:10, laborCount:1, costRate:1.2, qcRequired:false, qcPlan:'包装抽检', sopCode:'SOP-701', materialRows:[['M-801','包装箱',1,'个'],['M-802','标签',1,'张']], wasteRows:[['包装边角料',0.01,'kg']] }] },
];

const CRAFT_DETAIL_TEXT_V2 = `本工艺适用于智能温控锅 AW-H8 整机制造，覆盖来料检验、关键零件加工、整机装配、委外热处理、功能调试、出货检验与包装入库全过程。

工艺路线采用串序与并序结合的组织方式：加工段支持切割、钻孔、车削并行处理，表面处理段支持委外热处理与本厂抛光同步推进；系统按并序节点最大时长计算工艺总时长。关键质量控制点包括来料检验、装配首件确认、功能全检和 OQC 全检。

执行时需优先使用已维护的工作中心、设备、SOP、检验方案和物料消耗标准。若出现尺寸超差、装配异常或功能测试不通过，应按质检策略进入返修或隔离流程，并记录异常原因、责任工序和复检结果。`;

function calcCraftDetailStatsV2(stages) {
  let inOps = 0;
  let outOps = 0;
  let totalMin = 0;
  let totalCost = 0;
  let laborMin = 0;
  stages.forEach(stage => {
    const stageTimes = stage.ops.map(op => op.setupTime + op.runTime);
    totalMin += stageTimes.length ? Math.max(...stageTimes) : 0;
    stage.ops.forEach(op => {
      if (op.type === 'in') inOps += 1;
      else outOps += 1;
      totalCost += (op.setupTime + op.runTime) * op.costRate;
      laborMin += (op.setupTime + op.runTime) * op.laborCount;
    });
  });
  return { inOps, outOps, totalMin, totalCost: totalCost.toFixed(0), laborMin };
}

function CraftDetailOpCardV2({ op, selected, onSelect }) {
  const isIn = op.type === 'in';
  const totalTime = op.setupTime + op.runTime;
  return (
    <div className={'cf-op ' + (isIn ? 'in' : 'out') + (selected ? ' selected' : '')} onClick={onSelect} style={{cursor:'pointer'}}>
      <div className="cf-op-h">
        <span className="num">{op.code}</span>
        <span className="nm">{op.name}</span>
      </div>
      <div className="cf-op-tags">
        <span className={'cf-op-tag ' + (isIn ? 'in-tag' : 'out-tag')}>{isIn ? '自制' : '委外'}</span>
        <span className="cf-op-tag">{op.cat}</span>
        {op.qcRequired && <span className="cf-op-tag" style={{background:'#FBDFDF',color:'#7A2A2A'}}>需检验</span>}
      </div>
      <div className="cf-op-b">
        <div className="cf-op-b-row">
          <span className="k">{isIn ? '工作中心' : '委外厂商'}</span>
          <span className="v" style={{fontFamily:'inherit',fontWeight:500,maxWidth:130,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{isIn ? op.workCenter : op.supplier}</span>
        </div>
        <div className="cf-op-b-row">
          <span className="k">{isIn ? '设备' : '工艺时长'}</span>
          <span className="v" style={{fontFamily:isIn?'inherit':'var(--aw-font-num)',fontWeight:500,maxWidth:130,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
            {isIn ? op.equipment : (totalTime >= 60 ? (totalTime / 60).toFixed(1) + ' h' : totalTime + ' min')}
          </span>
        </div>
        <div className="cf-op-b-row"><span className="k">单件工时</span><span className="v">{totalTime} min</span></div>
      </div>
      <div className="cf-op-f">
        <span className="av">{isIn ? '内' : '委'}</span>
        <span>{isIn ? `${op.laborCount} 人` : '外部加工'}</span>
        <span className="ml">¥ {(totalTime * op.costRate).toFixed(0)}/件</span>
      </div>
    </div>
  );
}

function CraftDetailStageViewV2({ stage, index, selectedOpId, onSelectOp }) {
  if (stage.kind === 'seq') {
    const op = stage.ops[0];
    return (
      <div className="cf-stage cf-stage-seq">
        <div style={{position:'relative'}}>
          <span className="cf-stage-no">{index + 1}</span>
          <CraftDetailOpCardV2 op={op} selected={op.id === selectedOpId} onSelect={() => onSelectOp(op.id)} />
        </div>
      </div>
    );
  }
  return (
    <div className="cf-stage">
      <div className="cf-stage-par">
        <span className="cf-par-gateway in"><span>⫲</span></span>
        <span className="cf-par-gateway out"><span>⫳</span></span>
        <span className="cf-stage-no par">{index + 1}</span>
        <span className="cf-stage-par-label">⫲ 并序 · 同时执行</span>
        {stage.ops.map(op => (
          <div key={op.id} className="cf-par-op-row">
            <CraftDetailOpCardV2 op={op} selected={op.id === selectedOpId} onSelect={() => onSelectOp(op.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}

function CraftDetailReadonlyPanelV2({ op, stage }) {
  const isIn = op.type === 'in';
  const rows = [
    ['工序编号', op.code],
    ['工序名称', op.name],
    ['工序分类', op.cat],
    ['工序类型', isIn ? '自制工序' : '委外工序'],
    ['排序方式', stage.kind === 'par' ? '并序，同时执行' : '串序，独立步骤'],
    [isIn ? '工作中心' : '委外厂商', isIn ? op.workCenter : op.supplier],
    [isIn ? '设备' : '外协协议', isIn ? op.equipment : op.agreement],
    ['准备工时', `${op.setupTime} min`],
    ['单件工时', `${op.runTime} min`],
    ['排队等待', `${op.queueTime} min`],
    ['合计时长', `${op.setupTime + op.runTime + op.queueTime} min`],
    [isIn ? '工价' : '外协单价', isIn ? `${op.costRate} 元/min` : `${op.costRate} 元/件`],
    ['是否检验', op.qcRequired ? '需要' : '不需要'],
    ['检验方案', op.qcPlan],
    ['SOP 编号', op.sopCode],
  ];
  return (
    <div style={{display:'grid',gridTemplateColumns:'minmax(0,1.1fr) minmax(280px,.9fr)',gap:16,alignItems:'start'}}>
      <Card title="工序只读信息">
        <div className="aw-kv-grid" style={{gridTemplateColumns:'repeat(2,minmax(0,1fr))'}}>
          {rows.map(([label, value]) => <div className="aw-kv" key={label}><div className="aw-kv-l">{label}</div><div className="aw-kv-v">{value}</div></div>)}
        </div>
      </Card>
      <Card title="物料与质量要求">
        <div className="section-title" style={{marginBottom:10}}>物料消耗（每件）</div>
        <table className="aw-table" style={{fontSize:12,minWidth:'auto'}}>
          <thead><tr><th>物料编码</th><th>名称</th><th>数量</th><th>单位</th></tr></thead>
          <tbody>{(op.materialRows || []).map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
        </table>
        <div className="section-title" style={{margin:'18px 0 10px'}}>副产品 / 废料</div>
        <table className="aw-table" style={{fontSize:12,minWidth:'auto'}}>
          <thead><tr><th>名称</th><th>数量</th><th>单位</th></tr></thead>
          <tbody>{(op.wasteRows || []).map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
        </table>
      </Card>
    </div>
  );
}

function CraftDetailScreenV2({ data, onBack }) {
  const [tab, setTab] = React.useState('info');
  const [selectedOpId, setSelectedOpId] = React.useState(DETAIL_STAGES_V2[0].ops[0].id);
  const current = data || CRAFT_SAMPLES[0];
  const stages = DETAIL_STAGES_V2;
  const stats = calcCraftDetailStatsV2(stages);
  const statusTone = current.tone || (current.status === '已生效' ? 'g' : current.status === '待审核' ? 'y' : current.status === '草稿' ? 'b' : 'gray');
  const selected = (() => {
    for (const stage of stages) {
      const op = stage.ops.find(item => item.id === selectedOpId);
      if (op) return { stage, op };
    }
    return { stage: stages[0], op: stages[0].ops[0] };
  })();
  const paramRows = stages.flatMap((stage, si) => stage.ops.map((op, oi) => ({
    seq: `${si + 1}${stage.ops.length > 1 ? '.' + (oi + 1) : ''}`,
    code: op.code,
    name: op.name,
    type: op.type === 'out' ? '委外' : '自制',
    work: op.type === 'out' ? op.supplier : op.workCenter,
    hours: `${op.setupTime + op.runTime} min`,
    qc: op.qcPlan,
    output: si === stages.length - 1 ? current.product : '半成品过程件',
  })));

  return (
    <div className="aw-doc-form">
      <div className="aw-doc-form-body" style={{padding:18}}>
        <DetailHeaderCard
          title={`${current.code} ${current.name}`}
          status={current.status}
          detailItems={[
            ['工艺编号', current.code],
            ['工艺分类', current.category],
            ['适用产品', current.product],
            ['版本号', current.version],
            ['编制人', `${current.creator} / ${current.owner}`],
            ['生效日期', '2026-06-01'],
          ]}
          onBack={onBack}
          creator={current.creator}
          createdAt={`${current.created || '2026-05-18'} 09:00`}
          modifier={current.owner}
          modifiedAt={`${current.updated || '2026-05-19'} 16:30`}
        />

        <div className="cf-summary" style={{marginTop:14}}>
          <div className="cf-summary-card"><div className="l">工序总数</div><div className="n">{stats.inOps + stats.outOps}<span className="u">道</span></div></div>
          <div className="cf-summary-card in"><div className="l">自制工序</div><div className="n">{stats.inOps}<span className="u">道</span></div></div>
          <div className="cf-summary-card out"><div className="l">委外工序</div><div className="n">{stats.outOps}<span className="u">道</span></div></div>
          <div className="cf-summary-card"><div className="l">工艺总时长 <span style={{color:'var(--aw-fg-4)'}}>(并序取最大)</span></div><div className="n">{(stats.totalMin/60).toFixed(1)}<span className="u">h</span></div></div>
          <div className="cf-summary-card"><div className="l">人工总工时</div><div className="n">{(stats.laborMin/60).toFixed(1)}<span className="u">h</span></div></div>
          <div className="cf-summary-card"><div className="l">单件成本</div><div className="n">¥ {stats.totalCost}</div></div>
        </div>

        <Card>
          <Tabs items={[{k:'info',label:'工艺详情'},{k:'route',label:'工艺路线'},{k:'params',label:'工序列表'},{k:'log',label:'操作记录'}]} active={tab} onChange={setTab} />
          {tab === 'route' && (
            <div style={{paddingTop:18}}>
              <div className="cf-canvas" style={{border:'1px solid var(--aw-border)',borderRadius:8,minHeight:360,maxHeight:520}}>
                <div className="cf-cv-bar">
                  <span className="legend">
                    <span className="lg"><span className="sw in"/> 自制</span>
                    <span className="lg"><span className="sw out"/> 委外</span>
                    <span className="lg"><span style={{display:'inline-block',width:24,height:2,background:'#5677FC',borderRadius:1}}/> 串序</span>
                    <span className="lg"><span style={{display:'inline-block',width:24,height:8,background:'#fff',border:'1.5px dashed #10B981',borderRadius:2}}/> 并序</span>
                  </span>
                  <div className="zoom"><span>只读</span><span>100%</span><span>适配</span></div>
                </div>
                <div className="cf-flow">
                  <div className="cf-conn start">
                    <span className="start-dot" />
                    <span className="start-badge">开始</span>
                    <div className="hline" />
                  </div>
                  {stages.map((stage, i) => (
                    <React.Fragment key={stage.id}>
                      <CraftDetailStageViewV2 stage={stage} index={i} selectedOpId={selectedOpId} onSelectOp={setSelectedOpId} />
                      <div className={'cf-conn' + (i === stages.length - 1 ? ' end' : '')}>
                        <div className="hline" />
                        {i < stages.length - 1 && <div className="arrow">→</div>}
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <div style={{fontSize:12,color:'var(--aw-fg-3)',marginTop:10}}>工艺路线按新增工艺页面的串序、并序和自制/委外结构展示。</div>
            </div>
          )}
          {tab === 'params' && (
            <div className="aw-table-scroll" style={{paddingTop:18}}>
              <table className="aw-table">
                <thead><tr>{['序号','工序编号','工序名称','工序类型','默认执行','标准工时','质检方案','副产品'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                <tbody>{paramRows.map(r => <tr key={r.seq}><td>{r.seq}</td><td className="aw-num aw-link">{r.code}</td><td>{r.name}</td><td>{r.type}</td><td>{r.work}</td><td>{r.hours}</td><td>{r.qc}</td><td>{r.output}</td></tr>)}</tbody>
              </table>
            </div>
          )}
          {tab === 'info' && (
            <div style={{paddingTop:18}}>
              <div className="aw-kv-grid">
                {[
                  ['适用范围', current.scope],
                  ['质检方案', current.qcPlan || 'IPQC + FQC'],
                  ['责任组织', current.owner],
                  ['创建日期', current.created],
                  ['更新日期', current.updated],
                  ['默认工艺', current.isDefault],
                  ['引用状态', '未被在制订单锁定'],
                ].map(([label, value]) => <div className="aw-kv" key={label}><div className="aw-kv-l">{label}</div><div className="aw-kv-v">{value}</div></div>)}
              </div>
              <div style={{marginTop:18}}>
                <div className="aw-section-title">工艺详情</div>
                <div style={{fontSize:13,lineHeight:1.9,color:'var(--aw-fg-2)',whiteSpace:'pre-wrap',marginTop:12}}>{CRAFT_DETAIL_TEXT_V2}</div>
              </div>
            </div>
          )}
          {tab === 'log' && <div style={{fontSize:13,color:'var(--aw-fg-3)',textAlign:'center',padding:'34px 0'}}>暂无操作记录</div>}
        </Card>
      </div>
    </div>
  );
}

// ─── Craft List Screen ──────────────────────────────────────────
function CraftListScreen({ onAdd, onView }) {
  const [rows] = React.useState(CRAFT_SAMPLES);
  const [sel, setSel] = React.useState({});
  const [fieldOpen, setFieldOpen] = React.useState(false);
  const allChecked = rows.length > 0 && rows.every(r => sel[r.id]);
  const toggleAll = () => {
    if (allChecked) setSel({});
    else setSel(rows.reduce((m, r) => ({ ...m, [r.id]: true }), {}));
  };
  const toggleRow = (id) => setSel(s => ({ ...s, [id]: !s[id] }));
  const statusTone = (r) => r.tone || (r.status === '已生效' ? 'g' : r.status === '待审核' ? 'y' : r.status === '草稿' ? 'b' : 'gray');
  return (
    <div>
      <div className="aw-doc-tb">
        <div className="aw-doc-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8"><circle cx="11" cy="11" r="6" /><path d="M16 16l4 4" /></svg>
          <input placeholder="搜索工艺名称 / 编号 / 适用产品…" />
        </div>
        <RefreshAction compact />
        <button className="aw-btn">筛选</button>
        <button className="aw-btn" onClick={() => setFieldOpen(true)}>字段配置</button>
        <button className="aw-btn">导出</button>
        <button className="aw-btn">导入</button>
        <button className="aw-btn primary" onClick={onAdd}>新增工艺</button>
      </div>
      <div className="aw-doc-tbl-wrap">
        <table className="aw-doc-tbl">
          <thead>
            <tr>
              <th style={{ width:40 }}><div className="aw-th-inner"><span className={'aw-chk' + (allChecked ? ' on' : '')} onClick={toggleAll} /></div></th>
              {['序号','工艺编号','工艺名称','适用产品','版本号','工艺分类','工序数','并序/委外','默认','状态','更新日期','操作'].map(h => <th key={h}><div className="aw-th-inner">{h}</div></th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} onClick={() => onView(r)} style={{ cursor:'pointer' }}>
                <td onClick={e => { e.stopPropagation(); toggleRow(r.id); }}><span className={'aw-chk' + (sel[r.id] ? ' on' : '')} /></td>
                <td>{i + 1}</td>
                <td className="aw-num aw-link">{r.code}</td>
                <td className="aw-link">{r.name}</td>
                <td>{r.product}</td>
                <td>{r.version}</td>
                <td>{r.category}</td>
                <td className="aw-num">{r.steps}</td>
                <td>{r.parallel} / {r.outsource}</td>
                <td>{r.isDefault}</td>
                <td><span className={'aw-state aw-state-' + statusTone(r)}>{r.status}</span></td>
                <td>{r.updated}</td>
                <td><span className="aw-link">查看</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="aw-list-footer">
        <div><span className={'aw-chk' + (allChecked ? ' on' : '')} onClick={toggleAll} /> 已选 {Object.values(sel).filter(Boolean).length} / {rows.length} 项 <button className="aw-btn" style={{ marginLeft:10 }}>批量操作</button></div>
        <div>共 {rows.length} 条 <select className="aw-select" style={{ width:86, margin:'0 8px' }}><option>10条/页</option></select><button className="aw-page on">1</button></div>
      </div>
      {fieldOpen && <FieldDrawer onClose={() => setFieldOpen(false)} />}
    </div>
  );
}

// ─── Craft Screen Router ─────────────────────────────────────────
function CraftScreen({ initialAction, onActionConsumed }) {
  const [view, setView] = React.useState('list');
  const [detail, setDetail] = React.useState(null);
  React.useEffect(() => {
    if (initialAction === 'new') {
      setView('add');
      setDetail(null);
      onActionConsumed && onActionConsumed();
    }
  }, [initialAction]);
  if(view==='add')    return <CraftNewScreen onBack={()=>setView('list')} />;
  if(view==='detail') return <CraftDetailScreenV2 data={detail} onBack={()=>setView('list')} />;
  return <CraftListScreen onAdd={()=>setView('add')} onView={d=>{setDetail(d);setView('detail');}} />;
}


window.CraftScreen = CraftScreen;
