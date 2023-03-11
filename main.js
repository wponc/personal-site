import './style.css'
import * as THREE from 'three';



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


const textureloader = new THREE.TextureLoader(manager);


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
//scene.background = new THREE.Color(0x3b4744)



// Rotating torus knot visible on page load
const torusgeom = new THREE.TorusKnotGeometry(2,.1,300,20,4,9)
const torusmat = new THREE.MeshMatcapMaterial();
torusmat.matcap = obsidian;
const torusmesh = new THREE.Mesh(torusgeom, torusmat);
scene.add(torusmesh);
torusmesh.position.set(2.5,0,-1);
torusmesh.rotateY(300);
torusmesh.rotateX(37);

// Grid & axes helpers in case we need them
const axeshelper = new THREE.AxesHelper();
const gridhelper = new THREE.GridHelper()
//scene.add(axeshelper,gridhelper);


// Event listener for window resize
window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize(){
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

document.addEventListener("DOMContentLoaded", function(event) { 
  var scrollpos = localStorage.getItem('scrollpos');
  if (scrollpos) window.scrollTo(0, scrollpos);
});
window.onbeforeunload = function(e) {
  localStorage.setItem('scrollpos', window.scrollY);
};



// Animation loop to rotate torus, displace ground mesh, rotate drone
function animate(){
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  elapsed = clock.getElapsedTime()*.35
  dronespeed = clock.getElapsedTime()*.35
  uniforms.u_time.value = clock.getElapsedTime();
  torusgeom.rotateZ(.00035);
}

animate();
