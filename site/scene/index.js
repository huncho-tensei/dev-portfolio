// The scene app: the whole pixel block. The court, the player, the neighbourhood, the cards and the chat.
//
// This is the example Hawi approved, kept in one piece so nothing drifts from what he saw. It is
// built from simple shapes and animated in code: no models, no clips. Block.tsx renders the fixed
// elements (#stage, #cap, #card, #chat ...) and this file brings them to life. Every word shown
// comes from content/site.ts; nothing below holds a sentence.

import * as THREE from 'three';

let running = null;

/**
 * Starts the scene inside `root`. Returns a function for the caller to keep (the page never
 * unmounts, so it does nothing), or null if this browser cannot draw the scene.
 */
export function mountBlock(root, content, headlines) {
  if (running) return running;
  const V3 = THREE.Vector3;
  const stage = root.querySelector('#stage');
  const params = new URLSearchParams(location.search);
  if (!stage) return null;

  // ---------- palette ----------
  const C = {
    skin: 0x5e3a24, hair: 0x120d0b,
    jersey: 0xc22a2a, trim: 0xf2efe6, shorts: 0x1b1b1f, band: 0x1f7a4d,
    sock: 0xf2efe6, shoe: 0xf5f2ea, sole: 0xc22a2a,
    ball: 0xd9651c, seam: 0x2a1508,
    court: '#2f8a5f', courtDark: '#2a7d56', key: '#c9623a', line: '#f3efe2',
    pole: 0x3b3f46, board: 0xf3efe2, rim: 0xe2531c, net: 0xffffff,
    cone: 0xf08a1c, coneBand: 0xf3efe2, bottle: 0x2d8fd0,
  };

  // ---------- renderer and low-res pipeline ----------
  // Ask the browser first, so a machine without WebGL gets the text version and a clean console.
  const probe = document.createElement('canvas');
  if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) return null;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, premultipliedAlpha: true });
  } catch {
    return null;                                   // no WebGL: the page keeps its text version
  }
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 160);
  const CAM_DIR = new V3(0.424, 0.53, 0.73).normalize();

  let target = new THREE.WebGLRenderTarget(4, 4, {
    minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter,
    type: THREE.HalfFloatType, depthBuffer: true,
  });

  const BAYER = /* glsl */`
    float bayer4(vec2 p) {
      ivec2 i = ivec2(mod(p, 4.0));
      const float m[16] = float[16](0.,8.,2.,10., 12.,4.,14.,6., 3.,11.,1.,9., 15.,7.,13.,5.);
      return (m[i.x + i.y * 4] + 0.5) / 16.0;
    }
    float hash12(vec2 p) {
      vec3 p3 = fract(vec3(p.xyx) * .1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }
  `;

  // Final pass: limit the colours and dither the in-between shades.
  const postMat = new THREE.ShaderMaterial({
    uniforms: { tDiffuse: { value: null }, levels: { value: 6.0 }, strength: { value: 0.5 } },
    vertexShader: /* glsl */`varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: /* glsl */`
      uniform sampler2D tDiffuse; uniform float levels; uniform float strength; varying vec2 vUv;
      ${BAYER}
      void main() {
        vec4 c = texture2D(tDiffuse, vUv);
        if (c.a < 0.5) { gl_FragColor = vec4(0.0); return; }
        vec3 col = pow(max(c.rgb, 0.0), vec3(1.0 / 2.2));
        float b = bayer4(gl_FragCoord.xy) - 0.5;
        // step the brightness, keep the hue, so each material stays one family of colours
        float v = max(col.r, max(col.g, col.b));
        float vq = floor(v * levels + 0.5 + b * strength) / levels;
        col *= vq / max(v, 1e-4);
        gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
      }`,
    depthTest: false, depthWrite: false, transparent: true,
  });
  const postScene = new THREE.Scene();
  const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMat));

  function resize() {
    const cssW = stage.clientWidth || window.innerWidth, cssH = stage.clientHeight || window.innerHeight;
    const narrow = cssW < 560;
    const dpr = window.devicePixelRatio || 1;
    const chunk = narrow ? Math.max(2, Math.round(1.5 * dpr)) / dpr : (cssW > 1900 ? 4 : 3);
    const w = Math.ceil(cssW / chunk), h = Math.ceil(cssH / chunk);
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = `${w * chunk}px`;
    renderer.domElement.style.height = `${h * chunk}px`;
    target.setSize(w, h);
    view.aspect = w / h;
    view.startHalfH = Math.max(2.9, 3.1 / view.aspect);   // the court always fits across
    view.endHalfH = Math.max(10.4, 14.3 / view.aspect);   // the whole block fits across
    frame();
  }

  // ---------- light ----------
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb0a898, 1.75));
  const sun = new THREE.DirectionalLight(0xfff4e0, 2.0);
  sun.position.set(-11, 16, 13); sun.target.position.set(-3, 0, -3); scene.add(sun.target);
  sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096);
  if (window.innerWidth < 560) sun.shadow.mapSize.set(2048, 2048);   // phones: a quarter of the shadow work
  sun.shadow.camera.left = -20; sun.shadow.camera.right = 20;
  sun.shadow.camera.top = 20; sun.shadow.camera.bottom = -20;
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 70;
  sun.shadow.radius = 3; sun.shadow.bias = -0.0015; sun.shadow.normalBias = 0.02;
  scene.add(sun);

  // ---------- helpers ----------
  const lam = (color, extra = {}) => new THREE.MeshLambertMaterial({ color, ...extra });
  function mesh(geo, mat, parent, cast = true) {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = cast; m.receiveShadow = false;
    if (parent) parent.add(m);
    return m;
  }
  // A limb piece: a unit-height tapered cylinder that we stretch between two points.
  function limb(rA, rB, mat, parent) {
    const g = new THREE.CylinderGeometry(rB, rA, 1, 8, 1); // top radius is the far end
    return mesh(g, mat, parent);
  }
  const Y = new V3(0, 1, 0), _d = new V3();
  function place(m, a, b) {
    _d.subVectors(b, a);
    const len = Math.max(_d.length(), 1e-4);
    m.position.copy(a).addScaledVector(_d, 0.5);
    m.scale.y = len;
    m.quaternion.setFromUnitVectors(Y, _d.divideScalar(len));
  }
  const _dir = new V3(), _perp = new V3();
  function ik2(root, tgt, l1, l2, pole, mid, end) {
    _dir.subVectors(tgt, root);
    let dist = _dir.length();
    const maxD = (l1 + l2) * 0.998;
    if (dist > maxD) dist = maxD;
    _dir.normalize();
    const a = (l1 * l1 - l2 * l2 + dist * dist) / (2 * dist);
    const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    _perp.copy(pole).addScaledVector(_dir, -pole.dot(_dir)).normalize();
    mid.copy(root).addScaledVector(_dir, a).addScaledVector(_perp, h);
    end.copy(root).addScaledVector(_dir, dist);
  }
  const clamp01 = (x) => Math.min(1, Math.max(0, x));
  const sstep = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const lerp = (a, b, t) => a + (b - a) * t;
  const softmax = (a, b, k) => 0.5 * (a + b + Math.sqrt((a - b) * (a - b) + k * k));

  // ---------- the slab of court ----------
  const SLAB = { cx: -0.5, size: 8, rx: 2.95, rz: 2.3 };
  const HOOP = { poleX: -2.62, boardX: -2.2, rimX: -1.85, rimY: 3.05 };

  function courtTexture() {
    const N = 1024, cv = document.createElement('canvas');
    cv.width = cv.height = N;
    const g = cv.getContext('2d');
    const s = N / SLAB.size;
    g.fillStyle = C.court; g.fillRect(0, 0, N, N);
    // light speckle so flat paint picks up a little grain
    for (let i = 0; i < 5000; i++) {
      g.fillStyle = Math.random() < 0.5 ? C.courtDark : '#35966a';
      g.fillRect(Math.random() * N, Math.random() * N, 3, 3);
    }
    g.save();
    g.scale(s, s);
    g.translate(SLAB.size / 2 - SLAB.cx, SLAB.size / 2); // now in metres: x right, z down
    const lw = 0.075;
    g.lineWidth = lw; g.strokeStyle = C.line; g.lineCap = 'butt';
    const baseX = -2.4, keyEnd = -0.25, keyHalf = 1.0;
    // painted key
    g.fillStyle = C.key; g.fillRect(baseX, -keyHalf, keyEnd - baseX, keyHalf * 2);
    g.strokeRect(baseX, -keyHalf, keyEnd - baseX, keyHalf * 2);
    // free throw circle
    g.beginPath(); g.arc(keyEnd, 0, 1.0, -Math.PI / 2, Math.PI / 2); g.stroke();
    g.setLineDash([0.22, 0.2]);
    g.beginPath(); g.arc(keyEnd, 0, 1.0, Math.PI / 2, Math.PI * 1.5); g.stroke();
    g.setLineDash([]);
    // baseline
    g.beginPath(); g.moveTo(baseX, -4); g.lineTo(baseX, 4); g.stroke();
    // small arc under the rim
    g.beginPath(); g.arc(HOOP.rimX, 0, 0.62, -Math.PI / 2, Math.PI / 2); g.stroke();
    // three point arc
    g.beginPath(); g.arc(HOOP.rimX, 0, 3.45, -Math.PI / 2, Math.PI / 2); g.stroke();
    g.restore();
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }

  const slabMat = new THREE.MeshLambertMaterial({ map: courtTexture() });
  slabMat.onBeforeCompile = (sh) => {
    sh.uniforms.uSlab = { value: new THREE.Vector3(SLAB.size, SLAB.rx, SLAB.rz) };
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\nuniform vec3 uSlab;\n${BAYER}`)
      .replace('#include <map_fragment>', /* glsl */`
        #include <map_fragment>
        {
          vec2 q = (vMapUv - 0.5) * uSlab.x;
          float e = length(vec2(q.x / uSlab.y, q.y / uSlab.z));
          float ang = atan(q.y, q.x);
          e += 0.035 * sin(ang * 3.0 + 1.3) + 0.025 * sin(ang * 7.0 + 0.4);
          float keep = 1.0 - smoothstep(0.78, 1.0, e);
          // scattered dots at the rim: compare against per-pixel noise
          if (keep <= hash12(floor(gl_FragCoord.xy))) discard;
        }`);
  };
  const slab = new THREE.Mesh(new THREE.PlaneGeometry(SLAB.size, SLAB.size), slabMat);
  slab.rotation.x = -Math.PI / 2;
  slab.position.set(SLAB.cx, 0, 0);
  slab.receiveShadow = true;
  scene.add(slab);

  // ---------- hoop ----------
  const net = (function buildHoop() {
    const g = new THREE.Group(); scene.add(g);
    const poleMat = lam(C.pole);
    const pole = mesh(new THREE.CylinderGeometry(0.07, 0.085, 3.45, 8), poleMat, g);
    pole.position.set(HOOP.poleX, 1.725, 0);
    const base = mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.1, 10), poleMat, g);
    base.position.set(HOOP.poleX, 0.05, 0);
    const arm = mesh(new THREE.BoxGeometry(HOOP.boardX - HOOP.poleX + 0.05, 0.09, 0.09), poleMat, g);
    arm.position.set((HOOP.poleX + HOOP.boardX) / 2, 3.38, 0);
    const brace = limb(0.035, 0.035, poleMat, g);
    place(brace, new V3(HOOP.poleX, 2.75, 0), new V3(HOOP.boardX - 0.02, 3.2, 0));
    const board = mesh(new THREE.BoxGeometry(0.06, 1.0, 1.55), lam(C.board), g);
    board.position.set(HOOP.boardX, 3.42, 0);
    // the painted square on the board
    const sq = lam(C.rim);
    const mk = (w, h, y, z) => { const m = mesh(new THREE.BoxGeometry(0.02, h, w), sq, g, false); m.position.set(HOOP.boardX + 0.035, y, z); };
    mk(0.56, 0.05, 3.5, 0); mk(0.56, 0.05, 3.1, 0); mk(0.05, 0.42, 3.3, -0.28); mk(0.05, 0.42, 3.3, 0.28);
    const rim = mesh(new THREE.TorusGeometry(0.23, 0.022, 6, 20), lam(C.rim), g);
    rim.rotation.x = Math.PI / 2; rim.position.set(HOOP.rimX, HOOP.rimY, 0);
    const neck = mesh(new THREE.BoxGeometry(HOOP.rimX - 0.23 - HOOP.boardX, 0.04, 0.1), lam(C.rim), g);
    neck.position.set((HOOP.boardX + HOOP.rimX - 0.23) / 2, HOOP.rimY, 0);
    // net: an open cone with every other pixel dropped
    const netMat = new THREE.MeshBasicMaterial({ color: C.net, side: THREE.DoubleSide });
    netMat.onBeforeCompile = (sh) => {
      sh.fragmentShader = sh.fragmentShader.replace('#include <map_fragment>',
        `#include <map_fragment>\n if (mod(floor(gl_FragCoord.x) + floor(gl_FragCoord.y), 2.0) < 0.5) discard;`);
    };
    const net = mesh(new THREE.CylinderGeometry(0.225, 0.13, 0.42, 12, 1, true), netMat, g, false);
    net.position.set(HOOP.rimX, HOOP.rimY - 0.22, 0);
    return net;
  })();

  // ---------- props ----------
  (function buildProps() {
    const g = new THREE.Group(); scene.add(g);
    // training cone
    const cone = mesh(new THREE.CylinderGeometry(0.035, 0.15, 0.36, 10), lam(C.cone), g);
    cone.position.set(-1.5, 0.2, 1.72);
    const foot = mesh(new THREE.BoxGeometry(0.36, 0.035, 0.36), lam(C.cone), g);
    foot.position.set(-1.5, 0.018, 1.72);
    const band = mesh(new THREE.CylinderGeometry(0.083, 0.108, 0.09, 10), lam(C.coneBand), g, false);
    band.position.set(-1.5, 0.2, 1.72);
    // water bottle
    const bottle = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.24, 8), lam(C.bottle), g);
    bottle.position.set(-1.95, 0.12, 1.45);
    const cap = mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.06, 8), lam(C.trim), g, false);
    cap.position.set(-1.95, 0.27, 1.45);
    // spare ball
    const spare = mesh(new THREE.SphereGeometry(0.12, 12, 8), lam(C.ball, { map: ballTexture() }), g);
    spare.position.set(-1.9, 0.12, 1.05); spare.rotation.set(0.6, 0.3, 0.2);
  })();

  function ballTexture() {
    const cv = document.createElement('canvas'); cv.width = 128; cv.height = 64;
    const g = cv.getContext('2d');
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, 128, 64);
    g.strokeStyle = '#3a1c0c'; g.lineWidth = 5;
    g.beginPath(); g.moveTo(0, 32); g.lineTo(128, 32); g.stroke();
    for (const x of [0, 64, 128]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 64); g.stroke(); }
    for (const x of [32, 96]) { g.beginPath(); g.ellipse(x, 32, 13, 30, 0, 0, Math.PI * 2); g.stroke(); }
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
  }

  // ---------- the player ----------
  // Local space: he faces +z, y is up, lengths in metres. He is about two metres tall.
  const L = { thigh: 0.49, shin: 0.47, ankle: 0.1, upper: 0.34, fore: 0.31, hipW: 0.105, shW: 0.225, torso: 0.5 };
  const guy = new THREE.Group();
  guy.position.set(0.55, 0, 0.35);
  guy.rotation.y = 0.2; // three-quarter view, the hoop behind his shoulder
  scene.add(guy);

  const M = {
    skin: lam(C.skin), hair: lam(C.hair), jersey: lam(C.jersey), trim: lam(C.trim, { emissive: 0x4a4844 }),
    shorts: lam(C.shorts), band: lam(C.band), sock: lam(C.sock), shoe: lam(C.shoe), sole: lam(C.sole),
  };

  const body = new THREE.Group(); guy.add(body);          // pelvis
  const spine = new THREE.Group(); spine.position.y = 0.1; body.add(spine);
  const headPivot = new THREE.Group(); headPivot.position.y = L.torso + 0.03; spine.add(headPivot);

  // pelvis and shorts
  const pelvis = mesh(new THREE.BoxGeometry(0.33, 0.2, 0.22), M.shorts, body);
  pelvis.position.y = 0.02;
  const waist = mesh(new THREE.BoxGeometry(0.325, 0.05, 0.215), M.band, body, false);
  waist.position.y = 0.115;

  // torso: a box that widens to the shoulders
  (function () {
    const g = new THREE.BoxGeometry(1, 1, 1, 1, 2, 1);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const t = p.getY(i) + 0.5; // 0 at waist, 1 at shoulders
      const w = lerp(0.3, 0.45, Math.pow(t, 0.8)), d = lerp(0.19, 0.225, t);
      p.setXYZ(i, p.getX(i) * w, t * (L.torso + 0.02), p.getZ(i) * d);
    }
    g.computeVertexNormals();
    mesh(g, M.jersey, spine);
    // number plates front and back, trim at the neck
    const plateF = mesh(new THREE.BoxGeometry(0.15, 0.17, 0.012), M.trim, spine, false);
    plateF.position.set(0, 0.3, 0.108);
    const plateB = mesh(new THREE.BoxGeometry(0.17, 0.19, 0.012), M.trim, spine, false);
    plateB.position.set(0, 0.3, -0.108);
    const collar = mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.035, 8), M.trim, spine, false);
    collar.position.set(0, L.torso + 0.02, 0);
  })();

  // neck, head, afro
  const neck = mesh(new THREE.CylinderGeometry(0.048, 0.055, 0.12, 8), M.skin, headPivot);
  neck.position.y = 0.04;
  const head = new THREE.Group(); head.position.y = 0.21; head.scale.setScalar(1.12); headPivot.add(head);
  const skull = mesh(new THREE.SphereGeometry(0.108, 12, 10), M.skin, head);
  skull.scale.set(0.9, 1.12, 0.98);
  const jaw = mesh(new THREE.SphereGeometry(0.075, 10, 8), M.skin, head, false);
  jaw.position.set(0, -0.07, 0.02); jaw.scale.set(0.95, 0.9, 1.0);
  const afro = mesh(new THREE.SphereGeometry(0.128, 12, 10), M.hair, head);
  afro.position.set(0, 0.085, -0.045); afro.scale.set(0.96, 0.8, 0.96);
  for (const sx of [-1, 1]) {
    const ear = mesh(new THREE.SphereGeometry(0.026, 6, 5), M.skin, head, false);
    ear.position.set(sx * 0.098, -0.005, 0.0);
  }
  // limbs: placed between joints every frame
  function makeArm() {
    return {
      shoulder: mesh(new THREE.SphereGeometry(0.062, 8, 6), M.skin, guy),
      upper: limb(0.052, 0.042, M.skin, guy),
      elbow: mesh(new THREE.SphereGeometry(0.042, 8, 6), M.skin, guy),
      fore: limb(0.042, 0.033, M.skin, guy),
      band: limb(0.037, 0.036, M.trim, guy),
      hand: mesh(new THREE.BoxGeometry(0.085, 1, 0.04), M.skin, guy),
      S: new V3(), E: new V3(), W: new V3(), T: new V3(), H: new V3(), ctrl: 0,
    };
  }
  function makeLeg() {
    return {
      shortLeg: limb(0.092, 0.085, M.shorts, guy),
      thigh: limb(0.074, 0.056, M.skin, guy),
      knee: mesh(new THREE.SphereGeometry(0.056, 8, 6), M.skin, guy),
      shin: limb(0.054, 0.04, M.skin, guy),
      sock: limb(0.047, 0.044, M.sock, guy),
      shoe: new THREE.Group(),
      Hp: new V3(), K: new V3(), A: new V3(), T: new V3(), fv: 1,
      wp: new V3(), from: new V3(), to: new V3(), wyaw: 0, yawFrom: 0, yawTo: 0, lift: 0, off: new V3(),
    };
  }
  const arms = { 1: makeArm(), [-1]: makeArm() };
  const legs = { 1: makeLeg(), [-1]: makeLeg() };
  for (const a of [1, -1]) {
    const sh = legs[a].shoe; guy.add(sh);
    const upper = mesh(new THREE.BoxGeometry(0.11, 0.085, 0.28), M.shoe, sh);
    upper.position.set(0, -0.035, 0.06);
    const toe = mesh(new THREE.BoxGeometry(0.11, 0.06, 0.07), M.shoe, sh, false);
    toe.position.set(0, -0.048, 0.2);
    const sole = mesh(new THREE.BoxGeometry(0.118, 0.03, 0.34), M.sole, sh, false);
    sole.position.set(0, -0.085, 0.075);
  }

  // ball
  const BR = 0.12;
  const ball = mesh(new THREE.SphereGeometry(BR, 14, 10), lam(C.ball, { map: ballTexture() }), scene);


  // ---------- dribble state ----------
  const H_NORMAL = 0.7, H_LOW = 0.53, T_NORMAL = 0.6, T_CROSS = 0.47, POW = 2.25;
  const st = {
    t: 0, p: 0, side: 1, cross: false, queued: false, count: 0, nextAt: 5,
    Hs: H_NORMAL, He: H_NORMAL, T: T_NORMAL, spin: 0, smSide: 1,
  };

  // ---------- getting around the court ----------
  const IDLE_YAW = 0.2, VMAX = 2.25, ACC = 7, DEC = 5.5, TURN = 7, STEP_T = 0.26, LEAD = 0.13;
  const mv = {
    mode: 'idle',                  // idle | move | plant | shot | turn
    yaw: IDLE_YAW, yawTarget: IDLE_YAW, speed: 0, run: 0, vel: new V3(), dest: new V3(),
    dot: -1, queued: -1, loco: false, far: false, quiet: 0,
  };
  const gait = { active: false, foot: 1, last: -1, u: 0, T: STEP_T, h: 0.1 };
  const angDiff = (a, b) => { let d = (a - b) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; };
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const hoopYaw = (p) => Math.atan2(HOOP.rimX - p.x, 0 - p.z);
  const _l = new V3(), _w = new V3();

  // where a foot wants to be, in local space, while he is travelling or turning
  function restLoco(a, out) {
    const back = a * st.side;
    return out.set(a * (lerp(0.27, 0.14, mv.run) - 0.01 * back), 0, (-0.04 - 0.16 * back) * (1 - 0.7 * mv.run));
  }
  // the same spot in the world a little into the future; returns the heading he will have then
  function desiredFoot(a, tau, out) {
    const lead = mv.speed > 0.2 ? tau + LEAD : 0;
    const yawP = mv.yaw + clamp(angDiff(mv.yawTarget, mv.yaw), -TURN * tau, TURN * tau);
    restLoco(a, _l);
    const c = Math.cos(yawP), s = Math.sin(yawP);
    out.set(guy.position.x + mv.vel.x * lead + _l.x * c + _l.z * s, 0, guy.position.z + mv.vel.z * lead - _l.x * s + _l.z * c);
    return yawP;
  }
  function footErr(a) {
    const yawP = desiredFoot(a, 0, _w);
    const lg = legs[a];
    return Math.hypot(lg.wp.x - _w.x, lg.wp.z - _w.z) + 0.12 * Math.abs(angDiff(yawP + a * 0.22, lg.wyaw));
  }
  function startLoco() {
    const c = Math.cos(mv.yaw), s = Math.sin(mv.yaw);
    for (const a of [1, -1]) {
      const lg = legs[a];
      lg.wp.set(guy.position.x + lg.T.x * c + lg.T.z * s, 0, guy.position.z - lg.T.x * s + lg.T.z * c);
      lg.wyaw = mv.yaw + a * 0.22; lg.lift = 0;
    }
    gait.active = false; mv.loco = true;
  }
  function endLoco() {
    const c = Math.cos(mv.yaw), s = Math.sin(mv.yaw);
    for (const a of [1, -1]) {
      const lg = legs[a];
      const dx = lg.wp.x - guy.position.x, dz = lg.wp.z - guy.position.z;
      const back = a * st.side;
      lg.off.set(dx * c - dz * s - a * (0.27 - 0.01 * back), 0, dx * s + dz * c - (-0.04 - 0.16 * back));
    }
    mv.loco = false;
  }
  function updateGait(dt) {
    if (!mv.loco) return;
    if (gait.active) {
      gait.u += dt / gait.T;
      const lg = legs[gait.foot], u = Math.min(1, gait.u);
      const yawP = desiredFoot(gait.foot, (1 - u) * gait.T, lg.to);
      lg.yawTo = lg.yawFrom + angDiff(yawP + gait.foot * 0.22, lg.yawFrom);
      const e = u * u * (3 - 2 * u);
      lg.wp.lerpVectors(lg.from, lg.to, e);
      lg.wyaw = lerp(lg.yawFrom, lg.yawTo, e);
      lg.lift = gait.h * Math.sin(Math.PI * u);
      if (gait.u >= 1) { lg.lift = 0; gait.active = false; gait.last = gait.foot; }
    }
    if (!gait.active && mv.mode !== 'shot') {
      let pick = 0, worst = 0.045;
      for (const a of [-gait.last, gait.last]) {
        const err = footErr(a) * (a === -gait.last ? 1.3 : 1);
        if (err > worst) { worst = err; pick = a; }
      }
      if (pick) {
        const lg = legs[pick];
        gait.active = true; gait.foot = pick; gait.u = 0;
        gait.T = mv.speed > 0.3 ? STEP_T : 0.19;
        lg.from.copy(lg.wp); lg.yawFrom = lg.wyaw;
        desiredFoot(pick, gait.T, lg.to);
        gait.h = clamp(0.045 + 0.11 * lg.from.distanceTo(lg.to), 0.05, 0.14);
      }
    }
  }
  const feetSettled = () => !gait.active && footErr(1) < 0.05 && footErr(-1) < 0.05;

  function shootFrom(x, z) {
    if (sh.active) return;
    mv.dest.set(x, 0, z);
    if (!mv.loco) startLoco();
    mv.far = Math.hypot(mv.dest.x - guy.position.x, mv.dest.z - guy.position.z) > 1.0;
    mv.goal = 'shoot'; mv.mode = 'move'; st.queued = false;
  }
  function updateMove(dt) {
    if (mv.mode === 'move') {
      const dx = mv.dest.x - guy.position.x, dz = mv.dest.z - guy.position.z, d = Math.hypot(dx, dz);
      if (d < 0.015) {
        guy.position.x = mv.dest.x; guy.position.z = mv.dest.z; mv.speed = 0; mv.vel.set(0, 0, 0); mv.mode = mv.goal === 'home' ? 'turn' : 'plant';
      } else {
        const want = Math.min(VMAX, Math.sqrt(2 * DEC * d) + 0.15);
        mv.speed += clamp(want - mv.speed, -ACC * 2 * dt, ACC * dt);
        const step = Math.min(mv.speed * dt, d);
        guy.position.x += (dx / d) * step; guy.position.z += (dz / d) * step;
        mv.vel.set((dx / d) * mv.speed, 0, (dz / d) * mv.speed);
        mv.yawTarget = mv.goal === 'rebound' ? ballYaw() : mv.far && d > 0.75 ? Math.atan2(dx, dz) : (mv.goal === 'home' ? IDLE_YAW : hoopYaw(mv.dest));
      }
    }
    if (mv.mode === 'plant') mv.yawTarget = mv.goal === 'rebound' ? (sh.grabbed ? mv.yaw : ballYaw()) : hoopYaw(guy.position);
    if (mv.mode === 'turn') {
      mv.yawTarget = IDLE_YAW;
      if (Math.abs(angDiff(mv.yawTarget, mv.yaw)) < 0.02 && feetSettled()) { endLoco(); mv.mode = 'idle'; mv.quiet = 0; }
    }
    mv.yaw = angDiff(mv.yaw + clamp(angDiff(mv.yawTarget, mv.yaw), -TURN * dt, TURN * dt), 0);
    mv.run += (mv.speed / VMAX - mv.run) * (1 - Math.exp(-9 * dt));
    guy.rotation.y = mv.yaw;
    updateGait(dt);
  }
  const readyToShoot = () => mv.mode === 'plant' && Math.abs(angDiff(mv.yawTarget, mv.yaw)) < 0.04 && feetSettled();

  // ---------- the jump shot ----------
  const T_REL = 0.58, CATCH = new V3(0.08, 1.08, 0.38);
  const sh = {
    active: false, t: 0, side: 1, phase: 'held', w: 0, relax: 0,
    B0: new V3(), P0: new V3(), P1: new V3(), vy: 0, Tf: 1, tNet: 0, segs: [], seg: 0, tSeg: 0, tCatch: 0,
    closing: false, turned: false, restKind: 'miss', stay: false, chasing: false, tRelax: 0, bv: new V3(), home: new V3(), bounces: 0, tLoose: 0, tPick: 0, grabbed: false, pickL: new V3(),
    ballW: new V3(), netT: 9,
  };
  const ballL = new V3(0.56, 0.82, 0.3);   // where the ball was last, in his own space
  function shotKin(t) {
    const dip = sstep(0, 0.3, t) * (1 - sstep(0.3, 0.52, t));
    const rise = sstep(0.3, T_REL, t);
    const u = (t - 0.42) / 0.52;
    const jy = u > 0 && u < 1 ? 4 * 0.34 * u * (1 - u) : 0;
    const land = 0.07 * Math.exp(-Math.pow((t - 0.99) / 0.07, 2));
    const tall = sstep(0.32, 0.5, t) * (1 - sstep(1.25, 1.7, t));
    return { dip, rise, jy, tall, bodyY: lerp(0.9, 0.99, tall) - 0.2 * dip + jy - land };
  }
  function heldBall(t, k, out) {
    const y1 = k.bodyY + 0.36, y2 = k.bodyY + 1.33, x = sh.side * 0.07;
    if (t < 0.3) { const e = sstep(0, 0.28, t); out.set(lerp(sh.B0.x, x, e), lerp(sh.B0.y, y1, e), lerp(sh.B0.z, 0.3, e)); }
    else out.set(x, lerp(y1, y2, k.rise), lerp(0.3, 0.2, k.rise));
    return out;
  }
  function startShot() {
    sh.active = true; sh.t = 0; sh.side = st.side; sh.phase = 'held'; sh.w = 1; sh.relax = 0;
    sh.chasing = false; sh.grabbed = false; sh.bounces = 0; sh.home.copy(guy.position);
    sh.B0.copy(ballL); st.p = 0; st.cross = false; mv.mode = 'shot';
  }
  const ballYaw = () => Math.atan2(sh.ballW.x - guy.position.x, sh.ballW.z - guy.position.z);
  function updateShot(dt) {
    sh.t += dt; const t = sh.t;
    // after a miss he takes a moment before he turns round
    if (sh.phase === 'rest' && sh.restKind === 'miss' && !sh.turned && t - sh.tRelax > 1.5) { sh.turned = true; mv.goal = 'home'; mv.mode = 'turn'; }
    if (sh.phase === 'held' && t >= T_REL) {
      const k = shotKin(T_REL);
      guy.updateMatrixWorld(true);
      guy.localToWorld(heldBall(T_REL, k, sh.P0));
      if (sh.closing) sh.P1.set(HOOP.rimX + 0.21, HOOP.rimY + 0.04, 0.03);   // the last one catches the front of the rim
      else sh.P1.set(HOOP.rimX, HOOP.rimY + 0.05, 0);
      const d = Math.hypot(sh.P1.x - sh.P0.x, sh.P1.z - sh.P0.z);
      sh.Tf = 0.5 + 0.13 * d;
      sh.vy = (sh.P1.y - sh.P0.y + 4.9 * sh.Tf * sh.Tf) / sh.Tf;
      sh.phase = 'air';
    }
    if (sh.phase === 'air') {
      const tt = t - T_REL, e = Math.min(1, tt / sh.Tf);
      sh.ballW.set(lerp(sh.P0.x, sh.P1.x, e), sh.P0.y + sh.vy * tt - 4.9 * tt * tt, lerp(sh.P0.z, sh.P1.z, e));
      if (tt >= sh.Tf) {
        if (sh.closing) {
          // off the rim: the hoop shakes, the ball leaves the court and he lets his arms drop
          sh.phase = 'rest'; sh.restKind = 'miss'; sh.netT = 0; sh.chasing = true; sh.turned = false; sh.tRelax = t; ball.visible = false;
          if (sh.onClose) sh.onClose();
        } else {
          sh.phase = 'net'; sh.tNet = t; sh.netT = 0;
          if (sh.onMake) sh.onMake();
        }
      }
    }
    if (sh.phase === 'net') {
      const tt = t - sh.tNet;
      const y = sh.P1.y - (1.3 * tt + 4.9 * tt * tt);
      sh.ballW.set(HOOP.rimX + 0.04 * tt, Math.max(BR, y), 0);
      if (y <= BR) {
        // through the net and onto the floor: now it is a loose ball, skipping away to the side
        sh.phase = 'loose'; sh.tLoose = t; sh.bounces = 1; sh.ballW.y = BR;
        sh.bv.set(0.75, 0.5 * (1.3 + 9.8 * tt), 1.0);
      }
    }
    if (sh.phase === 'loose' || (sh.phase === 'pickup' && !sh.grabbed)) {
      const rolling = sh.bv.y === 0 && sh.ballW.y <= BR + 1e-4;
      if (!rolling) sh.bv.y -= 9.8 * dt;
      sh.ballW.addScaledVector(sh.bv, dt);
      if (sh.ballW.y <= BR) {
        sh.ballW.y = BR;
        if (sh.bv.y < 0) {
          sh.bv.y *= -0.5; sh.bounces++; sh.bv.x *= 0.82; sh.bv.z *= 0.82;
          if (sh.bv.y < 0.75) sh.bv.y = 0;                     // too small to bounce again: it rolls
        }
      }
      if (rolling) {
        const h = Math.hypot(sh.bv.x, sh.bv.z), h2 = Math.max(0, h - 1.1 * dt);
        if (h > 0) { sh.bv.x *= h2 / h; sh.bv.z *= h2 / h; }
      }
    }
    if (sh.phase === 'loose') {
      // he watches it drop, then goes after it
      if (!sh.chasing && t - sh.tLoose > 0.12) { sh.chasing = true; sh.tRelax = t; mv.goal = 'rebound'; mv.far = true; }
      if (sh.chasing) {
        const lead = 0.3;
        const tx = sh.ballW.x + sh.bv.x * lead, tz = sh.ballW.z + sh.bv.z * lead;
        const ex = guy.position.x - tx, ez = guy.position.z - tz, ed = Math.hypot(ex, ez) || 1;
        mv.dest.set(tx + (ex / ed) * 0.5, 0, tz + (ez / ed) * 0.5);   // stop half a metre short of it
        const off = Math.hypot(mv.dest.x - guy.position.x, mv.dest.z - guy.position.z);
        if (mv.mode !== 'move' && off > 0.14) mv.mode = 'move';
        const near = Math.hypot(guy.position.x - sh.ballW.x, guy.position.z - sh.ballW.z);
        const low = sh.ballW.y < 0.3 && Math.abs(sh.bv.y) < 1.6;
        if (near < 0.74 && low && sh.bounces >= 3 && Math.abs(angDiff(ballYaw(), mv.yaw)) < 0.6) {
          sh.phase = 'pickup'; sh.tPick = t; sh.grabbed = false;
          mv.dest.copy(guy.position); mv.speed = 0; mv.vel.set(0, 0, 0); mv.mode = 'plant';
        }
      }
    }
    if (sh.phase === 'pickup') {
      const tp = t - sh.tPick;
      if (!sh.grabbed && tp >= 0.3) {                          // hands on it
        sh.grabbed = true;
        guy.updateMatrixWorld(true);
        sh.pickL.copy(guy.worldToLocal(_w.copy(sh.ballW)));
      }
      if (tp >= 0.68) { sh.phase = 'caught'; sh.tCatch = t; }
    }
    if (sh.phase === 'return') {
      let s = sh.segs[sh.seg], tt = t - sh.tSeg;
      while (tt >= s.T && sh.seg < sh.segs.length - 1) { sh.seg++; sh.tSeg += s.T; tt -= s.T; s = sh.segs[sh.seg]; }
      const e = Math.min(1, tt / s.T);
      sh.ballW.set(lerp(s.a.x, s.b.x, e), Math.max(BR, s.a.y + s.vy * tt - 4.9 * tt * tt), lerp(s.a.z, s.b.z, e));
      if (tt >= s.T) { sh.phase = 'caught'; sh.tCatch = t; }
    }
    if (sh.chasing) sh.relax = sstep(0, sh.phase === 'rest' ? 0.7 : 0.4, t - sh.tRelax);
    if (sh.phase === 'caught') {
      const tt = t - sh.tCatch;
      sh.w = 1 - sstep(0.12, 0.36, tt);
      if (tt >= 0.36) {
        sh.active = false; sh.w = 0;
        st.p = 0; st.Hs = st.He = H_NORMAL; st.T = T_NORMAL; st.cross = false; st.count = 0;
        sh.chasing = false;
        if (sh.stay) sh.stay = false;                              // caught where he stands: just carry on
        else { mv.goal = 'home'; mv.dest.copy(sh.home); mv.far = true; mv.mode = 'move'; }   // rebound in hand: dribble back out
      }
    }
  }

  function startCycle() {
    st.Hs = st.He;
    const want = mv.mode === 'idle' && (st.queued || st.count >= st.nextAt);
    if (want) {
      st.cross = true; st.queued = false; st.count = 0;
      st.nextAt = 4 + Math.floor(Math.random() * 4);
      st.He = H_LOW; st.T = T_CROSS;
    } else {
      st.cross = false; st.count++;
      st.He = H_NORMAL + (Math.random() - 0.5) * 0.05;
      st.T = T_NORMAL + (Math.random() - 0.5) * 0.04;
      if (st.Hs < H_NORMAL - 0.1) st.T = 0.52; // the quick first bounce out of a crossover
    }
  }
  function advance(dt) {
    st.t += dt;
    sh.netT += dt;
    for (const a of [1, -1]) legs[a].off.multiplyScalar(Math.exp(-10 * dt));
    updateMove(dt);
    if (sh.active) updateShot(dt);
    else {
      // a click hurries the current bounce so the crossover starts sooner
      const hurry = (st.queued && !st.cross) || mv.mode === 'plant' ? 1.6 : 1;
      st.p += (dt * hurry) / st.T;
      while (st.p >= 1) {
        st.p -= 1;
        if (st.cross) st.side = -st.side;
        if (readyToShoot()) { startShot(); break; }
        startCycle();
      }
    }
    mv.quiet += dt;
  }

  const tmp = { q: new V3(), h: new V3(), ballPos: new V3(), m: new THREE.Matrix4(), v: new V3(), pole: new V3(), tip: new V3(), d: new V3(), w: new V3() };

  function pose() {
    const p = st.p, s = st.side;
    const cx = st.cross ? sstep(0.05, 0.95, p) : 0;       // 0 to 1 across a crossover
    const sideNow = st.cross ? lerp(s, -s, cx) : s;       // which side the weight is on
    st.smSide = sideNow;
    const Hcur = lerp(st.Hs, st.He, sstep(0, 1, p));
    const crouch = clamp01((H_NORMAL - Hcur) / (H_NORMAL - H_LOW));
    const run = mv.run, w = sh.w;
    const K = sh.active ? shotKin(sh.t) : null;
    const inHands = sh.active && (sh.phase === 'held' || sh.phase === 'caught' || (sh.phase === 'pickup' && sh.grabbed));
    // the miss: he looks up at it with his hands on his head, then lets it go
    const missT = sh.active && sh.phase === 'rest' && sh.restKind === 'miss' ? sh.t - sh.tRelax : -1;
    const mUp = missT < 0 ? 0 : sstep(0.1, 0.45, missT), mDown = missT < 0 ? 0 : sstep(1.5, 2.1, missT), mBack = missT < 0 ? 0 : sstep(2.4, 3.1, missT);
    if (K && missT >= 0) {
      K.bodyY += 0.006 * Math.sin(st.t * 2.2) - 0.05 * mUp * (1 - mDown) - 0.03 * mDown * (1 - mBack);
      K.lean = -0.13 * mUp * (1 - mDown) + 0.14 * mDown * (1 - mBack);
    }
    if (K && sh.phase === 'pickup') {
      const tp = sh.t - sh.tPick, bend = sstep(0, 0.26, tp) * (1 - sstep(0.36, 0.66, tp));
      K.bodyY -= 0.42 * bend; K.lean = 0.9 * bend;
    }

    // ----- ball: fast at the floor, slow at the top -----
    const H = p < 0.5 ? st.Hs : st.He;
    const q = p < 0.5 ? 2 * p : 2 - 2 * p;                // 0 at the hand, 1 at the floor
    const by = BR + H * (1 - Math.pow(q, POW));
    let bx, bz;
    if (st.cross) {
      bx = lerp(s * 0.56, -s * 0.56, p * 0.75 + 0.25 * sstep(0, 1, p));
      bz = 0.3 + 0.14 * Math.sin(Math.PI * p);
    } else {
      bx = s * (0.56 + 0.015 * Math.sin(st.t * 1.7)) * (1 - 0.3 * run);
      bz = 0.3 + 0.02 * Math.sin(st.t * 1.1) + 0.16 * run;
    }
    const squash = 1 - 0.22 * Math.exp(-Math.pow((p - 0.5) / 0.035, 2));
    const ballTop = by + BR;
    ballL.set(bx, by - BR * (1 - squash), bz);
    let sq = squash;
    if (sh.active) {
      sq = 1;
      if (sh.phase === 'held') heldBall(sh.t, K, ballL);
      else if (sh.phase === 'caught') {
        const e = 1 - w;
        ballL.set(lerp(sh.side * CATCH.x, bx, e), lerp(CATCH.y, by, e), lerp(CATCH.z, bz, e));
      } else if (sh.phase === 'pickup' && sh.grabbed) {
        const e = sstep(0.3, 0.68, sh.t - sh.tPick);
        ballL.set(lerp(sh.pickL.x, sh.side * CATCH.x, e), lerp(sh.pickL.y, CATCH.y, e), lerp(sh.pickL.z, CATCH.z, e));
      }
    }
    guy.updateMatrixWorld(true);
    if (sh.active && !inHands) ball.position.copy(sh.ballW);
    else ball.position.copy(guy.localToWorld(tmp.w.copy(ballL)));
    ball.scale.set(1 + (1 - sq) * 0.5, sq, 1 + (1 - sq) * 0.5);
    ball.rotation.x = st.t * -5.5; ball.rotation.z = 0.4; ball.rotation.y = mv.yaw;
    tmp.q.copy(ball.position); guy.worldToLocal(tmp.q);         // the ball in his own space, for reaching

    // ----- body -----
    const push = 0.5 - 0.5 * Math.cos(2 * Math.PI * (p - 0.04)); // 0 at the catch, 1 as the ball hits the floor
    const bob = 0.03 * Math.cos(2 * Math.PI * (p - 0.06)) + (gait.active ? 0.03 * run * Math.sin(Math.PI * Math.min(1, gait.u)) : 0);
    const rock = Math.sin(st.t * 2.1) * 0.012;
    const bodyYd = 0.9 - 0.15 * crouch + bob - 0.04 * run;
    body.position.set((0.06 * sideNow + rock) * (1 - w), K ? lerp(bodyYd, K.bodyY, w) : bodyYd, -0.03 - 0.03 * crouch + 0.03 * run);
    body.rotation.set(0.05 * (1 - w), 0.06 * sideNow * (1 - w), 0);
    const leanS = K ? 0.1 + 0.2 * K.dip - 0.14 * K.tall + (K.lean || 0) : 0;
    spine.rotation.set(
      lerp(0.29 + 0.2 * crouch + 0.035 * push + 0.12 * run, leanS, w),
      0.17 * sideNow * (1 - 0.7 * w),
      (-0.08 * sideNow - 0.06 * push * sideNow) * (1 - w),
    );
    headPivot.rotation.set(lerp(-0.42 - 0.16 * crouch - 0.03 * push - 0.08 * run, -0.2, w), -0.2 * sideNow * (1 - w), 0.05 * sideNow * (1 - w));
    if (missT >= 0) {
      headPivot.rotation.x += -0.36 * mUp * (1 - mDown) + 0.45 * mDown * (1 - mBack);          // up at the rim, then his head drops
      headPivot.rotation.y += 0.32 * Math.sin((missT - 1.5) * 9) * mDown * (1 - mBack);         // and he shakes it
    }
    body.updateMatrix(); spine.updateMatrix();
    tmp.m.multiplyMatrices(body.matrix, spine.matrix);

    // ----- legs: planted in place while he dribbles, real steps when he travels -----
    const jl = K ? Math.max(0, K.jy - 0.03) * w : 0;
    const cy = Math.cos(mv.yaw), sy = Math.sin(mv.yaw);
    for (const a of [1, -1]) {
      const lg = legs[a];
      let lift = 0, fv = s;
      if (st.cross) {
        // the foot on the receiving side clears out first, then the other steps up
        const lead = a !== s;
        const ww = lead ? sstep(0.08, 0.55, p) : sstep(0.42, 0.92, p);
        fv = lerp(s, -s, ww);
        lift = 0.07 * Math.sin(Math.PI * ww);
      }
      lg.fv = fv;
      const back = a * fv;                                  // 1 when this foot is on the ball side
      let shoeYaw = a * 0.22, pitch = lift * -2.5;
      if (mv.loco) {
        const dx = lg.wp.x - guy.position.x, dz = lg.wp.z - guy.position.z;
        lg.T.set(dx * cy - dz * sy, L.ankle + lg.lift + jl, dx * sy + dz * cy);
        shoeYaw = angDiff(lg.wyaw, mv.yaw);
        pitch = lg.lift * -1.6 + 0.65 * clamp01(jl / 0.08);
      } else {
        lg.T.set(a * (0.27 - 0.01 * back) + lg.off.x, L.ankle + lift, -0.04 - 0.16 * back + lg.off.z);
      }
      lg.Hp.set(a * L.hipW, -0.02, 0).applyMatrix4(body.matrix);
      tmp.pole.set(a * 0.5, 0.1, 1);
      ik2(lg.Hp, lg.T, L.thigh, L.shin, tmp.pole, lg.K, lg.A);
      place(lg.thigh, lg.Hp, lg.K);
      tmp.v.lerpVectors(lg.Hp, lg.K, 0.62);
      place(lg.shortLeg, lg.Hp, tmp.v);
      lg.knee.position.copy(lg.K);
      place(lg.shin, lg.K, lg.A);
      tmp.v.lerpVectors(lg.K, lg.A, 0.68);
      place(lg.sock, tmp.v, lg.A);
      lg.shoe.position.copy(lg.A);
      lg.shoe.rotation.set(pitch, shoeYaw, 0);
    }

    // ----- arms -----
    const lowHand = 2 * BR + Hcur - 0.17;
    for (const a of [1, -1]) {
      const ar = arms[a];
      // how much this hand is the dribbling hand
      let ctrl = a === s ? 1 : 0;
      if (st.cross) ctrl = a === s ? 1 - sstep(0.22, 0.62, p) : sstep(0.3, 0.74, p);
      ar.ctrl = ctrl;
      // dribbling target: ride the ball at the top, wait above it when it is low
      const hy = softmax(ballTop + 0.012, lowHand, 0.05);
      const hx = a * Math.max(a * bx, -0.04);
      const contact = sstep(lowHand - 0.02, lowHand + 0.1, ballTop);
      const dx = hx, dy = hy, dz = bz - 0.01;
      // guard arm: out to the side and forward, elbow bent
      const ox = a * (0.3 + 0.03 * push) + body.position.x * 2.0, oy = 1.33 - 0.2 * crouch - 0.06 * push + 0.015 * Math.sin(st.t * 2.6 + a), oz = 0.5 + 0.04 * push;
      ar.H.set(lerp(ox, dx, ctrl), lerp(oy, dy, ctrl), lerp(oz, dz, ctrl));
      // wrist sits above and behind the palm when the hand is on the ball
      ar.T.set(ar.H.x + a * 0.015 * ctrl, ar.H.y + 0.05 * ctrl, ar.H.z - 0.075 * ctrl);
      ar.S.set(a * (L.shW + 0.03), L.torso - 0.08, 0).applyMatrix4(tmp.m);   // beside the jersey and below its top edge, so no skin pokes out above the shirt
      tmp.pole.set(a, -0.15 - 0.45 * (1 - ctrl), -0.75 + 0.65 * (1 - ctrl));
      const tipDown = ctrl * (1 - contact) * (p < 0.5 ? 1 : 0.35);
      tmp.d.set(a * 0.15 * (1 - ctrl), -0.25 - 0.55 * tipDown + 0.5 * (1 - ctrl), 0.9 * ctrl + 0.2);
      let tipMix = 0.35;

      if (w > 0) {
        // the shot: two hands on the ball, up, release, hold the follow-through, then hands ready for it to come back
        const shooter = a === sh.side;
        let ww = w;
        const W = tmp.w, P = tmp.v, D = tmp.tip;
        if (sh.phase === 'held') {
          ww = w * sstep(0, 0.2, sh.t);
          if (shooter) { W.set(ballL.x + a * 0.02, ballL.y - 0.135, ballL.z - 0.085); D.set(0, 1, 0.3); }
          else { W.set(ballL.x + a * 0.14, ballL.y - 0.06, ballL.z); D.set(-a * 0.2, 1, 0.15); }
          P.set(a * lerp(0.9, 0.5, K.rise), lerp(-1, -0.25, K.rise), lerp(-0.15, 1, K.rise));
        } else if (sh.phase === 'rest') {
          // out of the follow-through, hands onto his head, then down by his sides
          if (shooter) { W.set(ar.S.x, ar.S.y + 0.6, ar.S.z + 0.2); D.set(0, -0.6, 0.8); }
          else { W.set(ar.S.x + a * 0.05, ar.S.y + 0.36, ar.S.z + 0.27); D.set(0, 0.9, 0.4); }
          P.set(a * 0.5, -0.25, 1);
          tmp.h.set(a * 0.13, L.torso + 0.37, 0.05).applyMatrix4(tmp.m);
          W.lerp(tmp.h, mUp);
          D.set(lerp(D.x, -a * 0.7, mUp), lerp(D.y, 0.45, mUp), lerp(D.z, -0.25, mUp));
          P.set(a * lerp(0.5, 1, mUp), lerp(-0.25, 0.3, mUp), lerp(1, 0.2, mUp));
          W.set(lerp(W.x, ar.S.x + a * 0.07, mDown), lerp(W.y, ar.S.y - 0.6, mDown), lerp(W.z, ar.S.z + 0.1, mDown));
          D.set(lerp(D.x, 0, mDown), lerp(D.y, -1, mDown), lerp(D.z, 0.2, mDown));
          P.set(lerp(P.x, a * 0.4, mDown), lerp(P.y, -0.2, mDown), lerp(P.z, -1, mDown));
        } else if (sh.phase === 'pickup') {
          // both hands down onto the ball, then up with it
          W.set(tmp.q.x + a * 0.13, tmp.q.y + 0.05, tmp.q.z - 0.04); D.set(-a * 0.25, -0.75, 0.55);
          P.set(a * 0.9, -0.5, -0.5);
        } else if (sh.phase === 'caught') {
          W.set(ballL.x + a * 0.14, ballL.y - 0.03, ballL.z - 0.05); D.set(-a * 0.3, 0.3, 0.9);
          P.set(a * 0.9, -1, -0.15);
        } else {
          const r = sh.relax;
          if (shooter) { W.set(ar.S.x, ar.S.y + 0.6, ar.S.z + 0.2); D.set(0, -0.6, 0.8); }
          else { W.set(ar.S.x + a * 0.05, ar.S.y + 0.36, ar.S.z + 0.27); D.set(0, 0.9, 0.4); }
          W.set(lerp(W.x, a * 0.17, r), lerp(W.y, K.bodyY + 0.2, r), lerp(W.z, 0.38, r));
          D.set(lerp(D.x, -a * 0.3, r), lerp(D.y, 0.3, r), lerp(D.z, 0.9, r));
          P.set(a * lerp(0.5, 0.9, r), lerp(-0.25, -1, r), lerp(1, -0.15, r));
        }
        ar.T.lerp(W, ww); tmp.pole.lerp(P, ww); tmp.d.lerp(D.normalize(), ww); tipMix = lerp(0.35, 0.05, ww);
      }

      ik2(ar.S, ar.T, L.upper, L.fore, tmp.pole, ar.E, ar.W);
      ar.shoulder.position.copy(ar.S);
      place(ar.upper, ar.S, ar.E);
      ar.elbow.position.copy(ar.E);
      place(ar.fore, ar.E, ar.W);
      tmp.v.lerpVectors(ar.E, ar.W, 0.78);
      place(ar.band, tmp.v, ar.W);
      // hand: fingers forward over the ball; tipped down after the push, level for the catch
      tmp.tip.subVectors(ar.W, ar.E).normalize().multiplyScalar(tipMix).add(tmp.d);
      tmp.tip.normalize().multiplyScalar(0.15).add(ar.W);
      place(ar.hand, ar.W, tmp.tip);
    }

    // ----- the net gives when the ball drops through -----
    const nk = Math.exp(-4.5 * sh.netT), ns = 1 + 0.5 * nk;
    net.scale.set(1 - 0.22 * nk, ns, 1 - 0.22 * nk);
    net.position.set(HOOP.rimX + 0.03 * nk * Math.sin(sh.netT * 20), HOOP.rimY - 0.01 - 0.21 * ns, 0);

  }

  // ====================== THE BLOCK ======================
  // Scroll pulls the camera back from the court and a small neighbourhood builds itself around it.
  // Each kind of work is a building or a character. Nothing here names a client.

  const view = { p: 0, pT: 0, c: 0, cT: 0, k: 1, kT: 1, f: 0, fT: 0, fH: 6, fB: new V3(), fHT: 6, fBT: new V3(), aspect: 1, startHalfH: 2.9, endHalfH: 10.4 };
  const BLOCK_END = 0.76;                       // the share of the scroll the block gets; the rest is the closing
  const easeOut3 = (t) => 1 - Math.pow(1 - clamp01(t), 3);
  const AIM0 = new V3(-0.5, 1.65, 0), AIM1 = new V3(-4.6, 0, -5.4), _aim = new V3();
  const AIMC = new V3(-0.5, 1.5, 0), CAM_R = new V3(0.865, 0, -0.502), CAM_U = new V3(-0.266, 0.844, -0.458), _c = new V3();
  function frame() {
    const z = easeOut3(view.p / 0.9);
    let halfH = lerp(view.startHalfH, view.endHalfH, z);
    _aim.lerpVectors(AIM0, AIM1, z);
    if (view.c > 0) {
      // the closing: back in on the court, set to one side so the chat has room
      const cz = sstep(0, 0.45, view.c) * view.k, wide = view.aspect > 1.05;
      const ch = wide ? 3.7 : Math.max(3.9, 3.3 / view.aspect);
      _c.copy(AIMC);
      if (wide) _c.addScaledVector(CAM_R, 0.34 * ch * view.aspect); else _c.addScaledVector(CAM_U, -0.58 * ch);   // phones: up into the space above the chat sheet
      halfH = lerp(halfH, ch, cz); _aim.lerp(_c, cz);
    }
    if (view.f > 0.001) {
      // phone, card open: in close on the thing, its feet two fifths of the way down, the card right under it
      const fh = Math.min(halfH, view.fH);
      _c.copy(view.fB).addScaledVector(CAM_U, -0.2 * fh);
      halfH = lerp(halfH, fh, view.f); _aim.lerp(_c, view.f);
    }
    const halfW = halfH * view.aspect;
    camera.left = -halfW; camera.right = halfW; camera.top = halfH; camera.bottom = -halfH;
    camera.updateProjectionMatrix();
    camera.position.copy(_aim).addScaledVector(CAM_DIR, 60);
    camera.lookAt(_aim);
  }

  // ---------- ground: lawn, a promenade ring, paving ----------
  const GROUND = { cx: -2.6, cz: -1.2, size: 42, rx: 16.4, rz: 14.8 };
  const PATH = { cx: -0.5, cz: 0, hx: 5.5, hz: 4.3, r: 2.3, w: 1.5 };
  function rr(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }
  function groundTexture() {
    const N = 2048, cv = document.createElement('canvas');
    cv.width = cv.height = N;
    const g = cv.getContext('2d');
    const s = N / GROUND.size;
    g.fillStyle = '#d9d2c1'; g.fillRect(0, 0, N, N);
    for (let i = 0; i < 26000; i++) {
      g.fillStyle = Math.random() < 0.5 ? '#cfc7b4' : '#e2dccd';
      g.fillRect(Math.random() * N, Math.random() * N, 3, 3);
    }
    g.save();
    g.scale(s, s);
    g.translate(GROUND.size / 2 - GROUND.cx, GROUND.size / 2 - GROUND.cz); // metres: x right, z down
    // promenade ring
    const o = PATH.w / 2;
    g.fillStyle = '#efe4c6';
    rr(g, PATH.cx - PATH.hx - o, PATH.cz - PATH.hz - o, 2 * (PATH.hx + o), 2 * (PATH.hz + o), PATH.r + o); g.fill();
    g.strokeStyle = '#c9bb96'; g.lineWidth = 0.08; g.stroke();
    // lawn inside it
    g.fillStyle = '#a8c877';
    rr(g, PATH.cx - PATH.hx + o, PATH.cz - PATH.hz + o, 2 * (PATH.hx - o), 2 * (PATH.hz - o), PATH.r - o); g.fill();
    g.save(); g.clip();
    for (let i = 0; i < 2600; i++) {
      g.fillStyle = Math.random() < 0.5 ? '#9cbd6b' : '#b4d184';
      g.fillRect(PATH.cx - PATH.hx + Math.random() * 2 * PATH.hx, PATH.cz - PATH.hz + Math.random() * 2 * PATH.hz, 0.07, 0.07);
    }
    g.restore();
    // pavement strips in front of the two rows of buildings
    g.fillStyle = '#c9c1ae';
    g.fillRect(-9.1, -7.25, 17, 0.5);
    g.fillRect(-9.05, -6.4, 0.5, 15);
    g.restore();
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    return t;
  }
  const groundU = { uG: { value: new THREE.Vector4(GROUND.size, GROUND.rx, GROUND.rz, 0) } };
  const groundMat = new THREE.MeshLambertMaterial({ map: groundTexture() });
  groundMat.onBeforeCompile = (sh) => {
    sh.uniforms.uG = groundU.uG;
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\nuniform vec4 uG;\n${BAYER}`)
      .replace('#include <map_fragment>', /* glsl */`
        #include <map_fragment>
        {
          vec2 q = (vMapUv - 0.5) * uG.x;
          vec2 n = abs(vec2(q.x / uG.y, q.y / uG.z));
          float e = pow(pow(n.x, 3.0) + pow(n.y, 3.0), 1.0 / 3.0);
          float ang = atan(q.y, q.x);
          e += 0.03 * sin(ang * 5.0 + 0.7) + 0.02 * sin(ang * 11.0 + 2.1);
          e /= max(uG.w, 0.0001);
          float keep = 1.0 - smoothstep(0.84, 1.0, e);
          if (keep <= hash12(floor(gl_FragCoord.xy))) discard;
        }`);
  };
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(GROUND.size, GROUND.size), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(GROUND.cx, -0.02, GROUND.cz);
  ground.receiveShadow = true;
  scene.add(ground);

  // ---------- things that pop up ----------
  const pops = [];
  // What a card says, in the short field names the card code uses.
  const fromCard = (c) => ({
    kind: c.kind, no: c.no, name: c.name, line: c.line, chips: c.tags, thumb: c.picture, href: c.href, go: c.button, serial: c.serial,
    rows: c.rows && c.rows.map((r) => ({ t: r.title, d: r.note, href: r.href, thumb: r.picture })),
  });
  /** A thing that pops up. `card` is its entry in the content file, or null for scenery. */
  function pop(card, x, z, t0, rotY = 0) {
    const g = new THREE.Group();
    g.position.set(x, 0, z); g.rotation.y = rotY;
    g.userData = { ...(card ? fromCard(card) : { kind: null }), t0, k: 0, v: 0, mats: new Map() };
    g.visible = false;
    scene.add(g); pops.push(g);
    return g;
  }
  function mat(g, color, extra) {
    const key = `${color}|${extra ? JSON.stringify(extra) : ''}`;
    let m = g.userData.mats.get(key);
    if (!m) { m = lam(color, extra); g.userData.mats.set(key, m); }
    return m;
  }
  const glow = (c, i = 0.75) => ({ emissive: c, emissiveIntensity: i });
  function bx(g, w, h, d, color, x, y, z, cast = true, extra) {
    const b = mesh(new THREE.BoxGeometry(w, h, d), mat(g, color, extra), g, cast);
    b.position.set(x, y + h / 2, z);
    return b;
  }
  function cy(g, rTop, rBot, h, color, x, y, z, seg = 10, cast = true, extra) {
    const c = mesh(new THREE.CylinderGeometry(rTop, rBot, h, seg), mat(g, color, extra), g, cast);
    c.position.set(x, y + h / 2, z);
    return c;
  }

  // ---------- websites: a street of shopfronts ----------
  const SHOPS = [
    { wall: 0xe9dcc3, awn: 0xc8452f, sign: 0x2b2b2b, h: 3.0 },
    { wall: 0xd98f6a, awn: 0x2f6f5a, sign: 0xf3efe2, h: 3.9 },
    { wall: 0xf1ead8, awn: 0x24406e, sign: 0x24406e, h: 3.2 },
    { wall: 0xcfb04f, awn: 0x8a2f3c, sign: 0xf3efe2, h: 4.3 },
    { wall: 0x9fb7a5, awn: 0xe0a23a, sign: 0x2b2b2b, h: 3.0 },
    { wall: 0xe7b9b0, awn: 0x3a3a44, sign: 0xf3efe2, h: 3.7 },
    { wall: 0x8fa9c9, awn: 0xd9651c, sign: 0xf3efe2, h: 3.1 },
  ];
  SHOPS.forEach((sp, i) => {
    const w = 2.3, d = 2.6, f = d / 2;
    const g = pop(content.shops[i], -7.6 + i * w, -8.6, 0.67 + i * 0.02);
    Object.assign(g.userData, { h: sp.h * 0.62, reach: 1.7, tall: sp.h + 0.4 });
    bx(g, w - 0.06, sp.h, d, sp.wall, 0, 0, 0);
    bx(g, w + 0.04, 0.16, d + 0.1, 0x6b5a4c, 0, sp.h, 0);                 // roof cap
    bx(g, 0.52, 1.2, 0.08, 0x2e2a28, -0.62, 0, f + 0.02, false);          // door
    bx(g, 1.0, 0.85, 0.08, 0xbfe3ee, 0.38, 0.42, f + 0.02, false, glow(0x6fa7b8, 0.35)); // window
    for (let k = 0; k < 5; k++) {                                         // striped awning
      const a = bx(g, (w - 0.1) / 5, 0.1, 0.75, k % 2 ? 0xf3efe2 : sp.awn, -(w - 0.1) / 2 + (w - 0.1) / 10 + k * (w - 0.1) / 5, 1.5, f + 0.33);
      a.rotation.x = 0.28;
    }
    bx(g, w * 0.72, 0.36, 0.08, sp.sign, 0, 1.92, f + 0.03, false);       // sign board
    if (sp.h > 3.5) for (const sx of [-0.5, 0.5]) bx(g, 0.5, 0.62, 0.08, 0xbfe3ee, sx, 2.62, f + 0.02, false, glow(0x6fa7b8, 0.35));
  });

  // ---------- systems: a workshop with gears and a chimney ----------
  const workshop = pop(content.workshop, -10.6, -3.6, 0.35, Math.PI / 2);
  Object.assign(workshop.userData, { h: 2.3, tall: 5.8, anchor: new V3(-9.2, 3.3, -4.4) });
  const gears = [];
  (function () {
    const g = workshop, w = 5, d = 3.2, h = 3.0, f = d / 2;
    bx(g, w, h, d, 0x6f8090, 0, 0, 0);
    bx(g, w + 0.08, 0.3, d + 0.08, 0x4d5a66, 0, 0, 0);                    // plinth
    const tooth = w / 3, rise = 0.85, len = Math.hypot(tooth, rise);
    for (let i = 0; i < 3; i++) {                                         // sawtooth roof
      const cx = -w / 2 + tooth / 2 + i * tooth;
      const pnl = bx(g, len, 0.1, d + 0.06, 0x4d5a66, cx, h + rise / 2 - 0.05, 0);
      pnl.rotation.z = Math.atan2(rise, tooth);
      bx(g, 0.08, rise, d - 0.1, 0xbfe3ee, cx + tooth / 2 - 0.04, h, 0, false, glow(0x6fa7b8, 0.4));
    }
    bx(g, 1.5, 1.9, 0.08, 0x39424b, -1.3, 0, f + 0.02, false);            // roller door
    for (let k = 0; k < 4; k++) bx(g, 1.5, 0.04, 0.1, 0x55616d, -1.3, 0.35 + k * 0.4, f + 0.03, false);
    const mkGear = (r, x, y, color, dir) => {
      const gr = new THREE.Group(); gr.position.set(x, y, f + 0.14); g.add(gr);
      const disc = mesh(new THREE.CylinderGeometry(r * 0.8, r * 0.8, 0.14, 14), mat(g, color), gr);
      disc.rotation.x = Math.PI / 2;
      for (let k = 0; k < 8; k++) {
        const t = mesh(new THREE.BoxGeometry(r * 0.38, r * 0.42, 0.14), mat(g, color), gr, false);
        const a = k / 8 * Math.PI * 2;
        t.position.set(Math.cos(a) * r * 0.92, Math.sin(a) * r * 0.92, 0); t.rotation.z = a + Math.PI / 2;
      }
      const hub = mesh(new THREE.CylinderGeometry(r * 0.25, r * 0.25, 0.2, 8), mat(g, 0x2e2a28), gr, false);
      hub.rotation.x = Math.PI / 2;
      gears.push({ gr, dir, r });
    };
    mkGear(0.72, 1.0, 1.75, 0xe0a23a, 1);
    mkGear(0.44, 2.02, 1.05, 0xc8452f, -1.64);
    cy(g, 0.22, 0.26, 2.6, 0x8a4a3a, 1.9, h, -0.8, 10);                   // chimney
    cy(g, 0.25, 0.25, 0.2, 0xf3efe2, 1.9, h + 1.9, -0.8, 10, false);
  })();
  const puffs = [];
  for (let i = 0; i < 3; i++) {
    const p = mesh(new THREE.SphereGeometry(0.26, 8, 6), mat(workshop, 0xffffff, glow(0xbdbdbd, 0.6)), workshop, false);
    puffs.push(p);
  }

  // ---------- games: an arcade ----------
  const arcade = pop(content.arcade, -10.6, 1.3, 0.24, Math.PI / 2);
  Object.assign(arcade.userData, { h: 2.4, tall: 4.8, anchor: new V3(-9.25, 3.95, 1.3) });
  let bulbA, bulbB;
  (function () {
    const g = arcade, w = 3.6, d = 3.0, h = 3.4, f = d / 2;
    bx(g, w, h, d, 0x4a2f8f, 0, 0, 0);
    bx(g, w + 0.08, 0.18, d + 0.08, 0x2d1c5c, 0, h, 0);
    bx(g, 1.3, 1.75, 0.08, 0x150f2b, 0, 0, f + 0.02, false);              // doorway
    for (const sx of [-0.7, 0.7]) bx(g, 0.09, 1.8, 0.1, 0xff4fa3, sx, 0, f + 0.04, false, glow(0xff4fa3));
    bx(g, 1.5, 0.09, 0.1, 0xff4fa3, 0, 1.76, f + 0.04, false, glow(0xff4fa3));
    bx(g, w + 0.3, 0.55, 0.55, 0xf2c230, 0, 2.15, f + 0.2);               // marquee
    bulbA = lam(0xffffff, glow(0xfff2b0, 1)); bulbB = lam(0xffffff, glow(0xfff2b0, 1));
    for (let k = 0; k < 9; k++) {
      const b = mesh(new THREE.BoxGeometry(0.16, 0.16, 0.08), k % 2 ? bulbA : bulbB, g, false);
      b.position.set(-w / 2 + 0.05 + k * (w + 0.2) / 9 + 0.1, 2.42, f + 0.5);
    }
    // roof sign: a control pad
    bx(g, 2.2, 1.25, 0.14, 0x1c1630, 0, h + 0.18, f - 0.3);
    bx(g, 0.24, 0.78, 0.08, 0xf3efe2, -0.55, h + 0.42, f - 0.2, false);
    bx(g, 0.78, 0.24, 0.08, 0xf3efe2, -0.55, h + 0.69, f - 0.2, false);
    bx(g, 0.3, 0.3, 0.08, 0xff4f4f, 0.42, h + 0.55, f - 0.2, false, glow(0xff4f4f, 0.6));
    bx(g, 0.3, 0.3, 0.08, 0x4fd0ff, 0.82, h + 0.86, f - 0.2, false, glow(0x4fd0ff, 0.6));
    // two cabinets out front
    [[-1.3, 0x1fa08a, 0x7df0ff], [1.3, 0xd9432f, 0xfff07d]].forEach(([x, c, sc]) => {
      bx(g, 0.55, 1.35, 0.55, c, x, 0, f + 0.75);
      bx(g, 0.42, 0.36, 0.06, sc, x, 0.82, f + 1.03, false, glow(sc, 0.9));
      bx(g, 0.55, 0.1, 0.25, 0x1c1630, x, 0.6, f + 1.1, false);
    });
  })();

  // ---------- films: a cinema ----------
  const cinema = pop(content.cinema, -10.6, 5.9, 0.46, Math.PI / 2);
  Object.assign(cinema.userData, { h: 2.6, tall: 5.3, anchor: new V3(-9.2, 3.4, 5.6) });
  let screenCtx, screenTex; const reels = [];
  (function () {
    const g = cinema, w = 4.4, d = 3.2, h = 3.9, f = d / 2;
    bx(g, w, h, d, 0xf0e2c4, 0, 0, 0);
    bx(g, w + 0.06, 0.5, d + 0.06, 0xb8322f, 0, 0, 0);
    bx(g, w + 0.1, 0.2, d + 0.1, 0xb8322f, 0, h, 0);
    bx(g, w * 0.82, 0.24, 1.15, 0xb8322f, 0.25, 2.1, f + 0.55);           // canopy
    for (let k = 0; k < 8; k++) {
      const b = mesh(new THREE.BoxGeometry(0.14, 0.12, 0.08), k % 2 ? bulbB : bulbA, g, false);
      b.position.set(-1.25 + k * 0.44, 2.14, f + 1.14);
    }
    for (const sx of [-0.35, 0.85]) bx(g, 0.75, 1.5, 0.08, 0x3a2a26, sx, 0.5, f + 0.02, false); // doors
    bx(g, 0.5, 2.9, 0.34, 0xb8322f, -w / 2 + 0.42, 1.5, f + 0.2);          // blade sign
    for (let k = 0; k < 5; k++) bx(g, 0.26, 0.26, 0.06, 0xfff2b0, -w / 2 + 0.42, 1.78 + k * 0.5, f + 0.38, false, glow(0xfff2b0, 0.8));
    // the screen, a tiny film playing
    const cv = document.createElement('canvas'); cv.width = 24; cv.height = 14;
    screenCtx = cv.getContext('2d');
    screenTex = new THREE.CanvasTexture(cv);
    screenTex.magFilter = THREE.NearestFilter; screenTex.minFilter = THREE.NearestFilter; screenTex.colorSpace = THREE.SRGBColorSpace;
    bx(g, 2.75, 1.5, 0.08, 0x2b2422, 0.5, 2.42, f + 0.02, false);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 1.3), new THREE.MeshBasicMaterial({ map: screenTex }));
    scr.position.set(0.5, 3.17, f + 0.07); g.add(scr);
    // film reels on the roof
    for (const [x, r] of [[-0.9, 0.62], [0.35, 0.48]]) {
      const gr = new THREE.Group(); gr.position.set(x, h + 0.2 + r, 0.3); g.add(gr);
      const disc = mesh(new THREE.CylinderGeometry(r, r, 0.16, 16), mat(g, 0x2b2b30), gr); disc.rotation.x = Math.PI / 2;
      for (let k = 0; k < 5; k++) {
        const hole = mesh(new THREE.CylinderGeometry(r * 0.2, r * 0.2, 0.18, 8), mat(g, 0xd9d2c1), gr, false);
        const a = k / 5 * Math.PI * 2; hole.rotation.x = Math.PI / 2; hole.position.set(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, 0);
      }
      reels.push(gr);
    }
  })();
  function drawFilm(t) {
    const g = screenCtx, W = 24, H = 14;
    g.fillStyle = '#17324d'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#f2c230'; g.fillRect(17, 2, 3, 3);                     // sun
    g.fillStyle = '#2f8a5f'; g.fillRect(0, 10, W, 4);                     // ground
    const u = (t * 0.55) % 1, x = Math.round(2 + u * 20);
    const y = Math.round(9 - Math.abs(Math.sin(u * Math.PI * 3)) * 6);
    g.fillStyle = '#d9651c'; g.fillRect(x - 1, y - 1, 2, 2);              // a ball bouncing across
    if (Math.floor(t * 9) % 7 === 0) { g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(0, 0, W, H); }
    screenTex.needsUpdate = true;
  }

  // ---------- the studio, at the corner ----------
  const studio = pop(content.studio, -10.5, -8.7, 0.86);
  Object.assign(studio.userData, { h: 4.4, tall: 9.2 });
  const pixels = [];
  (function () {
    const g = studio, w = 4.4, d = 4.4, h = 6.2, f = d / 2;
    bx(g, w, h, d, 0x23212b, 0, 0, 0);
    bx(g, w + 0.1, 0.34, d + 0.1, 0xf0509b, 0, h - 0.6, 0, false, glow(0xf0509b, 0.5));
    bx(g, w + 0.06, 0.2, d + 0.06, 0x15141a, 0, h, 0);
    const lit = [0xffd98a, 0xffd98a, 0xf0509b, 0xffd98a, 0x3a3846];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
      const col = lit[(r * 5 + c * 3) % lit.length], col2 = lit[(r * 3 + c * 7 + 1) % lit.length];
      bx(g, 0.72, 0.72, 0.08, col, -1.25 + c * 1.25, 1.35 + r * 1.08, f + 0.02, false, col === 0x3a3846 ? undefined : glow(col, 0.7));
      bx(g, 0.08, 0.72, 0.72, col2, f + 0.02, 1.35 + r * 1.08, -1.25 + c * 1.25, false, col2 === 0x3a3846 ? undefined : glow(col2, 0.7));
    }
    bx(g, 1.0, 1.05, 0.08, 0xf0509b, 0, 0, f + 0.03, false, glow(0xf0509b, 0.5)); // door
    // rooftop sign: an ink drop that breaks into pixels
    cy(g, 0.06, 0.06, 1.0, 0x8d8a96, -0.5, h + 0.2, 0.6, 6);
    const drop = mesh(new THREE.SphereGeometry(0.62, 12, 10), mat(g, 0xf0509b, glow(0xf0509b, 0.45)), g);
    drop.position.set(-0.5, h + 1.75, 0.6);
    const tip = mesh(new THREE.ConeGeometry(0.47, 0.95, 12), mat(g, 0xf0509b, glow(0xf0509b, 0.45)), g);
    tip.position.set(-0.5, h + 2.62, 0.6);
    for (let k = 0; k < 7; k++) {
      const s = 0.3 - k * 0.022;
      const c = mesh(new THREE.BoxGeometry(s, s, s), mat(g, k % 3 === 1 ? 0xf3efe2 : 0xf0509b, glow(0xf0509b, 0.4)), g, false);
      c.userData.base = new V3(0.35 + k * 0.34, h + 1.3 + ((k * 37) % 11) * 0.11, 0.6 + ((k * 13) % 5 - 2) * 0.12);
      c.position.copy(c.userData.base);
      pixels.push(c);
    }
  })();

  // ---------- agents and bots: little robots walking the promenade ----------
  function pathPoint(s, out) {
    const { cx, cz, hx, hz, r } = PATH;
    const a = 2 * (hx - r), b = 2 * (hz - r), q = Math.PI * r / 2, total = 2 * a + 2 * b + 4 * q;
    let u = ((s % total) + total) % total;
    const set = (x, z, h) => { out.x = cx + x; out.z = cz + z; out.h = h; };
    const arc = (ox, oz, a0, t) => { const ang = a0 + t / r; set(ox + Math.cos(ang) * r, oz + Math.sin(ang) * r, ang - Math.PI / 2); };
    if (u < a) return set(-hx + r + u, hz, 0); u -= a;                      // front edge, heading +x
    if (u < q) return arc(hx - r, hz - r, Math.PI / 2, -u); u -= q;
    if (u < b) return set(hx, hz - r - u, -Math.PI / 2); u -= b;
    if (u < q) return arc(hx - r, -hz + r, 0, -u); u -= q;
    if (u < a) return set(hx - r - u, -hz, Math.PI); u -= a;
    if (u < q) return arc(-hx + r, -hz + r, -Math.PI / 2, -u); u -= q;
    if (u < b) return set(-hx, -hz + r + u, Math.PI / 2); u -= b;
    return arc(-hx + r, hz - r, Math.PI, -u);
  }
  const ROBOTS = [
    { c: 0xf3efe2, v: 0x4fd0ff },
    { c: 0xf2c230, v: 0x2b2b2b },
    { c: 0x3fb8a3, v: 0xfff2b0 },
    { c: 0xff7f50, v: 0x4fd0ff },
    { c: 0xc9b7f2, v: 0xfff2b0 },
  ];
  const robots = ROBOTS.map((rb, i) => {
    const g = pop(content.robots[i], 0, 0, 0.1 + i * 0.02);
    Object.assign(g.userData, { h: 1.1, tall: 1.7, reach: 0.7 });
    const inner = new THREE.Group(); g.add(inner);
    const part = (w, h, d, color, x, y, z, extra) => { const b = mesh(new THREE.BoxGeometry(w, h, d), mat(g, color, extra), inner); b.position.set(x, y + h / 2, z); return b; };
    part(0.5, 0.5, 0.4, rb.c, 0, 0.32, 0);                                 // body
    part(0.44, 0.36, 0.38, rb.c, 0, 0.88, 0);                              // head
    part(0.36, 0.16, 0.06, 0x1c1b22, 0, 0.98, 0.19);                       // visor
    part(0.08, 0.08, 0.04, rb.v, -0.09, 1.02, 0.22, glow(rb.v, 1));
    part(0.08, 0.08, 0.04, rb.v, 0.09, 1.02, 0.22, glow(rb.v, 1));
    part(0.04, 0.22, 0.04, 0x8d8a96, 0, 1.24, 0);
    const tipM = lam(0xff4f4f, glow(0xff4f4f, 1));
    const tip = mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), tipM, inner, false); tip.position.set(0, 1.5, 0);
    const feet = [-1, 1].map((sx) => part(0.16, 0.32, 0.22, 0x55505c, sx * 0.14, 0, 0));
    const arms2 = [-1, 1].map((sx) => part(0.1, 0.32, 0.12, 0x8d8a96, sx * 0.31, 0.42, 0));
    let bubble = null;
    if (i === 0 || i === 3) {
      bubble = new THREE.Group(); bubble.position.set(0.35, 1.75, 0); inner.add(bubble);
      const bm = lam(0xffffff, glow(0xffffff, 0.8));
      mesh(new THREE.BoxGeometry(0.7, 0.42, 0.06), bm, bubble, false);
      const b2 = mesh(new THREE.BoxGeometry(0.14, 0.14, 0.06), bm, bubble, false); b2.position.set(-0.22, -0.26, 0);
      for (let k = 0; k < 3; k++) { const dd = mesh(new THREE.BoxGeometry(0.09, 0.09, 0.04), lam(0x2b2b2b), bubble, false); dd.position.set(-0.19 + k * 0.19, 0, 0.04); }
    }
    return { g, inner, feet, arms2, tipM, bubble, s: i * 6.3 + 1.5, speed: 0.75 + (i % 3) * 0.12, pt: { x: 0, z: 0, h: 0 } };
  });

  // ---------- writing: a newsstand for the AI doom scroll ----------
  const newsstand = pop(content.newsstand, 8.3, 2.7, 0.57);
  Object.assign(newsstand.userData, { h: 1.7, tall: 3.0, reach: 2.0 });
  let tickCtx, tickTex;
  (function () {
    const g = newsstand, w = 2.3, d = 1.5, h = 2.15, f = d / 2;
    bx(g, w, h, d, 0x2f5d4a, 0, 0, 0);
    bx(g, w + 0.5, 0.14, d + 0.9, 0x24483a, 0, h, 0.2);                   // roof, hanging over the front
    bx(g, w - 0.3, 1.2, 0.1, 0x16261f, 0, 0.75, f + 0.01, false);         // the opening
    bx(g, w - 0.1, 0.12, 0.5, 0xe9dcc3, 0, 0.7, f + 0.25);                // counter
    const mags = [0xc8452f, 0xf2c230, 0x4fd0ff, 0xf3efe2, 0xf0509b, 0x8fa9c9, 0xe0a23a];
    for (let r = 0; r < 2; r++) for (let c = 0; c < 6; c++) bx(g, 0.24, 0.3, 0.05, mags[(r * 3 + c * 2) % mags.length], -0.8 + c * 0.32, 1.04 + r * 0.42, f + 0.08, false);
    for (let c = 0; c < 5; c++) bx(g, 0.26, 0.05, 0.34, c % 2 ? 0xf3efe2 : 0xd9d2c1, -0.7 + c * 0.35, 0.82, f + 0.28, false);
    for (let r = 0; r < 3; r++) bx(g, 0.05, 0.3, 0.26, mags[(r * 2 + 1) % mags.length], w / 2 + 0.04, 0.5 + r * 0.45, -0.25 + r * 0.22, false);
    bx(g, 0.5, 0.34, 0.38, 0xf3efe2, -w / 2 - 0.45, 0, f + 0.25);          // a stack of papers
    for (let k = 0; k < 3; k++) bx(g, 0.52, 0.03, 0.4, 0x8d8a96, -w / 2 - 0.45, 0.08 + k * 0.09, f + 0.25, false);
    const cv = document.createElement('canvas'); cv.width = 40; cv.height = 6;
    tickCtx = cv.getContext('2d');
    tickTex = new THREE.CanvasTexture(cv);
    tickTex.magFilter = THREE.NearestFilter; tickTex.minFilter = THREE.NearestFilter; tickTex.colorSpace = THREE.SRGBColorSpace;
    bx(g, w + 0.1, 0.58, 0.12, 0x15141a, 0, h + 0.14, f + 0.45);           // the ticker board
    const board = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.1, 0.4), new THREE.MeshBasicMaterial({ map: tickTex }));
    board.position.set(0, h + 0.43, f + 0.52); g.add(board);
  })();
  function drawTicker(t) {
    const g = tickCtx, W = 40, H = 6, off = Math.floor(t * 9);
    g.fillStyle = '#0e0d12'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#ffb02e';
    for (let x = 0; x < W; x++) {
      const k = (x + off) % 23;
      const on = k < 5 || (k > 6 && k < 10) || (k > 11 && k < 18) || (k > 19 && k < 22);
      if (on) for (let y = 1; y < 5; y++) if (((x + off) * 7 + y * 13) % 5 !== 0) g.fillRect(x, y, 1, 1);
    }
    tickTex.needsUpdate = true;
  }
  // The headlines, read from the blog on the server. With none, the card keeps just its line and button.
  if (headlines.length) {
    newsstand.userData.rows = headlines.slice(0, 3).map((it) => ({ t: it.title, d: it.date, href: it.href }));
    newsstand.userData.chips = [`${headlines.length} ${content.hints.takes}`, ...(content.newsstand.tags || [])];
  }

  // ---------- trees, lamps, benches ----------
  [[4.4, -5.7, 0.2, 1.0], [7.3, -3.2, 0.3, 1.15], [9.7, -0.9, 0.36, 0.95], [7.2, 5.0, 0.46, 1.1], [3.4, 7.0, 0.5, 1.0],
   [-1.8, 7.3, 0.58, 1.2], [-6.4, 6.9, 0.62, 0.9], [-7.7, -0.9, 0.36, 0.85], [-7.6, -5.9, 0.72, 1.05], [0.6, -6.0, 0.6, 0.9],
   [9.6, -5.6, 0.78, 1.1], [11.0, 5.4, 0.8, 0.95], [5.8, 8.6, 0.82, 1.0]].forEach(([x, z, t0, sc], i) => {
    const g = pop(null, x, z, t0);
    cy(g, 0.09 * sc, 0.12 * sc, 0.95 * sc, 0x7a5236, 0, 0, 0, 6);
    const leaf = [0x3f8f4f, 0x4fa35a, 0x2f7d47][i % 3];
    const a = mesh(new THREE.IcosahedronGeometry(0.72 * sc, 0), mat(g, leaf), g); a.position.set(0, 1.35 * sc, 0); a.rotation.y = i;
    const b = mesh(new THREE.IcosahedronGeometry(0.5 * sc, 0), mat(g, leaf), g); b.position.set(0.12 * sc, 2.0 * sc, 0.05); b.rotation.y = i * 2;
  });
  [[6.6, 5.6, 0.25], [-7.4, 5.4, 0.34], [6.6, -5.4, 0.4], [-7.3, -6.0, 0.5]].forEach(([x, z, t0]) => {
    const g = pop(null, x, z, t0);
    cy(g, 0.045, 0.06, 2.5, 0x3b3f46, 0, 0, 0, 6);
    bx(g, 0.3, 0.36, 0.3, 0xfff2b0, 0, 2.5, 0, false, glow(0xffe08a, 1));
    bx(g, 0.4, 0.07, 0.4, 0x3b3f46, 0, 2.86, 0);
  });
  [[2.2, 6.3, 0.3, 0], [7.35, -1.2, 0.44, Math.PI / 2]].forEach(([x, z, t0, ry]) => {
    const g = pop(null, x, z, t0, ry);
    bx(g, 1.3, 0.08, 0.4, 0x9a6a43, 0, 0.38, 0);
    bx(g, 1.3, 0.34, 0.07, 0x9a6a43, 0, 0.5, -0.2);
    for (const sx of [-0.55, 0.55]) bx(g, 0.07, 0.38, 0.36, 0x3b3f46, sx, 0, 0);
  });

  // ---------- captions ----------
  const TOUCH = window.matchMedia('(pointer: coarse)').matches;
  const STAGE_TO = [0.10, 0.23, 0.34, 0.45, 0.56, 0.66, 0.84, 0.93, 2, 3];      // where in the scroll each title gives way to the next
  const STAGES = content.stages.map((s, i) => ({ to: STAGE_TO[i], h: s.title, p: TOUCH && s.lineTouch ? s.lineTouch : s.line }));
  const capEl = document.getElementById('cap'), capH = capEl.querySelector('h2'), capP = capEl.querySelector('p');
  const hintEl = document.getElementById('hint');
  let stageIdx = -1;
  function setStage() {
    const i = view.c > 0.04 ? (view.kT ? STAGES.length - 1 : STAGES.length - 2) : STAGES.findIndex((s) => view.p < s.to && s.to < 3);
    if (i === stageIdx) return;
    stageIdx = i;
    capEl.classList.remove('in'); void capEl.offsetWidth;
    capH.textContent = STAGES[i].h; capP.textContent = STAGES[i].p;
    capEl.classList.add('in');
  }

  // ---------- the opening: one shot, then the name ----------
  let clockT = 0;
  let introAt = params.has('noshot') ? null : 0.7, made = false;
  function markMade() {
    if (made) return;
    made = true;
    document.body.classList.add('made');
    stageIdx = -1; setStage();
  }
  sh.onMake = markMade;
  if (introAt === null) markMade();

  // ---------- per-frame update for the block ----------
  function blockAdvance(dt) {
    clockT += dt;
    if (introAt !== null && clockT >= introAt) {
      introAt = null;
      if (view.pT < 0.05) shootFrom(guy.position.x, guy.position.z); else markMade();
    }
    if (!made && clockT > 7) markMade();                       // never leave the name hidden
    view.p += (view.pT - view.p) * (1 - Math.exp(-dt * 7));
    view.c += (view.cT - view.c) * (1 - Math.exp(-dt * 7));
    view.f += (view.fT - view.f) * (1 - Math.exp(-dt * 6.5));
    if (Math.abs(view.fT - view.f) < 0.002) view.f = view.fT;
    const glide = 1 - Math.exp(-dt * 6);
    view.fB.lerp(view.fBT, glide); view.fH += (view.fHT - view.fH) * glide;
    view.k += (view.kT - view.k) * (1 - Math.exp(-dt * 4.5));
    if (Math.abs(view.kT - view.k) < 0.001) view.k = view.kT;
    if (Math.abs(view.cT - view.c) < 0.0004) view.c = view.cT;
    if (Math.abs(view.pT - view.p) < 0.0004) view.p = view.pT;
    frame();
    setStage();
    const hintOn = made && view.p < 0.02;
    hintEl.style.opacity = hintOn ? 1 : 0;
    if (stage.clientWidth < 561) { hintEl.style.left = hintEl.style.bottom = hintEl.style.transform = ''; }
    else if (hintOn) {
      // on a wide screen it follows the line under the title, where the eye already is
      const line = capP.getBoundingClientRect(), box = stage.getBoundingClientRect();
      hintEl.style.left = `${Math.round(line.right - box.left + 18)}px`;
      hintEl.style.bottom = `${Math.round(box.bottom - line.bottom)}px`;
      hintEl.style.transform = 'none';
    }
    ground.visible = view.p >= 0.015;
    groundU.uG.value.w = 0.2 + 0.8 * easeOut3(view.p / 0.5);
    for (const g of pops) {
      const u = g.userData, tgt = view.p >= u.t0 ? 1 : 0;
      u.v += ((tgt - u.k) * 150 - u.v * 15) * dt;
      u.k += u.v * dt;
      if (tgt === 0 && u.k < 0.01) { u.k = 0; u.v = 0; }
      g.visible = u.k > 0.01;
      const k = Math.max(0.001, u.k);
      g.scale.set(0.55 + 0.45 * Math.min(1, k), k, 0.55 + 0.45 * Math.min(1, k));
    }
    for (const gr of gears) gr.gr.rotation.z = clockT * 0.9 * gr.dir;
    for (const [i, r] of reels.entries()) r.rotation.z = -clockT * (0.7 + i * 0.3);
    puffs.forEach((p, i) => {
      const u = (clockT * 0.28 + i / 3) % 1;
      p.position.set(1.9 + u * 0.5, 5.25 + u * 1.9, -0.8 - u * 0.3);
      p.scale.setScalar(0.55 + u * 1.1);
      p.visible = u < 0.92;
    });
    const blink = Math.floor(clockT * 2.5) % 2;
    bulbA.emissiveIntensity = blink ? 1 : 0.1; bulbB.emissiveIntensity = blink ? 0.1 : 1;
    drawFilm(clockT);
    drawTicker(clockT);
    pixels.forEach((c, i) => {
      const b = c.userData.base;
      c.position.set(b.x + Math.sin(clockT * 0.9 + i) * 0.06, b.y + Math.sin(clockT * 1.3 + i * 1.7) * 0.12, b.z);
      c.rotation.y = clockT * 0.5 + i;
    });
    for (const [i, rb] of robots.entries()) {
      rb.s += rb.speed * dt;
      pathPoint(rb.s, rb.pt);
      rb.g.position.set(rb.pt.x, 0, rb.pt.z);
      rb.inner.rotation.y = Math.PI / 2 - rb.pt.h;
      const ph = rb.s * 7;
      rb.inner.position.y = Math.abs(Math.sin(ph)) * 0.06;
      rb.feet[0].position.y = 0.16 + Math.max(0, Math.sin(ph)) * 0.09;
      rb.feet[1].position.y = 0.16 + Math.max(0, -Math.sin(ph)) * 0.09;
      rb.arms2[0].rotation.x = Math.sin(ph) * 0.5; rb.arms2[1].rotation.x = -Math.sin(ph) * 0.5;
      rb.tipM.emissiveIntensity = Math.floor(clockT * 2 + i * 0.4) % 2 ? 1 : 0.15;
      if (rb.bubble) {
        const on = ((clockT * 0.22 + i * 0.37) % 1) < 0.45;
        rb.bubble.visible = on;
        rb.bubble.quaternion.copy(rb.inner.quaternion).invert();
        rb.bubble.rotateY(Math.atan2(CAM_DIR.x, CAM_DIR.z));
      }
    }
    closingAdvance();
    placeCard();
    document.body.classList.toggle('closeup', (view.c > 0.12 && view.kT === 1) || view.fT === 1);
  }

  // ---------- the card: what a thing is, and a way in ----------
  const KINDS = content.kinds;
  const GUY_CARD = { ...fromCard(content.player), h: 1.5, tall: 2.1, reach: 0.9, side: 'right', k: 1 };
  const cardEl = document.getElementById('card'), cardHead = el('div', 'head'), cardBody = el('div', 'body'), leadEl = document.getElementById('lead'), leadLine = leadEl.querySelector('polyline'), leadDot = leadEl.querySelector('rect');
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  cardEl.append(cardHead, cardBody);
  let switchAt = -9;                                  // when an open card last changed to another thing
  let hot = null, shown = null, pinnedCard = false, typeEl = null, typeText = '', typeAt = 0;
  const dataOf = (t) => (t === guy ? GUY_CARD : t.userData);

  // ---------- scroll cues ----------
  // For anything that scrolls inside itself: a pixel rail with a thumb, and a tab with a bouncing ball while there is more below.
  function paintBall(cv, n) {
    const r = n / 2;
    cv.width = n; cv.height = n;
    const g = cv.getContext('2d');
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const dx = x + 0.5 - r, dy = y + 0.5 - r, q = Math.hypot(dx, dy);
      if (q > r) continue;
      const seam = Math.abs(dy) < 0.6 || Math.abs(dx + dy * 0.25) < 0.6;
      g.fillStyle = q > r - 1 ? '#8a3f12' : seam ? '#5a2a0e' : dx + dy < -r * 0.35 ? '#ef8433' : '#d9651c';
      g.fillRect(x, y, 1, 1);
    }
  }
  function scrollCue(scroller, host, label, live) {
    const rail = el('div', 'rail'), thumb = el('i'); rail.append(thumb);
    const more = el('button', 'more'); more.type = 'button'; more.setAttribute('aria-label', 'Scroll down, there is more');
    const bc = document.createElement('canvas'); paintBall(bc, 6);
    more.append(bc, el('span', '', label));
    host.append(rail, more);
    more.addEventListener('click', () => scroller.scrollBy({ top: scroller.clientHeight * 0.7, behavior: 'smooth' }));
    const upd = () => {
      const over = scroller.scrollHeight - scroller.clientHeight, on = over > 10 && live();
      rail.classList.toggle('on', on);
      more.classList.toggle('on', on && scroller.scrollTop < over - 8);
      if (!on) return;
      const top = scroller.offsetTop, h = scroller.clientHeight;
      const th = Math.max(24, Math.round((h * h) / scroller.scrollHeight / 3) * 3);
      rail.style.top = `${top}px`; rail.style.height = `${h}px`;
      thumb.style.height = `${th}px`;
      thumb.style.transform = `translateY(${Math.round(((h - th) * scroller.scrollTop) / over / 3) * 3}px)`;
      more.style.top = `${top + h - 40}px`;
    };
    scroller.addEventListener('scroll', upd, { passive: true });
    return upd;
  }
  const cardCue = scrollCue(cardBody, cardEl, content.hints.more, () => pinnedCard);

  function setHot(g) {
    if (g === hot) return;
    const tint = (grp, on) => grp.userData.mats.forEach((m) => {
      if (m.userData.e0 === undefined) { m.userData.e0 = m.emissive.getHex(); m.userData.i0 = m.emissiveIntensity; }
      if (on && m.userData.e0 === 0) { m.emissive.setHex(0x3a3a3a); m.emissiveIntensity = 1; }
      else { m.emissive.setHex(m.userData.e0); m.emissiveIntensity = m.userData.i0; }
    });
    if (hot) tint(hot, false);
    hot = g;
    if (hot) tint(hot, true);
  }
  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function link(cls, href) {
    const a = el('a', cls); a.href = href; a.target = '_blank'; a.rel = 'noopener';
    return a;
  }
  function buildCard(u) {
    const k = KINDS[u.kind];
    cardBody.replaceChildren(); cardBody.scrollTop = 0;
    cardEl.style.setProperty('--band', k.color); cardEl.style.setProperty('--band-ink', k.ink);
    const band = el('div', 'band'); band.append(el('span', '', k.tag), el('span', '', u.no || ''));
    const x = el('button', 'x', 'X'); x.type = 'button'; x.setAttribute('aria-label', 'Close this card');
    x.addEventListener('click', () => { setHot(null); showCard(null); });
    band.append(x);
    cardHead.replaceChildren(band);
    let img = null;
    const thumb = u.thumb || ((u.rows || []).find((r) => r.thumb) || {}).thumb;
    if (thumb) {
      const w = el('div', 'thumb'); img = el('img'); img.alt = ''; img.src = `/cards/${thumb}.jpg`;
      w.append(img); cardBody.append(w);
    }
    if (u.name) cardBody.append(el('h3', '', u.name));
    typeEl = el('p', 'line'); typeText = u.line || ''; typeAt = clockT; cardBody.append(typeEl);
    if (u.rows) {
      const ul = el('ul', 'rows');
      for (const r of u.rows) {
        const li = el('li'), a = r.href ? link('', r.href) : el('div', 'plain');
        a.append(el('b', '', r.t), el('span', '', r.d || ''));
        if (r.thumb && img) for (const ev of ['pointerenter', 'focus']) a.addEventListener(ev, () => { img.src = `/cards/${r.thumb}.jpg`; });
        li.append(a); ul.append(li);
      }
      cardBody.append(ul);
    }
    if (u.chips) { const c = el('div', 'chips'); for (const t of u.chips) c.append(el('span', '', t)); cardBody.append(c); }
    if (u.href) { const a = link('go', u.href); a.textContent = u.go || u.href.replace(/^https:\/\//, ''); cardBody.append(a); }
    if (u.rows && u.rows.some((r) => r.href)) cardBody.append(el('div', 'how', TOUCH ? content.hints.pickTouch : content.hints.pick));
    if (u.serial) {
      const serial = el('div', 'serial'); serial.append(el('i'), el('span', '', u.serial[0]), el('span', '', u.serial[1]));
      cardBody.append(serial);
    }
    cardEl.classList.remove('fresh'); void cardEl.offsetWidth; cardEl.classList.add('fresh');
  }
  function showCard(t, pin) {
    if (t !== shown) { if (shown && t && pinnedCard) switchAt = clockT; shown = t; if (t) buildCard(dataOf(t)); }
    pinnedCard = !!(t && pin);
    if (pinnedCard) pinScroll = window.scrollY;
    cardEl.classList.toggle('on', !!t);
    cardEl.classList.toggle('pinned', pinnedCard);
    leadEl.classList.toggle('on', !!t);
    if (t) placeCard();
  }
  const _a = new V3();
  function placeCard() {
    cardCue();
    if (!shown) { view.fT = 0; cardEl.style.opacity = ''; leadEl.style.opacity = ''; return; }
    const u = dataOf(shown);
    if (shown !== guy && u.k < 0.5) { setHot(null); showCard(null); return; }
    if (typeEl) {
      const n = Math.min(typeText.length, Math.floor((clockT - typeAt) * 75));
      if (typeEl.textContent.length !== n) typeEl.textContent = typeText.slice(0, n);
      typeEl.classList.toggle('typing', n < typeText.length);
    }
    if (u.anchor) _a.copy(u.anchor); else { _a.copy(shown.position); _a.y += u.h || 2.5; }
    _a.project(camera);
    const W = stage.clientWidth, H = stage.clientHeight;
    const ax = Math.round((_a.x * 0.5 + 0.5) * W), ay = Math.round((-_a.y * 0.5 + 0.5) * H);
    // stand clear of the thing itself: its rough half-width on screen, plus a little
    const cw = cardEl.offsetWidth, ch = cardEl.offsetHeight, gap = Math.round((u.reach || 2.6) * H / (camera.top - camera.bottom)) + 18;
    let cx, cy, pts;
    if (W < 560) {
      // phone: the camera comes in on the thing and the card hangs right under it
      const pin = pinnedCard;
      view.fT = pin ? 1 : 0;
      if (pin) {
        view.fBT.set(shown.position.x, 0, shown.position.z);
        view.fHT = clamp(1.28 * (u.tall || 4), 4.6, 14);
        // coming in from the whole block there is nothing to glide from; from another card, blockAdvance eases across
        if (view.f < 0.02) { view.fB.copy(view.fBT); view.fH = view.fHT; }
      }
      _a.set(shown.position.x, 0, shown.position.z).project(camera);
      const bx = Math.round((_a.x * 0.5 + 0.5) * W), by = Math.round((-_a.y * 0.5 + 0.5) * H);
      const pxm = H / (camera.top - camera.bottom);
      cx = Math.round((W - cw) / 2);
      cy = Math.round(clamp(by + 0.9 * pxm + 22, H * 0.3, H * 0.56));
      cardEl.style.maxHeight = `${Math.max(140, H - cy - 16)}px`;
      // it arrives once the camera is nearly there, whether that is from the whole block or from another card
      const arrived = Math.min(clamp01((view.f - 0.55) / 0.3), clamp01((clockT - switchAt - 0.32) / 0.25));
      cardEl.style.opacity = pin ? arrived : '';
      const ex = clamp(bx, cx + 20, cx + cw - 20), ty = Math.min(by + 0.35 * pxm, cy - 10);
      pts = [[ex, ty], [ex, cy]];
      leadDot.setAttribute('x', ex - 4); leadDot.setAttribute('y', ty - 4);
      leadEl.style.opacity = pin ? arrived : '';
      cardEl.style.transform = `translate(${cx}px, ${cy}px)`;
      leadLine.setAttribute('points', pts.map((q) => q.map(Math.round).join(',')).join(' '));
      return;
    } else {
      view.fT = 0; cardEl.style.maxHeight = ''; cardEl.style.opacity = ''; leadEl.style.opacity = '';
      const right = ax + gap + cw < W - 14 && (u.side === 'right' || ax < W * 0.5 || ax - gap - cw < 14);
      cx = right ? ax + gap : ax - gap - cw;
      const topGap = H < 520 ? 12 : 64;                          // a short screen has no room to spare above the card
      cy = clamp(ay - 40, topGap, Math.max(topGap, H - ch - 14));
      const ex = right ? cx : cx + cw, ty = clamp(ay, cy + 18, cy + ch - 18), mx = Math.round((ax + ex) / 2);
      pts = [[ax, ay], [mx, ay], [mx, ty], [ex, ty]];
    }
    cardEl.style.transform = `translate(${cx}px, ${cy}px)`;
    leadLine.setAttribute('points', pts.map((p) => p.map(Math.round).join(',')).join(' '));
    leadDot.setAttribute('x', ax - 4); leadDot.setAttribute('y', ay - 4);
  }
  function pick(ev) {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects(pops.filter((g) => g.visible && g.userData.kind), true);
    if (hits.length) {
      let g = hits[0].object;
      while (g && !(g.userData && g.userData.kind)) g = g.parent;
      if (g) return g;
    }
    return ray.intersectObject(guy, true).length ? guy : null;
  }
  function crossover() { st.queued = true; }
  let lastPointer = 'mouse';
  stage.addEventListener('pointerdown', (ev) => { lastPointer = ev.pointerType || 'mouse'; });
  stage.addEventListener('pointermove', (ev) => {
    if (ev.pointerType !== 'mouse' || pinnedCard) return;
    const t = pick(ev);
    setHot(t && t !== guy ? t : null);
    showCard(t, false);
    stage.style.cursor = t ? 'pointer' : '';
  });
  stage.addEventListener('pointerleave', (ev) => {
    if (ev.pointerType === 'mouse' && !pinnedCard) { setHot(null); showCard(null); }
  });
  // Mouse: a thing with one link opens it, a thing with several pins its card so you can pick.
  // Finger: the first tap always pins the card, and the card carries the links.
  stage.addEventListener('click', (ev) => {
    const t = pick(ev);
    // with a finger, tapping the thing whose card is open puts the card down
    if (lastPointer !== 'mouse' && pinnedCard && t && t === shown) { setHot(null); showCard(null); return; }
    if (!t) {
      if (pinnedCard) { setHot(null); showCard(null); } else crossover();
      return;
    }
    if (t === guy) { crossover(); showCard(guy, lastPointer !== 'mouse'); return; }
    const u = t.userData;
    if (lastPointer === 'mouse' && u.href && !(u.rows || []).some((r) => r.href)) { window.open(u.href, '_blank', 'noopener'); return; }
    setHot(t); showCard(t, true);
  });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && pinnedCard) { setHot(null); showCard(null); } });
  let scrollFrac = 0, lastWidth = window.innerWidth;
  function readScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const sc = max > 0 ? clamp01(window.scrollY / max) : 0;
    scrollFrac = sc;
    view.pT = clamp01(sc / BLOCK_END);
    view.cT = clamp01((sc - BLOCK_END) / (1 - BLOCK_END));
  }
  let pinScroll = 0;
  window.addEventListener('scroll', () => {
    readScroll();
    if (pinnedCard && view.fT === 1 && Math.abs(window.scrollY - pinScroll) > 60) { setHot(null); showCard(null); }
  }, { passive: true });

  // ---------- the closing shot and the chat it lands in ----------
  const QA = content.chat.questions.map((x) => ({ ...x }));
  const LINK_RX = /\[([^\]]+)\]\(([^)]+)\)/g;
  for (const it of QA) it.plain = it.a.replace(LINK_RX, '$1');
  function fillAnswer(node, it) {
    node.replaceChildren();
    let last = 0;
    for (const m of it.a.matchAll(LINK_RX)) {
      node.append(it.a.slice(last, m.index));
      const a = link('out', m[2]); a.textContent = m[1]; node.append(a);
      last = m.index + m[0].length;
    }
    node.append(it.a.slice(last));
    if (it.link) { const a = link('out', it.link[1]); a.textContent = it.link[0]; node.append(' ', a); }
  }
  const chatEl = document.getElementById('chat'), threadEl = document.getElementById('thread'), ballFx = document.getElementById('ballfx');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function drawAvatar(cv) {
    const rows = [
      '....hhhh....', '..hhhhhhhh..', '.hhhhhhhhhh.', '.hhhhhhhhhh.', '.hhsssssshh.', '.hssssssssh.',
      '..sesssses..', '..ssssssss..', '..sssmmsss..', '...ssssss...', '....ssss....', '..jjjjjjjj..',
    ];
    const col = { h: '#120d0b', s: '#5e3a24', e: '#120d0b', m: '#3d2416', j: '#c22a2a' };
    cv.width = 12; cv.height = 12;
    const g = cv.getContext('2d');
    g.fillStyle = '#e9dcc3'; g.fillRect(0, 0, 12, 12);
    rows.forEach((r, y) => [...r].forEach((c, x) => { if (col[c]) { g.fillStyle = col[c]; g.fillRect(x, y, 1, 1); } }));
  }
  drawAvatar(document.getElementById('avatar'));
  const hello = el('p', 'hello', content.chat.hello);
  threadEl.append(hello);
  let openQa = null, typer = 0;
  const qaEls = QA.map((item, i) => {
    const wrap = el('div', 'qa');
    const q = el('button', 'q', item.q); q.type = 'button'; q.setAttribute('aria-expanded', 'false');
    const a = el('div', 'a'); a.hidden = true;
    const face = document.createElement('canvas'); face.className = 'face'; drawAvatar(face);
    const bubble = el('p');
    a.append(bubble, face);
    q.addEventListener('click', () => toggleQa(i));
    wrap.append(q, a); threadEl.append(wrap);
    return { wrap, q, a, bubble, item };
  });
  function closeQa() {
    if (openQa === null) return;
    const o = qaEls[openQa];
    o.a.hidden = true; o.q.setAttribute('aria-expanded', 'false');
    clearInterval(typer); openQa = null;
  }
  function toggleQa(i) {
    const same = openQa === i;
    closeQa();
    if (same) return;
    const o = qaEls[i];
    openQa = i; o.q.setAttribute('aria-expanded', 'true'); o.a.hidden = false;
    // keep the reply in view inside the chat as it grows
    const keep = () => { const a = o.a.getBoundingClientRect(), t = threadEl.getBoundingClientRect(); if (a.bottom > t.bottom - 6) threadEl.scrollTop += a.bottom - t.bottom + 10; };
    const finish = () => { o.bubble.classList.remove('typing', 'dots'); fillAnswer(o.bubble, o.item); keep(); };
    if (reduced) { finish(); return; }
    o.bubble.textContent = ''; o.bubble.classList.add('dots');     // three dots first, like someone typing
    let n = -6;
    typer = setInterval(() => {
      n += 2;
      if (n <= 0) return;
      o.bubble.classList.remove('dots'); o.bubble.classList.add('typing');
      o.bubble.textContent = o.item.plain.slice(0, n);
      keep();
      if (n >= o.item.plain.length) { clearInterval(typer); finish(); }
    }, 28);
    o.a.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  const threadCue = scrollCue(threadEl, chatEl, content.chat.more, () => closing.open);
  const closing = { shot: false, made: false, open: false, busy: false };
  const askTab = document.getElementById('asktab'), chatX = document.getElementById('chatx');
  drawAvatar(document.getElementById('tabface'));
  let fxRaf = 0, fxTimer = 0;
  function drawBallFx() {
    const px = 3;                                               // one chunky pixel on screen
    const d = 0.24 * stage.clientHeight / (camera.top - camera.bottom);
    const n = Math.max(5, Math.round(d / px));
    paintBall(ballFx, n);
    ballFx.style.width = ballFx.style.height = `${n * px}px`;
    return n * px;
  }
  const toScreen = (w, out) => { _a.copy(w).project(camera); out.x = (_a.x * 0.5 + 0.5) * stage.clientWidth; out.y = (-_a.y * 0.5 + 0.5) * stage.clientHeight; return out; };
  const helloSpot = (pr, size) => { const hr = hello.getBoundingClientRect(); return { x: hr.left - pr.left + size / 2 + 6, y: hr.top - pr.top + hr.height / 2 }; };
  const handsWorld = new V3();
  function handsSpot() { guy.updateMatrixWorld(true); return guy.localToWorld(handsWorld.set(sh.side * CATCH.x, CATCH.y, CATCH.z)); }
  // One ball in the air between two places. `from` and `to` are read every frame, because both ends can be moving.
  function flyBall(from, to, T, rise, done) {
    if (reduced) { done(); return; }
    cancelAnimationFrame(fxRaf);
    const pr = stage.getBoundingClientRect(), size = drawBallFx(), t0 = performance.now();
    ballFx.classList.add('on');
    const step = (now) => {
      const u = Math.min(1, (now - t0) / T), a = from(pr, size), b = to(pr, size);
      const x = lerp(a.x, b.x, u), y = lerp(a.y, b.y, u * u) - Math.sin(Math.PI * Math.pow(u, 0.8)) * rise;
      ballFx.style.transform = `translate(${Math.round((x - size / 2) / 3) * 3}px, ${Math.round((y - size / 2) / 3) * 3}px) rotate(${Math.round(u * 6) * 90}deg)`;
      if (u < 1) fxRaf = requestAnimationFrame(step); else { ballFx.classList.remove('on'); done(); }
    };
    fxRaf = requestAnimationFrame(step);
  }
  function showThread() {
    hello.classList.add('in');
    qaEls.forEach((o, i) => setTimeout(() => o.wrap.classList.add('in'), reduced ? 0 : 140 + i * 70));
  }
  // the ball arrives in the chat and becomes the first thing said
  function ballToChat(originWorld) {
    closing.open = true; closing.busy = true;
    view.kT = 1;
    askTab.classList.remove('on');
    threadEl.scrollTop = 0;                                    // so the ball lands on a bubble you can see
    chatEl.classList.add('on');
    document.body.classList.add('chatting');
    const o = { x: 0, y: 0 }; toScreen(originWorld, o);
    flyBall(() => o, helloSpot, 900, Math.min(210, stage.clientHeight * 0.26), () => { showThread(); closing.busy = false; });
  }
  // closing the chat: "Ask me anything" turns back into the ball and comes home to his hands, and the camera pulls back to the block
  function closeChat() {
    if (!closing.open || closing.busy) return;
    closing.open = false; closing.busy = true; sh.closing = false;
    closeQa();
    hello.classList.remove('in');
    const pr = stage.getBoundingClientRect(), start = helloSpot(pr, drawBallFx()), end = { x: 0, y: 0 };
    // hands up for it
    sh.active = true; sh.t = 20; sh.w = 1; sh.phase = 'await'; sh.chasing = false; sh.relax = 1; ball.visible = false;
    fxTimer = setTimeout(() => { chatEl.classList.remove('on'); document.body.classList.remove('chatting'); view.kT = 0; qaEls.forEach((q) => q.wrap.classList.remove('in')); }, reduced ? 0 : 160);
    flyBall(() => start, () => toScreen(handsSpot(), end), 760, Math.min(170, stage.clientHeight * 0.2), () => {
      ball.visible = true; sh.stay = true; sh.phase = 'caught'; sh.tCatch = sh.t;     // caught: back to dribbling
      askTab.classList.add('on');
      closing.busy = false;
    });
  }
  // opening it again: the camera comes back in and he takes another one. It rims out again, into the chat.
  function openChat() {
    if (closing.open || closing.busy || !closing.made) return;
    closing.busy = true;
    askTab.classList.remove('on');
    view.kT = 1;
    fxTimer = setTimeout(() => { sh.closing = true; shootFrom(guy.position.x, guy.position.z); }, reduced ? 0 : 450);
  }
  function resetClosing() {
    cancelAnimationFrame(fxRaf); clearTimeout(fxTimer);
    closing.shot = false; closing.made = false; closing.open = false; closing.busy = false;
    view.kT = 1;
    chatEl.classList.remove('on'); document.body.classList.remove('chatting'); askTab.classList.remove('on');
    ballFx.classList.remove('on'); hello.classList.remove('in');
    qaEls.forEach((o) => o.wrap.classList.remove('in'));
    closeQa();
    // he has a ball and goes on dribbling
    sh.active = false; sh.w = 0; sh.closing = false; sh.stay = false; ball.visible = true;
    st.p = 0; st.Hs = st.He = H_NORMAL; st.T = T_NORMAL; st.cross = false; st.count = 0;
  }
  sh.onClose = () => { closing.made = true; ballToChat(sh.P1); };
  chatX.addEventListener('click', closeChat);
  askTab.addEventListener('click', openChat);
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && closing.open && !pinnedCard) closeChat(); });
  function closingAdvance() {
    threadCue();
    if (!closing.shot && view.cT >= 0.5 && view.c >= 0.42 && made && mv.mode === 'idle' && !sh.active) {
      closing.shot = true; sh.closing = true;
      shootFrom(guy.position.x, guy.position.z);
    }
    if (closing.shot && !closing.busy && view.cT < 0.3 && (sh.phase === 'rest' || !sh.active)) resetClosing();
  }

  // ---------- loop ----------
  function render() {
    pose();
    renderer.setRenderTarget(target);
    renderer.clear();
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.clear();
    postMat.uniforms.tDiffuse.value = target.texture;
    renderer.render(postScene, postCam);
  }

  window.addEventListener('resize', () => {
    // The page is a fixed number of screens tall, so a new window size moves every stage. When the
    // width changes (a rotated phone, a dragged window) put the visitor back at the same place.
    // Height-only changes are the phone's address bar sliding away: leave the scroll alone.
    if (window.innerWidth !== lastWidth) {
      lastWidth = window.innerWidth;
      window.scrollTo(0, scrollFrac * (document.documentElement.scrollHeight - window.innerHeight));
    }
    resize(); readScroll(); render();
  });

  resize();
  readScroll(); view.p = view.pT;
  startCycle();
  blockAdvance(0);
  render();

  let last = performance.now();
  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    advance(dt);
    blockAdvance(dt);
    render();
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // For the browser checks only: add ?debug to the address.
  if (params.has('debug')) {
    window.__block = {
      world: { st, mv, sh, guy, ball, view, pops, closing, camera },
      closeChat, openChat,
      // the thing whose card is showing, and where it stands
      shown: () => (shown ? { kind: dataOf(shown).kind, x: shown.position.x, z: shown.position.z } : null),
      // where a thing is on screen, in css pixels
      where: (kind, n = 0) => {
        const g = kind === 'guy' ? guy : pops.filter((x) => x.userData.kind === kind && x.visible)[n];
        if (!g) return null;
        const u = dataOf(g), v = new V3();
        if (u.anchor) v.copy(u.anchor); else { v.copy(g.position); v.y += (u.h || 2.5) * 0.8; }
        v.project(camera);
        return { x: (v.x * 0.5 + 0.5) * stage.clientWidth, y: (-v.y * 0.5 + 0.5) * stage.clientHeight };
      },
    };
  }

  running = () => {};
  return running;
}
