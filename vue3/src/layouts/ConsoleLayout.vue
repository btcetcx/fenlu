<template>
  <a-layout class="console-layout">
    <a-layout-sider v-model:collapsed="app.collapsed" collapsible :width="232">
      <div class="brand">
        <div class="brand-mark">A</div>
        <span v-if="!app.collapsed">海南傲为 ERP</span>
      </div>
      <a-menu
        theme="dark"
        mode="inline"
        :selected-keys="[route.path]"
        :open-keys="openKeys"
        @click="handleMenuClick"
      >
        <a-sub-menu v-for="center in contractCenters" :key="center.basePath">
          <template #title>
            <span>{{ center.title }}</span>
          </template>
          <a-menu-item :key="center.basePath">{{ center.title }}总览</a-menu-item>
          <a-menu-item v-for="resource in center.resources" :key="resource.path">
            {{ resource.title }}
          </a-menu-item>
        </a-sub-menu>
      </a-menu>
    </a-layout-sider>

    <a-layout>
      <a-layout-header class="topbar">
        <div>
          <h1>{{ route.meta.title || '工作台' }}</h1>
          <p>Vue 3 + Vite + Ant Design Vue 迁移工程</p>
        </div>
        <a-space>
          <a-tag color="blue">Mock</a-tag>
          <a-button>接口契约</a-button>
        </a-space>
      </a-layout-header>

      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { contractCenters } from '@/app/contracts/modules';
import { useAppStore } from '@/app/store/app';

const route = useRoute();
const router = useRouter();
const app = useAppStore();
const openKeys = computed(() => contractCenters.map((center) => center.basePath));

function handleMenuClick({ key }: { key: string }) {
  router.push(key);
}
</script>
