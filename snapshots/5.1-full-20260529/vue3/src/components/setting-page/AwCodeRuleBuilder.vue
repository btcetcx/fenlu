<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { CodeRuleCandidate } from './types';

const props = withDefaults(defineProps<{
  candidates: CodeRuleCandidate[];
  prefix?: string;
  separator?: string;
  selected?: string[];
  maxItems?: number;
}>(), {
  prefix: 'AA',
  separator: '-',
  selected: () => [],
  maxItems: 5,
});

const emit = defineEmits<{
  (event: 'update:prefix', value: string): void;
  (event: 'update:separator', value: string): void;
  (event: 'update:selected', value: string[]): void;
  (event: 'reset'): void;
  (event: 'save'): void;
}>();

const dragIndex = ref<number | null>(null);
const searchFlags = ref<Record<string, boolean>>({});
const customLabels = ref<Record<string, string>>({});
const customValues = ref<Record<string, string>>({});
const picked = computed(() => props.selected);
const candidateMap = computed(() => Object.fromEntries(props.candidates.map((item) => [item.key, item])));
const normalCandidates = computed(() => props.candidates.filter((item) => !item.fixed && !item.editable));
const customCandidates = computed(() => props.candidates.filter((item) => item.editable));
const previewValue = (key: string) => customValues.value[key] || candidateMap.value[key]?.preview || '';
const previewRest = computed(() => picked.value.map((key) => previewValue(key)).join(props.separator));

function toggle(key: string) {
  const item = candidateMap.value[key];
  if (!item || item.fixed) return;
  if (picked.value.includes(key)) {
    remove(key);
    return;
  }
  if (picked.value.length >= props.maxItems - 1) return;
  const next = item.group ? picked.value.filter((itemKey) => candidateMap.value[itemKey]?.group !== item.group) : [...picked.value];
  emit('update:selected', [...next, key]);
}

function remove(key: string) {
  emit('update:selected', picked.value.filter((itemKey) => itemKey !== key));
  delete searchFlags.value[key];
  if (candidateMap.value[key]?.editable) {
    customLabels.value = { ...customLabels.value, [key]: candidateMap.value[key]?.label || '' };
    customValues.value = { ...customValues.value, [key]: candidateMap.value[key]?.preview || '' };
  }
}

function labelValue(key: string) {
  return customLabels.value[key] || candidateMap.value[key]?.label || '';
}

function updateCustomLabel(key: string, value: string) {
  customLabels.value = { ...customLabels.value, [key]: value };
}

function updateCustomValue(key: string, value: string) {
  customValues.value = { ...customValues.value, [key]: value };
}

function drop(index: number) {
  if (dragIndex.value === null || dragIndex.value === index) return;
  const next = [...picked.value];
  const [moved] = next.splice(dragIndex.value, 1);
  next.splice(index, 0, moved);
  dragIndex.value = null;
  emit('update:selected', next);
}

function resetLocalState() {
  searchFlags.value = {};
  customLabels.value = Object.fromEntries(customCandidates.value.map((item) => [item.key, item.label]));
  customValues.value = Object.fromEntries(customCandidates.value.map((item) => [item.key, item.preview]));
  emit('reset');
}

watch(() => props.selected, () => {
  dragIndex.value = null;
});

watch(() => props.candidates, () => {
  const nextLabels: Record<string, string> = {};
  const nextValues: Record<string, string> = {};
  props.candidates.forEach((item) => {
    if (!item.editable) return;
    nextLabels[item.key] = customLabels.value[item.key] || item.label;
    nextValues[item.key] = customValues.value[item.key] || item.preview;
  });
  customLabels.value = nextLabels;
  customValues.value = nextValues;
}, { immediate: true });
</script>

<template>
  <section class="aw-code-builder">
    <section class="aw-form-card aw-code-preview-card">
      <div class="aw-code-preview-hero">
        <div class="aw-barcode" aria-hidden="true"></div>
        <div>
          <span>当前格式：</span>
          <strong>
            <span class="aw-code-preview-prefix">{{ prefix }}{{ previewRest ? separator : '' }}</span><span v-if="previewRest" class="aw-code-preview-items">{{ previewRest }}</span>
          </strong>
        </div>
      </div>
      <div class="aw-code-picked-head">
        <strong>已选编号项</strong>
        <span>{{ picked.length + 1 }} / {{ maxItems }}</span>
      </div>
      <div class="aw-code-picked fixed">
        <span class="aw-line-icon line-lock"></span>
        <strong>前缀</strong>
        <input :value="prefix" @input="emit('update:prefix', ($event.target as HTMLInputElement).value)" />
        <label class="aw-switch-line mini"><em>搜索项</em><input v-model="searchFlags.prefix" type="checkbox" /><i></i></label>
      </div>
      <div v-if="!picked.length" class="aw-code-empty">暂未选择编号项</div>
      <div
        v-for="(key, index) in picked"
        :key="key"
        class="aw-code-picked"
        draggable="true"
        @dragstart="dragIndex = index"
        @dragover.prevent
        @drop="drop(index)"
      >
        <span class="aw-code-drag">⠿</span>
        <strong>{{ labelValue(key) }}</strong>
        <template v-if="candidateMap[key]?.editable">
          <input :value="labelValue(key)" @input="updateCustomLabel(key, ($event.target as HTMLInputElement).value)" />
          <input :value="previewValue(key)" @input="updateCustomValue(key, ($event.target as HTMLInputElement).value)" />
        </template>
        <label class="aw-switch-line mini"><em>搜索项</em><input v-model="searchFlags[key]" type="checkbox" /><i></i></label>
        <button type="button" @click="remove(key)">×</button>
      </div>
    </section>
    <section class="aw-form-card aw-code-config-card">
      <div class="aw-code-rule-grid">
        <label class="aw-field"><span><b>*</b>规则名称</span><input placeholder="填写编号规则名称" /></label>
        <label class="aw-field"><span><b>*</b>规则编码</span><input placeholder="填写编号规则编码" /></label>
        <label class="aw-field"><span>间隔符</span><input :value="separator" @input="emit('update:separator', ($event.target as HTMLInputElement).value)" /></label>
      </div>
      <div class="aw-divider-line"></div>
      <div class="aw-detail-section-title">编号项</div>
      <p class="aw-setting-note">前缀固定占 1 个名额，其余最多选择 {{ maxItems - 1 }} 项</p>
      <div class="aw-code-candidates">
        <button
          v-for="item in candidates.filter((candidate) => candidate.fixed)"
          :key="item.key"
          :class="['aw-code-card', { fixed: item.fixed }]"
          :disabled="item.fixed || (picked.length >= maxItems - 1 && !picked.includes(item.key))"
          type="button"
          @click="toggle(item.key)"
        >
          <em>1</em>
          <strong>{{ item.label }}</strong>
          <span>预览值：{{ prefix }}</span>
          <i class="aw-line-icon line-lock"></i>
        </button>
        <button
          v-for="item in normalCandidates"
          :key="item.key"
          :class="['aw-code-card', { on: picked.includes(item.key) }]"
          :disabled="picked.length >= maxItems - 1 && !picked.includes(item.key)"
          type="button"
          @click="toggle(item.key)"
        >
          <em v-if="picked.includes(item.key)">{{ picked.indexOf(item.key) + 2 }}</em>
          <strong>{{ item.label }}</strong>
          <span>{{ item.preview }}</span>
        </button>
      </div>
      <div v-if="customCandidates.length" class="aw-divider-line"></div>
      <div v-if="customCandidates.length" class="aw-setting-note">扩展项</div>
      <div v-if="customCandidates.length" class="aw-code-candidates">
        <button
          v-for="item in customCandidates"
          :key="item.key"
          :class="['aw-code-card', { on: picked.includes(item.key) }]"
          :disabled="picked.length >= maxItems - 1 && !picked.includes(item.key)"
          type="button"
          @click="toggle(item.key)"
        >
          <em v-if="picked.includes(item.key)">{{ picked.indexOf(item.key) + 2 }}</em>
          <strong>{{ labelValue(item.key) }}</strong>
          <span>{{ previewValue(item.key) }}</span>
        </button>
      </div>
    </section>
    <div class="aw-code-footer">
      <button class="aw-tool-btn" type="button" @click="resetLocalState">重置</button>
      <button class="aw-btn primary" type="button" @click="emit('save')">保存</button>
    </div>
  </section>
</template>
