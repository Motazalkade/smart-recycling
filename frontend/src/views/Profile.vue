<template>
  <div class="profile">
    <div class="container">
      <h1>{{ $t('profile.title') }}</h1>
      
      <div class="profile-grid">
        <!-- معلومات المستخدم -->
        <div class="user-info card">
          <h2>{{ $t('profile.accountInfo') }}</h2>
          <div class="user-details">
            <div class="detail-item">
              <strong>{{ $t('profile.username') }}:</strong> {{ user.username }}
            </div>
            <div class="detail-item">
              <strong>{{ $t('profile.email') }}:</strong> {{ user.email }}
            </div>
            <div class="detail-item">
              <strong>{{ $t('profile.role') }}:</strong> {{ user.role === 'admin' ? $t('profile.adminRole') : $t('profile.userRole') }}
            </div>
            <div class="detail-item">
              <strong>{{ $t('profile.joinDate') }}:</strong> {{ formatDate(user.created_at) }}
            </div>
          </div>
        </div>

        <!-- الإحصائيات -->
        <div class="stats-card card">
          <h2>{{ $t('profile.yourStats') }}</h2>
          <div class="stats-grid">
            <div class="stat">
              <div class="stat-value">{{ userStats.total_points || 0 }}</div>
              <div class="stat-label">{{ $t('profile.totalPoints') }}</div>
            </div>
            <div class="stat">
              <div class="stat-value">{{ userStats.total_items || 0 }}</div>
              <div class="stat-label">{{ $t('profile.scannedItems') }}</div>
            </div>
            <div class="stat">
              <div class="stat-value">{{ userStats.recyclable_items || 0 }}</div>
              <div class="stat-label">{{ $t('profile.recyclableItems') }}</div>
            </div>
            <div class="stat">
              <div class="stat-value">{{ recyclingRate }}%</div>
              <div class="stat-label">{{ $t('profile.recyclingRate') }}</div>
            </div>
          </div>
        </div>

        <!-- سجل النشاط -->
        <div class="activity-card card">
          <h2>{{ $t('profile.recentActivity') }}</h2>
          <div class="activity-list">
            <div 
              v-for="item in recentActivity" 
              :key="item.id" 
              class="activity-item"
            >
              <div class="activity-icon">
                {{ item.is_recyclable ? '♻️' : '🚫' }}
              </div>
              <div class="activity-details">
                <div class="activity-type">
                  {{ $t('materials.' + item.item_type) }}
                </div>
                <div class="activity-date">
                  {{ formatDate(item.created_at) }}
                </div>
              </div>
              <div class="activity-points" v-if="item.is_recyclable">
                +10 {{ $t('common.points') }}
              </div>
            </div>
          </div>
          <div v-if="recentActivity.length === 0" class="no-activity">
            {{ $t('profile.noActivity') }}
          </div>
        </div>

        <!-- الإنجازات -->
        <div class="achievements-card card">
          <h2>{{ $t('profile.achievements') }}</h2>
          <div class="achievements-list">
            <div 
              v-for="achievement in achievements" 
              :key="achievement.id"
              :class="['achievement', { 'unlocked': achievement.unlocked }]"
            >
              <div class="achievement-icon">
                {{ achievement.icon }}
              </div>
              <div class="achievement-details">
                <div class="achievement-name">{{ achievement.name }}</div>
                <div class="achievement-desc">{{ achievement.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import recyclingService from '../services/recycling'

export default {
  name: 'Profile',
  setup() {
    const store = useStore()
    const { t } = useI18n()
    const userStats = ref({})
    const recentActivity = ref([])

    const user = computed(() => store.getters.user)

    const recyclingRate = computed(() => {
      if (!userStats.value.total_items || !userStats.value.recyclable_items) return 0
      return Math.round((userStats.value.recyclable_items / userStats.value.total_items) * 100)
    })

    const achievements = computed(() => [
      {
        id: 1,
        name: t('profile.beginner'),
        description: t('profile.beginnerDesc'),
        icon: '🌱',
        unlocked: userStats.value.total_items >= 5
      },
      {
        id: 2,
        name: t('profile.activeRecycler'),
        description: t('profile.activeRecyclerDesc'),
        icon: '♻️',
        unlocked: userStats.value.total_items >= 20
      },
      {
        id: 3,
        name: t('profile.ecoChampion'),
        description: t('profile.ecoChampionDesc'),
        icon: '🏆',
        unlocked: userStats.value.total_points >= 100
      },
      {
        id: 4,
        name: t('profile.recyclingExpert'),
        description: t('profile.recyclingExpertDesc'),
        icon: '⭐',
        unlocked: recyclingRate.value >= 80
      }
    ])

    const formatDate = (dateString) => {
      const locale = localStorage.getItem('userLanguage') || 'ar'
      return new Date(dateString).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const fetchUserStats = async () => {
      try {
        const response = await recyclingService.getUserStats()
        userStats.value = response.data
      } catch (error) {
        console.error('Error fetching user stats:', error)
      }
    }

    const fetchRecentActivity = async () => {
      try {
        const response = await recyclingService.getUserHistory()
        recentActivity.value = response.data.slice(0, 10)
      } catch (error) {
        console.error('Error fetching recent activity:', error)
      }
    }

    onMounted(() => {
      fetchUserStats()
      fetchRecentActivity()
    })

    return {
      user,
      userStats,
      recentActivity,
      recyclingRate,
      achievements,
      formatDate
    }
  }
}
</script>

<style scoped>
.profile {
  background: white;
  min-height: 100vh;
  padding: 2rem 0;
}

.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.user-info,
.stats-card,
.activity-card,
.achievements-card {
  padding: 2rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 10px;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #28a745;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.activity-icon {
  font-size: 1.5rem;
}

.activity-details {
  flex: 1;
}

.activity-type {
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.activity-date {
  color: #666;
  font-size: 0.9rem;
}

.activity-points {
  color: #28a745;
  font-weight: bold;
}

.no-activity {
  text-align: center;
  color: #666;
  padding: 2rem;
}

.achievements-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.achievement {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  opacity: 0.5;
}

.achievement.unlocked {
  opacity: 1;
  background: #e8f5e8;
  border: 2px solid #28a745;
}

.achievement-icon {
  font-size: 2rem;
}

.achievement-details {
  flex: 1;
}

.achievement-name {
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.achievement-desc {
  color: #666;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid,
  .achievements-list {
    grid-template-columns: 1fr;
  }
}
</style>