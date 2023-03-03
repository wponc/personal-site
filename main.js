import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';
import { TextureLoader } from 'three';
import { GUI } from 'dat.gui'

// Dat.GUI import. Seems like I gotta do this every time. Really annoying.
//npm install dat.gui --save-dev
//npm install @types/dat.gui --save-dev

// Clock for stepping through animation loop 
const clock = new THREE.Clock();

// Antialiasing to make site more performant
let pixelRatio = window.devicePixelRatio
let AA = true
if (pixelRatio > 1) {
  AA = false
}

// Renderer instance, color management to polish matcaps
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
  antialias: AA,
  powerPreference: "high-performance"
})
THREE.ColorManagement.enabled = true;
THREE.ColorManagement.legacyMode = false;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

// Loader for heightmap displacement texture
const manager = new THREE.LoadingManager();
const textureloader = new THREE.TextureLoader(manager);
const gltfloader = new GLTFLoader();
const disp = textureloader.load('/heightmaps/heightmap.jpg');

// Matcap textures used on model, torus, ground plane
const gold = textureloader.load('/matcaps/gold.jpg');
const silv = textureloader.load('/matcaps/silv.jpg');
const rainbow = textureloader.load('/matcaps/rainbow.jpg');
const silvgreen = textureloader.load('/matcaps/silvgreen.jpg');
const obsidian = textureloader.load('/matcaps/obsidian.jpg');
const blue = textureloader.load('/matcaps/blue.jpg');

// Vertex shader uniforms
const uniforms = {
  u_time: {type: 'f', value: 0.0}
}

// Size constants
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

// Scene & camera creation
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75, 
  window.innerWidth / window.innerHeight, 
  .1, 
  1000
);

// Rendering
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(-5,2,2);
const renderScene = new RenderPass(scene, camera);


// Orbit controls for pan, zoom
const controls = new OrbitControls(camera, renderer.domElement);


// Distance constant between objects along Y-axis 
const distance = -5;

// Rotating torus knot visible on page load
const torusgeom = new THREE.TorusKnotGeometry(3,.1,300,50,4,9)
const torusmat = new THREE.MeshMatcapMaterial();
torusmat.matcap = obsidian;
const torusmesh = new THREE.Mesh(torusgeom, torusmat);
scene.add(torusmesh);
torusmesh.position.set(3,0,3);
torusmesh.rotateY(300);
torusmesh.rotateX(37);

// Wireframe ground plane, vertices displaced by heightmap image
const groundGeo = new THREE.PlaneBufferGeometry(2.1, 2.1,100,100);
const material = new THREE.MeshStandardMaterial({
  vertexShader: document.getElementById('vertexShader').textContent,
  wireframe:true,
  displacementMap: disp 
})
const groundMesh = new THREE.Mesh(groundGeo, material);
scene.add(groundMesh);
groundMesh.rotateX(300);
groundMesh.position.set(-3, 0,0)


// Colorful ground plane to mimic flood basin
const colorgeo = new THREE.PlaneGeometry(2,2, 5, 5);
const colormaterial = new THREE.MeshMatcapMaterial();
colormaterial.matcap = gold;
const colormesh = new THREE.Mesh(colorgeo, colormaterial);
scene.add(colormesh);
colormesh.rotateX(300);

colormesh.position.set(-3, -.2, 0);


// Man base mesh model, adding obsidian matcap cause it looks cool
let model;
const modelmaterial = new THREE.MeshMatcapMaterial();
modelmaterial.matcap = obsidian;
gltfloader.load('/assets/wave4.glb', function(gltf){
  gltf.scene.scale.set(1, 1, 1);
  model = gltf.scene;
  model.traverse((o) => {
    if (o.isMesh) o.material = modelmaterial;
  });
  model.position.set(-.5,0,0);
  scene.add(model);
},
function ( error ) {
  console.log( 'An error happened' );
})


// Drone 3D model, adding gold matcap for the shine
const dronematerial = new THREE.MeshMatcapMaterial();
dronematerial.matcap = gold;
let drone;
gltfloader.load('/assets/drone.glb', function(gltf){
  gltf.scene.scale.set(.3, .3, .3);
  drone = gltf.scene;
  drone.position.set(-.25,.55,0);
  scene.add(drone);
  drone.traverse((o) => {
    if (o.isMesh) o.material = dronematerial;
  });
},
function ( error ) {
  console.log( 'An error happened' );
})

// Trees 3D model, adding silver matcap for the bone-like appearance
const treematerial = new THREE.MeshMatcapMaterial();
treematerial.matcap = silv;
let tree;
gltfloader.load('/assets/trees.glb', function(gltf){
  gltf.scene.scale.set(.20, .20, .20);
  tree = gltf.scene;
  tree.position.set(0,0,0);
  scene.add(tree);
  tree.rotateY(4);
  tree.traverse((o) => {
    if (o.isMesh) o.material = treematerial;
  });
},
function ( error ) {
  console.log( 'An error happened' );
})


// Grid & axes helpers in case we need them
const axeshelper = new THREE.AxesHelper();
const gridhelper = new THREE.GridHelper()
scene.add(axeshelper,gridhelper);


// Event listener to move camera up/down scene based on page progress
let scrollY = window.scrollY
window.addEventListener('scroll', () =>
{
  scrollY = window.scrollY
})

// Event listener for window resize
window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


// GUI folder
const gui = new GUI()
const colorfolder = gui.addFolder('color plane')
colorfolder.add(colormesh.rotation, 'x', 0, 10)
colorfolder.open()
const groundfolder = gui.addFolder('ground plane')
groundfolder.add(groundMesh.rotation, 'x', 0,10)
groundfolder.open()
const cameraFolder = gui.addFolder('Camera')
cameraFolder.add(camera.position, 'z', 0, 10)
cameraFolder.open()

// Constants for animation loop
let elapsed;
let dronespeed;

// Animation loop to rotate torus, displace ground mesh, rotate drone
function animate(){
  requestAnimationFrame(animate);
  
  elapsed = clock.getElapsedTime()*.45
  dronespeed = clock.getElapsedTime()*.25
  uniforms.u_time.value = clock.getElapsedTime();
 
  torusgeom.rotateZ(.00035);
  // colormesh.rotateZ(.001);
  // groundMesh.rotateZ(.001);

  groundMesh.material.displacementScale = Math.sin(elapsed) * .5

  // Throwing an error yet still works? Fix this pal
  drone.rotation.set(0,Math.sin(dronespeed),0)

  //camera.position.y = - scrollY / sizes.height * distance
  controls.update();
  renderer.render(scene, camera);
}

animate();
