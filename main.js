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
const cameraGroup = new THREE.Group()
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75, 
  window.innerWidth / window.innerHeight, 
  .1, 
  1000
);
scene.add(cameraGroup)
// Rendering
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(0,0,0);
cameraGroup.add(camera)
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



const cursor = {}
cursor.x = 0
cursor.y = 0
window.addEventListener('mousemove', (event) =>
{
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = event.clientY / sizes.height - 0.5

    console.log(cursor)
})

// Animation loop to rotate torus
let previousTime = 0
function animate(){
  requestAnimationFrame(animate);
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - previousTime
  previousTime = elapsedTime
  torusgeom.rotateZ(.0005);
  renderer.render(scene, camera);
  const parallaxX = cursor.x * .1;
  const parallaxY = -cursor.y * .1;

  cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 * deltaTime
  cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime
}

animate();
