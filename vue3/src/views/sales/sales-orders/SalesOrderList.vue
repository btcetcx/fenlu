<template>
  <simple-sales-list
    title="订单管理"
    description="订单来源、信用校验、信用占用、应收金额、开票申请、发货进展。"
    :loader="listSalesOrders"
    :columns="columns"
  />
</template>

<script setup lang="ts">
import type { TableColumnsType } from 'ant-design-vue';
import SimpleSalesList from '../shared/SimpleSalesList.vue';
import { listSalesOrders } from '@/app/api/sales/resources';
import type { SalesOrder } from '@/app/api/sales/types';

const columns: TableColumnsType<SalesOrder> = [
  { title: '订单主题', dataIndex: 'topic', key: 'topic' },
  { title: '订单号', dataIndex: 'code', key: 'code', width: 150 },
  { title: '订单来源', dataIndex: 'sourceType', key: 'sourceType' },
  { title: '客户', dataIndex: 'customerName', key: 'customerName' },
  { title: '订单金额', dataIndex: 'amount', key: 'amount', align: 'right' },
  { title: '信用校验', dataIndex: 'creditCheckName', key: 'creditCheckName' },
  { title: '信用占用', dataIndex: 'creditHoldName', key: 'creditHoldName' },
  { title: '应收金额', dataIndex: 'receivableAmount', key: 'receivableAmount', align: 'right' },
  { title: '开票申请', dataIndex: 'invoiceRequestName', key: 'invoiceRequestName' },
  { title: '订单进展', dataIndex: 'progressName', key: 'progressName' },
  { title: '状态', dataIndex: 'statusName', key: 'statusName' },
];
</script>
