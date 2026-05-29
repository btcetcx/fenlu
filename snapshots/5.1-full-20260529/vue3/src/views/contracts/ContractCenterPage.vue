<template>
  <page-shell :title="center?.title || '契约中心'" description="仅展示已有接口契约的模块；无契约模块暂不进入迁移范围。">
    <a-row :gutter="16">
      <a-col v-for="resource in center?.resources" :key="resource.path" :xs="24" :md="12" :xl="8">
        <a-card class="module-card" :bordered="false" @click="router.push(resource.path)">
          <a-space direction="vertical" size="small">
            <a-tag :color="resource.status === '预留' ? 'default' : 'green'">{{ resource.status }}</a-tag>
            <h3>{{ resource.title }}</h3>
            <p>{{ resource.description }}</p>
            <a-typography-text type="secondary">{{ resource.apiPath }}</a-typography-text>
          </a-space>
        </a-card>
      </a-col>
    </a-row>
  </page-shell>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PageShell from '@/components/page-shell/PageShell.vue';
import { contractCenters } from '@/app/contracts/modules';

const route = useRoute();
const router = useRouter();
const center = computed(() => contractCenters.find((item) => route.path.startsWith(item.basePath)));
</script>
