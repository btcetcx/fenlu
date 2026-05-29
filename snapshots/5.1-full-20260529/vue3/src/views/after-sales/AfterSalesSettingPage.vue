<template>
  <aw-setting-page>
    <template #toolbar>
      <section class="aw-detail-toolbar">
        <button class="aw-back-btn" type="button" @click="goBack">
          <span class="aw-line-icon line-back" />返回售后中心
        </button>
      </section>
    </template>

    <aw-setting-split-page :class="{ 'as-setting-single': singlePage }">
      <template v-if="!singlePage" #tree>
        <aw-setting-tree
          title="设置分类"
          :active-key="activeKey"
          :items="treeItems"
          @select="selectDictionary(String($event))"
        />
      </template>

      <section class="as-setting-main">
        <div class="aw-list-toolbar as-setting-list-toolbar">
          <div class="aw-toolbar-left as-setting-toolbar-left">
            <div class="aw-search as-setting-search">
              <span class="aw-line-icon line-search"></span>
              <input v-model="keyword" :placeholder="`全局搜索（如${currentTitle}、配置编码、适用范围…）`" />
            </div>
          </div>
          <div class="aw-toolbar-right">
            <button class="aw-refresh-action" type="button" @click="refreshRows"><span class="aw-line-icon line-refresh"></span>刷新</button>
            <button class="aw-tool-btn" type="button" @click="filterOpen = !filterOpen"><span class="aw-line-icon line-filter"></span>筛选</button>
            <select v-if="filterOpen" v-model="stateFilter" class="as-setting-filter">
              <option value="">全部</option>
              <option>启用</option>
              <option>停用</option>
            </select>
            <button class="aw-tool-btn" type="button" @click="fieldOpen = true"><span class="aw-line-icon line-columns"></span>字段配置</button>
            <button class="aw-tool-btn" type="button" @click="showMessage('导出任务已生成')"><span class="aw-line-icon line-download"></span>导出</button>
            <button class="aw-tool-btn" type="button" @click="showMessage('导入模板已准备')"><span class="aw-line-icon line-upload"></span>导入</button>
            <button class="aw-btn primary" type="button" @click="openCreate">{{ currentConfig.addLabel }}</button>
          </div>
        </div>

        <div class="aw-doc-tbl-wrap">
          <div class="aw-doc-tbl-inner">
            <table class="aw-doc-tbl as-setting-table">
              <thead>
                <tr>
                  <th class="aw-check-col"><label class="aw-check"><input type="checkbox" :checked="allChecked" @change="toggleAll" /><span></span></label></th>
                  <th style="width:150px">配置编码</th>
                  <th style="width:220px">{{ currentTitle }}</th>
                  <th style="width:180px">适用范围</th>
                  <th style="width:110px">状态</th>
                  <th style="width:110px">维护人</th>
                  <th style="width:130px">更新日期</th>
                  <th style="width:90px">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in filteredRows" :key="row.id">
                  <td class="aw-check-col">
                    <label class="aw-check"><input type="checkbox" :checked="selectedIds.includes(row.id)" @change="toggleRow(row.id)" /><span></span></label>
                  </td>
                  <td class="aw-num">{{ row.code }}</td>
                  <td>{{ row.name }}</td>
                  <td>{{ row.type }}</td>
                  <td><span :class="['aw-status', row.state === '启用' ? 'green' : 'gray']">{{ row.state }}</span></td>
                  <td>{{ row.owner }}</td>
                  <td>{{ row.date }}</td>
                  <td>
                    <span class="aw-link" @click="openEdit(row)">编辑</span>
                    <span class="aw-action-split">|</span>
                    <span class="aw-link" @click="toggleState(row)">{{ row.state === '启用' ? '停用' : '启用' }}</span>
                  </td>
                </tr>
                <tr v-if="!filteredRows.length">
                  <td colspan="8" class="as-setting-empty">暂无符合当前条件的配置项。</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="aw-list-footer">
          <div class="aw-footer-left">
            <label class="aw-check"><input type="checkbox" :checked="allChecked" @change="toggleAll" /><span></span></label>
            <span>共 {{ currentRows.length * 20 }} 条</span>
            <span>已选 {{ selectedIds.length }} 项</span>
            <button class="aw-bulk-btn" type="button" @click="batchState('启用')">批量启用</button>
            <button class="aw-bulk-btn" type="button" @click="batchState('停用')">批量停用</button>
          </div>
          <div class="aw-pagination">
            <button type="button">上一页</button>
            <button class="on" type="button">1</button>
            <button type="button">2</button>
            <button type="button">下一页</button>
          </div>
        </div>

        <div v-if="message" class="as-setting-message">{{ message }}</div>
      </section>
    </aw-setting-split-page>

    <div v-if="fieldOpen" class="aw-mask" @click="fieldOpen = false">
      <div class="aw-modal as-setting-field-modal" @click.stop>
        <div class="head">
          <span class="aw-modal-title">字段配置</span>
          <button class="aw-modal-close" type="button" @click="fieldOpen = false">×</button>
        </div>
        <div class="body">
          <div class="as-field-grid">
            <label v-for="column in currentConfig.columns" :key="column" class="aw-switch-line">
              <input checked type="checkbox" />
              <i></i>
              <em>{{ column }}</em>
            </label>
          </div>
        </div>
        <div class="aw-modal-foot">
          <button class="aw-btn" type="button" @click="fieldOpen = false">取消</button>
          <button class="aw-btn primary" type="button" @click="fieldOpen = false">保存</button>
        </div>
      </div>
    </div>

    <div v-if="editorOpen" class="aw-mask" @click="closeEditor">
      <div class="aw-modal" @click.stop>
        <div class="head">
          <span class="aw-modal-title">{{ currentConfig.addLabel }}</span>
          <span class="aw-modal-sub">{{ currentConfig.note }}</span>
          <button class="aw-modal-close" type="button" @click="closeEditor">×</button>
        </div>
        <div class="body">
          <div class="aw-doc-grid as-editor-grid">
            <label class="aw-field">
              <label class="req">配置名称</label>
              <input v-model="editor.name" class="aw-input" :placeholder="`请输入${currentTitle}`" />
            </label>
            <label class="aw-field">
              <label>配置编码</label>
              <input v-model="editor.code" class="aw-input" readonly />
            </label>
            <label class="aw-field">
              <label>适用范围</label>
              <select v-model="editor.type" class="aw-select">
                <option>售后发起</option>
                <option>售后处理</option>
                <option>质量闭环</option>
                <option>全部场景</option>
                <option v-if="editor.type && !standardScopes.includes(editor.type)">{{ editor.type }}</option>
              </select>
            </label>
            <label class="aw-field">
              <label>是否启用</label>
              <select v-model="editor.state" class="aw-select">
                <option>启用</option>
                <option>停用</option>
              </select>
            </label>
          </div>
        </div>
        <div class="aw-modal-foot">
          <button class="aw-btn" type="button" @click="closeEditor">取消</button>
          <button class="aw-btn primary" type="button" @click="saveEditor">保存</button>
        </div>
      </div>
    </div>
  </aw-setting-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AwSettingPage from '@/components/setting-page/AwSettingPage.vue';
import AwSettingSplitPage from '@/components/setting-page/AwSettingSplitPage.vue';
import AwSettingTree from '@/components/setting-page/AwSettingTree.vue';
import { afterSalesComplaintOptions, afterSalesHandlingSettings, afterSalesProcessOptions, afterSalesReasonOptions, afterSalesTypeCards } from '@/app/api/after-sales/dictionaries';

type SettingKey = '售后原因' | '投诉问题' | '售后类型' | '处理方式';

interface DictSeedRow {
  code: string;
  name: string;
  scene: string;
  required: string;
  linkage: string;
}

interface DictTableRow {
  id: string;
  code: string;
  name: string;
  type: string;
  state: '启用' | '停用';
  owner: string;
  date: string;
  required: string;
  linkage: string;
}

interface DictConfig {
  addLabel: string;
  note: string;
  columns: string[];
  rows: DictSeedRow[];
}

const props = withDefaults(defineProps<{
  initialKey?: string;
  singlePage?: boolean;
  backPath?: string;
}>(), {
  initialKey: '售后原因',
  singlePage: false,
  backPath: '/after-sales',
});

const router = useRouter();
const route = useRoute();
const presetKeys = ['售后原因', '投诉问题', '售后类型', '处理方式'];
const singlePage = computed(() => props.singlePage || presetKeys.includes(String(route.query.setting || route.query.action || '')));

const dictConfigs: Record<SettingKey, DictConfig> = {
  售后原因: {
    addLabel: '新增售后原因',
    note: '用于发起售后时产品行的“问题原因”下拉。',
    rows: afterSalesReasonOptions.map((name, index) => ({
      code: `REASON-${String(index + 1).padStart(3, '0')}`,
      name,
      scene: index < 3 ? '退换货 / 换货' : '通用',
      required: index < 3 ? '是' : '否',
      linkage: index === 1 ? '可触发质量判定' : '记录原因',
    })),
    columns: ['编码', '原因名称', '适用场景', '是否常用', '后续联动'],
  },
  投诉问题: {
    addLabel: '新增投诉问题',
    note: '用于售后详情、质量闭环和客诉归类。',
    rows: afterSalesComplaintOptions.map((name, index) => ({
      code: `COMP-${String(index + 1).padStart(3, '0')}`,
      name,
      scene: index < 4 ? '产品/包装' : '服务',
      required: index < 4 ? '是' : '否',
      linkage: index < 4 ? '可关联质检复判' : '服务回访',
    })),
    columns: ['编码', '投诉问题', '问题归类', '是否常用', '后续联动'],
  },
  售后类型: {
    addLabel: '新增售后类型',
    note: '用于发起售后第二步“选择售后类型”。',
    rows: afterSalesTypeCards.map((item, index) => ({
      code: `TYPE-${String(index + 1).padStart(3, '0')}`,
      name: item.title,
      scene: item.owners,
      required: '是',
      linkage: item.desc,
    })),
    columns: ['编码', '售后类型', '责任角色', '是否启用', '说明'],
  },
  处理方式: {
    addLabel: '新增处理方式',
    note: '用于新增售后时选择处理方式，并驱动派生单据、任务和状态回填。',
    rows: afterSalesHandlingSettings.map((item, index) => ({
      code: `ACTION-${String(index + 1).padStart(3, '0')}`,
      name: item.name,
      scene: item.scene || afterSalesProcessOptions[index] || '通用',
      required: '是',
      linkage: item.linkage,
    })),
    columns: ['编码', '处理方式', '适用类型', '是否启用', '后续联动'],
  },
};

const rowsByKey = reactive<Record<SettingKey, DictTableRow[]>>({
  售后原因: buildRows('售后原因'),
  投诉问题: buildRows('投诉问题'),
  售后类型: buildRows('售后类型'),
  处理方式: buildRows('处理方式'),
});
const activeKey = ref<SettingKey>(normalizeSettingKey(route.query.setting || route.query.action || props.initialKey));
const keyword = ref('');
const stateFilter = ref('');
const filterOpen = ref(false);
const fieldOpen = ref(false);
const editorOpen = ref(false);
const editingId = ref('');
const message = ref('');
const selectedIds = ref<string[]>([]);
const standardScopes = ['售后发起', '售后处理', '质量闭环', '全部场景'];
const editor = reactive({
  name: '',
  code: '自动生成',
  type: '售后发起',
  state: '启用' as '启用' | '停用',
});

const currentConfig = computed(() => dictConfigs[activeKey.value]);
const currentTitle = computed(() => activeKey.value);
const currentRows = computed(() => rowsByKey[activeKey.value]);
const treeItems = computed(() => (Object.keys(dictConfigs) as SettingKey[]).map((key) => ({
  key,
  label: key,
  count: rowsByKey[key].length,
  icon: 'line-doc',
})));
const filteredRows = computed(() => {
  const term = keyword.value.trim();
  return currentRows.value.filter((row) => {
    const keywordMatched = !term || [row.code, row.name, row.type, row.owner, row.linkage].some((value) => value.includes(term));
    const stateMatched = !stateFilter.value || row.state === stateFilter.value;
    return keywordMatched && stateMatched;
  });
});
const allChecked = computed(() => filteredRows.value.length > 0 && filteredRows.value.every((row) => selectedIds.value.includes(row.id)));

watch(
  () => [route.query.setting, route.query.action, props.initialKey] as const,
  () => {
    const nextKey = normalizeSettingKey(route.query.setting || route.query.action || props.initialKey);
    if (nextKey !== activeKey.value) {
      selectDictionary(nextKey);
    }
  },
);

function buildRows(key: SettingKey) {
  return dictConfigs[key].rows.map((row, index) => ({
    id: `${key}_${row.code}`,
    code: row.code,
    name: row.name,
    type: row.scene,
    state: '启用' as const,
    owner: index % 2 ? '李文涛' : '老夏',
    date: `2026-05-${String(12 + index).padStart(2, '0')}`,
    required: row.required,
    linkage: row.linkage,
  }));
}

function normalizeSettingKey(value: unknown): SettingKey {
  const key = String(value || '');
  return Object.prototype.hasOwnProperty.call(dictConfigs, key) ? key as SettingKey : '售后原因';
}

function selectDictionary(key: string) {
  activeKey.value = normalizeSettingKey(key);
  keyword.value = '';
  stateFilter.value = '';
  selectedIds.value = [];
  closeEditor();
}

function refreshRows() {
  rowsByKey[activeKey.value] = buildRows(activeKey.value);
  selectedIds.value = [];
  showMessage(`${currentTitle.value}已刷新`);
}

function openCreate() {
  editingId.value = '';
  editor.name = currentConfig.value.rows[0]?.name || '';
  editor.code = '自动生成';
  editor.type = '售后发起';
  editor.state = '启用';
  editorOpen.value = true;
}

function openEdit(row: DictTableRow) {
  editingId.value = row.id;
  editor.name = row.name;
  editor.code = row.code;
  editor.type = row.type;
  editor.state = row.state;
  editorOpen.value = true;
}

function saveEditor() {
  if (!editor.name.trim()) return;
  const rows = rowsByKey[activeKey.value];
  const existing = rows.find((row) => row.id === editingId.value);
  if (existing) {
    existing.name = editor.name.trim();
    existing.type = editor.type;
    existing.state = editor.state;
    existing.date = '2026-05-29';
    showMessage(`${currentTitle.value}已保存`);
  } else {
    const code = nextCode(activeKey.value);
    rows.unshift({
      id: `${activeKey.value}_${code}`,
      code,
      name: editor.name.trim(),
      type: editor.type,
      state: editor.state,
      owner: '老夏',
      date: '2026-05-29',
      required: '是',
      linkage: '按配置联动售后流程',
    });
    showMessage(`${currentConfig.value.addLabel}已保存`);
  }
  closeEditor();
}

function nextCode(key: SettingKey) {
  const prefixMap: Record<SettingKey, string> = {
    售后原因: 'REASON',
    投诉问题: 'COMP',
    售后类型: 'TYPE',
    处理方式: 'ACTION',
  };
  return `${prefixMap[key]}-${String(rowsByKey[key].length + 1).padStart(3, '0')}`;
}

function closeEditor() {
  editorOpen.value = false;
  editingId.value = '';
}

function toggleRow(id: string) {
  selectedIds.value = selectedIds.value.includes(id)
    ? selectedIds.value.filter((item) => item !== id)
    : [...selectedIds.value, id];
}

function toggleAll() {
  selectedIds.value = allChecked.value ? [] : filteredRows.value.map((row) => row.id);
}

function toggleState(row: DictTableRow) {
  row.state = row.state === '启用' ? '停用' : '启用';
  row.date = '2026-05-29';
}

function batchState(state: '启用' | '停用') {
  currentRows.value.forEach((row) => {
    if (selectedIds.value.includes(row.id)) {
      row.state = state;
      row.date = '2026-05-29';
    }
  });
  showMessage(`已批量${state}${selectedIds.value.length}项`);
}

function showMessage(text: string) {
  message.value = text;
}

function goBack() {
  router.push(props.backPath);
}
</script>

<style scoped>
:deep(.as-setting-single.aw-setting-split) {
  grid-template-columns: minmax(0, 1fr);
}

.as-setting-main {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.as-setting-list-toolbar {
  align-items: flex-start;
  flex-wrap: wrap;
}

.as-setting-toolbar-left {
  flex: 1 1 520px;
  align-items: center;
  flex-wrap: wrap;
}

.as-setting-list-toolbar .aw-toolbar-right {
  flex: 1 1 520px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.as-setting-search {
  width: 330px;
  flex: none;
}

.as-setting-filter {
  height: 32px;
  border: 1px solid var(--aw-border);
  border-radius: 6px;
  background: #fff;
  padding: 0 10px;
}

.as-setting-table {
  min-width: 990px;
}

.as-setting-empty {
  height: 88px;
  text-align: center;
  color: var(--aw-fg-3);
}

.as-setting-message {
  padding: 9px 12px;
  border: 1px solid var(--aw-border);
  border-radius: 6px;
  background: var(--aw-surface-2);
  color: var(--aw-fg-2);
  font-size: 13px;
}

.aw-doc-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 18px;
}

.as-editor-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.as-setting-field-modal {
  width: min(520px, calc(100vw - 56px));
}

.as-field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 18px;
}

@media (max-width: 980px) {
  .as-setting-search,
  .as-setting-list-toolbar .aw-toolbar-right > .aw-btn,
  .as-setting-list-toolbar .aw-toolbar-right > .aw-tool-btn,
  .as-setting-list-toolbar .aw-toolbar-right > .aw-refresh-action,
  .as-setting-filter {
    width: 100%;
  }

  .aw-doc-grid,
  .as-editor-grid,
  .as-field-grid {
    grid-template-columns: 1fr;
  }
}
</style>
