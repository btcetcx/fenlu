<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { PersonPickerDept, PersonPickerPerson } from './types';

const props = defineProps<{
  open: boolean;
  title?: string;
  depts: PersonPickerDept[];
  picked?: PersonPickerPerson[];
}>();

const emit = defineEmits<{
  (event: 'cancel'): void;
  (event: 'confirm', persons: PersonPickerPerson[]): void;
}>();

const activeDept = ref('');
const localPicked = ref<PersonPickerPerson[]>([]);
const persons = computed(() => props.depts.find((dept) => dept.key === activeDept.value)?.persons || []);
const allChecked = computed(() => persons.value.length > 0 && persons.value.every((person) => localPicked.value.some((item) => item.id === person.id)));

watch(() => props.open, (open) => {
  if (!open) return;
  activeDept.value = props.depts[0]?.key || '';
  localPicked.value = props.picked ? props.picked.map((item) => ({ ...item })) : [];
}, { immediate: true });

function toggle(person: PersonPickerPerson) {
  localPicked.value = localPicked.value.some((item) => item.id === person.id)
    ? localPicked.value.filter((item) => item.id !== person.id)
    : [...localPicked.value, person];
}

function toggleAll() {
  if (allChecked.value) {
    const deptIds = new Set(persons.value.map((person) => person.id));
    localPicked.value = localPicked.value.filter((person) => !deptIds.has(person.id));
    return;
  }
  const next = [...localPicked.value];
  persons.value.forEach((person) => {
    if (!next.some((item) => item.id === person.id)) next.push(person);
  });
  localPicked.value = next;
}
</script>

<template>
  <div v-if="open" class="aw-modal-mask">
    <div class="aw-modal aw-person-picker-modal">
      <div class="aw-modal-head">
        <strong>{{ title || '选择负责人' }}</strong>
        <button class="aw-modal-close" type="button" @click="emit('cancel')">×</button>
      </div>
    <div class="aw-picker-body">
      <aside class="aw-picker-side">
        <div class="aw-picker-search">
          <span class="aw-line-icon line-search"></span>
          <input placeholder="搜索" />
        </div>
        <button
          v-for="dept in depts"
          :key="dept.key"
          :class="['aw-picker-tree-row', { on: activeDept === dept.key }]"
          type="button"
          @click="activeDept = dept.key"
        >
          <span>{{ dept === depts[0] || dept === depts[1] ? '▼' : '' }}</span>{{ dept.label }}
        </button>
      </aside>
      <section class="aw-picker-main">
        <div class="aw-picker-title">
          <strong>{{ depts.find((dept) => dept.key === activeDept)?.label }}</strong>
          <span>共 {{ persons.length }} 人</span>
        </div>
        <table class="aw-doc-tbl">
          <thead>
            <tr>
              <th style="width:44px"><input :checked="allChecked" type="checkbox" @change="toggleAll" /></th>
              <th>姓名</th>
              <th>编号</th>
              <th>角色</th>
              <th>联系电话</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="person in persons" :key="person.id" @click="toggle(person)">
              <td><input :checked="localPicked.some((item) => item.id === person.id)" type="checkbox" @click.stop @change="toggle(person)" /></td>
              <td>{{ person.name }}</td>
              <td>{{ person.id }}</td>
              <td>{{ person.role }}</td>
              <td>{{ person.phone }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
      <div class="aw-modal-foot">
        <button class="aw-tool-btn" type="button" @click="emit('cancel')">取消</button>
        <button class="aw-btn primary" type="button" @click="emit('confirm', localPicked)">确认</button>
      </div>
    </div>
  </div>
</template>
