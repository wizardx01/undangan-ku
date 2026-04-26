<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">💌</div>
        <h1>UndanganKu</h1>
        <p>Masuk untuk membuat undangan impian Anda</p>
      </div>
      
      <!-- GOOGLE LOGIN BUTTON -->
      <button class="btn-google" @click="loginWithGoogle" :disabled="googleLoading">
        <span v-if="googleLoading" class="spinner-small"></span>
        <svg class="google-icon-svg" viewBox="0 0 24 24" width="20" height="20">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {{ googleLoading ? 'Menghubungkan...' : 'Masuk dengan Google' }}
      </button>
      
      <div class="login-divider"><span>atau dengan email</span></div>
      
      <div class="tab-switch">
        <button @click="mode = 'login'" :class="{ active: mode === 'login' }">Login</button>
        <button @click="mode = 'register'" :class="{ active: mode === 'register' }">Daftar</button>
      </div>
      
      <!-- FORM LOGIN -->
      <form v-if="mode === 'login'" @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Email</label>
          <div class="input-icon-wrapper">
            <span class="input-icon">📧</span>
            <input v-model="loginForm.email" type="email" placeholder="contoh@email.com" required />
          </div>
        </div>
        
        <div class="form-group">
          <label>Password</label>
          <div class="input-icon-wrapper">
            <span class="input-icon">🔒</span>
            <input v-model="loginForm.password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••" required />
            <button type="button" class="toggle-password" @click="showPassword = !showPassword">{{ showPassword ? '🙈' : '👁️' }}</button>
          </div>
        </div>
        
        <div class="form-options">
          <label class="remember-me"><input type="checkbox" v-model="loginForm.remember" /> Ingat saya</label>
          <a href="#" class="forgot-link" @click.prevent="showForgotForm = !showForgotForm">Lupa password?</a>
        </div>
        
        <button type="submit" class="btn-primary" :disabled="loading">
          <span v-if="loading" class="spinner-small"></span>
          {{ loading ? 'Memeriksa...' : 'Masuk' }}
        </button>
        
        <p v-if="generalError" class="error-message">{{ generalError }}</p>
        
        <!-- LUPA PASSWORD -->
        <div v-if="showForgotForm" class="forgot-form">
          <h4>🔑 Reset Password</h4>
          <p>Masukkan email Anda. Password akan direset ke default.</p>
          <div class="input-icon-wrapper">
            <span class="input-icon">📧</span>
            <input v-model="forgotEmail" type="email" placeholder="Email Anda" />
          </div>
          <button type="button" @click="handleForgotPassword" :disabled="sendingReset" class="btn-forgot">
            {{ sendingReset ? 'Mengirim...' : 'Reset Password' }}
          </button>
          <p v-if="forgotMessage" :class="forgotMessageType">{{ forgotMessage }}</p>
        </div>
      </form>
      
      <!-- FORM REGISTER -->
      <form v-else @submit.prevent="handleRegister">
        <div class="form-group"><label>Nama Lengkap</label><input v-model="registerForm.name" type="text" placeholder="Nama Anda" required /></div>
        <div class="form-group"><label>Email</label><input v-model="registerForm.email" type="email" placeholder="contoh@email.com" required /></div>
        <div class="form-group"><label>Password (min 6 karakter)</label><input v-model="registerForm.password" type="password" placeholder="••••••••" required /></div>
        <div class="form-group"><label>Konfirmasi Password</label><input v-model="registerForm.confirmPassword" type="password" placeholder="••••••••" required /></div>
        
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Mendaftar...' : 'Daftar Sekarang' }}
        </button>
        
        <p v-if="generalError" class="error-message">{{ generalError }}</p>
      </form>
      
      <p class="demo-hint">
        💡 Demo: admin@undanganku.com / admin123<br>
        💡 Demo: user@example.com / user123
      </p>
      
      <p class="back-home"><a href="/">← Kembali ke Beranda</a></p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { hashPassword, comparePassword, generateSessionToken } from '../utils/auth'

const router = useRouter()

const mode = ref('login')
const loading = ref(false)
const generalError = ref('')
const showPassword = ref(false)
const showForgotForm = ref(false)
const forgotEmail = ref('')
const sendingReset = ref(false)
const forgotMessage = ref('')
const forgotMessageType = ref('')
const googleLoading = ref(false)

const loginForm = reactive({ email: '', password: '', remember: false })
const registerForm = reactive({ name: '', email: '', password: '', confirmPassword: '' })

const showNotification = (msg, type = 'success') => alert((type === 'success' ? '✅ ' : '❌ ') + msg)

// ========== GOOGLE LOGIN ==========
const loginWithGoogle = async () => {
  googleLoading.value = true
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard'
      }
    })
    
    if (error) throw error
    
  } catch (err) {
    console.error('Google login error:', err)
    alert('❌ Gagal login dengan Google: ' + (err.message || 'Coba lagi'))
  } finally {
    googleLoading.value = false
  }
}

// ========== CUSTOM LOGIN ==========
const handleLogin = async () => {
  generalError.value = ''
  if (!loginForm.email || !loginForm.password) { generalError.value = 'Email dan password wajib diisi'; return }
  
  loading.value = true
  try {
    localStorage.removeItem('session')
    
    const { data, error } = await supabase.from('users').select('*').eq('email', loginForm.email.toLowerCase()).single()
    if (error) { throw new Error(error.code === 'PGRST116' ? 'Email tidak ditemukan' : error.message) }
    
    if (data.password_hash === 'google-oauth') {
      throw new Error('Akun ini menggunakan Google Login. Silakan klik "Masuk dengan Google".')
    }
    
    let isValid = false
    if (data.password_hash.startsWith('$2a$') || data.password_hash.startsWith('$2b$')) {
      try { isValid = await comparePassword(loginForm.password, data.password_hash) } catch { isValid = (loginForm.password === data.password_hash) }
    } else {
      isValid = (loginForm.password === data.password_hash)
    }
    if (!isValid) throw new Error('Password salah')
    
    const token = generateSessionToken(data)
    localStorage.setItem('session', JSON.stringify({
      user: { id: data.id, email: data.email, name: data.name, role: data.role, plan: data.plan || 'basic' },
      token, expires: Date.now() + (loginForm.remember ? 30 : 1) * 24 * 60 * 60 * 1000
    }))
    
    showNotification(`Selamat datang, ${data.name || data.email}!`)
    router.push(data.role === 'admin' ? '/admin' : '/dashboard')
  } catch (err) { generalError.value = err.message } finally { loading.value = false }
}

// ========== REGISTER ==========
const handleRegister = async () => {
  generalError.value = ''
  if (!registerForm.name || !registerForm.email || !registerForm.password) { generalError.value = 'Semua field wajib diisi'; return }
  if (registerForm.password.length < 6) { generalError.value = 'Password minimal 6 karakter'; return }
  if (registerForm.password !== registerForm.confirmPassword) { generalError.value = 'Password tidak cocok'; return }
  
  loading.value = true
  try {
    const { data: existing } = await supabase.from('users').select('id').eq('email', registerForm.email.toLowerCase()).maybeSingle()
    if (existing) throw new Error('Email sudah terdaftar')
    
    const hashed = await hashPassword(registerForm.password)
    const { error } = await supabase.from('users').insert([{ name: registerForm.name, email: registerForm.email.toLowerCase(), password_hash: hashed, role: 'user', plan: 'basic' }])
    if (error) throw error
    
    showNotification('Pendaftaran berhasil! Silakan login.')
    registerForm.name = ''; registerForm.email = ''; registerForm.password = ''; registerForm.confirmPassword = ''
    mode.value = 'login'
  } catch (err) { generalError.value = err.message } finally { loading.value = false }
}

// ========== FORGOT PASSWORD ==========
const handleForgotPassword = async () => {
  if (!forgotEmail.value) { forgotMessage.value = '❌ Email wajib diisi'; forgotMessageType.value = 'error'; return }
  
  sendingReset.value = true; forgotMessage.value = ''
  try {
    const { data, error } = await supabase.from('users').select('id, password_hash').eq('email', forgotEmail.value.toLowerCase()).single()
    if (error || !data) { forgotMessage.value = '❌ Email tidak ditemukan'; forgotMessageType.value = 'error'; return }
    if (data.password_hash === 'google-oauth') { forgotMessage.value = '❌ Akun Google tidak bisa reset password.'; forgotMessageType.value = 'error'; return }
    
    const newPass = 'user123'; const hashed = await hashPassword(newPass)
    await supabase.from('users').update({ password_hash: hashed }).eq('id', data.id)
    forgotMessage.value = `✅ Password direset!\n\nEmail: ${forgotEmail.value}\nPassword baru: ${newPass}\n\nSegera ganti password setelah login.`
    forgotMessageType.value = 'success'; forgotEmail.value = ''
  } catch (err) { forgotMessage.value = '❌ Gagal'; forgotMessageType.value = 'error' } finally { sendingReset.value = false }
}
</script>

<style scoped>
.login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; }
.login-card { background: white; padding: 40px; border-radius: 30px; width: 100%; max-width: 440px; box-shadow: 0 30px 60px rgba(0,0,0,0.2); }
.login-header { text-align: center; margin-bottom: 25px; }
.logo { font-size: 50px; margin-bottom: 10px; }
.login-header h1 { font-size: 28px; color: #2c3e50; margin-bottom: 8px; }
.login-header p { color: #666; font-size: 14px; }

.btn-google { width: 100%; padding: 14px; background: white; color: #555; border: 2px solid #eee; border-radius: 50px; font-weight: 600; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: background 0.2s; }
.btn-google:hover { background: #f9f9f9; }
.btn-google:disabled { opacity: 0.6; cursor: not-allowed; }
.google-icon-svg { flex-shrink: 0; }

.login-divider { text-align: center; margin: 25px 0; position: relative; }
.login-divider::before { content: ''; position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: #eee; }
.login-divider span { background: white; padding: 0 15px; color: #999; font-size: 14px; position: relative; }

.tab-switch { display: flex; gap: 10px; margin-bottom: 25px; background: #f5f5f5; padding: 5px; border-radius: 50px; }
.tab-switch button { flex: 1; padding: 12px; border: none; background: transparent; border-radius: 50px; font-weight: 600; cursor: pointer; }
.tab-switch button.active { background: #9b87f5; color: white; }

.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #555; font-size: 14px; }
.input-icon-wrapper { position: relative; display: flex; align-items: center; }
.input-icon { position: absolute; left: 15px; font-size: 16px; opacity: 0.6; z-index: 1; }
.input-icon-wrapper input { width: 100%; padding: 14px 16px 14px 45px; border: 2px solid #eee; border-radius: 15px; font-size: 16px; }
.input-icon-wrapper input:focus { outline: none; border-color: #9b87f5; }
.toggle-password { position: absolute; right: 15px; background: none; border: none; font-size: 18px; cursor: pointer; }

.form-options { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; font-size: 14px; }
.remember-me { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.remember-me input { width: auto; margin: 0; }
.forgot-link { color: #9b87f5; text-decoration: none; font-weight: 600; }

.btn-primary { width: 100%; padding: 16px; background: #9b87f5; color: white; border: none; border-radius: 50px; font-weight: 600; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.spinner-small { width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top: 2px solid white; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }
.error-message { color: #ef4444; text-align: center; margin-top: 15px; font-size: 14px; }

.forgot-form { margin-top: 20px; padding: 20px; background: #f9fafb; border-radius: 15px; border: 1px solid #e5e7eb; }
.forgot-form h4 { margin-bottom: 8px; }
.forgot-form p { font-size: 13px; color: #666; margin-bottom: 12px; }
.btn-forgot { width: 100%; padding: 12px; margin-top: 10px; background: #f59e0b; color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; }
.btn-forgot:disabled { opacity: 0.6; }

.demo-hint { text-align: center; margin-top: 20px; font-size: 13px; color: #999; line-height: 1.6; }
.back-home { text-align: center; margin-top: 15px; }
.back-home a { color: #9b87f5; text-decoration: none; }
</style>