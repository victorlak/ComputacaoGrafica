import * as THREE from 'three'

// Cena
const scene = new THREE.Scene()

// Câmera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)

// Renderizador
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// 🔺 Pirâmide (cone com 4 lados = base quadrada)
const geometry = new THREE.ConeGeometry(2, 3, 4)
const material = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  wireframe: false
})

const pyramid = new THREE.Mesh(geometry, material)
scene.add(pyramid)

// posição inicial da câmera
let distance = 6
let direction = 1

camera.position.z = distance

// animação
function animate() {
  requestAnimationFrame(animate)

  // efeito de "zoom" (na verdade é a câmera)
  distance += 0.2 * direction

  if (distance > 10 || distance < 4) {
    direction *= -1
  }

  camera.position.z = distance

  renderer.render(scene, camera)
}

animate()

// responsividade
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight)
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
})