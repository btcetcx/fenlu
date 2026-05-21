// ui_kits/erp-console/craft-new-screen.jsx
// 新增工艺 —— 专业工艺编辑器
// 支持：自制 / 委外工序颜色区分；串序 / 并序排列；拖拽排序；点击查看 & 编辑参数

const { useState: useCf, useRef: useCfRef } = React;
const { Card, Btn, Field, Input, Select } = window;
const PIcon = window.PIcon || function PIcon({ name, size = 12 }) {
  const map = { search: '⌕' };
  return <span aria-hidden="true" style={{ fontSize: size, lineHeight: 1 }}>{map[name] || '•'}</span>;
};

/* ============================================================
   工序模板（左侧抽屉来源）
   ============================================================ */
const OP_TEMPLATES = [
  // 加工类（自制）
  { tk:'cut',    name:'切割',        type:'in',  cat:'加工', ic:'✂',  setup:15, run:8,  labor:1 },
  { tk:'drill',  name:'钻孔',        type:'in',  cat:'加工', ic:'⊙', setup:10, run:5,  labor:1 },
  { tk:'turn',   name:'车削',        type:'in',  cat:'加工', ic:'⟲', setup:20, run:12, labor:1 },
  { tk:'mill',   name:'铣削',        type:'in',  cat:'加工', ic:'▤', setup:25, run:18, labor:1 },
  { tk:'grind',  name:'磨削',        type:'in',  cat:'加工', ic:'≋',  setup:15, run:10, labor:1 },
  { tk:'punch',  name:'冲压',        type:'in',  cat:'加工', ic:'▼', setup:20, run:3,  labor:1 },
  // 装配类（自制）
  { tk:'asm',    name:'组装',        type:'in',  cat:'装配', ic:'⚙', setup:10, run:20, labor:2 },
  { tk:'press',  name:'压装',        type:'in',  cat:'装配', ic:'⇩', setup:10, run:6,  labor:1 },
  { tk:'tune',   name:'调试',        type:'in',  cat:'装配', ic:'≡', setup:5,  run:15, labor:1 },
  // 表面处理（自制）
  { tk:'spray',  name:'喷涂',        type:'in',  cat:'表面', ic:'❋', setup:25, run:12, labor:1 },
  { tk:'polish', name:'抛光',        type:'in',  cat:'表面', ic:'◍', setup:5,  run:8,  labor:1 },
  { tk:'clean',  name:'清洗',        type:'in',  cat:'表面', ic:'⩒', setup:5,  run:6,  labor:1 },
  // 检验
  { tk:'iqc',    name:'来料检验',    type:'in',  cat:'检验', ic:'⊙', setup:0,  run:4,  labor:1 },
  { tk:'ipqc',   name:'过程检验',    type:'in',  cat:'检验', ic:'◎', setup:0,  run:3,  labor:1 },
  { tk:'oqc',    name:'出货检验',    type:'in',  cat:'检验', ic:'✓', setup:0,  run:5,  labor:1 },
  // 包装
  { tk:'pack',   name:'包装',        type:'in',  cat:'包装', ic:'▣', setup:5,  run:5,  labor:1 },
  // 委外
  { tk:'ht',     name:'委外热处理',  type:'out', cat:'委外', ic:'🔥', setup:0,  run:480,labor:0 },
  { tk:'plate',  name:'委外电镀',    type:'out', cat:'委外', ic:'✦',  setup:0,  run:360,labor:0 },
  { tk:'print',  name:'委外印刷',    type:'out', cat:'委外', ic:'🖨', setup:0,  run:240,labor:0 },
  { tk:'laser',  name:'委外激光切割',type:'out', cat:'委外', ic:'⚡', setup:0,  run:120,labor:0 },
];

const PALETTE_GROUPS_IN  = ['加工','装配','表面','检验','包装'];
const PALETTE_GROUPS_OUT = ['委外'];

let opIdSeq = 100;
const newOpFromTemplate = (tpl) => ({
  id: 'op-' + (++opIdSeq),
  code: 'OP' + (1000 + opIdSeq).toString(),
  name: tpl.name,
  type: tpl.type,
  cat: tpl.cat,
  ic: tpl.ic,
  workCenter: tpl.type === 'in' ? '一车间' : '',
  equipment: tpl.type === 'in' ? (tpl.cat==='加工'?'CNC-01':'装配台 A') : '',
  supplier: tpl.type === 'out' ? '南海五金加工厂' : '',
  setupTime: tpl.setup,
  runTime: tpl.run,
  queueTime: tpl.type==='out' ? 1440 : 30,
  laborCount: tpl.labor,
  costRate: tpl.type === 'out' ? 8.5 : 1.2,
  qcRequired: tpl.cat === '检验' || tpl.cat === '装配',
  qcPlan: tpl.cat === '检验' ? '首件 + 巡检' : '随机抽检',
  sopCode: 'SOP-' + (Math.floor(Math.random()*900)+100),
  remark: '',
});

/* ============================================================
   默认 / 示范工艺数据
   ============================================================ */
const initStages = () => {
  const seq = (tk) => ({ id:'st-'+(++opIdSeq), kind:'seq', ops:[newOpFromTemplate(OP_TEMPLATES.find(t=>t.tk===tk))] });
  const par = (...tks) => ({ id:'st-'+(++opIdSeq), kind:'par', ops: tks.map(tk=>newOpFromTemplate(OP_TEMPLATES.find(t=>t.tk===tk))) });
  return [
    seq('iqc'),
    par('cut','drill','turn'),
    seq('asm'),
    par('ht','polish'),
    seq('tune'),
    seq('oqc'),
    seq('pack'),
  ];
};

const CRAFT_DETAIL_TEXT = `本工艺适用于智能温控锅 AW-H8 整机制造，覆盖来料检验、关键零件加工、整机装配、委外热处理、功能调试、出货检验与包装入库全过程。

工艺路线采用串序与并序结合的组织方式：加工段支持切割、钻孔、车削并行处理，表面处理段支持委外热处理与本厂抛光同步推进；系统按并序节点最大时长计算工艺总时长。关键质量控制点包括来料检验、装配首件确认、功能全检和 OQC 全检。

执行时需优先使用已维护的工作中心、设备、SOP、检验方案和物料消耗标准。若出现尺寸超差、装配异常或功能测试不通过，应按质检策略进入返修或隔离流程，并记录异常原因、责任工序和复检结果。`;

function CraftRichTextEditor({ defaultValue = CRAFT_DETAIL_TEXT }) {
  return (
    <div style={{border:'1px solid var(--aw-border)',borderRadius:8,overflow:'hidden',background:'#fff'}}>
      <div style={{display:'flex',alignItems:'center',gap:6,padding:'8px 10px',borderBottom:'1px solid var(--aw-divider)',background:'var(--aw-surface-2)',fontSize:12,color:'var(--aw-fg-2)'}}>
        {['B','I','U','H1','H2','•','1.','链接','图片','表格'].map(item => (
          <span key={item} style={{minWidth:26,height:24,padding:'0 8px',border:'1px solid var(--aw-border)',borderRadius:5,background:'#fff',display:'inline-flex',alignItems:'center',justifyContent:'center',fontWeight:item==='B'?700:400,fontStyle:item==='I'?'italic':'normal',textDecoration:item==='U'?'underline':'none'}}>{item}</span>
        ))}
      </div>
      <div
        contentEditable
        suppressContentEditableWarning
        style={{minHeight:168,padding:'14px 16px',fontSize:13,lineHeight:1.8,color:'var(--aw-fg-1)',whiteSpace:'pre-wrap',outline:'none'}}
      >
        {defaultValue}
      </div>
    </div>
  );
}

/* ============================================================
   主组件
   ============================================================ */
function CraftNewScreen({ onBack }) {
  const [stages, setStages] = useCf([]);
  const [selOpId, setSelOpId] = useCf(null); // 默认未选中 —— 只有点击工序后才显示属性面板
  const [routeModalOpen, setRouteModalOpen] = useCf(false);
  const [paletteTab, setPaletteTab] = useCf('in');         // in / out
  const [paletteQ, setPaletteQ] = useCf('');

  // 拖动状态
  const drag = useCfRef({ kind:null, payload:null }); // kind: 'palette' | 'op'
  const [dragOver, setDragOver] = useCf(null);          // {stageId, dropAs} | 'end'

  // 选中工序对象
  const selOp = (() => {
    for (const st of stages) {
      for (const op of st.ops) if (op.id === selOpId) return { stage: st, op };
    }
    return null;
  })();

  /* —— 操作函数 —— */
  const updateOp = (opId, patch) => {
    setStages(sts => sts.map(st => ({
      ...st,
      ops: st.ops.map(o => o.id === opId ? {...o, ...patch} : o)
    })));
  };
  const removeOp = (opId) => {
    setStages(sts => {
      const next = sts.map(st => ({...st, ops: st.ops.filter(o => o.id !== opId)})).filter(st => st.ops.length > 0);
      return next;
    });
    if (selOpId === opId) setSelOpId(null);
  };
  const toggleStageKind = (stageId) => {
    setStages(sts => sts.map(st => st.id === stageId
      ? {...st, kind: st.kind === 'seq' ? 'par' : 'seq'}
      : st));
  };
  const insertStageAt = (idx, op) => {
    const st = { id:'st-'+(++opIdSeq), kind:'seq', ops:[op] };
    setStages(sts => { const n=[...sts]; n.splice(idx,0,st); return n; });
    setSelOpId(op.id);
  };
  const addOpToParStage = (stageId, op) => {
    setStages(sts => sts.map(st => st.id === stageId
      ? {...st, kind:'par', ops:[...st.ops, op]}
      : st));
    setSelOpId(op.id);
  };
  const convertToParAndAdd = (stageId) => {
    // 将该 seq stage 转为 par，并添加一个空白模板（默认"过程检验"）
    const tpl = OP_TEMPLATES.find(t=>t.tk==='ipqc');
    const newOp = newOpFromTemplate(tpl);
    setStages(sts => sts.map(st => st.id === stageId
      ? {...st, kind:'par', ops:[...st.ops, newOp]}
      : st));
    setSelOpId(newOp.id);
  };
  const moveStage = (stageId, dir) => {
    setStages(sts => {
      const i = sts.findIndex(s => s.id === stageId);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= sts.length) return sts;
      const n = [...sts]; const tmp = n[i]; n[i] = n[j]; n[j] = tmp; return n;
    });
  };

  /* —— 汇总指标 —— */
  const stats = (() => {
    let inOps = 0, outOps = 0, totalMin = 0, totalCost = 0, laborMin = 0;
    stages.forEach(st => {
      // 串序：累加工序时间；并序：取最大值
      const stTimes = st.ops.map(o => o.setupTime + o.runTime);
      const stMax = stTimes.length ? Math.max(...stTimes) : 0;
      totalMin += stMax;
      st.ops.forEach(o => {
        if (o.type === 'in') inOps++; else outOps++;
        totalCost += (o.setupTime + o.runTime) * o.costRate;
        laborMin  += (o.setupTime + o.runTime) * o.laborCount;
      });
    });
    return { inOps, outOps, totalMin, totalCost: totalCost.toFixed(0), laborMin, stages: stages.length };
  })();

  /* —— 拖拽处理 —— */
  const onPaletteDragStart = (tpl) => (e) => {
    drag.current = { kind:'palette', payload: tpl };
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', tpl.tk);
  };
  const onCanvasDrop = (target) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(null);
    const d = drag.current;
    if (!d || !d.kind) return;
    let newOp;
    if (d.kind === 'palette') newOp = newOpFromTemplate(d.payload);
    else if (d.kind === 'op') {
      // 从已有工序拖动 — 移动（先删后插）
      const opId = d.payload.id;
      // 找到并删除
      let removed;
      const cleared = stages.map(st => {
        const ops = st.ops.filter(o => {
          if (o.id === opId) { removed = o; return false; }
          return true;
        });
        return {...st, ops};
      }).filter(st => st.ops.length > 0);
      if (!removed) return;
      newOp = removed;
      if (target === 'end') {
        cleared.push({ id:'st-'+(++opIdSeq), kind:'seq', ops:[newOp] });
      } else if (target.dropAs === 'before' || target.dropAs === 'after') {
        const idx = cleared.findIndex(s => s.id === target.stageId);
        const ins = idx + (target.dropAs === 'after' ? 1 : 0);
        cleared.splice(ins, 0, { id:'st-'+(++opIdSeq), kind:'seq', ops:[newOp] });
      } else if (target.dropAs === 'inPar') {
        cleared.forEach(s => { if (s.id === target.stageId) { s.kind = 'par'; s.ops.push(newOp); } });
      }
      setStages(cleared);
      setSelOpId(newOp.id);
      drag.current = { kind:null };
      return;
    }
    if (target === 'end') {
      insertStageAt(stages.length, newOp);
    } else if (target.dropAs === 'before' || target.dropAs === 'after') {
      const idx = stages.findIndex(s => s.id === target.stageId);
      insertStageAt(idx + (target.dropAs==='after'?1:0), newOp);
    } else if (target.dropAs === 'inPar') {
      addOpToParStage(target.stageId, newOp);
    }
    drag.current = { kind:null };
  };
  const onConnectorDragOver = (target) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = drag.current.kind === 'op' ? 'move' : 'copy';
    }
    setDragOver(target);
  };
  const onOpDragStart = (op) => (e) => {
    drag.current = { kind:'op', payload: op };
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', op.id);
  };

  /* —— 模板筛选 —— */
  const filteredTpls = OP_TEMPLATES.filter(t => {
    if (paletteTab === 'in' && t.type !== 'in') return false;
    if (paletteTab === 'out' && t.type !== 'out') return false;
    if (paletteQ && !t.name.includes(paletteQ) && !t.cat.includes(paletteQ)) return false;
    return true;
  });

  const groupedTpls = (paletteTab === 'in' ? PALETTE_GROUPS_IN : PALETTE_GROUPS_OUT).map(g => ({
    g, list: filteredTpls.filter(t => t.cat === g)
  })).filter(grp => grp.list.length > 0);
  const lastStage = stages[stages.length - 1];
  const endDropTarget = lastStage ? { stageId: lastStage.id, dropAs: 'after' } : 'end';
  const isEndDropOver = lastStage
    ? dragOver && dragOver.stageId === lastStage.id && dragOver.dropAs === 'after'
    : dragOver === 'end';

  return (
    <div className="aw-doc-form" style={{height:'auto'}}>
      <div className="aw-doc-form-head">
        <span className="aw-link" onClick={onBack}>← 返回工艺列表</span>
        <span style={{flex:1}}/>
        <Btn onClick={onBack}>取消</Btn>
        <Btn>暂存草稿</Btn>
        <Btn>预览路由</Btn>
        <Btn kind="primary">提交审批</Btn>
      </div>

      <div className="aw-doc-form-body" style={{padding:18}}>
        {/* 基础信息 */}
        <Card title="工艺基础信息">
          <div className="cf-base-grid">
            <Field label="工艺编号"><Input defaultValue="GY-2026-018" disabled/></Field>
            <Field label="工艺名称" req><Input defaultValue="智能控制器整机制造工艺"/></Field>
            <Field label="适用产品" req><Select defaultValue=""><option value="">请选择</option><option>智能控制器 A 型</option><option>智能控制器 B 型</option></Select></Field>
            <Field label="版本号"><Input defaultValue="V 1.0"/></Field>
            <Field label="工艺分类"><Select defaultValue=""><option>电子装配</option><option>机加工</option><option>焊接</option></Select></Field>
            <Field label="编制人"><Input defaultValue="李文涛 / 工艺组"/></Field>
            <Field label="生效日期"><Input defaultValue="2026-06-01"/></Field>
            <Field label="审批流程"><Select><option>默认审批流</option><option>简化审批</option></Select></Field>
          </div>
        </Card>

        {/* 汇总条 */}
        <div className="cf-summary" style={{marginTop:14}}>
          <div className="cf-summary-card"><div className="l">工序总数</div><div className="n">{stats.inOps + stats.outOps}<span className="u">道</span></div></div>
          <div className="cf-summary-card in"><div className="l">自制工序</div><div className="n">{stats.inOps}<span className="u">道</span></div></div>
          <div className="cf-summary-card out"><div className="l">委外工序</div><div className="n">{stats.outOps}<span className="u">道</span></div></div>
          <div className="cf-summary-card"><div className="l">工艺总时长 <span style={{color:'var(--aw-fg-4)'}}>(并序取最大)</span></div><div className="n">{(stats.totalMin/60).toFixed(1)}<span className="u">h</span></div></div>
          <div className="cf-summary-card"><div className="l">人工总工时</div><div className="n">{(stats.laborMin/60).toFixed(1)}<span className="u">h</span></div></div>
          <div className="cf-summary-card"><div className="l">单件成本</div><div className="n">¥ {stats.totalCost}</div></div>
        </div>

        <div className="cf-route-entry">
          <button className="cf-add-route-btn" onClick={()=>setRouteModalOpen(true)}>+ 添加工序</button>
          {stages.length > 0 ? (
            <div className="cf-route-brief">
              <span>已添加 {stats.inOps + stats.outOps} 道工序</span>
              <span>自制 {stats.inOps} 道</span>
              <span>委外 {stats.outOps} 道</span>
              <span>预计工艺时长 {(stats.totalMin/60).toFixed(1)} h</span>
              <button className="cf-route-edit-btn" onClick={()=>setRouteModalOpen(true)}>编辑工序</button>
            </div>
          ) : (
            <div className="cf-route-empty">当前未添加工序，点击“添加工序”进行配置。</div>
          )}
        </div>

        <Card title="工艺详情">
          <CraftRichTextEditor />
        </Card>

        {routeModalOpen && (
          <div className="cf-route-modal-mask">
            <div className="cf-route-modal">
              <div className="cf-route-modal-head">
                <div>
                  <strong>添加工序</strong>
                  <span>从左侧选择工序模板，拖入或点击加入画布后配置参数。</span>
                </div>
                <button onClick={()=>setRouteModalOpen(false)}>×</button>
              </div>
              <div className="cf-route-modal-body">
                <div className="cf-editor cf-editor-in-modal">
            {/* ===== 左：工序模板 ===== */}
            <div className="cf-palette">
              <div className="cf-palette-h">
                工序模板 <span className="tag">拖拽到画布</span>
              </div>
              <div className="cf-palette-search">
                <div className="box">
                  <PIcon name="search" size={11}/>
                  <input placeholder="搜索工序" value={paletteQ} onChange={e=>setPaletteQ(e.target.value)}/>
                </div>
              </div>
              <div className="cf-palette-tabs">
                <span className={paletteTab==='in'?'on':''} onClick={()=>setPaletteTab('in')}>自制 ({OP_TEMPLATES.filter(t=>t.type==='in').length})</span>
                <span className={paletteTab==='out'?'on':''} onClick={()=>setPaletteTab('out')}>委外 ({OP_TEMPLATES.filter(t=>t.type==='out').length})</span>
              </div>
              <div className="cf-palette-list">
                {groupedTpls.map(({g, list}) => (
                  <div key={g} className="cf-pgroup">
                    <div className="cf-pgroup-h">{g} <span className="n">{list.length}</span></div>
                    {list.map(t => (
                      <div key={t.tk} className="cf-pcard" draggable onDragStart={onPaletteDragStart(t)} onClick={()=>insertStageAt(stages.length, newOpFromTemplate(t))}>
                        <div className={'ic ' + (t.type==='in'?'in':'out')}>{t.ic}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div className="nm">{t.name}</div>
                          <div className="sub">{t.cat} · {t.setup + t.run} 分钟</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                {groupedTpls.length === 0 && (
                  <div style={{padding:'30px 10px',textAlign:'center',color:'var(--aw-fg-4)',fontSize:12}}>没有匹配的工序模板</div>
                )}
              </div>
            </div>

            {/* ===== 中：画布 ===== */}
            <div className="cf-canvas">
              <div className="cf-cv-bar">
                <span className="legend">
                  <span className="lg"><span className="sw in"/> 自制</span>
                  <span className="lg"><span className="sw out"/> 委外</span>
                  <span className="lg"><span style={{display:'inline-block',width:24,height:2,background:'#5677FC',borderRadius:1}}/> 串序</span>
                  <span className="lg"><span style={{display:'inline-block',width:24,height:8,background:'#fff',border:'1.5px dashed #10B981',borderRadius:2}}/> 并序</span>
                </span>
                <div className="zoom">
                  <span>−</span><span>100%</span><span>+</span><span>⊞ 适配</span>
                </div>
              </div>

              <div className="cf-flow">
                {stages.length > 0 && (
                  <div className="cf-conn start">
                    <span className="start-dot" />
                    <span className="start-badge">开始</span>
                    <div className="hline" />
                  </div>
                )}
                {stages.map((st, i) => (
                  <React.Fragment key={st.id}>
                    <StageView
                      stage={st}
                      index={i}
                      selOpId={selOpId}
                      onSelectOp={setSelOpId}
                      onRemoveOp={removeOp}
                      onOpDragStart={onOpDragStart}
                      onToggleKind={()=>toggleStageKind(st.id)}
                      onMakePar={()=>convertToParAndAdd(st.id)}
                      onMove={(dir)=>moveStage(st.id, dir)}
                      dragOver={dragOver}
                      setDragOver={setDragOver}
                      onDrop={onCanvasDrop({ stageId: st.id, dropAs: 'inPar' })}
                    />
                    {(() => {
                      const afterTarget = {stageId:st.id, dropAs:'after'};
                      const isAfterOver = dragOver && dragOver.stageId===st.id && dragOver.dropAs==='after';
                      return (
                    <div className={'cf-conn' + (i === stages.length - 1 ? ' end' : '') + (isAfterOver ? ' drop-over' : '')}
                      onDragEnter={onConnectorDragOver(afterTarget)}
                      onDragOver={onConnectorDragOver(afterTarget)}
                      onDragLeave={()=>setDragOver(null)}
                      onDrop={onCanvasDrop(afterTarget)}>
                      <div className="hline" style={{height:isAfterOver ? 4 : 2, background: isAfterOver ? '#10B981' : '#5677FC'}}/>
                      <div className="arrow" title="在此处插入工序">＋</div>
                    </div>
                      );
                    })()}
                  </React.Fragment>
                ))}
                <div className={'cf-add-stage' + (stages.length > 0 ? ' end-only' : '') + (isEndDropOver?' drag-over':'')}
                  onDragEnter={onConnectorDragOver(endDropTarget)}
                  onDragOver={onConnectorDragOver(endDropTarget)}
                  onDragLeave={()=>setDragOver(null)}
                  onDrop={onCanvasDrop(endDropTarget)}>
                  {stages.length > 0 ? (
                    <span>拖入新工序</span>
                  ) : (
                    <>
                      <div className="pl">＋</div>
                      <span>拖入新工序</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ===== 右：属性面板（只有选中工序时才展开） ===== */}
            {selOp && (
              <div className="cf-props">
                <PropertiesPanel
                  op={selOp.op}
                  stage={selOp.stage}
                  onChange={(patch)=>updateOp(selOp.op.id, patch)}
                  onChangeStage={(patch)=>setStages(sts=>sts.map(s=>s.id===selOp.stage.id?{...s,...patch}:s))}
                  onRemove={()=>removeOp(selOp.op.id)}
                  onClose={()=>setSelOpId(null)}
                />
              </div>
            )}
                </div>
              </div>
              <div className="cf-route-modal-foot">
                <Btn onClick={()=>setRouteModalOpen(false)}>取消</Btn>
                <Btn kind="primary" onClick={()=>setRouteModalOpen(false)}>确认</Btn>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   Stage 视图（一个串序节点 或 一个并序组）
   ============================================================ */
function StageView({ stage, index, selOpId, onSelectOp, onRemoveOp, onOpDragStart, onToggleKind, onMakePar, onMove, dragOver, setDragOver, onDrop }) {
  if (stage.kind === 'seq') {
    const op = stage.ops[0];
    return (
      <div className="cf-stage cf-stage-seq">
        <div style={{position:'relative'}}>
          <span className="cf-stage-no">{index+1}</span>
          <OpCard op={op} selected={op.id===selOpId}
            onSelect={()=>onSelectOp(op.id)}
            onRemove={()=>onRemoveOp(op.id)}
            onDragStart={onOpDragStart(op)}/>
          <div className="cf-op-actions">
            <span className="cf-op-action" title="转为并序组" onClick={onMakePar}>＋ 添加并序工序</span>
            <span className="cf-op-action" onClick={()=>onMove(-1)}>←</span>
            <span className="cf-op-action" onClick={()=>onMove(1)}>→</span>
          </div>
        </div>
      </div>
    );
  }
  // par
  const isDropOver = dragOver && dragOver.stageId === stage.id && dragOver.dropAs === 'inPar';
  return (
    <div className="cf-stage">
      <div className="cf-stage-par" style={{outline:isDropOver?'2px solid #10B981':'none'}}
        onDragOver={(e)=>{e.preventDefault();setDragOver({stageId:stage.id, dropAs:'inPar'})}}
        onDragLeave={()=>setDragOver(null)}
        onDrop={onDrop}>
        <span className="cf-par-gateway in"><span>⫲</span></span>
        <span className="cf-par-gateway out"><span>⫳</span></span>
        <span className="cf-stage-no par">{index+1}</span>
        <span className="cf-stage-par-label">⫲ 并序 · 同时执行</span>
        {stage.ops.map(op => (
          <div key={op.id} className="cf-par-op-row">
            <OpCard op={op} selected={op.id===selOpId}
              onSelect={()=>onSelectOp(op.id)}
              onRemove={()=>onRemoveOp(op.id)}
              onDragStart={onOpDragStart(op)}/>
          </div>
        ))}
        <div className="par-add" onClick={onMakePar}>＋ 添加并序工序（或拖入）</div>
        <div className="cf-op-actions">
          <span className="cf-op-action par" onClick={onToggleKind}>↩ 转回串序</span>
          <span className="cf-op-action" onClick={()=>onMove(-1)}>←</span>
          <span className="cf-op-action" onClick={()=>onMove(1)}>→</span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   单个工序卡
   ============================================================ */
function OpCard({ op, selected, onSelect, onRemove, onDragStart }) {
  const isIn = op.type === 'in';
  const totalTime = op.setupTime + op.runTime;
  return (
    <div className={'cf-op '+(isIn?'in':'out')+(selected?' selected':'')}
         draggable onDragStart={onDragStart}
         onClick={onSelect}>
      <div className="cf-op-h">
        <span className="grip">⋮⋮</span>
        <span className="num">{op.code}</span>
        <span className="nm">{op.name}</span>
        <span className="x" onClick={(e)=>{e.stopPropagation();onRemove()}} title="移除工序">×</span>
      </div>
      <div className="cf-op-tags">
        <span className={'cf-op-tag '+(isIn?'in-tag':'out-tag')}>{isIn?'自制':'委外'}</span>
        <span className="cf-op-tag">{op.cat}</span>
        {op.qcRequired && <span className="cf-op-tag" style={{background:'#FBDFDF',color:'#7A2A2A'}}>需检验</span>}
      </div>
      <div className="cf-op-b">
        <div className="cf-op-b-row">
          <span className="k">{isIn?'工作中心':'委外厂商'}</span>
          <span className="v" style={{fontFamily:'inherit',fontWeight:500,maxWidth:130,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
            {isIn ? (op.workCenter || '—') : (op.supplier || '—')}
          </span>
        </div>
        <div className="cf-op-b-row">
          <span className="k">{isIn?'设备':'工艺时长'}</span>
          <span className="v" style={{fontFamily:isIn?'inherit':'var(--aw-font-num)',fontWeight:500,maxWidth:130,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
            {isIn ? (op.equipment || '—') : (totalTime>=60 ? (totalTime/60).toFixed(1)+' h' : totalTime+' min')}
          </span>
        </div>
        <div className="cf-op-b-row">
          <span className="k">单件工时</span>
          <span className="v">{totalTime} min</span>
        </div>
      </div>
      <div className="cf-op-f">
        <span className="av">{isIn?'内':'委'}</span>
        <span>{isIn ? `${op.laborCount} 人` : '外部加工'}</span>
        <span className="ml">¥ {(totalTime*op.costRate).toFixed(0)}/件</span>
      </div>
    </div>
  );
}

/* ============================================================
   右：属性面板
   ============================================================ */
function PropertiesPanel({ op, stage, onChange, onChangeStage, onRemove, onClose }) {
  const [tab, setTab] = useCf('basic');
  const isIn = op.type === 'in';

  return (
    <>
      <div className="cf-props-h">
        <span className={'typ '+(isIn?'in':'out')}>{isIn?'自制':'委外'}</span>
        <span style={{flex:1,minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{op.name}</span>
        <span style={{fontSize:11,color:'var(--aw-fg-4)',fontWeight:400}}>{op.code}</span>
        <span style={{cursor:'pointer',color:'var(--aw-fg-4)',fontSize:16,padding:'0 2px',lineHeight:1}} onClick={onClose} title="关闭面板">×</span>
      </div>
      <div className="cf-props-tabs">
        {[
          {k:'basic',  label:'基础'},
          {k:'time',   label:'工时与资源'},
          {k:'qc',     label:'质量'},
          {k:'mat',    label:'物料'},
        ].map(t => (
          <span key={t.k} className={tab===t.k?'on':''} onClick={()=>setTab(t.k)}>{t.label}</span>
        ))}
      </div>

      <div className="cf-props-b">
        {tab === 'basic' && (
          <>
            <div className="cf-prop-sec">
              <div className="cf-prop-sec-h">工序信息</div>
              <div className="cf-prop-row"><label className="req">工序编号</label><input value={op.code} onChange={e=>onChange({code:e.target.value})}/></div>
              <div className="cf-prop-row"><label className="req">工序名称</label><input value={op.name} onChange={e=>onChange({name:e.target.value})}/></div>
              <div className="cf-prop-row"><label>工序分类</label>
                <select value={op.cat} onChange={e=>onChange({cat:e.target.value})}>
                  {['加工','装配','表面','检验','包装','委外','其他'].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="cf-prop-row"><label>工序类型</label>
                <div className={'cf-seg '+(isIn?'':'tone-out')}>
                  <span className={isIn?'on':''} onClick={()=>onChange({type:'in'})}>自制工序</span>
                  <span className={!isIn?'on':''} onClick={()=>onChange({type:'out'})}>委外工序</span>
                </div>
              </div>
            </div>

            <div className="cf-prop-sec">
              <div className="cf-prop-sec-h">排序方式 <span className="n">本节点</span></div>
              <div className="cf-prop-row"><label>串 / 并</label>
                <div className={'cf-seg '+(stage.kind==='par'?'tone-par':'')}>
                  <span className={stage.kind==='seq'?'on':''} onClick={()=>onChangeStage({kind:'seq', ops:[op]})}>串序（独立步骤）</span>
                  <span className={stage.kind==='par'?'on':''} onClick={()=>onChangeStage({kind:'par'})}>并序（同时执行）</span>
                </div>
              </div>
              <div className="cf-prop-row"><label>节点说明</label>
                <textarea placeholder="可填写本节点的总体目标、约束等" defaultValue={stage.kind==='par'?'该节点为并行执行组，多个工序同时进行，时长取最大值。':''}/>
              </div>
            </div>
          </>
        )}

        {tab === 'time' && (
          <>
            <div className="cf-prop-sec">
              <div className="cf-prop-sec-h">{isIn?'工作中心 / 设备':'委外信息'}</div>
              {isIn ? (
                <>
                  <div className="cf-prop-row"><label className="req">工作中心</label>
                    <select value={op.workCenter} onChange={e=>onChange({workCenter:e.target.value})}>
                      {['一车间','二车间','三车间','质检中心','包装车间'].map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="cf-prop-row"><label>设备</label>
                    <select value={op.equipment} onChange={e=>onChange({equipment:e.target.value})}>
                      {['CNC-01','CNC-02','装配台 A','装配台 B','检验台 1','包装线 A'].map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="cf-prop-row"><label>需用工人</label>
                    <div className="cf-input-suffix"><input type="number" value={op.laborCount} onChange={e=>onChange({laborCount:+e.target.value})}/><span className="sfx">人</span></div>
                  </div>
                </>
              ) : (
                <>
                  <div className="cf-prop-row"><label className="req">委外厂商</label>
                    <select value={op.supplier} onChange={e=>onChange({supplier:e.target.value})}>
                      {['南海五金加工厂','恒晟电子','华兴电镀','瑞丰激光'].map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="cf-prop-row"><label>外协协议</label><input placeholder="协议编号 / 报价单号" defaultValue="XY-2026-007"/></div>
                  <div className="cf-prop-row"><label>外协单价</label>
                    <div className="cf-input-suffix"><input type="number" value={op.costRate} onChange={e=>onChange({costRate:+e.target.value})}/><span className="sfx">元/件</span></div>
                  </div>
                </>
              )}
            </div>

            <div className="cf-prop-sec">
              <div className="cf-prop-sec-h">工时参数</div>
              <div className="cf-prop-row"><label>准备工时</label>
                <div className="cf-input-suffix"><input type="number" value={op.setupTime} onChange={e=>onChange({setupTime:+e.target.value})}/><span className="sfx">min</span></div>
              </div>
              <div className="cf-prop-row"><label>单件工时</label>
                <div className="cf-input-suffix"><input type="number" value={op.runTime} onChange={e=>onChange({runTime:+e.target.value})}/><span className="sfx">min</span></div>
              </div>
              <div className="cf-prop-row"><label>排队等待</label>
                <div className="cf-input-suffix"><input type="number" value={op.queueTime} onChange={e=>onChange({queueTime:+e.target.value})}/><span className="sfx">min</span></div>
              </div>
              <div className="cf-prop-row"><label>合计</label>
                <div className="cf-input-suffix"><input disabled value={(op.setupTime+op.runTime+op.queueTime)}/><span className="sfx">min</span></div>
              </div>
              <div className="cf-prop-row"><label>{isIn?'工价':'外协单价'}</label>
                <div className="cf-input-suffix"><input type="number" value={op.costRate} onChange={e=>onChange({costRate:+e.target.value})}/><span className="sfx">{isIn?'元/min':'元/件'}</span></div>
              </div>
            </div>
          </>
        )}

        {tab === 'qc' && (
          <div className="cf-prop-sec">
            <div className="cf-prop-sec-h">质量控制</div>
            <div className="cf-prop-row"><label>是否检验</label>
              <div className="cf-seg">
                <span className={op.qcRequired?'on':''} onClick={()=>onChange({qcRequired:true})}>需要</span>
                <span className={!op.qcRequired?'on':''} onClick={()=>onChange({qcRequired:false})}>不需要</span>
              </div>
            </div>
            <div className="cf-prop-row"><label>检验方案</label>
              <select value={op.qcPlan} onChange={e=>onChange({qcPlan:e.target.value})}>
                <option>首件 + 巡检</option><option>随机抽检</option><option>全检</option><option>抽样 AQL 2.5</option>
              </select>
            </div>
            <div className="cf-prop-row"><label>SOP 编号</label><input value={op.sopCode} onChange={e=>onChange({sopCode:e.target.value})}/></div>
            <div className="cf-prop-row"><label>关键参数</label>
              <textarea defaultValue={op.cat==='加工'?'尺寸公差：±0.05mm\n表面粗糙度：Ra 3.2':'外观无划伤；功能测试通过率 ≥ 99%'}/>
            </div>
            <div className="cf-prop-row"><label>不良处理</label>
              <select defaultValue="返修"><option>返修</option><option>报废</option><option>让步接收</option></select>
            </div>
          </div>
        )}

        {tab === 'mat' && (
          <div className="cf-prop-sec">
            <div className="cf-prop-sec-h">物料消耗（每件）</div>
            <table className="aw-table" style={{fontSize:12}}>
              <thead><tr><th style={{width:80}}>物料编码</th><th>名称</th><th style={{width:60}}>数量</th><th style={{width:50}}>单位</th></tr></thead>
              <tbody>
                <tr><td className="aw-num">M-001</td><td>主体材料</td><td className="aw-num">1</td><td>件</td></tr>
                <tr><td className="aw-num">M-203</td><td>螺丝 M3×8</td><td className="aw-num">4</td><td>个</td></tr>
                {op.cat==='喷涂' && <tr><td className="aw-num">M-501</td><td>面漆 / 哑光黑</td><td className="aw-num">15</td><td>g</td></tr>}
                <tr><td colSpan={4} style={{textAlign:'center',padding:'8px 0'}}><span className="aw-link" style={{fontSize:12}}>＋ 添加物料</span></td></tr>
              </tbody>
            </table>
            <div className="cf-prop-sec-h" style={{marginTop:18}}>副产品 / 废料</div>
            <table className="aw-table" style={{fontSize:12}}>
              <thead><tr><th>名称</th><th style={{width:60}}>数量</th><th style={{width:50}}>单位</th></tr></thead>
              <tbody><tr><td>切削屑</td><td className="aw-num">0.02</td><td>kg</td></tr></tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{padding:'10px 16px',borderTop:'1px solid var(--aw-divider)',display:'flex',justifyContent:'space-between',background:'var(--aw-surface-2)'}}>
        <span className="aw-link" style={{color:'var(--aw-danger)',fontSize:12}} onClick={onRemove}>移除此工序</span>
        <Btn kind="primary" style={{fontSize:12,padding:'4px 12px'}}>应用</Btn>
      </div>
    </>
  );
}

Object.assign(window, { CraftNewScreen });
