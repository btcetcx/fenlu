const { createApp, reactive, ref, computed, onMounted } = Vue;

const API_BASE = window.WORKBENCH_API_BASE || '/api';

const emptyWorkbench = () => ({
  deptTitle: '',
  overview: { total: 0, done: 0 },
  summary: [],
  todos: [],
  navTiles: [],
  entries: [],
  tabs: [
    { key: 'all', label: '全部' },
    { key: 'approve', label: '审批' },
    { key: 'warning', label: '预警' },
    { key: 'follow', label: '跟进' },
  ],
  tasks: [],
  timeline: [],
});

const deptOptions = [
  { k: 'rd', v: '研发中心' },
  { k: 'purchase', v: '采购中心' },
  { k: 'sales', v: '销售中心' },
  { k: 'warehouse', v: '仓储中心' },
  { k: 'mfg', v: '生产中心' },
  { k: 'qc', v: '质量中心' },
  { k: 'finance', v: '财务中心' },
  { k: 'hr', v: '人力中心' },
];

const normalizeWorkbench = (payload = {}) => ({
  ...emptyWorkbench(),
  ...payload,
  overview: { ...emptyWorkbench().overview, ...(payload.overview || {}) },
  summary: Array.isArray(payload.summary) ? payload.summary : [],
  todos: Array.isArray(payload.todos) ? payload.todos : [],
  navTiles: Array.isArray(payload.navTiles) ? payload.navTiles : [],
  entries: Array.isArray(payload.entries) ? payload.entries : [],
  tabs: Array.isArray(payload.tabs) && payload.tabs.length ? payload.tabs : emptyWorkbench().tabs,
  tasks: Array.isArray(payload.tasks) ? payload.tasks : [],
  timeline: Array.isArray(payload.timeline) ? payload.timeline : [],
});

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!response.ok) {
    const message = await response.text().catch(() => '');
    const cleanMessage = message.trim().startsWith('<') ? '' : message.trim();
    throw new Error(cleanMessage || `接口请求失败：${response.status}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

function createWorkbenchMock(dept) {
  const deptTitle = deptOptions.find(item => item.k === dept)?.v || '研发中心';
  const moduleLabel = deptTitle.replace('中心', '');

  return {
    deptTitle,
    overview: { total: 108, done: 72 },
    summary: [
      { key: 'todo', label: '待处理', value: 69, delta: '实时', tone: 'warn' },
      { key: 'risk', label: '风险预警', value: 5, delta: '+2', tone: 'risk' },
      { key: 'flow', label: '流转中', value: 150, delta: '+12%', tone: 'info' },
      { key: 'done', label: '今日完成', value: 72, delta: '66%', tone: 'done' },
    ],
    todos: [
      { key: 'review', label: `待评审${moduleLabel}资料`, count: 12, tone: 'sky', hint: '3 项今日到期' },
      { key: 'approve', label: '待审批单据', count: 8, tone: 'mint', hint: '跨部门流转' },
      { key: 'risk', label: '异常预警', count: 5, tone: 'rose', hint: '需优先处理' },
      { key: 'change', label: '变更待确认', count: 6, tone: 'peach', hint: '影响下游业务' },
      { key: 'archive', label: '待归档资料', count: 18, tone: 'lilac', hint: '文档中心' },
      { key: 'cost', label: '成本待核算', count: 4, tone: 'sand', hint: '需财务复核' },
      { key: 'supplier', label: '供应商反馈', count: 7, tone: 'sky', hint: '交期变动' },
      { key: 'qc', label: '质检待确认', count: 9, tone: 'mint', hint: '检验报告' },
    ],
    navTiles: [
      { label: '文档', sub: '设计图纸', n: 25, tint: '#DCE7FB', fg: '#5677FC', icon: '文', moduleKey: 'doc' },
      { label: '项目', sub: '项目管理', n: 28, tint: '#DCE7FB', fg: '#5677FC', icon: '项', moduleKey: 'project' },
      { label: '产品', sub: '产品管理', n: 18, tint: '#DCE7FB', fg: '#5677FC', icon: '品', moduleKey: 'product' },
      { label: '物料', sub: '物料清单', n: 52, tint: '#DBF3E6', fg: '#10B981', icon: '料', moduleKey: 'material' },
      { label: '工序', sub: '工序管理', n: 0, tint: '#FEF3CD', fg: '#B26A24', icon: '序', moduleKey: 'process' },
      { label: '工艺', sub: '工艺管理', n: 0, tint: '#FBDFDF', fg: '#D14D4D', icon: '艺', moduleKey: 'craft' },
      { label: '采购', sub: '采购申请', n: 16, tint: '#E8DEFB', fg: '#8957D8', icon: '购', moduleKey: 'pr' },
      { label: '质检', sub: '质量检验', n: 11, tint: '#F6EFD9', fg: '#6D5818', icon: '质', moduleKey: 'qcIqc' },
    ],
    entries: [
      { label: '新建项目', tint: '#DCE7FB', fg: '#5677FC', icon: '项', moduleKey: 'project', action: '新增项目' },
      { label: '新增产品', tint: '#DBF3E6', fg: '#10B981', icon: '品', moduleKey: 'product', action: '新增产品' },
      { label: '新建 BOM', tint: '#FEF3CD', fg: '#B26A24', icon: 'B', moduleKey: 'bom', action: '新增BOM' },
      { label: '采购申请', tint: '#E8DEFB', fg: '#8957D8', icon: '购', moduleKey: 'pr', action: '新增采购申请' },
      { label: '发起审批', tint: '#FBDFDF', fg: '#D14D4D', icon: '审', moduleKey: 'approval' },
      { label: '导入数据', tint: '#F6EFD9', fg: '#6D5818', icon: '入' },
    ],
    tabs: [
      { key: 'all', label: '全部' },
      { key: 'approve', label: '审批' },
      { key: 'warning', label: '预警' },
      { key: 'follow', label: '跟进' },
    ],
    tasks: [
      { type: 'approve', title: '采购申请审批', code: 'PR-2026-0522-008', module: '采购中心', owner: '周明', due: '今天 17:00', status: '待处理', statusTone: 'wait', progress: 42 },
      { type: 'warning', title: '关键物料库存低于安全线', code: 'MAT-AX-091', module: '仓储中心', owner: '李倩', due: '今天 15:30', status: '预警', statusTone: 'risk', progress: 68 },
      { type: 'follow', title: '新品试制评审资料补齐', code: 'PRJ-2026-017', module: deptTitle, owner: '陈工', due: '明天 10:00', status: '跟进中', statusTone: 'run', progress: 76 },
      { type: 'approve', title: '客户合同价格条款复核', code: 'CT-2026-119', module: '销售中心', owner: '王敏', due: '明天 12:00', status: '待处理', statusTone: 'wait', progress: 35 },
    ],
    timeline: [
      { time: '09:42', title: '生产计划自动生成 3 张工单', tone: 'done' },
      { time: '10:18', title: '供应商交期变更待确认', tone: 'warn' },
      { time: '11:05', title: '质量检验报告已归档', tone: 'done' },
      { time: '13:30', title: '销售订单触发库存占用', tone: 'info' },
    ],
  };
}

const workbenchApi = {
  async getWorkbench(dept) {
    try {
      return {
        source: 'api',
        data: await requestJson(`${API_BASE}/workbench?dept=${encodeURIComponent(dept)}`),
      };
    } catch (error) {
      return {
        source: 'mock',
        error,
        data: createWorkbenchMock(dept),
      };
    }
  },
  updateTask(code, action) {
    return requestJson(`${API_BASE}/workbench/tasks/${encodeURIComponent(code)}/${action}`, {
      method: 'POST',
    });
  },
  saveLayout(group, dept, items) {
    return requestJson(`${API_BASE}/workbench/layout/${encodeURIComponent(group)}`, {
      method: 'PUT',
      body: JSON.stringify({ dept, items }),
    });
  },
  getDrawerDetail(type, item) {
    const id = item.key || item.code || item.moduleKey || item.label || '';
    return requestJson(`${API_BASE}/workbench/detail?type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`);
  },
};

createApp({
  setup() {
    const dept = ref('rd');
    const data = reactive(emptyWorkbench());
    const keyword = ref('');
    const currentTab = ref('all');
    const drawer = ref(null);
    const drawerDetail = ref(null);
    const showMoreTodo = ref(false);
    const loading = ref(false);
    const actionLoading = ref('');
    const dataSource = ref('api');
    const noticeText = ref('');

    const loadWorkbench = async (key = dept.value) => {
      loading.value = true;
      noticeText.value = '';
      const result = await workbenchApi.getWorkbench(key);
      Object.assign(data, normalizeWorkbench(result.data));
      dataSource.value = result.source;
      if (result.source === 'mock') {
        noticeText.value = `接口暂不可用，当前显示 mock 数据。${result.error?.message || ''}`;
      }
      loading.value = false;
    };

    const switchDept = async (key) => {
      dept.value = key;
      currentTab.value = 'all';
      keyword.value = '';
      drawer.value = null;
      await loadWorkbench(key);
    };

    const totalTodo = computed(() => data.todos.reduce((sum, item) => sum + Number(item.count || 0), 0));
    const todoCards = computed(() => showMoreTodo.value ? data.todos : data.todos.slice(0, 6));
    const todayPercent = computed(() => {
      const total = Number(data.overview.total || 0);
      if (!total) return 0;
      return Math.min(100, Math.round((Number(data.overview.done || 0) / total) * 100));
    });
    const filteredTasks = computed(() => {
      const kw = keyword.value.trim().toLowerCase();
      return data.tasks.filter(item => {
        const inTab = currentTab.value === 'all' || item.type === currentTab.value;
        const inKeyword = !kw || [item.title, item.code, item.owner, item.module].join(' ').toLowerCase().includes(kw);
        return inTab && inKeyword;
      });
    });

    const openDrawer = async (type, item) => {
      drawer.value = { type, item };
      drawerDetail.value = null;
      try {
        drawerDetail.value = dataSource.value === 'mock'
          ? { source: 'mock', type, item, rows: buildMockDetailRows(type, item) }
          : await workbenchApi.getDrawerDetail(type, item);
      } catch (error) {
        drawerDetail.value = { error: error.message || '明细接口请求失败' };
      }
    };

    const closeDrawer = () => {
      drawer.value = null;
      drawerDetail.value = null;
    };

    const updateTask = async (task, action) => {
      actionLoading.value = `${action}-${task.code}`;
      noticeText.value = '';
      try {
        if (dataSource.value === 'mock') {
          task.status = action === 'approve' ? '已处理' : '退回补充';
          task.statusTone = action === 'approve' ? 'run' : 'risk';
          task.progress = action === 'approve' ? 100 : task.progress;
          data.timeline.unshift({
            time: '刚刚',
            title: `${task.title}${action === 'approve' ? '已处理' : '已退回'}`,
            tone: action === 'approve' ? 'done' : 'warn',
          });
        } else {
          const updated = await workbenchApi.updateTask(task.code, action);
          if (updated?.task) Object.assign(task, updated.task);
          if (updated?.timeline) data.timeline.unshift(updated.timeline);
          await loadWorkbench(dept.value);
        }
      } catch (error) {
        noticeText.value = error.message || '任务处理失败';
      } finally {
        actionLoading.value = '';
      }
    };

    const moveItem = async (list, from, to, group) => {
      if (from === to) return;
      const item = list.splice(from, 1)[0];
      list.splice(to, 0, item);
      if (dataSource.value === 'mock') return;
      try {
        await workbenchApi.saveLayout(group, dept.value, list);
      } catch (error) {
        list.splice(to, 1);
        list.splice(from, 0, item);
        noticeText.value = error.message || '布局保存失败';
      }
    };

    const onDragStart = (event, group, index) => {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', JSON.stringify({ group, index }));
    };
    const onDrop = (event, group, index) => {
      const raw = event.dataTransfer.getData('text/plain');
      if (!raw) return;
      const payload = JSON.parse(raw);
      if (payload.group !== group) return;
      moveItem(group === 'nav' ? data.navTiles : data.entries, payload.index, index, group);
    };

    onMounted(() => loadWorkbench());

    return {
      dept,
      deptOptions,
      data,
      keyword,
      currentTab,
      drawer,
      drawerDetail,
      showMoreTodo,
      loading,
      actionLoading,
      dataSource,
      noticeText,
      totalTodo,
      todoCards,
      todayPercent,
      filteredTasks,
      switchDept,
      openDrawer,
      closeDrawer,
      updateTask,
      onDragStart,
      onDrop,
    };
  },
  template: `
    <div class="vw-shell">
      <aside class="vw-side">
        <div class="vw-brand"><div class="vw-brand-mark">ERP</div><div><strong>傲为控制台</strong><span>Vue3 接口工作台</span></div></div>
        <nav class="vw-nav">
          <button v-for="item in deptOptions" :key="item.k" :class="{on: dept === item.k}" @click="switchDept(item.k)">{{ item.v }}</button>
        </nav>
      </aside>
      <main class="vw-main">
        <header class="vw-topbar">
          <h1>{{ data.deptTitle || '工作台' }} / 工作台</h1>
          <span>{{ dataSource === 'mock' ? '当前：mock 数据' : '接口：' + '${API_BASE}' + '/workbench?dept=' + dept }}</span>
        </header>
        <div class="vw-content">
          <section v-if="noticeText" class="vw-alert">{{ noticeText }}</section>

          <section class="vw-hero">
            <div><div class="vw-kicker">{{ data.deptTitle || '加载中' }}</div><h2>今日业务协同</h2><p>页面优先请求接口；接口不可用时自动回退 mock 数据，后端接入后无需改页面结构。</p></div>
            <label class="vw-search"><span>⌕</span><input v-model="keyword" placeholder="搜索单号、负责人、模块"></label>
            <div class="vw-progress"><span>今日完成率</span><strong>{{ todayPercent }}%</strong><i><b :style="{width: todayPercent + '%'}"></b></i></div>
          </section>

          <section class="vw-summary">
            <button v-for="item in data.summary" :key="item.key" type="button" @click="openDrawer('summary', item)"><span>{{ item.label }}</span><strong>{{ item.value }}</strong><em :class="'tone-' + item.tone">{{ item.delta }}</em></button>
            <div v-if="!data.summary.length" class="aw-empty">{{ loading ? '正在加载数据' : '暂无汇总数据' }}</div>
          </section>

          <section class="vw-card">
            <div class="vw-card-head"><div class="vw-title">待办事项</div><div class="vw-actions"><button @click="openDrawer('todoAll', {label:'全部待办', value: totalTodo})">全部 {{ totalTodo }}</button><button @click="showMoreTodo = !showMoreTodo">{{ showMoreTodo ? '收起' : '展开' }}</button></div></div>
            <div class="vw-todo-grid"><button v-for="item in todoCards" :key="item.key" :class="'vw-todo ' + item.tone" @click="openDrawer('todo', item)"><span>{{ item.label }}</span><strong>{{ item.count }}</strong><em>{{ item.hint }}</em></button></div>
            <div v-if="!data.todos.length" class="aw-empty">{{ loading ? '正在加载待办' : '暂无待办事项' }}</div>
          </section>

          <section class="vw-card">
            <div class="vw-card-head"><div class="vw-title">业务导航</div><div class="vw-muted">接口模式下拖动后保存布局；mock 模式仅本地排序</div></div>
            <div class="vw-nav-grid"><button v-for="(item,index) in data.navTiles" :key="item.label" class="vw-nav-tile" draggable="true" @dragstart="onDragStart($event,'nav',index)" @dragover.prevent @drop="onDrop($event,'nav',index)" @click="openDrawer('module', item)"><span class="vw-nav-icon" :style="{background:item.tint,color:item.fg}">{{ item.icon }}</span><strong>{{ item.label }}</strong><em>{{ item.sub }}</em><i v-if="item.n">{{ item.n }}</i></button></div>
            <div v-if="!data.navTiles.length" class="aw-empty">{{ loading ? '正在加载导航' : '暂无业务导航' }}</div>
          </section>

          <section class="vw-card">
            <div class="vw-card-head"><div class="vw-title">便捷入口</div><div class="vw-muted">拖动排序，点击打开明细</div></div>
            <div class="vw-entry-grid"><button v-for="(item,index) in data.entries" :key="item.label" draggable="true" @dragstart="onDragStart($event,'entry',index)" @dragover.prevent @drop="onDrop($event,'entry',index)" @click="openDrawer('entry', item)"><span :style="{background:item.tint,color:item.fg}">{{ item.icon }}</span><strong>{{ item.label }}</strong></button><button class="vw-entry-add" @click="openDrawer('entryAdd', {label:'新增入口'})"><span>+</span><strong>新增入口</strong></button></div>
          </section>

          <section class="vw-main-grid">
            <div class="vw-card">
              <div class="vw-card-head"><div class="vw-title">任务流</div><div class="vw-tabs"><button v-for="tab in data.tabs" :key="tab.key" :class="{on: currentTab === tab.key}" @click="currentTab = tab.key">{{ tab.label }}</button></div></div>
              <div class="vw-task-list">
                <div v-for="task in filteredTasks" :key="task.code" class="vw-task-row"><div class="vw-task-main"><div><strong>{{ task.title }}</strong><span>{{ task.code }}</span></div><p>{{ task.module }} · {{ task.owner }} · {{ task.due }}</p><i><b :style="{width:task.progress + '%'}"></b></i></div><span :class="'vw-status status-' + task.statusTone">{{ task.status }}</span><div class="vw-task-actions"><button :disabled="actionLoading === 'approve-' + task.code" @click="updateTask(task, 'approve')">处理</button><button :disabled="actionLoading === 'reject-' + task.code" @click="updateTask(task, 'reject')">退回</button></div></div>
                <div v-if="!filteredTasks.length" class="aw-empty">{{ loading ? '正在加载任务' : '未找到匹配任务' }}</div>
              </div>
            </div>
            <aside class="vw-card"><div class="vw-title">动态与预警</div><div class="vw-timeline" style="margin-top:12px"><button v-for="item in data.timeline" :key="item.time + item.title" @click="openDrawer('timeline', item)"><span :class="'tone-' + item.tone"></span><strong>{{ item.title }}</strong><em>{{ item.time }}</em></button></div><div v-if="!data.timeline.length" class="aw-empty">{{ loading ? '正在加载动态' : '暂无动态' }}</div></aside>
          </section>
        </div>
      </main>

      <div v-if="drawer" class="vw-drawer-mask" @click.self="closeDrawer">
        <aside class="vw-drawer">
          <header><div><span>{{ data.deptTitle }}</span><strong>{{ drawer.item.label || drawer.item.title || '明细' }}</strong></div><button @click="closeDrawer">×</button></header>
          <div class="vw-drawer-body">
            <div class="aw-kv-grid one"><div class="aw-kv"><span class="aw-kv-l">数据模式</span><span class="aw-kv-v">{{ dataSource }}</span></div><div class="aw-kv"><span class="aw-kv-l">当前标识</span><span class="aw-kv-v">{{ drawer.item.key || drawer.item.code || drawer.item.moduleKey || drawer.item.label || '-' }}</span></div><div class="aw-kv"><span class="aw-kv-l">当前数值</span><span class="aw-kv-v">{{ drawer.item.value || drawer.item.count || drawer.item.n || '-' }}</span></div></div>
            <div class="vw-note" v-if="drawerDetail?.error">{{ drawerDetail.error }}</div>
            <pre v-else class="vw-note">{{ drawerDetail ? JSON.stringify(drawerDetail, null, 2) : '正在请求明细...' }}</pre>
          </div>
        </aside>
      </div>
    </div>
  `,
}).mount('#vue-workbench');

function buildMockDetailRows(type, item) {
  const title = item.label || item.title || item.code || '明细';
  return [
    { code: 'MOCK-001', name: `${title} 明细一`, status: '待处理', owner: '周明' },
    { code: 'MOCK-002', name: `${title} 明细二`, status: '流转中', owner: '李倩' },
    { code: 'MOCK-003', name: `${title} 明细三`, status: '已完成', owner: '王敏' },
  ];
}
