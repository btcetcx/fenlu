// ui_kits/erp-console/finance-list.jsx
// 财务中心：应收 / 应付 / 发票 / 资金 / 费用 / 成本 / 凭证 / 报表
const { useState: useFinState, useEffect: useFinEffect } = React;

const FINANCE_CONFIG = {
  financeAr: {
    title:'应收管理',
    treeTitle:'应收分类',
    groups:['全部应收','待收款','部分收款','逾期应收','已核销'],
    newLabel:'新增应收',
    codeLabel:'应收单号',
    subjectLabel:'应收主题',
    counterpartyLabel:'客户',
    amountLabel:'应收金额',
    dateLabel:'应收日期',
    statusLabel:'收款状态',
    detailTitle:'应收明细',
    statuses:['待收款','部分收款','已收款','逾期'],
    formFields:['应收来源','关联销售订单','客户','结算方式','账期','到期日期','收款账户','经办人','所属部门'],
    columns:['应收主题','应收单号','客户','应收金额','已收金额','未收金额','到期日期','收款状态'],
    row:{ subject:'2026年5月销售订单应收', code:'AR-202605-001', party:'海南微为科技', amount:'72,390.00', done:'20,000.00', left:'52,390.00', date:'2026-05-31', status:'部分收款' },
    detailRows:[
      ['SO-202605-001','智能温控终端','销售订单','59,590.00','20,000.00','39,590.00','2026-05-31'],
      ['SO-202605-002','运维服务费','服务订单','12,800.00','0.00','12,800.00','2026-06-10'],
    ],
  },
  financeAp: {
    title:'应付管理',
    treeTitle:'应付分类',
    groups:['全部应付','待付款','部分付款','逾期应付','已核销'],
    newLabel:'新增应付',
    codeLabel:'应付单号',
    subjectLabel:'应付主题',
    counterpartyLabel:'供应商',
    amountLabel:'应付金额',
    dateLabel:'应付日期',
    statusLabel:'付款状态',
    detailTitle:'应付明细',
    statuses:['待付款','部分付款','已付款','逾期'],
    formFields:['应付来源','关联采购订单','供应商','付款方式','账期','到期日期','付款账户','经办人','所属部门'],
    columns:['应付主题','应付单号','供应商','应付金额','已付金额','未付金额','到期日期','付款状态'],
    row:{ subject:'采购原材料应付款', code:'AP-202605-001', party:'深圳华芯电子', amount:'95,800.00', done:'30,000.00', left:'65,800.00', date:'2026-05-28', status:'部分付款' },
    detailRows:[
      ['PO-202605-018','工业级LCD显示屏','采购订单','86,200.00','30,000.00','56,200.00','2026-05-28'],
      ['PO-202605-021','包装耗材','采购订单','9,600.00','0.00','9,600.00','2026-06-02'],
    ],
  },
  financeInvoice: {
    title:'发票管理',
    treeTitle:'发票分类',
    groups:['全部发票','待开票','已开票','待认证','异常发票'],
    newLabel:'新增发票',
    codeLabel:'发票申请号',
    subjectLabel:'发票主题',
    counterpartyLabel:'往来单位',
    amountLabel:'价税合计',
    dateLabel:'开票日期',
    statusLabel:'发票状态',
    detailTitle:'发票明细',
    statuses:['待开票','已开票','待认证','已认证','异常'],
    formFields:['发票方向','发票类型','往来单位','纳税人识别号','开户银行','银行账号','开票地址','税率','关联单据'],
    columns:['发票主题','发票申请号','往来单位','发票类型','价税合计','税额','开票日期','发票状态'],
    row:{ subject:'销售订单开票申请', code:'INV-202605-001', party:'海南微为科技', amount:'72,390.00', done:'6,214.53', left:'66,175.47', date:'2026-05-21', status:'待开票' },
    detailRows:[
      ['SO-202605-001','智能温控终端','增值税专用发票','54,100.00','5,490.00','59,590.00','13%'],
      ['SO-202605-002','运维服务费','增值税普通发票','12,075.47','724.53','12,800.00','6%'],
    ],
  },
  financeFund: {
    title:'资金管理',
    treeTitle:'资金账户',
    groups:['全部账户','银行账户','现金账户','支付宝/微信','承兑汇票'],
    newLabel:'新增资金流水',
    codeLabel:'流水号',
    subjectLabel:'流水主题',
    counterpartyLabel:'往来单位',
    amountLabel:'发生金额',
    dateLabel:'发生日期',
    statusLabel:'流水状态',
    detailTitle:'资金流水明细',
    statuses:['待确认','已确认','已冲销','异常'],
    formFields:['收支方向','资金账户','往来单位','结算方式','关联单据','发生日期','经办人','复核人','所属部门'],
    columns:['流水主题','流水号','资金账户','收支方向','发生金额','账户余额','发生日期','流水状态'],
    row:{ subject:'客户回款入账', code:'FUND-202605-001', party:'招商银行基本户', amount:'20,000.00', done:'收入', left:'386,450.00', date:'2026-05-17', status:'已确认' },
    detailRows:[
      ['AR-202605-001','客户回款','收入','20,000.00','招商银行基本户','银行转账','已确认'],
      ['AP-202605-001','供应商付款','支出','30,000.00','建设银行一般户','银行转账','已确认'],
    ],
  },
  financeExpense: {
    title:'费用报销',
    treeTitle:'费用分类',
    groups:['全部费用','差旅费','办公费','招待费','物流费','其他费用'],
    newLabel:'新增报销',
    codeLabel:'报销单号',
    subjectLabel:'报销主题',
    counterpartyLabel:'报销人',
    amountLabel:'报销金额',
    dateLabel:'申请日期',
    statusLabel:'审批状态',
    detailTitle:'费用明细',
    statuses:['草稿','审批中','待付款','已付款','驳回'],
    formFields:['费用类型','报销人','所属部门','收款账户','费用期间','付款方式','关联项目','关联客户','审批流程'],
    columns:['报销主题','报销单号','报销人','费用类型','报销金额','申请日期','付款日期','审批状态'],
    row:{ subject:'销售部差旅报销', code:'EXP-202605-001', party:'张园', amount:'4,860.00', done:'差旅费', left:'2026-05-20', date:'2026-05-16', status:'审批中' },
    detailRows:[
      ['交通费','深圳客户拜访','1,260.00','2026-05-12','销售部','张园','待审批'],
      ['住宿费','深圳客户拜访','2,400.00','2026-05-13','销售部','张园','待审批'],
    ],
  },
  financeCost: {
    title:'成本核算',
    treeTitle:'成本分类',
    groups:['全部成本','材料成本','人工成本','制造费用','期间费用'],
    newLabel:'新增核算单',
    codeLabel:'核算单号',
    subjectLabel:'核算主题',
    counterpartyLabel:'成本中心',
    amountLabel:'核算金额',
    dateLabel:'核算期间',
    statusLabel:'核算状态',
    detailTitle:'成本明细',
    statuses:['待核算','核算中','已核算','异常'],
    formFields:['核算期间','核算对象','成本中心','核算方法','分摊规则','关联工单','产品范围','经办人','复核人'],
    columns:['核算主题','核算单号','成本中心','核算对象','核算金额','核算期间','复核人','核算状态'],
    row:{ subject:'5月成品成本核算', code:'COST-202605-001', party:'生产一部', amount:'286,000.00', done:'成品', left:'王财务', date:'2026-05', status:'核算中' },
    detailRows:[
      ['WO-202605-003','智能温控终端','材料成本','126,000.00','生产一部','按工单分摊','核算中'],
      ['WO-202605-003','智能温控终端','制造费用','48,000.00','生产一部','按工时分摊','核算中'],
    ],
  },
  financeVoucher: {
    title:'凭证管理',
    treeTitle:'凭证分类',
    groups:['全部凭证','待审核','已审核','已过账','已作废'],
    newLabel:'新增凭证',
    codeLabel:'凭证号',
    subjectLabel:'凭证摘要',
    counterpartyLabel:'制单人',
    amountLabel:'借贷金额',
    dateLabel:'凭证日期',
    statusLabel:'凭证状态',
    detailTitle:'凭证明细',
    statuses:['待审核','已审核','已过账','已作废'],
    formFields:['凭证字','凭证日期','会计期间','附件张数','来源单据','制单人','审核人','过账人','所属账套'],
    columns:['凭证摘要','凭证号','会计期间','借方金额','贷方金额','制单人','凭证日期','凭证状态'],
    row:{ subject:'客户回款确认', code:'记-202605-001', party:'2026-05', amount:'20,000.00', done:'20,000.00', left:'王会计', date:'2026-05-17', status:'待审核' },
    detailRows:[
      ['1002 银行存款','借方','20,000.00','0.00','客户回款确认','AR-202605-001','待审核'],
      ['1122 应收账款','贷方','0.00','20,000.00','客户回款确认','AR-202605-001','待审核'],
    ],
  },
  financeReport: {
    title:'财务报表',
    treeTitle:'报表分类',
    groups:['经营报表','往来报表','资金报表','成本报表','税务报表'],
    newLabel:'新增报表',
    codeLabel:'报表编号',
    subjectLabel:'报表名称',
    counterpartyLabel:'编制人',
    amountLabel:'本期金额',
    dateLabel:'报表期间',
    statusLabel:'报表状态',
    detailTitle:'报表项目',
    statuses:['未生成','已生成','已确认','已归档'],
    formFields:['报表类型','报表期间','数据范围','取数口径','编制人','复核人','所属账套','生成方式','报表模板'],
    columns:['报表名称','报表编号','报表类型','本期金额','上期金额','报表期间','编制人','报表状态'],
    row:{ subject:'资产负债表', code:'RPT-202605-001', party:'经营报表', amount:'1,286,000.00', done:'1,180,000.00', left:'王会计', date:'2026-05', status:'已生成' },
    detailRows:[
      ['货币资金','资产','386,450.00','360,000.00','26,450.00','自动取数','已确认'],
      ['应收账款','资产','152,300.00','130,000.00','22,300.00','自动取数','已确认'],
    ],
  },
};

function FinanceTone({ status }) {
  if (['已收款','已付款','已开票','已认证','已勾稽','已对账','已确认','已核销','已过账','已核算','已审核','已生成','已归档'].includes(status)) return <Badge tone="g">{status}</Badge>;
  if (['逾期','异常','驳回','已作废'].includes(status)) return <Badge tone="r">{status}</Badge>;
  return <Badge tone="y">{status}</Badge>;
}

const FINANCE_DETAIL_COLUMNS = {
  '应收管理':['来源单据','销售/项目','业务类型','应收金额','已收金额','未收金额','到期日'],
  '应付管理':['来源单据','采购/项目','业务类型','应付金额','已付金额','未付金额','到期日'],
  '发票管理':['关联单据','商品/服务','发票类型','未税金额','税额','价税合计','税率'],
  '资金管理':['关联单据','流水用途','收支方向','发生金额','资金账户','结算方式','状态'],
  '费用报销':['费用类型','费用说明','金额','发生日期','部门','报销人','状态'],
  '成本核算':['来源工单','核算对象','成本项目','金额','成本中心','分摊规则','状态'],
  '凭证管理':['会计科目','方向','借方金额','贷方金额','摘要','来源单据','状态'],
  '财务报表':['报表项目','项目类型','本期金额','上期金额','增减额','取数方式','状态'],
};

const FINANCE_DETAIL_TABS = {
  '应收管理':[
    {k:'info', label:'单据信息'}, {k:'settle', label:'收款核销'}, {k:'aging', label:'账龄分析'}, {k:'voucher', label:'凭证记录'}, {k:'attach', label:'附件记录'}, {k:'op', label:'操作记录'},
  ],
  '应付管理':[
    {k:'info', label:'单据信息'}, {k:'settle', label:'付款核销'}, {k:'aging', label:'账龄分析'}, {k:'voucher', label:'凭证记录'}, {k:'attach', label:'附件记录'}, {k:'op', label:'操作记录'},
  ],
  '发票管理':[
    {k:'info', label:'发票信息'}, {k:'match', label:'发票勾稽'}, {k:'tax', label:'税务认证'}, {k:'voucher', label:'凭证记录'}, {k:'attach', label:'附件记录'}, {k:'op', label:'操作记录'},
  ],
  '资金管理':[
    {k:'info', label:'流水信息'}, {k:'reconcile', label:'银行对账'}, {k:'settle', label:'收付核销'}, {k:'voucher', label:'凭证记录'}, {k:'attach', label:'附件记录'}, {k:'op', label:'操作记录'},
  ],
  '凭证管理':[
    {k:'info', label:'凭证信息'}, {k:'posting', label:'过账/反过账'}, {k:'source', label:'来源单据'}, {k:'attach', label:'附件记录'}, {k:'op', label:'操作记录'},
  ],
};

function FinanceDetailColumns(config) {
  return FINANCE_DETAIL_COLUMNS[config.title] || ['关联单据','项目名称','项目类型','金额','已处理金额','未处理金额','日期/税率'];
}

function FinanceActionProfile(config, action) {
  const isAr = config.title === '应收管理';
  const isAp = config.title === '应付管理';
  if (isAr && /收款|核销/.test(action)) {
    return {
      statusLabel:'核销状态',
      statuses:['待核销','部分核销','已核销','异常'],
      columns:['收款单号','客户','收款金额','可核销金额','本次核销','应收单号','到账账户','到账日期'],
      rows:[
        ['RCV-202605-001','海南微为科技','20,000.00','20,000.00','20,000.00','AR-202605-001','招商银行基本户','2026-05-17','已核销'],
        ['RCV-202605-002','广州新域智能','12,800.00','12,800.00','8,600.00','AR-202605-002','建设银行一般户','2026-05-18','部分核销'],
        ['RCV-202605-003','深圳云启制造','36,800.00','36,800.00','0.00','AR-202605-003','招商银行基本户','2026-05-20','待核销'],
      ],
      newLabel:'新增收款核销',
    };
  }
  if (isAp && /付款|核销/.test(action)) {
    return {
      statusLabel:'核销状态',
      statuses:['待核销','部分核销','已核销','异常'],
      columns:['付款单号','供应商','付款金额','可核销金额','本次核销','应付单号','付款账户','付款日期'],
      rows:[
        ['PAY-202605-001','深圳华芯电子','30,000.00','30,000.00','30,000.00','AP-202605-001','建设银行一般户','2026-05-17','已核销'],
        ['PAY-202605-002','东莞科创包装','9,600.00','9,600.00','4,000.00','AP-202605-002','招商银行基本户','2026-05-18','部分核销'],
        ['PAY-202605-003','广州物流服务','18,600.00','18,600.00','0.00','AP-202605-003','建设银行一般户','2026-05-20','待核销'],
      ],
      newLabel:'新增付款核销',
    };
  }
  if (/对账|账龄/.test(action) || (isAr || isAp) && /统计/.test(action)) {
    return {
      statusLabel:'风险状态',
      statuses:['正常','临期','逾期','坏账风险'],
      columns:['往来单位','单据编号','余额','0-30天','31-60天','61-90天','90天以上','责任人'],
      rows:[
        [config.row.party, config.row.code, config.row.left, '18,000.00', '12,000.00', '6,800.00', '2,790.00', '王会计','逾期'],
        ['广州新域智能', config.row.code.replace('001','002'), '36,800.00', '36,800.00', '0.00', '0.00', '0.00', '李会计','正常'],
        ['深圳云启制造', config.row.code.replace('001','003'), '9,800.00', '0.00', '0.00', '9,800.00', '0.00', '王会计','临期'],
      ],
      newLabel:'生成账龄分析',
    };
  }
  if (config.title === '发票管理' && /勾稽|开票|收票|认证/.test(action)) {
    return {
      statusLabel:'勾稽状态',
      statuses:['待勾稽','部分勾稽','已勾稽','异常'],
      columns:['发票号码','往来单位','发票类型','价税合计','已勾稽金额','关联订单','应收/应付单','税务状态'],
      rows:[
        ['044002600111','海南微为科技','销项专票','59,590.00','59,590.00','SO-202605-001','AR-202605-001','已勾稽','已勾稽'],
        ['044002600112','深圳华芯电子','进项专票','86,200.00','30,000.00','PO-202605-018','AP-202605-001','待认证','部分勾稽'],
        ['044002600113','广州新域智能','销项普票','12,800.00','0.00','SO-202605-002','AR-202605-002','待开票','待勾稽'],
      ],
      newLabel:/认证/.test(action) ? '新增收票认证' : '新增发票勾稽',
    };
  }
  if (config.title === '资金管理' && /对账|账户|流水|调拨/.test(action)) {
    return {
      statusLabel:'对账状态',
      statuses:['待对账','已对账','差异待处理','已冲销'],
      columns:['银行流水号','资金账户','收支方向','银行金额','系统金额','差异金额','关联单据','交易日期'],
      rows:[
        ['BNK-202605-001','招商银行基本户','收入','20,000.00','20,000.00','0.00','RCV-202605-001','2026-05-17','已对账'],
        ['BNK-202605-002','建设银行一般户','支出','30,020.00','30,000.00','20.00','PAY-202605-001','2026-05-17','差异待处理'],
        ['BNK-202605-003','招商银行基本户','收入','12,800.00','0.00','12,800.00','待匹配','2026-05-18','待对账'],
      ],
      newLabel:'导入银行对账单',
    };
  }
  if (config.title === '凭证管理' && /审核|过账|结账|反过账/.test(action)) {
    return {
      statusLabel:'过账状态',
      statuses:['待审核','已审核','已过账','已反过账'],
      columns:['凭证号','会计期间','摘要','借方金额','贷方金额','审核人','过账人','过账时间'],
      rows:[
        ['记-202605-001','2026-05','客户回款确认','20,000.00','20,000.00','王会计','财务主管','2026-05-17 16:00','已过账'],
        ['记-202605-002','2026-05','供应商付款确认','30,000.00','30,000.00','王会计','待处理','-','已审核'],
        ['记-202605-003','2026-05','银行手续费冲销','20.00','20.00','待审核','-','-','待审核'],
      ],
      newLabel:'批量过账',
    };
  }
  return null;
}

function FinanceTree({ config, picked, setPicked }) {
  return (
    <div className="aw-doc-tree">
      <div className="aw-doc-tree-h">{config.treeTitle} <span className="aw-doc-tree-n">(999)</span></div>
      <div className="aw-doc-tree-list">
        {config.groups.map((group, idx) => (
          <div key={group} className={'aw-tree-row aw-tree-l2' + (picked === group ? ' on' : '')} onClick={() => setPicked(group)}>
            <span className="aw-tree-caret">{idx === 0 ? '▾' : ''}</span>
            <TileIcon name={idx === 0 ? 'folder' : 'doc'} size={14} />
            <span>{group}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FinanceRows(config) {
  const base = config.row;
  return [
    base,
    { ...base, code: base.code.replace('001','002'), subject: config.groups[1] + '示例', amount:'36,800.00', done:'0.00', left:'36,800.00', status:config.statuses[0] },
    { ...base, code: base.code.replace('001','003'), subject: config.groups[2] + '示例', amount:'18,600.00', done:'18,600.00', left:'0.00', status:config.statuses[2] || config.statuses[0] },
    { ...base, code: base.code.replace('001','004'), subject: config.groups[3] + '示例', amount:'9,800.00', done:'0.00', left:'9,800.00', status:config.statuses[3] || config.statuses[0] },
  ];
}

function FinanceListView({ config, onNew, onView }) {
  const [sel, setSel] = useFinState({0:true,1:true});
  const [status, setStatus] = useFinState('');
  const rows = FinanceRows(config).filter(r => !status || r.status === status);
  const allChecked = rows.length > 0 && rows.every((_, i) => sel[i]);
  const someChecked = rows.some((_, i) => sel[i]);
  const toggleAll = () => {
    if (allChecked) setSel({});
    else {
      const next = {};
      rows.forEach((_, i) => next[i] = true);
      setSel(next);
    }
  };
  const toggleRow = i => setSel(s => ({...s, [i]: !s[i]}));
  const extraLabels = {
    '应收管理':['已收金额','未收金额'],
    '应付管理':['已付金额','未付金额'],
    '发票管理':['税额','未税金额'],
    '资金管理':['收支方向','账户余额'],
    '费用报销':['费用类型','付款日期'],
    '成本核算':['核算对象','复核人'],
    '凭证管理':['贷方金额','制单人'],
    '财务报表':['上期金额','编制人'],
  }[config.title] || ['已处理金额','未处理金额'];
  const listColumns = [config.subjectLabel, config.codeLabel, config.counterpartyLabel, config.amountLabel, extraLabels[0], extraLabels[1], config.dateLabel];
  return (
    <>
      <PurchaseListToolbar searchPlaceholder={`全局搜索（如${config.subjectLabel}、${config.codeLabel}、${config.counterpartyLabel}）`} newLabel={config.newLabel} onNew={onNew} />
      <div className="aw-doc-tbl-wrap">
        <div className="aw-doc-tbl-inner">
          <table className="aw-doc-tbl">
            <thead>
              <tr>
                <PurchaseSelectHeader checked={allChecked} indeterminate={someChecked} onToggle={toggleAll} />
                <PurchaseIndexHeader />
                {listColumns.map(col => <th key={col}><div className="aw-th-inner">{col}</div></th>)}
                <PurchaseStatusFilterHeader label={config.statusLabel} value={status} onChange={setStatus} options={config.statuses} width={150} />
                <th style={{width:90}}><div className="aw-th-inner">操作</div></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.code} onClick={() => onView(r)} style={{cursor:'pointer'}}>
                  <PurchaseSelectCell checked={!!sel[i]} onToggle={() => toggleRow(i)} />
                  <td>{i + 1}</td>
                  <td className="aw-link">{r.subject}</td>
                  <td className="aw-num">{r.code}</td>
                  <td>{r.party}</td>
                  <td className="aw-num">{r.amount}</td>
                  <td className="aw-num">{r.done}</td>
                  <td className="aw-num">{r.left}</td>
                  <td className="aw-num">{r.date}</td>
                  <td><FinanceTone status={r.status} /></td>
                  <td><span className="aw-link" onClick={e => { e.stopPropagation(); onView(r); }}>查看</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <PurchaseListFooter total={800} selectedCount={Object.values(sel).filter(Boolean).length} allChecked={allChecked} someChecked={someChecked} onToggleAll={toggleAll} pages={23} />
    </>
  );
}

function FinanceAttachmentBlock() {
  return (
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(180px,1fr))',gap:12}}>
      {['银行回单.pdf','合同附件.pdf','对账单.xlsx'].map((name, idx) => (
        <div key={name} style={{border:'1px dashed var(--aw-border-strong)',padding:14,minHeight:92}}>
          <div>{name}</div>
          <div style={{fontSize:12,color:'var(--aw-fg-3)',marginTop:10}}>文件大小：{idx ? '128KB' : '0 Bytes'}</div>
          <div style={{fontSize:12,color:'var(--aw-fg-3)',marginTop:6}}>上传日期：2026-05-17 14:52</div>
          <div style={{display:'flex',gap:14,marginTop:16}}><span className="aw-link">查看</span><span className="aw-link">下载</span></div>
        </div>
      ))}
    </div>
  );
}

function FinanceFormView({ config, onBack }) {
  const [rows, setRows] = useFinState(config.detailRows.slice(0, 2));
  return (
    <PurchaseFormPage onBack={onBack} submitText="提交审批">
      <PurchaseSection title="基础信息">
        <div className="aw-doc-grid">
          <Field label={config.subjectLabel} req><Input placeholder={`填写${config.subjectLabel}`} /></Field>
          <Field label={config.codeLabel}><Input defaultValue="自动生成" disabled /></Field>
          <Field label={config.statusLabel}><Select><option>{config.statuses[0]}</option><option>{config.statuses[1]}</option></Select></Field>
          {config.formFields.map((label, idx) => (
            <Field key={label} label={label} req={idx < 3}>
              {['类型','方式','流程','账户','来源','范围','期间','日期','账期','对象','模板','口径','方向'].some(key => label.includes(key))
                ? <Select><option>请选择</option><option>{label}一</option><option>{label}二</option></Select>
                : <Input placeholder={`填写${label}`} />}
            </Field>
          ))}
        </div>
      </PurchaseSection>
      <PurchaseSection title={config.detailTitle}>
        <PurchaseDetailTable
          columns={FinanceDetailColumns(config).map(label => ({label}))}
          rows={rows}
          renderRow={(row, idx) => (
            <tr key={idx}>
              <PurchaseDetailIndexCell index={idx} />
              {row.map((cell, cidx) => <td key={cidx}>{cidx >= 3 && cidx <= 5 ? <Input defaultValue={cell} /> : cell}</td>)}
              <PurchaseDetailActions onDelete={() => setRows(rs => rs.filter((_, i) => i !== idx))} />
            </tr>
          )}
        />
        <PurchaseAddDetailButton onClick={() => setRows(rs => [...rs, ['手动录入','新增项目','费用/往来','0.00','0.00','0.00','2026-05-17']])} />
      </PurchaseSection>
      <PurchaseSection title="详情">
        <PurchaseRichText placeholder="请输入财务说明、核算口径、付款/收款条件、异常处理意见等..." />
      </PurchaseSection>
      <PurchaseSection title="附件">
        <div style={{border:'1px dashed var(--aw-border-strong)',padding:24,textAlign:'center',color:'var(--aw-fg-3)'}}>
          <span className="aw-link">点击上传</span> / 拖拽到此区域
        </div>
      </PurchaseSection>
    </PurchaseFormPage>
  );
}

function FinanceKV({ label, value }) {
  return <div style={{display:'flex',gap:14}}><span style={{width:96,color:'var(--aw-fg-3)',flex:'none'}}>{label}：</span><span>{value}</span></div>;
}

function FinanceDetailView({ config, row, onBack }) {
  const [tab, setTab] = useFinState('info');
  const tabs = FINANCE_DETAIL_TABS[config.title] || [
    {k:'info', label:'单据信息'},
    {k:'flow', label:'处理记录'},
    {k:'voucher', label:'凭证记录'},
    {k:'attach', label:'附件记录'},
    {k:'op', label:'操作记录'},
  ];
  return (
    <div className="aw-doc-form">
      <div className="aw-doc-form-body">
        <DetailHeaderCard
          title={`${row.subject} ${row.code}`}
          status={row.status}
          onBack={onBack}
          creator="王会计"
          createdAt="2026-05-17 10:25"
          modifier="财务主管"
          modifiedAt="2026-05-17 15:30"
          detailItems={[
            [config.codeLabel, row.code],
            [config.counterpartyLabel, row.party],
            [config.amountLabel, row.amount],
            [config.dateLabel, row.date],
            [config.statusLabel, row.status],
          ]}
        />
        <Card>
          <div className="aw-tabs" style={{marginBottom:14}}>
            {tabs.map(t => <span key={t.k} className={'aw-tab ' + (tab === t.k ? 'on' : '')} onClick={() => setTab(t.k)}>{t.label}</span>)}
          </div>
          {tab === 'info' && (
            <>
              <PurchaseSection title="基础信息">
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',rowGap:16,columnGap:80,fontSize:13}}>
                  <FinanceKV label={config.subjectLabel} value={row.subject} />
                  <FinanceKV label={config.codeLabel} value={row.code} />
                  <FinanceKV label={config.counterpartyLabel} value={row.party} />
                  <FinanceKV label={config.amountLabel} value={row.amount} />
                  <FinanceKV label={config.dateLabel} value={row.date} />
                  <FinanceKV label={config.statusLabel} value={<FinanceTone status={row.status} />} />
                </div>
              </PurchaseSection>
              <PurchaseSection title={config.detailTitle}>
                <table className="aw-table">
                  <thead><tr><th>序号</th>{FinanceDetailColumns(config).map(col => <th key={col}>{col}</th>)}</tr></thead>
                  <tbody>{config.detailRows.map((r, i) => <tr key={i}><td>{i + 1}</td>{r.map((c, idx) => <td key={idx}>{c}</td>)}</tr>)}</tbody>
                </table>
              </PurchaseSection>
              <PurchaseSection title="详情">
                <div style={{fontSize:13,lineHeight:1.8,color:'var(--aw-fg-2)'}}>
                  本单据来源于业务系统自动归集，并由财务人员复核确认。金额、税额、往来单位、账期及关联单据需要与销售、采购、仓储等模块保持一致；如发生差异，应在处理记录中登记差异原因并触发对应审批。
                </div>
              </PurchaseSection>
            </>
          )}
          {tab === 'settle' && <FinanceRecordTable cols={config.title === '应付管理' ? ['付款单号','付款账户','付款金额','核销金额','未核销金额','核销状态'] : ['收款单号','收款账户','收款金额','核销金额','未核销金额','核销状态']} />}
          {tab === 'aging' && <FinanceRecordTable cols={['账龄区间','期初余额','本期增加','本期核销','期末余额','风险等级']} />}
          {tab === 'match' && <FinanceRecordTable cols={['发票号码','关联订单','应收/应付单','未税金额','税额','勾稽状态']} />}
          {tab === 'tax' && <FinanceRecordTable cols={['认证批次','认证平台','认证税额','认证日期','认证人','认证状态']} />}
          {tab === 'reconcile' && <FinanceRecordTable cols={['银行流水号','系统流水号','银行金额','系统金额','差异金额','对账状态']} />}
          {tab === 'posting' && <FinanceRecordTable cols={['处理类型','会计期间','处理人','处理时间','影响凭证','处理结果']} />}
          {tab === 'source' && <FinanceRecordTable cols={['来源模块','来源单据','业务类型','关联金额','生成时间','同步状态']} />}
          {tab === 'flow' && <FinanceRecordTable cols={['处理节点','处理人','处理结果','处理时间','备注']} />}
          {tab === 'voucher' && <FinanceRecordTable cols={['凭证号','摘要','借方金额','贷方金额','凭证状态']} />}
          {tab === 'attach' && <FinanceAttachmentBlock />}
          {tab === 'op' && <FinanceRecordTable cols={['操作类型','操作人','操作时间','操作内容','结果']} />}
        </Card>
      </div>
    </div>
  );
}

function FinanceActionRows(config, action) {
  return FinanceRows(config).map((row, idx) => ({
    ...row,
    subject: idx === 0 ? action : `${action}示例${idx}`,
    code: row.code.replace('001', String(idx + 1).padStart(3, '0')),
  }));
}

function FinanceProfileDetailRow(config, row) {
  const status = row[row.length - 1];
  if (config.title === '应收管理') {
    return { ...config.row, subject:`${row[1]}收款核销`, code:row[0], party:row[1], amount:row[2], done:row[4], left:(Number(String(row[3]).replace(/,/g,'')) - Number(String(row[4]).replace(/,/g,''))).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2}), date:row[7], status };
  }
  if (config.title === '应付管理') {
    return { ...config.row, subject:`${row[1]}付款核销`, code:row[0], party:row[1], amount:row[2], done:row[4], left:(Number(String(row[3]).replace(/,/g,'')) - Number(String(row[4]).replace(/,/g,''))).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2}), date:row[7], status };
  }
  return { ...config.row, subject:String(row[0] || config.row.subject), code:String(row[0] || config.row.code), amount:row[2] || config.row.amount, date:row[row.length - 2] || config.row.date, status };
}

function FinanceActionView({ config, action, onNew, onBack, onView }) {
  const [sel, setSel] = useFinState({0:true});
  const [status, setStatus] = useFinState('');
  const profile = FinanceActionProfile(config, action);
  const rows = profile
    ? profile.rows.filter(row => !status || row[row.length - 1] === status)
    : FinanceActionRows(config, action).filter(row => !status || row.status === status);
  const allChecked = rows.length > 0 && rows.every((_, i) => sel[i]);
  const someChecked = rows.some((_, i) => sel[i]);
  const toggleAll = () => {
    if (allChecked) setSel({});
    else {
      const next = {};
      rows.forEach((_, i) => next[i] = true);
      setSel(next);
    }
  };
  const toggleRow = i => setSel(s => ({...s, [i]: !s[i]}));
  return (
    <>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
        <span className="aw-link" onClick={onBack}>← 返回{config.title}</span>
        <span style={{fontSize:13,color:'var(--aw-fg-3)'}}>当前页面：{action}</span>
      </div>
      <PurchaseListToolbar searchPlaceholder={`全局搜索（如${action}、${config.codeLabel}、${config.counterpartyLabel}）`} newLabel={profile ? profile.newLabel : (action.startsWith('新增') ? action : `新增${action.replace(/列表|详情|统计|管理|记录|认证|发放|申请/g, '') || config.title}`)} onNew={onNew} />
      <div className="aw-doc-tbl-wrap">
        <div className="aw-doc-tbl-inner">
          <table className="aw-doc-tbl">
            <thead>
              <tr>
                <PurchaseSelectHeader checked={allChecked} indeterminate={someChecked} onToggle={toggleAll} />
                <PurchaseIndexHeader />
                {(profile ? profile.columns : [`${action}主题`,'单据编号',config.counterpartyLabel,config.amountLabel,'已处理','未处理',config.dateLabel]).map(col => <th key={col}><div className="aw-th-inner">{col}</div></th>)}
                <PurchaseStatusFilterHeader label={profile ? profile.statusLabel : config.statusLabel} value={status} onChange={setStatus} options={profile ? profile.statuses : config.statuses} width={150} />
                <th style={{width:90}}><div className="aw-th-inner">操作</div></th>
              </tr>
            </thead>
            <tbody>{rows.map((row, idx) => profile ? (
              <tr key={row[0] + idx} onClick={() => onView(FinanceProfileDetailRow(config, row))} style={{cursor:'pointer'}}>
                <PurchaseSelectCell checked={!!sel[idx]} onToggle={() => toggleRow(idx)} />
                <td>{idx + 1}</td>
                {row.slice(0, -1).map((cell, cidx) => <td key={cidx} className={/金额|余额|税额|日期|时间|编号|号/.test(profile.columns[cidx]) ? 'aw-num' : ''}>{cidx === 0 ? <span className="aw-link">{cell}</span> : cell}</td>)}
                <td><FinanceTone status={row[row.length - 1]} /></td>
                <td><span className="aw-link" onClick={e => { e.stopPropagation(); onView(FinanceProfileDetailRow(config, row)); }}>查看</span></td>
              </tr>
            ) : (
              <tr key={row.code} onClick={() => onView(row)} style={{cursor:'pointer'}}>
                <PurchaseSelectCell checked={!!sel[idx]} onToggle={() => toggleRow(idx)} />
                <td>{idx + 1}</td>
                <td className="aw-link">{row.subject}</td>
                <td className="aw-num">{row.code}</td>
                <td>{row.party}</td>
                <td className="aw-num">{row.amount}</td>
                <td className="aw-num">{row.done}</td>
                <td className="aw-num">{row.left}</td>
                <td className="aw-num">{row.date}</td>
                <td><FinanceTone status={row.status} /></td>
                <td><span className="aw-link" onClick={e => { e.stopPropagation(); onView(row); }}>查看</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
      <PurchaseListFooter total={800} selectedCount={Object.values(sel).filter(Boolean).length} allChecked={allChecked} someChecked={someChecked} onToggleAll={toggleAll} pages={23} />
    </>
  );
}

function FinanceRecordTable({ cols }) {
  return (
    <table className="aw-table">
      <thead><tr><th>序号</th>{cols.map(c => <th key={c}>{c}</th>)}</tr></thead>
      <tbody>
        {[1,2,3].map(i => <tr key={i}><td>{i}</td>{cols.map((c, idx) => <td key={c}>{idx === 0 ? `${c}示例` : idx === 2 ? '通过' : idx === 3 ? '2026-05-17 15:30' : '系统自动生成'}</td>)}</tr>)}
      </tbody>
    </table>
  );
}

function FinanceModuleScreen({ moduleKey, initialAction, onActionConsumed }) {
  const config = FINANCE_CONFIG[moduleKey] || FINANCE_CONFIG.financeAr;
  const [view, setView] = useFinState('list');
  const [picked, setPicked] = useFinState(config.groups[0]);
  const [detail, setDetail] = useFinState(config.row);
  const [actionTitle, setActionTitle] = useFinState('');
  useFinEffect(() => {
    if (initialAction === 'new') {
      setView('new');
      onActionConsumed && onActionConsumed();
    } else if (initialAction && initialAction.includes('列表')) {
      setView('list');
      setActionTitle('');
      onActionConsumed && onActionConsumed();
    } else if (initialAction) {
      setActionTitle(initialAction);
      setView('action');
      onActionConsumed && onActionConsumed();
    }
  }, [initialAction]);
  return (
    <div className="aw-doc-page">
      {view === 'list' && <FinanceTree config={config} picked={picked} setPicked={setPicked} />}
      <div className="aw-doc-main" style={{maxWidth:'none'}}>
        {view === 'list' && <FinanceListView config={config} onNew={() => setView('new')} onView={(row) => { setDetail(row); setView('detail'); }} />}
        {view === 'action' && <FinanceActionView config={config} action={actionTitle || config.title} onNew={() => setView('new')} onBack={() => setView('list')} onView={(row) => { setDetail(row); setView('detail'); }} />}
        {view === 'new' && <FinanceFormView config={config} onBack={() => setView('list')} />}
        {view === 'detail' && <FinanceDetailView config={config} row={detail} onBack={() => setView('list')} />}
      </div>
    </div>
  );
}

window.FinanceModuleScreen = FinanceModuleScreen;
