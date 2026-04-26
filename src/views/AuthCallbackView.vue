<template>
  <div class="callback-page">
    <div class="spinner"></div>
    <p>{{ message }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()
const message = ref('Menyelesaikan login...')

onMounted(async () => {
  try {
    // Ambil session dari URL (hash fragment)
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) throw error
    
    if (session?.user) {
      const email = session.user.email
      const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || email
      
      message.value = `Login berhasil! Mengalihkan...`
      
      // Cek user di database
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()
      
      let userData = existingUser
      
      if (!existingUser) {
        message.value = 'Membuat akun baru...'
        // Insert user baru
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([{
            email: email,
            name: name,
            role: 'user',
            plan: 'basic',
            password_hash: 'google-oauth'
          }])
          .select()
        
        if (insertError) {
          console.error('Insert error:', insertError)
          // Coba fetch lagi, mungkin udah ada
          const { data: retryUser } = await supabase.from('users').select('*').eq('email', email).single()
          userData = retryUser
        } else {
          userData = newUser?.[0]
        }
      }
      
      // Simpan session custom
      localStorage.setItem('session', JSON.stringify({
        user: {
          id: userData?.id || session.user.id,
          email: email,
          name: name,
          role: userData?.role || 'user',
          plan: userData?.plan || 'basic'
        },
        token: session.access_token,
        expires: Date.now() + 30 * 24 * 60 * 60 * 1000
      }))
      
      // Redirect ke dashboard
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
      
    } else {
      message.value = 'Gagal login. Mengalihkan ke halaman login...'
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
    
  } catch (err) {
    console.error('Auth callback error:', err)
    message.value = 'Terjadi kesalahan: ' + (err.message || 'Coba lagi')
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  }
})
</script>

<style scoped>
.callback-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fdfbf7;
  font-family: 'Poppins', sans-serif;
}
.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #9b87f5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}
@keyframes spin { 100% { transform: rotate(360deg); } }
p { color: #666; font-size: 16px; }
</style>