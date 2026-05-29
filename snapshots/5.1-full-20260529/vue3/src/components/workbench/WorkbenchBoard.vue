<template>
  <div class="aw-workbench-board">
    <div class="aw-card">
      <div class="section-title">
        <span>待办事项</span>
        <button class="aw-card-meta aw-card-meta-btn" type="button" :class="{ refreshing }" @click="refreshTodos">
          <span class="aw-refresh-dot">↻</span>
          刷新
        </button>
        <button class="aw-card-meta aw-card-meta-btn" type="button" @click="todoModalOpen = true">全部</button>
        <button class="aw-card-meta aw-card-meta-btn" type="button" @click="expanded = !expanded">
          {{ expanded ? '收起' : '展开' }}
        </button>
      </div>
      <div class="aw-kpi-grid">
        <workbench-kpi
          v-for="(item, index) in visibleKpis"
          :key="item.label"
          class="aw-draggable-card"
          draggable="true"
          :tone="kpiTone(item.tone)"
          :label="item.label"
          :value="item.value"
          :icon="item.icon"
          @dragstart="handleDragStart('kpis', index)"
          @dragover.prevent
          @drop="handleDrop('kpis', index)"
        />
      </div>
    </div>

    <div class="aw-card">
      <div class="section-title">
        <span>业务导航</span>
        <span class="aw-card-meta">拖动卡片</span>
        <span class="aw-card-meta">调整顺序</span>
      </div>
      <div class="aw-tile-grid">
        <workbench-tile
          v-for="(item, index) in tiles"
          :key="item.label"
          class="aw-draggable-card"
          draggable="true"
          :label="item.label"
          :sub="item.sub"
          :count="item.count"
          :tint="item.tint"
          :color="item.color"
          :icon="item.icon"
          @dragstart="handleDragStart('tiles', index)"
          @dragover.prevent
          @drop="handleDrop('tiles', index)"
        />
      </div>
    </div>

    <div class="aw-card">
      <div class="section-title">
        <span>便捷入口</span>
        <span class="aw-card-meta">拖动卡片</span>
        <span class="aw-card-meta">调整顺序</span>
      </div>
      <div class="aw-entry-grid">
        <div
          v-for="(entry, index) in entries"
          :key="entry.label"
          class="aw-entry aw-draggable-card"
          draggable="true"
          @dragstart="handleDragStart('entries', index)"
          @dragover.prevent
          @drop="handleDrop('entries', index)"
        >
          <div class="aw-entry-icon" :style="{ background: entry.tint, color: entry.color }">{{ entry.icon }}</div>
          <div class="aw-entry-label">{{ entry.label }}</div>
        </div>
        <div class="aw-entry aw-entry-add">
          <div class="aw-entry-icon">+</div>
          <div class="aw-entry-label">新增入口</div>
        </div>
      </div>
    </div>

    <div class="aw-workbench-feed-grid">
      <div class="aw-card">
        <div class="section-title">
          <span>公告 / 消息中心</span>
          <span class="aw-card-meta">全部</span>
          <span class="aw-card-meta">重要</span>
        </div>
        <div class="aw-feed">
          <div v-for="item in notices.slice(0, 5)" :key="item.text" class="aw-feed-row">
            <span class="aw-feed-tag" :class="item.tone">{{ item.type }}</span>
            <span class="aw-feed-text">{{ item.text }}</span>
            <span class="aw-feed-time">{{ item.time }}</span>
          </div>
        </div>
      </div>
      <div class="aw-card">
        <div class="section-title">
          <span>最近访问</span>
          <span class="aw-card-meta">查看全部</span>
        </div>
        <div v-for="item in recent.slice(0, 5)" :key="item.title" class="aw-recent-row">
          <span class="aw-recent-ic">▣</span>
          <div>
            <b>{{ item.title }} <em>{{ item.meta }}</em></b>
          </div>
        </div>
      </div>
    </div>

    <div v-if="todoModalOpen" class="aw-mask" @click="todoModalOpen = false">
      <div class="aw-modal lg" @click.stop>
        <div class="head">
          <span class="aw-modal-title">全部待办事项<span class="aw-modal-sub">{{ kpis.length }} 项待处理</span></span>
          <button class="aw-modal-close" type="button" @click="todoModalOpen = false">×</button>
        </div>
        <div class="body">
          <div class="aw-todo-list">
            <div v-for="item in kpis" :key="item.label" class="aw-todo-row">
              <div class="aw-todo-ic">{{ item.icon }}</div>
              <div class="aw-todo-main">
              <div class="aw-todo-title">{{ item.label }} <span class="aw-todo-code">{{ centerTitle }}</span></div>
                <div class="aw-todo-meta">共 {{ item.value }} 条待处理记录，可进入对应模块查看</div>
              </div>
              <strong>{{ item.value }}</strong>
              <button class="aw-btn mini" type="button">查看</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { salesWorkbench } from './salesWorkbench';
import WorkbenchKpi from './WorkbenchKpi.vue';
import WorkbenchTile from './WorkbenchTile.vue';

type KpiTone = 'mint' | 'peach' | 'sky' | 'rose' | 'lilac' | 'sand';
type KpiItem = { tone: string; label: string; value: number; icon: string };
type TileItem = { label: string; sub: string; count: number; tint: string; color: string; icon: string };
type EntryItem = { label: string; tint: string; color: string; icon: string };
type FeedItem = { type: string; text: string; time: string; tone: string };
type RecentItem = { title: string; meta: string };
type WorkbenchData = {
  kpis: KpiItem[];
  tiles: TileItem[];
  entries: EntryItem[];
  notices: FeedItem[];
  recent: RecentItem[];
};

const props = withDefaults(defineProps<{
  data?: WorkbenchData;
  centerTitle?: string;
}>(), {
  data: () => salesWorkbench as WorkbenchData,
  centerTitle: '销售中心',
});

const kpis = reactive<KpiItem[]>([]);
const expanded = ref(false);
const refreshing = ref(false);
const todoModalOpen = ref(false);
const visibleKpis = computed(() => (expanded.value ? kpis : kpis.slice(0, 7)));
const tiles = reactive<TileItem[]>([]);
const entries = reactive<EntryItem[]>([]);
const notices = computed(() => props.data.notices);
const recent = computed(() => props.data.recent);

type DragGroup = 'kpis' | 'tiles' | 'entries';
const dragState = ref<{ group: DragGroup; index: number }>();

function handleDragStart(group: DragGroup, index: number) {
  dragState.value = { group, index };
}

function handleDrop(group: DragGroup, targetIndex: number) {
  const current = dragState.value;
  if (!current || current.group !== group || current.index === targetIndex) return;

  if (group === 'kpis') {
    const [moving] = kpis.splice(current.index, 1);
    kpis.splice(targetIndex, 0, moving);
  }
  if (group === 'tiles') {
    const [moving] = tiles.splice(current.index, 1);
    tiles.splice(targetIndex, 0, moving);
  }
  if (group === 'entries') {
    const [moving] = entries.splice(current.index, 1);
    entries.splice(targetIndex, 0, moving);
  }
  dragState.value = undefined;
}

function refreshTodos() {
  if (refreshing.value) return;
  refreshing.value = true;
  window.setTimeout(() => {
    refreshing.value = false;
  }, 900);
}

function kpiTone(tone: string): KpiTone {
  return ['mint', 'peach', 'sky', 'rose', 'lilac', 'sand'].includes(tone) ? tone as KpiTone : 'sky';
}

watch(
  () => props.data,
  (data) => {
    kpis.splice(0, kpis.length, ...data.kpis);
    tiles.splice(0, tiles.length, ...data.tiles);
    entries.splice(0, entries.length, ...data.entries);
  },
  { immediate: true },
);
</script>
