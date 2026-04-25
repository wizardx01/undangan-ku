<template>
  <div class="admin-dashboard">
    <!-- HEADER -->
    <div class="admin-header">
      <div>
        <h1>📊 Dashboard Admin</h1>
        <p>Kelola semua undangan dan user</p>
      </div>
      <div class="header-actions">
        <button @click="goToDashboardList" class="btn-dashboard">📋 Daftar Undangan</button>
        <button @click="router.push('/profile')" class="btn-settings">⚙️ Pengaturan</button>
        <button @click="handleLogout" class="btn-logout">🚪 Logout</button>
      </div>
    </div>

    <!-- TAB SWITCH -->
    <div class="tab-switch">
      <button @click="activeTab = 'create'" :class="{ active: activeTab === 'create' }">✨ Buat Baru</button>
      <button @click="activeTab = 'events'" :class="{ active: activeTab === 'events' }">📋 Undangan</button>
      <button @click="activeTab = 'users'" :class="{ active: activeTab === 'users' }">👥 Users</button>
    </div>

    <!-- ==================== TAB BUAT BARU ==================== -->
    <div v-if="activeTab === 'create'">
      <div class="create-section">
        <h2>🎉 Buat Undangan Baru</h2>
        <p>Pilih jenis acara di bawah ini:</p>
        
        <div class="event-type-grid">
          <div class="event-card" @click="createNewWedding('wedding')">
            <div class="event-icon">💍</div>
            <h3>Wedding</h3>
            <p>Pernikahan</p>
          </div>
          
          <div class="event-card" @click="createNewWedding('sunatan')">
            <div class="event-icon">✂️</div>
            <h3>Sunatan</h3>
            <p>Khitanan</p>
          </div>
          
          <div class="event-card" @click="createNewWedding('aqiqah')">
            <div class="event-icon">👶</div>
            <h3>Aqiqah</h3>
            <p>Syukuran Kelahiran</p>
          </div>
          
          <div class="event-card" @click="createNewWedding('syukuran')">
            <div class="event-icon">🏠</div>
            <h3>Syukuran</h3>
            <p>Rumah Baru, Wisuda, dll</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== TAB UNDANGAN ==================== -->
    <div v-if="activeTab === 'events'">
      <!-- STATS CARDS -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📋</div>
          <div class="stat-value">{{ totalEvents }}</div>
          <div class="stat-label">Total Undangan</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-value">{{ totalGuests }}</div>
          <div class="stat-label">Total Tamu</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎁</div>
          <div class="stat-value">{{ totalGifts }}</div>
          <div class="stat-label">Kado Terkirim</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-value">{{ activeEvents }}</div>
          <div class="stat-label">Undangan Aktif</div>
        </div>
      </div>

      <!-- TABEL UNDANGAN -->
      {{ getEventLabel('wedding') }}
      <div class="table-card">
        <div class="table-header">
          <h3>📋 Semua Undangan</h3>
          <button @click="loadAllData" class="btn-refresh">🔄 Refresh</button>
        </div>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Tipe</th>
                <th>Tanggal</th>
                <th>Tamu</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="event in events" :key="event.id">
                <td><strong>{{ event.nama_pria }} {{ event.nama_wanita ? '& ' + event.nama_wanita : '' }}</strong></td>
                <td><span class="event-badge" :class="event.event_type || 'wedding'">{{ getEventLabel(event.event_type) }}</span></td>
                <td>{{ formatDate(event.akad_date) }}</td>
                <td>{{ event.guest_count || 0 }}</td>
                <td><span :class="event.is_active ? 'status-active' : 'status-inactive'">{{ event.is_active ? 'Aktif' : 'Nonaktif' }}</span></td>
                <td class="action-cell">
                  <button @click="viewEvent(event.slug)" class="btn-view">👁️ Lihat</button>
                  <button @click="toggleEventStatus(event)" class="btn-toggle">{{ event.is_active ? 'Nonaktifkan' : 'Aktifkan' }}</button>
                  <button @click="deleteEvent(event)" class="btn-delete">🗑️ Hapus</button>
                </td>
              </tr>
              <tr v-if="events.length === 0">
                <td colspan="6" class="empty-table">Belum ada undangan</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ==================== TAB USERS ==================== -->
    <div v-if="activeTab === 'users'">
      <div class="table-card">
        <div class="table-header">
          <h3>👥 Daftar User</h3>
          <button @click="loadAllData" class="btn-refresh">🔄 Refresh</button>
        </div>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>Role</th>
                <th>Plan</th>
                <th>Undangan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in users" :key="u.id">
                <td><strong>{{ u.name || '-' }}</strong></td>
                <td>{{ u.email }}</td>
                <td><span :class="u.role === 'admin' ? 'role-admin' : 'role-user'">{{ u.role === 'admin' ? '👑 Admin' : '👤 User' }}</span></td>
                <td>
                  <select @change="updateUserPlan(u, $event.target.value)" class="plan-select" :disabled="u.role === 'admin'">
                    <option value="basic" :selected="u.plan === 'basic'">Basic</option>
                    <option value="premium" :selected="u.plan === 'premium'">Premium</option>
                    <option value="enterprise" :selected="u.plan === 'enterprise'">Enterprise</option>
                  </select>
                </td>
                <td>{{ u.event_count || 0 }}</td>
                <td class="action-cell">
                  <button @click="resetUserPassword(u)" class="btn-reset">🔑 Reset PW</button>
                  <button v-if="u.role !== 'admin'" @click="deleteUser(u)" class="btn-delete">🗑️ Hapus</button>
                </td>
              </tr>
              <tr v-if="users.length === 0">
                <td colspan="6" class="empty-table">Belum ada user</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { hashPassword } from '../utils/auth'
import { showError, showSuccess } from '../utils/errorHandler'

const router = useRouter()
const user = ref(null)
const activeTab = ref('create')

const events = ref([])
const users = ref([])
const totalEvents = ref(0)
const totalGuests = ref(0)
const totalGifts = ref(0)
const activeEvents = ref(0)

const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'
const getEventLabel = (t) => ({ wedding: '💍 Wedding', aqiqah: '👶 Aqiqah', syukuran: '🏠 Syukuran', sunatan: '✂️ Sunatan' }[t] || '💍 Wedding')

const loadAllData = async () => {
  try {
    const { data: eventsData } = await supabase.from('weddings').select('*').order('created_at', { ascending: false })
    
    let tg = 0, tgi = 0
    for (const e of eventsData) {
      const { count: gc } = await supabase.from('guests').select('*', { count: 'exact', head: true }).eq('wedding_id', e.id)
      const { count: gic } = await supabase.from('gifts').select('*', { count: 'exact', head: true }).eq('wedding_id', e.id).eq('status', true)
      e.guest_count = gc || 0
      e.gift_count = gic || 0
      tg += e.guest_count
      tgi += e.gift_count
    }
    
    events.value = eventsData
    totalEvents.value = eventsData.length
    totalGuests.value = tg
    totalGifts.value = tgi
    activeEvents.value = eventsData.filter(e => e.is_active).length

    const { data: usersData } = await supabase.from('users').select('*').order('created_at', { ascending: false })
    for (const u of usersData) {
      const { count } = await supabase.from('weddings').select('*', { count: 'exact', head: true }).eq('user_id', u.id)
      u.event_count = count || 0
    }
    users.value = usersData
    
  } catch (err) {
    showError(err, 'Gagal memuat data')
  }
}

const createNewWedding = (eventType) => {
  localStorage.removeItem('currentWeddingId')
  localStorage.removeItem('currentSlug')
  sessionStorage.setItem('selectedEventType', eventType)
  router.push('/dashboard/edit')
}

const goToDashboardList = () => {
  router.push('/dashboard')
}

const viewEvent = (slug) => {
  window.open(`/wedding/${slug}`, '_blank')
}

const toggleEventStatus = async (event) => {
  try {
    const { error } = await supabase.from('weddings').update({ is_active: !event.is_active }).eq('id', event.id)
    if (error) throw error
    event.is_active = !event.is_active
    activeEvents.value = events.value.filter(e => e.is_active).length
    showSuccess(`Undangan ${event.is_active ? 'diaktifkan' : 'dinonaktifkan'}`)
  } catch (err) {
    showError(err, 'Gagal update status')
  }
}

const deleteEvent = async (event) => {
  if (!confirm(`Hapus undangan "${event.nama_pria} ${event.nama_wanita ? '& ' + event.nama_wanita : ''}"?\nSemua data tamu, pesan, dan kado akan ikut terhapus.`)) return
  
  try {
    await supabase.from('gifts').delete().eq('wedding_id', event.id)
    await supabase.from('messages').delete().eq('wedding_id', event.id)
    await supabase.from('guests').delete().eq('wedding_id', event.id)
    
    const { error } = await supabase.from('weddings').delete().eq('id', event.id)
    if (error) throw error
    
    events.value = events.value.filter(e => e.id !== event.id)
    totalEvents.value = events.value.length
    activeEvents.value = events.value.filter(e => e.is_active).length
    
    showSuccess('Undangan berhasil dihapus!')
  } catch (err) {
    showError(err, 'Gagal menghapus undangan')
  }
}

const updateUserPlan = async (userData, newPlan) => {
  if (!confirm(`Ubah plan ${userData.email} ke ${newPlan}?`)) return
  try {
    const { error } = await supabase.from('users').update({ plan: newPlan }).eq('id', userData.id)
    if (error) throw error
    userData.plan = newPlan
    showSuccess(`Plan user diubah ke ${newPlan}`)
  } catch (err) {
    showError(err, 'Gagal update plan')
  }
}

const resetUserPassword = async (userData) => {
  const pass = prompt(`Password baru untuk ${userData.email}:`)
  if (!pass || pass.length < 6) { alert('Minimal 6 karakter'); return }
  try {
    const hash = await hashPassword(pass)
    await supabase.from('users').update({ password_hash: hash }).eq('id', userData.id)
    alert(`✅ Password direset!\n\nEmail: ${userData.email}\nPassword baru: ${pass}`)
  } catch (err) {
    alert('❌ Gagal reset password')
  }
}

const deleteUser = async (u) => {
  if (!confirm(`Hapus user "${u.email}"?\nSemua undangannya akan ikut terhapus.`)) return
  
  try {
    const { data: userEvents } = await supabase.from('weddings').select('id').eq('user_id', u.id)
    for (const e of userEvents) {
      await supabase.from('gifts').delete().eq('wedding_id', e.id)
      await supabase.from('messages').delete().eq('wedding_id', e.id)
      await supabase.from('guests').delete().eq('wedding_id', e.id)
    }
    await supabase.from('weddings').delete().eq('user_id', u.id)
    
    const { error } = await supabase.from('users').delete().eq('id', u.id)
    if (error) throw error
    
    users.value = users.value.filter(us => us.id !== u.id)
    showSuccess('User berhasil dihapus!')
  } catch (err) {
    showError(err, 'Gagal menghapus user')
  }
}

const handleLogout = () => {
  localStorage.removeItem('session')
  router.push('/login')
}

onMounted(() => {
  const session = JSON.parse(localStorage.getItem('session') || 'null')
  if (!session?.user || session.user.role !== 'admin') {
    router.push('/login')
    return
  }
  user.value = session.user
  loadAllData()
})
</script>

<style scoped>
.admin-dashboard { padding: 30px; background: #f5f7fa; min-height: 100vh; }
.admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; flex-wrap: wrap; gap: 15px; }
.admin-header h1 { font-size: 28px; color: #2c3e50; }
.admin-header p { color: #666; margin: 0; }
.header-actions { display: flex; gap: 10px; }
.btn-dashboard { background: #9b87f5; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; }
.btn-settings { background: #f0f0f0; color: #555; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; }
.btn-logout { background: #fee2e2; color: #ef4444; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; }

.tab-switch { display: flex; gap: 10px; margin-bottom: 30px; background: white; padding: 5px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
.tab-switch button { flex: 1; padding: 14px; border: none; background: transparent; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 15px; }
.tab-switch button.active { background: #9b87f5; color: white; }

/* CREATE SECTION */
.create-section { background: white; padding: 30px; border-radius: 20px; box-shadow: 0 5px 20px rgba(0,0,0,0.05); text-align: center; }
.create-section h2 { font-size: 24px; color: #2c3e50; margin-bottom: 8px; }
.create-section > p { color: #666; margin-bottom: 25px; }
.event-type-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
.event-card { background: #f9fafb; border: 2px solid transparent; border-radius: 16px; padding: 25px 15px; cursor: pointer; transition: all 0.3s; text-align: center; }
.event-card:hover { border-color: #9b87f5; background: #f5f0ff; transform: translateY(-5px); box-shadow: 0 10px 25px rgba(155,135,245,0.15); }
.event-icon { font-size: 48px; margin-bottom: 12px; }
.event-card h3 { font-size: 16px; color: #2c3e50; margin-bottom: 4px; }
.event-card p { font-size: 13px; color: #888; }

.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
.stat-card { background: white; padding: 25px; border-radius: 16px; box-shadow: 0 5px 20px rgba(0,0,0,0.05); text-align: center; }
.stat-icon { font-size: 36px; margin-bottom: 10px; }
.stat-value { font-size: 32px; font-weight: 700; color: #2c3e50; }
.stat-label { font-size: 14px; color: #666; margin-top: 5px; }

.table-card { background: white; padding: 25px; border-radius: 16px; box-shadow: 0 5px 20px rgba(0,0,0,0.05); }
.table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.table-header h3 { margin: 0; }
.btn-refresh { background: #9b87f5; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; }
.table-responsive { overflow-x: auto; }

table { width: 100%; border-collapse: collapse; }
th, td { padding: 14px 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 14px; }
th { background: #f9fafb; font-weight: 600; color: #555; }

.event-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.event-badge.wedding { background: #fce4ec; color: #c2185b; }
.status-active { color: #059669; font-weight: 600; }
.status-inactive { color: #ef4444; font-weight: 600; }
.role-admin { color: #9b87f5; font-weight: 600; }
.role-user { color: #666; }

.action-cell { display: flex; gap: 6px; flex-wrap: wrap; }

.plan-select { padding: 6px 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; }

.btn-view { background: #e0e7ff; color: #4f46e5; border: none; padding: 7px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; white-space: nowrap; }
.btn-toggle { background: #f3f4f6; color: #666; border: none; padding: 7px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; white-space: nowrap; }
.btn-delete { background: #fee2e2; color: #ef4444; border: none; padding: 7px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; white-space: nowrap; }
.btn-reset { background: #fef3c7; color: #d97706; border: none; padding: 7px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; white-space: nowrap; }

.empty-table { text-align: center; padding: 40px; color: #999; font-style: italic; }

@media (max-width: 768px) {
  .admin-dashboard { padding: 20px; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .event-type-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>