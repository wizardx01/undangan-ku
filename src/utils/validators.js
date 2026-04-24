export const validators = {
  required: (value, fieldName) => {
    return value && value.trim() ? true : `${fieldName} wajib diisi`
  },
  
  email: (value) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(value) ? true : 'Email tidak valid'
  },
  
  phone: (value) => {
    const regex = /^[0-9+\-\s]{10,15}$/
    return regex.test(value) ? true : 'Nomor telepon tidak valid'
  },
  
  minLength: (value, min, fieldName) => {
    return value.length >= min ? true : `${fieldName} minimal ${min} karakter`
  },
  
  url: (value) => {
    if (!value) return true
    try {
      new URL(value)
      return true
    } catch {
      return 'URL tidak valid'
    }
  }
}

export const validateForm = (form, rules) => {
  const errors = {}
  
  for (const field in rules) {
    const value = form[field]
    const fieldRules = rules[field]
    
    for (const rule of fieldRules) {
      if (typeof rule === 'string') {
        const result = validators[rule](value, field)
        if (result !== true) {
          errors[field] = result
          break
        }
      } else if (typeof rule === 'object') {
        const result = validators[rule.name](value, ...rule.params, field)
        if (result !== true) {
          errors[field] = result
          break
        }
      }
    }
  }
  
  return errors
}