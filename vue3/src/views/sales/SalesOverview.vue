<template>
  <page-shell title="销售中心" description="先迁移客户、计划、报价、合同、订单五类完整页面。">
    <a-row :gutter="16">
      <a-col v-for="item in modules" :key="item.path" :xs="24" :md="12" :xl="8">
        <a-card class="module-card" :bordered="false" @click="router.push(item.path)">
          <a-space direction="vertical" size="small">
            <a-tag :color="item.color">{{ item.status }}</a-tag>
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
          </a-space>
        </a-card>
      </a-col>
    </a-row>
  </page-shell>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import PageShell from '@/components/page-shell/PageShell.vue';

const router = useRouter();

const modules = [
  { title: '客户管理', path: '/sales/customers', status: '完整', color: 'green', description: '客户档案、联系人、地址、信用额度' },
  { title: '销售计划', path: '/sales/sales-plans', status: '完整', color: 'green', description: '计划周期、目标金额、达成率' },
  { title: '报价管理', path: '/sales/sales-quotes', status: '完整', color: 'green', description: '报价、价格版本、转化记录' },
  { title: '合同管理', path: '/sales/sales-contracts', status: '完整', color: 'green', description: '合同、履约、开票与回款' },
  { title: '订单管理', path: '/sales/sales-orders', status: '完整', color: 'green', description: '订单、信用校验、发货进展' },
  { title: '退换货与报表', path: '/sales', status: '预留', color: 'default', description: '按契约保留接口和菜单扩展点' },
];
</script>
