import { defineStore } from 'pinia';

export const useAppStore = defineStore('app', {
  state: () => ({
    collapsed: false,
    apiMode: 'mock' as 'mock' | 'remote',
  }),
  actions: {
    toggleCollapsed() {
      this.collapsed = !this.collapsed;
    },
    setApiMode(mode: 'mock' | 'remote') {
      this.apiMode = mode;
    },
  },
});
