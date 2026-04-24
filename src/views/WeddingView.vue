<template>
  <div>
    <!-- LOADING -->
    <div v-if="loading" class="loading-screen">
      <div class="spinner"></div>
      <p>Memuat Undangan...</p>
    </div>
    
    <!-- ERROR -->
    <div v-else-if="error" class="error-screen">
      <h2>😔 Undangan Tidak Ditemukan</h2>
      <p>{{ error }}</p>
      <button @click="$router.push('/')" class="btn-home">🏠 Kembali ke Beranda</button>
    </div>
    
    <!-- TEMPLATE DINAMIS -->
    <component 
      v-else 
      :is="currentTemplate" 
      :wedding="wedding"
      :theme="theme"
      :guestName="guestName"
      :guestSlug="guestSlug"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../lib/supabase'
import TemplateElegan from './templates/TemplateElegan.vue'
import TemplateMinimalis from './templates/TemplateMinimalis.vue'
import TemplateFloral from './templates/TemplateFloral.vue'

const route = useRoute()
const slug = route.params.slug
const guestSlug = route.query.to

const loading = ref(true)
const error = ref(null)
const wedding = ref({})
const theme = ref({})
const guestName = ref('')

const templateMap = {
  elegan: TemplateElegan,
  minimalis: TemplateMinimalis,
  floral: TemplateFloral
}

const currentTemplate = computed(() => {
  const template = wedding.value.template || 'elegan'
  return templateMap[template] || TemplateElegan
})

const loadWedding = async () => {
  try {
    const { data, error: queryError } = await supabase
      .from('weddings')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .gte('expired_at', new Date().toISOString())
      .single()
    
    if (queryError) throw queryError
    if (!data) throw new Error('Undangan tidak ditemukan atau sudah kadaluarsa')
    
    wedding.value = data
    theme.value = data.theme_settings || {}
    
    if (guestSlug) {
      const { data: guestData } = await supabase
        .from('guests')
        .select('nama_tamu')
        .eq('unique_slug', guestSlug)
        .single()
      if (guestData) guestName.value = guestData.nama_tamu
    }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(() => loadWedding())
</script>

<style scoped>
.loading-screen, .error-screen {
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
.btn-home {
  margin-top: 20px;
  padding: 12px 30px;
  background: #9b87f5;
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
}
</style>