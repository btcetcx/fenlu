<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getSalesSettings, saveSalesSettings } from '@/app/api/sales/resources';
import { salesSettingTemplates, type ApprovalRuleRow, type SalesSettingModule, type SalesSettingType } from '@/app/templates/settings-template';
import AwApprovalRuleEditor from '@/components/setting-page/AwApprovalRuleEditor.vue';
import AwCodeRuleBuilder from '@/components/setting-page/AwCodeRuleBuilder.vue';
import AwFieldSettingPage from '@/components/setting-page/AwFieldSettingPage.vue';
import AwPersonPickerModal from '@/components/setting-page/AwPersonPickerModal.vue';
import AwSettingListCard from '@/components/setting-page/AwSettingListCard.vue';
import AwSettingPage from '@/components/setting-page/AwSettingPage.vue';
import AwSettingTable from '@/components/setting-page/AwSettingTable.vue';
import AwSettingToolbar from '@/components/setting-page/AwSettingToolbar.vue';
import AwStrategySettingPage from '@/components/setting-page/AwStrategySettingPage.vue';
import type { ApprovalNode, FieldSettingRow, PersonPickerPerson, SettingTableColumn, StrategyRule } from '@/components/setting-page/types';

const props = defineProps<{ module: SalesSettingModule }>();
const emit = defineEmits<{ back: [] }>();
const route = useRoute();
const router = useRouter();
const resourceMap = {
  plans: 'sales-plans',
  quotes: 'sales-quotes',
  contracts: 'sales-contracts',
  orders: 'sales-orders',
} as const;

const template = computed(() => salesSettingTemplates[props.module]);
const settingType = computed<SalesSettingType>(() => {
  const value = String(route.query.setting || 'fields');
  return ['fields', 'numbers', 'approvals', 'strategies', 'print'].includes(value) ? value as SalesSettingType : 'fields';
});
const settingTitle = computed(() => template.value.typeTitles[settingType.value]);
const showAdd = computed(() => ['fields', 'approvals', 'print'].includes(settingType.value));
const addText = computed(() => {
  if (settingType.value === 'fields') return template.value.fields.addText;
  if (settingType.value === 'approvals') return template.value.approvals.addText;
  if (settingType.value === 'print') return template.value.print.addText;
  return '';
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
const editingField = ref<FieldSettingRow | null>(null);
const editingApproval = ref<ApprovalRuleRow | null>(null);
const showFieldModal = ref(false);
const activeNodeIndex = ref(0);
const pickingNodeIndex = ref<number | null>(null);
const pickingFieldPermissions = ref(false);
const strategyTabs = ref(template.value.strategies.tabs.map((tab) => ({ ...tab, rows: tab.rows.map((row) => ({ ...row })) })));
const printRows = ref(template.value.print.rows.map((row) => ({ ...row })));
const saving = ref(false);
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

const approvalColumns: SettingTableColumn[] = [
  { key: 'index', label: '序号', width: '70px' },
  { key: 'name', label: '流程名称' },
  { key: 'category', label: '适用场景' },
  { key: 'nodeCount', label: '节点数', width: '90px' },
  { key: 'owner', label: '创建人', width: '100px' },
  { key: 'updatedAt', label: '更新时间', width: '120px' },
  { key: 'enabled', label: '是否启用', width: '110px' },
];

const printColumns: SettingTableColumn[] = [
  { key: 'index', label: '序号', width: '70px' },
  { key: 'name', label: '模板名称' },
  { key: 'scene', label: '适用场景' },
  { key: 'paper', label: '纸张' },
  { key: 'status', label: '状态', width: '90px' },
  { key: 'updatedAt', label: '更新时间', width: '120px' },
];

const peopleDepts = [
  {
    key: 'sales',
    label: '销售中心',
    persons: [
      { id: 'XS001', name: '老大', role: '销售总监', phone: '13800000001' },
      { id: 'XS002', name: '李文涛', role: '销售经理', phone: '13800000002' },
      { id: 'XS003', name: '陈思源', role: '销售经理', phone: '13800000003' },
    ],
  },
  {
    key: 'finance',
    label: '财务中心',
    persons: [
      { id: 'CW001', name: '张国', role: '财务复核', phone: '13800000004' },
      { id: 'CW002', name: '赵强', role: '应收会计', phone: '13800000005' },
    ],
  },
];

const approvalTableRows = computed(() => approvalRows.value.map((row, index) => ({
  ...row,
  index: index + 1,
  nodeCount: `${row.nodes.length} 个节点`,
  enabled: row.enabled ? '启用' : '停用',
})));
const approvalOptions = computed(() => approvalRows.value.map((row) => row.name));
const strategyTabsWithApprovals = computed(() => strategyTabs.value.map((tab) => ({
  ...tab,
  rows: tab.rows.map((row) => row.type === 'select' && row.key === 'needApproval'
    ? { ...row, options: approvalOptions.value, value: row.value || approvalOptions.value[0] }
    : row),
})));

const numberLegacyMap: Record<string, string[]> = {
  yearMonth: ['y4', 'm'],
  yearMonthDay: ['y4', 'm', 'd'],
  serial3: ['s3'],
  serial4: ['s3'],
  dept: [],
  owner: [],
};

function normalizeNumberSelected(keys: string[]) {
  const candidateKeys = new Set(template.value.numbers.candidates.map((item) => item.key));
  const next = keys.flatMap((key) => numberLegacyMap[key] ?? [key]).filter((key) => candidateKeys.has(key));
  return Array.from(new Set(next)).slice(0, 4);
}

function goBack() {
  emit('back');
  router.push(template.value.backRoute);
}

onMounted(async () => {
  const settings = await getSalesSettings(props.module);
  fieldRows.value = settings.fields.map((row) => ({ ...row }));
  prefix.value = settings.numberRule.prefix;
  separator.value = settings.numberRule.separator;
  selectedNumbers.value = normalizeNumberSelected(settings.numberRule.selected);
  approvalRows.value = settings.approvals.map((row) => ({
    ...row,
    nodes: row.nodes.map((node) => ({ ...node, approvers: [...node.approvers] })),
  }));
  strategyTabs.value = settings.strategies.map((tab) => ({ ...tab, rows: tab.rows.map((row) => ({ ...row })) }));
  printRows.value = settings.printTemplates.map((row) => ({ ...row }));
});

async function persistSettings() {
  saving.value = true;
  try {
    await saveSalesSettings(props.module, {
      resource: resourceMap[props.module],
      fields: fieldRows.value.map((row) => ({
        id: String(row.id),
        name: row.name,
        code: row.code,
        type: row.type,
        scope: row.scope,
        required: row.required === true || row.required === '是',
        enabled: row.enabled !== false,
        placeholder: String(row.placeholder || ''),
        defaultValue: String(row.defaultValue || ''),
        permissions: Array.isArray(row.permissions) ? row.permissions.map((person: any) => ({
          id: String(person.id || person.name),
          name: person.name,
          dept: person.dept,
          role: person.role,
          visible: person.visible !== false,
        })) : [],
      })),
      numberRule: { prefix: prefix.value, separator: separator.value, selected: [...selectedNumbers.value] },
      approvals: approvalRows.value.map((row) => ({
        id: String(row.id),
        name: row.name,
        category: row.category,
        nodes: row.nodes.map((node) => ({ ...node, approvers: [...node.approvers] })),
        owner: row.owner,
        updatedAt: row.updatedAt,
        enabled: row.enabled,
      })),
      strategies: strategyTabs.value.map((tab) => ({ ...tab, rows: tab.rows.map((row) => ({ ...row })) })),
      printTemplates: printRows.value.map((row) => ({ ...row, id: String(row.id) })),
    });
  } finally {
    saving.value = false;
  }
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
  editingField.value = null;
  showFieldModal.value = false;
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
  selectedNumbers.value = normalizeNumberSelected(template.value.numbers.selected);
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
        @add="settingType === 'approvals' ? addApproval() : settingType === 'fields' ? openField() : settingType === 'print' ? addPrintTemplate() : undefined"
        @back="goBack"
        @cancel="editingApproval = null"
        @save="saveApproval"
      />
    </template>

    <aw-field-setting-page
      v-if="settingType === 'fields'"
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
      description="统一维护当前模块审批规则，策略设置中的流程下拉来源于此列表。"
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
      :tabs="strategyTabsWithApprovals"
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
              <option>日期</option>
              <option>下拉</option>
              <option>多选</option>
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
