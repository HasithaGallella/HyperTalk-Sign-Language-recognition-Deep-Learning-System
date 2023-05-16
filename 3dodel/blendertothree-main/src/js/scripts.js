import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';




const monkeyUrl = new URL('../assets/scene.glb', import.meta.url);
const renderer = new THREE.WebGLRenderer();

// renderer.setSize(600, 400);
let aspactRatio=600 / 400;



const container = document.getElementById('myDiv');
// container.appendChild(renderer.domElement);
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    15,
    aspactRatio,
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
// console.log(camera.position.x, camera.position.y, camera.position.z);
// console.log(camera.rotation.x, camera.rotation.y, camera.rotation.z);


orbit.update();

// const grid = new THREE.GridHelper(30, 30);
// scene.add(grid);
const assetLoader = new GLTFLoader();

let mixer;
let clips;
assetLoader.load(monkeyUrl.href, function (gltf) {
    const model = gltf.scene;
    model.position.set(0, -0.6, 0);
    scene.add(model);
    mixer = new THREE.AnimationMixer(model);
    clips = gltf.animations;

    sendAnimation('letterA');

}, undefined, function (error) {
    console.error(error);
});






const clock = new THREE.Clock();

let isDefaultAnimationPlaying = false;
let defaultAction;
let factor=2;


function sendAnimation(animationName, action = null, clip = null) {
    if (!mixer) return;
    //    console.log(mixer);
    if (animationName == 'letterA' && !isDefaultAnimationPlaying) {
        // console.log(mixer);
        mixer.stopAllAction();
        mixer._actions.forEach(action => mixer.uncacheAction(action));
        
        defaultAction = mixer.clipAction(THREE.AnimationClip.findByName(clips, 'letterA'));
        
        defaultAction.timeScale = factor; // Adjust the playback speed by setting the timeScale

        // If the animation is currently playing, update the timeScale immediately
        if (defaultAction.isRunning()) {
          const elapsedTime = mixer.time - defaultAction.time;
          defaultAction.time = mixer.time - elapsedTime / factor;
        }

        defaultAction.setLoop(THREE.LoopRepeat); // Set default animation to loop
        defaultAction.play();
        isDefaultAnimationPlaying = true;

    } else if (animationName != 'letterA') {

        if (clip) {

            action.setLoop(THREE.LoopOnce); // Play only once
            action.clampWhenFinished = true; // Stop at the last frame
            action.play();
            action.fadeOut(1.0); // Fade out the animation after completion
            action.reset(); // Reset the animation to the beginning
            action.play();
        }
        return
    }
}


function animate() {
    if (mixer) {
        mixer.update(clock.getDelta());
    }
    renderer.render(scene, camera);
    orbit.update();
}

renderer.setAnimationLoop(animate);

function handleWindowResize()  {
    camera.aspect =aspactRatio;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth,container.clientWidth/(aspactRatio));
}
// handleWindowResize();
// window.addEventListener('resize', handleWindowResize);



  
const resizeObserver = new ResizeObserver(handleWindowResize);
resizeObserver.observe(container);



// MAIN ANIMATION ARRAYS************************************************************************************************************
classes = ['how are', 'you', 'good', 'morning', 'a', 'b', 'c', ' '];
animationArray={'a':"letterA",'b':"letterB",'c':'letterC'};


function animationController(aniArray) {
    if (aniArray.length != 0) {

        const clip = THREE.AnimationClip.findByName(clips, aniArray[0]);
        if (isDefaultAnimationPlaying) {
            defaultAction.stop();
            isDefaultAnimationPlaying = false;
        }
        mixer.stopAllAction();
        mixer._actions.forEach(action => mixer.uncacheAction(action));
        action = mixer.clipAction(clip);

        action.timeScale = factor; // Adjust the playback speed by setting the timeScale

        // If the animation is currently playing, update the timeScale immediately
        if (action.isRunning()) {
          const elapsedTime = mixer.time - action.time;
          action.time = mixer.time - elapsedTime / factor;
        }

        sendAnimation(aniArray[0], action, clip = clip);
        aniArray.shift();
        // console.log(action.getClip().duration);
        setTimeout(() => animationController(aniArray), action.getClip().duration * 1000/factor);
    } else {
          sendAnimation('letterA');
    }
}




$(document).ready(function () {
    var text = "";
    
    $("#send").click(function (event) {
        aniArray = [];
        text = $('#result').val();
        let lowercaseStr = text.toLowerCase();
        let isFound = false;
        while (lowercaseStr != '') {
            isFound = false;
            classes.forEach(function (singleClass) {
                let index = lowercaseStr.indexOf(singleClass);
                if (index == 0) {

                    isFound = true;
                    lowercaseStr = lowercaseStr.replace(singleClass, "");
                    aniArray.push(animationArray[singleClass]);
                }
            });
            if (!isFound) {
                console.log("Char not Found: " + lowercaseStr[0]);
                lowercaseStr = lowercaseStr.slice(1);

            }

        }
      if(aniArray.length>0){
        setTimeout(() => animationController(aniArray), isDefaultAnimationPlaying ? (defaultAction.getClip().duration - defaultAction.time) * 1000/factor : 400);
      }
    });
});
