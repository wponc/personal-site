import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass';
import { TextureLoader } from 'three';
import * as dat from 'dat.gui'

// Dat.GUI import. Seems like I gotta do this every time. Really annoying.
//npm install dat.gui --save-dev
//npm install @types/dat.gui --save-dev

const white = new THREE.Color();

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

// Manager for loading animation
const manager = new THREE.LoadingManager();
// const progressbar = document.getElementById('progress-bar')
// const progressbarcontainer = document.querySelector('.progress-bar-container');
// manager.onProgress = function(url, item, total) {
//   progressbar.value = (item / total) * 100;
// }
// manager.onLoad = function(url, item, total) {
//   progressbarcontainer.style.display = 'none'
// }


const textureloader = new THREE.TextureLoader(manager);
const gltfloader = new GLTFLoader(manager);
const dloader = new DRACOLoader();
dloader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.5/');
dloader.setDecoderConfig({type: 'js'});
gltfloader.setDRACOLoader(dloader);


// Matcap textures used on model, torus, ground plane
const gold = textureloader.load('assets/matcaps/gold.jpg');
const gold2 = textureloader.load('assets/matcaps/gold2.jpg');
const gold3 = textureloader.load('assets/matcaps/gold3.jpg');
const silv = textureloader.load('assets/matcaps/silv.jpg');
const obsidian = textureloader.load('assets/matcaps/obsidian.jpg');


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
camera.position.set(0,0,0);
const renderScene = new RenderPass(scene, camera);


// Orbit controls for pan, zoom
const controls = new OrbitControls(camera, renderer.domElement);

// Rotating torus knot visible on page load
const torusgeom = new THREE.TorusKnotGeometry(2,.1,300,50,4,9)
const torusmat = new THREE.MeshMatcapMaterial();
torusmat.matcap = obsidian;
const torusmesh = new THREE.Mesh(torusgeom, torusmat);
scene.add(torusmesh);
torusmesh.position.set(2.5,0,-1);
torusmesh.rotateY(300);
torusmesh.rotateX(37);

// Wireframe ground plane, vertices displaced by heightmap image
const groundGeo = new THREE.PlaneBufferGeometry(2,2,150,150);
const disp = textureloader.load('assets/heightmaps/heightmap.jpg');
const material = new THREE.MeshStandardMaterial({
  vertexShader: document.getElementById('vertexShader').textContent,
  wireframe:true,
  displacementMap: disp
})
const groundMesh = new THREE.Mesh(groundGeo, material);
scene.add(groundMesh);
groundMesh.rotateX(36.75);
groundMesh.position.set(.8, -7.3, -1.35);

// Colorful ground plane to mimic flood basin
const colorgeo = new THREE.PlaneGeometry(1.5,1.5, 1, 1);
const colormaterial = new THREE.MeshMatcapMaterial({
});
colormaterial.matcap = gold;
const colormesh = new THREE.Mesh(colorgeo, colormaterial);
scene.add(colormesh);
colormesh.rotateX(36.75);
colormesh.position.set(.85, -7.4, -1.5);


// Man base mesh model, adding obsidian matcap cause it looks cool
let model;
const modelmaterial = new THREE.MeshMatcapMaterial();
modelmaterial.matcap = obsidian;
gltfloader.load('/assets/models/human.glb', function(gltf){
  gltf.scene.scale.set(.25, .25, .25);
  model = gltf.scene;
  model.traverse((o) => {
    if (o.isMesh) o.material = modelmaterial;
  });
  model.position.set(.15,-4.2,-.55);
  scene.add(model);
},
function ( error ) {
  console.log( 'An error happened' );
})


// Drone 3D model, adding gold matcap for the shine
const dronematerial = new THREE.MeshMatcapMaterial();
dronematerial.matcap = gold;
let drone;
gltfloader.load('assets/models/dji.glb', function(gltf){
  gltf.scene.scale.set(.5,.5,.5);
  drone = gltf.scene;
  drone.position.set(.45,-4.05,-.85);
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
treematerial.matcap = obsidian;
let tree;
gltfloader.load('assets/models/tree.glb', function(gltf){
  gltf.scene.scale.set(.20, .20, .20);
  tree = gltf.scene;
  tree.position.set(.75,-4.25,-.65);
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
//scene.add(axeshelper,gridhelper);



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
// const gui = new dat.GUI();
// const meshfolder = gui.addFolder('colormesh');
// meshfolder.add(colormesh.rotation, 'x', -100, 100, 1).name("X Rotation");
// meshfolder.add(colormesh.position, 'x', -10, 10, .01).name("X position")
// meshfolder.add(colormesh.position, 'y', -10, 10, .01).name("y position")
// meshfolder.add(colormesh.position, 'z', -10, 10, .01).name("z position")
// meshfolder.open()
// Constants for animation loop
let elapsed;
let dronespeed;

// Animation loop to rotate torus, displace ground mesh, rotate drone
function animate(){
  requestAnimationFrame(animate);
  
  elapsed = clock.getElapsedTime()*.25
  dronespeed = clock.getElapsedTime()*.25
  uniforms.u_time.value = clock.getElapsedTime();
 
  torusgeom.rotateZ(.00035);
  // colormesh.rotateZ(.001);
  // groundMesh.rotateZ(.001);

  groundMesh.material.displacementScale = Math.sin(elapsed) * .45

  // Throwing an error yet still works? Fix this pal
  drone.rotation.set(0,Math.sin(dronespeed),0)

  camera.position.y = - scrollY / sizes.height * 3
  controls.update();
  camera.lookAt(0.0,camera.position.y - 1, camera.position.z - 4)
  console.log(camera.position.y)
  renderer.render(scene, camera);
}

animate();
