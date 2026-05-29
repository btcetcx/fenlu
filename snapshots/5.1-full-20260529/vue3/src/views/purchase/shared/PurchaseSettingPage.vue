<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getPurchaseSettings, purchaseSettingResourceMap, savePurchaseSettings } from '@/app/api/purchase/settings';
import { purchaseSettingTemplates, type ApprovalRuleRow, type PurchaseSettingModule, type PurchaseSettingType } from '@/app/templates/purchase-settings-template';
import AwApprovalRuleEditor from '@/components/setting-page/AwApprovalRuleEditor.vue';
import AwCodeRuleBuilder from '@/components/setting-page/AwCodeRuleBuilder.vue';
import AwFieldSettingPage from '@/components/setting-page/AwFieldSettingPage.vue';
import AwPersonPickerModal from '@/components/setting-page/AwPersonPickerModal.vue';
import AwSettingListCard from '@/components/setting-page/AwSettingListCard.vue';
import AwSettingPage from '@/components/setting-page/AwSettingPage.vue';
import AwSettingSplitPage from '@/components/setting-page/AwSettingSplitPage.vue';
import AwSettingTable from '@/components/setting-page/AwSettingTable.vue';
import AwSettingTree from '@/components/setting-page/AwSettingTree.vue';
import AwSettingToolbar from '@/components/setting-page/AwSettingToolbar.vue';
import AwStrategySettingPage from '@/components/setting-page/AwStrategySettingPage.vue';
import type { ApprovalNode, FieldSettingRow, PersonPickerPerson, SettingTableRow, StrategyRule } from '@/components/setting-page/types';

const props = defineProps<{ module: PurchaseSettingModule }>();
const emit = defineEmits<{ back: [] }>();

const route = useRoute();
const router = useRouter();
const template = computed(() => purchaseSettingTemplates[props.module]);
const settingType = computed<PurchaseSettingType>(() => {
  const value = String(route.query.setting || (props.module === 'suppliers' ? 'groups' : 'fields'));
  return ['groups', 'levels', 'fields', 'numbers', 'approvals', 'strategies', 'print'].includes(value) ? value as PurchaseSettingType : 'fields';
});
const settingTitle = computed(() => template.value.typeTitles[settingType.value]);
const currentExtraList = computed(() => ['groups', 'levels'].includes(settingType.value) ? template.value.extraLists?.[settingType.value as 'groups' | 'levels'] : undefined);
const showAdd = computed(() => ['groups', 'levels', 'fields', 'approvals', 'print'].includes(settingType.value) && (settingType.value === 'fields' || settingType.value === 'approvals' || settingType.value === 'print' || Boolean(currentExtraList.value)));
const addText = computed(() => {
  if (settingType.value === 'fields') return template.value.fields.addText;
  if (settingType.value === 'approvals') return template.value.approvals.addText;
  if (settingType.value === 'print') return template.value.print.addText;
  return currentExtraList.value?.addText || '';
});

const fieldRows = ref<FieldSettingRow[]>(template.value.fields.rows.map((row) => ({ ...row })));
const activeScope = ref(template.value.fields.scopes[0]?.key || '');
const prefix = ref(template.value.numbers.prefix);
const separator = ref(template.value.numbers.separator);
const selectedNumbers = ref<string[]>([...template.value.numbers.selected]);
const approvalRows = ref<ApprovalRuleRow[]>(template.value.approvals.rows.map((row) => ({
  ...row,
  nodes: row.nodes.map((node) => ({ ...node, approvers: [...node.approvers] })),
})));
const extraRows = ref<Record<string, SettingTableRow[]>>(Object.fromEntries(Object.entries(template.value.extraLists || {}).map(([key, item]) => [key, item.rows.map((row) => ({ ...row }))])));
const supplierGroupRows = ref<SettingTableRow[]>([
  { id: 'supplier_root_raw', name: '原材料供应商', parent: '无', code: 'raw', count: 42, enabled: true, remark: '原材料、基础材料和耗材类供应商。' },
  { id: 'supplier_root_part', name: '零部件供应商', parent: '无', code: 'part', count: 36, enabled: true, remark: '机械、电气和标准件等零部件供应商。' },
  { id: 'supplier_root_pkg', name: '包装供应商', parent: '无', code: 'pkg', count: 24, enabled: true, remark: '纸箱、塑料和标签包装类供应商。' },
  { id: 'supplier_root_svc', name: '服务供应商', parent: '无', code: 'svc', count: 18, enabled: true, remark: '物流、检测、维保等服务供应商。' },
  { id: 'supplier_root_temp', name: '临时供应商', parent: '无', code: 'temp', count: 6, enabled: true, remark: '询价新增、待转正和一次性供应商。' },
  { id: 'supplier_child_metal', name: '金属材料', parent: '原材料供应商', code: 'raw_metal', count: 18, enabled: true },
  { id: 'supplier_child_elec', name: '电子元器件', parent: '原材料供应商', code: 'raw_elec', count: 14, enabled: true },
  { id: 'supplier_child_chem', name: '化工材料', parent: '原材料供应商', code: 'raw_chem', count: 10, enabled: true },
  { id: 'supplier_child_mech', name: '机械零件', parent: '零部件供应商', code: 'part_mech', count: 22, enabled: true },
  { id: 'supplier_child_electric', name: '电气零件', parent: '零部件供应商', code: 'part_electric', count: 14, enabled: true },
  { id: 'supplier_child_carton', name: '纸箱类', parent: '包装供应商', code: 'pkg_carton', count: 13, enabled: true },
  { id: 'supplier_child_plastic', name: '塑料类', parent: '包装供应商', code: 'pkg_plastic', count: 11, enabled: true },
  { id: 'supplier_child_logistics', name: '物流服务', parent: '服务供应商', code: 'svc_logistics', count: 9, enabled: true },
  { id: 'supplier_child_test', name: '检测服务', parent: '服务供应商', code: 'svc_test', count: 9, enabled: true },
  { id: 'supplier_child_quote', name: '询价新增', parent: '临时供应商', code: 'temp_quote', count: 4, enabled: true },
  { id: 'supplier_child_convert', name: '待转正', parent: '临时供应商', code: 'temp_convert', count: 2, enabled: true },
]);
const editingField = ref<FieldSettingRow | null>(null);
const editingApproval = ref<ApprovalRuleRow | null>(null);
const showFieldModal = ref(false);
const activeNodeIndex = ref(0);
const pickingNodeIndex = ref<number | null>(null);
const pickingFieldPermissions = ref(false);
const strategyTabs = ref<import('@/components/setting-page/types').StrategyTab[]>(template.value.strategies.tabs.map((tab) => ({ ...tab, rows: tab.rows.map((row) => ({ ...row, options: row.options ? [...row.options] : undefined })) })));
const printRows = ref(template.value.print.rows.map((row) => ({ ...row })));
const activeSupplierRootId = ref<string | number>('supplier_root_raw');
const supplierGroupKeyword = ref('');
const showSupplierRootModal = ref(false);
const supplierRootForm = ref({ name: '', code: '', remark: '' });
const showSupplierChildModal = ref(false);
const supplierChildForm = ref({ name: '', code: '', remark: '' });
const showSupplierLevelModal = ref(false);
const supplierLevelForm = ref({ name: '', remark: '', enabled: true });
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

const extraTableRows = computed(() => extraRows.value[settingType.value] || []);
const supplierRootGroups = computed(() => supplierGroupRows.value.filter((row) => row.parent === '无'));
const activeSupplierRoot = computed(() => supplierRootGroups.value.find((row) => row.id === activeSupplierRootId.value) || supplierRootGroups.value[0]);
const supplierGroupTreeItems = computed(() => supplierRootGroups.value.map((group) => ({
  key: group.id,
  label: String(group.name),
  count: supplierGroupCount(String(group.name)),
  icon: 'line-users',
})));
const supplierGroupChildren = computed(() => supplierGroupRows.value.filter((row) => row.parent === activeSupplierRoot.value?.name));
const filteredSupplierGroupChildren = computed(() => {
  const keyword = supplierGroupKeyword.value.trim();
  if (!keyword) return supplierGroupChildren.value;
  return supplierGroupChildren.value.filter((row) => Object.values(row).some((value) => String(value).includes(keyword)));
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

const peopleDepts = [
  {
    key: 'purchase',
    label: '采购中心',
    persons: [
      { id: 'CG001', name: '老大', role: '采购总监', phone: '13800000001' },
      { id: 'CG002', name: '李文涛', role: '采购员', phone: '13800000002' },
      { id: 'CG003', name: '陈思源', role: '采购员', phone: '13800000003' },
    ],
  },
  {
    key: 'finance',
    label: '财务中心',
    persons: [
      { id: 'CW001', name: '张国', role: '应付会计', phone: '13800000004' },
      { id: 'CW002', name: '赵强', role: '财务复核', phone: '13800000005' },
    ],
  },
];

const approvalTableRows = computed(() => approvalRows.value.map((row, index) => ({
  ...row,
  index: index + 1,
  nodeCount: `${row.nodes.length} 个节点`,
  enabled: row.enabled ? '启用' : '停用',
})));

function goBack() {
  emit('back');
  router.push(template.value.backRoute);
}

onMounted(async () => {
  const settings = await getPurchaseSettings(props.module);
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

async function persistSettings() {
  await savePurchaseSettings(props.module, {
    resource: purchaseSettingResourceMap[props.module],
    fields: fieldRows.value.map((row) => ({ ...row })),
    numberRule: { prefix: prefix.value, separator: separator.value, selected: [...selectedNumbers.value] },
    approvals: approvalRows.value.map((row) => ({ ...row, nodes: row.nodes.map((node) => ({ ...node, approvers: [...node.approvers] })) })),
    strategies: strategyTabs.value.map((tab) => ({ ...tab, rows: tab.rows.map((row) => ({ ...row, options: row.options ? [...row.options] : undefined })) })),
    printTemplates: printRows.value.map((row) => ({ ...row, id: String(row.id) })),
  });
}

function handleAdd() {
  if (props.module === 'suppliers' && settingType.value === 'groups') {
    showSupplierChildModal.value = true;
    return;
  }
  if (props.module === 'suppliers' && settingType.value === 'levels') {
    showSupplierLevelModal.value = true;
    return;
  }
  if (settingType.value === 'approvals') return addApproval();
  if (settingType.value === 'fields') return openField();
  if (settingType.value === 'print') return addPrintTemplate();
  if (currentExtraList.value) return addExtraRow();
}

function closeSupplierLevelModal() {
  supplierLevelForm.value = { name: '', remark: '', enabled: true };
  showSupplierLevelModal.value = false;
}

function addSupplierLevelFromModal() {
  const name = supplierLevelForm.value.name.trim();
  if (!name) return;
  const rows = extraRows.value.levels || [];
  extraRows.value.levels = [
    ...rows,
    {
      id: `supplier_level_custom_${Date.now()}`,
      name,
      priority: rows.length + 1,
      description: supplierLevelForm.value.remark.trim(),
      enabled: supplierLevelForm.value.enabled ? '启用' : '停用',
    },
  ];
  closeSupplierLevelModal();
}

function supplierGroupCount(name: string) {
  return supplierGroupRows.value
    .filter((row) => row.parent === name)
    .reduce((sum, row) => sum + Number(row.count || 0), 0);
}

function selectSupplierRoot(key: string | number) {
  activeSupplierRootId.value = key;
  supplierGroupKeyword.value = '';
}

function addSupplierRootGroup() {
  const name = supplierRootForm.value.name.trim();
  if (!name) return;
  const id = `supplier_root_custom_${Date.now()}`;
  supplierGroupRows.value.push({
    id,
    name,
    parent: '无',
    code: supplierRootForm.value.code.trim() || 'SUPPLIER_GROUP_ROOT',
    count: 0,
    enabled: true,
    remark: supplierRootForm.value.remark.trim() || '暂无分类备注',
  });
  activeSupplierRootId.value = id;
  supplierRootForm.value = { name: '', code: '', remark: '' };
  showSupplierRootModal.value = false;
}

function closeSupplierChildModal() {
  supplierChildForm.value = { name: '', code: '', remark: '' };
  showSupplierChildModal.value = false;
}

function addSupplierChildGroup() {
  const name = supplierChildForm.value.name.trim();
  if (!name) return;
  const parent = activeSupplierRoot.value || supplierRootGroups.value[0];
  supplierGroupRows.value.push({
    id: `supplier_child_custom_${Date.now()}`,
    name,
    parent: String(parent?.name || '无'),
    code: supplierChildForm.value.code.trim() || 'SUPPLIER_GROUP_CHILD',
    count: 0,
    enabled: true,
    remark: supplierChildForm.value.remark.trim(),
  });
  closeSupplierChildModal();
}

function removeSupplierGroup(id: string | number) {
  supplierGroupRows.value = supplierGroupRows.value.filter((row) => row.id !== id);
}

function addExtraRow() {
  const key = settingType.value;
  const list = currentExtraList.value;
  if (!list) return;
  const rows = extraRows.value[key] || [];
  extraRows.value[key] = [
    ...rows,
    {
      id: `${key}_${Date.now()}`,
      name: `${list.title}${rows.length + 1}`,
      parent: '供应商库',
      code: `custom_${rows.length + 1}`,
      count: 0,
      enabled: '启用',
      priority: rows.length + 1,
      description: '自定义设置项',
    },
  ];
}

function deleteExtraRow(row: SettingTableRow) {
  extraRows.value[settingType.value] = (extraRows.value[settingType.value] || []).filter((item) => item.id !== row.id);
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

function closeFieldModal() {
  editingField.value = null;
  showFieldModal.value = false;
  pickingFieldPermissions.value = false;
  fieldForm.value = { name: '', code: '', type: '文本', required: false, enabled: true, placeholder: '', defaultValue: '', permissions: [] };
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

function editApproval(row: ApprovalRuleRow) {
  const source = approvalRows.value.find((item) => item.id === row.id);
  if (!source) return;
  editingApproval.value = {
    ...source,
    nodes: source.nodes.map((node) => ({ ...node, approvers: [...node.approvers] })),
  };
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
  if (editingApproval.value) {
    editingApproval.value.nodes[index].approvers = editingApproval.value.nodes[index].approvers.filter((personName) => personName !== name);
  }
}

function deleteApproval(row: ApprovalRuleRow) {
  approvalRows.value = approvalRows.value.filter((item) => item.id !== row.id);
  void persistSettings();
}

function toggleApproval(row: ApprovalRuleRow, enabled: boolean) {
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
        const dept = peopleDepts.find((item) => item.persons.some((deptPerson) => deptPerson.id === person.id))?.label || person.dept || '';
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
        :show-add="showAdd && !editingApproval"
        @add="handleAdd"
        @back="goBack"
        @cancel="editingApproval = null"
        @save="saveApproval"
      />
    </template>

    <aw-setting-split-page v-if="props.module === 'suppliers' && settingType === 'groups'">
      <template #tree>
        <aw-setting-tree
          add-title="新增供应商分类"
          :active-key="activeSupplierRootId"
          :items="supplierGroupTreeItems"
          show-add
          title="供应商分类"
          @add="showSupplierRootModal = true"
          @select="selectSupplierRoot"
        />
      </template>
      <aw-setting-list-card
        v-model:keyword="supplierGroupKeyword"
        :description="String(activeSupplierRoot?.remark || '暂无分类备注')"
        search-placeholder="搜索下级分类名称/编号"
        :title="String(activeSupplierRoot?.name || '供应商分组设置')"
      >
        <div class="aw-doc-tbl-wrap">
          <div class="aw-doc-tbl-inner">
            <table class="aw-doc-tbl">
              <thead>
                <tr>
                  <th style="width:70px">序号</th>
                  <th>分组名称</th>
                  <th>上级分组</th>
                  <th>分组编号</th>
                  <th style="width:110px">供应商数量</th>
                  <th style="width:90px">状态</th>
                  <th style="width:150px">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, index) in filteredSupplierGroupChildren" :key="row.id">
                  <td>{{ index + 1 }}</td>
                  <td>{{ row.name }}</td>
                  <td>{{ row.parent }}</td>
                  <td>{{ row.code }}</td>
                  <td>{{ row.count }}</td>
                  <td><label class="aw-switch-line mini"><input v-model="row.enabled" type="checkbox" /><i></i></label></td>
                  <td>
                    <span class="aw-link">编辑</span><span class="aw-action-split">|</span>
                    <span class="aw-link" style="color:var(--aw-danger)" @click="removeSupplierGroup(row.id)">删除</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </aw-setting-list-card>
    </aw-setting-split-page>

    <aw-setting-list-card
      v-else-if="currentExtraList"
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
      <aw-setting-table :columns="approvalColumns" :rows="approvalTableRows" @delete="deleteApproval($event as ApprovalRuleRow)" @edit="editApproval($event as ApprovalRuleRow)">
        <template #cell="{ column, row }">
          <label v-if="column.key === 'enabled'" class="aw-switch-line mini">
            <input :checked="row.enabled === '启用'" type="checkbox" @change="toggleApproval(row as ApprovalRuleRow, ($event.target as HTMLInputElement).checked)" />
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

    <aw-person-picker-modal
      :depts="peopleDepts"
      :open="pickingNodeIndex !== null"
      title="选择负责人"
      @cancel="pickingNodeIndex = null"
      @confirm="confirmPersons"
    />

    <div v-if="props.module === 'suppliers' && settingType === 'groups' && showSupplierRootModal" class="aw-modal-mask">
      <div class="aw-modal aw-category-modal">
        <div class="aw-modal-head">
          <strong>新增供应商分类</strong>
          <button type="button" class="aw-modal-close" @click="showSupplierRootModal = false">×</button>
        </div>
        <div class="aw-modal-body">
          <label class="aw-field">
            <span>分类名称</span>
            <input v-model="supplierRootForm.name" placeholder="请输入分类名称" />
          </label>
          <label class="aw-field">
            <span>分类编号</span>
            <input v-model="supplierRootForm.code" placeholder="请输入分类编号" />
          </label>
          <label class="aw-field aw-field-full">
            <span>分类备注</span>
            <textarea v-model="supplierRootForm.remark" placeholder="请输入分类备注"></textarea>
          </label>
        </div>
        <div class="aw-modal-foot">
          <button class="aw-tool-btn" type="button" @click="showSupplierRootModal = false">取消</button>
          <button class="aw-btn primary" type="button" @click="addSupplierRootGroup">确定</button>
        </div>
      </div>
    </div>

    <div v-if="props.module === 'suppliers' && settingType === 'groups' && showSupplierChildModal" class="aw-modal-mask">
      <div class="aw-modal aw-category-modal">
        <div class="aw-modal-head">
          <strong>新增下级分类</strong>
          <button type="button" class="aw-modal-close" @click="closeSupplierChildModal">×</button>
        </div>
        <div class="aw-modal-body">
          <label class="aw-field">
            <span>分类名称</span>
            <input v-model="supplierChildForm.name" placeholder="请输入分类名称" />
          </label>
          <label class="aw-field">
            <span>分类编号</span>
            <input v-model="supplierChildForm.code" placeholder="请输入分类编号" />
          </label>
          <label class="aw-field aw-field-full">
            <span>分类备注</span>
            <textarea v-model="supplierChildForm.remark" placeholder="请输入分类备注"></textarea>
          </label>
        </div>
        <div class="aw-modal-foot">
          <button class="aw-tool-btn" type="button" @click="closeSupplierChildModal">取消</button>
          <button class="aw-btn primary" type="button" @click="addSupplierChildGroup">确定</button>
        </div>
      </div>
    </div>

    <div v-if="props.module === 'suppliers' && settingType === 'levels' && showSupplierLevelModal" class="aw-modal-mask">
      <div class="aw-modal aw-category-modal">
        <div class="aw-modal-head">
          <strong>新增等级</strong>
          <button type="button" class="aw-modal-close" @click="closeSupplierLevelModal">×</button>
        </div>
        <div class="aw-modal-body">
          <label class="aw-field">
            <span><b>*</b>等级名称</span>
            <input v-model="supplierLevelForm.name" placeholder="请输入等级名称" />
          </label>
          <label class="aw-field">
            <span>是否启用</span>
            <label class="aw-switch-line">
              <input v-model="supplierLevelForm.enabled" type="checkbox" />
              <i></i>
              <em>是否启用</em>
            </label>
          </label>
          <label class="aw-field aw-field-full">
            <span>备注</span>
            <textarea v-model="supplierLevelForm.remark" placeholder="请输入备注"></textarea>
          </label>
        </div>
        <div class="aw-modal-foot">
          <button class="aw-tool-btn" type="button" @click="closeSupplierLevelModal">取消</button>
          <button class="aw-btn primary" type="button" @click="addSupplierLevelFromModal">确定</button>
        </div>
      </div>
    </div>

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
