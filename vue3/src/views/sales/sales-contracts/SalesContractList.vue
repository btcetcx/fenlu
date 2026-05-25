<template>
  <simple-sales-list
    title="合同管理"
    description="合同主题、合同客户、来源单据、回款金额、开票金额、执行状态。"
    :loader="listSalesContracts"
    :columns="columns"
  />
</template>

<script setup lang="ts">
import type { TableColumnsType } from 'ant-design-vue';
import SimpleSalesList from '../shared/SimpleSalesList.vue';
import { listSalesContracts } from '@/app/api/sales/resources';
import type { SalesContract } from '@/app/api/sales/types';

const columns: TableColumnsType<SalesContract> = [
  { title: '合同主题', dataIndex: 'topic', key: 'topic' },
  { title: '合同编号', dataIndex: 'code', key: 'code', width: 150 },
  { title: '合同客户', dataIndex: 'customerName', key: 'customerName' },
  { title: '来源单据', dataIndex: 'sourceCode', key: 'sourceCode' },
  { title: '合同金额', dataIndex: 'amount', key: 'amount', align: 'right' },
  { title: '回款金额', dataIndex: 'receivedAmount', key: 'receivedAmount', align: 'right' },
  { title: '开票金额', dataIndex: 'invoiceAmount', key: 'invoiceAmount', align: 'right' },
  { title: '执行状态', dataIndex: 'executionStatusName', key: 'executionStatusName' },
  { title: '审批状态', dataIndex: 'statusName', key: 'statusName' },
];
</script>
