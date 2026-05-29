<template>
  <aw-form-page
    back-text="返回售后列表"
    :actions="formActions"
    @back="emit('back')"
    @action="handleAction"
  >
    <div class="aw-as-flow-form">
      <section class="aw-card">
        <div class="section-title">售后受理流程</div>
        <div class="aw-as-stepper">
          <button
            v-for="(label, index) in flowSteps"
            :key="label"
            type="button"
            :class="['aw-as-step', { on: step === index, done: index < step }]"
            @click="step = index"
          >
            <span>{{ index + 1 }}</span>{{ label }}
          </button>
        </div>
      </section>

      <section v-if="step === 0" class="aw-card">
        <div class="section-title">选择客户</div>
        <div class="aw-doc-grid">
          <label class="aw-field">
            <label class="req">客户名称</label>
            <div class="aw-field-row">
              <input class="aw-input" :value="customer.name" readonly placeholder="请选择客户" />
              <button class="aw-tool-btn" type="button" @click="showCustomerPicker = true">选择客户</button>
            </div>
          </label>
          <label class="aw-field">
            <label>客户类别</label>
            <input class="aw-input" :value="customer.group" readonly placeholder="选择客户后填充" />
          </label>
          <label class="aw-field">
            <label>销售经理</label>
            <input class="aw-input" :value="customer.manager" readonly placeholder="选择客户后填充" />
          </label>
          <label class="aw-field">
            <label>联系人</label>
            <select v-model.number="contactIndex" class="aw-select" :disabled="!hasCustomer">
              <option v-if="!hasCustomer">选择客户后填充</option>
              <option v-for="(item, index) in customerContacts" v-else :key="item.title" :value="index">
                {{ item.contact }}（{{ item.title }}）
              </option>
            </select>
          </label>
          <label class="aw-field">
            <label>联系电话</label>
            <input class="aw-input" :value="pickedContact.phone" readonly placeholder="选择客户后填充" />
          </label>
          <label class="aw-field">
            <label>收货地址</label>
            <select v-model.number="addressIndex" class="aw-select" :disabled="!hasCustomer">
              <option v-if="!hasCustomer">选择客户后填充</option>
              <option v-for="(address, index) in customerAddresses" v-else :key="address" :value="index">
                {{ index === 0 ? '默认地址：' : '' }}{{ address }}
              </option>
            </select>
          </label>
        </div>
        <div class="aw-as-empty-note">先确认客户主体，再选择售后类型和来源单据；客户信息会用于后续联系人、地址、结单确认和回访。</div>
        <div class="as-step-actions right">
          <button class="aw-btn primary" type="button" @click="goNextFromCustomer">确认客户</button>
        </div>
      </section>

      <section v-else-if="step === 1" class="aw-card">
        <div class="section-title">选择售后类型</div>
        <div class="aw-as-type-grid">
          <button
            v-for="item in afterSalesTypes"
            :key="item.key"
            type="button"
            :class="['aw-as-type-card', { on: selectedType === item.key }]"
            @click="pickAfterSalesType(item.key)"
          >
            <strong>{{ item.title }}</strong>
            <span>{{ item.desc }}</span>
            <em>{{ item.owners }}</em>
          </button>
        </div>
        <div class="section-title as-sub-section-title">选择处理方式</div>
        <div class="aw-as-method-grid">
          <button
            v-for="method in availableHandlingMethods"
            :key="method"
            type="button"
            :class="['aw-as-method-card', { on: selectedHandlingMethod === method }]"
            @click="selectedHandlingMethod = method"
          >
            <strong>{{ method }}</strong>
            <span>{{ methodPreview(method) }}</span>
          </button>
        </div>
        <div class="as-step-actions">
          <button class="aw-btn" type="button" @click="step = 0">上一步</button>
          <button class="aw-btn primary" type="button" @click="step = 2">确认类型</button>
        </div>
      </section>

      <section v-else-if="step === 2" class="aw-card">
        <div class="section-title">选择主题 / 来源</div>
        <div class="aw-doc-grid">
          <label class="aw-field">
            <label class="req">售后主题</label>
            <div class="aw-field-row">
              <input v-model="subject" class="aw-input" placeholder="选择来源后可自动带出，也可以手动调整主题" />
              <button class="aw-tool-btn" type="button" @click="openSourcePicker">选择来源</button>
            </div>
          </label>
          <label class="aw-field">
            <label>来源分类</label>
            <input class="aw-input" :value="sourceValue('cat')" readonly />
          </label>
          <label v-for="field in sourceFields" :key="field.key" class="aw-field">
            <label>{{ field.label }}</label>
            <input class="aw-input" :value="sourceValue(field.key)" readonly />
          </label>
        </div>
        <div class="aw-as-empty-note">{{ hasCustomer ? sourceHint : '请先返回第一步选择客户，系统会按客户过滤相关订单和项目。' }}</div>
        <div class="as-step-actions">
          <button class="aw-btn" type="button" @click="step = 1">上一步</button>
          <button class="aw-btn primary" type="button" @click="goNextFromSource">确认来源</button>
        </div>
      </section>

      <template v-else-if="step === 3">
        <section class="aw-card">
          <div class="section-title">来源产品</div>
          <div class="as-product-tip">
            <button class="aw-btn" type="button" @click="validateSelectedProducts()">校验可售后数量</button>
            <span>按当前{{ source?.cat || '来源' }}的产品明细校验已售后占用，勾选本次需要售后的产品并填写售后数量。</span>
          </div>
          <div v-if="!productRows.length" class="aw-empty">请选择来源后，系统会带出对应的订单/项目/客户可售后产品。</div>
          <div v-else class="aw-doc-tbl-wrap">
            <div class="aw-doc-tbl-inner">
              <table class="aw-table as-product-table">
                <thead>
                  <tr>
                    <th style="width:52px">选择</th>
                    <th>序号</th>
                    <th>来源明细</th>
                    <th>产品编号</th>
                    <th>产品名称</th>
                    <th>规格型号</th>
                    <th>物料类型</th>
                    <th>物料分类</th>
                    <th>单位</th>
                    <th>实供数量</th>
                    <th>已售后</th>
                    <th>可售后</th>
                    <th>本次售后数量</th>
                    <th>问题原因</th>
                    <th>投诉问题</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in productRows" :key="row.detail">
                    <td><input type="checkbox" :checked="isProductPicked(row.detail)" :disabled="canQuantity(row) <= 0" @change="toggleProduct(row.detail)" /></td>
                    <td>{{ index + 1 }}</td>
                    <td>{{ row.detail }}</td>
                    <td>{{ row.code }}</td>
                    <td>{{ row.name }}</td>
                    <td>{{ row.model }}</td>
                    <td>{{ row.materialType }}</td>
                    <td>{{ row.category }}</td>
                    <td>{{ row.unit }}</td>
                    <td>{{ row.qty }}</td>
                    <td>{{ row.aftered }}</td>
                    <td>{{ canQuantity(row) }}</td>
                    <td><input v-model.number="productEdit(row.detail).quantity" class="aw-input as-qty-input" type="number" :min="canQuantity(row) > 0 ? 1 : 0" :max="canQuantity(row)" /></td>
                    <td>
                      <select v-model="productEdit(row.detail).reason" class="aw-select">
                        <option v-for="item in reasonOptions" :key="item">{{ item }}</option>
                      </select>
                    </td>
                    <td>
                      <select v-model="productEdit(row.detail).complaint" class="aw-select">
                        <option v-for="item in complaintOptions" :key="item">{{ item }}</option>
                      </select>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-if="formMessage" class="aw-as-empty-note">{{ formMessage }}</div>
        </section>

        <section class="aw-card">
          <div class="section-title">证据附件</div>
          <div class="aw-as-upload-only">
            <div class="aw-as-upload-box">
              <span class="aw-link">点击或将文件拖拽到这里上传</span>
              <div>建议上传问题照片/视频、物流签收凭证、检测报告或现场沟通记录，证据越完整，责任判定和后续处理越快。</div>
              <div>支持图片、视频、PDF、Excel、Word 等附件。</div>
            </div>
          </div>
        </section>

        <section class="aw-card">
          <div class="section-title">售后详情</div>
          <aw-rich-text-editor v-model="description" placeholder="请输入售后问题描述、客户诉求、沟通记录、现场情况或补充说明..." />
        </section>

        <div class="as-step-actions">
          <button class="aw-btn" type="button" @click="step = 2">上一步</button>
          <button class="aw-btn primary" type="button" @click="goPreviewFromProducts">预览提交</button>
        </div>
      </template>

      <template v-else>
        <section class="aw-card">
          <div class="section-title">提交前预览</div>
          <div class="aw-doc-grid">
            <div class="as-kv"><span>售后主题：</span><strong>{{ subject || '-' }}</strong></div>
            <div class="as-kv"><span>客户：</span><strong>{{ customer.name || '-' }}</strong></div>
            <div class="as-kv"><span>售后类型：</span><strong><span class="aw-status">{{ typeTitle }}</span></strong></div>
            <div class="as-kv"><span>处理方式：</span><strong><span class="aw-status">{{ selectedHandlingMethod }}</span></strong></div>
            <div class="as-kv"><span>来源分类：</span><strong>{{ source?.cat || '-' }}</strong></div>
            <div class="as-kv"><span>来源单据：</span><strong>{{ source?.code || '-' }}</strong></div>
            <div class="as-kv"><span>来源订单：</span><strong>{{ source?.sourceOrder || '-' }}</strong></div>
            <div class="as-kv"><span>来源发货/交付：</span><strong>{{ source?.sourceDelivery || '-' }}</strong></div>
            <div class="as-kv"><span>发货/交付日期：</span><strong>{{ source?.deliveryDate || '-' }}</strong></div>
            <div class="as-kv"><span>批次状态：</span><strong>{{ source?.deliveryStatus || '-' }}</strong></div>
            <div class="as-kv"><span>产品行数：</span><strong>{{ previewProductRows.length }} 行来源产品</strong></div>
          </div>
        </section>

        <section class="aw-card">
          <div class="section-title">本次售后产品预览</div>
          <div v-if="!previewProductRows.length" class="aw-empty">请选择来源后，系统会带出对应的订单/项目/客户可售后产品。</div>
          <div v-else class="aw-doc-tbl-wrap">
            <div class="aw-doc-tbl-inner">
              <table class="aw-table as-product-table">
                <thead>
                  <tr>
                    <th>序号</th>
                    <th>来源明细</th>
                    <th>产品编号</th>
                    <th>产品名称</th>
                    <th>规格型号</th>
                    <th>物料类型</th>
                    <th>物料分类</th>
                    <th>单位</th>
                    <th>实供数量</th>
                    <th>已售后</th>
                    <th>可售后</th>
                    <th>本次售后数量</th>
                    <th>问题原因</th>
                    <th>投诉问题</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in previewProductRows" :key="row.detail">
                    <td>{{ index + 1 }}</td>
                    <td>{{ row.detail }}</td>
                    <td>{{ row.code }}</td>
                    <td>{{ row.name }}</td>
                    <td>{{ row.model }}</td>
                    <td>{{ row.materialType }}</td>
                    <td>{{ row.category }}</td>
                    <td>{{ row.unit }}</td>
                    <td>{{ row.qty }}</td>
                    <td>{{ row.aftered }}</td>
                    <td>{{ canQuantity(row) }}</td>
                    <td>{{ productEdit(row.detail).quantity }}</td>
                    <td>{{ productEdit(row.detail).reason }}</td>
                    <td>{{ productEdit(row.detail).complaint }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section class="aw-card">
          <div class="section-title">售后详情</div>
          <div class="as-readonly-detail">{{ previewDescription }}</div>
        </section>

        <section class="aw-card">
          <div class="section-title">附件信息</div>
          <div class="as-attachment-preview">
            <div v-for="name in attachmentNames" :key="name" class="as-attachment-card">{{ name }}</div>
          </div>
          <div v-if="formMessage" class="aw-as-empty-note">{{ formMessage }}</div>
        </section>

        <div class="as-step-actions">
          <button class="aw-btn" type="button" @click="step = 3">上一步</button>
          <button class="aw-btn primary" type="button" @click="submitAfterSales">提交</button>
        </div>
      </template>
    </div>

    <div v-if="showSourcePicker" class="aw-mask" @click="showSourcePicker = false">
      <div class="aw-modal lg" @click.stop>
        <div class="head">
          <span>选择售后来源</span>
          <button class="aw-modal-close" type="button" @click="showSourcePicker = false">×</button>
        </div>
        <div class="body as-source-picker-body">
          <div class="as-source-side">
            <div
              v-for="item in ['订单', '项目']"
              :key="item"
              :class="['aw-tree-row', 'aw-tree-l2', { on: modalSourceCat === item }]"
              @click="switchSourceCat(item)"
            >
              <span :class="['aw-line-icon', item === '订单' ? 'line-doc' : 'line-folder']"></span><span>{{ item }}</span>
            </div>
          </div>
          <div class="as-source-main">
            <div class="as-source-current">
              当前客户：<span class="aw-link">{{ customer.name || '请先选择客户' }}</span>
              <span>　当前来源：</span><span class="aw-link">{{ modalSourceCat }}</span>
            </div>
            <table class="aw-table">
              <thead>
                <tr>
                  <th style="width:56px">选择</th>
                  <th>来源编号</th>
                  <th>来源主题</th>
                  <th>客户</th>
                  <th>来源日期</th>
                  <th>产品数</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in filteredSourceRows" :key="row.code" class="as-click-row" @click="pickModalSource(row)">
                  <td><span :class="['aw-radio', { on: modalPickedSource?.code === row.code }]"><span class="aw-dot"></span></span></td>
                  <td class="aw-num">{{ row.code }}</td>
                  <td class="aw-link">{{ row.subject }}</td>
                  <td>{{ row.customer }}</td>
                  <td>{{ row.date }}</td>
                  <td>{{ row.maxQty }}</td>
                </tr>
                <tr v-if="!filteredSourceRows.length">
                  <td colspan="6" class="as-empty-cell">{{ customer.name ? '当前客户暂无该类型来源' : '请先选择客户后再选择来源' }}</td>
                </tr>
              </tbody>
            </table>
            <div v-if="modalPickedSource" class="as-batch-panel">
              <div class="section-title">发货 / 交付批次</div>
              <table class="aw-table">
                <thead>
                  <tr>
                    <th style="width:56px">选择</th>
                    <th>发货单号</th>
                    <th>发货日期</th>
                    <th>发货仓库</th>
                    <th>物流</th>
                    <th>发货数量</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="batch in modalBatches" :key="batch.detailNo" class="as-click-row" @click="toggleBatch(batch.detailNo)">
                    <td><input type="checkbox" :checked="!!pickedBatches[batch.detailNo]" readonly /></td>
                    <td class="aw-num">{{ batch.deliveryNo }}</td>
                    <td>{{ batch.deliveryDate }}</td>
                    <td>{{ batch.warehouse }}</td>
                    <td>{{ batch.logistics }}</td>
                    <td>{{ batch.qty }}</td>
                    <td><span :class="['aw-status', batch.status.includes('待') ? 'yellow' : 'green']">{{ batch.status }}</span></td>
                  </tr>
                </tbody>
              </table>
              <div class="as-source-note">可多选发货单批次；未勾选时默认带入第一条批次。</div>
            </div>
          </div>
        </div>
        <div class="foot">
          <button class="aw-btn" type="button" @click="showSourcePicker = false">取消</button>
          <button class="aw-btn primary" type="button" @click="confirmSource">确定</button>
        </div>
      </div>
    </div>

    <div v-if="showCustomerPicker" class="aw-mask" @click="showCustomerPicker = false">
      <div class="aw-modal lg" @click.stop>
        <div class="head">
          <span>选择客户</span>
          <button class="aw-modal-close" type="button" @click="showCustomerPicker = false">×</button>
        </div>
        <div class="body as-customer-picker-body">
          <div class="aw-doc-tree">
            <div
              v-for="(group, index) in customerGroups"
              :key="group"
              :class="['aw-tree-row', 'aw-tree-l2', { on: index === 0 }]"
            >
              <span>{{ group }}</span>
            </div>
          </div>
          <div>
            <div class="as-customer-search"><input class="aw-input" placeholder="搜索客户名称 / 联系人 / 电话" /></div>
            <table class="aw-table">
              <thead>
                <tr>
                  <th style="width:56px">选择</th>
                  <th>客户名称</th>
                  <th>客户分组</th>
                  <th>联系人</th>
                  <th>客户经理</th>
                  <th>联系方式</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in customerRows" :key="row.name" class="as-click-row" @click="selectedCustomerName = row.name">
                  <td><input type="radio" :checked="selectedCustomerName === row.name" @change="selectedCustomerName = row.name" /></td>
                  <td>{{ row.name }}</td>
                  <td>{{ row.group }}</td>
                  <td>{{ row.contact }}</td>
                  <td>{{ row.manager }}</td>
                  <td>{{ row.phone }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="foot">
          <button class="aw-btn" type="button" @click="showCustomerPicker = false">取消</button>
          <button class="aw-btn primary" type="button" @click="confirmCustomer">确认</button>
        </div>
      </div>
    </div>
  </aw-form-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { afterSalesComplaintOptions, afterSalesHandlingMethods, afterSalesReasonOptions, afterSalesTypeCards, afterSalesTypeHandlingMap } from '@/app/api/after-sales/dictionaries';
import { createAfterSalesService } from '@/app/api/after-sales/resources';
import type { AfterSalesPriority, AfterSalesType, HandlingMethod } from '@/app/api/after-sales/types';
import AwFormPage from '@/components/form-page/AwFormPage.vue';
import AwRichTextEditor from '@/components/form-page/AwRichTextEditor.vue';
import type { FormAction } from '@/components/form-page/types';

interface CustomerRow {
  name: string;
  group: string;
  contact: string;
  phone: string;
  manager: string;
}

interface SourceRow {
  cat: '订单' | '项目' | '客户';
  code: string;
  subject: string;
  date: string;
  customer: string;
  contact: string;
  phone: string;
  manager: string;
  group: string;
  sourceOrder: string;
  sourceDelivery: string;
  sourceDetail: string;
  sourceReceivable: string;
  sourceInvoice: string;
  maxQty: string | number;
  maxRefund: string;
  deliveryDate?: string;
  deliveryStatus?: string;
  deliveryWarehouse?: string;
  deliveryLogistics?: string;
  selectedBatches?: SourceBatch[];
}

interface SourceBatch {
  deliveryNo: string;
  detailNo: string;
  deliveryDate: string;
  warehouse: string;
  logistics: string;
  qty: number;
  amount: string;
  status: string;
}

interface ProductRow {
  detail: string;
  code: string;
  name: string;
  model: string;
  materialType: string;
  category: string;
  spec: string;
  unit: string;
  qty: number;
  price: string;
  aftered: number;
}

const emit = defineEmits<{ back: []; created: [id: string] }>();

const flowSteps = ['选择客户', '选择类型', '选择来源', '问题证据', '提交'];
const reasonOptions = afterSalesReasonOptions;
const complaintOptions = afterSalesComplaintOptions;
const handlingMethods = afterSalesHandlingMethods;
const attachmentNames = ['问题照片.jpg', '物流签收凭证.pdf', '检测报告.xlsx'];
const formActions: FormAction[] = [{ key: 'submit', label: '提交', primary: true }];

const step = ref(0);
const source = ref<SourceRow | null>(null);
const subject = ref('');
const selectedType = ref<AfterSalesType>('维修处理');
const selectedHandlingMethod = ref<HandlingMethod>('维修');
const description = ref('');
const formMessage = ref('');
const showSourcePicker = ref(false);
const showCustomerPicker = ref(false);
const modalSourceCat = ref<'订单' | '项目'>('订单');
const modalPickedSource = ref<SourceRow | null>(null);
const pickedBatches = reactive<Record<string, boolean>>({});
const selectedCustomerName = ref('');
const contactIndex = ref(0);
const addressIndex = ref(0);
const selectedProductDetails = ref<string[]>([]);
const productEdits = reactive<Record<string, { quantity: number; reason: string; complaint: string }>>({});
const customer = reactive<CustomerRow>({ name: '', contact: '', phone: '', manager: '', group: '' });

const afterSalesTypes = afterSalesTypeCards;
const availableHandlingMethods = computed(() => afterSalesTypeHandlingMap[selectedType.value] || handlingMethods);

const customerRows: CustomerRow[] = [
  { name: '深圳市启明科技有限公司', group: '重点客户', contact: '老夏', phone: '13888888888', manager: '张国' },
  { name: '海南微为智造产业有限公司', group: '渠道客户', contact: '老夏', phone: '13888888888', manager: '老夏' },
  { name: '广州智造电子', group: '项目客户', contact: '李主管', phone: '13666666666', manager: '李文涛' },
  { name: '杭州云联技术', group: '长期客户', contact: '陈经理', phone: '13999999999', manager: '陈思源' },
];
const customerGroups = ['全部客户', '重点客户', '渠道客户', '项目客户', '长期客户'];
const sourceRows: SourceRow[] = [
  { cat: '订单', code: 'SO-20251221002', subject: '智能温控锅售后退货', date: '2025-05-01', customer: '海南微为智造产业有限公司', contact: '老夏', phone: '13888888888', manager: '老夏', group: '代理商', sourceOrder: 'SO-20251221002', sourceDelivery: 'DLV-20251222001', sourceDetail: 'DLV-20251222001-01', sourceReceivable: 'AR-20251222001', sourceInvoice: 'INV-20251224001', maxQty: '80', maxRefund: '28,000.00' },
  { cat: '项目', code: 'PRJ-2025-HN01', subject: '海南微为售后项目换货', date: '2025-05-04', customer: '海南微为智造产业有限公司', contact: '老夏', phone: '13888888888', manager: '老夏', group: '代理商', sourceOrder: 'SO-20251221002', sourceDelivery: 'DLV-20251222001', sourceDetail: 'DLV-20251222001-02', sourceReceivable: 'AR-20251222001', sourceInvoice: 'INV-20251224001', maxQty: '18', maxRefund: '6,300.00' },
  { cat: '订单', code: 'SO-20251221018', subject: '包装破损换货申请', date: '2025-05-03', customer: '深圳市启明科技有限公司', contact: '王芳', phone: '13700137003', manager: '张国', group: '重点客户', sourceOrder: 'SO-20251221018', sourceDelivery: 'DLV-20251223008', sourceDetail: 'DLV-20251223008-02', sourceReceivable: 'AR-20251223008', sourceInvoice: 'INV-20251225009', maxQty: '36', maxRefund: '12,600.00' },
  { cat: '项目', code: 'PRJ-2025-SZ01', subject: '启明项目售后换货', date: '2025-05-05', customer: '深圳市启明科技有限公司', contact: '王芳', phone: '13700137003', manager: '张国', group: '重点客户', sourceOrder: 'SO-20251221018', sourceDelivery: 'DLV-20251223008', sourceDetail: 'DLV-20251223008-03', sourceReceivable: 'AR-20251223008', sourceInvoice: 'INV-20251225009', maxQty: '10', maxRefund: '3,500.00' },
  { cat: '订单', code: 'SO-20251218006', subject: '客户批量退货诉求', date: '2025-05-06', customer: '广州智造电子', contact: '李主管', phone: '13666666666', manager: '李文涛', group: '项目客户', sourceOrder: 'SO-20251218006', sourceDelivery: 'DLV-20251219003', sourceDetail: 'DLV-20251219003-01', sourceReceivable: 'AR-20251219003', sourceInvoice: 'INV-20251221004', maxQty: '24', maxRefund: '9,800.00' },
  { cat: '项目', code: 'PRJ-2025-001', subject: '项目交付异常换货', date: '2025-05-08', customer: '杭州云联技术', contact: '陈经理', phone: '13999999999', manager: '陈思源', group: '长期客户', sourceOrder: 'SO-20251226001', sourceDelivery: 'DLV-20251227001', sourceDetail: 'DLV-20251227001-04', sourceReceivable: 'AR-20251227001', sourceInvoice: 'INV-20251228001', maxQty: '12', maxRefund: '6,400.00' },
];
const sourceBatches: Record<string, SourceBatch[]> = {
  'SO-20251221002': [
    { deliveryNo: 'DLV-20251222001', detailNo: 'DLV-20251222001-01', deliveryDate: '2025-05-01', warehouse: '成品仓-A', logistics: '顺丰 SF100200300', qty: 80, amount: '28,000.00', status: '已签收' },
    { deliveryNo: 'DLV-20251226006', detailNo: 'DLV-20251226006-01', deliveryDate: '2025-05-06', warehouse: '成品仓-B', logistics: '德邦 DP88912001', qty: 24, amount: '8,400.00', status: '运输中' },
  ],
  'PRJ-2025-HN01': [
    { deliveryNo: 'DLV-20251222001', detailNo: 'DLV-20251222001-02', deliveryDate: '2025-05-04', warehouse: '项目仓-A', logistics: '琼A12345', qty: 18, amount: '6,300.00', status: '已验收' },
    { deliveryNo: 'DLV-20251228002', detailNo: 'DLV-20251228002-01', deliveryDate: '2025-05-08', warehouse: '项目仓-B', logistics: '琼A56789', qty: 8, amount: '2,800.00', status: '待验收' },
  ],
  'SO-20251221018': [
    { deliveryNo: 'DLV-20251223008', detailNo: 'DLV-20251223008-02', deliveryDate: '2025-05-03', warehouse: '华南成品仓', logistics: '京东物流 JD8899001', qty: 36, amount: '12,600.00', status: '已签收' },
    { deliveryNo: 'DLV-20251225011', detailNo: 'DLV-20251225011-01', deliveryDate: '2025-05-05', warehouse: '华南成品仓', logistics: '顺丰 SF9988120', qty: 12, amount: '4,200.00', status: '已签收' },
  ],
  'PRJ-2025-SZ01': [
    { deliveryNo: 'DLV-20251223008', detailNo: 'DLV-20251223008-03', deliveryDate: '2025-05-05', warehouse: '项目仓-SZ', logistics: '粤B67231', qty: 10, amount: '3,500.00', status: '已验收' },
  ],
  'SO-20251218006': [
    { deliveryNo: 'DLV-20251219003', detailNo: 'DLV-20251219003-01', deliveryDate: '2025-05-06', warehouse: '广州成品仓', logistics: '跨越 KY20251219003', qty: 24, amount: '9,800.00', status: '已签收' },
  ],
  'PRJ-2025-001': [
    { deliveryNo: 'DLV-20251227001', detailNo: 'DLV-20251227001-04', deliveryDate: '2025-05-08', warehouse: '项目仓-HZ', logistics: '浙A91320', qty: 12, amount: '6,400.00', status: '已验收' },
  ],
};
const baseProducts = [
  ['WL0001', 'P2422H-S', '原料', '包装', '个', '100', '280.00', '100', '退换货', '退换货'],
  ['WL0002', 'P2422H-S', '成品', '标签', '包', '100', '280.00', '100', '退换货', '退换货'],
];

const hasCustomer = computed(() => !!customer.name);
const customerContacts = computed(() => hasCustomer.value ? [
  { contact: customer.contact || '默认联系人', phone: customer.phone || '', title: '默认联系人' },
  { contact: '售后负责人', phone: '13900001111', title: '售后负责人' },
  { contact: '仓库收货人', phone: '13700002222', title: '仓库收货人' },
] : []);
const customerAddresses = computed(() => hasCustomer.value ? [
  '海南省海口市龙华区华海路安海大厦',
  '海南省海口市美兰区滨海大道项目仓',
  '海南省澄迈县老城开发区智能制造园',
] : []);
const pickedContact = computed(() => customerContacts.value[contactIndex.value] || { contact: '', phone: '', title: '' });
const sourceFields = computed(() => source.value?.cat === '项目'
  ? [
      { label: '项目编号', key: 'code' },
      { label: '项目名称', key: 'subject' },
      { label: '关联订单号', key: 'sourceOrder' },
      { label: '发货/交付批次', key: 'sourceDelivery' },
      { label: '发货/交付日期', key: 'deliveryDate' },
      { label: '批次状态', key: 'deliveryStatus' },
      { label: '来源日期', key: 'date' },
    ]
  : [
      { label: '订单号', key: 'sourceOrder' },
      { label: '发货单号', key: 'sourceDelivery' },
      { label: '发货日期', key: 'deliveryDate' },
      { label: '发货状态', key: 'deliveryStatus' },
      { label: '客户', key: 'customer' },
      { label: '来源日期', key: 'date' },
    ]);
const sourceHint = computed(() => source.value?.cat === '项目'
  ? '项目来源会先带出项目编号、项目名称，再选择关联订单和发货/交付批次；可售后产品按项目交付明细生成。'
  : source.value?.cat === '订单'
    ? '订单来源会带出订单号，并继续选择该订单下的一次或多次发货单；可售后产品按所选发货明细生成。'
    : '请先选择来源。选择订单时带出订单号和发货单号；选择项目时带出项目编号、关联订单号和发货/交付批次。');
const filteredSourceRows = computed(() => sourceRows.filter((row) => customer.name && row.cat === modalSourceCat.value && row.customer === customer.name));
const modalBatches = computed(() => modalPickedSource.value ? (sourceBatches[modalPickedSource.value.code] || []) : []);
const productRows = computed(() => sourceProducts(source.value));
const previewProductRows = computed(() => {
  const selected = productRows.value.filter((row) => selectedProductDetails.value.includes(row.detail));
  return selected;
});
const previewDescription = computed(() => description.value || '客户反馈产品存在异常，需结合来源单据、产品明细、问题证据和沟通记录进行售后处理。本次提交内容用于售后指派前确认，后续处理人可继续补充执行动作和关闭信息。');
const typeTitle = computed(() => afterSalesTypes.find((item) => item.key === selectedType.value)?.title || selectedType.value);

function pickAfterSalesType(type: AfterSalesType) {
  selectedType.value = type;
  selectedHandlingMethod.value = (afterSalesTypeHandlingMap[type] || handlingMethods)[0];
}

function methodPreview(method: HandlingMethod) {
  const map: Record<HandlingMethod, string> = {
    退款退货: '退货入库 + 财务退款 + 应收/发票处理',
    仅退款: '财务退款 + 发票红冲',
    换货: '退货入库 + 换货出库',
    仅退货: '退货入库 + 应收调整',
    维修: '服务派工 + 必要配件出库',
    现场服务: '现场服务派工 + 必要配件出库',
  };
  return map[method];
}

function sourceValue(key: string) {
  return source.value ? String((source.value as Record<string, unknown>)[key] || '') : '选择来源后自动填充';
}

function goNextFromCustomer() {
  if (!hasCustomer.value) {
    formMessage.value = '请先选择客户。';
    return;
  }
  formMessage.value = '';
  step.value = 1;
}

function goNextFromSource() {
  if (!source.value) {
    formMessage.value = '请先选择来源。';
    return;
  }
  formMessage.value = '';
  step.value = 3;
}

function openSourcePicker() {
  if (!hasCustomer.value) {
    formMessage.value = '请先返回第一步选择客户，系统会按客户过滤相关订单和项目。';
    return;
  }
  modalSourceCat.value = '订单';
  modalPickedSource.value = null;
  clearPickedBatches();
  showSourcePicker.value = true;
}

function switchSourceCat(cat: string) {
  modalSourceCat.value = cat as '订单' | '项目';
  modalPickedSource.value = null;
  clearPickedBatches();
}

function pickModalSource(row: SourceRow) {
  modalPickedSource.value = row;
  clearPickedBatches();
}

function toggleBatch(detailNo: string) {
  pickedBatches[detailNo] = !pickedBatches[detailNo];
}

function clearPickedBatches() {
  Object.keys(pickedBatches).forEach((key) => delete pickedBatches[key]);
}

function confirmSource() {
  if (!modalPickedSource.value) return;
  const batches = modalBatches.value;
  const chosen = batches.filter((item) => pickedBatches[item.detailNo]);
  const selected = chosen.length ? chosen : batches.slice(0, 1);
  const qty = selected.reduce((sum, item) => sum + Number(item.qty || 0), 0);
  const first = selected[0];
  source.value = {
    ...modalPickedSource.value,
    sourceDelivery: selected.map((item) => item.deliveryNo).join('、') || modalPickedSource.value.sourceDelivery,
    sourceDetail: selected.map((item) => item.deliveryNo).join('、') || modalPickedSource.value.sourceDelivery,
    deliveryDate: selected.map((item) => item.deliveryDate).join('、') || modalPickedSource.value.date,
    deliveryStatus: selected.map((item) => `${item.deliveryNo} ${item.status}`).join('；'),
    deliveryWarehouse: selected.map((item) => item.warehouse).join('、'),
    deliveryLogistics: selected.map((item) => item.logistics).join('、'),
    maxQty: qty || modalPickedSource.value.maxQty,
    maxRefund: first?.amount || modalPickedSource.value.maxRefund,
    selectedBatches: selected,
  };
  subject.value = modalPickedSource.value.subject;
  customer.name = modalPickedSource.value.customer;
  customer.contact = modalPickedSource.value.contact;
  customer.phone = modalPickedSource.value.phone;
  customer.manager = modalPickedSource.value.manager;
  customer.group = modalPickedSource.value.group;
  contactIndex.value = 0;
  addressIndex.value = 0;
  resetProductSelection();
  showSourcePicker.value = false;
}

function confirmCustomer() {
  const picked = customerRows.find((row) => row.name === selectedCustomerName.value) || customerRows[0];
  customer.name = picked.name;
  customer.contact = picked.contact;
  customer.phone = picked.phone;
  customer.manager = picked.manager;
  customer.group = picked.group;
  source.value = null;
  subject.value = '';
  contactIndex.value = 0;
  addressIndex.value = 0;
  selectedProductDetails.value = [];
  showCustomerPicker.value = false;
}

function sourceProducts(current: SourceRow | null): ProductRow[] {
  if (!current) return [];
  const baseCode = current.sourceDetail || current.code || 'SRC-001';
  const detailPrefix = String(baseCode).replace(/-\d+$/, '');
  if (current.cat === '项目') {
    return [
      { code: 'PRD-P001', name: '项目交付控制柜', model: 'AW-CAB-900', materialType: '成品', category: '电控设备', spec: '900*600*2200', unit: '台', qty: 6, price: '18,500.00', aftered: 1 },
      { code: 'PRD-P002', name: '现场传感器组件', model: 'AW-SEN-12', materialType: '成品', category: '电子物料', spec: '12点套装', unit: '套', qty: 12, price: '1,260.00', aftered: 0 },
    ].map((item, index) => ({ ...item, detail: `${detailPrefix}-${String(index + 1).padStart(2, '0')}` }));
  }
  if (current.cat === '客户') {
    return [
      { code: 'CP-2025010101', name: '智能温控终端', model: 'PRO', materialType: '成品', category: '终端设备', spec: '标准版', unit: '台', qty: 24, price: '1,180.00', aftered: 2 },
      { code: 'CP-2025010102', name: '半成品模组', model: 'HM-450', materialType: '半成品', category: '电子模组', spec: '450型', unit: '件', qty: 36, price: '520.00', aftered: 4 },
    ].map((item, index) => ({ ...item, detail: `${detailPrefix}-${String(index + 1).padStart(2, '0')}` }));
  }
  return baseProducts.map((item, index) => ({
    detail: `${detailPrefix}-${String(index + 1).padStart(2, '0')}`,
    code: item[0],
    name: index === 0 ? '智能温控终端' : '包装标签套件',
    model: item[1],
    materialType: item[2],
    category: item[3],
    spec: index === 0 ? 'PRO 标准版' : '外箱标签',
    unit: item[4],
    qty: Number(item[5] || 0),
    price: item[6],
    aftered: 20,
  }));
}

function canQuantity(row: ProductRow) {
  return Math.max(0, Number(row.qty || 0) - Number(row.aftered || 0));
}

function defaultQuantity(row: ProductRow, index: number) {
  const available = canQuantity(row);
  if (available <= 0) return 0;
  return Math.max(1, Math.min(available, index === 0 ? 8 : 2));
}

function productEdit(detail: string) {
  if (!productEdits[detail]) {
    const index = productRows.value.findIndex((row) => row.detail === detail);
    const row = productRows.value[index];
    productEdits[detail] = { quantity: row ? defaultQuantity(row, index) : 1, reason: reasonOptions[0], complaint: complaintOptions[0] };
  }
  return productEdits[detail];
}

function resetProductSelection() {
  Object.keys(productEdits).forEach((key) => delete productEdits[key]);
  const rows = sourceProducts(source.value);
  const firstAvailable = rows.find((row) => canQuantity(row) > 0);
  selectedProductDetails.value = firstAvailable ? [firstAvailable.detail] : [];
  rows.forEach((row, index) => {
    productEdits[row.detail] = { quantity: defaultQuantity(row, index), reason: reasonOptions[0], complaint: complaintOptions[0] };
  });
}

function isProductPicked(detail: string) {
  return selectedProductDetails.value.includes(detail);
}

function toggleProduct(detail: string) {
  const row = productRows.value.find((item) => item.detail === detail);
  if (row && canQuantity(row) <= 0) return;
  selectedProductDetails.value = isProductPicked(detail)
    ? selectedProductDetails.value.filter((item) => item !== detail)
    : [...selectedProductDetails.value, detail];
}

function selectedValidRows() {
  return productRows.value.filter((row) => selectedProductDetails.value.includes(row.detail));
}

function validateSelectedProducts() {
  const selectedRows = selectedValidRows();
  if (!selectedRows.length) {
    formMessage.value = '请至少选择一行可售后的来源产品。';
    return false;
  }
  const invalid = selectedRows.find((row) => {
    const available = canQuantity(row);
    const quantity = Number(productEdit(row.detail).quantity || 0);
    return available <= 0 || !Number.isInteger(quantity) || quantity < 1 || quantity > available;
  });
  if (invalid) {
    const available = canQuantity(invalid);
    formMessage.value = `${invalid.detail} 本次售后数量必须为正整数，且不能超过可售后数量 ${available}。`;
    return false;
  }
  const overLimit = findOverLimitSourceLine(selectedRows);
  if (overLimit) {
    formMessage.value = `${overLimit.sourceLine} 聚合售后数量 ${overLimit.quantity} 超过可售后数量 ${overLimit.available}。`;
    return false;
  }
  formMessage.value = `已校验 ${selectedRows.length} 行产品，可售后数量满足提交条件。`;
  return true;
}

function goPreviewFromProducts() {
  if (validateSelectedProducts()) step.value = 4;
}

async function handleAction(key: string) {
  if (key !== 'submit') return;
  if (step.value !== 4) {
    step.value = 4;
    return;
  }
  await submitAfterSales();
}

async function submitAfterSales() {
  if (!customer.name || !source.value) {
    formMessage.value = '请先选择客户和来源。';
    return;
  }
  if (!validateSelectedProducts()) return;
  const selectedRows = selectedValidRows();
  const firstLine = selectedRows[0];
  const firstEdit = productEdit(firstLine.detail);
  const service = await createAfterSalesService({
    customerName: customer.name,
    contactName: pickedContact.value.contact,
    address: customerAddresses.value[addressIndex.value] || '',
    afterSalesType: selectedType.value,
    handlingMethod: selectedHandlingMethod.value,
    sourceOrder: source.value.sourceOrder,
    sourceDelivery: source.value.sourceDelivery,
    sourceLine: source.value.sourceDetail,
    reason: firstEdit.reason,
    complaint: firstEdit.complaint,
    quantity: Number(firstEdit.quantity || 1),
    description: description.value || '客户反馈产品存在异常，需结合来源单据、产品明细、问题证据和沟通记录进行售后处理。',
    ownerName: customer.manager || '售后主管',
    priority: '高' as AfterSalesPriority,
    sourceReceivable: isRefundHandlingMethod(selectedHandlingMethod.value) ? parseAmount(source.value.maxRefund) : 0,
    sourceInvoice: source.value.sourceInvoice,
    attachments: [...attachmentNames],
    lines: selectedRows.map((row) => {
      const edit = productEdit(row.detail);
      return {
        productCode: row.code,
        productName: row.name,
        spec: row.spec,
        sourceLine: row.detail,
        quantity: Number(edit.quantity || 1),
        availableQuantity: canQuantity(row),
        refundableAmount: isRefundHandlingMethod(selectedHandlingMethod.value) ? Number(edit.quantity || 1) * parseAmount(row.price) : 0,
        reason: edit.reason,
        complaint: edit.complaint,
      };
    }),
  });
  emit('created', service.id);
}

function parseAmount(value: string | number) {
  if (typeof value === 'number') return value;
  return Number(String(value).replace(/,/g, '')) || 0;
}

function isRefundHandlingMethod(method: HandlingMethod) {
  return method === '退款退货' || method === '仅退款';
}

function findOverLimitSourceLine(rows: ProductRow[]) {
  const totals = new Map<string, { sourceLine: string; quantity: number; available: number }>();
  rows.forEach((row) => {
    const edit = productEdit(row.detail);
    const current = totals.get(row.detail) || { sourceLine: row.detail, quantity: 0, available: canQuantity(row) };
    current.quantity += Number(edit.quantity || 0);
    current.available = Math.min(current.available, canQuantity(row));
    totals.set(row.detail, current);
  });
  return Array.from(totals.values()).find((item) => item.quantity > item.available);
}
</script>

<style scoped>
.aw-as-flow-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.aw-doc-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px 18px;
}

.aw-as-stepper {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.aw-as-step {
  height: 42px;
  border: 1px solid var(--aw-border);
  border-radius: 6px;
  background: #fff;
  color: var(--aw-fg-2);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
}

.aw-as-step span {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--aw-surface-2);
  color: var(--aw-fg-3);
  font-size: 12px;
}

.aw-as-step.on {
  border-color: var(--aw-primary);
  background: var(--aw-primary-soft);
  color: var(--aw-primary);
  font-weight: 600;
}

.aw-as-step.on span,
.aw-as-step.done span {
  background: var(--aw-primary);
  color: #fff;
}

.aw-as-type-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.as-sub-section-title {
  margin-top: 18px;
}

.aw-as-type-card {
  min-height: 118px;
  border: 1px solid var(--aw-border);
  border-radius: 7px;
  background: #fff;
  padding: 14px;
  text-align: left;
  color: var(--aw-fg-2);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.aw-as-method-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.aw-as-method-card {
  min-height: 74px;
  border: 1px solid var(--aw-border);
  border-radius: 7px;
  background: #fff;
  padding: 12px;
  text-align: left;
  color: var(--aw-fg-2);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.aw-as-method-card strong {
  color: var(--aw-fg-1);
}

.aw-as-method-card span {
  font-size: 12px;
  line-height: 1.5;
  color: var(--aw-fg-3);
}

.aw-as-method-card.on {
  border-color: var(--aw-primary);
  box-shadow: 0 0 0 2px var(--aw-primary-soft);
}

.aw-as-type-card strong {
  font-size: 15px;
}

.aw-as-type-card span {
  font-size: 12px;
  line-height: 1.6;
  color: var(--aw-fg-3);
}

.aw-as-type-card em {
  margin-top: auto;
  font-style: normal;
  font-size: 12px;
  color: var(--aw-primary);
}

.aw-as-type-card.on {
  border-color: var(--aw-primary);
  box-shadow: 0 0 0 2px var(--aw-primary-soft);
}

.aw-as-empty-note {
  margin-top: 12px;
  border: 1px dashed var(--aw-border-strong);
  border-radius: 7px;
  background: var(--aw-surface-2);
  padding: 12px 14px;
  color: var(--aw-fg-3);
  font-size: 13px;
}

.aw-as-upload-only {
  max-width: 640px;
}

.aw-as-upload-box {
  min-height: 128px;
  border: 1px dashed var(--aw-border-strong);
  border-radius: 8px;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--aw-fg-3);
  font-size: 12px;
  line-height: 1.7;
  padding: 22px;
}

.as-step-actions {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 14px;
}

.as-step-actions.right {
  justify-content: flex-end;
}

.as-product-tip {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 12px;
}

.as-product-tip span,
.as-source-current,
.as-source-note {
  font-size: 12px;
  color: var(--aw-fg-3);
}

.as-qty-input {
  width: 82px;
}

.aw-empty,
.as-empty-cell {
  padding: 28px 12px;
  color: var(--aw-fg-3);
  text-align: center;
}

.as-kv {
  display: flex;
  gap: 14px;
  min-width: 0;
}

.as-kv span:first-child {
  width: 96px;
  color: var(--aw-fg-3);
  flex: none;
}

.as-kv strong {
  min-width: 0;
  color: var(--aw-fg-1);
  font-weight: 500;
}

.as-readonly-detail {
  border: 1px solid var(--aw-border);
  border-radius: 8px;
  min-height: 120px;
  padding: 14px;
  line-height: 1.8;
  color: var(--aw-fg-2);
  background: var(--aw-surface);
}

.as-attachment-preview {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.as-attachment-card {
  border: 1px solid var(--aw-border);
  border-radius: 8px;
  padding: 12px 14px;
  background: var(--aw-surface-2);
  color: var(--aw-fg-2);
}

.as-source-picker-body {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  padding: 0;
  min-height: 430px;
}

.as-source-side {
  border-right: 1px solid var(--aw-divider);
  padding: 12px;
  background: var(--aw-surface-2);
}

.as-source-main {
  padding: 16px;
  overflow: auto;
}

.as-source-current {
  margin-bottom: 12px;
}

.as-batch-panel {
  margin-top: 16px;
}

.as-batch-panel .section-title {
  margin-bottom: 10px;
}

.as-source-note {
  margin-top: 8px;
}

.as-customer-picker-body {
  display: grid;
  grid-template-columns: 170px 1fr;
  gap: 14px;
  min-height: 330px;
}

.as-customer-picker-body .aw-doc-tree {
  min-height: 330px;
}

.as-customer-search {
  margin-bottom: 12px;
}

.as-click-row {
  cursor: pointer;
}

.as-product-table {
  min-width: 1180px;
}

@media (max-width: 980px) {
  .aw-doc-grid,
  .aw-as-stepper,
  .aw-as-type-grid,
  .aw-as-method-grid,
  .as-attachment-preview,
  .as-source-picker-body,
  .as-customer-picker-body {
    grid-template-columns: 1fr;
  }
}
</style>
