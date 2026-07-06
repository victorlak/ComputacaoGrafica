
import * as THREE from 'three';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { FlyControls } from 'three/addons/controls/FlyControls.js';



const renderer = new THREE.WebGLRenderer({ antialias: true });


renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);


renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.setClearColor(0x0a0a1a);



document.getElementById('canvas-container').appendChild(renderer.domElement);


renderer.domElement.setAttribute('tabindex', '0');
renderer.domElement.style.outline = 'none';

renderer.domElement.addEventListener('click', () => {
  renderer.domElement.focus();
});


const scene = new THREE.Scene();

scene.fog = new THREE.Fog(0x0a0a1a, 50, 200);




const perspCamera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  500
);


const orthoHalfH = 22;
const orthoAspect = window.innerWidth / window.innerHeight;

const orthoCamera = new THREE.OrthographicCamera(
  -orthoHalfH * orthoAspect,
  orthoHalfH * orthoAspect,
  orthoHalfH,
  -orthoHalfH,
  0.1,
  500
);


const START_POSITION = new THREE.Vector3(0, 15, 35);
perspCamera.position.copy(START_POSITION);
perspCamera.lookAt(0, 0, 0);

orthoCamera.position.copy(START_POSITION);
orthoCamera.lookAt(0, 0, 0);


let activeCamera = perspCamera;
let activeProjection = 'perspective';


const trackball = new TrackballControls(activeCamera, renderer.domElement);
trackball.rotateSpeed = 4.0;
trackball.zoomSpeed = 1.5;
trackball.panSpeed = 1.0;
trackball.noZoom = false;
trackball.noPan = false;
trackball.staticMoving = true;
trackball.dynamicDampingFactor = 0.15;
trackball.target.set(0, 0, 0);
trackball.enabled = true;

const fly = new FlyControls(activeCamera, renderer.domElement);
fly.movementSpeed = 15;
fly.rollSpeed = 0.8;
fly.dragToLook = true;
fly.autoForward = false;
fly.enabled = false;

let activeControl = trackball;
let activeCtrlName = 'trackball';


const ambientLight = new THREE.AmbientLight(0x223355, 0.8);
scene.add(ambientLight);
const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
sunLight.position.set(20, 40, 20);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(2048, 2048); // resolução do mapa de sombra
sunLight.shadow.camera.near = 1;
sunLight.shadow.camera.far = 120;
sunLight.shadow.camera.left = sunLight.shadow.camera.bottom = -30;
sunLight.shadow.camera.right = sunLight.shadow.camera.top = 30;
scene.add(sunLight);

// Luz pontual azulada: adiciona um toque dramático
const pointLight = new THREE.PointLight(0x4488ff, 2, 60);
pointLight.position.set(-10, 12, 5);
scene.add(pointLight);

// Pequena esfera para visualizar onde está a luz pontual
const plHelper = new THREE.Mesh(
  new THREE.SphereGeometry(0.25, 8, 8),
  new THREE.MeshBasicMaterial({ color: 0x4488ff })
);
plHelper.position.copy(pointLight.position);
scene.add(plHelper);

const grid = new THREE.GridHelper(60, 30, 0x334466, 0x1a2233);

const floorGeo = new THREE.PlaneGeometry(60, 60);
const floorMat = new THREE.MeshLambertMaterial({
  color: 0x0d1a2a,
  side: THREE.DoubleSide,
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.01;
floor.receiveShadow = true;
scene.add(floor);

function makeMesh(geometry, material, position, castShadow = true) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}


const cubeRed = makeMesh(
  new THREE.BoxGeometry(3, 3, 3),
  new THREE.MeshPhongMaterial({ color: 0xff3355, shininess: 80 }),
  [-6, 1.5, 0]
);

// ── Cubo laranja (rotacionado) ───────────────────────────────────────────────
const cubeOrange = makeMesh(
  new THREE.BoxGeometry(2.5, 2.5, 2.5),
  new THREE.MeshPhongMaterial({ color: 0xff8800, shininess: 60 }),
  [6, 1.25, -4]
);
cubeOrange.rotation.y = Math.PI / 4; // 45 graus

// ── Esfera azul ──────────────────────────────────────────────────────────────
// widthSegments e heightSegments controlam a suavidade da esfera
const sphere = makeMesh(
  new THREE.SphereGeometry(2.2, 32, 32),
  new THREE.MeshPhongMaterial({ color: 0x22aaff, shininess: 120 }),
  [0, 2.2, 0]
);

// ── Cone verde ───────────────────────────────────────────────────────────────
const cone = makeMesh(
  new THREE.ConeGeometry(1.8, 5, 32),
  new THREE.MeshPhongMaterial({ color: 0x44ee66, shininess: 60 }),
  [4, 2.5, 6]
);

// ── Toroide roxo ─────────────────────────────────────────────────────────────
const torus = makeMesh(
  new THREE.TorusGeometry(2, 0.7, 16, 48),
  new THREE.MeshPhongMaterial({ color: 0xaa44ff, shininess: 100 }),
  [-8, 1.5, -6]
);

// ── Cilindro amarelo ─────────────────────────────────────────────────────────
const cylinder = makeMesh(
  new THREE.CylinderGeometry(1, 1, 4, 32),
  new THREE.MeshPhongMaterial({ color: 0xffdd00, shininess: 80 }),
  [10, 2, 2]
);

// ── Icosaedro (diamante) ciano ───────────────────────────────────────────────
const ico = makeMesh(
  new THREE.IcosahedronGeometry(2, 0),
  new THREE.MeshPhongMaterial({ color: 0x00ffcc, shininess: 150, wireframe: false }),
  [-3, 1.8, 8]
);

// ── Caixa wireframe para mostrar arestas ─────────────────────────────────────
const wireBox = makeMesh(
  new THREE.BoxGeometry(4, 4, 4),
  new THREE.MeshBasicMaterial({ color: 0x4488ff, wireframe: true }),
  [0, 2, -10]
);



const axes = new THREE.AxesHelper(8);
scene.add(axes);

[
  { pos: [8, 0, 0], color: 0xff2222 }, // X
  { pos: [0, 8, 0], color: 0x22ff22 }, // Y
  { pos: [0, 0, 8], color: 0x2222ff }, // Z
].forEach(({ pos, color }) => {
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 8, 8),
    new THREE.MeshBasicMaterial({ color })
  );
  ball.position.set(...pos);
  scene.add(ball);
});



function updateHUD() {
  // Texto amigável para o controle ativo
  const ctrlText = activeCtrlName === 'trackball' ? 'Trackball' : 'Fly';
  document.getElementById('hud-control').textContent = ctrlText;

  const projText = activeProjection === 'perspective' ? 'Perspectiva' : 'Ortográfica';
  document.getElementById('hud-proj').textContent = projText;
}


function switchProjection(tipo) {
  if (tipo === activeProjection) return;

  const pos = activeCamera.position.clone();

  const quat = activeCamera.quaternion.clone();

  if (tipo === 'perspective') {

    scene.fog = new THREE.Fog(0x0a0a1a, 50, 200);
    perspCamera.position.copy(pos);
    perspCamera.quaternion.copy(quat);
    perspCamera.updateProjectionMatrix();


    _rebindControls(perspCamera);

    activeCamera = perspCamera;
    activeProjection = 'perspective';

  } else {

    scene.fog = null;
    const aspect = window.innerWidth / window.innerHeight;
    orthoCamera.left = -orthoHalfH * aspect;
    orthoCamera.right = orthoHalfH * aspect;
    orthoCamera.top = orthoHalfH;
    orthoCamera.bottom = -orthoHalfH;


    orthoCamera.position.copy(pos);
    orthoCamera.quaternion.copy(quat);
    orthoCamera.updateProjectionMatrix();
    _rebindControls(orthoCamera);

    activeCamera = orthoCamera;
    activeProjection = 'orthographic';
  }

  updateHUD();
}



function switchControl(tipo) {
  if (tipo === activeCtrlName) return;

  if (tipo === 'trackball') {
    fly.enabled = false;

    trackball.object = activeCamera;
    trackball.target.set(0, 0, 0);
    trackball.enabled = true;
    trackball.update();

    activeControl = trackball;
    activeCtrlName = 'trackball';
  }

  if (tipo === 'fly') {
    trackball.enabled = false;

    fly.object = activeCamera;
    fly.enabled = true;

    renderer.domElement.focus();

    activeControl = fly;
    activeCtrlName = 'fly';
  }

  updateHUD();
}


function _rebindControls(camera) {
  trackball.object = camera;
  fly.object = camera;

  if (activeCtrlName === 'trackball') {
    trackball.target.set(0, 0, 0);
    trackball.update();
  }

  if (activeCtrlName === 'fly') {
    renderer.domElement.focus();
  }
}

document.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();

  if (['t', 'f', 'p', 'o'].includes(key)) {
    event.preventDefault();
  }

  switch (key) {
    case 't':
      switchControl('trackball');
      break;
    case 'f':
      switchControl('fly');
      break;
    case 'p':
      switchProjection('perspective');
      break;
    case 'o':
      switchProjection('orthographic');
      break;
  }
});

window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const aspect = w / h;
  renderer.setSize(w, h);

  // Atualiza a câmera perspectiva
  perspCamera.aspect = aspect;
  perspCamera.updateProjectionMatrix();

  // Atualiza os limites da câmera ortográfica
  orthoCamera.left = -orthoHalfH * aspect;
  orthoCamera.right = orthoHalfH * aspect;
  orthoCamera.updateProjectionMatrix();

  trackball.handleResize();
});



const animatedObjects = [
  { mesh: cubeRed, rx: 0.008, ry: 0.012 },
  { mesh: cubeOrange, rx: 0.005, ry: -0.010 },
  { mesh: sphere, rx: 0.006, ry: 0.008 },
  { mesh: torus, rx: 0.010, ry: 0.006 },
  { mesh: ico, rx: -0.007, ry: 0.012 },
  { mesh: wireBox, rx: 0.004, ry: -0.008 },
];
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  animatedObjects.forEach(({ mesh, rx, ry }) => {
    mesh.rotation.x += rx;
    mesh.rotation.y += ry;
  });

  if (activeCtrlName === 'trackball') {
    trackball.update();
  } else {
    fly.update(delta);
  }
  renderer.render(scene, activeCamera);
}

updateHUD();
animate();
