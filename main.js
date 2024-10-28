import * as THREE from 'three'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from 'three/examples/jsm/Addons.js';

const renderer = new THREE.WebGLRenderer()

const width = window.innerWidth;
const height = window.innerHeight;

renderer.setSize(width, height)
renderer.shadowMap.enabled = true

document.querySelector('body').appendChild(renderer.domElement)

const textureLoader = new THREE.TextureLoader();
const modelLoader = new GLTFLoader();
const backgroundLoader = new RGBELoader();

const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
const scene = new THREE.Scene();
const controls = new OrbitControls(camera, renderer.domElement)

camera.position.z = 5

//background
backgroundLoader.load("hdri/billiard_hall_4k.hdr",
  (hdr) => {
    hdr.mapping = THREE.EquirectangularReflectionMapping;

    scene.background = hdr;
    scene.environment = hdr;
  }
)

//texture
const base = "textures/tronc/tronc_diff.jpg"
const normal = "textures/tronc/tronc_nor.jpg"

const baseTexture = textureLoader.load(base);
const normalTexture = textureLoader.load(normal);

//cube
const cubeGeo = new THREE.BoxGeometry();
const cubeMaterial = new THREE.MeshStandardMaterial({
  map: baseTexture,
  normalMap: normalTexture
});
const cube = new THREE.Mesh(cubeGeo, cubeMaterial);
cube.castShadow = true
//scene.add(cube);

//quack
let spray = null
modelLoader.load("models/quack/rubber_duck_toy.gltf",
  (gltf) => {
    const model = gltf.scene
    spray = model
    spray.position.set(0, 0, 0)
    scene.add(spray)
    camera.lookAt(model.position)
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded")
  },
  (error) => {

  });


//plane
const planeGeo = new THREE.PlaneGeometry(4, 4);
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff
})
const plane = new THREE.Mesh(planeGeo, planeMaterial);
plane.position.z = 0
plane.position.y = -1.25
plane.rotateX(- Math.PI / 2)
plane.receiveShadow = true
scene.add(plane);

//ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

//directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.castShadow = true
directionalLight.position.set = camera.position
directionalLight.lookAt(cube.position)
scene.add(directionalLight)

renderer.setAnimationLoop(animate);


let time = Date.now();
function animate() {
  const currentTime = Date.now();
  const deltaTime = currentTime - time;
  time = currentTime;

  cube.rotateX(0.0001 * deltaTime)
  cube.rotateY(0.0001 * deltaTime)
  cube.rotateZ(0.0001 * deltaTime)

  if (spray != null) {
    spray.rotateY(0.001 * deltaTime)
  }

  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}
)