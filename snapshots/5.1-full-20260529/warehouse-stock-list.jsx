// ui_kits/erp-console/warehouse-stock-list.jsx
// 仓储中心 — 库存管理 / 库存详情 / 仓库库位
const { useState: useWhState, useEffect: useWhEffect } = React;

const WH_STOCK_ROWS = [
  { ledgerNo:'LED-20251221001', code:'CP-20250101001', image:'phone', name:'IPHONE18', model:'PRO', cat:'成品', unit:'台', stock:15, workshop:10, inTransit:10, frozen:5, occupied:3, available:7, wh:'一号仓库', sourceDoc:'RK-20251221001', sourceLine:'RK-20251221001-01', qualityState:'合格', costLayer:'LAYER-20251221-01', costStatus:'已计价', state:'通过', tone:'g' },
  { ledgerNo:'LED-20251221002', code:'CP-20250101002', image:'box', name:'半成品物料', model:'HM-450', cat:'半成品', unit:'KG', stock:500, workshop:20, inTransit:80, frozen:0, occupied:60, available:440, wh:'二号仓库', sourceDoc:'MO-20251221001', sourceLine:'MO-20251221001-02', qualityState:'让步', costLayer:'LAYER-20251221-02', costStatus:'暂估', state:'待审', tone:'y' },
  { ledgerNo:'LED-20251221003', code:'YL-20250101003', image:'box', name:'铝合金型材', model:'AL-6061', cat:'原材料', unit:'KG', stock:260, workshop:0, inTransit:40, frozen:30, occupied:20, available:210, wh:'原料仓', sourceDoc:'PO-20251221001', sourceLine:'PO-20251221001-03', qualityState:'待检', costLayer:'LAYER-20251221-03', costStatus:'未计价', state:'通过', tone:'g' },
];

const WH_STOCK_FLOW = Array.from({ length: 10 }, (_, i) => ({
  no:`CK2024080422303`,
  title:'新产品出库02135',
  date:'2024-02-12',
  type:'内部领用',
  qty:500,
  user:'XX',
  wh:'仓库一',
}));

const WH_STOCK_DISTRIBUTION = {
  'CP-20250101001': [
    { warehouse:'一号仓库', area:'A区', location:'A-01-01', locationCode:'KW0000002', batch:'CP20250601', sourceLine:'RK-20251221001-01', qualityState:'合格', costLayer:'LAYER-20251221-01', unitCost:'3280.00', stock:6, frozen:2, occupied:1, available:3, inTransit:3, manager:'王仓', status:'可用' },
    { warehouse:'一号仓库', area:'A区', location:'A-01-02', locationCode:'KW0000004', batch:'CP20250602', sourceLine:'RK-20251221001-02', qualityState:'合格', costLayer:'LAYER-20251221-02', unitCost:'3295.00', stock:4, frozen:1, occupied:1, available:2, inTransit:2, manager:'王仓', status:'可用' },
    { warehouse:'二号仓库', area:'B区', location:'B-02-01', locationCode:'KW0000006', batch:'CP20250603', sourceLine:'DB-20251221002-01', qualityState:'待检', costLayer:'LAYER-20251221-03', unitCost:'3310.00', stock:5, frozen:2, occupied:1, available:2, inTransit:5, manager:'李库', status:'待复核' },
  ],
  'CP-20250101002': [
    { warehouse:'二号仓库', area:'B区', location:'B-01-01', locationCode:'KW0000011', batch:'HM20250601', sourceLine:'MO-20251221001-01', qualityState:'合格', costLayer:'LAYER-HM-01', unitCost:'100.00', stock:260, frozen:0, occupied:30, available:230, inTransit:40, manager:'李库', status:'可用' },
    { warehouse:'二号仓库', area:'B区', location:'B-01-02', locationCode:'KW0000012', batch:'HM20250602', sourceLine:'MO-20251221001-02', qualityState:'让步', costLayer:'LAYER-HM-02', unitCost:'98.00', stock:160, frozen:0, occupied:20, available:140, inTransit:20, manager:'李库', status:'可用' },
    { warehouse:'半成品暂存仓', area:'C区', location:'C-03-05', locationCode:'KW0000035', batch:'HM20250603', sourceLine:'WR-20251221001-01', qualityState:'待检', costLayer:'LAYER-HM-03', unitCost:'96.00', stock:80, frozen:0, occupied:10, available:70, inTransit:20, manager:'陈仓', status:'可用' },
  ],
  'YL-20250101003': [
    { warehouse:'原料仓', area:'冷藏区', location:'L-01-01', locationCode:'KW0000101', batch:'AL20250601', sourceLine:'PO-20251221001-01', qualityState:'合格', costLayer:'LAYER-AL-01', unitCost:'18.50', stock:120, frozen:20, occupied:10, available:90, inTransit:20, manager:'李库', status:'可用' },
    { warehouse:'原料仓', area:'常温区', location:'N-02-03', locationCode:'KW0000108', batch:'AL20250602', sourceLine:'PO-20251221001-02', qualityState:'合格', costLayer:'LAYER-AL-02', unitCost:'18.80', stock:90, frozen:10, occupied:5, available:75, inTransit:10, manager:'李库', status:'可用' },
    { warehouse:'质检暂存仓', area:'Q区', location:'Q-01-02', locationCode:'KW0000202', batch:'AL20250603', sourceLine:'IQC-20251221001-01', qualityState:'待检', costLayer:'LAYER-AL-03', unitCost:'18.20', stock:50, frozen:0, occupied:5, available:45, inTransit:10, manager:'王仓', status:'待检' },
  ],
};

const WH_WAREHOUSES = [
  { id:'w1', name:'仓库A', code:'WH-A', manager:'王仓', phone:'13800000001', address:'广东省深圳市宝安区一号园区', type:'成品仓', status:'启用' },
  { id:'w2', name:'仓库B', code:'WH-B', manager:'李库', phone:'13800000002', address:'广东省东莞市松山湖二号园区', type:'原料仓', status:'启用' },
];

const WH_LOCATION_ROWS = [
  { code:'KW0000001', name:'A区', desc:'区域描述', capacity:'100³', warehouse:'仓库A', manager:'王仓', address:'广东省深圳市宝安区一号园区', status:'可用' },
  { code:'KW0000002', name:'A-01-01', desc:'成品手机货架', capacity:'80³', warehouse:'仓库A', manager:'王仓', address:'广东省深圳市宝安区一号园区', status:'可用' },
  { code:'KW0000003', name:'B区', desc:'原材料冷藏区', capacity:'120³', warehouse:'仓库B', manager:'李库', address:'广东省东莞市松山湖二号园区', status:'禁用' },
];

const WH_CODE_ROWS = [
  { main:'SN-202605-0001', parent:'BOX-202605-010', type:'内部主码', batch:'B20250601', location:'A区-A01-01', quality:'合格', stockState:'在库', source:'RK-20251221001', latest:'库存上架', time:'2026-05-21 10:18' },
  { main:'SN-202605-0002', parent:'BOX-202605-010', type:'客户码', batch:'B20250601', location:'A区-A01-01', quality:'合格', stockState:'占用', source:'RK-20251221001', latest:'SO-20251221001', time:'2026-05-21 11:04' },
  { main:'SN-202605-0003', parent:'BOX-202605-011', type:'内部主码', batch:'B20250602', location:'A区-A01-02', quality:'待检', stockState:'冻结', source:'IQC-20251221008', latest:'质检冻结', time:'2026-05-21 13:36' },
];

function WarehouseCodeLedger({ item }) {
  return (
    <PurchaseSection title={`${item.name}物码明细`}>
      <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',marginBottom:12}}>
        <div style={{fontSize:12,color:'var(--aw-fg-3)'}}>支持输入主码、供应商码、客户码、箱码或托盘码反查库存位置与来源单据。</div>
        <div style={{display:'flex',gap:8}}><Btn>查码</Btn><Btn>冻结码</Btn><Btn>补打标签</Btn></div>
      </div>
      <table className="aw-table">
        <thead><tr><th>物品码</th><th>父级/包装码</th><th>码类型</th><th>批次</th><th>库位</th><th>质量状态</th><th>库存状态</th><th>来源入库单</th><th>最近业务</th><th>绑定时间</th><th>操作</th></tr></thead>
        <tbody>{WH_CODE_ROWS.map(row => <tr key={row.main}><td className="aw-num">{row.main}</td><td>{row.parent}</td><td>{row.type}</td><td>{row.batch}</td><td>{row.location}</td><td>{row.quality}</td><td><Badge tone={row.stockState === '在库' ? 'g' : row.stockState === '占用' ? 'b' : 'y'}>{row.stockState}</Badge></td><td>{row.source}</td><td>{row.latest}</td><td>{row.time}</td><td><span className="aw-link">追溯</span></td></tr>)}</tbody>
      </table>
    </PurchaseSection>
  );
}

function WarehouseCodeTrace({ item }) {
  return (
    <PurchaseSection title={`${item.name}追溯链路`}>
      <table className="aw-table">
        <thead><tr><th>时间</th><th>环节</th><th>单据</th><th>码动作</th><th>库位/对象</th><th>结果</th></tr></thead>
        <tbody>
          <tr><td>2026-05-21 09:30</td><td>入库</td><td>RK-20251221001</td><td>生成 15 个主码，绑定 2 个箱码</td><td>A区-A01-01</td><td><Badge tone="g">完成</Badge></td></tr>
          <tr><td>2026-05-21 10:10</td><td>质检</td><td>IQC-20251221008</td><td>抽样码 SN-202605-0003 冻结</td><td>质检暂存仓</td><td><Badge tone="y">待复检</Badge></td></tr>
          <tr><td>2026-05-21 11:04</td><td>出库占用</td><td>SO-20251221001</td><td>占用 SN-202605-0002</td><td>销售订单</td><td><Badge tone="b">占用中</Badge></td></tr>
        </tbody>
      </table>
    </PurchaseSection>
  );
}

function WhStockTree() {
  const groups = [
    ['成品', ['三级分类', '三级分类']],
    ['半成品', ['三级分类', '三级分类']],
    ['原材料', ['三级分类', '三级分类']],
    ['包装耗材', ['二级选项1']],
  ];
  return (
    <div className="aw-doc-tree">
      <div className="aw-doc-tree-h">库存列表 <span className="aw-doc-tree-n">(999)</span></div>
      <div className="aw-doc-tree-list">
        {groups.map((g, idx) => (
          <React.Fragment key={g[0]}>
            <div className={'aw-tree-row aw-tree-l2' + (idx === 0 ? ' on' : '')}><span className="aw-tree-caret">▾</span><TileIcon name="folder" size={14} /><span>{g[0]}</span></div>
            {g[1].map((item, childIdx) => <div key={`${g[0]}-${item}-${childIdx}`} className="aw-tree-row aw-tree-l3"><span className="aw-tree-caret"></span><TileIcon name="doc" size={13} /><span>{item}</span></div>)}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function WarehouseStockListView({ onView }) {
  const [sel, setSel] = useWhState({});
  const allChecked = WH_STOCK_ROWS.every((_, i) => sel[i]);
  const someChecked = WH_STOCK_ROWS.some((_, i) => sel[i]);
  const toggleAll = () => {
    if (allChecked) setSel({});
    else {
      const next = {};
      WH_STOCK_ROWS.forEach((_, i) => next[i] = true);
      setSel(next);
    }
  };
  const toggleRow = (i) => setSel(s => ({...s, [i]: !s[i]}));
  return (
    <>
      <PurchaseListToolbar searchPlaceholder="全局搜索（如产品名称、产品编号、批次、仓库…）" newLabel="库存调整" />
      <div className="aw-doc-tbl-wrap">
        <div className="aw-doc-tbl-inner">
          <table className="aw-doc-tbl">
            <thead>
              <tr>
                <PurchaseSelectHeader checked={allChecked} indeterminate={someChecked} onToggle={toggleAll} />
                <PurchaseIndexHeader />
                <th style={{width:80}}><div className="aw-th-inner">图片</div></th>
                <th style={{width:140}}><div className="aw-th-inner">台账编号</div></th>
                <th style={{width:150}}><div className="aw-th-inner">产品名称</div></th>
                <th style={{width:150}}><div className="aw-th-inner">产品编号</div></th>
                <th style={{width:110}}><div className="aw-th-inner">产品型号</div></th>
                <th style={{width:110}}><div className="aw-th-inner">产品分类</div></th>
                <th style={{width:90}}><div className="aw-th-inner">产品单位</div></th>
                <th style={{width:90}}><div className="aw-th-inner">库存数量</div></th>
                <th style={{width:90}}><div className="aw-th-inner">车间数量</div></th>
                <th style={{width:90}}><div className="aw-th-inner">在途数量</div></th>
                <th style={{width:90}}><div className="aw-th-inner">冻结数量</div></th>
                <th style={{width:90}}><div className="aw-th-inner">占用数量</div></th>
                <th style={{width:90}}><div className="aw-th-inner">可用数量</div></th>
                <th style={{width:120}}><div className="aw-th-inner">仓库</div></th>
                <th style={{width:110}}><div className="aw-th-inner">质量状态</div></th>
                <th style={{width:150}}><div className="aw-th-inner">成本层</div></th>
                <th style={{width:150}}><div className="aw-th-inner">来源明细</div></th>
                <th style={{width:90}}><div className="aw-th-inner">操作</div></th>
              </tr>
            </thead>
            <tbody>
              {WH_STOCK_ROWS.map((r, i) => (
                <tr key={r.code} onClick={() => onView(r)} style={{cursor:'pointer'}}>
                  <PurchaseSelectCell checked={!!sel[i]} onToggle={() => toggleRow(i)} />
                  <td>{i + 1}</td>
                  <td><div style={{width:44,height:30,borderRadius:6,background:'#222',boxShadow:'inset 0 0 0 1px #555'}} /></td>
                  <td className="aw-num">{r.ledgerNo}</td>
                  <td className="aw-link">{r.name}</td>
                  <td className="aw-num">{r.code}</td>
                  <td>{r.model}</td>
                  <td><span style={{color:r.cat === '成品' ? 'var(--aw-success)' : '#B26A24'}}>{r.cat}</span></td>
                  <td>{r.unit}</td>
                  <td>{r.stock}</td>
                  <td>{r.workshop}</td>
                  <td>{r.inTransit}</td>
                  <td>{r.frozen}</td>
                  <td>{r.occupied}</td>
                  <td>{r.available}</td>
                  <td>{r.wh}</td>
                  <td><span className={'aw-state ' + (r.qualityState === '合格' ? 'aw-state-g' : 'aw-state-y')}>{r.qualityState}</span></td>
                  <td>{r.costLayer}</td>
                  <td>{r.sourceLine}</td>
                  <td><span className="aw-link" onClick={e => { e.stopPropagation(); onView(r); }}>查看</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function WarehouseStockDetailView({ data, onBack }) {
  const item = data || WH_STOCK_ROWS[0];
  const [tab, setTab] = useWhState('产品信息');
  const tabs = ['产品信息', '物码明细', '追溯链路', '库存流水', '占用冻结', '出库记录', '入库记录'];
  const distribution = WH_STOCK_DISTRIBUTION[item.code] || [];
  const distributionTotal = distribution.reduce((sum, row) => sum + Number(row.stock || 0), 0);
  const distributionAvailable = distribution.reduce((sum, row) => sum + Number(row.available || 0), 0);
  const distributionFrozen = distribution.reduce((sum, row) => sum + Number(row.frozen || 0), 0);
  const distributionOccupied = distribution.reduce((sum, row) => sum + Number(row.occupied || 0), 0);
  return (
    <div className="aw-doc-form">
      <div className="aw-doc-form-body">
        <DetailHeaderCard
          title={item.name || '新型产品PS2024'}
          status={item.qualityState || '启用'}
          onBack={onBack}
          detailItems={[
            ['产品编号', item.code],
            ['产品型号', item.model],
            ['产品分类', item.cat],
            ['默认仓库', item.wh],
            ['账面库存', distributionTotal || item.stock],
            ['可用数量', distributionAvailable || item.available],
          ]}
        />
        <Card>
          <div className="aw-tabs" style={{marginBottom:14}}>{tabs.map(t => <span key={t} className={'aw-tab ' + (tab === t ? 'on' : '')} onClick={() => setTab(t)}>{t}</span>)}</div>
          {tab === '产品信息' && (
            <>
              <PurchaseSection title="产品摘要">
                <div className="aw-doc-grid" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
                  {[
                    ['产品名称', item.name], ['产品编号', item.code], ['产品型号', item.model],
                    ['产品分类', item.cat], ['产品单位', item.unit], ['默认仓库', item.wh],
                    ['台账编号', item.ledgerNo], ['来源单据', item.sourceDoc], ['来源明细', item.sourceLine],
                    ['质量状态', item.qualityState], ['成本层编号', item.costLayer], ['成本状态', item.costStatus],
                    ['账面库存', distributionTotal || item.stock], ['冻结数量', distributionFrozen || item.frozen], ['占用数量', distributionOccupied || item.occupied], ['可用数量', distributionAvailable || item.available],
                  ].map(([k,v]) => <div key={k}><span style={{color:'var(--aw-fg-3)'}}>{k}：</span>{v}</div>)}
                </div>
              </PurchaseSection>
              <PurchaseSection title="库存库位分布">
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:12}}>
                  {distribution.map((row, idx) => (
                    <div key={row.locationCode} style={{border:'1px solid var(--aw-border)',borderRadius:6,background:'#fff',padding:14}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                        <div style={{fontWeight:600,color:'var(--aw-fg-1)'}}>{row.warehouse} / {row.location}</div>
                        <span className={'aw-state ' + (row.status === '可用' ? 'aw-state-g' : 'aw-state-y')}>{row.status}</span>
                      </div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 16px',fontSize:13}}>
                        <div><span style={{color:'var(--aw-fg-3)'}}>序号：</span>{idx + 1}</div>
                        <div><span style={{color:'var(--aw-fg-3)'}}>库位编号：</span>{row.locationCode}</div>
                        <div><span style={{color:'var(--aw-fg-3)'}}>区域：</span>{row.area}</div>
                        <div><span style={{color:'var(--aw-fg-3)'}}>批次：</span>{row.batch}</div>
                        <div><span style={{color:'var(--aw-fg-3)'}}>来源明细：</span>{row.sourceLine}</div>
                        <div><span style={{color:'var(--aw-fg-3)'}}>质量状态：</span>{row.qualityState}</div>
                        <div><span style={{color:'var(--aw-fg-3)'}}>成本层：</span>{row.costLayer}</div>
                        <div><span style={{color:'var(--aw-fg-3)'}}>单位成本：</span>{row.unitCost}</div>
                        <div><span style={{color:'var(--aw-fg-3)'}}>库存数量：</span>{row.stock}</div>
                        <div><span style={{color:'var(--aw-fg-3)'}}>可用数量：</span>{row.available}</div>
                        <div><span style={{color:'var(--aw-fg-3)'}}>冻结数量：</span>{row.frozen}</div>
                        <div><span style={{color:'var(--aw-fg-3)'}}>占用数量：</span>{row.occupied}</div>
                        <div><span style={{color:'var(--aw-fg-3)'}}>在途数量：</span>{row.inTransit}</div>
                        <div><span style={{color:'var(--aw-fg-3)'}}>负责人：</span>{row.manager}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </PurchaseSection>
            </>
          )}
          {tab === '物码明细' && <WarehouseCodeLedger item={item} />}
          {tab === '追溯链路' && <WarehouseCodeTrace item={item} />}
          {tab === '库存流水' && <WarehouseStockFlowTable item={item} />}
          {tab === '占用冻结' && <WarehouseStockLockTable item={item} />}
          {(tab === '出库记录' || tab === '入库记录') && (
            <>
              <div style={{display:'flex',gap:8,marginBottom:12}}><Input placeholder="搜索单号/主题" style={{maxWidth:260}} /><Btn>搜索</Btn></div>
              <table className="aw-table">
                <thead><tr><th>序号</th><th>{tab === '出库记录' ? '出库单号' : '入库单号'}</th><th>{tab === '出库记录' ? '出库订单主题' : '入库订单主题'}</th><th>{tab === '出库记录' ? '出库日期' : '入库日期'}</th><th>{tab === '出库记录' ? '出库类型' : '入库类型'}</th><th>{tab === '出库记录' ? '出库总量' : '入库总量'}</th><th>经办人</th><th>仓库</th></tr></thead>
                <tbody>{WH_STOCK_FLOW.map((r, i) => <tr key={i}><td>{i + 1}</td><td>{r.no}</td><td>{r.title}</td><td>{r.date}</td><td>{r.type}</td><td>{r.qty}</td><td>{r.user}</td><td>{r.wh}</td></tr>)}</tbody>
              </table>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

function WarehouseStockFlowTable({ item }) {
  const rows = [
    ['RK-20251221001','RK-20251221001-01','采购入库','入库','B20250601','A区-A01-01','合格','LAYER-20251221-01','3280.00','0','15','15','已过账'],
    ['CK-20251221003','SO-20251221001-01','销售出库','出库','B20250601','A区-A01-01','合格','LAYER-20251221-01','3280.00','15','-5','10','已过账'],
    ['DJ-20251221002','SO-20251221001-02','销售订单占用','占用','B20250602','A区-A01-02','合格','LAYER-20251221-02','3295.00','10','-3','7','已锁定'],
  ];
  return <PurchaseSection title={`${item.name}库存流水`}><table className="aw-table"><thead><tr>{['序号','来源单据','来源明细','业务类型','方向','批次','库位','质量状态','成本层','单位成本','变动前','变动数','变动后','状态'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={r[0]}><td>{i+1}</td>{r.map((c,idx)=><td key={idx}>{idx===12?<span className={'aw-state '+(c==='已过账'?'aw-state-g':'aw-state-y')}>{c}</span>:c}</td>)}</tr>)}</tbody></table></PurchaseSection>;
}

function WarehouseStockLockTable({ item }) {
  const rows = [
    ['SO-20251221001','SO-20251221001-01','销售订单占用','A区-A01-01','B20250601','合格','3','2025-12-21','待发货释放','李文涛'],
    ['QC-20251221008','IQC-20251221008-02','质检冻结','A区-A01-02','B20250602','待检','2','2025-12-20','QMS复检放行','王质检'],
  ];
  return <PurchaseSection title={`${item.name}占用冻结明细`}><table className="aw-table"><thead><tr>{['序号','来源单据','来源明细','类型','库位','批次','质量状态','数量','锁定日期','释放条件','负责人'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={r[0]}><td>{i+1}</td>{r.map((c,idx)=><td key={idx}>{idx===8?<span className="aw-state aw-state-y">{c}</span>:c}</td>)}</tr>)}</tbody></table></PurchaseSection>;
}

function WarehouseStockScreen() {
  const [view, setView] = useWhState('list');
  const [detail, setDetail] = useWhState(WH_STOCK_ROWS[0]);
  return (
    <div className="aw-doc-page">
      {view === 'list' && <WhStockTree />}
      <div className="aw-doc-main" style={{maxWidth:'none'}}>
        {view === 'list' && <WarehouseStockListView onView={(row) => { setDetail(row); setView('detail'); }} />}
        {view === 'detail' && <WarehouseStockDetailView data={detail} onBack={() => setView('list')} />}
      </div>
    </div>
  );
}

function WarehouseTree() {
  return (
    <div className="aw-doc-tree">
      <div className="aw-doc-tree-h">库位管理 <span className="aw-doc-tree-n">(999)</span></div>
      <div className="aw-doc-tree-list">
        {WH_WAREHOUSES.map((w, idx) => (
          <React.Fragment key={w.id}>
            <div className={'aw-tree-row aw-tree-l2' + (idx === 0 ? ' on' : '')}><span className="aw-tree-caret">▾</span><TileIcon name="folder" size={14} /><span>{w.name}</span></div>
            <div className="aw-tree-row aw-tree-l3"><span className="aw-tree-caret"></span><TileIcon name="doc" size={13} /><span>区域</span></div>
            <div className="aw-tree-row aw-tree-l3"><span className="aw-tree-caret"></span><TileIcon name="doc" size={13} /><span>库位</span></div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function LocationModal({ onClose }) {
  const [createType, setCreateType] = useWhState('warehouse');
  const [status, setStatus] = useWhState('启用');
  const [warehouseOwner, setWarehouseOwner] = useWhState('');
  const isWarehouse = createType === 'warehouse';
  const isArea = createType === 'area';
  const titleMap = { warehouse:'新增仓库', area:'新增区域', location:'新增库位' };
  const typeItems = [
    { key:'warehouse', label:'仓库', desc:'维护仓库名称、负责人和地址' },
    { key:'area', label:'区域', desc:'在仓库下划分存储区域' },
    { key:'location', label:'库位', desc:'在区域下维护具体库位' },
  ];
  return (
    <div className="aw-mask" onClick={onClose}>
      <div className="aw-modal" style={{width:'min(980px,94vw)',maxHeight:'none',overflow:'hidden'}} onClick={e => e.stopPropagation()}>
        <div className="head"><span>{titleMap[createType]}</span><span style={{cursor:'pointer'}} onClick={onClose}>✕</span></div>
        <div className="body" style={{padding:0}}>
          <div style={{display:'grid',gridTemplateColumns:'220px 1fr',minHeight:480}}>
            <div style={{borderRight:'1px solid var(--aw-border)',background:'var(--aw-surface-2)'}}>
              <div style={{padding:'12px 14px',borderBottom:'1px solid var(--aw-divider)',fontSize:13,fontWeight:600}}>新增类型</div>
              <div style={{padding:8}}>
                {typeItems.map(item => (
                  <div key={item.key} className={'aw-tree-row aw-tree-l2' + (createType === item.key ? ' on' : '')} style={{height:'auto',alignItems:'flex-start',padding:'9px 10px'}} onClick={() => setCreateType(item.key)}>
                    <span className="aw-tree-caret">{createType === item.key ? '▾' : ''}</span>
                    <TileIcon name={item.key === 'warehouse' ? 'folder' : 'doc'} size={14} />
                    <span style={{display:'flex',flexDirection:'column',gap:3}}>
                      <span>{item.label}</span>
                      <span style={{fontSize:11,color:'var(--aw-fg-4)',lineHeight:1.35}}>{item.desc}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{padding:'18px 22px'}}>
              <div className="aw-doc-grid" style={{gridTemplateColumns:'1fr 1fr',gap:'14px 22px'}}>
                <Field label="新增类型" req><Select value={createType} onChange={e => setCreateType(e.target.value)}><option value="warehouse">仓库</option><option value="area">区域</option><option value="location">库位</option></Select></Field>
                {isWarehouse && (
                  <>
                    <Field label="仓库名称" req><Input placeholder="请输入仓库名称" /></Field>
                    <Field label="仓库编码"><Input defaultValue="WH2024030001" /></Field>
                    <Field label="仓库类型" req><Select><option>成品仓</option><option>原料仓</option><option>半成品仓</option><option>质检暂存仓</option></Select></Field>
                    <Field label="仓库负责人" req><PersonPickerInput value={warehouseOwner} onChange={setWarehouseOwner} placeholder="请选择负责人" /></Field>
                    <Field label="联系方式"><Input placeholder="请输入联系方式" /></Field>
                    <Field label="仓库地址" req><Input placeholder="请输入仓库地址" /></Field>
                    <div className="aw-field">
                      <label>温区 <HelpTip text="仓库温区支持多选。产品入库时会校验产品温区要求，例如冻货只能进入支持冻品温区的冷库。" /></label>
                      <div style={{display:'flex',gap:16,alignItems:'center',height:32}}>
                        <label style={{fontSize:13}}><input type="checkbox" defaultChecked /> 常温</label>
                        <label style={{fontSize:13}}><input type="checkbox" /> 冷藏</label>
                        <label style={{fontSize:13}}><input type="checkbox" /> 冻品</label>
                        <label style={{fontSize:13}}><input type="checkbox" /> 恒温</label>
                      </div>
                    </div>
                    <Field label={<span>仓库容量(m³)<HelpTip text="仓库容量用于整体容量预警，区域和库位会继续做更细的容量、温区、混批混料校验。" /></span>}><Input defaultValue="1200" /></Field>
                  </>
                )}
                {!isWarehouse && (
                  <>
                    <Field label={isArea ? '区域名称' : '库位名称'} req><Input placeholder={`填写${isArea ? '区域名称' : '库位名称'}`} /></Field>
                    <Field label={isArea ? '区域编码' : '库位编码'}><Input defaultValue={isArea ? 'LS2024030001' : 'KW2024030001'} /></Field>
                    <Field label="所属仓库" req><Select><option>仓库A</option><option>仓库B</option></Select></Field>
                    {isArea && (
                      <div className="aw-field">
                        <label>温区 <HelpTip text="区域温区为单选，并且只能从所属仓库已启用的温区中选择。后续产品入库会按产品温区要求匹配区域和库位。" /></label>
                        <Select><option>常温</option><option>冷藏</option><option>冻品</option><option>恒温</option></Select>
                      </div>
                    )}
                    {!isArea && <Field label="所属区域" req><Select><option>A区（常温）</option><option>B区（冻品）</option></Select></Field>}
                    <Field label={<span>{isArea ? '区域容量(m³)' : '库位容量(m³)'}<HelpTip text={isArea ? '区域容量按立方米计算。开启体积校验后，入库会按物品体积和当前占用判断区域是否可用。' : '库位容量按立方米计算，用于上架推荐和超容量拦截。'} /></span>}><Input defaultValue="120" /></Field>
                    {isArea && (
                      <Field label={<span>计算存放体积<HelpTip text="开启后，系统按区域容量、已占用体积和待入库物品体积计算可用性；超过容量时区域不可用。" /></span>}>
                        <Select><option>开启</option><option>关闭</option></Select>
                      </Field>
                    )}
                  </>
                )}
                <Field label="状态" req>
                  <div style={{display:'flex',gap:18,alignItems:'center',height:32}}>
                    <Radio on={status === '启用'} onClick={() => setStatus('启用')}>启用</Radio>
                    <Radio on={status === '关闭'} onClick={() => setStatus('关闭')}>关闭</Radio>
                  </div>
                </Field>
                <div className="aw-field" style={{gridColumn:'1 / 3'}}>
                  <label>备注</label>
                  <textarea className="aw-input" placeholder="填写仓库、区域或库位备注" style={{height:72,resize:'vertical'}} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="foot"><Btn onClick={onClose}>取消</Btn><Btn kind="primary" onClick={onClose}>确定</Btn></div>
      </div>
    </div>
  );
}

function WarehouseLocationScreen({ initialAction, onActionConsumed }) {
  const [modal, setModal] = useWhState(null);
  useWhEffect(() => {
    if (initialAction === 'new') {
      setModal(true);
      onActionConsumed && onActionConsumed();
    }
  }, [initialAction]);
  return (
    <div className="aw-doc-page">
      <WarehouseTree />
      <div className="aw-doc-main" style={{maxWidth:'none'}}>
        <PurchaseListToolbar searchPlaceholder="全局搜索（如仓库、区域、库位）" newLabel="新增" onNew={() => setModal(true)} />
        <div className="aw-doc-tbl-wrap">
          <table className="aw-doc-tbl">
            <thead><tr><th style={{width:60}}>序号</th><th>区域编号</th><th>区域名称</th><th>区域描述</th><th>容量</th><th>所属仓库</th><th>仓库负责人</th><th>仓库地址</th><th>区域状态</th><th>操作</th></tr></thead>
            <tbody>{WH_LOCATION_ROWS.map((r,i)=><tr key={r.code}><td>{i+1}</td><td>{r.code}</td><td>{r.name}</td><td>{r.desc}</td><td>{r.capacity}</td><td>{r.warehouse}</td><td>{r.manager}</td><td>{r.address}</td><td>{r.status}</td><td><span className="aw-link">查看</span></td></tr>)}</tbody>
          </table>
        </div>
        <PurchaseListFooter total={800} selectedCount={1} allChecked={true} someChecked={false} onToggleAll={() => {}} pages={23} />
      </div>
      {modal && <LocationModal onClose={() => setModal(null)} />}
    </div>
  );
}

window.WarehouseStockScreen = WarehouseStockScreen;
window.WarehouseLocationScreen = WarehouseLocationScreen;
