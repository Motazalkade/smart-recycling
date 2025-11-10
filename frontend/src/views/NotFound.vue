<template>
  <div class="not-found">
    <div class="container">
      <div class="error-content">
        <div class="error-icon">🔍</div>
        <h1>الصفحة غير موجودة</h1>
        <p>عذراً، الصفحة التي تبحث عنها غير موجودة.</p>
        <div class="actions">
          <router-link to="/" class="btn btn-primary">العودة للرئيسية</router-link>
          <router-link to="/login" class="btn btn-secondary">تسجيل الدخول</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: white;
  text-align: center;
}

.error-content {
  max-width: 400px;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 2rem;
}

.error-content h1 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 2rem;
}

.error-content p {
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  border-radius: 5px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>