<template>
  <div class="admin-dashboard">
    <div class="admin-header">
      <div><h1>📊 Dashboard Admin</h1><p>Kelola semua undangan dan user</p></div>
      <div class="header-actions">
        <button @click="router.push('/profile')" class="btn-settings">⚙️ Pengaturan</button>
        <button @click="handleLogout" class="btn-logout">🚪 Logout</button>
      </div>
    </div>
    
    <div class="filter-bar">
      <button @click="loadAllData" class="btn-refresh">🔄 Refresh Data</button>
      <button @click="router.push('/dashboard')" class="btn-pricing btn-popular">Buat Undangan</button>
    </div>

    <div class="tab-switch">
      <button @click="activeTab = 'events'" :class="{ active: activeTab === 'events' }">📋 Undangan</button>
      <button @click="activeTab = 'users'" :class="{ active: activeTab === 'users' }">👥 Users</button>
    </div>

    <!-- TAB UNDANGAN -->
    <div v-if="activeTab === 'events'">
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-icon">📋</div><div class="stat-value">{{ totalEvents }}</div><div class="stat-label">Total Undangan</div></div>
        <div class="stat-card"><div class="stat-icon">👥</div><div class="stat-value">{{ totalGuests }}</div><div class="stat-label">Total Tamu</div></div>
        <div class="stat-card"><div class="stat-icon">🎁</div><div class="stat-value">{{ totalGifts }}</div><div class="stat-label">Kado Terkirim</div></div>
        <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-value">{{ activeEvents }}</div><div class="stat-label">Undangan Aktif</div></div>
      </div>

      <div class="table-card">
        <h3>📋 Semua Undangan</h3>
        <table>
          <thead><tr><th>Event</th><th>Tipe</th><th>Tanggal</th><th>Tamu</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>
            <tr v-for="event in events" :key="event.id">
              <td><strong>{{ event.nama_pria }} & {{ event.nama_wanita || '' }}</strong></td>
              <td><span class="event-badge" :class="event.event_type || 'wedding'">{{ getEventLabel(event.event_type) }}</span></td>
              <td>{{ formatDate(event.akad_date) }}</td>
              <td>{{ event.guest_count || 0 }}</td>
              <td><span :class="event.is_active ? 'status-active' : 'status-inactive'">{{ event.is_active ? 'Aktif' : 'Nonaktif' }}</span></td>
              <td>
                <button @click="viewEvent(event.slug)" class="btn-view">👁️</button>
                <button @click="toggleEventStatus(event)" class="btn-toggle">{{ event.is_active ? 'Nonaktifkan' : 'Aktifkan' }}</button>
                <button @click="deleteEvent(event)" class="btn-delete">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB USERS -->
    <div v-if="activeTab === 'users'">
      <div class="table-card">
        <h3>👥 Daftar User</h3>
        <table>
          <thead><tr><th>Nama</th><th>Email</th><th>Role</th><th>Plan</th><th>Undangan</th><th>Aksi</th></tr></thead>
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
              <td>
                <button @click="resetUserPassword(u)" class="btn-reset">🔑 Reset PW</button>
                <button v-if="u.role !== 'admin'" @click="deleteUser(u)" class="btn-delete">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
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
const activeTab = ref('events')
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
      e.guest_count = gc || 0; e.gift_count = gic || 0; tg += e.guest_count; tgi += e.gift_count
    }
    events.value = eventsData; totalEvents.value = eventsData.length; totalGuests.value = tg; totalGifts.value = tgi
    activeEvents.value = eventsData.filter(e => e.is_active).length

    const { data: usersData } = await supabase.from('users').select('*').order('created_at', { ascending: false })
    for (const u of usersData) {
      const { count } = await supabase.from('weddings').select('*', { count: 'exact', head: true }).eq('user_id', u.id)
      u.event_count = count || 0
    }
    users.value = usersData
  } catch (err) { showError(err, 'Gagal memuat data') }
}

const viewEvent = (slug) => window.open(`/wedding/${slug}`, '_blank')
const toggleEventStatus = async (event) => {
  const { error } = await supabase.from('weddings').update({ is_active: !event.is_active }).eq('id', event.id)
  if (error) { showError(error, 'Gagal'); return }
  event.is_active = !event.is_active; showSuccess(`Undangan ${event.is_active ? 'diaktifkan' : 'dinonaktifkan'}`)
}
const deleteEvent = async (event) => {
  if (!confirm('Yakin hapus?')) return
  await supabase.from('gifts').delete().eq('wedding_id', event.id)
  await supabase.from('messages').delete().eq('wedding_id', event.id)
  await supabase.from('guests').delete().eq('wedding_id', event.id)
  await supabase.from('weddings').delete().eq('id', event.id)
  events.value = events.value.filter(e => e.id !== event.id); showSuccess('Undangan dihapus')
}

const updateUserPlan = async (userData, newPlan) => {
  if (!confirm(`Ubah plan ${userData.email} ke ${newPlan}?`)) return
  const { error } = await supabase.from('users').update({ plan: newPlan }).eq('id', userData.id)
  if (error) { showError(error, 'Gagal'); return }
  userData.plan = newPlan; showSuccess(`Plan user diubah ke ${newPlan}`)
}

const resetUserPassword = async (userData) => {
  const pass = prompt(`Password baru untuk ${userData.email}:`)
  if (!pass || pass.length < 6) { alert('Minimal 6 karakter'); return }
  const hash = await hashPassword(pass)
  await supabase.from('users').update({ password_hash: hash }).eq('id', userData.id)
  alert(`✅ Password direset!\nEmail: ${userData.email}\nPassword: ${pass}`)
}

const deleteUser = async (u) => {
  if (!confirm(`Hapus ${u.email}?`)) return
  const { data: events } = await supabase.from('weddings').select('id').eq('user_id', u.id)
  for (const e of events) { await supabase.from('gifts').delete().eq('wedding_id', e.id); await supabase.from('messages').delete().eq('wedding_id', e.id); await supabase.from('guests').delete().eq('wedding_id', e.id) }
  await supabase.from('weddings').delete().eq('user_id', u.id)
  await supabase.from('users').delete().eq('id', u.id)
  users.value = users.value.filter(us => us.id !== u.id); showSuccess('User dihapus')
}

const handleLogout = () => { localStorage.removeItem('session'); router.push('/login') }

onMounted(() => {
  const session = JSON.parse(localStorage.getItem('session') || 'null')
  if (!session?.user || session.user.role !== 'admin') { router.push('/login'); return }
  user.value = session.user; loadAllData()
})
</script>

<style scoped>
.admin-dashboard { padding: 30px; background: #f5f7fa; min-height: 100vh; }
.admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
.header-actions { display: flex; gap: 10px; }
.btn-settings { background: #f0f0f0; color: #555; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; }
.btn-logout { background: #fee2e2; color: #ef4444; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; }
.filter-bar { margin-bottom: 25px; }
.btn-refresh { background: #9b87f5; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; }
.tab-switch { display: flex; gap: 10px; margin-bottom: 30px; background: white; padding: 5px; border-radius: 12px; }
.tab-switch button { flex: 1; padding: 14px; border: none; background: transparent; border-radius: 8px; font-weight: 600; cursor: pointer; }
.tab-switch button.active { background: #9b87f5; color: white; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
.stat-card { background: white; padding: 25px; border-radius: 16px; text-align: center; box-shadow: 0 5px 20px rgba(0,0,0,0.05); }
.stat-icon { font-size: 36px; }
.stat-value { font-size: 32px; font-weight: 700; color: #2c3e50; }
.stat-label { font-size: 14px; color: #666; }
.table-card { background: white; padding: 25px; border-radius: 16px; box-shadow: 0 5px 20px rgba(0,0,0,0.05); }
.table-card h3 { margin-bottom: 20px; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
th { background: #f9fafb; font-weight: 600; }
.plan-select { padding: 6px 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; }
.btn-view, .btn-toggle, .btn-delete, .btn-reset { padding: 6px 12px; margin: 2px; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; }
.btn-view { background: #e0e7ff; color: #4f46e5; }
.btn-toggle { background: #f3f4f6; color: #666; }
.btn-delete { background: #fee2e2; color: #ef4444; }
.btn-reset { background: #fef3c7; color: #d97706; }
.status-active { color: #059669; font-weight: 600; }
.status-inactive { color: #ef4444; }
.role-admin { color: #9b87f5; font-weight: 600; }
.role-user { color: #666; }
@media (max-width: 768px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
</style>