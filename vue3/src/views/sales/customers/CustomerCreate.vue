<template>
  <div class="aw-form-page">
    <section class="aw-detail-toolbar">
      <button class="aw-back-btn" type="button" @click="router.push('/sales/customers')"><span class="aw-line-icon line-back" />返回列表</button>
      <div class="aw-detail-actions">
        <button class="aw-tool-btn" type="button">保存草稿</button>
        <button class="aw-tool-btn" type="button">重置</button>
        <button class="aw-btn primary" type="button">保存客户</button>
      </div>
    </section>

    <section class="aw-form-card">
      <div class="aw-detail-section-title">基础信息</div>
      <div class="aw-form-grid">
        <div class="aw-field"><label class="req">客户名称</label><input class="aw-input" placeholder="请输入客户全称" /></div>
        <div class="aw-field"><label class="req">客户分类</label><select class="aw-select"><option>请选择</option><option>重点客户</option><option>战略客户</option><option>普通客户</option><option>渠道客户</option></select></div>
        <div class="aw-field"><label class="req">客户经理</label><div class="aw-field-row"><input class="aw-input" placeholder="点击绑定销售人员" readonly /><button class="aw-tool-btn" type="button">绑定销售人员</button></div></div>
        <div class="aw-field"><label>拼音码</label><input class="aw-input" placeholder="根据客户名称自动生成，可手动修改" /></div>
        <div class="aw-field"><label>信用代码</label><input class="aw-input" placeholder="请输入统一社会信用代码" /></div>
        <div class="aw-field"><label>客户编号</label><input class="aw-input" value="系统自动生成" disabled /></div>
        <div class="aw-field"><label>客户等级</label><select class="aw-select"><option>请选择</option><option>A级</option><option>B级</option><option>C级</option></select></div>
        <div class="aw-field"><label>所属行业</label><select class="aw-select"><option>请选择</option><option>智能制造</option><option>电子科技</option><option>装备制造</option><option>包装材料</option></select></div>
      </div>
    </section>

    <section class="aw-form-card">
      <div class="aw-detail-section-title">客户信息</div>
      <div class="aw-detail-tabs">
        <button v-for="tab in tabs" :key="tab.key" :class="['aw-detail-tab', { on: activeTab === tab.key }]" type="button" @click="activeTab = tab.key">{{ tab.label }}</button>
      </div>
      <div v-if="activeTab === 'contact'" class="aw-doc-tbl-wrap"><div class="aw-doc-tbl-inner"><table class="aw-doc-tbl">
        <thead><tr><th style="width:60px">序号</th><th>联系人</th><th>职位</th><th>联系方式</th><th>邮箱</th><th style="width:90px">默认</th><th style="width:90px">操作</th></tr></thead>
        <tbody>
          <tr v-for="(row, index) in contactRows" :key="row.id">
            <td>{{ index + 1 }}</td>
            <td><input class="aw-input" placeholder="请输入联系人姓名" /></td>
            <td><input class="aw-input" placeholder="请输入职位" /></td>
            <td><input class="aw-input" placeholder="请输入手机号/电话" /></td>
            <td><input class="aw-input" placeholder="请输入邮箱" /></td>
            <td><label class="aw-check"><input type="checkbox" :checked="row.isDefault" @change="setDefaultContact(row.id)" /><span /></label></td>
            <td><span class="aw-link" style="color:var(--aw-danger)" @click="removeContact(row.id)">删除</span></td>
          </tr>
        </tbody>
      </table></div></div>
      <button v-if="activeTab === 'contact'" class="aw-tool-btn" type="button" style="margin-top:10px" @click="addContact">新增联系人</button>
      <template v-else-if="activeTab === 'finance'">
        <div class="aw-doc-tbl-wrap"><div class="aw-doc-tbl-inner"><table class="aw-doc-tbl">
          <thead><tr><th style="width:60px">序号</th><th>账户名称</th><th>开户银行</th><th>银行账号</th><th>收款说明</th><th style="width:90px">默认</th><th style="width:90px">操作</th></tr></thead>
          <tbody><tr v-for="(row, index) in financeRows" :key="row.id"><td>{{ index + 1 }}</td><td><input class="aw-input" placeholder="请输入账户名称" /></td><td><input class="aw-input" placeholder="请输入开户银行" /></td><td><input class="aw-input" placeholder="请输入银行账号" /></td><td><input class="aw-input" placeholder="收款说明" /></td><td><label class="aw-check"><input type="checkbox" :checked="index === 0" /><span /></label></td><td><span class="aw-link" style="color:var(--aw-danger)" @click="removeFinance(row.id)">删除</span></td></tr></tbody>
        </table></div></div>
        <button class="aw-tool-btn" type="button" style="margin-top:10px" @click="addFinance">新增财务信息</button>
      </template>
      <template v-else-if="activeTab === 'address'">
        <div class="aw-doc-tbl-wrap"><div class="aw-doc-tbl-inner"><table class="aw-doc-tbl">
          <thead><tr><th style="width:60px">序号</th><th>地址类型</th><th>联系人</th><th>联系电话</th><th>详细地址</th><th style="width:90px">默认</th><th style="width:90px">操作</th></tr></thead>
          <tbody><tr v-for="(row, index) in addressRows" :key="row.id"><td>{{ index + 1 }}</td><td><select class="aw-select"><option>收货地址</option><option>开票地址</option><option>办公地址</option></select></td><td><input class="aw-input" placeholder="请输入联系人" /></td><td><input class="aw-input" placeholder="请输入联系电话" /></td><td><input class="aw-input" placeholder="请输入详细地址" /></td><td><label class="aw-check"><input type="checkbox" :checked="index === 0" /><span /></label></td><td><span class="aw-link" style="color:var(--aw-danger)" @click="removeAddress(row.id)">删除</span></td></tr></tbody>
        </table></div></div>
        <button class="aw-tool-btn" type="button" style="margin-top:10px" @click="addAddress">新增地址</button>
      </template>
      <template v-else>
        <div class="aw-doc-tbl-wrap"><div class="aw-doc-tbl-inner"><table class="aw-doc-tbl">
          <thead><tr><th style="width:60px">序号</th><th>附件名称</th><th>附件类型</th><th>上传日期</th><th>备注</th><th style="width:120px">操作</th></tr></thead>
          <tbody><tr v-for="(row, index) in attachRows" :key="row.id"><td>{{ index + 1 }}</td><td><input class="aw-input" placeholder="请输入附件名称" /></td><td><select class="aw-select"><option>资质文件</option><option>营业执照</option><option>合同附件</option></select></td><td><input class="aw-input" placeholder="系统自动生成" disabled /></td><td><input class="aw-input" placeholder="请输入备注" /></td><td><span class="aw-link">上传</span><span class="aw-link" style="color:var(--aw-danger);margin-left:10px" @click="removeAttach(row.id)">删除</span></td></tr></tbody>
        </table></div></div>
        <button class="aw-tool-btn" type="button" style="margin-top:10px" @click="addAttach">新增附件信息</button>
      </template>
      <div class="aw-sub-title" style="margin-top:18px">账期设置</div>
      <div class="aw-payment-grid">
        <div v-for="item in paymentTypes" :key="item.key" :class="['aw-payment-card', { on: paymentType === item.key }]" @click="paymentType = item.key">
          <span :class="['aw-payment-radio', { checked: paymentType === item.key }]" /> <strong>{{ item.label }}</strong>
          <input class="aw-input aw-payment-input" :value="item.value" :placeholder="item.placeholder" @click.stop />
          <div v-if="item.tip" class="aw-field-hint">{{ item.tip }}</div>
        </div>
      </div>
    </section>

    <section class="aw-form-card">
      <div class="aw-detail-section-title">客户详情</div>
      <div class="aw-rt-bar">
        <span>文件</span><span>编辑</span><span>插入</span><span>视图</span><span>格式</span><span>表格</span>
      </div>
      <div class="aw-rt-bar aw-rt-tools">
        <span>B</span><span><i>I</i></span><span><u>U</u></span><span>S</span>
        <i></i>
        <span>左对齐</span><span>居中</span><span>•</span><span>1.</span><span>链接</span><span>图片</span><span>表格</span>
      </div>
      <div class="aw-rt-area" contenteditable="true">请输入客户背景、合作偏好、风险说明等信息</div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const activeTab = ref('contact');
const contactRows = ref([{ id: 1, isDefault: true }]);
const financeRows = ref([{ id: 1 }]);
const addressRows = ref([{ id: 1 }]);
const attachRows = ref([{ id: 1 }]);
const paymentType = ref('cash');
interface PaymentType {
  key: string;
  label: string;
  value: string;
  placeholder: string;
  tip?: string;
}

const paymentTypes: PaymentType[] = [
  { key: 'cash', label: '现结', value: '下单时即时结清货款', placeholder: '' },
  { key: 'monthly', label: '月结', value: '', placeholder: '如每个月25号结算' },
  { key: 'cycle', label: '周期', value: '', placeholder: '如30、60、90按照指定天数结算' },
  { key: 'credit', label: '额度', value: '', placeholder: '如200000', tip: '超出额度需提前收款或审批' },
];
const tabs = [
  { key: 'contact', label: '联系人信息' },
  { key: 'finance', label: '财务信息' },
  { key: 'address', label: '地址信息' },
  { key: 'attach', label: '附件信息' },
];

function addContact() {
  contactRows.value.push({ id: Date.now(), isDefault: contactRows.value.length === 0 });
}

function removeContact(id: number) {
  if (contactRows.value.length <= 1) return;
  contactRows.value = contactRows.value.filter((row) => row.id !== id);
  if (!contactRows.value.some((row) => row.isDefault)) contactRows.value[0].isDefault = true;
}

function setDefaultContact(id: number) {
  contactRows.value = contactRows.value.map((row) => ({ ...row, isDefault: row.id === id }));
}

function addFinance() {
  financeRows.value.push({ id: Date.now() });
}

function removeFinance(id: number) {
  if (financeRows.value.length <= 1) return;
  financeRows.value = financeRows.value.filter((row) => row.id !== id);
}

function addAddress() {
  addressRows.value.push({ id: Date.now() });
}

function removeAddress(id: number) {
  if (addressRows.value.length <= 1) return;
  addressRows.value = addressRows.value.filter((row) => row.id !== id);
}

function addAttach() {
  attachRows.value.push({ id: Date.now() });
}

function removeAttach(id: number) {
  if (attachRows.value.length <= 1) return;
  attachRows.value = attachRows.value.filter((row) => row.id !== id);
}

</script>
