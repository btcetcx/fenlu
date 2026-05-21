// settings-center.jsx — 设置中心专用页面
// Scope: only used when top navigation is "设置".
const { useState: useSettingsState } = React;

const SETTING_MODULE_GUIDES = [
  {
    key: 'rd',
    name: '研发中心',
    owner: '研发管理员',
    progress: 86,
    status: '进行中',
    steps: ['基础资料', '编码规则', '分类字段', '审批流程', '打印策略'],
    focus: '文档、项目、产品、物料、工艺基础设置',
  },
  {
    key: 'pur',
    name: '采购中心',
    owner: '采购管理员',
    progress: 72,
    status: '进行中',
    steps: ['供应商', '请购', '询价', '采购订单', '退换货'],
    focus: '供应商准入、采购流程、采购打印模板',
  },
  {
    key: 'sale',
    name: '销售中心',
    owner: '销售管理员',
    progress: 68,
    status: '待完善',
    steps: ['客户', '销售计划', '报价', '合同', '订单'],
    focus: '客户分组、合同审批、订单状态规则',
  },
  {
    key: 'as',
    name: '售后中心',
    owner: '售后管理员',
    progress: 64,
    status: '待完善',
    steps: ['服务单', '退换货', '退款退货', '售后处理', '质量改进'],
    focus: '售后工单、退换货策略、质量问题闭环',
  },
  {
    key: 'wh',
    name: '仓储中心',
    owner: '仓储管理员',
    progress: 80,
    status: '进行中',
    steps: ['库存', '入库', '出库', '调拨', '盘点'],
    focus: '库位策略、出入库流转、盘点差异处理',
  },
  {
    key: 'mfg',
    name: '生产中心',
    owner: '生产管理员',
    progress: 61,
    status: '待完善',
    steps: ['需求', '计划', '订单', '工单', '排班'],
    focus: '计划排程、工单流转、委外加工策略',
  },
  {
    key: 'qc',
    name: '质检中心',
    owner: '质检管理员',
    progress: 74,
    status: '进行中',
    steps: ['质检方案', '检验项目', '检验组', '报告', '放行规则'],
    focus: '抽样规则、检验标准、放行审批',
  },
  {
    key: 'fin',
    name: '财务中心',
    owner: '财务管理员',
    progress: 58,
    status: '待完善',
    steps: ['应收', '应付', '发票', '资金', '凭证'],
    focus: '核算科目、发票规则、凭证模板',
  },
  {
    key: 'hr',
    name: '人力中心',
    owner: '人事管理员',
    progress: 69,
    status: '进行中',
    steps: ['员工', '组织', '岗位', '考勤', '薪酬'],
    focus: '组织岗位、考勤排班、薪酬归档',
  },
  {
    key: 'oa',
    name: '办公中心',
    owner: '办公管理员',
    progress: 55,
    status: '待完善',
    steps: ['公告通知', '流程审批', '会议', '日程', '用车'],
    focus: '办公审批、通知触达、会议和日程协同',
  },
  {
    key: 'eq',
    name: '设备中心',
    owner: '设备管理员',
    progress: 50,
    status: '待完善',
    steps: ['设备台账', '保养计划', '维修记录', '点检记录', '备件'],
    focus: '设备档案、保养周期、维修派工规则',
  },
  {
    key: 'en',
    name: '能耗中心',
    owner: '能耗管理员',
    progress: 48,
    status: '待完善',
    steps: ['能耗监测', '能耗分析', '能耗报表', '节能措施', '碳排放'],
    focus: '采集点、告警阈值、报表和碳核算规则',
  },
];

const SETTING_SYSTEM_ROWS = [
  { name: '企业基础信息', scope: '全局', owner: '系统管理员', updated: '2026-05-18 09:20', enabled: true },
  { name: '登录安全参数', scope: '账号安全', owner: '安全管理员', updated: '2026-05-17 18:36', enabled: true },
  { name: '消息通知渠道', scope: '站内信 / 短信 / 邮件', owner: '运维管理员', updated: '2026-05-16 14:10', enabled: true },
  { name: '数据备份策略', scope: '每日增量 / 每周全量', owner: '运维管理员', updated: '2026-05-15 23:00', enabled: false },
];

const SETTING_BUSINESS_PARAMS = [
  { name: '多币种配置', scope: '采购 / 销售 / 财务', owner: '财务管理员', updated: '2026-05-21 10:00', enabled: true, tab: 'currency' },
  { name: '税率配置', scope: '报价 / 采购 / 发票', owner: '财务管理员', updated: '2026-05-20 15:42', enabled: true, tab: 'tax' },
  { name: '会计期间', scope: '财务结账 / 成本核算', owner: '财务管理员', updated: '2026-05-19 17:10', enabled: true, tab: 'period' },
  { name: '价格精度规则', scope: '销售 / 采购 / 库存成本', owner: '系统管理员', updated: '2026-05-18 11:26', enabled: true, tab: 'precision' },
];

const SETTING_CURRENCY_ROWS = [
  { code: 'CNY', name: '人民币', symbol: '¥', rate: '1.0000', decimal: 2, rounding: '四舍五入', scope: '本位币', enabled: true, updated: '2026-05-21' },
  { code: 'USD', name: '美元', symbol: '$', rate: '7.1800', decimal: 2, rounding: '四舍五入', scope: '采购 / 销售 / 应收应付', enabled: true, updated: '2026-05-21' },
  { code: 'EUR', name: '欧元', symbol: '€', rate: '7.8200', decimal: 2, rounding: '四舍五入', scope: '销售 / 应收', enabled: true, updated: '2026-05-20' },
  { code: 'HKD', name: '港币', symbol: 'HK$', rate: '0.9200', decimal: 2, rounding: '四舍五入', scope: '采购 / 付款', enabled: false, updated: '2026-05-18' },
];

const SETTING_RATE_ROWS = [
  { scene: '销售报价', source: '交易日即期汇率', lock: '报价确认后锁定', diff: '应收结算确认汇兑损益' },
  { scene: '采购订单', source: '单据日期汇率', lock: '订单审核后锁定', diff: '付款核销确认汇兑损益' },
  { scene: '期末重估', source: '月末基准汇率', lock: '结账后冻结', diff: '自动生成重估凭证' },
];

const SETTING_TAX_ROWS = [
  { name: '增值税 13%', rate: '13%', scope: '标准销售 / 标准采购', status: '启用' },
  { name: '增值税 9%', rate: '9%', scope: '物流运输 / 特定服务', status: '启用' },
  { name: '零税率', rate: '0%', scope: '出口 / 免税业务', status: '启用' },
];

const SETTING_USERS = [
  { id: 'U-10001', name: '老夏', dept: '研发中心', role: '系统管理员', state: '启用', last: '今天 09:34' },
  { id: 'U-10018', name: '李文涛', dept: '采购中心', role: '采购主管', state: '启用', last: '昨天 17:21' },
  { id: 'U-10026', name: '陈思源', dept: '生产中心', role: '生产计划员', state: '启用', last: '昨天 13:05' },
  { id: 'U-10039', name: '王质检', dept: '质检中心', role: '质检主管', state: '停用', last: '2026-05-11' },
];

const SETTING_ROLES = [
  { name: '系统管理员', users: 3, menu: '全部菜单', data: '全部数据', updated: '2026-05-18' },
  { name: '业务主管', users: 12, menu: '业务中心', data: '本中心及下级', updated: '2026-05-16' },
  { name: '普通员工', users: 286, menu: '工作台 / 单据', data: '本人及协作数据', updated: '2026-05-12' },
  { name: '审计只读', users: 5, menu: '报表 / 日志', data: '只读数据', updated: '2026-05-10' },
];

const SETTING_DICTS = [
  { code: 'doc_type', name: '文档类型', items: 18, module: '研发中心', state: '启用' },
  { code: 'supplier_level', name: '供应商等级', items: 6, module: '采购中心', state: '启用' },
  { code: 'warehouse_area', name: '仓库区域', items: 24, module: '仓储中心', state: '启用' },
  { code: 'qc_defect_level', name: '缺陷等级', items: 5, module: '质检中心', state: '启用' },
];

const SETTINGS_MODULE_OPTIONS = SETTING_MODULE_GUIDES.map(item => item.name);
const SETTINGS_ROLE_OPTIONS = ['系统管理员', '业务主管', '普通员工', '审计只读'];
const SETTING_BUTTON_ACTIONS = [
  { key: 'view', label: '查看' },
  { key: 'new', label: '新增' },
  { key: 'edit', label: '编辑' },
  { key: 'delete', label: '删除' },
  { key: 'import', label: '导入' },
  { key: 'export', label: '导出' },
  { key: 'approve', label: '提交审批' },
  { key: 'print', label: '打印' },
];
const SETTING_BUTTON_SCOPES = [
  { key: 'settings_user', module: '设置中心', page: '用户管理' },
  { key: 'settings_role', module: '设置中心', page: '角色权限' },
  { key: 'settings_dict', module: '设置中心', page: '基础数据' },
  { key: 'settings_guide', module: '设置中心', page: '初始化引导' },
  { key: 'rd_doc', module: '研发中心', page: '文档库' },
  { key: 'pur_order', module: '采购中心', page: '采购订单' },
  { key: 'sale_order', module: '销售中心', page: '销售订单' },
  { key: 'wh_inout', module: '仓储中心', page: '出入库单' },
  { key: 'mfg_work', module: '生产中心', page: '生产工单' },
  { key: 'qc_plan', module: '质检中心', page: '质检方案' },
];
const SETTING_FIELD_SCOPES = [
  { key: 'settings_user_name', module: '设置中心', page: '用户管理', field: '姓名' },
  { key: 'settings_user_phone', module: '设置中心', page: '用户管理', field: '手机号' },
  { key: 'settings_role_data', module: '设置中心', page: '角色权限', field: '数据权限' },
  { key: 'settings_dict_value', module: '设置中心', page: '基础数据', field: '字典值' },
  { key: 'rd_doc_security', module: '研发中心', page: '文档库', field: '安全策略' },
  { key: 'pur_supplier_price', module: '采购中心', page: '供应商', field: '采购价' },
  { key: 'sale_customer_credit', module: '销售中心', page: '客户管理', field: '信用额度' },
  { key: 'wh_stock_cost', module: '仓储中心', page: '库存管理', field: '成本层' },
  { key: 'mfg_work_cost', module: '生产中心', page: '生产工单', field: '工时成本' },
  { key: 'fin_voucher_amount', module: '财务中心', page: '凭证管理', field: '金额' },
];
const SETTING_FIELD_ACTIONS = [
  { key: 'visible', label: '可见' },
  { key: 'editable', label: '可编辑' },
  { key: 'required', label: '必填' },
  { key: 'masked', label: '脱敏' },
];
const SETTING_CODE_RULE_FORMS = [
  { id: 'rd_doc', module: '研发中心', form: '文档表单', object: '文档', prefix: 'DOC', sample: 'DOC-202605-001', status: '启用', owner: '研发管理员', updated: '2026-05-18' },
  { id: 'rd_project', module: '研发中心', form: '项目表单', object: '项目', prefix: 'PRJ', sample: 'PRJ-202605-001', status: '启用', owner: '研发管理员', updated: '2026-05-18' },
  { id: 'rd_product', module: '研发中心', form: '产品表单', object: '产品', prefix: 'PROD', sample: 'PROD-202605-001', status: '启用', owner: '研发管理员', updated: '2026-05-17' },
  { id: 'pur_supplier', module: '采购中心', form: '供应商表单', object: '供应商', prefix: 'SUP', sample: 'SUP-202605-001', status: '启用', owner: '采购管理员', updated: '2026-05-16' },
  { id: 'pur_pr', module: '采购中心', form: '请购申请', object: '请购', prefix: 'PR', sample: 'PR-202605-001', status: '启用', owner: '采购管理员', updated: '2026-05-16' },
  { id: 'pur_order', module: '采购中心', form: '采购订单', object: '采购', prefix: 'PO', sample: 'PO-202605-001', status: '启用', owner: '采购管理员', updated: '2026-05-16' },
  { id: 'sale_customer', module: '销售中心', form: '客户表单', object: '客户', prefix: 'CUS', sample: 'CUS-202605-001', status: '启用', owner: '销售管理员', updated: '2026-05-15' },
  { id: 'sale_quote', module: '销售中心', form: '报价单', object: '报价', prefix: 'QT', sample: 'QT-202605-001', status: '启用', owner: '销售管理员', updated: '2026-05-15' },
  { id: 'sale_order', module: '销售中心', form: '销售订单', object: '订单', prefix: 'SO', sample: 'SO-202605-001', status: '启用', owner: '销售管理员', updated: '2026-05-15' },
  { id: 'wh_in', module: '仓储中心', form: '入库单', object: '入库', prefix: 'IN', sample: 'IN-202605-001', status: '启用', owner: '仓储管理员', updated: '2026-05-14' },
  { id: 'wh_out', module: '仓储中心', form: '出库单', object: '出库', prefix: 'OUT', sample: 'OUT-202605-001', status: '启用', owner: '仓储管理员', updated: '2026-05-14' },
  { id: 'wh_transfer', module: '仓储中心', form: '调拨单', object: '调拨', prefix: 'TR', sample: 'TR-202605-001', status: '停用', owner: '仓储管理员', updated: '2026-05-12' },
  { id: 'mfg_plan', module: '生产中心', form: '生产计划', object: '生产计划', prefix: 'MP', sample: 'MP-202605-001', status: '启用', owner: '生产管理员', updated: '2026-05-13' },
  { id: 'mfg_work', module: '生产中心', form: '生产工单', object: '生产工单', prefix: 'WO', sample: 'WO-202605-001', status: '启用', owner: '生产管理员', updated: '2026-05-13' },
  { id: 'qc_plan', module: '质检中心', form: '质检方案', object: '质检方案', prefix: 'QCP', sample: 'QCP-202605-001', status: '启用', owner: '质检管理员', updated: '2026-05-12' },
  { id: 'fin_invoice', module: '财务中心', form: '发票登记', object: '发票', prefix: 'INV', sample: 'INV-202605-001', status: '启用', owner: '财务管理员', updated: '2026-05-11' },
  { id: 'hr_employee', module: '人力中心', form: '员工档案', object: '员工', prefix: 'EMP', sample: 'EMP-202605-001', status: '启用', owner: '人事管理员', updated: '2026-05-10' },
  { id: 'oa_notice', module: '办公中心', form: '公告通知', object: '公告通知', prefix: 'NTC', sample: 'NTC-202605-001', status: '启用', owner: '办公管理员', updated: '2026-05-10' },
];

function buildButtonPerm(seed = 'admin') {
  const all = {};
  SETTING_BUTTON_SCOPES.forEach(scope => {
    const row = {};
    SETTING_BUTTON_ACTIONS.forEach(action => {
      if (seed === 'admin') row[action.key] = true;
      else if (seed === 'readonly') row[action.key] = action.key === 'view' || action.key === 'export';
      else if (seed === 'staff') row[action.key] = ['view', 'new', 'edit', 'export', 'print'].includes(action.key);
      else row[action.key] = !['delete', 'import'].includes(action.key);
    });
    all[scope.key] = row;
  });
  return all;
}

function buildFieldPerm(seed = 'admin') {
  const all = {};
  SETTING_FIELD_SCOPES.forEach(scope => {
    if (seed === 'admin') all[scope.key] = { visible: true, editable: true, required: false, masked: false };
    else if (seed === 'readonly') all[scope.key] = { visible: true, editable: false, required: false, masked: true };
    else if (seed === 'staff') all[scope.key] = { visible: true, editable: !['fin_voucher_amount', 'sale_customer_credit', 'pur_supplier_price'].includes(scope.key), required: false, masked: ['fin_voucher_amount', 'sale_customer_credit'].includes(scope.key) };
    else all[scope.key] = { visible: true, editable: true, required: false, masked: ['fin_voucher_amount'].includes(scope.key) };
  });
  return all;
}

function settingsNow() {
  return new Date().toISOString().slice(0, 16).replace('T', ' ');
}

function SettingsToast({ text, onClose }) {
  React.useEffect(() => {
    if (!text) return;
    const timer = setTimeout(() => onClose && onClose(), 1800);
    return () => clearTimeout(timer);
  }, [text]);
  if (!text) return null;
  return (
    <div style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 90, background: '#1F2937', color: '#fff', padding: '10px 14px', borderRadius: 6, boxShadow: '0 8px 24px rgba(16,24,40,.18)', fontSize: 13 }}>
      {text}
    </div>
  );
}

function SettingsEmptyRow({ colSpan, text = '暂无匹配数据' }) {
  return <tr><td colSpan={colSpan} style={{ padding: '46px 0', textAlign: 'center', color: 'var(--aw-fg-4)' }}>{text}</td></tr>;
}

function SettingsCenterScreen({ section = 'workbench', action = null, onActionConsumed, onNavigate }) {
  const [systemRows, setSystemRows] = useSettingsState(SETTING_SYSTEM_ROWS);
  const [businessRows, setBusinessRows] = useSettingsState(SETTING_BUSINESS_PARAMS);
  const [systemTab, setSystemTab] = useSettingsState('basic');
  const [businessTab, setBusinessTab] = useSettingsState('currency');
  const [activeGuide, setActiveGuide] = useSettingsState('rd');
  const [guideMode, setGuideMode] = useSettingsState('overview');
  const [guideAction, setGuideAction] = useSettingsState(null);

  React.useEffect(() => {
    if (!action) return;
    if (section === 'guide') {
      if (action.includes('总览')) setGuideMode('overview');
      if (action.includes('任务')) setGuideMode('tasks');
      if (action.includes('模板')) setGuideMode('templates');
      if (action.includes('进度')) setGuideMode('progress');
      if (action.includes('新增')) setGuideAction('new');
      if (action.includes('发布')) setGuideAction('publish');
      if (action.includes('记录')) setGuideAction('logs');
    }
    if (section === 'system') {
      if (action.includes('基础信息')) setSystemTab('basic');
      if (action.includes('系统参数')) setSystemTab('params');
      if (action.includes('界面配置')) setSystemTab('ui');
      if (action.includes('系统日志')) setSystemTab('logs');
      if (action.includes('数据备份')) setSystemTab('backup');
      if (action.includes('版本管理')) setSystemTab('version');
    }
    if (section === 'business') {
      if (action.includes('多币种') || action.includes('汇率')) setBusinessTab('currency');
      if (action.includes('税率')) setBusinessTab('tax');
      if (action.includes('会计期间') || action.includes('结账')) setBusinessTab('period');
      if (action.includes('价格精度') || action.includes('金额精度')) setBusinessTab('precision');
    }
    onActionConsumed && onActionConsumed();
  }, [action, section]);

  const toggleSystem = (idx) => {
    setSystemRows(prev => prev.map((row, i) => i === idx ? { ...row, enabled: !row.enabled } : row));
  };
  const toggleBusiness = (idx) => {
    setBusinessRows(prev => prev.map((row, i) => i === idx ? { ...row, enabled: !row.enabled } : row));
  };

  if (section === 'code') return <SettingsCodeRulesPage />;
  if (section === 'approval') return <ApprovalFlowScreen module={MODULE_DOC} />;
  if (section === 'guide') {
    return <SettingsGuidePage active={activeGuide} setActive={setActiveGuide} mode={guideMode} setMode={setGuideMode} action={guideAction} onActionConsumed={() => setGuideAction(null)} />;
  }
  if (section === 'user') return <SettingsUserPage />;
  if (section === 'role') return <SettingsRolePage />;
  if (section === 'dict') return <SettingsDictPage />;
  if (section === 'business') return <SettingsBusinessPage rows={businessRows} setRows={setBusinessRows} onToggle={toggleBusiness} tab={businessTab} setTab={setBusinessTab} />;
  if (section === 'system') return <SettingsSystemPage rows={systemRows} setRows={setSystemRows} onToggle={toggleSystem} tab={systemTab} setTab={setSystemTab} />;
  return <SettingsWorkbenchPage onNavigate={onNavigate} />;
}

function SettingsWorkbenchPage({ onNavigate }) {
  const cards = [
    { label: '业务参数', value: SETTING_BUSINESS_PARAMS.length, sub: '财务 / 价格 / 税务', tone: '#EEF1FF', color: '#5677FC' },
    { label: '待完善配置', value: 2, sub: '生产 / 能耗', tone: '#FDECDC', color: '#B26A24' },
    { label: '启用用户', value: 319, sub: '含管理员账号', tone: '#DBF3E6', color: '#1F7A4E' },
    { label: '字典项', value: 64, sub: '跨模块引用', tone: '#E8DEFB', color: '#8957D8' },
  ];
  const quick = [
    { label: '系统基础', sub: '企业资料 / 安全 / 界面', moduleKey: 'system', action: '基础信息' },
    { label: '多币种配置', sub: '币种 / 汇率 / 重估', moduleKey: 'business', action: '多币种配置' },
    { label: '税率配置', sub: '税率档案 / 适用范围', moduleKey: 'business', action: '税率配置' },
    { label: '用户管理', sub: '账号 / 部门 / 状态', moduleKey: 'user' },
    { label: '角色权限', sub: '菜单 / 数据 / 字段', moduleKey: 'role' },
    { label: '编码规则', sub: '编号规则 / 预览', moduleKey: 'code' },
  ];
  return (
    <>
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
          {cards.map(card => (
            <div key={card.label} style={{ border: '1px solid var(--aw-border)', borderRadius: 8, padding: 16, background: '#fff' }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: card.tone, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <TileIcon name="list" size={16} />
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--aw-font-num)' }}>{card.value}</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>{card.label}</div>
              <div style={{ fontSize: 12, color: 'var(--aw-fg-3)', marginTop: 4 }}>{card.sub}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card title="常用配置入口">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
          {quick.map(item => (
            <div key={item.label} onClick={() => onNavigate && onNavigate(item.moduleKey, item.action)} style={{ border: '1px solid var(--aw-border)', borderRadius: 8, padding: 14, background: '#fff', cursor: 'pointer' }}>
              <div style={{ fontWeight: 700 }}>{item.label}</div>
              <div style={{ fontSize: 12, color: 'var(--aw-fg-3)', marginTop: 6 }}>{item.sub}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card title="设置中心功能地图">
        <div className="aw-doc-tbl-wrap" style={{ border: 0, borderRadius: 0 }}>
          <table className="aw-doc-tbl">
            <thead>
              <tr>
                <th><div className="aw-th-inner">功能</div></th>
                <th><div className="aw-th-inner">覆盖范围</div></th>
                <th><div className="aw-th-inner">关键操作</div></th>
                <th style={{ width: 120 }}><div className="aw-th-inner">状态</div></th>
              </tr>
            </thead>
            <tbody>
              {[
                ['系统基础', '企业资料、登录安全、界面偏好', '维护企业信息、配置安全与界面', '已补齐'],
                ['业务参数', '币种、汇率、税率、会计期间、价格精度', '启停参数、维护币种、保存规则', '已补齐'],
                ['权限安全', '用户、角色、菜单、数据、字段权限', '新增用户、分配权限、复制角色', '已补齐'],
                ['基础数据', '跨模块枚举与基础字典', '维护字典项、停启用、同步引用', '已补齐'],
                ['流程规则', '编码规则、审批流程', '设置规则、预览编码、配置审批', '已补齐'],
                ['运维审计', '系统日志、数据备份、版本管理', '查看日志、校验备份、版本回滚', '已补齐'],
                ['初始化引导', '按业务中心推进初始化配置', '查看进度、生成任务、套用模板', '新增'],
              ].map(row => (
                <tr key={row[0]}>
                  <td style={{ fontWeight: 600 }}>{row[0]}</td>
                  <td>{row[1]}</td>
                  <td>{row[2]}</td>
                  <td><Badge tone={row[3] === '新增' ? 'y' : 'g'}>{row[3]}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

function SettingsBusinessPage({ rows, setRows, onToggle, tab, setTab }) {
  const [kw, setKw] = useSettingsState('');
  const [modal, setModal] = useSettingsState(null);
  const [toast, setToast] = useSettingsState('');
  const [currencies, setCurrencies] = useSettingsState(SETTING_CURRENCY_ROWS);
  const [currencyForm, setCurrencyForm] = useSettingsState(SETTING_CURRENCY_ROWS[0]);
  const [currencyConfig, setCurrencyConfig] = useSettingsState({
    enabled: true,
    baseCurrency: 'CNY',
    rateSource: '央行中间价',
    rateUpdate: '每日自动更新',
    voucherRate: '单据日期汇率',
    priceDecimal: '2',
    amountDecimal: '2',
    gainAccount: '财务费用-汇兑收益',
    lossAccount: '财务费用-汇兑损失',
    revalue: '月末自动重估',
    modules: { purchase: true, sale: true, receivable: true, payable: true, inventory: false },
  });

  const tabs = [
    { k: 'overview', label: '参数总览' },
    { k: 'currency', label: '多币种配置' },
    { k: 'tax', label: '税率配置' },
    { k: 'period', label: '会计期间' },
    { k: 'precision', label: '价格精度' },
  ];
  const titleMap = {
    overview: '业务参数总览',
    currency: '多币种配置',
    tax: '税率配置',
    period: '会计期间',
    precision: '价格精度',
  };
  const filtered = rows.filter(row => [row.name, row.scope, row.owner].join(' ').includes(kw.trim()));

  const openCurrency = (row) => {
    setCurrencyForm(row ? { ...row } : { code: '', name: '', symbol: '', rate: '1.0000', decimal: 2, rounding: '四舍五入', scope: '采购 / 销售', enabled: true, updated: settingsNow().slice(0, 10) });
    setModal({ type: row ? 'currencyEdit' : 'currencyNew', code: row?.code });
  };
  const saveCurrency = () => {
    if (!currencyForm.code.trim() || !currencyForm.name.trim()) return;
    const next = { ...currencyForm, code: currencyForm.code.toUpperCase(), updated: settingsNow().slice(0, 10) };
    if (modal?.type === 'currencyEdit') setCurrencies(prev => prev.map(row => row.code === modal.code ? next : row));
    else setCurrencies(prev => [...prev, next]);
    setModal(null);
    setToast('币种配置已保存');
  };
  const saveBusinessParam = (row, idx) => {
    setRows(prev => prev.map((item, i) => i === idx ? { ...item, updated: settingsNow() } : item));
    setTab(row.tab || 'overview');
    setToast(`${row.name}已打开`);
  };
  const saveCurrencyConfig = () => setToast('多币种配置已保存');
  const setModule = (key, value) => setCurrencyConfig(prev => ({ ...prev, modules: { ...prev.modules, [key]: value } }));

  return (
    <>
      <Card title={titleMap[tab] || '业务参数'}>
        <Tabs items={tabs} active={tab} onChange={setTab} />
        {tab === 'overview' && (
          <>
            <div className="aw-doc-tb" style={{ marginBottom: 12 }}>
              <div className="aw-doc-search"><input placeholder="搜索业务参数、作用范围、负责人" value={kw} onChange={e => setKw(e.target.value)} /></div>
            </div>
            <table className="aw-table" style={{ width: '100%' }}>
              <thead><tr><th>参数项</th><th>作用范围</th><th>负责人</th><th>更新时间</th><th>启用</th><th>操作</th></tr></thead>
              <tbody>
                {filtered.map((row) => {
                  const idx = rows.indexOf(row);
                  return (
                    <tr key={row.name}>
                      <td>{row.name}</td><td>{row.scope}</td><td>{row.owner}</td><td className="aw-num">{row.updated}</td>
                      <td><Switch on={row.enabled} onChange={() => onToggle(idx)} /></td>
                      <td><span className="aw-link" onClick={() => saveBusinessParam(row, idx)}>配置</span><span className="aw-link" style={{ marginLeft: 12 }} onClick={() => setModal({ type: 'paramLog', row })}>查看日志</span></td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && <SettingsEmptyRow colSpan={6} />}
              </tbody>
            </table>
          </>
        )}
        {tab === 'currency' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: 18, alignItems: 'start' }}>
              <div>
                <FormGrid columns={3}>
                  <Field label="启用多币种"><div style={{ paddingTop: 6 }}><Switch on={currencyConfig.enabled} onChange={enabled => setCurrencyConfig(v => ({ ...v, enabled }))} /></div></Field>
                  <Field label="本位币"><Select value={currencyConfig.baseCurrency} onChange={e => setCurrencyConfig(v => ({ ...v, baseCurrency: e.target.value }))}>{currencies.map(row => <option key={row.code}>{row.code}</option>)}</Select></Field>
                  <Field label="汇率来源"><Select value={currencyConfig.rateSource} onChange={e => setCurrencyConfig(v => ({ ...v, rateSource: e.target.value }))}><option>央行中间价</option><option>手工维护</option><option>月末固定汇率</option><option>外部接口同步</option></Select></Field>
                  <Field label="更新频率"><Select value={currencyConfig.rateUpdate} onChange={e => setCurrencyConfig(v => ({ ...v, rateUpdate: e.target.value }))}><option>每日自动更新</option><option>每周更新</option><option>月末更新</option><option>手工更新</option></Select></Field>
                  <Field label="单据取值"><Select value={currencyConfig.voucherRate} onChange={e => setCurrencyConfig(v => ({ ...v, voucherRate: e.target.value }))}><option>单据日期汇率</option><option>审核日期汇率</option><option>结算日期汇率</option><option>手工指定汇率</option></Select></Field>
                  <Field label="期末重估"><Select value={currencyConfig.revalue} onChange={e => setCurrencyConfig(v => ({ ...v, revalue: e.target.value }))}><option>月末自动重估</option><option>季度重估</option><option>手工重估</option><option>不重估</option></Select></Field>
                  <Field label="单价小数位"><Select value={currencyConfig.priceDecimal} onChange={e => setCurrencyConfig(v => ({ ...v, priceDecimal: e.target.value }))}><option>2</option><option>4</option><option>6</option></Select></Field>
                  <Field label="金额小数位"><Select value={currencyConfig.amountDecimal} onChange={e => setCurrencyConfig(v => ({ ...v, amountDecimal: e.target.value }))}><option>2</option><option>4</option></Select></Field>
                  <Field label="汇兑收益科目"><Input value={currencyConfig.gainAccount} onChange={e => setCurrencyConfig(v => ({ ...v, gainAccount: e.target.value }))} /></Field>
                  <Field label="汇兑损失科目"><Input value={currencyConfig.lossAccount} onChange={e => setCurrencyConfig(v => ({ ...v, lossAccount: e.target.value }))} /></Field>
                </FormGrid>
                <div style={{ marginTop: 14, borderTop: '1px solid var(--aw-divider)' }}>
                  {[
                    ['purchase', '采购单据', '请购、询价、采购订单、采购退货'],
                    ['sale', '销售单据', '报价、合同、销售订单、销售退货'],
                    ['receivable', '应收管理', '客户结算、收款核销、汇兑损益'],
                    ['payable', '应付管理', '供应商结算、付款核销、汇兑损益'],
                    ['inventory', '库存成本', '外币采购入库成本折算'],
                  ].map(([key, title, sub]) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--aw-divider)' }}>
                      <div><div style={{ fontWeight: 600 }}>{title}</div><div style={{ fontSize: 12, color: 'var(--aw-fg-3)', marginTop: 4 }}>{sub}</div></div>
                      <Switch on={currencyConfig.modules[key]} onChange={value => setModule(key, value)} />
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ border: '1px solid var(--aw-border)', borderRadius: 8, padding: 14, background: '#fff' }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>当前策略</div>
                <InfoGrid columns={1} items={[
                  { label: '本位币', value: currencyConfig.baseCurrency },
                  { label: '汇率来源', value: currencyConfig.rateSource },
                  { label: '单据取值', value: currencyConfig.voucherRate },
                  { label: '汇兑科目', value: `${currencyConfig.gainAccount} / ${currencyConfig.lossAccount}` },
                ]} />
              </div>
            </div>
            <div className="aw-doc-tb" style={{ marginTop: 16, marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: 'var(--aw-fg-2)' }}>币种档案</span>
              <span style={{ flex: 1 }} />
              <Btn onClick={() => setToast('汇率已按当前来源刷新')}>刷新汇率</Btn>
              <Btn kind="primary" onClick={() => openCurrency(null)}>新增币种</Btn>
            </div>
            <table className="aw-table" style={{ width: '100%' }}>
              <thead><tr><th>币种</th><th>名称</th><th>符号</th><th>基准汇率</th><th>小数位</th><th>舍入规则</th><th>应用范围</th><th>启用</th><th>操作</th></tr></thead>
              <tbody>
                {currencies.map(row => (
                  <tr key={row.code}>
                    <td className="aw-num">{row.code}</td><td>{row.name}</td><td>{row.symbol}</td><td className="aw-num">{row.rate}</td><td className="aw-num">{row.decimal}</td><td>{row.rounding}</td><td>{row.scope}</td>
                    <td><Switch on={row.enabled} onChange={() => setCurrencies(prev => prev.map(item => item.code === row.code ? { ...item, enabled: !item.enabled, updated: settingsNow().slice(0, 10) } : item))} /></td>
                    <td><span className="aw-link" onClick={() => openCurrency(row)}>编辑</span><span className="aw-link" style={{ marginLeft: 12 }} onClick={() => setToast(`${row.code}汇率历史已打开`)}>汇率历史</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="aw-doc-tb" style={{ marginTop: 16, marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: 'var(--aw-fg-2)' }}>汇率应用规则</span>
            </div>
            <table className="aw-table" style={{ width: '100%' }}>
              <thead><tr><th>业务场景</th><th>汇率来源</th><th>锁定时点</th><th>差异处理</th><th>操作</th></tr></thead>
              <tbody>{SETTING_RATE_ROWS.map(row => <tr key={row.scene}><td>{row.scene}</td><td>{row.source}</td><td>{row.lock}</td><td>{row.diff}</td><td><span className="aw-link" onClick={() => setToast(`${row.scene}规则已保存`)}>编辑</span></td></tr>)}</tbody>
            </table>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <Btn onClick={() => setToast('已执行多币种配置校验')}>校验配置</Btn>
              <Btn kind="primary" onClick={saveCurrencyConfig}>保存多币种配置</Btn>
            </div>
          </>
        )}
        {tab === 'tax' && (
          <table className="aw-table" style={{ width: '100%' }}>
            <thead><tr><th>税率名称</th><th>税率</th><th>适用范围</th><th>状态</th><th>操作</th></tr></thead>
            <tbody>{SETTING_TAX_ROWS.map(row => <tr key={row.name}><td>{row.name}</td><td className="aw-num">{row.rate}</td><td>{row.scope}</td><td><Badge tone="g">{row.status}</Badge></td><td><span className="aw-link" onClick={() => setToast(`${row.name}已保存`)}>编辑</span></td></tr>)}</tbody>
          </table>
        )}
        {tab === 'period' && (
          <>
            <InfoGrid columns={4} items={[{ label: '当前期间', value: '2026-05' }, { label: '期间状态', value: '打开' }, { label: '结账方式', value: '按月结账' }, { label: '关账控制', value: '库存 / 应收 / 应付完成后允许' }]} />
            <div style={{ height: 14 }} />
            <table className="aw-table" style={{ width: '100%' }}>
              <thead><tr><th>期间</th><th>开始日期</th><th>结束日期</th><th>状态</th><th>操作</th></tr></thead>
              <tbody>{[['2026-05','2026-05-01','2026-05-31','打开'],['2026-04','2026-04-01','2026-04-30','已结账'],['2026-03','2026-03-01','2026-03-31','已结账']].map(row => <tr key={row[0]}><td className="aw-num">{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td><td><Badge tone={row[3] === '打开' ? 'g' : 'y'}>{row[3]}</Badge></td><td><span className="aw-link" onClick={() => setToast(`${row[0]}期间检查完成`)}>期间检查</span></td></tr>)}</tbody>
            </table>
          </>
        )}
        {tab === 'precision' && (
          <FormGrid columns={3}>
            <Field label="采购单价精度"><Select defaultValue="4"><option>2</option><option>4</option><option>6</option></Select></Field>
            <Field label="销售单价精度"><Select defaultValue="4"><option>2</option><option>4</option><option>6</option></Select></Field>
            <Field label="金额精度"><Select defaultValue="2"><option>2</option><option>4</option></Select></Field>
            <Field label="数量精度"><Select defaultValue="3"><option>0</option><option>2</option><option>3</option><option>4</option></Select></Field>
            <Field label="成本精度"><Select defaultValue="4"><option>2</option><option>4</option><option>6</option></Select></Field>
            <Field label="尾差处理"><Select defaultValue="末行调整"><option>末行调整</option><option>最大金额行调整</option><option>单独生成尾差</option></Select></Field>
          </FormGrid>
        )}
      </Card>
      {(modal?.type === 'currencyNew' || modal?.type === 'currencyEdit') && (
        <Modal title={modal.type === 'currencyEdit' ? '编辑币种' : '新增币种'} size="md" onClose={() => setModal(null)} footer={<><Btn onClick={() => setModal(null)}>取消</Btn><Btn kind="primary" onClick={saveCurrency}>保存</Btn></>}>
          <FormGrid columns={2}>
            <Field label="币种代码" req><Input value={currencyForm.code} onChange={e => setCurrencyForm(v => ({ ...v, code: e.target.value }))} placeholder="如 USD" /></Field>
            <Field label="币种名称" req><Input value={currencyForm.name} onChange={e => setCurrencyForm(v => ({ ...v, name: e.target.value }))} placeholder="如 美元" /></Field>
            <Field label="符号"><Input value={currencyForm.symbol} onChange={e => setCurrencyForm(v => ({ ...v, symbol: e.target.value }))} placeholder="$" /></Field>
            <Field label="基准汇率"><Input value={currencyForm.rate} onChange={e => setCurrencyForm(v => ({ ...v, rate: e.target.value }))} /></Field>
            <Field label="小数位"><Select value={String(currencyForm.decimal)} onChange={e => setCurrencyForm(v => ({ ...v, decimal: Number(e.target.value) }))}><option>0</option><option>2</option><option>4</option></Select></Field>
            <Field label="舍入规则"><Select value={currencyForm.rounding} onChange={e => setCurrencyForm(v => ({ ...v, rounding: e.target.value }))}><option>四舍五入</option><option>向上取整</option><option>向下取整</option></Select></Field>
            <Field label="应用范围"><Input value={currencyForm.scope} onChange={e => setCurrencyForm(v => ({ ...v, scope: e.target.value }))} /></Field>
            <Field label="启用"><div style={{ paddingTop: 6 }}><Switch on={currencyForm.enabled} onChange={enabled => setCurrencyForm(v => ({ ...v, enabled }))} /></div></Field>
          </FormGrid>
        </Modal>
      )}
      {modal?.type === 'paramLog' && (
        <Modal title="业务参数日志" subtitle={modal.row.name} size="md" onClose={() => setModal(null)} footer={<Btn kind="primary" onClick={() => setModal(null)}>关闭</Btn>}>
          <InfoGrid columns={2} items={[{ label: '参数项', value: modal.row.name }, { label: '负责人', value: modal.row.owner }, { label: '更新时间', value: modal.row.updated }, { label: '状态', value: modal.row.enabled ? '启用' : '停用' }]} />
        </Modal>
      )}
      <SettingsToast text={toast} onClose={() => setToast('')} />
    </>
  );
}

function SettingsSystemPage({ rows, setRows, onToggle, tab, setTab }) {
  const [kw, setKw] = useSettingsState('');
  const [modal, setModal] = useSettingsState(null);
  const [form, setForm] = useSettingsState({ name: '', scope: '', owner: '', enabled: true });
  const [toast, setToast] = useSettingsState('');
  const [basic, setBasic] = useSettingsState({
    company: '海南傲为智慧科技有限公司',
    shortName: '海南傲为智慧',
    unifiedCode: '91460000MA5T000001',
    industry: '智能制造',
    contact: '老夏',
    phone: '0898-6688 0000',
    email: 'admin@aowei.example',
    address: '海南省海口市龙华区智慧产业园 A 座',
  });
  const [ui, setUi] = useSettingsState({
    theme: '默认蓝',
    density: '标准',
    sidebar: '展开',
    tableStripe: true,
    stickyAction: true,
    showBreadcrumb: true,
    home: '工作台',
    language: '简体中文',
  });
  const filtered = rows.filter(row => [row.name, row.scope, row.owner].join(' ').includes(kw.trim()));

  const openForm = (row, idx) => {
    setForm(row ? { ...row } : { name: '', scope: '', owner: '系统管理员', enabled: true });
    setModal({ type: row ? 'edit' : 'new', idx });
  };
  const saveForm = () => {
    if (!form.name.trim()) return;
    const next = { ...form, updated: settingsNow() };
    if (modal?.type === 'edit') setRows(prev => prev.map((row, idx) => idx === modal.idx ? next : row));
    else setRows(prev => [...prev, next]);
    setModal(null);
    setToast(modal?.type === 'edit' ? '系统参数已保存' : '系统参数已新增');
  };
  const saveBasic = () => setToast('基础信息已保存');
  const saveUi = () => setToast('界面配置已保存');
  const titleMap = {
    basic: '基础信息',
    params: '系统参数',
    ui: '界面配置',
    logs: '系统日志',
    backup: '数据备份',
    version: '版本管理',
  };

  return (
    <>
      <Card title={titleMap[tab] || '基础信息'}>
        {tab === 'basic' && (
          <>
            <FormGrid columns={2}>
              <Field label="企业名称" req><Input value={basic.company} onChange={e => setBasic(v => ({ ...v, company: e.target.value }))} /></Field>
              <Field label="系统简称" req><Input value={basic.shortName} onChange={e => setBasic(v => ({ ...v, shortName: e.target.value }))} /></Field>
              <Field label="统一社会信用代码"><Input value={basic.unifiedCode} onChange={e => setBasic(v => ({ ...v, unifiedCode: e.target.value }))} /></Field>
              <Field label="所属行业"><Select value={basic.industry} onChange={e => setBasic(v => ({ ...v, industry: e.target.value }))}><option>智能制造</option><option>电子装备</option><option>机械加工</option><option>贸易服务</option></Select></Field>
              <Field label="联系人"><Input value={basic.contact} onChange={e => setBasic(v => ({ ...v, contact: e.target.value }))} /></Field>
              <Field label="联系电话"><Input value={basic.phone} onChange={e => setBasic(v => ({ ...v, phone: e.target.value }))} /></Field>
              <Field label="系统邮箱"><Input value={basic.email} onChange={e => setBasic(v => ({ ...v, email: e.target.value }))} /></Field>
              <Field label="企业地址"><Input value={basic.address} onChange={e => setBasic(v => ({ ...v, address: e.target.value }))} /></Field>
            </FormGrid>
            <div style={{ marginTop: 16, padding: 14, border: '1px solid var(--aw-border)', borderRadius: 8, background: 'var(--aw-bg)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>系统抬头预览</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 8, background: 'var(--aw-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{basic.shortName.slice(0, 1)}</div>
                <div>
                  <div style={{ fontWeight: 700 }}>{basic.shortName}</div>
                  <div style={{ fontSize: 12, color: 'var(--aw-fg-3)', marginTop: 4 }}>{basic.company} · {basic.industry}</div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <Btn onClick={() => setToast('已恢复基础信息默认值')}>恢复默认</Btn>
              <Btn kind="primary" onClick={saveBasic}>保存基础信息</Btn>
            </div>
          </>
        )}
        {tab === 'params' && (
          <>
        <div className="aw-doc-tb" style={{ marginBottom: 12 }}>
          <div className="aw-doc-search"><input placeholder="搜索系统参数、维护项" value={kw} onChange={e => setKw(e.target.value)} /></div>
          <Btn kind="primary" onClick={() => openForm(null)}>新增参数</Btn>
        </div>
        <table className="aw-table" style={{ width: '100%' }}>
          <thead><tr><th>设置项</th><th>作用范围</th><th>负责人</th><th>更新时间</th><th>启用</th><th>操作</th></tr></thead>
          <tbody>
            {filtered.map((row) => {
              const idx = rows.indexOf(row);
              return (
                <tr key={row.name}>
                  <td>{row.name}</td><td>{row.scope}</td><td>{row.owner}</td><td className="aw-num">{row.updated}</td>
                  <td><Switch on={row.enabled} onChange={() => onToggle(idx)} /></td>
                  <td><span className="aw-link" onClick={() => openForm(row, idx)}>编辑</span><span className="aw-link" style={{ marginLeft: 12 }} onClick={() => setModal({ type: 'rowLog', row })}>查看日志</span></td>
                </tr>
              );
            })}
            {filtered.length === 0 && <SettingsEmptyRow colSpan={6} />}
          </tbody>
        </table>
          </>
        )}
        {tab === 'ui' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 18, alignItems: 'start' }}>
              <div>
                <FormGrid columns={2}>
                  <Field label="主题颜色"><Select value={ui.theme} onChange={e => setUi(v => ({ ...v, theme: e.target.value }))}><option>默认蓝</option><option>松石绿</option><option>深灰</option><option>高对比</option></Select></Field>
                  <Field label="界面密度"><Select value={ui.density} onChange={e => setUi(v => ({ ...v, density: e.target.value }))}><option>紧凑</option><option>标准</option><option>宽松</option></Select></Field>
                  <Field label="侧栏默认状态"><Select value={ui.sidebar} onChange={e => setUi(v => ({ ...v, sidebar: e.target.value }))}><option>展开</option><option>收起</option></Select></Field>
                  <Field label="默认首页"><Select value={ui.home} onChange={e => setUi(v => ({ ...v, home: e.target.value }))}><option>工作台</option><option>设置中心</option><option>最近访问</option></Select></Field>
                  <Field label="语言"><Select value={ui.language} onChange={e => setUi(v => ({ ...v, language: e.target.value }))}><option>简体中文</option><option>English</option></Select></Field>
                </FormGrid>
                <div style={{ marginTop: 16, borderTop: '1px solid var(--aw-divider)' }}>
                  {[
                    ['tableStripe', '表格斑马纹', '列表行间隔背景，提升扫描效率'],
                    ['stickyAction', '操作列固定', '宽表格横向滚动时保持操作可见'],
                    ['showBreadcrumb', '显示页面标题栏', '在主区域顶部展示当前位置和标题'],
                  ].map(([key, title, sub]) => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--aw-divider)' }}>
                      <div><div style={{ fontWeight: 600 }}>{title}</div><div style={{ fontSize: 12, color: 'var(--aw-fg-3)', marginTop: 4 }}>{sub}</div></div>
                      <Switch on={ui[key]} onChange={v => setUi(prev => ({ ...prev, [key]: v }))} />
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ border: '1px solid var(--aw-border)', borderRadius: 8, padding: 14, background: '#fff' }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>界面预览</div>
                <div style={{ border: '1px solid var(--aw-border)', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ height: 34, background: ui.theme === '深灰' ? '#1F2937' : ui.theme === '松石绿' ? '#10B981' : '#5677FC', color: '#fff', display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: 12 }}>{basic.shortName}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: ui.sidebar === '收起' ? '42px 1fr' : '88px 1fr', minHeight: 130 }}>
                    <div style={{ background: '#F8FAFC', borderRight: '1px solid var(--aw-border)', padding: 8, fontSize: 11, color: 'var(--aw-fg-3)' }}>{ui.sidebar}</div>
                    <div style={{ padding: ui.density === '紧凑' ? 8 : ui.density === '宽松' ? 18 : 12 }}>
                      <div style={{ height: 16, width: '60%', background: '#E5E7EB', borderRadius: 4, marginBottom: 10 }} />
                      {[1, 2, 3].map(i => <div key={i} style={{ height: 22, background: ui.tableStripe && i % 2 === 0 ? '#F5F6FA' : '#fff', border: '1px solid #EEF0F4', marginBottom: 6 }} />)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <Btn onClick={() => setToast('已恢复界面默认配置')}>恢复默认</Btn>
              <Btn kind="primary" onClick={saveUi}>保存界面配置</Btn>
            </div>
          </>
        )}
        {tab === 'logs' && (
          <>
            <div className="aw-doc-tb" style={{ marginBottom: 12 }}>
              <div className="aw-doc-search"><input placeholder="搜索操作人、对象、动作" value={kw} onChange={e => setKw(e.target.value)} /></div>
              <Btn onClick={() => setToast('系统日志已刷新')}>刷新</Btn>
              <Btn onClick={() => setToast('系统日志已导出')}>导出</Btn>
            </div>
            <table className="aw-table" style={{ width: '100%' }}>
              <thead><tr><th>时间</th><th>操作人</th><th>来源模块</th><th>对象</th><th>动作</th><th>结果</th><th>IP</th></tr></thead>
              <tbody>
                {[
                  ['2026-05-19 09:32', '老夏', '设置中心', '系统参数', '修改登录安全参数', '成功', '10.10.1.23'],
                  ['2026-05-19 09:18', '李文涛', '采购中心', '采购订单', '导出列表', '成功', '10.10.2.18'],
                  ['2026-05-18 18:04', '系统任务', '系统维护', '数据备份', '执行增量备份', '成功', '127.0.0.1'],
                  ['2026-05-18 16:45', '王质检', '质检中心', '质检方案', '查看详情', '成功', '10.10.3.42'],
                ].filter(row => row.join(' ').includes(kw.trim())).map(row => (
                  <tr key={row.join('-')}><td className="aw-num">{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td><td>{row[4]}</td><td><Badge tone="g">{row[5]}</Badge></td><td className="aw-num">{row[6]}</td></tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        {tab === 'backup' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginBottom: 14 }}>
              {[
                ['最近备份', '2026-05-18 23:00'],
                ['备份策略', '每日增量 / 每周全量'],
                ['备份容量', '18.6 GB'],
                ['保留周期', '90 天'],
              ].map(([label, value]) => (
                <div key={label} style={{ border: '1px solid var(--aw-border)', borderRadius: 8, padding: 14 }}><div style={{ fontSize: 12, color: 'var(--aw-fg-3)' }}>{label}</div><div style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>{value}</div></div>
              ))}
            </div>
            <div className="aw-doc-tb" style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: 'var(--aw-fg-2)' }}>备份任务列表</span>
              <span style={{ flex: 1 }} />
              <Btn onClick={() => setToast('已生成备份校验清单')}>校验备份</Btn>
              <Btn kind="primary" onClick={() => setToast('已开始执行数据备份')}>立即备份</Btn>
            </div>
            <table className="aw-table" style={{ width: '100%' }}>
              <thead><tr><th>备份类型</th><th>备份范围</th><th>执行时间</th><th>耗时</th><th>状态</th><th>操作</th></tr></thead>
              <tbody>
                {[
                  ['增量备份', '业务数据 / 系统参数', '2026-05-18 23:00', '8 分钟', '成功'],
                  ['全量备份', '业务数据 / 附件 / 日志', '2026-05-17 23:00', '38 分钟', '成功'],
                  ['增量备份', '业务数据 / 系统参数', '2026-05-16 23:00', '7 分钟', '成功'],
                ].map(row => <tr key={row.join('-')}><td>{row[0]}</td><td>{row[1]}</td><td className="aw-num">{row[2]}</td><td>{row[3]}</td><td><Badge tone="g">{row[4]}</Badge></td><td><span className="aw-link">下载</span><span className="aw-link" style={{ marginLeft: 12 }}>恢复</span></td></tr>)}
              </tbody>
            </table>
          </>
        )}
        {tab === 'version' && (
          <>
            <InfoGrid columns={3} items={[{ label: '当前版本', value: 'ERP Console 2026.05' }, { label: '前端资源', value: '20260519-settings' }, { label: '更新状态', value: '已是最新版本' }]} />
            <div style={{ height: 14 }} />
            <table className="aw-table" style={{ width: '100%' }}>
              <thead><tr><th>版本号</th><th>发布日期</th><th>更新内容</th><th>发布人</th><th>状态</th><th>操作</th></tr></thead>
              <tbody>
                {[
                  ['2026.05', '2026-05-19', '设置中心补齐、权限按钮字段级控制、编码规则总表', '系统管理员', '当前版本'],
                  ['2026.04', '2026-04-28', '仓储、生产、质检核心流程增强', '系统管理员', '可回滚'],
                  ['2026.03', '2026-03-31', '采购与销售单据链路优化', '系统管理员', '可回滚'],
                ].map(row => <tr key={row[0]}><td className="aw-num">{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td><td><Badge tone={row[4] === '当前版本' ? 'g' : 'y'}>{row[4]}</Badge></td><td><span className="aw-link" onClick={() => setToast(row[4] === '当前版本' ? '当前版本无需操作' : `已选择回滚到 ${row[0]}`)}>{row[4] === '当前版本' ? '查看' : '回滚'}</span></td></tr>)}
              </tbody>
            </table>
          </>
        )}
      </Card>
      {(modal?.type === 'new' || modal?.type === 'edit') && (
        <Modal title={modal.type === 'edit' ? '编辑系统参数' : '新增系统参数'} size="md" onClose={() => setModal(null)} footer={<><Btn onClick={() => setModal(null)}>取消</Btn><Btn kind="primary" onClick={saveForm}>保存</Btn></>}>
          <FormGrid columns={2}>
            <Field label="设置项" req><Input value={form.name} onChange={e => setForm(v => ({ ...v, name: e.target.value }))} placeholder="请输入设置项名称" /></Field>
            <Field label="作用范围" req><Input value={form.scope} onChange={e => setForm(v => ({ ...v, scope: e.target.value }))} placeholder="如全局 / 账号安全" /></Field>
            <Field label="负责人"><Input value={form.owner} onChange={e => setForm(v => ({ ...v, owner: e.target.value }))} /></Field>
            <Field label="启用状态"><div style={{ paddingTop: 6 }}><Switch on={form.enabled} onChange={enabled => setForm(v => ({ ...v, enabled }))} /></div></Field>
          </FormGrid>
        </Modal>
      )}
      {modal?.type === 'logs' && (
        <Modal title="系统日志" size="lg" onClose={() => setModal(null)} footer={<Btn kind="primary" onClick={() => setModal(null)}>关闭</Btn>}>
          <table className="aw-table" style={{ width: '100%' }}><thead><tr><th>时间</th><th>操作人</th><th>对象</th><th>动作</th><th>结果</th></tr></thead><tbody>
            {rows.slice(0, 4).map((row, idx) => <tr key={row.name}><td>{row.updated}</td><td>{row.owner}</td><td>{row.name}</td><td>{idx % 2 ? '修改参数' : '查看配置'}</td><td><Badge tone="g">成功</Badge></td></tr>)}
          </tbody></table>
        </Modal>
      )}
      {modal?.type === 'rowLog' && (
        <Modal title="参数操作日志" subtitle={modal.row.name} size="md" onClose={() => setModal(null)} footer={<Btn kind="primary" onClick={() => setModal(null)}>关闭</Btn>}>
          <InfoGrid columns={2} items={[{ label: '设置项', value: modal.row.name }, { label: '负责人', value: modal.row.owner }, { label: '更新时间', value: modal.row.updated }, { label: '状态', value: modal.row.enabled ? '启用' : '停用' }]} />
        </Modal>
      )}
      {modal?.type === 'backup' && (
        <Modal title="数据备份" size="md" onClose={() => setModal(null)} footer={<><Btn onClick={() => setToast('已生成备份校验清单')}>校验备份</Btn><Btn kind="primary" onClick={() => { setToast('已开始执行数据备份'); setModal(null); }}>立即备份</Btn></>}>
          <InfoGrid columns={2} items={[{ label: '备份策略', value: '每日增量 / 每周全量' }, { label: '最近备份', value: '2026-05-18 23:00' }, { label: '备份范围', value: '业务数据、附件索引、系统参数' }, { label: '预计耗时', value: '约 12 分钟' }]} />
        </Modal>
      )}
      <SettingsToast text={toast} onClose={() => setToast('')} />
    </>
  );
}

function SettingsUserPage() {
  const [users, setUsers] = useSettingsState(SETTING_USERS);
  const [kw, setKw] = useSettingsState('');
  const [modal, setModal] = useSettingsState(null);
  const [form, setForm] = useSettingsState({ id: '', name: '', dept: '研发中心', role: '普通员工', state: '启用' });
  const [toast, setToast] = useSettingsState('');
  const filtered = users.filter(row => [row.id, row.name, row.dept, row.role, row.state].join(' ').includes(kw.trim()));
  const openForm = (row) => {
    setForm(row ? { ...row } : { id: `U-${10000 + users.length + 41}`, name: '', dept: '研发中心', role: '普通员工', state: '启用', last: '未登录' });
    setModal({ type: row ? 'edit' : 'new', id: row?.id });
  };
  const saveUser = () => {
    if (!form.name.trim()) return;
    if (modal?.type === 'edit') setUsers(prev => prev.map(row => row.id === modal.id ? { ...form } : row));
    else setUsers(prev => [...prev, { ...form }]);
    setModal(null);
    setToast(modal?.type === 'edit' ? '用户信息已保存' : '用户已新增');
  };
  const toggleUser = (id) => setUsers(prev => prev.map(row => row.id === id ? { ...row, state: row.state === '启用' ? '停用' : '启用' } : row));

  return (
    <>
      <Card title="用户管理">
        <div className="aw-doc-tb" style={{ marginBottom: 12 }}>
          <div className="aw-doc-search"><input placeholder="搜索姓名、账号、部门" value={kw} onChange={e => setKw(e.target.value)} /></div>
          <Btn onClick={() => setModal({ type: 'dept' })}>部门管理</Btn>
          <Btn onClick={() => setModal({ type: 'import' })}>导入用户</Btn>
          <Btn kind="primary" onClick={() => openForm(null)}>新增用户</Btn>
        </div>
        <table className="aw-table" style={{ width: '100%' }}>
          <thead><tr><th>账号</th><th>姓名</th><th>部门</th><th>角色</th><th>状态</th><th>最后登录</th><th>操作</th></tr></thead>
          <tbody>
            {filtered.map(row => (
              <tr key={row.id}>
                <td className="aw-num">{row.id}</td><td>{row.name}</td><td>{row.dept}</td><td>{row.role}</td>
                <td><Badge tone={row.state === '启用' ? 'g' : 'r'}>{row.state}</Badge></td><td>{row.last}</td>
                <td><span className="aw-link" onClick={() => openForm(row)}>编辑</span><span className="aw-link" style={{ marginLeft: 12 }} onClick={() => setModal({ type: 'reset', row })}>重置密码</span><span className="aw-link" style={{ marginLeft: 12 }} onClick={() => toggleUser(row.id)}>{row.state === '启用' ? '停用' : '启用'}</span></td>
              </tr>
            ))}
            {filtered.length === 0 && <SettingsEmptyRow colSpan={7} />}
          </tbody>
        </table>
      </Card>
      {(modal?.type === 'new' || modal?.type === 'edit') && (
        <Modal title={modal.type === 'edit' ? '编辑用户' : '新增用户'} size="md" onClose={() => setModal(null)} footer={<><Btn onClick={() => setModal(null)}>取消</Btn><Btn kind="primary" onClick={saveUser}>保存</Btn></>}>
          <FormGrid columns={2}>
            <Field label="账号" req><Input value={form.id} onChange={e => setForm(v => ({ ...v, id: e.target.value }))} /></Field>
            <Field label="姓名" req><Input value={form.name} onChange={e => setForm(v => ({ ...v, name: e.target.value }))} placeholder="请输入姓名" /></Field>
            <Field label="部门"><Select value={form.dept} onChange={e => setForm(v => ({ ...v, dept: e.target.value }))}>{SETTINGS_MODULE_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}</Select></Field>
            <Field label="角色"><Select value={form.role} onChange={e => setForm(v => ({ ...v, role: e.target.value }))}>{SETTINGS_ROLE_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}</Select></Field>
            <Field label="状态"><Select value={form.state} onChange={e => setForm(v => ({ ...v, state: e.target.value }))}><option>启用</option><option>停用</option></Select></Field>
          </FormGrid>
        </Modal>
      )}
      {modal?.type === 'reset' && <ConfirmModal title="重置密码" message={`确认将 ${modal.row.name} 的密码重置为初始密码吗？`} onClose={() => setModal(null)} onConfirm={() => setToast('密码已重置，并生成通知任务')} confirmText="重置" />}
      {modal?.type === 'dept' && (
        <Modal title="部门管理" size="md" onClose={() => setModal(null)} footer={<Btn kind="primary" onClick={() => setModal(null)}>完成</Btn>}>
          <table className="aw-table" style={{ width: '100%' }}><thead><tr><th>部门</th><th>用户数</th><th>负责人</th></tr></thead><tbody>{SETTINGS_MODULE_OPTIONS.slice(0, 8).map((name, idx) => <tr key={name}><td>{name}</td><td className="aw-num">{idx * 9 + 12}</td><td>{SETTING_MODULE_GUIDES[idx]?.owner || '管理员'}</td></tr>)}</tbody></table>
        </Modal>
      )}
      {modal?.type === 'import' && (
        <Modal title="导入用户" size="md" onClose={() => setModal(null)} footer={<><Btn onClick={() => setToast('已下载用户导入模板')}>下载模板</Btn><Btn kind="primary" onClick={() => { setToast('已模拟导入 3 个用户'); setModal(null); }}>开始导入</Btn></>}>
          <div style={{ border: '1px dashed var(--aw-border-strong)', borderRadius: 8, padding: 28, textAlign: 'center', color: 'var(--aw-fg-3)' }}>拖拽用户 Excel 到此处，或点击选择文件</div>
        </Modal>
      )}
      <SettingsToast text={toast} onClose={() => setToast('')} />
    </>
  );
}

function SettingsRolePage() {
  const [roles, setRoles] = useSettingsState(SETTING_ROLES);
  const [kw, setKw] = useSettingsState('');
  const [active, setActive] = useSettingsState(SETTING_ROLES[0].name);
  const [perm, setPerm] = useSettingsState({ menu: true, action: true, field: false, data: true });
  const [assignPerm, setAssignPerm] = useSettingsState([true, true, true, true, true, false, false, false, false]);
  const [buttonPerms, setButtonPerms] = useSettingsState({
    '系统管理员': buildButtonPerm('admin'),
    '业务主管': buildButtonPerm('manager'),
    '普通员工': buildButtonPerm('staff'),
    '审计只读': buildButtonPerm('readonly'),
  });
  const [fieldPerms, setFieldPerms] = useSettingsState({
    '系统管理员': buildFieldPerm('admin'),
    '业务主管': buildFieldPerm('manager'),
    '普通员工': buildFieldPerm('staff'),
    '审计只读': buildFieldPerm('readonly'),
  });
  const [buttonDraft, setButtonDraft] = useSettingsState(buildButtonPerm('manager'));
  const [fieldDraft, setFieldDraft] = useSettingsState(buildFieldPerm('manager'));
  const [buttonModule, setButtonModule] = useSettingsState('设置中心');
  const [fieldModule, setFieldModule] = useSettingsState('设置中心');
  const [modal, setModal] = useSettingsState(null);
  const [form, setForm] = useSettingsState({ name: '', menu: '业务中心', data: '本中心及下级', users: 0 });
  const [toast, setToast] = useSettingsState('');
  const filtered = roles.filter(row => [row.name, row.menu, row.data].join(' ').includes(kw.trim()));
  const activeButtonPerm = buttonPerms[active] || buildButtonPerm('manager');
  const activeFieldPerm = fieldPerms[active] || buildFieldPerm('manager');
  const buttonScopeRows = SETTING_BUTTON_SCOPES.filter(scope => buttonModule === '全部模块' || scope.module === buttonModule);
  const fieldScopeRows = SETTING_FIELD_SCOPES.filter(scope => fieldModule === '全部模块' || scope.module === fieldModule);
  const openForm = (row, copy = false) => {
    setForm(row ? { ...row, name: copy ? `${row.name}副本` : row.name } : { name: '', menu: '业务中心', data: '本中心及下级', users: 0 });
    setModal({ type: copy ? 'copy' : 'new', source: row?.name });
  };
  const saveRole = () => {
    if (!form.name.trim()) return;
    const next = { ...form, users: Number(form.users) || 0, updated: new Date().toISOString().slice(0, 10) };
    setRoles(prev => modal?.type === 'copy' || modal?.type === 'new' ? [...prev, next] : prev);
    setButtonPerms(prev => ({ ...prev, [next.name]: modal?.type === 'copy' && modal.source ? JSON.parse(JSON.stringify(prev[modal.source] || buildButtonPerm('manager'))) : buildButtonPerm('staff') }));
    setFieldPerms(prev => ({ ...prev, [next.name]: modal?.type === 'copy' && modal.source ? JSON.parse(JSON.stringify(prev[modal.source] || buildFieldPerm('manager'))) : buildFieldPerm('staff') }));
    setActive(next.name);
    setModal(null);
    setToast(modal?.type === 'copy' ? '角色已复制' : '角色已新增');
  };
  const openButtonPerm = (roleName = active) => {
    setButtonDraft(JSON.parse(JSON.stringify(buttonPerms[roleName] || buildButtonPerm('manager'))));
    setButtonModule('设置中心');
    setModal({ type: 'buttonPerm', roleName });
  };
  const openFieldPerm = (roleName = active) => {
    setFieldDraft(JSON.parse(JSON.stringify(fieldPerms[roleName] || buildFieldPerm('manager'))));
    setFieldModule('设置中心');
    setModal({ type: 'fieldPerm', roleName });
  };
  const setButtonAction = (scopeKey, actionKey, value) => {
    setButtonDraft(prev => ({
      ...prev,
      [scopeKey]: { ...(prev[scopeKey] || {}), [actionKey]: value },
    }));
  };
  const setScopeAll = (scopeKey, value) => {
    setButtonDraft(prev => ({
      ...prev,
      [scopeKey]: Object.fromEntries(SETTING_BUTTON_ACTIONS.map(action => [action.key, value])),
    }));
  };
  const saveButtonPerm = () => {
    setButtonPerms(prev => ({ ...prev, [modal.roleName]: buttonDraft }));
    setModal(null);
    setToast(`${modal.roleName}的按钮权限已保存`);
  };
  const setFieldAction = (scopeKey, actionKey, value) => {
    setFieldDraft(prev => ({
      ...prev,
      [scopeKey]: { ...(prev[scopeKey] || {}), [actionKey]: value },
    }));
  };
  const setFieldAll = (scopeKey, value) => {
    setFieldDraft(prev => ({
      ...prev,
      [scopeKey]: { visible: value, editable: value, required: false, masked: false },
    }));
  };
  const saveFieldPerm = () => {
    setFieldPerms(prev => ({ ...prev, [modal.roleName]: fieldDraft }));
    setModal(null);
    setToast(`${modal.roleName}的字段权限已保存`);
  };

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, .8fr)', gap: 14, alignItems: 'start' }}>
        <Card title="角色权限">
          <div className="aw-doc-tb" style={{ marginBottom: 12 }}>
            <div className="aw-doc-search"><input placeholder="搜索角色名称" value={kw} onChange={e => setKw(e.target.value)} /></div>
            <Btn kind="primary" onClick={() => openForm(null)}>新增角色</Btn>
          </div>
          <table className="aw-table" style={{ width: '100%' }}>
            <thead><tr><th>角色</th><th>成员数</th><th>菜单权限</th><th>数据权限</th><th>更新日期</th><th>操作</th></tr></thead>
            <tbody>{filtered.map(row => (
              <tr key={row.name} onClick={() => setActive(row.name)} style={{ background: active === row.name ? 'var(--aw-primary-soft)' : undefined }}>
                <td>{row.name}</td><td className="aw-num">{row.users}</td><td>{row.menu}</td><td>{row.data}</td><td>{row.updated}</td>
                <td><span className="aw-link" onClick={(e) => { e.stopPropagation(); setAssignPerm([true, true, true, true, true, false, false, false, false]); setModal({ type: 'assign', row }); }}>分配</span><span className="aw-link" style={{ marginLeft: 12 }} onClick={(e) => { e.stopPropagation(); openButtonPerm(row.name); }}>按钮</span><span className="aw-link" style={{ marginLeft: 12 }} onClick={(e) => { e.stopPropagation(); openFieldPerm(row.name); }}>字段</span><span className="aw-link" style={{ marginLeft: 12 }} onClick={(e) => { e.stopPropagation(); openForm(row, true); }}>复制</span></td>
              </tr>
            ))}
            {filtered.length === 0 && <SettingsEmptyRow colSpan={6} />}
            </tbody>
          </table>
        </Card>
        <Card title="权限配置预览">
          <div style={{ fontSize: 12, color: 'var(--aw-fg-3)', marginBottom: 8 }}>当前角色：{active}</div>
          {[
            ['menu', '菜单权限'],
            ['action', '操作权限'],
            ['field', '字段权限'],
            ['data', '数据范围'],
          ].map(([key, name], idx) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: idx === 3 ? 0 : '1px solid var(--aw-divider)' }}>
              <div><div style={{ fontWeight: 600 }}>{name}</div><div style={{ fontSize: 12, color: 'var(--aw-fg-3)', marginTop: 4 }}>跟随角色模板，可单独覆盖</div></div>
              <Switch on={perm[key]} onChange={v => { setPerm(prev => ({ ...prev, [key]: v })); setToast(`${name}已${v ? '启用' : '关闭'}`); }} />
            </div>
          ))}
        </Card>
      </div>
      <Card title="按钮级权限控制" style={{ marginTop: 14 }}>
        <div className="aw-doc-tb" style={{ marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--aw-fg-2)' }}>当前角色：{active}</span>
          <span style={{ flex: 1 }} />
          <Select value={buttonModule} onChange={e => setButtonModule(e.target.value)} style={{ width: 180 }}>
            <option>全部模块</option>
            {[...new Set(SETTING_BUTTON_SCOPES.map(scope => scope.module))].map(name => <option key={name}>{name}</option>)}
          </Select>
          <Btn kind="primary" onClick={() => openButtonPerm(active)}>配置按钮权限</Btn>
          <Btn kind="primary" onClick={() => openFieldPerm(active)}>配置字段权限</Btn>
        </div>
        <div className="aw-doc-tbl-wrap" style={{ border: 0, borderRadius: 0 }}>
          <table className="aw-doc-tbl">
            <thead>
              <tr>
                <th><div className="aw-th-inner">模块</div></th>
                <th><div className="aw-th-inner">页面</div></th>
                {SETTING_BUTTON_ACTIONS.map(action => <th key={action.key} style={{ width: 78, textAlign: 'center' }}><div className="aw-th-inner" style={{ justifyContent: 'center' }}>{action.label}</div></th>)}
              </tr>
            </thead>
            <tbody>
              {buttonScopeRows.map(scope => (
                <tr key={scope.key}>
                  <td>{scope.module}</td>
                  <td>{scope.page}</td>
                  {SETTING_BUTTON_ACTIONS.map(action => (
                    <td key={action.key} style={{ textAlign: 'center' }}>
                      <Badge tone={activeButtonPerm[scope.key]?.[action.key] ? 'g' : 'r'}>{activeButtonPerm[scope.key]?.[action.key] ? '允许' : '禁止'}</Badge>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card title="字段级权限控制" style={{ marginTop: 14 }}>
        <div className="aw-doc-tb" style={{ marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--aw-fg-2)' }}>当前角色：{active}</span>
          <span style={{ flex: 1 }} />
          <Select value={fieldModule} onChange={e => setFieldModule(e.target.value)} style={{ width: 180 }}>
            <option>全部模块</option>
            {[...new Set(SETTING_FIELD_SCOPES.map(scope => scope.module))].map(name => <option key={name}>{name}</option>)}
          </Select>
          <Btn kind="primary" onClick={() => openFieldPerm(active)}>配置字段权限</Btn>
        </div>
        <div className="aw-doc-tbl-wrap" style={{ border: 0, borderRadius: 0 }}>
          <table className="aw-doc-tbl">
            <thead>
              <tr>
                <th><div className="aw-th-inner">模块</div></th>
                <th><div className="aw-th-inner">页面</div></th>
                <th><div className="aw-th-inner">字段</div></th>
                {SETTING_FIELD_ACTIONS.map(action => <th key={action.key} style={{ width: 84, textAlign: 'center' }}><div className="aw-th-inner" style={{ justifyContent: 'center' }}>{action.label}</div></th>)}
              </tr>
            </thead>
            <tbody>
              {fieldScopeRows.map(scope => (
                <tr key={scope.key}>
                  <td>{scope.module}</td>
                  <td>{scope.page}</td>
                  <td>{scope.field}</td>
                  {SETTING_FIELD_ACTIONS.map(action => (
                    <td key={action.key} style={{ textAlign: 'center' }}>
                      <Badge tone={activeFieldPerm[scope.key]?.[action.key] ? (action.key === 'masked' ? 'y' : 'g') : 'r'}>{activeFieldPerm[scope.key]?.[action.key] ? '是' : '否'}</Badge>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {(modal?.type === 'new' || modal?.type === 'copy') && (
        <Modal title={modal.type === 'copy' ? '复制角色' : '新增角色'} size="md" onClose={() => setModal(null)} footer={<><Btn onClick={() => setModal(null)}>取消</Btn><Btn kind="primary" onClick={saveRole}>保存</Btn></>}>
          <FormGrid columns={2}>
            <Field label="角色名称" req><Input value={form.name} onChange={e => setForm(v => ({ ...v, name: e.target.value }))} /></Field>
            <Field label="成员数"><Input value={form.users} onChange={e => setForm(v => ({ ...v, users: e.target.value }))} /></Field>
            <Field label="菜单权限"><Select value={form.menu} onChange={e => setForm(v => ({ ...v, menu: e.target.value }))}><option>全部菜单</option><option>业务中心</option><option>工作台 / 单据</option><option>报表 / 日志</option></Select></Field>
            <Field label="数据权限"><Select value={form.data} onChange={e => setForm(v => ({ ...v, data: e.target.value }))}><option>全部数据</option><option>本中心及下级</option><option>本人及协作数据</option><option>只读数据</option></Select></Field>
          </FormGrid>
        </Modal>
      )}
      {modal?.type === 'assign' && (
        <Modal title="分配权限" subtitle={modal.row.name} size="lg" onClose={() => setModal(null)} footer={<><Btn onClick={() => setModal(null)}>取消</Btn><Btn kind="primary" onClick={() => { setToast('权限分配已保存'); setModal(null); }}>保存分配</Btn></>}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
            {['设置中心', '研发中心', '采购中心', '销售中心', '仓储中心', '生产中心', '质检中心', '财务中心', '人力中心'].map((name, idx) => (
              <label key={name} style={{ border: '1px solid var(--aw-border)', borderRadius: 8, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{name}</span><Switch on={assignPerm[idx]} onChange={v => setAssignPerm(prev => prev.map((item, i) => i === idx ? v : item))} />
              </label>
            ))}
          </div>
        </Modal>
      )}
      {modal?.type === 'buttonPerm' && (
        <Modal title="按钮权限配置" subtitle={modal.roleName} size="xl" onClose={() => setModal(null)} footer={<><Btn onClick={() => setModal(null)}>取消</Btn><Btn kind="primary" onClick={saveButtonPerm}>保存按钮权限</Btn></>}>
          <div className="aw-doc-tb" style={{ marginBottom: 12, border: 0, padding: 0 }}>
            <span style={{ fontSize: 13, color: 'var(--aw-fg-2)' }}>按模块页面控制按钮是否可见、可点击</span>
            <span style={{ flex: 1 }} />
            <Select value={buttonModule} onChange={e => setButtonModule(e.target.value)} style={{ width: 180 }}>
              <option>全部模块</option>
              {[...new Set(SETTING_BUTTON_SCOPES.map(scope => scope.module))].map(name => <option key={name}>{name}</option>)}
            </Select>
          </div>
          <div className="aw-doc-tbl-wrap" style={{ maxHeight: 420, overflow: 'auto' }}>
            <table className="aw-doc-tbl">
              <thead>
                <tr>
                  <th style={{ width: 120 }}><div className="aw-th-inner">模块</div></th>
                  <th style={{ width: 130 }}><div className="aw-th-inner">页面</div></th>
                  <th style={{ width: 86 }}><div className="aw-th-inner">整行</div></th>
                  {SETTING_BUTTON_ACTIONS.map(action => <th key={action.key} style={{ width: 82, textAlign: 'center' }}><div className="aw-th-inner" style={{ justifyContent: 'center' }}>{action.label}</div></th>)}
                </tr>
              </thead>
              <tbody>
                {buttonScopeRows.map(scope => {
                  const row = buttonDraft[scope.key] || {};
                  const allOn = SETTING_BUTTON_ACTIONS.every(action => row[action.key]);
                  return (
                    <tr key={scope.key}>
                      <td>{scope.module}</td>
                      <td>{scope.page}</td>
                      <td><Switch on={allOn} onChange={v => setScopeAll(scope.key, v)} /></td>
                      {SETTING_BUTTON_ACTIONS.map(action => (
                        <td key={action.key} style={{ textAlign: 'center' }}>
                          <Switch on={!!row[action.key]} onChange={v => setButtonAction(scope.key, action.key, v)} />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Modal>
      )}
      {modal?.type === 'fieldPerm' && (
        <Modal title="字段权限配置" subtitle={modal.roleName} size="xl" onClose={() => setModal(null)} footer={<><Btn onClick={() => setModal(null)}>取消</Btn><Btn kind="primary" onClick={saveFieldPerm}>保存字段权限</Btn></>}>
          <div className="aw-doc-tb" style={{ marginBottom: 12, border: 0, padding: 0 }}>
            <span style={{ fontSize: 13, color: 'var(--aw-fg-2)' }}>控制字段是否展示、是否允许编辑、是否必填和是否脱敏</span>
            <span style={{ flex: 1 }} />
            <Select value={fieldModule} onChange={e => setFieldModule(e.target.value)} style={{ width: 180 }}>
              <option>全部模块</option>
              {[...new Set(SETTING_FIELD_SCOPES.map(scope => scope.module))].map(name => <option key={name}>{name}</option>)}
            </Select>
          </div>
          <div className="aw-doc-tbl-wrap" style={{ maxHeight: 420, overflow: 'auto' }}>
            <table className="aw-doc-tbl">
              <thead>
                <tr>
                  <th style={{ width: 120 }}><div className="aw-th-inner">模块</div></th>
                  <th style={{ width: 130 }}><div className="aw-th-inner">页面</div></th>
                  <th style={{ width: 130 }}><div className="aw-th-inner">字段</div></th>
                  <th style={{ width: 86 }}><div className="aw-th-inner">整行</div></th>
                  {SETTING_FIELD_ACTIONS.map(action => <th key={action.key} style={{ width: 86, textAlign: 'center' }}><div className="aw-th-inner" style={{ justifyContent: 'center' }}>{action.label}</div></th>)}
                </tr>
              </thead>
              <tbody>
                {fieldScopeRows.map(scope => {
                  const row = fieldDraft[scope.key] || {};
                  const allOn = row.visible && row.editable;
                  return (
                    <tr key={scope.key}>
                      <td>{scope.module}</td>
                      <td>{scope.page}</td>
                      <td>{scope.field}</td>
                      <td><Switch on={allOn} onChange={v => setFieldAll(scope.key, v)} /></td>
                      {SETTING_FIELD_ACTIONS.map(action => (
                        <td key={action.key} style={{ textAlign: 'center' }}>
                          <Switch on={!!row[action.key]} onChange={v => setFieldAction(scope.key, action.key, v)} />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Modal>
      )}
      <SettingsToast text={toast} onClose={() => setToast('')} />
    </>
  );
}

function SettingsCodeRulesPage() {
  const moduleNames = ['全部模块', ...new Set(SETTING_CODE_RULE_FORMS.map(row => row.module))];
  const [activeModule, setActiveModule] = useSettingsState('全部模块');
  const [kw, setKw] = useSettingsState('');
  const [rows, setRows] = useSettingsState(SETTING_CODE_RULE_FORMS);
  const [modal, setModal] = useSettingsState(null);
  const [form, setForm] = useSettingsState(null);
  const [toast, setToast] = useSettingsState('');
  const filtered = rows.filter(row => {
    const moduleOk = activeModule === '全部模块' || row.module === activeModule;
    const kwText = kw.trim();
    const kwOk = !kwText || [row.module, row.form, row.object, row.prefix, row.sample, row.owner].join(' ').includes(kwText);
    return moduleOk && kwOk;
  });
  const openRule = (row) => {
    setForm({ ...row });
    setModal({ type: 'rule', id: row.id });
  };
  const saveRule = () => {
    if (!form?.prefix?.trim()) return;
    const prefix = form.prefix.trim().toUpperCase();
    const next = {
      ...form,
      prefix,
      sample: `${prefix}-202605-001`,
      updated: new Date().toISOString().slice(0, 10),
    };
    setRows(prev => prev.map(row => row.id === modal.id ? next : row));
    setModal(null);
    setToast(`${next.form}编码规则已保存`);
  };
  const toggleRow = (id) => {
    setRows(prev => prev.map(row => row.id === id ? { ...row, status: row.status === '启用' ? '停用' : '启用' } : row));
  };

  return (
    <>
      <div className="aw-doc-page" style={{ alignItems: 'flex-start' }}>
        <div className="aw-doc-tree" style={{ width: 240, flex: 'none' }}>
          <div className="aw-doc-tree-h">系统模块分类</div>
          {moduleNames.map(name => {
            const count = name === '全部模块' ? rows.length : rows.filter(row => row.module === name).length;
            return (
              <div key={name} className={'aw-tree-row' + (activeModule === name ? ' on' : '')} onClick={() => setActiveModule(name)} style={{ cursor: 'pointer', margin: '0 8px' }}>
                <span style={{ flex: 1 }}>{name}</span>
                <span style={{ fontSize: 12, color: 'var(--aw-fg-3)' }}>{count}</span>
              </div>
            );
          })}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Card title="编码规则列表">
            <div className="aw-doc-tb" style={{ marginBottom: 12 }}>
              <div className="aw-doc-search"><input placeholder="搜索模块、表单、前缀、负责人" value={kw} onChange={e => setKw(e.target.value)} /></div>
              <Badge>{filtered.length} 个表单</Badge>
              <Btn onClick={() => setModal({ type: 'preview' })}>编码预览</Btn>
              <Btn kind="primary" onClick={() => filtered[0] && openRule(filtered[0])}>设置规则</Btn>
            </div>
            <div className="aw-doc-tbl-wrap" style={{ border: 0, borderRadius: 0 }}>
              <table className="aw-doc-tbl">
                <thead>
                  <tr>
                    <th><div className="aw-th-inner">所属模块</div></th>
                    <th><div className="aw-th-inner">涉及编码的表单</div></th>
                    <th><div className="aw-th-inner">编码对象</div></th>
                    <th style={{ width: 110 }}><div className="aw-th-inner">前缀</div></th>
                    <th><div className="aw-th-inner">编码示例</div></th>
                    <th style={{ width: 90 }}><div className="aw-th-inner">状态</div></th>
                    <th style={{ width: 120 }}><div className="aw-th-inner">负责人</div></th>
                    <th style={{ width: 120 }}><div className="aw-th-inner">更新日期</div></th>
                    <th style={{ width: 150 }}><div className="aw-th-inner">操作</div></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(row => (
                    <tr key={row.id}>
                      <td>{row.module}</td>
                      <td style={{ fontWeight: 600 }}>{row.form}</td>
                      <td>{row.object}</td>
                      <td className="aw-num">{row.prefix}</td>
                      <td className="aw-num">{row.sample}</td>
                      <td><Badge tone={row.status === '启用' ? 'g' : 'r'}>{row.status}</Badge></td>
                      <td>{row.owner}</td>
                      <td>{row.updated}</td>
                      <td><span className="aw-link" onClick={() => openRule(row)}>设置规则</span><span className="aw-link" style={{ marginLeft: 12 }} onClick={() => toggleRow(row.id)}>{row.status === '启用' ? '停用' : '启用'}</span></td>
                    </tr>
                  ))}
                  {filtered.length === 0 && <SettingsEmptyRow colSpan={9} text="暂无涉及编码的表单" />}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
      {modal?.type === 'rule' && form && (
        <Modal title="设置编码规则" subtitle={`${form.module} / ${form.form}`} size="md" onClose={() => setModal(null)} footer={<><Btn onClick={() => setModal(null)}>取消</Btn><Btn kind="primary" onClick={saveRule}>保存规则</Btn></>}>
          <FormGrid columns={2}>
            <Field label="编码对象"><Input value={form.object} onChange={e => setForm(v => ({ ...v, object: e.target.value }))} /></Field>
            <Field label="编码前缀" req><Input value={form.prefix} onChange={e => setForm(v => ({ ...v, prefix: e.target.value }))} /></Field>
            <Field label="日期规则"><Select defaultValue="年月"><option>年月</option><option>年月日</option><option>年</option></Select></Field>
            <Field label="流水号位数"><Select defaultValue="3位"><option>3位</option><option>4位</option><option>5位</option></Select></Field>
            <Field label="分隔符"><Select defaultValue="-"><option>-</option><option>无</option><option>_</option></Select></Field>
            <Field label="状态"><Select value={form.status} onChange={e => setForm(v => ({ ...v, status: e.target.value }))}><option>启用</option><option>停用</option></Select></Field>
          </FormGrid>
          <div style={{ marginTop: 16, padding: 14, border: '1px solid var(--aw-border)', borderRadius: 8, background: 'var(--aw-bg)' }}>
            <div style={{ fontSize: 12, color: 'var(--aw-fg-3)', marginBottom: 6 }}>编码预览</div>
            <div className="aw-num" style={{ fontSize: 20, fontWeight: 700 }}>{`${(form.prefix || 'CODE').toUpperCase()}-202605-001`}</div>
          </div>
        </Modal>
      )}
      {modal?.type === 'preview' && (
        <Modal title="编码预览" subtitle={activeModule} size="lg" onClose={() => setModal(null)} footer={<Btn kind="primary" onClick={() => setModal(null)}>关闭</Btn>}>
          <table className="aw-table" style={{ width: '100%' }}>
            <thead><tr><th>模块</th><th>表单</th><th>规则</th><th>下一编号</th></tr></thead>
            <tbody>{filtered.slice(0, 8).map(row => <tr key={row.id}><td>{row.module}</td><td>{row.form}</td><td>{row.prefix} + 年月 + 3位流水</td><td className="aw-num">{row.sample}</td></tr>)}</tbody>
          </table>
        </Modal>
      )}
      <SettingsToast text={toast} onClose={() => setToast('')} />
    </>
  );
}

function SettingsDictPage() {
  const [dicts, setDicts] = useSettingsState(SETTING_DICTS);
  const [kw, setKw] = useSettingsState('');
  const [modal, setModal] = useSettingsState(null);
  const [form, setForm] = useSettingsState({ code: '', name: '', items: 0, module: '研发中心', state: '启用' });
  const [items, setItems] = useSettingsState([
    { label: '技术文档', value: 'tech_doc', enabled: true },
    { label: '工艺文件', value: 'process_doc', enabled: true },
    { label: '操作规范', value: 'operation_spec', enabled: false },
  ]);
  const [toast, setToast] = useSettingsState('');
  const filtered = dicts.filter(row => [row.code, row.name, row.module, row.state].join(' ').includes(kw.trim()));
  const openForm = (row) => {
    setForm(row ? { ...row } : { code: '', name: '', items: 0, module: '研发中心', state: '启用' });
    setModal({ type: row ? 'edit' : 'new', code: row?.code });
  };
  const saveDict = () => {
    if (!form.code.trim() || !form.name.trim()) return;
    const next = { ...form, items: Number(form.items) || 0 };
    if (modal?.type === 'edit') setDicts(prev => prev.map(row => row.code === modal.code ? next : row));
    else setDicts(prev => [...prev, next]);
    setModal(null);
    setToast(modal?.type === 'edit' ? '字典已保存' : '字典已新增');
  };
  const toggleDict = (code) => setDicts(prev => prev.map(row => row.code === code ? { ...row, state: row.state === '启用' ? '停用' : '启用' } : row));
  const addItem = () => setItems(prev => [...prev, { label: `新增字典项${prev.length + 1}`, value: `item_${prev.length + 1}`, enabled: true }]);

  return (
    <>
      <Card title="基础数据">
        <div className="aw-doc-tb" style={{ marginBottom: 12 }}>
          <div className="aw-doc-search"><input placeholder="搜索字典编码、字典名称" value={kw} onChange={e => setKw(e.target.value)} /></div>
          <Btn onClick={() => setModal({ type: 'category' })}>字典分类</Btn>
          <Btn kind="primary" onClick={() => openForm(null)}>新增字典</Btn>
        </div>
        <table className="aw-table" style={{ width: '100%' }}>
          <thead><tr><th>字典编码</th><th>字典名称</th><th>字典项</th><th>所属模块</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>{filtered.map(row => (
            <tr key={row.code}><td className="aw-num">{row.code}</td><td>{row.name}</td><td className="aw-num">{row.items}</td><td>{row.module}</td><td><Badge tone={row.state === '启用' ? 'g' : 'r'}>{row.state}</Badge></td><td><span className="aw-link" onClick={() => setModal({ type: 'items', row })}>维护字典项</span><span className="aw-link" style={{ marginLeft: 12 }} onClick={() => openForm(row)}>编辑</span><span className="aw-link" style={{ marginLeft: 12 }} onClick={() => toggleDict(row.code)}>{row.state === '启用' ? '停用' : '启用'}</span></td></tr>
          ))}
          {filtered.length === 0 && <SettingsEmptyRow colSpan={6} />}
          </tbody>
        </table>
      </Card>
      {(modal?.type === 'new' || modal?.type === 'edit') && (
        <Modal title={modal.type === 'edit' ? '编辑字典' : '新增字典'} size="md" onClose={() => setModal(null)} footer={<><Btn onClick={() => setModal(null)}>取消</Btn><Btn kind="primary" onClick={saveDict}>保存</Btn></>}>
          <FormGrid columns={2}>
            <Field label="字典编码" req><Input value={form.code} onChange={e => setForm(v => ({ ...v, code: e.target.value }))} placeholder="如 doc_type" /></Field>
            <Field label="字典名称" req><Input value={form.name} onChange={e => setForm(v => ({ ...v, name: e.target.value }))} /></Field>
            <Field label="字典项数量"><Input value={form.items} onChange={e => setForm(v => ({ ...v, items: e.target.value }))} /></Field>
            <Field label="所属模块"><Select value={form.module} onChange={e => setForm(v => ({ ...v, module: e.target.value }))}>{SETTINGS_MODULE_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}</Select></Field>
            <Field label="状态"><Select value={form.state} onChange={e => setForm(v => ({ ...v, state: e.target.value }))}><option>启用</option><option>停用</option></Select></Field>
          </FormGrid>
        </Modal>
      )}
      {modal?.type === 'items' && (
        <Modal title="维护字典项" subtitle={modal.row.name} size="lg" onClose={() => setModal(null)} footer={<><Btn onClick={addItem}>新增字典项</Btn><Btn kind="primary" onClick={() => { setToast('字典项已保存'); setModal(null); }}>保存</Btn></>}>
          <table className="aw-table" style={{ width: '100%' }}><thead><tr><th>字典项名称</th><th>字典值</th><th>启用</th><th>操作</th></tr></thead><tbody>{items.map((item, idx) => (
            <tr key={idx}><td><Input value={item.label} onChange={e => setItems(prev => prev.map((x, i) => i === idx ? { ...x, label: e.target.value } : x))} /></td><td><Input value={item.value} onChange={e => setItems(prev => prev.map((x, i) => i === idx ? { ...x, value: e.target.value } : x))} /></td><td><Switch on={item.enabled} onChange={v => setItems(prev => prev.map((x, i) => i === idx ? { ...x, enabled: v } : x))} /></td><td><span className="aw-link" style={{ color: 'var(--aw-danger)' }} onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))}>删除</span></td></tr>
          ))}</tbody></table>
        </Modal>
      )}
      {modal?.type === 'category' && (
        <Modal title="字典分类" size="md" onClose={() => setModal(null)} footer={<Btn kind="primary" onClick={() => setModal(null)}>完成</Btn>}>
          <table className="aw-table" style={{ width: '100%' }}><thead><tr><th>分类</th><th>字典数</th><th>状态</th></tr></thead><tbody>{['基础资料', '业务状态', '质量标准', '财务科目'].map((name, idx) => <tr key={name}><td>{name}</td><td className="aw-num">{idx * 8 + 6}</td><td><Badge tone="g">启用</Badge></td></tr>)}</tbody></table>
        </Modal>
      )}
      <SettingsToast text={toast} onClose={() => setToast('')} />
    </>
  );
}

function SettingsGuidePage({ active, setActive, mode, setMode, action, onActionConsumed }) {
  const current = SETTING_MODULE_GUIDES.find(item => item.key === active) || SETTING_MODULE_GUIDES[0];
  const [doneMap, setDoneMap] = useSettingsState({});
  const [modal, setModal] = useSettingsState(null);
  const [toast, setToast] = useSettingsState('');
  const doneCount = doneMap[current.key] ?? 3;
  const progress = Math.min(100, Math.round((doneCount / current.steps.length) * 100));

  React.useEffect(() => {
    if (!action) return;
    if (action === 'new') setModal({ type: 'new' });
    if (action === 'publish') setModal({ type: 'publish' });
    if (action === 'logs') setModal({ type: 'logs' });
    onActionConsumed && onActionConsumed();
  }, [action]);

  const markTask = (idx) => {
    setDoneMap(prev => ({ ...prev, [current.key]: Math.max(prev[current.key] ?? 3, idx + 1) }));
    setToast('配置任务已标记完成');
  };
  const applyTemplate = (template) => {
    setDoneMap(prev => ({ ...prev, [current.key]: Math.max(prev[current.key] ?? 3, template === '精细化管控模板' ? 5 : 4) }));
    setToast(`${template}已套用到${current.name}`);
  };
  const generateTask = (name) => {
    setMode('tasks');
    setToast(`${name}整改任务已生成`);
  };

  return (
    <>
      <div className="aw-doc-page" style={{ alignItems: 'flex-start' }}>
        <div className="aw-doc-tree" style={{ width: 240, flex: 'none' }}>
          <div className="aw-doc-tree-h">模块引导</div>
          {SETTING_MODULE_GUIDES.map(item => {
            const itemDone = doneMap[item.key] ?? 3;
            const itemProgress = Math.min(100, Math.round((itemDone / item.steps.length) * 100));
            return (
              <div key={item.key} className={'aw-tree-row' + (item.key === current.key ? ' on' : '')} onClick={() => setActive(item.key)} style={{ cursor: 'pointer', margin: '0 8px' }}>
                <span style={{ flex: 1 }}>{item.name}</span>
                <span style={{ fontSize: 12, color: 'var(--aw-fg-3)' }}>{itemProgress}%</span>
              </div>
            );
          })}
        </div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 8, background: 'var(--aw-primary-soft)', color: 'var(--aw-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TileIcon name="flow" size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{current.name}</div>
                <div style={{ fontSize: 12, color: 'var(--aw-fg-3)', marginTop: 4 }}>{current.focus}</div>
              </div>
              <Btn onClick={() => setModal({ type: 'new' })}>新增引导</Btn>
              <Btn kind="primary" onClick={() => setModal({ type: 'publish' })}>发布校验</Btn>
              <Badge tone={progress >= 80 ? 'b' : 'y'}>{progress >= 80 ? '进行中' : '待完善'}</Badge>
            </div>
            <div style={{ height: 8, background: '#F1F3F7', borderRadius: 999, overflow: 'hidden', marginTop: 18 }}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'var(--aw-primary)' }} />
            </div>
          </Card>
          <Card>
            <Tabs
              items={[
                { k: 'overview', label: '引导总览' },
                { k: 'tasks', label: '配置任务' },
                { k: 'templates', label: '引导模板' },
                { k: 'progress', label: '进度校验' },
              ]}
              active={mode}
              onChange={setMode}
            />
            {mode === 'overview' && <SettingsGuideOverview current={current} doneCount={doneCount} />}
            {mode === 'tasks' && <SettingsGuideTasks current={current} doneCount={doneCount} onDone={markTask} />}
            {mode === 'templates' && <SettingsGuideTemplates current={current} onApply={applyTemplate} />}
            {mode === 'progress' && <SettingsGuideProgress current={current} doneCount={doneCount} onView={(name) => setModal({ type: 'view', name })} onGenerate={generateTask} />}
          </Card>
        </div>
      </div>
      {modal?.type === 'new' && (
        <Modal title="新增引导" subtitle={current.name} size="md" onClose={() => setModal(null)} footer={<><Btn onClick={() => setModal(null)}>取消</Btn><Btn kind="primary" onClick={() => { setToast('引导草稿已创建'); setModal(null); }}>保存草稿</Btn></>}>
          <FormGrid columns={2}>
            <Field label="引导名称" req><Input defaultValue={`${current.name}上线初始化引导`} /></Field>
            <Field label="触发时机"><Select defaultValue="首次进入"><option>首次进入</option><option>版本更新后</option><option>手动触发</option></Select></Field>
            <Field label="适用角色"><Select defaultValue="业务主管">{SETTINGS_ROLE_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}</Select></Field>
            <Field label="允许跳过"><Select defaultValue="允许"><option>允许</option><option>不允许</option></Select></Field>
          </FormGrid>
        </Modal>
      )}
      {modal?.type === 'publish' && (
        <Modal title="发布校验" subtitle={current.name} size="md" onClose={() => setModal(null)} footer={<><Btn onClick={() => setModal(null)}>取消</Btn><Btn kind="primary" onClick={() => { setDoneMap(prev => ({ ...prev, [current.key]: current.steps.length })); setToast('发布校验通过，进度已更新'); setModal(null); }}>通过并发布</Btn></>}>
          <table className="aw-table" style={{ width: '100%' }}><thead><tr><th>校验项</th><th>结果</th><th>说明</th></tr></thead><tbody>
            {['模块已选择', '步骤标题完整', '目标锚点有效', '角色范围已配置'].map((name, idx) => <tr key={name}><td>{name}</td><td><Badge tone={idx < doneCount ? 'g' : 'y'}>{idx < doneCount ? '通过' : '待完善'}</Badge></td><td>{idx < doneCount ? '满足发布要求' : '发布前建议补齐'}</td></tr>)}
          </tbody></table>
        </Modal>
      )}
      {modal?.type === 'logs' && (
        <Modal title="操作记录" subtitle={current.name} size="md" onClose={() => setModal(null)} footer={<Btn kind="primary" onClick={() => setModal(null)}>关闭</Btn>}>
          <table className="aw-table" style={{ width: '100%' }}><thead><tr><th>时间</th><th>操作人</th><th>动作</th></tr></thead><tbody><tr><td>2026-05-18 16:20</td><td>{current.owner}</td><td>更新引导模板</td></tr><tr><td>2026-05-17 11:08</td><td>{current.owner}</td><td>生成配置任务</td></tr></tbody></table>
        </Modal>
      )}
      {modal?.type === 'view' && (
        <Modal title="校验详情" subtitle={modal.name} size="md" onClose={() => setModal(null)} footer={<Btn kind="primary" onClick={() => setModal(null)}>知道了</Btn>}>
          <InfoGrid columns={2} items={[{ label: '所属模块', value: current.name }, { label: '校验项', value: modal.name }, { label: '当前状态', value: doneCount >= 4 ? '已配置' : '待完善' }, { label: '处理建议', value: '检查字段、流程、模板是否与业务模块一致' }]} />
        </Modal>
      )}
      <SettingsToast text={toast} onClose={() => setToast('')} />
    </>
  );
}

function SettingsGuideOverview({ current, doneCount }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 10 }}>
      {current.steps.map((step, idx) => (
        <div key={step} style={{ border: '1px solid var(--aw-border)', borderRadius: 8, padding: 14, minHeight: 112, background: idx < doneCount ? '#fff' : 'var(--aw-bg)' }}>
          <div style={{ width: 26, height: 26, borderRadius: 13, background: idx < doneCount ? 'var(--aw-primary)' : '#D1D5DB', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--aw-font-num)', fontSize: 12 }}>{idx + 1}</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 12 }}>{step}</div>
          <div style={{ fontSize: 12, color: 'var(--aw-fg-3)', marginTop: 6 }}>{idx < doneCount ? '已完成基础配置' : '待按模板继续完善'}</div>
        </div>
      ))}
    </div>
  );
}

function SettingsGuideTasks({ current, doneCount, onDone }) {
  return (
    <table className="aw-table" style={{ width: '100%' }}>
      <thead><tr><th>任务名称</th><th>负责人</th><th>依赖项</th><th>建议动作</th><th>状态</th><th>操作</th></tr></thead>
      <tbody>{current.steps.map((step, idx) => (
        <tr key={step}><td>{current.name} · {step}</td><td>{current.owner}</td><td>{idx === 0 ? '无' : current.steps[idx - 1]}</td><td>{idx < doneCount ? '复核配置' : '按模板补齐'}</td><td><Badge tone={idx < doneCount ? 'g' : 'y'}>{idx < doneCount ? '已完成' : '待处理'}</Badge></td><td><span className="aw-link" onClick={() => onDone(idx)}>{idx < doneCount ? '复核' : '完成'}</span></td></tr>
      ))}</tbody>
    </table>
  );
}

function SettingsGuideTemplates({ current, onApply }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
      {['标准初始化模板', '轻量审批模板', '精细化管控模板'].map((name, idx) => (
        <div key={name} style={{ border: '1px solid var(--aw-border)', borderRadius: 8, padding: 16 }}>
          <div style={{ fontWeight: 600 }}>{name}</div>
          <div style={{ fontSize: 12, color: 'var(--aw-fg-3)', margin: '8px 0 14px' }}>适用于{current.name}的{idx === 0 ? '基础上线' : idx === 1 ? '快速启用' : '深度管控'}场景</div>
          <Btn kind={idx === 0 ? 'primary' : 'secondary'} onClick={() => onApply(name)}>套用模板</Btn>
        </div>
      ))}
    </div>
  );
}

function SettingsGuideProgress({ current, doneCount, onView, onGenerate }) {
  const rows = [
    ['编码规则', '已配置', '编号预览可用'],
    ['分类字段', '已配置', '字段权限待复核'],
    ['审批流程', '待完善', '缺少异常条件节点'],
    ['打印策略', '待完善', '默认模板未指定'],
  ];
  return (
    <table className="aw-table" style={{ width: '100%' }}>
      <thead><tr><th>校验项</th><th>结果</th><th>说明</th><th>操作</th></tr></thead>
      <tbody>{rows.map((row, idx) => (
        <tr key={row[0]}><td>{current.name} · {row[0]}</td><td><Badge tone={idx < doneCount - 1 ? 'g' : 'y'}>{idx < doneCount - 1 ? '已配置' : row[1]}</Badge></td><td>{row[2]}</td><td><span className="aw-link" onClick={() => onView(row[0])}>查看</span><span className="aw-link" style={{ marginLeft: 12 }} onClick={() => onGenerate(row[0])}>生成任务</span></td></tr>
      ))}</tbody>
    </table>
  );
}

window.SettingsCenterScreen = SettingsCenterScreen;
