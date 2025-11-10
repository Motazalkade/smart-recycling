<template>
  <div class="recycling">
    <div class="container">
      <h1>{{ $t('recycling.title') }}</h1>
      
      <div class="recycling-grid">
        <!-- قسم الكاميرا -->
        <div class="camera-section card">
          <h2>{{ $t('recycling.scanMaterials') }}</h2>
          <CameraCapture @item-processed="handleItemProcessed" />
        </div>

        <!-- قسم النتائج -->
        <div class="results-section card" v-if="processingResult">
          <h2>{{ $t('recycling.scanResults') }}</h2>
          <div class="result-content">
            <div class="result-item">
              <strong>{{ $t('recycling.materialType') }}:</strong> 
              <span :class="{'recyclable': processingResult.isRecyclable, 'not-recyclable': !processingResult.isRecyclable}">
                {{ $t('materials.' + processingResult.itemType) }}
              </span>
            </div>
            <div class="result-item">
              <strong>{{ $t('recycling.recyclable') }}:</strong> 
              <span :class="processingResult.isRecyclable ? 'text-success' : 'text-danger'">
                {{ processingResult.isRecyclable ? $t('recycling.recyclable') : $t('recycling.notRecyclable') }}
              </span>
            </div>
            <div class="result-item" v-if="processingResult.pointsEarned > 0">
              <strong>{{ $t('recycling.pointsEarned') }}:</strong> 
              <span class="text-success">+{{ processingResult.pointsEarned }}</span>
            </div>
          </div>

          <!-- أقرب موقع -->
          <div class="nearest-location" v-if="processingResult.nearestLocation">
            <h3>📍 {{ $t('recycling.nearestLocation') }}</h3>
            <div class="location-info">
              <strong>{{ processingResult.nearestLocation.name }}</strong>
              <p>{{ processingResult.nearestLocation.address }}</p>
              <p>{{ $t('recycling.distance') }}: {{ calculateDistance(processingResult.nearestLocation) }} {{ $t('recycling.km') }}</p>
            </div>
          </div>
        </div>

        <!-- قسم الخريطة -->
        <div class="map-section card">
          <h2>{{ $t('recycling.recyclingLocations') }}</h2>
          <RecyclingMap 
            :locations="locations" 
            :user-location="userLocation"
            :selected-location="processingResult?.nearestLocation" 
          />
        </div>
      </div>

      <!-- سجل التدوير -->
      <div class="history-section card" v-if="recyclingHistory.length > 0">
        <h2>{{ $t('recycling.recyclingHistory') }}</h2>
        <div class="history-list">
          <div 
            v-for="item in recyclingHistory.slice(0, 5)" 
            :key="item.id" 
            class="history-item"
          >
            <div class="item-type">{{ $t('materials.' + item.item_type) }}</div>
            <div class="item-status" :class="item.is_recyclable ? 'recyclable' : 'not-recyclable'">
              {{ item.is_recyclable ? $t('recycling.recyclable') : $t('recycling.notRecyclable') }}
            </div>
            <div class="item-date">{{ formatDate(item.created_at) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import CameraCapture from '../components/camera/CameraCapture.vue'
import RecyclingMap from '../components/map/RecyclingMap.vue'
import recyclingService from '../services/recycling'

export default {
  name: 'Recycling',
  components: {
    CameraCapture,
    RecyclingMap
  },
  setup() {
    const processingResult = ref(null)
    const locations = ref([])
    const recyclingHistory = ref([])
    const userLocation = ref(null)

    const calculateDistance = (location) => {
      if (!userLocation.value) return 'غير معروف'
      const R = 6371
      const dLat = (location.latitude - userLocation.value.lat) * Math.PI / 180
      const dLon = (location.longitude - userLocation.value.lng) * Math.PI / 180
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(userLocation.value.lat * Math.PI / 180) * Math.cos(location.latitude * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      const distance = R * c
      return distance.toFixed(1)
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('ar-SA')
    }

    const handleItemProcessed = (result) => {
      processingResult.value = result
      fetchRecyclingHistory()
    }

    const fetchLocations = async () => {
      try {
        const params = userLocation.value ? {
          lat: userLocation.value.lat,
          lng: userLocation.value.lng
        } : {}
        const response = await recyclingService.getLocations(params)
        locations.value = response.data
      } catch (error) {
        console.error('Error fetching locations:', error)
      }
    }

    const fetchRecyclingHistory = async () => {
      try {
        const response = await recyclingService.getUserHistory()
        recyclingHistory.value = response.data
      } catch (error) {
        console.error('Error fetching history:', error)
      }
    }

    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            userLocation.value = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
            fetchLocations()
          },
          (error) => {
            console.error('Error getting location:', error)
            fetchLocations()
          }
        )
      } else {
        fetchLocations()
      }
    }

    onMounted(() => {
      getUserLocation()
      fetchRecyclingHistory()
    })

    return {
      processingResult,
      locations,
      recyclingHistory,
      userLocation,
      handleItemProcessed,
      calculateDistance,
      formatDate
    }
  }
}
</script>

<style scoped>
.recycling {
  background: white;
  min-height: 100vh;
}

.recycling-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.camera-section {
  grid-column: 1;
}

.map-section {
  grid-column: 2;
  height: 400px;
}

.results-section {
  grid-column: 1 / -1;
}

.result-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.result-item {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 5px;
}

.nearest-location {
  padding: 1rem;
  background: #e8f5e8;
  border-radius: 5px;
  border-right: 4px solid #28a745;
}

.location-info {
  margin-top: 0.5rem;
}

.history-section {
  margin-top: 2rem;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.history-item {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 5px;
  align-items: center;
}

.recyclable {
  color: #28a745;
  font-weight: bold;
}

.not-recyclable {
  color: #dc3545;
  font-weight: bold;
}

.text-success {
  color: #28a745;
}

.text-danger {
  color: #dc3545;
}

@media (max-width: 768px) {
  .recycling-grid {
    grid-template-columns: 1fr;
  }
  
  .camera-section,
  .map-section {
    grid-column: 1;
  }
  
  .history-item {
    grid-template-columns: 1fr;
    text-align: center;
  }
}
</style>