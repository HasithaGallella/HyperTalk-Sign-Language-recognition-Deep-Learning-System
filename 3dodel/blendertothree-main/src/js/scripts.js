import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

const monkeyUrl = new URL('../assets/scene.glb', import.meta.url);

const renderer = new THREE.WebGLRenderer();

// renderer.setSize(600, 400);

const container = document.createElement('div');
container.appendChild(renderer.domElement);
document.getElementById('myDiv').appendChild(container);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    15,
   600 / 400,
    0.1,
    1000
);
renderer.setClearColor("#e7f6fe");
const orbit = new OrbitControls(camera, renderer.domElement);





camera.position.set(2.5, 1, 0);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
directionalLight.position.set(0, 1, 0);
scene.add(directionalLight);





renderer.render(scene, camera);
console.log(camera.position.x, camera.position.y, camera.position.z);
console.log(camera.rotation.x, camera.rotation.y, camera.rotation.z);


orbit.update();

// const grid = new THREE.GridHelper(30, 30);
// scene.add(grid);

const assetLoader = new GLTFLoader();

let mixer;
assetLoader.load(monkeyUrl.href, function(gltf) {
    const model = gltf.scene;
    model.position.set(0, -0.6, 0);
    scene.add(model);

    
    mixer = new THREE.AnimationMixer(model);
    const clips = gltf.animations;

    // Play a certain animation
    const clip = THREE.AnimationClip.findByName(clips, 'letterA');
    const action = mixer.clipAction(clip);
    action.play();
    const bone = gltf.scene.getObjectByName("mixamorigLeftHand");
    

    // Play all animations at the same time
    // clips.forEach(function(clip) {
    //     const action = mixer.clipAction(clip);
    //     action.play();
    // });

}, undefined, function(error) {
    console.error(error);
});




const clock = new THREE.Clock();


function animate() {
    if(mixer)
        mixer.update(clock.getDelta());
      
    renderer.render(scene, camera);
}



renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});