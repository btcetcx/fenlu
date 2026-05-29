<template>
  <a-config-provider :theme="theme">
    <router-view />
  </a-config-provider>
</template>

<script setup lang="ts">
const theme = {
  token: {
    colorPrimary: '#1677ff',
    borderRadius: 6,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif',
  },
  components: {
    Layout: {
      bodyBg: '#f5f7fb',
      headerBg: '#ffffff',
      siderBg: '#111827',
    },
    Menu: {
      darkItemBg: '#111827',
      darkSubMenuItemBg: '#0f172a',
    },
    Table: {
      headerBg: '#f8fafc',
    },
  },
};
</script>
