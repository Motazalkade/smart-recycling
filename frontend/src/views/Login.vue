<template>
  <div class="login">
    <div class="container">
      <div class="login-form">
        <div class="logo-section">
          <img src="@/assets/logo.png" alt="شعار إعادة التدوير" class="logo">
          <h1>إعادة التدوير الذكي</h1>
        </div>
        <h2>تسجيل الدخول</h2>
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="email">البريد الإلكتروني</label>
            <input
              type="email"
              id="email"
              v-model="form.email"
              required
              placeholder="ادخل بريدك الإلكتروني"
            >
          </div>
          <div class="form-group">
            <label for="password">كلمة المرور</label>
            <input
              type="password"
              id="password"
              v-model="form.password"
              required
              placeholder="ادخل كلمة المرور"
            >
          </div>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'جاري الدخول...' : 'تسجيل الدخول' }}
          </button>
        </form>
        <p class="register-link">
          ليس لديك حساب؟ <router-link to="/register">إنشاء حساب جديد</router-link>
        </p>
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'Login',
  setup() {
    const store = useStore()
    const router = useRouter()

    const form = ref({
      email: '',
      password: ''
    })
    const loading = ref(false)
    const error = ref('')

          const handleLogin = async () => {
        loading.value = true
        error.value = ''

        try {
          await store.dispatch('login', form.value)
          // التحقق إذا كان المستخدم قد اختار اللغة مسبقاً
          const userLanguage = localStorage.getItem('userLanguage')
          if (userLanguage) {
            router.push('/')
          } else {
            router.push('/welcome')
          }
        } catch (err) {
          error.value = err.response?.data?.message || 'حدث خطأ أثناء التسجيل'
        } finally {
          loading.value = false
        }
      }

    return {
      form,
      loading,
      error,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: white;
}

.login-form {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.logo-section {
  margin-bottom: 2rem;
}

.logo {
  width: 100px;
  height: 100px;
  margin-bottom: 1rem;
}

.login-form h1 {
  color: #28a745;
  margin-bottom: 0.5rem;
}

.login-form h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.form-group {
  margin-bottom: 1.5rem;
  text-align: right;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #28a745;
}

.btn {
  width: 100%;
  padding: 12px;
  font-size: 16px;
}

.register-link {
  text-align: center;
  margin-top: 1rem;
  color: #666;
}

.register-link a {
  color: #28a745;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 5px;
  margin-top: 1rem;
  text-align: center;
}
</style>