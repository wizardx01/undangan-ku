import bcrypt from 'bcryptjs'

/**
 * Hash password sebelum disimpan ke database
 * @param {string} password - Password plain text
 * @returns {Promise<string>} Hashed password
 */
export const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt)
  } catch (error) {
    console.error('Hash password error:', error)
    throw new Error('Gagal mengamankan password')
  }
}

/**
 * Compare password plain text dengan hash dari database
 * @param {string} password - Password plain text dari input user
 * @param {string} hash - Hashed password dari database
 * @returns {Promise<boolean>} True jika cocok
 */
export const comparePassword = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash)
  } catch (error) {
    console.error('Compare password error:', error)
    throw new Error('Gagal memverifikasi password')
  }
}

/**
 * Validasi kekuatan password
 * @param {string} password - Password yang mau dicek
 * @returns {object} { valid: boolean, message: string }
 */
export const validatePasswordStrength = (password) => {
  if (password.length < 6) {
    return { valid: false, message: 'Password minimal 6 karakter' }
  }
  
  if (!/[A-Z]/.test(password) && !/[0-9]/.test(password)) {
    return { valid: false, message: 'Password harus mengandung huruf besar atau angka' }
  }
  
  return { valid: true, message: 'Password kuat' }
}

/**
 * Generate session token sederhana
 * @param {object} user - User object
 * @returns {string} Token
 */
export const generateSessionToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 jam
  }
  return btoa(JSON.stringify(payload)) // Simple base64 encoding
}

/**
 * Verify session token
 * @param {string} token - Token dari localStorage
 * @returns {object|null} Decoded payload atau null
 */
export const verifySessionToken = (token) => {
  try {
    const payload = JSON.parse(atob(token))
    if (payload.exp < Date.now()) {
      return null // Expired
    }
    return payload
  } catch {
    return null
  }
}