<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getOperationSettings, saveOperationSettings } from '@/app/api/operation/settings';
import {
  operationSettingTemplates,
  type OperationApprovalRuleRow,
  type OperationSettingModule,
  type OperationSettingType,
} from '@/app/templates/operation-settings-template';
import AwApprovalRuleEditor from '@/components/setting-page/AwApprovalRuleEditor.vue';
import AwCodeRuleBuilder from '@/components/setting-page/AwCodeRuleBuilder.vue';
import AwFieldSettingPage from '@/components/setting-page/AwFieldSettingPage.vue';
import AwPersonPickerModal from '@/components/setting-page/AwPersonPickerModal.vue';
import AwSettingListCard from '@/components/setting-page/AwSettingListCard.vue';
import AwSettingPage from '@/components/setting-page/AwSettingPage.vue';
import AwSettingSplitPage from '@/components/setting-page/AwSettingSplitPage.vue';
import AwSettingTable from '@/components/setting-page/AwSettingTable.vue';
import AwSettingToolbar from '@/components/setting-page/AwSettingToolbar.vue';
import AwSettingTree from '@/components/setting-page/AwSettingTree.vue';
import AwStrategySettingPage from '@/components/setting-page/AwStrategySettingPage.vue';
import type { ApprovalNode, FieldSettingRow, PersonPickerDept, PersonPickerPerson, StrategyRule, StrategyTab } from '@/components/setting-page/types';

const props = defineProps<{ module: OperationSettingModule }>();

const route = useRoute();
const router = useRouter();
const template = computed(() => operationSettingTemplates[props.module]);
const settingType = computed<OperationSettingType>(() => {
  const value = String(route.query.setting || 'fields');
  return ['categories', 'template', 'fields', 'numbers', 'approvals', 'strategies', 'print'].includes(value) ? value as OperationSettingType : 'fields';
});
const settingTitle = computed(() => template.value.typeTitles[settingType.value]);
const currentExtraList = computed(() => ['categories', 'template'].includes(settingType.value) ? template.value.extraLists?.[settingType.value as 'categories' | 'template'] : undefined);
const showAdd = computed(() => (['fields', 'approvals', 'print'].includes(settingType.value) || Boolean(currentExtraList.value)) && !editingApproval.value);
const addText = computed(() => {
  if (settingType.value === 'fields') return template.value.fields.addText;
  if (settingType.value === 'approvals') return template.value.approvals.addText;
  if (settingType.value === 'print') return template.value.print.addText;
  if (currentExtraList.value) return currentExtraList.value.addText;
  return '';
});

const fieldRows = ref<FieldSettingRow[]>(template.value.fields.rows.map((row) => ({ ...row })));
const activeScope = ref(template.value.fields.scopes[0]?.key || '');
const prefix = ref(template.value.numbers.prefix);
const separator = ref(template.value.numbers.separator);
const selectedNumbers = ref<string[]>([...template.value.numbers.selected]);
const approvalRows = ref<OperationApprovalRuleRow[]>(template.value.approvals.rows.map((row) => ({
  ...row,
  nodes: row.nodes.map((node) => ({ ...node, approvers: [...node.approvers] })),
})));
const strategyTabs = ref<StrategyTab[]>(template.value.strategies.tabs.map((tab) => ({
  ...tab,
  rows: tab.rows.map((row) => ({ ...row, options: row.options ? [...row.options] : undefined })),
})));
const printRows = ref(template.value.print.rows.map((row) => ({ ...row })));
const extraRows = ref<Record<string, any[]>>(Object.fromEntries(Object.entries(template.value.extraLists || {}).map(([key, item]) => [key, item.rows.map((row) => ({ ...row }))])));
const extraRootRows = ref<Record<string, Array<{ key: string; name: string }>>>(Object.fromEntries(Object.entries(template.value.extraLists || {}).map(([key, item]) => [key, item.roots?.map((root) => ({ ...root })) || []])));
const extraKeyword = ref('');
const activeExtraRootKey = ref<string | number>('');
const showExtraModal = ref(false);
const extraModalMode = ref<'root' | 'child'>('child');
const editingExtraRowId = ref<string | number | null>(null);
const extraForm = ref({ name: '', code: '', parentKey: '', sort: '1', remark: '', enabled: true });

const editingField = ref<FieldSettingRow | null>(null);
const editingApproval = ref<OperationApprovalRuleRow | null>(null);
const showFieldModal = ref(false);
const activeNodeIndex = ref(0);
const pickingNodeIndex = ref<number | null>(null);
const pickingFieldPermissions = ref(false);
const fieldForm = ref({
  name: '',
  code: '',
  type: '文本',
  required: false,
  enabled: true,
  placeholder: '',
  defaultValue: '',
  permissions: [] as Array<PersonPickerPerson & { visible?: boolean }>,
});

const approvalColumns = [
  { key: 'index', label: '序号', width: '70px' },
  { key: 'name', label: '流程名称' },
  { key: 'category', label: '适用场景' },
  { key: 'nodeCount', label: '节点数', width: '90px' },
  { key: 'owner', label: '创建人', width: '100px' },
  { key: 'updatedAt', label: '更新时间', width: '120px' },
  { key: 'enabled', label: '是否启用', width: '110px' },
];
const printColumns = [
  { key: 'index', label: '序号', width: '70px' },
  { key: 'name', label: '模板名称' },
  { key: 'scene', label: '适用场景' },
  { key: 'paper', label: '纸张' },
  { key: 'status', label: '状态', width: '90px' },
  { key: 'updatedAt', label: '更新时间', width: '120px' },
];
const extraTableRows = computed(() => extraRows.value[settingType.value] || []);
const splitExtraList = computed(() => currentExtraList.value?.roots?.length ? currentExtraList.value : undefined);
const splitExtraRoots = computed(() => extraRootRows.value[settingType.value]?.length ? extraRootRows.value[settingType.value] : splitExtraList.value?.roots || []);
const activeExtraRoot = computed(() => splitExtraRoots.value.find((root) => root.key === activeExtraRootKey.value));
const extraRootItems = computed(() => {
  const list = splitExtraList.value;
  if (!list) return [];
  const rows = extraTableRows.value;
  return splitExtraRoots.value.map((root) => ({
    key: root.key,
    label: root.name,
    count: rows.filter((row) => row.parentKey === root.key || row.parentName === root.name || row.parent === root.name).length,
    icon: 'line-doc',
  }));
});
const filteredExtraRows = computed(() => {
  const list = splitExtraList.value;
  if (!list) return extraTableRows.value;
  const activeRoot = activeExtraRoot.value || splitExtraRoots.value[0];
  const keyword = extraKeyword.value.trim();
  return extraTableRows.value.filter((row) => {
    const rootMatched = !activeRoot || row.parentKey === activeRoot.key || row.parentName === activeRoot.name || row.parent === activeRoot.name;
    const keywordMatched = !keyword || Object.values(row).some((value) => String(value).includes(keyword));
    return rootMatched && keywordMatched;
  });
});

const peopleDepts = computed<PersonPickerDept[]>(() => {
  if (template.value.center === 'rd') {
    return [
      {
        key: 'rd',
        label: '研发中心',
        persons: [
          { id: 'RD001', name: '研发主管', role: '研发主管', phone: '13800003001' },
          { id: 'RD002', name: '工艺主管', role: '工艺主管', phone: '13800003002' },
          { id: 'RD003', name: '研发工程师', role: '研发工程师', phone: '13800003003' },
        ],
      },
      {
        key: 'production',
        label: '生产中心',
        persons: [{ id: 'SC001', name: '生产主管', role: '生产主管', phone: '13800003004' }],
      },
      {
        key: 'quality',
        label: '质检中心',
        persons: [{ id: 'QC001', name: '质量主管', role: '质量主管', phone: '13800003005' }],
      },
    ];
  }
  if (template.value.center === 'warehouse') {
    return [
      {
        key: 'warehouse',
        label: '仓储中心',
        persons: [
          { id: 'WH001', name: '仓库主管', role: '仓储主管', phone: '13800001001' },
          { id: 'WH002', name: '李库', role: '库管员', phone: '13800001002' },
          { id: 'WH003', name: '王仓', role: '库位负责人', phone: '13800001003' },
        ],
      },
      {
        key: 'quality',
        label: '质检中心',
        persons: [
          { id: 'QC001', name: '质量主管', role: '质检主管', phone: '13800001004' },
          { id: 'QC002', name: '陈质检', role: '质检员', phone: '13800001005' },
        ],
      },
      {
        key: 'finance',
        label: '财务中心',
        persons: [{ id: 'CW001', name: '财务复核', role: '成本会计', phone: '13800001006' }],
      },
    ];
  }
  return [
    {
      key: 'production',
      label: '生产中心',
      persons: [
        { id: 'SC001', name: '生产主管', role: '生产主管', phone: '13800002001' },
        { id: 'SC002', name: '计划员', role: '生产计划', phone: '13800002002' },
        { id: 'SC003', name: '工艺主管', role: '工艺主管', phone: '13800002003' },
      ],
    },
    {
      key: 'warehouse',
      label: '仓储中心',
      persons: [{ id: 'WH001', name: '仓库主管', role: '仓储主管', phone: '13800002004' }],
    },
    {
      key: 'quality',
      label: '质检中心',
      persons: [{ id: 'QC001', name: '质量主管', role: '质检主管', phone: '13800002005' }],
    },
  ];
});

const approvalTableRows = computed(() => approvalRows.value.map((row, index) => ({
  ...row,
  index: index + 1,
  nodeCount: `${row.nodes.length} 个节点`,
  enabled: row.enabled ? '启用' : '停用',
})));

onMounted(async () => {
  const settings = await getOperationSettings(props.module);
  fieldRows.value = settings.fields.map((row) => ({ ...row }));
  prefix.value = settings.numberRule.prefix;
  separator.value = settings.numberRule.separator;
  selectedNumbers.value = [...settings.numberRule.selected];
  approvalRows.value = settings.approvals.map((row) => ({
    ...row,
    nodes: row.nodes.map((node) => ({ ...node, approvers: [...node.approvers] })),
  }));
  strategyTabs.value = settings.strategies.map((tab) => ({ ...tab, rows: tab.rows.map((row) => ({ ...row, options: row.options ? [...row.options] : undefined })) }));
  printRows.value = settings.printTemplates.map((row) => ({ ...row }));
});

watch(
  () => `${props.module}:${settingType.value}:${currentExtraList.value?.defaultRootKey || ''}`,
  () => {
    const list = currentExtraList.value;
    if (!list?.roots?.length) return;
    const roots = splitExtraRoots.value;
    activeExtraRootKey.value = list.defaultRootKey || roots[0]?.key || '';
    extraKeyword.value = '';
  },
  { immediate: true },
);

function goBack() {
  router.push(template.value.backRoute);
}

async function persistSettings() {
  await saveOperationSettings(props.module, {
    center: template.value.center,
    resource: template.value.resource,
    fields: fieldRows.value.map((row) => ({ ...row })),
    numberRule: { prefix: prefix.value, separator: separator.value, selected: [...selectedNumbers.value] },
    approvals: approvalRows.value.map((row) => ({ ...row, nodes: row.nodes.map((node) => ({ ...node, approvers: [...node.approvers] })) })),
    strategies: strategyTabs.value.map((tab) => ({ ...tab, rows: tab.rows.map((row) => ({ ...row, options: row.options ? [...row.options] : undefined })) })),
    printTemplates: printRows.value.map((row) => ({ ...row, id: String(row.id) })),
  });
}

function handleAdd() {
  if (settingType.value === 'approvals') addApproval();
  if (settingType.value === 'fields') openField();
  if (settingType.value === 'print') addPrintTemplate();
  if (splitExtraList.value) openExtraChildModal();
  if (currentExtraList.value) addExtraRow();
}

function addExtraRow() {
  const list = currentExtraList.value;
  if (!list || splitExtraList.value) return;
  const key = settingType.value;
  const rows = extraRows.value[key] || [];
  extraRows.value[key] = [
    ...rows,
    {
      id: `${key}_${Date.now()}`,
      name: `${list.title}${rows.length + 1}`,
      parent: template.value.title,
      code: `custom_${rows.length + 1}`,
      count: 0,
      category: '通用',
      version: 'V1.0',
      enabled: '启用',
    },
  ];
}

function openExtraRootModal() {
  extraModalMode.value = 'root';
  editingExtraRowId.value = null;
  extraForm.value = { name: '', code: '', parentKey: '', sort: '1', remark: '', enabled: true };
  showExtraModal.value = true;
}

function openExtraChildModal(row?: any) {
  const root = row ? splitExtraRoots.value.find((item) => item.key === row.parentKey || item.name === row.parentName || item.name === row.parent) : (activeExtraRoot.value || splitExtraRoots.value[0]);
  const siblingCount = root ? extraTableRows.value.filter((item) => item.parentKey === root.key || item.parentName === root.name || item.parent === root.name).length : extraTableRows.value.length;
  extraModalMode.value = 'child';
  editingExtraRowId.value = row?.id || null;
  extraForm.value = {
    name: String(row?.name || ''),
    code: String(row?.code || ''),
    parentKey: String(root?.key || ''),
    sort: String(row?.sort || siblingCount + 1),
    remark: String(row?.remark || ''),
    enabled: row ? row.enabled === true || row.enabled === '启用' : true,
  };
  showExtraModal.value = true;
}

function closeExtraModal() {
  showExtraModal.value = false;
  editingExtraRowId.value = null;
  extraForm.value = { name: '', code: '', parentKey: '', sort: '1', remark: '', enabled: true };
}

function saveExtraModal() {
  const list = splitExtraList.value;
  if (!list) return;
  const key = settingType.value;
  const name = extraForm.value.name.trim();
  if (!name) return;
  if (extraModalMode.value === 'root') {
    const rootKey = extraForm.value.code.trim() || `${key}_root_${Date.now()}`;
    const nextRoot = { key: rootKey, name };
    extraRootRows.value[key] = [...splitExtraRoots.value, nextRoot];
    activeExtraRootKey.value = nextRoot.key;
    closeExtraModal();
    return;
  }
  const roots = splitExtraRoots.value;
  const parent = roots.find((root) => root.key === extraForm.value.parentKey) || activeExtraRoot.value || roots[0];
  const rows = extraRows.value[key] || [];
  const nextRow = {
      id: editingExtraRowId.value || `${key}_${Date.now()}`,
      name,
      parent: parent?.name || template.value.title,
      parentKey: parent?.key,
      parentName: parent?.name || template.value.title,
      code: extraForm.value.code.trim() || `custom_${rows.length + 1}`,
      count: 0,
      category: '通用',
      sort: Number(extraForm.value.sort) || 0,
      version: 'V1.0',
      remark: extraForm.value.remark.trim(),
      enabled: extraForm.value.enabled,
    };
  extraRows.value[key] = editingExtraRowId.value ? rows.map((row) => row.id === editingExtraRowId.value ? nextRow : row) : [...rows, nextRow];
  activeExtraRootKey.value = parent?.key || activeExtraRootKey.value;
  closeExtraModal();
}

function deleteExtraRow(row: any) {
  extraRows.value[settingType.value] = (extraRows.value[settingType.value] || []).filter((item) => item.id !== row.id);
}

function selectExtraRoot(key: string | number) {
  activeExtraRootKey.value = key;
  extraKeyword.value = '';
}

function toggleExtraEnabled(row: any, enabled: boolean) {
  const listRows = extraRows.value[settingType.value] || [];
  const target = listRows.find((item) => item.id === row.id);
  if (target) target.enabled = enabled;
}

function toggleField(row: FieldSettingRow, key: 'enabled' | 'required', value: boolean) {
  const target = fieldRows.value.find((item) => item.id === row.id);
  if (target) {
    target[key] = value;
    void persistSettings();
  }
}

function deleteField(row: FieldSettingRow) {
  fieldRows.value = fieldRows.value.filter((item) => item.id !== row.id);
  void persistSettings();
}

function openField(row?: FieldSettingRow) {
  editingField.value = row ? { ...row } : null;
  fieldForm.value = {
    name: row?.name || '',
    code: row?.code || '',
    type: row?.type || '文本',
    required: row?.required === true || row?.required === '是',
    enabled: row?.enabled !== false,
    placeholder: String(row?.placeholder || ''),
    defaultValue: String(row?.defaultValue || ''),
    permissions: Array.isArray(row?.permissions) ? row.permissions.map((person: any) => ({ ...person })) : [],
  };
  showFieldModal.value = true;
}

function closeFieldModal() {
  editingField.value = null;
  showFieldModal.value = false;
  pickingFieldPermissions.value = false;
  fieldForm.value = { name: '', code: '', type: '文本', required: false, enabled: true, placeholder: '', defaultValue: '', permissions: [] };
}

function saveField() {
  const name = fieldForm.value.name.trim();
  if (!name) return;
  const next: FieldSettingRow = {
    id: editingField.value?.id || `${props.module}_field_new_${Date.now()}`,
    name,
    code: fieldForm.value.code.trim() || 'custom_field',
    type: fieldForm.value.type,
    scope: editingField.value?.scope || activeScope.value,
    required: fieldForm.value.required,
    enabled: fieldForm.value.enabled,
    placeholder: fieldForm.value.placeholder.trim(),
    defaultValue: fieldForm.value.defaultValue.trim(),
    permissions: fieldForm.value.permissions.map((person) => ({ ...person })),
  };
  const index = fieldRows.value.findIndex((row) => row.id === next.id);
  if (index >= 0) fieldRows.value.splice(index, 1, next);
  else fieldRows.value.push(next);
  closeFieldModal();
  void persistSettings();
}

function addApproval() {
  editingApproval.value = {
    id: `${props.module}_approval_new_${Date.now()}`,
    name: `${settingTitle.value}流程`,
    category: '新增业务',
    nodes: [
      { name: '', approvers: [], method: '依次审批' },
      { name: '', approvers: [], method: '依次审批' },
      { name: '', approvers: [], method: '依次审批' },
    ],
    owner: '老大',
    updatedAt: '2026-05-27',
    enabled: true,
  };
  activeNodeIndex.value = 1;
}

function editApproval(row: OperationApprovalRuleRow) {
  const source = approvalRows.value.find((item) => item.id === row.id);
  if (!source) return;
  editingApproval.value = { ...source, nodes: source.nodes.map((node) => ({ ...node, approvers: [...node.approvers] })) };
  activeNodeIndex.value = Math.min(1, editingApproval.value.nodes.length - 1);
}

function saveApproval() {
  if (!editingApproval.value) return;
  const index = approvalRows.value.findIndex((row) => row.id === editingApproval.value?.id);
  if (index >= 0) approvalRows.value.splice(index, 1, editingApproval.value);
  else approvalRows.value.push(editingApproval.value);
  editingApproval.value = null;
  void persistSettings();
}

function updateNode(index: number, node: ApprovalNode) {
  if (editingApproval.value) editingApproval.value.nodes.splice(index, 1, node);
}

function addApprovalNode() {
  if (!editingApproval.value) return;
  editingApproval.value.nodes.push({ name: '', approvers: [], method: '依次审批' });
  activeNodeIndex.value = editingApproval.value.nodes.length - 1;
}

function removeApprovalNode(index: number) {
  if (!editingApproval.value || editingApproval.value.nodes.length <= 1) return;
  editingApproval.value.nodes.splice(index, 1);
  activeNodeIndex.value = Math.max(0, Math.min(activeNodeIndex.value, editingApproval.value.nodes.length - 1));
}

function removeApprovalPerson(index: number, name: string) {
  if (editingApproval.value) editingApproval.value.nodes[index].approvers = editingApproval.value.nodes[index].approvers.filter((personName) => personName !== name);
}

function deleteApproval(row: OperationApprovalRuleRow) {
  approvalRows.value = approvalRows.value.filter((item) => item.id !== row.id);
  void persistSettings();
}

function toggleApproval(row: OperationApprovalRuleRow, enabled: boolean) {
  const target = approvalRows.value.find((item) => item.id === row.id);
  if (target) {
    target.enabled = enabled;
    void persistSettings();
  }
}

function confirmPersons(persons: PersonPickerPerson[]) {
  if (pickingFieldPermissions.value) {
    const next = [...fieldForm.value.permissions];
    persons.forEach((person) => {
      if (!next.some((item) => item.id === person.id)) {
        const dept = peopleDepts.value.find((item) => item.persons.some((deptPerson) => deptPerson.id === person.id))?.label || person.dept || '';
        next.push({ ...person, dept, visible: true });
      }
    });
    fieldForm.value.permissions = next;
    pickingFieldPermissions.value = false;
    return;
  }

  if (editingApproval.value && pickingNodeIndex.value !== null) {
    const pickedNames = persons.map((person) => person.name);
    const node = editingApproval.value.nodes[pickingNodeIndex.value];
    node.approvers = Array.from(new Set([...node.approvers, ...pickedNames]));
  }
  pickingNodeIndex.value = null;
}

function updateStrategyRule(tabKey: string, rule: StrategyRule) {
  const tab = strategyTabs.value.find((item) => item.key === tabKey);
  const rowIndex = tab?.rows.findIndex((row) => row.key === rule.key) ?? -1;
  if (tab && rowIndex >= 0) tab.rows.splice(rowIndex, 1, rule);
}

function addPrintTemplate() {
  printRows.value.push({
    id: `${props.module}_print_new_${Date.now()}`,
    name: `${template.value.title}打印模板`,
    scene: '新增/详情打印',
    paper: 'A4 纵向',
    status: '启用',
    updatedAt: '2026-05-27',
  });
  void persistSettings();
}

function deletePrintTemplate(id: string | number) {
  printRows.value = printRows.value.filter((row) => row.id !== id);
  void persistSettings();
}

function resetNumberRule() {
  prefix.value = template.value.numbers.prefix;
  separator.value = template.value.numbers.separator;
  selectedNumbers.value = [...template.value.numbers.selected];
}
</script>

<template>
  <aw-setting-page>
    <template #toolbar>
      <aw-setting-toolbar
        :add-text="addText"
        :back-text="template.backText"
        :editor-mode="Boolean(editingApproval)"
        :show-add="showAdd"
        @add="handleAdd"
        @back="goBack"
        @cancel="editingApproval = null"
        @save="saveApproval"
      />
    </template>

    <aw-setting-split-page v-if="splitExtraList">
      <template #tree>
        <aw-setting-tree
          :active-key="activeExtraRootKey"
          :add-title="splitExtraList.rootAddText || splitExtraList.addText"
          :items="extraRootItems"
          show-add
          :title="splitExtraList.rootTitle || splitExtraList.title"
          @add="openExtraRootModal"
          @select="selectExtraRoot"
        />
      </template>
      <aw-setting-list-card
        v-model:keyword="extraKeyword"
        :description="splitExtraList.description"
        :search-placeholder="splitExtraList.searchPlaceholder"
        :title="activeExtraRoot?.name || splitExtraList.title"
      >
        <aw-setting-table :columns="splitExtraList.columns" :rows="filteredExtraRows" @delete="deleteExtraRow" @edit="openExtraChildModal">
          <template #cell="{ column, row, index }">
            <span v-if="column.key === 'index'">{{ index + 1 }}</span>
            <label v-else-if="column.key === 'enabled'" class="aw-switch-line mini">
              <input
                :checked="row.enabled === true || row.enabled === '启用'"
                type="checkbox"
                @change="toggleExtraEnabled(row, ($event.target as HTMLInputElement).checked)"
              />
              <i></i>
            </label>
            <span v-else>{{ row[column.key] }}</span>
          </template>
        </aw-setting-table>
      </aw-setting-list-card>
    </aw-setting-split-page>

    <aw-setting-list-card
      v-else-if="currentExtraList && !splitExtraList"
      :description="currentExtraList.description"
      :search-placeholder="currentExtraList.searchPlaceholder"
      :title="currentExtraList.title"
    >
      <aw-setting-table :columns="currentExtraList.columns" :rows="extraTableRows" @delete="deleteExtraRow" />
    </aw-setting-list-card>

    <aw-field-setting-page
      v-else-if="settingType === 'fields'"
      :active-scope="activeScope"
      :rows="fieldRows"
      :scopes="template.fields.scopes"
      @delete="deleteField"
      @edit="openField"
      @select-scope="activeScope = $event"
      @toggle-enabled="(row, enabled) => toggleField(row, 'enabled', enabled)"
      @toggle-required="(row, required) => toggleField(row, 'required', required)"
    />

    <aw-code-rule-builder
      v-else-if="settingType === 'numbers'"
      v-model:prefix="prefix"
      v-model:separator="separator"
      v-model:selected="selectedNumbers"
      :candidates="template.numbers.candidates"
      @reset="resetNumberRule"
      @save="persistSettings"
    />

    <aw-approval-rule-editor
      v-else-if="settingType === 'approvals' && editingApproval"
      v-model:name="editingApproval.name"
      :active-index="activeNodeIndex"
      :methods="template.approvals.methods"
      :nodes="editingApproval.nodes"
      @add-node="addApprovalNode"
      @pick-person="pickingNodeIndex = $event"
      @remove-node="removeApprovalNode"
      @remove-person="removeApprovalPerson"
      @select-node="activeNodeIndex = $event"
      @update-node="updateNode"
    />

    <aw-setting-list-card
      v-else-if="settingType === 'approvals'"
      description="维护当前模块审批规则，策略设置中的审批流程可引用此处规则。"
      :title="settingTitle"
      search-placeholder="搜索流程名称/适用场景"
    >
      <aw-setting-table :columns="approvalColumns" :rows="approvalTableRows" @delete="deleteApproval($event as OperationApprovalRuleRow)" @edit="editApproval($event as OperationApprovalRuleRow)">
        <template #cell="{ column, row }">
          <label v-if="column.key === 'enabled'" class="aw-switch-line mini">
            <input :checked="row.enabled === '启用'" type="checkbox" @change="toggleApproval(row as OperationApprovalRuleRow, ($event.target as HTMLInputElement).checked)" />
            <i></i>
          </label>
          <span v-else>{{ row[column.key] }}</span>
        </template>
      </aw-setting-table>
    </aw-setting-list-card>

    <aw-strategy-setting-page
      v-else-if="settingType === 'strategies'"
      :description="template.strategies.description"
      :tabs="strategyTabs"
      :title="template.strategies.title"
      @save="persistSettings"
      @update-rule="updateStrategyRule"
    />

    <aw-setting-list-card
      v-else
      description="维护当前模块可用的打印模板入口。"
      :title="settingTitle"
      search-placeholder="搜索模板名称/适用场景"
    >
      <aw-setting-table :columns="printColumns" :rows="printRows" @delete="deletePrintTemplate($event.id)">
        <template #cell="{ column, row, index }">
          <span v-if="column.key === 'index'">{{ index + 1 }}</span>
          <span v-else-if="column.key === 'status'" class="aw-status green">{{ row[column.key] }}</span>
          <span v-else>{{ row[column.key] }}</span>
        </template>
      </aw-setting-table>
    </aw-setting-list-card>

    <div v-if="showExtraModal" class="aw-modal-mask">
      <div class="aw-modal aw-category-modal">
        <div class="aw-modal-head">
          <strong>{{ extraModalMode === 'root' ? (splitExtraList?.rootAddText || '新增分类') : (editingExtraRowId ? '编辑下级分类' : '新增下级分类') }}</strong>
          <button type="button" class="aw-modal-close" @click="closeExtraModal">×</button>
        </div>
        <div class="aw-modal-body">
          <label class="aw-field">
            <span>分类名称</span>
            <input v-model="extraForm.name" placeholder="请输入分类名称" />
          </label>
          <label class="aw-field">
            <span>分类编号</span>
            <input v-model="extraForm.code" placeholder="请输入分类编号" />
          </label>
          <label class="aw-field aw-field-full">
            <span>分类备注</span>
            <textarea v-model="extraForm.remark" placeholder="请输入分类备注"></textarea>
          </label>
        </div>
        <div class="aw-modal-foot">
          <button class="aw-tool-btn" type="button" @click="closeExtraModal">取消</button>
          <button class="aw-btn primary" type="button" @click="saveExtraModal">确定</button>
        </div>
      </div>
    </div>

    <aw-person-picker-modal
      :depts="peopleDepts"
      :open="pickingNodeIndex !== null"
      title="选择负责人"
      @cancel="pickingNodeIndex = null"
      @confirm="confirmPersons"
    />

    <div v-if="settingType === 'fields' && showFieldModal" class="aw-modal-mask">
      <div class="aw-modal aw-field-modal">
        <div class="aw-modal-head">
          <strong>新增字段</strong>
          <button type="button" class="aw-modal-close" @click="closeFieldModal">×</button>
        </div>
        <div class="aw-modal-body aw-field-config-body">
          <label class="aw-field">
            <span><b>*</b>字段名称</span>
            <input v-model="fieldForm.name" placeholder="请输入字段名称" />
          </label>
          <label class="aw-field">
            <span><b>*</b>字段编码</span>
            <input v-model="fieldForm.code" placeholder="请输入字段编码" />
          </label>
          <label class="aw-field">
            <span>字段类型</span>
            <select v-model="fieldForm.type">
              <option>文本</option>
              <option>数字</option>
              <option>金额</option>
              <option>日期</option>
              <option>日期范围</option>
              <option>下拉选项</option>
              <option>对象选择</option>
              <option>人员选择</option>
              <option>供应商选择</option>
              <option>关联单据</option>
              <option>状态</option>
              <option>子表</option>
              <option>附件</option>
            </select>
          </label>
          <label class="aw-field aw-field-full">
            <span>是否必填</span>
            <label class="aw-switch-line">
              <input v-model="fieldForm.required" type="checkbox" />
              <i></i>
              <em>是否必填</em>
            </label>
          </label>
          <label class="aw-field">
            <span>默认值</span>
            <input v-model="fieldForm.defaultValue" placeholder="请输入默认值" />
          </label>
          <label class="aw-field">
            <span>提示文字</span>
            <input v-model="fieldForm.placeholder" placeholder="请输入提示文字" />
          </label>
          <div class="aw-field aw-field-full">
            <div class="aw-form-sub-title">权限设置</div>
            <div class="aw-permission-count">已设置权限人员（{{ fieldForm.permissions.length }}）</div>
            <div class="aw-permission-box aw-permission-table-box">
              <div v-if="fieldForm.permissions.length === 0" class="aw-permission-empty">暂未添加权限人员，点击下方按钮添加</div>
              <table v-else class="aw-permission-table">
                <thead>
                  <tr>
                    <th>姓名</th>
                    <th>部门</th>
                    <th>职位</th>
                    <th style="width:110px">是否可见</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="person in fieldForm.permissions" :key="person.id">
                    <td>{{ person.name }}</td>
                    <td>{{ person.dept }}</td>
                    <td>{{ person.role }}</td>
                    <td><label class="aw-switch-line mini"><input v-model="person.visible" type="checkbox" /><i></i></label></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button class="aw-btn primary aw-permission-add" type="button" @click="pickingFieldPermissions = true">添加负责人</button>
          </div>
        </div>
        <div class="aw-modal-foot">
          <button class="aw-tool-btn" type="button" @click="closeFieldModal">取消</button>
          <button class="aw-btn primary" type="button" @click="saveField">确定</button>
        </div>
      </div>
    </div>

    <aw-person-picker-modal
      :depts="peopleDepts"
      :open="pickingFieldPermissions"
      title="选择负责人"
      @cancel="pickingFieldPermissions = false"
      @confirm="confirmPersons"
    />
  </aw-setting-page>
</template>
