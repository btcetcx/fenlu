// 生产中心：生产需求 / 生产计划 / 生产订单 / 生产工单 / 委外加工

const { useState: useMfgState, useEffect: useMfgEffect } = React;

const MFG_PRODUCTS = [
  { id:'p1', sourceLine:'SO-20260517001-01', code:'CP-2025010101', name:'智能温控终端', model:'PRO', unit:'台', qty:120, batch:'MO20260517001-01', bom:'BOM-V3.2', bomLock:'已锁版', route:'RT-总装-01', routeLock:'已锁版', process:'总装', kitGap:0, substitute:'无', qms:'FQC待检', wms:'待入库18', reported:80, good:78, bad:2, inbound:60, material:'齐套' },
  { id:'p2', sourceLine:'SO-20260517001-02', code:'CP-2025010102', name:'半成品模组', model:'HM-450', unit:'件', qty:300, batch:'MO20260517001-02', bom:'BOM-V2.1', bomLock:'待锁版', route:'RT-焊接-02', routeLock:'待锁版', process:'焊接', kitGap:34, substitute:'WL-5786931-A', qms:'IPQC巡检', wms:'待报检', reported:120, good:118, bad:2, inbound:0, material:'缺料' },
  { id:'p3', sourceLine:'RD-202605-008-01', code:'CP-2025010103', name:'铝合金外壳', model:'AL-6061', unit:'套', qty:260, batch:'MO20260517001-03', bom:'BOM-V1.8', bomLock:'已锁版', route:'RT-机加工-01', routeLock:'已锁版', process:'机加工', kitGap:0, substitute:'无', qms:'委外FQC合格', wms:'已入库252', reported:260, good:252, bad:8, inbound:252, material:'齐套' },
];

const MFG_INITIAL_STATUS = {
  mfgDemand: '待确认',
  mfgPlan: '草稿',
  mfgOrder: '待生产',
  mfgWorkOrder: '待开工',
  mfgOutsource: '待发料',
};

const MFG_CONFIG = {
  mfgDemand: {
    title:'生产需求', treeTitle:'需求分类', groups:['全部需求','销售订单需求','库存备货需求','手动需求','已关闭需求'],
    newLabel:'新增生产需求', codeLabel:'需求编号', subjectLabel:'需求主题', statusLabel:'需求状态',
    statuses:['待确认','已确认','已转计划','已关闭'], row:{subject:'销售订单生产需求',code:'MR-20260517001', source:'SO-20260517001', product:'智能温控终端', qty:120, date:'2026-05-17', end:'2026-05-30', owner:'老夏', status:'待确认'}
  },
  mfgPlan: {
    title:'生产计划', treeTitle:'计划分类', groups:['全部计划','绑定销售订单','不绑定销售订单','待排产','执行中'],
    newLabel:'新增生产计划', codeLabel:'计划编号', subjectLabel:'计划主题', statusLabel:'计划状态',
    statuses:['草稿','待审批','已批准','执行中','已完成'], row:{subject:'6月温控终端生产计划',code:'MP-20260517001', source:'SO-20260517001', product:'智能温控终端', qty:120, date:'2026-05-18', end:'2026-06-05', owner:'计划员王敏', status:'待审批'}
  },
  mfgOrder: {
    title:'生产订单', treeTitle:'订单分类', groups:['全部生产订单','内部生产','销售订单生产','库存备货生产','已关闭订单'],
    newLabel:'新增生产订单', codeLabel:'生产编号', subjectLabel:'生产主题', statusLabel:'生产状态',
    statuses:['待生产','生产中','部分完工','已完工','已关闭'], row:{subject:'202604智能温控终端生产205',code:'MO-20260517001', source:'MP-20260517001', product:'智能温控终端', qty:120, date:'2026-05-18', end:'2026-06-03', owner:'生产一部', status:'生产中'}
  },
  mfgWorkOrder: {
    title:'生产工单', treeTitle:'工单分类', groups:['全部工单','待开工','生产中','待报工','已完工'],
    newLabel:'新增生产工单', codeLabel:'工单编号', subjectLabel:'工单主题', statusLabel:'工单状态',
    statuses:['待开工','生产中','待质检','已完工','暂停'], row:{subject:'总装工序生产工单',code:'WO-20260517001', source:'MO-20260517001', product:'智能温控终端', qty:120, date:'2026-05-19', end:'2026-05-26', owner:'三红', status:'生产中'}
  },
  mfgOutsource: {
    title:'委外加工', treeTitle:'委外分类', groups:['全部委外','绑定销售订单','不绑定销售订单','待发料','待入库'],
    newLabel:'新增委外加工', codeLabel:'委外编号', subjectLabel:'委外主题', statusLabel:'委外状态',
    statuses:['待发料','部分发料','已发料','加工中','待收货','待质检','已质检','部分入库','已入库','已关闭'], row:{subject:'外壳表面处理委外加工',code:'OS-20260517001', source:'MO-20260517001', product:'铝合金外壳', qty:260, date:'2026-05-20', end:'2026-05-28', owner:'深圳协同加工厂', status:'待发料'}
  },
};

function MfgTone({ status }) {
  const green = ['已生成','已确认','已批准','已完成','已完工','已入库','已发料','已质检'];
  const yellow = ['待确认','待审批','待生产','待开工','待发料','待收货','待报工','待排产','部分发料','待质检','部分入库','加工中'];
  const red = ['已撤回','已关闭','暂停','缺料'];
  return <Badge tone={green.includes(status)?'g':red.includes(status)?'r':yellow.includes(status)?'y':'b'}>{status}</Badge>;
}

function MfgTree({ config, picked, setPicked }) {
  return (
    <div className="aw-doc-tree">
      <div className="aw-doc-tree-h">{config.treeTitle} <span className="aw-doc-tree-n">(999)</span></div>
      <div className="aw-doc-tree-list">
        {config.groups.map((g, idx) => (
          <div className={'aw-tree-row aw-tree-l2' + (picked === g ? ' on' : '')} key={g} onClick={() => setPicked(g)}>
            <span className="aw-tree-caret">{idx === 0 ? '▾' : ''}</span><TileIcon name={idx === 0 ? 'folder' : 'doc'} size={14}/><span>{g}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MfgRows({ config, moduleKey, onDetail }) {
  const rows = [
    { ...config.row, factoryWorkshop:'一号工厂 / 总装车间', lineName:'总装产线A', doneQty: moduleKey === 'mfgPlan' ? 72 : 0 },
    { ...config.row, subject: moduleKey === 'mfgOutsource' ? '结构件电镀委外' : moduleKey === 'mfgWorkOrder' ? '焊接工序工单' : '安全库存补货生产', code: config.row.code.replace('001','002'), source:'手动创建', product:'半成品模组', qty:300, factoryWorkshop:'一号工厂 / 焊接车间', lineName:'焊接产线A', doneQty: moduleKey === 'mfgPlan' ? 180 : 0, status:config.statuses[1] || config.row.status },
    { ...config.row, subject:'样机试制生产', code: config.row.code.replace('001','003'), source:'RD-202605-008', product:'铝合金外壳', qty:260, factoryWorkshop:'二号工厂 / 机加工车间', lineName:'机加工产线B', doneQty: moduleKey === 'mfgPlan' ? 260 : 0, status:config.statuses[2] || config.row.status },
  ];
  const [sel, setSel] = useMfgState({0:true,1:true});
  const checked = Object.values(sel).filter(Boolean).length;
  const toggle = i => setSel(s => ({ ...s, [i]: !s[i] }));
  const progress = r => Math.max(0, Math.min(100, Math.round((Number(r.doneQty || 0) / Math.max(Number(r.qty || 0), 1)) * 100)));
  return (
    <>
      <div className="aw-doc-tbl-inner">
        <table className="aw-doc-tbl">
          <thead>
            <tr>
              <PurchaseSelectHeader checked={checked === rows.length} indeterminate={checked > 0 && checked < rows.length} onToggle={() => checked === rows.length ? setSel({}) : setSel({0:true,1:true,2:true})}/>
              <PurchaseIndexHeader />
              <th><div className="aw-th-inner">{config.subjectLabel}</div></th>
              <th><div className="aw-th-inner">{config.codeLabel}</div></th>
              <th><div className="aw-th-inner">来源单据</div></th>
              <th><div className="aw-th-inner">产品概要</div></th>
              <th><div className="aw-th-inner">{moduleKey === 'mfgDemand' ? '需求数量' : '计划数量'}</div></th>
              {moduleKey === 'mfgPlan' && <th><div className="aw-th-inner">进度</div></th>}
              <th><div className="aw-th-inner">开始日期</div></th>
              <th><div className="aw-th-inner">交付日期</div></th>
              {moduleKey === 'mfgWorkOrder' && <th><div className="aw-th-inner">工厂车间</div></th>}
              {moduleKey === 'mfgWorkOrder' && <th><div className="aw-th-inner">产线</div></th>}
              <th><div className="aw-th-inner">{moduleKey === 'mfgOutsource' ? '加工商' : moduleKey === 'mfgWorkOrder' ? '负责人' : '责任部门'}</div></th>
              <PurchaseStatusFilterHeader label={config.statusLabel} options={config.statuses} />
              <th><div className="aw-th-inner">操作</div></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.code}>
                <PurchaseSelectCell checked={!!sel[i]} onToggle={() => toggle(i)} />
                <td className="aw-num">{i + 1}</td>
                <td><span className="aw-link" onClick={() => onDetail(r)}>{r.subject}</span></td>
                <td className="aw-num">{r.code}</td>
                <td>{r.source}</td>
                <td>{r.product}</td>
                <td className="aw-num">{r.qty}</td>
                {moduleKey === 'mfgPlan' && <td style={{minWidth:130}}><div style={{display:'flex',alignItems:'center',gap:8}}><div style={{width:76,height:6,borderRadius:999,background:'var(--aw-surface-3)',overflow:'hidden'}}><div style={{width:`${progress(r)}%`,height:'100%',background:progress(r)>=100?'var(--aw-success)':'var(--aw-primary)'}} /></div><span className="aw-num">{progress(r)}%</span></div></td>}
                <td>{r.date}</td>
                <td>{r.end}</td>
                {moduleKey === 'mfgWorkOrder' && <td>{r.factoryWorkshop}</td>}
                {moduleKey === 'mfgWorkOrder' && <td>{r.lineName}</td>}
                <td>{r.owner}</td>
                <td><MfgTone status={r.status}/></td>
                <td><span className="aw-link" onClick={() => onDetail(r)}>查看</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PurchaseListFooter total={rows.length} selectedCount={checked} allChecked={checked === rows.length} someChecked={checked > 0} onToggleAll={() => checked === rows.length ? setSel({}) : setSel({0:true,1:true,2:true})}/>
    </>
  );
}

function MfgListView({ config, moduleKey, onNew, onDetail }) {
  return (
    <div className="aw-doc-main">
      <PurchaseListToolbar searchPlaceholder={`全局搜索（如${config.subjectLabel}、${config.codeLabel}、产品名称...）`} newLabel={config.newLabel} onNew={onNew}/>
      <MfgRows config={config} moduleKey={moduleKey} onDetail={onDetail}/>
    </div>
  );
}

function MfgTitleField({ value, onChange, onPick, placeholder }) {
  return (
    <div style={{display:'flex',alignItems:'center',height:32,border:'1px solid var(--aw-border-strong)',background:'#fff'}}>
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{flex:1,minWidth:0,border:0,outline:'none',padding:'0 10px',height:'100%',font:'inherit',fontSize:13,background:'transparent'}} />
      <button type="button" title="选择来源" onClick={onPick} style={{width:34,height:30,border:0,borderLeft:'1px solid var(--aw-divider)',background:'#fff',cursor:'pointer',color:'var(--aw-primary)',fontSize:16}}>⌕</button>
    </div>
  );
}

function mfgSourceRows(type) {
  const rows = {
    销售订单: [
      { type:'销售订单', code:'SO-20260517001', title:'海南微为智能终端销售订单', customer:'海南微为智造产业有限公司', product:'智能温控终端', qty:120, date:'2026-05-30', productRef:MFG_PRODUCTS[0] },
      { type:'销售订单', code:'SO-20260517002', title:'年度补货销售订单', customer:'广州明德贸易有限公司', product:'半成品模组', qty:300, date:'2026-06-05', productRef:MFG_PRODUCTS[1] },
    ],
    生产需求: [
      { type:'生产需求', code:'MR-20260517001', title:'销售订单生产需求', customer:'海南微为智造产业有限公司', product:'智能温控终端', qty:120, date:'2026-05-30', productRef:MFG_PRODUCTS[0] },
      { type:'生产需求', code:'MR-20260517002', title:'安全库存补货需求', customer:'成品仓补货', product:'半成品模组', qty:300, date:'2026-06-05', productRef:MFG_PRODUCTS[1] },
    ],
    生产计划: [
      { type:'生产计划', code:'MP-20260517001', title:'6月温控终端生产计划', customer:'生产一部', product:'智能温控终端', qty:120, date:'2026-06-03', productRef:MFG_PRODUCTS[0] },
      { type:'生产计划', code:'MP-20260517002', title:'半成品模组补货计划', customer:'装配车间', product:'半成品模组', qty:300, date:'2026-06-08', productRef:MFG_PRODUCTS[1] },
    ],
    生产订单: [
      { type:'生产订单', code:'MO-20260517001', title:'智能温控终端生产订单', customer:'生产一部', product:'智能温控终端', qty:120, date:'2026-06-03', productRef:MFG_PRODUCTS[0] },
      { type:'生产订单', code:'MO-20260517002', title:'半成品模组生产订单', customer:'装配车间', product:'半成品模组', qty:300, date:'2026-06-08', productRef:MFG_PRODUCTS[1] },
    ],
    生产工单: [
      { type:'生产工单', code:'WO-20260517001-01', title:'半成品模组焊接工单', customer:'焊接产线A', product:'半成品模组', qty:120, date:'2026-05-28', productRef:MFG_PRODUCTS[1] },
      { type:'生产工单', code:'WO-20260517001-03', title:'智能温控终端总装工单', customer:'总装产线A', product:'智能温控终端', qty:120, date:'2026-06-03', productRef:MFG_PRODUCTS[0] },
    ],
    库存备货: [
      { type:'库存备货', code:'STOCK-PLAN-01', title:'成品仓安全库存补货', customer:'成品仓', product:'智能温控终端', qty:80, date:'2026-06-05', productRef:{...MFG_PRODUCTS[0], qty:80, sourceLine:'STOCK-PLAN-01-01'} },
    ],
  };
  return rows[type] || rows.销售订单;
}

function MfgSourcePicker({ title='选择来源单据', sourceTypes=['销售订单'], onClose, onConfirm }) {
  const [active, setActive] = useMfgState(sourceTypes[0]);
  const [selectedCode, setSelectedCode] = useMfgState('');
  const rows = mfgSourceRows(active);
  const selected = rows.find(r => r.code === selectedCode) || rows[0];
  return (
    <StandardModal title={title} size="lg" onClose={onClose}
      footer={<><Btn onClick={onClose}>取消</Btn><Btn kind="primary" onClick={() => onConfirm(selected)}>确定</Btn></>}>
      <div style={{display:'grid',gridTemplateColumns:'170px 1fr',minHeight:420}}>
        <div style={{borderRight:'1px solid var(--aw-border)',padding:8,background:'var(--aw-surface-2)'}}>
          {sourceTypes.map(t => <div key={t} className={'aw-tree-row aw-tree-l2' + (active === t ? ' on' : '')} onClick={()=>{setActive(t); setSelectedCode('');}}><span className="aw-tree-caret">{active === t ? '▾' : ''}</span><TileIcon name={t.includes('订单')?'list':t.includes('工单')?'edit':t.includes('计划')?'folder':'doc'} size={14}/><span>{t}列表</span></div>)}
        </div>
        <div style={{minWidth:0,padding:'0 0 0 14px'}}>
          <PurchaseListToolbar searchPlaceholder={`搜索${active}编号、主题、产品名称`} hideNew />
          <table className="aw-table">
            <thead><tr><th style={{width:46}}></th><th>序号</th><th>单据编号</th><th>单据主题</th><th>主体</th><th>产品</th><th>数量</th><th>交付日期</th></tr></thead>
            <tbody>{rows.map((r,i)=><tr key={r.code} onClick={()=>setSelectedCode(r.code)} style={{cursor:'pointer',background:(selectedCode || rows[0].code) === r.code ? 'var(--aw-primary-soft)' : undefined}}><td><input type="radio" checked={(selectedCode || rows[0].code) === r.code} onChange={()=>setSelectedCode(r.code)} /></td><td>{i+1}</td><td className="aw-link">{r.code}</td><td>{r.title}</td><td>{r.customer}</td><td>{r.product}</td><td>{r.qty}</td><td>{r.date}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </StandardModal>
  );
}

const MFG_WORK_ORDER_ROWS = [
  { code:'WO-20260517001-01', type:'半成品工单', name:'半成品模组焊接工单', item:'半成品模组', process:'焊接', line:'焊接产线A', qty:120, done:120, good:118, bad:2, owner:'三红', qms:'IPQC巡检', status:'已完工' },
  { code:'WO-20260517001-02', type:'关键工序工单', name:'外壳装配工单', item:'铝合金外壳组件', process:'装配', line:'装配工位02', qty:120, done:80, good:78, bad:2, owner:'李工', qms:'IPQC巡检', status:'生产中' },
  { code:'WO-20260517001-03', type:'成品总装工单', name:'成品总装工单', item:'智能温控终端', process:'总装', line:'总装产线A', qty:120, done:0, good:0, bad:0, owner:'王工', qms:'FQC完工检', status:'待开工' },
];

const MFG_SCHEDULE_SHIFTS = [
  { code:'A', name:'早班', short:'早', time:'08:00-16:00', hours:8, rest:'60分钟', ratio:'1.0x', color:'#FDECDC', fg:'#B26A24', cross:false, status:'启用', preset:true },
  { code:'B', name:'中班', short:'中', time:'16:00-00:00', hours:8, rest:'45分钟', ratio:'1.0x', color:'#DCE7FB', fg:'#2E4A85', cross:true, status:'启用', preset:true },
  { code:'C', name:'夜班', short:'夜', time:'00:00-08:00', hours:8, rest:'45分钟', ratio:'1.2x', color:'#E8DEFB', fg:'#4D2F84', cross:false, status:'启用', preset:true },
  { code:'D', name:'常白', short:'白', time:'08:30-17:30', hours:8, rest:'60分钟', ratio:'1.0x', color:'#DBF3E6', fg:'#1F6A40', cross:false, status:'启用', preset:true },
  { code:'E', name:'弹性', short:'弹', time:'09:00-18:00', hours:8, rest:'60分钟', ratio:'1.0x', color:'#E8F5F4', fg:'#16756A', cross:false, status:'启用', preset:true },
  { code:'O', name:'加班', short:'加', time:'18:00-21:00', hours:3, rest:'0分钟', ratio:'1.5x', color:'#FFE7B3', fg:'#7A4F00', cross:false, status:'启用', preset:true },
  { code:'R', name:'休息', short:'休', time:'--', hours:0, rest:'--', ratio:'0x', color:'#F3F4F6', fg:'#6B7280', cross:false, status:'启用', preset:true },
];

const MFG_SCHEDULE_TEAMS = [
  { code:'TEAM-001', name:'总装一班', workshop:'总装车间', line:'总装产线A', leader:'三红', pattern:'三班两运转', skills:['总装','包装'], members:18, hours:720, attendance:'98%', capacity:144, demand:132, plan:'SP-202606-A01', status:'启用' },
  { code:'TEAM-002', name:'焊接夜班', workshop:'焊接车间', line:'焊接产线A', leader:'李工', pattern:'两班倒', skills:['焊接','点检'], members:12, hours:504, attendance:'96%', capacity:84, demand:96, plan:'SP-202606-B02', status:'启用' },
  { code:'TEAM-003', name:'机加工A组', workshop:'机加工车间', line:'CNC-01', leader:'王敏', pattern:'常白', skills:['CNC','检具'], members:15, hours:660, attendance:'99%', capacity:120, demand:118, plan:'SP-202606-C03', status:'启用' },
];

const MFG_SCHEDULE_PLANS = [
  { code:'SP-202606-A01', name:'2026年6月总装一班排班', team:'总装一班', pattern:'A-B-C-R', calendar:'2026标准工作日历', start:'2026-06-01', end:'2026-06-30', days:30, people:18, hours:720, demandHours:688, coverage:'104.7%', conflicts:1, approval:'发布免审', status:'已发布' },
  { code:'SP-202606-B02', name:'焊接车间夜班补充计划', team:'焊接夜班', pattern:'B-C-R-R', calendar:'2026标准工作日历', start:'2026-06-01', end:'2026-06-28', days:28, people:12, hours:504, demandHours:548, coverage:'92.0%', conflicts:2, approval:'生产经理审批', status:'待审批' },
  { code:'SP-202606-C03', name:'机加工A组常白计划', team:'机加工A组', pattern:'D-D-D-D-D-R-R', calendar:'2026标准工作日历', start:'2026-06-01', end:'2026-06-30', days:30, people:15, hours:660, demandHours:640, coverage:'103.1%', conflicts:0, approval:'草稿未提交', status:'草稿' },
];

const MFG_SCHEDULE_EMPLOYEES = [
  { name:'三红', no:'P006', team:'总装一班', station:'总装工位01', skill:'总装', cert:'装配上岗证', weeklyLimit:48, shifts:['A','A','B','B','C','R','R'], source:'计划生成', reason:'-' },
  { name:'陈思源', no:'P018', team:'总装一班', station:'包装工位02', skill:'包装', cert:'包装检验', weeklyLimit:48, shifts:['A','B','B','C','C','R','O'], source:'手工调整', reason:'周日临时加班' },
  { name:'李工', no:'P022', team:'焊接夜班', station:'焊接工位A', skill:'焊接', cert:'焊工证', weeklyLimit:44, shifts:['B','B','C','C','R','R','A'], source:'计划生成', reason:'-' },
  { name:'王敏', no:'P031', team:'机加工A组', station:'CNC-01', skill:'CNC', cert:'CNC高级', weeklyLimit:48, shifts:['D','D','D','D','D','R','R'], source:'计划生成', reason:'-' },
  { name:'赵凯', no:'P044', team:'总装一班', station:'点检区', skill:'点检', cert:'设备点检', weeklyLimit:40, shifts:['R','A','A','B','B','C','R'], source:'手工调整', reason:'补位夜班' },
];

const MFG_SCHEDULE_DAYS = ['06-01 周一','06-02 周二','06-03 周三','06-04 周四','06-05 周五','06-06 周六','06-07 周日'];
const MFG_SCHEDULE_CALENDAR_EXCEPTIONS = [
  { day:'06-01 周一', type:'节假日', rule:'强制休 R', note:'端午假期调休' },
  { day:'06-02 周二', type:'节假日', rule:'强制休 R', note:'端午假期调休' },
  { day:'06-08 周一', type:'调班', rule:'若循环为 R 自动改 A', note:'补 06-01 工作量' },
];
const MFG_SCHEDULE_CONFLICTS = [
  { level:'高', target:'李工 / 06-07 周日', issue:'连续夜班后 8 小时内安排早班', fix:'建议改为 R 或 D' },
  { level:'中', target:'陈思源 / 本周', issue:'周工时 43h，含 3h 加班', fix:'需填写临时加班原因' },
  { level:'中', target:'焊接夜班', issue:'计划覆盖率 92.0%，产能低于需求', fix:'增加 1 名焊接人员或启用 O 班' },
];

function mfgShiftHours(code) {
  const shift = MFG_SCHEDULE_SHIFTS.find(s => s.code === code);
  return shift ? Number(shift.hours || 0) : 0;
}

function mfgEmployeeWeekHours(emp) {
  return emp.shifts.reduce((sum, code) => sum + mfgShiftHours(code), 0);
}

function mfgScheduleCounts(rows) {
  return MFG_SCHEDULE_SHIFTS.reduce((acc, shift) => {
    acc[shift.code] = rows.reduce((sum, emp) => sum + emp.shifts.filter(code => code === shift.code).length, 0);
    return acc;
  }, {});
}

function MfgScheduleShiftChip({ code, compact=false, onClick }) {
  const shift = MFG_SCHEDULE_SHIFTS.find(s => s.code === code);
  if (!shift) return <span onClick={onClick} style={{display:'inline-flex',alignItems:'center',justifyContent:'center',minWidth:compact?34:54,height:compact?24:34,border:'1px dashed var(--aw-border-strong)',color:'var(--aw-fg-4)',cursor:onClick?'pointer':'default'}}>+</span>;
  return (
    <span onClick={onClick} title={`${shift.name} ${shift.time}`} style={{display:'inline-flex',alignItems:'center',justifyContent:'center',gap:compact?3:6,minWidth:compact?38:58,height:compact?24:34,padding:'0 8px',borderRadius:6,background:shift.color,color:shift.fg,fontSize:compact?12:13,fontWeight:600,cursor:onClick?'pointer':'default',boxShadow:onClick?'0 1px 2px rgba(15,23,42,.08)':undefined}}>
      <span className="aw-num">{shift.code}</span>{!compact && <span>{shift.short}</span>}
    </span>
  );
}

function MfgScheduleTopStats({ rows = MFG_SCHEDULE_EMPLOYEES, onConflicts }) {
  const totalHours = rows.reduce((sum, emp) => sum + mfgEmployeeWeekHours(emp), 0);
  const overtime = rows.reduce((sum, emp) => sum + Math.max(0, mfgEmployeeWeekHours(emp) - Number(emp.weeklyLimit || 40)), 0);
  return (
    <div className="aw-meta-bar" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
      {[['本周计划工时',`${totalHours} h`],['冲突提醒',`${MFG_SCHEDULE_CONFLICTS.length} 条`],['待审批计划','1 份'],['加班工时',`${overtime} h`]].map(([k,v],i)=>(
        <div key={k} onClick={i===1 ? onConflicts : undefined} style={{padding:'10px 12px',border:'1px solid var(--aw-border)',background:i===1?'#FFF7ED':'#fff',cursor:i===1?'pointer':'default'}}>
          <div style={{fontSize:12,color:'var(--aw-fg-3)'}}>{k}</div>
          <div style={{fontSize:18,fontWeight:600,color:i===1?'var(--aw-warning)':'var(--aw-fg-1)'}}>{v}</div>
        </div>
      ))}
    </div>
  );
}

function MfgScheduleNavTabs({ page, setPage }) {
  const items = ['排班列表','排班计划','生产班组','工作日历','班次管理'].map(label => ({ k: label, label }));
  return <Tabs items={items} active={page} onChange={setPage} />;
}

function MfgShiftManagement({ onNew, onEdit }) {
  const [picked, setPicked] = useMfgState({});
  const checked = Object.values(picked).filter(Boolean).length;
  return (
    <div className="aw-doc-main">
      <PurchaseListToolbar searchPlaceholder="搜索班次编码、班次名称、起止时间" newLabel="新增班次" onNew={onNew} afterSearch={<><Btn>批量停用 {checked ? `(${checked})` : ''}</Btn><Btn>导出</Btn></>} />
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(220px,1fr))',gap:12,padding:12}}>
        {MFG_SCHEDULE_SHIFTS.map(s=>(
          <div key={s.code} style={{border:'1px solid var(--aw-border)',background:'#fff',borderRadius:8,padding:14,display:'grid',gridTemplateColumns:'24px 56px 1fr auto',gap:12,alignItems:'start'}}>
            <span className={'aw-chk '+(picked[s.code]?'on':'')} onClick={()=>setPicked(prev=>({...prev,[s.code]:!prev[s.code]}))} />
            <div style={{width:48,height:48,borderRadius:8,background:s.color,color:s.fg,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:20}}>{s.code}</div>
            <div>
              <div style={{fontWeight:600}}>{s.name} <Badge tone={s.status === '启用' ? 'g' : 'r'}>{s.status}</Badge></div>
              <div style={{fontSize:12,color:'var(--aw-fg-3)',marginTop:6}}>起止 {s.time} · 工时 {s.hours}h · 休息 {s.rest}</div>
              <div style={{fontSize:12,color:'var(--aw-fg-3)',marginTop:4}}>{s.cross ? '跨天班次' : '当日班次'} · 倍率 {s.ratio} · 打卡窗口 前30后30 · {s.preset ? '系统预置，不可删除' : '自定义'}</div>
            </div>
            <span className="aw-link" onClick={()=>onEdit && onEdit(s)}>编辑</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MfgWorkCalendar({ onNew }) {
  const [month, setMonth] = useMfgState('2026-06');
  const days = Array.from({length:35},(_,i)=>i+1);
  const typeOf = d => [6,7,13,14,20,21,27,28].includes(d) ? '休息' : [1,2].includes(d) ? '节假日' : [8].includes(d) ? '调班' : '工作';
  const tone = t => t === '节假日' ? ['#FBDFDF','#B42318'] : t === '调班' ? ['#DCE7FB','#2E4A85'] : t === '休息' ? ['#FDECDC','#B26A24'] : ['#fff','var(--aw-fg-2)'];
  return (
    <div className="aw-doc-main">
      <PurchaseListToolbar searchPlaceholder="搜索日历名称、适用范围" newLabel="新增工作日历" onNew={onNew} afterSearch={<><Select defaultValue="2026标准工作日历"><option>2026标准工作日历</option><option>总装车间工作日历</option></Select><Select value={month} onChange={e=>setMonth(e.target.value)}><option>2026-06</option><option>2026-07</option></Select><Btn>同步法定节假日</Btn></>} />
      <div style={{padding:12}}>
        <div className="aw-meta-bar" style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <div><b>{month.replace('-','年')}月</b><span style={{marginLeft:12,color:'var(--aw-fg-3)',fontSize:12}}>工作制：双休 · 继承来源：集团标准日历 · 适用范围：全公司</span></div>
          <div style={{display:'flex',gap:10,fontSize:12}}>
            {[['工作','#fff'],['休息','#FDECDC'],['节假日','#FBDFDF'],['调班','#DCE7FB']].map(([t,bg])=><span key={t} style={{display:'inline-flex',alignItems:'center',gap:5}}><i style={{width:12,height:12,border:'1px solid var(--aw-border)',background:bg,display:'inline-block'}} />{t}</span>)}
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:12}}>
          {MFG_SCHEDULE_CALENDAR_EXCEPTIONS.map(item=><div key={item.day} style={{border:'1px solid var(--aw-border)',background:'#fff',padding:10,borderRadius:6}}>
            <div style={{display:'flex',justifyContent:'space-between'}}><b>{item.day}</b><Badge tone={item.type === '节假日' ? 'r' : 'b'}>{item.type}</Badge></div>
            <div style={{fontSize:12,color:'var(--aw-fg-3)',marginTop:6}}>{item.rule} · {item.note}</div>
          </div>)}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',border:'1px solid var(--aw-border)',background:'#fff'}}>
          {['周一','周二','周三','周四','周五','周六','周日'].map(w=><div key={w} style={{padding:8,borderBottom:'1px solid var(--aw-border)',background:'var(--aw-surface-2)',fontSize:12,color:'var(--aw-fg-3)',textAlign:'center'}}>{w}</div>)}
          {days.map(d=>{ const t=typeOf(d); const [bg,fg]=tone(t); return <div key={d} style={{minHeight:96,padding:8,borderRight:'1px solid var(--aw-border)',borderBottom:'1px solid var(--aw-border)',background:bg}}>
            <div style={{display:'flex',justifyContent:'space-between',color:fg}}><b>{d}</b><span style={{fontSize:12}}>{t}</span></div>
            <div style={{fontSize:12,color:'var(--aw-fg-3)',marginTop:18}}>{t === '调班' ? '按早班计算' : t === '节假日' ? '强制休 R' : t === '休息' ? '循环休息日' : '可排班'}</div>
          </div>;})}
        </div>
        <div style={{display:'flex',gap:18,marginTop:12,fontSize:12,color:'var(--aw-fg-3)'}}><span>工作日 22 天</span><span>休息日 8 天</span><span>节假日 2 天</span><span>调班 1 天</span></div>
      </div>
    </div>
  );
}

function MfgTeamManagement({ onNew, onDetail }) {
  const workshops = ['全部车间','总装车间','焊接车间','机加工车间','包装车间'];
  const [workshop, setWorkshop] = useMfgState('全部车间');
  const rows = workshop === '全部车间' ? MFG_SCHEDULE_TEAMS : MFG_SCHEDULE_TEAMS.filter(t => t.workshop === workshop);
  return (
    <div style={{display:'grid',gridTemplateColumns:'190px 1fr',height:'100%'}}>
      <div className="aw-doc-tree">
        <div className="aw-doc-tree-h">车间分组 <span className="aw-doc-tree-n">(4)</span></div>
        <div className="aw-doc-tree-list">{workshops.map((w,i)=><div key={w} className={'aw-tree-row aw-tree-l2' + (workshop===w?' on':'')} onClick={()=>setWorkshop(w)}><span className="aw-tree-caret">{i===0?'▾':''}</span><TileIcon name={i===0?'folder':'doc'} size={14}/><span>{w}</span></div>)}</div>
      </div>
      <div className="aw-doc-main">
        <PurchaseListToolbar searchPlaceholder="搜索班组名称、班组长、技能方向" newLabel="新建班组" onNew={onNew} afterSearch={<Btn>导出</Btn>} />
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(220px,1fr))',gap:12,padding:12}}>
          {rows.map(t=>(
            <div key={t.code} style={{border:'1px solid var(--aw-border)',background:'#fff',borderRadius:8,padding:14,cursor:'pointer'}} onClick={()=>onDetail(t)}>
              <div style={{display:'flex',justifyContent:'space-between',gap:8}}><b>{t.name}</b><Badge tone="b">{t.pattern}</Badge></div>
              <div style={{fontSize:12,color:'var(--aw-fg-3)',marginTop:8}}>{t.workshop} · {t.line} · 班组长 {t.leader}</div>
              <div style={{display:'flex',gap:6,marginTop:10}}>{t.skills.map(s=><span key={s} style={{fontSize:12,padding:'2px 8px',background:'var(--aw-surface-2)',borderRadius:12}}>{s}</span>)}</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginTop:14,fontSize:12}}><span>成员<b style={{display:'block',fontSize:18}}>{t.members}</b></span><span>产能<b style={{display:'block',fontSize:18}}>{t.capacity}</b></span><span>需求<b style={{display:'block',fontSize:18}}>{t.demand}</b></span><span>到岗率<b style={{display:'block',fontSize:18}}>{t.attendance}</b></span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MfgSchedulePlans({ onNew, onDetail }) {
  const [sel, setSel] = useMfgState({0:true});
  const checked = Object.values(sel).filter(Boolean).length;
  const toggle = i => setSel(prev => ({...prev, [i]:!prev[i]}));
  return (
    <div className="aw-doc-main">
      <PurchaseListToolbar searchPlaceholder="搜索计划编号、计划名称、适用班组" newLabel="新增排班计划" onNew={onNew} afterSearch={<><Btn>发布 {checked ? `(${checked})` : ''}</Btn><Btn>归档</Btn><Btn>冲突校验</Btn></>} />
      <div className="aw-doc-tbl-inner"><table className="aw-doc-tbl"><thead><tr><PurchaseSelectHeader checked={checked===MFG_SCHEDULE_PLANS.length} indeterminate={checked>0&&checked<MFG_SCHEDULE_PLANS.length} onToggle={()=>checked===MFG_SCHEDULE_PLANS.length ? setSel({}) : setSel({0:true,1:true,2:true})}/>{['序号','计划编号','计划名称','适用班组','循环模式','周期','人数','计划工时','需求工时','覆盖率','冲突','审批','状态','操作'].map(h=><th key={h}><div className="aw-th-inner">{h}</div></th>)}</tr></thead>
        <tbody>{MFG_SCHEDULE_PLANS.map((p,i)=><tr key={p.code}><PurchaseSelectCell checked={!!sel[i]} onToggle={()=>toggle(i)} /><td>{i+1}</td><td className="aw-num">{p.code}</td><td><span className="aw-link" onClick={()=>onDetail(p)}>{p.name}</span></td><td>{p.team}</td><td>{p.pattern}</td><td>{p.start} 至 {p.end}</td><td>{p.people}</td><td>{p.hours}</td><td>{p.demandHours}</td><td>{p.coverage}</td><td style={{color:p.conflicts?'var(--aw-danger)':'var(--aw-success)'}}>{p.conflicts}</td><td>{p.approval}</td><td><MfgTone status={p.status}/></td><td><span className="aw-link" onClick={()=>onDetail(p)}>查看</span></td></tr>)}</tbody></table></div>
      <PurchaseListFooter total={MFG_SCHEDULE_PLANS.length} selectedCount={checked} allChecked={checked===MFG_SCHEDULE_PLANS.length} someChecked={checked>0} onToggleAll={()=>checked===MFG_SCHEDULE_PLANS.length ? setSel({}) : setSel({0:true,1:true,2:true})} />
    </div>
  );
}

function MfgRosterList({ onNew, readOnly=false, plan }) {
  const [cell, setCell] = useMfgState(null);
  const [rows, setRows] = useMfgState(MFG_SCHEDULE_EMPLOYEES);
  const [view, setView] = useMfgState('周视图');
  const days = MFG_SCHEDULE_DAYS;
  const counts = mfgScheduleCounts(rows);
  const totalHours = rows.reduce((sum,e)=>sum + mfgEmployeeWeekHours(e),0);
  const activePlan = plan || MFG_SCHEDULE_PLANS[0];
  const saveCell = () => {
    setRows(prev => prev.map((emp, ri) => ri === cell.row ? ({ ...emp, shifts: emp.shifts.map((s, ci) => ci === cell.col ? cell.shift : s), source:'手工调整', reason:cell.reason || '班次调整' }) : emp));
    setCell(null);
  };
  return (
    <div className="aw-doc-main">
      <PurchaseListToolbar searchPlaceholder="搜索姓名、工号、班组、技能、工位" newLabel="新增排班" onNew={readOnly ? undefined : onNew} hideNew={readOnly} afterSearch={<><Select defaultValue={activePlan.team}><option>{activePlan.team}</option><option>焊接夜班</option><option>机加工A组</option></Select><Select defaultValue="总装车间"><option>总装车间</option><option>焊接车间</option></Select><Btn onClick={()=>setView(view === '周视图' ? '月视图' : '周视图')}>{view}</Btn><Btn>批量调班</Btn></>} />
      <div className="aw-meta-bar" style={{margin:'0 12px 12px'}}>当前计划 <b>{activePlan.code}</b> · 循环模式 {activePlan.pattern} · 参考日历 {activePlan.calendar} · 周期 {activePlan.start} 至 {activePlan.end} · 覆盖率 {activePlan.coverage}</div>
      <div style={{overflow:'auto',padding:'0 12px'}}><table className="aw-doc-tbl" style={{minWidth:1180}}><thead><tr><th><div className="aw-th-inner">员工</div></th><th><div className="aw-th-inner">工号</div></th><th><div className="aw-th-inner">班组</div></th><th><div className="aw-th-inner">工位/产线</div></th><th><div className="aw-th-inner">技能资质</div></th><th><div className="aw-th-inner">本周工时</div></th><th><div className="aw-th-inner">来源</div></th>{days.map(d=><th key={d}><div className="aw-th-inner">{d}</div></th>)}</tr></thead>
        <tbody>{rows.map((e,ri)=>{ const weekHours = mfgEmployeeWeekHours(e); return <tr key={e.no}><td><div style={{display:'flex',alignItems:'center',gap:8}}><span style={{width:26,height:26,borderRadius:'50%',background:'var(--aw-primary-soft)',color:'var(--aw-primary)',display:'inline-flex',alignItems:'center',justifyContent:'center',fontWeight:600}}>{e.name[0]}</span>{e.name}</div></td><td className="aw-num">{e.no}</td><td>{e.team}</td><td>{e.station}</td><td>{e.skill} / {e.cert}</td><td className="aw-num" style={{color:weekHours > e.weeklyLimit ? 'var(--aw-danger)' : undefined}}>{weekHours}h / {e.weeklyLimit}h</td><td>{e.source}</td>{e.shifts.map((s,ci)=><td key={ci} style={{height:56}}><MfgScheduleShiftChip code={s} onClick={readOnly ? undefined : ()=>setCell({ row:ri, col:ci, emp:e.name, day:days[ci], shift:s, reason:e.reason })} /></td>)}</tr>;})}</tbody></table></div>
      <div className="aw-meta-bar" style={{margin:12,display:'flex',gap:18,flexWrap:'wrap'}}>本周工时合计 <b>{totalHours}h</b>{MFG_SCHEDULE_SHIFTS.map(s=><span key={s.code}>{s.code}{s.short} <b>{counts[s.code] || 0}</b></span>)}<span>休息天数 <b>{counts.R || 0}</b></span></div>
      {cell && <StandardModal title="调整班次" subtitle={`${cell.emp} · ${cell.day}`} onClose={()=>setCell(null)} footer={<><Btn onClick={()=>setCell(null)}>取消</Btn><Btn kind="primary" onClick={saveCell}>保存调整</Btn></>}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>{MFG_SCHEDULE_SHIFTS.map(s=><button key={s.code} onClick={()=>setCell({...cell,shift:s.code})} style={{border:'1px solid var(--aw-border)',background:cell.shift===s.code?'var(--aw-primary-soft)':'#fff',padding:12,cursor:'pointer'}}><MfgScheduleShiftChip code={s.code} /><div style={{fontSize:12,color:'var(--aw-fg-3)',marginTop:6}}>{s.time}</div></button>)}<button onClick={()=>setCell({...cell,shift:''})} style={{border:'1px dashed var(--aw-border-strong)',background:cell.shift===''?'var(--aw-primary-soft)':'#fff',padding:12,cursor:'pointer'}}>清空</button></div>
        <Field label="调整原因"><Input value={cell.reason || ''} onChange={e=>setCell({...cell,reason:e.target.value})} placeholder="请假、调班、临时加班等" /></Field>
        <div className="aw-meta-bar" style={{marginTop:12}}>保存后记录调整来源、原因和操作留痕；已发布或锁定日期在真实系统中应触发审批。</div>
      </StandardModal>}
    </div>
  );
}

function MfgScheduleModal({ type, data, onClose }) {
  const titleMap = { shift:'新增班次', shiftEdit:'编辑班次', calendar:'新增工作日历', team:'新建班组', plan:'新增排班计划', roster:'新增排班', teamDetail:'班组人员', planDetail:'排班计划详情', conflicts:'排班冲突校验', policy:'生产排班策略设置' };
  const planPattern = (data?.pattern || 'A-B-C-R').split('-').filter(Boolean);
  const teamMembers = data?.name ? MFG_SCHEDULE_EMPLOYEES.filter(e => e.team === data.name) : MFG_SCHEDULE_EMPLOYEES.slice(0,4);
  return (
    <StandardModal title={titleMap[type] || '生产排班'} size={(type && type.includes('Detail')) || type === 'conflicts' ? 'lg' : 'md'} onClose={onClose} footer={<><Btn onClick={onClose}>取消</Btn><Btn kind="primary" onClick={onClose}>{(type && type.includes('Detail')) || type === 'conflicts' ? '关闭' : '保存'}</Btn></>}>
      <div className="aw-mfg-detail-scope aw-mfg-modal-body">
      {(type === 'shift' || type === 'shiftEdit') && <FormGrid columns={2}><Field label="班次编码" req><Input defaultValue={data?.code || 'F'} /></Field><Field label="班次名称" req><Input defaultValue={data?.name || '培训'} /></Field><Field label="开始时间" req><Input defaultValue={(data?.time || '09:00-12:00').split('-')[0]} /></Field><Field label="结束时间" req><Input defaultValue={(data?.time || '09:00-12:00').split('-')[1]} /></Field><Field label="标准工时"><Input defaultValue={`${data?.hours ?? 3}h`} /></Field><Field label="休息时长"><Input defaultValue={data?.rest || '0分钟'} /></Field><Field label="工时倍率"><Input defaultValue={data?.ratio || '1.0x'} /></Field><Field label="打卡窗口"><Input defaultValue="上班前30分钟 / 下班后30分钟" /></Field><Field label="是否跨天"><Select defaultValue={data?.cross ? '是' : '否'}><option>否</option><option>是</option></Select></Field><Field label="状态"><Select defaultValue={data?.status || '启用'}><option>启用</option><option>停用</option></Select></Field></FormGrid>}
      {type === 'calendar' && <><FormGrid columns={2}><Field label="日历名称" req><Input defaultValue="2026标准工作日历" /></Field><Field label="适用范围" req><Select defaultValue="全公司"><option>全公司</option><option>总装车间</option><option>焊接车间</option></Select></Field><Field label="工作制"><Select defaultValue="双休"><option>双休</option><option>单休</option><option>大小周</option></Select></Field><Field label="继承来源"><Input defaultValue="集团标准日历" /></Field><Field label="节假日规则"><Input defaultValue="同步国务院法定节假日" /></Field><Field label="调班规则"><Input defaultValue="调班日若循环为R自动改A" /></Field></FormGrid><PurchaseSection title="例外日规则"><table className="aw-table"><thead><tr><th>日期</th><th>类型</th><th>规则</th><th>说明</th></tr></thead><tbody>{MFG_SCHEDULE_CALENDAR_EXCEPTIONS.map(x=><tr key={x.day}><td>{x.day}</td><td>{x.type}</td><td>{x.rule}</td><td>{x.note}</td></tr>)}</tbody></table></PurchaseSection></>}
      {type === 'team' && <FormGrid columns={2}><Field label="班组名称" req><Input defaultValue="总装二班" /></Field><Field label="所属车间" req><Select defaultValue="总装车间"><option>总装车间</option><option>焊接车间</option></Select></Field><Field label="适用产线" req><Input defaultValue="总装产线B" /></Field><Field label="班组长" req><Input defaultValue="陈思源" /></Field><Field label="班次模式" req><Select defaultValue="三班两运转"><option>常白</option><option>两班倒</option><option>三班两运转</option><option>四班三倒</option><option>自定义</option></Select></Field><Field label="技能方向"><Input defaultValue="总装、包装" /></Field><Field label="岗位编制"><Input defaultValue="班组长1 / 技工12 / 质检1" /></Field><Field label="替补规则"><Input defaultValue="同技能同车间优先补位" /></Field></FormGrid>}
      {type === 'plan' && <><PurchaseSection title="基础信息"><FormGrid columns={2}><Field label="计划名称" req><Input defaultValue="2026年6月总装一班排班" /></Field><Field label="适用班组" req><Select defaultValue="总装一班"><option>总装一班</option><option>焊接夜班</option></Select></Field><Field label="适用车间/产线" req><Input defaultValue="总装车间 / 总装产线A" /></Field><Field label="参考工作日历" req><Select defaultValue="2026标准工作日历"><option>2026标准工作日历</option></Select></Field><Field label="周期" req><Input defaultValue="2026-06-01 至 2026-06-30" /></Field><Field label="排班策略"><Select defaultValue="均衡工时优先"><option>均衡工时优先</option><option>产能优先</option><option>技能优先</option></Select></Field></FormGrid></PurchaseSection><PurchaseSection title="循环模式"><div style={{display:'flex',gap:8}}>{['A','B','C','R'].map(c=><MfgScheduleShiftChip key={c} code={c} />)}</div></PurchaseSection><PurchaseSection title="发布前校验"><InfoGrid columns={3} items={[{label:'需求工时',value:'688h'},{label:'计划工时',value:'720h'},{label:'冲突数',value:'1 条'}]} /></PurchaseSection></>}
      {type === 'roster' && <FormGrid columns={2}><Field label="班组" req><Select defaultValue="总装一班"><option>总装一班</option></Select></Field><Field label="排班周期" req><Input defaultValue="2026-06-01 至 2026-06-07" /></Field><Field label="生成方式"><Select defaultValue="按计划生成"><option>按计划生成</option><option>手动新增</option><option>按工单负荷生成</option></Select></Field><Field label="是否覆盖已有排班"><Select defaultValue="否"><option>否</option><option>是</option></Select></Field><Field label="冲突处理"><Select defaultValue="生成后标记冲突"><option>生成后标记冲突</option><option>自动避让冲突</option></Select></Field><Field label="锁定已发布日期"><Select defaultValue="是"><option>是</option><option>否</option></Select></Field></FormGrid>}
      {type === 'teamDetail' && <><InfoGrid columns={3} items={[{label:'班组编码',value:data?.code || '-'},{label:'适用产线',value:data?.line || '-'},{label:'默认班制',value:data?.pattern || '-'}]} /><div style={{height:12}} /><table className="aw-table"><thead><tr><th>姓名</th><th>工号</th><th>工位/产线</th><th>技能</th><th>资质</th><th>周工时上限</th><th>本月计划工时</th></tr></thead><tbody>{teamMembers.map(e=><tr key={e.no}><td>{e.name}</td><td>{e.no}</td><td>{e.station}</td><td>{e.skill}</td><td>{e.cert}</td><td>{e.weeklyLimit}h</td><td>{mfgEmployeeWeekHours(e) * 4}h</td></tr>)}</tbody></table></>}
      {type === 'planDetail' && <><PurchaseSection title="基础信息"><FormGrid columns={3}><Field label="计划编号"><Input value={data?.code || ''} readOnly /></Field><Field label="计划名称"><Input value={data?.name || ''} readOnly /></Field><Field label="适用班组"><Input value={data?.team || ''} readOnly /></Field><Field label="计划周期"><Input value={data ? `${data.start} 至 ${data.end}` : ''} readOnly /></Field><Field label="覆盖率"><Input value={data?.coverage || ''} readOnly /></Field><Field label="状态"><Input value={data?.status || ''} readOnly /></Field></FormGrid></PurchaseSection><PurchaseSection title="循环模式预览"><div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{Array.from({length:14},(_,i)=>planPattern[i % planPattern.length]).map((c,i)=><MfgScheduleShiftChip key={i} code={c} compact />)}</div></PurchaseSection><PurchaseSection title="校验结果"><table className="aw-table"><thead><tr><th>等级</th><th>对象</th><th>问题</th><th>建议</th></tr></thead><tbody>{MFG_SCHEDULE_CONFLICTS.slice(0, data?.conflicts || 1).map(c=><tr key={c.target}><td><Badge tone={c.level === '高' ? 'r' : 'y'}>{c.level}</Badge></td><td>{c.target}</td><td>{c.issue}</td><td>{c.fix}</td></tr>)}</tbody></table></PurchaseSection><PurchaseSection title="本期排班网格预览"><MfgRosterList readOnly plan={data} /></PurchaseSection></>}
      {type === 'conflicts' && <table className="aw-table"><thead><tr><th>等级</th><th>定位</th><th>冲突规则</th><th>处理建议</th></tr></thead><tbody>{MFG_SCHEDULE_CONFLICTS.map(c=><tr key={c.target}><td><Badge tone={c.level === '高' ? 'r' : 'y'}>{c.level}</Badge></td><td>{c.target}</td><td>{c.issue}</td><td>{c.fix}</td></tr>)}</tbody></table>}
      {type === 'policy' && <><FormGrid columns={2}><Field label="排班策略"><Select defaultValue="均衡工时优先"><option>均衡工时优先</option><option>产能优先</option><option>技能优先</option></Select></Field><Field label="最小休息间隔"><Input defaultValue="夜班后至少 12 小时" /></Field><Field label="连续出勤上限"><Input defaultValue="6 天" /></Field><Field label="周工时上限"><Input defaultValue="48 小时" /></Field><Field label="节假日排班"><Select defaultValue="需加班审批"><option>需加班审批</option><option>禁止排班</option><option>允许排班并预警</option></Select></Field><Field label="发布后调整"><Select defaultValue="记录原因并审批"><option>记录原因并审批</option><option>仅记录原因</option></Select></Field></FormGrid><PurchaseSection title="校验规则"><table className="aw-table"><thead><tr><th>规则</th><th>处理方式</th><th>说明</th></tr></thead><tbody><tr><td>同日重叠班次</td><td>阻断发布</td><td>人员不可在同一时间窗重复排班</td></tr><tr><td>资质不匹配</td><td>阻断发布</td><td>关键工序需满足技能和证书要求</td></tr><tr><td>产能不足</td><td>预警</td><td>计划工时低于工单需求时给出补位建议</td></tr></tbody></table></PurchaseSection></>}
      </div>
    </StandardModal>
  );
}

function MfgScheduleScreen({ initialAction, onActionConsumed }) {
  const map = { '生产班组':'生产班组', '工作日历':'工作日历', '班次管理':'班次管理', '排班计划':'排班计划', '排班列表':'排班列表' };
  const [page, setPage] = useMfgState('排班列表');
  const [modal, setModal] = useMfgState(null);
  useMfgEffect(() => {
    if (!initialAction) return;
    if (map[initialAction]) setPage(map[initialAction]);
    if (initialAction === '生产排班策略设置') setModal({ type:'policy' });
    onActionConsumed && onActionConsumed();
  }, [initialAction]);
  const showNew = () => setModal({ type: page === '班次管理' ? 'shift' : page === '工作日历' ? 'calendar' : page === '生产班组' ? 'team' : page === '排班计划' ? 'plan' : 'roster' });
  return (
    <div className="aw-mfg-detail-scope aw-mfg-schedule-page" style={{display:'flex',flexDirection:'column',gap:12,height:'100%'}}>
      <MfgScheduleTopStats onConflicts={()=>setModal({ type:'conflicts' })} />
      <Card>
        <MfgScheduleNavTabs page={page} setPage={setPage} />
        {page === '排班列表' && <MfgRosterList onNew={showNew} />}
        {page === '排班计划' && <MfgSchedulePlans onNew={showNew} onDetail={p=>setModal({ type:'planDetail', data:p })} />}
        {page === '生产班组' && <MfgTeamManagement onNew={showNew} onDetail={t=>setModal({ type:'teamDetail', data:t })} />}
        {page === '工作日历' && <MfgWorkCalendar onNew={showNew} />}
        {page === '班次管理' && <MfgShiftManagement onNew={showNew} onEdit={s=>setModal({ type:'shiftEdit', data:s })} />}
      </Card>
      {modal && <MfgScheduleModal type={modal.type} data={modal.data} onClose={()=>setModal(null)} />}
    </div>
  );
}

function buildMfgWorkOrders(product = MFG_PRODUCTS[0]) {
  const qty = Number(product.qty || 0) || 1;
  const prefix = String(product.sourceLine || product.code || 'MO-ITEM').replace(/[^A-Z0-9]/g, '').slice(-8) || 'ITEM0001';
  return [
    { code:`WO-${prefix}-01`, type:'半成品工单', name:`${product.name}半成品制备工单`, item: product.name.includes('半成品') ? product.name : `${product.name}半成品`, process: product.process === '焊接' ? '焊接' : '备料/预装', line: product.process === '焊接' ? '焊接产线A' : '预装工位01', qty, done: product.reported || 0, good: product.good || 0, bad: product.bad || 0, owner:'三红', qms:'IPQC巡检', status: product.reported ? '生产中' : '待开工' },
    { code:`WO-${prefix}-02`, type:'关键工序工单', name:`${product.process || '关键工序'}工单`, item: product.name, process: product.process || '关键工序', line:'关键工序工位02', qty, done: Math.min(product.reported || 0, qty), good: product.good || 0, bad: product.bad || 0, owner:'李工', qms:'IPQC巡检', status: product.reported ? '生产中' : '待开工' },
    { code:`WO-${prefix}-03`, type:'成品总装工单', name:`${product.name}总装工单`, item: product.name, process:'总装/包装', line:'总装产线A', qty, done: product.inbound || 0, good: product.inbound || 0, bad:0, owner:'王工', qms:'FQC完工检', status: product.inbound ? '生产中' : '待开工' },
  ];
}

function MfgWorkOrderDetailTable({ editable=false, rows=MFG_WORK_ORDER_ROWS }) {
  return <div style={{overflow:'auto'}}><table className="aw-table"><thead><tr>{['序号','工单编号','工单类型','工单名称','半成品/成品','工序','工位/产线','计划数量','已完成','合格','不良','负责人','质检节点','状态','操作'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={r.code}><td>{i+1}</td><td className="aw-num">{r.code}</td><td>{r.type}</td><td>{r.name}</td><td>{r.item}</td><td>{r.process}</td><td>{r.line}</td><td>{editable?<Input defaultValue={r.qty} />:r.qty}</td><td>{r.done}</td><td>{r.good}</td><td style={{color:r.bad?'var(--aw-danger)':'inherit'}}>{r.bad}</td><td>{r.owner}</td><td>{r.qms}</td><td><MfgTone status={r.status}/></td><td><span className="aw-link">查看</span></td></tr>)}</tbody></table></div>;
}

function MfgPlanScheduleRecords() {
  const rows = MFG_PRODUCTS.flatMap((product, productIndex) =>
    buildMfgWorkOrders(product).map((work, workIndex) => ({
      ...work,
      productCode: product.code,
      productName: product.name,
      planQty: product.qty,
      planLine: product.sourceLine,
      start: `2026-05-${String(19 + productIndex + workIndex).padStart(2,'0')}`,
      end: `2026-05-${String(22 + productIndex + workIndex).padStart(2,'0')}`,
      orderNo: `MO-20260518-${String(productIndex + 1).padStart(3,'0')}`,
    }))
  );
  return (
    <PurchaseSection title="排产记录">
      <div style={{fontSize:12,color:'var(--aw-fg-3)',marginBottom:12}}>
        排产记录按生产计划下的所有产品展开，记录每个产品生成的生产订单和生产工单，便于追踪计划产品是否已拆单、开工和完工。
      </div>
      <div style={{overflow:'auto'}}>
        <table className="aw-table">
          <thead><tr>{['序号','计划明细','产品编号','产品名称','计划数量','生产订单','工单编号','工单类型','工单名称','工序','工位/产线','工单数量','已完成','负责人','计划开工','计划完工','工单状态','操作'].map(h=><th key={h}>{h}</th>)}</tr></thead>
          <tbody>{rows.map((r,i)=><tr key={r.code}><td>{i+1}</td><td>{r.planLine}</td><td>{r.productCode}</td><td>{r.productName}</td><td className="aw-num">{r.planQty}</td><td className="aw-num">{r.orderNo}</td><td className="aw-num">{r.code}</td><td>{r.type}</td><td>{r.name}</td><td>{r.process}</td><td>{r.line}</td><td className="aw-num">{r.qty}</td><td className="aw-num">{r.done}</td><td>{r.owner}</td><td>{r.start}</td><td>{r.end}</td><td><MfgTone status={r.status}/></td><td><span className="aw-link">查看</span></td></tr>)}</tbody>
        </table>
      </div>
    </PurchaseSection>
  );
}

function MfgGeneratedPlanView({ row, product, onBack }) {
  return <PurchaseFormPage className="aw-mfg-detail-scope aw-mfg-action-page" onBack={onBack} submitText="生成生产计划"><PurchaseSection title="基础信息"><FormGrid><Field label="计划主题" req><Input defaultValue={`${product.name} 生产计划`} /></Field><Field label="计划编号"><Input value="自动生成" readOnly /></Field><Field label="来源需求"><Input value={row.code} readOnly /></Field><Field label="来源明细"><Input value={product.sourceLine} readOnly /></Field><Field label="来源客户/项目"><Input value={row.source || '手动创建'} readOnly /></Field><Field label="计划产品"><Input value={product.name} readOnly /></Field><Field label="计划数量" req><Input defaultValue={product.qty} /></Field><Field label="计划开始"><Input defaultValue={product.start || row.date || '2026-05-18'} /></Field><Field label="计划完成"><Input defaultValue={product.end || row.end || '2026-05-30'} /></Field></FormGrid></PurchaseSection><PurchaseSection title="产品明细"><MfgPlanProductTable rows={[{...product, demandQty:product.qty, planQty:product.qty, sourceType:'生产需求', sourceDoc:row.code}]} setRows={()=>{}} readOnly /></PurchaseSection><PurchaseSection title="计划说明"><PurchaseRichText placeholder="填写排产、齐套、版本预锁和交付说明" /></PurchaseSection></PurchaseFormPage>;
}

function MfgGeneratedOrderView({ row, product, onBack }) {
  const orderProduct = product || MFG_PRODUCTS[0];
  const workOrders = buildMfgWorkOrders(orderProduct);
  return <PurchaseFormPage className="aw-mfg-detail-scope aw-mfg-action-page" onBack={onBack} submitText="生成生产订单"><PurchaseSection title="生产订单信息"><FormGrid><Field label="生产主题" req><Input defaultValue={`${orderProduct.name} 生产订单`} /></Field><Field label="生产编号"><Input value="自动生成" readOnly /></Field><Field label="来源需求"><Input value={row.code} readOnly /></Field><Field label="来源明细"><Input value={orderProduct.sourceLine} readOnly /></Field><Field label="来源客户/项目"><Input value={row.source || '手动创建'} readOnly /></Field><Field label="生产产品"><Input value={orderProduct.name} readOnly /></Field><Field label="生产数量" req><Input defaultValue={orderProduct.qty} /></Field><Field label="BOM版本"><Input defaultValue={orderProduct.bom || 'BOM-V3.2'} /></Field><Field label="工艺路线"><Input defaultValue={orderProduct.route || 'RT-总装-01'} /></Field><Field label="生产状态"><Input value="待生产" readOnly /></Field></FormGrid></PurchaseSection><PurchaseSection title="工单明细"><div style={{fontSize:12,color:'var(--aw-fg-3)',marginBottom:12}}>一个生产订单只对应一个生产产品；这里按 BOM/工艺拆解为半成品工单、关键工序工单和成品总装工单。</div><MfgWorkOrderDetailTable editable rows={workOrders} /></PurchaseSection><PurchaseSection title="订单详情"><PurchaseRichText placeholder="填写订单生产要求、工单拆解依据、齐套和质检说明" /></PurchaseSection></PurchaseFormPage>;
}

function MfgProductTable({ rows, setRows, mode, demandActions, onPlan, onOrder, readOnly=false }) {
  const update = (id, key, value) => setRows(prev => prev.map(r => r.id === id ? { ...r, [key]: value } : r));
  const columns = mode === 'work'
    ? [{label:'来源明细'}, {label:'产品编号'}, {label:'产品名称'}, {label:'规格型号'}, {label:'单位'}, {label:'工艺路线'}, {label:'工序'}, {label:'工位/产线'}, {label:'计划数量'}, {label:'齐套状态'}, {label:'缺口'}, {label:'替代料'}, {label:'QMS状态'}, {label:'计划开工'}, {label:'计划完工'}, {label:'备注'}]
    : [{label:'来源明细'}, {label:'产品编号'}, {label:'产品名称'}, {label:'规格型号'}, {label:'单位'}, {label:'生产批号'}, {label:'BOM版本'}, {label:'BOM锁版'}, {label:'工艺路线'}, {label:'工艺锁版'}, {label:'工序'}, {label:'计划数量'}, {label:'已报工'}, {label:'合格'}, {label:'不良'}, {label:'入库'}, {label:'齐套状态'}, {label:'缺口'}, {label:'替代料'}, {label:'QMS状态'}, {label:'WMS状态'}, {label:'计划开工'}, {label:'计划完工'}, {label:'备注'}];
  if (mode === 'outsource') columns.splice(12, 0, {label:'委外单价'});
  return (
    <>
      <div style={{overflow:'auto'}}>
        <table className="aw-table">
          <thead><tr><th style={{width:48}}>序号</th>{columns.map(c=><th key={c.label}>{c.label}</th>)}<th style={{width:70}}>操作</th></tr></thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.id}>
                <td>{idx + 1}</td><td>{r.sourceLine || '手动'}</td><td>{r.code}</td><td>{r.name}</td><td>{r.model}</td><td>{r.unit}</td>
                {mode !== 'work' && <><td>{r.batch || '自动生成'}</td><td>{r.bom || '待选择'}</td><td>{r.bomLock || '待锁版'}</td></>}
                <td>{r.route || '待选择'}</td>
                {mode !== 'work' && <td>{r.routeLock || '待锁版'}</td>}
                <td>{r.process}</td>
                {mode === 'work' && <td><Select value={r.line || '产线A'} onChange={e=>update(r.id,'line',e.target.value)}><option>产线A</option><option>产线B</option><option>总装工位01</option></Select></td>}
                <td>{readOnly ? r.qty : <Input value={r.qty} onChange={e=>update(r.id,'qty',e.target.value)} placeholder="填写本次计划生产数量" />}</td>
                {mode === 'outsource' && <td><Input value={r.price || '12.00'} onChange={e=>update(r.id,'price',e.target.value)} placeholder="填写委外加工单价" /></td>}
                {mode !== 'work' && <><td>{r.reported || 0}</td><td>{r.good || 0}</td><td style={{color:Number(r.bad)?'var(--aw-danger)':'inherit'}}>{r.bad || 0}</td><td>{r.inbound || 0}</td></>}
                <td><MfgTone status={r.material}/></td>
                <td className="aw-num" style={{color:Number(r.kitGap)?'var(--aw-danger)':'inherit'}}>{r.kitGap || 0}</td>
                <td>{r.substitute || '无'}</td><td>{r.qms || '待生成'}</td>{mode !== 'work' && <td>{r.wms || '待入库'}</td>}
                <td>{readOnly ? (r.start || '2026-05-18') : <Input value={r.start || '2026-05-18'} onChange={e=>update(r.id,'start',e.target.value)} placeholder="选择计划开工日期" />}</td>
                <td>{readOnly ? (r.end || '2026-05-30') : <Input value={r.end || '2026-05-30'} onChange={e=>update(r.id,'end',e.target.value)} placeholder="选择计划完工日期" />}</td>
                <td>{readOnly ? (r.remark || '-') : <Input value={r.remark || ''} onChange={e=>update(r.id,'remark',e.target.value)} placeholder="填写产品生产要求" />}</td>
                <td>{demandActions ? <><span className="aw-link" onClick={()=>onPlan&&onPlan(r)}>计划</span><span style={{margin:'0 6px',color:'var(--aw-border-strong)'}}>/</span><span className="aw-link" onClick={()=>onOrder&&onOrder(r)}>订单</span></> : readOnly ? <span className="aw-link">查看</span> : <span className="aw-link" style={{color:'var(--aw-danger)'}} onClick={()=>setRows(prev=>prev.filter(x=>x.id!==r.id))}>删除</span>}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={columns.length + 2}><EmptyState title="暂无产品明细" hint="点击新增明细选择需要生产的产品" /></td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

function MfgOutsourceDetailTable({ rows, setRows, scope, readOnly=false }) {
  const update = (id, key, value) => setRows(prev => prev.map(r => r.id === id ? { ...r, [key]: value } : r));
  const isProcess = scope === '工序委外';
  const sourceQty = r => r.sourceQty || r.demandQty || r.qty || 0;
  const outsourceQty = r => r.outsourceQty || r.qty || 0;
  const versionCells = r => <>
    <td><Select value={r.bom || 'BOM-V3.2'} disabled={readOnly} onChange={e=>update(r.id,'bom',e.target.value)}><option>BOM-V3.2</option><option>BOM-V2.1</option><option>BOM-V1.8</option><option>默认BOM</option></Select></td>
    <td><Select value={r.bomLock || '待锁版'} disabled={readOnly} onChange={e=>update(r.id,'bomLock',e.target.value)}><option>待锁版</option><option>已锁版</option><option>无需锁版</option></Select></td>
    <td><Select value={r.route || '默认工艺路线'} disabled={readOnly} onChange={e=>update(r.id,'route',e.target.value)}><option>默认工艺路线</option><option>RT-总装-01</option><option>RT-焊接-02</option><option>RT-机加工-01</option></Select></td>
    <td><Select value={r.routeLock || '待锁版'} disabled={readOnly} onChange={e=>update(r.id,'routeLock',e.target.value)}><option>待锁版</option><option>已锁版</option><option>无需锁版</option></Select></td>
  </>;
  const headers = isProcess
    ? ['序号','来源单据','工序编号','工序名称','工序类型','工位/产线','BOM版本','BOM锁版','工艺路线','工艺锁版','源单需求数量','委外数量','单位','成本费用','计划交付','备注','操作']
    : ['序号','来源单据','产品编号','产品名称','规格型号','BOM版本','BOM锁版','工艺路线','工艺锁版','源单需求数量','委外数量','单位','成本费用','计划交付','备注','操作'];
  return (
    <div style={{overflow:'auto'}}>
      <table className="aw-table">
        <thead><tr>{headers.map(h=><th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, idx)=>(
            <tr key={r.id}>
              <td>{idx + 1}</td><td>{r.sourceDoc || r.sourceLine || '选择来源后带入'}</td>
              {isProcess ? <><td>{r.processSeq || r.sourceLine}</td><td>{r.process}</td><td>{r.processType || '委外工序'}</td><td>{r.line || '-'}</td></> : <><td>{r.code}</td><td>{r.name}</td><td>{r.model}</td></>}
              {versionCells(r)}
              <td className="aw-num">{sourceQty(r)}</td>
              <td>{readOnly ? outsourceQty(r) : <Input value={outsourceQty(r)} onChange={e=>update(r.id,'outsourceQty',e.target.value)} placeholder="填写委外数量" />}</td>
              <td>{r.unit}</td>
              <td>{readOnly ? (r.cost || '12.00') : <Input value={r.cost || ''} onChange={e=>update(r.id,'cost',e.target.value)} placeholder="填写成本费用" />}</td>
              <td>{readOnly ? (r.delivery || '2026-06-05') : <Input value={r.delivery || '2026-06-05'} onChange={e=>update(r.id,'delivery',e.target.value)} placeholder="选择计划交付日期" />}</td>
              <td>{readOnly ? (r.remark || '-') : <Input value={r.remark || ''} onChange={e=>update(r.id,'remark',e.target.value)} placeholder="填写委外要求" />}</td>
              <td>{readOnly ? <span className="aw-link">查看</span> : <span className="aw-link" style={{color:'var(--aw-danger)'}} onClick={()=>setRows(prev=>prev.filter(x=>x.id!==r.id))}>删除</span>}</td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={headers.length}><EmptyState title="暂无委外明细" hint="请选择生产订单或生产工单，并确定整单委外或工序委外" /></td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function MfgOutsourceIssueModal({ row, issueMode='按需发料', onClose, onConfirm }) {
  const [issueQtys, setIssueQtys] = useMfgState({0:'40',1:'60',2:'0'});
  const totalQty = Object.values(issueQtys).reduce((sum, v) => sum + (Number(v) || 0), 0);
  const updateQty = (idx, value) => setIssueQtys(prev => ({...prev, [idx]: value}));
  return (
    <Modal
      title="委外发料"
      subtitle={row ? `${row.code} / ${row.subject}` : ''}
      onClose={onClose}
      size="lg"
      footer={<><Btn onClick={onClose}>取消</Btn><Btn kind="primary" onClick={()=>onConfirm && onConfirm({mode: issueMode, qty: totalQty})}>确认发料</Btn></>}
    >
      <div className="aw-doc-grid" style={{marginBottom:14}}>
        <Field label="委外单号"><Input value={row?.code || ''} readOnly /></Field>
        <Field label="加工商"><Input value={row?.owner || '深圳协同加工厂'} readOnly /></Field>
        <Field label="发料方式" req><Input value={issueMode} readOnly /></Field>
        <Field label="本次发料数量" req><Input value={totalQty} readOnly /></Field>
        <Field label="出库仓库"><Select><option>原料仓</option><option>半成品仓</option><option>线边仓</option></Select></Field>
        <Field label="发料说明"><Input placeholder="填写发料批次、运输或交接说明" /></Field>
      </div>
      <table className="aw-table">
        <thead><tr>{['序号','物料编码','物料名称','规格型号','单位','应发数量','已发数量','本次发料','待发数量','仓库/库位'].map(h=><th key={h}>{h}</th>)}</tr></thead>
        <tbody>{MFG_STEP_MATERIALS.map((m,i)=>{ const issueQty = Number(issueQtys[i]) || 0; return <tr key={m.code}><td>{i+1}</td><td>{m.code}</td><td>{m.name}</td><td>{m.model}</td><td>{m.unit}</td><td>{m.need}</td><td>{m.picked}</td><td><Input value={issueQtys[i] || ''} onChange={e=>updateQty(i,e.target.value)} placeholder="填写本次发料" /></td><td>{Math.max(0, m.pending - issueQty)}</td><td>{m.location}</td></tr>; })}</tbody>
      </table>
    </Modal>
  );
}

function MfgOutsourceSendPanel({ row }) {
  const [issueModal, setIssueModal] = useMfgState(false);
  const [outbound, setOutbound] = useMfgState(null);
  const issueMode = row.issueMode || row.issueType || '按需发料';
  const confirmIssue = data => {
    setOutbound({
      code:'CK-WW-20260518001',
      mode:data.mode,
      qty:data.qty,
      status:data.mode === '整批发料' ? '已发料' : '部分发料',
      warehouse:'原料仓',
      time:'2026-05-18 16:30',
      operator:'张仓',
    });
    setIssueModal(false);
  };
  return (
    <PurchaseSection title="委外发料">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div style={{fontSize:12,color:'var(--aw-fg-3)'}}>发料为手动动作，确认后生成仓储出库单，并回填委外发料记录。</div>
        <Btn kind="primary" onClick={()=>setIssueModal(true)}>发料</Btn>
      </div>
      <table className="aw-table">
        <thead><tr>{['序号','出库单号','委外单号','发料方式','本次发料数量','出库仓库','操作人','生成时间','出库状态','操作'].map(h=><th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {outbound ? <tr><td>1</td><td className="aw-link">{outbound.code}</td><td>{row.code}</td><td>{outbound.mode}</td><td className="aw-num">{outbound.qty}</td><td>{outbound.warehouse}</td><td>{outbound.operator}</td><td>{outbound.time}</td><td><MfgTone status={outbound.status}/></td><td><span className="aw-link">查看出库单</span></td></tr>
            : <tr><td colSpan={10}><EmptyState title="暂无发料记录" hint="点击右上角发料按钮，填写本次发料方式和数量后生成出库单" /></td></tr>}
        </tbody>
      </table>
      {issueModal && <MfgOutsourceIssueModal row={row} issueMode={issueMode} onClose={()=>setIssueModal(false)} onConfirm={confirmIssue} />}
    </PurchaseSection>
  );
}

const MFG_PROCESS_STEPS = [
  { id:'step1', seq:'10', name:'备料', type:'准备工序', station:'线边仓', planQty:120, standard:'按BOM齐套领料', start:'2026-05-18', end:'2026-05-18', owner:'张仓', status:'待领料' },
  { id:'step2', seq:'20', name:'焊接', type:'关键工序', station:'焊接工位01', planQty:120, standard:'首件确认后批量加工', start:'2026-05-19', end:'2026-05-20', owner:'李工', status:'待开工' },
  { id:'step3', seq:'30', name:'总装', type:'总装工序', station:'总装线A', planQty:120, standard:'按工艺卡完成装配', start:'2026-05-21', end:'2026-05-23', owner:'三红', status:'待开工' },
  { id:'step4', seq:'40', name:'包装', type:'包装工序', station:'包装区01', planQty:120, standard:'贴标、装箱、入库前确认', start:'2026-05-24', end:'2026-05-25', owner:'王工', status:'待开工' },
];

const MFG_PROCESS_BY_PRODUCT = {
  'CP-2025010101': MFG_PROCESS_STEPS,
  '7820864': [
    { id:'semi1', seq:'10', name:'领料', type:'准备工序', station:'线边仓', planQty:120, standard:'按半成品BOM领取物料', start:'2026-05-18', end:'2026-05-18', owner:'张仓', status:'待领料' },
    { id:'semi2', seq:'20', name:'预装', type:'装配工序', station:'装配线A', planQty:120, standard:'完成半成品预装和线束整理', start:'2026-05-19', end:'2026-05-20', owner:'李工', status:'待开工' },
    { id:'semi3', seq:'30', name:'功能测试', type:'检测工序', station:'测试台01', planQty:120, standard:'按测试脚本完成通电测试', start:'2026-05-21', end:'2026-05-21', owner:'王质检', status:'待开工' },
  ],
  '5786931': [
    { id:'semi4511', seq:'10', name:'领料', type:'准备工序', station:'线边仓', planQty:120, standard:'领取显示模组与辅料', start:'2026-05-18', end:'2026-05-18', owner:'张仓', status:'待领料' },
    { id:'semi4512', seq:'20', name:'组装', type:'装配工序', station:'装配线B', planQty:120, standard:'按工艺卡完成模块组装', start:'2026-05-19', end:'2026-05-20', owner:'陈工', status:'待开工' },
    { id:'semi4513', seq:'30', name:'老化测试', type:'检测工序', station:'老化房01', planQty:120, standard:'完成老化测试并记录结果', start:'2026-05-21', end:'2026-05-22', owner:'王质检', status:'待开工' },
  ],
  '8518691': [
    { id:'raw1', seq:'10', name:'备料', type:'准备工序', station:'原料仓', planQty:120, standard:'领取铝合金型材并核对批次', start:'2026-05-18', end:'2026-05-18', owner:'张仓', status:'待领料' },
    { id:'raw2', seq:'20', name:'切割', type:'机加工序', station:'切割工位01', planQty:120, standard:'按尺寸要求完成切割', start:'2026-05-19', end:'2026-05-19', owner:'赵工', status:'待开工' },
    { id:'raw3', seq:'30', name:'尺寸检验', type:'检测工序', station:'检验台02', planQty:120, standard:'复核长度、孔位和外观', start:'2026-05-20', end:'2026-05-20', owner:'李质检', status:'待开工' },
  ],
  '6576642': [
    { id:'bearing1', seq:'10', name:'领料', type:'准备工序', station:'线边仓', planQty:120, standard:'领取轴承并核对型号', start:'2026-05-18', end:'2026-05-18', owner:'张仓', status:'待领料' },
    { id:'bearing2', seq:'20', name:'装配', type:'装配工序', station:'装配工位02', planQty:120, standard:'按扭矩要求完成压装', start:'2026-05-19', end:'2026-05-19', owner:'李工', status:'待开工' },
    { id:'bearing3', seq:'30', name:'旋转测试', type:'检测工序', station:'测试台02', planQty:120, standard:'检查异响、间隙和转动阻力', start:'2026-05-20', end:'2026-05-20', owner:'王质检', status:'待开工' },
  ],
  '6081578': [
    { id:'pack1', seq:'10', name:'领料', type:'准备工序', station:'包材仓', planQty:120, standard:'领取外箱、标签和说明书', start:'2026-05-18', end:'2026-05-18', owner:'张仓', status:'待领料' },
    { id:'pack2', seq:'20', name:'包装', type:'包装工序', station:'包装区01', planQty:120, standard:'按包装规范完成装箱贴标', start:'2026-05-19', end:'2026-05-19', owner:'王工', status:'待开工' },
    { id:'pack3', seq:'30', name:'包装检验', type:'检测工序', station:'包装检验台', planQty:120, standard:'检查标签、数量、外观和封箱', start:'2026-05-20', end:'2026-05-20', owner:'李质检', status:'待开工' },
  ],
  'CP-2025010102': [
    { id:'hm1', seq:'10', name:'领料', type:'准备工序', station:'线边仓', planQty:300, standard:'按半成品BOM领取电子料', start:'2026-05-18', end:'2026-05-18', owner:'张仓', status:'待领料' },
    { id:'hm2', seq:'20', name:'贴片', type:'关键工序', station:'SMT线A', planQty:300, standard:'按贴片程序完成元件贴装', start:'2026-05-19', end:'2026-05-20', owner:'陈工', status:'待开工' },
    { id:'hm3', seq:'30', name:'焊接', type:'关键工序', station:'焊接工位02', planQty:300, standard:'首件确认后批量焊接', start:'2026-05-21', end:'2026-05-22', owner:'李工', status:'待开工' },
    { id:'hm4', seq:'40', name:'功能测试', type:'检测工序', station:'测试台01', planQty:300, standard:'按测试脚本完成通电和通讯测试', start:'2026-05-23', end:'2026-05-24', owner:'王质检', status:'待开工' },
  ],
  'CP-2025010103': [
    { id:'al1', seq:'10', name:'备料', type:'准备工序', station:'原料仓', planQty:260, standard:'领取铝材和加工辅料', start:'2026-05-18', end:'2026-05-18', owner:'张仓', status:'待领料' },
    { id:'al2', seq:'20', name:'CNC加工', type:'机加工序', station:'CNC-01', planQty:260, standard:'按图纸完成粗加工和精加工', start:'2026-05-19', end:'2026-05-22', owner:'赵工', status:'待开工' },
    { id:'al3', seq:'30', name:'表面处理', type:'委外工序', station:'委外加工商', planQty:260, standard:'阳极氧化并按外观标准验收', start:'2026-05-23', end:'2026-05-26', owner:'委外专员', status:'待发料' },
    { id:'al4', seq:'40', name:'尺寸复检', type:'检测工序', station:'检验台02', planQty:260, standard:'按检验方案复核关键尺寸', start:'2026-05-27', end:'2026-05-27', owner:'李质检', status:'待开工' },
  ],
};

function getMfgProcessSteps(product) {
  const code = product?.code || product?.productNo;
  return code ? (MFG_PROCESS_BY_PRODUCT[code] || []) : [];
}

const MFG_STEP_MATERIALS = [
  { code:'WL-7820864', name:'主控板', model:'PCB-A1', unit:'件', need:120, picked:80, pending:40, batch:'B2026051801', location:'原料仓/A-01-01' },
  { code:'WL-5786931', name:'显示屏', model:'4.3寸', unit:'片', need:120, picked:60, pending:60, batch:'B2026051802', location:'原料仓/A-02-03' },
  { code:'WL-8518691', name:'包装材料', model:'标准箱', unit:'套', need:120, picked:120, pending:0, batch:'B2026051803', location:'包材仓/P-01-02' },
];

const MFG_DISPATCH_DEPTS = [
  { name:'生产中心', children:['生产一部','装配车间','焊接班组','包装班组','委外管理组'] },
  { name:'生产一部', people:[{id:'P001',name:'三红',role:'班组长'},{id:'P002',name:'李工',role:'装配工'},{id:'P003',name:'王工',role:'包装工'}] },
  { name:'装配车间', people:[{id:'P004',name:'陈工',role:'装配工'},{id:'P005',name:'赵工',role:'调试工'},{id:'P006',name:'老夏',role:'生产主管'}] },
  { name:'焊接班组', people:[{id:'P007',name:'周焊',role:'焊接工'},{id:'P008',name:'林焊',role:'焊接工'}] },
  { name:'包装班组', people:[{id:'P009',name:'王包',role:'包装工'},{id:'P010',name:'郑包',role:'包装工'}] },
  { name:'委外管理组', people:[{id:'P011',name:'委外专员',role:'委外跟单'},{id:'P012',name:'海鹏微为',role:'委外协调'}] },
];

function MfgDispatchPickerModal({ step, steps = [], onClose, onConfirm }) {
  const [dept, setDept] = useMfgState('生产一部');
  const [selected, setSelected] = useMfgState({});
  const [qtyMap, setQtyMap] = useMfgState({});
  const current = MFG_DISPATCH_DEPTS.find(d => d.name === dept) || MFG_DISPATCH_DEPTS[1];
  const people = current.people || [];
  const targetQty = step?.planQty || steps.reduce((sum, s) => sum + (Number(s.planQty) || 0), 0) || 0;
  const picked = people.filter(p => selected[p.id]).map(p => ({...p, qty: qtyMap[p.id] || Math.ceil(targetQty / Math.max(people.filter(x => selected[x.id]).length || 1, 1))}));
  const toggle = p => setSelected(prev => ({...prev, [p.id]: !prev[p.id]}));
  return (
    <Modal
      title="派工选择"
      subtitle={step ? `${step.seq} ${step.name} / 计划数量 ${step.planQty}` : `批量派工 / ${steps.length} 道工序`}
      size="picker"
      onClose={onClose}
      footer={<><Btn onClick={onClose}>取消</Btn><Btn kind="primary" onClick={()=>onConfirm && onConfirm(picked)}>确定派工</Btn></>}
    >
      <div style={{display:'grid',gridTemplateColumns:'220px 1fr',height:460}}>
        <div style={{borderRight:'1px solid var(--aw-border)',padding:'10px 0',background:'var(--aw-surface-2)'}}>
          <div style={{fontSize:13,fontWeight:600,padding:'0 14px 10px'}}>生产部门</div>
          {MFG_DISPATCH_DEPTS.map((d, idx)=>(
            <div key={d.name} className={'aw-tree-row '+(dept===d.name?'on':'')+(idx?' aw-tree-l2':'')} onClick={()=>d.people && setDept(d.name)}>
              <span className="aw-tree-caret">{d.children ? '▾' : ''}</span><TileIcon name={d.children?'folder':'doc'} size={14}/><span>{d.name}</span>
            </div>
          ))}
        </div>
        <div style={{display:'flex',flexDirection:'column',overflow:'hidden'}}>
          <div style={{padding:'10px 12px',borderBottom:'1px solid var(--aw-border)',display:'flex',alignItems:'center',gap:10}}>
            <Input placeholder="搜索人员姓名、岗位" style={{maxWidth:260}} />
            <span style={{fontSize:12,color:'var(--aw-fg-3)'}}>已选 {picked.length} 人，派工总量 {picked.reduce((sum,p)=>sum+(Number(p.qty)||0),0)}</span>
          </div>
          <div style={{overflow:'auto'}}>
            <table className="aw-table">
              <thead><tr>{['选择','姓名','工号','岗位','所属部门','派工数量'].map(h=><th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {people.map(p=>(
                  <tr key={p.id} style={selected[p.id]?{background:'var(--aw-primary-soft)'}:undefined}>
                    <td><span className={'aw-chk '+(selected[p.id]?'on':'')} onClick={()=>toggle(p)} /></td>
                    <td>{p.name}</td><td>{p.id}</td><td>{p.role}</td><td>{dept}</td>
                    <td><Input value={qtyMap[p.id] || ''} onChange={e=>setQtyMap(prev=>({...prev,[p.id]:e.target.value}))} placeholder="填写派工数量" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function MfgProcessFlowTable({ rows = [], onIssue, showExecution=false, dispatchMode=false }) {
  const dispatchValue = (r, idx) => r.dispatchType || (idx === 0 ? '领工模式' : '派工模式');
  const [dispatchMap, setDispatchMap] = useMfgState({});
  const [dispatchModal, setDispatchModal] = useMfgState(null);
  const [assignmentMap, setAssignmentMap] = useMfgState({});
  useMfgEffect(() => {
    setDispatchMap(Object.fromEntries(rows.map((r, idx) => [r.id, dispatchValue(r, idx)])));
  }, [rows.map(r => r.id).join('|')]);
  const setAllDispatch = value => setDispatchMap(Object.fromEntries(rows.map(r => [r.id, value])));
  const chooseAllDispatch = value => {
    setAllDispatch(value);
    if (value === '派工模式') setDispatchModal({ all:true, steps:rows });
  };
  const setOneDispatch = (row, value) => {
    setDispatchMap(prev => ({ ...prev, [row.id]: value }));
    if (value === '派工模式') setDispatchModal({ step: row });
  };
  const confirmDispatch = persons => {
    if (dispatchModal?.all) setAssignmentMap(prev => ({...prev, ...Object.fromEntries(rows.map(r => [r.id, persons]))}));
    if (dispatchModal?.step) setAssignmentMap(prev => ({...prev, [dispatchModal.step.id]: persons}));
    setDispatchModal(null);
  };
  const headers = showExecution
    ? ['序号','工序号','工序名称','工序类型','工位/产线','计划数量','作业标准','计划开工','计划完工','领派方式','负责人','工序状态','操作']
    : ['序号','工序号','工序名称','工序类型','工位/产线','计划数量','作业标准','计划开工','计划完工', ...(dispatchMode ? ['操作'] : [])];
  return (
    <div>
      {dispatchMode && !!rows.length && <div style={{display:'flex',justifyContent:'flex-end',gap:6,marginTop:-40,marginBottom:12}}>
        <Btn style={{height:26,padding:'0 10px',fontSize:12}} onClick={()=>chooseAllDispatch('领工模式')}>领工模式</Btn>
        <Btn style={{height:26,padding:'0 10px',fontSize:12}} onClick={()=>chooseAllDispatch('派工模式')}>派工模式</Btn>
        <Btn style={{height:26,padding:'0 10px',fontSize:12}} onClick={()=>chooseAllDispatch('自由模式')}>自由模式</Btn>
      </div>}
      <div style={{overflow:'auto'}}><table className="aw-table">
        <thead>
          <tr>{headers.map(h=><th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={r.id}>
              <td>{idx + 1}</td><td>{r.seq}</td><td>{r.name}</td><td>{r.type}</td><td>{r.station}</td><td className="aw-num">{r.planQty}</td><td>{r.standard}</td><td>{r.start}</td><td>{r.end}</td>
              {showExecution && <><td>{dispatchValue(r, idx)}</td><td>{r.owner}</td><td><MfgTone status={r.status}/></td><td><span className="aw-link" onClick={()=>onIssue && onIssue(r)}>领料</span></td></>}
              {!showExecution && dispatchMode && <td><Select value={dispatchMap[r.id] || dispatchValue(r, idx)} onChange={e=>setOneDispatch(r, e.target.value)}><option>领工模式</option><option>派工模式</option><option>自由模式</option></Select>{assignmentMap[r.id]?.length ? <div style={{fontSize:11,color:'var(--aw-fg-3)',marginTop:4}}>已派 {assignmentMap[r.id].length} 人 / {assignmentMap[r.id].reduce((sum,p)=>sum+(Number(p.qty)||0),0)}</div> : null}</td>}
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={headers.length}><EmptyState title="请选择产品" hint="选择产品后自动带入该产品对应的工艺流程" /></td></tr>}
        </tbody>
      </table></div>
      {dispatchModal && <MfgDispatchPickerModal step={dispatchModal.step} steps={dispatchModal.steps} onClose={()=>setDispatchModal(null)} onConfirm={confirmDispatch} />}
    </div>
  );
}

function MfgMaterialIssueModal({ step, product, onClose }) {
  return (
    <Modal
      title="工序领料"
      subtitle={step ? `${step.seq} ${step.name}` : ''}
      onClose={onClose}
      size="xl"
      noScroll
      footer={<><Btn onClick={onClose}>关闭</Btn><Btn>暂存</Btn><Btn kind="primary">确认领料</Btn></>}
    >
      <div className="aw-doc-grid" style={{marginBottom:14}}>
        <Field label="生产产品"><Input value={product ? `${product.name} / ${product.code}` : '未选择产品'} readOnly /></Field>
        <Field label="工序"><Input value={step ? `${step.seq} ${step.name}` : ''} readOnly /></Field>
        <Field label="工位/产线"><Input value={step?.station || ''} readOnly /></Field>
      </div>
      <table className="aw-table" style={{minWidth:1040}}>
        <thead><tr>{['序号','物料编码','物料名称','规格型号','单位','需求数量','已领取','待领取','批次','仓库/库位','操作'].map(h=><th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {MFG_STEP_MATERIALS.map((m, idx)=>(
            <tr key={m.code}>
              <td>{idx + 1}</td><td>{m.code}</td><td>{m.name}</td><td>{m.model}</td><td>{m.unit}</td><td className="aw-num">{m.need}</td><td className="aw-num">{m.picked}</td><td className="aw-num" style={{color:m.pending?'var(--aw-danger)':'var(--aw-success)'}}>{m.pending}</td><td>{m.batch}</td><td>{m.location}</td>
              <td><span className="aw-link">领料</span><span style={{margin:'0 6px',color:'var(--aw-border-strong)'}}>/</span><span className="aw-link">补料</span><span style={{margin:'0 6px',color:'var(--aw-border-strong)'}}>/</span><span className="aw-link">退料</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Modal>
  );
}

function MfgOutsourceScopeModal({ source, onClose, onConfirm }) {
  const product = source?.productRef || MFG_PRODUCTS[0];
  const [scope, setScope] = useMfgState('整单委外');
  const steps = source?.type === '生产订单'
    ? buildMfgWorkOrders(product).map((w, i) => ({ id:w.code, seq:String((i + 1) * 10), name:w.name, type:w.type, station:w.line, qty:w.qty, standard:`按${w.process}工艺要求执行`, owner:w.owner, status:w.status }))
    : getMfgProcessSteps(product).map(s => ({ ...s, qty:s.planQty }));
  const [picked, setPicked] = useMfgState({});
  const selectedSteps = steps.filter((_, i) => picked[i] || (!Object.keys(picked).length && i === 0));
  const submit = () => onConfirm && onConfirm({
    scope,
    steps: scope === '整单委外' ? steps : selectedSteps,
    product,
  });
  return (
    <Modal
      title="选择委外范围"
      subtitle={source ? `${source.type} / ${source.code}` : ''}
      onClose={onClose}
      size="xl"
      noScroll
      footer={<><Btn onClick={onClose}>取消</Btn><Btn kind="primary" onClick={submit}>确定</Btn></>}
    >
      <div style={{display:'flex',gap:24,alignItems:'center',marginBottom:14}}>
        <Radio on={scope === '整单委外'} onClick={()=>setScope('整单委外')}>整单委外</Radio>
        <Radio on={scope === '工序委外'} onClick={()=>setScope('工序委外')}>工序委外</Radio>
        <span style={{fontSize:12,color:'var(--aw-fg-3)'}}>整单委外默认带入全部子件/工序；工序委外可选择需要外协的工序。</span>
      </div>
      <div className="aw-doc-grid" style={{marginBottom:14}}>
        <Field label="来源单据"><Input value={source?.code || ''} readOnly /></Field>
        <Field label="来源产品"><Input value={`${product.name} / ${product.code}`} readOnly /></Field>
        <Field label="来源数量"><Input value={source?.qty || product.qty || ''} readOnly /></Field>
      </div>
      <table className="aw-table">
        <thead><tr>{['选择','序号','子件/工序编号','子件/工序名称','类型','工位/产线','数量','作业说明','负责人','状态'].map(h=><th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {steps.map((s, i)=>(
            <tr key={s.id} style={scope === '整单委外' || picked[i] ? {background:'var(--aw-primary-soft)'} : undefined} onClick={()=> scope === '工序委外' && setPicked(p=>({...p,[i]:!p[i]}))}>
              <td><input type="checkbox" checked={scope === '整单委外' || !!picked[i] || (!Object.keys(picked).length && i === 0 && scope === '工序委外')} disabled={scope === '整单委外'} onChange={()=>setPicked(p=>({...p,[i]:!p[i]}))} /></td>
              <td>{i + 1}</td><td>{s.seq || s.id}</td><td>{s.name}</td><td>{s.type}</td><td>{s.station}</td><td className="aw-num">{s.qty || s.planQty}</td><td>{s.standard}</td><td>{s.owner}</td><td><MfgTone status={s.status}/></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Modal>
  );
}

function MfgDemandProductTable({ rows, setRows, readOnly=false, onPlan, onOrder }) {
  const update = (id, key, value) => setRows(prev => prev.map(r => r.id === id ? { ...r, [key]: value } : r));
  return (
    <div style={{overflow:'auto'}}>
      <table className="aw-table">
        <thead><tr>{['序号','来源类型','来源单据','来源明细','产品编号','产品名称','规格型号','单位','需求数量','需求日期','交付日期','备注','操作'].map(h=><th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={r.id}>
              <td>{idx + 1}</td>
              <td>{readOnly ? (r.sourceType || '手动需求') : <Select value={r.sourceType || '手动需求'} onChange={e=>update(r.id,'sourceType',e.target.value)}><option>手动需求</option><option>销售订单</option><option>库存备货</option><option>研发试制</option></Select>}</td>
              <td>{r.sourceDoc || (r.sourceLine === '手动' ? '手动创建' : r.sourceLine || '手动创建')}</td>
              <td>{r.sourceLine || '手动明细'}</td>
              <td>{r.code}</td><td>{r.name}</td><td>{r.model}</td><td>{r.unit}</td>
              <td>{readOnly ? r.qty : <Input value={r.qty} onChange={e=>update(r.id,'qty',e.target.value)} placeholder="填写需求数量" />}</td>
              <td>{readOnly ? (r.requestDate || '2026-05-17') : <Input value={r.requestDate || '2026-05-17'} onChange={e=>update(r.id,'requestDate',e.target.value)} placeholder="选择需求日期" />}</td>
              <td>{readOnly ? (r.end || '2026-05-30') : <Input value={r.end || '2026-05-30'} onChange={e=>update(r.id,'end',e.target.value)} placeholder="选择交付日期" />}</td>
              <td>{readOnly ? (r.remark || '-') : <Input value={r.remark || ''} onChange={e=>update(r.id,'remark',e.target.value)} placeholder="填写需求说明" />}</td>
              <td>{readOnly ? <><span className="aw-link" onClick={()=>onPlan&&onPlan(r)}>计划</span><span style={{margin:'0 6px',color:'var(--aw-border-strong)'}}>/</span><span className="aw-link" onClick={()=>onOrder&&onOrder(r)}>订单</span></> : <span className="aw-link" style={{color:'var(--aw-danger)'}} onClick={()=>setRows(prev=>prev.filter(x=>x.id!==r.id))}>删除</span>}</td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={13}><EmptyState title="暂无需求产品" hint="点击新增明细选择需要生产的产品并填写需求数量" /></td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function MfgPlanProductTable({ rows, setRows, readOnly=false }) {
  const update = (id, key, value) => setRows(prev => prev.map(r => r.id === id ? { ...r, [key]: value } : r));
  return (
    <div style={{overflow:'auto'}}>
      <table className="aw-table">
        <thead><tr>{['序号','来源类型','来源单据','来源明细','产品编号','产品名称','规格型号','单位','需求数量','计划数量','计划开工','计划完工','备注','操作'].map(h=><th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={r.id}>
              <td>{idx + 1}</td>
              <td>{r.sourceType || '生产需求'}</td>
              <td>{r.sourceDoc || (r.sourceLine === '手动' ? '手动创建' : r.sourceLine || '手动创建')}</td>
              <td>{r.sourceLine || '手动明细'}</td>
              <td>{r.code}</td><td>{r.name}</td><td>{r.model}</td><td>{r.unit}</td>
              <td className="aw-num">{r.demandQty || r.qty}</td>
              <td>{readOnly ? (r.planQty || r.qty) : <Input value={r.planQty || r.qty} onChange={e=>update(r.id,'planQty',e.target.value)} placeholder="填写计划数量" />}</td>
              <td>{readOnly ? (r.start || '2026-05-18') : <Input value={r.start || '2026-05-18'} onChange={e=>update(r.id,'start',e.target.value)} placeholder="选择计划开工日期" />}</td>
              <td>{readOnly ? (r.end || '2026-05-30') : <Input value={r.end || '2026-05-30'} onChange={e=>update(r.id,'end',e.target.value)} placeholder="选择计划完工日期" />}</td>
              <td>{readOnly ? (r.remark || '-') : <Input value={r.remark || ''} onChange={e=>update(r.id,'remark',e.target.value)} placeholder="填写计划备注" />}</td>
              <td>{readOnly ? <span className="aw-link">查看</span> : <span className="aw-link" style={{color:'var(--aw-danger)'}} onClick={()=>setRows(prev=>prev.filter(x=>x.id!==r.id))}>删除</span>}</td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={14}><EmptyState title="暂无计划产品" hint="点击新增明细选择需求产品并填写计划数量" /></td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function MfgFormView({ config, moduleKey, onBack }) {
  const [sourceMode, setSourceMode] = useMfgState('销售订单');
  const [title, setTitle] = useMfgState('');
  const [source, setSource] = useMfgState(null);
  const [picker, setPicker] = useMfgState(false);
  const [productPicker, setProductPicker] = useMfgState(false);
  const [rows, setRows] = useMfgState(moduleKey === 'mfgDemand' ? [] : moduleKey === 'mfgOrder' ? MFG_PRODUCTS.slice(0,1) : MFG_PRODUCTS.slice(0,2));
  const [workOrderProduct, setWorkOrderProduct] = useMfgState(null);
  const [issueStep, setIssueStep] = useMfgState(null);
  const [outsourceScopePicker, setOutsourceScopePicker] = useMfgState(null);
  const [outsourceScope, setOutsourceScope] = useMfgState('');
  const [owner, setOwner] = useMfgState('');
  const [outsourceSupplier, setOutsourceSupplier] = useMfgState('');
  const [showOutsourceSupplierPicker, setShowOutsourceSupplierPicker] = useMfgState(false);
  const [toast, setToast] = useMfgState(null);
  const mode = moduleKey === 'mfgWorkOrder' ? 'work' : moduleKey === 'mfgOutsource' ? 'outsource' : 'normal';
  const initialStatus = MFG_INITIAL_STATUS[moduleKey] || config.statuses[0];
  const normalizeProduct = p => ({ id: Date.now()+Math.random(), sourceLine:'手动', code:p.productNo, name:p.productName, model:p.model, unit:p.unit, qty:'', batch:'自动生成', bom:'待选择', bomLock:'待锁版', route:'待选择', routeLock:'待锁版', process:'待分配', kitGap:0, substitute:'无', qms:'待生成', wms:'待入库', reported:0, good:0, bad:0, inbound:0, material:'齐套' });
  const addProducts = list => {
    const next = list.map(normalizeProduct);
    if (moduleKey === 'mfgWorkOrder' && next.length) setWorkOrderProduct(next[0]);
    else setRows(prev => [...prev, ...next]);
    setProductPicker(false);
  };
  const isOrder = moduleKey === 'mfgOrder';
  const isPlan = moduleKey === 'mfgPlan';
  const isOutsource = moduleKey === 'mfgOutsource';
  const isDemand = moduleKey === 'mfgDemand';
  const isWorkOrder = moduleKey === 'mfgWorkOrder';
  const hasTitleSourcePicker = isPlan || isOrder || isOutsource;
  const orderProduct = rows[0] || MFG_PRODUCTS[0];
  const sourceTypes = isOrder ? ['生产需求','生产计划'] : isOutsource ? ['生产订单','生产工单'] : isPlan ? ['生产需求','销售订单','库存备货'] : ['销售订单'];
  const sourceTitle = isOrder ? '选择生产订单来源' : isOutsource ? '选择委外加工来源' : isPlan ? '选择生产计划来源' : '选择来源单据';
  const applySource = row => {
    const product = {...(row.productRef || MFG_PRODUCTS[0]), qty:row.qty, sourceLine:`${row.code}-01`};
    setSource(row);
    setTitle(row.title.replace(/(需求|计划|订单|工单)$/,'') + config.title);
    setSourceMode(row.type);
    if (moduleKey === 'mfgOutsource') {
      setRows([]);
      setOutsourceScope('');
      setOutsourceScopePicker(row);
      setPicker(false);
      return;
    }
    setRows(moduleKey === 'mfgOrder' || moduleKey === 'mfgOutsource' ? [product] : [product, {...MFG_PRODUCTS[1], id:`${row.code}-extra`, sourceLine:`${row.code}-02`}]);
    setPicker(false);
  };
  const applyOutsourceScope = ({ scope, steps, product }) => {
    setOutsourceScope(scope);
    if (scope === '整单委外') {
      setRows([{
        ...product,
        id: `${product.code}-whole`,
        sourceDoc: source?.code || outsourceScopePicker?.code || 'SOURCE',
        sourceLine: `${source?.code || outsourceScopePicker?.code || 'SOURCE'}-整单`,
        sourceQty: product.qty,
        outsourceQty: product.qty,
        cost: '',
        delivery: outsourceScopePicker?.date || '2026-06-05',
        remark: '整单委外加工',
      }]);
    } else {
      setRows((steps || []).map((s, idx) => ({
        ...product,
        id: `${product.code}-${s.id || idx}`,
        sourceDoc: source?.code || outsourceScopePicker?.code || 'SOURCE',
        sourceLine: `${source?.code || outsourceScopePicker?.code || 'SOURCE'}-${s.seq || idx + 1}`,
        processSeq: s.seq || String((idx + 1) * 10),
        process: s.name,
        processType: s.type,
        route: scope,
        sourceQty: s.qty || s.planQty || product.qty,
        outsourceQty: s.qty || s.planQty || product.qty,
        line: s.station,
        cost: '',
        delivery: outsourceScopePicker?.date || '2026-06-05',
        remark: s.standard,
      })));
    }
    setOutsourceScopePicker(null);
  };
  const submit = () => {
    if (!rows.length) { setToast({ type:'err', text:'提交失败：请先添加产品明细' }); return; }
    setToast({ type:'ok', text:`${config.title}已保存，流程状态为${initialStatus}` });
  };
  return (
    <PurchaseFormPage className="aw-mfg-detail-scope aw-mfg-action-page" onBack={onBack} submitText="提交审批">
      {toast && <div style={{position:'fixed',right:28,top:76,zIndex:80,padding:'10px 14px',borderRadius:6,background:toast.type==='ok'?'#DBF3E6':'#FBDFDF',color:toast.type==='ok'?'#1F7A4E':'#D14D4D',boxShadow:'0 8px 24px rgba(16,24,40,.12)'}}>{toast.text}</div>}
      <PurchaseSection title="基础信息">
        <FormGrid>
          <Field label={config.subjectLabel} req>{hasTitleSourcePicker ? <MfgTitleField value={title} onChange={value=>{setTitle(value); setSource(null);}} onPick={()=>setPicker(true)} placeholder={`手动输入${config.subjectLabel}`} /> : <Input placeholder={`填写${config.subjectLabel}`} />}</Field>
          <Field label={config.codeLabel}><Input defaultValue="自动生成" disabled /></Field>
          {!isDemand && !isWorkOrder && !isOutsource && <Field label="生产来源" req>{hasTitleSourcePicker ? <Input value={source ? `${source.type} / ${source.code}` : '手动输入'} readOnly /> : <Select value={sourceMode} onChange={e=>{setSourceMode(e.target.value); setSource(null);}}><option>销售订单</option><option>库存备货</option><option>手动创建</option></Select>}</Field>}
          {!isDemand && !isWorkOrder && !hasTitleSourcePicker && sourceMode === '销售订单' ? (
            <>
              <Field label="销售订单" req><div style={{display:'flex',gap:8}}><Input value={source?.code || ''} readOnly placeholder="点击右侧按钮选择销售订单" /><Btn onClick={()=>setPicker(true)}>选择</Btn></div></Field>
              <Field label="客户名称"><Input value={source?.customer || ''} readOnly placeholder="选择销售订单后自动带入客户" /></Field>
              <Field label="订单交付日期"><Input value={source?.date || ''} readOnly placeholder="选择销售订单后自动带入交付日期" /></Field>
            </>
          ) : !isDemand && !isWorkOrder && !hasTitleSourcePicker ? (
            <>
              <Field label="生产项目" req><Input placeholder="填写生产项目或备货批次名称" /></Field>
              <Field label="目标仓库"><Select><option>成品仓</option><option>半成品仓</option><option>生产线边仓</option></Select></Field>
              <Field label="计划类型"><Select><option>{sourceMode}</option><option>安全库存补货</option><option>样机试制</option></Select></Field>
            </>
          ) : !isDemand && !isWorkOrder ? (
            <>
              <Field label="来源主体"><Input value={source?.customer || '手动输入后提交时选择责任主体'} readOnly /></Field>
              <Field label="来源交付日期"><Input value={source?.date || ''} readOnly placeholder="选择来源后自动带入交付日期" /></Field>
            </>
          ) : null}
          {!isPlan && !isWorkOrder && !isOutsource && <Field label={<span>{config.statusLabel}<HelpTip text="新建单据只生成初始流程状态，后续由确认、审批、排产、报工、质检、入库等动作自动推进，不能手动选择完成或关闭状态。" /></span>}><Input value={initialStatus} readOnly /></Field>}
          {!isOutsource && <Field label="生产部门" req><Select><option>生产一部</option><option>装配车间</option><option>委外管理组</option></Select></Field>}
          {!isOutsource && <Field label="负责人" req><PersonPickerInput value={owner} onChange={setOwner} placeholder="选择生产负责人" /></Field>}
          {!isOutsource && <Field label="计划开始日期" req><Input placeholder="选择计划开始日期" /></Field>}
          {!isOutsource && <Field label="计划完成日期" req><Input placeholder="选择计划完成日期" /></Field>}
          <Field label="优先级"><Select><option>普通</option><option>紧急</option><option>特急</option></Select></Field>
          {isWorkOrder && <Field label="选择产品" req><div style={{display:'flex',gap:8}}><Input value={workOrderProduct ? `${workOrderProduct.name} / ${workOrderProduct.code}` : ''} readOnly placeholder="点击右侧按钮选择产品" /><Btn onClick={()=>setProductPicker(true)}>选择</Btn></div></Field>}
          {moduleKey === 'mfgOutsource' && <><Field label="委外方式"><Input value={outsourceScope || '选择来源后确定'} readOnly /></Field><Field label="委外加工商" req><div style={{display:'flex',gap:8}}><Input value={outsourceSupplier} readOnly placeholder="选择委外加工供应商" onClick={()=>setShowOutsourceSupplierPicker(true)} style={{flex:1,cursor:'pointer'}} /><Btn onClick={()=>setShowOutsourceSupplierPicker(true)}>选择</Btn></div></Field><Field label="发料方式"><Select><option>按需发料</option><option>整批发料</option><option>委外商提供</option></Select></Field></>}
          {isOrder && <><Field label="生产产品" req><Input value={orderProduct.name} readOnly /></Field><Field label="生产数量" req><Input defaultValue={orderProduct.qty} /></Field></>}
        </FormGrid>
      </PurchaseSection>
      {isOrder ? <PurchaseSection title="工单明细"><div style={{fontSize:12,color:'var(--aw-fg-3)',marginBottom:12}}>生产订单只承接一个产品；工单明细用于拆分该产品下的半成品工单、关键工序工单和成品总装工单。</div><MfgWorkOrderDetailTable editable rows={buildMfgWorkOrders(orderProduct)} /></PurchaseSection> : <PurchaseSection title={isWorkOrder ? '工艺流程' : isOutsource ? '委外明细' : '产品明细'}>
        {isWorkOrder ? <MfgProcessFlowTable rows={getMfgProcessSteps(workOrderProduct)} onIssue={setIssueStep} dispatchMode /> : isOutsource ? <MfgOutsourceDetailTable rows={rows} setRows={setRows} scope={outsourceScope} /> : isDemand ? <MfgDemandProductTable rows={rows} setRows={setRows} /> : isPlan ? <MfgPlanProductTable rows={rows} setRows={setRows} /> : <MfgProductTable rows={rows} setRows={setRows} mode={mode}/>}
        {!isWorkOrder && !isOutsource && <PurchaseAddDetailButton onClick={() => setProductPicker(true)} hint="选择产品后自动带入产品编号、名称、规格、单位等信息" />}
      </PurchaseSection>}
      <PurchaseSection title="附件"><AttachmentGrid uploadHint="支持图纸、工艺卡、生产说明、委外协议等附件" /></PurchaseSection>
      <PurchaseSection title="详情"><PurchaseRichText placeholder="填写生产要求、工艺说明、齐套要求、交付约束和异常处理规则" /></PurchaseSection>
      <div style={{display:'flex',justifyContent:'center',gap:10,marginTop:16}}><Btn onClick={onBack}>关闭</Btn><Btn>暂存</Btn><Btn kind="primary" onClick={submit}>确定</Btn></div>
      {picker && <MfgSourcePicker title={sourceTitle} sourceTypes={sourceTypes} onClose={()=>setPicker(false)} onConfirm={applySource} />}
      {productPicker && <ProductPickerModal onClose={()=>setProductPicker(false)} onConfirm={addProducts} />}
      {showOutsourceSupplierPicker && <SimpleSupplierPickerModal title="选择委外加工商" onClose={() => setShowOutsourceSupplierPicker(false)} onConfirm={(supplier) => { setOutsourceSupplier(supplier.name); setShowOutsourceSupplierPicker(false); }} />}
      {issueStep && <MfgMaterialIssueModal step={issueStep} product={workOrderProduct || rows[0]} onClose={()=>setIssueStep(null)} />}
      {outsourceScopePicker && <MfgOutsourceScopeModal source={outsourceScopePicker} onClose={()=>setOutsourceScopePicker(null)} onConfirm={applyOutsourceScope} />}
    </PurchaseFormPage>
  );
}

function MfgDetailTable({ type }) {
  const map = {
    source: {
      cols:['来源单据','来源明细','来源类型','客户/项目','需求数量','已转计划','已下达订单','已开工单','已生产','剩余需求','交付日期','状态'],
      rows:[['SO-20260517001','SO-20260517001-01','销售订单','海南微为智造产业有限公司','120','120','120','120','80','40','2026-05-30','生产中'],['安全库存','STOCK-PLAN-01','库存策略','成品仓补货','80','80','60','60','60','20','2026-06-05','已转计划']],
    },
    kit: {
      cols:['物料编码','物料名称','BOM版本','BOM用量','损耗率','需求数量','可用库存','已锁定','缺口数量','替代料','替代审批','预计到料','齐套结论'],
      rows:[['WL-7820864','主控板','BOM-V3.2','1/台','1%','120','160','120','0','-','无需','-','齐套'],['WL-5786931','显示屏','BOM-V3.2','1/台','0%','120','86','86','34','WL-5786931-A','待审批','2026-05-22','缺料'],['WL-8518691','包装材料','BOM-V3.2','1/台','2%','120','150','120','0','-','无需','-','齐套']],
    },
    version: {
      cols:['锁定对象','锁定版本','来源主数据','锁定节点','锁定人','锁定时间','变更策略','状态'],
      rows:[['BOM','BOM-V3.2','智能温控终端默认BOM','生产订单下达','生产主管','2026-05-18 09:20','变更需BOM审批并记录差异','已锁版'],['工艺路线','RT-总装-01/V5','总装标准工艺','生产订单下达','工艺工程师','2026-05-18 09:20','在制单不受新版本影响','已锁版']],
    },
    process: {
      cols:['工序','工序类型','工序负责人','计划数量','已完成','不良数量','QMS节点','开始时间','状态'],
      rows:[['焊接','自制','三红','120','120','1','IPQC巡检','2026-05-19','已完成'],['总装','自制','李工','120','80','2','FQC完工检','2026-05-20','生产中'],['包装','自制','王工','120','0','0','免检','待排程','待开工']],
    },
    report: {
      cols:['报工单号','工序','报工人','计划数量','累计报工','本次报工','合格数量','不良数量','返工数量','超报数量','超报审批','报工时间','生成质检','状态'],
      rows:[['BG-20260517001','总装','三红','120','80','80','78','2','0','0','无需','2026-05-20 17:30','FQC-20260517002','待质检'],['BG-20260517002','焊接','李工','120','125','5','5','0','0','5','待审批','2026-05-21 11:20','IPQC-20260517003','待质检']],
    },
    material: {
      cols:['领料单号','物料名称','BOM版本','应领数量','已锁定','实领数量','欠料数量','替代料','出库仓库/库位','批次','领料人','领料时间','状态'],
      rows:[['CK-20260517001','智能温控终端主板','BOM-V3.2','120','120','118','2','-','原料仓/A-01-01','B20250601','张仓','2026-05-19','部分领料'],['CK-20260517002','显示屏','BOM-V3.2','120','86','86','34','WL-5786931-A','原料仓/A-02-03','B20250603','张仓','2026-05-19','缺料']],
    },
    return: {
      cols:['退料单号','物料名称','退料数量','实收数量','入库库位','退料人','退料时间','状态'],
      rows:[['TL-20260517001','铝合金外壳','6','6','原料仓-B03','三红','2026-05-20','已入库']],
    },
    inbound: {
      cols:['入库单号','产品名称','来源报工','QMS单号','FQC合格','让步放行','入库数量','待入库','质量状态','入库仓库/库位','WMS过账','经手人','入库时间','状态'],
      rows:[['RK-20260517001','智能温控终端','BG-20260517001','FQC-20260517002','78','0','60','18','合格','成品仓-A01','已过账','陈仓','2026-05-21','部分入库']],
    },
    outsourceSend: {
      cols:['发料单号','加工商','物料名称','应发数量','实发数量','欠发数量','出库仓库/库位','批次','WMS出库单','发料时间','状态'],
      rows:[['WF-20260517001','深圳协同加工厂','铝合金外壳','260','260','0','半成品仓-C02','B20260520','CK-WW-20260517001','2026-05-20','已发料']],
    },
    outsourceReceive: {
      cols:['收货单号','加工商','产品名称','收货数量','送检数量','质检单号','合格数量','不良数量','让步数量','入库库位','WMS入库单','收货时间','状态'],
      rows:[['WR-20260517001','深圳协同加工厂','铝合金外壳','260','260','FQC-WW-20260517001','252','8','0','半成品仓-D01','RK-WW-20260517001','2026-05-28','待入库']],
    },
    qc: {
      cols:['质检单号','来源报工/收货','检验阶段','方案版本','检验项目','检验数量','合格数量','不良数量','让步数量','返工数量','检验员','结论','回写动作'],
      rows:[['QC-20260517001','BG-20260516001','IPQC','PLAN-IPQC-V2','总装首检','10','10','0','0','0','王质检','合格','允许继续生产'],['QC-20260517002','BG-20260517001','FQC','PLAN-FQC-V4','完工检验','80','78','2','0','2','李质检','待复检','待回写入库数量'],['FQC-WW-20260517001','WR-20260517001','委外FQC','PLAN-WW-V1','外观/尺寸','260','252','8','0','8','赵质检','合格','回写委外待入库']],
    },
    op: {
      cols:['操作类型','操作人','操作时间','操作内容','结果'],
      rows:[['创建','老夏','2026-05-17 10:25','创建生产单据并提交审批','成功'],['审批','生产主管','2026-05-17 15:30','审批通过，允许排产','通过']],
    },
    work: {
      cols:['工单编号','工序','计划数量','已完成','不良数量','负责人','计划时间','状态'],
      rows:[['WO-20260517001','总装','120','80','2','三红','2026-05-19 至 2026-05-26','生产中']],
    },
  };
  const data = map[type] || map.work;
  return <table className="aw-table"><thead><tr><th>序号</th>{data.cols.map((h, idx)=><th key={`${h}-${idx}`}>{h}</th>)}</tr></thead><tbody>{data.rows.map((r,i)=><tr key={`${type}-${i}-${r[0]}`}><td>{i+1}</td>{r.map((c, idx)=><td key={`${type}-${i}-${idx}`}>{['齐套','已完成','已入库','合格','成功','通过','已发料','已锁版','已过账','无需'].includes(c)?<Badge tone="g">{c}</Badge>:['缺料','待复检','待审批'].includes(c)?<Badge tone="r">{c}</Badge>:['生产中','待质检','部分领料','待开工','待入库','已转计划'].includes(c)?<Badge tone="y">{c}</Badge>:c}</td>)}</tr>)}</tbody></table>;
}

function MfgMrpSuggestionModal({ onClose, onAccept }) {
  const [tab, setTab] = useMfgState('purchase');
  const [step, setStep] = useMfgState('config');
  const [scope, setScope] = useMfgState('全部仓库');
  const [warehousePicker, setWarehousePicker] = useMfgState(false);
  const [warehouses, setWarehouses] = useMfgState([]);
  const rows = Array.from({length:10}, (_,i)=>['7820864','产品一','002','公斤','品牌2','2024-01-23','100','50','30','供应商一']);
  const tabs = [['purchase','采购建议'],['produce','生产建议']];
  const MrpHelp = () => {
    const helpRows = [
      ['MRP运算','可以根据销售订单的产品或任意选择生产物品的需求数量和需求日期结合配料、采购及前期等参数计算所需物料的采购时间、采购量和生产建议。'],
      ['规则','在途数量：采购未入库数量；在产数量：生产未入库数量；委外待入库数量：委外未入库数量；生产占用量：生产计划消耗量减去累计领用量；可用库存=库存数量+在途数量+在产数量+委外待入库数量+生产占用量。选中后参与计算，不选则取库存数量。'],
      ['毛需求','指导生产的信息，根据一定规则，从预测量和合同量中获取，表示需要量。'],
      ['净需求','指现在库存不能满足合同量和安全库存量所缺少的部分，表示缺少量。'],
      ['损耗率','在生产的各个环节中，有各种各样的损耗，因此在计算物料需求时，要考虑到各种损耗系数。'],
    ];
    return (
      <span className="aw-help-tip aw-help-down" tabIndex="0" aria-label="MRP运算说明">
        ?
        <span className="aw-help-pop">
        <div style={{width:820,maxWidth:'78vw'}}>
          <table className="aw-table" style={{margin:0}}>
            <thead><tr><th style={{width:110}}>元素</th><th>说明</th></tr></thead>
            <tbody>{helpRows.map(r=><tr key={r[0]}><td style={{fontWeight:600}}>{r[0]}</td><td>{r[1]}</td></tr>)}</tbody>
          </table>
        </div>
        </span>
      </span>
    );
  };
  const WarehousePicker = () => {
    const list = [
      ['WH-001','成品仓','海口总仓','常温/冷藏','可用'],
      ['WH-002','原料仓','海口工厂','常温','可用'],
      ['WH-003','半成品仓','海口工厂','常温','可用'],
      ['WH-004','包材仓','海口工厂','常温','可用'],
      ['WH-005','委外暂存仓','深圳协同加工厂','常温','可用'],
    ];
    const [picked, setPicked] = useMfgState(Object.fromEntries((warehouses.length ? warehouses : ['WH-001','WH-002']).map(k=>[k,true])));
    const selectedCodes = Object.keys(picked).filter(k=>picked[k]);
    return (
      <Modal title="选择仓库" subtitle="可多选参与或不参与 MRP 运算的仓库" size="lg" onClose={()=>setWarehousePicker(false)}
        footer={<><Btn onClick={()=>setWarehousePicker(false)}>取消</Btn><Btn kind="primary" onClick={()=>{setWarehouses(selectedCodes); setWarehousePicker(false);}}>确定</Btn></>}>
        <PurchaseListToolbar searchPlaceholder="搜索仓库编号、仓库名称、地址" hideNew />
        <table className="aw-table">
          <thead><tr>{['选择','仓库编号','仓库名称','仓库地址','温区','状态'].map(h=><th key={h}>{h}</th>)}</tr></thead>
          <tbody>{list.map(r=><tr key={r[0]} style={picked[r[0]]?{background:'var(--aw-primary-soft)'}:undefined} onClick={()=>setPicked(prev=>({...prev,[r[0]]:!prev[r[0]]}))}><td><span className={'aw-chk '+(picked[r[0]]?'on':'')} /></td>{r.map((c,idx)=><td key={idx}>{idx===4?<MfgTone status={c}/>:c}</td>)}</tr>)}</tbody>
        </table>
      </Modal>
    );
  };
  if (step === 'config') {
    const Check = ({ children, on=false }) => <label style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'var(--aw-fg-2)',margin:'8px 0'}}><span className={'aw-chk '+(on?'on':'')} />{children}</label>;
    const Box = ({ title, children }) => <div style={{border:'1px dashed var(--aw-border-strong)',padding:'12px 18px',minHeight:130,background:'#fff'}}><div style={{fontSize:13,fontWeight:600,marginBottom:10,textAlign:'center'}}>{title}</div>{children}</div>;
    return (
      <StandardModal title={<span>MRP运算<MrpHelp /></span>} size="xl" onClose={onClose} footer={<><Btn onClick={onClose}>关闭</Btn><Btn kind="primary" onClick={()=>setStep('result')}>确定</Btn></>}>
        <div style={{fontSize:13,color:'var(--aw-fg-2)'}}>
          <div style={{display:'grid',gridTemplateColumns:'90px 1fr 1.2fr',gap:18,alignItems:'center',marginBottom:18}}>
            <div style={{fontWeight:600}}>计算范围：</div>
            <div style={{display:'flex',gap:28,alignItems:'center',flexWrap:'wrap'}}>
              {['全部仓库','选择参与计算的仓库','选择不参与计算的仓库'].map(opt=><Radio key={opt} on={scope===opt} onClick={()=>setScope(opt)}>{opt}</Radio>)}
            </div>
            <div style={{display:'flex',gap:8}}>
              <Input value={scope === '全部仓库' ? '全部仓库参与计算' : (warehouses.length ? warehouses.join('、') : '')} readOnly placeholder="选择仓库范围" />
              {scope !== '全部仓库' && <Btn onClick={()=>setWarehousePicker(true)}>选择仓库</Btn>}
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'90px 100px 20px 220px 24px 190px 24px 220px',gap:10,alignItems:'start',marginBottom:18}}>
            <div style={{fontWeight:600,paddingTop:8}}>公式：</div>
            <Btn>MRP建议量</Btn><div style={{paddingTop:7,fontWeight:700}}>=</div>
            <Box title="加项：需求量"><Check on>不考虑不良率</Check><Check>考虑各环节物料不良率</Check></Box>
            <div style={{paddingTop:7,fontWeight:700}}>-</div>
            <Box title="减项：现有库存"><Check>即时库存</Check><Check on>预计可用库存</Check></Box>
            <div style={{paddingTop:7,fontWeight:700}}>+</div>
            <Box title="加项：考虑安全库存"><Check>启用安全库存</Check></Box>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:28,alignItems:'start'}}>
            <Box title="预计可用容材 = 及时库存量 + 预计入库量">
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
                <div>
                  <div style={{fontWeight:600,marginBottom:8}}>采购申请量：</div><Check>已审核采购申请单</Check>
                  <div style={{fontWeight:600,margin:'14px 0 8px'}}>采购在途量：</div><Check>已审核采购订单</Check>
                  <div style={{fontWeight:600,margin:'14px 0 8px'}}>调拨在途量：</div><Check>已审核调拨出库单</Check>
                  <div style={{fontWeight:600,margin:'14px 0 8px'}}>委外在途量：</div><Check>已审核委外加工单</Check>
                  <div style={{fontWeight:600,margin:'14px 0 8px'}}>生产在制量：</div><Check>已审核生产任务单</Check>
                </div>
                <div>
                  <div style={{fontWeight:600,marginBottom:8}}>采购待入库量：</div><Check>已审核采购订单</Check>
                  <div style={{fontWeight:600,margin:'14px 0 8px'}}>其他待入库量：</div><Check>未审核其他入库单、盘盈单</Check>
                  <div style={{fontWeight:600,margin:'14px 0 8px'}}>委外待入库量：</div><Check>未审核委外产品入库单</Check>
                  <div style={{fontWeight:600,margin:'14px 0 8px'}}>生产待入库量：</div><Check>未审核产品入库单</Check>
                </div>
              </div>
            </Box>
            <Box title="减项：预计出库量 - 预留量">
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
                <div>
                  <div style={{fontWeight:600,marginBottom:8}}>销售占用量：</div><Check>已审核销售订单</Check>
                  <div style={{fontWeight:600,margin:'14px 0 8px'}}>销售待出量：</div><Check>未审核销售出库订单</Check>
                  <div style={{fontWeight:600,margin:'14px 0 8px'}}>其他待出量：</div><Check>未审核其他出库单、盘亏单</Check>
                  <div style={{fontWeight:600,margin:'14px 0 8px'}}>委外占用量：</div><Check>已审核委外加工单</Check>
                  <div style={{fontWeight:600,margin:'14px 0 8px'}}>生产占用量：</div><Check>已审核生产任务单</Check>
                </div>
                <div>
                  <div style={{fontWeight:600,marginBottom:8}}>调拨待出量：</div><Check>未审核调拨出库单</Check>
                  <div style={{fontWeight:600,margin:'14px 0 8px'}}>委外待出量：</div><Check>未审核委外领料单</Check>
                  <div style={{fontWeight:600,margin:'14px 0 8px'}}>生产待领料量：</div><Check>未审核生产领料单</Check>
                </div>
              </div>
            </Box>
          </div>
        </div>
        {warehousePicker && <WarehousePicker />}
      </StandardModal>
    );
  }
  const acceptRows = [
    { type:'请购', docNo:'PR-20260518001', code:'WL-7820864', name:'主控板', spec:'PCB-A1', unit:'件', qty:100, date:'2026-05-22', owner:'采购部', generateStatus:'已生成', confirmStatus:'待确认', flowStatus:'待审批' },
    { type:'采购', docNo:'PO-20260518001', code:'WL-5786931', name:'显示屏', spec:'4.3寸', unit:'片', qty:60, date:'2026-05-23', owner:'采购部', generateStatus:'已生成', confirmStatus:'已确认', flowStatus:'采购中' },
    { type:'内部生产', docNo:'MO-20260518001', code:'CP-2025010102', name:'半成品模组', spec:'HM-450', unit:'件', qty:80, date:'2026-05-24', owner:'生产一部', generateStatus:'已生成', confirmStatus:'待确认', flowStatus:'待生产' },
    { type:'委外加工', docNo:'OS-20260518001', code:'CP-2025010103', name:'铝合金外壳', spec:'AL-6061', unit:'套', qty:40, date:'2026-05-24', owner:'深圳协同加工厂', generateStatus:'已生成', confirmStatus:'待确认', flowStatus:'待发料' },
  ];
  return (
    <StandardModal title="MRP运算建议" size="xl" onClose={onClose} footer={<><Btn onClick={onClose}>关闭</Btn><Btn kind="primary" onClick={()=>onAccept && onAccept(acceptRows)}>采纳建议</Btn></>}>
      <div style={{fontSize:13,lineHeight:1.8,marginBottom:14,color:'var(--aw-fg-2)'}}>
        <div style={{fontSize:16,fontWeight:600,marginBottom:8}}>20240607计算销售00256MRP</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'6px 22px'}}>
          <span>创建人：XXX</span><span>创建时间：2024-06-07 19:49:12</span><span>MRP编号：MRP-20240607-0001</span><span>模拟类型：销售订单</span>
          <span>建议量取值：毛需求</span><span>可用库存规则：在途数量、在产数量、委外待入库数</span><span>仓库名称：本地仓库、仓库二、仓库三</span><span>生产计划编号：SCJ4654847</span>
        </div>
      </div>
      <div className="aw-tabs" style={{marginBottom:14}}>{tabs.map(([k,label])=><span key={k} className={'aw-tab '+(tab===k?'on':'')} onClick={()=>setTab(k)}>{label}</span>)}</div>
      {tab === 'purchase' && <><div style={{display:'flex',gap:10,marginBottom:12}}><Btn kind="primary">请购</Btn><Btn kind="primary">采购</Btn></div><table className="aw-table"><thead><tr><th style={{width:40}}><span className="aw-chk" /></th>{['序号','物品编号','物品名称','规格型号','单位','品牌','建议采购日期','建议采购量','已采购量','待采购量','供应商'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}><td><span className={'aw-chk '+(i<2?'on':'')} /></td><td>{i+1}</td><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td>{r[4]}</td><td><Input defaultValue={r[5]} /></td><td><Input defaultValue={r[6]} /></td><td>{r[7]}</td><td>{r[8]}</td><td>{r[9]}</td></tr>)}</tbody></table></>}
      {tab === 'produce' && <><div style={{display:'flex',gap:10,marginBottom:12}}><Btn kind="primary">内部生产</Btn><Btn kind="primary">委外加工</Btn></div><table className="aw-table"><thead><tr><th style={{width:40}}><span className="aw-chk" /></th>{['序号','物品编号','物品名称','规格型号','单位','建议生产日期','建议生产量','可供供应商','BOM','已生产量','待生产量'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}><td><span className={'aw-chk '+(i<2?'on':'')} /></td><td>{i+1}</td><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td><Input defaultValue={r[5]} /></td><td><Input defaultValue={r[6]} /></td><td>{r[9]}</td><td>BOM30</td><td>{r[7]}</td><td>{r[8]}</td></tr>)}</tbody></table></>}
    </StandardModal>
  );
}

function MfgStartPlanConfirmModal({ mode='plan', onClose, onCheck, onSkip }) {
  const isOrder = mode === 'order';
  return (
    <StandardModal title={isOrder ? '启动生产订单' : '启动生产计划'} size="sm" onClose={onClose}
      footer={<><Btn onClick={onClose}>取消</Btn><Btn onClick={onSkip}>不检查，直接生成订单</Btn><Btn kind="primary" onClick={onCheck}>先齐套检查</Btn></>}>
      <div style={{fontSize:14,lineHeight:1.8,color:'var(--aw-fg-2)'}}>
        {isOrder ? '启动订单前是否先进行齐套检查？' : '启动计划前是否先进行齐套检查？'}<br />
        {isOrder ? '若不检查，系统将按需求产品明细直接生成生产订单列表；生产订单确认后再拆分工单明细，后续缺料风险需在订单齐套检查中处理。' : '若不检查，系统将按计划产品明细直接生成生产订单列表；生产订单确认后再拆分工单明细，后续缺料风险需在订单齐套检查中处理。'}
      </div>
    </StandardModal>
  );
}

function MfgDateInput({ defaultValue, style }) {
  return (
    <span style={{position:'relative',display:'inline-flex',alignItems:'center',width:style?.width || 118}}>
      <Input defaultValue={defaultValue} style={{...style,paddingRight:28}} />
      <span style={{position:'absolute',right:8,color:'var(--aw-fg-3)',fontSize:12,pointerEvents:'none'}}>日</span>
    </span>
  );
}

function MfgGeneratedProductionOrderList({ onBack }) {
  const rows = MFG_PRODUCTS.map((p,i)=>({
    code:`MO-20260518-${String(i+1).padStart(3,'0')}`,
    subject:`${p.name}生产订单`,
    source:'MP-20260517001',
    sourceLine:p.sourceLine,
    productCode:p.code,
    product:p.name,
    qty:p.qty,
    start:`2026-05-${String(20+i).padStart(2,'0')}`,
    end:`2026-05-${String(24+i).padStart(2,'0')}`,
    bom:p.bom || 'BOM-V3.2',
    route:p.route || 'RT-总装-01',
    workshop:i===0?'一号工厂 / 总装车间':i===1?'一号工厂 / 焊接车间':'二号工厂 / 机加工车间',
    line:i===0?'总装产线A':i===1?'焊接产线A':'机加工产线B',
    owner:i===0?'生产一部':'装配车间',
    status:'待生产'
  }));
  return (
    <PurchaseFormPage className="aw-mfg-detail-scope aw-mfg-action-page" onBack={onBack} submitText="一键生成">
      <PurchaseSection title="生成的生产订单列表">
        <div style={{fontSize:12,color:'var(--aw-fg-3)',marginBottom:12}}>系统按生产计划产品明细一行一生产订单生成；生产订单确认后，再由生产订单拆分生成工单明细。</div>
        <div style={{overflow:'auto'}}>
          <table className="aw-table">
            <thead><tr>{['序号','生产订单编号','订单主题','来源计划','来源明细','产品编号','生产产品','生产数量','建议开工','建议完工','BOM版本','BOM锁版','工艺路线','工艺锁版','工厂车间','产线','责任部门','订单状态','操作'].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>{rows.map((r,i)=><tr key={r.code}><td>{i+1}</td><td className="aw-num">{r.code}</td><td>{r.subject}</td><td>{r.source}</td><td>{r.sourceLine}</td><td>{r.productCode}</td><td>{r.product}</td><td><Input defaultValue={r.qty} style={{width:82}} /></td><td><MfgDateInput defaultValue={r.start} style={{width:112}} /></td><td><MfgDateInput defaultValue={r.end} style={{width:112}} /></td><td><Select defaultValue={r.bom} style={{width:112}}><option>{r.bom}</option><option>BOM-V3.3</option><option>BOM-V2.1</option></Select></td><td><Select defaultValue="待锁版" style={{width:96}}><option>待锁版</option><option>已锁版</option><option>提交时锁版</option></Select></td><td><Select defaultValue={r.route} style={{width:128}}><option>{r.route}</option><option>RT-焊接-02</option><option>RT-机加工-01</option></Select></td><td><Select defaultValue="待锁版" style={{width:96}}><option>待锁版</option><option>已锁版</option><option>开工时锁版</option></Select></td><td><Select defaultValue={r.workshop} style={{width:158}}><option>{r.workshop}</option><option>一号工厂 / 总装车间</option><option>一号工厂 / 焊接车间</option><option>二号工厂 / 机加工车间</option></Select></td><td>{r.line}</td><td><Select defaultValue={r.owner} style={{width:112}}><option>{r.owner}</option><option>生产一部</option><option>装配车间</option><option>计划调度部</option></Select></td><td><MfgTone status={r.status}/></td><td><span className="aw-link">生成订单</span></td></tr>)}</tbody>
          </table>
        </div>
      </PurchaseSection>
    </PurchaseFormPage>
  );
}

function MfgWorkOrderDispatchDetail() {
  const claimRows = [
    ['WO-20260517001','总装','三红','领工模式','40','20','20','2026-05-19 09:20','待报工'],
    ['WO-20260517001','总装','李工','领工模式','40','40','0','2026-05-19 09:42','已完成'],
  ];
  const assignRows = [
    ['WO-20260517001','包装','王工','派工模式','40','20','20','生产主管','2026-05-19 10:10','生产中'],
    ['WO-20260517001','测试','陈工','派工模式','20','0','20','生产主管','2026-05-19 10:20','待报工'],
  ];
  return (
    <>
      <PurchaseSection title="领工记录">
        <table className="aw-table">
          <thead><tr>{['序号','工单编号','工序名称','领取人','执行方式','领取数量','已报工','待报工','领取时间','状态'].map(h=><th key={h}>{h}</th>)}</tr></thead>
          <tbody>{claimRows.map((r,i)=><tr key={`${r[0]}-${i}`}><td>{i+1}</td>{r.map((c,idx)=><td key={idx} className={idx>=4&&idx<=6?'aw-num':''}>{idx===8?<MfgTone status={c}/>:c}</td>)}</tr>)}</tbody>
        </table>
      </PurchaseSection>
      <PurchaseSection title="派工记录">
        <table className="aw-table">
          <thead><tr>{['序号','工单编号','工序名称','被派人员','执行方式','分派数量','已报工','待报工','分派人','分派时间','状态'].map(h=><th key={h}>{h}</th>)}</tr></thead>
          <tbody>{assignRows.map((r,i)=><tr key={`${r[0]}-${i}`}><td>{i+1}</td>{r.map((c,idx)=><td key={idx} className={idx>=4&&idx<=6?'aw-num':''}>{idx===9?<MfgTone status={c}/>:c}</td>)}</tr>)}</tbody>
        </table>
      </PurchaseSection>
    </>
  );
}

function MfgKitEstimateSection({ rows, onCheck }) {
  const [detail, setDetail] = useMfgState(null);
  const [viewRows, setViewRows] = useMfgState(rows || []);
  useMfgEffect(() => setViewRows(rows || []), [rows]);
  const withdrawRow = idx => setViewRows(prev => prev.map((r,i) => i === idx ? { ...r, generateStatus:'已撤回', confirmStatus:'-', flowStatus:'已关闭' } : r));
  if (!viewRows?.length) {
    return (
      <PurchaseSection title="齐套预估">
        <div style={{minHeight:120,display:'flex',alignItems:'center',justifyContent:'center',border:'1px dashed var(--aw-border-strong)',background:'var(--aw-surface-2)'}}>
          <Btn kind="primary" onClick={onCheck}>齐套检查</Btn>
        </div>
      </PurchaseSection>
    );
  }
  return (
    <>
      <PurchaseSection title={<span style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,width:'100%'}}><span>齐套预估</span><Btn style={{height:28,padding:'0 10px'}} onClick={onCheck}>齐套检查</Btn></span>}>
        <div style={{fontSize:12,color:'var(--aw-fg-3)',marginBottom:12}}>以下记录来自 MRP 运算中已勾选并采纳的建议，可继续二次齐套检查。</div>
        <table className="aw-table">
          <thead><tr>{['序号','建议类型','关联单据','物料/产品编号','名称','规格型号','单位','建议数量','建议日期','责任对象','生成状态','确认状态','单据状态','操作'].map(h=><th key={h}>{h}</th>)}</tr></thead>
          <tbody>{viewRows.map((r,i)=><tr key={`${r.type}-${r.code}`}><td>{i+1}</td><td><Badge tone={r.type.includes('生产')?'b':r.type.includes('委外')?'y':'g'}>{r.type}</Badge></td><td className="aw-link" onClick={()=>setDetail(r)}>{r.docNo}</td><td>{r.code}</td><td>{r.name}</td><td>{r.spec}</td><td>{r.unit}</td><td className="aw-num">{r.qty}</td><td>{r.date}</td><td>{r.owner}</td><td><MfgTone status={r.generateStatus || '已生成'}/></td><td><MfgTone status={r.confirmStatus || '待确认'}/></td><td><MfgTone status={r.flowStatus || r.status || '待确认'}/></td><td><span className="aw-link" onClick={()=>setDetail(r)}>查看</span><span style={{margin:'0 6px',color:'var(--aw-border-strong)'}}>/</span><span className="aw-link" style={{color:'var(--aw-danger)'}} onClick={()=>withdrawRow(i)}>撤回</span></td></tr>)}</tbody>
        </table>
      </PurchaseSection>
      {detail && <MfgKitEstimateDocModal row={detail} onClose={()=>setDetail(null)} />}
    </>
  );
}

function MfgKitEstimateDocModal({ row, onClose }) {
  const titleMap = { '请购':'请购单详情', '采购':'采购订单详情', '内部生产':'生产订单详情', '委外加工':'委外单详情' };
  const fields = [
    ['单据类型', row.type], ['单据编号', row.docNo], ['生成状态', row.generateStatus || '已生成'], ['确认状态', row.confirmStatus || '待确认'], ['单据状态', row.flowStatus || row.status],
    ['物料/产品', `${row.name} / ${row.code}`], ['规格型号', row.spec], ['数量', row.qty],
    ['责任对象', row.owner], ['建议日期', row.date], ['来源', 'MRP齐套预估采纳'],
  ];
  return (
    <Modal title={titleMap[row.type] || '单据详情'} subtitle={row.docNo} size="lg" onClose={onClose} footer={<Btn kind="primary" onClick={onClose}>关闭</Btn>}>
      <InfoGrid items={fields.map(([label,value])=>({label,value: ['生成状态','确认状态','单据状态'].includes(label) ? <MfgTone status={value}/> : value}))} />
      <div style={{height:14}} />
      <PurchaseSection title="单据明细">
        <table className="aw-table">
          <thead><tr>{['序号','物料/产品编号','名称','规格型号','单位','数量','交付/到货日期','备注'].map(h=><th key={h}>{h}</th>)}</tr></thead>
          <tbody><tr><td>1</td><td>{row.code}</td><td>{row.name}</td><td>{row.spec}</td><td>{row.unit}</td><td className="aw-num">{row.qty}</td><td>{row.date}</td><td>由齐套预估采纳生成</td></tr></tbody>
        </table>
      </PurchaseSection>
    </Modal>
  );
}

function MfgDetailView({ config, row, moduleKey, onBack }) {
  const tabs = moduleKey === 'mfgWorkOrder' ? ['工单信息','工艺流程','领工派工','领料记录','报工记录','质检记录','退料记录','入库记录','操作记录'] :
    moduleKey === 'mfgOutsource' ? ['委外加工信息','委外明细','委外发料','委外收货','质检记录','入库记录','操作记录'] :
    moduleKey === 'mfgOrder' ? ['工单信息','工单明细','来源记录','版本锁定','齐套检查','工序进度','领料记录','退料记录','成品入库记录','工单执行记录','质检记录','操作记录'] :
    moduleKey === 'mfgPlan' ? ['计划信息','产品明细','来源记录','齐套预估','排产记录','操作记录'] :
    ['基本信息','产品明细','操作记录'];
  const [tab, setTab] = useMfgState(tabs[0]);
  const [generateAction, setGenerateAction] = useMfgState(null);
  const [mrpModal, setMrpModal] = useMfgState(false);
  const [startPlanModal, setStartPlanModal] = useMfgState(false);
  const [startPlanModalMode, setStartPlanModalMode] = useMfgState('plan');
  const [generatedWorkOrders, setGeneratedWorkOrders] = useMfgState(false);
  const [startPlanFlow, setStartPlanFlow] = useMfgState(false);
  const [kitAcceptedRows, setKitAcceptedRows] = useMfgState([]);
  const [issueStep, setIssueStep] = useMfgState(null);
  const startOrderFlowWithCheck = () => {
    setStartPlanModal(false);
    setStartPlanFlow(true);
    if (moduleKey === 'mfgPlan') setTab('齐套预估');
    setMrpModal(true);
  };
  const openStartFlowModal = (mode='plan') => {
    setStartPlanModalMode(mode);
    setStartPlanModal(true);
  };
  if (generateAction?.type === 'plan') return <MfgGeneratedPlanView row={row} product={generateAction.product} onBack={()=>setGenerateAction(null)} />;
  if (generateAction?.type === 'order') return <MfgGeneratedOrderView row={row} product={generateAction.product} onBack={()=>setGenerateAction(null)} />;
  if (generatedWorkOrders) return <MfgGeneratedProductionOrderList onBack={()=>setGeneratedWorkOrders(false)} />;
  return (
    <div className="aw-doc-form aw-mfg-detail-scope aw-mfg-main-detail"><div className="aw-doc-form-body">
      <DetailHeaderCard
        title={`${row.subject} ${row.code}`}
        status={row.status}
        onBack={onBack}
        creator="老夏"
        createdAt="2026-05-17 10:25"
        modifier="生产主管"
        modifiedAt="2026-05-17 15:30"
        beforeActions={moduleKey === 'mfgPlan' ? <button className="aw-btn primary" onClick={()=>openStartFlowModal('plan')}>启动计划</button> : null}
        detailItems={[
          [config.codeLabel, row.code],
          ['来源单据', row.source],
          ['生产产品', row.product],
          ['计划数量', row.qty],
          ['责任部门', row.owner],
          ['计划周期', `${row.date} 至 ${row.end}`],
          ['打印状态', '未打印'],
        ]}
      />
      <Card style={{ overflow:'hidden' }}>
        <div className="aw-tabs" style={{marginBottom:14}}>{tabs.map(t=><span key={t} className={'aw-tab '+(tab===t?'on':'')} onClick={()=>setTab(t)}>{t}</span>)}</div>
        {(tab.includes('信息') || tab === '基本信息') && <><PurchaseSection title="基础信息"><InfoGrid items={[
          {label:config.subjectLabel, value:row.subject},{label:config.codeLabel,value:row.code},
          ...(moduleKey === 'mfgDemand' ? [
            {label:'需求产品',value:row.product},{label:'需求数量',value:row.qty},{label:'需求状态',value:<MfgTone status={row.status}/>},{label:'需求部门',value:row.owner},{label:'需求日期',value:row.date},{label:'交付日期',value:row.end}
          ] : [
            {label:'来源单据',value:row.source},{label:'生产产品',value:row.product},{label:'计划数量',value:row.qty},{label:config.statusLabel,value:<MfgTone status={row.status}/>},{label:'责任部门',value:row.owner},{label:'计划周期',value:`${row.date} 至 ${row.end}`},{label:'齐套状态',value:<MfgTone status="齐套"/>}
          ])
        ]}/></PurchaseSection><PurchaseSection title="详情"><div className="aw-mfg-readonly-detail">生产要求：按当前确认的需求数量组织排产，优先保障交付日期；工艺说明：执行已锁定的 BOM 与工艺路线，关键工序需按检验标准留痕；齐套要求：开工前完成物料齐套确认，异常缺料需提交处理意见；交付约束：按计划周期跟踪进度，影响交付时及时预警并记录原因。</div></PurchaseSection><PurchaseSection title="附件"><AttachmentGrid uploadHint="支持图纸、工艺卡、生产说明、委外协议等附件" /></PurchaseSection></>}
        {tab === '产品明细' && <PurchaseSection title="产品明细">{moduleKey === 'mfgDemand' ? <MfgDemandProductTable rows={MFG_PRODUCTS.map(p=>({...p, sourceType:p.sourceLine?.startsWith('SO')?'销售订单':'手动需求', sourceDoc:p.sourceLine?.split('-').slice(0,3).join('-')}))} setRows={()=>{}} readOnly onPlan={product=>setGenerateAction({type:'plan',product})} onOrder={()=>openStartFlowModal('order')} /> : <MfgPlanProductTable rows={MFG_PRODUCTS.map(p=>({...p, sourceType:'生产需求', sourceDoc:p.sourceLine?.split('-').slice(0,3).join('-'), demandQty:p.qty, planQty:p.qty}))} setRows={()=>{}} readOnly />}</PurchaseSection>}
        {tab === '工单明细' && <PurchaseSection title="工单明细"><div style={{fontSize:12,color:'var(--aw-fg-3)',marginBottom:12}}>一个生产订单只对应一个产品；以下工单是该订单产品下的半成品工单、关键工序工单和成品总装工单。</div><MfgWorkOrderDetailTable rows={buildMfgWorkOrders(MFG_PRODUCTS[0])} /></PurchaseSection>}
        {tab === '委外明细' && <PurchaseSection title="委外明细"><MfgOutsourceDetailTable rows={MFG_PRODUCTS.map(p=>({...p, sourceDoc:row.source, sourceQty:p.qty, outsourceQty:p.qty, cost:'12.00', delivery:row.end, remark:'委外加工'}))} setRows={()=>{}} scope="整单委外" readOnly /></PurchaseSection>}
        {tab === '工艺流程' && <PurchaseSection title="工艺流程"><MfgProcessFlowTable rows={getMfgProcessSteps(MFG_PRODUCTS[0])} showExecution onIssue={setIssueStep} /></PurchaseSection>}
        {tab.includes('领工派工') && <MfgWorkOrderDispatchDetail />}
        {tab.includes('领料') && <MfgDetailTable type="material" />}
        {tab.includes('退料') && <MfgDetailTable type="return" />}
        {tab.includes('入库') && <MfgDetailTable type="inbound" />}
        {tab.includes('报工') && <MfgDetailTable type="report" />}
        {tab.includes('工单执行') && <MfgWorkOrderDetailTable rows={buildMfgWorkOrders(MFG_PRODUCTS[0])} />}
        {tab.includes('质检') && <MfgDetailTable type="qc" />}
        {tab.includes('来源') && <MfgDetailTable type="source" />}
        {moduleKey === 'mfgPlan' && tab === '齐套预估' && <MfgKitEstimateSection rows={kitAcceptedRows} onCheck={()=>setMrpModal(true)} />}
        {moduleKey === 'mfgPlan' && tab === '排产记录' && <MfgPlanScheduleRecords />}
        {tab.includes('齐套') && !(moduleKey === 'mfgPlan' && tab === '齐套预估') && <MfgDetailTable type="kit" />}
        {tab.includes('版本') && <MfgDetailTable type="version" />}
        {(tab.includes('工序') || tab.includes('排产')) && !(moduleKey === 'mfgPlan' && tab === '排产记录') ? <MfgDetailTable type="process" /> : null}
        {tab.includes('委外发料') && (moduleKey === 'mfgOutsource' ? <MfgOutsourceSendPanel row={row} /> : <MfgDetailTable type="outsourceSend" />)}
        {tab.includes('委外收货') && <MfgDetailTable type="outsourceReceive" />}
        {tab.includes('操作') && <MfgDetailTable type="op" />}
      </Card>
      {startPlanModal && <MfgStartPlanConfirmModal mode={startPlanModalMode} onClose={()=>setStartPlanModal(false)} onCheck={startOrderFlowWithCheck} onSkip={()=>{setStartPlanModal(false); setStartPlanFlow(false); setGeneratedWorkOrders(true);}} />}
      {mrpModal && <MfgMrpSuggestionModal onClose={()=>{setMrpModal(false); setStartPlanFlow(false);}} onAccept={rows=>{setKitAcceptedRows(rows); setMrpModal(false); if (startPlanFlow) { setStartPlanFlow(false); setGeneratedWorkOrders(true); } else { setTab('齐套预估'); }}} />}
      {issueStep && <MfgMaterialIssueModal step={issueStep} product={MFG_PRODUCTS[0]} onClose={()=>setIssueStep(null)} />}
    </div></div>
  );
}

function MfgDemandDetailMini() {
  const rows = [
    ['SO-20260517001','智能温控终端','CP-2025010101','台','120','80','40','2026-05-30','生产中'],
    ['安全库存','半成品模组','CP-2025010102','件','300','120','180','2026-06-05','待生产'],
  ];
  return <table className="aw-table"><thead><tr>{['序号','来源单据','产品名称','产品编号','单位','需求数量','已生产','还需生产','交付日期','状态'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={r[2]}><td>{i+1}</td>{r.map((c,idx)=><td key={idx} className={idx>=4&&idx<=6?'aw-num':''}>{idx===8?<MfgTone status={c}/>:c}</td>)}</tr>)}</tbody></table>;
}

function MfgDemandDetailView({ onBack }) {
  const rows = [
    { product:'智能温控终端', code:'CP-2025010101', model:'PRO', unit:'台', plan:120, done:80, left:40, date:'2026-05-30', status:'生产中', sources:[['SO-20260517001','销售订单','海南微为智造产业有限公司','SO-20260517001-01','80','60','20','2026-05-30','生产中'],['MR-20260517001','生产需求','销售订单生产需求','MR-20260517001-01','40','20','20','2026-05-30','已确认']] },
    { product:'半成品模组', code:'CP-2025010102', model:'HM-450', unit:'件', plan:300, done:120, left:180, date:'2026-06-05', status:'待生产', sources:[['SO-20260517002','销售订单','广州明德贸易有限公司','SO-20260517002-01','180','60','120','2026-06-05','待确认'],['STOCK-PLAN-01','库存备货','半成品安全库存补货','STOCK-PLAN-01-01','120','60','60','2026-06-05','待生产']] },
    { product:'铝合金外壳', code:'CP-2025010103', model:'AL-6061', unit:'套', plan:260, done:260, left:0, date:'2026-05-28', status:'已完工', sources:[['RD-202605-006','研发试制','结构件试制项目','RD-202605-006-01','160','160','0','2026-05-28','已完工'],['MO-20260517001','生产订单','总装配套需求','MO-20260517001-02','100','100','0','2026-05-28','已完工']] },
    { product:'样机控制板', code:'CP-2025010104', model:'PCB-V2', unit:'片', plan:50, done:12, left:38, date:'2026-05-24', status:'生产中', sources:[['RD-202605-008','研发试制','样机控制板试制','RD-202605-008-01','50','12','38','2026-05-24','生产中']] },
  ];
  const [selected, setSelected] = useMfgState(null);
  if (selected) {
    return (
      <PurchaseFormPage className="aw-mfg-detail-scope aw-mfg-action-page" onBack={()=>setSelected(null)} submitText="导出来源">
        <PurchaseSection title={`${selected.product} 需求数量与来源列表`}>
          <InfoGrid items={[
            {label:'产品编号', value:selected.code},{label:'产品名称', value:selected.product},{label:'规格型号', value:selected.model},{label:'单位', value:selected.unit},{label:'需求数量', value:selected.plan},{label:'已生产数量', value:selected.done},{label:'还需生产数量', value:selected.left},{label:'交付日期', value:selected.date},{label:'需求状态', value:<MfgTone status={selected.status}/>}
          ]}/>
          <div style={{height:14}} />
          <table className="aw-table">
            <thead><tr>{['序号','来源单据','来源类型','来源对象','来源明细','需求数量','已生产','还需生产','交付日期','状态'].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>{selected.sources.map((r,i)=><tr key={r[0]+r[3]}><td>{i+1}</td>{r.map((c,idx)=><td key={idx} className={idx>=4&&idx<=6?'aw-num':''}>{idx===8?<MfgTone status={c}/>:idx===0?<span className="aw-link">{c}</span>:c}</td>)}</tr>)}</tbody>
          </table>
        </PurchaseSection>
      </PurchaseFormPage>
    );
  }
  return (
    <div className="aw-doc-main">
      <PurchaseListToolbar searchPlaceholder="全局搜索（如产品名称、产品编号、需求来源）" hideNew />
      <div className="aw-doc-tbl-wrap">
        <div className="aw-doc-tbl-inner">
          <table className="aw-doc-tbl" style={{whiteSpace:'nowrap'}}>
            <thead>
              <tr>
                <PurchaseIndexHeader /><th><div className="aw-th-inner">产品编号</div></th><th><div className="aw-th-inner">产品名称</div></th><th><div className="aw-th-inner">规格型号</div></th><th><div className="aw-th-inner">单位</div></th><th><div className="aw-th-inner">需求来源数</div></th><th><div className="aw-th-inner">需求数量</div></th><th><div className="aw-th-inner">已生产</div></th><th><div className="aw-th-inner">还需生产</div></th><th><div className="aw-th-inner">交付日期</div></th><PurchaseStatusFilterHeader label="状态" options={['待生产','生产中','已完工']} /><th><div className="aw-th-inner">操作</div></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.code}>
                  <td>{i + 1}</td><td>{r.code}</td><td>{r.product}</td><td>{r.model}</td><td>{r.unit}</td><td className="aw-num">{r.sources.length}</td>
                  <td className="aw-num">{r.plan}</td><td className="aw-num">{r.done}</td><td className="aw-num" style={{color:r.left ? 'var(--aw-danger)' : 'var(--aw-success)'}}>{r.left}</td><td>{r.date}</td><td><MfgTone status={r.status}/></td><td><span className="aw-link" onClick={()=>setSelected(r)}>查看</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <PurchaseListFooter total={rows.length} selectedCount={0} pages={1} />
    </div>
  );
}

function MfgActionView({ config, action, onBack }) {
  if (action === '生产需求详情' || action === '生产需求汇总') return <MfgDemandDetailView onBack={onBack} />;
  if (action === '生产计划策略设置') return <MfgPlanPolicyView onBack={onBack} />;
  if (action === '生产订单策略设置') return <MfgOrderPolicyView onBack={onBack} />;
  if (action === '生产工单策略设置') return <MfgWorkOrderPolicyView onBack={onBack} />;
  if (action === '委外加工策略设置') return <MfgOutsourcePolicyView onBack={onBack} />;
  if (action === '领工派工') return <MfgDispatchActionView />;
  if (action === '任务报工') return <MfgReportActionView onBack={onBack} />;
  if (action === '报工记录') return <MfgReportRecordList />;
  if (action === '委外发料') return <MfgOutsourceRecordList type="send" />;
  if (action === '委外入库') return <MfgOutsourceRecordList type="inbound" />;
  return (
    <PurchaseFormPage className="aw-mfg-detail-scope aw-mfg-action-page" onBack={onBack} submitText="保存设置">
      <PurchaseSection title={action || `${config.title}设置`}>
        <FormGrid>
          <Field label="规则名称" req><Input placeholder={`填写${action || config.title}规则名称`} /></Field>
          <Field label="启用状态"><Select><option>启用</option><option>停用</option></Select></Field>
          <Field label="适用范围"><Select><option>全部生产组织</option><option>生产一部</option><option>委外管理组</option></Select></Field>
          <Field label="生效日期"><Input placeholder="选择规则生效日期" /></Field>
          <Field label="审批流程"><Select><option>生产主管审批</option><option>计划员审批</option><option>无需审批</option></Select></Field>
          <Field label="异常处理"><Select><option>提示并允许保存</option><option>阻止提交</option><option>提交审批</option></Select></Field>
        </FormGrid>
      </PurchaseSection>
      <PurchaseSection title="规则说明"><PurchaseRichText placeholder="填写编号、审批、打印或策略规则说明" /></PurchaseSection>
    </PurchaseFormPage>
  );
}

function MfgPolicyRow({ title, sub, val, set }) {
  return (
    <div style={{padding:'16px 18px',border:'1px solid var(--aw-border)',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10,background:'#fff'}}>
      <div>
        <div style={{fontSize:14,fontWeight:600,marginBottom:4}}>{title}</div>
        <div style={{fontSize:12,color:'var(--aw-fg-3)'}}>{sub}</div>
      </div>
      <div style={{display:'flex',gap:16}}>
        <Radio on={val === 'y'} onClick={() => set('y')}>是</Radio>
        <Radio on={val === 'n'} onClick={() => set('n')}>否</Radio>
      </div>
    </div>
  );
}

function MfgPlanPolicyView({ onBack }) {
  const [tab, setTab] = useMfgState('kit');
  const [bomLock, setBomLock] = useMfgState('y');
  const [routeLock, setRouteLock] = useMfgState('y');
  const [kitCheck, setKitCheck] = useMfgState('y');
  const [shortStart, setShortStart] = useMfgState('n');
  const [substitute, setSubstitute] = useMfgState('y');
  const [autoOrder, setAutoOrder] = useMfgState('n');
  const Row = MfgPolicyRow;
  return (
    <PurchaseFormPage className="aw-mfg-detail-scope aw-mfg-action-page" onBack={onBack} submitText="保存策略">
      <PurchaseSection title="生产计划策略设置">
        <div className="aw-tabs" style={{marginBottom:14}}>
          {[['kit','齐套策略'],['version','版本控制策略'],['order','下达策略']].map(([k,label])=><span key={k} className={'aw-tab '+(tab===k?'on':'')} onClick={()=>setTab(k)}>{label}</span>)}
        </div>
        {tab === 'kit' && <>
          <Row title="计划审批前是否必须齐套预估" sub="开启后，生产计划提交审批前必须生成物料齐套预估和缺口明细。" val={kitCheck} set={setKitCheck} />
          <Row title="缺料是否允许进入计划审批" sub="关闭时，存在缺口数量的计划必须先处理采购、调拨或替代料。" val={shortStart} set={setShortStart} />
          <Row title="是否允许使用替代料" sub="开启后，计划齐套预估可引用 BOM 替代料规则；正式使用仍需按审批策略执行。" val={substitute} set={setSubstitute} />
        </>}
        {tab === 'version' && <>
          <Row title="计划审批时是否预锁 BOM 版本" sub="开启后，计划审批通过时记录预锁 BOM；生产订单下达时正式锁定。" val={bomLock} set={setBomLock} />
          <Row title="计划审批时是否预锁工艺路线" sub="开启后，计划审批通过时记录预锁工艺；生产订单下达时正式锁定。" val={routeLock} set={setRouteLock} />
          <Row title="主数据改版是否提示计划差异" sub="开启后，BOM 或工艺在计划审批后发生新版本时，列表和详情显示差异提醒。" val="y" set={()=>{}} />
        </>}
        {tab === 'order' && <>
          <Row title="计划审批通过后是否自动生成生产订单" sub="开启后，计划审批通过按产品明细自动拆分单产品生产订单；关闭时由用户手动下达。" val={autoOrder} set={setAutoOrder} />
          <Row title="是否按产品明细一行一单下达" sub="生产订单必须一单一产品；开启后每条计划产品明细生成一张生产订单。" val="y" set={()=>{}} />
          <Row title="是否允许跨部门合并排产" sub="开启后，可将同产品、同交期、同版本的计划合并到同一排产批次。" val="n" set={()=>{}} />
        </>}
      </PurchaseSection>
      <PurchaseSection title="策略说明"><PurchaseRichText placeholder="填写生产计划齐套、版本预锁、订单下达和异常审批规则说明" /></PurchaseSection>
    </PurchaseFormPage>
  );
}

function MfgOrderPolicyView({ onBack }) {
  const [tab, setTab] = useMfgState('version');
  const [bomLock, setBomLock] = useMfgState('y');
  const [routeLock, setRouteLock] = useMfgState('y');
  const [shortStart, setShortStart] = useMfgState('n');
  const [substitute, setSubstitute] = useMfgState('y');
  const [oneProduct, setOneProduct] = useMfgState('y');
  const Row = MfgPolicyRow;
  return (
    <Card>
      <Tabs
        items={[
          { k:'version', label:'版本锁定策略' },
          { k:'kit', label:'齐套开工策略' },
          { k:'order', label:'订单生成策略' },
        ]}
        active={tab}
        onChange={setTab}
      />
      {tab === 'version' && <>
        <Row title="生产订单下达时是否锁定 BOM 版本" sub="开启后，订单下达后继续使用已锁定 BOM；后续 BOM 修改不影响正在生产中的订单，只生成差异提醒或变更审批。" val={bomLock} set={setBomLock} />
        <Row title="生产订单下达时是否锁定工艺路线" sub="开启后，订单下达后固定工艺路线；如需替换路线，必须走工艺变更审批并记录影响范围。" val={routeLock} set={setRouteLock} />
        <Row title="版本差异是否强制审批" sub="BOM 或工艺存在新版本时，订单修改、启动、转工单前必须确认差异。" val="y" set={()=>{}} />
      </>}
      {tab === 'kit' && <>
        <Row title="缺料是否允许启动生产订单" sub="关闭时，存在缺口物料的订单不能启动；开启后生成缺料风险和补料任务。" val={shortStart} set={setShortStart} />
        <Row title="是否允许使用替代料" sub="开启后，订单齐套检查可引用 BOM 替代料规则；实际领料仍按替代料审批策略执行。" val={substitute} set={setSubstitute} />
        <Row title="启动订单前是否提醒齐套检查" sub="点击启动计划或启动订单时提醒先做齐套检查，也允许按权限跳过检查直接生成订单。" val="y" set={()=>{}} />
      </>}
      {tab === 'order' && <>
        <Row title="生产订单是否一单一产品" sub="开启后，一个生产订单只对应一个成品或半成品；下游工单明细用于拆分半成品工单和工序工单。" val={oneProduct} set={setOneProduct} />
        <Row title="是否允许从需求或计划生成订单" sub="开启后，新增生产订单主题输入框可搜索选择生产需求或生产计划，并自动带入产品明细。" val="y" set={()=>{}} />
        <Row title="订单变更是否联动工单" sub="订单数量、交期、版本变更会提示同步影响未开工工单；已开工工单必须走变更审批。" val="y" set={()=>{}} />
      </>}
      <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:16}}>
        <Btn kind="secondary">重置默认</Btn>
        <Btn kind="primary">保存</Btn>
      </div>
    </Card>
  );
}

function MfgWorkOrderPolicyView({ onBack }) {
  const [tab, setTab] = useMfgState('report');
  const [qtyReport, setQtyReport] = useMfgState('y');
  const [qualityBlock, setQualityBlock] = useMfgState('y');
  const [overReport, setOverReport] = useMfgState('n');
  const [autoQc, setAutoQc] = useMfgState('y');
  const [autoInbound, setAutoInbound] = useMfgState('n');
  const Row = MfgPolicyRow;
  return (
    <Card>
      <Tabs
        items={[
          { k:'report', label:'报工规则' },
          { k:'quality', label:'质检联动策略' },
          { k:'warehouse', label:'入库联动策略' },
        ]}
        active={tab}
        onChange={setTab}
      />
      {tab === 'report' && <>
        <Row title="是否允许按产量报工" sub="开启后，工单执行人可填写本次报工数量、合格数量和不良数量。" val={qtyReport} set={setQtyReport} />
        <Row title="是否允许按工时报工" sub="开启后，可记录人工工时和设备工时，作为工序成本核算依据。" val="y" set={()=>{}} />
        <Row title="是否允许超量报工" sub="关闭时，累计报工数量不能超过工单计划数量；开启后超过阈值进入审批。" val={overReport} set={setOverReport} />
        <Row title="超量报工是否必须审批" sub="超过计划数量或策略阈值的报工单必须审批后才写入进度。" val="y" set={()=>{}} />
      </>}
      {tab === 'quality' && <>
        <Row title="完工报工后是否生成质检任务" sub="开启后，报工完成自动生成 QMS 待检记录，按工艺节点匹配首检、巡检或完工检。" val={autoQc} set={setAutoQc} />
        <Row title="质检未完成是否禁止完工" sub="开启后，存在待检或不合格未处理时，工单不能流转为已完工。" val={qualityBlock} set={setQualityBlock} />
        <Row title="不良数量是否自动进入返工流程" sub="开启后，报工不良数量会生成返工记录或异常处理任务。" val="y" set={()=>{}} />
      </>}
      {tab === 'warehouse' && <>
        <Row title="合格报工后是否自动申请入库" sub="开启后，合格数量会生成 WMS 待入库记录；关闭时仅记录生产进度。" val={autoInbound} set={setAutoInbound} />
        <Row title="入库前是否强制关联质检结果" sub="开启后，未通过质检的数量不能进入成品或半成品库。" val="y" set={()=>{}} />
        <Row title="是否允许部分完工入库" sub="开启后，工单未全部完成时，可按合格数量分批入库。" val="y" set={()=>{}} />
      </>}
      <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:16}}>
        <Btn kind="secondary">重置默认</Btn>
        <Btn kind="primary">保存</Btn>
      </div>
    </Card>
  );
}

function MfgOutsourcePolicyView({ onBack }) {
  const [tab, setTab] = useMfgState('source');
  const [orderSource, setOrderSource] = useMfgState('y');
  const [workOrderSource, setWorkOrderSource] = useMfgState('y');
  const [mandatoryQc, setMandatoryQc] = useMfgState('y');
  const [partialReceive, setPartialReceive] = useMfgState('y');
  const [autoIssue, setAutoIssue] = useMfgState('n');
  const Row = MfgPolicyRow;
  return (
    <Card>
      <Tabs
        items={[
          { k:'source', label:'来源策略' },
          { k:'quality', label:'质检策略' },
          { k:'receive', label:'收货入库策略' },
        ]}
        active={tab}
        onChange={setTab}
      />
      {tab === 'source' && <>
        <Row title="是否允许从生产订单发起委外" sub="开启后，选择生产订单后可继续选择整单委外或工序委外。" val={orderSource} set={setOrderSource} />
        <Row title="是否允许从生产工单发起委外" sub="开启后，选择生产工单后可按该工单产品的工艺流程选择外协工序。" val={workOrderSource} set={setWorkOrderSource} />
        <Row title="是否允许整单委外" sub="开启后，可将订单产品拆出的全部子件/工序一次性委外。" val="y" set={()=>{}} />
        <Row title="是否允许工序委外" sub="开启后，可选择部分工序或子件进行外协加工。" val="y" set={()=>{}} />
      </>}
      {tab === 'quality' && <>
        <Row title="委外收货后是否强制质检" sub="开启后，委外收货必须生成 QMS 质检任务，通过后才允许入库。" val={mandatoryQc} set={setMandatoryQc} />
        <Row title="是否允许抽检" sub="开启后，可按供应商等级、产品类型或历史合格率配置抽检方案。" val="y" set={()=>{}} />
        <Row title="是否允许免检入库" sub="开启后，仅满足免检策略的供应商和物料可跳过质检直接入库。" val="n" set={()=>{}} />
      </>}
      {tab === 'receive' && <>
        <Row title="是否允许部分收货" sub="开启后，委外加工数量可分批收货和分批入库。" val={partialReceive} set={setPartialReceive} />
        <Row title="委外发料是否自动生成出库单" sub="开启后，委外单确认后按物料需求自动生成仓储出库申请。" val={autoIssue} set={setAutoIssue} />
        <Row title="收货差异是否必须审批" sub="开启后，超收、短收、不良或让步接收需要进入审批流程。" val="y" set={()=>{}} />
      </>}
      <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:16}}>
        <Btn kind="secondary">重置默认</Btn>
        <Btn kind="primary">保存</Btn>
      </div>
    </Card>
  );
}

function MfgActionTable({ title, type, onBack }) {
  return (
    <PurchaseFormPage className="aw-mfg-detail-scope aw-mfg-action-page" onBack={onBack} submitText="导出">
      <PurchaseSection title={title}>
        <MfgDetailTable type={type} />
      </PurchaseSection>
    </PurchaseFormPage>
  );
}

function MfgClaimWorkModal({ row, onClose, onConfirm }) {
  const [qty, setQty] = useMfgState(row?.canClaim || '40');
  return (
    <Modal
      title="领取工序任务"
      subtitle={row ? `${row.workNo} / ${row.process}` : ''}
      size="sm"
      onClose={onClose}
      footer={<><Btn onClick={onClose}>取消</Btn><Btn kind="primary" onClick={()=>onConfirm && onConfirm({...row, claimQty:qty})}>确认领工</Btn></>}
    >
      <div className="aw-doc-grid" style={{gridTemplateColumns:'1fr'}}>
        <Field label="可领取数量"><Input value={row?.canClaim || 0} readOnly /></Field>
        <Field label="本次领工数量" req><Input value={qty} onChange={e=>setQty(e.target.value)} placeholder="填写本次领取数量" /></Field>
      </div>
      <div style={{fontSize:12,color:'var(--aw-fg-3)',marginTop:10}}>确认后，该数量会进入你的报工责任范围，后续任务报工不得超过已领数量。</div>
    </Modal>
  );
}

function MfgDispatchRecordModal({ row, onClose }) {
  const claimRows = [
    ['三红','领工模式','40','20','20','2026-05-19 09:20','待报工'],
    ['李工','领工模式','40','40','0','2026-05-19 09:42','已完成'],
  ];
  const assignRows = [
    ['王工','派工模式','30','20','10','生产主管','2026-05-19 10:10','生产中'],
    ['陈工','派工模式','20','0','20','生产主管','2026-05-19 10:20','待报工'],
  ];
  const total = Number(row?.planQty || row?.assignQty || 0);
  const claimed = claimRows.reduce((sum, r)=>sum+(Number(r[2])||0),0);
  const assigned = assignRows.reduce((sum, r)=>sum+(Number(r[2])||0),0);
  const reported = claimRows.concat(assignRows).reduce((sum, r)=>sum+(Number(r[3])||0),0);
  return (
    <Modal title="领工派工明细" subtitle={row ? `${row.workNo} / ${row.process}` : ''} size="lg" onClose={onClose} footer={<Btn kind="primary" onClick={onClose}>关闭</Btn>}>
      <div className="aw-doc-grid" style={{marginBottom:14}}>
        <InfoGrid items={[
          {label:'计划总数', value:total || 120},
          {label:'已领数量', value:claimed},
          {label:'已派数量', value:assigned},
          {label:'已报工数量', value:reported},
          {label:'剩余未分配', value:Math.max(0, (total || 120) - claimed - assigned)},
          {label:'剩余待报工', value:Math.max(0, claimed + assigned - reported)},
        ]}/>
      </div>
      <PurchaseSection title="谁领了多少">
        <table className="aw-table"><thead><tr>{['序号','人员','方式','领取数量','已报工','待报工','领取时间','状态'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{claimRows.map((r,i)=><tr key={r[0]}><td>{i+1}</td>{r.map((c,idx)=><td key={idx}>{idx===6?<MfgTone status={c}/>:c}</td>)}</tr>)}</tbody></table>
      </PurchaseSection>
      <PurchaseSection title="派给谁多少">
        <table className="aw-table"><thead><tr>{['序号','人员','方式','派工数量','已报工','待报工','分派人','分派时间','状态'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{assignRows.map((r,i)=><tr key={r[0]}><td>{i+1}</td>{r.map((c,idx)=><td key={idx}>{idx===7?<MfgTone status={c}/>:c}</td>)}</tr>)}</tbody></table>
      </PurchaseSection>
    </Modal>
  );
}

function MfgDispatchActionView() {
  const [tab, setTab] = useMfgState('pool');
  const [claimRow, setClaimRow] = useMfgState(null);
  const [recordRow, setRecordRow] = useMfgState(null);
  const [claimed, setClaimed] = useMfgState([]);
  const poolRows = [
    { workNo:'WO-20260517001', product:'智能温控终端', process:'总装', planQty:120, claimedQty:40, canClaim:80, station:'总装工位01', start:'2026-05-19', status:'可领取' },
    { workNo:'WO-20260517002', product:'半成品模组', process:'焊接', planQty:300, claimedQty:180, canClaim:120, station:'焊接工位02', start:'2026-05-19', status:'部分领取' },
    { workNo:'WO-20260517004', product:'显示模组', process:'老化测试', planQty:160, claimedQty:0, canClaim:160, station:'老化房01', start:'2026-05-20', status:'可领取' },
  ];
  const assignedRows = [
    { workNo:'WO-20260517005', product:'铝合金外壳', process:'表面处理', assignTo:'三红', assignQty:80, reportedQty:20, leftQty:60, station:'委外跟进', assigner:'生产主管', status:'待报工' },
    { workNo:'WO-20260517006', product:'智能温控终端', process:'包装', assignTo:'三红', assignQty:120, reportedQty:80, leftQty:40, station:'包装区01', assigner:'王工', status:'生产中' },
    ...claimed.map(r => ({ workNo:r.workNo, product:r.product, process:r.process, assignTo:'当前用户', assignQty:r.claimQty, reportedQty:0, leftQty:r.claimQty, station:r.station, assigner:'自主领工', status:'待报工' })),
  ];
  const claim = row => setClaimRow(row);
  const confirmClaim = row => { setClaimed(prev => [...prev, row]); setClaimRow(null); setTab('assigned'); };
  return (
    <div className="aw-doc-main">
      <div className="aw-doc-title">领工派工 <span className="aw-doc-tree-n">(999)</span></div>
      <div className="aw-tabs" style={{marginBottom:12}}>
        <span className={'aw-tab '+(tab==='pool'?'on':'')} onClick={()=>setTab('pool')}>领工任务池</span>
        <span className={'aw-tab '+(tab==='assigned'?'on':'')} onClick={()=>setTab('assigned')}>派工列表</span>
      </div>
      <PurchaseListToolbar searchPlaceholder="全局搜索（如工单编号、产品名称、负责人...）" hideNew />
      <div className="aw-doc-tbl-wrap">
        <div className="aw-doc-tbl-inner">
          <table className="aw-doc-tbl" style={{whiteSpace:'nowrap'}}>
            {tab === 'pool' ? <>
              <thead><tr><PurchaseSelectHeader checked={false} onToggle={()=>{}}/><PurchaseIndexHeader />{['工单编号','产品名称','工序名称','计划数量','已领数量','可领数量','工位/产线','计划开工','任务状态','操作'].map(h=><th key={h}><div className="aw-th-inner">{h}</div></th>)}</tr></thead>
              <tbody>{poolRows.map((r,i)=><tr key={r.workNo}><td><span className={'aw-chk '+(i===0?'on':'')} /></td><td>{i+1}</td><td>{r.workNo}</td><td>{r.product}</td><td>{r.process}</td><td className="aw-num">{r.planQty}</td><td className="aw-num">{r.claimedQty}</td><td className="aw-num">{r.canClaim}</td><td>{r.station}</td><td>{r.start}</td><td><MfgTone status={r.status}/></td><td><span className="aw-link" onClick={()=>claim(r)}>领工</span><span style={{margin:'0 6px',color:'var(--aw-border-strong)'}}>/</span><span className="aw-link" onClick={()=>setRecordRow(r)}>查看</span></td></tr>)}</tbody>
            </> : <>
              <thead><tr><PurchaseSelectHeader checked={false} onToggle={()=>{}}/><PurchaseIndexHeader />{['工单编号','产品名称','工序名称','分派人员','分派数量','已报工','待报工','工位/产线','分派人','任务状态','操作'].map(h=><th key={h}><div className="aw-th-inner">{h}</div></th>)}</tr></thead>
              <tbody>{assignedRows.map((r,i)=><tr key={`${r.workNo}-${i}`}><td><span className={'aw-chk '+(i===0?'on':'')} /></td><td>{i+1}</td><td>{r.workNo}</td><td>{r.product}</td><td>{r.process}</td><td>{r.assignTo}</td><td className="aw-num">{r.assignQty}</td><td className="aw-num">{r.reportedQty}</td><td className="aw-num">{r.leftQty}</td><td>{r.station}</td><td>{r.assigner}</td><td><MfgTone status={r.status}/></td><td><span className="aw-link">报工</span><span style={{margin:'0 6px',color:'var(--aw-border-strong)'}}>/</span><span className="aw-link" onClick={()=>setRecordRow(r)}>查看</span></td></tr>)}</tbody>
            </>}
          </table>
        </div>
      </div>
      <PurchaseListFooter total={tab === 'pool' ? poolRows.length : assignedRows.length} selectedCount={1} pages={1} />
      {claimRow && <MfgClaimWorkModal row={claimRow} onClose={()=>setClaimRow(null)} onConfirm={confirmClaim} />}
      {recordRow && <MfgDispatchRecordModal row={recordRow} onClose={()=>setRecordRow(null)} />}
    </div>
  );
}

function MfgOutsourceRecordList({ type }) {
  const isSend = type === 'send';
  const title = isSend ? '委外发料列表' : '委外入库列表';
  const searchPlaceholder = isSend ? '全局搜索（如委外单号、物料名称、加工商...）' : '全局搜索（如入库单号、委外单号、产品名称...）';
  const columns = isSend
    ? ['委外单号','发料单号','加工商','物料编码','物料名称','BOM版本','源单需求数量','应发数量','本次发料','累计已发','欠发数量','出库仓库/库位','WMS出库单','发料时间','状态','操作']
    : ['委外单号','入库单号','加工商','产品编号','产品名称','BOM版本','委外数量','收货数量','质检合格','让步数量','不良数量','本次入库','累计入库','入库仓库/库位','WMS入库单','入库时间','状态','操作'];
  const rows = isSend ? [
    ['OS-20260517001','WF-20260517001','深圳协同加工厂','WL-8518691','铝合金外壳','BOM-V1.8','260','260','180','180','80','半成品仓-C02','CK-WW-20260517001','2026-05-20 15:30','部分发料','查看'],
    ['OS-20260517002','WF-20260517002','东莞精密制造厂','WL-5786931','显示模组','BOM-V2.1','300','300','300','300','0','原料仓-A02','CK-WW-20260517002','2026-05-21 10:12','已发料','查看'],
  ] : [
    ['OS-20260517001','RK-WW-20260517001','深圳协同加工厂','CP-2025010103','铝合金外壳','BOM-V1.8','260','260','252','0','8','180','180','半成品仓-D01','RK-WW-20260517001','2026-05-28 16:20','部分入库','查看'],
    ['OS-20260517002','RK-WW-20260517002','东莞精密制造厂','CP-2025010102','半成品模组','BOM-V2.1','300','300','300','0','0','300','300','半成品仓-B01','RK-WW-20260517002','2026-05-29 09:40','已入库','查看'],
  ];
  return (
    <div className="aw-doc-main">
      <div className="aw-doc-title">{title} <span className="aw-doc-tree-n">(999)</span></div>
      <PurchaseListToolbar searchPlaceholder={searchPlaceholder} hideNew />
      <div className="aw-doc-tbl-wrap">
        <div className="aw-doc-tbl-inner">
          <table className="aw-doc-tbl" style={{whiteSpace:'nowrap'}}>
            <thead><tr><PurchaseSelectHeader checked={false} onToggle={()=>{}}/><PurchaseIndexHeader />{columns.map(h=><th key={h}><div className="aw-th-inner">{h}</div></th>)}</tr></thead>
            <tbody>
              {rows.map((r, i)=>(
                <tr key={`${type}-${i}`}>
                  <td><span className={'aw-chk '+(i<1?'on':'')} /></td><td>{i + 1}</td>
                  {r.map((c, idx)=><td key={`${c}-${idx}`}>{idx === r.length - 1 ? <span className="aw-link">{c}</span> : ['已发料','已入库'].includes(c) ? <Badge tone="g">{c}</Badge> : ['部分发料','部分入库'].includes(c) ? <Badge tone="y">{c}</Badge> : c}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <PurchaseListFooter total={rows.length} selectedCount={1} pages={1} />
    </div>
  );
}

function MfgReportRecordModal({ row, onClose }) {
  const records = [
    ['BG-20260518001','第一次报工','三红','40','39','1','0','2026-05-18 10:20','已提交'],
    ['BG-20260518002','第二次报工','三红','30','30','0','0','2026-05-18 14:40','已提交'],
    ['BG-20260518003','第三次报工','三红','10','9','1','0','2026-05-18 17:10','待质检'],
  ];
  const total = records.reduce((sum, r)=>sum+(Number(r[3])||0),0);
  const good = records.reduce((sum, r)=>sum+(Number(r[4])||0),0);
  const bad = records.reduce((sum, r)=>sum+(Number(r[5])||0),0);
  return (
    <Modal title="工序报工明细" subtitle={row ? `${row.workNo} / ${row.process}` : ''} size="lg" onClose={onClose} footer={<Btn kind="primary" onClick={onClose}>关闭</Btn>}>
      <InfoGrid items={[
        {label:'工单编号', value:row?.workNo || '-'},
        {label:'工序名称', value:row?.process || '-'},
        {label:'累计报工', value:total},
        {label:'合格数量', value:good},
        {label:'不良数量', value:bad},
      ]}/>
      <div style={{height:14}} />
      <table className="aw-table">
        <thead><tr>{['序号','报工单号','报工批次','报工人','本次报工','合格','不良','返工','报工时间','状态'].map(h=><th key={h}>{h}</th>)}</tr></thead>
        <tbody>{records.map((r,i)=><tr key={r[0]}><td>{i+1}</td>{r.map((c,idx)=><td key={idx} className={idx>=3&&idx<=6?'aw-num':''}>{idx===8?<MfgTone status={c}/>:c}</td>)}</tr>)}</tbody>
      </table>
    </Modal>
  );
}

const MFG_REPORT_RELATED_GROUPS = {
  '总装产线': [
    { id:'P001', name:'三红', dept:'生产一部', line:'总装产线', role:'总装工' },
    { id:'P002', name:'李工', dept:'生产一部', line:'总装产线', role:'装配工' },
  ],
  '焊接班组': [
    { id:'P007', name:'周焊', dept:'焊接车间', line:'焊接班组', role:'焊接工' },
    { id:'P008', name:'林焊', dept:'焊接车间', line:'焊接班组', role:'焊接工' },
  ],
  '包装班组': [
    { id:'P009', name:'王包', dept:'包装车间', line:'包装班组', role:'包装工' },
    { id:'P010', name:'郑包', dept:'包装车间', line:'包装班组', role:'包装工' },
  ],
  '自由报工人员': [
    { id:'P006', name:'老夏', dept:'生产中心', line:'自由报工', role:'生产主管' },
    { id:'P004', name:'陈工', dept:'装配车间', line:'自由报工', role:'调试工' },
  ],
};

function MfgReportPersonPickerModal({ onClose, onConfirm }) {
  const groupNames = Object.keys(MFG_REPORT_RELATED_GROUPS);
  const [group, setGroup] = useMfgState(groupNames[0]);
  const [picked, setPicked] = useMfgState(null);
  const people = MFG_REPORT_RELATED_GROUPS[group] || [];
  return (
    <Modal title="选择报工人员" subtitle="仅显示当前工序相关的车间、产线、班组人员" size="picker" onClose={onClose} footer={<><Btn onClick={onClose}>取消</Btn><Btn kind="primary" onClick={()=>picked && onConfirm(picked)}>确定</Btn></>}>
      <div style={{display:'grid',gridTemplateColumns:'220px 1fr',height:430}}>
        <div style={{borderRight:'1px solid var(--aw-border)',background:'var(--aw-surface-2)',padding:'10px 0'}}>
          <div style={{fontSize:13,fontWeight:600,padding:'0 14px 10px'}}>相关组织</div>
          {groupNames.map((g, idx)=>(
            <div key={g} className={'aw-tree-row aw-tree-l2 '+(group===g?'on':'')} onClick={()=>{setGroup(g); setPicked(null);}}>
              <span className="aw-tree-caret">{idx < 3 ? '▾' : ''}</span><TileIcon name={idx < 3 ? 'folder' : 'user'} size={14}/><span>{g}</span>
            </div>
          ))}
        </div>
        <div style={{display:'flex',flexDirection:'column',overflow:'hidden'}}>
          <div style={{padding:'10px 12px',borderBottom:'1px solid var(--aw-border)',display:'flex',gap:10,alignItems:'center'}}>
            <Input placeholder="搜索相关报工人员" style={{maxWidth:260}} />
            <span style={{fontSize:12,color:'var(--aw-fg-3)'}}>当前分组 {people.length} 人</span>
          </div>
          <div style={{overflow:'auto'}}>
            <table className="aw-table">
              <thead><tr>{['选择','姓名','工号','部门','产线/班组','岗位'].map(h=><th key={h}>{h}</th>)}</tr></thead>
              <tbody>{people.map(p=>(
                <tr key={p.id} style={picked?.id===p.id?{background:'var(--aw-primary-soft)'}:undefined} onClick={()=>setPicked(p)}>
                  <td><span className={'aw-chk '+(picked?.id===p.id?'on':'')} /></td><td>{p.name}</td><td>{p.id}</td><td>{p.dept}</td><td>{p.line}</td><td>{p.role}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function MfgReportRecordList() {
  const [role, setRole] = useMfgState('worker');
  const [detail, setDetail] = useMfgState(null);
  const [personPicker, setPersonPicker] = useMfgState(false);
  const [pickedPerson, setPickedPerson] = useMfgState('');
  const rows = [
    { workNo:'WO-20260517001', product:'智能温控终端', process:'总装', dept:'生产一部', person:'三红', source:'领工派工', planQty:120, allowQty:80, reportedQty:80, goodQty:78, badQty:2, count:3, lastTime:'2026-05-18 17:10', status:'待质检' },
    { workNo:'WO-20260517002', product:'半成品模组', process:'焊接', dept:'焊接班组', person:'三红', source:'自由模式', planQty:300, allowQty:'-', reportedQty:120, goodQty:118, badQty:2, count:2, lastTime:'2026-05-18 16:20', status:'生产中' },
    { workNo:'WO-20260517003', product:'铝合金外壳', process:'表面处理', dept:'委外管理组', person:'李工', source:'派工模式', planQty:260, allowQty:80, reportedQty:20, goodQty:20, badQty:0, count:1, lastTime:'2026-05-18 15:30', status:'待报工' },
  ];
  const visibleRows = role === 'worker' ? rows.filter(r => r.person === '三红') : rows;
  const quickDay = day => day === 'today' ? ['2026-05-18','2026-05-18'] : ['2026-05-17','2026-05-17'];
  const [start, setStart] = useMfgState('2026-05-18');
  const [end, setEnd] = useMfgState('2026-05-18');
  const setDay = day => { const [s,e] = quickDay(day); setStart(s); setEnd(e); };
  const filterControls = <>
    {role === 'admin' && <>
      <Btn style={{height:30,padding:'0 10px'}} onClick={()=>setPersonPicker(true)}>{pickedPerson || '选择人员'}</Btn>
    </>}
    <Input style={{width:118}} value={start} onChange={e=>setStart(e.target.value)} placeholder="开始时间" />
    <span style={{color:'var(--aw-fg-3)'}}>至</span>
    <Input style={{width:118}} value={end} onChange={e=>setEnd(e.target.value)} placeholder="结束时间" />
    <Btn style={{height:30,padding:'0 10px'}} onClick={()=>setDay('yesterday')}>昨天</Btn>
    <Btn style={{height:30,padding:'0 10px'}} onClick={()=>setDay('today')}>今天</Btn>
  </>;
  return (
    <div className="aw-doc-main">
      <div className="aw-doc-title">报工记录 <span className="aw-doc-tree-n">(999)</span></div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
        <div className="aw-tabs">
          <span className={'aw-tab '+(role==='worker'?'on':'')} onClick={()=>setRole('worker')}>我的报工</span>
          <span className={'aw-tab '+(role==='admin'?'on':'')} onClick={()=>setRole('admin')}>管理员视图</span>
        </div>
      </div>
      <PurchaseListToolbar searchPlaceholder="全局搜索（如工单编号、产品名称、工序名称、报工人...）" hideNew afterSearch={filterControls} />
      <div className="aw-doc-tbl-wrap">
        <div className="aw-doc-tbl-inner">
          <table className="aw-doc-tbl" style={{whiteSpace:'nowrap'}}>
            <thead><tr><PurchaseSelectHeader checked={false} onToggle={()=>{}}/><PurchaseIndexHeader />{['工单编号','产品名称','工序名称','生产部门','报工人','报工来源','计划数量','可报数量','累计报工','合格','不良','报工次数','最后报工时间','状态','操作'].map(h=><th key={h}><div className="aw-th-inner">{h}</div></th>)}</tr></thead>
            <tbody>{visibleRows.map((r,i)=><tr key={`${r.workNo}-${r.process}`}><td><span className={'aw-chk '+(i===0?'on':'')} /></td><td>{i+1}</td><td>{r.workNo}</td><td>{r.product}</td><td>{r.process}</td><td>{r.dept}</td><td>{r.person}</td><td>{r.source}</td><td className="aw-num">{r.planQty}</td><td className="aw-num">{r.allowQty}</td><td className="aw-num">{r.reportedQty}</td><td className="aw-num">{r.goodQty}</td><td className="aw-num">{r.badQty}</td><td className="aw-num">{r.count}</td><td>{r.lastTime}</td><td><MfgTone status={r.status}/></td><td><span className="aw-link" onClick={()=>setDetail(r)}>查看</span></td></tr>)}</tbody>
          </table>
        </div>
      </div>
      <PurchaseListFooter total={visibleRows.length} selectedCount={1} pages={1} />
      {detail && <MfgReportRecordModal row={detail} onClose={()=>setDetail(null)} />}
      {personPicker && <MfgReportPersonPickerModal onClose={()=>setPersonPicker(false)} onConfirm={person=>{ setPickedPerson(person?.name || '全部人员'); setPersonPicker(false); }} />}
    </div>
  );
}

function MfgReportActionView({ onBack }) {
  const [toast, setToast] = useMfgState(null);
  const [sourceMode, setSourceMode] = useMfgState('领工派工');
  const submit = () => setToast({ type:'ok', text:'报工提交成功，已生成待质检记录' });
  const isFree = sourceMode === '自由模式';
  return (
    <PurchaseFormPage className="aw-mfg-detail-scope aw-mfg-action-page" onBack={onBack} submitText="提交报工">
      {toast && <div style={{position:'fixed',right:28,top:76,zIndex:80,padding:'10px 14px',borderRadius:6,background:'#DBF3E6',color:'#1F7A4E',boxShadow:'0 8px 24px rgba(16,24,40,.12)'}}>{toast.text}</div>}
      <PurchaseSection title="报工信息">
        <FormGrid>
          <Field label="生产工单" req><Input defaultValue="WO-20260517001 总装工序生产工单" /></Field>
          <Field label="报工来源"><Select value={sourceMode} onChange={e=>setSourceMode(e.target.value)}><option>领工派工</option><option>自由模式</option></Select></Field>
          <Field label="报工工序" req><Input value={isFree ? '按权限自由选择工序' : '总装'} readOnly /></Field>
          <Field label="报工人" req><Input defaultValue="三红" /></Field>
          <Field label="报工数量" req><Input placeholder="填写本次报工数量" defaultValue="80" /></Field>
          <Field label="合格数量" req><Input placeholder="填写合格数量" defaultValue="78" /></Field>
          <Field label="不良数量"><Input placeholder="自动计算或手动填写" defaultValue="2" /></Field>
          <Field label="工位/产线"><Input value={isFree ? '按人员权限自动匹配' : '总装工位01'} readOnly /></Field>
          <Field label="报工时间"><Input defaultValue="2026-05-20 17:30" /></Field>
        </FormGrid>
      </PurchaseSection>
      <PurchaseSection title="本工单进度">
        <div style={{fontSize:12,color:'var(--aw-fg-3)',marginBottom:10}}>
          当前来源：{isFree ? '自由模式，人员可按权限直接报工，不受领工/派工数量限制。' : '领工派工，报工数量受已领数量或派工数量约束。'}
        </div>
        <table className="aw-table">
          <thead><tr>{['序号','产品','工序','来源方式','责任人员','计划数量','已领/已派','已报工','本次报工','累计完成','剩余可报','状态'].map(h=><th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            <tr><td>1</td><td>智能温控终端</td><td>{isFree ? '自由报工' : '总装'}</td><td>{sourceMode}</td><td>{isFree ? '当前报工人' : '三红'}</td><td className="aw-num">120</td><td className="aw-num">{isFree ? '-' : 80}</td><td className="aw-num">0</td><td className="aw-num">80</td><td className="aw-num">80</td><td className="aw-num">{isFree ? 40 : 0}</td><td><MfgTone status="生产中"/></td></tr>
          </tbody>
        </table>
      </PurchaseSection>
      <PurchaseSection title="报工说明"><PurchaseRichText placeholder="填写异常说明、不良原因、设备状态、交接事项等" /></PurchaseSection>
      <div style={{display:'flex',justifyContent:'center',gap:10,marginTop:16}}><Btn onClick={onBack}>关闭</Btn><Btn>暂存</Btn><Btn kind="primary" onClick={submit}>确定</Btn></div>
    </PurchaseFormPage>
  );
}

function MfgModuleScreen({ moduleKey, initialAction, onActionConsumed }) {
  if (moduleKey === 'mfgSchedule') return <MfgScheduleScreen initialAction={initialAction} onActionConsumed={onActionConsumed} />;
  const config = MFG_CONFIG[moduleKey] || MFG_CONFIG.mfgPlan;
  const [view, setView] = useMfgState('list');
  const [detail, setDetail] = useMfgState(config.row);
  const [action, setAction] = useMfgState('');
  useMfgEffect(() => { setView('list'); setDetail(config.row); setAction(''); }, [moduleKey]);
  useMfgEffect(() => {
    if (!initialAction) return;
    if (initialAction === 'new' || initialAction.startsWith('新增') || initialAction.startsWith('编制')) setView('new');
    else if (initialAction.includes('列表') || initialAction.includes('明细') || initialAction.includes('任务报工')) { setAction(initialAction); setView(initialAction.includes('列表') ? 'list' : 'action'); }
    else { setAction(initialAction); setView('action'); }
    onActionConsumed && onActionConsumed();
  }, [initialAction]);
  if (view === 'new') return <MfgFormView config={config} moduleKey={moduleKey} onBack={() => setView('list')} />;
  if (view === 'detail') return <MfgDetailView config={config} row={detail} moduleKey={moduleKey} onBack={() => setView('list')} />;
  if (view === 'action') return <MfgActionView config={config} action={action} onBack={() => setView('list')} />;
  return <MfgListView config={config} moduleKey={moduleKey} onNew={() => setView('new')} onDetail={row => { setDetail(row); setView('detail'); }} />;
}

Object.assign(window, { MfgModuleScreen });
