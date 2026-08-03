;(function () {
  'use strict'

  /* ═══════════════════════════════════════════════════
     STATE
     ═══════════════════════════════════════════════════ */

  let currentLang = 'tr'
  let bootComplete = false

  try {
    currentLang = localStorage.getItem('lang') || 'tr'
  } catch (_) {}

  function savePref(key, val) {
    try { localStorage.setItem(key, val) } catch (_) {}
  }

  function loadPref(key, fallback) {
    try { return localStorage.getItem(key) || fallback } catch (_) { return fallback }
  }

  /* ═══════════════════════════════════════════════════
     LIVE CLOCK (HUD)
     ═══════════════════════════════════════════════════ */

  const hudDate = document.getElementById('hud-date')
  const hudTime = document.getElementById('hud-time')

  const trMonths = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
  const enMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  function padZero(n) { return n < 10 ? '0' + n : '' + n }

  function updateClock() {
    const now = new Date()
    const y = now.getFullYear()
    const m = now.getMonth()
    const d = padZero(now.getDate())
    const h = padZero(now.getHours())
    const mi = padZero(now.getMinutes())
    const s = padZero(now.getSeconds())

    if (hudDate) {
      if (currentLang === 'tr') {
        hudDate.textContent = d + ' ' + trMonths[m] + ' ' + y
      } else {
        hudDate.textContent = y + ' ' + enMonths[m] + ' ' + d
      }
    }
    if (hudTime) {
      if (currentLang === 'tr') {
        hudTime.textContent = h + ':' + mi + ':' + s
      } else {
        var h12 = h % 12 || 12
        var ampm = h < 12 ? 'AM' : 'PM'
        hudTime.textContent = padZero(h12) + ':' + mi + ':' + s + ' ' + ampm
      }
    }
  }

  updateClock()
  setInterval(updateClock, 1000)

  /* ═══════════════════════════════════════════════════
     BOOT SEQUENCE
     ═══════════════════════════════════════════════════ */

  const bootEl = document.getElementById('boot-sequence')
  const contentEl = document.getElementById('term-content')
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  function runBoot() {
    if (!bootEl || !contentEl) return

    if (prefersReduced) {
      bootEl.classList.add('hidden')
      contentEl.classList.add('visible')
      bootComplete = true
      initTargetLockLabels()
      return
    }

    const lines = bootEl.querySelectorAll('.term-line')
    let i = 0

    function showNext() {
      if (i >= lines.length) {
        setTimeout(function () {
          bootEl.classList.add('hidden')
          contentEl.classList.add('visible')
          bootComplete = true
          initTargetLockLabels()
        }, 400)
        return
      }

      lines[i].style.opacity = '1'
      lines[i].style.transform = 'translateY(0)'
      i++

      if (lines[i - 1].classList.contains('boot-output')) {
        setTimeout(showNext, 300)
      } else {
        setTimeout(showNext, 600)
      }
    }

    // Set initial state for boot lines
    lines.forEach(function (line) {
      line.style.opacity = '0'
      line.style.transform = 'translateY(4px)'
      line.style.transition = 'opacity 0.3s ease, transform 0.3s ease'
    })

    setTimeout(showNext, 500)
  }

  /* ═══════════════════════════════════════════════════
     LANGUAGE SWITCHING
     ═══════════════════════════════════════════════════ */

  function translatePage(lang) {
    document.querySelectorAll('[data-tr]').forEach(function (el) {
      var text = el.getAttribute('data-' + lang)
      if (text) el.textContent = text
    })

    document.querySelectorAll('[data-tr-html]').forEach(function (el) {
      var html = el.getAttribute('data-' + lang + '-html')
      if (html) el.innerHTML = html
    })

    var langLabel = lang === 'tr' ? 'EN' : 'TR'
    var langBtn = document.getElementById('lang-toggle')
    var mobileLangBtn = document.getElementById('lang-toggle-mobile')
    if (langBtn) langBtn.textContent = langLabel
    if (mobileLangBtn) mobileLangBtn.textContent = langLabel
  }

  var langBtn = document.getElementById('lang-toggle')
  if (langBtn) {
    langBtn.addEventListener('click', function () {
      currentLang = currentLang === 'tr' ? 'en' : 'tr'
      savePref('lang', currentLang)
      translatePage(currentLang)
    })
  }

  /* ═══════════════════════════════════════════════════
     TARGET-LOCK LABELS
     ═══════════════════════════════════════════════════ */

  function initTargetLockLabels() {
    document.querySelectorAll('.targetable').forEach(function (el) {
      if (el.querySelector('.target-lock-label')) return

      var label = document.createElement('span')
      label.className = 'target-lock-label'
      label.textContent = 'TARGET_LOCKED'
      label.setAttribute('aria-hidden', 'true')
      el.appendChild(label)
    })
  }

  /* ═══════════════════════════════════════════════════
     GLITCH EFFECT (random, every 2-5 minutes)
     ═══════════════════════════════════════════════════ */

  var glitchOverlay = document.getElementById('glitch-overlay')

  function triggerGlitch() {
    if (!glitchOverlay || prefersReduced) return
    glitchOverlay.classList.add('active')
    setTimeout(function () {
      glitchOverlay.classList.remove('active')
    }, 200)
  }

  function scheduleGlitch() {
    var delay = 120000 + Math.random() * 180000 // 2-5 minutes
    setTimeout(function () {
      triggerGlitch()
      scheduleGlitch()
    }, delay)
  }

  scheduleGlitch()

  /* ═══════════════════════════════════════════════════
     SMOOTH SCROLL + NAV ACTIVE STATE
     ═══════════════════════════════════════════════════ */

  var mobileMenu = document.getElementById('mobile-menu')
  var hamburgerBtn = document.getElementById('hamburger-toggle')
  var navClickLock = null

  function closeMobileMenu() {
    if (mobileMenu) mobileMenu.classList.remove('open')
    if (hamburgerBtn) {
      hamburgerBtn.classList.remove('active')
      hamburgerBtn.setAttribute('aria-expanded', 'false')
    }
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      e.preventDefault()
      var targetId = this.getAttribute('href')
      if (targetId === '#') return
      var target = document.querySelector(targetId)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' })
        if (this.matches('.camera-nav-link, .mobile-nav-link')) {
          var clickedId = target.id
          navClickLock = clickedId
          updateActiveNav(clickedId)
          setTimeout(function () {
            if (navClickLock === clickedId) navClickLock = null
          }, 1800)
        }
      }
      closeMobileMenu()
    })
  })

  // Hamburger toggle
  if (hamburgerBtn && mobileMenu) {
    hamburgerBtn.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.toggle('open')
      hamburgerBtn.classList.toggle('active', isOpen)
      hamburgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false')
    })
  }

  // Mobile lang button syncs with same logic as desktop
  var mobileLangBtn = document.getElementById('lang-toggle-mobile')
  if (mobileLangBtn) {
    mobileLangBtn.addEventListener('click', function () {
      currentLang = currentLang === 'tr' ? 'en' : 'tr'
      savePref('lang', currentLang)
      translatePage(currentLang)
    })
  }

  // Desktop + mobile nav links active state
  var allNavLinks = document.querySelectorAll('.camera-nav-link, .mobile-nav-link')
  var navSections = Array.from(allNavLinks)
    .map(function (link) { return document.querySelector(link.getAttribute('href')) })
    .filter(Boolean)

  function updateActiveNav(id) {
    allNavLinks.forEach(function (a) {
      var isActive = a.getAttribute('href') === '#' + id
      a.classList.toggle('active', isActive)
      if (isActive) a.setAttribute('aria-current', 'location')
      else a.removeAttribute('aria-current')
    })
  }

  function syncActiveNav() {
    if (navClickLock) {
      updateActiveNav(navClickLock)
      return
    }

    var activeSection = navSections[0]
    var scrollMark = window.scrollY + window.innerHeight * 0.45

    navSections.forEach(function (section) {
      if (section.offsetTop <= scrollMark) activeSection = section
    })

    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1) {
      activeSection = navSections[navSections.length - 1]
    }

    if (activeSection) updateActiveNav(activeSection.id)
  }

  window.addEventListener('scroll', syncActiveNav, { passive: true })
  window.addEventListener('hashchange', syncActiveNav)
  syncActiveNav()

  /* ═══════════════════════════════════════════════════
     INIT
     ═══════════════════════════════════════════════════ */

  document.addEventListener('DOMContentLoaded', function () {
    translatePage(currentLang)
    runBoot()
  })
})()
