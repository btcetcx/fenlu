const { useState } = React;

function App() {
  const [topActive, setTop] = useState('rd');
  const [side, setSide] = useState('workbench');
  const [showModal, setShowModal] = useState(false);
  const [subView, setSubView] = useState(null);
  const [listAction, setListAction] = useState(null);
  const [picker, setPicker] = useState(null);
  const [boardOpen, setBoardOpen] = useState(false);

  const cfg = DEPT_CONFIG[topActive] || DEPT_CONFIG.rd;
  const sideItem = cfg.sideItems.find(si => si.k === side);
  const mod = MODULES[side] || null;

  const handleTopChange = (k) => { setTop(k); setSide('workbench'); setSubView(null); setListAction(null); setBoardOpen(false); };
  const handleSideChange = (k) => { setSide(k); setSubView(null); setListAction(null); setBoardOpen(false); };
  const handleWorkbenchNavigate = (moduleKey, action) => handleFlyoutPick(moduleKey, action);
  const handleDashboardMode = () => {
    setBoardOpen(true);
  };

  const handleFlyoutPick = (moduleKey, item) => {
    setSide(moduleKey);
    const sv = PICK_MAP[item];
    if (sv) { setSubView(sv); setListAction(null); }
    else if (moduleKey === 'outbound' && ['直接出库','全部出库单','待出库单','待出库明细','待申请发货'].includes(item)) { setSubView(null); setListAction(item); }
    else if (moduleKey === 'inbound' && ['直接入库','全部入库单','待入库单','待入库明细'].includes(item)) { setSubView(null); setListAction(item); }
    else if (moduleKey === 'transfer' && ['新增调拨','调拨列表','调拨明细表'].includes(item)) { setSubView(null); setListAction(item); }
    else if (moduleKey === 'inventoryCheck' && ['直接盘点','盘点计划','所有盘点单'].includes(item)) { setSubView(null); setListAction(item); }
    else if (item && (item.startsWith('新增') || item.startsWith('新') || item.startsWith('添加'))) { setSubView(null); setListAction('new'); }
    else { setSubView(null); setListAction(item || null); }
  };

  // Build flyouts with unified onPick for all modules
  const flyouts = cfg.flyouts ? (() => {
    const result = {};
    Object.keys(cfg.flyouts).forEach(key => {
      const f = cfg.flyouts[key];
      result[key] = {
        sections: f.sections.map(s => ({
          ...s,
          onPick: x => handleFlyoutPick(key, x),
        })),
      };
    });
    return result;
  })() : cfg.flyouts;

  // PageHead title
  const title = (() => {
    if (subView === 'coderule') return `设置${mod?.name || ''}编号`;
    if (subView === 'category' && mod?.code === 'supp') return '供应商分组';
    if (subView === 'category' && mod?.code === 'cust') return '客户分组';
    if (subView === 'category') return `设置${mod?.name || ''}分类`;
    if (subView === 'flow')     return '设置审批流程';
    if (subView === 'field')    return '设置自定义字段';
    if (subView === 'policy')   return `${mod?.name || ''}策略设置`;
    if (subView === 'print')    return '设置打印模板';
    if (topActive === 'set' && side === 'guide') return '初始化引导';
    if (topActive === 'set' && listAction) return listAction;
    if (listAction && listAction.includes('策略设置')) return '策略设置';
    if (sideItem) return sideItem.label;
    return '';
  })();

  if (boardOpen) {
    return <BigScreenDashboard dept={topActive} onClose={() => setBoardOpen(false)} />;
  }

  return (
    <div data-screen-label="ERP Console">
      <Topbar active={topActive} onChange={handleTopChange} />
      <div className="aw-shell">
        <Sidebar title={cfg.title} items={cfg.sideItems} active={side} onChange={handleSideChange} flyouts={flyouts} />
        <div className="aw-main">
          <PageHead>
            <span className="aw-page-title">{title}</span>
            {side === 'workbench' && cfg.workbench && (
              <button
                className="aw-workbench-board-btn"
                type="button"
                title={`${cfg.title}大屏看板`}
                onClick={handleDashboardMode}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="14" rx="2" />
                  <path d="M8 21h8" />
                  <path d="M12 18v3" />
                  <path d="M7 12l3-3 3 2 4-5" />
                </svg>
                <span>大屏看板</span>
              </button>
            )}
          </PageHead>

          {topActive === 'prd' && <PrdScreen moduleKey={side} />}

          {topActive === 'set' && side === 'workbench' && (
            <SettingsCenterScreen section="workbench" action={listAction} onActionConsumed={() => setListAction(null)} onNavigate={handleWorkbenchNavigate} />
          )}

          {topActive !== 'prd' && topActive !== 'set' && side === 'workbench' && <WorkbenchScreen key={topActive} dept={topActive} onNavigate={handleWorkbenchNavigate} />}

          {topActive === 'set' && side !== 'workbench' && (
            <SettingsCenterScreen section={side} action={listAction} onActionConsumed={() => setListAction(null)} />
          )}

          {side !== 'workbench' && !subView && side === 'doc' && (
            <DocListScreen initialAction={listAction} onActionConsumed={() => setListAction(null)} />
          )}

          {side !== 'workbench' && !subView && side === 'project' && (
            <ProjectListScreen module={mod} initialAction={listAction} onActionConsumed={() => setListAction(null)} />
          )}

          {side !== 'workbench' && !subView && side === 'product' && (
            <ProductListScreen module={mod} initialAction={listAction} onActionConsumed={() => setListAction(null)} />
          )}

          {side !== 'workbench' && !subView && side === 'material' && (
            <MaterialListScreen module={mod} initialAction={listAction} onActionConsumed={() => setListAction(null)} />
          )}

          {side !== 'workbench' && !subView && side === 'process' && (
            <ProcessListScreen module={mod} initialAction={listAction} onActionConsumed={() => setListAction(null)} />
          )}

          {side === 'craft' && <CraftScreen initialAction={listAction} onActionConsumed={() => setListAction(null)} />}

          {side !== 'workbench' && !subView && side === 'supplier' && (
            <SupplierListScreen module={mod} initialAction={listAction} onActionConsumed={() => setListAction(null)} />
          )}

          {side !== 'workbench' && !subView && side === 'pr' && (
            <PrListScreen module={mod} initialAction={listAction} onActionConsumed={() => setListAction(null)} />
          )}

          {side !== 'workbench' && !subView && side === 'inquiry' && (
            <InquiryListScreen module={mod} initialAction={listAction} onActionConsumed={() => setListAction(null)} />
          )}

          {side !== 'workbench' && !subView && side === 'order' && (
            <OrderListScreen module={mod} initialAction={listAction} onActionConsumed={() => setListAction(null)} />
          )}

          {side !== 'workbench' && !subView && side === 'customer' && (
            <CustomerListScreen module={mod} initialAction={listAction} onActionConsumed={() => setListAction(null)} />
          )}

          {side !== 'workbench' && !subView && side === 'salesPlan' && (
            <SalesPlanListScreen module={mod} initialAction={listAction} onActionConsumed={() => setListAction(null)} />
          )}

          {side !== 'workbench' && !subView && side === 'quote' && (
            <QuoteListScreen module={mod} initialAction={listAction} onActionConsumed={() => setListAction(null)} />
          )}

          {side !== 'workbench' && !subView && side === 'saleOrder' && (
            <SaleOrderListScreen module={mod} initialAction={listAction} onActionConsumed={() => setListAction(null)} />
          )}

          {side !== 'workbench' && !subView && side === 'contract' && (
            <ContractListScreen module={mod} initialAction={listAction} onActionConsumed={() => setListAction(null)} />
          )}

          {side !== 'workbench' && !subView && side === 'stockManage' && (
            <WarehouseStockScreen />
          )}

          {side !== 'workbench' && !subView && side === 'warehouseLocation' && (
            <WarehouseLocationScreen initialAction={listAction} onActionConsumed={() => setListAction(null)} />
          )}

          {side !== 'workbench' && !subView && side === 'outbound' && (
            <WarehouseOutboundScreen initialAction={listAction} onActionConsumed={() => setListAction(null)} />
          )}

          {side !== 'workbench' && !subView && side === 'inbound' && (
            <WarehouseInboundScreen initialAction={listAction} onActionConsumed={() => setListAction(null)} />
          )}

          {side !== 'workbench' && !subView && side === 'transfer' && (
            <WarehouseTransferScreen initialAction={listAction} onActionConsumed={() => setListAction(null)} />
          )}

          {side !== 'workbench' && !subView && side === 'inventoryCheck' && (
            <WarehouseInventoryScreen initialAction={listAction} onActionConsumed={() => setListAction(null)} />
          )}

          {side !== 'workbench' && !subView && side.startsWith('finance') && (
            <FinanceModuleScreen moduleKey={side} initialAction={listAction} onActionConsumed={() => setListAction(null)} />
          )}

          {side !== 'workbench' && !subView && side.startsWith('hr') && (
            <HrModuleScreen moduleKey={side} initialAction={listAction} onActionConsumed={() => setListAction(null)} />
          )}

          {side !== 'workbench' && !subView && side.startsWith('qc') && (
            <QcModuleScreen moduleKey={side} initialAction={listAction} onActionConsumed={() => setListAction(null)} />
          )}

          {side !== 'workbench' && !subView && side.startsWith('as') && (
            <AsModuleScreen moduleKey={side} initialAction={listAction} onActionConsumed={() => setListAction(null)} />
          )}

          {side !== 'workbench' && !subView && side.startsWith('mfg') && (
            <MfgModuleScreen moduleKey={side} initialAction={listAction} onActionConsumed={() => setListAction(null)} />
          )}

          {topActive !== 'set' && side !== 'workbench' && !subView && mod && side !== 'doc' && side !== 'project' && side !== 'product' && side !== 'material' && side !== 'process' && side !== 'craft' && side !== 'supplier' && side !== 'pr' && side !== 'inquiry' && side !== 'order' && side !== 'customer' && side !== 'salesPlan' && side !== 'quote' && side !== 'saleOrder' && side !== 'contract' && side !== 'stockManage' && side !== 'warehouseLocation' && side !== 'outbound' && side !== 'inbound' && side !== 'transfer' && side !== 'inventoryCheck' && !side.startsWith('finance') && !side.startsWith('hr') && !side.startsWith('qc') && !side.startsWith('as') && !side.startsWith('mfg') && (
            <ModuleListScreen module={mod} initialAction={listAction} onActionConsumed={() => setListAction(null)} />
          )}

          {mod && subView === 'coderule' && <CodeRuleScreen module={mod} />}
          {mod && subView === 'category' && mod.code !== 'supp' && mod.code !== 'cust' && <CategoryScreen module={mod} />}
          {mod && subView === 'category' && mod.code === 'supp' && <SupplierCategoryScreen module={mod} />}
          {mod && subView === 'category' && mod.code === 'cust' && <CustomerGroupScreen module={mod} />}
          {mod && subView === 'flow'     && <ApprovalFlowScreen module={mod} />}
          {mod && subView === 'field'    && <CustomFieldScreen module={mod} />}
          {mod && subView === 'policy'   && mod.hasPolicy && <PolicyScreen module={mod} />}
          {mod && subView === 'print'    && mod.hasPrint && <PrintTemplateScreen module={mod} />}

          {topActive !== 'prd' && topActive !== 'set' && side !== 'workbench' && !mod && !side.startsWith('finance') && !side.startsWith('hr') && !side.startsWith('qc') && !side.startsWith('as') && !side.startsWith('mfg') && (
            <Card title={title}>
              <div style={{ color: '#9CA3AF', fontSize: 13, padding: '40px 0', textAlign: 'center' }}>
                此屏未在用户提供的截图中出现，留作后续补全
              </div>
            </Card>
          )}
        </div>
      </div>
      {showModal && <NewContractModal onClose={() => setShowModal(false)} onOpenPicker={setPicker} />}
      {picker === 'person'  && <PersonPickerModal  onClose={() => setPicker(null)} onConfirm={(v) => { console.log(v); setPicker(null); }} />}
      {picker === 'product' && <ProductPickerModal onClose={() => setPicker(null)} onConfirm={(v) => { console.log(v); setPicker(null); }} />}
      {picker === 'order'   && <OrderPickerModal   onClose={() => setPicker(null)} onConfirm={(v) => { console.log(v); setPicker(null); }} />}
    </div>
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
