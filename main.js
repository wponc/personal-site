import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass';



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
// const gltfloader = new GLTFLoader(manager);
// const dloader = new DRACOLoader();
// dloader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.5/');
// dloader.setDecoderConfig({type: 'js'});
// gltfloader.setDRACOLoader(dloader);


// Matcap textures used on model, torus, ground plane
const gold = textureloader.load('assets/matcaps/gold.jpg');
const multi = textureloader.load('assets/matcaps/multi.jpg');
const silv = textureloader.load('assets/matcaps/silv.jpg');
const obsidian = textureloader.load('assets/matcaps/obsidian.jpg');


// Vertex shader uniforms
const uniforms = {
  u_time: {type: 'f', value: 0.0},
  time2: {type: 'f', value: 0.0}
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
const torusgeom = new THREE.TorusKnotGeometry(2,.1,300,20,4,9)
const torusmat = new THREE.MeshMatcapMaterial();
torusmat.matcap = obsidian;
const torusmesh = new THREE.Mesh(torusgeom, torusmat);
scene.add(torusmesh);
torusmesh.position.set(2,0,-1);
torusmesh.rotateY(300);
torusmesh.rotateX(37);

// Wireframe ground plane, vertices displaced by heightmap image
const groundGeo = new THREE.PlaneBufferGeometry(2,2,150,150);
const disp = textureloader.load('assets/heightmaps/heightmap.jpg');
const material = new THREE.MeshStandardMaterial({
  wireframe:true,
  displacementMap: disp
})
const groundMesh = new THREE.Mesh(groundGeo, material);
scene.add(groundMesh);
groundMesh.rotateX(36.75);
groundMesh.position.set(.8, -7.1, -1.35);

// Colorful ground plane to mimic flood basin
const colorgeo = new THREE.PlaneGeometry(1.5,1.5, 1, 1);
const colormaterial = new THREE.MeshMatcapMaterial({
});
colormaterial.matcap = multi;
const colormesh = new THREE.Mesh(colorgeo, colormaterial);
scene.add(colormesh);
colormesh.rotateX(36.75);
colormesh.position.set(.85, -7.2, -1.5);


// Man base mesh model, adding obsidian matcap cause it looks cool
// let model;
// const modelmaterial = new THREE.MeshMatcapMaterial();
// modelmaterial.matcap = gold;
// gltfloader.load('/assets/models/human.glb', function(gltf){
//   gltf.scene.scale.set(.3, .3, .3);
//   model = gltf.scene;
//   model.traverse((o) => {
//     if (o.isMesh) o.material = modelmaterial;
//   });
//   model.position.set(.15,-4.2,-.6);
//   scene.add(model);
// },
// function ( error ) {
//   console.log( 'An error happened' );
// })


// // Drone 3D model, adding gold matcap for the shine
// const dronematerial = new THREE.MeshMatcapMaterial();
// dronematerial.matcap = gold;
// let drone;
// gltfloader.load('assets/models/dji.glb', function(gltf){
//   gltf.scene.scale.set(.5,.5,.5);
//   drone = gltf.scene;
//   drone.position.set(.4,-4.05,-.65);
//   scene.add(drone);
//   drone.traverse((o) => {
//     if (o.isMesh) o.material = dronematerial;
//   });
// },
// function ( error ) {
//   console.log( 'An error happened' );
// })

// // Trees 3D model, adding silver matcap for the bone-like appearance
// const treematerial = new THREE.MeshMatcapMaterial();
// treematerial.matcap = obsidian;
// let tree;
// gltfloader.load('assets/models/tree.glb', function(gltf){
//   gltf.scene.scale.set(.20, .20, .20);
//   tree = gltf.scene;
//   tree.position.set(.75,-4.35,-.65);
//   scene.add(tree);
//   tree.rotateY(4);
//   tree.traverse((o) => {
//     if (o.isMesh) o.material = treematerial;
//   });
// },
// function ( error ) {
//   console.log( 'An error happened' );
// })

const grid = new THREE.Group();
let pos;
const cubesize = .25;
let x = 0;
const rows = 4;
const cols = 4;

const cubegeometry = new THREE.BoxBufferGeometry(cubesize, cubesize, cubesize);
const cubematerial = new THREE.MeshMatcapMaterial();
cubematerial.matcap = multi;

const cubemesh = new THREE.Mesh(cubegeometry, cubematerial);
scene.add(cubemesh);
cubemesh.position.set(1,-14,-2);

const cubemesh2 = new THREE.Mesh(cubegeometry, cubematerial);
scene.add(cubemesh2);
cubemesh2.position.set(1,-14,-3);

const cubemesh3 = new THREE.Mesh(cubegeometry, cubematerial);
scene.add(cubemesh3);
cubemesh3.position.set(1,-14,-4);

// class CustomSinCurve extends THREE.Curve {
// 	constructor( scale = 1 ) {
// 		super();
// 		this.scale = scale;
// 	}
// 	getPoint( t, optionalTarget = new THREE.Vector3() ) {
// 		const tx = t * 3;
// 		const ty = Math.sin( 2 * Math.PI * t );
// 		const tz = 0;
// 		return optionalTarget.set( tx, ty, tz ).multiplyScalar( this.scale );
// 	}
// }

// const path = new CustomSinCurve( .5 );
// const tubegeom = new THREE.TubeGeometry(path, 100, .025, 20, false );
// const tubemat = new THREE.MeshMatcapMaterial();
// tubemat.matcap = gold;
// const tubemesh = new THREE.Mesh(tubegeom,tubemat);
// scene.add(tubemesh);
// tubemesh.position.set(-4, -12.9, -1);
//tubemesh.rotateY(8);




const light = new THREE.AmbientLight( 0xffffff, 1, 100 );
light.position.set(1.5,-12,-.4);
//scene.add( light );


const finaltorus = new THREE.TorusKnotGeometry(.25,.015,74,20,20,5)
const finalmat = new THREE.MeshMatcapMaterial();
finalmat.matcap = gold;
const finalmesh = new THREE.Mesh(finaltorus, finalmat);
scene.add(finalmesh);
finalmesh.position.set(.35,-17,-.3);
//finalmesh.position.set(.35,-17,-1);
//finalmesh.rotateY(100);




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


let elapsed;
let dronespeed;

// Animation loop to rotate torus, displace ground mesh, rotate drone
function animate(){
  requestAnimationFrame(animate);
  
  elapsed = clock.getElapsedTime()*.35
  dronespeed = clock.getElapsedTime()*.35
  uniforms.u_time.value = clock.getElapsedTime();

  torusgeom.rotateZ(.00035);
  finalmesh.rotateX(-.00035);
  finalmesh.rotateZ(.00035);


  groundMesh.material.displacementScale = Math.sin(elapsed) * .45


  // Throwing an error yet still works? Fix this pal
  //drone.rotation.set(0,Math.sin(dronespeed),0)

  camera.position.y = - scrollY / sizes.height * 3
  controls.update();
  camera.lookAt(0.0,camera.position.y - 1, camera.position.z - 4)

  renderer.render(scene, camera);
}

animate();
