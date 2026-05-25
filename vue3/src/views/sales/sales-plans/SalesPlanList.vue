<template>
  <simple-sales-list
    title="销售计划"
    description="计划名称、计划周期、目标金额、完成金额、达成率。"
    :loader="listSalesPlans"
    :columns="columns"
  />
</template>

<script setup lang="ts">
import type { TableColumnsType } from 'ant-design-vue';
import SimpleSalesList from '../shared/SimpleSalesList.vue';
import { listSalesPlans } from '@/app/api/sales/resources';
import type { SalesPlan } from '@/app/api/sales/types';

const columns: TableColumnsType<SalesPlan> = [
  { title: '计划名称', dataIndex: 'name', key: 'name' },
  { title: '计划编号', dataIndex: 'code', key: 'code', width: 150 },
  { title: '计划产品', dataIndex: 'productSummary', key: 'productSummary' },
  { title: '计划周期', key: 'cycle', customRender: ({ record }) => `${record.cycleStart} 至 ${record.cycleEnd}` },
  { title: '负责人', dataIndex: 'ownerName', key: 'ownerName' },
  { title: '目标金额', dataIndex: 'targetAmount', key: 'targetAmount', align: 'right' },
  { title: '完成金额', dataIndex: 'doneAmount', key: 'doneAmount', align: 'right' },
  { title: '达成率', key: 'achievementRate', customRender: ({ record }) => `${record.achievementRate}%` },
  { title: '状态', dataIndex: 'statusName', key: 'statusName', width: 110 },
];
</script>
