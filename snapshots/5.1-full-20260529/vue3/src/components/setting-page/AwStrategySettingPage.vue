<script setup lang="ts">
import { computed, ref } from 'vue';
import type { StrategyRule, StrategyTab } from './types';

const props = defineProps<{
  title: string;
  description?: string;
  tabs: StrategyTab[];
}>();

const emit = defineEmits<{
  (event: 'update-rule', tabKey: string, rule: StrategyRule): void;
  (event: 'reset'): void;
  (event: 'save'): void;
}>();

const activeTab = ref(props.tabs[0]?.key || '');
const current = computed(() => props.tabs.find((tab) => tab.key === activeTab.value) || props.tabs[0]);
</script>

<template>
  <section class="aw-form-card aw-policy-card">
    <div class="aw-policy-head">
      <strong>{{ title }}</strong>
      <span>{{ description }}</span>
    </div>
    <div class="aw-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['t', { on: activeTab === tab.key }]"
        type="button"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="aw-policy-list">
      <div v-for="row in current?.rows || []" :key="row.key" class="aw-policy-row">
        <div>
          <div class="aw-policy-row-title">{{ row.title }}</div>
          <div class="aw-policy-row-sub">{{ row.sub }}</div>
        </div>
        <div class="aw-policy-row-control">
          <select
            v-if="row.type === 'select'"
            :value="row.value"
            class="aw-select"
            @change="emit('update-rule', current?.key || '', { ...row, value: ($event.target as HTMLSelectElement).value })"
          >
            <option v-for="option in row.options || []" :key="option">{{ option }}</option>
          </select>
          <div v-else class="aw-policy-radio">
            <label
              :class="['aw-radio', { on: row.enabled !== false }]"
              @click="emit('update-rule', current?.key || '', { ...row, enabled: true })"
            >
              <span class="aw-dot"></span>启用
            </label>
            <label
              :class="['aw-radio', { on: row.enabled === false }]"
              @click="emit('update-rule', current?.key || '', { ...row, enabled: false })"
            >
              <span class="aw-dot"></span>关闭
            </label>
          </div>
        </div>
      </div>
    </div>
    <div class="aw-policy-foot">
      <button class="aw-tool-btn" type="button" @click="emit('reset')">重置默认</button>
      <button class="aw-btn primary" type="button" @click="emit('save')">保存</button>
    </div>
  </section>
</template>
