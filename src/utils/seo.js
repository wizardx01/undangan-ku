export const updateMetaTags = (options) => {
  const {
    title = 'UndanganKu - Buat Undangan Online Elegan',
    description = 'Buat undangan pernikahan, aqiqah, syukuran online dengan mudah.',
    image = '/og-image.jpg',
    url = window.location.href
  } = options
  
  document.title = title
  
  const metaTags = {
    'description': description,
    'og:title': title,
    'og:description': description,
    'og:image': image,
    'og:url': url,
    'og:type': 'website',
    'twitter:card': 'summary_large_image',
    'twitter:title': title,
    'twitter:description': description,
    'twitter:image': image
  }
  
  Object.entries(metaTags).forEach(([name, content]) => {
    let meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`)
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute(name.includes('og:') ? 'property' : 'name', name)
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', content)
  })
}