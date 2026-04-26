<template>
  <div class="ig-story-template">
    <div class="story-card" ref="storyCard">
      <div class="story-bg" :style="{ backgroundImage: bgImage }">
        <div class="story-overlay"></div>
        <div class="story-content">
          <div class="story-icon">{{ getEventIcon() }}</div>
          <h1 class="story-title">{{ getTitleText() }}</h1>
          <p class="story-date">{{ formatDate(akadDate) }}</p>
          <p class="story-hashtag">#UndanganKu #WeddingInvitation</p>
          <div class="story-footer">undanganku.vercel.app</div>
        </div>
      </div>
    </div>
    
    <div class="story-actions">
      <button @click="downloadStory" class="btn-download">📥 Download Template</button>
      <button @click="shareToIG" class="btn-share">📸 Share ke Instagram</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import html2canvas from 'html2canvas'

const props = defineProps({
  weddingName: String,
  akadDate: String,
  eventType: String,
  imageUrl: String
})

const storyCard = ref(null)

const bgImage = computed(() => {
  return props.imageUrl ? `url(${props.imageUrl})` : 'linear-gradient(135deg, #667eea, #764ba2)'
})

const getEventIcon = () => {
  const icons = { wedding: '💍', sunatan: '✂️', aqiqah: '👶', syukuran: '🏠' }
  return icons[props.eventType] || '💍'
}

const getTitleText = () => {
  return props.weddingName || 'Wedding Invitation'
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('id-ID', { 
    day: 'numeric', month: 'short', year: 'numeric' 
  })
}

const downloadStory = async () => {
  if (!storyCard.value) return
  
  try {
    const canvas = await html2canvas(storyCard.value, {
      scale: 2,
      backgroundColor: null
    })
    
    const link = document.createElement('a')
    link.download = 'ig-story-template.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
    
  } catch (err) {
    console.error('Download error:', err)
    alert('❌ Gagal download template')
  }
}

const shareToIG = () => {
  // Instagram gak support direct share image, jadi kita download dulu
  alert('📸 Download template, lalu upload ke Instagram Story Anda!')
  downloadStory()
}
</script>

<style scoped>
.ig-story-template {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.story-card {
  width: 100%;
  aspect-ratio: 9/16;
  max-height: 600px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  position: relative;
}

.story-bg {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.story-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.3));
}

.story-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: white;
  padding: 40px 20px;
}

.story-icon { font-size: 60px; margin-bottom: 20px; }
.story-title { font-size: 28px; font-weight: 700; margin: 10px 0; text-shadow: 0 2px 10px rgba(0,0,0,0.3); }
.story-date { font-size: 16px; opacity: 0.9; margin: 10px 0; }
.story-hashtag { font-size: 14px; opacity: 0.8; margin-top: 20px; }
.story-footer { position: absolute; bottom: 20px; left: 0; right: 0; font-size: 12px; opacity: 0.7; }

.story-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-download, .btn-share {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
}

.btn-download { background: #9b87f5; color: white; }
.btn-share { background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); color: white; }
</style>