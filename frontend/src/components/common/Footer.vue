<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h3>♻️ {{ $t('app.name') }}</h3>
          <p>{{ $t('footer.description') }}</p>
        </div>
        <div class="footer-section">
          <h4>{{ $t('footer.quickLinks') }}</h4>
          <ul>
            <li><router-link to="/">{{ $t('common.home') }}</router-link></li>
            <li><router-link to="/recycling">{{ $t('common.recycling') }}</router-link></li>
            <li><router-link to="/profile">{{ $t('common.profile') }}</router-link></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>{{ $t('footer.contactInfo') }}</h4>
          <p>{{ $t('footer.email') }}: info@recycling.com</p>
          <p>{{ $t('footer.phone') }}: +966 123 456 789</p>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2025 {{ $t('app.name') }}. {{ $t('footer.rights') }}</p>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script>

<style scoped>
.footer {
  background-color: #333;
  color: white;
  padding: 2rem 0 1rem;
  margin-top: auto;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-section h3,
.footer-section h4 {
  margin-bottom: 1rem;
  color: #28a745;
}

.footer-section ul {
  list-style: none;
}

.footer-section ul li {
  margin-bottom: 0.5rem;
}

.footer-section a {
  color: #ccc;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-section a:hover {
  color: #28a745;
}

.footer-bottom {
  border-top: 1px solid #555;
  padding-top: 1rem;
  text-align: center;
  color: #ccc;
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
}
</style>