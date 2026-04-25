<template>
  <div class="template-minimalis">
    <div v-if="!isOpen" class="cover-minimalis">
      <div class="cover-card">
        <div class="cover-icon">{{ getCoverIcon() }}</div>
        <h1 class="cover-title">{{ getTitle() }}</h1>
        <p class="cover-date">{{ formatDate(props.wedding.akad_date) }}</p>
        <p class="cover-guest">Kepada Yth.<br><strong>{{ displayGuestName }}</strong></p>
        <button class="btn-open" @click="openEnvelope">💌 Buka Undangan</button>
        <button class="music-toggle" @click="toggleMusic" :class="{ playing: isPlaying }">{{ isPlaying ? '🔊' : '🔇' }}</button>
      </div>
    </div>
    
    <div v-else class="content-minimalis">
      <div class="container">
        <div class="top-actions"><button class="icon-btn" @click="toggleMusic">{{ isPlaying ? '🔊' : '🔈' }}</button></div>
        <div class="bismillah">﷽</div>
        <h1 class="nama">{{ getTitle() }}</h1>
        <p class="orangtua" v-if="props.wedding.event_type === 'wedding'">{{ props.wedding.orangtua_pria || '...' }} & {{ props.wedding.orangtua_wanita || '...' }}</p>
        <p class="orangtua" v-else>{{ props.wedding.nama_wanita || '' }}</p>
        
        <div class="countdown"><h3>⏳ Menuju Hari Bahagia</h3>
          <div class="countdown-grid">
            <div class="countdown-item"><span class="value">{{ countdown.days }}</span><span class="label">Hari</span></div>
            <div class="countdown-item"><span class="value">{{ countdown.hours }}</span><span class="label">Jam</span></div>
            <div class="countdown-item"><span class="value">{{ countdown.minutes }}</span><span class="label">Menit</span></div>
          </div>
        </div>

        <div class="guest-section"><p>Yang terhormat</p><p class="guest-name-display">{{ displayGuestName }}</p></div>
        
        <div class="event"><h3>{{ getEventIcon() }} {{ getEventLabel() }}</h3>
          <p><span>📆</span> {{ formatDate(props.wedding.akad_date) }}</p>
          <p><span>🕐</span> {{ formatTime(props.wedding.akad_time) }}</p>
          <p><span>📍</span> {{ props.wedding.akad_location }}</p>
          <button class="btn-map" @click="openMaps(props.wedding.akad_location)">🗺️ Buka Google Maps</button>
        </div>
        
        <div class="event" v-if="props.wedding.event_type === 'wedding' && props.wedding.resepsi_date"><h3>🎉 Resepsi</h3>
          <p><span>📆</span> {{ formatDate(props.wedding.resepsi_date) }}</p>
          <p><span>🕐</span> {{ formatTime(props.wedding.resepsi_time) }}</p>
          <p><span>📍</span> {{ props.wedding.resepsi_location || props.wedding.akad_location }}</p>
        </div>
        
        <div class="gallery" v-if="props.theme.gallery?.length"><img v-for="(img, i) in props.theme.gallery" :key="i" :src="img" @click="openLightbox(i)" /></div>
        
        <div class="gift-section" v-if="gifts.length > 0"><h3>🎁 Kirim Kado</h3>
          <div class="gift-grid">
            <div v-for="gift in gifts" :key="gift.id" class="gift-card" :class="{ dibeli: gift.status }">
              <img v-if="gift.image" :src="gift.image" class="gift-img" />
              <div class="gift-content"><h4>{{ gift.name }}</h4><p class="gift-price">Rp {{ formatNumber(gift.price) }}</p>
                <p v-if="gift.status" class="dibeli-badge">✅ Sudah Dibeli</p>
                <a v-else :href="gift.link" target="_blank" class="btn-buy">🛒 Beli Sekarang</a>
              </div>
              <div v-if="props.guestSlug && !gift.status" class="resi-form"><input v-model="gift.resiInput" placeholder="Nomor Resi" /><button @click="claimGift(gift)" :disabled="gift.claiming">{{ gift.claiming ? '...' : 'Klaim' }}</button></div>
              <div v-if="gift.buyer_name" class="buyer-info">Dibeli oleh: {{ gift.buyer_name }}</div>
            </div>
          </div>
        </div>
        
        <div class="amplop" v-if="props.wedding.rekening"><h3>💝 Amplop Digital</h3><pre>{{ props.wedding.rekening }}</pre><button @click="copyRekening">📋 Salin</button></div>
        
        <div class="rsvp"><h3>Konfirmasi Kehadiran</h3>
          <div class="rsvp-buttons"><button @click="rsvpStatus = true" :class="{ active: rsvpStatus === true }">✅ Hadir</button><button @click="rsvpStatus = false" :class="{ active: rsvpStatus === false }">❌ Tidak</button></div>
          <button @click="submitRsvp" :disabled="submitting" class="btn-submit">Kirim Konfirmasi</button>
        </div>
        
        <div class="messages"><h3>💬 Ucapan & Doa</h3>
          <div class="msg-list"><div v-for="msg in messages" :key="msg.id" class="msg-item"><strong>{{ msg.nama_pengirim }}</strong><p>{{ msg.pesan }}</p><small>{{ formatTime(msg.created_at) }}</small></div></div>
          <div class="msg-form"><input v-model="newMessage.nama" placeholder="Nama" /><textarea v-model="newMessage.pesan" placeholder="Ucapan..." rows="2"></textarea><button @click="sendMessage" :disabled="sendingMessage">Kirim Doa</button></div>
        </div>
        
        <p class="footer">Terima kasih atas doa & kehadirannya</p>
      </div>
    </div>

    <div v-if="lightboxOpen" class="lightbox" @click="lightboxOpen = false"><img :src="props.theme.gallery[lightboxIndex]" /><button class="close-lightbox">✕</button></div>
    <audio ref="bgMusic" loop><source :src="props.theme.music_url" type="audio/mpeg"></audio>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { supabase } from '../../lib/supabase'
import confetti from 'canvas-confetti'

const props = defineProps({ wedding: Object, theme: Object, guestName: String, guestSlug: String })

const isOpen = ref(false); const isPlaying = ref(false); const bgMusic = ref(null)
const rsvpStatus = ref(null); const submitting = ref(false); const messages = ref([])
const sendingMessage = ref(false); const gifts = ref([])
const lightboxOpen = ref(false); const lightboxIndex = ref(0)
const newMessage = reactive({ nama: '', pesan: '' })
const countdown = reactive({ days: 0, hours: 0, minutes: 0 })
let interval = null

const eventType = computed(() => props.wedding.event_type || 'wedding')
const displayGuestName = computed(() => props.guestName || 'Bapak/Ibu/Saudara/i')

const getEventIcon = () => ({ wedding: '💍', sunatan: '✂️', aqiqah: '👶', syukuran: '🏠' }[eventType.value] || '💍')
const getCoverIcon = () => ({ wedding: '✨', sunatan: '🕌', aqiqah: '🍼', syukuran: '🏡' }[eventType.value] || '✨')
const getEventLabel = () => ({ wedding: 'Pernikahan', sunatan: 'Khitanan', aqiqah: 'Aqiqah', syukuran: 'Syukuran' }[eventType.value] || 'Pernikahan')
const getTitle = () => eventType.value === 'wedding' ? `${props.wedding.nama_pria || '...'}<br>&<br>${props.wedding.nama_wanita || '...'}` : props.wedding.nama_pria || '...'

const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''
const formatTime = (t) => t ? t.substring(0, 5) + ' WIB' : ''
const formatNumber = (n) => n ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '-'

const updateCountdown = () => { if (!props.wedding.akad_date) return; const diff = new Date(`${props.wedding.akad_date}T${props.wedding.akad_time}`).getTime() - Date.now(); if (diff <= 0) { countdown.days = countdown.hours = countdown.minutes = 0; return } countdown.days = Math.floor(diff / 86400000); countdown.hours = Math.floor((diff % 86400000) / 3600000); countdown.minutes = Math.floor((diff % 3600000) / 60000) }

const openEnvelope = async () => { isOpen.value = true; confetti({ particleCount: 100, spread: 70 }); if (bgMusic.value && props.theme.music_url) { try { await bgMusic.value.play(); isPlaying.value = true } catch {} } }
const toggleMusic = () => { if (!bgMusic.value) return; isPlaying.value ? bgMusic.value.pause() : bgMusic.value.play(); isPlaying.value = !isPlaying.value }
const openMaps = (loc) => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`, '_blank')
const openLightbox = (i) => { lightboxIndex.value = i; lightboxOpen.value = true }
const copyRekening = () => { navigator.clipboard.writeText(props.wedding.rekening); alert('✅ Rekening disalin!') }
const submitRsvp = async () => { if (!props.guestSlug) return alert('Link tidak valid'); submitting.value = true; await supabase.from('guests').update({ status_hadir: rsvpStatus.value, jumlah_orang: 1 }).eq('unique_slug', props.guestSlug); submitting.value = false; alert('✅ Terima kasih!') }
const loadMessages = async () => { const { data } = await supabase.from('messages').select('*').eq('wedding_id', props.wedding.id).order('created_at', { ascending: false }).limit(20); messages.value = data || [] }
const sendMessage = async () => { if (!newMessage.nama || !newMessage.pesan) return alert('Isi'); sendingMessage.value = true; await supabase.from('messages').insert([{ wedding_id: props.wedding.id, nama_pengirim: newMessage.nama, pesan: newMessage.pesan }]); newMessage.nama = newMessage.pesan = ''; await loadMessages(); sendingMessage.value = false }
const loadGifts = async () => { const { data } = await supabase.from('gifts').select('*, dibeli_oleh(nama_tamu)').eq('wedding_id', props.wedding.id); gifts.value = (data || []).map(g => ({ ...g, name: g.nama_barang, price: g.harga_estimasi, link: g.link_produk, image: g.gambar_url, buyer_name: g.dibeli_oleh?.nama_tamu, resiInput: '', claiming: false })) }
const claimGift = async (gift) => { if (!gift.resiInput) return alert('Masukkan resi'); gift.claiming = true; const { data: guest } = await supabase.from('guests').select('id').eq('unique_slug', props.guestSlug).single(); await supabase.from('gifts').update({ dibeli_oleh: guest.id, nomor_resi: gift.resiInput, status: true }).eq('id', gift.id); gift.status = true; gift.buyer_name = props.guestName; gift.resi = gift.resiInput; gift.claiming = false; alert('✅ Diklaim!') }

onMounted(async () => { updateCountdown(); interval = setInterval(updateCountdown, 1000); await loadMessages(); await loadGifts() })
onUnmounted(() => clearInterval(interval))
</script>

<style scoped>
.template-minimalis { min-height: 100vh; background: #fafafa; font-family: 'Poppins', sans-serif; color: #2c3e50; }
.cover-minimalis { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
.cover-card { text-align: center; max-width: 420px; padding: 40px 30px; background: white; border-radius: 30px; box-shadow: 0 10px 40px rgba(0,0,0,0.05); position: relative; }
.cover-icon { font-size: 50px; margin-bottom: 15px; }
.cover-title { font-size: 36px; font-weight: 300; margin: 20px 0; line-height: 1.3; }
.cover-date { font-size: 16px; opacity: 0.7; margin-bottom: 30px; }
.cover-guest { margin: 30px 0; line-height: 1.8; }
.cover-guest strong { font-size: 22px; display: block; margin-top: 8px; }
.btn-open { background: #2c3e50; color: white; border: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; cursor: pointer; margin-top: 20px; }
.music-toggle { position: absolute; bottom: 20px; right: 20px; background: white; border: none; font-size: 24px; padding: 12px; border-radius: 50%; box-shadow: 0 5px 15px rgba(0,0,0,0.1); cursor: pointer; }
.content-minimalis { min-height: 100vh; padding: 30px 15px; display: flex; justify-content: center; }
.container { max-width: 480px; width: 100%; text-align: center; }
.top-actions { text-align: right; margin-bottom: 15px; }
.icon-btn { background: white; border: none; font-size: 22px; padding: 10px; border-radius: 50%; cursor: pointer; box-shadow: 0 3px 10px rgba(0,0,0,0.05); }
.bismillah { font-size: 40px; opacity: 0.5; margin-bottom: 25px; }
.nama { font-size: 32px; font-weight: 300; margin-bottom: 10px; }
.orangtua { font-size: 14px; opacity: 0.7; margin-bottom: 35px; }
.countdown { margin: 35px 0; }
.countdown-grid { display: flex; justify-content: center; gap: 15px; margin-top: 15px; }
.countdown-item { background: white; padding: 15px 10px; border-radius: 15px; min-width: 70px; box-shadow: 0 5px 15px rgba(0,0,0,0.03); }
.value { font-size: 28px; font-weight: 600; display: block; color: #2c3e50; }
.label { font-size: 11px; opacity: 0.5; text-transform: uppercase; }
.guest-section { margin: 35px 0; }
.guest-name-display { font-size: 24px; font-weight: 600; margin-top: 8px; }
.event { background: white; padding: 22px; border-radius: 20px; margin: 25px 0; text-align: left; box-shadow: 0 5px 15px rgba(0,0,0,0.03); }
.event h3 { margin-bottom: 15px; font-weight: 500; }
.event p { margin: 6px 0; display: flex; align-items: center; gap: 8px; }
.btn-map { background: #2c3e50; color: white; border: none; padding: 10px 15px; border-radius: 10px; margin-top: 12px; cursor: pointer; width: 100%; font-weight: 500; }
.gallery { display: flex; gap: 10px; overflow-x: auto; padding: 10px 0; margin: 25px 0; }
.gallery img { width: 200px; height: 250px; object-fit: cover; border-radius: 15px; cursor: pointer; }
.gift-section { margin: 30px 0; }
.gift-grid { display: grid; gap: 15px; }
.gift-card { background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.03); }
.gift-card.dibeli { opacity: 0.7; }
.gift-img { width: 100%; height: 180px; object-fit: cover; }
.gift-content { padding: 18px; }
.gift-price { font-size: 18px; font-weight: 700; color: #2c3e50; margin: 8px 0; }
.dibeli-badge { color: #059669; font-weight: 600; }
.btn-buy { display: inline-block; background: #2c3e50; color: white; padding: 10px 20px; border-radius: 50px; text-decoration: none; font-weight: 600; margin-top: 8px; }
.resi-form { display: flex; gap: 8px; padding: 12px; background: #fff8e1; }
.resi-form input { flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 8px; }
.resi-form button { background: #059669; color: white; border: none; padding: 8px 15px; border-radius: 8px; cursor: pointer; }
.buyer-info { padding: 10px 18px; background: #e8f5e9; font-size: 12px; }
.amplop { background: white; padding: 22px; border-radius: 20px; margin: 25px 0; }
.amplop pre { background: #f5f5f5; padding: 12px; border-radius: 10px; text-align: left; margin: 12px 0; }
.amplop button { background: #2c3e50; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; }
.rsvp { background: white; padding: 22px; border-radius: 20px; margin: 25px 0; }
.rsvp-buttons { display: flex; gap: 10px; margin: 15px 0; }
.rsvp-buttons button { flex: 1; padding: 12px; border: 1px solid #ddd; background: white; border-radius: 10px; cursor: pointer; }
.rsvp-buttons button.active { background: #2c3e50; color: white; }
.btn-submit { width: 100%; padding: 12px; background: #2c3e50; color: white; border: none; border-radius: 10px; cursor: pointer; margin-top: 10px; }
.messages { background: white; padding: 22px; border-radius: 20px; margin: 25px 0; text-align: left; }
.msg-list { max-height: 200px; overflow-y: auto; margin: 15px 0; }
.msg-item { padding: 10px 0; border-bottom: 1px solid #eee; }
.msg-form { display: flex; flex-direction: column; gap: 8px; }
.msg-form input, .msg-form textarea { padding: 10px; border: 1px solid #ddd; border-radius: 10px; }
.msg-form button { background: #2c3e50; color: white; border: none; padding: 10px; border-radius: 10px; cursor: pointer; }
.footer { margin-top: 40px; opacity: 0.5; font-size: 14px; }
.lightbox { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.95); z-index: 1000; display: flex; align-items: center; justify-content: center; }
.lightbox img { max-width: 90%; max-height: 90%; border-radius: 15px; }
.close-lightbox { position: absolute; top: 20px; right: 20px; background: white; border: none; width: 40px; height: 40px; border-radius: 50%; font-size: 20px; cursor: pointer; }
</style>