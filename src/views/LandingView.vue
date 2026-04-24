<template>
  <div class="landing">
    <!-- NAVBAR -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="logo" @click="scrollToTop">
          <img src="/favicon.svg" alt="UndanganKu" class="logo-icon" />
          <span>UndanganKu</span>
        </div>
        
        <!-- NAVBAR: BELUM LOGIN -->
        <div class="nav-actions" v-if="!isLoggedIn">
          <button @click="router.push('/login')" class="btn-login">Masuk</button>
          <button @click="router.push('/login')" class="btn-register">Coba Gratis</button>
        </div>

        <!-- NAVBAR: SUDAH LOGIN -->
        <div class="nav-actions" v-else>
          <div class="user-info-nav">
            <span class="user-avatar">👤</span>
            <span class="user-name">{{ userName }}</span>
          </div>
          <button @click="goToDashboard" class="btn-dashboard">📋 Dashboard</button>
          <button @click="handleLogout" class="btn-logout-nav">🚪 Keluar</button>
        </div>
      </div>
    </nav>

    <!-- HERO SECTION -->
    <section class="hero">
      <div class="hero-content">
        <h1>
          <span v-if="isLoggedIn">Lanjutkan Bikin Undangan Impianmu!</span>
          <span v-else>Buat Undangan Online <span class="highlight">Elegan & Mudah</span></span>
        </h1>
        <p>Pernikahan • Aqiqah • Syukuran • Sunatan</p>
        <p class="hero-sub">Dilengkapi Countdown, RSVP, Galeri, Amplop Digital & Gift Registry</p>
        <div class="hero-buttons">
          <button v-if="!isLoggedIn" @click="router.push('/login')" class="btn-primary">✨ Mulai Sekarang - Gratis!</button>
          <button v-else @click="router.push('/dashboard')" class="btn-primary">📋 Ke Dashboard</button>
          <button @click="scrollToDemo" class="btn-secondary">👀 Lihat Demo</button>
        </div>
        <div class="hero-stats">
          <span>✅ Tanpa Kartu Kredit</span>
          <span>⏱️ Selesai dalam 5 Menit</span>
          <span>📱 Mobile Friendly</span>
        </div>
      </div>
      <div class="hero-image">
        <div class="mockup-phone">
          <div class="phone-screen">
            <div class="phone-content">
              <div class="demo-cover">
                <p class="demo-subtitle">The Wedding Of</p>
                <h3>Budi & Ani</h3>
                <p class="demo-date">25 Desember 2024</p>
                <p class="demo-guest">Kepada Yth.<br><strong>Bapak Ahmad</strong></p>
                <button class="demo-btn" @click="goToLoginOrDashboard">💌 Buka Undangan</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- TRUSTED BY -->
    <section class="trusted">
      <p>Dipercaya oleh Ratusan Pasangan</p>
      <div class="trusted-logos">
        <span>💍 200+ Wedding</span>
        <span>👶 150+ Aqiqah</span>
        <span>🏠 100+ Syukuran</span>
        <span>✂️ 50+ Sunatan</span>
      </div>
    </section>

    <!-- TEMPLATES SECTION -->
    <section class="templates" id="demo">
      <h2>🎨 Pilih Template Sesuai Selera</h2>
      <p>Cocok untuk berbagai acara. Klik template untuk mencoba!</p>
      
      <div class="template-grid">
        <div class="template-card" @click="goToLoginOrDashboard">
          <div class="template-preview elegan">
            <span>💐</span>
          </div>
          <h3>Elegan</h3>
          <p>Cocok untuk wedding & acara formal</p>
          <ul>
            <li>🌸 Ornamen bunga</li>
            <li>🎨 Warna ungu mewah</li>
            <li>📸 Hero section foto</li>
          </ul>
        </div>
        
        <div class="template-card" @click="goToLoginOrDashboard">
          <div class="template-preview minimalis">
            <span>✨</span>
          </div>
          <h3>Minimalis</h3>
          <p>Untuk yang suka simpel & modern</p>
          <ul>
            <li>⬜ Desain bersih</li>
            <li>✒️ Font modern</li>
            <li>⚡ Loading cepat</li>
          </ul>
        </div>
        
        <div class="template-card" @click="goToLoginOrDashboard">
          <div class="template-preview floral">
            <span>🌸</span>
          </div>
          <h3>Floral</h3>
          <p>Romantis & lembut untuk wedding</p>
          <ul>
            <li>🌷 Warna pink soft</li>
            <li>💕 Border floral</li>
            <li>🎀 Animasi lembut</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- FEATURES SECTION -->
    <section class="features">
      <h2>✨ Fitur Lengkap dalam Satu Undangan</h2>
      
      <div class="feature-grid">
        <div class="feature-card">
          <div class="feature-icon">⏳</div>
          <h3>Countdown Timer</h3>
          <p>Hitung mundur ke hari H, bikin tamu makin antusias</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">✅</div>
          <h3>RSVP Online</h3>
          <p>Tamu bisa konfirmasi hadir langsung dari undangan</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">📸</div>
          <h3>Galeri Foto</h3>
          <p>Pamerkan foto prewedding dengan slider cantik</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">🎁</div>
          <h3>Gift Registry</h3>
          <p>List kado impian, tamu bisa langsung beli & lacak</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">🎵</div>
          <h3>Musik Latar</h3>
          <p>Upload lagu favorit untuk suasana romantis</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">🔗</div>
          <h3>Link Personal</h3>
          <p>Setiap tamu dapat link unik dengan nama mereka</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">💬</div>
          <h3>Pesan & Doa</h3>
          <p>Tamu bisa kirim ucapan langsung di undangan</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">📊</div>
          <h3>Dashboard Tracking</h3>
          <p>Pantau siapa yang sudah buka, hadir, dan kirim kado</p>
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="how-it-works">
      <h2>🚀 Cara Kerja (Cuma 3 Langkah!)</h2>
      
      <div class="steps">
        <div class="step">
          <div class="step-number">1</div>
          <h3>Isi Data</h3>
          <p>Nama mempelai, tanggal, lokasi, upload foto & musik</p>
        </div>
        <div class="step-arrow">→</div>
        <div class="step">
          <div class="step-number">2</div>
          <h3>Tambah Tamu</h3>
          <p>Input nama tamu atau upload CSV, dapat link personal</p>
        </div>
        <div class="step-arrow">→</div>
        <div class="step">
          <div class="step-number">3</div>
          <h3>Share Undangan</h3>
          <p>Kirim via WhatsApp atau copy link-nya</p>
        </div>
      </div>
    </section>

    <!-- PRICING -->
    <section class="pricing">
      <h2>💎 Pilih Paket</h2>
      
      <div class="pricing-grid">
        <div class="pricing-card">
          <h3>Basic</h3>
          <div class="price">Gratis</div>
          <p class="price-sub">Selamanya</p>
          <ul>
            <li>✅ 1 Undangan</li>
            <li>✅ 20 Tamu</li>
            <li>✅ 3 Kado</li>
            <li>✅ 3 Template</li>
            <li>✅ Countdown & RSVP</li>
          </ul>
          <button @click="router.push('/login')" class="btn-pricing">Mulai Gratis</button>
        </div>
        
        <div class="pricing-card popular">
          <div class="popular-badge">🔥 Terpopuler</div>
          <h3>Premium</h3>
          <div class="price">Rp 199rb</div>
          <p class="price-sub">Per Undangan</p>
          <ul>
            <li>✅ Unlimited Tamu</li>
            <li>✅ Unlimited Kado</li>
            <li>✅ Custom Domain</li>
            <li>✅ Priority Support</li>
            <li>✅ Semua fitur Basic</li>
          </ul>
          <button @click="router.push('/login')" class="btn-pricing btn-popular">Pilih Premium</button>
        </div>
        
        <div class="pricing-card">
          <h3>Enterprise</h3>
          <div class="price">Rp 399rb</div>
          <p class="price-sub">Per Tahun</p>
          <ul>
            <li>✅ Unlimited Undangan</li>
            <li>✅ White Label</li>
            <li>✅ API Access</li>
            <li>✅ Dedicated Support</li>
            <li>✅ Semua fitur Premium</li>
          </ul>
          <button @click="router.push('/login')" class="btn-pricing">Hubungi Kami</button>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta">
      <h2>Siap Bikin Undangan Impian?</h2>
      <p>Mulai sekarang, gratis! Hanya perlu 5 menit.</p>
      <button @click="goToLoginOrDashboard" class="btn-cta">✨ Buat Undangan Gratis</button>
    </section>

    <!-- FOOTER -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-brand">
          <h3>
            <img src="/favicon.svg" alt="UndanganKu" class="footer-logo" />
            UndanganKu
          </h3>
          <p>Buat undangan online elegan untuk wedding, aqiqah, syukuran, dan sunatan.</p>
        </div>
        <div class="footer-links">
          <h4>Fitur</h4>
          <a href="#">Countdown</a>
          <a href="#">RSVP</a>
          <a href="#">Gift Registry</a>
          <a href="#">Galeri Foto</a>
        </div>
        <div class="footer-links">
          <h4>Template</h4>
          <a href="#">Elegan</a>
          <a href="#">Minimalis</a>
          <a href="#">Floral</a>
        </div>
        <div class="footer-links">
          <h4>Kontak</h4>
          <a href="#">Email</a>
          <a href="#">WhatsApp</a>
          <a href="#">Instagram</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2024 UndanganKu. Made with ❤️</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Check login status
const isLoggedIn = ref(false)
const sessionUser = ref(null)

const userName = computed(() => {
  if (sessionUser.value?.name) return sessionUser.value.name
  if (sessionUser.value?.email) return sessionUser.value.email.split('@')[0]
  return 'User'
})

// Check session on mount
onMounted(() => {
  const session = JSON.parse(localStorage.getItem('session') || 'null')
  if (session?.user) {
    isLoggedIn.value = true
    sessionUser.value = session.user
  }
})

// Navigation
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const scrollToDemo = () => {
  const demoSection = document.getElementById('demo')
  if (demoSection) {
    const top = demoSection.getBoundingClientRect().top + window.pageYOffset - 80
    window.scrollTo({ top, behavior: 'smooth' })
  }
}

const goToLoginOrDashboard = () => {
  if (isLoggedIn.value) {
    router.push('/dashboard')
  } else {
    router.push('/login')
  }
}

const goToDashboard = () => {
  router.push('/dashboard')
}

const handleLogout = () => {
  localStorage.removeItem('session')
  isLoggedIn.value = false
  sessionUser.value = null
  router.push('/')
}
</script>

<style scoped>
.landing {
  font-family: 'Poppins', sans-serif;
  color: #2c3e50;
  overflow-x: hidden;
}

/* NAVBAR */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(0,0,0,0.05);
  z-index: 1000;
  padding: 15px 0;
}
.nav-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 24px;
  font-weight: 700;
  cursor: pointer;
}
.logo-icon {
  width: 32px;
  height: 32px;
}
.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Navbar - Logged In */
.user-info-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 5px;
}
.user-avatar {
  font-size: 20px;
}
.user-name {
  font-weight: 600;
  color: #555;
  font-size: 14px;
}
.btn-dashboard {
  padding: 10px 20px;
  background: #9b87f5;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
}
.btn-dashboard:hover {
  background: #7e69e0;
}
.btn-logout-nav {
  padding: 10px 16px;
  background: transparent;
  color: #ef4444;
  border: 1px solid #fecaca;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
}
.btn-logout-nav:hover {
  background: #fef2f2;
}

/* Navbar - Not Logged In */
.btn-login {
  padding: 10px 20px;
  background: transparent;
  border: 1px solid #ddd;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
}
.btn-login:hover {
  background: #f5f5f5;
}
.btn-register {
  padding: 10px 20px;
  background: #9b87f5;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
}
.btn-register:hover {
  background: #7e69e0;
}

/* HERO */
.hero {
  max-width: 1100px;
  margin: 0 auto;
  padding: 120px 20px 80px;
  display: flex;
  align-items: center;
  gap: 60px;
  flex-wrap: wrap;
}
.hero-content {
  flex: 1;
  min-width: 300px;
}
.hero-content h1 {
  font-size: 48px;
  line-height: 1.2;
  margin-bottom: 15px;
}
.highlight {
  color: #9b87f5;
}
.hero-content p {
  font-size: 18px;
  color: #666;
  margin-bottom: 10px;
}
.hero-sub {
  font-size: 16px !important;
  color: #888 !important;
  margin-bottom: 30px !important;
}
.hero-buttons {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}
.btn-primary {
  padding: 16px 32px;
  background: #9b87f5;
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-primary:hover {
  background: #7e69e0;
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(155,135,245,0.3);
}
.btn-secondary {
  padding: 16px 32px;
  background: white;
  color: #9b87f5;
  border: 2px solid #9b87f5;
  border-radius: 50px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-secondary:hover {
  background: #f5f0ff;
}
.hero-stats {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #888;
  flex-wrap: wrap;
}
.hero-image {
  flex: 1;
  display: flex;
  justify-content: center;
}
.mockup-phone {
  width: 280px;
  height: 560px;
  background: #2c3e50;
  border-radius: 40px;
  padding: 15px;
  box-shadow: 0 30px 60px rgba(0,0,0,0.2);
}
.phone-screen {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 30px;
  overflow: hidden;
}
.phone-content {
  padding: 30px 20px;
  text-align: center;
}
.demo-cover {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 450px;
}
.demo-subtitle {
  font-size: 11px;
  letter-spacing: 3px;
  opacity: 0.6;
  text-transform: uppercase;
}
.demo-cover h3 {
  font-size: 22px;
  margin: 15px 0;
  font-family: 'Playfair Display', serif;
}
.demo-date {
  font-size: 13px;
  opacity: 0.7;
  margin-bottom: 25px;
}
.demo-guest {
  margin: 25px 0;
  font-size: 13px;
}
.demo-guest strong {
  font-size: 18px;
  display: block;
  margin-top: 5px;
  color: #9b87f5;
}
.demo-btn {
  background: #9b87f5;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 50px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 20px;
}

/* TRUSTED */
.trusted {
  text-align: center;
  padding: 50px 20px;
  background: #f9fafb;
}
.trusted p {
  font-weight: 600;
  margin-bottom: 20px;
  font-size: 18px;
}
.trusted-logos {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
}
.trusted-logos span {
  font-size: 18px;
  font-weight: 600;
  color: #666;
}

/* TEMPLATES */
.templates {
  max-width: 1100px;
  margin: 0 auto;
  padding: 80px 20px;
  text-align: center;
}
.templates h2 {
  font-size: 36px;
  margin-bottom: 10px;
}
.templates > p {
  color: #666;
  margin-bottom: 50px;
}
.template-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}
.template-card {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  transition: all 0.3s;
  cursor: pointer;
}
.template-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}
.template-preview {
  width: 100%;
  height: 150px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60px;
  margin-bottom: 20px;
}
.template-preview.elegan {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}
.template-preview.minimalis {
  background: #f5f5f5;
  color: #333;
}
.template-preview.floral {
  background: linear-gradient(135deg, #fbcfe8, #f9a8d4);
  color: white;
}
.template-card h3 {
  margin-bottom: 10px;
}
.template-card p {
  color: #666;
  font-size: 14px;
  margin-bottom: 15px;
}
.template-card ul {
  list-style: none;
  padding: 0;
  text-align: left;
}
.template-card ul li {
  padding: 5px 0;
  font-size: 14px;
  color: #555;
}

/* FEATURES */
.features {
  max-width: 1100px;
  margin: 0 auto;
  padding: 80px 20px;
  text-align: center;
}
.features h2 {
  font-size: 36px;
  margin-bottom: 50px;
}
.feature-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 25px;
}
.feature-card {
  background: white;
  padding: 30px 20px;
  border-radius: 20px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.05);
  transition: transform 0.2s;
}
.feature-card:hover {
  transform: translateY(-5px);
}
.feature-icon {
  font-size: 40px;
  margin-bottom: 15px;
}
.feature-card h3 {
  margin-bottom: 10px;
  font-size: 18px;
}
.feature-card p {
  color: #666;
  font-size: 14px;
}

/* HOW IT WORKS */
.how-it-works {
  max-width: 1100px;
  margin: 0 auto;
  padding: 80px 20px;
  text-align: center;
}
.how-it-works h2 {
  font-size: 36px;
  margin-bottom: 50px;
}
.steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}
.step {
  background: white;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.05);
  flex: 1;
  min-width: 200px;
}
.step-number {
  width: 50px;
  height: 50px;
  background: #9b87f5;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  margin: 0 auto 15px;
}
.step-arrow {
  font-size: 30px;
  color: #9b87f5;
}

/* PRICING */
.pricing {
  max-width: 1100px;
  margin: 0 auto;
  padding: 80px 20px;
  text-align: center;
}
.pricing h2 {
  font-size: 36px;
  margin-bottom: 50px;
}
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}
.pricing-card {
  background: white;
  padding: 40px 30px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  position: relative;
  transition: transform 0.3s;
}
.pricing-card:hover {
  transform: translateY(-5px);
}
.pricing-card.popular {
  border: 2px solid #9b87f5;
  transform: scale(1.05);
}
.pricing-card.popular:hover {
  transform: scale(1.08);
}
.popular-badge {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  background: #9b87f5;
  color: white;
  padding: 5px 20px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
}
.price {
  font-size: 42px;
  font-weight: 700;
  margin: 15px 0 5px;
}
.price-sub {
  color: #666;
  margin-bottom: 25px;
}
.pricing-card ul {
  list-style: none;
  padding: 0;
  text-align: left;
  margin-bottom: 30px;
}
.pricing-card ul li {
  padding: 8px 0;
  font-size: 14px;
}
.btn-pricing {
  width: 100%;
  padding: 14px;
  background: #f0f0f0;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-pricing:hover {
  background: #e0e0e0;
}
.btn-popular {
  background: #9b87f5;
  color: white;
}
.btn-popular:hover {
  background: #7e69e0;
}

/* CTA */
.cta {
  background: linear-gradient(135deg, #667eea, #764ba2);
  padding: 80px 20px;
  text-align: center;
  color: white;
}
.cta h2 {
  font-size: 36px;
  margin-bottom: 15px;
}
.cta p {
  font-size: 18px;
  margin-bottom: 30px;
  opacity: 0.9;
}
.btn-cta {
  padding: 18px 40px;
  background: white;
  color: #9b87f5;
  border: none;
  border-radius: 50px;
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-cta:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.2);
}

/* FOOTER */
.footer {
  background: #2c3e50;
  color: white;
  padding: 60px 20px 20px;
}
.footer-content {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 40px;
  margin-bottom: 40px;
}
.footer-brand h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.footer-logo {
  width: 24px;
  height: 24px;
}
.footer-brand p {
  opacity: 0.7;
  font-size: 14px;
}
.footer-links h4 {
  margin-bottom: 15px;
}
.footer-links a {
  display: block;
  color: rgba(255,255,255,0.7);
  text-decoration: none;
  padding: 5px 0;
  font-size: 14px;
  transition: color 0.2s;
}
.footer-links a:hover {
  color: white;
}
.footer-bottom {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid rgba(255,255,255,0.1);
  opacity: 0.7;
  font-size: 14px;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .hero {
    flex-direction: column;
    padding-top: 100px;
  }
  .hero-content h1 {
    font-size: 32px;
  }
  .template-grid {
    grid-template-columns: 1fr;
  }
  .feature-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .pricing-grid {
    grid-template-columns: 1fr;
  }
  .pricing-card.popular {
    transform: none;
  }
  .footer-content {
    grid-template-columns: 1fr 1fr;
  }
  .steps {
    flex-direction: column;
  }
  .step-arrow {
    transform: rotate(90deg);
  }
}

@media (max-width: 480px) {
  .feature-grid {
    grid-template-columns: 1fr;
  }
  .footer-content {
    grid-template-columns: 1fr;
  }
  .hero-buttons {
    flex-direction: column;
  }
}
</style>