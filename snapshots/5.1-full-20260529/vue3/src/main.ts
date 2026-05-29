import { createApp } from 'vue';
import Antd from 'ant-design-vue';
import { createPinia } from 'pinia';
import 'ant-design-vue/dist/reset.css';
import './styles/tokens.css';
import './styles/global.css';
import './styles/ant-override.css';
import './styles/aw-console.css';
import App from './App.vue';
import { router } from './app/router';

createApp(App).use(createPinia()).use(router).use(Antd).mount('#app');
