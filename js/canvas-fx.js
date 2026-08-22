/**
 * ==========================================================================
 * TECHFEST 2026 // ACTIVITY-3: 60 FPS HTML5 CANVAS ENGINE
 * Multi-depth starfields, quantum particle nodes & warp-speed relativistic streaks
 * ==========================================================================
 */

class CanvasFXEngine {
  constructor() {
    this.bgCanvas = document.getElementById('bg-canvas');
    this.bgCtx = this.bgCanvas ? this.bgCanvas.getContext('2d') : null;

    this.fxCanvas = document.getElementById('fx-canvas');
    this.fxCtx = this.fxCanvas ? this.fxCanvas.getContext('2d') : null;

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Stars & Particles
    this.stars = [];
    this.numStars = 220;
    this.particles = [];
    this.numParticles = 40;

    // Warp FX State
    this.isWarpActive = false;
    this.warpIntensity = 0; // 0 to 1
    this.warpSpeedLines = [];
    this.numWarpLines = 65;

    // Mouse & Scroll Parallax Influences
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    this.scrollVelocityY = 0;

    this.themeColor = { r: 0, g: 243, b: 255 }; // Neo-Cyan default

    this.init();
  }

  init() {
    if (!this.bgCtx || !this.fxCtx) return;
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Generate Stars (3 depth tiers)
    for (let i = 0; i < this.numStars; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        z: Math.random() * 3 + 0.5, // 0.5 = far, 3.5 = near
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2
      });
    }

    // Generate Floating Quantum Data Nodes
    for (let i = 0; i < this.numParticles; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.2,
        life: Math.random() * 100
      });
    }

    // Generate Warp Speed Radial Lines
    for (let i = 0; i < this.numWarpLines; i++) {
      this.warpSpeedLines.push({
        x: (Math.random() - 0.5) * this.width * 2,
        y: (Math.random() - 0.5) * this.height * 2,
        z: Math.random() * this.width,
        prevZ: 0
      });
    }

    window.addEventListener('mousemove', (e) => {
      this.targetMouseX = (e.clientX - this.width / 2) * 0.05;
      this.targetMouseY = (e.clientY - this.height / 2) * 0.05;
    });

    this.animate();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    if (this.bgCanvas && this.bgCtx) {
      this.bgCanvas.width = this.width;
      this.bgCanvas.height = this.height;
    }
    if (this.fxCanvas && this.fxCtx) {
      this.fxCanvas.width = this.width;
      this.fxCanvas.height = this.height;
    }
  }

  setThemeRGB(r, g, b) {
    this.themeColor = { r, g, b };
  }

  setScrollVelocity(v) {
    this.scrollVelocityY = v;
    const absV = Math.abs(v);
    if (absV > 18) {
      this.isWarpActive = true;
      this.warpIntensity = Math.min(1, this.warpIntensity + 0.12);
    } else {
      this.warpIntensity = Math.max(0, this.warpIntensity - 0.05);
      if (this.warpIntensity === 0) {
        this.isWarpActive = false;
      }
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Mouse Lerp
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.08;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.08;

    this.renderBg();
    this.renderFx();
  }

  renderBg() {
    if (!this.bgCtx) return;
    this.bgCtx.clearRect(0, 0, this.width, this.height);

    const { r, g, b } = this.themeColor;

    // Render Multi-Depth Starfield
    for (let star of this.stars) {
      // Dynamic shift based on scroll velocity and mouse position
      star.y -= (0.2 * star.z) + (this.scrollVelocityY * 0.06 * star.z);
      star.x -= this.mouseX * 0.02 * star.z;

      // Wrap around bounds
      if (star.y < 0) star.y = this.height;
      if (star.y > this.height) star.y = 0;
      if (star.x < 0) star.x = this.width;
      if (star.x > this.width) star.x = 0;

      star.twinklePhase += star.twinkleSpeed;
      const alpha = star.alpha * (0.6 + 0.4 * Math.sin(star.twinklePhase));

      this.bgCtx.beginPath();
      this.bgCtx.arc(star.x, star.y, star.size * (star.z * 0.5), 0, Math.PI * 2);
      this.bgCtx.fillStyle = `rgba(${star.z > 2 ? r : 255}, ${star.z > 2 ? g : 255}, ${star.z > 2 ? b : 255}, ${alpha})`;
      this.bgCtx.fill();
    }

    // Render Floating Quantum Data Particles & Constellation Links
    this.bgCtx.lineWidth = 0.5;
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy - (this.scrollVelocityY * 0.03);

      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;

      this.bgCtx.beginPath();
      this.bgCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.bgCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha})`;
      this.bgCtx.shadowBlur = 8;
      this.bgCtx.shadowColor = `rgb(${r}, ${g}, ${b})`;
      this.bgCtx.fill();
      this.bgCtx.shadowBlur = 0;

      // Connect nearby particles with glowing cyber lines
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 100) {
          this.bgCtx.beginPath();
          this.bgCtx.moveTo(p.x, p.y);
          this.bgCtx.lineTo(p2.x, p2.y);
          this.bgCtx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${(1 - dist / 100) * 0.15})`;
          this.bgCtx.stroke();
        }
      }
    }
  }

  renderFx() {
    if (!this.fxCtx) return;
    this.fxCtx.clearRect(0, 0, this.width, this.height);

    if (this.warpIntensity <= 0.01) return;

    const { r, g, b } = this.themeColor;
    const cx = this.width / 2;
    const cy = this.height / 2;
    const warpSpeed = 35 * this.warpIntensity;

    this.fxCtx.lineWidth = 1.5 * this.warpIntensity;

    for (let line of this.warpSpeedLines) {
      line.prevZ = line.z;
      line.z -= warpSpeed;

      if (line.z <= 0) {
        line.z = this.width;
        line.prevZ = line.z;
        line.x = (Math.random() - 0.5) * this.width * 2;
        line.y = (Math.random() - 0.5) * this.height * 2;
      }

      const k = 250 / line.z;
      const px = line.x * k + cx;
      const py = line.y * k + cy;

      const pk = 250 / line.prevZ;
      const prevX = line.x * pk + cx;
      const prevY = line.y * pk + cy;

      if (px >= 0 && px <= this.width && py >= 0 && py <= this.height) {
        this.fxCtx.beginPath();
        this.fxCtx.moveTo(prevX, prevY);
        this.fxCtx.lineTo(px, py);
        this.fxCtx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${this.warpIntensity * 0.8})`;
        this.fxCtx.shadowBlur = 12 * this.warpIntensity;
        this.fxCtx.shadowColor = `rgb(${r}, ${g}, ${b})`;
        this.fxCtx.stroke();
      }
    }
    this.fxCtx.shadowBlur = 0;
  }
}

window.canvasFX = new CanvasFXEngine();
