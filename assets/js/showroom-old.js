
import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

let camera, scene, renderer, controls, object, colors, parent, width, height;

// Color code

function randomColor() {
    colors = [0xffffff * Math.random(), 0xffffff * Math.random(),
        0xffffff * Math.random(), 0xffffff * Math.random(),];
    changeColor();
}

function changeColor() {
    // pillow, legs, undesignated, fabric color, 
    console.log('DingDong');

    object.traverse( ( child ) => {
        if ( child.isMesh ) {
            if (child.name.includes("Base")) {
                // child.material.color.set( colors[0] );
            }
            else {
                child.material.color.set( colors[3] );
            }
        }
    } );
}

// Room/Entity code

var room = '';
function loadShape(filename, path, onLoaded) {
    new GLTFLoader().setPath( path ).load( filename, function ( gltf ) {
        var foundMesh = gltf.scene;
  
        if(foundMesh) {
            onLoaded(foundMesh);
        }
    }
)};

// Interface

init();
animate();

function init() {
    renderer = new THREE.WebGLRenderer( { antialias: true } );

    parent = document.getElementById("display");
    width = parent.clientWidth;
    height = parent.clientHeight;

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( width, height );


    // display
    camera = new THREE.PerspectiveCamera( 45, width / height, 0.1, 20 );
    camera.position.set( 2.75, 1.0, -2.75 );

    scene = new THREE.Scene();

    // furniture model model
    colors = [ 0xdbbfa9, 0xdbbfa9, 0xdbbfa9, 0xdbbfa9,];
    loadShape('leather.glb', 'assets/models/couch/', function(nextObject) {
        // 25 Sit is default model
        scene.add(nextObject);
        object = nextObject;
        object.position.set(-0.25, 0, 0);

        changeColor();
        onWindowResize(); // fix for safari loading weird, reset view on first model load

        // Button
        // document.getElementById("version2").addEventListener("click", function() {
        //     if(object) {
        //         scene.remove(object);
        //     }
        //     scene.add(nextObject);  
        //     object = nextObject;
    
        //     changeColor();
        //     // Adjustments
        //     // object.scale.set(0.75, 0.75, 0.75);
        //     // object.position.set(-3.5, -0.35, 1.5);
        // });
    })
    // loadShape('1sit.glb', 'assets/models/zuiver/', function(nextObject) {
    //     // Button
    //     document.getElementById("version1").addEventListener("click", function() {
    //         if(object) {
    //             scene.remove(object);
    //         }
    //         scene.add(nextObject);  
    //         object = nextObject;
    
    //         changeColor();
    //         // Adjustments
    //         // object.scale.set(0.75, 0.75, 0.75);
    //         // object.position.set(-3.5, -0.35, 1.5);
    //     });
    // })

    // controls for colors
    document.getElementById("blue").addEventListener("click", function() { colors=[ 0xdbbfa9, 0xdbbfa9, 0xdbbfa9, 0xdbbfa9,]; changeColor() } );
    document.getElementById("gold").addEventListener("click", function() { colors=[ 0x9a463d, 0x9a463d, 0x9a463d, 0x9a463d, ]; changeColor() } );
    document.getElementById("purple").addEventListener("click", function() { colors=[ 0x666677, 0x666677, 0x666677, 0x666677,]; changeColor() } );
    // document.getElementById("random").addEventListener("click", randomColor);

    // rendering

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputEncoding = THREE.sRGBEncoding;
    parent.appendChild( renderer.domElement );

    const environment = new RoomEnvironment();
    const pmremGenerator = new THREE.PMREMGenerator( renderer );

    scene.background = new THREE.Color( 0xf2f2f2 );
    scene.environment = pmremGenerator.fromScene( environment ).texture;

    controls = new OrbitControls( camera, renderer.domElement );
    controls.onMouse
    controls.enableDamping = true;
    controls.minDistance = 1;
    controls.maxDistance = 10;
    controls.target.set( 0, 0.35, 0 );
    controls.autoRotate = false;
    // controls.noZoom = true;
    // controls.noPan = true;
    // // controls.maxDistance = controls.minDistance = yourfixeddistnace;  
    // controls.noKeys = true;
    // controls.noRotate = true;
    // controls.noZoom = true;
    controls.enableZoom = false;

    controls.update();

    window.addEventListener('resize', onWindowResize );
    window.addEventListener('mousedown', function() {controls.autoRotate = false;});

    document.addEventListener("keydown", onDocumentKeyDown, false);
}

// Secret movement controls

function onDocumentKeyDown(event) {
    var keyCode = event.which;
    if (keyCode == 68) {
        randomColor();
    }
    if (keyCode == 87) {
        moveUp();
    }
    else if (keyCode == 83) {
        moveDown();
    }
    console.log(keyCode);
}

function moveUp() {
    object.position.z = object.position.z + 0.1;
}
function moveDown() {
    object.position.z = object.position.z - 0.1;
}

// Window Resizing
function onWindowResize() {
    width = parent.clientWidth;
    height = parent.clientHeight;

    // console.log("on window resize:");
    // document.getElementById("width").innerHTML = width;
    // document.getElementById("height").innerHTML = height;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    console.log(width);
    console.log(height);
    renderer.setSize( width, height );
}

// Rendering

function animate() {
    requestAnimationFrame( animate );

    controls.update(); // required if damping enabled

    render();
}

function render() {
    renderer.render( scene, camera );
}