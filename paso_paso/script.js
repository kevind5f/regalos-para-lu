/* =========================================================
   JS: corazones flotantes, confeti al abrir la carta,
       barra de progreso, navegación con teclado
   ========================================================= */
(function () {
  'use strict';

  // -------------------------------------------------------------
  // 1) Corazones flotantes dinámicos en el fondo
  // -------------------------------------------------------------
  function initFloatingHearts() {
    var container = document.querySelector('.hearts-bg');
    if (!container) return;

    var emojis = ['💖', '💕', '💗', '💘', '💝', '🌸', '✨', '💓'];
    var total = window.innerWidth < 480 ? 12 : 22;

    for (var i = 0; i < total; i++) {
      var span = document.createElement('span');
      span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      span.style.left = Math.random() * 100 + 'vw';
      var duration = 8 + Math.random() * 10;       // 8s a 18s
      span.style.animationDuration = duration + 's';
      span.style.animationDelay = (Math.random() * 8) + 's';
      var size = 0.8 + Math.random() * 1.6;        // 0.8 a 2.4 rem
      span.style.fontSize = size + 'rem';
      container.appendChild(span);
    }
  }

  // -------------------------------------------------------------
  // 2) Barra de progreso: activar paso actual en JS + animar números a corazones
  // -------------------------------------------------------------
  function initProgress() {
    var radios = document.querySelectorAll('input[name="step"]');
    var steps  = document.querySelectorAll('.progress-step');

    function update() {
      var activeId = document.querySelector('input[name="step"]:checked').id; // step1, step2, step3
      var num = parseInt(activeId.replace('step', ''), 10);

      steps.forEach(function (el, idx) {
        var sp = el.querySelector('span');
        if (idx + 1 <= num) {
          el.classList.add('active');
          // últimos dos pasos muestran 💖
          if (idx + 1 < num) {
            if (sp.textContent !== '✔️') sp.textContent = '✔️';
          } else {
            if (sp.textContent === '✔️') sp.textContent = String(idx + 1);
          }
        } else {
          el.classList.remove('active');
          if (sp.textContent !== String(idx + 1)) sp.textContent = String(idx + 1);
        }
      });
    }

    radios.forEach(function (r) {
      r.addEventListener('change', function () {
        update();
        if (r.id === 'step3') {
          setTimeout(launchConfetti, 250);
        }
      });
    });

    update();
  }

  // -------------------------------------------------------------
  // 3) Confeti al abrir la carta — ligero, sin librerías
  // -------------------------------------------------------------
  var confettiCanvas, ctxConfetti, confettiParticles = [], confettiRunning = false;

  function initConfettiCanvas() {
    confettiCanvas = document.getElementById('confetti-canvas');
    if (!confettiCanvas) return;
    ctxConfetti = confettiCanvas.getContext('2d');
    resizeConfetti();
    window.addEventListener('resize', resizeConfetti);
  }

  function resizeConfetti() {
    if (!confettiCanvas) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }

  function launchConfetti() {
    if (!confettiCanvas || confettiRunning) return;
    confettiRunning = true;

    var palette = ['#ff5c8a', '#ff8fa3', '#ffd1dc', '#c9184a', '#ffb3c6', '#ffc8dd', '#ffafcc', '#ffffff'];
    var shapes  = ['circle', 'square', 'heart'];
    var count = window.innerWidth < 480 ? 140 : 260;

    for (var i = 0; i < count; i++) {
      confettiParticles.push({
        x: Math.random() * confettiCanvas.width,
        y: -20 - Math.random() * confettiCanvas.height * 0.5,
        vx: (Math.random() - 0.5) * 4,
        vy: 1.5 + Math.random() * 3.5,
        size: 5 + Math.random() * 9,
        color: palette[Math.floor(Math.random() * palette.length)],
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.18,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        life: 1
      });
    }

    requestAnimationFrame(tickConfetti);
  }

  function drawHeart(ctx, size) {
    ctx.beginPath();
    var s = size;
    ctx.moveTo(0, s * 0.3);
    ctx.bezierCurveTo(0, 0, -s * 0.5, 0, -s * 0.5, s * 0.3);
    ctx.bezierCurveTo(-s * 0.5, s * 0.6, 0, s * 0.9, 0, s * 1.15);
    ctx.bezierCurveTo(0, s * 0.9, s * 0.5, s * 0.6, s * 0.5, s * 0.3);
    ctx.bezierCurveTo(s * 0.5, 0, 0, 0, 0, s * 0.3);
    ctx.closePath();
    ctx.fill();
  }

  function tickConfetti() {
    ctxConfetti.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    var alive = 0;
    for (var i = 0; i < confettiParticles.length; i++) {
      var p = confettiParticles[i];
      if (p.life <= 0) continue;
      alive++;

      p.vy += 0.035;          // gravedad
      p.x  += p.vx;
      p.y  += p.vy;
      p.rot += p.vr;
      p.life -= 0.005;        // fade muy muy lento
      if (p.life < 0) p.life = 0;

      ctxConfetti.save();
      ctxConfetti.translate(p.x, p.y);
      ctxConfetti.rotate(p.rot);
      ctxConfetti.globalAlpha = Math.max(0, Math.min(1, p.life));
      ctxConfetti.fillStyle = p.color;

      if (p.shape === 'circle') {
        ctxConfetti.beginPath();
        ctxConfetti.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
        ctxConfetti.fill();
      } else if (p.shape === 'square') {
        ctxConfetti.fillRect(-p.size * 0.5, -p.size * 0.5, p.size, p.size);
      } else {
        drawHeart(ctxConfetti, p.size);
      }

      ctxConfetti.restore();

      // reiniciar partículas que se salen si aún hay mucha vida? No, solo una vez.
    }

    // limpiar muertas
    if (alive < confettiParticles.length && Math.random() < 0.08) {
      confettiParticles = confettiParticles.filter(function (q) { return q.life > 0.01 && q.y < confettiCanvas.height + 60; });
    }

    if (confettiParticles.length > 0) {
      requestAnimationFrame(tickConfetti);
    } else {
      ctxConfetti.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      confettiRunning = false;
    }
  }

  // -------------------------------------------------------------
  // 4) Navegación por teclado (enter / space / flechas)
  // -------------------------------------------------------------
  function initKeyboard() {
    var radios = Array.prototype.slice.call(document.querySelectorAll('input[name="step"]'));
    document.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
        var current = radios.findIndex(function (r) { return r.checked; });
        if (current < radios.length - 1) {
          radios[current + 1].checked = true;
          radios[current + 1].dispatchEvent(new Event('change'));
          e.preventDefault();
        }
      } else if (e.key === 'ArrowLeft') {
        var current2 = radios.findIndex(function (r) { return r.checked; });
        if (current2 > 0) {
          radios[current2 - 1].checked = true;
          radios[current2 - 1].dispatchEvent(new Event('change'));
          e.preventDefault();
        }
      }
    });
  }

  // -------------------------------------------------------------
  // 5) Repegar corazones cuando el paso cambia (efecto secundario)
  // -------------------------------------------------------------
  function initBurstOnClick() {
    var buttons = document.querySelectorAll('.boton, .envelope-label, .envelope');
    buttons.forEach(function (b) {
      b.addEventListener('click', function (ev) {
        var rect = b.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        miniHeartBurst(cx, cy);
      });
    });
  }

  function miniHeartBurst(cx, cy) {
    var emojis = ['💖', '💕', '💘', '✨', '💝'];
    for (var i = 0; i < 8; i++) {
      var s = document.createElement('span');
      s.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      s.setAttribute('aria-hidden', 'true');
      s.style.position = 'fixed';
      s.style.left = cx + 'px';
      s.style.top  = cy + 'px';
      s.style.fontSize = (1.2 + Math.random() * 0.9) + 'rem';
      s.style.pointerEvents = 'none';
      s.style.zIndex = 50;
      s.style.transform = 'translate(-50%, -50%)';
      s.style.willChange = 'transform, opacity';
      var angle = (Math.PI * 2) * (i / 8) + Math.random() * 0.4;
      var dist = 40 + Math.random() * 40;
      var dx = Math.cos(angle) * dist;
      var dy = Math.sin(angle) * dist;
      s.animate([
        { transform: 'translate(-50%, -50%) scale(0.2)', opacity: 1 },
        { transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px)) scale(1)', opacity: 1, offset: 0.6 },
        { transform: 'translate(calc(-50% + ' + (dx * 1.4) + 'px), calc(-50% + ' + (dy * 1.4 + 40) + 'px)) scale(0.5)', opacity: 0 }
      ], { duration: 1100 + Math.random() * 400, easing: 'cubic-bezier(.2,.7,.3,1)' });
      document.body.appendChild(s);
      setTimeout(function (el) { el.remove(); }, 1600, s);
    }
  }

  // -------------------------------------------------------------
  // Arrancar todo
  // -------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', function () {
    initFloatingHearts();
    initConfettiCanvas();
    initProgress();
    initKeyboard();
    initBurstOnClick();
  });
})();
