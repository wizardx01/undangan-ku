<template>
  <div class="list-dashboard">
    <!-- HEADER -->
    <div class="header">
      <div>
        <h1>📋 {{ user?.role === 'admin' ? 'Semua Undangan (Admin)' : 'Undangan Saya' }}</h1>
        <p>{{ user?.role === 'admin' ? 'Kelola semua undangan di sistem' : 'Kelola semua undangan Anda' }}</p>
      </div>
      <div class="header-actions">
        <button @click="router.push('/profile')" class="btn-settings" v-if="user">⚙️ Pengaturan</button>
        <button @click="router.push('/admin')" class="btn-admin" v-if="user?.role === 'admin'">👑 Admin Panel</button>
        <button @click="handleLogout" class="btn-logout" v-if="user">🚪 Logout</button>
      </div>
    </div>

    <!-- PLAN INFO (Hanya non-admin) -->
    <div class="plan-info" v-if="user && user?.role !== 'admin'">
      <div class="plan-badge" :class="user?.plan || 'basic'">{{ planLimits.name }}</div>
      <div class="plan-limits">
        <span>📋 {{ weddings.length }}/{{ planLimits.maxWeddings === Infinity ? '∞' : planLimits.maxWeddings }}</span>
        <span>👥 Max {{ planLimits.maxGuests === Infinity ? '∞' : planLimits.maxGuests }}</span>
        <span>🎁 Max {{ planLimits.maxGifts === Infinity ? '∞' : planLimits.maxGifts }}</span>
      </div>
      <button v-if="user?.plan === 'basic'" class="btn-upgrade" @click="upgradePlan">⬆️ Upgrade Premium (Rp 99rb)</button>
    </div>

    <!-- SECTION: BUAT UNDANGAN BARU -->
    <div class="create-section">
      <h2>🎉 Buat Undangan Baru</h2>
      <p>Pilih jenis acara di bawah ini:</p>
      
      <div class="event-type-grid">
        <div class="event-card" @click="createNewWedding('wedding')" :class="{ disabled: !canCreate }">
          <div class="event-icon">💍</div>
          <h3>Wedding</h3>
          <p>Pernikahan</p>
        </div>
        
        <div class="event-card" @click="createNewWedding('sunatan')" :class="{ disabled: !canCreate }">
          <div class="event-icon">✂️</div>
          <h3>Sunatan</h3>
          <p>Khitanan</p>
        </div>
        
        <div class="event-card" @click="createNewWedding('aqiqah')" :class="{ disabled: !canCreate }">
          <div class="event-icon">👶</div>
          <h3>Aqiqah</h3>
          <p>Syukuran Kelahiran</p>
        </div>
        
        <div class="event-card" @click="createNewWedding('syukuran')" :class="{ disabled: !canCreate }">
          <div class="event-icon">🏠</div>
          <h3>Syukuran</h3>
          <p>Rumah Baru, Wisuda, dll</p>
        </div>
      </div>
      
      <span v-if="!canCreate && user?.role !== 'admin'" class="limit-text">
        ❌ Limit tercapai ({{ weddings.length }}/{{ planLimits.maxWeddings }})
        <button @click="upgradePlan" class="btn-upgrade-inline">⬆️ Upgrade</button>
      </span>
    </div>

    <!-- LIST UNDANGAN -->
    <div class="existing-section" v-if="weddings.length > 0">
      <h2>📜 Undangan yang Sudah Dibuat</h2>
      
      <div class="wedding-list">
        <div v-for="wedding in weddings" :key="wedding.id" class="wedding-card">
          <div class="wedding-info">
            <div class="wedding-icon">{{ getEventIcon(wedding.event_type) }}</div>
            <div class="wedding-details">
              <h3>{{ wedding.nama_pria }} {{ wedding.nama_wanita ? '& ' + wedding.nama_wanita : '' }}</h3>
              <p class="wedding-date">{{ formatDate(wedding.akad_date) }}</p>
              <div class="wedding-meta">
                <span class="wedding-type">{{ getEventLabel(wedding.event_type) }}</span>
                <span class="wedding-template">🎨 {{ getTemplateLabel(wedding.template) }}</span>
              </div>
              <div class="wedding-stats">
                <span>👥 {{ wedding.guest_count || 0 }} tamu</span>
                <span>🎁 {{ wedding.gift_count || 0 }} kado</span>
                <span :class="wedding.is_active ? 'status-active' : 'status-inactive'">
                  {{ wedding.is_active ? '🟢 Aktif' : '🔴 Nonaktif' }}
                </span>
              </div>
            </div>
          </div>
          <div class="wedding-actions">
            <button @click="editWedding(wedding)" class="btn-edit">✏️ Edit</button>
            <button @click="copyLink(wedding.slug)" class="btn-copy">📋 Link</button>
            <button @click="previewWedding(wedding.slug)" class="btn-preview">👁️ Preview</button>
            <button @click="deleteWedding(wedding)" class="btn-delete">🗑️ Hapus</button>
          </div>
        </div>
      </div>
    </div>

    <!-- KALAU BELUM ADA UNDANGAN -->
    <div v-if="!loading && weddings.length === 0" class="empty">
      <p>📭 Belum ada undangan</p>
      <p>Pilih jenis acara di atas untuk memulai!</p>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="loading">⏳ Memuat undangan...</div>

    <button @click="router.push('/')" class="btn-back">← Kembali ke Beranda</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { getPlanLimits } from '../utils/planLimits'
import { showSuccess, showError } from '../utils/errorHandler'

const router = useRouter()
const user = ref(null)
const planLimits = ref(getPlanLimits())
const weddings = ref([])
const loading = ref(true)
const waNumber = '6281234567890'

// Admin selalu bisa bikin undangan baru
const canCreate = computed(() => {
  if (user.value?.role === 'admin') return true
  return planLimits.value.maxWeddings === Infinity || weddings.value.length < planLimits.value.maxWeddings
})

const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-'
const getEventIcon = (t) => ({ wedding: '💍', sunatan: '✂️', aqiqah: '👶', syukuran: '🏠' }[t] || '💍')
const getEventLabel = (t) => ({ wedding: '💍 Wedding', sunatan: '✂️ Sunatan', aqiqah: '👶 Aqiqah', syukuran: '🏠 Syukuran' }[t] || '💍 Wedding')
const getTemplateLabel = (t) => ({ elegan: '💐 Elegan', minimalis: '✨ Minimalis', floral: '🌸 Floral' }[t] || '💐 Elegan')

const upgradePlan = () => {
  const email = user.value?.email || ''
  const message = `Halo kak, saya mau upgrade ke PREMIUM (Rp 99.000).%0A%0A📧 Email: ${email}%0A📋 Paket: Premium%0A💰 Harga: Rp 99.000%0A%0AMohon info cara pembayarannya ya. Terima kasih! 🙏`
  window.open(`https://wa.me/${waNumber}?text=${message}`, '_blank')
}

const loadWeddings = async () => {
  loading.value = true
  try {
    let query = supabase.from('weddings').select('*').order('created_at', { ascending: false })
    
    // Kalau bukan admin, cuma lihat undangan sendiri
    if (user.value?.role !== 'admin') {
      query = query.eq('user_id', user.value.id)
    }
    
    const { data, error } = await query
    if (error) throw error
    
    for (const w of data) {
      const { count: guestCount } = await supabase.from('guests').select('*', { count: 'exact', head: true }).eq('wedding_id', w.id)
      const { count: giftCount } = await supabase.from('gifts').select('*', { count: 'exact', head: true }).eq('wedding_id', w.id).eq('status', true)
      w.guest_count = guestCount || 0
      w.gift_count = giftCount || 0
    }
    
    weddings.value = data || []
  } catch (err) {
    console.error('Load weddings error:', err)
  } finally {
    loading.value = false
  }
}

const createNewWedding = (eventType) => {
  if (!canCreate.value) return
  localStorage.removeItem('currentWeddingId')
  localStorage.removeItem('currentSlug')
  sessionStorage.setItem('selectedEventType', eventType)
  router.push('/dashboard/edit')
}

const editWedding = (wedding) => {
  localStorage.setItem('currentWeddingId', wedding.id)
  localStorage.setItem('currentSlug', wedding.slug)
  router.push('/dashboard/edit')
}

const copyLink = (slug) => {
  const link = `${window.location.origin}/wedding/${slug}`
  navigator.clipboard.writeText(link)
  showSuccess('Link dicopy!')
}

const previewWedding = (slug) => window.open(`/wedding/${slug}`, '_blank')

const deleteWedding = async (wedding) => {
  if (!confirm(`Hapus undangan "${wedding.nama_pria} ${wedding.nama_wanita ? '& ' + wedding.nama_wanita : ''}"?\nSemua data tamu, pesan, dan kado akan ikut terhapus.`)) return
  try {
    await supabase.from('gifts').delete().eq('wedding_id', wedding.id)
    await supabase.from('messages').delete().eq('wedding_id', wedding.id)
    await supabase.from('guests').delete().eq('wedding_id', wedding.id)
    await supabase.from('weddings').delete().eq('id', wedding.id)
    weddings.value = weddings.value.filter(w => w.id !== wedding.id)
    showSuccess('Undangan dihapus!')
  } catch (err) {
    showError(err, 'Gagal menghapus')
  }
}

const handleLogout = () => {
  localStorage.removeItem('session')
  localStorage.removeItem('currentWeddingId')
  localStorage.removeItem('currentSlug')
  router.push('/login')
}

onMounted(() => {
  const session = JSON.parse(localStorage.getItem('session') || 'null')
  if (!session?.user) { router.push('/login'); return }
  user.value = session.user
  planLimits.value = getPlanLimits()
  loadWeddings()
})
</script>

<style scoped>
.list-dashboard { max-width: 900px; margin: 0 auto; padding: 30px 20px; min-height: 100vh; background: #f5f7fa; }
.header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; margin-bottom: 24px; }
.header h1 { font-size: 28px; color: #2c3e50; }
.header p { color: #666; margin-top: 5px; }
.header-actions { display: flex; gap: 10px; }
.btn-settings { background: #f0f0f0; color: #555; border: none; padding: 10px 18px; border-radius: 8px; cursor: pointer; font-weight: 600; }
.btn-admin { background: #9b87f5; color: white; border: none; padding: 10px 18px; border-radius: 8px; cursor: pointer; font-weight: 600; }
.btn-logout { background: #fee2e2; color: #ef4444; border: none; padding: 10px 18px; border-radius: 8px; cursor: pointer; font-weight: 600; }

.plan-info { background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 15px 20px; border-radius: 12px; margin-bottom: 30px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.plan-badge { padding: 6px 14px; border-radius: 20px; font-weight: 700; font-size: 13px; text-transform: uppercase; }
.plan-badge.basic { background: #f0f0f0; color: #666; }
.plan-badge.premium { background: #9b87f5; color: white; }
.plan-limits { display: flex; gap: 15px; font-size: 14px; font-weight: 500; }
.btn-upgrade { margin-left: auto; padding: 8px 16px; background: #9b87f5; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; }

.create-section { background: white; padding: 30px; border-radius: 20px; box-shadow: 0 5px 20px rgba(0,0,0,0.05); margin-bottom: 30px; text-align: center; }
.create-section h2 { font-size: 24px; color: #2c3e50; margin-bottom: 8px; }
.create-section > p { color: #666; margin-bottom: 25px; }

.event-type-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; }
.event-card { background: #f9fafb; border: 2px solid transparent; border-radius: 16px; padding: 25px 15px; cursor: pointer; transition: all 0.3s; text-align: center; }
.event-card:hover { border-color: #9b87f5; background: #f5f0ff; transform: translateY(-5px); box-shadow: 0 10px 25px rgba(155,135,245,0.15); }
.event-card.disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
.event-icon { font-size: 48px; margin-bottom: 12px; }
.event-card h3 { font-size: 16px; color: #2c3e50; margin-bottom: 4px; }
.event-card p { font-size: 13px; color: #888; }

.limit-text { display: block; margin-top: 10px; color: #ef4444; font-weight: 600; }
.btn-upgrade-inline { background: #9b87f5; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px; margin-left: 8px; }

.existing-section { margin-bottom: 30px; }
.existing-section h2 { font-size: 22px; color: #2c3e50; margin-bottom: 20px; }

.wedding-list { display: flex; flex-direction: column; gap: 16px; }
.wedding-card { background: white; padding: 20px; border-radius: 16px; box-shadow: 0 5px 20px rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; transition: transform 0.2s; }
.wedding-card:hover { transform: translateY(-2px); }
.wedding-info { display: flex; gap: 15px; align-items: center; }
.wedding-icon { font-size: 40px; }
.wedding-details h3 { margin-bottom: 5px; color: #2c3e50; }
.wedding-date { font-size: 13px; color: #666; }
.wedding-meta { display: flex; gap: 12px; margin-top: 6px; }
.wedding-type { font-size: 12px; color: #9b87f5; font-weight: 600; background: #f5f0ff; padding: 3px 10px; border-radius: 10px; }
.wedding-template { font-size: 12px; color: #666; }
.wedding-stats { display: flex; gap: 15px; margin-top: 8px; font-size: 13px; color: #666; }
.status-active { color: #059669; }
.status-inactive { color: #ef4444; }

.wedding-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.wedding-actions button { padding: 8px 14px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; white-space: nowrap; }
.btn-edit { background: #e0e7ff; color: #4f46e5; }
.btn-copy { background: #f0f0f0; color: #555; }
.btn-preview { background: #dbeafe; color: #2563eb; }
.btn-delete { background: #fee2e2; color: #ef4444; }

.loading { text-align: center; padding: 40px; color: #666; }
.empty { text-align: center; padding: 60px 20px; color: #999; }
.empty p { margin: 8px 0; }

.btn-back { display: block; width: 100%; margin-top: 30px; padding: 14px; background: white; color: #666; border: 1px solid #ddd; border-radius: 12px; font-weight: 600; cursor: pointer; }

@media (max-width: 768px) { .event-type-grid { grid-template-columns: repeat(2, 1fr); } .wedding-card { flex-direction: column; align-items: flex-start; } .wedding-actions { width: 100%; } .wedding-actions button { flex: 1; } }
@media (max-width: 480px) { .event-type-grid { grid-template-columns: 1fr 1fr; } }
</style>