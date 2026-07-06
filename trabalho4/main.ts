import * as THREE from 'three';
import './styles.css';

type DancingLight = {
  light: THREE.SpotLight;
  marker: THREE.Mesh;
  targetMesh: THREE.Mesh;
  baseX: number;
  baseZ: number;
  sweepSpeed: number;
  sweepRadius: number;
  phase: number;
  blinkSpeed: number;
  blinkPhase: number;
  baseIntensity: number;
};

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('Elemento #app nao encontrado.');
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0512); // Tom roxo escuro de balada para dar contraste
scene.fog = new THREE.FogExp2(0x0a0512, 0.04); // Fumaça de gelo seco para destacar os feixes de luz

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 5, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true }); // renderizador + sombra suave
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
app.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.35); // Luz ambiente clara
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffea88, 1.5); // luz direcional amarela
directionalLight.position.set(4, 12, 6);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
scene.add(directionalLight); // adiciona na cena

// --- PISTA DE DANÇA ---
const floorGroup = new THREE.Group();
const floor = new THREE.Mesh(
  new THREE.BoxGeometry(18, 0.2, 18),
  new THREE.MeshPhongMaterial({
    color: 0x14121c,
    shininess: 80,
    specular: 0x444444
  })
);
floor.receiveShadow = true;
floorGroup.add(floor);

const gridHelper = new THREE.GridHelper(18, 18, 0xff00ff, 0x00ffff);
gridHelper.position.y = 0.11;
const gridMaterial = gridHelper.material as any;
gridMaterial.transparent = true;
gridMaterial.opacity = 0.25;
floorGroup.add(gridHelper);
scene.add(floorGroup); // adiciona  a base quadriculada.

const stage = new THREE.Mesh(
  new THREE.CylinderGeometry(3.2, 3.4, 0.3, 32),
  new THREE.MeshStandardMaterial({ color: 0x221f2d, roughness: 0.3, metalness: 0.5 })
);
stage.position.y = 0.15;
stage.receiveShadow = true;
scene.add(stage); // adição do palco redondo

const centerGroup = new THREE.Group(); // GRUPO CRIADO PARA  CENTRALIZAR OS OBJETOS NO PALCO REDONDO
centerGroup.position.y = 1.8; 
scene.add(centerGroup);

const leftObject = new THREE.Mesh(
  new THREE.SphereGeometry(0.9, 16, 12), // Esfera estilizada facetada
  new THREE.MeshLambertMaterial({
    color: 0xff4181,
    emissive: 0x3a0015,
  })
);
leftObject.position.set(-1.4, 0, 0);
leftObject.castShadow = true;
centerGroup.add(leftObject); // Adiciona no grupo centralizado

const rightObject = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.65, 0.22, 120, 16), // Nó de alta reflexão especular
  new THREE.MeshPhongMaterial({
    color: 0x00e5ff,
    shininess: 160,
    specular: 0xffffff, // Brilho reflexivo branco
    emissive: 0x002a3a,
  })
);
rightObject.position.set(1.4, 0, 0);
rightObject.castShadow = true;
centerGroup.add(rightObject); // adiciona mais um objeto centralizado 


const makeMovingHeadMarker = (color: number) => {
  const group = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.1, 16), new THREE.MeshStandardMaterial({ color: 0x222222 }));
  base.position.y = 0.15;
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.12, 0.4, 16), new THREE.MeshBasicMaterial({ color }));
  head.rotation.x = Math.PI / 2;
  group.add(base, head);
  return { group, headMesh: head };
};

const makeDancingLight = (options: {
  color: number;
  baseX: number; // Posição fixa X no teto
  baseZ: number; // Posição fixa Z no teto
  height: number; // Altura fixa no teto
  sweepSpeed: number; // Velocidade do movimento do feixe
  sweepRadius: number; // Amplitude do movimento (o quanto joga para os lados)
  phase: number;
  blinkSpeed: number; // Velocidade do pisca
  blinkPhase: number;
  intensity: number;
}) => {
  const light = new THREE.SpotLight(options.color, options.intensity, 30, 0.38, 0.5, 1.0);
  light.castShadow = true;
  light.shadow.mapSize.width = 512;
  light.shadow.mapSize.height = 512;
  light.position.set(options.baseX, options.height, options.baseZ);

  const targetMesh = new THREE.Mesh(new THREE.SphereGeometry(0.05), new THREE.MeshBasicMaterial({ visible: false }));
  scene.add(targetMesh);
  light.target = targetMesh;

  const markerComponents = makeMovingHeadMarker(options.color);
  markerComponents.group.position.set(options.baseX, options.height, options.baseZ);
  scene.add(markerComponents.group);
  scene.add(light);

  return {
    light,
    marker: markerComponents.headMesh,
    targetMesh,
    baseX: options.baseX,
    baseZ: options.baseZ,
    sweepSpeed: options.sweepSpeed,
    sweepRadius: options.sweepRadius,
    phase: options.phase,
    blinkSpeed: options.blinkSpeed,
    blinkPhase: options.blinkPhase,
    baseIntensity: options.intensity,
  } satisfies DancingLight;
};

const dancingLights: DancingLight[] = [
  makeDancingLight({
    color: 0xff0000,
    baseX: 3.5,
    baseZ: -3.5,
    height: 7.5,
    sweepSpeed: 1.5,
    sweepRadius: 4.0,
    phase: 0.0,
    blinkSpeed: 10.0,
    blinkPhase: 0.0,
    intensity: 22,
  }),

  makeDancingLight({
    color: 0x00ff00,
    baseX: -3.5,
    baseZ: -3.5,
    height: 7.5,
    sweepSpeed: 1.1,
    sweepRadius: 4.5,
    phase: Math.PI / 2,
    blinkSpeed: 7.0,
    blinkPhase: Math.PI / 3,
    intensity: 22,
  }),
  makeDancingLight({
    color: 0x0000ff,
    baseX: 0.0,
    baseZ: 4.0,
    height: 7.0,
    sweepSpeed: 1.8,
    sweepRadius: 3.5,
    phase: Math.PI,
    blinkSpeed: 13.0,
    blinkPhase: Math.PI / 1.5,
    intensity: 22,
  }),
];

// --- LOOP DE ANIMAÇÃO ---
const clock = new THREE.Clock();

const animate = () => {
  requestAnimationFrame(animate);

  const elapsed = clock.getElapsedTime();

  // Rotação dos objetos centrais
  leftObject.rotation.x = elapsed * 0.6;
  leftObject.rotation.y = elapsed * 0.9;
  
  rightObject.rotation.y = elapsed * 1.1;
  rightObject.rotation.z = elapsed * 0.5;

  // Controlando as Luzes Coloridas de Balada
  dancingLights.forEach((clubLight) => {
    // 1. Movimento dos Alvos (Os aparelhos estão fixos no teto, mas jogam a luz de um lado para o outro)
    const angle = elapsed * clubLight.sweepSpeed + clubLight.phase;
    
    // Calcula as coordenadas na pista onde o raio vai bater (varredura em formato oval/leque)
    const targetX = Math.sin(angle) * clubLight.sweepRadius;
    const targetZ = Math.cos(angle * 0.5) * (clubLight.sweepRadius * 0.7);
    
    clubLight.targetMesh.position.set(targetX, 0.3, targetZ);

    // Faz a lente do canhão físico apontar dinamicamente para onde o feixe de luz está indo
    clubLight.marker.lookAt(targetX, 0.3, targetZ);
    clubLight.marker.rotateX(Math.PI / 2);

    // 2. Efeito Estroboscópico de Balada Real (Pisca-Pisca Rápido e Agressivo)
    const wave = Math.sin(elapsed * clubLight.blinkSpeed + clubLight.blinkPhase);
    const isOn = wave > -0.1 ? 1 : 0; // Se mantem aceso e corta instantaneamente para simular o flash

    clubLight.light.intensity = clubLight.baseIntensity * isOn;
    
    // Modifica a cor emissiva da lente do canhão (brilha quando ativo, apaga no breu)
    const markerMaterial = clubLight.marker.material as THREE.MeshBasicMaterial;
    if (isOn > 0) {
      markerMaterial.color.setHex(clubLight.light.color.getHex());
    } else {
      markerMaterial.color.setHex(0x151515); // Cor de carcaça apagada
    }
  });

  // Câmera estática no ponto perfeito da pista para o professor avaliar a cena sem tontura
  camera.position.set(0, 5.5, 11);
  camera.lookAt(0, 1.8, 0);

  renderer.render(scene, camera);
};

animate();

// Responsividade
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});