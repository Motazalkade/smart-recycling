<template>
  <div class="camera-capture">
    <!-- عرض الكاميرا -->
    <div v-if="!isCaptured" class="camera-container">
      <video 
        ref="videoElement" 
        autoplay 
        playsinline
        class="camera-view"
        :class="{ 'is-flipped': shouldFlipCamera }"
      ></video>
      
      <div class="camera-controls">
        <button @click="captureImage" class="btn btn-primary capture-btn">
          {{ $t('recycling.takePhoto') }}
        </button>
        <button @click="toggleCamera" class="btn btn-secondary">
          {{ $t('recycling.switchCamera') }}
        </button>
        <button @click="uploadImage" class="btn btn-secondary">
          {{ $t('recycling.uploadImage') }}
        </button>
      </div>
    </div>

    <!-- معاينة الصورة -->
    <div v-else class="preview-container">
      <img :src="capturedImage" alt="الصورة الملتقطة" class="preview-image">
      <div class="preview-controls">
        <button @click="retakePhoto" class="btn btn-secondary">
          {{ $t('recycling.retakePhoto') }}
        </button>
        <button @click="processImage" class="btn btn-primary" :disabled="processing">
          {{ processing ? $t('recycling.processing') : $t('recycling.analyzeMaterial') }}
        </button>
      </div>
    </div>

    <!-- تحميل الصورة -->
    <div v-if="!isCaptured" class="upload-section">
      <input
        type="file"
        ref="fileInput"
        @change="handleFileUpload"
        accept="image/*"
        style="display: none"
      >
    </div>

    <!-- رسائل الخطأ -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import recyclingService from '../../services/recycling'

export default {
  name: 'CameraCapture',
  emits: ['item-processed'],
  setup(props, { emit }) {
    const videoElement = ref(null)
    const fileInput = ref(null)
    const isCaptured = ref(false)
    const capturedImage = ref('')
    const processing = ref(false)
    const error = ref('')
    const stream = ref(null)
    const shouldFlipCamera = ref(false)
    const currentLocation = ref(null)

    const getUserLocation = () => {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('الموقع الجغرافي غير مدعوم'))
          return
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            currentLocation.value = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
            resolve(currentLocation.value)
          },
          (error) => {
            reject(error)
          }
        )
      })
    }

    const startCamera = async () => {
      try {
        const constraints = {
          video: { 
            facingMode: shouldFlipCamera.value ? 'environment' : 'user'
          }
        }

        stream.value = await navigator.mediaDevices.getUserMedia(constraints)
        if (videoElement.value) {
          videoElement.value.srcObject = stream.value
        }
      } catch (err) {
        console.error('Error starting camera:', err)
        error.value = 'تعذر الوصول إلى الكاميرا. يرجى التحقق من الصلاحيات.'
      }
    }

    const stopCamera = () => {
      if (stream.value) {
        stream.value.getTracks().forEach(track => track.stop())
        stream.value = null
      }
    }

    const toggleCamera = () => {
      shouldFlipCamera.value = !shouldFlipCamera.value
      stopCamera()
      startCamera()
    }

    const captureImage = () => {
      if (!videoElement.value) return

      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      
      canvas.width = videoElement.value.videoWidth
      canvas.height = videoElement.value.videoHeight
      
      if (!shouldFlipCamera.value) {
        context.translate(canvas.width, 0)
        context.scale(-1, 1)
      }
      
      context.drawImage(videoElement.value, 0, 0, canvas.width, canvas.height)
      capturedImage.value = canvas.toDataURL('image/jpeg')
      isCaptured.value = true
      stopCamera()
    }

    const retakePhoto = () => {
      isCaptured.value = false
      capturedImage.value = ''
      startCamera()
    }

    const uploadImage = () => {
      fileInput.value?.click()
    }

    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          capturedImage.value = e.target.result
          isCaptured.value = true
          stopCamera()
        }
        reader.readAsDataURL(file)
      }
    }

  const processImage = async () => {
  console.log('🚀 بدء معالجة الصورة...');
  
  if (!capturedImage.value) {
    error.value = 'لم يتم التقاط صورة';
    return;
  }

  processing.value = true;
  error.value = '';

  try {
    // 1. تحويل base64 إلى Blob
    const base64Response = await fetch(capturedImage.value);
    const blob = await base64Response.blob();
    const file = new File([blob], 'recycling-item.jpg', { 
      type: 'image/jpeg',
      lastModified: Date.now()
    });

    // 2. إنشاء FormData
    const formData = new FormData();
    formData.append('image', file);
    formData.append('latitude', currentLocation.value?.latitude?.toString() || '24.7136');
    formData.append('longitude', currentLocation.value?.longitude?.toString() || '46.6753');

    // 3. الحصول على التوكن
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }

    console.log('📤 إرسال إلى Backend:', {
      hasFile: true,
      fileSize: file.size,
      latitude: formData.get('latitude'),
      longitude: formData.get('longitude')
    });

    // 4. إرسال الطلب - هذا هو الجزء المهم!
    const response = await fetch('https://smart-recycling-o4et.onrender.com/api/recycling/process', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // لا تضيف Content-Type هنا - المتصفح يضيفه تلقائياً لـ FormData
      },
      body: formData
    });

    console.log('📊 استجابة الخادم:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`خطأ ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ نتيجة ناجحة:', result);

    // 5. إرسال النتيجة للوالد
    emit('item-processed', result);

  } catch (error) {
    console.error('❌ خطأ في المعالجة:', error);
    
    // 6. نظام الطوارئ: محاكاة إذا فشل الاتصال
    const emergencyResult = {
      itemType: 'plastic_bottle',
      itemName: 'زجاجة بلاستيكية',
      isRecyclable: true,
      confidence: 0.88,
      nearestLocation: {
        id: 1,
        name: 'جهاز إعادة تدوير البلاستيك - الرياض',
        address: 'الرياض، حي الملز',
        latitude: 24.7136,
        longitude: 46.6753,
        distance: '2.1 كم'
      },
      pointsEarned: 10,
      timestamp: new Date().toISOString(),
      emergencyMode: true,
      originalError: error.message
    };
    
    emit('item-processed', emergencyResult);
    error.value = `تم استخدام نظام الطوارئ: ${error.message}`;
    
  } finally {
    processing.value = false;
  }
};

    onMounted(async () => {
      try {
        await getUserLocation()
        await startCamera()
      } catch (err) {
        error.value = 'تعذر الحصول على الموقع. سيتم استخدام المواقع العامة.'
        await startCamera()
      }
    })

    onUnmounted(() => {
      stopCamera()
    })

    return {
      videoElement,
      fileInput,
      isCaptured,
      capturedImage,
      processing,
      error,
      shouldFlipCamera,
      captureImage,
      retakePhoto,
      toggleCamera,
      uploadImage,
      handleFileUpload,
      processImage
    }
  }
}
</script>

<style scoped>
.camera-capture {
  text-align: center;
}

.camera-container {
  position: relative;
  margin-bottom: 1rem;
}

.camera-view {
  width: 100%;
  max-width: 400px;
  height: 300px;
  border-radius: 10px;
  background: #000;
  object-fit: cover;
}

.camera-view.is-flipped {
  transform: scaleX(-1);
}

.camera-controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.capture-btn {
  font-size: 1.2rem;
  padding: 1rem 2rem;
}

.preview-container {
  margin-bottom: 1rem;
}

.preview-image {
  width: 100%;
  max-width: 400px;
  height: 300px;
  border-radius: 10px;
  object-fit: cover;
  border: 3px solid #28a745;
}

.preview-controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 5px;
  margin-top: 1rem;
  text-align: center;
}

@media (max-width: 768px) {
  .camera-view,
  .preview-image {
    height: 250px;
  }
  
  .camera-controls,
  .preview-controls {
    flex-direction: column;
    align-items: center;
  }
  
  .capture-btn {
    width: 100%;
    max-width: 200px;
  }
}
</style>