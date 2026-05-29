<script setup lang="ts">
import type { ApprovalMethod, ApprovalNode } from './types';

const props = defineProps<{
  name: string;
  nodes: ApprovalNode[];
  methods: ApprovalMethod[];
  activeIndex?: number;
}>();

const emit = defineEmits<{
  (event: 'add-node'): void;
  (event: 'pick-person', index: number): void;
  (event: 'remove-node', index: number): void;
  (event: 'remove-person', index: number, name: string): void;
  (event: 'select-node', index: number): void;
  (event: 'update:name', value: string): void;
  (event: 'update-node', index: number, node: ApprovalNode): void;
}>();

function updateNode(index: number, patch: Partial<ApprovalNode>) {
  emit('update-node', index, { ...props.nodes[index], ...patch });
}
</script>

<template>
  <section class="aw-form-card aw-approval-editor">
    <div class="aw-detail-section-title">审批规则设置</div>
    <div class="aw-approval-basic-grid">
      <label class="aw-field">
        <span><b>*</b>流程名称</span>
        <input :value="name" placeholder="请输入流程名称" @input="emit('update:name', ($event.target as HTMLInputElement).value)" />
      </label>
    </div>
    <div class="aw-detail-section-title">审批节点</div>
    <div class="aw-approval-flow-strip">
      <template v-for="(node, index) in nodes" :key="index">
        <div v-if="index > 0" class="aw-approval-arrow">→</div>
        <div :class="['aw-approval-card', { on: activeIndex === index }]" @click="emit('select-node', index)">
          <button class="aw-approval-remove" type="button" @click.stop="emit('remove-node', index)">×</button>
          <div class="aw-approval-card-title">节点 {{ index + 1 }}</div>
          <label>
            节点名称
            <input :value="node.name" placeholder="填写审批节点名称" @click.stop @input="updateNode(index, { name: ($event.target as HTMLInputElement).value })" />
          </label>
          <label>
            审批人
            <div class="aw-approval-person-input" @click.stop="emit('pick-person', index)">请选择负责人  +</div>
            <div v-if="node.approvers.length" class="aw-approval-picked">
              <span v-for="person in node.approvers" :key="person">
                {{ person }}<button type="button" @click.stop="emit('remove-person', index, person)">×</button>
              </span>
            </div>
          </label>
          <div class="aw-approval-methods">
            <div>审批方式</div>
            <label v-for="method in methods" :key="method.value" @click.stop="updateNode(index, { method: method.value })">
              <input :checked="node.method === method.value" type="radio" :name="`approvalMethod${index}`" />
              <span>{{ method.value }}</span>
              <em>{{ method.desc }}</em>
            </label>
          </div>
        </div>
      </template>
      <button class="aw-approval-add-card" type="button" @click="emit('add-node')">+ 添加节点</button>
    </div>
  </section>
</template>
