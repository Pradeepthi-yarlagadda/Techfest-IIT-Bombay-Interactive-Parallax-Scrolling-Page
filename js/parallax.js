/**
 * ==========================================================================
 * TECHFEST 2026 // ACTIVITY-3: MULTI-AXIS PARALLAX & PINNED SCRUB ENGINE
 * Hardware-accelerated differential physics, velocity tracking & chapter telemetry
 * ==========================================================================
 */

class ParallaxEngine {
  constructor() {
    this.currentScrollY = window.scrollY;
    this.targetScrollY = window.scrollY;
    this.scrollVelocity = 0;
    this.lastScrollTime = performance.now();
    this.lastScrollY = window.scrollY;

    // Mouse & Gyro Tilt Influences
    this.mouseOffsetX = 0;
    this.mouseOffsetY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;

    // Elements
    this.parallaxElements = [];
    this.pinnedWrapper = null;
    this.mechaParts = {};
    this.calloutTags = [];

    // HUD Telemetry Elements
    this.altMeter = document.getElementById('hud-altitude');
    this.velMeter = document.getElementById('hud-velocity');
    this.chapterNavNodes = document.querySelectorAll('.chapter-node');
    this.navProgressFill = document.querySelector('.nav-progress-fill');

    // Auto Cruise State
    this.isAutoCruising = false;
    this.cruiseSpeed = 3.5;

    // Total Document Height
    this.maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    this.init();
  }

  init() {
    this.gatherElements();
    this.setupListeners();
    this.updateMaxScroll();

    // Start RAF Loop
    requestAnimationFrame((t) => this.renderLoop(t));
  }

  gatherElements() {
    this.parallaxElements = Array.from(document.querySelectorAll('[data-speed]')).map(el => ({
      el,
      speed: parseFloat(el.getAttribute('data-speed')) || 0,
      direction: el.getAttribute('data-direction') || 'vertical', // vertical, horizontal, zoom, 3d
      baseRotate: parseFloat(el.getAttribute('data-rotate')) || 0,
      baseScale: parseFloat(el.getAttribute('data-scale')) || 1,
      section: el.closest('.parallax-section') || el.closest('.pinned-scroll-wrapper')
    }));

    this.pinnedWrapper = document.querySelector('.pinned-scroll-wrapper');
    this.mechaParts = {
      cranium: document.querySelector('.part-cranium'),
      armorLeft: document.querySelector('.part-armor-left'),
      armorRight: document.querySelector('.part-armor-right'),
      reactor: document.querySelector('.part-reactor'),
      chassis: document.querySelector('.part-chassis'),
      scrubFill: document.querySelector('.scrub-fill'),
      scrubPct: document.querySelector('.scrub-pct')
    };

    this.calloutTags = document.querySelectorAll('.callout-tag');
  }

  setupListeners() {
    window.addEventListener('resize', () => {
      this.updateMaxScroll();
      this.gatherElements();
    });

    window.addEventListener('scroll', () => {
      this.targetScrollY = window.scrollY;
    }, { passive: true });

    // Mouse Parallax
    window.addEventListener('mousemove', (e) => {
      this.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 40;
      this.targetMouseY = (e.clientY / window.innerHeight - 0.5) * 40;
    });

    // Mobile Gyroscope Parallax
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', (e) => {
        if (e.gamma !== null && e.beta !== null) {
          this.targetMouseX = (e.gamma / 45) * 30;
          this.targetMouseY = ((e.beta - 45) / 45) * 30;
        }
      });
    }
  }

  updateMaxScroll() {
    this.maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  }

  renderLoop(timestamp) {
    requestAnimationFrame((t) => this.renderLoop(t));

    // Handle Auto Cruise
    if (this.isAutoCruising) {
      this.targetScrollY += this.cruiseSpeed;
      if (this.targetScrollY >= this.maxScroll) {
        this.targetScrollY = this.maxScroll;
        this.toggleAutoCruise(false);
      }
      window.scrollTo(0, this.targetScrollY);
    }

    // Smooth Lerp Physics
    const dt = Math.max(1, timestamp - this.lastScrollTime);
    this.lastScrollTime = timestamp;

    const lerpFactor = 0.12;
    this.currentScrollY += (this.targetScrollY - this.currentScrollY) * lerpFactor;
    this.mouseOffsetX += (this.targetMouseX - this.mouseOffsetX) * 0.08;
    this.mouseOffsetY += (this.targetMouseY - this.mouseOffsetY) * 0.08;

    // Instant Velocity Calculation
    const scrollDelta = this.currentScrollY - this.lastScrollY;
    this.lastScrollY = this.currentScrollY;
    this.scrollVelocity = scrollDelta * (1000 / dt); // px/sec

    // Pass velocity to Canvas FX & Audio
    if (window.canvasFX) {
      window.canvasFX.setScrollVelocity(this.scrollVelocity * 0.05);
    }

    this.updateParallaxLayers();
    this.updatePinnedMechaScrub();
    this.updateHUDTelemetry();
  }

  updateParallaxLayers() {
    const viewHeight = window.innerHeight;
    const scrollCenter = this.currentScrollY + viewHeight / 2;

    for (let item of this.parallaxElements) {
      const { el, speed, direction, baseRotate, baseScale, section } = item;
      if (!section) continue;

      const rect = section.getBoundingClientRect();
      const sectionTop = this.currentScrollY + rect.top;
      const sectionCenter = sectionTop + rect.height / 2;
      const distFromCenter = scrollCenter - sectionCenter;

      // Skip elements far outside viewport
      if (rect.bottom < -200 || rect.top > viewHeight + 200) {
        continue;
      }

      let tx = 0;
      let ty = 0;
      let tz = 0;
      let rot = baseRotate;
      let sc = baseScale;

      if (direction === 'vertical') {
        ty = -distFromCenter * speed;
        tx = this.mouseOffsetX * speed * 0.5;
      } else if (direction === 'horizontal') {
        tx = -distFromCenter * speed + (this.mouseOffsetX * speed);
      } else if (direction === 'zoom') {
        ty = -distFromCenter * speed * 0.5;
        sc = Math.max(0.2, baseScale + (distFromCenter * speed * 0.001));
      } else if (direction === '3d') {
        ty = -distFromCenter * speed;
        tx = this.mouseOffsetX * speed;
        rot = (distFromCenter * speed * 0.05);
      }

      el.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, ${tz}px) rotate(${rot.toFixed(1)}deg) scale(${sc.toFixed(3)})`;
    }
  }

  updatePinnedMechaScrub() {
    if (!this.pinnedWrapper) return;

    const rect = this.pinnedWrapper.getBoundingClientRect();
    const totalDistance = this.pinnedWrapper.offsetHeight - window.innerHeight;

    if (totalDistance <= 0) return;

    // Calculate scrub progress [0, 1]
    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / totalDistance));

    // Update parts based on scrub progress
    const { cranium, armorLeft, armorRight, reactor, chassis, scrubFill, scrubPct } = this.mechaParts;

    if (scrubFill) scrubFill.style.width = `${(progress * 100).toFixed(0)}%`;
    if (scrubPct) scrubPct.textContent = `${(progress * 100).toFixed(0)}%`;

    if (cranium) {
      const craniumY = -progress * 90;
      const craniumRot = progress * 8;
      cranium.style.transform = `translate3d(0, ${craniumY}px, ${progress * 50}px) rotate(${craniumRot}deg)`;
    }

    if (armorLeft) {
      const leftX = -progress * 120;
      const leftRot = -progress * 12;
      armorLeft.style.transform = `translate3d(${leftX}px, 0, ${progress * 30}px) rotate(${leftRot}deg)`;
    }

    if (armorRight) {
      const rightX = progress * 120;
      const rightRot = progress * 12;
      armorRight.style.transform = `translate3d(${rightX}px, 0, ${progress * 30}px) rotate(${rightRot}deg)`;
    }

    if (reactor) {
      const reactorScale = 1 + progress * 0.45;
      reactor.style.transform = `scale(${reactorScale})`;
    }

    if (chassis) {
      const chassisY = progress * 80;
      chassis.style.transform = `translate3d(0, ${chassisY}px, -${progress * 40}px)`;
    }

    // Toggle Callout Labels
    if (this.calloutTags.length > 0) {
      const isExpanded = progress > 0.35;
      this.calloutTags.forEach(tag => {
        if (isExpanded) tag.classList.add('visible');
        else tag.classList.remove('visible');
      });
    }
  }

  updateHUDTelemetry() {
    const progress = Math.max(0, Math.min(1, this.currentScrollY / this.maxScroll));

    // Calculate Altitude Range: -10,000m to +384,000km
    let altitudeStr = "-10,000 M";
    if (progress < 0.25) {
      const alt = Math.round(-10000 + (progress / 0.25) * 10000);
      altitudeStr = `${alt.toLocaleString()} M`;
    } else if (progress < 0.6) {
      const subProg = (progress - 0.25) / 0.35;
      const alt = Math.round(subProg * 50000);
      altitudeStr = `+${alt.toLocaleString()} M`;
    } else if (progress < 0.85) {
      const subProg = (progress - 0.6) / 0.25;
      const alt = Math.round(50000 + subProg * 100000);
      altitudeStr = `+${alt.toLocaleString()} M`;
    } else {
      const subProg = (progress - 0.85) / 0.15;
      const alt = Math.round(150 + subProg * 384000);
      altitudeStr = `+${alt.toLocaleString()} KM`;
    }

    if (this.altMeter) this.altMeter.textContent = altitudeStr;

    // Velocity in KPH
    const velocityKph = Math.round(Math.abs(this.scrollVelocity) * 3.6);
    if (this.velMeter) {
      this.velMeter.textContent = `${velocityKph} KPH`;
      if (velocityKph > 150) {
        this.velMeter.classList.add('warp-active');
      } else {
        this.velMeter.classList.remove('warp-active');
      }
    }

    // Nav Progress Line
    if (this.navProgressFill) {
      this.navProgressFill.style.height = `${(progress * 100).toFixed(1)}%`;
    }

    // Update active chapter node
    const chapterIndex = Math.min(4, Math.floor(progress * 5));
    this.chapterNavNodes.forEach((node, idx) => {
      if (idx === chapterIndex) node.classList.add('active');
      else node.classList.remove('active');
    });

    // Modulate Audio Synthesizer Frequency
    if (window.cyberAudio) {
      window.cyberAudio.updateAltitudeModulation(progress);
    }
  }

  toggleAutoCruise(forceState = null) {
    this.isAutoCruising = forceState !== null ? forceState : !this.isAutoCruising;
    const cruiseBtn = document.getElementById('btn-cruise');
    if (cruiseBtn) {
      if (this.isAutoCruising) {
        cruiseBtn.classList.add('active');
        cruiseBtn.querySelector('.btn-label').textContent = 'CRUISING...';
        if (window.cyberAudio) window.cyberAudio.playAscent();
      } else {
        cruiseBtn.classList.remove('active');
        cruiseBtn.querySelector('.btn-label').textContent = 'AUTO-CRUISE';
      }
    }
  }

  scrollToChapter(index) {
    const chapters = document.querySelectorAll('.parallax-section, .pinned-scroll-wrapper');
    if (chapters[index]) {
      const targetY = chapters[index].offsetTop;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
      if (window.cyberAudio) window.cyberAudio.playClick();
    }
  }
}

window.parallax = new ParallaxEngine();
