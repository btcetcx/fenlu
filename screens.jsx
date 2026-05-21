// ui_kits/erp-console/screens.jsx
const { useState: useS } = React;

// 工作台首页（默认页）
const WORKBENCH_NEWS = [
  {tag:'重要', tone:'rose', text:'关于2026年上半年生产排产计划调整的通知', time:'2小时前'},
  {tag:'制度', tone:'sky',  text:'新版《供应商绩效考核管理办法》正式发布', time:'1天前'},
  {tag:'公告', tone:'peach', text:'五一假期期间值班安排及应急联络表', time:'3天前'},
  {tag:'活动', tone:'mint', text:'2026年第一季度优秀员工评选结果公示', time:'1周前'},
  {tag:'系统', tone:'sky',  text:'ERP系统将于本周六凌晨进行版本升级维护', time:'1周前'},
];

const WORKBENCH_RECENT = [
  {code:'DRW-20260428-A03', name:'主轴箱体装配图', cat:'研发 · 文档库', time:'12分钟前', ic:'doc'},
  {code:'PRJ-2026-017', name:'智能输送线项目', cat:'研发 · 项目库', time:'1小时前', ic:'folder'},
  {code:'P-HM-450', name:'高精度伺服电机', cat:'产品 · 产品中心', time:'今天 09:24', ic:'cube'},
  {code:'PR-2026-0428-002', name:'采购申请单', cat:'采购 · 采购申请', time:'昨天 17:08', ic:'cart'},
  {code:'WO-260428-014', name:'第三车间日工单', cat:'生产 · 工单管理', time:'昨天 15:30', ic:'list'},
];

function formatBoardClock(date) {
  const pad = n => String(n).padStart(2, '0');
  const week = ['周日','周一','周二','周三','周四','周五','周六'][date.getDay()];
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${week} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function boardNumber(value) {
  return Number(value || 0).toLocaleString('zh-CN');
}

// 通用：列表内拖拽重排 hook
function useReorder(initialList) {
  const [list, setList] = useS(initialList);
  const [drag, setDrag] = useS(null);
  const [over, setOver] = useS(null);
  const dragProps = (idx) => ({
    draggable: true,
    onDragStart: (e) => { setDrag(idx); e.dataTransfer.effectAllowed='move'; },
    onDragOver:  (e) => { e.preventDefault(); if (idx!==over) setOver(idx); },
    onDrop:      (e) => {
      e.preventDefault();
      if (drag==null || drag===idx) { setDrag(null); setOver(null); return; }
      const a = [...list]; const [m] = a.splice(drag,1); a.splice(idx,0,m);
      setList(a); setDrag(null); setOver(null);
    },
    onDragEnd:   () => { setDrag(null); setOver(null); },
    'data-dragging': drag===idx || undefined,
    'data-over':     (over===idx && drag!=null && drag!==idx) || undefined,
  });
  return [list, dragProps];
}

function WorkbenchScreen({ dept='rd', onNavigate }) {
  const [todoOpen, setTodoOpen] = useS(false);
  const [drawer, setDrawer] = useS(null);
  const wb = DEPT_CONFIG[dept].workbench;
  const deptTitle = DEPT_CONFIG[dept].title || '工作台';
  const [kpis, kpiDrag] = useReorder(wb.kpis);
  const [more, moreDrag] = useReorder(wb.moreKpis);
  const [nav, navDrag] = useReorder(wb.navTiles);
  const [entries, entryDrag] = useReorder(wb.entries);
  const openDrawer = (type, item, title) => setDrawer({ type, item, title:title || item?.label || '工作台单据' });
  const openWorkbenchItem = (type, item, title) => {
    if (item?.moduleKey && onNavigate) {
      onNavigate(item.moduleKey, item.action || item.label);
      return;
    }
    openDrawer(type, item, title);
  };

  const news = WORKBENCH_NEWS;
  const recent = WORKBENCH_RECENT;

  const renderKpi = (k, i, dragP) => (
    <div key={k.key} className={'aw-kpi aw-drag-tile '+k.tone} {...dragP(i)} onClick={() => openWorkbenchItem('todo', k, k.label)}>
      <div className="l">{k.label}</div>
      <div className="n">{k.value}</div>
      <div className="a">点击查看</div>
      <div className="ic" style={{color:'currentColor'}}><TileIcon name={k.ic} size={16}/></div>
    </div>
  );

  return (
    <>
      <Card title="待办事项">
        <div className="aw-card-actions">
          <RefreshAction label="刷新" />
          <span className="aw-act" onClick={()=>openDrawer('todoAll', {label:'全部待办', value:[...kpis, ...more].reduce((sum, k) => sum + (Number(k.value) || 0), 0)}, '全部待办事项')}>全部<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6"/></svg></span>
          <span className="aw-act" onClick={()=>setTodoOpen(o=>!o)}>{todoOpen?'收起':'展开'}<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{transform:todoOpen?'rotate(90deg)':'rotate(0deg)',transition:'transform .15s'}}><path d="M9 6l6 6-6 6"/></svg></span>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:12}}>
          {kpis.map((k,i)=>renderKpi(k,i,kpiDrag))}
        </div>
        {todoOpen && (
          <div style={{marginTop:12,display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:12}}>
            {more.map((k,i)=>renderKpi(k,i,moreDrag))}
          </div>
        )}
      </Card>

      <Card title="业务导航">
        <div className="aw-card-actions">
          <span className="aw-act">拖动卡片</span>
          <span className="aw-act">调整顺序</span>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(8,1fr)',gap:12}}>
          {nav.map((n,i)=>(
            <div key={n.label} className="aw-tile aw-drag-tile" {...navDrag(i)} onClick={() => openWorkbenchItem('nav', n, `${n.label} · ${n.sub}`)}>
              {n.n>0 && <span className="aw-tile-badge">{n.n}</span>}
              <div className="aw-tile-icon" style={{background:n.tint,color:n.fg}}><TileIcon name={n.ic}/></div>
              <div className="aw-tile-label">{n.label}</div>
              <div className="aw-tile-sub">{n.sub}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="便捷入口">
        <div className="aw-card-actions">
          <span className="aw-act">拖动卡片</span>
          <span className="aw-act">调整顺序</span>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:12}}>
          {entries.map((e,i)=>(
            <div key={e.label} className="aw-entry aw-drag-tile" {...entryDrag(i)} onClick={() => openWorkbenchItem('entry', e, e.label)}>
              <div className="aw-entry-icon" style={{background:e.tint,color:e.fg}}><TileIcon name={e.ic}/></div>
              <div className="aw-entry-label">{e.label}</div>
            </div>
          ))}
          <div className="aw-entry aw-entry-add">
            <div className="aw-entry-icon" style={{background:'transparent',color:'#9CA3AF',border:'1px dashed #D1D5DB'}}>+</div>
            <div className="aw-entry-label" style={{color:'#9CA3AF'}}>新增入口</div>
          </div>
        </div>
      </Card>

      <div className="aw-workbench-feed-grid">
        <Card title="公告 / 消息中心">
          <div className="aw-card-actions">
            <span className="aw-act" onClick={() => openDrawer('newsAll', {label:'公告 / 消息中心', value:news.length}, '公告 / 消息中心')}>全部</span>
          </div>
          <div className="aw-feed">
            {news.map((it,i)=>(
              <div key={i} className="aw-feed-row" onClick={() => openDrawer('news', it, it.text)}>
                <span className={'aw-feed-tag aw-feed-tag-'+it.tone}>{it.tag}</span>
                <span className="aw-feed-text">{it.text}</span>
                <span className="aw-feed-time">{it.time}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="最近访问">
          <div className="aw-card-actions">
            <span className="aw-act" onClick={() => openDrawer('recentAll', {label:'最近访问', value:recent.length}, '最近访问')}>查看全部</span>
          </div>
          <div className="aw-feed">
            {recent.map((it,i)=>(
              <div key={i} className="aw-recent-row" onClick={() => openDrawer('recent', it, `${it.code} ${it.name}`)}>
                <div className="aw-recent-ic"><TileIcon name={it.ic}/></div>
                <div className="aw-recent-main">
                  <div className="aw-recent-title"><span className="aw-recent-code">{it.code}</span> {it.name}</div>
                  <div className="aw-recent-cat">{it.cat}</div>
                </div>
                <div className="aw-recent-time">{it.time}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      {drawer && <WorkbenchLeftDrawer deptTitle={deptTitle} drawer={drawer} news={news} recent={recent} onClose={() => setDrawer(null)} />}
    </>
  );
}

function BigScreenDashboard({ dept='rd', onClose }) {
  const cfg = DEPT_CONFIG[dept] || DEPT_CONFIG.rd;
  const wb = cfg.workbench || DEPT_CONFIG.rd.workbench;
  const [clock, setClock] = useS(() => formatBoardClock(new Date()));
  React.useEffect(() => {
    const timer = setInterval(() => setClock(formatBoardClock(new Date())), 1000);
    return () => clearInterval(timer);
  }, []);

  const kpis = wb.kpis || [];
  const more = wb.moreKpis || [];
  const nav = wb.navTiles || [];
  const entries = wb.entries || [];
  const news = WORKBENCH_NEWS;
  const recent = WORKBENCH_RECENT;
  const allKpis = [...kpis, ...more];
  const todoTotal = allKpis.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  const navTotal = nav.reduce((sum, item) => sum + (Number(item.n) || 0), 0);
  const activeNav = nav.filter(item => Number(item.n) > 0).length;
  const riskItems = allKpis.filter(item => ['rose','sand'].includes(item.tone)).slice(0, 5);
  const spotlight = riskItems.length ? riskItems : allKpis.slice(0, 5);
  const maxKpi = Math.max(1, ...allKpis.map(item => Number(item.value) || 0));
  const maxNav = Math.max(1, ...nav.map(item => Number(item.n) || 0));
  const navRank = [...nav].sort((a, b) => (Number(b.n) || 0) - (Number(a.n) || 0)).slice(0, 6);
  const operationRate = Math.min(96, Math.max(42, Math.round((activeNav / Math.max(nav.length, 1)) * 72 + 18)));
  const finishRate = Math.min(98, Math.max(36, 100 - Math.round(todoTotal / Math.max(allKpis.length, 1))));
  const warningCount = spotlight.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  const todoRows = buildWorkbenchDrawerRows(cfg.title, {
    type: 'todoAll',
    item: { label: '全部待办', value: todoTotal },
    title: '全部待办事项',
  }, news, recent);

  return (
    <div className="aw-board-screen">
      <div className="aw-board-grid-bg" aria-hidden="true" />
      <header className="aw-board-head">
        <div className="aw-board-brand">
          <div className="aw-board-kicker">海南傲为智慧 ERP</div>
          <h1>{cfg.title}大屏看板</h1>
        </div>
        <div className="aw-board-head-metrics">
          <div className="aw-board-clock">{clock}</div>
          <button className="aw-board-back" type="button" onClick={onClose}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            返回工作台
          </button>
        </div>
      </header>

      <main className="aw-board-layout">
        <section className="aw-board-panel aw-board-panel-left">
          <BoardPanelTitle title="待办总览" value={boardNumber(todoTotal)} />
          <div className="aw-board-kpi-grid">
            {kpis.map(item => (
              <div key={item.key} className={'aw-board-kpi aw-board-tone-' + item.tone}>
                <div className="aw-board-kpi-top">
                  <span>{item.label}</span>
                  <TileIcon name={item.ic} size={17} />
                </div>
                <strong>{boardNumber(item.value)}</strong>
                <div className="aw-board-kpi-bar"><i style={{width:`${Math.max(8, Math.round(((Number(item.value) || 0) / maxKpi) * 100))}%`}} /></div>
              </div>
            ))}
          </div>

          <div className="aw-board-subtitle">重点预警</div>
          <div className="aw-board-alert-list">
            {spotlight.map(item => (
              <div key={item.key + item.label} className="aw-board-alert-row">
                <span className={'aw-board-alert-dot aw-board-tone-' + item.tone}></span>
                <span>{item.label}</span>
                <strong>{boardNumber(item.value)}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="aw-board-center">
          <div className="aw-board-hero-panel">
            <div className="aw-board-hero-main">
              <div className="aw-board-hero-label">当前工作台待办</div>
              <div className="aw-board-hero-num">{boardNumber(todoTotal)}</div>
              <div className="aw-board-hero-meta">
                <span>业务模块 {nav.length}</span>
                <span>快捷入口 {entries.length}</span>
                <span>预警项 {boardNumber(warningCount)}</span>
              </div>
            </div>
            <div className="aw-board-rings">
              <div className="aw-board-ring" style={{'--pct': operationRate}}>
                <span>{operationRate}%</span>
                <em>模块活跃</em>
              </div>
              <div className="aw-board-ring aw-board-ring-green" style={{'--pct': finishRate}}>
                <span>{finishRate}%</span>
                <em>处理健康</em>
              </div>
            </div>
          </div>

          <div className="aw-board-panel aw-board-todo-panel">
            <BoardPanelTitle title="全部待办事项" value={boardNumber(todoRows.length)} />
            <div className="aw-board-todo-table">
              <div className="aw-board-todo-table-head">
                <span>序号</span>
                <span>单据编号</span>
                <span>单据主题</span>
                <span>所属模块</span>
                <span>发起人</span>
                <span>时间</span>
                <span>状态</span>
                <span>操作</span>
              </div>
              <div className="aw-board-todo-table-body">
                <div className="aw-board-todo-table-track">
                  {[...todoRows, ...todoRows].map((row, idx) => (
                    <div key={`${row.code}-${idx}`} className="aw-board-todo-table-row">
                      <span>{(idx % todoRows.length) + 1}</span>
                      <span>{row.code}</span>
                      <span>{row.subject}</span>
                      <span>{row.module}</span>
                      <span>{row.owner}</span>
                      <span>{row.time}</span>
                      <span className={'aw-board-state aw-board-state-' + row.tone}>{row.status}</span>
                      <span className="aw-board-link">查看</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="aw-board-panel aw-board-flow-panel">
            <BoardPanelTitle title="快捷入口" value={boardNumber(entries.length)} />
            <div className="aw-board-entry-flow">
              {entries.map((item, idx) => (
                <React.Fragment key={item.label}>
                  <div className="aw-board-entry-node">
                    <span style={{color:item.fg}}><TileIcon name={item.ic} size={18} /></span>
                    <b>{item.label}</b>
                  </div>
                  {idx < entries.length - 1 && <i />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        <section className="aw-board-panel aw-board-panel-right">
          <BoardPanelTitle title="业务排行" value={boardNumber(navRank[0]?.n || 0)} />
          <div className="aw-board-rank-list">
            {navRank.map((item, idx) => (
              <div key={item.label} className="aw-board-rank-row">
                <span className="aw-board-rank-index">{String(idx + 1).padStart(2, '0')}</span>
                <div className="aw-board-rank-main">
                  <div><b>{item.label}</b><em>{item.sub}</em></div>
                  <div className="aw-board-rank-bar"><i style={{width:`${Math.max(5, Math.round(((Number(item.n) || 0) / maxNav) * 100))}%`}} /></div>
                </div>
                <strong>{boardNumber(item.n)}</strong>
              </div>
            ))}
          </div>

          <div className="aw-board-subtitle">公告消息</div>
          <div className="aw-board-news-list">
            {news.slice(0, 4).map((item, idx) => (
              <div key={idx} className="aw-board-news-row">
                <span className={'aw-board-news-tag aw-board-news-' + item.tone}>{item.tag}</span>
                <b>{item.text}</b>
                <em>{item.time}</em>
              </div>
            ))}
          </div>

          <div className="aw-board-subtitle">最近访问</div>
          <div className="aw-board-recent-list">
            {recent.slice(0, 4).map(item => (
              <div key={item.code} className="aw-board-recent-row">
                <span><TileIcon name={item.ic} size={16} /></span>
                <div>
                  <b>{item.name}</b>
                  <em>{item.code}</em>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function BoardPanelTitle({ title, value }) {
  return (
    <div className="aw-board-panel-title">
      <span>{title}</span>
      {value != null && <strong>{value}</strong>}
    </div>
  );
}

function WorkbenchLeftDrawer({ deptTitle, drawer, news, recent, onClose }) {
  const [fieldOpen, setFieldOpen] = useS(false);
  const rows = buildWorkbenchDrawerRows(deptTitle, drawer, news, recent);
  const titleMap = { todo:'待办单据', todoAll:'全部待办事项', nav:'业务导航', entry:'便捷入口', news:'公告消息', newsAll:'公告消息', recent:'最近访问', recentAll:'最近访问' };
  return (
    <>
      <div style={{position:'fixed',inset:0,background:'rgba(16,24,40,.28)',zIndex:60}} onClick={onClose} />
      <div style={{position:'fixed',right:0,top:0,bottom:0,width:'min(1080px,92vw)',background:'#fff',boxShadow:'-8px 0 32px rgba(16,24,40,.18)',zIndex:61,display:'flex',flexDirection:'column'}}>
        <div style={{padding:'18px 22px',borderBottom:'1px solid var(--aw-border)',display:'flex',alignItems:'center',gap:14}}>
          <div style={{width:4,height:18,background:'var(--aw-primary)',borderRadius:2}} />
          <div style={{minWidth:0,flex:1}}>
            <div style={{fontSize:17,fontWeight:700,color:'var(--aw-fg-1)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{drawer.title}</div>
            <div style={{fontSize:12,color:'var(--aw-fg-3)',marginTop:4}}>{deptTitle} / {titleMap[drawer.type] || '工作台单据'}</div>
          </div>
          <button className="aw-btn">刷新</button>
          <button className="aw-btn" onClick={() => setFieldOpen(true)}>字段配置</button>
          <button className="aw-btn">导出</button>
          <button className="aw-btn" onClick={onClose}>关闭</button>
        </div>
        <div className="aw-doc-tb" style={{border:0,borderBottom:'1px solid var(--aw-border)',borderRadius:0}}>
          <div className="aw-doc-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8"><circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/></svg>
            <input placeholder="全局搜索（如单据编号、主题、申请人）" />
          </div>
          <button className="aw-btn">筛选</button>
          <button className="aw-btn">批量处理</button>
        </div>
        <div style={{flex:1,minHeight:0,overflow:'auto',padding:18,background:'var(--aw-bg)'}}>
          <div className="aw-doc-tbl-wrap" style={{borderRadius:8}}>
            <table className="aw-doc-tbl">
              <thead>
                <tr>
                  <th style={{width:56}}><div className="aw-th-inner">序号</div></th>
                  <th style={{width:160}}><div className="aw-th-inner">单据编号</div></th>
                  <th style={{width:240}}><div className="aw-th-inner">单据主题</div></th>
                  <th style={{width:120}}><div className="aw-th-inner">所属模块</div></th>
                  <th style={{width:100}}><div className="aw-th-inner">发起人</div></th>
                  <th style={{width:150}}><div className="aw-th-inner">时间</div></th>
                  <th style={{width:110}}><div className="aw-th-inner">状态</div></th>
                  <th style={{width:100}}><div className="aw-th-inner">操作</div></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={r.code + idx}>
                    <td className="aw-num">{idx + 1}</td>
                    <td className="aw-num">{r.code}</td>
                    <td>{r.subject}</td>
                    <td>{r.module}</td>
                    <td>{r.owner}</td>
                    <td className="aw-num">{r.time}</td>
                    <td><span className={'aw-state aw-state-' + r.tone}>{r.status}</span></td>
                    <td><span className="aw-link">查看</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div style={{padding:'12px 18px',borderTop:'1px solid var(--aw-border)',display:'flex',alignItems:'center',justifyContent:'space-between',fontSize:12,color:'var(--aw-fg-3)'}}>
          <span>共 {rows.length} 条，工作台单据统一在右侧抽屉中查看</span>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <span>每页 10 条</span><span className="aw-pg on">1</span><span className="aw-pg">2</span><span className="aw-pg">3</span>
          </div>
        </div>
      </div>
      {fieldOpen && <FieldDrawer onClose={() => setFieldOpen(false)} />}
    </>
  );
}

function buildWorkbenchDrawerRows(deptTitle, drawer, news, recent) {
  if (drawer.type === 'news' || drawer.type === 'newsAll') {
    const list = drawer.type === 'news' ? [drawer.item] : news;
    return list.map((item, idx) => ({
      code:`MSG-${String(idx + 1).padStart(4,'0')}`,
      subject:item.text,
      module:'公告消息',
      owner:item.tag || '系统',
      time:item.time || '刚刚',
      status:item.tag || '公告',
      tone:item.tone === 'rose' ? 'r' : item.tone === 'mint' ? 'g' : 'b',
    }));
  }
  if (drawer.type === 'recent' || drawer.type === 'recentAll') {
    const list = drawer.type === 'recent' ? [drawer.item] : recent;
    return list.map((item, idx) => ({
      code:item.code || `REC-${String(idx + 1).padStart(4,'0')}`,
      subject:item.name || drawer.title,
      module:item.cat || '最近访问',
      owner:'老夏',
      time:item.time || '刚刚',
      status:'已访问',
      tone:'g',
    }));
  }
  const base = drawer.item || {};
  const count = Math.max(6, Math.min(18, Number(base.value || base.n || 8)));
  const moduleName = base.sub || base.label || deptTitle;
  const seed = `${deptTitle}-${base.key || base.label || drawer.type}`.replace(/\s+/g, '');
  const statuses = drawer.type === 'entry'
    ? [['待处理','y'], ['处理中','b'], ['已完成','g']]
    : [['待审批','y'], ['待处理','b'], ['已退回','r'], ['已完成','g']];
  return Array.from({length:count}).map((_, idx) => {
    const status = statuses[idx % statuses.length];
    return {
      code:`${seed.slice(0,2).toUpperCase()}-${new Date().getFullYear()}${String(idx + 1).padStart(4,'0')}`,
      subject:`${moduleName} ${drawer.type === 'entry' ? '快捷处理' : '待办单据'} ${idx + 1}`,
      module:moduleName,
      owner:['老夏','李文涛','陈思源','王会计','仓库一'][idx % 5],
      time:`2026-05-${String(17 - (idx % 7)).padStart(2,'0')} 09:${String(10 + idx).padStart(2,'0')}`,
      status:status[0],
      tone:status[1],
    };
  });
}

// 业务导航 / 便捷入口 / 最近访问 通用线性图标
function TileIcon({ name, size=20 }) {
  const s = { width:size, height:size, stroke:'currentColor', fill:'none', strokeWidth:1.6, strokeLinecap:'round', strokeLinejoin:'round' };
  switch(name){
    case 'doc':    return (<svg viewBox="0 0 24 24" {...s}><path d="M7 3h8l4 4v14H7z"/><path d="M15 3v4h4"/><path d="M9 13h6M9 17h6"/></svg>);
    case 'folder': return (<svg viewBox="0 0 24 24" {...s}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>);
    case 'cube':   return (<svg viewBox="0 0 24 24" {...s}><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/></svg>);
    case 'list':   return (<svg viewBox="0 0 24 24" {...s}><path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>);
    case 'flow':   return (<svg viewBox="0 0 24 24" {...s}><path d="M4 7h11l-3-3M20 17H9l3 3"/></svg>);
    case 'edit':   return (<svg viewBox="0 0 24 24" {...s}><path d="M4 20h4l10-10-4-4L4 16z"/><path d="M14 6l4 4"/></svg>);
    case 'user':   return (<svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6"/></svg>);
    case 'check':  return (<svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/></svg>);
    case 'upload': return (<svg viewBox="0 0 24 24" {...s}><path d="M12 16V5"/><path d="M7 10l5-5 5 5"/><path d="M5 20h14"/></svg>);
    case 'cart':   return (<svg viewBox="0 0 24 24" {...s}><circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/><path d="M3 4h2l3 12h11l2-8H6"/></svg>);
    case 'search': return (<svg viewBox="0 0 24 24" {...s}><circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/></svg>);
    default: return null;
  }
}

// 文档详情页
function DocDetailScreen({embedded}={}) {
  const [tab, setTab] = useS('detail');
  const content = (
    <>
      {!embedded && (
        <DetailHeaderCard
          title="xxx文档202415487"
          status="待审批"
          detailItems={[
            ['文档编号', 'PJ7820864'],
            ['文档名称', '文档名称'],
            ['文档类型', '文档分类'],
            ['版本号', 'V 1.0'],
          ]}
        />
      )}
      <Card>
        <Tabs items={[{k:'detail',label:'文档详情'},{k:'attach',label:'文档附件'},{k:'ver',label:'历史版本'},{k:'log',label:'操作记录'}]} active={tab} onChange={setTab}/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',rowGap:14,columnGap:32,fontSize:13}}>
          <KV k="文档编号" v="PJ7820864"/>
          <KV k="文档名称" v="文档名称"/>
          <KV k="文档类型" v="文档分类"/>
          <KV k="创建人" v="分类一"/>
          <KV k="创建时间" v="2025-03-17 18:00"/>
          <KV k="最后修改时间" v="2025-03-17 18:00"/>
          <KV k="失效日期" v="永久 / 2028-08-08"/>
          <KV k="版本号" v="V 1.0"/>
        </div>
        <div style={{marginTop:18,fontSize:13,lineHeight:1.7,color:'#1F2937'}}>
          <p><b>技术背景：</b>嵌入式智能控制器的发展经历了从单一功能到多功能集成的演变，其核心是提升运算能力、通信能力和适应复杂环境的能力。近年来，随着物联网和人工智能技术的进步，控制器的功能更加智能化、网络化。</p>
          <p><b>实际应用：</b>例如，在智能制造领域，嵌入式智能控制器被广泛应用于机器人的精准控制、生产线的自动化管理等场景。通过实时数据采集与分析，控制器能够快速响应生产需求，提升效率和产品质量。</p>
          <p><b>设计阶段：</b>企业在设计嵌入式智能控制器时，应充分考虑结构多样化、接口标准化以及功能扩展性。同时，需严格按照硬件要求选择处理器和存储器，确保满足运算速度和数据处理能力的需求。</p>
        </div>
      </Card>
    </>
  );
  return content;
}
function KV({k,v}){return <div style={{display:'flex',gap:18}}><span style={{color:'#6B7280',width:90,flex:'none'}}>{k}</span><span>：{v}</span></div>;}

// 新增合同弹窗
function NewContractModal({ onClose, onOpenPicker }) {
  const products = [
    {n:1,code:'7820864',name:'半成品物料',spec:'规格一',unit:'公斤',price:'2.00',qty:'600',total:'1200.00'},
    {n:2,code:'5786931',name:'半成品物料',spec:'规格一',unit:'公斤',price:'2.00',qty:'600',total:'1200.00'},
    {n:3,code:'8518691',name:'半成品物料',spec:'规格一',unit:'公斤',price:'2.00',qty:'600',total:'1200.00'},
    {n:4,code:'6576642',name:'半成品物料',spec:'规格一',unit:'公斤',price:'2.00',qty:'600',total:'1200.00'},
    {n:5,code:'6081578',name:'半成品物料',spec:'规格一',unit:'公斤',price:'2.00',qty:'请输入',total:''},
  ];
  return (
    <Modal title="新增合同" onClose={onClose}
      footer={<><Btn onClick={onClose}>关闭</Btn><Btn>暂存</Btn><Btn kind="primary">确定</Btn></>}>
      <div className="aw-card" style={{padding:0,border:0}}>
        <div className="section-title">详细信息</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'14px 24px'}}>
          <Field label="合同主题"><Input placeholder="请输入内容"/></Field>
          <Field label="合同编号"><Input defaultValue="自动" disabled/></Field>
          <Field label="关联客户"><div style={{display:'flex',gap:8,alignItems:'center'}}><Select style={{flex:1}}><option>请选择</option></Select><Btn onClick={()=>onOpenPicker&&onOpenPicker('person')}>选择负责人</Btn></div></Field>
          <Field label="开始日期"><Input placeholder="请选择"/></Field>
          <Field label="失效日期"><Input placeholder="请选择"/></Field>
          <Field label="合同分类"><Select><option>请选择</option></Select></Field>
          <Field label="合同金额"><Input placeholder="请选择"/></Field>
        </div>
        <div className="section-title" style={{marginTop:22}}>产品信息</div>
        <table className="aw-table">
          <thead><tr><th style={{width:30}}></th><th>序号</th><th>产品编码</th><th>产品名称</th><th>规格型号</th><th>单位</th><th>单价</th><th>合同价</th><th>合计数量</th><th>合计金额</th></tr></thead>
          <tbody>{products.map(p=>(
            <tr key={p.n}><td>☐</td><td>{p.n}</td><td>{p.code}</td><td>{p.name}</td><td>{p.spec}</td><td>{p.unit}</td><td>{p.price}</td><td>{p.qty}</td><td>{p.qty}</td><td>{p.total}</td></tr>
          ))}</tbody>
        </table>
        <div style={{marginTop:10,display:'flex',gap:24,fontSize:13}}>总量：<b style={{color:'#F5222D',fontFamily:'var(--aw-font-num)'}}>0</b> 总金额：<b style={{color:'#F5222D',fontFamily:'var(--aw-font-num)'}}>0</b></div>
        <div className="section-title" style={{marginTop:22}}>附件</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          <div style={{border:'1px dashed #F5C49A',borderRadius:6,padding:'12px 14px',background:'#FDF7F0'}}>
            <div style={{fontSize:13,fontWeight:500,marginBottom:4}}>新建文本文档.PDF</div>
            <div style={{fontSize:11,color:'#9CA3AF'}}>文件大小：9 Bytes</div>
            <div style={{fontSize:11,color:'#9CA3AF',marginTop:2}}>上传日期：2024-08-1 17:45:27</div>
            <div style={{marginTop:6,display:'flex',gap:10,fontSize:12}}>
              <span style={{color:'#5677FC',cursor:'pointer'}}>重新上传</span>
              <span style={{color:'#5677FC',cursor:'pointer'}}>删除</span>
            </div>
          </div>
          <div style={{border:'1px dashed #D1D5DB',borderRadius:6,padding:'24px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,color:'#6B7280'}}>
            <span style={{color:'#5677FC',cursor:'pointer'}}>点击上传</span> / 拖拽到此区域
          </div>
        </div>
      </div>
    </Modal>
  );
}

// 审批策略设置
function ApprovalRulesScreen() {
  const [r1,sR1]=useS('y'),[r2,sR2]=useS('y'),[r3,sR3]=useS('n');
  const Row = ({title,sub,val,set})=>(
    <div style={{padding:'16px 18px',border:'1px solid #E5E7EB',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
      <div><div style={{fontSize:14,fontWeight:600,marginBottom:4}}>{title}</div><div style={{fontSize:12,color:'#6B7280'}}>{sub}</div></div>
      <div><Radio on={val==='y'} onClick={()=>set('y')}>是</Radio><Radio on={val==='n'} onClick={()=>set('n')}>否</Radio></div>
    </div>
  );
  return (
    <Card>
      <Row title="新增策略规则" sub="新增文档是否强制审批" val={r1} set={sR1}/>
      <Row title="编辑删除策略规则" sub="是否强制审批" val={r2} set={sR2}/>
      <Row title="引用中的文档" sub="引用中的文档是否可删除编辑" val={r3} set={sR3}/>
    </Card>
  );
}

// 编码规则设置 — 左右联动编号规则配置
function CodeRuleScreen({ module: mod = MODULE_DOC }) {
  const m = mod || MODULE_DOC;
  const CANDIDATES = [
    { k:'y4',  label:'年（4位）', preview:'2025', group:'year' },
    { k:'y2',  label:'年（2位）', preview:'25',   group:'year' },
    { k:'m',   label:'月（2位）', preview:'05',   group:null   },
    { k:'d',   label:'日（2位）', preview:'15',   group:null   },
    { k:'s3',  label:'流水号（3位）', preview:'001', group:'seq'},
    { k:'s1',  label:'流水号（1位）', preview:'1',  group:'seq'},
    { k:'cc1', label:'自定义代码1', preview:'C1',  group:null   },
    { k:'cc2', label:'自定义代码2', preview:'C2',  group:null   },
  ];
  const PREVIEW = Object.fromEntries(CANDIDATES.map(c=>[c.k, c.preview]));

  const [selected, setSelected] = useS([]);       // max 4, prefix excluded
  const [separator, setSep]     = useS('-');
  const [prefixVal, setPrefix]  = useS('AA');
  const [switches, setSwitches] = useS({});
  const [codeVals, setCodeVals] = useS({ cc1: 'C1', cc2: 'C2' });
  const [labelVals, setLabelVals] = useS({ cc1: '自定义代码1', cc2: '自定义代码2' });
  const [drag, setDrag]         = useS(null);
  const [over, setOver]         = useS(null);

  const isMaxed = selected.length >= 4;
  const totalCount = selected.length + 1;          // +1 for locked prefix

  const toggleCandidate = (key) => {
    const cand = CANDIDATES.find(c => c.k === key);
    if (selected.includes(key)) {
      setSelected(prev => prev.filter(k => k !== key));
      setSwitches(prev => { const n = {...prev}; delete n[key]; return n; });
    } else if (selected.length < 4) {
      if (cand.group) {
        // mutual exclusion: remove same-group siblings
        setSelected(prev => [...prev.filter(k => {
          const c = CANDIDATES.find(x => x.k === k);
          return c?.group !== cand.group;
        }), key]);
        setSwitches(prev => {
          const n = {...prev};
          CANDIDATES.filter(c => c.group === cand.group && c.k !== key).forEach(c => delete n[c.k]);
          return n;
        });
      } else {
        setSelected(prev => [...prev, key]);
      }
    }
  };

  const removeItem = (key) => {
    setSelected(prev => prev.filter(k => k !== key));
    setSwitches(prev => { const n = {...prev}; delete n[key]; return n; });
    if (key === 'cc1' || key === 'cc2') {
      setCodeVals(prev => ({...prev, [key]: PREVIEW[key]}));
      setLabelVals(prev => ({...prev, [key]: CANDIDATES.find(c => c.k === key)?.label || '自定义代码'}));
    }
  };

  // Controlled drag: directly mutates selected
  const makeDragProps = (idx) => ({
    draggable: true,
    onDragStart: (e) => {setDrag(idx);e.dataTransfer.effectAllowed = 'move';},
    onDragOver: (e) => {e.preventDefault();if (idx !== over) setOver(idx);},
    onDrop: (e) => {
      e.preventDefault();
      if (drag == null || drag === idx) {setDrag(null);setOver(null);return;}
      const a = [...selected];const [m] = a.splice(drag, 1);a.splice(idx, 0, m);
      setSelected(a);setDrag(null);setOver(null);
    },
    onDragEnd: () => {setDrag(null);setOver(null);},
    'data-dragging': drag === idx || undefined,
    'data-over': over === idx && drag != null && drag !== idx || undefined
  });

  // Preview: prefixVal + separator + rest (ordered by selected array)
  const getPreviewVal = (k) => (k === 'cc1' || k === 'cc2') ? codeVals[k] : PREVIEW[k];
  const restPart = selected.map(k => getPreviewVal(k)).join(separator);
  const hasRest = selected.length > 0;

  // Lock SVG icon
  const LockIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" style={{ flex:'none' }} fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );

  // Render a candidate card
  const renderCard = (c, extraStyle) => {
    const isSelected = selected.includes(c.k);
    const isDisabled = isMaxed && !isSelected;
    const idx = selected.indexOf(c.k);
    return (
      <div
        key={c.k}
        onClick={() => !isDisabled && toggleCandidate(c.k)}
        style={{
          position: 'relative',
          border: `1px solid ${isSelected ? '#5677FC' : '#E5E7EB'}`,
          borderRadius: 6,
          padding: '10px 14px',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          userSelect: 'none',
          transition: 'all .15s',
          background: isSelected ? '#EEF1FF' : '#fff',
          opacity: isDisabled ? 0.45 : 1,
          ...extraStyle,
        }}
      >
        {isSelected && (
          <span style={{
            position: 'absolute', top: 0, right: 0,
            background: '#5677FC', color: '#fff',
            fontSize: 10, padding: '1px 5px',
            borderRadius: '0 6px 0 6px',
            fontWeight: 500,
          }}>
            {idx + 2}
          </span>
        )}
        <div style={{ fontSize: 13, fontWeight: 500 }}>{c.label}</div>
        <div style={{ fontSize: 12, color: '#6B7280', fontFamily: 'var(--aw-font-num)', marginTop: 2 }}>{c.preview}</div>
      </div>
    );
  };

  return (
    <>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'flex-start' }}>
      {/* ===== 左侧 — 样式预览 + 已选编号项 ===== */}
      <Card>
        {/* 预览区 */}
        <div style={{ background: 'linear-gradient(180deg,#fff,#EEF1FF)', border: '1px solid #DCE7FB', borderRadius: 8, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 24, marginBottom: 18 }}>
          <svg width="120" height="52" viewBox="0 0 120 52" style={{ flex: 'none' }}>
            <defs>
              <linearGradient id="bcg" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#5677FC"/>
                <stop offset="100%" stopColor="#9DB6F0"/>
              </linearGradient>
            </defs>
            {[2,1,3,2,1,2,3,1,2,3,1,2,1,3,2,1,3,2,1,2,3,1,2,3,1,2,1,3,2,1].map((w, i) => (
              <rect key={i} x={i*4} y={0} width={w} height={52} fill="url(#bcg)" opacity={0.3 + (i%5)*0.14}/>
            ))}
          </svg>
          <div>
            <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>当前样式：</div>
            <div style={{ fontSize: 24, fontWeight: 600, fontFamily: 'var(--aw-font-num)' }}>
              <span style={{ color: '#1F2937' }}>{prefixVal}{hasRest ? separator : ''}</span>
              {hasRest && <span style={{ color: '#5677FC' }}>{restPart}</span>}
            </div>
          </div>
        </div>

        {/* 已选编号项 */}
        <div style={{ fontSize: 13, fontWeight: 600, display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span>已选编号项</span>
          <span style={{ color: '#6B7280', fontWeight: 400 }}>{totalCount} / 5</span>
        </div>

        {/* 前缀固定行 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: '1px solid #5677FC', borderRadius: 6, marginBottom: 8, background: '#F5F8FF', cursor: 'default' }}>
          <LockIcon />
          <span style={{ flex: 1, fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            前缀
            <input
              value={prefixVal}
              onChange={e => setPrefix(e.target.value)}
              placeholder="前缀值"
              style={{ width: 80, padding: '2px 8px', fontSize: 13, border: '1px solid #E5E7EB', borderRadius: 4, fontFamily: 'var(--aw-font-num)', outline: 'none', flex: 'none' }}
            />
          </span>
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6B7280', cursor: 'pointer', whiteSpace: 'nowrap', flex: 'none' }}>
            搜索项 <Switch on={!!switches['prefix']} onChange={() => setSwitches(prev => ({...prev, prefix: !prev['prefix']}))} />
          </label>
        </div>

        {/* 其余已选项 — 可拖拽 */}
        <div>
          {selected.length === 0 && (
            <div style={{ color: '#9CA3AF', fontSize: 12, textAlign: 'center', padding: '20px 0' }}>暂未选择编号项</div>
          )}
          {selected.map((k, idx) => {
            const cand = CANDIDATES.find(c => c.k === k);
            return (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: 6, marginBottom: 8, background: '#fff', cursor: 'grab' }} {...makeDragProps(idx)}>
                <span style={{ color: '#D1D5DB', fontSize: 16, lineHeight: 1, flex: 'none' }}>⠿</span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  {cand?.label}
                  {(k === 'cc1' || k === 'cc2') && (
                    <>
                      <input
                        value={labelVals[k]}
                        onChange={e => setLabelVals(prev => ({...prev, [k]: e.target.value}))}
                        placeholder={cand?.label}
                        style={{ width: 80, padding: '2px 8px', fontSize: 13, border: '1px solid #E5E7EB', borderRadius: 4, fontFamily: 'var(--aw-font-num)', outline: 'none', flex: 'none' }}
                      />
                      <input
                        value={codeVals[k]}
                        onChange={e => setCodeVals(prev => ({...prev, [k]: e.target.value}))}
                        placeholder={PREVIEW[k]}
                        style={{ width: 80, padding: '2px 8px', fontSize: 13, border: '1px solid #E5E7EB', borderRadius: 4, fontFamily: 'var(--aw-font-num)', outline: 'none', flex: 'none' }}
                      />
                    </>
                  )}
                </span>
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6B7280', cursor: 'pointer', whiteSpace: 'nowrap', flex: 'none' }}>
                  搜索项 <Switch on={!!switches[k]} onChange={() => setSwitches(prev => ({...prev, [k]: !prev[k]}))} />
                </label>
                <span onClick={(e) => { e.stopPropagation(); removeItem(k); }} style={{ color: '#9CA3AF', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '0 4px', flex: 'none' }}>×</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ===== 右侧 — 规则配置 + 编号项选择 ===== */}
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 16px' }}>
          <div className="aw-field req"><label>规则名称</label><Input placeholder="填写编号规则名称" /></div>
          <div className="aw-field req"><label>规则编码</label><Input placeholder="填写编号规则编码" /></div>
          <div className="aw-field"><label>间隔符</label><Input value={separator} onChange={e => setSep(e.target.value)} /></div>
        </div>

        <div style={{ borderTop: '1px solid #F0F1F4', margin: '16px 0' }} />

        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>编号项</div>
        <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 10 }}>
          前缀固定占 1 个名额，其余最多选择 4 项
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {/* Row 1: 前缀 — locked, full width */}
          <div style={{
            gridColumn: '1/-1',
            position: 'relative',
            border: '1px solid #5677FC',
            borderRadius: 6,
            padding: '10px 14px',
            cursor: 'default',
            userSelect: 'none',
            background: '#EEF1FF',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <span style={{
              position: 'absolute', top: 0, right: 0,
              background: '#5677FC', color: '#fff',
              fontSize: 10, padding: '1px 5px',
              borderRadius: '0 6px 0 6px',
              fontWeight: 500,
            }}>1</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>前缀</div>
              <div style={{ fontSize: 12, color: '#6B7280', fontFamily: 'var(--aw-font-num)', marginTop: 2 }}>
                预览值：{prefixVal}
              </div>
            </div>
            <LockIcon />
          </div>

          {/* Row 2: Year group — 互斥 */}
          {renderCard(CANDIDATES[0])}
          {renderCard(CANDIDATES[1])}

          {/* Row 3: Month / Day — 独立 */}
          {renderCard(CANDIDATES[2])}
          {renderCard(CANDIDATES[3])}

          {/* Row 4: Serial group — 互斥 */}
          {renderCard(CANDIDATES[4])}
          {renderCard(CANDIDATES[5])}
        </div>

        {/* 扩展项分区 */}
        <div style={{ borderTop: '1px solid #F0F1F4', margin: '14px 0' }} />
        <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>扩展项</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {renderCard(CANDIDATES[6])}
          {renderCard(CANDIDATES[7])}
        </div>
      </Card>
    </div>

    {/* 底部按钮 */}
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
      <Btn onClick={() => {
        setSelected([]);
        setSep('-');
        setPrefix('AA');
        setSwitches({});
        setCodeVals({ cc1: 'C1', cc2: 'C2' });
        setLabelVals({ cc1: '自定义代码1', cc2: '自定义代码2' });
      }}>重置</Btn>
      <Btn kind="primary">保存</Btn>
    </div>
    </>
  );
}

Object.assign(window, { WorkbenchScreen, DocDetailScreen, NewContractModal, ApprovalRulesScreen, CodeRuleScreen });
