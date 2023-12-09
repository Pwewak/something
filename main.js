import * as x from 'https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js';
import * as phy from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/+esm';
// import CannonDebugger from 'cannon-es-debugger';
import Stats from 'https://unpkg.com/three@0.122.0/examples/jsm/libs/stats.module.js';
import { PointerLockControls } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/PointerLockControls.js";
const scene = new x.Scene();
const camera = new x.PerspectiveCamera(75, window.innerWidth/ window.innerHeight, 0.1,1000)

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let cameraMoveSpeed = 0.1;
const objects = [];

const renderer = new x.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
window.addEventListener("resize", onWindowResize);
const controls = new PointerLockControls(camera, document.body);
// Stats.js
const stats = new Stats()
document.body.appendChild(stats.dom)

//menu
const blocker = document.getElementById("blocker");
const instructions = document.getElementById("instructions");
instructions.addEventListener("click", function () {
  controls.lock();
});
controls.addEventListener("lock", function () {
  instructions.style.display = "none";
  blocker.style.display = "none";
});

controls.addEventListener("unlock", function () {
  blocker.style.display = "block";
  instructions.style.display = "";
});

const onKeyDown = function (e){
  switch(e.code){
    case 'KeyW':
    moveForward = true;
    break;
    case 'KeyS':
    moveBackward = true;
    break;
    case 'KeyD':
    moveLeft = true;
    break;
    case 'KeyA':
    moveRight = true;
    break;
  }
};
const onKeyUp = function (e){
  switch(e.code){
    case 'KeyW':
    moveForward = false;
    break;
    case 'KeyS':
    moveBackward = false;
    break;
    case 'KeyD':
    moveLeft = false;
    break;
    case 'KeyA':
    moveRight = false;
    break;
  }
};
document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);
const raycaster = new x.Raycaster(
  new x.Vector3(),
  new x.Vector3(0, -1, 0),
  0,
  10
);
// physics stuff goes here
const wrld = new phy.World({
  gravity: new phy.Vec3(0,-9.82,0),
});

const groundBody = new phy.Body({
  type: phy.Body.STATIC,
  shape: new phy.Plane(),
});
groundBody.quaternion.setFromEuler(-Math.PI/2,0,0);
wrld.addBody(groundBody);

const boxBody = new phy.Body({
  mass:1,
  shape: new phy.Box(new phy.Vec3(1,1,1))
});
boxBody.position.set(0,4,0);
wrld.addBody(boxBody);

const sphereBody = new phy.Body({
  mass:1,
  shape: new phy.Sphere(),
  radius:1
});
sphereBody.position.set(1,6,0);
wrld.addBody(sphereBody);

const playerBody = new phy.Body({
  mass:1,
  shape: new phy.Cylinder(0.5,0.5,2,64),
  angularFactor: new phy.Vec3(0,1,0)
});
playerBody.position.set(0,2,0);
wrld.addBody(playerBody);

// x stuff goes here
const floor = new x.Mesh(new x.PlaneGeometry(10,10), new x.MeshBasicMaterial({color:'#FF0000'}));
floor.rotation.x = -Math.PI/2;
scene.add(floor);

const cube = new x.Mesh( new x.BoxGeometry(2,2,2), new x.MeshBasicMaterial({ color:'#00FF00',wireframe:false}));
scene.add(cube);

const sphere = new x.Mesh(new x.SphereGeometry(),new x.MeshBasicMaterial({color:'#0000FF',wireframe:false}));
scene.add(sphere);

const player = new x.Mesh(new x.CapsuleGeometry(0.5,1,24,64), new x.MeshBasicMaterial({color:'white'}));
scene.add(player);

camera.position.set(0,1,5);

//
// const cannonDebugger = new CannonDebugger(scene,wrld,{
  // color:'#OOOOFF'
// });

//window resize
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}
let prevTime = performance.now();
// main game loop
function animate() {
  requestAnimationFrame( animate );

  // cannonDebugger.update();
  
  const time = performance.now();


  if(controls.isLocked===true){
    wrld.fixedStep();
    cube.position.copy(boxBody.position);
    cube.quaternion.copy(boxBody.quaternion);
    sphere.position.copy(sphereBody.position);
    sphere.quaternion.copy(sphereBody.quaternion);

    camera.position.copy(playerBody.position);
    const cameraDirection = new x.Vector3(0, 0, -1);
    cameraDirection.applyQuaternion(camera.quaternion);
    const cameraRotation = new x.Euler(0, 0, 0, "YXZ");
    cameraRotation.setFromQuaternion(camera.quaternion);

    const moveDirection = new x.Vector3();
    if (moveForward) {
      moveDirection.add(cameraDirection);
    }
    if (moveBackward) {
      moveDirection.sub(cameraDirection);
    }
    if (moveLeft) {
      const cameraRotation = cameraDirection
        .clone()
        .applyAxisAngle(new x.Vector3(0, 1, 0), -Math.PI / 2);
      moveDirection.add(cameraRotation);
    }
    if (moveRight) {
      const cameraRotation = cameraDirection
        .clone()
        .applyAxisAngle(new x.Vector3(0, 1, 0), Math.PI / 2);
      moveDirection.add(cameraRotation);
    }
    moveDirection.normalize();
    moveDirection.multiplyScalar(cameraMoveSpeed);

    playerBody.position.x += moveDirection.x;
    playerBody.position.z += moveDirection.z;
    player.position.copy(playerBody.position);
    player.quaternion.copy(playerBody.quaternion);
    raycaster.ray.origin.copy(controls.getObject().position);
    raycaster.ray.origin.y -= 10;


    prevTime = time;

    camera.position.lerp(playerBody.position, cameraMoveSpeed);
    raycaster.ray.origin.copy(controls.getObject().position);
    raycaster.ray.origin.y -= 10;


  }
  


  onWindowResize();
  stats.update();
  renderer.render( scene, camera );
}

animate();
