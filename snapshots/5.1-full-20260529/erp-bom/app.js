const tenants = [
  { id: "TEN-AOWEI", name: "海南傲为智造产业有限公司", org: "华南事业部" },
  { id: "TEN-MINGDE", name: "广州明德贸易有限公司", org: "华南大区" },
  { id: "TEN-QIMING", name: "深圳市启明科技有限公司", org: "深圳运营中心" }
];

const masterData = {
  salesOwners: ["李文涛", "陈思源", "赵强", "苏婉清"],
  planners: ["周计划", "王工", "老夏"],
  warehouses: {
    material: "原料仓-A01",
    semi: "半成品仓-B01",
    finished: "成品仓-C01"
  },
  customers: [
    "海南微为智造产业有限公司",
    "深圳市启明科技有限公司",
    "广州明德贸易有限公司",
    "上海云启自动化",
    "苏州恒远装备",
    "南京拓维工业"
  ],
  suppliers: {
    "SUP-PCB": "深圳华芯电子",
    "SUP-CASE": "华南五金供应商",
    "SUP-PACK": "包装耗材供应商",
    "SUP-SERVO": "东莞精密制造厂"
  },
  products: [
    {
      id: "CP-2025010101",
      name: "智能温控终端",
      model: "PRO",
      unit: "台",
      price: 5980,
      mix: 0.42,
      costCenter: "生产一部",
      route: "SMT贴片 > 总装 > FQC > 包装",
      bomVersion: "BOM-V2.1"
    },
    {
      id: "CP-2025010105",
      name: "高精度伺服电机",
      model: "SVM-750",
      unit: "台",
      price: 6000,
      mix: 0.28,
      costCenter: "机加装配组",
      route: "机加工 > 绕线 > 总装 > 测试",
      bomVersion: "BOM-V1.8"
    },
    {
      id: "CP-2025010102",
      name: "半成品模组",
      model: "HM-450",
      unit: "件",
      price: 980,
      mix: 0.2,
      costCenter: "焊接班组",
      route: "焊接 > 老化 > 入半成品库",
      bomVersion: "BOM-V1.6"
    },
    {
      id: "CP-2025010103",
      name: "铝合金外壳",
      model: "AL-6061",
      unit: "套",
      price: 320,
      mix: 0.1,
      costCenter: "结构件车间",
      route: "CNC > 表面处理 > 检验",
      bomVersion: "BOM-V1.8"
    }
  ],
  materials: [
    { id: "WL-8518691", name: "铝合金型材", spec: "AL-6061", unit: "公斤", unitCost: 32, supplier: "SUP-CASE" },
    { id: "WL-7820864", name: "工业级控制板", spec: "PCB-V2", unit: "片", unitCost: 168, supplier: "SUP-PCB" },
    { id: "WL-5786931", name: "显示模组", spec: "LCD-4.3", unit: "件", unitCost: 86, supplier: "SUP-PCB" },
    { id: "WL-4500128", name: "伺服转子组件", spec: "SVM-750-R", unit: "套", unitCost: 420, supplier: "SUP-SERVO" },
    { id: "WL-4500129", name: "线束组件", spec: "WH-12P", unit: "套", unitCost: 28, supplier: "SUP-PCB" },
    { id: "WL-2300981", name: "包装材料", spec: "标准外箱", unit: "套", unitCost: 12, supplier: "SUP-PACK" }
  ],
  bom: {
    "CP-2025010101": [
      { itemId: "WL-7820864", qty: 1 },
      { itemId: "WL-5786931", qty: 1 },
      { itemId: "WL-4500129", qty: 2 },
      { itemId: "WL-2300981", qty: 1 }
    ],
    "CP-2025010105": [
      { itemId: "WL-8518691", qty: 6 },
      { itemId: "WL-4500128", qty: 1 },
      { itemId: "WL-4500129", qty: 1 },
      { itemId: "WL-2300981", qty: 1 }
    ],
    "CP-2025010102": [
      { itemId: "WL-7820864", qty: 1 },
      { itemId: "WL-5786931", qty: 1 },
      { itemId: "WL-4500129", qty: 1 }
    ],
    "CP-2025010103": [
      { itemId: "WL-8518691", qty: 4 },
      { itemId: "WL-2300981", qty: 1 }
    ]
  },
  openingInventory: {
    "WL-8518691": 680,
    "WL-7820864": 120,
    "WL-5786931": 140,
    "WL-4500128": 60,
    "WL-4500129": 380,
    "WL-2300981": 260,
    "CP-2025010101": 18,
    "CP-2025010105": 8,
    "CP-2025010102": 90,
    "CP-2025010103": 160
  }
};

const steps = [
  ["plan", "销售计划", "按租户月份生成销售计划、目标拆解和责任人"],
  ["sales", "销售订单", "按客户、产品和交付日期生成订单明细"],
  ["mrp", "生产需求/MRP", "锁定 BOM 版本，展开齐套预估和缺料"],
  ["purchase", "采购与收货", "按供应商合并采购，并生成采购入库流水"],
  ["production", "生产工单", "按产品生成生产订单、工单和报工数据"],
  ["inventory", "仓储过账", "生成领料、完工入库、销售出库和库存结存"],
  ["finance", "财务归集", "生成应收、应付、成本核算、资金和凭证"],
  ["validate", "闭环校验", "检查目标、来源、库存、财务和租户隔离"]
];

let currentResult = null;
let currentTab = "plan";

const formatCurrency = value =>
  new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY", maximumFractionDigits: 0 }).format(value);

const formatNumber = value => new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 2 }).format(value);

function seq(prefix, period, index) {
  return `${prefix}-${period.replace("-", "")}-${String(index + 1).padStart(3, "0")}`;
}

function parsePeriod(period) {
  const [year, month] = period.split("-").map(Number);
  return { year, month };
}

function dateInMonth(period, day) {
  const { year, month } = parsePeriod(period);
  return `${year}-${String(month).padStart(2, "0")}-${String(Math.min(28, Math.max(1, day))).padStart(2, "0")}`;
}

function getProduct(productId) {
  return masterData.products.find(row => row.id === productId);
}

function getMaterial(itemId) {
  return masterData.materials.find(row => row.id === itemId);
}

function sum(rows, key) {
  return rows.reduce((total, row) => total + Number(row[key] || 0), 0);
}

function optimizeProductPlan(targetAmount) {
  const products = masterData.products;
  const quantities = products.map(product => Math.max(0, Math.floor((targetAmount * product.mix) / product.price)));

  if (quantities.every(qty => qty === 0)) {
    const cheapestIndex = products.reduce((best, product, index) => product.price < products[best].price ? index : best, 0);
    quantities[cheapestIndex] = Math.max(1, Math.round(targetAmount / products[cheapestIndex].price));
  }

  const amountOf = () => quantities.reduce((total, qty, index) => total + qty * products[index].price, 0);
  let current = amountOf();

  for (let guard = 0; guard < 2000; guard += 1) {
    let bestMove = null;
    let bestGap = Math.abs(current - targetAmount);

    products.forEach((product, index) => {
      const addAmount = current + product.price;
      const addGap = Math.abs(addAmount - targetAmount);
      if (addGap < bestGap) bestMove = { index, delta: 1, next: addAmount, gap: addGap };

      if (quantities[index] > 0) {
        const removeAmount = current - product.price;
        const removeGap = Math.abs(removeAmount - targetAmount);
        if (removeGap < (bestMove?.gap ?? bestGap)) bestMove = { index, delta: -1, next: removeAmount, gap: removeGap };
      }
    });

    if (!bestMove) break;
    quantities[bestMove.index] += bestMove.delta;
    current = bestMove.next;
  }

  return products
    .map((product, index) => ({
      ...product,
      quantity: quantities[index],
      plannedAmount: quantities[index] * product.price
    }))
    .filter(row => row.quantity > 0);
}

function createPlan(input) {
  const tenant = tenants.find(row => row.id === input.tenantId);
  const productPlan = optimizeProductPlan(input.targetAmount);
  const plannedAmount = sum(productPlan, "plannedAmount");
  const scenarioId = `SCN-${input.tenantId}-${input.period.replace("-", "")}-${Date.now().toString().slice(-6)}`;

  return {
    id: seq("SPP", input.period, 0),
    tenantId: input.tenantId,
    tenantName: tenant.name,
    scenarioId,
    period: input.period,
    name: `${input.period} ${tenant.org}销售计划`,
    owner: masterData.salesOwners[0],
    statisticBasis: "按订单确认",
    targetAmount: input.targetAmount,
    plannedAmount,
    deviationRate: input.targetAmount ? (plannedAmount - input.targetAmount) / input.targetAmount : 0,
    productPlan
  };
}

function createSalesOrders(input, plan) {
  const rows = [];
  let lineIndex = 0;
  const orderTarget = Math.max(6, Math.min(48, Math.round(plan.plannedAmount / 60000)));

  plan.productPlan.forEach((product, productIndex) => {
    const batches = Math.min(product.quantity, Math.max(1, Math.ceil((product.quantity / sum(plan.productPlan, "quantity")) * orderTarget)));
    let remaining = product.quantity;

    for (let batch = 0; batch < batches; batch += 1) {
      const qty = batch === batches - 1 ? remaining : Math.max(1, Math.round(product.quantity / batches));
      remaining -= qty;
      const orderNo = seq("SO", input.period, lineIndex);
      const customer = masterData.customers[(lineIndex + productIndex) % masterData.customers.length];
      rows.push({
        id: orderNo,
        lineId: `${orderNo}-${String(productIndex + 1).padStart(2, "0")}`,
        tenantId: input.tenantId,
        scenarioId: plan.scenarioId,
        planId: plan.id,
        customer,
        owner: masterData.salesOwners[lineIndex % masterData.salesOwners.length],
        productId: product.id,
        productName: product.name,
        model: product.model,
        unit: product.unit,
        quantity: qty,
        unitPrice: product.price,
        amount: qty * product.price,
        orderDate: dateInMonth(input.period, 3 + lineIndex),
        deliveryDate: dateInMonth(input.period, 15 + lineIndex),
        status: "生产中"
      });
      lineIndex += 1;
    }
  });

  return rows;
}

function calculateMrp(input, plan, salesOrders) {
  const productionDemand = new Map();
  const materialDemand = new Map();

  salesOrders.forEach(order => {
    const product = getProduct(order.productId);
    const demand = productionDemand.get(order.productId) || {
      id: seq("MR", input.period, productionDemand.size),
      tenantId: input.tenantId,
      scenarioId: plan.scenarioId,
      sourceType: "销售订单",
      sourceId: order.id,
      productId: order.productId,
      productName: order.productName,
      model: order.model,
      unit: order.unit,
      quantity: 0,
      bomVersion: product.bomVersion,
      route: product.route,
      dueDate: order.deliveryDate,
      kitStatus: "待齐套"
    };
    demand.quantity += order.quantity;
    productionDemand.set(order.productId, demand);

    masterData.bom[order.productId].forEach(line => {
      const material = getMaterial(line.itemId);
      const current = materialDemand.get(line.itemId) || {
        id: seq("MRP", input.period, materialDemand.size),
        tenantId: input.tenantId,
        scenarioId: plan.scenarioId,
        itemId: line.itemId,
        itemName: material.name,
        spec: material.spec,
        unit: material.unit,
        supplierId: material.supplier,
        supplier: masterData.suppliers[material.supplier],
        grossQty: 0,
        openingQty: masterData.openingInventory[line.itemId] || 0,
        unitCost: material.unitCost
      };
      current.grossQty += order.quantity * line.qty;
      materialDemand.set(line.itemId, current);
    });
  });

  const mrpRows = Array.from(materialDemand.values()).map(row => ({
    ...row,
    shortageQty: Math.max(0, row.grossQty - row.openingQty),
    availableQty: row.openingQty,
    status: row.grossQty > row.openingQty ? "缺料待采购" : "齐套"
  }));

  const productionDemands = Array.from(productionDemand.values()).map(row => {
    const productBom = masterData.bom[row.productId];
    const shortageCount = productBom.filter(line => {
      const mrp = mrpRows.find(item => item.itemId === line.itemId);
      return mrp && mrp.shortageQty > 0;
    }).length;
    return {
      ...row,
      kitStatus: shortageCount > 0 ? "缺料待采购" : "齐套可下达"
    };
  });

  return { productionDemands, mrpRows };
}

function createPurchases(input, plan, mrpRows) {
  const purchaseOrders = [];
  const receipts = [];
  const bySupplier = new Map();

  mrpRows.filter(row => row.shortageQty > 0).forEach(row => {
    if (!bySupplier.has(row.supplierId)) bySupplier.set(row.supplierId, []);
    bySupplier.get(row.supplierId).push(row);
  });

  Array.from(bySupplier.entries()).forEach(([supplierId, lines], supplierIndex) => {
    const poId = seq("PO", input.period, supplierIndex);
    lines.forEach((line, lineIndex) => {
      const quantity = Math.ceil(line.shortageQty * 1.05);
      const amount = quantity * line.unitCost;
      const rowIndex = purchaseOrders.length;
      purchaseOrders.push({
        id: poId,
        lineId: `${poId}-${String(lineIndex + 1).padStart(2, "0")}`,
        tenantId: input.tenantId,
        scenarioId: plan.scenarioId,
        supplier: masterData.suppliers[supplierId],
        itemId: line.itemId,
        itemName: line.itemName,
        spec: line.spec,
        unit: line.unit,
        quantity,
        unitCost: line.unitCost,
        amount,
        source: "MRP缺料",
        sourceId: line.id,
        status: "已收货待检"
      });
      receipts.push({
        id: seq("RK", input.period, rowIndex),
        tenantId: input.tenantId,
        scenarioId: plan.scenarioId,
        sourceId: poId,
        sourceLineId: `${poId}-${String(lineIndex + 1).padStart(2, "0")}`,
        type: "采购入库",
        warehouse: masterData.warehouses.material,
        itemId: line.itemId,
        itemName: line.itemName,
        quantity,
        amount,
        status: "已上架过账"
      });
    });
  });

  return { purchaseOrders, receipts };
}

function calculateBomCost(productId) {
  return masterData.bom[productId].reduce((total, line) => total + line.qty * getMaterial(line.itemId).unitCost, 0);
}

function createProduction(input, plan, productionDemands) {
  const productionOrders = [];
  const workOrders = [];
  const reports = [];

  productionDemands.forEach((demand, index) => {
    const product = getProduct(demand.productId);
    const unitCost = calculateBomCost(product.id);
    const moId = seq("MO", input.period, index);
    const woId = seq("WO", input.period, index);
    productionOrders.push({
      id: moId,
      tenantId: input.tenantId,
      scenarioId: plan.scenarioId,
      demandId: demand.id,
      productId: product.id,
      productName: product.name,
      model: product.model,
      unit: product.unit,
      quantity: demand.quantity,
      bomVersion: product.bomVersion,
      route: product.route,
      unitCost,
      amount: demand.quantity * unitCost,
      costCenter: product.costCenter,
      status: "已下达"
    });
    workOrders.push({
      id: woId,
      tenantId: input.tenantId,
      scenarioId: plan.scenarioId,
      sourceId: moId,
      productId: product.id,
      productName: product.name,
      process: product.route.split(" > ")[0],
      department: product.costCenter,
      planQty: demand.quantity,
      reportedQty: demand.quantity,
      goodQty: Math.max(0, demand.quantity - Math.floor(demand.quantity * 0.015)),
      badQty: Math.floor(demand.quantity * 0.015),
      person: masterData.planners[index % masterData.planners.length],
      status: "待质检"
    });
    reports.push({
      id: seq("WR", input.period, index),
      tenantId: input.tenantId,
      scenarioId: plan.scenarioId,
      workOrderId: woId,
      productName: product.name,
      reportQty: demand.quantity,
      goodQty: demand.quantity,
      badQty: 0,
      reportDate: dateInMonth(input.period, 20 + index),
      status: "已审核"
    });
  });

  return { productionOrders, workOrders, reports };
}

function createInventory(input, plan, mrpRows, purchases, productionOrders, salesOrders) {
  const rows = [];
  const balances = { ...masterData.openingInventory };

  function push(row) {
    const prev = balances[row.itemId] || 0;
    const next = prev + row.qtyIn - row.qtyOut;
    balances[row.itemId] = next;
    rows.push({
      id: seq("IT", input.period, rows.length),
      tenantId: input.tenantId,
      scenarioId: plan.scenarioId,
      balanceQty: next,
      ...row
    });
  }

  purchases.receipts.forEach(receipt => {
    push({
      type: "采购入库",
      sourceId: receipt.id,
      warehouse: receipt.warehouse,
      itemId: receipt.itemId,
      itemName: receipt.itemName,
      qtyIn: receipt.quantity,
      qtyOut: 0,
      amount: receipt.amount,
      status: "已过账"
    });
  });

  mrpRows.forEach(row => {
    push({
      type: "生产领料",
      sourceId: row.id,
      warehouse: masterData.warehouses.material,
      itemId: row.itemId,
      itemName: row.itemName,
      qtyIn: 0,
      qtyOut: row.grossQty,
      amount: row.grossQty * row.unitCost,
      status: "已过账"
    });
  });

  productionOrders.forEach(order => {
    push({
      type: "生产入库",
      sourceId: order.id,
      warehouse: masterData.warehouses.finished,
      itemId: order.productId,
      itemName: order.productName,
      qtyIn: order.quantity,
      qtyOut: 0,
      amount: order.amount,
      status: "已过账"
    });
  });

  salesOrders.forEach(order => {
    const unitCost = calculateBomCost(order.productId);
    push({
      type: "销售出库",
      sourceId: order.id,
      warehouse: masterData.warehouses.finished,
      itemId: order.productId,
      itemName: order.productName,
      qtyIn: 0,
      qtyOut: order.quantity,
      amount: order.quantity * unitCost,
      status: "已过账"
    });
  });

  return { rows, balances };
}

function createFinance(input, plan, salesOrders, purchaseOrders, productionOrders, inventoryRows) {
  const receivable = sum(salesOrders, "amount");
  const payable = sum(purchaseOrders, "amount");
  const cogs = inventoryRows.filter(row => row.type === "销售出库").reduce((total, row) => total + row.amount, 0);
  const productionCost = sum(productionOrders, "amount");
  const received = Math.round(receivable * 0.38);
  const paid = Math.round(payable * 0.32);
  const grossProfit = receivable - cogs;

  return [
    { id: seq("AR", input.period, 0), tenantId: input.tenantId, scenarioId: plan.scenarioId, type: "应收管理", subject: `${input.period}销售订单应收`, party: "多客户汇总", amount: receivable, done: received, left: receivable - received, source: "销售订单", status: received > 0 ? "部分收款" : "待收款" },
    { id: seq("AP", input.period, 0), tenantId: input.tenantId, scenarioId: plan.scenarioId, type: "应付管理", subject: `${input.period}原材料采购应付`, party: "多供应商汇总", amount: payable, done: paid, left: payable - paid, source: "采购订单", status: payable > 0 ? "部分付款" : "无采购缺口" },
    { id: seq("COST", input.period, 0), tenantId: input.tenantId, scenarioId: plan.scenarioId, type: "成本核算", subject: `${input.period}成品成本核算`, party: "生产中心", amount: productionCost, done: cogs, left: productionCost - cogs, source: "生产工单/销售出库", status: "已核算" },
    { id: seq("FUND", input.period, 0), tenantId: input.tenantId, scenarioId: plan.scenarioId, type: "资金管理", subject: "客户回款入账", party: "招商银行基本户", amount: received, done: "收入", left: receivable - received, source: "应收管理", status: "已确认" },
    { id: seq("VCH", input.period, 0), tenantId: input.tenantId, scenarioId: plan.scenarioId, type: "凭证管理", subject: "收入成本结转", party: input.period, amount: receivable + cogs, done: receivable + cogs, left: 0, source: "应收/成本", status: "待审核" },
    { id: seq("GP", input.period, 0), tenantId: input.tenantId, scenarioId: plan.scenarioId, type: "毛利分析", subject: "销售收入减主营业务成本", party: "经营分析", amount: grossProfit, done: cogs ? (grossProfit / receivable) * 100 : 0, left: 0, source: "财务归集", status: grossProfit >= 0 ? "正常" : "异常" }
  ];
}

function validate(input, plan, data) {
  const salesAmount = sum(data.salesOrders, "amount");
  const financeSales = data.finance.find(row => row.type === "应收管理")?.amount || 0;
  const tenantOk = ["salesOrders", "productionDemands", "mrpRows", "purchaseOrders", "productionOrders", "workOrders", "inventory", "finance"].every(key =>
    data[key].every(row => row.tenantId === input.tenantId && row.scenarioId === plan.scenarioId)
  );
  const materialStockOk = data.mrpRows.every(row => {
    const purchased = data.purchaseOrders.filter(po => po.itemId === row.itemId).reduce((total, po) => total + po.quantity, 0);
    return row.openingQty + purchased >= row.grossQty;
  });
  const finishedStockOk = data.productionOrders.every(order => {
    const shipped = data.salesOrders.filter(row => row.productId === order.productId).reduce((total, row) => total + row.quantity, 0);
    const opening = masterData.openingInventory[order.productId] || 0;
    return opening + order.quantity >= shipped;
  });
  const sourceOk = data.salesOrders.every(order => order.planId === plan.id) &&
    data.purchaseOrders.every(order => order.source === "MRP缺料") &&
    data.productionOrders.every(order => data.productionDemands.some(demand => demand.id === order.demandId));
  const voucherOk = data.finance.some(row => row.type === "凭证管理" && row.amount > 0);

  return [
    { title: "销售目标接近度", pass: Math.abs(salesAmount - input.targetAmount) / input.targetAmount < 0.03, message: `目标 ${formatCurrency(input.targetAmount)}，订单 ${formatCurrency(salesAmount)}` },
    { title: "销售计划来源完整", pass: data.salesOrders.length > 0 && data.salesOrders.every(row => row.planId === plan.id), message: `${plan.id} 生成 ${data.salesOrders.length} 条销售订单` },
    { title: "BOM 版本已锁定", pass: data.productionDemands.every(row => row.bomVersion && row.route), message: `生成 ${data.productionDemands.length} 条生产需求` },
    { title: "采购覆盖缺料", pass: materialStockOk, message: "期初库存 + 采购入库覆盖生产领料" },
    { title: "生产满足销售出库", pass: finishedStockOk, message: "期初成品 + 完工入库覆盖销售出库" },
    { title: "财务与业务一致", pass: salesAmount === financeSales && voucherOk, message: "应收金额等于销售订单金额，并生成凭证记录" },
    { title: "来源链路可追溯", pass: sourceOk, message: "销售、采购、生产均保留来源单据" },
    { title: "租户与场景隔离", pass: tenantOk, message: `${input.tenantId} / ${plan.scenarioId}` }
  ];
}

function runEngine(input) {
  const plan = createPlan(input);
  const salesOrders = createSalesOrders(input, plan);
  const mrp = calculateMrp(input, plan, salesOrders);
  const purchases = createPurchases(input, plan, mrp.mrpRows);
  const production = createProduction(input, plan, mrp.productionDemands);
  const inventoryResult = createInventory(input, plan, mrp.mrpRows, purchases, production.productionOrders, salesOrders);
  const finance = createFinance(input, plan, salesOrders, purchases.purchaseOrders, production.productionOrders, inventoryResult.rows);
  const data = {
    plan,
    salesOrders,
    productionDemands: mrp.productionDemands,
    mrpRows: mrp.mrpRows,
    purchaseOrders: purchases.purchaseOrders,
    receipts: purchases.receipts,
    productionOrders: production.productionOrders,
    workOrders: production.workOrders,
    reports: production.reports,
    inventory: inventoryResult.rows,
    balances: inventoryResult.balances,
    finance
  };

  return {
    input,
    ...data,
    validations: validate(input, plan, data)
  };
}

function renderTenants() {
  const select = document.querySelector("#tenantId");
  select.innerHTML = tenants.map(tenant => `<option value="${tenant.id}">${tenant.name}</option>`).join("");
}

function renderSteps(activeIndex = -1, result = null) {
  const counts = {
    plan: result ? result.plan.productPlan.length : null,
    sales: result?.salesOrders.length,
    mrp: result?.mrpRows.length,
    purchase: result?.purchaseOrders.length,
    production: result?.workOrders.length,
    inventory: result?.inventory.length,
    finance: result?.finance.length,
    validate: result?.validations.filter(row => row.pass).length
  };

  document.querySelector("#stepList").innerHTML = steps.map(([key, title, message], index) => {
    const state = index < activeIndex ? "done" : index === activeIndex ? "running" : "";
    const count = counts[key] == null ? "" : `${counts[key]} 项`;
    return `
      <div class="step ${state}">
        <span class="dot"></span>
        <div>
          <div class="step-title">${title}</div>
          <div class="step-message">${message}</div>
        </div>
        <span class="step-count">${count}</span>
      </div>
    `;
  }).join("");
}

function renderSummary(result) {
  const salesAmount = sum(result.salesOrders, "amount");
  const payable = sum(result.purchaseOrders, "amount");
  const cogs = result.inventory.filter(row => row.type === "销售出库").reduce((total, row) => total + row.amount, 0);
  const margin = salesAmount ? ((salesAmount - cogs) / salesAmount) * 100 : 0;

  const metrics = [
    ["目标金额", formatCurrency(result.plan.targetAmount)],
    ["订单金额", formatCurrency(salesAmount)],
    ["销售订单", `${result.salesOrders.length} 条`],
    ["采购金额", formatCurrency(payable)],
    ["生产工单", `${result.workOrders.length} 张`],
    ["毛利率", `${formatNumber(margin)}%`]
  ];

  document.querySelector("#summaryGrid").innerHTML = metrics.map(([label, value]) => `
    <div class="metric">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `).join("");
}

function renderValidations(result) {
  const passed = result.validations.every(row => row.pass);
  const badge = document.querySelector("#validationBadge");
  badge.textContent = passed ? "校验通过" : "存在异常";
  badge.style.color = passed ? "var(--ok)" : "var(--bad)";

  document.querySelector("#validationList").innerHTML = result.validations.map(row => `
    <div class="check ${row.pass ? "pass" : "fail"}">
      <span class="dot"></span>
      <div>
        <div class="check-title">${row.title}</div>
        <div class="check-message">${row.message}</div>
      </div>
      <span class="step-count">${row.pass ? "通过" : "失败"}</span>
    </div>
  `).join("");
}

const tableMap = {
  plan: {
    rows: result => result.plan.productPlan.map(row => ({ ...row, planId: result.plan.id, targetAmount: result.plan.targetAmount })),
    columns: [["planId", "计划编号"], ["name", "产品"], ["model", "规格"], ["quantity", "计划数量"], ["price", "单价"], ["plannedAmount", "计划金额"], ["bomVersion", "BOM版本"]]
  },
  sales: {
    rows: result => result.salesOrders,
    columns: [["id", "销售订单"], ["customer", "客户"], ["owner", "销售"], ["productName", "产品"], ["quantity", "数量"], ["amount", "金额"], ["deliveryDate", "交付日期"], ["status", "状态"]]
  },
  mrp: {
    rows: result => result.mrpRows,
    columns: [["id", "MRP单"], ["itemName", "物料"], ["spec", "规格"], ["grossQty", "需求"], ["openingQty", "期初"], ["shortageQty", "缺口"], ["supplier", "供应商"], ["status", "状态"]]
  },
  purchase: {
    rows: result => result.purchaseOrders,
    columns: [["id", "采购单"], ["supplier", "供应商"], ["itemName", "物料"], ["quantity", "数量"], ["amount", "金额"], ["sourceId", "来源"], ["status", "状态"]]
  },
  production: {
    rows: result => result.workOrders,
    columns: [["id", "工单"], ["sourceId", "生产订单"], ["productName", "产品"], ["process", "工序"], ["department", "部门"], ["planQty", "计划"], ["reportedQty", "报工"], ["goodQty", "合格"], ["status", "状态"]]
  },
  inventory: {
    rows: result => result.inventory,
    columns: [["id", "流水"], ["type", "类型"], ["warehouse", "仓库"], ["itemName", "物料/产品"], ["qtyIn", "入库"], ["qtyOut", "出库"], ["balanceQty", "结存"], ["sourceId", "来源"]]
  },
  finance: {
    rows: result => result.finance,
    columns: [["id", "单号"], ["type", "模块"], ["subject", "主题"], ["party", "往来/对象"], ["amount", "金额"], ["done", "已处理"], ["left", "未处理"], ["status", "状态"]]
  }
};

function displayValue(key, value) {
  if (["amount", "price", "unitPrice", "unitCost", "plannedAmount", "targetAmount"].includes(key)) return formatCurrency(value);
  if (typeof value === "number") return formatNumber(value);
  return value;
}

function renderTable(result, tab) {
  const config = tableMap[tab];
  document.querySelector("#resultHead").innerHTML = `<tr>${config.columns.map(([, label]) => `<th>${label}</th>`).join("")}</tr>`;
  document.querySelector("#resultBody").innerHTML = config.rows(result).map(row => `
    <tr>${config.columns.map(([key]) => `<td>${displayValue(key, row[key])}</td>`).join("")}</tr>
  `).join("");
}

async function animateRun(result) {
  document.querySelector("#jobStatus").textContent = "运行中";
  document.querySelector("#scenarioId").textContent = result.plan.scenarioId;
  for (let index = 0; index < steps.length; index += 1) {
    renderSteps(index, result);
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  renderSteps(steps.length, result);
  document.querySelector("#jobStatus").textContent = "已完成";
}

function bindEvents() {
  document.querySelector("#automationForm").addEventListener("submit", async event => {
    event.preventDefault();
    const input = {
      tenantId: document.querySelector("#tenantId").value,
      period: document.querySelector("#period").value,
      targetAmount: Number(document.querySelector("#targetAmount").value),
      mode: document.querySelector("#runMode").value
    };
    currentResult = runEngine(input);
    await animateRun(currentResult);
    renderSummary(currentResult);
    renderValidations(currentResult);
    renderTable(currentResult, currentTab);
  });

  document.querySelectorAll(".tab").forEach(button => {
    button.addEventListener("click", () => {
      currentTab = button.dataset.tab;
      document.querySelectorAll(".tab").forEach(tab => tab.classList.toggle("active", tab === button));
      if (currentResult) renderTable(currentResult, currentTab);
    });
  });
}

function init() {
  renderTenants();
  renderSteps();
  document.querySelector("#summaryGrid").innerHTML = [
    ["目标金额", "-"],
    ["订单金额", "-"],
    ["销售订单", "-"],
    ["采购金额", "-"],
    ["生产工单", "-"],
    ["毛利率", "-"]
  ].map(([label, value]) => `<div class="metric"><span>${label}</span><strong>${value}</strong></div>`).join("");
  bindEvents();
}

init();
