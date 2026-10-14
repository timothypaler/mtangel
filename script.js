const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px' });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const sections = [...document.querySelectorAll('main section[id]')];
const links = [...document.querySelectorAll('.chapter-dock a')];

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    links.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
    });
  });
}, { rootMargin: '-40% 0px -50%', threshold: 0 });

sections.forEach((section) => sectionObserver.observe(section));

document.querySelectorAll('.journal-card').forEach((card) => {
  card.addEventListener('toggle', () => {
    if (!card.open) return;
    document.querySelectorAll('.journal-card[open]').forEach((other) => {
      if (other !== card) other.open = false;
    });
  });
});

// Terms share the profile while keeping journals and reflections distinct.
const termButtons = [...document.querySelectorAll('[data-select-term]')];
function selectTerm(term, updateUrl = true) {
  if (!['prelims', 'midterms'].includes(term)) term = 'midterms';
  termButtons.forEach(button => {
    const selected = button.dataset.selectTerm === term;
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  document.querySelectorAll('[data-term]').forEach(panel => panel.hidden = panel.dataset.term !== term);
  document.querySelectorAll('[data-reflection-term]').forEach(panel => panel.hidden = panel.dataset.reflectionTerm !== term);
  document.querySelector('.term-status').textContent = term === 'midterms' ? 'Viewing Midterms · 14 learning entries + closing reflection' : 'Viewing Prelims · 8 learning entries + closing reflection';
  const isMidterm = term === 'midterms';
  document.querySelector('#reflection').setAttribute('aria-labelledby', isMidterm ? 'midterms-reflection-title' : 'reflection-title');
  const picker = document.querySelector('.immersive-selector');
  picker.dataset.activeTerm = term;
  document.querySelector('#term-preview-label').textContent = isMidterm ? 'Midterms / Energy & metabolism' : 'Prelims / The foundations';
  document.querySelector('#term-preview-title').textContent = isMidterm ? 'The energy behind life.' : 'Where understanding begins.';
  document.querySelector('#term-preview-copy').textContent = isMidterm ? 'Fourteen learning entries, from laboratory activities to the pathways that keep us going.' : 'Eight learning entries, tracing the first lessons, challenges and breakthroughs in Biochemistry.';
  document.querySelector('.molecular-art span').textContent = isMidterm ? 'ATP' : 'H₂O';
  document.querySelector('.term-enter').textContent = isMidterm ? 'Explore Midterms ↓' : 'Explore Prelims ↓';
  document.querySelectorAll('[data-term]:not([hidden]) .reveal, [data-reflection-term]:not([hidden]) .reveal').forEach(element => revealObserver.observe(element));
  if (updateUrl) {
    const portal = document.querySelector('.term-portal');
    portal.getAnimations().forEach(animation => animation.cancel());
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      portal.animate([{opacity:.35, transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}], {duration:500,easing:'cubic-bezier(.2,.7,.2,1)'});
    }
    const url = new URL(location.href); url.searchParams.set('term', term);
    history.replaceState(null, '', url);
  }
}
termButtons.forEach((button, i) => {
  button.addEventListener('click', () => selectTerm(button.dataset.selectTerm));
  button.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - i;
    termButtons[next].focus(); selectTerm(termButtons[next].dataset.selectTerm);
  });
});
selectTerm(new URLSearchParams(location.search).get('term') || 'midterms', false);
window.addEventListener('popstate', () => selectTerm(new URLSearchParams(location.search).get('term'), false));
if (location.hash.startsWith('#midterm-entry-')) {
  selectTerm('midterms', false);
  const card = document.querySelector(location.hash); if (card) card.open = true;
}
