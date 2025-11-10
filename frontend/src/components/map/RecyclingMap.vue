<template>
  <div class="recycling-map">
    <div ref="mapContainer" class="map-container"></div>
    <div class="map-legend">
      <div class="legend-item" v-for="item in legendItems" :key="item.type">
        <span class="legend-color" :style="{ backgroundColor: item.color }"></span>
        <span class="legend-label">{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, onUnmounted } from 'vue'

export default {
  name: 'RecyclingMap',
  props: {
    locations: {
      type: Array,
      default: () => []
    },
    userLocation: {
      type: Object,
      default: null
    },
    selectedLocation: {
      type: Object,
      default: null
    }
  },
  setup(props) {
    const mapContainer = ref(null)
    const map = ref(null)
    const markers = ref([])

    const legendItems = [
      { type: 'plastic', color: '#007bff', label: 'بلاستيك' },
      { type: 'paper', color: '#28a745', label: 'ورق' },
      { type: 'glass', color: '#6f42c1', label: 'زجاج' },
      { type: 'metal', color: '#fd7e14', label: 'معادن' },
      { type: 'general', color: '#6c757d', label: 'عام' },
      { type: 'user', color: '#dc3545', label: 'موقعك' },
      { type: 'selected', color: '#ffc107', label: 'محدد' }
    ]

    const getIconColor = (type) => {
      const colors = {
        'plastic': '#007bff',
        'paper': '#28a745',
        'glass': '#6f42c1',
        'metal': '#fd7e14',
        'general': '#6c757d'
      }
      return colors[type] || '#6c757d'
    }

    const createCustomIcon = (color, isSelected = false) => {
      return L.divIcon({
        className: `recycling-marker ${isSelected ? 'selected' : ''}`,
        html: `
          <div style="
            background-color: ${color};
            width: 25px;
            height: 25px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            font-weight: bold;
          ">♻️</div>
        `,
        iconSize: [25, 25],
        iconAnchor: [12, 12]
      })
    }

    const initMap = () => {
      if (!mapContainer.value) return

      // استخدام خرائط Leaflet
      if (!window.L) {
        console.error('Leaflet not loaded')
        return
      }

      // تحديد المركز الافتراضي (الرياض)
      const defaultCenter = [24.7136, 46.6753]
      
      // إنشاء الخريطة
      map.value = L.map(mapContainer.value).setView(defaultCenter, 12)

      // إضافة طبقة الخريطة
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(map.value)

      // إضافة المواقع إذا كانت موجودة
      updateMarkers()
    }

    const updateMarkers = () => {
      if (!map.value) return

      // إزالة العلامات القديمة
      markers.value.forEach(marker => map.value.removeLayer(marker))
      markers.value = []

      // إضافة موقع المستخدم إذا كان متاحاً
      if (props.userLocation) {
        const userIcon = L.divIcon({
          className: 'user-location-marker',
          html: '📍',
          iconSize: [30, 30],
          iconAnchor: [15, 30]
        })

        const userMarker = L.marker([props.userLocation.lat, props.userLocation.lng], {
          icon: userIcon
        }).addTo(map.value)
        
        userMarker.bindPopup('📍 موقعك الحالي')
        markers.value.push(userMarker)

        // تحديث مركز الخريطة لموقع المستخدم
        map.value.setView([props.userLocation.lat, props.userLocation.lng], 13)
      }

      // إضافة علامات مواقع التدوير
      props.locations.forEach(location => {
        const isSelected = props.selectedLocation && props.selectedLocation.id === location.id
        const markerColor = isSelected ? '#ffc107' : getIconColor(location.type)
        const icon = createCustomIcon(markerColor, isSelected)

        const marker = L.marker([location.latitude, location.longitude], {
          icon: icon
        }).addTo(map.value)

        const popupContent = `
          <div class="map-popup">
            <h4>${location.name}</h4>
            <p>${location.address}</p>
            <p><strong>النوع:</strong> ${getArabicType(location.type)}</p>
            ${location.distance ? `<p><strong>المسافة:</strong> ${location.distance} كم</p>` : ''}
          </div>
        `

        marker.bindPopup(popupContent)
        markers.value.push(marker)

        // فتح popup للموقع المحدد
        if (isSelected) {
          marker.openPopup()
        }
      })
    }

    const getArabicType = (type) => {
      const types = {
        'plastic': 'بلاستيك',
        'paper': 'ورق',
        'glass': 'زجاج',
        'metal': 'معادن',
        'general': 'عام'
      }
      return types[type] || type
    }

    const loadLeaflet = () => {
      if (!window.L) {
        // تحميل CSS
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)

        // تحميل JS
        const script = document.createElement('script')
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.onload = initMap
        document.head.appendChild(script)
      } else {
        initMap()
      }
    }

    onMounted(() => {
      loadLeaflet()
    })

    onUnmounted(() => {
      if (map.value) {
        map.value.remove()
      }
    })

    // مراقبة التغييرات في المواقع
    watch(() => props.locations, updateMarkers)
    watch(() => props.selectedLocation, updateMarkers)
    watch(() => props.userLocation, updateMarkers)

    return {
      mapContainer,
      legendItems,
      getArabicType
    }
  }
}
</script>

<style scoped>
.recycling-map {
  position: relative;
  height: 100%;
}

.map-container {
  height: 350px;
  border-radius: 10px;
  overflow: hidden;
}

.map-legend {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: white;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  z-index: 1000;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
  font-size: 12px;
}

.legend-item:last-child {
  margin-bottom: 0;
}

.legend-color {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

.legend-label {
  color: #333;
}

/* تنسيقات Leaflet */
:deep(.leaflet-popup-content) {
  margin: 10px;
  text-align: right;
}

:deep(.leaflet-popup-content h4) {
  margin: 0 0 8px 0;
  color: #333;
}

:deep(.leaflet-popup-content p) {
  margin: 4px 0;
  color: #666;
}

:deep(.map-popup) {
  min-width: 200px;
}

/* تنسيقات العلامات */
:deep(.user-location-marker) {
  background: none;
  border: none;
}

:deep(.recycling-marker) {
  background: none;
  border: none;
}

:deep(.recycling-marker.selected) {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@media (max-width: 768px) {
  .map-container {
    height: 300px;
  }
  
  .map-legend {
    position: relative;
    bottom: auto;
    left: auto;
    margin-top: 10px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .legend-item {
    margin-bottom: 0;
  }
}
</style>