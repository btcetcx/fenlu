<template>
  <aw-form-page :actions="formActions" @back="router.push('/sales/customers')" @action="handleFormAction">
    <section class="aw-form-card">
      <div class="aw-detail-section-title">基础信息</div>
      <div class="aw-form-grid">
        <div class="aw-field"><label class="req">客户名称</label><input v-model="form.name" class="aw-input" placeholder="请输入客户全称" /></div>
        <div class="aw-field"><label class="req">客户分类</label><select v-model="form.groupName" class="aw-select"><option value="">请选择</option><option>重点客户</option><option>战略客户</option><option>普通客户</option><option>渠道客户</option></select></div>
        <div class="aw-field">
          <label class="req">客户经理</label>
          <div class="aw-field-row">
            <input class="aw-input" :value="managerName" placeholder="点击绑定销售人员" readonly @click="showManagerPicker = true" />
            <button class="aw-tool-btn" type="button" @click="showManagerPicker = true">绑定销售人员</button>
          </div>
        </div>
        <div class="aw-field"><label>拼音码</label><input v-model="form.pinyinCode" class="aw-input" placeholder="根据客户名称自动生成，可手动修改" /></div>
        <div class="aw-field"><label>信用代码</label><input v-model="form.creditCode" class="aw-input" placeholder="请输入统一社会信用代码" /></div>
        <div class="aw-field"><label>客户编号</label><input class="aw-input" value="系统自动生成" disabled /></div>
        <div class="aw-field"><label>客户等级</label><select v-model="form.level" class="aw-select"><option value="">请选择</option><option>A级</option><option>B级</option><option>C级</option></select></div>
        <div class="aw-field"><label>所属行业</label><select v-model="form.industry" class="aw-select"><option value="">请选择</option><option>智能制造</option><option>电子科技</option><option>装备制造</option><option>包装材料</option></select></div>
        <div class="aw-field"><label>信用管控</label><select v-model="form.creditControl" class="aw-select"><option>正常放行</option><option>临近额度提醒</option><option>超额拦截</option><option>停止赊销</option></select></div>
      </div>
      <div v-if="submitMessage" class="aw-form-note">{{ submitMessage }}</div>
    </section>

    <section class="aw-form-card">
      <div class="aw-detail-section-title">客户信息</div>
      <div class="aw-detail-tabs">
        <button v-for="tab in tabs" :key="tab.key" :class="['aw-detail-tab', { on: activeTab === tab.key }]" type="button" @click="activeTab = tab.key">{{ tab.label }}</button>
      </div>

      <aw-editable-sub-table v-if="activeTab === 'contact'" :columns="contactColumns" :rows="contactRows" add-text="新增联系人" @add="addContact">
        <template #cell="{ column, row }">
          <input v-if="column.key === 'name'" v-model="row.name" class="aw-input" placeholder="请输入联系人姓名" />
          <input v-else-if="column.key === 'position'" v-model="row.position" class="aw-input" placeholder="请输入职位" />
          <input v-else-if="column.key === 'phone'" v-model="row.phone" class="aw-input" placeholder="请输入手机/电话" />
          <input v-else-if="column.key === 'email'" v-model="row.email" class="aw-input" placeholder="请输入邮箱" />
          <label v-else-if="column.key === 'isDefault'" class="aw-check">
            <input type="checkbox" :checked="Boolean(row.isDefault)" @change="setDefaultContact(Number(row.id))" /><span />
          </label>
        </template>
        <template #actions="{ row }">
          <span class="aw-link" style="color:var(--aw-danger)" @click="removeContact(Number(row.id))">删除</span>
        </template>
      </aw-editable-sub-table>

      <aw-editable-sub-table v-else-if="activeTab === 'finance'" :columns="financeColumns" :rows="financeRows" add-text="新增财务信息" @add="addFinance">
        <template #cell="{ column, row, index }">
          <input v-if="column.key === 'accountName'" v-model="row.accountName" class="aw-input" placeholder="请输入账户名称" />
          <input v-else-if="column.key === 'bankName'" v-model="row.bankName" class="aw-input" placeholder="请输入开户银行" />
          <input v-else-if="column.key === 'bankAccount'" v-model="row.bankAccount" class="aw-input" placeholder="请输入银行账号" />
          <input v-else-if="column.key === 'remark'" v-model="row.remark" class="aw-input" placeholder="收款说明" />
          <label v-else-if="column.key === 'isDefault'" class="aw-check"><input type="checkbox" :checked="index === 0" /><span /></label>
        </template>
        <template #actions="{ row }">
          <span class="aw-link" style="color:var(--aw-danger)" @click="removeFinance(Number(row.id))">删除</span>
        </template>
      </aw-editable-sub-table>

      <aw-editable-sub-table v-else-if="activeTab === 'address'" :columns="addressColumns" :rows="addressRows" add-text="新增地址" @add="addAddress">
        <template #cell="{ column, row, index }">
          <select v-if="column.key === 'addressType'" v-model="row.addressType" class="aw-select"><option>收货地址</option><option>开票地址</option><option>办公地址</option></select>
          <input v-else-if="column.key === 'contact'" v-model="row.contact" class="aw-input" placeholder="请输入联系人" />
          <input v-else-if="column.key === 'phone'" v-model="row.phone" class="aw-input" placeholder="请输入联系电话" />
          <input v-else-if="column.key === 'address'" v-model="row.address" class="aw-input" placeholder="请输入详细地址" />
          <label v-else-if="column.key === 'isDefault'" class="aw-check"><input type="checkbox" :checked="index === 0" /><span /></label>
        </template>
        <template #actions="{ row }">
          <span class="aw-link" style="color:var(--aw-danger)" @click="removeAddress(Number(row.id))">删除</span>
        </template>
      </aw-editable-sub-table>

      <aw-editable-sub-table v-else :columns="attachColumns" :rows="attachRows" add-text="新增附件信息" :action-width="120" @add="addAttach">
        <template #cell="{ column, row }">
          <input v-if="column.key === 'name'" v-model="row.name" class="aw-input" placeholder="请输入附件名称" />
          <select v-else-if="column.key === 'type'" v-model="row.type" class="aw-select"><option>资质文件</option><option>营业执照</option><option>合同附件</option></select>
          <input v-else-if="column.key === 'date'" class="aw-input" placeholder="系统自动生成" disabled />
          <input v-else-if="column.key === 'remark'" v-model="row.remark" class="aw-input" placeholder="请输入备注" />
        </template>
        <template #actions="{ row }">
          <span class="aw-link">上传</span><span class="aw-link" style="color:var(--aw-danger);margin-left:10px" @click="removeAttach(Number(row.id))">删除</span>
        </template>
      </aw-editable-sub-table>

      <div class="aw-sub-title" style="margin-top:18px">账期设置</div>
      <aw-payment-term-cards v-model="paymentType" :items="paymentTypes" @update:item="updatePaymentValue" />
    </section>

    <section class="aw-form-card">
      <div class="aw-detail-section-title">客户详情</div>
      <aw-rich-text-editor v-model="customerDetail" />
    </section>

    <aw-person-picker-modal
      :open="showManagerPicker"
      title="选择客户经理"
      :depts="personDepts"
      :picked="pickedManagers"
      @cancel="showManagerPicker = false"
      @confirm="confirmManagers"
    />
  </aw-form-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { createCustomer } from '@/app/api/sales/resources';
import AwEditableSubTable from '@/components/form-page/AwEditableSubTable.vue';
import AwFormPage from '@/components/form-page/AwFormPage.vue';
import AwPaymentTermCards from '@/components/form-page/AwPaymentTermCards.vue';
import AwRichTextEditor from '@/components/form-page/AwRichTextEditor.vue';
import AwPersonPickerModal from '@/components/setting-page/AwPersonPickerModal.vue';
import type { EditableColumn, FormAction, PaymentTermItem } from '@/components/form-page/types';
import type { PersonPickerDept, PersonPickerPerson } from '@/components/setting-page/types';

type Row = Record<string, any>;

const router = useRouter();
const activeTab = ref('contact');
const showManagerPicker = ref(false);
const pickedManagers = ref<PersonPickerPerson[]>([]);
const submitMessage = ref('');
const submitting = ref(false);
const form = ref({
  name: '',
  groupName: '',
  pinyinCode: '',
  creditCode: '',
  level: '',
  industry: '',
  creditControl: '正常放行',
});
const contactRows = ref<Row[]>([{ id: 1, isDefault: true }]);
const financeRows = ref<Row[]>([{ id: 1 }]);
const addressRows = ref<Row[]>([{ id: 1, addressType: '收货地址' }]);
const attachRows = ref<Row[]>([{ id: 1, type: '资质文件' }]);
const paymentType = ref('cash');
const customerDetail = ref('');
const managerName = computed(() => pickedManagers.value.map((person) => person.name).join('、'));
const formActions: FormAction[] = [
  { key: 'draft', label: '保存草稿' },
  { key: 'reset', label: '重置' },
  { key: 'save', label: '保存客户', primary: true },
];
const personDepts: PersonPickerDept[] = [
  { key: 'sales', label: '销售中心', persons: [
    { id: 'XS001', name: '老夏', role: '销售主管', phone: '13800000001', dept: '销售中心' },
    { id: 'XS002', name: '李文涛', role: '销售经理', phone: '13800000002', dept: '销售中心' },
    { id: 'XS003', name: '陈思源', role: '销售经理', phone: '13800000003', dept: '销售中心' },
    { id: 'XS004', name: '赵强', role: '渠道经理', phone: '13800000004', dept: '销售中心' },
  ] },
  { key: 'finance', label: '财务中心', persons: [
    { id: 'CW001', name: '顾伦', role: '财务经理', phone: '13900000001', dept: '财务中心' },
    { id: 'CW002', name: '纪广', role: '应收会计', phone: '13900000002', dept: '财务中心' },
  ] },
];
const paymentTypes = ref<PaymentTermItem[]>([
  { key: 'cash', label: '现结', value: '下单时即时结清货款', placeholder: '' },
  { key: 'monthly', label: '月结', value: '', placeholder: '如每个月25号结算' },
  { key: 'cycle', label: '周期', value: '', placeholder: '如30、60、90按指定天数结算' },
  { key: 'credit', label: '额度', value: '', placeholder: '如100000', tip: '超出额度需提前收款或审批' },
]);
const tabs = [
  { key: 'contact', label: '联系人信息' },
  { key: 'finance', label: '财务信息' },
  { key: 'address', label: '地址信息' },
  { key: 'attach', label: '附件信息' },
];
const contactColumns: EditableColumn[] = [
  { key: 'name', title: '联系人' },
  { key: 'position', title: '职位' },
  { key: 'phone', title: '联系方式' },
  { key: 'email', title: '邮箱' },
  { key: 'isDefault', title: '默认', width: 90 },
];
const financeColumns: EditableColumn[] = [
  { key: 'accountName', title: '账户名称' },
  { key: 'bankName', title: '开户银行' },
  { key: 'bankAccount', title: '银行账号' },
  { key: 'remark', title: '收款说明' },
  { key: 'isDefault', title: '默认', width: 90 },
];
const addressColumns: EditableColumn[] = [
  { key: 'addressType', title: '地址类型' },
  { key: 'contact', title: '联系人' },
  { key: 'phone', title: '联系电话' },
  { key: 'address', title: '详细地址' },
  { key: 'isDefault', title: '默认', width: 90 },
];
const attachColumns: EditableColumn[] = [
  { key: 'name', title: '附件名称' },
  { key: 'type', title: '附件类型' },
  { key: 'date', title: '上传日期' },
  { key: 'remark', title: '备注' },
];

async function handleFormAction(key: string) {
  if (key === 'reset') {
    resetForm();
    return;
  }
  if (submitting.value) return;
  submitting.value = true;
  submitMessage.value = '';
  await createCustomer({
    name: form.value.name || '未命名客户',
    groupName: form.value.groupName || '普通客户',
    managerName: managerName.value,
    creditStatusName: form.value.creditControl,
    statusName: key === 'draft' ? '草稿' : '待审核',
    detail: customerDetail.value,
    contacts: contactRows.value,
    finances: financeRows.value,
    addresses: addressRows.value,
    attachments: attachRows.value,
    paymentTerm: paymentTypes.value.find((item) => item.key === paymentType.value)?.value || paymentType.value,
  });
  submitMessage.value = key === 'draft' ? '草稿已通过新增接口保存。' : '客户已通过新增接口提交。';
  submitting.value = false;
}

function resetForm() {
  form.value = { name: '', groupName: '', pinyinCode: '', creditCode: '', level: '', industry: '', creditControl: '正常放行' };
  pickedManagers.value = [];
  contactRows.value = [{ id: 1, isDefault: true }];
  financeRows.value = [{ id: 1 }];
  addressRows.value = [{ id: 1, addressType: '收货地址' }];
  attachRows.value = [{ id: 1, type: '资质文件' }];
  customerDetail.value = '';
  submitMessage.value = '已重置。';
}

function confirmManagers(persons: PersonPickerPerson[]) {
  pickedManagers.value = persons.slice(0, 1);
  showManagerPicker.value = false;
}

function updatePaymentValue(key: string, value: string) {
  paymentTypes.value = paymentTypes.value.map((item) => (item.key === key ? { ...item, value } : item));
}

function addContact() { contactRows.value.push({ id: Date.now(), isDefault: contactRows.value.length === 0 }); }
function removeContact(id: number) { if (contactRows.value.length > 1) contactRows.value = contactRows.value.filter((row) => row.id !== id); }
function setDefaultContact(id: number) { contactRows.value = contactRows.value.map((row) => ({ ...row, isDefault: row.id === id })); }
function addFinance() { financeRows.value.push({ id: Date.now() }); }
function removeFinance(id: number) { if (financeRows.value.length > 1) financeRows.value = financeRows.value.filter((row) => row.id !== id); }
function addAddress() { addressRows.value.push({ id: Date.now(), addressType: '收货地址' }); }
function removeAddress(id: number) { if (addressRows.value.length > 1) addressRows.value = addressRows.value.filter((row) => row.id !== id); }
function addAttach() { attachRows.value.push({ id: Date.now(), type: '资质文件' }); }
function removeAttach(id: number) { if (attachRows.value.length > 1) attachRows.value = attachRows.value.filter((row) => row.id !== id); }
</script>
