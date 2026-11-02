const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
const menuClose = document.querySelector('.menu-close');
const typographyOption2 = document.getElementById('typography-option-2');
const fontButtons = document.querySelectorAll('[data-font-option]');

function setFontOption(option) {
  const selected = option === '2' ? '2' : '1';
  document.documentElement.dataset.font = selected;
  typographyOption2.media =selected === '2' ? 'all' : 'not all';
  fontButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.fontOption === selected)));
  try { localStorage.setItem('cocathedrale-font-option', selected); } catch (e) { }
}

let savedFontOption = '1';
try { savedFontOption = localStorage.getItem('cocathedrale-font-option') || '1'; } catch (e) { }
setFontOption(savedFontOption);
fontButtons.forEach(button => button.addEventListener('click', () => setFontOption(button.dataset.fontOption)));

function syncHeader() {
  header.classList.toggle('is-scrolled', window.scrollY > 38);
}
syncHeader();
window.addEventListener('scroll', syncHeader, { passive: true });

function setMenuOpen(open, { returnFocus = false } = {}) {
  mobileNav.hidden = !open;
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  document.body.classList.toggle('menu-open', open);
  if (open) menuClose.focus();
  else if (returnFocus) menuToggle.focus();
}

menuToggle.addEventListener('click', () => setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true'));
menuClose.addEventListener('click', () => setMenuOpen(false, { returnFocus: true }));
mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenuOpen(false)));

document.addEventListener('keydown', event => {
  if (mobileNav.hidden) return;
  if (event.key === 'Escape') {
    setMenuOpen(false, { returnFocus: true });
    return;
  }
  if (event.key !== 'Tab') return;
  const focusable = [...mobileNav.querySelectorAll('button,a[href]')];
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 1050 && !mobileNav.hidden) setMenuOpen(false);
});

const calendarMonth = document.getElementById('calendar-month');
const calendarDays = document.getElementById('calendar-days');
let shownMonth = new Date(2026, 10, 1);
const eventDates = new Set(['2026-11-08', '2026-11-15', '2026-11-22', '2026-11-29']);

function dateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function renderCalendar() {
  const year = shownMonth.getFullYear();
  const month = shownMonth.getMonth();
  calendarMonth.textContent = new Intl.DateTimeFormat('fr-CA', { month: 'long', year: 'numeric' })
    .format(shownMonth)
    .replace(/^./, c => c.toUpperCase());

  calendarDays.replaceChildren();
  for (let i = 0; i < new Date(year, month, 1).getDay(); i++) {
    calendarDays.appendChild(document.createElement('span'));
  }

  const days = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= days; d++) {
    const date = dateKey(year, month, d);
    const hasEvent = eventDates.has(date);
    const item = document.createElement(hasEvent ? 'button' : 'span');
    item.textContent = String(d);

    if (hasEvent) {
      item.type = 'button';
      item.className = 'has-event';
      item.setAttribute('aria-label', `Voir les activités du ${d} ${calendarMonth.textContent}`);
      item.addEventListener('click', () => document.getElementById('activites').scrollIntoView({ behavior: 'smooth' }));
    }

    if (year === 2026 && month === 10 && d === 1) item.classList.add('is-today');
    calendarDays.appendChild(item);
  }
}

document.getElementById('prev-month').addEventListener('click', () => {
  shownMonth = new Date(shownMonth.getFullYear(), shownMonth.getMonth() - 1, 1);
  renderCalendar();
});

document.getElementById('next-month').addEventListener('click', () => {
  shownMonth = new Date(shownMonth.getFullYear(), shownMonth.getMonth() + 1, 1);
  renderCalendar();
});

renderCalendar();

const moreEvents = document.getElementById('more-events');
const allEvents = document.getElementById('all-events');

allEvents.addEventListener('click', () => {
  moreEvents.hidden = !moreEvents.hidden;
  allEvents.setAttribute('aria-expanded', String(!moreEvents.hidden));
  allEvents.firstChild.textContent = moreEvents.hidden ? 'Voir toutes les activités ' : 'Réduire la liste ';
});

const events = {
  concert: {
    category: 'Musique & patrimoine · 8 novembre',
    title: 'Concert à la cocathédrale',
    body: 'Une soirée de musique dans un lieu où l\'architecture et l\'acoustique se rencontrent. Communiquez avec la paroisse pour les détails.'
  },
  fromages: {
    category: 'Campagne de financement · 15 novembre',
    title: 'Vente de fromages',
    body: 'Une occasion de soutenir les activités paroissiales tout en se retrouvant autour d\'un projet gourmand. Les modalités seront précisées par la paroisse.'
  },
  cafe: {
    category: 'Vie communautaire · 22 novembre',
    title: 'Café-rencontre du dimanche',
    body: 'Après la célébration, prenez le temps de jaser, de rencontrer les gens du quartier et de partager un moment tout simple.'
  },
  benevoles: {
    category: 'Communauté · 29 novembre',
    title: 'Rencontre des bénévoles',
    body: 'Venez découvrir les possibilités de participation à la vie de la cocathédrale et rencontrer les personnes qui la font vivre.'
  },
  don: {
    category: 'Soutenir la paroisse',
    title: 'Faire un don',
    body: 'Merci de votre intérêt à soutenir la paroisse. Communiquez avec le bureau paroissial pour connaître les façons de contribuer.'
  }
};

const dialog = document.getElementById('info-dialog');

function openInfo(info) {
  document.getElementById('dialog-category').textContent = info.category;
  document.getElementById('dialog-title').textContent = info.title;
  document.getElementById('dialog-body').textContent = info.body;
  dialog.showModal();
}

document.querySelectorAll('.event-open').forEach(button => {
  button.addEventListener('click', () => openInfo(events[button.dataset.event]));
});

document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
document.getElementById('dialog-link').addEventListener('click', () => dialog.close());

document.querySelectorAll('[data-frequency]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-frequency]').forEach(item => {
      const selected = item === button;
      item.classList.toggle('is-active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
  });
});

document.querySelectorAll('[data-amount]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-amount]').forEach(item => {
      const selected = item === button;
      item.classList.toggle('is-active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    document.getElementById('custom-amount').hidden = button.dataset.amount !== 'other';
  });
});

document.getElementById('donation-submit').addEventListener('click', () => openInfo(events.don));

document.getElementById('contact-form').addEventListener('submit', e => {
  e.preventDefault();
  const form = e.currentTarget;
  const data = new FormData(form);
  const message = `Nom : ${data.get('nom')}\nCourriel : ${data.get('courriel')}\nSujet : ${data.get('sujet')}\nMessage : ${data.get('message')}`;
  const blob = new Blob([message], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'demande-cocathedrale.txt';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  const response = document.getElementById('form-response');
  response.textContent = 'Votre demande a été préparée et téléchargée. Vous pouvez la transmettre au bureau paroissial.';
  response.hidden = false;
});

const heroSlides = document.querySelectorAll('.hero-slide');
const HERO_SLIDE_MS = 4000;
const modeButtons = document.querySelectorAll('[data-mode-option]');
let heroCurrent = 0;

function showHeroSlide(index) {
  heroCurrent = index;
  heroSlides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
}

// Version du site : « static » (basique, sans animation) ou « premium » (diaporama, vidéo, GSAP).
function setMode(option) {
  const selected = option === 'static' ? 'static' : 'premium';
  document.documentElement.dataset.mode = selected;
  modeButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.modeOption === selected)));
  if (selected === 'static') showHeroSlide(0);
  try { localStorage.setItem('cocathedrale-mode', selected); } catch (e) { }
  document.dispatchEvent(new CustomEvent('modechange', { detail: selected }));
}

modeButtons.forEach(button => button.addEventListener('click', () => setMode(button.dataset.modeOption)));
modeButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.modeOption === document.documentElement.dataset.mode)));

if (heroSlides.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  setInterval(() => {
    if (document.hidden || document.documentElement.dataset.mode !== 'premium') return;
    showHeroSlide((heroCurrent + 1) % heroSlides.length);
  }, HERO_SLIDE_MS);
}

/* Coupole : vidéo en boucle, fondu au noir à chaque début et fin pour masquer le raccord. */
const domeFilm = document.querySelector('.dome-film');
if (domeFilm) {
  const video = domeFilm.querySelector('.dome-film-video');
  const fade = domeFilm.querySelector('.dome-film-fade');
  const DOME_FADE_S = 1.2;
  const mobileQuery = window.matchMedia('(max-width: 760px)');
  const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let domeVisible = false;
  let domeFrame = 0;
  let domeLooped = false; // Premier passage : l'image fixe est la première image, donc pas de fondu d'entrée.
  let domeLastTime = 0;

  const canAnimate = () => document.documentElement.dataset.mode === 'premium' && !reducedQuery.matches;

  const setSource = () => {
    const format = mobileQuery.matches ? 'mobile' : 'desktop';
    video.poster = video.dataset['poster' + (format === 'mobile' ? 'Mobile' : 'Desktop')];
    video.style.backgroundImage = `url('${video.poster}')`;
    const src = video.dataset['src' + (format === 'mobile' ? 'Mobile' : 'Desktop')];
    if (video.dataset.current === src) return;
    video.dataset.current = src;
    if (canAnimate() && domeVisible) { video.src = src; video.load(); }
  };

  const tick = () => {
    const d = video.duration;
    if (d) {
      const t = video.currentTime;
      if (t < domeLastTime) domeLooped = true;
      domeLastTime = t;
      const fadeIn = domeLooped ? t / DOME_FADE_S : 1;
      fade.style.opacity = String(1 - Math.max(0, Math.min(1, fadeIn, (d - t) / DOME_FADE_S)));
    }
    domeFrame = requestAnimationFrame(tick);
  };

  const update = () => {
    cancelAnimationFrame(domeFrame);
    if (!canAnimate()) {
      video.pause();
      fade.style.opacity = '';
      return;
    }
    if (!domeVisible) { video.pause(); return; }
    if (video.getAttribute('src') !== video.dataset.current) { video.src = video.dataset.current; video.load(); }
    const play = video.play();
    if (play) play.catch(() => { fade.style.opacity = '0'; });
    domeFrame = requestAnimationFrame(tick);
  };

  video.addEventListener('error', () => { cancelAnimationFrame(domeFrame); fade.style.opacity = '0'; });

  setSource();
  new IntersectionObserver(entries => {
    domeVisible = entries[0].isIntersecting;
    update();
  }, { threshold: 0.15 }).observe(domeFilm);
  mobileQuery.addEventListener('change', () => { setSource(); update(); });
  reducedQuery.addEventListener('change', update);
  document.addEventListener('modechange', update);
  document.addEventListener('visibilitychange', () => (document.hidden ? video.pause() : update()));
}
