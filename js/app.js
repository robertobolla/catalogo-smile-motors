

(function(){
  var headerH = 58;
  var panels = Array.prototype.slice.call(document.querySelectorAll('.panel'));
  var isScrollingProgrammatically = false;
  var scrollTimeout = null;

  // asignar a cada panel su sección de navegación
  var curNav = 'inicio';
  panels.forEach(function(p){
    if(p.id === 'inicio') curNav = 'inicio';
    else if(p.id === 'ofertas') curNav = 'ofertas';
    else if(p.id === 'newsletter') curNav = 'newsletter';
    else if(p.id.indexOf('sec-') === 0) curNav = p.id;
    p.dataset.nav = curNav;
  });

  // navegación
  function go(id){
    var el = document.getElementById(id);
    if(!el) return;

    var idx = panels.indexOf(el);
    if(idx >= 0){
      isScrollingProgrammatically = true;
      setActive(idx);
    }

    var y = el.getBoundingClientRect().top + window.pageYOffset - headerH + 2;
    window.scrollTo({ top: y, behavior: 'smooth' });
    closeMenu();

    // rehabilitar scrollspy cuando termine de desplazarse
    function onScrollEnd() {
      isScrollingProgrammatically = false;
      window.removeEventListener('scrollend', onScrollEnd);
      clearTimeout(scrollTimeout);
    }
    window.addEventListener('scrollend', onScrollEnd);
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(onScrollEnd, 800);
  }
  document.addEventListener('click', function(e){
    var t = e.target.closest('[data-go]');
    if(t){ e.preventDefault(); go(t.getAttribute('data-go')); }
  });

  // menú móvil
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');
  function closeMenu(){ menu.classList.remove('open'); burger.classList.remove('x'); }
  burger.addEventListener('click', function(){ menu.classList.toggle('open'); burger.classList.toggle('x'); });

  // nav activa + flechas
  var navBtns = Array.prototype.slice.call(document.querySelectorAll('.nl'));
  var menuBtns = Array.prototype.slice.call(document.querySelectorAll('.mm'));
  var arwPrev = document.getElementById('arwPrev');
  var arwNext = document.getElementById('arwNext');
  var current = 0;

  function setActive(idx){
    current = idx;
    var nav = panels[idx].dataset.nav;
    navBtns.forEach(function(b){ b.classList.toggle('active', b.getAttribute('data-go') === nav); });
    menuBtns.forEach(function(b){ b.classList.toggle('active', b.getAttribute('data-go') === nav); });
    arwPrev.classList.toggle('disabled', idx <= 0);
    arwNext.classList.toggle('disabled', idx >= panels.length - 1);
  }

  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      if(isScrollingProgrammatically) return;
      var best = null;
      entries.forEach(function(en){ if(en.isIntersecting && (!best || en.intersectionRatio > best.intersectionRatio)) best = en; });
      if(best){ var i = panels.indexOf(best.target); if(i >= 0) setActive(i); }
    }, { threshold:[.25,.55,.85], rootMargin:'-' + headerH + 'px 0px -40% 0px' });
    panels.forEach(function(p){ io.observe(p); });
  }

  arwPrev.addEventListener('click', function(){ if(current > 0) go(panels[current-1].id); });
  arwNext.addEventListener('click', function(){ if(current < panels.length-1) go(panels[current+1].id); });

  // teclado
  document.addEventListener('keydown', function(e){
    if(e.key === 'ArrowDown' || e.key === 'PageDown'){ if(current < panels.length-1){ e.preventDefault(); go(panels[current+1].id);} }
    if(e.key === 'ArrowUp' || e.key === 'PageUp'){ if(current > 0){ e.preventDefault(); go(panels[current-1].id);} }
  });

  setActive(0);

  // carrusel de combos (ofertas): swipe/scroll horizontal con dots + flechas sincronizadas
  Array.prototype.slice.call(document.querySelectorAll('.of-slot')).forEach(function(slot){
    var track = slot.querySelector('.of-track');
    var dots = Array.prototype.slice.call(slot.querySelectorAll('.of-dots span'));
    var cards = Array.prototype.slice.call(slot.querySelectorAll('.of-card'));
    var prevBtn = slot.querySelector('.of-nav.prev');
    var nextBtn = slot.querySelector('.of-nav.next');
    if(!track || !dots.length || !cards.length) return;

    function goTo(i){
      i = Math.max(0, Math.min(cards.length - 1, i));
      track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' });
    }
    function setActive(i){
      dots.forEach(function(d, di){ d.classList.toggle('active', di === i); });
      if(prevBtn) prevBtn.classList.toggle('disabled', i <= 0);
      if(nextBtn) nextBtn.classList.toggle('disabled', i >= cards.length - 1);
      track.style.height = cards[i].offsetHeight + 'px';
    }
    function syncFromScroll(){
      var i = Math.round(track.scrollLeft / track.clientWidth);
      setActive(i);
    }
    var scrollT;
    track.addEventListener('scroll', function(){
      clearTimeout(scrollT);
      scrollT = setTimeout(syncFromScroll, 80);
    });
    window.addEventListener('resize', function(){
      var i = Math.round(track.scrollLeft / track.clientWidth);
      setActive(i);
    });
    dots.forEach(function(dot){
      dot.addEventListener('click', function(){ goTo(parseInt(dot.getAttribute('data-i'), 10) || 0); });
    });
    if(prevBtn) prevBtn.addEventListener('click', function(){
      goTo(Math.round(track.scrollLeft / track.clientWidth) - 1);
    });
    if(nextBtn) nextBtn.addEventListener('click', function(){
      goTo(Math.round(track.scrollLeft / track.clientWidth) + 1);
    });
    setActive(0);
  });

  // newsletter: suscripción al endpoint de la plataforma de marketing (Supabase)
  var nlForm = document.getElementById('nlForm');
  if(nlForm){
    var NL_ENDPOINT = 'https://marketing.smilemotors.online/api/newsletter';
    var nlMsg = document.getElementById('nlMsg');
    var nlBtn = nlForm.querySelector('.nl-btn');
    nlForm.addEventListener('submit', function(e){
      e.preventDefault();
      var email = (nlForm.email.value || '').trim();
      var website = nlForm.website.value || ''; // honeypot
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
        nlMsg.className = 'nl-msg err';
        nlMsg.textContent = 'Ingresá un email válido.';
        return;
      }
      nlBtn.disabled = true;
      nlMsg.className = 'nl-msg';
      nlMsg.textContent = 'Enviando…';
      fetch(NL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, website: website })
      }).then(function(res){
        if(res.ok){
          nlMsg.className = 'nl-msg ok';
          nlMsg.textContent = '¡Listo! Quedaste suscripto. 🎉';
          nlForm.reset();
          if(window.fbq) fbq('track', 'Lead');
          if(window.gtag) gtag('event', 'newsletter_signup', { transport_type: 'beacon' });
          if(window.dataLayer) dataLayer.push({ event: 'newsletter_signup' });
        } else {
          nlMsg.className = 'nl-msg err';
          nlMsg.textContent = 'No pudimos suscribirte. Probá de nuevo.';
        }
      }).catch(function(){
        nlMsg.className = 'nl-msg err';
        nlMsg.textContent = 'Error de conexión. Probá de nuevo.';
      }).finally(function(){
        nlBtn.disabled = false;
      });
    });
  }
})();