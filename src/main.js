import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

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
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Cargar fuente para el texto 3D
const fontLoader = new FontLoader();
let font = null;

// Nombre del hueso a resaltar con la flecha
const boneToHighlight = "mixamorigRightHandIndex1"; // Cambia esto según necesites

let arrowHelper = null; // Para almacenar la flecha

// Primero cargamos la fuente antes del modelo
fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (loadedFont) => {
    font = loadedFont;
    cargarModeloFBX();
});

fetch("coordenadas.json")
    .then(response => response.json())
    .then(data => {
        console.log("✅ Datos cargados:", data);
    })
    .catch(error => console.error("❌ Error cargando JSON:", error));


function cargarModeloFBX() {
  const loader = new FBXLoader();

  loader.load('/avatar.fbx', (model) => {
      model.scale.set(0.01, 0.01, 0.01);
      model.position.set(0, 0, 0);
      scene.add(model);

      
      // Mostrar la estructura esquelética
      const skeletonHelper = new THREE.SkeletonHelper(model);
      skeletonHelper.visible = true;
      scene.add(skeletonHelper);

      model.traverse(child => {
          // Verifica si el objeto es un hueso de brazo o mano
          if (child.isBone) {
              // Ajuste para la postura de reposo (brazos juntos y mano derecha sobre la izquierda)
              if (child.name === "mixamorigRightArm" || child.name === "mixamorigRightForeArm" || child.name === "mixamorigRightHand") {
                  // Ajustamos rotaciones para la mano derecha sobre la izquierda
                  if (child.name === "mixamorigRightArm") {
                      child.rotation.set(0, Math.PI / 4, 0); // Rotación para poner el brazo derecho ligeramente hacia adelante
                  }
                  if (child.name === "mixamorigRightForeArm") {
                      child.rotation.set(0, Math.PI / 4, 0); // Alineamos el antebrazo derecho
                  }
                  if (child.name === "mixamorigRightHand") {
                      child.rotation.set(0, Math.PI / 2, 0); // Pone la mano derecha sobre la mano izquierda
                  }
              }

              if (child.name === "mixamorigLeftArm" || child.name === "mixamorigLeftForeArm" || child.name === "mixamorigLeftHand") {
                  // Ajustamos rotaciones para el brazo izquierdo
                  if (child.name === "mixamorigLeftArm") {
                      child.rotation.set(0, -Math.PI / 4, 0); // Rotación para poner el brazo izquierdo hacia atrás
                  }
                  if (child.name === "mixamorigLeftForeArm") {
                      child.rotation.set(0, -Math.PI / 4, 0); // Alineamos el antebrazo izquierdo
                  }
                  if (child.name === "mixamorigLeftHand") {
                      child.rotation.set(0, -Math.PI / 2, 0); // Colocamos la muñeca izquierda
                  }
              }
          }

          // Si el hueso es el que queremos señalar, añadimos la flecha
          if (child.isBone && child.name === boneToHighlight) {
              console.log(`Hueso a señalar encontrado: ${child.name}`);

              const bonePosition = new THREE.Vector3();
              child.getWorldPosition(bonePosition);  // Obtiene la posición global del hueso

              const arrowDirection = new THREE.Vector3(1, 1, 0).normalize();  // Dirección de la flecha
              const arrowLength = 0.2;  // Longitud de la flecha
              const arrowColor = 0xffffff;  // Color de la flecha
              arrowHelper = new THREE.ArrowHelper(arrowDirection, bonePosition, arrowLength, arrowColor);  // Crea la flecha

              scene.add(arrowHelper);  // Agrega la flecha a la escena
          }
      });

      // Ajustar la postura de reposo
      setReposoPose(model);
  });
}

// Animación
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();
