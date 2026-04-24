<template>
  <div class="list-dashboard">
    <!-- HEADER -->
    <div class="header">
      <div>
        <h1>📋 Undangan Saya</h1>
        <p>Kelola semua undangan Anda</p>
      </div>
      <div class="header-actions">
        <button @click="router.push('/profile')" class="btn-settings" v-if="user">⚙️ Pengaturan</button>
        <button @click="handleLogout" class="btn-logout" v-if="user">🚪 Logout</button>
      </div>
    </div>

    <!-- PLAN INFO -->
    <div class="plan-info" v-if="user && user?.role !== 'admin'">
      <div class="plan-badge" :class="user?.plan || 'basic'">{{ planLimits.name }}</div>
      <div class="plan-limits">
        <span>📋 {{ weddings.length }}/{{ planLimits.maxWeddings === Infinity ? '∞' : planLimits.maxWeddings }}</span>
        <span title="Batas tamu per undangan">👥 Max {{ planLimits.maxGuests === Infinity ? '∞' : planLimits.maxGuests }}</span>
        <span title="Batas kado per undangan">🎁 Max {{ planLimits.maxGifts === Infinity ? '∞' : planLimits.maxGifts }}</span>
      </div>
      <button v-if="user?.plan === 'basic'" class="btn-upgrade" @click="upgradePlan">⬆️ Upgrade Premium (Rp 99rb)</button>
    </div>

    <!-- TOMBOL BUAT BARU -->
    <div class="create-section">
      <button @click="createNewWedding" class="btn-create" :disabled="!canCreate">
        ✨ Buat Undangan Baru
      </button>
      <span v-if="!canCreate" class="limit-text">
        ❌ Limit tercapai ({{ weddings.length }}/{{ planLimits.maxWeddings }})
        <button @click="upgradePlan" class="btn-upgrade-inline">⬆️ Upgrade</button>
      </span>
    </div>

    <!-- LIST UNDANGAN -->
    <div v-if="loading" class="loading">⏳ Memuat undangan...</div>
    
    <div v-else-if="weddings.length === 0" class="empty">
      <p>📭 Belum ada undangan</p>
      <p>Klik "Buat Undangan Baru" untuk memulai</p>
    </div>

    <div v-else class="wedding-list">
      <div v-for="wedding in weddings" :key="wedding.id" class="wedding-card">
        <div class="wedding-info">
          <div class="wedding-icon">{{ getEventIcon(wedding.event_type) }}</div>
          <div class="wedding-details">
            <h3>{{ wedding.nama_pria }} & {{ wedding.nama_wanita || '' }}</h3>
            <p class="wedding-date">{{ formatDate(wedding.akad_date) }}</p>
            <p class="wedding-template">🎨 {{ getTemplateLabel(wedding.template) }}</p>
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

// WhatsApp number (GANTI DENGAN NOMOR LO)
const waNumber = '6281234567890'

const canCreate = computed(() => {
  return planLimits.value.maxWeddings === Infinity || weddings.value.length < planLimits.value.maxWeddings
})

const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-'

const getEventIcon = (type) => {
  const icons = { wedding: '💍', aqiqah: '👶', syukuran: '🏠', sunatan: '✂️' }
  return icons[type] || '💍'
}

const getTemplateLabel = (t) => {
  const labels = { elegan: '💐 Elegan', minimalis: '✨ Minimalis', floral: '🌸 Floral' }
  return labels[t] || '💐 Elegan'
}

const upgradePlan = () => {
  const email = user.value?.email || ''
  const message = `Halo kak, saya mau upgrade ke PREMIUM (Rp 99.000).%0A%0A📧 Email: ${email}%0A📋 Paket: Premium%0A💰 Harga: Rp 99.000%0A%0AMohon info cara pembayarannya ya. Terima kasih! 🙏`
  window.open(`https://wa.me/${waNumber}?text=${message}`, '_blank')
}

const loadWeddings = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('weddings')
      .select('*')
      .eq('user_id', user.value.id)
      .order('created_at', { ascending: false })
    
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

const createNewWedding = () => {
  if (!canCreate.value) return
  localStorage.removeItem('currentWeddingId')
  localStorage.removeItem('currentSlug')
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
  if (!confirm(`Hapus undangan "${wedding.nama_pria} & ${wedding.nama_wanita}"?\nSemua data tamu, pesan, dan kado akan ikut terhapus.`)) return
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
.list-dashboard { max-width: 800px; margin: 0 auto; padding: 30px 20px; min-height: 100vh; background: #f5f7fa; }
.header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; margin-bottom: 24px; }
.header h1 { font-size: 28px; color: #2c3e50; }
.header p { color: #666; margin-top: 5px; }
.header-actions { display: flex; gap: 10px; }
.btn-settings { background: #f0f0f0; color: #555; border: none; padding: 10px 18px; border-radius: 8px; cursor: pointer; font-weight: 600; }
.btn-logout { background: #fee2e2; color: #ef4444; border: none; padding: 10px 18px; border-radius: 8px; cursor: pointer; font-weight: 600; }

.plan-info { background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 15px 20px; border-radius: 12px; margin-bottom: 24px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.plan-badge { padding: 6px 14px; border-radius: 20px; font-weight: 700; font-size: 13px; text-transform: uppercase; }
.plan-badge.basic { background: #f0f0f0; color: #666; }
.plan-badge.premium { background: #9b87f5; color: white; }
.plan-badge.enterprise { background: #2c3e50; color: white; }
.plan-limits { display: flex; gap: 15px; font-size: 14px; font-weight: 500; }
.btn-upgrade { margin-left: auto; padding: 8px 16px; background: #9b87f5; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; }

.create-section { text-align: center; margin-bottom: 30px; }
.btn-create { padding: 16px 40px; background: #9b87f5; color: white; border: none; border-radius: 50px; font-size: 18px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
.btn-create:hover { background: #7e69e0; transform: translateY(-2px); box-shadow: 0 10px 25px rgba(155,135,245,0.3); }
.btn-create:disabled { opacity: 0.5; cursor: not-allowed; }
.limit-text { display: block; margin-top: 10px; color: #ef4444; font-weight: 600; }
.btn-upgrade-inline { background: #9b87f5; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px; margin-left: 8px; }

.loading { text-align: center; padding: 40px; color: #666; }
.empty { text-align: center; padding: 60px 20px; color: #999; }
.empty p { margin: 8px 0; }

.wedding-list { display: flex; flex-direction: column; gap: 16px; }
.wedding-card { background: white; padding: 20px; border-radius: 16px; box-shadow: 0 5px 20px rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; transition: transform 0.2s; }
.wedding-card:hover { transform: translateY(-2px); }
.wedding-info { display: flex; gap: 15px; align-items: center; }
.wedding-icon { font-size: 40px; }
.wedding-details h3 { margin-bottom: 5px; color: #2c3e50; }
.wedding-date { font-size: 13px; color: #666; }
.wedding-template { font-size: 12px; color: #9b87f5; font-weight: 600; margin-top: 4px; }
.wedding-stats { display: flex; gap: 15px; margin-top: 8px; font-size: 13px; color: #666; }
.status-active { color: #059669; }
.status-inactive { color: #ef4444; }

.wedding-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.wedding-actions button { padding: 8px 14px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; white-space: nowrap; }
.btn-edit { background: #e0e7ff; color: #4f46e5; }
.btn-copy { background: #f0f0f0; color: #555; }
.btn-preview { background: #dbeafe; color: #2563eb; }
.btn-delete { background: #fee2e2; color: #ef4444; }

.btn-back { display: block; width: 100%; margin-top: 30px; padding: 14px; background: white; color: #666; border: 1px solid #ddd; border-radius: 12px; font-weight: 600; cursor: pointer; }

@media (max-width: 600px) { .wedding-card { flex-direction: column; align-items: flex-start; } .wedding-actions { width: 100%; } .wedding-actions button { flex: 1; } }
</style>