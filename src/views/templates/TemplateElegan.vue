<template>
  <div class="wedding-view template-elegan">
    <div class="parallax-bg" :style="bgStyle"></div>
    
    <div class="floating-elements">
      <span v-for="i in 15" :key="i" class="floating-leaf" :style="{ '--delay': i * 0.4 + 's', '--pos': i * 7 + '%' }">{{ getFloatingEmoji() }}</span>
      <span v-for="i in 10" :key="'leaf-'+i" class="floating-leaf-2" :style="{ '--delay': i * 0.6 + 's', '--pos': i * 9 + '%' }">🍃</span>
    </div>

    <div v-if="!isOpen" class="cover-page" :style="coverStyle">
      <div class="cover-content" :class="{ 'tearing': isTearing }">
        <div class="cover-frame">
          <div class="cover-decoration">{{ getCoverIcon() }}</div>
          <h2 class="cover-subtitle">{{ getCoverTitle() }}</h2>
          <h1 class="cover-title">{{ getTitle() }}</h1>
          <div class="cover-date">{{ formatDate(props.wedding.akad_date) }}</div>
          <div class="guest-welcome"><p>Kepada Yth.</p><strong>{{ displayGuestName }}</strong></div>
          <button class="btn-open" @click="openEnvelope"><span>💌 Buka Undangan</span></button>
        </div>
        <button class="music-toggle cover-music" @click="toggleMusic" :class="{ playing: isPlaying }">{{ isPlaying ? '🔊' : '🔇' }}</button>
      </div>
    </div>

    <div v-else class="main-content">
      <div class="content-card">
        <div class="top-actions"><button class="icon-btn" @click="toggleMusic"><span>{{ isPlaying ? '🔊' : '🔈' }}</span></button></div>

        <div class="hero-section" data-aos="fade-up">
          <div class="hero-image" v-if="props.theme.gallery && props.theme.gallery.length"><img :src="props.theme.gallery[0]" alt="Couple" /><div class="hero-overlay"></div></div>
          <div class="hero-content"><div class="bismillah">﷽</div><p class="hero-text">Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri {{ getEventLabel() }}:</p></div>
        </div>

        <div class="section-names" data-aos="fade-up" data-aos-delay="100">
          <div class="names-container"><h1 class="wedding-title">{{ getTitle() }}</h1></div>
          <p class="parents-name" v-if="props.wedding.event_type === 'wedding'">Putra dari {{ props.wedding.orangtua_pria || '...' }}<br>&<br>Putri dari {{ props.wedding.orangtua_wanita || '...' }}</p>
          <p class="parents-name" v-else>{{ props.wedding.nama_wanita ? 'Putra dari ' + props.wedding.nama_wanita : '' }}</p>
        </div>

        <div class="section-quote" data-aos="fade-up" data-aos-delay="200">
          <div class="quote-box">
            <p class="arabic">وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً</p>
            <p class="translation">"Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang."</p>
            <p class="reference">— Q.S. Ar-Rum: 21</p>
          </div>
        </div>

        <div class="section-countdown" data-aos="fade-up" data-aos-delay="300">
          <h3 class="section-title">⏳ Menuju Hari Bahagia</h3>
          <div class="countdown-container" v-if="countdownTarget">
            <div class="countdown-grid">
              <div class="countdown-item"><span class="countdown-value">{{ countdown.days }}</span><span class="countdown-label">Hari</span></div>
              <div class="countdown-item"><span class="countdown-value">{{ countdown.hours }}</span><span class="countdown-label">Jam</span></div>
              <div class="countdown-item"><span class="countdown-value">{{ countdown.minutes }}</span><span class="countdown-label">Menit</span></div>
              <div class="countdown-item"><span class="countdown-value">{{ countdown.seconds }}</span><span class="countdown-label">Detik</span></div>
            </div>
            <p class="countdown-target-label">Menuju {{ getEventLabel() }}</p>
          </div>
        </div>

        <div class="section-guest" data-aos="fade-up" data-aos-delay="400">
          <p class="guest-intro">Yang terhormat</p>
          <p class="guest-name-display">{{ displayGuestName }}</p>
          <p class="guest-message">Kami mengharapkan kehadiran Bapak/Ibu/Saudara/i untuk memberikan doa restu</p>
        </div>

        <div class="section-event" data-aos="fade-up" data-aos-delay="500">
          <h3 class="section-title">📅 Acara</h3>
          <div class="event-card">
            <div class="event-header"><div class="event-icon">{{ getEventIcon() }}</div><h4>{{ getEventLabel() }}</h4></div>
            <div class="event-details">
              <p class="event-date"><span>📆</span> {{ formatDate(props.wedding.akad_date) }}</p>
              <p class="event-time"><span>🕐</span> {{ formatTime(props.wedding.akad_time) }}</p>
              <p class="event-location"><span>📍</span> {{ props.wedding.akad_location }}</p>
            </div>
            <button class="btn-map-small" @click="openMaps(props.wedding.akad_location)">🗺️ Buka Google Maps</button>
          </div>
          <div class="event-card" v-if="props.wedding.event_type === 'wedding' && props.wedding.resepsi_date">
            <div class="event-header"><div class="event-icon">🎉</div><h4>Resepsi Pernikahan</h4></div>
            <div class="event-details">
              <p class="event-date"><span>📆</span> {{ formatDate(props.wedding.resepsi_date) }}</p>
              <p class="event-time"><span>🕐</span> {{ formatTime(props.wedding.resepsi_time) }}</p>
              <p class="event-location"><span>📍</span> {{ props.wedding.resepsi_location || props.wedding.akad_location }}</p>
            </div>
            <button class="btn-map-small" @click="openMaps(props.wedding.resepsi_location || props.wedding.akad_location)">🗺️ Buka Google Maps</button>
          </div>
        </div>

        <div class="section-gallery" data-aos="fade-up" data-aos-delay="600" v-if="props.theme.gallery && props.theme.gallery.length">
          <h3 class="section-title">📸 Galeri Kenangan</h3>
          <swiper :modules="modules" :slides-per-view="1" :space-between="15" :pagination="{ clickable: true }" :autoplay="{ delay: 3000 }" loop class="gallery-swiper">
            <swiper-slide v-for="(img, i) in props.theme.gallery" :key="i"><div class="gallery-slide" @click="openLightbox(i)"><img :src="img" /></div></swiper-slide>
          </swiper>
        </div>

        <div class="section-wishes" data-aos="fade-up" data-aos-delay="700">
          <div class="wishes-box">
            <div class="wishes-icon">💕</div>
            <p class="wishes-text">"Semoga Allah memberkahi acara ini, menjadikannya penuh kebahagiaan dan keberkahan."</p>
            <p class="wishes-signature">— {{ getTitle() }}</p>
          </div>
        </div>

        <div class="section-gifts" data-aos="fade-up" data-aos-delay="800" v-if="gifts.length > 0">
          <h3 class="section-title">🎁 Kirim Kado</h3>
          <p class="gift-message">Berikut beberapa kado yang diinginkan:</p>
          <div class="gift-grid">
            <div v-for="gift in gifts" :key="gift.id" class="gift-card" :class="{ dibeli: gift.status }">
              <div class="gift-card-image" v-if="gift.image"><img :src="gift.image" /></div>
              <div class="gift-card-content">
                <h4>{{ gift.name }}</h4>
                <p class="gift-price">Rp {{ formatNumber(gift.price) }}</p>
                <p class="gift-status-badge" v-if="gift.status">✅ Sudah Dibeli</p>
                <a v-else :href="gift.link" target="_blank" class="btn-buy">🛒 Beli Sekarang</a>
              </div>
              <div v-if="props.guestSlug && !gift.status" class="resi-form"><input v-model="gift.resiInput" placeholder="Nomor Resi" /><button @click="claimGift(gift)" :disabled="gift.claiming">{{ gift.claiming ? '...' : 'Klaim' }}</button></div>
              <div v-if="gift.buyer_name" class="gift-buyer-info">Dibeli oleh: {{ gift.buyer_name }}<span v-if="gift.resi">({{ gift.resi }})</span></div>
            </div>
          </div>
        </div>

        <div class="section-gift" data-aos="fade-up" data-aos-delay="900" v-if="props.wedding.rekening">
          <h3 class="section-title">💝 Amplop Digital</h3>
          <div class="rekening-list"><div class="rekening-item"><pre>{{ props.wedding.rekening }}</pre><button @click="copyRekening" :class="{ shaking: isShaking }"><span>📋</span> Salin</button></div></div>
        </div>

        <div class="section-rsvp" data-aos="fade-up" data-aos-delay="1000">
          <h3 class="section-title">📝 Konfirmasi Kehadiran</h3>
          <div class="rsvp-buttons">
            <button @click="rsvpStatus = true" :class="{ active: rsvpStatus === true }"><span>✅</span> Hadir</button>
            <button @click="rsvpStatus = false" :class="{ active: rsvpStatus === false }"><span>❌</span> Tidak Hadir</button>
          </div>
          <div v-if="rsvpStatus === true" class="rsvp-guest-count"><label>Jumlah Orang</label><input type="number" v-model="jumlahOrang" min="1" max="10" /></div>
          <button @click="submitRsvp" class="btn-rsvp" :disabled="submitting">{{ submitting ? 'Mengirim...' : 'Kirim Konfirmasi' }}</button>
          <div class="floating-hearts" v-if="showHearts"><span v-for="i in 15" :key="i" class="heart" :style="{ '--i': i }">❤️</span></div>
        </div>

        <div class="section-messages" data-aos="fade-up" data-aos-delay="1100">
          <h3 class="section-title">💬 Ucapan & Doa</h3>
          <div class="message-list"><div v-for="msg in messages" :key="msg.id" class="message-item"><div class="message-header"><strong>{{ msg.nama_pengirim }}</strong><small>{{ formatMessageTime(msg.created_at) }}</small></div><p>{{ msg.pesan }}</p></div><div v-if="messages.length === 0" class="message-empty">💭 Belum ada ucapan.</div></div>
          <div class="message-form"><input v-model="newMessage.nama" placeholder="Nama Anda" /><textarea v-model="newMessage.pesan" placeholder="Tulis doa atau ucapan..." rows="3"></textarea><button @click="sendMessage" :disabled="sendingMessage"><span>📨</span> Kirim Doa</button></div>
        </div>

        <div class="section-closing" data-aos="fade-up" data-aos-delay="1200">
          <div class="closing-decoration">✨</div>
          <p class="closing-text">Merupakan suatu kehormatan dan kebahagiaan bagi kami atas kehadiran Bapak/Ibu/Saudara/i untuk memberikan doa restu.</p>
          <p class="closing-signature">Wassalamu'alaikum Wr. Wb.</p>
          <div class="virtual-signature">{{ getTitle() }}</div>
          <p class="copyright">© {{ new Date().getFullYear() }} UndanganKu • Made with ❤️</p>
        </div>
      </div>
    </div>

    <div v-if="lightboxOpen" class="lightbox" @click="lightboxOpen = false"><img :src="props.theme.gallery[lightboxIndex]" /><button class="close-lightbox">✕</button></div>
    <audio ref="bgMusic" loop><source :src="musicUrl" type="audio/mpeg"></audio>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { supabase } from '../../lib/supabase'
import confetti from 'canvas-confetti'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import { updateMetaTags } from '../../utils/seo'
import { showError, showSuccess } from '../../utils/errorHandler'

const modules = [Pagination, Autoplay]
const props = defineProps({ wedding: Object, theme: Object, guestName: String, guestSlug: String })

const isOpen = ref(false); const isTearing = ref(false); const isPlaying = ref(false); const bgMusic = ref(null)
const messages = ref([]); const gifts = ref([]); const rsvpStatus = ref(null); const jumlahOrang = ref(1)
const submitting = ref(false); const sendingMessage = ref(false); const isShaking = ref(false)
const showHearts = ref(false); const lightboxOpen = ref(false); const lightboxIndex = ref(0)
const newMessage = reactive({ nama: '', pesan: '' })
const countdown = reactive({ days: 0, hours: 0, minutes: 0, seconds: 0 })
let countdownInterval = null

// DYNAMIC CONTENT BASED ON EVENT TYPE
const eventType = computed(() => props.wedding.event_type || 'wedding')

const getEventIcon = () => {
  const icons = { wedding: '💍', sunatan: '✂️', aqiqah: '👶', syukuran: '🏠' }
  return icons[eventType.value] || '💍'
}

const getFloatingEmoji = () => {
  const emojis = { wedding: '🌸', sunatan: '⭐', aqiqah: '🍼', syukuran: '🏡' }
  return emojis[eventType.value] || '🌸'
}

const getCoverTitle = () => {
  const titles = { wedding: 'The Wedding Of', sunatan: 'Khitanan', aqiqah: 'Aqiqah', syukuran: 'Syukuran' }
  return titles[eventType.value] || 'The Wedding Of'
}

const getCoverIcon = () => {
  const icons = { wedding: '💐', sunatan: '🕌', aqiqah: '👶', syukuran: '🏠' }
  return icons[eventType.value] || '💐'
}

const getEventLabel = () => {
  const labels = { wedding: 'Pernikahan', sunatan: 'Khitanan', aqiqah: 'Aqiqah', syukuran: 'Syukuran' }
  return labels[eventType.value] || 'Pernikahan'
}

const getTitle = () => {
  if (eventType.value === 'wedding') return `${props.wedding.nama_pria || '...'} & ${props.wedding.nama_wanita || '...'}`
  return props.wedding.nama_pria || '...'
}

const displayGuestName = computed(() => props.guestName || 'Bapak/Ibu/Saudara/i')
const bgStyle = computed(() => ({ backgroundImage: props.theme.background_type === 'image' ? `url(${props.theme.background_value})` : 'none', backgroundColor: props.theme.background_type === 'solid' ? props.theme.background_value : 'transparent' }))
const coverStyle = computed(() => ({ '--primary': props.theme.primary_color || '#9b87f5', fontFamily: props.theme.font_family || 'Poppins, sans-serif' }))
const musicUrl = computed(() => props.theme.music_url || '')

const countdownTarget = computed(() => {
  if (!props.wedding) return null
  const now = new Date()
  if (props.wedding.akad_date && props.wedding.akad_time) {
    const dt = new Date(`${props.wedding.akad_date}T${props.wedding.akad_time}`)
    if (!isNaN(dt.getTime()) && dt > now) return { timestamp: dt.getTime() }
  }
  return null
})

const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''
const formatTime = (t) => t ? t.substring(0, 5) + ' WIB' : ''
const formatMessageTime = (ts) => new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
const formatNumber = (n) => n ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '-'

const updateCountdown = () => {
  if (!countdownTarget.value) return
  const diff = countdownTarget.value.timestamp - Date.now()
  if (diff <= 0) { countdown.days = countdown.hours = countdown.minutes = countdown.seconds = 0; return }
  countdown.days = Math.floor(diff / (1000 * 60 * 60 * 24))
  countdown.hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  countdown.minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  countdown.seconds = Math.floor((diff % (1000 * 60)) / 1000)
}

const openEnvelope = async () => {
  isTearing.value = true
  setTimeout(() => { isOpen.value = true; confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } }) }, 400)
  await nextTick(); AOS.refresh()
  if (bgMusic.value) { try { await bgMusic.value.play(); isPlaying.value = true } catch {} }
}
const toggleMusic = () => { if (!bgMusic.value) return; isPlaying.value ? bgMusic.value.pause() : bgMusic.value.play(); isPlaying.value = !isPlaying.value }
const openMaps = (loc) => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`, '_blank')
const openLightbox = (i) => { lightboxIndex.value = i; lightboxOpen.value = true }
const copyRekening = async () => { try { await navigator.clipboard.writeText(props.wedding.rekening); isShaking.value = true; setTimeout(() => isShaking.value = false, 500); showSuccess('Rekening disalin!') } catch { showError(null, 'Gagal') } }

const loadMessages = async () => { const { data } = await supabase.from('messages').select('*').eq('wedding_id', props.wedding.id).order('created_at', { ascending: false }).limit(30); messages.value = data || [] }
const loadGifts = async () => { const { data } = await supabase.from('gifts').select('*, dibeli_oleh(nama_tamu)').eq('wedding_id', props.wedding.id); gifts.value = (data || []).map(g => ({ ...g, name: g.nama_barang, price: g.harga_estimasi, link: g.link_produk, image: g.gambar_url, buyer_name: g.dibeli_oleh?.nama_tamu, resiInput: '', claiming: false })) }
const sendMessage = async () => { if (!newMessage.nama || !newMessage.pesan) return showError(null, 'Isi'); sendingMessage.value = true; try { await supabase.from('messages').insert([{ wedding_id: props.wedding.id, nama_pengirim: newMessage.nama, pesan: newMessage.pesan }]); newMessage.nama = newMessage.pesan = ''; await loadMessages(); showSuccess('Terkirim!') } catch { showError(null, 'Gagal') } finally { sendingMessage.value = false } }
const submitRsvp = async () => { if (!props.guestSlug) return showError(null, 'Link tidak valid'); submitting.value = true; try { await supabase.from('guests').update({ status_hadir: rsvpStatus.value, jumlah_orang: rsvpStatus.value ? jumlahOrang.value : 0 }).eq('unique_slug', props.guestSlug); showSuccess('Terima kasih!'); if (rsvpStatus.value) { showHearts.value = true; setTimeout(() => showHearts.value = false, 2500) } } catch { showError(null, 'Gagal') } finally { submitting.value = false } }
const claimGift = async (gift) => { if (!gift.resiInput) return showError(null, 'Masukkan resi'); gift.claiming = true; try { const { data: guest } = await supabase.from('guests').select('id').eq('unique_slug', props.guestSlug).single(); await supabase.from('gifts').update({ dibeli_oleh: guest.id, nomor_resi: gift.resiInput, status: true }).eq('id', gift.id); gift.status = true; gift.buyer_name = props.guestName; gift.resi = gift.resiInput; showSuccess('Diklaim!') } catch { showError(null, 'Gagal') } finally { gift.claiming = false } }

onMounted(async () => { await loadMessages(); await loadGifts(); updateMetaTags({ title: `${getTitle()} - ${getEventLabel()}`, description: `Undangan ${getEventLabel()} ${getTitle()}`, image: props.theme.gallery?.[0] || '/og-image.jpg' }); AOS.init({ once: false, offset: 50 }); updateCountdown(); countdownInterval = setInterval(updateCountdown, 1000) })
onUnmounted(() => { if (countdownInterval) clearInterval(countdownInterval) })
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Dancing+Script&family=Playfair+Display:wght@400;700&family=Poppins:wght@300;400;600&display=swap');
</style>

<style scoped>
.template-elegan { position: relative; min-height: 100vh; overflow-x: hidden; }
.parallax-bg { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-size: cover; background-position: center; z-index: -1; }
.floating-elements { position: fixed; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; z-index: 1; }
.floating-leaf, .floating-leaf-2 { position: absolute; opacity: 0.25; animation: float 8s ease-in-out infinite; animation-delay: var(--delay); left: var(--pos); }
.floating-leaf { font-size: 24px; top: calc(20% + sin(var(--pos)) * 30%); }
.floating-leaf-2 { font-size: 18px; top: calc(60% + sin(var(--pos)) * 20%); }
@keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-50px) rotate(15deg); } }
.cover-page { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.98); backdrop-filter: blur(25px); display: flex; align-items: center; justify-content: center; z-index: 100; }
.cover-content { text-align: center; max-width: 480px; padding: 40px 30px; background: white; border-radius: 80px 20px 80px 20px; box-shadow: 0 40px 80px rgba(0,0,0,0.08); border: 1px solid rgba(155,135,245,0.2); }
.cover-decoration { font-size: 50px; margin-bottom: 15px; }
.cover-subtitle { font-size: 14px; letter-spacing: 6px; opacity: 0.6; text-transform: uppercase; }
.cover-title { font-size: 48px; margin: 25px 0; font-family: 'Playfair Display', serif; line-height: 1.2; color: #2c3e50; }
.cover-date { font-size: 18px; margin-bottom: 35px; opacity: 0.8; }
.guest-welcome { margin: 35px 0 25px; font-size: 16px; line-height: 1.8; }
.guest-welcome strong { font-size: 26px; display: block; margin-top: 10px; font-family: 'Playfair Display', serif; color: #9b87f5; }
.btn-open { background: linear-gradient(135deg, #9b87f5, #7e69e0); color: white; border: none; padding: 18px 60px; border-radius: 60px; font-size: 18px; font-weight: 600; cursor: pointer; box-shadow: 0 20px 40px rgba(155,135,245,0.3); margin-top: 20px; }
.cover-music { position: fixed; bottom: 30px; right: 30px; background: white; border: none; font-size: 24px; padding: 18px; border-radius: 50%; box-shadow: 0 15px 30px rgba(0,0,0,0.1); cursor: pointer; z-index: 101; }
.main-content { min-height: 100vh; padding: 15px; display: flex; justify-content: center; padding-bottom: 60px; }
.content-card { max-width: 550px; width: 100%; background: rgba(255,255,255,0.92); backdrop-filter: blur(30px); border-radius: 50px 20px 50px 20px; padding: 35px 25px; box-shadow: 0 30px 60px rgba(0,0,0,0.1); margin: 15px 0; border: 1px solid rgba(255,255,255,0.9); }
.top-actions { text-align: right; margin-bottom: 15px; }
.icon-btn { background: rgba(255,255,255,0.8); border: none; font-size: 22px; padding: 12px; border-radius: 50%; cursor: pointer; }
.hero-section { position: relative; margin-bottom: 40px; border-radius: 30px; overflow: hidden; }
.hero-image img { width: 100%; height: 250px; object-fit: cover; }
.hero-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6)); }
.hero-content { position: absolute; bottom: 0; left: 0; right: 0; padding: 25px; color: white; text-align: center; }
.hero-content .bismillah { font-size: 40px; margin-bottom: 15px; opacity: 0.9; }
.hero-text { font-size: 14px; line-height: 1.8; text-shadow: 0 2px 10px rgba(0,0,0,0.3); }
.section-title { font-size: 22px; margin-bottom: 25px; color: #2c3e50; font-weight: 600; text-align: center; }
.section-title::after { content: ''; display: block; width: 50px; height: 3px; background: #9b87f5; margin: 15px auto 0; border-radius: 3px; }
.section-names { text-align: center; margin: 40px 0; }
.names-container { display: flex; flex-direction: column; align-items: center; }
.wedding-title { font-size: 42px; font-family: 'Playfair Display', serif; margin: 5px 0; color: #2c3e50; }
.parents-name { font-size: 15px; opacity: 0.8; margin-top: 20px; line-height: 1.8; }
.section-quote { margin: 40px 0; }
.quote-box { background: linear-gradient(135deg, rgba(155,135,245,0.03), rgba(155,135,245,0.08)); padding: 30px 25px; border-radius: 30px; border: 1px solid rgba(155,135,245,0.15); }
.arabic { font-size: 22px; line-height: 2.2; margin-bottom: 20px; font-family: 'Traditional Arabic', serif; text-align: right; }
.translation { font-size: 15px; line-height: 1.9; font-style: italic; }
.reference { margin-top: 20px; font-size: 14px; opacity: 0.7; }
.section-countdown { margin: 50px 0; text-align: center; }
.countdown-container { padding: 20px; background: linear-gradient(135deg, rgba(155,135,245,0.05), rgba(155,135,245,0.12)); border-radius: 30px; }
.countdown-grid { display: flex; justify-content: center; gap: 15px; }
.countdown-item { background: white; padding: 15px 10px; border-radius: 20px; min-width: 70px; box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
.countdown-value { display: block; font-size: 32px; font-weight: 700; color: #9b87f5; }
.countdown-label { display: block; font-size: 12px; opacity: 0.7; margin-top: 5px; }
.countdown-target-label { margin-top: 20px; font-size: 16px; font-weight: 600; color: #2c3e50; }
.section-guest { text-align: center; margin: 50px 0; }
.guest-intro { font-size: 14px; opacity: 0.7; }
.guest-name-display { font-size: 32px; font-weight: 700; margin: 15px 0; font-family: 'Playfair Display', serif; color: #9b87f5; }
.guest-message { font-size: 15px; line-height: 1.8; }
.section-event { margin: 40px 0; }
.event-card { background: white; padding: 25px; border-radius: 25px; margin-bottom: 20px; box-shadow: 0 15px 30px rgba(0,0,0,0.05); }
.event-header { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; }
.event-icon { font-size: 36px; }
.event-card h4 { font-size: 20px; color: #2c3e50; }
.event-details p { padding: 8px 0; display: flex; align-items: center; gap: 10px; }
.btn-map-small { background: #9b87f5; color: white; border: none; padding: 14px 20px; border-radius: 50px; margin-top: 15px; cursor: pointer; font-size: 15px; width: 100%; font-weight: 600; }
.section-gallery { margin: 50px 0; }
.gallery-swiper { border-radius: 30px; }
.gallery-slide img { width: 100%; height: 350px; object-fit: cover; cursor: pointer; border-radius: 25px; }
.section-wishes { margin: 50px 0; }
.wishes-box { background: linear-gradient(135deg, #fdfbf7, #f5f0eb); padding: 35px 25px; border-radius: 40px; text-align: center; }
.wishes-icon { font-size: 40px; margin-bottom: 20px; }
.wishes-text { font-size: 16px; line-height: 2; font-style: italic; }
.wishes-signature { margin-top: 25px; font-weight: 600; font-size: 18px; }
.section-gifts { margin: 50px 0; }
.gift-grid { display: grid; gap: 20px; }
.gift-card { background: white; border-radius: 25px; overflow: hidden; box-shadow: 0 15px 30px rgba(0,0,0,0.05); }
.gift-card-image img { width: 100%; height: 200px; object-fit: cover; }
.gift-card-content { padding: 20px; }
.gift-price { font-size: 20px; font-weight: 700; color: #9b87f5; margin-bottom: 15px; }
.btn-buy { display: inline-block; background: linear-gradient(135deg, #9b87f5, #7e69e0); color: white; padding: 14px 25px; border-radius: 50px; text-decoration: none; font-weight: 600; }
.resi-form { display: flex; gap: 10px; padding: 15px; background: #f9f9f9; }
.resi-form input { flex: 1; padding: 12px; border: 1px solid #ddd; border-radius: 10px; }
.resi-form button { background: #4caf50; color: white; border: none; padding: 12px 20px; border-radius: 10px; cursor: pointer; font-weight: 600; }
.gift-buyer-info { padding: 15px 20px; background: #e8f5e9; font-size: 14px; }
.section-gift { margin: 50px 0; }
.rekening-item { background: #f8f9fa; padding: 20px; border-radius: 20px; display: flex; align-items: center; gap: 15px; }
.rekening-item pre { flex: 1; margin: 0; font-family: monospace; white-space: pre-wrap; font-size: 14px; }
.rekening-item button { background: #9b87f5; color: white; border: none; padding: 14px 20px; border-radius: 40px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600; }
.rekening-item button.shaking { animation: shake 0.5s; }
@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
.section-rsvp { margin: 50px 0; text-align: center; }
.rsvp-buttons { display: flex; gap: 15px; margin: 25px 0; }
.rsvp-buttons button { flex: 1; padding: 18px; border: 2px solid #ddd; background: white; border-radius: 60px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 16px; }
.rsvp-buttons button.active { background: #9b87f5; color: white; border-color: #9b87f5; }
.rsvp-guest-count { display: flex; align-items: center; justify-content: center; gap: 20px; margin: 20px 0; }
.rsvp-guest-count input { width: 80px; padding: 12px; border: 1px solid #ddd; border-radius: 10px; text-align: center; font-size: 16px; }
.btn-rsvp { background: #9b87f5; color: white; border: none; padding: 18px; width: 100%; border-radius: 60px; font-weight: 600; font-size: 16px; cursor: pointer; }
.floating-hearts { position: relative; height: 50px; }
.heart { position: absolute; bottom: 0; left: 50%; font-size: 24px; animation: flyUp 2.5s ease-out forwards; animation-delay: calc(var(--i) * 0.1s); opacity: 0; }
@keyframes flyUp { 0% { transform: translate(-50%, 0) scale(1); opacity: 1; } 100% { transform: translate(calc(-50% + var(--i) * 30px - 70px), -150px) scale(0); opacity: 0; } }
.section-messages { margin: 50px 0; }
.message-list { max-height: 300px; overflow-y: auto; margin-bottom: 25px; }
.message-item { background: white; padding: 18px; border-radius: 20px; margin-bottom: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.03); }
.message-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
.message-form input, .message-form textarea { width: 100%; padding: 16px; border: 2px solid #eee; border-radius: 20px; margin-bottom: 15px; background: white; font-size: 15px; }
.message-form button { background: #9b87f5; color: white; border: none; padding: 16px; width: 100%; border-radius: 60px; font-weight: 600; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; }
.section-closing { text-align: center; margin-top: 60px; }
.closing-decoration { font-size: 30px; margin-bottom: 20px; }
.closing-text { font-size: 15px; line-height: 2; margin-bottom: 25px; }
.closing-signature { font-size: 18px; font-weight: 600; margin-bottom: 30px; }
.virtual-signature { font-family: 'Dancing Script', cursive; font-size: 28px; margin: 25px 0; }
.copyright { font-size: 13px; opacity: 0.6; margin-top: 40px; }
.lightbox { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.95); z-index: 1000; display: flex; align-items: center; justify-content: center; }
.lightbox img { max-width: 90%; max-height: 90%; object-fit: contain; border-radius: 20px; }
.close-lightbox { position: absolute; top: 30px; right: 30px; background: white; border: none; width: 50px; height: 50px; border-radius: 50%; font-size: 24px; cursor: pointer; }
@media (max-width: 480px) { .content-card { padding: 20px 15px; } .wedding-title { font-size: 28px; } .guest-name-display { font-size: 24px; } .countdown-item { min-width: 60px; padding: 10px 5px; } .countdown-value { font-size: 24px; } .cover-title { font-size: 36px; } }
</style>