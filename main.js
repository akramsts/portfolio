(function () {
  var year = document.getElementById('current-year');
  if (year) year.textContent = new Date().getFullYear();
})();

(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobile = window.matchMedia('(max-width: 680px)').matches;
  if (reduce || mobile || !('IntersectionObserver' in window)) return;

  var items = document.querySelectorAll('.section-head, .about-text, .skills, .project, .contact-card');

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  items.forEach(function (el) {
    el.classList.add('reveal');
    io.observe(el);
  });
})();

(function () {
  var links = Array.prototype.slice.call(document.querySelectorAll('.side-nav a'));
  var targets = links.map(function (a) {
    return document.querySelector(a.getAttribute('href'));
  });

  function update() {
    var y = window.innerHeight * 0.4;
    var current = 0;

    targets.forEach(function (t, i) {
      if (t && t.getBoundingClientRect().top <= y) current = i;
    });

    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
      current = links.length - 1;
    }

    links.forEach(function (a, i) {
      a.classList.toggle('active', i === current);
      if (i === current) {
        a.setAttribute('aria-current', 'location');
      } else {
        a.removeAttribute('aria-current');
      }
    });
  }

  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      update();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();