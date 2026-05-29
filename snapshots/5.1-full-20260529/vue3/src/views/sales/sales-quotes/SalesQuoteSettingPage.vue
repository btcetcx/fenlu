<script setup lang="ts">
import SalesSettingPage from '../shared/SalesSettingPage.vue';

const emit = defineEmits<{ back: [] }>();
</script>

<template>
  <sales-setting-page module="quotes" @back="emit('back')" />
</template>
