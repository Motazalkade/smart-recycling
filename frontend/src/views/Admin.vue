<template>
  <div class="admin">
    <div class="container">
      <h1>{{ $t('admin.title') }}</h1>
      
      <div class="admin-grid">
        <!-- إحصائيات عامة -->
        <div class="stats-section">
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.totalUsers }}</div>
              <div class="stat-label">{{ $t('admin.totalUsers') }}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">♻️</div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.totalScans }}</div>
              <div class="stat-label">{{ $t('admin.totalScans') }}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.recyclableItems }}</div>
              <div class="stat-label">{{ $t('admin.recyclableItems') }}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🏆</div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.totalPoints }}</div>
              <div class="stat-label">{{ $t('admin.totalPoints') }}</div>
            </div>
          </div>
        </div>

        <!-- إدارة المستخدمين -->
        <div class="users-section card">
          <h2>{{ $t('admin.usersManagement') }}</h2>
          <div class="table-container">
            <table class="users-table">
              <thead>
                <tr>
                  <th>{{ $t('profile.username') }}</th>
                  <th>{{ $t('profile.email') }}</th>
                  <th>{{ $t('common.points') }}</th>
                  <th>{{ $t('profile.joinDate') }}</th>
                  <th>{{ $t('admin.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user.id">
                  <td>{{ user.username }}</td>
                  <td>{{ user.email }}</td>
                  <td>{{ user.points }}</td>
                  <td>{{ formatDate(user.created_at) }}</td>
                  <td>
                    <button 
                      v-if="user.role !== 'admin'" 
                      @click="toggleUserRole(user)"
                      class="btn btn-sm"
                      :class="user.role === 'user' ? 'btn-warning' : 'btn-secondary'"
                    >
                      {{ user.role === 'user' ? $t('admin.promoteToAdmin') : $t('admin.removeAdmin') }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- إدارة مواقع التدوير -->
        <div class="locations-section card">
          <h2>{{ $t('admin.locationsManagement') }}</h2>
          <button @click="showAddLocation = true" class="btn btn-primary mb-3">
            + {{ $t('admin.addLocation') }}
          </button>
          
          <div class="locations-grid">
            <div 
              v-for="location in locations" 
              :key="location.id" 
              class="location-card"
            >
              <div class="location-info">
                <h3>{{ location.name }}</h3>
                <p>{{ location.address }}</p>
                <div class="location-coords">
                  <small>{{ $t('admin.coordinates') }}: {{ location.latitude }}, {{ location.longitude }}</small>
                </div>
                <div class="location-type">
                  <span class="type-badge" :class="location.type">
                    {{ getArabicType(location.type) }}
                  </span>
                </div>
              </div>
              <div class="location-actions">
                <button @click="editLocation(location)" class="btn btn-sm btn-secondary">
                  {{ $t('admin.edit') }}
                </button>
                <button @click="deleteLocation(location.id)" class="btn btn-sm btn-danger">
                  {{ $t('admin.delete') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- إحصائيات النشاط -->
        <div class="activity-section card">
          <h2>{{ $t('admin.systemActivity') }}</h2>
          <div class="chart-placeholder">
            <p>📊 {{ $t('admin.chartsMessage') }}</p>
            <div class="chart-stats">
              <div class="chart-stat">
                <div class="stat-value">{{ recentActivity.length }}</div>
                <div class="stat-label">{{ $t('admin.todayActivity') }}</div>
              </div>
              <div class="chart-stat">
                <div class="stat-value">{{ Math.round(stats.recyclingRate) }}%</div>
                <div class="stat-label">{{ $t('admin.recyclingRate') }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- نافذة إضافة موقع -->
      <div v-if="showAddLocation" class="modal-overlay">
        <div class="modal">
          <h3>{{ editingLocation ? $t('admin.editLocation') : $t('admin.addNewLocation') }}</h3>
          <form @submit.prevent="saveLocation">
            <div class="form-group">
              <label>{{ $t('admin.locationName') }}</label>
              <input v-model="locationForm.name" required>
            </div>
            <div class="form-group">
              <label>{{ $t('admin.address') }}</label>
              <textarea v-model="locationForm.address" required></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>{{ $t('admin.latitude') }}</label>
                <input v-model="locationForm.latitude" type="number" step="any" required>
              </div>
              <div class="form-group">
                <label>{{ $t('admin.longitude') }}</label>
                <input v-model="locationForm.longitude" type="number" step="any" required>
              </div>
            </div>
            <div class="form-group">
              <label>{{ $t('admin.locationType') }}</label>
              <select v-model="locationForm.type" required>
                <option value="plastic">{{ $t('materials.plastic_bottle') }}</option>
                <option value="paper">{{ $t('materials.paper') }}</option>
                <option value="glass">{{ $t('materials.glass') }}</option>
                <option value="metal">{{ $t('materials.metal_can') }}</option>
                <option value="general">{{ $t('admin.general') }}</option>
              </select>
            </div>
            <div class="modal-actions">
              <button type="submit" class="btn btn-primary">
                {{ editingLocation ? $t('admin.update') : $t('admin.add') }}
              </button>
              <button type="button" @click="cancelEdit" class="btn btn-secondary">
                {{ $t('admin.cancel') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

export default {
  name: 'Admin',
  setup() {
    const { t } = useI18n()
    const stats = ref({
      totalUsers: 0,
      totalScans: 0,
      recyclableItems: 0,
      totalPoints: 0,
      recyclingRate: 0
    })
    
    const users = ref([])
    const locations = ref([])
    const recentActivity = ref([])
    const showAddLocation = ref(false)
    const editingLocation = ref(null)
    
    const locationForm = ref({
      name: '',
      address: '',
      latitude: '',
      longitude: '',
      type: 'general'
    })

    const getArabicType = (type) => {
      const types = {
        'plastic': t('materials.plastic_bottle'),
        'paper': t('materials.paper'),
        'glass': t('materials.glass'),
        'metal': t('materials.metal_can'),
        'general': t('admin.general')
      }
      return types[type] || type
    }

    const formatDate = (dateString) => {
      const locale = localStorage.getItem('userLanguage') || 'ar'
      return new Date(dateString).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')
    }

    const fetchStats = async () => {
      // محاكاة جلب الإحصائيات
      stats.value = {
        totalUsers: 150,
        totalScans: 1250,
        recyclableItems: 890,
        totalPoints: 8900,
        recyclingRate: 71.2
      }
    }

    const fetchUsers = async () => {
      // محاكاة جلب المستخدمين
      users.value = [
        {
          id: 1,
          username: t('admin.sampleUser1'),
          email: 'ahmed@example.com',
          points: 150,
          role: 'user',
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          username: t('admin.sampleUser2'),
          email: 'admin@example.com',
          points: 0,
          role: 'admin',
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          username: t('admin.sampleUser3'),
          email: 'mohammed@example.com',
          points: 75,
          role: 'user',
          created_at: new Date().toISOString()
        }
      ]
    }

    const fetchLocations = async () => {
      // محاكاة جلب المواقع
      locations.value = [
        {
          id: 1,
          name: t('admin.location1'),
          address: t('admin.location1Address'),
          latitude: 24.7136,
          longitude: 46.6753,
          type: 'plastic'
        },
        {
          id: 2,
          name: t('admin.location2'),
          address: t('admin.location2Address'),
          latitude: 21.4858,
          longitude: 39.1925,
          type: 'paper'
        },
        {
          id: 3,
          name: t('admin.location3'),
          address: t('admin.location3Address'),
          latitude: 26.4207,
          longitude: 50.0888,
          type: 'general'
        }
      ]
    }

    const toggleUserRole = (user) => {
      // محاكاة تغيير صلاحية المستخدم
      user.role = user.role === 'user' ? 'admin' : 'user'
    }

    const editLocation = (location) => {
      editingLocation.value = location
      locationForm.value = { ...location }
      showAddLocation.value = true
    }

    const deleteLocation = (id) => {
      if (confirm(t('admin.deleteConfirm'))) {
        locations.value = locations.value.filter(loc => loc.id !== id)
      }
    }

    const saveLocation = () => {
      if (editingLocation.value) {
        // تحديث الموقع
        const index = locations.value.findIndex(loc => loc.id === editingLocation.value.id)
        if (index !== -1) {
          locations.value[index] = { ...locationForm.value, id: editingLocation.value.id }
        }
      } else {
        // إضافة موقع جديد
        const newLocation = {
          ...locationForm.value,
          id: Date.now()
        }
        locations.value.push(newLocation)
      }
      cancelEdit()
    }

    const cancelEdit = () => {
      showAddLocation.value = false
      editingLocation.value = null
      locationForm.value = {
        name: '',
        address: '',
        latitude: '',
        longitude: '',
        type: 'general'
      }
    }

    onMounted(() => {
      fetchStats()
      fetchUsers()
      fetchLocations()
    })

    return {
      stats,
      users,
      locations,
      recentActivity,
      showAddLocation,
      editingLocation,
      locationForm,
      getArabicType,
      formatDate,
      toggleUserRole,
      editLocation,
      deleteLocation,
      saveLocation,
      cancelEdit
    }
  }
}
</script>

<style scoped>
.admin {
  background: white;
  min-height: 100vh;
  padding: 2rem 0;
}

.admin-grid {
  display: grid;
  gap: 2rem;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: bold;
  color: #28a745;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.table-container {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 1rem;
  text-align: right;
  border-bottom: 1px solid #eee;
}

.users-table th {
  background: #f8f9fa;
  font-weight: bold;
}

.locations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.location-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.location-info h3 {
  margin-bottom: 0.5rem;
  color: #333;
}

.location-coords {
  margin: 0.5rem 0;
}

.type-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 15px;
  font-size: 0.8rem;
  color: white;
}

.type-badge.plastic { background: #007bff; }
.type-badge.paper { background: #28a745; }
.type-badge.glass { background: #6f42c1; }
.type-badge.metal { background: #fd7e14; }
.type-badge.general { background: #6c757d; }

.location-actions {
  display: flex;
  gap: 0.5rem;
}

.chart-placeholder {
  text-align: center;
  padding: 3rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.chart-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-top: 1rem;
}

.chart-stat {
  text-align: center;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

.btn-warning {
  background: #ffc107;
  color: #212529;
}

.btn-warning:hover {
  background: #e0a800;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

@media (max-width: 768px) {
  .stats-section {
    grid-template-columns: 1fr 1fr;
  }
  
  .locations-grid {
    grid-template-columns: 1fr;
  }
  
  .location-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>