export const salesWorkbench = {
  kpis: [
    { tone: 'mint', label: '待执行计划', value: 12, icon: '▤' },
    { tone: 'peach', label: '待跟进报价', value: 9, icon: '📄' },
    { tone: 'mint', label: '待审批合同', value: 6, icon: '✓' },
    { tone: 'sky', label: '待处理订单', value: 18, icon: '🛒' },
    { tone: 'rose', label: '待审核客户', value: 4, icon: '👤' },
    { tone: 'lilac', label: '待出库订单', value: 12, icon: '▦' },
    { tone: 'sand', label: '待处理退货', value: 3, icon: '↩' },
    { tone: 'sky', label: '待回款提醒', value: 11, icon: '⌕' },
    { tone: 'mint', label: '待开票记录', value: 7, icon: '📄' },
    { tone: 'peach', label: '客户拜访计划', value: 5, icon: '👤' },
    { tone: 'rose', label: '逾期未回款', value: 2, icon: '!' },
    { tone: 'lilac', label: '样品跟进', value: 8, icon: '▣' },
    { tone: 'sand', label: '销售预测', value: 14, icon: '▤' },
  ],
  tiles: [
    { label: '客户', sub: '客户管理', count: 238, tint: '#DCE7FB', color: '#5677FC', icon: '👤' },
    { label: '计划', sub: '销售计划', count: 12, tint: '#DBF3E6', color: '#10B981', icon: '▤' },
    { label: '报价', sub: '报价管理', count: 46, tint: '#DCE7FB', color: '#5677FC', icon: '📄' },
    { label: '合同', sub: '合同管理', count: 32, tint: '#DCE7FB', color: '#5677FC', icon: '✓' },
    { label: '订单', sub: '订单管理', count: 78, tint: '#DCE7FB', color: '#5677FC', icon: '🛒' },
    { label: '退货', sub: '销售退货', count: 5, tint: '#FBDFDF', color: '#D14D4D', icon: '↩' },
    { label: '换货', sub: '销售换货', count: 2, tint: '#E8DEFB', color: '#8957D8', icon: '⇄' },
    { label: '报表', sub: '销售报表', count: 0, tint: '#DBF3E6', color: '#10B981', icon: '⌕' },
    { label: '回款', sub: '支付记录', count: 19, tint: '#FEF3CD', color: '#B26A24', icon: '¥' },
  ],
  entries: [
    { label: '新增客户', tint: '#DCE7FB', color: '#5677FC', icon: '👤' },
    { label: '制定计划', tint: '#DBF3E6', color: '#10B981', icon: '▤' },
    { label: '新增报价', tint: '#DCE7FB', color: '#5677FC', icon: '📄' },
    { label: '新增合同', tint: '#DCE7FB', color: '#5677FC', icon: '✓' },
    { label: '销售订单', tint: '#DCE7FB', color: '#5677FC', icon: '🛒' },
    { label: '我的审批', tint: '#DCE7FB', color: '#5677FC', icon: '▦' },
  ],
  notices: [
    { type: '重要', text: 'Q2 销售计划执行节奏调整，请各销售经理更新本周跟进记录', time: '2小时前', tone: 'aw-feed-tag-rose' },
    { type: '制度', text: '新版《客户信用额度管理办法》正式发布', time: '1天前', tone: 'aw-feed-tag-sky' },
    { type: '公告', text: '本月重点客户拜访计划已同步至销售中心工作台', time: '3天前', tone: 'aw-feed-tag-peach' },
    { type: '系统', text: '销售订单与仓储出库联动将在本周六凌晨升级', time: '1周前', tone: 'aw-feed-tag-mint' },
    { type: '活动', text: '销售中心月度复盘会议将在周五下午举行', time: '1周前', tone: 'aw-feed-tag-mint' },
  ],
  recent: [
    { title: 'SO-202605-031 销售合同会签', meta: '销售 · 合同管理 · 12分钟前' },
    { title: 'CUS-2026-001 海南星海智能制造有限公司', meta: '销售 · 客户管理 · 1小时前' },
    { title: 'SP-20251221001 荣某定制报价', meta: '销售 · 报价管理 · 今天 09:24' },
    { title: 'PO-202605-022 采购订单复核', meta: '采购 · 采购管理 · 昨天 17:08' },
    { title: 'SO-202605-026 广州智造电子', meta: '销售 · 订单管理 · 昨天 15:30' },
  ],
  focusRows: [
    { code: 'SO-202605-031', customer: '海南星海智能制造有限公司', stage: '合同会签', owner: '老夏', amount: '288,000', status: '审核中' },
    { code: 'QT-202605-018', customer: '深圳荣某精密科技有限公司', stage: '报价跟进', owner: '李文涛', amount: '59,600', status: '待跟进' },
    { code: 'SO-202605-026', customer: '广州智造电子', stage: '待出库', owner: '陈思源', amount: '126,800', status: '待处理' },
  ],
};

export const purchaseWorkbench = {
  kpis: [
    { tone: 'mint', label: '待审批请购', value: 16, icon: '▤' },
    { tone: 'peach', label: '待报价询价', value: 8, icon: '□' },
    { tone: 'sky', label: '待下达采购', value: 12, icon: '▦' },
    { tone: 'rose', label: '待确认到货', value: 7, icon: '↓' },
    { tone: 'lilac', label: '待处理发票', value: 5, icon: '¥' },
    { tone: 'sand', label: '待付款申请', value: 9, icon: '✓' },
    { tone: 'mint', label: '供应商待审核', value: 3, icon: '◇' },
  ],
  tiles: [
    { label: '供应商', sub: '供应商管理', count: 126, tint: '#DCE7FB', color: '#5677FC', icon: '◇' },
    { label: '请购', sub: '请购管理', count: 48, tint: '#DBF3E6', color: '#10B981', icon: '▤' },
    { label: '询价', sub: '询价管理', count: 21, tint: '#FEF3CD', color: '#B26A24', icon: '□' },
    { label: '采购', sub: '采购订单', count: 64, tint: '#DCE7FB', color: '#5677FC', icon: '▦' },
    { label: '退货', sub: '采购退货', count: 4, tint: '#FBDFDF', color: '#D14D4D', icon: '↩' },
    { label: '报表', sub: '采购报表', count: 0, tint: '#DBF3E6', color: '#10B981', icon: '⌕' },
  ],
  entries: [
    { label: '新增供应商', tint: '#DCE7FB', color: '#5677FC', icon: '◇' },
    { label: '新增请购', tint: '#DBF3E6', color: '#10B981', icon: '▤' },
    { label: '新增询价', tint: '#FEF3CD', color: '#B26A24', icon: '□' },
    { label: '新增采购', tint: '#DCE7FB', color: '#5677FC', icon: '▦' },
    { label: '我的审批', tint: '#DCE7FB', color: '#5677FC', icon: '✓' },
  ],
  notices: [
    { type: '重要', text: '本周重点物料采购计划已更新，请采购负责人复核供应商报价', time: '2小时前', tone: 'aw-feed-tag-rose' },
    { type: '制度', text: '新版供应商准入和评估规则已发布', time: '1天前', tone: 'aw-feed-tag-sky' },
    { type: '系统', text: '采购订单到货将与仓储入库联动校验', time: '3天前', tone: 'aw-feed-tag-mint' },
  ],
  recent: [
    { title: 'PR-202605-018 生产物料请购', meta: '采购 · 请购管理 · 20分钟前' },
    { title: 'INQ-202605-006 伺服电机询价', meta: '采购 · 询价管理 · 1小时前' },
    { title: 'PO-202605-022 采购订单复核', meta: '采购 · 采购订单 · 昨天 17:08' },
  ],
};

export const rdWorkbench = {
  kpis: [
    { tone: 'peach', label: '待审批文档', value: 10, icon: '□' },
    { tone: 'mint', label: '待审批的项目', value: 10, icon: '▤' },
    { tone: 'sky', label: '待审批的产品', value: 10, icon: '▣' },
    { tone: 'rose', label: '待审批的工艺', value: 10, icon: '✎' },
    { tone: 'lilac', label: '待审批的物料清单', value: 10, icon: '▦' },
    { tone: 'sand', label: '待审批的代替料', value: 10, icon: '⇄' },
    { tone: 'sky', label: '待审批的订单', value: 8, icon: '▦' },
    { tone: 'mint', label: '待审批的采购申请', value: 5, icon: '▦' },
    { tone: 'peach', label: '待审批的销售合同', value: 3, icon: '□' },
    { tone: 'rose', label: '待审批的变更单', value: 2, icon: '✎' },
    { tone: 'lilac', label: '待审批的请假', value: 4, icon: '◇' },
    { tone: 'sand', label: '待审批的出入库', value: 6, icon: '▦' },
  ],
  tiles: [
    { label: '文档', sub: '设计图纸', count: 25, tint: '#DCE7FB', color: '#5677FC', icon: '□' },
    { label: '项目', sub: '项目管理', count: 28, tint: '#DCE7FB', color: '#5677FC', icon: '▤' },
    { label: '产品', sub: '产品管理', count: 18, tint: '#DCE7FB', color: '#5677FC', icon: '▣' },
    { label: '物料', sub: '物料清单', count: 52, tint: '#DCE7FB', color: '#5677FC', icon: '▦' },
    { label: '工序', sub: '工序管理', count: 0, tint: '#FEF3CD', color: '#B26A24', icon: '⇄' },
    { label: '工艺', sub: '工艺管理', count: 0, tint: '#FBDFDF', color: '#D14D4D', icon: '✎' },
    { label: '人员', sub: '研发人员', count: 36, tint: '#E8DEFB', color: '#8957D8', icon: '◇' },
    { label: '评审', sub: '评审记录', count: 7, tint: '#DBF3E6', color: '#10B981', icon: '✓' },
  ],
  entries: [
    { label: '新建工单', tint: '#DCE7FB', color: '#5677FC', icon: '□' },
    { label: '上传图纸', tint: '#DCE7FB', color: '#5677FC', icon: '↑' },
    { label: '采购申请', tint: '#DCE7FB', color: '#5677FC', icon: '▦' },
    { label: '库存查询', tint: '#DCE7FB', color: '#5677FC', icon: '⌕' },
    { label: '我的审批', tint: '#DCE7FB', color: '#5677FC', icon: '✓' },
  ],
  notices: [
    { type: '重要', text: '智能输送线系统研发项目进入阶段评审，请项目成员补齐资料', time: '2小时前', tone: 'aw-feed-tag-rose' },
    { type: '制度', text: '新版研发文档外发与水印策略已发布', time: '1天前', tone: 'aw-feed-tag-sky' },
    { type: '系统', text: 'BOM 发布后将联动生产中心锁定版本', time: '3天前', tone: 'aw-feed-tag-mint' },
  ],
  recent: [
    { title: 'DRW-20260428-A03 主轴箱体装配图', meta: '研发 · 文档库 · 12分钟前' },
    { title: 'PRJ-2026-017 智能输送线项目', meta: '研发 · 项目库 · 1小时前' },
    { title: 'BOM-202605-001 智能温控锅生产BOM', meta: '研发 · BOM管理 · 今天 09:30' },
  ],
};

export const warehouseWorkbench = {
  kpis: [
    { tone: 'mint', label: '待入库单据', value: 14, icon: '↓' },
    { tone: 'peach', label: '待出库任务', value: 22, icon: '↑' },
    { tone: 'sky', label: '待拣货复核', value: 9, icon: '▦' },
    { tone: 'rose', label: '库存预警', value: 6, icon: '!' },
    { tone: 'lilac', label: '待确认调拨', value: 5, icon: '⇄' },
    { tone: 'sand', label: '待盘点差异', value: 3, icon: '✓' },
    { tone: 'mint', label: '来料质检', value: 8, icon: '□' },
  ],
  tiles: [
    { label: '库存', sub: '库存管理', count: 892, tint: '#DCE7FB', color: '#5677FC', icon: '▦' },
    { label: '入库', sub: '入库管理', count: 36, tint: '#DBF3E6', color: '#10B981', icon: '↓' },
    { label: '出库', sub: '出库管理', count: 42, tint: '#FEF3CD', color: '#B26A24', icon: '↑' },
    { label: '调拨', sub: '调拨管理', count: 12, tint: '#E8DEFB', color: '#8957D8', icon: '⇄' },
    { label: '盘点', sub: '盘点管理', count: 7, tint: '#FBDFDF', color: '#D14D4D', icon: '✓' },
    { label: '库位', sub: '仓库库位', count: 320, tint: '#DCE7FB', color: '#5677FC', icon: '□' },
  ],
  entries: [
    { label: '新增入库', tint: '#DBF3E6', color: '#10B981', icon: '↓' },
    { label: '新增出库', tint: '#FEF3CD', color: '#B26A24', icon: '↑' },
    { label: '新增调拨', tint: '#E8DEFB', color: '#8957D8', icon: '⇄' },
    { label: '创建盘点', tint: '#FBDFDF', color: '#D14D4D', icon: '✓' },
    { label: '库存调整', tint: '#DCE7FB', color: '#5677FC', icon: '▦' },
  ],
  notices: [
    { type: '重要', text: '原料仓 A 区低库存预警，请及时复核补货计划', time: '1小时前', tone: 'aw-feed-tag-rose' },
    { type: '系统', text: '销售出库与 OQC 放行状态已加入出库校验', time: '1天前', tone: 'aw-feed-tag-mint' },
    { type: '公告', text: '本月循环盘点任务已生成', time: '3天前', tone: 'aw-feed-tag-peach' },
  ],
  recent: [
    { title: 'IN-202605-031 采购到货入库', meta: '仓储 · 入库管理 · 16分钟前' },
    { title: 'OUT-202605-027 销售出库', meta: '仓储 · 出库管理 · 45分钟前' },
    { title: 'TR-202605-004 原料仓调拨', meta: '仓储 · 调拨管理 · 昨天 15:10' },
  ],
};

export const productionWorkbench = {
  kpis: [
    { tone: 'mint', label: '待确认需求', value: 10, icon: '▤' },
    { tone: 'peach', label: '待排产计划', value: 6, icon: '▦' },
    { tone: 'sky', label: '待释放订单', value: 9, icon: '□' },
    { tone: 'rose', label: '待派工工单', value: 18, icon: '✓' },
    { tone: 'lilac', label: '待报工记录', value: 24, icon: '✎' },
    { tone: 'sand', label: '异常工序', value: 4, icon: '!' },
    { tone: 'mint', label: '委外待收货', value: 5, icon: '↗' },
  ],
  tiles: [
    { label: '需求', sub: '生产需求', count: 31, tint: '#DCE7FB', color: '#5677FC', icon: '▤' },
    { label: '计划', sub: '生产计划', count: 18, tint: '#DBF3E6', color: '#10B981', icon: '▦' },
    { label: '订单', sub: '生产订单', count: 42, tint: '#DCE7FB', color: '#5677FC', icon: '□' },
    { label: '工单', sub: '生产工单', count: 86, tint: '#FEF3CD', color: '#B26A24', icon: '✓' },
    { label: '排班', sub: '生产排班', count: 12, tint: '#E8DEFB', color: '#8957D8', icon: '▣' },
    { label: '委外', sub: '委外加工', count: 9, tint: '#FBDFDF', color: '#D14D4D', icon: '↗' },
  ],
  entries: [
    { label: '新增需求', tint: '#DCE7FB', color: '#5677FC', icon: '▤' },
    { label: '新增计划', tint: '#DBF3E6', color: '#10B981', icon: '▦' },
    { label: '新增订单', tint: '#DCE7FB', color: '#5677FC', icon: '□' },
    { label: '派工工单', tint: '#FEF3CD', color: '#B26A24', icon: '✓' },
    { label: '委外加工', tint: '#FBDFDF', color: '#D14D4D', icon: '↗' },
  ],
  notices: [
    { type: '重要', text: '本周重点生产订单齐套状态已更新，请计划员复核排产', time: '2小时前', tone: 'aw-feed-tag-rose' },
    { type: '系统', text: '生产报工与质检节点联动规则将在本周启用', time: '1天前', tone: 'aw-feed-tag-mint' },
    { type: '公告', text: '委外加工发料和入库流程已纳入仓储联动', time: '4天前', tone: 'aw-feed-tag-peach' },
  ],
  recent: [
    { title: 'MO-202605-017 高精度伺服电机', meta: '生产 · 生产订单 · 12分钟前' },
    { title: 'WO-202605-088 装配工序派工', meta: '生产 · 生产工单 · 50分钟前' },
    { title: 'PLAN-202605-006 华南排产计划', meta: '生产 · 生产计划 · 昨天 10:25' },
  ],
};

export const workbenchByCenter = {
  rd: rdWorkbench,
  sales: salesWorkbench,
  purchase: purchaseWorkbench,
  warehouse: warehouseWorkbench,
  production: productionWorkbench,
};
