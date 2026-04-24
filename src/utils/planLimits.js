// Konfigurasi limit berdasarkan plan
export const PLAN_LIMITS = {
  admin: {
    name: 'Admin',
    maxWeddings: Infinity,
    maxGuests: Infinity,
    maxGifts: Infinity,
    customDomain: true,
    prioritySupport: true,
    whiteLabel: true
  },
  basic: {
    name: 'Basic',
    maxWeddings: 1,
    maxGuests: 20,
    maxGifts: 3,
    customDomain: false,
    prioritySupport: false,
    whiteLabel: false
  },
  premium: {
    name: 'Premium',
    maxWeddings: Infinity,
    maxGuests: Infinity,
    maxGifts: Infinity,
    customDomain: true,
    prioritySupport: true,
    whiteLabel: false
  },
  enterprise: {
    name: 'Enterprise',
    maxWeddings: Infinity,
    maxGuests: Infinity,
    maxGifts: Infinity,
    customDomain: true,
    prioritySupport: true,
    whiteLabel: true
  }
}

/**
 * Ambil data user dari session
 */
export const getCurrentUser = () => {
  const session = JSON.parse(localStorage.getItem('session') || 'null')
  return session?.user || null
}

/**
 * Ambil plan user saat ini
 */
export const getUserPlan = () => {
  const user = getCurrentUser()
  if (!user) return 'basic'
  return user.plan || 'basic'
}

/**
 * Ambil limit user
 */
export const getPlanLimits = () => {
  const plan = getUserPlan()
  return PLAN_LIMITS[plan] || PLAN_LIMITS.basic
}

/**
 * Cek apakah user bisa bikin undangan baru
 */
export const canCreateWedding = async (supabase) => {
  const limits = getPlanLimits()
  
  // Admin unlimited
  if (limits.maxWeddings === Infinity) return { allowed: true }
  
  const user = getCurrentUser()
  
  // Hitung jumlah undangan user
  const { count, error } = await supabase
    .from('weddings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
  
  if (error) return { allowed: true } // Kalau error, biarin aja
  
  const currentCount = count || 0
  
  if (currentCount >= limits.maxWeddings) {
    return {
      allowed: false,
      message: `❌ Limit undangan tercapai (${currentCount}/${limits.maxWeddings})!\n\nUpgrade ke Premium untuk undangan unlimited seharga Rp 199.000.`
    }
  }
  
  return { 
    allowed: true,
    remaining: limits.maxWeddings - currentCount - 1
  }
}

/**
 * Cek apakah user bisa tambah tamu
 */
export const canAddGuest = (currentGuestCount) => {
  const limits = getPlanLimits()
  
  if (limits.maxGuests === Infinity) return { allowed: true }
  
  if (currentGuestCount >= limits.maxGuests) {
    return {
      allowed: false,
      message: `❌ Limit tamu tercapai (${currentGuestCount}/${limits.maxGuests})!\n\nUpgrade ke Premium untuk tamu unlimited seharga Rp 199.000.`
    }
  }
  
  return { 
    allowed: true,
    remaining: limits.maxGuests - currentGuestCount - 1
  }
}

/**
 * Cek apakah user bisa tambah kado
 */
export const canAddGift = (currentGiftCount) => {
  const limits = getPlanLimits()
  
  if (limits.maxGifts === Infinity) return { allowed: true }
  
  if (currentGiftCount >= limits.maxGifts) {
    return {
      allowed: false,
      message: `❌ Limit kado tercapai (${currentGiftCount}/${limits.maxGifts})!\n\nUpgrade ke Premium untuk kado unlimited seharga Rp 299.000.`
    }
  }
  
  return { 
    allowed: true,
    remaining: limits.maxGifts - currentGiftCount - 1
  }
}