(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const toast = $('#toast');
  let toastTimer;
  let audioContext = null;
  let soundEnabled = false;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  // Counts down to the next November 23 in the visitor's local time.
  function nextBirthday(from = new Date()) {
    let target = new Date(from.getFullYear(), 10, 23, 0, 0, 0, 0);
    if (target.getTime() <= from.getTime()) {
      target = new Date(from.getFullYear() + 1, 10, 23, 0, 0, 0, 0);
    }
    return target;
  }

  let targetDate = nextBirthday();
  function updateCountdown() {
    const now = new Date();
    if (now.getTime() >= targetDate.getTime()) targetDate = nextBirthday(now);
    const remaining = Math.max(0, targetDate.getTime() - now.getTime());
    const totalSeconds = Math.floor(remaining / 1000);
    const values = {
      '#days': Math.floor(totalSeconds / 86400),
      '#hours': Math.floor((totalSeconds % 86400) / 3600),
      '#minutes': Math.floor((totalSeconds % 3600) / 60),
      '#seconds': totalSeconds % 60
    };
    Object.entries(values).forEach(([selector, value]) => {
      $(selector).textContent = String(value).padStart(2, '0');
    });
    $('#countdownMessage').textContent = `الموعد القادم: 23 نوفمبر ${targetDate.getFullYear()} — خليك قريب!`;
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);
  $('#year').textContent = new Date().getFullYear();

  // Smooth reveal as sections enter the viewport.
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // Lightweight animated star field.
  const canvas = $('#stars');
  const ctx = canvas.getContext('2d');
  let stars = [];
  let width = 0, height = 0, dpr = 1;
  function resizeStars() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth; height = window.innerHeight;
    canvas.width = width * dpr; canvas.height = height * dpr;
    canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(100, Math.floor(width * height / 10500));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width, y: Math.random() * height,
      r: Math.random() * 1.4 + .3, a: Math.random() * .55 + .15,
      speed: Math.random() * .18 + .035, phase: Math.random() * 6
    }));
  }
  function drawStars(time = 0) {
    ctx.clearRect(0, 0, width, height);
    stars.forEach(s => {
      const alpha = s.a * (.65 + Math.sin(time * .001 * s.speed + s.phase) * .35);
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(210,180,255,${alpha})`; ctx.fill();
    });
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) requestAnimationFrame(drawStars);
  }
  resizeStars();
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) requestAnimationFrame(drawStars);
  window.addEventListener('resize', resizeStars, { passive: true });

  function celebrate(amount = 90) {
    const layer = $('#confettiLayer');
    const colors = ['#c8a1ff', '#8e4cff', '#f2d7ff', '#ffffff', '#6d2bd9', '#e7a8ff'];
    for (let i = 0; i < amount; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.setProperty('--c', colors[Math.floor(Math.random() * colors.length)]);
      piece.style.setProperty('--dur', `${2.5 + Math.random() * 3.2}s`);
      piece.style.setProperty('--rot', `${Math.random() * 360}deg`);
      piece.style.setProperty('--drift', `${Math.random() * 240 - 120}px`);
      piece.style.animationDelay = `${Math.random() * .7}s`;
      layer.appendChild(piece);
      setTimeout(() => piece.remove(), 6500);
    }
  }

  function tinyChime() {
    if (!soundEnabled) return;
    try {
      audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = 'sine'; osc.frequency.value = 660;
      gain.gain.setValueAtTime(.0001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(.08, audioContext.currentTime + .02);
      gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + .35);
      osc.connect(gain); gain.connect(audioContext.destination);
      osc.start(); osc.stop(audioContext.currentTime + .36);
    } catch (_) { /* Audio is optional; the page still works without it. */ }
  }
  $('#soundToggle').addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    $('#soundToggle').textContent = soundEnabled ? '♫' : '♪';
    showToast(soundEnabled ? 'المؤثر الصوتي اتفعّل — اضغط على المفاجأة!' : 'تم إيقاف المؤثرات الصوتية');
    if (soundEnabled) tinyChime();
  });

  const giftScene = $('#giftScene');
  const wishReveal = $('#wishReveal');
  function openGift() {
    const isOpening = wishReveal.hidden;
    giftScene.classList.toggle('opened', isOpening);
    wishReveal.hidden = !isOpening;
    $('#openGift').textContent = isOpening ? 'المفاجأة اتفتحت ✦' : 'افتح المفاجأة ✦';
    if (isOpening) { celebrate(110); tinyChime(); }
    if (isOpening) setTimeout(() => wishReveal.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120);
  }
  giftScene.addEventListener('click', openGift);
  $('#openGift').addEventListener('click', openGift);
  $('#closeWish').addEventListener('click', () => {
    wishReveal.hidden = true; giftScene.classList.remove('opened');
    $('#openGift').innerHTML = 'افتح المفاجأة <span>✦</span>';
  });

  async function shareSite() {
    const shareData = {
      title: 'Karem Jamal — Birthday 23.11',
      text: '🎂 تعالوا نحتفل بعيد ميلاد Karem Jamal يوم 23 نوفمبر! افتحوا المفاجأة وسيبوا تهنئة 💜',
      url: window.location.href
    };
    if (navigator.share && window.isSecureContext) {
      try { await navigator.share(shareData); return; }
      catch (error) { if (error && error.name === 'AbortError') return; }
    }
    try {
      await navigator.clipboard.writeText(shareData.url);
      showToast('تم نسخ رابط الموقع! ابعته لأصحابك 💜');
    } catch (_) {
      const helper = document.createElement('textarea');
      helper.value = shareData.url; helper.setAttribute('readonly', '');
      helper.style.position = 'fixed'; helper.style.opacity = '0';
      document.body.appendChild(helper); helper.select();
      const copied = document.execCommand('copy'); helper.remove();
      showToast(copied ? 'تم نسخ رابط الموقع!' : 'انسخ رابط الصفحة من شريط العنوان وشاركه مع أصحابك.');
    }
  }
  $('#shareTop').addEventListener('click', shareSite);
  $('#shareBottom').addEventListener('click', shareSite);

  // Local-only guestbook: messages are stored in this browser, not sent to a server.
  const STORAGE_KEY = 'karemBirthdayWishesV1';
  const form = $('#wishForm');
  const nameInput = $('#friendName');
  const messageInput = $('#friendMessage');
  const charCount = $('#charCount');
  messageInput.addEventListener('input', () => charCount.textContent = `${messageInput.value.length} / 240`);

  function safeLoadWishes() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data.filter(item =>
        item && typeof item.name === 'string' && typeof item.message === 'string'
      ).slice(0, 50) : [];
    } catch (_) { return []; }
  }
  let wishes = safeLoadWishes();
  function renderWishes() {
    const list = $('#wishList');
    $('#wishCount').textContent = `${wishes.length} رسالة`;
    list.replaceChildren();
    if (!wishes.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      const icon = document.createElement('span'); icon.textContent = '✧';
      const p = document.createElement('p'); p.append('لسه مفيش رسائل…', document.createElement('br'), 'خليك أول واحد يكتب تهنئة!');
      empty.append(icon, p); list.append(empty); return;
    }
    wishes.forEach(wish => {
      const article = document.createElement('article'); article.className = 'wish-item';
      const head = document.createElement('div'); head.className = 'wish-item-head';
      const avatar = document.createElement('span'); avatar.className = 'avatar'; avatar.textContent = [...wish.name.trim()][0] || '✦';
      const strong = document.createElement('strong'); strong.textContent = wish.name;
      const time = document.createElement('time'); time.textContent = wish.date || 'تهنئة';
      const p = document.createElement('p'); p.textContent = wish.message;
      head.append(avatar, strong, time); article.append(head, p); list.append(article);
    });
  }
  renderWishes();
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const name = nameInput.value.trim();
    const message = messageInput.value.trim();
    if (name.length < 2 || message.length < 2) {
      $('#formStatus').textContent = 'اكتب اسمك ورسالة قصيرة الأول 💜'; return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'جاري إرسال التهنئة...';
    $('#formStatus').textContent = 'بنرسل رسالتك لكريم، ثانية واحدة 💜';

    try {
      const response = await fetch('/api/send-wish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.slice(0, 40), message: message.slice(0, 240) })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'تعذر إرسال الرسالة. حاول مرة تانية.');
      }

      wishes.unshift({
        name: name.slice(0, 40),
        message: message.slice(0, 240),
        date: new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })
      });
      wishes = wishes.slice(0, 50);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes)); } catch (_) {}
      renderWishes();
      form.reset();
      charCount.textContent = '0 / 240';
      $('#formStatus').textContent = 'وصلت التهنئة لكريم على تيليجرام بنجاح 💜';
      showToast('تم إرسال التهنئة لكريم! 💜');
      celebrate(24);
      tinyChime();
    } catch (error) {
      $('#formStatus').textContent = error.message || 'فشل الإرسال. تأكد من إعداد متغيرات تيليجرام على Vercel.';
      showToast('التهنئة ما اتبعتتش. جرّب تاني.');
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = 'أضف التهنئة <span>↗</span>';
    }
  });
})();
