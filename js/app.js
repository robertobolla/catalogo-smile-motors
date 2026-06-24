

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

  // indicador de sección + nav activa + flechas
  var navSec = document.getElementById('navSec');
  var navBtns = Array.prototype.slice.call(document.querySelectorAll('.nl'));
  var menuBtns = Array.prototype.slice.call(document.querySelectorAll('.mm'));
  var arwPrev = document.getElementById('arwPrev');
  var arwNext = document.getElementById('arwNext');
  var current = 0;

  function labelFor(nav){
    if(nav === 'inicio') return 'Inicio';
    var btn = navBtns.filter(function(b){ return b.getAttribute('data-go') === nav; })[0];
    return btn ? btn.textContent : 'Inicio';
  }
  function setActive(idx){
    current = idx;
    var nav = panels[idx].dataset.nav;
    if (navSec) navSec.textContent = labelFor(nav);
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
})();