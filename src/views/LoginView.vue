<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">💌</div>
        <h1>UndanganKu</h1>
        <p>Masuk untuk membuat undangan pernikahan impian Anda</p>
      </div>
      
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
            <input 
              v-model="loginForm.email" 
              type="email" 
              placeholder="contoh@email.com" 
              required 
              :class="{ error: fieldErrors.email }"
            />
          </div>
          <span v-if="fieldErrors.email" class="field-error">{{ fieldErrors.email }}</span>
        </div>
        
        <div class="form-group">
          <label>Password</label>
          <div class="input-icon-wrapper">
            <span class="input-icon">🔒</span>
            <input 
              v-model="loginForm.password" 
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••" 
              required 
              :class="{ error: fieldErrors.password }"
            />
            <button type="button" class="toggle-password" @click="showPassword = !showPassword">
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
          <span v-if="fieldErrors.password" class="field-error">{{ fieldErrors.password }}</span>
        </div>
        
        <div class="form-options">
          <label class="remember-me">
            <input type="checkbox" v-model="loginForm.remember" /> Ingat saya
          </label>
          <a href="#" class="forgot-link" @click.prevent="showForgotForm = !showForgotForm">Lupa password?</a>
        </div>
        
        <button type="submit" class="btn-primary" :disabled="loading">
          <span v-if="loading" class="spinner-small"></span>
          {{ loading ? 'Memeriksa...' : 'Masuk' }}
        </button>
        
        <p v-if="generalError" class="error-message">{{ generalError }}</p>
        
        <!-- FORM LUPA PASSWORD -->
        <div v-if="showForgotForm" class="forgot-form">
          <h4>🔑 Reset Password</h4>
          <p>Masukkan email Anda. Jika terdaftar, password akan direset.</p>
          <div class="input-icon-wrapper">
            <span class="input-icon">📧</span>
            <input v-model="forgotEmail" type="email" placeholder="Email Anda" />
          </div>
          <button type="button" @click="handleForgotPassword" :disabled="sendingReset" class="btn-forgot">
            {{ sendingReset ? 'Mengirim...' : 'Kirim Reset' }}
          </button>
          <p v-if="forgotMessage" :class="forgotMessageType">{{ forgotMessage }}</p>
        </div>
      </form>
      
      <!-- FORM REGISTER -->
      <form v-else @submit.prevent="handleRegister">
        <div class="form-group">
          <label>Nama Lengkap</label>
          <div class="input-icon-wrapper">
            <span class="input-icon">👤</span>
            <input 
              v-model="registerForm.name" 
              type="text" 
              placeholder="Nama Anda" 
              required 
              :class="{ error: fieldErrors.name }"
            />
          </div>
          <span v-if="fieldErrors.name" class="field-error">{{ fieldErrors.name }}</span>
        </div>
        
        <div class="form-group">
          <label>Email</label>
          <div class="input-icon-wrapper">
            <span class="input-icon">📧</span>
            <input 
              v-model="registerForm.email" 
              type="email" 
              placeholder="contoh@email.com" 
              required 
              :class="{ error: fieldErrors.email }"
            />
          </div>
          <span v-if="fieldErrors.email" class="field-error">{{ fieldErrors.email }}</span>
        </div>
        
        <div class="form-group">
          <label>Password</label>
          <div class="input-icon-wrapper">
            <span class="input-icon">🔒</span>
            <input 
              v-model="registerForm.password" 
              :type="showRegisterPassword ? 'text' : 'password'"
              placeholder="Minimal 6 karakter" 
              required 
              :class="{ error: fieldErrors.password }"
              @input="checkPasswordStrength"
            />
            <button type="button" class="toggle-password" @click="showRegisterPassword = !showRegisterPassword">
              {{ showRegisterPassword ? '🙈' : '👁️' }}
            </button>
          </div>
          <div v-if="passwordStrength.message" class="password-strength" :class="passwordStrength.class">
            {{ passwordStrength.message }}
          </div>
          <span v-if="fieldErrors.password" class="field-error">{{ fieldErrors.password }}</span>
        </div>
        
        <div class="form-group">
          <label>Konfirmasi Password</label>
          <div class="input-icon-wrapper">
            <span class="input-icon">✅</span>
            <input 
              v-model="registerForm.confirmPassword" 
              type="password"
              placeholder="••••••••" 
              required 
              :class="{ error: fieldErrors.confirmPassword }"
            />
          </div>
          <span v-if="fieldErrors.confirmPassword" class="field-error">{{ fieldErrors.confirmPassword }}</span>
        </div>
        
        <div class="terms">
          <input type="checkbox" v-model="registerForm.agreeTerms" required />
          <label>Saya setuju dengan <a href="#" target="_blank">Syarat & Ketentuan</a></label>
        </div>
        
        <button type="submit" class="btn-primary" :disabled="loading">
          <span v-if="loading" class="spinner-small"></span>
          {{ loading ? 'Mendaftar...' : 'Daftar Sekarang' }}
        </button>
        
        <p v-if="generalError" class="error-message">{{ generalError }}</p>
      </form>
      
      <div class="login-divider">
        <span>atau</span>
      </div>
      
      <button class="btn-google" @click="loginWithGoogle">
        <span>🚀</span> Masuk dengan Google
      </button>
      
      <p class="demo-hint">
        💡 Demo: user@example.com / user123
      </p>
      
      <p class="back-home">
        <a href="/">← Kembali ke Beranda</a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { hashPassword, comparePassword, validatePasswordStrength, generateSessionToken } from '../utils/auth'

const router = useRouter()

// UI state
const mode = ref('login')
const loading = ref(false)
const generalError = ref('')
const fieldErrors = ref({})
const showPassword = ref(false)
const showRegisterPassword = ref(false)
const passwordStrength = ref({ message: '', class: '' })

// Lupa password
const showForgotForm = ref(false)
const forgotEmail = ref('')
const sendingReset = ref(false)
const forgotMessage = ref('')
const forgotMessageType = ref('')

// Login form
const loginForm = reactive({
  email: '',
  password: '',
  remember: false
})

// Register form
const registerForm = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
})

// Clear errors
const clearErrors = () => {
  generalError.value = ''
  fieldErrors.value = {}
}

// Validate login form
const validateLoginForm = () => {
  const errors = {}
  
  if (!loginForm.email) {
    errors.email = 'Email wajib diisi'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.email)) {
    errors.email = 'Format email tidak valid'
  }
  
  if (!loginForm.password) {
    errors.password = 'Password wajib diisi'
  }
  
  fieldErrors.value = errors
  return Object.keys(errors).length === 0
}

// Validate register form
const validateRegisterForm = () => {
  const errors = {}
  
  if (!registerForm.name) {
    errors.name = 'Nama wajib diisi'
  } else if (registerForm.name.length < 3) {
    errors.name = 'Nama minimal 3 karakter'
  }
  
  if (!registerForm.email) {
    errors.email = 'Email wajib diisi'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
    errors.email = 'Format email tidak valid'
  }
  
  if (!registerForm.password) {
    errors.password = 'Password wajib diisi'
  } else {
    const strength = validatePasswordStrength(registerForm.password)
    if (!strength.valid) {
      errors.password = strength.message
    }
  }
  
  if (registerForm.password !== registerForm.confirmPassword) {
    errors.confirmPassword = 'Password tidak cocok'
  }
  
  fieldErrors.value = errors
  return Object.keys(errors).length === 0
}

// Check password strength
const checkPasswordStrength = () => {
  if (!registerForm.password) {
    passwordStrength.value = { message: '', class: '' }
    return
  }
  
  if (registerForm.password.length < 6) {
    passwordStrength.value = { message: '❌ Terlalu pendek', class: 'weak' }
  } else if (registerForm.password.length < 8) {
    passwordStrength.value = { message: '⚠️ Cukup', class: 'medium' }
  } else {
    passwordStrength.value = { message: '✅ Kuat', class: 'strong' }
  }
}

// Show notification
const showNotification = (message, type = 'success') => {
  alert((type === 'success' ? '✅ ' : '❌ ') + message)
}

// HANDLE LOGIN
const handleLogin = async () => {
  clearErrors()
  
  if (!validateLoginForm()) return
  
  loading.value = true
  
  try {
    // Hapus session lama
    localStorage.removeItem('session')
    
    // Cari user
    const { data, error: queryError } = await supabase
      .from('users')
      .select('*')
      .eq('email', loginForm.email.toLowerCase())
      .single()
    
    if (queryError) {
      if (queryError.code === 'PGRST116') throw new Error('Email tidak ditemukan')
      throw queryError
    }
    
    // Cek password
    let isValid = false
    
    if (!data.password_hash) throw new Error('Password tidak ditemukan di database')
    
    if (data.password_hash.startsWith('$2a$') || data.password_hash.startsWith('$2b$')) {
      try {
        isValid = await comparePassword(loginForm.password, data.password_hash)
      } catch {
        isValid = (loginForm.password === data.password_hash)
      }
    } else {
      isValid = (loginForm.password === data.password_hash)
    }
    
    if (!isValid) throw new Error('Password salah')
    
    // SIMPAN SESSION DENGAN PLAN
    const token = generateSessionToken(data)
    const sessionData = {
      user: {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        plan: data.plan || 'basic'
      },
      token: token,
      expires: Date.now() + (loginForm.remember ? 30 : 1) * 24 * 60 * 60 * 1000
    }
    
    localStorage.setItem('session', JSON.stringify(sessionData))
    
    showNotification(`Selamat datang, ${data.name || data.email}!`)
    
    // Redirect
    router.push(data.role === 'admin' ? '/admin' : '/dashboard')
    
  } catch (err) {
    generalError.value = err.message
  } finally {
    loading.value = false
  }
}

// HANDLE REGISTER
const handleRegister = async () => {
  clearErrors()
  
  if (!validateRegisterForm()) return
  
  loading.value = true
  
  try {
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', registerForm.email.toLowerCase())
      .maybeSingle()
    
    if (existingUser) throw new Error('Email sudah terdaftar')
    
    const hashedPassword = await hashPassword(registerForm.password)
    
    const { error: insertError } = await supabase
      .from('users')
      .insert([{
        name: registerForm.name,
        email: registerForm.email.toLowerCase(),
        password_hash: hashedPassword,
        role: 'user',
        plan: 'basic'
      }])
    
    if (insertError) throw insertError
    
    showNotification('Pendaftaran berhasil! Silakan login.')
    
    registerForm.name = ''
    registerForm.email = ''
    registerForm.password = ''
    registerForm.confirmPassword = ''
    registerForm.agreeTerms = false
    mode.value = 'login'
    
  } catch (err) {
    generalError.value = err.message
  } finally {
    loading.value = false
  }
}

// HANDLE FORGOT PASSWORD
const handleForgotPassword = async () => {
  if (!forgotEmail.value) {
    forgotMessage.value = '❌ Email wajib diisi'
    forgotMessageType.value = 'error'
    return
  }
  
  sendingReset.value = true
  forgotMessage.value = ''
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', forgotEmail.value.toLowerCase())
      .single()
    
    if (error || !data) {
      forgotMessage.value = '❌ Email tidak ditemukan'
      forgotMessageType.value = 'error'
      return
    }
    
    // Reset password jadi default
    const newPass = 'user123'
    const hashed = await hashPassword(newPass)
    
    await supabase.from('users').update({ password_hash: hashed }).eq('id', data.id)
    
    forgotMessage.value = `✅ Password berhasil direset!\n\nEmail: ${forgotEmail.value}\nPassword baru: ${newPass}\n\nSilakan login dan segera ganti password Anda.`
    forgotMessageType.value = 'success'
    forgotEmail.value = ''
    
  } catch (err) {
    forgotMessage.value = '❌ Gagal mereset password'
    forgotMessageType.value = 'error'
  } finally {
    sendingReset.value = false
  }
}

// Login with Google
const loginWithGoogle = () => {
  showNotification('Fitur Google Login akan segera hadir!', 'error')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 30px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 30px 60px rgba(0,0,0,0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  font-size: 50px;
  margin-bottom: 10px;
}

.login-header h1 {
  font-size: 28px;
  color: #2c3e50;
  margin-bottom: 8px;
}

.login-header p {
  color: #666;
  font-size: 14px;
}

.tab-switch {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  background: #f5f5f5;
  padding: 5px;
  border-radius: 50px;
}

.tab-switch button {
  flex: 1;
  padding: 12px;
  border: none;
  background: transparent;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-switch button.active {
  background: #9b87f5;
  color: white;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #555;
  font-size: 14px;
}

.input-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 15px;
  font-size: 16px;
  opacity: 0.6;
}

.input-icon-wrapper input {
  width: 100%;
  padding: 14px 16px 14px 45px;
  border: 2px solid #eee;
  border-radius: 15px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.input-icon-wrapper input.error {
  border-color: #ef4444;
  background: #fef2f2;
}

.input-icon-wrapper input:focus {
  outline: none;
  border-color: #9b87f5;
}

.toggle-password {
  position: absolute;
  right: 15px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
}

.field-error {
  display: block;
  color: #ef4444;
  font-size: 12px;
  margin-top: 5px;
}

.password-strength {
  font-size: 12px;
  margin-top: 5px;
}

.password-strength.weak { color: #ef4444; }
.password-strength.medium { color: #f59e0b; }
.password-strength.strong { color: #10b981; }

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  font-size: 14px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.remember-me input {
  width: auto;
  margin: 0;
}

.forgot-link {
  color: #9b87f5;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
}

.forgot-link:hover {
  text-decoration: underline;
}

/* FORGOT FORM */
.forgot-form {
  margin-top: 25px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 15px;
  border: 1px solid #e5e7eb;
}

.forgot-form h4 {
  margin-bottom: 8px;
  color: #2c3e50;
}

.forgot-form p {
  font-size: 13px;
  color: #666;
  margin-bottom: 15px;
}

.btn-forgot {
  width: 100%;
  padding: 12px;
  margin-top: 12px;
  background: #f59e0b;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.btn-forgot:disabled {
  opacity: 0.6;
}

.forgot-form .error-message {
  color: #ef4444;
}

.forgot-form .success-message {
  color: #10b981;
}

.terms {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 25px;
  font-size: 14px;
}

.terms input {
  width: auto;
  margin: 0;
}

.terms a {
  color: #9b87f5;
  text-decoration: none;
}

.btn-primary {
  width: 100%;
  padding: 16px;
  background: #9b87f5;
  color: white;
  border: none;
  border-radius: 50px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn-primary:hover {
  background: #7e69e0;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

.error-message {
  color: #ef4444;
  text-align: center;
  margin-top: 15px;
  font-size: 14px;
}

.login-divider {
  text-align: center;
  margin: 25px 0;
  position: relative;
}

.login-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #eee;
}

.login-divider span {
  background: white;
  padding: 0 15px;
  color: #999;
  font-size: 14px;
  position: relative;
}

.btn-google {
  width: 100%;
  padding: 14px;
  background: white;
  color: #555;
  border: 2px solid #eee;
  border-radius: 50px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: background 0.2s;
}

.btn-google:hover {
  background: #f9f9f9;
}

.demo-hint {
  text-align: center;
  margin-top: 20px;
  font-size: 13px;
  color: #999;
  line-height: 1.6;
}

.back-home {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
}

.back-home a {
  color: #9b87f5;
  text-decoration: none;
  font-weight: 500;
}

.back-home a:hover {
  text-decoration: underline;
}
</style>