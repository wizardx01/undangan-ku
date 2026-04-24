import { createClient } from '@supabase/supabase-js'

// GANTI DENGAN URL DAN KEY DARI SUPABASE LO
const supabaseUrl = 'https://uubobyawvebrewvmnebd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1Ym9ieWF3dmVicmV3dm1uZWJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NzUzMTIsImV4cCI6MjA5MjQ1MTMxMn0.RihAQAWyIta4VmFgrZUBTWkCH0_4Oqj1J3eBIitVVto'
// GANTI FUNGSI UPLOAD BACKGROUND JADI INI:
const uploadBackground = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  
  uploadingBg.value = true
  
  try {
    // Validasi tipe file
    if (!file.type.startsWith('image/')) {
      throw new Error('File harus berupa gambar')
    }
    
    // Validasi ukuran (max 5MB sebelum kompresi)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Ukuran file maksimal 5MB')
    }
    
    console.log('Mulai kompresi gambar...', file.name, file.size)
    
    // Kompres gambar
    const options = { 
      maxSizeMB: 0.5, 
      maxWidthOrHeight: 1200,
      useWebWorker: true 
    }
    const compressed = await imageCompression(file, options)
    
    console.log('Selesai kompresi:', compressed.size)
    
    // Upload ke Supabase Storage
    const fileName = `bg-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
    
    console.log('Upload ke Supabase:', fileName)
    
    const { data, error } = await supabase.storage
      .from('weddings')
      .upload(fileName, compressed, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) {
      console.error('Error upload:', error)
      throw error
    }
    
    console.log('Upload sukses:', data)
    
    // Dapatkan URL publik
    const { data: { publicUrl } } = supabase.storage
      .from('weddings')
      .getPublicUrl(fileName)
    
    console.log('Public URL:', publicUrl)
    
    form.theme.background_value = publicUrl
    alert('Background berhasil diupload!')
    
  } catch (error) {
    console.error('Upload error detail:', error)
    alert('Gagal upload background: ' + error.message)
  } finally {
    uploadingBg.value = false
  }
}

// GANTI FUNGSI UPLOAD GALLERY JADI INI:
const uploadGallery = async (e) => {
  const files = Array.from(e.target.files)
  if (!files.length) return
  
  uploadingGallery.value = true
  
  try {
    for (const file of files) {
      // Validasi tipe file
      if (!file.type.startsWith('image/')) {
        console.warn('Skip non-image file:', file.name)
        continue
      }
      
      console.log('Upload gallery:', file.name, file.size)
      
      // Kompres gambar
      const options = { 
        maxSizeMB: 0.3, 
        maxWidthOrHeight: 800,
        useWebWorker: true 
      }
      const compressed = await imageCompression(file, options)
      
      // Upload
      const fileName = `gallery-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
      
      const { data, error } = await supabase.storage
        .from('weddings')
        .upload(fileName, compressed, {
          cacheControl: '3600',
          upsert: false
        })
      
      if (error) {
        console.error('Error upload gallery:', error)
        throw error
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('weddings')
        .getPublicUrl(fileName)
      
      console.log('Gallery URL:', publicUrl)
      form.gallery.push(publicUrl)
    }
    
    alert(`${files.length} gambar berhasil diupload!`)
    
  } catch (error) {
    console.error('Gallery upload error:', error)
    alert('Gagal upload gambar: ' + error.message)
  } finally {
    uploadingGallery.value = false
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)