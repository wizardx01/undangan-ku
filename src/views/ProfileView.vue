<template>
  <div class="profile-page">
    <div class="container">
      <h1>👤 Pengaturan Akun</h1>
      
      <!-- INFO AKUN -->
      <div class="section">
        <h3>ℹ️ Info Akun</h3>
        <div class="info-row">
          <span class="label">Nama</span>
          <span class="value">{{ user?.name || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="label">Email</span>
          <span class="value">{{ user?.email }}</span>
        </div>
        <div class="info-row">
          <span class="label">Role</span>
          <span class="value">{{ user?.role === 'admin' ? '👑 Admin' : '👤 User' }}</span>
        </div>
      </div>
      
      <!-- GANTI PASSWORD -->
      <div class="section">
        <h3>🔒 Ganti Password</h3>
        
        <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
        <div v-if="errorMessage" class="alert alert-error">{{ errorMessage }}</div>
        
        <form @submit.prevent="changePassword">
          <div class="form-group">
            <label>Password Lama *</label>
            <input 
              v-model="passwordForm.oldPassword" 
              type="password" 
              placeholder="Masukkan password lama" 
              required 
            />
          </div>
          
          <div class="form-group">
            <label>Password Baru *</label>
            <input 
              v-model="passwordForm.newPassword" 
              type="password" 
              placeholder="Minimal 6 karakter" 
              required 
              @input="checkPasswordStrength"
            />
            <div v-if="passwordStrength.message" class="password-strength" :class="passwordStrength.class">
              {{ passwordStrength.message }}
            </div>
          </div>
          
          <div class="form-group">
            <label>Konfirmasi Password Baru *</label>
            <input 
              v-model="passwordForm.confirmPassword" 
              type="password" 
              placeholder="Ulangi password baru" 
              required 
            />
            <div v-if="passwordMismatch" class="text-error">
              ❌ Password tidak cocok
            </div>
          </div>
          
          <button type="submit" class="btn-save" :disabled="saving || passwordMismatch">
            <span v-if="saving" class="spinner-small"></span>
            {{ saving ? 'Menyimpan...' : '💾 Simpan Password Baru' }}
          </button>
        </form>
      </div>
      
      <!-- TOMBOL KEMBALI -->
      <button @click="goBack" class="btn-back">
        ← Kembali ke {{ user?.role === 'admin' ? 'Admin Panel' : 'Dashboard' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { comparePassword, hashPassword } from '../utils/auth'

const router = useRouter()

// User data
const user = ref(null)

// Form state
const saving = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Password strength
const passwordStrength = reactive({ message: '', class: '' })

const checkPasswordStrength = () => {
  const pass = passwordForm.newPassword
  if (!pass) {
    passwordStrength.message = ''
    passwordStrength.class = ''
    return
  }
  
  if (pass.length < 6) {
    passwordStrength.message = '❌ Terlalu pendek (minimal 6 karakter)'
    passwordStrength.class = 'weak'
  } else if (pass.length < 8) {
    passwordStrength.message = '⚠️ Cukup, tapi lebih panjang lebih baik'
    passwordStrength.class = 'medium'
  } else {
    passwordStrength.message = '✅ Kuat'
    passwordStrength.class = 'strong'
  }
}

// Password mismatch check
const passwordMismatch = computed(() => {
  return passwordForm.newPassword && 
         passwordForm.confirmPassword && 
         passwordForm.newPassword !== passwordForm.confirmPassword
})

// Change password
const changePassword = async () => {
  // Reset messages
  successMessage.value = ''
  errorMessage.value = ''
  
  // Validasi
  if (!passwordForm.oldPassword) {
    errorMessage.value = '❌ Password lama wajib diisi'
    return
  }
  
  if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
    errorMessage.value = '❌ Password baru minimal 6 karakter'
    return
  }
  
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    errorMessage.value = '❌ Password baru tidak cocok'
    return
  }
  
  if (passwordForm.oldPassword === passwordForm.newPassword) {
    errorMessage.value = '❌ Password baru tidak boleh sama dengan password lama'
    return
  }
  
  saving.value = true
  
  try {
    console.log('Fetching user data from database...')
    
    // Ambil data user dari database
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.value.id)
      .single()
    
    if (fetchError) {
      console.error('Fetch error:', fetchError)
      throw new Error('Gagal mengambil data user dari database')
    }
    
    console.log('User data found:', userData.email)
    console.log('Password hash type:', userData.password_hash?.startsWith('$2') ? 'bcrypt' : 'plain')
    
    // Cek password lama
    let isOldPasswordValid = false
    
    if (userData.password_hash.startsWith('$2a$') || userData.password_hash.startsWith('$2b$')) {
      // bcrypt hash
      console.log('Comparing with bcrypt...')
      try {
        isOldPasswordValid = await comparePassword(passwordForm.oldPassword, userData.password_hash)
        console.log('bcrypt result:', isOldPasswordValid)
      } catch (err) {
        console.error('bcrypt error:', err)
        // Fallback: compare plain text
        isOldPasswordValid = (passwordForm.oldPassword === userData.password_hash)
      }
    } else {
      // Plain text
      console.log('Comparing plain text...')
      isOldPasswordValid = (passwordForm.oldPassword === userData.password_hash)
    }
    
    if (!isOldPasswordValid) {
      errorMessage.value = '❌ Password lama salah'
      return
    }
    
    console.log('Old password verified, hashing new password...')
    
    // Hash password baru
    const newHash = await hashPassword(passwordForm.newPassword)
    console.log('New hash generated:', newHash.substring(0, 20) + '...')
    
    // Update ke database
    console.log('Updating database...')
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: newHash })
      .eq('id', user.value.id)
    
    if (updateError) {
      console.error('Update error:', updateError)
      throw new Error('Gagal mengupdate password di database')
    }
    
    console.log('Password updated successfully!')
    
    // Reset form
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    
    successMessage.value = '✅ Password berhasil diubah! Anda akan diarahkan ke halaman login dalam 3 detik...'
    
    // Logout setelah 3 detik
    setTimeout(() => {
      localStorage.removeItem('session')
      router.push('/login')
    }, 3000)
    
  } catch (err) {
    console.error('Change password error:', err)
    errorMessage.value = '❌ ' + (err.message || 'Gagal mengganti password. Silakan coba lagi.')
  } finally {
    saving.value = false
  }
}

// Go back
const goBack = () => {
  if (user.value?.role === 'admin') {
    router.push('/admin')
  } else {
    router.push('/dashboard')
  }
}

// Init
onMounted(() => {
  const session = JSON.parse(localStorage.getItem('session') || 'null')
  
  if (!session?.user) {
    router.push('/login')
    return
  }
  
  user.value = session.user
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 40px 20px;
}

.container {
  max-width: 500px;
  margin: 0 auto;
}

h1 {
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 28px;
}

.section {
  background: white;
  padding: 30px;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.05);
}

.section h3 {
  margin-bottom: 20px;
  color: #333;
  font-size: 18px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  color: #666;
  font-weight: 500;
}

.value {
  font-weight: 600;
  color: #2c3e50;
}

/* ALERTS */
.alert {
  padding: 14px 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-weight: 500;
  font-size: 14px;
}

.alert-success {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
}

.alert-error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

/* FORM */
.form-group {
  margin-bottom: 22px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #555;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #eee;
  border-radius: 12px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #9b87f5;
}

.password-strength {
  margin-top: 6px;
  font-size: 13px;
}

.password-strength.weak {
  color: #ef4444;
}

.password-strength.medium {
  color: #f59e0b;
}

.password-strength.strong {
  color: #10b981;
}

.text-error {
  color: #ef4444;
  font-size: 13px;
  margin-top: 6px;
}

/* BUTTONS */
.btn-save {
  width: 100%;
  padding: 16px;
  background: #9b87f5;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 10px;
}

.btn-save:hover {
  background: #7e69e0;
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner-small {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

.btn-back {
  display: block;
  width: 100%;
  padding: 14px;
  background: white;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  font-size: 15px;
  transition: background 0.2s;
}

.btn-back:hover {
  background: #f9f9f9;
}
</style>