<template>
  <nav class="navigation" v-if="isAuthenticated">
    <div class="nav-container">
      <router-link 
        v-for="item in navItems" 
        :key="item.to" 
        :to="item.to"
        class="nav-item"
        :class="{ 'active': $route.path === item.to }"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-label">{{ item.label }}</span>
      </router-link>
    </div>
  </nav>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'

export default {
  name: 'Navigation',
  setup() {
    const store = useStore()
    const route = useRoute()

    const isAuthenticated = computed(() => store.getters.isAuthenticated)
    const user = computed(() => store.getters.user)

    const navItems = computed(() => {
      const items = [
        { to: '/', icon: '🏠', label: 'الرئيسية' },
        { to: '/recycling', icon: '♻️', label: 'التدوير' },
        { to: '/profile', icon: '👤', label: 'حسابي' }
      ]

      if (user.value?.role === 'admin') {
        items.push({ to: '/admin', icon: '⚙️', label: 'الإدارة' })
      }

      return items
    })

    return {
      isAuthenticated,
      navItems
    }
  }
}
</script>

<style scoped>
.navigation {
  background: white;
  border-bottom: 1px solid #e9ecef;
  padding: 0.5rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  display: flex;
  justify-content: center;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #666;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  min-width: 80px;
}

.nav-item:hover {
  background: #f8f9fa;
  color: #333;
}

.nav-item.active {
  background: #28a745;
  color: white;
}

.nav-icon {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.nav-label {
  font-size: 0.8rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .nav-container {
    gap: 0.5rem;
  }
  
  .nav-item {
    min-width: 60px;
    padding: 0.5rem;
  }
  
  .nav-icon {
    font-size: 1.25rem;
  }
  
  .nav-label {
    font-size: 0.7rem;
  }
}
</style>