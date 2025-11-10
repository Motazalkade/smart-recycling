<template>
  <header class="header">
    <div class="container">
      <nav class="nav">
        <div class="logo">
          <img src="@/assets/logo.png" alt="شعار إعادة التدوير" class="logo-img">
          <router-link to="/">{{ $t('app.name') }}</router-link>
        </div>
        <ul class="nav-links" v-if="isAuthenticated">
          <li><router-link to="/">{{ $t('common.home') }}</router-link></li>
          <li><router-link to="/recycling">{{ $t('common.recycling') }}</router-link></li>
          <li><router-link to="/profile">{{ $t('common.profile') }}</router-link></li>
          <li v-if="user?.role === 'admin'"><router-link to="/admin">{{ $t('common.admin') }}</router-link></li>
          <li class="language-switcher">
            <select v-model="currentLanguage" @change="changeLanguage" class="language-select">
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </li>
          <li><button @click="logout" class="btn btn-secondary">{{ $t('common.logout') }}</button></li>
        </ul>
        <ul class="nav-links" v-else>
          <li><router-link to="/login" class="btn btn-primary">{{ $t('common.login') }}</router-link></li>
          <li><router-link to="/register" class="btn btn-secondary">{{ $t('common.register') }}</router-link></li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script>
import { computed, ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

export default {
  name: 'Header',
  setup() {
    const store = useStore()
    const router = useRouter()
    const { locale } = useI18n()
    const currentLanguage = ref('ar')

    const isAuthenticated = computed(() => store.getters.isAuthenticated)
    const user = computed(() => store.getters.user)

    const changeLanguage = () => {
      locale.value = currentLanguage.value
      localStorage.setItem('userLanguage', currentLanguage.value)
      document.documentElement.dir = currentLanguage.value === 'ar' ? 'rtl' : 'ltr'
      document.documentElement.lang = currentLanguage.value
    }

    const logout = () => {
      store.dispatch('logout')
      router.push('/login')
    }

    onMounted(() => {
      const savedLanguage = localStorage.getItem('userLanguage') || 'ar'
      currentLanguage.value = savedLanguage
    })

    return {
      isAuthenticated,
      user,
      currentLanguage,
      changeLanguage,
      logout
    }
  }
}
</script>

<style scoped>
.header {
  background-color: white;
  color: #333;
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  border-bottom: 1px solid #e9ecef;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-img {
  width: 40px;
  height: 40px;
}

.logo a {
  color: #28a745;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 1rem;
  align-items: center;
}

.nav-links a {
  color: #333;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.nav-links a:hover {
  background-color: #f8f9fa;
  color: #28a745;
}

.nav-links a.router-link-active {
  background-color: #28a745;
  color: white;
}

.language-switcher {
  margin: 0 1rem;
}

.language-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  background: white;
  color: #333;
  cursor: pointer;
}

.language-select:focus {
  outline: none;
  border-color: #28a745;
}

@media (max-width: 768px) {
  .nav {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-links {
    flex-direction: column;
    width: 100%;
  }
  
  .language-switcher {
    margin: 0.5rem 0;
  }
}
</style>