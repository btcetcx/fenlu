<template>
  <simple-sales-list
    title="报价管理"
    description="报价主题、适用客户、价格版本、转化状态、报价状态。"
    :loader="listSalesQuotes"
    :columns="columns"
  />
</template>

<script setup lang="ts">
import type { TableColumnsType } from 'ant-design-vue';
import SimpleSalesList from '../shared/SimpleSalesList.vue';
import { listSalesQuotes } from '@/app/api/sales/resources';
import type { SalesQuote } from '@/app/api/sales/types';

const columns: TableColumnsType<SalesQuote> = [
  { title: '报价主题', dataIndex: 'topic', key: 'topic' },
  { title: '报价编号', dataIndex: 'code', key: 'code', width: 150 },
  { title: '报价类型', dataIndex: 'quoteTypeName', key: 'quoteTypeName' },
  { title: '适用客户', dataIndex: 'customerName', key: 'customerName' },
  { title: '报价金额', dataIndex: 'amount', key: 'amount', align: 'right' },
  { title: '价格版本', dataIndex: 'priceVersion', key: 'priceVersion' },
  { title: '转化状态', dataIndex: 'conversionStatusName', key: 'conversionStatusName' },
  { title: '报价状态', dataIndex: 'statusName', key: 'statusName' },
];
</script>
