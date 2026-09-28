/* ==========================================================================
   CONTROL DE LA EXPERIENCIA INTERACTIVA
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Elementos principales
  const screenEnvelope = document.getElementById('screen-envelope');
  const screenLetter = document.getElementById('screen-letter');
  const openBtn = document.getElementById('open-btn');
  const envelopeInteractive = document.getElementById('envelope-interactive');
  
  // Elementos de música
  const bgAudio = document.getElementById('bg-audio');
  const musicToggle = document.getElementById('music-toggle');
  const musicText = document.getElementById('music-text');
  let isPlaying = false;

  // Compartir
  const btnNativeShare = document.getElementById('btn-native-share');
  const btnWhatsappShare = document.getElementById('btn-whatsapp-share');

  /* ------------------------------------------------------------------------
     1. SISTEMA DE AUDIO (Cumple restricciones de Autoplay de Chrome/Android)
     ------------------------------------------------------------------------ */
  function toggleMusic() {
    if (!isPlaying) {
      bgAudio.play().then(() => {
        isPlaying = true;
        musicText.textContent = 'Pausar';
        musicToggle.classList.add('playing');
      }).catch(err => {
        console.warn('Reproducción bloqueada o archivo de audio aún no añadido:', err);
      });
    } else {
      bgAudio.pause();
      isPlaying = false;
      musicText.textContent = 'Música';
      musicToggle.classList.remove('playing');
    }
  }

  musicToggle.addEventListener('click', toggleMusic);

  /* ------------------------------------------------------------------------
     2. SECUENCIA DE APERTURA DEL SOBRE
     ------------------------------------------------------------------------ */
  let isOpening = false;

  function handleOpenEnvelope() {
    if (isOpening) return;
    isOpening = true;

    // Intentar reproducir música automáticamente tras la interacción táctil
    if (!isPlaying) {
      bgAudio.play().then(() => {
        isPlaying = true;
        musicText.textContent = 'Pausar';
        musicToggle.classList.add('playing');
      }).catch(() => {
        // Si el archivo no existe aún, continúa sin errores
      });
    }

    // Efecto visual: apertura de la solapa
    envelopeInteractive.classList.add('open');

    // Desvanecer Pantalla 1 y mostrar suavemente Pantalla 2
    setTimeout(() => {
      screenEnvelope.style.opacity = '0';
      screenEnvelope.style.transform = 'scale(0.95)';

      setTimeout(() => {
        screenEnvelope.classList.remove('active');
        screenEnvelope.classList.add('hidden');

        screenLetter.classList.remove('hidden');
        screenLetter.classList.add('active');

        // Scroll fluido hacia la cabecera de la carta
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });

        // Activar observador para el texto progresivo
        initScrollObserver();
      }, 700);

    }, 1100);
  }

  // Permitir abrir haciendo clic tanto en el botón como en el propio sobre
  openBtn.addEventListener('click', handleOpenEnvelope);
  envelopeInteractive.addEventListener('click', handleOpenEnvelope);

  /* ------------------------------------------------------------------------
     3. APARICIÓN PROGRESIVA DE PÁRRAFOS (Intersection Observer)
     ------------------------------------------------------------------------ */
  function initScrollObserver() {
    const fadeElements = document.querySelectorAll('.fade-paragraph');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Una vez visible, dejamos de observar para rendimiento óptimo
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    fadeElements.forEach((el, index) => {
      // Los primeros párrafos aparecen con un ligero retraso escalonado
      if (index < 3) {
        setTimeout(() => {
          el.classList.add('visible');
        }, index * 250);
      } else {
        observer.observe(el);
      }
    });
  }

  /* ------------------------------------------------------------------------
     4. BOTONES PARA COMPARTIR POR CELULAR Y WHATSAPP
     ------------------------------------------------------------------------ */
  const customMessage = "Mi amor, te hice algo. 💌 Ábrelo cuando estés tranquilo.";

  // Compartir nativo (Web Share API)
  btnNativeShare.addEventListener('click', async () => {
    const currentUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Para mi principito de ojitos bonitos 🤍',
          text: customMessage,
          url: currentUrl
        });
      } catch (err) {
        // Compartir cancelado por el usuario
      }
    } else {
      // Fallback: Copiar enlace al portapapeles
      try {
        await navigator.clipboard.writeText(`${customMessage} ${currentUrl}`);
        alert('Enlace copiado al portapapeles 🤍');
      } catch (err) {
        alert('Copia este enlace de tu navegador para enviárselo.');
      }
    }
  });

  // Botón directo a WhatsApp
  btnWhatsappShare.addEventListener('click', () => {
    const currentUrl = window.location.href;
    const fullText = encodeURIComponent(`${customMessage}\n\n${currentUrl}`);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${fullText}`;
    window.open(whatsappUrl, '_blank');
  });

  /* ------------------------------------------------------------------------
     5. PARTÍCULAS DE LUZ EN CANVAS (Muy delicadas y sutiles)
     ------------------------------------------------------------------------ */
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const PARTICLE_COUNT = 32;

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 2 + 0.6;
      this.speedY = -(Math.random() * 0.35 + 0.15);
      this.speedX = (Math.random() - 0.5) * 0.25;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.fade = Math.random() * 0.006 + 0.003;
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.alpha += this.fade;

      if (this.alpha > 0.65 || this.alpha < 0.1) {
        this.fade = -this.fade;
      }

      if (this.y < 0 || this.x < 0 || this.x > width) {
        this.reset();
        this.y = height + 10;
      }
    }

    draw() {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(197, 168, 128, ${this.alpha})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(197, 168, 128, 0.4)';
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  function animateParticles() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animateParticles);
  }

  animateParticles();
});