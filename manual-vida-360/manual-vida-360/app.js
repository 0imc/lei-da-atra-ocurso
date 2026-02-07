let clickAudio; let ambientAudio; let ambientOn = false;

function initSounds(){
  try{
    if(!clickAudio){
      clickAudio = new Audio('assets/audio/click.mp3');
      clickAudio.volume = 0.4;
    }
    if(!ambientAudio){
      ambientAudio = new Audio('assets/audio/ambient.mp3');
      ambientAudio.loop = true;
      ambientAudio.volume = 0.18;
    }
  }catch(e){/* ignore */}
  document.querySelectorAll('[data-sfx="click"]').forEach(el=>{
    el.addEventListener('click',()=>playClick());
  });
}
function playClick(){ try{ clickAudio && clickAudio.currentTime!==undefined && (clickAudio.currentTime = 0, clickAudio.play()); }catch(e){} }
function toggleAmbient(){
  ambientOn = !ambientOn;
  const btn = document.getElementById('ambient-toggle');
  if(ambientOn){ try{ ambientAudio && ambientAudio.play(); }catch(e){}; btn.textContent='Som ambiente: on'; btn.setAttribute('aria-pressed','true'); }
  else { try{ ambientAudio && ambientAudio.pause(); }catch(e){}; btn.textContent='Som ambiente: off'; btn.setAttribute('aria-pressed','false'); }
}

function initThemeToggle(){
  const btn = document.getElementById('theme-toggle');
  if(!btn) return;
  btn.addEventListener('click', toggleTheme);
}
function toggleTheme(){
  const isDark = document.body.classList.toggle('theme-light');
  const btn = document.getElementById('theme-toggle');
  if(btn){ btn.textContent = document.body.classList.contains('theme-light') ? 'Modo noturno' : 'Modo diurno'; }
}

function showLoader(show){
  const el = document.getElementById('loader');
  if(!el) return;
  el.style.display = show ? 'grid' : 'none';
}

// Partículas simples com canvas
function initParticlesBackground(){
  const canvas = document.getElementById('particles-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let width,height,mouseX=0,mouseY=0;
  function resize(){ width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();
  for(let i=0;i<80;i++){
    particles.push({ x: Math.random()*width, y: Math.random()*height, r: Math.random()*2+0.4, vx:(Math.random()-0.5)*0.2, vy:(Math.random()-0.5)*0.2 });
  }
  window.addEventListener('mousemove', e=>{ mouseX=e.clientX; mouseY=e.clientY; });
  function tick(){
    ctx.clearRect(0,0,width,height);
    for(const p of particles){
      const dx = (mouseX - p.x) * 0.0006; const dy = (mouseY - p.y) * 0.0006;
      p.vx += dx; p.vy += dy; p.x += p.vx; p.y += p.vy; p.vx*=0.98; p.vy*=0.98;
      if(p.x<0||p.x>width) p.vx*=-1; if(p.y<0||p.y>height) p.vy*=-1;
      const g = 180 + Math.sin((p.x+p.y)*0.01)*60;
      ctx.fillStyle = `rgba(255, ${g|0}, 0, 0.8)`; // dourado variável
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
    }
    requestAnimationFrame(tick);
  }
  tick();
}

// Fade-up on scroll
function initFadeUpOnScroll(){
  const els = document.querySelectorAll('.fade-up');
  const ob = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.style.animationPlayState = 'running'; ob.unobserve(e.target);} });
  },{ threshold: 0.2 });
  els.forEach(el=>ob.observe(el));
}

// Scroll bands
function initScrollBands(){
  const band = document.createElement('div');
  band.style.position='fixed'; band.style.left='0'; band.style.right='0'; band.style.top='-2px'; band.style.height='2px'; band.style.background='linear-gradient(90deg, transparent, rgba(255,215,0,0.9), transparent)'; band.style.pointerEvents='none'; band.style.opacity='0'; band.style.transition='opacity .2s'; band.style.zIndex='5';
  document.body.appendChild(band);
  let t=0; window.addEventListener('scroll',()=>{ const now=Date.now(); if(now-t>120){ band.style.opacity='1'; setTimeout(()=>band.style.opacity='0',150); t=now; }});
}

// To top button
function initToTop(){
  const btn = document.getElementById('to-top'); if(!btn) return;
  btn.addEventListener('click',()=>{ playClick(); btn.style.transform='rotate(360deg)'; setTimeout(()=>btn.style.transform='',320); window.scrollTo({top:0,behavior:'smooth'}); });
}

// Typewriter effect
function initTypewriter(){
  const el = document.querySelector('.typewriter');
  if(!el) return;
  const text = el.dataset.typewriter || el.textContent || '';
  el.textContent='';
  let i=0; const timer = setInterval(()=>{ el.textContent += text[i++]||''; if(i>text.length){ clearInterval(timer); } }, 22);
}


