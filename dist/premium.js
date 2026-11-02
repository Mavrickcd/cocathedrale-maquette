/* Version premium : GSAP + ScrollTrigger (copies locales dans vendor/). Activée/désactivée par le sélecteur S / P. */
(() => {
  const root = document.documentElement;
  const EASE = 'power3.out';
  let active = false;
  let mm = null;
  let libs = null;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const el = document.createElement('script');
      el.src = src;
      el.onload = resolve;
      el.onerror = () => reject(new Error(`Impossible de charger ${src}`));
      document.head.appendChild(el);
    });
  }

  function loadLibs() {
    if (!libs) {
      libs = loadScript('vendor/gsap.min.js').then(() => loadScript('vendor/ScrollTrigger.min.js'));
      libs.catch(() => { libs = null; });
    }
    return libs;
  }

  // Découpe un titre en mots insécables puis en lettres, en gardant <br> et <em>. Le texte intact reste lisible par les lecteurs d'écran.
  function splitHeading(el) {
    const original = el.innerHTML;
    const letters = [];
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    const walk = node => {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const word = document.createElement('span');
            word.className = 'split-word';
            word.setAttribute('aria-hidden', 'true');
            [...part].forEach(ch => {
              const letter = document.createElement('span');
              letter.className = 'split-char';
              letter.textContent = ch;
              word.appendChild(letter);
              letters.push(letter);
            });
            frag.appendChild(word);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          walk(child);
        }
      });
    };
    walk(el);
    return { letters, revert() { el.innerHTML = original; el.removeAttribute('aria-label'); } };
  }

  const $$ = sel => [...document.querySelectorAll(sel)];

  function build() {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    mm = gsap.matchMedia();

    // Plein effet, ou « mode doux » si l'appareil réduit les animations : fondus seulement, aucun mouvement.
    mm.add({
      full: '(prefers-reduced-motion: no-preference)',
      soft: '(prefers-reduced-motion: reduce)',
      desktop: '(min-width: 761px)',
      fine: '(hover: hover) and (pointer: fine)'
    }, context => {
      const { full, desktop, fine } = context.conditions;
      const blur = full && fine ? 6 : full ? 3 : 0;
      const splits = [];
      const y = full ? 28 : 0;
      const trigger = (extra = {}) => ({ start: 'top 82%', toggleActions: 'play none none reset', ...extra });

      /* 1. Titre du haut : lettres qui se déplient au chargement (le reste de l'en-tête suit) */
      const h1 = document.querySelector('.hero h1');
      const heroTl = gsap.timeline({ defaults: { ease: EASE }, onComplete: () => root.classList.remove('hero-pending') });
      root.classList.remove('hero-pending');
      if (full) {
        const split = splitHeading(h1);
        splits.push(split);
        heroTl
          .fromTo(split.letters, { opacity: 0, yPercent: -12, rotationX: -85, transformOrigin: '50% 0%', filter: `blur(${blur}px)` },
            { opacity: 1, yPercent: 0, rotationX: 0, filter: 'blur(0px)', duration: 1.1, stagger: { amount: Math.min(split.letters.length * 0.03, 0.9) }, clearProps: 'filter' }, 0.15)
          .fromTo('.hero-eyebrow', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1 }, 0.05)
          .fromTo('.hero-lede, .hero-actions', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1, stagger: 0.12 }, 0.85);
      } else {
        heroTl.fromTo('.hero h1, .hero-eyebrow, .hero-lede, .hero-actions', { opacity: 0 }, { opacity: 1, duration: 0.8, stagger: 0.1 });
      }

      /* 2. Titres de section : lettres qui se déplient et sortent du flou, rejouées en remontant */
      $$('h2').filter(h => !h.closest('.film-caption') && !h.closest('dialog')).forEach(h => {
        if (!full) {
          gsap.from(h, { opacity: 0, duration: 0.9, scrollTrigger: trigger() });
          return;
        }
        const split = splitHeading(h);
        splits.push(split);
        gsap.fromTo(split.letters,
          { opacity: 0, yPercent: -12, rotationX: -85, transformOrigin: '50% 0%', filter: `blur(${blur}px)` },
          { opacity: 1, yPercent: 0, rotationX: 0, filter: 'blur(0px)', duration: 1.1, ease: EASE, clearProps: 'filter',
            stagger: { amount: Math.min(split.letters.length * 0.03, 0.8) }, scrollTrigger: trigger() });
      });

      /* 3. Surtitres : le trait se dessine, puis le texte monte */
      $$('.eyebrow').filter(e => !e.closest('.hero') && !e.closest('.film-caption') && !e.closest('dialog')).forEach(e => {
        gsap.from(e, { opacity: 0, y: y * 0.6, duration: 1, ease: EASE, scrollTrigger: trigger() });
        if (full) gsap.fromTo(e, { '--line': 0 }, { '--line': 1, duration: 1.2, delay: 0.25, ease: EASE, scrollTrigger: trigger() });
      });
      const hasLineVar = full;
      if (hasLineVar) {
        // Le trait (pseudo-élément) lit --line pour sa largeur.
        const style = document.createElement('style');
        style.textContent = 'html[data-mode="premium"] .eyebrow::before{transform:scaleX(var(--line,1))}';
        document.head.appendChild(style);
        splits.push({ revert: () => style.remove() });
      }

      /* 4. Textes d'accompagnement : apparition qui monte, en série */
      const fadeTargets = '.section-head > p, .masses-intro > p:not(.eyebrow), .community-copy p:not(.eyebrow), .stack-links, .heritage-copy > p:not(.eyebrow), .heritage-links, .heritage-copy .button, .donation-copy > p:not(.eyebrow), .volunteer-layout p:not(.eyebrow), .volunteer-layout .button, .contact-copy > p:not(.eyebrow), .contact-address, .donation-panel, .calendar, .contact-form, .mass-footnote';
      gsap.set(fadeTargets, { opacity: 0, y });
      ScrollTrigger.batch(fadeTargets, {
        start: 'top 88%',
        onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, ease: EASE, stagger: 0.1, overwrite: true }),
        onLeaveBack: batch => gsap.set(batch, { opacity: 0, y })
      });

      /* 5. Cartes en cascade (6 au maximum à la fois) */
      const cards = '.quick-links a, .event-list > .event-row, .mass-place, .service-links a, .footer-col, .footer-brand';
      gsap.set(cards, { opacity: 0, y });
      ScrollTrigger.batch(cards, {
        start: 'top 92%',
        batchMax: 6,
        onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, ease: EASE, stagger: 0.09, overwrite: true }),
        onLeaveBack: batch => gsap.set(batch, { opacity: 0, y })
      });

      /* 6. Photos dévoilées comme un rideau, avec léger zoom arrière lié au défilement */
      if (full) {
        $$('.community-image, .heritage-image, .photo-strip').forEach(frame => {
          gsap.fromTo(frame, { clipPath: 'inset(100% 0% 0% 0%)' },
            { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'power3.inOut', clearProps: 'clipPath', scrollTrigger: trigger({ start: 'top 88%' }) });
        });
        $$('.community-image img, .heritage-image img').forEach(img => {
          gsap.fromTo(img, { scale: 1.12 }, { scale: 1, ease: 'none',
            scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
        });
        gsap.fromTo('.donation-backdrop', { yPercent: -6 }, { yPercent: 6, ease: 'none',
          scrollTrigger: { trigger: '.donation-section', start: 'top bottom', end: 'bottom top', scrub: true } });
      } else {
        $$('.community-image, .heritage-image, .photo-strip').forEach(frame => {
          gsap.from(frame, { opacity: 0, duration: 1, scrollTrigger: trigger({ start: 'top 88%' }) });
        });
      }

      /* 7. Bannière : le texte monte et s'efface en descendant, l'image grossit doucement */
      if (full) {
        const heroSpan = Math.round(window.innerHeight * 0.55); // mesuré une fois (barre d'adresse de Safari)
        gsap.to('.hero-content', { y: -70, opacity: 0, ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: `+=${heroSpan}`, scrub: 0.6 } });
        gsap.fromTo('.hero-slides', { scale: 1, transformOrigin: '50% 0%' }, { scale: 1.1, ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      }

      /* 8. Liens « Voir… » : le soulignement se trace */
      ScrollTrigger.batch('.line-link, .donation-more', {
        start: 'top 92%',
        onEnter: batch => batch.forEach(el => el.classList.add('is-drawn')),
        onLeaveBack: batch => batch.forEach(el => el.classList.remove('is-drawn'))
      });

      /* 9. Diaporama : une copie des photos à la suite pour que la boucle CSS (droite à gauche) ne coupe jamais */
      const track = document.querySelector('.strip-track');
      const clones = full ? [...track.children].map(li => {
        const copy = li.cloneNode(true);
        copy.setAttribute('aria-hidden', 'true');
        track.appendChild(copy);
        return copy;
      }) : [];

      /* 10. Portes : la section reste épinglée, le cadre s'ouvre en plein écran et la vidéo avance avec le défilement */
      const stage = document.querySelector('.film-stage');
      const frame = document.querySelector('.film-frame');
      const video = document.querySelector('.film-video');
      const caption = document.querySelector('.film-caption');

      if (full) {
        // Charge la vidéo un peu avant d'arriver; lecture muette arrêtée aussitôt pour que Safari iOS affiche les images au défilement.
        ScrollTrigger.create({ trigger: stage, start: 'top 250%', once: true, onEnter: () => {
          video.preload = 'auto';
          video.load();
          video.addEventListener('loadeddata', () => video.play().then(() => video.pause()).catch(() => { }), { once: true });
        } });
        // Secours si la vidéo ne peut pas être lue : fondu des portes fermées vers la nef.
        const endImg = document.querySelector('.film-end');
        let fallback = !video.canPlayType('video/mp4; codecs="avc1.640028"');
        const sources = [...video.querySelectorAll('source')];
        sources[sources.length - 1].addEventListener('error', () => { fallback = true; seek(); });
        const state = { t: 0 };
        const seek = () => {
          if (fallback) {
            endImg.style.display = 'block';
            endImg.style.opacity = Math.min(Math.max((state.t - 0.35) / 0.4, 0), 1);
            return;
          }
          if (!video.duration) return;
          const time = state.t * (video.duration - 0.05);
          if (Math.abs(video.currentTime - time) > 0.01) video.currentTime = time;
        };
        const tl = gsap.timeline({ defaults: { ease: 'none' },
          scrollTrigger: { trigger: stage, start: 'top top', end: desktop ? '+=160%' : '+=130%', pin: true, scrub: 0.5, anticipatePin: 1 } });
        tl.fromTo(frame, { clipPath: desktop ? 'inset(14% 26% 14% 26%)' : 'inset(12% 10% 12% 10%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.25 }, 0)
          .fromTo(state, { t: 0 }, { t: 1, duration: 0.85, onUpdate: seek }, 0.1)
          .fromTo(caption, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.15 }, 0.82);
      } else {
        gsap.from(caption, { opacity: 0, duration: 1, scrollTrigger: trigger({ trigger: stage, start: 'top 60%' }) });
      }

      return () => {
        clones.forEach(c => c.remove());
        document.querySelector('.film-end').removeAttribute('style');
        video.pause();
        splits.forEach(s => s.revert());
        root.classList.remove('hero-pending');
      };
    });
  }

  async function enable() {
    if (active) return;
    active = true;
    try {
      await loadLibs();
    } catch (error) {
      console.warn(error.message);
      root.classList.remove('hero-pending');
      return;
    }
    if (!active) return; // retour au statique pendant le chargement
    build();
    window.addEventListener('load', () => active && ScrollTrigger.refresh(), { once: true });
  }

  function disable() {
    active = false;
    if (mm) { mm.revert(); mm = null; }
    root.classList.remove('hero-pending');
  }

  document.addEventListener('modechange', event => (event.detail === 'premium' ? enable() : disable()));
  if (root.dataset.mode === 'premium') enable();
})();
