import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Configuración básica
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Agregar luz
const light = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(light);

// Agregar controles de cámara
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Movimiento suave
controls.dampingFactor = 0.05;

// Cargar el modelo FBX
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
const loader = new FBXLoader();

loader.load('/avatar.fbx', (model) => {
  model.scale.set(0.01, 0.01, 0.01);
  model.position.set(0, 0, 0);
  scene.add(model);
  model.traverse(child => {
    console.log(child.name); // Muestra el nombre de cada objeto en la jerarquía
  });
}, undefined, (error) => {
  console.error('Error al cargar el modelo:', error);
});

// Animación
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
