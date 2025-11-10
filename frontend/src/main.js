import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import i18n from './i18n'

// إعداد اللغة الافتراضية
const savedLanguage = localStorage.getItem('userLanguage') || 'ar'
document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr'
document.documentElement.lang = savedLanguage

createApp(App)
  .use(store)
  .use(router)
  .use(i18n)
  .mount('#app')