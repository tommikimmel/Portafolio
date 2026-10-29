import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';

// Escena del escritorio en metros. La tapa del escritorio está en y = 0.
const SCREENS = {
  center: { w: 0.708, h: 0.398 }, // 32" 16:9 horizontal
  side: { w: 0.299, h: 0.531 },   // 24" 16:9 rotado a vertical
};
const BEZEL = 0.011;
const TEX = '/scene/';

function loadTex(loader, name, { srgb = false, repeat = [1, 1], rotate = 0 } = {}) {
  const t = loader.load(TEX + name);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat);
  t.center.set(0.5, 0.5);
  t.rotation = rotate;
  t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Homografía: mapea el rectángulo (0,0)-(w,h) de un elemento DOM sobre 4 puntos proyectados.
function solve(A, b) {
  const n = b.length;
  for (let i = 0; i < n; i++) {
    let max = i;
    for (let r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[max][i])) max = r;
    [A[i], A[max]] = [A[max], A[i]];
    [b[i], b[max]] = [b[max], b[i]];
    for (let r = i + 1; r < n; r++) {
      const f = A[r][i] / A[i][i];
      for (let c = i; c < n; c++) A[r][c] -= f * A[i][c];
      b[r] -= f * b[i];
    }
  }
  const x = new Array(n);
  for (let i = n - 1; i >= 0; i--) {
    let s = b[i];
    for (let c = i + 1; c < n; c++) s -= A[i][c] * x[c];
    x[i] = s / A[i][i];
  }
  return x;
}

export function quadToMatrix3d(w, h, [p0, p1, p2, p3]) {
  const from = [[0, 0], [w, 0], [w, h], [0, h]];
  const to = [p0, p1, p2, p3];
  const A = [];
  const b = [];
  for (let i = 0; i < 4; i++) {
    const [fx, fy] = from[i];
    const [tx, ty] = to[i];
    A.push([fx, fy, 1, 0, 0, 0, -fx * tx, -fy * tx]);
    b.push(tx);
    A.push([0, 0, 0, fx, fy, 1, -fx * ty, -fy * ty]);
    b.push(ty);
  }
  const m = solve(A, b);
  return `matrix3d(${[m[0], m[3], 0, m[6], m[1], m[4], 0, m[7], 0, 0, 1, 0, m[2], m[5], 0, 1].join(',')})`;
}

function buildMonitor(screen, mats, standHeight) {
  const group = new THREE.Group();
  const { w, h } = screen;
  const chin = 0.008;
  const depth = 0.028;

  const body = new THREE.Mesh(new RoundedBoxGeometry(w + BEZEL * 2, h + BEZEL * 2 + chin, depth, 3, 0.005), mats.metal);
  body.position.y = standHeight + (h + BEZEL * 2 + chin) / 2;
  body.castShadow = true;
  group.add(body);

  // Panel brillante: refleja la lámpara; el contenido lo pone el DOM encima.
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mats.panel.clone());
  panel.position.set(0, standHeight + chin + BEZEL + h / 2, depth / 2 + 0.0006);
  group.add(panel);

  // Placa VESA en la espalda: ahí se engancha el brazo
  const mountY = panel.position.y;
  const vesa = new THREE.Mesh(new RoundedBoxGeometry(0.11, 0.11, 0.014, 2, 0.003), mats.metal);
  vesa.position.set(0, mountY, -depth / 2 - 0.007);
  vesa.castShadow = true;
  group.add(vesa);

  return { group, panel, mount: new THREE.Vector3(0, mountY, -depth / 2 - 0.014) };
}

function buildKeyboard(mats) {
  const group = new THREE.Group();
  const deck = new THREE.Mesh(new RoundedBoxGeometry(0.44, 0.016, 0.135, 2, 0.004), mats.white);
  deck.position.y = 0.008;
  deck.castShadow = true;
  deck.receiveShadow = true;
  group.add(deck);

  const cols = 15;
  const rows = 5;
  const key = new RoundedBoxGeometry(0.0235, 0.008, 0.0225, 2, 0.003);
  const keys = new THREE.InstancedMesh(key, mats.keycap, cols * rows);
  const m = new THREE.Matrix4();
  let i = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      m.makeTranslation(-0.196 + c * 0.028, 0.02, -0.05 + r * 0.025);
      keys.setMatrixAt(i++, m);
    }
  }
  keys.castShadow = true;
  group.add(keys);
  return group;
}

// Mouse ergonómico: esfera deformada (joroba trasera, frente bajo, base plana) + ruedita y separación de botones
function buildMouse(mats) {
  const group = new THREE.Group();
  const L = 0.062; // medio largo
  const W = 0.03;  // medio ancho
  const H = 0.03;  // alto máximo
  const geo = new THREE.SphereGeometry(1, 64, 48);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i); // -1 = frente (hacia los monitores), +1 = atrás
    const hump = 0.42 + 0.58 * Math.exp(-((z - 0.32) ** 2) / 0.38);
    const taper = 1 - 0.16 * Math.max(0, -z) + 0.04 * Math.max(0, z);
    pos.setXYZ(i, x * W * taper, y > 0 ? y * H * hump : y * 0.0035, z * L);
  }
  geo.computeVertexNormals();
  const body = new THREE.Mesh(geo, mats.mouse);
  body.position.y = 0.0035;
  body.castShadow = true;
  group.add(body);

  // Altura de la superficie en el eje central a una posición z (para apoyar detalles encima)
  const topAt = (zn) => 0.0035 + H * (0.42 + 0.58 * Math.exp(-((zn - 0.32) ** 2) / 0.38)) * Math.sqrt(Math.max(0, 1 - zn * zn));

  // Zócalo oscuro: separa el cuerpo del pad y define la silueta
  const skirt = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.003, 48), mats.mouseDark);
  skirt.scale.set(W * 0.99, 1, L * 0.99);
  skirt.position.y = 0.0015;
  group.add(skirt);

  const wz = -0.38;
  const slot = new THREE.Mesh(new RoundedBoxGeometry(0.009, 0.003, 0.026, 2, 0.0012), mats.mouseDark);
  slot.position.set(0, topAt(wz) - 0.0008, wz * L);
  slot.rotation.x = -0.28;
  group.add(slot);

  const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.0068, 0.0068, 0.0058, 28), mats.mouseWheel);
  wheel.rotation.z = Math.PI / 2;
  wheel.position.set(0, topAt(wz) - 0.0038, wz * L);
  group.add(wheel);

  // Botones laterales (pulgar) del lado izquierdo
  for (const [zn, len] of [[-0.2, 0.013], [0.06, 0.012]]) {
    const side = new THREE.Mesh(new RoundedBoxGeometry(0.0016, 0.0042, len, 2, 0.0007), mats.mouseDark);
    side.position.set(-W * (1 - 0.16 * Math.max(0, -zn)) - 0.0004, 0.0035 + H * 0.42, zn * L);
    group.add(side);
  }

  // Corte transversal donde terminan los botones principales
  const cz = -0.05;
  const arc = [];
  for (let i = 0; i <= 40; i++) {
    const t = (i / 40) * Math.PI;
    const r = Math.sqrt(1 - cz * cz);
    const hump = 0.42 + 0.58 * Math.exp(-((cz - 0.32) ** 2) / 0.38);
    arc.push(new THREE.Vector3(Math.cos(t) * r * W * (1 - 0.16 * Math.max(0, -cz)), 0.0035 + Math.sin(t) * r * H * hump + 0.0002, cz * L));
  }
  const cross = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(arc), 48, 0.00045, 6), mats.mouseDark);
  group.add(cross);

  // Línea entre botones izquierdo y derecho, sobre la mitad delantera
  const seam = new THREE.Mesh(new THREE.BoxGeometry(0.0007, 0.0009, L * 0.42), mats.mouseDark);
  seam.position.set(0, topAt(-0.8) + 0.0006, -0.8 * L + L * 0.21);
  seam.rotation.x = -0.42;
  group.add(seam);

  return group;
}

function buildMug(mats) {
  const group = new THREE.Group();
  const r = 0.041;
  const hgt = 0.095;
  const profile = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(r - 0.004, 0),
    new THREE.Vector2(r, 0.004),
    new THREE.Vector2(r + 0.002, hgt),
    new THREE.Vector2(r - 0.004, hgt),
    new THREE.Vector2(r - 0.006, 0.012),
    new THREE.Vector2(0, 0.012),
  ];
  const body = new THREE.Mesh(new THREE.LatheGeometry(profile, 48), mats.ceramic);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const coffee = new THREE.Mesh(new THREE.CircleGeometry(r - 0.006, 40), mats.coffee);
  coffee.rotation.x = -Math.PI / 2;
  coffee.position.y = hgt - 0.014;
  group.add(coffee);

  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.0065, 16, 32, Math.PI * 1.15), mats.ceramic);
  handle.rotation.z = -Math.PI * 0.575;
  handle.position.set(r + 0.006, hgt * 0.52, 0);
  handle.castShadow = true;
  group.add(handle);

  return { group, top: new THREE.Vector3(0, hgt, 0) };
}

function buildLamp(mats) {
  const group = new THREE.Group();
  const shadeProfile = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    // Domo industrial: casi plano arriba, abre hacia el borde
    shadeProfile.push(new THREE.Vector2(0.012 + Math.sin(t * Math.PI * 0.5) * 0.1, -Math.pow(t, 1.6) * 0.085));
  }
  const shade = new THREE.Mesh(new THREE.LatheGeometry(shadeProfile, 64), mats.lampShade);
  shade.castShadow = false;
  group.add(shade);

  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.024, 24, 16), mats.bulb);
  bulb.position.y = -0.055;
  group.add(bulb);

  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 1.2, 8), mats.metal);
  cord.position.y = 0.6;
  group.add(cord);

  return { group, bulb };
}

// Segmento de brazo entre dos puntos (eje local Z alineado con el tramo)
function armSegment(a, b, thick, mat) {
  const len = a.distanceTo(b);
  const seg = new THREE.Mesh(new RoundedBoxGeometry(thick, thick * 0.8, len + thick, 2, thick * 0.3), mat);
  seg.position.copy(a).add(b).multiplyScalar(0.5);
  seg.lookAt(b);
  seg.castShadow = true;
  return seg;
}

function joint(at, r, mat) {
  const j = new THREE.Mesh(new THREE.CylinderGeometry(r, r, r * 1.6, 24), mat);
  j.position.copy(at);
  j.castShadow = true;
  return j;
}

// Brazo hidráulico triple: columna con abrazadera al escritorio y un brazo a gas por monitor
function buildMonitorArm(monitors, mats) {
  const group = new THREE.Group();
  const poleX = 0;
  const poleZ = -0.47;
  const poleH = 0.5;

  const clamp = new THREE.Mesh(new RoundedBoxGeometry(0.09, 0.03, 0.12, 2, 0.006), mats.metal);
  clamp.position.set(poleX, 0.015, poleZ);
  clamp.castShadow = true;
  group.add(clamp);

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, poleH, 24), mats.metal);
  pole.position.set(poleX, poleH / 2, poleZ);
  pole.castShadow = true;
  group.add(pole);

  for (const mon of monitors) {
    mon.group.updateMatrixWorld(true);
    const end = mon.group.localToWorld(mon.mount.clone());
    const start = new THREE.Vector3(poleX, end.y - 0.05, poleZ);
    // El codo queda detrás del monitor, a mitad de camino, un poco más bajo (brazo a gas)
    const elbow = start.clone().lerp(end, 0.5);
    elbow.z = Math.min(start.z, end.z) - 0.02;
    elbow.y -= 0.035;
    const wrist = end.clone().add(new THREE.Vector3(0, 0, -0.035).applyQuaternion(mon.group.quaternion));

    group.add(joint(start, 0.022, mats.metal));
    group.add(armSegment(start, elbow, 0.03, mats.metal));
    // Pistón a gas paralelo al tramo inferior
    group.add(armSegment(start.clone().add(new THREE.Vector3(0, -0.022, 0)), elbow.clone().add(new THREE.Vector3(0, -0.018, 0)), 0.012, mats.chrome));
    group.add(joint(elbow, 0.018, mats.metal));
    group.add(armSegment(elbow, wrist, 0.026, mats.metal));
    group.add(joint(wrist, 0.015, mats.metal));
    group.add(armSegment(wrist, end, 0.02, mats.metal));
  }
  return group;
}

export function createDeskScene(stage, { getOverlays, steam, onReady, reducedMotion, onError }) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  } catch (err) {
    onError?.(err);
    return { dispose() {}, focus() {} };
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.className = 'hero-canvas';
  renderer.domElement.setAttribute('aria-hidden', 'true');
  stage.prepend(renderer.domElement);

  RectAreaLightUniformsLib.init();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#2a2622');

  const camera = new THREE.PerspectiveCamera(28, 1, 0.05, 20);
  const target = new THREE.Vector3(0, 0.33, -0.2);
  const camBase = new THREE.Vector3(0, 0.48, 1.75);
  camera.position.copy(camBase);

  const manager = new THREE.LoadingManager();
  const loader = new THREE.TextureLoader(manager);

  const mats = {
    metal: new THREE.MeshStandardMaterial({ color: '#141312', roughness: 0.62, metalness: 0.35 }),
    keycap: new THREE.MeshStandardMaterial({ color: '#f4f2ee', roughness: 0.62, metalness: 0 }),
    white: new THREE.MeshStandardMaterial({ color: '#e4e1dc', roughness: 0.5, metalness: 0 }),
    chrome: new THREE.MeshStandardMaterial({ color: '#9a9690', roughness: 0.25, metalness: 0.9 }),
    mouse: new THREE.MeshPhysicalMaterial({ color: '#ecebe8', roughness: 0.38, clearcoat: 0.35, clearcoatRoughness: 0.4 }),
    mouseDark: new THREE.MeshStandardMaterial({ color: '#2b2a28', roughness: 0.6 }),
    mouseWheel: new THREE.MeshStandardMaterial({ color: '#4a4845', roughness: 0.45, metalness: 0.2 }),
    pad: new THREE.MeshStandardMaterial({ color: '#0c0c0c', roughness: 0.97, metalness: 0 }),
    panel: new THREE.MeshStandardMaterial({ color: '#050505', roughness: 0.18, metalness: 0.1, emissive: '#0d0c0b' }),
    ceramic: new THREE.MeshPhysicalMaterial({ color: '#1b1917', roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.35 }),
    coffee: new THREE.MeshStandardMaterial({ color: '#2a170c', roughness: 0.15 }),
    lampShade: new THREE.MeshStandardMaterial({ color: '#121110', roughness: 0.55, metalness: 0.5, side: THREE.DoubleSide }),
    bulb: new THREE.MeshStandardMaterial({ color: '#ffe2b8', emissive: '#ffc480', emissiveIntensity: 6 }),
    wood: new THREE.MeshStandardMaterial({
      map: loadTex(loader, 'oak_veneer_01_diff.webp', { srgb: true, repeat: [0.55, 1.4], rotate: Math.PI / 2 }),
      normalMap: loadTex(loader, 'oak_veneer_01_nor.webp', { repeat: [0.55, 1.4], rotate: Math.PI / 2 }),
      roughnessMap: loadTex(loader, 'oak_veneer_01_rough.webp', { repeat: [0.55, 1.4], rotate: Math.PI / 2 }),
      roughness: 0.8,
    }),
    wall: new THREE.MeshStandardMaterial({
      normalMap: loadTex(loader, 'concrete_wall_006_nor.webp', { repeat: [3, 1.5] }),
      normalScale: new THREE.Vector2(0.3, 0.3),
      roughnessMap: loadTex(loader, 'concrete_wall_006_rough.webp', { repeat: [3, 1.5] }),
      color: '#ebe7e1', // pared pintada de blanco: solo conserva el relieve del hormigón
    }),
  };

  // Pared y escritorio
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(6, 3), mats.wall);
  wall.position.set(0, 0.7, -0.55);
  wall.receiveShadow = true;
  scene.add(wall);

  const deskW = 2.2;
  const top = new THREE.Mesh(new RoundedBoxGeometry(deskW, 0.04, 1.6, 2, 0.006), mats.wood);
  top.position.set(0, -0.02, 0.25);
  top.receiveShadow = true;
  top.castShadow = true;
  scene.add(top);

  // Bastidor de metal negro bajo la tapa
  const frame = new THREE.Mesh(new THREE.BoxGeometry(deskW - 0.1, 0.05, 0.03), mats.metal);
  frame.position.set(0, -0.065, 1.02);
  scene.add(frame);
  for (const x of [-deskW / 2 + 0.06, deskW / 2 - 0.06]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.8, 0.04), mats.metal);
    leg.position.set(x, -0.44, 1.0);
    scene.add(leg);
  }

  // Monitores: central horizontal más grande, laterales iguales en vertical y girados hacia el centro
  const standH = 0.11;
  const center = buildMonitor(SCREENS.center, mats, standH + 0.06);
  center.group.position.set(0, 0, -0.3);
  scene.add(center.group);

  const sideX = SCREENS.center.w / 2 + BEZEL * 2 + 0.03 + SCREENS.side.w / 2 + 0.02;
  const left = buildMonitor(SCREENS.side, mats, standH);
  left.group.position.set(-sideX, 0, -0.24);
  left.group.rotation.y = 0.38;
  scene.add(left.group);

  const right = buildMonitor(SCREENS.side, mats, standH);
  right.group.position.set(sideX, 0, -0.24);
  right.group.rotation.y = -0.38;
  scene.add(right.group);

  scene.add(buildMonitorArm([left, center, right], mats));

  // Mousepad XXL negro bajo teclado y mouse
  const pad = new THREE.Mesh(new RoundedBoxGeometry(0.92, 0.004, 0.36, 2, 0.0018), mats.pad);
  pad.position.set(0.06, 0.002, 0.14);
  pad.receiveShadow = true;
  scene.add(pad);

  const keyboard = buildKeyboard(mats);
  keyboard.position.set(0, 0.004, 0.13);
  scene.add(keyboard);

  const mouse = buildMouse(mats);
  mouse.position.set(0.37, 0.004, 0.16);
  mouse.rotation.y = 0.62;
  scene.add(mouse);

  const mug = buildMug(mats);
  mug.group.position.set(0.62, 0, 0.1);
  mug.group.rotation.y = -0.5;
  scene.add(mug.group);

  const lamp = buildLamp(mats);
  lamp.group.position.set(0.42, 0.85, 0.02);
  scene.add(lamp.group);

  // Luces: lámpara cálida con sombra, rebote tenue y el brillo de las pantallas
  scene.add(new THREE.HemisphereLight('#f4f1ec', '#2a2520', 0.95));
  // Relleno frontal neutro: la pared se lee blanca, la lámpara sigue siendo la luz cálida
  const fill = new THREE.DirectionalLight('#f3f0ea', 0.55);
  fill.position.set(-0.6, 1.2, 2.2);
  scene.add(fill);

  const spot = new THREE.SpotLight('#ffdcb4', 3.2, 0, 1.05, 0.85, 1.6);
  spot.position.set(0.42, 0.795, 0.02);
  spot.target.position.set(0.2, 0, -0.05);
  spot.castShadow = true;
  spot.shadow.mapSize.set(1024, 1024);
  spot.shadow.bias = -0.0004;
  spot.shadow.radius = 6;
  scene.add(spot, spot.target);

  const wallWash = new THREE.PointLight('#ffc48a', 0.15, 2.2, 2);
  wallWash.position.set(0.42, 0.85, -0.35);
  scene.add(wallWash);

  for (const mon of [left, center, right]) {
    const p = new THREE.Vector3();
    mon.panel.getWorldPosition(p);
    const glow = new THREE.RectAreaLight('#d9e2ff', mon === center ? 1.6 : 1.1, SCREENS.side.w, 0.3);
    glow.position.copy(p).add(new THREE.Vector3(0, 0, 0.02));
    glow.lookAt(p.x, 0, 0.6);
    scene.add(glow);
  }

  // Encuadres: 'all' (desktop, los tres monitores) y 'focus' (mobile, un monitor por vez, de frente)
  const monitors = [left, center, right];
  let mode = 'all';
  let focusIndex = 0;
  const lookAt = target.clone(); // punto que mira la cámara, interpolado hacia target

  // Overlays DOM sobre cada panel
  const panels = { left: left.panel, center: center.panel, right: right.panel };
  const size = { w: 1, h: 1 };
  const corner = new THREE.Vector3();

  const project = (v) => {
    corner.copy(v).project(camera);
    return [((corner.x + 1) / 2) * size.w, ((1 - corner.y) / 2) * size.h];
  };

  const placeOverlays = () => {
    for (const [key, el] of Object.entries(getOverlays())) {
      const panel = panels[key];
      if (!el || !panel) continue;
      const { width: w, height: h } = panel.geometry.parameters;
      const pts = [
        [-w / 2, h / 2],
        [w / 2, h / 2],
        [w / 2, -h / 2],
        [-w / 2, -h / 2],
      ].map(([x, y]) => project(panel.localToWorld(new THREE.Vector3(x, y, 0.0005))));
      el.style.transform = quadToMatrix3d(el.offsetWidth, el.offsetHeight, pts);
    }
    if (steam) {
      const [x, y] = project(mug.group.localToWorld(mug.top.clone()));
      steam.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`;
    }
  };

  const halfTan = () => Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));

  const reframe = () => {
    if (mode === 'all') {
      // Distancia para que entren ~1.62 m de ancho y ~0.9 m de alto
      const dist = Math.max(1.62 / (2 * halfTan() * camera.aspect), 0.9 / (2 * halfTan()));
      target.set(0, 0.34, -0.2);
      camBase.set(0, 0.62, -0.2 + dist);
      return;
    }
    // El panel enfocado ocupa ~86% del ancho (o ~58% del alto) y deja ver escritorio debajo
    const mon = monitors[focusIndex];
    const { width: w, height: h } = mon.panel.geometry.parameters;
    mon.panel.updateMatrixWorld(true);
    const center3 = mon.panel.getWorldPosition(new THREE.Vector3());
    const fill = w > h ? 0.93 : 0.86; // el horizontal aprovecha casi todo el ancho
    const dist = Math.max(w / fill / (2 * halfTan() * camera.aspect), h / 0.58 / (2 * halfTan()));
    const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(mon.group.quaternion);
    // Vertical: deja ver escritorio debajo. Horizontal: mira más arriba para que el borde del escritorio quede fuera
    target.copy(center3).add(new THREE.Vector3(0, w > h ? h * 0.12 : -h * 0.16, 0));
    camBase.copy(center3).addScaledVector(normal, dist).add(new THREE.Vector3(0, 0.05, 0));
  };

  const resize = () => {
    size.w = stage.clientWidth;
    size.h = stage.clientHeight;
    renderer.setSize(size.w, size.h, false);
    camera.aspect = size.w / size.h;
    camera.updateProjectionMatrix();
    mode = size.w < 900 ? 'focus' : 'all';
    reframe();
  };

  // Paralaje suave con el puntero
  const pointer = { x: 0, y: 0 };
  const onPointer = (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  if (!reducedMotion) window.addEventListener('pointermove', onPointer, { passive: true });

  let visible = true;
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  });
  io.observe(stage);

  const ro = new ResizeObserver(resize);
  ro.observe(stage);
  resize();

  let raf = 0;
  let first = true;
  const tick = () => {
    raf = requestAnimationFrame(tick);
    if (!visible) return;
    const k = mode === 'all' && !reducedMotion ? 1 : 0;
    const tx = camBase.x + pointer.x * 0.05 * k;
    const ty = camBase.y - pointer.y * 0.025 * k;
    // Movimiento con ease-out exponencial; con reduced motion salta directo
    const ease = first || reducedMotion ? 1 : mode === 'all' ? 0.06 : 0.085;
    camera.position.x += (tx - camera.position.x) * ease;
    camera.position.y += (ty - camera.position.y) * ease;
    camera.position.z += (camBase.z - camera.position.z) * ease;
    lookAt.lerp(target, ease);
    camera.lookAt(lookAt);
    first = false;
    renderer.render(scene, camera);
    placeOverlays();
  };

  manager.onLoad = () => onReady?.();
  tick();

  const dispose = () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('pointermove', onPointer);
    io.disconnect();
    ro.disconnect();
    renderer.dispose();
    scene.traverse((o) => {
      o.geometry?.dispose();
      if (o.material) [].concat(o.material).forEach((m) => {
        Object.values(m).forEach((v) => v?.isTexture && v.dispose());
        m.dispose();
      });
    });
    renderer.domElement.remove();
  };

  return {
    dispose,
    // Mobile: lleva la cámara al monitor i (0 izquierdo, 1 central, 2 derecho)
    focus(i) {
      focusIndex = (i + monitors.length) % monitors.length;
      reframe();
    },
  };
}
