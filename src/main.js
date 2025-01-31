import * as THREE from 'three'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

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

// Raycaster para detectar el mouse
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let intersectedObject = null;

// Cargar fuente para el texto 3D
const fontLoader = new FontLoader();
let font = null;

// Primero cargamos la fuente antes del modelo
fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (loadedFont) => {
    font = loadedFont;

    // Una vez cargada la fuente, cargamos el modelo FBX
    cargarModeloFBX();
});

function cargarModeloFBX() {
    const loader = new FBXLoader();

    loader.load('/avatar.fbx', (model) => {
        model.scale.set(0.01, 0.01, 0.01);
        model.position.set(0, 0, 0);
        scene.add(model);

        console.log('Jerarquía del modelo:', model);

        // Mostrar la estructura esquelética
        const skeletonHelper = new THREE.SkeletonHelper(model);
        skeletonHelper.visible = true;
        scene.add(skeletonHelper);

        // Recorrer los objetos del modelo y buscar huesos
        model.traverse(child => {
            if (child.isBone) {
                // Crear una esfera pequeña para cada hueso
                const boneSphere = new THREE.SphereGeometry(0.03, 8, 8);
                const boneMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                const boneMesh = new THREE.Mesh(boneSphere, boneMaterial);

                // Obtener la posición global del hueso
                const bonePosition = new THREE.Vector3();
                child.getWorldPosition(bonePosition);

                // Actualizar la posición de la esfera
                boneMesh.position.copy(bonePosition);
                scene.add(boneMesh);

                // Crear texto 3D solo si la fuente ya está cargada
                if (font) {
                    const textGeometry = new TextGeometry(child.name, {
                        font: font,
                        size: 0.005,
                        height: 0.01,
                    });

                    const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
                    const textMesh = new THREE.Mesh(textGeometry, textMaterial);

                    // Mover el texto ligeramente para evitar sobreposición
                    textMesh.position.set(bonePosition.x + 0.1, bonePosition.y + 0.05, bonePosition.z);
                    textMesh.rotation.y = Math.PI / 4;

                    scene.add(textMesh);

                    // Crear una línea desde el texto hasta el hueso
                    const points = [bonePosition, textMesh.position];
                    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
                    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
                    const line = new THREE.Line(lineGeometry, lineMaterial);

                    scene.add(line);
                }
            }
        });
    });
}

// Función para actualizar la posición del mouse
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// Función para hacer raycasting
function updateRaycaster() {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const object = intersects[0].object;

        if (object.name !== intersectedObject) {
            intersectedObject = object.name;
            console.log(`Hueso seleccionado: ${intersectedObject}`);
        }
    }
}

// Agregar eventos de mouse
window.addEventListener('mousemove', onMouseMove, false);

// Animación
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    updateRaycaster();
    renderer.render(scene, camera);
}

animate();
