/* ---------- theme toggle ---------- */
const root = document.body;
const themeBtn = document.getElementById('theme-toggle');
const iconMoon = document.getElementById('icon-moon');
function setTheme(t){
  root.setAttribute('data-theme', t);
  localStorage.setItem('ah-theme', t); // best-effort; falls back silently if unavailable
  iconMoon.innerHTML = t === 'dark'
    ? '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'
    : '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
}
try{
  const saved = localStorage.getItem('ah-theme');
  if(saved) setTheme(saved); else setTheme('dark');
}catch(e){ setTheme('dark'); }
themeBtn.addEventListener('click', ()=>{
  const cur = root.getAttribute('data-theme');
  setTheme(cur === 'dark' ? 'light' : 'dark');
});

/* ---------- scroll progress + back to top ---------- */
const progressBar = document.getElementById('scroll-progress');
const totop = document.getElementById('totop');
window.addEventListener('scroll', ()=>{
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  progressBar.style.width = scrolled + '%';
  totop.classList.toggle('show', h.scrollTop > 500);
});
totop.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));

/* ---------- copy email ---------- */
document.getElementById('copy-email').addEventListener('click', ()=>{
  const email = document.getElementById('email-val').textContent;
  navigator.clipboard?.writeText(email).then(showToast('Email copied to clipboard'));
});
function showToast(msg){
  return function(){
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(()=>t.classList.remove('show'), 2200);
  }
}

/* ---------- contact form (mailto fallback, no backend) ---------- */
document.getElementById('contact-form').addEventListener('submit', function(e){
  e.preventDefault();
  const name = document.getElementById('cf-name').value;
  const email = document.getElementById('cf-email').value;
  const msg = document.getElementById('cf-msg').value;
  const subject = encodeURIComponent('Portfolio contact from ' + name);
  const body = encodeURIComponent(msg + '\n\n— ' + name + ' (' + email + ')');
  window.location.href = 'mailto:ahmedrosea20@gmail.com?subject=' + subject + '&body=' + body;
  showToast('Opening your email client…')();
});

/* ---------- phone screen cycling ---------- */
const apps = [
  {name:'Shop Deal', build:'Build succeeded in 1.4s'},
  {name:'Harith', build:'Build succeeded in 1.1s'},
  {name:'Fantasy Sky', build:'Build succeeded in 1.6s'},
  {name:'Book-Rental', build:'Build succeeded in 0.9s'}
];
let appIdx = 0;
setInterval(()=>{
  appIdx = (appIdx+1) % apps.length;
  const nameEl = document.getElementById('phone-app-name');
  const buildEl = document.getElementById('build-text');
  if(window.gsap){
    gsap.to(nameEl, {opacity:0, y:-6, duration:.25, onComplete:()=>{
      nameEl.textContent = apps[appIdx].name;
      gsap.fromTo(nameEl, {opacity:0,y:6}, {opacity:1,y:0,duration:.3});
    }});
  } else {
    nameEl.textContent = apps[appIdx].name;
  }
  buildEl.textContent = apps[appIdx].build;
}, 3200);

/* ---------- GSAP scroll reveals ---------- */
if(window.gsap && window.ScrollTrigger){
  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray('.reveal').forEach((el)=>{
    gsap.to(el, {
      opacity:1, y:0, duration:.9, ease:'power3.out',
      scrollTrigger:{ trigger:el, start:'top 88%' }
    });
  });

  // hero entrance sequence
  gsap.timeline()
    .from('.hero-eyebrow', {opacity:0, y:16, duration:.6, ease:'power2.out'})
    .from('.hero-title', {opacity:0, y:24, duration:.7, ease:'power2.out'}, '-=.35')
    .from('.hero-desc', {opacity:0, y:18, duration:.6, ease:'power2.out'}, '-=.4')
    .from('.hero-actions', {opacity:0, y:16, duration:.6, ease:'power2.out'}, '-=.35')
    .from('.hero-stat', {opacity:0, y:14, duration:.5, stagger:.08, ease:'power2.out'}, '-=.3')
    .from('.phone', {opacity:0, scale:.9, rotateY:14, duration:1, ease:'power3.out'}, '-=.9')
    .from('.orbit-node', {opacity:0, scale:.7, stagger:.12, duration:.5, ease:'back.out(1.7)'}, '-=.5')
    .from('.build-toast', {opacity:0, y:16, duration:.5, ease:'power2.out'}, '-=.2');

  // floating orbit nodes
  gsap.to('.orbit-1', {y:-10, duration:2.6, repeat:-1, yoyo:true, ease:'sine.inOut'});
  gsap.to('.orbit-2', {y:10, duration:3, repeat:-1, yoyo:true, ease:'sine.inOut', delay:.3});
  gsap.to('.orbit-3', {y:-8, duration:2.3, repeat:-1, yoyo:true, ease:'sine.inOut', delay:.6});

  // timeline dots pulse for current role
  gsap.to('.tl-item.current .tl-dot', {scale:1.15, duration:1, repeat:-1, yoyo:true, ease:'sine.inOut'});

  // animated stat counters
  gsap.utils.toArray('.stat-num').forEach((el)=>{
    const target = parseFloat(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    let obj = {val:0};
    ScrollTrigger.create({
      trigger: el, start:'top 90%', once:true,
      onEnter:()=>{
        gsap.to(obj, {
          val:target, duration:1.6, ease:'power2.out',
          onUpdate:()=>{ el.textContent = Math.round(obj.val) + suffix; }
        });
      }
    });
  });

  // skill & project cards subtle stagger within their grids
  gsap.utils.toArray('.skills-grid, .services-grid').forEach(grid=>{
    gsap.from(grid.children, {
      opacity:0, y:24, duration:.7, stagger:.08, ease:'power2.out',
      scrollTrigger:{trigger:grid, start:'top 85%'}
    });
  });
} else {
  document.querySelectorAll('.reveal').forEach(el=>{el.style.opacity=1; el.style.transform='none';});
}

/* ---------- mobile menu (simple show/hide of nav-links as dropdown) ---------- */
