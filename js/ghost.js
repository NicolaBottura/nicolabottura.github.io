/* ============================================================
   GHOST WIDGET — ghost.js  (Three.js r128, redesigned)
   ============================================================ */
(function () {
  'use strict';

  /* ── 1. Inject HTML ──────────────────────────────────────── */
  const widget = document.createElement('div');
  widget.id = 'ghost-widget';
  widget.innerHTML = `
    <nav id="ghost-nav" role="navigation" aria-label="Ghost navigation">
      <a href="#home"         class="ghost-nav__item"><span class="ghost-nav__num">⌂</span>  Home</a>
      <a href="#about"        class="ghost-nav__item"><span class="ghost-nav__num">01</span> About</a>
      <a href="#publications" class="ghost-nav__item"><span class="ghost-nav__num">02</span> Publications</a>
      <a href="#projects"     class="ghost-nav__item"><span class="ghost-nav__num">03</span> Projects</a>
      <a href="#contact"      class="ghost-nav__item"><span class="ghost-nav__num">04</span> Contact</a>
      <a href="assets/pdf/NicolaBotturaCV.pdf" class="ghost-nav__item ghost-nav__cv" target="_blank" rel="noopener">
        <span class="ghost-nav__num">↓</span> Download CV
      </a>
    </nav>
    <div id="ghost-label">click me!</div>
    <canvas id="ghost-canvas"></canvas>
  `;
  document.body.appendChild(widget);

  const canvas    = document.getElementById('ghost-canvas');
  const ghostNav  = document.getElementById('ghost-nav');
  const ghostLabel = document.getElementById('ghost-label');
  const W = 130, H = 160;
  canvas.width  = W;
  canvas.height = H;
  canvas.style.cssText = `width:${W}px;height:${H}px;cursor:pointer;display:block;background:transparent;`;

  /* ── 2. State ────────────────────────────────────────────── */
  let menuOpen = false;
  let currentSection = 'home';
  const mouse = { x: 0, y: 0 };
  const targetRot  = { x: 0, y: 0 };
  const currentRot = { x: 0, y: 0 };

  /* ── 3. Events (before Three loads) ─────────────────────── */
  canvas.addEventListener('click', () => menuOpen ? closeMenu() : openMenu());
  canvas.setAttribute('tabindex', '0');
  canvas.setAttribute('role', 'button');
  canvas.setAttribute('aria-label', 'Toggle navigation menu');
  canvas.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); menuOpen ? closeMenu() : openMenu(); }
    if (e.key === 'Escape' && menuOpen) closeMenu();
  });
  ghostNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    closeMenu();
    ghostLabel.textContent = 'see ya! 👋';
    setTimeout(() => updateLabel(currentSection), 1800);
  }));
  document.addEventListener('click', e => { if (menuOpen && !widget.contains(e.target)) closeMenu(); });

  function openMenu() {
    menuOpen = true;
    ghostNav.classList.add('open');
    ghostLabel.textContent = 'navigate!';
    ghostLabel.classList.add('active');
  }
  function closeMenu() {
    menuOpen = false;
    ghostNav.classList.remove('open');
    updateLabel(currentSection);
    ghostLabel.classList.remove('active');
  }

  const SECTIONS = [
    { id: 'home',         label: 'click me!',   acc: null      },
    { id: 'about',        label: 'about',        acc: null      },
    { id: 'publications', label: 'publications', acc: 'glasses' },
    { id: 'projects',     label: 'projects',     acc: 'hat'     },
    { id: 'contact',      label: 'say hi! 👋',  acc: 'wink'    },
  ];
  function updateLabel(id) {
    const s = SECTIONS.find(s => s.id === id);
    if (!s) return;
    ghostLabel.textContent = s.label;
    ghostLabel.classList.toggle('active', id !== 'home');
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) onSection(e.target.id); });
  }, { threshold: 0.3 });
  SECTIONS.forEach(s => { const el = document.getElementById(s.id); if (el) observer.observe(el); });

  function onSection(id) {
    if (id === currentSection) return;
    currentSection = id;
    if (!menuOpen) updateLabel(id);
    if (typeof setAccessory === 'function') {
      const s = SECTIONS.find(s => s.id === id);
      setAccessory(s ? s.acc : null);
    }
  }

  document.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x =  ((e.clientX - (r.left + r.width  / 2)) / window.innerWidth)  * 2;
    mouse.y = -((e.clientY - (r.top  + r.height / 2)) / window.innerHeight) * 2;
  }, { passive: true });

  /* ── 4. Load Three.js then init ─────────────────────────── */
  let setAccessory = null;

  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  script.onload = initGhost;
  document.head.appendChild(script);

  function initGhost() {
    const THREE = window.THREE;

    /* Renderer */
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);

    /* Scene & Camera */
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 100);
    camera.position.set(0, 0.1, 6.5);

    /* Lights */
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const key = new THREE.DirectionalLight(0xffeeff, 1.1);
    key.position.set(2, 3, 4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x7f77dd, 0.45);
    rim.position.set(-3, -1, -3);
    scene.add(rim);
    const fill = new THREE.DirectionalLight(0xffffff, 0.3);
    fill.position.set(0, -3, 2);
    scene.add(fill);

    /* ── Materials ── */
    const bodyMat  = new THREE.MeshToonMaterial({ color: 0xe8e5ff, transparent: true, opacity: 0.96 });
    const eyeMat   = new THREE.MeshToonMaterial({ color: 0x111120 });
    const shineMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 });
    const blushMat = new THREE.MeshBasicMaterial({ color: 0xffb3c6, transparent: true, opacity: 0.35, depthWrite: false });
    const darkMat  = new THREE.MeshToonMaterial({ color: 0x111120 });

    /* ── Ghost root ── */
    const root = new THREE.Group();
    scene.add(root);

    /* ────────────────────────────────────────────────
       BODY — one unified shape:
       top hemisphere + cylinder torso + wavy skirt
    ──────────────────────────────────────────────── */
    const bodyGroup = new THREE.Group();
    root.add(bodyGroup);

    /* Top dome — upper half sphere */
    const domeMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.0, 40, 40, 0, Math.PI * 2, 0, Math.PI / 2),
      bodyMat
    );
    domeMesh.position.y = 0.55;
    bodyGroup.add(domeMesh);

    /* Torso — cylinder that connects dome to skirt */
    const torsoMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1.0, 1.0, 1.1, 40),
      bodyMat
    );
    torsoMesh.position.y = 0.0;
    bodyGroup.add(torsoMesh);

    /* Skirt wave — built with a custom BufferGeometry ring */
    (function buildSkirt() {
      const segs     = 60;
      const radius   = 1.0;
      const baseY    = -0.55;
      const positions = [];
      const indices   = [];

      for (let i = 0; i <= segs; i++) {
        const theta = (i / segs) * Math.PI * 2;
        const cos   = Math.cos(theta);
        const sin   = Math.sin(theta);
        /* sine wave creates the scalloped hem */
        const wave  = Math.sin(theta * 5) * 0.18;

        /* outer edge (hem) */
        positions.push(cos * radius, baseY - 0.42 + wave, sin * radius);
        /* inner edge (joins torso bottom) */
        positions.push(cos * radius, baseY, sin * radius);
      }
      for (let i = 0; i < segs; i++) {
        const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
        indices.push(a, b, c,  b, d, c);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geo.setIndex(indices);
      geo.computeVertexNormals();

      const skirt = new THREE.Mesh(geo, bodyMat);
      bodyGroup.add(skirt);
    })();

    /* ── Eyes (parented to root for rotation) ── */
    function makeEye(x) {
      const g = new THREE.Group();
      g.position.set(x, 0.48, 0.92);

      /* Eyeball */
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.175, 28, 28), eyeMat);
      g.add(ball);

      /* White shine */
      const shine = new THREE.Mesh(new THREE.SphereGeometry(0.065, 14, 14), shineMat);
      shine.position.set(0.07, 0.08, 0.13);
      g.add(shine);

      return g;
    }
    const eyeL = makeEye(-0.31);
    const eyeR = makeEye( 0.31);
    root.add(eyeL, eyeR);

    /* ── Blush (subtle, low on cheeks) ── */
    const blushGeoBase = new THREE.SphereGeometry(0.22, 20, 10);
    function makeBlush(x) {
      const b = new THREE.Mesh(blushGeoBase, blushMat);
      b.scale.set(1.5, 0.55, 0.6);
      b.position.set(x, 0.22, 0.88);
      return b;
    }
    root.add(makeBlush(-0.62), makeBlush(0.62));

    /* ── Smile (torus arc) ── */
    const smileGeo = new THREE.TorusGeometry(0.21, 0.032, 10, 22, Math.PI);
    const smile = new THREE.Mesh(smileGeo, darkMat);
    smile.position.set(0, 0.14, 0.97);
    smile.rotation.z = Math.PI;   // open downward = smile
    root.add(smile);

    /* ═══════════════════════════════════
       ACCESSORIES
    ═══════════════════════════════════ */

    /* ── GLASSES ── */
    const glassesGroup = new THREE.Group();
    glassesGroup.visible = false;
    root.add(glassesGroup);

    const rimMat = new THREE.MeshToonMaterial({ color: 0x222235 });
    const lensMat = new THREE.MeshBasicMaterial({
      color: 0x9f97ee, transparent: true, opacity: 0.18,
      side: THREE.DoubleSide, depthWrite: false
    });

    /* Two lens rings — correctly sized and positioned over eyes */
    [eyeL.position, eyeR.position].forEach(pos => {
      /* Lens fill */
      const lens = new THREE.Mesh(new THREE.CircleGeometry(0.18, 32), lensMat);
      lens.position.set(pos.x, pos.y, pos.z + 0.04);
      glassesGroup.add(lens);

      /* Rim torus */
      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(0.185, 0.028, 10, 36),
        rimMat
      );
      rim.position.set(pos.x, pos.y, pos.z + 0.03);
      glassesGroup.add(rim);
    });

    /* Bridge between lenses */
    const bridge = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.22, 8),
      rimMat
    );
    bridge.rotation.z = Math.PI / 2;
    bridge.position.set(0, eyeL.position.y, eyeL.position.z + 0.02);
    glassesGroup.add(bridge);

    /* Temple arms */
    [-1, 1].forEach(side => {
      const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.014, 0.55, 8),
        rimMat
      );
      /* start at outer edge of lens, go back toward ear */
      arm.rotation.z = Math.PI / 2;
      arm.rotation.y = side * -0.55;
      arm.position.set(side * 0.78, eyeL.position.y - 0.02, eyeL.position.z - 0.1);
      glassesGroup.add(arm);
    });

    /* ── HACKER HAT ── */
    const hatGroup = new THREE.Group();
    hatGroup.visible = false;
    root.add(hatGroup);

    const hatBodyMat = new THREE.MeshToonMaterial({ color: 0x0e0e1a });
    const hatBrimMat = new THREE.MeshToonMaterial({ color: 0x1a1a2e });
    const accentMat  = new THREE.MeshBasicMaterial({ color: 0x7f77dd });

    /* Crown — sits on top of the dome */
    const crown = new THREE.Mesh(
      new THREE.CylinderGeometry(0.62, 0.75, 0.7, 36),
      hatBodyMat
    );
    crown.position.set(0, 1.42, 0);
    hatGroup.add(crown);

    /* Brim — flat disc */
    const brim = new THREE.Mesh(
      new THREE.CylinderGeometry(1.05, 1.05, 0.07, 36),
      hatBrimMat
    );
    brim.position.set(0, 1.07, 0);
    hatGroup.add(brim);

    /* Small accent stripe on crown */
    const stripe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.63, 0.63, 0.07, 36),
      accentMat
    );
    stripe.position.set(0, 1.15, 0);
    hatGroup.add(stripe);

    /* ── WINK ── */
    const winkGroup = new THREE.Group();
    winkGroup.visible = false;
    root.add(winkGroup);

    /* Lid — covers right eye */
    const lidMat = new THREE.MeshToonMaterial({ color: 0xe8e5ff });
    const lid = new THREE.Mesh(
      new THREE.SphereGeometry(0.195, 20, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
      lidMat
    );
    lid.position.copy(eyeR.position);
    lid.rotation.x = -Math.PI / 2;
    winkGroup.add(lid);

    /* Eyelash arc over closed eye */
    const lash = new THREE.Mesh(
      new THREE.TorusGeometry(0.155, 0.028, 8, 18, Math.PI),
      darkMat
    );
    lash.position.copy(eyeR.position);
    lash.position.z += 0.05;
    winkGroup.add(lash);

    /* ── Accessor exposed to section observer ── */
    setAccessory = function(name) {
      glassesGroup.visible = (name === 'glasses');
      hatGroup.visible     = (name === 'hat');
      winkGroup.visible    = (name === 'wink');
      eyeR.visible         = (name !== 'wink');
      /* tweak smile for wink */
      smile.rotation.z = (name === 'wink') ? Math.PI * 1.07 : Math.PI;
    };

    /* ── Animation loop ── */
    const clock = new THREE.Clock();
    let blinkTimer = 0;
    let isBlinking = false;
    const BLINK_EVERY = 4.2;

    function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      /* Float — gentle sine */
      root.position.y = Math.sin(t * 1.75) * 0.10;

      /* Idle z sway */
      root.rotation.z = Math.sin(t * 0.85) * 0.035;

      /* Look toward cursor */
      targetRot.y =  mouse.x * 0.42;
      targetRot.x = -mouse.y * 0.28;
      currentRot.x += (targetRot.x - currentRot.x) * 0.07;
      currentRot.y += (targetRot.y - currentRot.y) * 0.07;
      root.rotation.x = currentRot.x;
      root.rotation.y = currentRot.y;

      /* Blink */
      blinkTimer += 0.016;
      if (!isBlinking && blinkTimer > BLINK_EVERY) {
        isBlinking = true;
        blinkTimer = 0;
        eyeL.scale.y = 0.07;
        if (eyeR.visible) eyeR.scale.y = 0.07;
        setTimeout(() => {
          eyeL.scale.y = 1;
          eyeR.scale.y = 1;
          isBlinking = false;
        }, 110);
      }

      renderer.render(scene, camera);
    }
    animate();

    /* Hover glow */
    canvas.addEventListener('mouseenter', () => {
      bodyMat.emissive = new THREE.Color(0x4a44a0);
      bodyMat.emissiveIntensity = 0.12;
    });
    canvas.addEventListener('mouseleave', () => {
      bodyMat.emissiveIntensity = 0;
    });
  }
})();