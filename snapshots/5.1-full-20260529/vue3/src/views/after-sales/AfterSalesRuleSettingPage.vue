<template>
  <aw-setting-page>
    <template #toolbar>
      <aw-setting-toolbar
        :back-text="`返回${scopeTitle}`"
        add-text="后续接入"
        :show-add="false"
        @back="goBack"
        @refresh="showMessage"
      />
    </template>

    <section class="aw-form-card as-rule-setting">
      <div class="aw-detail-section-title">{{ settingTitle }}</div>
      <p>{{ scopeTitle }}的字段、编号、审批、策略和打印模板属于售后设置第二阶段，当前先保留入口展示，后续按公共设置组件接入。</p>

      <div class="as-rule-grid">
        <div v-for="item in settingCards" :key="item.key" :class="['as-rule-card', { on: item.key === currentKey }]">
          <strong>{{ item.title }}</strong>
          <span>{{ item.desc }}</span>
        </div>
      </div>

      <div v-if="message" class="as-rule-message">{{ message }}</div>
    </section>
  </aw-setting-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AwSettingPage from '@/components/setting-page/AwSettingPage.vue';
import AwSettingToolbar from '@/components/setting-page/AwSettingToolbar.vue';

const props = withDefaults(defineProps<{
  scopeTitle: string;
  backPath: string;
}>(), {
  scopeTitle: '任务',
  backPath: '/after-sales/tasks',
});

const route = useRoute();
const router = useRouter();
const message = ref('');
const settingCards = [
  { key: 'fields', title: '自定义字段', desc: '后续接 AwFieldSettingPage，管理列表、详情和表单扩展字段。' },
  { key: 'numbers', title: '自定义编号', desc: '后续接编号规则，控制单号前缀、流水和重置周期。' },
  { key: 'approvals', title: '审批设置', desc: '后续接审批流，控制提交、关闭、退款和质量升级审批。' },
  { key: 'strategies', title: '策略设置', desc: '后续接策略规则，控制 SLA、派单、关闭和质量联动。' },
  { key: 'print', title: '打印模板', desc: '后续接打印模板，支持任务单、质量改进单和内部流转单。' },
];
const currentKey = computed(() => String(route.query.setting || 'fields'));
const settingTitle = computed(() => {
  const item = settingCards.find((card) => card.key === currentKey.value) || settingCards[0];
  return `${props.scopeTitle}${item.title}`;
});

function goBack() {
  router.push(props.backPath);
}

function showMessage() {
  message.value = `${settingTitle.value}入口已保留，当前阶段仅展示。`;
}
</script>

<style scoped>
.as-rule-setting {
  margin: 12px;
}

.as-rule-setting p {
  margin: 6px 0 16px;
  color: var(--aw-fg-3);
  line-height: 1.7;
}

.as-rule-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.as-rule-card {
  border: 1px solid var(--aw-border);
  border-radius: 7px;
  background: #fff;
  padding: 14px;
  min-height: 96px;
}

.as-rule-card.on {
  border-color: var(--aw-primary);
  box-shadow: 0 0 0 2px var(--aw-primary-soft);
}

.as-rule-card strong,
.as-rule-card span {
  display: block;
}

.as-rule-card span {
  margin-top: 8px;
  color: var(--aw-fg-3);
  font-size: 12px;
  line-height: 1.7;
}

.as-rule-message {
  margin-top: 12px;
  border: 1px solid var(--aw-border);
  border-radius: 6px;
  background: var(--aw-surface-2);
  padding: 9px 12px;
  color: var(--aw-fg-2);
}
</style>
