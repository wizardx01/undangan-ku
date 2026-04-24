/**
 * Handle error dan return pesan yang user-friendly
 * @param {any} error - Error object dari try-catch
 * @param {string} customMessage - Pesan kustom kalau error tidak dikenali
 * @returns {string} Pesan error yang siap ditampilkan
 */
export const handleError = (error, customMessage = 'Terjadi kesalahan') => {
  console.error('Error details:', error)
  
  // Kalau error null atau undefined
  if (!error) {
    return customMessage
  }
  
  // Kalau error adalah string
  if (typeof error === 'string') {
    return error
  }
  
  // Kalau error adalah instance Error
  if (error instanceof Error) {
    return error.message
  }
  
  // Parse Supabase error codes
  if (error.code) {
    switch (error.code) {
      case '23505':
        return 'Data sudah ada (duplikat)'
      case '23503':
        return 'Data tidak valid (foreign key)'
      case '42P01':
        return 'Tabel tidak ditemukan'
      case '42501':
        return 'Tidak ada izin akses (RLS)'
      case 'PGRST116':
        return 'Data tidak ditemukan'
      case '42703':
        return 'Kolom database tidak ditemukan'
      case '22001':
        return 'Data terlalu panjang'
      default:
        return error.message || customMessage
    }
  }
  
  // Network / Fetch error
  if (error.message) {
    const msg = error.message.toLowerCase()
    if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed to fetch')) {
      return 'Gagal terhubung ke server. Cek koneksi internet Anda.'
    }
    if (msg.includes('storage') || msg.includes('bucket')) {
      return 'Gagal upload file. Coba lagi nanti.'
    }
    if (msg.includes('jwt') || msg.includes('token')) {
      return 'Sesi Anda telah berakhir. Silakan login kembali.'
    }
    return error.message
  }
  
  // Fallback
  return customMessage
}

/**
 * Tampilkan error ke user via alert
 * @param {any} error - Error object
 * @param {string} customMessage - Pesan kustom
 */
export const showError = (error, customMessage) => {
  const message = handleError(error, customMessage)
  alert('❌ ' + message)
}

/**
 * Tampilkan pesan sukses ke user via alert
 * @param {string} message - Pesan sukses
 */
export const showSuccess = (message) => {
  alert('✅ ' + message)
}

/**
 * Tampilkan pesan info ke user via alert
 * @param {string} message - Pesan info
 */
export const showInfo = (message) => {
  alert('ℹ️ ' + message)
}

/**
 * Tampilkan pesan warning ke user via alert
 * @param {string} message - Pesan warning
 */
export const showWarning = (message) => {
  alert('⚠️ ' + message)
}