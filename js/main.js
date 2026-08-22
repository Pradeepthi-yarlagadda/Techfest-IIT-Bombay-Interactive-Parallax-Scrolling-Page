/**
 * ==========================================================================
 * TECHFEST 2026 // ACTIVITY-3: MAIN INTERACTIVE CONTROLLER
 * Theme engine, X-Ray scanner lens, 3D tilt cards, certificate minting & shortcuts
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Custom Reticle Cursor
  const cursor = document.querySelector('.custom-cursor');
  if (cursor) {
    window.addEventListener('mousemove', (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    });

    const interactives = document.querySelectorAll('button, a, input, select, .monolith-card, .chapter-node, .theme-pill, .xray-scanner-container');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('active');
        if (window.cyberAudio) window.cyberAudio.playHover();
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('active');
      });
    });
  }

  // 2. Theme Matrix Switcher Engine
  const themePills = document.querySelectorAll('.theme-pill');
  const themes = [
    { name: 'cyan', rgb: { r: 0, g: 243, b: 255 } },
    { name: 'crimson', rgb: { r: 255, g: 0, b: 85 } },
    { name: 'matrix', rgb: { r: 0, g: 255, b: 136 } },
    { name: 'gold', rgb: { r: 255, g: 187, b: 0 } }
  ];

  function applyTheme(themeName) {
    document.body.classList.remove('theme-crimson', 'theme-matrix', 'theme-gold');
    if (themeName !== 'cyan') {
      document.body.classList.add(`theme-${themeName}`);
    }

    themePills.forEach(pill => {
      if (pill.dataset.theme === themeName) pill.classList.add('active');
      else pill.classList.remove('active');
    });

    const currentTheme = themes.find(t => t.name === themeName) || themes[0];
    if (window.canvasFX) {
      window.canvasFX.setThemeRGB(currentTheme.rgb.r, currentTheme.rgb.g, currentTheme.rgb.b);
    }
  }

  themePills.forEach(pill => {
    pill.addEventListener('click', () => {
      const theme = pill.dataset.theme;
      applyTheme(theme);
      if (window.cyberAudio) window.cyberAudio.playClick();
    });
  });

  // 3. Interactive X-Ray Circuit Scanner Lens (Chapter 2)
  const xrayContainer = document.querySelector('.xray-scanner-container');
  const circuitLayer = document.querySelector('.xray-circuit-layer');
  const lensReticle = document.querySelector('.xray-lens-reticle');

  if (xrayContainer && circuitLayer && lensReticle) {
    const updateLensPosition = (clientX, clientY) => {
      const rect = xrayContainer.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, clientY - rect.top));

      const pctX = (x / rect.width * 100).toFixed(1);
      const pctY = (y / rect.height * 100).toFixed(1);

      xrayContainer.style.setProperty('--lens-x', `${pctX}%`);
      xrayContainer.style.setProperty('--lens-y', `${pctY}%`);
    };

    xrayContainer.addEventListener('mousemove', (e) => {
      updateLensPosition(e.clientX, e.clientY);
    });

    xrayContainer.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        updateLensPosition(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });
  }

  // 4. 3D Perspective Tilt for Event Monolith Cards (Chapter 5)
  const monolithCards = document.querySelectorAll('.monolith-card');
  monolithCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -12;
      const rotateY = ((x - centerX) / centerX) * 12;

      card.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(15px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    });

    card.addEventListener('click', () => {
      if (window.cyberAudio) window.cyberAudio.playClick();
    });
  });

  // 5. Audio Synthesizer Toggle & Live FFT Visualizer
  const audioBtn = document.getElementById('btn-audio');
  const eqBars = document.querySelectorAll('.eq-bar');

  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      const isPlaying = window.cyberAudio.toggleAudio();
      if (isPlaying) {
        audioBtn.classList.add('active', 'audio-on');
        audioBtn.querySelector('.btn-label').textContent = 'AUDIO: ON';
      } else {
        audioBtn.classList.remove('active', 'audio-on');
        audioBtn.querySelector('.btn-label').textContent = 'AUDIO: OFF';
      }
    });

    // Animate EQ Bars with real FFT data if available
    function updateVisualizer() {
      requestAnimationFrame(updateVisualizer);
      if (window.cyberAudio && window.cyberAudio.analyser && !window.cyberAudio.isMuted) {
        window.cyberAudio.analyser.getByteFrequencyData(window.cyberAudio.dataArray);
        if (eqBars.length >= 4) {
          eqBars[0].style.height = `${Math.max(3, (window.cyberAudio.dataArray[1] / 255) * 14)}px`;
          eqBars[1].style.height = `${Math.max(3, (window.cyberAudio.dataArray[3] / 255) * 14)}px`;
          eqBars[2].style.height = `${Math.max(3, (window.cyberAudio.dataArray[5] / 255) * 14)}px`;
          eqBars[3].style.height = `${Math.max(3, (window.cyberAudio.dataArray[7] / 255) * 14)}px`;
        }
      }
    }
    updateVisualizer();
  }

  // 6. Auto-Cruise Toggle
  const cruiseBtn = document.getElementById('btn-cruise');
  if (cruiseBtn) {
    cruiseBtn.addEventListener('click', () => {
      if (window.parallax) window.parallax.toggleAutoCruise();
    });
  }

  // 7. Chapter Minimap Node Navigation
  const chapterNodes = document.querySelectorAll('.chapter-node');
  chapterNodes.forEach(node => {
    node.addEventListener('click', (e) => {
      e.preventDefault();
      const chapterIdx = parseInt(node.dataset.chapter) - 1;
      if (window.parallax) window.parallax.scrollToChapter(chapterIdx);
    });
  });

  // 8. Agent Flight Certificate Minting & Offscreen Canvas Export
  const certNameInput = document.getElementById('cert-input-name');
  const certDivSelect = document.getElementById('cert-input-division');
  const certVesselInput = document.getElementById('cert-input-vessel');
  const certPreviewName = document.getElementById('cert-preview-name');
  const certPreviewDiv = document.getElementById('cert-preview-division');
  const certPreviewId = document.getElementById('cert-preview-id');
  const certDownloadBtn = document.getElementById('btn-download-cert');

  // Random Flight Hash
  const generateFlightHash = () => `0xTF26-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  if (certPreviewId) certPreviewId.textContent = generateFlightHash();

  if (certNameInput && certPreviewName) {
    certNameInput.addEventListener('input', (e) => {
      certPreviewName.textContent = e.target.value.toUpperCase() || 'AGENT VOYAGER';
    });
  }

  if (certDivSelect && certPreviewDiv) {
    certDivSelect.addEventListener('change', (e) => {
      certPreviewDiv.textContent = e.target.value.toUpperCase();
    });
  }

  if (certDownloadBtn) {
    certDownloadBtn.addEventListener('click', () => {
      if (window.cyberAudio) window.cyberAudio.playClick();
      exportCertificatePNG();
    });
  }

  function exportCertificatePNG() {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 750;
    const ctx = canvas.getContext('2d');

    const agentName = (certNameInput ? certNameInput.value : 'AGENT VOYAGER') || 'AGENT VOYAGER';
    const division = (certDivSelect ? certDivSelect.value : 'DEEP COSMOS EXPEDITION') || 'DEEP COSMOS EXPEDITION';
    const vessel = (certVesselInput ? certVesselInput.value : 'NEXUS-01 ODYSSEY') || 'NEXUS-01 ODYSSEY';
    const flightId = certPreviewId ? certPreviewId.textContent : '0xTF26-ALPHA';

    // 1. Deep Space Gradient Background
    const bgGrad = ctx.createLinearGradient(0, 0, 1200, 750);
    bgGrad.addColorStop(0, '#02040a');
    bgGrad.addColorStop(0.5, '#071026');
    bgGrad.addColorStop(1, '#010206');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1200, 750);

    // 2. Holographic Cyber Grid Overlay
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 1200; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 750);
      ctx.stroke();
    }
    for (let y = 0; y < 750; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1200, y);
      ctx.stroke();
    }

    // 3. Cyber Neon Border & Corner Brackets
    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00f3ff';
    ctx.strokeRect(30, 30, 1140, 690);
    ctx.shadowBlur = 0;

    // Corner accents
    ctx.fillStyle = '#ff007f';
    ctx.fillRect(25, 25, 30, 8);
    ctx.fillRect(25, 25, 8, 30);
    ctx.fillRect(1145, 25, 30, 8);
    ctx.fillRect(1167, 25, 8, 30);
    ctx.fillRect(25, 717, 30, 8);
    ctx.fillRect(25, 695, 8, 30);
    ctx.fillRect(1145, 717, 30, 8);
    ctx.fillRect(1167, 695, 8, 30);

    // 4. Header & Branding
    ctx.fillStyle = '#00f3ff';
    ctx.font = 'bold 24px "Orbitron", sans-serif';
    ctx.fillText('TECHFEST 2026 // IIT BOMBAY', 60, 90);

    ctx.fillStyle = '#8b949e';
    ctx.font = '14px "Share Tech Mono", monospace';
    ctx.fillText('OFFICIAL CYBER-ODYSSEY FLIGHT CERTIFICATE // CA WEB TASK', 60, 118);

    ctx.fillStyle = '#ff007f';
    ctx.font = 'bold 16px "Share Tech Mono", monospace';
    ctx.fillText(`FLIGHT HASH: ${flightId}`, 880, 90);

    // 5. Main Title & Certify Statement
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px "Orbitron", sans-serif';
    ctx.fillText('SYNTHETIC ASCENT VOYAGER', 60, 220);

    ctx.fillStyle = '#8b949e';
    ctx.font = '18px "Rajdhani", sans-serif';
    ctx.fillText('THIS IS TO CERTIFY THAT THE FOLLOWING OPERATOR HAS SUCCESSFULLY TRAVERSED ALL 5 CYBER DIMENSIONS:', 60, 260);

    // 6. Agent Name Box
    ctx.fillStyle = 'rgba(0, 243, 255, 0.08)';
    ctx.fillRect(60, 290, 1080, 110);
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.3)';
    ctx.strokeRect(60, 290, 1080, 110);

    ctx.fillStyle = '#00f3ff';
    ctx.font = 'bold 52px "Orbitron", sans-serif';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00f3ff';
    ctx.fillText(agentName.toUpperCase(), 90, 368);
    ctx.shadowBlur = 0;

    // 7. Flight Telemetry Metadata Grid
    ctx.fillStyle = '#8b949e';
    ctx.font = '14px "Share Tech Mono", monospace';
    ctx.fillText('SECTOR DIVISION', 60, 450);
    ctx.fillText('FLAGSHIP VESSEL', 420, 450);
    ctx.fillText('PEAK ALTITUDE RECORDED', 780, 450);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "Rajdhani", sans-serif';
    ctx.fillText(division.toUpperCase(), 60, 485);
    ctx.fillText(vessel.toUpperCase(), 420, 485);
    ctx.fillText('+384,000 KM (DEEP COSMOS)', 780, 485);

    // 8. Simulated Barcode & Hologram Seal
    ctx.fillStyle = '#00f3ff';
    for (let i = 0; i < 45; i++) {
      const barW = (i % 3 === 0) ? 5 : (i % 2 === 0) ? 3 : 1.5;
      ctx.fillRect(60 + (i * 8), 580, barW, 45);
    }
    ctx.fillStyle = '#8b949e';
    ctx.font = '12px "Share Tech Mono", monospace';
    ctx.fillText('TECHFEST-IITB-SYNTHETIC-CERT-AUTHENTICATED', 60, 645);

    // Hologram Seal Circle
    ctx.beginPath();
    ctx.arc(1040, 600, 60, 0, Math.PI * 2);
    ctx.strokeStyle = '#ff007f';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#ff007f';
    ctx.font = 'bold 12px "Orbitron", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TECHFEST 2026', 1040, 595);
    ctx.fillText('IIT BOMBAY', 1040, 615);
    ctx.textAlign = 'left';

    // 9. Trigger PNG Download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `Techfest_Parallax_Certificate_${agentName.replace(/\s+/g, '_')}.png`;
    link.href = dataUrl;
    link.click();
  }

  // 9. Keyboard Shortcuts & Keybindings
  window.addEventListener('keydown', (e) => {
    // Prevent overriding if typing in inputs
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    switch (e.key) {
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
        if (window.parallax) window.parallax.scrollToChapter(parseInt(e.key) - 1);
        break;
      case 'c':
      case 'C':
        if (window.parallax) window.parallax.toggleAutoCruise();
        break;
      case 'm':
      case 'M':
        if (audioBtn) audioBtn.click();
        break;
      case 't':
      case 'T':
        // Cycle theme
        const activePill = document.querySelector('.theme-pill.active');
        const currentIdx = activePill ? themes.findIndex(t => t.name === activePill.dataset.theme) : 0;
        const nextTheme = themes[(currentIdx + 1) % themes.length].name;
        applyTheme(nextTheme);
        if (window.cyberAudio) window.cyberAudio.playClick();
        break;
    }
  });
});
