<template>
  <div class="home">
    <!-- قسم البطل مع الشعار -->
    <div class="hero-section">
      <div class="container">
        <div class="hero-content">
          <div class="logo-center">
            <img src="@/assets/logo.png" alt="شعار إعادة التدوير" class="hero-logo">
            <h1>{{ $t('app.name') }}</h1>
          </div>
          <p class="hero-description">
            {{ $t('home.description') }}
          </p>
          <div class="hero-actions" v-if="!isAuthenticated">
            <router-link to="/register" class="btn btn-primary">{{ $t('auth.register') }}</router-link>
            <router-link to="/login" class="btn btn-secondary">{{ $t('auth.login') }}</router-link>
          </div>
          <div class="hero-actions" v-else>
            <router-link to="/recycling" class="btn btn-primary">{{ $t('home.startRecycling') }}</router-link>
            <router-link to="/profile" class="btn btn-secondary">{{ $t('home.myAccount') }}</router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- قسم المميزات -->
    <div class="features-section">
      <div class="container">
        <h2 class="section-title">{{ $t('home.features') }}</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">📸</div>
            <h3>{{ $t('home.feature1') }}</h3>
            <p>{{ $t('home.feature1Desc') }}</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🗺️</div>
            <h3>{{ $t('home.feature2') }}</h3>
            <p>{{ $t('home.feature2Desc') }}</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🏆</div>
            <h3>{{ $t('home.feature3') }}</h3>
            <p>{{ $t('home.feature3Desc') }}</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>{{ $t('home.feature4') }}</h3>
            <p>{{ $t('home.feature4Desc') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- قسم الإحصائيات -->
    <div class="stats-section" v-if="isAuthenticated && userStats">
      <div class="container">
        <h2 class="section-title">{{ $t('home.yourStats') }}</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">{{ userStats.total_points || 0 }}</div>
            <div class="stat-label">{{ $t('home.totalPoints') }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ userStats.total_items || 0 }}</div>
            <div class="stat-label">{{ $t('home.scannedItems') }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ userStats.recyclable_items || 0 }}</div>
            <div class="stat-label">{{ $t('home.recyclableItems') }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import recyclingService from '../services/recycling'

export default {
  name: 'Home',
  setup() {
    const store = useStore()
    const userStats = ref(null)

    const isAuthenticated = computed(() => store.getters.isAuthenticated)
    const user = computed(() => store.getters.user)

    const fetchUserStats = async () => {
      if (isAuthenticated.value) {
        try {
          const response = await recyclingService.getUserStats()
          userStats.value = response.data
        } catch (error) {
          console.error('Error fetching user stats:', error)
        }
      }
    }

    onMounted(() => {
      if (isAuthenticated.value) {
        fetchUserStats()
      }
    })

    return {
      isAuthenticated,
      user,
      userStats
    }
  }
}
</script>

<style scoped>
.home {
  background: white;
}

.hero-section {
  background: white;
  color: #333;
  padding: 4rem 0;
  text-align: center;
  border-bottom: 1px solid #e9ecef;
}

.hero-content h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #28a745;
}

.hero-description {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: #666;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.logo-center {
  margin-bottom: 2rem;
}

.hero-logo {
  width: 120px;
  height: 120px;
  margin-bottom: 1rem;
}

.features-section {
  padding: 4rem 0;
  background-color: #f8f9fa;
}

.section-title {
  text-align: center;
  margin-bottom: 3rem;
  font-size: 2rem;
  color: #333;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-card {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 10px;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  margin-bottom: 1rem;
  color: #28a745;
}

.stats-section {
  padding: 4rem 0;
  background-color: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.stat-card {
  text-align: center;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: #28a745;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #666;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 2rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .hero-logo {
    width: 100px;
    height: 100px;
  }
}
</style>