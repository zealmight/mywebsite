;(function () {
  let typewriterTimeout = null
  let currentLang = 'tr'

  try {
    currentLang = localStorage.getItem('lang') || 'tr'
  } catch (e) {
    // localStorage kullanılamıyor (private browsing / depolama dolu)
  }

  /* Hero subtitle typewriter animasyonunu başlatır: yazma/silme döngüsüyle metinleri sırayla gösterir */
  function initTypewriter(lang) {
    if (typewriterTimeout) clearTimeout(typewriterTimeout)

    const el = document.querySelector('.typewrite')
    if (!el) return

    const toRotateAttr = el.getAttribute(`data-type-${lang}`)
    const period = parseInt(el.getAttribute('data-period'), 10) || 2000

    if (!toRotateAttr) return

    const toRotate = JSON.parse(toRotateAttr)
    let loopNum = 0
    let txt = ''
    let isDeleting = false

    function tick() {
      const i = loopNum % toRotate.length
      const fullTxt = toRotate[i]

      txt = isDeleting
        ? fullTxt.substring(0, txt.length - 1)
        : fullTxt.substring(0, txt.length + 1)

      el.innerHTML = '<span class="border-r-2 border-accent animate-cursor-blink">' + txt + '</span>'

      let delta = 200 - Math.random() * 100
      if (isDeleting) delta /= 2

      if (!isDeleting && txt === fullTxt) {
        delta = period
        isDeleting = true
      } else if (isDeleting && txt === '') {
        isDeleting = false
        loopNum++
        delta = 500
      }

      typewriterTimeout = setTimeout(tick, delta)
    }

    tick()
  }

  function savePreference(key, value) {
    try {
      localStorage.setItem(key, value)
    } catch (e) {
      // localStorage kullanılamıyor, sessizce geç
    }
  }

  function loadPreference(key, fallback) {
    try {
      return localStorage.getItem(key) || fallback
    } catch (e) {
      return fallback
    }
  }

  /* Kaydedilmiş temayı localStorage'dan okuyup uygular (dark/light) */
  function initTheme() {
    const savedTheme = loadPreference('theme', 'light')
    const isDark = savedTheme === 'dark'
    document.body.classList.toggle('dark', isDark)
    const btn = document.getElementById('theme-toggle')
    if (btn) btn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>'
  }

  const themeToggleBtn = document.getElementById('theme-toggle')
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('dark')
      savePreference('theme', isDark ? 'dark' : 'light')
      themeToggleBtn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>'
    })
  }

  /* Tüm sayfa metinlerini seçilen dile çevirir, typewriter'ı yeniden başlatır */
  function translatePage(lang) {
    document.querySelectorAll('[data-tr]').forEach(el => {
      const text = el.getAttribute(`data-${lang}`)
      if (text) el.textContent = text
    })

    document.querySelectorAll('[data-tr-html]').forEach(el => {
      const html = el.getAttribute(`data-${lang}-html`)
      if (html) el.innerHTML = html
    })

    const langToggleBtn = document.getElementById('lang-toggle')
    if (langToggleBtn) langToggleBtn.textContent = lang === 'tr' ? 'EN' : 'TR'

    initTypewriter(lang)
  }

  const langToggleBtn = document.getElementById('lang-toggle')
  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      currentLang = currentLang === 'tr' ? 'en' : 'tr'
      savePreference('lang', currentLang)
      translatePage(currentLang)
    })
  }

  const menuToggle = document.getElementById('menu-toggle')
  const navLinksEl = document.getElementById('nav-links')

  if (menuToggle && navLinksEl) {
    menuToggle.addEventListener('click', () => {
      navLinksEl.classList.toggle('left-0')
      const icon = menuToggle.querySelector('i')
      icon.className = navLinksEl.classList.contains('left-0') ? 'fas fa-times' : 'fas fa-bars'
    })
  }

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault()
      const targetId = this.getAttribute('href')
      if (targetId === '#') return
      const targetElement = document.querySelector(targetId)
      if (targetElement) targetElement.scrollIntoView({ behavior: 'smooth' })
      if (navLinksEl && navLinksEl.classList.contains('left-0')) {
        navLinksEl.classList.remove('left-0')
        if (menuToggle) menuToggle.querySelector('i').className = 'fas fa-bars'
      }
    })
  })

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0')
          revealObserver.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.12 }
  )
  document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el))

  const sections = document.querySelectorAll('section')
  const navAnchorLinks = document.querySelectorAll('#nav-links a')

  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id')
          navAnchorLinks.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === `#${id}`)
          })
        }
      })
    },
    { threshold: 0.3 }
  )
  sections.forEach(s => navObserver.observe(s))

  document.addEventListener('DOMContentLoaded', () => {
    initTheme()
    translatePage(currentLang)
  })
})()
