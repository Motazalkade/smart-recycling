<template>
  <div class="register">
    <div class="container">
      <div class="register-form">
        <div class="logo-section">
          <img src="@/assets/logo.png" alt="شعار إعادة التدوير" class="logo">
          <h1>إعادة التدوير الذكي</h1>
        </div>
        <h2>إنشاء حساب جديد</h2>
        <form @submit.prevent="handleRegister">
          <div class="form-group">
            <label for="username">اسم المستخدم</label>
            <input
              type="text"
              id="username"
              v-model="form.username"
              required
              placeholder="ادخل اسم المستخدم"
              minlength="3"
            >
          </div>
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
              minlength="6"
            >
          </div>
          <div class="form-group">
            <label for="confirmPassword">تأكيد كلمة المرور</label>
            <input
              type="password"
              id="confirmPassword"
              v-model="form.confirmPassword"
              required
              placeholder="أعد إدخال كلمة المرور"
            >
          </div>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب' }}
          </button>
        </form>
        <p class="login-link">
          لديك حساب already? <router-link to="/login">تسجيل الدخول</router-link>
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
  name: 'Register',
  setup() {
    const store = useStore()
    const router = useRouter()

    const form = ref({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    })
    const loading = ref(false)
    const error = ref('')

            const handleRegister = async () => {
          if (form.value.password !== form.value.confirmPassword) {
            error.value = 'كلمات المرور غير متطابقة'
            return
          }

          if (form.value.password.length < 6) {
            error.value = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
            return
          }

          loading.value = true
          error.value = ''

          try {
            const { confirmPassword, ...registerData } = form.value
            await store.dispatch('register', registerData)
            // توجيه مباشر لصفحة الترحيب بعد التسجيل
            router.push('/welcome')
          } catch (err) {
            error.value = err.response?.data?.message || 'حدث خطأ أثناء إنشاء الحساب'
          } finally {
            loading.value = false
          }
        }

    return {
      form,
      loading,
      error,
      handleRegister
    }
  }
}
</script>

<style scoped>
.register {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: white;
}

.register-form {
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

.register-form h1 {
  color: #28a745;
  margin-bottom: 0.5rem;
}

.register-form h2 {
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

.login-link {
  text-align: center;
  margin-top: 1rem;
  color: #666;
}

.login-link a {
  color: #28a745;
  text-decoration: none;
}

.login-link a:hover {
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