<template>
  <div class="welcome">
    <div class="welcome-container">
      <!-- الشعار في الأعلى -->
      <div class="logo-section">
        <img src="@/assets/logo.png" alt="شعار إعادة التدوير" class="logo">
        <h1 class="app-name">{{ $t('app.name') }}</h1>
      </div>

      <!-- رسالة الترحيب -->
      <div class="welcome-message">
        <h2>{{ $t('welcome.title') }}</h2>
        <p>{{ $t('welcome.subtitle') }}</p>
      </div>

      <!-- اختيار اللغة -->
      <div class="language-selection">
        <h3>{{ $t('welcome.chooseLanguage') }}</h3>
        <div class="language-options">
          <button 
            @click="selectLanguage('ar')" 
            class="language-btn"
            :class="{ 'selected': selectedLanguage === 'ar' }"
          >
            <span class="flag">🇸🇦</span>
            <span class="language-name">العربية</span>
          </button>
          <button 
            @click="selectLanguage('en')" 
            class="language-btn"
            :class="{ 'selected': selectedLanguage === 'en' }"
          >
            <span class="flag">🇺🇸</span>
            <span class="language-name">English</span>
          </button>
        </div>
      </div>

      <!-- زر المتابعة -->
      <div class="continue-section">
        <button @click="continueToApp" class="btn btn-primary continue-btn">
          {{ $t('welcome.continue') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

export default {
  name: 'Welcome',
  setup() {
    const router = useRouter()
    const { locale } = useI18n()
    const selectedLanguage = ref('ar') // اللغة الافتراضية العربية

    const selectLanguage = (lang) => {
      selectedLanguage.value = lang
      locale.value = lang
      // حفظ اللغة في localStorage
      localStorage.setItem('userLanguage', lang)
      
      // تغيير اتجاه الصفحة بناءً على اللغة
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
      document.documentElement.lang = lang
    }

    const continueToApp = () => {
      router.push('/')
    }

    onMounted(() => {
      // تحميل اللغة المحفوظة إذا كانت موجودة
      const savedLanguage = localStorage.getItem('userLanguage')
      if (savedLanguage) {
        selectedLanguage.value = savedLanguage
        locale.value = savedLanguage
        document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr'
        document.documentElement.lang = savedLanguage
      }
    })

    return {
      selectedLanguage,
      selectLanguage,
      continueToApp
    }
  }
}
</script>

<style scoped>
.welcome {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: white;
  padding: 2rem;
}

.welcome-container {
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.logo-section {
  margin-bottom: 3rem;
}

.logo {
  width: 150px;
  height: 150px;
  margin-bottom: 1rem;
}

.app-name {
  color: #28a745;
  font-size: 2.5rem;
  margin: 0;
  font-weight: bold;
}

.welcome-message {
  margin-bottom: 3rem;
}

.welcome-message h2 {
  color: #333;
  font-size: 2rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.welcome-message p {
  color: #666;
  font-size: 1.2rem;
  line-height: 1.6;
}

.language-selection {
  margin-bottom: 3rem;
}

.language-selection h3 {
  color: #333;
  margin-bottom: 2rem;
  font-size: 1.5rem;
}

.language-options {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.language-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 2rem;
  border: 2px solid #e9ecef;
  border-radius: 15px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.language-btn:hover {
  border-color: #28a745;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.language-btn.selected {
  border-color: #28a745;
  background: #f8fff9;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(40, 167, 69, 0.2);
}

.flag {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.language-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.continue-section {
  margin-top: 2rem;
}

.continue-btn {
  padding: 1rem 3rem;
  font-size: 1.2rem;
  border-radius: 50px;
  min-width: 200px;
}

@media (max-width: 768px) {
  .welcome {
    padding: 1rem;
  }
  
  .logo {
    width: 120px;
    height: 120px;
  }
  
  .app-name {
    font-size: 2rem;
  }
  
  .welcome-message h2 {
    font-size: 1.5rem;
  }
  
  .welcome-message p {
    font-size: 1rem;
  }
  
  .language-btn {
    padding: 1rem 1.5rem;
    min-width: 100px;
  }
  
  .flag {
    font-size: 2rem;
  }
}
</style>