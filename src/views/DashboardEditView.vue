<template>
  <div class="dashboard">
    <LoadingSpinner v-if="saving || uploadingBg || uploadingGallery || uploadingMusic" fullscreen :text="loadingText" />
    
    <div class="panel-kiri">
      <div class="header">
        <div>
          <button @click="router.push('/dashboard')" class="btn-back-list">← Daftar Undangan</button>
          <h1>✨ {{ currentWeddingId ? 'Edit' : 'Buat' }} Undangan {{ getEventLabel(form.event_type) }}</h1>
          <p>Isi detail di bawah, preview langsung muncul di kanan</p>
        </div>
        <div class="header-actions">
          <button @click="router.push('/profile')" class="btn-settings" v-if="user">⚙️ Pengaturan</button>
          <button @click="handleLogout" class="btn-logout" v-if="user">🚪 Logout</button>
        </div>
      </div>

      <div class="plan-info" v-if="user && user?.role !== 'admin'">
        <div class="plan-badge" :class="user?.plan || 'basic'">{{ planLimits.name }}</div>
        <div class="plan-limits">
          <span>👥 {{ guestList.length }}/{{ planLimits.maxGuests === Infinity ? '∞' : planLimits.maxGuests }}</span>
          <span>🎁 {{ giftList.length }}/{{ planLimits.maxGifts === Infinity ? '∞' : planLimits.maxGifts }}</span>
        </div>
        <button v-if="user?.plan === 'basic'" class="btn-upgrade" @click="upgradePlan">⬆️ Upgrade Premium (Rp 99rb)</button>
      </div>

      <form @submit.prevent="saveWedding">
        <div class="section"><h3>📋 {{ getEventDataLabel() }}</h3>
          <template v-if="form.event_type === 'wedding'">
            <label>Nama Mempelai Pria *</label><input v-model="form.nama_pria" placeholder="Budi Santoso" />
            <label>Nama Mempelai Wanita *</label><input v-model="form.nama_wanita" placeholder="Ani Lestari" />
          </template>
          <template v-else-if="form.event_type === 'sunatan' || form.event_type === 'aqiqah'">
            <label>Nama Anak *</label><input v-model="form.nama_pria" placeholder="Muhammad Rafa" />
            <label>Nama Orang Tua</label><input v-model="form.nama_wanita" placeholder="Bapak Budi & Ibu Ani" />
          </template>
          <template v-else-if="form.event_type === 'syukuran'">
            <label>Nama Acara *</label><input v-model="form.nama_pria" placeholder="Syukuran Rumah Baru" />
            <label>Nama Tuan Rumah</label><input v-model="form.nama_wanita" placeholder="Bapak Budi & Ibu Ani" />
          </template>
        </div>

        <div class="section" v-if="form.event_type === 'wedding'"><h3>👨‍👩‍👧 Orang Tua</h3><label>Orang Tua Pria</label><input v-model="form.orangtua_pria" /><label>Orang Tua Wanita</label><input v-model="form.orangtua_wanita" /></div>

        <div class="section"><h3>📅 Tanggal Acara</h3><div class="form-row"><input type="date" v-model="form.akad_date" /><input type="time" v-model="form.akad_time" /></div><label>Lokasi *</label><textarea v-model="form.akad_location" rows="2"></textarea></div>

        <div class="section" v-if="form.event_type === 'wedding'"><h3>🎉 Resepsi</h3><div class="form-row"><input type="date" v-model="form.resepsi_date" /><input type="time" v-model="form.resepsi_time" /></div><label>Lokasi</label><textarea v-model="form.resepsi_location" rows="2"></textarea></div>

        <div class="section"><h3>💳 Rekening</h3><textarea v-model="form.rekening" rows="3" placeholder="BCA: 123456789 a/n Budi"></textarea></div>

        <div class="section"><h3>🎨 Template</h3>
          <div class="template-selector">
            <div class="template-option" :class="{ active: form.template === 'elegan' }" @click="form.template = 'elegan'"><div class="template-preview elegan">💐</div><label>Elegan</label></div>
            <div class="template-option" :class="{ active: form.template === 'minimalis' }" @click="form.template = 'minimalis'"><div class="template-preview minimalis">✨</div><label>Minimalis</label></div>
            <div class="template-option" :class="{ active: form.template === 'floral' }" @click="form.template = 'floral'"><div class="template-preview floral">🌸</div><label>Floral</label></div>
          </div>
        </div>

        <div class="section"><h3>🎨 Kustomisasi</h3><label>Warna</label><div class="color-row"><input type="color" v-model="form.theme.primary_color" /></div><label>Font</label><select v-model="form.theme.font_family"><option>Poppins, sans-serif</option><option>'Playfair Display', serif</option><option>'Dancing Script', cursive</option></select><label>Background</label><select v-model="form.theme.background_type" @change="handleBgChange"><option value="solid">Warna</option><option value="image">Gambar</option></select><div v-if="form.theme.background_type === 'solid'"><input type="color" v-model="form.theme.background_value" /></div><div v-if="form.theme.background_type === 'image'"><input type="file" @change="uploadBackground" accept="image/*" /><img v-if="form.theme.background_value" :src="form.theme.background_value" class="preview-bg" /></div></div>

        <div class="section"><h3>🖼️ Galeri</h3><input type="file" @change="uploadGallery" accept="image/*" multiple /><div v-if="uploadingGallery" class="loading-inline">⏳ {{ uploadProgress }}</div><div class="gallery-preview"><div v-for="(img, idx) in form.gallery" :key="idx" class="gallery-item"><img :src="img" /><button @click="removeImage(idx)">✕</button></div></div></div>

        <div class="section"><h3>🎵 Musik</h3><input type="file" @change="uploadMusic" accept="audio/*" /><div v-if="uploadingMusic" class="loading-inline">⏳ Upload...</div><label>Atau URL</label><input v-model="form.theme.music_url" placeholder="https://..." /></div>

        <div class="action-buttons"><button type="submit" class="btn-primary" :disabled="saving">{{ saving ? '⏳' : '💾' }} {{ currentWeddingId ? 'Update' : 'Simpan' }}</button><button type="button" class="btn-secondary" @click="resetForm">🔄 Reset</button></div>

        <div v-if="savedSlug" class="result-link"><h3>✅ Link Undangan</h3><div class="link-box"><code>{{ baseUrl }}/wedding/{{ savedSlug }}</code><button @click="copyMainLink">📋</button></div><button @click="previewWedding" class="preview-btn">👁️ Preview</button></div>

        <div v-if="savedSlug && giftList.length > 0" class="gift-summary-box"><div class="gift-summary-header"><h3>🎁 Monitor Kado</h3><button @click="loadGiftList" class="btn-refresh" :disabled="loadingGifts">🔄</button></div><div class="gift-summary-stats"><div class="stat-item"><span class="stat-value">{{ giftList.length }}</span><span class="stat-label">Total</span></div><div class="stat-item"><span class="stat-value highlight">{{ purchasedGiftsCount }}</span><span class="stat-label">Dibeli</span></div><div class="stat-item"><span class="stat-value">{{ availableGiftsCount }}</span><span class="stat-label">Tersedia</span></div></div><div v-if="recentlyPurchasedGifts.length > 0" class="recent-purchases"><h4>🆕 Pembelian Terbaru</h4><div v-for="gift in recentlyPurchasedGifts.slice(0, 3)" :key="gift.id" class="recent-item"><span>✅ {{ gift.name }}</span><span>oleh {{ gift.buyer_name }}</span><span v-if="gift.resi">📦 {{ gift.resi }}</span></div></div></div>

        <div class="section" v-if="savedSlug"><h3>👥 Tamu ({{ guestList.length }}/{{ planLimits.maxGuests === Infinity ? '∞' : planLimits.maxGuests }})</h3>
          <div class="guest-form-box" v-if="canAddMoreGuests"><div class="form-row"><input v-model="newGuest.name" placeholder="Nama Tamu *" @keyup.enter="addGuest" /><input v-model="newGuest.nickname" placeholder="Panggilan" style="max-width:130px" /></div><div class="form-row"><select v-model="newGuest.category"><option>Keluarga</option><option>Teman</option><option>Kolega</option><option>VIP</option></select><input type="number" v-model="newGuest.seats" min="1" max="10" placeholder="Kursi" style="max-width:80px" /></div><button @click="addGuest" class="btn-add-guest">➕ Tambah</button></div>
          <div v-else class="limit-reached"><p>❌ Limit tamu! ({{ guestList.length }}/{{ planLimits.maxGuests }})</p><button @click="upgradePlan" class="btn-upgrade">⬆️ Upgrade Premium</button></div>
          <div class="csv-section" v-if="canAddMoreGuests"><h4>📄 Import CSV</h4><p class="csv-hint">Format: Nama,Panggilan,Kategori,Kursi</p><div class="csv-upload-area"><input type="file" @change="handleCSVUpload" accept=".csv" ref="csvInput" /><button @click="$refs.csvInput.click()" class="btn-choose-csv">📂 Pilih CSV</button></div><div v-if="csvPreview.length > 0" class="csv-preview"><div class="csv-preview-header"><h5>Preview ({{ csvPreview.length }})</h5><button @click="clearCSVPreview" class="btn-clear-csv">✕</button></div><div class="csv-preview-list"><div v-for="(item, idx) in csvPreview.slice(0, 5)" :key="idx" class="csv-preview-item"><span>{{ item.name }}</span><span>{{ item.category }} | {{ item.seats }} kursi</span></div><p v-if="csvPreview.length > 5">...dan {{ csvPreview.length - 5 }} lainnya</p></div><button @click="importCSV" class="btn-import-csv">✅ Import {{ csvPreview.length }} Tamu</button></div></div>
          <div class="guest-filter" v-if="guestList.length > 0"><input v-model="searchGuest" placeholder="🔍 Cari..." /><select v-model="filterCategory"><option value="">Semua</option><option>Keluarga</option><option>Teman</option><option>Kolega</option><option>VIP</option></select></div>
          <div v-if="guestList.length > 0" class="guest-list-full"><div v-for="guest in filteredGuestList" :key="guest.id" class="guest-item-full"><div><span class="guest-name">{{ guest.name }}</span><span class="guest-category" :class="guest.category">{{ guest.category }}</span></div><div class="guest-link-box"><code>{{ baseUrl }}/wedding/{{ savedSlug }}?to={{ guest.slug }}</code><button @click="copyGuestLink(guest.slug)" class="btn-icon-sm">📋</button><button @click="shareWA(guest)" class="btn-icon-sm btn-wa">💬</button><button @click="deleteGuest(guest.id)" class="btn-icon-sm btn-del">🗑️</button></div></div></div>
        </div>

        <div class="section" v-if="savedSlug"><h3>🎁 Kado ({{ giftList.length }}/{{ planLimits.maxGifts === Infinity ? '∞' : planLimits.maxGifts }})</h3>
          <div class="gift-form-box" v-if="canAddMoreGifts"><input v-model="newGift.name" placeholder="Nama Barang *" /><input v-model="newGift.price" type="number" placeholder="Harga (Rp)" /><input v-model="newGift.link" placeholder="Link" /><button @click="addGift" class="btn-add-guest">➕ Tambah</button></div>
          <div v-else class="limit-reached"><p>❌ Limit kado! ({{ giftList.length }}/{{ planLimits.maxGifts }})</p><button @click="upgradePlan" class="btn-upgrade">⬆️ Upgrade Premium</button></div>
          <div v-if="giftList.length > 0" class="gift-list"><div v-for="gift in giftList" :key="gift.id" class="gift-item"><div><span class="gift-name">{{ gift.name }}</span><span class="gift-price">Rp {{ formatNumber(gift.price) }}</span></div><span :class="{ dibeli: gift.status }">{{ gift.status ? '✅' : '🟡' }}</span><button @click="deleteGift(gift.id)" class="btn-del">🗑️</button></div></div>
        </div>
      </form>
    </div>

    <!-- PANEL KANAN: PREVIEW -->
    <div class="panel-kanan">
      <div v-if="form.template === 'elegan'" class="mockup-hp" :style="previewStyles"><div class="hp-content">
        <div v-if="previewMode === 'cover'" class="preview-cover"><div class="cover-decoration">{{ getMockupIcon() }}</div><p class="cover-subtitle">{{ getMockupCoverTitle() }}</p><h1>{{ getPreviewTitle() }}</h1><p class="cover-date">{{ formatDate(form.akad_date) || 'Tanggal Acara' }}</p><div class="mock-guest-welcome"><p>Kepada Yth.</p><strong>{{ previewGuestName }}</strong></div><button class="mock-open-btn" @click="previewMode = 'content'">💌 Buka</button></div>
        <div v-else class="preview-content"><button class="mock-back-btn" @click="previewMode = 'cover'">←</button><div class="bismillah">﷽</div><h1>{{ getPreviewTitle() }}</h1><div class="mock-countdown"><span>00 Hari</span><span>00 Jam</span><span>00 Mnt</span></div><div class="mock-event"><h4>📅 Acara</h4><p>{{ formatDate(form.akad_date) }}</p></div></div>
      </div></div>

      <div v-else-if="form.template === 'minimalis'" class="mockup-hp minimalis-preview"><div class="hp-content">
        <div v-if="previewMode === 'cover'" class="preview-cover-minimalis"><div class="cover-icon">{{ getMockupIcon() }}</div><h1>{{ getPreviewTitle() }}</h1><p class="cover-date">{{ formatDate(form.akad_date) }}</p><p class="cover-guest">Kepada Yth.<br><strong>{{ previewGuestName }}</strong></p><button class="mock-open-btn minimalis-btn" @click="previewMode = 'content'">💌 Buka</button></div>
        <div v-else class="preview-content-minimalis"><button class="mock-back-btn" @click="previewMode = 'cover'">←</button><div class="bismillah">﷽</div><h1>{{ getPreviewTitle() }}</h1><div class="countdown-mini"><span>00 Hari</span><span>00 Jam</span></div><div class="event-mini"><h4>📅 Acara</h4><p>{{ formatDate(form.akad_date) }}</p></div></div>
      </div></div>

      <div v-else-if="form.template === 'floral'" class="mockup-hp floral-preview"><div class="hp-content">
        <div v-if="previewMode === 'cover'" class="preview-cover-floral"><div class="floral-border"><div class="cover-icon">{{ getMockupIcon() }}</div><h1>{{ getPreviewTitle() }}</h1><p class="cover-date">{{ formatDate(form.akad_date) }}</p><p class="cover-guest">Kepada Yth.<br><strong>{{ previewGuestName }}</strong></p><button class="mock-open-btn floral-btn" @click="previewMode = 'content'">💐 Buka</button></div></div>
        <div v-else class="preview-content-floral"><button class="mock-back-btn" @click="previewMode = 'cover'">←</button><div class="bismillah">﷽</div><h1>{{ getPreviewTitle() }}</h1><div class="countdown-mini"><span>00 Hari</span><span>00 Jam</span></div><div class="event-mini"><h4>📅 Acara</h4><p>{{ formatDate(form.akad_date) }}</p></div></div>
      </div></div>

      <div class="preview-controls"><p class="preview-label">📱 Preview {{ form.template }}</p><div class="mode-switch"><button @click="previewMode = 'cover'" :class="{ active: previewMode === 'cover' }">Cover</button><button @click="previewMode = 'content'" :class="{ active: previewMode === 'content' }">Isi</button></div></div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onUnmounted, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import imageCompression from 'browser-image-compression'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { showError, showSuccess } from '../utils/errorHandler'
import { canCreateWedding, getPlanLimits } from '../utils/planLimits'

const router = useRouter()
const user = ref(null)
const planLimits = ref(getPlanLimits())
const waNumber = '6281234567890'

const form = reactive({
  nama_pria: '', nama_wanita: '', akad_date: '', akad_time: '', akad_location: '',
  resepsi_date: '', resepsi_time: '', resepsi_location: '', orangtua_pria: '', orangtua_wanita: '', rekening: '',
  event_type: 'wedding', template: 'elegan',
  theme: { primary_color: '#9b87f5', font_family: 'Poppins, sans-serif', background_type: 'solid', background_value: '#ffffff', music_url: '' },
  gallery: []
})

const saving = ref(false); const uploadingBg = ref(false); const uploadingGallery = ref(false)
const uploadProgress = ref('0/0'); const uploadingMusic = ref(false)
const savedSlug = ref(''); const baseUrl = window.location.origin
const previewMode = ref('cover'); const selectedPreviewGuestId = ref('')
const loadingText = computed(() => saving.value ? 'Menyimpan...' : 'Memproses...')

const newGuest = reactive({ name: '', nickname: '', category: 'Keluarga', seats: 1 })
const guestList = ref([]); const currentWeddingId = ref(null); const loadingGuests = ref(false)
const searchGuest = ref(''); const filterCategory = ref('')
const csvPreview = ref([]); const csvInput = ref(null)

const newGift = reactive({ name: '', price: null, link: '', image: '' })
const giftList = ref([]); const loadingGifts = ref(false)
let giftRefreshInterval = null

const canAddMoreGuests = computed(() => planLimits.value.maxGuests === Infinity || guestList.value.length < planLimits.value.maxGuests)
const canAddMoreGifts = computed(() => planLimits.value.maxGifts === Infinity || giftList.value.length < planLimits.value.maxGifts)

const previewStyles = computed(() => ({ backgroundColor: form.theme.background_type === 'solid' ? form.theme.background_value : 'transparent', backgroundImage: form.theme.background_type === 'image' ? `url(${form.theme.background_value})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', color: form.theme.primary_color, fontFamily: form.theme.font_family }))
const filteredGuestList = computed(() => { let f = guestList.value; if (searchGuest.value) { const s = searchGuest.value.toLowerCase(); f = f.filter(g => g.name.toLowerCase().includes(s) || (g.nickname && g.nickname.toLowerCase().includes(s))) } if (filterCategory.value) f = f.filter(g => g.category === filterCategory.value); return f })
const previewGuestName = computed(() => selectedPreviewGuestId.value ? (guestList.value.find(x => x.id === selectedPreviewGuestId.value)?.nickname || '...') : 'Bapak/Ibu/Saudara/i')
const purchasedGiftsCount = computed(() => giftList.value.filter(g => g.status).length)
const availableGiftsCount = computed(() => giftList.value.filter(g => !g.status).length)
const recentlyPurchasedGifts = computed(() => giftList.value.filter(g => g.status && g.buyer_name))

const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''
const formatNumber = (n) => n ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '-'

const getEventLabel = (t) => ({ wedding: '💍 Wedding', sunatan: '✂️ Sunatan', aqiqah: '👶 Aqiqah', syukuran: '🏠 Syukuran' }[t] || '💍 Wedding')
const getEventDataLabel = () => ({ wedding: 'Data Mempelai', sunatan: 'Data Anak', aqiqah: 'Data Bayi', syukuran: 'Data Acara' }[form.event_type] || 'Data Mempelai')
const getMockupIcon = () => ({ wedding: '💐', sunatan: '🕌', aqiqah: '🍼', syukuran: '🏠' }[form.event_type] || '💐')
const getMockupCoverTitle = () => ({ wedding: 'The Wedding Of', sunatan: 'Khitanan', aqiqah: 'Aqiqah', syukuran: 'Syukuran' }[form.event_type] || 'The Wedding Of')
const getPreviewTitle = () => form.event_type === 'wedding' ? `${form.nama_pria || '...'} & ${form.nama_wanita || '...'}` : form.nama_pria || '...'

const upgradePlan = () => {
  const email = user.value?.email || ''
  window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(`Halo kak, saya mau upgrade ke PREMIUM (Rp 99.000).\n\nEmail: ${email}\n\nMohon info pembayarannya. Terima kasih!`)}`, '_blank')
}

const handleBgChange = () => { form.theme.background_value = form.theme.background_type === 'solid' ? '#ffffff' : '' }
const removeImage = (i) => form.gallery.splice(i, 1)

const uploadBackground = async (e) => { const f = e.target.files[0]; if (!f) return; if (f.size > 10*1024*1024) { showError(null, 'Max 10MB'); return }; uploadingBg.value = true; try { const c = await imageCompression(f, { maxSizeMB: 0.5, maxWidthOrHeight: 1200 }); const { data } = await supabase.storage.from('weddings').upload(`bg-${Date.now()}.${f.name.split('.').pop()}`, c); form.theme.background_value = supabase.storage.from('weddings').getPublicUrl(data.path).data.publicUrl; showSuccess('Uploaded!') } catch { showError(null, 'Gagal') } finally { uploadingBg.value = false; e.target.value = '' } }
const uploadGallery = async (e) => { const files = Array.from(e.target.files); if (!files.length) return; uploadingGallery.value = true; let up = 0; try { for (const f of files) { uploadProgress.value = `${up}/${files.length}`; if (!f.type.startsWith('image/')) continue; if (f.size > 10*1024*1024) continue; const c = await imageCompression(f, { maxSizeMB: 0.3, maxWidthOrHeight: 800 }); const { data } = await supabase.storage.from('weddings').upload(`gal-${Date.now()}-${Math.random().toString(36).slice(2)}.${f.name.split('.').pop()}`, c); form.gallery.push(supabase.storage.from('weddings').getPublicUrl(data.path).data.publicUrl); up++ } if (up > 0) showSuccess(`${up} foto!`) } catch { showError(null, 'Gagal') } finally { uploadingGallery.value = false; uploadProgress.value = '0/0'; e.target.value = '' } }
const uploadMusic = async (e) => { const f = e.target.files[0]; if (!f) return; if (f.size > 20*1024*1024) { showError(null, 'Max 20MB'); return }; uploadingMusic.value = true; try { const { data } = await supabase.storage.from('weddings').upload(`mus-${Date.now()}.${f.name.split('.').pop()}`, f, { contentType: 'audio/mpeg' }); form.theme.music_url = supabase.storage.from('weddings').getPublicUrl(data.path).data.publicUrl; showSuccess('Musik!') } catch { showError(null, 'Gagal') } finally { uploadingMusic.value = false; e.target.value = '' } }

const saveWedding = async () => {
  if (!form.nama_pria || !form.akad_date || !form.akad_time || !form.akad_location) { showError(null, 'Isi data wajib!'); return }
  saving.value = true
  try {
    if (currentWeddingId.value) {
      await supabase.from('weddings').update({ nama_pria: form.nama_pria, nama_wanita: form.nama_wanita, akad_date: form.akad_date, akad_time: form.akad_time, akad_location: form.akad_location, resepsi_date: form.resepsi_date || null, resepsi_time: form.resepsi_time || null, resepsi_location: form.resepsi_location || null, orangtua_pria: form.orangtua_pria, orangtua_wanita: form.orangtua_wanita, rekening: form.rekening, event_type: form.event_type, template: form.template, theme_settings: { ...form.theme, gallery: form.gallery } }).eq('id', currentWeddingId.value)
      showSuccess('Diupdate!')
    } else {
      const { allowed, message } = await canCreateWedding(supabase)
      if (!allowed) { alert(message); return }
      const slug = `${(form.nama_pria || 'event').toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-6)}`
      const { data } = await supabase.from('weddings').insert([{ nama_pria: form.nama_pria, nama_wanita: form.nama_wanita, akad_date: form.akad_date, akad_time: form.akad_time, akad_location: form.akad_location, resepsi_date: form.resepsi_date || null, resepsi_time: form.resepsi_time || null, resepsi_location: form.resepsi_location || null, orangtua_pria: form.orangtua_pria, orangtua_wanita: form.orangtua_wanita, rekening: form.rekening, event_type: form.event_type, template: form.template, slug, theme_settings: { ...form.theme, gallery: form.gallery }, is_active: true, expired_at: new Date(Date.now() + 30*24*60*60*1000), user_id: user.value?.id || null }]).select()
      savedSlug.value = slug; currentWeddingId.value = data[0].id
      localStorage.setItem('currentWeddingId', data[0].id); localStorage.setItem('currentSlug', slug)
      showSuccess('Tersimpan!')
    }
    await loadGuestList(); await loadGiftList()
  } catch (err) { showError(err, 'Gagal') } finally { saving.value = false }
}

const resetForm = () => { if (confirm('Reset?')) { Object.assign(form, { nama_pria: '', nama_wanita: '', akad_date: '', akad_time: '', akad_location: '', resepsi_date: '', resepsi_time: '', resepsi_location: '', orangtua_pria: '', orangtua_wanita: '', rekening: '', event_type: 'wedding', template: 'elegan', theme: { primary_color: '#9b87f5', font_family: 'Poppins, sans-serif', background_type: 'solid', background_value: '#ffffff', music_url: '' }, gallery: [] }); savedSlug.value = ''; currentWeddingId.value = null; guestList.value = []; giftList.value = []; previewMode.value = 'cover'; localStorage.removeItem('currentSlug'); localStorage.removeItem('currentWeddingId') } }
const copyMainLink = () => { navigator.clipboard.writeText(`${baseUrl}/wedding/${savedSlug.value}`); showSuccess('Link dicopy!') }
const previewWedding = () => window.open(`${baseUrl}/wedding/${savedSlug.value}`, '_blank')

const loadGuestList = async () => { if (!currentWeddingId.value) return; loadingGuests.value = true; try { const { data } = await supabase.from('guests').select('*').eq('wedding_id', currentWeddingId.value); guestList.value = (data || []).map(g => ({ id: g.id, name: g.nama_tamu, nickname: g.nickname || '', category: g.category || 'Keluarga', seats: g.seats || 1, slug: g.unique_slug, status_buka: g.status_buka })) } catch { } finally { loadingGuests.value = false } }
const addGuest = async () => { if (!canAddMoreGuests.value) { alert('❌ Limit!'); return } if (!newGuest.name.trim()) { showError(null, 'Nama wajib'); return }; try { const slug = `${newGuest.name.toLowerCase().replace(/[^a-z0-9-]/g, '')}-${Date.now().toString().slice(-6)}`; const { data, error } = await supabase.from('guests').insert([{ wedding_id: currentWeddingId.value, nama_tamu: newGuest.name, nickname: newGuest.nickname || null, category: newGuest.category, seats: newGuest.seats, unique_slug: slug, status_buka: false }]).select(); if (error) { showError(error); return }; if (!data) return; guestList.value.push({ id: data[0].id, name: newGuest.name, nickname: newGuest.nickname, category: newGuest.category, seats: newGuest.seats, slug, status_buka: false }); Object.assign(newGuest, { name: '', nickname: '', category: 'Keluarga', seats: 1 }); showSuccess('Tamu ditambah!') } catch { showError(null, 'Gagal') } }
const copyGuestLink = (slug) => { navigator.clipboard.writeText(`${baseUrl}/wedding/${savedSlug.value}?to=${slug}`); showSuccess('Link dicopy!') }
const shareWA = (guest) => { window.open(`https://wa.me/?text=${encodeURIComponent(`Yth. ${guest.nickname || guest.name}, Anda diundang ke ${form.nama_pria}: ${baseUrl}/wedding/${savedSlug.value}?to=${guest.slug}`)}`, '_blank') }
const deleteGuest = async (id) => { if (confirm('Hapus?')) { await supabase.from('guests').delete().eq('id', id); guestList.value = guestList.value.filter(g => g.id !== id); showSuccess('Dihapus') } }

const handleCSVUpload = (e) => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = (ev) => { const lines = ev.target.result.split('\n').filter(line => line.trim()); csvPreview.value = lines.map(line => { const parts = line.split(',').map(p => p.trim()); return { name: parts[0], nickname: parts[1] || '', category: parts[2] || 'Keluarga', seats: parseInt(parts[3]) || 1 } }).filter(item => item.name) }; reader.readAsText(file, 'UTF-8'); e.target.value = '' }
const clearCSVPreview = () => { csvPreview.value = [] }
const importCSV = async () => { if (!csvPreview.value.length) return; const totalAfter = guestList.value.length + csvPreview.value.length; if (planLimits.value.maxGuests !== Infinity && totalAfter > planLimits.value.maxGuests) { alert(`❌ Total: ${totalAfter}/${planLimits.value.maxGuests}`); return }; let success = 0; for (const item of csvPreview.value) { try { const slug = `${item.name.toLowerCase().replace(/[^a-z0-9-]/g, '')}-${Date.now()}-${Math.random().toString(36).substring(4)}`; const { data } = await supabase.from('guests').insert([{ wedding_id: currentWeddingId.value, nama_tamu: item.name, nickname: item.nickname || null, category: item.category, seats: item.seats, unique_slug: slug, status_buka: false }]).select(); guestList.value.push({ id: data[0].id, name: item.name, nickname: item.nickname, category: item.category, seats: item.seats, slug, status_buka: false }); success++ } catch { } }; showSuccess(`Import: ${success}`); csvPreview.value = [] }

const loadGiftList = async () => { if (!currentWeddingId.value) return; loadingGifts.value = true; try { const { data } = await supabase.from('gifts').select('*, dibeli_oleh(nama_tamu)').eq('wedding_id', currentWeddingId.value); giftList.value = (data || []).map(g => ({ id: g.id, name: g.nama_barang, price: g.harga_estimasi, link: g.link_produk, image: g.gambar_url, status: g.status, buyer_name: g.dibeli_oleh?.nama_tamu || null, resi: g.nomor_resi })) } catch { } finally { loadingGifts.value = false } }
const addGift = async () => { if (!canAddMoreGifts.value) { alert('❌ Limit!'); return } if (!newGift.name) { showError(null, 'Nama wajib'); return }; try { const { data } = await supabase.from('gifts').insert([{ wedding_id: currentWeddingId.value, nama_barang: newGift.name, harga_estimasi: newGift.price, link_produk: newGift.link, gambar_url: newGift.image, status: false }]).select(); giftList.value.push({ id: data[0].id, name: newGift.name, price: newGift.price, link: newGift.link, image: newGift.image, status: false, buyer_name: null, resi: null }); Object.assign(newGift, { name: '', price: null, link: '', image: '' }); showSuccess('Kado ditambah!') } catch { showError(null, 'Gagal') } }
const deleteGift = async (id) => { if (confirm('Hapus?')) { await supabase.from('gifts').delete().eq('id', id); giftList.value = giftList.value.filter(g => g.id !== id); showSuccess('Dihapus') } }

const handleLogout = async () => {
  await supabase.auth.signOut()
  localStorage.removeItem('session')
  localStorage.removeItem('currentWeddingId')
  localStorage.removeItem('currentSlug')
  router.push('/login')
}

onMounted(async () => {
  // Cek session custom
  const session = JSON.parse(localStorage.getItem('session') || 'null')
  
  // Cek session Supabase (Google)
  const { data: { session: supabaseSession } } = await supabase.auth.getSession()
  
  if (supabaseSession?.user) {
    const email = supabaseSession.user.email
    const name = supabaseSession.user.user_metadata?.full_name || email
    
    const { data: existingUser } = await supabase.from('users').select('*').eq('email', email).single()
    let userData = existingUser
    if (!existingUser) {
      const { data: newUser } = await supabase.from('users').insert([{ email, name, role: 'user', plan: 'basic', password_hash: 'google-oauth' }]).select()
      userData = newUser?.[0]
    }
    
    localStorage.setItem('session', JSON.stringify({
      user: { id: userData?.id || 'google-user', email, name, role: userData?.role || 'user', plan: userData?.plan || 'basic' },
      token: supabaseSession.access_token,
      expires: Date.now() + 30 * 24 * 60 * 60 * 1000
    }))
    
    user.value = { id: userData?.id || 'google-user', email, name, role: userData?.role || 'user', plan: userData?.plan || 'basic' }
  } else if (session?.user) {
    user.value = session.user
  } else {
    router.push('/login')
    return
  }
  
  planLimits.value = getPlanLimits()
  
  const selectedEventType = sessionStorage.getItem('selectedEventType')
  if (selectedEventType && !localStorage.getItem('currentWeddingId')) { form.event_type = selectedEventType; sessionStorage.removeItem('selectedEventType') }
  
  const savedId = localStorage.getItem('currentWeddingId'); const savedSlugData = localStorage.getItem('currentSlug')
  if (savedId && savedSlugData) { currentWeddingId.value = savedId; savedSlug.value = savedSlugData; try { const { data: w } = await supabase.from('weddings').select('*').eq('id', savedId).maybeSingle(); if (w) { Object.assign(form, { nama_pria: w.nama_pria || '', nama_wanita: w.nama_wanita || '', akad_date: w.akad_date || '', akad_time: w.akad_time || '', akad_location: w.akad_location || '', resepsi_date: w.resepsi_date || '', resepsi_time: w.resepsi_time || '', resepsi_location: w.resepsi_location || '', orangtua_pria: w.orangtua_pria || '', orangtua_wanita: w.orangtua_wanita || '', rekening: w.rekening || '', event_type: w.event_type || 'wedding', template: w.template || 'elegan', theme: w.theme_settings || { primary_color: '#9b87f5', font_family: 'Poppins, sans-serif', background_type: 'solid', background_value: '#ffffff', music_url: '' }, gallery: w.theme_settings?.gallery || [] }) }; await loadGuestList(); await loadGiftList() } catch { localStorage.removeItem('currentSlug'); localStorage.removeItem('currentWeddingId') } }
})

onUnmounted(() => { if (giftRefreshInterval) clearInterval(giftRefreshInterval) })
</script>

<style scoped>
.dashboard { display: flex; min-height: 100vh; }
.panel-kiri { width: 45%; background: white; padding: 30px; border-right: 1px solid #e0e0e0; overflow-y: auto; max-height: 100vh; }
.header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; margin-bottom: 20px; gap: 15px; }
.header h1 { font-size: 28px; color: #9b87f5; }
.header p { color: #666; }
.header-actions { display: flex; gap: 10px; }
.btn-back-list { background: transparent; color: #9b87f5; border: 1px solid #9b87f5; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; margin-bottom: 10px; }
.btn-settings { background: #f0f0f0; color: #555; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; }
.btn-logout { background: #fee2e2; color: #ef4444; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; }
.plan-info { background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 15px; border-radius: 12px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.plan-badge { padding: 6px 14px; border-radius: 20px; font-weight: 700; font-size: 13px; text-transform: uppercase; }
.plan-badge.basic { background: #f0f0f0; color: #666; }
.plan-limits { display: flex; gap: 12px; font-size: 14px; }
.btn-upgrade { margin-left: auto; padding: 8px 16px; background: #9b87f5; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; }
.limit-reached { background: #fef2f2; padding: 15px; border-radius: 8px; text-align: center; }
.limit-reached p { color: #ef4444; font-weight: 600; margin-bottom: 8px; }
.section { background: #f9f9f9; padding: 20px; border-radius: 12px; margin-bottom: 20px; }
.section h3 { margin-bottom: 15px; }
label { display: block; margin-top: 12px; font-weight: 600; color: #555; font-size: 14px; }
input, textarea, select { width: 100%; padding: 12px; margin-top: 6px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; }
.form-row { display: flex; gap: 10px; margin-bottom: 10px; }
.form-row input, .form-row select { flex: 1; }
.template-selector { display: flex; gap: 12px; margin-top: 10px; }
.template-option { flex: 1; text-align: center; cursor: pointer; padding: 12px 8px; border-radius: 12px; border: 2px solid transparent; background: white; }
.template-option.active { border-color: #9b87f5; }
.template-preview { width: 100%; height: 70px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 32px; margin-bottom: 8px; }
.template-preview.elegan { background: linear-gradient(135deg, #667eea, #764ba2); color: white; }
.template-preview.minimalis { background: #f5f5f5; color: #333; border: 1px solid #e0e0e0; }
.template-preview.floral { background: linear-gradient(135deg, #fbcfe8, #f9a8d4); color: white; }
.template-option label { margin: 0; font-size: 14px; font-weight: 600; }
.color-row { display: flex; align-items: center; gap: 10px; margin-top: 6px; }
.color-row input[type="color"] { width: 50px; height: 35px; padding: 0; }
.action-buttons { display: flex; gap: 10px; margin-top: 20px; }
.btn-primary { flex: 2; padding: 14px; background: #9b87f5; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }
.btn-primary:disabled { opacity: 0.6; }
.btn-secondary { flex: 1; padding: 14px; background: white; color: #666; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; }
.result-link { margin-top: 15px; padding: 15px; background: #e8f5e9; border-radius: 12px; }
.link-box { display: flex; gap: 10px; background: white; padding: 10px; border-radius: 8px; }
.link-box code { flex: 1; font-size: 12px; word-break: break-all; }
.preview-btn { width: 100%; margin-top: 10px; padding: 12px; background: #9b87f5; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; }
.gift-summary-box { margin-top: 15px; padding: 15px; background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 12px; }
.gift-summary-header { display: flex; justify-content: space-between; align-items: center; }
.btn-refresh { background: white; border: 1px solid #fcd34d; padding: 8px 16px; border-radius: 50px; cursor: pointer; font-weight: 600; }
.gift-summary-stats { display: flex; gap: 10px; margin: 12px 0; }
.stat-item { flex: 1; text-align: center; background: white; padding: 10px; border-radius: 10px; }
.stat-value { font-size: 24px; font-weight: 700; }
.stat-value.highlight { color: #059669; }
.stat-label { font-size: 11px; color: #666; }
.recent-purchases { background: white; padding: 12px; border-radius: 10px; margin-top: 10px; }
.recent-item { display: flex; gap: 8px; padding: 4px 0; font-size: 12px; flex-wrap: wrap; }
.guest-form-box, .gift-form-box { display: flex; flex-direction: column; gap: 10px; }
.btn-add-guest { padding: 12px; background: #9b87f5; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
.csv-section { background: white; padding: 15px; border-radius: 12px; margin: 15px 0; border: 1px solid #e0e0e0; }
.guest-list-full, .gift-list { max-height: 300px; overflow-y: auto; }
.guest-item-full, .gift-item { display: flex; align-items: center; justify-content: space-between; padding: 10px; background: white; border-radius: 8px; margin-bottom: 8px; border: 1px solid #eee; flex-wrap: wrap; gap: 8px; }
.guest-link-box { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; }
.guest-link-box code { font-size: 10px; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.btn-icon-sm { padding: 5px 8px; border: none; border-radius: 5px; cursor: pointer; background: #f0f0f0; }
.btn-wa { background: #25D366; color: white; }
.btn-del { background: #fee2e2; color: #ef4444; }
.guest-category { padding: 3px 8px; border-radius: 15px; font-size: 10px; font-weight: 600; }
.guest-category.Keluarga { background: #e3f2fd; color: #1976d2; }
.guest-category.Teman { background: #e8f5e9; color: #388e3c; }
.guest-category.Kolega { background: #fff3e0; color: #f57c00; }
.guest-category.VIP { background: #fce4ec; color: #c2185b; }
.guest-filter { display: flex; gap: 8px; margin: 15px 0; }
.guest-filter input { flex: 2; }
.guest-filter select { flex: 1; }
.dibeli { color: #4caf50; font-weight: 700; }
.panel-kanan { width: 55%; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 30px; }
.mockup-hp { width: 360px; height: 680px; background: white; border-radius: 45px; padding: 20px; box-shadow: 0 30px 60px rgba(0,0,0,0.3); border: 10px solid #1a1a1a; overflow-y: auto; }
.hp-content { text-align: center; }
.preview-cover { display: flex; flex-direction: column; justify-content: center; min-height: 560px; }
.cover-decoration, .cover-icon { font-size: 45px; margin-bottom: 10px; }
.cover-subtitle { font-size: 11px; letter-spacing: 3px; opacity: 0.7; text-transform: uppercase; }
.preview-cover h1 { font-size: 24px; margin: 15px 0; font-family: 'Playfair Display', serif; }
.cover-date { font-size: 13px; margin-bottom: 20px; }
.mock-guest-welcome { margin: 20px 0; }
.mock-guest-welcome strong { font-size: 18px; display: block; }
.mock-open-btn { padding: 14px 30px; color: white; border: none; border-radius: 50px; font-weight: bold; cursor: pointer; margin-top: 20px; }
.preview-cover .mock-open-btn { background: #9b87f5; }
.mock-back-btn { background: transparent; border: 1px solid #ddd; padding: 6px 12px; border-radius: 50px; font-size: 11px; cursor: pointer; margin-bottom: 10px; }
.mock-countdown, .countdown-mini { display: flex; justify-content: center; gap: 12px; margin: 15px 0; padding: 10px; background: rgba(155,135,245,0.1); border-radius: 10px; font-size: 13px; }
.countdown-mini { background: #f5f5f5; }
.mock-event, .event-mini { background: #f9f9f9; padding: 12px; border-radius: 10px; margin: 15px 0; text-align: left; }
.event-mini { background: white; border: 1px solid #eee; }
.mock-event h4, .event-mini h4 { margin-bottom: 5px; font-size: 14px; }
.bismillah { font-size: 32px; opacity: 0.6; margin-bottom: 10px; }
.minimalis-preview { background: #fafafa !important; font-family: 'Poppins', sans-serif !important; }
.preview-cover-minimalis { display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 560px; text-align: center; padding: 20px; }
.preview-cover-minimalis .cover-icon { font-size: 50px; margin-bottom: 15px; }
.preview-cover-minimalis h1 { font-size: 26px; font-weight: 300; margin: 15px 0; color: #2c3e50; }
.preview-cover-minimalis .cover-date { font-size: 14px; color: #888; }
.preview-cover-minimalis .cover-guest { font-size: 14px; color: #666; margin: 20px 0; }
.preview-cover-minimalis strong { font-size: 20px; display: block; color: #2c3e50; }
.minimalis-btn { background: #2c3e50 !important; }
.preview-content-minimalis { text-align: center; padding: 20px 10px; }
.preview-content-minimalis h1 { font-size: 24px; font-weight: 300; color: #2c3e50; }
.floral-preview { background: linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,240,245,0.95)) !important; font-family: 'Poppins', sans-serif !important; }
.preview-cover-floral { display: flex; justify-content: center; align-items: center; min-height: 560px; padding: 15px; }
.floral-border { border: 3px solid #fbcfe8; border-radius: 25px; padding: 30px 20px; text-align: center; background: white; width: 100%; box-shadow: 0 10px 30px rgba(244,114,182,0.1); }
.floral-border .cover-icon { font-size: 50px; margin-bottom: 15px; }
.floral-border h1 { font-size: 24px; color: #831843; margin: 15px 0; font-family: 'Playfair Display', serif; }
.floral-border .cover-date { font-size: 14px; color: #9d174d; }
.floral-border .cover-guest { font-size: 14px; color: #831843; margin: 20px 0; }
.floral-border strong { font-size: 20px; display: block; color: #831843; }
.floral-btn { background: linear-gradient(135deg, #f472b6, #ec4899) !important; }
.preview-content-floral { text-align: center; padding: 20px 10px; }
.preview-content-floral h1 { font-size: 24px; color: #831843; font-family: 'Playfair Display', serif; }
.preview-controls { margin-top: 15px; text-align: center; }
.preview-label { color: white; font-weight: 600; margin-bottom: 8px; font-size: 14px; }
.mode-switch { display: flex; gap: 8px; justify-content: center; }
.mode-switch button { padding: 8px 20px; background: rgba(255,255,255,0.2); border: 1px solid white; color: white; border-radius: 50px; cursor: pointer; font-size: 13px; }
.mode-switch button.active { background: white; color: #667eea; }
@media (max-width: 768px) { .dashboard { flex-direction: column; } .panel-kiri, .panel-kanan { width: 100%; padding: 15px; } .mockup-hp { width: 300px; height: 580px; } }
</style>