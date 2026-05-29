// ui_kits/erp-console/bom-new-screen.jsx
// 新增 BOM —— 中级 MES/ERP BOM 编辑器

const { useState: useBnState } = React;

const BN_PROCESS_OPS = [
  { code:'OP1010', name:'来料检验' },
  { code:'OP1020', name:'切割' },
  { code:'OP1030', name:'钻孔' },
  { code:'OP1040', name:'组装' },
  { code:'OP1050', name:'调试' },
  { code:'OP1060', name:'出货检验' },
];

const BN_VARIANTS = {
  model: { label:'型号', all:'全部型号', values:['17','17Pro','17PM'] },
};

const BN_TYPE_OPTIONS = ['自制','外购','委外','子装配','原材料','虚拟件','包装'];
const BN_TYPE_TONE = {
  '自制':'self',
  '外购':'buy',
  '委外':'out',
  '子装配':'sub',
  '原材料':'raw',
  '虚拟件':'virtual',
  '包装':'pack',
};

const BN_ATTR_PRESETS = [
  { key:'material', label:'材质', fieldType:'文本', defaultValue:'ABS', showInTable:true, required:false },
  { key:'surface', label:'表面处理', fieldType:'文本', defaultValue:'哑光', showInTable:false, required:false },
  { key:'length', label:'长度', fieldType:'数字', defaultValue:'120', showInTable:true, required:false },
  { key:'width', label:'宽度', fieldType:'数字', defaultValue:'80', showInTable:false, required:false },
  { key:'height', label:'高度', fieldType:'数字', defaultValue:'36', showInTable:false, required:false },
  { key:'weight', label:'重量', fieldType:'数字', defaultValue:'0.32', showInTable:true, required:false },
  { key:'tolerance', label:'公差', fieldType:'文本', defaultValue:'±0.05', showInTable:false, required:false },
  { key:'hardness', label:'硬度', fieldType:'文本', defaultValue:'HRC 28', showInTable:false, required:false },
  { key:'packing', label:'包装方式', fieldType:'下拉', defaultValue:'单件袋装', showInTable:false, required:false, options:['单件袋装','泡棉隔离','纸箱'] },
  { key:'unitPrice', label:'单价', fieldType:'数字', defaultValue:'0', showInTable:false, required:false },
  { key:'workTime', label:'工时', fieldType:'数字', defaultValue:'0.2', showInTable:true, required:false },
  { key:'supplier', label:'供应商', fieldType:'文本', defaultValue:'', showInTable:false, required:false },
  { key:'remark', label:'备注', fieldType:'文本', defaultValue:'', showInTable:false, required:false },
];

const BN_MATERIAL_POOL = [
  { code:'IP17-000', name:'iPhone17 整机总成', spec:'17/17Pro/17PM 通用', type:'自制', unit:'台', price:0 },
  { code:'IP17-110', name:'机身结构组件', spec:'标准/Pro/PM', type:'子装配', unit:'套', price:0 },
  { code:'IP17-111', name:'17 标准中框', spec:'铝合金 6.1寸', type:'自制', unit:'件', price:42 },
  { code:'IP17-112', name:'17Pro 钛合金中框', spec:'Pro 6.3寸', type:'外购', unit:'件', price:88 },
  { code:'IP17-113', name:'17PM 大尺寸后盖', spec:'PM 6.9寸', type:'外购', unit:'片', price:96 },
  { code:'IP17-120', name:'主板模组', spec:'A系列主板', type:'子装配', unit:'套', price:0 },
  { code:'IP17-121', name:'标准版主控 PCB', spec:'17 专用', type:'外购', unit:'片', price:155 },
  { code:'IP17-122', name:'Pro 主控 PCB', spec:'17Pro/17PM', type:'外购', unit:'片', price:228 },
  { code:'IP17-123', name:'摄像头模组', spec:'标准/Pro/PM', type:'外购', unit:'套', price:180 },
  { code:'IP17-124', name:'Pro 长焦镜头', spec:'17Pro/17PM 专用', type:'外购', unit:'个', price:95 },
  { code:'IP17-130', name:'电池模组', spec:'按型号容量', type:'子装配', unit:'套', price:0 },
  { code:'IP17-131', name:'标准电池', spec:'17 专用', type:'外购', unit:'件', price:46 },
  { code:'IP17-132', name:'大容量电池', spec:'17Pro/17PM', type:'外购', unit:'件', price:63 },
  { code:'IP17-140', name:'包装套件', spec:'彩盒+说明书+数据线', type:'包装', unit:'套', price:8.6 },
];

const bnNode = (data) => ({ children: [], alts: [], customAttrs: {}, variants: {}, logs: [], ...data });

function bnDraftNode(patch = {}) {
  const id = 'n-draft-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
  return bnNode({
    id,
    code:'',
    name:'请选择物料',
    spec:'',
    type:'外购',
    unit:'件',
    qty:1,
    loss:0,
    price:0,
    processOp:'',
    customAttrs:{},
    variants:{ model:['全部型号'] },
    logs:[],
    ...patch,
  });
}

const BN_INITIAL_TREE = [
  bnNode({
    id:'n1', code:'M-100', name:'智能温控锅总成', spec:'8L/12L/16L 通用', type:'自制', unit:'套', qty:1, loss:0, price:0, processOp:'OP1040',
    customAttrs:{ color:'白色', material:'整机', workTime:'0.8', weight:'4.8' },
    variants:{ color:['任意'], capacity:['任意'] },
    logs:[{v:'V1.0', text:'创建总成节点'}],
    children:[
      bnNode({
        id:'n1-1', code:'M-110', name:'机身子装配', spec:'AW-HT-Body', type:'子装配', unit:'套', qty:1, loss:1, price:0, processOp:'OP1040',
        customAttrs:{ color:'白色', material:'ABS+不锈钢', workTime:'0.45', weight:'2.2' },
        variants:{ color:['任意'], capacity:['任意'] },
        children:[
          bnNode({ id:'n1-1-1', code:'M-111', name:'内胆不锈钢件', spec:'SUS304 拉伸件', type:'自制', unit:'件', qty:1, loss:2, price:42, processOp:'OP1020', customAttrs:{ material:'SUS304', length:'220', weight:'1.1', workTime:'0.25' }, variants:{ color:['任意'], capacity:['8L','12L'] }, logs:[{v:'V1.1', text:'改用量 0→1'}] }),
          bnNode({ id:'n1-1-2', code:'M-112', name:'外壳注塑件', spec:'ABS V0 白', type:'外购', unit:'件', qty:1, loss:1.5, price:28, processOp:'OP1010', customAttrs:{ color:'白色', material:'ABS', length:'260', weight:'0.62', workTime:'0.05' }, variants:{ color:['白色'], capacity:['任意'] }, alts:[{code:'M-112-B',name:'外壳注塑件 B 供方',priority:2},{code:'M-112-C',name:'外壳注塑件 C 供方',priority:3}] }),
          bnNode({ id:'n1-1-3', code:'M-113', name:'隔热棉', spec:'12mm 阻燃', type:'原材料', unit:'片', qty:2, loss:3, price:4.5, processOp:'OP1040', customAttrs:{ material:'阻燃棉', weight:'0.08', workTime:'0.03' }, variants:{ color:['任意'], capacity:['8L','12L','16L'] } }),
          bnNode({ id:'n1-1-4', code:'M-114', name:'喷涂加工', spec:'按颜色委外喷涂', type:'委外', unit:'次', qty:1, loss:0, price:6, processOp:'OP1040', customAttrs:{ surface:'哑光', supplier:'海口精饰', workTime:'0.1' }, variants:{ color:['黑色','灰色'], capacity:['任意'] } }),
        ],
      }),
      bnNode({
        id:'n1-2', code:'M-120', name:'控制模组', spec:'AW-CTRL-V3', type:'子装配', unit:'套', qty:1, loss:0.5, price:0, processOp:'OP1050',
        customAttrs:{ material:'电子件', workTime:'0.35', weight:'0.3' },
        variants:{ color:['任意'], capacity:['任意'] },
        children:[
          bnNode({ id:'n1-2-1', code:'M-121', name:'主控 PCB', spec:'ESP32-4R', type:'外购', unit:'片', qty:1, loss:1, price:55, processOp:'OP1010', customAttrs:{ supplier:'恒晟电子', workTime:'0.04', weight:'0.06' }, variants:{ color:['任意'], capacity:['任意'] }, alts:[{code:'M-121-A',name:'主控 PCB 替代 A',priority:2},{code:'M-121-B',name:'主控 PCB 替代 B',priority:3}] }),
          bnNode({ id:'n1-2-2', code:'M-122', name:'温度传感器', spec:'NTC 100K', type:'外购', unit:'个', qty:2, loss:2, price:7.8, processOp:'OP1040', customAttrs:{ supplier:'芯敏科技', workTime:'0.04' }, variants:{ color:['任意'], capacity:['任意'] } }),
          bnNode({ id:'n1-2-3', code:'M-123', name:'线束组件', spec:'6PIN 180mm', type:'外购', unit:'根', qty:1, loss:1, price:5.2, processOp:'OP1040', customAttrs:{ length:'180', supplier:'明达线缆', workTime:'0.06' }, variants:{ color:['任意'], capacity:['8L','12L'] } }),
          bnNode({ id:'n1-2-4', code:'M-124', name:'固件烧录虚拟件', spec:'FW-AW-3.1', type:'虚拟件', unit:'项', qty:1, loss:0, price:0, processOp:'OP1050', customAttrs:{ remark:'调试时带出', workTime:'0.12' }, variants:{ color:['任意'], capacity:['任意'] } }),
        ],
      }),
      bnNode({
        id:'n1-3', code:'M-130', name:'加热系统', spec:'1500W', type:'子装配', unit:'套', qty:1, loss:0.5, price:0, processOp:'OP1040',
        customAttrs:{ material:'铝合金', workTime:'0.3', weight:'1.05' },
        variants:{ color:['任意'], capacity:['任意'] },
        children:[
          bnNode({ id:'n1-3-1', code:'M-131', name:'发热盘', spec:'8L 1500W', type:'自制', unit:'件', qty:1, loss:2, price:36, processOp:'OP1030', customAttrs:{ material:'铝合金', tolerance:'±0.05', workTime:'0.22', weight:'0.78' }, variants:{ color:['任意'], capacity:['8L'] } }),
          bnNode({ id:'n1-3-2', code:'M-132', name:'温控保险丝', spec:'216℃', type:'外购', unit:'个', qty:1, loss:1, price:3.5, processOp:'OP1010', customAttrs:{ supplier:'安保电子', workTime:'0.02' }, variants:{ color:['任意'], capacity:['任意'] } }),
        ],
      }),
      bnNode({ id:'n1-4', code:'M-140', name:'包装套件', spec:'彩盒+说明书+泡棉', type:'包装', unit:'套', qty:1, loss:2.5, price:8.6, processOp:'OP1060', customAttrs:{ packing:'纸箱', workTime:'0.12', weight:'0.55' }, variants:{ color:['任意'], capacity:['任意'] } }),
    ],
  }),
];

const BN_COMPARE_LEFT = [
  { no:'1', code:'M-100', name:'智能温控锅总成', qty:'1', price:'0', status:'' },
  { no:'1.1', code:'M-110', name:'机身子装配', qty:'1', price:'0', status:'' },
  { no:'1.1.1', code:'M-111', name:'内胆不锈钢件', qty:'1', price:'40', status:'mod', changed:{ price:'40 → 42' } },
  { no:'1.1.2', code:'M-112', name:'外壳注塑件', qty:'1', price:'30', status:'mod', changed:{ price:'30 → 28' } },
  { no:'1.1.3', code:'M-113-OLD', name:'旧隔热垫', qty:'1', price:'3.2', status:'del' },
  { no:'1.2', code:'M-120', name:'控制模组', qty:'1', price:'0', status:'' },
];

const BN_COMPARE_RIGHT = [
  { no:'1', code:'M-100', name:'智能温控锅总成', qty:'1', price:'0', status:'' },
  { no:'1.1', code:'M-110', name:'机身子装配', qty:'1', price:'0', status:'' },
  { no:'1.1.1', code:'M-111', name:'内胆不锈钢件', qty:'1', price:'42', status:'mod', changed:{ price:'40 → 42' } },
  { no:'1.1.2', code:'M-112', name:'外壳注塑件', qty:'1', price:'28', status:'mod', changed:{ price:'30 → 28' } },
  { no:'1.1.3', code:'M-113', name:'隔热棉', qty:'2', price:'4.5', status:'add' },
  { no:'1.2', code:'M-120', name:'控制模组', qty:'1', price:'0', status:'' },
  { no:'1.2.4', code:'M-124', name:'固件烧录虚拟件', qty:'1', price:'0', status:'add' },
];

const BOM_DETAIL_TEXT = `本物料清单适用于 iPhone17 主产品的研发试制与量产导入，覆盖 17、17Pro、17PM 三个型号的结构件、主板模组、摄像头模组、电池模组与包装套件等层级。

清单结构按父子件层级维护用量、损耗、替代料、适用型号和工序关联。自制件需要关联对应工序与工作中心，外购件需要维护供应商、单价和替代优先级；虚拟件仅用于工艺和成本归集，不参与实际库存扣减。

执行时需重点校验不同型号的专用物料、替代料可用性、用量损耗、适用型号和成本汇总。销售下单选择 17、17Pro 或 17PM 后，生产展开 BOM 时只带出通用物料和该型号专用物料。`;

function BomRichTextEditor({ value = BOM_DETAIL_TEXT, onChange }) {
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
        onInput={e => onChange && onChange(e.currentTarget.innerText)}
        style={{minHeight:168,padding:'14px 16px',fontSize:13,lineHeight:1.8,color:'var(--aw-fg-1)',whiteSpace:'pre-wrap',outline:'none'}}
      >
        {value}
      </div>
    </div>
  );
}

function bnToNumber(v) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

function bnGross(node) {
  return bnToNumber(node.qty) * (1 + bnToNumber(node.loss) / 100);
}

function bnVariantActive(node, selected) {
  const variants = node.variants || {};
  return Object.keys(BN_VARIANTS).every(key => {
    const allowed = variants[key];
    const allValue = BN_VARIANTS[key].all || '任意';
    if (!allowed || allowed.length === 0 || allowed.includes(allValue) || allowed.includes('任意')) return true;
    return allowed.includes(selected[key]);
  });
}

function bnVariantLabel(node, key = 'model') {
  const allValue = BN_VARIANTS[key]?.all || '任意';
  const picked = (node.variants && node.variants[key]) || [allValue];
  return picked.includes(allValue) || picked.includes('任意') ? allValue : picked.join('、');
}

function bnNormalizeVariants(variants = {}) {
  const allValue = BN_VARIANTS.model.all;
  const picked = variants.model || [allValue];
  const clean = picked.includes(allValue) || picked.includes('任意')
    ? [allValue]
    : picked.filter(v => BN_VARIANTS.model.values.includes(v));
  return { model: clean.length ? clean : [allValue] };
}

function bnNormalizeTree(nodes = []) {
  return nodes.map(node => ({
    ...node,
    variants: bnNormalizeVariants(node.variants),
    children: bnNormalizeTree(node.children || []),
  }));
}

function bnToggleVariantValue(current = {}, key = 'model', value) {
  const allValue = BN_VARIANTS[key]?.all || '任意';
  const picked = current[key] || [allValue];
  let next;
  if (value === allValue || value === '任意') {
    next = [allValue];
  } else {
    const specific = picked.filter(v => v !== allValue && v !== '任意');
    next = specific.includes(value) ? specific.filter(v => v !== value) : [...specific, value];
    if (!next.length) next = [allValue];
  }
  return { [key]: next };
}

function BomModelMultiSelect({ variants = {}, onChange, compact = false }) {
  const key = 'model';
  const cfg = BN_VARIANTS[key];
  const allValue = cfg.all || '任意';
  const picked = variants[key] || [allValue];
  const isAll = picked.includes(allValue) || picked.includes('任意');
  const toggle = (value, e) => {
    e && e.stopPropagation();
    onChange && onChange(bnToggleVariantValue(variants, key, value));
  };
  const chipClass = (on) => 'bn-chip' + (compact ? ' tiny' : '') + (on ? ' on' : '');
  return (
    <div className={'bn-model-multi' + (compact ? ' compact' : '')}>
      <span className={chipClass(isAll)} onClick={(e) => toggle(allValue, e)}>{allValue}</span>
      {cfg.values.map(value => (
        <span key={value} className={chipClass(!isAll && picked.includes(value))} onClick={(e) => toggle(value, e)}>{value}</span>
      ))}
    </div>
  );
}

function bnSubtotal(node, selected, multiplier = 1) {
  if (selected && !bnVariantActive(node, selected)) return 0;
  const currentQty = multiplier * bnGross(node);
  const own = currentQty * bnToNumber(node.price);
  return own + (node.children || []).reduce((sum, child) => sum + bnSubtotal(child, selected, currentQty), 0);
}

function bnWalk(nodes, cb, depth = 1, selected = null, parentActive = true) {
  nodes.forEach(node => {
    const active = parentActive && (!selected || bnVariantActive(node, selected));
    if (active) cb(node, depth);
    if (node.children && node.children.length) bnWalk(node.children, cb, depth + 1, selected, active);
  });
}

function bnFindNode(nodes, id) {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = bnFindNode(node.children || [], id);
    if (found) return found;
  }
  return null;
}

function bnContains(node, id) {
  return (node.children || []).some(child => child.id === id || bnContains(child, id));
}

function bnMapNode(nodes, id, updater) {
  return nodes.map(node => {
    if (node.id === id) return updater(node);
    return { ...node, children: bnMapNode(node.children || [], id, updater) };
  });
}

function bnRemoveNode(nodes, id) {
  let removed = null;
  const next = [];
  nodes.forEach(node => {
    if (node.id === id) {
      removed = node;
    } else {
      const result = bnRemoveNode(node.children || [], id);
      if (result.removed) removed = result.removed;
      next.push({ ...node, children: result.nodes });
    }
  });
  return { nodes: next, removed };
}

function bnCollectIds(node, ids = []) {
  ids.push(node.id);
  (node.children || []).forEach(child => bnCollectIds(child, ids));
  return ids;
}

function bnInsertNode(nodes, targetId, nodeToInsert, mode) {
  const next = [];
  nodes.forEach(node => {
    if (node.id === targetId && mode === 'after') {
      next.push(node);
      next.push(nodeToInsert);
      return;
    }
    if (node.id === targetId && mode === 'child') {
      next.push({ ...node, children: [...(node.children || []), nodeToInsert] });
      return;
    }
    next.push({ ...node, children: bnInsertNode(node.children || [], targetId, nodeToInsert, mode) });
  });
  return next;
}

function bnMoveNode(tree, sourceId, targetId, mode) {
  if (!sourceId || !targetId || sourceId === targetId) return tree;
  const source = bnFindNode(tree, sourceId);
  if (!source || bnContains(source, targetId)) return tree;
  const removed = bnRemoveNode(tree, sourceId);
  if (!removed.removed) return tree;
  return bnInsertNode(removed.nodes, targetId, removed.removed, mode);
}

function bnFlatten(nodes, collapsed, selected, prefix = [], rows = [], parentActive = true) {
  nodes.forEach((node, idx) => {
    const active = parentActive && bnVariantActive(node, selected);
    if (!active) return;
    const path = [...prefix, idx + 1];
    const hasChildren = !!(node.children && node.children.length);
    rows.push({
      node,
      id: node.id,
      no: path.join('.'),
      level: path.length - 1,
      hasChildren,
      active,
      collapsed: !!collapsed[node.id],
    });
    if (hasChildren && !collapsed[node.id]) bnFlatten(node.children, collapsed, selected, path, rows, active);
  });
  return rows;
}

function bnStats(tree, selected) {
  const result = { levels:0, materials:0, self:0, buy:0, cost:0, hours:0 };
  bnWalk(tree, (node, depth) => {
    result.levels = Math.max(result.levels, depth);
    result.materials += 1;
    if (node.type === '自制') result.self += 1;
    if (node.type === '外购') result.buy += 1;
    result.hours += bnToNumber(node.customAttrs && node.customAttrs.workTime);
  }, 1, selected);
  result.cost = tree.reduce((sum, node) => sum + bnSubtotal(node, selected), 0);
  return result;
}

function bnAttrValue(node, attr) {
  const custom = node.customAttrs || {};
  if (custom[attr.key] !== undefined) return custom[attr.key];
  if (attr.key === 'unitPrice') return node.price;
  if (attr.key === 'remark') return node.remark || '';
  return attr.defaultValue || '';
}

function BomNewScreen({ onBack, initialValue, mode = 'create', onDraft, onSubmit, onPreview }) {
  const emptyBaseInfo = {
    no:'自动生成',
    name:'',
    product:'',
    version:'',
    type:'',
    author:'',
    effectiveDate:'',
    workflow:'',
  };
  const [baseInfo, setBaseInfo] = useBnState(initialValue?.baseInfo || emptyBaseInfo);
  const [tree, setTree] = useBnState(initialValue?.tree ? bnNormalizeTree(initialValue.tree) : []);
  const [detailText, setDetailText] = useBnState(initialValue?.detailText || BOM_DETAIL_TEXT);
  const [spec, setSpec] = useBnState(initialValue?.spec || { model:'17' });
  const [collapsed, setCollapsed] = useBnState({});
  const [selectedId, setSelectedId] = useBnState(null);
  const [checked, setChecked] = useBnState({});
  const [editing, setEditing] = useBnState(null);
  const [altOpen, setAltOpen] = useBnState(null);
  const [dragRowId, setDragRowId] = useBnState(null);
  const [dragOver, setDragOver] = useBnState(null);
  const [attrs, setAttrs] = useBnState(BN_ATTR_PRESETS.filter(a => ['material','length','weight','workTime'].includes(a.key)));
  const [drawerOpen, setDrawerOpen] = useBnState(false);
  const [materialPicker, setMaterialPicker] = useBnState(null);
  const [compare, setCompare] = useBnState(false);
  const [importOpen, setImportOpen] = useBnState(false);
  const [structureModalOpen, setStructureModalOpen] = useBnState(false);
  const [previewOpen, setPreviewOpen] = useBnState(false);
  const [notice, setNotice] = useBnState('');

  const rows = bnFlatten(tree, collapsed, spec);
  const selectedNode = selectedId ? bnFindNode(tree, selectedId) : null;
  const stat = bnStats(tree, spec);
  const selectedCount = rows.filter(row => checked[row.id]).length;

  const buildPayload = (state) => ({
    code: initialValue?.code || ('BOM-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '-' + String(Date.now()).slice(-3)),
    baseInfo: { ...baseInfo },
    tree: bnNormalizeTree(tree),
    detailText,
    state,
    spec,
    stats: stat,
  });

  const validate = () => {
    const missing = [];
    if (!baseInfo.name) missing.push('BOM 名称');
    if (!baseInfo.product) missing.push('适用产品');
    if (!baseInfo.type) missing.push('BOM 类型');
    if (!baseInfo.workflow) missing.push('审批流程');
    if (!tree.length) missing.push('物料清单');
    if (rows.some(row => !row.node.code || row.node.name === '请选择物料')) missing.push('完整物料信息');
    return missing;
  };

  const flash = (text) => {
    setNotice(text);
    window.setTimeout(() => setNotice(''), 2200);
  };

  const handleDraft = () => {
    const payload = buildPayload('草稿');
    onDraft && onDraft(payload);
    flash('草稿已暂存');
  };

  const handleSubmit = () => {
    const missing = validate();
    if (missing.length) {
      flash('请先补充：' + missing.join('、'));
      return;
    }
    const payload = buildPayload('待审核');
    onSubmit && onSubmit(payload);
    flash('已提交审批');
  };

  const handlePreview = () => {
    const payload = buildPayload('预览');
    onPreview && onPreview(payload);
    setPreviewOpen(true);
  };

  const handleBack = () => {
    const dirty = baseInfo.name || baseInfo.product || tree.length || detailText !== BOM_DETAIL_TEXT;
    if (dirty && !window.confirm('当前新增BOM尚未保存，确定返回列表吗？')) return;
    onBack && onBack();
  };

  const updateBaseInfo = (key, value) => {
    setBaseInfo(prev => ({ ...prev, [key]: value }));
  };

  const updateNode = (id, patch) => {
    setTree(nodes => bnMapNode(nodes, id, node => ({ ...node, ...(typeof patch === 'function' ? patch(node) : patch) })));
  };

  const updateCustomAttr = (id, key, value) => {
    setTree(nodes => bnMapNode(nodes, id, node => ({
      ...node,
      customAttrs: { ...(node.customAttrs || {}), [key]: value },
    })));
  };

  const removeNode = (id) => {
    const target = bnFindNode(tree, id);
    const removedIds = target ? bnCollectIds(target) : [id];
    setTree(nodes => bnRemoveNode(nodes, id).nodes);
    setChecked(prev => {
      const next = { ...prev };
      removedIds.forEach(x => { delete next[x]; });
      return next;
    });
    if (removedIds.includes(selectedId)) setSelectedId(null);
  };

  const addRootNode = () => {
    const node = bnDraftNode({
      type:'自制',
      unit:'套',
      qty:1,
      name: baseInfo.product || '请选择物料',
    });
    setTree(nodes => [...nodes, node]);
    setSelectedId(node.id);
  };

  const addChildNode = (parentId = selectedId) => {
    if (!parentId) {
      addRootNode();
      return;
    }
    const node = bnDraftNode();
    setTree(nodes => bnMapNode(nodes, parentId, parent => ({
      ...parent,
      children: [...(parent.children || []), node],
    })));
    setCollapsed(prev => ({ ...prev, [parentId]: false }));
    setSelectedId(node.id);
  };

  const addSiblingNode = (targetId = selectedId) => {
    if (!targetId) {
      addRootNode();
      return;
    }
    const node = bnDraftNode();
    setTree(nodes => bnInsertNode(nodes, targetId, node, 'after'));
    setSelectedId(node.id);
  };

  const toggleCheck = (id) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAll = () => {
    const allOn = rows.length > 0 && rows.every(row => checked[row.id]);
    if (allOn) setChecked({});
    else {
      const next = {};
      rows.forEach(row => { next[row.id] = true; });
      setChecked(next);
    }
  };

  const chooseMaterial = (picked) => {
    if (!materialPicker || !picked) return;
    updateNode(materialPicker, {
      code: picked.code,
      name: picked.name,
      spec: picked.spec,
      type: picked.type,
      unit: picked.unit,
      price: picked.price,
    });
    setMaterialPicker(null);
  };

  const onDropRow = (targetId) => {
    if (!dragRowId || !dragOver) return;
    setTree(nodes => bnMoveNode(nodes, dragRowId, targetId, dragOver.mode));
    setDragRowId(null);
    setDragOver(null);
  };

  const handleRowDragOver = (e, row) => {
    if (!dragRowId || dragRowId === row.id) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const mode = e.clientX - rect.left > 150 + row.level * 20 ? 'child' : 'after';
    setDragOver({ id: row.id, mode });
  };

  const addImportedRows = () => {
    const stamp = Date.now();
    const imported = bnNode({
      id:'n-import-root-' + stamp,
      code:'IP17-000',
      name:'iPhone17 整机总成',
      spec:'17/17Pro/17PM',
      type:'自制',
      unit:'套',
      qty:1,
      loss:0,
      price:0,
      processOp:'OP1040',
      customAttrs:{ material:'导入草稿', workTime:'0.8' },
      variants:{ model:['全部型号'] },
      children:[
        bnNode({
          id:'n-import-child-' + stamp,
          code:'IP17-110',
          name:'机身结构组件',
          spec:'标准/Pro/PM',
          type:'子装配',
          unit:'套',
          qty:1,
          loss:1,
          price:0,
          processOp:'OP1040',
          customAttrs:{ material:'导入草稿', workTime:'0.45' },
          variants:{ model:['全部型号'] },
          children:[
            bnNode({ id:'n-import-leaf-a-' + stamp, code:'IP17-111', name:'17 / 17Pro 通用中框', spec:'铝合金中框', type:'自制', unit:'件', qty:1, loss:2, price:42, processOp:'OP1020', customAttrs:{ material:'铝合金', workTime:'0.25' }, variants:{ model:['17','17Pro'] } }),
            bnNode({ id:'n-import-leaf-b-' + stamp, code:'IP17-113', name:'17PM 专用后盖组件', spec:'大尺寸后盖', type:'外购', unit:'件', qty:1, loss:1, price:96, processOp:'OP1010', customAttrs:{ material:'玻璃', workTime:'0.03' }, variants:{ model:['17PM'] } }),
          ],
        }),
      ],
    });
    setTree(nodes => [...nodes, imported]);
    setSelectedId(imported.id);
    setImportOpen(false);
    setStructureModalOpen(true);
  };

  const openStructureModal = () => {
    setCompare(false);
    setStructureModalOpen(true);
  };

  const renderVariantSelector = () => (
    <div className="bn-variant-card">
      {Object.keys(BN_VARIANTS).map(key => (
        <div className="bn-variant-group" key={key}>
          <span className="bn-variant-label">当前预览{BN_VARIANTS[key].label}：</span>
          {BN_VARIANTS[key].values.map(value => (
            <span key={value} className={'bn-chip' + (spec[key] === value ? ' on' : '')} onClick={() => setSpec(prev => ({ ...prev, [key]: value }))}>
              <span>{spec[key] === value ? '●' : '○'}</span>{value}
            </span>
          ))}
        </div>
      ))}
    </div>
  );

  const renderStructureEditor = () => (
    <>
      <BomCreateSteps
        baseInfo={baseInfo}
        rows={rows}
        selectedNode={selectedNode}
        onAddRoot={addRootNode}
        onAddChild={() => addChildNode(selectedId)}
        onOpenAttrs={() => setDrawerOpen(true)}
        onImport={() => setImportOpen(true)}
      />
      {renderVariantSelector()}
      {compare ? (
        <BomCompareView hasTree={rows.length > 0} />
      ) : (
        <Card style={{padding:0,overflow:'hidden',marginTop:14}}>
          <div className="bn-card-head">
            <div className="section-title">BOM 结构</div>
            <span className="meta">按销售下单型号过滤用料，维护替代料与工艺关联</span>
            <div className="actions">
              <Btn onClick={addRootNode}>＋ 根物料</Btn>
              <Btn onClick={() => addChildNode(selectedId)}>＋ 子项</Btn>
              <Btn onClick={() => addSiblingNode(selectedId)}>＋ 同级</Btn>
              <Btn onClick={() => setDrawerOpen(true)}>⚙ 属性配置</Btn>
            </div>
          </div>
          <div className={'bn-editor' + (selectedNode ? ' with-panel' : '')}>
            <div className="bn-table-wrap">
              <BomTreeTable
                rows={rows}
                attrs={attrs}
                spec={spec}
                checked={checked}
                selectedId={selectedId}
                editing={editing}
                altOpen={altOpen}
                collapsed={collapsed}
                dragOver={dragOver}
                onToggleAll={toggleAll}
                onToggleCheck={toggleCheck}
                onSelect={setSelectedId}
                onEdit={setEditing}
                onUpdate={updateNode}
                onUpdateAttr={updateCustomAttr}
                onOpenMaterial={setMaterialPicker}
                onToggleAlt={setAltOpen}
                onToggleCollapse={(id) => setCollapsed(prev => ({ ...prev, [id]: !prev[id] }))}
                onAddRoot={addRootNode}
                onAddChild={addChildNode}
                onAddSibling={addSiblingNode}
                onRemove={removeNode}
                onImport={() => setImportOpen(true)}
                onDragStart={(id) => setDragRowId(id)}
                onDragOver={handleRowDragOver}
                onDrop={onDropRow}
                selectedAll={rows.length > 0 && rows.every(row => checked[row.id])}
                selectedSome={rows.some(row => checked[row.id])}
              />
            </div>
            {selectedNode && (
              <BomPropertyPanel
                node={selectedNode}
                attrs={attrs}
                spec={spec}
                onChange={(patch) => updateNode(selectedNode.id, patch)}
                onChangeAttr={(key, value) => updateCustomAttr(selectedNode.id, key, value)}
                onRemove={() => removeNode(selectedNode.id)}
                onClose={() => setSelectedId(null)}
              />
            )}
          </div>
        </Card>
      )}
    </>
  );

  return (
    <div className="aw-doc-form bn-page" style={{height:'auto'}}>
      <div className="aw-doc-form-head">
        <span className="aw-link" onClick={handleBack}>← 返回</span>
        <span className="bn-toolbar-title">研发中心 / BOM管理 / 新增BOM</span>
        <span className="bn-toolbar-spacer" />
        {notice && <span style={{fontSize:12,color:'#2563EB',marginRight:8}}>{notice}</span>}
        <Btn onClick={handleDraft}>暂存草稿</Btn>
        <Btn onClick={() => { setCompare(false); setImportOpen(true); }}>⤴ 导入</Btn>
        <Btn onClick={() => { setCompare(true); setStructureModalOpen(true); }}>⇄ 版本对比</Btn>
        <Btn onClick={handlePreview}>预览</Btn>
        <Btn kind="primary" onClick={handleSubmit}>提交审批</Btn>
      </div>

      <div className="aw-doc-form-body" style={{padding:18}}>
        <Card title="基础信息">
          <div className="bn-base-grid">
            <Field label="BOM 编号"><Input value="自动生成" disabled /></Field>
            <Field label="BOM 名称" req><Input value={baseInfo.name} placeholder="请输入 BOM 名称" onChange={e => updateBaseInfo('name', e.target.value)} /></Field>
            <Field label="适用产品" req><Select value={baseInfo.product} onChange={e => updateBaseInfo('product', e.target.value)}><option value="">请选择适用产品</option><option>iPhone17</option><option>智能温控锅 AW-H8</option><option>智能温控锅 AW-H12</option><option>智能温控锅 AW-H16</option></Select></Field>
            <Field label="版本号"><Input value={baseInfo.version} placeholder="如 V 1.0" onChange={e => updateBaseInfo('version', e.target.value)} /></Field>
            <Field label="BOM 类型"><Select value={baseInfo.type} onChange={e => updateBaseInfo('type', e.target.value)}><option value="">请选择</option><option>生产</option><option>销售</option><option>工程</option></Select></Field>
            <Field label="编制人"><Input value={baseInfo.author} placeholder="请输入编制人" onChange={e => updateBaseInfo('author', e.target.value)} /></Field>
            <Field label="生效日期"><Input type="date" value={baseInfo.effectiveDate} onChange={e => updateBaseInfo('effectiveDate', e.target.value)} /></Field>
            <Field label="审批流程"><Select value={baseInfo.workflow} onChange={e => updateBaseInfo('workflow', e.target.value)}><option value="">请选择审批流程</option><option>研发 BOM 默认流程</option><option>简化审批</option><option>变更委员会审批</option></Select></Field>
          </div>
          <div className="bn-model-config">
            <div>
              <div className="bn-model-title">产品型号配置</div>
              <div className="bn-model-sub">适用产品选择 iPhone17 后，销售下单可选择 17 / 17Pro / 17PM，生产展开 BOM 时按下单型号过滤适用物料。</div>
            </div>
            <div className="bn-model-list">
              {BN_VARIANTS.model.values.map(value => <span key={value} className="bn-chip on">{value}</span>)}
            </div>
          </div>
        </Card>

        <div className="bn-summary">
          <div className="bn-summary-card primary"><div className="l">层级数</div><div className="n">{stat.levels}<span className="u">级</span></div></div>
          <div className="bn-summary-card"><div className="l">物料数</div><div className="n">{stat.materials}<span className="u">项</span></div></div>
          <div className="bn-summary-card primary"><div className="l">自制</div><div className="n">{stat.self}<span className="u">项</span></div></div>
          <div className="bn-summary-card"><div className="l">外购</div><div className="n">{stat.buy}<span className="u">项</span></div></div>
          <div className="bn-summary-card cost"><div className="l">单件成本</div><div className="n">¥ {stat.cost.toFixed(2)}</div></div>
          <div className="bn-summary-card"><div className="l">累计工时</div><div className="n">{stat.hours.toFixed(2)}<span className="u">h</span></div></div>
        </div>

        <div className="bn-structure-entry">
          <div className="bn-structure-entry-main">
            <div className="section-title">物料清单配置</div>
            {rows.length ? (
              <div className="bn-structure-brief">
                已配置 <b>{stat.materials}</b> 项物料，<b>{stat.levels}</b> 级结构，单件成本 <b>¥ {stat.cost.toFixed(2)}</b>，累计工时 <b>{stat.hours.toFixed(2)}h</b>。
              </div>
            ) : (
              <div className="bn-structure-empty">当前未添加物料清单。点击“添加物料清单”后，在大弹窗中维护父子件层级、用量、损耗、替代料和工序关联。</div>
            )}
          </div>
          <Btn kind={rows.length ? 'secondary' : 'primary'} onClick={openStructureModal}>{rows.length ? '编辑物料清单' : '＋ 添加物料清单'}</Btn>
        </div>

        <Card title="清单详情">
          <BomRichTextEditor value={detailText} onChange={setDetailText} />
        </Card>
      </div>

      {previewOpen && (
        <Modal title="物料清单预览" subtitle={baseInfo.name || '未命名 BOM'} onClose={() => setPreviewOpen(false)} size="xl" footer={<><Btn onClick={() => setPreviewOpen(false)}>关闭</Btn><Btn kind="primary" onClick={() => { setPreviewOpen(false); handleSubmit(); }}>提交审批</Btn></>}>
          <div className="aw-doc-grid" style={{marginBottom:16}}>
            <div>BOM编号：{initialValue?.code || '提交后生成'}</div>
            <div>BOM名称：{baseInfo.name || '未填写'}</div>
            <div>适用产品：{baseInfo.product || '未选择'}</div>
            <div>版本号：{baseInfo.version || 'V1.0'}</div>
            <div>BOM类型：{baseInfo.type || '未选择'}</div>
            <div>物料数：{stat.materials}</div>
            <div>层级数：{stat.levels}</div>
            <div>单件成本：¥ {stat.cost.toFixed(2)}</div>
          </div>
          <div style={{border:'1px solid var(--aw-border)',borderRadius:8,padding:14,whiteSpace:'pre-wrap',fontSize:13,lineHeight:1.8,color:'var(--aw-fg-2)'}}>{detailText}</div>
        </Modal>
      )}

      {structureModalOpen && (
        <div className="bn-config-modal-mask">
          <div className="bn-config-modal">
            <div className="bn-config-modal-head">
              <div>
                <div className="bn-config-modal-title">配置物料清单</div>
                <div className="bn-config-modal-sub">维护父子件层级、用量、损耗、替代料、适用型号和工序关联。</div>
              </div>
              <span className="bn-config-modal-close" onClick={() => setStructureModalOpen(false)}>×</span>
            </div>
            <div className="bn-config-modal-body">
              {renderStructureEditor()}
            </div>
            <div className="bn-config-modal-foot">
              <Btn onClick={() => setStructureModalOpen(false)}>取消</Btn>
              <Btn kind="primary" onClick={() => setStructureModalOpen(false)}>确认</Btn>
            </div>
          </div>
        </div>
      )}

      <div className={'bn-floating-bar' + (structureModalOpen && selectedCount > 0 ? ' on' : '')}>
        <span className="count">已选 {selectedCount} 项</span>
        <Btn style={{opacity:.55}}>批量改用量</Btn>
        <Btn style={{opacity:.55}}>批量替换</Btn>
        <Btn style={{opacity:.55}}>批量复制</Btn>
        <Btn style={{opacity:.55}}>批量移动</Btn>
        <Btn kind="danger" style={{opacity:.55}}>批量删除</Btn>
      </div>

      {drawerOpen && <BomAttributeDrawer attrs={attrs} setAttrs={setAttrs} onClose={() => setDrawerOpen(false)} />}
      {materialPicker && <BomMaterialPickerModal onClose={() => setMaterialPicker(null)} onConfirm={chooseMaterial} />}
      {importOpen && <BomImportModal onClose={() => setImportOpen(false)} onDone={addImportedRows} />}
    </div>
  );
}

function BomCreateSteps({ baseInfo, rows, selectedNode, onAddRoot, onAddChild, onOpenAttrs, onImport }) {
  const infoReady = !!(baseInfo.name && baseInfo.product);
  const rootReady = rows.some(row => row.level === 0);
  const childReady = rows.some(row => row.level > 0);
  const materialReady = rows.length > 0 && rows.every(row => row.node.code && row.node.name !== '请选择物料');
  const steps = [
    { label:'填写基础信息', done:infoReady },
    { label:'确认规格', done:true },
    { label:'添加根物料', done:rootReady },
    { label:'添加子件', done:childReady },
    { label:'完善属性', done:materialReady },
  ];
  const activeIndex = steps.findIndex(step => !step.done);
  const current = activeIndex < 0 ? steps.length - 1 : activeIndex;

  return (
    <div className="bn-create-steps">
      <div className="bn-step-track">
        {steps.map((step, idx) => (
          <div key={step.label} className={'bn-step' + (step.done ? ' done' : '') + (idx === current ? ' current' : '')}>
            <span className="dot">{step.done ? '✓' : idx + 1}</span>
            <div>
              <div className="name">{step.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BomTreeTable(props) {
  const {
    rows, attrs, spec, checked, selectedId, editing, altOpen, collapsed, dragOver,
    onToggleAll, onToggleCheck, onSelect, onEdit, onUpdate, onUpdateAttr,
    onOpenMaterial, onToggleAlt, onToggleCollapse, onDragStart, onDragOver, onDrop,
    onAddRoot, onAddChild, onAddSibling, onRemove, onImport,
    selectedAll, selectedSome,
  } = props;
  const visibleAttrs = attrs.filter(attr => attr.showInTable);
  const unitOptions = ['套','件','片','个','根','次','项'];
  const fixedCols = [
    { key:'check', label:'☐ 选', w:44 },
    { key:'no', label:'行号', w:112 },
    { key:'material', label:'物料', w:220 },
    { key:'model', label:'适用型号', w:220 },
    { key:'qty', label:'用量', w:88 },
    { key:'unit', label:'单位', w:80 },
    { key:'type', label:'物料类型', w:100 },
    { key:'alts', label:'替代料', w:150 },
    { key:'loss', label:'损耗%', w:88 },
    { key:'gross', label:'毛用量', w:90 },
    { key:'process', label:'关联工序', w:130 },
    { key:'price', label:'单价', w:90 },
    { key:'subtotal', label:'小计', w:100 },
  ];
  const tableColSpan = fixedCols.length + visibleAttrs.length + 1;

  const renderEditCell = (row, field, type = 'number') => {
    const active = editing && editing.id === row.id && editing.field === field;
    const value = row.node[field];
    if (!active) {
      return (
        <span className="bn-cell-edit num" onClick={(e) => { e.stopPropagation(); onEdit({ id: row.id, field }); }}>
          {field === 'price' ? `¥ ${bnToNumber(value).toFixed(2)}` : value}
        </span>
      );
    }
    return (
      <input
        className="bn-inline-input"
        type={type}
        value={value}
        autoFocus
        onClick={e => e.stopPropagation()}
        onBlur={() => onEdit(null)}
        onChange={e => onUpdate(row.id, { [field]: e.target.value })}
      />
    );
  };

  return (
    <table className="bn-table">
      <thead>
        <tr>
          {fixedCols.map(col => (
            <th key={col.key} style={{width:col.w}}>
              {col.key === 'check'
                ? <span className={'aw-chk' + (selectedAll ? ' on' : selectedSome ? ' indet' : '')} onClick={onToggleAll} />
                : col.label}
            </th>
          ))}
          {visibleAttrs.map(attr => <th key={attr.key} style={{width:110}}>{attr.label}</th>)}
          <th style={{width:92}}>操作</th>
        </tr>
      </thead>
      <tbody>
        {!rows.length && (
          <tr className="bn-empty-row">
            <td colSpan={tableColSpan}>
              <div className="bn-empty-builder">
                <div className="bn-empty-title">BOM 清单还是空的</div>
                <div className="bn-empty-text">从根物料开始，一层一层添加子件；也可以从 Excel 导入后再逐项修正。</div>
                <div className="bn-empty-actions">
                  <Btn kind="primary" onClick={onAddRoot}>＋ 添加根物料</Btn>
                  <Btn onClick={onImport}>⤴ 从 Excel 导入</Btn>
                </div>
              </div>
            </td>
          </tr>
        )}
        {rows.map(row => {
          const node = row.node;
          const process = BN_PROCESS_OPS.find(op => op.code === node.processOp);
          return (
            <tr
              key={row.id}
              className={[
                row.active ? '' : 'inactive',
                selectedId === row.id ? 'selected' : '',
                dragOver && dragOver.id === row.id && dragOver.mode === 'child' ? 'drag-target-child' : '',
                dragOver && dragOver.id === row.id && dragOver.mode === 'after' ? 'drag-target-after' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => onSelect(row.id)}
              onDragOver={(e) => onDragOver(e, row)}
              onDragLeave={() => {}}
              onDrop={(e) => { e.preventDefault(); onDrop(row.id); }}
            >
              <td className="bn-check-cell" onClick={e => { e.stopPropagation(); onToggleCheck(row.id); }}>
                <span className={'aw-chk' + (checked[row.id] ? ' on' : '')} />
              </td>
              <td>
                <span className="bn-rowno" draggable onDragStart={(e) => { e.stopPropagation(); onDragStart(row.id); e.dataTransfer.setData('text/plain', row.id); }}>
                  <span className={'bn-caret' + (row.hasChildren ? '' : ' empty')} onClick={(e) => { e.stopPropagation(); if (row.hasChildren) onToggleCollapse(row.id); }}>{row.hasChildren ? (collapsed[row.id] ? '▸' : '▾') : ''}</span>
                  <span>{row.no}</span>
                  {!row.active && <span className="bn-chip tiny warn">不适用</span>}
                </span>
              </td>
              <td>
                <div className="bn-material">
                  <span className="bn-tree-indent" style={{width:row.level * 20}} />
                    <div className="bn-material-main">
                    <div className={'bn-material-name' + (!node.code ? ' placeholder' : '')} onClick={(e) => { e.stopPropagation(); onOpenMaterial(row.id); }}>{node.name}</div>
                    <div className="bn-material-code">{node.code}</div>
                  </div>
                </div>
              </td>
              <td>
                <BomModelMultiSelect
                  compact
                  variants={node.variants}
                  onChange={variants => onUpdate(row.id, { variants })}
                />
              </td>
              <td>{renderEditCell(row, 'qty')}</td>
              <td>
                {editing && editing.id === row.id && editing.field === 'unit' ? (
                  <select className="bn-inline-select" value={node.unit} autoFocus onClick={e => e.stopPropagation()} onBlur={() => onEdit(null)} onChange={e => onUpdate(row.id, { unit:e.target.value })}>
                    {unitOptions.map(u => <option key={u}>{u}</option>)}
                  </select>
                ) : (
                  <span className="bn-cell-edit" onClick={(e) => { e.stopPropagation(); onEdit({ id: row.id, field:'unit' }); }}>{node.unit}</span>
                )}
              </td>
              <td><span className={'bn-type ' + (BN_TYPE_TONE[node.type] || 'virtual')}>{node.type}</span></td>
              <td style={{overflow:'visible'}}>
                <div className="bn-alt-cell">
                  {node.alts && node.alts.length ? (
                    <>
                      <span className="bn-alt-trigger" onClick={(e) => { e.stopPropagation(); onToggleAlt(altOpen === row.id ? null : row.id); }}>★ 主料 ▾ + {node.alts.length} 个备选</span>
                      {altOpen === row.id && (
                        <div className="bn-alt-pop" onClick={e => e.stopPropagation()}>
                          <div className="bn-alt-chip"><b>★ {node.name}</b><span>P1</span></div>
                          {node.alts.map(alt => <div className="bn-alt-chip" key={alt.code}><b>{alt.name}</b><span>P{alt.priority}</span></div>)}
                        </div>
                      )}
                    </>
                  ) : <span style={{color:'var(--aw-fg-4)'}}>无</span>}
                </div>
              </td>
              <td>{renderEditCell(row, 'loss')}</td>
              <td className="readonly num">{bnGross(node).toFixed(3)}</td>
              <td>{process ? <span className="bn-process-tag">{process.code} {process.name}</span> : <span style={{color:'var(--aw-fg-4)'}}>未关联</span>}</td>
              <td>{renderEditCell(row, 'price')}</td>
              <td className="num">¥ {bnSubtotal(node, spec).toFixed(2)}</td>
              {visibleAttrs.map(attr => (
                <td key={attr.key} onClick={(e) => { e.stopPropagation(); onEdit({ id: row.id, field:'attr:' + attr.key }); }}>
                  {editing && editing.id === row.id && editing.field === 'attr:' + attr.key ? (
                    <input className="bn-inline-input" value={bnAttrValue(node, attr)} autoFocus onClick={e => e.stopPropagation()} onBlur={() => onEdit(null)} onChange={e => onUpdateAttr(row.id, attr.key, e.target.value)} />
                  ) : (
                    <span className="bn-cell-edit">{bnAttrValue(node, attr) || '—'}</span>
                  )}
                </td>
              ))}
              <td>
                <div className="bn-row-actions">
                  <span className="aw-link" onClick={e => { e.stopPropagation(); onAddChild(row.id); }}>子项</span>
                  <span className="aw-link" onClick={e => { e.stopPropagation(); onAddSibling(row.id); }}>同级</span>
                  <span className="aw-link danger" onClick={e => { e.stopPropagation(); onRemove(row.id); }}>删除</span>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function BomPropertyPanel({ node, attrs, spec, onChange, onChangeAttr, onRemove, onClose }) {
  const [tab, setTab] = useBnState('basic');
  const gross = bnGross(node);
  const tabs = [
    { k:'basic', label:'基础' },
    { k:'attrs', label:'规格属性' },
    { k:'alts', label:'替代料' },
    { k:'logs', label:'变更记录' },
  ];

  const changeAlt = (idx, patch) => {
    const alts = [...(node.alts || [])];
    alts[idx] = { ...alts[idx], ...patch };
    onChange({ alts });
  };

  const removeAlt = (idx) => {
    onChange({ alts: (node.alts || []).filter((_, i) => i !== idx) });
  };

  return (
    <div className="bn-props">
      <div className="bn-props-h">
        <span className={'bn-type ' + (BN_TYPE_TONE[node.type] || 'virtual')}>{node.type}</span>
        <span style={{minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{node.name}</span>
        <span className="code">{node.code}</span>
        <span className="close" onClick={onClose}>×</span>
      </div>
      <div style={{padding:'0 12px'}}>
        <Tabs items={tabs} active={tab} onChange={setTab} />
      </div>
      <div className="bn-props-body">
        {tab === 'basic' && (
          <div className="bn-prop-grid">
            <div className="bn-prop-row"><label>物料编码</label><input value={node.code} onChange={e => onChange({ code:e.target.value })} /></div>
            <div className="bn-prop-row"><label className="req">名称</label><input value={node.name} onChange={e => onChange({ name:e.target.value })} /></div>
            <div className="bn-prop-row"><label>物料类型</label><select value={node.type} onChange={e => onChange({ type:e.target.value })}>{BN_TYPE_OPTIONS.map(t => <option key={t}>{t}</option>)}</select></div>
            <div className="bn-prop-row"><label>单位</label><input value={node.unit} onChange={e => onChange({ unit:e.target.value })} /></div>
            <div className="bn-prop-row"><label>用量</label><input type="number" value={node.qty} onChange={e => onChange({ qty:e.target.value })} /></div>
            <div className="bn-prop-row"><label>损耗%</label><input type="number" value={node.loss} onChange={e => onChange({ loss:e.target.value })} /></div>
            <div className="bn-prop-row"><label>毛用量</label><input className="readonly" value={gross.toFixed(3)} readOnly /></div>
            <div className="bn-prop-row"><label>关联工序</label><select value={node.processOp || ''} onChange={e => onChange({ processOp:e.target.value })}><option value="">请选择</option>{BN_PROCESS_OPS.map(op => <option key={op.code} value={op.code}>{op.code} {op.name}</option>)}</select></div>
            <div className="bn-prop-row"><label>单价</label><input type="number" value={node.price} onChange={e => onChange({ price:e.target.value })} /></div>
            <div className="bn-prop-row"><label>备注</label><textarea value={node.remark || ''} onChange={e => onChange({ remark:e.target.value })} /></div>
            <div className="bn-prop-row">
              <label>适用型号</label>
              <BomModelMultiSelect variants={node.variants} onChange={variants => onChange({ variants })} />
            </div>
          </div>
        )}

        {tab === 'attrs' && (
          <div className="bn-prop-sec">
            <div className="bn-prop-title">当前 BOM 属性配置</div>
            <div className="bn-prop-grid">
              {attrs.map(attr => (
                <div className="bn-prop-row" key={attr.key}>
                  <label className={attr.required ? 'req' : ''}>{attr.label}</label>
                  <BomAttrInput attr={attr} value={bnAttrValue(node, attr)} onChange={value => onChangeAttr(attr.key, value)} />
                </div>
              ))}
              {!attrs.length && <div className="bn-change-empty">未启用规格属性</div>}
            </div>
          </div>
        )}

        {tab === 'alts' && (
          <div className="bn-prop-sec">
            <div className="bn-prop-title">主料</div>
            <div className="bn-alt-list">
              <div className="bn-alt-row" style={{gridTemplateColumns:'minmax(0,1fr) 70px 24px'}}>
                <Input value={`★ ${node.name}`} readOnly />
                <Input value="P1" readOnly />
                <span />
              </div>
              <div className="bn-prop-title" style={{marginTop:12}}>替代料</div>
              {(node.alts || []).map((alt, idx) => (
                <div className="bn-alt-row" key={idx}>
                  <Input value={alt.name} onChange={e => changeAlt(idx, { name:e.target.value })} />
                  <Input type="number" value={alt.priority} onChange={e => changeAlt(idx, { priority:e.target.value })} />
                  <span className="aw-link" style={{color:'var(--aw-danger)'}} onClick={() => removeAlt(idx)}>×</span>
                </div>
              ))}
              <Btn onClick={() => onChange({ alts:[...(node.alts || []), { code:'M-ALT', name:'新增替代料', priority:(node.alts || []).length + 2 }] })}>＋ 添加替代料</Btn>
            </div>
          </div>
        )}

        {tab === 'logs' && (
          (node.logs && node.logs.length) ? (
            <div className="bn-change-list">
              {node.logs.map((log, idx) => <div className="bn-change-item" key={idx}><b>{log.v}</b>{log.text}</div>)}
            </div>
          ) : <div className="bn-change-empty">暂无变更</div>
        )}
      </div>
      <div className="bn-props-foot">
        <span className="aw-link" style={{color:'var(--aw-danger)',fontSize:12}} onClick={onRemove}>移除此项</span>
        <Btn kind="primary" style={{fontSize:12,padding:'4px 12px'}}>应用</Btn>
      </div>
    </div>
  );
}

function BomAttrInput({ attr, value, onChange }) {
  if (attr.fieldType === '下拉') {
    const options = attr.options || ['是','否'];
    return <select value={value} onChange={e => onChange(e.target.value)}>{options.map(opt => <option key={opt}>{opt}</option>)}</select>;
  }
  if (attr.fieldType === '多选') {
    const options = attr.options || ['A','B','C'];
    const picked = String(value || '').split('、').filter(Boolean);
    return (
      <div className="bn-chip-row">
        {options.map(opt => (
          <span key={opt} className={'bn-chip tiny' + (picked.includes(opt) ? ' on' : '')} onClick={() => {
            const next = picked.includes(opt) ? picked.filter(x => x !== opt) : [...picked, opt];
            onChange(next.join('、'));
          }}>{opt}</span>
        ))}
      </div>
    );
  }
  if (attr.fieldType === '日期') return <input type="date" value={value || ''} onChange={e => onChange(e.target.value)} />;
  if (attr.fieldType === '开关') return <Switch on={value === '是' || value === true} onChange={v => onChange(v ? '是' : '否')} />;
  return <input type={attr.fieldType === '数字' ? 'number' : 'text'} value={value || ''} onChange={e => onChange(e.target.value)} />;
}

function BomAttributeDrawer({ attrs, setAttrs, onClose }) {
  const [dragKey, setDragKey] = useBnState(null);
  const [overKey, setOverKey] = useBnState(null);

  const isEnabled = (key) => attrs.some(attr => attr.key === key);
  const toggleAttr = (preset) => {
    setAttrs(current => {
      if (current.some(attr => attr.key === preset.key)) return current.filter(attr => attr.key !== preset.key);
      return [...current, { ...preset }];
    });
  };
  const updateAttr = (key, patch) => {
    setAttrs(current => current.map(attr => attr.key === key ? { ...attr, ...patch } : attr));
  };
  const dropAttr = (targetKey) => {
    if (!dragKey || dragKey === targetKey) return;
    setAttrs(current => {
      const source = current.find(attr => attr.key === dragKey);
      if (!source) return current;
      const next = current.filter(attr => attr.key !== dragKey);
      const idx = next.findIndex(attr => attr.key === targetKey);
      next.splice(idx < 0 ? next.length : idx, 0, source);
      return next;
    });
    setDragKey(null);
    setOverKey(null);
  };
  const addCustom = () => {
    const idx = Date.now();
    setAttrs(current => [...current, { key:'custom_' + idx, label:'自定义属性', fieldType:'文本', defaultValue:'', required:false, showInTable:false }]);
  };

  return (
    <>
      <div className="aw-drawer-mask" onClick={onClose} />
      <div className="aw-drawer">
        <div className="bn-drawer-h">
          <span className="bn-drawer-mark" />
          <div>
            <div className="bn-drawer-title">属性配置</div>
            <div className="bn-drawer-sub">启用后同步到树表列与右侧“规格属性”Tab</div>
          </div>
          <span className="bn-drawer-close" onClick={onClose}>×</span>
        </div>
        <div className="bn-drawer-body">
          <div className="bn-attr-lib">
            <div className="bn-attr-h">预置属性库 <span style={{fontSize:12,color:'var(--aw-fg-3)',fontWeight:400}}>{attrs.length} 已启用</span></div>
            <div className="bn-attr-list">
              {BN_ATTR_PRESETS.map(preset => (
                <div key={preset.key} className="bn-attr-check" onClick={() => toggleAttr(preset)}>
                  <span className={'aw-chk' + (isEnabled(preset.key) ? ' on' : '')} />
                  <span>{preset.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bn-attr-enabled">
            <div className="bn-attr-h">已启用属性 <Btn onClick={addCustom}>＋ 新建自定义属性</Btn></div>
            <div className="bn-attr-list">
              {attrs.map(attr => (
                <div
                  key={attr.key}
                  className={'bn-attr-card' + (dragKey === attr.key ? ' dragging' : '') + (overKey === attr.key ? ' over' : '')}
                  draggable
                  onDragStart={() => setDragKey(attr.key)}
                  onDragOver={(e) => { e.preventDefault(); setOverKey(attr.key); }}
                  onDrop={(e) => { e.preventDefault(); dropAttr(attr.key); }}
                >
                  <div className="bn-attr-card-h">
                    <span className="grip">⋮⋮</span>
                    <span className="name">{attr.label}</span>
                    <span className="aw-link" style={{color:'var(--aw-danger)',fontSize:12}} onClick={() => setAttrs(current => current.filter(x => x.key !== attr.key))}>移除</span>
                  </div>
                  <div className="bn-attr-form">
                    <Field label="显示名"><Input value={attr.label} onChange={e => updateAttr(attr.key, { label:e.target.value })} /></Field>
                    <Field label="字段类型"><Select value={attr.fieldType} onChange={e => updateAttr(attr.key, { fieldType:e.target.value })}>{['文本','数字','下拉','多选','日期','开关'].map(t => <option key={t}>{t}</option>)}</Select></Field>
                    <Field label="默认值"><Input value={attr.defaultValue || ''} onChange={e => updateAttr(attr.key, { defaultValue:e.target.value })} /></Field>
                    <div>
                      <div className="bn-switch-line"><Switch on={!!attr.required} onChange={v => updateAttr(attr.key, { required:v })} /> 是否必填</div>
                      <div className="bn-switch-line"><Switch on={!!attr.showInTable} onChange={v => updateAttr(attr.key, { showInTable:v })} /> 作为树表列显示</div>
                    </div>
                  </div>
                </div>
              ))}
              {!attrs.length && <div className="bn-change-empty">从左侧勾选属性开始配置</div>}
            </div>
          </div>
        </div>
        <div className="bn-drawer-foot">
          <Btn onClick={onClose}>取消</Btn>
          <Btn kind="primary" onClick={onClose}>应用配置</Btn>
        </div>
      </div>
    </>
  );
}

function BomMaterialPickerModal({ onClose, onConfirm }) {
  const [category, setCategory] = useBnState('全部物料');
  const [keyword, setKeyword] = useBnState('');
  const [picked, setPicked] = useBnState({});
  const cats = ['全部物料','自制件','外购物料','委外加工','包装材料','虚拟件'];
  const rows = BN_MATERIAL_POOL.filter(row => {
    const matchCat = category === '全部物料'
      || (category === '自制件' && row.type === '自制')
      || (category === '外购物料' && row.type === '外购')
      || (category === '委外加工' && row.type === '委外')
      || (category === '包装材料' && row.type === '包装')
      || (category === '虚拟件' && row.type === '虚拟件');
    const matchKeyword = !keyword || row.name.includes(keyword) || row.code.includes(keyword) || row.spec.includes(keyword);
    return matchCat && matchKeyword;
  });
  const pickedRows = BN_MATERIAL_POOL.filter(row => picked[row.code]);
  const confirm = () => {
    onConfirm(pickedRows[0] || rows[0]);
  };

  return (
    <Modal title="物料选择器" subtitle={`已选 ${pickedRows.length} 项`} onClose={onClose} size="picker" footer={<><Btn onClick={onClose}>取消</Btn><Btn kind="primary" onClick={confirm}>确定</Btn></>}>
      <div className="aw-picker-layout">
        <div className="aw-picker-side">
          <div className="aw-picker-side-h">物料分类</div>
          <div className="aw-picker-tree">
            {cats.map(cat => (
              <div key={cat} className={'aw-tree-row' + (category === cat ? ' on' : '')} onClick={() => setCategory(cat)}>
                <span className="aw-tree-caret">{cat === '全部物料' ? '▾' : '▸'}</span>
                <span>{cat}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="aw-picker-main">
          <div className="aw-picker-toolbar">
            <span className="aw-picker-count">{rows.length} 条可选</span>
            <div className="aw-picker-search">
              <span>⌕</span>
              <input placeholder="搜索物料编码、名称、规格" value={keyword} onChange={e => setKeyword(e.target.value)} />
            </div>
          </div>
          <div className="aw-picker-table">
            <table className="aw-table">
              <thead><tr><th style={{width:40}}>选</th><th>物料编码</th><th>名称</th><th>规格型号</th><th>类型</th><th>单位</th><th>单价</th></tr></thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.code} onClick={() => setPicked(prev => ({ ...prev, [row.code]: !prev[row.code] }))} style={{cursor:'pointer'}}>
                    <td><span className={'aw-chk' + (picked[row.code] ? ' on' : '')} /></td>
                    <td className="aw-num">{row.code}</td>
                    <td className="aw-link">{row.name}</td>
                    <td>{row.spec}</td>
                    <td><span className={'bn-type ' + (BN_TYPE_TONE[row.type] || 'virtual')}>{row.type}</span></td>
                    <td>{row.unit}</td>
                    <td className="aw-num">¥ {row.price.toFixed(2)}</td>
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

function BomImportModal({ onClose, onDone }) {
  const [step, setStep] = useBnState(1);
  const steps = ['粘贴/上传 Excel','字段映射','预览匹配','写入清单'];
  const mapRows = [
    ['层级','行号'],
    ['物料编码','物料'],
    ['物料名称','物料'],
    ['规格型号','规格型号'],
    ['数量','用量'],
    ['单位','单位'],
    ['损耗率','损耗%'],
    ['单价','单价'],
  ];
  const next = () => step < 4 ? setStep(step + 1) : onDone();
  const prev = () => step > 1 && setStep(step - 1);

  return (
    <Modal title="从 Excel 智能导入" subtitle="mock 流程演示，不做真实解析" onClose={onClose} size="xl" footer={<><Btn onClick={step === 1 ? onClose : prev}>{step === 1 ? '取消' : '上一步'}</Btn><Btn kind="primary" onClick={next}>{step === 4 ? '写入清单' : '下一步'}</Btn></>}>
      <div className="bn-import-steps">
        {steps.map((label, idx) => <span key={label} className={'bn-import-step' + (step === idx + 1 ? ' on' : step > idx + 1 ? ' done' : '')}>{idx + 1}. {label}</span>)}
      </div>
      {step === 1 && (
        <div className="bn-import-grid">
          <div className="bn-paste-box">{`粘贴 Excel 数据到这里，或点击上传 .xlsx\n\n层级\t物料编码\t物料名称\t规格\t数量\t单位\t损耗%\n1\tM-100\t智能温控锅总成\t8L\t1\t套\t0\n1.1\tM-110\t机身子装配\tAW-HT\t1\t套\t1\n1.1.1\tM-111\t内胆不锈钢件\tSUS304\t1\t件\t2`}</div>
          <div className="bn-example">
            <b>示例格式说明</b><br/>
            支持用“1 / 1.1 / 1.1.1”识别层级，也支持 Excel 缩进识别父子项。系统字段至少需要：物料名称、用量、单位；物料编码缺失时可进入待匹配。
          </div>
        </div>
      )}
      {step === 2 && (
        <table className="bn-map-table">
          <thead><tr><th>Excel 表头</th><th>系统字段</th></tr></thead>
          <tbody>{mapRows.map(row => <tr key={row[0]}><td>{row[0]}</td><td><Select defaultValue={row[1]}>{['行号','物料','规格型号','用量','单位','损耗%','单价','关联工序','备注'].map(x => <option key={x}>{x}</option>)}</Select></td></tr>)}</tbody>
        </table>
      )}
      {step === 3 && (
        <div className="bn-compare-body">
          <table className="aw-table">
            <thead><tr><th>识别层级</th><th>物料编码</th><th>物料名称</th><th>规格</th><th>用量</th><th>单位</th><th>匹配状态</th></tr></thead>
            <tbody>
              {[
                ['1','M-100','智能温控锅总成','8L','1','套','已匹配'],
                ['1.1','M-110','机身子装配','AW-HT','1','套','已匹配'],
                ['1.1.1','M-111','内胆不锈钢件','SUS304','1','件','已匹配'],
                ['1.1.2','M-150','Excel 导入测试件','导入识别层级','1','件','待新增'],
              ].map(row => <tr key={row[0]}><td className="aw-num">{row[0]}</td>{row.slice(1,6).map(cell => <td key={cell}>{cell}</td>)}<td><Badge tone={row[6] === '已匹配' ? 'g' : 'y'}>{row[6]}</Badge></td></tr>)}
            </tbody>
          </table>
        </div>
      )}
      {step === 4 && (
        <div className="bn-change-empty" style={{minHeight:240}}>
          已准备写入 4 行，其中 3 行匹配现有物料，1 行作为新物料待确认。点击“写入清单”后加入当前 BOM 草稿。
        </div>
      )}
    </Modal>
  );
}

function BomCompareView({ hasTree }) {
  if (!hasTree) {
    return (
      <Card style={{marginTop:14}}>
        <div className="bn-compare-empty">
          <div className="bn-empty-title">当前是全新的 BOM 草稿，暂无历史版本可对比</div>
          <div className="bn-empty-text">添加物料或从历史 BOM 复制后，版本对比会用于查看新增、删除和用量/价格变更。</div>
        </div>
      </Card>
    );
  }
  const render = (rows) => (
    <table>
      <thead><tr><th>行号</th><th>物料编码</th><th>物料</th><th>用量</th><th>单价</th></tr></thead>
      <tbody>
        {rows.map(row => (
          <tr key={row.no + row.code} className={row.status ? 'bn-diff-' + row.status : ''}>
            <td className="num">{row.no}</td>
            <td>{row.code}</td>
            <td>{row.name}</td>
            <td className={row.changed && row.changed.qty ? 'bn-diff-cell' : ''}>{row.changed && row.changed.qty ? row.changed.qty : row.qty}</td>
            <td className={row.changed && row.changed.price ? 'bn-diff-cell' : ''}>{row.changed && row.changed.price ? row.changed.price : row.price}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
  return (
    <div className="bn-compare">
      <div className="bn-compare-card">
        <div className="bn-compare-h"><span>V1.0</span><Badge tone="b">历史版本</Badge></div>
        <div className="bn-compare-body">{render(BN_COMPARE_LEFT)}</div>
      </div>
      <div className="bn-compare-card">
        <div className="bn-compare-h"><span>V1.1</span><Badge tone="g">当前草稿</Badge></div>
        <div className="bn-compare-body">{render(BN_COMPARE_RIGHT)}</div>
      </div>
    </div>
  );
}

function BomNewStandaloneApp() {
  const cfg = DEPT_CONFIG.rd;
  const [top, setTop] = useBnState('rd');
  return (
    <div data-screen-label="ERP Console - 新增BOM">
      <Topbar active={top} onChange={setTop} />
      <div className="aw-shell">
        <Sidebar title={cfg.title} items={cfg.sideItems} active="bom" onChange={() => {}} flyouts={cfg.flyouts} />
        <div className="aw-main">
          <PageHead><span style={{fontSize:15,fontWeight:600}}>新增BOM</span></PageHead>
          <BomNewScreen onBack={() => { window.location.href = 'index.html'; }} />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { BomNewScreen, BomNewStandaloneApp });
